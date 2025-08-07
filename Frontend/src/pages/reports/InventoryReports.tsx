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
  Package,
  DollarSign,
  MapPin,
  TrendingUp,
  Users,
  BarChart3,
  Target,
  CheckCircle,
  XCircle,
  Clock,
  Archive,
  FileText,
  FileSpreadsheet,
  Share2,
  Navigation,
  Loader2,
  Info
} from 'lucide-react';

// Función de utilidad para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Interfaces para reportes de inventario
interface InventoryReport {
  id: string;
  title: string;
  description: string;
  reportType: InventoryReportType;
  period: ReportPeriod;
  location: string;
  inventoryMetrics: InventoryMetrics;
  categoryBreakdown: CategoryBreakdown[];
  locationBreakdown: LocationBreakdown[];
  movements: InventoryMovement[];
  valuation: InventoryValuation;
  discrepancies: InventoryDiscrepancy[];
  createdAt: string;
  updatedAt: string;
  status: ReportStatus;
  auditor: string;
  createdBy: string;
}

interface InventoryMetrics {
  totalAnimals: number;
  activeAnimals: number;
  newAcquisitions: number;
  sold: number;
  deaths: number;
  transferred: number;
  totalValue: number;
  averageValue: number;
  inventoryTurnover: number;
  accuracyRate: number;
  lastFullCount: string;
  pendingUpdates: number;
}

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  count: number;
  previousCount: number;
  change: number;
  averageAge: number;
  averageWeight: number;
  totalValue: number;
  averageValuePerHead: number;
  status: AnimalStatus[];
}

interface LocationBreakdown {
  locationId: string;
  locationName: string;
  capacity: number;
  currentCount: number;
  occupancyRate: number;
  lastUpdated: string;
  categories: {
    categoryName: string;
    count: number;
  }[];
}

interface InventoryMovement {
  movementId: string;
  movementType: MovementType;
  animalCount: number;
  fromLocation?: string;
  toLocation?: string;
  date: string;
  reason: string;
  cost?: number;
  revenue?: number;
  responsible: string;
}

interface InventoryValuation {
  totalMarketValue: number;
  totalBookValue: number;
  appreciationDepreciation: number;
  averageValuePerCategory: {
    categoryName: string;
    marketValue: number;
    bookValue: number;
  }[];
  valuationMethod: ValuationMethod;
  lastValuationDate: string;
  nextValuationDue: string;
}

interface InventoryDiscrepancy {
  discrepancyId: string;
  location: string;
  category: string;
  expectedCount: number;
  actualCount: number;
  difference: number;
  discrepancyType: DiscrepancyType;
  possibleCauses: string[];
  resolution: string;
  resolved: boolean;
  reportedBy: string;
  reportedDate: string;
}

interface AnimalStatus {
  status: string;
  count: number;
  percentage: number;
}

interface ReportPeriod {
  startDate: string;
  endDate: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
}

// Interface para coordenadas de geolocalización
interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

type InventoryReportType = 
  | 'full_inventory' 
  | 'category_analysis' 
  | 'location_audit' 
  | 'movement_tracking' 
  | 'valuation_report' 
  | 'discrepancy_analysis'
  | 'turnover_analysis';

type ReportStatus = 'draft' | 'active' | 'archived' | 'processing';
type MovementType = 'acquisition' | 'sale' | 'transfer' | 'death' | 'birth' | 'other';
type ValuationMethod = 'market_price' | 'book_value' | 'weighted_average' | 'fifo' | 'lifo';
type DiscrepancyType = 'missing' | 'extra' | 'misclassified' | 'location_error';

// Props del componente principal
interface InventoryReportsProps {
  className?: string;
}

// Props del modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// Props del formulario
interface ReportFormProps {
  report?: InventoryReport;
  onSave: (report: Omit<InventoryReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing: boolean;
}

// Props del visor de reportes
interface ReportViewerProps {
  report: InventoryReport;
  onClose: () => void;
}

// Datos de ejemplo
const SAMPLE_REPORTS: InventoryReport[] = [
  {
    id: '1',
    title: 'Inventario General - Enero 2025',
    description: 'Conteo completo de ganado en todas las ubicaciones',
    reportType: 'full_inventory',
    period: {
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      type: 'monthly'
    },
    location: 'Todas las ubicaciones',
    inventoryMetrics: {
      totalAnimals: 1248,
      activeAnimals: 1156,
      newAcquisitions: 45,
      sold: 32,
      deaths: 8,
      transferred: 47,
      totalValue: 2847560.00,
      averageValue: 2282.50,
      inventoryTurnover: 12.5,
      accuracyRate: 97.8,
      lastFullCount: '2025-01-31',
      pendingUpdates: 12
    },
    categoryBreakdown: [
      {
        categoryId: 'cows',
        categoryName: 'Vacas',
        count: 485,
        previousCount: 478,
        change: 7,
        averageAge: 4.2,
        averageWeight: 520.5,
        totalValue: 1455000.00,
        averageValuePerHead: 3000.00,
        status: [
          { status: 'Activa', count: 465, percentage: 95.9 },
          { status: 'Gestante', count: 156, percentage: 32.2 },
          { status: 'Lactante', count: 289, percentage: 59.6 }
        ]
      },
      {
        categoryId: 'bulls',
        categoryName: 'Toros',
        count: 48,
        previousCount: 45,
        change: 3,
        averageAge: 3.8,
        averageWeight: 785.2,
        totalValue: 240000.00,
        averageValuePerHead: 5000.00,
        status: [
          { status: 'Activo', count: 46, percentage: 95.8 },
          { status: 'Reproductor', count: 38, percentage: 79.2 }
        ]
      },
      {
        categoryId: 'calves',
        categoryName: 'Terneros',
        count: 324,
        previousCount: 298,
        change: 26,
        averageAge: 0.8,
        averageWeight: 185.3,
        totalValue: 486000.00,
        averageValuePerHead: 1500.00,
        status: [
          { status: 'Activo', count: 320, percentage: 98.8 },
          { status: 'Destetado', count: 89, percentage: 27.5 }
        ]
      },
      {
        categoryId: 'heifers',
        categoryName: 'Vaquillas',
        count: 391,
        previousCount: 387,
        change: 4,
        averageAge: 1.9,
        averageWeight: 385.7,
        totalValue: 666560.00,
        averageValuePerHead: 1705.00,
        status: [
          { status: 'Activa', count: 385, percentage: 98.5 },
          { status: 'Lista para servicio', count: 125, percentage: 32.0 }
        ]
      }
    ],
    locationBreakdown: [
      {
        locationId: 'north_pasture',
        locationName: 'Potrero Norte',
        capacity: 400,
        currentCount: 385,
        occupancyRate: 96.25,
        lastUpdated: '2025-01-31T10:30:00Z',
        categories: [
          { categoryName: 'Vacas', count: 165 },
          { categoryName: 'Vaquillas', count: 145 },
          { categoryName: 'Terneros', count: 75 }
        ]
      },
      {
        locationId: 'south_pasture',
        locationName: 'Potrero Sur',
        capacity: 350,
        currentCount: 324,
        occupancyRate: 92.57,
        lastUpdated: '2025-01-31T11:15:00Z',
        categories: [
          { categoryName: 'Vacas', count: 158 },
          { categoryName: 'Vaquillas', count: 98 },
          { categoryName: 'Terneros', count: 68 }
        ]
      },
      {
        locationId: 'breeding_area',
        locationName: 'Área de Reproducción',
        capacity: 200,
        currentCount: 187,
        occupancyRate: 93.5,
        lastUpdated: '2025-01-31T09:45:00Z',
        categories: [
          { categoryName: 'Vacas', count: 98 },
          { categoryName: 'Toros', count: 15 },
          { categoryName: 'Vaquillas', count: 74 }
        ]
      }
    ],
    movements: [
      {
        movementId: 'mov001',
        movementType: 'acquisition',
        animalCount: 25,
        toLocation: 'Potrero Norte',
        date: '2025-01-15',
        reason: 'Compra de vaquillas reproductoras',
        cost: 42500.00,
        responsible: 'Juan Pérez'
      },
      {
        movementId: 'mov002',
        movementType: 'sale',
        animalCount: 18,
        fromLocation: 'Potrero Sur',
        date: '2025-01-22',
        reason: 'Venta de animales de descarte',
        revenue: 54000.00,
        responsible: 'María González'
      },
      {
        movementId: 'mov003',
        movementType: 'transfer',
        animalCount: 32,
        fromLocation: 'Potrero Norte',
        toLocation: 'Área de Reproducción',
        date: '2025-01-28',
        reason: 'Traslado para servicio',
        responsible: 'Carlos Rodríguez'
      }
    ],
    valuation: {
      totalMarketValue: 2847560.00,
      totalBookValue: 2654300.00,
      appreciationDepreciation: 193260.00,
      averageValuePerCategory: [
        {
          categoryName: 'Vacas',
          marketValue: 1455000.00,
          bookValue: 1358500.00
        },
        {
          categoryName: 'Toros',
          marketValue: 240000.00,
          bookValue: 225000.00
        },
        {
          categoryName: 'Terneros',
          marketValue: 486000.00,
          bookValue: 465600.00
        },
        {
          categoryName: 'Vaquillas',
          marketValue: 666560.00,
          bookValue: 605200.00
        }
      ],
      valuationMethod: 'market_price',
      lastValuationDate: '2025-01-31',
      nextValuationDue: '2025-04-30'
    },
    discrepancies: [
      {
        discrepancyId: 'disc001',
        location: 'Potrero Norte',
        category: 'Terneros',
        expectedCount: 78,
        actualCount: 75,
        difference: -3,
        discrepancyType: 'missing',
        possibleCauses: ['Movimiento no registrado', 'Error de conteo anterior'],
        resolution: 'Se encontraron en área de maternidad sin registrar',
        resolved: true,
        reportedBy: 'Ana Martínez',
        reportedDate: '2025-01-29'
      },
      {
        discrepancyId: 'disc002',
        location: 'Potrero Sur',
        category: 'Vaquillas',
        expectedCount: 95,
        actualCount: 98,
        difference: 3,
        discrepancyType: 'extra',
        possibleCauses: ['Traslado no registrado', 'Error en clasificación'],
        resolution: 'Pendiente de verificación',
        resolved: false,
        reportedBy: 'Luis Torres',
        reportedDate: '2025-01-30'
      }
    ],
    createdAt: '2025-01-31T16:30:00Z',
    updatedAt: '2025-01-31T18:45:00Z',
    status: 'active',
    auditor: 'Dra. Carmen Vega',
    createdBy: 'Juan Pérez'
  }
];

// Configuración de tipos de reporte
const REPORT_TYPE_CONFIG = {
  full_inventory: {
    label: 'Inventario Completo',
    icon: <Package className="w-4 h-4" />,
    color: '#2d6f51'
  },
  category_analysis: {
    label: 'Análisis por Categoría',
    icon: <BarChart3 className="w-4 h-4" />,
    color: '#4e9c75'
  },
  location_audit: {
    label: 'Auditoría por Ubicación',
    icon: <MapPin className="w-4 h-4" />,
    color: '#519a7c'
  },
  movement_tracking: {
    label: 'Seguimiento de Movimientos',
    icon: <TrendingUp className="w-4 h-4" />,
    color: '#3ca373'
  },
  valuation_report: {
    label: 'Reporte de Valuación',
    icon: <DollarSign className="w-4 h-4" />,
    color: '#f4ac3a'
  },
  discrepancy_analysis: {
    label: 'Análisis de Discrepancias',
    icon: <AlertCircle className="w-4 h-4" />,
    color: '#e74c3c'
  },
  turnover_analysis: {
    label: 'Análisis de Rotación',
    icon: <Target className="w-4 h-4" />,
    color: '#2e8b57'
  }
};

// Métodos de valuación
const VALUATION_METHOD_CONFIG = {
  market_price: { label: 'Precio de Mercado' },
  book_value: { label: 'Valor en Libros' },
  weighted_average: { label: 'Promedio Ponderado' },
  fifo: { label: 'PEPS (Primero en Entrar, Primero en Salir)' },
  lifo: { label: 'UEPS (Último en Entrar, Primero en Salir)' }
};

// Hook para geolocalización
const useGeolocation = () => {
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getCurrentLocation = (): Promise<Coordinates> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada en este navegador'));
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          };
          setCoordinates(coords);
          setLoading(false);
          resolve(coords);
        },
        (error) => {
          let errorMessage = 'Error obteniendo ubicación';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permisos de ubicación denegados';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Ubicación no disponible';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado';
              break;
          }
          setError(errorMessage);
          setLoading(false);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    });
  };

  return { coordinates, error, loading, getCurrentLocation };
};

// Funciones de utilidad para descargas
const downloadService = {
  // Descargar como PDF
  downloadAsPDF: (report: InventoryReport) => {
    try {
      // Crear contenido HTML para el PDF
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>${report.title}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { border-bottom: 2px solid #2d6f51; padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
            .metric-card { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${report.title}</h1>
            <p><strong>Descripción:</strong> ${report.description}</p>
            <p><strong>Período:</strong> ${new Date(report.period.startDate).toLocaleDateString()} - ${new Date(report.period.endDate).toLocaleDateString()}</p>
            <p><strong>Ubicación:</strong> ${report.location}</p>
            <p><strong>Auditor:</strong> ${report.auditor}</p>
          </div>
          
          <div class="section">
            <h2>Métricas de Inventario</h2>
            <div class="metrics">
              <div class="metric-card">
                <h4>Total de Animales</h4>
                <p>${report.inventoryMetrics.totalAnimals}</p>
              </div>
              <div class="metric-card">
                <h4>Animales Activos</h4>
                <p>${report.inventoryMetrics.activeAnimals}</p>
              </div>
              <div class="metric-card">
                <h4>Valor Total</h4>
                <p>$${report.inventoryMetrics.totalValue.toLocaleString()}</p>
              </div>
              <div class="metric-card">
                <h4>Tasa de Precisión</h4>
                <p>${report.inventoryMetrics.accuracyRate}%</p>
              </div>
            </div>
          </div>
          
          ${report.categoryBreakdown.length > 0 ? `
          <div class="section">
            <h2>Desglose por Categoría</h2>
            <table>
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th>Cantidad</th>
                  <th>Cambio</th>
                  <th>Valor Total</th>
                  <th>Valor Promedio</th>
                </tr>
              </thead>
              <tbody>
                ${report.categoryBreakdown.map(cat => `
                  <tr>
                    <td>${cat.categoryName}</td>
                    <td>${cat.count}</td>
                    <td>${cat.change > 0 ? '+' : ''}${cat.change}</td>
                    <td>$${cat.totalValue.toLocaleString()}</td>
                    <td>$${cat.averageValuePerHead.toLocaleString()}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ` : ''}
          
          <div class="section">
            <h2>Valuación</h2>
            <p><strong>Valor de Mercado:</strong> $${report.valuation.totalMarketValue.toLocaleString()}</p>
            <p><strong>Valor en Libros:</strong> $${report.valuation.totalBookValue.toLocaleString()}</p>
            <p><strong>Apreciación/Depreciación:</strong> $${report.valuation.appreciationDepreciation.toLocaleString()}</p>
            <p><strong>Método de Valuación:</strong> ${VALUATION_METHOD_CONFIG[report.valuation.valuationMethod]?.label}</p>
          </div>
        </body>
        </html>
      `;

      // Crear blob y descargar
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}_reporte.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el archivo PDF');
    }
  },

  // Descargar como Excel/CSV
  downloadAsExcel: (report: InventoryReport) => {
    try {
      let csvContent = "data:text/csv;charset=utf-8,";
      
      // Header del reporte
      csvContent += `Reporte de Inventario\n`;
      csvContent += `Título,${report.title}\n`;
      csvContent += `Descripción,${report.description}\n`;
      csvContent += `Período,${new Date(report.period.startDate).toLocaleDateString()} - ${new Date(report.period.endDate).toLocaleDateString()}\n`;
      csvContent += `Ubicación,${report.location}\n`;
      csvContent += `Auditor,${report.auditor}\n\n`;
      
      // Métricas principales
      csvContent += `Métricas de Inventario\n`;
      csvContent += `Métrica,Valor\n`;
      csvContent += `Total de Animales,${report.inventoryMetrics.totalAnimals}\n`;
      csvContent += `Animales Activos,${report.inventoryMetrics.activeAnimals}\n`;
      csvContent += `Nuevas Adquisiciones,${report.inventoryMetrics.newAcquisitions}\n`;
      csvContent += `Vendidos,${report.inventoryMetrics.sold}\n`;
      csvContent += `Muertes,${report.inventoryMetrics.deaths}\n`;
      csvContent += `Transferidos,${report.inventoryMetrics.transferred}\n`;
      csvContent += `Valor Total,$${report.inventoryMetrics.totalValue}\n`;
      csvContent += `Valor Promedio,$${report.inventoryMetrics.averageValue}\n`;
      csvContent += `Rotación de Inventario,${report.inventoryMetrics.inventoryTurnover}%\n`;
      csvContent += `Tasa de Precisión,${report.inventoryMetrics.accuracyRate}%\n\n`;
      
      // Desglose por categoría
      if (report.categoryBreakdown.length > 0) {
        csvContent += `Desglose por Categoría\n`;
        csvContent += `Categoría,Cantidad,Cantidad Anterior,Cambio,Edad Promedio,Peso Promedio,Valor Total,Valor Promedio por Cabeza\n`;
        report.categoryBreakdown.forEach(cat => {
          csvContent += `${cat.categoryName},${cat.count},${cat.previousCount},${cat.change},${cat.averageAge},${cat.averageWeight},${cat.totalValue},${cat.averageValuePerHead}\n`;
        });
        csvContent += `\n`;
      }
      
      // Valuación
      csvContent += `Valuación\n`;
      csvContent += `Concepto,Valor\n`;
      csvContent += `Valor de Mercado Total,$${report.valuation.totalMarketValue}\n`;
      csvContent += `Valor en Libros Total,$${report.valuation.totalBookValue}\n`;
      csvContent += `Apreciación/Depreciación,$${report.valuation.appreciationDepreciation}\n`;
      csvContent += `Método de Valuación,${VALUATION_METHOD_CONFIG[report.valuation.valuationMethod]?.label}\n`;
      csvContent += `Fecha de Última Valuación,${report.valuation.lastValuationDate}\n`;
      csvContent += `Próxima Valuación,${report.valuation.nextValuationDue}\n`;
      
      // Crear y descargar archivo
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}_datos.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error generando Excel:', error);
      alert('Error al generar el archivo Excel');
    }
  },

  // Compartir reporte
  shareReport: async (report: InventoryReport) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: report.title,
          text: report.description,
          url: window.location.href
        });
      } else {
        // Fallback: copiar al portapapeles
        const shareText = `${report.title}\n${report.description}\n\nTotal de animales: ${report.inventoryMetrics.totalAnimals}\nValor total: $${report.inventoryMetrics.totalValue.toLocaleString()}`;
        await navigator.clipboard.writeText(shareText);
        alert('Información del reporte copiada al portapapeles');
      }
    } catch (error) {
      console.error('Error compartiendo:', error);
      alert('Error al compartir el reporte');
    }
  }
};

// Componente Modal reutilizable mejorado
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, size = 'lg' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-7xl'
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            "bg-white rounded-xl shadow-2xl w-full max-h-[95vh] overflow-hidden",
            sizeClasses[size]
          )}
        >
          {/* Header del modal */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75]">
            <h2 className="text-lg sm:text-xl font-semibold text-white pr-4">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Contenido del modal */}
          <div className="p-4 sm:p-6 max-h-[calc(95vh-80px)] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente Visor de Reportes
const ReportViewer: React.FC<ReportViewerProps> = ({ report }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'locations' | 'movements' | 'valuation' | 'discrepancies'>('overview');

  const tabs = [
    { id: 'overview', label: 'Resumen', icon: <Info className="w-4 h-4" /> },
    { id: 'categories', label: 'Categorías', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'locations', label: 'Ubicaciones', icon: <MapPin className="w-4 h-4" /> },
    { id: 'movements', label: 'Movimientos', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'valuation', label: 'Valuación', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'discrepancies', label: 'Discrepancias', icon: <AlertCircle className="w-4 h-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header del reporte */}
      <div className="border-b border-gray-200 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{report.title}</h3>
            <p className="text-gray-600 mt-1">{report.description}</p>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {report.location}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {report.auditor}
              </span>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadService.downloadAsPDF(report)}
              className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={() => downloadService.downloadAsExcel(report)}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">Excel</span>
            </button>
            <button
              onClick={() => downloadService.shareReport(report)}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Compartir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs de navegación */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "text-[#2d6f51] border-b-2 border-[#2d6f51] bg-green-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido de tabs */}
      <div className="min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Métricas principales */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Total</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{report.inventoryMetrics.totalAnimals}</div>
                <div className="text-xs text-blue-600">animales</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Activos</span>
                </div>
                <div className="text-2xl font-bold text-green-900">{report.inventoryMetrics.activeAnimals}</div>
                <div className="text-xs text-green-600">animales</div>
              </div>
              
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">Valor</span>
                </div>
                <div className="text-2xl font-bold text-yellow-900">
                  ${(report.inventoryMetrics.totalValue / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs text-yellow-600">total</div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Precisión</span>
                </div>
                <div className="text-2xl font-bold text-purple-900">{report.inventoryMetrics.accuracyRate}%</div>
                <div className="text-xs text-purple-600">tasa</div>
              </div>
            </div>

            {/* Movimientos recientes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Adquisiciones</span>
                </div>
                <div className="text-xl font-bold text-blue-900">{report.inventoryMetrics.newAcquisitions}</div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Ventas</span>
                </div>
                <div className="text-xl font-bold text-green-900">{report.inventoryMetrics.sold}</div>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Archive className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">Transferencias</span>
                </div>
                <div className="text-xl font-bold text-orange-900">{report.inventoryMetrics.transferred}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-4">
            {report.categoryBreakdown.map((category) => (
              <div key={category.categoryId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{category.categoryName}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-gray-600">Cantidad:</span>
                        <span className="font-medium ml-1">{category.count}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Cambio:</span>
                        <span className={cn(
                          "font-medium ml-1",
                          category.change > 0 ? "text-green-600" : category.change < 0 ? "text-red-600" : "text-gray-600"
                        )}>
                          {category.change > 0 ? '+' : ''}{category.change}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Valor:</span>
                        <span className="font-medium ml-1">${category.totalValue.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Prom/cabeza:</span>
                        <span className="font-medium ml-1">${category.averageValuePerHead.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{category.count}</div>
                    <div className="text-sm text-gray-600">animales</div>
                  </div>
                </div>
                
                {/* Estados de los animales */}
                {category.status.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Estados:</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {category.status.map((status, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">{status.status}:</span>
                          <span className="font-medium">{status.count} ({status.percentage.toFixed(1)}%)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'locations' && (
          <div className="space-y-4">
            {report.locationBreakdown.map((location) => (
              <div key={location.locationId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{location.locationName}</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-gray-600">Capacidad:</span>
                        <span className="font-medium ml-1">{location.capacity}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Ocupación:</span>
                        <span className="font-medium ml-1">{location.occupancyRate.toFixed(1)}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Actualizado:</span>
                        <span className="font-medium ml-1">{new Date(location.lastUpdated).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{location.currentCount}</div>
                    <div className="text-sm text-gray-600">de {location.capacity}</div>
                  </div>
                </div>
                
                {/* Categorías en esta ubicación */}
                {location.categories.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">Distribución:</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {location.categories.map((cat, index) => (
                        <div key={index} className="flex justify-between items-center text-xs">
                          <span className="text-gray-600">{cat.categoryName}:</span>
                          <span className="font-medium">{cat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'movements' && (
          <div className="space-y-4">
            {report.movements.map((movement) => (
              <div key={movement.movementId} className="bg-gray-50 rounded-lg p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "px-2 py-1 text-xs font-medium rounded-full",
                        movement.movementType === 'acquisition' ? "bg-blue-100 text-blue-800" :
                        movement.movementType === 'sale' ? "bg-green-100 text-green-800" :
                        movement.movementType === 'transfer' ? "bg-orange-100 text-orange-800" :
                        "bg-gray-100 text-gray-800"
                      )}>
                        {movement.movementType === 'acquisition' ? 'Adquisición' :
                         movement.movementType === 'sale' ? 'Venta' :
                         movement.movementType === 'transfer' ? 'Transferencia' :
                         movement.movementType}
                      </span>
                      <span className="text-sm text-gray-600">{new Date(movement.date).toLocaleDateString()}</span>
                    </div>
                    <p className="font-medium text-gray-800">{movement.reason}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Responsable: {movement.responsible}
                    </p>
                    {(movement.fromLocation || movement.toLocation) && (
                      <p className="text-sm text-gray-600 mt-1">
                        {movement.fromLocation && `Desde: ${movement.fromLocation}`}
                        {movement.fromLocation && movement.toLocation && ' → '}
                        {movement.toLocation && `Hacia: ${movement.toLocation}`}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-800">{movement.animalCount}</div>
                    <div className="text-sm text-gray-600">animales</div>
                    {(movement.cost || movement.revenue) && (
                      <div className="text-sm font-medium mt-1">
                        {movement.cost && <span className="text-red-600">-${movement.cost.toLocaleString()}</span>}
                        {movement.revenue && <span className="text-green-600">+${movement.revenue.toLocaleString()}</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'valuation' && (
          <div className="space-y-6">
            {/* Resumen de valuación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Valor de Mercado</h4>
                <div className="text-2xl font-bold text-blue-900">
                  ${report.valuation.totalMarketValue.toLocaleString()}
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-green-800 mb-2">Valor en Libros</h4>
                <div className="text-2xl font-bold text-green-900">
                  ${report.valuation.totalBookValue.toLocaleString()}
                </div>
              </div>
              
              <div className={cn(
                "rounded-lg p-4",
                report.valuation.appreciationDepreciation >= 0 ? "bg-green-50" : "bg-red-50"
              )}>
                <h4 className={cn(
                  "text-sm font-medium mb-2",
                  report.valuation.appreciationDepreciation >= 0 ? "text-green-800" : "text-red-800"
                )}>
                  {report.valuation.appreciationDepreciation >= 0 ? 'Apreciación' : 'Depreciación'}
                </h4>
                <div className={cn(
                  "text-2xl font-bold",
                  report.valuation.appreciationDepreciation >= 0 ? "text-green-900" : "text-red-900"
                )}>
                  ${Math.abs(report.valuation.appreciationDepreciation).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Detalles de valuación */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Detalles de Valuación</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Método de Valuación:</span>
                  <span className="font-medium ml-2">
                    {VALUATION_METHOD_CONFIG[report.valuation.valuationMethod]?.label}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Última Valuación:</span>
                  <span className="font-medium ml-2">
                    {new Date(report.valuation.lastValuationDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-600">Próxima Valuación:</span>
                  <span className="font-medium ml-2">
                    {new Date(report.valuation.nextValuationDue).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Valuación por categoría */}
            {report.valuation.averageValuePerCategory.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Valuación por Categoría</h4>
                <div className="space-y-3">
                  {report.valuation.averageValuePerCategory.map((cat, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">{cat.categoryName}</span>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">Mercado: ${cat.marketValue.toLocaleString()}</div>
                          <div className="text-sm text-gray-600">Libros: ${cat.bookValue.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'discrepancies' && (
          <div className="space-y-4">
            {report.discrepancies.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">Sin Discrepancias</h3>
                <p className="text-gray-600">No se encontraron discrepancias en este reporte.</p>
              </div>
            ) : (
              report.discrepancies.map((discrepancy) => (
                <div key={discrepancy.discrepancyId} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          discrepancy.resolved ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        )}>
                          {discrepancy.resolved ? 'Resuelto' : 'Pendiente'}
                        </span>
                        <span className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          discrepancy.discrepancyType === 'missing' ? "bg-red-100 text-red-800" :
                          discrepancy.discrepancyType === 'extra' ? "bg-blue-100 text-blue-800" :
                          "bg-yellow-100 text-yellow-800"
                        )}>
                          {discrepancy.discrepancyType === 'missing' ? 'Faltante' :
                           discrepancy.discrepancyType === 'extra' ? 'Exceso' :
                           discrepancy.discrepancyType === 'misclassified' ? 'Mal clasificado' :
                           'Error de ubicación'}
                        </span>
                      </div>
                      
                      <h4 className="font-medium text-gray-800">
                        {discrepancy.category} en {discrepancy.location}
                      </h4>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2 text-sm">
                        <div>
                          <span className="text-gray-600">Esperado:</span>
                          <span className="font-medium ml-1">{discrepancy.expectedCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Actual:</span>
                          <span className="font-medium ml-1">{discrepancy.actualCount}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Diferencia:</span>
                          <span className={cn(
                            "font-medium ml-1",
                            discrepancy.difference > 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {discrepancy.difference > 0 ? '+' : ''}{discrepancy.difference}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <div className="text-gray-600 mb-1">Posibles causas:</div>
                        <ul className="list-disc list-inside text-gray-700 space-y-1">
                          {discrepancy.possibleCauses.map((cause, index) => (
                            <li key={index}>{cause}</li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="mt-3 text-sm">
                        <div className="text-gray-600">Resolución:</div>
                        <p className="text-gray-700 mt-1">{discrepancy.resolution}</p>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500">
                        Reportado por {discrepancy.reportedBy} el {new Date(discrepancy.reportedDate).toLocaleDateString()}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={cn(
                        "text-2xl font-bold",
                        discrepancy.difference > 0 ? "text-green-600" : "text-red-600"
                      )}>
                        {discrepancy.difference > 0 ? '+' : ''}{discrepancy.difference}
                      </div>
                      <div className="text-sm text-gray-600">diferencia</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Componente Formulario de Reporte de Inventario mejorado
const InventoryReportForm: React.FC<ReportFormProps> = ({ report, onSave, onCancel, isEditing }) => {
  const [formData, setFormData] = useState<Partial<InventoryReport>>({
    title: report?.title || '',
    description: report?.description || '',
    reportType: report?.reportType || 'full_inventory',
    location: report?.location || '',
    auditor: report?.auditor || '',
    period: report?.period || {
      startDate: '',
      endDate: '',
      type: 'monthly'
    },
    inventoryMetrics: report?.inventoryMetrics || {
      totalAnimals: 0,
      activeAnimals: 0,
      newAcquisitions: 0,
      sold: 0,
      deaths: 0,
      transferred: 0,
      totalValue: 0,
      averageValue: 0,
      inventoryTurnover: 0,
      accuracyRate: 0,
      lastFullCount: '',
      pendingUpdates: 0
    },
    valuation: report?.valuation || {
      totalMarketValue: 0,
      totalBookValue: 0,
      appreciationDepreciation: 0,
      averageValuePerCategory: [],
      valuationMethod: 'market_price',
      lastValuationDate: '',
      nextValuationDue: ''
    },
    categoryBreakdown: report?.categoryBreakdown || [],
    locationBreakdown: report?.locationBreakdown || [],
    movements: report?.movements || [],
    discrepancies: report?.discrepancies || [],
    status: report?.status || 'draft'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { error: geoError, loading: geoLoading, getCurrentLocation } = useGeolocation();
  
  // Manejar geolocalización
  const handleGetCurrentLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      // Aquí podrías hacer geocodificación inversa para obtener la dirección
      const locationString = `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
      setFormData(prev => ({
        ...prev,
        location: locationString
      }));
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
    }
  };

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
    if (!formData.auditor?.trim()) {
      newErrors.auditor = 'El auditor responsable es requerido';
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

    // Validaciones de consistencia en métricas
    const metrics = formData.inventoryMetrics;
    if (metrics) {
      if (metrics.activeAnimals > metrics.totalAnimals) {
        newErrors.consistency = 'Los animales activos no pueden exceder el total';
      }
      if (metrics.accuracyRate > 100) {
        newErrors.accuracyRate = 'La tasa de precisión no puede exceder 100%';
      }
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

  // Manejar cambios en las métricas de inventario
  const handleMetricsChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      inventoryMetrics: {
        ...prev.inventoryMetrics!,
        [field]: value
      }
    }));
  };

  // Manejar cambios en la valuación
  const handleValuationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      valuation: {
        ...prev.valuation!,
        [field]: value
      }
    }));
  };

  // Calcular métricas automáticas
  const calculateDerivedMetrics = () => {
    const metrics = formData.inventoryMetrics!;
    const updatedMetrics = { ...metrics };

    // Calcular valor promedio por animal
    if (metrics.totalAnimals > 0) {
      updatedMetrics.averageValue = metrics.totalValue / metrics.totalAnimals;
    }

    // Calcular tasa de rotación de inventario
    const totalMovements = metrics.newAcquisitions + metrics.sold + metrics.deaths + metrics.transferred;
    if (metrics.totalAnimals > 0) {
      updatedMetrics.inventoryTurnover = (totalMovements / metrics.totalAnimals) * 100;
    }

    setFormData(prev => ({
      ...prev,
      inventoryMetrics: updatedMetrics
    }));

    // Calcular apreciación/depreciación
    const valuation = formData.valuation!;
    const updatedValuation = { ...valuation };
    updatedValuation.appreciationDepreciation = valuation.totalMarketValue - valuation.totalBookValue;

    setFormData(prev => ({
      ...prev,
      valuation: updatedValuation
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
      auditor: formData.auditor!,
      period: formData.period!,
      inventoryMetrics: formData.inventoryMetrics!,
      categoryBreakdown: formData.categoryBreakdown!,
      locationBreakdown: formData.locationBreakdown!,
      movements: formData.movements!,
      valuation: formData.valuation!,
      discrepancies: formData.discrepancies!,
      status: formData.status!,
      createdBy: 'Usuario Actual' // En una app real vendría del contexto de auth
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
      {/* Información básica */}
      <div className="space-y-4 sm:space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
          Información General
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
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
              placeholder="Ej: Inventario General - Enero 2025"
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
              onChange={(e) => handleInputChange('reportType', e.target.value as InventoryReportType)}
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
            <div className="flex gap-2">
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className={cn(
                  "flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                  errors.location ? "border-red-500" : "border-gray-300"
                )}
                placeholder="Ej: Potrero Norte, Todas las ubicaciones"
              />
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={geoLoading}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1 text-sm whitespace-nowrap"
                title="Obtener ubicación actual"
              >
                {geoLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">GPS</span>
              </button>
            </div>
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
            {geoError && (
              <p className="text-orange-500 text-sm mt-1">{geoError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auditor Responsable *
            </label>
            <input
              type="text"
              value={formData.auditor}
              onChange={(e) => handleInputChange('auditor', e.target.value)}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.auditor ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Ej: Dra. Carmen Vega"
            />
            {errors.auditor && (
              <p className="text-red-500 text-sm mt-1">{errors.auditor}</p>
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
            placeholder="Describe el propósito y alcance del reporte de inventario"
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">{errors.description}</p>
          )}
        </div>
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

      {/* Métricas de inventario */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-medium text-gray-800 border-b pb-2 flex-1">
            Métricas de Inventario
          </h3>
          <button
            type="button"
            onClick={calculateDerivedMetrics}
            className="text-sm text-[#2d6f51] hover:text-[#265a44] font-medium flex items-center gap-1 whitespace-nowrap"
          >
            <Target className="w-4 h-4" />
            Calcular Automáticamente
          </button>
        </div>
        
        {errors.consistency && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errors.consistency}</p>
          </div>
        )}

        {/* Métricas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 inline mr-1" />
              Total de Animales
            </label>
            <input
              type="number"
              min="0"
              value={formData.inventoryMetrics?.totalAnimals || 0}
              onChange={(e) => handleMetricsChange('totalAnimals', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CheckCircle className="w-4 h-4 inline mr-1 text-green-600" />
              Animales Activos
            </label>
            <input
              type="number"
              min="0"
              value={formData.inventoryMetrics?.activeAnimals || 0}
              onChange={(e) => handleMetricsChange('activeAnimals', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TrendingUp className="w-4 h-4 inline mr-1 text-blue-600" />
              Nuevas Adquisiciones
            </label>
            <input
              type="number"
              min="0"
              value={formData.inventoryMetrics?.newAcquisitions || 0}
              onChange={(e) => handleMetricsChange('newAcquisitions', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1 text-green-600" />
              Vendidos
            </label>
            <input
              type="number"
              min="0"
              value={formData.inventoryMetrics?.sold || 0}
              onChange={(e) => handleMetricsChange('sold', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <XCircle className="w-4 h-4 inline mr-1 text-red-600" />
              Muertes
            </label>
            <input
              type="number"
              min="0"
              value={formData.inventoryMetrics?.deaths || 0}
              onChange={(e) => handleMetricsChange('deaths', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Archive className="w-4 h-4 inline mr-1 text-orange-600" />
              Transferidos
            </label>
            <input
              type="number"
              min="0"
              value={formData.inventoryMetrics?.transferred || 0}
              onChange={(e) => handleMetricsChange('transferred', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Total ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.inventoryMetrics?.totalValue || 0}
              onChange={(e) => handleMetricsChange('totalValue', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor Promedio ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.inventoryMetrics?.averageValue || 0}
              onChange={(e) => handleMetricsChange('averageValue', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>
        </div>

        {/* Métricas adicionales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Target className="w-4 h-4 inline mr-1" />
              Rotación de Inventario (%)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={formData.inventoryMetrics?.inventoryTurnover || 0}
              onChange={(e) => handleMetricsChange('inventoryTurnover', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tasa de Precisión (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={formData.inventoryMetrics?.accuracyRate || 0}
              onChange={(e) => handleMetricsChange('accuracyRate', parseFloat(e.target.value) || 0)}
              className={cn(
                "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors",
                errors.accuracyRate ? "border-red-500" : "border-gray-300"
              )}
            />
            {errors.accuracyRate && (
              <p className="text-red-500 text-sm mt-1">{errors.accuracyRate}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Último Conteo Completo
            </label>
            <input
              type="date"
              value={formData.inventoryMetrics?.lastFullCount || ''}
              onChange={(e) => {
                setFormData(prev => ({
                  ...prev,
                  inventoryMetrics: {
                    ...prev.inventoryMetrics!,
                    lastFullCount: e.target.value
                  }
                }));
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Actualizaciones Pendientes
            </label>
            <input
              type="number"
              min="0"
              value={formData.inventoryMetrics?.pendingUpdates || 0}
              onChange={(e) => handleMetricsChange('pendingUpdates', parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Valuación */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
          Valuación del Inventario
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor de Mercado Total ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.valuation?.totalMarketValue || 0}
              onChange={(e) => handleValuationChange('totalMarketValue', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Valor en Libros Total ($)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.valuation?.totalBookValue || 0}
              onChange={(e) => handleValuationChange('totalBookValue', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apreciación/Depreciación ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.valuation?.appreciationDepreciation || 0}
              onChange={(e) => handleValuationChange('appreciationDepreciation', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Método de Valuación
            </label>
            <select
              value={formData.valuation?.valuationMethod}
              onChange={(e) => handleValuationChange('valuationMethod', e.target.value as ValuationMethod)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            >
              {Object.entries(VALUATION_METHOD_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Última Valuación
            </label>
            <input
              type="date"
              value={formData.valuation?.lastValuationDate || ''}
              onChange={(e) => handleValuationChange('lastValuationDate', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Próxima Valuación Programada
            </label>
            <input
              type="date"
              value={formData.valuation?.nextValuationDue || ''}
              onChange={(e) => handleValuationChange('nextValuationDue', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Estado del reporte */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
          Estado del Reporte
        </h3>
        
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
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200"
        >
          <Save className="w-4 h-4" />
          {isEditing ? 'Actualizar Reporte' : 'Crear Reporte'}
        </button>
      </div>
    </form>
  );
};

// Componente principal mejorado
export const InventoryReports: React.FC<InventoryReportsProps> = ({ className }) => {
  const [reports, setReports] = useState<InventoryReport[]>(SAMPLE_REPORTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<InventoryReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [viewingReport, setViewingReport] = useState<InventoryReport | null>(null);
  const [downloadLoading, setDownloadLoading] = useState<string | null>(null);

  // Filtrar reportes
  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.auditor.toLowerCase().includes(searchTerm.toLowerCase());
    
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
  const handleEditReport = (report: InventoryReport) => {
    setSelectedReport(report);
    setIsEditing(true);
    setIsModalOpen(true);
  };

  // Ver reporte en modal
  const handleViewReport = (report: InventoryReport) => {
    setViewingReport(report);
  };

  // Descargar reporte
  const handleDownloadReport = async (report: InventoryReport, format: 'pdf' | 'excel') => {
    setDownloadLoading(report.id);
    try {
      if (format === 'pdf') {
        downloadService.downloadAsPDF(report);
      } else {
        downloadService.downloadAsExcel(report);
      }
    } catch (error) {
      console.error('Error descargando reporte:', error);
    } finally {
      setTimeout(() => setDownloadLoading(null), 1000);
    }
  };

  // Guardar reporte (crear o editar)
  const handleSaveReport = (reportData: Omit<InventoryReport, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isEditing && selectedReport) {
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
      const newReport: InventoryReport = {
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
    <div className={cn("min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6", className)}>
      <div className="max-w-full mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Reportes de Inventario Ganadero
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Gestiona y analiza el inventario, valuación y movimientos del ganado
            </p>
          </div>

          <button
            onClick={handleCreateReport}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 shadow-lg text-sm sm:text-base"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Reporte de Inventario</span>
            <span className="sm:hidden">Nuevo Reporte</span>
          </button>
        </motion.div>

        {/* Filtros y búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar reportes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors text-sm"
              />
            </div>

            {/* Filtro por tipo */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors text-sm"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="draft">Borrador</option>
                <option value="archived">Archivado</option>
                <option value="processing">Procesando</option>
              </select>
            </div>

            {/* Contador de resultados */}
            <div className="flex items-center justify-center sm:justify-start text-gray-600">
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
            <div className="p-8 sm:p-12 text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">
                No se encontraron reportes de inventario
              </h3>
              <p className="text-gray-600 mb-6">
                {reports.length === 0 
                  ? 'Crea tu primer reporte de inventario ganadero'
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
              {/* Vista de tabla para pantallas grandes */}
              <div className="hidden lg:block">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-medium">Reporte</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Tipo</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Ubicación</th>
                      <th className="px-6 py-4 text-left text-sm font-medium">Auditor</th>
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
                          <div className="flex items-center gap-2 text-gray-700">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{report.auditor}</span>
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
                              <span className="text-gray-600">Total:</span>
                              <span className="font-medium">{report.inventoryMetrics.totalAnimals}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Activos:</span>
                              <span className="font-medium text-green-600">{report.inventoryMetrics.activeAnimals}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Valor:</span>
                              <span className="font-medium">${(report.inventoryMetrics.totalValue / 1000).toFixed(0)}K</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Precisión:</span>
                              <span className="font-medium">{report.inventoryMetrics.accuracyRate.toFixed(1)}%</span>
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
                              title="Ver reporte"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <div className="relative group">
                              <button
                                className="p-2 text-[#2d6f51] hover:bg-green-100 rounded-lg transition-colors"
                                title="Descargar reporte"
                              >
                                {downloadLoading === report.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Download className="w-4 h-4" />
                                )}
                              </button>
                              <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                <button
                                  onClick={() => handleDownloadReport(report, 'pdf')}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <FileText className="w-4 h-4" />
                                  PDF
                                </button>
                                <button
                                  onClick={() => handleDownloadReport(report, 'excel')}
                                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <FileSpreadsheet className="w-4 h-4" />
                                  Excel
                                </button>
                              </div>
                            </div>
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

              {/* Vista de cards para pantallas pequeñas */}
              <div className="lg:hidden p-4 space-y-4">
                {filteredReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 mb-1">{report.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="p-1 rounded"
                            style={{ 
                              backgroundColor: `${REPORT_TYPE_CONFIG[report.reportType].color}20`,
                              color: REPORT_TYPE_CONFIG[report.reportType].color
                            }}
                          >
                            {REPORT_TYPE_CONFIG[report.reportType].icon}
                          </div>
                          <span className="text-xs font-medium">
                            {REPORT_TYPE_CONFIG[report.reportType].label}
                          </span>
                          <span className={cn(
                            "inline-flex px-2 py-1 text-xs font-medium rounded-full ml-auto",
                            getStatusColor(report.status)
                          )}>
                            {getStatusLabel(report.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">Ubicación</span>
                        </div>
                        <div className="font-medium text-gray-800">{report.location}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <Users className="w-3 h-3" />
                          <span className="text-xs">Auditor</span>
                        </div>
                        <div className="font-medium text-gray-800">{report.auditor}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <Package className="w-3 h-3" />
                          <span className="text-xs">Total Animales</span>
                        </div>
                        <div className="font-medium text-gray-800">{report.inventoryMetrics.totalAnimals}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1 text-gray-600 mb-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="text-xs">Valor Total</span>
                        </div>
                        <div className="font-medium text-gray-800">${(report.inventoryMetrics.totalValue / 1000).toFixed(0)}K</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditReport(report)}
                          className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewReport(report)}
                          className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDownloadReport(report, 'pdf')}
                          className="p-1.5 text-[#2d6f51] hover:bg-green-100 rounded transition-colors"
                        >
                          {downloadLoading === report.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Download className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(report.id)}
                          className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Modal de formulario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Editar Reporte de Inventario' : 'Crear Nuevo Reporte de Inventario'}
        size="xl"
      >
        <InventoryReportForm
          report={selectedReport || undefined}
          onSave={handleSaveReport}
          onCancel={() => setIsModalOpen(false)}
          isEditing={isEditing}
        />
      </Modal>

      {/* Modal de visualización de reporte */}
      <Modal
        isOpen={!!viewingReport}
        onClose={() => setViewingReport(null)}
        title="Visualizar Reporte de Inventario"
        size="full"
      >
        {viewingReport && (
          <ReportViewer
            report={viewingReport}
            onClose={() => setViewingReport(null)}
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
                ¿Estás seguro de que deseas eliminar este reporte de inventario? 
                Se perderán todos los datos de conteo y valuación asociados.
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