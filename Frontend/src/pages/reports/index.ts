// =================================================================
// IMPORTS DE COMPONENTES
// =================================================================
import React from 'react';

// Importar componentes principales
import { ReportsPage } from './ReportsPage';

// Importar componentes CRUD específicos
import { HealthReports } from './HealthReports';
import { ProductionReports } from './ProductionReports';
import { InventoryReports } from './InventoryReports';

// Página principal del módulo de reportes
export { ReportsPage };

// =================================================================
// COMPONENTES CRUD DE REPORTES ESPECÍFICOS
// =================================================================

// Reportes de salud ganadera
export { HealthReports };

// Reportes de producción y rendimiento
export { ProductionReports };

// Reportes de inventario y valuación
export { InventoryReports };


// Interfaces base para reportes
export interface BaseReport {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  status: ReportStatus;
  createdBy: string;
}

// Estados posibles de un reporte
export type ReportStatus = 'draft' | 'active' | 'archived' | 'processing';

// Período de reporte estándar
export interface ReportPeriod {
  startDate: string;
  endDate: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
}

// Props comunes para formularios de reportes
export interface ReportFormProps<T = any> {
  report?: T;
  onSave: (report: Omit<T, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

// Props comunes para modales
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

// =================================================================
// CONSTANTES Y CONFIGURACIONES
// =================================================================

// Rutas del módulo de reportes
export const REPORT_ROUTES = {
  // Ruta principal
  MAIN: '/reports',
  
  // Dashboard central
  DASHBOARD: '/reports/dashboard',
  
  // Reportes específicos
  HEALTH: '/reports/health',
  PRODUCTION: '/reports/production',
  INVENTORY: '/reports/inventory',
  VACCINATION: '/reports/vaccination',
} as const;

// Configuración de colores por tipo de reporte
export const REPORT_COLORS = {
  health: '#4e9c75',
  production: '#519a7c',
  inventory: '#3ca373',
  vaccination: '#2e8b57',
  geographic: '#e67e22',
  financial: '#f4ac3a',
  compliance: '#9b59b6',
  general: '#2d6f51'
} as const;

// Etiquetas en español para tipos de reporte
export const REPORT_TYPE_LABELS = {
  health: 'Salud',
  production: 'Producción',
  inventory: 'Inventario',
  vaccination: 'Vacunación',
  geographic: 'Geográfico',
  financial: 'Financiero',
  compliance: 'Cumplimiento',
  general: 'General'
} as const;

// Estados de reporte con etiquetas en español
export const REPORT_STATUS_LABELS = {
  draft: 'Borrador',
  active: 'Activo',
  archived: 'Archivado',
  processing: 'Procesando'
} as const;

// Colores para estados de reporte
export const REPORT_STATUS_COLORS = {
  draft: 'bg-gray-100 text-gray-800',
  active: 'bg-green-100 text-green-800',
  archived: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800'
} as const;

// =================================================================
// UTILIDADES HELPERS
// =================================================================

// Función para obtener el color de un tipo de reporte
export const getReportColor = (type: keyof typeof REPORT_COLORS): string => {
  return REPORT_COLORS[type] || REPORT_COLORS.general;
};

// Función para obtener la etiqueta de un tipo de reporte
export const getReportTypeLabel = (type: keyof typeof REPORT_TYPE_LABELS): string => {
  return REPORT_TYPE_LABELS[type] || 'Desconocido';
};

// Función para obtener la etiqueta de un estado de reporte
export const getReportStatusLabel = (status: ReportStatus): string => {
  return REPORT_STATUS_LABELS[status] || 'Desconocido';
};

// Función para obtener las clases CSS de un estado de reporte
export const getReportStatusClasses = (status: ReportStatus): string => {
  return REPORT_STATUS_COLORS[status] || REPORT_STATUS_COLORS.draft;
};

// Función para formatear fechas de manera consistente
export const formatReportDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Función para formatear fechas de manera compacta
export const formatReportDateShort = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('es-ES', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit'
  });
};

// Función para calcular la diferencia en días entre dos fechas
export const calculateDaysDifference = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Función para validar si una fecha está dentro de un rango
export const isDateInRange = (date: string, startDate: string, endDate: string): boolean => {
  const checkDate = new Date(date);
  const start = new Date(startDate);
  const end = new Date(endDate);
  return checkDate >= start && checkDate <= end;
};

// =================================================================
// CONFIGURACIÓN DE VALIDACIONES
// =================================================================

// Reglas de validación comunes para formularios de reportes
export const VALIDATION_RULES = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100
  },
  description: {
    required: true,
    minLength: 10,
    maxLength: 500
  },
  location: {
    required: true,
    minLength: 2,
    maxLength: 50
  },
  dateRange: {
    required: true,
    maxRangeInDays: 365
  }
} as const;

// Mensajes de error estándar
export const VALIDATION_MESSAGES = {
  required: 'Este campo es requerido',
  minLength: (min: number) => `Debe tener al menos ${min} caracteres`,
  maxLength: (max: number) => `No puede exceder ${max} caracteres`,
  invalidDate: 'Fecha inválida',
  invalidDateRange: 'La fecha de fin debe ser posterior a la fecha de inicio',
  maxDateRange: (days: number) => `El rango no puede exceder ${days} días`
} as const;

// =================================================================
// CONFIGURACIÓN DE EXPORTACIÓN
// =================================================================

// Formatos de exportación disponibles
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'xlsx',
  CSV: 'csv',
  JSON: 'json'
} as const;

// Etiquetas para formatos de exportación
export const EXPORT_FORMAT_LABELS = {
  [EXPORT_FORMATS.PDF]: 'PDF',
  [EXPORT_FORMATS.EXCEL]: 'Excel',
  [EXPORT_FORMATS.CSV]: 'CSV',
  [EXPORT_FORMATS.JSON]: 'JSON'
} as const;

// =================================================================
// CONFIGURACIÓN DE PAGINACIÓN Y FILTROS
// =================================================================

// Configuración por defecto para listas de reportes
export const DEFAULT_LIST_CONFIG = {
  pageSize: 10,
  sortBy: 'updatedAt',
  sortOrder: 'desc' as 'asc' | 'desc',
  filters: {
    status: 'all',
    type: 'all',
    dateRange: 'all'
  }
} as const;

// Opciones de tamaño de página
export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50, 100] as const;

// =================================================================
// DEFAULT EXPORT
// =================================================================

// Exportación por defecto del módulo
const ReportsModule = {
  // Componentes principales
  ReportsPage,
  HealthReports,
  ProductionReports,
  InventoryReports,
  
  // Utilidades
  REPORT_ROUTES,
  REPORT_COLORS,
  REPORT_TYPE_LABELS,
  REPORT_STATUS_LABELS,
  REPORT_STATUS_COLORS,
  
  // Funciones helpers
  getReportColor,
  getReportTypeLabel,
  getReportStatusLabel,
  getReportStatusClasses,
  formatReportDate,
  formatReportDateShort,
  calculateDaysDifference,
  isDateInRange,
  
  // Configuraciones
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
  EXPORT_FORMATS,
  EXPORT_FORMAT_LABELS,
  DEFAULT_LIST_CONFIG,
  PAGE_SIZE_OPTIONS
};

export default ReportsModule;