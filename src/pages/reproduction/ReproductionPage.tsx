// ReproductionPage.tsx
// Página principal del módulo de reproducción con enrutamiento interno
import React, { useState, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, Variants } from "framer-motion";
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
} from "lucide-react";

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
}

interface QuickStats {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: "up" | "down" | "stable";
  trendValue?: string;
}

// Componente principal de la página de reproducción
const ReproductionPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Estados principales
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [moduleStats, setModuleStats] = useState<ModuleStats | null>(null);
  const [activeAlerts, setActiveAlerts] = useState<number>(0);

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
        });
        setActiveAlerts(5);
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
    const currentItem = navigationItems.find(item => item.isActive);
    return currentItem ? currentItem.title : "Dashboard Principal";
  };

  // Función para obtener el ícono de tendencia
  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

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

  const sidebarVariants: Variants = {
    expanded: {
      width: "280px",
      transition: { duration: 0.3, ease: "easeInOut" }
    },
    collapsed: {
      width: "80px",
      transition: { duration: 0.3, ease: "easeInOut" }
    }
  };

  // Componente de elemento de navegación
  const NavigationItem: React.FC<{ item: NavigationItem }> = ({ item }) => (
    <motion.button
      variants={itemVariants}
      onClick={() => navigate(item.route)}
      className={`w-full text-left p-4 rounded-xl transition-all duration-200 group ${
        item.isActive
          ? "bg-white shadow-lg border border-gray-200"
          : "bg-white/50 hover:bg-white/80 hover:shadow-md"
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-lg ${item.color} ${item.isActive ? 'scale-110' : 'group-hover:scale-105'} transition-transform duration-200`}>
          {item.icon}
        </div>
        <AnimatePresence>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="flex-1 min-w-0"
            >
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${item.isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                  {item.title}
                </h3>
                {item.badge && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                {item.description}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );

  // Componente de estadística rápida
  const QuickStatCard: React.FC<{ stat: QuickStats }> = ({ stat }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${stat.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
            <div className={stat.color}>{stat.icon}</div>
          </div>
          <div>
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        </div>
        {stat.trend && stat.trendValue && (
          <div className="flex items-center space-x-1">
            {getTrendIcon(stat.trend)}
            <span className={`text-sm font-medium ${
              stat.trend === "up" ? "text-green-600" :
              stat.trend === "down" ? "text-red-600" : "text-gray-600"
            }`}>
              {stat.trendValue}
            </span>
          </div>
        )}
      </div>
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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <div className="flex">
        {/* Sidebar de Navegación */}
        <motion.div
          variants={sidebarVariants}
          animate={isSidebarCollapsed ? "collapsed" : "expanded"}
          className="bg-white/10 backdrop-blur-md border-r border-white/20 min-h-screen sticky top-0"
        >
          <div className="p-6">
            {/* Header del módulo */}
            <div className="flex items-center justify-between mb-8">
              <AnimatePresence>
                {!isSidebarCollapsed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <h1 className="text-2xl font-bold text-white">Reproducción</h1>
                    <p className="text-white/80 text-sm">Gestión reproductiva integral</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <motion.div
                  animate={{ rotate: isSidebarCollapsed ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </button>
            </div>

            {/* Navegación principal */}
            <motion.nav
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {navigationItems.map((item) => (
                <NavigationItem key={item.id} item={item} />
              ))}
            </motion.nav>

            {/* Estadísticas rápidas en sidebar */}
            <AnimatePresence>
              {!isSidebarCollapsed && moduleStats && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-8 p-4 bg-white/20 rounded-xl backdrop-blur-sm"
                >
                  <h3 className="text-white font-semibold mb-3">Resumen Rápido</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-white/90">
                      <span>Total Animales:</span>
                      <span className="font-medium">{moduleStats.totalAnimals}</span>
                    </div>
                    <div className="flex justify-between text-white/90">
                      <span>Apareamientos:</span>
                      <span className="font-medium">{moduleStats.activeBreedings}</span>
                    </div>
                    <div className="flex justify-between text-white/90">
                      <span>Embarazos:</span>
                      <span className="font-medium">{moduleStats.pregnancies}</span>
                    </div>
                    <div className="flex justify-between text-white/90">
                      <span>Tasa de Éxito:</span>
                      <span className="font-medium text-green-300">{moduleStats.successRate}%</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Acciones rápidas */}
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6"
                >
                  <h3 className="text-white font-semibold mb-3">Acciones Rápidas</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => navigate("/reproduction/mating-records")}
                      className="w-full text-left p-3 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Heart className="w-4 h-4" />
                      <span className="text-sm">Nuevo Apareamiento</span>
                    </button>
                    <button
                      onClick={() => navigate("/reproduction/artificial-insemination")}
                      className="w-full text-left p-3 bg-blue-500/20 hover:bg-blue-500/30 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Syringe className="w-4 h-4" />
                      <span className="text-sm">Programar IA</span>
                    </button>
                    <button
                      onClick={() => navigate("/reproduction/birth-records")}
                      className="w-full text-left p-3 bg-green-500/20 hover:bg-green-500/30 text-white rounded-lg transition-colors flex items-center space-x-2"
                    >
                      <Baby className="w-4 h-4" />
                      <span className="text-sm">Registrar Nacimiento</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

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

          {/* Contenido de las rutas hijas */}
          <div className={isSubModule ? "" : "p-6"}>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReproductionPage;