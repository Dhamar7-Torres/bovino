// ReproductionPage.tsx
// Página principal del módulo de reproducción con enrutamiento interno y dashboard
import React, { useState, useEffect, Suspense } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import {
  LayoutDashboard,
  Heart,
  Baby,
  Crown,
  Flower2,
  Syringe,
  Timer,
  Bell,
  RefreshCw,
  ChevronRight,
  Target,
  Activity,
  TrendingUp,
  AlertTriangle,
  ArrowLeft,
  Plus,
  Users,
  Zap,
  CheckCircle,
  TrendingDown,
  Layers,
} from "lucide-react";

// Si tus componentes existen, usa estas importaciones directas
import MatingRecords from './MatingRecords';
import ArtificialInsemination from './ArtificialInsemination';
import PregnancyTracking from './PregnancyTracking';
import BirthRecords from './BirthRecords';
import BullManagement from './BullManagement';
import CowManagement from './CowManagement';
import ReproductionDashboard from './ReproductionDashboard';

// Tipos para navegación y módulos
interface NavigationItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  route: string;
  color: string;
  badge?: number;
  isActive?: boolean;
}

interface ModuleStats {
  totalAnimals: number;
  activeBreedings: number;
  pregnancies: number;
  birthsThisMonth: number;
  alerts: number;
  successRate: number;
  bulls: number;
  cows: number;
  lactatingCows: number;
  avgMilkProduction: number;
}

interface QuickStats {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

interface RecentActivity {
  id: string;
  type: "breeding" | "birth" | "pregnancy_test" | "vaccination";
  title: string;
  description: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}

// Componente AnimatedText para animaciones de texto
const AnimatedText: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <motion.span
    className={className}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {children}
  </motion.span>
);

// Variantes de animación
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
      type: "spring",
      stiffness: 100,
    },
  },
};

// Componente de carga personalizado
const LoadingSpinner: React.FC = () => (
  <div className="flex items-center justify-center h-64">
    <motion.div
      className="w-12 h-12 border-4 border-[#519a7c] border-t-transparent rounded-full"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  </div>
);

// Componente Dashboard integrado
const IntegratedDashboard: React.FC<{
  moduleStats: ModuleStats | null;
  recentActivities: RecentActivity[];
  navigationItems: NavigationItem[];
}> = ({ moduleStats, recentActivities, navigationItems }) => {
  const navigate = useNavigate();

  // Componente de tarjeta de estadística del dashboard
  const DashboardStatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
    subtitle?: string;
  }> = ({ title, value, icon, color = "", subtitle }) => (
    <motion.div
      variants={itemVariants}
      className={`bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </motion.div>
  );

  // Componente de tarjeta de navegación del módulo
  const ModuleCard: React.FC<{ item: NavigationItem }> = ({ item }) => (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(item.route)}
      className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 cursor-pointer hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${item.color}`}>
          {item.icon}
        </div>
        {item.badge && (
          <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
            {item.badge}
          </span>
        )}
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
      <p className="text-gray-600 text-sm mb-4">{item.description}</p>
      
      <div className="flex items-center text-[#519a7c] font-medium text-sm">
        <span>Ir al módulo</span>
        <ChevronRight className="w-4 h-4 ml-1" />
      </div>
    </motion.div>
  );

  // Componente de tarjeta de actividad reciente
  const ActivityCard: React.FC<{ activity: RecentActivity }> = ({ activity }) => (
    <motion.div
      variants={itemVariants}
      className="flex items-start space-x-3 p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
    >
      <div className={`p-2 rounded-lg ${activity.color}`}>
        {activity.icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
        <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      key="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-7xl mx-auto space-y-8"
    >
      {/* Header del Dashboard */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          <AnimatedText>Dashboard de Reproducción</AnimatedText>
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">
          Control integral del programa reproductivo del ganado
        </p>
      </motion.div>

      {/* Estadísticas Principales */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardStatCard
          title="Total Animales"
          value={moduleStats?.totalAnimals || 0}
          icon={<Users className="w-8 h-8" />}
          color="hover:bg-blue-50"
        />
        <DashboardStatCard
          title="Toros Activos"
          value={moduleStats?.bulls || 0}
          icon={<Crown className="w-8 h-8" />}
          color="hover:bg-yellow-50"
        />
        <DashboardStatCard
          title="Vacas Reproductoras"
          value={moduleStats?.cows || 0}
          icon={<Flower2 className="w-8 h-8" />}
          color="hover:bg-pink-50"
        />
        <DashboardStatCard
          title="Tasa de Éxito"
          value={`${moduleStats?.successRate || 0}%`}
          icon={<Target className="w-8 h-8" />}
          color="hover:bg-green-50"
        />
      </motion.div>

      {/* Estadísticas Detalladas */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardStatCard
          title="Apareamientos Activos"
          value={moduleStats?.activeBreedings || 0}
          icon={<Heart className="w-8 h-8" />}
          color="hover:bg-red-50"
        />
        <DashboardStatCard
          title="Embarazos Confirmados"
          value={moduleStats?.pregnancies || 0}
          icon={<Baby className="w-8 h-8" />}
          color="hover:bg-purple-50"
        />
        <DashboardStatCard
          title="Partos Este Mes"
          value={moduleStats?.birthsThisMonth || 0}
          icon={<CheckCircle className="w-8 h-8" />}
          color="hover:bg-green-50"
        />
        <DashboardStatCard
          title="Alertas Pendientes"
          value={moduleStats?.alerts || 0}
          icon={<AlertTriangle className="w-8 h-8" />}
          color="hover:bg-orange-50"
        />
      </motion.div>

      {/* Grid de Módulos */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Módulos de Gestión</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {navigationItems.slice(1).map((item) => (
            <ModuleCard key={item.id} item={item} />
          ))}
        </div>
      </motion.div>

      {/* Actividades Recientes y Acciones Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Actividades Recientes */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-[#519a7c]" />
                Actividades Recientes
              </h3>
              <button className="text-[#519a7c] hover:text-[#4a8970] font-medium text-sm">
                Ver todas
              </button>
            </div>
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <ActivityCard key={activity.id} activity={activity} />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Acciones Rápidas */}
        <motion.div variants={itemVariants}>
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-[#519a7c]" />
              Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate("/reproduction/mating-records")}
                className="w-full flex items-center justify-center px-4 py-3 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                <span className="text-sm">Registrar Apareamiento</span>
              </button>
              <button
                onClick={() => navigate("/reproduction/artificial-insemination")}
                className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Syringe className="w-4 h-4 mr-2" />
                <span className="text-sm">Nueva Inseminación</span>
              </button>
              <button
                onClick={() => navigate("/reproduction/pregnancy-tracking")}
                className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Timer className="w-4 h-4 mr-2" />
                <span className="text-sm">Revisar Embarazos</span>
              </button>
              <button
                onClick={() => navigate("/reproduction/birth-records")}
                className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Baby className="w-4 h-4 mr-2" />
                <span className="text-sm">Registrar Nacimiento</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Componente principal de la página de reproducción
const ReproductionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Estados principales
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [moduleStats, setModuleStats] = useState<ModuleStats | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<number>(0);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  // Verificar si estamos en la ruta raíz del módulo
  const isRootPath = location.pathname === "/reproduction" || location.pathname === "/reproduction/";
  const isSubModule = !isRootPath;

  // Elementos de navegación del módulo
  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      title: "Dashboard Principal",
      description: "Resumen general del programa reproductivo",
      icon: <LayoutDashboard className="w-6 h-6" />,
      route: "/reproduction",
      color: "text-indigo-600 bg-indigo-100",
      isActive: isRootPath,
    },
    {
      id: "mating-records",
      title: "Registros de Apareamiento",
      description: "Gestión de apareamientos y servicios",
      icon: <Heart className="w-6 h-6" />,
      route: "/reproduction/mating-records",
      color: "text-red-600 bg-red-100",
      badge: 12,
      isActive: location.pathname.includes("/mating-records"),
    },
    {
      id: "artificial-insemination",
      title: "Inseminación Artificial",
      description: "Procedimientos de IA y seguimiento",
      icon: <Syringe className="w-6 h-6" />,
      route: "/reproduction/artificial-insemination",
      color: "text-blue-600 bg-blue-100",
      badge: 5,
      isActive: location.pathname.includes("/artificial-insemination"),
    },
    {
      id: "pregnancy-tracking",
      title: "Seguimiento de Embarazos",
      description: "Monitoreo de gestación y cuidado prenatal",
      icon: <Timer className="w-6 h-6" />,
      route: "/reproduction/pregnancy-tracking",
      color: "text-purple-600 bg-purple-100",
      badge: 67,
      isActive: location.pathname.includes("/pregnancy-tracking"),
    },
    {
      id: "birth-records",
      title: "Registros de Nacimientos",
      description: "Documentación de partos y crías",
      icon: <Baby className="w-6 h-6" />,
      route: "/reproduction/birth-records",
      color: "text-green-600 bg-green-100",
      badge: 8,
      isActive: location.pathname.includes("/birth-records"),
    },
    {
      id: "bull-management",
      title: "Gestión de Toros",
      description: "Manejo de toros reproductores",
      icon: <Crown className="w-6 h-6" />,
      route: "/reproduction/bull-management",
      color: "text-yellow-600 bg-yellow-100",
      badge: 8,
      isActive: location.pathname.includes("/bull-management"),
    },
    {
      id: "cow-management",
      title: "Gestión de Vacas",
      description: "Manejo de vacas reproductoras",
      icon: <Flower2 className="w-6 h-6" />,
      route: "/reproduction/cow-management",
      color: "text-pink-600 bg-pink-100",
      badge: 145,
      isActive: location.pathname.includes("/cow-management"),
    },
  ];

  // Estadísticas rápidas para mostrar en el header
  const quickStats: QuickStats[] = [
    {
      label: "Tasa de Éxito",
      value: "85.4%",
      icon: <Target className="w-5 h-5" />,
      color: "text-green-600",
      trend: "up",
      trendValue: "+2.3%",
    },
    {
      label: "Embarazos Activos",
      value: 67,
      icon: <Heart className="w-5 h-5" />,
      color: "text-purple-600",
      trend: "stable",
      trendValue: "Sin cambios",
    },
    {
      label: "Partos Este Mes",
      value: 8,
      icon: <Baby className="w-5 h-5" />,
      color: "text-blue-600",
      trend: "up",
      trendValue: "+15%",
    },
    {
      label: "Alertas Activas",
      value: 5,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "text-red-600",
      trend: "down",
      trendValue: "-3",
    },
  ];

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const loadModuleData = async () => {
      setIsLoading(true);
      try {
        // Simular carga de datos del módulo
        await new Promise(resolve => setTimeout(resolve, 800));
        setModuleStats({
          totalAnimals: 153,
          activeBreedings: 89,
          pregnancies: 67,
          birthsThisMonth: 8,
          alerts: 5,
          successRate: 85.4,
          bulls: 8,
          cows: 145,
          lactatingCows: 78,
          avgMilkProduction: 28.5,
        });
        setActiveAlerts(5);
        setRecentActivities([
          {
            id: "1",
            type: "birth",
            title: "Nuevo nacimiento registrado",
            description: "Vaca Luna dio a luz a un becerro macho",
            time: "Hace 2 horas",
            icon: <Baby className="w-5 h-5" />,
            color: "text-green-600 bg-green-100"
          },
          {
            id: "2", 
            type: "breeding",
            title: "Servicio completado",
            description: "Vaca Estrella x Toro Campeón",
            time: "Hace 4 horas",
            icon: <Heart className="w-5 h-5" />,
            color: "text-red-600 bg-red-100"
          },
          {
            id: "3",
            type: "pregnancy_test",
            title: "Confirmación de preñez",
            description: "Vaca Princesa confirmada gestante",
            time: "Hace 1 día",
            icon: <CheckCircle className="w-5 h-5" />,
            color: "text-purple-600 bg-purple-100"
          },
          {
            id: "4",
            type: "vaccination",
            title: "Vacunación reproductiva",
            description: "5 vacas vacunadas contra brucelosis",
            time: "Hace 2 días",
            icon: <Syringe className="w-5 h-5" />,
            color: "text-blue-600 bg-blue-100"
          }
        ]);
      } catch (error) {
        console.error("Error al cargar datos del módulo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadModuleData();
  }, []);

  // Función para obtener el breadcrumb actual
  const getCurrentBreadcrumb = () => {
    const currentItem = navigationItems.find(item => 
      item.route === location.pathname || location.pathname.includes(item.id)
    );
    return currentItem ? currentItem.title : "Dashboard Principal";
  };

  // Función para obtener el ícono de tendencia
  const getTrendIcon = (trend?: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Layers className="w-4 h-4 text-gray-500" />;
    }
  };

  // Componente de tarjeta de estadística rápida
  const QuickStatCard: React.FC<{ stat: QuickStats }> = ({ stat }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border border-white/30"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-white/80">{stat.label}</p>
          <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
          {stat.trend && (
            <div className="flex items-center space-x-1 mt-1">
              {getTrendIcon(stat.trend)}
              <span className="text-xs text-white/70">{stat.trendValue}</span>
            </div>
          )}
        </div>
        <div className={`${stat.color} opacity-80`}>{stat.icon}</div>
      </div>
    </motion.div>
  );

  // Pantalla de carga
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
            <p className="text-gray-600 font-medium">Cargando módulo de reproducción...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <div className="flex">
        {/* Contenido Principal */}
        <div className="flex-1 min-h-screen">
          {/* Header del contenido cuando no estamos en el dashboard principal */}
          {isSubModule && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-md border-b border-white/20 p-6"
            >
              <div className="flex items-center justify-between">
                {/* Breadcrumb */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => navigate("/reproduction")}
                    className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    title="Volver al dashboard"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <nav className="flex items-center space-x-2 text-white/90">
                    <button
                      onClick={() => navigate("/reproduction")}
                      className="hover:text-white transition-colors"
                    >
                      Reproducción
                    </button>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white font-medium">{getCurrentBreadcrumb()}</span>
                  </nav>
                </div>

                {/* Estadísticas rápidas en header */}
                <div className="hidden lg:flex items-center space-x-4">
                  {quickStats.slice(0, 3).map((stat, index) => (
                    <div key={index} className="flex items-center space-x-2 text-white/90">
                      <div className="text-white/70">{stat.icon}</div>
                      <div>
                        <div className="text-sm text-white/70">{stat.label}</div>
                        <div className="font-semibold text-white">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Controles adicionales */}
                <div className="flex items-center space-x-3">
                  {activeAlerts > 0 && (
                    <button className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                      <Bell className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {activeAlerts}
                      </span>
                    </button>
                  )}
                  <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Estadísticas rápidas para pantallas pequeñas cuando no estamos en dashboard */}
          {isSubModule && (
            <div className="lg:hidden p-6 border-b border-white/20">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 gap-4"
              >
                {quickStats.map((stat, index) => (
                  <QuickStatCard key={index} stat={stat} />
                ))}
              </motion.div>
            </div>
          )}

          {/* Contenido de las rutas hijas o dashboard principal */}
          <div className="p-6">
            <Routes>
              {/* Ruta por defecto - Dashboard Integrado */}
              <Route 
                path="/" 
                element={
                  <IntegratedDashboard 
                    moduleStats={moduleStats}
                    recentActivities={recentActivities}
                    navigationItems={navigationItems}
                  />
                } 
              />
              
              {/* Rutas de submódulos */}
              <Route 
                path="mating-records" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <MatingRecords />
                  </Suspense>
                } 
              />
              <Route 
                path="artificial-insemination" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <ArtificialInsemination />
                  </Suspense>
                } 
              />
              <Route 
                path="pregnancy-tracking" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <PregnancyTracking />
                  </Suspense>
                } 
              />
              <Route 
                path="birth-records" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <BirthRecords />
                  </Suspense>
                } 
              />
              <Route 
                path="bull-management" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <BullManagement />
                  </Suspense>
                } 
              />
              <Route 
                path="cow-management" 
                element={
                  <Suspense fallback={<LoadingSpinner />}>
                    <CowManagement />
                  </Suspense>
                } 
              />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReproductionPage;