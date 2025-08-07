import React, { useState, useEffect } from 'react';
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
  MapPin,
  Loader2,
  Navigation,
  FileText,
  Printer,
  Share2,
  ChevronDown,
  ChevronUp,
  CheckCircle
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
  coordinates?: {
    latitude: number;
    longitude: number;
  };
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
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Props del formulario
interface ReportFormProps {
  report?: ProductionReport;
  onSave: (report: Omit<ProductionReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

// Props del visor de reportes
interface ReportViewerProps {
  report: ProductionReport;
}

// Interface para geolocalización
interface GeolocationState {
  loading: boolean;
  error: string | null;
  coordinates: {
    latitude: number;
    longitude: number;
  } | undefined;
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
    coordinates: {
      latitude: 17.989058,
      longitude: -92.935139
    },
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
    coordinates: {
      latitude: 18.025058,
      longitude: -92.905139
    },
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

// Hook personalizado para geolocalización
const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    coordinates: undefined
  });

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocalización no soportada por este navegador'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        };
        
        setState({
          loading: false,
          error: null,
          coordinates: coords
        });
        
        console.log('Ubicación obtenida:', coords);
      },
      (error) => {
        let errorMessage = 'Error desconocido al obtener ubicación';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Ubicación no disponible';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado para obtener ubicación';
            break;
        }
        setState({
          loading: false,
          error: errorMessage,
          coordinates: undefined
        });
        console.error('Error de geolocalización:', errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 300000 // 5 minutos
      }
    );
  };

  return { ...state, getCurrentLocation };
};

// Función para obtener dirección desde coordenadas
const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  try {
    // Simulación de llamada a API de geocodificación
    await new Promise(resolve => setTimeout(resolve, 1000));
    return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}, Villahermosa, Tabasco, México`;
  } catch (error) {
    console.error('Error obteniendo dirección:', error);
    return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
  }
};

// Función para generar PDF del reporte
const generateReportPDF = (report: ProductionReport): Promise<Blob> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Generando PDF para:', report.title);
      
      const pdfContent = `
REPORTE DE PRODUCCIÓN
${report.title}

INFORMACIÓN GENERAL:
- Descripción: ${report.description}
- Tipo: ${REPORT_TYPE_CONFIG[report.reportType].label}
- Período: ${new Date(report.period.startDate).toLocaleDateString()} - ${new Date(report.period.endDate).toLocaleDateString()}
- Ubicación: ${report.location}
${report.coordinates ? `- Coordenadas: ${report.coordinates.latitude.toFixed(6)}, ${report.coordinates.longitude.toFixed(6)}` : ''}

MÉTRICAS DE PRODUCCIÓN:
- Total de Animales: ${report.metrics.totalAnimals}
- Peso Promedio: ${report.metrics.averageWeight} kg
- Ganancia de Peso: ${report.metrics.weightGain} kg/día
- Eficiencia Alimentaria: ${report.metrics.feedEfficiency}%
- Tasa de Mortalidad: ${report.metrics.mortalityRate}%
- Tasa de Reproducción: ${report.metrics.reproductionRate}%
- Rentabilidad: ${report.metrics.profitability}%
- Costo por Kg: $${report.metrics.costPerKg}
${report.metrics.milkProduction ? `- Producción de Leche: ${report.metrics.milkProduction} L/día` : ''}

Creado por: ${report.createdBy}
Fecha: ${new Date(report.createdAt).toLocaleString()}
      `;
      
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      resolve(blob);
    }, 1500);
  });
};

// Función para generar Excel del reporte
const generateReportExcel = (report: ProductionReport): Promise<Blob> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Generando Excel para:', report.title);
      
      const csvContent = `
Título,${report.title}
Descripción,${report.description}
Tipo,${REPORT_TYPE_CONFIG[report.reportType].label}
Período Inicio,${report.period.startDate}
Período Fin,${report.period.endDate}
Ubicación,${report.location}
${report.coordinates ? `Latitud,${report.coordinates.latitude}` : ''}
${report.coordinates ? `Longitud,${report.coordinates.longitude}` : ''}
Total Animales,${report.metrics.totalAnimals}
Peso Promedio,${report.metrics.averageWeight}
Ganancia Peso,${report.metrics.weightGain}
Eficiencia Alimentaria,${report.metrics.feedEfficiency}
Mortalidad,${report.metrics.mortalityRate}
Reproducción,${report.metrics.reproductionRate}
Rentabilidad,${report.metrics.profitability}
Costo por Kg,${report.metrics.costPerKg}
${report.metrics.milkProduction ? `Producción Leche,${report.metrics.milkProduction}` : ''}
Creado por,${report.createdBy}
Fecha Creación,${report.createdAt}
      `;
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      resolve(blob);
    }, 1200);
  });
};

// Componente Modal reutilizable
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = 'lg' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

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
          className={cn(
            "bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl w-full max-h-[90vh] overflow-hidden",
            sizeClasses[size]
          )}
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

// Componente Visor de Reporte
const ReportViewer: React.FC<ReportViewerProps> = ({ report }) => {
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic', 'metrics']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleDownload = async (format: 'pdf' | 'excel') => {
    setDownloadLoading(format);
    try {
      let blob: Blob;
      let filename: string;
      
      if (format === 'pdf') {
        blob = await generateReportPDF(report);
        filename = `reporte_${report.id}_${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      } else {
        blob = await generateReportExcel(report);
        filename = `reporte_${report.id}_${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
      }

      // Crear enlace de descarga
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`Descarga completada: ${filename}`);
    } catch (error) {
      console.error('Error al descargar reporte:', error);
      alert('Error al descargar el reporte. Por favor, inténtalo de nuevo.');
    } finally {
      setDownloadLoading(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    const shareData = {
      title: report.title,
      text: report.description,
      url: window.location.href
    };

    if (navigator.share && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        console.log('Reporte compartido exitosamente');
      } catch (error) {
        console.log('Error al compartir:', error);
        fallbackShare();
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    const text = `${report.title}\n${report.description}\n${window.location.href}`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Información del reporte copiada al portapapeles');
    }).catch(() => {
      alert('No se pudo copiar la información');
    });
  };

  return (
    <div className="space-y-6">
      {/* Acciones del reporte */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-2">
          <div 
            className="p-3 rounded-lg"
            style={{ 
              backgroundColor: `${REPORT_TYPE_CONFIG[report.reportType].color}20`,
              color: REPORT_TYPE_CONFIG[report.reportType].color
            }}
          >
            {REPORT_TYPE_CONFIG[report.reportType].icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
            <p className="text-sm text-gray-600">{REPORT_TYPE_CONFIG[report.reportType].label}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownload('pdf')}
            disabled={downloadLoading === 'pdf'}
            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          >
            {downloadLoading === 'pdf' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            PDF
          </button>
          
          <button
            onClick={() => handleDownload('excel')}
            disabled={downloadLoading === 'excel'}
            className="flex items-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
          >
            {downloadLoading === 'excel' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Excel
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Compartir
          </button>
        </div>
      </div>

      {/* Información básica */}
      <div className="bg-gray-50 rounded-lg p-4">
        <button
          onClick={() => toggleSection('basic')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-lg font-medium text-gray-800">Información Básica</h4>
          {expandedSections.has('basic') ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.has('basic') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Descripción</label>
              <p className="text-gray-800">{report.description}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Estado</label>
              <span className={cn(
                "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                report.status === 'active' ? 'bg-green-100 text-green-800' :
                report.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                report.status === 'archived' ? 'bg-blue-100 text-blue-800' :
                'bg-yellow-100 text-yellow-800'
              )}>
                {report.status === 'active' ? 'Activo' :
                 report.status === 'draft' ? 'Borrador' :
                 report.status === 'archived' ? 'Archivado' : 'Procesando'}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Ubicación</label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <p className="text-gray-800">{report.location}</p>
              </div>
              {report.coordinates && (
                <p className="text-xs text-gray-500 mt-1">
                  {report.coordinates.latitude.toFixed(6)}, {report.coordinates.longitude.toFixed(6)}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Período</label>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-gray-800">
                  {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
                </p>
              </div>
              <p className="text-xs text-gray-500 mt-1 capitalize">{report.period.type}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Creado por</label>
              <p className="text-gray-800">{report.createdBy}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Fecha de creación</label>
              <p className="text-gray-800">{new Date(report.createdAt).toLocaleString()}</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Métricas de producción */}
      <div className="bg-gray-50 rounded-lg p-4">
        <button
          onClick={() => toggleSection('metrics')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-lg font-medium text-gray-800">Métricas de Producción</h4>
          {expandedSections.has('metrics') ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.has('metrics') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Beef className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total de Animales</p>
                  <p className="text-2xl font-bold text-gray-800">{report.metrics.totalAnimals}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Scale className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Peso Promedio</p>
                  <p className="text-2xl font-bold text-gray-800">{report.metrics.averageWeight} kg</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Ganancia de Peso</p>
                  <p className="text-2xl font-bold text-gray-800">{report.metrics.weightGain} kg/día</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Eficiencia Alimentaria</p>
                  <p className="text-2xl font-bold text-gray-800">{report.metrics.feedEfficiency}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tasa de Mortalidad</p>
                  <p className="text-2xl font-bold text-gray-800">{report.metrics.mortalityRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-100 rounded-lg">
                  <Beef className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tasa de Reproducción</p>
                  <p className="text-2xl font-bold text-gray-800">{report.metrics.reproductionRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Rentabilidad</p>
                  <p className="text-2xl font-bold text-gray-800">{report.metrics.profitability}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Costo por Kg</p>
                  <p className="text-2xl font-bold text-gray-800">${report.metrics.costPerKg}</p>
                </div>
              </div>
            </div>

            {report.metrics.milkProduction && (
              <div className="bg-white p-4 rounded-lg border lg:col-span-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-cyan-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Producción de Leche</p>
                    <p className="text-2xl font-bold text-gray-800">{report.metrics.milkProduction} L/día</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Análisis y recomendaciones */}
      <div className="bg-gray-50 rounded-lg p-4">
        <button
          onClick={() => toggleSection('analysis')}
          className="flex items-center justify-between w-full text-left"
        >
          <h4 className="text-lg font-medium text-gray-800">Análisis y Recomendaciones</h4>
          {expandedSections.has('analysis') ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>
        
        {expandedSections.has('analysis') && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4"
          >
            <div className="bg-white p-4 rounded-lg border">
              <h5 className="font-medium text-gray-800 mb-2">Resumen del Desempeño</h5>
              <p className="text-gray-600">
                Este reporte muestra un rendimiento {report.metrics.feedEfficiency > 85 ? 'excelente' : report.metrics.feedEfficiency > 75 ? 'bueno' : 'regular'} 
                con una eficiencia alimentaria del {report.metrics.feedEfficiency}% y una rentabilidad del {report.metrics.profitability}%.
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h5 className="font-medium text-gray-800 mb-2">Puntos Destacados</h5>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                <li>Ganancia de peso diaria: {report.metrics.weightGain} kg (promedio)</li>
                <li>Tasa de mortalidad: {report.metrics.mortalityRate}% {report.metrics.mortalityRate < 2 ? '(Excelente)' : report.metrics.mortalityRate < 5 ? '(Aceptable)' : '(Requiere atención)'}</li>
                <li>Eficiencia reproductiva: {report.metrics.reproductionRate}%</li>
                <li>Costo de producción: ${report.metrics.costPerKg} por kg</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded-lg border">
              <h5 className="font-medium text-gray-800 mb-2">Recomendaciones</h5>
              <ul className="list-disc list-inside text-gray-600 space-y-1">
                {report.metrics.feedEfficiency < 80 && <li>Revisar la calidad y composición del alimento para mejorar la eficiencia alimentaria</li>}
                {report.metrics.mortalityRate > 3 && <li>Implementar medidas preventivas de salud para reducir la tasa de mortalidad</li>}
                {report.metrics.reproductionRate < 85 && <li>Evaluar el programa reproductivo y considerar mejoras en la nutrición</li>}
                {report.metrics.weightGain < 1 && <li>Optimizar la dieta para incrementar la ganancia de peso diaria</li>}
                <li>Continuar monitoreando las métricas de manera regular para mantener el rendimiento</li>
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Componente Formulario de Reporte
const ReportForm: React.FC<ReportFormProps> = ({ report, onSave, onCancel, isEditing }) => {
  const [formData, setFormData] = useState({
    title: report?.title || '',
    description: report?.description || '',
    reportType: report?.reportType || 'general' as ProductionReportType,
    location: report?.location || '',
    coordinates: report?.coordinates || undefined as { latitude: number; longitude: number; } | undefined,
    period: report?.period || {
      startDate: '',
      endDate: '',
      type: 'monthly' as const
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
    status: report?.status || 'draft' as ReportStatus
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const geolocation = useGeolocation();
  const [gettingAddress, setGettingAddress] = useState(false);

  // Efecto para actualizar la ubicación cuando se obtienen las coordenadas
  useEffect(() => {
    if (geolocation.coordinates) {
      setFormData(prev => ({
        ...prev,
        coordinates: geolocation.coordinates
      }));

      // Obtener dirección de las coordenadas
      setGettingAddress(true);
      getAddressFromCoordinates(
        geolocation.coordinates.latitude,
        geolocation.coordinates.longitude
      ).then(address => {
        setFormData(prev => ({
          ...prev,
          location: address
        }));
        setGettingAddress(false);
      }).catch((error) => {
        console.error('Error obteniendo dirección:', error);
        setGettingAddress(false);
      });
    }
  }, [geolocation.coordinates]);

  // Obtener ubicación actual
  const handleGetCurrentLocation = () => {
    console.log('Solicitando ubicación actual...');
    geolocation.getCurrentLocation();
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }
    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }
    if (!formData.period.startDate) {
      newErrors.startDate = 'La fecha de inicio es requerida';
    }
    if (!formData.period.endDate) {
      newErrors.endDate = 'La fecha de fin es requerida';
    }
    if (formData.period.startDate && formData.period.endDate && 
        new Date(formData.period.startDate) >= new Date(formData.period.endDate)) {
      newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular delay de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));

      const reportData = {
        title: formData.title,
        description: formData.description,
        reportType: formData.reportType,
        location: formData.location,
        coordinates: formData.coordinates,
        period: formData.period,
        metrics: formData.metrics,
        status: formData.status,
        createdBy: 'Usuario Actual'
      };

      console.log('Guardando reporte:', reportData);
      onSave(reportData);
    } catch (error) {
      console.error('Error al guardar reporte:', error);
      alert('Error al guardar el reporte. Por favor, inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
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
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
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
            onChange={(e) => setFormData(prev => ({ ...prev, reportType: e.target.value as ProductionReportType }))}
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
            Estado del Reporte
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ReportStatus }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
          >
            <option value="draft">Borrador</option>
            <option value="active">Activo</option>
            <option value="archived">Archivado</option>
            <option value="processing">Procesando</option>
          </select>
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
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

      {/* Ubicación con geolocalización */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
          Ubicación del Reporte
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.location ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Ej: Potrero Norte, Todas las ubicaciones"
              disabled={gettingAddress}
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
            {gettingAddress && (
              <p className="text-blue-500 text-sm mt-1 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Obteniendo dirección...
              </p>
            )}
            {geolocation.error && (
              <p className="text-red-500 text-sm mt-1">{geolocation.error}</p>
            )}
          </div>

          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              disabled={geolocation.loading || gettingAddress}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {geolocation.loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              {geolocation.loading ? 'Obteniendo...' : 'Mi Ubicación'}
            </button>
          </div>
        </div>

        {/* Mostrar coordenadas si están disponibles */}
        {formData.coordinates && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <p className="text-sm font-medium text-green-800">Coordenadas GPS obtenidas:</p>
            </div>
            <p className="text-sm font-mono text-green-700">
              Latitud: {formData.coordinates.latitude.toFixed(6)}, 
              Longitud: {formData.coordinates.longitude.toFixed(6)}
            </p>
          </div>
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
              value={formData.period.type}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                period: { ...prev.period, type: e.target.value as any }
              }))}
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
              value={formData.period.startDate}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                period: { ...prev.period, startDate: e.target.value }
              }))}
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
              value={formData.period.endDate}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                period: { ...prev.period, endDate: e.target.value }
              }))}
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
              value={formData.metrics.totalAnimals}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                metrics: { ...prev.metrics, totalAnimals: parseInt(e.target.value) || 0 }
              }))}
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
              value={formData.metrics.averageWeight}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                metrics: { ...prev.metrics, averageWeight: parseFloat(e.target.value) || 0 }
              }))}
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
              value={formData.metrics.weightGain}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                metrics: { ...prev.metrics, weightGain: parseFloat(e.target.value) || 0 }
              }))}
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
              value={formData.metrics.feedEfficiency}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                metrics: { ...prev.metrics, feedEfficiency: parseFloat(e.target.value) || 0 }
              }))}
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
              value={formData.metrics.mortalityRate}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                metrics: { ...prev.metrics, mortalityRate: parseFloat(e.target.value) || 0 }
              }))}
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
              value={formData.metrics.reproductionRate}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                metrics: { ...prev.metrics, reproductionRate: parseFloat(e.target.value) || 0 }
              }))}
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
              value={formData.metrics.profitability}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                metrics: { ...prev.metrics, profitability: parseFloat(e.target.value) || 0 }
              }))}
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
              value={formData.metrics.costPerKg}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                metrics: { ...prev.metrics, costPerKg: parseFloat(e.target.value) || 0 }
              }))}
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
                value={formData.metrics.milkProduction || 0}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  metrics: { ...prev.metrics, milkProduction: parseFloat(e.target.value) || 0 }
                }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSubmitting 
            ? 'Guardando...' 
            : isEditing 
            ? 'Actualizar Reporte' 
            : 'Crear Reporte'
          }
        </button>
      </div>
    </form>
  );
};

// Componente principal
export const ProductionReports: React.FC<ProductionReportsProps> = ({ }) => {
  const [reports, setReports] = useState<ProductionReport[]>(SAMPLE_REPORTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ProductionReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);

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
    console.log('Abriendo modal para crear reporte...');
    setSelectedReport(null);
    setIsEditing(false);
    setIsModalOpen(true);
  };

  // Abrir modal para editar reporte
  const handleEditReport = (report: ProductionReport) => {
    console.log('Editando reporte:', report.title);
    setSelectedReport(report);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Ver reporte completo
  const handleViewReport = (report: ProductionReport) => {
    console.log('Viendo reporte:', report.title);
    setSelectedReport(report);
    setIsViewerOpen(true);
  };

  // Descargar reporte
  const handleDownloadReport = async (report: ProductionReport, format: 'pdf' | 'excel' = 'pdf') => {
    console.log(`Descargando reporte ${report.title} en formato ${format}`);
    setDownloadLoading(report.id);
    try {
      let blob: Blob;
      let filename: string;
      
      if (format === 'pdf') {
        blob = await generateReportPDF(report);
        filename = `reporte_${report.id}_${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
      } else {
        blob = await generateReportExcel(report);
        filename = `reporte_${report.id}_${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
      }

      // Crear enlace de descarga
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`Descarga completada: ${filename}`);
    } catch (error) {
      console.error('Error al descargar reporte:', error);
      alert('Error al descargar el reporte. Por favor, inténtalo de nuevo.');
    } finally {
      setDownloadLoading(null);
    }
  };

  // Guardar reporte (crear o editar)
  const handleSaveReport = (reportData: Omit<ProductionReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('Guardando reporte:', reportData);
    
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
      console.log('Reporte actualizado exitosamente');
    } else {
      // Crear nuevo reporte
      const newReport: ProductionReport = {
        ...reportData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setReports(prev => [newReport, ...prev]);
      console.log('Nuevo reporte creado exitosamente');
    }
    
    setIsModalOpen(false);
    setSelectedReport(null);
    setIsEditing(false);
  };

  // Eliminar reporte
  const handleDeleteReport = (reportId: string) => {
    console.log('Eliminando reporte con ID:', reportId);
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
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
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
                        {report.coordinates && (
                          <p className="text-xs text-gray-400 mt-1">
                            {report.coordinates.latitude.toFixed(4)}, {report.coordinates.longitude.toFixed(4)}
                          </p>
                        )}
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
                            onClick={() => handleViewReport(report)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Ver reporte completo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadReport(report)}
                            disabled={downloadLoading === report.id}
                            className="p-2 text-[#2d6f51] hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                            title="Descargar reporte"
                          >
                            {downloadLoading === report.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
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

      {/* Modal de formulario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Editar Reporte de Producción' : 'Crear Nuevo Reporte de Producción'}
        size="xl"
      >
        <ReportForm
          report={selectedReport || undefined}
          onSave={handleSaveReport}
          onCancel={() => setIsModalOpen(false)}
          isEditing={isEditing}
        />
      </Modal>

      {/* Modal de visualización de reporte */}
      <Modal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        title="Vista Completa del Reporte"
        size="xl"
      >
        {selectedReport && (
          <ReportViewer
            report={selectedReport}
          />
        )}
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