// Tipos comunes y compartidos en toda la aplicación

// Tipos base genéricos
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  updatedBy?: string;
}

// Interfaz para respuestas de API
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

// Metadatos de respuesta
export interface ResponseMetadata {
  total?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  timestamp: Date;
  requestId: string;
}

// Error de API
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
  stack?: string;
}

// Opciones de paginación
export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

// Resultado paginado
export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Opciones de búsqueda
export interface SearchOptions {
  query?: string;
  filters?: Record<string, any>;
  pagination?: PaginationOptions;
  includeDeleted?: boolean;
}

// Coordenadas geográficas
export interface Coordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
}

// Dirección postal
export interface Address {
  street?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates?: Coordinates;
}

// Información de contacto
export interface ContactInfo {
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: SocialMediaLinks;
}

// Enlaces de redes sociales
export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
}

// Archivo adjunto
export interface FileAttachment {
  id: string;
  originalName: string;
  fileName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy: string;
  description?: string;
  tags?: string[];
}

// Información de archivo
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  extension: string;
  isImage: boolean;
  isDocument: boolean;
  isVideo: boolean;
  isAudio: boolean;
}

// Configuración de notificación
export interface NotificationConfig {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  data?: Record<string, any>;
  scheduledFor?: Date;
  expiresAt?: Date;
}

// Notificación
export interface Notification extends BaseEntity {
  userId: string;
  config: NotificationConfig;
  isRead: boolean;
  readAt?: Date;
  deliveredAt?: Date;
  clickedAt?: Date;
  channels: NotificationChannel[];
}

// Comentario
export interface Comment extends BaseEntity {
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  parentId?: string; // Para respuestas
  entityType: string; // 'bovine', 'vaccination', 'illness', etc.
  entityId: string;
  attachments?: FileAttachment[];
  reactions?: CommentReaction[];
  isEdited: boolean;
  editedAt?: Date;
}

// Reacción a comentario
export interface CommentReaction {
  userId: string;
  userName: string;
  type: ReactionType;
  createdAt: Date;
}

// Actividad del sistema
export interface SystemActivity extends BaseEntity {
  userId: string;
  userName: string;
  userAvatar?: string;
  action: ActivityAction;
  entityType: string;
  entityId: string;
  entityName?: string;
  description: string;
  changes?: ActivityChange[];
  ipAddress?: string;
  userAgent?: string;
  location?: Coordinates;
}

// Cambio en actividad
export interface ActivityChange {
  field: string;
  oldValue: any;
  newValue: any;
  displayName: string;
}

// Configuración del sistema
export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  type: ConfigType;
  description: string;
  category: string;
  isSecret: boolean;
  isReadOnly: boolean;
  validationRules?: ValidationRule[];
  updatedAt: Date;
  updatedBy: string;
}

// Regla de validación
export interface ValidationRule {
  type: "required" | "min" | "max" | "pattern" | "custom";
  value?: any;
  message: string;
}

// Backup de datos
export interface DataBackup extends BaseEntity {
  name: string;
  description?: string;
  size: number;
  status: BackupStatus;
  type: BackupType;
  location: string;
  encryptionEnabled: boolean;
  startedAt: Date;
  completedAt?: Date;
  progress: number; // 0-100
  error?: string;
  metadata: BackupMetadata;
}

// Metadatos de backup
export interface BackupMetadata {
  tablesIncluded: string[];
  recordCount: number;
  compressedSize: number;
  checksumHash: string;
  retentionDays: number;
}

// Integración externa
export interface ExternalIntegration extends BaseEntity {
  name: string;
  provider: IntegrationProvider;
  config: IntegrationConfig;
  status: IntegrationStatus;
  lastSyncAt?: Date;
  nextSyncAt?: Date;
  syncFrequency?: string; // cron expression
  errorCount: number;
  lastError?: string;
}

// Configuración de integración
export interface IntegrationConfig {
  apiKey?: string;
  apiSecret?: string;
  baseUrl?: string;
  webhookUrl?: string;
  mappings?: FieldMapping[];
  settings?: Record<string, any>;
}

// Mapeo de campos
export interface FieldMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  isRequired: boolean;
}

// Configuración de dashboard
export interface DashboardConfig {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  layout: DashboardLayout;
  filters?: DashboardFilter[];
  refreshInterval?: number; // segundos
  sharedWith: string[]; // user IDs
  isPublic: boolean;
}

// Layout del dashboard
export interface DashboardLayout {
  columns: number;
  rows: number;
  widgets: DashboardWidgetLayout[];
  breakpoints?: BreakpointConfig[];
}

// Layout de widget
export interface DashboardWidgetLayout {
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  config?: Record<string, any>;
}

// Configuración de breakpoints
export interface BreakpointConfig {
  breakpoint: string; // 'xs', 'sm', 'md', 'lg', 'xl'
  columns: number;
  margin?: number;
  containerPadding?: number;
}

// Filtro de dashboard
export interface DashboardFilter {
  id: string;
  name: string;
  type: FilterType;
  options?: FilterOption[];
  defaultValue?: any;
  isRequired: boolean;
}

// Opción de filtro
export interface FilterOption {
  label: string;
  value: any;
  color?: string;
  icon?: string;
}

// Alerta del sistema
export interface SystemAlert extends BaseEntity {
  title: string;
  message: string;
  type: AlertType;
  severity: AlertSeverity;
  category: string;
  source: string;
  entityType?: string;
  entityId?: string;
  isResolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  acknowledgedBy: string[];
  metadata?: Record<string, any>;
}

// Configuración de tema
export interface ThemeConfig {
  id: string;
  name: string;
  description?: string;
  colors: ColorPalette;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  borderRadius: BorderRadiusConfig;
  shadows: ShadowConfig;
  isDark: boolean;
}

// Paleta de colores
export interface ColorPalette {
  primary: ColorShades;
  secondary: ColorShades;
  success: ColorShades;
  warning: ColorShades;
  error: ColorShades;
  info: ColorShades;
  neutral: ColorShades;
}

// Tonos de color
export interface ColorShades {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

// Configuración de tipografía
export interface TypographyConfig {
  fontFamily: {
    sans: string[];
    serif: string[];
    mono: string[];
  };
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
  };
  fontWeight: {
    thin: number;
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
    extrabold: number;
  };
}

// Configuración de espaciado
export interface SpacingConfig {
  0: string;
  1: string;
  2: string;
  3: string;
  4: string;
  6: string;
  8: string;
  12: string;
  16: string;
  24: string;
  32: string;
}

// Configuración de border radius
export interface BorderRadiusConfig {
  none: string;
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  full: string;
}

// Configuración de sombras
export interface ShadowConfig {
  sm: string;
  base: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  inner: string;
}

// Enums
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
  BREEDING_REMINDER = "breeding_reminder",
}

export enum NotificationPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

export enum NotificationChannel {
  EMAIL = "email",
  SMS = "sms",
  PUSH = "push",
  IN_APP = "in_app",
  WEBHOOK = "webhook",
}

export enum ReactionType {
  LIKE = "like",
  LOVE = "love",
  LAUGH = "laugh",
  WOW = "wow",
  SAD = "sad",
  ANGRY = "angry",
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

export enum ConfigType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  JSON = "json",
  ARRAY = "array",
}

export enum BackupStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  CANCELLED = "cancelled",
}

export enum BackupType {
  FULL = "full",
  INCREMENTAL = "incremental",
  DIFFERENTIAL = "differential",
}

export enum IntegrationProvider {
  ZAPIER = "zapier",
  GOOGLE_DRIVE = "google_drive",
  DROPBOX = "dropbox",
  SLACK = "slack",
  TEAMS = "teams",
  WHATSAPP = "whatsapp",
  TELEGRAM = "telegram",
}

export enum IntegrationStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  ERROR = "error",
  PENDING = "pending",
  SUSPENDED = "suspended",
}

export enum FilterType {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  SELECT = "select",
  MULTISELECT = "multiselect",
  BOOLEAN = "boolean",
  RANGE = "range",
}

export enum AlertType {
  SYSTEM = "system",
  SECURITY = "security",
  PERFORMANCE = "performance",
  HEALTH = "health",
  BREEDING = "breeding",
  VACCINATION = "vaccination",
  FINANCIAL = "financial",
}

export enum AlertSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Tipos utilitarios
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Tipos para operaciones CRUD
export type CreateInput<T> = Omit<T, "id" | "createdAt" | "updatedAt">;
export type UpdateInput<T> = Partial<Omit<T, "id" | "createdAt" | "updatedAt">>;

// Tipos para formularios
export interface FormField<T = any> {
  name: string;
  label: string;
  type: FormFieldType;
  value: T;
  placeholder?: string;
  isRequired: boolean;
  isDisabled?: boolean;
  validation?: ValidationRule[];
  options?: SelectOption[];
  helpText?: string;
  error?: string;
}

export interface SelectOption {
  label: string;
  value: any;
  disabled?: boolean;
  group?: string;
}

export enum FormFieldType {
  TEXT = "text",
  EMAIL = "email",
  PASSWORD = "password",
  NUMBER = "number",
  DATE = "date",
  DATETIME = "datetime",
  TIME = "time",
  TEXTAREA = "textarea",
  SELECT = "select",
  MULTISELECT = "multiselect",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  FILE = "file",
  SWITCH = "switch",
  SLIDER = "slider",
  COLOR = "color",
}
