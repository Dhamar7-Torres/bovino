import { api } from "./api";
import { REPORT_ENDPOINTS } from "../constants/urls";
import { mapsService } from "./mapsService";
import {
  ReportType,
  ReportCategory,
  ReportStatus,
  ExportFormat,
  TimeGranularity,
  REPORT_TYPE_LABELS,
  EXPORT_FORMAT_LABELS,
} from "../types/reports";

// Interfaces principales para reportes
interface BaseReport {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  generatedBy: string;
  generatedAt: string;
  dateRange: DateRange;
  filters: ReportFilter[];
  status: ReportStatus;
  format: ExportFormat;
  fileUrl?: string;
  fileSize?: number;
  parameters: ReportParameters;
  metadata: ReportMetadata;
  location?: ReportLocation;
  scheduledInfo?: ScheduledReportInfo;
  expiryDate?: string;
}

interface DateRange {
  startDate: string;
  endDate: string;
  period: TimeGranularity;
  customLabel?: string;
}

interface ReportFilter {
  field: string;
  operator: string;
  value: any;
  label?: string;
}

interface ReportParameters {
  includeCharts: boolean;
  includeRawData: boolean;
  includeGeolocation: boolean;
  includePhotos: boolean;
  groupBy?: string[];
  sortBy?: SortOption[];
  aggregations?: AggregationOption[];
  customFields?: string[];
}

interface ReportMetadata {
  version: string;
  dataSource: string;
  processingTime: number;
  recordCount: number;
  accuracy: number;
  completeness: number;
  warnings: string[];
  errors: string[];
}

interface ReportLocation {
  includeLocationData: boolean;
  specificLocations?: LocationFilter[];
  boundingBox?: GeographicBounds;
  radiusFilter?: RadiusFilter;
}

interface LocationFilter {
  latitude: number;
  longitude: number;
  radius: number;
  label?: string;
}

interface GeographicBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

interface RadiusFilter {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
}

interface ScheduledReportInfo {
  frequency: ScheduleFrequency;
  nextRun: string;
  lastRun?: string;
  isActive: boolean;
  recipients: ReportRecipient[];
  deliveryMethod: DeliveryMethod;
}

interface ReportRecipient {
  name: string;
  email: string;
  role: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    pushNotification: boolean;
  };
}

interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

interface AggregationOption {
  field: string;
  function: "sum" | "avg" | "count" | "min" | "max";
  alias?: string;
}

// Reportes específicos
interface HealthReport extends BaseReport {
  type: ReportType.HEALTH_OVERVIEW;
  healthMetrics: HealthMetrics;
  diseaseAnalysis: DiseaseAnalysis;
  vaccinationCoverage: VaccinationCoverage;
  treatmentSummary: TreatmentSummary;
  riskAssessment: RiskAssessment;
  recommendations: HealthRecommendation[];
}

interface VaccinationReport extends BaseReport {
  type: ReportType.VACCINATION_COVERAGE;
  coverageMetrics: VaccinationCoverageMetrics;
  scheduleCompliance: ScheduleCompliance;
  efficacyAnalysis: VaccineEfficacy;
  costAnalysis: VaccinationCosts;
  upcomingVaccinations: UpcomingVaccination[];
}

interface ProductionReport extends BaseReport {
  type: ReportType.PRODUCTION_METRICS;
  productionMetrics: ProductionMetrics;
  trends: ProductionTrend[];
  efficiency: EfficiencyMetrics;
  qualityAnalysis: QualityAnalysis;
  recommendations: ProductionRecommendation[];
}

interface FinancialReport extends BaseReport {
  type: ReportType.FINANCIAL_SUMMARY;
  revenue: RevenueAnalysis;
  expenses: ExpenseAnalysis;
  profitability: ProfitabilityAnalysis;
  cashFlow: CashFlowAnalysis;
  budgetComparison: BudgetComparison;
  roi: ROIAnalysis;
}

// Métricas específicas
interface HealthMetrics {
  totalAnimals: number;
  healthyAnimals: number;
  sickAnimals: number;
  quarantinedAnimals: number;
  mortalityRate: number;
  morbidityRate: number;
  byCategory: HealthMetricsByCategory[];
  trends: HealthTrend[];
}

interface HealthMetricsByCategory {
  category: string;
  count: number;
  healthyCount: number;
  sickCount: number;
  percentage: number;
}

interface HealthTrend {
  date: string;
  healthyCount: number;
  sickCount: number;
  newCases: number;
  recoveries: number;
  deaths: number;
}

interface DiseaseAnalysis {
  commonDiseases: DiseaseStatistic[];
  outbreaks: OutbreakSummary[];
  seasonalPatterns: SeasonalPattern[];
  geographicDistribution: GeographicDiseaseData[];
}

interface DiseaseStatistic {
  disease: string;
  totalCases: number;
  activeCases: number;
  incidenceRate: number;
  treatmentSuccessRate: number;
  cost: number;
}

interface VaccinationCoverage {
  overallCoverage: number;
  byVaccineType: VaccineTypeCoverage[];
  overdueAnimals: number;
  upcomingScheduled: number;
  complianceRate: number;
}

interface VaccineTypeCoverage {
  vaccineType: string;
  requiredAnimals: number;
  vaccinatedAnimals: number;
  coveragePercentage: number;
  overdueCount: number;
}

interface TreatmentSummary {
  totalTreatments: number;
  activeTreatments: number;
  successRate: number;
  averageDuration: number;
  totalCosts: number;
}

interface RiskAssessment {
  overallRisk: "low" | "medium" | "high" | "critical";
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  riskByLocation: LocationRisk[];
}

interface RiskFactor {
  factor: string;
  severity: "low" | "medium" | "high";
  likelihood: number;
  impact: string;
}

interface HealthRecommendation {
  id: string;
  type: "prevention" | "treatment" | "management";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  actionItems: string[];
  estimatedCost?: number;
  expectedImpact: string;
}

// Enums y tipos auxiliares
enum ScheduleFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
}

enum DeliveryMethod {
  EMAIL = "email",
  API = "api",
  DOWNLOAD = "download",
  FTP = "ftp",
}

interface ProductionMetrics {
  totalProduction: number;
  averageDaily: number;
  efficiency: number;
  qualityScore: number;
}

interface ProductionTrend {
  date: string;
  production: number;
  efficiency: number;
  quality: number;
}

// Más interfaces requeridas para completar el tipado
interface OutbreakSummary {
  id: string;
  disease: string;
  startDate: string;
  affectedAnimals: number;
  status: string;
}

interface SeasonalPattern {
  disease: string;
  month: number;
  averageCases: number;
  riskLevel: string;
}

interface GeographicDiseaseData {
  location: { latitude: number; longitude: number; label?: string };
  caseCount: number;
  incidenceRate: number;
}

interface VaccinationCoverageMetrics {
  overallCoverage: number;
  byVaccineType: VaccineTypeMetrics[];
  complianceRate: number;
  overdueCount: number;
}

interface VaccineTypeMetrics {
  vaccineType: string;
  coverage: number;
  administered: number;
  required: number;
}

interface ScheduleCompliance {
  onTime: number;
  late: number;
  missed: number;
  complianceRate: number;
}

interface VaccineEfficacy {
  overallEfficacy: number;
  byVaccineType: VaccineEfficacyData[];
  adverseReactions: number;
}

interface VaccineEfficacyData {
  vaccineType: string;
  efficacyRate: number;
  sampleSize: number;
  confidenceInterval: string;
}

interface VaccinationCosts {
  totalCosts: number;
  costPerAnimal: number;
  byVaccineType: VaccineCostBreakdown[];
}

interface VaccineCostBreakdown {
  vaccineType: string;
  totalCost: number;
  dosesAdministered: number;
  costPerDose: number;
}

interface UpcomingVaccination {
  cattleId: string;
  earTag: string;
  vaccineType: string;
  dueDate: string;
  daysPastDue?: number;
  priority: "high" | "medium" | "low";
}

interface EfficiencyMetrics {
  feedConversion: number;
  laborEfficiency: number;
  resourceUtilization: number;
  costPerUnit: number;
}

interface QualityAnalysis {
  averageGrade: string;
  qualityDistribution: QualityDistribution[];
  defectRate: number;
  improvementAreas: string[];
}

interface QualityDistribution {
  grade: string;
  count: number;
  percentage: number;
}

interface ProductionRecommendation {
  id: string;
  type: string;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  expectedImpact: string;
}

interface RevenueAnalysis {
  totalRevenue: number;
  revenueBySource: RevenueSource[];
  trends: RevenueTrend[];
}

interface RevenueSource {
  source: string;
  amount: number;
  percentage: number;
}

interface RevenueTrend {
  period: string;
  revenue: number;
  growth: number;
}

interface ExpenseAnalysis {
  totalExpenses: number;
  expenseByCategory: ExpenseCategory[];
  trends: ExpenseTrend[];
}

interface ExpenseCategory {
  category: string;
  amount: number;
  percentage: number;
}

interface ExpenseTrend {
  period: string;
  expenses: number;
  change: number;
}

interface ProfitabilityAnalysis {
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  ebitda: number;
}

interface CashFlowAnalysis {
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  netCashFlow: number;
}

interface BudgetComparison {
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
}

interface ROIAnalysis {
  totalInvestment: number;
  returns: number;
  roi: number;
  paybackPeriod: number;
}

interface LocationRisk {
  location: { latitude: number; longitude: number };
  riskLevel: string;
  factors: string[];
}

// Servicio principal para gestión de reportes
export class ReportsService {
  private static instance: ReportsService;
  private cache: Map<string, any> = new Map();
  private cacheTimeout: number = 10 * 60 * 1000; // 10 minutos
  private generationQueue: Map<string, Promise<any>> = new Map();

  // Singleton pattern
  public static getInstance(): ReportsService {
    if (!ReportsService.instance) {
      ReportsService.instance = new ReportsService();
    }
    return ReportsService.instance;
  }

  // ============================================================================
  // GESTIÓN DE CACHÉ Y COLA
  // ============================================================================

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}_${JSON.stringify(params || {})}`;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private clearCache(): void {
    this.cache.clear();
    console.log("🧹 Caché de reportes limpiado");
  }

  // ============================================================================
  // LISTADO Y GESTIÓN DE REPORTES
  // ============================================================================

  // Obtener lista de reportes disponibles
  public async getAvailableReports(filters?: {
    type?: ReportType;
    category?: ReportCategory;
    status?: ReportStatus;
    dateRange?: DateRange;
  }): Promise<BaseReport[]> {
    try {
      const cacheKey = this.getCacheKey("available_reports", filters);
      const cachedData = this.getCache(cacheKey);

      if (cachedData) {
        console.log("📦 Lista de reportes obtenida del caché");
        return cachedData;
      }

      console.log("📋 Obteniendo lista de reportes disponibles...");

      const response = await api.get<BaseReport[]>("/reports", {
        params: filters,
      });

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo lista de reportes");
      }

      this.setCache(cacheKey, response.data);
      console.log(`✅ ${response.data.length} reportes disponibles obtenidos`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo lista de reportes:", error);
      throw error;
    }
  }

  // Obtener reporte específico por ID
  public async getReportById(reportId: string): Promise<BaseReport> {
    try {
      console.log(`📄 Obteniendo reporte: ${reportId}`);

      const response = await api.get<BaseReport>(`/reports/${reportId}`);

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo reporte");
      }

      console.log("✅ Reporte obtenido exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo reporte:", error);
      throw error;
    }
  }

  // ============================================================================
  // GENERACIÓN DE REPORTES ESPECÍFICOS
  // ============================================================================

  // Generar reporte de salud
  public async generateHealthReport(parameters: {
    dateRange: DateRange;
    cattleIds?: string[];
    includeGeolocation?: boolean;
    includePhotos?: boolean;
    format?: ExportFormat;
  }): Promise<HealthReport> {
    try {
      console.log("🩺 Generando reporte de salud...");

      // Evitar generaciones duplicadas
      const queueKey = `health_${JSON.stringify(parameters)}`;
      if (this.generationQueue.has(queueKey)) {
        console.log("📝 Reporte de salud ya en generación, esperando...");
        return await this.generationQueue.get(queueKey)!;
      }

      // Agregar geolocalización si se solicita
      if (parameters.includeGeolocation) {
        parameters = await this.enrichWithLocationData(parameters);
      }

      const generationPromise = this.executeHealthReportGeneration(parameters);
      this.generationQueue.set(queueKey, generationPromise);

      try {
        const result = await generationPromise;
        return result;
      } finally {
        this.generationQueue.delete(queueKey);
      }
    } catch (error) {
      console.error("❌ Error generando reporte de salud:", error);
      throw error;
    }
  }

  private async executeHealthReportGeneration(
    parameters: any
  ): Promise<HealthReport> {
    const response = await api.post<HealthReport>(
      REPORT_ENDPOINTS.HEALTH_OVERVIEW,
      parameters
    );

    if (!response.success || !response.data) {
      throw new Error("Error generando reporte de salud");
    }

    console.log("✅ Reporte de salud generado exitosamente");
    return response.data;
  }

  // Generar reporte de vacunación
  public async generateVaccinationReport(parameters: {
    dateRange: DateRange;
    vaccineTypes?: string[];
    includeUpcoming?: boolean;
    includeCosts?: boolean;
    format?: ExportFormat;
  }): Promise<VaccinationReport> {
    try {
      console.log("💉 Generando reporte de vacunación...");

      const response = await api.post<VaccinationReport>(
        REPORT_ENDPOINTS.VACCINATION_COVERAGE,
        parameters
      );

      if (!response.success || !response.data) {
        throw new Error("Error generando reporte de vacunación");
      }

      console.log("✅ Reporte de vacunación generado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error generando reporte de vacunación:", error);
      throw error;
    }
  }

  // Generar reporte de producción
  public async generateProductionReport(parameters: {
    dateRange: DateRange;
    productionTypes?: string[];
    includeEfficiency?: boolean;
    includeQuality?: boolean;
    format?: ExportFormat;
  }): Promise<ProductionReport> {
    try {
      console.log("📊 Generando reporte de producción...");

      const response = await api.post<ProductionReport>(
        "/reports/production/metrics",
        parameters
      );

      if (!response.success || !response.data) {
        throw new Error("Error generando reporte de producción");
      }

      console.log("✅ Reporte de producción generado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error generando reporte de producción:", error);
      throw error;
    }
  }

  // Generar reporte financiero
  public async generateFinancialReport(parameters: {
    dateRange: DateRange;
    includeProjections?: boolean;
    includeBudgetComparison?: boolean;
    currency?: string;
    format?: ExportFormat;
  }): Promise<FinancialReport> {
    try {
      console.log("💰 Generando reporte financiero...");

      const response = await api.post<FinancialReport>(
        "/reports/financial/summary",
        parameters
      );

      if (!response.success || !response.data) {
        throw new Error("Error generando reporte financiero");
      }

      console.log("✅ Reporte financiero generado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error generando reporte financiero:", error);
      throw error;
    }
  }

  // ============================================================================
  // EXPORTACIÓN DE REPORTES
  // ============================================================================

  // Exportar reporte en formato específico
  public async exportReport(
    reportId: string,
    format: ExportFormat,
    options?: {
      includeCharts?: boolean;
      includeRawData?: boolean;
      customTemplate?: string;
      watermark?: string;
    }
  ): Promise<Blob> {
    try {
      console.log(`📤 Exportando reporte ${reportId} en formato ${format}`);

      const endpoint = this.getExportEndpoint(format);
      const response = await api.post(`${endpoint}/${reportId}`, options, {
        responseType: "blob",
      });

      if (!response.data) {
        throw new Error(`Error exportando reporte en formato ${format}`);
      }

      console.log(`✅ Reporte exportado exitosamente en formato ${format}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error exportando reporte en formato ${format}:`, error);
      throw error;
    }
  }

  private getExportEndpoint(format: ExportFormat): string {
    switch (format) {
      case ExportFormat.PDF:
        return "/reports/export/pdf";
      case ExportFormat.EXCEL:
        return "/reports/export/excel";
      case ExportFormat.CSV:
        return "/reports/export/csv";
      case ExportFormat.JSON:
        return "/reports/export/json";
      case ExportFormat.HTML:
        return "/reports/export/html";
      case ExportFormat.WORD:
        return "/reports/export/word";
      default:
        return "/reports/export/pdf";
    }
  }

  // Descargar reporte exportado
  public downloadReport(
    blob: Blob,
    filename: string,
    format: ExportFormat
  ): void {
    try {
      const mimeType = this.getMimeType(format);
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: mimeType })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log(`📁 Reporte descargado: ${filename}.${format}`);
    } catch (error) {
      console.error("❌ Error descargando reporte:", error);
      throw error;
    }
  }

  private getMimeType(format: ExportFormat): string {
    const mimeTypes = {
      [ExportFormat.PDF]: "application/pdf",
      [ExportFormat.EXCEL]:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      [ExportFormat.CSV]: "text/csv",
      [ExportFormat.JSON]: "application/json",
      [ExportFormat.HTML]: "text/html",
      [ExportFormat.WORD]:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      [ExportFormat.XML]: "application/xml",
      [ExportFormat.POWERPOINT]:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    };

    return mimeTypes[format] || "application/octet-stream";
  }

  // ============================================================================
  // REPORTES PROGRAMADOS
  // ============================================================================

  // Crear reporte programado
  public async scheduleReport(reportConfig: {
    type: ReportType;
    name: string;
    frequency: ScheduleFrequency;
    parameters: any;
    recipients: ReportRecipient[];
    format: ExportFormat;
    startDate: string;
    endDate?: string;
  }): Promise<{ id: string; nextRun: string }> {
    try {
      console.log(`⏰ Programando reporte: ${reportConfig.name}`);

      const response = await api.post("/reports/schedule", reportConfig);

      if (!response.success || !response.data) {
        throw new Error("Error programando reporte");
      }

      console.log("✅ Reporte programado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error programando reporte:", error);
      throw error;
    }
  }

  // Obtener reportes programados
  public async getScheduledReports(): Promise<BaseReport[]> {
    try {
      console.log("📅 Obteniendo reportes programados...");

      const response = await api.get<BaseReport[]>("/reports/scheduled");

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo reportes programados");
      }

      console.log(`✅ ${response.data.length} reportes programados obtenidos`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo reportes programados:", error);
      throw error;
    }
  }

  // ============================================================================
  // ANÁLISIS GEOESPACIAL
  // ============================================================================

  // Enriquecer parámetros con datos de ubicación
  private async enrichWithLocationData(parameters: any): Promise<any> {
    try {
      if (parameters.includeGeolocation) {
        // Obtener ubicación actual del usuario
        const currentLocation = await mapsService.getCurrentLocation();

        parameters.location = {
          includeLocationData: true,
          userLocation: currentLocation,
          radiusFilter: {
            centerLat: currentLocation.latitude,
            centerLng: currentLocation.longitude,
            radiusKm: 10, // 10km por defecto
          },
        };

        console.log("📍 Datos de geolocalización agregados al reporte");
      }

      return parameters;
    } catch (error) {
      console.warn("⚠️ No se pudo obtener datos de geolocalización:", error);
      return parameters;
    }
  }

  // Generar reporte geoespacial
  public async generateGeospatialReport(parameters: {
    dateRange: DateRange;
    eventTypes: string[];
    bounds?: GeographicBounds;
    includeHeatmap?: boolean;
    includeCluster?: boolean;
  }): Promise<BaseReport> {
    try {
      console.log("🗺️ Generando reporte geoespacial...");

      const response = await api.post<BaseReport>(
        "/reports/geospatial",
        parameters
      );

      if (!response.success || !response.data) {
        throw new Error("Error generando reporte geoespacial");
      }

      console.log("✅ Reporte geoespacial generado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error generando reporte geoespacial:", error);
      throw error;
    }
  }

  // ============================================================================
  // UTILIDADES Y VALIDACIONES
  // ============================================================================

  // Validar parámetros de reporte
  public validateReportParameters(
    type: ReportType,
    parameters: any
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validaciones comunes
    if (!parameters.dateRange) {
      errors.push("Rango de fechas es requerido");
    } else {
      if (!parameters.dateRange.startDate || !parameters.dateRange.endDate) {
        errors.push("Fecha de inicio y fin son requeridas");
      }

      const startDate = new Date(parameters.dateRange.startDate);
      const endDate = new Date(parameters.dateRange.endDate);

      if (startDate > endDate) {
        errors.push("Fecha de inicio debe ser anterior a fecha de fin");
      }

      if (endDate > new Date()) {
        errors.push("Fecha de fin no puede ser futura");
      }
    }

    // Validaciones específicas por tipo de reporte
    switch (type) {
      case ReportType.HEALTH_OVERVIEW:
        this.validateHealthReportParameters(parameters, errors);
        break;
      case ReportType.VACCINATION_COVERAGE:
        this.validateVaccinationReportParameters(parameters, errors);
        break;
      case ReportType.PRODUCTION_METRICS:
        this.validateProductionReportParameters(parameters, errors);
        break;
      case ReportType.FINANCIAL_SUMMARY:
        this.validateFinancialReportParameters(parameters, errors);
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private validateHealthReportParameters(
    parameters: any,
    errors: string[]
  ): void {
    if (parameters.cattleIds && !Array.isArray(parameters.cattleIds)) {
      errors.push("Lista de IDs de ganado debe ser un array");
    }
  }

  private validateVaccinationReportParameters(
    parameters: any,
    errors: string[]
  ): void {
    if (parameters.vaccineTypes && !Array.isArray(parameters.vaccineTypes)) {
      errors.push("Lista de tipos de vacuna debe ser un array");
    }
  }

  private validateProductionReportParameters(
    parameters: any,
    errors: string[]
  ): void {
    if (
      parameters.productionTypes &&
      !Array.isArray(parameters.productionTypes)
    ) {
      errors.push("Lista de tipos de producción debe ser un array");
    }
  }

  private validateFinancialReportParameters(
    parameters: any,
    errors: string[]
  ): void {
    if (parameters.currency && typeof parameters.currency !== "string") {
      errors.push("Moneda debe ser una cadena de texto");
    }
  }

  // Obtener tipos de reporte disponibles
  public getAvailableReportTypes(): Array<{
    type: ReportType;
    label: string;
    category: ReportCategory;
  }> {
    return Object.values(ReportType).map((type) => ({
      type,
      label: REPORT_TYPE_LABELS[type] || type,
      category: this.getCategoryForReportType(type),
    }));
  }

  private getCategoryForReportType(type: ReportType): ReportCategory {
    const categoryMap: Record<ReportType, ReportCategory> = {
      [ReportType.HEALTH_OVERVIEW]: ReportCategory.OPERATIONAL,
      [ReportType.VACCINATION_COVERAGE]: ReportCategory.OPERATIONAL,
      [ReportType.DISEASE_ANALYSIS]: ReportCategory.ANALYTICS,
      [ReportType.PRODUCTION_METRICS]: ReportCategory.OPERATIONAL,
      [ReportType.FINANCIAL_SUMMARY]: ReportCategory.OPERATIONAL,
      [ReportType.BREEDING_PERFORMANCE]: ReportCategory.OPERATIONAL,
      [ReportType.FEED_EFFICIENCY]: ReportCategory.ANALYTICS,
      [ReportType.GROWTH_ANALYSIS]: ReportCategory.ANALYTICS,
      [ReportType.MORTALITY_ANALYSIS]: ReportCategory.ANALYTICS,
      [ReportType.GEOGRAPHIC_DISTRIBUTION]: ReportCategory.ANALYTICS,
      [ReportType.OPERATIONAL_EFFICIENCY]: ReportCategory.OPERATIONAL,
      [ReportType.COMPLIANCE_REPORT]: ReportCategory.OPERATIONAL,
      [ReportType.CUSTOM]: ReportCategory.OPERATIONAL,
    };

    return categoryMap[type] || ReportCategory.OPERATIONAL;
  }

  // Obtener formatos de exportación disponibles
  public getAvailableExportFormats(): Array<{
    format: ExportFormat;
    label: string;
    mimeType: string;
  }> {
    return Object.values(ExportFormat).map((format) => ({
      format,
      label: EXPORT_FORMAT_LABELS[format] || format,
      mimeType: this.getMimeType(format),
    }));
  }

  // Limpiar recursos
  public cleanup(): void {
    this.clearCache();
    this.generationQueue.clear();
    console.log("🧹 Servicio de reportes limpiado");
  }
}

// Exportar instancia singleton
export const reportsService = ReportsService.getInstance();

// Exportar tipos principales
export type {
  BaseReport,
  HealthReport,
  VaccinationReport,
  ProductionReport,
  FinancialReport,
  DateRange,
  ReportFilter,
  ReportParameters,
  ReportLocation,
  ScheduledReportInfo,
};
