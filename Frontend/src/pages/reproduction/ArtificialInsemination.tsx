import React, { useState, useEffect, useCallback } from "react";
import {
  Syringe,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Heart,
  User,
  TestTube,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Activity,
  CheckCircle,
  AlertTriangle,
  Target,
  X,
  Save,
  ArrowLeft,
  Navigation,
  Loader,
  Wifi,
  WifiOff,
} from "lucide-react";

// Interfaces básicas
interface InseminationRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalEarTag: string;
  technicianName: string;
  date: string;
  time: string;
  method: "cervical" | "intrauterine" | "embryo_transfer";
  status: "scheduled" | "completed" | "failed" | "cancelled";
  semenBatch: string;
  semenProvider: string;
  cost: number;
  notes: string;
  result?: "pregnant" | "not_pregnant" | "pending";
  location: string;
}

// Configuración de la API
const API_BASE_URL = "http://localhost:5000/api";

// Servicio de API
class InseminationService {
  static async getAllRecords(): Promise<InseminationRecord[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/inseminations`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching records:", error);
      throw error;
    }
  }

  static async createRecord(record: Omit<InseminationRecord, "id">): Promise<InseminationRecord> {
    try {
      const response = await fetch(`${API_BASE_URL}/inseminations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(record),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating record:", error);
      throw error;
    }
  }

  static async updateRecord(id: string, record: Partial<InseminationRecord>): Promise<InseminationRecord> {
    try {
      const response = await fetch(`${API_BASE_URL}/inseminations/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(record),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating record:", error);
      throw error;
    }
  }

  static async deleteRecord(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/inseminations/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      throw error;
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

const ArtificialInsemination: React.FC = () => {
  const [records, setRecords] = useState<InseminationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<InseminationRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<InseminationRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<InseminationRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para geolocalización
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  } | null>(null);
  
  const [formData, setFormData] = useState<Partial<InseminationRecord>>({
    method: "cervical",
    status: "scheduled",
    cost: 0,
    notes: "",
    date: new Date().toISOString().split('T')[0],
    time: "08:00",
  });

  // Función para probar la conexión del backend
  const testBackendConnection = async () => {
    try {
      const connected = await InseminationService.testConnection();
      setIsConnected(connected);
      setConnectionError(connected ? null : "No se pudo conectar al servidor backend");
      return connected;
    } catch (error) {
      setIsConnected(false);
      setConnectionError("Error de conexión con el servidor");
      return false;
    }
  };

  // Función para cargar datos del backend
  const loadRecords = async () => {
    try {
      setIsLoading(true);
      setConnectionError(null);
      
      const data = await InseminationService.getAllRecords();
      setRecords(data);
      setIsConnected(true);
    } catch (error: any) {
      console.error("Error loading records:", error);
      setConnectionError(error.message || "Error al cargar los registros");
      setIsConnected(false);
      setRecords([]); // Limpiar registros en caso de error
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener ubicación actual
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("La geolocalización no es compatible con este navegador");
      setIsGettingLocation(false);
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          }
        );
      });

      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`
        );
        const data = await response.json();
        
        const address = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        const locationData = {
          lat: latitude,
          lng: longitude,
          address: address,
        };

        setCurrentLocation(locationData);
        setFormData(prev => ({
          ...prev,
          location: address,
        }));

      } catch (geocodeError) {
        const locationData = {
          lat: latitude,
          lng: longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        };
        
        setCurrentLocation(locationData);
        setFormData(prev => ({
          ...prev,
          location: locationData.address,
        }));
      }

    } catch (error: any) {
      let errorMessage = "No se pudo obtener la ubicación";
      
      if (error.code) {
        switch (error.code) {
          case 1:
            errorMessage = "Permiso de ubicación denegado";
            break;
          case 2:
            errorMessage = "Ubicación no disponible";
            break;
          case 3:
            errorMessage = "Tiempo de espera agotado";
            break;
          default:
            errorMessage = "Error desconocido al obtener ubicación";
        }
      }
      
      setLocationError(errorMessage);
    } finally {
      setIsGettingLocation(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    const initializeApp = async () => {
      await testBackendConnection();
      await loadRecords();
    };
    
    initializeApp();
  }, []);

  // Filtrar registros
  const filteredRecords = records.filter(record =>
    record.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.animalEarTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.technicianName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estadísticas
  const stats = {
    total: records.length,
    completed: records.filter(r => r.status === "completed").length,
    scheduled: records.filter(r => r.status === "scheduled").length,
    pregnant: records.filter(r => r.result === "pregnant").length,
    successRate: records.length > 0 ? Math.round((records.filter(r => r.result === "pregnant").length / records.filter(r => r.status === "completed").length) * 100) : 0,
  };

  // Validación del formulario
  const validateForm = () => {
    const required = ['animalId', 'animalName', 'animalEarTag', 'technicianName', 'date', 'time', 'semenBatch', 'semenProvider'];
    const missing = required.filter(field => !formData[field as keyof typeof formData]);
    
    if (missing.length > 0) {
      const fieldNames = {
        animalId: 'ID del Animal',
        animalName: 'Nombre del Animal',
        animalEarTag: 'Arete',
        technicianName: 'Técnico Responsable',
        date: 'Fecha',
        time: 'Hora',
        semenBatch: 'Lote de Semen',
        semenProvider: 'Proveedor'
      };
      
      const missingNames = missing.map(field => fieldNames[field as keyof typeof fieldNames]).join(', ');
      alert(`Por favor complete los siguientes campos obligatorios:\n\n${missingNames}`);
      return false;
    }
    
    return true;
  };

  // Funciones CRUD conectadas al backend
  const handleCreate = async () => {
    if (!validateForm()) return;
    
    try {
      setIsSubmitting(true);
      
      const newRecordData = {
        animalId: formData.animalId || "",
        animalName: formData.animalName || "",
        animalEarTag: formData.animalEarTag || "",
        technicianName: formData.technicianName || "",
        date: formData.date || "",
        time: formData.time || "",
        method: formData.method || "cervical",
        status: formData.status || "scheduled",
        semenBatch: formData.semenBatch || "",
        semenProvider: formData.semenProvider || "",
        cost: formData.cost || 0,
        notes: formData.notes || "",
        location: formData.location || "",
      };

      const createdRecord = await InseminationService.createRecord(newRecordData);
      
      // Actualizar la lista local
      setRecords(prev => [createdRecord, ...prev]);
      
      setShowForm(false);
      resetForm();
      
      showSuccessMessage(`Registro de "${createdRecord.animalName}" creado correctamente`);
    } catch (error: any) {
      console.error("Error creating record:", error);
      alert(`Error al crear el registro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!validateForm() || !editingRecord) return;
    
    try {
      setIsSubmitting(true);
      
      const updatedRecord = await InseminationService.updateRecord(editingRecord.id, formData);
      
      // Actualizar la lista local
      setRecords(prev => prev.map(r => r.id === editingRecord.id ? updatedRecord : r));
      
      // Actualizar el registro seleccionado si es el mismo que se está editando
      if (selectedRecord?.id === editingRecord.id) {
        setSelectedRecord(updatedRecord);
      }
      
      setEditingRecord(null);
      setShowForm(false);
      resetForm();
      
      showSuccessMessage(`Registro de "${updatedRecord.animalName}" actualizado correctamente`);
    } catch (error: any) {
      console.error("Error updating record:", error);
      alert(`Error al actualizar el registro: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    try {
      setIsDeleting(true);
      
      await InseminationService.deleteRecord(recordToDelete.id);
      
      // Actualizar la lista local
      setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
      
      // Cerrar modales si están abiertos
      if (selectedRecord?.id === recordToDelete.id) {
        setSelectedRecord(null);
      }
      if (editingRecord?.id === recordToDelete.id) {
        setEditingRecord(null);
        setShowForm(false);
      }
      
      setShowDeleteModal(false);
      
      showSuccessMessage(`Registro de "${recordToDelete.animalName}" eliminado correctamente`);
    } catch (error: any) {
      console.error("Error deleting record:", error);
      alert(`Error al eliminar el registro: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setRecordToDelete(null);
    }
  };

  // Función para mostrar mensajes de éxito
  const showSuccessMessage = (message: string) => {
    alert(`✅ ${message}`);
  };

  const handleDeleteClick = useCallback((record: InseminationRecord) => {
    console.log("🔴 CLICK en botón eliminar para:", record.id, record.animalName);
    setRecordToDelete(record);
    setShowDeleteModal(true);
  }, []);

  const resetForm = () => {
    setFormData({
      method: "cervical",
      status: "scheduled",
      cost: 0,
      notes: "",
      date: new Date().toISOString().split('T')[0],
      time: "08:00",
    });
    setCurrentLocation(null);
    setLocationError(null);
  };

  const openEditForm = (record: InseminationRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowForm(true);
  };

  // Función para reintentar conexión
  const retryConnection = async () => {
    await loadRecords();
  };

  // Funciones de estilo
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "scheduled": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed": return "bg-red-100 text-red-800 border-red-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getResultColor = (result?: string) => {
    switch (result) {
      case "pregnant": return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "not_pregnant": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Completada";
      case "scheduled": return "Programada";
      case "failed": return "Fallida";
      case "cancelled": return "Cancelada";
      default: return status;
    }
  };

  const getResultText = (result?: string) => {
    switch (result) {
      case "pregnant": return "Gestante";
      case "not_pregnant": return "No Gestante";
      case "pending": return "Pendiente";
      default: return "Pendiente";
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case "cervical": return "Cervical";
      case "intrauterine": return "Intrauterino";
      case "embryo_transfer": return "Transferencia de Embriones";
      default: return method;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-amber-100 to-orange-400 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 font-medium">Conectando con el servidor...</p>
            <p className="text-sm text-gray-500">Puerto 5000</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-amber-100 to-orange-400 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Indicador de conexión */}
        <div className={`mb-4 p-3 rounded-xl flex items-center justify-between ${
          isConnected ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'
        }`}>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-green-600" />
                <span className="text-green-800 font-medium">Conectado al backend</span>
                <span className="text-green-600 text-sm">(localhost:5000)</span>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-600" />
                <span className="text-red-800 font-medium">Sin conexión al backend</span>
                <span className="text-red-600 text-sm">{connectionError}</span>
              </>
            )}
          </div>
          {!isConnected && (
            <button
              onClick={retryConnection}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <Activity className="w-4 h-4" />
              )}
              <span>Reintentar</span>
            </button>
          )}
        </div>

        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 mb-6 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                <Syringe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Inseminación Artificial
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestión completa de procedimientos de inseminación artificial
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setEditingRecord(null);
                  resetForm();
                  setShowForm(true);
                }}
                disabled={!isConnected}
                className="px-4 sm:px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-200 flex items-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Inseminación</span>
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {[
              { label: "Total", value: stats.total, icon: Activity, color: "text-blue-600" },
              { label: "Programadas", value: stats.scheduled, icon: Clock, color: "text-yellow-600" },
              { label: "Completadas", value: stats.completed, icon: CheckCircle, color: "text-green-600" },
              { label: "Gestantes", value: stats.pregnant, icon: Heart, color: "text-pink-600" },
              { label: "Éxito", value: `${stats.successRate}%`, icon: Target, color: "text-emerald-600" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Búsqueda */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por animal, arete o técnico..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
              </div>
              <span className="text-sm text-gray-600">
                {filteredRecords.length} de {records.length} registros
              </span>
            </div>
          </div>
        </div>

        {/* Mensaje de error de conexión si no hay datos */}
        {!isConnected && !isLoading && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20 mb-6">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <WifiOff className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sin conexión al servidor
              </h3>
              <p className="text-gray-600 mb-6">
                No se pudo conectar al backend en localhost:5000. Verifique que el servidor esté ejecutándose.
              </p>
              <button
                onClick={retryConnection}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Activity className="w-5 h-5" />
                <span>Reintentar Conexión</span>
              </button>
            </div>
          </div>
        )}

        {/* Lista de registros */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                {/* Header de la tarjeta */}
                <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{record.animalName}</h3>
                        <p className="text-white/80 text-sm">Arete: {record.animalEarTag}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                        {getStatusText(record.status)}
                      </span>
                      {record.result && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getResultColor(record.result)}`}>
                          {getResultText(record.result)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        Fecha:
                      </p>
                      <p className="text-gray-900">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Hora:
                      </p>
                      <p className="text-gray-900">{record.time}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Método:</p>
                      <p className="text-gray-900">{getMethodText(record.method)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        Técnico:
                      </p>
                      <p className="text-gray-900 truncate">{record.technicianName}</p>
                    </div>
                  </div>

                  {/* Información del semen */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <TestTube className="w-4 h-4 mr-2 text-green-600" />
                      Información del Semen
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Lote:</span> {record.semenBatch}</p>
                      <p><span className="text-gray-600">Proveedor:</span> {record.semenProvider}</p>
                    </div>
                  </div>

                  {/* Ubicación y costo */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{record.location}</span>
                    </div>
                    <span className="text-lg font-bold text-green-600 flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {record.cost.toLocaleString()}
                    </span>
                  </div>

                  {/* Notas */}
                  {record.notes && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{record.notes}</p>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedRecord(record)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-white rounded-lg transition-all duration-200"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openEditForm(record)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(record)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-lg transition-all duration-200"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mensaje cuando no hay registros */}
        {isConnected && filteredRecords.length === 0 && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Syringe className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron registros
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm ? "No hay registros que coincidan con tu búsqueda." : "No hay registros de inseminación artificial."}
              </p>
              <button
                onClick={() => {
                  setEditingRecord(null);
                  resetForm();
                  setShowForm(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-600 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Primera Inseminación</span>
              </button>
            </div>
          </div>
        )}

        {/* Modal de formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header del formulario */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Syringe className="w-6 h-6" />
                    <h2 className="text-xl font-bold">
                      {editingRecord ? "Editar Inseminación" : "Nueva Inseminación"}
                    </h2>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingRecord(null);
                      resetForm();
                    }}
                    disabled={isSubmitting}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenido del formulario */}
              <div className="p-6 space-y-6">
                {/* Información del animal */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-green-600" />
                    Información del Animal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ID del Animal *
                      </label>
                      <input
                        type="text"
                        value={formData.animalId || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, animalId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="COW-001"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Animal *
                      </label>
                      <input
                        type="text"
                        value={formData.animalName || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="Bella"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Arete *
                      </label>
                      <input
                        type="text"
                        value={formData.animalEarTag || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, animalEarTag: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="MX-001"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Detalles de la inseminación */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <Syringe className="w-5 h-5 mr-2 text-blue-600" />
                    Detalles de la Inseminación
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha *
                      </label>
                      <input
                        type="date"
                        value={formData.date || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hora *
                      </label>
                      <input
                        type="time"
                        value={formData.time || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Método *
                      </label>
                      <select
                        value={formData.method || "cervical"}
                        onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="cervical">Cervical</option>
                        <option value="intrauterine">Intrauterino</option>
                        <option value="embryo_transfer">Transferencia de Embriones</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado *
                      </label>
                      <select
                        value={formData.status || "scheduled"}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        required
                        disabled={isSubmitting}
                      >
                        <option value="scheduled">Programada</option>
                        <option value="completed">Completada</option>
                        <option value="failed">Fallida</option>
                        <option value="cancelled">Cancelada</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Técnico y ubicación */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Técnico Responsable *
                    </label>
                    <input
                      type="text"
                      value={formData.technicianName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, technicianName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      placeholder="Dr. García"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ubicación
                    </label>
                    <div className="space-y-2">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.location || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                          placeholder="Potrero Norte o ingresa manualmente"
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={isGettingLocation || isSubmitting}
                          className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center space-x-2 ${
                            isGettingLocation || isSubmitting
                              ? "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                              : "bg-blue-50 text-blue-600 border-blue-300 hover:bg-blue-100"
                          }`}
                          title="Obtener ubicación actual"
                        >
                          {isGettingLocation ? (
                            <Loader className="w-4 h-4 animate-spin" />
                          ) : (
                            <Navigation className="w-4 h-4" />
                          )}
                          <span className="text-sm">
                            {isGettingLocation ? "Obteniendo..." : "Mi ubicación"}
                          </span>
                        </button>
                      </div>
                      
                      {/* Mostrar ubicación actual si se obtuvo */}
                      {currentLocation && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="text-green-800 font-medium">Ubicación actual obtenida:</p>
                              <p className="text-green-700 mt-1">{currentLocation.address}</p>
                              <p className="text-green-600 text-xs mt-1">
                                Lat: {currentLocation.lat.toFixed(6)}, Lng: {currentLocation.lng.toFixed(6)}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* Mostrar error de ubicación si lo hay */}
                      {locationError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <div className="flex items-start space-x-2">
                            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm">
                              <p className="text-red-800 font-medium">Error de ubicación:</p>
                              <p className="text-red-700 mt-1">{locationError}</p>
                              <p className="text-red-600 text-xs mt-1">
                                Puedes ingresar la ubicación manualmente arriba.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información del semen */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 flex items-center">
                    <TestTube className="w-5 h-5 mr-2 text-yellow-600" />
                    Información del Semen
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lote de Semen *
                      </label>
                      <input
                        type="text"
                        value={formData.semenBatch || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, semenBatch: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="HOL-2025-001"
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proveedor *
                      </label>
                      <input
                        type="text"
                        value={formData.semenProvider || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, semenProvider: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                        placeholder="Genética Superior S.A."
                        required
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Costo y notas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Costo ($)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.cost || 0}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas
                    </label>
                    <textarea
                      value={formData.notes || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      rows={2}
                      placeholder="Observaciones adicionales..."
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-2xl">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingRecord(null);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                  className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={editingRecord ? handleUpdate : handleCreate}
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all duration-200 flex items-center space-x-2 shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>
                    {isSubmitting 
                      ? (editingRecord ? "Actualizando..." : "Guardando...") 
                      : (editingRecord ? "Actualizar" : "Guardar")}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedRecord(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header del modal */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedRecord.animalName}</h2>
                    <p className="text-white/80">Arete: {selectedRecord.animalEarTag}</p>
                  </div>
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Información General</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium text-gray-600">Fecha:</span> {new Date(selectedRecord.date).toLocaleDateString()}</p>
                      <p><span className="font-medium text-gray-600">Hora:</span> {selectedRecord.time}</p>
                      <p><span className="font-medium text-gray-600">Método:</span> {getMethodText(selectedRecord.method)}</p>
                      <p><span className="font-medium text-gray-600">Estado:</span> 
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(selectedRecord.status)}`}>
                          {getStatusText(selectedRecord.status)}
                        </span>
                      </p>
                      <p><span className="font-medium text-gray-600">Técnico:</span> {selectedRecord.technicianName}</p>
                      <p><span className="font-medium text-gray-600">Ubicación:</span> {selectedRecord.location}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Resultados</h3>
                    <div className="space-y-2">
                      {selectedRecord.result && (
                        <p><span className="font-medium text-gray-600">Resultado:</span>
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${getResultColor(selectedRecord.result)}`}>
                            {getResultText(selectedRecord.result)}
                          </span>
                        </p>
                      )}
                      <p><span className="font-medium text-gray-600">Costo:</span> ${selectedRecord.cost.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Información del semen */}
                <div className="bg-yellow-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Información del Semen</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium text-gray-600">Lote:</span> {selectedRecord.semenBatch}</p>
                    <p><span className="font-medium text-gray-600">Proveedor:</span> {selectedRecord.semenProvider}</p>
                  </div>
                </div>

                {/* Notas */}
                {selectedRecord.notes && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Notas</h3>
                    <p className="text-gray-700">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && recordToDelete && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              {/* Header del modal */}
              <div className="flex items-center gap-4 p-6 border-b">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Eliminar Inseminación
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  ¿Estás seguro de que deseas eliminar el registro de inseminación de{" "}
                  <strong>{recordToDelete.animalName}</strong> (Arete: <strong>{recordToDelete.animalEarTag}</strong>)?
                  <br />
                  <br />
                  <span className="text-sm text-gray-600">
                    Fecha: {new Date(recordToDelete.date).toLocaleDateString()} - {recordToDelete.time}
                    <br />
                    Técnico: {recordToDelete.technicianName}
                  </span>
                  <br />
                  <br />
                  Toda la información del registro se perderá permanentemente.
                </p>
              </div>

              {/* Footer del modal */}
              <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-2xl">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setRecordToDelete(null);
                  }}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {isDeleting ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>{isDeleting ? "Eliminando..." : "Eliminar"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtificialInsemination;