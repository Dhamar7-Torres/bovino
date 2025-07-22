import { Op, QueryTypes, Transaction } from 'sequelize';
import { logger as appLogger } from '../utils/logger';

// Logger específico para el servicio de reportes
const logger = {
  info: (message: string, metadata?: any) => appLogger.info(message, metadata, 'ReportsService'),
  error: (message: string, error?: any) => appLogger.error(message, { error }, error as Error, 'ReportsService'),
  warn: (message: string, metadata?: any) => appLogger.warn(message, metadata, 'ReportsService')
};

// Mocks para librerías externas
const ExcelJS = {
  Workbook: class {
    public xlsx: {
      writeBuffer: () => Promise<Buffer>;
    };

    constructor() {
      this.xlsx = {
        writeBuffer: async (): Promise<Buffer> => Buffer.from('mock excel data')
      };
    }

    addWorksheet(name: string) {
      return {
        addRow: (data: any[]) => {},
        columns: []
      };
    }
  }
};

const PDFKit = class {
  private buffers: Buffer[] = [];
  
  constructor() {
    this.buffers = [];
  }
  
  on(event: string, callback: (buffer: Buffer) => void): this {
    if (event === 'data') {
      setTimeout(() => callback(Buffer.from('mock pdf data')), 100);
    }
    if (event === 'end') {
      setTimeout(() => (callback as any)(), 200);
    }
    return this;
  }
  
  fontSize(size: number): this { return this; }
  text(text: string, x?: number, y?: number): this { return this; }
  addPage(): this { return this; }
  end(): void {}
};

// Tipos y interfaces para reportes
export type ReportType = 
  | 'HEALTH_OVERVIEW'
  | 'HEALTH_TRENDS'
  | 'DISEASE_ANALYSIS'
  | 'VACCINATION_COVERAGE'
  | 'VACCINATION_SCHEDULE'
  | 'VACCINATION_EFFICACY'
  | 'PRODUCTION_SUMMARY'
  | 'PRODUCTION_TRENDS'
  | 'BREEDING_OVERVIEW'
  | 'PREGNANCY_STATUS'
  | 'BIRTH_RECORDS'
  | 'FINANCIAL_SUMMARY'
  | 'VETERINARY_COSTS'
  | 'ROI_ANALYSIS'
  | 'GEOSPATIAL_ANALYSIS'
  | 'COMPREHENSIVE_DASHBOARD';

export type ExportFormat = 'PDF' | 'EXCEL' | 'CSV' | 'JSON';

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  ranchId?: string;
  bovineIds?: string[];
  breed?: string;
  healthStatus?: string;
  ageRange?: { min: number; max: number };
  productionType?: string;
  includeGeospatial?: boolean;
  period?: 'week' | 'month' | 'quarter' | 'year';
  ignoreCache?: boolean;
  realTime?: boolean;
}

export interface ReportData {
  type: ReportType;
  title: string;
  data?: any;
  charts?: any[];
  maps?: any[];
  startTime?: number;
  metadata?: {
    generatedAt: Date;
    generatedBy: string;
    filters: ReportFilters;
    cacheKey: string;
    processingTime: number;
  };
}

export interface HealthReport {
  summary: {
    totalBovines: number;
    healthyCount: number;
    sickCount: number;
    recoveringCount: number;
    quarantineCount: number;
    healthPercentage: number;
  };
  recentIllnesses: Array<{
    id: string;
    bovineId: string;
    earTag?: string;
    bovineName?: string;
    disease: string;
    severity: string;
    diagnosisDate: Date;
    status: string;
    location?: any;
  }>;
  overdueVaccinations: any[];
  trends: any;
  locationDistribution?: any;
}

export interface VaccinationReport {
  coverageSummary: {
    totalBovines: number;
    fullyVaccinated: number;
    overdue: number;
    neverVaccinated: number;
    overallCoveragePercentage: number;
  };
  coverageByVaccine: any[];
  upcomingVaccinations: Array<{
    id: string;
    bovineId: string;
    earTag?: string;
    vaccineType: string;
    dueDate: Date;
    daysPending: number;
    location?: any;
  }>;
  monthlyHistory: any[];
  recommendations: string[];
}

export interface ProductionReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  summary: Array<{
    type: string;
    unit: string;
    totalRecords: number;
    totalValue: number;
    averageValue: number;
    minimumValue: number;
    maximumValue: number;
  }>;
  topProducers: any[];
  monthlyTrends: any[];
  periodComparison: any;
  efficiencyAnalysis: any;
  recommendations: string[];
}

export interface FinancialReport {
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalExpenses: number;
  expensesByCategory: Array<{
    category: string;
    amount: number;
    transactionCount: number;
    averageAmount: number;
  }>;
  expensesByBovine: any[];
  monthlyTrends: any[];
  treatmentROI: any;
  budgetAnalysis: any;
  recommendations: string[];
}

export interface GeospatialReport {
  coverageArea: any;
  bovineDistribution: any[];
  diseaseClusters: any[];
  densityAnalysis: any;
  movementPatterns: any[];
  riskZones: any[];
  recommendations: string[];
}

export interface TrendAnalysis {
  period: string;
  dateRange: { startDate: Date; endDate: Date };
  diagnosisTrends: any[];
  outbreakAnalysis: any;
  treatmentEfficacy: any;
  riskFactors: any;
  seasonalPatterns: any;
  recommendations: string[];
}

export interface ReportMetrics {
  totalReports: number;
  byType: Record<ReportType, number>;
  averageGenerationTime: number;
  cacheHitRate: number;
}

export interface DashboardData {
  summary: {
    totalBovines: number;
    healthyPercentage: number;
    productionToday: number;
    alertsCount: number;
  };
  charts: any[];
  maps: any[];
  alerts: any[];
  recentActivity: any[];
}

// Clases de error personalizadas
export class ApiError extends Error {
  public statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Mocks para modelos
const Bovine = {
  count: async (options?: any): Promise<number> => 150,
  findAll: async (options?: any): Promise<any[]> => [
    { id: '1', earTag: 'COW001', name: 'Bella', breed: 'Holstein', healthStatus: 'HEALTHY' },
    { id: '2', earTag: 'COW002', name: 'Luna', breed: 'Jersey', healthStatus: 'SICK' }
  ],
  findByPk: async (id: string): Promise<any | null> => ({
    id,
    earTag: `COW${id.padStart(3, '0')}`,
    name: `Bovine ${id}`,
    breed: 'Holstein',
    healthStatus: 'HEALTHY'
  })
};

const Health = {
  findAll: async (options?: any): Promise<any[]> => [
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
  findAll: async (options?: any): Promise<any[]> => [],
  findAndCountAll: async (options?: any): Promise<{ rows: any[]; count: number }> => ({
    rows: [],
    count: 0
  })
};

const Finance = {
  findAll: async (options?: any): Promise<any[]> => []
};

const Reproduction = {
  findAll: async (options?: any): Promise<any[]> => []
};

const Event = {
  findAll: async (options?: any): Promise<any[]> => []
};

const Location = {
  findAll: async (options?: any): Promise<any[]> => []
};

const Ranch = {
  findByPk: async (id: string): Promise<any | null> => ({
    id,
    name: `Ranch ${id}`,
    location: { latitude: 19.4326, longitude: -99.1332 }
  })
};

const Vaccination = {
  findAll: async (options?: any): Promise<any[]> => []
};

const sequelize = {
  query: async (sql: string, options?: any): Promise<any[]> => [],
  fn: (fn: string, col: any) => ({ fn, col }),
  col: (column: string) => ({ column }),
  literal: (value: string) => ({ literal: value }),
  transaction: async (): Promise<Transaction> => ({
    commit: async () => {},
    rollback: async () => {}
  } as Transaction)
};

// Mocks para servicios
class ProductionService {
  async getProductionMetrics(): Promise<any> {
    return { totalProduction: 1000, averageDaily: 50 };
  }
}

class HealthService {
  async getHealthMetrics(): Promise<any> {
    return { healthyCount: 120, sickCount: 30 };
  }
}

class LocationService {
  async getLocationData(): Promise<any> {
    return { coordinates: [19.4326, -99.1332] };
  }
}

class CacheService {
  private cache = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.cache.get(key) || null;
  }

  async set(key: string, value: string, expiration?: number): Promise<void> {
    this.cache.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key);
  }
}

export class ReportsService {
  private productionService: ProductionService;
  private healthService: HealthService;
  private locationService: LocationService;
  private cacheService: CacheService;

  constructor() {
    this.productionService = new ProductionService();
    this.healthService = new HealthService();
    this.locationService = new LocationService();
    this.cacheService = new CacheService();
  }

  // ============================================================================
  // MÉTODOS PRINCIPALES DE GENERACIÓN DE REPORTES
  // ============================================================================

  /**
   * Generar reporte según tipo y filtros
   * @param type - Tipo de reporte
   * @param filters - Filtros aplicados
   * @param userId - ID del usuario que solicita
   * @returns Promise<ReportData>
   */
  public async generateReport(
    type: ReportType,
    filters: ReportFilters,
    userId: string
  ): Promise<ReportData> {
    try {
      logger.info('📊 Generando reporte', { type, filters, userId });

      // Verificar cache primero para reportes pesados
      const cacheKey = this.generateCacheKey(type, filters);
      const cachedReport = await this.cacheService.get(cacheKey);
      
      if (cachedReport && !filters.ignoreCache) {
        logger.info('✅ Reporte obtenido desde cache', { type });
        return JSON.parse(cachedReport);
      }

      // Validar filtros
      await this.validateFilters(filters);

      let reportData: ReportData;

      // Generar reporte según tipo
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

      // Agregar metadatos al reporte
      reportData.metadata = {
        generatedAt: new Date(),
        generatedBy: userId,
        filters: filters,
        cacheKey: cacheKey,
        processingTime: Date.now() - (reportData.startTime || 0)
      };

      // Cachear resultado si es apropiado
      if (this.shouldCacheReport(type, filters)) {
        await this.cacheService.set(
          cacheKey, 
          JSON.stringify(reportData), 
          this.getCacheExpiration(type)
        );
      }

      logger.info('✅ Reporte generado exitosamente', { 
        type, 
        processingTime: reportData.metadata.processingTime,
        dataPoints: Array.isArray(reportData.data) ? reportData.data.length : 0
      });

      return reportData;

    } catch (error) {
      logger.error('❌ Error generando reporte', { error, type, filters });
      throw error;
    }
  }

  // ============================================================================
  // REPORTES DE SALUD VETERINARIA
  // ============================================================================

  /**
   * Generar reporte general de salud
   * @param filters - Filtros del reporte
   * @returns Promise<ReportData>
   */
  private async generateHealthOverviewReport(filters: ReportFilters): Promise<ReportData> {
    const startTime = Date.now();

    try {
      const whereClause = this.buildBovineWhereClause(filters);
      
      // Obtener estadísticas principales
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

      // Enfermedades recientes
      const recentIllnesses = await Health.findAll({
        where: {
          diagnosisDate: {
            [Op.gte]: filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          ...(filters.endDate && { diagnosisDate: { [Op.lte]: filters.endDate } })
        },
        include: [{
          model: Bovine,
          where: whereClause,
          attributes: ['earTag', 'name', 'breed']
        }],
        order: [['diagnosisDate', 'DESC']],
        limit: 10
      });

      // Vacunaciones pendientes
      const overdueVaccinations = await this.getOverdueVaccinations(filters);

      // Tendencias de salud (último mes)
      const healthTrends = await this.calculateHealthTrends(filters);

      // Distribución por ubicación si hay filtro geográfico
      let locationDistribution = null;
      if (filters.includeGeospatial) {
        locationDistribution = await this.getHealthLocationDistribution(filters);
      }

      const reportData: HealthReport = {
        summary: {
          totalBovines,
          healthyCount: healthStats.find((stat: any) => stat.healthStatus === 'HEALTHY')?.count || 0,
          sickCount: healthStats.find((stat: any) => stat.healthStatus === 'SICK')?.count || 0,
          recoveringCount: healthStats.find((stat: any) => stat.healthStatus === 'RECOVERING')?.count || 0,
          quarantineCount: healthStats.find((stat: any) => stat.healthStatus === 'QUARANTINE')?.count || 0,
          healthPercentage: ((healthStats.find((stat: any) => stat.healthStatus === 'HEALTHY')?.count || 0) / totalBovines) * 100
        },
        recentIllnesses: recentIllnesses.map((illness: any) => ({
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

    } catch (error) {
      logger.error('❌ Error generando reporte de salud general', { error, filters });
      throw new ApiError('Error generando reporte de salud', 500);
    }
  }

  /**
   * Generar reporte de tendencias de salud
   * @param filters - Filtros del reporte
   * @returns Promise<ReportData>
   */
  private async generateHealthTrendsReport(filters: ReportFilters): Promise<ReportData> {
    const startTime = Date.now();

    try {
      const period = filters.period || 'month';
      const startDate = filters.startDate || new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000);
      const endDate = filters.endDate || new Date();

      // Tendencias de diagnósticos por período
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
        type: QueryTypes.SELECT
      });

      // Análisis de brotes (clustering temporal y geográfico)
      const outbreakAnalysis = await this.detectOutbreaks(filters);

      // Eficacia de tratamientos
      const treatmentEfficacy = await this.analyzeTreatmentEfficacy(filters);

      // Factores de riesgo identificados
      const riskFactors = await this.identifyRiskFactors(filters);

      const reportData: TrendAnalysis = {
        period,
        dateRange: { startDate, endDate },
        diagnosisTrends: diagnosisTrends as any[],
        outbreakAnalysis,
        treatmentEfficacy,
        riskFactors,
        seasonalPatterns: await this.analyzeSeasonalPatterns(filters),
        recommendations: this.generateHealthRecommendations(diagnosisTrends as any[])
      };

      return {
        type: 'HEALTH_TRENDS',
        title: 'Análisis de Tendencias de Salud',
        data: reportData,
        charts: this.generateTrendCharts(reportData),
        startTime
      };

    } catch (error) {
      logger.error('❌ Error generando reporte de tendencias de salud', { error, filters });
      throw new ApiError('Error generando reporte de tendencias', 500);
    }
  }

  // ============================================================================
  // REPORTES DE VACUNACIÓN
  // ============================================================================

  /**
   * Generar reporte de cobertura de vacunación
   * @param filters - Filtros del reporte
   * @returns Promise<ReportData>
   */
  private async generateVaccinationCoverageReport(filters: ReportFilters): Promise<ReportData> {
    const startTime = Date.now();

    try {
      const whereClause = this.buildBovineWhereClause(filters);

      // Cobertura por tipo de vacuna
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
        type: QueryTypes.SELECT
      });

      // Bovinos con vacunación al día vs atrasada
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
        type: QueryTypes.SELECT
      });

      // Próximas vacunaciones (siguiente mes)
      const upcomingVaccinations = await Vaccination.findAll({
        where: {
          nextDueDate: {
            [Op.between]: [new Date(), new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
          },
          status: { [Op.ne]: 'COMPLETED' }
        },
        include: [{
          model: Bovine,
          where: whereClause,
          attributes: ['earTag', 'name', 'breed']
        }],
        order: [['nextDueDate', 'ASC']]
      });

      // Historial de vacunaciones por mes
      const monthlyVaccinations = await this.getMonthlyVaccinationHistory(filters);

      const reportData: VaccinationReport = {
        coverageSummary: {
          totalBovines: await Bovine.count({ where: whereClause }),
          fullyVaccinated: (vaccinationStatus as any[]).find((s: any) => s.status === 'UP_TO_DATE')?.count || 0,
          overdue: (vaccinationStatus as any[]).find((s: any) => s.status === 'OVERDUE')?.count || 0,
          neverVaccinated: (vaccinationStatus as any[]).find((s: any) => s.status === 'NO_VACCINATION')?.count || 0,
          overallCoveragePercentage: 0 // Calculado después
        },
        coverageByVaccine: vaccinationCoverage as any[],
        upcomingVaccinations: upcomingVaccinations.map((vacc: any) => ({
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

      // Calcular porcentaje general de cobertura
      const totalBovines = reportData.coverageSummary.totalBovines;
      reportData.coverageSummary.overallCoveragePercentage = 
        ((reportData.coverageSummary.fullyVaccinated / totalBovines) * 100);

      // Generar recomendaciones
      reportData.recommendations = this.generateVaccinationRecommendations(reportData);

      return {
        type: 'VACCINATION_COVERAGE',
        title: 'Reporte de Cobertura de Vacunación',
        data: reportData,
        charts: this.generateVaccinationCharts(reportData),
        startTime
      };

    } catch (error) {
      logger.error('❌ Error generando reporte de cobertura de vacunación', { error, filters });
      throw new ApiError('Error generando reporte de vacunación', 500);
    }
  }

  // ============================================================================
  // REPORTES DE PRODUCCIÓN
  // ============================================================================

  /**
   * Generar reporte resumen de producción
   * @param filters - Filtros del reporte
   * @returns Promise<ReportData>
   */
  private async generateProductionSummaryReport(filters: ReportFilters): Promise<ReportData> {
    const startTime = Date.now();

    try {
      const whereClause = this.buildProductionWhereClause(filters);

      // Resumen por tipo de producción
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

      // Top productores
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
        type: QueryTypes.SELECT
      });

      // Tendencias mensuales
      const monthlyTrends = await this.getMonthlyProductionTrends(filters);

      // Comparación con períodos anteriores
      const periodComparison = await this.compareProductionPeriods(filters);

      // Análisis de eficiencia
      const efficiencyAnalysis = await this.analyzeProductionEfficiency(filters);

      const reportData: ProductionReport = {
        period: {
          startDate: filters.startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          endDate: filters.endDate || new Date()
        },
        summary: (productionSummary as any[]).map((item: any) => ({
          type: item.type,
          unit: item.unit,
          totalRecords: item.recordCount,
          totalValue: item.totalValue,
          averageValue: parseFloat(item.averageValue),
          minimumValue: item.minimumValue,
          maximumValue: item.maximumValue
        })),
        topProducers: topProducers as any[],
        monthlyTrends,
        periodComparison,
        efficiencyAnalysis,
        recommendations: []
      };

      // Generar recomendaciones
      reportData.recommendations = this.generateProductionRecommendations(reportData);

      return {
        type: 'PRODUCTION_SUMMARY',
        title: 'Reporte Resumen de Producción',
        data: reportData,
        charts: this.generateProductionCharts(reportData),
        startTime
      };

    } catch (error) {
      logger.error('❌ Error generando reporte de producción', { error, filters });
      throw new ApiError('Error generando reporte de producción', 500);
    }
  }

  // ============================================================================
  // REPORTES FINANCIEROS
  // ============================================================================

  /**
   * Generar reporte de costos veterinarios
   * @param filters - Filtros del reporte
   * @returns Promise<ReportData>
   */
  private async generateVeterinaryCostsReport(filters: ReportFilters): Promise<ReportData> {
    const startTime = Date.now();

    try {
      // Costos por categoría
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
            [Op.between]: [
              filters.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
              filters.endDate || new Date()
            ]
          },
          ...(filters.ranchId && { ranchId: filters.ranchId })
        },
        group: ['category', 'subcategory'],
        raw: true
      });

      // Costos por bovino
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
        type: QueryTypes.SELECT
      });

      // Tendencias mensuales de gastos
      const monthlyExpenses = await this.getMonthlyVeterinaryExpenses(filters);

      // ROI de tratamientos (relación costo-beneficio)
      const treatmentROI = await this.calculateTreatmentROI(filters);

      // Presupuesto vs gastos reales
      const budgetAnalysis = await this.analyzeBudgetVsActual(filters);

      const reportData: FinancialReport = {
        period: {
          startDate: filters.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          endDate: filters.endDate || new Date()
        },
        totalExpenses: (costsByCategory as any[]).reduce((sum: number, item: any) => sum + parseFloat(item.totalAmount), 0),
        expensesByCategory: (costsByCategory as any[]).map((item: any) => ({
          category: item.subcategory || item.category,
          amount: parseFloat(item.totalAmount),
          transactionCount: item.transactionCount,
          averageAmount: parseFloat(item.averageAmount)
        })),
        expensesByBovine: costsByBovine as any[],
        monthlyTrends: monthlyExpenses,
        treatmentROI,
        budgetAnalysis,
        recommendations: []
      };

      // Generar recomendaciones financieras
      reportData.recommendations = this.generateFinancialRecommendations(reportData);

      return {
        type: 'VETERINARY_COSTS',
        title: 'Reporte de Costos Veterinarios',
        data: reportData,
        charts: this.generateFinancialCharts(reportData),
        startTime
      };

    } catch (error) {
      logger.error('❌ Error generando reporte de costos veterinarios', { error, filters });
      throw new ApiError('Error generando reporte financiero', 500);
    }
  }

  // ============================================================================
  // REPORTES GEOESPACIALES
  // ============================================================================

  /**
   * Generar análisis geoespacial
   * @param filters - Filtros del reporte
   * @returns Promise<ReportData>
   */
  private async generateGeospatialAnalysisReport(filters: ReportFilters): Promise<ReportData> {
    const startTime = Date.now();

    try {
      // Distribución de bovinos por zona
      const bovineDistribution = await this.getBovineLocationDistribution(filters);

      // Clusters de enfermedades
      const diseaseClusters = await this.identifyDiseaseClusters(filters);

      // Análisis de densidad
      const densityAnalysis = await this.calculateLocationDensity(filters);

      // Rutas de movimiento (si hay datos de tracking)
      const movementPatterns = await this.analyzeMovementPatterns(filters);

      // Zonas de riesgo identificadas
      const riskZones = await this.identifyRiskZones(filters);

      const reportData: GeospatialReport = {
        coverageArea: await this.calculateCoverageArea(filters),
        bovineDistribution,
        diseaseClusters,
        densityAnalysis,
        movementPatterns,
        riskZones,
        recommendations: []
      };

      // Generar recomendaciones geoespaciales
      reportData.recommendations = this.generateGeospatialRecommendations(reportData);

      return {
        type: 'GEOSPATIAL_ANALYSIS',
        title: 'Análisis Geoespacial',
        data: reportData,
        maps: this.generateGeospatialMaps(reportData),
        startTime
      };

    } catch (error) {
      logger.error('❌ Error generando análisis geoespacial', { error, filters });
      throw new ApiError('Error generando reporte geoespacial', 500);
    }
  }

  // ============================================================================
  // EXPORTACIÓN DE REPORTES
  // ============================================================================

  /**
   * Exportar reporte en formato especificado
   * @param reportData - Datos del reporte
   * @param format - Formato de exportación
   * @param options - Opciones de exportación
   * @returns Promise<Buffer>
   */
  public async exportReport(
    reportData: ReportData,
    format: ExportFormat,
    options: {
      includeCharts?: boolean;
      includeMaps?: boolean;
      customization?: any;
    } = {}
  ): Promise<Buffer> {
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

    } catch (error) {
      logger.error('❌ Error exportando reporte', { error, format });
      throw new ApiError('Error exportando reporte', 500);
    }
  }

  /**
   * Exportar a PDF
   * @param reportData - Datos del reporte
   * @param options - Opciones
   * @returns Promise<Buffer>
   */
  private async exportToPDF(
    reportData: ReportData, 
    options: any
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFKit();
        const buffers: Buffer[] = [];

        doc.on('data', (buffer: Buffer) => buffers.push(buffer));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // Encabezado del documento
        doc.fontSize(20).text(reportData.title, 50, 50);
        doc.fontSize(12).text(`Generado: ${new Date().toLocaleString('es-ES')}`, 50, 80);
        
        // Contenido principal (simplificado)
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

        // Incluir gráficos si se especifica
        if (options.includeCharts && reportData.charts) {
          doc.addPage();
          doc.text('Gráficos y Visualizaciones', 50, 50);
          // Aquí se integrarían las imágenes de los gráficos
        }

        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Exportar a Excel
   * @param reportData - Datos del reporte
   * @param options - Opciones
   * @returns Promise<Buffer>
   */
  private async exportToExcel(
    reportData: ReportData, 
    options: any
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    
    // Hoja principal con resumen
    const summarySheet = workbook.addWorksheet('Resumen');
    
    // Encabezados
    summarySheet.addRow(['Reporte', reportData.title]);
    summarySheet.addRow(['Tipo', reportData.type]);
    summarySheet.addRow(['Generado', new Date().toLocaleString('es-ES')]);
    summarySheet.addRow([]); // Fila vacía

    // Datos principales
    if (reportData.data && typeof reportData.data === 'object') {
      this.addDataToExcelSheet(summarySheet, reportData.data);
    }

    // Hojas adicionales según el tipo de reporte
    if (reportData.type === 'HEALTH_OVERVIEW' && reportData.data) {
      const healthData = reportData.data as HealthReport;
      
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

  /**
   * Exportar a CSV
   * @param reportData - Datos del reporte
   * @returns Promise<Buffer>
   */
  private async exportToCSV(reportData: ReportData): Promise<Buffer> {
    let csvContent = '';
    
    // Encabezado
    csvContent += `"Reporte","${reportData.title}"\n`;
    csvContent += `"Tipo","${reportData.type}"\n`;
    csvContent += `"Generado","${new Date().toLocaleString('es-ES')}"\n\n`;

    // Datos principales (implementación simplificada)
    if (reportData.data && typeof reportData.data === 'object') {
      csvContent += this.convertObjectToCSV(reportData.data);
    }

    return Buffer.from(csvContent, 'utf8');
  }

  // ============================================================================
  // MÉTODOS DE SOPORTE Y UTILIDADES
  // ============================================================================

  // Implementar todos los métodos faltantes que se referencian en el código
  private async generateDiseaseAnalysisReport(filters: ReportFilters): Promise<ReportData> {
    return {
      type: 'DISEASE_ANALYSIS',
      title: 'Análisis de Enfermedades',
      data: { message: 'Reporte en desarrollo' },
      startTime: Date.now()
    };
  }

  private async generateVaccinationScheduleReport(filters: ReportFilters): Promise<ReportData> {
    return {
      type: 'VACCINATION_SCHEDULE',
      title: 'Cronograma de Vacunación',
      data: { message: 'Reporte en desarrollo' },
      startTime: Date.now()
    };
  }

  private async generateVaccinationEfficacyReport(filters: ReportFilters): Promise<ReportData> {
    return {
      type: 'VACCINATION_EFFICACY',
      title: 'Eficacia de Vacunación',
      data: { message: 'Reporte en desarrollo' },
      startTime: Date.now()
    };
  }

  private async generateProductionTrendsReport(filters: ReportFilters): Promise<ReportData> {
    return {
      type: 'PRODUCTION_TRENDS',
      title: 'Tendencias de Producción',
      data: { message: 'Reporte en desarrollo' },
      startTime: Date.now()
    };
  }

  private async generateBreedingOverviewReport(filters: ReportFilters): Promise<ReportData> {
    return {
      type: 'BREEDING_OVERVIEW',
      title: 'Resumen de Reproducción',
      data: { message: 'Reporte en desarrollo' },
      startTime: Date.now()
    };
  }

  private async generatePregnancyStatusReport(filters: ReportFilters): Promise<ReportData> {
    return {
      type: 'PREGNANCY_STATUS',
      title: 'Estado de Preñez',
      data: { message: 'Reporte en desarrollo' },
      startTime: Date.now()
    };
  }

  private async generateBirthRecordsReport(filters: ReportFilters): Promise<ReportData> {
    return {
      type: 'BIRTH_RECORDS',
      title: 'Registros de Nacimientos',
      data: { message: 'Reporte en desarrollo' },
      startTime: Date.now()
    };
  }

  private async generateFinancialSummaryReport(filters: ReportFilters): Promise<ReportData> {
    return {
      type: 'FINANCIAL_SUMMARY',
      title: 'Resumen Financiero',
      data: { message: 'Reporte en desarrollo' },
      startTime: Date.now()
    };
  }

  private async generateROIAnalysisReport(filters: ReportFilters): Promise<ReportData> {
    return {
      type: 'ROI_ANALYSIS',
      title: 'Análisis de ROI',
      data: { message: 'Reporte en desarrollo' },
      startTime: Date.now()
    };
  }

  private async generateComprehensiveDashboard(filters: ReportFilters): Promise<ReportData> {
    return {
      type: 'COMPREHENSIVE_DASHBOARD',
      title: 'Dashboard Completo',
      data: { message: 'Reporte en desarrollo' },
      startTime: Date.now()
    };
  }

  // Métodos de soporte con implementaciones básicas
  private async getOverdueVaccinations(filters: ReportFilters): Promise<any[]> {
    return [];
  }

  private async calculateHealthTrends(filters: ReportFilters): Promise<any> {
    return { trend: 'STABLE', confidence: 0.8 };
  }

  private async getHealthLocationDistribution(filters: ReportFilters): Promise<any> {
    return [];
  }

  private async detectOutbreaks(filters: ReportFilters): Promise<any> {
    return { outbreaks: [] };
  }

  private async analyzeTreatmentEfficacy(filters: ReportFilters): Promise<any> {
    return { efficacy: 85 };
  }

  private async identifyRiskFactors(filters: ReportFilters): Promise<any> {
    return { factors: [] };
  }

  private async analyzeSeasonalPatterns(filters: ReportFilters): Promise<any> {
    return { patterns: [] };
  }

  private async getMonthlyVaccinationHistory(filters: ReportFilters): Promise<any[]> {
    return [];
  }

  private async getMonthlyProductionTrends(filters: ReportFilters): Promise<any[]> {
    return [];
  }

  private async compareProductionPeriods(filters: ReportFilters): Promise<any> {
    return { comparison: 'equal' };
  }

  private async analyzeProductionEfficiency(filters: ReportFilters): Promise<any> {
    return { efficiency: 80 };
  }

  private async getMonthlyVeterinaryExpenses(filters: ReportFilters): Promise<any[]> {
    return [];
  }

  private async calculateTreatmentROI(filters: ReportFilters): Promise<any> {
    return { roi: 1.5 };
  }

  private async analyzeBudgetVsActual(filters: ReportFilters): Promise<any> {
    return { variance: 5 };
  }

  private async getBovineLocationDistribution(filters: ReportFilters): Promise<any[]> {
    return [];
  }

  private async identifyDiseaseClusters(filters: ReportFilters): Promise<any[]> {
    return [];
  }

  private async calculateLocationDensity(filters: ReportFilters): Promise<any> {
    return { density: 'medium' };
  }

  private async analyzeMovementPatterns(filters: ReportFilters): Promise<any[]> {
    return [];
  }

  private async identifyRiskZones(filters: ReportFilters): Promise<any[]> {
    return [];
  }

  private async calculateCoverageArea(filters: ReportFilters): Promise<any> {
    return { area: 100 };
  }

  // Métodos de generación de gráficos y mapas
  private generateHealthCharts(data: HealthReport): any[] {
    return [];
  }

  private generateTrendCharts(data: TrendAnalysis): any[] {
    return [];
  }

  private generateVaccinationCharts(data: VaccinationReport): any[] {
    return [];
  }

  private generateProductionCharts(data: ProductionReport): any[] {
    return [];
  }

  private generateFinancialCharts(data: FinancialReport): any[] {
    return [];
  }

  private generateGeospatialMaps(data: GeospatialReport): any[] {
    return [];
  }

  // Métodos de generación de recomendaciones
  private generateHealthRecommendations(trends: any[]): string[] {
    return ['Mantener seguimiento de salud'];
  }

  private generateVaccinationRecommendations(data: VaccinationReport): string[] {
    return ['Completar vacunaciones pendientes'];
  }

  private generateProductionRecommendations(data: ProductionReport): string[] {
    return ['Optimizar alimentación'];
  }

  private generateFinancialRecommendations(data: FinancialReport): string[] {
    return ['Controlar gastos veterinarios'];
  }

  private generateGeospatialRecommendations(data: GeospatialReport): string[] {
    return ['Mejorar distribución de pastoreo'];
  }

  // Métodos de utilidades
  private generateCacheKey(type: ReportType, filters: ReportFilters): string {
    const filterHash = Buffer.from(JSON.stringify(filters)).toString('base64');
    return `report:${type}:${filterHash}`;
  }

  private async validateFilters(filters: ReportFilters): Promise<void> {
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
        where: { id: { [Op.in]: filters.bovineIds } }
      });
      if (bovineCount !== filters.bovineIds.length) {
        throw new ValidationError('Algunos bovinos especificados no existen');
      }
    }
  }

  private buildBovineWhereClause(filters: ReportFilters): any {
    const whereClause: any = { isActive: true };

    if (filters.ranchId) {
      whereClause.ranchId = filters.ranchId;
    }

    if (filters.bovineIds && filters.bovineIds.length > 0) {
      whereClause.id = { [Op.in]: filters.bovineIds };
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
        [Op.between]: [minBirthDate, maxBirthDate]
      };
    }

    return whereClause;
  }

  private buildProductionWhereClause(filters: ReportFilters): any {
    const whereClause: any = { isDeleted: false };

    if (filters.startDate) {
      whereClause.recordedDate = { [Op.gte]: filters.startDate };
    }

    if (filters.endDate) {
      if (whereClause.recordedDate) {
        whereClause.recordedDate[Op.lte] = filters.endDate;
      } else {
        whereClause.recordedDate = { [Op.lte]: filters.endDate };
      }
    }

    if (filters.productionType) {
      whereClause.type = filters.productionType;
    }

    return whereClause;
  }

  private shouldCacheReport(type: ReportType, filters: ReportFilters): boolean {
    const heavyReports = [
      'COMPREHENSIVE_DASHBOARD',
      'GEOSPATIAL_ANALYSIS',
      'DISEASE_ANALYSIS',
      'ROI_ANALYSIS'
    ];

    return heavyReports.includes(type) && !filters.realTime;
  }

  private getCacheExpiration(type: ReportType): number {
    const expirations: Record<string, number> = {
      'HEALTH_OVERVIEW': 3600,
      'PRODUCTION_SUMMARY': 1800,
      'FINANCIAL_SUMMARY': 7200,
      'COMPREHENSIVE_DASHBOARD': 1800,
      'GEOSPATIAL_ANALYSIS': 3600
    };

    return expirations[type] || 3600;
  }

  private addDataToExcelSheet(sheet: any, data: any): void {
    // Implementación simplificada para agregar datos a Excel
    if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        sheet.addRow([key, JSON.stringify(value)]);
      }
    }
  }

  private convertObjectToCSV(data: any): string {
    // Implementación simplificada para convertir objeto a CSV
    let csv = '';
    if (typeof data === 'object' && data !== null) {
      for (const [key, value] of Object.entries(data)) {
        csv += `"${key}","${JSON.stringify(value).replace(/"/g, '""')}"\n`;
      }
    }
    return csv;
  }
}

// Exportar instancia única del servicio
export const reportsService = new ReportsService();