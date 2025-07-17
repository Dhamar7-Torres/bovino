// ReproductionDashboard.tsx
// Dashboard principal del módulo de reproducción
import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  Calendar,
  TrendingUp,
  Activity,
  Heart,
  Baby,
  Crown,
  Flower2,
  Target,
  Users,
  BarChart3,
  PieChart,
  LineChart,
  ArrowRight,
  Bell,
  Stethoscope,
  Timer,
  Eye,
  Download,
  RefreshCw,
  TestTube,
  Syringe,
  TrendingDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Tipos e interfaces para el dashboard
interface ReproductionStats {
  totalAnimals: {
    bulls: number;
    cows: number;
    total: number;
  };
  breeding: {
    totalMatings: number;
    successfulMatings: number;
    pendingResults: number;
    successRate: number;
  };
  pregnancies: {
    totalPregnant: number;
    earlyStage: number;
    midStage: number;
    lateStage: number;
    dueThisWeek: number;
    dueThisMonth: number;
    averageGestationDay: number;
  };
  births: {
    totalBirths: number;
    thisMonth: number;
    maleCalves: number;
    femaleCalves: number;
    averageBirthWeight: number;
    naturalBirths: number;
    assistedBirths: number;
  };
  artificialInsemination: {
    totalProcedures: number;
    successfulProcedures: number;
    successRate: number;
    thisMonth: number;
  };
  health: {
    totalAlerts: number;
    criticalAlerts: number;
    vaccinationsDue: number;
    checkupsDue: number;
  };
  economics: {
    totalInvestment: number;
    expectedROI: number;
    averageCostPerMating: number;
    projectedRevenue: number;
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
}

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  timestamp: string;
  module: string;
  animalId?: string;
  animalName?: string;
}

interface UpcomingEvent {
  id: string;
  type: "birth" | "vaccination" | "checkup" | "insemination";
  title: string;
  animalName: string;
  animalId: string;
  date: string;
  daysLeft: number;
  priority: "high" | "medium" | "low";
}

// Componente principal del Dashboard de Reproducción
const ReproductionDashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Estados principales
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<ReproductionStats | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [] = useState<"week" | "month" | "quarter">("month");
  const [showAllAlerts, setShowAllAlerts] = useState<boolean>(false);

  // Datos de ejemplo para desarrollo
  const mockStats: ReproductionStats = {
    totalAnimals: {
      bulls: 8,
      cows: 145,
      total: 153,
    },
    breeding: {
      totalMatings: 89,
      successfulMatings: 76,
      pendingResults: 12,
      successRate: 85.4,
    },
    pregnancies: {
      totalPregnant: 67,
      earlyStage: 18,
      midStage: 25,
      lateStage: 24,
      dueThisWeek: 3,
      dueThisMonth: 12,
      averageGestationDay: 156,
    },
    births: {
      totalBirths: 45,
      thisMonth: 8,
      maleCalves: 22,
      femaleCalves: 23,
      averageBirthWeight: 36.2,
      naturalBirths: 38,
      assistedBirths: 7,
    },
    artificialInsemination: {
      totalProcedures: 52,
      successfulProcedures: 44,
      successRate: 84.6,
      thisMonth: 14,
    },
    health: {
      totalAlerts: 15,
      criticalAlerts: 3,
      vaccinationsDue: 8,
      checkupsDue: 12,
    },
    economics: {
      totalInvestment: 2750000,
      expectedROI: 315,
      averageCostPerMating: 2800,
      projectedRevenue: 8650000,
    },
  };

  const mockAlerts: Alert[] = [
    {
      id: "alert-001",
      type: "critical",
      title: "Parto Vencido",
      message: "Bella Esperanza (MX-001) tiene 3 días de retraso en el parto",
      timestamp: "2025-01-17T08:30:00Z",
      module: "pregnancy",
      animalId: "cow-001",
      animalName: "Bella Esperanza",
    },
    {
      id: "alert-002",
      type: "warning",
      title: "Vacunación Pendiente",
      message: "8 animales requieren vacunación en los próximos 3 días",
      timestamp: "2025-01-17T10:15:00Z",
      module: "health",
    },
    {
      id: "alert-003",
      type: "critical",
      title: "Complicación en Embarazo",
      message: "Luna Plateada (MX-002) presenta sangrado leve",
      timestamp: "2025-01-17T14:20:00Z",
      module: "pregnancy",
      animalId: "cow-002",
      animalName: "Luna Plateada",
    },
    {
      id: "alert-004",
      type: "info",
      title: "Examen Programado",
      message: "Ultrasonido programado para Estrella Dorada mañana",
      timestamp: "2025-01-17T16:00:00Z",
      module: "pregnancy",
      animalId: "cow-003",
      animalName: "Estrella Dorada",
    },
    {
      id: "alert-005",
      type: "warning",
      title: "Toro Requiere Chequeo",
      message: "Campeón Imperial no ha sido evaluado en 60 días",
      timestamp: "2025-01-17T09:45:00Z",
      module: "bull_management",
      animalId: "bull-001",
      animalName: "Campeón Imperial",
    },
  ];

  const mockUpcomingEvents: UpcomingEvent[] = [
    {
      id: "event-001",
      type: "birth",
      title: "Parto Esperado",
      animalName: "Rosa Blanca",
      animalId: "cow-004",
      date: "2025-01-20",
      daysLeft: 3,
      priority: "high",
    },
    {
      id: "event-002",
      type: "vaccination",
      title: "Vacuna IBR/BVD",
      animalName: "Tornado Negro",
      animalId: "bull-002",
      date: "2025-01-19",
      daysLeft: 2,
      priority: "medium",
    },
    {
      id: "event-003",
      type: "checkup",
      title: "Chequeo Gestacional",
      animalName: "Paloma Dorada",
      animalId: "cow-005",
      date: "2025-01-18",
      daysLeft: 1,
      priority: "high",
    },
    {
      id: "event-004",
      type: "insemination",
      title: "IA Programada",
      animalName: "Estrella Nueva",
      animalId: "cow-006",
      date: "2025-01-21",
      daysLeft: 4,
      priority: "medium",
    },
    {
      id: "event-005",
      type: "birth",
      title: "Parto Esperado",
      animalName: "Luna Azul",
      animalId: "cow-007",
      date: "2025-01-25",
      daysLeft: 8,
      priority: "medium",
    },
  ];

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStats(mockStats);
        setAlerts(mockAlerts);
        setUpcomingEvents(mockUpcomingEvents);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Acciones rápidas del dashboard
  const quickActions: QuickAction[] = [
    {
      id: "new-mating",
      title: "Nuevo Apareamiento",
      description: "Registrar apareamiento natural o IA",
      icon: <Heart className="w-6 h-6" />,
      color: "bg-red-500 hover:bg-red-600",
      route: "/reproduction/mating/new",
    },
    {
      id: "new-pregnancy",
      title: "Confirmar Embarazo",
      description: "Registrar confirmación de gestación",
      icon: <Baby className="w-6 h-6" />,
      color: "bg-purple-500 hover:bg-purple-600",
      route: "/reproduction/pregnancy/new",
    },
    {
      id: "new-birth",
      title: "Registrar Nacimiento",
      description: "Documentar nuevo nacimiento",
      icon: <Users className="w-6 h-6" />,
      color: "bg-green-500 hover:bg-green-600",
      route: "/reproduction/births/new",
    },
    {
      id: "schedule-ai",
      title: "Programar IA",
      description: "Agendar inseminación artificial",
      icon: <Syringe className="w-6 h-6" />,
      color: "bg-blue-500 hover:bg-blue-600",
      route: "/reproduction/ai/schedule",
    },
  ];

  // Animaciones de Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Función para formatear fecha relativa
  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return "Hace menos de una hora";
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  };

  // Función para obtener color de alerta
  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-l-red-500 bg-red-50";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50";
      case "info":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  // Función para obtener color de prioridad de evento
  const getEventPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Función para obtener ícono de evento
  const getEventIcon = (type: string) => {
    switch (type) {
      case "birth":
        return <Baby className="w-4 h-4" />;
      case "vaccination":
        return <Syringe className="w-4 h-4" />;
      case "checkup":
        return <Stethoscope className="w-4 h-4" />;
      case "insemination":
        return <TestTube className="w-4 h-4" />;
      default:
        return <Calendar className="w-4 h-4" />;
    }
  };

  // Componente de tarjeta de estadísticas
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    color: string;
    trend?: "up" | "down" | "stable";
    trendValue?: string;
    onClick?: () => void;
  }> = ({ title, value, subtitle, icon, color, trend, trendValue, onClick }) => (
    <motion.div
      variants={itemVariants}
      onClick={onClick}
      className={`bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 ${color} ${
        onClick ? "cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center mt-2">
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : trend === "down" ? (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              ) : (
                <Activity className="w-4 h-4 text-gray-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                trend === "up" ? "text-green-600" :
                trend === "down" ? "text-red-600" : "text-gray-600"
              }`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </motion.div>
  );

  // Componente de acción rápida
  const QuickActionCard: React.FC<{ action: QuickAction }> = ({ action }) => (
    <motion.button
      variants={itemVariants}
      onClick={() => navigate(action.route)}
      className={`${action.color} text-white rounded-xl p-6 text-left transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl`}
    >
      <div className="flex items-center justify-between mb-3">
        {action.icon}
        {action.count && (
          <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
            {action.count}
          </span>
        )}
      </div>
      <h3 className="font-bold text-lg mb-1">{action.title}</h3>
      <p className="text-white/80 text-sm">{action.description}</p>
    </motion.button>
  );

  // Componente de widget de módulo
  const ModuleWidget: React.FC<{
    title: string;
    icon: React.ReactNode;
    route: string;
    stats: { label: string; value: string | number }[];
    color: string;
  }> = ({ title, icon, route, stats, color }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 ${color} rounded-lg`}>
            {icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <button
          onClick={() => navigate(route)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{stat.label}</span>
            <span className="font-semibold text-gray-900">{stat.value}</span>
          </div>
        ))}
      </div>
      
      <button
        onClick={() => navigate(route)}
        className="w-full mt-4 text-center text-[#519a7c] hover:text-[#4a8970] font-medium text-sm transition-colors"
      >
        Ver detalles →
      </button>
    </motion.div>
  );

  // Componente de carga
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
      />
    </div>
  );

  if (isLoading || !stats) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2">
                Dashboard de Reproducción
              </h1>
              <p className="text-white/90 text-lg">
                Gestión integral del programa reproductivo del hato
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20">
                <RefreshCw className="w-5 h-5 mr-2" />
                Actualizar
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20">
                <Download className="w-5 h-5 mr-2" />
                Exportar Reporte
              </button>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas Principales */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Animales"
            value={stats.totalAnimals.total}
            subtitle={`${stats.totalAnimals.bulls} toros, ${stats.totalAnimals.cows} vacas`}
            icon={<Users className="w-8 h-8" />}
            color="hover:bg-blue-50"
            trend="up"
            trendValue="+2.3%"
            onClick={() => navigate("/reproduction/animals")}
          />
          <StatCard
            title="Tasa de Éxito Reproductivo"
            value={`${stats.breeding.successRate}%`}
            subtitle={`${stats.breeding.successfulMatings}/${stats.breeding.totalMatings} apareamientos`}
            icon={<Target className="w-8 h-8" />}
            color="hover:bg-green-50"
            trend="up"
            trendValue="+3.1%"
            onClick={() => navigate("/reproduction/mating")}
          />
          <StatCard
            title="Embarazos Activos"
            value={stats.pregnancies.totalPregnant}
            subtitle={`${stats.pregnancies.dueThisWeek} partos esta semana`}
            icon={<Heart className="w-8 h-8" />}
            color="hover:bg-purple-50"
            trend="stable"
            trendValue="Sin cambios"
            onClick={() => navigate("/reproduction/pregnancy")}
          />
          <StatCard
            title="Nacimientos Este Mes"
            value={stats.births.thisMonth}
            subtitle={`${stats.births.totalBirths} total este año`}
            icon={<Baby className="w-8 h-8" />}
            color="hover:bg-pink-50"
            trend="up"
            trendValue="+15.2%"
            onClick={() => navigate("/reproduction/births")}
          />
        </motion.div>

        {/* Alertas y Eventos Próximos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Panel de Alertas */}
          <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Bell className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Alertas Activas</h3>
                    <p className="text-sm text-gray-600">
                      {stats.health.criticalAlerts} críticas, {stats.health.totalAlerts - stats.health.criticalAlerts} normales
                    </p>
                  </div>
                </div>
                <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                  {stats.health.totalAlerts}
                </span>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {alerts.slice(0, showAllAlerts ? alerts.length : 3).map((alert) => (
                  <div
                    key={alert.id}
                    className={`border-l-4 p-4 rounded-r-lg ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{alert.title}</h4>
                        <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <span>{alert.module}</span>
                          <span>•</span>
                          <span>{formatRelativeDate(alert.timestamp)}</span>
                        </div>
                      </div>
                      {alert.animalName && (
                        <button
                          onClick={() => navigate(`/reproduction/${alert.module}/${alert.animalId}`)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          Ver
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {alerts.length > 3 && (
                <button
                  onClick={() => setShowAllAlerts(!showAllAlerts)}
                  className="w-full mt-4 text-center text-[#519a7c] hover:text-[#4a8970] font-medium text-sm transition-colors"
                >
                  {showAllAlerts ? "Ver menos" : `Ver todas (${alerts.length})`}
                </button>
              )}
            </div>
          </motion.div>

          {/* Panel de Eventos Próximos */}
          <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Eventos Próximos</h3>
                    <p className="text-sm text-gray-600">Actividades programadas</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate("/reproduction/calendar")}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className={`p-2 rounded-lg ${getEventPriorityColor(event.priority)}`}>
                      {getEventIcon(event.type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-600">{event.animalName}</p>
                      <p className="text-xs text-gray-500">
                        {event.daysLeft === 0 ? "Hoy" :
                         event.daysLeft === 1 ? "Mañana" :
                         `En ${event.daysLeft} días`}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/reproduction/animal/${event.animalId}`)}
                      className="text-[#519a7c] hover:text-[#4a8970] transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Acciones Rápidas */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <QuickActionCard key={action.id} action={action} />
            ))}
          </div>
        </motion.div>

        {/* Widgets de Módulos */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Resumen por Módulos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Widget de Gestión de Toros */}
            <ModuleWidget
              title="Gestión de Toros"
              icon={<Crown className="w-6 h-6 text-white" />}
              route="/reproduction/bulls"
              color="bg-yellow-500"
              stats={[
                { label: "Toros Activos", value: stats.totalAnimals.bulls },
                { label: "En Servicio", value: "6" },
                { label: "Promedio Servicios/Mes", value: "12.3" },
                { label: "Tasa de Fertilidad", value: "87.2%" },
              ]}
            />

            {/* Widget de Gestión de Vacas */}
            <ModuleWidget
              title="Gestión de Vacas"
              icon={<Flower2 className="w-6 h-6 text-white" />}
              route="/reproduction/cows"
              color="bg-pink-500"
              stats={[
                { label: "Vacas en Hato", value: stats.totalAnimals.cows },
                { label: "Lactando", value: "78" },
                { label: "Secas", value: "34" },
                { label: "Vaquillas", value: "33" },
              ]}
            />

            {/* Widget de Inseminación Artificial */}
            <ModuleWidget
              title="Inseminación Artificial"
              icon={<Syringe className="w-6 h-6 text-white" />}
              route="/reproduction/ai"
              color="bg-blue-500"
              stats={[
                { label: "Procedimientos", value: stats.artificialInsemination.totalProcedures },
                { label: "Este Mes", value: stats.artificialInsemination.thisMonth },
                { label: "Tasa de Éxito", value: `${stats.artificialInsemination.successRate}%` },
                { label: "Costo Promedio", value: "$2,800" },
              ]}
            />

            {/* Widget de Seguimiento de Embarazos */}
            <ModuleWidget
              title="Seguimiento Embarazos"
              icon={<Timer className="w-6 h-6 text-white" />}
              route="/reproduction/pregnancy"
              color="bg-purple-500"
              stats={[
                { label: "Embarazos Activos", value: stats.pregnancies.totalPregnant },
                { label: "Partos Esta Semana", value: stats.pregnancies.dueThisWeek },
                { label: "Día Promedio", value: `${stats.pregnancies.averageGestationDay}d` },
                { label: "Con Complicaciones", value: "2" },
              ]}
            />

            {/* Widget de Registros de Nacimientos */}
            <ModuleWidget
              title="Registros Nacimientos"
              icon={<Baby className="w-6 h-6 text-white" />}
              route="/reproduction/births"
              color="bg-green-500"
              stats={[
                { label: "Nacimientos", value: stats.births.totalBirths },
                { label: "Este Mes", value: stats.births.thisMonth },
                { label: "Peso Promedio", value: `${stats.births.averageBirthWeight} kg` },
                { label: "Naturales", value: `${Math.round((stats.births.naturalBirths / stats.births.totalBirths) * 100)}%` },
              ]}
            />

            {/* Widget de Análisis Económico */}
            <ModuleWidget
              title="Análisis Económico"
              icon={<TrendingUp className="w-6 h-6 text-white" />}
              route="/reproduction/economics"
              color="bg-indigo-500"
              stats={[
                { label: "Inversión Total", value: formatCurrency(stats.economics.totalInvestment) },
                { label: "ROI Esperado", value: `${stats.economics.expectedROI}%` },
                { label: "Ingresos Proyectados", value: formatCurrency(stats.economics.projectedRevenue) },
                { label: "Costo/Apareamiento", value: formatCurrency(stats.economics.averageCostPerMating) },
              ]}
            />
          </div>
        </motion.div>

        {/* Métricas de Rendimiento */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Distribución de Embarazos por Etapa */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2 text-purple-600" />
              Embarazos por Etapa
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Temprano (0-90d)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${(stats.pregnancies.earlyStage / stats.pregnancies.totalPregnant) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.pregnancies.earlyStage}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Medio (91-210d)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ width: `${(stats.pregnancies.midStage / stats.pregnancies.totalPregnant) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.pregnancies.midStage}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Tardío (211-283d)</span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-orange-500 h-2 rounded-full" 
                      style={{ width: `${(stats.pregnancies.lateStage / stats.pregnancies.totalPregnant) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{stats.pregnancies.lateStage}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Distribución de Nacimientos por Género */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
              Nacimientos por Género
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Machos</span>
                  <span className="text-sm font-medium">{stats.births.maleCalves} ({Math.round((stats.births.maleCalves / stats.births.totalBirths) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full" 
                    style={{ width: `${(stats.births.maleCalves / stats.births.totalBirths) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Hembras</span>
                  <span className="text-sm font-medium">{stats.births.femaleCalves} ({Math.round((stats.births.femaleCalves / stats.births.totalBirths) * 100)}%)</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-pink-500 h-3 rounded-full" 
                    style={{ width: `${(stats.births.femaleCalves / stats.births.totalBirths) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Eficiencia Reproductiva */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <LineChart className="w-5 h-5 mr-2 text-indigo-600" />
              Eficiencia Reproductiva
            </h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-1">
                  {stats.breeding.successRate}%
                </div>
                <div className="text-sm text-gray-600">Tasa de Éxito Global</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-green-600">
                    {stats.artificialInsemination.successRate}%
                  </div>
                  <div className="text-xs text-gray-600">IA</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    87.2%
                  </div>
                  <div className="text-xs text-gray-600">Natural</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ReproductionDashboard;