import { Router, Request, Response } from 'express';
import { CalendarController } from '../controllers/calendar';
import { authMiddleware } from '../middleware/auth';
import { validationMiddleware } from '../middleware/validation';
import { rateLimitMiddleware } from '../middleware/rate-limit';
import { roleMiddleware } from '../middleware/role';
import { notificationMiddleware } from '../middleware/notification';
import { dateRangeMiddleware } from '../middleware/dateRange';
import {
  createEventValidationRules,
  updateEventValidationRules,
  eventFiltersValidationRules,
  reminderValidationRules,
  vaccinationScheduleValidationRules,
  bulkScheduleValidationRules,
  reminderSettingsValidationRules,
  notificationPreferencesValidationRules,
  protocolValidationRules
} from '../validators/calendar.validators';

// Crear instancia del router
const router = Router();

// Crear instancia del controlador de calendario
const calendarController = new CalendarController();

// ============================================================================
// MIDDLEWARE GLOBAL PARA TODAS LAS RUTAS DEL CALENDARIO
// ============================================================================

// Todas las rutas del calendario requieren autenticación
router.use(authMiddleware);

// ============================================================================
// RUTAS PRINCIPALES DEL CALENDARIO
// ============================================================================

/**
 * @route   GET /calendar
 * @desc    Obtener vista principal del calendario con eventos del mes actual
 * @access  Private
 * @query   ?year=2025&month=7&view=month|week|day&timezone=America/Mexico_City
 */
router.get(
  '/',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 consultas por usuario cada 5 minutos
    message: 'Too many calendar requests'
  }),
  dateRangeMiddleware,
  eventFiltersValidationRules(),
  validationMiddleware,
  calendarController.getCalendarView
);

/**
 * @route   GET /calendar/events
 * @desc    Obtener lista de eventos con filtros avanzados
 * @access  Private
 * @query   ?startDate=2025-07-01&endDate=2025-07-31&eventTypes=vaccination,checkup&status=pending&priority=high&page=1&limit=50
 */
router.get(
  '/events',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 80, // máximo 80 consultas de eventos por usuario cada 5 minutos
    message: 'Too many event requests'
  }),
  eventFiltersValidationRules(),
  validationMiddleware,
  calendarController.getEvents
);

/**
 * @route   POST /calendar/events
 * @desc    Crear nuevo evento en el calendario
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, VETERINARIAN)
 * @body    { title: string, description?: string, eventType: string, date: string, time: string, duration: number, location: object, priority: string, bovineIds?: string[], etc. }
 */
router.post(
  '/events',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 creaciones de eventos por usuario cada 15 minutos
    message: 'Too many event creation attempts'
  }),
  notificationMiddleware, // preparar notificaciones automáticas
  createEventValidationRules(),
  validationMiddleware,
  calendarController.createEvent
);

/**
 * @route   GET /calendar/events/:id
 * @desc    Obtener detalles específicos de un evento
 * @access  Private
 * @params  id: string (UUID del evento)
 */
router.get(
  '/events/:id',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 200, // máximo 200 consultas de detalles por usuario cada 5 minutos
    message: 'Too many event detail requests'
  }),
  calendarController.getEventById
);

/**
 * @route   PUT /calendar/events/:id
 * @desc    Actualizar evento existente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, VETERINARIAN)
 * @params  id: string (UUID del evento)
 * @body    Campos a actualizar del evento
 */
router.put(
  '/events/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // máximo 50 actualizaciones de eventos por usuario cada 15 minutos
    message: 'Too many event update attempts'
  }),
  notificationMiddleware,
  updateEventValidationRules(),
  validationMiddleware,
  calendarController.updateEvent
);

/**
 * @route   DELETE /calendar/events/:id
 * @desc    Eliminar evento del calendario
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, VETERINARIAN)
 * @params  id: string (UUID del evento)
 * @body    { reason?: string, cancelRelatedReminders?: boolean }
 */
router.delete(
  '/events/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 20, // máximo 20 eliminaciones de eventos por usuario cada 30 minutos
    message: 'Too many event deletion attempts'
  }),
  calendarController.deleteEvent
);

// ============================================================================
// RUTAS DE VACUNACIÓN PROGRAMADA
// ============================================================================

/**
 * @route   GET /calendar/vaccination-schedule
 * @desc    Obtener programa completo de vacunación
 * @access  Private
 * @query   ?startDate=2025-07-01&endDate=2025-12-31&status=scheduled&bovineIds=1,2,3&vaccineType=all
 */
router.get(
  '/vaccination-schedule',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 consultas de programa de vacunación cada 10 minutos
    message: 'Too many vaccination schedule requests'
  }),
  calendarController.getVaccinationSchedule
);

/**
 * @route   POST /calendar/vaccination-schedule
 * @desc    Programar nueva vacunación individual
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineId: string, vaccineId: string, scheduledDate: string, scheduledTime: string, veterinarian: string, location: string, cost: number, notes?: string }
 */
router.post(
  '/vaccination-schedule',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 programaciones de vacunación por usuario cada 15 minutos
    message: 'Too many vaccination scheduling attempts'
  }),
  notificationMiddleware,
  vaccinationScheduleValidationRules(),
  validationMiddleware,
  calendarController.scheduleVaccination
);

/**
 * @route   POST /calendar/vaccination-schedule/bulk
 * @desc    Programar vacunación masiva para múltiples bovinos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineIds: string[], vaccineId: string, scheduledDate: string, scheduledTime: string, veterinarian: string, location: string, staggerInterval?: number }
 */
router.post(
  '/vaccination-schedule/bulk',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 5, // máximo 5 programaciones masivas por usuario cada 30 minutos
    message: 'Too many bulk vaccination scheduling attempts'
  }),
  notificationMiddleware,
  bulkScheduleValidationRules(),
  validationMiddleware,
  calendarController.bulkScheduleVaccination
);

/**
 * @route   PUT /calendar/vaccination-schedule/:id/complete
 * @desc    Marcar vacunación como completada
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @params  id: string (UUID del programa de vacunación)
 * @body    { completedDate: string, completedTime: string, batchNumber: string, sideEffects?: string[], notes?: string, generateCertificate?: boolean }
 */
router.put(
  '/vaccination-schedule/:id/complete',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // máximo 50 completaciones de vacunación por usuario cada 15 minutos
    message: 'Too many vaccination completion attempts'
  }),
  notificationMiddleware,
  calendarController.completeVaccination
);

/**
 * @route   PUT /calendar/vaccination-schedule/:id/reschedule
 * @desc    Reprogramar vacunación
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID del programa de vacunación)
 * @body    { newDate: string, newTime: string, reason: string, notifyStakeholders?: boolean }
 */
router.put(
  '/vaccination-schedule/:id/reschedule',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 reprogramaciones por usuario cada 30 minutos
    message: 'Too many vaccination rescheduling attempts'
  }),
  notificationMiddleware,
  calendarController.rescheduleVaccination
);

/**
 * @route   GET /calendar/vaccination-schedule/overdue
 * @desc    Obtener vacunaciones vencidas
 * @access  Private
 * @query   ?daysPastDue=7&includeLowPriority=false&sortBy=daysPastDue&sortOrder=desc
 */
router.get(
  '/vaccination-schedule/overdue',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 20, // máximo 20 consultas de vencidas por usuario cada 10 minutos
    message: 'Too many overdue vaccination requests'
  }),
  calendarController.getOverdueVaccinations
);

/**
 * @route   GET /calendar/vaccination-schedule/upcoming
 * @desc    Obtener vacunaciones próximas
 * @access  Private
 * @query   ?days=7&priority=all&includeReminders=true
 */
router.get(
  '/vaccination-schedule/upcoming',
  calendarController.getUpcomingVaccinations
);

// ============================================================================
// RUTAS DE RECORDATORIOS Y NOTIFICACIONES
// ============================================================================

/**
 * @route   GET /calendar/reminders
 * @desc    Obtener lista de recordatorios activos
 * @access  Private
 * @query   ?status=active&eventType=vaccination&priority=high&page=1&limit=50
 */
router.get(
  '/reminders',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 50, // máximo 50 consultas de recordatorios por usuario cada 5 minutos
    message: 'Too many reminder requests'
  }),
  calendarController.getReminders
);

/**
 * @route   POST /calendar/reminders
 * @desc    Crear nuevo recordatorio personalizado
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, VETERINARIAN)
 * @body    { eventId: string, reminderType: string, recipients: array, methods: array, customMessage?: string, isRecurring?: boolean }
 */
router.post(
  '/reminders',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 creaciones de recordatorios por usuario cada 15 minutos
    message: 'Too many reminder creation attempts'
  }),
  reminderValidationRules(),
  validationMiddleware,
  calendarController.createReminder
);

/**
 * @route   PUT /calendar/reminders/:id
 * @desc    Actualizar recordatorio existente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, VETERINARIAN)
 * @params  id: string (UUID del recordatorio)
 * @body    Campos a actualizar del recordatorio
 */
router.put(
  '/reminders/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 actualizaciones de recordatorios por usuario cada 15 minutos
    message: 'Too many reminder update attempts'
  }),
  reminderValidationRules(),
  validationMiddleware,
  calendarController.updateReminder
);

/**
 * @route   PUT /calendar/reminders/:id/dismiss
 * @desc    Descartar recordatorio
 * @access  Private
 * @params  id: string (UUID del recordatorio)
 * @body    { reason?: string }
 */
router.put(
  '/reminders/:id/dismiss',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 100, // máximo 100 descartes de recordatorios por usuario cada 10 minutos
    message: 'Too many reminder dismissal attempts'
  }),
  calendarController.dismissReminder
);

/**
 * @route   POST /calendar/reminders/:id/resend
 * @desc    Reenviar recordatorio específico
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID del recordatorio)
 * @body    { methods?: array, customMessage?: string }
 */
router.post(
  '/reminders/:id/resend',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 reenvíos por usuario cada 30 minutos
    message: 'Too many reminder resend attempts'
  }),
  calendarController.resendReminder
);

/**
 * @route   GET /calendar/reminders/settings
 * @desc    Obtener configuración de recordatorios del usuario
 * @access  Private
 */
router.get(
  '/reminders/settings',
  calendarController.getReminderSettings
);

/**
 * @route   PUT /calendar/reminders/settings
 * @desc    Actualizar configuración de recordatorios
 * @access  Private
 * @body    { defaultReminders: array, notificationPreferences: object, quietHours: object, autoReminders: boolean }
 */
router.put(
  '/reminders/settings',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 actualizaciones de configuración por usuario cada 15 minutos
    message: 'Too many reminder settings updates'
  }),
  reminderSettingsValidationRules(),
  validationMiddleware,
  calendarController.updateReminderSettings
);

// ============================================================================
// RUTAS DE PROTOCOLOS DE VACUNACIÓN
// ============================================================================

/**
 * @route   GET /calendar/vaccination-protocols
 * @desc    Obtener protocolos de vacunación disponibles
 * @access  Private
 * @query   ?category=calves&includeGovernmentRequired=true&isActive=true
 */
router.get(
  '/vaccination-protocols',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 consultas de protocolos por usuario cada 10 minutos
    message: 'Too many protocol requests'
  }),
  calendarController.getVaccinationProtocols
);

/**
 * @route   POST /calendar/vaccination-protocols
 * @desc    Crear nuevo protocolo de vacunación personalizado
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { name: string, description: string, targetCategory: string, vaccines: array, frequency: string, isGovernmentRequired: boolean }
 */
router.post(
  '/vaccination-protocols',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 5, // máximo 5 creaciones de protocolos por usuario cada 30 minutos
    message: 'Too many protocol creation attempts'
  }),
  protocolValidationRules(),
  validationMiddleware,
  calendarController.createVaccinationProtocol
);

/**
 * @route   POST /calendar/vaccination-protocols/:id/apply
 * @desc    Aplicar protocolo de vacunación a bovinos específicos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID del protocolo)
 * @body    { bovineIds: string[], startDate: string, veterinarian: string, location: string, adjustForAge?: boolean }
 */
router.post(
  '/vaccination-protocols/:id/apply',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 aplicaciones de protocolos por usuario cada 30 minutos
    message: 'Too many protocol application attempts'
  }),
  notificationMiddleware,
  calendarController.applyVaccinationProtocol
);

// ============================================================================
// RUTAS DE ESTADÍSTICAS Y ANÁLISIS
// ============================================================================

/**
 * @route   GET /calendar/stats
 * @desc    Obtener estadísticas generales del calendario
 * @access  Private
 * @query   ?period=month&includeCompleted=true&includeVaccinations=true
 */
router.get(
  '/stats',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 20, // máximo 20 consultas de estadísticas por usuario cada 10 minutos
    message: 'Too many statistics requests'
  }),
  calendarController.getCalendarStatistics
);

/**
 * @route   GET /calendar/stats/vaccination
 * @desc    Obtener estadísticas específicas de vacunación
 * @access  Private
 * @query   ?period=year&groupBy=month&includeCompliance=true&includeCosts=true
 */
router.get(
  '/stats/vaccination',
  calendarController.getVaccinationStatistics
);

/**
 * @route   GET /calendar/stats/compliance
 * @desc    Obtener métricas de cumplimiento del calendario
 * @access  Private
 * @query   ?eventType=vaccination&period=quarter&detailLevel=summary
 */
router.get(
  '/stats/compliance',
  calendarController.getComplianceMetrics
);

/**
 * @route   GET /calendar/stats/trends
 * @desc    Obtener tendencias del calendario y predicciones
 * @access  Private
 * @query   ?lookAhead=30&includeWeatherData=false&includeCostProjections=true
 */
router.get(
  '/stats/trends',
  calendarController.getCalendarTrends
);

// ============================================================================
// RUTAS DE EXPORTACIÓN E INFORMES
// ============================================================================

/**
 * @route   POST /calendar/export
 * @desc    Exportar calendario en diferentes formatos
 * @access  Private
 * @body    { format: 'ics' | 'pdf' | 'excel', dateRange: object, eventTypes: array, includeReminders: boolean }
 */
router.post(
  '/export',
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 5, // máximo 5 exportaciones por usuario cada 30 minutos
    message: 'Too many export requests'
  }),
  calendarController.exportCalendar
);

/**
 * @route   GET /calendar/export/:exportId/download
 * @desc    Descargar archivo de calendario exportado
 * @access  Private
 * @params  exportId: string (ID del proceso de exportación)
 */
router.get(
  '/export/:exportId/download',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 20, // máximo 20 descargas por usuario cada 10 minutos
    message: 'Too many download requests'
  }),
  calendarController.downloadCalendarExport
);

/**
 * @route   POST /calendar/reports/vaccination-compliance
 * @desc    Generar reporte de cumplimiento de vacunación
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { period: string, includeDetails: boolean, format: string, groupBy: string }
 */
router.post(
  '/reports/vaccination-compliance',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 reportes por usuario cada 30 minutos
    message: 'Too many report generation requests'
  }),
  calendarController.generateVaccinationComplianceReport
);

// ============================================================================
// RUTAS DE NOTIFICACIONES Y PREFERENCIAS
// ============================================================================

/**
 * @route   GET /calendar/notifications/preferences
 * @desc    Obtener preferencias de notificación del usuario
 * @access  Private
 */
router.get(
  '/notifications/preferences',
  calendarController.getNotificationPreferences
);

/**
 * @route   PUT /calendar/notifications/preferences
 * @desc    Actualizar preferencias de notificación
 * @access  Private
 * @body    { email: boolean, sms: boolean, push: boolean, whatsapp: boolean, quietHours: object, frequency: string }
 */
router.put(
  '/notifications/preferences',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 actualizaciones de preferencias por usuario cada 15 minutos
    message: 'Too many preference updates'
  }),
  notificationPreferencesValidationRules(),
  validationMiddleware,
  calendarController.updateNotificationPreferences
);

/**
 * @route   POST /calendar/notifications/test
 * @desc    Enviar notificación de prueba
 * @access  Private
 * @body    { method: string, message: string }
 */
router.post(
  '/notifications/test',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 notificaciones de prueba por usuario cada 15 minutos
    message: 'Too many test notification requests'
  }),
  calendarController.sendTestNotification
);

// ============================================================================
// RUTAS DE INTEGRACIÓN EXTERNA
// ============================================================================

/**
 * @route   GET /calendar/ics/:userId
 * @desc    Obtener calendario en formato ICS para integración externa
 * @access  Public (con token de acceso)
 * @params  userId: string (UUID del usuario)
 * @query   ?token=access_token&eventTypes=vaccination,checkup
 */
router.get(
  '/ics/:userId',
  calendarController.getICSCalendar
);

/**
 * @route   POST /calendar/webhook
 * @desc    Webhook para recibir eventos de calendarios externos
 * @access  Private (webhook authentication)
 * @body    Datos del evento externo
 */
router.post(
  '/webhook',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 webhooks por 5 minutos
    message: 'Too many webhook requests'
  }),
  calendarController.handleWebhook
);

// ============================================================================
// MANEJO DE ERRORES ESPECÍFICOS PARA RUTAS DEL CALENDARIO
// ============================================================================

/**
 * Middleware de manejo de errores específico para calendario
 */
router.use((error: any, req: Request, res: Response, next: any) => {
  // Log del error para debugging
  console.error('Calendar Route Error:', {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  // Errores específicos del calendario
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

  // Error genérico
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'INTERNAL_SERVER_ERROR'
  });
});

export default router;