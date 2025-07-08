// Tipos relacionados con la producción ganadera

import { BaseEntity } from "./common";

// Registro general de producción
export interface ProductionRecord extends BaseEntity {
  animalId: string;
  animalEarTag: string;
  type: ProductionType;
  date: Date;
  period: ProductionPeriod;
  metrics: ProductionMetrics;
  quality: ProductionQuality;
  conditions: ProductionConditions;
  costs: ProductionCost[];
  notes?: string;
  recordedBy: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

// Métricas de producción
export interface ProductionMetrics {
  quantity: number;
  unit: ProductionUnit;
  rate?: number; // cantidad por día
  efficiency?: number; // porcentaje
  yield?: number; // rendimiento
  wastage?: number; // desperdicio
  netProduction: number;
}

// Calidad de producción
export interface ProductionQuality {
  grade: QualityGrade;
  score: number; // 1-100
  parameters: QualityParameter[];
  certifications?: string[];
  defects?: QualityDefect[];
  testResults?: QualityTestResult[];
}

// Parámetro de calidad
export interface QualityParameter {
  name: string;
  value: number;
  unit: string;
  standardRange: NumberRange;
  status: QualityStatus;
  importance: ParameterImportance;
}

// Rango numérico
export interface NumberRange {
  min: number;
  max: number;
  optimal?: number;
}

// Defecto de calidad
export interface QualityDefect {
  type: string;
  severity: DefectSeverity;
  description: string;
  cause?: string;
  impact: QualityImpact;
  correctiveAction?: string;
}

// Resultado de prueba de calidad
export interface QualityTestResult {
  testName: string;
  value: any;
  unit?: string;
  method: string;
  laboratory?: string;
  testDate: Date;
  isCompliant: boolean;
  standardReference?: string;
}

// Condiciones de producción
export interface ProductionConditions {
  weather: WeatherConditions;
  feeding: FeedingConditions;
  housing: HousingConditions;
  health: HealthConditions;
  management: ManagementConditions;
}

// Condiciones climáticas
export interface WeatherConditions {
  temperature: number; // °C
  humidity: number; // %
  precipitation: number; // mm
  windSpeed: number; // km/h
  pressure: number; // hPa
  heatIndex?: number;
  temperatureHumidityIndex?: number;
}

// Condiciones de alimentación
export interface FeedingConditions {
  dietType: string;
  feedQuality: FeedQuality;
  waterAvailability: WaterAvailability;
  supplementation: SupplementationRecord[];
  feedingFrequency: number; // veces por día
  lastFeedingTime?: Date;
}

// Calidad del alimento
export interface FeedQuality {
  dryMatter: number; // %
  protein: number; // %
  energy: number; // Mcal/kg
  fiber: number; // %
  minerals: MineralContent[];
  contaminants?: ContaminantLevel[];
  freshness: FreshnessLevel;
}

// Contenido mineral
export interface MineralContent {
  mineral: string;
  content: number;
  unit: string;
  adequacy: AdequacyLevel;
}

// Nivel de contaminante
export interface ContaminantLevel {
  contaminant: string;
  level: number;
  unit: string;
  threshold: number;
  isExceeded: boolean;
}

// Disponibilidad de agua
export interface WaterAvailability {
  quality: WaterQuality;
  temperature: number; // °C
  flow: number; // L/min
  accessibility: AccessibilityLevel;
  lastTested: Date;
}

// Calidad del agua
export interface WaterQuality {
  ph: number;
  tds: number; // ppm
  nitrates: number; // ppm
  bacteria: number; // CFU/ml
  isCompliant: boolean;
}

// Registro de suplementación
export interface SupplementationRecord {
  supplement: string;
  amount: number;
  unit: string;
  purpose: string;
  lastGiven: Date;
  frequency: string;
}

// Condiciones de alojamiento
export interface HousingConditions {
  type: HousingType;
  spacePerAnimal: number; // m²
  ventilation: VentilationLevel;
  cleanliness: CleanlinessLevel;
  comfort: ComfortLevel;
  density: number; // animales/hectárea
  shelter: ShelterAvailability;
}

// Condiciones de salud
export interface HealthConditions {
  overallStatus: OverallHealthStatus;
  diseasePresence: boolean;
  stressLevel: StressLevel;
  bodyCondition: number; // 1-9
  lameness: LamenessScore;
  lastHealthCheck: Date;
}

// Condiciones de manejo
export interface ManagementConditions {
  handlingStress: StressLevel;
  routineChanges: boolean;
  groupChanges: boolean;
  transportationStress: boolean;
  lastHandling: Date;
  handlerExperience: ExperienceLevel;
}

// Costo de producción
export interface ProductionCost {
  category: CostCategory;
  description: string;
  amount: number;
  currency: string;
  unit?: string; // por kg, por litro, por animal, etc.
  isFixed: boolean;
  allocation: CostAllocation;
}

// Asignación de costo
export interface CostAllocation {
  method: AllocationMethod;
  percentage?: number;
  basis?: string; // tiempo, peso, volumen, etc.
}

// Producción lechera específica
export interface MilkProduction extends BaseEntity {
  animalId: string;
  animalEarTag: string;
  milkingTime: MilkingTime;
  date: Date;
  session: MilkingSession;
  volume: number; // litros
  duration: number; // minutos
  flowRate: number; // L/min
  composition: MilkComposition;
  quality: MilkQualityMetrics;
  equipment: MilkingEquipment;
  operator: string;
  abnormalities?: MilkAbnormality[];
  treatmentFlag: boolean;
  withholdingPeriod?: number; // días
}

// Composición de la leche
export interface MilkComposition {
  fat: number; // %
  protein: number; // %
  lactose: number; // %
  solidsNotFat: number; // %
  totalSolids: number; // %
  minerals: number; // %
  waterContent: number; // %
}

// Métricas de calidad de leche
export interface MilkQualityMetrics {
  somaticCellCount: number; // cells/ml
  bacterialCount: number; // CFU/ml
  ph: number;
  temperature: number; // °C
  conductivity: number; // mS/cm
  urea: number; // mg/dl
  acetone?: number; // mg/dl para detectar cetosis
  grade: MilkGrade;
  penalties?: QualityPenalty[];
}

// Penalización por calidad
export interface QualityPenalty {
  reason: string;
  type: PenaltyType;
  amount: number; // porcentaje o cantidad
  description: string;
}

// Equipo de ordeño
export interface MilkingEquipment {
  systemType: MilkingSystemType;
  equipmentId: string;
  vacuum: number; // kPa
  pulsationRate: number; // pulsos/min
  pulsationRatio: string; // ej. "60:40"
  lastMaintenance: Date;
  isCalibrated: boolean;
  issues?: EquipmentIssue[];
}

// Problema de equipo
export interface EquipmentIssue {
  type: string;
  severity: IssueSeverity;
  description: string;
  impact: ProductionImpact;
  reportedAt: Date;
  resolved: boolean;
  resolution?: string;
}

// Anormalidad en leche
export interface MilkAbnormality {
  type: AbnormalityType;
  severity: AbnormalitySeverity;
  description: string;
  quarter?: UdderQuarter; // cuarto de ubre afectado
  action: CorrectiveAction;
  followUp: boolean;
}

// Producción de carne
export interface MeatProduction extends BaseEntity {
  animalId: string;
  animalEarTag: string;
  measurementDate: Date;
  liveWeight: number; // kg
  projectedWeight: number; // kg
  weightGain: WeightGainMetrics;
  bodyMeasurements: BodyMeasurements;
  meatQuality: MeatQualityIndicators;
  feedEfficiency: FeedEfficiencyMetrics;
  slaughterProjection?: SlaughterProjection;
  economicMetrics: MeatEconomicMetrics;
}

// Métricas de ganancia de peso
export interface WeightGainMetrics {
  dailyGain: number; // kg/día
  weeklyGain: number; // kg/semana
  monthlyGain: number; // kg/mes
  averageDailyGain: number; // kg/día promedio
  gainEfficiency: number; // %
  targetGain: number; // kg/día objetivo
  variance: number; // diferencia con objetivo
}

// Medidas corporales
export interface BodyMeasurements {
  height: number; // cm
  length: number; // cm
  chestGirth: number; // cm
  hipHeight: number; // cm
  bodyConditionScore: number; // 1-9
  frameScore: number; // 1-9
  muscling: MusclingScore;
}

// Puntuación de musculatura
export interface MusclingScore {
  overall: number; // 1-5
  forearm: number;
  loin: number;
  rump: number;
  thigh: number;
}

// Indicadores de calidad de carne
export interface MeatQualityIndicators {
  marbling: MarblingScore;
  backfatThickness: number; // mm
  ribeyeArea: number; // cm²
  yieldGrade?: YieldGrade;
  qualityGrade?: MeatQualityGrade;
  ultrasoundData?: UltrasoundMeasurements;
}

// Mediciones por ultrasonido
export interface UltrasoundMeasurements {
  backfat: number; // mm
  ribeye: number; // cm²
  intramuscularFat: number; // %
  date: Date;
  technician: string;
  accuracy: MeasurementAccuracy;
}

// Eficiencia alimenticia
export interface FeedEfficiencyMetrics {
  feedConversionRatio: number; // kg alimento / kg ganancia
  residualFeedIntake: number; // kg/día
  feedCostPerGain: number; // $/kg ganancia
  dryMatterIntake: number; // kg/día
  metabolicEfficiency: number; // %
}

// Proyección de sacrificio
export interface SlaughterProjection {
  targetWeight: number; // kg
  projectedDate: Date;
  daysToTarget: number;
  carcassWeight: number; // kg
  dressingPercentage: number; // %
  retailCuts: RetailCutProjection[];
  marketPrice: number;
  projectedValue: number;
}

// Proyección de cortes
export interface RetailCutProjection {
  cut: string;
  weight: number; // kg
  percentage: number; // %
  pricePerKg: number;
  value: number;
  grade: CutGrade;
}

// Métricas económicas de carne
export interface MeatEconomicMetrics {
  costOfGain: number; // $/kg ganancia
  breakEvenPrice: number; // $/kg
  profitMargin: number; // %
  returnOnFeed: number; // $/animal
  marketPremium: number; // $/kg
  totalCostToDate: number;
  projectedProfit: number;
}

// Registro de alimentación
export interface FeedRecord extends BaseEntity {
  animalId?: string; // Si es individual
  groupId?: string; // Si es grupal
  date: Date;
  feedType: string;
  batch: string;
  amountOffered: number; // kg
  amountConsumed: number; // kg
  refusals: number; // kg
  consumptionRate: number; // %
  feedQuality: FeedAnalysis;
  cost: FeedCost;
  weather: WeatherImpact;
  notes?: string;
}

// Análisis de alimento
export interface FeedAnalysis {
  dryMatter: number; // %
  crudeProtein: number; // %
  metabolizableEnergy: number; // Mcal/kg
  netEnergy: number; // Mcal/kg
  crudefiber: number; // %
  ndf: number; // % (Neutral Detergent Fiber)
  adf: number; // % (Acid Detergent Fiber)
  ash: number; // %
  ether: number; // %
  moisture: number; // %
  ph?: number;
  analysisDate: Date;
  laboratory?: string;
}

// Costo de alimentación
export interface FeedCost {
  pricePerKg: number;
  totalCost: number;
  costPerAnimal: number;
  costPerKgGain?: number;
  currency: string;
  includesDelivery: boolean;
  supplier: string;
}

// Impacto climático
export interface WeatherImpact {
  temperature: number; // °C
  humidity: number; // %
  heatStress: boolean;
  coldStress: boolean;
  impact: WeatherImpactLevel;
  adjustmentFactor: number; // multiplicador de consumo
}

// Métricas de crecimiento
export interface GrowthMetrics extends BaseEntity {
  animalId: string;
  animalEarTag: string;
  date: Date;
  ageInDays: number;
  measurements: GrowthMeasurements;
  performance: PerformanceMetrics;
  comparison: GrowthComparison;
  projections: GrowthProjections;
  factors: GrowthFactors;
}

// Medidas de crecimiento
export interface GrowthMeasurements {
  weight: number; // kg
  height: number; // cm
  length: number; // cm
  heartGirth: number; // cm
  bodyCondition: number; // 1-9
  frameSize: FrameSize;
  developmentStage: DevelopmentStage;
}

// Métricas de rendimiento
export interface PerformanceMetrics {
  averageDailyGain: number; // kg/día
  gainSinceBirth: number; // kg
  gainSinceWeaning?: number; // kg
  growthRate: number; // %
  efficiency: GrowthEfficiency;
  milestones: GrowthMilestone[];
}

// Eficiencia de crecimiento
export interface GrowthEfficiency {
  feedEfficiency: number; // kg ganancia / kg alimento
  geneticPotential: number; // % de potencial alcanzado
  environmentalEffect: number; // % de impacto ambiental
  managementEffect: number; // % de impacto de manejo
}

// Hito de crecimiento
export interface GrowthMilestone {
  milestone: string;
  targetAge: number; // días
  targetWeight: number; // kg
  actualAge?: number; // días
  actualWeight?: number; // kg
  achieved: boolean;
  variance: number; // días de diferencia
}

// Comparación de crecimiento
export interface GrowthComparison {
  breedAverage: ComparisonMetric;
  farmAverage: ComparisonMetric;
  sireProgeny: ComparisonMetric;
  damProgeny: ComparisonMetric;
  contemporaryGroup: ComparisonMetric;
}

// Métrica de comparación
export interface ComparisonMetric {
  value: number;
  percentile: number;
  standardDeviations: number;
  rank?: number;
  totalAnimals?: number;
}

// Proyecciones de crecimiento
export interface GrowthProjections {
  weaningWeight: WeightProjection;
  yearlingWeight: WeightProjection;
  matureWeight: WeightProjection;
  breedingAge: AgeProjection;
  slaughterReadiness: SlaughterReadinessProjection;
}

// Proyección de peso
export interface WeightProjection {
  projected: number; // kg
  confidence: number; // %
  targetDate: Date;
  factors: GrowthProjectionFactor[];
}

// Factor de proyección de crecimiento
export interface GrowthProjectionFactor {
  factor: string;
  weight: number; // importancia del factor 0-1
  impact: FactorImpact;
  confidence: number; // %
  description: string;
}

// Proyección de edad
export interface AgeProjection {
  projectedAge: number; // días
  projectedDate: Date;
  confidence: number; // %
  requirements: string[];
}

// Proyección de sacrificio
export interface SlaughterReadinessProjection {
  targetWeight: number; // kg
  projectedDate: Date;
  marketConditions: MarketCondition[];
  optimalWindow: DateRange;
}

// Condición de mercado
export interface MarketCondition {
  factor: string;
  currentValue: number;
  projectedValue: number;
  impact: MarketImpact;
  confidence: number; // %
}

// Rango de fechas
export interface DateRange {
  start: Date;
  end: Date;
  optimal: Date;
}

// Factores de crecimiento
export interface GrowthFactors {
  genetic: GeneticFactor[];
  environmental: EnvironmentalFactor[];
  management: ManagementFactor[];
  health: HealthFactor[];
  nutritional: NutritionalFactor[];
}

// Factor genético
export interface GeneticFactor {
  trait: string;
  value: number;
  impact: FactorImpact;
  heritability: number; // %
  confidence: number; // %
}

// Factor ambiental
export interface EnvironmentalFactor {
  factor: string;
  measurement: number;
  unit: string;
  impact: FactorImpact;
  isControllable: boolean;
}

// Factor de manejo
export interface ManagementFactor {
  practice: string;
  quality: QualityLevel;
  frequency: string;
  impact: FactorImpact;
  lastImplemented: Date;
}

// Factor de salud
export interface HealthFactor {
  aspect: string;
  status: HealthFactorStatus;
  impact: FactorImpact;
  trend: TrendDirection;
  lastAssessed: Date;
}

// Factor nutricional
export interface NutritionalFactor {
  nutrient: string;
  adequacy: AdequacyLevel;
  impact: FactorImpact;
  recommendation?: string;
}

// Enums
export enum ProductionType {
  MILK = "milk",
  MEAT = "meat",
  BREEDING = "breeding",
  DRAFT = "draft",
  MULTIPLE = "multiple",
}

export enum ProductionPeriod {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  SEASONAL = "seasonal",
  ANNUAL = "annual",
  LACTATION = "lactation",
  GROWING = "growing",
}

export enum ProductionUnit {
  LITERS = "liters",
  KILOGRAMS = "kilograms",
  POUNDS = "pounds",
  GALLONS = "gallons",
  UNITS = "units",
}

export enum QualityGrade {
  PREMIUM = "premium",
  GRADE_A = "grade_a",
  GRADE_B = "grade_b",
  GRADE_C = "grade_c",
  SUBSTANDARD = "substandard",
  REJECTED = "rejected",
}

export enum QualityStatus {
  EXCELLENT = "excellent",
  ACCEPTABLE = "acceptable",
  MARGINAL = "marginal",
  UNACCEPTABLE = "unacceptable",
}

export enum ParameterImportance {
  CRITICAL = "critical",
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum DefectSeverity {
  MINOR = "minor",
  MODERATE = "moderate",
  MAJOR = "major",
  CRITICAL = "critical",
}

export enum QualityImpact {
  NONE = "none",
  MINIMAL = "minimal",
  MODERATE = "moderate",
  SIGNIFICANT = "significant",
  SEVERE = "severe",
}

export enum FreshnessLevel {
  FRESH = "fresh",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  SPOILED = "spoiled",
}

export enum AdequacyLevel {
  DEFICIENT = "deficient",
  MARGINAL = "marginal",
  ADEQUATE = "adequate",
  OPTIMAL = "optimal",
  EXCESSIVE = "excessive",
}

export enum AccessibilityLevel {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  INADEQUATE = "inadequate",
}

export enum HousingType {
  PASTURE = "pasture",
  FEEDLOT = "feedlot",
  BARN = "barn",
  FREE_STALL = "free_stall",
  TIE_STALL = "tie_stall",
  COMPOST_BARN = "compost_barn",
}

export enum VentilationLevel {
  EXCELLENT = "excellent",
  GOOD = "good",
  ADEQUATE = "adequate",
  POOR = "poor",
  INADEQUATE = "inadequate",
}

export enum CleanlinessLevel {
  VERY_CLEAN = "very_clean",
  CLEAN = "clean",
  MODERATELY_CLEAN = "moderately_clean",
  DIRTY = "dirty",
  VERY_DIRTY = "very_dirty",
}

export enum ComfortLevel {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  UNACCEPTABLE = "unacceptable",
}

export enum ShelterAvailability {
  ABUNDANT = "abundant",
  ADEQUATE = "adequate",
  LIMITED = "limited",
  INSUFFICIENT = "insufficient",
  NONE = "none",
}

export enum OverallHealthStatus {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  CRITICAL = "critical",
}

export enum StressLevel {
  NONE = "none",
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  SEVERE = "severe",
}

export enum LamenessScore {
  SOUND = 0,
  SLIGHTLY_LAME = 1,
  MODERATELY_LAME = 2,
  LAME = 3,
  SEVERELY_LAME = 4,
  NON_WEIGHT_BEARING = 5,
}

export enum ExperienceLevel {
  NOVICE = "novice",
  BASIC = "basic",
  INTERMEDIATE = "intermediate",
  ADVANCED = "advanced",
  EXPERT = "expert",
}

export enum CostCategory {
  FEED = "feed",
  LABOR = "labor",
  VETERINARY = "veterinary",
  EQUIPMENT = "equipment",
  UTILITIES = "utilities",
  MAINTENANCE = "maintenance",
  OTHER = "other",
}

export enum AllocationMethod {
  DIRECT = "direct",
  PER_ANIMAL = "per_animal",
  BY_WEIGHT = "by_weight",
  BY_PRODUCTION = "by_production",
  TIME_BASED = "time_based",
}

export enum MilkingTime {
  MORNING = "morning",
  AFTERNOON = "afternoon",
  EVENING = "evening",
  NIGHT = "night",
}

export enum MilkingSession {
  FIRST = "first",
  SECOND = "second",
  THIRD = "third",
  FOURTH = "fourth",
}

export enum MilkGrade {
  GRADE_A = "grade_a",
  GRADE_B = "grade_b",
  MANUFACTURING = "manufacturing",
  REJECTED = "rejected",
}

export enum PenaltyType {
  PRICE_REDUCTION = "price_reduction",
  VOLUME_DEDUCTION = "volume_deduction",
  REJECTION = "rejection",
  WARNING = "warning",
}

export enum MilkingSystemType {
  BUCKET = "bucket",
  PIPELINE = "pipeline",
  PARLOR = "parlor",
  ROBOT = "robot",
  MOBILE = "mobile",
}

export enum IssueSeverity {
  MINOR = "minor",
  MODERATE = "moderate",
  MAJOR = "major",
  CRITICAL = "critical",
}

export enum ProductionImpact {
  NONE = "none",
  MINIMAL = "minimal",
  MODERATE = "moderate",
  SIGNIFICANT = "significant",
  SEVERE = "severe",
}

export enum AbnormalityType {
  MASTITIS = "mastitis",
  BLOOD = "blood",
  CLOTS = "clots",
  WATERY = "watery",
  DISCOLORED = "discolored",
  OFF_FLAVOR = "off_flavor",
  FOREIGN_MATTER = "foreign_matter",
}

export enum AbnormalitySeverity {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
}

export enum UdderQuarter {
  LEFT_FRONT = "left_front",
  RIGHT_FRONT = "right_front",
  LEFT_REAR = "left_rear",
  RIGHT_REAR = "right_rear",
}

export enum CorrectiveAction {
  NONE = "none",
  MONITOR = "monitor",
  WITHHOLD = "withhold",
  TREAT = "treat",
  CULL = "cull",
}

export enum MarblingScore {
  DEVOID = "devoid",
  PRACTICALLY_DEVOID = "practically_devoid",
  TRACES = "traces",
  SLIGHT = "slight",
  SMALL = "small",
  MODEST = "modest",
  MODERATE = "moderate",
  SLIGHTLY_ABUNDANT = "slightly_abundant",
  MODERATELY_ABUNDANT = "moderately_abundant",
  ABUNDANT = "abundant",
}

export enum YieldGrade {
  GRADE_1 = 1,
  GRADE_2 = 2,
  GRADE_3 = 3,
  GRADE_4 = 4,
  GRADE_5 = 5,
}

export enum MeatQualityGrade {
  PRIME = "prime",
  CHOICE = "choice",
  SELECT = "select",
  STANDARD = "standard",
  COMMERCIAL = "commercial",
  UTILITY = "utility",
}

export enum MeasurementAccuracy {
  HIGH = "high",
  MEDIUM = "medium",
  LOW = "low",
}

export enum CutGrade {
  PREMIUM = "premium",
  CHOICE = "choice",
  SELECT = "select",
  STANDARD = "standard",
}

export enum WeatherImpactLevel {
  NONE = "none",
  MINIMAL = "minimal",
  MODERATE = "moderate",
  SIGNIFICANT = "significant",
  SEVERE = "severe",
}

export enum FrameSize {
  SMALL = "small",
  MEDIUM = "medium",
  LARGE = "large",
  EXTRA_LARGE = "extra_large",
}

export enum DevelopmentStage {
  CALF = "calf",
  WEANING = "weaning",
  GROWING = "growing",
  FINISHING = "finishing",
  MATURE = "mature",
}

export enum MarketImpact {
  VERY_NEGATIVE = "very_negative",
  NEGATIVE = "negative",
  NEUTRAL = "neutral",
  POSITIVE = "positive",
  VERY_POSITIVE = "very_positive",
}

export enum FactorImpact {
  VERY_NEGATIVE = "very_negative",
  NEGATIVE = "negative",
  NEUTRAL = "neutral",
  POSITIVE = "positive",
  VERY_POSITIVE = "very_positive",
}

export enum QualityLevel {
  POOR = "poor",
  FAIR = "fair",
  GOOD = "good",
  EXCELLENT = "excellent",
}

export enum HealthFactorStatus {
  POOR = "poor",
  FAIR = "fair",
  GOOD = "good",
  EXCELLENT = "excellent",
}

export enum TrendDirection {
  DECLINING = "declining",
  STABLE = "stable",
  IMPROVING = "improving",
}

// Etiquetas en español
export const PRODUCTION_TYPE_LABELS = {
  [ProductionType.MILK]: "Leche",
  [ProductionType.MEAT]: "Carne",
  [ProductionType.BREEDING]: "Reproducción",
  [ProductionType.DRAFT]: "Trabajo",
  [ProductionType.MULTIPLE]: "Múltiple",
} as const;

export const QUALITY_GRADE_LABELS = {
  [QualityGrade.PREMIUM]: "Premium",
  [QualityGrade.GRADE_A]: "Grado A",
  [QualityGrade.GRADE_B]: "Grado B",
  [QualityGrade.GRADE_C]: "Grado C",
  [QualityGrade.SUBSTANDARD]: "Bajo Estándar",
  [QualityGrade.REJECTED]: "Rechazado",
} as const;

export const MILKING_TIME_LABELS = {
  [MilkingTime.MORNING]: "Mañana",
  [MilkingTime.AFTERNOON]: "Tarde",
  [MilkingTime.EVENING]: "Noche",
  [MilkingTime.NIGHT]: "Madrugada",
} as const;

export const HOUSING_TYPE_LABELS = {
  [HousingType.PASTURE]: "Pastoreo",
  [HousingType.FEEDLOT]: "Corral de Engorda",
  [HousingType.BARN]: "Establo",
  [HousingType.FREE_STALL]: "Establo Libre",
  [HousingType.TIE_STALL]: "Establo Atado",
  [HousingType.COMPOST_BARN]: "Establo Compost",
} as const;
