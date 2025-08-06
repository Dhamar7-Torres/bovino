import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  X,
  Save,
  Calendar,
  MapPin,
  Navigation,
  AlertCircle,
  RefreshCw,
  DollarSign,
  FileText,
  TrendingUp,
} from "lucide-react";

// Interfaces
interface IncomeRecord {
  id: string;
  date: string;
  description: string;
  category: "venta_ganado" | "productos_lacteos" | "servicios_veterinarios" | "otros";
  amount: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  animalId?: string;
  status: "completed" | "pending" | "cancelled";
  createdAt?: string;
  updatedAt?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
}

interface PaginatedResponse<T> {
  transactions: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Servicio API para Ingresos
class IncomeAPI {
  private static readonly BASE_URL = 'http://localhost:5000/api/finances';
  
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

  static async getIncomes(page = 1, limit = 50): Promise<ApiResponse<PaginatedResponse<IncomeRecord>>> {
    return this.makeRequest<ApiResponse<PaginatedResponse<IncomeRecord>>>(
      `/transactions?type=INCOME&page=${page}&limit=${limit}&sortBy=createdAt&sortOrder=DESC`
    );
  }

  static async createIncome(income: Omit<IncomeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<IncomeRecord>> {
    const transactionData = {
      type: 'INCOME',
      category: income.category.toUpperCase(),
      amount: income.amount,
      description: income.description,
      transactionDate: income.date,
      status: income.status.toUpperCase(),
      metadata: {
        location: income.location,
        animalId: income.animalId
      }
    };

    return this.makeRequest<ApiResponse<IncomeRecord>>('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  }

  static async updateIncome(id: string, income: Partial<IncomeRecord>): Promise<ApiResponse<IncomeRecord>> {
    const transactionData = {
      type: 'INCOME',
      category: income.category?.toUpperCase(),
      amount: income.amount,
      description: income.description,
      transactionDate: income.date,
      status: income.status?.toUpperCase(),
      metadata: {
        location: income.location,
        animalId: income.animalId
      }
    };

    return this.makeRequest<ApiResponse<IncomeRecord>>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  }

  static async deleteIncome(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<ApiResponse<void>>(`/transactions/${id}`, {
      method: 'DELETE',
    });
  }
}

const IncomeTracker: React.FC = () => {
  // Estados del componente
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IncomeRecord | null>(null);
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Estados para geolocalización
  const [currentCoordinates, setCurrentCoordinates] = useState<{lat: number, lng: number} | null>(null);

  // Formulario para nuevo/editar ingreso
  const [formData, setFormData] = useState({
    description: "",
    category: "venta_ganado" as IncomeRecord["category"],
    amount: "",
    date: new Date().toISOString().split('T')[0],
    address: "",
    animalId: "",
    status: "completed" as IncomeRecord["status"],
  });

  // Función para mostrar errores
  const showError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  // Función para cargar ingresos desde el backend
  const loadIncomes = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await IncomeAPI.getIncomes(page, pagination.limit);
      
      if (response.success && response.data) {
        // Transformar los datos del backend al formato del frontend
        const transformedIncomes = response.data.transactions.map((transaction: any) => ({
          id: transaction.id,
          date: transaction.transactionDate || transaction.date,
          description: transaction.description,
          category: transaction.category?.toLowerCase() || 'otros',
          amount: transaction.amount,
          status: transaction.status?.toLowerCase() || 'pending',
          location: transaction.metadata?.location || {
            lat: 17.9895,
            lng: -92.9475,
            address: 'Ubicación no especificada'
          },
          animalId: transaction.metadata?.animalId,
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
        }));

        setIncomeRecords(transformedIncomes);
        setPagination(response.data.pagination);
      } else {
        showError(response.message || 'Error al cargar los ingresos');
      }
    } catch (error) {
      console.error('Error cargando ingresos:', error);
      showError(error instanceof Error ? error.message : 'Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.limit]);

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      showError("Tu navegador no soporta geolocalización");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoordinates({ lat: latitude, lng: longitude });

        try {
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = `${data.locality || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`.replace(/^,\s*|,\s*$/g, '');
            handleFormChange("address", address || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
          } else {
            handleFormChange("address", `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
          }
        } catch (error) {
          handleFormChange("address", `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
        }

        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = "Error obteniendo ubicación";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado. Por favor permite el acceso a tu ubicación.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Información de ubicación no disponible.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado obteniendo ubicación.";
            break;
        }
        
        showError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const resetForm = () => {
    setFormData({
      description: "",
      category: "venta_ganado",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      address: "",
      animalId: "",
      status: "completed",
    });
    setCurrentCoordinates(null);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Función para agregar ingreso
  const handleAddIncome = async () => {
    if (!formData.description || !formData.amount) {
      showError("Por favor complete todos los campos obligatorios");
      return;
    }

    try {
      setIsActionLoading(true);
      
      const newIncome = {
        date: formData.date,
        description: formData.description,
        category: formData.category,
        amount: parseFloat(formData.amount),
        location: {
          lat: currentCoordinates?.lat || 17.9895,
          lng: currentCoordinates?.lng || -92.9475,
          address: formData.address || 'Ubicación no especificada',
        },
        animalId: formData.animalId || undefined,
        status: formData.status,
      };

      const response = await IncomeAPI.createIncome(newIncome);
      
      if (response.success) {
        setShowAddModal(false);
        resetForm();
        await loadIncomes(); // Recargar la lista
      } else {
        showError(response.message || 'Error al crear el ingreso');
      }
    } catch (error) {
      console.error('Error creando ingreso:', error);
      showError(error instanceof Error ? error.message : 'Error al crear el ingreso');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Función para editar ingreso
  const handleEditIncome = async () => {
    if (!selectedRecord || !formData.description || !formData.amount) {
      showError("Por favor complete todos los campos obligatorios");
      return;
    }

    try {
      setIsActionLoading(true);
      
      const updatedIncome = {
        date: formData.date,
        description: formData.description,
        category: formData.category,
        amount: parseFloat(formData.amount),
        status: formData.status,
        location: {
          lat: currentCoordinates?.lat || selectedRecord.location.lat,
          lng: currentCoordinates?.lng || selectedRecord.location.lng,
          address: formData.address,
        },
        animalId: formData.animalId || undefined,
      };

      const response = await IncomeAPI.updateIncome(selectedRecord.id, updatedIncome);
      
      if (response.success) {
        setShowEditModal(false);
        setSelectedRecord(null);
        resetForm();
        await loadIncomes(); // Recargar la lista
      } else {
        showError(response.message || 'Error al actualizar el ingreso');
      }
    } catch (error) {
      console.error('Error actualizando ingreso:', error);
      showError(error instanceof Error ? error.message : 'Error al actualizar el ingreso');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Función para eliminar ingreso
  const handleDeleteIncome = async () => {
    if (!selectedRecord) return;

    try {
      setIsActionLoading(true);
      
      const response = await IncomeAPI.deleteIncome(selectedRecord.id);
      
      if (response.success) {
        setShowDeleteModal(false);
        setSelectedRecord(null);
        await loadIncomes(); // Recargar la lista
      } else {
        showError(response.message || 'Error al eliminar el ingreso');
      }
    } catch (error) {
      console.error('Error eliminando ingreso:', error);
      showError(error instanceof Error ? error.message : 'Error al eliminar el ingreso');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleViewRecord = (record: IncomeRecord) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleEditRecord = (record: IncomeRecord) => {
    setSelectedRecord(record);
    setFormData({
      description: record.description,
      category: record.category,
      amount: record.amount.toString(),
      date: record.date,
      address: record.location.address,
      animalId: record.animalId || "",
      status: record.status,
    });
    setCurrentCoordinates({ lat: record.location.lat, lng: record.location.lng });
    setShowEditModal(true);
  };

  const handleExport = () => {
    try {
      const csvContent = [
        "Fecha,Descripción,Categoría,Monto,Ubicación,Estado",
        ...incomeRecords.map(record => 
          `${record.date},"${record.description}","${getCategoryName(record.category)}",${record.amount},"${record.location.address}","${getStatusText(record.status)}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ingresos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error al exportar:", error);
      showError("Error al exportar los datos");
    }
  };

  const handleRefresh = () => {
    loadIncomes(pagination.page);
  };

  // Effect para cargar datos iniciales
  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  // Función para formatear números a moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Función para formatear fechas
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Obtener el nombre de la categoría
  const getCategoryName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      venta_ganado: "Venta de Ganado",
      productos_lacteos: "Productos Lácteos",
      servicios_veterinarios: "Servicios Veterinarios",
      otros: "Otros",
    };
    return categoryMap[category.toLowerCase()] || category;
  };

  // Obtener el color del estado
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      completed: "bg-green-500",
      pending: "bg-yellow-500",
      cancelled: "bg-red-500",
    };
    return statusColors[status.toLowerCase()] || "bg-gray-500";
  };

  const getStatusText = (status: string): string => {
    const statusText: Record<string, string> = {
      completed: "Completado",
      pending: "Pendiente",
      cancelled: "Cancelado",
    };
    return statusText[status.toLowerCase()] || status;
  };

  // Calcular total de ingresos
  const totalIncome = incomeRecords.reduce((sum, record) => sum + record.amount, 0);

  // Loading component
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-800 via-green-600 to-emerald-500 p-6">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white text-lg font-medium">Conectando con el servidor...</p>
        <p className="text-green-100 text-sm mt-2">Cargando ingresos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-600 to-emerald-500 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header del Seguimiento de Ingresos */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 flex items-center">
              <TrendingUp className="w-10 h-10 mr-3" />
              Seguimiento de Ingresos
            </h1>
            <p className="text-white/80 text-lg">
              Control detallado de todos los ingresos del rancho
            </p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="bg-white/20 backdrop-blur-md rounded-lg px-4 py-2 text-white text-sm border border-white/30">
                🔗 Conectado al Backend | {pagination.total} registros totales
              </div>
              <div className="bg-green-700/50 backdrop-blur-md rounded-lg px-4 py-2 text-white text-sm border border-green-400/30">
                💰 Total: {formatCurrency(totalIncome)}
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-300 shadow-lg backdrop-blur-sm hover:scale-105"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Ingreso
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-300 shadow-lg backdrop-blur-sm hover:scale-105"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar
            </button>
          </div>
        </div>

        {/* Tabla de registros de ingresos */}
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Registros de Ingresos 
            </h3>
            <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Página {pagination.page} de {pagination.totalPages}
            </div>
          </div>

          {incomeRecords.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No hay ingresos registrados</p>
              <p className="text-gray-400 text-sm">Agrega tu primer ingreso para comenzar</p>
              <div className="mt-4 text-xs text-gray-400 bg-gray-50 p-3 rounded-lg">
                <p>🔧 Verificando conexión con: http://localhost:5000/api/finances/transactions</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">
                      Descripción
                    </th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">
                      Categoría
                    </th>
                    <th className="text-right py-3 px-4 text-gray-700 font-medium">
                      Monto
                    </th>
                    <th className="text-center py-3 px-4 text-gray-700 font-medium">
                      Estado
                    </th>
                    <th className="text-center py-3 px-4 text-gray-700 font-medium">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incomeRecords.map((record) => (
                    <tr
                      key={record.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="py-4 px-4 text-gray-600">
                        {formatDate(record.date)}
                      </td>
                      <td className="py-4 px-4 text-gray-900 font-medium">
                        {record.description}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        {getCategoryName(record.category)}
                      </td>
                      <td className="py-4 px-4 text-right text-green-700 font-bold text-lg">
                        {formatCurrency(record.amount)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span
                            className={`inline-block w-3 h-3 rounded-full ${getStatusColor(
                              record.status
                            )}`}
                          ></span>
                          <span className="text-gray-600 text-sm">{getStatusText(record.status)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleViewRecord(record)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200 hover:scale-110"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleEditRecord(record)}
                            className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors duration-200 hover:scale-110"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedRecord(record);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 hover:scale-110"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => loadIncomes(pagination.page - 1)}
                disabled={!pagination.hasPrev || isLoading}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors hover:scale-105"
              >
                ← Anterior
              </button>
              
              <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                Página {pagination.page} de {pagination.totalPages} ({pagination.total} total)
              </span>
              
              <button
                onClick={() => loadIncomes(pagination.page + 1)}
                disabled={!pagination.hasNext || isLoading}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors hover:scale-105"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal para agregar ingreso */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-green-50">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Plus className="w-6 h-6 mr-2 text-green-600" />
                Agregar Nuevo Ingreso al Backend
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Descripción *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      placeholder="Descripción del ingreso"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleFormChange("category", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    >
                      <option value="venta_ganado">Venta de Ganado</option>
                      <option value="productos_lacteos">Productos Lácteos</option>
                      <option value="servicios_veterinarios">Servicios Veterinarios</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Monto *
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleFormChange("amount", e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange("date", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Ubicación
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleFormChange("address", e.target.value)}
                        placeholder="Dirección o ubicación"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 hover:scale-105"
                        title="Obtener ubicación actual"
                      >
                        {isGettingLocation ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Navigation className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {currentCoordinates && (
                      <p className="text-xs text-gray-500 mt-1">
                        📍 Coordenadas: {currentCoordinates.lat.toFixed(6)}, {currentCoordinates.lng.toFixed(6)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Animal (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.animalId}
                      onChange={(e) => handleFormChange("animalId", e.target.value)}
                      placeholder="ID del animal relacionado"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFormChange("status", e.target.value as IncomeRecord["status"])}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                    >
                      <option value="completed">Completado</option>
                      <option value="pending">Pendiente</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowAddModal(false);
                      resetForm();
                    }}
                    disabled={isActionLoading}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddIncome}
                    disabled={isActionLoading}
                    className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors hover:scale-105"
                  >
                    {isActionLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isActionLoading ? 'Guardando en Backend...' : 'Guardar en Backend'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar ingreso */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-yellow-50">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Edit className="w-6 h-6 mr-2 text-yellow-600" />
                Editar Ingreso en Backend
              </h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedRecord(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="w-4 h-4 inline mr-2" />
                      Descripción *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => handleFormChange("description", e.target.value)}
                      placeholder="Descripción del ingreso"
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleFormChange("category", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    >
                      <option value="venta_ganado">Venta de Ganado</option>
                      <option value="productos_lacteos">Productos Lácteos</option>
                      <option value="servicios_veterinarios">Servicios Veterinarios</option>
                      <option value="otros">Otros</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="w-4 h-4 inline mr-2" />
                      Monto *
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => handleFormChange("amount", e.target.value)}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleFormChange("date", e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Ubicación
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => handleFormChange("address", e.target.value)}
                        placeholder="Dirección o ubicación"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 hover:scale-105"
                        title="Obtener ubicación actual"
                      >
                        {isGettingLocation ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Navigation className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {currentCoordinates && (
                      <p className="text-xs text-gray-500 mt-1">
                        📍 Coordenadas: {currentCoordinates.lat.toFixed(6)}, {currentCoordinates.lng.toFixed(6)}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ID Animal (opcional)
                    </label>
                    <input
                      type="text"
                      value={formData.animalId}
                      onChange={(e) => handleFormChange("animalId", e.target.value)}
                      placeholder="ID del animal relacionado"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleFormChange("status", e.target.value as IncomeRecord["status"])}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
                    >
                      <option value="completed">Completado</option>
                      <option value="pending">Pendiente</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedRecord(null);
                      resetForm();
                    }}
                    disabled={isActionLoading}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleEditIncome}
                    disabled={isActionLoading}
                    className="flex items-center px-6 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400 text-white rounded-lg transition-colors hover:scale-105"
                  >
                    {isActionLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isActionLoading ? 'Actualizando en Backend...' : 'Actualizar en Backend'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles */}
      {showViewModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-blue-600" />
                Detalles del Ingreso (Backend)
              </h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedRecord(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha
                    </label>
                    <div className="flex items-center text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                      {formatDate(selectedRecord.date)}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría
                    </label>
                    <div className="text-gray-900">
                      {getCategoryName(selectedRecord.category)}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Monto
                    </label>
                    <div className="text-green-700 font-bold text-xl">
                      {formatCurrency(selectedRecord.amount)}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <div className="flex items-center">
                      <span
                        className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColor(
                          selectedRecord.status
                        )}`}
                      ></span>
                      {getStatusText(selectedRecord.status)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <div className="text-gray-900">
                    {selectedRecord.description}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <div className="flex items-center text-gray-900">
                    <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                    {selectedRecord.location.address}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    📍 Coordenadas: {selectedRecord.location.lat.toFixed(6)}, {selectedRecord.location.lng.toFixed(6)}
                  </p>
                </div>

                {selectedRecord.animalId && (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Animal Relacionado
                    </label>
                    <div className="text-gray-900">
                      {selectedRecord.animalId}
                    </div>
                  </div>
                )}

                {/* Información del backend */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-700 mb-2">🔗 Información del Backend</h4>
                  <div className="text-sm text-blue-600 space-y-1">
                    <p><strong>ID:</strong> {selectedRecord.id}</p>
                    {selectedRecord.createdAt && <p><strong>Creado:</strong> {new Date(selectedRecord.createdAt).toLocaleString('es-MX')}</p>}
                    {selectedRecord.updatedAt && <p><strong>Actualizado:</strong> {new Date(selectedRecord.updatedAt).toLocaleString('es-MX')}</p>}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      handleEditRecord(selectedRecord);
                    }}
                    className="flex items-center px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors hover:scale-105"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar en Backend
                  </button>
                  <button
                    onClick={() => {
                      setShowViewModal(false);
                      setSelectedRecord(null);
                    }}
                    className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-red-50">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                <Trash2 className="w-6 h-6 mr-2 text-red-600" />
                Confirmar Eliminación
              </h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedRecord(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">¿Estás seguro?</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Esta acción no se puede deshacer. El ingreso será eliminado permanentemente.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg text-left border border-gray-200">
                  <p className="text-sm text-gray-700">
                    <strong>Descripción:</strong> {selectedRecord.description}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Monto:</strong> {formatCurrency(selectedRecord.amount)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Fecha:</strong> {formatDate(selectedRecord.date)}
                  </p>
                  <p className="text-sm text-blue-600 mt-2">
                    <strong>🔗 ID Backend:</strong> {selectedRecord.id}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedRecord(null);
                  }}
                  disabled={isActionLoading}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteIncome}
                  disabled={isActionLoading}
                  className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 transition-colors hover:scale-105"
                >
                  {isActionLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {isActionLoading ? 'Eliminando del Backend...' : 'Eliminar del Backend'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IncomeTracker;