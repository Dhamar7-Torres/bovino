import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Filter, 
  Download, 
  Eye,
  AlertCircle,
  Calendar,
  Package,
  DollarSign,
  MapPin,
  TrendingUp,
  Users,
  BarChart3,
  Target,
  FileText,
  FileSpreadsheet,
  Loader2,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';

// ===================================================================
// CONFIGURACIÓN DE LA API
// ===================================================================

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    REPORTS: '/reports',
    INVENTORY: '/inventory',
    REPORTS_INVENTORY: '/reports/inventory',
    HEALTH: '/health'
  }
};

// ===================================================================
// SERVICIO DE API
// ===================================================================

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiService {
  private static baseURL = API_CONFIG.BASE_URL;
  private static token: string | null = null;

  // Configurar token de autenticación
  static setAuthToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Obtener token de autenticación
  static getAuthToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  // Headers por defecto
  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // Manejar respuestas de la API
  private static async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    let data;
    if (isJson) {
      data = await response.json();
    } else {
      data = { success: false, message: await response.text() };
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || `Error HTTP ${response.status}`,
        status: response.status,
        code: data.error || data.errorCode
      };
      throw error;
    }

    return data.data || data;
  }

  // GET request
  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  // POST request
  static async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // PUT request
  static async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  // DELETE request
  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  // Test de conectividad
  static async testConnection(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch (error) {
      console.error('Error de conectividad:', error);
      return false;
    }
  }
}

// ===================================================================
// INTERFACES ACTUALIZADAS PARA LA API
// ===================================================================

interface InventoryReport {
  id: string;
  title: string;
  description: string;
  reportType: InventoryReportType;
  period: ReportPeriod;
  location: string;
  inventoryMetrics: InventoryMetrics;
  categoryBreakdown: CategoryBreakdown[];
  locationBreakdown: LocationBreakdown[];
  movements: InventoryMovement[];
  valuation: InventoryValuation;
  discrepancies: InventoryDiscrepancy[];
  createdAt: string;
  updatedAt: string;
  status: ReportStatus;
  auditor: string;
  createdBy: string;
}

interface InventoryMetrics {
  totalAnimals: number;
  activeAnimals: number;
  newAcquisitions: number;
  sold: number;
  deaths: number;
  transferred: number;
  totalValue: number;
  averageValue: number;
  inventoryTurnover: number;
  accuracyRate: number;
  lastFullCount: string;
  pendingUpdates: number;
}

interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  count: number;
  previousCount: number;
  change: number;
  averageAge: number;
  averageWeight: number;
  totalValue: number;
  averageValuePerHead: number;
  status: AnimalStatus[];
}

interface LocationBreakdown {
  locationId: string;
  locationName: string;
  capacity: number;
  currentCount: number;
  occupancyRate: number;
  lastUpdated: string;
  categories: {
    categoryName: string;
    count: number;
  }[];
}

interface InventoryMovement {
  movementId: string;
  movementType: MovementType;
  animalCount: number;
  fromLocation?: string;
  toLocation?: string;
  date: string;
  reason: string;
  cost?: number;
  revenue?: number;
  responsible: string;
}

interface InventoryValuation {
  totalMarketValue: number;
  totalBookValue: number;
  appreciationDepreciation: number;
  averageValuePerCategory: {
    categoryName: string;
    marketValue: number;
    bookValue: number;
  }[];
  valuationMethod: ValuationMethod;
  lastValuationDate: string;
  nextValuationDue: string;
}

interface InventoryDiscrepancy {
  discrepancyId: string;
  location: string;
  category: string;
  expectedCount: number;
  actualCount: number;
  difference: number;
  discrepancyType: DiscrepancyType;
  possibleCauses: string[];
  resolution: string;
  resolved: boolean;
  reportedBy: string;
  reportedDate: string;
}

interface AnimalStatus {
  status: string;
  count: number;
  percentage: number;
}

interface ReportPeriod {
  startDate: string;
  endDate: string;
  type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'custom';
}

type InventoryReportType = 
  | 'full_inventory' 
  | 'category_analysis' 
  | 'location_audit' 
  | 'movement_tracking' 
  | 'valuation_report' 
  | 'discrepancy_analysis'
  | 'turnover_analysis';

type ReportStatus = 'draft' | 'active' | 'archived' | 'processing';
type MovementType = 'acquisition' | 'sale' | 'transfer' | 'death' | 'birth' | 'other';
type ValuationMethod = 'market_price' | 'book_value' | 'weighted_average' | 'fifo' | 'lifo';
type DiscrepancyType = 'missing' | 'extra' | 'misclassified' | 'location_error';

// ===================================================================
// SERVICIO DE REPORTES DE INVENTARIO
// ===================================================================

class InventoryReportsService {
  // Obtener todos los reportes
  static async getAllReports(filters?: {
    search?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<{reports: InventoryReport[], total: number}> {
    try {
      const response = await ApiService.get<{reports: InventoryReport[], total: number, pagination: any}>(
        '/reports/inventory',
        filters
      );
      return {
        reports: response.reports || [],
        total: response.total || 0
      };
    } catch (error) {
      console.error('Error obteniendo reportes:', error);
      throw error;
    }
  }

  // Obtener un reporte específico
  static async getReport(id: string): Promise<InventoryReport> {
    try {
      return await ApiService.get<InventoryReport>(`/reports/inventory/${id}`);
    } catch (error) {
      console.error('Error obteniendo reporte:', error);
      throw error;
    }
  }

  // Crear nuevo reporte
  static async createReport(reportData: Omit<InventoryReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryReport> {
    try {
      return await ApiService.post<InventoryReport>('/reports/inventory', reportData);
    } catch (error) {
      console.error('Error creando reporte:', error);
      throw error;
    }
  }

  // Actualizar reporte existente
  static async updateReport(id: string, reportData: Partial<InventoryReport>): Promise<InventoryReport> {
    try {
      return await ApiService.put<InventoryReport>(`/reports/inventory/${id}`, reportData);
    } catch (error) {
      console.error('Error actualizando reporte:', error);
      throw error;
    }
  }

  // Eliminar reporte
  static async deleteReport(id: string): Promise<boolean> {
    try {
      await ApiService.delete(`/reports/inventory/${id}`);
      return true;
    } catch (error) {
      console.error('Error eliminando reporte:', error);
      throw error;
    }
  }

  // Generar reporte automático
  static async generateReport(type: InventoryReportType, options: {
    startDate: string;
    endDate: string;
    location?: string;
    includeDetails?: boolean;
  }): Promise<InventoryReport> {
    try {
      return await ApiService.post<InventoryReport>('/reports/inventory/generate', {
        reportType: type,
        ...options
      });
    } catch (error) {
      console.error('Error generando reporte:', error);
      throw error;
    }
  }

  // Exportar reporte
  static async exportReport(id: string, format: 'pdf' | 'excel' | 'csv'): Promise<{downloadUrl: string}> {
    try {
      return await ApiService.post<{downloadUrl: string}>(`/reports/inventory/${id}/export`, {
        format
      });
    } catch (error) {
      console.error('Error exportando reporte:', error);
      throw error;
    }
  }

  // Obtener estadísticas del dashboard
  static async getDashboardStats(timeRange: string = '30d'): Promise<{
    totalReports: number;
    activeReports: number;
    totalAnimals: number;
    totalValue: number;
    accuracyRate: number;
    recentActivity: any[];
  }> {
    try {
      return await ApiService.get<any>('/inventory/dashboard', { timeRange });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// ===================================================================
// COMPONENTE PRINCIPAL ACTUALIZADO
// ===================================================================

// Función de utilidad para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Props de los componentes
interface InventoryReportsProps {
  className?: string;
}

// Hook personalizado para manejar estado de la API
const useApiState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);

  const executeAsync = async <T,>(
    apiCall: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: ApiError) => void
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido';
      setError(errorMessage);
      onError?.(err);
      console.error('Error en API:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    const isConnected = await ApiService.testConnection();
    setConnected(isConnected);
    return isConnected;
  };

  return { loading, error, connected, executeAsync, testConnection, setError };
};

// Configuración de tipos de reporte
const REPORT_TYPE_CONFIG = {
  full_inventory: {
    label: 'Inventario Completo',
    icon: <Package className="w-4 h-4" />,
    color: '#2d6f51'
  },
  category_analysis: {
    label: 'Análisis por Categoría',
    icon: <BarChart3 className="w-4 h-4" />,
    color: '#4e9c75'
  },
  location_audit: {
    label: 'Auditoría por Ubicación',
    icon: <MapPin className="w-4 h-4" />,
    color: '#519a7c'
  },
  movement_tracking: {
    label: 'Seguimiento de Movimientos',
    icon: <TrendingUp className="w-4 h-4" />,
    color: '#3ca373'
  },
  valuation_report: {
    label: 'Reporte de Valuación',
    icon: <DollarSign className="w-4 h-4" />,
    color: '#f4ac3a'
  },
  discrepancy_analysis: {
    label: 'Análisis de Discrepancias',
    icon: <AlertCircle className="w-4 h-4" />,
    color: '#e74c3c'
  },
  turnover_analysis: {
    label: 'Análisis de Rotación',
    icon: <Target className="w-4 h-4" />,
    color: '#2e8b57'
  }
};

// Componente de indicador de conectividad
const ConnectionIndicator: React.FC<{ connected: boolean | null, onRetry: () => void }> = ({ connected, onRetry }) => {
  if (connected === null) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm",
      connected 
        ? "bg-green-100 text-green-800 border border-green-200" 
        : "bg-red-100 text-red-800 border border-red-200"
    )}>
      {connected ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Conectado</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Sin conexión</span>
          <button
            onClick={onRetry}
            className="ml-2 px-2 py-1 bg-red-200 hover:bg-red-300 rounded transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </>
      )}
    </div>
  );
};

// Componente principal
export const InventoryReports: React.FC<InventoryReportsProps> = ({ className }) => {
  // Estados principales
  const [reports, setReports] = useState<InventoryReport[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Estados de filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [pageSize] = useState(10);

  // Hook de API
  const { loading, error, connected, executeAsync, testConnection } = useApiState();

  // Cargar reportes desde la API
  const loadReports = async (page = 1) => {
    const filters = {
      search: searchTerm || undefined,
      type: filterType !== 'all' ? filterType : undefined,
      status: filterStatus !== 'all' ? filterStatus : undefined,
      limit: pageSize,
      offset: (page - 1) * pageSize
    };

    await executeAsync(
      () => InventoryReportsService.getAllReports(filters),
      (data) => {
        setReports(data.reports);
        setTotalReports(data.total);
        setCurrentPage(page);
      },
      (error) => {
        console.error('Error cargando reportes:', error);
        setReports([]);
      }
    );
  };

  // ===================================================================
  // FUNCIONES PARA MANEJAR REPORTES (CORREGIDAS)
  // ===================================================================

  // Manejar edición de reporte
  const handleEditReport = async (report: InventoryReport) => {
    try {
      // Por ahora mostrar modal o redirigir a página de edición
      console.log('Editando reporte:', report.id);
      alert(`Editando reporte: ${report.title}\n\nEsta función redirigirá a la página de edición.`);
      
      // En una implementación real, podrías:
      // - Abrir un modal de edición
      // - Redirigir a una página de edición: router.push(`/reports/edit/${report.id}`)
      // - Cargar datos del reporte para edición
      
    } catch (error) {
      console.error('Error al iniciar edición:', error);
    }
  };

  // Manejar visualización de reporte
  const handleViewReport = async (report: InventoryReport) => {
    try {
      console.log('Visualizando reporte:', report.id);
      
      
    } catch (error) {
      console.error('Error al cargar detalles del reporte:', error);
    }
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const initializeData = async () => {
      await testConnection();
      await loadReports(1);
    };
    
    initializeData();
  }, []);

  // Efecto para recargar cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadReports(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterType, filterStatus]);

  // Eliminar reporte
  const handleDeleteReport = async (reportId: string) => {
    await executeAsync(
      () => InventoryReportsService.deleteReport(reportId),
      () => {
        setDeleteConfirm(null);
        loadReports(currentPage);
      }
    );
  };

  // Descargar reporte
  const handleDownloadReport = async (report: InventoryReport, format: 'pdf' | 'excel' | 'csv') => {
    await executeAsync(
      () => InventoryReportsService.exportReport(report.id, format),
      (data) => {
        // Crear enlace de descarga
        const link = document.createElement('a');
        link.href = data.downloadUrl;
        link.download = `${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    );
  };

  // Obtener color del estado
  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener etiqueta del estado
  const getStatusLabel = (status: ReportStatus) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'draft': return 'Borrador';
      case 'archived': return 'Archivado';
      case 'processing': return 'Procesando';
      default: return status;
    }
  };

  // Calcular número total de páginas
  const totalPages = Math.ceil(totalReports / pageSize);

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6", className)}>
      <div className="max-w-full mx-auto">
        
        {/* Indicador de conectividad */}
        <ConnectionIndicator 
          connected={connected} 
          onRetry={testConnection}
        />

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6 sm:mb-8"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Reportes de Inventario Ganadero
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Gestiona y analiza el inventario, valuación y movimientos del ganado
            </p>
            {error && (
              <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                  <button
                    onClick={() => loadReports(currentPage)}
                    className="ml-auto text-red-600 hover:text-red-800"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => alert('Función de crear reporte en desarrollo')}
            disabled={loading || !connected}
            className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Nuevo Reporte de Inventario</span>
            <span className="sm:hidden">Nuevo Reporte</span>
          </button>
        </motion.div>

        {/* Filtros y búsqueda */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar reportes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors text-sm"
              />
            </div>

            {/* Filtro por tipo */}
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors text-sm"
              >
                <option value="all">Todos los tipos</option>
                {Object.entries(REPORT_TYPE_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por estado */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d6f51] focus:border-transparent transition-colors text-sm"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="draft">Borrador</option>
                <option value="archived">Archivado</option>
                <option value="processing">Procesando</option>
              </select>
            </div>

            {/* Recargar datos */}
            <div>
              <button
                onClick={() => loadReports(currentPage)}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                <span className="hidden sm:inline">Recargar</span>
              </button>
            </div>

            {/* Contador de resultados */}
            <div className="flex items-center justify-center sm:justify-start text-gray-600">
              <Filter className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {reports.length} de {totalReports} reportes
              </span>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#2d6f51]" />
              <span className="text-gray-600">Cargando reportes...</span>
            </div>
          </div>
        )}

        {/* Lista de reportes */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden"
          >
            {reports.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  No se encontraron reportes de inventario
                </h3>
                <p className="text-gray-600 mb-6">
                  {totalReports === 0 
                    ? 'Crea tu primer reporte de inventario ganadero'
                    : 'Ajusta los filtros o términos de búsqueda'
                  }
                </p>
                {totalReports === 0 && (
                  <button
                    onClick={() => alert('Función de crear reporte en desarrollo')}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200"
                  >
                    <Plus className="w-5 h-5" />
                    Crear Primer Reporte
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                {/* Vista de tabla para pantallas grandes */}
                <div className="hidden lg:block">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-medium">Reporte</th>
                        <th className="px-6 py-4 text-left text-sm font-medium">Tipo</th>
                        <th className="px-6 py-4 text-left text-sm font-medium">Ubicación</th>
                        <th className="px-6 py-4 text-left text-sm font-medium">Auditor</th>
                        <th className="px-6 py-4 text-left text-sm font-medium">Período</th>
                        <th className="px-6 py-4 text-left text-sm font-medium">Estado</th>
                        <th className="px-6 py-4 text-left text-sm font-medium">Métricas Clave</th>
                        <th className="px-6 py-4 text-left text-sm font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reports.map((report, index) => (
                        <motion.tr
                          key={report.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <h4 className="font-medium text-gray-800">{report.title}</h4>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {report.description}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Por {report.createdBy} • {new Date(report.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div 
                                className="p-2 rounded-lg"
                                style={{ 
                                  backgroundColor: `${REPORT_TYPE_CONFIG[report.reportType].color}20`,
                                  color: REPORT_TYPE_CONFIG[report.reportType].color
                                }}
                              >
                                {REPORT_TYPE_CONFIG[report.reportType].icon}
                              </div>
                              <span className="text-sm font-medium">
                                {REPORT_TYPE_CONFIG[report.reportType].label}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{report.location}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Users className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{report.auditor}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              <div className="flex items-center gap-1 mb-1">
                                <Calendar className="w-3 h-3 text-gray-400" />
                                <span className="capitalize">{report.period.type}</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "inline-flex px-2 py-1 text-xs font-medium rounded-full",
                              getStatusColor(report.status)
                            )}>
                              {getStatusLabel(report.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Total:</span>
                                <span className="font-medium">{report.inventoryMetrics.totalAnimals}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Activos:</span>
                                <span className="font-medium text-green-600">{report.inventoryMetrics.activeAnimals}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Valor:</span>
                                <span className="font-medium">${(report.inventoryMetrics.totalValue / 1000).toFixed(0)}K</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Precisión:</span>
                                <span className="font-medium">{report.inventoryMetrics.accuracyRate.toFixed(1)}%</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditReport(report)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Editar reporte"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleViewReport(report)}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Ver reporte"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <div className="relative group">
                                <button
                                  className="p-2 text-[#2d6f51] hover:bg-green-100 rounded-lg transition-colors"
                                  title="Descargar reporte"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                  <button
                                    onClick={() => handleDownloadReport(report, 'pdf')}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <FileText className="w-4 h-4" />
                                    PDF
                                  </button>
                                  <button
                                    onClick={() => handleDownloadReport(report, 'excel')}
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <FileSpreadsheet className="w-4 h-4" />
                                    Excel
                                  </button>
                                </div>
                              </div>
                              <button
                                onClick={() => setDeleteConfirm(report.id)}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Eliminar reporte"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Vista de cards para pantallas pequeñas */}
                <div className="lg:hidden p-4 space-y-4">
                  {reports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-1">{report.title}</h4>
                          <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                          <div className="flex items-center gap-2 mb-2">
                            <div 
                              className="p-1 rounded"
                              style={{ 
                                backgroundColor: `${REPORT_TYPE_CONFIG[report.reportType].color}20`,
                                color: REPORT_TYPE_CONFIG[report.reportType].color
                              }}
                            >
                              {REPORT_TYPE_CONFIG[report.reportType].icon}
                            </div>
                            <span className="text-xs font-medium">
                              {REPORT_TYPE_CONFIG[report.reportType].label}
                            </span>
                            <span className={cn(
                              "inline-flex px-2 py-1 text-xs font-medium rounded-full ml-auto",
                              getStatusColor(report.status)
                            )}>
                              {getStatusLabel(report.status)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <div className="flex items-center gap-1 text-gray-600 mb-1">
                            <MapPin className="w-3 h-3" />
                            <span className="text-xs">Ubicación</span>
                          </div>
                          <div className="font-medium text-gray-800">{report.location}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-gray-600 mb-1">
                            <Users className="w-3 h-3" />
                            <span className="text-xs">Auditor</span>
                          </div>
                          <div className="font-medium text-gray-800">{report.auditor}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-gray-600 mb-1">
                            <Package className="w-3 h-3" />
                            <span className="text-xs">Total Animales</span>
                          </div>
                          <div className="font-medium text-gray-800">{report.inventoryMetrics.totalAnimals}</div>
                        </div>
                        <div>
                          <div className="flex items-center gap-1 text-gray-600 mb-1">
                            <DollarSign className="w-3 h-3" />
                            <span className="text-xs">Valor Total</span>
                          </div>
                          <div className="font-medium text-gray-800">${(report.inventoryMetrics.totalValue / 1000).toFixed(0)}K</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <div className="text-xs text-gray-500">
                          {new Date(report.period.startDate).toLocaleDateString()} - {new Date(report.period.endDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditReport(report)}
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleViewReport(report)}
                            className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadReport(report, 'pdf')}
                            className="p-1.5 text-[#2d6f51] hover:bg-green-100 rounded transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(report.id)}
                            className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalReports)} de {totalReports} resultados
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadReports(currentPage - 1)}
                      disabled={currentPage === 1 || loading}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    {/* Páginas numéricas */}
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => loadReports(pageNum)}
                          disabled={loading}
                          className={cn(
                            "px-3 py-1 text-sm border rounded",
                            pageNum === currentPage
                              ? "bg-[#2d6f51] text-white border-[#2d6f51]"
                              : "border-gray-300 hover:bg-gray-100"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => loadReports(currentPage + 1)}
                      disabled={currentPage === totalPages || loading}
                      className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Confirmar Eliminación
                  </h3>
                  <p className="text-gray-600">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                ¿Estás seguro de que deseas eliminar este reporte de inventario? 
                Se perderán todos los datos de conteo y valuación asociados.
              </p>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDeleteReport(deleteConfirm)}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Eliminar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};