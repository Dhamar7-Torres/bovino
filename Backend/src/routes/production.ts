import { Router, Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';
import { Op, WhereOptions } from 'sequelize';
import { 
  authenticateToken, 
  authorizeRoles, 
  validateRequest,
  auditLog,
  rateLimitByUserId
} from '../middleware';
import { 
  ProductionController,
  MilkProductionController,
  MeatProductionController,
  BreedingProductionController 
} from '../controllers';

const router = Router();

// ===================================================================
// MIDDLEWARE DE VALIDACIÓN PERSONALIZADA
// ===================================================================

// Validar fecha y hora para registros de producción
const validateProductionDateTime = [
  body('date')
    .isISO8601()
    .withMessage('La fecha debe ser válida en formato ISO'),
  body('time')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('La hora debe estar en formato HH:MM')
];

// Validar coordenadas de ubicación
const validateLocation = [
  body('location.latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitud debe estar entre -90 y 90 grados'),
  body('location.longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitud debe estar entre -180 y 180 grados'),
  body('location.accuracy')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('La precisión debe ser un número positivo'),
  body('location.name')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('El nombre de ubicación debe tener entre 1 y 100 caracteres')
];

// Validar números positivos
const validatePositiveNumber = (field: string, max?: number) => {
  const validator = body(field).isFloat({ min: 0 });
  if (max) {
    validator.isFloat({ min: 0, max });
  }
  return validator.withMessage(`${field} debe ser un número positivo${max ? ` menor a ${max}` : ''}`);
};

// Validar porcentajes
const validatePercentage = (field: string) =>
  body(field)
    .isFloat({ min: 0, max: 100 })
    .withMessage(`${field} debe ser un porcentaje entre 0 y 100`);

// ===================================================================
// RUTAS DEL DASHBOARD DE PRODUCCIÓN
// ===================================================================

/**
 * GET /api/production/dashboard
 * Dashboard general de producción con estadísticas principales
 */
router.get('/dashboard',
  authenticateToken,
  query('timeRange')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Rango de tiempo inválido'),
  query('ranchId')
    .optional()
    .isUUID()
    .withMessage('ID de rancho debe ser un UUID válido'),
  query('productionType')
    .optional()
    .isIn(['milk', 'meat', 'breeding', 'all'])
    .withMessage('Tipo de producción inválido'),
  validateRequest,
  auditLog('production.dashboard.view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        timeRange = '30d', 
        ranchId, 
        productionType = 'all' 
      } = req.query;
      const userId = req.user?.id;

      const dashboardData = await ProductionController.getDashboardStats({
        timeRange: timeRange as string,
        ranchId: ranchId as string,
        productionType: productionType as string,
        userId
      });

      res.json({
        success: true,
        data: dashboardData,
        message: 'Dashboard de producción obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/production/analytics
 * Análisis avanzado de producción con tendencias y comparaciones
 */
router.get('/analytics',
  authenticateToken,
  query('period')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Período de análisis inválido'),
  query('metrics')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const metrics = value.split(',');
        const validMetrics = ['volume', 'quality', 'efficiency', 'profitability', 'growth'];
        return metrics.every(metric => validMetrics.includes(metric));
      }
      return true;
    })
    .withMessage('Métricas inválidas'),
  query('compareWithIndustry')
    .optional()
    .isBoolean()
    .withMessage('Comparación con industria debe ser verdadero o falso'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        period = 'monthly', 
        metrics, 
        compareWithIndustry = false 
      } = req.query;
      const userId = req.user?.id;

      const analytics = await ProductionController.getProductionAnalytics({
        period: period as string,
        metrics: metrics ? (metrics as string).split(',') : undefined,
        compareWithIndustry: compareWithIndustry === 'true',
        userId
      });

      res.json({
        success: true,
        data: analytics,
        message: 'Análisis de producción generado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE PRODUCCIÓN LÁCTEA
// ===================================================================

/**
 * GET /api/production/milk
 * Obtiene registros de producción láctea con filtros
 */
router.get('/milk',
  authenticateToken,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  query('bovineId')
    .optional()
    .isUUID()
    .withMessage('ID de bovino debe ser un UUID válido'),
  query('earTag')
    .optional()
    .isLength({ min: 1, max: 20 })
    .withMessage('Arete debe tener entre 1 y 20 caracteres'),
  query('session')
    .optional()
    .isIn(['morning', 'afternoon', 'evening', 'night'])
    .withMessage('Sesión de ordeño inválida'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde debe ser válida'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta debe ser válida'),
  query('minVolume')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Volumen mínimo debe ser un número positivo'),
  query('qualityGrade')
    .optional()
    .isIn(['premium', 'grade_a', 'grade_b', 'manufacturing', 'rejected'])
    .withMessage('Grado de calidad inválido'),
  validateRequest,
  auditLog('production.milk.list'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 20,
        bovineId,
        earTag,
        session,
        dateFrom,
        dateTo,
        minVolume,
        qualityGrade
      } = req.query;

      const userId = req.user?.id;

      const filters = {
        bovineId: bovineId as string,
        earTag: earTag as string,
        session: session as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        minVolume: minVolume ? parseFloat(minVolume as string) : undefined,
        qualityGrade: qualityGrade as string
      };

      const milkRecords = await MilkProductionController.getMilkRecords({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filters,
        userId
      });

      res.json({
        success: true,
        data: milkRecords,
        message: 'Registros de producción láctea obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/production/milk
 * Registra nueva producción láctea con geolocalización
 */
router.post('/milk',
  authenticateToken,
  authorizeRoles(['admin', 'veterinarian', 'ranch_manager', 'milker']),
  [
    body('bovineId')
      .isUUID()
      .withMessage('ID de bovino debe ser un UUID válido'),
    body('earTag')
      .notEmpty()
      .isLength({ min: 1, max: 20 })
      .withMessage('Arete debe tener entre 1 y 20 caracteres'),
    ...validateProductionDateTime,
    body('session')
      .isIn(['morning', 'afternoon', 'evening', 'night'])
      .withMessage('Sesión de ordeño inválida'),
    validatePositiveNumber('volume', 50), // máximo 50 litros por sesión
    body('duration')
      .optional()
      .isInt({ min: 1, max: 120 })
      .withMessage('Duración debe estar entre 1 y 120 minutos'),
    body('flowRate')
      .optional()
      .isFloat({ min: 0.1, max: 10 })
      .withMessage('Tasa de flujo debe estar entre 0.1 y 10 L/min'),
    // Composición de leche
    body('composition.fat')
      .optional()
      .isFloat({ min: 0, max: 15 })
      .withMessage('Grasa debe estar entre 0 y 15%'),
    body('composition.protein')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Proteína debe estar entre 0 y 10%'),
    body('composition.lactose')
      .optional()
      .isFloat({ min: 0, max: 8 })
      .withMessage('Lactosa debe estar entre 0 y 8%'),
    body('composition.solidsNotFat')
      .optional()
      .isFloat({ min: 0, max: 15 })
      .withMessage('Sólidos no grasos debe estar entre 0 y 15%'),
    // Calidad de leche
    body('quality.somaticCellCount')
      .optional()
      .isInt({ min: 0, max: 10000000 })
      .withMessage('Conteo de células somáticas inválido'),
    body('quality.bacterialCount')
      .optional()
      .isInt({ min: 0, max: 1000000 })
      .withMessage('Conteo bacteriano inválido'),
    body('quality.ph')
      .optional()
      .isFloat({ min: 6.0, max: 8.0 })
      .withMessage('pH debe estar entre 6.0 y 8.0'),
    body('quality.temperature')
      .optional()
      .isFloat({ min: 0, max: 50 })
      .withMessage('Temperatura debe estar entre 0 y 50°C'),
    body('quality.grade')
      .optional()
      .isIn(['premium', 'grade_a', 'grade_b', 'manufacturing', 'rejected'])
      .withMessage('Grado de calidad inválido'),
    // Equipo de ordeño
    body('equipment.systemType')
      .optional()
      .isIn(['manual', 'bucket_milker', 'pipeline', 'herringbone', 'parallel', 'rotary', 'robotic'])
      .withMessage('Tipo de sistema de ordeño inválido'),
    body('equipment.equipmentId')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('ID de equipo debe tener entre 1 y 50 caracteres'),
    body('equipment.vacuum')
      .optional()
      .isFloat({ min: 35, max: 55 })
      .withMessage('Vacío debe estar entre 35 y 55 kPa'),
    body('equipment.pulsationRate')
      .optional()
      .isInt({ min: 40, max: 120 })
      .withMessage('Tasa de pulsación debe estar entre 40 y 120 pulsos/min'),
    // Ubicación geográfica
    ...validateLocation,
    body('treatmentFlag')
      .optional()
      .isBoolean()
      .withMessage('Bandera de tratamiento debe ser verdadero o falso'),
    body('withholdingPeriod')
      .optional()
      .isInt({ min: 0, max: 365 })
      .withMessage('Período de retención debe estar entre 0 y 365 días'),
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Las notas no pueden exceder 1000 caracteres')
  ],
  validateRequest,
  auditLog('production.milk.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const milkData = req.body;
      const userId = req.user?.id;

      const newMilkRecord = await MilkProductionController.createMilkRecord({
        ...milkData,
        recordedBy: userId,
        timestamp: new Date()
      });

      res.status(201).json({
        success: true,
        data: newMilkRecord,
        message: 'Registro de producción láctea creado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/production/milk/statistics
 * Estadísticas de producción láctea
 */
router.get('/milk/statistics',
  authenticateToken,
  query('bovineId')
    .optional()
    .isUUID()
    .withMessage('ID de bovino debe ser un UUID válido'),
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'year'])
    .withMessage('Período inválido'),
  query('groupBy')
    .optional()
    .isIn(['cow', 'session', 'date', 'quality'])
    .withMessage('Agrupación inválida'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { bovineId, period = 'month', groupBy = 'cow' } = req.query;
      const userId = req.user?.id;

      const statistics = await MilkProductionController.getMilkStatistics({
        bovineId: bovineId as string,
        period: period as string,
        groupBy: groupBy as string,
        userId
      });

      res.json({
        success: true,
        data: statistics,
        message: 'Estadísticas de producción láctea obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE PRODUCCIÓN CÁRNICA
// ===================================================================

/**
 * GET /api/production/meat
 * Obtiene registros de producción cárnica (peso, crecimiento)
 */
router.get('/meat',
  authenticateToken,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  query('bovineId')
    .optional()
    .isUUID()
    .withMessage('ID de bovino debe ser un UUID válido'),
  query('ageRange')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const range = value.split('-').map(Number);
        if (range.length !== 2 || range.some(isNaN) || range[0] > range[1]) {
          throw new Error('Rango de edad debe ser formato: min-max (ej: 6-24)');
        }
      }
      return true;
    }),
  query('weightRange')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const range = value.split('-').map(Number);
        if (range.length !== 2 || range.some(isNaN) || range[0] > range[1]) {
          throw new Error('Rango de peso debe ser formato: min-max (ej: 200-800)');
        }
      }
      return true;
    }),
  query('productionSystem')
    .optional()
    .isIn(['feedlot', 'pasture', 'semi_intensive', 'extensive'])
    .withMessage('Sistema de producción inválido'),
  validateRequest,
  auditLog('production.meat.list'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 20,
        bovineId,
        ageRange,
        weightRange,
        productionSystem
      } = req.query;

      const userId = req.user?.id;

      const filters = {
        bovineId: bovineId as string,
        ageRange: ageRange ? (ageRange as string).split('-').map(Number) : undefined,
        weightRange: weightRange ? (weightRange as string).split('-').map(Number) : undefined,
        productionSystem: productionSystem as string
      };

      const meatRecords = await MeatProductionController.getMeatRecords({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filters,
        userId
      });

      res.json({
        success: true,
        data: meatRecords,
        message: 'Registros de producción cárnica obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/production/meat
 * Registra pesaje y medidas corporales para producción cárnica
 */
router.post('/meat',
  authenticateToken,
  authorizeRoles(['admin', 'veterinarian', 'ranch_manager', 'technician']),
  [
    body('bovineId')
      .isUUID()
      .withMessage('ID de bovino debe ser un UUID válido'),
    body('earTag')
      .notEmpty()
      .isLength({ min: 1, max: 20 })
      .withMessage('Arete debe tener entre 1 y 20 caracteres'),
    body('measurementDate')
      .isISO8601()
      .withMessage('Fecha de medición debe ser válida'),
    validatePositiveNumber('liveWeight', 2000), // máximo 2000 kg
    body('projectedWeight')
      .optional()
      .isFloat({ min: 0, max: 2000 })
      .withMessage('Peso proyectado debe estar entre 0 y 2000 kg'),
    // Ganancia de peso
    body('weightGain.dailyGain')
      .optional()
      .isFloat({ min: -5, max: 10 })
      .withMessage('Ganancia diaria debe estar entre -5 y 10 kg'),
    body('weightGain.weeklyGain')
      .optional()
      .isFloat({ min: -35, max: 70 })
      .withMessage('Ganancia semanal debe estar entre -35 y 70 kg'),
    body('weightGain.monthlyGain')
      .optional()
      .isFloat({ min: -150, max: 300 })
      .withMessage('Ganancia mensual debe estar entre -150 y 300 kg'),
    body('weightGain.totalGain')
      .optional()
      .isFloat({ min: -500, max: 1000 })
      .withMessage('Ganancia total debe estar entre -500 y 1000 kg'),
    // Medidas corporales
    body('bodyMeasurements.height')
      .optional()
      .isFloat({ min: 50, max: 200 })
      .withMessage('Altura debe estar entre 50 y 200 cm'),
    body('bodyMeasurements.length')
      .optional()
      .isFloat({ min: 50, max: 300 })
      .withMessage('Longitud debe estar entre 50 y 300 cm'),
    body('bodyMeasurements.heartGirth')
      .optional()
      .isFloat({ min: 50, max: 300 })
      .withMessage('Perímetro torácico debe estar entre 50 y 300 cm'),
    body('bodyMeasurements.hipWidth')
      .optional()
      .isFloat({ min: 20, max: 100 })
      .withMessage('Ancho de cadera debe estar entre 20 y 100 cm'),
    body('bodyMeasurements.scrotalCircumference')
      .optional()
      .isFloat({ min: 10, max: 50 })
      .withMessage('Circunferencia escrotal debe estar entre 10 y 50 cm'),
    // Eficiencia alimenticia
    body('feedEfficiency.feedIntake')
      .optional()
      .isFloat({ min: 0, max: 50 })
      .withMessage('Consumo de alimento debe estar entre 0 y 50 kg/día'),
    body('feedEfficiency.conversionRatio')
      .optional()
      .isFloat({ min: 0, max: 20 })
      .withMessage('Conversión alimenticia debe estar entre 0 y 20'),
    body('feedEfficiency.gainPerKgFeed')
      .optional()
      .isFloat({ min: 0, max: 2 })
      .withMessage('Ganancia por kg de alimento debe estar entre 0 y 2'),
    // Calidad de carne
    body('meatQuality.marbling')
      .optional()
      .isIn(['traces', 'slight', 'small', 'modest', 'moderate', 'slightly_abundant', 'moderately_abundant', 'abundant'])
      .withMessage('Marmoleo inválido'),
    body('meatQuality.fatThickness')
      .optional()
      .isFloat({ min: 0, max: 10 })
      .withMessage('Espesor de grasa debe estar entre 0 y 10 cm'),
    body('meatQuality.ribeye')
      .optional()
      .isFloat({ min: 0, max: 200 })
      .withMessage('Área de costilla debe estar entre 0 and 200 cm²'),
    body('meatQuality.grade')
      .optional()
      .isIn(['prime', 'choice', 'select', 'standard', 'commercial', 'utility', 'cutter', 'canner'])
      .withMessage('Grado de carne inválido'),
    // Proyección de sacrificio
    body('slaughterProjection.projectedDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha proyectada de sacrificio debe ser válida'),
    body('slaughterProjection.targetWeight')
      .optional()
      .isFloat({ min: 200, max: 1500 })
      .withMessage('Peso objetivo debe estar entre 200 y 1500 kg'),
    body('slaughterProjection.daysToTarget')
      .optional()
      .isInt({ min: 0, max: 1095 })
      .withMessage('Días al objetivo debe estar entre 0 y 1095'),
    body('slaughterProjection.projectedYield')
      .optional()
      .isFloat({ min: 30, max: 80 })
      .withMessage('Rendimiento proyectado debe estar entre 30 y 80%'),
    // Ubicación geográfica
    ...validateLocation,
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Las notas no pueden exceder 1000 caracteres')
  ],
  validateRequest,
  auditLog('production.meat.create'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meatData = req.body;
      const userId = req.user?.id;

      const newMeatRecord = await MeatProductionController.createMeatRecord({
        ...meatData,
        recordedBy: userId
      });

      res.status(201).json({
        success: true,
        data: newMeatRecord,
        message: 'Registro de producción cárnica creado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/production/meat/growth-analysis
 * Análisis de crecimiento y eficiencia para producción cárnica
 */
router.get('/meat/growth-analysis',
  authenticateToken,
  query('bovineId')
    .optional()
    .isUUID()
    .withMessage('ID de bovino debe ser un UUID válido'),
  query('breedId')
    .optional()
    .isUUID()
    .withMessage('ID de raza debe ser un UUID válido'),
  query('ageRange')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const range = value.split('-').map(Number);
        if (range.length !== 2 || range.some(isNaN)) {
          throw new Error('Rango de edad inválido');
        }
      }
      return true;
    }),
  query('analysisType')
    .optional()
    .isIn(['individual', 'breed', 'group', 'ranch'])
    .withMessage('Tipo de análisis inválido'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        bovineId, 
        breedId, 
        ageRange, 
        analysisType = 'individual' 
      } = req.query;
      const userId = req.user?.id;

      const growthAnalysis = await MeatProductionController.getGrowthAnalysis({
        bovineId: bovineId as string,
        breedId: breedId as string,
        ageRange: ageRange ? (ageRange as string).split('-').map(Number) : undefined,
        analysisType: analysisType as string,
        userId
      });

      res.json({
        success: true,
        data: growthAnalysis,
        message: 'Análisis de crecimiento obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE PRODUCCIÓN REPRODUCTIVA
// ===================================================================

/**
 * GET /api/production/breeding
 * Obtiene registros de producción reproductiva
 */
router.get('/breeding',
  authenticateToken,
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La página debe ser un número entero mayor a 0'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('El límite debe estar entre 1 y 100'),
  query('femaleId')
    .optional()
    .isUUID()
    .withMessage('ID de hembra debe ser un UUID válido'),
  query('eventType')
    .optional()
    .isIn(['insemination', 'natural_breeding', 'pregnancy_check', 'calving', 'weaning', 'heat_detection'])
    .withMessage('Tipo de evento reproductivo inválido'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'failed', 'cancelled'])
    .withMessage('Estado inválido'),
  query('pregnancyStatus')
    .optional()
    .isIn(['open', 'pregnant', 'uncertain'])
    .withMessage('Estado de gestación inválido'),
  validateRequest,
  auditLog('production.breeding.list'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        page = 1,
        limit = 20,
        femaleId,
        eventType,
        status,
        pregnancyStatus
      } = req.query;

      const userId = req.user?.id;

      const filters = {
        femaleId: femaleId as string,
        eventType: eventType as string,
        status: status as string,
        pregnancyStatus: pregnancyStatus as string
      };

      const breedingRecords = await BreedingProductionController.getBreedingRecords({
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        filters,
        userId
      });

      res.json({
        success: true,
        data: breedingRecords,
        message: 'Registros de producción reproductiva obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/production/breeding/insemination
 * Registra inseminación artificial
 */
router.post('/breeding/insemination',
  authenticateToken,
  authorizeRoles(['admin', 'veterinarian', 'ranch_manager', 'inseminator']),
  [
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
    body('semenBatch')
      .notEmpty()
      .isLength({ min: 1, max: 50 })
      .withMessage('Lote de semen debe tener entre 1 y 50 caracteres'),
    body('semenProvider')
      .notEmpty()
      .isLength({ min: 1, max: 100 })
      .withMessage('Proveedor de semen debe tener entre 1 y 100 caracteres'),
    body('inseminationDate')
      .isISO8601()
      .withMessage('Fecha de inseminación debe ser válida'),
    body('inseminationTime')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Hora de inseminación debe estar en formato HH:MM'),
    body('heatDetectionDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha de detección de celo debe ser válida'),
    body('heatIntensity')
      .optional()
      .isIn(['weak', 'moderate', 'strong'])
      .withMessage('Intensidad de celo inválida'),
    body('cervixCondition')
      .optional()
      .isIn(['tight', 'relaxed', 'optimal'])
      .withMessage('Condición cervical inválida'),
    body('inseminationMethod')
      .optional()
      .isIn(['rectovaginal', 'speculum', 'artificial_vagina'])
      .withMessage('Método de inseminación inválido'),
    body('technician')
      .notEmpty()
      .isLength({ min: 1, max: 100 })
      .withMessage('Técnico debe tener entre 1 y 100 caracteres'),
    body('expectedCalvingDate')
      .optional()
      .isISO8601()
      .withMessage('Fecha esperada de parto debe ser válida'),
    // Ubicación geográfica
    ...validateLocation,
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Las notas no pueden exceder 1000 caracteres')
  ],
  validateRequest,
  auditLog('production.breeding.insemination'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const inseminationData = req.body;
      const userId = req.user?.id;

      const newInsemination = await BreedingProductionController.recordInsemination({
        ...inseminationData,
        recordedBy: userId
      });

      res.status(201).json({
        success: true,
        data: newInsemination,
        message: 'Inseminación registrada exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/production/breeding/pregnancy-check
 * Registra diagnóstico de gestación
 */
router.post('/breeding/pregnancy-check',
  authenticateToken,
  authorizeRoles(['admin', 'veterinarian']),
  [
    body('femaleId')
      .isUUID()
      .withMessage('ID de hembra debe ser un UUID válido'),
    body('checkDate')
      .isISO8601()
      .withMessage('Fecha de diagnóstico debe ser válida'),
    body('method')
      .isIn(['palpation', 'ultrasound', 'blood_test', 'milk_test'])
      .withMessage('Método de diagnóstico inválido'),
    body('result')
      .isIn(['pregnant', 'open', 'uncertain'])
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
    body('twins')
      .optional()
      .isBoolean()
      .withMessage('Gemelos debe ser verdadero o falso'),
    body('veterinarian')
      .notEmpty()
      .isLength({ min: 1, max: 100 })
      .withMessage('Veterinario debe tener entre 1 y 100 caracteres'),
    body('nextCheckDate')
      .optional()
      .isISO8601()
      .withMessage('Próxima fecha de revisión debe ser válida'),
    // Ubicación geográfica
    ...validateLocation,
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Las notas no pueden exceder 1000 caracteres')
  ],
  validateRequest,
  auditLog('production.breeding.pregnancy_check'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pregnancyData = req.body;
      const userId = req.user?.id;

      const pregnancyCheck = await BreedingProductionController.recordPregnancyCheck({
        ...pregnancyData,
        recordedBy: userId
      });

      res.status(201).json({
        success: true,
        data: pregnancyCheck,
        message: 'Diagnóstico de gestación registrado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/production/breeding/calving
 * Registra evento de parto
 */
router.post('/breeding/calving',
  authenticateToken,
  authorizeRoles(['admin', 'veterinarian', 'ranch_manager']),
  [
    body('femaleId')
      .isUUID()
      .withMessage('ID de hembra debe ser un UUID válido'),
    body('calvingDate')
      .isISO8601()
      .withMessage('Fecha de parto debe ser válida'),
    body('calvingTime')
      .optional()
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Hora de parto debe estar en formato HH:MM'),
    body('difficulty')
      .isIn(['easy', 'moderate', 'difficult', 'assisted', 'cesarean'])
      .withMessage('Dificultad de parto inválida'),
    body('assistanceRequired')
      .isBoolean()
      .withMessage('Asistencia requerida debe ser verdadero o falso'),
    body('assistanceType')
      .optional()
      .isIn(['manual', 'mechanical', 'cesarean', 'veterinary'])
      .withMessage('Tipo de asistencia inválido'),
    body('calfGender')
      .isIn(['male', 'female'])
      .withMessage('Sexo del becerro inválido'),
    body('calfWeight')
      .optional()
      .isFloat({ min: 10, max: 100 })
      .withMessage('Peso del becerro debe estar entre 10 y 100 kg'),
    body('calfViability')
      .isIn(['alive_healthy', 'alive_weak', 'stillborn', 'died_shortly'])
      .withMessage('Viabilidad del becerro inválida'),
    body('placentaExpelled')
      .isBoolean()
      .withMessage('Placenta expulsada debe ser verdadero o falso'),
    body('placentaRetention')
      .optional()
      .isBoolean()
      .withMessage('Retención placentaria debe ser verdadero o falso'),
    body('damCondition')
      .isIn(['excellent', 'good', 'fair', 'poor', 'critical'])
      .withMessage('Condición de la madre inválida'),
    body('complications')
      .optional()
      .isArray()
      .withMessage('Complicaciones debe ser un array'),
    body('complications.*')
      .optional()
      .isIn(['dystocia', 'retained_placenta', 'uterine_prolapse', 'hemorrhage', 'milk_fever', 'mastitis'])
      .withMessage('Complicación inválida'),
    body('veterinarian')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Veterinario debe tener entre 1 y 100 caracteres'),
    // Ubicación geográfica
    ...validateLocation,
    body('notes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Las notas no pueden exceder 1000 caracteres')
  ],
  validateRequest,
  auditLog('production.breeding.calving'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const calvingData = req.body;
      const userId = req.user?.id;

      const calvingRecord = await BreedingProductionController.recordCalving({
        ...calvingData,
        recordedBy: userId
      });

      res.status(201).json({
        success: true,
        data: calvingRecord,
        message: 'Evento de parto registrado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/production/breeding/performance
 * Análisis de rendimiento reproductivo
 */
router.get('/breeding/performance',
  authenticateToken,
  query('period')
    .optional()
    .isIn(['year', 'season', 'month', 'custom'])
    .withMessage('Período inválido'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser válida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser válida'),
  query('breedId')
    .optional()
    .isUUID()
    .withMessage('ID de raza debe ser un UUID válido'),
  query('includeComparisons')
    .optional()
    .isBoolean()
    .withMessage('Incluir comparaciones debe ser verdadero o falso'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        period = 'year',
        startDate,
        endDate,
        breedId,
        includeComparisons = true
      } = req.query;
      const userId = req.user?.id;

      const performance = await BreedingProductionController.getReproductivePerformance({
        period: period as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        breedId: breedId as string,
        includeComparisons: includeComparisons === 'true',
        userId
      });

      res.json({
        success: true,
        data: performance,
        message: 'Análisis de rendimiento reproductivo obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE REPORTES DE PRODUCCIÓN
// ===================================================================

/**
 * GET /api/production/reports/productivity
 * Reporte integral de productividad del rancho
 */
router.get('/reports/productivity',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'accountant']),
  query('reportType')
    .optional()
    .isIn(['summary', 'detailed', 'comparative', 'financial'])
    .withMessage('Tipo de reporte inválido'),
  query('period')
    .optional()
    .isIn(['weekly', 'monthly', 'quarterly', 'yearly'])
    .withMessage('Período de reporte inválido'),
  query('includeProjections')
    .optional()
    .isBoolean()
    .withMessage('Incluir proyecciones debe ser verdadero o falso'),
  query('format')
    .optional()
    .isIn(['json', 'pdf', 'excel', 'csv'])
    .withMessage('Formato de exportación inválido'),
  validateRequest,
  auditLog('production.reports.productivity'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        reportType = 'summary',
        period = 'monthly',
        includeProjections = true,
        format = 'json'
      } = req.query;
      const userId = req.user?.id;

      const productivityReport = await ProductionController.generateProductivityReport({
        reportType: reportType as string,
        period: period as string,
        includeProjections: includeProjections === 'true',
        format: format as string,
        userId
      });

      if (format === 'json') {
        res.json({
          success: true,
          data: productivityReport,
          message: 'Reporte de productividad generado exitosamente'
        });
      } else {
        // Para otros formatos, configurar headers apropiados
        const contentTypes = {
          pdf: 'application/pdf',
          excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          csv: 'text/csv'
        };

        res.setHeader('Content-Type', contentTypes[format as keyof typeof contentTypes]);
        res.setHeader('Content-Disposition', `attachment; filename="productivity_report.${format}"`);
        res.send(productivityReport);
      }
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE GEOLOCALIZACIÓN DE PRODUCCIÓN
// ===================================================================

/**
 * GET /api/production/locations
 * Obtiene ubicaciones de eventos de producción para mapas
 */
router.get('/locations',
  authenticateToken,
  query('eventType')
    .optional()
    .isIn(['milking', 'weighing', 'insemination', 'calving', 'all'])
    .withMessage('Tipo de evento inválido'),
  query('dateFrom')
    .optional()
    .isISO8601()
    .withMessage('Fecha desde debe ser válida'),
  query('dateTo')
    .optional()
    .isISO8601()
    .withMessage('Fecha hasta debe ser válida'),
  query('bounds')
    .optional()
    .custom((value) => {
      if (value) {
        const bounds = value.split(',').map(Number);
        if (bounds.length !== 4 || bounds.some(isNaN)) {
          throw new Error('Los límites deben ser cuatro números separados por comas');
        }
      }
      return true;
    }),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        eventType = 'all', 
        dateFrom, 
        dateTo, 
        bounds 
      } = req.query;
      const userId = req.user?.id;

      let geoBounds;
      if (bounds) {
        const [swLat, swLng, neLat, neLng] = (bounds as string).split(',').map(Number);
        geoBounds = { swLat, swLng, neLat, neLng };
      }

      const productionLocations = await ProductionController.getProductionLocations({
        eventType: eventType as string,
        dateFrom: dateFrom ? new Date(dateFrom as string) : undefined,
        dateTo: dateTo ? new Date(dateTo as string) : undefined,
        bounds: geoBounds,
        userId
      });

      res.json({
        success: true,
        data: productionLocations,
        message: 'Ubicaciones de producción obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// EXPORTAR ROUTER
// ===================================================================

export default router;