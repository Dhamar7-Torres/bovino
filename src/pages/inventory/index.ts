// Módulo de Gestión de Inventario
// Sistema integral para gestión de medicamentos veterinarios, suministros y control de stock
// Desarrollado para el sector ganadero con control regulatorio y optimización automática

// =================================================================
// EXPORTACIONES PRINCIPALES DEL MÓDULO
// =================================================================

// Página principal del módulo (router y coordinador)
export { default as InventoryPage } from "./InventoryPage";

// Componentes principales del módulo
export { default as InventoryDashboard } from "./InventoryDashboard";
export { default as MedicineInventory } from "./MedicineInventory";
export { default as StockLevels } from "./StockLevels";
export { default as LowStockAlerts } from "./LowStockAlerts";
export { default as InventoryReports } from "./InventoryReports";

// =================================================================
// TIPOS Y INTERFACES PRINCIPALES
// =================================================================

// Estados del inventario
export enum InventoryStatus {
  IN_STOCK = "in_stock",
  LOW_STOCK = "low_stock",
  OUT_OF_STOCK = "out_of_stock",
  OVERSTOCKED = "overstocked",
  RESERVED = "reserved",
  EXPIRED = "expired",
  DAMAGED = "damaged",
  QUARANTINED = "quarantined",
  DISCONTINUED = "discontinued",
}

// Categorías de medicamentos veterinarios
export enum MedicineCategory {
  ANTIBIOTIC = "antibiotic",
  VACCINE = "vaccine",
  ANTIPARASITIC = "antiparasitic",
  ANTIINFLAMMATORY = "antiinflammatory",
  ANALGESIC = "analgesic",
  VITAMIN = "vitamin",
  MINERAL = "mineral",
  HORMONE = "hormone",
  ANESTHETIC = "anesthetic",
  ANTIDIARRHEAL = "antidiarrheal",
  RESPIRATORY = "respiratory",
  DERMATOLOGICAL = "dermatological",
  REPRODUCTIVE = "reproductive",
  IMMUNOMODULATOR = "immunomodulator",
  ANTISEPTIC = "antiseptic",
}

// Estados de stock
export enum StockStatus {
  OPTIMAL = "optimal",
  ADEQUATE = "adequate",
  LOW = "low",
  CRITICAL = "critical",
  OVERSTOCK = "overstock",
  OUT_OF_STOCK = "out_of_stock",
}

// Tipos de alertas de inventario
export enum AlertType {
  LOW_STOCK = "low_stock",
  OUT_OF_STOCK = "out_of_stock",
  OVERSTOCKED = "overstocked",
  EXPIRING_SOON = "expiring_soon",
  EXPIRED = "expired",
  NEGATIVE_STOCK = "negative_stock",
  SLOW_MOVING = "slow_moving",
  FAST_MOVING = "fast_moving",
  COST_VARIANCE = "cost_variance",
  QUALITY_ISSUE = "quality_issue",
}

// Prioridades de alertas
export enum AlertPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// Tipos de reportes de inventario
export enum InventoryReportType {
  STOCK_STATUS = "stock_status",
  INVENTORY_VALUATION = "inventory_valuation",
  MOVEMENT_HISTORY = "movement_history",
  ABC_ANALYSIS = "abc_analysis",
  TURNOVER_ANALYSIS = "turnover_analysis",
  EXPIRATION_REPORT = "expiration_report",
  LOW_STOCK_REPORT = "low_stock_report",
  PURCHASE_ANALYSIS = "purchase_analysis",
  COST_ANALYSIS = "cost_analysis",
  CYCLE_COUNT_REPORT = "cycle_count_report",
  SUPPLIER_PERFORMANCE = "supplier_performance",
  LOCATION_ANALYSIS = "location_analysis",
}

// Velocidad de rotación de stock
export enum StockVelocity {
  FAST = "fast", // >12 rotaciones/año
  MEDIUM = "medium", // 4-12 rotaciones/año
  SLOW = "slow", // 1-4 rotaciones/año
  OBSOLETE = "obsolete", // <1 rotación/año
}

// Niveles de riesgo
export enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// =================================================================
// INTERFACES PRINCIPALES DEL MÓDULO
// =================================================================

// Interfaz base para items de inventario
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  location: {
    warehouse: string;
    zone?: string;
    shelf: string;
    position: string;
  };
  status: InventoryStatus;
  lastMovementDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Interfaz para medicamentos veterinarios
export interface VeterinaryMedicine extends InventoryItem {
  genericName?: string;
  activeIngredient: string;
  concentration: string;
  registrationNumber: string;
  manufacturingDate?: Date;
  expirationDate: Date;
  batchNumber: string;
  requiresPrescription: boolean;
  isControlled: boolean;
  withdrawalPeriod: {
    meat: number; // días
    milk: number; // horas
  };
  storageConditions: string;
  requiresRefrigeration: boolean;
}

// Interfaz para niveles de stock
export interface StockLevel {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  safetyStock: number;
  optimalStock: number;
  turnoverRate: number;
  averageDemand: number;
  leadTime: number;
  serviceLevel: number;
  autoReorder: boolean;
  reorderQuantity: number;
  preferredSupplier: string;
  status: StockStatus;
  riskLevel: RiskLevel;
  velocity: StockVelocity;
}

// Interfaz para alertas de inventario
export interface InventoryAlert {
  id: string;
  itemId: string;
  itemName: string;
  alertType: AlertType;
  priority: AlertPriority;
  title: string;
  description: string;
  currentValue: number;
  threshold: number;
  status: "active" | "acknowledged" | "resolved" | "suppressed";
  createdAt: Date;
  lastUpdated: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  actions: string[];
  estimatedImpact: "minimal" | "low" | "medium" | "high" | "critical";
}

// Interfaz para reportes de inventario
export interface InventoryReport {
  id: string;
  name: string;
  type: InventoryReportType;
  description: string;
  status: "draft" | "generating" | "completed" | "failed";
  createdAt: Date;
  createdBy: string;
  lastGenerated?: Date;
  downloadUrl?: string;
  format: "pdf" | "excel" | "csv" | "json";
  parameters: Record<string, any>;
  fileSize?: number;
  recordCount?: number;
  isScheduled: boolean;
  nextScheduled?: Date;
}

// Interfaz para movimientos de inventario
export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  movementType: "entrada" | "salida" | "ajuste" | "transferencia";
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  date: Date;
  reason: string;
  location: string;
  performedBy: string;
  notes?: string;
  batchNumber?: string;
  referenceDocument?: string;
}

// =================================================================
// CONFIGURACIONES Y CONSTANTES DEL MÓDULO
// =================================================================

// Configuración por defecto del módulo de inventario
export const INVENTORY_MODULE_CONFIG = {
  // Configuración de alertas
  DEFAULT_ALERT_THRESHOLDS: {
    LOW_STOCK_PERCENTAGE: 20, // 20% del stock mínimo
    EXPIRATION_WARNING_DAYS: 30, // alertar 30 días antes
    CRITICAL_STOCK_DAYS: 7, // días críticos de stock
    OVERSTOCK_MULTIPLIER: 1.5, // 150% del máximo
  },

  // Configuración de rotación
  VELOCITY_THRESHOLDS: {
    FAST_MOVING: 12, // >12 rotaciones/año
    MEDIUM_MOVING: 4, // 4-12 rotaciones/año
    SLOW_MOVING: 1, // 1-4 rotaciones/año
    OBSOLETE: 0.5, // <0.5 rotaciones/año
  },

  // Configuración de auto-reorden
  AUTO_REORDER: {
    ENABLED_BY_DEFAULT: true,
    MIN_ORDER_AMOUNT: 100, // mínimo para generar orden
    LEAD_TIME_BUFFER_DAYS: 3, // días extra de seguridad
    SERVICE_LEVEL_TARGET: 95, // % objetivo de nivel de servicio
  },

  // Configuración de reportes
  REPORTS: {
    DEFAULT_CACHE_DURATION: 24, // horas
    MAX_EXPORT_RECORDS: 10000,
    SUPPORTED_FORMATS: ["pdf", "excel", "csv", "json"] as const,
    AUTO_CLEANUP_DAYS: 30, // días para limpiar reportes antiguos
  },

  // Configuración de medicamentos
  MEDICINES: {
    REQUIRE_BATCH_TRACKING: true,
    REQUIRE_EXPIRATION_DATE: true,
    TEMPERATURE_MONITORING: true,
    SENASA_VALIDATION: true,
    DEFAULT_WITHDRAWAL_PERIOD: 0, // días por defecto
  },
} as const;

// Etiquetas en español para la interfaz
export const INVENTORY_LABELS = {
  // Estados de inventario
  STATUS: {
    [InventoryStatus.IN_STOCK]: "En Stock",
    [InventoryStatus.LOW_STOCK]: "Stock Bajo",
    [InventoryStatus.OUT_OF_STOCK]: "Sin Stock",
    [InventoryStatus.OVERSTOCKED]: "Sobre Stock",
    [InventoryStatus.RESERVED]: "Reservado",
    [InventoryStatus.EXPIRED]: "Vencido",
    [InventoryStatus.DAMAGED]: "Dañado",
    [InventoryStatus.QUARANTINED]: "En Cuarentena",
    [InventoryStatus.DISCONTINUED]: "Descontinuado",
  },

  // Categorías de medicamentos
  MEDICINE_CATEGORY: {
    [MedicineCategory.ANTIBIOTIC]: "Antibiótico",
    [MedicineCategory.VACCINE]: "Vacuna",
    [MedicineCategory.ANTIPARASITIC]: "Antiparasitario",
    [MedicineCategory.ANTIINFLAMMATORY]: "Antiinflamatorio",
    [MedicineCategory.ANALGESIC]: "Analgésico",
    [MedicineCategory.VITAMIN]: "Vitamina",
    [MedicineCategory.MINERAL]: "Mineral",
    [MedicineCategory.HORMONE]: "Hormona",
    [MedicineCategory.ANESTHETIC]: "Anestésico",
    [MedicineCategory.ANTIDIARRHEAL]: "Antidiarreico",
    [MedicineCategory.RESPIRATORY]: "Respiratorio",
    [MedicineCategory.DERMATOLOGICAL]: "Dermatológico",
    [MedicineCategory.REPRODUCTIVE]: "Reproductivo",
    [MedicineCategory.IMMUNOMODULATOR]: "Inmunomodulador",
    [MedicineCategory.ANTISEPTIC]: "Antiséptico",
  },

  // Estados de stock
  STOCK_STATUS: {
    [StockStatus.OPTIMAL]: "Óptimo",
    [StockStatus.ADEQUATE]: "Adecuado",
    [StockStatus.LOW]: "Bajo",
    [StockStatus.CRITICAL]: "Crítico",
    [StockStatus.OVERSTOCK]: "Exceso",
    [StockStatus.OUT_OF_STOCK]: "Agotado",
  },

  // Tipos de alertas
  ALERT_TYPE: {
    [AlertType.LOW_STOCK]: "Stock Bajo",
    [AlertType.OUT_OF_STOCK]: "Sin Stock",
    [AlertType.OVERSTOCKED]: "Sobrestockeado",
    [AlertType.EXPIRING_SOON]: "Por Vencer",
    [AlertType.EXPIRED]: "Vencido",
    [AlertType.NEGATIVE_STOCK]: "Stock Negativo",
    [AlertType.SLOW_MOVING]: "Movimiento Lento",
    [AlertType.FAST_MOVING]: "Movimiento Rápido",
    [AlertType.COST_VARIANCE]: "Variación de Costo",
    [AlertType.QUALITY_ISSUE]: "Problema de Calidad",
  },

  // Prioridades de alertas
  ALERT_PRIORITY: {
    [AlertPriority.LOW]: "Baja",
    [AlertPriority.MEDIUM]: "Media",
    [AlertPriority.HIGH]: "Alta",
    [AlertPriority.CRITICAL]: "Crítica",
  },

  // Velocidades de stock
  STOCK_VELOCITY: {
    [StockVelocity.FAST]: "Rápida",
    [StockVelocity.MEDIUM]: "Media",
    [StockVelocity.SLOW]: "Lenta",
    [StockVelocity.OBSOLETE]: "Obsoleta",
  },

  // Niveles de riesgo
  RISK_LEVEL: {
    [RiskLevel.LOW]: "Bajo",
    [RiskLevel.MEDIUM]: "Medio",
    [RiskLevel.HIGH]: "Alto",
    [RiskLevel.CRITICAL]: "Crítico",
  },
} as const;

// Colores para los diferentes estados y categorías
export const INVENTORY_COLORS = {
  // Colores para estados de inventario
  STATUS: {
    [InventoryStatus.IN_STOCK]: "#22c55e",
    [InventoryStatus.LOW_STOCK]: "#f59e0b",
    [InventoryStatus.OUT_OF_STOCK]: "#ef4444",
    [InventoryStatus.OVERSTOCKED]: "#8b5cf6",
    [InventoryStatus.RESERVED]: "#3b82f6",
    [InventoryStatus.EXPIRED]: "#dc2626",
    [InventoryStatus.DAMAGED]: "#f97316",
    [InventoryStatus.QUARANTINED]: "#6b7280",
    [InventoryStatus.DISCONTINUED]: "#4b5563",
  },

  // Colores para prioridades de alertas
  ALERT_PRIORITY: {
    [AlertPriority.LOW]: "#3b82f6",
    [AlertPriority.MEDIUM]: "#f59e0b",
    [AlertPriority.HIGH]: "#f97316",
    [AlertPriority.CRITICAL]: "#ef4444",
  },

  // Colores para velocidades de stock
  VELOCITY: {
    [StockVelocity.FAST]: "#22c55e",
    [StockVelocity.MEDIUM]: "#3b82f6",
    [StockVelocity.SLOW]: "#f59e0b",
    [StockVelocity.OBSOLETE]: "#ef4444",
  },

  // Colores para niveles de riesgo
  RISK: {
    [RiskLevel.LOW]: "#22c55e",
    [RiskLevel.MEDIUM]: "#f59e0b",
    [RiskLevel.HIGH]: "#f97316",
    [RiskLevel.CRITICAL]: "#ef4444",
  },
} as const;

// =================================================================
// UTILIDADES Y FUNCIONES AUXILIARES
// =================================================================

// Función para formatear moneda mexicana
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount);
};

// Función para formatear fechas en español
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

// Función para formatear fecha y hora
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

// Función para calcular días hasta vencimiento
export const getDaysToExpiry = (expirationDate: Date): number => {
  const today = new Date();
  const timeDiff = expirationDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

// Función para determinar el estado de stock basado en niveles
export const determineStockStatus = (
  currentStock: number,
  minStock: number,
  maxStock: number,
  optimalStock?: number
): StockStatus => {
  if (currentStock <= 0) return StockStatus.OUT_OF_STOCK;
  if (currentStock <= minStock * 0.5) return StockStatus.CRITICAL;
  if (currentStock <= minStock) return StockStatus.LOW;
  if (currentStock > maxStock) return StockStatus.OVERSTOCK;
  if (
    optimalStock &&
    currentStock >= optimalStock * 0.8 &&
    currentStock <= optimalStock * 1.2
  ) {
    return StockStatus.OPTIMAL;
  }
  return StockStatus.ADEQUATE;
};

// Función para determinar la velocidad de rotación
export const determineStockVelocity = (turnoverRate: number): StockVelocity => {
  if (turnoverRate >= INVENTORY_MODULE_CONFIG.VELOCITY_THRESHOLDS.FAST_MOVING) {
    return StockVelocity.FAST;
  }
  if (
    turnoverRate >= INVENTORY_MODULE_CONFIG.VELOCITY_THRESHOLDS.MEDIUM_MOVING
  ) {
    return StockVelocity.MEDIUM;
  }
  if (turnoverRate >= INVENTORY_MODULE_CONFIG.VELOCITY_THRESHOLDS.SLOW_MOVING) {
    return StockVelocity.SLOW;
  }
  return StockVelocity.OBSOLETE;
};

// Función para calcular el nivel de riesgo
export const calculateRiskLevel = (
  status: StockStatus,
  daysToExpiry?: number,
  turnoverRate?: number
): RiskLevel => {
  // Riesgo crítico
  if (status === StockStatus.OUT_OF_STOCK || status === StockStatus.CRITICAL) {
    return RiskLevel.CRITICAL;
  }

  // Riesgo por vencimiento
  if (daysToExpiry !== undefined && daysToExpiry <= 7) {
    return RiskLevel.CRITICAL;
  }
  if (daysToExpiry !== undefined && daysToExpiry <= 30) {
    return RiskLevel.HIGH;
  }

  // Riesgo por stock bajo
  if (status === StockStatus.LOW) {
    return RiskLevel.HIGH;
  }

  // Riesgo por baja rotación
  if (
    turnoverRate !== undefined &&
    turnoverRate < INVENTORY_MODULE_CONFIG.VELOCITY_THRESHOLDS.SLOW_MOVING
  ) {
    return RiskLevel.MEDIUM;
  }

  return RiskLevel.LOW;
};

// Función para validar número de registro SENASA
export const validateSenasaNumber = (registrationNumber: string): boolean => {
  // Patrón básico para números de registro SENASA
  const senasaPattern = /^SENASA-\d{6}$/;
  return senasaPattern.test(registrationNumber);
};

// Función para calcular el punto de reorden óptimo
export const calculateOptimalReorderPoint = (
  averageDemand: number,
  leadTime: number,
  safetyStock: number,
  serviceLevel: number = 95
): number => {
  // Fórmula: (Demanda promedio × Tiempo de entrega) + Stock de seguridad
  const demandDuringLeadTime = averageDemand * (leadTime / 30); // convertir a mensual
  const serviceFactor = serviceLevel / 100;
  return Math.ceil(demandDuringLeadTime * serviceFactor + safetyStock);
};

// Función para calcular la cantidad óptima de pedido (EOQ)
export const calculateEconomicOrderQuantity = (
  annualDemand: number,
  orderingCost: number,
  holdingCost: number
): number => {
  // Fórmula EOQ: sqrt((2 × Demanda anual × Costo de pedido) / Costo de mantenimiento)
  return Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / holdingCost));
};

// =================================================================
// METADATOS DEL MÓDULO
// =================================================================

export const INVENTORY_MODULE_METADATA = {
  name: "Gestión de Inventario",
  version: "2.1.0",
  description:
    "Sistema integral de gestión de inventario para el sector ganadero",
  author: "UJAT - Universidad Juárez Autónoma de Tabasco",
  lastUpdated: "2025-07-12",

  // Funcionalidades incluidas
  features: [
    "Dashboard con métricas en tiempo real",
    "Gestión especializada de medicamentos veterinarios",
    "Optimización automática de niveles de stock",
    "Sistema de alertas inteligente con 10 tipos",
    "Generación de 12 tipos de reportes especializados",
    "Control regulatorio SENASA",
    "Auto-reorden con múltiples proveedores",
    "Análisis ABC y rotación de inventario",
    "Gestión de lotes y trazabilidad",
    "Alertas de vencimiento y calidad",
  ],

  // Componentes incluidos
  components: [
    "InventoryPage - Coordinador principal del módulo",
    "InventoryDashboard - Dashboard con métricas principales",
    "MedicineInventory - Gestión de medicamentos veterinarios",
    "StockLevels - Optimización de niveles y auto-reorden",
    "LowStockAlerts - Sistema de alertas en tiempo real",
    "InventoryReports - Generación de reportes especializados",
  ],

  // Rutas del módulo
  routes: [
    "/inventory - Vista principal del módulo",
    "/inventory/dashboard - Dashboard de inventario",
    "/inventory/medicine - Inventario de medicamentos",
    "/inventory/stock-levels - Gestión de niveles de stock",
    "/inventory/low-stock-alerts - Alertas de stock bajo",
    "/inventory/reports - Reportes de inventario",
  ],
} as const;

// =================================================================
// EXPORTACIÓN POR DEFECTO
// =================================================================

// Exportar la página principal del módulo como default
export { default } from "./InventoryPage";
