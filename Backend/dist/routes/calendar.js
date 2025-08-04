"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rate_limit_1 = require("../middleware/rate-limit");
const role_1 = require("../middleware/role");
const logging_1 = require("../middleware/logging");
const router = (0, express_1.Router)();
router.use(logging_1.requestLogger);
router.use(validation_1.sanitizeInput);
router.use(auth_1.authenticateToken);
router.get('/', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('READ', 'CALENDAR'), async (req, res) => {
    try {
        const { year = 2025, month = 7, view = 'month', timezone = 'UTC' } = req.query;
        res.status(200).json({
            success: true,
            message: 'Vista de calendario obtenida exitosamente',
            data: {
                view: view,
                year: parseInt(year),
                month: parseInt(month),
                timezone: timezone,
                events: [],
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener vista del calendario',
            error: 'CALENDAR_VIEW_FAILED'
        });
    }
});
router.get('/events', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('READ', 'CALENDAR_EVENTS'), async (req, res) => {
    try {
        const { startDate, endDate, eventTypes, status, priority, page = 1, limit = 50 } = req.query;
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
                    startDate,
                    endDate,
                    eventTypes,
                    status,
                    priority
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
router.post('/events', (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'CALENDAR_EVENT'), async (req, res) => {
    try {
        const { title, description, eventType, date, time, duration, location, priority, cattleIds } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.CATTLE_CREATED, `Evento de calendario creado: ${title}`, req, {
            eventType,
            date,
            time,
            cattleIds
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
router.get('/events/:id', (0, validation_1.validateId)('id'), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, logging_1.auditTrail)('READ', 'CALENDAR_EVENT'), async (req, res) => {
    try {
        const { id } = req.params;
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
router.put('/events/:id', (0, validation_1.validateId)('id'), (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('UPDATE', 'CALENDAR_EVENT'), async (req, res) => {
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
router.delete('/events/:id', (0, validation_1.validateId)('id'), (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, logging_1.auditTrail)('DELETE', 'CALENDAR_EVENT'), async (req, res) => {
    try {
        const { id } = req.params;
        const { reason, cancelRelatedReminders } = req.body;
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
router.get('/vaccination-schedule', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.VACCINATION), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('READ', 'VACCINATION_SCHEDULE'), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Programa de vacunación obtenido exitosamente',
            data: {
                vaccinations: [],
                statistics: {
                    scheduled: 0,
                    completed: 0,
                    overdue: 0,
                    upcoming: 0
                }
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener programa de vacunación',
            error: 'VACCINATION_SCHEDULE_FAILED'
        });
    }
});
router.post('/vaccination-schedule', role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.VACCINATION), (0, validation_1.validate)('vaccination'), (0, logging_1.auditTrail)('CREATE', 'VACCINATION_SCHEDULE'), async (req, res) => {
    try {
        const { cattleId, vaccineId, scheduledDate, scheduledTime, veterinarian, location, cost, notes } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.VACCINATION_SCHEDULED, `Vacunación programada para ganado ${cattleId}`, req, {
            cattleId,
            vaccineId,
            scheduledDate,
            veterinarian
        });
        res.status(201).json({
            success: true,
            message: 'Vacunación programada exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al programar vacunación',
            error: 'VACCINATION_SCHEDULE_FAILED'
        });
    }
});
router.post('/vaccination-schedule/bulk', role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.BULK_OPERATIONS), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'BULK_VACCINATION_SCHEDULE'), async (req, res) => {
    try {
        const { cattleIds, vaccineId, scheduledDate, scheduledTime, veterinarian, location, staggerInterval } = req.body;
        res.status(201).json({
            success: true,
            message: 'Vacunación masiva programada exitosamente',
            data: {
                scheduledCount: cattleIds?.length || 0,
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error en programación masiva',
            error: 'BULK_VACCINATION_FAILED'
        });
    }
});
router.put('/vaccination-schedule/:id/complete', (0, validation_1.validateId)('id'), (0, role_1.requireModulePermission)('vaccinations', 'administer'), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.VACCINATION), (0, logging_1.auditTrail)('UPDATE', 'VACCINATION_COMPLETION'), async (req, res) => {
    try {
        const { id } = req.params;
        const { completedDate, completedTime, batchNumber, sideEffects, notes, generateCertificate } = req.body;
        (0, logging_1.logCattleEvent)(logging_1.CattleEventType.VACCINATION_ADMINISTERED, `Vacunación completada - ID: ${id}`, req, {
            scheduleId: id,
            completedDate,
            batchNumber
        });
        res.status(200).json({
            success: true,
            message: 'Vacunación marcada como completada',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al completar vacunación',
            error: 'VACCINATION_COMPLETION_FAILED'
        });
    }
});
router.put('/vaccination-schedule/:id/reschedule', (0, validation_1.validateId)('id'), role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.VACCINATION), (0, logging_1.auditTrail)('UPDATE', 'VACCINATION_RESCHEDULE'), async (req, res) => {
    try {
        const { id } = req.params;
        const { newDate, newTime, reason, notifyStakeholders } = req.body;
        res.status(200).json({
            success: true,
            message: 'Vacunación reprogramada exitosamente'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al reprogramar vacunación',
            error: 'VACCINATION_RESCHEDULE_FAILED'
        });
    }
});
router.get('/vaccination-schedule/overdue', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.VACCINATION), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('READ', 'OVERDUE_VACCINATIONS'), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Vacunaciones vencidas obtenidas exitosamente',
            data: {
                overdueVaccinations: [],
                totalOverdue: 0,
                criticalOverdue: 0
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener vacunaciones vencidas',
            error: 'OVERDUE_VACCINATIONS_FAILED'
        });
    }
});
router.get('/vaccination-schedule/upcoming', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.VACCINATION), (0, validation_1.validate)('search'), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Vacunaciones próximas obtenidas exitosamente',
            data: {
                upcomingVaccinations: [],
                totalUpcoming: 0,
                urgentUpcoming: 0
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener vacunaciones próximas',
            error: 'UPCOMING_VACCINATIONS_FAILED'
        });
    }
});
router.get('/reminders', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), (0, validation_1.validate)('search'), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Recordatorios obtenidos exitosamente',
            data: {
                reminders: [],
                activeCount: 0,
                pendingCount: 0
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener recordatorios',
            error: 'REMINDERS_FETCH_FAILED'
        });
    }
});
router.post('/reminders', (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'REMINDER'), async (req, res) => {
    try {
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
router.put('/reminders/:id', (0, validation_1.validateId)('id'), (0, auth_1.authorizeRoles)(auth_1.UserRole.OWNER, auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.VETERINARIAN, auth_1.UserRole.WORKER), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('UPDATE', 'REMINDER'), async (req, res) => {
    try {
        const { id } = req.params;
        res.status(200).json({
            success: true,
            message: 'Recordatorio actualizado exitosamente'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar recordatorio',
            error: 'REMINDER_UPDATE_FAILED'
        });
    }
});
router.put('/reminders/:id/dismiss', (0, validation_1.validateId)('id'), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, logging_1.auditTrail)('UPDATE', 'REMINDER_DISMISS'), async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        res.status(200).json({
            success: true,
            message: 'Recordatorio descartado exitosamente'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al descartar recordatorio',
            error: 'REMINDER_DISMISS_FAILED'
        });
    }
});
router.post('/reminders/:id/resend', (0, validation_1.validateId)('id'), (0, role_1.requireMinimumRole)(auth_1.UserRole.VETERINARIAN), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), async (req, res) => {
    try {
        const { id } = req.params;
        const { methods, customMessage } = req.body;
        res.status(200).json({
            success: true,
            message: 'Recordatorio reenviado exitosamente'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al reenviar recordatorio',
            error: 'REMINDER_RESEND_FAILED'
        });
    }
});
router.get('/reminders/settings', async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Configuración de recordatorios obtenida exitosamente',
            data: {
                defaultReminders: [],
                notificationPreferences: {},
                quietHours: {},
                autoReminders: true
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener configuración',
            error: 'REMINDER_SETTINGS_FAILED'
        });
    }
});
router.put('/reminders/settings', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Configuración actualizada exitosamente'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar configuración',
            error: 'REMINDER_SETTINGS_UPDATE_FAILED'
        });
    }
});
router.get('/vaccination-protocols', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.VACCINATION), (0, validation_1.validate)('search'), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Protocolos de vacunación obtenidos exitosamente',
            data: {
                protocols: [],
                categories: [],
                governmentRequired: []
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener protocolos',
            error: 'PROTOCOLS_FETCH_FAILED'
        });
    }
});
router.post('/vaccination-protocols', role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.VACCINATION), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'VACCINATION_PROTOCOL'), async (req, res) => {
    try {
        res.status(201).json({
            success: true,
            message: 'Protocolo creado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear protocolo',
            error: 'PROTOCOL_CREATION_FAILED'
        });
    }
});
router.post('/vaccination-protocols/:id/apply', (0, validation_1.validateId)('id'), role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.BULK_OPERATIONS), (0, logging_1.auditTrail)('CREATE', 'PROTOCOL_APPLICATION'), async (req, res) => {
    try {
        const { id } = req.params;
        const { cattleIds, startDate, veterinarian, location, adjustForAge } = req.body;
        res.status(200).json({
            success: true,
            message: 'Protocolo aplicado exitosamente',
            data: {
                appliedToCattle: cattleIds?.length || 0,
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al aplicar protocolo',
            error: 'PROTOCOL_APPLICATION_FAILED'
        });
    }
});
router.get('/stats', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, validation_1.validate)('search'), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Estadísticas obtenidas exitosamente',
            data: {
                totalEvents: 0,
                completedEvents: 0,
                pendingEvents: 0,
                overdueEvents: 0,
                upcomingEvents: 0,
                eventsByType: {},
                periodStats: {}
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: 'CALENDAR_STATS_FAILED'
        });
    }
});
router.get('/stats/vaccination', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Estadísticas de vacunación obtenidas exitosamente',
            data: {
                totalVaccinations: 0,
                completionRate: 0,
                complianceRate: 0,
                totalCost: 0,
                vaccinationsByType: {},
                monthlyTrends: []
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas de vacunación',
            error: 'VACCINATION_STATS_FAILED'
        });
    }
});
router.get('/stats/compliance', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Métricas de cumplimiento obtenidas exitosamente',
            data: {
                overallCompliance: 0,
                complianceByType: {},
                complianceByPeriod: {},
                improvementSuggestions: []
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener métricas de cumplimiento',
            error: 'COMPLIANCE_METRICS_FAILED'
        });
    }
});
router.get('/stats/trends', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Tendencias obtenidas exitosamente',
            data: {
                trends: {},
                predictions: {},
                recommendations: []
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener tendencias',
            error: 'CALENDAR_TRENDS_FAILED'
        });
    }
});
router.post('/export', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), (0, validation_1.validate)('search'), (0, logging_1.auditTrail)('CREATE', 'CALENDAR_EXPORT'), async (req, res) => {
    try {
        const { format, dateRange, eventTypes, includeReminders } = req.body;
        res.status(200).json({
            success: true,
            message: 'Exportación iniciada exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al exportar calendario',
            error: 'CALENDAR_EXPORT_FAILED'
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
router.post('/reports/vaccination-compliance', role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, logging_1.auditTrail)('CREATE', 'COMPLIANCE_REPORT'), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Reporte generado exitosamente',
            data: {}
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al generar reporte',
            error: 'COMPLIANCE_REPORT_FAILED'
        });
    }
});
router.get('/notifications/preferences', async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Preferencias obtenidas exitosamente',
            data: {
                email: true,
                sms: false,
                push: true,
                whatsapp: false,
                quietHours: {},
                frequency: 'daily'
            }
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener preferencias',
            error: 'NOTIFICATION_PREFERENCES_FAILED'
        });
    }
});
router.put('/notifications/preferences', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Preferencias actualizadas exitosamente'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar preferencias',
            error: 'NOTIFICATION_PREFERENCES_UPDATE_FAILED'
        });
    }
});
router.post('/notifications/test', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.EXTERNAL_API), async (req, res) => {
    try {
        const { method, message } = req.body;
        res.status(200).json({
            success: true,
            message: 'Notificación de prueba enviada exitosamente',
            data: {
                method: method,
                sentAt: new Date().toISOString()
            }
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al enviar notificación de prueba',
            error: 'TEST_NOTIFICATION_FAILED'
        });
    }
});
router.get('/ics/:userId', (0, validation_1.validateId)('userId'), async (req, res) => {
    try {
        const { userId } = req.params;
        const { token, eventTypes } = req.query;
        res.setHeader('Content-Type', 'text/calendar');
        res.setHeader('Content-Disposition', 'attachment; filename="calendar.ics"');
        const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Cattle Management System//Calendar//EN
END:VCALENDAR`;
        res.status(200).send(icsContent);
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al generar calendario ICS',
            error: 'ICS_GENERATION_FAILED'
        });
    }
});
router.post('/webhook', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.EXTERNAL_API), async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Webhook procesado exitosamente'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al procesar webhook',
            error: 'WEBHOOK_PROCESSING_FAILED'
        });
    }
});
router.use((error, req, res, next) => {
    console.error('Calendar Route Error:', {
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
    if (error.name === 'VaccinationScheduleConflictError') {
        return res.status(409).json({
            success: false,
            message: 'Conflicto en programación de vacunación',
            error: 'VACCINATION_SCHEDULE_CONFLICT',
            details: error.details
        });
    }
    if (error.name === 'InvalidDateRangeError') {
        return res.status(400).json({
            success: false,
            message: 'Rango de fechas inválido',
            error: 'INVALID_DATE_RANGE'
        });
    }
    if (error.name === 'NotificationFailureError') {
        return res.status(500).json({
            success: false,
            message: 'Error al enviar notificación',
            error: 'NOTIFICATION_FAILURE',
            details: error.details
        });
    }
    if (error.name === 'ProtocolValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Protocolo de vacunación inválido',
            error: 'PROTOCOL_VALIDATION_ERROR',
            details: error.details
        });
    }
    if (error.name === 'ReminderLimitExceededError') {
        return res.status(429).json({
            success: false,
            message: 'Límite de recordatorios excedido',
            error: 'REMINDER_LIMIT_EXCEEDED'
        });
    }
    return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
    });
});
exports.default = router;
//# sourceMappingURL=calendar.js.map