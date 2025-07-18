import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  BarChart3,
  Pill,
  TrendingDown,
  AlertTriangle,
  FileText,
  Settings,
  RefreshCw,
  Bell,
  Plus,
  Home,
  ChevronRight,
  Target,
  Clock,
  DollarSign,
  Info,
  Star,
  Zap,
  X,
} from "lucide-react";
import { getMainBackgroundClasses, CSS_CLASSES } from "../../components/layout";

// Importar los componentes del módulo de inventario
import InventoryDashboard from "./InventoryDashboard";
import MedicineInventory from "./MedicineInventory";
import StockLevels from "./StockLevels";
import LowStockAlerts from "./LowStockAlerts";
import InventoryReports from "./InventoryReports";

// Interfaces para el módulo
interface InventoryModuleStats {
  totalValue: number;
  totalItems: number;
  alertsCount: number;
  lowStockItems: number;
  expiringItems: number;
  lastUpdate: Date;
}

interface NavigationItem {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ComponentType<any>;
  badge?: number;
  color: string;
  isActive: boolean;
  hasNotifications?: boolean;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  action: () => void;
}

const InventoryPage: React.FC = () => {
  // Estados del componente
  const [moduleStats, setModuleStats] = useState<InventoryModuleStats | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);

  // Hooks de navegación
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la ruta actual para determinar la página activa
  const currentPath = location.pathname;

  // Configuración de navegación del módulo
  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      title: "Dashboard de Inventario",
      description: "Vista general y métricas principales del inventario",
      path: "/inventory/dashboard",
      icon: BarChart3,
      badge: 0,
      color: "text-blue-600",
      isActive: currentPath.includes("/dashboard"),
      hasNotifications: false,
    },
    {
      id: "medicine",
      title: "Inventario de Medicamentos",
      description: "Gestión especializada de medicamentos veterinarios",
      path: "/inventory/medicine",
      icon: Pill,
      badge: 0,
      color: "text-green-600",
      isActive: currentPath.includes("/medicine"),
      hasNotifications: false,
    },
    {
      id: "stock-levels",
      title: "Niveles de Stock",
      description: "Gestión y optimización de puntos de reorden",
      path: "/inventory/stock-levels",
      icon: Target,
      badge: 0,
      color: "text-purple-600",
      isActive: currentPath.includes("/stock-levels"),
      hasNotifications: false,
    },
    {
      id: "alerts",
      title: "Alertas de Stock Bajo",
      description: "Monitoreo y gestión de alertas en tiempo real",
      path: "/inventory/low-stock-alerts",
      icon: AlertTriangle,
      badge: 6,
      color: "text-orange-600",
      isActive: currentPath.includes("/low-stock-alerts"),
      hasNotifications: true,
    },
    {
      id: "reports",
      title: "Reportes de Inventario",
      description: "Generación y gestión de reportes especializados",
      path: "/inventory/reports",
      icon: FileText,
      badge: 0,
      color: "text-indigo-600",
      isActive: currentPath.includes("/reports"),
      hasNotifications: false,
    },
  ];

  // Acciones rápidas del módulo
  const quickActions: QuickAction[] = [
    {
      id: "new-entry",
      title: "Registrar Entrada",
      description: "Agregar nuevos items al inventario",
      icon: Plus,
      color: "bg-green-500 hover:bg-green-600",
      action: () => console.log("Navegando a registro de entrada"),
    },
    {
      id: "stock-take",
      title: "Conteo de Inventario",
      description: "Realizar conteo físico del stock",
      icon: Package,
      color: "bg-blue-500 hover:bg-blue-600",
      action: () => console.log("Navegando a conteo de inventario"),
    },
    {
      id: "generate-report",
      title: "Generar Reporte",
      description: "Crear reportes personalizados",
      icon: FileText,
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => navigate("/inventory/reports"),
    },
    {
      id: "bulk-update",
      title: "Actualización Masiva",
      description: "Actualizar múltiples items",
      icon: Settings,
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => console.log("Navegando a actualización masiva"),
    },
  ];

  // Efecto para cargar estadísticas del módulo
  useEffect(() => {
    const loadModuleStats = async () => {
      try {
        setIsLoading(true);

        // Simular carga de datos
        await new Promise((resolve) => setTimeout(resolve, 800));

        // Estadísticas simuladas del módulo
        const mockStats: InventoryModuleStats = {
          totalValue: 185420.5,
          totalItems: 245,
          alertsCount: 8,
          lowStockItems: 12,
          expiringItems: 5,
          lastUpdate: new Date(),
        };

        setModuleStats(mockStats);
      } catch (error) {
        console.error("Error cargando estadísticas del módulo:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadModuleStats();
  }, []);

  // Funciones auxiliares
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const getPageTitle = () => {
    const currentItem = navigationItems.find((item) => item.isActive);
    return currentItem ? currentItem.title : "Gestión de Inventario";
  };

  // Si estamos en la ruta base, mostrar la vista del módulo
  const isModuleRoot =
    currentPath === "/inventory" || currentPath === "/inventory/";

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
      {/* Vista principal del módulo */}
      {isModuleRoot ? (
        <div className="container mx-auto px-6 py-8">
          {/* Header del Módulo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Package className="w-8 h-8 text-white" />
                  <h1 className="text-4xl font-bold text-white drop-shadow-sm">
                    Gestión de Inventario
                  </h1>
                </div>
                <p className="text-white/90 text-lg">
                  Sistema integral para la gestión de medicamentos, suministros
                  y control de stock
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-4 lg:mt-0">
                {/* Estadísticas rápidas */}
                {moduleStats && (
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center space-x-4 text-white text-sm">
                      <div className="text-center">
                        <div className="font-bold text-lg">
                          {moduleStats.totalItems}
                        </div>
                        <div className="text-white/80">Items</div>
                      </div>
                      <div className="w-px h-8 bg-white/30"></div>
                      <div className="text-center">
                        <div className="font-bold text-lg">
                          {formatCurrency(moduleStats.totalValue / 1000)}K
                        </div>
                        <div className="text-white/80">Valor</div>
                      </div>
                      <div className="w-px h-8 bg-white/30"></div>
                      <div className="text-center">
                        <div className="font-bold text-lg text-orange-200">
                          {moduleStats.alertsCount}
                        </div>
                        <div className="text-white/80">Alertas</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botón de acciones rápidas */}
                <button
                  onClick={() => setShowQuickActions(!showQuickActions)}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center space-x-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>Acciones Rápidas</span>
                </button>

                {/* Actualizar datos */}
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center space-x-2">
                  <RefreshCw className="w-4 h-4" />
                  <span>Actualizar</span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center space-x-2 text-white/80 text-sm mb-8"
          >
            <Home className="w-4 h-4" />
            <span>Inicio</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium">Inventario</span>
          </motion.div>

          {/* Panel de Acciones Rápidas */}
          <AnimatePresence>
            {showQuickActions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8"
              >
                <div className={`${CSS_CLASSES.card} p-6`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Acciones Rápidas
                    </h3>
                    <button
                      onClick={() => setShowQuickActions(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * index }}
                        onClick={action.action}
                        className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
                      >
                        <div className="flex items-center space-x-3">
                          <action.icon className="w-5 h-5" />
                          <div className="text-left">
                            <div className="font-medium">{action.title}</div>
                            <div className="text-sm opacity-90">
                              {action.description}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Estadísticas del Módulo */}
          {moduleStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8"
            >
              {/* Valor Total */}
              <div className={`${CSS_CLASSES.card} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Valor Total
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {formatCurrency(moduleStats.totalValue)}
                    </p>
                    <p className="text-green-600 text-sm mt-1">
                      +2.5% vs mes anterior
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Total Items */}
              <div className={`${CSS_CLASSES.card} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Total Items
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {moduleStats.totalItems.toLocaleString()}
                    </p>
                    <p className="text-blue-600 text-sm mt-1">48 categorías</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Package className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Alertas Activas */}
              <div className={`${CSS_CLASSES.card} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Alertas Activas
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {moduleStats.alertsCount}
                    </p>
                    <p className="text-orange-600 text-sm mt-1">
                      Requieren atención
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </div>

              {/* Stock Bajo */}
              <div className={`${CSS_CLASSES.card} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Stock Bajo
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {moduleStats.lowStockItems}
                    </p>
                    <p className="text-red-600 text-sm mt-1">
                      Reposición urgente
                    </p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Por Vencer */}
              <div className={`${CSS_CLASSES.card} p-6`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">
                      Por Vencer
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {moduleStats.expiringItems}
                    </p>
                    <p className="text-purple-600 text-sm mt-1">
                      Próximos 30 días
                    </p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Navegación del Módulo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Módulos Disponibles
              </h2>
              <div className="flex items-center space-x-2 text-white/80 text-sm">
                <Clock className="w-4 h-4" />
                <span>
                  Actualizado:{" "}
                  {formatTime(moduleStats?.lastUpdate || new Date())}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  onClick={() => handleNavigate(item.path)}
                  className={`${
                    CSS_CLASSES.card
                  } p-6 cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105 ${
                    item.isActive ? "ring-2 ring-blue-500 ring-opacity-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-lg ${
                        item.id === "dashboard"
                          ? "bg-blue-100"
                          : item.id === "medicine"
                          ? "bg-green-100"
                          : item.id === "stock-levels"
                          ? "bg-purple-100"
                          : item.id === "alerts"
                          ? "bg-orange-100"
                          : "bg-indigo-100"
                      }`}
                    >
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>

                    <div className="flex items-center space-x-2">
                      {item.badge && item.badge > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                          {item.badge}
                        </span>
                      )}
                      {item.hasNotifications && (
                        <Bell className="w-4 h-4 text-orange-500" />
                      )}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.isActive
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.isActive ? "Página actual" : "Disponible"}
                    </span>

                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Información Adicional */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`${CSS_CLASSES.card} p-6`}
          >
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Info className="w-6 h-6 text-blue-600" />
              </div>

              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Acerca del Módulo de Inventario
                </h3>
                <p className="text-gray-600 mb-4">
                  El sistema de gestión de inventario está diseñado
                  específicamente para el sector ganadero, proporcionando
                  control completo sobre medicamentos veterinarios, suplementos,
                  alimentos y equipos especializados.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-700">
                      Control regulatorio SENASA
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-gray-700">
                      Optimización automática
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-700">
                      Alertas en tiempo real
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : (
        /* Renderizar las rutas específicas del módulo */
        <div className="w-full">
          {/* Header de navegación para sub-páginas */}
          <div className="bg-white/10 backdrop-blur-sm border-b border-white/20">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Breadcrumb */}
                  <div className="flex items-center space-x-2 text-white/80 text-sm">
                    <button
                      onClick={() => navigate("/inventory")}
                      className="hover:text-white transition-colors duration-200 flex items-center space-x-1"
                    >
                      <Home className="w-4 h-4" />
                      <span>Inventario</span>
                    </button>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-white font-medium">
                      {getPageTitle()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Navegación rápida entre módulos */}
                  <div className="hidden md:flex items-center space-x-2">
                    {navigationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.path)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center space-x-1 ${
                          item.isActive
                            ? "bg-white/20 text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <item.icon className="w-4 h-4" />
                        <span className="hidden lg:block">
                          {item.title.split(" ")[0]}
                        </span>
                        {item.badge && item.badge > 0 && (
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Botón de menú móvil */}
                  <button
                    onClick={() => setShowNavigation(!showNavigation)}
                    className="md:hidden bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg"
                  >
                    <Package className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Menú de navegación móvil */}
              <AnimatePresence>
                {showNavigation && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="md:hidden mt-4 pt-4 border-t border-white/20"
                  >
                    <div className="grid grid-cols-1 gap-2">
                      {navigationItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => {
                            handleNavigate(item.path);
                            setShowNavigation(false);
                          }}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            item.isActive
                              ? "bg-white/20 text-white"
                              : "text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                          {item.badge && item.badge > 0 && (
                            <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full ml-auto">
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Contenido de las rutas */}
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Navigate to="/inventory" replace />} />
              <Route
                path="/dashboard"
                element={
                  <motion.div
                    key="dashboard"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InventoryDashboard />
                  </motion.div>
                }
              />
              <Route
                path="/medicine"
                element={
                  <motion.div
                    key="medicine"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <MedicineInventory />
                  </motion.div>
                }
              />
              <Route
                path="/stock-levels"
                element={
                  <motion.div
                    key="stock-levels"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <StockLevels />
                  </motion.div>
                }
              />
              <Route
                path="/low-stock-alerts"
                element={
                  <motion.div
                    key="alerts"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <LowStockAlerts />
                  </motion.div>
                }
              />
              <Route
                path="/reports"
                element={
                  <motion.div
                    key="reports"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <InventoryReports />
                  </motion.div>
                }
              />
            </Routes>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
