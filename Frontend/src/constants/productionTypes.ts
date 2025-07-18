// Tipos y constantes para sistemas de producción ganadera

export interface BaseProductionRecord {
  id: string;
  animalId: string;
  animalEarTag: string;
  productionType: ProductionSystemType;
  date: Date;
  period: ProductionPeriod;
  recordedBy: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
  location?: ProductionLocation;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Ubicación de producción
export interface ProductionLocation {
  latitude: number;
  longitude: number;
  address?: string;
  facilityName?: string;
  paddockNumber?: string;
  barn?: string;
  milkingParlor?: string;
}

// Registro de producción lechera
export interface MilkProductionRecord extends BaseProductionRecord {
  productionType: ProductionSystemType.DAIRY;
  milkingSession: MilkingSession;
  milkingTime: MilkingTime;
  volume: number; // litros
  duration: number; // minutos
  flowRate: number; // L/min
  milkQuality: MilkQualityMetrics;
  milkComposition: MilkComposition;
  equipment: MilkingEquipmentInfo;
  abnormalities?: MilkAbnormality[];
  treatmentWithheld: boolean;
  withholdingPeriod?: number; // días
}

// Calidad de la leche
export interface MilkQualityMetrics {
  somaticCellCount: number; // cells/ml
  bacterialCount: number; // CFU/ml
  ph: number;
  temperature: number; // °C
  conductivity: number; // mS/cm
  fat: number; // %
  protein: number; // %
  lactose: number; // %
  solidsNotFat: number; // %
  totalSolids: number; // %
  grade: MilkGrade;
  penalties?: QualityPenalty[];
}

// Composición de la leche
export interface MilkComposition {
  fatPercentage: number;
  proteinPercentage: number;
  lactosePercentage: number;
  mineralsPercentage: number;
  waterContent: number;
  urea: number; // mg/dl
  acetone?: number; // mg/dl para detectar cetosis
}

// Información del equipo de ordeño
export interface MilkingEquipmentInfo {
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

// Anormalidad en la leche
export interface MilkAbnormality {
  type: MilkAbnormalityType;
  severity: AbnormalitySeverity;
  description: string;
  quarter?: UdderQuarter; // cuarto de ubre afectado
  action: CorrectiveAction;
  followUpRequired: boolean;
}

// Penalización por calidad
export interface QualityPenalty {
  reason: string;
  type: PenaltyType;
  amount: number; // porcentaje o cantidad
  description: string;
  impact: PenaltyImpact;
}

// Registro de producción cárnica
export interface MeatProductionRecord extends BaseProductionRecord {
  productionType: ProductionSystemType.BEEF;
  liveWeight: number; // kg
  projectedWeight: number; // kg
  weightGain: WeightGainMetrics;
  bodyMeasurements: BodyMeasurements;
  bodyConditionScore: number; // 1-9
  meatQuality: MeatQualityIndicators;
  feedEfficiency: FeedEfficiencyMetrics;
  slaughterProjection?: SlaughterProjection;
}

// Métricas de ganancia de peso
export interface WeightGainMetrics {
  dailyGain: number; // kg/día
  weeklyGain: number; // kg/semana
  averageGain: number; // kg/día promedio
  gainEfficiency: number; // kg ganancia/kg alimento
  comparedToTarget: number; // porcentaje vs objetivo
  trend: WeightGainTrend;
}

// Medidas corporales
export interface BodyMeasurements {
  height: number; // cm
  length: number; // cm
  chestGirth: number; // cm
  hipWidth: number; // cm
  cannonBone: number; // cm
  scrotalCircumference?: number; // cm para machos
}

// Indicadores de calidad cárnica
export interface MeatQualityIndicators {
  marbling: MarblingScore;
  muscularity: MuscularityScore;
  frameSize: FrameSize;
  conformation: ConformationScore;
  fatCover: FatCoverScore;
  estimatedYield: number; // %
  predictedGrade: MeatGrade;
}

// Métricas de eficiencia alimenticia
export interface FeedEfficiencyMetrics {
  feedConversionRatio: number; // kg alimento/kg ganancia
  residualFeedIntake: number; // kg/día
  dailyFeedIntake: number; // kg/día
  costPerKgGain: number; // costo por kg de ganancia
  efficiency: FeedEfficiencyRating;
}

// Proyección de sacrificio
export interface SlaughterProjection {
  projectedDate: Date;
  projectedWeight: number; // kg
  estimatedCarcassWeight: number; // kg
  estimatedDressingPercentage: number; // %
  readinessScore: SlaughterReadinessScore;
  marketValue: number;
  recommendedAction: string;
}

// Registro de producción reproductiva
export interface BreedingProductionRecord extends BaseProductionRecord {
  productionType: ProductionSystemType.BREEDING;
  serviceType: ServiceType;
  serviceDate: Date;
  bullId?: string; // ID del toro si es monta natural
  bullEarTag?: string;
  semenBatch?: string; // Para inseminación artificial
  aiTechnicianName?: string;
  estrusDetection: EstrusDetectionInfo;
  pregnancyCheck?: PregnancyCheckInfo;
  calvingInfo?: CalvingInfo;
  success: boolean;
  daysToConception?: number;
  costs: BreedingCosts;
}

// Información de detección de celo
export interface EstrusDetectionInfo {
  detectionMethod: EstrusDetectionMethod;
  signs: EstrusSign[];
  intensity: EstrusIntensity;
  duration: number; // horas
  detectedBy: string;
  confidence: ConfidenceLevel;
}

// Información de chequeo de preñez
export interface PregnancyCheckInfo {
  checkDate: Date;
  method: PregnancyCheckMethod;
  result: PregnancyResult;
  gestationDays?: number;
  expectedCalvingDate?: Date;
  veterinarianName: string;
  confidence: ConfidenceLevel;
  notes?: string;
}

// Información del parto
export interface CalvingInfo {
  calvingDate: Date;
  calvingEase: CalvingEase;
  assistanceRequired: boolean;
  assistanceType?: CalvingAssistanceType;
  calfInfo: CalfInfo;
  complications?: CalvingComplication[];
  veterinarianPresent: boolean;
  veterinarianName?: string;
  totalLaborTime: number; // horas
}

// Información del ternero
export interface CalfInfo {
  earTag?: string;
  gender: CalfGender;
  birthWeight: number; // kg
  vigor: CalfVigor;
  healthStatus: CalfHealthStatus;
  nursingSuccess: boolean;
  complications?: CalfComplication[];
  survival: boolean;
}

// Costos de reproducción
export interface BreedingCosts {
  serviceCharge: number;
  veterinaryFees: number;
  medicationCosts: number;
  laborCosts: number;
  equipmentCosts: number;
  totalCost: number;
  currency: string;
}

// Enums para tipos de sistemas de producción
export enum ProductionSystemType {
  DAIRY = "dairy",
  BEEF = "beef",
  BREEDING = "breeding",
  DUAL_PURPOSE = "dual_purpose",
  DRAFT = "draft",
}

// Períodos de producción
export enum ProductionPeriod {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  LACTATION = "lactation",
  BREEDING_SEASON = "breeding_season",
  GROWING_PERIOD = "growing_period",
  FINISHING_PERIOD = "finishing_period",
}

// Sesiones de ordeño
export enum MilkingSession {
  MORNING = "morning",
  AFTERNOON = "afternoon",
  EVENING = "evening",
  NIGHT = "night",
}

// Horarios de ordeño
export enum MilkingTime {
  DAWN = "dawn", // 4:00-6:00 AM
  MORNING = "morning", // 6:00-9:00 AM
  MIDDAY = "midday", // 12:00-2:00 PM
  AFTERNOON = "afternoon", // 2:00-5:00 PM
  EVENING = "evening", // 5:00-8:00 PM
  NIGHT = "night", // 8:00-11:00 PM
}

// Grados de calidad de leche
export enum MilkGrade {
  PREMIUM = "premium",
  GRADE_A = "grade_a",
  GRADE_B = "grade_b",
  MANUFACTURING = "manufacturing",
  REJECTED = "rejected",
}

// Sistemas de ordeño
export enum MilkingSystemType {
  MANUAL = "manual",
  BUCKET_MILKER = "bucket_milker",
  PIPELINE = "pipeline",
  HERRINGBONE = "herringbone",
  PARALLEL = "parallel",
  ROTARY = "rotary",
  ROBOTIC = "robotic",
}

// Tipos de anormalidades en leche
export enum MilkAbnormalityType {
  MASTITIS = "mastitis",
  BLOOD_TRACES = "blood_traces",
  CLOTS = "clots",
  WATERY_MILK = "watery_milk",
  OFF_COLOR = "off_color",
  OFF_FLAVOR = "off_flavor",
  HIGH_TEMPERATURE = "high_temperature",
  LOW_YIELD = "low_yield",
}

// Severidad de anormalidades
export enum AbnormalitySeverity {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
  CRITICAL = "critical",
}

// Cuartos de la ubre
export enum UdderQuarter {
  FRONT_LEFT = "front_left",
  FRONT_RIGHT = "front_right",
  REAR_LEFT = "rear_left",
  REAR_RIGHT = "rear_right",
}

// Acciones correctivas
export enum CorrectiveAction {
  OBSERVE = "observe",
  SEPARATE_MILK = "separate_milk",
  WITHHOLD_MILK = "withhold_milk",
  MEDICAL_TREATMENT = "medical_treatment",
  VETERINARY_EXAMINATION = "veterinary_examination",
  EQUIPMENT_CHECK = "equipment_check",
  DISCARD_MILK = "discard_milk",
}

// Tipos de penalización
export enum PenaltyType {
  PRICE_REDUCTION = "price_reduction",
  VOLUME_DEDUCTION = "volume_deduction",
  REJECTION = "rejection",
  WARNING = "warning",
  QUALITY_BONUS = "quality_bonus",
}

// Impacto de penalización
export enum PenaltyImpact {
  NONE = "none",
  MINIMAL = "minimal",
  MODERATE = "moderate",
  SIGNIFICANT = "significant",
  SEVERE = "severe",
}

// Severidad de problemas de equipo
export enum IssueSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Impacto en producción
export enum ProductionImpact {
  NONE = "none",
  MINIMAL = "minimal",
  MODERATE = "moderate",
  SIGNIFICANT = "significant",
  SEVERE = "severe",
}

// Puntuación de marmoreo
export enum MarblingScore {
  DEVOID = "devoid",
  TRACES = "traces",
  SLIGHT = "slight",
  SMALL = "small",
  MODEST = "modest",
  MODERATE = "moderate",
  SLIGHTLY_ABUNDANT = "slightly_abundant",
  MODERATELY_ABUNDANT = "moderately_abundant",
  ABUNDANT = "abundant",
}

// Puntuación de musculatura
export enum MuscularityScore {
  POOR = "poor",
  BELOW_AVERAGE = "below_average",
  AVERAGE = "average",
  ABOVE_AVERAGE = "above_average",
  EXCELLENT = "excellent",
}

// Tamaño de estructura
export enum FrameSize {
  SMALL = "small",
  MEDIUM_SMALL = "medium_small",
  MEDIUM = "medium",
  MEDIUM_LARGE = "medium_large",
  LARGE = "large",
}

// Puntuación de conformación
export enum ConformationScore {
  POOR = "poor",
  FAIR = "fair",
  GOOD = "good",
  VERY_GOOD = "very_good",
  EXCELLENT = "excellent",
}

// Cobertura de grasa
export enum FatCoverScore {
  EMACIATED = "emaciated",
  THIN = "thin",
  MODERATE = "moderate",
  FAT = "fat",
  OBESE = "obese",
}

// Grado de carne
export enum MeatGrade {
  PRIME = "prime",
  CHOICE = "choice",
  SELECT = "select",
  STANDARD = "standard",
  COMMERCIAL = "commercial",
  UTILITY = "utility",
  CUTTER = "cutter",
  CANNER = "canner",
}

// Calificación de eficiencia alimenticia
export enum FeedEfficiencyRating {
  EXCELLENT = "excellent",
  GOOD = "good",
  AVERAGE = "average",
  POOR = "poor",
  VERY_POOR = "very_poor",
}

// Tendencia de ganancia de peso
export enum WeightGainTrend {
  INCREASING = "increasing",
  STABLE = "stable",
  DECREASING = "decreasing",
  FLUCTUATING = "fluctuating",
}

// Puntuación de preparación para sacrificio
export enum SlaughterReadinessScore {
  NOT_READY = "not_ready",
  APPROACHING = "approaching",
  READY = "ready",
  OPTIMAL = "optimal",
  OVERFINISHED = "overfinished",
}

// Tipo de servicio reproductivo
export enum ServiceType {
  NATURAL_BREEDING = "natural_breeding",
  ARTIFICIAL_INSEMINATION = "artificial_insemination",
  EMBRYO_TRANSFER = "embryo_transfer",
  IN_VITRO_FERTILIZATION = "in_vitro_fertilization",
}

// Método de detección de celo
export enum EstrusDetectionMethod {
  VISUAL_OBSERVATION = "visual_observation",
  HEAT_DETECTOR = "heat_detector",
  PEDOMETER = "pedometer",
  ACTIVITY_MONITOR = "activity_monitor",
  HORMONE_TEST = "hormone_test",
  CHIN_BALL_MARKER = "chin_ball_marker",
}

// Signos de celo
export enum EstrusSign {
  MOUNTING_BEHAVIOR = "mounting_behavior",
  STANDING_TO_BE_MOUNTED = "standing_to_be_mounted",
  RESTLESSNESS = "restlessness",
  DECREASED_FEED_INTAKE = "decreased_feed_intake",
  VULVAR_SWELLING = "vulvar_swelling",
  CLEAR_VAGINAL_DISCHARGE = "clear_vaginal_discharge",
  BELLOWING = "bellowing",
  CHIN_RESTING = "chin_resting",
}

// Intensidad del celo
export enum EstrusIntensity {
  WEAK = "weak",
  MODERATE = "moderate",
  STRONG = "strong",
  VERY_STRONG = "very_strong",
}

// Nivel de confianza
export enum ConfidenceLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  VERY_HIGH = "very_high",
}

// Método de chequeo de preñez
export enum PregnancyCheckMethod {
  RECTAL_PALPATION = "rectal_palpation",
  ULTRASOUND = "ultrasound",
  BLOOD_TEST = "blood_test",
  MILK_TEST = "milk_test",
  URINE_TEST = "urine_test",
}

// Resultado de preñez
export enum PregnancyResult {
  PREGNANT = "pregnant",
  NOT_PREGNANT = "not_pregnant",
  INCONCLUSIVE = "inconclusive",
  REPEAT_TEST_NEEDED = "repeat_test_needed",
}

// Facilidad del parto
export enum CalvingEase {
  UNASSISTED = "unassisted",
  EASY_PULL = "easy_pull",
  HARD_PULL = "hard_pull",
  CAESAREAN = "caesarean",
  ABNORMAL_PRESENTATION = "abnormal_presentation",
}

// Tipo de asistencia en el parto
export enum CalvingAssistanceType {
  MANUAL_PULL = "manual_pull",
  CALF_PULLER = "calf_puller",
  VETERINARY_ASSISTANCE = "veterinary_assistance",
  CAESAREAN_SECTION = "caesarean_section",
  EMBRYOTOMY = "embryotomy",
}

// Género del ternero
export enum CalfGender {
  MALE = "male",
  FEMALE = "female",
}

// Vigor del ternero
export enum CalfVigor {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  WEAK = "weak",
  VERY_WEAK = "very_weak",
}

// Estado de salud del ternero
export enum CalfHealthStatus {
  HEALTHY = "healthy",
  WEAK = "weak",
  SICK = "sick",
  DECEASED = "deceased",
}

// Complicaciones del parto
export enum CalvingComplication {
  DYSTOCIA = "dystocia",
  RETAINED_PLACENTA = "retained_placenta",
  PROLAPSED_UTERUS = "prolapsed_uterus",
  MILK_FEVER = "milk_fever",
  KETOSIS = "ketosis",
  MASTITIS = "mastitis",
  METRITIS = "metritis",
}

// Complicaciones del ternero
export enum CalfComplication {
  RESPIRATORY_DISTRESS = "respiratory_distress",
  HYPOTHERMIA = "hypothermia",
  FAILURE_TO_NURSE = "failure_to_nurse",
  NAVEL_INFECTION = "navel_infection",
  SCOURS = "scours",
  PNEUMONIA = "pneumonia",
}

// Etiquetas en español para sistemas de producción
export const PRODUCTION_SYSTEM_LABELS = {
  [ProductionSystemType.DAIRY]: "Lechero",
  [ProductionSystemType.BEEF]: "Cárnico",
  [ProductionSystemType.BREEDING]: "Reproductivo",
  [ProductionSystemType.DUAL_PURPOSE]: "Doble Propósito",
  [ProductionSystemType.DRAFT]: "Trabajo",
} as const;

// Etiquetas para períodos de producción
export const PRODUCTION_PERIOD_LABELS = {
  [ProductionPeriod.DAILY]: "Diario",
  [ProductionPeriod.WEEKLY]: "Semanal",
  [ProductionPeriod.MONTHLY]: "Mensual",
  [ProductionPeriod.LACTATION]: "Lactancia",
  [ProductionPeriod.BREEDING_SEASON]: "Temporada de Monta",
  [ProductionPeriod.GROWING_PERIOD]: "Período de Crecimiento",
  [ProductionPeriod.FINISHING_PERIOD]: "Período de Finalización",
} as const;

// Etiquetas para grados de leche
export const MILK_GRADE_LABELS = {
  [MilkGrade.PREMIUM]: "Premium",
  [MilkGrade.GRADE_A]: "Grado A",
  [MilkGrade.GRADE_B]: "Grado B",
  [MilkGrade.MANUFACTURING]: "Industrial",
  [MilkGrade.REJECTED]: "Rechazada",
} as const;

// Etiquetas para sistemas de ordeño
export const MILKING_SYSTEM_LABELS = {
  [MilkingSystemType.MANUAL]: "Manual",
  [MilkingSystemType.BUCKET_MILKER]: "Balde Ordeñador",
  [MilkingSystemType.PIPELINE]: "Tubería",
  [MilkingSystemType.HERRINGBONE]: "Espina de Pescado",
  [MilkingSystemType.PARALLEL]: "Paralelo",
  [MilkingSystemType.ROTARY]: "Rotativo",
  [MilkingSystemType.ROBOTIC]: "Robótico",
} as const;

// Etiquetas para grados de carne
export const MEAT_GRADE_LABELS = {
  [MeatGrade.PRIME]: "Superior",
  [MeatGrade.CHOICE]: "Selecto",
  [MeatGrade.SELECT]: "Estándar",
  [MeatGrade.STANDARD]: "Comercial",
  [MeatGrade.COMMERCIAL]: "Industrial",
  [MeatGrade.UTILITY]: "Utilidad",
  [MeatGrade.CUTTER]: "Corte",
  [MeatGrade.CANNER]: "Enlatado",
} as const;

// Colores para tipos de producción (para UI)
export const PRODUCTION_SYSTEM_COLORS = {
  [ProductionSystemType.DAIRY]: {
    background: "#e0f2fe",
    border: "#0891b2",
    text: "#0e7490",
  },
  [ProductionSystemType.BEEF]: {
    background: "#fecaca",
    border: "#dc2626",
    text: "#b91c1c",
  },
  [ProductionSystemType.BREEDING]: {
    background: "#fdf4ff",
    border: "#d946ef",
    text: "#c026d3",
  },
  [ProductionSystemType.DUAL_PURPOSE]: {
    background: "#fef3c7",
    border: "#f59e0b",
    text: "#d97706",
  },
  [ProductionSystemType.DRAFT]: {
    background: "#f3f4f6",
    border: "#6b7280",
    text: "#374151",
  },
} as const;

// Iconos para tipos de producción (usando nombres de iconos de Lucide)
export const PRODUCTION_SYSTEM_ICONS = {
  [ProductionSystemType.DAIRY]: "milk",
  [ProductionSystemType.BEEF]: "beef",
  [ProductionSystemType.BREEDING]: "heart",
  [ProductionSystemType.DUAL_PURPOSE]: "layers",
  [ProductionSystemType.DRAFT]: "tractor",
} as const;

// Funciones helper para producción
export const productionHelpers = {
  // Calcular días en lactancia
  calculateDaysInMilk: (
    calvingDate: Date,
    currentDate: Date = new Date()
  ): number => {
    const diffTime = Math.abs(currentDate.getTime() - calvingDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Evaluar calidad de leche
  evaluateMilkQuality: (scc: number, bacterialCount: number): MilkGrade => {
    if (scc <= 200000 && bacterialCount <= 10000) return MilkGrade.PREMIUM;
    if (scc <= 400000 && bacterialCount <= 50000) return MilkGrade.GRADE_A;
    if (scc <= 750000 && bacterialCount <= 100000) return MilkGrade.GRADE_B;
    if (scc <= 1000000 && bacterialCount <= 200000)
      return MilkGrade.MANUFACTURING;
    return MilkGrade.REJECTED;
  },

  // Calcular eficiencia reproductiva
  calculateBreedingEfficiency: (
    servicesPerConception: number,
    daysToConception: number
  ): number => {
    // Fórmula simplificada de eficiencia reproductiva
    const serviceEfficiency = 1 / servicesPerConception;
    const timeEfficiency = Math.max(0, 1 - (daysToConception - 21) / 365);
    return Math.round(serviceEfficiency * timeEfficiency * 100);
  },

  // Determinar estado de preparación para sacrificio
  determineSlaughterReadiness: (
    weight: number,
    targetWeight: number,
    fatCover: FatCoverScore
  ): SlaughterReadinessScore => {
    const weightRatio = weight / targetWeight;

    if (weightRatio < 0.85) return SlaughterReadinessScore.NOT_READY;
    if (weightRatio < 0.95) return SlaughterReadinessScore.APPROACHING;
    if (
      weightRatio >= 0.95 &&
      weightRatio <= 1.05 &&
      fatCover === FatCoverScore.MODERATE
    ) {
      return SlaughterReadinessScore.OPTIMAL;
    }
    if (weightRatio > 1.05 || fatCover === FatCoverScore.FAT) {
      return SlaughterReadinessScore.OVERFINISHED;
    }
    return SlaughterReadinessScore.READY;
  },

  // Formatear volumen de leche
  formatMilkVolume: (liters: number): string => {
    if (liters < 1) return `${Math.round(liters * 1000)}ml`;
    return `${liters.toFixed(1)}L`;
  },

  // Formatear ganancia de peso
  formatWeightGain: (gainKg: number): string => {
    return `${gainKg >= 0 ? "+" : ""}${gainKg.toFixed(2)}kg`;
  },
} as const;
