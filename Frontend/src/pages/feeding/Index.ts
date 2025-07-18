// Exportaciones principales del módulo Feeding
// Este archivo facilita las importaciones desde otros módulos

// Página principal del módulo
export { default as FeedingPage } from "./FeedingPage";

// Componentes principales del módulo
export { default as Floors } from "./Floors";

// =================================================================
// INTERFACES Y TIPOS PRINCIPALES DEL MÓDULO FEEDING
// =================================================================

// Interfaz principal para plantas alimenticias
export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  commonNames: string[];
  plantType: PlantType;
  nutritionalValue: NutritionalValue;
  toxicityLevel: ToxicityLevel;
  seasonality: Season[];
  growthConditions: GrowthConditions;
  harvestInfo: HarvestInfo;
  feedingNotes: string;
  imageUrl: string;
  isNative: boolean;
  isRecommended: boolean;
  lastUpdated: Date;
  createdBy: string;
}

// Tipos de plantas
export enum PlantType {
  GRASS = "grass",
  LEGUME = "legume",
  HERB = "herb",
  TREE_LEAF = "tree_leaf",
  SHRUB = "shrub",
  AQUATIC = "aquatic",
}

// Niveles de toxicidad
export enum ToxicityLevel {
  SAFE = "safe",
  CAUTION = "caution",
  MODERATE = "moderate",
  HIGH = "high",
  TOXIC = "toxic",
}

// Estaciones del año
export enum Season {
  SPRING = "spring",
  SUMMER = "summer",
  FALL = "fall",
  WINTER = "winter",
}

// Valor nutricional de plantas
export interface NutritionalValue {
  protein: number; // %
  fiber: number; // %
  moisture: number; // %
  minerals: {
    calcium: number;
    phosphorus: number;
    potassium: number;
    magnesium: number;
  };
  vitamins: {
    vitaminA: number;
    vitaminC: number;
    vitaminE: number;
  };
  digestibility: number; // %
  energyContent: number; // Mcal/kg
}

// Condiciones de crecimiento
export interface GrowthConditions {
  soilType: string[];
  phRange: { min: number; max: number };
  sunlightNeeds: "full" | "partial" | "shade";
  waterRequirements: "low" | "moderate" | "high";
  temperatureRange: { min: number; max: number };
  altitudeRange: { min: number; max: number };
}

// Información de cosecha
export interface HarvestInfo {
  bestHarvestTime: string;
  harvestFrequency: string;
  storageMethod: string;
  shelfLife: number; // días
  processingRequired: boolean;
}

// Plan nutricional
export interface NutritionalPlan {
  id: string;
  name: string;
  description: string;
  targetAnimals: string[]; // IDs de animales
  startDate: Date;
  endDate?: Date;
  status: PlanStatus;
  components: FeedComponent[];
  nutritionalGoals: NutritionalGoals;
  dailyCost: number;
  weeklySchedule: WeeklySchedule;
  veterinarianApproval: boolean;
  approvedBy?: string;
  approvalDate?: Date;
  notes: string;
  createdBy: string;
  createdAt: Date;
  lastModified: Date;
}

// Estado del plan
export enum PlanStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  ACTIVE = "active",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

// Componente de alimentación
export interface FeedComponent {
  id: string;
  feedId: string;
  feedName: string;
  feedType: FeedType;
  quantity: number; // kg por día
  unit: string;
  costPerUnit: number;
  nutritionalContribution: NutritionalContribution;
  administrationTime: string[];
  specialInstructions?: string;
}

// Tipos de alimento
export enum FeedType {
  CONCENTRATE = "concentrate",
  FORAGE = "forage",
  HAY = "hay",
  SILAGE = "silage",
  GRAIN = "grain",
  PELLETS = "pellets",
  SUPPLEMENT = "supplement",
  MINERAL = "mineral",
  VITAMIN = "vitamin",
  FRESH_GRASS = "fresh_grass",
  ORGANIC = "organic",
}

// Contribución nutricional
export interface NutritionalContribution {
  protein: number;
  energy: number;
  fiber: number;
  calcium: number;
  phosphorus: number;
  vitamins: string[];
  minerals: string[];
}

// Objetivos nutricionales
export interface NutritionalGoals {
  dailyProtein: number; // gramos
  dailyEnergy: number; // Mcal
  dailyFiber: number; // gramos
  dailyCalcium: number; // gramos
  dailyPhosphorus: number; // gramos
  bodyWeightGain?: number; // kg por día
  milkProduction?: number; // litros por día
  reproductiveGoals?: string[];
}

// Horario semanal
export interface WeeklySchedule {
  monday: DailySchedule;
  tuesday: DailySchedule;
  wednesday: DailySchedule;
  thursday: DailySchedule;
  friday: DailySchedule;
  saturday: DailySchedule;
  sunday: DailySchedule;
}

// Horario diario
export interface DailySchedule {
  morning: FeedingSession[];
  afternoon: FeedingSession[];
  evening: FeedingSession[];
  night?: FeedingSession[];
}

// Sesión de alimentación
export interface FeedingSession {
  time: string; // HH:MM
  feeds: string[]; // IDs de componentes de alimentación
  location: string;
  duration: number; // minutos
  responsible: string;
  instructions?: string;
}

// Registro de consumo
export interface ConsumptionRecord {
  id: string;
  animalId: string;
  animalTag: string;
  planId: string;
  feedComponentId: string;
  scheduledQuantity: number;
  actualQuantity: number;
  refusalQuantity: number;
  consumptionPercentage: number;
  feedingTime: Date;
  location: string;
  weather?: WeatherCondition;
  animalBehavior: AnimalBehavior;
  notes?: string;
  recordedBy: string;
  recordedAt: Date;
}

// Condición climática
export interface WeatherCondition {
  temperature: number;
  humidity: number;
  precipitation: boolean;
  windSpeed: number;
  condition: "sunny" | "cloudy" | "rainy" | "stormy";
}

// Comportamiento animal
export interface AnimalBehavior {
  appetite: "poor" | "normal" | "good" | "excellent";
  eatingSpeed: "slow" | "normal" | "fast";
  selectivity: "not_selective" | "slightly_selective" | "very_selective";
  competitiveness: "passive" | "normal" | "aggressive";
  healthIndication: "healthy" | "minor_concern" | "needs_attention";
}

// Inventario de alimentos
export interface FeedInventory {
  id: string;
  feedId: string;
  feedName: string;
  feedType: FeedType;
  currentStock: number;
  unit: string;
  minimumStock: number;
  maximumStock: number;
  lastRestocked: Date;
  expirationDate?: Date;
  supplier: Supplier;
  costPerUnit: number;
  storageLocation: string;
  storageConditions: StorageConditions;
  qualityStatus: QualityStatus;
  batchNumber?: string;
  notes?: string;
}

// Proveedor
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  rating: number; // 1-5 estrellas
  paymentTerms: string;
  deliveryTime: number; // días
  isPreferred: boolean;
}

// Condiciones de almacenamiento
export interface StorageConditions {
  temperature: { min: number; max: number };
  humidity: { min: number; max: number };
  lightExposure: "avoid" | "limited" | "normal";
  ventilation: "required" | "recommended" | "not_required";
  specialRequirements?: string[];
}

// Estado de calidad
export enum QualityStatus {
  EXCELLENT = "excellent",
  GOOD = "good",
  ACCEPTABLE = "acceptable",
  POOR = "poor",
  EXPIRED = "expired",
}

// Análisis nutricional
export interface NutritionalAnalysis {
  id: string;
  animalId: string;
  planId: string;
  analysisDate: Date;
  analysisType: AnalysisType;
  results: AnalysisResults;
  recommendations: string[];
  concerns: string[];
  nextAnalysisDate: Date;
  veterinarianId: string;
  approved: boolean;
}

// Tipo de análisis
export enum AnalysisType {
  WEEKLY_REVIEW = "weekly_review",
  MONTHLY_ASSESSMENT = "monthly_assessment",
  QUARTERLY_EVALUATION = "quarterly_evaluation",
  HEALTH_RELATED = "health_related",
  PERFORMANCE_BASED = "performance_based",
}

// Resultados del análisis
export interface AnalysisResults {
  bodyConditionScore: number; // 1-9 escala
  weightChange: number; // kg desde último análisis
  nutritionalDeficiencies: string[];
  nutritionalExcesses: string[];
  digestibilityAssessment: number; // %
  feedEfficiency: number;
  costEffectiveness: number;
  overallHealthScore: number; // 1-10 escala
}

// Estadísticas del módulo
export interface FeedingStats {
  totalPlants: number;
  activeFeedingPlans: number;
  dailyConsumption: number;
  feedCost: number;
  nutritionalCompliance: number;
  pendingFeedings: number;
  alertsCount: number;
  lastUpdate: string;
}

// Acción rápida
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  badge?: number;
}

// Pestaña de navegación
export interface NavigationTab {
  id: string;
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  isActive?: boolean;
}

// =================================================================
// CONSTANTES DEL MÓDULO
// =================================================================

// Etiquetas en español para tipos de plantas
export const PLANT_TYPE_LABELS = {
  [PlantType.GRASS]: "Pasto",
  [PlantType.LEGUME]: "Leguminosa",
  [PlantType.HERB]: "Hierba",
  [PlantType.TREE_LEAF]: "Hoja de Árbol",
  [PlantType.SHRUB]: "Arbusto",
  [PlantType.AQUATIC]: "Acuática",
} as const;

// Etiquetas para niveles de toxicidad
export const TOXICITY_LEVEL_LABELS = {
  [ToxicityLevel.SAFE]: "Segura",
  [ToxicityLevel.CAUTION]: "Precaución",
  [ToxicityLevel.MODERATE]: "Moderada",
  [ToxicityLevel.HIGH]: "Alta",
  [ToxicityLevel.TOXIC]: "Tóxica",
} as const;

// Etiquetas para estaciones
export const SEASON_LABELS = {
  [Season.SPRING]: "Primavera",
  [Season.SUMMER]: "Verano",
  [Season.FALL]: "Otoño",
  [Season.WINTER]: "Invierno",
} as const;

// Etiquetas para tipos de alimento
export const FEED_TYPE_LABELS = {
  [FeedType.CONCENTRATE]: "Concentrado",
  [FeedType.FORAGE]: "Forraje",
  [FeedType.HAY]: "Heno",
  [FeedType.SILAGE]: "Ensilaje",
  [FeedType.GRAIN]: "Grano",
  [FeedType.PELLETS]: "Pellets",
  [FeedType.SUPPLEMENT]: "Suplemento",
  [FeedType.MINERAL]: "Mineral",
  [FeedType.VITAMIN]: "Vitamina",
  [FeedType.FRESH_GRASS]: "Pasto Fresco",
  [FeedType.ORGANIC]: "Orgánico",
} as const;

// Etiquetas para estados de planes
export const PLAN_STATUS_LABELS = {
  [PlanStatus.DRAFT]: "Borrador",
  [PlanStatus.PENDING_APPROVAL]: "Pendiente de Aprobación",
  [PlanStatus.APPROVED]: "Aprobado",
  [PlanStatus.ACTIVE]: "Activo",
  [PlanStatus.PAUSED]: "Pausado",
  [PlanStatus.COMPLETED]: "Completado",
  [PlanStatus.CANCELLED]: "Cancelado",
} as const;

// Colores para estados de calidad
export const QUALITY_STATUS_COLORS = {
  [QualityStatus.EXCELLENT]: "text-green-600 bg-green-100",
  [QualityStatus.GOOD]: "text-blue-600 bg-blue-100",
  [QualityStatus.ACCEPTABLE]: "text-yellow-600 bg-yellow-100",
  [QualityStatus.POOR]: "text-orange-600 bg-orange-100",
  [QualityStatus.EXPIRED]: "text-red-600 bg-red-100",
} as const;

// =================================================================
// UTILIDADES Y HELPERS
// =================================================================

// Función para obtener etiqueta de tipo de planta
export const getPlantTypeLabel = (type: PlantType): string => {
  return PLANT_TYPE_LABELS[type];
};

// Función para obtener etiqueta de toxicidad
export const getToxicityLabel = (toxicity: ToxicityLevel): string => {
  return TOXICITY_LEVEL_LABELS[toxicity];
};

// Función para obtener color de toxicidad
export const getToxicityColor = (toxicity: ToxicityLevel): string => {
  const colors = {
    [ToxicityLevel.SAFE]: "text-green-600 bg-green-100",
    [ToxicityLevel.CAUTION]: "text-yellow-600 bg-yellow-100",
    [ToxicityLevel.MODERATE]: "text-orange-600 bg-orange-100",
    [ToxicityLevel.HIGH]: "text-red-600 bg-red-100",
    [ToxicityLevel.TOXIC]: "text-red-800 bg-red-200",
  };
  return colors[toxicity];
};

// Función para obtener etiqueta de estación
export const getSeasonLabel = (season: Season): string => {
  return SEASON_LABELS[season];
};

// Función para calcular consumo promedio
export const calculateAverageConsumption = (
  records: ConsumptionRecord[]
): number => {
  if (records.length === 0) return 0;
  const total = records.reduce((sum, record) => sum + record.actualQuantity, 0);
  return total / records.length;
};

// Función para calcular eficiencia de alimentación
export const calculateFeedEfficiency = (
  records: ConsumptionRecord[]
): number => {
  if (records.length === 0) return 0;
  const totalScheduled = records.reduce(
    (sum, record) => sum + record.scheduledQuantity,
    0
  );
  const totalConsumed = records.reduce(
    (sum, record) => sum + record.actualQuantity,
    0
  );
  return totalScheduled > 0 ? (totalConsumed / totalScheduled) * 100 : 0;
};

// =================================================================
// METADATOS DEL MÓDULO
// =================================================================

export const FEEDING_MODULE_INFO = {
  name: "Módulo de Alimentación",
  version: "1.0.0",
  description: "Sistema integral para la gestión nutricional del ganado",
  author: "UJAT - Universidad Juárez Autónoma de Tabasco",
  lastUpdated: "2025-01-06",
  components: [
    "FeedingPage",
    "Floors",
    "NutritionalPlans",
    "FeedInventory",
    "FeedingSchedule",
    "ConsumptionTracking",
    "NutritionalAnalysis",
  ],
} as const;
