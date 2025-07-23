import { Router, Request, Response } from 'express';
import { EventsController } from '../controllers/events.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { geoLocationMiddleware } from '../middleware/geoLocation.middleware';
import { notificationMiddleware } from '../middleware/notification.middleware';
import { eventTrackingMiddleware } from '../middleware/eventTracking.middleware';
import { weatherDataMiddleware } from '../middleware/weatherData.middleware';
import {
  createEventValidationRules,
  updateEventValidationRules,
  eventSearchValidationRules,
  scheduleEventValidationRules,
  bulkEventValidationRules,
  recurringEventValidationRules,
  eventAttachmentValidationRules,
  eventCompletionValidationRules,
  eventTimelineValidationRules,
  emergencyEventValidationRules,
  reproductiveEventValidationRules,
  treatmentEventValidationRules,
  managementEventValidationRules
} from '../validators/events.validators';

// Crear instancia del router
const router = Router();

// Crear instancia del controlador de eventos
const eventsController = new EventsController();

// ============================================================================
// MIDDLEWARE GLOBAL PARA TODAS LAS RUTAS DE EVENTOS
// ============================================================================

// Todas las rutas de eventos requieren autenticación
router.use(authMiddleware);

// Middleware para tracking de eventos del sistema
router.use(eventTrackingMiddleware);

// ============================================================================
// RUTAS CRUD BÁSICAS DE EVENTOS
// ============================================================================

/**
 * @route   GET /events
 * @desc    Obtener lista paginada de eventos con filtros avanzados
 * @access  Private
 * @query   ?page=1&limit=50&eventType=vaccination&status=pending&priority=high&dateFrom=2025-07-01&dateTo=2025-07-31&bovineId=123&veterinarianId=456&location=corral-a&tags=routine,preventive&search=vacuna&sortBy=date&sortOrder=desc
 */
router.get(
  '/',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 consultas por usuario cada 5 minutos
    message: 'Too many event requests'
  }),
  eventSearchValidationRules(),
  validationMiddleware,
  eventsController.getEvents
);

/**
 * @route   POST /events
 * @desc    Crear nuevo evento en el sistema
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, VETERINARIAN)
 * @body    { title: string, description?: string, eventType: string, date: string, time: string, duration?: number, bovineIds: string[], location: object, priority: string, etc. }
 */
router.post(
  '/',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 creaciones de eventos por usuario cada 15 minutos
    message: 'Too many event creation attempts'
  }),
  uploadMiddleware.array('attachments', 10), // máximo 10 archivos adjuntos
  geoLocationMiddleware, // validar y procesar ubicación GPS
  weatherDataMiddleware, // obtener datos meteorológicos automáticamente
  notificationMiddleware, // preparar notificaciones automáticas
  createEventValidationRules(),
  validationMiddleware,
  eventsController.createEvent
);

/**
 * @route   GET /events/:id
 * @desc    Obtener detalles específicos de un evento por ID
 * @access  Private
 * @params  id: string (UUID del evento)
 * @query   ?includeAttachments=true&includeReminders=true&includeRelatedEvents=true
 */
router.get(
  '/:id',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 200, // máximo 200 consultas por usuario cada 5 minutos
    message: 'Too many event detail requests'
  }),
  eventsController.getEventById
);

/**
 * @route   PUT /events/:id
 * @desc    Actualizar evento existente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, VETERINARIAN)
 * @params  id: string (UUID del evento)
 * @body    Campos a actualizar del evento
 */
router.put(
  '/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 50, // máximo 50 actualizaciones por usuario cada 15 minutos
    message: 'Too many event update attempts'
  }),
  uploadMiddleware.array('attachments', 10),
  geoLocationMiddleware,
  notificationMiddleware,
  updateEventValidationRules(),
  validationMiddleware,
  eventsController.updateEvent
);

/**
 * @route   DELETE /events/:id
 * @desc    Eliminar evento del sistema (soft delete)
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @params  id: string (UUID del evento)
 * @body    { reason?: string, cancelRelatedEvents?: boolean, notifyStakeholders?: boolean }
 */
router.delete(
  '/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 20, // máximo 20 eliminaciones por usuario cada 30 minutos
    message: 'Too many event deletion attempts'
  }),
  notificationMiddleware,
  eventsController.deleteEvent
);

// ============================================================================
// EVENTOS DE SALUD Y MEDICINA VETERINARIA
// ============================================================================

/**
 * @route   POST /events/vaccination
 * @desc    Crear evento de vacunación específico
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineIds: string[], vaccineType: string, vaccineName: string, dose: string, veterinarianId: string, batchNumber: string, manufacturer: string, nextDueDate?: string, cost?: number }
 */
router.post(
  '/vaccination',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 vacunaciones por usuario cada 15 minutos
    message: 'Too many vaccination events'
  }),
  geoLocationMiddleware,
  notificationMiddleware,
  eventsController.createVaccinationEvent
);

/**
 * @route   POST /events/illness
 * @desc    Registrar evento de enfermedad o diagnóstico
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @body    { bovineIds: string[], diseaseName: string, symptoms: string[], severity: string, diagnosisMethod: string, veterinarianId: string, treatment?: object, isContagious?: boolean }
 */
router.post(
  '/illness',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 20, // máximo 20 reportes de enfermedad por usuario cada 10 minutos
    message: 'Too many illness reports'
  }),
  uploadMiddleware.array('medicalPhotos', 5),
  geoLocationMiddleware,
  notificationMiddleware,
  eventsController.createIllnessEvent
);

/**
 * @route   POST /events/treatment
 * @desc    Registrar evento de tratamiento médico
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineIds: string[], treatmentType: string, medications: array, dosage: string, administrationRoute: string, frequency: string, duration: number, veterinarianId: string, followUpDate?: string }
 */
router.post(
  '/treatment',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 tratamientos por usuario cada 15 minutos
    message: 'Too many treatment events'
  }),
  geoLocationMiddleware,
  treatmentEventValidationRules(),
  validationMiddleware,
  eventsController.createTreatmentEvent
);

/**
 * @route   POST /events/emergency
 * @desc    Registrar evento de emergencia médica
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @body    { bovineIds: string[], emergencyType: string, description: string, severity: string, immediateActions: string[], veterinarianId?: string, urgentCare: boolean }
 */
router.post(
  '/emergency',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 15, // máximo 15 emergencias por usuario cada 5 minutos
    message: 'Too many emergency reports'
  }),
  uploadMiddleware.array('emergencyPhotos', 10),
  geoLocationMiddleware,
  notificationMiddleware, // notificaciones inmediatas para emergencias
  emergencyEventValidationRules(),
  validationMiddleware,
  eventsController.createEmergencyEvent
);

/**
 * @route   POST /events/checkup
 * @desc    Registrar evento de chequeo médico rutinario
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineIds: string[], checkupType: string, veterinarianId: string, vitalSigns?: object, findings: string[], recommendations: string[], nextCheckupDate?: string }
 */
router.post(
  '/checkup',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 chequeos por usuario cada 15 minutos
    message: 'Too many checkup events'
  }),
  geoLocationMiddleware,
  eventsController.createCheckupEvent
);

// ============================================================================
// EVENTOS REPRODUCTIVOS
// ============================================================================

/**
 * @route   POST /events/breeding
 * @desc    Registrar evento reproductivo (monta, inseminación, etc.)
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineId: string, breedingType: string, maleId?: string, semenSource?: string, technicianId: string, expectedCalvingDate?: string, artificialInsemination?: boolean }
 */
router.post(
  '/breeding',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 eventos reproductivos por usuario cada 15 minutos
    message: 'Too many breeding events'
  }),
  geoLocationMiddleware,
  reproductiveEventValidationRules(),
  validationMiddleware,
  eventsController.createBreedingEvent
);

/**
 * @route   POST /events/pregnancy-check
 * @desc    Registrar chequeo de preñez
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineId: string, checkMethod: string, result: string, gestationDays?: number, expectedCalvingDate?: string, veterinarianId: string, ultrasonography?: boolean }
 */
router.post(
  '/pregnancy-check',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 chequeos de preñez por usuario cada 15 minutos
    message: 'Too many pregnancy check events'
  }),
  uploadMiddleware.array('ultrasonographyImages', 5),
  geoLocationMiddleware,
  eventsController.createPregnancyCheckEvent
);

/**
 * @route   POST /events/birth
 * @desc    Registrar evento de parto
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @body    { motherId: string, calvingDifficulty: string, assistanceRequired: boolean, calfGender: string, calfWeight?: number, calfHealth: string, complications?: string[], veterinarianId?: string }
 */
router.post(
  '/birth',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 15, // máximo 15 partos por usuario cada 10 minutos
    message: 'Too many birth events'
  }),
  uploadMiddleware.array('birthPhotos', 10),
  geoLocationMiddleware,
  notificationMiddleware,
  eventsController.createBirthEvent
);

/**
 * @route   POST /events/weaning
 * @desc    Registrar evento de destete
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER)
 * @body    { calfIds: string[], weaningMethod: string, weaningWeight?: number, ageAtWeaning: number, weaningLocation: object, stress_indicators?: string[] }
 */
router.post(
  '/weaning',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 10, // máximo 10 destetes por usuario cada 20 minutos
    message: 'Too many weaning events'
  }),
  geoLocationMiddleware,
  eventsController.createWeaningEvent
);

// ============================================================================
// EVENTOS DE MANEJO Y OPERACIONES
// ============================================================================

/**
 * @route   POST /events/management
 * @desc    Registrar evento de manejo general
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER)
 * @body    { bovineIds: string[], managementType: string, equipment?: string[], materials?: string[], duration?: number, cost?: number, laborHours?: number, performedBy: string }
 */
router.post(
  '/management',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 eventos de manejo por usuario cada 15 minutos
    message: 'Too many management events'
  }),
  geoLocationMiddleware,
  managementEventValidationRules(),
  validationMiddleware,
  eventsController.createManagementEvent
);

/**
 * @route   POST /events/weighing
 * @desc    Registrar evento de pesaje
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER)
 * @body    { bovineIds: string[], weights: array, weighingMethod: string, equipment: string, bodyConditionScore?: number, measurements?: object }
 */
router.post(
  '/weighing',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 25, // máximo 25 pesajes por usuario cada 10 minutos
    message: 'Too many weighing events'
  }),
  geoLocationMiddleware,
  eventsController.createWeighingEvent
);

/**
 * @route   POST /events/transfer
 * @desc    Registrar evento de traslado o movimiento
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER)
 * @body    { bovineIds: string[], fromLocation: object, toLocation: object, transferReason: string, transportMethod?: string, distance?: number, duration?: number }
 */
router.post(
  '/transfer',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 traslados por usuario cada 15 minutos
    message: 'Too many transfer events'
  }),
  geoLocationMiddleware,
  notificationMiddleware,
  eventsController.createTransferEvent
);

/**
 * @route   POST /events/feeding
 * @desc    Registrar evento de alimentación o nutrición
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER)
 * @body    { bovineIds?: string[], feedType: string, quantity: number, feedingMethod: string, nutritionalInfo?: object, cost?: number, supplier?: string }
 */
router.post(
  '/feeding',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 40, // máximo 40 eventos de alimentación por usuario cada 10 minutos
    message: 'Too many feeding events'
  }),
  geoLocationMiddleware,
  eventsController.createFeedingEvent
);

// ============================================================================
// EVENTOS PROGRAMADOS Y RECURRENTES
// ============================================================================

/**
 * @route   POST /events/schedule
 * @desc    Programar evento futuro
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { eventTemplate: object, scheduledDate: string, scheduledTime: string, autoReminders: boolean, reminderIntervals: array, notificationSettings: object }
 */
router.post(
  '/schedule',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 programaciones por usuario cada 15 minutos
    message: 'Too many event scheduling attempts'
  }),
  scheduleEventValidationRules(),
  validationMiddleware,
  eventsController.scheduleEvent
);

/**
 * @route   POST /events/recurring
 * @desc    Crear serie de eventos recurrentes
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { eventTemplate: object, recurringPattern: object, startDate: string, endDate?: string, occurrences?: number, skipWeekends?: boolean, adjustForHolidays?: boolean }
 */
router.post(
  '/recurring',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 series recurrentes por usuario cada 30 minutos
    message: 'Too many recurring event creations'
  }),
  recurringEventValidationRules(),
  validationMiddleware,
  eventsController.createRecurringEvents
);

/**
 * @route   PUT /events/:id/reschedule
 * @desc    Reprogramar evento existente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID del evento)
 * @body    { newDate: string, newTime: string, reason: string, notifyStakeholders?: boolean, updateRecurringSeries?: boolean }
 */
router.put(
  '/:id/reschedule',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 reprogramaciones por usuario cada 20 minutos
    message: 'Too many reschedule attempts'
  }),
  notificationMiddleware,
  eventsController.rescheduleEvent
);

// ============================================================================
// COMPLETAR Y FINALIZAR EVENTOS
// ============================================================================

/**
 * @route   PUT /events/:id/complete
 * @desc    Marcar evento como completado
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, VETERINARIAN)
 * @params  id: string (UUID del evento)
 * @body    { completionNotes?: string, actualCost?: number, actualDuration?: number, results?: object, complications?: string[], followUpRequired?: boolean, qualityRating?: number }
 */
router.put(
  '/:id/complete',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 completaciones por usuario cada 10 minutos
    message: 'Too many event completions'
  }),
  uploadMiddleware.array('completionPhotos', 10),
  eventCompletionValidationRules(),
  validationMiddleware,
  eventsController.completeEvent
);

/**
 * @route   PUT /events/:id/cancel
 * @desc    Cancelar evento programado
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID del evento)
 * @body    { cancellationReason: string, notifyStakeholders?: boolean, refundRequired?: boolean, cancelRecurringSeries?: boolean }
 */
router.put(
  '/:id/cancel',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 cancelaciones por usuario cada 15 minutos
    message: 'Too many event cancellations'
  }),
  notificationMiddleware,
  eventsController.cancelEvent
);

/**
 * @route   PUT /events/:id/start
 * @desc    Iniciar evento programado
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, VETERINARIAN)
 * @params  id: string (UUID del evento)
 * @body    { actualStartTime?: string, attendees?: string[], equipment?: string[], initialNotes?: string }
 */
router.put(
  '/:id/start',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 60, // máximo 60 inicios de eventos por usuario cada 5 minutos
    message: 'Too many event starts'
  }),
  eventsController.startEvent
);

// ============================================================================
// OPERACIONES MASIVAS (BULK OPERATIONS)
// ============================================================================

/**
 * @route   POST /events/bulk-create
 * @desc    Crear múltiples eventos simultáneamente
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @body    { events: array, applyToAllBovines?: boolean, staggerTiming?: boolean, intervalMinutes?: number }
 */
router.post(
  '/bulk-create',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 5, // máximo 5 operaciones masivas por usuario cada 30 minutos
    message: 'Too many bulk operations'
  }),
  bulkEventValidationRules(),
  validationMiddleware,
  eventsController.bulkCreateEvents
);

/**
 * @route   PUT /events/bulk-update
 * @desc    Actualizar múltiples eventos simultáneamente
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @body    { eventIds: string[], updates: object, updateType: string }
 */
router.put(
  '/bulk-update',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 5, // máximo 5 actualizaciones masivas por usuario cada 30 minutos
    message: 'Too many bulk updates'
  }),
  bulkEventValidationRules(),
  validationMiddleware,
  eventsController.bulkUpdateEvents
);

/**
 * @route   PUT /events/bulk-complete
 * @desc    Completar múltiples eventos simultáneamente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { eventIds: string[], completionData: object, batchNotes?: string }
 */
router.put(
  '/bulk-complete',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 10, // máximo 10 completaciones masivas por usuario cada 20 minutos
    message: 'Too many bulk completions'
  }),
  eventsController.bulkCompleteEvents
);

// ============================================================================
// ARCHIVOS ADJUNTOS Y MULTIMEDIA
// ============================================================================

/**
 * @route   POST /events/:id/attachments
 * @desc    Subir archivos adjuntos a un evento
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, VETERINARIAN)
 * @params  id: string (UUID del evento)
 */
router.post(
  '/:id/attachments',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 subidas de archivos por usuario cada 15 minutos
    message: 'Too many file uploads'
  }),
  uploadMiddleware.array('files', 15),
  eventAttachmentValidationRules(),
  validationMiddleware,
  eventsController.uploadEventAttachments
);

/**
 * @route   GET /events/:id/attachments/:attachmentId
 * @desc    Obtener archivo adjunto específico
 * @access  Private
 * @params  id: string (UUID del evento), attachmentId: string (ID del archivo)
 * @query   ?download=true&size=thumbnail|medium|full
 */
router.get(
  '/:id/attachments/:attachmentId',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 descargas por usuario cada 5 minutos
    message: 'Too many file downloads'
  }),
  eventsController.getEventAttachment
);

/**
 * @route   DELETE /events/:id/attachments/:attachmentId
 * @desc    Eliminar archivo adjunto específico
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, VETERINARIAN)
 * @params  id: string (UUID del evento), attachmentId: string (ID del archivo)
 */
router.delete(
  '/:id/attachments/:attachmentId',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 eliminaciones de archivos por usuario cada 15 minutos
    message: 'Too many file deletions'
  }),
  eventsController.deleteEventAttachment
);

// ============================================================================
// TIMELINE Y HISTORIAL
// ============================================================================

/**
 * @route   GET /events/timeline
 * @desc    Obtener línea de tiempo de eventos
 * @access  Private
 * @query   ?bovineId=123&dateFrom=2025-01-01&dateTo=2025-12-31&eventTypes=vaccination,treatment&groupBy=day|week|month&includeUpcoming=true
 */
router.get(
  '/timeline',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 consultas de timeline por usuario cada 10 minutos
    message: 'Too many timeline requests'
  }),
  eventTimelineValidationRules(),
  validationMiddleware,
  eventsController.getEventsTimeline
);

/**
 * @route   GET /events/history/:bovineId
 * @desc    Obtener historial completo de eventos de un bovino específico
 * @access  Private
 * @params  bovineId: string (UUID del bovino)
 * @query   ?includeRelatedEvents=true&groupByType=true&includeAttachments=false
 */
router.get(
  '/history/:bovineId',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 40, // máximo 40 consultas de historial por usuario cada 10 minutos
    message: 'Too many history requests'
  }),
  eventsController.getBovineEventHistory
);

/**
 * @route   GET /events/calendar
 * @desc    Obtener eventos en formato calendario
 * @access  Private
 * @query   ?year=2025&month=7&view=month|week|day&eventTypes=all&includeCompleted=false
 */
router.get(
  '/calendar',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 50, // máximo 50 consultas de calendario por usuario cada 5 minutos
    message: 'Too many calendar requests'
  }),
  eventsController.getEventsCalendar
);

// ============================================================================
// ESTADÍSTICAS Y ANÁLISIS
// ============================================================================

/**
 * @route   GET /events/statistics
 * @desc    Obtener estadísticas de eventos
 * @access  Private
 * @query   ?period=30d&eventTypes=all&groupBy=type|status|priority&includeComparison=true
 */
router.get(
  '/statistics',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 consultas estadísticas por usuario cada 15 minutos
    message: 'Too many statistics requests'
  }),
  eventsController.getEventStatistics
);

/**
 * @route   GET /events/analytics/trends
 * @desc    Análisis de tendencias de eventos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?period=1y&predictiveAnalysis=true&includeSeasonality=true&eventTypes=health,reproductive
 */
router.get(
  '/analytics/trends',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 análisis de tendencias por usuario cada 30 minutos
    message: 'Too many trend analysis requests'
  }),
  eventsController.getEventTrends
);

/**
 * @route   GET /events/analytics/patterns
 * @desc    Análisis de patrones en eventos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?analysisType=temporal|seasonal|geographic&machineLearnig=true&correlations=true
 */
router.get(
  '/analytics/patterns',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 análisis de patrones por usuario cada 30 minutos
    message: 'Too many pattern analysis requests'
  }),
  eventsController.getEventPatterns
);

// ============================================================================
// EXPORTACIÓN E INFORMES
// ============================================================================

/**
 * @route   POST /events/export
 * @desc    Exportar eventos en diferentes formatos
 * @access  Private
 * @body    { format: 'csv' | 'excel' | 'pdf' | 'ics', filters: object, fields: string[], includeAttachments: boolean }
 */
router.post(
  '/export',
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 5, // máximo 5 exportaciones por usuario cada 30 minutos
    message: 'Too many export requests'
  }),
  eventsController.exportEvents
);

/**
 * @route   GET /events/export/:exportId/download
 * @desc    Descargar archivo de eventos exportado
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
  eventsController.downloadEventsExport
);

/**
 * @route   POST /events/reports/health-summary
 * @desc    Generar reporte de resumen de salud
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { period: string, bovineIds?: string[], includeCharts: boolean, format: string }
 */
router.post(
  '/reports/health-summary',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 reportes por usuario cada 30 minutos
    message: 'Too many report requests'
  }),
  eventsController.generateHealthSummaryReport
);

// ============================================================================
// NOTIFICACIONES Y RECORDATORIOS
// ============================================================================

/**
 * @route   GET /events/upcoming
 * @desc    Obtener eventos próximos con recordatorios
 * @access  Private
 * @query   ?days=7&priority=high&includeOverdue=true&sortBy=date&limitPerType=10
 */
router.get(
  '/upcoming',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 consultas de eventos próximos cada 5 minutos
    message: 'Too many upcoming events requests'
  }),
  eventsController.getUpcomingEvents
);

/**
 * @route   GET /events/overdue
 * @desc    Obtener eventos vencidos y atrasados
 * @access  Private
 * @query   ?daysPastDue=30&includeEmergencies=true&sortBy=priority&groupByType=true
 */
router.get(
  '/overdue',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 consultas de eventos vencidos cada 10 minutos
    message: 'Too many overdue events requests'
  }),
  eventsController.getOverdueEvents
);

/**
 * @route   POST /events/:id/reminder
 * @desc    Crear recordatorio personalizado para evento
 * @access  Private
 * @params  id: string (UUID del evento)
 * @body    { reminderTime: string, message?: string, recipients: string[], methods: string[] }
 */
router.post(
  '/:id/reminder',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 recordatorios por usuario cada 15 minutos
    message: 'Too many reminder creations'
  }),
  eventsController.createEventReminder
);

// ============================================================================
// MANEJO DE ERRORES ESPECÍFICOS PARA RUTAS DE EVENTOS
// ============================================================================

/**
 * Middleware de manejo de errores específico para eventos
 */
router.use((error: any, req: Request, res: Response, next: any) => {
  // Log del error para debugging
  console.error('Events Route Error:', {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  // Errores específicos de eventos
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

  // Error genérico
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: 'INTERNAL_SERVER_ERROR'
  });
});

export default router;