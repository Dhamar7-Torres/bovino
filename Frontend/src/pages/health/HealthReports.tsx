import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Syringe,
  Thermometer,
  DollarSign,
  Users,
  Clock,
  Search,
  Plus,
  Eye,
  Share,
} from "lucide-react";

// Interfaces para tipos de datos
interface HealthReport {
  id: string;
  title: string;
  type:
    | "vaccination"
    | "disease"
    | "treatment"
    | "reproductive"
    | "general"
    | "financial";
  description: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
  generatedBy: string;
  status: "generating" | "ready" | "error";
  format: "pdf" | "excel" | "csv";
  size: string;
  downloadUrl?: string;
  stats: {
    totalAnimals: number;
    dataPoints: number;
    recommendations: number;
  };
}

interface ReportMetrics {
  totalReports: number;
  pendingReports: number;
  scheduledReports: number;
  avgGenerationTime: number;
  mostRequestedType: string;
  totalDownloads: number;
}

interface QuickStat {
  title: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ElementType;
  color: string;
}

// Componentes reutilizables
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
  >
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <p className="text-sm text-gray-600 mt-1">{children}</p>;

const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "success" | "danger";
  size?: "sm" | "default";
  className?: string;
  disabled?: boolean;
}> = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge: React.FC<{
  children: React.ReactNode;
  variant: string;
  className?: string;
}> = ({ children, variant, className = "" }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "generating":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "vaccination":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "disease":
        return "bg-red-100 text-red-800 border-red-200";
      case "treatment":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reproductive":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "general":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "financial":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(
        variant
      )} ${className}`}
    >
      {children}
    </span>
  );
};

// Componente de Gráfico Simple
const SimpleChart: React.FC<{
  data: any[];
  title: string;
  type: "bar" | "pie";
}> = ({ data, title, type }) => {
  return (
    <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center relative">
      <div className="absolute top-4 left-4">
        <h4 className="text-sm font-medium text-gray-700">{title}</h4>
      </div>

      {type === "bar" && (
        <div className="flex items-end gap-4 h-32">
          {data.slice(0, 6).map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div
                className="bg-blue-500 rounded-t min-w-8"
                style={{
                  height: `${
                    (item.value / Math.max(...data.map((d) => d.value))) * 100
                  }%`,
                }}
              />
              <span className="text-xs text-gray-600 text-center max-w-16 truncate">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {type === "pie" && (
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm font-semibold text-white">100%</p>
              <p className="text-xs text-white">Total</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HealthReports: React.FC = () => {
  // Estados del componente
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [metrics, setMetrics] = useState<ReportMetrics>({
    totalReports: 0,
    pendingReports: 0,
    scheduledReports: 0,
    avgGenerationTime: 0,
    mostRequestedType: "",
    totalDownloads: 0,
  });
  const [quickStats, setQuickStats] = useState<QuickStat[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30");

  // Simulación de datos
  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Datos de ejemplo para reportes
      const mockReports: HealthReport[] = [
        {
          id: "1",
          title: "Reporte Mensual de Vacunaciones",
          type: "vaccination",
          description:
            "Análisis completo de todas las vacunaciones realizadas en el mes",
          dateRange: {
            start: new Date("2025-06-01"),
            end: new Date("2025-06-30"),
          },
          generatedAt: new Date("2025-07-01"),
          generatedBy: "Dr. García",
          status: "ready",
          format: "pdf",
          size: "2.4 MB",
          downloadUrl: "#",
          stats: {
            totalAnimals: 156,
            dataPoints: 324,
            recommendations: 8,
          },
        },
        {
          id: "2",
          title: "Análisis de Enfermedades Q2 2025",
          type: "disease",
          description:
            "Reporte trimestral de incidencia y tratamiento de enfermedades",
          dateRange: {
            start: new Date("2025-04-01"),
            end: new Date("2025-06-30"),
          },
          generatedAt: new Date("2025-07-05"),
          generatedBy: "Dr. Martínez",
          status: "ready",
          format: "excel",
          size: "5.1 MB",
          downloadUrl: "#",
          stats: {
            totalAnimals: 156,
            dataPoints: 89,
            recommendations: 12,
          },
        },
        {
          id: "3",
          title: "Reporte de Costos de Tratamiento",
          type: "financial",
          description:
            "Análisis financiero de gastos en medicamentos y tratamientos",
          dateRange: {
            start: new Date("2025-01-01"),
            end: new Date("2025-06-30"),
          },
          generatedAt: new Date("2025-07-10"),
          generatedBy: "Admin",
          status: "generating",
          format: "pdf",
          size: "---",
          stats: {
            totalAnimals: 156,
            dataPoints: 445,
            recommendations: 15,
          },
        },
        {
          id: "4",
          title: "Estadísticas de Salud Reproductiva",
          type: "reproductive",
          description: "Análisis de fertilidad, gestaciones y partos",
          dateRange: {
            start: new Date("2025-05-01"),
            end: new Date("2025-07-12"),
          },
          generatedAt: new Date("2025-07-12"),
          generatedBy: "Dr. López",
          status: "ready",
          format: "csv",
          size: "1.8 MB",
          downloadUrl: "#",
          stats: {
            totalAnimals: 89,
            dataPoints: 156,
            recommendations: 6,
          },
        },
      ];

      // Métricas de ejemplo
      const mockMetrics: ReportMetrics = {
        totalReports: 24,
        pendingReports: 3,
        scheduledReports: 8,
        avgGenerationTime: 4.2,
        mostRequestedType: "Vacunación",
        totalDownloads: 187,
      };

      // Estadísticas rápidas
      const mockQuickStats: QuickStat[] = [
        {
          title: "Animales Monitoreados",
          value: 156,
          change: 5.2,
          trend: "up",
          icon: Users,
          color: "blue",
        },
        {
          title: "Vacunaciones Este Mes",
          value: 89,
          change: 12.5,
          trend: "up",
          icon: Syringe,
          color: "green",
        },
        {
          title: "Casos de Enfermedad",
          value: 8,
          change: -15.3,
          trend: "down",
          icon: Thermometer,
          color: "red",
        },
        {
          title: "Costo Promedio Tratamiento",
          value: "$2,450",
          change: -8.1,
          trend: "down",
          icon: DollarSign,
          color: "orange",
        },
      ];

      setReports(mockReports);
      setMetrics(mockMetrics);
      setQuickStats(mockQuickStats);
    };

    loadData();
  }, []);

  // Filtrar reportes
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || report.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || report.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Datos para gráficos
  const chartData = {
    reportsByType: [
      { label: "Vacunación", value: 8 },
      { label: "Enfermedades", value: 6 },
      { label: "Reproducción", value: 4 },
      { label: "Financieros", value: 3 },
      { label: "Generales", value: 3 },
    ],
    monthlyGeneration: [
      { label: "Ene", value: 15 },
      { label: "Feb", value: 22 },
      { label: "Mar", value: 18 },
      { label: "Abr", value: 25 },
      { label: "May", value: 32 },
      { label: "Jun", value: 28 },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reportes de Salud
              </h1>
              <p className="text-gray-600 mt-1">
                Generación y análisis de reportes del ganado
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Programar
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Reporte
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Estadísticas Rápidas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {quickStats.map((stat, index) => (
                <Card
                  key={index}
                  className="bg-white/80 backdrop-blur-md border-gray-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}
                      >
                        <stat.icon
                          className={`w-6 h-6 text-${stat.color}-600`}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600">
                          {stat.title}
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-gray-900">
                            {stat.value}
                          </p>
                          <div
                            className={`flex items-center text-sm ${
                              stat.trend === "up"
                                ? "text-green-600"
                                : stat.trend === "down"
                                ? "text-red-600"
                                : "text-gray-600"
                            }`}
                          >
                            {stat.trend === "up" ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : stat.trend === "down" ? (
                              <TrendingDown className="w-4 h-4" />
                            ) : (
                              <Activity className="w-4 h-4" />
                            )}
                            <span className="ml-1">
                              {Math.abs(stat.change)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Gráficos de Análisis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="bg-white/80 backdrop-blur-md border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                    Reportes por Tipo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    data={chartData.reportsByType}
                    title=""
                    type="bar"
                  />
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-600" />
                    Distribución Mensual
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    data={chartData.monthlyGeneration}
                    title=""
                    type="pie"
                  />
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Panel de Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Filtros */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Título, descripción..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="vaccination">Vacunación</option>
                    <option value="disease">Enfermedades</option>
                    <option value="treatment">Tratamientos</option>
                    <option value="reproductive">Reproductiva</option>
                    <option value="financial">Financieros</option>
                    <option value="general">Generales</option>
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="ready">Listo</option>
                    <option value="generating">Generando</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                {/* Rango de fechas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                  >
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="90">Últimos 3 meses</option>
                    <option value="365">Último año</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Métricas del Sistema */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Métricas del Sistema
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Total de reportes:
                  </span>
                  <span className="font-medium">{metrics.totalReports}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">En proceso:</span>
                  <span className="font-medium">{metrics.pendingReports}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Programados:</span>
                  <span className="font-medium">
                    {metrics.scheduledReports}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Tiempo promedio:
                  </span>
                  <span className="font-medium">
                    {metrics.avgGenerationTime} min
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Más solicitado:</span>
                  <span className="font-medium">
                    {metrics.mostRequestedType}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Total descargas:
                  </span>
                  <span className="font-medium">{metrics.totalDownloads}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Reportes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-12"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle>
                  Reportes Generados ({filteredReports.length})
                </CardTitle>
                <CardDescription>
                  Lista de todos los reportes disponibles para descarga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <motion.div
                      key={report.id}
                      whileHover={{ scale: 1.01 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {report.title}
                            </h4>
                            <Badge variant={report.type}>
                              {report.type === "vaccination"
                                ? "Vacunación"
                                : report.type === "disease"
                                ? "Enfermedades"
                                : report.type === "treatment"
                                ? "Tratamientos"
                                : report.type === "reproductive"
                                ? "Reproductiva"
                                : report.type === "financial"
                                ? "Financiero"
                                : "General"}
                            </Badge>
                            <Badge variant={report.status}>
                              {report.status === "ready"
                                ? "Listo"
                                : report.status === "generating"
                                ? "Generando..."
                                : "Error"}
                            </Badge>
                          </div>

                          <p className="text-gray-600 mb-4">
                            {report.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Período:</p>
                              <p className="font-medium">
                                {report.dateRange.start.toLocaleDateString()} -{" "}
                                {report.dateRange.end.toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Generado por:</p>
                              <p className="font-medium">
                                {report.generatedBy}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Formato:</p>
                              <p className="font-medium uppercase">
                                {report.format}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Tamaño:</p>
                              <p className="font-medium">{report.size}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                            <span>{report.stats.totalAnimals} animales</span>
                            <span>
                              {report.stats.dataPoints} puntos de datos
                            </span>
                            <span>
                              {report.stats.recommendations} recomendaciones
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {report.status === "ready" && (
                            <>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Share className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          {report.status === "generating" && (
                            <Button variant="outline" size="sm" disabled>
                              <Clock className="w-4 h-4 animate-spin" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HealthReports;
