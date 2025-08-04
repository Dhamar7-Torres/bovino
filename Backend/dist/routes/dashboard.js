"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const rate_limit_1 = require("../middleware/rate-limit");
const role_1 = require("../middleware/role");
const router = (0, express_1.Router)();
class DashboardController {
    async getMainDashboard(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Dashboard principal cargado',
                    period: req.query.period || '7d',
                    timezone: req.query.timezone || 'America/Mexico_City',
                    refresh: req.query.refresh === 'true'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar dashboard principal'
            });
        }
    }
    async getExecutiveSummary(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Resumen ejecutivo',
                    includeComparison: req.query.includeComparison === 'true',
                    previousPeriod: req.query.previousPeriod === 'true',
                    benchmarks: req.query.benchmarks
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar resumen ejecutivo'
            });
        }
    }
    async getKPIs(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'KPIs principales',
                    metrics: req.query.metrics || 'health,production,financial',
                    format: req.query.format || 'detailed'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar KPIs'
            });
        }
    }
    async getHealthMetrics(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Métricas de salud del ganado',
                    includeVaccinations: req.query.includeVaccinations === 'true',
                    includeTreatments: req.query.includeTreatments === 'true',
                    groupBy: req.query.groupBy
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar métricas de salud'
            });
        }
    }
    async getVaccinationStatus(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Estado de vacunación',
                    includeOverdue: req.query.includeOverdue === 'true',
                    upcomingDays: req.query.upcomingDays || '30',
                    groupBy: req.query.groupBy
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar estado de vacunación'
            });
        }
    }
    async getIllnessTrends(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Tendencias de enfermedades',
                    period: req.query.period || '3m',
                    includeSeasonality: req.query.includeSeasonality === 'true',
                    riskAnalysis: req.query.riskAnalysis === 'true',
                    groupBy: req.query.groupBy
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar tendencias de enfermedades'
            });
        }
    }
    async getMortalityRates(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Tasas de mortalidad',
                    period: req.query.period || '1y',
                    includeReasons: req.query.includeReasons === 'true',
                    ageGroups: req.query.ageGroups === 'true',
                    seasonalAnalysis: req.query.seasonalAnalysis === 'true'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar tasas de mortalidad'
            });
        }
    }
    async getProductionMetrics(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Métricas de producción',
                    productionType: req.query.productionType,
                    includeQuality: req.query.includeQuality === 'true',
                    efficiency: req.query.efficiency === 'true'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar métricas de producción'
            });
        }
    }
    async getFeedEfficiency(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Eficiencia alimentaria',
                    includeNutrition: req.query.includeNutrition === 'true',
                    costAnalysis: req.query.costAnalysis === 'true',
                    groupBy: req.query.groupBy
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar eficiencia alimentaria'
            });
        }
    }
    async getGrowthRates(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Tasas de crecimiento',
                    ageGroups: req.query.ageGroups,
                    includeWeight: req.query.includeWeight === 'true',
                    includeHeight: req.query.includeHeight === 'true',
                    benchmarks: req.query.benchmarks === 'true'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar tasas de crecimiento'
            });
        }
    }
    async getReproductivePerformance(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Rendimiento reproductivo',
                    includeConceptionRates: req.query.includeConceptionRates === 'true',
                    calvingInterval: req.query.calvingInterval === 'true',
                    breedingEfficiency: req.query.breedingEfficiency === 'true'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar rendimiento reproductivo'
            });
        }
    }
    async getFinancialOverview(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Resumen financiero',
                    includeCosts: req.query.includeCosts === 'true',
                    includeRevenue: req.query.includeRevenue === 'true',
                    profitability: req.query.profitability === 'true',
                    period: req.query.period || '1y'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar resumen financiero'
            });
        }
    }
    async getCostAnalysis(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Análisis de costos',
                    costCategories: req.query.costCategories,
                    breakdown: req.query.breakdown,
                    trends: req.query.trends === 'true'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar análisis de costos'
            });
        }
    }
    async getRevenueStreams(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Análisis de ingresos',
                    sources: req.query.sources,
                    seasonality: req.query.seasonality === 'true',
                    projections: req.query.projections === 'true'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar análisis de ingresos'
            });
        }
    }
    async getROIAnalysis(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Análisis ROI',
                    investments: req.query.investments,
                    timeframe: req.query.timeframe,
                    includeProjections: req.query.includeProjections === 'true'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar análisis ROI'
            });
        }
    }
    async getActiveAlerts(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Alertas activas',
                    severity: req.query.severity,
                    category: req.query.category,
                    limit: req.query.limit || '50'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar alertas activas'
            });
        }
    }
    async acknowledgeAlerts(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Alertas reconocidas',
                    alertIds: req.body.alertIds,
                    acknowledgement: req.body.acknowledgement,
                    userId: req.body.userId
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al reconocer alertas'
            });
        }
    }
    async getUrgentActions(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Acciones urgentes',
                    priority: req.query.priority,
                    assignedTo: req.query.assignedTo,
                    category: req.query.category
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar acciones urgentes'
            });
        }
    }
    async getGeographicDistribution(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Distribución geográfica',
                    includeHealthEvents: req.query.includeHealthEvents === 'true',
                    includeVaccinations: req.query.includeVaccinations === 'true',
                    clusterAnalysis: req.query.clusterAnalysis === 'true'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar distribución geográfica'
            });
        }
    }
    async getHeatmaps(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Mapas de calor',
                    metric: req.query.metric,
                    resolution: req.query.resolution
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar mapas de calor'
            });
        }
    }
    async getMovementPatterns(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Patrones de movimiento',
                    timeframe: req.query.timeframe,
                    includeAnomalies: req.query.includeAnomalies === 'true',
                    predictiveAnalysis: req.query.predictiveAnalysis === 'true'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar patrones de movimiento'
            });
        }
    }
    async getUserWidgets(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Widgets del usuario',
                    layout: req.query.layout,
                    includeData: req.query.includeData === 'true',
                    activeOnly: req.query.activeOnly === 'true'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar widgets del usuario'
            });
        }
    }
    async createWidget(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Widget creado',
                    type: req.body.type,
                    config: req.body.config,
                    position: req.body.position,
                    title: req.body.title,
                    dataSource: req.body.dataSource
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al crear widget'
            });
        }
    }
    async updateWidget(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Widget actualizado',
                    widgetId: req.params.widgetId,
                    updates: req.body
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al actualizar widget'
            });
        }
    }
    async deleteWidget(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Widget eliminado',
                    widgetId: req.params.widgetId
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al eliminar widget'
            });
        }
    }
    async updateDashboardLayout(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Layout del dashboard actualizado',
                    widgets: req.body.widgets,
                    layout: req.body.layout,
                    settings: req.body.settings
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al actualizar layout del dashboard'
            });
        }
    }
    async getComparisons(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Comparaciones',
                    compareWith: req.query.compareWith,
                    metrics: req.query.metrics,
                    period: req.query.period
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar comparaciones'
            });
        }
    }
    async getBenchmarks(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Benchmarks de la industria',
                    category: req.query.category,
                    region: req.query.region,
                    ranchSize: req.query.ranchSize
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar benchmarks'
            });
        }
    }
    async getPerformanceScores(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Puntuaciones de rendimiento',
                    categories: req.query.categories,
                    includeRecommendations: req.query.includeRecommendations === 'true'
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar puntuaciones de rendimiento'
            });
        }
    }
    async getRealtimeData(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Datos en tiempo real',
                    metrics: req.query.metrics,
                    format: req.query.format
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar datos en tiempo real'
            });
        }
    }
    async getLiveMetrics(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Métricas en vivo',
                    metrics: req.query.metrics,
                    updateInterval: req.query.updateInterval
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar métricas en vivo'
            });
        }
    }
    async exportDashboard(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Dashboard exportado',
                    format: req.body.format,
                    sections: req.body.sections,
                    includeCharts: req.body.includeCharts,
                    timeRange: req.body.timeRange
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al exportar dashboard'
            });
        }
    }
    async downloadDashboardExport(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Descarga de exportación',
                    exportId: req.params.exportId
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al descargar exportación'
            });
        }
    }
    async createScheduledReport(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Reporte programado creado',
                    frequency: req.body.frequency,
                    recipients: req.body.recipients,
                    sections: req.body.sections,
                    format: req.body.format,
                    schedule: req.body.schedule
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al crear reporte programado'
            });
        }
    }
    async getDashboardSettings(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Configuración del dashboard',
                    userId: req.userId
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar configuración del dashboard'
            });
        }
    }
    async updateDashboardSettings(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Configuración actualizada',
                    theme: req.body.theme,
                    layout: req.body.layout,
                    defaultPeriod: req.body.defaultPeriod,
                    autoRefresh: req.body.autoRefresh,
                    notifications: req.body.notifications
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al actualizar configuración'
            });
        }
    }
    async resetDashboard(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Dashboard restablecido',
                    confirmReset: req.body.confirmReset,
                    preserveWidgets: req.body.preserveWidgets
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al restablecer dashboard'
            });
        }
    }
    async createCustomMetric(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Métrica personalizada creada',
                    name: req.body.name,
                    formula: req.body.formula,
                    dataSource: req.body.dataSource,
                    visualization: req.body.visualization,
                    schedule: req.body.schedule
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al crear métrica personalizada'
            });
        }
    }
    async getPredictiveAnalytics(req, res) {
        try {
            res.json({
                success: true,
                data: {
                    message: 'Análisis predictivo',
                    models: req.query.models,
                    horizon: req.query.horizon,
                    confidence: req.query.confidence
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: 'Error al cargar análisis predictivo'
            });
        }
    }
}
const dashboardController = new DashboardController();
router.use(auth_1.authenticateToken);
router.use(validation_1.sanitizeInput);
router.get('/', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), dashboardController.getMainDashboard);
router.get('/summary', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), dashboardController.getExecutiveSummary);
router.get('/kpis', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), dashboardController.getKPIs);
router.get('/health-metrics', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.HEALTH), dashboardController.getHealthMetrics);
router.get('/vaccination-status', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.VACCINATION), dashboardController.getVaccinationStatus);
router.get('/illness-trends', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.HEALTH), dashboardController.getIllnessTrends);
router.get('/mortality-rates', role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.HEALTH), dashboardController.getMortalityRates);
router.get('/production-metrics', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), dashboardController.getProductionMetrics);
router.get('/feed-efficiency', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), dashboardController.getFeedEfficiency);
router.get('/growth-rates', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), dashboardController.getGrowthRates);
router.get('/reproductive-performance', role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.HEALTH), dashboardController.getReproductivePerformance);
router.get('/financial-overview', role_1.requireFinancialAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), dashboardController.getFinancialOverview);
router.get('/cost-analysis', role_1.requireFinancialAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), dashboardController.getCostAnalysis);
router.get('/revenue-streams', role_1.requireFinancialAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), dashboardController.getRevenueStreams);
router.get('/roi-analysis', role_1.requireFinancialAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), dashboardController.getROIAnalysis);
router.get('/alerts', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), dashboardController.getActiveAlerts);
router.post('/alerts/acknowledge', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), dashboardController.acknowledgeAlerts);
router.get('/urgent-actions', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), dashboardController.getUrgentActions);
router.get('/geographic-distribution', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), dashboardController.getGeographicDistribution);
router.get('/heatmaps', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), dashboardController.getHeatmaps);
router.get('/movement-patterns', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.MAPS), dashboardController.getMovementPatterns);
router.get('/widgets', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), dashboardController.getUserWidgets);
router.post('/widgets', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), dashboardController.createWidget);
router.put('/widgets/:widgetId', (0, validation_1.validateId)('widgetId'), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), dashboardController.updateWidget);
router.delete('/widgets/:widgetId', (0, validation_1.validateId)('widgetId'), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), dashboardController.deleteWidget);
router.put('/widgets/layout', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), dashboardController.updateDashboardLayout);
router.get('/comparisons', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, validation_1.validate)('search'), dashboardController.getComparisons);
router.get('/benchmarks', role_1.requireFinancialAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, validation_1.validate)('search'), dashboardController.getBenchmarks);
router.get('/performance-scores', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), dashboardController.getPerformanceScores);
router.get('/realtime-data', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), dashboardController.getRealtimeData);
router.get('/live-metrics', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), dashboardController.getLiveMetrics);
router.post('/export', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), (0, validation_1.validate)('search'), dashboardController.exportDashboard);
router.get('/export/:exportId/download', (0, validation_1.validateId)('exportId'), (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.FILES), dashboardController.downloadDashboardExport);
router.post('/scheduled-reports', role_1.requireFinancialAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), (0, validation_1.validate)('search'), dashboardController.createScheduledReport);
router.get('/settings', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_READ), dashboardController.getDashboardSettings);
router.put('/settings', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), dashboardController.updateDashboardSettings);
router.post('/reset', (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), dashboardController.resetDashboard);
router.post('/custom-metrics', role_1.requireFinancialAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.CATTLE_WRITE), (0, validation_1.validate)('search'), dashboardController.createCustomMetric);
router.get('/predictive-analytics', role_1.requireVeterinaryAccess, (0, rate_limit_1.createRateLimit)(rate_limit_1.EndpointType.REPORTS), dashboardController.getPredictiveAnalytics);
router.use((error, req, res, next) => {
    console.error('Dashboard Route Error:', {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
    });
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
    return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
    });
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map