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
  Wifi,
  WifiOff,
} from "lucide-react";

// Importar componentes del módulo bovinos
import BovineAdd from "./BovineAdd";
import BovineDocuments from "./BovineDocuments";

// =============================================================================
// API SERVICE - Maneja la comunicación con el backend
// =============================================================================

const API_BASE_URL = "http://localhost:5000/api";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

interface BovineData {
  id: string;
  earTag: string;
  name?: string;
  breed: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
  healthStatus: "HEALTHY" | "SICK" | "QUARANTINE" | "TREATMENT";
  weight?: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface BovineStats {
  total: number;
  healthy: number;
  sick: number;
  quarantine: number;
  treatment: number;
}

class ApiService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Error in API request to ${endpoint}:`, error);
      throw error;
    }
  }

  // Test de conectividad
  static async ping(): Promise<ApiResponse> {
    return this.makeRequest("/ping");
  }

  // Estado del sistema
  static async health(): Promise<ApiResponse> {
    return this.makeRequest("/health");
  }

  // Obtener todos los bovinos
  static async getBovines(params?: {
    page?: number;
    limit?: number;
    status?: string;
    breed?: string;
  }): Promise<ApiResponse<{ bovines: BovineData[]; pagination: any }>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.breed) searchParams.append("breed", params.breed);

    const queryString = searchParams.toString();
    return this.makeRequest(`/bovines${queryString ? `?${queryString}` : ""}`);
  }

  // Obtener bovino por ID
  static async getBovineById(id: string): Promise<ApiResponse<{ bovine: BovineData }>> {
    return this.makeRequest(`/bovines/${id}`);
  }

  // Crear nuevo bovino
  static async createBovine(bovineData: Partial<BovineData>): Promise<ApiResponse<{ bovine: BovineData }>> {
    return this.makeRequest("/bovines", {
      method: "POST",
      body: JSON.stringify(bovineData),
    });
  }

  // Actualizar bovino
  static async updateBovine(id: string, updates: Partial<BovineData>): Promise<ApiResponse<{ bovine: BovineData }>> {
    return this.makeRequest(`/bovines/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Eliminar bovino
  static async deleteBovine(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/bovines/${id}`, {
      method: "DELETE",
    });
  }

  // Obtener estadísticas
  static async getStats(): Promise<ApiResponse<BovineStats>> {
    return this.makeRequest("/bovines/stats");
  }
}

// =============================================================================
// CONTEXTOS Y TIPOS
// =============================================================================

interface BovinesContextType {
  totalBovines: number;
  healthyBovines: number;
  sickBovines: number;
  quarantineBovines: number;
  treatmentBovines: number;
  lastUpdated: Date;
  notifications: Notification[];
  isConnected: boolean;
  connectionStatus: "connected" | "disconnected" | "connecting";
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "isRead">
  ) => void;
  removeNotification: (id: string) => void;
  refreshData: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  isLoading: boolean;
  bovines: BovineData[];
  loadBovines: () => Promise<void>;
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

// =============================================================================
// COMPONENTES DE UI
// =============================================================================

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
    treatmentBovines,
    lastUpdated,
    refreshData,
    isLoading,
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
    {
      label: "Tratamiento",
      value: treatmentBovines,
      icon: Activity,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
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
      
      {/* Botón de actualización */}
      <button
        onClick={refreshData}
        disabled={isLoading}
        className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-white/30 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 text-white ${isLoading ? 'animate-spin' : ''}`} />
        <span className="text-xs text-white/80">
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </span>
      </button>
      
      <div className="text-xs text-white/60 ml-4">
        Actualizado: {lastUpdated.toLocaleTimeString("es-MX")}
      </div>
    </div>
  );
};

// Indicador de conexión
const ConnectionStatus: React.FC = () => {
  const { isConnected, connectionStatus, testConnection } = useBovinesContext();

  const handleTestConnection = async () => {
    await testConnection();
  };

  return (
    <div className="fixed bottom-4 left-4 z-30">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20 flex items-center gap-2"
      >
        {connectionStatus === "connecting" ? (
          <RefreshCw className="w-3 h-3 text-yellow-500 animate-spin" />
        ) : isConnected ? (
          <Wifi className="w-3 h-3 text-green-500" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-500" />
        )}
        
        <span className="text-xs font-medium text-gray-700">
          {connectionStatus === "connecting" 
            ? "Conectando..." 
            : isConnected 
              ? "Backend conectado" 
              : "Sin conexión"
          }
        </span>
        
        <button
          onClick={handleTestConnection}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
          disabled={connectionStatus === "connecting"}
        >
          Test
        </button>
      </motion.div>
    </div>
  );
};

// =============================================================================
// PROVEEDOR DEL CONTEXTO DE BOVINOS
// =============================================================================

const BovinesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [totalBovines, setTotalBovines] = useState(0);
  const [healthyBovines, setHealthyBovines] = useState(0);
  const [sickBovines, setSickBovines] = useState(0);
  const [quarantineBovines, setQuarantineBovines] = useState(0);
  const [treatmentBovines, setTreatmentBovines] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "connecting">("disconnected");
  const [bovines, setBovines] = useState<BovineData[]>([]);

  // Probar conexión al backend
  const testConnection = async (): Promise<boolean> => {
    try {
      setConnectionStatus("connecting");
      const response = await ApiService.ping();
      
      if (response.success) {
        setIsConnected(true);
        setConnectionStatus("connected");
        addNotification({
          type: "success",
          title: "Conexión establecida",
          message: "Backend conectado correctamente",
          autoHide: true,
        });
        return true;
      } else {
        throw new Error("Ping fallido");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      setIsConnected(false);
      setConnectionStatus("disconnected");
      addNotification({
        type: "error",
        title: "Error de conexión",
        message: `No se pudo conectar al backend: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        autoHide: false,
      });
      return false;
    }
  };

  // Cargar datos de bovinos desde el backend
  const loadBovines = async () => {
    try {
      setIsLoading(true);
      
      const response = await ApiService.getBovines();
      
      if (response.success && response.data) {
        setBovines(response.data.bovines || []);
        
        addNotification({
          type: "success",
          title: "Datos cargados",
          message: `Se cargaron ${response.data.bovines?.length || 0} bovinos`,
          autoHide: true,
        });
      }
    } catch (error) {
      console.error("Error cargando bovinos:", error);
      addNotification({
        type: "error",
        title: "Error al cargar datos",
        message: `No se pudieron cargar los bovinos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        autoHide: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar estadísticas desde el backend
  const loadStats = async () => {
    try {
      // Primero intentar el endpoint de estadísticas
      try {
        const statsResponse = await ApiService.getStats();
        if (statsResponse.success && statsResponse.data) {
          setTotalBovines(statsResponse.data.total);
          setHealthyBovines(statsResponse.data.healthy);
          setSickBovines(statsResponse.data.sick);
          setQuarantineBovines(statsResponse.data.quarantine);
          setTreatmentBovines(statsResponse.data.treatment || 0);
          setLastUpdated(new Date());
          return;
        }
      } catch (error) {
        console.log("Endpoint de estadísticas no disponible, calculando desde lista de bovinos");
      }

      // Si no hay endpoint de stats, calcular desde la lista de bovinos
      const bovinesResponse = await ApiService.getBovines();
      if (bovinesResponse.success && bovinesResponse.data) {
        const bovinesList = bovinesResponse.data.bovines || [];
        
        const stats = bovinesList.reduce((acc, bovine) => {
          acc.total++;
          switch (bovine.healthStatus) {
            case "HEALTHY":
              acc.healthy++;
              break;
            case "SICK":
              acc.sick++;
              break;
            case "QUARANTINE":
              acc.quarantine++;
              break;
            case "TREATMENT":
              acc.treatment++;
              break;
          }
          return acc;
        }, { total: 0, healthy: 0, sick: 0, quarantine: 0, treatment: 0 });

        setTotalBovines(stats.total);
        setHealthyBovines(stats.healthy);
        setSickBovines(stats.sick);
        setQuarantineBovines(stats.quarantine);
        setTreatmentBovines(stats.treatment);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Error cargando estadísticas:", error);
      // En caso de error, usar datos por defecto
      setTotalBovines(0);
      setHealthyBovines(0);
      setSickBovines(0);
      setQuarantineBovines(0);
      setTreatmentBovines(0);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      
      // Probar conexión primero
      const connected = await testConnection();
      
      if (connected) {
        // Cargar estadísticas y bovinos
        await Promise.all([
          loadStats(),
          loadBovines(),
        ]);

        addNotification({
          type: "info",
          title: "Sistema iniciado",
          message: "Datos del ganado bovino cargados desde el backend",
          autoHide: true,
        });
      } else {
        // Si no hay conexión, usar datos por defecto
        addNotification({
          type: "warning",
          title: "Modo offline",
          message: "Trabajando con datos locales. Verifique la conexión al backend.",
          autoHide: false,
        });
      }
    } catch (error) {
      console.error("Error cargando datos iniciales:", error);
      addNotification({
        type: "error",
        title: "Error al inicializar",
        message: "No se pudieron cargar los datos del sistema",
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
      
      // Probar conexión primero
      const connected = await testConnection();
      
      if (connected) {
        // Actualizar datos desde el backend
        await Promise.all([
          loadStats(),
          loadBovines(),
        ]);

        addNotification({
          type: "success",
          title: "Datos actualizados",
          message: "La información del ganado ha sido actualizada desde el backend",
          autoHide: true,
        });
      } else {
        addNotification({
          type: "error",
          title: "Error de conexión",
          message: "No se pudo conectar al backend para actualizar los datos",
          autoHide: false,
        });
      }
    } catch (error) {
      console.error("Error actualizando datos:", error);
      addNotification({
        type: "error",
        title: "Error al actualizar",
        message: `No se pudieron actualizar los datos: ${error instanceof Error ? error.message : 'Error desconocido'}`,
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
    treatmentBovines,
    lastUpdated,
    notifications,
    isConnected,
    connectionStatus,
    addNotification,
    removeNotification,
    refreshData,
    testConnection,
    isLoading,
    bovines,
    loadBovines,
  };

  return (
    <BovinesContext.Provider value={contextValue}>
      {children}
    </BovinesContext.Provider>
  );
};

// =============================================================================
// COMPONENTE PRINCIPAL DEL MÓDULO BOVINOS
// =============================================================================

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
                    Sistema integral para la administración del ganado - Backend Conectado
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
                    Sincronizando con backend...
                  </span>
                </div>
              </motion.div>
            )
          );
        })()}
      </AnimatePresence>

      {/* Indicador de conexión */}
      <ConnectionStatus />

      {/* Footer del módulo */}
      <div className="bg-gradient-to-r from-[#3d8b40]/80 to-[#2d6e30]/80 backdrop-blur-sm border-t border-white/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                <span>Backend integrado (Puerto 5000)</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                <span>API REST conectada</span>
              </div>
            </div>
            <div className="text-center">
              <p>&copy; 2025 Bovino UJAT</p>
              <p className="text-xs text-white/60">
                Versión 2.1.4 - Módulo Bovinos (Backend Connected)
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