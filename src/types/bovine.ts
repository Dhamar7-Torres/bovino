// Tipos específicos para la gestión de ganado bovino

import {
  Bovine as BaseBovine,
  BovineType,
  BovineGender,
  HealthStatus,
} from "../constants/bovineTypes";

// Extender la interfaz base de Bovine con campos adicionales
export interface BovineExtended extends BaseBovine {
  // Información genealógica
  genealogy: BovineGenealogy;

  // Información reproductiva
  reproductive: ReproductiveInfo;

  // Información nutricional
  nutrition: NutritionInfo;

  // Historial de peso
  weightHistory: WeightRecord[];

  // Características físicas
  physicalTraits: PhysicalTraits;

  // Información económica
  economic: EconomicInfo;

  // Metadatos adicionales
  metadata: BovineMetadata;
}

// Información genealógica
export interface BovineGenealogy {
  sireId?: string; // ID del padre
  sireName?: string;
  sireBreed?: string;
  damId?: string; // ID de la madre
  damName?: string;
  damBreed?: string;
  generation: number;
  inbreedingCoefficient?: number;
  pedigreeComplete: boolean;
  registrationNumber?: string;
  registrationAuthority?: string;
}

// Información reproductiva
export interface ReproductiveInfo {
  isBreeding: boolean;
  reproductiveStatus: ReproductiveStatus;
  lastCalvingDate?: Date;
  gestationPeriod?: number; // días
  expectedCalvingDate?: Date;
  calvingInterval?: number; // meses
  totalCalves: number;
  reproductiveEvents: ReproductiveEvent[];
  fertilityScore?: number; // 1-10
  lastHeatDate?: Date;
  artificialInsemination: AIRecord[];
}

// Evento reproductivo
export interface ReproductiveEvent {
  id: string;
  type: ReproductiveEventType;
  date: Date;
  notes?: string;
  veterinarianId?: string;
  result?: string;
  cost?: number;
}

// Registro de inseminación artificial
export interface AIRecord {
  id: string;
  date: Date;
  bullId?: string;
  bullName?: string;
  semenBatch: string;
  technician: string;
  success: boolean;
  cost: number;
  notes?: string;
}

// Información nutricional
export interface NutritionInfo {
  currentDiet: DietPlan;
  feedConsumption: FeedConsumptionRecord[];
  supplements: SupplementRecord[];
  bodyConditionScore: number; // 1-9 scale
  lastBCSDate: Date;
  specialDietaryNeeds: string[];
  allergies: string[];
}

// Plan dietético
export interface DietPlan {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate?: Date;
  feeds: FeedComponent[];
  totalCostPerDay: number;
  nutritionTargets: NutritionTargets;
}

// Componente de alimentación
export interface FeedComponent {
  feedType: string;
  amount: number; // kg por día
  unit: string;
  cost: number;
  protein: number; // %
  energy: number; // Mcal/kg
  fiber: number; // %
}

// Objetivos nutricionales
export interface NutritionTargets {
  dailyEnergyMcal: number;
  dailyProteinKg: number;
  dailyFiberKg: number;
  dailyCalciumG: number;
  dailyPhosphorusG: number;
}

// Registro de consumo de alimento
export interface FeedConsumptionRecord {
  date: Date;
  feedType: string;
  amountOffered: number; // kg
  amountConsumed: number; // kg
  refusals: number; // kg
  notes?: string;
}

// Registro de suplementos
export interface SupplementRecord {
  id: string;
  supplementName: string;
  startDate: Date;
  endDate?: Date;
  dosage: string;
  frequency: string;
  purpose: string;
  cost: number;
  veterinarianPrescribed: boolean;
}

// Historial de peso
export interface WeightRecord {
  id: string;
  date: Date;
  weight: number; // kg
  measurementMethod: WeightMeasurementMethod;
  bodyConditionScore?: number;
  heartGirth?: number; // cm
  notes?: string;
  recordedBy: string;
}

// Características físicas
export interface PhysicalTraits {
  height: number; // cm
  bodyLength: number; // cm
  chestGirth: number; // cm
  coat: CoatDescription;
  markings: string[];
  defects: PhysicalDefect[];
  photos: AnimalPhoto[];
  lastPhysicalExam: Date;
}

// Descripción del pelaje
export interface CoatDescription {
  primaryColor: string;
  secondaryColor?: string;
  pattern: CoatPattern;
  texture: CoatTexture;
  seasonalChanges: boolean;
}

// Defecto físico
export interface PhysicalDefect {
  type: string;
  description: string;
  severity: DefectSeverity;
  affectsBreeding: boolean;
  affectsProduction: boolean;
  discoveredDate: Date;
}

// Foto del animal
export interface AnimalPhoto {
  id: string;
  url: string;
  thumbnailUrl: string;
  description?: string;
  angle: PhotoAngle;
  uploadDate: Date;
  isMainPhoto: boolean;
}

// Información económica
export interface EconomicInfo {
  purchasePrice?: number;
  purchaseDate?: Date;
  currentValue: number;
  depreciationRate: number; // % anual
  insuranceValue?: number;
  productionValue: ProductionValue;
  expenses: ExpenseRecord[];
  totalInvestment: number;
  roi: number; // Return on Investment %
}

// Valor de producción
export interface ProductionValue {
  milkProduction?: MilkProduction;
  meatProduction?: MeatProduction;
  breedingValue?: BreedingValue;
  totalAnnualValue: number;
}

// Producción lechera
export interface MilkProduction {
  dailyAverage: number; // litros
  lacationNumber: number;
  lacationStartDate: Date;
  lacationLength: number; // días
  milkQuality: MilkQuality;
  totalLacationYield: number; // litros
}

// Calidad de la leche
export interface MilkQuality {
  fatContent: number; // %
  proteinContent: number; // %
  somaticCellCount: number;
  bacterialCount: number;
  lastTestDate: Date;
}

// Producción cárnica
export interface MeatProduction {
  averageDailyGain: number; // kg/día
  feedConversionRatio: number;
  expectedSlaughterWeight: number; // kg
  expectedSlaughterDate?: Date;
  carcassQualityGrade?: string;
  marblingScore?: number;
}

// Valor reproductivo
export interface BreedingValue {
  estimatedBreedingValue: number;
  accuracyPercentage: number;
  traitIndexes: TraitIndex[];
  progenyPerformance: ProgenyRecord[];
}

// Índice de rasgo
export interface TraitIndex {
  trait: string;
  value: number;
  accuracy: number;
  percentile: number;
}

// Registro de progenie
export interface ProgenyRecord {
  offspringId: string;
  offspringName: string;
  birthDate: Date;
  performanceData: Record<string, number>;
}

// Registro de gastos
export interface ExpenseRecord {
  id: string;
  date: Date;
  category: ExpenseCategory;
  description: string;
  amount: number;
  currency: string;
  vendor?: string;
  isRecurring: boolean;
  tags: string[];
}

// Metadatos del bovino
export interface BovineMetadata {
  qrCode?: string;
  rfidTag?: string;
  microchipId?: string;
  customFields: CustomField[];
  certifications: Certification[];
  awards: Award[];
  transferHistory: TransferRecord[];
}

// Campo personalizado
export interface CustomField {
  key: string;
  value: any;
  type: "text" | "number" | "date" | "boolean" | "select";
  label: string;
  isRequired: boolean;
}

// Certificación
export interface Certification {
  id: string;
  name: string;
  issuingAuthority: string;
  issueDate: Date;
  expiryDate?: Date;
  certificateNumber: string;
  documentUrl?: string;
}

// Premio
export interface Award {
  id: string;
  name: string;
  category: string;
  date: Date;
  organization: string;
  rank?: number;
  description?: string;
  value?: number;
}

// Registro de transferencia
export interface TransferRecord {
  id: string;
  fromFarmId: string;
  toFarmId: string;
  transferDate: Date;
  reason: TransferReason;
  price?: number;
  documents: string[];
  notes?: string;
}

// Datos de filtros para búsqueda
export interface BovineFilters {
  type?: BovineType[];
  gender?: BovineGender[];
  healthStatus?: HealthStatus[];
  ageRange?: {
    min: number;
    max: number;
  };
  weightRange?: {
    min: number;
    max: number;
  };
  breed?: string[];
  isPregnant?: boolean;
  isLactating?: boolean;
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // metros
  };
  tags?: string[];
  hasIllness?: boolean;
  vaccinationStatus?: "up_to_date" | "overdue" | "partial";
}

// Opciones de ordenamiento
export interface BovineSort {
  field: keyof BovineExtended | "age" | "lastVaccination";
  direction: "asc" | "desc";
}

// Resultado de búsqueda paginada
export interface BovineSearchResult {
  cattle: BovineExtended[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  filters: BovineFilters;
  sort: BovineSort;
}

// Estadísticas de grupo
export interface BovineGroupStats {
  total: number;
  byType: Record<BovineType, number>;
  byGender: Record<BovineGender, number>;
  byHealthStatus: Record<HealthStatus, number>;
  averageAge: number;
  averageWeight: number;
  totalValue: number;
  pregnantCount: number;
  lactatingCount: number;
}

// Enums adicionales
export enum ReproductiveStatus {
  OPEN = "open",
  BRED = "bred",
  PREGNANT = "pregnant",
  LACTATING = "lactating",
  DRY = "dry",
  HEIFER = "heifer",
}

export enum ReproductiveEventType {
  HEAT = "heat",
  BREEDING = "breeding",
  PREGNANCY_CHECK = "pregnancy_check",
  CALVING = "calving",
  WEANING = "weaning",
  DRY_OFF = "dry_off",
}

export enum WeightMeasurementMethod {
  SCALE = "scale",
  TAPE = "tape",
  VISUAL_ESTIMATE = "visual_estimate",
  FORMULA = "formula",
}

export enum CoatPattern {
  SOLID = "solid",
  SPOTS = "spots",
  STRIPES = "stripes",
  PATCHES = "patches",
  ROAN = "roan",
  BRINDLE = "brindle",
}

export enum CoatTexture {
  SMOOTH = "smooth",
  ROUGH = "rough",
  CURLY = "curly",
  WOOLLY = "woolly",
}

export enum DefectSeverity {
  MINOR = "minor",
  MODERATE = "moderate",
  MAJOR = "major",
  SEVERE = "severe",
}

export enum PhotoAngle {
  LEFT_SIDE = "left_side",
  RIGHT_SIDE = "right_side",
  FRONT = "front",
  REAR = "rear",
  HEAD = "head",
  UDDER = "udder",
}

export enum ExpenseCategory {
  FEED = "feed",
  VETERINARY = "veterinary",
  BREEDING = "breeding",
  EQUIPMENT = "equipment",
  LABOR = "labor",
  INSURANCE = "insurance",
  TRANSPORTATION = "transportation",
  OTHER = "other",
}

export enum TransferReason {
  SALE = "sale",
  PURCHASE = "purchase",
  BREEDING_LOAN = "breeding_loan",
  GRAZING_AGREEMENT = "grazing_agreement",
  SHOW = "show",
  MEDICAL_TREATMENT = "medical_treatment",
}

// Etiquetas en español
export const REPRODUCTIVE_STATUS_LABELS = {
  [ReproductiveStatus.OPEN]: "Vacía",
  [ReproductiveStatus.BRED]: "Servida",
  [ReproductiveStatus.PREGNANT]: "Gestante",
  [ReproductiveStatus.LACTATING]: "Lactando",
  [ReproductiveStatus.DRY]: "Seca",
  [ReproductiveStatus.HEIFER]: "Vaquilla",
} as const;

export const EXPENSE_CATEGORY_LABELS = {
  [ExpenseCategory.FEED]: "Alimentación",
  [ExpenseCategory.VETERINARY]: "Veterinario",
  [ExpenseCategory.BREEDING]: "Reproducción",
  [ExpenseCategory.EQUIPMENT]: "Equipo",
  [ExpenseCategory.LABOR]: "Mano de Obra",
  [ExpenseCategory.INSURANCE]: "Seguro",
  [ExpenseCategory.TRANSPORTATION]: "Transporte",
  [ExpenseCategory.OTHER]: "Otros",
} as const;
