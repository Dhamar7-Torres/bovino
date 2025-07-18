// Tipos relacionados con autenticación y gestión de usuarios

// Interfaz principal del usuario
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  permissions: Permission[];
  farmId?: string;
  preferences: UserPreferences;
  isActive: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Perfil completo del usuario
export interface UserProfile extends User {
  farm?: FarmInfo;
  subscription?: SubscriptionInfo;
  usage: UsageStats;
}

// Información de la granja/rancho
export interface FarmInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  totalArea: number; // en hectáreas
  establishedYear: number;
  farmType: FarmType;
  specialization: string[];
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  ownerIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Preferencias del usuario
export interface UserPreferences {
  language: "es" | "en";
  timezone: string;
  dateFormat: "DD/MM/YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD";
  currency: "MXN" | "USD";
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
  map: MapPreferences;
}

// Preferencias de notificaciones
export interface NotificationPreferences {
  email: {
    enabled: boolean;
    vaccinationReminders: boolean;
    healthAlerts: boolean;
    reportDigest: boolean;
    systemUpdates: boolean;
  };
  push: {
    enabled: boolean;
    vaccinationReminders: boolean;
    healthAlerts: boolean;
    emergencyAlerts: boolean;
  };
  sms: {
    enabled: boolean;
    emergencyOnly: boolean;
    phone?: string;
  };
}

// Preferencias del dashboard
export interface DashboardPreferences {
  defaultView: "overview" | "health" | "vaccinations" | "maps";
  widgets: DashboardWidget[];
  refreshInterval: number; // en minutos
  showAnimations: boolean;
}

// Widget del dashboard
export interface DashboardWidget {
  id: string;
  type: WidgetType;
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: Record<string, any>;
  isVisible: boolean;
}

// Preferencias del mapa
export interface MapPreferences {
  defaultZoom: number;
  defaultCenter: { latitude: number; longitude: number };
  showCattleLocations: boolean;
  showVaccinationSites: boolean;
  showIllnessLocations: boolean;
  clustering: boolean;
  theme: "default" | "satellite" | "terrain";
}

// Estadísticas de uso
export interface UsageStats {
  totalCattle: number;
  totalVaccinations: number;
  totalIllnesses: number;
  storageUsed: number; // en bytes
  lastActivity: Date;
  monthlyStats: MonthlyUsage[];
}

// Uso mensual
export interface MonthlyUsage {
  month: string; // YYYY-MM
  cattleAdded: number;
  vaccinationsRecorded: number;
  illnessesRecorded: number;
  reportsGenerated: number;
}

// Información de suscripción
export interface SubscriptionInfo {
  id: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  isTrialPeriod: boolean;
  features: string[];
  limits: SubscriptionLimits;
  paymentMethod?: PaymentMethod;
  nextBillingDate?: Date;
  cancelledAt?: Date;
}

// Límites de suscripción
export interface SubscriptionLimits {
  maxCattle: number;
  maxUsers: number;
  maxStorageGB: number;
  maxReportsPerMonth: number;
  hasAdvancedAnalytics: boolean;
  hasAPIAccess: boolean;
  hasPrioritySupport: boolean;
}

// Método de pago
export interface PaymentMethod {
  id: string;
  type: "card" | "bank_transfer" | "paypal";
  lastFour?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// Datos de autenticación
export interface AuthCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Datos de registro
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  farmName: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

// Respuesta de autenticación
export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
  expiresIn: number;
}

// Tokens de autenticación
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
}

// Contexto de autenticación
export interface AuthContext {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

// Datos para cambio de contraseña
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Datos para recuperación de contraseña
export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

// Sesión del usuario
export interface UserSession {
  id: string;
  userId: string;
  deviceInfo: DeviceInfo;
  ipAddress: string;
  userAgent: string;
  location?: GeoLocation;
  startedAt: Date;
  lastActivity: Date;
  isActive: boolean;
}

// Información del dispositivo
export interface DeviceInfo {
  type: "desktop" | "mobile" | "tablet";
  os: string;
  browser: string;
  version: string;
}

// Ubicación geográfica
export interface GeoLocation {
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
}

// Permiso del usuario
export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: string;
}

// Enums
export enum UserRole {
  OWNER = "owner",
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
  FEEDLOT = "feedlot",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  TRIAL = "trial",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
  SUSPENDED = "suspended",
}

export enum WidgetType {
  HEALTH_OVERVIEW = "health_overview",
  VACCINATION_STATUS = "vaccination_status",
  RECENT_ILLNESSES = "recent_illnesses",
  CATTLE_COUNT = "cattle_count",
  WEATHER = "weather",
  QUICK_ACTIONS = "quick_actions",
  UPCOMING_TASKS = "upcoming_tasks",
  FINANCIAL_SUMMARY = "financial_summary",
}

// Etiquetas en español para roles
export const USER_ROLE_LABELS = {
  [UserRole.OWNER]: "Propietario",
  [UserRole.ADMIN]: "Administrador",
  [UserRole.MANAGER]: "Gerente",
  [UserRole.VETERINARIAN]: "Veterinario",
  [UserRole.WORKER]: "Trabajador",
  [UserRole.VIEWER]: "Observador",
} as const;

// Etiquetas para tipos de granja
export const FARM_TYPE_LABELS = {
  [FarmType.DAIRY]: "Lechería",
  [FarmType.BEEF]: "Engorda",
  [FarmType.MIXED]: "Mixta",
  [FarmType.BREEDING]: "Cría",
  [FarmType.FEEDLOT]: "Corral de Engorda",
} as const;

// Etiquetas para estado de suscripción
export const SUBSCRIPTION_STATUS_LABELS = {
  [SubscriptionStatus.ACTIVE]: "Activa",
  [SubscriptionStatus.TRIAL]: "Prueba",
  [SubscriptionStatus.EXPIRED]: "Expirada",
  [SubscriptionStatus.CANCELLED]: "Cancelada",
  [SubscriptionStatus.SUSPENDED]: "Suspendida",
} as const;

// Funciones helper
export const hasPermission = (
  user: User,
  resource: string,
  action: string
): boolean => {
  return user.permissions.some(
    (permission) =>
      permission.resource === resource && permission.action === action
  );
};

export const isSubscriptionActive = (
  subscription?: SubscriptionInfo
): boolean => {
  if (!subscription) return false;
  return (
    subscription.status === SubscriptionStatus.ACTIVE ||
    subscription.status === SubscriptionStatus.TRIAL
  );
};

export const getFullName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`.trim();
};

export const getUserInitials = (user: User): string => {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
};
