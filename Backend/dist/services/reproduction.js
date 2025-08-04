"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reproductionService = exports.ReproductionService = exports.ValidationError = exports.ApiError = void 0;
const sequelize_1 = require("sequelize");
const logger_1 = require("../utils/logger");
const logger = {
    info: (message, metadata) => logger_1.logger.info(message, metadata, 'ReproductionService'),
    error: (message, error) => logger_1.logger.error(message, { error }, error, 'ReproductionService'),
    warn: (message, metadata) => logger_1.logger.warn(message, metadata, 'ReproductionService')
};
class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
    }
}
exports.ApiError = ApiError;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
const Reproduction = {
    create: async (data, options) => ({
        ...data,
        id: `repro_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
    }),
    findByPk: async (id, options) => ({
        id,
        bovineId: 'bovine_123',
        type: 'HEAT_DETECTION',
        eventDate: new Date(),
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: function () { return this; }
    }),
    findAll: async (options) => [],
    findAndCountAll: async (options) => ({
        rows: [],
        count: 0
    }),
    findOne: async (options) => null,
    update: async (data, options) => [1]
};
const Bovine = {
    findByPk: async (id, options) => ({
        id,
        earTag: `COW${id.padStart(3, '0')}`,
        name: `Bovine_${id}`,
        breed: 'Holstein',
        birthDate: new Date(Date.now() - 3 * 365 * 24 * 60 * 60 * 1000),
        reproductiveStatus: 'OPEN',
        lastCalvingDate: null,
        totalCalves: 0,
        daysPostPartum: 0
    }),
    update: async (data, options) => [1],
    count: async (options) => 150,
    create: async (data, options) => ({
        ...data,
        id: `bovine_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date()
    })
};
const Location = {
    findAll: async (options) => []
};
const Event = {
    create: async (data, options) => ({
        ...data,
        id: `event_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
    })
};
const Finance = {
    create: async (data, options) => ({
        ...data,
        id: `finance_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
    })
};
const sequelize = {
    transaction: async () => ({
        commit: async () => { },
        rollback: async () => { }
    }),
    literal: (value) => ({ literal: value })
};
class LocationService {
    async getCurrentLocation() {
        return {
            latitude: 19.4326,
            longitude: -99.1332,
            accuracy: 10
        };
    }
}
class NotificationService {
    async createNotification(notification) {
        console.log(`📢 Notificación: ${notification.title}`);
    }
    async scheduleNotification(notification, scheduledDate) {
        console.log(`⏰ Notificación programada para: ${scheduledDate.toISOString()}`);
    }
}
class EventService {
    async createEvent(eventData) {
        console.log(`📝 Evento creado: ${eventData.type}`);
    }
}
class ReproductionService {
    constructor() {
        this.GESTATION_PERIOD_DAYS = 283;
        this.ESTRUS_CYCLE_DAYS = 21;
        this.POST_PARTUM_INTERVAL = 60;
        this.PREGNANCY_CHECK_DAYS = [30, 60, 120, 180, 240];
        this.locationService = new LocationService();
        this.notificationService = new NotificationService();
        this.eventService = new EventService();
    }
    async createReproductionRecord(reproductionData, userId) {
        const transaction = await sequelize.transaction();
        try {
            await this.validateReproductionData(reproductionData, transaction);
            const bovine = await Bovine.findByPk(reproductionData.bovineId, { transaction });
            if (!bovine) {
                throw new ValidationError('El bovino especificado no existe');
            }
            await this.validateBovineReproductiveStatus(bovine, reproductionData.type);
            let location = reproductionData.location;
            if (!location?.latitude || !location?.longitude) {
                location = await this.locationService.getCurrentLocation();
            }
            const calculatedDates = await this.calculateReproductiveDates(reproductionData.type, reproductionData.eventDate, bovine);
            const reproductionRecord = await Reproduction.create({
                ...reproductionData,
                location,
                calculatedDates,
                recordedBy: userId,
                createdAt: new Date(),
                updatedAt: new Date()
            }, { transaction });
            await this.createReproductiveEvent(reproductionRecord, transaction);
            await this.updateBovineReproductiveStatus(reproductionData.bovineId, reproductionData.type, reproductionRecord.id, transaction);
            await this.scheduleReproductiveAlerts(reproductionRecord, transaction);
            await this.createFinancialRecords(reproductionRecord, transaction);
            await transaction.commit();
            logger.info('✅ Registro reproductivo creado exitosamente', {
                reproductionId: reproductionRecord.id,
                bovineId: reproductionData.bovineId,
                type: reproductionData.type,
                userId
            });
            return this.formatReproductionRecord(reproductionRecord);
        }
        catch (error) {
            await transaction.rollback();
            logger.error('❌ Error creando registro reproductivo', { error, reproductionData });
            throw error;
        }
    }
    async getReproductionByBovine(bovineId, options = {}) {
        try {
            const whereClause = { bovineId };
            if (options.type) {
                whereClause.type = options.type;
            }
            if (options.startDate || options.endDate) {
                whereClause.eventDate = {};
                if (options.startDate) {
                    whereClause.eventDate[sequelize_1.Op.gte] = options.startDate;
                }
                if (options.endDate) {
                    whereClause.eventDate[sequelize_1.Op.lte] = options.endDate;
                }
            }
            const { rows: reproductions, count: total } = await Reproduction.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Bovine,
                        attributes: ['id', 'earTag', 'name', 'breed', 'birthDate']
                    }
                ],
                order: [['eventDate', 'DESC']],
                limit: options.limit || 50,
                offset: options.offset || 0
            });
            const records = reproductions.map(repro => this.formatReproductionRecord(repro));
            let metrics;
            if (options.includeMetrics && records.length > 0) {
                metrics = await this.calculateReproductionMetrics(bovineId, options);
            }
            return { records, total, metrics };
        }
        catch (error) {
            logger.error('❌ Error obteniendo registros reproductivos', { error, bovineId });
            throw new ApiError('Error obteniendo registros reproductivos', 500);
        }
    }
    async recordHeat(heatData, userId) {
        try {
            await this.validateHeatRecord(heatData);
            const nextHeatDate = this.calculateNextHeatDate(heatData.detectedDate);
            const reproductionData = {
                bovineId: heatData.bovineId,
                type: 'HEAT_DETECTION',
                eventDate: heatData.detectedDate,
                location: heatData.location,
                notes: heatData.notes,
                metadata: {
                    intensity: heatData.intensity,
                    duration: heatData.duration,
                    symptoms: heatData.symptoms,
                    detectionMethod: heatData.detectionMethod,
                    nextPredictedHeat: nextHeatDate,
                    optimal_breeding_window: {
                        start: new Date(heatData.detectedDate.getTime() + 12 * 60 * 60 * 1000),
                        end: new Date(heatData.detectedDate.getTime() + 18 * 60 * 60 * 1000)
                    }
                }
            };
            const record = await this.createReproductionRecord(reproductionData, userId);
            await this.scheduleBreedingWindowAlert(record);
            return {
                id: record.id,
                bovineId: record.bovineId,
                detectedDate: record.eventDate,
                intensity: record.metadata?.intensity || 'MEDIUM',
                duration: record.metadata?.duration,
                symptoms: record.metadata?.symptoms || [],
                detectionMethod: record.metadata?.detectionMethod || 'VISUAL',
                nextPredictedHeat: record.metadata?.nextPredictedHeat,
                optimalBreedingWindow: record.metadata?.optimal_breeding_window,
                location: record.location,
                notes: record.notes,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
        }
        catch (error) {
            logger.error('❌ Error registrando celo', { error, heatData });
            throw error;
        }
    }
    async recordInsemination(inseminationData, userId) {
        try {
            await this.validateInseminationRecord(inseminationData);
            const pregnancyCheckDate = new Date(inseminationData.serviceDate);
            pregnancyCheckDate.setDate(pregnancyCheckDate.getDate() + 30);
            const expectedCalvingDate = new Date(inseminationData.serviceDate);
            expectedCalvingDate.setDate(expectedCalvingDate.getDate() + this.GESTATION_PERIOD_DAYS);
            const reproductionData = {
                bovineId: inseminationData.bovineId,
                type: 'ARTIFICIAL_INSEMINATION',
                eventDate: inseminationData.serviceDate,
                location: inseminationData.location,
                notes: inseminationData.notes,
                metadata: {
                    bullId: inseminationData.bullId,
                    bullName: inseminationData.bullName,
                    semenBatch: inseminationData.semenBatch,
                    semenQuality: inseminationData.semenQuality,
                    technicianId: inseminationData.technicianId,
                    technicianName: inseminationData.technicianName,
                    method: inseminationData.method,
                    cervixQuality: inseminationData.cervixQuality,
                    timeFromHeat: inseminationData.timeFromHeat,
                    expectedPregnancyCheck: pregnancyCheckDate,
                    expectedCalvingDate: expectedCalvingDate,
                    cost: inseminationData.cost
                }
            };
            const record = await this.createReproductionRecord(reproductionData, userId);
            await this.schedulePregnancyCheckReminder(record, pregnancyCheckDate);
            return {
                id: record.id,
                bovineId: record.bovineId,
                serviceDate: record.eventDate,
                bullId: record.metadata?.bullId,
                bullName: record.metadata?.bullName,
                semenBatch: record.metadata?.semenBatch,
                semenQuality: record.metadata?.semenQuality,
                technicianId: record.metadata?.technicianId,
                technicianName: record.metadata?.technicianName,
                method: record.metadata?.method || 'ARTIFICIAL',
                cervixQuality: record.metadata?.cervixQuality,
                timeFromHeat: record.metadata?.timeFromHeat,
                expectedPregnancyCheck: record.metadata?.expectedPregnancyCheck,
                expectedCalvingDate: record.metadata?.expectedCalvingDate,
                cost: record.metadata?.cost,
                location: record.location,
                notes: record.notes,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
        }
        catch (error) {
            logger.error('❌ Error registrando inseminación', { error, inseminationData });
            throw error;
        }
    }
    async confirmPregnancy(pregnancyData, userId) {
        const transaction = await sequelize.transaction();
        try {
            await this.validatePregnancyRecord(pregnancyData);
            const relatedInsemination = await this.findRelatedInsemination(pregnancyData.bovineId, pregnancyData.checkDate, transaction);
            let expectedCalvingDate;
            if (relatedInsemination) {
                expectedCalvingDate = new Date(relatedInsemination.eventDate);
                expectedCalvingDate.setDate(expectedCalvingDate.getDate() + this.GESTATION_PERIOD_DAYS);
            }
            else {
                expectedCalvingDate = new Date(pregnancyData.checkDate);
                expectedCalvingDate.setDate(expectedCalvingDate.getDate() + (this.GESTATION_PERIOD_DAYS - 30));
            }
            const reproductionData = {
                bovineId: pregnancyData.bovineId,
                type: 'PREGNANCY_CHECK',
                eventDate: pregnancyData.checkDate,
                location: pregnancyData.location,
                notes: pregnancyData.notes,
                metadata: {
                    status: pregnancyData.status,
                    method: pregnancyData.method,
                    gestationAge: pregnancyData.gestationAge,
                    veterinarianId: pregnancyData.veterinarianId,
                    veterinarianName: pregnancyData.veterinarianName,
                    expectedCalvingDate: expectedCalvingDate,
                    relatedInseminationId: relatedInsemination?.id,
                    nextCheckDate: this.calculateNextPregnancyCheck(pregnancyData.checkDate, pregnancyData.gestationAge),
                    fetusViability: pregnancyData.fetusViability,
                    complications: pregnancyData.complications
                }
            };
            const record = await this.createReproductionRecord(reproductionData, userId);
            if (pregnancyData.status === 'CONFIRMED') {
                await Bovine.update({
                    reproductiveStatus: 'PREGNANT',
                    lastPregnancyCheck: pregnancyData.checkDate,
                    expectedCalvingDate: expectedCalvingDate
                }, {
                    where: { id: pregnancyData.bovineId },
                    transaction
                });
                await this.schedulePregnancyMonitoring(record, expectedCalvingDate, transaction);
            }
            else if (pregnancyData.status === 'NEGATIVE') {
                await Bovine.update({
                    reproductiveStatus: 'OPEN',
                    lastPregnancyCheck: pregnancyData.checkDate
                }, {
                    where: { id: pregnancyData.bovineId },
                    transaction
                });
                await this.scheduleNextHeatDetection(record, transaction);
            }
            await transaction.commit();
            return {
                id: record.id,
                bovineId: record.bovineId,
                checkDate: record.eventDate,
                status: record.metadata?.status || 'UNCERTAIN',
                method: record.metadata?.method || 'VISUAL',
                gestationAge: record.metadata?.gestationAge,
                veterinarianId: record.metadata?.veterinarianId,
                veterinarianName: record.metadata?.veterinarianName,
                expectedCalvingDate: record.metadata?.expectedCalvingDate,
                relatedInseminationId: record.metadata?.relatedInseminationId,
                nextCheckDate: record.metadata?.nextCheckDate,
                fetusViability: record.metadata?.fetusViability,
                complications: record.metadata?.complications,
                location: record.location,
                notes: record.notes,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
        }
        catch (error) {
            await transaction.rollback();
            logger.error('❌ Error confirmando embarazo', { error, pregnancyData });
            throw error;
        }
    }
    async recordBirth(birthData, userId) {
        const transaction = await sequelize.transaction();
        try {
            await this.validateBirthRecord(birthData);
            const reproductionData = {
                bovineId: birthData.motherId,
                type: 'BIRTH',
                eventDate: birthData.birthDate,
                location: birthData.location,
                notes: birthData.notes,
                metadata: {
                    calvingType: birthData.calvingType,
                    difficulty: birthData.difficulty,
                    assistance: birthData.assistance,
                    veterinarianId: birthData.veterinarianId,
                    duration: birthData.duration,
                    complications: birthData.complications,
                    placentaExpulsion: birthData.placentaExpulsion,
                    calfDetails: {
                        gender: birthData.calfGender,
                        weight: birthData.calfWeight,
                        health: birthData.calfHealth,
                        vigor: birthData.calfVigor,
                        earTag: birthData.calfEarTag
                    }
                }
            };
            const record = await this.createReproductionRecord(reproductionData, userId);
            if (birthData.calfEarTag) {
                await this.createCalfRecord(birthData, record.id, transaction);
            }
            await Bovine.update({
                reproductiveStatus: 'LACTATING',
                lastCalvingDate: birthData.birthDate,
                totalCalves: sequelize.literal('total_calves + 1'),
                daysPostPartum: 0
            }, {
                where: { id: birthData.motherId },
                transaction
            });
            const postPartumCheckDate = new Date(birthData.birthDate);
            postPartumCheckDate.setDate(postPartumCheckDate.getDate() + 30);
            await this.schedulePostPartumCheck(record, postPartumCheckDate, transaction);
            await transaction.commit();
            return {
                id: record.id,
                motherId: record.bovineId,
                birthDate: record.eventDate,
                calvingType: record.metadata?.calvingType || 'NATURAL',
                difficulty: record.metadata?.difficulty || 'EASY',
                assistance: record.metadata?.assistance || false,
                veterinarianId: record.metadata?.veterinarianId,
                duration: record.metadata?.duration,
                complications: record.metadata?.complications,
                placentaExpulsion: record.metadata?.placentaExpulsion,
                calfGender: record.metadata?.calfDetails?.gender || 'MALE',
                calfWeight: record.metadata?.calfDetails?.weight,
                calfHealth: record.metadata?.calfDetails?.health || 'HEALTHY',
                calfVigor: record.metadata?.calfDetails?.vigor || 'STRONG',
                calfEarTag: record.metadata?.calfDetails?.earTag,
                location: record.location,
                notes: record.notes,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
        }
        catch (error) {
            await transaction.rollback();
            logger.error('❌ Error registrando parto', { error, birthData });
            throw error;
        }
    }
    async calculateReproductionMetrics(bovineId, options = {}) {
        try {
            const whereClause = { bovineId };
            if (options.startDate || options.endDate) {
                whereClause.eventDate = {};
                if (options.startDate) {
                    whereClause.eventDate[sequelize_1.Op.gte] = options.startDate;
                }
                if (options.endDate) {
                    whereClause.eventDate[sequelize_1.Op.lte] = options.endDate;
                }
            }
            const records = await Reproduction.findAll({
                where: whereClause,
                order: [['eventDate', 'ASC']]
            });
            const metrics = {
                bovineId,
                period: {
                    startDate: options.startDate || (records[0]?.eventDate || new Date()),
                    endDate: options.endDate || (records[records.length - 1]?.eventDate || new Date())
                },
                totalEvents: records.length,
                eventsByType: {},
                fertilityRate: 0,
                averageCalvingInterval: 0,
                averageGestation: 0,
                totalCalves: 0,
                lastEvent: records.length > 0 ? records[records.length - 1].eventDate : null
            };
            const eventGroups = records.reduce((acc, record) => {
                if (!acc[record.type]) {
                    acc[record.type] = [];
                }
                acc[record.type].push(record);
                return acc;
            }, {});
            for (const [type, events] of Object.entries(eventGroups)) {
                const typedEvents = events;
                metrics.eventsByType[type] = {
                    count: typedEvents.length,
                    lastDate: typedEvents[typedEvents.length - 1].eventDate,
                    frequency: this.calculateEventFrequency(typedEvents)
                };
            }
            const inseminations = eventGroups['ARTIFICIAL_INSEMINATION'] || [];
            const pregnancies = eventGroups['PREGNANCY_CHECK']?.filter((p) => p.metadata?.status === 'CONFIRMED') || [];
            if (inseminations.length > 0) {
                metrics.fertilityRate = (pregnancies.length / inseminations.length) * 100;
            }
            const births = eventGroups['BIRTH'] || [];
            if (births.length > 1) {
                const intervals = [];
                for (let i = 1; i < births.length; i++) {
                    const interval = births[i].eventDate.getTime() - births[i - 1].eventDate.getTime();
                    intervals.push(interval / (24 * 60 * 60 * 1000));
                }
                metrics.averageCalvingInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
            }
            metrics.totalCalves = births.length;
            if (options.includeFertility) {
                metrics.fertilityAnalysis = await this.analyzeFertility(bovineId, records);
            }
            return metrics;
        }
        catch (error) {
            logger.error('❌ Error calculando métricas reproductivas', { error, bovineId });
            throw new ApiError('Error calculando métricas reproductivas', 500);
        }
    }
    async getHerdReproductionReport(options = {}) {
        try {
            const whereClause = {};
            if (options.startDate || options.endDate) {
                whereClause.eventDate = {};
                if (options.startDate) {
                    whereClause.eventDate[sequelize_1.Op.gte] = options.startDate;
                }
                if (options.endDate) {
                    whereClause.eventDate[sequelize_1.Op.lte] = options.endDate;
                }
            }
            const bovineFilter = {};
            if (options.ranchId) {
                bovineFilter.ranchId = options.ranchId;
            }
            const reproductionData = await Reproduction.findAll({
                where: whereClause,
                include: [{
                        model: Bovine,
                        where: bovineFilter,
                        attributes: ['id', 'earTag', 'name', 'breed', 'birthDate']
                    }],
                order: [['eventDate', 'ASC']]
            });
            const herdMetrics = {
                totalAnimals: new Set(reproductionData.map(r => r.bovineId)).size,
                totalEvents: reproductionData.length,
                eventsByType: {},
                overallFertilityRate: 0,
                averageCalvingInterval: 0,
                birthsThisPeriod: 0,
                pregnantCows: 0,
                openCows: 0
            };
            const eventsByType = reproductionData.reduce((acc, record) => {
                if (!acc[record.type]) {
                    acc[record.type] = [];
                }
                acc[record.type].push(record);
                return acc;
            }, {});
            const inseminations = eventsByType['ARTIFICIAL_INSEMINATION'] || [];
            const confirmedPregnancies = (eventsByType['PREGNANCY_CHECK'] || [])
                .filter((p) => p.metadata?.status === 'CONFIRMED');
            const births = eventsByType['BIRTH'] || [];
            herdMetrics.overallFertilityRate = inseminations.length > 0 ?
                (confirmedPregnancies.length / inseminations.length) * 100 : 0;
            herdMetrics.birthsThisPeriod = births.length;
            let individualMetrics = null;
            if (options.includeIndividual) {
                const bovineIds = Array.from(new Set(reproductionData.map(r => r.bovineId)));
                individualMetrics = await Promise.all(bovineIds.map(id => this.calculateReproductionMetrics(id, options)));
            }
            return {
                herdMetrics,
                individualMetrics,
                period: {
                    startDate: options.startDate,
                    endDate: options.endDate
                },
                generatedAt: new Date()
            };
        }
        catch (error) {
            logger.error('❌ Error generando reporte reproductivo del hato', { error, options });
            throw new ApiError('Error generando reporte reproductivo', 500);
        }
    }
    async validateReproductionData(data, transaction) {
        if (!data.bovineId) {
            throw new ValidationError('El ID del bovino es requerido');
        }
        if (!data.type) {
            throw new ValidationError('El tipo de evento reproductivo es requerido');
        }
        if (!data.eventDate) {
            throw new ValidationError('La fecha del evento es requerida');
        }
        if (data.eventDate > new Date() && !data.type.includes('SCHEDULED')) {
            throw new ValidationError('La fecha del evento no puede ser futura');
        }
        const duplicateEvent = await Reproduction.findOne({
            where: {
                bovineId: data.bovineId,
                type: data.type,
                eventDate: {
                    [sequelize_1.Op.between]: [
                        new Date(data.eventDate.getFullYear(), data.eventDate.getMonth(), data.eventDate.getDate(), 0, 0, 0),
                        new Date(data.eventDate.getFullYear(), data.eventDate.getMonth(), data.eventDate.getDate(), 23, 59, 59)
                    ]
                }
            },
            transaction
        });
        if (duplicateEvent && ['HEAT_DETECTION', 'ARTIFICIAL_INSEMINATION', 'BIRTH'].includes(data.type)) {
            throw new ValidationError(`Ya existe un evento de tipo ${data.type} para este bovino en la fecha especificada`);
        }
    }
    async validateBovineReproductiveStatus(bovine, eventType) {
        if (bovine.birthDate) {
            const ageInMonths = Math.floor((Date.now() - bovine.birthDate.getTime()) / (30 * 24 * 60 * 60 * 1000));
            if (ageInMonths < 15 && ['ARTIFICIAL_INSEMINATION', 'NATURAL_MATING'].includes(eventType)) {
                throw new ValidationError('El bovino es muy joven para reproducción (mínimo 15 meses)');
            }
        }
        if (eventType === 'ARTIFICIAL_INSEMINATION' && bovine.reproductiveStatus === 'PREGNANT') {
            throw new ValidationError('No se puede inseminar un bovino preñado');
        }
        if (eventType === 'PREGNANCY_CHECK' && bovine.reproductiveStatus === 'OPEN') {
            logger.warn('⚠️ Chequeo de preñez en bovino marcado como vacío', {
                bovineId: bovine.id,
                status: bovine.reproductiveStatus
            });
        }
    }
    async calculateReproductiveDates(eventType, eventDate, bovine) {
        const calculatedDates = {};
        switch (eventType) {
            case 'HEAT_DETECTION':
                calculatedDates.nextHeatDate = this.calculateNextHeatDate(eventDate);
                calculatedDates.optimalBreedingStart = new Date(eventDate.getTime() + 12 * 60 * 60 * 1000);
                calculatedDates.optimalBreedingEnd = new Date(eventDate.getTime() + 18 * 60 * 60 * 1000);
                break;
            case 'ARTIFICIAL_INSEMINATION':
                calculatedDates.pregnancyCheckDate = new Date(eventDate.getTime() + 30 * 24 * 60 * 60 * 1000);
                calculatedDates.expectedCalvingDate = new Date(eventDate.getTime() + this.GESTATION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
                calculatedDates.dryOffDate = new Date(eventDate.getTime() + (this.GESTATION_PERIOD_DAYS - 60) * 24 * 60 * 60 * 1000);
                break;
            case 'PREGNANCY_CHECK':
                if (bovine.lastInseminationDate) {
                    calculatedDates.conceptionDate = bovine.lastInseminationDate;
                    calculatedDates.expectedCalvingDate = new Date(bovine.lastInseminationDate.getTime() + this.GESTATION_PERIOD_DAYS * 24 * 60 * 60 * 1000);
                }
                break;
            case 'BIRTH':
                calculatedDates.breedingEligibleDate = new Date(eventDate.getTime() + this.POST_PARTUM_INTERVAL * 24 * 60 * 60 * 1000);
                calculatedDates.weaningDate = new Date(eventDate.getTime() + 210 * 24 * 60 * 60 * 1000);
                break;
        }
        return calculatedDates;
    }
    calculateNextHeatDate(lastHeatDate) {
        const nextHeat = new Date(lastHeatDate);
        nextHeat.setDate(nextHeat.getDate() + this.ESTRUS_CYCLE_DAYS);
        return nextHeat;
    }
    formatReproductionRecord(record) {
        return {
            id: record.id,
            bovineId: record.bovineId,
            type: record.type,
            eventDate: record.eventDate,
            location: record.location,
            notes: record.notes,
            metadata: record.metadata || {},
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        };
    }
    async validateHeatRecord(data) {
        if (!['LOW', 'MEDIUM', 'HIGH'].includes(data.intensity)) {
            throw new ValidationError('Intensidad de celo inválida');
        }
    }
    async validateInseminationRecord(data) {
        if (!data.bullId && !data.bullName) {
            throw new ValidationError('Información del toro es requerida');
        }
    }
    async validatePregnancyRecord(data) {
        if (!['CONFIRMED', 'NEGATIVE', 'UNCERTAIN'].includes(data.status)) {
            throw new ValidationError('Estado de preñez inválido');
        }
    }
    async validateBirthRecord(data) {
        if (!['NATURAL', 'ASSISTED', 'CESAREAN'].includes(data.calvingType)) {
            throw new ValidationError('Tipo de parto inválido');
        }
    }
    async scheduleBreedingWindowAlert(record) {
        if (record.metadata?.optimal_breeding_window?.start) {
            await this.notificationService.scheduleNotification({
                userId: record.recordedBy,
                title: 'Ventana óptima de reproducción',
                message: `Ventana óptima para inseminar bovino ${record.bovineId}`,
                type: 'BREEDING_ALERT',
                relatedId: record.bovineId,
                relatedType: 'BOVINE'
            }, record.metadata.optimal_breeding_window.start);
        }
    }
    async schedulePregnancyCheckReminder(record, checkDate) {
        await this.notificationService.scheduleNotification({
            userId: record.recordedBy,
            title: 'Recordatorio: Chequeo de preñez',
            message: `Chequeo de preñez programado para bovino ${record.bovineId}`,
            type: 'PREGNANCY_CHECK',
            relatedId: record.bovineId,
            relatedType: 'BOVINE'
        }, checkDate);
    }
    async findRelatedInsemination(bovineId, checkDate, transaction) {
        return await Reproduction.findOne({
            where: {
                bovineId,
                type: 'ARTIFICIAL_INSEMINATION',
                eventDate: {
                    [sequelize_1.Op.between]: [
                        new Date(checkDate.getTime() - 60 * 24 * 60 * 60 * 1000),
                        checkDate
                    ]
                }
            },
            order: [['eventDate', 'DESC']],
            transaction
        });
    }
    calculateNextPregnancyCheck(checkDate, gestationAge) {
        const nextCheck = new Date(checkDate);
        if (gestationAge && gestationAge < 60) {
            nextCheck.setDate(nextCheck.getDate() + 30);
        }
        else {
            nextCheck.setDate(nextCheck.getDate() + 60);
        }
        return nextCheck;
    }
    async schedulePregnancyMonitoring(record, expectedCalvingDate, transaction) {
        const checks = [60, 120, 180, 240];
        for (const days of checks) {
            const checkDate = new Date(record.eventDate.getTime() + days * 24 * 60 * 60 * 1000);
            if (checkDate < expectedCalvingDate) {
                await this.notificationService.scheduleNotification({
                    userId: record.recordedBy,
                    title: 'Chequeo de gestación',
                    message: `Chequeo programado de gestación para bovino ${record.bovineId}`,
                    type: 'PREGNANCY_MONITORING',
                    relatedId: record.bovineId,
                    relatedType: 'BOVINE'
                }, checkDate);
            }
        }
    }
    async scheduleNextHeatDetection(record, transaction) {
        const nextHeatDate = this.calculateNextHeatDate(record.eventDate);
        await this.notificationService.scheduleNotification({
            userId: record.recordedBy,
            title: 'Vigilar próximo celo',
            message: `Próximo celo esperado para bovino ${record.bovineId}`,
            type: 'HEAT_DETECTION',
            relatedId: record.bovineId,
            relatedType: 'BOVINE'
        }, nextHeatDate);
    }
    async createCalfRecord(birthData, recordId, transaction) {
        await Bovine.create({
            earTag: birthData.calfEarTag,
            name: `Cría de ${birthData.motherId}`,
            type: 'CALF',
            breed: 'Unknown',
            gender: birthData.calfGender,
            birthDate: birthData.birthDate,
            birthWeight: birthData.calfWeight,
            motherId: birthData.motherId,
            healthStatus: birthData.calfHealth.toUpperCase(),
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }, { transaction });
    }
    async schedulePostPartumCheck(record, checkDate, transaction) {
        await this.notificationService.scheduleNotification({
            userId: record.recordedBy,
            title: 'Chequeo post-parto',
            message: `Chequeo post-parto programado para bovino ${record.bovineId}`,
            type: 'POST_PARTUM_CHECK',
            relatedId: record.bovineId,
            relatedType: 'BOVINE'
        }, checkDate);
    }
    calculateEventFrequency(events) {
        if (events.length < 2)
            return 0;
        const intervals = [];
        for (let i = 1; i < events.length; i++) {
            const interval = events[i].eventDate.getTime() - events[i - 1].eventDate.getTime();
            intervals.push(interval / (24 * 60 * 60 * 1000));
        }
        return intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
    }
    async analyzeFertility(bovineId, records) {
        const inseminations = records.filter((r) => r.type === 'ARTIFICIAL_INSEMINATION');
        const pregnancies = records.filter((r) => r.type === 'PREGNANCY_CHECK' && r.metadata?.status === 'CONFIRMED');
        const births = records.filter((r) => r.type === 'BIRTH');
        const conceptionRate = inseminations.length > 0 ? (pregnancies.length / inseminations.length) * 100 : 0;
        let calvingInterval = 0;
        if (births.length > 1) {
            const intervals = [];
            for (let i = 1; i < births.length; i++) {
                const interval = (births[i].eventDate.getTime() - births[i - 1].eventDate.getTime()) / (24 * 60 * 60 * 1000);
                intervals.push(interval);
            }
            calvingInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
        }
        return {
            conception: {
                rate: conceptionRate,
                trend: conceptionRate > 75 ? 'IMPROVING' : conceptionRate > 50 ? 'STABLE' : 'DECLINING',
                factors: []
            },
            calving: {
                interval: calvingInterval,
                regularity: calvingInterval > 0 && calvingInterval < 400 ? 'REGULAR' : 'IRREGULAR',
                complications: []
            },
            breeding: {
                efficiency: conceptionRate,
                recommendations: [
                    conceptionRate < 50 ? 'Evaluar nutrición y manejo reproductivo' : 'Mantener protocolo actual'
                ]
            }
        };
    }
    async createReproductiveEvent(record, transaction) {
        await Event.create({
            type: 'REPRODUCTIVE_EVENT',
            title: `Evento reproductivo: ${record.type}`,
            description: `${record.type} registrado para bovino ${record.bovineId}`,
            bovineId: record.bovineId,
            scheduledDate: record.eventDate,
            status: 'COMPLETED',
            createdBy: record.recordedBy,
            metadata: record.metadata
        }, { transaction });
    }
    async updateBovineReproductiveStatus(bovineId, type, recordId, transaction) {
        const updateData = { lastReproductiveEvent: new Date() };
        switch (type) {
            case 'HEAT_DETECTION':
                updateData.lastHeatDate = new Date();
                break;
            case 'ARTIFICIAL_INSEMINATION':
                updateData.lastInseminationDate = new Date();
                updateData.reproductiveStatus = 'BRED';
                break;
            case 'PREGNANCY_CHECK':
                updateData.lastPregnancyCheck = new Date();
                break;
        }
        await Bovine.update(updateData, {
            where: { id: bovineId },
            transaction
        });
    }
    async scheduleReproductiveAlerts(record, transaction) {
        console.log(`📅 Programando alertas para evento ${record.type} - ${record.id}`);
    }
    async createFinancialRecords(record, transaction) {
        if (record.metadata?.cost && record.metadata.cost > 0) {
            await Finance.create({
                type: 'EXPENSE',
                category: 'REPRODUCTIVE',
                subcategory: record.type,
                amount: record.metadata.cost,
                date: record.eventDate,
                bovineId: record.bovineId,
                description: `Costo de ${record.type}`,
                recordedBy: record.recordedBy
            }, { transaction });
        }
    }
}
exports.ReproductionService = ReproductionService;
exports.reproductionService = new ReproductionService();
//# sourceMappingURL=reproduction.js.map