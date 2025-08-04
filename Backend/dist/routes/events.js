"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rate_limit_1 = require("../middleware/rate-limit");
const role_1 = require("../middleware/role");
const upload_1 = require("../middleware/upload");
const logging_1 = require("../middleware/logging");
const router = (0, express_1.Router)();
const cattlePhotosUpload = (0, upload_1.createUploadMiddleware)(upload_1.FileCategory.CATTLE_PHOTOS);
const veterinaryDocsUpload = (0, upload_1.createUploadMiddleware)(upload_1.FileCategory.VETERINARY_DOCS);
const generalDocsUpload = (0, upload_1.createUploadMiddleware)(upload_1.FileCategory.GENERAL_DOCS);
router.use(logging_1.requestLogger);
router.use(validation_1.sanitizeInput);
router.use(auth_1.authenticateToken);
router.get('/', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('READ', 'EVENTS'), async (req, res) => {
    try {
        const { page = 1, limit = 50, eventType, status, priority, dateFrom, dateTo, cattleId, veterinarianId, location, tags, search, sortBy = 'date', sortOrder = 'desc' } = req.query;
        res.status(200).json({
            success: true,
            message: 'Eventos obtenidos exitosamente',
            data: {
                events: [],
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: 0,
                    totalPages: 0
                },
                filters: {
                    eventType,
                    status,
                    priority,
                    dateFrom,
                    dateTo,
                    cattleId,
                    veterinarianId,
                    location,
                    tags,
                    search,
                    sortBy,
                    sortOrder
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener eventos',
            error: 'EVENTS_FETCH_FAILED'
        });
    }
});
router.post('/', (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), cattlePhotosUpload.multiple('attachments', 10), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.CATTLE_PHOTOS), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'EVENT'), async (req, res) => {
    try {
        const { title, description, eventType, date, time, duration, cattleIds, location, priority } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.CATTLE_CREATED, `Evento creado: ${title}`, req, {
            eventType,
            date,
            time,
            cattleIds,
            priority
        });
        res.status(201).json({
            success: true,
            message: 'Evento creado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear evento',
            error: 'EVENT_CREATION_FAILED'
        });
    }
});
router.get('/:id', (0, validation_1.validateId)('id'), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, logging_1.auditTrail)('READ', 'EVENT'), async (req, res) => {
    try {
        const { id } = req.params;
        const { includeAttachments, includeReminders, includeRelatedEvents } = req.query;
        res.status(200).json({
            success: true,
            message: 'Evento obtenido exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: 'Evento no encontrado',
            error: 'EVENT_NOT_FOUND'
        });
    }
});
router.put('/:id', (0, validation_1.validateId)('id'), (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), cattlePhotosUpload.multiple('attachments', 10), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.CATTLE_PHOTOS), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('UPDATE', 'EVENT'), async (req, res) => {
    try {
        const { id } = req.params;
        res.status(200).json({
            success: true,
            message: 'Evento actualizado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar evento',
            error: 'EVENT_UPDATE_FAILED'
        });
    }
});
router.delete('/:id', (0, validation_1.validateId)('id'), (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, logging_1.auditTrail)('DELETE', 'EVENT'), async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, cancelRelatedEvents, notifyStakeholders } = req.body;
        res.status(200).json({
            success: true,
            message: 'Evento eliminado exitosamente'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al eliminar evento',
            error: 'EVENT_DELETION_FAILED'
        });
    }
});
router.post('/vaccination', role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.VACCINATION), (0, validation_1.validate)('vaccination'), (0, logging_1.auditTrail)('CREATE', 'VACCINATION_EVENT'), async (req, res) => {
    try {
        const { cattleIds, vaccineType, vaccineName, dose, veterinarianId, batchNumber, manufacturer, nextDueDate, cost } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.VACCINATION_ADMINISTERED, `Vacunación administrada: ${vaccineName}`, req, {
            cattleIds,
            vaccineType,
            vaccineName,
            dose,
            veterinarianId
        });
        res.status(201).json({
            success: true,
            message: 'Evento de vacunación creado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear evento de vacunación',
            error: 'VACCINATION_EVENT_FAILED'
        });
    }
});
router.post('/illness', (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.HEALTH), veterinaryDocsUpload.multiple('medicalPhotos', 5), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.VETERINARY_DOCS), (0, validation_1.validate)('illness'), (0, logging_1.auditTrail)('CREATE', 'ILLNESS_EVENT'), async (req, res) => {
    try {
        const { cattleIds, diseaseName, symptoms, severity, diagnosisMethod, veterinarianId, treatment, isContagious } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.ILLNESS_DIAGNOSED, `Enfermedad diagnosticada: ${diseaseName}`, req, {
            cattleIds,
            diseaseName,
            symptoms,
            severity,
            isContagious
        });
        res.status(201).json({
            success: true,
            message: 'Evento de enfermedad registrado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al registrar enfermedad',
            error: 'ILLNESS_EVENT_FAILED'
        });
    }
});
router.post('/treatment', role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.HEALTH), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'TREATMENT_EVENT'), async (req, res) => {
    try {
        const { cattleIds, treatmentType, medications, dosage, administrationRoute, frequency, duration, veterinarianId, followUpDate } = req.body;
        (0, logging_1.logVeterinaryActivity)('treatment', cattleIds.join(', '), `Tratamiento: ${treatmentType}`, req);
        res.status(201).json({
            success: true,
            message: 'Evento de tratamiento creado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear tratamiento',
            error: 'TREATMENT_EVENT_FAILED'
        });
    }
});
router.post('/emergency', (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.WORKER), rate_limit_1.veterinaryPriorityLimit, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.HEALTH), cattlePhotosUpload.multiple('emergencyPhotos', 10), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.CATTLE_PHOTOS), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'EMERGENCY_EVENT'), async (req, res) => {
    try {
        const { cattleIds, emergencyType, description, severity, immediateActions, veterinarianId, urgentCare } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.ILLNESS_DIAGNOSED, `Emergencia médica: ${emergencyType}`, req, {
            cattleIds,
            emergencyType,
            severity,
            urgentCare
        });
        res.status(201).json({
            success: true,
            message: 'Emergencia médica registrada exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al registrar emergencia',
            error: 'EMERGENCY_EVENT_FAILED'
        });
    }
});
router.post('/checkup', role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.HEALTH), (0, logging_1.auditTrail)('CREATE', 'CHECKUP_EVENT'), async (req, res) => {
    try {
        const { cattleIds, checkupType, veterinarianId, vitalSigns, findings, recommendations, nextCheckupDate } = req.body;
        (0, logging_1.logVeterinaryActivity)('checkup', cattleIds.join(', '), `Chequeo: ${checkupType}`, req);
        res.status(201).json({
            success: true,
            message: 'Chequeo médico registrado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al registrar chequeo',
            error: 'CHECKUP_EVENT_FAILED'
        });
    }
});
router.post('/breeding', role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'BREEDING_EVENT'), async (req, res) => {
    try {
        const { cattleId, breedingType, maleId, semenSource, technicianId, expectedCalvingDate, artificialInsemination } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.MATING_RECORDED, `Evento reproductivo: ${breedingType}`, req, {
            cattleId,
            breedingType,
            artificialInsemination,
            expectedCalvingDate
        });
        res.status(201).json({
            success: true,
            message: 'Evento reproductivo registrado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al registrar evento reproductivo',
            error: 'BREEDING_EVENT_FAILED'
        });
    }
});
router.post('/pregnancy-check', role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.HEALTH), cattlePhotosUpload.multiple('ultrasonographyImages', 5), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.CATTLE_PHOTOS), (0, logging_1.auditTrail)('CREATE', 'PREGNANCY_CHECK_EVENT'), async (req, res) => {
    try {
        const { cattleId, checkMethod, result, gestationDays, expectedCalvingDate, veterinarianId, ultrasonography } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.PREGNANCY_DETECTED, `Chequeo de preñez: ${result}`, req, {
            cattleId,
            checkMethod,
            result,
            gestationDays
        });
        res.status(201).json({
            success: true,
            message: 'Chequeo de preñez registrado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al registrar chequeo de preñez',
            error: 'PREGNANCY_CHECK_FAILED'
        });
    }
});
router.post('/birth', (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), cattlePhotosUpload.multiple('birthPhotos', 10), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.CATTLE_PHOTOS), (0, logging_1.auditTrail)('CREATE', 'BIRTH_EVENT'), async (req, res) => {
    try {
        const { motherId, calvingDifficulty, assistanceRequired, calfGender, calfWeight, calfHealth, complications, veterinarianId } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.BIRTH_RECORDED, `Parto registrado - Madre: ${motherId}`, req, {
            motherId,
            calfGender,
            calfWeight,
            calvingDifficulty,
            assistanceRequired
        });
        res.status(201).json({
            success: true,
            message: 'Parto registrado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al registrar parto',
            error: 'BIRTH_EVENT_FAILED'
        });
    }
});
router.post('/weaning', (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, logging_1.auditTrail)('CREATE', 'WEANING_EVENT'), async (req, res) => {
    try {
        const { calfIds, weaningMethod, weaningWeight, ageAtWeaning, weaningLocation, stressIndicators } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.WEANING_RECORDED, `Destete registrado - ${calfIds.length} terneros`, req, {
            calfIds,
            weaningMethod,
            ageAtWeaning
        });
        res.status(201).json({
            success: true,
            message: 'Destete registrado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al registrar destete',
            error: 'WEANING_EVENT_FAILED'
        });
    }
});
router.post('/management', (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'MANAGEMENT_EVENT'), async (req, res) => {
    try {
        const { cattleIds, managementType, equipment, materials, duration, cost, laborHours, performedBy } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.CATTLE_MOVED, `Manejo: ${managementType}`, req, {
            cattleIds,
            managementType,
            performedBy,
            cost
        });
        res.status(201).json({
            success: true,
            message: 'Evento de manejo registrado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al registrar manejo',
            error: 'MANAGEMENT_EVENT_FAILED'
        });
    }
});
router.post('/weighing', (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, logging_1.auditTrail)('CREATE', 'WEIGHING_EVENT'), async (req, res) => {
    try {
        const { cattleIds, weights, weighingMethod, equipment, bodyConditionScore, measurements } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.WEIGHT_RECORDED, `Pesaje registrado - ${cattleIds.length} animales`, req, {
            cattleIds,
            weighingMethod,
            equipment
        });
        res.status(201).json({
            success: true,
            message: 'Pesaje registrado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al registrar pesaje',
            error: 'WEIGHING_EVENT_FAILED'
        });
    }
});
router.post('/transfer', (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, logging_1.auditTrail)('CREATE', 'TRANSFER_EVENT'), async (req, res) => {
    try {
        const { cattleIds, fromLocation, toLocation, transferReason, transportMethod, distance, duration } = req.body;
        if (cattleIds && fromLocation && toLocation) {
            cattleIds.forEach((cattleId) => {
                (0, logging_1.logLocationChange)(cattleId, fromLocation, toLocation, req, transferReason);
            });
        }
        res.status(201).json({
            success: true,
            message: 'Traslado registrado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al registrar traslado',
            error: 'TRANSFER_EVENT_FAILED'
        });
    }
});
router.post('/feeding', (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, logging_1.auditTrail)('CREATE', 'FEEDING_EVENT'), async (req, res) => {
    try {
        const { cattleIds, feedType, quantity, feedingMethod, nutritionalInfo, cost, supplier } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.FEED_CONSUMPTION_RECORDED, `Alimentación: ${feedType} - ${quantity}kg`, req, {
            cattleIds,
            feedType,
            quantity,
            feedingMethod
        });
        res.status(201).json({
            success: true,
            message: 'Alimentación registrada exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al registrar alimentación',
            error: 'FEEDING_EVENT_FAILED'
        });
    }
});
router.post('/schedule', (0, role_1.requireMinimumRole)(auth_1.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'SCHEDULED_EVENT'), async (req, res) => {
    try {
        const { eventTemplate, scheduledDate, scheduledTime, autoReminders, reminderIntervals, notificationSettings } = req.body;
        res.status(201).json({
            success: true,
            message: 'Evento programado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al programar evento',
            error: 'EVENT_SCHEDULE_FAILED'
        });
    }
});
router.post('/recurring', (0, role_1.requireMinimumRole)(auth_1.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.BULK_OPERATIONS), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'RECURRING_EVENTS'), async (req, res) => {
    try {
        const { eventTemplate, recurringPattern, startDate, endDate, occurrences, skipWeekends, adjustForHolidays } = req.body;
        res.status(201).json({
            success: true,
            message: 'Serie de eventos recurrentes creada exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear eventos recurrentes',
            error: 'RECURRING_EVENTS_FAILED'
        });
    }
});
router.put('/:id/reschedule', (0, validation_1.validateId)('id'), (0, role_1.requireMinimumRole)(auth_1.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, logging_1.auditTrail)('UPDATE', 'EVENT_RESCHEDULE'), async (req, res) => {
    try {
        const { id } = req.params;
        const { newDate, newTime, reason, notifyStakeholders, updateRecurringSeries } = req.body;
        res.status(200).json({
            success: true,
            message: 'Evento reprogramado exitosamente'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al reprogramar evento',
            error: 'EVENT_RESCHEDULE_FAILED'
        });
    }
});
router.put('/:id/complete', (0, validation_1.validateId)('id'), (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.WORKER, auth_1.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), cattlePhotosUpload.multiple('completionPhotos', 10), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.CATTLE_PHOTOS), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('UPDATE', 'EVENT_COMPLETION'), async (req, res) => {
    try {
        const { id } = req.params;
        const { completionNotes, actualCost, actualDuration, results, complications, followUpRequired, qualityRating } = req.body;
        res.status(200).json({
            success: true,
            message: 'Evento completado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al completar evento',
            error: 'EVENT_COMPLETION_FAILED'
        });
    }
});
router.put('/:id/cancel', (0, validation_1.validateId)('id'), (0, role_1.requireMinimumRole)(auth_1.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, logging_1.auditTrail)('UPDATE', 'EVENT_CANCELLATION'), async (req, res) => {
    try {
        const { id } = req.params;
        const { cancellationReason, notifyStakeholders, refundRequired, cancelRecurringSeries } = req.body;
        res.status(200).json({
            success: true,
            message: 'Evento cancelado exitosamente'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al cancelar evento',
            error: 'EVENT_CANCELLATION_FAILED'
        });
    }
});
router.put('/:id/start', (0, validation_1.validateId)('id'), (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.WORKER, auth_1.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, logging_1.auditTrail)('UPDATE', 'EVENT_START'), async (req, res) => {
    try {
        const { id } = req.params;
        const { actualStartTime, attendees, equipment, initialNotes } = req.body;
        res.status(200).json({
            success: true,
            message: 'Evento iniciado exitosamente'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al iniciar evento',
            error: 'EVENT_START_FAILED'
        });
    }
});
router.post('/bulk-create', (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.BULK_OPERATIONS), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'BULK_EVENTS'), async (req, res) => {
    try {
        const { events, applyToAllCattle, staggerTiming, intervalMinutes } = req.body;
        res.status(201).json({
            success: true,
            message: 'Eventos creados masivamente exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error en creación masiva',
            error: 'BULK_CREATE_FAILED'
        });
    }
});
router.put('/bulk-update', (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.BULK_OPERATIONS), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('UPDATE', 'BULK_EVENTS'), async (req, res) => {
    try {
        const { eventIds, updates, updateType } = req.body;
        res.status(200).json({
            success: true,
            message: 'Eventos actualizados masivamente exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error en actualización masiva',
            error: 'BULK_UPDATE_FAILED'
        });
    }
});
router.put('/bulk-complete', (0, role_1.requireMinimumRole)(auth_1.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.BULK_OPERATIONS), (0, logging_1.auditTrail)('UPDATE', 'BULK_EVENT_COMPLETION'), async (req, res) => {
    try {
        const { eventIds, completionData, batchNotes } = req.body;
        res.status(200).json({
            success: true,
            message: 'Eventos completados masivamente exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error en completar masivamente',
            error: 'BULK_COMPLETE_FAILED'
        });
    }
});
router.post('/:id/attachments', (0, validation_1.validateId)('id'), (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.WORKER, auth_1.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), generalDocsUpload.multiple('files', 15), (0, upload_1.processUploadedFiles)(upload_1.FileCategory.GENERAL_DOCS), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'EVENT_ATTACHMENTS'), async (req, res) => {
    try {
        const { id } = req.params;
        const processedFiles = req.processedFiles;
        res.status(201).json({
            success: true,
            message: 'Archivos adjuntos subidos exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al subir archivos',
            error: 'ATTACHMENT_UPLOAD_FAILED'
        });
    }
});
router.get('/:id/attachments/:attachmentId', (0, validation_1.validateId)('id'), (0, validation_1.validateId)('attachmentId'), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), async (req, res) => {
    try {
        const { id, attachmentId } = req.params;
        const { download, size } = req.query;
        res.status(200).json({
            success: true,
            message: 'Archivo obtenido exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: 'Archivo no encontrado',
            error: 'ATTACHMENT_NOT_FOUND'
        });
    }
});
router.delete('/:id/attachments/:attachmentId', (0, validation_1.validateId)('id'), (0, validation_1.validateId)('attachmentId'), (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.WORKER, auth_1.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), (0, logging_1.auditTrail)('DELETE', 'EVENT_ATTACHMENT'), async (req, res) => {
    try {
        const { id, attachmentId } = req.params;
        res.status(200).json({
            success: true,
            message: 'Archivo eliminado exitosamente'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al eliminar archivo',
            error: 'ATTACHMENT_DELETE_FAILED'
        });
    }
});
router.get('/timeline', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, validation_1.validate)('search'), async (req, res) => {
    try {
        const { cattleId, dateFrom, dateTo, eventTypes, groupBy, includeUpcoming } = req.query;
        res.status(200).json({
            success: true,
            message: 'Timeline obtenida exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener timeline',
            error: 'TIMELINE_FETCH_FAILED'
        });
    }
});
router.get('/history/:cattleId', (0, validation_1.validateId)('cattleId'), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), async (req, res) => {
    try {
        const { cattleId } = req.params;
        const { includeRelatedEvents, groupByType, includeAttachments } = req.query;
        res.status(200).json({
            success: true,
            message: 'Historial obtenido exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener historial',
            error: 'HISTORY_FETCH_FAILED'
        });
    }
});
router.get('/calendar', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), async (req, res) => {
    try {
        const { year = 2025, month = 7, view = 'month', eventTypes = 'all', includeCompleted = false } = req.query;
        res.status(200).json({
            success: true,
            message: 'Calendario obtenido exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener calendario',
            error: 'CALENDAR_FETCH_FAILED'
        });
    }
});
router.get('/statistics', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), async (req, res) => {
    try {
        const { period = '30d', eventTypes = 'all', groupBy = 'type', includeComparison = false } = req.query;
        res.status(200).json({
            success: true,
            message: 'Estadísticas obtenidas exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: 'STATISTICS_FETCH_FAILED'
        });
    }
});
router.get('/analytics/trends', (0, role_1.requireMinimumRole)(auth_1.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), async (req, res) => {
    try {
        const { period = '1y', predictiveAnalysis = false, includeSeasonality = false, eventTypes } = req.query;
        res.status(200).json({
            success: true,
            message: 'Análisis de tendencias obtenido exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en análisis de tendencias',
            error: 'TRENDS_ANALYSIS_FAILED'
        });
    }
});
router.get('/analytics/patterns', (0, role_1.requireMinimumRole)(auth_1.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), async (req, res) => {
    try {
        const { analysisType = 'temporal', machineLearning = false, correlations = false } = req.query;
        res.status(200).json({
            success: true,
            message: 'Análisis de patrones obtenido exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error en análisis de patrones',
            error: 'PATTERNS_ANALYSIS_FAILED'
        });
    }
});
router.post('/export', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'EVENTS_EXPORT'), async (req, res) => {
    try {
        const { format, filters, fields, includeAttachments } = req.body;
        res.status(200).json({
            success: true,
            message: 'Exportación iniciada exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al exportar eventos',
            error: 'EVENTS_EXPORT_FAILED'
        });
    }
});
router.get('/export/:exportId/download', (0, validation_1.validateId)('exportId'), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), async (req, res) => {
    try {
        const { exportId } = req.params;
        res.status(200).json({
            success: true,
            message: 'Archivo listo para descarga',
            data: {}
        });
    }
    catch (error) {
        res.status(404).json({
            success: false,
            message: 'Archivo de exportación no encontrado',
            error: 'EXPORT_FILE_NOT_FOUND'
        });
    }
});
router.post('/reports/health-summary', role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, logging_1.auditTrail)('CREATE', 'HEALTH_REPORT'), async (req, res) => {
    try {
        const { period, cattleIds, includeCharts, format } = req.body;
        res.status(200).json({
            success: true,
            message: 'Reporte de salud generado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al generar reporte de salud',
            error: 'HEALTH_REPORT_FAILED'
        });
    }
});
router.get('/upcoming', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), async (req, res) => {
    try {
        const { days = 7, priority, includeOverdue = false, sortBy = 'date', limitPerType = 10 } = req.query;
        res.status(200).json({
            success: true,
            message: 'Eventos próximos obtenidos exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener eventos próximos',
            error: 'UPCOMING_EVENTS_FAILED'
        });
    }
});
router.get('/overdue', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), async (req, res) => {
    try {
        const { daysPastDue = 30, includeEmergencies = true, sortBy = 'priority', groupByType = false } = req.query;
        res.status(200).json({
            success: true,
            message: 'Eventos vencidos obtenidos exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener eventos vencidos',
            error: 'OVERDUE_EVENTS_FAILED'
        });
    }
});
router.post('/:id/reminder', (0, validation_1.validateId)('id'), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, logging_1.auditTrail)('CREATE', 'EVENT_REMINDER'), async (req, res) => {
    try {
        const { id } = req.params;
        const { reminderTime, message, recipients, methods } = req.body;
        res.status(201).json({
            success: true,
            message: 'Recordatorio creado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear recordatorio',
            error: 'REMINDER_CREATION_FAILED'
        });
    }
});
router.use((error, req, res, next) => {
    console.error('Events Route Error:', {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
    if (error.name === 'EventNotFoundError') {
        return res.status(404).json({
            success: false,
            message: 'Evento no encontrado',
            error: 'EVENT_NOT_FOUND'
        });
    }
    if (error.name === 'EventConflictError') {
        return res.status(409).json({
            success: false,
            message: 'Conflicto de programación de eventos',
            error: 'EVENT_CONFLICT',
            details: error.details
        });
    }
    if (error.name === 'InvalidEventTypeError') {
        return res.status(400).json({
            success: false,
            message: 'Tipo de evento inválido',
            error: 'INVALID_EVENT_TYPE'
        });
    }
    if (error.name === 'EventCompletionError') {
        return res.status(400).json({
            success: false,
            message: 'Error al completar evento',
            error: 'EVENT_COMPLETION_ERROR',
            details: error.details
        });
    }
    if (error.name === 'RecurringEventError') {
        return res.status(400).json({
            success: false,
            message: 'Error en configuración de eventos recurrentes',
            error: 'RECURRING_EVENT_ERROR',
            details: error.details
        });
    }
    if (error.name === 'AttachmentUploadError') {
        return res.status(400).json({
            success: false,
            message: 'Error al subir archivo adjunto',
            error: 'ATTACHMENT_UPLOAD_ERROR',
            details: error.details
        });
    }
    if (error.name === 'EmergencyProtocolError') {
        return res.status(500).json({
            success: false,
            message: 'Error en protocolo de emergencia',
            error: 'EMERGENCY_PROTOCOL_ERROR',
            details: error.details
        });
    }
    if (error.name === 'BulkOperationError') {
        return res.status(400).json({
            success: false,
            message: 'Error en operación masiva de eventos',
            error: 'BULK_OPERATION_ERROR',
            details: error.details
        });
    }
    if (error.name === 'VeterinaryAccessError') {
        return res.status(403).json({
            success: false,
            message: 'Se requiere acceso veterinario para esta operación',
            error: 'VETERINARY_ACCESS_REQUIRED'
        });
    }
    if (error.name === 'InvalidLocationError') {
        return res.status(400).json({
            success: false,
            message: 'Datos de ubicación GPS inválidos',
            error: 'INVALID_LOCATION_DATA'
        });
    }
    if (error.name === 'NotificationError') {
        return res.status(500).json({
            success: false,
            message: 'Error al enviar notificaciones',
            error: 'NOTIFICATION_FAILED',
            details: error.details
        });
    }
    if (error.name === 'WeatherDataError') {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener datos meteorológicos',
            error: 'WEATHER_DATA_FAILED'
        });
    }
    if (error.code && error.code.startsWith('LIMIT_')) {
        return res.status(400).json({
            success: false,
            message: 'Error en carga de archivos',
            error: 'FILE_UPLOAD_ERROR',
            details: error.message
        });
    }
    return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
    });
});
router.use(upload_1.handleUploadErrors);
exports.default = router;
//# sourceMappingURL=events.js.map