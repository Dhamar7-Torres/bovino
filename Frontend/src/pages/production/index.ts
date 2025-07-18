// =================================================================
// ÍNDICE DEL MÓDULO PRODUCTION - SISTEMA BOVINO UJAT
// =================================================================

// Sistema integral de gestión de producción ganadera
// Desarrollado para la Universidad Juárez Autónoma de Tabasco (UJAT)

// =================================================================
// EXPORTACIONES PRINCIPALES DE COMPONENTES
// =================================================================

// Exportación del componente principal de routing interno
export { default as ProductionPage } from './ProductionPage';

// Exportación del dashboard general de producción
export { default as ProductionDashboard } from './ProductionDashboard';

// Exportación de los módulos especializados de producción
export { default as MilkProduction } from './MilkProduction';
export { default as MeatProduction } from './MeatProduction';
export { default as BreedingProduction } from './BreedingProduction';

// =================================================================
// EXPORTACIONES ALTERNATIVAS PARA FLEXIBILIDAD
// =================================================================

// Alias alternativos para importación más semántica
export { default as ProductionRouter } from './ProductionPage';
export { default as ProductionMain } from './ProductionDashboard';
export { default as LecheProd } from './MilkProduction';
export { default as CarneProd } from './MeatProduction';
export { default as CriaProd } from './BreedingProduction';

// =================================================================
// TIPOS E INTERFACES PRINCIPALES
// =================================================================

// Tipos para navegación del módulo production
export type ProductionSection = 'dashboard' | 'milk' | 'meat' | 'breeding' | 'overview';

// Interface para elementos de navegación
export interface ProductionNavigationItem {
  id: ProductionSection;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  stats?: {
    value: string;
    label: string;
    trend?: 'up' | 'down' | 'stable';
  };
}

// Interface para estadísticas rápidas
export interface ProductionQuickStat {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
}

// =================================================================
// TIPOS ESPECÍFICOS DE PRODUCCIÓN LECHERA
// =================================================================

export interface MilkProductionStats {
  totalMilkingCows: number;
  dailyProduction: number;
  averagePerCow: number;
  qualityGrade: string;
  fatContent: number;
  proteinContent: number;
}

export interface CowMilkRecord {
  id: string;
  name: string;
  breed: string;
  lactationNumber: number;
  daysInMilk: number;
  lastMilking: string;
  dailyProduction: number;
  morningMilk: number;
  afternoonMilk: number;
  fatPercentage: number;
  proteinPercentage: number;
  somaticCells: number;
  quality: 'excellent' | 'good' | 'average' | 'poor';
  location: string;
  status: 'active' | 'dry' | 'sick' | 'fresh';
  notes?: string;
}

export interface MilkingSession {
  id: string;
  session: 'morning' | 'afternoon';
  date: string;
  startTime: string;
  endTime: string;
  cowsMillked: number;
  totalLiters: number;
  averageTime: number;
  quality: number;
}

// =================================================================
// TIPOS ESPECÍFICOS DE PRODUCCIÓN CÁRNICA
// =================================================================

export interface MeatProductionStats {
  totalCattle: number;
  readyForSlaughter: number;
  averageWeight: number;
  monthlyProduction: number;
  weightGainRate: number;
  feedEfficiency: number;
}

export interface CattleRecord {
  id: string;
  name: string;
  breed: string;
  currentWeight: number;
  targetWeight: number;
  age: number;
  condition: 'excellent' | 'good' | 'average' | 'poor';
  location: string;
  entryDate: string;
  expectedSlaughterDate: string;
  dailyGain: number;
  feedConsumption: number;
  notes?: string;
  status: 'growing' | 'ready' | 'scheduled' | 'sold';
}

export interface WeightProgress {
  date: string;
  averageWeight: number;
  dailyGain: number;
  feedCost: number;
}

// =================================================================
// TIPOS ESPECÍFICOS DE PRODUCCIÓN DE CRÍA
// =================================================================

export interface BreedingStats {
  totalBreeders: number;
  pregnantCows: number;
  expectedBirths: number;
  successRate: number;
  monthlyBirths: number;
  activeInseminations: number;
}

export interface BreedingRecord {
  id: string;
  cowId: string;
  cowName: string;
  bullName: string;
  breedingDate: string;
  expectedDate: string;
  status: 'pregnant' | 'open' | 'calved' | 'failed';
  location: string;
  gestationDays: number;
  notes?: string;
}

export interface MonthlyBreedingData {
  month: string;
  inseminations: number;
  pregnancies: number;
  births: number;
  successRate: number;
}

// =================================================================
// TIPOS PARA DASHBOARD GENERAL
// =================================================================

export interface ProductionStats {
  totalCattle: number;
  milkProduction: number;
  meatProduction: number;
  breedingProduction: number;
  monthlyGrowth: number;
  activeAlerts: number;
}

export interface MonthlyProduction {
  month: string;
  milk: number;
  meat: number;
  breeding: number;
}

export interface ProductionCategory {
  name: string;
  value: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

// =================================================================
// CONSTANTES DEL MÓDULO
// =================================================================

// Rutas internas del módulo production
export const PRODUCTION_ROUTES = {
  OVERVIEW: 'overview',
  DASHBOARD: 'dashboard',
  MILK: 'milk',
  MEAT: 'meat',
  BREEDING: 'breeding'
} as const;

// Colores específicos para el módulo production
export const PRODUCTION_COLORS = {
  MILK: '#06b6d4', // Cyan para lechería
  MEAT: '#dc2626', // Rojo para carne
  BREEDING: '#e91e63', // Rosa para reproducción
  GENERAL: '#519a7c', // Verde principal del sistema
  SUCCESS: '#22c55e', // Verde para éxito
  WARNING: '#f59e0b', // Amarillo para advertencias
  ERROR: '#ef4444' // Rojo para errores
} as const;

// Estados disponibles para animales
export const ANIMAL_STATUS = {
  // Estados lecheros
  MILKING: {
    ACTIVE: 'active',
    FRESH: 'fresh',
    DRY: 'dry',
    SICK: 'sick'
  },
  // Estados cárnicos
  MEAT: {
    GROWING: 'growing',
    READY: 'ready',
    SCHEDULED: 'scheduled',
    SOLD: 'sold'
  },
  // Estados reproductivos
  BREEDING: {
    PREGNANT: 'pregnant',
    OPEN: 'open',
    CALVED: 'calved',
    FAILED: 'failed'
  }
} as const;

// Calidades disponibles
export const QUALITY_LEVELS = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  AVERAGE: 'average',
  POOR: 'poor'
} as const;

// =================================================================
// FUNCIONES UTILITARIAS
// =================================================================

// Función para formatear números en español mexicano
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('es-MX').format(value);
};

// Función para formatear litros
export const formatLiters = (liters: number): string => {
  return `${formatNumber(liters)} L`;
};

// Función para formatear peso
export const formatWeight = (weight: number): string => {
  return `${formatNumber(weight)} kg`;
};

// Función para formatear fechas en español
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit'
  });
};

// Función para formatear tiempo
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Función para calcular progreso hacia objetivo
export const calculateProgress = (current: number, target: number): number => {
  return Math.min((current / target) * 100, 100);
};

// Función para obtener color según calidad
export const getQualityColor = (quality: string): string => {
  switch (quality) {
    case QUALITY_LEVELS.EXCELLENT: return 'excellent';
    case QUALITY_LEVELS.GOOD: return 'success';
    case QUALITY_LEVELS.AVERAGE: return 'warning';
    case QUALITY_LEVELS.POOR: return 'error';
    default: return 'outline';
  }
};

// Función para evaluar células somáticas
export const getSomaticCellsStatus = (count: number): { color: string; status: string } => {
  if (count < 100000) return { color: 'excellent', status: 'Excelente' };
  if (count < 200000) return { color: 'success', status: 'Buena' };
  if (count < 400000) return { color: 'warning', status: 'Atención' };
  return { color: 'error', status: 'Problema' };
};

// =================================================================
// METADATOS DEL MÓDULO
// =================================================================

export const PRODUCTION_MODULE_INFO = {
  name: 'Módulo de Producción',
  version: '1.0.0',
  description: 'Sistema integral de gestión de producción ganadera',
  author: 'UJAT - Universidad Juárez Autónoma de Tabasco',
  lastUpdated: '2024-06-15',
  components: [
    'ProductionPage',
    'ProductionDashboard', 
    'MilkProduction',
    'MeatProduction',
    'BreedingProduction'
  ],
  features: [
    'Gestión de producción lechera',
    'Control de engorde cárnico',
    'Manejo reproductivo',
    'Dashboard integral',
    'Alertas inteligentes',
    'Geolocalización',
    'Análisis de calidad',
    'Reportes especializados'
  ]
} as const;

// =================================================================
// EXPORTACIÓN POR DEFECTO
// =================================================================

// Exportar ProductionPage como default para importación simplificada
export { default } from './ProductionPage';