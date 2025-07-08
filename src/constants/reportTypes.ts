// Tipos y constantes para sistema de reportes ganaderos

export interface BaseReport {
  id: string;
  name: string;
  description?: string;
  type: ReportType;
  category: ReportCategory;
  generatedBy: string;
  generatedAt: Date;
  dateRange: DateRange;
  filters: ReportFilter[];
  status: ReportStatus;
  format: ReportFormat;
  fileUrl?: string;
  fileSize?: number;
  parameters: ReportParameters;
  metadata: ReportMetadata;
  location?: ReportLocation;
  scheduledInfo?: ScheduledReportInfo;
  expiryDate?: Date;
}

// Rango de fechas para reportes
export interface DateRange {
  startDate: Date;
  endDate: Date;
  period: ReportPeriod;
  customLabel?: string;
}

// Ubicación para reportes con geolocalización
export interface ReportLocation {
  includeLocationData: boolean;
  specificLocations?: LocationFilter[];
  boundingBox?: GeographicBounds;
  radiusFilter?: RadiusFilter;
}

// Filtro de ubicación
export interface LocationFilter {
  latitude: number;
  longitude: number;
  radius: number; // metros
  label?: string;
}

// Límites geográficos
export interface GeographicBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Filtro de radio
export interface RadiusFilter {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
}

// Reporte de salud del ganado
export interface HealthReport extends BaseReport {
  type: ReportType.HEALTH;
  healthMetrics: HealthMetrics;
  diseaseAnalysis: DiseaseAnalysis;
  vaccinationCoverage: VaccinationCoverage;
  treatmentSummary: TreatmentSummary;
  epidemiologicalData?: EpidemiologicalData;
  riskAssessment: RiskAssessment;
  recommendations: HealthRecommendation[];
}

// Métricas de salud
export interface HealthMetrics {
  totalAnimals: number;
  healthyAnimals: number;
  sickAnimals: number;
  quarantinedAnimals: number;
  recoveringAnimals: number;
  deadAnimals: number;
  healthPercentage: number;
  mortalityRate: number;
  morbidityRate: number;
  byCategory: HealthMetricsByCategory[];
  trends: HealthTrend[];
}

// Métricas por categoría
export interface HealthMetricsByCategory {
  category: string; // tipo de ganado, grupo de edad, etc.
  count: number;
  healthyCount: number;
  sickCount: number;
  percentage: number;
}

// Tendencia de salud
export interface HealthTrend {
  date: Date;
  healthyCount: number;
  sickCount: number;
  newCases: number;
  recoveries: number;
  deaths: number;
}

// Análisis de enfermedades
export interface DiseaseAnalysis {
  commonDiseases: DiseaseStatistic[];
  outbreaks: OutbreakSummary[];
  seasonalPatterns: SeasonalPattern[];
  geographicDistribution: GeographicDiseaseData[];
  costImpact: DiseaseCostImpact;
}

// Estadística de enfermedad
export interface DiseaseStatistic {
  disease: string;
  totalCases: number;
  activeCases: number;
  newCases: number;
  recoveredCases: number;
  fatalCases: number;
  incidenceRate: number;
  prevalenceRate: number;
  averageDuration: number; // días
  treatmentSuccessRate: number;
  cost: number;
}

// Resumen de brote
export interface OutbreakSummary {
  id: string;
  disease: string;
  startDate: Date;
  endDate?: Date;
  affectedAnimals: number;
  attackRate: number;
  mortalityRate: number;
  controlMeasures: string[];
  totalCost: number;
  status: OutbreakStatus;
}

// Patrón estacional
export interface SeasonalPattern {
  disease: string;
  month: number;
  averageCases: number;
  peakPeriod: boolean;
  riskLevel: SeasonalRiskLevel;
}

// Distribución geográfica de enfermedades
export interface GeographicDiseaseData {
  location: {
    latitude: number;
    longitude: number;
    label?: string;
  };
  disease: string;
  caseCount: number;
  density: number; // casos por km²
  riskLevel: GeographicRiskLevel;
}

// Impacto económico de enfermedades
export interface DiseaseCostImpact {
  totalTreatmentCosts: number;
  totalProductionLoss: number;
  totalMortalityLoss: number;
  preventionCosts: number;
  totalImpact: number;
  costPerAnimal: number;
  mostExpensiveDiseases: ExpensiveDiseaseInfo[];
}

// Información de enfermedad costosa
export interface ExpensiveDiseaseInfo {
  disease: string;
  totalCost: number;
  averageCostPerCase: number;
  caseCount: number;
}

// Cobertura de vacunación
export interface VaccinationCoverage {
  overallCoverage: number; // porcentaje
  byVaccineType: VaccineTypeCoverage[];
  byAnimalCategory: VaccinationByCategory[];
  scheduleCompliance: ScheduleCompliance;
  upcomingVaccinations: UpcomingVaccination[];
  overdueVaccinations: OverdueVaccination[];
  costs: VaccinationCosts;
}

// Cobertura por tipo de vacuna
export interface VaccineTypeCoverage {
  vaccineType: string;
  totalEligible: number;
  totalVaccinated: number;
  coveragePercentage: number;
  effectivenessRate: number;
  lastUpdate: Date;
}

// Vacunación por categoría
export interface VaccinationByCategory {
  category: string;
  animalsCount: number;
  vaccinatedCount: number;
  coveragePercentage: number;
  complianceScore: number;
}

// Cumplimiento de calendario
export interface ScheduleCompliance {
  totalScheduled: number;
  completedOnTime: number;
  completedLate: number;
  missed: number;
  complianceRate: number;
  averageDelay: number; // días
}

// Próximas vacunaciones
export interface UpcomingVaccination {
  animalId: string;
  earTag: string;
  vaccineType: string;
  dueDate: Date;
  daysUntilDue: number;
  priority: VaccinationPriority;
}

// Vacunaciones vencidas
export interface OverdueVaccination {
  animalId: string;
  earTag: string;
  vaccineType: string;
  originalDueDate: Date;
  daysOverdue: number;
  riskLevel: OverdueRiskLevel;
}

// Costos de vacunación
export interface VaccinationCosts {
  totalCosts: number;
  costPerAnimal: number;
  costPerVaccine: number;
  byVaccineType: VaccineCostBreakdown[];
  projectedCosts: ProjectedVaccinationCosts;
}

// Desglose de costos por vacuna
export interface VaccineCostBreakdown {
  vaccineType: string;
  totalCost: number;
  dosesAdministered: number;
  costPerDose: number;
  laborCosts: number;
  materialCosts: number;
}

// Costos proyectados de vacunación
export interface ProjectedVaccinationCosts {
  nextMonth: number;
  nextQuarter: number;
  nextYear: number;
  breakdown: ProjectedCostItem[];
}

// Item de costo proyectado
export interface ProjectedCostItem {
  period: string;
  vaccineType: string;
  expectedDoses: number;
  estimatedCost: number;
}

// Resumen de tratamientos
export interface TreatmentSummary {
  totalTreatments: number;
  activeTreatments: number;
  completedTreatments: number;
  successRate: number;
  averageDuration: number; // días
  totalCosts: number;
  byTreatmentType: TreatmentTypeStats[];
  medicationUsage: MedicationUsageStats[];
  veterinaryVisits: VeterinaryVisitStats;
}

// Estadísticas por tipo de tratamiento
export interface TreatmentTypeStats {
  treatmentType: string;
  count: number;
  successRate: number;
  averageCost: number;
  averageDuration: number;
  complications: number;
}

// Estadísticas de uso de medicamentos
export interface MedicationUsageStats {
  medication: string;
  totalQuantity: number;
  unit: string;
  treatmentsCount: number;
  totalCost: number;
  averageCostPerTreatment: number;
  withdrawalViolations: number;
}

// Estadísticas de visitas veterinarias
export interface VeterinaryVisitStats {
  totalVisits: number;
  emergencyVisits: number;
  routineVisits: number;
  averageCost: number;
  totalCosts: number;
  byVeterinarian: VeterinarianStats[];
}

// Estadísticas por veterinario
export interface VeterinarianStats {
  veterinarianName: string;
  visits: number;
  emergencies: number;
  averageResponseTime: number; // horas
  satisfactionScore: number;
  totalCosts: number;
}

// Datos epidemiológicos
export interface EpidemiologicalData {
  incidenceRate: number; // casos por 1000 animales
  prevalenceRate: number; // casos activos por 1000 animales
  reproductionNumber: number; // R0
  epidemiologicalCurve: EpidemicCurvePoint[];
  spatialAnalysis: SpatialEpidemiology;
  riskFactors: EpidemiologicalRiskFactor[];
}

// Punto de curva epidémica
export interface EpidemicCurvePoint {
  date: Date;
  newCases: number;
  cumulativeCases: number;
  incidenceRate: number;
}

// Epidemiología espacial
export interface SpatialEpidemiology {
  hotspots: DiseaseHotspot[];
  clusters: DiseaseCluster[];
  spatialAutocorrelation: number;
  riskMap: SpatialRiskData[];
}

// Punto caliente de enfermedad
export interface DiseaseHotspot {
  latitude: number;
  longitude: number;
  radius: number; // metros
  caseCount: number;
  density: number;
  riskScore: number;
  diseases: string[];
}

// Cluster de enfermedad
export interface DiseaseCluster {
  id: string;
  centerLat: number;
  centerLng: number;
  boundingBox: GeographicBounds;
  animalCount: number;
  caseCount: number;
  attackRate: number;
  primaryDisease: string;
  significance: number; // p-value
}

// Datos de riesgo espacial
export interface SpatialRiskData {
  latitude: number;
  longitude: number;
  riskScore: number;
  riskLevel: SpatialRiskLevel;
  factors: string[];
}

// Factor de riesgo epidemiológico
export interface EpidemiologicalRiskFactor {
  factor: string;
  oddsRatio: number;
  confidenceInterval: [number, number];
  pValue: number;
  isSignificant: boolean;
  description: string;
}

// Evaluación de riesgo
export interface RiskAssessment {
  overallRiskLevel: OverallRiskLevel;
  riskFactors: IdentifiedRiskFactor[];
  vulnerableGroups: VulnerableGroup[];
  recommendations: RiskMitigationRecommendation[];
  riskScore: number; // 0-100
  riskTrend: RiskTrend;
}

// Factor de riesgo identificado
export interface IdentifiedRiskFactor {
  factor: string;
  category: RiskFactorCategory;
  severity: RiskSeverity;
  likelihood: RiskLikelihood;
  impact: RiskImpact;
  affectedAnimals: number;
  mitigationActions: string[];
}

// Grupo vulnerable
export interface VulnerableGroup {
  description: string;
  animalCount: number;
  riskFactors: string[];
  recommendedActions: string[];
  monitoringFrequency: string;
}

// Recomendación de mitigación de riesgo
export interface RiskMitigationRecommendation {
  priority: RecommendationPriority;
  action: string;
  timeline: string;
  estimatedCost: number;
  expectedBenefit: string;
  implementation: string[];
}

// Tendencia de riesgo
export interface RiskTrend {
  direction: TrendDirection;
  magnitude: number; // cambio porcentual
  timeframe: string;
  confidence: ConfidenceLevel;
  factors: string[];
}

// Recomendación de salud
export interface HealthRecommendation {
  id: string;
  type: HealthRecommendationType;
  priority: RecommendationPriority;
  title: string;
  description: string;
  rationale: string;
  implementation: ImplementationPlan;
  timeline: string;
  estimatedCost: number;
  expectedOutcome: string;
  success: MeasurementCriteria[];
  status: RecommendationStatus;
}

// Plan de implementación
export interface ImplementationPlan {
  steps: ImplementationStep[];
  resources: RequiredResource[];
  responsibilities: ResponsibilityAssignment[];
  milestones: Milestone[];
}

// Paso de implementación
export interface ImplementationStep {
  order: number;
  description: string;
  duration: string;
  dependencies: string[];
  deliverables: string[];
}

// Recurso requerido
export interface RequiredResource {
  type: ResourceType;
  description: string;
  quantity: number;
  unit: string;
  estimatedCost: number;
  availability: ResourceAvailability;
}

// Asignación de responsabilidad
export interface ResponsibilityAssignment {
  role: string;
  person?: string;
  responsibilities: string[];
  accountabilities: string[];
}

// Hito
export interface Milestone {
  name: string;
  targetDate: Date;
  description: string;
  successCriteria: string[];
  dependencies: string[];
}

// Criterio de medición
export interface MeasurementCriteria {
  metric: string;
  target: number;
  unit: string;
  timeframe: string;
  method: string;
}

// Filtro de reporte
export interface ReportFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  label?: string;
}

// Parámetros de reporte
export interface ReportParameters {
  includeCharts: boolean;
  includeDetailedData: boolean;
  includeRecommendations: boolean;
  includeGeolocation: boolean;
  groupBy: GroupByOption[];
  sortBy: SortOption;
  customFields: CustomField[];
  outputSettings: OutputSettings;
}

// Opción de agrupación
export interface GroupByOption {
  field: string;
  order: SortOrder;
}

// Opción de ordenamiento
export interface SortOption {
  field: string;
  direction: SortDirection;
}

// Campo personalizado
export interface CustomField {
  name: string;
  expression: string;
  type: FieldType;
  format?: string;
}

// Configuraciones de salida
export interface OutputSettings {
  pageSize: PageSize;
  orientation: PageOrientation;
  includeWatermark: boolean;
  includePageNumbers: boolean;
  includeTimestamp: boolean;
  customHeader?: string;
  customFooter?: string;
}

// Metadatos del reporte
export interface ReportMetadata {
  version: string;
  dataSource: string;
  processingTime: number; // milliseconds
  recordCount: number;
  accuracy: number; // porcentaje
  completeness: number; // porcentaje
  warnings: string[];
  errors: string[];
}

// Información de reporte programado
export interface ScheduledReportInfo {
  frequency: ScheduleFrequency;
  nextRun: Date;
  lastRun?: Date;
  isActive: boolean;
  recipients: ReportRecipient[];
  deliveryMethod: DeliveryMethod;
  retryPolicy: RetryPolicy;
}

// Destinatario del reporte
export interface ReportRecipient {
  name: string;
  email: string;
  role: string;
  notificationPreferences: NotificationPreferences;
}

// Preferencias de notificación
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  pushNotification: boolean;
  inApp: boolean;
}

// Política de reintento
export interface RetryPolicy {
  maxRetries: number;
  retryInterval: number; // minutes
  escalation: EscalationPolicy;
}

// Política de escalación
export interface EscalationPolicy {
  enabled: boolean;
  escalationLevel: EscalationLevel;
  escalationContacts: string[];
}

// Enums para tipos de reportes
export enum ReportType {
  HEALTH = "health",
  VACCINATION = "vaccination",
  BREEDING = "breeding",
  PRODUCTION = "production",
  FINANCIAL = "financial",
  INVENTORY = "inventory",
  COMPLIANCE = "compliance",
  PERFORMANCE = "performance",
  GEOSPATIAL = "geospatial",
  CUSTOM = "custom",
}

// Categorías de reportes
export enum ReportCategory {
  OPERATIONAL = "operational",
  ANALYTICAL = "analytical",
  REGULATORY = "regulatory",
  EXECUTIVE = "executive",
  TECHNICAL = "technical",
}

// Estado del reporte
export enum ReportStatus {
  GENERATING = "generating",
  COMPLETED = "completed",
  FAILED = "failed",
  SCHEDULED = "scheduled",
  CANCELLED = "cancelled",
}

// Formato del reporte
export enum ReportFormat {
  PDF = "pdf",
  EXCEL = "excel",
  CSV = "csv",
  JSON = "json",
  HTML = "html",
  WORD = "word",
}

// Período del reporte
export enum ReportPeriod {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
  CUSTOM = "custom",
}

// Estado de brote
export enum OutbreakStatus {
  ACTIVE = "active",
  CONTAINED = "contained",
  RESOLVED = "resolved",
  INVESTIGATING = "investigating",
}

// Nivel de riesgo estacional
export enum SeasonalRiskLevel {
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  CRITICAL = "critical",
}

// Nivel de riesgo geográfico
export enum GeographicRiskLevel {
  MINIMAL = "minimal",
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  EXTREME = "extreme",
}

// Prioridad de vacunación
export enum VaccinationPriority {
  ROUTINE = "routine",
  IMPORTANT = "important",
  URGENT = "urgent",
  CRITICAL = "critical",
}

// Nivel de riesgo por vencimiento
export enum OverdueRiskLevel {
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  CRITICAL = "critical",
}

// Nivel de riesgo general
export enum OverallRiskLevel {
  VERY_LOW = "very_low",
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  VERY_HIGH = "very_high",
  CRITICAL = "critical",
}

// Categoría de factor de riesgo
export enum RiskFactorCategory {
  ENVIRONMENTAL = "environmental",
  BIOLOGICAL = "biological",
  MANAGEMENT = "management",
  NUTRITIONAL = "nutritional",
  GENETIC = "genetic",
  BEHAVIORAL = "behavioral",
}

// Severidad de riesgo
export enum RiskSeverity {
  MINIMAL = "minimal",
  MINOR = "minor",
  MODERATE = "moderate",
  MAJOR = "major",
  CATASTROPHIC = "catastrophic",
}

// Probabilidad de riesgo
export enum RiskLikelihood {
  VERY_UNLIKELY = "very_unlikely",
  UNLIKELY = "unlikely",
  POSSIBLE = "possible",
  LIKELY = "likely",
  VERY_LIKELY = "very_likely",
  CERTAIN = "certain",
}

// Impacto de riesgo
export enum RiskImpact {
  NEGLIGIBLE = "negligible",
  MINOR = "minor",
  MODERATE = "moderate",
  MAJOR = "major",
  SEVERE = "severe",
}

// Dirección de tendencia
export enum TrendDirection {
  DECREASING = "decreasing",
  STABLE = "stable",
  INCREASING = "increasing",
}

// Nivel de confianza
export enum ConfidenceLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

// Tipo de recomendación de salud
export enum HealthRecommendationType {
  PREVENTION = "prevention",
  TREATMENT = "treatment",
  MANAGEMENT = "management",
  MONITORING = "monitoring",
  EMERGENCY = "emergency",
}

// Prioridad de recomendación
export enum RecommendationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
  CRITICAL = "critical",
}

// Estado de recomendación
export enum RecommendationStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  DEFERRED = "deferred",
}

// Tipo de recurso
export enum ResourceType {
  HUMAN = "human",
  EQUIPMENT = "equipment",
  MEDICATION = "medication",
  FACILITY = "facility",
  FINANCIAL = "financial",
  INFORMATION = "information",
}

// Disponibilidad de recurso
export enum ResourceAvailability {
  AVAILABLE = "available",
  LIMITED = "limited",
  UNAVAILABLE = "unavailable",
  REQUIRES_PROCUREMENT = "requires_procurement",
}

// Operador de filtro
export enum FilterOperator {
  EQUALS = "equals",
  NOT_EQUALS = "not_equals",
  GREATER_THAN = "greater_than",
  LESS_THAN = "less_than",
  GREATER_EQUAL = "greater_equal",
  LESS_EQUAL = "less_equal",
  CONTAINS = "contains",
  NOT_CONTAINS = "not_contains",
  STARTS_WITH = "starts_with",
  ENDS_WITH = "ends_with",
  IN = "in",
  NOT_IN = "not_in",
  BETWEEN = "between",
  IS_NULL = "is_null",
  IS_NOT_NULL = "is_not_null",
}

// Dirección de ordenamiento
export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

// Orden de clasificación
export enum SortOrder {
  ASCENDING = "ascending",
  DESCENDING = "descending",
}

// Tipo de campo
export enum FieldType {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  BOOLEAN = "boolean",
  CURRENCY = "currency",
  PERCENTAGE = "percentage",
}

// Tamaño de página
export enum PageSize {
  A4 = "a4",
  LETTER = "letter",
  LEGAL = "legal",
  A3 = "a3",
}

// Orientación de página
export enum PageOrientation {
  PORTRAIT = "portrait",
  LANDSCAPE = "landscape",
}

// Frecuencia de programación
export enum ScheduleFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
}

// Método de entrega
export enum DeliveryMethod {
  EMAIL = "email",
  FTP = "ftp",
  API = "api",
  DOWNLOAD = "download",
  PRINT = "print",
}

// Nivel de escalación
export enum EscalationLevel {
  SUPERVISOR = "supervisor",
  MANAGER = "manager",
  DIRECTOR = "director",
  EXECUTIVE = "executive",
}

// Nivel de riesgo espacial
export enum SpatialRiskLevel {
  VERY_LOW = "very_low",
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

// Etiquetas en español para tipos de reportes
export const REPORT_TYPE_LABELS = {
  [ReportType.HEALTH]: "Salud",
  [ReportType.VACCINATION]: "Vacunación",
  [ReportType.BREEDING]: "Reproducción",
  [ReportType.PRODUCTION]: "Producción",
  [ReportType.FINANCIAL]: "Financiero",
  [ReportType.INVENTORY]: "Inventario",
  [ReportType.COMPLIANCE]: "Cumplimiento",
  [ReportType.PERFORMANCE]: "Rendimiento",
  [ReportType.GEOSPATIAL]: "Geoespacial",
  [ReportType.CUSTOM]: "Personalizado",
} as const;

// Etiquetas para categorías de reportes
export const REPORT_CATEGORY_LABELS = {
  [ReportCategory.OPERATIONAL]: "Operacional",
  [ReportCategory.ANALYTICAL]: "Analítico",
  [ReportCategory.REGULATORY]: "Regulatorio",
  [ReportCategory.EXECUTIVE]: "Ejecutivo",
  [ReportCategory.TECHNICAL]: "Técnico",
} as const;

// Etiquetas para formatos de reportes
export const REPORT_FORMAT_LABELS = {
  [ReportFormat.PDF]: "PDF",
  [ReportFormat.EXCEL]: "Excel",
  [ReportFormat.CSV]: "CSV",
  [ReportFormat.JSON]: "JSON",
  [ReportFormat.HTML]: "HTML",
  [ReportFormat.WORD]: "Word",
} as const;

// Colores para tipos de reportes (para UI)
export const REPORT_TYPE_COLORS = {
  [ReportType.HEALTH]: {
    background: "#fecaca",
    border: "#dc2626",
    text: "#b91c1c",
  },
  [ReportType.VACCINATION]: {
    background: "#dcfce7",
    border: "#22c55e",
    text: "#15803d",
  },
  [ReportType.BREEDING]: {
    background: "#fdf4ff",
    border: "#d946ef",
    text: "#c026d3",
  },
  [ReportType.PRODUCTION]: {
    background: "#dbeafe",
    border: "#3b82f6",
    text: "#2563eb",
  },
  [ReportType.FINANCIAL]: {
    background: "#fef3c7",
    border: "#f59e0b",
    text: "#d97706",
  },
  [ReportType.INVENTORY]: {
    background: "#e0f2fe",
    border: "#0891b2",
    text: "#0e7490",
  },
  [ReportType.COMPLIANCE]: {
    background: "#ecfdf5",
    border: "#10b981",
    text: "#059669",
  },
  [ReportType.PERFORMANCE]: {
    background: "#f3f4f6",
    border: "#6b7280",
    text: "#374151",
  },
  [ReportType.GEOSPATIAL]: {
    background: "#f0fdf4",
    border: "#84cc16",
    text: "#65a30d",
  },
  [ReportType.CUSTOM]: {
    background: "#fdf2f8",
    border: "#ec4899",
    text: "#be185d",
  },
} as const;

// Iconos para tipos de reportes (usando nombres de iconos de Lucide)
export const REPORT_TYPE_ICONS = {
  [ReportType.HEALTH]: "heart-pulse",
  [ReportType.VACCINATION]: "syringe",
  [ReportType.BREEDING]: "heart",
  [ReportType.PRODUCTION]: "trending-up",
  [ReportType.FINANCIAL]: "dollar-sign",
  [ReportType.INVENTORY]: "package",
  [ReportType.COMPLIANCE]: "shield-check",
  [ReportType.PERFORMANCE]: "bar-chart",
  [ReportType.GEOSPATIAL]: "map-pin",
  [ReportType.CUSTOM]: "settings",
} as const;

// Funciones helper para reportes
export const reportHelpers = {
  // Calcular porcentaje de cumplimiento
  calculateComplianceRate: (completed: number, total: number): number => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  },

  // Determinar nivel de riesgo basado en puntaje
  determineRiskLevel: (score: number): OverallRiskLevel => {
    if (score < 20) return OverallRiskLevel.VERY_LOW;
    if (score < 40) return OverallRiskLevel.LOW;
    if (score < 60) return OverallRiskLevel.MODERATE;
    if (score < 80) return OverallRiskLevel.HIGH;
    if (score < 95) return OverallRiskLevel.VERY_HIGH;
    return OverallRiskLevel.CRITICAL;
  },

  // Formatear fecha para reportes
  formatReportDate: (date: Date): string => {
    return date.toLocaleDateString("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  },

  // Generar nombre de archivo para reporte
  generateReportFilename: (
    type: ReportType,
    format: ReportFormat,
    date: Date
  ): string => {
    const timestamp = date.toISOString().split("T")[0];
    const typeName = REPORT_TYPE_LABELS[type].toLowerCase().replace(" ", "_");
    return `reporte_${typeName}_${timestamp}.${format}`;
  },

  // Calcular periodo de comparación
  calculateComparisonPeriod: (
    currentStart: Date,
    currentEnd: Date
  ): DateRange => {
    const duration = currentEnd.getTime() - currentStart.getTime();
    const previousStart = new Date(currentStart.getTime() - duration);
    const previousEnd = new Date(currentStart.getTime() - 1);

    return {
      startDate: previousStart,
      endDate: previousEnd,
      period: ReportPeriod.CUSTOM,
    };
  },
} as const;
