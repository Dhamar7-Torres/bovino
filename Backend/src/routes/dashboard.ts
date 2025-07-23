import { Router, Request, Response } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';
import { dateRangeMiddleware } from '../middleware/dateRange.middleware';
import { analyticsMiddleware } from '../middleware/analytics.middleware';
import {
  dashboardFiltersValidationRules,
  timeRangeValidationRules,
  widgetConfigValidationRules,
  alertConfigValidationRules,
  comparisonValidationRules,
  exportDashboardValidationRules,
  customMetricValidationRules,
  benchmarkValidationRules
} from '../validators/dashboard.validators';

// Crear instancia del router
const router = Router();

// Crear instancia del controlador de dashboard
const dashboardController = new DashboardController();

// ============================================================================
// MIDDLEWARE GLOBAL PARA TODAS LAS RUTAS DEL DASHBOARD
// ============================================================================

// Todas las rutas del dashboard requieren autenticación
router.use(authMiddleware);

// Middleware para tracking de analytics del dashboard
router.use(analyticsMiddleware);

// ============================================================================
// DASHBOARD PRINCIPAL Y RESUMEN EJECUTIVO
// ============================================================================

/**
 * @route   GET /dashboard
 * @desc    Obtener vista principal del dashboard con KPIs generales
 * @access  Private
 * @query   ?period=7d|30d|90d|1y&timezone=America/Mexico_City&refresh=true
 */
router.get(
  '/',
  rateLimitMiddleware({ 
    windowMs: 2 * 60 * 1000, // 2 minutos
    max: 100, // máximo 100 consultas por usuario cada 2 minutos
    message: 'Too many dashboard requests'
  }),
  cacheMiddleware({ ttl: 300 }), // cache de 5 minutos
  dateRangeMiddleware,
  dashboardFiltersValidationRules(),
  validationMiddleware,
  dashboardController.getMainDashboard
);

/**
 * @route   GET /dashboard/summary
 * @desc    Resumen ejecutivo con métricas clave del rancho
 * @access  Private
 * @query   ?includeComparison=true&previousPeriod=true&benchmarks=industry
 */
router.get(
  '/summary',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 50, // máximo 50 consultas de resumen por usuario cada 5 minutos
    message: 'Too many summary requests'
  }),
  cacheMiddleware({ ttl: 600 }), // cache de 10 minutos
  dashboardController.getExecutiveSummary
);

/**
 * @route   GET /dashboard/kpis
 * @desc    Indicadores clave de rendimiento (KPIs) principales
 * @access  Private
 * @query   ?metrics=health,production,financial&format=detailed|compact
 */
router.get(
  '/kpis',
  rateLimitMiddleware({ 
    windowMs: 3 * 60 * 1000, // 3 minutos
    max: 80, // máximo 80 consultas de KPIs por usuario cada 3 minutos
    message: 'Too many KPI requests'
  }),
  cacheMiddleware({ ttl: 180 }), // cache de 3 minutos
  dashboardController.getKPIs
);

// ============================================================================
// MÉTRICAS DE SALUD Y BIENESTAR ANIMAL
// ============================================================================

/**
 * @route   GET /dashboard/health-metrics
 * @desc    Métricas específicas de salud del ganado
 * @access  Private
 * @query   ?includeVaccinations=true&includeTreatments=true&groupBy=type|breed|age
 */
router.get(
  '/health-metrics',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 60, // máximo 60 consultas de métricas de salud cada 5 minutos
    message: 'Too many health metrics requests'
  }),
  cacheMiddleware({ ttl: 300 }), // cache de 5 minutos
  dashboardController.getHealthMetrics
);

/**
 * @route   GET /dashboard/vaccination-status
 * @desc    Estado de vacunación y programas de inmunización
 * @access  Private
 * @query   ?includeOverdue=true&upcomingDays=30&groupBy=vaccine_type
 */
router.get(
  '/vaccination-status',
  cacheMiddleware({ ttl: 300 }),
  dashboardController.getVaccinationStatus
);

/**
 * @route   GET /dashboard/illness-trends
 * @desc    Tendencias de enfermedades y análisis epidemiológico
 * @access  Private
 * @query   ?period=3m&includeSeasonality=true&riskAnalysis=true&groupBy=disease_type
 */
router.get(
  '/illness-trends',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 análisis de tendencias cada 10 minutos
    message: 'Too many illness trend requests'
  }),
  cacheMiddleware({ ttl: 600 }),
  dashboardController.getIllnessTrends
);

/**
 * @route   GET /dashboard/mortality-rates
 * @desc    Tasas de mortalidad y análisis de causas
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?period=1y&includeReasons=true&ageGroups=true&seasonalAnalysis=true
 */
router.get(
  '/mortality-rates',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 consultas de mortalidad cada 15 minutos
    message: 'Too many mortality rate requests'
  }),
  cacheMiddleware({ ttl: 1800 }), // cache de 30 minutos
  dashboardController.getMortalityRates
);

// ============================================================================
// MÉTRICAS DE PRODUCCIÓN Y RENDIMIENTO
// ============================================================================

/**
 * @route   GET /dashboard/production-metrics
 * @desc    Métricas de producción lechera, cárnica y reproductiva
 * @access  Private
 * @query   ?productionType=milk|meat|breeding&includeQuality=true&efficiency=true
 */
router.get(
  '/production-metrics',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 60, // máximo 60 consultas de producción cada 5 minutos
    message: 'Too many production metrics requests'
  }),
  cacheMiddleware({ ttl: 600 }),
  dashboardController.getProductionMetrics
);

/**
 * @route   GET /dashboard/feed-efficiency
 * @desc    Eficiencia alimentaria y conversión de alimentos
 * @access  Private
 * @query   ?includeNutrition=true&costAnalysis=true&groupBy=feed_type|age_group
 */
router.get(
  '/feed-efficiency',
  cacheMiddleware({ ttl: 900 }), // cache de 15 minutos
  dashboardController.getFeedEfficiency
);

/**
 * @route   GET /dashboard/growth-rates
 * @desc    Tasas de crecimiento y desarrollo del ganado
 * @access  Private
 * @query   ?ageGroups=calf,growing,adult&includeWeight=true&includeHeight=true&benchmarks=true
 */
router.get(
  '/growth-rates',
  cacheMiddleware({ ttl: 600 }),
  dashboardController.getGrowthRates
);

/**
 * @route   GET /dashboard/reproductive-performance
 * @desc    Rendimiento reproductivo y indicadores de fertilidad
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?includeConceptionRates=true&calvingInterval=true&breedingEfficiency=true
 */
router.get(
  '/reproductive-performance',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 consultas reproductivas cada 10 minutos
    message: 'Too many reproductive performance requests'
  }),
  cacheMiddleware({ ttl: 1200 }), // cache de 20 minutos
  dashboardController.getReproductivePerformance
);

// ============================================================================
// MÉTRICAS FINANCIERAS Y ECONÓMICAS
// ============================================================================

/**
 * @route   GET /dashboard/financial-overview
 * @desc    Resumen financiero y análisis económico
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @query   ?includeCosts=true&includeRevenue=true&profitability=true&period=1y
 */
router.get(
  '/financial-overview',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 20, // máximo 20 consultas financieras cada 10 minutos
    message: 'Too many financial overview requests'
  }),
  cacheMiddleware({ ttl: 1800 }), // cache de 30 minutos
  dashboardController.getFinancialOverview
);

/**
 * @route   GET /dashboard/cost-analysis
 * @desc    Análisis detallado de costos operativos
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @query   ?costCategories=feed,medical,labor,facilities&breakdown=detailed&trends=true
 */
router.get(
  '/cost-analysis',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 15, // máximo 15 análisis de costos cada 15 minutos
    message: 'Too many cost analysis requests'
  }),
  cacheMiddleware({ ttl: 1800 }),
  dashboardController.getCostAnalysis
);

/**
 * @route   GET /dashboard/revenue-streams
 * @desc    Análisis de fuentes de ingresos y rentabilidad
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @query   ?sources=milk,meat,breeding,other&seasonality=true&projections=true
 */
router.get(
  '/revenue-streams',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  cacheMiddleware({ ttl: 1800 }),
  dashboardController.getRevenueStreams
);

/**
 * @route   GET /dashboard/roi-analysis
 * @desc    Análisis de retorno de inversión por categorías
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @query   ?investments=genetics,facilities,technology&timeframe=3y&includeProjections=true
 */
router.get(
  '/roi-analysis',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 análisis ROI cada 30 minutos
    message: 'Too many ROI analysis requests'
  }),
  cacheMiddleware({ ttl: 3600 }), // cache de 1 hora
  dashboardController.getROIAnalysis
);

// ============================================================================
// ALERTAS Y NOTIFICACIONES CRÍTICAS
// ============================================================================

/**
 * @route   GET /dashboard/alerts
 * @desc    Alertas activas y notificaciones críticas
 * @access  Private
 * @query   ?severity=critical|high|medium|low&category=health|production|financial&limit=50
 */
router.get(
  '/alerts',
  rateLimitMiddleware({ 
    windowMs: 2 * 60 * 1000, // 2 minutos
    max: 200, // máximo 200 consultas de alertas cada 2 minutos
    message: 'Too many alert requests'
  }),
  dashboardController.getActiveAlerts
);

/**
 * @route   POST /dashboard/alerts/acknowledge
 * @desc    Reconocer alertas específicas
 * @access  Private
 * @body    { alertIds: string[], acknowledgement: string, userId: string }
 */
router.post(
  '/alerts/acknowledge',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 reconocimientos cada 5 minutos
    message: 'Too many alert acknowledgements'
  }),
  dashboardController.acknowledgeAlerts
);

/**
 * @route   GET /dashboard/urgent-actions
 * @desc    Acciones urgentes requeridas
 * @access  Private
 * @query   ?priority=immediate|today|this_week&assignedTo=me&category=all
 */
router.get(
  '/urgent-actions',
  rateLimitMiddleware({ 
    windowMs: 3 * 60 * 1000, // 3 minutos
    max: 100, // máximo 100 consultas de acciones urgentes cada 3 minutos
    message: 'Too many urgent actions requests'
  }),
  dashboardController.getUrgentActions
);

// ============================================================================
// ANÁLISIS GEOESPACIAL Y MAPAS
// ============================================================================

/**
 * @route   GET /dashboard/geographic-distribution
 * @desc    Distribución geográfica del ganado y eventos
 * @access  Private
 * @query   ?includeHealthEvents=true&includeVaccinations=true&clusterAnalysis=true
 */
router.get(
  '/geographic-distribution',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 análisis geográficos cada 10 minutos
    message: 'Too many geographic analysis requests'
  }),
  cacheMiddleware({ ttl: 900 }), // cache de 15 minutos
  dashboardController.getGeographicDistribution
);

/**
 * @route   GET /dashboard/heatmaps
 * @desc    Mapas de calor para diferentes métricas
 * @access  Private
 * @query   ?metric=density|health|production|activity&resolution=high|medium|low
 */
router.get(
  '/heatmaps',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 mapas de calor cada 15 minutos
    message: 'Too many heatmap requests'
  }),
  cacheMiddleware({ ttl: 1800 }),
  dashboardController.getHeatmaps
);

/**
 * @route   GET /dashboard/movement-patterns
 * @desc    Patrones de movimiento del ganado
 * @access  Private
 * @query   ?timeframe=24h|7d|30d&includeAnomalies=true&predictiveAnalysis=true
 */
router.get(
  '/movement-patterns',
  cacheMiddleware({ ttl: 1200 }),
  dashboardController.getMovementPatterns
);

// ============================================================================
// WIDGETS PERSONALIZABLES
// ============================================================================

/**
 * @route   GET /dashboard/widgets
 * @desc    Obtener configuración de widgets del usuario
 * @access  Private
 * @query   ?layout=grid|list&includeData=true&activeOnly=true
 */
router.get(
  '/widgets',
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 50, // máximo 50 consultas de widgets cada 5 minutos
    message: 'Too many widget requests'
  }),
  dashboardController.getUserWidgets
);

/**
 * @route   POST /dashboard/widgets
 * @desc    Crear nuevo widget personalizado
 * @access  Private
 * @body    { type: string, config: object, position: object, title: string, dataSource: string }
 */
router.post(
  '/widgets',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 creaciones de widgets cada 15 minutos
    message: 'Too many widget creation attempts'
  }),
  widgetConfigValidationRules(),
  validationMiddleware,
  dashboardController.createWidget
);

/**
 * @route   PUT /dashboard/widgets/:widgetId
 * @desc    Actualizar configuración de widget
 * @access  Private
 * @params  widgetId: string (UUID del widget)
 * @body    Configuración actualizada del widget
 */
router.put(
  '/widgets/:widgetId',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 actualizaciones de widgets cada 10 minutos
    message: 'Too many widget updates'
  }),
  widgetConfigValidationRules(),
  validationMiddleware,
  dashboardController.updateWidget
);

/**
 * @route   DELETE /dashboard/widgets/:widgetId
 * @desc    Eliminar widget del dashboard
 * @access  Private
 * @params  widgetId: string (UUID del widget)
 */
router.delete(
  '/widgets/:widgetId',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 eliminaciones de widgets cada 10 minutos
    message: 'Too many widget deletions'
  }),
  dashboardController.deleteWidget
);

/**
 * @route   PUT /dashboard/widgets/layout
 * @desc    Actualizar layout completo del dashboard
 * @access  Private
 * @body    { widgets: array, layout: object, settings: object }
 */
router.put(
  '/widgets/layout',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 actualizaciones de layout cada 15 minutos
    message: 'Too many layout updates'
  }),
  dashboardController.updateDashboardLayout
);

// ============================================================================
// COMPARACIONES Y BENCHMARKS
// ============================================================================

/**
 * @route   GET /dashboard/comparisons
 * @desc    Comparaciones con períodos anteriores y benchmarks
 * @access  Private
 * @query   ?compareWith=previous_year|industry_average|custom&metrics=all|specific&period=1y
 */
router.get(
  '/comparisons',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 comparaciones cada 10 minutos
    message: 'Too many comparison requests'
  }),
  cacheMiddleware({ ttl: 1800 }),
  comparisonValidationRules(),
  validationMiddleware,
  dashboardController.getComparisons
);

/**
 * @route   GET /dashboard/benchmarks
 * @desc    Benchmarks de la industria y mejores prácticas
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @query   ?category=productivity|efficiency|profitability&region=mexico&ranchSize=similar
 */
router.get(
  '/benchmarks',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 consultas de benchmarks cada 30 minutos
    message: 'Too many benchmark requests'
  }),
  cacheMiddleware({ ttl: 7200 }), // cache de 2 horas
  benchmarkValidationRules(),
  validationMiddleware,
  dashboardController.getBenchmarks
);

/**
 * @route   GET /dashboard/performance-scores
 * @desc    Puntuaciones de rendimiento del rancho
 * @access  Private
 * @query   ?categories=health,production,financial,operational&includeRecommendations=true
 */
router.get(
  '/performance-scores',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 consultas de puntuaciones cada 15 minutos
    message: 'Too many performance score requests'
  }),
  cacheMiddleware({ ttl: 1800 }),
  dashboardController.getPerformanceScores
);

// ============================================================================
// DATOS EN TIEMPO REAL Y STREAMING
// ============================================================================

/**
 * @route   GET /dashboard/realtime-data
 * @desc    Datos en tiempo real para widgets dinámicos
 * @access  Private
 * @query   ?metrics=live_health,current_alerts,active_events&format=sse
 */
router.get(
  '/realtime-data',
  rateLimitMiddleware({ 
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 60, // máximo 60 consultas en tiempo real por minuto
    message: 'Too many realtime data requests'
  }),
  dashboardController.getRealtimeData
);

/**
 * @route   GET /dashboard/live-metrics
 * @desc    Métricas en vivo con actualizaciones automáticas
 * @access  Private
 * @query   ?metrics=temperature,activity,feeding&updateInterval=30s
 */
router.get(
  '/live-metrics',
  rateLimitMiddleware({ 
    windowMs: 1 * 60 * 1000, // 1 minuto
    max: 120, // máximo 120 consultas de métricas en vivo por minuto
    message: 'Too many live metrics requests'
  }),
  dashboardController.getLiveMetrics
);

// ============================================================================
// REPORTES Y EXPORTACIÓN
// ============================================================================

/**
 * @route   POST /dashboard/export
 * @desc    Exportar dashboard completo en diferentes formatos
 * @access  Private
 * @body    { format: 'pdf' | 'excel' | 'powerpoint', sections: array, includeCharts: boolean, timeRange: object }
 */
router.post(
  '/export',
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 5, // máximo 5 exportaciones cada 30 minutos
    message: 'Too many dashboard export requests'
  }),
  exportDashboardValidationRules(),
  validationMiddleware,
  dashboardController.exportDashboard
);

/**
 * @route   GET /dashboard/export/:exportId/download
 * @desc    Descargar dashboard exportado
 * @access  Private
 * @params  exportId: string (ID del proceso de exportación)
 */
router.get(
  '/export/:exportId/download',
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 20, // máximo 20 descargas cada 10 minutos
    message: 'Too many download requests'
  }),
  dashboardController.downloadDashboardExport
);

/**
 * @route   POST /dashboard/scheduled-reports
 * @desc    Configurar reportes programados del dashboard
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @body    { frequency: string, recipients: array, sections: array, format: string, schedule: object }
 */
router.post(
  '/scheduled-reports',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // máximo 5 configuraciones de reportes programados por hora
    message: 'Too many scheduled report configurations'
  }),
  dashboardController.createScheduledReport
);

// ============================================================================
// CONFIGURACIÓN Y PERSONALIZACIÓN
// ============================================================================

/**
 * @route   GET /dashboard/settings
 * @desc    Obtener configuración personalizada del dashboard
 * @access  Private
 */
router.get(
  '/settings',
  dashboardController.getDashboardSettings
);

/**
 * @route   PUT /dashboard/settings
 * @desc    Actualizar configuración del dashboard
 * @access  Private
 * @body    { theme: string, layout: object, defaultPeriod: string, autoRefresh: boolean, notifications: object }
 */
router.put(
  '/settings',
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 actualizaciones de configuración cada 15 minutos
    message: 'Too many settings updates'
  }),
  dashboardController.updateDashboardSettings
);

/**
 * @route   POST /dashboard/reset
 * @desc    Restablecer dashboard a configuración predeterminada
 * @access  Private
 * @body    { confirmReset: boolean, preserveWidgets?: boolean }
 */
router.post(
  '/reset',
  rateLimitMiddleware({ 
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 3, // máximo 3 resets cada hora
    message: 'Too many dashboard resets'
  }),
  dashboardController.resetDashboard
);

// ============================================================================
// MÉTRICAS PERSONALIZADAS Y AVANZADAS
// ============================================================================

/**
 * @route   POST /dashboard/custom-metrics
 * @desc    Crear métrica personalizada
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @body    { name: string, formula: string, dataSource: string, visualization: object, schedule: object }
 */
router.post(
  '/custom-metrics',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 métricas personalizadas cada 30 minutos
    message: 'Too many custom metric creations'
  }),
  customMetricValidationRules(),
  validationMiddleware,
  dashboardController.createCustomMetric
);

/**
 * @route   GET /dashboard/predictive-analytics
 * @desc    Análisis predictivo y proyecciones
 * @access  Private (Roles: RANCH_OWNER, ADMIN, VETERINARIAN)
 * @query   ?models=health,production,financial&horizon=30d|90d|1y&confidence=0.95
 */
router.get(
  '/predictive-analytics',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'VETERINARIAN']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // máximo 10 análisis predictivos cada 15 minutos
    message: 'Too many predictive analytics requests'
  }),
  cacheMiddleware({ ttl: 3600 }), // cache de 1 hora
  dashboardController.getPredictiveAnalytics
);

// ============================================================================
// MANEJO DE ERRORES ESPECÍFICOS PARA RUTAS DEL DASHBOARD
// ============================================================================

/**
 * Middleware de manejo de errores específico para dashboard
 */
router.use((error: any, req: Request, res: Response, next: any) => {
  // Log del error para debugging
  console.error('Dashboard Route Error:', {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  });

  // Errores específicos del dashboard
  if (error.name === 'DataAggregationError') {
    return res.status(500).json({
      success: false,
      message: 'Error al agregar datos del dashboard',
      error: 'DATA_AGGREGATION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'WidgetConfigurationError') {
    return res.status(400).json({
      success: false,
      message: 'Configuración de widget inválida',
      error: 'WIDGET_CONFIGURATION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'MetricCalculationError') {
    return res.status(500).json({
      success: false,
      message: 'Error al calcular métricas',
      error: 'METRIC_CALCULATION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'CacheError') {
    return res.status(500).json({
      success: false,
      message: 'Error en sistema de caché',
      error: 'CACHE_ERROR'
    });
  }

  if (error.name === 'ExportGenerationError') {
    return res.status(500).json({
      success: false,
      message: 'Error al generar exportación',
      error: 'EXPORT_GENERATION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'RealtimeConnectionError') {
    return res.status(503).json({
      success: false,
      message: 'Error en conexión de tiempo real',
      error: 'REALTIME_CONNECTION_ERROR'
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