// Tipos relacionados con finanzas y aspectos económicos del ganado

import { BaseEntity } from "./common";

// Transacción financiera principal
export interface FinancialTransaction extends BaseEntity {
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
  relatedEntityType?: string; // 'bovine', 'batch', 'farm'
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
  accountingPeriod: string; // YYYY-MM
}

// Información del proveedor
export interface VendorInfo {
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

// Información del cliente
export interface CustomerInfo {
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

// Presupuesto
export interface Budget extends BaseEntity {
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

// Categoría de presupuesto
export interface BudgetCategory {
  category: TransactionCategory;
  subcategory?: string;
  budgetedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  variance: number;
  variancePercentage: number;
  monthlyDistribution?: MonthlyBudget[];
}

// Presupuesto mensual
export interface MonthlyBudget {
  month: string; // YYYY-MM
  budgetedAmount: number;
  spentAmount: number;
  variance: number;
}

// Varianza del presupuesto
export interface BudgetVariance {
  totalVariance: number;
  variancePercentage: number;
  favorableVariance: number;
  unfavorableVariance: number;
  categoryVariances: CategoryVariance[];
}

// Varianza por categoría
export interface CategoryVariance {
  category: TransactionCategory;
  budgeted: number;
  actual: number;
  variance: number;
  variancePercentage: number;
  isFavorable: boolean;
}

// Flujo de caja
export interface CashFlow extends BaseEntity {
  date: Date;
  openingBalance: number;
  closingBalance: number;
  totalInflows: number;
  totalOutflows: number;
  netCashFlow: number;
  inflows: CashFlowItem[];
  outflows: CashFlowItem[];
  currency: string;
  period: string; // YYYY-MM-DD
}

// Elemento de flujo de caja
export interface CashFlowItem {
  category: TransactionCategory;
  subcategory?: string;
  amount: number;
  description: string;
  isRecurring: boolean;
  frequency?: RecurrenceFrequency;
}

// Activo
export interface Asset extends BaseEntity {
  name: string;
  category: AssetCategory;
  type: AssetType;
  description?: string;
  purchaseDate: Date;
  purchasePrice: number;
  currentValue: number;
  depreciationMethod: DepreciationMethod;
  depreciationRate: number; // porcentaje anual
  usefulLife: number; // años
  salvageValue: number;
  accumulatedDepreciation: number;
  location?: string;
  condition: AssetCondition;
  maintenanceSchedule?: MaintenanceSchedule[];
  insuranceInfo?: AssetInsurance;
  warranty?: WarrantyInfo;
  serialNumber?: string;
  supplier?: string;
  tags?: string[];
}

// Programa de mantenimiento
export interface MaintenanceSchedule {
  id: string;
  type: MaintenanceType;
  description: string;
  frequency: RecurrenceFrequency;
  lastPerformed?: Date;
  nextDue: Date;
  estimatedCost: number;
  isOverdue: boolean;
}

// Seguro de activo
export interface AssetInsurance {
  provider: string;
  policyNumber: string;
  coverage: number;
  premium: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

// Información de garantía
export interface WarrantyInfo {
  provider: string;
  startDate: Date;
  endDate: Date;
  coverage: string;
  isActive: boolean;
}

// Pasivo
export interface Liability extends BaseEntity {
  name: string;
  type: LiabilityType;
  category: LiabilityCategory;
  description?: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  startDate: Date;
  maturityDate?: Date;
  paymentFrequency: PaymentFrequency;
  monthlyPayment?: number;
  creditor: string;
  collateral?: string;
  status: LiabilityStatus;
  paymentHistory: PaymentRecord[];
}

// Registro de pago
export interface PaymentRecord {
  id: string;
  date: Date;
  amount: number;
  principal: number;
  interest: number;
  balance: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  isLate: boolean;
  lateFee?: number;
}

// Reporte financiero
export interface FinancialReport extends BaseEntity {
  name: string;
  type: ReportType;
  period: ReportPeriod;
  startDate: Date;
  endDate: Date;
  currency: string;
  data: ReportData;
  status: ReportStatus;
  generatedBy: string;
  parameters: ReportParameters;
}

// Datos del reporte
export interface ReportData {
  summary: ReportSummary;
  details: ReportDetail[];
  charts?: ChartData[];
  tables?: TableData[];
  comparisons?: ComparisonData[];
}

// Resumen del reporte
export interface ReportSummary {
  totalRevenue?: number;
  totalExpenses?: number;
  netIncome?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  equity?: number;
  cashFlow?: number;
  profitMargin?: number;
  returnOnAssets?: number;
  returnOnEquity?: number;
}

// Detalle del reporte
export interface ReportDetail {
  category: string;
  subcategory?: string;
  amount: number;
  percentage: number;
  items?: ReportLineItem[];
}

// Línea de reporte
export interface ReportLineItem {
  description: string;
  amount: number;
  date?: Date;
  reference?: string;
}

// Datos de gráfico
export interface ChartData {
  type: ChartType;
  title: string;
  data: ChartDataPoint[];
  config?: ChartConfig;
}

// Punto de datos del gráfico
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
  category?: string;
}

// Configuración del gráfico
export interface ChartConfig {
  showLegend: boolean;
  showValues: boolean;
  colorScheme: string[];
  height?: number;
  width?: number;
}

// Datos de tabla
export interface TableData {
  title: string;
  headers: string[];
  rows: TableRow[];
  totals?: TableRow;
}

// Fila de tabla
export interface TableRow {
  cells: TableCell[];
}

// Celda de tabla
export interface TableCell {
  value: any;
  type: "text" | "number" | "currency" | "date" | "percentage";
  format?: string;
  alignment?: "left" | "center" | "right";
}

// Datos de comparación
export interface ComparisonData {
  title: string;
  periods: ComparisonPeriod[];
  metrics: ComparisonMetric[];
}

// Período de comparación
export interface ComparisonPeriod {
  label: string;
  startDate: Date;
  endDate: Date;
}

// Métrica de comparación
export interface ComparisonMetric {
  name: string;
  values: number[];
  variance: number[];
  variancePercentage: number[];
  trend: "up" | "down" | "stable";
}

// Parámetros del reporte
export interface ReportParameters {
  includeSubcategories: boolean;
  groupByMonth: boolean;
  includeComparisons: boolean;
  comparisonPeriods?: string[];
  filters?: ReportFilter[];
  format: "pdf" | "excel" | "csv" | "json";
}

// Filtro del reporte
export interface ReportFilter {
  field: string;
  operator: "equals" | "contains" | "greater_than" | "less_than" | "between";
  value: any;
}

// Análisis de rentabilidad
export interface ProfitabilityAnalysis extends BaseEntity {
  period: string;
  totalRevenue: number;
  totalCosts: number;
  grossProfit: number;
  grossMargin: number;
  operatingExpenses: number;
  operatingProfit: number;
  operatingMargin: number;
  netProfit: number;
  netMargin: number;
  breakdownByCategory: CategoryProfitability[];
  breakdownByAnimal?: AnimalProfitability[];
  trends: ProfitabilityTrend[];
}

// Rentabilidad por categoría
export interface CategoryProfitability {
  category: TransactionCategory;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  profitPerUnit?: number;
}

// Rentabilidad por animal
export interface AnimalProfitability {
  animalId: string;
  earTag: string;
  revenue: number;
  costs: number;
  profit: number;
  roi: number;
  daysSincePurchase: number;
  profitPerDay: number;
}

// Tendencia de rentabilidad
export interface ProfitabilityTrend {
  period: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  changeFromPrevious: number;
  changePercentage: number;
}

// Enums
export enum TransactionType {
  INCOME = "income",
  EXPENSE = "expense",
  TRANSFER = "transfer",
  ADJUSTMENT = "adjustment",
}

export enum TransactionCategory {
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

export enum TransactionStatus {
  PENDING = "pending",
  APPROVED = "approved",
  PAID = "paid",
  CANCELLED = "cancelled",
  OVERDUE = "overdue",
}

export enum PaymentMethod {
  CASH = "cash",
  CHECK = "check",
  BANK_TRANSFER = "bank_transfer",
  CREDIT_CARD = "credit_card",
  DEBIT_CARD = "debit_card",
  DIGITAL_WALLET = "digital_wallet",
  FINANCING = "financing",
  BARTER = "barter",
}

export enum VendorCategory {
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

export enum CustomerType {
  INDIVIDUAL = "individual",
  FARM = "farm",
  PROCESSOR = "processor",
  RETAILER = "retailer",
  EXPORT = "export",
  GOVERNMENT = "government",
}

export enum BudgetPeriod {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUAL = "annual",
  CUSTOM = "custom",
}

export enum BudgetStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum AssetCategory {
  LIVESTOCK = "livestock",
  EQUIPMENT = "equipment",
  INFRASTRUCTURE = "infrastructure",
  VEHICLES = "vehicles",
  LAND = "land",
  BUILDINGS = "buildings",
  TECHNOLOGY = "technology",
}

export enum AssetType {
  FIXED = "fixed",
  CURRENT = "current",
  INTANGIBLE = "intangible",
}

export enum AssetCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
  BROKEN = "broken",
}

export enum DepreciationMethod {
  STRAIGHT_LINE = "straight_line",
  DECLINING_BALANCE = "declining_balance",
  DOUBLE_DECLINING = "double_declining",
  UNITS_OF_PRODUCTION = "units_of_production",
}

export enum MaintenanceType {
  PREVENTIVE = "preventive",
  CORRECTIVE = "corrective",
  PREDICTIVE = "predictive",
  EMERGENCY = "emergency",
}

export enum LiabilityType {
  LOAN = "loan",
  MORTGAGE = "mortgage",
  LINE_OF_CREDIT = "line_of_credit",
  ACCOUNTS_PAYABLE = "accounts_payable",
  ACCRUED_EXPENSES = "accrued_expenses",
  TAXES_PAYABLE = "taxes_payable",
}

export enum LiabilityCategory {
  SHORT_TERM = "short_term",
  LONG_TERM = "long_term",
}

export enum LiabilityStatus {
  ACTIVE = "active",
  PAID_OFF = "paid_off",
  DEFAULTED = "defaulted",
  RESTRUCTURED = "restructured",
}

export enum PaymentFrequency {
  WEEKLY = "weekly",
  BIWEEKLY = "biweekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  SEMIANNUAL = "semiannual",
  ANNUAL = "annual",
}

export enum RecurrenceFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUALLY = "annually",
}

export enum ReportType {
  INCOME_STATEMENT = "income_statement",
  BALANCE_SHEET = "balance_sheet",
  CASH_FLOW = "cash_flow",
  BUDGET_VARIANCE = "budget_variance",
  PROFITABILITY = "profitability",
  TAX = "tax",
  CUSTOM = "custom",
}

export enum ReportPeriod {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  ANNUAL = "annual",
  CUSTOM = "custom",
}

export enum ReportStatus {
  GENERATING = "generating",
  COMPLETED = "completed",
  FAILED = "failed",
  SCHEDULED = "scheduled",
}

export enum ChartType {
  LINE = "line",
  BAR = "bar",
  PIE = "pie",
  DONUT = "donut",
  AREA = "area",
  SCATTER = "scatter",
}

// Etiquetas en español
export const TRANSACTION_CATEGORY_LABELS = {
  [TransactionCategory.ANIMAL_PURCHASE]: "Compra de Animales",
  [TransactionCategory.ANIMAL_SALE]: "Venta de Animales",
  [TransactionCategory.FEED]: "Alimentación",
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

export const PAYMENT_METHOD_LABELS = {
  [PaymentMethod.CASH]: "Efectivo",
  [PaymentMethod.CHECK]: "Cheque",
  [PaymentMethod.BANK_TRANSFER]: "Transferencia Bancaria",
  [PaymentMethod.CREDIT_CARD]: "Tarjeta de Crédito",
  [PaymentMethod.DEBIT_CARD]: "Tarjeta de Débito",
  [PaymentMethod.DIGITAL_WALLET]: "Monedero Digital",
  [PaymentMethod.FINANCING]: "Financiamiento",
  [PaymentMethod.BARTER]: "Trueque",
} as const;
