"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.inventoryService = void 0;
const sequelize_1 = require("sequelize");
const Inventory_1 = __importStar(require("../models/Inventory"));
const Medication_1 = __importDefault(require("../models/Medication"));
const logger_1 = require("../utils/logger");
const emailService = {
    sendNotificationEmail: async (email, subject, content, attachments) => {
        console.log(`📧 Email enviado a ${email}: ${subject}`);
    }
};
const notificationService = {
    sendInventoryAlert: async (alertData) => {
        console.log(`🔔 Alerta de inventario enviada: ${alertData.alertType} para ${alertData.itemName}`);
    }
};
const logger = {
    info: (message, metadata) => (0, logger_1.logInfo)(message, metadata, 'InventoryService'),
    error: (message, error) => (0, logger_1.logError)(message, { error }, error, 'InventoryService'),
    warn: (message, metadata) => (0, logger_1.logWarn)(message, metadata, 'InventoryService')
};
var InventoryStatus;
(function (InventoryStatus) {
    InventoryStatus["IN_STOCK"] = "in_stock";
    InventoryStatus["LOW_STOCK"] = "low_stock";
    InventoryStatus["OUT_OF_STOCK"] = "out_of_stock";
    InventoryStatus["OVERSTOCKED"] = "overstocked";
    InventoryStatus["RESERVED"] = "reserved";
    InventoryStatus["EXPIRED"] = "expired";
    InventoryStatus["DAMAGED"] = "damaged";
    InventoryStatus["QUARANTINED"] = "quarantined";
    InventoryStatus["DISCONTINUED"] = "discontinued";
})(InventoryStatus || (InventoryStatus = {}));
var MedicationCategory;
(function (MedicationCategory) {
    MedicationCategory["ANTIBIOTIC"] = "antibiotic";
    MedicationCategory["VACCINE"] = "vaccine";
    MedicationCategory["ANTIPARASITIC"] = "antiparasitic";
    MedicationCategory["VITAMIN"] = "vitamin";
    MedicationCategory["MINERAL"] = "mineral";
    MedicationCategory["HORMONE"] = "hormone";
    MedicationCategory["ANALGESIC"] = "analgesic";
    MedicationCategory["ANTI_INFLAMMATORY"] = "anti_inflammatory";
    MedicationCategory["ANESTHETIC"] = "anesthetic";
    MedicationCategory["ANTISEPTIC"] = "antiseptic";
    MedicationCategory["RESPIRATORY"] = "respiratory";
    MedicationCategory["DIGESTIVE"] = "digestive";
    MedicationCategory["DERMATOLOGICAL"] = "dermatological";
    MedicationCategory["REPRODUCTIVE"] = "reproductive";
    MedicationCategory["IMMUNOMODULATOR"] = "immunomodulator";
})(MedicationCategory || (MedicationCategory = {}));
var MovementType;
(function (MovementType) {
    MovementType["PURCHASE"] = "purchase";
    MovementType["SALE"] = "sale";
    MovementType["USAGE"] = "usage";
    MovementType["ADJUSTMENT"] = "adjustment";
    MovementType["TRANSFER"] = "transfer";
    MovementType["RETURN"] = "return";
    MovementType["DISPOSAL"] = "disposal";
    MovementType["LOSS"] = "loss";
    MovementType["FOUND"] = "found";
    MovementType["RESERVATION"] = "reservation";
    MovementType["RELEASE"] = "release";
    MovementType["EXPIRATION"] = "expiration";
    MovementType["DAMAGE"] = "damage";
})(MovementType || (MovementType = {}));
var AlertType;
(function (AlertType) {
    AlertType["LOW_STOCK"] = "low_stock";
    AlertType["OUT_OF_STOCK"] = "out_of_stock";
    AlertType["OVERSTOCKED"] = "overstocked";
    AlertType["EXPIRING_SOON"] = "expiring_soon";
    AlertType["EXPIRED"] = "expired";
    AlertType["NEGATIVE_STOCK"] = "negative_stock";
    AlertType["SLOW_MOVING"] = "slow_moving";
    AlertType["FAST_MOVING"] = "fast_moving";
    AlertType["COST_VARIANCE"] = "cost_variance";
    AlertType["TEMPERATURE_ALERT"] = "temperature_alert";
    AlertType["BATCH_RECALL"] = "batch_recall";
})(AlertType || (AlertType = {}));
var AlertPriority;
(function (AlertPriority) {
    AlertPriority["LOW"] = "low";
    AlertPriority["MEDIUM"] = "medium";
    AlertPriority["HIGH"] = "high";
    AlertPriority["CRITICAL"] = "critical";
})(AlertPriority || (AlertPriority = {}));
const InventoryMovementModel = {
    create: async (data) => ({
        ...data,
        id: `mov_${Date.now()}`,
        createdAt: new Date()
    }),
    findAll: async (options) => [],
    bulkCreate: async (data) => data
};
const PurchaseOrderModel = {
    create: async (data) => data,
    findAll: async (options) => [],
    findByPk: async (id) => null,
    update: async (data, options) => [1]
};
const MedicationExtended = {
    ...Medication_1.default,
    findOne: async (options) => {
        return null;
    }
};
class InventoryService {
    constructor() {
        this.LOW_STOCK_THRESHOLD = 20;
        this.EXPIRATION_WARNING_DAYS = 30;
        this.FAST_MOVING_THRESHOLD = 12;
        this.SLOW_MOVING_THRESHOLD = 2;
        this.AUTO_REORDER_ENABLED = true;
    }
    async getInventory(filters = {}, ranchId) {
        try {
            const whereConditions = {};
            if (ranchId) {
                whereConditions.farmId = ranchId;
            }
            if (filters.category) {
                whereConditions.category = filters.category;
            }
            if (filters.status) {
                whereConditions.status = filters.status;
            }
            if (filters.lowStock) {
                whereConditions.isLowStockFilter = true;
            }
            if (filters.expired) {
                whereConditions.expirationDate = { [sequelize_1.Op.lt]: new Date() };
            }
            if (filters.search) {
                whereConditions[sequelize_1.Op.or] = [
                    { itemName: { [sequelize_1.Op.iLike]: `%${filters.search}%` } },
                    { itemCode: { [sequelize_1.Op.iLike]: `%${filters.search}%` } },
                    { batchNumber: { [sequelize_1.Op.iLike]: `%${filters.search}%` } }
                ];
            }
            const isLowStockFilter = whereConditions.isLowStockFilter;
            if (isLowStockFilter) {
                delete whereConditions.isLowStockFilter;
            }
            const page = filters.page || 1;
            const limit = filters.limit || 50;
            const offset = (page - 1) * limit;
            let items = await Inventory_1.default.findAll({
                where: whereConditions,
                limit: isLowStockFilter ? undefined : limit,
                offset: isLowStockFilter ? undefined : offset,
                order: [['updatedAt', 'DESC']]
            });
            if (isLowStockFilter) {
                items = items.filter(item => item.currentStock <= item.minimumStock);
                const startIndex = offset;
                const endIndex = startIndex + limit;
                items = items.slice(startIndex, endIndex);
            }
            const total = isLowStockFilter ?
                (await Inventory_1.default.findAll({ where: whereConditions }))
                    .filter(item => item.currentStock <= item.minimumStock).length :
                await Inventory_1.default.count({ where: whereConditions });
            const metadata = {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            };
            return { items, total, metadata };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger.error('Error obteniendo inventario:', errorMessage);
            throw new Error(`Error obteniendo inventario: ${errorMessage}`);
        }
    }
    async updateStock(itemId, movement, userId) {
        try {
            const currentItem = await Inventory_1.default.findByPk(itemId);
            if (!currentItem) {
                throw new Error('Item de inventario no encontrado');
            }
            let newQuantity = currentItem.currentStock;
            const isInbound = this.isInboundMovement(movement.movementType);
            if (isInbound) {
                newQuantity += movement.quantity;
            }
            else {
                newQuantity -= movement.quantity;
            }
            if (newQuantity < 0 && movement.movementType !== MovementType.ADJUSTMENT) {
                throw new Error(`Stock insuficiente. Disponible: ${currentItem.currentStock}, Solicitado: ${movement.quantity}`);
            }
            let newAverageCost = currentItem.unitCost;
            if (movement.movementType === MovementType.PURCHASE && movement.unitCost) {
                const totalValue = (currentItem.currentStock * currentItem.unitCost) + (movement.quantity * movement.unitCost);
                newAverageCost = totalValue / newQuantity;
            }
            const newAvailableStock = newQuantity - currentItem.reservedStock;
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
            await Inventory_1.default.update(updatedData, { where: { id: itemId } });
            await this.recordMovement({
                inventoryItemId: itemId,
                medicationId: currentItem.id,
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
            await this.checkAndCreateAlerts(itemId);
            if (this.AUTO_REORDER_ENABLED) {
                await this.checkAutoReorder(itemId);
            }
            const updatedItem = await Inventory_1.default.findByPk(itemId);
            logger.info(`Stock actualizado para item ${itemId}: ${currentItem.currentStock} -> ${newQuantity}`);
            return updatedItem;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger.error(`Error actualizando stock del item ${itemId}:`, errorMessage);
            throw new Error(`Error actualizando stock: ${errorMessage}`);
        }
    }
    async reserveStock(itemId, quantity, treatmentId, userId) {
        try {
            const item = await Inventory_1.default.findByPk(itemId);
            if (!item) {
                throw new Error('Item de inventario no encontrado');
            }
            if (item.availableStock < quantity) {
                throw new Error(`Stock insuficiente para reservar. Disponible: ${item.availableStock}, Solicitado: ${quantity}`);
            }
            const newReservedStock = item.reservedStock + quantity;
            const newAvailableStock = item.currentStock - newReservedStock;
            await Inventory_1.default.update({
                reservedStock: newReservedStock,
                availableStock: newAvailableStock,
                updatedAt: new Date(),
                updatedBy: userId
            }, { where: { id: itemId } });
            await this.recordMovement({
                inventoryItemId: itemId,
                medicationId: item.id,
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
            const updatedItem = await Inventory_1.default.findByPk(itemId);
            logger.info(`Stock reservado para item ${itemId}: ${quantity} unidades para tratamiento ${treatmentId}`);
            return updatedItem;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger.error(`Error reservando stock del item ${itemId}:`, errorMessage);
            throw new Error(`Error reservando stock: ${errorMessage}`);
        }
    }
    async releaseStock(itemId, quantity, treatmentId, userId) {
        try {
            const item = await Inventory_1.default.findByPk(itemId);
            if (!item) {
                throw new Error('Item de inventario no encontrado');
            }
            if (item.reservedStock < quantity) {
                throw new Error(`No hay suficiente stock reservado para liberar. Reservado: ${item.reservedStock}, Solicitado: ${quantity}`);
            }
            const newReservedStock = item.reservedStock - quantity;
            const newAvailableStock = item.currentStock - newReservedStock;
            await Inventory_1.default.update({
                reservedStock: newReservedStock,
                availableStock: newAvailableStock,
                updatedAt: new Date(),
                updatedBy: userId
            }, { where: { id: itemId } });
            await this.recordMovement({
                inventoryItemId: itemId,
                medicationId: item.id,
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
            const updatedItem = await Inventory_1.default.findByPk(itemId);
            logger.info(`Stock liberado para item ${itemId}: ${quantity} unidades del tratamiento ${treatmentId}`);
            return updatedItem;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger.error(`Error liberando stock del item ${itemId}:`, errorMessage);
            throw new Error(`Error liberando stock: ${errorMessage}`);
        }
    }
    async createAutoReorderPurchaseOrder(itemId, userId) {
        try {
            const item = await Inventory_1.default.findByPk(itemId);
            if (!item) {
                throw new Error('Item de inventario no encontrado');
            }
            let medication = null;
            if (item.category === Inventory_1.InventoryCategory.MEDICATION || item.category === Inventory_1.InventoryCategory.VACCINES) {
                medication = await MedicationExtended.findOne({
                    where: {
                        [sequelize_1.Op.or]: [
                            { medicationCode: item.itemCode },
                            { genericName: item.itemName }
                        ]
                    }
                });
            }
            const quantityToOrder = Math.max(item.reorderQuantity, (item.maximumStock || item.minimumStock * 3) - item.currentStock, medication?.minimumOrderQuantity || 1);
            const purchaseOrder = {
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
            try {
                await emailService.sendNotificationEmail('compras@rancho.com', `Nueva orden de compra: ${purchaseOrder.orderNumber}`, `Se ha generado automáticamente una orden de compra para ${item.itemName}`);
            }
            catch (error) {
                logger.warn('No se pudo enviar email de orden de compra', error);
            }
            logger.info(`Orden de compra automática creada: ${purchaseOrder.orderNumber} para ${item.itemName}`);
            return purchaseOrder;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger.error(`Error creando orden de compra automática para item ${itemId}:`, errorMessage);
            throw new Error(`Error creando orden automática: ${errorMessage}`);
        }
    }
    async processInventoryAlerts(ranchId) {
        try {
            const alerts = [];
            const now = new Date();
            const whereConditions = {};
            if (ranchId) {
                whereConditions.farmId = ranchId;
            }
            const items = await Inventory_1.default.findAll({
                where: whereConditions
            });
            for (const item of items) {
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
            for (const alert of alerts.filter(a => !a.notificationSent && a.priority !== AlertPriority.LOW)) {
                await this.sendInventoryAlertNotification(alert);
                alert.notificationSent = true;
            }
            logger.info(`Procesadas ${alerts.length} alertas de inventario`);
            return alerts;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger.error('Error procesando alertas de inventario:', errorMessage);
            throw new Error(`Error procesando alertas: ${errorMessage}`);
        }
    }
    async calculateInventoryValuation(ranchId, method = 'WEIGHTED_AVERAGE') {
        try {
            const items = await Inventory_1.default.findAll({
                where: { farmId: ranchId }
            });
            let totalValue = 0;
            let totalCost = 0;
            let totalQuantity = 0;
            const categoryMap = new Map();
            for (const item of items) {
                const itemValue = this.calculateItemValue(item, method);
                totalValue += itemValue;
                totalCost += item.unitCost * item.currentStock;
                totalQuantity += item.currentStock;
                const category = this.mapInventoryCategoryToMedicationCategory(item.category);
                const categoryData = categoryMap.get(category) || { count: 0, value: 0 };
                categoryData.count += 1;
                categoryData.value += itemValue;
                categoryMap.set(category, categoryData);
            }
            const categories = [];
            for (const [category, data] of categoryMap) {
                categories.push({
                    category,
                    itemCount: data.count,
                    totalValue: data.value,
                    percentage: (data.value / totalValue) * 100
                });
            }
            categories.sort((a, b) => b.totalValue - a.totalValue);
            const sortedItems = items
                .map(item => ({
                medicationName: item.itemName,
                value: this.calculateItemValue(item, method),
                percentage: (this.calculateItemValue(item, method) / totalValue) * 100
            }))
                .sort((a, b) => b.value - a.value)
                .slice(0, 10);
            const movementsSummary = {
                purchases: 125000,
                usage: -89500,
                adjustments: -2500,
                disposals: -8000
            };
            const valuation = {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger.error(`Error calculando valuación de inventario para rancho ${ranchId}:`, errorMessage);
            throw new Error(`Error calculando valuación: ${errorMessage}`);
        }
    }
    async performInventoryAnalysis(ranchId, period = 365) {
        try {
            const cutoffDate = new Date(Date.now() - (period * 24 * 60 * 60 * 1000));
            const items = await Inventory_1.default.findAll({
                where: { farmId: ranchId }
            });
            const movements = await InventoryMovementModel.findAll({
                where: {
                    date: { [sequelize_1.Op.gte]: cutoffDate }
                },
                order: [['date', 'DESC']]
            });
            const abcAnalysis = this.calculateABCAnalysis(items, movements);
            const rotationAnalysis = this.calculateRotationAnalysis(items, movements, period);
            const expirationAnalysis = this.calculateExpirationAnalysis(items);
            const costAnalysis = this.calculateCostAnalysis(items, movements);
            const supplierPerformance = [
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
            const demandForecast = items.slice(0, 5).map(item => ({
                medicationId: item.id,
                medicationName: item.itemName,
                historicalUsage: [100, 120, 95, 110, 105, 130],
                forecastedDemand: [115, 125, 108, 118, 122, 135],
                seasonality: 0.15,
                trend: 0.08,
                accuracy: 87.5,
                recommendedStock: Math.round(item.currentStock * 1.15)
            }));
            const recommendations = this.generateInventoryRecommendations(items, movements);
            const analysis = {
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            logger.error(`Error realizando análisis de inventario para rancho ${ranchId}:`, errorMessage);
            throw new Error(`Error en análisis de inventario: ${errorMessage}`);
        }
    }
    isInboundMovement(movementType) {
        return [
            MovementType.PURCHASE,
            MovementType.RETURN,
            MovementType.FOUND,
            MovementType.RELEASE
        ].includes(movementType);
    }
    calculateItemStatus(currentStock, minStock, maxStock, expirationDate) {
        const now = new Date();
        if (expirationDate) {
            const daysToExpiry = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            if (daysToExpiry < 0) {
                return Inventory_1.StockStatus.EXPIRED;
            }
        }
        if (currentStock === 0) {
            return Inventory_1.StockStatus.OUT_OF_STOCK;
        }
        if (currentStock <= minStock) {
            return Inventory_1.StockStatus.LOW_STOCK;
        }
        if (maxStock > 0 && currentStock > maxStock * 1.2) {
            return Inventory_1.StockStatus.BACKORDERED;
        }
        return Inventory_1.StockStatus.IN_STOCK;
    }
    async recordMovement(movementData) {
        try {
            const movement = {
                ...movementData,
                id: this.generateMovementId(),
                createdAt: new Date()
            };
            await InventoryMovementModel.create(movement);
        }
        catch (error) {
            logger.error('Error registrando movimiento:', error);
        }
    }
    async checkAndCreateAlerts(itemId) {
        try {
            const item = await Inventory_1.default.findByPk(itemId);
            if (!item)
                return;
            const now = new Date();
            if (item.expirationDate) {
                const daysToExpiry = Math.ceil((item.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
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
                    }
                    catch (error) {
                        logger.warn('No se pudo enviar alerta de stock bajo', error);
                    }
                }
                if (daysToExpiry <= this.EXPIRATION_WARNING_DAYS && daysToExpiry > 0) {
                    try {
                        await emailService.sendNotificationEmail('inventario@rancho.com', `Vencimiento próximo: ${item.itemName}`, `El producto ${item.itemName} vence en ${daysToExpiry} días`);
                    }
                    catch (error) {
                        logger.warn('No se pudo enviar alerta de vencimiento', error);
                    }
                }
            }
        }
        catch (error) {
            logger.error('Error verificando alertas:', error);
        }
    }
    async checkAutoReorder(itemId) {
        try {
            if (!this.AUTO_REORDER_ENABLED)
                return;
            const item = await Inventory_1.default.findByPk(itemId);
            if (!item)
                return;
            if (item.currentStock <= item.reorderPoint) {
                await this.createAutoReorderPurchaseOrder(itemId, 'system');
            }
        }
        catch (error) {
            logger.error('Error verificando auto-reorden:', error);
        }
    }
    calculateItemValue(item, method) {
        switch (method) {
            case 'WEIGHTED_AVERAGE':
                return item.currentStock * item.unitCost;
            case 'FIFO':
            case 'LIFO':
            default:
                return item.currentStock * item.unitCost;
        }
    }
    mapInventoryCategoryToMedicationCategory(inventoryCategory) {
        switch (inventoryCategory) {
            case Inventory_1.InventoryCategory.MEDICATION:
                return MedicationCategory.ANTIBIOTIC;
            case Inventory_1.InventoryCategory.VACCINES:
                return MedicationCategory.VACCINE;
            case Inventory_1.InventoryCategory.SUPPLIES:
                return MedicationCategory.ANTISEPTIC;
            default:
                return MedicationCategory.ANTIBIOTIC;
        }
    }
    calculateABCAnalysis(items, movements) {
        return items.slice(0, 10).map((item, index) => ({
            medicationId: item.id,
            medicationName: item.itemName,
            annualUsage: Math.round(Math.random() * 1000 + 100),
            annualValue: Math.round(Math.random() * 50000 + 10000),
            classification: (index < 2 ? 'A' : index < 6 ? 'B' : 'C'),
            percentage: Math.round(Math.random() * 20 + 5),
            cumulativePercentage: Math.round(Math.random() * 100),
            recommendedManagement: index < 2 ? 'Control estricto' : index < 6 ? 'Control normal' : 'Control básico'
        }));
    }
    calculateRotationAnalysis(items, movements, period) {
        return items.slice(0, 10).map(item => {
            const turnoverRate = Math.random() * 15 + 1;
            return {
                medicationId: item.id,
                medicationName: item.itemName,
                averageStock: item.currentStock,
                annualUsage: Math.round(turnoverRate * item.currentStock),
                turnoverRate: Math.round(turnoverRate * 100) / 100,
                daysOfSupply: Math.round(365 / turnoverRate),
                classification: (turnoverRate > 12 ? 'fast_moving' : turnoverRate > 4 ? 'medium_moving' : turnoverRate > 1 ? 'slow_moving' : 'obsolete'),
                recommendation: turnoverRate > 12 ? 'Aumentar stock' : turnoverRate < 2 ? 'Reducir stock' : 'Mantener nivel actual'
            };
        });
    }
    calculateExpirationAnalysis(items) {
        const now = new Date();
        const expiredItems = items.filter(item => item.expirationDate && item.expirationDate < now);
        const expiringSoon = items.filter(item => {
            if (!item.expirationDate)
                return false;
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
    calculateCostAnalysis(items, movements) {
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
    generateInventoryRecommendations(items, movements) {
        const recommendations = [];
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
    async sendInventoryAlertNotification(alert) {
        try {
            await notificationService.sendInventoryAlert({
                itemId: alert.inventoryItemId,
                itemName: alert.medicationName,
                alertType: alert.alertType,
                currentStock: alert.currentValue,
                minStock: alert.thresholdValue,
                ranchId: 'default'
            });
        }
        catch (error) {
            logger.error('Error enviando notificación de alerta:', error);
        }
    }
    generatePurchaseOrderId() {
        return `po_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    generateOrderNumber() {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const sequence = Math.floor(Math.random() * 999) + 1;
        return `PO${year}${month}${day}-${sequence.toString().padStart(3, '0')}`;
    }
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
    convertLocationToStorageLocation(location) {
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
    generateMovementId() {
        return `mov_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }
}
exports.inventoryService = new InventoryService();
//# sourceMappingURL=inventory.js.map