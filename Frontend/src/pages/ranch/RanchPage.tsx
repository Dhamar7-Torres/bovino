// ============================================================================
// RANCHPAGE.TSX - PÁGINA PRINCIPAL DEL MÓDULO RANCH CON CONEXIÓN A BACKEND
// ============================================================================
// Componente principal que maneja el routing interno del módulo ranch,
// incluyendo navegación entre vista general, información de propiedad y personal
// ACTUALIZADO: Conectado con backend en puerto 5000

import React, { useState, useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  Building,
  FileText,
  Users,
  Home,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Settings,
  MapPin,
  Bell,
  Download,
  Plus,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  WifiOff,
  RefreshCw,
} from "lucide-react";

// Importar componentes hijos
import PropertyInfo from "./PropertyInfo";
import Staff from "./Staff";

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface RanchSection {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
  description: string;
  color: string;
  badge?: number;
  isActive?: boolean;
}

interface RanchStats {
  totalArea: number;
  totalAnimals: number;
  activeStaff: number;
  facilities: number;
  lastUpdate: string;
  alerts: number;
  documentsExpiring: number;
  staffOnLeave: number;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface BovineData {
  id: string;
  earTag: string;
  name: string;
  breed: string;
  birthDate: string;
  weight: number;
  status: string;
}

interface ConnectionStatus {
  isConnected: boolean;
  lastPing: string | null;
  error: string | null;
}



interface AlertData {
  id: string;
  type: "warning" | "info" | "error";
  message: string;
  time: string;
  icon: React.ElementType;
  color: string;
}

// ============================================================================
// CONFIGURACIÓN DE API
// ============================================================================

const API_BASE_URL = 'http://localhost:5000/api';

// Token de autenticación (en producción debería estar en un context o store)
const getAuthToken = () => {
  return localStorage.getItem('authToken') || '';
};

// Configuración de headers para las peticiones
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getAuthToken()}`
});

// ============================================================================
// FUNCIONES DE API
// ============================================================================

class ApiService {
  static async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/ping`, {
        method: 'GET',
        headers: getHeaders()
      });
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('❌ Error en ping al servidor:', error);
      return false;
    }
  }

  static async getRanchInfo(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/ranch/info`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error obteniendo información del rancho:', error);
      return {
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  static async getBovines(): Promise<ApiResponse<BovineData[]>> {
    try {
      const response = await fetch(`${API_BASE_URL}/bovines`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error obteniendo bovinos:', error);
      return {
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  static async getSystemHealth(): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Error obteniendo estado del sistema:', error);
      return {
        success: false,
        message: 'Error de conexión',
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  static async testConnection(): Promise<ConnectionStatus> {
    try {
      const isOnline = await this.ping();
      const timestamp = new Date().toISOString();
      
      if (isOnline) {
        return {
          isConnected: true,
          lastPing: timestamp,
          error: null
        };
      } else {
        return {
          isConnected: false,
          lastPing: null,
          error: 'Servidor no responde'
        };
      }
    } catch (error) {
      return {
        isConnected: false,
        lastPing: null,
        error: error instanceof Error ? error.message : 'Error de conexión'
      };
    }
  }
}

// ============================================================================
// DATOS DE CONFIGURACIÓN
// ============================================================================

const ranchSections: RanchSection[] = [
  {
    id: "overview",
    name: "Vista General",
    path: "#overview",
    icon: Home,
    description: "Información general del rancho, estadísticas y clima",
    color: "bg-[#519a7c]",
    badge: 0
  },
  {
    id: "property",
    name: "Información de Propiedad", 
    path: "#property",
    icon: FileText,
    description: "Datos de la propiedad, documentos legales y fotografías",
    color: "bg-blue-500",
    badge: 2 // Documentos por vencer
  },
  {
    id: "staff",
    name: "Personal",
    path: "#staff", 
    icon: Users,
    description: "Gestión completa del personal del rancho",
    color: "bg-purple-500",
    badge: 0
  }
];

// Datos por defecto (fallback cuando no hay conexión)
const defaultRanchStats: RanchStats = {
  totalArea: 0,
  totalAnimals: 0,
  activeStaff: 0,
  facilities: 0,
  lastUpdate: new Date().toISOString(),
  alerts: 0,
  documentsExpiring: 0,
  staffOnLeave: 0
};

// ============================================================================
// VARIANTES DE ANIMACIÓN
// ============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  }
};

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const ConnectionIndicator: React.FC<{ 
  connectionStatus: ConnectionStatus, 
  onRetry: () => void 
}> = ({ connectionStatus, onRetry }) => {
  return (
    <div className="flex items-center space-x-2">
      <div className={`w-3 h-3 rounded-full ${
        connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'
      }`} />
      <span className={`text-sm ${
        connectionStatus.isConnected ? 'text-green-700' : 'text-red-700'
      }`}>
        {connectionStatus.isConnected ? 'Conectado' : 'Desconectado'}
      </span>
      {!connectionStatus.isConnected && (
        <button
          onClick={onRetry}
          className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          title="Reintentar conexión"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

const RanchSectionCard: React.FC<{
  section: RanchSection;
  isActive: boolean;
  onClick: () => void;
}> = ({ section, isActive, onClick }) => {
  const Icon = section.icon;

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl p-6 shadow-lg border transition-all duration-300 ${
        isActive 
          ? "bg-white border-[#519a7c] shadow-xl scale-105" 
          : "bg-white/90 backdrop-blur-sm border-white/20 hover:shadow-xl"
      }`}
    >
      {/* Badge de notificaciones */}
      {section.badge && section.badge > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {section.badge}
        </div>
      )}

      {/* Header de la tarjeta */}
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center mr-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#2d5a45]">{section.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
        </div>
      </div>

      {/* Indicador de estado activo */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute bottom-0 left-0 right-0 h-1 bg-[#519a7c] rounded-b-xl"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}

      {/* Botón de acción */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">
          {isActive ? "Sección actual" : "Ir a sección"}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </motion.div>
  );
};

const RanchStatsOverview: React.FC<{ 
  stats: RanchStats, 
  isLoading: boolean,
  connectionStatus: ConnectionStatus 
}> = ({ stats, isLoading, connectionStatus }) => {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
    >
      <h3 className="text-lg font-semibold text-[#2d5a45] mb-4 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2" />
        Estadísticas del Rancho
        {!connectionStatus.isConnected && (
          <span title="Sin conexión - Datos locales">
            <WifiOff className="w-4 h-4 ml-2 text-red-500" />
          </span>
        )}
      </h3>

      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="text-center animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2"></div>
              <div className="h-6 bg-gray-200 rounded mb-1"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <MapPin className="w-6 h-6 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-[#2d5a45]">{stats.totalArea}</p>
            <p className="text-sm text-gray-600">Hectáreas</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-[#2d5a45]">{stats.totalAnimals}</p>
            <p className="text-sm text-gray-600">Animales</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-[#2d5a45]">{stats.activeStaff}</p>
            <p className="text-sm text-gray-600">Personal</p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Building className="w-6 h-6 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-[#2d5a45]">{stats.facilities}</p>
            <p className="text-sm text-gray-600">Instalaciones</p>
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            Última actualización: {new Date(stats.lastUpdate).toLocaleString('es-MX')}
          </div>
          
          {stats.alerts > 0 && (
            <div className="flex items-center text-red-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {stats.alerts} alertas activas
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const RanchQuickActions: React.FC<{ connectionStatus: ConnectionStatus }> = ({ connectionStatus }) => {
  const quickActions = [
    {
      name: "Agregar Personal",
      icon: Plus,
      color: "bg-green-500",
      action: () => console.log("Agregar personal"),
      requiresConnection: false
    },
    {
      name: "Subir Documento",
      icon: FileText,
      color: "bg-blue-500", 
      action: () => console.log("Subir documento"),
      requiresConnection: true
    },
    {
      name: "Ver Alertas",
      icon: Bell,
      color: "bg-red-500",
      action: () => console.log("Ver alertas"),
      requiresConnection: true
    },
    {
      name: "Generar Reporte",
      icon: Download,
      color: "bg-purple-500",
      action: () => console.log("Generar reporte"),
      requiresConnection: true
    }
  ];

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
    >
      <h3 className="text-lg font-semibold text-[#2d5a45] mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2" />
        Acciones Rápidas
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          const isDisabled = action.requiresConnection && !connectionStatus.isConnected;
          
          return (
            <motion.button
              key={index}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.95 } : {}}
              onClick={!isDisabled ? action.action : undefined}
              disabled={isDisabled}
              className={`flex items-center p-3 rounded-lg transition-colors text-left ${
                isDisabled 
                  ? 'bg-gray-200 cursor-not-allowed opacity-50' 
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mr-3 ${
                isDisabled ? 'opacity-50' : ''
              }`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className={`text-sm font-medium text-[#2d5a45] ${
                isDisabled ? 'opacity-50' : ''
              }`}>
                {action.name}
              </span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

const RanchAlerts: React.FC<{ 
  alerts: AlertData[], 
  stats: RanchStats,
  isLoading: boolean 
}> = ({ alerts, stats, isLoading }) => {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
    >
      <h3 className="text-lg font-semibold text-[#2d5a45] mb-4 flex items-center">
        <Bell className="w-5 h-5 mr-2" />
        Alertas Recientes
        {stats.alerts > 0 && (
          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
            {stats.alerts}
          </span>
        )}
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg animate-pulse">
              <div className="w-5 h-5 bg-gray-300 rounded mr-3 mt-0.5"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 rounded mb-1"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert, index) => {
            const Icon = alert.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start p-3 bg-gray-50 rounded-lg"
              >
                <Icon className={`w-5 h-5 ${alert.color} mr-3 mt-0.5`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#2d5a45]">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </motion.div>
            );
          })}

          {alerts.length === 0 && (
            <div className="text-center py-4">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600">No hay alertas pendientes</p>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full mt-3 py-2 text-[#519a7c] border border-[#519a7c] rounded-lg hover:bg-[#519a7c] hover:text-white transition-colors text-sm"
          >
            Ver todas las alertas
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const RanchPage: React.FC = () => {
  const location = useLocation();

  // Estados para manejo de navegación y UI
  const [currentSection, setCurrentSection] = useState<string>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showSectionSelector, setShowSectionSelector] = useState(true);

  // Estados para datos del backend
  const [ranchStats, setRanchStats] = useState<RanchStats>(defaultRanchStats);
  const [bovines, setBovines] = useState<BovineData[]>([]);
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastPing: null,
    error: null
  });
  const [lastSync, setLastSync] = useState<string>('');

  // ============================================================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================================================

  const checkConnection = async () => {
    console.log('🔍 Verificando conexión con el backend...');
    const status = await ApiService.testConnection();
    setConnectionStatus(status);
    
    if (status.isConnected) {
      console.log('✅ Conexión establecida con el backend');
    } else {
      console.log('❌ No se pudo conectar con el backend:', status.error);
    }
    
    return status.isConnected;
  };

  const loadRanchData = async () => {
    console.log('📊 Cargando datos del rancho...');
    setIsLoading(true);

    try {
      // Verificar conexión primero
      const isConnected = await checkConnection();
      
      if (!isConnected) {
        console.log('📱 Usando datos locales (sin conexión)');
        setIsLoading(false);
        return;
      }

      // Cargar bovinos
      const bovinesResponse = await ApiService.getBovines();
      if (bovinesResponse.success && bovinesResponse.data) {
        setBovines(bovinesResponse.data);
        
        // Actualizar estadísticas basadas en los datos reales
        setRanchStats(prev => ({
          ...prev,
          totalAnimals: bovinesResponse.data?.length || 0,
          lastUpdate: new Date().toISOString()
        }));
        
        console.log(`📈 Cargados ${bovinesResponse.data.length} bovinos`);
      }

      // Cargar información del rancho (si está disponible)
      const ranchResponse = await ApiService.getRanchInfo();
      if (ranchResponse.success && ranchResponse.data) {
        console.log('🏠 Información del rancho cargada');
        // Actualizar datos del rancho si están disponibles
      }

      // Simular alertas basadas en datos reales
      const mockAlerts: AlertData[] = [
        {
          id: '1',
          type: 'warning',
          message: `${bovines.length} bovinos registrados en el sistema`,
          time: 'Hace 1 minuto',
          icon: Activity,
          color: 'text-blue-600'
        },
        {
          id: '2',
          type: 'info',
          message: 'Sistema conectado correctamente',
          time: 'Ahora',
          icon: CheckCircle,
          color: 'text-green-600'
        }
      ];
      setAlerts(mockAlerts);

      setLastSync(new Date().toISOString());
      console.log('✅ Datos cargados correctamente');

    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      setConnectionStatus(prev => ({
        ...prev,
        error: 'Error cargando datos del servidor'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const retryConnection = async () => {
    console.log('🔄 Reintentando conexión...');
    await loadRanchData();
  };

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Leer parámetros de URL al cargar el componente
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sectionParam = searchParams.get('section');
    
    console.log('🔍 URL params:', { sectionParam, search: location.search });
    
    if (sectionParam && ranchSections.some(s => s.id === sectionParam)) {
      console.log('📍 Navegando a sección:', sectionParam);
      setCurrentSection(sectionParam);
      setShowSectionSelector(false);
    } else {
      console.log('🏠 Mostrando selector de secciones');
      setCurrentSection("overview");
      setShowSectionSelector(true);
    }
  }, [location.search]);

  // Cargar datos al montar el componente
  useEffect(() => {
    console.log('🚀 Componente RanchPage cargado, conectando con backend...');
    loadRanchData();

    // Configurar actualizaciones periódicas cada 5 minutos
    const interval = setInterval(() => {
      console.log('⏰ Actualización automática de datos...');
      loadRanchData();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  // ============================================================================
  // FUNCIONES DE NAVEGACIÓN
  // ============================================================================

  const handleSectionChange = (sectionId: string) => {
    const section = ranchSections.find(s => s.id === sectionId);
    if (!section) return;

    console.log('🚀 Cambiando a sección:', sectionId);

    setIsLoading(true);
    setDirection(ranchSections.findIndex(s => s.id === sectionId) > ranchSections.findIndex(s => s.id === currentSection) ? 1 : -1);
    
    const newUrl = `/ranch?section=${sectionId}`;
    window.history.pushState(null, '', newUrl);
    
    setTimeout(() => {
      setCurrentSection(sectionId);
      setShowSectionSelector(false);
      setIsLoading(false);
    }, 300);
  };

  const handleBackToSelector = () => {
    console.log('🔙 Volviendo al selector');
    window.history.pushState(null, '', '/ranch');
    setShowSectionSelector(true);
    setCurrentSection("overview");
  };

  // ============================================================================
  // FUNCIONES DE RENDERIZADO
  // ============================================================================

  const getCurrentSection = () => {
    return ranchSections.find(s => s.id === currentSection);
  };

  const currentSectionInfo = getCurrentSection();

  const renderSectionContent = () => {
    console.log('🎨 Renderizando sección:', currentSection);
    
    switch (currentSection) {
      case "property":
        return <PropertyInfo />;
      case "staff":
        return <Staff />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#E8E8C8] to-[#D3D3B8] p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header Principal */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {!showSectionSelector && currentSectionInfo && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToSelector}
                  className="mr-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#519a7c]" />
                </motion.button>
              )}
              
              <div>
                <h1 className="text-4xl font-bold text-[#2d5a45] mb-2">
                  {showSectionSelector ? "Gestión del Rancho" : currentSectionInfo?.name}
                </h1>
                <p className="text-gray-600 text-lg">
                  {showSectionSelector 
                    ? "Administra toda la información y recursos del rancho"
                    : currentSectionInfo?.description
                  }
                </p>
              </div>
            </div>

            {/* Información rápida y estado de conexión */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-white/20">
                <ConnectionIndicator 
                  connectionStatus={connectionStatus} 
                  onRetry={retryConnection}
                />
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-white/20">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  Rancho Los Ceibos
                </div>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-white/20">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date().toLocaleDateString('es-MX')}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State Global */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-[#519a7c] border-t-transparent rounded-full"
            />
          </motion.div>
        )}

        {/* Contenido Principal */}
        <AnimatePresence mode="wait" custom={direction}>
          {showSectionSelector ? (
            <motion.div
              key="selector"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
            >
              {/* Grid de información general */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RanchStatsOverview 
                  stats={ranchStats} 
                  isLoading={isLoading}
                  connectionStatus={connectionStatus}
                />
                <RanchQuickActions connectionStatus={connectionStatus} />
              </div>

              {/* Grid de alertas y secciones */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-semibold text-[#2d5a45] mb-6">
                      Secciones del Rancho
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {ranchSections.map((section) => (
                        <RanchSectionCard
                          key={section.id}
                          section={section}
                          isActive={currentSection === section.id}
                          onClick={() => handleSectionChange(section.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                <div>
                  <RanchAlerts 
                    alerts={alerts} 
                    stats={ranchStats}
                    isLoading={isLoading}
                  />
                </div>
              </div>

              {/* Información adicional */}
              <motion.div variants={itemVariants} className="text-center text-gray-600">
                <p>Selecciona una sección para administrar la información específica del rancho</p>
                {lastSync && (
                  <p className="text-sm mt-2">
                    Última sincronización: {new Date(lastSync).toLocaleString('es-MX')}
                  </p>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
            >
              {renderSectionContent()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navegación inferior en pantallas pequeñas */}
        {!showSectionSelector && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-6 right-6 lg:hidden"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex justify-around">
                {ranchSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = currentSection === section.id;
                  
                  return (
                    <motion.button
                      key={section.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSectionChange(section.id)}
                      className={`flex flex-col items-center p-2 rounded-lg transition-colors relative ${
                        isActive 
                          ? "bg-[#519a7c] text-white" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium">{section.name.split(' ')[0]}</span>
                      {section.badge && section.badge > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {section.badge}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default RanchPage;