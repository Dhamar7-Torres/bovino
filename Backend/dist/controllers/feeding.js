"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedingController = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const FeedingPlan = {
    create: async (data) => ({ id: 'mock-plan-id', ...data }),
    count: async (options) => 5,
    findAll: async (options) => [],
    findByPk: async (id, options) => null,
    findAndCountAll: async (options) => ({ count: 0, rows: [] })
};
const FeedConsumption = {
    create: async (data) => ({ id: 'mock-consumption-id', ...data }),
    findAll: async (options) => [],
    findByPk: async (id, options) => null,
    findAndCountAll: async (options) => ({ count: 0, rows: [] })
};
const FeedInventory = {
    create: async (data) => ({ id: 'mock-inventory-id', ...data }),
    findAll: async (options) => [],
    findByPk: async (id, options) => null,
    findAndCountAll: async (options) => ({ count: 0, rows: [] })
};
const FeedSchedule = {
    create: async (data) => ({ id: 'mock-schedule-id', ...data })
};
class FeedingController {
    constructor() {
        this.createFeedingPlan = async (req, res) => {
            try {
                const planData = req.body;
                const userId = req.user?.id;
                if (!planData.name || !planData.bovineIds || planData.bovineIds.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Campos obligatorios faltantes',
                        errors: {
                            general: 'Nombre del plan y bovinos son obligatorios'
                        }
                    });
                    return;
                }
                const bovines = await models_1.Bovine.findAll({
                    where: {
                        id: { [sequelize_1.Op.in]: planData.bovineIds },
                        isActive: true
                    }
                });
                if (bovines.length !== planData.bovineIds.length) {
                    res.status(400).json({
                        success: false,
                        message: 'Algunos bovinos no fueron encontrados',
                        errors: {
                            bovineIds: 'Uno o más bovinos no existen o están inactivos'
                        }
                    });
                    return;
                }
                if (!planData.components || planData.components.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'El plan debe tener al menos un componente alimentario',
                        errors: {
                            components: 'Debe especificar al menos un tipo de alimento'
                        }
                    });
                    return;
                }
                const dailyCost = planData.components.reduce((total, component) => {
                    return total + (component.quantity * component.costPerUnit);
                }, 0);
                const newPlan = await FeedingPlan.create({
                    name: planData.name,
                    description: planData.description || '',
                    bovineIds: planData.bovineIds,
                    targetGroups: planData.targetGroups || {},
                    startDate: planData.startDate,
                    endDate: planData.endDate,
                    status: planData.status || 'draft',
                    components: planData.components,
                    nutritionalGoals: planData.nutritionalGoals,
                    dailyCost: dailyCost,
                    weeklySchedule: planData.weeklySchedule,
                    veterinarianApproval: planData.veterinarianApproval || false,
                    approvedBy: planData.approvedBy || null,
                    approvalDate: planData.veterinarianApproval ? new Date() : null,
                    notes: planData.notes || '',
                    createdBy: userId,
                    createdAt: new Date(),
                    lastModified: new Date()
                });
                await this.createAutomaticFeedingSchedules(newPlan.id, planData, userId);
                const planWithDetails = await FeedingPlan.findByPk(newPlan.id, {
                    include: [
                        {
                            model: models_1.User,
                            as: 'creator',
                            attributes: ['id', 'firstName', 'lastName']
                        }
                    ]
                });
                res.status(201).json({
                    success: true,
                    message: 'Plan nutricional creado exitosamente',
                    data: {
                        plan: planWithDetails
                    }
                });
            }
            catch (error) {
                console.error('Error al crear plan nutricional:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error inesperado al crear el plan nutricional'
                    }
                });
            }
        };
        this.getFeedingPlans = async (req, res) => {
            try {
                const { status, bovineIds, feedTypes, veterinarianApproval, dateRange, costRange, searchTerm, createdBy, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = req.query;
                const whereConditions = {};
                if (status) {
                    const statusArray = Array.isArray(status) ? status : [status];
                    whereConditions.status = { [sequelize_1.Op.in]: statusArray };
                }
                if (veterinarianApproval !== undefined) {
                    const boolValue = typeof veterinarianApproval === 'string'
                        ? veterinarianApproval === 'true'
                        : veterinarianApproval;
                    whereConditions.veterinarianApproval = boolValue;
                }
                if (createdBy) {
                    whereConditions.createdBy = createdBy;
                }
                if (dateRange && (dateRange.startDate || dateRange.endDate)) {
                    whereConditions.startDate = {};
                    if (dateRange.startDate)
                        whereConditions.startDate[sequelize_1.Op.gte] = new Date(dateRange.startDate);
                    if (dateRange.endDate)
                        whereConditions.startDate[sequelize_1.Op.lte] = new Date(dateRange.endDate);
                }
                if (costRange && (costRange.min !== undefined || costRange.max !== undefined)) {
                    whereConditions.dailyCost = {};
                    if (costRange.min !== undefined)
                        whereConditions.dailyCost[sequelize_1.Op.gte] = costRange.min;
                    if (costRange.max !== undefined)
                        whereConditions.dailyCost[sequelize_1.Op.lte] = costRange.max;
                }
                if (searchTerm) {
                    whereConditions[sequelize_1.Op.or] = [
                        { name: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                        { description: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                        { notes: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } }
                    ];
                }
                if (bovineIds && Array.isArray(bovineIds)) {
                    whereConditions[sequelize_1.Op.or] = bovineIds.map(id => ({
                        bovineIds: { [sequelize_1.Op.contains]: [id] }
                    }));
                }
                const pageNum = parseInt(page.toString()) || 1;
                const limitNum = Math.min(parseInt(limit.toString()) || 20, 100);
                const offset = (pageNum - 1) * limitNum;
                const { count, rows: plans } = await FeedingPlan.findAndCountAll({
                    where: whereConditions,
                    include: [
                        {
                            model: models_1.User,
                            as: 'creator',
                            attributes: ['id', 'firstName', 'lastName']
                        }
                    ],
                    limit: limitNum,
                    offset: offset,
                    order: [[sortBy, sortOrder]],
                    distinct: true
                });
                let filteredPlans = plans;
                if (feedTypes && Array.isArray(feedTypes)) {
                    filteredPlans = plans.filter((plan) => {
                        return plan.components.some((component) => feedTypes.includes(component.feedType));
                    });
                }
                const enrichedPlans = await Promise.all(filteredPlans.map(async (plan) => {
                    const bovines = await models_1.Bovine.findAll({
                        where: {
                            id: { [sequelize_1.Op.in]: plan.bovineIds },
                            isActive: true
                        },
                        attributes: ['id', 'earTag', 'name', 'type', 'weight']
                    });
                    return {
                        ...plan.toJSON(),
                        bovineInfo: bovines.map(bovine => ({
                            id: bovine.id,
                            earTag: bovine.earTag,
                            name: bovine.name,
                            type: bovine.type,
                            weight: bovine.weight
                        })),
                        totalAnimals: bovines.length
                    };
                }));
                const totalPages = Math.ceil(count / limitNum);
                res.status(200).json({
                    success: true,
                    message: 'Planes nutricionales obtenidos exitosamente',
                    data: {
                        plans: enrichedPlans,
                        pagination: {
                            page: pageNum,
                            limit: limitNum,
                            total: count,
                            totalPages: totalPages,
                            hasNext: pageNum < totalPages,
                            hasPrev: pageNum > 1
                        }
                    }
                });
            }
            catch (error) {
                console.error('Error al obtener planes nutricionales:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error al obtener los planes nutricionales'
                    }
                });
            }
        };
        this.createConsumptionRecord = async (req, res) => {
            try {
                const recordData = req.body;
                const userId = req.user?.id;
                if (!recordData.animalId || !recordData.feedType || !recordData.feedingTime) {
                    res.status(400).json({
                        success: false,
                        message: 'Campos obligatorios faltantes',
                        errors: {
                            general: 'ID del animal, tipo de alimento y hora de alimentación son obligatorios'
                        }
                    });
                    return;
                }
                const animal = await models_1.Bovine.findOne({
                    where: { id: recordData.animalId, isActive: true }
                });
                if (!animal) {
                    res.status(404).json({
                        success: false,
                        message: 'Animal no encontrado',
                        errors: {
                            animalId: 'El animal especificado no existe o está inactivo'
                        }
                    });
                    return;
                }
                const efficiency = recordData.consumption.scheduledQuantity > 0
                    ? (recordData.consumption.actualQuantity / recordData.consumption.scheduledQuantity) * 100
                    : 0;
                const newRecord = await FeedConsumption.create({
                    animalId: recordData.animalId,
                    animalTag: animal.earTag,
                    planId: recordData.planId || null,
                    feedComponentId: recordData.feedComponentId || null,
                    feedType: recordData.feedType,
                    feedName: recordData.feedName,
                    scheduledQuantity: recordData.consumption.scheduledQuantity,
                    actualQuantity: recordData.consumption.actualQuantity,
                    refusalQuantity: recordData.consumption.refusalQuantity,
                    wastageQuantity: recordData.consumption.wastageQuantity || 0,
                    consumptionPercentage: recordData.consumption.consumptionPercentage,
                    efficiencyRatio: Math.round(efficiency * 100) / 100,
                    feedingTime: recordData.feedingTime,
                    animalBehavior: recordData.animalBehavior,
                    environmentalFactors: recordData.environmentalFactors || {},
                    costAnalysis: recordData.costAnalysis || {},
                    recordedBy: userId,
                    notes: recordData.notes || '',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                const recordWithDetails = await FeedConsumption.findByPk(newRecord.id, {
                    include: [
                        {
                            model: models_1.Bovine,
                            as: 'animal',
                            attributes: ['id', 'earTag', 'name', 'type']
                        }
                    ]
                });
                res.status(201).json({
                    success: true,
                    message: 'Registro de consumo creado exitosamente',
                    data: {
                        record: recordWithDetails
                    }
                });
            }
            catch (error) {
                console.error('Error al crear registro de consumo:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error inesperado al crear el registro de consumo'
                    }
                });
            }
        };
        this.getConsumptionRecords = async (req, res) => {
            try {
                const { animalIds, planIds, feedTypes, behaviorRating, dateRange, location, efficiencyRange, page = 1, limit = 20, sortBy = 'feedingTime', sortOrder = 'DESC' } = req.query;
                const whereConditions = {};
                if (animalIds && Array.isArray(animalIds)) {
                    whereConditions.animalId = { [sequelize_1.Op.in]: animalIds };
                }
                if (planIds && Array.isArray(planIds)) {
                    whereConditions.planId = { [sequelize_1.Op.in]: planIds };
                }
                if (feedTypes && Array.isArray(feedTypes)) {
                    whereConditions.feedType = { [sequelize_1.Op.in]: feedTypes };
                }
                if (dateRange && (dateRange.startDate || dateRange.endDate)) {
                    whereConditions.feedingTime = {};
                    if (dateRange.startDate)
                        whereConditions.feedingTime[sequelize_1.Op.gte] = new Date(dateRange.startDate);
                    if (dateRange.endDate)
                        whereConditions.feedingTime[sequelize_1.Op.lte] = new Date(dateRange.endDate);
                }
                if (efficiencyRange && (efficiencyRange.min !== undefined || efficiencyRange.max !== undefined)) {
                    whereConditions.efficiencyRatio = {};
                    if (efficiencyRange.min !== undefined)
                        whereConditions.efficiencyRatio[sequelize_1.Op.gte] = efficiencyRange.min;
                    if (efficiencyRange.max !== undefined)
                        whereConditions.efficiencyRatio[sequelize_1.Op.lte] = efficiencyRange.max;
                }
                if (behaviorRating && Array.isArray(behaviorRating)) {
                    whereConditions['animalBehavior.appetite'] = { [sequelize_1.Op.in]: behaviorRating };
                }
                const pageNum = parseInt(page.toString()) || 1;
                const limitNum = Math.min(parseInt(limit.toString()) || 20, 100);
                const offset = (pageNum - 1) * limitNum;
                const { count, rows: records } = await FeedConsumption.findAndCountAll({
                    where: whereConditions,
                    include: [
                        {
                            model: models_1.Bovine,
                            as: 'animal',
                            attributes: ['id', 'earTag', 'name', 'type', 'weight']
                        },
                        {
                            model: FeedingPlan,
                            as: 'plan',
                            attributes: ['id', 'name', 'status'],
                            required: false
                        }
                    ],
                    limit: limitNum,
                    offset: offset,
                    order: [[sortBy, sortOrder]],
                    distinct: true
                });
                const totalPages = Math.ceil(count / limitNum);
                res.status(200).json({
                    success: true,
                    message: 'Registros de consumo obtenidos exitosamente',
                    data: {
                        records: records,
                        pagination: {
                            page: pageNum,
                            limit: limitNum,
                            total: count,
                            totalPages: totalPages,
                            hasNext: pageNum < totalPages,
                            hasPrev: pageNum > 1
                        }
                    }
                });
            }
            catch (error) {
                console.error('Error al obtener registros de consumo:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error al obtener los registros de consumo'
                    }
                });
            }
        };
        this.createFeedInventory = async (req, res) => {
            try {
                const inventoryData = req.body;
                const userId = req.user?.id;
                if (!inventoryData.feedName || !inventoryData.feedType || !inventoryData.supplier) {
                    res.status(400).json({
                        success: false,
                        message: 'Campos obligatorios faltantes',
                        errors: {
                            general: 'Nombre del alimento, tipo y proveedor son obligatorios'
                        }
                    });
                    return;
                }
                const newInventoryItem = await FeedInventory.create({
                    feedName: inventoryData.feedName,
                    feedType: inventoryData.feedType,
                    supplier: inventoryData.supplier,
                    batchNumber: inventoryData.batchNumber,
                    quantityReceived: inventoryData.quantities.received,
                    currentQuantity: inventoryData.quantities.current,
                    reservedQuantity: inventoryData.quantities.reserved || 0,
                    unit: inventoryData.quantities.unit,
                    nutritionalProfile: inventoryData.nutritionalProfile,
                    qualityMetrics: inventoryData.qualityMetrics,
                    storageConditions: inventoryData.storage.conditions,
                    packaging: inventoryData.storage.packaging,
                    storageDate: inventoryData.storage.storageDate,
                    unitCost: inventoryData.pricing.unitCost,
                    totalCost: inventoryData.pricing.totalCost,
                    currency: inventoryData.pricing.currency || 'MXN',
                    purchaseDate: inventoryData.pricing.purchaseDate,
                    invoice: inventoryData.pricing.invoice || '',
                    manufacturingDate: inventoryData.dates.manufacturingDate,
                    expirationDate: inventoryData.dates.expirationDate,
                    bestByDate: inventoryData.dates.bestByDate,
                    certifications: inventoryData.certifications || [],
                    notes: inventoryData.notes || '',
                    isActive: true,
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                const inventoryWithDetails = await FeedInventory.findByPk(newInventoryItem.id);
                res.status(201).json({
                    success: true,
                    message: 'Entrada de inventario creada exitosamente',
                    data: {
                        inventory: inventoryWithDetails
                    }
                });
            }
            catch (error) {
                console.error('Error al crear entrada de inventario:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error inesperado al crear la entrada de inventario'
                    }
                });
            }
        };
        this.getFeedingAnalytics = async (req, res) => {
            try {
                const { timeRange = 'monthly', bovineIds } = req.query;
                const currentDate = new Date();
                let startDate;
                switch (timeRange) {
                    case 'weekly':
                        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'monthly':
                        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                        break;
                    case 'quarterly':
                        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1);
                        break;
                    default:
                        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
                }
                const dateConditions = {
                    createdAt: { [sequelize_1.Op.gte]: startDate }
                };
                const bovineConditions = bovineIds && Array.isArray(bovineIds)
                    ? { animalId: { [sequelize_1.Op.in]: bovineIds } }
                    : {};
                const totalPlans = await FeedingPlan.count({ where: dateConditions });
                const activePlans = await FeedingPlan.count({
                    where: { ...dateConditions, status: 'active' }
                });
                const planData = await FeedingPlan.findAll({
                    where: { ...dateConditions, status: 'active' },
                    attributes: ['bovineIds', 'dailyCost']
                });
                const totalAnimals = new Set(planData.flatMap((plan) => plan.bovineIds)).size;
                const avgDailyCost = planData.length > 0
                    ? planData.reduce((sum, plan) => sum + plan.dailyCost, 0) / planData.length
                    : 0;
                const efficiencyData = await FeedConsumption.findAll({
                    where: {
                        feedingTime: { [sequelize_1.Op.gte]: startDate },
                        ...bovineConditions
                    },
                    attributes: [
                        [(0, sequelize_1.fn)('AVG', (0, sequelize_1.col)('efficiencyRatio')), 'avgEfficiency']
                    ],
                    raw: true
                });
                const feedEfficiency = parseFloat(efficiencyData[0]?.avgEfficiency || '0');
                const consumptionTrends = [];
                const periods = this.generatePeriods(startDate, currentDate, timeRange);
                for (const period of periods) {
                    const periodConsumption = await FeedConsumption.findAll({
                        where: {
                            feedingTime: {
                                [sequelize_1.Op.between]: [period.start, period.end]
                            },
                            ...bovineConditions
                        },
                        attributes: [
                            [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('actualQuantity')), 'totalConsumption'],
                            [(0, sequelize_1.fn)('AVG', (0, sequelize_1.col)('efficiencyRatio')), 'avgEfficiency'],
                            [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('costAnalysis.feedCost')), 'totalCost'],
                            [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('wastageQuantity')), 'totalWastage']
                        ],
                        raw: true
                    });
                    consumptionTrends.push({
                        period: period.label,
                        totalConsumption: parseFloat(periodConsumption[0]?.totalConsumption || '0'),
                        avgEfficiency: parseFloat(periodConsumption[0]?.avgEfficiency || '0'),
                        cost: parseFloat(periodConsumption[0]?.totalCost || '0'),
                        wastage: parseFloat(periodConsumption[0]?.totalWastage || '0')
                    });
                }
                const nutritionalBalance = {
                    proteinAdequacy: 92.5,
                    energyBalance: 88.3,
                    fiberContent: 78.9,
                    mineralBalance: 95.1,
                    supplementationRate: 67.8
                };
                const behaviorData = await FeedConsumption.findAll({
                    where: {
                        feedingTime: { [sequelize_1.Op.gte]: startDate },
                        ...bovineConditions
                    },
                    attributes: [
                        'animalBehavior'
                    ],
                    raw: true
                });
                const appetiteDistribution = {
                    excellent: 0,
                    good: 0,
                    fair: 0,
                    poor: 0,
                    refused: 0
                };
                let totalFeedingTime = 0;
                let feedingTimeCount = 0;
                behaviorData.forEach((record) => {
                    const behavior = record.animalBehavior;
                    if (behavior && behavior.appetite) {
                        appetiteDistribution[behavior.appetite] = (appetiteDistribution[behavior.appetite] || 0) + 1;
                    }
                    if (behavior && behavior.feedingDuration) {
                        totalFeedingTime += behavior.feedingDuration;
                        feedingTimeCount++;
                    }
                });
                const avgFeedingTime = feedingTimeCount > 0 ? totalFeedingTime / feedingTimeCount : 0;
                const feedTypeData = await FeedConsumption.findAll({
                    where: {
                        feedingTime: { [sequelize_1.Op.gte]: startDate },
                        ...bovineConditions
                    },
                    attributes: [
                        'feedType',
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('actualQuantity')), 'totalQuantity'],
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('costAnalysis.feedCost')), 'totalCost']
                    ],
                    group: ['feedType'],
                    raw: true
                });
                const totalFeedCost = feedTypeData.reduce((sum, item) => sum + parseFloat(item.totalCost || '0'), 0);
                const feedTypeBreakdown = feedTypeData.map((item) => ({
                    feedType: item.feedType,
                    percentage: totalFeedCost > 0 ? Math.round((parseFloat(item.totalCost || '0') / totalFeedCost) * 100) : 0,
                    cost: parseFloat(item.totalCost || '0')
                }));
                const inventoryData = await FeedInventory.findAll({
                    where: { isActive: true },
                    attributes: [
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('totalCost')), 'totalValue'],
                        [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.literal)("CASE WHEN currentQuantity < (quantityReceived * 0.1) THEN 1 END")), 'lowStock'],
                        [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.literal)("CASE WHEN expirationDate <= CURRENT_DATE + INTERVAL '30 days' THEN 1 END")), 'expiring'],
                        [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.literal)("CASE WHEN qualityMetrics.overallScore < 6 THEN 1 END")), 'qualityIssues']
                    ],
                    raw: true
                });
                const analytics = {
                    overview: {
                        totalPlans,
                        activePlans,
                        totalAnimals,
                        avgDailyCost: Math.round(avgDailyCost * 100) / 100,
                        feedEfficiency: Math.round(feedEfficiency * 100) / 100
                    },
                    consumptionTrends,
                    nutritionalBalance,
                    behaviorAnalysis: {
                        appetiteDistribution: appetiteDistribution,
                        avgFeedingTime: Math.round(avgFeedingTime),
                        competitionLevels: { low: 60, medium: 30, high: 10 },
                        healthObservations: [
                            { indicator: 'Buen apetito', frequency: 85, trend: 'stable' },
                            { indicator: 'Rumia normal', frequency: 92, trend: 'improving' },
                            { indicator: 'Comportamiento competitivo', frequency: 15, trend: 'declining' }
                        ]
                    },
                    costAnalysis: {
                        totalMonthlyCost: 0,
                        costPerAnimal: 0,
                        costPerKg: 0,
                        feedTypeBreakdown,
                        wastageCoast: 0
                    },
                    inventoryStatus: {
                        totalValue: parseFloat(inventoryData[0]?.totalValue || '0'),
                        lowStockAlerts: parseInt(inventoryData[0]?.lowStock || '0'),
                        expiringItems: parseInt(inventoryData[0]?.expiring || '0'),
                        qualityIssues: parseInt(inventoryData[0]?.qualityIssues || '0'),
                        topSuppliers: []
                    }
                };
                res.status(200).json({
                    success: true,
                    message: 'Análisis de alimentación obtenido exitosamente',
                    data: {
                        analytics,
                        timeRange,
                        period: { startDate, endDate: currentDate }
                    }
                });
            }
            catch (error) {
                console.error('Error al obtener análisis de alimentación:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error al obtener el análisis de alimentación'
                    }
                });
            }
        };
    }
    async createAutomaticFeedingSchedules(planId, planData, userId) {
        for (const [day, sessions] of Object.entries(planData.weeklySchedule)) {
            for (const session of sessions) {
                await FeedSchedule.create({
                    planId: planId,
                    dayOfWeek: day,
                    feedingTime: session.time,
                    feedComponents: session.feeds,
                    duration: session.duration,
                    responsible: session.responsible,
                    instructions: session.instructions || '',
                    isActive: true,
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }
        }
    }
    generatePeriods(startDate, endDate, timeRange) {
        const periods = [];
        let current = new Date(startDate);
        while (current < endDate) {
            let periodEnd;
            let label;
            switch (timeRange) {
                case 'weekly':
                    periodEnd = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000);
                    label = `Semana ${Math.ceil((current.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1}`;
                    break;
                case 'monthly':
                    periodEnd = new Date(current.getFullYear(), current.getMonth() + 1, 1);
                    label = current.toLocaleString('es-ES', { month: 'short', year: 'numeric' });
                    break;
                default:
                    periodEnd = new Date(current.getTime() + 30 * 24 * 60 * 60 * 1000);
                    label = current.toLocaleDateString('es-ES');
            }
            periods.push({
                start: new Date(current),
                end: new Date(Math.min(periodEnd.getTime(), endDate.getTime())),
                label
            });
            current = periodEnd;
        }
        return periods;
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
}
exports.FeedingController = FeedingController;
//# sourceMappingURL=feeding.js.map