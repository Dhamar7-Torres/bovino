// src/constants/index.ts
// Exportaciones principales evitando duplicaciones de tipos

// ============================================================================
// EXPORTACIONES DE EVENT TYPES
// ============================================================================

// Exportar todo de eventTypes
export type {
  BaseEvent,
  VaccinationEvent,
  IllnessEvent,
  ReproductiveEvent,
  TransferEvent,
  ManagementEvent,
  HealthEvent,
  TreatmentInfo,
  VitalSigns,
  CalfInfo,
  AdministrationRoute,
} from "./eventTypes";

export {
  EventType,
  ReproductiveEventType,
  TransferType,
  TransferReason,
  ManagementType,
  HealthCheckType,
  IllnessSeverity,
  ApplicationMethod,
  BodyPart,
  DiagnosisMethod,
  CalvingDifficulty,
} from "./eventTypes";

// ============================================================================
// EXPORTACIONES DE PRODUCTION TYPES
// ============================================================================

export {
  ServiceType,
  EstrusDetectionMethod,
  EstrusSign,
  EstrusIntensity,
  PregnancyCheckMethod,
  PregnancyResult,
  CalvingEase,
  CalvingAssistanceType,
  CalfGender,
  CalfVigor,
  CalfHealthStatus,
  CalvingComplication,
  FeedEfficiencyRating,
  WeightGainTrend,
  SlaughterReadinessScore,
} from "./productionTypes";

// ============================================================================
// EXPORTACIONES DE ITEM CATEGORIES
// ============================================================================

export {
  ItemCategory,
  EquipmentType,
  SupplyType,
  Lifestage,
  MeasurementUnit,
  VitaminType,
  MineralType,
  MaintenanceFrequency,
} from "./itemCategories";

// ============================================================================
// EXPORTACIONES DE REPORT TYPES
// ============================================================================

export {
  ReportType,
  ReportFormat,
  ReportStatus,
  FilterOperator,
  SortDirection,
  SortOrder,
  FieldType,
  PageSize,
  PageOrientation,
  ScheduleFrequency,
  DeliveryMethod,
  EscalationLevel,
  SpatialRiskLevel,
  ResourceType,
  ResourceAvailability,
} from "./reportTypes";

// ============================================================================
// CONSTANTES GLOBALES
// ============================================================================

export const SYSTEM_CONSTANTS = {
  DEFAULT_LANGUAGE: "es",
  DEFAULT_CURRENCY: "MXN",
  DEFAULT_DATE_FORMAT: "DD/MM/YYYY",
  DEFAULT_TIME_FORMAT: "24h",
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  SUPPORTED_DOCUMENT_TYPES: [
    "application/pdf",
    "text/plain",
    "application/msword",
  ],
} as const;
