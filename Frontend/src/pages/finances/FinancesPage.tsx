import React, { useState, useEffect, useCallback } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  HelpCircle,
  RefreshCw,
  AlertCircle,
  DollarSign,
  X,
  Activity,
  PieChart,
  Calendar,
  Target,
} from "lucide-react";

// Interfaces para tipado
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  color: string;
}

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  roi: number;
}

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
  change: number;
}

interface CashFlowItem {
  month: string;
  income: number;
  expenses: number;
  netFlow: number;
}

interface CostPerAnimal {
  feed: number;
  medical: number;
  maintenance: number;
  total: number;
}

interface FinancialMetrics {
  summary: FinancialSummary;
  byCategory: CategoryData[];
  cashFlow: CashFlowItem[];
  costPerAnimal: CostPerAnimal;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

// Servicio API para métricas financieras
class FinancesDashboardAPI {
  private static readonly BASE_URL = 'http://localhost:5000/api';
  
  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error de conexión' }));
      throw new Error(errorData.message || `Error HTTP: ${response.status}`);
    }
    return response.json();
  }

  private static async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.BASE_URL}${endpoint}`;
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    };

    const finalOptions = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, finalOptions);
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`Error en petición a ${url}:`, error);
      throw error;
    }
  }

  static async getFinancialMetrics(): Promise<ApiResponse<{ financialMetrics: FinancialMetrics, lastUpdated: string }>> {
    return this.makeRequest<ApiResponse<{ financialMetrics: FinancialMetrics, lastUpdated: string }>>(
      '/dashboard/financial-metrics'
    );
  }

  static async getTransactionsSummary(): Promise<ApiResponse<any>> {
    return this.makeRequest<ApiResponse<any>>(
      '/finances/transactions?limit=5&sortBy=createdAt&sortOrder=DESC'
    );
  }
}

// Componente Dashboard
const FinancialDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const loadMetrics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await FinancesDashboardAPI.getFinancialMetrics();
      
      if (response.success && response.data) {
        setMetrics(response.data.financialMetrics);
        setLastUpdated(response.data.lastUpdated);
      } else {
        throw new Error(response.message || 'Error al cargar métricas');
      }
    } catch (error) {
      console.error('Error cargando métricas:', error);
      setError(error instanceof Error ? error.message : 'Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando métricas financieras...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 m-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="text-red-800 font-semibold">Error de Conexión</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
        <button
          onClick={loadMetrics}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header del Dashboard */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center">
              <BarChart3 className="w-8 h-8 mr-3" />
              Dashboard Financiero
            </h1>
            <p className="text-green-100">
             Última actualización: {new Date(lastUpdated).toLocaleString('es-MX')}
            </p>
          </div>
          <button
            onClick={loadMetrics}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {/* Tarjetas de Resumen Principal */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-700">
                  {formatCurrency(metrics.summary.totalRevenue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Gastos Totales</p>
                <p className="text-2xl font-bold text-red-600">
                  {formatCurrency(metrics.summary.totalExpenses)}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Ganancia Neta</p>
                <p className={`text-2xl font-bold ${metrics.summary.netProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  {formatCurrency(metrics.summary.netProfit)}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${metrics.summary.netProfit >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <DollarSign className={`w-6 h-6 ${metrics.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">ROI</p>
                <p className="text-2xl font-bold text-blue-700">
                  {formatPercentage(metrics.summary.roi)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos y Análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gastos por Categoría */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Gastos por Categoría
              </h3>
            </div>
            <div className="space-y-4">
              {metrics.byCategory.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className={`w-4 h-4 rounded-full`}
                      style={{
                        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'][index % 3]
                      }}
                    ></div>
                    <span className="text-gray-700 font-medium">{category.category}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 font-semibold">{formatCurrency(category.amount)}</p>
                    <p className={`text-sm ${category.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(category.change)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Flujo de Caja */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Flujo de Caja (6 meses)
              </h3>
            </div>
            <div className="space-y-3">
              {metrics.cashFlow.slice(-6).map((item, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-700 font-medium">{item.month}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-600 text-sm">
                      Ing: {formatCurrency(item.income)} | Gas: {formatCurrency(item.expenses)}
                    </p>
                    <p className={`font-semibold ${item.netFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(item.netFlow)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Costos por Animal */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Costos por Animal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-green-600 font-semibold">Alimentación</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(metrics.costPerAnimal.feed)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-600 font-semibold">Médico</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(metrics.costPerAnimal.medical)}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-yellow-600 font-semibold">Mantenimiento</p>
              <p className="text-2xl font-bold text-yellow-700">{formatCurrency(metrics.costPerAnimal.maintenance)}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-600 font-semibold">Total</p>
              <p className="text-2xl font-bold text-gray-700">{formatCurrency(metrics.costPerAnimal.total)}</p>
            </div>
          </div>
        </div>

        {/* Información de Conexión */}
        <div className="bg-green-700/50 backdrop-blur-md rounded-xl p-4 border border-green-400/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-green-200 text-xs">
              Actualizando cada 60 segundos
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente placeholder para ingresos
const IncomeTrackerPlaceholder: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white/95 backdrop-blur-md rounded-xl p-8 text-center">
        <TrendingUp className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Módulo de Ingresos</h2>
        <p className="text-gray-600 mb-4">
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700 text-sm">
            🔗 Endpoint: http://localhost:5000/api/finances/transactions?type=INCOME
          </p>
        </div>
      </div>
    </div>
  </div>
);

// Componente placeholder para gastos
const ExpenseTrackerPlaceholder: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-purple-600 p-6">
    <div className="max-w-7xl mx-auto">
      <div className="bg-white/95 backdrop-blur-md rounded-xl p-8 text-center">
        <TrendingDown className="w-16 h-16 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Módulo de Gastos</h2>
        <p className="text-gray-600 mb-4">
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-sm">
            🔗 Endpoint: http://localhost:5000/api/finances/transactions?type=EXPENSE
          </p>
        </div>
      </div>
    </div>
  </div>
);

const FinancesPage: React.FC = () => {
  // Estados del componente
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking');
  const [error, setError] = useState<string | null>(null);

  // Función para verificar conexión al backend
  const checkBackendConnection = useCallback(async () => {
    try {
      setConnectionStatus('checking');
      await FinancesDashboardAPI.getFinancialMetrics();
      setConnectionStatus('connected');
      setError(null);
    } catch (error) {
      setConnectionStatus('disconnected');
      setError('No se puede conectar al backend en puerto 5000');
    }
  }, []);

  // Función para manejar cambio de tab
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Definición de navegación del módulo con colores verdes
  const navigationItems: NavigationItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <BarChart3 className="w-5 h-5" />,
      description: "Vista general del estado financiero",
      color: "from-green-400 to-green-600",
    },
    {
      id: "income-tracker",
      label: "Ingresos",
      icon: <TrendingUp className="w-5 h-5" />,
      description: "Seguimiento detallado de ingresos",
      color: "from-emerald-400 to-emerald-600",
    },
    {
      id: "expense-tracker",
      label: "Gastos",
      icon: <TrendingDown className="w-5 h-5" />,
      description: "Control de gastos operativos",
      color: "from-teal-400 to-teal-600",
    },
  ];

  // Efecto para simular carga inicial y verificar conexión
  useEffect(() => {
    const timer = setTimeout(async () => {
      await checkBackendConnection();
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, [checkBackendConnection]);

  // Efecto para actualizar timestamp cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Efecto para verificar conexión periódicamente
  useEffect(() => {
    const interval = setInterval(() => {
      if (activeTab === 'dashboard') {
        checkBackendConnection();
      }
    }, 30000); // Verificar cada 30 segundos

    return () => clearInterval(interval);
  }, [activeTab, checkBackendConnection]);

  // Función para formatear tiempo
  const formatLastUpdated = (date: Date): string => {
    return date.toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para obtener el icono de estado de conexión
  const getConnectionIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>;
      case 'disconnected':
        return <div className="w-3 h-3 bg-red-400 rounded-full"></div>;
      case 'checking':
        return <div className="w-3 h-3 bg-yellow-400 rounded-full animate-spin"></div>;
    }
  };

  // Función para obtener el texto de estado
  const getConnectionText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Conectado al Backend';
      case 'disconnected':
        return 'Desconectado del Backend';
      case 'checking':
        return 'Verificando conexión...';
    }
  };

  // Función para renderizar el contenido según el tab activo
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <FinancialDashboard />;
      case 'income-tracker':
        return <IncomeTrackerPlaceholder />;
      case 'expense-tracker':
        return <ExpenseTrackerPlaceholder />;
      default:
        return <FinancialDashboard />;
    }
  };

  // Componente de Loading con degradado verde oscuro
  const LoadingSpinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800">
      <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-white text-lg font-medium">Inicializando Módulo de Finanzas...</p>
      <p className="text-green-100 text-sm mt-2">Conectando...</p>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-green-600">
      <div className="flex flex-col h-screen">
        {/* Alert de Error de Conexión */}
        {error && connectionStatus === 'disconnected' && (
          <div className="bg-red-500 text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={checkBackendConnection}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm transition-colors"
              >
                Reintentar
              </button>
              <button
                onClick={() => setError(null)}
                className="hover:bg-red-600 p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header principal del módulo con fondo verde */}
        <div className="bg-green-500/90 backdrop-blur-md border-b border-green-400 shadow-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              {/* Título y navegación principal */}
              <div className="flex items-center space-x-4">
                <button
                  className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 hover:scale-105"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">
                    Módulo de Finanzas
                  </h1>
                  <p className="text-white/80 text-sm lg:text-base">
                    Gestión integral de finanzas ganaderas 
                  </p>
                </div>
              </div>

              {/* Estado de conexión */}
              <div className="flex items-center space-x-3 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                {getConnectionIcon()}
                <span className="text-white text-sm font-medium">
                  {getConnectionText()}
                </span>
                <button
                  onClick={checkBackendConnection}
                  disabled={connectionStatus === 'checking'}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <RefreshCw className={`w-4 h-4 text-white ${connectionStatus === 'checking' ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Navegación de pestañas con colores verdes */}
            <div className="mt-6 flex flex-wrap gap-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleTabChange(item.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-300 hover:scale-102 hover:-translate-y-1 ${
                    activeTab === item.id
                      ? "bg-white text-green-700 shadow-lg border border-white"
                      : "bg-white/20 text-white hover:bg-white/30 hover:text-white"
                  }`}
                >
                  <div
                    className={`p-1 rounded ${
                      activeTab === item.id ? `bg-green-100` : "bg-white/20"
                    }`}
                  >
                    {item.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-xs opacity-75">{item.description}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Información de actualización y estado */}
            <div className="mt-4 flex justify-between items-center text-xs text-white/70">
              <div className="flex items-center space-x-4">
                <span>Última actualización: {formatLastUpdated(lastUpdated)}</span>
              </div>
              <div className="flex items-center space-x-4">
                <button 
                  className="hover:text-white transition-colors duration-200 flex items-center space-x-1"
                  title="Ayuda"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ayuda</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default FinancesPage;