import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart,
  TrendingUp,
  Package,
  ArrowLeft,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader,
  AlertCircle,
  X,
  CheckCircle,
  FileText,
  BarChart3,
  Calendar
} from 'lucide-react';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

interface ReportStats {
  total: number;
  thisMonth: number;
  trend: number;
  lastUpdated?: string;
}

interface ReportModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  color: string;
  route: string;
  stats: ReportStats;
  features: string[];
  isNew?: boolean;
}

interface ReportsOverview {
  health: ReportStats;
  production: ReportStats;
  inventory: ReportStats;
  systemStatus: {
    totalReports: number;
    activeModules: number;
    lastSync: string;
  };
}

// Props del componente principal
interface ReportsPageProps {
  className?: string;
}

// ============================================================================
// COMPONENTES DE PÁGINAS HIJAS (SIMULADAS)
// ============================================================================

const HealthReports: React.FC = () => (
  <div className="p-6 bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Heart className="w-8 h-8 text-[#4e9c75] mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Reportes de Salud Veterinaria</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Animales Sanos</p>
                <p className="text-2xl font-bold text-green-800">245</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <Heart className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">En Tratamiento</p>
                <p className="text-2xl font-bold text-yellow-800">12</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-full">
                <AlertCircle className="w-6 h-6 text-yellow-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Vacunaciones</p>
                <p className="text-2xl font-bold text-blue-800">156</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Calendar className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Reportes Recientes</h3>
            <div className="space-y-3">
              {['Reporte Sanitario Mensual', 'Control de Vacunaciones', 'Análisis de Enfermedades'].map((report, index) => (
                <div key={index} className="flex items-center p-3 bg-white rounded-lg border">
                  <FileText className="w-5 h-5 text-[#4e9c75] mr-3" />
                  <span className="font-medium text-gray-700">{report}</span>
                  <span className="ml-auto text-sm text-gray-500">Hace {index + 1} día(s)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ProductionReports: React.FC = () => (
  <div className="p-6 bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <TrendingUp className="w-8 h-8 text-[#519a7c] mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Reportes de Producción</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#519a7c]/10 to-[#519a7c]/5 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#519a7c] text-sm font-medium">Producción Total</p>
                <p className="text-2xl font-bold text-gray-800">1,245 kg</p>
              </div>
              <div className="p-3 bg-[#519a7c]/20 rounded-full">
                <TrendingUp className="w-6 h-6 text-[#519a7c]" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Eficiencia</p>
                <p className="text-2xl font-bold text-green-800">94.5%</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <BarChart3 className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Promedio Diario</p>
                <p className="text-2xl font-bold text-blue-800">42.3 kg</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <Calendar className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Análisis de Rendimiento</h3>
          <p className="text-gray-600 mb-4">Los datos muestran un incremento del 15.2% en la producción este mes.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-700 mb-2">Mejor Rendimiento</h4>
              <p className="text-2xl font-bold text-[#519a7c]">Sector Norte</p>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-medium text-gray-700 mb-2">Área de Mejora</h4>
              <p className="text-2xl font-bold text-orange-600">Sector Sur</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const InventoryReports: React.FC = () => (
  <div className="p-6 bg-gray-50 min-h-screen">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Package className="w-8 h-8 text-[#3ca373] mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Reportes de Inventario</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-[#3ca373]/10 to-[#3ca373]/5 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[#3ca373] text-sm font-medium">Total Bovinos</p>
                <p className="text-2xl font-bold text-gray-800">267</p>
              </div>
              <div className="p-3 bg-[#3ca373]/20 rounded-full">
                <Package className="w-6 h-6 text-[#3ca373]" />
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Machos</p>
                <p className="text-2xl font-bold text-blue-800">89</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-full">
                <span className="text-blue-700 font-bold">♂</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-600 text-sm font-medium">Hembras</p>
                <p className="text-2xl font-bold text-pink-800">178</p>
              </div>
              <div className="p-3 bg-pink-200 rounded-full">
                <span className="text-pink-700 font-bold">♀</span>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Crías</p>
                <p className="text-2xl font-bold text-green-800">34</p>
              </div>
              <div className="p-3 bg-green-200 rounded-full">
                <Heart className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Movimientos Recientes</h3>
            <div className="space-y-3">
              {[
                { action: 'Ingreso', count: 5, type: 'Compra de ganado' },
                { action: 'Egreso', count: 2, type: 'Venta' },
                { action: 'Nacimiento', count: 3, type: 'Reproducción natural' }
              ].map((movement, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      movement.action === 'Ingreso' ? 'bg-green-500' :
                      movement.action === 'Egreso' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <div>
                      <p className="font-medium text-gray-700">{movement.action}</p>
                      <p className="text-sm text-gray-500">{movement.type}</p>
                    </div>
                  </div>
                  <span className="font-bold text-gray-800">+{movement.count}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-[#3ca373]/10 to-[#519a7c]/10 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Valoración Actual</h3>
            <p className="text-3xl font-bold text-[#3ca373] mb-2">$2,456,780 MXN</p>
            <p className="text-sm text-gray-600">Valor estimado del inventario total</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// SERVICIO API PARA REPORTES
// ============================================================================

class ReportsApiService {
  private baseURL = 'http://localhost:5000/api';
  
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('Reports API Error:', error);
      throw error instanceof Error ? error : new Error('Error de conexión');
    }
  }

  // Obtener overview general de reportes
  async getReportsOverview(): Promise<ApiResponse<ReportsOverview>> {
    return this.makeRequest<ReportsOverview>('/reports/overview');
  }

  // Obtener estadísticas de reportes de salud
  async getHealthReportsStats(): Promise<ApiResponse<ReportStats>> {
    return this.makeRequest<ReportStats>('/reports/health/stats');
  }

  // Obtener estadísticas de reportes de producción
  async getProductionReportsStats(): Promise<ApiResponse<ReportStats>> {
    return this.makeRequest<ReportStats>('/reports/production/stats');
  }

  // Obtener estadísticas de reportes de inventario
  async getInventoryReportsStats(): Promise<ApiResponse<ReportStats>> {
    return this.makeRequest<ReportStats>('/reports/inventory/stats');
  }

  // Verificar conexión con el backend
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/ping`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  // Obtener estado del sistema de reportes
  async getSystemStatus(): Promise<ApiResponse<any>> {
    return this.makeRequest('/reports/system/status');
  }
}

// Instancia del servicio API
const reportsApi = new ReportsApiService();

// ============================================================================
// FUNCIÓN DE UTILIDAD PARA CLASES CSS
// ============================================================================

const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// ============================================================================
// DATOS INICIALES (FALLBACK)
// ============================================================================

const DEFAULT_STATS: ReportStats = {
  total: 0,
  thisMonth: 0,
  trend: 0,
  lastUpdated: new Date().toISOString()
};

const INITIAL_MODULES: ReportModule[] = [
  {
    id: 'health',
    name: 'Reportes de Salud',
    description: 'Análisis veterinarios y estado de salud del ganado',
    icon: <Heart className="w-6 h-6" />,
    component: HealthReports,
    route: '/reports/health',
    color: '#4e9c75',
    stats: DEFAULT_STATS,
    features: ['Salud general', 'Enfermedades', 'Tratamientos', 'Vacunación'],
    isNew: false
  },
  {
    id: 'production',
    name: 'Reportes de Producción',
    description: 'Métricas de rendimiento y productividad',
    icon: <TrendingUp className="w-6 h-6" />,
    component: ProductionReports,
    route: '/reports/production',
    color: '#519a7c',
    stats: DEFAULT_STATS,
    features: ['Peso y crecimiento', 'Eficiencia alimentaria', 'Reproducción'],
    isNew: false
  },
  {
    id: 'inventory',
    name: 'Reportes de Inventario',
    description: 'Conteo, valuación y movimientos del ganado',
    icon: <Package className="w-6 h-6" />,
    component: InventoryReports,
    route: '/reports/inventory',
    color: '#3ca373',
    stats: DEFAULT_STATS,
    features: ['Inventario completo', 'Valuación', 'Movimientos', 'Auditorías'],
    isNew: true
  },
];

// ============================================================================
// COMPONENTE PARA TARJETA DE MÓDULO
// ============================================================================

const ModuleCard: React.FC<{ 
  module: ReportModule; 
  index: number; 
  onClick: () => void;
  isLoading?: boolean;
}> = ({ module, index, onClick, isLoading = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={!isLoading ? onClick : undefined}
      className={cn(
        "group bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden",
        isLoading ? "opacity-75 cursor-wait" : "cursor-pointer"
      )}
    >
      {/* Badge de nuevo si aplica */}
      {module.isNew && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#f4ac3a] to-[#ff8c42] text-white text-xs px-2 py-1 rounded-full font-medium">
          Nuevo
        </div>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl z-10">
          <Loader className="w-8 h-8 text-[#519a7c] animate-spin" />
        </div>
      )}

      {/* Header con icono y estadísticas */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className="p-3 rounded-lg group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: `${module.color}20` }}
        >
          <div style={{ color: module.color }}>
            {module.icon}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: module.color }}>
            {module.stats.total}
          </div>
          <div className="text-xs text-gray-500">reportes totales</div>
        </div>
      </div>

      {/* Contenido */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-[#2d6f51] transition-colors">
          {module.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3">
          {module.description}
        </p>
        
        {/* Características */}
        <div className="flex flex-wrap gap-1">
          {module.features.map((feature, featureIndex) => (
            <span 
              key={featureIndex}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Footer con métricas */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{module.stats.thisMonth}</span> este mes
        </div>
        <div className={cn(
          "flex items-center text-sm font-medium",
          module.stats.trend > 0 ? "text-green-600" : 
          module.stats.trend < 0 ? "text-red-600" : "text-gray-500"
        )}>
          <span className={cn(
            "mr-1",
            module.stats.trend > 0 ? "↗" : 
            module.stats.trend < 0 ? "↘" : "→"
          )}>
            {module.stats.trend !== 0 && `${Math.abs(module.stats.trend)}%`}
          </span>
          {module.stats.trend > 0 ? "Incremento" : 
           module.stats.trend < 0 ? "Decremento" : "Sin cambios"}
        </div>
      </div>

      {/* Timestamp de última actualización */}
      {module.stats.lastUpdated && (
        <div className="text-xs text-gray-400 mt-2">
          Actualizado: {new Date(module.stats.lastUpdated).toLocaleString('es-MX')}
        </div>
      )}

      {/* Efecto de hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"
        style={{ background: `linear-gradient(135deg, ${module.color}, transparent)` }}
      />
    </motion.div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export const ReportsPage: React.FC<ReportsPageProps> = ({ className }) => {
  // ============================================================================
  // ESTADOS
  // ============================================================================
  
  const [reportModules, setReportModules] = useState<ReportModule[]>(INITIAL_MODULES);
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // ============================================================================
  // FUNCIONES DE API
  // ============================================================================

  // Verificar conexión con el backend
  const checkConnection = async () => {
    const connected = await reportsApi.checkConnection();
    setIsConnected(connected);
    return connected;
  };

  // Cargar estadísticas de todos los módulos
  const loadAllStats = async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    setApiError(null);

    try {
      // Intentar obtener overview completo primero
      try {
        const overviewResponse = await reportsApi.getReportsOverview();
        if (overviewResponse.success && overviewResponse.data) {
          const overview = overviewResponse.data;
          
          // Actualizar módulos con estadísticas reales
          setReportModules(prev => prev.map(module => {
            const stats = overview[module.id as keyof ReportsOverview] as ReportStats;
            return stats ? { ...module, stats } : module;
          }));
          
          setLastSync(new Date().toISOString());
          setIsConnected(true);
          showSuccessNotification("Estadísticas actualizadas correctamente");
          return;
        }
      } catch (overviewError) {
        console.log("Overview endpoint not available, trying individual endpoints...");
      }

      // Si el overview no está disponible, obtener estadísticas individuales
      const [healthResponse, productionResponse, inventoryResponse] = await Promise.allSettled([
        reportsApi.getHealthReportsStats(),
        reportsApi.getProductionReportsStats(),
        reportsApi.getInventoryReportsStats()
      ]);

      // Actualizar estadísticas de cada módulo
      setReportModules(prev => prev.map(module => {
        let updatedStats = module.stats;

        switch (module.id) {
          case 'health':
            if (healthResponse.status === 'fulfilled' && healthResponse.value.success) {
              updatedStats = healthResponse.value.data || module.stats;
            }
            break;
          case 'production':
            if (productionResponse.status === 'fulfilled' && productionResponse.value.success) {
              updatedStats = productionResponse.value.data || module.stats;
            }
            break;
          case 'inventory':
            if (inventoryResponse.status === 'fulfilled' && inventoryResponse.value.success) {
              updatedStats = inventoryResponse.value.data || module.stats;
            }
            break;
        }

        return { ...module, stats: updatedStats };
      }));

      setLastSync(new Date().toISOString());
      setIsConnected(true);
      showSuccessNotification("Estadísticas actualizadas correctamente");

    } catch (error) {
      console.error('Error loading reports stats:', error);
      setApiError(error instanceof Error ? error.message : 'Error desconocido');
      setIsConnected(false);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  };

  // Función para mostrar notificación de éxito
  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  // Recargar datos
  const refreshData = () => {
    loadAllStats(true);
  };

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Cargar datos iniciales
  useEffect(() => {
    checkConnection();
    loadAllStats();
  }, []);

  // Auto-refresh cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        loadAllStats(false); // Sin mostrar loader en refresh automático
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [isConnected]);

  // ============================================================================
  // FUNCIONES DE NAVEGACIÓN
  // ============================================================================

  // Obtener el módulo actual
  const activeModule = currentModule ? reportModules.find(m => m.id === currentModule) : null;

  // Función para navegar a un módulo específico
  const handleModuleClick = (module: ReportModule) => {
    setCurrentModule(module.id);
  };

  // Función para volver al hub principal
  const handleBackToHub = () => {
    setCurrentModule(null);
  };

  // ============================================================================
  // RENDERIZADO CONDICIONAL
  // ============================================================================

  // Renderizar página hija si hay un módulo seleccionado
  if (activeModule) {
    const ChildComponent = activeModule.component;
    return (
      <div className={cn("min-h-screen", className)}>
        {/* Barra de navegación superior */}
        <div className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToHub}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Hub
              </button>
              
              <div className="flex items-center gap-3 text-white">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  {activeModule.icon}
                </div>
                <div>
                  <h1 className="text-xl font-semibold">{activeModule.name}</h1>
                  <p className="text-white/80 text-sm">{activeModule.description}</p>
                </div>
              </div>
            </div>

            {/* Indicador de conexión en la barra superior */}
            <div className="flex items-center gap-3">
              {lastSync && (
                <span className="text-white/70 text-sm">
                  Último sync: {new Date(lastSync).toLocaleTimeString('es-MX')}
                </span>
              )}
              <div className="flex items-center">
                {isConnected ? (
                  <div className="flex items-center text-white/90">
                    <Wifi className="w-4 h-4 mr-1" />
                    <span className="text-sm">Conectado</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-300">
                    <WifiOff className="w-4 h-4 mr-1" />
                    <span className="text-sm">Desconectado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Renderizar el componente hijo */}
        <ChildComponent />
      </div>
    );
  }

  // ============================================================================
  // RENDERIZADO DEL HUB PRINCIPAL
  // ============================================================================

  return (
    <div
      className={cn(
        "min-h-screen",
        "bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]",
        className
      )}
    >
      {/* Notificaciones */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            {successMessage}
          </motion.div>
        )}

        {apiError && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center max-w-md"
          >
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{apiError}</span>
            <button 
              onClick={() => setApiError(null)}
              className="ml-3 text-white hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header principal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-3">
                  Centro de Reportes y Análisis
                </h1>
                <p className="text-white/90 text-lg">
                  Sistema integral de reportes para la gestión ganadera inteligente
                </p>
              </div>

              {/* Controles de estado y actualización */}
              <div className="flex items-center gap-4">
                {/* Indicador de conexión */}
                <div className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2">
                  {isConnected ? (
                    <div className="flex items-center text-white">
                      <Wifi className="w-5 h-5 mr-2" />
                      <span className="font-medium">Conectado</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-300">
                      <WifiOff className="w-5 h-5 mr-2" />
                      <span className="font-medium">Desconectado</span>
                    </div>
                  )}
                </div>

                {/* Botón de actualización */}
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
                  <span>{isLoading ? "Actualizando..." : "Actualizar"}</span>
                </button>
              </div>
            </div>

            {/* Información de última sincronización */}
            {lastSync && (
              <div className="mt-4 flex items-center text-white/70 text-sm">
                <span>Última actualización: {new Date(lastSync).toLocaleString('es-MX')}</span>
              </div>
            )}
          </motion.div>

          {/* Estado de carga o error de conexión */}
          {!isConnected && !isLoading ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 bg-white/90 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg"
            >
              <WifiOff className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Sin conexión al servidor
              </h3>
              <p className="text-gray-600 mb-4">
                No se puede conectar con el backend de reportes en el puerto 5000.
              </p>
              <button
                onClick={refreshData}
                className="px-6 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors"
              >
                Reintentar conexión
              </button>
            </motion.div>
          ) : (
            /* Grid de módulos de reportes */
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">
                  Módulos de Reportes
                </h2>
                
                {isLoading && (
                  <div className="flex items-center text-white/80 text-sm">
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Cargando estadísticas...
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reportModules.map((module, index) => (
                  <ModuleCard
                    key={module.id}
                    module={module}
                    index={index}
                    onClick={() => handleModuleClick(module)}
                    isLoading={isLoading}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Resumen de estadísticas generales */}
          {isConnected && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Resumen General del Sistema
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gradient-to-br from-[#4e9c75]/10 to-[#4e9c75]/5 rounded-lg">
                  <div className="text-2xl font-bold text-[#4e9c75]">
                    {reportModules.reduce((sum, module) => sum + module.stats.total, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Total de Reportes</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-[#519a7c]/10 to-[#519a7c]/5 rounded-lg">
                  <div className="text-2xl font-bold text-[#519a7c]">
                    {reportModules.reduce((sum, module) => sum + module.stats.thisMonth, 0)}
                  </div>
                  <div className="text-sm text-gray-600">Este Mes</div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-[#3ca373]/10 to-[#3ca373]/5 rounded-lg">
                  <div className="text-2xl font-bold text-[#3ca373]">
                    {reportModules.filter(m => m.stats.trend > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Módulos en Crecimiento</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};