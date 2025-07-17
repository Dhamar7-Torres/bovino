// index.ts
// Archivo de exportación principal del módulo de reproducción
// Centraliza todas las exportaciones para facilitar las importaciones

// =================================================================
// COMPONENTES PRINCIPALES DEL MÓDULO
// =================================================================

// Página principal y enrutamiento
export { default as ReproductionPage } from './ReproductionPage';
export { default as ReproductionDashboard } from './ReproductionDashboard';

// Gestión de apareamientos y servicios reproductivos
export { default as MatingRecords } from './MatingRecords';
export { default as ArtificialInsemination } from './ArtificialInsemination';

// Seguimiento de gestación y nacimientos
export { default as PregnancyTracking } from './PregnancyTracking';
export { default as BirthRecords } from './BirthRecords';

// Gestión de animales reproductores
export { default as BullManagement } from './BullManagement';
export { default as CowManagement } from './CowManagement';

// =================================================================
// TIPOS E INTERFACES COMPARTIDAS
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
  vaccinations: {
    date: string;
    vaccine: string;
    batch: string;
    nextDue: string;
  }[];
  treatments: {
    date: string;
    condition: string;
    treatment: string;
    veterinarian: string;
  }[];
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
  currentLocation: LocationData & {
    environment: "field" | "barn" | "breeding_facility";
  };
  healthStatus: "excellent" | "good" | "fair" | "poor" | "quarantine";
  reproductiveStatus: "active" | "resting" | "retired" | "testing";
  genetics: GeneticInfo;
  performance: {
    totalMating: number;
    successfulMating: number;
    offspring: number;
    pregnancyRate: number;
    lastMatingDate?: string;
  };
  health: HealthInfo & {
    bodyConditionScore: number; // 1-5 scale
  };
  nutrition: NutritionInfo;
  acquisition: AcquisitionInfo;
  notes: string;
  photos: string[];
}

// Interface completa para vacas reproductoras
export interface Cow extends BaseAnimal {
  currentLocation: LocationData & {
    facility: string;
  };
  healthStatus: "excellent" | "good" | "fair" | "poor" | "sick";
  reproductiveStatus: "maiden" | "pregnant" | "lactating" | "dry" | "open" | "retired";
  genetics: GeneticInfo;
  reproductiveHistory: {
    totalPregnancies: number;
    liveCalves: number;
    lastCalvingDate?: string;
    lastBreedingDate?: string;
    estrus: {
      lastCycle: string;
      cycleLength: number; // days
      irregular: boolean;
    };
    conception: {
      attempts: number;
      averageAttempts: number;
      conceptionRate: number; // percentage
    };
  };
  lactation: {
    isLactating: boolean;
    lactationNumber: number;
    startDate?: string;
    peakMilk?: number; // liters per day
    currentMilk?: number; // liters per day
    totalMilk?: number; // liters total
    dryOffDate?: string;
  };
  health: HealthInfo & {
    bodyConditionScore: number; // 1-5 scale
  };
  nutrition: NutritionInfo;
  acquisition: AcquisitionInfo;
  currentPregnancy?: {
    bullId: string;
    bullName: string;
    breedingDate: string;
    confirmationDate: string;
    expectedCalvingDate: string;
    gestationDay: number;
  };
  notes: string;
  photos: string[];
}

// Interface para registros de apareamiento
export interface MatingRecord {
  id: string;
  bullId: string;
  bullName: string;
  bullEarTag: string;
  cowId: string;
  cowName: string;
  cowEarTag: string;
  matingDate: string;
  matingTime: string;
  location: LocationData & {
    environment: "field" | "barn" | "breeding_facility";
  };
  matingType: "natural" | "artificial_insemination" | "embryo_transfer" | "synchronized";
  method: "cervical" | "intrauterine" | "laparoscopic" | "direct";
  estrusDetection: {
    detected: boolean;
    detectionDate?: string;
    detectionTime?: string;
    intensity: "weak" | "moderate" | "strong";
    signs: string[];
    detectedBy: string;
  };
  semenInformation?: {
    batch: string;
    provider: string;
    quality: "excellent" | "good" | "fair";
    motility: number; // percentage
    concentration: number; // millions per ml
    storageCondition: string;
    thawingTime?: string;
  };
  technicalDetails: {
    assistedBy: {
      id: string;
      name: string;
      role: "veterinarian" | "technician" | "inseminator" | "staff";
      certification?: string;
    };
    procedure: {
      startTime: string;
      endTime: string;
      duration: number; // minutes
      difficulty: "easy" | "moderate" | "difficult";
      equipment: string[];
    };
    animalCondition: {
      bullCondition?: "excellent" | "good" | "fair" | "poor";
      cowCondition: "excellent" | "good" | "fair" | "poor";
      cowReceptivity: "very_receptive" | "receptive" | "reluctant" | "resistant";
      stressLevel: "low" | "moderate" | "high";
    };
  };
  followUp: {
    pregnancyTestScheduled: boolean;
    pregnancyTestDate?: string;
    pregnancyTestMethod?: "palpation" | "ultrasound" | "blood_test";
    pregnancyResult?: "pregnant" | "not_pregnant" | "questionable";
    pregnancyConfirmDate?: string;
    expectedCalvingDate?: string;
    repeatBreeding?: {
      scheduled: boolean;
      nextDate?: string;
      reason: string;
    };
  };
  economicData: {
    procedureCost: number;
    semenCost: number;
    laborCost: number;
    equipmentCost: number;
    totalCost: number;
    expectedROI: number;
  };
  weatherConditions: {
    temperature: number; // celsius
    humidity: number; // percentage
    weather: "sunny" | "cloudy" | "rainy" | "windy";
    conditions: "optimal" | "acceptable" | "poor";
  };
  complications: string[];
  successProbability: number; // percentage
  notes: string;
  photos: string[];
  documents: string[];
  status: "completed" | "pending_result" | "successful" | "failed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

// Interface para seguimiento de embarazos
export interface PregnancyRecord {
  id: string;
  cowId: string;
  cowName: string;
  cowEarTag: string;
  cowAge: number;
  cowWeight: number;
  bullId?: string;
  bullName?: string;
  bullEarTag?: string;
  breedingDate: string;
  breedingType: "natural" | "artificial_insemination" | "embryo_transfer" | "synchronized";
  confirmationDate: string;
  confirmationMethod: "palpation" | "ultrasound" | "blood_test" | "hormone_test";
  gestationDay: number;
  gestationWeek: number;
  expectedCalvingDate: string;
  currentStatus: "early" | "mid" | "late" | "overdue" | "aborted" | "completed";
  pregnancyNumber: number; // número de embarazo de la vaca
  location: LocationData & {
    facility: string;
  };
  healthMonitoring: {
    lastCheckupDate: string;
    veterinarian: string;
    bodyConditionScore: number; // escala 1-5
    weight: number;
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    appetite: "excellent" | "good" | "fair" | "poor";
    mobility: "normal" | "reduced" | "limited" | "immobile";
  };
  ultrasoundExams: {
    date: string;
    gestationDay: number;
    fetalHeartbeat: boolean;
    fetalMovement: boolean;
    fetalSize: string; // mm or cm
    placentalCondition: "normal" | "calcification" | "detachment" | "infection";
    amnioticFluid: "normal" | "oligohydramnios" | "polyhydramnios";
    fetalPosition: "normal" | "breech" | "transverse" | "abnormal";
    veterinarian: string;
    images: string[];
    notes: string;
  }[];
  nutritionPlan: {
    currentDiet: string;
    dailyFeed: number; // kg
    supplements: string[];
    waterIntake: number; // liters
    specialRequirements: string[];
    lastUpdate: string;
  };
  vaccination: {
    preBreedingVaccines: {
      vaccine: string;
      date: string;
      batch: string;
    }[];
    pregnancyVaccines: {
      vaccine: string;
      date: string;
      batch: string;
      gestationDay: number;
    }[];
    nextDue: {
      vaccine: string;
      dueDate: string;
    }[];
  };
  complications: {
    date: string;
    type: "bleeding" | "infection" | "metabolic" | "behavioral" | "nutritional" | "other";
    severity: "mild" | "moderate" | "severe" | "critical";
    description: string;
    treatment: string;
    veterinarian: string;
    resolved: boolean;
    resolutionDate?: string;
  }[];
  alerts: {
    id: string;
    type: "checkup_due" | "vaccination_due" | "calving_approaching" | "complication" | "overdue";
    priority: "low" | "medium" | "high" | "critical";
    message: string;
    date: string;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedDate?: string;
  }[];
  calvingPreparation: {
    calvingPenReady: boolean;
    calvingKitPrepared: boolean;
    veterinarianOnCall: boolean;
    emergencyContactsNotified: boolean;
    calvingWatchSchedule: {
      date: string;
      timeSlots: {
        start: string;
        end: string;
        responsible: string;
      }[];
    }[];
    estimatedCalfWeight: number;
    potentialComplications: string[];
  };
  economicProjection: {
    totalCosts: {
      feed: number;
      veterinary: number;
      supplements: number;
      facilities: number;
      labor: number;
    };
    expectedValue: {
      calfValue: number;
      milkProductionIncrease: number;
      breedingValue: number;
    };
    roi: number;
  };
  milestones: {
    date: string;
    gestationDay: number;
    milestone: string;
    completed: boolean;
    notes?: string;
  }[];
  documents: {
    type: "ultrasound" | "blood_test" | "veterinary_report" | "breeding_certificate" | "other";
    filename: string;
    uploadDate: string;
    description: string;
  }[];
  notes: string;
  photos: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface para registros de nacimientos
export interface BirthRecord {
  id: string;
  motherId: string;
  motherName: string;
  motherEarTag: string;
  fatherId?: string;
  fatherName?: string;
  calfId: string;
  calfName: string;
  calfEarTag: string;
  birthDate: string;
  birthTime: string;
  location: LocationData;
  birthType: "natural" | "assisted" | "cesarean" | "emergency";
  gender: "male" | "female";
  birthWeight: number; // kg
  currentWeight?: number; // kg
  healthStatus: "excellent" | "good" | "fair" | "poor" | "critical";
  complications: string[];
  assistedBy: {
    id: string;
    name: string;
    role: "veterinarian" | "technician" | "owner" | "staff";
  };
  deliveryDuration: number; // minutes
  placentaExpelled: boolean;
  placentaExpelledTime?: string;
  colostrum: {
    received: boolean;
    timeReceived?: string;
    source: "mother" | "substitute" | "frozen";
  };
  identification: {
    earTagApplied: boolean;
    earTagNumber?: string;
    tattoo?: string;
    microchip?: string;
  };
  vaccinations: {
    date: string;
    vaccine: string;
    batch: string;
  }[];
  notes: string;
  photos: string[];
  cost: number;
  expectedDueDate?: string;
  gestationPeriod: number; // days
  previousCalves: number;
  createdAt: string;
  updatedAt: string;
}

// =================================================================
// TIPOS PARA FILTROS Y BÚSQUEDAS
// =================================================================

// Filtros base para todos los módulos
export interface BaseFilters {
  dateRange: {
    start: string;
    end: string;
  };
  searchTerm: string;
}

// Filtros específicos para apareamientos
export interface MatingFilters extends BaseFilters {
  matingType: string[];
  status: string[];
  pregnancyResult: string[];
  bullId: string;
  cowId: string;
  assistedBy: string[];
  location: string[];
}

// Filtros específicos para embarazos
export interface PregnancyFilters {
  status: string[];
  gestationStage: string[];
  pregnancyNumber: string[];
  veterinarian: string[];
  dueRange: {
    start: string;
    end: string;
  };
  location: string[];
  complications: boolean;
  searchTerm: string;
}

// Filtros específicos para nacimientos
export interface BirthFilters extends BaseFilters {
  birthType: string[];
  gender: string[];
  healthStatus: string[];
  assistedBy: string[];
  weightRange: {
    min: number;
    max: number;
  };
}

// Filtros específicos para toros
export interface BullFilters {
  breed: string[];
  healthStatus: string[];
  reproductiveStatus: string[];
  ageRange: {
    min: number;
    max: number;
  };
  weightRange: {
    min: number;
    max: number;
  };
  location: string[];
  searchTerm: string;
  activeOnly: boolean;
}

// Filtros específicos para vacas
export interface CowFilters {
  breed: string[];
  healthStatus: string[];
  reproductiveStatus: string[];
  ageRange: {
    min: number;
    max: number;
  };
  weightRange: {
    min: number;
    max: number;
  };
  lactationStatus: string[];
  location: string[];
  searchTerm: string;
  activeOnly: boolean;
}

// =================================================================
// TIPOS PARA ESTADÍSTICAS Y DASHBOARD
// =================================================================

// Estadísticas generales del módulo
export interface ReproductionStats {
  totalAnimals: {
    bulls: number;
    cows: number;
    total: number;
  };
  breeding: {
    totalMatings: number;
    successfulMatings: number;
    pendingResults: number;
    successRate: number;
  };
  pregnancies: {
    totalPregnant: number;
    earlyStage: number;
    midStage: number;
    lateStage: number;
    dueThisWeek: number;
    dueThisMonth: number;
    averageGestationDay: number;
  };
  births: {
    totalBirths: number;
    thisMonth: number;
    maleCalves: number;
    femaleCalves: number;
    averageBirthWeight: number;
    naturalBirths: number;
    assistedBirths: number;
  };
  artificialInsemination: {
    totalProcedures: number;
    successfulProcedures: number;
    successRate: number;
    thisMonth: number;
  };
  health: {
    totalAlerts: number;
    criticalAlerts: number;
    vaccinationsDue: number;
    checkupsDue: number;
  };
  economics: {
    totalInvestment: number;
    expectedROI: number;
    averageCostPerMating: number;
    projectedRevenue: number;
  };
}

// Tipos para alertas del sistema
export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  module: string;
  animalId?: string;
  animalName?: string;
}

// Tipos para eventos próximos
export interface UpcomingEvent {
  id: string;
  type: "birth" | "vaccination" | "checkup" | "insemination";
  title: string;
  animalName: string;
  animalId: string;
  date: string;
  daysLeft: number;
  priority: "high" | "medium" | "low";
}

// =================================================================
// TIPOS PARA NAVEGACIÓN Y UI
// =================================================================

// Elementos de navegación
export interface NavigationItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  badge?: number;
  isActive?: boolean;
}

// Acciones rápidas
export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  count?: number;
}

// Estadísticas rápidas para UI
export interface QuickStats {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

// =================================================================
// UTILIDADES Y CONSTANTES
// =================================================================

// Estados de salud disponibles
export const HEALTH_STATUS = {
  EXCELLENT: "excellent" as const,
  GOOD: "good" as const,
  FAIR: "fair" as const,
  POOR: "poor" as const,
  CRITICAL: "critical" as const,
  SICK: "sick" as const,
  QUARANTINE: "quarantine" as const,
} as const;

// Estados reproductivos para toros
export const BULL_REPRODUCTIVE_STATUS = {
  ACTIVE: "active" as const,
  RESTING: "resting" as const,
  RETIRED: "retired" as const,
  TESTING: "testing" as const,
} as const;

// Estados reproductivos para vacas
export const COW_REPRODUCTIVE_STATUS = {
  MAIDEN: "maiden" as const,
  PREGNANT: "pregnant" as const,
  LACTATING: "lactating" as const,
  DRY: "dry" as const,
  OPEN: "open" as const,
  RETIRED: "retired" as const,
} as const;

// Tipos de apareamiento
export const MATING_TYPES = {
  NATURAL: "natural" as const,
  ARTIFICIAL_INSEMINATION: "artificial_insemination" as const,
  EMBRYO_TRANSFER: "embryo_transfer" as const,
  SYNCHRONIZED: "synchronized" as const,
} as const;

// Tipos de parto
export const BIRTH_TYPES = {
  NATURAL: "natural" as const,
  ASSISTED: "assisted" as const,
  CESAREAN: "cesarean" as const,
  EMERGENCY: "emergency" as const,
} as const;

// Estados de gestación
export const PREGNANCY_STATUS = {
  EARLY: "early" as const,
  MID: "mid" as const,
  LATE: "late" as const,
  OVERDUE: "overdue" as const,
  ABORTED: "aborted" as const,
  COMPLETED: "completed" as const,
} as const;

// Métodos de confirmación de embarazo
export const PREGNANCY_CONFIRMATION_METHODS = {
  PALPATION: "palpation" as const,
  ULTRASOUND: "ultrasound" as const,
  BLOOD_TEST: "blood_test" as const,
  HORMONE_TEST: "hormone_test" as const,
} as const;

// =================================================================
// FUNCIONES UTILIDADES
// =================================================================

// Función para calcular edad en años
export const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1;
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
  const today = new Date();
  const calvingDate = new Date(expectedDate);
  const diffTime = calvingDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

// Función para formatear moneda
export const formatCurrency = (amount: number, currency: string = "MXN"): string => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Función para formatear fecha
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Función para formatear fecha relativa
export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 1) return "Hace menos de una hora";
  if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
};

// =================================================================
// EXPORTACIÓN POR DEFECTO
// =================================================================

// Exportación del módulo completo como objeto
const ReproductionModule = {
  // Componentes
  ReproductionPage: () => import('./ReproductionPage'),
  ReproductionDashboard: () => import('./ReproductionDashboard'),
  MatingRecords: () => import('./MatingRecords'),
  ArtificialInsemination: () => import('./ArtificialInsemination'),
  PregnancyTracking: () => import('./PregnancyTracking'),
  BirthRecords: () => import('./BirthRecords'),
  BullManagement: () => import('./BullManagement'),
  CowManagement: () => import('./CowManagement'),
  
  // Utilidades
  utils: {
    calculateAge,
    calculateGestationDays,
    calculateDaysToCalving,
    formatCurrency,
    formatDate,
    formatRelativeDate,
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
  },
};

export default ReproductionModule;