import React, { useState, useEffect, createContext, useContext } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BarChart3,
  TrendingUp,
  Bell,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Info,
  X,
  RefreshCw,
  Wifi,
  WifiOff,
  Heart,
  Syringe,
  Plus,
  Eye,
} from "lucide-react";

// Componente de fallback para módulos no disponibles
const ModuleFallback: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center p-6">
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center max-w-md border border-white/20">
      <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Módulo no disponible</h2>
      <p className="text-gray-600 mb-4">Este módulo está en desarrollo</p>
      <div className="inline-flex px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
        Próximamente
      </div>
    </div>
  </div>
);

// Función helper para crear imports lazy seguros
const createLazyComponent = (importFn: () => Promise<{ default: React.ComponentType<any> }>) => {
  return React.lazy(() => 
    importFn().catch(() => Promise.resolve({ default: ModuleFallback }))
  );
};

// Importar componentes de eventos - usando helper para evitar errores de tipo
const EventVaccination = createLazyComponent(() => import("./EventVaccination"));
const EventPurchase = createLazyComponent(() => import("./EventPurchase"));
const EventSales = createLazyComponent(() => import("./EventSales"));
const EventTransport = createLazyComponent(() => import("./EventTransport"));
const EventBreeding = createLazyComponent(() => import("./EventBreeding"));
const EventHealth = createLazyComponent(() => import("./EventHealth"));
const EventFeeding = createLazyComponent(() => import("./EventFeeding"));

// ============================================================================
// API SERVICE - Comunicación con el backend
// ============================================================================

const API_BASE_URL = "http://localhost:5000/api";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  error?: string;
}

interface EventData {
  id: string;
  type: string;
  title: string;
  description: string;
  date: string;
  status: string;
  cattleIds?: string[];
  createdAt: string;
  updatedAt: string;
}

interface VaccinationData {
  id: string;
  cattleIds: string[];
  vaccineType: string;
  vaccineName: string;
  administrationDate: string;
  veterinarianId: string;
  status: string;
  batchNumber?: string;
  nextDueDate?: string;
}

interface EventStats {
  totalEvents: number;
  recentEvents: number;
  pendingVaccinations: number;
  overdueVaccinations: number;
  healthAlerts: number;
  upcomingEvents: number;
  eventsByType: Record<string, number>;
  lastUpdated: string;
}

class EventsApiService {
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
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
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

  // Obtener eventos generales
  static async getEvents(params?: {
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<ApiResponse<{ events: EventData[] }>> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append("type", params.type);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    return this.makeRequest(`/events${queryString ? `?${queryString}` : ""}`);
  }

  // Crear evento de vacunación
  static async createVaccinationEvent(data: Partial<VaccinationData>): Promise<ApiResponse> {
    return this.makeRequest("/events/vaccination", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Obtener vacunaciones
  static async getVaccinations(params?: {
    cattleId?: string;
    status?: string;
    dueDate?: string;
    includeScheduled?: boolean;
  }): Promise<ApiResponse<{ vaccinations: VaccinationData[] }>> {
    const searchParams = new URLSearchParams();
    if (params?.cattleId) searchParams.append("cattleId", params.cattleId);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.dueDate) searchParams.append("dueDate", params.dueDate);
    if (params?.includeScheduled) searchParams.append("includeScheduled", params.includeScheduled.toString());

    const queryString = searchParams.toString();
    return this.makeRequest(`/health/vaccinations${queryString ? `?${queryString}` : ""}`);
  }

  // Obtener estadísticas de eventos
  static async getEventStats(): Promise<ApiResponse<EventStats>> {
    return this.makeRequest("/events/statistics");
  }

  // Obtener vacunaciones vencidas
  static async getOverdueVaccinations(params?: {
    daysPastDue?: number;
    includeLowPriority?: boolean;
  }): Promise<ApiResponse<{ overdueVaccinations: VaccinationData[] }>> {
    const searchParams = new URLSearchParams();
    if (params?.daysPastDue) searchParams.append("daysPastDue", params.daysPastDue.toString());
    if (params?.includeLowPriority) searchParams.append("includeLowPriority", params.includeLowPriority.toString());

    const queryString = searchParams.toString();
    return this.makeRequest(`/calendar/vaccination-schedule/overdue${queryString ? `?${queryString}` : ""}`);
  }

  // Crear evento genérico
  static async createEvent(eventData: Partial<EventData>): Promise<ApiResponse> {
    return this.makeRequest("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  }

  // Actualizar evento
  static async updateEvent(id: string, updates: Partial<EventData>): Promise<ApiResponse> {
    return this.makeRequest(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Eliminar evento
  static async deleteEvent(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/events/${id}`, {
      method: "DELETE",
    });
  }
}

// ============================================================================
// CONTEXT Y TYPES
// ============================================================================

interface EventsContextType {
  stats: EventStats;
  recentEvents: EventData[];
  isConnected: boolean;
  connectionStatus: "connected" | "disconnected" | "connecting";
  connection: ConnectionState;
  isLoading: boolean;
  notifications: NotificationState[];
  addNotification: (notification: Omit<NotificationState, "id" | "timestamp">) => void;
  removeNotification: (id: string) => void;
  refreshData: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  loadEvents: () => Promise<void>;
  createEvent: (eventData: Partial<EventData>) => Promise<void>;
}

interface NotificationState {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
}

interface ConnectionState {
  isConnected: boolean;
  connectionStatus: "connected" | "disconnected" | "connecting";
  lastChecked: Date;
}

const EventsContext = createContext<EventsContextType | undefined>(undefined);

export const useEventsContext = () => {
  const context = useContext(EventsContext);
  if (!context) {
    throw new Error("useEventsContext debe ser usado dentro de EventsProvider");
  }
  return context;
};

// ============================================================================
// COMPONENTES DE NOTIFICACIÓN
// ============================================================================

const NotificationToast: React.FC<{
  notification: NotificationState;
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
      className={`p-4 rounded-lg border shadow-lg ${getBgColor()} max-w-sm mb-2`}
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

// Indicador de conexión
const ConnectionIndicator: React.FC<{
  connection: ConnectionState;
  onTestConnection: () => void;
}> = ({ connection, onTestConnection }) => {
  return (
    <div className="fixed bottom-4 left-4 z-30">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20 flex items-center gap-2"
      >
        {connection.connectionStatus === "connecting" ? (
          <RefreshCw className="w-3 h-3 text-yellow-500 animate-spin" />
        ) : connection.isConnected ? (
          <Wifi className="w-3 h-3 text-green-500" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-500" />
        )}
        
        <span className="text-xs font-medium text-gray-700">
          {connection.connectionStatus === "connecting" 
            ? "Conectando..." 
            : connection.isConnected 
              ? "Backend conectado" 
              : "Sin conexión"
          }
        </span>
        
        <button
          onClick={onTestConnection}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
          disabled={connection.connectionStatus === "connecting"}
        >
          Test
        </button>
      </motion.div>
    </div>
  );
};

// ============================================================================
// DASHBOARD DE EVENTOS
// ============================================================================

const EventsDashboard: React.FC = () => {
  const { stats, recentEvents, refreshData, isLoading } = useEventsContext();

  const statCards = [
    {
      title: "Total Eventos",
      value: stats.totalEvents,
      icon: Activity,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Eventos Recientes",
      value: stats.recentEvents,
      icon: Calendar,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Vacunaciones Pendientes",
      value: stats.pendingVaccinations,
      icon: Syringe,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Alertas de Salud",
      value: stats.healthAlerts,
      icon: AlertTriangle,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  return (
    <div className="p-6">
      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`${stat.bgColor} backdrop-blur-sm rounded-xl p-6 border border-white/20`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} rounded-lg p-3`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <div className="bg-blue-100 rounded-lg p-2">
                <Plus className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Nuevo Evento</p>
                <p className="text-sm text-gray-500">Crear evento personalizado</p>
              </div>
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <div className="bg-green-100 rounded-lg p-2">
                <Syringe className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Programar Vacunación</p>
                <p className="text-sm text-gray-500">Agendar nueva vacunación</p>
              </div>
            </button>
            
            <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors">
              <div className="bg-red-100 rounded-lg p-2">
                <Heart className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Registro de Salud</p>
                <p className="text-sm text-gray-500">Reportar problema de salud</p>
              </div>
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Eventos Recientes</h3>
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          <div className="space-y-3">
            {recentEvents.slice(0, 3).map((event) => (
              <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString('es-MX')}
                  </p>
                </div>
                <button className="p-1 text-gray-400 hover:text-gray-600">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            {recentEvents.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No hay eventos recientes
              </p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl p-6 border border-white/20"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado del Sistema</h3>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Backend</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Conectado</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Base de Datos</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-600">Activa</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Última Actualización</span>
              <span className="text-sm text-gray-500">
                {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleTimeString('es-MX') : 'N/A'}
              </span>
            </div>
            
            <div className="pt-3 border-t border-gray-200">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="text-sm font-medium">
                  {isLoading ? 'Actualizando...' : 'Actualizar Datos'}
                </span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ============================================================================
// PROVIDER DEL CONTEXTO
// ============================================================================

const EventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    recentEvents: 0,
    pendingVaccinations: 0,
    overdueVaccinations: 0,
    healthAlerts: 0,
    upcomingEvents: 0,
    eventsByType: {},
    lastUpdated: new Date().toISOString(),
  });

  const [recentEvents, setRecentEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  
  const [connection, setConnection] = useState<ConnectionState>({
    isConnected: false,
    connectionStatus: "disconnected",
    lastChecked: new Date()
  });

  const addNotification = (notification: Omit<NotificationState, "id" | "timestamp">) => {
    const newNotification: NotificationState = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      setConnection(prev => ({ ...prev, connectionStatus: "connecting" }));
      
      const response = await EventsApiService.ping();
      
      if (response.success) {
        setConnection({
          isConnected: true,
          connectionStatus: "connected",
          lastChecked: new Date()
        });
        
        addNotification({
          type: "success",
          title: "Conexión establecida",
          message: "Backend de eventos conectado correctamente",
          autoHide: true,
        });
        
        return true;
      } else {
        throw new Error("Ping fallido");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      
      setConnection({
        isConnected: false,
        connectionStatus: "disconnected",
        lastChecked: new Date()
      });
      
      addNotification({
        type: "error",
        title: "Error de conexión",
        message: `No se pudo conectar al backend: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        autoHide: false,
      });
      
      return false;
    }
  };

  const loadEvents = async () => {
    if (!connection.isConnected) {
      loadFallbackData();
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await EventsApiService.getEvents({ limit: 10 });
      
      if (response.success && response.data) {
        setRecentEvents(response.data.events || []);
        
        addNotification({
          type: "success",
          title: "Eventos cargados",
          message: `Se cargaron ${response.data.events?.length || 0} eventos recientes`,
          autoHide: true,
        });
      }
    } catch (error) {
      console.error("Error cargando eventos:", error);
      
      addNotification({
        type: "warning",
        title: "Error al cargar eventos",
        message: "Usando datos locales. Verifique la conexión al backend.",
        autoHide: false,
      });
      
      loadFallbackData();
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    if (!connection.isConnected) {
      return;
    }

    try {
      // Intentar cargar estadísticas desde endpoints múltiples
      const [eventsResponse, vaccinationsResponse] = await Promise.allSettled([
        EventsApiService.getEvents(),
        EventsApiService.getVaccinations()
      ]);

      let totalEvents = 0;
      let pendingVaccinations = 0;

      if (eventsResponse.status === 'fulfilled' && eventsResponse.value.success) {
        totalEvents = eventsResponse.value.data?.events?.length || 0;
      }

      if (vaccinationsResponse.status === 'fulfilled' && vaccinationsResponse.value.success) {
        const vaccinations = vaccinationsResponse.value.data?.vaccinations || [];
        pendingVaccinations = vaccinations.filter(v => v.status === 'pending').length;
      }

      // Obtener vacunaciones vencidas
      try {
        const overdueResponse = await EventsApiService.getOverdueVaccinations();
        const overdueCount = overdueResponse.success ? 
          overdueResponse.data?.overdueVaccinations?.length || 0 : 0;

        setStats(prev => ({
          ...prev,
          totalEvents,
          recentEvents: Math.min(totalEvents, 5),
          pendingVaccinations,
          overdueVaccinations: overdueCount,
          healthAlerts: overdueCount, // Usar vencidas como alertas por ahora
          upcomingEvents: pendingVaccinations,
          lastUpdated: new Date().toISOString(),
        }));
      } catch (error) {
        // Si falla, usar datos básicos
        setStats(prev => ({
          ...prev,
          totalEvents,
          recentEvents: Math.min(totalEvents, 5),
          pendingVaccinations,
          overdueVaccinations: 0,
          healthAlerts: 0,
          upcomingEvents: pendingVaccinations,
          lastUpdated: new Date().toISOString(),
        }));
      }

    } catch (error) {
      console.error("Error cargando estadísticas:", error);
    }
  };

  const loadFallbackData = () => {
    // Datos de fallback cuando no hay conexión
    setStats({
      totalEvents: 25,
      recentEvents: 5,
      pendingVaccinations: 8,
      overdueVaccinations: 2,
      healthAlerts: 3,
      upcomingEvents: 12,
      eventsByType: {
        vaccination: 8,
        health: 5,
        breeding: 3,
        purchase: 4,
        feeding: 5
      },
      lastUpdated: new Date().toISOString(),
    });

    setRecentEvents([
      {
        id: '1',
        type: 'vaccination',
        title: 'Vacunación Triple Bovina',
        description: 'Aplicación de vacuna a 15 bovinos',
        date: new Date(Date.now() - 86400000).toISOString(), // Ayer
        status: 'completed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'health',
        title: 'Revisión Veterinaria',
        description: 'Chequeo general de salud',
        date: new Date(Date.now() - 172800000).toISOString(), // Hace 2 días
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);
  };

  const refreshData = async () => {
    setIsLoading(true);
    
    const connected = await testConnection();
    
    if (connected) {
      await Promise.all([
        loadEvents(),
        loadStats(),
      ]);
      
      addNotification({
        type: "success",
        title: "Datos actualizados",
        message: "La información de eventos ha sido actualizada",
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
    
    setIsLoading(false);
  };

  const createEvent = async (eventData: Partial<EventData>) => {
    if (!connection.isConnected) {
      addNotification({
        type: "warning",
        title: "Sin conexión",
        message: "No se puede crear el evento sin conexión al backend",
        autoHide: false,
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const response = await EventsApiService.createEvent(eventData);
      
      if (response.success) {
        await loadEvents(); // Recargar eventos
        
        addNotification({
          type: "success",
          title: "Evento creado",
          message: "El evento se ha creado correctamente",
          autoHide: true,
        });
      } else {
        throw new Error(response.message || 'Error al crear evento');
      }
    } catch (error) {
      console.error("Error creando evento:", error);
      
      addNotification({
        type: "error",
        title: "Error al crear evento",
        message: `No se pudo crear el evento: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        autoHide: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      
      const connected = await testConnection();
      
      if (connected) {
        await Promise.all([
          loadEvents(),
          loadStats(),
        ]);
        
        addNotification({
          type: "info",
          title: "Sistema de eventos iniciado",
          message: "Datos cargados desde el backend correctamente",
          autoHide: true,
        });
      } else {
        loadFallbackData();
        
        addNotification({
          type: "warning",
          title: "Modo offline",
          message: "Trabajando con datos locales. Verifique la conexión al backend.",
          autoHide: false,
        });
      }
      
      setIsLoading(false);
    };

    initializeApp();
  }, []);

  const contextValue: EventsContextType = {
    stats,
    recentEvents,
    isConnected: connection.isConnected,
    connectionStatus: connection.connectionStatus,
    connection,
    isLoading,
    notifications,
    addNotification,
    removeNotification,
    refreshData,
    testConnection,
    loadEvents,
    createEvent,
  };

  return (
    <EventsContext.Provider value={contextValue}>
      {children}
    </EventsContext.Provider>
  );
};

// ============================================================================
// COMPONENTE PARA PÁGINAS PRÓXIMAMENTE
// ============================================================================

const ComingSoonPage: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, description, icon }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center max-w-md border border-white/20"
    >
      <div className="mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="inline-flex px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
        Próximamente
      </div>
    </motion.div>
  </div>
);

// Wrapper para páginas internas
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a]">
    <div className="relative z-10">{children}</div>
  </div>
);

// ============================================================================
// COMPONENTE PRINCIPAL EventsPage
// ============================================================================

const EventsPage: React.FC = () => {

  // Animaciones de transición
  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  };

  return (
    <EventsProvider>
      <EventsPageContent pageTransition={pageTransition} />
    </EventsProvider>
  );
};

const EventsPageContent: React.FC<{ pageTransition: any }> = ({ pageTransition }) => {
  const location = useLocation();
  const { notifications, removeNotification, isConnected, connectionStatus, testConnection } = useEventsContext();

  const connection = {
    isConnected,
    connectionStatus,
    lastChecked: new Date()
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Header principal del módulo */}
      <div className="bg-[#4a9d4f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 pb-2"
          >
            <div className="flex items-center space-x-2 text-sm text-white/80">
              <span>🏠 Inicio</span>
              <span>›</span>
              <span>📊 Eventos</span>
              <span>›</span>
              <span className="text-white font-medium">Gestión de Eventos</span>
            </div>
          </motion.div>

          {/* Título */}
          <div className="py-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Módulo de Gestión de Eventos
                </h1>
                <p className="text-white/90">
                  Sistema integral para la administración de eventos del ganado - Backend Conectado
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contenido principal con animaciones */}
      <div className="relative bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <Routes>
              {/* Ruta principal - Dashboard */}
              <Route path="" element={<EventsDashboard />} />
              
              {/* Rutas específicas por tipo de evento */}
              <Route
                path="vaccination"
                element={
                  <PageWrapper>
                    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>}>
                      <EventVaccination />
                    </React.Suspense>
                  </PageWrapper>
                }
              />
              <Route
                path="purchase"
                element={
                  <PageWrapper>
                    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>}>
                      <EventPurchase />
                    </React.Suspense>
                  </PageWrapper>
                }
              />
              <Route
                path="sales"
                element={
                  <PageWrapper>
                    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>}>
                      <EventSales />
                    </React.Suspense>
                  </PageWrapper>
                }
              />
              <Route
                path="transport"
                element={
                  <PageWrapper>
                    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>}>
                      <EventTransport />
                    </React.Suspense>
                  </PageWrapper>
                }
              />
              <Route
                path="breeding"
                element={
                  <PageWrapper>
                    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>}>
                      <EventBreeding />
                    </React.Suspense>
                  </PageWrapper>
                }
              />
              <Route
                path="health"
                element={
                  <PageWrapper>
                    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>}>
                      <EventHealth />
                    </React.Suspense>
                  </PageWrapper>
                }
              />
              <Route
                path="feeding"
                element={
                  <PageWrapper>
                    <React.Suspense fallback={<div className="flex items-center justify-center min-h-screen"><RefreshCw className="w-8 h-8 animate-spin text-blue-600" /></div>}>
                      <EventFeeding />
                    </React.Suspense>
                  </PageWrapper>
                }
              />

              {/* Rutas adicionales del módulo */}
              <Route
                path="reports"
                element={
                  <ComingSoonPage
                    title="Reportes de Eventos"
                    description="Análisis y estadísticas de actividades del ganado"
                    icon={
                      <BarChart3 className="w-12 h-12 text-blue-600 mx-auto" />
                    }
                  />
                }
              />
              <Route
                path="analytics"
                element={
                  <ComingSoonPage
                    title="Análisis Predictivo"
                    description="Tendencias y predicciones basadas en eventos históricos"
                    icon={
                      <TrendingUp className="w-12 h-12 text-purple-600 mx-auto" />
                    }
                  />
                }
              />
              <Route
                path="notifications"
                element={
                  <ComingSoonPage
                    title="Notificaciones y Alertas"
                    description="Configuración de recordatorios y alertas automáticas"
                    icon={
                      <Bell className="w-12 h-12 text-yellow-600 mx-auto" />
                    }
                  />
                }
              />
              <Route
                path="templates"
                element={
                  <ComingSoonPage
                    title="Plantillas de Eventos"
                    description="Plantillas predefinidas para eventos recurrentes"
                    icon={
                      <FileText className="w-12 h-12 text-gray-600 mx-auto" />
                    }
                  />
                }
              />
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

      {/* Indicador de conexión */}
      <ConnectionIndicator 
        connection={connection} 
        onTestConnection={testConnection}
      />
    </div>
  );
};

export default EventsPage;