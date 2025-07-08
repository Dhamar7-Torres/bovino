// Archivo de índice para exportar todos los componentes de gráficos
// Centraliza las exportaciones de charts para facilitar las importaciones

// ========================================
// EXPORTACIONES DE ÁREA CHART
// ========================================

// Componente principal de gráfico de área
export { default as AreaChart } from "./AreaChart";

// Componentes especializados de área para gestión ganadera
export {
  HealthTrendChart,
  VaccinationChart,
  WeightTrendChart,
  BirthDeathChart,
} from "./AreaChart";

// ========================================
// EXPORTACIONES DE BAR CHART
// ========================================

// Componente principal de gráfico de barras
export { default as BarChart } from "./BarChart";

// Componentes especializados de barras para gestión ganadera
export {
  CattleTypeChart,
  BreedDistributionChart,
  HealthStatusChart,
  MonthlyVaccinationChart,
  WeightByAgeChart,
} from "./BarChart";

// ========================================
// EXPORTACIONES DE LINE CHART
// ========================================

// Componente principal de gráfico de líneas
export { default as LineChart } from "./LineChart";

// Componentes especializados de líneas para gestión ganadera
export {
  WeightProgressChart,
  MilkProductionChart,
  TemperatureChart,
  PopulationTrendChart,
  MortalityTrendChart,
} from "./LineChart";

// ========================================
// EXPORTACIONES DE PIE CHART
// ========================================

// Componente principal de gráfico circular
export { default as PieChart } from "./PieChart";

// Componentes especializados de pie/donut para gestión ganadera
export {
  CattleTypeDistribution,
  HealthStatusDistribution,
  BreedDistributionDonut,
  GenderDistribution,
  AgeDistribution,
  VaccinationStatusDistribution,
} from "./PieChart";

// ========================================
// TIPOS E INTERFACES
// ========================================

// Tipos base para datos de gráficos
export interface ChartDataPoint {
  name: string;
  value: number;
  secondaryValue?: number;
  color?: string;
  category?: string;
  date?: string;
  timestamp?: number;
  [key: string]: any;
}

// Props comunes para todos los charts
export interface BaseChartProps {
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
  height?: number;
  width?: string;
  primaryColor?: string;
  secondaryColor?: string;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
  animationDelay?: number;
  dataKey?: string;
  secondaryDataKey?: string;
  xAxisKey?: string;
  yAxisLabel?: string;
  formatTooltip?: (value: any, name: string) => [string, string];
  formatXAxisLabel?: (value: any) => string;
  formatYAxisLabel?: (value: any) => string;
}

// Configuración de colores por tema
export interface ChartTheme {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  neutral: string;
}

// ========================================
// TEMAS Y CONFIGURACIONES
// ========================================

// Tema por defecto para gráficos ganaderos
export const CATTLE_CHART_THEME: ChartTheme = {
  primary: "#10b981", // emerald-500 - Para datos principales
  secondary: "#f59e0b", // amber-500 - Para datos secundarios
  success: "#22c55e", // green-500 - Para indicadores positivos
  warning: "#f59e0b", // amber-500 - Para alertas
  error: "#ef4444", // red-500 - Para problemas
  info: "#3b82f6", // blue-500 - Para información
  neutral: "#6b7280", // gray-500 - Para datos neutros
};

// Colores específicos para tipos de ganado
export const CATTLE_TYPE_COLORS = {
  "Vaca Lechera": "#10b981", // Verde
  "Vaca de Carne": "#3b82f6", // Azul
  Toro: "#ef4444", // Rojo
  Ternero: "#f59e0b", // Amarillo
  Vaquilla: "#8b5cf6", // Púrpura
  Novillo: "#06b6d4", // Cian
} as const;

// Colores para estados de salud
export const HEALTH_STATUS_COLORS = {
  Saludable: "#10b981", // Verde
  Enfermo: "#ef4444", // Rojo
  Cuarentena: "#f59e0b", // Amarillo
  Recuperándose: "#3b82f6", // Azul
  Muerto: "#6b7280", // Gris
} as const;

// Configuración por defecto para gráficos
export const DEFAULT_CHART_CONFIG = {
  height: 300,
  animationDelay: 0,
  showGrid: true,
  showLegend: true,
  showTooltip: true,
  primaryColor: CATTLE_CHART_THEME.primary,
  secondaryColor: CATTLE_CHART_THEME.secondary,
} as const;

// ========================================
// UTILIDADES PARA CHARTS
// ========================================

// Función para obtener color por tipo de ganado
export const getCattleTypeColor = (type: string): string => {
  return (
    CATTLE_TYPE_COLORS[type as keyof typeof CATTLE_TYPE_COLORS] ||
    CATTLE_CHART_THEME.neutral
  );
};

// Función para obtener color por estado de salud
export const getHealthStatusColor = (status: string): string => {
  return (
    HEALTH_STATUS_COLORS[status as keyof typeof HEALTH_STATUS_COLORS] ||
    CATTLE_CHART_THEME.neutral
  );
};

// Función para formatear números grandes
export const formatLargeNumber = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
};

// Función para formatear porcentajes
export const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Función para formatear pesos
export const formatWeight = (value: number): string => {
  return `${value.toFixed(1)} kg`;
};

// Función para formatear fechas
export const formatChartDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-MX", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

// Función para generar colores automáticos
export const generateChartColors = (count: number): string[] => {
  const baseColors = [
    "#10b981", // emerald-500
    "#3b82f6", // blue-500
    "#f59e0b", // amber-500
    "#ef4444", // red-500
    "#8b5cf6", // violet-500
    "#06b6d4", // cyan-500
    "#84cc16", // lime-500
    "#f97316", // orange-500
    "#ec4899", // pink-500
    "#6b7280", // gray-500
  ];

  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

// ========================================
// CONJUNTOS DE COMPONENTES ESPECIALIZADOS
// ========================================

// Importar los componentes para poder usarlos en los conjuntos
import {
  HealthTrendChart,
  VaccinationChart,
  WeightTrendChart,
  BirthDeathChart,
} from "./AreaChart";

import {
  CattleTypeChart,
  BreedDistributionChart,
  HealthStatusChart,
  MonthlyVaccinationChart,
  WeightByAgeChart,
} from "./BarChart";

import {
  WeightProgressChart,
  MilkProductionChart,
  TemperatureChart,
  PopulationTrendChart,
  MortalityTrendChart,
} from "./LineChart";

import {
  CattleTypeDistribution,
  HealthStatusDistribution,
  BreedDistributionDonut,
  GenderDistribution,
  AgeDistribution,
  VaccinationStatusDistribution,
} from "./PieChart";

// Componentes para análisis de salud
export const HealthCharts = {
  TrendChart: HealthTrendChart,
  StatusChart: HealthStatusChart,
  StatusDistribution: HealthStatusDistribution,
  TemperatureChart: TemperatureChart,
  MortalityTrend: MortalityTrendChart,
} as const;

// Componentes para análisis de vacunación
export const VaccinationCharts = {
  AreaChart: VaccinationChart,
  MonthlyChart: MonthlyVaccinationChart,
  StatusDistribution: VaccinationStatusDistribution,
} as const;

// Componentes para análisis de producción
export const ProductionCharts = {
  WeightProgress: WeightProgressChart,
  WeightTrend: WeightTrendChart,
  WeightByAge: WeightByAgeChart,
  MilkProduction: MilkProductionChart,
  PopulationTrend: PopulationTrendChart,
  BirthDeath: BirthDeathChart,
} as const;

// Componentes para distribuciones
export const DistributionCharts = {
  CattleType: CattleTypeDistribution,
  CattleTypeChart: CattleTypeChart,
  BreedDistribution: BreedDistributionChart,
  BreedDonut: BreedDistributionDonut,
  Gender: GenderDistribution,
  Age: AgeDistribution,
} as const;

// ========================================
// EJEMPLOS DE DATOS PARA DESARROLLO
// ========================================

// Datos de ejemplo para gráfico de salud
export const exampleHealthData: ChartDataPoint[] = [
  { name: "Ene", value: 120, secondaryValue: 5 },
  { name: "Feb", value: 125, secondaryValue: 3 },
  { name: "Mar", value: 130, secondaryValue: 2 },
  { name: "Abr", value: 128, secondaryValue: 4 },
  { name: "May", value: 135, secondaryValue: 1 },
  { name: "Jun", value: 140, secondaryValue: 2 },
];

// Datos de ejemplo para distribución de tipos
export const exampleTypeData: ChartDataPoint[] = [
  { name: "Holstein", value: 45, color: getCattleTypeColor("Vaca Lechera") },
  { name: "Angus", value: 32, color: getCattleTypeColor("Vaca de Carne") },
  { name: "Toros", value: 8, color: getCattleTypeColor("Toro") },
  { name: "Terneros", value: 25, color: getCattleTypeColor("Ternero") },
];

// Datos de ejemplo para estado de salud
export const exampleHealthStatusData: ChartDataPoint[] = [
  { name: "Saludable", value: 95, color: getHealthStatusColor("Saludable") },
  { name: "Enfermo", value: 3, color: getHealthStatusColor("Enfermo") },
  { name: "Cuarentena", value: 2, color: getHealthStatusColor("Cuarentena") },
];

// ========================================
// EXPORTACIÓN POR DEFECTO
// ========================================

// Importar componentes principales
import AreaChart from "./AreaChart";
import BarChart from "./BarChart";
import LineChart from "./LineChart";
import PieChart from "./PieChart";

// Exportar todos los componentes principales como objeto
export default {
  // Componentes principales
  AreaChart,
  BarChart,
  LineChart,
  PieChart,

  // Conjuntos especializados
  HealthCharts,
  VaccinationCharts,
  ProductionCharts,
  DistributionCharts,

  // Utilidades
  getCattleTypeColor,
  getHealthStatusColor,
  formatLargeNumber,
  formatPercentage,
  formatWeight,
  formatChartDate,
  generateChartColors,

  // Configuraciones
  CATTLE_CHART_THEME,
  CATTLE_TYPE_COLORS,
  HEALTH_STATUS_COLORS,
  DEFAULT_CHART_CONFIG,

  // Datos de ejemplo
  exampleHealthData,
  exampleTypeData,
  exampleHealthStatusData,
};

/*
// ========================================
// EJEMPLOS DE USO
// ========================================

// Importación individual
import { AreaChart, HealthTrendChart, getCattleTypeColor } from './charts';

// Importación de conjuntos
import { HealthCharts, VaccinationCharts } from './charts';

// Importación completa
import Charts from './charts';

// Uso de componentes especializados
<HealthCharts.TrendChart data={healthData} />
<VaccinationCharts.MonthlyChart data={vaccinationData} />
<ProductionCharts.WeightProgress data={weightData} />

// Uso de utilidades
const color = getCattleTypeColor('Holstein');
const formattedWeight = formatWeight(450.5);

// Uso con configuración por defecto
<AreaChart 
  data={data} 
  {...DEFAULT_CHART_CONFIG}
  title="Mi Gráfico"
/>

// Uso de datos de ejemplo para desarrollo
<PieChart data={Charts.exampleTypeData} />
*/
