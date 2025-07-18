// ReproductionDashboard.tsx
// Dashboard completo del módulo de reproducción
// Sistema de gestión ganadera - Universidad Juárez Autónoma de Tabasco (UJAT)

import React, { useState, useEffect, useMemo } from "react";
import { motion, Variants } from "framer-motion";
import {
  TrendingUp,
  Activity,
  Heart,
  Baby,
  Crown,
  Target,
  Users,
  BarChart3,
  LineChart,
  ArrowRight,
  Bell,
  Stethoscope,
  Timer,
  Download,
  RefreshCw,
  TestTube,
  Syringe,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  DollarSign,
  Calendar as CalendarIcon,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Simulación de react-bits para animación de texto
const AnimatedText: React.FC<{ children: string; className?: string }> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            delay: index * 0.03,
            duration: 0.3 
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Tipos e interfaces para el dashboard
interface ReproductionStats {
  totalAnimals: {
    bulls: number;
    cows: number;
    total: number;
    activeBreeders: number;
  };
  breeding: {
    totalMatings: number;
    successfulMatings: number;
    pendingResults: number;
    successRate: number;
    thisMonth: number;
    lastMonth: number;
  };
  pregnancies: {
    totalPregnant: number;
    earlyStage: number;
    midStage: number;
    lateStage: number;
    dueThisWeek: number;
    dueThisMonth: number;
    averageGestationDay: number;
    complications: number;
  };
  births: {
    totalBirths: number;
    thisMonth: number;
    lastMonth: number;
    maleCalves: number;
    femaleCalves: number;
    averageBirthWeight: number;
    naturalBirths: number;
    assistedBirths: number;
    mortality: number;
  };
  artificialInsemination: {
    totalProcedures: number;
    successfulProcedures: number;
    successRate: number;
    thisMonth: number;
    lastMonth: number;
    avgCostPerProcedure: number;
  };
  health: {
    totalAlerts: number;
    criticalAlerts: number;
    vaccinationsDue: number;
    checkupsDue: number;
    reproductiveHealthIssues: number;
  };
  economics: {
    totalInvestment: number;
    expectedROI: number;
    averageCostPerMating: number;
    projectedRevenue: number;
    monthlyExpenses: number;
  };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  route: string;
  count?: number;
  urgent?: boolean;
}

interface Alert {
  id: string;
  type: "critical" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
  module: string;
  animalId?: string;
  animalName?: string;
  actionRequired?: boolean;
  route?: string;
}

interface RecentActivity {
  id: string;
  type: "birth" | "mating" | "insemination" | "checkup" | "vaccination";
  title: string;
  description: string;
  timestamp: string;
  animalName: string;
  animalId: string;
  result?: "success" | "warning" | "error";
}

interface PerformanceMetric {
  id: string;
  label: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ReactNode;
  color: string;
  description?: string;
}

// Componente principal del dashboard de reproducción
const ReproductionDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<ReproductionStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [showAllAlerts, setShowAllAlerts] = useState<boolean>(false);
  const [selectedTimeframe, setSelectedTimeframe] = useState<"week" | "month" | "quarter">("month");

  // Datos de ejemplo para desarrollo
  const mockStats: ReproductionStats = {
    totalAnimals: {
      bulls: 12,
      cows: 145,
      total: 157,
      activeBreeders: 98,
    },
    breeding: {
      totalMatings: 89,
      successfulMatings: 73,
      pendingResults: 16,
      successRate: 82,
      thisMonth: 24,
      lastMonth: 19,
    },
    pregnancies: {
      totalPregnant: 67,
      earlyStage: 23,
      midStage: 28,
      lateStage: 16,
      dueThisWeek: 4,
      dueThisMonth: 12,
      averageGestationDay: 180,
      complications: 3,
    },
    births: {
      totalBirths: 156,
      thisMonth: 8,
      lastMonth: 12,
      maleCalves: 78,
      femaleCalves: 78,
      averageBirthWeight: 42.5,
      naturalBirths: 142,
      assistedBirths: 14,
      mortality: 2,
    },
    artificialInsemination: {
      totalProcedures: 45,
      successfulProcedures: 38,
      successRate: 84,
      thisMonth: 12,
      lastMonth: 8,
      avgCostPerProcedure: 1650,
    },
    health: {
      totalAlerts: 7,
      criticalAlerts: 2,
      vaccinationsDue: 12,
      checkupsDue: 8,
      reproductiveHealthIssues: 3,
    },
    economics: {
      totalInvestment: 245000,
      expectedROI: 28.5,
      averageCostPerMating: 2100,
      projectedRevenue: 485000,
      monthlyExpenses: 18500,
    },
  };

  const mockAlerts: Alert[] = [
    {
      id: "alert-001",
      type: "critical",
      title: "Parto con Complicaciones",
      message: "La vaca 'Luna' presenta signos de distocia. Requiere atención veterinaria inmediata.",
      timestamp: "2025-07-17T10:30:00Z",
      module: "births",
      animalId: "cow-124",
      animalName: "Luna",
      actionRequired: true,
      route: "/reproduction/birth-records",
    },
    {
      id: "alert-002",
      type: "warning",
      title: "Inseminación Programada",
      message: "3 vacas programadas para inseminación artificial hoy.",
      timestamp: "2025-07-17T08:00:00Z",
      module: "artificial-insemination",
      actionRequired: true,
      route: "/reproduction/artificial-insemination",
    },
    {
      id: "alert-003",
      type: "info",
      title: "Seguimiento de Gestación",
      message: "5 vacas requieren ecografía de seguimiento esta semana.",
      timestamp: "2025-07-17T07:15:00Z",
      module: "pregnancy-tracking",
      route: "/reproduction/pregnancy-tracking",
    },
    {
      id: "alert-004",
      type: "success",
      title: "Inseminación Exitosa",
      message: "Procedimiento de IA completado exitosamente en 'Bella'.",
      timestamp: "2025-07-16T16:45:00Z",
      module: "artificial-insemination",
      animalId: "cow-123",
      animalName: "Bella",
    },
  ];

  const mockRecentActivity: RecentActivity[] = [
    {
      id: "activity-001",
      type: "birth",
      title: "Nacimiento exitoso",
      description: "Ternero macho de 45kg",
      timestamp: "2025-07-16T18:30:00Z",
      animalName: "Esperanza",
      animalId: "cow-145",
      result: "success",
    },
    {
      id: "activity-002",
      type: "insemination",
      title: "Inseminación artificial",
      description: "Procedimiento completado con semen Holstein",
      timestamp: "2025-07-16T09:15:00Z",
      animalName: "Bella",
      animalId: "cow-123",
      result: "success",
    },
    {
      id: "activity-003",
      type: "checkup",
      title: "Examen reproductivo",
      description: "Confirmación de gestación a los 45 días",
      timestamp: "2025-07-15T14:20:00Z",
      animalName: "Perla",
      animalId: "cow-134",
      result: "success",
    },
    {
      id: "activity-004",
      type: "vaccination",
      title: "Vacunación reproductiva",
      description: "Aplicación de vacuna contra brucelosis",
      timestamp: "2025-07-14T11:00:00Z",
      animalName: "Rosa",
      animalId: "cow-156",
      result: "success",
    },
  ];

  // Variantes de animación
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1500));
        setStats(mockStats);
        setAlerts(mockAlerts);
        setRecentActivity(mockRecentActivity);
      } catch (error) {
        console.error("Error cargando datos del dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Métricas de rendimiento calculadas
  const performanceMetrics = useMemo<PerformanceMetric[]>(() => {
    if (!stats) return [];

    return [
      {
        id: "breeding-success",
        label: "Tasa de Éxito Reproductivo",
        value: `${stats.breeding.successRate}%`,
        change: +5.2,
        trend: "up",
        icon: <Target className="w-5 h-5" />,
        color: "text-green-600",
        description: "Mejoría del 5.2% vs mes anterior",
      },
      {
        id: "pregnancy-rate",
        label: "Tasa de Gestación",
        value: `${Math.round((stats.pregnancies.totalPregnant / stats.totalAnimals.cows) * 100)}%`,
        change: +2.8,
        trend: "up",
        icon: <Heart className="w-5 h-5" />,
        color: "text-pink-600",
        description: "46% de las vacas gestantes",
      },
      {
        id: "ai-efficiency",
        label: "Eficiencia de IA",
        value: `${stats.artificialInsemination.successRate}%`,
        change: +7.1,
        trend: "up",
        icon: <Syringe className="w-5 h-5" />,
        color: "text-blue-600",
        description: "Excelente rendimiento en IA",
      },
      {
        id: "birth-success",
        label: "Éxito en Partos",
        value: `${Math.round((stats.births.naturalBirths / stats.births.totalBirths) * 100)}%`,
        change: -1.2,
        trend: "down",
        icon: <Baby className="w-5 h-5" />,
        color: "text-orange-600",
        description: "91% partos naturales",
      },
    ];
  }, [stats]);

  // Acciones rápidas
  const quickActions: QuickAction[] = [
    {
      id: "schedule-insemination",
      title: "Programar Inseminación",
      description: "Nueva inseminación artificial",
      icon: <Syringe className="w-6 h-6" />,
      color: "bg-gradient-to-r from-blue-600 to-blue-700",
      route: "/reproduction/artificial-insemination",
      urgent: true,
    },
    {
      id: "pregnancy-checkup",
      title: "Chequeo de Gestación",
      description: "Programar ecografía",
      icon: <Heart className="w-6 h-6" />,
      color: "bg-gradient-to-r from-pink-600 to-pink-700",
      route: "/reproduction/pregnancy-tracking",
      count: 5,
    },
    {
      id: "birth-record",
      title: "Registrar Nacimiento",
      description: "Nuevo nacimiento",
      icon: <Baby className="w-6 h-6" />,
      color: "bg-gradient-to-r from-green-600 to-green-700",
      route: "/reproduction/birth-records",
    },
    {
      id: "bull-management",
      title: "Gestión de Toros",
      description: "Administrar reproductores",
      icon: <Crown className="w-6 h-6" />,
      color: "bg-gradient-to-r from-purple-600 to-purple-700",
      route: "/reproduction/bull-management",
    },
  ];

  // Función para formatear fecha relativa
  const formatRelativeTime = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Hace unos minutos";
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    return date.toLocaleDateString();
  };

  // Función para obtener color de alerta
  const getAlertColor = (type: string) => {
    const colors = {
      critical: "bg-red-100 text-red-800 border-red-200",
      warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
      info: "bg-blue-100 text-blue-800 border-blue-200",
      success: "bg-green-100 text-green-800 border-green-200",
    };
    return colors[type as keyof typeof colors] || colors.info;
  };

  // Función para obtener icono de alerta
  const getAlertIcon = (type: string) => {
    const icons = {
      critical: <XCircle className="w-5 h-5" />,
      warning: <AlertTriangle className="w-5 h-5" />,
      info: <Info className="w-5 h-5" />,
      success: <CheckCircle className="w-5 h-5" />,
    };
    return icons[type as keyof typeof icons] || icons.info;
  };

  // Función para obtener icono de actividad
  const getActivityIcon = (type: string) => {
    const icons = {
      birth: <Baby className="w-4 h-4" />,
      mating: <Heart className="w-4 h-4" />,
      insemination: <Syringe className="w-4 h-4" />,
      checkup: <Stethoscope className="w-4 h-4" />,
      vaccination: <TestTube className="w-4 h-4" />,
    };
    return icons[type as keyof typeof icons] || <Activity className="w-4 h-4" />;
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Si está cargando
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              className="w-12 h-12 border-4 border-[#519a7c] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600 font-medium">Cargando dashboard de reproducción...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header del dashboard */}
        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
          variants={itemVariants}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <AnimatedText>Dashboard de Reproducción</AnimatedText>
                </h1>
                <p className="text-gray-600 mt-1">
                  Monitoreo integral del programa reproductivo
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Selector de periodo */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {["week", "month", "quarter"].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedTimeframe(period as any)}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                      selectedTimeframe === period
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {period === "week" && "Semana"}
                    {period === "month" && "Mes"}
                    {period === "quarter" && "Trimestre"}
                  </button>
                ))}
              </div>

              <motion.button
                onClick={() => setIsLoading(true)}
                className="p-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:border-[#519a7c] hover:text-[#519a7c] transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RefreshCw className="w-4 h-4" />
              </motion.button>

              <motion.button
                className="px-4 py-2 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-lg hover:from-[#4e9c75] hover:to-[#519a7c] transition-all duration-200 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Métricas principales */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={itemVariants}
        >
          {performanceMetrics.map((metric) => (
            <motion.div
              key={metric.id}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-lg ${metric.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                  {metric.icon}
                </div>
                <div className="flex items-center text-sm">
                  {metric.trend === "up" ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : metric.trend === "down" ? (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  ) : (
                    <Activity className="w-4 h-4 text-gray-500 mr-1" />
                  )}
                  <span className={`font-medium ${
                    metric.trend === "up" ? "text-green-600" :
                    metric.trend === "down" ? "text-red-600" : "text-gray-600"
                  }`}>
                    {metric.change > 0 ? "+" : ""}{metric.change}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</p>
                <p className="text-sm font-medium text-gray-700 mb-1">{metric.label}</p>
                {metric.description && (
                  <p className="text-xs text-gray-500">{metric.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Grid principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Acciones rápidas y estadísticas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Acciones rápidas */}
            <motion.div
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
              variants={itemVariants}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-600" />
                Acciones Rápidas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickActions.map((action) => (
                  <motion.button
                    key={action.id}
                    onClick={() => navigate(action.route)}
                    className={`${action.color} text-white rounded-xl p-4 text-left transition-all duration-300 relative overflow-hidden group`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      {action.icon}
                      {action.count && (
                        <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                          {action.count}
                        </span>
                      )}
                      {action.urgent && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                          Urgente
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-lg mb-1">{action.title}</h3>
                    <p className="text-white/80 text-sm">{action.description}</p>
                    
                    {/* Efecto hover */}
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Estadísticas detalladas */}
            <motion.div
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
              variants={itemVariants}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Estadísticas Detalladas
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Animales reproductores */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Users className="w-6 h-6 text-blue-600" />
                    <span className="text-2xl font-bold text-blue-700">{stats?.totalAnimals.total}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Animales Totales</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toros:</span>
                      <span className="font-medium">{stats?.totalAnimals.bulls}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vacas:</span>
                      <span className="font-medium">{stats?.totalAnimals.cows}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Activos:</span>
                      <span className="font-medium text-green-600">{stats?.totalAnimals.activeBreeders}</span>
                    </div>
                  </div>
                </div>

                {/* Gestaciones */}
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Heart className="w-6 h-6 text-pink-600" />
                    <span className="text-2xl font-bold text-pink-700">{stats?.pregnancies.totalPregnant}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Gestaciones</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temprana:</span>
                      <span className="font-medium">{stats?.pregnancies.earlyStage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Media:</span>
                      <span className="font-medium">{stats?.pregnancies.midStage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tardía:</span>
                      <span className="font-medium text-orange-600">{stats?.pregnancies.lateStage}</span>
                    </div>
                  </div>
                </div>

                {/* Economía */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                    <span className="text-lg font-bold text-green-700">
                      {stats?.economics.expectedROI}%
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">ROI Esperado</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Inversión:</span>
                      <span className="font-medium">{formatCurrency(stats?.economics.totalInvestment || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Proyectado:</span>
                      <span className="font-medium text-green-600">{formatCurrency(stats?.economics.projectedRevenue || 0)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Gráficos de rendimiento */}
            <motion.div
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
              variants={itemVariants}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <LineChart className="w-5 h-5 mr-2 text-purple-600" />
                Rendimiento Reproductivo
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Distribución de embarazos */}
                <div className="bg-purple-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Distribución de Embarazos</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Temprano (0-90d)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${(stats?.pregnancies.earlyStage || 0) / (stats?.pregnancies.totalPregnant || 1) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats?.pregnancies.earlyStage}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Medio (91-210d)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${(stats?.pregnancies.midStage || 0) / (stats?.pregnancies.totalPregnant || 1) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats?.pregnancies.midStage}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tardío (210+d)</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${(stats?.pregnancies.lateStage || 0) / (stats?.pregnancies.totalPregnant || 1) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{stats?.pregnancies.lateStage}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Distribución de nacimientos por género */}
                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-4">Nacimientos por Género</h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {stats?.births.totalBirths}
                      </div>
                      <div className="text-sm text-gray-600">Total Nacimientos</div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Machos</span>
                        <span className="text-sm font-medium">{stats?.births.maleCalves} ({Math.round(((stats?.births.maleCalves || 0) / (stats?.births.totalBirths || 1)) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full" 
                          style={{ width: `${((stats?.births.maleCalves || 0) / (stats?.births.totalBirths || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Hembras</span>
                        <span className="text-sm font-medium">{stats?.births.femaleCalves} ({Math.round(((stats?.births.femaleCalves || 0) / (stats?.births.totalBirths || 1)) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-pink-500 h-3 rounded-full" 
                          style={{ width: `${((stats?.births.femaleCalves || 0) / (stats?.births.totalBirths || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Columna derecha - Alertas y actividad reciente */}
          <div className="space-y-6">
            {/* Panel de alertas */}
            <motion.div
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
              variants={itemVariants}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-red-600" />
                  Alertas Activas
                </h2>
                <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                  {alerts.length}
                </span>
              </div>

              <div className="space-y-3">
                {alerts.slice(0, showAllAlerts ? alerts.length : 3).map((alert) => (
                  <motion.div
                    key={alert.id}
                    className={`p-4 rounded-xl border ${getAlertColor(alert.type)} cursor-pointer hover:shadow-md transition-all duration-200`}
                    onClick={() => alert.route && navigate(alert.route)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-sm">{alert.title}</h3>
                          {alert.actionRequired && (
                            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              Acción
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {formatRelativeTime(alert.timestamp)}
                          </span>
                          {alert.animalName && (
                            <span className="font-medium">{alert.animalName}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {alerts.length > 3 && (
                <button
                  onClick={() => setShowAllAlerts(!showAllAlerts)}
                  className="w-full mt-4 py-2 text-sm text-[#519a7c] hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {showAllAlerts ? "Ver menos" : `Ver todas (${alerts.length})`}
                </button>
              )}
            </motion.div>

            {/* Actividad reciente */}
            <motion.div
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
              variants={itemVariants}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-green-600" />
                Actividad Reciente
              </h2>

              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <motion.div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    whileHover={{ scale: 1.01 }}
                  >
                    <div className={`p-2 rounded-full ${
                      activity.result === "success" ? "bg-green-100" :
                      activity.result === "warning" ? "bg-yellow-100" :
                      activity.result === "error" ? "bg-red-100" : "bg-gray-100"
                    }`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-sm text-gray-900">{activity.title}</h3>
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">{activity.animalName}</span> · {activity.animalId}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => navigate("/reproduction/activity")}
                className="w-full mt-4 py-2 text-sm text-[#519a7c] hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center space-x-1"
              >
                <span>Ver toda la actividad</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Próximos eventos */}
            <motion.div
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
              variants={itemVariants}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
                Próximos Eventos
              </h2>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Inseminaciones programadas</p>
                    <p className="text-xs text-gray-600">Hoy · 3 procedimientos</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-pink-50 rounded-lg">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Partos esperados</p>
                    <p className="text-xs text-gray-600">Esta semana · 4 vacas</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">Chequeos de gestación</p>
                    <p className="text-xs text-gray-600">Próximos 3 días · 5 vacas</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate("/calendar")}
                className="w-full mt-4 py-2 text-sm text-[#519a7c] hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center space-x-1"
              >
                <span>Ver calendario completo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        </div>

        {/* Widgets de módulos específicos */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={itemVariants}
        >
          {/* Widget de Apareamientos */}
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/reproduction/mating-records")}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-red-500 rounded-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Apareamientos</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">{stats?.breeding.totalMatings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Este mes:</span>
                <span className="font-medium">{stats?.breeding.thisMonth}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Éxito:</span>
                <span className="font-medium text-green-600">{stats?.breeding.successRate}%</span>
              </div>
            </div>
          </motion.div>

          {/* Widget de Inseminación Artificial */}
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/reproduction/artificial-insemination")}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Syringe className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Inseminación Artificial</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Procedimientos:</span>
                <span className="font-medium">{stats?.artificialInsemination.totalProcedures}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Este mes:</span>
                <span className="font-medium">{stats?.artificialInsemination.thisMonth}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Éxito:</span>
                <span className="font-medium text-green-600">{stats?.artificialInsemination.successRate}%</span>
              </div>
            </div>
          </motion.div>

          {/* Widget de Seguimiento de Embarazos */}
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/reproduction/pregnancy-tracking")}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Timer className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Embarazos</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Activos:</span>
                <span className="font-medium">{stats?.pregnancies.totalPregnant}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Partos semana:</span>
                <span className="font-medium">{stats?.pregnancies.dueThisWeek}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Día promedio:</span>
                <span className="font-medium text-blue-600">{stats?.pregnancies.averageGestationDay}d</span>
              </div>
            </div>
          </motion.div>

          {/* Widget de Nacimientos */}
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 cursor-pointer"
            onClick={() => navigate("/reproduction/birth-records")}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Nacimientos</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total:</span>
                <span className="font-medium">{stats?.births.totalBirths}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Este mes:</span>
                <span className="font-medium">{stats?.births.thisMonth}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Peso promedio:</span>
                <span className="font-medium text-blue-600">{stats?.births.averageBirthWeight}kg</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ReproductionDashboard;