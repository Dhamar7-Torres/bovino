// Barrel export para el módulo de finanzas
// Este archivo facilita las importaciones desde otros módulos

// Componente principal del módulo de finanzas
export { default as FinancesPage } from "./FinancesPage";

// Componentes hijos del módulo de finanzas
export { default as IncomeTracker } from "./IncomeTracker";
export { default as ExpenseTracker } from "./ExpenseTracker";

// Tipos e interfaces específicas del módulo (si se requieren en otros módulos)
export type FinancialPeriod = "weekly" | "monthly" | "quarterly" | "yearly";
export type IncomeCategory =
  | "venta_ganado"
  | "productos_lacteos"
  | "servicios_veterinarios"
  | "otros";
export type ExpenseCategory =
  | "vacunacion"
  | "tratamientos"
  | "alimentacion"
  | "instalaciones"
  | "transporte"
  | "otros";
export type PaymentStatus = "paid" | "pending" | "overdue";
export type PaymentMethod = "efectivo" | "transferencia" | "cheque" | "credito";

// Interfaces principales para uso externo
export interface FinancialRecord {
  id: string;
  date: string;
  description: string;
  amount: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: PaymentStatus;
}

export interface IncomeRecord extends FinancialRecord {
  category: IncomeCategory;
  animalId?: string;
}

export interface ExpenseRecord extends FinancialRecord {
  category: ExpenseCategory;
  supplier: string;
  paymentMethod: PaymentMethod;
  animalId?: string;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  roi: number;
}

export interface MonthlyFinancialData {
  month: string;
  income: number;
  expenses: number;
  profit: number;
  margin: number;
}

// Constantes útiles para el módulo
export const INCOME_CATEGORIES = [
  { id: "venta_ganado", label: "Venta de Ganado", color: "#10B981" },
  { id: "productos_lacteos", label: "Productos Lácteos", color: "#3B82F6" },
  {
    id: "servicios_veterinarios",
    label: "Servicios Veterinarios",
    color: "#8B5CF6",
  },
  { id: "otros", label: "Otros Ingresos", color: "#F59E0B" },
] as const;

export const EXPENSE_CATEGORIES = [
  { id: "vacunacion", label: "Vacunación", color: "#3B82F6" },
  { id: "tratamientos", label: "Tratamientos", color: "#8B5CF6" },
  { id: "alimentacion", label: "Alimentación", color: "#F97316" },
  { id: "instalaciones", label: "Instalaciones", color: "#EF4444" },
  { id: "transporte", label: "Transporte", color: "#10B981" },
  { id: "otros", label: "Otros Gastos", color: "#6B7280" },
] as const;

export const PAYMENT_METHODS = [
  { id: "efectivo", label: "Efectivo" },
  { id: "transferencia", label: "Transferencia Bancaria" },
  { id: "cheque", label: "Cheque" },
  { id: "credito", label: "Línea de Crédito" },
] as const;

export const PAYMENT_STATUS = [
  { id: "paid", label: "Pagado", color: "#10B981" },
  { id: "pending", label: "Pendiente", color: "#F59E0B" },
  { id: "overdue", label: "Vencido", color: "#EF4444" },
] as const;

// Funciones de utilidad para el módulo de finanzas
export const formatCurrency = (
  value: number,
  currency: string = "MXN"
): string => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

export const calculateProfitMargin = (
  income: number,
  expenses: number
): number => {
  if (income === 0) return 0;
  return ((income - expenses) / income) * 100;
};

export const calculateROI = (profit: number, investment: number): number => {
  if (investment === 0) return 0;
  return (profit / investment) * 100;
};

export const getFinancialHealthStatus = (
  profitMargin: number
): {
  status: "excellent" | "good" | "warning" | "poor";
  color: string;
  message: string;
} => {
  if (profitMargin >= 30) {
    return {
      status: "excellent",
      color: "#10B981",
      message: "Excelente salud financiera",
    };
  } else if (profitMargin >= 25) {
    return {
      status: "good",
      color: "#3B82F6",
      message: "Buena rentabilidad",
    };
  } else if (profitMargin >= 15) {
    return {
      status: "warning",
      color: "#F59E0B",
      message: "Márgenes en declive - requiere atención",
    };
  } else {
    return {
      status: "poor",
      color: "#EF4444",
      message: "Márgenes críticos - acción inmediata",
    };
  }
};

// Configuración por defecto del módulo
export const FINANCES_CONFIG = {
  defaultCurrency: "MXN",
  defaultLocale: "es-MX",
  defaultPeriod: "monthly" as FinancialPeriod,
  refreshInterval: 60000, // 1 minuto en milisegundos
  chartColors: {
    income: "#10B981",
    expenses: "#EF4444",
    profit: "#3B82F6",
    margin: "#F59E0B",
  },
  notifications: {
    lowProfitMargin: 15,
    highExpenseIncrease: 20,
    overduePayments: true,
  },
} as const;
