// Archivo de índice para exportar todos los tipos de la aplicación de gestión ganadera
// Define tipos esenciales directamente para evitar problemas de importación

// ========================================
// DEFINICIONES DE TIPOS BÁSICOS
// ========================================

// Tipos básicos de ubicación
export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  altitude?: number;
  accuracy?: number;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Entidad base para todos los modelos
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// ========================================
// ENUMS PRINCIPALES DEFINIDOS AQUÍ
// ========================================

// Enums para ganado bovino
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

// Enums para eventos y tratamientos
export enum AdministrationRoute {
  ORAL = "oral",
  INTRAMUSCULAR = "intramuscular",
  SUBCUTANEOUS = "subcutaneous",
  INTRAVENOUS = "intravenous",
  TOPICAL = "topical",
  INTRAUTERINE = "intrauterine",
  INTRAMAMMARY = "intramammary",
}

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

// Enums básicos para UI
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  WARNING = "warning",
  ERROR = "error",
  VACCINATION_REMINDER = "vaccination_reminder",
  HEALTH_ALERT = "health_alert",
  SYSTEM_UPDATE = "system_update",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum ActivityAction {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  VIEW = "view",
  LOGIN = "login",
  LOGOUT = "logout",
  EXPORT = "export",
  IMPORT = "import",
}

export enum UserRole {
  ADMIN = "admin",
  MANAGER = "manager",
  VETERINARIAN = "veterinarian",
  WORKER = "worker",
  VIEWER = "viewer",
}

export enum FarmType {
  DAIRY = "dairy",
  BEEF = "beef",
  MIXED = "mixed",
  BREEDING = "breeding",
}

// ========================================
// INTERFACES DE MODELOS PRINCIPALES
// ========================================

// Ganado bovino
export interface Bovine extends BaseEntity {
  earTag: string;
  name?: string;
  type: BovineType;
  breed: string;
  gender: BovineGender;
  birthDate: Date;
  weight: number;
  motherEarTag?: string;
  fatherEarTag?: string;
  location: Location;
  healthStatus: HealthStatus;
  vaccinations: Vaccination[];
  illnesses: Illness[];
}

// Vacunación
export interface Vaccination extends BaseEntity {
  bovineId: string;
  vaccineType: string;
  vaccineName: string;
  dose: string;
  applicationDate: Date;
  nextDueDate?: Date;
  veterinarianName: string;
  batchNumber: string;
  manufacturer: string;
  location: Location;
  notes?: string;
  sideEffects?: string[];
}

// Enfermedad
export interface Illness extends BaseEntity {
  bovineId: string;
  diseaseName: string;
  diagnosisDate: Date;
  symptoms: string[];
  severity: IllnessSeverity;
  treatment?: string;
  veterinarianName: string;
  recoveryDate?: Date;
  location: Location;
  notes?: string;
  isContagious: boolean;
}

// Usuario
export interface User extends BaseEntity {
  email: string;
  username?: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: Date;
  preferences: UserPreferences;
  farmInfo?: FarmInfo;
}

// ========================================
// INTERFACES DE RESPUESTAS API
// ========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: Date;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: Date;
}

export interface PaginatedResult<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ========================================
// INTERFACES DE CONFIGURACIÓN
// ========================================

export interface UserPreferences {
  language: "es" | "en";
  timezone: string;
  dateFormat: string;
  currency: string;
  notifications: NotificationPreferences;
  theme: "light" | "dark" | "auto";
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  vaccinationReminders: boolean;
  healthAlerts: boolean;
  systemUpdates: boolean;
}

export interface FarmInfo {
  name: string;
  type: FarmType;
  size?: number;
  location: Address;
  contactInfo: ContactInfo;
  registrationNumber?: string;
  taxId?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: Coordinates;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  website?: string;
  address?: Address;
}

export interface AppConfig {
  name: string;
  version: string;
  environment: "development" | "staging" | "production";
  apiUrl: string;
  features: FeatureFlags;
}

export interface FeatureFlags {
  advancedAnalytics: boolean;
  mobileApp: boolean;
  exportFeatures: boolean;
  integrationsEnabled: boolean;
  aiInsights: boolean;
  realTimeTracking: boolean;
  multiLanguage: boolean;
  customReports: boolean;
  geolocation: boolean;
  weatherIntegration: boolean;
}

export interface AppContextType {
  config: AppConfig;
  language: "es" | "en";
  isLoading: boolean;
  error: string | null;
  currentUser: User | null;
  setLanguage: (lang: "es" | "en") => void;
  clearError: () => void;
  setCurrentUser: (user: User | null) => void;
}

// ========================================
// INTERFACES DE FORMULARIOS
// ========================================

export interface BovineFormData {
  earTag: string;
  name?: string;
  type: BovineType;
  breed: string;
  gender: BovineGender;
  birthDate: Date;
  weight: number;
  motherEarTag?: string;
  fatherEarTag?: string;
  location: Location;
  healthStatus: HealthStatus;
  notes?: string;
  photos?: FileAttachment[];
}

export interface VaccinationFormData {
  bovineId: string;
  vaccineType: string;
  vaccineName: string;
  dose: string;
  applicationDate: Date;
  nextDueDate?: Date;
  veterinarianName: string;
  veterinarianLicense?: string;
  batchNumber: string;
  manufacturer: string;
  location: Location;
  administrationRoute: AdministrationRoute;
  cost?: number;
  notes?: string;
  photos?: FileAttachment[];
}

export interface IllnessFormData {
  bovineId: string;
  diseaseName: string;
  diagnosisDate: Date;
  symptoms: string[];
  severity: IllnessSeverity;
  treatment?: string;
  medications?: string[];
  veterinarianName: string;
  location: Location;
  notes?: string;
  isContagious: boolean;
  isolationRequired: boolean;
  expectedRecoveryDate?: Date;
  cost?: number;
  photos?: FileAttachment[];
}

export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  farmName?: string;
  acceptTerms: boolean;
}

// ========================================
// INTERFACES DE COMPONENTES UI
// ========================================

export interface ButtonProps {
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
}

export interface InputProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url";
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  label?: string;
  helperText?: string;
  className?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  maxLength?: number;
}

export interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  placeholder?: string;
  isMultiple?: boolean;
  isDisabled?: boolean;
  hasError?: boolean;
  errorMessage?: string;
  label?: string;
  className?: string;
  onChange?: (value: string | string[]) => void;
}

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  isDisabled?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  data?: Record<string, any>;
  expiresAt?: Date;
}

export interface Comment extends BaseEntity {
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  parentId?: string;
  entityType: string;
  entityId: string;
  attachments?: FileAttachment[];
  isEdited: boolean;
  editedAt?: Date;
}

export interface SystemActivity extends BaseEntity {
  userId: string;
  userName: string;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  description: string;
  ipAddress?: string;
  userAgent?: string;
  location?: Coordinates;
}

// ========================================
// INTERFACES DE FILTROS Y BÚSQUEDAS
// ========================================

export interface BovineFilters {
  searchTerm?: string;
  type?: BovineType;
  breed?: string;
  gender?: BovineGender;
  healthStatus?: HealthStatus;
  ageRange?: {
    min: number;
    max: number;
  };
  weightRange?: {
    min: number;
    max: number;
  };
  locationRadius?: {
    center: Location;
    radiusKm: number;
  };
  dateRange?: {
    field: "birthDate" | "createdAt" | "updatedAt";
    startDate: Date;
    endDate: Date;
  };
}

export interface LocationFilter {
  centerLocation: Location;
  radiusKm: number;
}

export interface DateRangeFilter {
  startDate: Date;
  endDate: Date;
}

// ========================================
// INTERFACES DE ESTADO
// ========================================

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface BovineState {
  bovines: Bovine[];
  selectedBovine: Bovine | null;
  filters: BovineFilters;
  pagination: PaginationState;
  loading: boolean;
  error: string | null;
}

export interface MapState {
  center: Coordinates;
  zoom: number;
  selectedMarkers: string[];
  showVaccinations: boolean;
  showIllnesses: boolean;
  showBoundaries: boolean;
}

// ========================================
// CONSTANTES DE LA APLICACIÓN
// ========================================

export const APP_CONSTANTS = {
  APP_NAME: "BovineManager",
  APP_VERSION: "1.0.0",
  SUPPORTED_LANGUAGES: ["es", "en"] as const,
  DEFAULT_LANGUAGE: "es" as const,
  PAGINATION_SIZE: 20,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: [".jpg", ".jpeg", ".png", ".pdf"] as const,
  MAP_DEFAULT_ZOOM: 10,
  QUERÉTARO_COORDINATES: {
    latitude: 20.5888,
    longitude: -100.3899,
  },
} as const;

export const BOVINE_CONSTANTS = {
  MIN_WEIGHT: 10, // kg
  MAX_WEIGHT: 1500, // kg
  MIN_AGE_MONTHS: 0,
  MAX_AGE_MONTHS: 300, // 25 años
  DEFAULT_VACCINATION_INTERVAL: 365, // días
  QUARANTINE_PERIOD: 21, // días
} as const;

// Etiquetas en español
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

// Razas comunes
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

// Síntomas comunes
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

// ========================================
// FUNCIONES UTILITARIAS
// ========================================

// Funciones para crear objetos vacíos
export const createEmptyBovine = (): Partial<BovineFormData> => ({
  earTag: "",
  name: "",
  type: BovineType.DAIRY_COW,
  breed: "",
  gender: BovineGender.FEMALE,
  birthDate: new Date(),
  weight: 0,
  location: APP_CONSTANTS.QUERÉTARO_COORDINATES,
  healthStatus: HealthStatus.HEALTHY,
});

export const createEmptyVaccination = (): Partial<VaccinationFormData> => ({
  bovineId: "",
  vaccineType: "",
  vaccineName: "",
  dose: "",
  applicationDate: new Date(),
  veterinarianName: "",
  batchNumber: "",
  manufacturer: "",
  location: APP_CONSTANTS.QUERÉTARO_COORDINATES,
  administrationRoute: AdministrationRoute.INTRAMUSCULAR,
});

export const createEmptyIllness = (): Partial<IllnessFormData> => ({
  bovineId: "",
  diseaseName: "",
  diagnosisDate: new Date(),
  symptoms: [],
  severity: IllnessSeverity.MILD,
  veterinarianName: "",
  location: APP_CONSTANTS.QUERÉTARO_COORDINATES,
  isContagious: false,
  isolationRequired: false,
});

// Validadores
export const validateEarTag = (earTag: string): boolean => {
  // Valida formato de arete mexicano (ej: MX001, QRO123)
  const earTagRegex = /^[A-Z]{2,3}\d{3,6}$/;
  return earTagRegex.test(earTag.toUpperCase());
};

export const validateWeight = (weight: number, type: BovineType): boolean => {
  const minWeights = {
    [BovineType.CALF]: 25,
    [BovineType.HEIFER]: 200,
    [BovineType.DAIRY_COW]: 400,
    [BovineType.BEEF_COW]: 350,
    [BovineType.BULL]: 500,
    [BovineType.STEER]: 300,
  };

  return weight >= minWeights[type] && weight <= BOVINE_CONSTANTS.MAX_WEIGHT;
};

export const calculateAge = (birthDate: Date): number => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - birthDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.floor(diffDays / 30.44); // meses aproximados
};

// Re-exportar funciones de construcción de URLs
export { buildApiUrl } from "../constants/urls";
