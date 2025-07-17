import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  FileText,
  Download,
  Calendar,
  Filter,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Beef,
  Heart,
  Package,
  DollarSign,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Search,
  ChevronRight,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Componentes UI básicos (reemplazando ShadCN)
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "outline";
  size?: "default" | "sm";
}> = ({ children, onClick, disabled, className = "", variant = "default", size = "default" }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none";
  const variantClasses = variant === "outline" 
    ? "border border-gray-300 bg-white hover:bg-gray-50" 
    : "bg-blue-600 text-white hover:bg-blue-700";
  const sizeClasses = size === "sm" ? "h-8 px-3 text-sm" : "h-10 px-4 py-2";
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </button>
  );
};

const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`rounded-lg border bg-white shadow-sm ${onClick ? 'cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-600">{children}</p>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-6 pt-0">{children}</div>
);

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
    {children}
  </span>
);

const Input: React.FC<{
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}> = ({ type = "text", placeholder, value, onChange, className = "" }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

const Select: React.FC<{
  value: string;
  onValueChange: (value: string, label: string) => void;
  children: React.ReactNode;
  placeholder?: string;
}> = ({ value, onValueChange, children, placeholder = "Seleccionar..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const handleSelect = (newValue: string, label: string) => {
    onValueChange(newValue, label);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {value || placeholder}
        <ChevronRight className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child as React.ReactElement<{
                value: string;
                children: React.ReactNode;
                onSelect?: (value: string, label: string) => void;
              }>, { 
                onSelect: handleSelect,
                key: (child.props as any).value || index
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

const SelectItem: React.FC<{
  value: string;
  children: React.ReactNode;
  onSelect?: (value: string, label: string) => void;
}> = ({ value, children, onSelect }) => (
  <div
    onClick={() => onSelect?.(value, String(children))}
    className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
  >
    {children}
  </div>
);

// Funciones helper del layout
const getMainBackgroundClasses = () => "bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]";
const CSS_CLASSES = {
  titlePrimary: "text-4xl font-bold text-white drop-shadow-sm",
  card: "bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20",
  cardHover: "hover:shadow-xl hover:scale-105 transition-all duration-300",
  buttonPrimary: "bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200"
};

// Tipos para los reportes
interface ReportSummary {
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

interface QuickMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  count: number;
  color: string;
}

// Reportes de ejemplo (fuera del componente para evitar recreación)
const sampleReports: ReportSummary[] = [
  {
    id: "rep-001",
    title: "Resumen Mensual de Vacunación",
    type: "health",
    category: "Salud",
    status: "completed",
    lastGenerated: new Date(2025, 5, 15), // Mes en JavaScript es 0-indexed
    size: "2.4 MB",
    format: "PDF",
    description: "Análisis completo de cobertura de vacunación y cumplimiento de cronogramas",
    coveragePercentage: 96.8,
    totalRecords: 1247
  },
  {
    id: "rep-002",
    title: "Análisis de Rendimiento Reproductivo",
    type: "breeding",
    category: "Reproducción",
    status: "pending",
    lastGenerated: new Date(2025, 5, 12),
    nextScheduled: new Date(2025, 5, 18),
    size: "1.8 MB",
    format: "Excel",
    description: "Evaluación de tasas de concepción, partos y eficiencia reproductiva",
    coveragePercentage: 88.2,
    totalRecords: 892
  },
  {
    id: "rep-003",
    title: "Estado Financiero Trimestral",
    type: "financial",
    category: "Finanzas",
    status: "completed",
    lastGenerated: new Date(2025, 5, 10),
    size: "3.1 MB",
    format: "PDF",
    description: "Análisis de costos operativos, ingresos y márgenes de rentabilidad",
    coveragePercentage: 99.1,
    totalRecords: 2341
  },
  {
    id: "rep-004",
    title: "Distribución Geográfica de Enfermedades",
    type: "geographic",
    category: "Geografía",
    status: "error",
    lastGenerated: new Date(2025, 5, 8),
    size: "0 KB",
    format: "PDF",
    description: "Mapeo de incidencias por ubicación y análisis de patrones espaciales",
    coveragePercentage: 0,
    totalRecords: 0
  }
];

const ReportDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados del componente
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("30d");
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estados para los valores mostrados en los Select
  const [categoryDisplayValue, setCategoryDisplayValue] = useState("Todas las categorías");
  const [dateRangeDisplayValue, setDateRangeDisplayValue] = useState("Últimos 30 días");

  // Datos de ejemplo para métricas rápidas
  const quickMetrics: QuickMetric[] = [
    {
      id: "total-reports",
      title: "Total de Reportes",
      value: "247",
      change: 12.5,
      trend: "up",
      icon: FileText,
      color: "text-blue-600",
      description: "Reportes generados este mes"
    },
    {
      id: "pending-reports",
      title: "Reportes Pendientes",
      value: "8",
      change: -5.2,
      trend: "down",
      icon: Clock,
      color: "text-orange-600",
      description: "Reportes en cola de procesamiento"
    },
    {
      id: "completed-today",
      title: "Completados Hoy",
      value: "23",
      change: 18.3,
      trend: "up",
      icon: CheckCircle,
      color: "text-green-600",
      description: "Reportes finalizados en las últimas 24h"
    },
    {
      id: "data-coverage",
      title: "Cobertura de Datos",
      value: "94.2%",
      change: 2.1,
      trend: "up",
      icon: Activity,
      color: "text-purple-600",
      description: "Porcentaje de datos válidos procesados"
    }
  ];

  // Categorías de reportes
  const reportCategories: ReportCategory[] = [
    {
      id: "health",
      title: "Reportes de Salud",
      description: "Análisis de vacunación, enfermedades y estado sanitario",
      icon: Heart,
      count: 45,
      color: "text-red-500"
    },
    {
      id: "production",
      title: "Reportes de Producción",
      description: "Métricas de rendimiento, crecimiento y productividad",
      icon: TrendingUp,
      count: 38,
      color: "text-green-500"
    },
    {
      id: "financial",
      title: "Reportes Financieros",
      description: "Análisis de costos, ingresos y rentabilidad",
      icon: DollarSign,
      count: 29,
      color: "text-blue-500"
    },
    {
      id: "inventory",
      title: "Reportes de Inventario",
      description: "Control de stock, medicamentos y suministros",
      icon: Package,
      count: 22,
      color: "text-orange-500"
    },
    {
      id: "geographic",
      title: "Reportes Geográficos",
      description: "Análisis por ubicación y distribución espacial",
      icon: MapPin,
      count: 18,
      color: "text-purple-500"
    },
    {
      id: "breeding",
      title: "Reportes de Cría",
      description: "Análisis reproductivo y genealógico",
      icon: Beef,
      count: 31,
      color: "text-amber-500"
    }
  ];

  // Efectos y funciones
  useEffect(() => {
    // Inicializar con datos de ejemplo
    setReports(sampleReports);
  }, []);

  const handleGenerateReport = (type: string) => {
    console.log(`Generando reporte de tipo: ${type}`);
    // Aquí iría la lógica para generar un nuevo reporte
  };

  const handleCategoryChange = (value: string, label: string) => {
    setSelectedCategory(value);
    setCategoryDisplayValue(label);
  };

  const handleDateRangeChange = (value: string, label: string) => {
    setSelectedDateRange(value);
    setDateRangeDisplayValue(label);
  };

  const handleRefreshReports = () => {
    setIsLoading(true);
    // Simular carga
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "scheduled":
        return <Calendar className="w-4 h-4 text-blue-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || report.type === selectedCategory;
    
    // Usar selectedDateRange para filtrar por período si es necesario
    let matchesDateRange = true;
    if (selectedDateRange !== "all") {
      const now = new Date();
      const reportDate = report.lastGenerated;
      
      switch (selectedDateRange) {
        case "7d":
          matchesDateRange = (now.getTime() - reportDate.getTime()) <= (7 * 24 * 60 * 60 * 1000);
          break;
        case "30d":
          matchesDateRange = (now.getTime() - reportDate.getTime()) <= (30 * 24 * 60 * 60 * 1000);
          break;
        case "90d":
          matchesDateRange = (now.getTime() - reportDate.getTime()) <= (90 * 24 * 60 * 60 * 1000);
          break;
        case "1y":
          matchesDateRange = (now.getTime() - reportDate.getTime()) <= (365 * 24 * 60 * 60 * 1000);
          break;
        default:
          matchesDateRange = true;
      }
    }
    
    return matchesSearch && matchesCategory && matchesDateRange;
  });

  return (
    <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
      {/* Contenedor principal con padding y espaciado */}
      <div className="p-6 space-y-6">
        
        {/* Header del dashboard con animación de entrada */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className={`${CSS_CLASSES.titlePrimary} mb-2`}>
              Dashboard de Reportes
            </h1>
            <p className="text-white/90 text-lg">
              Gestión y análisis integral de reportes del sistema ganadero
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleRefreshReports}
              disabled={isLoading}
              className={`${CSS_CLASSES.buttonPrimary} shadow-lg`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            
            <Button 
              onClick={() => navigate('/reports/create')}
              className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm shadow-lg border border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Reporte
            </Button>
          </div>
        </motion.div>

        {/* Métricas rápidas con animación escalonada */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {quickMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`${CSS_CLASSES.card} p-6 ${CSS_CLASSES.cardHover}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg bg-gray-50`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className={`flex items-center text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <TrendingUp className={`w-4 h-4 mr-1 ${
                    metric.trend === 'down' ? 'rotate-180' : ''
                  }`} />
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </div>
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </h3>
                <p className="text-gray-600 font-medium mb-1">
                  {metric.title}
                </p>
                <p className="text-sm text-gray-500">
                  {metric.description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pestañas principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Custom Tabs Implementation */}
          <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white/20 backdrop-blur-sm p-1 rounded-lg flex space-x-1">
              {[
                { id: "overview", label: "Vista General", icon: BarChart3 },
                { id: "categories", label: "Categorías", icon: PieChart },
                { id: "recent", label: "Recientes", icon: Clock },
                { id: "scheduled", label: "Programados", icon: Calendar }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedTab === tab.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div>
              {selectedTab === "overview" && (
                <div className="space-y-6">
                  {/* Controles de filtro y búsqueda */}
                  <Card className={`${CSS_CLASSES.card}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Filtros de Búsqueda
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Buscar Reportes
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <Input
                              type="text"
                              placeholder="Nombre o descripción..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Categoría
                          </label>
                          <Select 
                            value={categoryDisplayValue} 
                            onValueChange={handleCategoryChange}
                            placeholder="Seleccionar categoría"
                          >
                            <SelectItem value="all">Todas las categorías</SelectItem>
                            {reportCategories.map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.title}
                              </SelectItem>
                            ))}
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Período
                          </label>
                          <Select 
                            value={dateRangeDisplayValue} 
                            onValueChange={handleDateRangeChange}
                            placeholder="Seleccionar período"
                          >
                            <SelectItem value="7d">Últimos 7 días</SelectItem>
                            <SelectItem value="30d">Últimos 30 días</SelectItem>
                            <SelectItem value="90d">Últimos 3 meses</SelectItem>
                            <SelectItem value="1y">Último año</SelectItem>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-gray-700">
                            Acciones
                          </label>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("all");
                                setSelectedDateRange("30d");
                                setCategoryDisplayValue("Todas las categorías");
                                setDateRangeDisplayValue("Últimos 30 días");
                              }}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Limpiar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lista de reportes filtrados */}
                  <Card className={`${CSS_CLASSES.card}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          Reportes Disponibles ({filteredReports.length})
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Exportar Lista
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {filteredReports.map((report, index) => (
                          <motion.div
                            key={report.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  {getStatusIcon(report.status)}
                                  <h3 className="font-semibold text-gray-900">
                                    {report.title}
                                  </h3>
                                  <Badge className={getStatusBadgeColor(report.status)}>
                                    {report.status === 'completed' ? 'Completado' :
                                     report.status === 'pending' ? 'Pendiente' :
                                     report.status === 'error' ? 'Error' : 'Programado'}
                                  </Badge>
                                </div>
                                
                                <p className="text-gray-600 text-sm mb-3">
                                  {report.description}
                                </p>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                                  <div>
                                    <span className="font-medium">Última generación:</span><br />
                                    {report.lastGenerated.toLocaleDateString()}
                                  </div>
                                  <div>
                                    <span className="font-medium">Tamaño:</span><br />
                                    {report.size}
                                  </div>
                                  <div>
                                    <span className="font-medium">Formato:</span><br />
                                    {report.format}
                                  </div>
                                  <div>
                                    <span className="font-medium">Cobertura:</span><br />
                                    {report.coveragePercentage}% ({report.totalRecords} registros)
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex gap-2 ml-4">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Download className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {report.status === 'error' && (
                                  <Button variant="outline" size="sm">
                                    <RefreshCw className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedTab === "categories" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reportCategories.map((category, index) => (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card 
                          className={`${CSS_CLASSES.card} ${CSS_CLASSES.cardHover}`}
                          onClick={() => handleGenerateReport(category.id)}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-gray-50">
                                  <category.icon className={`w-6 h-6 ${category.color}`} />
                                </div>
                                <div>
                                  <CardTitle className="text-lg">{category.title}</CardTitle>
                                  <p className="text-sm text-gray-500">{category.count} reportes</p>
                                </div>
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-400" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 text-sm mb-4">
                              {category.description}
                            </p>
                            <Button className="w-full" variant="outline">
                              <Plus className="w-4 h-4 mr-2" />
                              Generar Reporte
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === "recent" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle>Reportes Recientes</CardTitle>
                    <CardDescription>
                      Últimos reportes generados en el sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Contenido de reportes recientes...</p>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "scheduled" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle>Reportes Programados</CardTitle>
                    <CardDescription>
                      Reportes configurados para generación automática
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">Contenido de reportes programados...</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ReportDashboard;