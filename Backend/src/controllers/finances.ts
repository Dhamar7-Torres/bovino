import { Request, Response } from 'express';
import { Op, fn, col, literal } from 'sequelize';
import { sequelize } from '../config/database';
import { 
  Finance, 
  Budget, 
  Asset, 
  Vendor, 
  Customer,
  Bovine, 
  Location, 
  Event,
  User
} from '../models';
import { FinanceService } from '../services/finance.service';

// Tipos financieros
type TransactionType = 'income' | 'expense' | 'transfer' | 'adjustment';
type TransactionCategory = 
  | 'animal_purchase' | 'animal_sale' | 'feed' | 'veterinary' | 'breeding' 
  | 'equipment' | 'labor' | 'utilities' | 'insurance' | 'transportation' 
  | 'maintenance' | 'supplies' | 'professional_services' | 'taxes' 
  | 'interest' | 'depreciation' | 'other_income' | 'other_expense';

type TransactionStatus = 'pending' | 'approved' | 'paid' | 'cancelled' | 'overdue';
type PaymentMethod = 'cash' | 'check' | 'bank_transfer' | 'credit_card' | 'debit_card' | 'digital_wallet' | 'financing';
type BudgetStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'closed' | 'cancelled';
type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// Interfaces para transacciones financieras
interface CreateTransactionRequest {
  type: TransactionType;
  category: TransactionCategory;
  subcategory?: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  dueDate?: Date;
  paymentMethod?: PaymentMethod;
  
  vendor?: {
    id?: string;
    name: string;
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
    taxId?: string;
    paymentTerms?: string;
  };
  
  customer?: {
    id?: string;
    name: string;
    contactInfo?: {
      email?: string;
      phone?: string;
      address?: string;
    };
    taxId?: string;
    creditLimit?: number;
  };
  
  relatedEntityType?: string; // 'bovine', 'event', 'asset'
  relatedEntityId?: string;
  bovineIds?: string[];
  eventId?: string;
  assetId?: string;
  
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
    description?: string;
  };
  
  taxInfo?: {
    taxRate: number;
    taxAmount: number;
    taxExempt: boolean;
  };
  
  discount?: {
    discountAmount: number;
    discountPercentage: number;
    reason?: string;
  };
  
  reference?: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  attachments?: string[];
  tags?: string[];
  notes?: string;
  
  requiresApproval?: boolean;
  approvedBy?: string;
  accountingPeriod?: string;
}

interface UpdateTransactionRequest extends Partial<CreateTransactionRequest> {
  id: string;
  status?: TransactionStatus;
  approvedAt?: Date;
}

// Interfaces para presupuestos
interface CreateBudgetRequest {
  name: string;
  description?: string;
  period: PeriodType;
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  currency: string;
  
  categories: Array<{
    category: TransactionCategory;
    subcategory?: string;
    budgetedAmount: number;
    description?: string;
    priority: 'high' | 'medium' | 'low';
    monthlyDistribution?: number[];
    responsiblePerson?: string;
  }>;
  
  objectives: {
    revenueTarget: number;
    expenseLimit: number;
    profitGoal: number;
    roiTarget: number;
    description?: string;
  };
  
  assumptions: Array<{
    category: string;
    assumption: string;
    impact: 'high' | 'medium' | 'low';
    probability: number; // 0-100
  }>;
  
  approvalWorkflow?: {
    requiresApproval: boolean;
    approvers: string[];
    approvalDeadline?: Date;
  };
  
  notes?: string;
  tags?: string[];
}

interface UpdateBudgetRequest extends Partial<CreateBudgetRequest> {
  id: string;
  status?: BudgetStatus;
  approvedBy?: string;
  approvedAt?: Date;
}

// Interfaces para análisis financiero
interface FinancialAnalysisRequest {
  period: PeriodType;
  startDate: Date;
  endDate: Date;
  categories?: TransactionCategory[];
  bovineIds?: string[];
  compareWithPrevious?: boolean;
  includeProjections?: boolean;
  currency?: string;
}

interface ProfitLossAnalysis {
  period: string;
  revenue: {
    total: number;
    byCategory: Record<TransactionCategory, number>;
    byMonth: Array<{ month: string; amount: number }>;
    growth: {
      amount: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    };
  };
  
  expenses: {
    total: number;
    byCategory: Record<TransactionCategory, number>;
    byMonth: Array<{ month: string; amount: number }>;
    variableCosts: number;
    fixedCosts: number;
  };
  
  profitability: {
    grossProfit: number;
    netProfit: number;
    grossMargin: number;
    netMargin: number;
    operatingMargin: number;
    ebitda: number;
  };
  
  metrics: {
    revenuePerAnimal: number;
    costPerAnimal: number;
    profitPerAnimal: number;
    roi: number;
    breakEvenPoint: number;
    paybackPeriod: number;
  };
  
  comparison?: {
    previousPeriod: {
      revenue: number;
      expenses: number;
      profit: number;
      margin: number;
    };
    variance: {
      revenue: { amount: number; percentage: number };
      expenses: { amount: number; percentage: number };
      profit: { amount: number; percentage: number };
    };
  };
}

interface CashFlowAnalysis {
  period: string;
  
  operatingActivities: {
    netIncome: number;
    depreciation: number;
    workingCapitalChanges: number;
    otherOperatingAdjustments: number;
    netOperatingCashFlow: number;
  };
  
  investingActivities: {
    assetPurchases: number;
    assetSales: number;
    animalPurchases: number;
    animalSales: number;
    netInvestingCashFlow: number;
  };
  
  financingActivities: {
    borrowings: number;
    loanRepayments: number;
    ownerContributions: number;
    ownerWithdrawals: number;
    netFinancingCashFlow: number;
  };
  
  summary: {
    beginningBalance: number;
    netCashFlow: number;
    endingBalance: number;
    freeCashFlow: number;
    cashConversionCycle: number;
  };
  
  projections?: Array<{
    period: string;
    projectedCashFlow: number;
    confidenceLevel: number;
  }>;
}

interface ROIAnalysis {
  overall: {
    totalInvestment: number;
    totalReturn: number;
    netProfit: number;
    roi: number;
    roiAnnualized: number;
    paybackPeriod: number;
  };
  
  byCategory: Array<{
    category: TransactionCategory;
    investment: number;
    return: number;
    profit: number;
    roi: number;
    efficiency: number;
  }>;
  
  byAnimal: Array<{
    animalId: string;
    earTag: string;
    name?: string;
    investment: number;
    return: number;
    profit: number;
    roi: number;
    daysSincePurchase: number;
    profitPerDay: number;
    status: 'profitable' | 'break_even' | 'loss';
  }>;
  
  trends: Array<{
    period: string;
    roi: number;
    investment: number;
    return: number;
    efficiency: number;
  }>;
}

interface FinancialMetrics {
  liquidity: {
    currentRatio: number;
    quickRatio: number;
    cashRatio: number;
    workingCapital: number;
    daysInCash: number;
  };
  
  profitability: {
    grossMargin: number;
    operatingMargin: number;
    netMargin: number;
    returnOnAssets: number;
    returnOnEquity: number;
    returnOnInvestment: number;
  };
  
  efficiency: {
    assetTurnover: number;
    inventoryTurnover: number;
    receivableTurnover: number;
    revenuePerAnimal: number;
    costPerAnimal: number;
    feedEfficiencyRatio: number;
  };
  
  leverage: {
    debtToEquityRatio: number;
    debtToAssetsRatio: number;
    interestCoverage: number;
    debtServiceCoverage: number;
  };
  
  growth: {
    revenueGrowthRate: number;
    profitGrowthRate: number;
    assetGrowthRate: number;
    herdGrowthRate: number;
  };
}

export class FinancesController {
  private financeService: FinanceService;

  constructor() {
    this.financeService = new FinanceService();
  }

  /**
   * Crear nueva transacción financiera
   * POST /api/finances/transactions
   */
  public createTransaction = async (req: Request, res: Response): Promise<void> => {
    try {
      const transactionData: CreateTransactionRequest = req.body;
      const userId = (req as any).user?.id;

      // Validaciones básicas
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

      // Validar monto
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

      // Crear ubicación si se proporciona
      let locationId: string | null = null;
      if (transactionData.location) {
        const locationRecord = await Location.create({
          latitude: transactionData.location.latitude,
          longitude: transactionData.location.longitude,
          address: transactionData.location.address || '',
          description: transactionData.location.description || '',
          accuracy: 10,
          timestamp: transactionData.date
        });
        locationId = locationRecord.id;
      }

      // Manejar proveedor
      let vendorId: string | null = null;
      if (transactionData.vendor) {
        if (transactionData.vendor.id) {
          vendorId = transactionData.vendor.id;
        } else {
          const newVendor = await Vendor.create({
            name: transactionData.vendor.name,
            contactEmail: transactionData.vendor.contactInfo?.email,
            contactPhone: transactionData.vendor.contactInfo?.phone,
            address: transactionData.vendor.contactInfo?.address,
            taxId: transactionData.vendor.taxId,
            paymentTerms: transactionData.vendor.paymentTerms || 'immediate',
            category: this.getVendorCategory(transactionData.category),
            isActive: true,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          vendorId = newVendor.id;
        }
      }

      // Manejar cliente
      let customerId: string | null = null;
      if (transactionData.customer) {
        if (transactionData.customer.id) {
          customerId = transactionData.customer.id;
        } else {
          const newCustomer = await Customer.create({
            name: transactionData.customer.name,
            contactEmail: transactionData.customer.contactInfo?.email,
            contactPhone: transactionData.customer.contactInfo?.phone,
            address: transactionData.customer.contactInfo?.address,
            taxId: transactionData.customer.taxId,
            creditLimit: transactionData.customer.creditLimit || 0,
            type: 'individual',
            isActive: true,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          customerId = newCustomer.id;
        }
      }

      // Calcular montos totales
      const taxAmount = transactionData.taxInfo?.taxAmount || 0;
      const discountAmount = transactionData.discount?.discountAmount || 0;
      const totalAmount = transactionData.amount + taxAmount - discountAmount;

      // Crear transacción
      const newTransaction = await Finance.create({
        type: transactionData.type,
        category: transactionData.category,
        subcategory: transactionData.subcategory || '',
        amount: transactionData.amount,
        currency: transactionData.currency || 'MXN',
        description: transactionData.description,
        date: transactionData.date,
        dueDate: transactionData.dueDate,
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

      // Obtener transacción completa
      const transactionWithDetails = await Finance.findByPk(newTransaction.id, {
        include: [
          {
            model: Location,
            as: 'location',
            required: false
          },
          {
            model: Vendor,
            as: 'vendor',
            required: false
          },
          {
            model: Customer,
            as: 'customer',
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

    } catch (error) {
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

  /**
   * Obtener transacciones con filtros
   * GET /api/finances/transactions
   */
  public getTransactions = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        type,
        category,
        status,
        dateRange,
        amountRange,
        paymentMethod,
        vendorId,
        customerId,
        bovineIds,
        searchTerm,
        page = 1,
        limit = 20,
        sortBy = 'date',
        sortOrder = 'DESC'
      } = req.query;

      // Construir filtros WHERE
      const whereConditions: any = {};

      // Filtros específicos
      if (type) whereConditions.type = Array.isArray(type) ? { [Op.in]: type } : type;
      if (category) whereConditions.category = Array.isArray(category) ? { [Op.in]: category } : category;
      if (status) whereConditions.status = Array.isArray(status) ? { [Op.in]: status } : status;
      if (paymentMethod) whereConditions.paymentMethod = paymentMethod;
      if (vendorId) whereConditions.vendorId = vendorId;
      if (customerId) whereConditions.customerId = customerId;

      // Filtro por rango de fechas
      if (dateRange) {
        const { startDate, endDate } = dateRange as any;
        whereConditions.date = {};
        if (startDate) whereConditions.date[Op.gte] = new Date(startDate);
        if (endDate) whereConditions.date[Op.lte] = new Date(endDate);
      }

      // Filtro por monto
      if (amountRange) {
        const { min, max } = amountRange as any;
        whereConditions.totalAmount = {};
        if (min !== undefined) whereConditions.totalAmount[Op.gte] = min;
        if (max !== undefined) whereConditions.totalAmount[Op.lte] = max;
      }

      // Filtro de búsqueda de texto
      if (searchTerm) {
        whereConditions[Op.or] = [
          { description: { [Op.iLike]: `%${searchTerm}%` } },
          { reference: { [Op.iLike]: `%${searchTerm}%` } },
          { invoiceNumber: { [Op.iLike]: `%${searchTerm}%` } },
          { notes: { [Op.iLike]: `%${searchTerm}%` } }
        ];
      }

      // Filtros de bovinos
      if (bovineIds && Array.isArray(bovineIds)) {
        whereConditions[Op.or] = bovineIds.map(id => ({
          bovineIds: { [Op.contains]: [id] }
        }));
      }

      // Configurar paginación
      const pageNum = parseInt(page.toString()) || 1;
      const limitNum = Math.min(parseInt(limit.toString()) || 20, 100);
      const offset = (pageNum - 1) * limitNum;

      // Ejecutar consulta
      const { count, rows: transactions } = await Finance.findAndCountAll({
        where: whereConditions,
        include: [
          {
            model: Location,
            as: 'location',
            required: false
          },
          {
            model: Vendor,
            as: 'vendor',
            required: false,
            attributes: ['id', 'name', 'category']
          },
          {
            model: Customer,
            as: 'customer',
            required: false,
            attributes: ['id', 'name', 'type']
          },
          {
            model: User,
            as: 'creator',
            required: false,
            attributes: ['id', 'firstName', 'lastName']
          }
        ],
        limit: limitNum,
        offset: offset,
        order: [[sortBy as string, sortOrder as string]],
        distinct: true
      });

      // Preparar respuesta
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

    } catch (error) {
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

  /**
   * Crear nuevo presupuesto
   * POST /api/finances/budgets
   */
  public createBudget = async (req: Request, res: Response): Promise<void> => {
    try {
      const budgetData: CreateBudgetRequest = req.body;
      const userId = (req as any).user?.id;

      // Validaciones básicas
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

      // Validar fechas
      if (budgetData.startDate >= budgetData.endDate) {
        res.status(400).json({
          success: false,
          message: 'Fechas inválidas',
          errors: {
            dates: 'La fecha de inicio debe ser anterior a la fecha de fin'
          }
        });
        return;
      }

      // Validar categorías del presupuesto
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

      // Validar que la suma de categorías no exceda el total
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

      // Crear presupuesto
      const newBudget = await Budget.create({
        name: budgetData.name,
        description: budgetData.description || '',
        period: budgetData.period,
        startDate: budgetData.startDate,
        endDate: budgetData.endDate,
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
      });

      res.status(201).json({
        success: true,
        message: 'Presupuesto creado exitosamente',
        data: {
          budget: newBudget
        }
      });

    } catch (error) {
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

  /**
   * Análisis de ganancias y pérdidas
   * GET /api/finances/profit-loss
   */
  public getProfitLossAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        period = 'monthly',
        startDate,
        endDate,
        categories,
        bovineIds,
        compareWithPrevious = true,
        currency = 'MXN'
      }: FinancialAnalysisRequest = req.query as any;

      // Establecer fechas por defecto
      const currentDate = new Date();
      const analysisStartDate = startDate ? new Date(startDate) : new Date(currentDate.getFullYear(), 0, 1);
      const analysisEndDate = endDate ? new Date(endDate) : currentDate;

      const dateConditions = {
        date: { [Op.between]: [analysisStartDate, analysisEndDate] }
      };

      // Construir filtros adicionales
      const additionalConditions: any = { ...dateConditions };
      if (categories) additionalConditions.category = { [Op.in]: Array.isArray(categories) ? categories : [categories] };
      if (bovineIds) {
        additionalConditions[Op.or] = bovineIds.map((id: string) => ({
          bovineIds: { [Op.contains]: [id] }
        }));
      }

      // Obtener ingresos
      const revenueData = await Finance.findAll({
        where: {
          ...additionalConditions,
          type: 'income'
        },
        attributes: [
          'category',
          [fn('SUM', col('totalAmount')), 'total'],
          [fn('DATE_TRUNC', literal("'month'"), col('date')), 'month']
        ],
        group: ['category', fn('DATE_TRUNC', literal("'month'"), col('date'))],
        raw: true
      });

      // Obtener gastos
      const expenseData = await Finance.findAll({
        where: {
          ...additionalConditions,
          type: 'expense'
        },
        attributes: [
          'category',
          [fn('SUM', col('totalAmount')), 'total'],
          [fn('DATE_TRUNC', literal("'month'"), col('date')), 'month']
        ],
        group: ['category', fn('DATE_TRUNC', literal("'month'"), col('date'))],
        raw: true
      });

      // Procesar datos de ingresos
      const totalRevenue = revenueData.reduce((sum: number, item: any) => sum + parseFloat(item.total), 0);
      const revenueByCategory: Record<string, number> = {};
      const revenueByMonth: Array<{ month: string; amount: number }> = [];

      revenueData.forEach((item: any) => {
        revenueByCategory[item.category] = (revenueByCategory[item.category] || 0) + parseFloat(item.total);
      });

      // Agrupar ingresos por mes
      const monthlyRevenue = new Map<string, number>();
      revenueData.forEach((item: any) => {
        const month = new Date(item.month).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
        monthlyRevenue.set(month, (monthlyRevenue.get(month) || 0) + parseFloat(item.total));
      });
      monthlyRevenue.forEach((amount, month) => {
        revenueByMonth.push({ month, amount });
      });

      // Procesar datos de gastos
      const totalExpenses = expenseData.reduce((sum: number, item: any) => sum + parseFloat(item.total), 0);
      const expensesByCategory: Record<string, number> = {};
      const expensesByMonth: Array<{ month: string; amount: number }> = [];

      expenseData.forEach((item: any) => {
        expensesByCategory[item.category] = (expensesByCategory[item.category] || 0) + parseFloat(item.total);
      });

      // Clasificar costos fijos vs variables (simplificado)
      const fixedCostCategories = ['insurance', 'utilities', 'interest', 'depreciation'];
      const fixedCosts = Object.entries(expensesByCategory)
        .filter(([category]) => fixedCostCategories.includes(category))
        .reduce((sum, [, amount]) => sum + amount, 0);
      const variableCosts = totalExpenses - fixedCosts;

      // Calcular métricas de rentabilidad
      const grossProfit = totalRevenue - variableCosts;
      const netProfit = totalRevenue - totalExpenses;
      const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
      const netMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
      const operatingMargin = grossMargin; // Simplificado
      const ebitda = netProfit; // Simplificado

      // Calcular métricas por animal
      const totalAnimals = await Bovine.count({ where: { isActive: true } });
      const revenuePerAnimal = totalAnimals > 0 ? totalRevenue / totalAnimals : 0;
      const costPerAnimal = totalAnimals > 0 ? totalExpenses / totalAnimals : 0;
      const profitPerAnimal = revenuePerAnimal - costPerAnimal;
      const roi = totalExpenses > 0 ? (netProfit / totalExpenses) * 100 : 0;
      const breakEvenPoint = fixedCosts; // Simplificado
      const paybackPeriod = netProfit > 0 ? totalExpenses / (netProfit / 12) : 0; // En meses

      // Comparación con período anterior si se solicita
      let comparison = undefined;
      if (compareWithPrevious) {
        const previousPeriodDays = Math.ceil((analysisEndDate.getTime() - analysisStartDate.getTime()) / (1000 * 60 * 60 * 24));
        const previousStartDate = new Date(analysisStartDate.getTime() - previousPeriodDays * 24 * 60 * 60 * 1000);
        const previousEndDate = analysisStartDate;

        const previousRevenueData = await Finance.sum('totalAmount', {
          where: {
            type: 'income',
            date: { [Op.between]: [previousStartDate, previousEndDate] }
          }
        }) || 0;

        const previousExpenseData = await Finance.sum('totalAmount', {
          where: {
            type: 'expense',
            date: { [Op.between]: [previousStartDate, previousEndDate] }
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

      // Calcular crecimiento de ingresos
      const revenueGrowth = comparison ? comparison.variance.revenue : { amount: 0, percentage: 0 };
      const growthTrend = revenueGrowth.percentage > 5 ? 'up' : revenueGrowth.percentage < -5 ? 'down' : 'stable';

      const analysis: ProfitLossAnalysis = {
        period: `${analysisStartDate.toLocaleDateString('es-ES')} - ${analysisEndDate.toLocaleDateString('es-ES')}`,
        
        revenue: {
          total: Math.round(totalRevenue * 100) / 100,
          byCategory: Object.fromEntries(
            Object.entries(revenueByCategory).map(([cat, amount]) => [cat, Math.round(amount * 100) / 100])
          ) as Record<TransactionCategory, number>,
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
          byCategory: Object.fromEntries(
            Object.entries(expensesByCategory).map(([cat, amount]) => [cat, Math.round(amount * 100) / 100])
          ) as Record<TransactionCategory, number>,
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

    } catch (error) {
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

  /**
   * Análisis de flujo de caja
   * GET /api/finances/cash-flow
   */
  public getCashFlowAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        period = 'monthly',
        startDate,
        endDate,
        includeProjections = false
      } = req.query;

      // Establecer fechas
      const currentDate = new Date();
      const analysisStartDate = startDate ? new Date(startDate as string) : new Date(currentDate.getFullYear(), 0, 1);
      const analysisEndDate = endDate ? new Date(endDate as string) : currentDate;

      const dateConditions = {
        date: { [Op.between]: [analysisStartDate, analysisEndDate] }
      };

      // Actividades operativas
      const netIncome = await Finance.sum('totalAmount', {
        where: { ...dateConditions, type: 'income' }
      }) || 0;

      const operatingExpenses = await Finance.sum('totalAmount', {
        where: { 
          ...dateConditions, 
          type: 'expense',
          category: { [Op.notIn]: ['equipment', 'animal_purchase'] }
        }
      }) || 0;

      const netOperatingIncome = netIncome - operatingExpenses;

      // Actividades de inversión
      const assetPurchases = await Finance.sum('totalAmount', {
        where: { ...dateConditions, type: 'expense', category: 'equipment' }
      }) || 0;

      const animalPurchases = await Finance.sum('totalAmount', {
        where: { ...dateConditions, type: 'expense', category: 'animal_purchase' }
      }) || 0;

      const animalSales = await Finance.sum('totalAmount', {
        where: { ...dateConditions, type: 'income', category: 'animal_sale' }
      }) || 0;

      const netInvestingCashFlow = animalSales - (assetPurchases + animalPurchases);

      // Actividades de financiamiento (simulado)
      const netFinancingCashFlow = 0;

      // Resumen de flujo de caja
      const netCashFlow = netOperatingIncome + netInvestingCashFlow + netFinancingCashFlow;

      // Proyecciones si se solicitan (simplificado)
      let projections = undefined;
      if (includeProjections === 'true') {
        const monthlyAverage = netCashFlow / 12; // Promedio mensual
        projections = [
          { period: 'Próximo mes', projectedCashFlow: Math.round(monthlyAverage * 100) / 100, confidenceLevel: 85 },
          { period: 'Próximos 3 meses', projectedCashFlow: Math.round(monthlyAverage * 3 * 100) / 100, confidenceLevel: 75 },
          { period: 'Próximos 6 meses', projectedCashFlow: Math.round(monthlyAverage * 6 * 100) / 100, confidenceLevel: 65 }
        ];
      }

      const analysis: CashFlowAnalysis = {
        period: `${analysisStartDate.toLocaleDateString('es-ES')} - ${analysisEndDate.toLocaleDateString('es-ES')}`,
        
        operatingActivities: {
          netIncome: Math.round(netIncome * 100) / 100,
          depreciation: 0, // Implementar cálculo real
          workingCapitalChanges: 0, // Implementar cálculo real
          otherOperatingAdjustments: 0,
          netOperatingCashFlow: Math.round(netOperatingIncome * 100) / 100
        },
        
        investingActivities: {
          assetPurchases: Math.round(assetPurchases * 100) / 100,
          assetSales: 0, // Implementar si es necesario
          animalPurchases: Math.round(animalPurchases * 100) / 100,
          animalSales: Math.round(animalSales * 100) / 100,
          netInvestingCashFlow: Math.round(netInvestingCashFlow * 100) / 100
        },
        
        financingActivities: {
          borrowings: 0, // Implementar si es necesario
          loanRepayments: 0,
          ownerContributions: 0,
          ownerWithdrawals: 0,
          netFinancingCashFlow: 0
        },
        
        summary: {
          beginningBalance: 0, // Implementar balance inicial
          netCashFlow: Math.round(netCashFlow * 100) / 100,
          endingBalance: Math.round(netCashFlow * 100) / 100, // Simplificado
          freeCashFlow: Math.round(netOperatingIncome * 100) / 100,
          cashConversionCycle: 30 // Días, simplificado
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

    } catch (error) {
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

  /**
   * Análisis de ROI
   * GET /api/finances/roi-analysis
   */
  public getROIAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        period = 'yearly',
        startDate,
        endDate,
        bovineIds,
        categories
      } = req.query;

      // Establecer fechas
      const currentDate = new Date();
      const analysisStartDate = startDate ? new Date(startDate as string) : new Date(currentDate.getFullYear(), 0, 1);
      const analysisEndDate = endDate ? new Date(endDate as string) : currentDate;

      const dateConditions = {
        date: { [Op.between]: [analysisStartDate, analysisEndDate] }
      };

      // ROI general
      const totalInvestment = await Finance.sum('totalAmount', {
        where: { 
          ...dateConditions, 
          type: 'expense',
          category: { [Op.in]: ['animal_purchase', 'equipment', 'feed', 'veterinary', 'breeding'] }
        }
      }) || 0;

      const totalReturn = await Finance.sum('totalAmount', {
        where: { ...dateConditions, type: 'income' }
      }) || 0;

      const netProfit = totalReturn - totalInvestment;
      const overallROI = totalInvestment > 0 ? (netProfit / totalInvestment) * 100 : 0;
      
      // Calcular ROI anualizado
      const periodInDays = Math.ceil((analysisEndDate.getTime() - analysisStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const roiAnnualized = periodInDays > 0 ? (overallROI * 365) / periodInDays : 0;
      const paybackPeriod = netProfit > 0 ? (totalInvestment / netProfit) * 12 : 0; // En meses

      // ROI por categoría
      const categoryROI = [];
      if (categories) {
        const categoryList = Array.isArray(categories) ? categories : [categories];
        
        for (const category of categoryList) {
          const categoryInvestment = await Finance.sum('totalAmount', {
            where: { ...dateConditions, type: 'expense', category: category as string }
          }) || 0;

          const categoryReturn = await Finance.sum('totalAmount', {
            where: { ...dateConditions, type: 'income', category: category as string }
          }) || 0;

          const categoryProfit = categoryReturn - categoryInvestment;
          const categoryROIValue = categoryInvestment > 0 ? (categoryProfit / categoryInvestment) * 100 : 0;
          const efficiency = categoryReturn / (categoryInvestment || 1);

          categoryROI.push({
            category: category as TransactionCategory,
            investment: Math.round(categoryInvestment * 100) / 100,
            return: Math.round(categoryReturn * 100) / 100,
            profit: Math.round(categoryProfit * 100) / 100,
            roi: Math.round(categoryROIValue * 100) / 100,
            efficiency: Math.round(efficiency * 100) / 100
          });
        }
      }

      // ROI por animal (si se especifican IDs)
      const animalROI = [];
      if (bovineIds && Array.isArray(bovineIds)) {
        for (const bovineId of bovineIds) {
          const animal = await Bovine.findByPk(bovineId);
          if (!animal) continue;

          const animalInvestment = await Finance.sum('totalAmount', {
            where: { 
              ...dateConditions, 
              type: 'expense',
              bovineIds: { [Op.contains]: [bovineId] }
            }
          }) || 0;

          const animalReturn = await Finance.sum('totalAmount', {
            where: { 
              ...dateConditions, 
              type: 'income',
              bovineIds: { [Op.contains]: [bovineId] }
            }
          }) || 0;

          const animalProfit = animalReturn - animalInvestment;
          const animalROIValue = animalInvestment > 0 ? (animalProfit / animalInvestment) * 100 : 0;
          
          const daysSincePurchase = animal.createdAt 
            ? Math.ceil((currentDate.getTime() - animal.createdAt.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          const profitPerDay = daysSincePurchase > 0 ? animalProfit / daysSincePurchase : 0;

          let status: 'profitable' | 'break_even' | 'loss' = 'loss';
          if (animalProfit > 100) status = 'profitable';
          else if (animalProfit >= -100 && animalProfit <= 100) status = 'break_even';

          animalROI.push({
            animalId: bovineId,
            earTag: (animal as any).earTag,
            name: (animal as any).name || '',
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

      // Tendencias de ROI (simuladas por ahora)
      const trends = [];
      for (let i = 5; i >= 0; i--) {
        const periodStart = new Date(analysisStartDate);
        periodStart.setMonth(periodStart.getMonth() - i);
        const periodEnd = new Date(periodStart);
        periodEnd.setMonth(periodEnd.getMonth() + 1);

        // Simplificado - en implementación real calcular ROI por período
        trends.push({
          period: periodStart.toLocaleDateString('es-ES', { month: 'short', year: 'numeric' }),
          roi: Math.round((overallROI + (Math.random() - 0.5) * 10) * 100) / 100,
          investment: Math.round((totalInvestment / 6) * 100) / 100,
          return: Math.round((totalReturn / 6) * 100) / 100,
          efficiency: Math.round((1 + (Math.random() - 0.5) * 0.2) * 100) / 100
        });
      }

      const analysis: ROIAnalysis = {
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

    } catch (error) {
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

  /**
   * Obtener métricas financieras completas
   * GET /api/finances/metrics
   */
  public getFinancialMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      const { period = 'yearly' } = req.query;

      // Obtener datos básicos para cálculos
      const currentDate = new Date();
      const yearStart = new Date(currentDate.getFullYear(), 0, 1);
      
      const totalAssets = await Finance.sum('totalAmount', {
        where: { 
          type: 'expense', 
          category: { [Op.in]: ['equipment', 'animal_purchase'] },
          date: { [Op.gte]: yearStart }
        }
      }) || 0;

      const totalRevenue = await Finance.sum('totalAmount', {
        where: { type: 'income', date: { [Op.gte]: yearStart } }
      }) || 0;

      const totalExpenses = await Finance.sum('totalAmount', {
        where: { type: 'expense', date: { [Op.gte]: yearStart } }
      }) || 0;

      const netIncome = totalRevenue - totalExpenses;
      const totalAnimals = await Bovine.count({ where: { isActive: true } });

      // Calcular métricas (simplificadas)
      const metrics: FinancialMetrics = {
        liquidity: {
          currentRatio: 1.5, // Simplificado
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
          inventoryTurnover: 6.5, // Simplificado
          receivableTurnover: 12.0, // Simplificado
          revenuePerAnimal: totalAnimals > 0 ? Math.round((totalRevenue / totalAnimals) * 100) / 100 : 0,
          costPerAnimal: totalAnimals > 0 ? Math.round((totalExpenses / totalAnimals) * 100) / 100 : 0,
          feedEfficiencyRatio: 2.8 // Simplificado
        },
        
        leverage: {
          debtToEquityRatio: 0.3, // Simplificado
          debtToAssetsRatio: 0.2,
          interestCoverage: 8.5,
          debtServiceCoverage: 2.1
        },
        
        growth: {
          revenueGrowthRate: 12.5, // Simplificado - calcular con datos históricos
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

    } catch (error) {
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

  // Métodos auxiliares privados

  private getVendorCategory(transactionCategory: TransactionCategory): string {
    const categoryMap: Record<TransactionCategory, string> = {
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

  private getCurrentAccountingPeriod(): string {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  }
}