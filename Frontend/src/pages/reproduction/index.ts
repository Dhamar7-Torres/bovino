// index.ts
// Archivo de exportación principal del módulo de reproducción
// Centraliza todas las exportaciones para facilitar las importaciones

// =================================================================
// INFORMACIÓN DEL MÓDULO
// =================================================================

/**
 * MÓDULO DE REPRODUCCIÓN - SISTEMA BOVINO UJAT
 * 
 * Sistema integral de gestión reproductiva ganadera
 * Desarrollado para la Universidad Juárez Autónoma de Tabasco (UJAT)
 * 
 * @version 2.1.0
 * @author UJAT - Sistema de Gestión Ganadera
 * @description Control completo del programa reproductivo bovino
 */

// =================================================================
// COMPONENTES PRINCIPALES DEL MÓDULO
// =================================================================

// Página principal y enrutamiento
export { default as ReproductionPage } from './ReproductionPage';

// Gestión de animales reproductores - DESARROLLADOS
export { default as BullManagement } from './BullManagement';
export { default as CowManagement } from './CowManagement';

// Gestión de apareamientos y servicios reproductivos - POR DESARROLLAR
export { default as MatingRecords } from './MatingRecords';
export { default as ArtificialInsemination } from './ArtificialInsemination';

// Seguimiento de gestación y nacimientos - POR DESARROLLAR
export { default as PregnancyTracking } from './PregnancyTracking';
export { default as BirthRecords } from './BirthRecords';


// =================================================================
// EXPORTACIONES ALTERNATIVAS PARA FLEXIBILIDAD
// =================================================================

// Alias alternativos para importación más semántica
export { default as ReproductionRouter } from './ReproductionPage';
export { default as ToromanagementGestion } from './BullManagement';
export { default as VacasGestion } from './CowManagement';

// Exportaciones por categorías
export { default as GestionToros } from './BullManagement';
export { default as GestionVacas } from './CowManagement';
export { default as RegistroEmpadre } from './MatingRecords';
export { default as InseminacionArtificial } from './ArtificialInsemination';
export { default as SeguimientoEmbarazo } from './PregnancyTracking';
export { default as RegistroNacimientos } from './BirthRecords';

// =================================================================
// TIPOS E INTERFACES PRINCIPALES
// =================================================================

// Tipos base para animales reproductores
export interface BaseAnimal {
  id: string;
  name: string;
  earTag: string;
  registrationNumber?: string;
  breed: string;
  birthDate: string;
  weight: number;
  height?: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipos para ubicación geográfica
export interface LocationData {
  lat: number;
  lng: number;
  address: string;
  paddock: string;
  facility?: string;
  environment?: "field" | "barn" | "breeding_facility";
}

// Tipos para información genética
export interface GeneticInfo {
  sireId?: string;
  sireName?: string;
  damId?: string;
  damName?: string;
  genealogy: string[];
}

// Tipos para información de salud
export interface HealthInfo {
  lastCheckupDate: string;
  veterinarian: string;
  bodyConditionScore?: number; // 1-5 scale
  vaccinations: VaccinationRecord[];
  treatments: TreatmentRecord[];
}

// Registro de vacunación
export interface VaccinationRecord {
  date: string;
  vaccine: string;
  batch: string;
  nextDue: string;
  veterinarian?: string;
}

// Registro de tratamiento
export interface TreatmentRecord {
  date: string;
  condition: string;
  treatment: string;
  veterinarian: string;
  followUp?: string;
}

// Tipos para información nutricional
export interface NutritionInfo {
  diet: string;
  dailyFeed: number; // kg
  supplements: string[];
  lastWeightDate: string;
}

// Tipos para información de adquisición
export interface AcquisitionInfo {
  date: string;
  source: string;
  cost: number;
  purpose: "breeding" | "milk_production" | "replacement" | "genetic_improvement";
}

// =================================================================
// INTERFACES ESPECÍFICAS POR MÓDULO
// =================================================================

// Interface completa para toros reproductores
export interface Bull extends BaseAnimal {
  currentLocation: LocationData;
  healthStatus: "excellent" | "good" | "fair" | "poor" | "quarantine";
  reproductiveStatus: "active" | "resting" | "retired" | "testing";
  genetics: GeneticInfo;
  performance: BullPerformance;
  health: HealthInfo;
  nutrition: NutritionInfo;
  acquisition: AcquisitionInfo;
  notes: string;
  photos: string[];
}

// Rendimiento reproductivo del toro
export interface BullPerformance {
  totalMating: number;
  successfulMating: number;
  offspring: number;
  pregnancyRate: number;
  lastMatingDate?: string;
}

// Interface completa para vacas reproductoras
export interface Cow extends BaseAnimal {
  currentLocation: LocationData;
  healthStatus: "excellent" | "good" | "fair" | "poor" | "sick";
  reproductiveStatus: "maiden" | "pregnant" | "lactating" | "dry" | "open" | "retired";
  genetics: GeneticInfo;
  reproductiveHistory: CowReproductiveHistory;
  lactation: LactationInfo;
  health: HealthInfo;
  nutrition: NutritionInfo;
  acquisition: AcquisitionInfo;
  currentPregnancy?: PregnancyInfo;
  notes: string;
  photos: string[];
}

// Historial reproductivo de la vaca
export interface CowReproductiveHistory {
  totalPregnancies: number;
  liveCalves: number;
  lastCalvingDate?: string;
  lastBreedingDate?: string;
  estrus: EstrusInfo;
  conception: ConceptionInfo;
}

// Información de estro
export interface EstrusInfo {
  lastCycle: string;
  cycleLength: number; // days
  irregular: boolean;
}

// Información de concepción
export interface ConceptionInfo {
  attempts: number;
  averageAttempts: number;
  conceptionRate: number; // percentage
}

// Información de lactancia
export interface LactationInfo {
  isLactating: boolean;
  lactationNumber: number;
  startDate?: string;
  peakMilk?: number; // liters per day
  currentMilk?: number; // liters per day
  totalMilk?: number; // liters total
  dryOffDate?: string;
}

// Información de gestación actual
export interface PregnancyInfo {
  bullId: string;
  bullName: string;
  breedingDate: string;
  confirmationDate: string;
  expectedCalvingDate: string;
  gestationDay: number;
}

// Interface para registros de empadre
export interface MatingRecord {
  id: string;
  bullId: string;
  bullName: string;
  cowId: string;
  cowName: string;
  cowEarTag: string;
  matingDate: string;
  matingTime: string;
  location: LocationData;
  matingType: "natural" | "artificial" | "embryo_transfer";
  estrusDetected: boolean;
  estrusDate?: string;
  assistedBy: PersonnelInfo;
  pregnancyTestDate?: string;
  pregnancyResult?: "pregnant" | "not_pregnant" | "pending";
  expectedBirthDate?: string;
  actualBirthDate?: string;
  offspring?: OffspringInfo[];
  observations: string;
  weatherConditions?: string;
  temperature?: number;
  success: boolean;
  costs: MatingCosts;
  followUp: FollowUpInfo;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Información de personal
export interface PersonnelInfo {
  id: string;
  name: string;
  role: string;
  contactInfo?: string;
}

// Información de cría
export interface OffspringInfo {
  id: string;
  earTag: string;
  sex: "male" | "female";
  weight: number;
  healthStatus: string;
  alive: boolean;
}

// Costos de apareamiento
export interface MatingCosts {
  veterinary: number;
  medication: number;
  equipment: number;
  total: number;
}

// Información de seguimiento
export interface FollowUpInfo {
  checkDates: string[];
  veterinarian: string;
  notes: string[];
}

// Interface para registros de enmadre (maternidad)
export interface MotherhoodRecord {
  id: string;
  cowId: string;
  cowName: string;
  cowEarTag: string;
  bullId?: string;
  bullName?: string;
  breedingDate: string;
  breedingType: "natural" | "artificial" | "embryo_transfer";
  pregnancyConfirmDate: string;
  gestationPeriod: number; // days
  calvingDate: string;
  calvingTime: string;
  location: LocationData;
  assistedBy: PersonnelInfo;
  calvingType: "natural" | "assisted" | "cesarean" | "emergency";
  complications: string[];
  calf: CalfInfo;
  placentaExpelled: boolean;
  placentaExpelledTime?: string;
  colostrum: ColostrumInfo;
  postCalvingCare: PostCalvingCare;
  lactationStart: LactationStart;
  economicImpact: EconomicImpact;
  notes: string;
  success: boolean;
  createdAt: string;
  updatedAt: string;
}

// Información de cría/becerro
export interface CalfInfo {
  id: string;
  name: string;
  earTag: string;
  gender: "male" | "female";
  birthWeight: number;
  healthStatus: "excellent" | "good" | "fair" | "poor" | "critical";
  alive: boolean;
}

// Información de calostro
export interface ColostrumInfo {
  received: boolean;
  quality: "excellent" | "good" | "fair" | "poor";
  timeReceived?: string;
}

// Cuidados post-parto
export interface PostCalvingCare {
  vitamins: boolean;
  antibiotics: boolean;
  monitoring: string[];
}

// Inicio de lactancia
export interface LactationStart {
  date: string;
  initialMilk: number; // liters
}

// Impacto económico
export interface EconomicImpact {
  calvingCost: number;
  veterinaryCost: number;
  expectedValue: number;
}

// =================================================================
// TIPOS PARA FILTROS Y BÚSQUEDAS
// =================================================================

// Filtros para toros
export interface BullFilters {
  searchTerm: string;
  breed: string[];
  healthStatus: string[];
  reproductiveStatus: string[];
  ageRange: { min: number; max: number };
  weightRange: { min: number; max: number };
  activeOnly: boolean;
}

// Filtros para vacas
export interface CowFilters {
  searchTerm: string;
  breed: string[];
  healthStatus: string[];
  reproductiveStatus: string[];
  ageRange: { min: number; max: number };
  weightRange: { min: number; max: number };
  lactationStatus: string[];
  location: string[];
  activeOnly: boolean;
}

// Filtros para registros de empadre
export interface MatingFilters {
  searchTerm: string;
  dateRange: { start: string; end: string };
  matingType: string[];
  pregnancyResult: string[];
  bullId: string;
  location: string;
  assistedBy: string;
}

// Filtros para registros de enmadre
export interface MotherhoodFilters {
  searchTerm: string;
  dateRange: { start: string; end: string };
  calvingType: string[];
  calfGender: string[];
  calfHealth: string[];
  cowId: string;
  location: string;
  assistedBy: string;
}

// =================================================================
// TIPOS PARA NAVEGACIÓN DEL MÓDULO
// =================================================================

// Tipos para navegación del módulo reproduction
export type ReproductionSection = 'dashboard' | 'bulls' | 'cows' | 'mating' | 'pregnancy' | 'births';

// Interface para elementos de navegación
export interface ReproductionNavigationItem {
  id: ReproductionSection;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  badge?: number;
  isActive?: boolean;
}

// Estadísticas del módulo
export interface ModuleStats {
  totalAnimals: number;
  activeBreedings: number;
  pregnancies: number;
  birthsThisMonth: number;
  alerts: number;
  successRate: number;
  bulls: number;
  cows: number;
  lactatingCows: number;
  avgMilkProduction: number;
}

// Estadísticas rápidas
export interface QuickStats {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

// Actividad reciente
export interface RecentActivity {
  id: string;
  type: "breeding" | "birth" | "pregnancy_test" | "vaccination";
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}

// =================================================================
// CONSTANTES Y ENUMS
// =================================================================

// Estados de salud
export const HEALTH_STATUS = {
  EXCELLENT: "excellent",
  GOOD: "good", 
  FAIR: "fair",
  POOR: "poor",
  QUARANTINE: "quarantine",
  SICK: "sick",
  CRITICAL: "critical",
} as const;

// Estados reproductivos de toros
export const BULL_REPRODUCTIVE_STATUS = {
  ACTIVE: "active",
  RESTING: "resting", 
  RETIRED: "retired",
  TESTING: "testing",
} as const;

// Estados reproductivos de vacas
export const COW_REPRODUCTIVE_STATUS = {
  MAIDEN: "maiden",
  PREGNANT: "pregnant",
  LACTATING: "lactating", 
  DRY: "dry",
  OPEN: "open",
  RETIRED: "retired",
} as const;

// Tipos de apareamiento
export const MATING_TYPES = {
  NATURAL: "natural",
  ARTIFICIAL: "artificial",
  EMBRYO_TRANSFER: "embryo_transfer",
} as const;

// Tipos de parto
export const BIRTH_TYPES = {
  NATURAL: "natural",
  ASSISTED: "assisted",
  CESAREAN: "cesarean", 
  EMERGENCY: "emergency",
} as const;

// Estados de gestación
export const PREGNANCY_STATUS = {
  PREGNANT: "pregnant",
  NOT_PREGNANT: "not_pregnant",
  PENDING: "pending",
} as const;

// Métodos de confirmación de gestación
export const PREGNANCY_CONFIRMATION_METHODS = {
  ULTRASOUND: "ultrasound",
  BLOOD_TEST: "blood_test",
  RECTAL_PALPATION: "rectal_palpation",
  VISUAL_OBSERVATION: "visual_observation",
} as const;

// Razas bovinas comunes
export const CATTLE_BREEDS = {
  HOLSTEIN: "Holstein",
  JERSEY: "Jersey", 
  BRAHMAN: "Brahman",
  ANGUS: "Angus",
  BROWN_SWISS: "Brown Swiss",
  GUZERAT: "Guzerat",
  GYRHOSTEIN: "Gyr-Holstein",
  CEBU: "Cebú",
  CHAROLAIS: "Charolais",
  SIMMENTAL: "Simmental",
} as const;

// =================================================================
// UTILIDADES Y HELPERS
// =================================================================

// Función para calcular edad
export const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Función para calcular días de gestación
export const calculateGestationDays = (breedingDate: string): number => {
  const breeding = new Date(breedingDate);
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - breeding.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Función para calcular días hasta el parto
export const calculateDaysToCalving = (expectedDate: string): number => {
  const expected = new Date(expectedDate);
  const today = new Date();
  const diffTime = expected.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Función para formatear moneda
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(amount);
};

// Función para formatear fechas
export const formatDate = (date: string, format: 'short' | 'long' = 'short'): string => {
  const dateObj = new Date(date);
  
  if (format === 'short') {
    return dateObj.toLocaleDateString('es-MX');
  } else {
    return dateObj.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};

// Función para formatear fechas relativas
export const formatRelativeDate = (date: string): string => {
  const dateObj = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
  const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
  
  if (diffHours < 24) {
    return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
};

// Función para obtener color por estado de salud
export const getHealthStatusColor = (status: string): string => {
  const colors = {
    excellent: "bg-green-100 text-green-800 border-green-200",
    good: "bg-blue-100 text-blue-800 border-blue-200",
    fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
    poor: "bg-orange-100 text-orange-800 border-orange-200",
    sick: "bg-red-100 text-red-800 border-red-200",
    critical: "bg-red-200 text-red-900 border-red-300",
    quarantine: "bg-purple-100 text-purple-800 border-purple-200",
  };
  return colors[status as keyof typeof colors] || colors.fair;
};

// Función para obtener color por estado reproductivo
export const getReproductiveStatusColor = (status: string, isForBull: boolean = false): string => {
  if (isForBull) {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      resting: "bg-blue-100 text-blue-800 border-blue-200",
      retired: "bg-gray-100 text-gray-800 border-gray-200",
      testing: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[status as keyof typeof colors] || colors.active;
  } else {
    const colors = {
      maiden: "bg-purple-100 text-purple-800 border-purple-200",
      pregnant: "bg-pink-100 text-pink-800 border-pink-200",
      lactating: "bg-blue-100 text-blue-800 border-blue-200",
      dry: "bg-yellow-100 text-yellow-800 border-yellow-200",
      open: "bg-green-100 text-green-800 border-green-200",
      retired: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status as keyof typeof colors] || colors.open;
  }
};

// =================================================================
// VALIDACIONES
// =================================================================

// Validar datos de toro
export const validateBullData = (bull: Partial<Bull>): string[] => {
  const errors: string[] = [];
  
  if (!bull.name || bull.name.trim().length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres");
  }
  
  if (!bull.earTag || bull.earTag.trim().length < 2) {
    errors.push("El arete debe tener al menos 2 caracteres");
  }
  
  if (!bull.breed) {
    errors.push("La raza es requerida");
  }
  
  if (!bull.birthDate) {
    errors.push("La fecha de nacimiento es requerida");
  }
  
  if (!bull.weight || bull.weight <= 0) {
    errors.push("El peso debe ser mayor a 0");
  }
  
  return errors;
};

// Validar datos de vaca
export const validateCowData = (cow: Partial<Cow>): string[] => {
  const errors: string[] = [];
  
  if (!cow.name || cow.name.trim().length < 2) {
    errors.push("El nombre debe tener al menos 2 caracteres");
  }
  
  if (!cow.earTag || cow.earTag.trim().length < 2) {
    errors.push("El arete debe tener al menos 2 caracteres");
  }
  
  if (!cow.breed) {
    errors.push("La raza es requerida");
  }
  
  if (!cow.birthDate) {
    errors.push("La fecha de nacimiento es requerida");
  }
  
  if (!cow.weight || cow.weight <= 0) {
    errors.push("El peso debe ser mayor a 0");
  }
  
  return errors;
};

// =================================================================
// VERSIÓN Y METADATOS
// =================================================================

export const REPRODUCTION_MODULE_VERSION = "2.1.0";
export const REPRODUCTION_MODULE_AUTHOR = "UJAT - Universidad Juárez Autónoma de Tabasco";
export const REPRODUCTION_MODULE_DESCRIPTION = 
  "Sistema integral de gestión reproductiva ganadera con control de apareamientos, gestación y nacimientos";
export const REPRODUCTION_MODULE_LAST_UPDATED = "2025-01-17";

// Información del módulo actual
export const CURRENT_MODULE_INFO = {
  name: "Módulo de Reproducción",
  description: "Gestión integral del programa reproductivo bovino",
  version: "2.1.0",
  features: [
    "Gestión de toros reproductores",
    "Gestión de vacas reproductoras", 
    "Registros de apareamiento",
    "Inseminación artificial",
    "Seguimiento de gestación",
    "Registros de nacimientos",
    "Análisis de rendimiento reproductivo",
    "Alertas y notificaciones"
  ],
  developedComponents: [
    "ReproductionPage",
    "BullManagement", 
    "CowManagement"
  ],
  pendingComponents: [
    "MatingRecords",
    "ArtificialInsemination",
    "PregnancyTracking", 
    "BirthRecords",
    "ReproductionDashboard"
  ]
} as const;

// =================================================================
// EXPORTACIÓN POR DEFECTO
// =================================================================

// Exportación del módulo completo como objeto
const ReproductionModule = {
  // Componentes desarrollados
  ReproductionPage: () => import('./ReproductionPage'),
  BullManagement: () => import('./BullManagement'),
  CowManagement: () => import('./CowManagement'),
  
  // Componentes por desarrollar
  MatingRecords: () => import('./MatingRecords'),
  ArtificialInsemination: () => import('./ArtificialInsemination'),
  PregnancyTracking: () => import('./PregnancyTracking'),
  BirthRecords: () => import('./BirthRecords'),
  
  // Utilidades
  utils: {
    calculateAge,
    calculateGestationDays,
    calculateDaysToCalving,
    formatCurrency,
    formatDate,
    formatRelativeDate,
    getHealthStatusColor,
    getReproductiveStatusColor,
    validateBullData,
    validateCowData,
  },
  
  // Constantes
  constants: {
    HEALTH_STATUS,
    BULL_REPRODUCTIVE_STATUS,
    COW_REPRODUCTIVE_STATUS,
    MATING_TYPES,
    BIRTH_TYPES,
    PREGNANCY_STATUS,
    PREGNANCY_CONFIRMATION_METHODS,
    CATTLE_BREEDS,
  },
  
  // Información del módulo
  moduleInfo: CURRENT_MODULE_INFO,
};

export default ReproductionModule;