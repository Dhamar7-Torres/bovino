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
  Loader2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { getMainBackgroundClasses, CSS_CLASSES } from "../../components/layout";

// Importar los componentes del módulo de inventario
import MedicineInventory from "./MedicineInventory";
import StockLevels from "./StockLevels";

// ===== INTERFACES =====
interface InventoryModuleStats {
  totalValue: number;
  totalItems: number;
  alertsCount: number;
  lowStockItems: number;
  expiringItems: number;
  lastUpdate: Date;
  categoriesCount: number;
  monthlyGrowth: number;
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

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minimumStock: number;
  value: number;
  expirationDate?: Date;
  supplier: string;
  location: string;
}

interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  type: 'low_stock' | 'expiring' | 'out_of_stock';
  priority: 'low' | 'medium' | 'high' | 'critical';
  currentStock: number;
  minimumStock: number;
  expirationDate?: Date;
  createdAt: Date;
}

interface ConnectionStatusProps {
  isConnected: boolean;
  isLoading: boolean;
  onRetry: () => void;
}

// ===== API SERVICE =====
const API_BASE_URL = 'http://localhost:5000/api/inventory';

class InventoryAPIService {
  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    return response.json();
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`Inventory API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Health check
  async testConnection(): Promise<{ status: string; message: string }> {
    return this.request('/health');
  }

  // Statistics
  async getStats(): Promise<InventoryModuleStats> {
    const data = await this.request('/stats');
    return {
      ...data,
      lastUpdate: new Date(data.lastUpdate),
    };
  }

  // Items
  async getItems(): Promise<InventoryItem[]> {
    const data = await this.request('/items');
    return data.map((item: any) => ({
      ...item,
      expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
    }));
  }

  async createItem(item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> {
    const data = await this.request('/items', {
      method: 'POST',
      body: JSON.stringify(item),
    });
    return {
      ...data,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
    };
  }

  async updateItem(id: string, item: Partial<InventoryItem>): Promise<InventoryItem> {
    const data = await this.request(`/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
    return {
      ...data,
      expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
    };
  }

  async deleteItem(id: string): Promise<void> {
    await this.request(`/items/${id}`, {
      method: 'DELETE',
    });
  }

  // Alerts
  async getAlerts(): Promise<StockAlert[]> {
    const data = await this.request('/alerts');
    return data.map((alert: any) => ({
      ...alert,
      createdAt: new Date(alert.createdAt),
      expirationDate: alert.expirationDate ? new Date(alert.expirationDate) : undefined,
    }));
  }

  // Medicines
  async getMedicines(): Promise<InventoryItem[]> {
    const data = await this.request('/medicines');
    return data.map((item: any) => ({
      ...item,
      expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined,
    }));
  }

  // Stock Levels
  async getStockLevels(): Promise<any[]> {
    return this.request('/stock-levels');
  }

  // Stock take
  async startStockTake(): Promise<{ id: string; status: string }> {
    return this.request('/stock-take/start', {
      method: 'POST',
    });
  }
}

// ===== CONNECTION STATUS COMPONENT =====
const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  isLoading, 
  onRetry 
}) => {
  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Conectando al servidor...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Sin conexión - Inventario</span>
        </div>
        <button 
          onClick={onRetry}
          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
        >
          Reintentar conexión
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
      <Wifi className="w-4 h-4" />
      <span className="text-sm">Conectado - Inventario</span>
    </div>
  );
};

// ===== MAIN COMPONENT =====
const InventoryPage: React.FC = () => {
  // Create API service instance
  const [apiService] = useState(() => new InventoryAPIService());
  
  // Component states
  const [moduleStats, setModuleStats] = useState<InventoryModuleStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnectionLoading, setIsConnectionLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showNavigation, setShowNavigation] = useState(false);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Navigation hooks
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  // Test backend connection
  const testConnection = async () => {
    try {
      setIsConnectionLoading(true);
      await apiService.testConnection();
      setIsConnected(true);
      console.log('✅ Conectado al backend de inventario');
    } catch (error) {
      setIsConnected(false);
      console.error('❌ Error conectando al backend de inventario:', error);
    } finally {
      setIsConnectionLoading(false);
    }
  };

  // Load data from backend
  const loadData = async () => {
    if (!isConnected) return;
    
    try {
      setIsLoading(true);
      
      // Load stats and alerts in parallel
      const [statsData, alertsData] = await Promise.all([
        apiService.getStats(),
        apiService.getAlerts()
      ]);
      
      setModuleStats(statsData);
      setAlerts(alertsData);
      setLastRefresh(new Date());
      
      console.log('✅ Datos de inventario cargados desde backend');
    } catch (error) {
      console.error('❌ Error cargando datos de inventario:', error);
      // En caso de error, usar datos de respaldo
      setModuleStats({
        totalValue: 0,
        totalItems: 0,
        alertsCount: 0,
        lowStockItems: 0,
        expiringItems: 0,
        lastUpdate: new Date(),
        categoriesCount: 0,
        monthlyGrowth: 0,
      });
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize connection and load data
  useEffect(() => {
    const initializeApp = async () => {
      await testConnection();
    };
    
    initializeApp();
  }, []);

  // Load data when connected
  useEffect(() => {
    if (isConnected) {
      loadData();
    }
  }, [isConnected]);

  // Refresh data
  const handleRefresh = async () => {
    if (isConnected) {
      await loadData();
    } else {
      await testConnection();
    }
  };

  // Navigation items configuration
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
      badge: alerts.filter(alert => alert.priority === 'high' || alert.priority === 'critical').length,
      color: "text-orange-600",
      isActive: currentPath.includes("/low-stock-alerts"),
      hasNotifications: alerts.length > 0,
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

  // Quick actions configuration
  const quickActions: QuickAction[] = [
    {
      id: "new-entry",
      title: "Registrar Entrada",
      description: "Agregar nuevos items al inventario",
      icon: Plus,
      color: "bg-green-500 hover:bg-green-600",
      action: () => {
        if (!isConnected) {
          alert('❌ Sin conexión al servidor. Verifique la conexión.');
          return;
        }
        console.log("Navegando a registro de entrada");
      },
    },
    {
      id: "stock-take",
      title: "Conteo de Inventario",
      description: "Realizar conteo físico del stock",
      icon: Package,
      color: "bg-blue-500 hover:bg-blue-600",
      action: async () => {
        if (!isConnected) {
          alert('❌ Sin conexión al servidor. Verifique la conexión.');
          return;
        }
        try {
          const stockTake = await apiService.startStockTake();
          console.log("Conteo iniciado:", stockTake);
          alert(`✅ Conteo de inventario iniciado (ID: ${stockTake.id})`);
        } catch (error) {
          console.error("Error iniciando conteo:", error);
          alert('❌ Error al iniciar el conteo de inventario');
        }
      },
    },
    {
      id: "generate-report",
      title: "Generar Reporte",
      description: "Crear reportes personalizados",
      icon: FileText,
      color: "bg-purple-500 hover:bg-purple-600",
      action: () => {
        if (!isConnected) {
          alert('❌ Sin conexión al servidor. Verifique la conexión.');
          return;
        }
        navigate("/inventory/reports");
      },
    },
    {
      id: "bulk-update",
      title: "Actualización Masiva",
      description: "Actualizar múltiples items",
      icon: Settings,
      color: "bg-orange-500 hover:bg-orange-600",
      action: () => {
        if (!isConnected) {
          alert('❌ Sin conexión al servidor. Verifique la conexión.');
          return;
        }
        console.log("Navegando a actualización masiva");
      },
    },
  ];

  // Helper functions
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

  // Wrapper components for child components
  const MedicineInventoryWrapper: React.FC = () => {
    const props = { isConnected, apiService };
    return React.createElement(MedicineInventory as any, props);
  };

  const StockLevelsWrapper: React.FC = () => {
    const props = { isConnected, apiService };
    return React.createElement(StockLevels as any, props);
  };

  // Si estamos en la ruta base, mostrar la vista del módulo
  const isModuleRoot = currentPath === "/inventory" || currentPath === "/inventory/";

  // Loading state for initial connection
  if (isLoading && !moduleStats) {
    return (
      <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
        <div className="flex flex-col items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white border-t-transparent rounded-full mb-4"
          />
          <p className="text-white text-lg">Conectando al sistema de inventario...</p>
          <p className="text-white/70 text-sm mt-2">
            {isConnectionLoading ? "Verificando conexión..." : "Cargando datos..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
      {/* Connection Status */}
      <ConnectionStatus 
        isConnected={isConnected}
        isLoading={isConnectionLoading}
        onRetry={testConnection}
      />

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
                  {!isConnected && (
                    <div className="bg-red-500/20 text-red-200 px-3 py-1 rounded-full text-sm font-medium">
                      Modo Sin Conexión
                    </div>
                  )}
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
                          {moduleStats.totalItems.toLocaleString()}
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
                        <div className={`font-bold text-lg ${
                          moduleStats.alertsCount > 0 ? 'text-orange-200' : 'text-green-200'
                        }`}>
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
                  disabled={!isConnected}
                  className={`px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center space-x-2 ${
                    isConnected 
                      ? 'bg-white/20 hover:bg-white/30 text-white' 
                      : 'bg-gray-500/20 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Acciones Rápidas</span>
                </button>

                {/* Actualizar datos */}
                <button 
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
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
            className="flex items-center justify-between text-white/80 text-sm mb-8"
          >
            <div className="flex items-center space-x-2">
              <Home className="w-4 h-4" />
              <span>Inicio</span>
              <ChevronRight className="w-4 h-4" />
              <span className="text-white font-medium">Inventario</span>
            </div>
            
            {moduleStats && (
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Actualizado: {formatTime(moduleStats.lastUpdate)}</span>
              </div>
            )}
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
                      {!isConnected && (
                        <span className="ml-2 text-sm text-gray-500 font-normal">
                          (Requiere conexión)
                        </span>
                      )}
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
                        disabled={!isConnected}
                        className={`${action.color} text-white p-4 rounded-lg transition-all duration-200 transform hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
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
                    <p className={`text-sm mt-1 ${
                      moduleStats.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {moduleStats.monthlyGrowth >= 0 ? '+' : ''}
                      {moduleStats.monthlyGrowth.toFixed(1)}% vs mes anterior
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
                    <p className="text-blue-600 text-sm mt-1">
                      {moduleStats.categoriesCount} categorías
                    </p>
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
                    <p className={`text-sm mt-1 ${
                      moduleStats.alertsCount > 0 ? 'text-orange-600' : 'text-green-600'
                    }`}>
                      {moduleStats.alertsCount > 0 ? 'Requieren atención' : 'Todo bajo control'}
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
                    <p className={`text-sm mt-1 ${
                      moduleStats.lowStockItems > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {moduleStats.lowStockItems > 0 ? 'Reposición urgente' : 'Niveles óptimos'}
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
              <div className="flex items-center space-x-4">
                {isConnected && (
                  <div className="flex items-center space-x-2 text-white/80 text-sm bg-white/10 rounded-lg px-3 py-2">
                    <Wifi className="w-4 h-4" />
                    <span>Online</span>
                  </div>
                )}
                <div className="flex items-center space-x-2 text-white/80 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>
                    Actualizado: {formatTime(lastRefresh)}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                  onClick={() => isConnected ? handleNavigate(item.path) : null}
                  className={`${
                    CSS_CLASSES.card
                  } p-6 transition-all duration-200 transform ${
                    isConnected ? 'cursor-pointer hover:shadow-lg hover:scale-105' : 'cursor-not-allowed opacity-75'
                  } ${
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
                        <Bell className="w-4 h-4 text-orange-500 animate-pulse" />
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
                          : isConnected
                          ? "bg-gray-100 text-gray-600"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {item.isActive 
                        ? "Página actual" 
                        : isConnected 
                        ? "Disponible" 
                        : "Sin conexión"
                      }
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
                  alimentos y equipos especializados. {!isConnected && (
                    <strong className="text-red-600">
                      Actualmente funcionando en modo sin conexión - algunas características están limitadas.
                    </strong>
                  )}
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
                  
                  {!isConnected && (
                    <div className="bg-red-500/20 text-red-200 px-2 py-1 rounded text-xs">
                      Sin conexión
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  {/* Navegación rápida entre módulos */}
                  <div className="hidden md:flex items-center space-x-2">
                    {navigationItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => isConnected ? handleNavigate(item.path) : null}
                        disabled={!isConnected}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all duration-200 flex items-center space-x-1 ${
                          item.isActive
                            ? "bg-white/20 text-white"
                            : isConnected 
                            ? "text-white/70 hover:bg-white/10 hover:text-white"
                            : "text-white/40 cursor-not-allowed"
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

                  {/* Actualizar */}
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg flex items-center space-x-1 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>

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
                            if (isConnected) {
                              handleNavigate(item.path);
                              setShowNavigation(false);
                            }
                          }}
                          disabled={!isConnected}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                            item.isActive
                              ? "bg-white/20 text-white"
                              : isConnected
                              ? "text-white/70 hover:bg-white/10 hover:text-white"
                              : "text-white/40 cursor-not-allowed"
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
                    <div className="container mx-auto px-6 py-8">
                      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <BarChart3 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Dashboard de Inventario
                        </h2>
                        <p className="text-gray-600">
                          Vista general y métricas principales del inventario
                        </p>
                        {!isConnected && (
                          <p className="text-red-600 text-sm mt-2">
                            ⚠️ Sin conexión al servidor - Datos limitados
                          </p>
                        )}
                      </div>
                    </div>
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
                    <MedicineInventoryWrapper />
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
                    <StockLevelsWrapper />
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
                    <div className="container mx-auto px-6 py-8">
                      <div className="bg-white rounded-lg shadow-sm p-8">
                        <div className="flex items-center space-x-3 mb-6">
                          <AlertTriangle className="w-8 h-8 text-orange-500" />
                          <div>
                            <h2 className="text-2xl font-bold text-gray-900">
                              Alertas de Stock Bajo
                            </h2>
                            <p className="text-gray-600">
                              Monitoreo en tiempo real de niveles críticos
                            </p>
                          </div>
                        </div>
                        
                        {alerts.length > 0 ? (
                          <div className="space-y-4">
                            {alerts.map((alert) => (
                              <div
                                key={alert.id}
                                className={`p-4 rounded-lg border-l-4 ${
                                  alert.priority === 'critical' 
                                    ? 'bg-red-50 border-red-500'
                                    : alert.priority === 'high'
                                    ? 'bg-orange-50 border-orange-500'
                                    : 'bg-yellow-50 border-yellow-500'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      {alert.itemName}
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                      Stock actual: {alert.currentStock} | Mínimo: {alert.minimumStock}
                                    </p>
                                    {alert.expirationDate && (
                                      <p className="text-sm text-gray-600">
                                        Vence: {alert.expirationDate.toLocaleDateString()}
                                      </p>
                                    )}
                                  </div>
                                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    alert.priority === 'critical'
                                      ? 'bg-red-100 text-red-800'
                                      : alert.priority === 'high'
                                      ? 'bg-orange-100 text-orange-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {alert.priority.toUpperCase()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                              No hay alertas activas
                            </h3>
                            <p className="text-gray-600">
                              Todos los niveles de stock están en rangos óptimos
                            </p>
                          </div>
                        )}
                        
                        {!isConnected && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-700 text-sm">
                              ⚠️ Sin conexión al servidor - Mostrando últimas alertas cargadas
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
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
                    <div className="container mx-auto px-6 py-8">
                      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <FileText className="w-16 h-16 text-indigo-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          Reportes de Inventario
                        </h2>
                        <p className="text-gray-600 mb-4">
                          Generación y gestión de reportes especializados
                        </p>
                        {!isConnected && (
                          <p className="text-red-600 text-sm">
                            ⚠️ Sin conexión al servidor - Funcionalidad limitada
                          </p>
                        )}
                      </div>
                    </div>
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