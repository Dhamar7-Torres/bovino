"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productionService = exports.ProductionService = exports.ValidationError = exports.ApiError = exports.WeighingMethod = exports.MilkQuality = exports.EventStatus = exports.ProductionType = void 0;
const sequelize_1 = require("sequelize");
const logger_1 = require("../utils/logger");
const logger = {
    info: (message, metadata) => (0, logger_1.logInfo)(message, metadata, 'ProductionService'),
    error: (message, error) => (0, logger_1.logError)(message, { error }, error, 'ProductionService'),
    warn: (message, metadata) => (0, logger_1.logWarn)(message, metadata, 'ProductionService')
};
var ProductionType;
(function (ProductionType) {
    ProductionType["MILK"] = "MILK";
    ProductionType["WEIGHT"] = "WEIGHT";
    ProductionType["FEED_INTAKE"] = "FEED_INTAKE";
    ProductionType["GROWTH"] = "GROWTH";
})(ProductionType || (exports.ProductionType = ProductionType = {}));
var EventStatus;
(function (EventStatus) {
    EventStatus["PLANNED"] = "PLANNED";
    EventStatus["IN_PROGRESS"] = "IN_PROGRESS";
    EventStatus["COMPLETED"] = "COMPLETED";
    EventStatus["CANCELLED"] = "CANCELLED";
    EventStatus["OVERDUE"] = "OVERDUE";
})(EventStatus || (exports.EventStatus = EventStatus = {}));
var MilkQuality;
(function (MilkQuality) {
    MilkQuality["EXCELLENT"] = "EXCELLENT";
    MilkQuality["GOOD"] = "GOOD";
    MilkQuality["FAIR"] = "FAIR";
    MilkQuality["POOR"] = "POOR";
})(MilkQuality || (exports.MilkQuality = MilkQuality = {}));
var WeighingMethod;
(function (WeighingMethod) {
    WeighingMethod["SCALE"] = "SCALE";
    WeighingMethod["TAPE"] = "TAPE";
    WeighingMethod["VISUAL"] = "VISUAL";
    WeighingMethod["CALCULATED"] = "CALCULATED";
})(WeighingMethod || (exports.WeighingMethod = WeighingMethod = {}));
class ApiError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
    }
}
exports.ApiError = ApiError;
class ValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ValidationError';
    }
}
exports.ValidationError = ValidationError;
const Production = {
    create: async (data, options) => {
        const record = {
            ...data,
            id: `prod_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            update: async function (updateData, options) {
                if (updateData && typeof updateData === 'object') {
                    Object.assign(this, updateData, { updatedAt: new Date() });
                }
                return this;
            },
            toJSON: function () {
                return {
                    id: this.id,
                    bovineId: this.bovineId,
                    type: this.type,
                    value: this.value,
                    unit: this.unit,
                    recordedDate: this.recordedDate,
                    location: this.location,
                    notes: this.notes,
                    metadata: this.metadata,
                    createdAt: this.createdAt,
                    updatedAt: this.updatedAt
                };
            }
        };
        return record;
    },
    findByPk: async (id, options) => {
        if (!id)
            return null;
        const record = {
            id,
            bovineId: 'bovine_123',
            type: ProductionType.MILK,
            value: 15.5,
            unit: 'LITERS',
            recordedDate: new Date(),
            recordedBy: 'user_123',
            metadata: {},
            isDeleted: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            update: async function (updateData, options) {
                if (updateData && typeof updateData === 'object') {
                    Object.assign(this, updateData, { updatedAt: new Date() });
                }
                return this;
            },
            toJSON: function () {
                return {
                    id: this.id,
                    bovineId: this.bovineId,
                    type: this.type,
                    value: this.value,
                    unit: this.unit,
                    recordedDate: this.recordedDate
                };
            }
        };
        return record;
    },
    findAll: async (options) => {
        return [];
    },
    findAndCountAll: async (options) => {
        return { rows: [], count: 0 };
    },
    findOne: async (options) => {
        if (options?.where?.type === ProductionType.WEIGHT) {
            const record = {
                id: 'prev_weight_record',
                bovineId: options.where.bovineId || 'bovine_123',
                type: ProductionType.WEIGHT,
                value: 450,
                unit: 'KG',
                recordedDate: new Date(),
                isDeleted: false,
                recordedBy: 'user_123',
                createdAt: new Date(),
                updatedAt: new Date(),
                update: async function (updateData) {
                    if (updateData && typeof updateData === 'object') {
                        Object.assign(this, updateData, { updatedAt: new Date() });
                    }
                    return this;
                },
                toJSON: function () {
                    return {
                        id: this.id,
                        bovineId: this.bovineId,
                        type: this.type,
                        value: this.value,
                        unit: this.unit,
                        recordedDate: this.recordedDate
                    };
                }
            };
            return record;
        }
        return null;
    },
    update: async (data, options) => [1]
};
const Bovine = {
    findByPk: async (id, options) => {
        if (!id)
            return null;
        return {
            id,
            earTag: `TAG_${id}`,
            name: `Bovine_${id}`,
            breed: 'Holstein'
        };
    },
    update: async (updateData, options) => {
        return [1];
    }
};
const Event = {
    create: async (data, options) => ({
        ...data,
        id: `event_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
    })
};
const sequelize = {
    transaction: async () => ({
        commit: async () => { },
        rollback: async () => { }
    })
};
class LocationService {
    async getCurrentLocation() {
        return {
            latitude: 19.4326,
            longitude: -99.1332,
            accuracy: 10
        };
    }
}
class NotificationService {
    async createNotification(notification) {
        console.log(`📢 Notificación creada: ${notification.title}`);
    }
}
class ProductionService {
    constructor() {
        this.locationService = new LocationService();
        this.notificationService = new NotificationService();
    }
    async createProductionRecord(productionData, userId) {
        const transaction = await sequelize.transaction();
        try {
            await this.validateProductionData(productionData);
            const bovine = await Bovine.findByPk(productionData.bovineId);
            if (!bovine) {
                throw new ValidationError('El bovino especificado no existe');
            }
            let location = productionData.location;
            if (!location?.latitude || !location?.longitude) {
                location = await this.locationService.getCurrentLocation();
            }
            const productionRecord = await Production.create({
                ...productionData,
                location,
                recordedBy: userId,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            await Event.create({
                type: 'PRODUCTION_RECORD',
                title: `Registro de ${productionData.type.toLowerCase()}`,
                description: this.generateProductionDescription(productionData),
                bovineId: productionData.bovineId,
                location,
                scheduledDate: new Date(),
                status: EventStatus.COMPLETED,
                createdBy: userId
            });
            await this.updateBovineMetrics(productionData.bovineId, transaction);
            await this.checkProductionAlerts(productionRecord.id.toString(), transaction);
            await transaction.commit();
            logger.info('✅ Registro de producción creado exitosamente', {
                productionId: productionRecord.id,
                bovineId: productionData.bovineId,
                type: productionData.type,
                userId
            });
            return this.formatProductionRecord(productionRecord);
        }
        catch (error) {
            await transaction.rollback();
            logger.error('❌ Error creando registro de producción', { error, productionData });
            throw error;
        }
    }
    async getProductionByBovine(bovineId, options = {}) {
        try {
            const whereClause = { bovineId };
            if (options.type) {
                whereClause.type = options.type;
            }
            if (options.startDate || options.endDate) {
                whereClause.recordedDate = {};
                if (options.startDate) {
                    whereClause.recordedDate[sequelize_1.Op.gte] = options.startDate;
                }
                if (options.endDate) {
                    whereClause.recordedDate[sequelize_1.Op.lte] = options.endDate;
                }
            }
            const { rows: productions, count: total } = await Production.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Bovine,
                        attributes: ['id', 'earTag', 'name', 'breed']
                    }
                ],
                order: [['recordedDate', 'DESC']],
                limit: options.limit || 50,
                offset: options.offset || 0
            });
            const records = productions.map(prod => this.formatProductionRecord(prod));
            let metrics;
            if (options.includeMetrics && records.length > 0) {
                metrics = await this.calculateProductionMetrics(bovineId, options);
            }
            return { records, total, metrics };
        }
        catch (error) {
            logger.error('❌ Error obteniendo registros de producción por bovino', { error, bovineId });
            throw new ApiError('Error obteniendo registros de producción', 500);
        }
    }
    async updateProductionRecord(recordId, updateData, userId) {
        const transaction = await sequelize.transaction();
        try {
            const existingRecord = await Production.findByPk(recordId);
            if (!existingRecord) {
                throw new ValidationError('Registro de producción no encontrado');
            }
            if (updateData.type || updateData.value || updateData.unit) {
                const recordData = existingRecord.toJSON();
                await this.validateProductionData({
                    ...recordData,
                    ...updateData
                });
            }
            const safeUpdateData = {
                ...(updateData || {}),
                updatedAt: new Date(),
                lastModifiedBy: userId
            };
            await existingRecord.update(safeUpdateData);
            await this.updateBovineMetrics(existingRecord.bovineId, transaction);
            await transaction.commit();
            logger.info('✅ Registro de producción actualizado', {
                recordId,
                bovineId: existingRecord.bovineId,
                userId
            });
            return this.formatProductionRecord(existingRecord);
        }
        catch (error) {
            await transaction.rollback();
            logger.error('❌ Error actualizando registro de producción', { error, recordId });
            throw error;
        }
    }
    async deleteProductionRecord(recordId, userId) {
        const transaction = await sequelize.transaction();
        try {
            const record = await Production.findByPk(recordId);
            if (!record) {
                throw new ValidationError('Registro de producción no encontrado');
            }
            const bovineId = record.bovineId;
            await record.update({
                isDeleted: true,
                deletedAt: new Date(),
                deletedBy: userId
            });
            await this.updateBovineMetrics(bovineId, transaction);
            await transaction.commit();
            logger.info('✅ Registro de producción eliminado', {
                recordId,
                bovineId,
                userId
            });
            return true;
        }
        catch (error) {
            await transaction.rollback();
            logger.error('❌ Error eliminando registro de producción', { error, recordId });
            throw error;
        }
    }
    async calculateProductionMetrics(bovineId, options = {}) {
        try {
            const whereClause = {
                bovineId,
                isDeleted: false
            };
            if (options.type) {
                whereClause.type = options.type;
            }
            if (options.startDate || options.endDate) {
                whereClause.recordedDate = {};
                if (options.startDate) {
                    whereClause.recordedDate[sequelize_1.Op.gte] = options.startDate;
                }
                if (options.endDate) {
                    whereClause.recordedDate[sequelize_1.Op.lte] = options.endDate;
                }
            }
            const records = await Production.findAll({
                where: whereClause,
                order: [['recordedDate', 'ASC']]
            });
            if (records.length === 0) {
                return this.createEmptyMetrics(bovineId);
            }
            const recordsByType = records.reduce((acc, record) => {
                if (!acc[record.type]) {
                    acc[record.type] = [];
                }
                acc[record.type].push(record);
                return acc;
            }, {});
            const metrics = {
                bovineId,
                period: {
                    startDate: options.startDate || records[0].recordedDate,
                    endDate: options.endDate || records[records.length - 1].recordedDate
                },
                totalRecords: records.length,
                byType: {}
            };
            for (const [type, typeRecords] of Object.entries(recordsByType)) {
                const values = typeRecords.map(r => r.value);
                const unit = typeRecords[0]?.unit || 'UNIT';
                const productionType = type;
                metrics.byType[productionType] = {
                    count: typeRecords.length,
                    total: values.reduce((sum, val) => sum + val, 0),
                    average: values.reduce((sum, val) => sum + val, 0) / values.length,
                    minimum: Math.min(...values),
                    maximum: Math.max(...values),
                    unit,
                    lastRecord: typeRecords[typeRecords.length - 1]?.recordedDate || new Date(),
                    trend: options.includeTrends ?
                        await this.calculateTrend(typeRecords) : undefined
                };
            }
            return metrics;
        }
        catch (error) {
            logger.error('❌ Error calculando métricas de producción', { error, bovineId });
            throw new ApiError('Error calculando métricas de producción', 500);
        }
    }
    async getProductionTrends(bovineIds, type, period = 'month') {
        try {
            const whereClause = { isDeleted: false };
            if (bovineIds && bovineIds.length > 0) {
                whereClause.bovineId = { [sequelize_1.Op.in]: bovineIds };
            }
            if (type) {
                whereClause.type = type;
            }
            const endDate = new Date();
            const startDate = this.calculateStartDate(endDate, period);
            whereClause.recordedDate = {
                [sequelize_1.Op.gte]: startDate,
                [sequelize_1.Op.lte]: endDate
            };
            const records = await Production.findAll({
                where: whereClause,
                include: [{
                        model: Bovine,
                        attributes: ['id', 'earTag', 'name']
                    }],
                order: [['recordedDate', 'ASC']]
            });
            return this.processTrendsData(records, period);
        }
        catch (error) {
            logger.error('❌ Error obteniendo tendencias de producción', { error });
            throw new ApiError('Error obteniendo tendencias de producción', 500);
        }
    }
    async recordMilkProduction(milkData, userId) {
        try {
            await this.validateMilkProduction(milkData);
            const productionData = {
                bovineId: milkData.bovineId,
                type: ProductionType.MILK,
                value: milkData.quantity,
                unit: 'LITERS',
                recordedDate: milkData.milkingDate,
                location: milkData.location,
                notes: milkData.notes,
                metadata: {
                    milkingTime: milkData.milkingTime,
                    quality: milkData.quality,
                    fatContent: milkData.fatContent,
                    proteinContent: milkData.proteinContent,
                    somaticCellCount: milkData.somaticCellCount,
                    temperature: milkData.temperature
                }
            };
            const record = await this.createProductionRecord(productionData, userId);
            return {
                id: record.id,
                bovineId: record.bovineId,
                quantity: record.value,
                milkingDate: record.recordedDate,
                milkingTime: record.metadata?.milkingTime || 'MORNING',
                quality: record.metadata?.quality,
                fatContent: record.metadata?.fatContent,
                proteinContent: record.metadata?.proteinContent,
                somaticCellCount: record.metadata?.somaticCellCount,
                temperature: record.metadata?.temperature,
                location: record.location,
                notes: record.notes,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
        }
        catch (error) {
            logger.error('❌ Error registrando producción de leche', { error, milkData });
            throw error;
        }
    }
    async recordWeight(weightData, userId) {
        try {
            await this.validateWeightRecord(weightData);
            const productionData = {
                bovineId: weightData.bovineId,
                type: ProductionType.WEIGHT,
                value: weightData.weight,
                unit: 'KG',
                recordedDate: weightData.weighingDate,
                location: weightData.location,
                notes: weightData.notes,
                metadata: {
                    method: weightData.method,
                    equipment: weightData.equipment,
                    bodyConditionScore: weightData.bodyConditionScore,
                    estimatedWeight: weightData.estimatedWeight
                }
            };
            const record = await this.createProductionRecord(productionData, userId);
            return {
                id: record.id,
                bovineId: record.bovineId,
                weight: record.value,
                weighingDate: record.recordedDate,
                method: record.metadata?.method || WeighingMethod.SCALE,
                equipment: record.metadata?.equipment,
                bodyConditionScore: record.metadata?.bodyConditionScore,
                estimatedWeight: record.metadata?.estimatedWeight || false,
                location: record.location,
                notes: record.notes,
                createdAt: record.createdAt,
                updatedAt: record.updatedAt
            };
        }
        catch (error) {
            logger.error('❌ Error registrando peso', { error, weightData });
            throw error;
        }
    }
    async validateProductionData(data) {
        if (!data.bovineId) {
            throw new ValidationError('El ID del bovino es requerido');
        }
        if (!data.type || !Object.values(ProductionType).includes(data.type)) {
            throw new ValidationError('Tipo de producción inválido');
        }
        if (!data.value || data.value <= 0) {
            throw new ValidationError('El valor debe ser mayor a 0');
        }
        if (!data.unit) {
            throw new ValidationError('La unidad de medida es requerida');
        }
        if (!data.recordedDate) {
            throw new ValidationError('La fecha de registro es requerida');
        }
        if (data.recordedDate > new Date()) {
            throw new ValidationError('La fecha de registro no puede ser futura');
        }
    }
    async validateMilkProduction(data) {
        if (!data.quantity || data.quantity <= 0) {
            throw new ValidationError('La cantidad de leche debe ser mayor a 0');
        }
        if (data.quantity > 100) {
            throw new ValidationError('La cantidad de leche parece excesiva');
        }
        if (data.fatContent && (data.fatContent < 0 || data.fatContent > 10)) {
            throw new ValidationError('El contenido de grasa debe estar entre 0-10%');
        }
        if (data.proteinContent && (data.proteinContent < 0 || data.proteinContent > 5)) {
            throw new ValidationError('El contenido de proteína debe estar entre 0-5%');
        }
    }
    async validateWeightRecord(data) {
        if (!data.weight || data.weight <= 0) {
            throw new ValidationError('El peso debe ser mayor a 0');
        }
        if (data.weight < 50 || data.weight > 2000) {
            throw new ValidationError('El peso parece estar fuera del rango normal');
        }
        if (data.bodyConditionScore && (data.bodyConditionScore < 1 || data.bodyConditionScore > 5)) {
            throw new ValidationError('La condición corporal debe estar entre 1-5');
        }
    }
    formatProductionRecord(record) {
        return {
            id: record.id,
            bovineId: record.bovineId,
            type: record.type,
            value: record.value,
            unit: record.unit,
            recordedDate: record.recordedDate,
            location: record.location,
            notes: record.notes,
            metadata: record.metadata || {},
            createdAt: record.createdAt,
            updatedAt: record.updatedAt
        };
    }
    generateProductionDescription(data) {
        const typeLabels = {
            [ProductionType.MILK]: 'leche',
            [ProductionType.WEIGHT]: 'peso',
            [ProductionType.FEED_INTAKE]: 'consumo de alimento',
            [ProductionType.GROWTH]: 'crecimiento'
        };
        return `Registro de ${typeLabels[data.type]}: ${data.value} ${data.unit}`;
    }
    async updateBovineMetrics(bovineId, transaction) {
        try {
            const metrics = await this.calculateProductionMetrics(bovineId);
            await this.safeBovineUpdate(bovineId, {
                lastProductionUpdate: new Date(),
                productionMetrics: JSON.stringify(metrics)
            });
        }
        catch (error) {
            logger.warn('⚠️ Error actualizando métricas del bovino', { error, bovineId });
        }
    }
    async checkProductionAlerts(recordId, transaction) {
        try {
            const record = await Production.findByPk(recordId);
            if (!record)
                return;
            if (record.type === ProductionType.MILK && record.value < 5) {
                await this.notificationService.createNotification({
                    userId: record.recordedBy || 'unknown',
                    title: 'Baja producción de leche',
                    message: `Producción de leche por debajo del promedio: ${record.value}L`,
                    type: 'WARNING',
                    relatedId: record.bovineId,
                    relatedType: 'BOVINE'
                });
            }
            if (record.type === ProductionType.WEIGHT) {
                const lastWeight = await Production.findOne({
                    where: {
                        bovineId: record.bovineId,
                        type: ProductionType.WEIGHT,
                        id: { [sequelize_1.Op.ne]: recordId }
                    },
                    order: [['recordedDate', 'DESC']]
                });
                if (lastWeight) {
                    const weightChange = Math.abs(record.value - lastWeight.value);
                    const percentChange = (weightChange / lastWeight.value) * 100;
                    if (percentChange > 10) {
                        await this.notificationService.createNotification({
                            userId: record.recordedBy || 'unknown',
                            title: 'Cambio significativo de peso',
                            message: `Cambio de peso de ${percentChange.toFixed(1)}% detectado`,
                            type: 'WARNING',
                            relatedId: record.bovineId,
                            relatedType: 'BOVINE'
                        });
                    }
                }
            }
        }
        catch (error) {
            logger.warn('⚠️ Error verificando alertas de producción', { error, recordId });
        }
    }
    async calculateTrend(records) {
        if (records.length < 2)
            return 'STABLE';
        const values = records.map(r => r.value);
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
        const change = ((secondAvg - firstAvg) / firstAvg) * 100;
        if (change > 5)
            return 'INCREASING';
        if (change < -5)
            return 'DECREASING';
        return 'STABLE';
    }
    createEmptyMetrics(bovineId) {
        return {
            bovineId,
            period: { startDate: new Date(), endDate: new Date() },
            totalRecords: 0,
            byType: {}
        };
    }
    async safeBovineUpdate(bovineId, updateData) {
        try {
            if (updateData && typeof updateData === 'object') {
                await Bovine.update(updateData, {
                    where: { id: bovineId }
                });
            }
        }
        catch (error) {
            logger.warn('⚠️ Error actualizando bovino', { error, bovineId });
        }
    }
    calculateStartDate(endDate, period) {
        const start = new Date(endDate);
        switch (period) {
            case 'week':
                start.setDate(start.getDate() - 7);
                break;
            case 'month':
                start.setMonth(start.getMonth() - 1);
                break;
            case 'quarter':
                start.setMonth(start.getMonth() - 3);
                break;
            case 'year':
                start.setFullYear(start.getFullYear() - 1);
                break;
        }
        return start;
    }
    processTrendsData(records, period) {
        const groupedData = records.reduce((acc, record) => {
            const key = this.getDateKey(record.recordedDate, period);
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(record);
            return acc;
        }, {});
        const trends = {
            period,
            dataPoints: [],
            totalRecords: records.length,
            averageValue: records.length > 0 ?
                records.reduce((sum, r) => sum + r.value, 0) / records.length : 0
        };
        for (const [dateKey, dayRecords] of Object.entries(groupedData)) {
            const totalValue = dayRecords.reduce((sum, r) => sum + r.value, 0);
            const avgValue = totalValue / dayRecords.length;
            trends.dataPoints.push({
                date: new Date(dateKey),
                value: totalValue,
                average: avgValue,
                count: dayRecords.length
            });
        }
        trends.dataPoints.sort((a, b) => a.date.getTime() - b.date.getTime());
        return trends;
    }
    getDateKey(date, period) {
        switch (period) {
            case 'week':
            case 'month':
                return date.toISOString().split('T')[0];
            case 'quarter':
                return `${date.getFullYear()}-Q${Math.ceil((date.getMonth() + 1) / 3)}`;
            case 'year':
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            default:
                return date.toISOString().split('T')[0];
        }
    }
}
exports.ProductionService = ProductionService;
exports.productionService = new ProductionService();
//# sourceMappingURL=production.js.map