// =================================================================
// COMPONENTE PRINCIPAL - ROUTER DEL MÓDULO
// =================================================================
export { default as HealthPage } from "./HealthPage";
export { default as default } from "./HealthPage";

// =================================================================
// COMPONENTES DE DASHBOARD Y NAVEGACIÓN
// =================================================================
export { default as HealthDashboard } from "./HealthDashboard";

// =================================================================
// COMPONENTES DE VACUNACIÓN Y PROGRAMACIÓN
// =================================================================
export { default as VaccinationRecords } from "./VaccinationRecords";
export { default as VaccineScheduler } from "./VaccineScheduler";

// =================================================================
// COMPONENTES DE HISTORIAL Y TRATAMIENTOS
// =================================================================
export { default as MedicalHistory } from "./MedicalHistory";
export { default as TreatmentPlans } from "./TreatmentPlans";

// =================================================================
// COMPONENTES DE SEGUIMIENTO Y CONTROL
// =================================================================
export { default as DiseaseTracking } from "./DiseaseTracking";
export { default as ParasiteParatrol } from "./ParasiteParatrol";

// =================================================================
// COMPONENTES DE INVENTARIO Y GESTIÓN
// =================================================================
export { default as MedicationInventory } from "./MedicationInventory";

// =================================================================
// COMPONENTES DE REPORTES Y ANÁLISIS
// =================================================================
export { default as HealthReports } from "./HealthReports";
export { default as PostMortemReports } from "./PostMortemReports";

// =================================================================
// COMPONENTES DE SALUD REPRODUCTIVA
// =================================================================
export { default as ReproductiveHealth } from "./ReproductiveHealth";

// =================================================================
// TIPOS Y INTERFACES DEL MÓDULO HEALTH
// =================================================================
// Re-exportar tipos importantes para uso externo

// Tipos de vacunación
export interface HealthVaccinationRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  vaccineName: string;
  manufacturer: string;
  batchNumber: string;
  expirationDate: Date;
  administrationDate: Date;
  dose: string;
  cost: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: "completed" | "scheduled" | "overdue" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

// Tipos de programación de vacunas
export interface HealthVaccinationSchedule {
  id: string;
  bovineId: string;
  bovineName: string;
  bovineTag: string;
  vaccineId: string;
  vaccineName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "scheduled" | "completed" | "overdue" | "cancelled" | "rescheduled";
  doseNumber: number;
  totalDoses: number;
  cost: number;
  priority: "low" | "medium" | "high" | "urgent";
  createdAt: string;
  updatedAt: string;
}

// Tipos de historial médico
export interface HealthMedicalRecord {
  id: string;
  animalId: string;
  animalName: string;
  date: Date;
  type: "examination" | "treatment" | "vaccination" | "illness" | "injury";
  description: string;
  veterinarian: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  cost: number;
  followUpRequired: boolean;
  followUpDate?: Date;
  status: "active" | "resolved" | "ongoing";
  attachments?: string[];
  notes?: string;
}

// Tipos de tratamientos
export interface HealthTreatmentPlan {
  id: string;
  animalId: string;
  animalName: string;
  condition: string;
  startDate: Date;
  endDate?: Date;
  status: "planned" | "active" | "completed" | "cancelled";
  veterinarian: string;
  medications: HealthMedication[];
  instructions: string[];
  cost: number;
  progress: number; // 0-100
  nextCheckup?: Date;
  notes?: string;
}

// Tipos de medicación
export interface HealthMedication {
  id: string;
  name: string;
  type:
    | "antibiotic"
    | "vaccine"
    | "vitamin"
    | "hormone"
    | "antiparasitic"
    | "other";
  dosage: string;
  frequency: string;
  duration: string;
  route: "oral" | "injection" | "topical" | "intravenous";
  cost: number;
  sideEffects?: string[];
  contraindications?: string[];
}

// Tipos de seguimiento de enfermedades
export interface HealthDiseaseRecord {
  id: string;
  animalId: string;
  animalName: string;
  diseaseName: string;
  dateDetected: Date;
  severity: "mild" | "moderate" | "severe" | "critical";
  status: "suspected" | "confirmed" | "treated" | "recovered" | "chronic";
  symptoms: string[];
  diagnosis: string;
  treatment?: string;
  veterinarian: string;
  contagious: boolean;
  quarantineRequired: boolean;
  cost: number;
  recoveryDate?: Date;
  notes?: string;
}

// Tipos de control de parásitos
export interface HealthParasiteRecord {
  id: string;
  animalId: string;
  animalName: string;
  parasiteType: "internal" | "external";
  parasiteName: string;
  detectionDate: Date;
  treatment: string;
  treatmentDate: Date;
  veterinarian: string;
  severity: "low" | "medium" | "high";
  status: "detected" | "treating" | "resolved";
  cost: number;
  preventiveMeasures?: string[];
  nextTreatment?: Date;
  notes?: string;
}

// Tipos de salud reproductiva
export interface HealthReproductiveRecord {
  id: string;
  animalId: string;
  animalName: string;
  type: "breeding" | "pregnancy" | "birth" | "fertility_check";
  date: Date;
  status: "normal" | "complications" | "needs_attention";
  veterinarian?: string;
  details: Record<string, any>;
  cost: number;
  nextCheckup?: Date;
  notes?: string;
}

// =================================================================
// ENUMS Y CONSTANTES DEL MÓDULO
// =================================================================
export const HEALTH_MODULE_ROUTES = {
  HOME: "/health",
  VACCINATION_RECORDS: "/health/vaccination-records",
  VACCINE_SCHEDULER: "/health/vaccine-scheduler",
  MEDICAL_HISTORY: "/health/medical-history",
  TREATMENT_PLANS: "/health/treatment-plans",
  DISEASE_TRACKING: "/health/disease-tracking",
  MEDICATION_INVENTORY: "/health/medication-inventory",
  HEALTH_REPORTS: "/health/reports",
  POSTMORTEM_REPORTS: "/health/postmortem",
  REPRODUCTIVE_HEALTH: "/health/reproductive",
  PARASITE_CONTROL: "/health/parasite-control",
} as const;

export const HEALTH_STATUS_TYPES = {
  HEALTHY: "healthy",
  SICK: "sick",
  RECOVERING: "recovering",
  CRITICAL: "critical",
  QUARANTINE: "quarantine",
  UNDER_TREATMENT: "under_treatment",
} as const;

export const VACCINATION_STATUS_TYPES = {
  COMPLETED: "completed",
  SCHEDULED: "scheduled",
  OVERDUE: "overdue",
  CANCELLED: "cancelled",
  RESCHEDULED: "rescheduled",
} as const;

export const TREATMENT_STATUS_TYPES = {
  PLANNED: "planned",
  ACTIVE: "active",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  ON_HOLD: "on_hold",
} as const;

export const MEDICATION_TYPES = {
  ANTIBIOTIC: "antibiotic",
  VACCINE: "vaccine",
  VITAMIN: "vitamin",
  HORMONE: "hormone",
  ANTIPARASITIC: "antiparasitic",
  ANALGESIC: "analgesic",
  ANTI_INFLAMMATORY: "anti_inflammatory",
  OTHER: "other",
} as const;

export const DISEASE_SEVERITY_LEVELS = {
  MILD: "mild",
  MODERATE: "moderate",
  SEVERE: "severe",
  CRITICAL: "critical",
} as const;

export const ADMINISTRATION_ROUTES = {
  ORAL: "oral",
  INJECTION: "injection",
  TOPICAL: "topical",
  INTRAVENOUS: "intravenous",
  INTRAMUSCULAR: "intramuscular",
  SUBCUTANEOUS: "subcutaneous",
  NASAL: "nasal",
} as const;

// =================================================================
// UTILIDADES Y HELPERS DEL MÓDULO
// =================================================================
export const healthUtils = {
  // Función para obtener el color de estado de salud
  getHealthStatusColor: (status: string): string => {
    switch (status) {
      case HEALTH_STATUS_TYPES.HEALTHY:
        return "text-green-600 bg-green-100";
      case HEALTH_STATUS_TYPES.SICK:
        return "text-red-600 bg-red-100";
      case HEALTH_STATUS_TYPES.RECOVERING:
        return "text-yellow-600 bg-yellow-100";
      case HEALTH_STATUS_TYPES.CRITICAL:
        return "text-red-800 bg-red-200";
      case HEALTH_STATUS_TYPES.QUARANTINE:
        return "text-orange-600 bg-orange-100";
      case HEALTH_STATUS_TYPES.UNDER_TREATMENT:
        return "text-blue-600 bg-blue-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  },

  // Función para formatear costos de salud
  formatHealthCost: (cost: number): string => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(cost);
  },

  // Función para calcular días hasta vencimiento
  getDaysUntilExpiration: (expirationDate: Date): number => {
    const now = new Date();
    const expiration = new Date(expirationDate);
    const diffTime = expiration.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Función para validar si una vacuna está vencida
  isVaccineExpired: (expirationDate: Date): boolean => {
    return new Date(expirationDate) < new Date();
  },

  // Función para obtener el texto de prioridad
  getPriorityText: (priority: string): string => {
    switch (priority) {
      case "low":
        return "Baja";
      case "medium":
        return "Media";
      case "high":
        return "Alta";
      case "urgent":
        return "Urgente";
      default:
        return priority;
    }
  },

  // Función para obtener el texto de estado de tratamiento
  getTreatmentStatusText: (status: string): string => {
    switch (status) {
      case TREATMENT_STATUS_TYPES.PLANNED:
        return "Planeado";
      case TREATMENT_STATUS_TYPES.ACTIVE:
        return "Activo";
      case TREATMENT_STATUS_TYPES.COMPLETED:
        return "Completado";
      case TREATMENT_STATUS_TYPES.CANCELLED:
        return "Cancelado";
      case TREATMENT_STATUS_TYPES.ON_HOLD:
        return "En Pausa";
      default:
        return status;
    }
  },

  // Función para calcular el progreso de tratamiento
  calculateTreatmentProgress: (startDate: Date, endDate?: Date): number => {
    if (!endDate) return 0;

    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 0;
    if (now > end) return 100;

    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    return Math.round((elapsed / totalDuration) * 100);
  },
};

// =================================================================
// METADATOS DEL MÓDULO
// =================================================================
export const HEALTH_MODULE_INFO = {
  name: "Health Management",
  version: "1.0.0",
  description: "Módulo completo de gestión de salud animal para ganado bovino",
  components: [
    "HealthPage",
    "HealthDashboard",
    "VaccinationRecords",
    "VaccineScheduler",
    "MedicalHistory",
    "TreatmentPlans",
    "DiseaseTracking",
    "MedicationInventory",
    "HealthReports",
    "PostMortemReports",
    "ReproductiveHealth",
    "ParasiteParatrol",
  ],
  features: [
    "Registros de vacunación con geolocalización",
    "Programación automática de vacunas",
    "Historial médico completo",
    "Planes de tratamiento personalizados",
    "Seguimiento de enfermedades",
    "Control de inventario de medicamentos",
    "Reportes de salud detallados",
    "Análisis post-mortem",
    "Gestión de salud reproductiva",
    "Control de parásitos",
    "Dashboard con métricas en tiempo real",
    "Sistema de alertas y notificaciones",
    "Integración con mapas GPS",
    "Análisis de costos veterinarios",
  ],
  routes: Object.values(HEALTH_MODULE_ROUTES),
  lastUpdated: "2025-07-12",
  author: "Bovino UJAT System",
  license: "Proprietary",
} as const;

// =================================================================
// TIPOS DE CONFIGURACIÓN DEL MÓDULO
// =================================================================
export interface HealthModuleConfig {
  enableGPS: boolean;
  enableNotifications: boolean;
  defaultCurrency: "MXN" | "USD";
  autoSaveInterval: number; // en minutos
  enableOfflineMode: boolean;
  maxFileUploadSize: number; // en MB
  supportedImageFormats: string[];
  defaultVeterinarianId?: string;
  enableCostTracking: boolean;
  enableReports: boolean;
  enableExport: boolean;
  themeMode: "light" | "dark" | "system";
}

// Configuración por defecto del módulo
export const DEFAULT_HEALTH_CONFIG: HealthModuleConfig = {
  enableGPS: true,
  enableNotifications: true,
  defaultCurrency: "MXN",
  autoSaveInterval: 5,
  enableOfflineMode: false,
  maxFileUploadSize: 10,
  supportedImageFormats: ["jpg", "jpeg", "png", "pdf"],
  enableCostTracking: true,
  enableReports: true,
  enableExport: true,
  themeMode: "system",
};

// =================================================================
// EXPORTACIONES DE TIPOS PARA COMPATIBILIDAD
// =================================================================
export type {
  HealthVaccinationRecord as VaccinationRecord,
  HealthVaccinationSchedule as VaccinationSchedule,
  HealthMedicalRecord as MedicalRecord,
  HealthTreatmentPlan as TreatmentPlan,
  HealthMedication as Medication,
  HealthDiseaseRecord as DiseaseRecord,
  HealthParasiteRecord as ParasiteRecord,
  HealthReproductiveRecord as ReproductiveRecord,
  HealthModuleConfig as ModuleConfig,
};
