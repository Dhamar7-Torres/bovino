import React, { useState, useEffect, createContext, useContext } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Settings,
  BarChart3,
  MapIcon,
  FileText,
  ChevronRight,
  Home,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  RefreshCw,
  Eye,
  Heart,
  Shield,
  Activity,
  Database,
} from "lucide-react";

// Importar componentes del módulo bovinos
import BovineAdd from "./BovineAdd";
import BovineDocuments from "./BovineDocuments";

// Contexto para el módulo de bovinos
interface BovinesContextType {
  totalBovines: number;
  healthyBovines: number;
  sickBovines: number;
  quarantineBovines: number;
  lastUpdated: Date;
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "isRead">
  ) => void;
  removeNotification: (id: string) => void;
  refreshData: () => void;
  isLoading: boolean;
}

interface Notification {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  autoHide?: boolean;
}

const BovinesContext = createContext<BovinesContextType | undefined>(undefined);

// Hook para usar el contexto
export const useBovinesContext = () => {
  const context = useContext(BovinesContext);
  if (!context) {
    throw new Error(
      "useBovinesContext debe ser usado dentro de BovinesProvider"
    );
  }
  return context;
};

// Componente de navegación breadcrumb
const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumbItems = () => {
    const path = location.pathname;
    const segments = path.split("/").filter(Boolean);

    const items = [{ label: "Inicio", path: "/", icon: Home }];

    if (segments.includes("bovines")) {
      items.push({ label: "Bovinos", path: "/bovines", icon: Users });

      if (segments.includes("add")) {
        items.push({
          label: "Agregar Bovino",
          path: "/bovines/add",
          icon: Plus,
        });
      } else if (segments.includes("detail")) {
        const id = segments[segments.indexOf("detail") + 1];
        items.push({
          label: `Detalle - ${id}`,
          path: `/bovines/detail/${id}`,
          icon: Eye,
        });
      } else if (segments.includes("edit")) {
        const id = segments[segments.indexOf("edit") + 1];
        items.push({
          label: `Editar - ${id}`,
          path: `/bovines/edit/${id}`,
          icon: Settings,
        });
      } else if (segments.includes("documents")) {
        const id = segments[segments.indexOf("documents") + 1];
        items.push({
          label: `Documentos - ${id}`,
          path: `/bovines/documents/${id}`,
          icon: FileText,
        });
      } else if (segments.includes("location")) {
        const id = segments[segments.indexOf("location") + 1];
        items.push({
          label: `Ubicación - ${id}`,
          path: `/bovines/location/${id}`,
          icon: MapIcon,
        });
      } else if (segments.includes("notes")) {
        const id = segments[segments.indexOf("notes") + 1];
        items.push({
          label: `Notas - ${id}`,
          path: `/bovines/notes/${id}`,
          icon: FileText,
        });
      }
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav className="flex items-center space-x-2 text-white/80 text-sm">
      {breadcrumbItems.map((item, index) => {
        const IconComponent = item.icon;
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <React.Fragment key={item.path}>
            <button
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-1 hover:text-white transition-colors ${
                isLast ? "text-white font-medium" : "hover:underline"
              }`}
              disabled={isLast}
            >
              <IconComponent className="w-4 h-4" />
              {item.label}
            </button>
            {!isLast && <ChevronRight className="w-4 h-4 text-white/60" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

// Componente de notificación toast
const NotificationToast: React.FC<{
  notification: Notification;
  onClose: (id: string) => void;
}> = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  useEffect(() => {
    if (notification.autoHide) {
      const timer = setTimeout(() => {
        onClose(notification.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.autoHide, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.9 }}
      className={`p-4 rounded-lg border shadow-lg ${getBgColor()} max-w-sm`}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">
            {notification.title}
          </h4>
          <p className="text-gray-700 text-sm mt-1">{notification.message}</p>
          <p className="text-gray-500 text-xs mt-2">
            {notification.timestamp.toLocaleTimeString("es-MX")}
          </p>
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// Panel de estadísticas del header
const HeaderStats: React.FC = () => {
  const {
    totalBovines,
    healthyBovines,
    sickBovines,
    quarantineBovines,
    lastUpdated,
  } = useBovinesContext();

  const stats = [
    {
      label: "Total",
      value: totalBovines,
      icon: Users,
      color: "text-white",
      bgColor: "bg-white/20",
    },
    {
      label: "Saludables",
      value: healthyBovines,
      icon: Heart,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      label: "Enfermos",
      value: sickBovines,
      icon: AlertTriangle,
      color: "text-red-400",
      bgColor: "bg-red-500/20",
    },
    {
      label: "Cuarentena",
      value: quarantineBovines,
      icon: Shield,
      color: "text-orange-400",
      bgColor: "bg-orange-500/20",
    },
  ];

  return (
    <div className="flex items-center justify-center gap-4">
      {stats.map((stat, index) => {
        const IconComponent = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`${stat.bgColor} backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2`}
          >
            <IconComponent className={`w-4 h-4 ${stat.color}`} />
            <div>
              <div className={`text-lg font-bold ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-white/80">{stat.label}</div>
            </div>
          </motion.div>
        );
      })}
      <div className="text-xs text-white/60 ml-4">
        Actualizado: {lastUpdated.toLocaleTimeString("es-MX")}
      </div>
    </div>
  );
};

// Proveedor del contexto de bovinos
const BovinesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [totalBovines, setTotalBovines] = useState(0);
  const [healthyBovines, setHealthyBovines] = useState(0);
  const [sickBovines, setSickBovines] = useState(0);
  const [quarantineBovines, setQuarantineBovines] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Datos simulados
      setTotalBovines(127);
      setHealthyBovines(118);
      setSickBovines(5);
      setQuarantineBovines(4);
      setLastUpdated(new Date());

      // Notificación de bienvenida
      addNotification({
        type: "info",
        title: "Sistema iniciado",
        message: "Datos del ganado bovino cargados correctamente",
        autoHide: true,
      });
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
      addNotification({
        type: "error",
        title: "Error al cargar datos",
        message: "No se pudieron cargar los datos del ganado",
        autoHide: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addNotification = (
    notification: Omit<Notification, "id" | "timestamp" | "isRead">
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const refreshData = async () => {
    try {
      setIsLoading(true);
      // Simular actualización de datos
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Actualizar timestamp
      setLastUpdated(new Date());

      addNotification({
        type: "success",
        title: "Datos actualizados",
        message: "La información del ganado ha sido actualizada",
        autoHide: true,
      });
    } catch (error) {
      console.error("Error actualizando datos:", error);
      addNotification({
        type: "error",
        title: "Error al actualizar",
        message: "No se pudieron actualizar los datos",
        autoHide: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: BovinesContextType = {
    totalBovines,
    healthyBovines,
    sickBovines,
    quarantineBovines,
    lastUpdated,
    notifications,
    addNotification,
    removeNotification,
    refreshData,
    isLoading,
  };

  return (
    <BovinesContext.Provider value={contextValue}>
      {children}
    </BovinesContext.Provider>
  );
};

// Componente principal del módulo bovinos
const BovinesPage: React.FC = () => {
  const location = useLocation();
  const { notifications, removeNotification } = useBovinesContext();

  // Animaciones de transición de página
  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Header del módulo */}
      <div className="bg-gradient-to-r from-[#3d8b40]/90 to-[#2d6e30]/90 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Breadcrumb */}
          <div className="mb-4">
            <Breadcrumb />
          </div>

          {/* Header principal */}
          <div className="flex flex-col items-center justify-center gap-4">
            {/* Título y estadísticas */}
            <div className="flex-1 w-full">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-center gap-3 mb-3"
              >
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-center">
                  <h1 className="text-2xl md:text-3xl font-bold text-white">
                    Módulo de Gestión Bovina
                  </h1>
                  <p className="text-white/80 text-sm">
                    Sistema integral para la administración del ganado
                  </p>
                </div>
              </motion.div>

              {/* Estadísticas */}
              <div className="flex justify-center">
                <HeaderStats />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal con animaciones */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <Routes>
              {/* Ruta principal - Lista de bovinos */}
              
              {/* Agregar nuevo bovino */}
              <Route path="add" element={<BovineAdd />} />

              {/* Documentos del bovino */}
              <Route path="documents/:id" element={<BovineDocuments />} />

              {/* Rutas adicionales del módulo */}
              <Route
                path="map"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center">
                      <MapIcon className="w-16 h-16 text-[#3d8b40] mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Mapa de Ubicaciones
                      </h2>
                      <p className="text-gray-600">
                        Vista general de todas las ubicaciones del ganado
                      </p>
                      <p className="text-sm text-gray-500 mt-4">
                        🚧 En desarrollo
                      </p>
                    </div>
                  </div>
                }
              />

              <Route
                path="reports"
                element={
                  <div className="min-h-screen flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center">
                      <BarChart3 className="w-16 h-16 text-[#3d8b40] mx-auto mb-4" />
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Reportes y Análisis
                      </h2>
                      <p className="text-gray-600">
                        Informes detallados del rendimiento del ganado
                      </p>
                      <p className="text-sm text-gray-500 mt-4">
                        🚧 En desarrollo
                      </p>
                    </div>
                  </div>
                }
              />

              {/* Ruta por defecto - redirigir a lista */}
              <Route path="*" element={<Navigate to="/bovines" replace />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Panel de notificaciones */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {notifications.slice(0, 3).map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onClose={removeNotification}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Indicador de carga global */}
      <AnimatePresence>
        {(() => {
          const { isLoading } = useBovinesContext();
          return (
            isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
              >
                <div className="bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/20 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-[#3d8b40]" />
                  <span className="text-sm font-medium text-gray-700">
                    Actualizando datos...
                  </span>
                </div>
              </motion.div>
            )
          );
        })()}
      </AnimatePresence>

      {/* Overlay de conexión */}
      <div className="fixed bottom-4 left-4 z-30">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20 flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs font-medium text-gray-700">
            Sistema conectado
          </span>
        </motion.div>
      </div>

      {/* Footer del módulo */}
      <div className="bg-gradient-to-r from-[#3d8b40]/80 to-[#2d6e30]/80 backdrop-blur-sm border-t border-white/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Base de datos sincronizada</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>Sistema operativo</span>
              </div>
            </div>
            <div className="text-center">
              <p>&copy; 2025 Bovino UJAT</p>
              <p className="text-xs text-white/60">
                Versión 2.1.4 - Módulo Bovinos
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Wrapper principal con proveedor de contexto
const BovinesPageWithProvider: React.FC = () => {
  return (
    <BovinesProvider>
      <BovinesPage />
    </BovinesProvider>
  );
};

export default BovinesPageWithProvider;