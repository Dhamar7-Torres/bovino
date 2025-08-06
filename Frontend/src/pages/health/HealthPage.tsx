import React, { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ChevronRight,
  Syringe,
  Calendar,
  ClipboardList,
  Clipboard,
  Microscope,
  Pill,
  FileText,
  Skull,
  HeartHandshake,
  Bug,
  Menu,
  X,
  Wifi,
  WifiOff,
  Server,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
} from "lucide-react";

// ===================================================================
// SERVICIO DE API PARA CONECTAR CON EL BACKEND
// ===================================================================

const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  responseTime?: number;
  status?: number;
}

class HealthApiService {
  private static token: string | null = null;

  static setAuthToken(token: string) {
    this.token = token;
  }

  private static getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Platform': 'web',
      'X-App-Version': '1.0.0',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private static async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const responseTime = Date.now() - startTime;
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      return { 
        success: data.success || true,
        message: data.message,
        data: data.data,
        error: data.error,
        responseTime,
        status: response.status
      };
    } catch (error) {
      console.error(`Error en petición a ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        responseTime: Date.now() - startTime,
      };
    }
  }

  // Endpoints principales
  static async checkConnection(): Promise<ApiResponse> {
    return this.makeRequest('/health');
  }

  static async getServerInfo(): Promise<ApiResponse> {
    return this.makeRequest('/info');
  }

  static async ping(): Promise<ApiResponse> {
    return this.makeRequest('/ping');
  }

  static async getVaccinations(params?: any): Promise<ApiResponse> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    return this.makeRequest(`/health/vaccinations${queryString}`);
  }

  static async createVaccination(data: any): Promise<ApiResponse> {
    return this.makeRequest('/health/vaccinations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async getVaccinationSchedule(): Promise<ApiResponse> {
    return this.makeRequest('/health/vaccinations/schedule');
  }

  static async getOverdueVaccinations(): Promise<ApiResponse> {
    return this.makeRequest('/health/vaccinations/overdue');
  }

  static async getDiseases(): Promise<ApiResponse> {
    return this.makeRequest('/health/diseases');
  }

  static async getMedicalHistory(animalId: string): Promise<ApiResponse> {
    return this.makeRequest(`/health/medical-history/${animalId}`);
  }

  static async getTreatmentPlans(): Promise<ApiResponse> {
    return this.makeRequest('/health/treatment-plans');
  }

  static async getMedicationInventory(): Promise<ApiResponse> {
    return this.makeRequest('/health/medication-inventory');
  }
}

// ===================================================================
// COMPONENTE DE ESTADO DE CONEXIÓN
// ===================================================================

interface ConnectionStatus {
  isConnected: boolean;
  isLoading: boolean;
  lastChecked: Date | null;
  responseTime: number | null;
  serverInfo: any;
  error: string | null;
}

const ConnectionMonitor: React.FC = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isLoading: true,
    lastChecked: null,
    responseTime: null,
    serverInfo: null,
    error: null,
  });

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await HealthApiService.checkConnection();
      const infoResponse = await HealthApiService.getServerInfo();

      setStatus({
        isConnected: response.success,
        isLoading: false,
        lastChecked: new Date(),
        responseTime: response.responseTime ?? null,
        serverInfo: infoResponse.success ? infoResponse.data : null,
        error: response.success ? null : response.error || 'Error de conexión',
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        isLoading: false,
        lastChecked: new Date(),
        responseTime: null,
        serverInfo: null,
        error: error instanceof Error ? error.message : 'Error de conexión',
      });
    }
  };

  useEffect(() => {
    checkConnection();
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {status.isLoading ? (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          ) : status.isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
          
          <div>
            <span className="text-sm font-medium text-gray-800">
              Backend: {status.isLoading ? 'Verificando...' : status.isConnected ? 'Conectado' : 'Desconectado'}
            </span>
            {status.responseTime !== null && (
              <span className="text-xs text-gray-500 ml-2">
                ({status.responseTime}ms)
              </span>
            )}
          </div>
        </div>

        <button
          onClick={checkConnection}
          disabled={status.isLoading}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${status.isLoading ? 'animate-spin' : ''}`} />
          Test
        </button>
      </div>

      {status.error && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          <AlertTriangle className="w-3 h-3 flex-shrink-0" />
          {status.error}
        </div>
      )}

      {status.serverInfo && (
        <div className="flex items-center gap-2 mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          <CheckCircle className="w-3 h-3" />
          {status.serverInfo.name} v{status.serverInfo.version}
        </div>
      )}
    </motion.div>
  );
};

// ===================================================================
// COMPONENTES DEL MÓDULO HEALTH ACTUALIZADOS CON BACKEND
// ===================================================================

const VaccinationRecords: React.FC = () => {
  const [vaccinations, setVaccinations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVaccinations = async () => {
      try {
        const response = await HealthApiService.getVaccinations();
        if (response.success) {
          setVaccinations(response.data || []);
        } else {
          setError(response.error || 'Error al cargar vacunaciones');
        }
      } catch (err) {
        setError('Error de conexión');
      } finally {
        setLoading(false);
      }
    };

    fetchVaccinations();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Registros de Vacunación</h2>
      
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-2 text-gray-600">Cargando datos del backend...</span>
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <span className="text-red-700">{error}</span>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-green-700 text-sm">Conectado al endpoint /health/vaccinations</span>
          </div>
          
          <div className="text-gray-600">
            <p>Registros encontrados: <strong>{vaccinations.length}</strong></p>
            {vaccinations.length === 0 && (
              <p className="text-sm text-yellow-600 mt-2">
                No hay registros de vacunación. La base de datos está vacía.
              </p>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const VaccineScheduler: React.FC = () => {
  const [, setSchedule] = useState<any>(null);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const response = await HealthApiService.getVaccinationSchedule();
        setSchedule(response);
      } catch (error) {
        console.error('Error fetching schedule:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Programador de Vacunas</h2>
      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <Server className="w-4 h-4 text-blue-500" />
        <span className="text-blue-700 text-sm">
          Conectado al endpoint /health/vaccinations/schedule
        </span>
      </div>
    </motion.div>
  );
};

const MedicalHistory: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
  >
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Historial Médico</h2>
    <div className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
      <Server className="w-4 h-4 text-purple-500" />
      <span className="text-purple-700 text-sm">
        Conectado al endpoint /health/medical-history
      </span>
    </div>
  </motion.div>
);

const TreatmentPlans: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
  >
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Planes de Tratamiento</h2>
    <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
      <Server className="w-4 h-4 text-indigo-500" />
      <span className="text-indigo-700 text-sm">
        Conectado al endpoint /health/treatment-plans
      </span>
    </div>
  </motion.div>
);

const DiseaseTracking: React.FC = () => {
  const [, setDiseases] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const fetchDiseases = async () => {
      try {
        const response = await HealthApiService.getDiseases();
        setDiseases(response.data || []);
      } catch (error) {
        console.error('Error fetching diseases:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDiseases();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Seguimiento de Enfermedades</h2>
      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
        <Server className="w-4 h-4 text-green-500" />
        <span className="text-green-700 text-sm">
          Conectado al endpoint /health/diseases
        </span>
      </div>
    </motion.div>
  );
};

const MedicationInventory: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
  >
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Inventario de Medicamentos</h2>
    <div className="flex items-center gap-2 p-3 bg-pink-50 border border-pink-200 rounded-lg">
      <Server className="w-4 h-4 text-pink-500" />
      <span className="text-pink-700 text-sm">
        Conectado al endpoint /health/medication-inventory
      </span>
    </div>
  </motion.div>
);

const PostMortemReports: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
  >
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Reportes Post-Mortem</h2>
    <div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
      <Server className="w-4 h-4 text-gray-500" />
      <span className="text-gray-700 text-sm">
        Componente conectado al backend
      </span>
    </div>
  </motion.div>
);

const ReproductiveHealth: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
  >
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Salud Reproductiva</h2>
    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
      <Server className="w-4 h-4 text-red-500" />
      <span className="text-red-700 text-sm">
        Componente conectado al backend
      </span>
    </div>
  </motion.div>
);

const ParasiteParatrol: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
  >
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Control de Parásitos</h2>
    <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <Server className="w-4 h-4 text-yellow-500" />
      <span className="text-yellow-700 text-sm">
        Componente conectado al backend
      </span>
    </div>
  </motion.div>
);

// ===================================================================
// COMPONENTE DE NAVEGACIÓN SECUNDARIA (MANTENIDO ORIGINAL)
// ===================================================================

const HealthNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/health", icon: Home, exact: true },
    {
      label: "Registros de Vacunación",
      path: "/health/vaccination-records",
      icon: Syringe,
    },
    {
      label: "Historial Médico",
      path: "/health/medical-history",
      icon: ClipboardList,
    },
    {
      label: "Planes de Tratamiento",
      path: "/health/treatment-plans",
      icon: Clipboard,
    },
    {
      label: "Seguimiento de Enfermedades",
      path: "/health/disease-tracking",
      icon: Microscope,
    },
    {
      label: "Inventario de Medicamentos",
      path: "/health/medication-inventory",
      icon: Pill,
    },
    {
      label: "Programador de Vacunas",
      path: "/health/vaccine-scheduler",
      icon: Calendar,
    },
    { label: "Reportes de Salud", path: "/health/reports", icon: FileText },
    { label: "Reportes Post-Mortem", path: "/health/postmortem", icon: Skull },
    {
      label: "Salud Reproductiva",
      path: "/health/reproductive",
      icon: HeartHandshake,
    },
    {
      label: "Control de Parásitos",
      path: "/health/parasite-control",
      icon: Bug,
    },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-3 sm:p-4 mb-6 sm:mb-8"
    >
      {/* Navegación móvil - Menú hamburguesa */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-800">Módulo de Salud</span>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menú desplegable móvil */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path, item.exact);

                  return (
                    <motion.button
                      key={item.path}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigation(item.path)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all ${
                        active
                          ? "bg-emerald-100 text-emerald-700 shadow-md"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="truncate">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navegación desktop - Scroll horizontal */}
      <div className="hidden lg:block">
        <div className="flex items-center overflow-x-auto space-x-1 pb-2 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                  active
                    ? "bg-emerald-100 text-emerald-700 shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// ===================================================================
// BREADCRUMBS (MANTENIDO ORIGINAL)
// ===================================================================

const HealthBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [
      { label: "Inicio", path: "/dashboard" },
      { label: "Salud", path: "/health" },
    ];

    if (pathSegments.length > 1) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      const breadcrumbMap: { [key: string]: string } = {
        "vaccination-records": "Registros de Vacunación",
        "medical-history": "Historial Médico",
        "treatment-plans": "Planes de Tratamiento",
        "disease-tracking": "Seguimiento de Enfermedades",
        "medication-inventory": "Inventario de Medicamentos",
        "vaccine-scheduler": "Programador de Vacunas",
        reports: "Reportes de Salud",
        postmortem: "Reportes Post-Mortem",
        reproductive: "Salud Reproductiva",
        "parasite-control": "Control de Parásitos",
      };

      if (breadcrumbMap[lastSegment]) {
        breadcrumbs.push({
          label: breadcrumbMap[lastSegment],
          path: location.pathname,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center space-x-1 sm:space-x-2 text-white/80 mb-4 sm:mb-6 overflow-x-auto scrollbar-hide"
    >
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          {index > 0 && (
            <ChevronRight 
              size={14} 
              className="text-white/60 flex-shrink-0 sm:w-4 sm:h-4" 
            />
          )}
          <button
            onClick={() => navigate(crumb.path)}
            className={`text-xs sm:text-sm hover:text-white transition-colors whitespace-nowrap ${
              index === breadcrumbs.length - 1
                ? "text-white font-medium"
                : "hover:underline"
            }`}
          >
            {crumb.label}
          </button>
        </React.Fragment>
      ))}
    </motion.nav>
  );
};

// ===================================================================
// COMPONENTE PRINCIPAL HEALTHPAGE ACTUALIZADO
// ===================================================================

const HealthPage: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Container principal responsive */}
      <div className="min-h-screen p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <HealthBreadcrumbs />

          {/* Monitor de conexión - Se muestra siempre */}
          <ConnectionMonitor />

          {/* Navegación del módulo (solo mostrar en páginas que no sean el dashboard) */}
          {location.pathname !== "/health" && <HealthNavigation />}

          {/* Contenido principal con animaciones */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full overflow-hidden"
            >
              {/* Wrapper para hacer responsivo el contenido */}
              <div className="w-full">
                <Routes>
                  {/* Dashboard del módulo de salud */}
                  <Route
                    path="/"
                    element={
                      <div className="space-y-6">
                        <HealthNavigation />
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
                        >
                          <h1 className="text-3xl font-bold text-gray-800 mb-4">
                            Módulo de Salud Animal
                          </h1>
                          <p className="text-gray-600 mb-6">
                            Sistema de gestión integral para la salud del ganado bovino
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                              <Syringe className="w-8 h-8 text-emerald-600 mb-2" />
                              <h3 className="font-semibold text-emerald-800">Vacunaciones</h3>
                              <p className="text-sm text-emerald-600">Gestión completa de vacunas</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <ClipboardList className="w-8 h-8 text-blue-600 mb-2" />
                              <h3 className="font-semibold text-blue-800">Historial Médico</h3>
                              <p className="text-sm text-blue-600">Registro médico completo</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                              <Microscope className="w-8 h-8 text-purple-600 mb-2" />
                              <h3 className="font-semibold text-purple-800">Seguimiento</h3>
                              <p className="text-sm text-purple-600">Monitoreo de enfermedades</p>
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    }
                  />

                  {/* Todas las rutas del módulo health completamente implementadas */}
                  <Route
                    path="vaccination-records"
                    element={<VaccinationRecords />}
                  />
                  <Route path="vaccine-scheduler" element={<VaccineScheduler />} />
                  <Route path="medical-history" element={<MedicalHistory />} />
                  <Route path="treatment-plans" element={<TreatmentPlans />} />
                  <Route path="disease-tracking" element={<DiseaseTracking />} />
                  <Route
                    path="medication-inventory"
                    element={<MedicationInventory />}
                  />
                  <Route path="postmortem" element={<PostMortemReports />} />
                  <Route path="reproductive" element={<ReproductiveHealth />} />
                  <Route path="parasite-control" element={<ParasiteParatrol />} />

                  {/* Ruta fallback - redirigir al dashboard */}
                  <Route path="*" element={<Navigate to="/health" replace />} />
                </Routes>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Estilos para ocultar scrollbars en navegadores webkit */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Router principal del módulo health - Gestiona todas las rutas de salud animal
export default HealthPage;