// Tipos para manejo y gestión de eventos en la aplicación de gestión ganadera
// Complementa los tipos existentes en constants/eventTypes.ts

// Importación de tipos base (se asume que están en el mismo nivel)
// import { BaseEvent, AnyEvent, EventType } from '../constants/eventTypes';
// import { CalendarEvent } from './calendar';

// Estados de validación para eventos
export enum EventValidationStatus {
  VALID = "valid",
  INVALID = "invalid",
  PENDING = "pending",
  WARNING = "warning",
}

// Estados de procesamiento de eventos
export enum EventProcessingStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  PROCESSING = "processing",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
  ARCHIVED = "archived",
}

// Prioridades de eventos
export enum EventPriority {
  LOW = "low",
  NORMAL = "normal",
  HIGH = "high",
  URGENT = "urgent",
  EMERGENCY = "emergency",
}

// Estados de sincronización
export enum SyncStatus {
  SYNCED = "synced",
  PENDING_UPLOAD = "pending_upload",
  PENDING_DOWNLOAD = "pending_download",
  CONFLICT = "conflict",
  FAILED = "failed",
  OFFLINE = "offline",
}

// Tipos de origen de datos
export enum EventSource {
  MANUAL = "manual",
  IMPORTED = "imported",
  API = "api",
  SYNCHRONIZED = "synchronized",
  SENSOR = "sensor",
  BULK_UPLOAD = "bulk_upload",
}

// Configuración de validación para eventos
export interface EventValidationConfig {
  // Validaciones generales
  requireLocation: boolean;
  requirePerformedBy: boolean;
  requireVeterinarianForMedical: boolean;

  // Validaciones de fechas
  allowFutureDates: boolean;
  maxPastDays?: number;

  // Validaciones específicas por tipo
  vaccinationValidation?: VaccinationValidationRules;
  illnessValidation?: IllnessValidationRules;
  reproductiveValidation?: ReproductiveValidationRules;

  // Validaciones de archivos adjuntos
  maxAttachments: number;
  allowedFileTypes: string[];
  maxFileSize: number; // en MB
}

// Reglas de validación específicas para vacunaciones
export interface VaccinationValidationRules {
  requireBatchNumber: boolean;
  requireManufacturer: boolean;
  requireNextDueDate: boolean;
  validateVaccineCompatibility: boolean;
  checkPreviousVaccinations: boolean;
  minimumIntervalDays?: number;
}

// Reglas de validación para enfermedades
export interface IllnessValidationRules {
  requireSymptoms: boolean;
  requireDiagnosis: boolean;
  requireTreatment: boolean;
  validateSeverity: boolean;
  checkContagiousIsolation: boolean;
}

// Reglas de validación para eventos reproductivos
export interface ReproductiveValidationRules {
  requireBullId: boolean;
  validateBreedingAge: boolean;
  checkPreviousPregnancy: boolean;
  validateCalvingInterval: boolean;
  minimumCalvingIntervalDays?: number;
}

// Resultado de validación
export interface EventValidationResult {
  isValid: boolean;
  status: EventValidationStatus;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  score?: number; // 0-100
}

// Error de validación
export interface ValidationError {
  field: string;
  code: string;
  message: string;
  severity: "error" | "warning";
  suggestion?: string;
}

// Advertencia de validación
export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  canProceed: boolean;
  recommendation?: string;
}

// Configuración para formularios de eventos
export interface EventFormConfig {
  // Configuración general
  mode: "create" | "edit" | "view" | "duplicate";
  eventType?: string; // Correspondería a EventType

  // Campos requeridos y opcionales
  requiredFields: string[];
  optionalFields: string[];
  hiddenFields: string[];
  readonlyFields: string[];

  // Configuración de validación
  validation: EventValidationConfig;

  // Configuración de UI
  showAdvancedOptions: boolean;
  enableAutoSave: boolean;
  autoSaveInterval: number; // en segundos

  // Valores por defecto
  defaultValues: Record<string, any>;

  // Configuración de archivos
  allowAttachments: boolean;
  enableCameraCapture: boolean;

  // Configuración de ubicación
  enableGeolocation: boolean;
  requireLocationAccuracy: boolean;
  maxLocationAccuracy: number; // en metros
}

// Estado del formulario de eventos
export interface EventFormState {
  // Datos del formulario
  formData: Record<string, any>;
  originalData?: Record<string, any>;

  // Estados de validación
  validationResult?: EventValidationResult;
  isValidating: boolean;

  // Estados de envío
  isSubmitting: boolean;
  submitAttempts: number;
  lastSubmitError?: string;

  // Estados de UI
  isDirty: boolean;
  hasUnsavedChanges: boolean;
  isAutoSaving: boolean;
  lastSavedAt?: Date;

  // Configuración activa
  config: EventFormConfig;

  // Datos de soporte
  supportData: EventFormSupportData;
}

// Datos de soporte para formularios
export interface EventFormSupportData {
  // Listas de opciones
  animals: AnimalOption[];
  veterinarians: VeterinarianOption[];
  vaccines: VaccineOption[];
  medications: MedicationOption[];
  locations: LocationOption[];
  facilities: FacilityOption[];

  // Datos dependientes del contexto
  animalHistory?: any[]; // Historial del animal seleccionado
  vaccineSchedule?: any[]; // Programa de vacunación
  treatmentHistory?: any[]; // Historial de tratamientos

  // Configuración dinámica
  dynamicFields?: DynamicField[];
  conditionalRules?: ConditionalRule[];
}

// Opciones para selección en formularios
export interface AnimalOption {
  id: string;
  earTag: string;
  name?: string;
  breed: string;
  sex: "male" | "female";
  age: number;
  status: string;
  location?: string;
}

export interface VeterinarianOption {
  id: string;
  name: string;
  license: string;
  phone?: string;
  email?: string;
  specializations: string[];
}

export interface VaccineOption {
  id: string;
  name: string;
  manufacturer: string;
  type: string;
  currentBatch?: string;
  expirationDate?: Date;
  cost?: number;
}

export interface MedicationOption {
  id: string;
  name: string;
  activeIngredient: string;
  dosageForm: string;
  withdrawalPeriod?: number;
  cost?: number;
}

export interface LocationOption {
  id: string;
  name: string;
  type: "pasture" | "corral" | "facility" | "field";
  coordinates?: { latitude: number; longitude: number };
  capacity?: number;
}

export interface FacilityOption {
  id: string;
  name: string;
  type: string;
  location: string;
  equipment: string[];
}

// Campos dinámicos
export interface DynamicField {
  name: string;
  type: "text" | "number" | "date" | "select" | "multiselect" | "boolean";
  label: string;
  required: boolean;
  options?: { value: any; label: string }[];
  validation?: FieldValidation;
  dependsOn?: string; // Campo del cual depende
  showWhen?: any; // Valor que debe tener el campo dependiente
}

// Validación de campos
export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  custom?: (value: any) => boolean;
  message?: string;
}

// Reglas condicionales
export interface ConditionalRule {
  condition: {
    field: string;
    operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "in" | "not_in";
    value: any;
  };
  action: {
    type: "show" | "hide" | "require" | "disable" | "set_value";
    target: string;
    value?: any;
  };
}

// Configuración de búsqueda y filtrado
export interface EventSearchConfig {
  // Filtros básicos
  dateRange?: { start: Date; end: Date };
  eventTypes?: string[];
  animalIds?: string[];
  locations?: string[];

  // Filtros avanzados
  performedBy?: string[];
  veterinarians?: string[];
  priorities?: EventPriority[];
  statuses?: EventProcessingStatus[];

  // Búsqueda de texto
  searchText?: string;
  searchFields?: string[];

  // Configuración de resultados
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;

  // Filtros especiales
  includeArchived?: boolean;
  onlyOverdue?: boolean;
  onlyUpcoming?: boolean;
  onlyValidated?: boolean;
}

// Resultado de búsqueda
export interface EventSearchResult {
  events: EventSearchItem[];
  totalCount: number;
  filteredCount: number;
  hasMore: boolean;
  aggregations?: EventAggregations;
}

// Item de resultado de búsqueda
export interface EventSearchItem {
  id: string;
  eventType: string;
  eventDate: Date;
  animalTag: string;
  animalName?: string;
  title: string;
  description?: string;
  location?: string;
  performedBy: string;
  status: EventProcessingStatus;
  priority: EventPriority;
  validationStatus: EventValidationStatus;
  syncStatus: SyncStatus;
  hasAttachments: boolean;
  thumbnail?: string;
  relevanceScore?: number;
}

// Agregaciones para resultados de búsqueda
export interface EventAggregations {
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  byMonth: Record<string, number>;
  byLocation: Record<string, number>;
  byPerformedBy: Record<string, number>;
}

// Configuración de reportes de eventos
export interface EventReportConfig {
  // Configuración temporal
  dateRange: { start: Date; end: Date };
  groupBy: "day" | "week" | "month" | "quarter" | "year";

  // Filtros
  filters: EventSearchConfig;

  // Métricas a incluir
  includeMetrics: EventReportMetric[];

  // Configuración de visualización
  chartTypes: ChartType[];
  includeCharts: boolean;
  includeTables: boolean;
  includeExport: boolean;

  // Configuración de formato
  format: "pdf" | "excel" | "csv" | "json";
  language: "es" | "en";

  // Configuración de entrega
  deliveryMethod?: "download" | "email" | "api";
  recipients?: string[];
  schedule?: ReportSchedule;
}

// Métricas para reportes
export enum EventReportMetric {
  TOTAL_EVENTS = "total_events",
  EVENTS_BY_TYPE = "events_by_type",
  EVENTS_BY_ANIMAL = "events_by_animal",
  EVENTS_BY_LOCATION = "events_by_location",
  COMPLETION_RATE = "completion_rate",
  AVERAGE_RESPONSE_TIME = "average_response_time",
  COST_ANALYSIS = "cost_analysis",
  TREND_ANALYSIS = "trend_analysis",
  COMPLIANCE_RATE = "compliance_rate",
  ERROR_RATE = "error_rate",
}

// Tipos de gráficos
export enum ChartType {
  BAR = "bar",
  LINE = "line",
  PIE = "pie",
  AREA = "area",
  SCATTER = "scatter",
  HEATMAP = "heatmap",
  TIMELINE = "timeline",
}

// Programación de reportes
export interface ReportSchedule {
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  dayOfWeek?: number; // 0-6 para semanal
  dayOfMonth?: number; // 1-31 para mensual
  time: string; // HH:MM formato 24h
  timezone: string;
  isActive: boolean;
  nextRun?: Date;
}

// Operaciones en lote para eventos
export interface EventBatchOperation {
  operation: "create" | "update" | "delete" | "validate" | "export" | "import";
  eventIds?: string[];
  data?: any[];
  filters?: EventSearchConfig;
  options?: BatchOperationOptions;
}

// Opciones para operaciones en lote
export interface BatchOperationOptions {
  // Control de procesamiento
  batchSize?: number;
  parallelProcessing?: boolean;
  maxRetries?: number;

  // Manejo de errores
  stopOnError?: boolean;
  rollbackOnError?: boolean;

  // Validación
  validateBeforeProcess?: boolean;
  skipValidation?: boolean;

  // Notificaciones
  notifyOnCompletion?: boolean;
  notifyOnError?: boolean;
  notificationRecipients?: string[];

  // Configuración específica
  updateFields?: string[];
  preserveOriginal?: boolean;
  createBackup?: boolean;
}

// Resultado de operación en lote
export interface BatchOperationResult {
  operation: string;
  totalItems: number;
  processedItems: number;
  successfulItems: number;
  failedItems: number;
  skippedItems: number;

  // Detalles de resultados
  results: BatchItemResult[];

  // Información de rendimiento
  startTime: Date;
  endTime: Date;
  duration: number; // en milisegundos

  // Resumen de errores
  errorSummary: Record<string, number>;

  // Información adicional
  backupCreated?: boolean;
  backupLocation?: string;
  logLocation?: string;
}

// Resultado individual de operación en lote
export interface BatchItemResult {
  id: string;
  status: "success" | "error" | "skipped";
  message?: string;
  error?: string;
  data?: any;
  processingTime?: number;
}

// Configuración de exportación de eventos
export interface EventExportConfig {
  // Selección de datos
  filters: EventSearchConfig;
  includeFields: string[];
  excludeFields?: string[];

  // Formato de salida
  format: "csv" | "excel" | "json" | "xml" | "pdf";
  encoding?: "utf-8" | "latin1";
  delimiter?: string; // para CSV

  // Configuración de archivos
  includeAttachments: boolean;
  includeImages: boolean;
  compressFiles: boolean;

  // Configuración de datos
  includeMetadata: boolean;
  includeValidationInfo: boolean;
  includeAuditTrail: boolean;

  // Transformaciones
  applyTransformations?: DataTransformation[];

  // Entrega
  deliveryMethod: "download" | "email" | "ftp" | "api";
  filename?: string;
  destination?: string;
}

// Transformación de datos
export interface DataTransformation {
  field: string;
  operation: "format" | "calculate" | "translate" | "lookup" | "custom";
  parameters: Record<string, any>;
  outputField?: string;
}

// Configuración de importación de eventos
export interface EventImportConfig {
  // Fuente de datos
  source: "file" | "api" | "database" | "sensor";
  sourceConfig: any;

  // Mapeo de campos
  fieldMapping: Record<string, string>;

  // Configuración de procesamiento
  batchSize: number;
  validateOnImport: boolean;
  allowDuplicates: boolean;
  updateExisting: boolean;

  // Manejo de errores
  skipInvalidRecords: boolean;
  maxErrors: number;

  // Transformaciones
  preprocessing?: DataTransformation[];
  postprocessing?: DataTransformation[];

  // Configuración de datos
  dateFormat: string;
  timezone: string;
  defaultValues: Record<string, any>;
}

// Configuración de auditoría para eventos
export interface EventAuditConfig {
  // Qué auditar
  trackCreation: boolean;
  trackModification: boolean;
  trackDeletion: boolean;
  trackViewing: boolean;

  // Nivel de detalle
  includeFieldChanges: boolean;
  includeOldValues: boolean;
  includeUserAgent: boolean;
  includeIpAddress: boolean;

  // Retención
  retentionPeriod: number; // en días
  archiveOldRecords: boolean;

  // Configuración de almacenamiento
  storageLocation: "database" | "file" | "external";
  encryptSensitiveData: boolean;
}

// Registro de auditoría
export interface EventAuditRecord {
  id: string;
  eventId: string;
  action: "create" | "read" | "update" | "delete";
  userId: string;
  userName: string;
  timestamp: Date;

  // Detalles de la acción
  fieldChanges?: FieldChange[];
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;

  // Información del contexto
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;

  // Metadatos
  reason?: string;
  notes?: string;
}

// Cambio de campo en auditoría
export interface FieldChange {
  field: string;
  oldValue: any;
  newValue: any;
  changeType: "added" | "modified" | "removed";
}

// Tipos auxiliares para facilitar el uso
export type EventFormMode = "create" | "edit" | "view" | "duplicate";
export type EventFilterValue = string | number | Date | boolean | any[];
export type EventSortField = string;
export type EventSortOrder = "asc" | "desc";

// Handlers para eventos de la aplicación
export interface EventHandlers {
  onCreate?: (event: any) => Promise<void>;
  onUpdate?: (event: any) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
  onValidate?: (event: any) => Promise<EventValidationResult>;
  onSearch?: (config: EventSearchConfig) => Promise<EventSearchResult>;
  onExport?: (config: EventExportConfig) => Promise<string>;
  onImport?: (config: EventImportConfig) => Promise<BatchOperationResult>;
}
