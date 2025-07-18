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
  Archive
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
}

// Props del formulario
interface ReportFormProps {
  report?: InventoryReport;
  onSave: (report: Omit<InventoryReport, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing: boolean;
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
  },
  {
    id: '2',
    title: 'Análisis de Movimientos Q4 2024',
    description: 'Rastreo de compras, ventas y traslados del cuarto trimestre',
    reportType: 'movement_tracking',
    period: {
      startDate: '2024-10-01',
      endDate: '2024-12-31',
      type: 'quarterly'
    },
    location: 'Todas las ubicaciones',
    inventoryMetrics: {
      totalAnimals: 1203,
      activeAnimals: 1125,
      newAcquisitions: 78,
      sold: 65,
      deaths: 13,
      transferred: 156,
      totalValue: 2654300.00,
      averageValue: 2206.50,
      inventoryTurnover: 15.2,
      accuracyRate: 95.4,
      lastFullCount: '2024-12-31',
      pendingUpdates: 8
    },
    categoryBreakdown: [],
    locationBreakdown: [],
    movements: [
      {
        movementId: 'mov004',
        movementType: 'acquisition',
        animalCount: 45,
        toLocation: 'Potrero Norte',
        date: '2024-10-15',
        reason: 'Compra de pie de cría',
        cost: 135000.00,
        responsible: 'Juan Pérez'
      },
      {
        movementId: 'mov005',
        movementType: 'sale',
        animalCount: 38,
        fromLocation: 'Potrero Sur',
        date: '2024-11-20',
        reason: 'Venta de novillos gordos',
        revenue: 152000.00,
        responsible: 'María González'
      }
    ],
    valuation: {
      totalMarketValue: 2654300.00,
      totalBookValue: 2487200.00,
      appreciationDepreciation: 167100.00,
      averageValuePerCategory: [],
      valuationMethod: 'weighted_average',
      lastValuationDate: '2024-12-31',
      nextValuationDue: '2025-03-31'
    },
    discrepancies: [],
    createdAt: '2025-01-05T14:20:00Z',
    updatedAt: '2025-01-05T14:20:00Z',
    status: 'archived',
    auditor: 'Ing. Roberto Silva',
    createdBy: 'María González'
  },
  {
    id: '3',
    title: 'Reporte de Valuación - Diciembre 2024',
    description: 'Valuación actualizada del inventario ganadero al cierre del año',
    reportType: 'valuation_report',
    period: {
      startDate: '2024-12-01',
      endDate: '2024-12-31',
      type: 'monthly'
    },
    location: 'Todas las ubicaciones',
    inventoryMetrics: {
      totalAnimals: 1203,
      activeAnimals: 1125,
      newAcquisitions: 12,
      sold: 28,
      deaths: 5,
      transferred: 22,
      totalValue: 2654300.00,
      averageValue: 2206.50,
      inventoryTurnover: 8.7,
      accuracyRate: 98.2,
      lastFullCount: '2024-12-31',
      pendingUpdates: 3
    },
    categoryBreakdown: [],
    locationBreakdown: [],
    movements: [],
    valuation: {
      totalMarketValue: 2654300.00,
      totalBookValue: 2487200.00,
      appreciationDepreciation: 167100.00,
      averageValuePerCategory: [
        {
          categoryName: 'Vacas',
          marketValue: 1358500.00,
          bookValue: 1275000.00
        },
        {
          categoryName: 'Toros',
          marketValue: 225000.00,
          bookValue: 210000.00
        }
      ],
      valuationMethod: 'market_price',
      lastValuationDate: '2024-12-31',
      nextValuationDue: '2025-03-31'
    },
    discrepancies: [],
    createdAt: '2025-01-02T09:15:00Z',
    updatedAt: '2025-01-02T09:15:00Z',
    status: 'archived',
    auditor: 'Dra. Carmen Vega',
    createdBy: 'Carlos Rodríguez'
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
          className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
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

// Componente Formulario de Reporte de Inventario
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información básica */}
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
          Información General
        </h3>
        
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
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800 border-b pb-2 flex-1">
            Métricas de Inventario
          </h3>
          <button
            type="button"
            onClick={calculateDerivedMetrics}
            className="text-sm text-[#2d6f51] hover:text-[#265a44] font-medium"
          >
            Calcular Automáticamente
          </button>
        </div>
        
        {errors.consistency && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{errors.consistency}</p>
          </div>
        )}

        {/* Métricas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
export const InventoryReports: React.FC<InventoryReportsProps> = ({ className }) => {
  const [reports, setReports] = useState<InventoryReport[]>(SAMPLE_REPORTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<InventoryReport | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

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

  // Guardar reporte (crear o editar)
  const handleSaveReport = (reportData: Omit<InventoryReport, 'id' | 'createdAt' | 'updatedAt'>) => {
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
                Reportes de Inventario Ganadero
              </h1>
              <p className="text-white/90">
                Gestiona y analiza el inventario, valuación y movimientos del ganado
              </p>
            </div>

            <button
              onClick={handleCreateReport}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Nuevo Reporte de Inventario
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
        title={isEditing ? 'Editar Reporte de Inventario' : 'Crear Nuevo Reporte de Inventario'}
      >
        <InventoryReportForm
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