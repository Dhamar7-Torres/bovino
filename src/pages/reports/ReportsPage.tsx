import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  BarChart3,
  Heart,
  Package,
  TrendingUp,
  DollarSign,
  MapPin,
  Settings,
  Download,
  Plus,
  RefreshCw,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
  PieChart,
  LineChart,
  ArrowRight,
  Eye,
  TrendingUpIcon,
} from "lucide-react";

// Importar los componentes de reportes
import ReportDashboard from "./ReportDashboard";
import HealthReports from "./HealthReports";
import InventoryReports from "./InventoryReports";
import ProductionReports from "./ProductionReports";

// Componentes UI básicos
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  disabled, 
  className = "", 
  variant = "default", 
  size = "default" 
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 text-gray-700",
    ghost: "text-gray-700 hover:bg-gray-100"
  }[variant];
  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-lg"
  }[size];
  
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

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`rounded-lg border bg-white shadow-sm ${onClick ? 'cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>{children}</div>
);

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

const CardTitle: React.FC<CardTitleProps> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

const CardDescription: React.FC<CardDescriptionProps> = ({ children, className = "" }) => (
  <p className={`text-sm text-gray-600 ${className}`}>{children}</p>
);

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
    {children}
  </span>
);

// Funciones helper del layout
const getMainBackgroundClasses = () => "bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]";
const CSS_CLASSES = {
  titlePrimary: "text-4xl font-bold text-white drop-shadow-sm",
  titleSecondary: "text-2xl font-semibold text-gray-800",
  card: "bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20",
  cardHover: "hover:shadow-xl hover:scale-105 transition-all duration-300",
  buttonPrimary: "bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200"
};

// Interfaces para el sistema de reportes
interface ReportModule {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  path: string;
  color: string;
  bgColor: string;
  stats: {
    totalReports: number;
    lastUpdate: string;
    status: "active" | "pending" | "error";
  };
  quickActions?: QuickAction[];
}

interface QuickAction {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  color: string;
}

interface RecentActivity {
  id: string;
  type: "report_generated" | "alert_created" | "data_updated" | "export_completed";
  title: string;
  description: string;
  timestamp: Date;
  module: string;
  user: string;
  status: "success" | "warning" | "error";
}

interface SystemMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

// Datos de ejemplo para el dashboard principal
const reportModules: ReportModule[] = [
  {
    id: "dashboard",
    title: "Dashboard General",
    description: "Vista integral de todos los reportes y métricas del sistema",
    icon: BarChart3,
    path: "/reports/dashboard",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    stats: {
      totalReports: 247,
      lastUpdate: "hace 5 min",
      status: "active"
    },
    quickActions: [
      { id: "new-report", title: "Nuevo Reporte", icon: Plus, path: "/reports/create", color: "text-blue-600" },
      { id: "export-all", title: "Exportar Todo", icon: Download, path: "/reports/export", color: "text-blue-600" }
    ]
  },
  {
    id: "health",
    title: "Reportes de Salud",
    description: "Análisis de vacunación, enfermedades y estado sanitario del hato",
    icon: Heart,
    path: "/reports/health",
    color: "text-red-600",
    bgColor: "bg-red-50",
    stats: {
      totalReports: 89,
      lastUpdate: "hace 1 hora",
      status: "active"
    },
    quickActions: [
      { id: "vaccination-report", title: "Reporte Vacunación", icon: Target, path: "/reports/health/vaccination", color: "text-red-600" },
      { id: "disease-analysis", title: "Análisis Enfermedades", icon: AlertCircle, path: "/reports/health/diseases", color: "text-red-600" }
    ]
  },
  {
    id: "production",
    title: "Reportes de Producción",
    description: "Métricas de rendimiento, crecimiento y productividad",
    icon: TrendingUp,
    path: "/reports/production",
    color: "text-green-600",
    bgColor: "bg-green-50",
    stats: {
      totalReports: 156,
      lastUpdate: "hace 30 min",
      status: "active"
    },
    quickActions: [
      { id: "milk-production", title: "Producción Lechera", icon: Activity, path: "/reports/production/milk", color: "text-green-600" },
      { id: "weight-analysis", title: "Análisis Peso", icon: LineChart, path: "/reports/production/weight", color: "text-green-600" }
    ]
  },
  {
    id: "inventory",
    title: "Reportes de Inventario",
    description: "Control de stock, medicamentos y suministros",
    icon: Package,
    path: "/reports/inventory",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    stats: {
      totalReports: 73,
      lastUpdate: "hace 2 horas",
      status: "pending"
    },
    quickActions: [
      { id: "stock-report", title: "Reporte Stock", icon: Package, path: "/reports/inventory/stock", color: "text-orange-600" },
      { id: "expiry-analysis", title: "Análisis Vencimientos", icon: Clock, path: "/reports/inventory/expiry", color: "text-orange-600" }
    ]
  },
  {
    id: "financial",
    title: "Reportes Financieros",
    description: "Análisis de costos, ingresos y rentabilidad",
    icon: DollarSign,
    path: "/reports/financial",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    stats: {
      totalReports: 45,
      lastUpdate: "hace 4 horas",
      status: "active"
    },
    quickActions: [
      { id: "cost-analysis", title: "Análisis Costos", icon: PieChart, path: "/reports/financial/costs", color: "text-blue-600" },
      { id: "profit-report", title: "Reporte Ganancias", icon: TrendingUpIcon, path: "/reports/financial/profit", color: "text-blue-600" }
    ]
  },
  {
    id: "geographic",
    title: "Reportes Geográficos",
    description: "Análisis por ubicación y distribución espacial",
    icon: MapPin,
    path: "/reports/geographic",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    stats: {
      totalReports: 34,
      lastUpdate: "hace 6 horas",
      status: "active"
    },
    quickActions: [
      { id: "location-analysis", title: "Análisis Ubicación", icon: MapPin, path: "/reports/geographic/location", color: "text-purple-600" },
      { id: "distribution-map", title: "Mapa Distribución", icon: Target, path: "/reports/geographic/distribution", color: "text-purple-600" }
    ]
  }
];

const systemMetrics: SystemMetric[] = [
  {
    id: "total-reports",
    title: "Total de Reportes",
    value: "644",
    change: 8.2,
    trend: "up",
    icon: FileText,
    color: "text-blue-600",
    description: "Reportes generados este mes"
  },
  {
    id: "active-alerts",
    title: "Alertas Activas",
    value: "12",
    change: -15.3,
    trend: "down",
    icon: AlertCircle,
    color: "text-red-600",
    description: "Alertas que requieren atención"
  },
  {
    id: "data-coverage",
    title: "Cobertura de Datos",
    value: "96.8%",
    change: 2.1,
    trend: "up",
    icon: Target,
    color: "text-green-600",
    description: "Porcentaje de datos completos"
  },
  {
    id: "system-efficiency",
    title: "Eficiencia del Sistema",
    value: "94.2%",
    change: 1.5,
    trend: "up",
    icon: Zap,
    color: "text-purple-600",
    description: "Rendimiento general del sistema"
  }
];

const recentActivities: RecentActivity[] = [
  {
    id: "act-001",
    type: "report_generated",
    title: "Reporte de Producción Lechera",
    description: "Generado para el período 01-15 Julio 2025",
    timestamp: new Date(2025, 6, 17, 14, 30),
    module: "Producción",
    user: "Dr. Carlos Mendoza",
    status: "success"
  },
  {
    id: "act-002",
    type: "alert_created",
    title: "Alerta de Stock Bajo",
    description: "Ivermectina por debajo del mínimo requerido",
    timestamp: new Date(2025, 6, 17, 13, 45),
    module: "Inventario",
    user: "Sistema Automático",
    status: "warning"
  },
  {
    id: "act-003",
    type: "data_updated",
    title: "Actualización de Datos de Salud",
    description: "Nuevos registros de vacunación sincronizados",
    timestamp: new Date(2025, 6, 17, 12, 15),
    module: "Salud",
    user: "Dra. Ana Rodríguez",
    status: "success"
  },
  {
    id: "act-004",
    type: "export_completed",
    title: "Exportación de Reportes Completada",
    description: "Reportes financieros Q2 2025 exportados a PDF",
    timestamp: new Date(2025, 6, 17, 11, 20),
    module: "Finanzas",
    user: "Juan Pérez",
    status: "success"
  }
];

// Componente principal de la página de reportes
const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Simular carga inicial de datos
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleModuleClick = (modulePath: string) => {
    navigate(modulePath);
  };

  const handleQuickAction = (actionPath: string) => {
    navigate(actionPath);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "report_generated":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "alert_created":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      case "data_updated":
        return <RefreshCw className="w-4 h-4 text-green-500" />;
      case "export_completed":
        return <Download className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  // Renderizar la página principal de reportes
  const renderMainReportsPage = () => (
    <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
      <div className="p-6 space-y-6">
        
        {/* Header principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className={`${CSS_CLASSES.titlePrimary} mb-2`}>
              Centro de Reportes y Análisis
            </h1>
            <p className="text-white/90 text-lg">
              Gestión integral de reportes, métricas y análisis del sistema ganadero
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => setIsLoading(true)}
              disabled={isLoading}
              className={`${CSS_CLASSES.buttonPrimary} shadow-lg`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar Todo
            </Button>
            
            <Button 
              onClick={() => navigate('/reports/create')}
              className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm shadow-lg border border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Reporte
            </Button>
            
            <Button 
              onClick={() => navigate('/reports/settings')}
              variant="ghost"
              className="bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm shadow-lg"
            >
              <Settings className="w-4 h-4 mr-2" />
              Configuración
            </Button>
          </div>
        </motion.div>

        {/* Métricas del sistema */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {systemMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`${CSS_CLASSES.card} p-6 ${CSS_CLASSES.cardHover}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 rounded-lg bg-gray-50">
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
                <div className={`flex items-center text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  <TrendingUpIcon className={`w-4 h-4 mr-1 ${
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

        {/* Módulos de reportes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="mb-6">
            <h2 className={`${CSS_CLASSES.titleSecondary} text-white mb-4`}>
              Módulos de Reportes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reportModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card 
                  className={`${CSS_CLASSES.card} ${CSS_CLASSES.cardHover}`}
                  onClick={() => handleModuleClick(module.path)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={`p-3 rounded-lg ${module.bgColor}`}>
                        <module.icon className={`w-8 h-8 ${module.color}`} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          module.stats.status === 'active' ? 'bg-green-100 text-green-800' :
                          module.stats.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {module.stats.status === 'active' ? 'Activo' :
                           module.stats.status === 'pending' ? 'Pendiente' : 'Error'}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <CardTitle className="text-xl mb-2">{module.title}</CardTitle>
                      <CardDescription className="text-base">
                        {module.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Estadísticas del módulo */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Total de reportes:</span>
                        <span className="font-medium text-gray-900">{module.stats.totalReports}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Última actualización:</span>
                        <span className="font-medium text-gray-900">{module.stats.lastUpdate}</span>
                      </div>
                      
                      {/* Acciones rápidas */}
                      {module.quickActions && (
                        <div className="border-t pt-4">
                          <p className="text-sm font-medium text-gray-700 mb-2">Acciones Rápidas:</p>
                          <div className="space-y-2">
                            {module.quickActions.map((action) => (
                              <button
                                key={action.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleQuickAction(action.path);
                                }}
                                className="flex items-center gap-2 w-full text-left p-2 rounded-md hover:bg-gray-50 transition-colors text-sm"
                              >
                                <action.icon className={`w-4 h-4 ${action.color}`} />
                                <span>{action.title}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Actividad reciente */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card className={`${CSS_CLASSES.card}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  Actividad Reciente del Sistema
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Todo
                </Button>
              </div>
              <CardDescription>
                Últimas acciones y eventos en el sistema de reportes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getActivityTypeIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-gray-900 mb-1">
                            {activity.title}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>{activity.module}</span>
                            <span>•</span>
                            <span>{activity.user}</span>
                            <span>•</span>
                            <span>{activity.timestamp.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {getStatusIcon(activity.status)}
                        </div>
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
  );

  return (
    <div>
      <AnimatePresence mode="wait">
        <Routes>
          {/* Ruta principal de reportes */}
          <Route 
            path="/" 
            element={
              <motion.div
                key="main-reports"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderMainReportsPage()}
              </motion.div>
            } 
          />
          
          {/* Rutas para cada módulo de reportes */}
          <Route 
            path="/dashboard/*" 
            element={
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ReportDashboard />
              </motion.div>
            } 
          />
          
          <Route 
            path="/health/*" 
            element={
              <motion.div
                key="health"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <HealthReports />
              </motion.div>
            } 
          />
          
          <Route 
            path="/production/*" 
            element={
              <motion.div
                key="production"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ProductionReports />
              </motion.div>
            } 
          />
          
          <Route 
            path="/inventory/*" 
            element={
              <motion.div
                key="inventory"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <InventoryReports />
              </motion.div>
            } 
          />
          
          {/* Rutas adicionales para módulos futuros */}
          <Route 
            path="/financial/*" 
            element={
              <motion.div
                key="financial"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
                  <div className="p-6">
                    <Card className={`${CSS_CLASSES.card} max-w-2xl mx-auto mt-20`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="w-6 h-6 text-blue-600" />
                          Reportes Financieros
                        </CardTitle>
                        <CardDescription>
                          Módulo en desarrollo - Próximamente disponible
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">
                          Este módulo incluirá análisis de costos, ingresos, rentabilidad y proyecciones financieras.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            } 
          />
          
          <Route 
            path="/geographic/*" 
            element={
              <motion.div
                key="geographic"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
                  <div className="p-6">
                    <Card className={`${CSS_CLASSES.card} max-w-2xl mx-auto mt-20`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="w-6 h-6 text-purple-600" />
                          Reportes Geográficos
                        </CardTitle>
                        <CardDescription>
                          Módulo en desarrollo - Próximamente disponible
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-600">
                          Este módulo incluirá análisis geoespaciales, mapas de distribución y análisis por ubicación.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            } 
          />
          
          {/* Ruta por defecto - redirigir a la página principal */}
          <Route path="*" element={<Navigate to="/reports" replace />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

export default ReportsPage;