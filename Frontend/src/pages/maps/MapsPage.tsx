import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  TreePine,
  Navigation,
  Home,
  AlertTriangle,
  Clock,
  RefreshCw,
  Wifi,
  WifiOff,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Server,
} from "lucide-react";

// Importar los componentes de mapas
import RanchMap from "./RanchMap";
import PastureMap from "./PastureMap";
import LivestockLocation from "./LivestockLocation";

// Configuración de la API
const API_BASE_URL = 'http://localhost:5000/api';

// Interfaces para el backend
interface DashboardStats {
  totalBovines: number;
  healthyBovines: number;
  sickBovines: number;
  upcomingVaccinations: number;
  todayEvents: number;
  weeklyGrowth: number;
  totalProduction?: number;
  activeAlerts?: number;
}

interface CattleStats {
  total: number;
  tracked: number;
  devicesOnline: number;
  activeAlerts: number;
  withLocation: number;
  lastUpdate?: string;
}



// Interfaces para la página principal de mapas
interface MapsPageProps {
  className?: string;
}

interface MapModule {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  color: string;
  stats?: {
    label: string;
    value: string | number;
    trend?: "up" | "down" | "stable";
    loading?: boolean;
  }[];
  alerts?: number;
  isActive?: boolean;
  lastUpdate?: Date;
}

// Clase para manejar las llamadas a la API del dashboard
class DashboardAPI {
  // ======================================================================
  // ESTADÍSTICAS GENERALES DEL DASHBOARD
  // ======================================================================
  
  static async getDashboardOverview(): Promise<DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/overview`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data || {};
      } else {
        throw new Error(data.message || 'Error al obtener estadísticas del dashboard');
      }
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }

  // ======================================================================
  // ESTADÍSTICAS DE BOVINOS Y TRACKING
  // ======================================================================
  
  static async getCattleStats(): Promise<CattleStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/cattle/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        // Adaptar la respuesta del backend a nuestra interfaz
        const stats = data.data || {};
        return {
          total: stats.totalBovines || 0,
          tracked: stats.trackedBovines || 0,
          devicesOnline: stats.devicesOnline || 0,
          activeAlerts: stats.activeAlerts || 0,
          withLocation: stats.withLocation || 0,
          lastUpdate: stats.lastUpdate || new Date().toISOString()
        };
      } else {
        throw new Error(data.message || 'Error al obtener estadísticas de bovinos');
      }
    } catch (error) {
      console.error('Error fetching cattle stats:', error);
      throw error;
    }
  }

  // ======================================================================
  // ESTADÍSTICAS DE PRODUCCIÓN
  // ======================================================================
  
  static async getProductionMetrics(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/production-metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data || {};
      } else {
        throw new Error(data.message || 'Error al obtener métricas de producción');
      }
    } catch (error) {
      console.error('Error fetching production metrics:', error);
      throw error;
    }
  }

  // ======================================================================
  // ESTADÍSTICAS DE SALUD
  // ======================================================================
  
  static async getHealthMetrics(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/health-metrics`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data || {};
      } else {
        throw new Error(data.message || 'Error al obtener métricas de salud');
      }
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      throw error;
    }
  }

  // ======================================================================
  // PRUEBA DE CONECTIVIDAD
  // ======================================================================
  
  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }
}

// Función utilitaria para concatenar clases CSS
const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Función para formatear números
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Función para obtener el icono de tendencia
const getTrendIcon = (trend: "up" | "down" | "stable") => {
  switch (trend) {
    case "up":
      return <TrendingUp className="w-3 h-3 text-green-600" />;
    case "down":
      return <TrendingDown className="w-3 h-3 text-red-600" />;
    default:
      return <Minus className="w-3 h-3 text-gray-600" />;
  }
};

// Componente de navegación de mapas
const MapsNavigation: React.FC<{
  modules: MapModule[];
  currentPath: string;
  onModuleSelect: (module: MapModule) => void;
  isLoading?: boolean;
}> = ({ modules, currentPath, onModuleSelect, isLoading }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {modules.map((module) => {
        const isSelected = currentPath.includes(
          module.path.split("/").pop() || ""
        );

        return (
          <motion.button
            key={module.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onModuleSelect(module)}
            disabled={isLoading}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
              isSelected
                ? "bg-[#519a7c] text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
            )}
          >
            <div
              className={cn("flex-shrink-0", isSelected ? "text-white" : "")}
              style={{ color: isSelected ? "white" : module.color }}
            >
              {module.icon}
            </div>
            <span className="font-medium">{module.name}</span>
            {module.alerts && module.alerts > 0 && (
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                  isSelected
                    ? "bg-white text-[#519a7c]"
                    : "bg-red-500 text-white"
                )}
              >
                {module.alerts}
              </div>
            )}
            {module.lastUpdate && (
              <div className="text-xs opacity-75">
                {module.lastUpdate.toLocaleTimeString()}
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// Componente principal de la página de mapas
export const MapsPage: React.FC<MapsPageProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedModule, setSelectedModule] = useState<MapModule | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Estados para las estadísticas del backend
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [cattleStats, setCattleStats] = useState<CattleStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Configuración inicial de módulos (se actualizará con datos del backend)
  const [mapModules, setMapModules] = useState<MapModule[]>([
    {
      id: "ranch-overview",
      name: "Vista General del Rancho",
      description: "Vista completa de la propiedad con instalaciones y zonas",
      path: "/maps/ranch",
      icon: <Home className="w-6 h-6" />,
      component: <RanchMap />,
      color: "#22c55e",
      stats: [
        { label: "Área Total", value: "Cargando...", loading: true },
        { label: "Instalaciones", value: "Cargando...", loading: true },
        { label: "Zonas", value: "Cargando...", loading: true },
      ],
      alerts: 0,
      isActive: true,
    },
    {
      id: "pasture-management",
      name: "Gestión de Pastura",
      description: "Mapa especializado para rotación y manejo de pastoreo",
      path: "/maps/pastures",
      icon: <TreePine className="w-6 h-6" />,
      component: <PastureMap />,
      color: "#84cc16",
      stats: [
        { label: "Potreros", value: "Cargando...", loading: true },
        { label: "En Rotación", value: "Cargando...", loading: true },
        { label: "Descansando", value: "Cargando...", loading: true },
      ],
      alerts: 0,
      isActive: true,
    },
    {
      id: "livestock-tracking",
      name: "Ubicación del Ganado",
      description: "Tracking GPS en tiempo real de cada animal individual",
      path: "/maps/livestock",
      icon: <Navigation className="w-6 h-6" />,
      component: <LivestockLocation />,
      color: "#3b82f6",
      stats: [
        { label: "Total Animales", value: "Cargando...", loading: true },
        { label: "Con GPS", value: "Cargando...", loading: true },
        { label: "Alertas", value: "Cargando...", loading: true },
      ],
      alerts: 0,
      isActive: true,
    },
  ]);

  // ======================================================================
  // FUNCIONES PARA CARGAR DATOS DEL BACKEND
  // ======================================================================

  // Función para verificar la conectividad con el backend
  const checkBackendConnection = useCallback(async () => {
    try {
      const isConnected = await DashboardAPI.testConnection();
      setIsConnected(isConnected);
      if (!isConnected) {
        setBackendError("No se puede conectar con el servidor en puerto 5000");
      } else {
        setBackendError(null);
      }
      return isConnected;
    } catch (error) {
      setIsConnected(false);
      setBackendError("Error de conexión con el backend");
      return false;
    }
  }, []);

  // Función para cargar estadísticas del dashboard
  const loadDashboardStats = useCallback(async () => {
    try {
      console.log("🔄 Cargando estadísticas del dashboard...");
      const stats = await DashboardAPI.getDashboardOverview();
      setDashboardStats(stats);
      console.log("✅ Estadísticas del dashboard cargadas:", stats);
      return stats;
    } catch (error) {
      console.error("❌ Error cargando estadísticas del dashboard:", error);
      throw error;
    }
  }, []);

  // Función para cargar estadísticas de bovinos
  const loadCattleStats = useCallback(async () => {
    try {
      console.log("🔄 Cargando estadísticas de bovinos...");
      const stats = await DashboardAPI.getCattleStats();
      setCattleStats(stats);
      console.log("✅ Estadísticas de bovinos cargadas:", stats);
      return stats;
    } catch (error) {
      console.error("❌ Error cargando estadísticas de bovinos:", error);
      throw error;
    }
  }, []);

  // Función para cargar todas las estadísticas
  const loadAllStats = useCallback(async () => {
    try {
      setIsLoadingStats(true);
      setBackendError(null);

      // Verificar conexión
      const connectionOk = await checkBackendConnection();
      if (!connectionOk) {
        return;
      }

      // Cargar estadísticas en paralelo
      const [dashStats, cattleStatsData] = await Promise.allSettled([
        loadDashboardStats(),
        loadCattleStats(),
      ]);

      // Actualizar módulos con las estadísticas reales
      setMapModules(prev => prev.map(module => {
        let updatedStats = module.stats;

        if (module.id === "ranch-overview" && dashStats.status === "fulfilled") {
          const stats = dashStats.value;
          updatedStats = [
            { label: "Total Bovinos", value: stats.totalBovines || 0 },
            { label: "Saludables", value: stats.healthyBovines || 0, trend: "up" },
            { label: "Eventos Hoy", value: stats.todayEvents || 0 },
          ];
        }

        if (module.id === "pasture-management" && dashStats.status === "fulfilled") {
          updatedStats = [
            { label: "Potreros", value: 8 }, // Valor por defecto hasta tener endpoint específico
            { label: "En Uso", value: 5, trend: "stable" },
            { label: "Descansando", value: 3, trend: "up" },
          ];
        }

        if (module.id === "livestock-tracking" && cattleStatsData.status === "fulfilled") {
          const stats = cattleStatsData.value;
          updatedStats = [
            { label: "Total Animales", value: stats.total || 0 },
            { label: "Con GPS", value: stats.withLocation || 0, trend: "up" },
            { label: "Alertas", value: stats.activeAlerts || 0, trend: stats.activeAlerts > 0 ? "down" : "stable" },
          ];
        }

        return {
          ...module,
          stats: updatedStats,
          alerts: module.id === "livestock-tracking" && cattleStatsData.status === "fulfilled" 
            ? cattleStatsData.value.activeAlerts 
            : module.alerts,
          lastUpdate: new Date()
        };
      }));

      setLastUpdate(new Date());

    } catch (error: any) {
      console.error("❌ Error cargando estadísticas:", error);
      setBackendError(error.message || "Error al cargar datos del servidor");
    } finally {
      setIsLoadingStats(false);
    }
  }, [checkBackendConnection, loadDashboardStats, loadCattleStats]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllStats();
  }, [loadAllStats]);

  // Auto-refresh cada 30 segundos si está habilitado
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (isConnected && !isLoadingStats) {
        loadAllStats();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [autoRefresh, isConnected, isLoadingStats, loadAllStats]);

  // Determinar el módulo activo basado en la ruta actual
  useEffect(() => {
    const currentModule = mapModules.find((module) =>
      location.pathname.includes(module.path.split("/").pop() || "")
    );
    setSelectedModule(currentModule || null);
  }, [location.pathname, mapModules]);

  // ======================================================================
  // HANDLERS DE EVENTOS
  // ======================================================================

  // Función para navegar a un módulo específico
  const handleModuleSelect = (module: MapModule) => {
    setIsLoading(true);
    setSelectedModule(module);
    navigate(module.path);

    // Simular tiempo de carga
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  // Función para refrescar datos manualmente
  const handleRefresh = () => {
    loadAllStats();
  };

  // Función para alternar auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefresh(prev => !prev);
  };

  return (
    <div
      className={cn(
        "min-h-screen",
        // Fondo degradado principal del layout
        "bg-gradient-to-br from-[#F5F5DC] via-[#E8E8C8] to-[#D3D3B8]",
        className
      )}
    >
      <div className="p-6">
        {/* Header de la página */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2d5a45] mb-2 flex items-center gap-3">
                Sistema de Mapas y Geolocalización
                {isConnected ? (
                  <Wifi className="w-6 h-6 text-green-600" />
                ) : (
                  <WifiOff className="w-6 h-6 text-red-600" />
                )}
              </h1>
              <p className="text-gray-600">
                Gestión integral de ubicaciones, potreros y seguimiento GPS del ganado
              </p>
            </div>

            {/* Controles del dashboard */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAutoRefresh}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  autoRefresh 
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                )}
              >
                <Activity className="w-4 h-4 mr-2 inline" />
                Auto-refresh {autoRefresh ? "ON" : "OFF"}
              </button>

              <button
                onClick={handleRefresh}
                disabled={isLoadingStats}
                className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#457e68] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <RefreshCw className={cn("w-4 h-4", isLoadingStats && "animate-spin")} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Estado de conexión y última actualización */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4 text-sm">
              {/* Indicador de conexión */}
              <div className={cn(
                "flex items-center gap-2 px-3 py-1 rounded-full",
                isConnected ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              )}>
                {isConnected ? (
                  <Server className="w-4 h-4" />
                ) : (
                  <AlertTriangle className="w-4 h-4" />
                )}
                <span className="font-medium">
                  {isConnected ? "Backend Conectado" : "Backend Desconectado"}
                </span>
                <span className="text-xs opacity-75">
                  Puerto 5000
                </span>
              </div>

              {/* Error de conexión */}
              {backendError && (
                <div className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs">
                  {backendError}
                </div>
              )}
            </div>

            {/* Última actualización */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>
                Última actualización: {lastUpdate.toLocaleTimeString()}
              </span>
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"
              )}></div>
            </div>
          </div>
        </motion.div>

        {/* Navegación de módulos */}
        <MapsNavigation
          modules={mapModules}
          currentPath={location.pathname}
          onModuleSelect={handleModuleSelect}
          isLoading={isLoading || isLoadingStats}
        />

        {/* Contenedor principal del mapa */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white rounded-xl shadow-lg overflow-hidden"
          style={{ minHeight: "600px" }}
        >
          {/* Overlay de carga */}
          <AnimatePresence>
            {(isLoading || isLoadingStats) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
              >
                <div className="flex items-center gap-3 text-[#519a7c]">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="text-lg font-medium">
                    {isLoadingStats ? "Cargando estadísticas..." : "Cargando mapa..."}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Banner de error de conexión */}
          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-0 left-0 right-0 bg-red-500 text-white p-3 text-center z-40"
            >
              <div className="flex items-center justify-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Sin conexión al backend - Los datos pueden estar desactualizados</span>
                <button
                  onClick={handleRefresh}
                  className="ml-3 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
                >
                  Reintentar
                </button>
              </div>
            </motion.div>
          )}

          {/* Rutas de los mapas */}
          <Routes>
            <Route path="/" element={<Navigate to="/maps/ranch" replace />} />
            <Route path="/ranch" element={<RanchMap />} />
            <Route path="/pastures" element={<PastureMap />} />
            <Route path="/livestock" element={<LivestockLocation />} />
          </Routes>

          {/* Información del módulo activo */}
          {selectedModule && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs z-40"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: selectedModule.color + "20" }}
                >
                  <div style={{ color: selectedModule.color }}>
                    {selectedModule.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2d5a45] text-sm">
                    {selectedModule.name}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {isConnected ? "Conectado" : "Sin conexión"}
                  </p>
                </div>
              </div>

              {selectedModule.stats && (
                <div className="space-y-2 mb-3">
                  {selectedModule.stats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-600">{stat.label}:</span>
                      <div className="flex items-center gap-1">
                        {stat.loading ? (
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-[#519a7c] rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <span className="font-medium text-[#2d5a45]">
                              {typeof stat.value === 'number' ? formatNumber(stat.value) : stat.value}
                            </span>
                            {stat.trend && getTrendIcon(stat.trend)}
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Información de sincronización */}
              <div className="border-t pt-2 text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span>Backend:</span>
                  <span className={isConnected ? "text-green-600" : "text-red-600"}>
                    {isConnected ? "Online" : "Offline"}
                  </span>
                </div>
                {selectedModule.lastUpdate && (
                  <div className="flex items-center justify-between mt-1">
                    <span>Actualizado:</span>
                    <span>{selectedModule.lastUpdate.toLocaleTimeString()}</span>
                  </div>
                )}
              </div>

              {selectedModule.alerts && selectedModule.alerts > 0 && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{selectedModule.alerts} alerta(s) activa(s)</span>
                  </div>
                </div>
              )}

              {/* Controles adicionales */}
              <div className="mt-3 pt-2 border-t">
                <button
                  onClick={handleRefresh}
                  disabled={isLoadingStats}
                  className="w-full text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <RefreshCw className={cn("w-3 h-3", isLoadingStats && "animate-spin")} />
                  Actualizar Datos
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Panel de estadísticas generales */}
        {dashboardStats && cattleStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Bovinos</p>
                  <p className="text-2xl font-bold text-[#2d5a45]">
                    {formatNumber(dashboardStats.totalBovines)}
                  </p>
                </div>
                <Home className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Con GPS</p>
                  <p className="text-2xl font-bold text-[#2d5a45]">
                    {formatNumber(cattleStats.withLocation)}
                  </p>
                </div>
                <Navigation className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Saludables</p>
                  <p className="text-2xl font-bold text-[#2d5a45]">
                    {formatNumber(dashboardStats.healthyBovines)}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Alertas Activas</p>
                  <p className="text-2xl font-bold text-[#2d5a45]">
                    {formatNumber(cattleStats.activeAlerts)}
                  </p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MapsPage;