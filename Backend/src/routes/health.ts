import { Router, Request, Response } from 'express';
import { HealthController } from '../controllers/health.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { veterinaryMiddleware } from '../middleware/veterinary.middleware';
import { epidemiologyMiddleware } from '../middleware/epidemiology.middleware';
import { pharmacyMiddleware } from '../middleware/pharmacy.middleware';
import { quarantineMiddleware } from '../middleware/quarantine.middleware';
import { regulatoryComplianceMiddleware } from '../middleware/regulatoryCompliance.middleware';
import { animalWelfareMiddleware } from '../middleware/animalWelfare.middleware';
import { notificationMiddleware } from '../middleware/notification.middleware';
import {
  createHealthRecordValidationRules,
  updateHealthRecordValidationRules,
  healthRecordSearchValidationRules,
  vaccinationValidationRules,
  treatmentPlanValidationRules,
  illnessRecordValidationRules,
  emergencyResponseValidationRules,
  laboratoryTestValidationRules,
  medicationValidationRules,
  quarantineValidationRules,
  necropsy Validation Rules,
  reproductiveHealthValidationRules,
  parasiteControlValidationRules,
  healthReportValidationRules,
  epidemiologyValidationRules,
  biometricDataValidationRules,
  preventiveCareValidationRules
} from '../validators/health.validators';

// Crear instancia del router
const router = Router();

// Crear instancia del controlador de salud
const healthController = new HealthController();

// ============================================================================
// MIDDLEWARE GLOBAL PARA TODAS LAS RUTAS DE SALUD
// ============================================================================

// Todas las rutas de salud requieren autenticación
router.use(authMiddleware);

// Middleware veterinario para validaciones médicas
router.use(veterinaryMiddleware);

// ============================================================================
// REGISTROS DE SALUD - CRUD BÁSICO
// ============================================================================

/**
 * @route   GET /health/records
 * @desc    Obtener registros de salud con filtros avanzados
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @query   ?page=1&limit=50&bovineId=123&recordType=vaccination&dateFrom=2025-01-01&dateTo=2025-07-31&veterinarianId=456&severity=critical&status=active&sortBy=date&sortOrder=desc
 */
router.get(
  '/records',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 consultas por usuario cada 5 minutos
    message: 'Too many health record requests'
  }),
  healthRecordSearchValidationRules(),
  validationMiddleware,
  healthController.getHealthRecords
);

/**
 * @route   POST /health/records
 * @desc    Crear nuevo registro de salud
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @body    { bovineId: string, recordType: string, description: string, veterinarianId?: string, findings: object, treatment?: object, followUpRequired: boolean }
 */
router.post(
  '/records',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 registros por usuario cada 10 minutos
    message: 'Too many health record creations'
  }),
  uploadMiddleware.array('medicalFiles', 15), // documentos médicos, rayos X, etc.
  regulatoryComplianceMiddleware, // verificar cumplimiento normativo
  animalWelfareMiddleware, // evaluar bienestar animal
  notificationMiddleware, // alertas automáticas si es necesario
  createHealthRecordValidationRules(),
  validationMiddleware,
  healthController.createHealthRecord
);

/**
 * @route   GET /health/records/:id
 * @desc    Obtener registro de salud específico con historial completo
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @params  id: string (UUID del registro)
 * @query   ?includeRelatedRecords=true&includeLabResults=true&includeImages=true
 */
router.get(
  '/records/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 200, // máximo 200 consultas por usuario cada 5 minutos
    message: 'Too many record detail requests'
  }),
  healthController.getHealthRecordById
);

/**
 * @route   PUT /health/records/:id
 * @desc    Actualizar registro de salud existente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID del registro)
 * @body    Campos a actualizar del registro
 */
router.put(
  '/records/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 40, // máximo 40 actualizaciones por usuario cada 15 minutos
    message: 'Too many record update attempts'
  }),
  uploadMiddleware.array('medicalFiles', 15),
  regulatoryComplianceMiddleware,
  updateHealthRecordValidationRules(),
  validationMiddleware,
  healthController.updateHealthRecord
);

/**
 * @route   DELETE /health/records/:id
 * @desc    Eliminar registro de salud (soft delete con justificación)
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @params  id: string (UUID del registro)
 * @body    { reason: string, approvedBy: string, retentionPeriod: number }
 */
router.delete(
  '/records/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 eliminaciones por usuario cada 30 minutos
    message: 'Too many record deletion attempts'
  }),
  healthController.deleteHealthRecord
);

// ============================================================================
// VACUNACIONES Y PROGRAMAS DE INMUNIZACIÓN
// ============================================================================

/**
 * @route   GET /health/vaccinations
 * @desc    Obtener registros de vacunación con programación
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @query   ?bovineId=123&vaccineType=all&status=completed&dueDate=2025-07-31&includeScheduled=true&certificationRequired=true
 */
router.get(
  '/vaccinations',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 80, // máximo 80 consultas de vacunación cada 5 minutos
    message: 'Too many vaccination requests'
  }),
  healthController.getVaccinations
);

/**
 * @route   POST /health/vaccinations
 * @desc    Registrar nueva vacunación aplicada
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @body    { bovineIds: string[], vaccineId: string, batchNumber: string, dose: string, administrationDate: string, veterinarianId: string, location: object, cost?: number }
 */
router.post(
  '/vaccinations',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 vacunaciones por usuario cada 10 minutos
    message: 'Too many vaccination recordings'
  }),
  uploadMiddleware.array('vaccinationCertificates', 10), // certificados oficiales
  pharmacyMiddleware, // actualizar inventario de vacunas
  regulatoryComplianceMiddleware, // verificar normativas de vacunación
  notificationMiddleware, // programar próximas dosis automáticamente
  vaccinationValidationRules(),
  validationMiddleware,
  healthController.recordVaccination
);

/**
 * @route   GET /health/vaccinations/schedule
 * @desc    Obtener programa de vacunación completo del rebaño
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?period=year&includeOverdue=true&groupBy=vaccine_type&includeProjections=true&filterByRegulation=true
 */
router.get(
  '/vaccinations/schedule',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 consultas de programa cada 10 minutos
    message: 'Too many vaccination schedule requests'
  }),
  healthController.getVaccinationSchedule
);

/**
 * @route   POST /health/vaccinations/schedule
 * @desc    Programar vacunación futura individual o masiva
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineIds: string[], vaccineId: string, scheduledDate: string, veterinarianId: string, priority: string, autoReminders: boolean }
 */
router.post(
  '/vaccinations/schedule',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 programaciones por usuario cada 15 minutos
    message: 'Too many vaccination scheduling attempts'
  }),
  pharmacyMiddleware, // verificar disponibilidad de vacunas
  notificationMiddleware,
  healthController.scheduleVaccination
);

/**
 * @route   GET /health/vaccinations/coverage
 * @desc    Análisis de cobertura de vacunación del rebaño
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?vaccineType=all&ageGroup=all&includeHerdImmunity=true&regulatoryCompliance=true&timeframe=current
 */
router.get(
  '/vaccinations/coverage',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 análisis de cobertura cada 15 minutos
    message: 'Too many coverage analysis requests'
  }),
  healthController.getVaccinationCoverage
);

/**
 * @route   GET /health/vaccinations/overdue
 * @desc    Obtener vacunaciones vencidas y próximas a vencer
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @query   ?daysPastDue=30&includeUpcoming=true&priority=high&sortBy=urgency&includeRegulatoryRisk=true
 */
router.get(
  '/vaccinations/overdue',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 60, // máximo 60 consultas de vencimientos cada 5 minutos
    message: 'Too many overdue vaccination requests'
  }),
  healthController.getOverdueVaccinations
);

/**
 * @route   POST /health/vaccinations/:id/certificate
 * @desc    Generar certificado oficial de vacunación
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID de la vacunación)
 * @body    { certificateType: string, language: string, officialSeal: boolean, digitalSignature: boolean }
 */
router.post(
  '/vaccinations/:id/certificate',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 certificados por usuario cada 15 minutos
    message: 'Too many certificate generations'
  }),
  regulatoryComplianceMiddleware,
  healthController.generateVaccinationCertificate
);

// ============================================================================
// ENFERMEDADES Y DIAGNÓSTICOS
// ============================================================================

/**
 * @route   GET /health/illnesses
 * @desc    Obtener registros de enfermedades y diagnósticos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @query   ?bovineId=123&diseaseType=respiratory&severity=moderate&status=active&contagious=true&reportableDisease=true&dateFrom=2025-01-01
 */
router.get(
  '/illnesses',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 80, // máximo 80 consultas de enfermedades cada 5 minutos
    message: 'Too many illness requests'
  }),
  healthController.getIllnesses
);

/**
 * @route   POST /health/illnesses
 * @desc    Registrar nueva enfermedad o diagnóstico
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @body    { bovineId: string, diseaseName: string, symptoms: string[], severity: string, diagnosisMethod: string, veterinarianId: string, contagious: boolean, quarantineRequired: boolean }
 */
router.post(
  '/illnesses',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 25, // máximo 25 registros de enfermedad por usuario cada 10 minutos
    message: 'Too many illness recordings'
  }),
  uploadMiddleware.array('diagnosticImages', 20), // imágenes diagnósticas, rayos X
  epidemiologyMiddleware, // análisis epidemiológico automático
  quarantineMiddleware, // activar cuarentena si es necesario
  regulatoryComplianceMiddleware, // reportar enfermedades obligatorias
  notificationMiddleware, // alertar sobre enfermedades contagiosas
  illnessRecordValidationRules(),
  validationMiddleware,
  healthController.recordIllness
);

/**
 * @route   PUT /health/illnesses/:id
 * @desc    Actualizar registro de enfermedad con progreso del tratamiento
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID del registro de enfermedad)
 * @body    Campos a actualizar del registro de enfermedad
 */
router.put(
  '/illnesses/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 40, // máximo 40 actualizaciones por usuario cada 15 minutos
    message: 'Too many illness update attempts'
  }),
  uploadMiddleware.array('progressImages', 10),
  epidemiologyMiddleware,
  illnessRecordValidationRules(),
  validationMiddleware,
  healthController.updateIllness
);

/**
 * @route   GET /health/illnesses/outbreak-analysis
 * @desc    Análisis epidemiológico de brotes de enfermedades
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?diseaseType=all&timeframe=30d&includeGeospatial=true&includeTransmissionPaths=true&riskAssessment=true
 */
router.get(
  '/illnesses/outbreak-analysis',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 10, // máximo 10 análisis epidemiológicos cada 20 minutos
    message: 'Too many outbreak analysis requests'
  }),
  epidemiologyValidationRules(),
  validationMiddleware,
  healthController.performOutbreakAnalysis
);

/**
 * @route   GET /health/illnesses/reportable
 * @desc    Obtener enfermedades de notificación obligatoria
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?status=pending&authority=senasica&includeFollowUp=true&exportFormat=official
 */
router.get(
  '/illnesses/reportable',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 consultas de enfermedades reportables cada 10 minutos
    message: 'Too many reportable disease requests'
  }),
  regulatoryComplianceMiddleware,
  healthController.getReportableDiseases
);

/**
 * @route   POST /health/illnesses/:id/report
 * @desc    Reportar enfermedad a autoridades sanitarias
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID del registro de enfermedad)
 * @body    { authority: string, reportType: string, urgency: string, additionalInfo: object, contactPerson: object }
 */
router.post(
  '/illnesses/:id/report',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 reportes a autoridades cada 30 minutos
    message: 'Too many official reports'
  }),
  regulatoryComplianceMiddleware,
  healthController.reportIllnessToAuthorities
);

// ============================================================================
// PLANES DE TRATAMIENTO
// ============================================================================

/**
 * @route   GET /health/treatment-plans
 * @desc    Obtener planes de tratamiento activos y completados
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @query   ?bovineId=123&status=active&veterinarianId=456&treatmentType=antibiotic&includeCompleted=false&sortBy=priority
 */
router.get(
  '/treatment-plans',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 80, // máximo 80 consultas de planes cada 5 minutos
    message: 'Too many treatment plan requests'
  }),
  healthController.getTreatmentPlans
);

/**
 * @route   POST /health/treatment-plans
 * @desc    Crear nuevo plan de tratamiento
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineId: string, condition: string, medications: array, duration: number, veterinarianId: string, monitoringSchedule: object, expectedOutcome: string }
 */
router.post(
  '/treatment-plans',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 planes por usuario cada 15 minutos
    message: 'Too many treatment plan creations'
  }),
  uploadMiddleware.array('treatmentProtocols', 10), // protocolos y guías
  pharmacyMiddleware, // verificar disponibilidad de medicamentos
  animalWelfareMiddleware, // evaluar impacto en bienestar
  treatmentPlanValidationRules(),
  validationMiddleware,
  healthController.createTreatmentPlan
);

/**
 * @route   PUT /health/treatment-plans/:id
 * @desc    Actualizar plan de tratamiento con progreso
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID del plan de tratamiento)
 * @body    Campos a actualizar del plan
 */
router.put(
  '/treatment-plans/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 40, // máximo 40 actualizaciones por usuario cada 15 minutos
    message: 'Too many treatment plan updates'
  }),
  uploadMiddleware.array('progressReports', 10),
  pharmacyMiddleware,
  treatmentPlanValidationRules(),
  validationMiddleware,
  healthController.updateTreatmentPlan
);

/**
 * @route   POST /health/treatment-plans/:id/medication
 * @desc    Registrar administración de medicamento
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @params  id: string (UUID del plan de tratamiento)
 * @body    { medicationId: string, dose: string, administrationTime: string, administeredBy: string, route: string, observedEffects: string[] }
 */
router.post(
  '/treatment-plans/:id/medication',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 administraciones por usuario cada 10 minutos
    message: 'Too many medication administrations'
  }),
  pharmacyMiddleware, // actualizar inventario
  animalWelfareMiddleware, // monitorear efectos adversos
  healthController.recordMedicationAdministration
);

/**
 * @route   GET /health/treatment-plans/:id/progress
 * @desc    Obtener progreso detallado del tratamiento
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @params  id: string (UUID del plan de tratamiento)
 * @query   ?includeVitalSigns=true&includePhotos=true&includeLabResults=true
 */
router.get(
  '/treatment-plans/:id/progress',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  healthController.getTreatmentProgress
);

/**
 * @route   POST /health/treatment-plans/:id/complete
 * @desc    Completar plan de tratamiento
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID del plan de tratamiento)
 * @body    { completionDate: string, outcome: string, finalNotes: string, followUpRequired: boolean, nextCheckupDate?: string }
 */
router.post(
  '/treatment-plans/:id/complete',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 completaciones por usuario cada 15 minutos
    message: 'Too many treatment completions'
  }),
  healthController.completeTreatmentPlan
);

// ============================================================================
// EMERGENCIAS MÉDICAS
// ============================================================================

/**
 * @route   POST /health/emergency
 * @desc    Registrar emergencia médica veterinaria
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @body    { bovineId: string, emergencyType: string, severity: string, symptoms: string[], location: object, immediateActions: string[], contactedVeterinarian: boolean }
 */
router.post(
  '/emergency',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 20, // máximo 20 emergencias por usuario cada 5 minutos (sin restricción excesiva)
    message: 'Too many emergency reports'
  }),
  uploadMiddleware.array('emergencyPhotos', 15), // fotos de la emergencia
  notificationMiddleware, // alertas inmediatas a veterinarios
  animalWelfareMiddleware, // evaluación crítica de bienestar
  emergencyResponseValidationRules(),
  validationMiddleware,
  healthController.recordEmergency
);

/**
 * @route   GET /health/emergency/active
 * @desc    Obtener emergencias médicas activas
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @query   ?severity=critical&includeResolved=false&veterinarianAssigned=true&sortBy=urgency
 */
router.get(
  '/emergency/active',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 2 * 60 * 1000, // 2 minutos
    max: 100, // máximo 100 consultas de emergencias cada 2 minutos
    message: 'Too many emergency requests'
  }),
  healthController.getActiveEmergencies
);

/**
 * @route   PUT /health/emergency/:id/response
 * @desc    Actualizar respuesta a emergencia médica
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID de la emergencia)
 * @body    { responseTime: string, actions: string[], outcome: string, veterinarianId: string, treatmentRequired: boolean, status: string }
 */
router.put(
  '/emergency/:id/response',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 50, // máximo 50 respuestas a emergencias cada 5 minutos
    message: 'Too many emergency responses'
  }),
  uploadMiddleware.array('responseDocumentation', 10),
  healthController.updateEmergencyResponse
);

/**
 * @route   GET /health/emergency/protocols
 * @desc    Obtener protocolos de emergencia veterinaria
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @query   ?emergencyType=respiratory&includeStepByStep=true&language=es
 */
router.get(
  '/emergency/protocols',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 40, // máximo 40 consultas de protocolos cada 10 minutos
    message: 'Too many protocol requests'
  }),
  healthController.getEmergencyProtocols
);

// ============================================================================
// ANÁLISIS DE LABORATORIO
// ============================================================================

/**
 * @route   GET /health/laboratory/tests
 * @desc    Obtener análisis de laboratorio realizados
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?bovineId=123&testType=blood_chemistry&status=completed&laboratoryId=456&dateFrom=2025-01-01&includeResults=true
 */
router.get(
  '/laboratory/tests',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 consultas de laboratorio cada 10 minutos
    message: 'Too many laboratory requests'
  }),
  healthController.getLaboratoryTests
);

/**
 * @route   POST /health/laboratory/tests
 * @desc    Solicitar nuevo análisis de laboratorio
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineId: string, testTypes: string[], laboratoryId: string, urgency: string, sampleCollectionDate: string, clinicalHistory: string, tentativeDiagnosis?: string }
 */
router.post(
  '/laboratory/tests',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 solicitudes de laboratorio cada 15 minutos
    message: 'Too many laboratory test requests'
  }),
  uploadMiddleware.array('clinicalSamples', 5), // información de muestras
  laboratoryTestValidationRules(),
  validationMiddleware,
  healthController.requestLaboratoryTest
);

/**
 * @route   PUT /health/laboratory/tests/:id/results
 * @desc    Cargar resultados de análisis de laboratorio
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, LAB_TECHNICIAN)
 * @params  id: string (UUID del análisis)
 * @body    { results: object, interpretation: string, recommendations: string[], criticalValues: string[], laboratoryTechnician: string }
 */
router.put(
  '/laboratory/tests/:id/results',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'LAB_TECHNICIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 cargas de resultados cada 15 minutos
    message: 'Too many result uploads'
  }),
  uploadMiddleware.array('labReports', 10), // reportes oficiales de laboratorio
  notificationMiddleware, // alertar sobre valores críticos
  healthController.uploadLabResults
);

/**
 * @route   GET /health/laboratory/tests/:id/interpretation
 * @desc    Obtener interpretación automática de resultados de laboratorio
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID del análisis)
 * @query   ?includeReferences=true&includeRecommendations=true&comparisonWithPrevious=true
 */
router.get(
  '/laboratory/tests/:id/interpretation',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 40, // máximo 40 interpretaciones cada 10 minutos
    message: 'Too many interpretation requests'
  }),
  healthController.interpretLabResults
);

/**
 * @route   GET /health/laboratory/trends
 * @desc    Análisis de tendencias en resultados de laboratorio
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?bovineId=123&testType=blood_chemistry&period=6m&includePopulationComparison=true&abnormalOnly=false
 */
router.get(
  '/laboratory/trends',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 análisis de tendencias cada 20 minutos
    message: 'Too many trend analysis requests'
  }),
  healthController.analyzeLaboratoryTrends
);

// ============================================================================
// FARMACIA Y GESTIÓN DE MEDICAMENTOS
// ============================================================================

/**
 * @route   GET /health/pharmacy/inventory
 * @desc    Obtener inventario de medicamentos y vacunas
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, PHARMACY_MANAGER)
 * @query   ?category=antibiotic&status=available&expiringIn=30d&lowStock=true&controlledSubstances=true
 */
router.get(
  '/pharmacy/inventory',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'PHARMACY_MANAGER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 consultas de inventario cada 10 minutos
    message: 'Too many pharmacy inventory requests'
  }),
  healthController.getPharmacyInventory
);

/**
 * @route   POST /health/pharmacy/inventory
 * @desc    Agregar medicamento al inventario de la farmacia
 * @access  Private (Roles: RANCH_OWNER, ADMIN, PHARMACY_MANAGER)
 * @body    { medicationName: string, category: string, quantity: number, expirationDate: string, batchNumber: string, supplier: string, cost: number, storageRequirements: object }
 */
router.post(
  '/pharmacy/inventory',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'PHARMACY_MANAGER']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 adiciones al inventario cada 15 minutos
    message: 'Too many inventory additions'
  }),
  uploadMiddleware.array('medicationDocuments', 10), // facturas, certificados
  regulatoryComplianceMiddleware, // verificar registros sanitarios
  medicationValidationRules(),
  validationMiddleware,
  healthController.addMedicationToInventory
);

/**
 * @route   POST /health/pharmacy/prescription
 * @desc    Crear prescripción médica veterinaria
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineId: string, medications: array, diagnosisCode: string, treatmentDuration: number, specialInstructions: string, followUpRequired: boolean }
 */
router.post(
  '/pharmacy/prescription',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 prescripciones cada 15 minutos
    message: 'Too many prescription creations'
  }),
  pharmacyMiddleware, // verificar disponibilidad y reservar medicamentos
  regulatoryComplianceMiddleware, // verificar períodos de retiro
  healthController.createPrescription
);

/**
 * @route   GET /health/pharmacy/prescriptions
 * @desc    Obtener prescripciones médicas activas y completadas
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, PHARMACY_MANAGER)
 * @query   ?bovineId=123&status=active&veterinarianId=456&medicationType=antibiotic&includeDispensed=false
 */
router.get(
  '/pharmacy/prescriptions',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'PHARMACY_MANAGER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 60, // máximo 60 consultas de prescripciones cada 10 minutos
    message: 'Too many prescription requests'
  }),
  healthController.getPrescriptions
);

/**
 * @route   POST /health/pharmacy/dispense/:prescriptionId
 * @desc    Dispensar medicamentos de una prescripción
 * @access  Private (Roles: RANCH_OWNER, ADMIN, PHARMACY_MANAGER)
 * @params  prescriptionId: string (UUID de la prescripción)
 * @body    { dispensedMedications: array, dispensingPharmacist: string, administrationInstructions: string, patientEducation: string[] }
 */
router.post(
  '/pharmacy/dispense/:prescriptionId',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'PHARMACY_MANAGER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 40, // máximo 40 dispensaciones cada 10 minutos
    message: 'Too many medication dispensations'
  }),
  pharmacyMiddleware, // actualizar inventario automáticamente
  healthController.dispenseMedication
);

/**
 * @route   GET /health/pharmacy/alerts
 * @desc    Obtener alertas de farmacia (vencimientos, stock bajo, etc.)
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, PHARMACY_MANAGER)
 * @query   ?alertType=expiration&severity=high&medicationCategory=controlled&includeRecommendations=true
 */
router.get(
  '/pharmacy/alerts',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'PHARMACY_MANAGER']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 80, // máximo 80 consultas de alertas cada 5 minutos
    message: 'Too many pharmacy alert requests'
  }),
  healthController.getPharmacyAlerts
);

// ============================================================================
// CUARENTENAS Y BIOSEGURIDAD
// ============================================================================

/**
 * @route   GET /health/quarantine
 * @desc    Obtener zonas y animales en cuarentena
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?status=active&quarantineType=medical&includeZones=true&monitoringRequired=true&daysRemaining=30
 */
router.get(
  '/quarantine',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 40, // máximo 40 consultas de cuarentena cada 10 minutos
    message: 'Too many quarantine requests'
  }),
  healthController.getQuarantines
);

/**
 * @route   POST /health/quarantine
 * @desc    Establecer nueva cuarentena
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineIds: string[], quarantineType: string, reason: string, duration: number, location: object, restrictions: object, monitoringSchedule: object }
 */
router.post(
  '/quarantine',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 cuarentenas por usuario cada 20 minutos
    message: 'Too many quarantine establishments'
  }),
  quarantineMiddleware, // configurar restricciones automáticamente
  regulatoryComplianceMiddleware, // notificar a autoridades si es requerido
  notificationMiddleware, // alertar al personal
  quarantineValidationRules(),
  validationMiddleware,
  healthController.establishQuarantine
);

/**
 * @route   PUT /health/quarantine/:id
 * @desc    Actualizar estado de cuarentena
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID de la cuarentena)
 * @body    Campos a actualizar de la cuarentena
 */
router.put(
  '/quarantine/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 actualizaciones de cuarentena cada 15 minutos
    message: 'Too many quarantine updates'
  }),
  quarantineMiddleware,
  quarantineValidationRules(),
  validationMiddleware,
  healthController.updateQuarantine
);

/**
 * @route   POST /health/quarantine/:id/lift
 * @desc    Levantar cuarentena tras cumplir criterios
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID de la cuarentena)
 * @body    { liftingDate: string, finalTests: object, veterinarianApproval: string, clearanceReason: string, postQuarantineRestrictions?: object }
 */
router.post(
  '/quarantine/:id/lift',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 20, // máximo 20 levantamientos de cuarentena cada 20 minutos
    message: 'Too many quarantine lifts'
  }),
  quarantineMiddleware,
  regulatoryComplianceMiddleware,
  healthController.liftQuarantine
);

/**
 * @route   GET /health/biosecurity/protocols
 * @desc    Obtener protocolos de bioseguridad activos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @query   ?protocolType=visitor&includeInactive=false&facilityType=barn&emergencyProtocols=true
 */
router.get(
  '/biosecurity/protocols',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 consultas de protocolos cada 10 minutos
    message: 'Too many biosecurity protocol requests'
  }),
  healthController.getBiosecurityProtocols
);

/**
 * @route   POST /health/biosecurity/breach
 * @desc    Reportar violación de bioseguridad
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @body    { breachType: string, severity: string, location: object, description: string, peopleInvolved: string[], immediateActions: string[], riskAssessment: object }
 */
router.post(
  '/biosecurity/breach',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 25, // máximo 25 reportes de violación cada 10 minutos
    message: 'Too many breach reports'
  }),
  uploadMiddleware.array('breachEvidence', 10),
  notificationMiddleware, // alertas inmediatas de seguridad
  healthController.reportBiosecurityBreach
);

// ============================================================================
// NECROPSIAS Y ANÁLISIS POST-MORTEM
// ============================================================================

/**
 * @route   GET /health/necropsy
 * @desc    Obtener registros de necropsias realizadas
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?dateFrom=2025-01-01&includePhotos=true&cause=unknown&veterinarianId=123&includeHistopathology=true
 */
router.get(
  '/necropsy',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 consultas de necropsia cada 15 minutos
    message: 'Too many necropsy requests'
  }),
  healthController.getNecropsyRecords
);

/**
 * @route   POST /health/necropsy
 * @desc    Registrar necropsia realizada
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineId: string, deathDate: string, necropsyDate: string, veterinarianId: string, macroscopicFindings: object, cause: string, contributingFactors: string[], samplesCollected: object }
 */
router.post(
  '/necropsy',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 10, // máximo 10 registros de necropsia cada 20 minutos
    message: 'Too many necropsy recordings'
  }),
  uploadMiddleware.array('necropsyImages', 20), // imágenes detalladas
  regulatoryComplianceMiddleware, // reportar muertes sospechosas
  necropsyValidationRules(),
  validationMiddleware,
  healthController.recordNecropsy
);

/**
 * @route   PUT /health/necropsy/:id/histopathology
 * @desc    Agregar resultados de histopatología
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, PATHOLOGIST)
 * @params  id: string (UUID de la necropsia)
 * @body    { histopathologyFindings: object, finalDiagnosis: string, pathologistId: string, laboratoryId: string, additionalTests: object }
 */
router.put(
  '/necropsy/:id/histopathology',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'PATHOLOGIST']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 resultados de histopatología cada 20 minutos
    message: 'Too many histopathology updates'
  }),
  uploadMiddleware.array('histopathologyReports', 10),
  healthController.addHistopathologyResults
);

/**
 * @route   GET /health/necropsy/mortality-analysis
 * @desc    Análisis de mortalidad del rebaño
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?period=year&includeSeasonality=true&causesAnalysis=true&riskFactors=true&populationComparison=true
 */
router.get(
  '/necropsy/mortality-analysis',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 análisis de mortalidad cada 30 minutos
    message: 'Too many mortality analysis requests'
  }),
  healthController.performMortalityAnalysis
);

// ============================================================================
// SALUD REPRODUCTIVA
// ============================================================================

/**
 * @route   GET /health/reproductive
 * @desc    Obtener registros de salud reproductiva
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?bovineId=123&examType=pregnancy_check&status=pregnant&includeUltrasounds=true&veterinarianId=456
 */
router.get(
  '/reproductive',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 consultas reproductivas cada 10 minutos
    message: 'Too many reproductive health requests'
  }),
  healthController.getReproductiveHealthRecords
);

/**
 * @route   POST /health/reproductive/pregnancy-check
 * @desc    Registrar chequeo de preñez
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineId: string, checkDate: string, method: string, result: string, gestationDays?: number, expectedCalvingDate?: string, veterinarianId: string, ultrasoundFindings?: object }
 */
router.post(
  '/reproductive/pregnancy-check',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 chequeos de preñez cada 15 minutos
    message: 'Too many pregnancy check recordings'
  }),
  uploadMiddleware.array('ultrasoundImages', 10), // imágenes de ultrasonido
  reproductiveHealthValidationRules(),
  validationMiddleware,
  healthController.recordPregnancyCheck
);

/**
 * @route   POST /health/reproductive/fertility-exam
 * @desc    Registrar examen de fertilidad
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineId: string, examDate: string, examType: string, findings: object, reproductiveStatus: string, veterinarianId: string, recommendations: string[] }
 */
router.post(
  '/reproductive/fertility-exam',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 exámenes de fertilidad cada 15 minutos
    message: 'Too many fertility exam recordings'
  }),
  uploadMiddleware.array('examImages', 10),
  reproductiveHealthValidationRules(),
  validationMiddleware,
  healthController.recordFertilityExam
);

/**
 * @route   GET /health/reproductive/breeding-soundness
 * @desc    Evaluación de aptitud reproductiva del rebaño
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?includeBreedingBulls=true&includeBroodCows=true&ageGroups=true&reproductiveMetrics=true
 */
router.get(
  '/reproductive/breeding-soundness',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 evaluaciones reproductivas cada 20 minutos
    message: 'Too many breeding soundness requests'
  }),
  healthController.evaluateBreedingSoundness
);

// ============================================================================
// CONTROL DE PARÁSITOS
// ============================================================================

/**
 * @route   GET /health/parasite-control
 * @desc    Obtener registros de control de parásitos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @query   ?bovineId=123&parasiteType=internal&treatmentStatus=active&includeResistanceData=true&seasonalAnalysis=true
 */
router.get(
  '/parasite-control',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 60, // máximo 60 consultas de control parasitario cada 10 minutos
    message: 'Too many parasite control requests'
  }),
  healthController.getParasiteControlRecords
);

/**
 * @route   POST /health/parasite-control/treatment
 * @desc    Registrar tratamiento antiparasitario
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @body    { bovineIds: string[], parasiteType: string, treatmentProduct: string, dose: string, applicationMethod: string, treatmentDate: string, followUpDate?: string }
 */
router.post(
  '/parasite-control/treatment',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 tratamientos parasitarios cada 15 minutos
    message: 'Too many parasite treatment recordings'
  }),
  pharmacyMiddleware, // actualizar inventario de antiparasitarios
  parasiteControlValidationRules(),
  validationMiddleware,
  healthController.recordParasiteTreatment
);

/**
 * @route   POST /health/parasite-control/sampling
 * @desc    Registrar muestreo parasitológico
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { bovineIds: string[], sampleType: string, collectionDate: string, laboratoryId: string, testingFor: string[], veterinarianId: string }
 */
router.post(
  '/parasite-control/sampling',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 muestreos cada 20 minutos
    message: 'Too many parasite sampling recordings'
  }),
  healthController.recordParasiteSampling
);

/**
 * @route   GET /health/parasite-control/resistance-monitoring
 * @desc    Monitoreo de resistencia a antiparasitarios
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?productClass=ivermectin&period=2y&includeEfficacyData=true&riskAssessment=true
 */
router.get(
  '/parasite-control/resistance-monitoring',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 análisis de resistencia cada 30 minutos
    message: 'Too many resistance monitoring requests'
  }),
  healthController.monitorParasiteResistance
);

// ============================================================================
// DATOS BIOMÉTRICOS Y SIGNOS VITALES
// ============================================================================

/**
 * @route   GET /health/biometrics
 * @desc    Obtener datos biométricos y signos vitales
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @query   ?bovineId=123&dataType=vital_signs&dateFrom=2025-01-01&includeAverages=true&abnormalOnly=false
 */
router.get(
  '/biometrics',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 80, // máximo 80 consultas biométricas cada 10 minutos
    message: 'Too many biometric requests'
  }),
  healthController.getBiometricData
);

/**
 * @route   POST /health/biometrics
 * @desc    Registrar datos biométricos y signos vitales
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @body    { bovineId: string, measurementDate: string, vitalSigns: object, bodyMeasurements: object, behavioralObservations: object, recordedBy: string }
 */
router.post(
  '/biometrics',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 60, // máximo 60 registros biométricos cada 10 minutos
    message: 'Too many biometric recordings'
  }),
  animalWelfareMiddleware, // evaluar indicadores de bienestar
  biometricDataValidationRules(),
  validationMiddleware,
  healthController.recordBiometricData
);

/**
 * @route   GET /health/biometrics/trends
 * @desc    Análisis de tendencias en datos biométricos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?bovineId=123&metric=body_temperature&period=90d&includePopulationComparison=true&anomalyDetection=true
 */
router.get(
  '/biometrics/trends',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 análisis de tendencias cada 20 minutos
    message: 'Too many biometric trend requests'
  }),
  healthController.analyzeBiometricTrends
);

/**
 * @route   GET /health/biometrics/alerts
 * @desc    Alertas basadas en parámetros biométricos anormales
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @query   ?severity=critical&metric=all&includeRecommendations=true&activeOnly=true
 */
router.get(
  '/biometrics/alerts',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 consultas de alertas cada 5 minutos
    message: 'Too many biometric alert requests'
  }),
  healthController.getBiometricAlerts
);

// ============================================================================
// MEDICINA PREVENTIVA Y PROGRAMAS DE SALUD
// ============================================================================

/**
 * @route   GET /health/preventive-care
 * @desc    Obtener programas de medicina preventiva
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?programType=vaccination&status=active&targetGroup=calves&includeScheduling=true&seasonalPrograms=true
 */
router.get(
  '/preventive-care',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 40, // máximo 40 consultas de medicina preventiva cada 15 minutos
    message: 'Too many preventive care requests'
  }),
  healthController.getPreventiveCarePrograms
);

/**
 * @route   POST /health/preventive-care/program
 * @desc    Crear programa de medicina preventiva
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { programName: string, targetAnimals: object, activities: array, schedule: object, veterinarianId: string, expectedOutcomes: object, budget: number }
 */
router.post(
  '/preventive-care/program',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 programas preventivos cada 30 minutos
    message: 'Too many preventive care program creations'
  }),
  preventiveCareValidationRules(),
  validationMiddleware,
  healthController.createPreventiveCareProgram
);

/**
 * @route   GET /health/wellness-scores
 * @desc    Obtener puntuaciones de bienestar animal
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?bovineId=123&includePopulationAverage=true&scoringMethod=comprehensive&timeframe=current
 */
router.get(
  '/wellness-scores',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 consultas de bienestar cada 15 minutos
    message: 'Too many wellness score requests'
  }),
  animalWelfareMiddleware,
  healthController.getWellnessScores
);

// ============================================================================
// REPORTES DE SALUD ESPECIALIZADOS
// ============================================================================

/**
 * @route   POST /health/reports/generate
 * @desc    Generar reportes de salud personalizados
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { reportType: string, period: object, filters: object, includeCharts: boolean, format: string, recipients?: string[] }
 */
router.post(
  '/reports/generate',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 reportes cada 30 minutos
    message: 'Too many health report generations'
  }),
  healthReportValidationRules(),
  validationMiddleware,
  healthController.generateHealthReport
);

/**
 * @route   GET /health/reports/:id/download
 * @desc    Descargar reporte de salud generado
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  id: string (UUID del reporte)
 */
router.get(
  '/reports/:id/download',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 descargas cada 10 minutos
    message: 'Too many report downloads'
  }),
  healthController.downloadHealthReport
);

/**
 * @route   GET /health/dashboard
 * @desc    Dashboard de salud veterinaria con métricas principales
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN, WORKER)
 * @query   ?period=month&includeAlerts=true&detailLevel=summary&includeProjections=true
 */
router.get(
  '/dashboard',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 consultas de dashboard cada 5 minutos
    message: 'Too many health dashboard requests'
  }),
  healthController.getHealthDashboard
);

// ============================================================================
// CONFIGURACIÓN Y PARÁMETROS DE SALUD
// ============================================================================

/**
 * @route   GET /health/settings
 * @desc    Obtener configuración del sistema de salud veterinaria
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 */
router.get(
  '/settings',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  healthController.getHealthSettings
);

/**
 * @route   PUT /health/settings
 * @desc    Actualizar configuración del sistema de salud
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @body    { alertThresholds: object, defaultProtocols: object, complianceSettings: object, integrationSettings: object }
 */
router.put(
  '/settings',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // máximo 5 actualizaciones de configuración cada hora
    message: 'Too many settings updates'
  }),
  healthController.updateHealthSettings
);

// ============================================================================
// EXPORTACIÓN DE DATOS DE SALUD
// ============================================================================

/**
 * @route   POST /health/export
 * @desc    Exportar datos de salud en diferentes formatos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @body    { exportType: string, format: string, period: object, includeImages: boolean, dataTypes: string[], compliance: boolean }
 */
router.post(
  '/export',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 8, // máximo 8 exportaciones cada 30 minutos
    message: 'Too many export requests'
  }),
  healthController.exportHealthData
);

/**
 * @route   GET /health/export/:exportId/download
 * @desc    Descargar archivo de datos de salud exportado
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @params  exportId: string (ID del proceso de exportación)
 */
router.get(
  '/export/:exportId/download',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 20, // máximo 20 descargas cada 10 minutos
    message: 'Too many download requests'
  }),
  healthController.downloadHealthExport
);

// ============================================================================
// MANEJO DE ERRORES ESPECÍFICOS PARA RUTAS DE SALUD
// ============================================================================

/**
 * Middleware de manejo de errores específico para salud veterinaria
 */
router.use((error: any, req: Request, res: Response, next: any) => {
  // Log del error para debugging y auditoría médica
  console.error('Health Route Error:', {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    medicalContext: req.body?.bovineId || req.params?.id,
    veterinarianId: req.body?.veterinarianId
  });

  // Errores específicos de salud veterinaria
  if (error.name === 'VeterinaryValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error en validación médica veterinaria',
      error: 'VETERINARY_VALIDATION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'QuarantineViolationError') {
    return res.status(403).json({
      success: false,
      message: 'Violación de protocolo de cuarentena',
      error: 'QUARANTINE_VIOLATION',
      details: error.details
    });
  }

  if (error.name === 'RegulatoryComplianceError') {
    return res.status(400).json({
      success: false,
      message: 'Incumplimiento de normativas sanitarias',
      error: 'REGULATORY_COMPLIANCE_ERROR',
      details: error.details
    });
  }

  if (error.name === 'PharmacyInventoryError') {
    return res.status(400).json({
      success: false,
      message: 'Error en inventario de farmacia veterinaria',
      error: 'PHARMACY_INVENTORY_ERROR',
      details: error.details
    });
  }

  if (error.name === 'EpidemiologyAnalysisError') {
    return res.status(500).json({
      success: false,
      message: 'Error en análisis epidemiológico',
      error: 'EPIDEMIOLOGY_ANALYSIS_ERROR',
      details: error.details
    });
  }

  if (error.name === 'BiometricDataError') {
    return res.status(400).json({
      success: false,
      message: 'Error en datos biométricos',
      error: 'BIOMETRIC_DATA_ERROR',
      details: error.details
    });
  }

  if (error.name === 'LabResultsError') {
    return res.status(400).json({
      success: false,
      message: 'Error en resultados de laboratorio',
      error: 'LAB_RESULTS_ERROR',
      details: error.details
    });
  }

  if (error.name === 'TreatmentPlanError') {
    return res.status(400).json({
      success: false,
      message: 'Error en plan de tratamiento',
      error: 'TREATMENT_PLAN_ERROR',
      details: error.details
    });
  }

  if (error.name === 'AnimalWelfareError') {
    return res.status(400).json({
      success: false,
      message: 'Error en evaluación de bienestar animal',
      error: 'ANIMAL_WELFARE_ERROR',
      details: error.details
    });
  }

  if (error.name === 'VaccinationProtocolError') {
    return res.status(400).json({
      success: false,
      message: 'Error en protocolo de vacunación',
      error: 'VACCINATION_PROTOCOL_ERROR',
      details: error.details
    });
  }

  if (error.name === 'EmergencyResponseError') {
    return res.status(500).json({
      success: false,
      message: 'Error en respuesta de emergencia veterinaria',
      error: 'EMERGENCY_RESPONSE_ERROR',
      details: error.details
    });
  }

  if (error.name === 'BiosecurityError') {
    return res.status(400).json({
      success: false,
      message: 'Error en protocolo de bioseguridad',
      error: 'BIOSECURITY_ERROR',
      details: error.details
    });
  }

  // Error genérico
  return res.status(500).json({
    success: false,
    message: 'Error interno del sistema veterinario',
    error: 'INTERNAL_SERVER_ERROR'
  });
});

export default router;