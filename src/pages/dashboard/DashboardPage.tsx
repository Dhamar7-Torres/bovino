import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  AlertTriangle,
  Package,
  Heart,
  Users,
  TrendingUp,
  Calendar,
  Home,
  Bell,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Download,
  Menu,
  X,
} from "lucide-react";

// Importar los componentes hijos del dashboard
import OverviewStats from "./OverviewStats";
import AlertsPanel from "./AlertsPanel";
import FeedInventory from "./FeedInventory";
import HealthSummary from "./HealthSummary";
import LivestockOverview from "./LivestockOverview";
import ProductionSummary from "./ProductionSummary";
import UpcomingEvents from "./UpcomingEvents";

// Tipos para las secciones del dashboard
type DashboardSection =
  | "overview"
  | "alerts"
  | "feed-inventory"
  | "health-summary"
  | "livestock-overview"
  | "production-summary"
  | "upcoming-events";

// Interfaz para la configuración de secciones
interface DashboardSectionConfig {
  id: DashboardSection;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType;
  color: string;
  notifications?: number;
  isNew?: boolean;
  path: string;
}

// Interfaz para notificaciones globales
interface GlobalNotification {
  id: string;
  type: "info" | "warning" | "error" | "success";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

const DashboardPage: React.FC = () => {
  // Estados principales
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<GlobalNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Hooks de React Router
  const location = useLocation();
  const navigate = useNavigate();

  // Obtener la sección activa basada en la ruta actual
  const getActiveSectionFromPath = (): DashboardSection => {
    const pathSegments = location.pathname.split("/");
    const sectionPath = pathSegments[pathSegments.length - 1];

    // Mapear rutas a secciones
    const routeToSection: Record<string, DashboardSection> = {
      overview: "overview",
      alerts: "alerts",
      "feed-inventory": "feed-inventory",
      "health-summary": "health-summary",
      "livestock-overview": "livestock-overview",
      "production-summary": "production-summary",
      "upcoming-events": "upcoming-events",
    };

    return routeToSection[sectionPath] || "overview";
  };

  const activeSection = getActiveSectionFromPath();

  // Configuración de las secciones del dashboard
  const dashboardSections: DashboardSectionConfig[] = [
    {
      id: "overview",
      title: "Overview Stats",
      description: "General statistics and key metrics",
      icon: <BarChart3 className="w-5 h-5" />,
      component: OverviewStats,
      color: "text-[#519a7c]", // Color verde del layout
      notifications: 0,
      path: "/dashboard-advanced/overview",
    },
    {
      id: "alerts",
      title: "Alerts Panel",
      description: "Critical alerts and notifications",
      icon: <AlertTriangle className="w-5 h-5" />,
      component: AlertsPanel,
      color: "text-red-500",
      notifications: 4,
      path: "/dashboard-advanced/alerts",
    },
    {
      id: "feed-inventory",
      title: "Feed Inventory",
      description: "Feed stock and supply management",
      icon: <Package className="w-5 h-5" />,
      component: FeedInventory,
      color: "text-green-500",
      notifications: 2,
      path: "/dashboard-advanced/feed-inventory",
    },
    {
      id: "health-summary",
      title: "Health Summary",
      description: "Animal health monitoring and records",
      icon: <Heart className="w-5 h-5" />,
      component: HealthSummary,
      color: "text-pink-500",
      notifications: 1,
      path: "/dashboard-advanced/health-summary",
    },
    {
      id: "livestock-overview",
      title: "Livestock Overview",
      description: "Complete view of all animals",
      icon: <Users className="w-5 h-5" />,
      component: LivestockOverview,
      color: "text-purple-500",
      notifications: 0,
      path: "/dashboard-advanced/livestock-overview",
    },
    {
      id: "production-summary",
      title: "Production Summary",
      description: "Production metrics and performance",
      icon: <TrendingUp className="w-5 h-5" />,
      component: ProductionSummary,
      color: "text-orange-500",
      notifications: 0,
      isNew: true,
      path: "/dashboard-advanced/production-summary",
    },
    {
      id: "upcoming-events",
      title: "Upcoming Events",
      description: "Scheduled activities and tasks",
      icon: <Calendar className="w-5 h-5" />,
      component: UpcomingEvents,
      color: "text-cyan-500",
      notifications: 3,
      path: "/dashboard-advanced/upcoming-events",
    },
  ];

  // Cargar datos iniciales y notificaciones
  useEffect(() => {
    const loadDashboardData = async () => {
      // Simular carga inicial
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Notificaciones simuladas
      const mockNotifications: GlobalNotification[] = [
        {
          id: "notif-001",
          type: "warning",
          title: "Feed Stock Low",
          message: "Cattle Pellets Premium stock is below minimum threshold",
          timestamp: "2025-07-11T08:30:00Z",
          read: false,
        },
        {
          id: "notif-002",
          type: "error",
          title: "Health Alert",
          message: "COW-087 requires immediate veterinary attention",
          timestamp: "2025-07-11T07:15:00Z",
          read: false,
        },
        {
          id: "notif-003",
          type: "info",
          title: "Event Reminder",
          message: "Vaccination scheduled for tomorrow at 9:00 AM",
          timestamp: "2025-07-10T16:45:00Z",
          read: true,
        },
        {
          id: "notif-004",
          type: "success",
          title: "Production Milestone",
          message: "Monthly milk production target exceeded by 4.1%",
          timestamp: "2025-07-10T14:20:00Z",
          read: true,
        },
      ];

      setNotifications(mockNotifications);
      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  // Redirigir a overview si estamos en la ruta base
  useEffect(() => {
    if (
      location.pathname === "/dashboard-advanced" ||
      location.pathname === "/dashboard-advanced/"
    ) {
      navigate("/dashboard-advanced/overview", { replace: true });
    }
  }, [location.pathname, navigate]);

  // Actualizar timestamp cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // 60 segundos

    return () => clearInterval(interval);
  }, []);

  // Función para obtener la sección activa
  const getActiveSection = () => {
    return dashboardSections.find((section) => section.id === activeSection);
  };

  // Función para refrescar datos
  const handleRefresh = () => {
    setLastUpdate(new Date());
    // Aquí iría la lógica para refrescar datos específicos de cada sección
  };

  // Función para navegar a una sección
  const navigateToSection = (sectionId: DashboardSection) => {
    const section = dashboardSections.find((s) => s.id === sectionId);
    if (section) {
      navigate(section.path);
    }
  };

  // Componente para el elemento de navegación
  const NavigationItem: React.FC<{
    section: DashboardSectionConfig;
    index: number;
  }> = ({ section, index }) => {
    const isActive = activeSection === section.id;

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={() => navigateToSection(section.id)}
        className={`relative p-4 rounded-xl cursor-pointer transition-all duration-300
                   ${
                     isActive
                       ? "bg-white/10 border border-white/20 shadow-lg"
                       : "hover:bg-white/5 border border-transparent"
                   }`}
      >
        {/* Indicador de sección activa */}
        {isActive && (
          <motion.div
            layoutId="activeIndicator"
            className="absolute left-0 top-0 bottom-0 w-1 bg-[#f4ac3a] rounded-r-full" // Color naranja del layout
          />
        )}

        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${section.color} ${
              isActive ? "bg-white/20" : "bg-white/10"
            }`}
          >
            {section.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3
                className={`font-medium ${
                  isActive ? "text-white" : "text-white/80"
                }`}
              >
                {section.title}
              </h3>
              <div className="flex items-center space-x-2">
                {section.isNew && (
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded-full">
                    NEW
                  </span>
                )}
                {section.notifications && section.notifications > 0 && (
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
                    {section.notifications}
                  </span>
                )}
              </div>
            </div>
            {isSidebarOpen && (
              <p
                className={`text-sm mt-1 ${
                  isActive ? "text-white/70" : "text-white/50"
                }`}
              >
                {section.description}
              </p>
            )}
          </div>
        </div>

        {/* Efecto hover */}
        {!isActive && (
          <motion.div
            className="absolute inset-0 bg-white/5 rounded-xl opacity-0 hover:opacity-100 transition-opacity"
            whileHover={{ opacity: 0.1 }}
          />
        )}
      </motion.div>
    );
  };

  // Componente para notificaciones
  const NotificationPanel: React.FC = () => {
    const unreadCount = notifications.filter((n) => !n.read).length;

    return (
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <Bell className="w-5 h-5 text-white" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs
                           rounded-full flex items-center justify-center"
            >
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 top-full mt-2 w-80 bg-[#F5F5DC]/90 backdrop-blur-xl
                       rounded-xl border border-[#e0ddd0] shadow-2xl z-50" // Colores del layout
            >
              <div className="p-4 border-b border-[#e0ddd0]">
                <h3 className="font-semibold text-gray-800">Notifications</h3>
                <p className="text-sm text-gray-600">{unreadCount} unread</p>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 border-b border-[#e0ddd0] hover:bg-white/50 transition-colors
                               ${!notification.read ? "bg-white/30" : ""}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`p-1 rounded-full mt-1 ${
                          notification.type === "error"
                            ? "bg-red-500/20 text-red-600"
                            : notification.type === "warning"
                            ? "bg-yellow-500/20 text-yellow-600"
                            : notification.type === "success"
                            ? "bg-green-500/20 text-green-600"
                            : "bg-blue-500/20 text-blue-600"
                        }`}
                      >
                        <div className="w-2 h-2 rounded-full bg-current" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800 text-sm">
                          {notification.title}
                        </h4>
                        <p className="text-gray-600 text-xs mt-1">
                          {notification.message}
                        </p>
                        <p className="text-gray-500 text-xs mt-2">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white/20 border-t-[#519a7c] rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <div className="flex">
        {/* Sidebar */}
        <motion.div
          initial={{ x: -300 }}
          animate={{ x: 0 }}
          className={`fixed left-0 top-0 h-full bg-[#2d5a41]/80 backdrop-blur-xl border-r border-white/10 z-40
                     transition-all duration-300 ${
                       isSidebarOpen ? "w-80" : "w-16"
                     }`}
          style={{
            marginTop: "76px", // Altura del header
            height: "calc(100vh - 76px)",
          }}
        >
          {/* Header del sidebar */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-xl font-bold text-white">
                    Livestock Dashboard
                  </h1>
                  <p className="text-white/60 text-sm">
                    Comprehensive farm management
                  </p>
                </motion.div>
              )}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isSidebarOpen ? (
                  <X className="w-4 h-4 text-white" />
                ) : (
                  <Menu className="w-4 h-4 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Navegación */}
          <div className="p-4 space-y-2 overflow-y-auto h-full pb-20">
            {dashboardSections.map((section, index) => (
              <NavigationItem
                key={section.id}
                section={section}
                index={index}
              />
            ))}
          </div>

          {/* Footer del sidebar */}
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-[#2d5a41]/90"
            >
              <div className="flex items-center justify-between text-xs text-white/60">
                <span>Last updated:</span>
                <span>{lastUpdate.toLocaleTimeString()}</span>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-400">System Online</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Contenido principal */}
        <div
          className={`flex-1 transition-all duration-300 ${
            isSidebarOpen ? "ml-80" : "ml-16"
          }`}
        >
          {/* Header principal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="sticky top-0 z-30 bg-[#2d5a41]/70 backdrop-blur-xl border-b border-white/10 p-4"
            style={{
              marginTop: "76px", // Altura del header
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Home className="w-5 h-5 text-white/60" />
                  <span className="text-white/60">Dashboard</span>
                  <span className="text-white/40">/</span>
                  <span className="text-white font-medium">
                    {getActiveSection()?.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {/* Barra de búsqueda rápida */}
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    placeholder="Quick search..."
                    className="w-64 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg
                             text-white placeholder-white/50 focus:outline-none focus:border-[#f4ac3a]"
                  />
                </div>

                {/* Botones de acción */}
                <button
                  onClick={handleRefresh}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                  title="Refresh data"
                >
                  <RefreshCw className="w-5 h-5 text-white" />
                </button>
                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Filter className="w-5 h-5 text-white" />
                </button>
                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Download className="w-5 h-5 text-white" />
                </button>

                {/* Panel de notificaciones */}
                <NotificationPanel />
                <button className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                  <Settings className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Contenido de la sección activa */}
          <div className="pt-16">
            {" "}
            {/* Espaciado para el header fijo */}
            <Routes>
              <Route path="overview" element={<OverviewStats />} />
              <Route path="alerts" element={<AlertsPanel />} />
              <Route path="feed-inventory" element={<FeedInventory />} />
              <Route path="health-summary" element={<HealthSummary />} />
              <Route
                path="livestock-overview"
                element={<LivestockOverview />}
              />
              <Route
                path="production-summary"
                element={<ProductionSummary />}
              />
              <Route path="upcoming-events" element={<UpcomingEvents />} />
              {/* Ruta por defecto */}
              <Route path="*" element={<OverviewStats />} />
            </Routes>
          </div>
        </div>
      </div>

      {/* Overlay para cerrar notificaciones */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default DashboardPage;
