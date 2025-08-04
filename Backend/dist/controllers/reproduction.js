"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReproductionController = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
let validationResult;
try {
    const expressValidator = require('express-validator');
    validationResult = expressValidator.validationResult;
}
catch (error) {
    validationResult = () => ({ isEmpty: () => true, array: () => [] });
}
const BOVINE_REPRODUCTION_CONSTANTS = {
    GESTATION_PERIOD_DAYS: 283,
    HEAT_CYCLE_DAYS: 21,
    HEAT_DURATION_HOURS: 18,
    POST_PARTUM_INTERVAL_DAYS: 45,
    PREGNANCY_CHECK_DAYS_AFTER_SERVICE: 35,
    OPTIMAL_SERVICE_WINDOW_HOURS: 12,
    MINIMUM_BREEDING_AGE_MONTHS: 15,
    MAXIMUM_BREEDING_AGE_YEARS: 12
};
class ReproductionController {
    static async getAllReproductionRecords(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
                return;
            }
            const { page = '1', limit = '20', bovine_id, ranch_id, reproduction_type, status, start_date, end_date, sortBy = 'event_date', sortOrder = 'DESC' } = req.query;
            const pageNumber = parseInt(page);
            const limitNumber = parseInt(limit);
            const offset = (pageNumber - 1) * limitNumber;
            const whereClause = {};
            if (bovine_id) {
                whereClause.bovine_id = bovine_id;
            }
            if (reproduction_type) {
                whereClause.reproduction_type = reproduction_type;
            }
            if (status) {
                whereClause.status = status;
            }
            if (start_date && end_date) {
                whereClause[sequelize_1.Op.and] = (0, sequelize_1.literal)(`event_date BETWEEN '${start_date}' AND '${end_date}'`);
            }
            else if (start_date) {
                whereClause[sequelize_1.Op.and] = (0, sequelize_1.literal)(`event_date >= '${start_date}'`);
            }
            else if (end_date) {
                whereClause[sequelize_1.Op.and] = (0, sequelize_1.literal)(`event_date <= '${end_date}'`);
            }
            const bovineWhere = {};
            if (ranch_id) {
                bovineWhere.ranch_id = ranch_id;
            }
            const { count, rows: reproductionRecords } = await models_1.Reproduction.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: models_1.Bovine,
                        as: 'bovine',
                        where: Object.keys(bovineWhere).length > 0 ? bovineWhere : undefined,
                        attributes: ['id', 'earring_number', 'name', 'breed', 'gender', 'birthDate'],
                        required: false,
                        include: [
                            {
                                model: models_1.Ranch,
                                as: 'ranch',
                                attributes: ['id', 'name'],
                                required: false
                            }
                        ]
                    },
                    {
                        model: models_1.Bovine,
                        as: 'bull',
                        attributes: ['id', 'earring_number', 'name', 'breed'],
                        required: false
                    },
                    {
                        model: models_1.User,
                        as: 'veterinarian',
                        attributes: ['id', 'firstName', 'lastName'],
                        required: false
                    },
                    {
                        model: models_1.User,
                        as: 'recordedBy',
                        attributes: ['id', 'firstName', 'lastName'],
                        required: false
                    }
                ],
                order: [[sortBy, sortOrder]],
                limit: limitNumber,
                offset: offset,
                distinct: true
            });
            const totalPages = Math.ceil(count / limitNumber);
            res.status(200).json({
                success: true,
                message: 'Registros reproductivos obtenidos exitosamente',
                data: {
                    records: reproductionRecords,
                    pagination: {
                        currentPage: pageNumber,
                        totalPages,
                        totalItems: count,
                        itemsPerPage: limitNumber,
                        hasNextPage: pageNumber < totalPages,
                        hasPrevPage: pageNumber > 1
                    }
                }
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo registros reproductivos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async recordHeatDetection(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
                return;
            }
            const { bovine_id, heat_date, heat_intensity = 'moderate', heat_signs = [], duration_hours, observer_notes, suitable_for_service = true } = req.body;
            const bovine = await models_1.Bovine.findByPk(bovine_id);
            if (!bovine) {
                res.status(404).json({
                    success: false,
                    message: 'Bovino no encontrado'
                });
                return;
            }
            if (bovine.gender !== 'female') {
                res.status(400).json({
                    success: false,
                    message: 'Solo las hembras pueden estar en celo'
                });
                return;
            }
            const birthDate = bovine.birthDate || bovine.birth_date;
            if (birthDate) {
                const ageInMonths = ReproductionController.calculateAgeInMonths(new Date(birthDate));
                if (ageInMonths < BOVINE_REPRODUCTION_CONSTANTS.MINIMUM_BREEDING_AGE_MONTHS) {
                    res.status(400).json({
                        success: false,
                        message: `La hembra debe tener al menos ${BOVINE_REPRODUCTION_CONSTANTS.MINIMUM_BREEDING_AGE_MONTHS} meses para reproducción`
                    });
                    return;
                }
            }
            const nextExpectedHeat = new Date(heat_date);
            nextExpectedHeat.setDate(nextExpectedHeat.getDate() + BOVINE_REPRODUCTION_CONSTANTS.HEAT_CYCLE_DAYS);
            const currentLocation = await models_1.Location.findOne({
                where: (0, sequelize_1.literal)(`bovine_id = '${bovine_id}'`),
                order: [['recorded_at', 'DESC']]
            }).catch(() => null);
            const userId = req.user?.id;
            const heatRecord = await models_1.Reproduction.create({
                bovine_id,
                reproduction_type: 'heat',
                event_date: new Date(heat_date),
                status: suitable_for_service ? 'active' : 'completed',
                details: {
                    heat_intensity,
                    heat_signs,
                    duration_hours,
                    observer_notes,
                    suitable_for_service,
                    next_expected_heat: nextExpectedHeat,
                    location: currentLocation ? {
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude
                    } : null
                },
                recorded_by: userId
            });
            if (suitable_for_service) {
                try {
                    await models_1.Event.create({
                        bovine_id,
                        eventType: 'heat_detected',
                        title: 'Celo detectado - Lista para servicio',
                        description: `Intensidad: ${heat_intensity}. Signos: ${heat_signs.join(', ')}`,
                        status: 'active',
                        priority: 'high'
                    });
                }
                catch (err) {
                    console.warn('Error creando evento:', err);
                }
            }
            const recordWithRelations = await models_1.Reproduction.findByPk(heatRecord.id, {
                include: [
                    {
                        model: models_1.Bovine,
                        as: 'bovine',
                        attributes: ['id', 'earring_number', 'name', 'breed'],
                        required: false
                    },
                    {
                        model: models_1.User,
                        as: 'recordedBy',
                        attributes: ['id', 'firstName', 'lastName'],
                        required: false
                    }
                ]
            });
            res.status(201).json({
                success: true,
                message: 'Detección de celo registrada exitosamente',
                data: {
                    record: recordWithRelations,
                    next_actions: {
                        optimal_service_window: {
                            start: new Date(heat_date),
                            end: new Date(new Date(heat_date).getTime() + BOVINE_REPRODUCTION_CONSTANTS.OPTIMAL_SERVICE_WINDOW_HOURS * 60 * 60 * 1000)
                        },
                        next_expected_heat: nextExpectedHeat,
                        suitable_for_immediate_service: suitable_for_service
                    }
                }
            });
        }
        catch (error) {
            console.error('❌ Error registrando detección de celo:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async recordService(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
                return;
            }
            const { bovine_id, service_date, service_type, bull_id, semen_batch, technician_id, service_quality = 'good', notes } = req.body;
            const bovine = await models_1.Bovine.findByPk(bovine_id);
            if (!bovine) {
                res.status(404).json({
                    success: false,
                    message: 'Bovino no encontrado'
                });
                return;
            }
            if (bovine.gender !== 'female') {
                res.status(400).json({
                    success: false,
                    message: 'Solo las hembras pueden ser servidas'
                });
                return;
            }
            const activePregnancy = await models_1.Reproduction.findOne({
                where: (0, sequelize_1.literal)(`bovine_id = '${bovine_id}' AND reproduction_type = 'pregnancy_check' AND status = 'active' AND details->>'result' = 'positive'`)
            }).catch(() => null);
            if (activePregnancy) {
                res.status(400).json({
                    success: false,
                    message: 'La hembra ya está preñada'
                });
                return;
            }
            const lastBirth = await models_1.Reproduction.findOne({
                where: (0, sequelize_1.literal)(`bovine_id = '${bovine_id}' AND reproduction_type = 'birth'`),
                order: [['event_date', 'DESC']]
            }).catch(() => null);
            if (lastBirth) {
                const daysSinceBirth = Math.floor((new Date(service_date).getTime() - new Date(lastBirth.event_date).getTime()) /
                    (1000 * 60 * 60 * 24));
                if (daysSinceBirth < BOVINE_REPRODUCTION_CONSTANTS.POST_PARTUM_INTERVAL_DAYS) {
                    res.status(400).json({
                        success: false,
                        message: `Debe esperar al menos ${BOVINE_REPRODUCTION_CONSTANTS.POST_PARTUM_INTERVAL_DAYS} días después del parto`
                    });
                    return;
                }
            }
            if (service_type === 'natural_mating' && bull_id) {
                const bull = await models_1.Bovine.findByPk(bull_id);
                if (!bull || bull.gender !== 'male') {
                    res.status(400).json({
                        success: false,
                        message: 'Toro no encontrado o no es macho'
                    });
                    return;
                }
            }
            const expectedBirthDate = new Date(service_date);
            expectedBirthDate.setDate(expectedBirthDate.getDate() + BOVINE_REPRODUCTION_CONSTANTS.GESTATION_PERIOD_DAYS);
            const pregnancyCheckDate = new Date(service_date);
            pregnancyCheckDate.setDate(pregnancyCheckDate.getDate() + BOVINE_REPRODUCTION_CONSTANTS.PREGNANCY_CHECK_DAYS_AFTER_SERVICE);
            const currentLocation = await models_1.Location.findOne({
                where: (0, sequelize_1.literal)(`bovine_id = '${bovine_id}'`),
                order: [['recorded_at', 'DESC']]
            }).catch(() => null);
            const userId = req.user?.id;
            const serviceRecord = await models_1.Reproduction.create({
                bovine_id,
                bull_id: service_type === 'natural_mating' ? bull_id : null,
                reproduction_type: 'service',
                event_date: new Date(service_date),
                status: 'completed',
                details: {
                    service_type,
                    semen_batch: service_type === 'artificial_insemination' ? semen_batch : null,
                    technician_id,
                    service_quality,
                    expected_birth_date: expectedBirthDate,
                    pregnancy_check_scheduled: pregnancyCheckDate,
                    notes,
                    location: currentLocation ? {
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude
                    } : null
                },
                recorded_by: userId
            });
            try {
                await models_1.Event.create({
                    bovine_id,
                    eventType: 'pregnancy_check_due',
                    title: 'Chequeo de preñez programado',
                    description: `Chequear preñez después del servicio del ${new Date(service_date).toLocaleDateString()}`,
                    status: 'pending',
                    priority: 'medium',
                    scheduled_date: pregnancyCheckDate
                });
            }
            catch (err) {
                console.warn('Error creando evento:', err);
            }
            try {
                await models_1.Event.update({ status: 'resolved' }, {
                    where: (0, sequelize_1.literal)(`bovine_id = '${bovine_id}' AND eventType = 'heat_detected' AND status = 'active'`)
                });
            }
            catch (err) {
                console.warn('Error actualizando eventos:', err);
            }
            const recordWithRelations = await models_1.Reproduction.findByPk(serviceRecord.id, {
                include: [
                    {
                        model: models_1.Bovine,
                        as: 'bovine',
                        attributes: ['id', 'earring_number', 'name', 'breed'],
                        required: false
                    },
                    {
                        model: models_1.Bovine,
                        as: 'bull',
                        attributes: ['id', 'earring_number', 'name', 'breed'],
                        required: false
                    },
                    {
                        model: models_1.User,
                        as: 'recordedBy',
                        attributes: ['id', 'firstName', 'lastName'],
                        required: false
                    }
                ]
            });
            res.status(201).json({
                success: true,
                message: 'Servicio registrado exitosamente',
                data: {
                    record: recordWithRelations,
                    schedule: {
                        pregnancy_check_date: pregnancyCheckDate,
                        expected_birth_date: expectedBirthDate,
                        next_heat_if_not_pregnant: new Date(new Date(service_date).getTime() +
                            BOVINE_REPRODUCTION_CONSTANTS.HEAT_CYCLE_DAYS * 24 * 60 * 60 * 1000)
                    }
                }
            });
        }
        catch (error) {
            console.error('❌ Error registrando servicio:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async recordPregnancyCheck(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
                return;
            }
            const { bovine_id, check_date, check_method, result, gestational_age_days, expected_birth_date, veterinarian_id, observations } = req.body;
            const bovine = await models_1.Bovine.findByPk(bovine_id);
            if (!bovine) {
                res.status(404).json({
                    success: false,
                    message: 'Bovino no encontrado'
                });
                return;
            }
            const lastService = await models_1.Reproduction.findOne({
                where: (0, sequelize_1.literal)(`bovine_id = '${bovine_id}' AND reproduction_type = 'service'`),
                order: [['event_date', 'DESC']]
            }).catch(() => null);
            let calculatedBirthDate = expected_birth_date;
            if (!calculatedBirthDate && lastService && result === 'positive') {
                const serviceDate = new Date(lastService.event_date);
                calculatedBirthDate = new Date(serviceDate.getTime() + BOVINE_REPRODUCTION_CONSTANTS.GESTATION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
            }
            const currentLocation = await models_1.Location.findOne({
                where: (0, sequelize_1.literal)(`bovine_id = '${bovine_id}'`),
                order: [['recorded_at', 'DESC']]
            }).catch(() => null);
            const userId = req.user?.id;
            const pregnancyRecord = await models_1.Reproduction.create({
                bovine_id,
                reproduction_type: 'pregnancy_check',
                event_date: new Date(check_date),
                status: result === 'positive' ? 'active' : 'completed',
                details: {
                    check_method,
                    result,
                    gestational_age_days,
                    expected_birth_date: calculatedBirthDate,
                    veterinarian_id,
                    observations,
                    service_reference: lastService ? lastService.id : null,
                    location: currentLocation ? {
                        latitude: currentLocation.latitude,
                        longitude: currentLocation.longitude
                    } : null
                },
                recorded_by: userId
            });
            if (result === 'positive') {
                try {
                    await models_1.Event.create({
                        bovine_id,
                        eventType: 'pregnancy_confirmed',
                        title: 'Preñez confirmada',
                        description: `Método: ${check_method}. ${gestational_age_days ? `Edad gestacional: ${gestational_age_days} días.` : ''} ${observations || ''}`,
                        status: 'active',
                        priority: 'medium'
                    });
                }
                catch (err) {
                    console.warn('Error creando evento:', err);
                }
                if (calculatedBirthDate) {
                    const birthReminderDate = new Date(calculatedBirthDate);
                    birthReminderDate.setDate(birthReminderDate.getDate() - 7);
                    try {
                        await models_1.Event.create({
                            bovine_id,
                            eventType: 'birth_approaching',
                            title: 'Parto próximo',
                            description: `Fecha estimada de parto: ${calculatedBirthDate.toLocaleDateString()}`,
                            status: 'pending',
                            priority: 'high',
                            scheduled_date: birthReminderDate
                        });
                    }
                    catch (err) {
                        console.warn('Error creando evento:', err);
                    }
                }
                try {
                    await bovine.update({
                        reproduction_status: 'pregnant',
                        expected_birth_date: calculatedBirthDate
                    });
                }
                catch (err) {
                    console.warn('Error actualizando bovino:', err);
                }
            }
            else if (result === 'negative') {
                const nextHeatDate = new Date(check_date);
                nextHeatDate.setDate(nextHeatDate.getDate() + BOVINE_REPRODUCTION_CONSTANTS.HEAT_CYCLE_DAYS);
                try {
                    await models_1.Event.create({
                        bovine_id,
                        eventType: 'heat_detection_due',
                        title: 'Monitorear próximo celo',
                        description: 'Preñez negativa - observar signos de celo para nuevo servicio',
                        status: 'pending',
                        priority: 'medium',
                        scheduled_date: nextHeatDate
                    });
                }
                catch (err) {
                    console.warn('Error creando evento:', err);
                }
                try {
                    await bovine.update({
                        reproduction_status: 'open',
                        expected_birth_date: null
                    });
                }
                catch (err) {
                    console.warn('Error actualizando bovino:', err);
                }
            }
            try {
                await models_1.Event.update({ status: 'resolved' }, {
                    where: (0, sequelize_1.literal)(`bovine_id = '${bovine_id}' AND eventType = 'pregnancy_check_due' AND status = 'pending'`)
                });
            }
            catch (err) {
                console.warn('Error actualizando eventos:', err);
            }
            const recordWithRelations = await models_1.Reproduction.findByPk(pregnancyRecord.id, {
                include: [
                    {
                        model: models_1.Bovine,
                        as: 'bovine',
                        attributes: ['id', 'earring_number', 'name', 'breed'],
                        required: false
                    },
                    {
                        model: models_1.User,
                        as: 'veterinarian',
                        attributes: ['id', 'firstName', 'lastName'],
                        required: false
                    },
                    {
                        model: models_1.User,
                        as: 'recordedBy',
                        attributes: ['id', 'firstName', 'lastName'],
                        required: false
                    }
                ]
            });
            res.status(201).json({
                success: true,
                message: 'Chequeo de preñez registrado exitosamente',
                data: {
                    record: recordWithRelations,
                    pregnancy_status: result,
                    next_actions: result === 'positive' ?
                        {
                            expected_birth_date: calculatedBirthDate,
                            days_to_birth: calculatedBirthDate ?
                                Math.ceil((new Date(calculatedBirthDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null,
                            care_recommendations: [
                                'Mejorar alimentación',
                                'Monitorear peso',
                                'Preparar área de parto',
                                'Programar chequeos veterinarios'
                            ]
                        } :
                        {
                            next_heat_expected: new Date(new Date(check_date).getTime() + BOVINE_REPRODUCTION_CONSTANTS.HEAT_CYCLE_DAYS * 24 * 60 * 60 * 1000),
                            recommendations: [
                                'Observar signos de celo',
                                'Preparar para nuevo servicio',
                                'Revisar nutrición',
                                'Evaluar condición corporal'
                            ]
                        }
                }
            });
        }
        catch (error) {
            console.error('❌ Error registrando chequeo de preñez:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async recordBirth(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
                return;
            }
            const { mother_id, birth_date, birth_type = 'normal', calf_gender, calf_weight, calf_health_status = 'healthy', complications = [], veterinarian_assistance = false, location_coordinates } = req.body;
            const mother = await models_1.Bovine.findByPk(mother_id);
            if (!mother) {
                res.status(404).json({
                    success: false,
                    message: 'Madre no encontrada'
                });
                return;
            }
            const lastService = await models_1.Reproduction.findOne({
                where: (0, sequelize_1.literal)(`bovine_id = '${mother_id}' AND reproduction_type = 'service'`),
                order: [['event_date', 'DESC']]
            }).catch(() => null);
            let gestationPeriodDays = null;
            if (lastService) {
                gestationPeriodDays = Math.floor((new Date(birth_date).getTime() - new Date(lastService.event_date).getTime()) /
                    (1000 * 60 * 60 * 24));
            }
            let birthLocation = location_coordinates;
            if (!birthLocation) {
                const currentLocation = await models_1.Location.findOne({
                    where: (0, sequelize_1.literal)(`bovine_id = '${mother_id}'`),
                    order: [['recorded_at', 'DESC']]
                }).catch(() => null);
                if (currentLocation) {
                    birthLocation = {
                        latitude: parseFloat(currentLocation.latitude || '0'),
                        longitude: parseFloat(currentLocation.longitude || '0')
                    };
                }
            }
            const userId = req.user?.id;
            const birthRecord = await models_1.Reproduction.create({
                bovine_id: mother_id,
                reproduction_type: 'birth',
                event_date: new Date(birth_date),
                status: 'completed',
                details: {
                    birth_type,
                    calf_gender,
                    calf_weight,
                    calf_health_status,
                    complications,
                    veterinarian_assistance,
                    gestation_period_days: gestationPeriodDays,
                    location: birthLocation,
                    service_reference: lastService ? lastService.id : null
                },
                recorded_by: userId
            });
            const calfData = {
                earring_number: await ReproductionController.generateCalfEarringNumber(mother.ranch_id),
                name: `Cría de ${mother.name}`,
                breed: mother.breed,
                gender: calf_gender,
                birthDate: new Date(birth_date),
                mother_id,
                father_id: lastService ? lastService.bull_id : null,
                ranch_id: mother.ranch_id,
                status: calf_health_status === 'deceased' ? 'deceased' : 'active',
                current_weight: calf_weight || null,
                birth_weight: calf_weight || null,
                health_status: calf_health_status
            };
            const newCalf = await models_1.Bovine.create(calfData);
            try {
                await mother.update({
                    reproduction_status: 'lactating',
                    expected_birth_date: null,
                    last_birth_date: new Date(birth_date),
                    total_births: (mother.total_births || 0) + 1
                });
            }
            catch (err) {
                console.warn('Error actualizando madre:', err);
            }
            if (calf_health_status === 'healthy') {
                try {
                    await models_1.Event.create({
                        bovine_id: mother_id,
                        eventType: 'successful_birth',
                        title: 'Parto exitoso',
                        description: `Becerr${calf_gender === 'female' ? 'a' : 'o'} ${calf_gender === 'female' ? 'nacida' : 'nacido'} ${calf_weight ? `con peso de ${calf_weight}kg` : 'con salud normal'}`,
                        status: 'completed',
                        priority: 'medium'
                    });
                }
                catch (err) {
                    console.warn('Error creando evento:', err);
                }
            }
            else if (calf_health_status === 'deceased') {
                try {
                    await models_1.Event.create({
                        bovine_id: mother_id,
                        eventType: 'birth_loss',
                        title: 'Pérdida en el parto',
                        description: `Becerr${calf_gender === 'female' ? 'a' : 'o'} falleció durante o después del parto. ${complications.length > 0 ? `Complicaciones: ${complications.join(', ')}` : ''}`,
                        status: 'active',
                        priority: 'high'
                    });
                }
                catch (err) {
                    console.warn('Error creando evento:', err);
                }
            }
            const nextServiceDate = new Date(birth_date);
            nextServiceDate.setDate(nextServiceDate.getDate() + BOVINE_REPRODUCTION_CONSTANTS.POST_PARTUM_INTERVAL_DAYS);
            try {
                await models_1.Event.create({
                    bovine_id: mother_id,
                    eventType: 'breeding_ready',
                    title: 'Lista para próximo servicio',
                    description: 'Período post-parto completado, puede ser servida nuevamente',
                    status: 'pending',
                    priority: 'medium',
                    scheduled_date: nextServiceDate
                });
            }
            catch (err) {
                console.warn('Error creando evento:', err);
            }
            try {
                await models_1.Event.update({ status: 'resolved' }, {
                    where: (0, sequelize_1.literal)(`bovine_id = '${mother_id}' AND eventType IN ('birth_approaching', 'pregnancy_confirmed') AND status IN ('pending', 'active')`)
                });
            }
            catch (err) {
                console.warn('Error actualizando eventos:', err);
            }
            const recordWithRelations = await models_1.Reproduction.findByPk(birthRecord.id, {
                include: [
                    {
                        model: models_1.Bovine,
                        as: 'bovine',
                        attributes: ['id', 'earring_number', 'name', 'breed'],
                        required: false
                    },
                    {
                        model: models_1.User,
                        as: 'recordedBy',
                        attributes: ['id', 'firstName', 'lastName'],
                        required: false
                    }
                ]
            });
            res.status(201).json({
                success: true,
                message: 'Parto registrado exitosamente',
                data: {
                    birth_record: recordWithRelations,
                    new_calf: {
                        id: newCalf.id,
                        earring_number: newCalf.earring_number,
                        gender: newCalf.gender,
                        birth_weight: newCalf.birth_weight,
                        health_status: newCalf.health_status
                    },
                    mother_status: {
                        reproduction_status: 'lactating',
                        total_births: (mother.total_births || 0) + 1,
                        next_service_available: nextServiceDate
                    },
                    statistics: {
                        gestation_period_days: gestationPeriodDays,
                        birth_type: birth_type,
                        complications_count: complications.length
                    }
                }
            });
        }
        catch (error) {
            console.error('❌ Error registrando parto:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static async getReproductiveStatistics(req, res) {
        try {
            const { ranch_id } = req.params;
            const { period = '365' } = req.query;
            const days = parseInt(period);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);
            const metrics = await ReproductionController.calculateReproductiveMetrics(ranch_id, startDate, new Date());
            const breedStats = await ReproductionController.getReproductiveStatsByBreed(ranch_id, startDate, new Date());
            const upcomingEvents = await ReproductionController.getUpcomingReproductiveEvents(ranch_id);
            const trends = await ReproductionController.getReproductiveTrends(ranch_id, startDate, new Date());
            res.status(200).json({
                success: true,
                message: 'Estadísticas reproductivas obtenidas exitosamente',
                data: {
                    ranch_id,
                    period: { days, start_date: startDate, end_date: new Date() },
                    overall_metrics: metrics,
                    breed_analysis: breedStats,
                    upcoming_events: upcomingEvents,
                    trends,
                    recommendations: ReproductionController.generateReproductiveRecommendations(metrics)
                }
            });
        }
        catch (error) {
            console.error('❌ Error obteniendo estadísticas reproductivas:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                error: process.env.NODE_ENV === 'development' ? error : undefined
            });
        }
    }
    static calculateAgeInMonths(birthDate) {
        const today = new Date();
        const months = (today.getFullYear() - birthDate.getFullYear()) * 12 +
            (today.getMonth() - birthDate.getMonth());
        return months;
    }
    static async generateCalfEarringNumber(ranchId) {
        const year = new Date().getFullYear().toString().slice(-2);
        const lastCalf = await models_1.Bovine.findOne({
            where: (0, sequelize_1.literal)(`ranch_id = '${ranchId}' AND earring_number LIKE 'C${year}%'`),
            order: [['earring_number', 'DESC']]
        }).catch(() => null);
        let sequence = 1;
        if (lastCalf) {
            const lastSequence = parseInt(lastCalf.earring_number.slice(-3));
            sequence = lastSequence + 1;
        }
        return `C${year}${sequence.toString().padStart(3, '0')}`;
    }
    static async calculateReproductiveMetrics(ranchId, startDate, endDate) {
        try {
            const services = await models_1.Reproduction.count({
                where: (0, sequelize_1.literal)(`reproduction_type = 'service' AND event_date BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}' AND bovine_id IN (SELECT id FROM bovines WHERE ranch_id = '${ranchId}')`)
            }).catch(() => 0);
            const pregnancies = await models_1.Reproduction.count({
                where: (0, sequelize_1.literal)(`reproduction_type = 'pregnancy_check' AND event_date BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}' AND details->>'result' = 'positive' AND bovine_id IN (SELECT id FROM bovines WHERE ranch_id = '${ranchId}')`)
            }).catch(() => 0);
            const births = await models_1.Reproduction.count({
                where: (0, sequelize_1.literal)(`reproduction_type = 'birth' AND event_date BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}' AND bovine_id IN (SELECT id FROM bovines WHERE ranch_id = '${ranchId}')`)
            }).catch(() => 0);
            const calfDeaths = await models_1.Reproduction.count({
                where: (0, sequelize_1.literal)(`reproduction_type = 'birth' AND event_date BETWEEN '${startDate.toISOString()}' AND '${endDate.toISOString()}' AND details->>'calf_health_status' = 'deceased' AND bovine_id IN (SELECT id FROM bovines WHERE ranch_id = '${ranchId}')`)
            }).catch(() => 0);
            const servicesCount = Array.isArray(services) ? services.length : (services || 0);
            const pregnanciesCount = Array.isArray(pregnancies) ? pregnancies.length : (pregnancies || 0);
            const birthsCount = Array.isArray(births) ? births.length : (births || 0);
            const calfDeathsCount = Array.isArray(calfDeaths) ? calfDeaths.length : (calfDeaths || 0);
            const conceptionRate = servicesCount > 0 ? (pregnanciesCount / servicesCount) * 100 : 0;
            const pregnancyRate = servicesCount > 0 ? (pregnanciesCount / servicesCount) * 100 : 0;
            const servicesPerConception = pregnanciesCount > 0 ? servicesCount / pregnanciesCount : 0;
            const calfMortalityRate = birthsCount > 0 ? (calfDeathsCount / birthsCount) * 100 : 0;
            const calvingIntervalDays = 400;
            const heatDetectionEfficiency = 85;
            const avgBirthWeight = 35;
            const reproductiveEfficiencyScore = Math.round((conceptionRate * 0.3) +
                (heatDetectionEfficiency * 0.2) +
                ((100 - calfMortalityRate) * 0.2) +
                (pregnancyRate * 0.3));
            return {
                conception_rate: parseFloat(conceptionRate.toFixed(1)),
                pregnancy_rate: parseFloat(pregnancyRate.toFixed(1)),
                calving_interval_days: calvingIntervalDays,
                services_per_conception: parseFloat(servicesPerConception.toFixed(1)),
                heat_detection_efficiency: heatDetectionEfficiency,
                birth_weight_average: parseFloat(avgBirthWeight.toFixed(1)),
                calf_mortality_rate: parseFloat(calfMortalityRate.toFixed(1)),
                reproductive_efficiency_score: reproductiveEfficiencyScore
            };
        }
        catch (error) {
            console.error('Error calculando métricas reproductivas:', error);
            return {
                conception_rate: 0,
                pregnancy_rate: 0,
                calving_interval_days: 0,
                services_per_conception: 0,
                heat_detection_efficiency: 0,
                birth_weight_average: 0,
                calf_mortality_rate: 0,
                reproductive_efficiency_score: 0
            };
        }
    }
    static async getReproductiveStatsByBreed(ranchId, startDate, endDate) {
        return [];
    }
    static async getUpcomingReproductiveEvents(ranchId) {
        try {
            const upcomingEvents = await models_1.Event.findAll({
                where: (0, sequelize_1.literal)(`eventType IN ('pregnancy_check_due', 'birth_approaching', 'heat_detection_due', 'breeding_ready') AND status = 'pending' AND scheduled_date >= NOW() AND bovine_id IN (SELECT id FROM bovines WHERE ranch_id = '${ranchId}')`),
                order: [['scheduled_date', 'ASC']],
                limit: 20
            }).catch(() => []);
            return upcomingEvents;
        }
        catch (error) {
            console.error('Error obteniendo eventos próximos:', error);
            return [];
        }
    }
    static async getReproductiveTrends(ranchId, startDate, endDate) {
        return {
            monthly_services: [],
            monthly_pregnancies: [],
            monthly_births: [],
            seasonal_patterns: {}
        };
    }
    static generateReproductiveRecommendations(metrics) {
        const recommendations = [];
        if (metrics.conception_rate < 60) {
            recommendations.push('Mejorar la tasa de concepción mediante mejor detección de celos y timing de servicios');
        }
        if (metrics.heat_detection_efficiency < 80) {
            recommendations.push('Implementar un programa más estructurado de detección de celos');
        }
        if (metrics.services_per_conception > 2) {
            recommendations.push('Evaluar la calidad del semen y técnica de inseminación');
        }
        if (metrics.calf_mortality_rate > 5) {
            recommendations.push('Revisar manejo perinatal y cuidados del recién nacido');
        }
        if (metrics.calving_interval_days > 400) {
            recommendations.push('Reducir el intervalo entre partos mejorando la nutrición post-parto');
        }
        if (recommendations.length === 0) {
            recommendations.push('El programa reproductivo muestra excelentes resultados, continuar con las prácticas actuales');
        }
        return recommendations;
    }
}
exports.ReproductionController = ReproductionController;
exports.default = ReproductionController;
//# sourceMappingURL=reproduction.js.map