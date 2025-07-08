import { api, apiClient } from "./api";
import { REPORT_ENDPOINTS } from "../constants/urls";

// Interfaces principales para finanzas
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface FinancialTransaction extends BaseEntity {
  type: TransactionType;
  category: TransactionCategory;
  subcategory?: string;
  amount: number;
  currency: string;
  description: string;
  date: Date;
  dueDate?: Date;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  vendor?: VendorInfo;
  customer?: CustomerInfo;
  relatedEntityType?: string;
  relatedEntityId?: string;
  reference?: string;
  invoiceNumber?: string;
  receiptNumber?: string;
  taxAmount?: number;
  taxRate?: number;
  discountAmount?: number;
  totalAmount: number;
  attachments?: string[];
  tags?: string[];
  notes?: string;
  approvedBy?: string;
  approvedAt?: Date;
  accountingPeriod: string;
  location?: Location;
}

interface VendorInfo {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  paymentTerms?: string;
  category: VendorCategory;
  isActive: boolean;
}

interface CustomerInfo {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  taxId?: string;
  creditLimit?: number;
  paymentTerms?: string;
  type: CustomerType;
  isActive: boolean;
}

interface Budget extends BaseEntity {
  name: string;
  description?: string;
  period: BudgetPeriod;
  startDate: Date;
  endDate: Date;
  totalBudget: number;
  currency: string;
  categories: BudgetCategory[];
  status: BudgetStatus;
  approvedBy?: string;
  approvedAt?: Date;
  variance?: BudgetVariance;
}

interface BudgetCategory {
  category: TransactionCategory;
  subcategory?: string;
  budgetedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  variance: number;
  variancePercentage: number;
  monthlyDistribution?: number[];
}

interface BudgetVariance {
  totalVariance: number;
  variancePercentage: number;
  categoriesOverBudget: number;
  categoriesUnderBudget: number;
  biggestVariance: {
    category: TransactionCategory;
    amount: number;
    percentage: number;
  };
}

interface Asset extends BaseEntity {
  name: string;
  description?: string;
  category: AssetCategory;
  type: AssetType;
  purchasePrice: number;
  currentValue: number;
  depreciatedValue: number;
  purchaseDate: Date;
  condition: AssetCondition;
  depreciationMethod: DepreciationMethod;
  usefulLife: number;
  salvageValue: number;
  location?: Location;
  serialNumber?: string;
  warranty?: {
    startDate: Date;
    endDate: Date;
    provider: string;
  };
  maintenance: MaintenanceRecord[];
  images?: string[];
}

interface MaintenanceRecord {
  id: string;
  date: Date;
  type: MaintenanceType;
  description: string;
  cost: number;
  performedBy: string;
  nextDueDate?: Date;
  parts?: string[];
  laborHours?: number;
}

interface FinancialReport {
  id: string;
  name: string;
  type: ReportType;
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  generatedBy: string;
  status: ReportStatus;
  data: any;
  downloadUrl?: string;
  filters?: any;
}

interface CashFlow {
  period: string;
  openingBalance: number;
  totalIncome: number;
  totalExpenses: number;
  netCashFlow: number;
  closingBalance: number;
  operatingActivities: number;
  investingActivities: number;
  financingActivities: number;
}

interface ProfitLoss {
  period: string;
  revenue: number;
  costOfSales: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  nonOperatingIncome: number;
  nonOperatingExpenses: number;
  netIncome: number;
  grossMargin: number;
  operatingMargin: number;
  netMargin: number;
}

interface ROIAnalysis {
  animalId?: string;
  category?: string;
  period: string;
  initialInvestment: number;
  totalRevenue: number;
  totalCosts: number;
  netProfit: number;
  roi: number;
  roiAnnualized: number;
  paybackPeriod: number;
  irr?: number;
  npv?: number;
}

interface FinancialMetrics {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  currentRatio: number;
  debtToEquityRatio: number;
  profitMargin: number;
  returnOnAssets: number;
  returnOnEquity: number;
  workingCapital: number;
  cashRatio: number;
}

// Enums
enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
  TRANSFER = "transfer",
  ADJUSTMENT = "adjustment",
}

enum TransactionCategory {
  ANIMAL_PURCHASE = "animal_purchase",
  ANIMAL_SALE = "animal_sale",
  FEED = "feed",
  VETERINARY = "veterinary",
  BREEDING = "breeding",
  EQUIPMENT = "equipment",
  LABOR = "labor",
  UTILITIES = "utilities",
  INSURANCE = "insurance",
  TRANSPORTATION = "transportation",
  MAINTENANCE = "maintenance",
  SUPPLIES = "supplies",
  PROFESSIONAL_SERVICES = "professional_services",
  TAXES = "taxes",
  INTEREST = "interest",
  DEPRECIATION = "depreciation",
  OTHER_INCOME = "other_income",
  OTHER_EXPENSE = "other_expense",
}

enum TransactionStatus {
  PENDING = "pending",
  APPROVED = "approved",
  PAID = "paid",
  CANCELLED = "cancelled",
  OVERDUE = "overdue",
}

enum PaymentMethod {
  CASH = "cash",
  CHECK = "check",
  BANK_TRANSFER = "bank_transfer",
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  DIGITAL_WALLET = "digital_wallet",
  FINANCING = "financing",
}

enum VendorCategory {
  FEED_SUPPLIER = "feed_supplier",
  VETERINARY_CLINIC = "veterinary_clinic",
  EQUIPMENT_DEALER = "equipment_dealer",
  BREEDING_SERVICE = "breeding_service",
  TRANSPORTATION = "transportation",
  PROFESSIONAL_SERVICE = "professional_service",
  UTILITY_COMPANY = "utility_company",
  INSURANCE_COMPANY = "insurance_company",
  GENERAL_SUPPLIER = "general_supplier",
}

enum CustomerType {
  INDIVIDUAL = "individual",
  FARM = "farm",
  PROCESSOR = "processor",
  RETAILER = "retailer",
  EXPORT = "export",
  GOVERNMENT = "government",
}

enum BudgetPeriod {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUAL = "annual",
  CUSTOM = "custom",
}

enum BudgetStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

enum AssetCategory {
  LIVESTOCK = "livestock",
  EQUIPMENT = "equipment",
  INFRASTRUCTURE = "infrastructure",
  VEHICLES = "vehicles",
  LAND = "land",
  BUILDINGS = "buildings",
  TECHNOLOGY = "technology",
}

enum AssetType {
  FIXED = "fixed",
  CURRENT = "current",
  INTANGIBLE = "intangible",
}

enum AssetCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  BROKEN = "broken",
}

enum DepreciationMethod {
  STRAIGHT_LINE = "straight_line",
  DECLINING_BALANCE = "declining_balance",
  DOUBLE_DECLINING = "double_declining",
  UNITS_OF_PRODUCTION = "units_of_production",
}

enum MaintenanceType {
  PREVENTIVE = "preventive",
  CORRECTIVE = "corrective",
  PREDICTIVE = "predictive",
  EMERGENCY = "emergency",
}

enum ReportType {
  INCOME_STATEMENT = "income_statement",
  BALANCE_SHEET = "balance_sheet",
  CASH_FLOW = "cash_flow",
  BUDGET_VARIANCE = "budget_variance",
  PROFITABILITY = "profitability",
  TAX = "tax",
  CUSTOM = "custom",
}

enum ReportPeriod {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUAL = "annual",
  CUSTOM = "custom",
}

enum ReportStatus {
  GENERATING = "generating",
  COMPLETED = "completed",
  FAILED = "failed",
  SCHEDULED = "scheduled",
}

// Configuración del servicio financiero
const FINANCE_CONFIG = {
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  BATCH_SIZE: 100,
  MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_FILE_TYPES: [
    "application/pdf",
    "image/jpeg",
    "image/png",
    "text/csv",
    "application/vnd.ms-excel",
  ],
  CURRENCY_DEFAULT: "MXN",
  TAX_RATE_DEFAULT: 0.16, // 16% IVA México
  SYNC_INTERVAL: 60 * 1000, // 1 minuto
  BACKUP_INTERVAL: 24 * 60 * 60 * 1000, // 24 horas
} as const;

// Etiquetas en español
const TRANSACTION_TYPE_LABELS = {
  [TransactionType.INCOME]: "Ingreso",
  [TransactionType.EXPENSE]: "Gasto",
  [TransactionType.TRANSFER]: "Transferencia",
  [TransactionType.ADJUSTMENT]: "Ajuste",
} as const;

const TRANSACTION_CATEGORY_LABELS = {
  [TransactionCategory.ANIMAL_PURCHASE]: "Compra de Animales",
  [TransactionCategory.ANIMAL_SALE]: "Venta de Animales",
  [TransactionCategory.FEED]: "Alimento",
  [TransactionCategory.VETERINARY]: "Veterinario",
  [TransactionCategory.BREEDING]: "Reproducción",
  [TransactionCategory.EQUIPMENT]: "Equipo",
  [TransactionCategory.LABOR]: "Mano de Obra",
  [TransactionCategory.UTILITIES]: "Servicios Públicos",
  [TransactionCategory.INSURANCE]: "Seguros",
  [TransactionCategory.TRANSPORTATION]: "Transporte",
  [TransactionCategory.MAINTENANCE]: "Mantenimiento",
  [TransactionCategory.SUPPLIES]: "Suministros",
  [TransactionCategory.PROFESSIONAL_SERVICES]: "Servicios Profesionales",
  [TransactionCategory.TAXES]: "Impuestos",
  [TransactionCategory.INTEREST]: "Intereses",
  [TransactionCategory.DEPRECIATION]: "Depreciación",
  [TransactionCategory.OTHER_INCOME]: "Otros Ingresos",
  [TransactionCategory.OTHER_EXPENSE]: "Otros Gastos",
} as const;

// Clase principal del servicio financiero
class FinanceService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private syncTimer: number | null = null;
  private pendingOperations: any[] = [];
  private autoBackupTimer: number | null = null;

  constructor() {
    this.startAutoSync();
    this.setupEventListeners();
    this.scheduleAutoBackup();
  }

  // MÉTODOS DE CACHE Y SINCRONIZACIÓN

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired =
      Date.now() - cached.timestamp > FINANCE_CONFIG.CACHE_DURATION;
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
    }, FINANCE_CONFIG.SYNC_INTERVAL);
  }

  private setupEventListeners(): void {
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));
  }

  private async handleOnline(): Promise<void> {
    console.log(
      "🌐 Conexión restaurada - Sincronizando transacciones financieras..."
    );
    await this.syncPendingOperations();
  }

  private handleOffline(): void {
    console.log(
      "📱 Modo offline - Las transacciones se guardarán para sincronización"
    );
  }

  private async syncPendingOperations(): Promise<void> {
    if (this.pendingOperations.length === 0) return;

    try {
      console.log(
        `🔄 Sincronizando ${this.pendingOperations.length} operaciones financieras...`
      );

      for (const operation of this.pendingOperations) {
        await this.executePendingOperation(operation);
      }

      this.pendingOperations = [];
      console.log("✅ Sincronización financiera completada");
    } catch (error) {
      console.error("❌ Error en sincronización financiera:", error);
    }
  }

  private async executePendingOperation(operation: any): Promise<void> {
    try {
      switch (operation.type) {
        case "create_transaction":
          await this.createTransaction(operation.data, false);
          break;
        case "update_transaction":
          await this.updateTransaction(operation.id, operation.data, false);
          break;
        case "approve_transaction":
          await this.approveTransaction(operation.id, false);
          break;
        case "create_budget":
          await this.createBudget(operation.data, false);
          break;
      }
    } catch (error) {
      console.error(
        "❌ Error ejecutando operación financiera pendiente:",
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

  // MÉTODOS CRUD DE TRANSACCIONES

  // Obtener transacciones
  public async getTransactions(params?: {
    type?: TransactionType;
    category?: TransactionCategory;
    status?: TransactionStatus;
    dateFrom?: Date;
    dateTo?: Date;
    amountMin?: number;
    amountMax?: number;
    vendorId?: string;
    customerId?: string;
    relatedEntityId?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ transactions: FinancialTransaction[]; pagination: any }> {
    try {
      const cacheKey = `transactions_${JSON.stringify(params || {})}`;
      const cached = this.getFromCache<{
        transactions: FinancialTransaction[];
        pagination: any;
      }>(cacheKey);

      if (cached) {
        console.log("📦 Transacciones obtenidas del cache");
        return cached;
      }

      console.log("💰 Obteniendo transacciones financieras...");

      const response = await api.get<{
        transactions: FinancialTransaction[];
        pagination: any;
      }>("/finance/transactions", {
        params,
      });

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo transacciones");
      }

      // Procesar fechas
      const processedData = {
        ...response.data,
        transactions: response.data.transactions.map((transaction) => ({
          ...transaction,
          date: new Date(transaction.date),
          dueDate: transaction.dueDate
            ? new Date(transaction.dueDate)
            : undefined,
          createdAt: new Date(transaction.createdAt),
          updatedAt: new Date(transaction.updatedAt),
          approvedAt: transaction.approvedAt
            ? new Date(transaction.approvedAt)
            : undefined,
        })),
      };

      this.setCache(cacheKey, processedData);

      console.log(
        `✅ ${processedData.transactions.length} transacciones obtenidas`
      );
      return processedData;
    } catch (error) {
      console.error("❌ Error obteniendo transacciones:", error);
      throw error;
    }
  }

  // Crear transacción
  public async createTransaction(
    transactionData: Omit<
      FinancialTransaction,
      "id" | "createdAt" | "updatedAt" | "createdBy" | "accountingPeriod"
    >,
    sync: boolean = true
  ): Promise<FinancialTransaction> {
    try {
      // Agregar ubicación si es gasto de campo
      if (
        !transactionData.location &&
        this.isFieldExpense(transactionData.category)
      ) {
        try {
          transactionData.location = await this.getCurrentLocation();
        } catch (error) {
          console.warn(
            "⚠️ No se pudo obtener ubicación para transacción de campo"
          );
        }
      }

      // Calcular impuestos automáticamente
      if (!transactionData.taxAmount && transactionData.amount > 0) {
        transactionData.taxAmount =
          transactionData.amount * FINANCE_CONFIG.TAX_RATE_DEFAULT;
        transactionData.taxRate = FINANCE_CONFIG.TAX_RATE_DEFAULT;
        transactionData.totalAmount =
          transactionData.amount + transactionData.taxAmount;
      }

      console.log(`💰 Creando transacción: ${transactionData.description}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "create_transaction",
          data: transactionData,
          timestamp: Date.now(),
        });

        console.log("📱 Transacción guardada para sincronización offline");
        throw new Error(
          "Transacción guardada para cuando se restaure la conexión"
        );
      }

      const response = await api.post<FinancialTransaction>(
        "/finance/transactions",
        transactionData,
        { includeLocation: !!transactionData.location }
      );

      if (!response.success || !response.data) {
        throw new Error("Error creando transacción");
      }

      this.clearCache();
      console.log(`✅ Transacción creada: ${response.data.description}`);

      return response.data;
    } catch (error) {
      console.error("❌ Error creando transacción:", error);
      throw error;
    }
  }

  // Verificar si es gasto de campo que requiere ubicación
  private isFieldExpense(category: TransactionCategory): boolean {
    const fieldCategories = [
      TransactionCategory.VETERINARY,
      TransactionCategory.FEED,
      TransactionCategory.BREEDING,
      TransactionCategory.TRANSPORTATION,
      TransactionCategory.MAINTENANCE,
    ];
    return fieldCategories.includes(category);
  }

  // Crear transacción veterinaria específica
  public async createVeterinaryTransaction(
    bovineId: string,
    amount: number,
    description: string,
    veterinarianId?: string,
    location?: Location
  ): Promise<FinancialTransaction> {
    try {
      const transactionLocation = location || (await this.getCurrentLocation());

      const transactionData: Omit<
        FinancialTransaction,
        "id" | "createdAt" | "updatedAt" | "createdBy" | "accountingPeriod"
      > = {
        type: TransactionType.EXPENSE,
        category: TransactionCategory.VETERINARY,
        amount,
        currency: FINANCE_CONFIG.CURRENCY_DEFAULT,
        description,
        date: new Date(),
        status: TransactionStatus.APPROVED,
        relatedEntityType: "bovine",
        relatedEntityId: bovineId,
        location: transactionLocation,
        tags: ["veterinario", "salud_animal"],
        totalAmount: amount,
      };

      if (veterinarianId) {
        transactionData.notes = `Veterinario ID: ${veterinarianId}`;
      }

      console.log(
        `🏥 Creando transacción veterinaria para bovino: ${bovineId}`
      );

      return await this.createTransaction(transactionData);
    } catch (error) {
      console.error("❌ Error creando transacción veterinaria:", error);
      throw error;
    }
  }

  // Aprobar transacción
  public async approveTransaction(
    transactionId: string,
    sync: boolean = true
  ): Promise<FinancialTransaction> {
    try {
      console.log(`✅ Aprobando transacción: ${transactionId}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "approve_transaction",
          id: transactionId,
          timestamp: Date.now(),
        });

        console.log("📱 Aprobación guardada para sincronización offline");
        throw new Error(
          "Aprobación guardada para cuando se restaure la conexión"
        );
      }

      const response = await api.put<FinancialTransaction>(
        `/finance/transactions/${transactionId}/approve`,
        {
          approvedAt: new Date(),
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error aprobando transacción");
      }

      this.clearCache();
      console.log("✅ Transacción aprobada exitosamente");

      return response.data;
    } catch (error) {
      console.error("❌ Error aprobando transacción:", error);
      throw error;
    }
  }

  // Actualizar transacción
  public async updateTransaction(
    transactionId: string,
    updates: Partial<FinancialTransaction>,
    sync: boolean = true
  ): Promise<FinancialTransaction> {
    try {
      console.log(`✏️ Actualizando transacción: ${transactionId}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "update_transaction",
          id: transactionId,
          data: updates,
          timestamp: Date.now(),
        });

        console.log("📱 Actualización guardada para sincronización offline");
        throw new Error(
          "Actualización guardada para cuando se restaure la conexión"
        );
      }

      const response = await api.put<FinancialTransaction>(
        `/finance/transactions/${transactionId}`,
        updates
      );

      if (!response.success || !response.data) {
        throw new Error("Error actualizando transacción");
      }

      this.clearCache();
      console.log("✅ Transacción actualizada exitosamente");

      return response.data;
    } catch (error) {
      console.error("❌ Error actualizando transacción:", error);
      throw error;
    }
  }

  // MÉTODOS DE PRESUPUESTOS

  // Crear presupuesto
  public async createBudget(
    budgetData: Omit<Budget, "id" | "createdAt" | "updatedAt" | "createdBy">,
    sync: boolean = true
  ): Promise<Budget> {
    try {
      console.log(`📊 Creando presupuesto: ${budgetData.name}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "create_budget",
          data: budgetData,
          timestamp: Date.now(),
        });

        console.log("📱 Presupuesto guardado para sincronización offline");
        throw new Error(
          "Presupuesto guardado para cuando se restaure la conexión"
        );
      }

      const response = await api.post<Budget>("/finance/budgets", budgetData);

      if (!response.success || !response.data) {
        throw new Error("Error creando presupuesto");
      }

      this.clearCache();
      console.log(`✅ Presupuesto creado: ${response.data.name}`);

      return response.data;
    } catch (error) {
      console.error("❌ Error creando presupuesto:", error);
      throw error;
    }
  }

  // Obtener presupuestos
  public async getBudgets(params?: {
    status?: BudgetStatus;
    period?: BudgetPeriod;
    year?: number;
  }): Promise<Budget[]> {
    try {
      const response = await api.get<Budget[]>("/finance/budgets", { params });

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo presupuestos");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo presupuestos:", error);
      throw error;
    }
  }

  // Analizar variación de presupuesto
  public async analyzeBudgetVariance(
    budgetId: string
  ): Promise<BudgetVariance> {
    try {
      console.log(`📈 Analizando variación de presupuesto: ${budgetId}`);

      const response = await api.get<BudgetVariance>(
        `/finance/budgets/${budgetId}/variance`
      );

      if (!response.success || !response.data) {
        throw new Error("Error analizando variación de presupuesto");
      }

      console.log("✅ Análisis de variación completado");
      return response.data;
    } catch (error) {
      console.error("❌ Error analizando variación:", error);
      throw error;
    }
  }

  // MÉTODOS DE ANÁLISIS FINANCIERO

  // Obtener flujo de caja
  public async getCashFlow(
    period: ReportPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<CashFlow[]> {
    try {
      console.log(`💹 Obteniendo flujo de caja para período: ${period}`);

      const response = await api.get<CashFlow[]>("/finance/reports/cash-flow", {
        params: {
          period,
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        },
      });

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo flujo de caja");
      }

      console.log("✅ Flujo de caja obtenido");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo flujo de caja:", error);
      throw error;
    }
  }

  // Obtener estado de resultados
  public async getProfitLoss(
    period: ReportPeriod,
    startDate?: Date,
    endDate?: Date
  ): Promise<ProfitLoss[]> {
    try {
      console.log(`📊 Obteniendo estado de resultados para período: ${period}`);

      const response = await api.get<ProfitLoss[]>(
        "/finance/reports/profit-loss",
        {
          params: {
            period,
            startDate: startDate?.toISOString(),
            endDate: endDate?.toISOString(),
          },
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo estado de resultados");
      }

      console.log("✅ Estado de resultados obtenido");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo estado de resultados:", error);
      throw error;
    }
  }

  // Análisis de ROI
  public async analyzeROI(params?: {
    animalId?: string;
    category?: AssetCategory;
    period?: string;
    includeProjections?: boolean;
  }): Promise<ROIAnalysis[]> {
    try {
      console.log("🎯 Analizando ROI...");

      const response = await api.get<ROIAnalysis[]>(
        REPORT_ENDPOINTS.ROI_ANALYSIS,
        { params }
      );

      if (!response.success || !response.data) {
        throw new Error("Error analizando ROI");
      }

      console.log("✅ Análisis de ROI completado");
      return response.data;
    } catch (error) {
      console.error("❌ Error analizando ROI:", error);
      throw error;
    }
  }

  // Obtener métricas financieras clave
  public async getFinancialMetrics(): Promise<FinancialMetrics> {
    try {
      console.log("📈 Obteniendo métricas financieras...");

      const response = await api.get<FinancialMetrics>("/finance/metrics");

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo métricas financieras");
      }

      console.log("✅ Métricas financieras obtenidas");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo métricas:", error);
      throw error;
    }
  }

  // MÉTODOS DE GESTIÓN DE ACTIVOS

  // Crear activo
  public async createAsset(
    assetData: Omit<
      Asset,
      "id" | "createdAt" | "updatedAt" | "createdBy" | "maintenance"
    >
  ): Promise<Asset> {
    try {
      console.log(`🏗️ Creando activo: ${assetData.name}`);

      const response = await api.post<Asset>("/finance/assets", assetData);

      if (!response.success || !response.data) {
        throw new Error("Error creando activo");
      }

      this.clearCache();
      console.log(`✅ Activo creado: ${response.data.name}`);

      return response.data;
    } catch (error) {
      console.error("❌ Error creando activo:", error);
      throw error;
    }
  }

  // Calcular depreciación
  public async calculateDepreciation(
    assetId: string,
    toDate?: Date
  ): Promise<{
    currentValue: number;
    depreciatedValue: number;
    annualDepreciation: number;
    accumulatedDepreciation: number;
    remainingLife: number;
  }> {
    try {
      console.log(`📉 Calculando depreciación para activo: ${assetId}`);

      const response = await api.get(
        `/finance/assets/${assetId}/depreciation`,
        {
          params: { toDate: toDate?.toISOString() },
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error calculando depreciación");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error calculando depreciación:", error);
      throw error;
    }
  }

  // MÉTODOS DE REPORTES

  // Generar reporte financiero
  public async generateFinancialReport(
    type: ReportType,
    period: ReportPeriod,
    options?: {
      startDate?: Date;
      endDate?: Date;
      categories?: TransactionCategory[];
      includeCharts?: boolean;
      format?: "pdf" | "excel" | "csv";
    }
  ): Promise<FinancialReport> {
    try {
      console.log(`📋 Generando reporte financiero: ${type}`);

      const response = await api.post<FinancialReport>(
        "/finance/reports/generate",
        {
          type,
          period,
          ...options,
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

  // MÉTODOS DE COSTOS VETERINARIOS

  // Obtener costos veterinarios
  public async getVeterinaryCosts(params?: {
    period?: ReportPeriod;
    startDate?: Date;
    endDate?: Date;
    bovineId?: string;
    veterinarianId?: string;
    groupBy?: "animal" | "veterinarian" | "service" | "month";
  }): Promise<any> {
    try {
      console.log("🏥 Obteniendo costos veterinarios...");

      const response = await api.get(REPORT_ENDPOINTS.VETERINARY_COSTS, {
        params,
      });

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo costos veterinarios");
      }

      console.log("✅ Costos veterinarios obtenidos");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo costos veterinarios:", error);
      throw error;
    }
  }

  // Obtener costos de medicamentos
  public async getMedicationExpenses(params?: {
    period?: ReportPeriod;
    startDate?: Date;
    endDate?: Date;
    medicationType?: string;
    bovineId?: string;
  }): Promise<any> {
    try {
      console.log("💊 Obteniendo gastos en medicamentos...");

      const response = await api.get(REPORT_ENDPOINTS.MEDICATION_EXPENSES, {
        params,
      });

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo gastos en medicamentos");
      }

      console.log("✅ Gastos en medicamentos obtenidos");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo gastos en medicamentos:", error);
      throw error;
    }
  }

  // MÉTODOS DE EXPORTACIÓN E IMPORTACIÓN

  // Exportar datos financieros
  public async exportFinancialData(
    format: "csv" | "excel" | "pdf",
    dataType: "transactions" | "budgets" | "assets" | "reports"
  ): Promise<void> {
    try {
      console.log(
        `📤 Exportando datos financieros: ${dataType} en formato ${format}`
      );

      await apiClient.download(
        `/finance/export/${dataType}`,
        `${dataType}_${format}_${new Date().getTime()}.${format}`,
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

  // Importar transacciones
  public async importTransactions(
    file: File,
    options?: {
      skipValidation?: boolean;
      autoApprove?: boolean;
      defaultCategory?: TransactionCategory;
    }
  ): Promise<{
    imported: number;
    skipped: number;
    errors: { row: number; error: string }[];
  }> {
    try {
      console.log("📥 Importando transacciones desde archivo...");

      const response = await apiClient.upload<{
        imported: number;
        skipped: number;
        errors: { row: number; error: string }[];
      }>("/finance/transactions/import", file, "file", undefined, options);

      if (!response.success || !response.data) {
        throw new Error("Error importando transacciones");
      }

      this.clearCache();
      console.log(`✅ ${response.data.imported} transacciones importadas`);

      return response.data;
    } catch (error) {
      console.error("❌ Error importando transacciones:", error);
      throw error;
    }
  }

  // MÉTODOS DE BACKUP Y RESTAURACIÓN

  // Programar backup automático
  private scheduleAutoBackup(): void {
    if (this.autoBackupTimer) clearInterval(this.autoBackupTimer);

    this.autoBackupTimer = window.setInterval(async () => {
      await this.createBackup();
    }, FINANCE_CONFIG.BACKUP_INTERVAL);
  }

  // Crear backup de datos financieros
  public async createBackup(): Promise<{
    backupId: string;
    downloadUrl: string;
  }> {
    try {
      console.log("💾 Creando backup de datos financieros...");

      const response = await api.post("/finance/backup");

      if (!response.success || !response.data) {
        throw new Error("Error creando backup");
      }

      console.log("✅ Backup creado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error creando backup:", error);
      throw error;
    }
  }

  // MÉTODOS DE UTILIDAD

  // Validar transacción
  public validateTransaction(transaction: Partial<FinancialTransaction>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!transaction.amount || transaction.amount <= 0) {
      errors.push("El monto debe ser mayor a 0");
    }

    if (!transaction.description?.trim()) {
      errors.push("La descripción es obligatoria");
    }

    if (!transaction.category) {
      errors.push("La categoría es obligatoria");
    }

    if (!transaction.date) {
      errors.push("La fecha es obligatoria");
    }

    if (transaction.type === TransactionType.EXPENSE && !transaction.vendor) {
      errors.push("El proveedor es obligatorio para gastos");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Calcular totales por categoría
  public async getTotalsByCategory(
    startDate?: Date,
    endDate?: Date
  ): Promise<
    Record<
      TransactionCategory,
      { income: number; expense: number; net: number }
    >
  > {
    try {
      const response = await api.get("/finance/totals-by-category", {
        params: {
          startDate: startDate?.toISOString(),
          endDate: endDate?.toISOString(),
        },
      });

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo totales por categoría");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo totales por categoría:", error);
      throw error;
    }
  }

  // Obtener resumen financiero del dashboard
  public async getDashboardSummary(): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    topExpenseCategories: { category: TransactionCategory; amount: number }[];
    cashFlow: { trend: "up" | "down"; percentage: number };
    pendingTransactions: number;
    overduePayments: number;
  }> {
    try {
      const cacheKey = "dashboard_summary";
      const cached = this.getFromCache<any>(cacheKey);

      if (cached) {
        return cached;
      }

      console.log("📊 Obteniendo resumen financiero del dashboard...");

      const response = await api.get("/finance/dashboard-summary");

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
  public getCategoryColor(category: TransactionCategory): string {
    const colors = {
      [TransactionCategory.ANIMAL_PURCHASE]: "#3B82F6", // Azul
      [TransactionCategory.ANIMAL_SALE]: "#10B981", // Verde
      [TransactionCategory.FEED]: "#F59E0B", // Amarillo
      [TransactionCategory.VETERINARY]: "#EF4444", // Rojo
      [TransactionCategory.BREEDING]: "#8B5CF6", // Púrpura
      [TransactionCategory.EQUIPMENT]: "#6B7280", // Gris
      [TransactionCategory.LABOR]: "#EC4899", // Rosa
      [TransactionCategory.UTILITIES]: "#06B6D4", // Cian
      [TransactionCategory.INSURANCE]: "#84CC16", // Lima
      [TransactionCategory.TRANSPORTATION]: "#F97316", // Naranja
      [TransactionCategory.MAINTENANCE]: "#64748B", // Slate
      [TransactionCategory.SUPPLIES]: "#A855F7", // Violeta
      [TransactionCategory.PROFESSIONAL_SERVICES]: "#0EA5E9", // Sky
      [TransactionCategory.TAXES]: "#DC2626", // Rojo oscuro
      [TransactionCategory.INTEREST]: "#7C3AED", // Violeta oscuro
      [TransactionCategory.DEPRECIATION]: "#475569", // Gris oscuro
      [TransactionCategory.OTHER_INCOME]: "#22C55E", // Verde claro
      [TransactionCategory.OTHER_EXPENSE]: "#EF4444", // Rojo
    };

    return colors[category] || "#6B7280";
  }

  // Formatear moneda
  public formatCurrency(
    amount: number,
    currency: string = FINANCE_CONFIG.CURRENCY_DEFAULT
  ): string {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency,
    }).format(amount);
  }

  // Destructor
  public destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
    }

    window.removeEventListener("online", this.handleOnline.bind(this));
    window.removeEventListener("offline", this.handleOffline.bind(this));

    this.clearCache();
    this.pendingOperations = [];

    console.log("🔒 FinanceService destruido correctamente");
  }
}

// Instancia singleton del servicio financiero
export const financeService = new FinanceService();

// Exports adicionales
export {
  TransactionType,
  TransactionCategory,
  TransactionStatus,
  PaymentMethod,
  BudgetStatus,
  AssetCategory,
  ReportType,
  TRANSACTION_TYPE_LABELS,
  TRANSACTION_CATEGORY_LABELS,
};

export type {
  FinancialTransaction,
  Budget,
  Asset,
  CashFlow,
  ProfitLoss,
  ROIAnalysis,
  FinancialMetrics,
  FinancialReport,
};

// Export default para compatibilidad
export default financeService;
