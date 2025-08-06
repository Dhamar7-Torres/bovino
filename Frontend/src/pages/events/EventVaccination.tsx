import React, { useState, useEffect } from "react";
import {
  MapPin,
  Syringe,
  DollarSign,
  ArrowLeft,
  Save,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Search,
  Eye,
  Calendar,
  User,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
} from "lucide-react";

// Configuración del backend
const API_BASE_URL = 'http://localhost:5000';

// Tipos simplificados
interface VaccinationEvent {
  id: string;
  bovineIds: string[];
  bovineName: string;
  vaccineName: string;
  vaccineType: string;
  manufacturer: string;
  batchNumber: string;
  veterinarianName: string;
  applicationDate: string;
  applicationTime: string;
  doseAmount: number;
  doseUnit: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  cost: number;
  notes: string;
  status: string;
  createdAt: string;
}

interface ConnectionStatusProps {
  isOnline: boolean;
  isConnecting: boolean;
}

// Componente de estado de conexión
const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isOnline, isConnecting }) => (
  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
    isConnecting ? 'bg-yellow-100 text-yellow-800' :
    isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }`}>
    {isConnecting ? (
      <RefreshCw className="h-3 w-3 animate-spin" />
    ) : isOnline ? (
      <Wifi className="h-3 w-3" />
    ) : (
      <WifiOff className="h-3 w-3" />
    )}
    <span>
      {isConnecting ? 'Conectando...' : isOnline ? 'En línea' : 'Sin conexión'}
    </span>
  </div>
);

// Componente principal
const EventVaccination: React.FC = () => {
  // Estados
  const [events, setEvents] = useState<VaccinationEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<VaccinationEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<VaccinationEvent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [viewingEvent, setViewingEvent] = useState<VaccinationEvent | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Estado del formulario
  const [formData, setFormData] = useState<VaccinationEvent>({
    id: "",
    bovineIds: [""],
    bovineName: "",
    vaccineName: "",
    vaccineType: "",
    manufacturer: "",
    batchNumber: "",
    veterinarianName: "",
    applicationDate: new Date().toISOString().split("T")[0],
    applicationTime: new Date().toTimeString().slice(0, 5),
    doseAmount: 0,
    doseUnit: "ml",
    location: {
      lat: 17.9995,
      lng: -92.9476,
      address: "Villahermosa, Tabasco, México",
    },
    cost: 0,
    notes: "",
    status: "scheduled",
    createdAt: new Date().toISOString(),
  });

  // Verificar conexión al backend
  const checkBackendConnection = async (): Promise<boolean> => {
    try {
      setIsConnecting(true);
      const response = await fetch(`${API_BASE_URL}/api/health`, { 
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        setIsOnline(true);
        setLastSyncTime(new Date());
        return true;
      } else {
        setIsOnline(false);
        return false;
      }
    } catch (error) {
      console.warn('Backend no disponible:', error);
      setIsOnline(false);
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  // Cargar eventos del backend
  const loadEventsFromBackend = async (): Promise<VaccinationEvent[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vaccinations`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error cargando eventos');
      }
    } catch (error) {
      console.error('Error cargando del backend:', error);
      throw error;
    }
  };

  // Cargar eventos
  const loadEvents = async (): Promise<void> => {
    setLoading(true);
    try {
      const backendOnline = await checkBackendConnection();
      
      if (backendOnline) {
        try {
          const backendEvents = await loadEventsFromBackend();
          setEvents(backendEvents);
          localStorage.setItem('vaccination_events_local', JSON.stringify(backendEvents));
          console.log('✅ Eventos cargados del backend');
          return;
        } catch (backendError) {
          console.warn('Error cargando del backend:', backendError);
        }
      }

      // Fallback a localStorage
      const stored = localStorage.getItem('vaccination_events_local');
      if (stored) {
        const parsed = JSON.parse(stored);
        setEvents(parsed);
        console.log('📱 Eventos cargados de localStorage');
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error cargando eventos:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Guardar evento en backend
  const saveEventToBackend = async (event: VaccinationEvent, isUpdate: boolean = false): Promise<VaccinationEvent> => {
    try {
      const method = isUpdate ? 'PUT' : 'POST';
      const url = isUpdate ? `${API_BASE_URL}/api/vaccinations/${event.id}` : `${API_BASE_URL}/api/vaccinations`;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.data) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error guardando evento');
      }
    } catch (error) {
      console.error('Error guardando en backend:', error);
      throw error;
    }
  };

  // Eliminar evento del backend
  const deleteEventFromBackend = async (eventId: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vaccinations/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Error eliminando evento');
      }
    } catch (error) {
      console.error('Error eliminando del backend:', error);
      throw error;
    }
  };

  // Obtener ubicación actual
  const getCurrentLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada");
      return;
    }

    setGettingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      setFormData(prev => ({
        ...prev,
        location: {
          lat: latitude,
          lng: longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
        }
      }));

      alert("✅ Ubicación obtenida exitosamente");
    } catch (error) {
      alert("❌ No se pudo obtener la ubicación");
    } finally {
      setGettingLocation(false);
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    if (!formData.vaccineName.trim()) {
      alert("El nombre de la vacuna es requerido");
      return false;
    }
    
    if (!formData.veterinarianName.trim()) {
      alert("El nombre del veterinario es requerido");
      return false;
    }
    
    if (!formData.applicationDate) {
      alert("La fecha de aplicación es requerida");
      return false;
    }
    
    if (formData.cost < 0) {
      alert("El costo no puede ser negativo");
      return false;
    }
    
    return true;
  };

  // Guardar evento
  const handleSaveEvent = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const eventToSave: VaccinationEvent = {
        ...formData,
        id: editingEvent?.id || `vac-${Date.now()}`,
        bovineIds: formData.bovineIds.filter(id => id.trim()),
        createdAt: editingEvent?.createdAt || new Date().toISOString(),
      };

      let savedEvent: VaccinationEvent = eventToSave;
      let newEvents: VaccinationEvent[];

      if (isOnline) {
        try {
          savedEvent = await saveEventToBackend(eventToSave, !!editingEvent);
          console.log('✅ Evento guardado en backend');
        } catch (backendError) {
          console.warn('Error guardando en backend:', backendError);
        }
      }

      if (editingEvent) {
        newEvents = events.map(e => e.id === editingEvent.id ? savedEvent : e);
      } else {
        newEvents = [savedEvent, ...events];
      }

      setEvents(newEvents);
      localStorage.setItem('vaccination_events_local', JSON.stringify(newEvents));
      
      setShowForm(false);
      setEditingEvent(null);
      resetForm();
      
      const message = editingEvent ? "✅ Evento actualizado exitosamente" : "✅ Evento guardado exitosamente";
      const offlineMessage = !isOnline ? " (guardado localmente)" : "";
      alert(message + offlineMessage);
      
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("❌ Error al guardar el evento");
    } finally {
      setLoading(false);
    }
  };

  // Editar evento
  const handleEdit = (event: VaccinationEvent): void => {
    setFormData(event);
    setEditingEvent(event);
    setShowForm(true);
  };

  // Ver evento
  const handleView = (event: VaccinationEvent): void => {
    setViewingEvent(event);
  };

  // Cerrar modal de vista
  const closeViewModal = (): void => {
    setViewingEvent(null);
  };

  // Eliminar evento
  const handleDelete = async (eventId: string): Promise<void> => {
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) return;

    const confirmed = confirm(
      `¿Eliminar vacunación "${eventToDelete.vaccineName}"?`
    );
    
    if (!confirmed) return;

    setDeleteLoading(eventId);

    try {
      if (isOnline) {
        try {
          await deleteEventFromBackend(eventId);
          console.log('✅ Evento eliminado del backend');
        } catch (backendError) {
          console.warn('Error eliminando del backend:', backendError);
        }
      }

      const newEvents = events.filter(e => e.id !== eventId);
      setEvents(newEvents);
      localStorage.setItem('vaccination_events_local', JSON.stringify(newEvents));
      
      if (editingEvent?.id === eventId) {
        setEditingEvent(null);
        setShowForm(false);
        resetForm();
      }

      if (viewingEvent?.id === eventId) {
        setViewingEvent(null);
      }
      
      const message = "✅ Evento eliminado exitosamente";
      const offlineMessage = !isOnline ? " (localmente)" : "";
      alert(message + offlineMessage);
      
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("❌ Error al eliminar el evento");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Resetear formulario
  const resetForm = (): void => {
    setFormData({
      id: "",
      bovineIds: [""],
      bovineName: "",
      vaccineName: "",
      vaccineType: "",
      manufacturer: "",
      batchNumber: "",
      veterinarianName: "",
      applicationDate: new Date().toISOString().split("T")[0],
      applicationTime: new Date().toTimeString().slice(0, 5),
      doseAmount: 0,
      doseUnit: "ml",
      location: {
        lat: 17.9995,
        lng: -92.9476,
        address: "Villahermosa, Tabasco, México",
      },
      cost: 0,
      notes: "",
      status: "scheduled",
      createdAt: new Date().toISOString(),
    });
  };

  // Sincronización manual
  const handleManualSync = async (): Promise<void> => {
    if (!isOnline) {
      alert('❌ No hay conexión con el backend');
      return;
    }

    setLoading(true);
    try {
      await loadEvents();
      alert('✅ Sincronización completada');
    } catch (error) {
      alert('❌ Error durante la sincronización');
    } finally {
      setLoading(false);
    }
  };

  // Funciones auxiliares
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "completed": return "Completado";
      case "pending": return "Pendiente";
      case "scheduled": return "Programado";
      case "cancelled": return "Cancelado";
      default: return "Desconocido";
    }
  };

  const getVaccineTypeIcon = (type: string): string => {
    switch (type) {
      case "viral": return "🦠";
      case "bacterial": return "🔬";
      case "parasitic": return "🐛";
      case "combination": return "💊";
      case "toxoid": return "🧪";
      default: return "💉";
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const handleFormChange = (field: keyof VaccinationEvent, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingEvent(null);
    resetForm();
  };

  // Efectos
  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    const interval = setInterval(checkBackendConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.bovineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.bovineIds.some(id => id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        event.veterinarianName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(event => event.vaccineType === selectedType);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(event => event.status === selectedStatus);
    }

    filtered.sort((a, b) => 
      new Date(b.applicationDate + " " + b.applicationTime).getTime() - 
      new Date(a.applicationDate + " " + a.applicationTime).getTime()
    );

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedType, selectedStatus]);

  // Estadísticas
  const stats = {
    total: events.length,
    completed: events.filter(e => e.status === "completed").length,
    pending: events.filter(e => e.status === "pending" || e.status === "scheduled").length,
    nextDue: events.filter(e => new Date(e.applicationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length,
  };

  // Renderizado del formulario
  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-100 to-orange-400 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancelForm}
                className="p-2 bg-white/80 rounded-lg hover:bg-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {editingEvent ? "Editar Vacunación" : "Nueva Vacunación"}
                </h1>
                <p className="text-gray-600">
                  {editingEvent ? "Actualiza los datos del evento" : "Registra un nuevo evento de vacunación"}
                </p>
              </div>
            </div>
            <ConnectionStatus isOnline={isOnline} isConnecting={isConnecting} />
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-md border border-white/20 p-6">
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEvent(); }} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre de la Vacuna *
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Triple Viral Bovina"
                    value={formData.vaccineName}
                    onChange={(e) => handleFormChange('vaccineName', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre del Animal
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Esperanza"
                    value={formData.bovineName}
                    onChange={(e) => handleFormChange('bovineName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Vacuna
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    value={formData.vaccineType}
                    onChange={(e) => handleFormChange('vaccineType', e.target.value)}
                  >
                    <option value="">Selecciona tipo</option>
                    <option value="viral">Viral</option>
                    <option value="bacterial">Bacteriana</option>
                    <option value="parasitic">Parasitaria</option>
                    <option value="combination">Combinada</option>
                    <option value="toxoid">Toxoide</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Aplicación *
                  </label>
                  <input
                    type="date"
                    value={formData.applicationDate}
                    onChange={(e) => handleFormChange('applicationDate', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={formData.applicationTime}
                    onChange={(e) => handleFormChange('applicationTime', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Veterinario *
                  </label>
                  <input
                    type="text"
                    placeholder="Dr. María González"
                    value={formData.veterinarianName}
                    onChange={(e) => handleFormChange('veterinarianName', e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Ubicación *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="Corral A - Sector Norte"
                      value={formData.location.address}
                      onChange={(e) => handleFormChange('location', {
                        ...formData.location, 
                        address: e.target.value
                      })}
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={gettingLocation}
                      className="p-2 border-2 border-gray-300 bg-white/80 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      {gettingLocation ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Costo Total
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <DollarSign className="h-4 w-4" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.cost.toString()}
                      onChange={(e) => handleFormChange('cost', parseFloat(e.target.value) || 0)}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    value={formData.status}
                    onChange={(e) => handleFormChange('status', e.target.value)}
                  >
                    <option value="scheduled">Programado</option>
                    <option value="completed">Completado</option>
                    <option value="pending">Pendiente</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Notas adicionales
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px] bg-white/50 backdrop-blur-sm"
                  placeholder="Notas adicionales..."
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                />
              </div>

              {!isOnline && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <WifiOff className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      Sin conexión al servidor. Los datos se guardarán localmente.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 bg-white/80 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.vaccineName || !formData.veterinarianName}
                  className="flex-1 px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{loading ? "Guardando..." : editingEvent ? "Actualizar" : "Guardar"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Renderizado principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-blue-100 to-orange-400 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl">
              <Syringe className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Eventos de Vacunación</h1>
              <p className="text-gray-600">Gestiona las vacunas de tu ganado</p>
              {lastSyncTime && (
                <p className="text-xs text-gray-500">
                  Última sincronización: {lastSyncTime.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <ConnectionStatus isOnline={isOnline} isConnecting={isConnecting} />
            <button
              onClick={handleManualSync}
              disabled={!isOnline || loading}
              title="Sincronizar manualmente"
              className="p-2 border-2 border-gray-300 bg-white/80 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nuevo Evento</span>
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Total Vacunas", value: stats.total, color: "green", icon: TrendingUp },
            { label: "Completadas", value: stats.completed, color: "blue", icon: CheckCircle },
            { label: "Pendientes", value: stats.pending, color: "yellow", icon: Clock },
            { label: "Próximas", value: stats.nextDue, color: "orange", icon: AlertTriangle }
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="bg-gray-100 p-3 rounded-xl">
                  <stat.icon className="h-6 w-6 text-gray-600" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por vaca o evento..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="viral">Viral</option>
              <option value="bacterial">Bacteriana</option>
              <option value="parasitic">Parasitaria</option>
              <option value="combination">Combinada</option>
              <option value="toxoid">Toxoide</option>
            </select>

            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white/50 backdrop-blur-sm"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completado</option>
              <option value="pending">Pendiente</option>
              <option value="scheduled">Programado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        {/* Lista de eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-xl">
                      <span className="text-2xl">
                        {getVaccineTypeIcon(event.vaccineType)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{event.vaccineName}</h3>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-600 text-sm">
                    {event.bovineName && (
                      <span className="font-medium text-gray-900">{event.bovineName} • </span>
                    )}
                    {event.bovineIds.filter(id => id.trim()).join(", ")}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDate(event.applicationDate)}, {event.applicationTime}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location.address}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <User className="h-4 w-4 mr-2" />
                    {event.veterinarianName}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ${event.cost.toLocaleString()}
                  </div>
                </div>

                {event.notes && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {event.notes}
                  </p>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleView(event)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(event)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Editar evento"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deleteLoading === event.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar evento"
                    >
                      {deleteLoading === event.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Estado vacío */}
        {filteredEvents.length === 0 && !loading && (
          <div className="text-center py-12">
            <Syringe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {events.length === 0 ? "No hay vacunaciones registradas" : "No se encontraron eventos"}
            </h3>
            <p className="text-gray-600 mb-6">
              {events.length === 0 
                ? "Comienza registrando tu primera vacunación"
                : "Intenta ajustar los filtros de búsqueda"
              }
            </p>
            {events.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center space-x-2 mx-auto"
              >
                <Plus className="h-4 w-4" />
                <span>Registrar Primera Vacunación</span>
              </button>
            )}
          </div>
        )}

        {/* Estado de carga */}
        {loading && events.length === 0 && (
          <div className="text-center py-12">
            <RefreshCw className="h-16 w-16 text-gray-300 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Cargando eventos...
            </h3>
            <p className="text-gray-600">
              {isOnline ? "Sincronizando con el servidor" : "Cargando datos locales"}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Vista */}
      {viewingEvent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeViewModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <span className="text-3xl">
                      {getVaccineTypeIcon(viewingEvent.vaccineType)}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{viewingEvent.vaccineName}</h2>
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingEvent.status)}`}>
                      {getStatusText(viewingEvent.status)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeViewModal}
                  className="p-2 border-2 border-gray-300 bg-white/80 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Información del Animal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Nombre:</span>
                    <p className="font-medium">{viewingEvent.bovineName || "No especificado"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">IDs:</span>
                    <p className="font-medium">{viewingEvent.bovineIds.filter(id => id.trim()).join(", ")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Detalles de la Vacuna
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <p className="font-medium capitalize">{viewingEvent.vaccineType}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Fabricante:</span>
                    <p className="font-medium">{viewingEvent.manufacturer || "No especificado"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Lote:</span>
                    <p className="font-medium">{viewingEvent.batchNumber || "No especificado"}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Dosis:</span>
                    <p className="font-medium">{viewingEvent.doseAmount} {viewingEvent.doseUnit}</p>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Aplicación
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Fecha y Hora:</span>
                    <p className="font-medium">{formatDate(viewingEvent.applicationDate)}, {viewingEvent.applicationTime}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Veterinario:</span>
                    <p className="font-medium">{viewingEvent.veterinarianName}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-gray-500">Ubicación:</span>
                    <p className="font-medium">{viewingEvent.location.address}</p>
                    <p className="text-xs text-gray-400">
                      {viewingEvent.location.lat.toFixed(6)}, {viewingEvent.location.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              {viewingEvent.notes && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Notas</h3>
                  <p className="text-sm text-gray-700">{viewingEvent.notes}</p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    closeViewModal();
                    handleEdit(viewingEvent);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => {
                    closeViewModal();
                    handleDelete(viewingEvent.id);
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Eliminar</span>
                </button>
                <button
                  onClick={closeViewModal}
                  className="flex-1 px-4 py-2 border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventVaccination;