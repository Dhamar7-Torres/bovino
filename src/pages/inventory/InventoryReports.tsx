import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Clock,
  ChevronDown,
  BarChart3,
  FileSpreadsheet,
  Share2,
  Send,
  Bell,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Users,
  Package,
  DollarSign,
  Activity,
  Copy,
  Archive,
} from "lucide-react";
import { getMainBackgroundClasses, CSS_CLASSES } from "../../components/layout";

// Interfaces para reportes de inventario
interface InventoryReport {
  id: string;
  name: string;
  type: ReportType;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  createdAt: Date;
  createdBy: string;
  lastGenerated?: Date;
  downloadUrl?: string;
  format: ExportFormat;
  parameters: ReportParameters;
  fileSize?: number;
  recordCount?: number;
  isScheduled: boolean;
  nextScheduled?: Date;
  tags: string[];
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  icon: string;
  color: string;
  defaultParameters: Partial<ReportParameters>;
  estimatedTime: number; // minutos
  isPopular: boolean;
  lastUsed?: Date;
}

interface ReportParameters {
  // Filtros temporales
  dateRange: {
    start: Date;
    end: Date;
  };

  // Filtros de contenido
  categories: string[];
  locations: string[];
  suppliers: string[];
  status: string[];

  // Opciones de visualización
  includeCharts: boolean;
  includeDetails: boolean;
  includeImages: boolean;
  includeComments: boolean;

  // Formato y presentación
  groupBy: GroupByOption[];
  sortBy: SortOption;
  currency: string;
  language: string;

  // Configuración específica
  showCostAnalysis: boolean;
  showTrends: boolean;
  showPredictions: boolean;
  showAlerts: boolean;

  // Configuración de salida
  format: ExportFormat;
  pageSize: "A4" | "Letter" | "Legal";
  orientation: "portrait" | "landscape";
  includeWatermark: boolean;
}

interface ScheduledReport {
  id: string;
  name: string;
  reportType: ReportType;
  frequency: ScheduleFrequency;
  nextRun: Date;
  lastRun?: Date;
  recipients: ReportRecipient[];
  parameters: ReportParameters;
  isActive: boolean;
  createdBy: string;
  deliveryMethod: DeliveryMethod;
}

interface ReportRecipient {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
}

// Enums
enum ReportType {
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

enum ReportCategory {
  OPERATIONAL = "operational",
  FINANCIAL = "financial",
  ANALYTICAL = "analytical",
  COMPLIANCE = "compliance",
  EXECUTIVE = "executive",
}

enum ReportStatus {
  DRAFT = "draft",
  GENERATING = "generating",
  COMPLETED = "completed",
  FAILED = "failed",
  SCHEDULED = "scheduled",
  EXPIRED = "expired",
}

enum ExportFormat {
  PDF = "pdf",
  EXCEL = "excel",
  CSV = "csv",
  JSON = "json",
  HTML = "html",
}

enum ScheduleFrequency {
  DAILY = "daily",
  WEEKLY = "weekly",
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
}

enum DeliveryMethod {
  EMAIL = "email",
  DOWNLOAD = "download",
  SHARED_DRIVE = "shared_drive",
  API = "api",
}

interface GroupByOption {
  field: string;
  label: string;
}

interface SortOption {
  field: string;
  direction: "asc" | "desc";
}

const InventoryReports: React.FC = () => {
  // Estados del componente
  const [reports, setReports] = useState<InventoryReport[]>([]);
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "reports" | "templates" | "scheduled"
  >("reports");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [, setShowCreateModal] = useState(false);
  const [, setSelectedTemplate] = useState<ReportTemplate | null>(null);

  // Efectos y carga de datos
  useEffect(() => {
    const loadReportsData = async () => {
      try {
        setIsLoading(true);

        // Simular carga de datos
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Datos simulados
        const mockReports: InventoryReport[] = [
          {
            id: "1",
            name: "Reporte Mensual de Stock",
            type: ReportType.STOCK_STATUS,
            category: ReportCategory.OPERATIONAL,
            description:
              "Estado actual del inventario de medicamentos y suministros",
            status: ReportStatus.COMPLETED,
            createdAt: new Date("2025-07-10T10:30:00"),
            createdBy: "Dr. García",
            lastGenerated: new Date("2025-07-12T08:00:00"),
            downloadUrl: "/reports/stock-report-july.pdf",
            format: ExportFormat.PDF,
            parameters: {} as ReportParameters,
            fileSize: 2.5,
            recordCount: 245,
            isScheduled: true,
            nextScheduled: new Date("2025-08-12T08:00:00"),
            tags: ["mensual", "stock", "medicamentos"],
          },
          {
            id: "2",
            name: "Análisis de Costos Q2",
            type: ReportType.COST_ANALYSIS,
            category: ReportCategory.FINANCIAL,
            description:
              "Análisis detallado de costos de inventario del segundo trimestre",
            status: ReportStatus.GENERATING,
            createdAt: new Date("2025-07-12T09:15:00"),
            createdBy: "Contador López",
            format: ExportFormat.EXCEL,
            parameters: {} as ReportParameters,
            isScheduled: false,
            tags: ["trimestral", "costos", "financiero"],
          },
          {
            id: "3",
            name: "Reporte de Vencimientos",
            type: ReportType.EXPIRATION_REPORT,
            category: ReportCategory.COMPLIANCE,
            description: "Items próximos a vencer en los próximos 60 días",
            status: ReportStatus.COMPLETED,
            createdAt: new Date("2025-07-11T14:20:00"),
            createdBy: "Farmacéutico Martínez",
            lastGenerated: new Date("2025-07-11T14:25:00"),
            downloadUrl: "/reports/expiry-report.xlsx",
            format: ExportFormat.EXCEL,
            parameters: {} as ReportParameters,
            fileSize: 1.8,
            recordCount: 23,
            isScheduled: false,
            tags: ["vencimientos", "urgente", "compliance"],
          },
        ];

        const mockTemplates: ReportTemplate[] = [
          {
            id: "1",
            name: "Estado de Stock",
            description: "Reporte completo del estado actual del inventario",
            type: ReportType.STOCK_STATUS,
            icon: "Package",
            color: "#3b82f6",
            defaultParameters: {},
            estimatedTime: 5,
            isPopular: true,
            lastUsed: new Date("2025-07-10T10:30:00"),
          },
          {
            id: "2",
            name: "Valuación de Inventario",
            description: "Valor total del inventario por categorías",
            type: ReportType.INVENTORY_VALUATION,
            icon: "DollarSign",
            color: "#22c55e",
            defaultParameters: {},
            estimatedTime: 8,
            isPopular: true,
            lastUsed: new Date("2025-07-08T15:45:00"),
          },
          {
            id: "3",
            name: "Análisis ABC",
            description: "Clasificación ABC de items por valor y rotación",
            type: ReportType.ABC_ANALYSIS,
            icon: "BarChart3",
            color: "#f59e0b",
            defaultParameters: {},
            estimatedTime: 12,
            isPopular: false,
          },
          {
            id: "4",
            name: "Movimientos de Inventario",
            description: "Historial detallado de entradas y salidas",
            type: ReportType.MOVEMENT_HISTORY,
            icon: "Activity",
            color: "#8b5cf6",
            defaultParameters: {},
            estimatedTime: 6,
            isPopular: true,
            lastUsed: new Date("2025-07-09T11:20:00"),
          },
          {
            id: "5",
            name: "Items por Vencer",
            description: "Medicamentos y suministros próximos a vencer",
            type: ReportType.EXPIRATION_REPORT,
            icon: "Clock",
            color: "#ef4444",
            defaultParameters: {},
            estimatedTime: 3,
            isPopular: true,
            lastUsed: new Date("2025-07-11T14:20:00"),
          },
          {
            id: "6",
            name: "Stock Bajo",
            description: "Items por debajo del nivel mínimo de stock",
            type: ReportType.LOW_STOCK_REPORT,
            icon: "AlertCircle",
            color: "#f97316",
            defaultParameters: {},
            estimatedTime: 4,
            isPopular: false,
          },
        ];

        const mockScheduledReports: ScheduledReport[] = [
          {
            id: "1",
            name: "Reporte Semanal de Stock",
            reportType: ReportType.STOCK_STATUS,
            frequency: ScheduleFrequency.WEEKLY,
            nextRun: new Date("2025-07-14T08:00:00"),
            lastRun: new Date("2025-07-07T08:00:00"),
            recipients: [
              {
                id: "1",
                name: "Dr. García",
                email: "garcia@farm.com",
                role: "Veterinario Jefe",
                department: "Veterinaria",
              },
              {
                id: "2",
                name: "Ana López",
                email: "lopez@farm.com",
                role: "Administradora",
                department: "Administración",
              },
            ],
            parameters: {} as ReportParameters,
            isActive: true,
            createdBy: "Sistema",
            deliveryMethod: DeliveryMethod.EMAIL,
          },
          {
            id: "2",
            name: "Análisis Mensual de Costos",
            reportType: ReportType.COST_ANALYSIS,
            frequency: ScheduleFrequency.MONTHLY,
            nextRun: new Date("2025-08-01T09:00:00"),
            lastRun: new Date("2025-07-01T09:00:00"),
            recipients: [
              {
                id: "3",
                name: "Carlos Contador",
                email: "contador@farm.com",
                role: "Contador",
                department: "Finanzas",
              },
            ],
            parameters: {} as ReportParameters,
            isActive: true,
            createdBy: "Carlos Contador",
            deliveryMethod: DeliveryMethod.EMAIL,
          },
        ];

        setReports(mockReports);
        setReportTemplates(mockTemplates);
        setScheduledReports(mockScheduledReports);
      } catch (error) {
        console.error("Error cargando datos de reportes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportsData();
  }, []);

  // Funciones auxiliares
  const formatFileSize = (sizeInMB: number) => {
    return `${sizeInMB.toFixed(1)} MB`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStatusIcon = (status: ReportStatus) => {
    switch (status) {
      case ReportStatus.COMPLETED:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case ReportStatus.GENERATING:
        return <Loader className="w-4 h-4 text-blue-500 animate-spin" />;
      case ReportStatus.FAILED:
        return <XCircle className="w-4 h-4 text-red-500" />;
      case ReportStatus.SCHEDULED:
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case ReportStatus.COMPLETED:
        return `${baseClasses} bg-green-100 text-green-800`;
      case ReportStatus.GENERATING:
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case ReportStatus.FAILED:
        return `${baseClasses} bg-red-100 text-red-800`;
      case ReportStatus.SCHEDULED:
        return `${baseClasses} bg-orange-100 text-orange-800`;
      case ReportStatus.DRAFT:
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    switch (format) {
      case ExportFormat.PDF:
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      case ExportFormat.CSV:
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: ReportCategory) => {
    switch (category) {
      case ReportCategory.OPERATIONAL:
        return "bg-blue-100 text-blue-800";
      case ReportCategory.FINANCIAL:
        return "bg-green-100 text-green-800";
      case ReportCategory.ANALYTICAL:
        return "bg-purple-100 text-purple-800";
      case ReportCategory.COMPLIANCE:
        return "bg-orange-100 text-orange-800";
      case ReportCategory.EXECUTIVE:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleGenerateReport = async (templateId: string) => {
    try {
      setIsGenerating(true);
      // Simular generación de reporte
      await new Promise((resolve) => setTimeout(resolve, 3000));
      // Actualizar lista de reportes
      console.log(`Generando reporte con template ${templateId}`);
    } catch (error) {
      console.error("Error generando reporte:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadReport = (report: InventoryReport) => {
    console.log(`Descargando reporte: ${report.name}`);
    // Implementar descarga
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredTemplates = reportTemplates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
      <div className="container mx-auto px-6 py-8">
        {/* Header de Reportes */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2">
                Reportes de Inventario
              </h1>
              <p className="text-white/90 text-lg">
                Genera, programa y gestiona reportes de inventario y análisis
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              {/* Botón de actualizar */}
              <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center space-x-2">
                <RefreshCw className="w-4 h-4" />
                <span>Actualizar</span>
              </button>

              {/* Botón de nuevo reporte */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Reporte</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pestañas y Controles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`${CSS_CLASSES.card} p-6 mb-8`}
        >
          {/* Pestañas */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <div className="flex space-x-1 mb-4 sm:mb-0">
              <button
                onClick={() => setActiveTab("reports")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === "reports"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                Reportes ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === "templates"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                Plantillas ({reportTemplates.length})
              </button>
              <button
                onClick={() => setActiveTab("scheduled")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                  activeTab === "scheduled"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                Programados ({scheduledReports.length})
              </button>
            </div>

            {/* Controles de búsqueda y filtros */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar reportes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 border rounded-lg transition-colors duration-200 flex items-center space-x-2 ${
                  showFilters
                    ? "bg-blue-50 border-blue-300 text-blue-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Panel de Filtros */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-gray-200 pt-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Todas las categorías</option>
                    <option value={ReportCategory.OPERATIONAL}>
                      Operacional
                    </option>
                    <option value={ReportCategory.FINANCIAL}>Financiero</option>
                    <option value={ReportCategory.ANALYTICAL}>Analítico</option>
                    <option value={ReportCategory.COMPLIANCE}>
                      Cumplimiento
                    </option>
                    <option value={ReportCategory.EXECUTIVE}>Ejecutivo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Formato
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">Todos los formatos</option>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                    <option value="csv">CSV</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">Todos los estados</option>
                    <option value="completed">Completado</option>
                    <option value="generating">Generando</option>
                    <option value="failed">Fallido</option>
                    <option value="scheduled">Programado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha
                  </label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="all">Todas las fechas</option>
                    <option value="today">Hoy</option>
                    <option value="week">Esta semana</option>
                    <option value="month">Este mes</option>
                    <option value="quarter">Este trimestre</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Contenido principal */}
        <div className="space-y-8">
          {/* Pestaña de Reportes */}
          {activeTab === "reports" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              {filteredReports.length === 0 ? (
                <div className={`${CSS_CLASSES.card} p-12 text-center`}>
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No hay reportes disponibles
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Genera tu primer reporte usando una de las plantillas
                    disponibles
                  </p>
                  <button
                    onClick={() => setActiveTab("templates")}
                    className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] px-6 py-3 rounded-lg transition-all duration-200"
                  >
                    Ver Plantillas
                  </button>
                </div>
              ) : (
                filteredReports.map((report, index) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className={`${CSS_CLASSES.card} p-6 hover:shadow-lg transition-all duration-200`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {report.name}
                          </h3>
                          {getStatusIcon(report.status)}
                          <span className={getCategoryColor(report.category)}>
                            {report.category}
                          </span>
                          <span className={getStatusBadge(report.status)}>
                            {report.status === "completed"
                              ? "Completado"
                              : report.status === "generating"
                              ? "Generando"
                              : report.status === "failed"
                              ? "Fallido"
                              : report.status === "scheduled"
                              ? "Programado"
                              : "Borrador"}
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3">
                          {report.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>Por: {report.createdBy}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Creado: {formatDate(report.createdAt)}</span>
                          </span>
                          {report.lastGenerated && (
                            <span className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                Generado: {formatDate(report.lastGenerated)}
                              </span>
                            </span>
                          )}
                          {report.fileSize && (
                            <span className="flex items-center space-x-1">
                              {getFormatIcon(report.format)}
                              <span>{formatFileSize(report.fileSize)}</span>
                            </span>
                          )}
                          {report.recordCount && (
                            <span>
                              {report.recordCount.toLocaleString()} registros
                            </span>
                          )}
                        </div>

                        {report.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {report.tags.map((tag, tagIndex) => (
                              <span
                                key={tagIndex}
                                className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {report.isScheduled && report.nextScheduled && (
                          <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-2 text-blue-700">
                              <Bell className="w-4 h-4" />
                              <span className="text-sm font-medium">
                                Próxima generación:{" "}
                                {formatDate(report.nextScheduled)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        {report.status === ReportStatus.COMPLETED &&
                          report.downloadUrl && (
                            <button
                              onClick={() => handleDownloadReport(report)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                              title="Descargar"
                            >
                              <Download className="w-5 h-5" />
                            </button>
                          )}

                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>

                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          title="Duplicar"
                        >
                          <Copy className="w-5 h-5" />
                        </button>

                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Compartir"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>

                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {/* Pestaña de Plantillas */}
          {activeTab === "templates" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className={`${CSS_CLASSES.card} p-6 hover:shadow-lg transition-all duration-200 cursor-pointer`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${template.color}20` }}
                      >
                        {template.icon === "Package" && (
                          <Package
                            className="w-6 h-6"
                            style={{ color: template.color }}
                          />
                        )}
                        {template.icon === "DollarSign" && (
                          <DollarSign
                            className="w-6 h-6"
                            style={{ color: template.color }}
                          />
                        )}
                        {template.icon === "BarChart3" && (
                          <BarChart3
                            className="w-6 h-6"
                            style={{ color: template.color }}
                          />
                        )}
                        {template.icon === "Activity" && (
                          <Activity
                            className="w-6 h-6"
                            style={{ color: template.color }}
                          />
                        )}
                        {template.icon === "Clock" && (
                          <Clock
                            className="w-6 h-6"
                            style={{ color: template.color }}
                          />
                        )}
                        {template.icon === "AlertCircle" && (
                          <AlertCircle
                            className="w-6 h-6"
                            style={{ color: template.color }}
                          />
                        )}
                      </div>

                      {template.isPopular && (
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium">
                          Popular
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {template.name}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4">
                      {template.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>~{template.estimatedTime} min</span>
                      </span>

                      {template.lastUsed && (
                        <span>Usado: {formatDate(template.lastUsed)}</span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateReport(template.id);
                      }}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] py-2 rounded-lg transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isGenerating ? (
                        <Loader className="w-4 h-4 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4" />
                      )}
                      <span>
                        {isGenerating ? "Generando..." : "Generar Reporte"}
                      </span>
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Pestaña de Reportes Programados */}
          {activeTab === "scheduled" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-4"
            >
              {scheduledReports.length === 0 ? (
                <div className={`${CSS_CLASSES.card} p-12 text-center`}>
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No hay reportes programados
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Programa reportes automáticos para recibir actualizaciones
                    regulares
                  </p>
                  <button className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] px-6 py-3 rounded-lg transition-all duration-200">
                    Programar Reporte
                  </button>
                </div>
              ) : (
                scheduledReports.map((scheduledReport, index) => (
                  <motion.div
                    key={scheduledReport.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                    className={`${CSS_CLASSES.card} p-6 hover:shadow-lg transition-all duration-200`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {scheduledReport.name}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              scheduledReport.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {scheduledReport.isActive ? "Activo" : "Inactivo"}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                <strong>Frecuencia:</strong>{" "}
                                {scheduledReport.frequency === "daily"
                                  ? "Diario"
                                  : scheduledReport.frequency === "weekly"
                                  ? "Semanal"
                                  : scheduledReport.frequency === "monthly"
                                  ? "Mensual"
                                  : scheduledReport.frequency === "quarterly"
                                  ? "Trimestral"
                                  : "Anual"}
                              </span>
                            </p>
                            <p className="flex items-center space-x-2 mt-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                <strong>Próxima ejecución:</strong>{" "}
                                {formatDate(scheduledReport.nextRun)}
                              </span>
                            </p>
                            {scheduledReport.lastRun && (
                              <p className="flex items-center space-x-2 mt-1">
                                <CheckCircle className="w-4 h-4" />
                                <span>
                                  <strong>Última ejecución:</strong>{" "}
                                  {formatDate(scheduledReport.lastRun)}
                                </span>
                              </p>
                            )}
                          </div>

                          <div>
                            <p className="flex items-center space-x-2">
                              <Send className="w-4 h-4" />
                              <span>
                                <strong>Entrega:</strong>{" "}
                                {scheduledReport.deliveryMethod === "email"
                                  ? "Email"
                                  : scheduledReport.deliveryMethod ===
                                    "download"
                                  ? "Descarga"
                                  : scheduledReport.deliveryMethod ===
                                    "shared_drive"
                                  ? "Drive compartido"
                                  : "API"}
                              </span>
                            </p>
                            <p className="flex items-center space-x-2 mt-1">
                              <Users className="w-4 h-4" />
                              <span>
                                <strong>Destinatarios:</strong>{" "}
                                {scheduledReport.recipients.length}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Destinatarios:</strong>
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {scheduledReport.recipients.map((recipient) => (
                              <span
                                key={recipient.id}
                                className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                              >
                                {recipient.name} ({recipient.role})
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Editar programación"
                        >
                          <Edit className="w-5 h-5" />
                        </button>

                        <button
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="Ejecutar ahora"
                        >
                          <RefreshCw className="w-5 h-5" />
                        </button>

                        <button
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                          title="Pausar/Reanudar"
                        >
                          {scheduledReport.isActive ? (
                            <Archive className="w-5 h-5" />
                          ) : (
                            <CheckCircle className="w-5 h-5" />
                          )}
                        </button>

                        <button
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryReports;
