import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Eye,
  X,
  Save,
  AlertCircle,
  Calendar,
  TrendingUp,
  Beef,
  Scale,
  DollarSign,
  BarChart3,
  MapPin
} from 'lucide-react';

// Función de utilidad para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Interfaces para reportes de producción
interface ProductionReport {
  id: string;
  title: string;
  description: string;
  reportType: ProductionReportType;
  period: ReportPeriod;
  location: string;
  metrics: ProductionMetrics;
  createdAt: string;
  updatedAt: string;
  status: ReportStatus;
  createdBy: string;
}

interface ProductionMetrics {
  totalAnimals: number;
  averageWeight: number;
  weightGain: number;
  feedEfficiency: number;
  mortalityRate: number;
  reproductionRate: number;
  milkProduction?: number;
  profitability: number;
  costPerKg: number;
}

interface ReportPeriod {
  startDate: string;
  endDate: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
}

type ProductionReportType = 
  | 'weight_analysis' 
  | 'feed_efficiency' 
  | 'reproduction' 
  | 'milk_production' 
  | 'profitability' 
  | 'mortality' 
  | 'general';

type ReportStatus = 'draft' | 'active' | 'archived' | 'processing';

// Props del componente principal
interface ProductionReportsProps {
  className?: string;
}

// Props del modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

// Props del formulario
interface ReportFormProps {
  report?: ProductionReport;
  onSave: (report: Omit<ProductionReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

// Datos de ejemplo
const SAMPLE_REPORTS: ProductionReport[] = [
  {
    id: '1',
    title: 'Análisis de Peso - Enero 2025',
    description: 'Reporte mensual de ganancia de peso en todas las ubicaciones',
    reportType: 'weight_analysis',
    period: {
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      type: 'monthly'
    },
    location: 'Todas las ubicaciones',
    metrics: {
      totalAnimals: 1248,
      averageWeight: 485.5,
      weightGain: 1.2,
      feedEfficiency: 87.3,
      mortalityRate: 0.8,
      reproductionRate: 92.1,
      profitability: 15.7,
      costPerKg: 4.25
    },
    createdAt: '2025-01-15T10:30:00Z',
    updatedAt: '2025-01-15T14:20:00Z',
    status: 'active',
    createdBy: 'Juan Pérez'
  },
  {
    id: '2',
    title: 'Eficiencia Alimentaria Q4 2024',
    description: 'Análisis trimestral de conversión alimentaria por potrero',
    reportType: 'feed_efficiency',
    period: {
      startDate: '2024-10-01',
      endDate: '2024-12-31',
      type: 'quarterly'
    },
    location: 'Potrero Norte',
    metrics: {
      totalAnimals: 324,
      averageWeight: 512.3,
      weightGain: 1.8,
      feedEfficiency: 91.2,
      mortalityRate: 0.3,
      reproductionRate: 88.9,
      profitability: 18.2,
      costPerKg: 3.95
    },
    createdAt: '2025-01-10T09:15:00Z',
    updatedAt: '2025-01-12T16:45:00Z',
    status: 'active',
    createdBy: 'María González'
  },
  {
    id: '3',
    title: 'Reporte de Reproducción - Diciembre 2024',
    description: 'Análisis de tasas reproductivas y gestación',
    reportType: 'reproduction',
    period: {
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      type: 'monthly'
    },
    location: 'Potrero Sur',
    metrics: {
      totalAnimals: 156,
      averageWeight: 445.8,
      weightGain: 0.9,
      feedEfficiency: 84.1,
      mortalityRate: 1.2,
      reproductionRate: 94.5,
      profitability: 12.3,
      costPerKg: 4.65
    },
    createdAt: '2025-01-05T11:20:00Z',
    updatedAt: '2025-01-08T13:30:00Z',
    status: 'archived',
    createdBy: 'Carlos Rodríguez'
  }
];

// Configuración de tipos de reporte
const REPORT_TYPE_CONFIG = {
  weight_analysis: {
    label: 'Análisis de Peso',
    icon: <Scale className="w-4 h-4" />,
    color: '#2d6f51'
  },
  feed_efficiency: {
    label: 'Eficiencia Alimentaria',
    icon: <BarChart3 className="w-4 h-4" />,
    color: '#4e9c75'
  },
  reproduction: {
    label: 'Reproducción',
    icon: <Beef className="w-4 h-4" />,
    color: '#519a7c'
  },
  milk_production: {
    label: 'Producción Láctea',
    icon: <TrendingUp className="w-4 h-4" />,
    color: '#3ca373'
  },
  profitability: {
    label: 'Rentabilidad',
    icon: <DollarSign className="w-4 h-4" />,
    color: '#f4ac3a'
  },
  mortality: {
    label: 'Mortalidad',
    icon: <AlertCircle className="w-4 h-4" />,
    color: '#e74c3c'
  },
  general: {
    label: 'General',
    icon: <BarChart3 className="w-4 h-4" />,
    color: '#2e8b57'
  }
};

// Componente Modal reutilizable
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header del modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75]">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Contenido del modal */}
          <div className="p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente Formulario de Reporte
const ReportForm: React.FC<ReportFormProps> = ({ report, onSave, onCancel, isEditing }) => {
  const [formData, setFormData] = useState<Partial<ProductionReport>>({
    title: report?.title || '',
    description: report?.description || '',
    reportType: report?.reportType || 'general',
    location: report?.location || '',
    period: report?.period || {
      startDate: '',
      endDate: '',
      type: 'monthly'
    },
    metrics: report?.metrics || {
      totalAnimals: 0,
      averageWeight: 0,
      weightGain: 0,
      feedEfficiency: 0,
      mortalityRate: 0,
      reproductionRate: 0,
      profitability: 0,
      costPerKg: 0
    },
    status: report?.status || 'draft'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'El título es requerido';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    if (!formData.location?.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }
    if (!formData.period?.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }
    if (!formData.period?.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }
    if (formData.period?.startDate && formData.period?.endDate && 
        new Date(formData.period.startDate) >= new Date(formData.period.endDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Manejar cambios en el período
  const handlePeriodChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      period: {
        ...prev.period!,
        [field]: value
      }
    }));
  };

  // Manejar cambios en las métricas
  const handleMetricsChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      metrics: {
        ...prev.metrics!,
        [field]: value
      }
    }));
  };

  // Manejar envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSave({
      title: formData.title!,
      description: formData.description!,
      reportType: formData.reportType!,
      location: formData.location!,
      period: formData.period!,
      metrics: formData.metrics!,
      status: formData.status!,
      createdBy: 'Usuario Actual' // En una app real vendría del contexto de auth
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título del Reporte *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={cn(
              "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
              errors.title ? "border-red-500" : "border-gray-300"
            )}
            placeholder="Ej: Análisis de Producción - Enero 2025"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Reporte *
          </label>
          <select
            value={formData.reportType}
            onChange={(e) => handleInputChange('reportType', e.target.value as ProductionReportType)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
          >
            {Object.entries(REPORT_TYPE_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación *
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className={cn(
              "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
              errors.location ? "border-red-500" : "border-gray-300"
            )}
            placeholder="Ej: Potrero Norte, Todas las ubicaciones"
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={3}
          className={cn(
            "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors resize-none",
            errors.description ? "border-red-500" : "border-gray-300"
          )}
          placeholder="Describe el propósito y alcance del reporte"
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      {/* Período del reporte */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
          Período del Reporte
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Período
            </label>
            <select
              value={formData.period?.type}
              onChange={(e) => handlePeriodChange('type', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="quarterly">Trimestral</option>
              <option value="annual">Anual</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inicio *
            </label>
            <input
              type="date"
              value={formData.period?.startDate}
              onChange={(e) => handlePeriodChange('startDate', e.target.value)}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.startDate ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.startDate && (
              <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Fin *
            </label>
            <input
              type="date"
              value={formData.period?.endDate}
              onChange={(e) => handlePeriodChange('endDate', e.target.value)}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.endDate ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.endDate && (
              <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Métricas de producción */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
          Métricas de Producción
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total de Animales
            </label>
            <input
              type="number"
              min="0"
              value={formData.metrics?.totalAnimals || 0}
              onChange={(e) => handleMetricsChange('totalAnimals', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Peso Promedio (kg)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.metrics?.averageWeight || 0}
              onChange={(e) => handleMetricsChange('averageWeight', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ganancia de Peso (kg/día)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.metrics?.weightGain || 0}
              onChange={(e) => handleMetricsChange('weightGain', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Eficiencia Alimentaria (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.metrics?.feedEfficiency || 0}
              onChange={(e) => handleMetricsChange('feedEfficiency', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasa de Mortalidad (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.metrics?.mortalityRate || 0}
              onChange={(e) => handleMetricsChange('mortalityRate', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasa de Reproducción (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.metrics?.reproductionRate || 0}
              onChange={(e) => handleMetricsChange('reproductionRate', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rentabilidad (%)
            </label>
            <input
              type="number"
              step="0.1"
              value={formData.metrics?.profitability || 0}
              onChange={(e) => handleMetricsChange('profitability', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Costo por Kg ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.metrics?.costPerKg || 0}
              onChange={(e) => handleMetricsChange('costPerKg', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Campo opcional para producción láctea */}
        {formData.reportType === 'milk_production' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Producción de Leche (litros/día)
              </label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={formData.metrics?.milkProduction || 0}
                onChange={(e) => handleMetricsChange('milkProduction', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Estado del reporte */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado del Reporte
        </label>
        <select
          value={formData.status}
          onChange={(e) => handleInputChange('status', e.target.value as ReportStatus)}
          className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
        >
          <option value="draft">Borrador</option>
          <option value="active">Activo</option>
          <option value="archived">Archivado</option>
          <option value="processing">Procesando</option>
        </select>
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Actualizar Reporte' : 'Crear Reporte'}
        </button>
      </div>
    </form>
  );
};

// Componente principal
export const ProductionReports: React.FC<ProductionReportsProps> = ({ className }) => {
  const [reports, setReports] = useState<ProductionReport[]>(SAMPLE_REPORTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProductionReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Filtrar reportes
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || report.reportType === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Abrir modal para crear reporte
  const handleCreateReport = () => {
    setSelectedReport(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Abrir modal para editar reporte
  const handleEditReport = (report: ProductionReport) => {
    setSelectedReport(report);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Guardar reporte (crear o editar)
  const handleSaveReport = (reportData: Omit<ProductionReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isEditing && selectedReport) {
      // Editar reporte existente
      setReports(prev => prev.map(report => 
        report.id === selectedReport.id 
          ? {
              ...reportData,
              id: selectedReport.id,
              createdAt: selectedReport.createdAt,
              updatedAt: new Date().toISOString()
            }
          : report
      ));
    } else {
      // Crear nuevo reporte
      const newReport: ProductionReport = {
        ...reportData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setReports(prev => [newReport, ...prev]);
    }
    
    setIsModalOpen(false);
    setSelectedReport(null);
  };

  // Eliminar reporte
  const handleDeleteReport = (reportId: string) => {
    setReports(prev => prev.filter(report => report.id !== reportId));
    setDeleteConfirm(null);
  };

  // Obtener color del estado
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener etiqueta del estado
  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'draft': return 'Borrador';
      case 'archived': return 'Archivado';
      case 'processing': return 'Procesando';
      default: return status;
    }
  };

  return (
    <div
      className={cn(
        "min-h-screen",
        // Fondo degradado principal del layout
        "bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]",
        className
      )}
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm mb-2">
                Reportes de Producción
              </h1>
              <p className="text-white/90">
                Gestiona y analiza los reportes de productividad ganadera
              </p>
            </div>

            <button
              onClick={handleCreateReport}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nuevo Reporte
            </button>
          </motion.div>

          {/* Filtros y búsqueda */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar reportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
                />
              </div>

              {/* Filtro por tipo */}
              <div>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
                >
                  <option value="all">Todos los tipos</option>
                  {Object.entries(REPORT_TYPE_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por estado */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activo</option>
                  <option value="draft">Borrador</option>
                  <option value="archived">Archivado</option>
                  <option value="processing">Procesando</option>
                </select>
              </div>

              {/* Contador de resultados */}
              <div className="flex items-center text-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                <span className="text-sm">
                  {filteredReports.length} de {reports.length} reportes
                </span>
              </div>
            </div>
          </motion.div>

          {/* Lista de reportes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden"
          >
            {filteredReports.length === 0 ? (
              <div className="p-12 text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  No se encontraron reportes
                </h3>
                <p className="text-gray-600 mb-6">
                  {reports.length === 0 
                    ? 'Crea tu primer reporte de producción'
                    : 'Ajusta los filtros o términos de búsqueda'
                  }
                </p>
                {reports.length === 0 && (
                  <button
                    onClick={handleCreateReport}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200"
                  >
                    <Plus className="w-5 h-5" />
                    Crear Primer Reporte
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium">Título</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Tipo</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Ubicación</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Período</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Métricas Clave</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredReports.map((report, index) => (
                      <motion.tr
                        key={report.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <h4 className="font-medium text-gray-800">{report.title}</h4>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {report.description}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Por {report.createdBy} • {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="p-2 rounded-lg"
                              style={{ 
                                backgroundColor: `${REPORT_TYPE_CONFIG[report.reportType].color}20`,
                                color: REPORT_TYPE_CONFIG[report.reportType].color
                              }}
                            >
                              {REPORT_TYPE_CONFIG[report.reportType].icon}
                            </div>
                            <span className="text-sm font-medium">
                              {REPORT_TYPE_CONFIG[report.reportType].label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{report.location}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700">
                            <div className="flex items-center gap-1 mb-1">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="capitalize">{report.period.type}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                            getStatusColor(report.status)
                          )}>
                            {getStatusLabel(report.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Animales:</span>
                              <span className="font-medium">{report.metrics.totalAnimals}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Peso prom:</span>
                              <span className="font-medium">{report.metrics.averageWeight} kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Eficiencia:</span>
                              <span className="font-medium">{report.metrics.feedEfficiency}%</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditReport(report)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Editar reporte"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Ver reporte"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              className="p-2 text-[#2d6f51] hover:bg-green-100 rounded-lg transition-colors"
                              title="Descargar reporte"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(report.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Eliminar reporte"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal de formulario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Editar Reporte de Producción' : 'Crear Nuevo Reporte de Producción'}
      >
        <ReportForm
          report={selectedReport || undefined}
          onSave={handleSaveReport}
          onCancel={() => setIsModalOpen(false)}
          isEditing={isEditing}
        />
      </Modal>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Confirmar Eliminación
                  </h3>
                  <p className="text-gray-600">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar este reporte de producción? 
                Se perderán todos los datos asociados.
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteReport(deleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};