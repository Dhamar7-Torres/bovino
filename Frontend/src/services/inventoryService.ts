import { api, apiClient } from "./api";

// Interfaces principales para inventario
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp?: string;
}

interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface BaseItem extends BaseEntity {
  name: string;
  description?: string;
  category: ItemCategory;
  subcategory: string;
  brand?: string;
  manufacturer?: string;
  sku?: string;
  barcode?: string;
  unit: MeasurementUnit;
  costPerUnit: number;
  currency: string;
  location?: ItemLocation;
  tags?: string[];
  isActive: boolean;
  isTracked: boolean;
  minimumStock?: number;
  maximumStock?: number;
  reorderPoint?: number;
  images?: string[];
}

interface ItemLocation {
  building?: string;
  room?: string;
  shelf?: string;
  bin?: string;
  coordinates?: Location;
}

interface MedicationItem extends BaseItem {
  category: ItemCategory.MEDICATIONS;
  activeIngredient: string;
  concentration: string;
  form: MedicationForm;
  administrationRoute: AdministrationRoute[];
  withdrawalPeriod?: number;
  prescriptionRequired: boolean;
  controlledSubstance: boolean;
  sideEffects?: string[];
  contraindications?: string[];
  targetSpecies: string[];
  storageRequirements: StorageRequirements;
}

interface VaccineItem extends BaseItem {
  category: ItemCategory.VACCINES;
  vaccineType: VaccineType;
  valency: number;
  diseasesPrevented: string[];
  ageRecommendation: AgeRecommendation;
  boosterRequired: boolean;
  boosterInterval?: number;
  storageTemperature: TemperatureRange;
  coldChainRequired: boolean;
  shelfLife: number;
}

interface FeedItem extends BaseItem {
  category: ItemCategory.FEED;
  feedType: FeedType;
  lifestage: Lifestage[];
  nutritionalInfo: NutritionalInfo;
  ingredients: string[];
  storageRequirements: StorageRequirements;
  shelfLife: number;
  isOrganic: boolean;
  isMedicated: boolean;
}

interface SupplementItem extends BaseItem {
  category: ItemCategory.SUPPLEMENTS;
  supplementType: SupplementType;
  activeComponents: ActiveComponent[];
  recommendedDosage: string;
  administrationMethod: string[];
  targetFunction: string[];
  lifestage: Lifestage[];
}

interface EquipmentItem extends BaseItem {
  category: ItemCategory.EQUIPMENT;
  equipmentType: EquipmentType;
  modelNumber?: string;
  serialNumber?: string;
  warrantyDate?: Date;
  maintenanceSchedule?: MaintenanceInfo;
  calibrationRequired: boolean;
  lastCalibration?: Date;
  nextCalibration?: Date;
  operatingManual?: string;
  safetyInstructions?: string[];
}

interface StockRecord extends BaseEntity {
  itemId: string;
  currentStock: number;
  availableStock: number;
  reservedStock: number;
  inTransitStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  safetyStock: number;
  locationId: string;
  locationName: string;
  zone?: string;
  shelf?: string;
  status: InventoryStatus;
  lastMovementDate: Date;
  lastCountDate?: Date;
  averageCost: number;
  totalValue: number;
  valuationMethod: ValuationMethod;
  batches: BatchRecord[];
  turnoverRate?: number;
  daysOfSupply?: number;
  velocity?: "fast" | "medium" | "slow";
  lastUpdatedBy: string;
}

interface BatchRecord {
  batchId: string;
  batchNumber: string;
  lotNumber?: string;
  serialNumbers?: string[];
  quantity: number;
  availableQuantity: number;
  manufacturingDate?: Date;
  expirationDate?: Date;
  receivedDate: Date;
  unitCost: number;
  totalCost: number;
  status: "active" | "expired" | "recalled" | "quarantined";
  supplierId?: string;
  supplierName?: string;
  receiptId?: string;
  purchaseOrderId?: string;
  certificates?: CertificateRecord[];
  qualityTests?: QualityTestRecord[];
  sourceLocation?: string;
  traceabilityCode?: string;
}

interface CertificateRecord {
  type: "quality" | "organic" | "safety" | "regulatory";
  number: string;
  issuer: string;
  issueDate: Date;
  expirationDate?: Date;
  status: "valid" | "expired" | "revoked";
  documentUrl?: string;
}

interface QualityTestRecord {
  testType: string;
  testDate: Date;
  result: "pass" | "fail" | "conditional";
  testedBy: string;
  parameters: QualityParameter[];
  notes?: string;
  certificateUrl?: string;
}

interface QualityParameter {
  parameter: string;
  value: number | string;
  unit?: string;
  specification: string;
  status: "within_spec" | "out_of_spec" | "marginal";
}

interface InventoryMovement extends BaseEntity {
  movementNumber: string;
  itemId: string;
  batchId?: string;
  movementType: MovementType;
  reason: MovementReason;
  quantity: number;
  unit: string;
  unitCost?: number;
  totalCost?: number;
  fromLocationId?: string;
  fromLocationName?: string;
  toLocationId?: string;
  toLocationName?: string;
  referenceType?: "event" | "order" | "transfer" | "adjustment";
  referenceId?: string;
  animalId?: string;
  eventId?: string;
  movementDate: Date;
  effectiveDate?: Date;
  performedBy: string;
  authorizedBy?: string;
  veterinarianId?: string;
  status: "pending" | "completed" | "cancelled" | "reversed";
  isReversed: boolean;
  reversedBy?: string;
  reversalReason?: string;
  notes?: string;
  attachments?: string[];
  location?: Location;
}

interface PurchaseOrder extends BaseEntity {
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  requestedDeliveryDate?: Date;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  totalAmount: number;
  currency: string;
  terms?: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  sentAt?: Date;
  acknowledgedAt?: Date;
  expectedDeliveryDate?: Date;
  deliveryLocation?: Location;
  trackingNumber?: string;
}

interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity: number;
  pendingQuantity: number;
  notes?: string;
}

interface Receipt extends BaseEntity {
  receiptNumber: string;
  purchaseOrderId?: string;
  supplierId: string;
  supplierName: string;
  receivedDate: Date;
  receivedBy: string;
  status: ReceiptStatus;
  items: ReceiptItem[];
  location: Location;
  inspectedBy?: string;
  inspectionNotes?: string;
  qualityApproved: boolean;
  attachments?: string[];
  discrepancies?: Discrepancy[];
}

interface ReceiptItem {
  itemId: string;
  itemName: string;
  orderedQuantity?: number;
  receivedQuantity: number;
  unit: string;
  batchNumber?: string;
  lotNumber?: string;
  expirationDate?: Date;
  manufacturingDate?: Date;
  unitCost: number;
  totalCost: number;
  condition: "good" | "damaged" | "expired" | "rejected";
  qualityNotes?: string;
  serialNumbers?: string[];
}

interface Discrepancy {
  type: "quantity" | "quality" | "specification" | "packaging";
  description: string;
  severity: "minor" | "major" | "critical";
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

interface InventoryAlert extends BaseEntity {
  itemId: string;
  locationId?: string;
  alertType: AlertType;
  priority: AlertPriority;
  title: string;
  description: string;
  currentValue: number;
  threshold: number;
  status: "active" | "acknowledged" | "resolved" | "suppressed";
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  suppressedUntil?: Date;
  actions: string[];
  notifiedUsers: string[];
}

interface InventoryReport {
  reportId: string;
  reportType: ReportType;
  name: string;
  description?: string;
  parameters: any;
  generatedAt: Date;
  generatedBy: string;
  format: "pdf" | "excel" | "csv" | "json";
  downloadUrl?: string;
  expiresAt?: Date;
  data: any;
  filters?: any;
}

interface CycleCount extends BaseEntity {
  countNumber: string;
  name: string;
  description?: string;
  countType: "full" | "partial" | "abc" | "random";
  scheduledDate: Date;
  startDate?: Date;
  completedDate?: Date;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  locations: string[];
  categories: ItemCategory[];
  items: CycleCountItem[];
  performedBy: string[];
  supervisedBy?: string;
  accuracy: number;
  discrepancies: number;
  adjustments: number;
  notes?: string;
}

interface CycleCountItem {
  itemId: string;
  itemName: string;
  expectedQuantity: number;
  countedQuantity: number;
  difference: number;
  differencePercentage: number;
  status: "pending" | "counted" | "verified" | "adjusted";
  countedBy: string;
  countedAt?: Date;
  verifiedBy?: string;
  verifiedAt?: Date;
  notes?: string;
}

// Enums
enum ItemCategory {
  MEDICATIONS = "medications",
  VACCINES = "vaccines",
  FEED = "feed",
  SUPPLEMENTS = "supplements",
  EQUIPMENT = "equipment",
  SUPPLIES = "supplies",
  TOOLS = "tools",
  SAFETY = "safety",
  CLEANING = "cleaning",
  REPRODUCTION = "reproduction",
  IDENTIFICATION = "identification",
  BEDDING = "bedding",
}

enum MeasurementUnit {
  KILOGRAMS = "kg",
  GRAMS = "g",
  POUNDS = "lb",
  OUNCES = "oz",
  LITERS = "l",
  MILLILITERS = "ml",
  GALLONS = "gal",
  PIECES = "pcs",
  BOXES = "box",
  BAGS = "bag",
  BOTTLES = "bottle",
  VIALS = "vial",
  DOSES = "dose",
}

enum MedicationForm {
  INJECTION = "injection",
  ORAL_LIQUID = "oral_liquid",
  TABLETS = "tablets",
  CAPSULES = "capsules",
  POWDER = "powder",
  PASTE = "paste",
  TOPICAL = "topical",
  IMPLANT = "implant",
  BOLUS = "bolus",
  SPRAY = "spray",
}

enum AdministrationRoute {
  INTRAMUSCULAR = "intramuscular",
  SUBCUTANEOUS = "subcutaneous",
  INTRAVENOUS = "intravenous",
  ORAL = "oral",
  TOPICAL = "topical",
  INTRANASAL = "intranasal",
  INTRAMAMMARY = "intramammary",
  INTRAUTERINE = "intrauterine",
}

enum VaccineType {
  VIRAL = "viral",
  BACTERIAL = "bacterial",
  MODIFIED_LIVE = "modified_live",
  KILLED = "killed",
  COMBINATION = "combination",
  SUBUNIT = "subunit",
  TOXOID = "toxoid",
}

enum FeedType {
  CONCENTRATE = "concentrate",
  FORAGE = "forage",
  HAY = "hay",
  SILAGE = "silage",
  GRAIN = "grain",
  PELLETS = "pellets",
  MASH = "mash",
  COMPLETE_FEED = "complete_feed",
  STARTER = "starter",
  GROWER = "grower",
  FINISHER = "finisher",
  LACTATING = "lactating",
  DRY = "dry",
}

enum SupplementType {
  VITAMIN = "vitamin",
  MINERAL = "mineral",
  VITAMIN_MINERAL = "vitamin_mineral",
  PROTEIN = "protein",
  ENERGY = "energy",
  PROBIOTIC = "probiotic",
  PREBIOTIC = "prebiotic",
  AMINO_ACID = "amino_acid",
  ENZYME = "enzyme",
  ELECTROLYTE = "electrolyte",
}

enum EquipmentType {
  FEEDING = "feeding",
  WATERING = "watering",
  MILKING = "milking",
  HANDLING = "handling",
  WEIGHING = "weighing",
  MEDICAL = "medical",
  REPRODUCTION = "reproduction",
  MONITORING = "monitoring",
  TRANSPORTATION = "transportation",
  FENCING = "fencing",
  SHELTER = "shelter",
}

enum Lifestage {
  CALF = "calf",
  WEANER = "weaner",
  GROWING = "growing",
  BREEDING = "breeding",
  LACTATING = "lactating",
  DRY = "dry",
  FINISHING = "finishing",
  MATURE = "mature",
}

enum InventoryStatus {
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

enum MovementType {
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

enum MovementReason {
  VACCINATION = "vaccination",
  TREATMENT = "treatment",
  FEEDING = "feeding",
  ROUTINE_USE = "routine_use",
  PHYSICAL_COUNT = "physical_count",
  SYSTEM_ERROR = "system_error",
  DAMAGE = "damage",
  EXPIRATION = "expiration",
  THEFT = "theft",
  LOCATION_CHANGE = "location_change",
  REORGANIZATION = "reorganization",
  EMERGENCY_TRANSFER = "emergency_transfer",
  EXPIRED_DISPOSAL = "expired_disposal",
  DAMAGED_DISPOSAL = "damaged_disposal",
  RECALL = "recall",
  ENVIRONMENTAL = "environmental",
  INITIAL_STOCK = "initial_stock",
  CORRECTION = "correction",
  OTHER = "other",
}

enum ValuationMethod {
  FIFO = "fifo",
  LIFO = "lifo",
  AVERAGE_COST = "average_cost",
  STANDARD_COST = "standard_cost",
  SPECIFIC_IDENTIFICATION = "specific_identification",
}

enum AlertType {
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

enum AlertPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

enum PurchaseOrderStatus {
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

enum ReceiptStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  COMPLETE = "complete",
  DISCREPANCY = "discrepancy",
  REJECTED = "rejected",
}

enum ReportType {
  STOCK_STATUS = "stock_status",
  INVENTORY_VALUATION = "inventory_valuation",
  MOVEMENT_HISTORY = "movement_history",
  ABC_ANALYSIS = "abc_analysis",
  TURNOVER_ANALYSIS = "turnover_analysis",
  EXPIRATION_REPORT = "expiration_report",
  LOW_STOCK_REPORT = "low_stock_report",
  PURCHASE_ANALYSIS = "purchase_analysis",
  COST_ANALYSIS = "cost_analysis",
  CYCLE_COUNT_REPORT = "cycle_count_report",
}

// Interfaces adicionales
interface StorageRequirements {
  temperature: TemperatureRange;
  humidity?: HumidityRange;
  lightSensitive: boolean;
  refrigerated: boolean;
  frozen: boolean;
  controlled: boolean;
  specialConditions?: string[];
}

interface TemperatureRange {
  min: number;
  max: number;
  optimal?: number;
}

interface HumidityRange {
  min: number;
  max: number;
  optimal?: number;
}

interface NutritionalInfo {
  protein: number;
  fat: number;
  fiber: number;
  ash: number;
  moisture: number;
  energy: number;
  calcium?: number;
  phosphorus?: number;
  vitamins?: { [key: string]: number };
  minerals?: { [key: string]: number };
}

interface ActiveComponent {
  name: string;
  concentration: number;
  unit: string;
  function: string;
}

interface AgeRecommendation {
  minimumAge: number;
  maximumAge?: number;
  optimalAge?: number;
  notes?: string;
}

interface MaintenanceInfo {
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
  intervalDays?: number;
  lastMaintenance?: Date;
  nextDue?: Date;
  procedures: string[];
  requiredParts?: string[];
  estimatedCost?: number;
}

// Configuración del servicio de inventario
const INVENTORY_CONFIG = {
  CACHE_DURATION: 2 * 60 * 1000, // 2 minutos
  SYNC_INTERVAL: 30 * 1000, // 30 segundos
  ALERT_CHECK_INTERVAL: 60 * 1000, // 1 minuto
  BATCH_SIZE: 50,
  LOW_STOCK_THRESHOLD_PERCENTAGE: 20, // 20% del stock mínimo
  EXPIRATION_WARNING_DAYS: 30, // alertar 30 días antes de vencimiento
  FAST_MOVING_THRESHOLD: 12, // productos que rotan más de 12 veces al año
  SLOW_MOVING_THRESHOLD: 2, // productos que rotan menos de 2 veces al año
  CURRENCY_DEFAULT: "MXN",
  AUTO_REORDER_ENABLED: true,
  QUALITY_CHECK_REQUIRED: true,
} as const;

// Etiquetas en español
const INVENTORY_STATUS_LABELS = {
  [InventoryStatus.IN_STOCK]: "En Stock",
  [InventoryStatus.LOW_STOCK]: "Stock Bajo",
  [InventoryStatus.OUT_OF_STOCK]: "Sin Stock",
  [InventoryStatus.OVERSTOCKED]: "Sobre Stock",
  [InventoryStatus.RESERVED]: "Reservado",
  [InventoryStatus.EXPIRED]: "Vencido",
  [InventoryStatus.DAMAGED]: "Dañado",
  [InventoryStatus.QUARANTINED]: "En Cuarentena",
  [InventoryStatus.DISCONTINUED]: "Descontinuado",
} as const;

const MOVEMENT_TYPE_LABELS = {
  [MovementType.PURCHASE]: "Compra",
  [MovementType.SALE]: "Venta",
  [MovementType.USAGE]: "Uso",
  [MovementType.ADJUSTMENT]: "Ajuste",
  [MovementType.TRANSFER]: "Transferencia",
  [MovementType.RETURN]: "Devolución",
  [MovementType.DISPOSAL]: "Disposición",
  [MovementType.LOSS]: "Pérdida",
  [MovementType.FOUND]: "Encontrado",
  [MovementType.MANUFACTURING]: "Fabricación",
  [MovementType.CONSUMPTION]: "Consumo",
  [MovementType.RESERVATION]: "Reserva",
  [MovementType.RELEASE]: "Liberación",
} as const;

const ITEM_CATEGORY_LABELS = {
  [ItemCategory.MEDICATIONS]: "Medicamentos",
  [ItemCategory.VACCINES]: "Vacunas",
  [ItemCategory.FEED]: "Alimentos",
  [ItemCategory.SUPPLEMENTS]: "Suplementos",
  [ItemCategory.EQUIPMENT]: "Equipos",
  [ItemCategory.SUPPLIES]: "Suministros",
  [ItemCategory.TOOLS]: "Herramientas",
  [ItemCategory.SAFETY]: "Seguridad",
  [ItemCategory.CLEANING]: "Limpieza",
  [ItemCategory.REPRODUCTION]: "Reproducción",
  [ItemCategory.IDENTIFICATION]: "Identificación",
  [ItemCategory.BEDDING]: "Cama",
} as const;

// Clase principal del servicio de inventario
class InventoryService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private syncTimer: number | null = null;
  private alertTimer: number | null = null;
  private pendingOperations: any[] = [];
  private activeAlerts: InventoryAlert[] = [];

  constructor() {
    this.startAutoSync();
    this.startAlertMonitoring();
    this.setupEventListeners();
  }

  // MÉTODOS DE CACHE Y SINCRONIZACIÓN

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired =
      Date.now() - cached.timestamp > INVENTORY_CONFIG.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearCache(): void {
    this.cache.clear();
  }

  private startAutoSync(): void {
    if (this.syncTimer) clearInterval(this.syncTimer);

    this.syncTimer = window.setInterval(async () => {
      if (navigator.onLine && this.pendingOperations.length > 0) {
        await this.syncPendingOperations();
      }
    }, INVENTORY_CONFIG.SYNC_INTERVAL);
  }

  private startAlertMonitoring(): void {
    if (this.alertTimer) clearInterval(this.alertTimer);

    this.alertTimer = window.setInterval(async () => {
      if (navigator.onLine) {
        await this.checkInventoryAlerts();
      }
    }, INVENTORY_CONFIG.ALERT_CHECK_INTERVAL);
  }

  private setupEventListeners(): void {
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));
  }

  private async handleOnline(): Promise<void> {
    console.log("🌐 Conexión restaurada - Sincronizando inventario...");
    await this.syncPendingOperations();
    await this.checkInventoryAlerts();
  }

  private handleOffline(): void {
    console.log(
      "📱 Modo offline - Las operaciones de inventario se guardarán para sincronización"
    );
  }

  private async syncPendingOperations(): Promise<void> {
    if (this.pendingOperations.length === 0) return;

    try {
      console.log(
        `🔄 Sincronizando ${this.pendingOperations.length} operaciones de inventario...`
      );

      for (const operation of this.pendingOperations) {
        await this.executePendingOperation(operation);
      }

      this.pendingOperations = [];
      console.log("✅ Sincronización de inventario completada");
    } catch (error) {
      console.error("❌ Error en sincronización de inventario:", error);
    }
  }

  private async executePendingOperation(operation: any): Promise<void> {
    try {
      switch (operation.type) {
        case "create_movement":
          await this.recordMovement(operation.data, false);
          break;
        case "create_item":
          await this.createItem(operation.data, false);
          break;
        case "update_stock":
          await this.updateStockLevel(operation.itemId, operation.data, false);
          break;
        case "create_purchase_order":
          await this.createPurchaseOrder(operation.data, false);
          break;
        case "receive_stock":
          await this.receiveStock(operation.data, false);
          break;
      }
    } catch (error) {
      console.error(
        "❌ Error ejecutando operación de inventario pendiente:",
        error
      );
    }
  }

  // MÉTODOS DE GEOLOCALIZACIÓN

  private async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalización no soportada"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          });
        },
        (error) => {
          reject(new Error("Error obteniendo ubicación: " + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  // MÉTODOS DE GESTIÓN DE ITEMS

  // Crear nuevo item
  public async createItem(
    itemData: Omit<BaseItem, "id" | "createdAt" | "updatedAt" | "createdBy">,
    sync: boolean = true
  ): Promise<BaseItem> {
    try {
      // Agregar ubicación si no está especificada
      if (!itemData.location?.coordinates) {
        try {
          const currentLocation = await this.getCurrentLocation();
          if (!itemData.location) itemData.location = {};
          itemData.location.coordinates = currentLocation;
        } catch (error) {
          console.warn("⚠️ No se pudo obtener ubicación para el item");
        }
      }

      console.log(`📦 Creando nuevo item: ${itemData.name}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "create_item",
          data: itemData,
          timestamp: Date.now(),
        });

        console.log("📱 Item guardado para sincronización offline");
        throw new Error("Item guardado para cuando se restaure la conexión");
      }

      const response = await api.post<BaseItem>("/inventory/items", itemData);

      if (!response.success || !response.data) {
        throw new Error("Error creando item");
      }

      // Crear registro de stock inicial
      await this.initializeStockRecord(response.data.id);

      this.clearCache();
      console.log(`✅ Item creado: ${response.data.name}`);

      return response.data;
    } catch (error) {
      console.error("❌ Error creando item:", error);
      throw error;
    }
  }

  // Inicializar registro de stock para nuevo item
  private async initializeStockRecord(itemId: string): Promise<void> {
    try {
      const stockRecord: Omit<
        StockRecord,
        "id" | "createdAt" | "updatedAt" | "createdBy"
      > = {
        itemId,
        currentStock: 0,
        availableStock: 0,
        reservedStock: 0,
        inTransitStock: 0,
        minimumStock: 0,
        maximumStock: 1000,
        reorderPoint: 10,
        safetyStock: 5,
        locationId: "main_warehouse",
        locationName: "Almacén Principal",
        status: InventoryStatus.OUT_OF_STOCK,
        lastMovementDate: new Date(),
        averageCost: 0,
        totalValue: 0,
        valuationMethod: ValuationMethod.FIFO,
        batches: [],
        lastUpdatedBy: "system",
      };

      await api.post("/inventory/stock-records", stockRecord);
    } catch (error) {
      console.error("❌ Error inicializando registro de stock:", error);
    }
  }

  // Obtener items con filtros
  public async getItems(params?: {
    category?: ItemCategory;
    search?: string;
    status?: InventoryStatus;
    location?: string;
    lowStock?: boolean;
    expired?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ items: BaseItem[]; pagination: any }> {
    try {
      const cacheKey = `items_${JSON.stringify(params || {})}`;
      const cached = this.getFromCache<{ items: BaseItem[]; pagination: any }>(
        cacheKey
      );

      if (cached) {
        console.log("📦 Items obtenidos del cache");
        return cached;
      }

      console.log("📦 Obteniendo items de inventario...");

      const response = await api.get<{ items: BaseItem[]; pagination: any }>(
        "/inventory/items",
        {
          params,
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo items");
      }

      this.setCache(cacheKey, response.data);

      console.log(`✅ ${response.data.items.length} items obtenidos`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo items:", error);
      throw error;
    }
  }

  // Obtener item por código de barras
  public async getItemByBarcode(barcode: string): Promise<BaseItem | null> {
    try {
      console.log(`🔍 Buscando item por código de barras: ${barcode}`);

      const response = await api.get<BaseItem>(
        `/inventory/items/barcode/${barcode}`
      );

      if (!response.success || !response.data) {
        return null;
      }

      console.log(`✅ Item encontrado: ${response.data.name}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error buscando por código de barras:", error);
      return null;
    }
  }

  // MÉTODOS DE GESTIÓN DE STOCK

  // Obtener niveles de stock
  public async getStockLevels(params?: {
    itemId?: string;
    location?: string;
    category?: ItemCategory;
    status?: InventoryStatus;
  }): Promise<StockRecord[]> {
    try {
      const cacheKey = `stock_levels_${JSON.stringify(params || {})}`;
      const cached = this.getFromCache<StockRecord[]>(cacheKey);

      if (cached) {
        return cached;
      }

      const response = await api.get<StockRecord[]>("/inventory/stock-levels", {
        params,
      });

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo niveles de stock");
      }

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo niveles de stock:", error);
      throw error;
    }
  }

  // Actualizar nivel de stock
  public async updateStockLevel(
    itemId: string,
    updates: {
      quantity?: number;
      operation?: "add" | "subtract" | "set";
      reason?: MovementReason;
      location?: string;
      notes?: string;
    },
    sync: boolean = true
  ): Promise<StockRecord> {
    try {
      console.log(`📊 Actualizando stock del item: ${itemId}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "update_stock",
          itemId,
          data: updates,
          timestamp: Date.now(),
        });

        console.log(
          "📱 Actualización de stock guardada para sincronización offline"
        );
        throw new Error(
          "Actualización guardada para cuando se restaure la conexión"
        );
      }

      const response = await api.put<StockRecord>(
        `/inventory/stock-levels/${itemId}`,
        updates
      );

      if (!response.success || !response.data) {
        throw new Error("Error actualizando stock");
      }

      this.clearCache();
      console.log("✅ Stock actualizado exitosamente");

      return response.data;
    } catch (error) {
      console.error("❌ Error actualizando stock:", error);
      throw error;
    }
  }

  // MÉTODOS DE MOVIMIENTOS DE INVENTARIO

  // Registrar movimiento de inventario
  public async recordMovement(
    movementData: Omit<
      InventoryMovement,
      "id" | "createdAt" | "updatedAt" | "createdBy" | "movementNumber"
    >,
    sync: boolean = true
  ): Promise<InventoryMovement> {
    try {
      // Agregar ubicación actual si no se especifica
      if (!movementData.location) {
        try {
          movementData.location = await this.getCurrentLocation();
        } catch (error) {
          console.warn("⚠️ No se pudo obtener ubicación para el movimiento");
        }
      }

      console.log(
        `📋 Registrando movimiento de inventario: ${movementData.movementType}`
      );

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "create_movement",
          data: movementData,
          timestamp: Date.now(),
        });

        console.log("📱 Movimiento guardado para sincronización offline");
        throw new Error(
          "Movimiento guardado para cuando se restaure la conexión"
        );
      }

      const response = await api.post<InventoryMovement>(
        "/inventory/movements",
        movementData,
        { includeLocation: !!movementData.location }
      );

      if (!response.success || !response.data) {
        throw new Error("Error registrando movimiento");
      }

      this.clearCache();
      console.log(`✅ Movimiento registrado: ${response.data.movementNumber}`);

      return response.data;
    } catch (error) {
      console.error("❌ Error registrando movimiento:", error);
      throw error;
    }
  }

  // Usar item en tratamiento veterinario
  public async useItemForTreatment(
    itemId: string,
    quantity: number,
    animalId: string,
    treatmentId: string,
    veterinarianId?: string
  ): Promise<InventoryMovement> {
    try {
      const location = await this.getCurrentLocation();

      const movementData: Omit<
        InventoryMovement,
        "id" | "createdAt" | "updatedAt" | "createdBy" | "movementNumber"
      > = {
        itemId,
        movementType: MovementType.USAGE,
        reason: MovementReason.TREATMENT,
        quantity,
        unit: "pcs", // se podría obtener del item
        referenceType: "event",
        referenceId: treatmentId,
        animalId,
        veterinarianId,
        movementDate: new Date(),
        effectiveDate: new Date(),
        performedBy: "field_app",
        status: "completed",
        isReversed: false,
        location,
      };

      console.log(
        `💉 Usando item para tratamiento - Animal: ${animalId}, Cantidad: ${quantity}`
      );

      return await this.recordMovement(movementData);
    } catch (error) {
      console.error("❌ Error usando item para tratamiento:", error);
      throw error;
    }
  }

  // Usar item en vacunación
  public async useItemForVaccination(
    itemId: string,
    quantity: number,
    animalId: string,
    vaccinationId: string,
    veterinarianId?: string
  ): Promise<InventoryMovement> {
    try {
      const location = await this.getCurrentLocation();

      const movementData: Omit<
        InventoryMovement,
        "id" | "createdAt" | "updatedAt" | "createdBy" | "movementNumber"
      > = {
        itemId,
        movementType: MovementType.USAGE,
        reason: MovementReason.VACCINATION,
        quantity,
        unit: "dose",
        referenceType: "event",
        referenceId: vaccinationId,
        animalId,
        veterinarianId,
        movementDate: new Date(),
        effectiveDate: new Date(),
        performedBy: "field_app",
        status: "completed",
        isReversed: false,
        location,
      };

      console.log(`💉 Usando vacuna - Animal: ${animalId}, Dosis: ${quantity}`);

      return await this.recordMovement(movementData);
    } catch (error) {
      console.error("❌ Error usando vacuna:", error);
      throw error;
    }
  }

  // Transferir stock entre ubicaciones
  public async transferStock(
    itemId: string,
    quantity: number,
    fromLocation: string,
    toLocation: string,
    reason: string,
    notes?: string
  ): Promise<InventoryMovement> {
    try {
      const location = await this.getCurrentLocation();

      const movementData: Omit<
        InventoryMovement,
        "id" | "createdAt" | "updatedAt" | "createdBy" | "movementNumber"
      > = {
        itemId,
        movementType: MovementType.TRANSFER,
        reason: MovementReason.LOCATION_CHANGE,
        quantity,
        unit: "pcs",
        fromLocationId: fromLocation,
        toLocationId: toLocation,
        movementDate: new Date(),
        effectiveDate: new Date(),
        performedBy: "field_app",
        status: "completed",
        isReversed: false,
        notes: `${reason}${notes ? ` - ${notes}` : ""}`,
        location,
      };

      console.log(
        `🚚 Transfiriendo stock - De: ${fromLocation} a: ${toLocation}, Cantidad: ${quantity}`
      );

      return await this.recordMovement(movementData);
    } catch (error) {
      console.error("❌ Error transfiriendo stock:", error);
      throw error;
    }
  }

  // MÉTODOS DE ÓRDENES DE COMPRA

  // Crear orden de compra
  public async createPurchaseOrder(
    orderData: Omit<
      PurchaseOrder,
      "id" | "createdAt" | "updatedAt" | "createdBy" | "orderNumber"
    >,
    sync: boolean = true
  ): Promise<PurchaseOrder> {
    try {
      // Agregar ubicación de entrega si no está especificada
      if (!orderData.deliveryLocation) {
        try {
          orderData.deliveryLocation = await this.getCurrentLocation();
        } catch (error) {
          console.warn("⚠️ No se pudo obtener ubicación de entrega");
        }
      }

      console.log(
        `🛒 Creando orden de compra para proveedor: ${orderData.supplierName}`
      );

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "create_purchase_order",
          data: orderData,
          timestamp: Date.now(),
        });

        console.log("📱 Orden de compra guardada para sincronización offline");
        throw new Error("Orden guardada para cuando se restaure la conexión");
      }

      const response = await api.post<PurchaseOrder>(
        "/inventory/purchase-orders",
        orderData
      );

      if (!response.success || !response.data) {
        throw new Error("Error creando orden de compra");
      }

      this.clearCache();
      console.log(`✅ Orden de compra creada: ${response.data.orderNumber}`);

      return response.data;
    } catch (error) {
      console.error("❌ Error creando orden de compra:", error);
      throw error;
    }
  }

  // Obtener órdenes de compra
  public async getPurchaseOrders(params?: {
    status?: PurchaseOrderStatus;
    supplierId?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }): Promise<PurchaseOrder[]> {
    try {
      const response = await api.get<PurchaseOrder[]>(
        "/inventory/purchase-orders",
        { params }
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo órdenes de compra");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo órdenes de compra:", error);
      throw error;
    }
  }

  // Generar orden de compra automática para stock bajo
  public async generateAutoReorderSuggestions(): Promise<{
    suggestions: Array<{
      itemId: string;
      itemName: string;
      currentStock: number;
      reorderPoint: number;
      suggestedQuantity: number;
      preferredSupplierId?: string;
      estimatedCost: number;
      priority: "low" | "medium" | "high" | "critical";
    }>;
    totalEstimatedCost: number;
  }> {
    try {
      console.log("🤖 Generando sugerencias de reorden automático...");

      const response = await api.get("/inventory/auto-reorder-suggestions");

      if (!response.success || !response.data) {
        throw new Error("Error generando sugerencias de reorden");
      }

      console.log(
        `✅ ${response.data.suggestions.length} sugerencias generadas`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error generando sugerencias de reorden:", error);
      throw error;
    }
  }

  // MÉTODOS DE RECEPCIONES

  // Recibir stock
  public async receiveStock(
    receiptData: Omit<
      Receipt,
      "id" | "createdAt" | "updatedAt" | "createdBy" | "receiptNumber"
    >,
    sync: boolean = true
  ): Promise<Receipt> {
    try {
      // Agregar ubicación actual si no se especifica
      if (!receiptData.location) {
        receiptData.location = await this.getCurrentLocation();
      }

      console.log(
        `📦 Recibiendo stock de proveedor: ${receiptData.supplierName}`
      );

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "receive_stock",
          data: receiptData,
          timestamp: Date.now(),
        });

        console.log("📱 Recepción guardada para sincronización offline");
        throw new Error(
          "Recepción guardada para cuando se restaure la conexión"
        );
      }

      const response = await api.post<Receipt>(
        "/inventory/receipts",
        receiptData,
        { includeLocation: true }
      );

      if (!response.success || !response.data) {
        throw new Error("Error registrando recepción");
      }

      // Actualizar stock automáticamente para items en buenas condiciones
      await this.processReceivedItems(response.data);

      this.clearCache();
      console.log(`✅ Stock recibido: ${response.data.receiptNumber}`);

      return response.data;
    } catch (error) {
      console.error("❌ Error recibiendo stock:", error);
      throw error;
    }
  }

  // Procesar items recibidos
  private async processReceivedItems(receipt: Receipt): Promise<void> {
    try {
      for (const item of receipt.items) {
        if (item.condition === "good") {
          // Crear movimiento de entrada
          await this.recordMovement(
            {
              itemId: item.itemId,
              movementType: MovementType.PURCHASE,
              reason: MovementReason.INITIAL_STOCK,
              quantity: item.receivedQuantity,
              unit: item.unit,
              unitCost: item.unitCost,
              totalCost: item.totalCost,
              toLocationId: "main_warehouse",
              toLocationName: "Almacén Principal",
              referenceType: "order",
              referenceId: receipt.purchaseOrderId,
              movementDate: receipt.receivedDate,
              effectiveDate: receipt.receivedDate,
              performedBy: receipt.receivedBy,
              status: "completed",
              isReversed: false,
              notes: `Recepción: ${receipt.receiptNumber}`,
            },
            false
          );
        }
      }
    } catch (error) {
      console.error("❌ Error procesando items recibidos:", error);
    }
  }

  // MÉTODOS DE GESTIÓN DE LOTES Y VENCIMIENTOS

  // Obtener items próximos a vencer
  public async getExpiringItems(daysAhead: number = 30): Promise<
    Array<{
      itemId: string;
      itemName: string;
      batchNumber: string;
      expirationDate: Date;
      quantity: number;
      daysUntilExpiration: number;
      location: string;
      priority: "low" | "medium" | "high" | "critical";
    }>
  > {
    try {
      console.log(
        `⏰ Obteniendo items que vencen en los próximos ${daysAhead} días...`
      );

      const response = await api.get("/inventory/expiring-items", {
        params: { daysAhead },
      });

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo items próximos a vencer");
      }

      console.log(
        `✅ ${response.data.length} items próximos a vencer encontrados`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo items próximos a vencer:", error);
      throw error;
    }
  }

  // Gestionar lote vencido
  public async handleExpiredBatch(
    batchId: string,
    disposalMethod:
      | "incineration"
      | "landfill"
      | "return_supplier"
      | "destruction",
    notes?: string
  ): Promise<InventoryMovement> {
    try {
      const location = await this.getCurrentLocation();

      // Primero obtener información del lote
      const batchInfo = await this.getBatchInfo(batchId);

      if (!batchInfo) {
        throw new Error("Lote no encontrado");
      }

      const movementData: Omit<
        InventoryMovement,
        "id" | "createdAt" | "updatedAt" | "createdBy" | "movementNumber"
      > = {
        itemId: batchInfo.itemId,
        batchId,
        movementType: MovementType.DISPOSAL,
        reason: MovementReason.EXPIRED_DISPOSAL,
        quantity: batchInfo.availableQuantity,
        unit: batchInfo.unit,
        fromLocationId: batchInfo.locationId,
        movementDate: new Date(),
        effectiveDate: new Date(),
        performedBy: "field_app",
        status: "completed",
        isReversed: false,
        notes: `Disposición por vencimiento - Método: ${disposalMethod}${
          notes ? ` - ${notes}` : ""
        }`,
        location,
      };

      console.log(
        `🗑️ Gestionando lote vencido: ${batchId} - Método: ${disposalMethod}`
      );

      return await this.recordMovement(movementData);
    } catch (error) {
      console.error("❌ Error gestionando lote vencido:", error);
      throw error;
    }
  }

  // Obtener información de lote
  private async getBatchInfo(batchId: string): Promise<any> {
    try {
      const response = await api.get(`/inventory/batches/${batchId}`);
      return response.success ? response.data : null;
    } catch (error) {
      console.error("❌ Error obteniendo información de lote:", error);
      return null;
    }
  }

  // MÉTODOS DE ALERTAS

  // Verificar alertas de inventario automáticamente
  private async checkInventoryAlerts(): Promise<void> {
    try {
      // Verificar stock bajo
      await this.checkLowStockAlerts();

      // Verificar vencimientos próximos
      await this.checkExpirationAlerts();

      // Verificar stock negativo
      await this.checkNegativeStockAlerts();

      // Verificar movimiento lento
      await this.checkSlowMovingAlerts();
    } catch (error) {
      console.error("❌ Error verificando alertas de inventario:", error);
    }
  }

  // Verificar alertas de stock bajo
  private async checkLowStockAlerts(): Promise<void> {
    try {
      const response = await api.get("/inventory/low-stock-items");

      if (response.success && response.data?.length > 0) {
        for (const item of response.data) {
          await this.createInventoryAlert({
            itemId: item.itemId,
            alertType: AlertType.LOW_STOCK,
            priority: this.determineLowStockPriority(
              item.currentStock,
              item.minimumStock
            ),
            title: `Stock Bajo: ${item.itemName}`,
            description: `Stock actual: ${item.currentStock}, Mínimo: ${item.minimumStock}`,
            currentValue: item.currentStock,
            threshold: item.minimumStock,
            status: "active",
            actions: [
              "Generar orden de compra",
              "Verificar stock de ubicaciones alternativas",
              "Evaluar necesidad de transferencia",
              "Contactar proveedor",
            ],
            notifiedUsers: [],
          });
        }
      }
    } catch (error) {
      console.error("❌ Error verificando stock bajo:", error);
    }
  }

  // Verificar alertas de vencimiento
  private async checkExpirationAlerts(): Promise<void> {
    try {
      const expiringItems = await this.getExpiringItems(
        INVENTORY_CONFIG.EXPIRATION_WARNING_DAYS
      );

      for (const item of expiringItems) {
        await this.createInventoryAlert({
          itemId: item.itemId,
          alertType: AlertType.EXPIRING_SOON,
          priority: item.priority as AlertPriority,
          title: `Vencimiento Próximo: ${item.itemName}`,
          description: `Lote ${item.batchNumber} vence en ${item.daysUntilExpiration} días`,
          currentValue: item.daysUntilExpiration,
          threshold: INVENTORY_CONFIG.EXPIRATION_WARNING_DAYS,
          status: "active",
          actions: [
            "Usar prioritariamente",
            "Verificar posibilidad de devolución",
            "Planificar disposición segura",
            "Evaluar descuento para venta rápida",
          ],
          notifiedUsers: [],
        });
      }
    } catch (error) {
      console.error("❌ Error verificando vencimientos:", error);
    }
  }

  // Verificar stock negativo
  private async checkNegativeStockAlerts(): Promise<void> {
    try {
      const response = await api.get("/inventory/negative-stock-items");

      if (response.success && response.data?.length > 0) {
        for (const item of response.data) {
          await this.createInventoryAlert({
            itemId: item.itemId,
            alertType: AlertType.NEGATIVE_STOCK,
            priority: AlertPriority.CRITICAL,
            title: `Stock Negativo: ${item.itemName}`,
            description: `Stock actual: ${item.currentStock} (negativo)`,
            currentValue: item.currentStock,
            threshold: 0,
            status: "active",
            actions: [
              "Realizar conteo físico urgente",
              "Revisar movimientos recientes",
              "Ajustar stock en sistema",
              "Investigar causa del descuadre",
            ],
            notifiedUsers: [],
          });
        }
      }
    } catch (error) {
      console.error("❌ Error verificando stock negativo:", error);
    }
  }

  // Verificar items de movimiento lento
  private async checkSlowMovingAlerts(): Promise<void> {
    try {
      const response = await api.get("/inventory/slow-moving-items", {
        params: { thresholdMonths: 6 },
      });

      if (response.success && response.data?.length > 0) {
        for (const item of response.data) {
          await this.createInventoryAlert({
            itemId: item.itemId,
            alertType: AlertType.SLOW_MOVING,
            priority: AlertPriority.LOW,
            title: `Movimiento Lento: ${item.itemName}`,
            description: `Sin movimientos en ${item.daysSinceLastMovement} días`,
            currentValue: item.daysSinceLastMovement,
            threshold: 180, // 6 meses
            status: "active",
            actions: [
              "Evaluar descontinuación",
              "Considerar promoción",
              "Revisar niveles de reorden",
              "Analizar demanda histórica",
            ],
            notifiedUsers: [],
          });
        }
      }
    } catch (error) {
      console.error("❌ Error verificando movimiento lento:", error);
    }
  }

  // Determinar prioridad de alerta de stock bajo
  private determineLowStockPriority(
    currentStock: number,
    minimumStock: number
  ): AlertPriority {
    const percentage = (currentStock / minimumStock) * 100;

    if (percentage <= 25) return AlertPriority.CRITICAL;
    if (percentage <= 50) return AlertPriority.HIGH;
    if (percentage <= 75) return AlertPriority.MEDIUM;
    return AlertPriority.LOW;
  }

  // Crear alerta de inventario
  private async createInventoryAlert(
    alertData: Omit<
      InventoryAlert,
      "id" | "createdAt" | "updatedAt" | "createdBy"
    >
  ): Promise<InventoryAlert> {
    try {
      // Verificar si ya existe una alerta similar activa
      const existingAlert = this.activeAlerts.find(
        (alert) =>
          alert.itemId === alertData.itemId &&
          alert.alertType === alertData.alertType &&
          alert.status === "active"
      );

      if (existingAlert) {
        return existingAlert; // No crear alerta duplicada
      }

      const response = await api.post<InventoryAlert>(
        "/inventory/alerts",
        alertData
      );

      if (!response.success || !response.data) {
        throw new Error("Error creando alerta de inventario");
      }

      // Agregar a alertas activas
      this.activeAlerts.push(response.data);

      // Emitir evento para notificación en tiempo real
      window.dispatchEvent(
        new CustomEvent("inventory:alert", {
          detail: response.data,
        })
      );

      console.log(`🚨 Alerta de inventario creada: ${response.data.title}`);

      return response.data;
    } catch (error) {
      console.error("❌ Error creando alerta de inventario:", error);
      throw error;
    }
  }

  // MÉTODOS DE CONTEOS FÍSICOS

  // Iniciar conteo físico
  public async startCycleCount(
    countData: Omit<
      CycleCount,
      "id" | "createdAt" | "updatedAt" | "createdBy" | "countNumber"
    >
  ): Promise<CycleCount> {
    try {
      console.log(`📊 Iniciando conteo físico: ${countData.name}`);

      const response = await api.post<CycleCount>(
        "/inventory/cycle-counts",
        countData
      );

      if (!response.success || !response.data) {
        throw new Error("Error iniciando conteo físico");
      }

      console.log(`✅ Conteo físico iniciado: ${response.data.countNumber}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error iniciando conteo físico:", error);
      throw error;
    }
  }

  // Registrar conteo de item
  public async recordItemCount(
    cycleCountId: string,
    itemId: string,
    countedQuantity: number,
    notes?: string
  ): Promise<void> {
    try {
      const location = await this.getCurrentLocation();

      await api.put(`/inventory/cycle-counts/${cycleCountId}/items/${itemId}`, {
        countedQuantity,
        countedBy: "field_app",
        countedAt: new Date(),
        notes,
        location,
      });

      console.log(
        `✅ Conteo registrado - Item: ${itemId}, Cantidad: ${countedQuantity}`
      );
    } catch (error) {
      console.error("❌ Error registrando conteo:", error);
      throw error;
    }
  }

  // MÉTODOS DE REPORTES Y ANÁLISIS

  // Generar reporte de inventario
  public async generateInventoryReport(
    reportType: ReportType,
    parameters?: any
  ): Promise<InventoryReport> {
    try {
      console.log(`📊 Generando reporte de inventario: ${reportType}`);

      const response = await api.post<InventoryReport>(
        "/inventory/reports/generate",
        {
          reportType,
          parameters,
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error generando reporte");
      }

      console.log("✅ Reporte generado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error generando reporte:", error);
      throw error;
    }
  }

  // Análisis ABC de inventario
  public async performABCAnalysis(): Promise<{
    categoryA: Array<{
      itemId: string;
      itemName: string;
      annualValue: number;
      percentage: number;
    }>;
    categoryB: Array<{
      itemId: string;
      itemName: string;
      annualValue: number;
      percentage: number;
    }>;
    categoryC: Array<{
      itemId: string;
      itemName: string;
      annualValue: number;
      percentage: number;
    }>;
    summary: {
      totalValue: number;
      categoryAPercentage: number;
      categoryBPercentage: number;
      categoryCPercentage: number;
    };
  }> {
    try {
      console.log("📈 Realizando análisis ABC...");

      const response = await api.get("/inventory/analysis/abc");

      if (!response.success || !response.data) {
        throw new Error("Error realizando análisis ABC");
      }

      console.log("✅ Análisis ABC completado");
      return response.data;
    } catch (error) {
      console.error("❌ Error realizando análisis ABC:", error);
      throw error;
    }
  }

  // Análisis de rotación de inventario
  public async analyzeInventoryTurnover(
    period: "monthly" | "quarterly" | "yearly" = "yearly"
  ): Promise<{
    items: Array<{
      itemId: string;
      itemName: string;
      category: ItemCategory;
      turnoverRate: number;
      velocity: "fast" | "medium" | "slow";
      daysOfSupply: number;
      averageStock: number;
      totalUsage: number;
      recommendation: string;
    }>;
    overallTurnover: number;
    fastMovingCount: number;
    slowMovingCount: number;
  }> {
    try {
      console.log(`🔄 Analizando rotación de inventario - Período: ${period}`);

      const response = await api.get("/inventory/analysis/turnover", {
        params: { period },
      });

      if (!response.success || !response.data) {
        throw new Error("Error analizando rotación");
      }

      console.log("✅ Análisis de rotación completado");
      return response.data;
    } catch (error) {
      console.error("❌ Error analizando rotación:", error);
      throw error;
    }
  }

  // MÉTODOS DE EXPORTACIÓN

  // Exportar datos de inventario
  public async exportInventoryData(
    format: "csv" | "excel" | "pdf",
    dataType: "items" | "stock_levels" | "movements" | "reports"
  ): Promise<void> {
    try {
      console.log(
        `📤 Exportando datos de inventario: ${dataType} en formato ${format}`
      );

      await apiClient.download(
        `/inventory/export/${dataType}`,
        `inventory_${dataType}_${format}_${new Date().getTime()}.${format}`,
        (progress) => {
          console.log(`📥 Progreso de exportación: ${progress}%`);
        }
      );

      console.log("✅ Exportación completada");
    } catch (error) {
      console.error("❌ Error exportando datos:", error);
      throw error;
    }
  }

  // MÉTODOS DE UTILIDAD

  // Obtener alertas activas
  public getActiveAlerts(): InventoryAlert[] {
    return this.activeAlerts.filter((alert) => alert.status === "active");
  }

  // Resolver alerta
  public async resolveAlert(
    alertId: string,
    resolutionNotes: string
  ): Promise<void> {
    try {
      await api.put(`/inventory/alerts/${alertId}/resolve`, {
        resolutionNotes,
        resolvedAt: new Date(),
      });

      // Remover de alertas activas
      this.activeAlerts = this.activeAlerts.filter(
        (alert) => alert.id !== alertId
      );

      console.log("✅ Alerta resuelta exitosamente");
    } catch (error) {
      console.error("❌ Error resolviendo alerta:", error);
      throw error;
    }
  }

  // Obtener resumen del dashboard
  public async getDashboardSummary(): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    expiringItems: number;
    pendingOrders: number;
    recentMovements: number;
    alertsCount: number;
    topCategories: Array<{
      category: ItemCategory;
      itemCount: number;
      totalValue: number;
    }>;
  }> {
    try {
      const cacheKey = "dashboard_summary";
      const cached = this.getFromCache<any>(cacheKey);

      if (cached) {
        return cached;
      }

      console.log("📊 Obteniendo resumen del dashboard de inventario...");

      const response = await api.get("/inventory/dashboard-summary");

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo resumen del dashboard");
      }

      this.setCache(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo resumen del dashboard:", error);
      throw error;
    }
  }

  // Obtener colores para categorías
  public getCategoryColor(category: ItemCategory): string {
    const colors = {
      [ItemCategory.MEDICATIONS]: "#EF4444", // Rojo
      [ItemCategory.VACCINES]: "#22C55E", // Verde
      [ItemCategory.FEED]: "#F59E0B", // Amarillo
      [ItemCategory.SUPPLEMENTS]: "#3B82F6", // Azul
      [ItemCategory.EQUIPMENT]: "#6B7280", // Gris
      [ItemCategory.SUPPLIES]: "#10B981", // Esmeralda
      [ItemCategory.TOOLS]: "#8B5CF6", // Púrpura
      [ItemCategory.SAFETY]: "#F97316", // Naranja
      [ItemCategory.CLEANING]: "#06B6D4", // Cian
      [ItemCategory.REPRODUCTION]: "#EC4899", // Rosa
      [ItemCategory.IDENTIFICATION]: "#84CC16", // Lima
      [ItemCategory.BEDDING]: "#A855F7", // Violeta
    };

    return colors[category] || "#6B7280";
  }

  // Obtener colores para estado de inventario
  public getInventoryStatusColor(status: InventoryStatus): string {
    const colors = {
      [InventoryStatus.IN_STOCK]: "#22C55E", // Verde
      [InventoryStatus.LOW_STOCK]: "#F59E0B", // Amarillo
      [InventoryStatus.OUT_OF_STOCK]: "#EF4444", // Rojo
      [InventoryStatus.OVERSTOCKED]: "#3B82F6", // Azul
      [InventoryStatus.RESERVED]: "#8B5CF6", // Púrpura
      [InventoryStatus.EXPIRED]: "#DC2626", // Rojo oscuro
      [InventoryStatus.DAMAGED]: "#F97316", // Naranja
      [InventoryStatus.QUARANTINED]: "#F59E0B", // Amarillo
      [InventoryStatus.DISCONTINUED]: "#6B7280", // Gris
    };

    return colors[status] || "#6B7280";
  }

  // Formatear cantidad con unidad
  public formatQuantity(quantity: number, unit: MeasurementUnit): string {
    const unitLabels = {
      [MeasurementUnit.KILOGRAMS]: "kg",
      [MeasurementUnit.GRAMS]: "g",
      [MeasurementUnit.POUNDS]: "lb",
      [MeasurementUnit.OUNCES]: "oz",
      [MeasurementUnit.LITERS]: "L",
      [MeasurementUnit.MILLILITERS]: "mL",
      [MeasurementUnit.GALLONS]: "gal",
      [MeasurementUnit.PIECES]: "pzs",
      [MeasurementUnit.BOXES]: "cajas",
      [MeasurementUnit.BAGS]: "bolsas",
      [MeasurementUnit.BOTTLES]: "botellas",
      [MeasurementUnit.VIALS]: "viales",
      [MeasurementUnit.DOSES]: "dosis",
    };

    return `${quantity.toLocaleString("es-MX")} ${unitLabels[unit] || unit}`;
  }

  // Destructor
  public destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    if (this.alertTimer) {
      clearInterval(this.alertTimer);
    }

    window.removeEventListener("online", this.handleOnline.bind(this));
    window.removeEventListener("offline", this.handleOffline.bind(this));

    this.clearCache();
    this.pendingOperations = [];
    this.activeAlerts = [];

    console.log("🔒 InventoryService destruido correctamente");
  }
}

// Instancia singleton del servicio de inventario
export const inventoryService = new InventoryService();

// Exports adicionales
export {
  ItemCategory,
  InventoryStatus,
  MovementType,
  MovementReason,
  AlertType,
  AlertPriority,
  PurchaseOrderStatus,
  ReceiptStatus,
  INVENTORY_STATUS_LABELS,
  MOVEMENT_TYPE_LABELS,
  ITEM_CATEGORY_LABELS,
};

export type {
  BaseItem,
  MedicationItem,
  VaccineItem,
  FeedItem,
  SupplementItem,
  EquipmentItem,
  StockRecord,
  InventoryMovement,
  PurchaseOrder,
  Receipt,
  InventoryAlert,
  BatchRecord,
  CycleCount,
  InventoryReport,
};

// Export default para compatibilidad
export default inventoryService;
