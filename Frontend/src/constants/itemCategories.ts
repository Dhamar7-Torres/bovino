// Tipos y constantes para categorías de elementos del inventario ganadero

export interface BaseItem {
  id: string;
  name: string;
  description?: string;
  category: ItemCategory;
  subcategory: string;
  brand?: string;
  manufacturer?: string;
  sku?: string;
  barcode?: string;
  unit: MeasurementUnit;
  costPerUnit: number;
  currency: string;
  location?: ItemLocation;
  tags?: string[];
  isActive: boolean;
  isTracked: boolean; // Si se rastrea el inventario
  minimumStock?: number;
  maximumStock?: number;
  reorderPoint?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Ubicación del item en el inventario
export interface ItemLocation {
  building?: string;
  room?: string;
  shelf?: string;
  bin?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Medicamento veterinario
export interface MedicationItem extends BaseItem {
  category: ItemCategory.MEDICATIONS;
  activeIngredient: string;
  concentration: string;
  form: MedicationForm;
  administrationRoute: AdministrationRoute[];
  withdrawalPeriod?: number; // días
  expirationDate?: Date;
  batchNumber?: string;
  prescriptionRequired: boolean;
  controlledSubstance: boolean;
  sideEffects?: string[];
  contraindications?: string[];
  targetSpecies: string[];
}

// Vacuna
export interface VaccineItem extends BaseItem {
  category: ItemCategory.VACCINES;
  vaccineType: VaccineType;
  valency: number; // número de enfermedades que previene
  diseasesPrevented: string[];
  ageRecommendation: AgeRecommendation;
  boosterRequired: boolean;
  boosterInterval?: number; // días
  storageTemperature: TemperatureRange;
  expirationDate?: Date;
  batchNumber?: string;
}

// Alimento
export interface FeedItem extends BaseItem {
  category: ItemCategory.FEED;
  feedType: FeedType;
  lifestage: Lifestage[];
  nutritionalInfo: NutritionalInfo;
  ingredients: string[];
  storageRequirements: StorageRequirements;
  shelfLife: number; // días
  isOrganic: boolean;
  isMedicated: boolean;
}

// Suplemento nutricional
export interface SupplementItem extends BaseItem {
  category: ItemCategory.SUPPLEMENTS;
  supplementType: SupplementType;
  activeComponents: ActiveComponent[];
  recommendedDosage: string;
  administrationMethod: string[];
  targetFunction: string[];
  lifestage: Lifestage[];
}

// Equipo
export interface EquipmentItem extends BaseItem {
  category: ItemCategory.EQUIPMENT;
  equipmentType: EquipmentType;
  modelNumber?: string;
  serialNumber?: string;
  warrantyDate?: Date;
  maintenanceSchedule?: MaintenanceInfo;
  calibrationRequired: boolean;
  lastCalibration?: Date;
  nextCalibration?: Date;
  operatingManual?: string;
  safetyInstructions?: string[];
}

// Suministro general
export interface SupplyItem extends BaseItem {
  category: ItemCategory.SUPPLIES;
  supplyType: SupplyType;
  material?: string;
  size?: string;
  color?: string;
  disposable: boolean;
  sterilized: boolean;
}

// Información nutricional del alimento
export interface NutritionalInfo {
  crudeProtein: number; // %
  crudeCarbs: number; // %
  crudeFiber: number; // %
  crudeFat: number; // %
  calcium: number; // %
  phosphorus: number; // %
  metabolizableEnergy: number; // Mcal/kg
  netEnergyMaintenance?: number; // Mcal/kg
  netEnergyGain?: number; // Mcal/kg
  dryMatter: number; // %
  moisture: number; // %
  vitamins?: VitaminContent[];
  minerals?: MineralContent[];
}

// Contenido vitamínico
export interface VitaminContent {
  vitamin: VitaminType;
  amount: number;
  unit: string;
}

// Contenido mineral
export interface MineralContent {
  mineral: MineralType;
  amount: number;
  unit: string;
}

// Componente activo de suplementos
export interface ActiveComponent {
  name: string;
  concentration: number;
  unit: string;
  function: string;
}

// Requerimientos de almacenamiento
export interface StorageRequirements {
  temperature: TemperatureRange;
  humidity: HumidityRange;
  lightProtection: boolean;
  ventilationRequired: boolean;
  keepDry: boolean;
  keepFrozen: boolean;
  specialInstructions?: string[];
}

// Rango de temperatura
export interface TemperatureRange {
  min: number; // °C
  max: number; // °C
  optimal?: number; // °C
}

// Rango de humedad
export interface HumidityRange {
  min: number; // %
  max: number; // %
  optimal?: number; // %
}

// Información de mantenimiento
export interface MaintenanceInfo {
  frequency: MaintenanceFrequency;
  intervalDays?: number;
  lastMaintenance?: Date;
  nextDue?: Date;
  procedures: string[];
  requiredParts?: string[];
  estimatedCost?: number;
}

// Recomendación de edad
export interface AgeRecommendation {
  minimumAge: number; // meses
  maximumAge?: number; // meses
  optimalAge?: number; // meses
  notes?: string;
}

// Enums para categorías principales
export enum ItemCategory {
  MEDICATIONS = "medications",
  VACCINES = "vaccines",
  FEED = "feed",
  SUPPLEMENTS = "supplements",
  EQUIPMENT = "equipment",
  SUPPLIES = "supplies",
  TOOLS = "tools",
  SAFETY = "safety",
  CLEANING = "cleaning",
  REPRODUCTION = "reproduction",
  IDENTIFICATION = "identification",
  BEDDING = "bedding",
}

// Tipos de medicamentos
export enum MedicationForm {
  INJECTION = "injection",
  ORAL_LIQUID = "oral_liquid",
  TABLETS = "tablets",
  CAPSULES = "capsules",
  POWDER = "powder",
  PASTE = "paste",
  TOPICAL = "topical",
  IMPLANT = "implant",
  BOLUS = "bolus",
  SPRAY = "spray",
}

// Vías de administración
export enum AdministrationRoute {
  INTRAMUSCULAR = "intramuscular",
  SUBCUTANEOUS = "subcutaneous",
  INTRAVENOUS = "intravenous",
  ORAL = "oral",
  TOPICAL = "topical",
  INTRANASAL = "intranasal",
  INTRAMAMMARY = "intramammary",
  INTRAUTERINE = "intrauterine",
}

// Tipos de vacunas
export enum VaccineType {
  VIRAL = "viral",
  BACTERIAL = "bacterial",
  MODIFIED_LIVE = "modified_live",
  KILLED = "killed",
  COMBINATION = "combination",
  SUBUNIT = "subunit",
  TOXOID = "toxoid",
}

// Tipos de alimento
export enum FeedType {
  CONCENTRATE = "concentrate",
  FORAGE = "forage",
  HAY = "hay",
  SILAGE = "silage",
  GRAIN = "grain",
  PELLETS = "pellets",
  MASH = "mash",
  COMPLETE_FEED = "complete_feed",
  STARTER = "starter",
  GROWER = "grower",
  FINISHER = "finisher",
  LACTATING = "lactating",
  DRY = "dry",
}

// Tipos de suplementos
export enum SupplementType {
  VITAMIN = "vitamin",
  MINERAL = "mineral",
  VITAMIN_MINERAL = "vitamin_mineral",
  PROTEIN = "protein",
  ENERGY = "energy",
  PROBIOTIC = "probiotic",
  PREBIOTIC = "prebiotic",
  AMINO_ACID = "amino_acid",
  ENZYME = "enzyme",
  ELECTROLYTE = "electrolyte",
}

// Tipos de equipo
export enum EquipmentType {
  FEEDING = "feeding",
  WATERING = "watering",
  MILKING = "milking",
  HANDLING = "handling",
  WEIGHING = "weighing",
  MEDICAL = "medical",
  REPRODUCTION = "reproduction",
  MONITORING = "monitoring",
  TRANSPORTATION = "transportation",
  FENCING = "fencing",
  SHELTER = "shelter",
}

// Tipos de suministros
export enum SupplyType {
  MEDICAL_SUPPLIES = "medical_supplies",
  CLEANING_SUPPLIES = "cleaning_supplies",
  SAFETY_EQUIPMENT = "safety_equipment",
  IDENTIFICATION_TAGS = "identification_tags",
  SYRINGES_NEEDLES = "syringes_needles",
  BANDAGES_WRAPS = "bandages_wraps",
  DISINFECTANTS = "disinfectants",
  PROTECTIVE_GEAR = "protective_gear",
}

// Etapas de vida
export enum Lifestage {
  CALF = "calf",
  WEANER = "weaner",
  GROWING = "growing",
  BREEDING = "breeding",
  LACTATING = "lactating",
  DRY = "dry",
  FINISHING = "finishing",
  MATURE = "mature",
}

// Unidades de medida
export enum MeasurementUnit {
  KILOGRAMS = "kg",
  GRAMS = "g",
  POUNDS = "lbs",
  OUNCES = "oz",
  LITERS = "L",
  MILLILITERS = "ml",
  GALLONS = "gal",
  PIECES = "pcs",
  BOXES = "boxes",
  BAGS = "bags",
  BOTTLES = "bottles",
  VIALS = "vials",
  DOSES = "doses",
}

// Vitaminas
export enum VitaminType {
  VITAMIN_A = "vitamin_a",
  VITAMIN_D = "vitamin_d",
  VITAMIN_E = "vitamin_e",
  VITAMIN_K = "vitamin_k",
  VITAMIN_B1 = "vitamin_b1",
  VITAMIN_B2 = "vitamin_b2",
  VITAMIN_B6 = "vitamin_b6",
  VITAMIN_B12 = "vitamin_b12",
  NIACIN = "niacin",
  BIOTIN = "biotin",
  FOLIC_ACID = "folic_acid",
}

// Minerales
export enum MineralType {
  CALCIUM = "calcium",
  PHOSPHORUS = "phosphorus",
  MAGNESIUM = "magnesium",
  POTASSIUM = "potassium",
  SODIUM = "sodium",
  CHLORINE = "chlorine",
  SULFUR = "sulfur",
  IRON = "iron",
  COPPER = "copper",
  ZINC = "zinc",
  MANGANESE = "manganese",
  IODINE = "iodine",
  COBALT = "cobalt",
  SELENIUM = "selenium",
}

// Frecuencia de mantenimiento
export enum MaintenanceFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  SEMI_ANNUALLY = "semi_annually",
  ANNUALLY = "annually",
  AS_NEEDED = "as_needed",
}

// Etiquetas en español para categorías principales
export const ITEM_CATEGORY_LABELS = {
  [ItemCategory.MEDICATIONS]: "Medicamentos",
  [ItemCategory.VACCINES]: "Vacunas",
  [ItemCategory.FEED]: "Alimentos",
  [ItemCategory.SUPPLEMENTS]: "Suplementos",
  [ItemCategory.EQUIPMENT]: "Equipos",
  [ItemCategory.SUPPLIES]: "Suministros",
  [ItemCategory.TOOLS]: "Herramientas",
  [ItemCategory.SAFETY]: "Seguridad",
  [ItemCategory.CLEANING]: "Limpieza",
  [ItemCategory.REPRODUCTION]: "Reproducción",
  [ItemCategory.IDENTIFICATION]: "Identificación",
  [ItemCategory.BEDDING]: "Cama",
} as const;

// Etiquetas para tipos de alimento
export const FEED_TYPE_LABELS = {
  [FeedType.CONCENTRATE]: "Concentrado",
  [FeedType.FORAGE]: "Forraje",
  [FeedType.HAY]: "Heno",
  [FeedType.SILAGE]: "Ensilaje",
  [FeedType.GRAIN]: "Grano",
  [FeedType.PELLETS]: "Pellets",
  [FeedType.MASH]: "Mezcla",
  [FeedType.COMPLETE_FEED]: "Alimento Completo",
  [FeedType.STARTER]: "Iniciador",
  [FeedType.GROWER]: "Crecimiento",
  [FeedType.FINISHER]: "Finalización",
  [FeedType.LACTATING]: "Lactancia",
  [FeedType.DRY]: "Secas",
} as const;

// Etiquetas para tipos de equipo
export const EQUIPMENT_TYPE_LABELS = {
  [EquipmentType.FEEDING]: "Alimentación",
  [EquipmentType.WATERING]: "Agua",
  [EquipmentType.MILKING]: "Ordeño",
  [EquipmentType.HANDLING]: "Manejo",
  [EquipmentType.WEIGHING]: "Pesaje",
  [EquipmentType.MEDICAL]: "Médico",
  [EquipmentType.REPRODUCTION]: "Reproducción",
  [EquipmentType.MONITORING]: "Monitoreo",
  [EquipmentType.TRANSPORTATION]: "Transporte",
  [EquipmentType.FENCING]: "Cercado",
  [EquipmentType.SHELTER]: "Refugio",
} as const;

// Etiquetas para etapas de vida
export const LIFESTAGE_LABELS = {
  [Lifestage.CALF]: "Ternero",
  [Lifestage.WEANER]: "Destete",
  [Lifestage.GROWING]: "Crecimiento",
  [Lifestage.BREEDING]: "Reproducción",
  [Lifestage.LACTATING]: "Lactancia",
  [Lifestage.DRY]: "Secas",
  [Lifestage.FINISHING]: "Finalización",
  [Lifestage.MATURE]: "Maduras",
} as const;

// Etiquetas para unidades de medida
export const MEASUREMENT_UNIT_LABELS = {
  [MeasurementUnit.KILOGRAMS]: "Kilogramos",
  [MeasurementUnit.GRAMS]: "Gramos",
  [MeasurementUnit.POUNDS]: "Libras",
  [MeasurementUnit.OUNCES]: "Onzas",
  [MeasurementUnit.LITERS]: "Litros",
  [MeasurementUnit.MILLILITERS]: "Mililitros",
  [MeasurementUnit.GALLONS]: "Galones",
  [MeasurementUnit.PIECES]: "Piezas",
  [MeasurementUnit.BOXES]: "Cajas",
  [MeasurementUnit.BAGS]: "Bolsas",
  [MeasurementUnit.BOTTLES]: "Botellas",
  [MeasurementUnit.VIALS]: "Viales",
  [MeasurementUnit.DOSES]: "Dosis",
} as const;

// Colores para categorías (para UI)
export const ITEM_CATEGORY_COLORS = {
  [ItemCategory.MEDICATIONS]: {
    background: "#fef3c7",
    border: "#f59e0b",
    text: "#d97706",
  },
  [ItemCategory.VACCINES]: {
    background: "#dcfce7",
    border: "#22c55e",
    text: "#15803d",
  },
  [ItemCategory.FEED]: {
    background: "#fdf4ff",
    border: "#d946ef",
    text: "#c026d3",
  },
  [ItemCategory.SUPPLEMENTS]: {
    background: "#f0f9ff",
    border: "#0ea5e9",
    text: "#0284c7",
  },
  [ItemCategory.EQUIPMENT]: {
    background: "#f3f4f6",
    border: "#6b7280",
    text: "#374151",
  },
  [ItemCategory.SUPPLIES]: {
    background: "#ecfdf5",
    border: "#10b981",
    text: "#059669",
  },
} as const;

// Iconos para categorías (usando nombres de iconos de Lucide)
export const ITEM_CATEGORY_ICONS = {
  [ItemCategory.MEDICATIONS]: "pill",
  [ItemCategory.VACCINES]: "syringe",
  [ItemCategory.FEED]: "wheat",
  [ItemCategory.SUPPLEMENTS]: "flask-conical",
  [ItemCategory.EQUIPMENT]: "wrench",
  [ItemCategory.SUPPLIES]: "package",
  [ItemCategory.TOOLS]: "hammer",
  [ItemCategory.SAFETY]: "shield",
  [ItemCategory.CLEANING]: "spray-can",
  [ItemCategory.REPRODUCTION]: "heart",
  [ItemCategory.IDENTIFICATION]: "tag",
  [ItemCategory.BEDDING]: "bed",
} as const;

// Subcategorías predefinidas por categoría principal
export const SUBCATEGORIES_BY_CATEGORY = {
  [ItemCategory.MEDICATIONS]: [
    "Antibióticos",
    "Antiinflamatorios",
    "Analgésicos",
    "Antiparasitarios",
    "Hormonas",
    "Vitaminas Inyectables",
    "Antisépticos",
    "Otros Medicamentos",
  ],
  [ItemCategory.VACCINES]: [
    "Virales",
    "Bacterianas",
    "Combinadas",
    "Reproductivas",
    "Respiratorias",
    "Digestivas",
    "Otras Vacunas",
  ],
  [ItemCategory.FEED]: [
    "Concentrados",
    "Forrajes",
    "Granos",
    "Heno",
    "Ensilaje",
    "Alimentos Completos",
    "Iniciadores",
    "Finalizadores",
  ],
  [ItemCategory.SUPPLEMENTS]: [
    "Vitaminas",
    "Minerales",
    "Probióticos",
    "Energéticos",
    "Proteicos",
    "Electrolitos",
    "Otros Suplementos",
  ],
  [ItemCategory.EQUIPMENT]: [
    "Alimentación",
    "Agua",
    "Ordeño",
    "Manejo",
    "Pesaje",
    "Médico",
    "Transporte",
    "Monitoreo",
  ],
  [ItemCategory.SUPPLIES]: [
    "Material Médico",
    "Jeringas y Agujas",
    "Vendajes",
    "Desinfectantes",
    "Identificación",
    "Seguridad",
    "Limpieza",
    "Otros Suministros",
  ],
} as const;

// Función helper para obtener items por categoría
export const getItemsByCategory = (
  items: BaseItem[],
  category: ItemCategory
): BaseItem[] => {
  return items.filter((item) => item.category === category);
};

// Función helper para filtrar items por múltiples categorías
export const getItemsByCategories = (
  items: BaseItem[],
  categories: ItemCategory[]
): BaseItem[] => {
  return items.filter((item) => categories.includes(item.category));
};

// Función helper para buscar items
export const searchItems = (
  items: BaseItem[],
  searchTerm: string
): BaseItem[] => {
  const term = searchTerm.toLowerCase();
  return items.filter(
    (item) =>
      item.name.toLowerCase().includes(term) ||
      item.description?.toLowerCase().includes(term) ||
      item.brand?.toLowerCase().includes(term) ||
      item.manufacturer?.toLowerCase().includes(term) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(term))
  );
};
