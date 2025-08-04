"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const HealthReportsController = {
    async getHealthOverview(params) { return { overview: {}, details: [] }; },
    async getDiseaseAnalysis(params) { return { analysis: {}, trends: [] }; },
    async getMortalityReport(params) { return { mortality: {}, causes: [] }; },
    async getTreatmentAnalysis(params) { return { treatments: {}, effectiveness: [] }; }
};
const ProductionReportsController = {
    async getProductionOverview(params) { return { production: {}, trends: [] }; },
    async getEfficiencyReport(params) { return { efficiency: {}, metrics: [] }; }
};
const InventoryReportsController = {
    async getInventoryReport(params) { return { inventory: {}, alerts: [] }; }
};
const VaccinationReportsController = {
    async getCoverageReport(params) { return { coverage: {}, gaps: [] }; },
    async getScheduleReport(params) { return { schedule: {}, upcoming: [] }; },
    async getEfficacyReport(params) { return { efficacy: {}, results: [] }; }
};
const FinancialReportsController = {
    async getVeterinaryCosts(params) { return { costs: {}, breakdown: [] }; },
    async getROIAnalysis(params) { return { roi: {}, projections: [] }; }
};
const GeographicReportsController = {
    async getHealthPatterns(params) { return { patterns: {}, hotspots: [] }; },
    async getRiskZones(params) { return { zones: {}, recommendations: [] }; }
};
const router = (0, express_1.Router)();
const isValidUUID = (uuid) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
};
const isValidISODate = (date) => {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
    return isoRegex.test(date) && !isNaN(Date.parse(date));
};
const isValidNumber = (value, min, max) => {
    const num = parseFloat(value);
    if (isNaN(num))
        return false;
    if (min !== undefined && num < min)
        return false;
    if (max !== undefined && num > max)
        return false;
    return true;
};
const isValidInteger = (value, min, max) => {
    const num = parseInt(value);
    if (isNaN(num) || !Number.isInteger(num))
        return false;
    if (min !== undefined && num < min)
        return false;
    if (max !== undefined && num > max)
        return false;
    return true;
};
const isValidLength = (value, min, max) => {
    if (typeof value !== 'string')
        return false;
    if (min !== undefined && value.length < min)
        return false;
    if (max !== undefined && value.length > max)
        return false;
    return true;
};
const isInArray = (value, validValues) => {
    return validValues.includes(value);
};
const isValidDateRange = (startDate, endDate) => {
    if (!isValidISODate(startDate) || !isValidISODate(endDate))
        return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return start < end;
};
const validateFields = (validations) => {
    return (req, res, next) => {
        const errors = [];
        for (const validation of validations) {
            const { field, validate, message, required = false } = validation;
            let value;
            if (req.params[field] !== undefined)
                value = req.params[field];
            else if (req.query[field] !== undefined)
                value = req.query[field];
            else if (req.body && req.body[field] !== undefined)
                value = req.body[field];
            if (required && (value === undefined || value === null || value === '')) {
                errors.push({
                    field,
                    value,
                    message: `${field} es requerido`
                });
                continue;
            }
            if (!required && (value === undefined || value === null || value === '')) {
                continue;
            }
            if (!validate(value)) {
                errors.push({
                    field,
                    value,
                    message
                });
            }
        }
        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Error de validación',
                errors
            });
        }
        next();
    };
};
const auditLog = (action) => {
    return (req, res, next) => {
        console.log(`[AUDIT] ${action} - Usuario: ${req.user?.id} - ${new Date().toISOString()}`);
        next();
    };
};
const rateLimitByUserId = (limit, windowMs) => {
    return (req, res, next) => {
        console.log(`[RATE_LIMIT] Usuario ${req.user?.id} - Límite: ${limit}/${windowMs}ms`);
        next();
    };
};
router.get('/dashboard', auth_1.authenticateToken, validateFields([
    {
        field: 'timeRange',
        validate: (value) => !value || ['7d', '30d', '90d', '1y'].includes(value),
        message: 'Rango de tiempo inválido'
    },
    {
        field: 'includeCharts',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeCharts debe ser verdadero o falso'
    },
    {
        field: 'includeAlerts',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeAlerts debe ser verdadero o falso'
    }
]), auditLog('reports.dashboard.view'), async (req, res, next) => {
    try {
        const { timeRange = '30d', includeCharts = true, includeAlerts = true } = req.query;
        const userId = req.user?.id;
        const dashboard = {
            timeRange,
            charts: includeCharts === 'true' ? {} : null,
            alerts: includeAlerts === 'true' ? [] : null,
            summary: {
                totalReports: 0,
                pendingReports: 0,
                completedReports: 0
            }
        };
        res.json({
            success: true,
            data: dashboard,
            message: 'Dashboard de reportes obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/recent', auth_1.authenticateToken, validateFields([
    {
        field: 'limit',
        validate: (value) => !value || isValidInteger(value, 1, 50),
        message: 'Límite debe estar entre 1 y 50'
    },
    {
        field: 'type',
        validate: (value) => !value || ['health', 'production', 'inventory', 'vaccination', 'financial', 'geographic'].includes(value),
        message: 'Tipo de reporte inválido'
    }
]), async (req, res, next) => {
    try {
        const { limit = 10, type } = req.query;
        const userId = req.user?.id;
        const recentReports = [
            {
                id: '1',
                type: type || 'health',
                generatedAt: new Date(),
                status: 'completed'
            }
        ];
        res.json({
            success: true,
            data: recentReports,
            message: 'Reportes recientes obtenidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/health/overview', auth_1.authenticateToken, validateFields([
    {
        field: 'startDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de inicio debe ser válida'
    },
    {
        field: 'endDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de fin debe ser válida'
    },
    {
        field: 'period',
        validate: (value) => !value || ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'].includes(value),
        message: 'Período de reporte inválido'
    },
    {
        field: 'includeDetails',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeDetails debe ser verdadero o falso'
    },
    {
        field: 'locationId',
        validate: (value) => !value || isValidUUID(value),
        message: 'ID de ubicación debe ser un UUID válido'
    },
    {
        field: 'veterinarianId',
        validate: (value) => !value || isValidUUID(value),
        message: 'ID de veterinario debe ser un UUID válido'
    }
]), auditLog('reports.health.overview'), async (req, res, next) => {
    try {
        const { startDate, endDate, period = 'monthly', includeDetails = true, locationId, veterinarianId } = req.query;
        const userId = req.user?.id;
        const healthOverview = await HealthReportsController.getHealthOverview({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            period: period,
            includeDetails: includeDetails === 'true',
            locationId: locationId,
            veterinarianId: veterinarianId,
            userId
        });
        res.json({
            success: true,
            data: healthOverview,
            message: 'Reporte de salud general obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/health/disease-analysis', auth_1.authenticateToken, validateFields([
    {
        field: 'startDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de inicio debe ser válida'
    },
    {
        field: 'endDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de fin debe ser válida'
    },
    {
        field: 'diseaseType',
        validate: (value) => !value || [
            'respiratory', 'digestive', 'reproductive', 'metabolic',
            'infectious', 'parasitic', 'nutritional', 'traumatic'
        ].includes(value),
        message: 'Tipo de enfermedad inválido'
    },
    {
        field: 'severity',
        validate: (value) => !value || ['mild', 'moderate', 'severe', 'critical'].includes(value),
        message: 'Severidad inválida'
    },
    {
        field: 'includeGeographic',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeGeographic debe ser verdadero o falso'
    },
    {
        field: 'includeTrends',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeTrends debe ser verdadero o falso'
    }
]), auditLog('reports.health.disease_analysis'), async (req, res, next) => {
    try {
        const { startDate, endDate, diseaseType, severity, includeGeographic = true, includeTrends = true } = req.query;
        const userId = req.user?.id;
        const diseaseAnalysis = await HealthReportsController.getDiseaseAnalysis({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            diseaseType: diseaseType,
            severity: severity,
            includeGeographic: includeGeographic === 'true',
            includeTrends: includeTrends === 'true',
            userId
        });
        res.json({
            success: true,
            data: diseaseAnalysis,
            message: 'Análisis de enfermedades obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/health/mortality', auth_1.authenticateToken, validateFields([
    {
        field: 'startDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de inicio debe ser válida'
    },
    {
        field: 'endDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de fin debe ser válida'
    },
    {
        field: 'groupBy',
        validate: (value) => !value || ['date', 'location', 'animal', 'disease', 'treatment', 'vaccine', 'veterinarian'].includes(value),
        message: 'Agrupación inválida'
    },
    {
        field: 'includeCauses',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeCauses debe ser verdadero o falso'
    },
    {
        field: 'includePreventable',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includePreventable debe ser verdadero o falso'
    }
]), auditLog('reports.health.mortality'), async (req, res, next) => {
    try {
        const { startDate, endDate, groupBy = 'date', includeCauses = true, includePreventable = true } = req.query;
        const userId = req.user?.id;
        const mortalityReport = await HealthReportsController.getMortalityReport({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            groupBy: groupBy,
            includeCauses: includeCauses === 'true',
            includePreventable: includePreventable === 'true',
            userId
        });
        res.json({
            success: true,
            data: mortalityReport,
            message: 'Reporte de mortalidad obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/health/treatment-analysis', auth_1.authenticateToken, validateFields([
    {
        field: 'startDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de inicio debe ser válida'
    },
    {
        field: 'endDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de fin debe ser válida'
    },
    {
        field: 'treatmentType',
        validate: (value) => !value || ['antibiotic', 'antiparasitic', 'antiinflammatory', 'vitamin', 'vaccine', 'hormone'].includes(value),
        message: 'Tipo de tratamiento inválido'
    },
    {
        field: 'medicationId',
        validate: (value) => !value || isValidUUID(value),
        message: 'ID de medicamento debe ser un UUID válido'
    },
    {
        field: 'includeSuccessRates',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeSuccessRates debe ser verdadero o falso'
    },
    {
        field: 'includeCosts',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeCosts debe ser verdadero o falso'
    }
]), auditLog('reports.health.treatment_analysis'), async (req, res, next) => {
    try {
        const { startDate, endDate, treatmentType, medicationId, includeSuccessRates = true, includeCosts = true } = req.query;
        const userId = req.user?.id;
        const treatmentAnalysis = await HealthReportsController.getTreatmentAnalysis({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            treatmentType: treatmentType,
            medicationId: medicationId,
            includeSuccessRates: includeSuccessRates === 'true',
            includeCosts: includeCosts === 'true',
            userId
        });
        res.json({
            success: true,
            data: treatmentAnalysis,
            message: 'Análisis de tratamientos obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/vaccinations/coverage', auth_1.authenticateToken, validateFields([
    {
        field: 'startDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de inicio debe ser válida'
    },
    {
        field: 'endDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de fin debe ser válida'
    },
    {
        field: 'vaccineType',
        validate: (value) => !value || [
            'fiebre_aftosa', 'brucelosis', 'rabia', 'carbunco', 'clostridiosis',
            'ibl', 'dvb', 'pi3', 'brsv', 'leptospirosis', 'campylobacteriosis'
        ].includes(value),
        message: 'Tipo de vacuna inválido'
    },
    {
        field: 'ageGroup',
        validate: (value) => !value || ['calf', 'young', 'adult', 'senior'].includes(value),
        message: 'Grupo etario inválido'
    },
    {
        field: 'includeEffectiveness',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeEffectiveness debe ser verdadero o falso'
    }
]), auditLog('reports.vaccination.coverage'), async (req, res, next) => {
    try {
        const { startDate, endDate, vaccineType, ageGroup, includeEffectiveness = true } = req.query;
        const userId = req.user?.id;
        const coverageReport = await VaccinationReportsController.getCoverageReport({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            vaccineType: vaccineType,
            ageGroup: ageGroup,
            includeEffectiveness: includeEffectiveness === 'true',
            userId
        });
        res.json({
            success: true,
            data: coverageReport,
            message: 'Reporte de cobertura de vacunación obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/vaccinations/schedule', auth_1.authenticateToken, validateFields([
    {
        field: 'lookAhead',
        validate: (value) => !value || isValidInteger(value, 1, 365),
        message: 'Días de anticipación debe estar entre 1 y 365'
    },
    {
        field: 'includeOverdue',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeOverdue debe ser verdadero o falso'
    },
    {
        field: 'groupByVaccine',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'groupByVaccine debe ser verdadero o falso'
    }
]), async (req, res, next) => {
    try {
        const { lookAhead = 90, includeOverdue = true, groupByVaccine = false } = req.query;
        const userId = req.user?.id;
        const scheduleReport = await VaccinationReportsController.getScheduleReport({
            lookAhead: parseInt(lookAhead),
            includeOverdue: includeOverdue === 'true',
            groupByVaccine: groupByVaccine === 'true',
            userId
        });
        res.json({
            success: true,
            data: scheduleReport,
            message: 'Programación de vacunaciones obtenida exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/vaccinations/efficacy', auth_1.authenticateToken, validateFields([
    {
        field: 'startDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de inicio debe ser válida'
    },
    {
        field: 'endDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de fin debe ser válida'
    },
    {
        field: 'vaccineId',
        validate: (value) => !value || isValidUUID(value),
        message: 'ID de vacuna debe ser un UUID válido'
    },
    {
        field: 'batchNumber',
        validate: (value) => !value || isValidLength(value, 1, 50),
        message: 'Número de lote debe tener entre 1 y 50 caracteres'
    },
    {
        field: 'includeAdverseReactions',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeAdverseReactions debe ser verdadero o falso'
    }
]), auditLog('reports.vaccination.efficacy'), async (req, res, next) => {
    try {
        const { startDate, endDate, vaccineId, batchNumber, includeAdverseReactions = true } = req.query;
        const userId = req.user?.id;
        const efficacyReport = await VaccinationReportsController.getEfficacyReport({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            vaccineId: vaccineId,
            batchNumber: batchNumber,
            includeAdverseReactions: includeAdverseReactions === 'true',
            userId
        });
        res.json({
            success: true,
            data: efficacyReport,
            message: 'Análisis de eficacia de vacunas obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/production/overview', auth_1.authenticateToken, validateFields([
    {
        field: 'startDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de inicio debe ser válida'
    },
    {
        field: 'endDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de fin debe ser válida'
    },
    {
        field: 'period',
        validate: (value) => !value || ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'].includes(value),
        message: 'Período inválido'
    },
    {
        field: 'productionType',
        validate: (value) => !value || ['milk', 'meat', 'breeding', 'all'].includes(value),
        message: 'Tipo de producción inválido'
    },
    {
        field: 'includeComparisons',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeComparisons debe ser verdadero o falso'
    },
    {
        field: 'includeProjections',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeProjections debe ser verdadero o falso'
    }
]), auditLog('reports.production.overview'), async (req, res, next) => {
    try {
        const { startDate, endDate, period = 'monthly', productionType = 'all', includeComparisons = true, includeProjections = true } = req.query;
        const userId = req.user?.id;
        const productionOverview = await ProductionReportsController.getProductionOverview({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            period: period,
            productionType: productionType,
            includeComparisons: includeComparisons === 'true',
            includeProjections: includeProjections === 'true',
            userId
        });
        res.json({
            success: true,
            data: productionOverview,
            message: 'Reporte de producción general obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/production/efficiency', auth_1.authenticateToken, validateFields([
    {
        field: 'startDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de inicio debe ser válida'
    },
    {
        field: 'endDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de fin debe ser válida'
    },
    {
        field: 'metric',
        validate: (value) => !value || ['milk_yield', 'weight_gain', 'feed_conversion', 'reproduction_rate', 'cost_efficiency'].includes(value),
        message: 'Métrica de eficiencia inválida'
    },
    {
        field: 'benchmarkComparison',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'benchmarkComparison debe ser verdadero o falso'
    }
]), async (req, res, next) => {
    try {
        const { startDate, endDate, metric = 'milk_yield', benchmarkComparison = true } = req.query;
        const userId = req.user?.id;
        const efficiencyReport = await ProductionReportsController.getEfficiencyReport({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            metric: metric,
            benchmarkComparison: benchmarkComparison === 'true',
            userId
        });
        res.json({
            success: true,
            data: efficiencyReport,
            message: 'Análisis de eficiencia productiva obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/financial/veterinary-costs', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), validateFields([
    {
        field: 'startDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de inicio debe ser válida'
    },
    {
        field: 'endDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de fin debe ser válida'
    },
    {
        field: 'costCategory',
        validate: (value) => !value || ['treatments', 'vaccinations', 'consultations', 'surgeries', 'preventive', 'emergency'].includes(value),
        message: 'Categoría de costo inválida'
    },
    {
        field: 'includeROI',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeROI debe ser verdadero o falso'
    },
    {
        field: 'groupBy',
        validate: (value) => !value || ['month', 'quarter', 'veterinarian', 'treatment_type', 'animal'].includes(value),
        message: 'Agrupación inválida'
    }
]), auditLog('reports.financial.veterinary_costs'), async (req, res, next) => {
    try {
        const { startDate, endDate, costCategory, includeROI = true, groupBy = 'month' } = req.query;
        const userId = req.user?.id;
        const veterinaryCosts = await FinancialReportsController.getVeterinaryCosts({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            costCategory: costCategory,
            includeROI: includeROI === 'true',
            groupBy: groupBy,
            userId
        });
        res.json({
            success: true,
            data: veterinaryCosts,
            message: 'Análisis de costos veterinarios obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/financial/roi-analysis', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER), validateFields([
    {
        field: 'startDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de inicio debe ser válida'
    },
    {
        field: 'endDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de fin debe ser válida'
    },
    {
        field: 'investmentType',
        validate: (value) => !value || ['prevention', 'treatment', 'vaccination', 'nutrition', 'equipment'].includes(value),
        message: 'Tipo de inversión inválido'
    },
    {
        field: 'includeProjections',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeProjections debe ser verdadero o falso'
    }
]), auditLog('reports.financial.roi_analysis'), async (req, res, next) => {
    try {
        const { startDate, endDate, investmentType, includeProjections = true } = req.query;
        const userId = req.user?.id;
        const roiAnalysis = await FinancialReportsController.getROIAnalysis({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            investmentType: investmentType,
            includeProjections: includeProjections === 'true',
            userId
        });
        res.json({
            success: true,
            data: roiAnalysis,
            message: 'Análisis ROI obtenido exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/geographic/health-patterns', auth_1.authenticateToken, validateFields([
    {
        field: 'startDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de inicio debe ser válida'
    },
    {
        field: 'endDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de fin debe ser válida'
    },
    {
        field: 'analysisType',
        validate: (value) => !value || ['disease_distribution', 'treatment_locations', 'vaccination_coverage', 'outbreak_analysis'].includes(value),
        message: 'Tipo de análisis inválido'
    },
    {
        field: 'bounds',
        validate: (value) => {
            if (value) {
                const bounds = value.split(',').map(Number);
                return bounds.length === 4 && !bounds.some(isNaN);
            }
            return true;
        },
        message: 'Los límites deben ser cuatro números separados por comas'
    },
    {
        field: 'includeHeatmap',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeHeatmap debe ser verdadero o falso'
    }
]), auditLog('reports.geographic.health_patterns'), async (req, res, next) => {
    try {
        const { startDate, endDate, analysisType = 'disease_distribution', bounds, includeHeatmap = true } = req.query;
        const userId = req.user?.id;
        let geoBounds;
        if (bounds) {
            const [swLat, swLng, neLat, neLng] = bounds.split(',').map(Number);
            geoBounds = { swLat, swLng, neLat, neLng };
        }
        const healthPatterns = await GeographicReportsController.getHealthPatterns({
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            analysisType: analysisType,
            bounds: geoBounds,
            includeHeatmap: includeHeatmap === 'true',
            userId
        });
        res.json({
            success: true,
            data: healthPatterns,
            message: 'Patrones geográficos de salud obtenidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/geographic/risk-zones', auth_1.authenticateToken, validateFields([
    {
        field: 'riskType',
        validate: (value) => !value || ['disease_outbreak', 'high_mortality', 'low_vaccination', 'treatment_resistance'].includes(value),
        message: 'Tipo de riesgo inválido'
    },
    {
        field: 'severity',
        validate: (value) => !value || ['low', 'medium', 'high', 'critical'].includes(value),
        message: 'Severidad inválida'
    },
    {
        field: 'includeRecommendations',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeRecommendations debe ser verdadero o falso'
    }
]), async (req, res, next) => {
    try {
        const { riskType = 'disease_outbreak', severity, includeRecommendations = true } = req.query;
        const userId = req.user?.id;
        const riskZones = await GeographicReportsController.getRiskZones({
            riskType: riskType,
            severity: severity,
            includeRecommendations: includeRecommendations === 'true',
            userId
        });
        res.json({
            success: true,
            data: riskZones,
            message: 'Zonas de riesgo identificadas exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/export/:reportType', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.VETERINARIAN), validateFields([
    {
        field: 'reportType',
        validate: (value) => [
            'health_overview', 'disease_analysis', 'mortality', 'treatment_analysis',
            'vaccination_coverage', 'vaccination_schedule', 'vaccination_efficacy',
            'production_overview', 'production_efficiency',
            'financial_costs', 'financial_roi',
            'geographic_patterns', 'geographic_risks'
        ].includes(value),
        message: 'Tipo de reporte inválido',
        required: true
    },
    {
        field: 'format',
        validate: (value) => !value || ['json', 'pdf', 'excel', 'csv'].includes(value),
        message: 'Formato de exportación inválido'
    },
    {
        field: 'startDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de inicio debe ser válida'
    },
    {
        field: 'endDate',
        validate: (value) => !value || isValidISODate(value),
        message: 'Fecha de fin debe ser válida'
    },
    {
        field: 'includeCharts',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeCharts debe ser verdadero o falso'
    },
    {
        field: 'includeDetails',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeDetails debe ser verdadero o falso'
    },
    {
        field: 'reportTitle',
        validate: (value) => !value || isValidLength(value, 1, 200),
        message: 'Título del reporte debe tener entre 1 y 200 caracteres'
    }
]), auditLog('reports.export'), async (req, res, next) => {
    try {
        const { reportType } = req.params;
        const { format = 'pdf', startDate, endDate, includeCharts = true, includeDetails = true, reportTitle } = req.query;
        const userId = req.user?.id;
        const exportedReport = {
            reportType,
            format,
            title: reportTitle || `Reporte ${reportType}`,
            generatedAt: new Date(),
            generatedBy: userId,
            data: 'Mock report content'
        };
        if (format === 'json') {
            res.json({
                success: true,
                data: exportedReport,
                message: 'Reporte exportado exitosamente'
            });
        }
        else {
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
            res.setHeader('Content-Type', contentTypes[format]);
            res.setHeader('Content-Disposition', `attachment; filename="${reportType}_report.${fileExtensions[format]}"`);
            res.send(Buffer.from('Mock report content'));
        }
    }
    catch (error) {
        next(error);
    }
});
router.post('/generate-custom', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(auth_1.UserRole.ADMIN, auth_1.UserRole.MANAGER, auth_1.UserRole.VETERINARIAN), rateLimitByUserId(10, 60), validateFields([
    {
        field: 'reportName',
        validate: (value) => value && isValidLength(value, 2, 100),
        message: 'Nombre del reporte debe tener entre 2 y 100 caracteres',
        required: true
    },
    {
        field: 'reportType',
        validate: (value) => value && ['health', 'production', 'financial', 'vaccination', 'geographic', 'comprehensive'].includes(value),
        message: 'Tipo de reporte inválido',
        required: true
    },
    {
        field: 'exportFormat',
        validate: (value) => !value || ['json', 'pdf', 'excel', 'csv'].includes(value),
        message: 'Formato de exportación inválido'
    },
    {
        field: 'includeCharts',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeCharts debe ser verdadero o falso'
    },
    {
        field: 'scheduleRecurrence',
        validate: (value) => !value || ['none', 'daily', 'weekly', 'monthly', 'quarterly'].includes(value),
        message: 'Recurrencia de programación inválida'
    }
]), auditLog('reports.generate_custom'), async (req, res, next) => {
    try {
        const customReportData = req.body;
        const userId = req.user?.id;
        const customReport = {
            id: Date.now().toString(),
            ...customReportData,
            requestedBy: userId,
            status: 'generated',
            generatedAt: new Date()
        };
        res.status(201).json({
            success: true,
            data: customReport,
            message: 'Reporte personalizado generado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/templates', auth_1.authenticateToken, validateFields([
    {
        field: 'category',
        validate: (value) => !value || ['health', 'production', 'financial', 'vaccination', 'geographic'].includes(value),
        message: 'Categoría inválida'
    },
    {
        field: 'includeCustom',
        validate: (value) => !value || value === 'true' || value === 'false',
        message: 'includeCustom debe ser verdadero o falso'
    }
]), async (req, res, next) => {
    try {
        const { category, includeCustom = false } = req.query;
        const userId = req.user?.id;
        const templates = [
            {
                id: '1',
                name: 'Reporte de Salud General',
                category: 'health',
                type: 'standard',
                description: 'Vista general del estado de salud del ganado'
            },
            {
                id: '2',
                name: 'Análisis de Producción',
                category: 'production',
                type: 'standard',
                description: 'Métricas de producción y tendencias'
            }
        ];
        const filteredTemplates = category
            ? templates.filter(t => t.category === category)
            : templates;
        res.json({
            success: true,
            data: filteredTemplates,
            message: 'Plantillas de reportes obtenidas exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.get('/scheduled', auth_1.authenticateToken, validateFields([
    {
        field: 'status',
        validate: (value) => !value || ['active', 'paused', 'completed', 'failed'].includes(value),
        message: 'Estado inválido'
    }
]), async (req, res, next) => {
    try {
        const { status } = req.query;
        const userId = req.user?.id;
        const scheduledReports = [
            {
                id: '1',
                reportType: 'health_overview',
                frequency: 'monthly',
                status: status || 'active',
                nextExecutionDate: new Date(),
                createdBy: userId
            }
        ];
        res.json({
            success: true,
            data: scheduledReports,
            message: 'Reportes programados obtenidos exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
router.post('/schedule', auth_1.authenticateToken, validateFields([
    {
        field: 'reportType',
        validate: (value) => value && ['health_overview', 'vaccination_coverage', 'production_overview', 'financial_costs'].includes(value),
        message: 'Tipo de reporte inválido',
        required: true
    },
    {
        field: 'frequency',
        validate: (value) => value && ['daily', 'weekly', 'monthly', 'quarterly'].includes(value),
        message: 'Frecuencia inválida',
        required: true
    },
    {
        field: 'nextExecutionDate',
        validate: (value) => value && isValidISODate(value),
        message: 'Fecha de próxima ejecución debe ser válida',
        required: true
    },
    {
        field: 'deliveryMethod',
        validate: (value) => value && ['email', 'internal', 'both'].includes(value),
        message: 'Método de entrega inválido',
        required: true
    },
    {
        field: 'format',
        validate: (value) => !value || ['pdf', 'excel', 'csv'].includes(value),
        message: 'Formato inválido'
    }
]), auditLog('reports.schedule'), async (req, res, next) => {
    try {
        const scheduleData = req.body;
        const userId = req.user?.id;
        const scheduledReport = {
            id: Date.now().toString(),
            ...scheduleData,
            createdBy: userId,
            status: 'active',
            createdAt: new Date()
        };
        res.status(201).json({
            success: true,
            data: scheduledReport,
            message: 'Reporte programado exitosamente'
        });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=reports.js.map