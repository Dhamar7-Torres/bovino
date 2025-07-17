// =================================================================
// MÓDULO DE REPORTES - EXPORTACIONES PRINCIPALES
// =================================================================
// Archivo principal de exportación para el sistema de reportes
// Facilita la importación de componentes desde otras partes de la aplicación

import HealthReports from './HealthReports';
import InventoryReports from './InventoryReports';
import ProductionReports from './ProductionReports';
import ReportDashboard from './ReportDashboard';
import ReportsPage from './ReportsPage';

// Componentes principales de reportes (implementados)
export { default as ReportsPage } from './ReportsPage';
export { default as ReportDashboard } from './ReportDashboard';
export { default as HealthReports } from './HealthReports';
export { default as InventoryReports } from './InventoryReports';
export { default as ProductionReports } from './ProductionReports';

// =================================================================
// TIPOS Y INTERFACES BÁSICAS (implementación futura)
// =================================================================

// Tipos generales de reportes
export interface ReportSummary {
  id: string;
  title: string;
  type: string;
  category: string;
  status: "completed" | "pending" | "error" | "scheduled";
  lastGenerated: Date;
  nextScheduled?: Date;
  size: string;
  format: string;
  description: string;
  coveragePercentage: number;
  totalRecords: number;
}

export interface QuickMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

export interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  count: number;
  color: string;
}

// Tipos específicos de salud
export interface VaccinationRecord {
  id: string;
  animalId: string;
  animalTag: string;
  vaccineType: string;
  date: Date;
  nextDue?: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  veterinarian: string;
  status: "completed" | "pending" | "overdue";
  notes?: string;
}

export interface DiseaseCase {
  id: string;
  animalId: string;
  animalTag: string;
  diseaseType: string;
  severity: "mild" | "moderate" | "severe" | "critical";
  diagnosisDate: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  symptoms: string[];
  treatment: string;
  status: "active" | "recovering" | "recovered" | "deceased";
  veterinarian: string;
}

export interface HealthAlert {
  id: string;
  type: "vaccination_due" | "disease_outbreak" | "temperature_anomaly" | "behavior_change";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  animalIds: string[];
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: Date;
  resolvedAt?: Date;
  status: "active" | "resolved" | "dismissed";
}

export interface HealthMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  critical?: boolean;
}

// Tipos específicos de inventario
export interface InventoryItem {
  id: string;
  name: string;
  category: "medicine" | "supplement" | "equipment" | "feed";
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  expirationDate?: Date;
  supplier: string;
  location: {
    warehouse: string;
    section: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  lastMovement: Date;
  status: "in_stock" | "low_stock" | "out_of_stock" | "expired" | "near_expiry";
}

export interface InventoryMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: "in" | "out" | "transfer" | "adjustment";
  quantity: number;
  unit: string;
  reason: string;
  date: Date;
  responsible: string;
  location: {
    from?: string;
    to: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  cost?: number;
  notes?: string;
}

export interface InventoryAlert {
  id: string;
  type: "low_stock" | "out_of_stock" | "expiry_warning" | "expired" | "overstock";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  itemIds: string[];
  location: {
    warehouse: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Date;
  resolvedAt?: Date;
  status: "active" | "resolved" | "dismissed";
}

export interface InventoryMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  critical?: boolean;
}

// Tipos específicos de producción
export interface ProductionRecord {
  id: string;
  animalId: string;
  animalTag: string;
  type: "milk" | "weight" | "breeding" | "feed_efficiency";
  value: number;
  unit: string;
  date: Date;
  location: {
    sector: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  measuredBy: string;
  notes?: string;
  quality?: "excellent" | "good" | "average" | "poor";
}

export interface AnimalProductivity {
  id: string;
  animalTag: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  category: "dairy" | "beef" | "breeding";
  productivity: {
    milkPerDay?: number;
    weightGain?: number;
    feedConversion?: number;
    reproductiveEfficiency?: number;
  };
  location: {
    currentSector: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  lastUpdate: Date;
  status: "active" | "dry" | "pregnant" | "sick" | "sold";
  performance: "excellent" | "good" | "average" | "poor";
}

export interface ProductionAlert {
  id: string;
  type: "low_production" | "weight_loss" | "feed_efficiency" | "breeding_issue";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  animalIds: string[];
  affectedMetric: string;
  threshold: number;
  currentValue: number;
  location: {
    sector: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Date;
  resolvedAt?: Date;
  status: "active" | "resolved" | "dismissed";
}

export interface BreedingRecord {
  id: string;
  femaleId: string;
  femaleTag: string;
  maleId?: string;
  maleTag?: string;
  breedingDate: Date;
  expectedCalvingDate: Date;
  actualCalvingDate?: Date;
  breedingMethod: "natural" | "artificial";
  success: boolean;
  location: {
    sector: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  veterinarian: string;
  notes?: string;
}

export interface ProductionMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  target?: string;
  critical?: boolean;
}

// Tipos del sistema principal
export interface ReportModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  color: string;
  bgColor: string;
  stats: {
    totalReports: number;
    lastUpdate: string;
    status: "active" | "pending" | "error";
  };
  quickActions?: QuickAction[];
}

export interface QuickAction {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  color: string;
}

export interface RecentActivity {
  id: string;
  type: "report_generated" | "alert_created" | "data_updated" | "export_completed";
  title: string;
  description: string;
  timestamp: Date;
  module: string;
  user: string;
  status: "success" | "warning" | "error";
}

export interface SystemMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

// =================================================================
// CONSTANTES Y CONFIGURACIONES
// =================================================================

// Tipos de reportes disponibles
export const REPORT_TYPES = {
  HEALTH_OVERVIEW: "health_overview",
  VACCINATION_COVERAGE: "vaccination_coverage", 
  DISEASE_ANALYSIS: "disease_analysis",
  PRODUCTION_METRICS: "production_metrics",
  FINANCIAL_SUMMARY: "financial_summary",
  BREEDING_PERFORMANCE: "breeding_performance",
  INVENTORY_STATUS: "inventory_status",
  GEOGRAPHIC_DISTRIBUTION: "geographic_distribution"
} as const;

// Categorías de reportes
export const REPORT_CATEGORIES = {
  HEALTH: "health",
  PRODUCTION: "production",
  FINANCIAL: "financial", 
  INVENTORY: "inventory",
  GEOGRAPHIC: "geographic",
  BREEDING: "breeding"
} as const;

// Formatos de exportación
export const EXPORT_FORMATS = {
  PDF: "pdf",
  EXCEL: "excel",
  CSV: "csv",
  JSON: "json"
} as const;

// Estados de reportes
export const REPORT_STATUSES = {
  COMPLETED: "completed",
  PENDING: "pending", 
  ERROR: "error",
  SCHEDULED: "scheduled"
} as const;

// Prioridades de alertas
export const ALERT_PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high", 
  CRITICAL: "critical"
} as const;

// Tipos de actividad
export const ACTIVITY_TYPES = {
  REPORT_GENERATED: "report_generated",
  ALERT_CREATED: "alert_created",
  DATA_UPDATED: "data_updated",
  EXPORT_COMPLETED: "export_completed"
} as const;

// Unidades de métricas
export const METRIC_UNITS = {
  LITERS: "litros",
  KILOGRAMS: "kg",
  PERCENTAGE: "%",
  UNITS: "unidades",
  DAYS: "días"
} as const;

// Niveles de rendimiento
export const PERFORMANCE_LEVELS = {
  EXCELLENT: "excellent",
  GOOD: "good", 
  AVERAGE: "average",
  POOR: "poor"
} as const;

// Categorías de inventario
export const INVENTORY_CATEGORIES = {
  MEDICINE: "medicine",
  SUPPLEMENT: "supplement",
  EQUIPMENT: "equipment", 
  FEED: "feed"
} as const;

// =================================================================
// FUNCIONES BÁSICAS DE UTILIDAD
// =================================================================

// Funciones de formateo básicas
export const formatReportData = (data: any) => {
  // Implementación básica de formateo
  return data;
};

export const formatMetricValue = (value: number, unit: string) => {
  return `${value} ${unit}`;
};

export const formatDateRange = (startDate: Date, endDate: Date) => {
  return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
};

// =================================================================
// CONFIGURACIÓN DEL MÓDULO
// =================================================================

// Configuración por defecto del módulo de reportes
export const REPORTS_MODULE_CONFIG = {
  // Identificador del módulo
  moduleId: 'reports',
  
  // Nombre del módulo
  moduleName: 'Sistema de Reportes',
  
  // Versión del módulo
  version: '1.0.0',
  
  // Rutas principales del módulo
  routes: {
    main: '/reports',
    dashboard: '/reports/dashboard',
    health: '/reports/health',
    production: '/reports/production',
    inventory: '/reports/inventory',
    financial: '/reports/financial',
    geographic: '/reports/geographic'
  },
  
  // Configuraciones por defecto
  defaults: {
    // Configuración de paginación
    pagination: {
      pageSize: 20,
      maxPages: 100
    },
    
    // Configuración de filtros
    filters: {
      dateRange: '30d',
      category: 'all',
      status: 'all'
    },
    
    // Configuración de exportación
    export: {
      format: 'pdf',
      includeCharts: true,
      includeRawData: false
    },
    
    // Configuración de actualización automática
    autoRefresh: {
      enabled: true,
      interval: 300000 // 5 minutos
    }
  },
  
  // Permisos requeridos
  permissions: {
    read: ['reports:read'],
    write: ['reports:write'],
    export: ['reports:export'],
    admin: ['reports:admin']
  }
} as const;

// =================================================================
// METADATA DEL MÓDULO
// =================================================================

// Información del módulo para el sistema
export const REPORTS_MODULE_METADATA = {
  // Información básica
  info: {
    name: 'Sistema de Reportes y Análisis',
    description: 'Módulo integral para generación, gestión y análisis de reportes del sistema ganadero',
    author: 'Sistema Ganadero',
    category: 'analytics',
    tags: ['reportes', 'análisis', 'métricas', 'dashboard']
  },
  
  // Características del módulo
  features: [
    'Dashboard centralizado de reportes',
    'Reportes de salud y vacunación',
    'Reportes de producción y rendimiento',
    'Reportes de inventario y suministros',
    'Análisis geográfico y mapas',
    'Reportes financieros y costos',
    'Exportación múltiple (PDF, Excel, CSV)',
    'Alertas automáticas y notificaciones',
    'Métricas en tiempo real',
    'Análisis predictivo con IA'
  ],
  
  // Dependencias del módulo
  dependencies: {
    // Bibliotecas principales
    react: '^18.0.0',
    'react-router-dom': '^6.0.0',
    'framer-motion': '^10.0.0',
    
    // Bibliotecas de gráficos
    recharts: '^2.0.0',
    
    // Bibliotecas de mapas
    leaflet: '^1.9.0',
    
    // Bibliotecas de fechas
    'date-fns': '^2.29.0'
  }
} as const;

// =================================================================
// SERVICIOS BÁSICOS (IMPLEMENTACIÓN FUTURA)
// =================================================================

// Placeholder para servicios que se implementarán más adelante
export const ReportService = {
  initialize: async () => {
    console.log('ReportService initialized');
  },
  cleanup: async () => {
    console.log('ReportService cleaned up');
  }
};

export const MetricService = {
  initialize: async () => {
    console.log('MetricService initialized');
  },
  cleanup: async () => {
    console.log('MetricService cleaned up');
  }
};

export const AlertService = {
  initialize: async () => {
    console.log('AlertService initialized');
  },
  cleanup: async () => {
    console.log('AlertService cleaned up');
  }
};

export const ExportService = {
  initialize: async () => {
    console.log('ExportService initialized');
  },
  cleanup: async () => {
    console.log('ExportService cleaned up');
  }
};

// =================================================================
// INICIALIZACIÓN DEL MÓDULO
// =================================================================

// Función de inicialización del módulo de reportes
export const initializeReportsModule = async (config?: Partial<typeof REPORTS_MODULE_CONFIG>) => {
  try {
    // Combinar configuración personalizada con la por defecto
    const moduleConfig = {
      ...REPORTS_MODULE_CONFIG,
      ...config
    };
    
    console.log(`[Reports Module] Inicializando módulo de reportes v${moduleConfig.version}`);
    
    // Inicializar servicios
    await Promise.all([
      ReportService.initialize(),
      MetricService.initialize(),
      AlertService.initialize(),
      ExportService.initialize()
    ]);
    
    console.log('[Reports Module] Servicios inicializados correctamente');
    
    return {
      success: true,
      config: moduleConfig,
      message: 'Módulo de reportes inicializado correctamente'
    };
    
  } catch (error) {
    console.error('[Reports Module] Error al inicializar módulo:', error);
    
    return {
      success: false,
      error,
      message: 'Error al inicializar el módulo de reportes'
    };
  }
};

// Función de limpieza del módulo
export const cleanupReportsModule = async () => {
  try {
    console.log('[Reports Module] Limpiando recursos del módulo');
    
    // Limpiar servicios
    await Promise.all([
      ReportService.cleanup(),
      MetricService.cleanup(),
      AlertService.cleanup(),
      ExportService.cleanup()
    ]);
    
    console.log('[Reports Module] Módulo limpiado correctamente');
    
    return {
      success: true,
      message: 'Módulo de reportes limpiado correctamente'
    };
    
  } catch (error) {
    console.error('[Reports Module] Error al limpiar módulo:', error);
    
    return {
      success: false,
      error,
      message: 'Error al limpiar el módulo de reportes'
    };
  }
};

// =================================================================
// EXPORTACIÓN POR DEFECTO
// =================================================================

// Exportación por defecto del módulo completo
export default {
  // Componentes principales
  ReportsPage,
  ReportDashboard,
  HealthReports,
  InventoryReports,
  ProductionReports,
  
  // Configuración del módulo
  config: REPORTS_MODULE_CONFIG,
  metadata: REPORTS_MODULE_METADATA,
  
  // Funciones de gestión del módulo
  initialize: initializeReportsModule,
  cleanup: cleanupReportsModule
} as const;