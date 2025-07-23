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
  ReportsController,
  HealthReportsController,
  ProductionReportsController,
  InventoryReportsController,
  VaccinationReportsController,
  FinancialReportsController,
  GeographicReportsController
} from '../controllers';

const router = Router();

// ===================================================================
// MIDDLEWARE DE VALIDACIÓN PERSONALIZADA
// ===================================================================

// Validar rango de fechas para reportes
const validateDateRange = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de inicio debe ser válida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Fecha de fin debe ser válida'),
  query('startDate')
    .optional()
    .custom((value, { req }) => {
      if (value && req.query.endDate) {
        const start = new Date(value);
        const end = new Date(req.query.endDate as string);
        if (start >= end) {
          throw new Error('Fecha de inicio debe ser anterior a la fecha de fin');
        }
      }
      return true;
    })
];

// Validar formato de exportación
const validateExportFormat = query('format')
  .optional()
  .isIn(['json', 'pdf', 'excel', 'csv'])
  .withMessage('Formato de exportación inválido');

// Validar período de reporte
const validateReportPeriod = query('period')
  .optional()
  .isIn(['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'])
  .withMessage('Período de reporte inválido');

// Validar parámetros de agregación
const validateAggregation = [
  query('groupBy')
    .optional()
    .isIn(['date', 'location', 'animal', 'disease', 'treatment', 'vaccine', 'veterinarian'])
    .withMessage('Agrupación inválida'),
  query('metrics')
    .optional()
    .custom((value) => {
      if (typeof value === 'string') {
        const metrics = value.split(',');
        const validMetrics = [
          'count', 'percentage', 'average', 'total', 'trend', 'cost',
          'effectiveness', 'recovery_rate', 'mortality_rate', 'coverage'
        ];
        return metrics.every(metric => validMetrics.includes(metric));
      }
      return true;
    })
    .withMessage('Métricas inválidas')
];

// ===================================================================
// RUTAS DEL DASHBOARD DE REPORTES
// ===================================================================

/**
 * GET /api/reports/dashboard
 * Dashboard principal con resumen de todos los reportes
 */
router.get('/dashboard',
  authenticateToken,
  query('timeRange')
    .optional()
    .isIn(['7d', '30d', '90d', '1y'])
    .withMessage('Rango de tiempo inválido'),
  query('includeCharts')
    .optional()
    .isBoolean()
    .withMessage('includeCharts debe ser verdadero o falso'),
  query('includeAlerts')
    .optional()
    .isBoolean()
    .withMessage('includeAlerts debe ser verdadero o falso'),
  validateRequest,
  auditLog('reports.dashboard.view'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { 
        timeRange = '30d', 
        includeCharts = true, 
        includeAlerts = true 
      } = req.query;
      const userId = req.user?.id;

      const dashboard = await ReportsController.getDashboard({
        timeRange: timeRange as string,
        includeCharts: includeCharts === 'true',
        includeAlerts: includeAlerts === 'true',
        userId
      });

      res.json({
        success: true,
        data: dashboard,
        message: 'Dashboard de reportes obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/recent
 * Obtiene reportes recientes del usuario
 */
router.get('/recent',
  authenticateToken,
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Límite debe estar entre 1 y 50'),
  query('type')
    .optional()
    .isIn(['health', 'production', 'inventory', 'vaccination', 'financial', 'geographic'])
    .withMessage('Tipo de reporte inválido'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { limit = 10, type } = req.query;
      const userId = req.user?.id;

      const recentReports = await ReportsController.getRecentReports({
        limit: parseInt(limit as string),
        type: type as string,
        userId
      });

      res.json({
        success: true,
        data: recentReports,
        message: 'Reportes recientes obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE REPORTES DE SALUD
// ===================================================================

/**
 * GET /api/reports/health/overview
 * Reporte general de salud del ganado
 */
router.get('/health/overview',
  authenticateToken,
  validateDateRange,
  validateReportPeriod,
  query('includeDetails')
    .optional()
    .isBoolean()
    .withMessage('includeDetails debe ser verdadero o falso'),
  query('locationId')
    .optional()
    .isUUID()
    .withMessage('ID de ubicación debe ser un UUID válido'),
  query('veterinarianId')
    .optional()
    .isUUID()
    .withMessage('ID de veterinario debe ser un UUID válido'),
  validateRequest,
  auditLog('reports.health.overview'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate, endDate, period = 'monthly',
        includeDetails = true, locationId, veterinarianId
      } = req.query;
      const userId = req.user?.id;

      const healthOverview = await HealthReportsController.getHealthOverview({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        period: period as string,
        includeDetails: includeDetails === 'true',
        locationId: locationId as string,
        veterinarianId: veterinarianId as string,
        userId
      });

      res.json({
        success: true,
        data: healthOverview,
        message: 'Reporte de salud general obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/health/disease-analysis
 * Análisis detallado de enfermedades
 */
router.get('/health/disease-analysis',
  authenticateToken,
  validateDateRange,
  query('diseaseType')
    .optional()
    .isIn([
      'respiratory', 'digestive', 'reproductive', 'metabolic',
      'infectious', 'parasitic', 'nutritional', 'traumatic'
    ])
    .withMessage('Tipo de enfermedad inválido'),
  query('severity')
    .optional()
    .isIn(['mild', 'moderate', 'severe', 'critical'])
    .withMessage('Severidad inválida'),
  query('includeGeographic')
    .optional()
    .isBoolean()
    .withMessage('includeGeographic debe ser verdadero o falso'),
  query('includeTrends')
    .optional()
    .isBoolean()
    .withMessage('includeTrends debe ser verdadero o falso'),
  validateRequest,
  auditLog('reports.health.disease_analysis'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate, endDate, diseaseType, severity,
        includeGeographic = true, includeTrends = true
      } = req.query;
      const userId = req.user?.id;

      const diseaseAnalysis = await HealthReportsController.getDiseaseAnalysis({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        diseaseType: diseaseType as string,
        severity: severity as string,
        includeGeographic: includeGeographic === 'true',
        includeTrends: includeTrends === 'true',
        userId
      });

      res.json({
        success: true,
        data: diseaseAnalysis,
        message: 'Análisis de enfermedades obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/health/mortality
 * Reporte de mortalidad y análisis de causas
 */
router.get('/health/mortality',
  authenticateToken,
  validateDateRange,
  validateAggregation,
  query('includeCauses')
    .optional()
    .isBoolean()
    .withMessage('includeCauses debe ser verdadero o falso'),
  query('includePreventable')
    .optional()
    .isBoolean()
    .withMessage('includePreventable debe ser verdadero o falso'),
  validateRequest,
  auditLog('reports.health.mortality'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate, endDate, groupBy = 'date',
        includeCauses = true, includePreventable = true
      } = req.query;
      const userId = req.user?.id;

      const mortalityReport = await HealthReportsController.getMortalityReport({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        groupBy: groupBy as string,
        includeCauses: includeCauses === 'true',
        includePreventable: includePreventable === 'true',
        userId
      });

      res.json({
        success: true,
        data: mortalityReport,
        message: 'Reporte de mortalidad obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/health/treatment-analysis
 * Análisis de efectividad de tratamientos
 */
router.get('/health/treatment-analysis',
  authenticateToken,
  validateDateRange,
  query('treatmentType')
    .optional()
    .isIn(['antibiotic', 'antiparasitic', 'antiinflammatory', 'vitamin', 'vaccine', 'hormone'])
    .withMessage('Tipo de tratamiento inválido'),
  query('medicationId')
    .optional()
    .isUUID()
    .withMessage('ID de medicamento debe ser un UUID válido'),
  query('includeSuccessRates')
    .optional()
    .isBoolean()
    .withMessage('includeSuccessRates debe ser verdadero o falso'),
  query('includeCosts')
    .optional()
    .isBoolean()
    .withMessage('includeCosts debe ser verdadero o falso'),
  validateRequest,
  auditLog('reports.health.treatment_analysis'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate, endDate, treatmentType, medicationId,
        includeSuccessRates = true, includeCosts = true
      } = req.query;
      const userId = req.user?.id;

      const treatmentAnalysis = await HealthReportsController.getTreatmentAnalysis({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        treatmentType: treatmentType as string,
        medicationId: medicationId as string,
        includeSuccessRates: includeSuccessRates === 'true',
        includeCosts: includeCosts === 'true',
        userId
      });

      res.json({
        success: true,
        data: treatmentAnalysis,
        message: 'Análisis de tratamientos obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE REPORTES DE VACUNACIÓN
// ===================================================================

/**
 * GET /api/reports/vaccinations/coverage
 * Reporte de cobertura de vacunación
 */
router.get('/vaccinations/coverage',
  authenticateToken,
  validateDateRange,
  query('vaccineType')
    .optional()
    .isIn([
      'fiebre_aftosa', 'brucelosis', 'rabia', 'carbunco', 'clostridiosis',
      'ibl', 'dvb', 'pi3', 'brsv', 'leptospirosis', 'campylobacteriosis'
    ])
    .withMessage('Tipo de vacuna inválido'),
  query('ageGroup')
    .optional()
    .isIn(['calf', 'young', 'adult', 'senior'])
    .withMessage('Grupo etario inválido'),
  query('includeEffectiveness')
    .optional()
    .isBoolean()
    .withMessage('includeEffectiveness debe ser verdadero o falso'),
  validateRequest,
  auditLog('reports.vaccination.coverage'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate, endDate, vaccineType, ageGroup,
        includeEffectiveness = true
      } = req.query;
      const userId = req.user?.id;

      const coverageReport = await VaccinationReportsController.getCoverageReport({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        vaccineType: vaccineType as string,
        ageGroup: ageGroup as string,
        includeEffectiveness: includeEffectiveness === 'true',
        userId
      });

      res.json({
        success: true,
        data: coverageReport,
        message: 'Reporte de cobertura de vacunación obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/vaccinations/schedule
 * Calendario y programación de vacunaciones
 */
router.get('/vaccinations/schedule',
  authenticateToken,
  query('lookAhead')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Días de anticipación debe estar entre 1 y 365'),
  query('includeOverdue')
    .optional()
    .isBoolean()
    .withMessage('includeOverdue debe ser verdadero o falso'),
  query('groupByVaccine')
    .optional()
    .isBoolean()
    .withMessage('groupByVaccine debe ser verdadero o falso'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        lookAhead = 90,
        includeOverdue = true,
        groupByVaccine = false
      } = req.query;
      const userId = req.user?.id;

      const scheduleReport = await VaccinationReportsController.getScheduleReport({
        lookAhead: parseInt(lookAhead as string),
        includeOverdue: includeOverdue === 'true',
        groupByVaccine: groupByVaccine === 'true',
        userId
      });

      res.json({
        success: true,
        data: scheduleReport,
        message: 'Programación de vacunaciones obtenida exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/vaccinations/efficacy
 * Análisis de eficacia de vacunas
 */
router.get('/vaccinations/efficacy',
  authenticateToken,
  validateDateRange,
  query('vaccineId')
    .optional()
    .isUUID()
    .withMessage('ID de vacuna debe ser un UUID válido'),
  query('batchNumber')
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage('Número de lote debe tener entre 1 y 50 caracteres'),
  query('includeAdverseReactions')
    .optional()
    .isBoolean()
    .withMessage('includeAdverseReactions debe ser verdadero o falso'),
  validateRequest,
  auditLog('reports.vaccination.efficacy'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate, endDate, vaccineId, batchNumber,
        includeAdverseReactions = true
      } = req.query;
      const userId = req.user?.id;

      const efficacyReport = await VaccinationReportsController.getEfficacyReport({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        vaccineId: vaccineId as string,
        batchNumber: batchNumber as string,
        includeAdverseReactions: includeAdverseReactions === 'true',
        userId
      });

      res.json({
        success: true,
        data: efficacyReport,
        message: 'Análisis de eficacia de vacunas obtenido exitosamente'
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
 * GET /api/reports/production/overview
 * Reporte general de producción
 */
router.get('/production/overview',
  authenticateToken,
  validateDateRange,
  validateReportPeriod,
  query('productionType')
    .optional()
    .isIn(['milk', 'meat', 'breeding', 'all'])
    .withMessage('Tipo de producción inválido'),
  query('includeComparisons')
    .optional()
    .isBoolean()
    .withMessage('includeComparisons debe ser verdadero o falso'),
  query('includeProjections')
    .optional()
    .isBoolean()
    .withMessage('includeProjections debe ser verdadero o falso'),
  validateRequest,
  auditLog('reports.production.overview'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate, endDate, period = 'monthly',
        productionType = 'all',
        includeComparisons = true,
        includeProjections = true
      } = req.query;
      const userId = req.user?.id;

      const productionOverview = await ProductionReportsController.getProductionOverview({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        period: period as string,
        productionType: productionType as string,
        includeComparisons: includeComparisons === 'true',
        includeProjections: includeProjections === 'true',
        userId
      });

      res.json({
        success: true,
        data: productionOverview,
        message: 'Reporte de producción general obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/production/efficiency
 * Análisis de eficiencia productiva
 */
router.get('/production/efficiency',
  authenticateToken,
  validateDateRange,
  query('metric')
    .optional()
    .isIn(['milk_yield', 'weight_gain', 'feed_conversion', 'reproduction_rate', 'cost_efficiency'])
    .withMessage('Métrica de eficiencia inválida'),
  query('benchmarkComparison')
    .optional()
    .isBoolean()
    .withMessage('benchmarkComparison debe ser verdadero o falso'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate, endDate, metric = 'milk_yield',
        benchmarkComparison = true
      } = req.query;
      const userId = req.user?.id;

      const efficiencyReport = await ProductionReportsController.getEfficiencyReport({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        metric: metric as string,
        benchmarkComparison: benchmarkComparison === 'true',
        userId
      });

      res.json({
        success: true,
        data: efficiencyReport,
        message: 'Análisis de eficiencia productiva obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE REPORTES FINANCIEROS
// ===================================================================

/**
 * GET /api/reports/financial/veterinary-costs
 * Análisis de costos veterinarios
 */
router.get('/financial/veterinary-costs',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'accountant']),
  validateDateRange,
  query('costCategory')
    .optional()
    .isIn(['treatments', 'vaccinations', 'consultations', 'surgeries', 'preventive', 'emergency'])
    .withMessage('Categoría de costo inválida'),
  query('includeROI')
    .optional()
    .isBoolean()
    .withMessage('includeROI debe ser verdadero o falso'),
  query('groupBy')
    .optional()
    .isIn(['month', 'quarter', 'veterinarian', 'treatment_type', 'animal'])
    .withMessage('Agrupación inválida'),
  validateRequest,
  auditLog('reports.financial.veterinary_costs'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate, endDate, costCategory, includeROI = true, groupBy = 'month'
      } = req.query;
      const userId = req.user?.id;

      const veterinaryCosts = await FinancialReportsController.getVeterinaryCosts({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        costCategory: costCategory as string,
        includeROI: includeROI === 'true',
        groupBy: groupBy as string,
        userId
      });

      res.json({
        success: true,
        data: veterinaryCosts,
        message: 'Análisis de costos veterinarios obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/financial/roi-analysis
 * Análisis de retorno de inversión en salud animal
 */
router.get('/financial/roi-analysis',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'accountant']),
  validateDateRange,
  query('investmentType')
    .optional()
    .isIn(['prevention', 'treatment', 'vaccination', 'nutrition', 'equipment'])
    .withMessage('Tipo de inversión inválido'),
  query('includeProjections')
    .optional()
    .isBoolean()
    .withMessage('includeProjections debe ser verdadero o falso'),
  validateRequest,
  auditLog('reports.financial.roi_analysis'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate, endDate, investmentType, includeProjections = true
      } = req.query;
      const userId = req.user?.id;

      const roiAnalysis = await FinancialReportsController.getROIAnalysis({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        investmentType: investmentType as string,
        includeProjections: includeProjections === 'true',
        userId
      });

      res.json({
        success: true,
        data: roiAnalysis,
        message: 'Análisis ROI obtenido exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE REPORTES GEOGRÁFICOS
// ===================================================================

/**
 * GET /api/reports/geographic/health-patterns
 * Patrones geográficos de salud
 */
router.get('/geographic/health-patterns',
  authenticateToken,
  validateDateRange,
  query('analysisType')
    .optional()
    .isIn(['disease_distribution', 'treatment_locations', 'vaccination_coverage', 'outbreak_analysis'])
    .withMessage('Tipo de análisis inválido'),
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
  query('includeHeatmap')
    .optional()
    .isBoolean()
    .withMessage('includeHeatmap debe ser verdadero o falso'),
  validateRequest,
  auditLog('reports.geographic.health_patterns'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        startDate, endDate, analysisType = 'disease_distribution',
        bounds, includeHeatmap = true
      } = req.query;
      const userId = req.user?.id;

      let geoBounds;
      if (bounds) {
        const [swLat, swLng, neLat, neLng] = (bounds as string).split(',').map(Number);
        geoBounds = { swLat, swLng, neLat, neLng };
      }

      const healthPatterns = await GeographicReportsController.getHealthPatterns({
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        analysisType: analysisType as string,
        bounds: geoBounds,
        includeHeatmap: includeHeatmap === 'true',
        userId
      });

      res.json({
        success: true,
        data: healthPatterns,
        message: 'Patrones geográficos de salud obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/geographic/risk-zones
 * Identificación de zonas de riesgo
 */
router.get('/geographic/risk-zones',
  authenticateToken,
  query('riskType')
    .optional()
    .isIn(['disease_outbreak', 'high_mortality', 'low_vaccination', 'treatment_resistance'])
    .withMessage('Tipo de riesgo inválido'),
  query('severity')
    .optional()
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Severidad inválida'),
  query('includeRecommendations')
    .optional()
    .isBoolean()
    .withMessage('includeRecommendations debe ser verdadero o falso'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        riskType = 'disease_outbreak', severity,
        includeRecommendations = true
      } = req.query;
      const userId = req.user?.id;

      const riskZones = await GeographicReportsController.getRiskZones({
        riskType: riskType as string,
        severity: severity as string,
        includeRecommendations: includeRecommendations === 'true',
        userId
      });

      res.json({
        success: true,
        data: riskZones,
        message: 'Zonas de riesgo identificadas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE EXPORTACIÓN DE REPORTES
// ===================================================================

/**
 * GET /api/reports/export/:reportType
 * Exporta reportes en diferentes formatos
 */
router.get('/export/:reportType',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'veterinarian']),
  param('reportType')
    .isIn([
      'health_overview', 'disease_analysis', 'mortality', 'treatment_analysis',
      'vaccination_coverage', 'vaccination_schedule', 'vaccination_efficacy',
      'production_overview', 'production_efficiency',
      'financial_costs', 'financial_roi',
      'geographic_patterns', 'geographic_risks'
    ])
    .withMessage('Tipo de reporte inválido'),
  validateExportFormat,
  validateDateRange,
  query('includeCharts')
    .optional()
    .isBoolean()
    .withMessage('includeCharts debe ser verdadero o falso'),
  query('includeDetails')
    .optional()
    .isBoolean()
    .withMessage('includeDetails debe ser verdadero o falso'),
  query('reportTitle')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Título del reporte debe tener entre 1 y 200 caracteres'),
  validateRequest,
  auditLog('reports.export'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reportType } = req.params;
      const {
        format = 'pdf',
        startDate, endDate,
        includeCharts = true,
        includeDetails = true,
        reportTitle
      } = req.query;
      const userId = req.user?.id;

      const exportedReport = await ReportsController.exportReport({
        reportType,
        format: format as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        includeCharts: includeCharts === 'true',
        includeDetails: includeDetails === 'true',
        reportTitle: reportTitle as string,
        userId
      });

      if (format === 'json') {
        res.json({
          success: true,
          data: exportedReport,
          message: 'Reporte exportado exitosamente'
        });
      } else {
        // Para otros formatos, configurar headers de descarga
        const contentTypes = {
          pdf: 'application/pdf',
          excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          csv: 'text/csv'
        };

        const fileExtensions = {
          pdf: 'pdf',
          excel: 'xlsx',
          csv: 'csv'
        };

        res.setHeader('Content-Type', contentTypes[format as keyof typeof contentTypes]);
        res.setHeader('Content-Disposition', 
          `attachment; filename="${reportType}_report.${fileExtensions[format as keyof typeof fileExtensions]}"`);
        res.send(exportedReport);
      }
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/reports/generate-custom
 * Genera reporte personalizado con parámetros específicos
 */
router.post('/generate-custom',
  authenticateToken,
  authorizeRoles(['admin', 'ranch_manager', 'veterinarian']),
  rateLimitByUserId(10, 60), // 10 reportes personalizados por hora
  [
    body('reportName')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nombre del reporte debe tener entre 2 y 100 caracteres'),
    body('reportType')
      .isIn(['health', 'production', 'financial', 'vaccination', 'geographic', 'comprehensive'])
      .withMessage('Tipo de reporte inválido'),
    body('dateRange.startDate')
      .isISO8601()
      .withMessage('Fecha de inicio debe ser válida'),
    body('dateRange.endDate')
      .isISO8601()
      .withMessage('Fecha de fin debe ser válida'),
    body('parameters')
      .isObject()
      .withMessage('Parámetros deben ser un objeto válido'),
    body('metrics')
      .isArray({ min: 1 })
      .withMessage('Debe especificar al menos una métrica'),
    body('groupBy')
      .optional()
      .isArray()
      .withMessage('Agrupación debe ser un array'),
    body('filters')
      .optional()
      .isObject()
      .withMessage('Filtros deben ser un objeto válido'),
    body('exportFormat')
      .optional()
      .isIn(['json', 'pdf', 'excel', 'csv'])
      .withMessage('Formato de exportación inválido'),
    body('includeCharts')
      .optional()
      .isBoolean()
      .withMessage('includeCharts debe ser verdadero o falso'),
    body('scheduleRecurrence')
      .optional()
      .isIn(['none', 'daily', 'weekly', 'monthly', 'quarterly'])
      .withMessage('Recurrencia de programación inválida')
  ],
  validateRequest,
  auditLog('reports.generate_custom'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customReportData = req.body;
      const userId = req.user?.id;

      const customReport = await ReportsController.generateCustomReport({
        ...customReportData,
        requestedBy: userId
      });

      res.status(201).json({
        success: true,
        data: customReport,
        message: 'Reporte personalizado generado exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/reports/templates
 * Obtiene plantillas de reportes disponibles
 */
router.get('/templates',
  authenticateToken,
  query('category')
    .optional()
    .isIn(['health', 'production', 'financial', 'vaccination', 'geographic'])
    .withMessage('Categoría inválida'),
  query('includeCustom')
    .optional()
    .isBoolean()
    .withMessage('includeCustom debe ser verdadero o falso'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, includeCustom = false } = req.query;
      const userId = req.user?.id;

      const templates = await ReportsController.getReportTemplates({
        category: category as string,
        includeCustom: includeCustom === 'true',
        userId
      });

      res.json({
        success: true,
        data: templates,
        message: 'Plantillas de reportes obtenidas exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

// ===================================================================
// RUTAS DE GESTIÓN DE REPORTES PROGRAMADOS
// ===================================================================

/**
 * GET /api/reports/scheduled
 * Obtiene reportes programados del usuario
 */
router.get('/scheduled',
  authenticateToken,
  query('status')
    .optional()
    .isIn(['active', 'paused', 'completed', 'failed'])
    .withMessage('Estado inválido'),
  validateRequest,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status } = req.query;
      const userId = req.user?.id;

      const scheduledReports = await ReportsController.getScheduledReports({
        status: status as string,
        userId
      });

      res.json({
        success: true,
        data: scheduledReports,
        message: 'Reportes programados obtenidos exitosamente'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/reports/schedule
 * Programa un reporte para ejecución automática
 */
router.post('/schedule',
  authenticateToken,
  [
    body('reportType')
      .isIn(['health_overview', 'vaccination_coverage', 'production_overview', 'financial_costs'])
      .withMessage('Tipo de reporte inválido'),
    body('frequency')
      .isIn(['daily', 'weekly', 'monthly', 'quarterly'])
      .withMessage('Frecuencia inválida'),
    body('nextExecutionDate')
      .isISO8601()
      .withMessage('Fecha de próxima ejecución debe ser válida'),
    body('parameters')
      .isObject()
      .withMessage('Parámetros deben ser un objeto válido'),
    body('deliveryMethod')
      .isIn(['email', 'internal', 'both'])
      .withMessage('Método de entrega inválido'),
    body('recipients')
      .isArray({ min: 1 })
      .withMessage('Debe especificar al menos un destinatario'),
    body('format')
      .optional()
      .isIn(['pdf', 'excel', 'csv'])
      .withMessage('Formato inválido')
  ],
  validateRequest,
  auditLog('reports.schedule'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const scheduleData = req.body;
      const userId = req.user?.id;

      const scheduledReport = await ReportsController.scheduleReport({
        ...scheduleData,
        createdBy: userId
      });

      res.status(201).json({
        success: true,
        data: scheduledReport,
        message: 'Reporte programado exitosamente'
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