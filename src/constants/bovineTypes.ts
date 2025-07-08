// Tipos y constantes para la gestión de ganado bovino

export interface Bovine {
  id: string;
  earTag: string; // Número de arete
  name?: string;
  type: BovineType;
  breed: string;
  gender: BovineGender;
  birthDate: Date;
  weight: number; // en kilogramos
  motherEarTag?: string;
  fatherEarTag?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  healthStatus: HealthStatus;
  vaccinations: Vaccination[];
  illnesses: Illness[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Vaccination {
  id: string;
  bovineId: string;
  vaccineType: string;
  vaccineName: string;
  dose: string;
  applicationDate: Date;
  nextDueDate?: Date;
  veterinarianName: string;
  batchNumber: string;
  manufacturer: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
  sideEffects?: string[];
  createdAt: Date;
}

export interface Illness {
  id: string;
  bovineId: string;
  diseaseName: string;
  diagnosisDate: Date;
  symptoms: string[];
  severity: IllnessSeverity;
  treatment?: string;
  veterinarianName: string;
  recoveryDate?: Date;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  notes?: string;
  isContagious: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Enums y tipos
export enum BovineType {
  DAIRY_COW = "dairy_cow",
  BEEF_COW = "beef_cow",
  BULL = "bull",
  CALF = "calf",
  HEIFER = "heifer",
  STEER = "steer",
}

export enum BovineGender {
  MALE = "male",
  FEMALE = "female",
}

export enum HealthStatus {
  HEALTHY = "healthy",
  SICK = "sick",
  QUARANTINE = "quarantine",
  RECOVERING = "recovering",
  DEAD = "dead",
}

export enum IllnessSeverity {
  MILD = "mild",
  MODERATE = "moderate",
  SEVERE = "severe",
  CRITICAL = "critical",
}

// Constantes para tipos de ganado bovino
export const BOVINE_TYPE_LABELS = {
  [BovineType.DAIRY_COW]: "Vaca Lechera",
  [BovineType.BEEF_COW]: "Vaca de Carne",
  [BovineType.BULL]: "Toro",
  [BovineType.CALF]: "Ternero",
  [BovineType.HEIFER]: "Vaquilla",
  [BovineType.STEER]: "Novillo",
} as const;

export const BOVINE_GENDER_LABELS = {
  [BovineGender.MALE]: "Macho",
  [BovineGender.FEMALE]: "Hembra",
} as const;

export const HEALTH_STATUS_LABELS = {
  [HealthStatus.HEALTHY]: "Saludable",
  [HealthStatus.SICK]: "Enfermo",
  [HealthStatus.QUARANTINE]: "Cuarentena",
  [HealthStatus.RECOVERING]: "Recuperándose",
  [HealthStatus.DEAD]: "Muerto",
} as const;

export const ILLNESS_SEVERITY_LABELS = {
  [IllnessSeverity.MILD]: "Leve",
  [IllnessSeverity.MODERATE]: "Moderada",
  [IllnessSeverity.SEVERE]: "Severa",
  [IllnessSeverity.CRITICAL]: "Crítica",
} as const;

// Razas comunes de ganado bovino
export const COMMON_BREEDS = [
  "Holstein",
  "Angus",
  "Hereford",
  "Charolais",
  "Simmental",
  "Limousin",
  "Brahman",
  "Jersey",
  "Guernsey",
  "Brown Swiss",
  "Shorthorn",
  "Zebu",
  "Criollo",
  "Mestizo",
] as const;

// Síntomas comunes en ganado bovino
export const COMMON_SYMPTOMS = [
  "Fiebre",
  "Pérdida de apetito",
  "Diarrea",
  "Tos",
  "Dificultad respiratoria",
  "Cojera",
  "Secreción nasal",
  "Pérdida de peso",
  "Letargo",
  "Mastitis",
  "Hinchazón",
  "Temblores",
  "Convulsiones",
  "Salivación excesiva",
  "Ojos llorosos",
] as const;

export type BovineBreed = (typeof COMMON_BREEDS)[number];
export type CommonSymptom = (typeof COMMON_SYMPTOMS)[number];
