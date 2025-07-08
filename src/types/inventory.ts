// Tipos para gestión de inventario en la aplicación de gestión ganadera
// Se integra con los tipos base definidos en constants/itemCategories.ts

// Importación de tipos base (se asume que están en el mismo nivel)
// import { BaseItem, ItemCategory, MeasurementUnit } from '../constants/itemCategories';

// Estados del inventario
export enum InventoryStatus {
  IN_STOCK = "in_stock",
  LOW_STOCK = "low_stock",
  OUT_OF_STOCK = "out_of_stock",
  OVERSTOCKED = "overstocked",
  RESERVED = "reserved",
  EXPIRED = "expired",
  DAMAGED = "damaged",
  QUARANTINED = "quarantined",
  DISCONTINUED = "discontinued",
}

// Tipos de movimientos de inventario
export enum MovementType {
  PURCHASE = "purchase",
  SALE = "sale",
  USAGE = "usage",
  ADJUSTMENT = "adjustment",
  TRANSFER = "transfer",
  RETURN = "return",
  DISPOSAL = "disposal",
  LOSS = "loss",
  FOUND = "found",
  MANUFACTURING = "manufacturing",
  CONSUMPTION = "consumption",
  RESERVATION = "reservation",
  RELEASE = "release",
}

// Razones para movimientos de inventario
export enum MovementReason {
  // Razones para uso/consumo
  VACCINATION = "vaccination",
  TREATMENT = "treatment",
  FEEDING = "feeding",
  ROUTINE_USE = "routine_use",

  // Razones para ajustes
  PHYSICAL_COUNT = "physical_count",
  SYSTEM_ERROR = "system_error",
  DAMAGE = "damage",
  EXPIRATION = "expiration",
  THEFT = "theft",

  // Razones para transferencias
  LOCATION_CHANGE = "location_change",
  REORGANIZATION = "reorganization",
  EMERGENCY_TRANSFER = "emergency_transfer",

  // Razones para disposición
  EXPIRED_DISPOSAL = "expired_disposal",
  DAMAGED_DISPOSAL = "damaged_disposal",
  RECALL = "recall",
  ENVIRONMENTAL = "environmental",

  // Otras razones
  INITIAL_STOCK = "initial_stock",
  CORRECTION = "correction",
  OTHER = "other",
}

// Métodos de valoración de inventario
export enum ValuationMethod {
  FIFO = "fifo", // First In, First Out
  LIFO = "lifo", // Last In, First Out
  AVERAGE_COST = "average_cost",
  STANDARD_COST = "standard_cost",
  SPECIFIC_IDENTIFICATION = "specific_identification",
}

// Tipos de alertas de inventario
export enum AlertType {
  LOW_STOCK = "low_stock",
  OUT_OF_STOCK = "out_of_stock",
  OVERSTOCKED = "overstocked",
  EXPIRING_SOON = "expiring_soon",
  EXPIRED = "expired",
  COST_VARIANCE = "cost_variance",
  SLOW_MOVING = "slow_moving",
  FAST_MOVING = "fast_moving",
  NEGATIVE_STOCK = "negative_stock",
}

// Prioridades de alertas
export enum AlertPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Estados de órdenes de compra
export enum PurchaseOrderStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  APPROVED = "approved",
  REJECTED = "rejected",
  SENT_TO_SUPPLIER = "sent_to_supplier",
  ACKNOWLEDGED = "acknowledged",
  PARTIALLY_RECEIVED = "partially_received",
  FULLY_RECEIVED = "fully_received",
  CANCELLED = "cancelled",
  CLOSED = "closed",
}

// Estados de recepciones
export enum ReceiptStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  COMPLETE = "complete",
  DISCREPANCY = "discrepancy",
  REJECTED = "rejected",
}

// Registro de stock actual para un item
export interface StockRecord {
  // Identificación del item
  itemId: string;
  item?: any; // Referencia al BaseItem

  // Cantidades
  currentStock: number;
  availableStock: number; // stock actual - reservado
  reservedStock: number;
  inTransitStock: number; // en camino

  // Puntos de control
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  safetyStock: number;

  // Ubicación
  locationId: string;
  locationName: string;
  zone?: string;
  shelf?: string;

  // Estados
  status: InventoryStatus;
  lastMovementDate: Date;
  lastCountDate?: Date;

  // Valoración
  averageCost: number;
  totalValue: number;
  valuationMethod: ValuationMethod;

  // Información de lotes
  batches: BatchRecord[];

  // Métricas
  turnoverRate?: number; // rotación anual
  daysOfSupply?: number; // días de suministro
  velocity?: "fast" | "medium" | "slow"; // velocidad de movimiento

  // Metadatos
  createdAt: Date;
  updatedAt: Date;
  lastUpdatedBy: string;
}

// Registro de lotes/batches
export interface BatchRecord {
  // Identificación
  batchId: string;
  batchNumber: string;
  lotNumber?: string;
  serialNumbers?: string[];

  // Cantidades
  quantity: number;
  availableQuantity: number;

  // Información del lote
  manufacturingDate?: Date;
  expirationDate?: Date;
  receivedDate: Date;

  // Costo
  unitCost: number;
  totalCost: number;

  // Estado
  status: "active" | "expired" | "recalled" | "quarantined";

  // Información del proveedor
  supplierId?: string;
  supplierName?: string;

  // Información de recepción
  receiptId?: string;
  purchaseOrderId?: string;

  // Certificaciones y documentos
  certificates?: CertificateRecord[];
  qualityTests?: QualityTestRecord[];

  // Trazabilidad
  sourceLocation?: string;
  traceabilityCode?: string;
}

// Registro de certificaciones
export interface CertificateRecord {
  type: "quality" | "organic" | "safety" | "regulatory";
  number: string;
  issuer: string;
  issueDate: Date;
  expirationDate?: Date;
  status: "valid" | "expired" | "revoked";
  documentUrl?: string;
}

// Registro de pruebas de calidad
export interface QualityTestRecord {
  testType: string;
  testDate: Date;
  result: "pass" | "fail" | "conditional";
  testedBy: string;
  parameters: QualityParameter[];
  notes?: string;
  certificateUrl?: string;
}

// Parámetro de calidad
export interface QualityParameter {
  parameter: string;
  value: number | string;
  unit?: string;
  specification: string;
  status: "within_spec" | "out_of_spec" | "marginal";
}

// Movimiento de inventario
export interface InventoryMovement {
  // Identificación
  id: string;
  movementNumber: string;

  // Información básica
  itemId: string;
  batchId?: string;
  movementType: MovementType;
  reason: MovementReason;

  // Cantidades
  quantity: number;
  unit: string; // MeasurementUnit

  // Costos
  unitCost?: number;
  totalCost?: number;

  // Ubicaciones
  fromLocationId?: string;
  fromLocationName?: string;
  toLocationId?: string;
  toLocationName?: string;

  // Referencias
  referenceType?: "event" | "order" | "transfer" | "adjustment";
  referenceId?: string;
  animalId?: string; // si está relacionado con un animal específico
  eventId?: string; // si está relacionado con un evento

  // Información del movimiento
  movementDate: Date;
  effectiveDate?: Date; // fecha en que toma efecto

  // Personal
  performedBy: string;
  authorizedBy?: string;
  veterinarianId?: string; // para movimientos médicos

  // Estados
  status: "pending" | "completed" | "cancelled" | "reversed";
  isReversed: boolean;
  reversedBy?: string;
  reversalReason?: string;

  // Documentación
  notes?: string;
  attachments?: string[];

  // Metadatos
  createdAt: Date;
  updatedAt: Date;
}

// Configuración de alertas de inventario
export interface InventoryAlertConfig {
  // Identificación
  id: string;
  itemId: string;
  locationId?: string;

  // Configuración de la alerta
  alertType: AlertType;
  priority: AlertPriority;
  isActive: boolean;

  // Condiciones
  conditions: AlertCondition[];

  // Acciones
  actions: AlertAction[];

  // Frecuencia
  checkFrequency: "realtime" | "hourly" | "daily" | "weekly";
  lastChecked?: Date;

  // Configuración de notificaciones
  notificationChannels: NotificationChannel[];
  recipients: string[];

  // Configuración avanzada
  suppressDuration?: number; // minutos antes de reenviar
  escalationRules?: EscalationRule[];

  // Metadatos
  createdAt: Date;
  createdBy: string;
  updatedAt?: Date;
}

// Condición de alerta
export interface AlertCondition {
  field:
    | "currentStock"
    | "availableStock"
    | "daysUntilExpiry"
    | "costVariance"
    | "turnoverRate";
  operator: "=" | "!=" | ">" | "<" | ">=" | "<=" | "between";
  value: number | number[];
  unit?: string;
}

// Acción de alerta
export interface AlertAction {
  type: "notification" | "email" | "sms" | "webhook" | "auto_order";
  configuration: Record<string, any>;
  isEnabled: boolean;
}

// Canal de notificación
export interface NotificationChannel {
  type: "email" | "sms" | "push" | "webhook" | "system";
  address: string;
  isEnabled: boolean;
}

// Regla de escalación
export interface EscalationRule {
  level: number;
  delayMinutes: number;
  recipients: string[];
  channels: NotificationChannel[];
  condition?: string; // condición para activar escalación
}

// Alerta generada
export interface InventoryAlert {
  // Identificación
  id: string;
  configId: string;

  // Información básica
  alertType: AlertType;
  priority: AlertPriority;
  itemId: string;
  itemName: string;
  locationId?: string;
  locationName?: string;

  // Estado de la alerta
  status: "active" | "acknowledged" | "resolved" | "suppressed";
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;

  // Información de la condición
  triggerCondition: string;
  currentValue: number;
  thresholdValue: number;

  // Detalles
  title: string;
  message: string;
  recommendation?: string;

  // Fechas
  triggeredAt: Date;
  lastNotificationSent?: Date;
  nextNotificationDue?: Date;

  // Contadores
  notificationsSent: number;
  escalationLevel: number;

  // Datos adicionales
  metadata: Record<string, any>;
}

// Orden de compra
export interface PurchaseOrder {
  // Identificación
  id: string;
  orderNumber: string;

  // Información del proveedor
  supplierId: string;
  supplierName: string;
  supplierContact?: ContactInfo;

  // Estado
  status: PurchaseOrderStatus;

  // Fechas
  orderDate: Date;
  requiredDate: Date;
  expectedDeliveryDate?: Date;

  // Items ordenados
  items: PurchaseOrderItem[];

  // Totales
  subtotal: number;
  taxes: number;
  shipping: number;
  total: number;
  currency: string;

  // Información de entrega
  deliveryAddress: Address;
  deliveryInstructions?: string;

  // Términos y condiciones
  paymentTerms: string;
  shippingTerms?: string;

  // Personal
  requestedBy: string;
  approvedBy?: string;
  purchasingAgent?: string;

  // Estados de procesamiento
  approvalRequired: boolean;
  isApproved: boolean;
  approvalDate?: Date;

  // Información de facturación
  invoiceReceived: boolean;
  invoiceNumber?: string;
  invoiceDate?: Date;

  // Documentación
  notes?: string;
  attachments?: string[];

  // Metadatos
  createdAt: Date;
  updatedAt?: Date;
}

// Item de orden de compra
export interface PurchaseOrderItem {
  // Identificación
  itemId: string;
  itemName: string;
  itemSku?: string;

  // Cantidades
  quantityOrdered: number;
  quantityReceived: number;
  quantityRemaining: number;
  unit: string;

  // Precios
  unitPrice: number;
  totalPrice: number;

  // Información adicional
  description?: string;
  specifications?: string;

  // Información de lote/batch
  requestedBatch?: string;
  requestedExpirationDate?: Date;

  // Estado
  status: "pending" | "partial" | "complete" | "cancelled";

  // Fechas
  requiredDate?: Date;
  expectedDate?: Date;
}

// Información de contacto
export interface ContactInfo {
  name: string;
  phone?: string;
  email?: string;
  fax?: string;
}

// Dirección
export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Recepción de mercancía
export interface ItemReceipt {
  // Identificación
  id: string;
  receiptNumber: string;

  // Referencias
  purchaseOrderId?: string;
  supplierDeliveryNote?: string;

  // Información básica
  supplierId: string;
  supplierName: string;

  // Fechas
  receivedDate: Date;
  expectedDate?: Date;

  // Estado
  status: ReceiptStatus;

  // Items recibidos
  items: ReceiptItem[];

  // Personal
  receivedBy: string;
  inspectedBy?: string;
  authorizedBy?: string;

  // Información de calidad
  qualityInspectionRequired: boolean;
  qualityInspectionPassed?: boolean;
  qualityNotes?: string;

  // Documentación
  deliveryNote?: string;
  packingList?: string;
  certificates?: string[];
  photos?: string[];

  // Discrepancias
  hasDiscrepancies: boolean;
  discrepancies?: ReceiptDiscrepancy[];

  // Notas y observaciones
  notes?: string;

  // Metadatos
  createdAt: Date;
  updatedAt?: Date;
}

// Item recibido
export interface ReceiptItem {
  // Identificación
  itemId: string;
  itemName: string;
  orderItemId?: string;

  // Cantidades
  quantityOrdered?: number;
  quantityReceived: number;
  quantityAccepted: number;
  quantityRejected: number;
  unit: string;

  // Información de lote
  batchNumber?: string;
  lotNumber?: string;
  serialNumbers?: string[];
  manufacturingDate?: Date;
  expirationDate?: Date;

  // Calidad
  condition: "good" | "damaged" | "expired" | "defective";
  qualityGrade?: string;

  // Ubicación
  destinationLocationId: string;
  destinationLocationName: string;

  // Costos
  unitCost?: number;
  totalCost?: number;

  // Estado
  status: "accepted" | "rejected" | "quarantined" | "pending_inspection";

  // Notas
  notes?: string;
}

// Discrepancia en recepción
export interface ReceiptDiscrepancy {
  type: "quantity" | "quality" | "specification" | "damage" | "expiration";
  itemId: string;
  itemName: string;
  description: string;

  // Valores esperados vs recibidos
  expectedValue: string | number;
  receivedValue: string | number;

  // Resolución
  resolution?:
    | "accepted"
    | "rejected"
    | "partial_acceptance"
    | "return_to_supplier";
  resolutionNotes?: string;
  resolutionDate?: Date;

  // Documentación
  photos?: string[];
  supportingDocs?: string[];
}

// Ajuste de inventario
export interface InventoryAdjustment {
  // Identificación
  id: string;
  adjustmentNumber: string;

  // Información básica
  adjustmentType:
    | "physical_count"
    | "system_correction"
    | "damage"
    | "loss"
    | "found"
    | "other";
  reason: MovementReason;

  // Fechas
  adjustmentDate: Date;
  effectiveDate?: Date;

  // Items ajustados
  items: AdjustmentItem[];

  // Personal
  performedBy: string;
  approvedBy?: string;
  supervisedBy?: string;

  // Estados
  status: "draft" | "pending_approval" | "approved" | "applied" | "cancelled";
  requiresApproval: boolean;

  // Información de impacto
  totalValueImpact: number;
  totalQuantityImpact: number;

  // Documentación
  documentation?: string[];
  photos?: string[];
  notes?: string;

  // Metadatos
  createdAt: Date;
  updatedAt?: Date;
}

// Item de ajuste
export interface AdjustmentItem {
  // Identificación
  itemId: string;
  itemName: string;
  batchId?: string;

  // Cantidades
  systemQuantity: number; // lo que dice el sistema
  physicalQuantity: number; // lo que se encontró físicamente
  adjustmentQuantity: number; // diferencia
  unit: string;

  // Ubicación
  locationId: string;
  locationName: string;

  // Costos
  unitCost: number;
  adjustmentValue: number; // impacto monetario

  // Razón específica
  reason: string;
  notes?: string;

  // Estado
  status: "pending" | "applied" | "cancelled";
}

// Conteo físico de inventario
export interface PhysicalCount {
  // Identificación
  id: string;
  countNumber: string;

  // Información básica
  countType: "full" | "partial" | "cycle" | "spot_check";

  // Alcance
  locations: string[];
  categories?: string[]; // ItemCategory[]
  items?: string[]; // items específicos

  // Fechas
  scheduledDate: Date;
  startDate?: Date;
  endDate?: Date;

  // Estado
  status: "scheduled" | "in_progress" | "completed" | "cancelled";

  // Personal
  counters: CounterAssignment[];
  supervisor: string;

  // Configuración
  allowNegativeVariances: boolean;
  varianceThreshold: number; // porcentaje
  requiresSecondCount: boolean;

  // Resultados
  itemsCounted: number;
  totalItems: number;
  itemsWithVariances: number;
  totalVarianceValue: number;

  // Documentación
  instructions?: string;
  notes?: string;

  // Metadatos
  createdAt: Date;
  updatedAt?: Date;
}

// Asignación de contador
export interface CounterAssignment {
  userId: string;
  userName: string;
  locations: string[];
  categories?: string[];
  startTime?: Date;
  endTime?: Date;
  status: "assigned" | "in_progress" | "completed";
}

// Transferencia de inventario
export interface InventoryTransfer {
  // Identificación
  id: string;
  transferNumber: string;

  // Ubicaciones
  fromLocationId: string;
  fromLocationName: string;
  toLocationId: string;
  toLocationName: string;

  // Fechas
  requestDate: Date;
  requiredDate?: Date;
  shippedDate?: Date;
  receivedDate?: Date;

  // Estado
  status: "requested" | "approved" | "shipped" | "received" | "cancelled";

  // Items transferidos
  items: TransferItem[];

  // Personal
  requestedBy: string;
  approvedBy?: string;
  shippedBy?: string;
  receivedBy?: string;

  // Información de transporte
  transportMethod?: string;
  trackingNumber?: string;

  // Documentación
  transferNote?: string;
  packingList?: string;
  photos?: string[];

  // Discrepancias
  hasDiscrepancies: boolean;
  discrepancies?: TransferDiscrepancy[];

  // Metadatos
  createdAt: Date;
  updatedAt?: Date;
}

// Item de transferencia
export interface TransferItem {
  itemId: string;
  itemName: string;
  batchId?: string;

  quantityRequested: number;
  quantityShipped: number;
  quantityReceived: number;
  unit: string;

  condition: "good" | "damaged" | "expired";
  notes?: string;
}

// Discrepancia en transferencia
export interface TransferDiscrepancy {
  type: "quantity" | "quality" | "missing" | "extra";
  itemId: string;
  itemName: string;
  description: string;
  quantityDiscrepancy?: number;
  resolution?: string;
  resolutionDate?: Date;
}

// Configuración de inventario
export interface InventoryConfig {
  // Configuración general
  defaultValuationMethod: ValuationMethod;
  allowNegativeStock: boolean;
  requireBatchTracking: boolean[];
  autoCreateBatches: boolean;

  // Configuración de alertas
  defaultAlertThresholds: {
    lowStockPercentage: number;
    expiryWarningDays: number;
    overstockThreshold: number;
  };

  // Configuración de movimientos
  requireApprovalForMovements: boolean;
  approvalThreshold: number;
  autoGenerateMovementNumbers: boolean;

  // Configuración de conteos
  countFrequency: {
    fast: number; // días
    medium: number;
    slow: number;
  };

  // Configuración de reportes
  defaultReportingPeriod: "weekly" | "monthly" | "quarterly";
  includeExpiredInReports: boolean;

  // Configuración de ubicaciones
  enforceLocationTracking: boolean;
  allowMultipleLocations: boolean;

  // Configuración de integración
  syncWithAccounting: boolean;
  syncWithEvents: boolean;
  autoCreatePurchaseOrders: boolean;
}

// Reporte de inventario
export interface InventoryReport {
  // Identificación
  id: string;
  reportType:
    | "stock_status"
    | "movements"
    | "valuation"
    | "aging"
    | "turnover"
    | "alerts";

  // Parámetros
  dateRange: { start: Date; end: Date };
  locations?: string[];
  categories?: string[];
  items?: string[];

  // Datos del reporte
  generatedAt: Date;
  generatedBy: string;

  // Contenido (específico por tipo de reporte)
  data: any;

  // Resumen ejecutivo
  summary: ReportSummary;

  // Configuración
  format: "json" | "csv" | "pdf" | "excel";
  includeCharts: boolean;
  includeDetails: boolean;
}

// Resumen de reporte
export interface ReportSummary {
  totalItems: number;
  totalValue: number;
  totalMovements?: number;
  keyMetrics: KeyMetric[];
  trends: TrendData[];
  alerts: number;
}

// Métrica clave
export interface KeyMetric {
  name: string;
  value: number;
  unit: string;
  changeFromPrevious?: number;
  changePercentage?: number;
  trend: "up" | "down" | "stable";
}

// Datos de tendencia
export interface TrendData {
  period: string;
  value: number;
  label: string;
}

// Tipos auxiliares para facilitar el uso
export type InventoryFilter = {
  categories?: string[];
  locations?: string[];
  statuses?: InventoryStatus[];
  dateRange?: { start: Date; end: Date };
  searchText?: string;
};

export type InventorySearchResult = {
  items: StockRecord[];
  totalCount: number;
  filteredCount: number;
  aggregations?: {
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    byLocation: Record<string, number>;
  };
};

// Handlers para eventos de inventario
export interface InventoryHandlers {
  onStockChange?: (
    itemId: string,
    oldStock: number,
    newStock: number
  ) => Promise<void>;
  onMovementCreate?: (movement: InventoryMovement) => Promise<void>;
  onAlertTriggered?: (alert: InventoryAlert) => Promise<void>;
  onLowStock?: (stockRecord: StockRecord) => Promise<void>;
  onExpiringSoon?: (batchRecord: BatchRecord) => Promise<void>;
  onPurchaseOrderCreate?: (order: PurchaseOrder) => Promise<void>;
  onReceiptComplete?: (receipt: ItemReceipt) => Promise<void>;
  onTransferComplete?: (transfer: InventoryTransfer) => Promise<void>;
}
