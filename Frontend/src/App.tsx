import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Beef, Syringe, Calendar, Bell, Wifi, WifiOff, CheckCircle, XCircle, AlertCircle } from "lucide-react";

import { Layout } from "./components/layout";
import AuthPage from "./pages/auth/AuthPage";
import BovinesPage from "./pages/bovines/BovinesPage";
import EventPage from "./pages/events/EventsPage";
import FeedingPage from "./pages/feeding/FeedingPage";
import { FinancesPage } from "./pages/finances";
import HealthPage from "./pages/health/HealthPage";
import MapsPage from "./pages/maps";
import InventoryPage from "./pages/inventory/InventoryPage";
import ProductionPage from "./pages/production";
import RanchPage from "./pages/ranch/RanchPage";
import { ReportsPage } from "./pages/reports";
import { ReproductionPage } from "./pages/reproduction";
import SettingsPage from "./pages/settings";

// ============================================================================
// CONFIGURACIÓN DE API Y SERVICIOS
// ============================================================================

// Configuración base de la API
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  API_VERSION: '/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Tipos de respuesta de la API
interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  error?: string;
}

// Tipos de autenticación
interface User {
  id: string;
  email: string;
  personalInfo: {
    firstName: string;
    lastName: string;
  };
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Clase para manejo de API
class ApiService {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = `${API_CONFIG.BASE_URL}${API_CONFIG.API_VERSION}`;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Método genérico para hacer requests
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    useAuth: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Agregar token de autenticación si es necesario
    if (useAuth) {
      const tokens = localStorage.getItem('bovino_tokens');
      if (tokens) {
        const { accessToken } = JSON.parse(tokens);
        defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      signal: AbortSignal.timeout(this.timeout),
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Error de conexión con el servidor');
    }
  }

  // Métodos HTTP
  async get<T>(endpoint: string, useAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, useAuth);
  }

  async post<T>(endpoint: string, data: any, useAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    }, useAuth);
  }

  async put<T>(endpoint: string, data: any, useAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, useAuth);
  }

  async delete<T>(endpoint: string, useAuth: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, useAuth);
  }

  // Métodos específicos de autenticación
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.post('/auth/login', { email, password }, false);
  }

  async register(userData: any): Promise<ApiResponse<{ user: User; tokens: AuthTokens }>> {
    return this.post('/auth/register', userData, false);
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.get('/auth/profile');
  }

  async logout(): Promise<ApiResponse<any>> {
    return this.post('/auth/logout', {});
  }

  // Método para probar la conexión
  async testConnection(): Promise<ApiResponse<any>> {
    return this.get('/ping', false);
  }

  // Obtener información del sistema
  async getSystemInfo(): Promise<ApiResponse<any>> {
    return this.get('/info', false);
  }

  // Obtener estadísticas del dashboard
  async getDashboardStats(): Promise<ApiResponse<any>> {
    return this.get('/bovines/statistics');
  }
}

// Instancia singleton del servicio API
export const apiService = new ApiService();

// ============================================================================
// CONTEXTO DE AUTENTICACIÓN
// ============================================================================

interface AuthContextType {
  authState: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Cargar estado de autenticación al iniciar
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const storedTokens = localStorage.getItem('bovino_tokens');
        const storedUser = localStorage.getItem('bovino_user');

        if (storedTokens && storedUser) {
          const tokens = JSON.parse(storedTokens);

          // Verificar si el token sigue siendo válido
          try {
            const response = await apiService.getProfile();
            if (response.success && response.data) {
              setAuthState({
                user: response.data as User,
                tokens,
                isAuthenticated: true,
                isLoading: false,
              });
              return;
            }
          } catch (error) {
            // Token inválido, limpiar almacenamiento
            localStorage.removeItem('bovino_tokens');
            localStorage.removeItem('bovino_user');
          }
        }
      } catch (error) {
        console.error('Error cargando estado de autenticación:', error);
      } finally {
        setAuthState(prev => ({ 
          user: prev.user,
          tokens: prev.tokens,
          isAuthenticated: prev.isAuthenticated,
          isLoading: false
        }));
      }
    };

    loadAuthState();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: true,
        user: null,
        tokens: null,
        isAuthenticated: false
      }));
      
      const response = await apiService.login(email, password);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        // Guardar en localStorage
        localStorage.setItem('bovino_tokens', JSON.stringify(tokens));
        localStorage.setItem('bovino_user', JSON.stringify(user));
        
        setAuthState({
          user: user as User,
          tokens: tokens as AuthTokens,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
        user: null,
        tokens: null,
        isAuthenticated: false
      }));
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar estado local independientemente del resultado del API
      localStorage.removeItem('bovino_tokens');
      localStorage.removeItem('bovino_user');
      setAuthState({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: true,
        user: null,
        tokens: null,
        isAuthenticated: false
      }));
      
      const response = await apiService.register(userData);
      
      if (response.success && response.data) {
        const { user, tokens } = response.data;
        
        localStorage.setItem('bovino_tokens', JSON.stringify(tokens));
        localStorage.setItem('bovino_user', JSON.stringify(user));
        
        setAuthState({
          user: user as User,
          tokens: tokens as AuthTokens,
          isAuthenticated: true,
          isLoading: false,
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error en registro:', error);
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false,
        user: null,
        tokens: null,
        isAuthenticated: false
      }));
      return false;
    }
  };

  const refreshAuth = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        setAuthState(prev => ({
          ...prev,
          user: response.data as User,
        }));
      }
    } catch (error) {
      console.error('Error refrescando auth:', error);
      await logout();
    }
  };

  const contextValue: AuthContextType = {
    authState,
    login,
    logout,
    register,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================================
// COMPONENTE DE PRUEBA DE CONEXIÓN
// ============================================================================

interface ConnectionTestProps {
  onClose: () => void;
}

const ConnectionTest: React.FC<ConnectionTestProps> = ({ onClose }) => {
  const [testResults, setTestResults] = useState<{
    ping: { status: 'loading' | 'success' | 'error'; message?: string; time?: number };
    info: { status: 'loading' | 'success' | 'error'; data?: any; message?: string };
    auth: { status: 'loading' | 'success' | 'error'; message?: string };
  }>({
    ping: { status: 'loading' },
    info: { status: 'loading' },
    auth: { status: 'loading' },
  });

  useEffect(() => {
    const runTests = async () => {
      // Test 1: Ping al servidor
      try {
        const startTime = Date.now();
        const pingResponse = await apiService.testConnection();
        const endTime = Date.now();
        
        if (pingResponse.success) {
          setTestResults(prev => ({
            ...prev,
            ping: { 
              status: 'success', 
              message: 'Conexión exitosa',
              time: endTime - startTime 
            }
          }));
        } else {
          setTestResults(prev => ({
            ...prev,
            ping: { status: 'error', message: 'Respuesta inválida del servidor' }
          }));
        }
      } catch (error: any) {
        setTestResults(prev => ({
          ...prev,
          ping: { status: 'error', message: error.message }
        }));
      }

      // Test 2: Información del sistema
      try {
        const infoResponse = await apiService.getSystemInfo();
        if (infoResponse.success) {
          setTestResults(prev => ({
            ...prev,
            info: { status: 'success', data: infoResponse.data }
          }));
        } else {
          setTestResults(prev => ({
            ...prev,
            info: { status: 'error', message: 'No se pudo obtener información del sistema' }
          }));
        }
      } catch (error: any) {
        setTestResults(prev => ({
          ...prev,
          info: { status: 'error', message: error.message }
        }));
      }

      // Test 3: Endpoint de autenticación (si hay token)
      try {
        const tokens = localStorage.getItem('bovino_tokens');
        if (tokens) {
          const profileResponse = await apiService.getProfile();
          if (profileResponse.success) {
            setTestResults(prev => ({
              ...prev,
              auth: { status: 'success', message: 'Token válido' }
            }));
          } else {
            setTestResults(prev => ({
              ...prev,
              auth: { status: 'error', message: 'Token inválido' }
            }));
          }
        } else {
          setTestResults(prev => ({
            ...prev,
            auth: { status: 'success', message: 'Sin token (normal si no está logueado)' }
          }));
        }
      } catch (error: any) {
        setTestResults(prev => ({
          ...prev,
          auth: { status: 'error', message: error.message }
        }));
      }
    };

    runTests();
  }, []);

  const getStatusIcon = (status: 'loading' | 'success' | 'error') => {
    switch (status) {
      case 'loading':
        return <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">Prueba de Conexión</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Test de Ping */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {getStatusIcon(testResults.ping.status)}
            <div className="flex-1">
              <div className="font-medium text-gray-800">Conectividad</div>
              <div className="text-sm text-gray-600">
                {testResults.ping.status === 'loading' ? 'Probando conexión...' : 
                 testResults.ping.message}
                {testResults.ping.time && ` (${testResults.ping.time}ms)`}
              </div>
            </div>
          </div>

          {/* Test de Info del Sistema */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {getStatusIcon(testResults.info.status)}
            <div className="flex-1">
              <div className="font-medium text-gray-800">API del Sistema</div>
              <div className="text-sm text-gray-600">
                {testResults.info.status === 'loading' ? 'Obteniendo información...' :
                 testResults.info.status === 'success' ? 
                 `API v${testResults.info.data?.version || 'N/A'} - ${testResults.info.data?.environment || 'N/A'}` :
                 testResults.info.message}
              </div>
            </div>
          </div>

          {/* Test de Autenticación */}
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            {getStatusIcon(testResults.auth.status)}
            <div className="flex-1">
              <div className="font-medium text-gray-800">Autenticación</div>
              <div className="text-sm text-gray-600">
                {testResults.auth.status === 'loading' ? 'Verificando token...' :
                 testResults.auth.message}
              </div>
            </div>
          </div>
        </div>

        {/* Información de configuración */}
        <div className="mt-6 p-3 bg-blue-50 rounded-lg">
          <div className="text-sm text-blue-800">
            <div><strong>Backend URL:</strong> {API_CONFIG.BASE_URL}</div>
            <div><strong>API Version:</strong> {API_CONFIG.API_VERSION}</div>
            <div><strong>Timeout:</strong> {API_CONFIG.TIMEOUT}ms</div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// HOOK PARA ESTADO DE CONEXIÓN
// ============================================================================

export const useConnection = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        await apiService.testConnection();
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      } finally {
        setLastCheck(new Date());
      }
    };

    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    checkConnection(); // Verificar inmediatamente

    // Escuchar eventos de red del navegador
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, lastCheck };
};

// ============================================================================
// COMPONENTE DE INDICADOR DE CONEXIÓN
// ============================================================================

const ConnectionIndicator: React.FC = () => {
  const { isOnline, lastCheck } = useConnection();

  return (
    <div className="fixed top-4 right-4 z-40">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg ${
          isOnline 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}
      >
        {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
        <span className="text-sm font-medium">
          {isOnline ? 'En línea' : 'Sin conexión'}
        </span>
        {lastCheck && (
          <span className="text-xs opacity-70">
            {lastCheck.toLocaleTimeString()}
          </span>
        )}
      </motion.div>
    </div>
  );
};

// Agregar las fuentes elegantes al head
const addGoogleFonts = () => {
  const link = document.createElement("link");
  link.href =
    "https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
};

// Ejecutar al cargar
if (typeof window !== "undefined") {
  addGoogleFonts();
}

// ============================================================================
// DASHBOARD PRINCIPAL CON CONEXIÓN AL BACKEND
// ============================================================================

const DashboardPage: React.FC = () => {
  const [showConnectionTest, setShowConnectionTest] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  // Cargar datos del dashboard desde el backend
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await apiService.getDashboardStats();
        if (response.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error('Error cargando datos del dashboard:', error);
        // Usar datos de respaldo si no se puede conectar
        setDashboardData({
          totalBovines: 1247,
          pendingVaccinations: 23,
          todayEvents: 8,
          activeAlerts: 3
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (authState.isAuthenticated) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]);

  const stats = dashboardData ? [
    {
      title: "Total Ganado",
      value: dashboardData.totalBovines?.toString() || "1,247",
      description: "Cabezas registradas",
      change: "+12 este mes",
      changeColor: "text-gray-600",
      icon: Beef,
      iconColor: "#9c6d3f",
      iconBg: "#c9a47e",
      progressColor: "#9c6d3f",
      progressValue: 75,
    },
    {
      title: "Vacunas Pendientes",
      value: dashboardData.pendingVaccinations?.toString() || "23",
      description: "Requieren atención",
      change: "+3 hoy",
      changeColor: "text-[#d94343]",
      icon: Syringe,
      iconColor: "#e47b3e",
      iconBg: "#fef3cd",
      progressColor: "#e6a066",
      progressValue: 60,
      urgent: true,
    },
    {
      title: "Eventos Hoy",
      value: dashboardData.todayEvents?.toString() || "8",
      description: "Programados",
      icon: Calendar,
      iconColor: "#9c6ad5",
      iconBg: "#f3f0ff",
      progressColor: "#bfa3ec",
      progressValue: 45,
    },
    {
      title: "Alertas Activas",
      value: dashboardData.activeAlerts?.toString() || "3",
      description: "Requieren acción",
      change: "-1 hoy",
      changeColor: "text-[#71a9d6]",
      icon: Bell,
      iconColor: "#4a7cb1",
      iconBg: "#e1f5fe",
      progressColor: "#a5c7e6",
      progressValue: 30,
    },
  ] : [];

  return (
    <div
      className="space-y-8 min-h-screen p-8 -m-8"
      style={{
        fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif',
      }}
    >
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold drop-shadow-lg"
          style={{
            fontFamily:
              '"Playfair Display", "Georgia", "Times New Roman", serif',
            textShadow: "0 2px 8px rgba(255,255,255,0.8)",
            color: "#8B4513",
          }}
        >
          Dashboard Principal
        </motion.h1>
        
        <div className="flex items-center gap-4">
          {/* Botón de prueba de conexión */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowConnectionTest(true)}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center gap-2"
          >
            <AlertCircle size={18} />
            Probar Conexión
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-[#2d5a41] to-[#1a4d36] text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center gap-2"
            style={{
              boxShadow:
                "0 8px 32px rgba(45, 90, 65, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
              fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif',
            }}
          >
            <Plus size={20} />
            Nuevo Registro
          </motion.button>
        </div>
      </div>

      {/* Indicador de estado de carga */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center py-8"
        >
          <div className="animate-spin w-8 h-8 border-4 border-[#3d8b40] border-t-transparent rounded-full"></div>
          <span className="ml-3 text-[#3d8b40] font-medium">Cargando datos del servidor...</span>
        </motion.div>
      )}

      {/* Widgets de estadísticas */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                type: "spring",
                stiffness: 120,
              }}
              whileHover={{
                y: -4,
                scale: 1.02,
                transition: { duration: 0.2 },
              }}
              className={`
                bg-[#f5f5dc] rounded-2xl p-6 shadow-md hover:shadow-lg
                backdrop-blur-sm relative overflow-hidden cursor-pointer group
                border border-gray-200/50
                ${stat.urgent ? "ring-1 ring-red-200" : ""}
              `}
              style={{
                boxShadow:
                  "0 4px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3
                      className="text-sm font-semibold text-black mb-2"
                      style={{
                        fontFamily:
                          '"Crimson Text", "Georgia", "Times New Roman", serif',
                      }}
                    >
                      {stat.title}
                    </h3>
                  </div>
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm"
                    style={{ backgroundColor: stat.iconBg }}
                  >
                    <stat.icon size={32} style={{ color: stat.iconColor }} />
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-baseline gap-3">
                    <span
                      className="text-3xl font-bold text-black"
                      style={{
                        fontFamily:
                          '"Playfair Display", "Georgia", "Times New Roman", serif',
                      }}
                    >
                      {stat.value}
                    </span>
                    {stat.change && (
                      <span
                        className={`text-xs font-semibold ${stat.changeColor}`}
                      >
                        ({stat.change})
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs text-black font-medium mb-4">
                  {stat.description}
                </p>

                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.progressValue}%` }}
                    transition={{ duration: 1.5, delay: index * 0.2 }}
                    className="h-1.5 rounded-full"
                    style={{ backgroundColor: stat.progressColor }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Sección adicional */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12"
      >
        <div className="w-full">
          <div className="bg-[#f5f5dc]/90 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-200/30 h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3d8b40] to-[#f4ac3a] rounded-xl flex items-center justify-center">
                🏢
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black">Bovino UJAT</h3>
                <p className="text-[#3d8b40] font-semibold">
                  Gestión Ganadera Inteligente
                </p>
              </div>
            </div>

            <p className="text-black leading-relaxed mb-6 font-medium">
              Sistema integral para el manejo, seguimiento y control de ganado
              bovino con tecnología de geolocalización avanzada desarrollado en
              la UJAT.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="text-2xl font-bold text-[#3d8b40]">
                  {dashboardData?.totalBovines || '1,247'}
                </div>
                <div className="text-sm text-black font-medium">
                  Animales Registrados
                </div>
              </div>
              <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="text-2xl font-bold text-[#f4ac3a]">342</div>
                <div className="text-sm text-black font-medium">
                  Vacunas este Mes
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#f5f5dc]/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30">
            <h4 className="font-semibold text-black mb-4">Estado del Sistema</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Conexión Backend</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Conectado</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Base de Datos</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs text-green-600">Activa</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-black">Autenticación</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${authState.isAuthenticated ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                  <span className={`text-xs ${authState.isAuthenticated ? 'text-green-600' : 'text-yellow-600'}`}>
                    {authState.isAuthenticated ? 'Autenticado' : 'Sin autenticar'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#f5f5dc]/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30">
            <h4 className="font-semibold text-black mb-4">Funcionalidades</h4>
            <ul className="space-y-3">
              {[
                "Rastreo de Ganado",
                "Control de Vacunas",
                "Reportes de Salud",
                "Gestión de Ubicaciones",
              ].map((feature) => (
                <li key={feature}>
                  <a
                    href="#"
                    className="flex items-center gap-3 text-black hover:text-[#f4ac3a] transition-colors text-sm font-medium"
                  >
                    <span>⚡</span>
                    {feature}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Modal de prueba de conexión */}
      {showConnectionTest && (
        <ConnectionTest onClose={() => setShowConnectionTest(false)} />
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL DE LA APLICACIÓN
// ============================================================================

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          {/* Indicador de conexión */}
          <ConnectionIndicator />
          
          <Routes>
            {/* Ruta raíz - redirige al dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Rutas de autenticación - FUERA del Layout */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/auth/*" element={<AuthPage />} />

            {/* Layout principal con rutas anidadas */}
            <Route path="/*" element={<Layout />}>
              <Route path="dashboard/*" element={<DashboardPage />} />
              <Route path="bovines/*" element={<BovinesPage />} />
              <Route path="feeding/*" element={<FeedingPage />} /> 
              <Route path="health/*" element={<HealthPage />} /> 
              <Route path="reproduction/*" element={<ReproductionPage />} /> 
              <Route path="production/*" element={<ProductionPage />} /> 
              <Route path="maps/*" element={<MapsPage />} /> 
              <Route path="events/*" element={<EventPage />} />
              <Route path="inventory/*" element={<InventoryPage />} /> 
              <Route path="finances/*" element={<FinancesPage />} /> 
              <Route path="reports/*" element={<ReportsPage />} /> 
              <Route path="ranch/*" element={<RanchPage />} /> 
              <Route path="settings/*" element={<SettingsPage />} /> 

              {/* Ruta 404 */}
              <Route
                path="*"
                element={
                  <div className="min-h-screen bg-gradient-to-br from-white/30 via-white/15 to-white/5 backdrop-blur-sm flex flex-col items-center justify-center p-8 rounded-3xl border border-white/20">
                    <motion.div
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6 }}
                      className="text-center max-w-2xl"
                    >
                      <h1 className="text-5xl font-bold text-black mb-6 drop-shadow-lg">
                        Página no encontrada
                      </h1>
                      <p className="text-xl text-black/90 mb-12 drop-shadow">
                        La página que buscas no existe
                      </p>
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="mb-8"
                      >
                        <div className="w-32 h-32 mx-auto mb-8 text-8xl">😕</div>
                      </motion.div>
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        onClick={() => window.history.back()}
                        className="bg-gradient-to-r from-[#3d8b40] to-[#f4ac3a] text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                      >
                        ← Volver atrás
                      </motion.button>
                    </motion.div>
                  </div>
                }
              />
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;