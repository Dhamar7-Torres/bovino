"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsService = exports.ReportsService = exports.ValidationError = exports.ApiError = void 0;
const sequelize_1 = require("sequelize");
const logger_1 = require("../utils/logger");
const logger = {
    info: (message, metadata) => logger_1.logger.info(message, metadata, 'ReportsService'),
    error: (message, error) => logger_1.logger.error(message, { error }, error, 'ReportsService'),
    warn: (message, metadata) => logger_1.logger.warn(message, metadata, 'ReportsService')
};
const ExcelJS = {
    Workbook: class {
        constructor() {
            this.xlsx = {
                writeBuffer: async () => Buffer.from('mock excel data')
            };
        }
        addWorksheet(name) {
            return {
                addRow: (data) => { },
                columns: []
            };
        }
    }
};
const PDFKit = class {
    constructor() {
        this.buffers = [];
        this.buffers = [];
    }
    on(event, callback) {
        if (event === 'data') {
            setTimeout(() => callback(Buffer.from('mock pdf data')), 100);
        }
        if (event === 'end') {
            setTimeout(() => callback(), 200);
        }
        return this;
    }
    fontSize(size) { return this; }
    text(text, x, y) { return this; }
    addPage() { return this; }
    end() { }
};
class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
    }
}
exports.ApiError = ApiError;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
const Bovine = {
    count: async (options) => 150,
    findAll: async (options) => [
        { id: '1', earTag: 'COW001', name: 'Bella', breed: 'Holstein', healthStatus: 'HEALTHY' },
        { id: '2', earTag: 'COW002', name: 'Luna', breed: 'Jersey', healthStatus: 'SICK' }
    ],
    findByPk: async (id) => ({
        id,
        earTag: `COW${id.padStart(3, '0')}`,
        name: `Bovine ${id}`,
        breed: 'Holstein',
        healthStatus: 'HEALTHY'
    })
};
const Health = {
    findAll: async (options) => [
        {
            id: '1',
            bovineId: '1',
            disease: 'Mastitis',
            severity: 'MODERATE',
            diagnosisDate: new Date(),
            status: 'TREATMENT',
            bovine: { earTag: 'COW001', name: 'Bella', breed: 'Holstein' }
        }
    ]
};
const Production = {
    findAll: async (options) => [],
    findAndCountAll: async (options) => ({
        rows: [],
        count: 0
    })
};
const Finance = {
    findAll: async (options) => []
};
const Reproduction = {
    findAll: async (options) => []
};
const Event = {
    findAll: async (options) => []
};
const Location = {
    findAll: async (options) => []
};
const Ranch = {
    findByPk: async (id) => ({
        id,
        name: `Ranch ${id}`,
        location: { latitude: 19.4326, longitude: -99.1332 }
    })
};
const Vaccination = {
    findAll: async (options) => []
};
const sequelize = {
    query: async (sql, options) => [],
    fn: (fn, col) => ({ fn, col }),
    col: (column) => ({ column }),
    literal: (value) => ({ literal: value }),
    transaction: async () => ({
        commit: async () => { },
        rollback: async () => { }
    })
};
class ProductionService {
    async getProductionMetrics() {
        return { totalProduction: 1000, averageDaily: 50 };
    }
}
class HealthService {
    async getHealthMetrics() {
        return { healthyCount: 120, sickCount: 30 };
    }
}
class LocationService {
    async getLocationData() {
        return { coordinates: [19.4326, -99.1332] };
    }
}
class CacheService {
    constructor() {
        this.cache = new Map();
    }
    async get(key) {
        return this.cache.get(key) || null;
    }
    async set(key, value, expiration) {
        this.cache.set(key, value);
    }
    async del(key) {
        this.cache.delete(key);
    }
}
class ReportsService {
    constructor() {
        this.productionService = new ProductionService();
        this.healthService = new HealthService();
        this.locationService = new LocationService();
        this.cacheService = new CacheService();
    }
    async generateReport(type, filters, userId) {
        try {
            logger.info('📊 Generando reporte', { type, filters, userId });
            const cacheKey = this.generateCacheKey(type, filters);
            const cachedReport = await this.cacheService.get(cacheKey);
            if (cachedReport && !filters.ignoreCache) {
                logger.info('✅ Reporte obtenido desde cache', { type });
                return JSON.parse(cachedReport);
            }
            await this.validateFilters(filters);
            let reportData;
            switch (type) {
                case 'HEALTH_OVERVIEW':
                    reportData = await this.generateHealthOverviewReport(filters);
                    break;
                case 'HEALTH_TRENDS':
                    reportData = await this.generateHealthTrendsReport(filters);
                    break;
                case 'DISEASE_ANALYSIS':
                    reportData = await this.generateDiseaseAnalysisReport(filters);
                    break;
                case 'VACCINATION_COVERAGE':
                    reportData = await this.generateVaccinationCoverageReport(filters);
                    break;
                case 'VACCINATION_SCHEDULE':
                    reportData = await this.generateVaccinationScheduleReport(filters);
                    break;
                case 'VACCINATION_EFFICACY':
                    reportData = await this.generateVaccinationEfficacyReport(filters);
                    break;
                case 'PRODUCTION_SUMMARY':
                    reportData = await this.generateProductionSummaryReport(filters);
                    break;
                case 'PRODUCTION_TRENDS':
                    reportData = await this.generateProductionTrendsReport(filters);
                    break;
                case 'BREEDING_OVERVIEW':
                    reportData = await this.generateBreedingOverviewReport(filters);
                    break;
                case 'PREGNANCY_STATUS':
                    reportData = await this.generatePregnancyStatusReport(filters);
                    break;
                case 'BIRTH_RECORDS':
                    reportData = await this.generateBirthRecordsReport(filters);
                    break;
                case 'FINANCIAL_SUMMARY':
                    reportData = await this.generateFinancialSummaryReport(filters);
                    break;
                case 'VETERINARY_COSTS':
                    reportData = await this.generateVeterinaryCostsReport(filters);
                    break;
                case 'ROI_ANALYSIS':
                    reportData = await this.generateROIAnalysisReport(filters);
                    break;
                case 'GEOSPATIAL_ANALYSIS':
                    reportData = await this.generateGeospatialAnalysisReport(filters);
                    break;
                case 'COMPREHENSIVE_DASHBOARD':
                    reportData = await this.generateComprehensiveDashboard(filters);
                    break;
                default:
                    throw new ValidationError(`Tipo de reporte no soportado: ${type}`);
            }
            reportData.metadata = {
                generatedAt: new Date(),
                generatedBy: userId,
                filters: filters,
                cacheKey: cacheKey,
                processingTime: Date.now() - (reportData.startTime || 0)
            };
            if (this.shouldCacheReport(type, filters)) {
                await this.cacheService.set(cacheKey, JSON.stringify(reportData), this.getCacheExpiration(type));
            }
            logger.info('✅ Reporte generado exitosamente', {
                type,
                processingTime: reportData.metadata.processingTime,
                dataPoints: Array.isArray(reportData.data) ? reportData.data.length : 0
            });
            return reportData;
        }
        catch (error) {
            logger.error('❌ Error generando reporte', { error, type, filters });
            throw error;
        }
    }
    async generateHealthOverviewReport(filters) {
        const startTime = Date.now();
        try {
            const whereClause = this.buildBovineWhereClause(filters);
            const totalBovines = await Bovine.count({ where: whereClause });
            const healthStats = await Bovine.findAll({
                attributes: [
                    'healthStatus',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                where: whereClause,
                group: ['healthStatus'],
                raw: true
            });
            const recentIllnesses = await Health.findAll({
                where: {
                    diagnosisDate: {
                        [sequelize_1.Op.gte]: filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    },
                    ...(filters.endDate && { diagnosisDate: { [sequelize_1.Op.lte]: filters.endDate } })
                },
                include: [{
                        model: Bovine,
                        where: whereClause,
                        attributes: ['earTag', 'name', 'breed']
                    }],
                order: [['diagnosisDate', 'DESC']],
                limit: 10
            });
            const overdueVaccinations = await this.getOverdueVaccinations(filters);
            const healthTrends = await this.calculateHealthTrends(filters);
            let locationDistribution = null;
            if (filters.includeGeospatial) {
                locationDistribution = await this.getHealthLocationDistribution(filters);
            }
            const reportData = {
                summary: {
                    totalBovines,
                    healthyCount: healthStats.find((stat) => stat.healthStatus === 'HEALTHY')?.count || 0,
                    sickCount: healthStats.find((stat) => stat.healthStatus === 'SICK')?.count || 0,
                    recoveringCount: healthStats.find((stat) => stat.healthStatus === 'RECOVERING')?.count || 0,
                    quarantineCount: healthStats.find((stat) => stat.healthStatus === 'QUARANTINE')?.count || 0,
                    healthPercentage: ((healthStats.find((stat) => stat.healthStatus === 'HEALTHY')?.count || 0) / totalBovines) * 100
                },
                recentIllnesses: recentIllnesses.map((illness) => ({
                    id: illness.id,
                    bovineId: illness.bovineId,
                    earTag: illness.bovine?.earTag,
                    bovineName: illness.bovine?.name,
                    disease: illness.disease,
                    severity: illness.severity,
                    diagnosisDate: illness.diagnosisDate,
                    status: illness.status,
                    location: illness.location
                })),
                overdueVaccinations,
                trends: healthTrends,
                locationDistribution
            };
            return {
                type: 'HEALTH_OVERVIEW',
                title: 'Reporte General de Salud',
                data: reportData,
                charts: this.generateHealthCharts(reportData),
                startTime
            };
        }
        catch (error) {
            logger.error('❌ Error generando reporte de salud general', { error, filters });
            throw new ApiError('Error generando reporte de salud', 500);
        }
    }
    async generateHealthTrendsReport(filters) {
        const startTime = Date.now();
        try {
            const period = filters.period || 'month';
            const startDate = filters.startDate || new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
            const endDate = filters.endDate || new Date();
            const diagnosisTrends = await sequelize.query(`
        SELECT 
          DATE_TRUNC('${period}', diagnosis_date) as period,
          disease,
          severity,
          COUNT(*) as case_count,
          AVG(CASE WHEN status = 'RECOVERED' THEN 1 ELSE 0 END) as recovery_rate
        FROM health_records h
        JOIN bovines b ON h.bovine_id = b.id
        WHERE h.diagnosis_date BETWEEN :startDate AND :endDate
        ${filters.ranchId ? 'AND b.ranch_id = :ranchId' : ''}
        ${filters.bovineIds ? 'AND b.id = ANY(:bovineIds)' : ''}
        GROUP BY period, disease, severity
        ORDER BY period DESC, case_count DESC
      `, {
                replacements: {
                    startDate,
                    endDate,
                    ranchId: filters.ranchId,
                    bovineIds: filters.bovineIds
                },
                type: sequelize_1.QueryTypes.SELECT
            });
            const outbreakAnalysis = await this.detectOutbreaks(filters);
            const treatmentEfficacy = await this.analyzeTreatmentEfficacy(filters);
            const riskFactors = await this.identifyRiskFactors(filters);
            const reportData = {
                period,
                dateRange: { startDate, endDate },
                diagnosisTrends: diagnosisTrends,
                outbreakAnalysis,
                treatmentEfficacy,
                riskFactors,
                seasonalPatterns: await this.analyzeSeasonalPatterns(filters),
                recommendations: this.generateHealthRecommendations(diagnosisTrends)
            };
            return {
                type: 'HEALTH_TRENDS',
                title: 'Análisis de Tendencias de Salud',
                data: reportData,
                charts: this.generateTrendCharts(reportData),
                startTime
            };
        }
        catch (error) {
            logger.error('❌ Error generando reporte de tendencias de salud', { error, filters });
            throw new ApiError('Error generando reporte de tendencias', 500);
        }
    }
    async generateVaccinationCoverageReport(filters) {
        const startTime = Date.now();
        try {
            const whereClause = this.buildBovineWhereClause(filters);
            const vaccinationCoverage = await sequelize.query(`
        SELECT 
          v.vaccine_type,
          COUNT(DISTINCT v.bovine_id) as vaccinated_count,
          COUNT(DISTINCT b.id) as total_bovines,
          (COUNT(DISTINCT v.bovine_id)::float / COUNT(DISTINCT b.id) * 100) as coverage_percentage,
          AVG(EXTRACT(DAY FROM (v.next_due_date - CURRENT_DATE))) as avg_days_to_next
        FROM bovines b
        LEFT JOIN vaccinations v ON b.id = v.bovine_id 
          AND v.status = 'COMPLETED'
          AND v.administered_date >= :startDate
        WHERE b.is_active = true
        ${filters.ranchId ? 'AND b.ranch_id = :ranchId' : ''}
        GROUP BY v.vaccine_type
        ORDER BY coverage_percentage DESC
      `, {
                replacements: {
                    startDate: filters.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                    ranchId: filters.ranchId
                },
                type: sequelize_1.QueryTypes.SELECT
            });
            const vaccinationStatus = await sequelize.query(`
        SELECT 
          CASE 
            WHEN MAX(v.next_due_date) >= CURRENT_DATE THEN 'UP_TO_DATE'
            WHEN MAX(v.next_due_date) < CURRENT_DATE THEN 'OVERDUE'
            ELSE 'NO_VACCINATION'
          END as status,
          COUNT(*) as count
        FROM bovines b
        LEFT JOIN vaccinations v ON b.id = v.bovine_id AND v.status = 'COMPLETED'
        WHERE b.is_active = true
        ${filters.ranchId ? 'AND b.ranch_id = :ranchId' : ''}
        GROUP BY 
          CASE 
            WHEN MAX(v.next_due_date) >= CURRENT_DATE THEN 'UP_TO_DATE'
            WHEN MAX(v.next_due_date) < CURRENT_DATE THEN 'OVERDUE'
            ELSE 'NO_VACCINATION'
          END
      `, {
                replacements: { ranchId: filters.ranchId },
                type: sequelize_1.QueryTypes.SELECT
            });
            const upcomingVaccinations = await Vaccination.findAll({
                where: {
                    nextDueDate: {
                        [sequelize_1.Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
                    },
                    status: { [sequelize_1.Op.ne]: 'COMPLETED' }
                },
                include: [{
                        model: Bovine,
                        where: whereClause,
                        attributes: ['earTag', 'name', 'breed']
                    }],
                order: [['nextDueDate', 'ASC']]
            });
            const monthlyVaccinations = await this.getMonthlyVaccinationHistory(filters);
            const reportData = {
                coverageSummary: {
                    totalBovines: await Bovine.count({ where: whereClause }),
                    fullyVaccinated: vaccinationStatus.find((s) => s.status === 'UP_TO_DATE')?.count || 0,
                    overdue: vaccinationStatus.find((s) => s.status === 'OVERDUE')?.count || 0,
                    neverVaccinated: vaccinationStatus.find((s) => s.status === 'NO_VACCINATION')?.count || 0,
                    overallCoveragePercentage: 0
                },
                coverageByVaccine: vaccinationCoverage,
                upcomingVaccinations: upcomingVaccinations.map((vacc) => ({
                    id: vacc.id,
                    bovineId: vacc.bovineId,
                    earTag: vacc.bovine?.earTag,
                    vaccineType: vacc.vaccineType,
                    dueDate: vacc.nextDueDate,
                    daysPending: Math.ceil((vacc.nextDueDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
                    location: vacc.plannedLocation
                })),
                monthlyHistory: monthlyVaccinations,
                recommendations: []
            };
            const totalBovines = reportData.coverageSummary.totalBovines;
            reportData.coverageSummary.overallCoveragePercentage =
                ((reportData.coverageSummary.fullyVaccinated / totalBovines) * 100);
            reportData.recommendations = this.generateVaccinationRecommendations(reportData);
            return {
                type: 'VACCINATION_COVERAGE',
                title: 'Reporte de Cobertura de Vacunación',
                data: reportData,
                charts: this.generateVaccinationCharts(reportData),
                startTime
            };
        }
        catch (error) {
            logger.error('❌ Error generando reporte de cobertura de vacunación', { error, filters });
            throw new ApiError('Error generando reporte de vacunación', 500);
        }
    }
    async generateProductionSummaryReport(filters) {
        const startTime = Date.now();
        try {
            const whereClause = this.buildProductionWhereClause(filters);
            const productionSummary = await Production.findAll({
                attributes: [
                    'type',
                    'unit',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'recordCount'],
                    [sequelize.fn('SUM', sequelize.col('value')), 'totalValue'],
                    [sequelize.fn('AVG', sequelize.col('value')), 'averageValue'],
                    [sequelize.fn('MIN', sequelize.col('value')), 'minimumValue'],
                    [sequelize.fn('MAX', sequelize.col('value')), 'maximumValue']
                ],
                where: whereClause,
                group: ['type', 'unit'],
                raw: true
            });
            const topProducers = await sequelize.query(`
        SELECT 
          b.id,
          b.ear_tag,
          b.name,
          b.breed,
          p.type as production_type,
          SUM(p.value) as total_production,
          AVG(p.value) as average_production,
          COUNT(p.id) as record_count
        FROM bovines b
        JOIN productions p ON b.id = p.bovine_id
        WHERE p.recorded_date BETWEEN :startDate AND :endDate
          AND p.is_deleted = false
          ${filters.ranchId ? 'AND b.ranch_id = :ranchId' : ''}
          ${filters.productionType ? 'AND p.type = :productionType' : ''}
        GROUP BY b.id, b.ear_tag, b.name, b.breed, p.type
        ORDER BY total_production DESC
        LIMIT 10
      `, {
                replacements: {
                    startDate: filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    endDate: filters.endDate || new Date(),
                    ranchId: filters.ranchId,
                    productionType: filters.productionType
                },
                type: sequelize_1.QueryTypes.SELECT
            });
            const monthlyTrends = await this.getMonthlyProductionTrends(filters);
            const periodComparison = await this.compareProductionPeriods(filters);
            const efficiencyAnalysis = await this.analyzeProductionEfficiency(filters);
            const reportData = {
                period: {
                    startDate: filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    endDate: filters.endDate || new Date()
                },
                summary: productionSummary.map((item) => ({
                    type: item.type,
                    unit: item.unit,
                    totalRecords: item.recordCount,
                    totalValue: item.totalValue,
                    averageValue: parseFloat(item.averageValue),
                    minimumValue: item.minimumValue,
                    maximumValue: item.maximumValue
                })),
                topProducers: topProducers,
                monthlyTrends,
                periodComparison,
                efficiencyAnalysis,
                recommendations: []
            };
            reportData.recommendations = this.generateProductionRecommendations(reportData);
            return {
                type: 'PRODUCTION_SUMMARY',
                title: 'Reporte Resumen de Producción',
                data: reportData,
                charts: this.generateProductionCharts(reportData),
                startTime
            };
        }
        catch (error) {
            logger.error('❌ Error generando reporte de producción', { error, filters });
            throw new ApiError('Error generando reporte de producción', 500);
        }
    }
    async generateVeterinaryCostsReport(filters) {
        const startTime = Date.now();
        try {
            const costsByCategory = await Finance.findAll({
                attributes: [
                    'category',
                    'subcategory',
                    [sequelize.fn('SUM', sequelize.col('amount')), 'totalAmount'],
                    [sequelize.fn('COUNT', sequelize.col('id')), 'transactionCount'],
                    [sequelize.fn('AVG', sequelize.col('amount')), 'averageAmount']
                ],
                where: {
                    category: 'VETERINARY',
                    date: {
                        [sequelize_1.Op.between]: [
                            filters.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                            filters.endDate || new Date()
                        ]
                    },
                    ...(filters.ranchId && { ranchId: filters.ranchId })
                },
                group: ['category', 'subcategory'],
                raw: true
            });
            const costsByBovine = await sequelize.query(`
        SELECT 
          b.ear_tag,
          b.name,
          b.breed,
          SUM(f.amount) as total_cost,
          COUNT(f.id) as expense_count,
          AVG(f.amount) as average_expense
        FROM finances f
        JOIN bovines b ON f.bovine_id = b.id
        WHERE f.category = 'VETERINARY'
          AND f.date BETWEEN :startDate AND :endDate
          ${filters.ranchId ? 'AND f.ranch_id = :ranchId' : ''}
        GROUP BY b.id, b.ear_tag, b.name, b.breed
        ORDER BY total_cost DESC
        LIMIT 20
      `, {
                replacements: {
                    startDate: filters.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                    endDate: filters.endDate || new Date(),
                    ranchId: filters.ranchId
                },
                type: sequelize_1.QueryTypes.SELECT
            });
            const monthlyExpenses = await this.getMonthlyVeterinaryExpenses(filters);
            const treatmentROI = await this.calculateTreatmentROI(filters);
            const budgetAnalysis = await this.analyzeBudgetVsActual(filters);
            const reportData = {
                period: {
                    startDate: filters.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                    endDate: filters.endDate || new Date()
                },
                totalExpenses: costsByCategory.reduce((sum, item) => sum + parseFloat(item.totalAmount), 0),
                expensesByCategory: costsByCategory.map((item) => ({
                    category: item.subcategory || item.category,
                    amount: parseFloat(item.totalAmount),
                    transactionCount: item.transactionCount,
                    averageAmount: parseFloat(item.averageAmount)
                })),
                expensesByBovine: costsByBovine,
                monthlyTrends: monthlyExpenses,
                treatmentROI,
                budgetAnalysis,
                recommendations: []
            };
            reportData.recommendations = this.generateFinancialRecommendations(reportData);
            return {
                type: 'VETERINARY_COSTS',
                title: 'Reporte de Costos Veterinarios',
                data: reportData,
                charts: this.generateFinancialCharts(reportData),
                startTime
            };
        }
        catch (error) {
            logger.error('❌ Error generando reporte de costos veterinarios', { error, filters });
            throw new ApiError('Error generando reporte financiero', 500);
        }
    }
    async generateGeospatialAnalysisReport(filters) {
        const startTime = Date.now();
        try {
            const bovineDistribution = await this.getBovineLocationDistribution(filters);
            const diseaseClusters = await this.identifyDiseaseClusters(filters);
            const densityAnalysis = await this.calculateLocationDensity(filters);
            const movementPatterns = await this.analyzeMovementPatterns(filters);
            const riskZones = await this.identifyRiskZones(filters);
            const reportData = {
                coverageArea: await this.calculateCoverageArea(filters),
                bovineDistribution,
                diseaseClusters,
                densityAnalysis,
                movementPatterns,
                riskZones,
                recommendations: []
            };
            reportData.recommendations = this.generateGeospatialRecommendations(reportData);
            return {
                type: 'GEOSPATIAL_ANALYSIS',
                title: 'Análisis Geoespacial',
                data: reportData,
                maps: this.generateGeospatialMaps(reportData),
                startTime
            };
        }
        catch (error) {
            logger.error('❌ Error generando análisis geoespacial', { error, filters });
            throw new ApiError('Error generando reporte geoespacial', 500);
        }
    }
    async exportReport(reportData, format, options = {}) {
        try {
            logger.info('📤 Exportando reporte', { type: reportData.type, format });
            switch (format) {
                case 'PDF':
                    return await this.exportToPDF(reportData, options);
                case 'EXCEL':
                    return await this.exportToExcel(reportData, options);
                case 'CSV':
                    return await this.exportToCSV(reportData);
                case 'JSON':
                    return Buffer.from(JSON.stringify(reportData, null, 2));
                default:
                    throw new ValidationError(`Formato de exportación no soportado: ${format}`);
            }
        }
        catch (error) {
            logger.error('❌ Error exportando reporte', { error, format });
            throw new ApiError('Error exportando reporte', 500);
        }
    }
    async exportToPDF(reportData, options) {
        return new Promise((resolve, reject) => {
            try {
                const doc = new PDFKit();
                const buffers = [];
                doc.on('data', (buffer) => buffers.push(buffer));
                doc.on('end', () => resolve(Buffer.concat(buffers)));
                doc.fontSize(20).text(reportData.title, 50, 50);
                doc.fontSize(12).text(`Generado: ${new Date().toLocaleString('es-ES')}`, 50, 80);
                let yPosition = 120;
                if (reportData.data && typeof reportData.data === 'object') {
                    for (const [key, value] of Object.entries(reportData.data)) {
                        doc.text(`${key}: ${JSON.stringify(value, null, 2)}`, 50, yPosition);
                        yPosition += 20;
                        if (yPosition > 700) {
                            doc.addPage();
                            yPosition = 50;
                        }
                    }
                }
                if (options.includeCharts && reportData.charts) {
                    doc.addPage();
                    doc.text('Gráficos y Visualizaciones', 50, 50);
                }
                doc.end();
            }
            catch (error) {
                reject(error);
            }
        });
    }
    async exportToExcel(reportData, options) {
        const workbook = new ExcelJS.Workbook();
        const summarySheet = workbook.addWorksheet('Resumen');
        summarySheet.addRow(['Reporte', reportData.title]);
        summarySheet.addRow(['Tipo', reportData.type]);
        summarySheet.addRow(['Generado', new Date().toLocaleString('es-ES')]);
        summarySheet.addRow([]);
        if (reportData.data && typeof reportData.data === 'object') {
            this.addDataToExcelSheet(summarySheet, reportData.data);
        }
        if (reportData.type === 'HEALTH_OVERVIEW' && reportData.data) {
            const healthData = reportData.data;
            if (healthData.recentIllnesses) {
                const illnessSheet = workbook.addWorksheet('Enfermedades Recientes');
                const illnessHeaders = ['ID', 'Arete', 'Nombre', 'Enfermedad', 'Severidad', 'Fecha', 'Estado'];
                illnessSheet.addRow(illnessHeaders);
                healthData.recentIllnesses.forEach(illness => {
                    illnessSheet.addRow([
                        illness.id,
                        illness.earTag,
                        illness.bovineName,
                        illness.disease,
                        illness.severity,
                        illness.diagnosisDate.toLocaleDateString('es-ES'),
                        illness.status
                    ]);
                });
            }
        }
        return await workbook.xlsx.writeBuffer();
    }
    async exportToCSV(reportData) {
        let csvContent = '';
        csvContent += `"Reporte","${reportData.title}"\n`;
        csvContent += `"Tipo","${reportData.type}"\n`;
        csvContent += `"Generado","${new Date().toLocaleString('es-ES')}"\n\n`;
        if (reportData.data && typeof reportData.data === 'object') {
            csvContent += this.convertObjectToCSV(reportData.data);
        }
        return Buffer.from(csvContent, 'utf8');
    }
    async generateDiseaseAnalysisReport(filters) {
        return {
            type: 'DISEASE_ANALYSIS',
            title: 'Análisis de Enfermedades',
            data: { message: 'Reporte en desarrollo' },
            startTime: Date.now()
        };
    }
    async generateVaccinationScheduleReport(filters) {
        return {
            type: 'VACCINATION_SCHEDULE',
            title: 'Cronograma de Vacunación',
            data: { message: 'Reporte en desarrollo' },
            startTime: Date.now()
        };
    }
    async generateVaccinationEfficacyReport(filters) {
        return {
            type: 'VACCINATION_EFFICACY',
            title: 'Eficacia de Vacunación',
            data: { message: 'Reporte en desarrollo' },
            startTime: Date.now()
        };
    }
    async generateProductionTrendsReport(filters) {
        return {
            type: 'PRODUCTION_TRENDS',
            title: 'Tendencias de Producción',
            data: { message: 'Reporte en desarrollo' },
            startTime: Date.now()
        };
    }
    async generateBreedingOverviewReport(filters) {
        return {
            type: 'BREEDING_OVERVIEW',
            title: 'Resumen de Reproducción',
            data: { message: 'Reporte en desarrollo' },
            startTime: Date.now()
        };
    }
    async generatePregnancyStatusReport(filters) {
        return {
            type: 'PREGNANCY_STATUS',
            title: 'Estado de Preñez',
            data: { message: 'Reporte en desarrollo' },
            startTime: Date.now()
        };
    }
    async generateBirthRecordsReport(filters) {
        return {
            type: 'BIRTH_RECORDS',
            title: 'Registros de Nacimientos',
            data: { message: 'Reporte en desarrollo' },
            startTime: Date.now()
        };
    }
    async generateFinancialSummaryReport(filters) {
        return {
            type: 'FINANCIAL_SUMMARY',
            title: 'Resumen Financiero',
            data: { message: 'Reporte en desarrollo' },
            startTime: Date.now()
        };
    }
    async generateROIAnalysisReport(filters) {
        return {
            type: 'ROI_ANALYSIS',
            title: 'Análisis de ROI',
            data: { message: 'Reporte en desarrollo' },
            startTime: Date.now()
        };
    }
    async generateComprehensiveDashboard(filters) {
        return {
            type: 'COMPREHENSIVE_DASHBOARD',
            title: 'Dashboard Completo',
            data: { message: 'Reporte en desarrollo' },
            startTime: Date.now()
        };
    }
    async getOverdueVaccinations(filters) {
        return [];
    }
    async calculateHealthTrends(filters) {
        return { trend: 'STABLE', confidence: 0.8 };
    }
    async getHealthLocationDistribution(filters) {
        return [];
    }
    async detectOutbreaks(filters) {
        return { outbreaks: [] };
    }
    async analyzeTreatmentEfficacy(filters) {
        return { efficacy: 85 };
    }
    async identifyRiskFactors(filters) {
        return { factors: [] };
    }
    async analyzeSeasonalPatterns(filters) {
        return { patterns: [] };
    }
    async getMonthlyVaccinationHistory(filters) {
        return [];
    }
    async getMonthlyProductionTrends(filters) {
        return [];
    }
    async compareProductionPeriods(filters) {
        return { comparison: 'equal' };
    }
    async analyzeProductionEfficiency(filters) {
        return { efficiency: 80 };
    }
    async getMonthlyVeterinaryExpenses(filters) {
        return [];
    }
    async calculateTreatmentROI(filters) {
        return { roi: 1.5 };
    }
    async analyzeBudgetVsActual(filters) {
        return { variance: 5 };
    }
    async getBovineLocationDistribution(filters) {
        return [];
    }
    async identifyDiseaseClusters(filters) {
        return [];
    }
    async calculateLocationDensity(filters) {
        return { density: 'medium' };
    }
    async analyzeMovementPatterns(filters) {
        return [];
    }
    async identifyRiskZones(filters) {
        return [];
    }
    async calculateCoverageArea(filters) {
        return { area: 100 };
    }
    generateHealthCharts(data) {
        return [];
    }
    generateTrendCharts(data) {
        return [];
    }
    generateVaccinationCharts(data) {
        return [];
    }
    generateProductionCharts(data) {
        return [];
    }
    generateFinancialCharts(data) {
        return [];
    }
    generateGeospatialMaps(data) {
        return [];
    }
    generateHealthRecommendations(trends) {
        return ['Mantener seguimiento de salud'];
    }
    generateVaccinationRecommendations(data) {
        return ['Completar vacunaciones pendientes'];
    }
    generateProductionRecommendations(data) {
        return ['Optimizar alimentación'];
    }
    generateFinancialRecommendations(data) {
        return ['Controlar gastos veterinarios'];
    }
    generateGeospatialRecommendations(data) {
        return ['Mejorar distribución de pastoreo'];
    }
    generateCacheKey(type, filters) {
        const filterHash = Buffer.from(JSON.stringify(filters)).toString('base64');
        return `report:${type}:${filterHash}`;
    }
    async validateFilters(filters) {
        if (filters.startDate && filters.endDate && filters.startDate > filters.endDate) {
            throw new ValidationError('La fecha de inicio no puede ser posterior a la fecha de fin');
        }
        if (filters.ranchId) {
            const ranch = await Ranch.findByPk(filters.ranchId);
            if (!ranch) {
                throw new ValidationError('El rancho especificado no existe');
            }
        }
        if (filters.bovineIds && filters.bovineIds.length > 0) {
            const bovineCount = await Bovine.count({
                where: { id: { [sequelize_1.Op.in]: filters.bovineIds } }
            });
            if (bovineCount !== filters.bovineIds.length) {
                throw new ValidationError('Algunos bovinos especificados no existen');
            }
        }
    }
    buildBovineWhereClause(filters) {
        const whereClause = { isActive: true };
        if (filters.ranchId) {
            whereClause.ranchId = filters.ranchId;
        }
        if (filters.bovineIds && filters.bovineIds.length > 0) {
            whereClause.id = { [sequelize_1.Op.in]: filters.bovineIds };
        }
        if (filters.breed) {
            whereClause.breed = filters.breed;
        }
        if (filters.healthStatus) {
            whereClause.healthStatus = filters.healthStatus;
        }
        if (filters.ageRange) {
            const currentDate = new Date();
            const minBirthDate = new Date(currentDate.getFullYear() - filters.ageRange.max, currentDate.getMonth(), currentDate.getDate());
            const maxBirthDate = new Date(currentDate.getFullYear() - filters.ageRange.min, currentDate.getMonth(), currentDate.getDate());
            whereClause.birthDate = {
                [sequelize_1.Op.between]: [minBirthDate, maxBirthDate]
            };
        }
        return whereClause;
    }
    buildProductionWhereClause(filters) {
        const whereClause = { isDeleted: false };
        if (filters.startDate) {
            whereClause.recordedDate = { [sequelize_1.Op.gte]: filters.startDate };
        }
        if (filters.endDate) {
            if (whereClause.recordedDate) {
                whereClause.recordedDate[sequelize_1.Op.lte] = filters.endDate;
            }
            else {
                whereClause.recordedDate = { [sequelize_1.Op.lte]: filters.endDate };
            }
        }
        if (filters.productionType) {
            whereClause.type = filters.productionType;
        }
        return whereClause;
    }
    shouldCacheReport(type, filters) {
        const heavyReports = [
            'COMPREHENSIVE_DASHBOARD',
            'GEOSPATIAL_ANALYSIS',
            'DISEASE_ANALYSIS',
            'ROI_ANALYSIS'
        ];
        return heavyReports.includes(type) && !filters.realTime;
    }
    getCacheExpiration(type) {
        const expirations = {
            'HEALTH_OVERVIEW': 3600,
            'PRODUCTION_SUMMARY': 1800,
            'FINANCIAL_SUMMARY': 7200,
            'COMPREHENSIVE_DASHBOARD': 1800,
            'GEOSPATIAL_ANALYSIS': 3600
        };
        return expirations[type] || 3600;
    }
    addDataToExcelSheet(sheet, data) {
        if (typeof data === 'object' && data !== null) {
            for (const [key, value] of Object.entries(data)) {
                sheet.addRow([key, JSON.stringify(value)]);
            }
        }
    }
    convertObjectToCSV(data) {
        let csv = '';
        if (typeof data === 'object' && data !== null) {
            for (const [key, value] of Object.entries(data)) {
                csv += `"${key}","${JSON.stringify(value).replace(/"/g, '""')}"\n`;
            }
        }
        return csv;
    }
}
exports.ReportsService = ReportsService;
exports.reportsService = new ReportsService();
//# sourceMappingURL=report.js.map