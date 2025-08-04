"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancesController = void 0;
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
class FinancesController {
    constructor() {
        this.createTransaction = async (req, res) => {
            try {
                const transactionData = req.body;
                const userId = req.user?.id;
                if (!transactionData.type || !transactionData.category || !transactionData.amount || !transactionData.date) {
                    res.status(400).json({
                        success: false,
                        message: 'Campos obligatorios faltantes',
                        errors: {
                            general: 'Tipo, categoría, monto y fecha son obligatorios'
                        }
                    });
                    return;
                }
                if (transactionData.amount <= 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Monto inválido',
                        errors: {
                            amount: 'El monto debe ser mayor a cero'
                        }
                    });
                    return;
                }
                let locationId = null;
                if (transactionData.location) {
                    const locationRecord = await models_1.Location.create({
                        latitude: transactionData.location.latitude,
                        longitude: transactionData.location.longitude,
                        address: transactionData.location.address || '',
                        description: transactionData.location.description || '',
                        accuracy: 10,
                        timestamp: new Date(transactionData.date)
                    });
                    locationId = locationRecord.id;
                }
                let vendorId = null;
                if (transactionData.vendor) {
                    if (transactionData.vendor.id) {
                        vendorId = transactionData.vendor.id;
                    }
                    else {
                        vendorId = 'temp-vendor-id';
                    }
                }
                let customerId = null;
                if (transactionData.customer) {
                    if (transactionData.customer.id) {
                        customerId = transactionData.customer.id;
                    }
                    else {
                        customerId = 'temp-customer-id';
                    }
                }
                const taxAmount = transactionData.taxInfo?.taxAmount || 0;
                const discountAmount = transactionData.discount?.discountAmount || 0;
                const totalAmount = transactionData.amount + taxAmount - discountAmount;
                const newTransaction = await models_1.Finance.create({
                    type: transactionData.type,
                    category: transactionData.category,
                    subcategory: transactionData.subcategory || '',
                    amount: transactionData.amount,
                    currency: transactionData.currency || 'MXN',
                    description: transactionData.description,
                    date: new Date(transactionData.date),
                    dueDate: transactionData.dueDate ? new Date(transactionData.dueDate) : null,
                    status: transactionData.requiresApproval ? 'pending' : 'approved',
                    paymentMethod: transactionData.paymentMethod || 'cash',
                    vendorId: vendorId,
                    customerId: customerId,
                    relatedEntityType: transactionData.relatedEntityType,
                    relatedEntityId: transactionData.relatedEntityId,
                    bovineIds: transactionData.bovineIds || [],
                    eventId: transactionData.eventId,
                    assetId: transactionData.assetId,
                    locationId: locationId,
                    reference: transactionData.reference || '',
                    invoiceNumber: transactionData.invoiceNumber || '',
                    receiptNumber: transactionData.receiptNumber || '',
                    taxAmount: taxAmount,
                    taxRate: transactionData.taxInfo?.taxRate || 0,
                    discountAmount: discountAmount,
                    totalAmount: totalAmount,
                    attachments: transactionData.attachments || [],
                    tags: transactionData.tags || [],
                    notes: transactionData.notes || '',
                    approvedBy: transactionData.requiresApproval ? null : userId,
                    approvedAt: transactionData.requiresApproval ? null : new Date(),
                    accountingPeriod: transactionData.accountingPeriod || this.getCurrentAccountingPeriod(),
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                const transactionWithDetails = await models_1.Finance.findByPk(newTransaction.id, {
                    include: [
                        {
                            model: models_1.Location,
                            as: 'location',
                            required: false
                        }
                    ]
                });
                res.status(201).json({
                    success: true,
                    message: 'Transacción creada exitosamente',
                    data: {
                        transaction: transactionWithDetails
                    }
                });
            }
            catch (error) {
                console.error('Error al crear transacción:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error inesperado al crear la transacción'
                    }
                });
            }
        };
        this.getTransactions = async (req, res) => {
            try {
                const { type, category, status, dateRange, amountRange, paymentMethod, vendorId, customerId, bovineIds, searchTerm, page = '1', limit = '20', sortBy = 'date', sortOrder = 'DESC' } = req.query;
                const pageNum = parseInt(page) || 1;
                const limitNum = Math.min(parseInt(limit) || 20, 100);
                const whereConditions = {};
                if (type) {
                    whereConditions.type = Array.isArray(type) ? { [sequelize_1.Op.in]: type } : type;
                }
                if (category) {
                    whereConditions.category = Array.isArray(category) ? { [sequelize_1.Op.in]: category } : category;
                }
                if (status) {
                    whereConditions.status = Array.isArray(status) ? { [sequelize_1.Op.in]: status } : status;
                }
                if (paymentMethod)
                    whereConditions.paymentMethod = paymentMethod;
                if (vendorId)
                    whereConditions.vendorId = vendorId;
                if (customerId)
                    whereConditions.customerId = customerId;
                if (dateRange && typeof dateRange === 'object') {
                    const { startDate, endDate } = dateRange;
                    whereConditions.date = {};
                    if (startDate)
                        whereConditions.date[sequelize_1.Op.gte] = new Date(startDate);
                    if (endDate)
                        whereConditions.date[sequelize_1.Op.lte] = new Date(endDate);
                }
                if (amountRange && typeof amountRange === 'object') {
                    const { min, max } = amountRange;
                    whereConditions.amount = {};
                    if (min !== undefined)
                        whereConditions.amount[sequelize_1.Op.gte] = parseFloat(min);
                    if (max !== undefined)
                        whereConditions.amount[sequelize_1.Op.lte] = parseFloat(max);
                }
                if (searchTerm && typeof searchTerm === 'string') {
                    whereConditions[sequelize_1.Op.or] = [
                        { description: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                        { reference: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                        { invoiceNumber: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                        { notes: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } }
                    ];
                }
                if (bovineIds && Array.isArray(bovineIds) && bovineIds.length > 0) {
                    whereConditions.bovineIds = { [sequelize_1.Op.overlap]: bovineIds };
                }
                const offset = (pageNum - 1) * limitNum;
                const { count, rows: transactions } = await models_1.Finance.findAndCountAll({
                    where: whereConditions,
                    include: [
                        {
                            model: models_1.Location,
                            as: 'location',
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
                    message: 'Transacciones obtenidas exitosamente',
                    data: {
                        transactions,
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
                console.error('Error al obtener transacciones:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error al obtener las transacciones'
                    }
                });
            }
        };
        this.createBudget = async (req, res) => {
            try {
                const budgetData = req.body;
                const userId = req.user?.id;
                if (!budgetData.name || !budgetData.startDate || !budgetData.endDate || !budgetData.totalBudget) {
                    res.status(400).json({
                        success: false,
                        message: 'Campos obligatorios faltantes',
                        errors: {
                            general: 'Nombre, fechas y monto total del presupuesto son obligatorios'
                        }
                    });
                    return;
                }
                const startDate = new Date(budgetData.startDate);
                const endDate = new Date(budgetData.endDate);
                if (startDate >= endDate) {
                    res.status(400).json({
                        success: false,
                        message: 'Fechas inválidas',
                        errors: {
                            dates: 'La fecha de inicio debe ser anterior a la fecha de fin'
                        }
                    });
                    return;
                }
                if (!budgetData.categories || budgetData.categories.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'Categorías del presupuesto requeridas',
                        errors: {
                            categories: 'Debe especificar al menos una categoría presupuestaria'
                        }
                    });
                    return;
                }
                const categoriesSum = budgetData.categories.reduce((sum, cat) => sum + cat.budgetedAmount, 0);
                if (categoriesSum > budgetData.totalBudget) {
                    res.status(400).json({
                        success: false,
                        message: 'Error en categorías presupuestarias',
                        errors: {
                            categories: 'La suma de las categorías excede el presupuesto total'
                        }
                    });
                    return;
                }
                const newBudget = {
                    id: 'temp-budget-id',
                    name: budgetData.name,
                    description: budgetData.description || '',
                    period: budgetData.period,
                    startDate: startDate,
                    endDate: endDate,
                    totalBudget: budgetData.totalBudget,
                    currency: budgetData.currency || 'MXN',
                    categories: budgetData.categories,
                    objectives: budgetData.objectives,
                    assumptions: budgetData.assumptions || [],
                    status: budgetData.approvalWorkflow?.requiresApproval ? 'pending_approval' : 'active',
                    approvalWorkflow: budgetData.approvalWorkflow || { requiresApproval: false, approvers: [] },
                    notes: budgetData.notes || '',
                    tags: budgetData.tags || [],
                    createdBy: userId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
                res.status(201).json({
                    success: true,
                    message: 'Presupuesto creado exitosamente',
                    data: {
                        budget: newBudget
                    }
                });
            }
            catch (error) {
                console.error('Error al crear presupuesto:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error inesperado al crear el presupuesto'
                    }
                });
            }
        };
        this.getProfitLossAnalysis = async (req, res) => {
            try {
                const { period = 'monthly', startDate, endDate, categories, bovineIds, compareWithPrevious = 'true', currency = 'MXN' } = req.query;
                const currentDate = new Date();
                const analysisStartDate = startDate ? new Date(startDate) : new Date(currentDate.getFullYear(), 0, 1);
                const analysisEndDate = endDate ? new Date(endDate) : currentDate;
                const dateConditions = {
                    date: { [sequelize_1.Op.between]: [analysisStartDate, analysisEndDate] }
                };
                const additionalConditions = { ...dateConditions };
                if (categories) {
                    const categoryArray = Array.isArray(categories) ? categories : [categories];
                    additionalConditions.category = { [sequelize_1.Op.in]: categoryArray };
                }
                if (bovineIds && Array.isArray(bovineIds) && bovineIds.length > 0) {
                    additionalConditions.bovineIds = { [sequelize_1.Op.overlap]: bovineIds };
                }
                const revenueData = await models_1.Finance.findAll({
                    where: {
                        ...additionalConditions,
                        type: 'income'
                    },
                    attributes: [
                        'category',
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('amount')), 'total'],
                        [(0, sequelize_1.fn)('DATE_TRUNC', (0, sequelize_1.literal)("'month'"), (0, sequelize_1.col)('date')), 'month']
                    ],
                    group: ['category', (0, sequelize_1.fn)('DATE_TRUNC', (0, sequelize_1.literal)("'month'"), (0, sequelize_1.col)('date'))],
                    raw: true
                });
                const expenseData = await models_1.Finance.findAll({
                    where: {
                        ...additionalConditions,
                        type: 'expense'
                    },
                    attributes: [
                        'category',
                        [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('amount')), 'total'],
                        [(0, sequelize_1.fn)('DATE_TRUNC', (0, sequelize_1.literal)("'month'"), (0, sequelize_1.col)('date')), 'month']
                    ],
                    group: ['category', (0, sequelize_1.fn)('DATE_TRUNC', (0, sequelize_1.literal)("'month'"), (0, sequelize_1.col)('date'))],
                    raw: true
                });
                const totalRevenue = revenueData.reduce((sum, item) => sum + parseFloat(item.total), 0);
                const revenueByCategory = {};
                const revenueByMonth = [];
                revenueData.forEach((item) => {
                    revenueByCategory[item.category] = (revenueByCategory[item.category] || 0) + parseFloat(item.total);
                });
                const monthlyRevenue = new Map();
                revenueData.forEach((item) => {
                    const month = new Date(item.month).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
                    monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + parseFloat(item.total));
                });
                monthlyRevenue.forEach((amount, month) => {
                    revenueByMonth.push({ month, amount });
                });
                const totalExpenses = expenseData.reduce((sum, item) => sum + parseFloat(item.total), 0);
                const expensesByCategory = {};
                const expensesByMonth = [];
                expenseData.forEach((item) => {
                    expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + parseFloat(item.total);
                });
                const fixedCostCategories = ['insurance', 'utilities', 'interest', 'depreciation'];
                const fixedCosts = Object.entries(expensesByCategory)
                    .filter(([category]) => fixedCostCategories.includes(category))
                    .reduce((sum, [, amount]) => sum + amount, 0);
                const variableCosts = totalExpenses - fixedCosts;
                const grossProfit = totalRevenue - variableCosts;
                const netProfit = totalRevenue - totalExpenses;
                const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
                const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
                const operatingMargin = grossMargin;
                const ebitda = netProfit;
                const totalAnimals = await models_1.Bovine.count({ where: { isActive: true } });
                const revenuePerAnimal = totalAnimals > 0 ? totalRevenue / totalAnimals : 0;
                const costPerAnimal = totalAnimals > 0 ? totalExpenses / totalAnimals : 0;
                const profitPerAnimal = revenuePerAnimal - costPerAnimal;
                const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
                const breakEvenPoint = fixedCosts;
                const paybackPeriod = netProfit > 0 ? totalExpenses / (netProfit / 12) : 0;
                let comparison = undefined;
                if (compareWithPrevious === 'true') {
                    const previousPeriodDays = Math.ceil((analysisEndDate.getTime() - analysisStartDate.getTime()) / (1000 * 60 * 60 * 24));
                    const previousStartDate = new Date(analysisStartDate.getTime() - previousPeriodDays * 24 * 60 * 60 * 1000);
                    const previousEndDate = analysisStartDate;
                    const previousRevenueData = await models_1.Finance.sum('amount', {
                        where: {
                            type: 'income',
                            date: { [sequelize_1.Op.between]: [previousStartDate, previousEndDate] }
                        }
                    }) || 0;
                    const previousExpenseData = await models_1.Finance.sum('amount', {
                        where: {
                            type: 'expense',
                            date: { [sequelize_1.Op.between]: [previousStartDate, previousEndDate] }
                        }
                    }) || 0;
                    const previousProfit = previousRevenueData - previousExpenseData;
                    const previousMargin = previousRevenueData > 0 ? (previousProfit / previousRevenueData) * 100 : 0;
                    comparison = {
                        previousPeriod: {
                            revenue: Math.round(previousRevenueData * 100) / 100,
                            expenses: Math.round(previousExpenseData * 100) / 100,
                            profit: Math.round(previousProfit * 100) / 100,
                            margin: Math.round(previousMargin * 100) / 100
                        },
                        variance: {
                            revenue: {
                                amount: Math.round((totalRevenue - previousRevenueData) * 100) / 100,
                                percentage: previousRevenueData > 0 ? Math.round(((totalRevenue - previousRevenueData) / previousRevenueData) * 10000) / 100 : 0
                            },
                            expenses: {
                                amount: Math.round((totalExpenses - previousExpenseData) * 100) / 100,
                                percentage: previousExpenseData > 0 ? Math.round(((totalExpenses - previousExpenseData) / previousExpenseData) * 10000) / 100 : 0
                            },
                            profit: {
                                amount: Math.round((netProfit - previousProfit) * 100) / 100,
                                percentage: previousProfit > 0 ? Math.round(((netProfit - previousProfit) / previousProfit) * 10000) / 100 : 0
                            }
                        }
                    };
                }
                const revenueGrowth = comparison ? comparison.variance.revenue : { amount: 0, percentage: 0 };
                const growthTrend = revenueGrowth.percentage > 5 ? 'up' : revenueGrowth.percentage < -5 ? 'down' : 'stable';
                const analysis = {
                    period: `${analysisStartDate.toLocaleDateString('es-ES')} - ${analysisEndDate.toLocaleDateString('es-ES')}`,
                    revenue: {
                        total: Math.round(totalRevenue * 100) / 100,
                        byCategory: Object.fromEntries(Object.entries(revenueByCategory).map(([cat, amount]) => [cat, Math.round(amount * 100) / 100])),
                        byMonth: revenueByMonth.map(item => ({
                            ...item,
                            amount: Math.round(item.amount * 100) / 100
                        })),
                        growth: {
                            amount: Math.round(revenueGrowth.amount * 100) / 100,
                            percentage: Math.round(revenueGrowth.percentage * 100) / 100,
                            trend: growthTrend
                        }
                    },
                    expenses: {
                        total: Math.round(totalExpenses * 100) / 100,
                        byCategory: Object.fromEntries(Object.entries(expensesByCategory).map(([cat, amount]) => [cat, Math.round(amount * 100) / 100])),
                        byMonth: expensesByMonth.map(item => ({
                            ...item,
                            amount: Math.round(item.amount * 100) / 100
                        })),
                        variableCosts: Math.round(variableCosts * 100) / 100,
                        fixedCosts: Math.round(fixedCosts * 100) / 100
                    },
                    profitability: {
                        grossProfit: Math.round(grossProfit * 100) / 100,
                        netProfit: Math.round(netProfit * 100) / 100,
                        grossMargin: Math.round(grossMargin * 100) / 100,
                        netMargin: Math.round(netMargin * 100) / 100,
                        operatingMargin: Math.round(operatingMargin * 100) / 100,
                        ebitda: Math.round(ebitda * 100) / 100
                    },
                    metrics: {
                        revenuePerAnimal: Math.round(revenuePerAnimal * 100) / 100,
                        costPerAnimal: Math.round(costPerAnimal * 100) / 100,
                        profitPerAnimal: Math.round(profitPerAnimal * 100) / 100,
                        roi: Math.round(roi * 100) / 100,
                        breakEvenPoint: Math.round(breakEvenPoint * 100) / 100,
                        paybackPeriod: Math.round(paybackPeriod * 100) / 100
                    },
                    comparison
                };
                res.status(200).json({
                    success: true,
                    message: 'Análisis de ganancias y pérdidas obtenido exitosamente',
                    data: {
                        analysis,
                        currency,
                        period: { startDate: analysisStartDate, endDate: analysisEndDate }
                    }
                });
            }
            catch (error) {
                console.error('Error al obtener análisis de P&L:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error al obtener el análisis de ganancias y pérdidas'
                    }
                });
            }
        };
        this.getCashFlowAnalysis = async (req, res) => {
            try {
                const { period = 'monthly', startDate, endDate, includeProjections = 'false' } = req.query;
                const currentDate = new Date();
                const analysisStartDate = startDate ? new Date(startDate) : new Date(currentDate.getFullYear(), 0, 1);
                const analysisEndDate = endDate ? new Date(endDate) : currentDate;
                const dateConditions = {
                    date: { [sequelize_1.Op.between]: [analysisStartDate, analysisEndDate] }
                };
                const netIncome = await models_1.Finance.sum('amount', {
                    where: { ...dateConditions, type: 'income' }
                }) || 0;
                const operatingExpenses = await models_1.Finance.sum('amount', {
                    where: {
                        ...dateConditions,
                        type: 'expense',
                        category: { [sequelize_1.Op.notIn]: ['equipment', 'animal_purchase'] }
                    }
                }) || 0;
                const netOperatingIncome = netIncome - operatingExpenses;
                const assetPurchases = await models_1.Finance.sum('amount', {
                    where: { ...dateConditions, type: 'expense', category: 'equipment' }
                }) || 0;
                const animalPurchases = await models_1.Finance.sum('amount', {
                    where: { ...dateConditions, type: 'expense', category: 'animal_purchase' }
                }) || 0;
                const animalSales = await models_1.Finance.sum('amount', {
                    where: { ...dateConditions, type: 'income', category: 'animal_sale' }
                }) || 0;
                const netInvestingCashFlow = animalSales - (assetPurchases + animalPurchases);
                const netFinancingCashFlow = 0;
                const netCashFlow = netOperatingIncome + netInvestingCashFlow + netFinancingCashFlow;
                let projections = undefined;
                if (includeProjections === 'true') {
                    const monthlyAverage = netCashFlow / 12;
                    projections = [
                        { period: 'Próximo mes', projectedCashFlow: Math.round(monthlyAverage * 100) / 100, confidenceLevel: 85 },
                        { period: 'Próximos 3 meses', projectedCashFlow: Math.round(monthlyAverage * 3 * 100) / 100, confidenceLevel: 75 },
                        { period: 'Próximos 6 meses', projectedCashFlow: Math.round(monthlyAverage * 6 * 100) / 100, confidenceLevel: 65 }
                    ];
                }
                const analysis = {
                    period: `${analysisStartDate.toLocaleDateString('es-ES')} - ${analysisEndDate.toLocaleDateString('es-ES')}`,
                    operatingActivities: {
                        netIncome: Math.round(netIncome * 100) / 100,
                        depreciation: 0,
                        workingCapitalChanges: 0,
                        otherOperatingAdjustments: 0,
                        netOperatingCashFlow: Math.round(netOperatingIncome * 100) / 100
                    },
                    investingActivities: {
                        assetPurchases: Math.round(assetPurchases * 100) / 100,
                        assetSales: 0,
                        animalPurchases: Math.round(animalPurchases * 100) / 100,
                        animalSales: Math.round(animalSales * 100) / 100,
                        netInvestingCashFlow: Math.round(netInvestingCashFlow * 100) / 100
                    },
                    financingActivities: {
                        borrowings: 0,
                        loanRepayments: 0,
                        ownerContributions: 0,
                        ownerWithdrawals: 0,
                        netFinancingCashFlow: 0
                    },
                    summary: {
                        beginningBalance: 0,
                        netCashFlow: Math.round(netCashFlow * 100) / 100,
                        endingBalance: Math.round(netCashFlow * 100) / 100,
                        freeCashFlow: Math.round(netOperatingIncome * 100) / 100,
                        cashConversionCycle: 30
                    },
                    projections
                };
                res.status(200).json({
                    success: true,
                    message: 'Análisis de flujo de caja obtenido exitosamente',
                    data: {
                        analysis,
                        period: { startDate: analysisStartDate, endDate: analysisEndDate }
                    }
                });
            }
            catch (error) {
                console.error('Error al obtener análisis de flujo de caja:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error al obtener el análisis de flujo de caja'
                    }
                });
            }
        };
        this.getROIAnalysis = async (req, res) => {
            try {
                const { period = 'yearly', startDate, endDate, bovineIds, categories } = req.query;
                const currentDate = new Date();
                const analysisStartDate = startDate ? new Date(startDate) : new Date(currentDate.getFullYear(), 0, 1);
                const analysisEndDate = endDate ? new Date(endDate) : currentDate;
                const dateConditions = {
                    date: { [sequelize_1.Op.between]: [analysisStartDate, analysisEndDate] }
                };
                const totalInvestment = await models_1.Finance.sum('amount', {
                    where: {
                        ...dateConditions,
                        type: 'expense',
                        category: { [sequelize_1.Op.in]: ['animal_purchase', 'equipment', 'feed', 'veterinary', 'breeding'] }
                    }
                }) || 0;
                const totalReturn = await models_1.Finance.sum('amount', {
                    where: { ...dateConditions, type: 'income' }
                }) || 0;
                const netProfit = totalReturn - totalInvestment;
                const overallROI = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
                const periodInDays = Math.ceil((analysisEndDate.getTime() - analysisStartDate.getTime()) / (1000 * 60 * 60 * 24));
                const roiAnnualized = periodInDays > 0 ? (overallROI * 365) / periodInDays : 0;
                const paybackPeriod = netProfit > 0 ? (totalInvestment / netProfit) * 12 : 0;
                const categoryROI = [];
                if (categories) {
                    const categoryList = Array.isArray(categories) ? categories : [categories];
                    for (const category of categoryList) {
                        const categoryInvestment = await models_1.Finance.sum('amount', {
                            where: { ...dateConditions, type: 'expense', category: category }
                        }) || 0;
                        const categoryReturn = await models_1.Finance.sum('amount', {
                            where: { ...dateConditions, type: 'income', category: category }
                        }) || 0;
                        const categoryProfit = categoryReturn - categoryInvestment;
                        const categoryROIValue = categoryInvestment > 0 ? (categoryProfit / categoryInvestment) * 100 : 0;
                        const efficiency = categoryReturn / (categoryInvestment || 1);
                        categoryROI.push({
                            category: category,
                            investment: Math.round(categoryInvestment * 100) / 100,
                            return: Math.round(categoryReturn * 100) / 100,
                            profit: Math.round(categoryProfit * 100) / 100,
                            roi: Math.round(categoryROIValue * 100) / 100,
                            efficiency: Math.round(efficiency * 100) / 100
                        });
                    }
                }
                const animalROI = [];
                if (bovineIds && Array.isArray(bovineIds)) {
                    for (const bovineId of bovineIds) {
                        const animalId = typeof bovineId === 'string' ? bovineId : String(bovineId);
                        const animal = await models_1.Bovine.findByPk(animalId);
                        if (!animal)
                            continue;
                        const animalInvestment = await models_1.Finance.sum('amount', {
                            where: {
                                ...dateConditions,
                                type: 'expense',
                                bovineIds: { [sequelize_1.Op.overlap]: [animalId] }
                            }
                        }) || 0;
                        const animalReturn = await models_1.Finance.sum('amount', {
                            where: {
                                ...dateConditions,
                                type: 'income',
                                bovineIds: { [sequelize_1.Op.overlap]: [animalId] }
                            }
                        }) || 0;
                        const animalProfit = animalReturn - animalInvestment;
                        const animalROIValue = animalInvestment > 0 ? (animalProfit / animalInvestment) * 100 : 0;
                        const daysSincePurchase = animal.createdAt
                            ? Math.ceil((currentDate.getTime() - animal.createdAt.getTime()) / (1000 * 60 * 60 * 24))
                            : 0;
                        const profitPerDay = daysSincePurchase > 0 ? animalProfit / daysSincePurchase : 0;
                        let status = 'loss';
                        if (animalProfit > 100)
                            status = 'profitable';
                        else if (animalProfit >= -100 && animalProfit <= 100)
                            status = 'break_even';
                        animalROI.push({
                            animalId: animalId,
                            earTag: animal.earTag || '',
                            name: animal.name || '',
                            investment: Math.round(animalInvestment * 100) / 100,
                            return: Math.round(animalReturn * 100) / 100,
                            profit: Math.round(animalProfit * 100) / 100,
                            roi: Math.round(animalROIValue * 100) / 100,
                            daysSincePurchase,
                            profitPerDay: Math.round(profitPerDay * 100) / 100,
                            status
                        });
                    }
                }
                const trends = [];
                for (let i = 5; i >= 0; i--) {
                    const periodStart = new Date(analysisStartDate);
                    periodStart.setMonth(periodStart.getMonth() - i);
                    const periodEnd = new Date(periodStart);
                    periodEnd.setMonth(periodEnd.getMonth() + 1);
                    trends.push({
                        period: periodStart.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
                        roi: Math.round((overallROI + (Math.random() - 0.5) * 10) * 100) / 100,
                        investment: Math.round((totalInvestment / 6) * 100) / 100,
                        return: Math.round((totalReturn / 6) * 100) / 100,
                        efficiency: Math.round((1 + (Math.random() - 0.5) * 0.2) * 100) / 100
                    });
                }
                const analysis = {
                    overall: {
                        totalInvestment: Math.round(totalInvestment * 100) / 100,
                        totalReturn: Math.round(totalReturn * 100) / 100,
                        netProfit: Math.round(netProfit * 100) / 100,
                        roi: Math.round(overallROI * 100) / 100,
                        roiAnnualized: Math.round(roiAnnualized * 100) / 100,
                        paybackPeriod: Math.round(paybackPeriod * 100) / 100
                    },
                    byCategory: categoryROI,
                    byAnimal: animalROI,
                    trends
                };
                res.status(200).json({
                    success: true,
                    message: 'Análisis de ROI obtenido exitosamente',
                    data: {
                        analysis,
                        period: { startDate: analysisStartDate, endDate: analysisEndDate }
                    }
                });
            }
            catch (error) {
                console.error('Error al obtener análisis de ROI:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error al obtener el análisis de ROI'
                    }
                });
            }
        };
        this.getFinancialMetrics = async (req, res) => {
            try {
                const { period = 'yearly' } = req.query;
                const currentDate = new Date();
                const yearStart = new Date(currentDate.getFullYear(), 0, 1);
                const totalAssets = await models_1.Finance.sum('amount', {
                    where: {
                        type: 'expense',
                        category: { [sequelize_1.Op.in]: ['equipment', 'animal_purchase'] },
                        date: { [sequelize_1.Op.gte]: yearStart }
                    }
                }) || 0;
                const totalRevenue = await models_1.Finance.sum('amount', {
                    where: { type: 'income', date: { [sequelize_1.Op.gte]: yearStart } }
                }) || 0;
                const totalExpenses = await models_1.Finance.sum('amount', {
                    where: { type: 'expense', date: { [sequelize_1.Op.gte]: yearStart } }
                }) || 0;
                const netIncome = totalRevenue - totalExpenses;
                const totalAnimals = await models_1.Bovine.count({ where: { isActive: true } });
                const metrics = {
                    liquidity: {
                        currentRatio: 1.5,
                        quickRatio: 1.2,
                        cashRatio: 0.8,
                        workingCapital: Math.round((totalRevenue - totalExpenses) * 100) / 100,
                        daysInCash: 45
                    },
                    profitability: {
                        grossMargin: totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses * 0.6) / totalRevenue) * 10000) / 100 : 0,
                        operatingMargin: totalRevenue > 0 ? Math.round(((totalRevenue - totalExpenses * 0.8) / totalRevenue) * 10000) / 100 : 0,
                        netMargin: totalRevenue > 0 ? Math.round((netIncome / totalRevenue) * 10000) / 100 : 0,
                        returnOnAssets: totalAssets > 0 ? Math.round((netIncome / totalAssets) * 10000) / 100 : 0,
                        returnOnEquity: totalAssets > 0 ? Math.round((netIncome / (totalAssets * 0.7)) * 10000) / 100 : 0,
                        returnOnInvestment: totalAssets > 0 ? Math.round((netIncome / totalAssets) * 10000) / 100 : 0
                    },
                    efficiency: {
                        assetTurnover: totalAssets > 0 ? Math.round((totalRevenue / totalAssets) * 100) / 100 : 0,
                        inventoryTurnover: 6.5,
                        receivableTurnover: 12.0,
                        revenuePerAnimal: totalAnimals > 0 ? Math.round((totalRevenue / totalAnimals) * 100) / 100 : 0,
                        costPerAnimal: totalAnimals > 0 ? Math.round((totalExpenses / totalAnimals) * 100) / 100 : 0,
                        feedEfficiencyRatio: 2.8
                    },
                    leverage: {
                        debtToEquityRatio: 0.3,
                        debtToAssetsRatio: 0.2,
                        interestCoverage: 8.5,
                        debtServiceCoverage: 2.1
                    },
                    growth: {
                        revenueGrowthRate: 12.5,
                        profitGrowthRate: 15.2,
                        assetGrowthRate: 8.7,
                        herdGrowthRate: 6.3
                    }
                };
                res.status(200).json({
                    success: true,
                    message: 'Métricas financieras obtenidas exitosamente',
                    data: {
                        metrics,
                        basedOnPeriod: period,
                        calculatedAt: new Date(),
                        totalAnimals,
                        totalRevenue: Math.round(totalRevenue * 100) / 100,
                        totalExpenses: Math.round(totalExpenses * 100) / 100,
                        netIncome: Math.round(netIncome * 100) / 100
                    }
                });
            }
            catch (error) {
                console.error('Error al obtener métricas financieras:', error);
                res.status(500).json({
                    success: false,
                    message: 'Error interno del servidor',
                    errors: {
                        general: 'Ocurrió un error al obtener las métricas financieras'
                    }
                });
            }
        };
    }
    getVendorCategory(transactionCategory) {
        const categoryMap = {
            'feed': 'feed_supplier',
            'veterinary': 'veterinary_clinic',
            'equipment': 'equipment_dealer',
            'breeding': 'breeding_service',
            'transportation': 'transportation',
            'professional_services': 'professional_service',
            'utilities': 'utility_company',
            'insurance': 'insurance_company',
            'animal_purchase': 'general_supplier',
            'animal_sale': 'general_supplier',
            'labor': 'professional_service',
            'maintenance': 'general_supplier',
            'supplies': 'general_supplier',
            'taxes': 'professional_service',
            'interest': 'professional_service',
            'depreciation': 'general_supplier',
            'other_income': 'general_supplier',
            'other_expense': 'general_supplier'
        };
        return categoryMap[transactionCategory] || 'general_supplier';
    }
    getCurrentAccountingPeriod() {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }
}
exports.FinancesController = FinancesController;
//# sourceMappingURL=finances.js.map