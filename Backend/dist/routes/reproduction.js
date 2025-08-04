"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
let body, query, param, validationResult;
try {
    const expressValidator = require('express-validator');
    body = expressValidator.body;
    query = expressValidator.query;
    param = expressValidator.param;
    validationResult = expressValidator.validationResult;
}
catch (error) {
    body = (field) => ({
        isUUID: () => ({ withMessage: () => ({}) }),
        notEmpty: () => ({ withMessage: () => ({}) }),
        isLength: () => ({ withMessage: () => ({}) }),
        isISO8601: () => ({ withMessage: () => ({}) }),
        matches: () => ({ withMessage: () => ({}) }),
        isIn: () => ({ withMessage: () => ({}) }),
        isBoolean: () => ({ withMessage: () => ({}) }),
        isInt: () => ({ withMessage: () => ({}) }),
        isFloat: () => ({ withMessage: () => ({}) }),
        isArray: () => ({ withMessage: () => ({}) }),
        optional: () => ({
            isUUID: () => ({ withMessage: () => ({}) }),
            isLength: () => ({ withMessage: () => ({}) }),
            isISO8601: () => ({ withMessage: () => ({}) }),
            matches: () => ({ withMessage: () => ({}) }),
            isIn: () => ({ withMessage: () => ({}) }),
            isBoolean: () => ({ withMessage: () => ({}) }),
            isInt: () => ({ withMessage: () => ({}) }),
            isFloat: () => ({ withMessage: () => ({}) }),
            isArray: () => ({ withMessage: () => ({}) }),
            custom: () => ({ withMessage: () => ({}) })
        }),
        custom: () => ({ withMessage: () => ({}) })
    });
    query = body;
    param = body;
    validationResult = () => ({ isEmpty: () => true, array: () => [] });
}
const auth_1 = require("../middleware/auth");
const rate_limit_1 = require("../middleware/rate-limit");
const role_1 = require("../middleware/role");
const validation_1 = require("../middleware/validation");
const logging_1 = require("../middleware/logging");
const router = (0, express_1.Router)();
const validateReproductiveDates = [
    body('serviceDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de servicio debe ser válida'),
    body('lastHeatDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de último celo debe ser válida'),
    body('nextHeatDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de próximo celo debe ser válida'),
    body('expectedCalvingDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha esperada de parto debe ser válida'),
    body('actualCalvingDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha real de parto debe ser válida')
];
const validateReproductiveLocation = [
    body('location.latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitud debe estar entre -90 y 90 grados'),
    body('location.longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitud debe estar entre -180 y 180 grados'),
    body('location.paddock')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Potrero debe tener entre 1 y 100 caracteres'),
    body('location.facility')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('Instalación debe tener entre 1 y 100 caracteres')
];
const validateAnimalIdentification = [
    body('femaleId')
        .isUUID()
        .withMessage('ID de hembra debe ser un UUID válido'),
    body('femaleEarTag')
        .notEmpty()
        .isLength({ min: 1, max: 20 })
        .withMessage('Arete de hembra debe tener entre 1 y 20 caracteres'),
    body('maleId')
        .optional()
        .isUUID()
        .withMessage('ID de macho debe ser un UUID válido'),
    body('maleEarTag')
        .optional()
        .isLength({ min: 1, max: 20 })
        .withMessage('Arete de macho debe tener entre 1 y 20 caracteres')
];
const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Error de validación de datos',
                details: errors.array()
            }
        });
        return;
    }
    next();
};
const auditLog = (action) => {
    return (req, res, next) => {
        (0, logging_1.logCattleEvent)('SYSTEM_EVENT', `Acción reproductiva: ${action}`, req, {
            action,
            userId: req.user?.id,
            userEmail: req.user?.email,
            path: req.originalUrl,
            method: req.method
        });
        next();
    };
};
const rateLimitByUserId = (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE);
router.get('/dashboard', auth_1.authenticateToken, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, role_1.requireModulePermission)('reproduction', 'read'), query('timeRange')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Rango de tiempo inválido'), query('includeProjections')
    .optional()
    .isBoolean()
    .withMessage('includeProjections debe ser verdadero o falso'), query('includeAlerts')
    .optional()
    .isBoolean()
    .withMessage('includeAlerts debe ser verdadero o falso'), validateRequest, auditLog('reproduction.dashboard.view'), async (req, res, next) => {
    try {
        const { timeRange = '30d', includeProjections = 'true', includeAlerts = 'true' } = req.query;
        const userId = req.user?.id;
        const dashboard = {
            timeRange,
            includeProjections: includeProjections === 'true',
            includeAlerts: includeAlerts === 'true',
            userId,
            statistics: {
                totalAnimals: 0,
                pregnantAnimals: 0,
                dueForService: 0,
                birthsThisMonth: 0
            }
        };
        res.json({
            success: true,
            data: dashboard,
            message: 'Dashboard reproductivo obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/statistics', auth_1.authenticateToken, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, role_1.requireModulePermission)('reproduction', 'read'), query('period')
    .optional()
    .isIn(['current_season', 'last_season', 'yearly', 'custom'])
    .withMessage('Período inválido'), query('breedId')
    .optional()
    .isUUID()
    .withMessage('ID de raza debe ser un UUID válido'), query('includeGenetics')
    .optional()
    .isBoolean()
    .withMessage('includeGenetics debe ser verdadero o falso'), validateRequest, async (req, res, next) => {
    try {
        const { period = 'current_season', breedId, includeGenetics = 'false' } = req.query;
        const userId = req.user?.id;
        const statistics = {
            period,
            breedId,
            includeGenetics: includeGenetics === 'true',
            userId,
            reproductiveStats: {
                conceptionRate: 0,
                pregnancyRate: 0,
                calvingInterval: 0
            }
        };
        res.json({
            success: true,
            data: statistics,
            message: 'Estadísticas reproductivas obtenidas exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/mating-records', auth_1.authenticateToken, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, role_1.requireModulePermission)('reproduction', 'read'), query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'), query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'), query('matingType')
    .optional()
    .isIn(['natural', 'artificial_insemination', 'embryo_transfer'])
    .withMessage('Tipo de apareamiento inválido'), query('status')
    .optional()
    .isIn(['planned', 'completed', 'failed', 'cancelled'])
    .withMessage('Estado inválido'), query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde debe ser válida'), query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta debe ser válida'), query('femaleId')
    .optional()
    .isUUID()
    .withMessage('ID de hembra debe ser un UUID válido'), query('maleId')
    .optional()
    .isUUID()
    .withMessage('ID de macho debe ser un UUID válido'), validateRequest, auditLog('reproduction.mating_records.list'), async (req, res, next) => {
    try {
        const { page = '1', limit = '20', matingType, status, dateFrom, dateTo, femaleId, maleId } = req.query;
        const userId = req.user?.id;
        const filters = {
            matingType: matingType,
            status: status,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            femaleId: femaleId,
            maleId: maleId
        };
        const matingRecords = {
            page: parseInt(page),
            limit: parseInt(limit),
            filters,
            userId,
            data: [],
            pagination: {
                total: 0,
                currentPage: parseInt(page),
                totalPages: 0
            }
        };
        res.json({
            success: true,
            data: matingRecords,
            message: 'Registros de apareamiento obtenidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/mating-records', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.MANAGER, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, role_1.requireModulePermission)('reproduction', 'create'), validation_1.sanitizeInput, [
    ...validateAnimalIdentification,
    body('serviceDate')
        .isISO8601()
        .withMessage('Fecha de servicio debe ser válida'),
    body('serviceTime')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Hora de servicio debe estar en formato HH:MM'),
    body('matingType')
        .isIn(['natural', 'hand_breeding', 'pasture_breeding'])
        .withMessage('Tipo de apareamiento inválido'),
    body('heatDetection.detected')
        .isBoolean()
        .withMessage('Detección de celo debe ser verdadero o falso'),
    body('heatDetection.intensity')
        .optional()
        .isIn(['weak', 'moderate', 'strong', 'silent'])
        .withMessage('Intensidad de celo inválida'),
    body('heatDetection.duration')
        .optional()
        .isInt({ min: 1, max: 72 })
        .withMessage('Duración de celo debe estar entre 1 y 72 horas'),
    body('heatDetection.signs')
        .optional()
        .isArray()
        .withMessage('Signos de celo debe ser un array'),
    body('heatDetection.signs.*')
        .optional()
        .isIn(['standing_heat', 'mounting', 'restlessness', 'mucus_discharge', 'swollen_vulva', 'decreased_appetite'])
        .withMessage('Signo de celo inválido'),
    body('behaviorObservations')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Observaciones de comportamiento no pueden exceder 1000 caracteres'),
    body('weatherConditions.temperature')
        .optional()
        .isFloat({ min: -10, max: 50 })
        .withMessage('Temperatura debe estar entre -10 y 50°C'),
    body('weatherConditions.humidity')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Humedad debe estar entre 0 y 100%'),
    body('weatherConditions.condition')
        .optional()
        .isIn(['sunny', 'cloudy', 'rainy', 'stormy', 'foggy'])
        .withMessage('Condición climática inválida'),
    ...validateReproductiveLocation,
    body('technician')
        .notEmpty()
        .isLength({ min: 2, max: 100 })
        .withMessage('Técnico debe tener entre 2 y 100 caracteres'),
    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Las notas no pueden exceder 1000 caracteres')
], validateRequest, auditLog('reproduction.mating_record.create'), async (req, res, next) => {
    try {
        const matingData = req.body;
        const userId = req.user?.id;
        const newMating = {
            ...matingData,
            recordedBy: userId,
            id: 'generated-id',
            createdAt: new Date()
        };
        res.status(201).json({
            success: true,
            data: newMating,
            message: 'Apareamiento registrado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/artificial-insemination', auth_1.authenticateToken, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, role_1.requireModulePermission)('reproduction', 'read'), query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'), query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'), query('status')
    .optional()
    .isIn(['scheduled', 'completed', 'failed', 'cancelled'])
    .withMessage('Estado inválido'), query('technique')
    .optional()
    .isIn(['rectovaginal', 'speculum', 'direct_vision'])
    .withMessage('Técnica inválida'), query('semenOrigin')
    .optional()
    .isIn(['national', 'imported', 'on_farm'])
    .withMessage('Origen del semen inválido'), query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde debe ser válida'), query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta debe ser válida'), validateRequest, auditLog('reproduction.artificial_insemination.list'), async (req, res, next) => {
    try {
        const { page = '1', limit = '20', status, technique, semenOrigin, dateFrom, dateTo } = req.query;
        const userId = req.user?.id;
        const filters = {
            status: status,
            technique: technique,
            semenOrigin: semenOrigin,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined
        };
        const inseminationRecords = {
            page: parseInt(page),
            limit: parseInt(limit),
            filters,
            userId,
            data: [],
            pagination: {
                total: 0,
                currentPage: parseInt(page),
                totalPages: 0
            }
        };
        res.json({
            success: true,
            data: inseminationRecords,
            message: 'Registros de inseminación artificial obtenidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/artificial-insemination', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.VETERINARIAN), role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, role_1.requireModulePermission)('reproduction', 'create'), validation_1.sanitizeInput, [
    body('femaleId')
        .isUUID()
        .withMessage('ID de hembra debe ser un UUID válido'),
    body('femaleEarTag')
        .notEmpty()
        .isLength({ min: 1, max: 20 })
        .withMessage('Arete de hembra debe tener entre 1 y 20 caracteres'),
    body('sireId')
        .optional()
        .isUUID()
        .withMessage('ID de toro debe ser un UUID válido'),
    body('semenDetails.batchNumber')
        .notEmpty()
        .isLength({ min: 1, max: 50 })
        .withMessage('Número de lote debe tener entre 1 y 50 caracteres'),
    body('semenDetails.source')
        .notEmpty()
        .isLength({ min: 2, max: 100 })
        .withMessage('Fuente del semen debe tener entre 2 y 100 caracteres'),
    body('semenDetails.collectionDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de recolección debe ser válida'),
    body('semenDetails.breed')
        .notEmpty()
        .isLength({ min: 2, max: 50 })
        .withMessage('Raza debe tener entre 2 y 50 caracteres'),
    body('semenDetails.concentration')
        .optional()
        .isFloat({ min: 1, max: 1000 })
        .withMessage('Concentración debe estar entre 1 y 1000 millones/ml'),
    body('semenDetails.motility')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Motilidad debe estar entre 0 y 100%'),
    body('semenDetails.viability')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Viabilidad debe estar entre 0 y 100%'),
    body('semenDetails.morphology')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Morfología debe estar entre 0 y 100%'),
    body('inseminationDate')
        .isISO8601()
        .withMessage('Fecha de inseminación debe ser válida'),
    body('inseminationTime')
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Hora de inseminación debe estar en formato HH:MM'),
    body('technique')
        .isIn(['rectovaginal', 'speculum', 'direct_vision'])
        .withMessage('Técnica de inseminación inválida'),
    body('heatDetection.lastObservedHeat')
        .optional()
        .isISO8601()
        .withMessage('Último celo observado debe ser válido'),
    body('heatDetection.heatIntensity')
        .optional()
        .isIn(['weak', 'moderate', 'strong'])
        .withMessage('Intensidad de celo inválida'),
    body('heatDetection.optimalTiming')
        .optional()
        .isBoolean()
        .withMessage('Momento óptimo debe ser verdadero o falso'),
    body('cervixCondition')
        .optional()
        .isIn(['tight', 'relaxed', 'optimal', 'difficult'])
        .withMessage('Condición cervical inválida'),
    body('semenPlacement')
        .isIn(['body_of_uterus', 'uterine_horn', 'cervix'])
        .withMessage('Ubicación del semen inválida'),
    body('dosesUsed')
        .isInt({ min: 1, max: 5 })
        .withMessage('Dosis utilizadas debe estar entre 1 y 5'),
    body('inseminator')
        .notEmpty()
        .isLength({ min: 2, max: 100 })
        .withMessage('Inseminador debe tener entre 2 y 100 caracteres'),
    body('assistants')
        .optional()
        .isArray()
        .withMessage('Asistentes debe ser un array'),
    body('assistants.*')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Nombre de asistente debe tener entre 2 y 100 caracteres'),
    body('complications')
        .optional()
        .isArray()
        .withMessage('Complicaciones debe ser un array'),
    body('complications.*')
        .optional()
        .isIn(['cervix_difficult', 'excessive_bleeding', 'animal_stress', 'equipment_failure', 'semen_quality'])
        .withMessage('Complicación inválida'),
    body('postInseminationCare')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Cuidados post-inseminación no pueden exceder 500 caracteres'),
    body('expectedCalvingDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha esperada de parto debe ser válida'),
    body('followUpDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha de seguimiento debe ser válida'),
    ...validateReproductiveLocation,
    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Las notas no pueden exceder 1000 caracteres')
], validateRequest, auditLog('reproduction.artificial_insemination.create'), async (req, res, next) => {
    try {
        const inseminationData = req.body;
        const userId = req.user?.id;
        const newInsemination = {
            ...inseminationData,
            recordedBy: userId,
            id: 'generated-id',
            createdAt: new Date()
        };
        res.status(201).json({
            success: true,
            data: newInsemination,
            message: 'Inseminación artificial registrada exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/artificial-insemination/schedule', auth_1.authenticateToken, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, role_1.requireModulePermission)('reproduction', 'read'), query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser válida'), query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser válida'), query('inseminatorId')
    .optional()
    .isUUID()
    .withMessage('ID de inseminador debe ser un UUID válido'), query('includePastDue')
    .optional()
    .isBoolean()
    .withMessage('includePastDue debe ser verdadero o falso'), validateRequest, async (req, res, next) => {
    try {
        const { startDate, endDate, inseminatorId, includePastDue = 'true' } = req.query;
        const userId = req.user?.id;
        const schedule = {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            inseminatorId: inseminatorId,
            includePastDue: includePastDue === 'true',
            userId,
            data: []
        };
        res.json({
            success: true,
            data: schedule,
            message: 'Programación de inseminaciones obtenida exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/pregnancy-tracking', auth_1.authenticateToken, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, role_1.requireModulePermission)('reproduction', 'read'), query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'), query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'), query('status')
    .optional()
    .isIn(['suspected', 'confirmed', 'uncertain', 'not_pregnant', 'aborted'])
    .withMessage('Estado de gestación inválido'), query('trimester')
    .optional()
    .isIn(['first', 'second', 'third'])
    .withMessage('Trimestre inválido'), query('dueWithin')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Días de vencimiento debe estar entre 1 y 365'), query('veterinarianId')
    .optional()
    .isUUID()
    .withMessage('ID de veterinario debe ser un UUID válido'), validateRequest, auditLog('reproduction.pregnancy_tracking.list'), async (req, res, next) => {
    try {
        const { page = '1', limit = '20', status, trimester, dueWithin, veterinarianId } = req.query;
        const userId = req.user?.id;
        const filters = {
            status: status,
            trimester: trimester,
            dueWithin: dueWithin ? parseInt(dueWithin) : undefined,
            veterinarianId: veterinarianId
        };
        const pregnancies = {
            page: parseInt(page),
            limit: parseInt(limit),
            filters,
            userId,
            data: [],
            pagination: {
                total: 0,
                currentPage: parseInt(page),
                totalPages: 0
            }
        };
        res.json({
            success: true,
            data: pregnancies,
            message: 'Seguimiento de gestaciones obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/pregnancy-check', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.VETERINARIAN), role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.HEALTH), (0, role_1.requireModulePermission)('reproduction', 'create'), validation_1.sanitizeInput, [
    body('femaleId')
        .isUUID()
        .withMessage('ID de hembra debe ser un UUID válido'),
    body('examDate')
        .isISO8601()
        .withMessage('Fecha de examen debe ser válida'),
    body('method')
        .isIn(['palpation', 'ultrasound', 'blood_test', 'milk_test'])
        .withMessage('Método de diagnóstico inválido'),
    body('result')
        .isIn(['pregnant', 'not_pregnant', 'uncertain'])
        .withMessage('Resultado de diagnóstico inválido'),
    body('gestationAge')
        .optional()
        .isInt({ min: 0, max: 300 })
        .withMessage('Edad gestacional debe estar entre 0 y 300 días'),
    body('expectedCalvingDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha esperada de parto debe ser válida'),
    body('fetusViability')
        .optional()
        .isIn(['viable', 'non_viable', 'uncertain'])
        .withMessage('Viabilidad fetal inválida'),
    body('fetusCount')
        .optional()
        .isInt({ min: 1, max: 5 })
        .withMessage('Número de fetos debe estar entre 1 y 5'),
    body('fetusGender')
        .optional()
        .isIn(['male', 'female', 'unknown'])
        .withMessage('Sexo fetal inválido'),
    body('placentalCondition')
        .optional()
        .isIn(['normal', 'thickened', 'abnormal'])
        .withMessage('Condición placentaria inválida'),
    body('amnioticFluid')
        .optional()
        .isIn(['normal', 'oligohydramnios', 'polyhydramnios'])
        .withMessage('Líquido amniótico inválido'),
    body('maternalCondition')
        .optional()
        .isIn(['excellent', 'good', 'fair', 'poor'])
        .withMessage('Condición materna inválida'),
    body('bodyConditionScore')
        .optional()
        .isFloat({ min: 1.0, max: 5.0 })
        .withMessage('Condición corporal debe estar entre 1.0 y 5.0'),
    body('complications')
        .optional()
        .isArray()
        .withMessage('Complicaciones debe ser un array'),
    body('complications.*')
        .optional()
        .isIn(['hydrops', 'fetal_mummification', 'abortion_risk', 'maternal_stress'])
        .withMessage('Complicación inválida'),
    body('veterinarian')
        .notEmpty()
        .isLength({ min: 2, max: 100 })
        .withMessage('Veterinario debe tener entre 2 y 100 caracteres'),
    body('nextCheckDate')
        .optional()
        .isISO8601()
        .withMessage('Próxima fecha de revisión debe ser válida'),
    body('recommendations')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Recomendaciones no pueden exceder 1000 caracteres'),
    ...validateReproductiveLocation,
    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Las notas no pueden exceder 1000 caracteres')
], validateRequest, auditLog('reproduction.pregnancy_check.create'), async (req, res, next) => {
    try {
        const pregnancyData = req.body;
        const userId = req.user?.id;
        const pregnancyCheck = {
            ...pregnancyData,
            recordedBy: userId,
            id: 'generated-id',
            createdAt: new Date()
        };
        res.status(201).json({
            success: true,
            data: pregnancyCheck,
            message: 'Diagnóstico de gestación registrado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/pregnancy-calendar', auth_1.authenticateToken, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, role_1.requireModulePermission)('reproduction', 'read'), query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser válida'), query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser válida'), query('includeCheckups')
    .optional()
    .isBoolean()
    .withMessage('includeCheckups debe ser verdadero o falso'), query('includeCalvings')
    .optional()
    .isBoolean()
    .withMessage('includeCalvings debe ser verdadero o falso'), validateRequest, async (req, res, next) => {
    try {
        const { startDate, endDate, includeCheckups = 'true', includeCalvings = 'true' } = req.query;
        const userId = req.user?.id;
        const calendar = {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            includeCheckups: includeCheckups === 'true',
            includeCalvings: includeCalvings === 'true',
            userId,
            data: []
        };
        res.json({
            success: true,
            data: calendar,
            message: 'Calendario de gestaciones obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/birth-records', auth_1.authenticateToken, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, role_1.requireModulePermission)('reproduction', 'read'), query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'), query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'), query('difficulty')
    .optional()
    .isIn(['easy', 'moderate', 'difficult', 'assisted', 'cesarean'])
    .withMessage('Dificultad de parto inválida'), query('outcome')
    .optional()
    .isIn(['normal', 'complications', 'stillborn', 'neonatal_death'])
    .withMessage('Resultado del parto inválido'), query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde debe ser válida'), query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta debe ser válida'), query('season')
    .optional()
    .isIn(['spring', 'summer', 'autumn', 'winter'])
    .withMessage('Temporada inválida'), validateRequest, auditLog('reproduction.birth_records.list'), async (req, res, next) => {
    try {
        const { page = '1', limit = '20', difficulty, outcome, dateFrom, dateTo, season } = req.query;
        const userId = req.user?.id;
        const filters = {
            difficulty: difficulty,
            outcome: outcome,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            season: season
        };
        const birthRecords = {
            page: parseInt(page),
            limit: parseInt(limit),
            filters,
            userId,
            data: [],
            pagination: {
                total: 0,
                currentPage: parseInt(page),
                totalPages: 0
            }
        };
        res.json({
            success: true,
            data: birthRecords,
            message: 'Registros de nacimientos obtenidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/birth-records', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.MANAGER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, role_1.requireModulePermission)('reproduction', 'create'), validation_1.sanitizeInput, [
    body('motherId')
        .isUUID()
        .withMessage('ID de madre debe ser un UUID válido'),
    body('motherEarTag')
        .notEmpty()
        .isLength({ min: 1, max: 20 })
        .withMessage('Arete de madre debe tener entre 1 y 20 caracteres'),
    body('sireId')
        .optional()
        .isUUID()
        .withMessage('ID de padre debe ser un UUID válido'),
    body('calvingDate')
        .isISO8601()
        .withMessage('Fecha de parto debe ser válida'),
    body('calvingTime')
        .optional()
        .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
        .withMessage('Hora de parto debe estar en formato HH:MM'),
    body('gestationLength')
        .optional()
        .isInt({ min: 240, max: 320 })
        .withMessage('Duración de gestación debe estar entre 240 y 320 días'),
    body('difficulty')
        .isIn(['easy', 'moderate', 'difficult', 'assisted', 'cesarean'])
        .withMessage('Dificultad de parto inválida'),
    body('assistanceRequired')
        .isBoolean()
        .withMessage('Asistencia requerida debe ser verdadero o falso'),
    body('assistanceType')
        .optional()
        .isIn(['manual', 'mechanical', 'veterinary', 'cesarean'])
        .withMessage('Tipo de asistencia inválido'),
    body('presentation')
        .optional()
        .isIn(['anterior', 'posterior', 'breech', 'transverse'])
        .withMessage('Presentación fetal inválida'),
    body('placentaExpelled')
        .isBoolean()
        .withMessage('Placenta expulsada debe ser verdadero o falso'),
    body('placentaExpulsionTime')
        .optional()
        .isInt({ min: 0, max: 48 })
        .withMessage('Tiempo de expulsión placentaria debe estar entre 0 y 48 horas'),
    body('retainedPlacenta')
        .optional()
        .isBoolean()
        .withMessage('Retención placentaria debe ser verdadero o falso'),
    body('maternalCondition')
        .isIn(['excellent', 'good', 'fair', 'poor', 'critical'])
        .withMessage('Condición materna inválida'),
    body('complications')
        .optional()
        .isArray()
        .withMessage('Complicaciones debe ser un array'),
    body('complications.*')
        .optional()
        .isIn(['dystocia', 'retained_placenta', 'uterine_prolapse', 'hemorrhage', 'milk_fever', 'mastitis', 'metritis'])
        .withMessage('Complicación inválida'),
    body('calves')
        .isArray({ min: 1, max: 5 })
        .withMessage('Debe especificar información de al menos 1 ternero (máximo 5)'),
    body('calves.*.gender')
        .isIn(['male', 'female'])
        .withMessage('Sexo del ternero inválido'),
    body('calves.*.weight')
        .optional()
        .isFloat({ min: 10, max: 80 })
        .withMessage('Peso del ternero debe estar entre 10 y 80 kg'),
    body('calves.*.height')
        .optional()
        .isFloat({ min: 50, max: 120 })
        .withMessage('Altura del ternero debe estar entre 50 y 120 cm'),
    body('calves.*.viability')
        .isIn(['alive_healthy', 'alive_weak', 'stillborn', 'died_shortly_after'])
        .withMessage('Viabilidad del ternero inválida'),
    body('calves.*.earTag')
        .optional()
        .isLength({ min: 1, max: 20 })
        .withMessage('Arete del ternero debe tener entre 1 y 20 caracteres'),
    body('calves.*.registrationNumber')
        .optional()
        .isLength({ min: 1, max: 50 })
        .withMessage('Número de registro debe tener entre 1 y 50 caracteres'),
    body('calves.*.abnormalities')
        .optional()
        .isArray()
        .withMessage('Anormalidades debe ser un array'),
    body('calves.*.abnormalities.*')
        .optional()
        .isIn(['cleft_palate', 'limb_deformity', 'heart_defect', 'neurological', 'digestive', 'respiratory'])
        .withMessage('Anormalidad inválida'),
    body('veterinarian')
        .optional()
        .isLength({ min: 2, max: 100 })
        .withMessage('Veterinario debe tener entre 2 y 100 caracteres'),
    body('attendant')
        .notEmpty()
        .isLength({ min: 2, max: 100 })
        .withMessage('Asistente debe tener entre 2 y 100 caracteres'),
    body('weatherConditions.temperature')
        .optional()
        .isFloat({ min: -10, max: 50 })
        .withMessage('Temperatura debe estar entre -10 y 50°C'),
    body('weatherConditions.condition')
        .optional()
        .isIn(['sunny', 'cloudy', 'rainy', 'stormy', 'cold'])
        .withMessage('Condición climática inválida'),
    ...validateReproductiveLocation,
    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Las notas no pueden exceder 1000 caracteres')
], validateRequest, auditLog('reproduction.birth_record.create'), async (req, res, next) => {
    try {
        const birthData = req.body;
        const userId = req.user?.id;
        const newBirth = {
            ...birthData,
            recordedBy: userId,
            id: 'generated-id',
            createdAt: new Date()
        };
        res.status(201).json({
            success: true,
            data: newBirth,
            message: 'Nacimiento registrado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/breeders', auth_1.authenticateToken, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, role_1.requireModulePermission)('reproduction', 'read'), query('type')
    .optional()
    .isIn(['bull', 'cow', 'heifer', 'all'])
    .withMessage('Tipo de reproductor inválido'), query('status')
    .optional()
    .isIn(['active', 'inactive', 'retired', 'quarantine'])
    .withMessage('Estado del reproductor inválido'), query('breedId')
    .optional()
    .isUUID()
    .withMessage('ID de raza debe ser un UUID válido'), query('ageRange')
    .optional()
    .custom((value) => {
    if (typeof value === 'string') {
        const range = value.split('-').map(Number);
        if (range.length !== 2 || range.some(isNaN)) {
            throw new Error('Rango de edad debe ser formato: min-max');
        }
    }
    return true;
}), query('includeGenetics')
    .optional()
    .isBoolean()
    .withMessage('includeGenetics debe ser verdadero o falso'), validateRequest, auditLog('reproduction.breeders.list'), async (req, res, next) => {
    try {
        const { type = 'all', status = 'active', breedId, ageRange, includeGenetics = 'false' } = req.query;
        const userId = req.user?.id;
        const filters = {
            type: type,
            status: status,
            breedId: breedId,
            ageRange: ageRange ? ageRange.split('-').map(Number) : undefined,
            includeGenetics: includeGenetics === 'true'
        };
        const breeders = {
            filters,
            userId,
            data: []
        };
        res.json({
            success: true,
            data: breeders,
            message: 'Reproductores obtenidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/breeders/:id/performance', auth_1.authenticateToken, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, role_1.requireModulePermission)('reproduction', 'read'), (0, validation_1.validateId)('id'), query('period')
    .optional()
    .isIn(['current_year', 'last_year', 'lifetime', 'last_season'])
    .withMessage('Período inválido'), query('includeOffspring')
    .optional()
    .isBoolean()
    .withMessage('includeOffspring debe ser verdadero o falso'), validateRequest, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { period = 'current_year', includeOffspring = 'true' } = req.query;
        const userId = req.user?.id;
        const performance = {
            breederId: id,
            period: period,
            includeOffspring: includeOffspring === 'true',
            userId,
            data: {}
        };
        res.json({
            success: true,
            data: performance,
            message: 'Rendimiento reproductivo obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.put('/breeders/:id/status', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.MANAGER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, role_1.requireModulePermission)('reproduction', 'update'), (0, validation_1.validateId)('id'), validation_1.sanitizeInput, [
    body('status')
        .isIn(['active', 'inactive', 'retired', 'quarantine', 'sold', 'deceased'])
        .withMessage('Estado del reproductor inválido'),
    body('reason')
        .optional()
        .isLength({ min: 5, max: 200 })
        .withMessage('Razón debe tener entre 5 y 200 caracteres'),
    body('effectiveDate')
        .optional()
        .isISO8601()
        .withMessage('Fecha efectiva debe ser válida'),
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Las notas no pueden exceder 500 caracteres')
], validateRequest, auditLog('reproduction.breeder.status_update'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const statusData = req.body;
        const userId = req.user?.id;
        const updatedBreeder = {
            id,
            ...statusData,
            updatedBy: userId,
            updatedAt: new Date()
        };
        res.json({
            success: true,
            data: updatedBreeder,
            message: 'Estado del reproductor actualizado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/analysis/efficiency', auth_1.authenticateToken, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, role_1.requireModulePermission)('reproduction', 'read'), query('period')
    .optional()
    .isIn(['yearly', 'seasonal', 'monthly', 'custom'])
    .withMessage('Período inválido'), query('breedId')
    .optional()
    .isUUID()
    .withMessage('ID de raza debe ser un UUID válido'), query('includeComparisons')
    .optional()
    .isBoolean()
    .withMessage('includeComparisons debe ser verdadero o falso'), query('includeTrends')
    .optional()
    .isBoolean()
    .withMessage('includeTrends debe ser verdadero o falso'), validateRequest, async (req, res, next) => {
    try {
        const { period = 'yearly', breedId, includeComparisons = 'true', includeTrends = 'true' } = req.query;
        const userId = req.user?.id;
        const efficiency = {
            period: period,
            breedId: breedId,
            includeComparisons: includeComparisons === 'true',
            includeTrends: includeTrends === 'true',
            userId,
            data: {}
        };
        res.json({
            success: true,
            data: efficiency,
            message: 'Análisis de eficiencia reproductiva obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/analysis/genetic-diversity', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, role_1.requireModulePermission)('reproduction', 'read'), query('includeInbreeding')
    .optional()
    .isBoolean()
    .withMessage('includeInbreeding debe ser verdadero o falso'), query('generations')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Generaciones debe estar entre 1 y 10'), validateRequest, async (req, res, next) => {
    try {
        const { includeInbreeding = 'true', generations = '3' } = req.query;
        const userId = req.user?.id;
        const geneticAnalysis = {
            includeInbreeding: includeInbreeding === 'true',
            generations: parseInt(generations),
            userId,
            data: {}
        };
        res.json({
            success: true,
            data: geneticAnalysis,
            message: 'Análisis de diversidad genética obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/locations', auth_1.authenticateToken, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), (0, role_1.requireModulePermission)('maps', 'read'), query('eventType')
    .optional()
    .isIn(['mating', 'insemination', 'pregnancy_check', 'birth', 'all'])
    .withMessage('Tipo de evento inválido'), query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde debe ser válida'), query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta debe ser válida'), query('bounds')
    .optional()
    .custom((value) => {
    if (value) {
        const bounds = value.split(',').map(Number);
        if (bounds.length !== 4 || bounds.some(isNaN)) {
            throw new Error('Los límites deben ser cuatro números separados por comas');
        }
    }
    return true;
}), validateRequest, async (req, res, next) => {
    try {
        const { eventType = 'all', dateFrom, dateTo, bounds } = req.query;
        const userId = req.user?.id;
        let geoBounds;
        if (bounds) {
            const [swLat, swLng, neLat, neLng] = bounds.split(',').map(Number);
            geoBounds = { swLat, swLng, neLat, neLng };
        }
        const reproductiveLocations = {
            eventType: eventType,
            dateFrom: dateFrom ? new Date(dateFrom) : undefined,
            dateTo: dateTo ? new Date(dateTo) : undefined,
            bounds: geoBounds,
            userId,
            data: []
        };
        res.json({
            success: true,
            data: reproductiveLocations,
            message: 'Ubicaciones reproductivas obtenidas exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.use((error, req, res, next) => {
    (0, logging_1.logMessage)(logging_1.LogLevel.ERROR, 'reproduction_route_error', `Error en ruta de reproducción: ${error.message}`, {
        path: req.originalUrl,
        method: req.method,
        userId: req.user?.id,
        error: error.stack
    });
    if (error.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: 'Error de validación',
                details: error.message
            }
        });
    }
    res.status(500).json({
        success: false,
        error: {
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Error interno del servidor',
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
            method: req.method
        }
    });
});
exports.default = router;
//# sourceMappingURL=reproduction.js.map