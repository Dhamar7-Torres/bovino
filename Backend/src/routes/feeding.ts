import { Router, Request, Response } from 'express';
import { FeedingController } from '../controllers/feeding';
import { authMiddleware } from '../middleware/auth';
import { validationMiddleware } from '../middleware/validation';
import { rateLimitMiddleware } from '../middleware/rate-limit';
import { roleMiddleware } from '../middleware/role';
import { uploadMiddleware } from '../middleware/upload';
import { inventoryMiddleware } from '../middleware/inventory';
import { nutritionAnalysisMiddleware } from '../middleware/nutritionAnalysis';
import { costCalculationMiddleware } from '../middleware/costCalculation';
import { weatherDataMiddleware } from '../middleware/weatherData';
import {
  createFeedingRecordValidationRules,
  updateFeedingRecordValidationRules,
  feedingPlanValidationRules,
  feedingScheduleValidationRules,
  nutritionalAnalysisValidationRules,
  feedInventoryValidationRules,
  bulkFeedingValidationRules,
  consumptionTrackingValidationRules,
  feedQualityValidationRules,
  supplementationValidationRules,
  dietFormulationValidationRules,
  feedingReportValidationRules
} from '../validators/feeding.validators';

// Crear instancia del router
const router = Router();

// Crear instancia del controlador de alimentación
const feedingController = new FeedingController();

// ============================================================================
// MIDDLEWARE GLOBAL PARA TODAS LAS RUTAS DE ALIMENTACIÓN
// ============================================================================

// Todas las rutas de alimentación requieren autenticación
router.use(authMiddleware);

// ============================================================================
// REGISTROS DE ALIMENTACIÓN - CRUD BÁSICO
// ============================================================================

/**
 * @route   GET /feeding/records
 * @desc    Obtener registros de alimentación con filtros avanzados
 * @access  Private
 * @query   ?page=1&limit=50&dateFrom=2025-07-01&dateTo=2025-07-31&bovineId=123&feedType=concentrate&location=corral-a&sortBy=date&sortOrder=desc
 */
router.get(
  '/records',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 consultas por usuario cada 5 minutos
    message: 'Too many feeding record requests'
  }),
  feedingController.getFeedingRecords
);

/**
 * @route   POST /feeding/records
 * @desc    Crear nuevo registro de alimentación
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, NUTRITIONIST)
 * @body    { bovineIds: string[], feedType: string, quantity: number, feedingTime: string, location: object, cost?: number, supplements?: array }
 */
router.post(
  '/records',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 registros por usuario cada 10 minutos
    message: 'Too many feeding record creations'
  }),
  uploadMiddleware.array('feedingPhotos', 5), // fotos del alimento y consumo
  inventoryMiddleware, // actualizar inventario automáticamente
  costCalculationMiddleware, // calcular costos automáticamente
  weatherDataMiddleware, // registrar condiciones climáticas
  createFeedingRecordValidationRules(),
  validationMiddleware,
  feedingController.createFeedingRecord
);

/**
 * @route   GET /feeding/records/:id
 * @desc    Obtener detalles específicos de un registro de alimentación
 * @access  Private
 * @params  id: string (UUID del registro)
 */
router.get(
  '/records/:id',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 200, // máximo 200 consultas por usuario cada 5 minutos
    message: 'Too many record detail requests'
  }),
  feedingController.getFeedingRecordById
);

/**
 * @route   PUT /feeding/records/:id
 * @desc    Actualizar registro de alimentación existente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, NUTRITIONIST)
 * @params  id: string (UUID del registro)
 * @body    Campos a actualizar del registro
 */
router.put(
  '/records/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 40, // máximo 40 actualizaciones por usuario cada 15 minutos
    message: 'Too many record update attempts'
  }),
  uploadMiddleware.array('feedingPhotos', 5),
  inventoryMiddleware,
  costCalculationMiddleware,
  updateFeedingRecordValidationRules(),
  validationMiddleware,
  feedingController.updateFeedingRecord
);

/**
 * @route   DELETE /feeding/records/:id
 * @desc    Eliminar registro de alimentación (soft delete)
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @params  id: string (UUID del registro)
 * @body    { reason?: string, adjustInventory?: boolean }
 */
router.delete(
  '/records/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 20, // máximo 20 eliminaciones por usuario cada 30 minutos
    message: 'Too many record deletion attempts'
  }),
  inventoryMiddleware, // revertir cambios de inventario
  feedingController.deleteFeedingRecord
);

// ============================================================================
// PLANES NUTRICIONALES
// ============================================================================

/**
 * @route   GET /feeding/plans
 * @desc    Obtener planes nutricionales disponibles
 * @access  Private
 * @query   ?status=active&targetGroup=lactating&includeArchived=false&nutritionist=123
 */
router.get(
  '/plans',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 consultas de planes por usuario cada 10 minutos
    message: 'Too many plan requests'
  }),
  feedingController.getNutritionalPlans
);

/**
 * @route   POST /feeding/plans
 * @desc    Crear nuevo plan nutricional
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST, VETERINARIAN)
 * @body    { name: string, description: string, targetGroup: string, lifestage: string, objectives: object, components: array, weeklySchedule: object }
 */
router.post(
  '/plans',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 planes nuevos por usuario cada 30 minutos
    message: 'Too many plan creation attempts'
  }),
  nutritionAnalysisMiddleware, // validar balance nutricional
  costCalculationMiddleware, // calcular costo diario del plan
  feedingPlanValidationRules(),
  validationMiddleware,
  feedingController.createNutritionalPlan
);

/**
 * @route   GET /feeding/plans/:id
 * @desc    Obtener detalles de un plan nutricional específico
 * @access  Private
 * @params  id: string (UUID del plan)
 * @query   ?includeNutritionalAnalysis=true&includeCostBreakdown=true
 */
router.get(
  '/plans/:id',
  feedingController.getNutritionalPlanById
);

/**
 * @route   PUT /feeding/plans/:id
 * @desc    Actualizar plan nutricional
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST, VETERINARIAN)
 * @params  id: string (UUID del plan)
 * @body    Campos a actualizar del plan
 */
router.put(
  '/plans/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 actualizaciones de planes por usuario cada 20 minutos
    message: 'Too many plan update attempts'
  }),
  nutritionAnalysisMiddleware,
  costCalculationMiddleware,
  feedingPlanValidationRules(),
  validationMiddleware,
  feedingController.updateNutritionalPlan
);

/**
 * @route   POST /feeding/plans/:id/assign
 * @desc    Asignar plan nutricional a bovinos específicos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST)
 * @params  id: string (UUID del plan)
 * @body    { bovineIds: string[], startDate: string, duration?: number, adjustForBodyWeight?: boolean, monitoringSchedule?: object }
 */
router.post(
  '/plans/:id/assign',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 asignaciones por usuario cada 15 minutos
    message: 'Too many plan assignment attempts'
  }),
  feedingController.assignNutritionalPlan
);

/**
 * @route   PUT /feeding/plans/:id/activate
 * @desc    Activar plan nutricional
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST, VETERINARIAN)
 * @params  id: string (UUID del plan)
 * @body    { effectiveDate: string, approvedBy: string, veterinarianApproval?: boolean }
 */
router.put(
  '/plans/:id/activate',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST', 'VETERINARIAN']),
  feedingController.activateNutritionalPlan
);

// ============================================================================
// PROGRAMACIÓN DE ALIMENTACIÓN (SCHEDULING)
// ============================================================================

/**
 * @route   GET /feeding/schedule
 * @desc    Obtener programa de alimentación actual
 * @access  Private
 * @query   ?date=2025-07-22&includeNextWeek=true&location=all&filterByBovine=123
 */
router.get(
  '/schedule',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 60, // máximo 60 consultas de horarios por usuario cada 5 minutos
    message: 'Too many schedule requests'
  }),
  feedingController.getFeedingSchedule
);

/**
 * @route   POST /feeding/schedule
 * @desc    Crear programa de alimentación
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST)
 * @body    { planId: string, bovineIds: string[], startDate: string, dailySchedule: object, weeklyPattern: object, duration: number }
 */
router.post(
  '/schedule',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 programaciones por usuario cada 20 minutos
    message: 'Too many schedule creation attempts'
  }),
  feedingScheduleValidationRules(),
  validationMiddleware,
  feedingController.createFeedingSchedule
);

/**
 * @route   PUT /feeding/schedule/:id
 * @desc    Actualizar programa de alimentación
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST)
 * @params  id: string (UUID del programa)
 * @body    Campos a actualizar del programa
 */
router.put(
  '/schedule/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 actualizaciones de horarios por usuario cada 15 minutos
    message: 'Too many schedule update attempts'
  }),
  feedingScheduleValidationRules(),
  validationMiddleware,
  feedingController.updateFeedingSchedule
);

/**
 * @route   GET /feeding/schedule/today
 * @desc    Obtener programa de alimentación para hoy
 * @access  Private
 * @query   ?includeCompleted=false&groupByTime=true&includeAlerts=true
 */
router.get(
  '/schedule/today',
  rateLimitMiddleware({ 
    windowMs: 2 * 60 * 1000, // 2 minutos
    max: 100, // máximo 100 consultas diarias por usuario cada 2 minutos
    message: 'Too many daily schedule requests'
  }),
  feedingController.getTodayFeedingSchedule
);

/**
 * @route   POST /feeding/schedule/bulk-update
 * @desc    Actualización masiva de horarios de alimentación
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST)
 * @body    { scheduleIds: string[], updates: object, reason: string, notifyWorkers?: boolean }
 */
router.post(
  '/schedule/bulk-update',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 5, // máximo 5 actualizaciones masivas por usuario cada 30 minutos
    message: 'Too many bulk schedule updates'
  }),
  feedingController.bulkUpdateFeedingSchedule
);

// ============================================================================
// SEGUIMIENTO DE CONSUMO
// ============================================================================

/**
 * @route   POST /feeding/consumption
 * @desc    Registrar consumo real de alimento
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, NUTRITIONIST)
 * @body    { feedingRecordId: string, bovineId: string, actualQuantity: number, refusalQuantity: number, behaviorNotes: string, healthObservations: string[] }
 */
router.post(
  '/consumption',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 60, // máximo 60 registros de consumo por usuario cada 10 minutos
    message: 'Too many consumption records'
  }),
  uploadMiddleware.array('consumptionPhotos', 3), // fotos del consumo y residuos
  consumptionTrackingValidationRules(),
  validationMiddleware,
  feedingController.recordConsumption
);

/**
 * @route   GET /feeding/consumption/:bovineId
 * @desc    Obtener historial de consumo de un bovino específico
 * @access  Private
 * @params  bovineId: string (UUID del bovino)
 * @query   ?period=30d&includeNutritionalAnalysis=true&includeAverages=true
 */
router.get(
  '/consumption/:bovineId',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 40, // máximo 40 consultas de historial por usuario cada 10 minutos
    message: 'Too many consumption history requests'
  }),
  feedingController.getBovineConsumptionHistory
);

/**
 * @route   GET /feeding/consumption/analytics
 * @desc    Análisis de patrones de consumo del rebaño
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST, VETERINARIAN)
 * @query   ?period=90d&groupBy=lifestage&includeEfficiency=true&includeWeatherCorrelation=true
 */
router.get(
  '/consumption/analytics',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 análisis por usuario cada 15 minutos
    message: 'Too many consumption analytics requests'
  }),
  feedingController.getConsumptionAnalytics
);

/**
 * @route   PUT /feeding/consumption/:id
 * @desc    Actualizar registro de consumo
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, NUTRITIONIST)
 * @params  id: string (UUID del registro de consumo)
 * @body    Campos a actualizar del registro de consumo
 */
router.put(
  '/consumption/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 actualizaciones de consumo por usuario cada 15 minutos
    message: 'Too many consumption update attempts'
  }),
  consumptionTrackingValidationRules(),
  validationMiddleware,
  feedingController.updateConsumptionRecord
);

// ============================================================================
// ANÁLISIS NUTRICIONAL
// ============================================================================

/**
 * @route   POST /feeding/analysis/nutritional
 * @desc    Realizar análisis nutricional completo
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST, VETERINARIAN)
 * @body    { bovineIds?: string[], planId?: string, period: string, analysisType: string, includeDeficiencies: boolean }
 */
router.post(
  '/analysis/nutritional',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 análisis nutricionales por usuario cada 30 minutos
    message: 'Too many nutritional analysis requests'
  }),
  nutritionalAnalysisValidationRules(),
  validationMiddleware,
  feedingController.performNutritionalAnalysis
);

/**
 * @route   GET /feeding/analysis/deficiencies
 * @desc    Detectar deficiencias nutricionales en el rebaño
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST, VETERINARIAN)
 * @query   ?severity=all&includeRecommendations=true&groupByLifestage=true
 */
router.get(
  '/analysis/deficiencies',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 análisis de deficiencias por usuario cada 15 minutos
    message: 'Too many deficiency analysis requests'
  }),
  feedingController.analyzeNutritionalDeficiencies
);

/**
 * @route   POST /feeding/analysis/balance
 * @desc    Analizar balance nutricional de dietas actuales
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST, VETERINARIAN)
 * @body    { planIds: string[], targetMetrics: string[], includeOptimization: boolean }
 */
router.post(
  '/analysis/balance',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 análisis de balance por usuario cada 20 minutos
    message: 'Too many balance analysis requests'
  }),
  feedingController.analyzeDietBalance
);

/**
 * @route   GET /feeding/analysis/efficiency
 * @desc    Análisis de eficiencia alimentaria del rebaño
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST)
 * @query   ?period=180d&includeConversionRates=true&includeCostAnalysis=true&groupBy=type
 */
router.get(
  '/analysis/efficiency',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 análisis de eficiencia por usuario cada 20 minutos
    message: 'Too many efficiency analysis requests'
  }),
  feedingController.analyzeFeedEfficiency
);

// ============================================================================
// GESTIÓN DE INVENTARIO DE ALIMENTOS
// ============================================================================

/**
 * @route   GET /feeding/inventory
 * @desc    Obtener inventario actual de alimentos
 * @access  Private
 * @query   ?category=all&status=in_stock&includeExpiring=true&sortBy=expiration&includeNutritionalInfo=true
 */
router.get(
  '/inventory',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 consultas de inventario por usuario cada 10 minutos
    message: 'Too many inventory requests'
  }),
  feedingController.getFeedInventory
);

/**
 * @route   POST /feeding/inventory
 * @desc    Agregar nuevo lote de alimento al inventario
 * @access  Private (Roles: RANCH_OWNER, ADMIN, INVENTORY_MANAGER)
 * @body    { feedType: string, quantity: number, unit: string, supplier: string, batchNumber: string, expirationDate: string, costPerUnit: number, nutritionalInfo: object }
 */
router.post(
  '/inventory',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'INVENTORY_MANAGER']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 adiciones de inventario por usuario cada 15 minutos
    message: 'Too many inventory additions'
  }),
  uploadMiddleware.array('feedPhotos', 5), // fotos del lote de alimento
  feedInventoryValidationRules(),
  validationMiddleware,
  feedingController.addFeedToInventory
);

/**
 * @route   PUT /feeding/inventory/:id
 * @desc    Actualizar información de lote de alimento
 * @access  Private (Roles: RANCH_OWNER, ADMIN, INVENTORY_MANAGER)
 * @params  id: string (UUID del lote)
 * @body    Campos a actualizar del lote
 */
router.put(
  '/inventory/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'INVENTORY_MANAGER']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 actualizaciones de inventario por usuario cada 15 minutos
    message: 'Too many inventory updates'
  }),
  feedInventoryValidationRules(),
  validationMiddleware,
  feedingController.updateFeedInventory
);

/**
 * @route   GET /feeding/inventory/alerts
 * @desc    Obtener alertas de inventario (stock bajo, vencimientos, etc.)
 * @access  Private
 * @query   ?alertType=all&severity=high&includeProjections=true
 */
router.get(
  '/inventory/alerts',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 60, // máximo 60 consultas de alertas por usuario cada 5 minutos
    message: 'Too many inventory alert requests'
  }),
  feedingController.getFeedInventoryAlerts
);

/**
 * @route   POST /feeding/inventory/transfer
 * @desc    Transferir alimento entre ubicaciones
 * @access  Private (Roles: RANCH_OWNER, ADMIN, INVENTORY_MANAGER, WORKER)
 * @body    { fromLocationId: string, toLocationId: string, feedId: string, quantity: number, reason: string, transportMethod?: string }
 */
router.post(
  '/inventory/transfer',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'INVENTORY_MANAGER', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 transferencias por usuario cada 15 minutos
    message: 'Too many inventory transfers'
  }),
  feedingController.transferFeedInventory
);

// ============================================================================
// SUPLEMENTACIÓN ESPECIALIZADA
// ============================================================================

/**
 * @route   GET /feeding/supplements
 * @desc    Obtener catálogo de suplementos disponibles
 * @access  Private
 * @query   ?category=vitamin&targetLifestage=lactating&includeNutritionalInfo=true
 */
router.get(
  '/supplements',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 40, // máximo 40 consultas de suplementos por usuario cada 10 minutos
    message: 'Too many supplement requests'
  }),
  feedingController.getSupplements
);

/**
 * @route   POST /feeding/supplements/program
 * @desc    Crear programa de suplementación
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST, VETERINARIAN)
 * @body    { bovineIds: string[], supplements: array, duration: number, dosageProtocol: object, monitoringPlan: object }
 */
router.post(
  '/supplements/program',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 programas de suplementación por usuario cada 20 minutos
    message: 'Too many supplementation programs'
  }),
  supplementationValidationRules(),
  validationMiddleware,
  feedingController.createSupplementationProgram
);

/**
 * @route   GET /feeding/supplements/recommendations
 * @desc    Obtener recomendaciones de suplementación basadas en análisis
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST, VETERINARIAN)
 * @query   ?bovineIds=123,456&includeSeasonalAdjustments=true&includeCostAnalysis=true
 */
router.get(
  '/supplements/recommendations',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 consultas de recomendaciones por usuario cada 15 minutos
    message: 'Too many recommendation requests'
  }),
  feedingController.getSupplementationRecommendations
);

// ============================================================================
// FORMULACIÓN DE DIETAS
// ============================================================================

/**
 * @route   POST /feeding/diet-formulation
 * @desc    Formular dieta personalizada usando algoritmos de optimización
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST, VETERINARIAN)
 * @body    { targetGroup: string, lifestage: string, objectives: object, constraints: object, availableFeeds: string[], optimizationCriteria: string }
 */
router.post(
  '/diet-formulation',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 formulaciones por usuario cada 30 minutos
    message: 'Too many diet formulation requests'
  }),
  dietFormulationValidationRules(),
  validationMiddleware,
  feedingController.formulateDiet
);

/**
 * @route   POST /feeding/diet-optimization
 * @desc    Optimizar dieta existente para minimizar costos o maximizar rendimiento
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST)
 * @body    { planId: string, optimizationGoal: string, constraints: object, maxCostIncrease?: number, minPerformanceLevel?: number }
 */
router.post(
  '/diet-optimization',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 8, // máximo 8 optimizaciones por usuario cada 30 minutos
    message: 'Too many diet optimization requests'
  }),
  feedingController.optimizeDiet
);

/**
 * @route   GET /feeding/diet-templates
 * @desc    Obtener plantillas de dietas predefinidas
 * @access  Private
 * @query   ?category=dairy&lifestage=lactating&season=dry&includeCustom=false
 */
router.get(
  '/diet-templates',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 consultas de plantillas por usuario cada 10 minutos
    message: 'Too many template requests'
  }),
  feedingController.getDietTemplates
);

// ============================================================================
// CONTROL DE CALIDAD DE ALIMENTOS
// ============================================================================

/**
 * @route   POST /feeding/quality-control
 * @desc    Registrar análisis de calidad de alimento
 * @access  Private (Roles: RANCH_OWNER, ADMIN, QUALITY_MANAGER, NUTRITIONIST)
 * @body    { feedBatchId: string, testType: string, analysisDate: string, results: object, laboratory?: string, certificationNumber?: string, approvalStatus: string }
 */
router.post(
  '/quality-control',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'QUALITY_MANAGER', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 análisis de calidad por usuario cada 20 minutos
    message: 'Too many quality control records'
  }),
  uploadMiddleware.array('qualityReports', 10), // reportes de laboratorio
  feedQualityValidationRules(),
  validationMiddleware,
  feedingController.recordFeedQualityControl
);

/**
 * @route   GET /feeding/quality-control/:batchId
 * @desc    Obtener historial de control de calidad de un lote específico
 * @access  Private
 * @params  batchId: string (ID del lote)
 */
router.get(
  '/quality-control/:batchId',
  feedingController.getFeedQualityHistory
);

/**
 * @route   GET /feeding/quality-alerts
 * @desc    Obtener alertas de calidad de alimentos
 * @access  Private
 * @query   ?severity=high&includeExpired=true&includeContaminated=true
 */
router.get(
  '/quality-alerts',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 50, // máximo 50 consultas de alertas por usuario cada 5 minutos
    message: 'Too many quality alert requests'
  }),
  feedingController.getFeedQualityAlerts
);

// ============================================================================
// OPERACIONES MASIVAS (BULK OPERATIONS)
// ============================================================================

/**
 * @route   POST /feeding/bulk-feeding
 * @desc    Registrar alimentación masiva para múltiples bovinos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER)
 * @body    { feedingData: array, location: object, feedingTime: string, responsibleWorker: string, groupType?: string }
 */
router.post(
  '/bulk-feeding',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 alimentaciones masivas por usuario cada 15 minutos
    message: 'Too many bulk feeding operations'
  }),
  uploadMiddleware.array('bulkFeedingPhotos', 10),
  inventoryMiddleware,
  bulkFeedingValidationRules(),
  validationMiddleware,
  feedingController.recordBulkFeeding
);

/**
 * @route   PUT /feeding/bulk-schedule-update
 * @desc    Actualizar horarios de alimentación en masa
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST)
 * @body    { bovineIds: string[], scheduleChanges: object, effectiveDate: string, reason: string }
 */
router.put(
  '/bulk-schedule-update',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 actualizaciones masivas por usuario cada 30 minutos
    message: 'Too many bulk schedule updates'
  }),
  feedingController.bulkUpdateFeedingSchedules
);

/**
 * @route   POST /feeding/bulk-plan-assignment
 * @desc    Asignar planes nutricionales a múltiples bovinos simultáneamente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST)
 * @body    { assignments: array, startDate: string, transitionPeriod?: number, monitoringLevel: string }
 */
router.post(
  '/bulk-plan-assignment',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 8, // máximo 8 asignaciones masivas por usuario cada 30 minutos
    message: 'Too many bulk plan assignments'
  }),
  feedingController.bulkAssignNutritionalPlans
);

// ============================================================================
// ESTADÍSTICAS Y REPORTES
// ============================================================================

/**
 * @route   GET /feeding/statistics
 * @desc    Obtener estadísticas generales de alimentación
 * @access  Private
 * @query   ?period=30d&groupBy=feedType&includeConversionRates=true&includeCosts=true
 */
router.get(
  '/statistics',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 consultas estadísticas por usuario cada 15 minutos
    message: 'Too many statistics requests'
  }),
  feedingController.getFeedingStatistics
);

/**
 * @route   POST /feeding/reports/nutritional-summary
 * @desc    Generar reporte de resumen nutricional
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST, VETERINARIAN)
 * @body    { period: string, bovineGroups: string[], includeRecommendations: boolean, format: string, detailLevel: string }
 */
router.post(
  '/reports/nutritional-summary',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 reportes por usuario cada 30 minutos
    message: 'Too many report generation requests'
  }),
  feedingReportValidationRules(),
  validationMiddleware,
  feedingController.generateNutritionalSummaryReport
);

/**
 * @route   POST /feeding/reports/cost-analysis
 * @desc    Generar reporte de análisis de costos de alimentación
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @body    { period: string, costCategories: string[], includeProjections: boolean, comparisonPeriod?: string }
 */
router.post(
  '/reports/cost-analysis',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 8, // máximo 8 reportes de costos por usuario cada 30 minutos
    message: 'Too many cost analysis reports'
  }),
  feedingController.generateFeedingCostAnalysisReport
);

/**
 * @route   POST /feeding/reports/efficiency
 * @desc    Generar reporte de eficiencia alimentaria
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST)
 * @body    { period: string, metrics: string[], includeComparisons: boolean, benchmarkData?: boolean }
 */
router.post(
  '/reports/efficiency',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 reportes de eficiencia por usuario cada 30 minutos
    message: 'Too many efficiency reports'
  }),
  feedingController.generateFeedingEfficiencyReport
);

// ============================================================================
// EXPORTACIÓN E INTEGRACIÓN
// ============================================================================

/**
 * @route   POST /feeding/export
 * @desc    Exportar datos de alimentación en diferentes formatos
 * @access  Private
 * @body    { exportType: string, format: 'csv' | 'excel' | 'pdf', dateRange: object, includeImages: boolean, filters: object }
 */
router.post(
  '/export',
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 8, // máximo 8 exportaciones por usuario cada 30 minutos
    message: 'Too many export requests'
  }),
  feedingController.exportFeedingData
);

/**
 * @route   GET /feeding/export/:exportId/download
 * @desc    Descargar archivo de datos de alimentación exportado
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
  feedingController.downloadFeedingExport
);

/**
 * @route   POST /feeding/import/nutritional-data
 * @desc    Importar datos nutricionales desde archivos externos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST)
 * @body    FormData con archivo de datos nutricionales
 */
router.post(
  '/import/nutritional-data',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // máximo 5 importaciones por usuario cada hora
    message: 'Too many import attempts'
  }),
  uploadMiddleware.single('nutritionalDataFile'),
  feedingController.importNutritionalData
);

// ============================================================================
// ALERTAS Y NOTIFICACIONES ESPECIALIZADAS
// ============================================================================

/**
 * @route   GET /feeding/alerts
 * @desc    Obtener alertas relacionadas con alimentación
 * @access  Private
 * @query   ?alertType=all&severity=high&includeResolved=false&sortBy=priority
 */
router.get(
  '/alerts',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 60, // máximo 60 consultas de alertas por usuario cada 5 minutos
    message: 'Too many alert requests'
  }),
  feedingController.getFeedingAlerts
);

/**
 * @route   POST /feeding/alerts/schedule-reminder
 * @desc    Crear recordatorio personalizado para horarios de alimentación
 * @access  Private (Roles: RANCH_OWNER, ADMIN, WORKER, NUTRITIONIST)
 * @body    { scheduleId: string, reminderTime: string, recipients: string[], message?: string, recurring: boolean }
 */
router.post(
  '/alerts/schedule-reminder',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'WORKER', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 recordatorios por usuario cada 15 minutos
    message: 'Too many reminder creations'
  }),
  feedingController.createFeedingScheduleReminder
);

/**
 * @route   PUT /feeding/alerts/:id/acknowledge
 * @desc    Reconocer alerta de alimentación
 * @access  Private
 * @params  id: string (UUID de la alerta)
 * @body    { acknowledgement: string, actionTaken?: string, resolvedBy: string }
 */
router.put(
  '/alerts/:id/acknowledge',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 reconocimientos por usuario cada 10 minutos
    message: 'Too many alert acknowledgements'
  }),
  feedingController.acknowledgeFeedingAlert
);

// ============================================================================
// CONFIGURACIÓN Y PREFERENCIAS
// ============================================================================

/**
 * @route   GET /feeding/settings
 * @desc    Obtener configuración del sistema de alimentación
 * @access  Private
 */
router.get(
  '/settings',
  feedingController.getFeedingSettings
);

/**
 * @route   PUT /feeding/settings
 * @desc    Actualizar configuración del sistema de alimentación
 * @access  Private (Roles: RANCH_OWNER, ADMIN, NUTRITIONIST)
 * @body    { defaultFeedingTimes: string[], alertThresholds: object, automationSettings: object, nutritionalTargets: object }
 */
router.put(
  '/settings',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'NUTRITIONIST']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 actualizaciones de configuración por usuario cada 30 minutos
    message: 'Too many settings updates'
  }),
  feedingController.updateFeedingSettings
);

// ============================================================================
// MANEJO DE ERRORES ESPECÍFICOS PARA RUTAS DE ALIMENTACIÓN
// ============================================================================

/**
 * Middleware de manejo de errores específico para alimentación
 */
router.use((error: any, req: Request, res: Response, next: any) => {
  // Log del error para debugging
  console.error('Feeding Route Error:', {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  // Errores específicos de alimentación
  if (error.name === 'NutritionalPlanNotFoundError') {
    return res.status(404).json({
      success: false,
      message: 'Plan nutricional no encontrado',
      error: 'NUTRITIONAL_PLAN_NOT_FOUND'
    });
  }

  if (error.name === 'InsufficientFeedInventoryError') {
    return res.status(400).json({
      success: false,
      message: 'Inventario de alimento insuficiente',
      error: 'INSUFFICIENT_FEED_INVENTORY',
      details: error.details
    });
  }

  if (error.name === 'NutritionalImbalanceError') {
    return res.status(400).json({
      success: false,
      message: 'Desbalance nutricional detectado',
      error: 'NUTRITIONAL_IMBALANCE',
      details: error.details
    });
  }

  if (error.name === 'FeedQualityError') {
    return res.status(400).json({
      success: false,
      message: 'Problema de calidad del alimento',
      error: 'FEED_QUALITY_ERROR',
      details: error.details
    });
  }

  if (error.name === 'ScheduleConflictError') {
    return res.status(409).json({
      success: false,
      message: 'Conflicto en programación de alimentación',
      error: 'SCHEDULE_CONFLICT',
      details: error.details
    });
  }

  if (error.name === 'DietFormulationError') {
    return res.status(400).json({
      success: false,
      message: 'Error en formulación de dieta',
      error: 'DIET_FORMULATION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'InventoryUpdateError') {
    return res.status(500).json({
      success: false,
      message: 'Error al actualizar inventario',
      error: 'INVENTORY_UPDATE_ERROR',
      details: error.details
    });
  }

  if (error.name === 'ConsumptionTrackingError') {
    return res.status(400).json({
      success: false,
      message: 'Error en seguimiento de consumo',
      error: 'CONSUMPTION_TRACKING_ERROR',
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