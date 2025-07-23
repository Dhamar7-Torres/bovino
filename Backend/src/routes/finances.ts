import { Router, Request, Response } from 'express';
import { FinancesController } from '../controllers/finances.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rateLimit.middleware';
import { roleMiddleware } from '../middleware/role.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { accountingMiddleware } from '../middleware/accounting.middleware';
import { taxCalculationMiddleware } from '../middleware/taxCalculation.middleware';
import { auditTrailMiddleware } from '../middleware/auditTrail.middleware';
import { budgetControlMiddleware } from '../middleware/budgetControl.middleware';
import { exchangeRateMiddleware } from '../middleware/exchangeRate.middleware';
import {
  createTransactionValidationRules,
  updateTransactionValidationRules,
  transactionSearchValidationRules,
  financialReportValidationRules,
  budgetValidationRules,
  invoiceValidationRules,
  paymentValidationRules,
  assetValidationRules,
  depreciationValidationRules,
  cashFlowValidationRules,
  profitLossValidationRules,
  roiAnalysisValidationRules,
  costCenterValidationRules,
  bankReconciliationValidationRules,
  taxReportValidationRules
} from '../validators/finances.validators';

// Crear instancia del router
const router = Router();

// Crear instancia del controlador de finanzas
const financesController = new FinancesController();

// ============================================================================
// MIDDLEWARE GLOBAL PARA TODAS LAS RUTAS FINANCIERAS
// ============================================================================

// Todas las rutas financieras requieren autenticación
router.use(authMiddleware);

// Middleware de auditoría para todas las transacciones financieras
router.use(auditTrailMiddleware);

// ============================================================================
// TRANSACCIONES FINANCIERAS - CRUD BÁSICO
// ============================================================================

/**
 * @route   GET /finances/transactions
 * @desc    Obtener transacciones financieras con filtros avanzados
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?page=1&limit=50&type=expense&category=veterinary&status=paid&dateFrom=2025-01-01&dateTo=2025-07-31&bovineId=123&vendorId=456&sortBy=date&sortOrder=desc&includeAttachments=true
 */
router.get(
  '/transactions',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 consultas por usuario cada 5 minutos
    message: 'Too many transaction requests'
  }),
  transactionSearchValidationRules(),
  validationMiddleware,
  financesController.getTransactions
);

/**
 * @route   POST /finances/transactions
 * @desc    Crear nueva transacción financiera
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT, WORKER)
 * @body    { type: string, category: string, amount: number, description: string, date: string, bovineIds?: string[], vendorId?: string, paymentMethod: string, reference?: string }
 */
router.post(
  '/transactions',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 transacciones por usuario cada 10 minutos
    message: 'Too many transaction creations'
  }),
  uploadMiddleware.array('receipts', 10), // recibos y facturas
  accountingMiddleware, // aplicar reglas contables automáticamente
  taxCalculationMiddleware, // calcular impuestos aplicables
  budgetControlMiddleware, // verificar límites presupuestarios
  exchangeRateMiddleware, // aplicar tipos de cambio si es necesario
  createTransactionValidationRules(),
  validationMiddleware,
  financesController.createTransaction
);

/**
 * @route   GET /finances/transactions/:id
 * @desc    Obtener detalles específicos de una transacción
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID de la transacción)
 * @query   ?includeAttachments=true&includeAuditTrail=true&includeRelatedTransactions=true
 */
router.get(
  '/transactions/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 200, // máximo 200 consultas por usuario cada 5 minutos
    message: 'Too many transaction detail requests'
  }),
  financesController.getTransactionById
);

/**
 * @route   PUT /finances/transactions/:id
 * @desc    Actualizar transacción existente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID de la transacción)
 * @body    Campos a actualizar de la transacción
 */
router.put(
  '/transactions/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 actualizaciones por usuario cada 15 minutos
    message: 'Too many transaction update attempts'
  }),
  uploadMiddleware.array('receipts', 10),
  accountingMiddleware,
  taxCalculationMiddleware,
  updateTransactionValidationRules(),
  validationMiddleware,
  financesController.updateTransaction
);

/**
 * @route   DELETE /finances/transactions/:id
 * @desc    Eliminar transacción (soft delete con justificación)
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @params  id: string (UUID de la transacción)
 * @body    { reason: string, approvedBy: string, requiresAudit: boolean }
 */
router.delete(
  '/transactions/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 eliminaciones por usuario cada 30 minutos
    message: 'Too many transaction deletion attempts'
  }),
  financesController.deleteTransaction
);

// ============================================================================
// INGRESOS Y VENTAS
// ============================================================================

/**
 * @route   GET /finances/income
 * @desc    Obtener resumen de ingresos por categorías
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?period=month&groupBy=category&includeProjections=true&compareWithPrevious=true
 */
router.get(
  '/income',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 40, // máximo 40 consultas de ingresos por usuario cada 10 minutos
    message: 'Too many income requests'
  }),
  financesController.getIncomeOverview
);

/**
 * @route   POST /finances/income/sale
 * @desc    Registrar venta de ganado o productos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { bovineIds?: string[], saleType: string, buyer: object, unitPrice: number, totalAmount: number, saleDate: string, paymentTerms: object, deliveryInfo: object }
 */
router.post(
  '/income/sale',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 ventas por usuario cada 15 minutos
    message: 'Too many sale recordings'
  }),
  uploadMiddleware.array('saleDocuments', 15), // contratos, facturas, etc.
  accountingMiddleware,
  taxCalculationMiddleware,
  financesController.recordSale
);

/**
 * @route   GET /finances/income/projections
 * @desc    Obtener proyecciones de ingresos basadas en tendencias
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?horizon=12m&includeSeasonality=true&confidenceLevel=0.95&scenarios=optimistic,realistic,pessimistic
 */
router.get(
  '/income/projections',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 proyecciones por usuario cada 20 minutos
    message: 'Too many projection requests'
  }),
  financesController.getIncomeProjections
);

/**
 * @route   GET /finances/income/by-animal
 * @desc    Análisis de ingresos por animal individual
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?includeOperatingCosts=true&includeProfitability=true&period=lifetime&sortBy=roi
 */
router.get(
  '/income/by-animal',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 análisis por animal cada 15 minutos
    message: 'Too many animal income analysis requests'
  }),
  financesController.getIncomeByAnimal
);

// ============================================================================
// GASTOS Y COMPRAS
// ============================================================================

/**
 * @route   GET /finances/expenses
 * @desc    Obtener resumen de gastos por categorías
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?period=month&category=all&includeRecurring=true&includeBudgetComparison=true&sortBy=amount
 */
router.get(
  '/expenses',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 40, // máximo 40 consultas de gastos por usuario cada 10 minutos
    message: 'Too many expense requests'
  }),
  financesController.getExpenseOverview
);

/**
 * @route   POST /finances/expenses/purchase
 * @desc    Registrar compra de ganado, alimentos, equipos, etc.
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT, WORKER)
 * @body    { category: string, items: array, vendor: object, totalAmount: number, purchaseDate: string, paymentMethod: string, deliveryDate?: string, warrantyInfo?: object }
 */
router.post(
  '/expenses/purchase',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT', 'WORKER']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 compras por usuario cada 15 minutos
    message: 'Too many purchase recordings'
  }),
  uploadMiddleware.array('purchaseDocuments', 15),
  accountingMiddleware,
  budgetControlMiddleware,
  financesController.recordPurchase
);

/**
 * @route   GET /finances/expenses/recurring
 * @desc    Gestión de gastos recurrentes (alimentación, servicios, etc.)
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?status=active&category=all&includeUpcoming=true&daysAhead=30
 */
router.get(
  '/expenses/recurring',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 consultas de gastos recurrentes cada 10 minutos
    message: 'Too many recurring expense requests'
  }),
  financesController.getRecurringExpenses
);

/**
 * @route   POST /finances/expenses/recurring
 * @desc    Crear gasto recurrente automatizado
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { category: string, amount: number, frequency: string, startDate: string, endDate?: string, vendor: object, autoProcess: boolean, alertDays: number }
 */
router.post(
  '/expenses/recurring',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 10, // máximo 10 gastos recurrentes por usuario cada 20 minutos
    message: 'Too many recurring expense creations'
  }),
  financesController.createRecurringExpense
);

/**
 * @route   GET /finances/expenses/analysis
 * @desc    Análisis detallado de patrones de gastos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?analysisType=variance&period=quarter&includeRecommendations=true&compareWithBudget=true
 */
router.get(
  '/expenses/analysis',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 análisis por usuario cada 20 minutos
    message: 'Too many expense analysis requests'
  }),
  financesController.analyzeExpensePatterns
);

// ============================================================================
// FLUJO DE CAJA (CASH FLOW)
// ============================================================================

/**
 * @route   GET /finances/cashflow
 * @desc    Obtener estado actual del flujo de caja
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?period=month&includeProjections=true&includeOperatingActivities=true&includeInvestingActivities=true&includeFinancingActivities=true
 */
router.get(
  '/cashflow',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 consultas de flujo de caja cada 10 minutos
    message: 'Too many cashflow requests'
  }),
  cashFlowValidationRules(),
  validationMiddleware,
  financesController.getCashFlow
);

/**
 * @route   POST /finances/cashflow/projection
 * @desc    Generar proyección de flujo de caja
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { projectionPeriod: string, scenarios: string[], includeSeasonality: boolean, assumptions: object, sensitivityAnalysis: boolean }
 */
router.post(
  '/cashflow/projection',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 proyecciones por usuario cada 30 minutos
    message: 'Too many cashflow projections'
  }),
  financesController.generateCashFlowProjection
);

/**
 * @route   GET /finances/cashflow/alerts
 * @desc    Obtener alertas de flujo de caja (liquidez baja, etc.)
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?severity=all&includeRecommendations=true&lookaheadDays=30
 */
router.get(
  '/cashflow/alerts',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 50, // máximo 50 consultas de alertas cada 5 minutos
    message: 'Too many cashflow alert requests'
  }),
  financesController.getCashFlowAlerts
);

/**
 * @route   POST /finances/cashflow/optimize
 * @desc    Optimizar flujo de caja con recomendaciones automáticas
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { optimizationGoals: string[], constraints: object, timeHorizon: string, riskTolerance: string }
 */
router.post(
  '/cashflow/optimize',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 8, // máximo 8 optimizaciones por usuario cada 30 minutos
    message: 'Too many cashflow optimizations'
  }),
  financesController.optimizeCashFlow
);

// ============================================================================
// ESTADO DE RESULTADOS (PROFIT & LOSS)
// ============================================================================

/**
 * @route   GET /finances/profit-loss
 * @desc    Generar estado de resultados (P&L)
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?period=quarter&includeComparisons=true&includeMargins=true&includeSegmentation=true&format=detailed
 */
router.get(
  '/profit-loss',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 consultas P&L por usuario cada 15 minutos
    message: 'Too many profit loss requests'
  }),
  profitLossValidationRules(),
  validationMiddleware,
  financesController.getProfitLoss
);

/**
 * @route   GET /finances/profit-loss/by-segment
 * @desc    P&L segmentado por tipo de ganado, categoría, etc.
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?segmentBy=cattle_type&period=year&includeAllocations=true&allocationMethod=activity_based
 */
router.get(
  '/profit-loss/by-segment',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 análisis segmentados cada 20 minutos
    message: 'Too many segmented P&L requests'
  }),
  financesController.getSegmentedProfitLoss
);

/**
 * @route   POST /finances/profit-loss/variance-analysis
 * @desc    Análisis de variaciones en P&L vs presupuesto/períodos anteriores
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { comparisonType: string, baselinePeriod: string, analysisLevel: string, includeExplanations: boolean }
 */
router.post(
  '/profit-loss/variance-analysis',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 análisis de variación cada 30 minutos
    message: 'Too many variance analysis requests'
  }),
  financesController.analyzeProfitLossVariance
);

// ============================================================================
// ANÁLISIS DE ROI Y RENTABILIDAD
// ============================================================================

/**
 * @route   GET /finances/roi-analysis
 * @desc    Análisis de retorno sobre inversión (ROI)
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?analysisType=by_animal&period=lifetime&includeIRR=true&includeNPV=true&discountRate=0.08
 */
router.get(
  '/roi-analysis',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 análisis ROI cada 20 minutos
    message: 'Too many ROI analysis requests'
  }),
  roiAnalysisValidationRules(),
  validationMiddleware,
  financesController.getROIAnalysis
);

/**
 * @route   POST /finances/roi-analysis/investment-evaluation
 * @desc    Evaluación de nuevas inversiones o proyectos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { investmentType: string, initialCost: number, projectedReturns: array, riskAssessment: object, paybackPeriod: number, scenarioAnalysis: boolean }
 */
router.post(
  '/roi-analysis/investment-evaluation',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 evaluaciones de inversión cada 30 minutos
    message: 'Too many investment evaluations'
  }),
  financesController.evaluateInvestment
);

/**
 * @route   GET /finances/profitability/benchmarks
 * @desc    Comparación de rentabilidad con benchmarks de la industria
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?region=mexico&herdSize=similar&productionType=mixed&includePercentiles=true
 */
router.get(
  '/profitability/benchmarks',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 comparaciones con benchmarks cada 30 minutos
    message: 'Too many benchmark requests'
  }),
  financesController.getProfitabilityBenchmarks
);

/**
 * @route   GET /finances/profitability/trends
 * @desc    Análisis de tendencias de rentabilidad con proyecciones
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?period=5y&includeDrivers=true&includePredictions=true&confidence=0.95
 */
router.get(
  '/profitability/trends',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 12, // máximo 12 análisis de tendencias cada 20 minutos
    message: 'Too many trend analysis requests'
  }),
  financesController.analyzeProfitabilityTrends
);

// ============================================================================
// PRESUPUESTOS Y PLANIFICACIÓN FINANCIERA
// ============================================================================

/**
 * @route   GET /finances/budgets
 * @desc    Obtener presupuestos activos y comparaciones
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?period=year&includeVariances=true&includeRevisedBudgets=true&detailLevel=category
 */
router.get(
  '/budgets',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 consultas de presupuesto cada 10 minutos
    message: 'Too many budget requests'
  }),
  financesController.getBudgets
);

/**
 * @route   POST /finances/budgets
 * @desc    Crear nuevo presupuesto anual o por período
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { name: string, period: object, categories: array, assumptions: object, approvalWorkflow: boolean, basedOnHistorical: boolean }
 */
router.post(
  '/budgets',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 8, // máximo 8 presupuestos por usuario cada 30 minutos
    message: 'Too many budget creations'
  }),
  budgetValidationRules(),
  validationMiddleware,
  financesController.createBudget
);

/**
 * @route   PUT /finances/budgets/:id
 * @desc    Actualizar presupuesto existente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID del presupuesto)
 * @body    Campos a actualizar del presupuesto
 */
router.put(
  '/budgets/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 actualizaciones de presupuesto cada 20 minutos
    message: 'Too many budget updates'
  }),
  budgetValidationRules(),
  validationMiddleware,
  financesController.updateBudget
);

/**
 * @route   GET /finances/budgets/:id/variance
 * @desc    Análisis de variaciones presupuestarias
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID del presupuesto)
 * @query   ?period=current&includeRecommendations=true&varianceThreshold=5
 */
router.get(
  '/budgets/:id/variance',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  financesController.getBudgetVarianceAnalysis
);

/**
 * @route   POST /finances/budgets/:id/revise
 * @desc    Crear revisión de presupuesto
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID del presupuesto)
 * @body    { revisionReason: string, adjustments: array, effectiveDate: string, approvalRequired: boolean }
 */
router.post(
  '/budgets/:id/revise',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 revisiones por usuario cada 30 minutos
    message: 'Too many budget revisions'
  }),
  financesController.reviseBudget
);

// ============================================================================
// GESTIÓN DE ACTIVOS Y DEPRECIACIÓN
// ============================================================================

/**
 * @route   GET /finances/assets
 * @desc    Obtener registro de activos fijos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?category=equipment&includeDepreciation=true&status=active&sortBy=purchase_date
 */
router.get(
  '/assets',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 40, // máximo 40 consultas de activos cada 10 minutos
    message: 'Too many asset requests'
  }),
  financesController.getAssets
);

/**
 * @route   POST /finances/assets
 * @desc    Registrar nuevo activo fijo
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { name: string, category: string, purchasePrice: number, purchaseDate: string, usefulLife: number, depreciationMethod: string, location: object, serialNumber?: string }
 */
router.post(
  '/assets',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 registros de activos cada 20 minutos
    message: 'Too many asset registrations'
  }),
  uploadMiddleware.array('assetDocuments', 10), // facturas, warranties, etc.
  assetValidationRules(),
  validationMiddleware,
  financesController.registerAsset
);

/**
 * @route   PUT /finances/assets/:id
 * @desc    Actualizar información de activo
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID del activo)
 * @body    Campos a actualizar del activo
 */
router.put(
  '/assets/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 actualizaciones de activos cada 15 minutos
    message: 'Too many asset updates'
  }),
  assetValidationRules(),
  validationMiddleware,
  financesController.updateAsset
);

/**
 * @route   POST /finances/assets/depreciation/calculate
 * @desc    Calcular depreciación automática para todos los activos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { calculationDate: string, method?: string, includeDisposals: boolean, generateEntries: boolean }
 */
router.post(
  '/assets/depreciation/calculate',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // máximo 5 cálculos de depreciación por usuario cada hora
    message: 'Too many depreciation calculations'
  }),
  depreciationValidationRules(),
  validationMiddleware,
  financesController.calculateDepreciation
);

/**
 * @route   GET /finances/assets/:id/depreciation-schedule
 * @desc    Obtener calendario de depreciación de un activo específico
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID del activo)
 */
router.get(
  '/assets/:id/depreciation-schedule',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  financesController.getAssetDepreciationSchedule
);

/**
 * @route   POST /finances/assets/:id/dispose
 * @desc    Registrar disposición de activo (venta, desecho, etc.)
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID del activo)
 * @body    { disposalType: string, disposalDate: string, disposalAmount?: number, reason: string, buyer?: object }
 */
router.post(
  '/assets/:id/dispose',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 disposiciones por usuario cada 30 minutos
    message: 'Too many asset disposals'
  }),
  financesController.disposeAsset
);

// ============================================================================
// FACTURACIÓN Y PAGOS
// ============================================================================

/**
 * @route   GET /finances/invoices
 * @desc    Obtener facturas emitidas y recibidas
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?type=issued&status=pending&dateFrom=2025-01-01&includePayments=true
 */
router.get(
  '/invoices',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 50, // máximo 50 consultas de facturas cada 10 minutos
    message: 'Too many invoice requests'
  }),
  financesController.getInvoices
);

/**
 * @route   POST /finances/invoices
 * @desc    Crear nueva factura
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { customer: object, items: array, dueDate: string, paymentTerms: object, taxCalculation: boolean, invoiceNumber?: string }
 */
router.post(
  '/invoices',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 20, // máximo 20 facturas por usuario cada 15 minutos
    message: 'Too many invoice creations'
  }),
  taxCalculationMiddleware, // calcular impuestos automáticamente
  invoiceValidationRules(),
  validationMiddleware,
  financesController.createInvoice
);

/**
 * @route   PUT /finances/invoices/:id
 * @desc    Actualizar factura existente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID de la factura)
 * @body    Campos a actualizar de la factura
 */
router.put(
  '/invoices/:id',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 30, // máximo 30 actualizaciones de facturas cada 15 minutos
    message: 'Too many invoice updates'
  }),
  taxCalculationMiddleware,
  invoiceValidationRules(),
  validationMiddleware,
  financesController.updateInvoice
);

/**
 * @route   POST /finances/invoices/:id/payment
 * @desc    Registrar pago de factura
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID de la factura)
 * @body    { amount: number, paymentDate: string, paymentMethod: string, reference?: string, bankAccount?: string }
 */
router.post(
  '/invoices/:id/payment',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 40, // máximo 40 pagos por usuario cada 10 minutos
    message: 'Too many payment registrations'
  }),
  uploadMiddleware.array('paymentProofs', 5), // comprobantes de pago
  paymentValidationRules(),
  validationMiddleware,
  financesController.recordInvoicePayment
);

/**
 * @route   GET /finances/invoices/:id/pdf
 * @desc    Generar factura en formato PDF
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID de la factura)
 * @query   ?template=standard&language=es&includeQR=true
 */
router.get(
  '/invoices/:id/pdf',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 generaciones PDF cada 10 minutos
    message: 'Too many PDF generations'
  }),
  financesController.generateInvoicePDF
);

/**
 * @route   POST /finances/invoices/:id/send
 * @desc    Enviar factura por email al cliente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID de la factura)
 * @body    { recipients: string[], subject?: string, message?: string, includeAttachments: boolean }
 */
router.post(
  '/invoices/:id/send',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 25, // máximo 25 envíos por usuario cada 15 minutos
    message: 'Too many invoice sends'
  }),
  financesController.sendInvoice
);

// ============================================================================
// CENTROS DE COSTOS Y ANÁLISIS DETALLADO
// ============================================================================

/**
 * @route   GET /finances/cost-centers
 * @desc    Obtener centros de costos configurados
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?includeAllocations=true&period=month&activeOnly=true
 */
router.get(
  '/cost-centers',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 consultas de centros de costos cada 10 minutos
    message: 'Too many cost center requests'
  }),
  financesController.getCostCenters
);

/**
 * @route   POST /finances/cost-centers
 * @desc    Crear nuevo centro de costos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { name: string, code: string, description: string, manager: string, allocationMethod: string, budgetAmount?: number }
 */
router.post(
  '/cost-centers',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 centros de costos por usuario cada 30 minutos
    message: 'Too many cost center creations'
  }),
  costCenterValidationRules(),
  validationMiddleware,
  financesController.createCostCenter
);

/**
 * @route   POST /finances/cost-centers/allocate
 * @desc    Asignar costos a centros de costos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { period: string, allocations: array, allocationMethod: string, basis: object }
 */
router.post(
  '/cost-centers/allocate',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 8, // máximo 8 asignaciones por usuario cada 30 minutos
    message: 'Too many cost allocations'
  }),
  financesController.allocateCosts
);

/**
 * @route   GET /finances/cost-centers/:id/analysis
 * @desc    Análisis detallado de un centro de costos específico
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID del centro de costos)
 * @query   ?period=quarter&includeVariances=true&includeDrivers=true
 */
router.get(
  '/cost-centers/:id/analysis',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  financesController.analyzeCostCenter
);

// ============================================================================
// CONCILIACIÓN BANCARIA
// ============================================================================

/**
 * @route   GET /finances/bank-reconciliation
 * @desc    Obtener estado de conciliaciones bancarias
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?account=all&status=pending&period=month&includeUnmatched=true
 */
router.get(
  '/bank-reconciliation',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 consultas de conciliación cada 10 minutos
    message: 'Too many reconciliation requests'
  }),
  financesController.getBankReconciliations
);

/**
 * @route   POST /finances/bank-reconciliation
 * @desc    Iniciar nueva conciliación bancaria
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { bankAccount: string, statementDate: string, endingBalance: number, autoMatch: boolean }
 */
router.post(
  '/bank-reconciliation',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 conciliaciones por usuario cada 30 minutos
    message: 'Too many reconciliation starts'
  }),
  uploadMiddleware.single('bankStatement'), // estado de cuenta bancario
  bankReconciliationValidationRules(),
  validationMiddleware,
  financesController.startBankReconciliation
);

/**
 * @route   PUT /finances/bank-reconciliation/:id/match
 * @desc    Emparejar transacciones bancarias con registros contables
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID de la conciliación)
 * @body    { matches: array, unmatchedItems: array, adjustments: array }
 */
router.put(
  '/bank-reconciliation/:id/match',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 20 * 60 * 1000, // 20 minutos
    max: 15, // máximo 15 operaciones de matching cada 20 minutos
    message: 'Too many matching operations'
  }),
  financesController.matchBankTransactions
);

/**
 * @route   POST /finances/bank-reconciliation/:id/finalize
 * @desc    Finalizar conciliación bancaria
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID de la conciliación)
 * @body    { finalBalance: number, adjustmentEntries: array, approvedBy: string }
 */
router.post(
  '/bank-reconciliation/:id/finalize',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 finalizaciones por usuario cada 30 minutos
    message: 'Too many reconciliation finalizations'
  }),
  financesController.finalizeReconciliation
);

// ============================================================================
// REPORTES FINANCIEROS AVANZADOS
// ============================================================================

/**
 * @route   POST /finances/reports/generate
 * @desc    Generar reportes financieros personalizados
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { reportType: string, period: object, parameters: object, format: string, includeCharts: boolean, emailTo?: string[] }
 */
router.post(
  '/reports/generate',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 10, // máximo 10 reportes por usuario cada 30 minutos
    message: 'Too many report generations'
  }),
  financialReportValidationRules(),
  validationMiddleware,
  financesController.generateFinancialReport
);

/**
 * @route   GET /finances/reports/:id/download
 * @desc    Descargar reporte financiero generado
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  id: string (UUID del reporte)
 */
router.get(
  '/reports/:id/download',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 30, // máximo 30 descargas cada 10 minutos
    message: 'Too many report downloads'
  }),
  financesController.downloadFinancialReport
);

/**
 * @route   POST /finances/reports/tax-report
 * @desc    Generar reporte fiscal/tributario
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { taxPeriod: object, reportType: string, taxAuthority: string, includeSupporting: boolean }
 */
router.post(
  '/reports/tax-report',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // máximo 5 reportes fiscales por usuario cada hora
    message: 'Too many tax report generations'
  }),
  taxReportValidationRules(),
  validationMiddleware,
  financesController.generateTaxReport
);

/**
 * @route   GET /finances/reports/scheduled
 * @desc    Obtener reportes programados
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?status=active&frequency=monthly&includeNext=true
 */
router.get(
  '/reports/scheduled',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  financesController.getScheduledReports
);

/**
 * @route   POST /finances/reports/schedule
 * @desc    Programar reporte automático recurrente
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { reportConfig: object, frequency: string, recipients: string[], startDate: string, endDate?: string }
 */
router.post(
  '/reports/schedule',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // máximo 5 programaciones por usuario cada hora
    message: 'Too many report scheduling attempts'
  }),
  financesController.scheduleReport
);

// ============================================================================
// DASHBOARD FINANCIERO Y MÉTRICAS KPI
// ============================================================================

/**
 * @route   GET /finances/dashboard
 * @desc    Obtener dashboard financiero con métricas principales
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?period=month&includeComparisons=true&includeProjections=true&kpis=revenue,profit,cashflow,roi
 */
router.get(
  '/dashboard',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 60, // máximo 60 consultas de dashboard cada 5 minutos
    message: 'Too many dashboard requests'
  }),
  financesController.getFinancialDashboard
);

/**
 * @route   GET /finances/kpis
 * @desc    Obtener indicadores clave de rendimiento financiero
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?period=quarter&includeTargets=true&includeBenchmarks=true&format=detailed
 */
router.get(
  '/kpis',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 40, // máximo 40 consultas de KPIs cada 10 minutos
    message: 'Too many KPI requests'
  }),
  financesController.getFinancialKPIs
);

/**
 * @route   GET /finances/alerts
 * @desc    Obtener alertas financieras críticas
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @query   ?severity=high&category=all&includeRecommendations=true&activeOnly=true
 */
router.get(
  '/alerts',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 100, // máximo 100 consultas de alertas cada 5 minutos
    message: 'Too many alert requests'
  }),
  financesController.getFinancialAlerts
);

// ============================================================================
// CONFIGURACIÓN Y PARÁMETROS FINANCIEROS
// ============================================================================

/**
 * @route   GET /finances/settings
 * @desc    Obtener configuración del sistema financiero
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 */
router.get(
  '/settings',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  financesController.getFinancialSettings
);

/**
 * @route   PUT /finances/settings
 * @desc    Actualizar configuración del sistema financiero
 * @access  Private (Roles: RANCH_OWNER, ADMIN)
 * @body    { currency: string, fiscalYearStart: string, taxSettings: object, accountingMethod: string, depreciationDefaults: object }
 */
router.put(
  '/settings',
  roleMiddleware(['RANCH_OWNER', 'ADMIN']),
  rateLimitMiddleware({ 
    windowMs: 60 * 60 * 1000, // 1 hora
    max: 5, // máximo 5 actualizaciones por usuario cada hora
    message: 'Too many settings updates'
  }),
  financesController.updateFinancialSettings
);

/**
 * @route   POST /finances/export
 * @desc    Exportar datos financieros en diferentes formatos
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @body    { exportType: string, format: string, period: object, categories: string[], includeTransactions: boolean }
 */
router.post(
  '/export',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 30 * 60 * 1000, // 30 minutos
    max: 8, // máximo 8 exportaciones por usuario cada 30 minutos
    message: 'Too many export requests'
  }),
  financesController.exportFinancialData
);

/**
 * @route   GET /finances/export/:exportId/download
 * @desc    Descargar archivo de datos financieros exportado
 * @access  Private (Roles: RANCH_OWNER, ADMIN, ACCOUNTANT)
 * @params  exportId: string (ID del proceso de exportación)
 */
router.get(
  '/export/:exportId/download',
  roleMiddleware(['RANCH_OWNER', 'ADMIN', 'ACCOUNTANT']),
  rateLimitMiddleware({ 
    windowMs: 10 * 60 * 1000, // 10 minutos
    max: 20, // máximo 20 descargas cada 10 minutos
    message: 'Too many download requests'
  }),
  financesController.downloadFinancialExport
);

// ============================================================================
// MANEJO DE ERRORES ESPECÍFICOS PARA RUTAS FINANCIERAS
// ============================================================================

/**
 * Middleware de manejo de errores específico para finanzas
 */
router.use((error: any, req: Request, res: Response, next: any) => {
  // Log del error para debugging y auditoría
  console.error('Finance Route Error:', {
    path: req.path,
    method: req.method,
    userId: req.user?.id,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    requestId: req.headers['x-request-id']
  });

  // Errores específicos financieros
  if (error.name === 'InsufficientFundsError') {
    return res.status(400).json({
      success: false,
      message: 'Fondos insuficientes para la operación',
      error: 'INSUFFICIENT_FUNDS',
      details: error.details
    });
  }

  if (error.name === 'BudgetExceededError') {
    return res.status(400).json({
      success: false,
      message: 'Límite presupuestario excedido',
      error: 'BUDGET_EXCEEDED',
      details: error.details
    });
  }

  if (error.name === 'TaxCalculationError') {
    return res.status(500).json({
      success: false,
      message: 'Error en cálculo de impuestos',
      error: 'TAX_CALCULATION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'AccountingEntryError') {
    return res.status(400).json({
      success: false,
      message: 'Error en entrada contable',
      error: 'ACCOUNTING_ENTRY_ERROR',
      details: error.details
    });
  }

  if (error.name === 'ReconciliationError') {
    return res.status(400).json({
      success: false,
      message: 'Error en conciliación bancaria',
      error: 'RECONCILIATION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'DepreciationCalculationError') {
    return res.status(500).json({
      success: false,
      message: 'Error en cálculo de depreciación',
      error: 'DEPRECIATION_CALCULATION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'InvoiceGenerationError') {
    return res.status(500).json({
      success: false,
      message: 'Error al generar factura',
      error: 'INVOICE_GENERATION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'PaymentProcessingError') {
    return res.status(400).json({
      success: false,
      message: 'Error al procesar pago',
      error: 'PAYMENT_PROCESSING_ERROR',
      details: error.details
    });
  }

  if (error.name === 'ROICalculationError') {
    return res.status(500).json({
      success: false,
      message: 'Error en cálculo de ROI',
      error: 'ROI_CALCULATION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'ReportGenerationError') {
    return res.status(500).json({
      success: false,
      message: 'Error al generar reporte financiero',
      error: 'REPORT_GENERATION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'CurrencyConversionError') {
    return res.status(500).json({
      success: false,
      message: 'Error en conversión de moneda',
      error: 'CURRENCY_CONVERSION_ERROR',
      details: error.details
    });
  }

  if (error.name === 'AuditTrailError') {
    return res.status(500).json({
      success: false,
      message: 'Error en registro de auditoría',
      error: 'AUDIT_TRAIL_ERROR',
      details: error.details
    });
  }

  // Error genérico
  return res.status(500).json({
    success: false,
    message: 'Error interno del servidor financiero',
    error: 'INTERNAL_SERVER_ERROR'
  });
});

export default router;