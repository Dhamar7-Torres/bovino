// Tipos y constantes para eventos de manejo ganadero

export interface BaseEvent {
  id: string;
  bovineId: string;
  eventType: EventType;
  eventDate: Date;
  location: EventLocation;
  performedBy: string; // Nombre de quien realizó el evento
  veterinarianName?: string; // Solo para eventos médicos
  notes?: string;
  attachments?: string[]; // URLs de fotos/documentos
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para ubicación de eventos
export interface EventLocation {
  latitude: number;
  longitude: number;
  address?: string;
  zone?: string; // Nombre de la zona/potrero
  facility?: string; // Corral, manga, etc.
}

// Evento de vacunación
export interface VaccinationEvent extends BaseEvent {
  eventType: EventType.VACCINATION;
  vaccineType: string;
  vaccineName: string;
  dose: string;
  batchNumber: string;
  manufacturer: string;
  nextDueDate?: Date;
  sideEffects?: string[];
  applicationMethod: ApplicationMethod;
  bodyPart: BodyPart; // Parte del cuerpo donde se aplicó
}

// Evento de enfermedad/diagnóstico
export interface IllnessEvent extends BaseEvent {
  eventType: EventType.ILLNESS;
  diseaseName: string;
  symptoms: string[];
  severity: IllnessSeverity;
  isContagious: boolean;
  diagnosisMethod: DiagnosisMethod;
  treatment?: TreatmentInfo;
  recoveryDate?: Date;
  relatedEvents?: string[]; // IDs de eventos relacionados
}

// Evento reproductivo
export interface ReproductiveEvent extends BaseEvent {
  eventType: EventType.REPRODUCTIVE;
  reproductiveType: ReproductiveEventType;
  bullId?: string; // ID del toro usado
  aiTechnicianName?: string; // Técnico en inseminación artificial
  semenBatch?: string;
  expectedCalvingDate?: Date;
  calvingDifficulty?: CalvingDifficulty;
  calfInfo?: CalfInfo;
}

// Evento de transferencia/movimiento
export interface TransferEvent extends BaseEvent {
  eventType: EventType.TRANSFER;
  transferType: TransferType;
  fromLocation: EventLocation;
  toLocation: EventLocation;
  reason: TransferReason;
  transportMethod?: string;
  distance?: number; // en kilómetros
  cost?: number;
  documentation?: string[]; // Documentos de transporte
}

// Evento de manejo general
export interface ManagementEvent extends BaseEvent {
  eventType: EventType.MANAGEMENT;
  managementType: ManagementType;
  previousValue?: string | number;
  newValue?: string | number;
  equipment?: string;
  duration?: number; // duración en minutos
  assistants?: string[]; // Personal auxiliar
}

// Evento de salud general
export interface HealthEvent extends BaseEvent {
  eventType: EventType.HEALTH_CHECK;
  healthType: HealthCheckType;
  vitalSigns?: VitalSigns;
  bodyConditionScore?: number; // 1-9 escala
  findings?: string[];
  recommendations?: string[];
  nextCheckDate?: Date;
}

// Información del ternero en eventos de parto
export interface CalfInfo {
  earTag?: string;
  gender: "male" | "female";
  weight?: number;
  healthStatus: "healthy" | "weak" | "deceased";
  complications?: string[];
}

// Información de tratamiento
export interface TreatmentInfo {
  medication: string;
  dosage: string;
  frequency: string;
  duration: number; // días
  administrationRoute: AdministrationRoute;
  withdrawalPeriod?: number; // días
  cost?: number;
}

// Signos vitales
export interface VitalSigns {
  temperature?: number; // Celsius
  heartRate?: number; // latidos por minuto
  respiratoryRate?: number; // respiraciones por minuto
  weight?: number; // kilogramos
  bodyLength?: number; // centímetros
  chestGirth?: number; // centímetros
}

// Enums para tipos de eventos
export enum EventType {
  VACCINATION = "vaccination",
  ILLNESS = "illness",
  REPRODUCTIVE = "reproductive",
  TRANSFER = "transfer",
  MANAGEMENT = "management",
  HEALTH_CHECK = "health_check",
  FEEDING = "feeding",
  MILKING = "milking",
  PREGNANCY_CHECK = "pregnancy_check",
  BIRTH = "birth",
  DEATH = "death",
}

// Tipos de eventos reproductivos
export enum ReproductiveEventType {
  HEAT_DETECTION = "heat_detection",
  ARTIFICIAL_INSEMINATION = "artificial_insemination",
  NATURAL_BREEDING = "natural_breeding",
  PREGNANCY_DIAGNOSIS = "pregnancy_diagnosis",
  CALVING = "calving",
  WEANING = "weaning",
  DRY_OFF = "dry_off",
  ABORTION = "abortion",
  STILLBIRTH = "stillbirth",
}

// Tipos de transferencia
export enum TransferType {
  WITHIN_FARM = "within_farm",
  TO_ANOTHER_FARM = "to_another_farm",
  TO_SLAUGHTER = "to_slaughter",
  TO_MARKET = "to_market",
  TO_SHOW = "to_show",
  TO_BREEDING_CENTER = "to_breeding_center",
  QUARANTINE = "quarantine",
  PASTURE_ROTATION = "pasture_rotation",
}

// Razones de transferencia
export enum TransferReason {
  ROUTINE_MANAGEMENT = "routine_management",
  MEDICAL_TREATMENT = "medical_treatment",
  BREEDING = "breeding",
  SALE = "sale",
  SLAUGHTER = "slaughter",
  SHOW_EXHIBITION = "show_exhibition",
  BETTER_PASTURE = "better_pasture",
  QUARANTINE_ISOLATION = "quarantine_isolation",
  EMERGENCY = "emergency",
}

// Tipos de manejo
export enum ManagementType {
  WEIGHING = "weighing",
  TAGGING = "tagging",
  DEHORNING = "dehorning",
  CASTRATION = "castration",
  HOOF_TRIMMING = "hoof_trimming",
  GROOMING = "grooming",
  IDENTIFICATION_CHANGE = "identification_change",
  BODY_CONDITION_SCORING = "body_condition_scoring",
}

// Tipos de chequeo de salud
export enum HealthCheckType {
  ROUTINE_CHECKUP = "routine_checkup",
  PRE_BREEDING_EXAM = "pre_breeding_exam",
  POST_CALVING_CHECK = "post_calving_check",
  LAMENESS_EXAM = "lameness_exam",
  RESPIRATORY_EXAM = "respiratory_exam",
  DIGESTIVE_EXAM = "digestive_exam",
  REPRODUCTIVE_EXAM = "reproductive_exam",
  ANNUAL_PHYSICAL = "annual_physical",
}

// Severidad de enfermedades
export enum IllnessSeverity {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
  CRITICAL = "critical",
}

// Métodos de aplicación de vacunas
export enum ApplicationMethod {
  INTRAMUSCULAR = "intramuscular",
  SUBCUTANEOUS = "subcutaneous",
  INTRANASAL = "intranasal",
  ORAL = "oral",
  TOPICAL = "topical",
  INTRADERMAL = "intradermal",
}

// Partes del cuerpo para aplicación
export enum BodyPart {
  NECK_LEFT = "neck_left",
  NECK_RIGHT = "neck_right",
  SHOULDER_LEFT = "shoulder_left",
  SHOULDER_RIGHT = "shoulder_right",
  RUMP_LEFT = "rump_left",
  RUMP_RIGHT = "rump_right",
  THIGH_LEFT = "thigh_left",
  THIGH_RIGHT = "thigh_right",
  NOSE = "nose",
  MOUTH = "mouth",
}

// Métodos de diagnóstico
export enum DiagnosisMethod {
  VISUAL_EXAMINATION = "visual_examination",
  PHYSICAL_EXAMINATION = "physical_examination",
  BLOOD_TEST = "blood_test",
  URINE_TEST = "urine_test",
  FECAL_TEST = "fecal_test",
  XRAY = "xray",
  ULTRASOUND = "ultrasound",
  BIOPSY = "biopsy",
  LABORATORY_TEST = "laboratory_test",
}

// Vías de administración de medicamentos
export enum AdministrationRoute {
  ORAL = "oral",
  INTRAMUSCULAR = "intramuscular",
  SUBCUTANEOUS = "subcutaneous",
  INTRAVENOUS = "intravenous",
  TOPICAL = "topical",
  INTRAUTERINE = "intrauterine",
  INTRAMAMMARY = "intramammary",
}

// Dificultad del parto
export enum CalvingDifficulty {
  EASY = "easy",
  MODERATE = "moderate",
  DIFFICULT = "difficult",
  CESAREAN = "cesarean",
  EMBRYOTOMY = "embryotomy",
}

// Etiquetas en español para tipos de eventos
export const EVENT_TYPE_LABELS = {
  [EventType.VACCINATION]: "Vacunación",
  [EventType.ILLNESS]: "Enfermedad",
  [EventType.REPRODUCTIVE]: "Reproductivo",
  [EventType.TRANSFER]: "Transferencia",
  [EventType.MANAGEMENT]: "Manejo",
  [EventType.HEALTH_CHECK]: "Chequeo de Salud",
  [EventType.FEEDING]: "Alimentación",
  [EventType.MILKING]: "Ordeño",
  [EventType.PREGNANCY_CHECK]: "Chequeo de Preñez",
  [EventType.BIRTH]: "Nacimiento",
  [EventType.DEATH]: "Muerte",
} as const;

// Etiquetas para eventos reproductivos
export const REPRODUCTIVE_EVENT_LABELS = {
  [ReproductiveEventType.HEAT_DETECTION]: "Detección de Celo",
  [ReproductiveEventType.ARTIFICIAL_INSEMINATION]: "Inseminación Artificial",
  [ReproductiveEventType.NATURAL_BREEDING]: "Monta Natural",
  [ReproductiveEventType.PREGNANCY_DIAGNOSIS]: "Diagnóstico de Gestación",
  [ReproductiveEventType.CALVING]: "Parto",
  [ReproductiveEventType.WEANING]: "Destete",
  [ReproductiveEventType.DRY_OFF]: "Secado",
  [ReproductiveEventType.ABORTION]: "Aborto",
  [ReproductiveEventType.STILLBIRTH]: "Mortinato",
} as const;

// Etiquetas para tipos de manejo
export const MANAGEMENT_TYPE_LABELS = {
  [ManagementType.WEIGHING]: "Pesaje",
  [ManagementType.TAGGING]: "Aretado",
  [ManagementType.DEHORNING]: "Descorne",
  [ManagementType.CASTRATION]: "Castración",
  [ManagementType.HOOF_TRIMMING]: "Recorte de Pezuñas",
  [ManagementType.GROOMING]: "Aseo",
  [ManagementType.IDENTIFICATION_CHANGE]: "Cambio de Identificación",
  [ManagementType.BODY_CONDITION_SCORING]: "Calificación Corporal",
} as const;

// Etiquetas para severidad de enfermedades
export const ILLNESS_SEVERITY_LABELS = {
  [IllnessSeverity.MILD]: "Leve",
  [IllnessSeverity.MODERATE]: "Moderada",
  [IllnessSeverity.SEVERE]: "Severa",
  [IllnessSeverity.CRITICAL]: "Crítica",
} as const;

// Etiquetas para dificultad del parto
export const CALVING_DIFFICULTY_LABELS = {
  [CalvingDifficulty.EASY]: "Fácil",
  [CalvingDifficulty.MODERATE]: "Moderado",
  [CalvingDifficulty.DIFFICULT]: "Difícil",
  [CalvingDifficulty.CESAREAN]: "Cesárea",
  [CalvingDifficulty.EMBRYOTOMY]: "Embriotomía",
} as const;

// Colores para tipos de eventos (para UI)
export const EVENT_TYPE_COLORS = {
  [EventType.VACCINATION]: {
    background: "#dcfce7",
    border: "#22c55e",
    text: "#15803d",
  },
  [EventType.ILLNESS]: {
    background: "#fecaca",
    border: "#ef4444",
    text: "#dc2626",
  },
  [EventType.REPRODUCTIVE]: {
    background: "#fdf4ff",
    border: "#d946ef",
    text: "#c026d3",
  },
  [EventType.TRANSFER]: {
    background: "#dbeafe",
    border: "#3b82f6",
    text: "#2563eb",
  },
  [EventType.MANAGEMENT]: {
    background: "#f3f4f6",
    border: "#6b7280",
    text: "#374151",
  },
  [EventType.HEALTH_CHECK]: {
    background: "#e0f2fe",
    border: "#0891b2",
    text: "#0e7490",
  },
  [EventType.FEEDING]: {
    background: "#fef3c7",
    border: "#f59e0b",
    text: "#d97706",
  },
  [EventType.MILKING]: {
    background: "#e0f2fe",
    border: "#06b6d4",
    text: "#0891b2",
  },
  [EventType.PREGNANCY_CHECK]: {
    background: "#fdf2f8",
    border: "#ec4899",
    text: "#be185d",
  },
  [EventType.BIRTH]: {
    background: "#ecfdf5",
    border: "#10b981",
    text: "#059669",
  },
  [EventType.DEATH]: {
    background: "#f3f4f6",
    border: "#6b7280",
    text: "#374151",
  },
} as const;

// Iconos para tipos de eventos (usando nombres de iconos de Lucide)
export const EVENT_TYPE_ICONS = {
  [EventType.VACCINATION]: "syringe",
  [EventType.ILLNESS]: "thermometer",
  [EventType.REPRODUCTIVE]: "heart",
  [EventType.TRANSFER]: "move",
  [EventType.MANAGEMENT]: "settings",
  [EventType.HEALTH_CHECK]: "stethoscope",
  [EventType.FEEDING]: "utensils",
  [EventType.MILKING]: "droplets",
  [EventType.PREGNANCY_CHECK]: "baby",
  [EventType.BIRTH]: "baby",
  [EventType.DEATH]: "x-circle",
} as const;

// Tipos de unión para facilitar el uso
export type AnyEvent =
  | VaccinationEvent
  | IllnessEvent
  | ReproductiveEvent
  | TransferEvent
  | ManagementEvent
  | HealthEvent;

// Función helper para determinar el tipo específico de evento
export const getEventTypeInterface = (eventType: EventType): string => {
  const typeMap: Record<EventType, string> = {
    [EventType.VACCINATION]: "VaccinationEvent",
    [EventType.ILLNESS]: "IllnessEvent",
    [EventType.REPRODUCTIVE]: "ReproductiveEvent",
    [EventType.TRANSFER]: "TransferEvent",
    [EventType.MANAGEMENT]: "ManagementEvent",
    [EventType.HEALTH_CHECK]: "HealthEvent",
    [EventType.FEEDING]: "BaseEvent",
    [EventType.MILKING]: "BaseEvent",
    [EventType.PREGNANCY_CHECK]: "BaseEvent",
    [EventType.BIRTH]: "BaseEvent",
    [EventType.DEATH]: "BaseEvent",
  };

  return typeMap[eventType] || "BaseEvent";
};

// Función para validar eventos requeridos por edad
export const getRequiredEventsByAge = (ageInMonths: number): EventType[] => {
  const required: EventType[] = [];

  // Vacunaciones obligatorias
  if (ageInMonths >= 1) required.push(EventType.VACCINATION);

  // Chequeos de salud rutinarios
  if (ageInMonths >= 6) required.push(EventType.HEALTH_CHECK);

  // Eventos reproductivos para hembras
  if (ageInMonths >= 15) required.push(EventType.REPRODUCTIVE);

  return required;
};
