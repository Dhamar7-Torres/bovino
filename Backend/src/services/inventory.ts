import { Op } from 'sequelize';
import Inventory, { InventoryCategory, StockStatus, UnitOfMeasure, MovementType as InventoryMovementType } from '../models/Inventory';
import Medication, { MedicationType } from '../models/Medication';
import { logInfo, logError, logWarn } from '../utils/logger';
// Mock de servicios externos con métodos opcionales
const emailService = {
  sendNotificationEmail: async (email: string, subject: string, content: string, attachments?: any[]): Promise<void> => {
    console.log(`📧 Email enviado a ${email}: ${subject}`);
  }
};
const notificationService = {
  sendInventoryAlert: async (alertData: {
    itemId: string;
    itemName: string;
    alertType: 'low_stock' | 'out_of_stock' | 'expired' | 'expiring_soon';
    currentStock: number;
    minStock?: number;
    expirationDate?: Date;
    ranchId: string;
  }): Promise<void> => {
    console.log(`🔔 Alerta de inventario enviada: ${alertData.alertType} para ${alertData.itemName}`);
  }
};

// Adaptador de logger para mantener compatibilidad
const logger = {
  info: (message: string, metadata?: any) => logInfo(message, metadata, 'InventoryService'),
  error: (message: string, error?: any) => logError(message, { error }, error as Error, 'InventoryService'),
  warn: (message: string, metadata?: any) => logWarn(message, metadata, 'InventoryService')
};

// Enums para el sistema de inventario
enum InventoryStatus {
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCKED = 'overstocked',
  RESERVED = 'reserved',
  EXPIRED = 'expired',
  DAMAGED = 'damaged',
  QUARANTINED = 'quarantined',
  DISCONTINUED = 'discontinued'
}

enum MedicationCategory {
  ANTIBIOTIC = 'antibiotic',
  VACCINE = 'vaccine',
  ANTIPARASITIC = 'antiparasitic',
  VITAMIN = 'vitamin',
  MINERAL = 'mineral',
  HORMONE = 'hormone',
  ANALGESIC = 'analgesic',
  ANTI_INFLAMMATORY = 'anti_inflammatory',
  ANESTHETIC = 'anesthetic',
  ANTISEPTIC = 'antiseptic',
  RESPIRATORY = 'respiratory',
  DIGESTIVE = 'digestive',
  DERMATOLOGICAL = 'dermatological',
  REPRODUCTIVE = 'reproductive',
  IMMUNOMODULATOR = 'immunomodulator'
}

enum MovementType {
  PURCHASE = 'purchase',        // Compra
  SALE = 'sale',               // Venta
  USAGE = 'usage',             // Uso/Consumo
  ADJUSTMENT = 'adjustment',    // Ajuste de inventario
  TRANSFER = 'transfer',        // Transferencia
  RETURN = 'return',           // Devolución
  DISPOSAL = 'disposal',        // Disposición/Descarte
  LOSS = 'loss',               // Pérdida
  FOUND = 'found',             // Encontrado
  RESERVATION = 'reservation',  // Reserva
  RELEASE = 'release',         // Liberación de reserva
  EXPIRATION = 'expiration',   // Vencimiento
  DAMAGE = 'damage'            // Daño
}

enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCKED = 'overstocked',
  EXPIRING_SOON = 'expiring_soon',
  EXPIRED = 'expired',
  NEGATIVE_STOCK = 'negative_stock',
  SLOW_MOVING = 'slow_moving',
  FAST_MOVING = 'fast_moving',
  COST_VARIANCE = 'cost_variance',
  TEMPERATURE_ALERT = 'temperature_alert',
  BATCH_RECALL = 'batch_recall'
}

enum AlertPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Interfaces principales
interface InventoryItem {
  id: string;
  medicationId?: string;
  ranchId?: string;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStock: number;
  maxStock?: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  averageCost: number;
  totalValue: number;
  location: any;
  batchNumber?: string;
  lotNumber?: string;
  manufacturingDate?: Date;
  expirationDate?: Date;
  supplierId?: string;
  status: InventoryStatus;
  lastMovementDate?: Date;
  lastCountDate?: Date;
  temperatureLog?: TemperatureReading[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  // Propiedades del modelo Inventory
  itemName: string;
  itemCode: string;
  category: InventoryCategory;
  unitOfMeasure: UnitOfMeasure;
}

interface MedicationMaster {
  id: string;
  medicationCode: string;
  genericName: string;
  brandName?: string;
  type: MedicationType;
  activeIngredients: any[];
  targetSpecies: string[];
  indications: string[];
  contraindications?: string[];
  withdrawalPeriod: number;
  milkWithdrawalPeriod?: number;
  storageRequirements: any[];
  shelfLife: number;
  isActive: boolean;
  isAvailable: boolean;
  isControlled: boolean;
  requiresRefrigeration: boolean;
  isVaccine: boolean;
  isAntibiotic: boolean;
  isPrescriptionOnly: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // Método para obtener nombre de presentación
  name?: string;
  minimumOrderQuantity?: number;
  leadTimeDays?: number;
}

interface StorageLocation {
  warehouse: string;
  zone?: string;
  aisle?: string;
  shelf?: string;
  position?: string;
  temperatureControlled: boolean;
  accessRestricted: boolean;
  capacity?: number;
}

interface TemperatureReading {
  timestamp: Date;
  temperature: number;
  humidity?: number;
  deviceId: string;
  isWithinRange: boolean;
  alertGenerated: boolean;
}

interface InventoryMovement {
  id: string;
  inventoryItemId: string;
  medicationId?: string;
  medicationName: string;
  movementType: MovementType;
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  balanceAfter: number;
  date: Date;
  reason: string;
  reference?: string;
  supplierId?: string;
  supplierName?: string;
  batchNumber?: string;
  expirationDate?: Date;
  location: StorageLocation;
  performedBy: string;
  approvedBy?: string;
  bovineId?: string;
  treatmentId?: string;
  notes?: string;
  attachments?: string[];
  createdAt: Date;
}

interface InventoryAlert {
  id: string;
  inventoryItemId: string;
  medicationName: string;
  alertType: AlertType;
  priority: AlertPriority;
  message: string;
  details: string;
  currentValue: number;
  thresholdValue: number;
  triggeredAt: Date;
  isActive: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  actions: string[];
  estimatedImpact: 'minimal' | 'low' | 'medium' | 'high' | 'critical';
  notificationSent: boolean;
  autoResolvable: boolean;
}

interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  ranchId: string;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'partial' | 'completed' | 'cancelled';
  orderDate: Date;
  expectedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  paymentTerms?: string;
  deliveryInstructions?: string;
  createdBy: string;
  approvedBy?: string;
  receivedBy?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PurchaseOrderItem {
  medicationId: string;
  medicationName: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  batchNumber?: string;
  expirationDate?: Date;
  notes?: string;
}

interface InventoryValuation {
  totalItems: number;
  totalValue: number;
  totalCost: number;
  totalQuantity: number;
  averageCostPerItem: number;
  valuationMethod: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE';
  categories: CategoryValuation[];
  movementsSummary: {
    purchases: number;
    usage: number;
    adjustments: number;
    disposals: number;
  };
  topItems: { medicationName: string; value: number; percentage: number }[];
  calculatedAt: Date;
}

interface CategoryValuation {
  category: MedicationCategory;
  itemCount: number;
  totalValue: number;
  percentage: number;
}

interface InventoryAnalysis {
  abcAnalysis: ABCClassification[];
  rotationAnalysis: RotationAnalysis[];
  expirationAnalysis: ExpirationAnalysis;
  costAnalysis: CostAnalysis;
  supplierPerformance: SupplierPerformance[];
  demandForecast: DemandForecast[];
  recommendations: InventoryRecommendation[];
  generatedAt: Date;
}

interface ABCClassification {
  medicationId: string;
  medicationName: string;
  annualUsage: number;
  annualValue: number;
  classification: 'A' | 'B' | 'C';
  percentage: number;
  cumulativePercentage: number;
  recommendedManagement: string;
}

interface RotationAnalysis {
  medicationId: string;
  medicationName: string;
  averageStock: number;
  annualUsage: number;
  turnoverRate: number;
  daysOfSupply: number;
  classification: 'fast_moving' | 'medium_moving' | 'slow_moving' | 'obsolete';
  recommendation: string;
}

interface ExpirationAnalysis {
  totalExpiredValue: number;
  itemsExpiringSoon: number;
  expirationsByMonth: { month: string; count: number; value: number }[];
  wastePercentage: number;
  recommendations: string[];
}

interface CostAnalysis {
  totalPurchaseValue: number;
  averageUnitCost: number;
  costVariances: { medicationId: string; variance: number; reason: string }[];
  inflationImpact: number;
  potentialSavings: number;
}

interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  totalOrders: number;
  onTimeDeliveries: number;
  qualityIssues: number;
  averageLeadTime: number;
  totalValue: number;
  score: number;
}

interface DemandForecast {
  medicationId: string;
  medicationName: string;
  historicalUsage: number[];
  forecastedDemand: number[];
  seasonality: number;
  trend: number;
  accuracy: number;
  recommendedStock: number;
}

interface InventoryRecommendation {
  type: 'reorder' | 'reduce_stock' | 'discontinue' | 'change_supplier' | 'consolidate';
  medicationId: string;
  medicationName: string;
  description: string;
  potentialSaving: number;
  priority: AlertPriority;
  implementationComplexity: 'low' | 'medium' | 'high';
  expectedImpact: string;
  deadline?: Date;
}

// Mock de modelos que no existen
const InventoryMovementModel = {
  create: async (data: any): Promise<InventoryMovement> => ({
    ...data,
    id: `mov_${Date.now()}`,
    createdAt: new Date()
  } as InventoryMovement),
  findAll: async (options: any): Promise<InventoryMovement[]> => [],
  bulkCreate: async (data: any[]): Promise<InventoryMovement[]> => data as InventoryMovement[]
};

const PurchaseOrderModel = {
  create: async (data: any): Promise<PurchaseOrder> => data as PurchaseOrder,
  findAll: async (options: any): Promise<PurchaseOrder[]> => [],
  findByPk: async (id: string): Promise<PurchaseOrder | null> => null,
  update: async (data: any, options: any): Promise<[number]> => [1]
};

// Extender el modelo Medication con findOne si no lo tiene
const MedicationExtended = {
  ...Medication,
  findOne: async (options: any): Promise<MedicationMaster | null> => {
    // Mock implementation
    return null;
  }
};

class InventoryService {
  private readonly LOW_STOCK_THRESHOLD = 20; // 20% del mínimo
  private readonly EXPIRATION_WARNING_DAYS = 30; // 30 días antes
  private readonly FAST_MOVING_THRESHOLD = 12; // rotaciones por año
  private readonly SLOW_MOVING_THRESHOLD = 2; // rotaciones por año
  private readonly AUTO_REORDER_ENABLED = true;

  /**
   * Obtiene el inventario completo con filtros
   */
  async getInventory(
    filters: {
      category?: InventoryCategory;
      status?: StockStatus;
      lowStock?: boolean;
      expired?: boolean;
      search?: string;
      location?: string;
      page?: number;
      limit?: number;
    } = {},
    ranchId?: string
  ): Promise<{ items: any[]; total: number; metadata: any }> {
    try {
      const whereConditions: any = {};
      
      if (ranchId) {
        whereConditions.farmId = ranchId;
      }

      // Aplicar filtros
      if (filters.category) {
        whereConditions.category = filters.category;
      }

      if (filters.status) {
        whereConditions.status = filters.status;
      }

      if (filters.lowStock) {
        // Para el filtro de stock bajo, obtendremos todos los items y filtraremos en memoria
        // En producción, esto se manejaría con una consulta SQL más compleja
        whereConditions.isLowStockFilter = true; // Flag para procesamiento posterior
      }

      if (filters.expired) {
        whereConditions.expirationDate = { [Op.lt]: new Date() };
      }

      if (filters.search) {
        whereConditions[Op.or] = [
          { itemName: { [Op.iLike]: `%${filters.search}%` } },
          { itemCode: { [Op.iLike]: `%${filters.search}%` } },
          { batchNumber: { [Op.iLike]: `%${filters.search}%` } }
        ];
      }

      // Aplicar filtros especiales
      const isLowStockFilter = whereConditions.isLowStockFilter;
      if (isLowStockFilter) {
        delete whereConditions.isLowStockFilter;
      }

      // Paginación
      const page = filters.page || 1;
      const limit = filters.limit || 50;
      const offset = (page - 1) * limit;

      let items = await Inventory.findAll({
        where: whereConditions,
        limit: isLowStockFilter ? undefined : limit, // Si filtramos por stock bajo, obtenemos todos
        offset: isLowStockFilter ? undefined : offset,
        order: [['updatedAt', 'DESC']]
      });

      // Aplicar filtro de stock bajo en memoria si es necesario
      if (isLowStockFilter) {
        items = items.filter(item => item.currentStock <= item.minimumStock);
        
        // Aplicar paginación después del filtro
        const startIndex = offset;
        const endIndex = startIndex + limit;
        items = items.slice(startIndex, endIndex);
      }

      const total = isLowStockFilter ? 
        (await Inventory.findAll({ where: whereConditions }))
          .filter(item => item.currentStock <= item.minimumStock).length :
        await Inventory.count({ where: whereConditions });

      // Calcular metadatos
      const metadata = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      };

      return { items, total, metadata };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error obteniendo inventario:', errorMessage);
      throw new Error(`Error obteniendo inventario: ${errorMessage}`);
    }
  }

  /**
   * Actualiza el stock de un item de inventario
   */
  async updateStock(
    itemId: string,
    movement: {
      movementType: MovementType;
      quantity: number;
      reason: string;
      unitCost?: number;
      reference?: string;
      bovineId?: string;
      treatmentId?: string;
      notes?: string;
    },
    userId: string
  ): Promise<any> {
    try {
      // Obtener item actual
      const currentItem = await Inventory.findByPk(itemId);
      if (!currentItem) {
        throw new Error('Item de inventario no encontrado');
      }

      // Calcular nueva cantidad
      let newQuantity = currentItem.currentStock;
      const isInbound = this.isInboundMovement(movement.movementType);
      
      if (isInbound) {
        newQuantity += movement.quantity;
      } else {
        newQuantity -= movement.quantity;
      }

      // Validar stock negativo (excepto para ajustes)
      if (newQuantity < 0 && movement.movementType !== MovementType.ADJUSTMENT) {
        throw new Error(`Stock insuficiente. Disponible: ${currentItem.currentStock}, Solicitado: ${movement.quantity}`);
      }

      // Calcular nuevo costo promedio si es compra
      let newAverageCost = currentItem.unitCost;
      if (movement.movementType === MovementType.PURCHASE && movement.unitCost) {
        const totalValue = (currentItem.currentStock * currentItem.unitCost) + (movement.quantity * movement.unitCost);
        newAverageCost = totalValue / newQuantity;
      }

      // Calcular nuevo stock disponible
      const newAvailableStock = newQuantity - currentItem.reservedStock;

      // Actualizar item
      const updatedData = {
        currentStock: newQuantity,
        availableStock: newAvailableStock,
        unitCost: newAverageCost,
        totalValue: newQuantity * newAverageCost,
        lastMovementDate: new Date(),
        status: this.calculateItemStatus(newQuantity, currentItem.minimumStock, currentItem.maximumStock || 0, currentItem.expirationDate),
        updatedAt: new Date(),
        updatedBy: userId
      };

      await Inventory.update(updatedData, { where: { id: itemId } });

      // Registrar movimiento
      await this.recordMovement({
        inventoryItemId: itemId,
        medicationId: currentItem.id, // Usar el ID del item directamente
        medicationName: currentItem.itemName,
        movementType: movement.movementType,
        quantity: isInbound ? movement.quantity : -movement.quantity,
        unitCost: movement.unitCost,
        totalCost: movement.unitCost ? movement.unitCost * movement.quantity : undefined,
        balanceAfter: newQuantity,
        date: new Date(),
        reason: movement.reason,
        reference: movement.reference,
        location: this.convertLocationToStorageLocation(currentItem.location),
        performedBy: userId,
        bovineId: movement.bovineId,
        treatmentId: movement.treatmentId,
        notes: movement.notes
      });

      // Verificar alertas
      await this.checkAndCreateAlerts(itemId);

      // Verificar auto-reorden
      if (this.AUTO_REORDER_ENABLED) {
        await this.checkAutoReorder(itemId);
      }

      const updatedItem = await Inventory.findByPk(itemId);
      logger.info(`Stock actualizado para item ${itemId}: ${currentItem.currentStock} -> ${newQuantity}`);
      
      return updatedItem;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`Error actualizando stock del item ${itemId}:`, errorMessage);
      throw new Error(`Error actualizando stock: ${errorMessage}`);
    }
  }

  /**
   * Reserva stock para un tratamiento
   */
  async reserveStock(itemId: string, quantity: number, treatmentId: string, userId: string): Promise<any> {
    try {
      const item = await Inventory.findByPk(itemId);
      if (!item) {
        throw new Error('Item de inventario no encontrado');
      }

      // Verificar disponibilidad
      if (item.availableStock < quantity) {
        throw new Error(`Stock insuficiente para reservar. Disponible: ${item.availableStock}, Solicitado: ${quantity}`);
      }

      // Actualizar reserva
      const newReservedStock = item.reservedStock + quantity;
      const newAvailableStock = item.currentStock - newReservedStock;

      await Inventory.update({
        reservedStock: newReservedStock,
        availableStock: newAvailableStock,
        updatedAt: new Date(),
        updatedBy: userId
      }, { where: { id: itemId } });

      // Registrar movimiento de reserva
      await this.recordMovement({
        inventoryItemId: itemId,
        medicationId: item.id, // Usar el ID del item directamente
        medicationName: item.itemName,
        movementType: MovementType.RESERVATION,
        quantity: -quantity,
        balanceAfter: newAvailableStock,
        date: new Date(),
        reason: `Reserva para tratamiento ${treatmentId}`,
        reference: treatmentId,
        location: this.convertLocationToStorageLocation(item.location),
        performedBy: userId,
        treatmentId,
        notes: `Reserva de stock para tratamiento programado`
      });

      const updatedItem = await Inventory.findByPk(itemId);
      logger.info(`Stock reservado para item ${itemId}: ${quantity} unidades para tratamiento ${treatmentId}`);
      
      return updatedItem;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`Error reservando stock del item ${itemId}:`, errorMessage);
      throw new Error(`Error reservando stock: ${errorMessage}`);
    }
  }

  /**
   * Libera stock reservado
   */
  async releaseStock(itemId: string, quantity: number, treatmentId: string, userId: string): Promise<any> {
    try {
      const item = await Inventory.findByPk(itemId);
      if (!item) {
        throw new Error('Item de inventario no encontrado');
      }

      // Verificar que hay stock suficiente reservado
      if (item.reservedStock < quantity) {
        throw new Error(`No hay suficiente stock reservado para liberar. Reservado: ${item.reservedStock}, Solicitado: ${quantity}`);
      }

      // Actualizar reserva
      const newReservedStock = item.reservedStock - quantity;
      const newAvailableStock = item.currentStock - newReservedStock;

      await Inventory.update({
        reservedStock: newReservedStock,
        availableStock: newAvailableStock,
        updatedAt: new Date(),
        updatedBy: userId
      }, { where: { id: itemId } });

      // Registrar movimiento de liberación
      await this.recordMovement({
        inventoryItemId: itemId,
        medicationId: item.id, // Usar el ID del item directamente
        medicationName: item.itemName,
        movementType: MovementType.RELEASE,
        quantity: quantity,
        balanceAfter: newAvailableStock,
        date: new Date(),
        reason: `Liberación de reserva del tratamiento ${treatmentId}`,
        reference: treatmentId,
        location: this.convertLocationToStorageLocation(item.location),
        performedBy: userId,
        treatmentId,
        notes: `Liberación de stock reservado`
      });

      const updatedItem = await Inventory.findByPk(itemId);
      logger.info(`Stock liberado para item ${itemId}: ${quantity} unidades del tratamiento ${treatmentId}`);
      
      return updatedItem;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`Error liberando stock del item ${itemId}:`, errorMessage);
      throw new Error(`Error liberando stock: ${errorMessage}`);
    }
  }

  /**
   * Crea una orden de compra automática
   */
  async createAutoReorderPurchaseOrder(itemId: string, userId: string): Promise<PurchaseOrder> {
    try {
      const item = await Inventory.findByPk(itemId);
      if (!item) {
        throw new Error('Item de inventario no encontrado');
      }

      // Buscar medicamento relacionado si existe
      let medication: MedicationMaster | null = null;
      if (item.category === InventoryCategory.MEDICATION || item.category === InventoryCategory.VACCINES) {
        // Intentar buscar medicamento por código o nombre
        medication = await MedicationExtended.findOne({
          where: {
            [Op.or]: [
              { medicationCode: item.itemCode },
              { genericName: item.itemName }
            ]
          }
        }) as MedicationMaster;
      }

      // Calcular cantidad a ordenar
      const quantityToOrder = Math.max(
        item.reorderQuantity,
        (item.maximumStock || item.minimumStock * 3) - item.currentStock,
        medication?.minimumOrderQuantity || 1
      );

      // Crear orden de compra
      const purchaseOrder: PurchaseOrder = {
        id: this.generatePurchaseOrderId(),
        orderNumber: this.generateOrderNumber(),
        supplierId: item.supplierInfo?.supplierId || 'default_supplier',
        supplierName: item.supplierInfo?.supplierName || 'Proveedor Principal',
        ranchId: item.farmId || 'default_ranch',
        status: 'draft',
        orderDate: new Date(),
        expectedDeliveryDate: new Date(Date.now() + ((medication?.leadTimeDays || 7) * 24 * 60 * 60 * 1000)),
        items: [{
          medicationId: medication?.id || item.id,
          medicationName: medication?.genericName || item.itemName,
          quantityOrdered: quantityToOrder,
          quantityReceived: 0,
          unitCost: item.unitCost,
          totalCost: quantityToOrder * item.unitCost
        }],
        subtotal: quantityToOrder * item.unitCost,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: quantityToOrder * item.unitCost,
        currency: item.currency || 'MXN',
        deliveryInstructions: 'Auto-generada por sistema de reorden automático',
        createdBy: userId,
        notes: `Orden automática generada por stock bajo. Punto de reorden: ${item.reorderPoint}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await PurchaseOrderModel.create(purchaseOrder);

      // Enviar notificación por email (usar método genérico)
      try {
        await emailService.sendNotificationEmail('compras@rancho.com', 
          `Nueva orden de compra: ${purchaseOrder.orderNumber}`, 
          `Se ha generado automáticamente una orden de compra para ${item.itemName}`);
      } catch (error) {
        logger.warn('No se pudo enviar email de orden de compra', error);
      }

      logger.info(`Orden de compra automática creada: ${purchaseOrder.orderNumber} para ${item.itemName}`);
      return purchaseOrder;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`Error creando orden de compra automática para item ${itemId}:`, errorMessage);
      throw new Error(`Error creando orden automática: ${errorMessage}`);
    }
  }

  /**
   * Procesa alertas de inventario automáticamente
   */
  async processInventoryAlerts(ranchId?: string): Promise<InventoryAlert[]> {
    try {
      const alerts: InventoryAlert[] = [];
      const now = new Date();

      // Obtener items de inventario
      const whereConditions: any = {};
      if (ranchId) {
        whereConditions.farmId = ranchId;
      }

      const items = await Inventory.findAll({
        where: whereConditions
      });

      for (const item of items) {
        // Verificar stock bajo
        if (item.currentStock <= item.minimumStock * (this.LOW_STOCK_THRESHOLD / 100)) {
          alerts.push({
            id: this.generateAlertId(),
            inventoryItemId: item.id,
            medicationName: item.itemName,
            alertType: AlertType.LOW_STOCK,
            priority: item.currentStock === 0 ? AlertPriority.CRITICAL : AlertPriority.HIGH,
            message: `Stock bajo: ${item.itemName}`,
            details: `Stock actual: ${item.currentStock}, Mínimo: ${item.minimumStock}`,
            currentValue: item.currentStock,
            thresholdValue: item.minimumStock,
            triggeredAt: now,
            isActive: true,
            actions: ['Crear orden de compra', 'Ajustar punto de reorden', 'Contactar proveedor'],
            estimatedImpact: item.currentStock === 0 ? 'critical' : 'high',
            notificationSent: false,
            autoResolvable: true
          });
        }

        // Verificar vencimientos próximos
        if (item.expirationDate) {
          const daysToExpiry = Math.ceil((item.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (daysToExpiry <= this.EXPIRATION_WARNING_DAYS && daysToExpiry > 0) {
            alerts.push({
              id: this.generateAlertId(),
              inventoryItemId: item.id,
              medicationName: item.itemName,
              alertType: AlertType.EXPIRING_SOON,
              priority: daysToExpiry <= 7 ? AlertPriority.HIGH : AlertPriority.MEDIUM,
              message: `Vencimiento próximo: ${item.itemName}`,
              details: `Vence en ${daysToExpiry} días (${item.expirationDate.toLocaleDateString()})`,
              currentValue: daysToExpiry,
              thresholdValue: this.EXPIRATION_WARNING_DAYS,
              triggeredAt: now,
              isActive: true,
              actions: ['Usar prioritariamente', 'Verificar rotación', 'Considerar descuento'],
              estimatedImpact: daysToExpiry <= 7 ? 'high' : 'medium',
              notificationSent: false,
              autoResolvable: false
            });
          }

          // Verificar productos ya vencidos
          if (daysToExpiry < 0) {
            alerts.push({
              id: this.generateAlertId(),
              inventoryItemId: item.id,
              medicationName: item.itemName,
              alertType: AlertType.EXPIRED,
              priority: AlertPriority.CRITICAL,
              message: `Producto vencido: ${item.itemName}`,
              details: `Vencido hace ${Math.abs(daysToExpiry)} días`,
              currentValue: daysToExpiry,
              thresholdValue: 0,
              triggeredAt: now,
              isActive: true,
              actions: ['Retirar del inventario', 'Registrar pérdida', 'Disposición segura'],
              estimatedImpact: 'critical',
              notificationSent: false,
              autoResolvable: false
            });
          }
        }

        // Verificar sobrestock
        if (item.maximumStock && item.currentStock > item.maximumStock * 1.2) {
          alerts.push({
            id: this.generateAlertId(),
            inventoryItemId: item.id,
            medicationName: item.itemName,
            alertType: AlertType.OVERSTOCKED,
            priority: AlertPriority.MEDIUM,
            message: `Sobrestock detectado: ${item.itemName}`,
            details: `Stock actual: ${item.currentStock}, Máximo: ${item.maximumStock}`,
            currentValue: item.currentStock,
            thresholdValue: item.maximumStock,
            triggeredAt: now,
            isActive: true,
            actions: ['Reducir pedidos futuros', 'Usar en promociones', 'Transferir a otra ubicación'],
            estimatedImpact: 'low',
            notificationSent: false,
            autoResolvable: true
          });
        }
      }

      // Enviar notificaciones para alertas no enviadas
      for (const alert of alerts.filter(a => !a.notificationSent && a.priority !== AlertPriority.LOW)) {
        await this.sendInventoryAlertNotification(alert);
        alert.notificationSent = true;
      }

      logger.info(`Procesadas ${alerts.length} alertas de inventario`);
      return alerts;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error('Error procesando alertas de inventario:', errorMessage);
      throw new Error(`Error procesando alertas: ${errorMessage}`);
    }
  }

  /**
   * Calcula la valuación del inventario
   */
  async calculateInventoryValuation(
    ranchId: string,
    method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE' = 'WEIGHTED_AVERAGE'
  ): Promise<InventoryValuation> {
    try {
      const items = await Inventory.findAll({
        where: { farmId: ranchId }
      });

      let totalValue = 0;
      let totalCost = 0;
      let totalQuantity = 0;
      const categoryMap = new Map<MedicationCategory, { count: number; value: number }>();

      // Calcular valores por item
      for (const item of items) {
        const itemValue = this.calculateItemValue(item, method);
        totalValue += itemValue;
        totalCost += item.unitCost * item.currentStock;
        totalQuantity += item.currentStock;

        // Agrupar por categoría (mapear InventoryCategory a MedicationCategory)
        const category = this.mapInventoryCategoryToMedicationCategory(item.category);
        const categoryData = categoryMap.get(category) || { count: 0, value: 0 };
        categoryData.count += 1;
        categoryData.value += itemValue;
        categoryMap.set(category, categoryData);
      }

      // Preparar categorías
      const categories: CategoryValuation[] = [];
      for (const [category, data] of categoryMap) {
        categories.push({
          category,
          itemCount: data.count,
          totalValue: data.value,
          percentage: (data.value / totalValue) * 100
        });
      }

      // Ordenar categorías por valor
      categories.sort((a, b) => b.totalValue - a.totalValue);

      // Top 10 items por valor
      const sortedItems = items
        .map(item => ({
          medicationName: item.itemName,
          value: this.calculateItemValue(item, method),
          percentage: (this.calculateItemValue(item, method) / totalValue) * 100
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      // Mock de resumen de movimientos
      const movementsSummary = {
        purchases: 125000,
        usage: -89500,
        adjustments: -2500,
        disposals: -8000
      };

      const valuation: InventoryValuation = {
        totalItems: items.length,
        totalValue,
        totalCost,
        totalQuantity,
        averageCostPerItem: items.length > 0 ? totalValue / items.length : 0,
        valuationMethod: method,
        categories,
        movementsSummary,
        topItems: sortedItems,
        calculatedAt: new Date()
      };

      return valuation;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`Error calculando valuación de inventario para rancho ${ranchId}:`, errorMessage);
      throw new Error(`Error calculando valuación: ${errorMessage}`);
    }
  }

  /**
   * Realiza análisis avanzado del inventario
   */
  async performInventoryAnalysis(ranchId: string, period = 365): Promise<InventoryAnalysis> {
    try {
      const cutoffDate = new Date(Date.now() - (period * 24 * 60 * 60 * 1000));

      // Obtener datos para análisis
      const items = await Inventory.findAll({
        where: { farmId: ranchId }
      });

      const movements = await InventoryMovementModel.findAll({
        where: {
          date: { [Op.gte]: cutoffDate }
        },
        order: [['date', 'DESC']]
      });

      // Análisis ABC
      const abcAnalysis = this.calculateABCAnalysis(items, movements);

      // Análisis de rotación
      const rotationAnalysis = this.calculateRotationAnalysis(items, movements, period);

      // Análisis de vencimientos
      const expirationAnalysis = this.calculateExpirationAnalysis(items);

      // Análisis de costos
      const costAnalysis = this.calculateCostAnalysis(items, movements);

      // Performance de proveedores (mock)
      const supplierPerformance: SupplierPerformance[] = [
        {
          supplierId: 'sup_001',
          supplierName: 'Distribuidora Veterinaria',
          totalOrders: 45,
          onTimeDeliveries: 42,
          qualityIssues: 2,
          averageLeadTime: 5.2,
          totalValue: 125000,
          score: 92.3
        }
      ];

      // Pronóstico de demanda (mock)
      const demandForecast: DemandForecast[] = items.slice(0, 5).map(item => ({
        medicationId: item.id,
        medicationName: item.itemName,
        historicalUsage: [100, 120, 95, 110, 105, 130],
        forecastedDemand: [115, 125, 108, 118, 122, 135],
        seasonality: 0.15,
        trend: 0.08,
        accuracy: 87.5,
        recommendedStock: Math.round(item.currentStock * 1.15)
      }));

      // Recomendaciones
      const recommendations = this.generateInventoryRecommendations(items, movements);

      const analysis: InventoryAnalysis = {
        abcAnalysis,
        rotationAnalysis,
        expirationAnalysis,
        costAnalysis,
        supplierPerformance,
        demandForecast,
        recommendations,
        generatedAt: new Date()
      };

      return analysis;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      logger.error(`Error realizando análisis de inventario para rancho ${ranchId}:`, errorMessage);
      throw new Error(`Error en análisis de inventario: ${errorMessage}`);
    }
  }

  // Métodos privados de utilidad

  private isInboundMovement(movementType: MovementType): boolean {
    return [
      MovementType.PURCHASE,
      MovementType.RETURN,
      MovementType.FOUND,
      MovementType.RELEASE
    ].includes(movementType);
  }

  private calculateItemStatus(
    currentStock: number,
    minStock: number,
    maxStock: number,
    expirationDate?: Date
  ): StockStatus {
    const now = new Date();
    
    if (expirationDate) {
      const daysToExpiry = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysToExpiry < 0) {
        return StockStatus.EXPIRED;
      }
    }

    if (currentStock === 0) {
      return StockStatus.OUT_OF_STOCK;
    }

    if (currentStock <= minStock) {
      return StockStatus.LOW_STOCK;
    }

    if (maxStock > 0 && currentStock > maxStock * 1.2) {
      return StockStatus.BACKORDERED; // Usamos como "overstocked"
    }

    return StockStatus.IN_STOCK;
  }

  private async recordMovement(movementData: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<void> {
    try {
      const movement: InventoryMovement = {
        ...movementData,
        id: this.generateMovementId(),
        createdAt: new Date()
      };

      await InventoryMovementModel.create(movement);
    } catch (error) {
      logger.error('Error registrando movimiento:', error);
    }
  }

  private async checkAndCreateAlerts(itemId: string): Promise<void> {
    try {
      const item = await Inventory.findByPk(itemId);
      if (!item) return;

      // Verificar y crear alertas según sea necesario
      const now = new Date();
      
      if (item.expirationDate) {
        const daysToExpiry = Math.ceil((item.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Stock bajo
        if (item.currentStock <= item.minimumStock) {
          try {
            await notificationService.sendInventoryAlert({
              itemId: item.id,
              itemName: item.itemName,
              alertType: 'low_stock',
              currentStock: item.currentStock,
              minStock: item.minimumStock,
              ranchId: item.farmId || 'default'
            });
          } catch (error) {
            logger.warn('No se pudo enviar alerta de stock bajo', error);
          }
        }

        // Vencimiento próximo
        if (daysToExpiry <= this.EXPIRATION_WARNING_DAYS && daysToExpiry > 0) {
          try {
            await emailService.sendNotificationEmail('inventario@rancho.com',
              `Vencimiento próximo: ${item.itemName}`,
              `El producto ${item.itemName} vence en ${daysToExpiry} días`);
          } catch (error) {
            logger.warn('No se pudo enviar alerta de vencimiento', error);
          }
        }
      }
    } catch (error) {
      logger.error('Error verificando alertas:', error);
    }
  }

  private async checkAutoReorder(itemId: string): Promise<void> {
    try {
      if (!this.AUTO_REORDER_ENABLED) return;

      const item = await Inventory.findByPk(itemId);
      if (!item) return;

      // Verificar si necesita reorden automático
      if (item.currentStock <= item.reorderPoint) {
        await this.createAutoReorderPurchaseOrder(itemId, 'system');
      }
    } catch (error) {
      logger.error('Error verificando auto-reorden:', error);
    }
  }

  private calculateItemValue(item: any, method: 'FIFO' | 'LIFO' | 'WEIGHTED_AVERAGE'): number {
    // Implementación simplificada
    switch (method) {
      case 'WEIGHTED_AVERAGE':
        return item.currentStock * item.unitCost;
      case 'FIFO':
      case 'LIFO':
      default:
        return item.currentStock * item.unitCost;
    }
  }

  private mapInventoryCategoryToMedicationCategory(inventoryCategory: InventoryCategory): MedicationCategory {
    // Mapeo de categorías de inventario a categorías de medicamento
    switch (inventoryCategory) {
      case InventoryCategory.MEDICATION:
        return MedicationCategory.ANTIBIOTIC; // Por defecto
      case InventoryCategory.VACCINES:
        return MedicationCategory.VACCINE;
      case InventoryCategory.SUPPLIES:
        return MedicationCategory.ANTISEPTIC;
      default:
        return MedicationCategory.ANTIBIOTIC;
    }
  }

  private calculateABCAnalysis(items: any[], movements: InventoryMovement[]): ABCClassification[] {
    // Mock de análisis ABC
    return items.slice(0, 10).map((item, index) => ({
      medicationId: item.id,
      medicationName: item.itemName,
      annualUsage: Math.round(Math.random() * 1000 + 100),
      annualValue: Math.round(Math.random() * 50000 + 10000),
      classification: (index < 2 ? 'A' : index < 6 ? 'B' : 'C') as 'A' | 'B' | 'C',
      percentage: Math.round(Math.random() * 20 + 5),
      cumulativePercentage: Math.round(Math.random() * 100),
      recommendedManagement: index < 2 ? 'Control estricto' : index < 6 ? 'Control normal' : 'Control básico'
    }));
  }

  private calculateRotationAnalysis(items: any[], movements: InventoryMovement[], period: number): RotationAnalysis[] {
    return items.slice(0, 10).map(item => {
      const turnoverRate = Math.random() * 15 + 1;
      return {
        medicationId: item.id,
        medicationName: item.itemName,
        averageStock: item.currentStock,
        annualUsage: Math.round(turnoverRate * item.currentStock),
        turnoverRate: Math.round(turnoverRate * 100) / 100,
        daysOfSupply: Math.round(365 / turnoverRate),
        classification: (turnoverRate > 12 ? 'fast_moving' : turnoverRate > 4 ? 'medium_moving' : turnoverRate > 1 ? 'slow_moving' : 'obsolete') as any,
        recommendation: turnoverRate > 12 ? 'Aumentar stock' : turnoverRate < 2 ? 'Reducir stock' : 'Mantener nivel actual'
      };
    });
  }

  private calculateExpirationAnalysis(items: any[]): ExpirationAnalysis {
    const now = new Date();
    const expiredItems = items.filter(item => item.expirationDate && item.expirationDate < now);
    const expiringSoon = items.filter(item => {
      if (!item.expirationDate) return false;
      const daysToExpiry = Math.ceil((item.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysToExpiry <= 30 && daysToExpiry > 0;
    });

    const totalExpiredValue = expiredItems.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);
    const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);

    return {
      totalExpiredValue,
      itemsExpiringSoon: expiringSoon.length,
      expirationsByMonth: [],
      wastePercentage: totalValue > 0 ? (totalExpiredValue / totalValue) * 100 : 0,
      recommendations: [
        'Implementar sistema FEFO (First Expired, First Out)',
        'Revisar frecuencia de pedidos para items de rotación lenta',
        'Considerar descuentos para productos próximos a vencer'
      ]
    };
  }

  private calculateCostAnalysis(items: any[], movements: InventoryMovement[]): CostAnalysis {
    const totalPurchases = movements
      .filter(m => m.movementType === MovementType.PURCHASE)
      .reduce((sum, m) => sum + (m.totalCost || 0), 0);

    const totalQuantity = movements
      .filter(m => m.movementType === MovementType.PURCHASE)
      .reduce((sum, m) => sum + m.quantity, 0);

    return {
      totalPurchaseValue: totalPurchases,
      averageUnitCost: totalQuantity > 0 ? totalPurchases / totalQuantity : 0,
      costVariances: [],
      inflationImpact: 5.2,
      potentialSavings: Math.round(totalPurchases * 0.08)
    };
  }

  private generateInventoryRecommendations(items: any[], movements: InventoryMovement[]): InventoryRecommendation[] {
    const recommendations: InventoryRecommendation[] = [];

    // Identificar items para reorden
    const lowStockItems = items.filter(item => item.currentStock <= item.reorderPoint);
    for (const item of lowStockItems.slice(0, 5)) {
      recommendations.push({
        type: 'reorder',
        medicationId: item.id,
        medicationName: item.itemName,
        description: `Reabastecer stock por debajo del punto de reorden`,
        potentialSaving: 0,
        priority: AlertPriority.HIGH,
        implementationComplexity: 'low',
        expectedImpact: 'Evitar faltantes de stock',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      });
    }

    return recommendations;
  }

  private async sendInventoryAlertNotification(alert: InventoryAlert): Promise<void> {
    try {
      await notificationService.sendInventoryAlert({
        itemId: alert.inventoryItemId,
        itemName: alert.medicationName,
        alertType: alert.alertType as any,
        currentStock: alert.currentValue,
        minStock: alert.thresholdValue,
        ranchId: 'default' // Se debería obtener del contexto
      });
    } catch (error) {
      logger.error('Error enviando notificación de alerta:', error);
    }
  }

  private generatePurchaseOrderId(): string {
    return `po_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateOrderNumber(): string {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const sequence = Math.floor(Math.random() * 999) + 1;
    
    return `PO${year}${month}${day}-${sequence.toString().padStart(3, '0')}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private convertLocationToStorageLocation(location: any): StorageLocation {
    // Convertir LocationData a StorageLocation
    if (!location) {
      return {
        warehouse: 'default',
        temperatureControlled: false,
        accessRestricted: false
      };
    }

    return {
      warehouse: location.warehouse || 'default',
      zone: location.zone,
      aisle: location.aisle,
      shelf: location.shelf,
      position: location.position,
      temperatureControlled: location.temperatureControlled || false,
      accessRestricted: location.accessRestricted || false,
      capacity: location.capacity
    };
  }

  private generateMovementId(): string {
    return `mov_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Exportar instancia única del servicio
export const inventoryService = new InventoryService();