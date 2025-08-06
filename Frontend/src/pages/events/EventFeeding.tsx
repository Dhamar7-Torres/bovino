import React, { useState, useEffect } from "react";
import {
  Package,
  Calendar,
  MapPin,
  User,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Save,
  CheckCircle,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";

// Tipos e interfaces
interface FeedingEvent {
  id: string;
  bovineId: string;
  bovineName: string;
  bovineTag: string;
  eventType: string;
  status: "scheduled" | "completed" | "in_progress" | "cancelled" | "pending";
  scheduledDate: string;
  completedDate?: string;
  feedType: string;
  quantity: number;
  unit: "kg" | "lbs" | "tons";
  cost: number;
  location: string;
  responsible: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const EventFeeding: React.FC = () => {
  // Estados principales
  const [events, setEvents] = useState<FeedingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Estados de modales
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FeedingEvent | null>(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    bovineName: "",
    bovineTag: "",
    eventType: "daily_feeding",
    status: "scheduled",
    scheduledDate: "",
    feedType: "alfalfa_hay",
    quantity: 0,
    unit: "kg",
    cost: 0,
    location: "",
    responsible: "",
    notes: "",
  });

  // Estado de notificación
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "info" as "success" | "error" | "info"
  });

  // Configuración del API
  const API_URL = 'http://localhost:5000/api';

  // Funciones del API
  const api = {
    checkHealth: async () => {
      try {
        console.log('🔍 Verificando salud del servidor...');
        const response = await fetch(`${API_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        const isHealthy = response.ok;
        console.log('📊 Estado del servidor:', isHealthy ? 'SALUDABLE' : 'NO DISPONIBLE');
        return isHealthy;
      } catch (error) {
        console.error('❌ Error en health check:', error);
        return false;
      }
    },

    getEvents: async () => {
      try {
        console.log('📦 Obteniendo eventos de alimentación...');
        const response = await fetch(`${API_URL}/events?eventType=feeding&limit=100`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📋 Respuesta del servidor:', data);
        
        if (data.success && data.data && data.data.events) {
          console.log(`✅ ${data.data.events.length} eventos obtenidos`);
          return data.data.events;
        }
        
        return [];
      } catch (error) {
        console.error('❌ Error obteniendo eventos:', error);
        throw error;
      }
    },

    createEvent: async (eventData: any) => {
      try {
        console.log('➕ Creando nuevo evento:', eventData);
        
        const payload = {
          eventType: "feeding",
          title: `Alimentación: ${eventData.bovineName}`,
          description: eventData.notes || `${eventData.feedType} - ${eventData.quantity}${eventData.unit}`,
          scheduledDate: eventData.scheduledDate,
          bovineId: eventData.bovineId || `temp_${Date.now()}`,
          status: eventData.status,
          priority: "MEDIUM",
          location: {
            latitude: 19.3371,
            longitude: -99.5660,
            address: eventData.location || "Ubicación del rancho"
          },
          cost: eventData.cost || 0,
          currency: "MXN",
          eventData: {
            feedType: eventData.feedType,
            quantity: eventData.quantity,
            unit: eventData.unit,
            responsible: eventData.responsible,
            bovineName: eventData.bovineName,
            bovineTag: eventData.bovineTag
          }
        };

        console.log('📤 Payload enviado:', payload);

        const response = await fetch(`${API_URL}/events`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Evento creado:', data);
        
        if (data.success && data.data && data.data.event) {
          return data.data.event;
        }
        
        throw new Error('Respuesta inválida del servidor');
      } catch (error) {
        console.error('❌ Error creando evento:', error);
        throw error;
      }
    },

    updateEvent: async (id: string, eventData: any) => {
      try {
        console.log('✏️ Actualizando evento:', id, eventData);
        
        const payload = {
          title: `Alimentación: ${eventData.bovineName}`,
          description: eventData.notes || `${eventData.feedType} - ${eventData.quantity}${eventData.unit}`,
          scheduledDate: eventData.scheduledDate,
          status: eventData.status,
          cost: eventData.cost || 0,
          eventData: {
            feedType: eventData.feedType,
            quantity: eventData.quantity,
            unit: eventData.unit,
            responsible: eventData.responsible,
            bovineName: eventData.bovineName,
            bovineTag: eventData.bovineTag
          }
        };

        const response = await fetch(`${API_URL}/events/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Evento actualizado:', data);
        
        if (data.success && data.data && data.data.event) {
          return data.data.event;
        }
        
        throw new Error('Respuesta inválida del servidor');
      } catch (error) {
        console.error('❌ Error actualizando evento:', error);
        throw error;
      }
    },

    deleteEvent: async (id: string) => {
      try {
        console.log('🗑️ Eliminando evento:', id);
        
        const response = await fetch(`${API_URL}/events/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ Evento eliminado:', data);
        
        return data.success;
      } catch (error) {
        console.error('❌ Error eliminando evento:', error);
        throw error;
      }
    }
  };

  // Opciones estáticas
  const eventTypes = [
    { id: "daily_feeding", name: "Alimentación Diaria" },
    { id: "supplement_feeding", name: "Suplementación" },
    { id: "forage_feeding", name: "Forraje" },
    { id: "mineral_feeding", name: "Minerales" },
    { id: "treatment_feeding", name: "Alimentación Terapéutica" },
  ];

  const feedTypes = [
    { id: "alfalfa_hay", name: "Heno de Alfalfa" },
    { id: "corn_silage", name: "Ensilaje de Maíz" },
    { id: "protein_concentrate", name: "Concentrado Proteico" },
    { id: "grain_corn", name: "Grano de Maíz" },
    { id: "mineral_supplement", name: "Suplemento Mineral" },
  ];

  const statusOptions = [
    { id: "scheduled", name: "Programado", color: "bg-blue-100 text-blue-800" },
    { id: "completed", name: "Completado", color: "bg-green-100 text-green-800" },
    { id: "in_progress", name: "En Progreso", color: "bg-yellow-100 text-yellow-800" },
    { id: "cancelled", name: "Cancelado", color: "bg-red-100 text-red-800" },
    { id: "pending", name: "Pendiente", color: "bg-purple-100 text-purple-800" },
  ];

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: "success" | "error" | "info") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "info" });
    }, 5000);
  };

  // Funciones de utilidad
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventTypeName = (type: string) =>
    eventTypes.find(t => t.id === type)?.name || type;

  const getFeedTypeName = (type: string) =>
    feedTypes.find(t => t.id === type)?.name || type;

  const getStatusColor = (status: string) =>
    statusOptions.find(s => s.id === status)?.color || "bg-gray-100 text-gray-800";

  // Función para mapear eventos del backend
  const mapBackendEvent = (backendEvent: any): FeedingEvent => {
    const eventData = backendEvent.eventData || {};
    return {
      id: backendEvent.id,
      bovineId: backendEvent.bovineId,
      bovineName: eventData.bovineName || "Sin nombre",
      bovineTag: eventData.bovineTag || "Sin tag",
      eventType: eventData.feedType || "daily_feeding",
      status: backendEvent.status?.toLowerCase() || "scheduled",
      scheduledDate: backendEvent.scheduledDate,
      completedDate: backendEvent.completedDate,
      feedType: eventData.feedType || "alfalfa_hay",
      quantity: eventData.quantity || 0,
      unit: eventData.unit || "kg",
      cost: backendEvent.cost || 0,
      location: backendEvent.location?.address || "Sin ubicación",
      responsible: eventData.responsible || "Sin asignar",
      notes: backendEvent.description || "",
      createdAt: backendEvent.createdAt,
      updatedAt: backendEvent.updatedAt,
    };
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      console.log('🚀 Iniciando carga de datos de alimentación...');
      setLoading(true);
      setError(null);

      try {
        // Verificar conexión
        console.log('🔍 Verificando conexión con el backend...');
        const isHealthy = await api.checkHealth();
        setConnected(isHealthy);

        if (isHealthy) {
          console.log('✅ Conexión establecida, cargando eventos...');
          
          // Cargar eventos
          const backendEvents = await api.getEvents();
          console.log('📦 Eventos del backend:', backendEvents);
          
          // Mapear eventos
          const mappedEvents = backendEvents.map(mapBackendEvent);
          setEvents(mappedEvents);
          
          showNotification(`✅ ${mappedEvents.length} eventos cargados correctamente`, "success");
          console.log(`📊 Total de eventos procesados: ${mappedEvents.length}`);
        } else {
          setError("No se pudo conectar al servidor backend");
          showNotification("❌ Sin conexión al servidor en puerto 5000", "error");
        }
      } catch (error) {
        console.error('💥 Error cargando datos:', error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        setError(errorMessage);
        setConnected(false);
        showNotification(`❌ Error: ${errorMessage}`, "error");
      } finally {
        setLoading(false);
        console.log('✨ Carga de datos completada');
      }
    };

    loadData();
  }, []);

  // Filtrar eventos
  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.bovineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.bovineTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.feedType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || event.eventType === typeFilter;
    const matchesStatus = statusFilter === "all" || event.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Handlers
  const handleCreateEvent = () => {
    console.log('➕ Abriendo formulario de creación');
    setFormData({
      bovineName: "",
      bovineTag: "",
      eventType: "daily_feeding",
      status: "scheduled",
      scheduledDate: "",
      feedType: "alfalfa_hay",
      quantity: 0,
      unit: "kg",
      cost: 0,
      location: "",
      responsible: "",
      notes: "",
    });
    setShowCreate(true);
  };

  const handleEditEvent = (event: FeedingEvent) => {
    console.log('✏️ Abriendo formulario de edición para:', event.id);
    setFormData({
      bovineName: event.bovineName,
      bovineTag: event.bovineTag,
      eventType: event.eventType,
      status: event.status,
      scheduledDate: event.scheduledDate,
      feedType: event.feedType,
      quantity: event.quantity,
      unit: event.unit,
      cost: event.cost,
      location: event.location,
      responsible: event.responsible,
      notes: event.notes || "",
    });
    setSelectedEvent(event);
    setShowEdit(true);
  };

  const handleViewEvent = (event: FeedingEvent) => {
    console.log('👁️ Mostrando detalles del evento:', event.id);
    setSelectedEvent(event);
    setShowDetails(true);
  };

  const handleSaveEvent = async () => {
    if (!formData.bovineName || !formData.bovineTag || !formData.scheduledDate) {
      showNotification("⚠️ Por favor completa todos los campos requeridos", "error");
      return;
    }

    try {
      setSaving(true);
      
      if (showCreate) {
        console.log('💾 Guardando nuevo evento...');
        const newEvent = await api.createEvent(formData);
        const mappedEvent = mapBackendEvent(newEvent);
        setEvents(prev => [...prev, mappedEvent]);
        setShowCreate(false);
        showNotification("✅ Evento de alimentación creado correctamente", "success");
      } else if (showEdit && selectedEvent) {
        console.log('💾 Actualizando evento existente...');
        const updatedEvent = await api.updateEvent(selectedEvent.id, formData);
        const mappedEvent = mapBackendEvent(updatedEvent);
        setEvents(prev => prev.map(e => e.id === selectedEvent.id ? mappedEvent : e));
        setShowEdit(false);
        showNotification("✅ Evento actualizado correctamente", "success");
      }
      
      setSelectedEvent(null);
      setFormData({
        bovineName: "",
        bovineTag: "",
        eventType: "daily_feeding",
        status: "scheduled",
        scheduledDate: "",
        feedType: "alfalfa_hay",
        quantity: 0,
        unit: "kg",
        cost: 0,
        location: "",
        responsible: "",
        notes: "",
      });
    } catch (error) {
      console.error('💥 Error guardando evento:', error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      showNotification(`❌ Error al guardar: ${errorMessage}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    const confirmMessage = `¿Estás seguro de eliminar el evento de alimentación para ${event.bovineName}?`;
    if (window.confirm(confirmMessage)) {
      try {
        console.log('🗑️ Eliminando evento:', eventId);
        setSaving(true);
        await api.deleteEvent(eventId);
        setEvents(prev => prev.filter(e => e.id !== eventId));
        showNotification("✅ Evento eliminado correctamente", "success");
      } catch (error) {
        console.error('💥 Error eliminando evento:', error);
        const errorMessage = error instanceof Error ? error.message : "Error desconocido";
        showNotification(`❌ Error al eliminar: ${errorMessage}`, "error");
      } finally {
        setSaving(false);
      }
    }
  };

  const handleRetryConnection = async () => {
    console.log('🔄 Reintentando conexión...');
    setLoading(true);
    setError(null);
    
    try {
      const isHealthy = await api.checkHealth();
      setConnected(isHealthy);
      
      if (isHealthy) {
        const backendEvents = await api.getEvents();
        const mappedEvents = backendEvents.map(mapBackendEvent);
        setEvents(mappedEvents);
        showNotification("🔄 Conexión restablecida correctamente", "success");
      } else {
        setError("Servidor no disponible");
        showNotification("❌ No se pudo establecer conexión", "error");
      }
    } catch (error) {
      console.error('Error reconnecting:', error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setError(errorMessage);
      showNotification(`❌ Error de conexión: ${errorMessage}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModals = () => {
    setShowCreate(false);
    setShowEdit(false);
    setShowDetails(false);
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100 flex items-center justify-center">
        <div className="text-center bg-white/90 p-8 rounded-2xl shadow-xl border">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">🔌 Conectando al Backend</h3>
          <p className="text-gray-600 mb-2">Verificando servidor en puerto 5000...</p>
          <p className="text-sm text-gray-500 font-mono bg-gray-100 px-3 py-1 rounded">
            http://localhost:5000/api
          </p>
          <div className="mt-4 text-xs text-gray-400 space-y-1">
            <p>• Verificando endpoint /health</p>
            <p>• Cargando eventos de alimentación</p>
            <p>• Conectando con base de datos</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-blue-50 to-purple-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <div className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl text-white">
                <Package className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">🍽️ Eventos de Alimentación</h1>
                <p className="text-gray-600 mt-1">Gestiona la nutrición y alimentación de tu ganado</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Indicador de conexión mejorado */}
              <div className="flex items-center space-x-2">
                {connected ? (
                  <div className="flex items-center space-x-2 bg-green-50 border border-green-200 px-3 py-2 rounded-full">
                    <Wifi className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">✅ Conectado</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 bg-red-50 border border-red-200 px-3 py-2 rounded-full">
                    <WifiOff className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">❌ Desconectado</span>
                    <button
                      onClick={handleRetryConnection}
                      disabled={loading}
                      className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded font-medium transition-colors disabled:opacity-50"
                    >
                      {loading ? "..." : "🔄 Reintentar"}
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={handleCreateEvent}
                disabled={!connected}
                className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5" />
                <span>➕ Nuevo Evento</span>
              </button>
            </div>
          </div>

          {/* Panel de estado de conexión */}
          {connected && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-green-800">🟢 Sistema Conectado</h3>
                  <p className="text-xs text-green-600 font-mono">
                    Backend: http://localhost:5000/api ✓
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-800">
                    📊 {events.length} eventos cargados
                  </p>
                  <p className="text-xs text-green-600">
                    Filtrados: {filteredEvents.length}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="🔍 Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
            >
              <option value="all">📋 Todos los tipos</option>
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
            >
              <option value="all">📊 Todos los estados</option>
              {statusOptions.map((status) => (
                <option key={status.id} value={status.id}>{status.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Mensaje de error de conexión */}
      {error && !connected && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold text-lg">🔌 Error de Conexión al Backend</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
                
                <div className="mt-4 bg-red-100 rounded-lg p-4">
                  <h4 className="text-red-800 font-medium mb-2">🔧 Información técnica:</h4>
                  <div className="text-sm text-red-700 space-y-1 font-mono">
                    <p><strong>URL del Backend:</strong> http://localhost:5000/api</p>
                    <p><strong>Health Check:</strong> /health</p>
                    <p><strong>Endpoint Eventos:</strong> /events?eventType=feeding</p>
                    <p><strong>Puerto:</strong> 5000</p>
                  </div>
                </div>

                <div className="mt-4">
                  <h4 className="text-red-800 font-medium mb-2">📋 Pasos para solucionar:</h4>
                  <ol className="text-red-600 text-sm list-decimal list-inside space-y-1">
                    <li>Verifica que el servidor backend esté ejecutándose</li>
                    <li>Confirma que esté escuchando en el puerto 5000</li>
                    <li>Asegúrate que el endpoint /api/health esté disponible</li>
                    <li>Revisa la consola del navegador (F12) para más detalles</li>
                    <li>Verifica la configuración de CORS en el backend</li>
                  </ol>
                </div>

                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={handleRetryConnection}
                    disabled={loading}
                    className="inline-flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <span>{loading ? "🔄 Conectando..." : "🔄 Reintentar Conexión"}</span>
                  </button>
                  
                  <button
                    onClick={() => window.open('http://localhost:5000/api/health', '_blank')}
                    className="inline-flex items-center space-x-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <span>🔗 Probar Health Check</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de eventos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredEvents.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200 shadow-sm">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {connected ? '📝 No hay eventos de alimentación' : '🔌 Sin conexión al servidor'}
            </h3>
            <p className="text-gray-600 mb-6">
              {connected 
                ? (searchTerm || typeFilter !== "all" || statusFilter !== "all"
                   ? "No se encontraron eventos que coincidan con los filtros aplicados."
                   : "Comienza creando tu primer evento de alimentación.") 
                : "Conecta al servidor para ver los eventos existentes."}
            </p>
            {connected && (
              <button
                onClick={handleCreateEvent}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
              >
                ➕ Crear Primer Evento
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:bg-white/90"
              >
                {/* Header del evento */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {getEventTypeName(event.eventType)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        🐄 {event.bovineName} • {event.bovineTag}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                    {statusOptions.find(s => s.id === event.status)?.name}
                  </span>
                </div>

                {/* Información del alimento */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">
                    🌾 {getFeedTypeName(event.feedType)}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">📏 Cantidad:</span>
                      <span className="font-medium ml-1">{event.quantity} {event.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">💰 Costo:</span>
                      <span className="font-medium ml-1">${event.cost}</span>
                    </div>
                  </div>
                </div>

                {/* Información del evento */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>📅 {formatDate(event.scheduledDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">📍 {event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>👤 {event.responsible}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end space-x-1 mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewEvent(event)}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEditEvent(event)}
                    disabled={!connected || saving}
                    className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Editar evento"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    disabled={!connected || saving}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Eliminar evento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetails && selectedEvent && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">📋 Detalles del Evento</h2>
              <button
                onClick={() => setShowDetails(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Tipo de Evento</label>
                  <p className="text-gray-900">{getEventTypeName(selectedEvent.eventType)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Estado</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                    {statusOptions.find(s => s.id === selectedEvent.status)?.name}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">🐄 Vaca</label>
                  <p className="text-gray-900">{selectedEvent.bovineName} ({selectedEvent.bovineTag})</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">📅 Fecha Programada</label>
                  <p className="text-gray-900">{formatDate(selectedEvent.scheduledDate)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">🌾 Tipo de Alimento</label>
                  <p className="text-gray-900">{getFeedTypeName(selectedEvent.feedType)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">📏 Cantidad</label>
                  <p className="text-gray-900">{selectedEvent.quantity} {selectedEvent.unit}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">📍 Ubicación</label>
                  <p className="text-gray-900">{selectedEvent.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">👤 Responsable</label>
                  <p className="text-gray-900">{selectedEvent.responsible}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">💰 Costo Total</label>
                <p className="text-gray-900 text-2xl font-bold">${selectedEvent.cost}</p>
              </div>

              {selectedEvent.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-600">📝 Notas</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedEvent.notes}</p>
                </div>
              )}

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">ℹ️ Información del Sistema</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700">🆔 ID del Evento:</span>
                    <span className="font-mono ml-1 text-xs bg-blue-100 px-1 rounded">{selectedEvent.id}</span>
                  </div>
                  <div>
                    <span className="text-blue-700">📅 Creado:</span>
                    <span className="ml-1">{formatDate(selectedEvent.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetails(false);
                  handleEditEvent(selectedEvent);
                }}
                disabled={!connected}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Edit3 className="h-4 w-4" />
                <span>✏️ Editar</span>
              </button>
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ❌ Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear/editar */}
      {(showCreate || showEdit) && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleCloseModals}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {showCreate ? "➕ Crear Evento de Alimentación" : "✏️ Editar Evento"}
              </h2>
              <button
                onClick={handleCloseModals}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🐄 Nombre de la Vaca *
                  </label>
                  <input
                    type="text"
                    value={formData.bovineName}
                    onChange={(e) => setFormData({ ...formData, bovineName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Esperanza"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🏷️ Etiqueta de la Vaca *
                  </label>
                  <input
                    type="text"
                    value={formData.bovineTag}
                    onChange={(e) => setFormData({ ...formData, bovineTag: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: ESP-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📋 Tipo de Evento
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {eventTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📊 Estado del Evento
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {statusOptions.map((status) => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📅 Fecha y Hora Programada *
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledDate ? new Date(formData.scheduledDate).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setFormData({ ...formData, scheduledDate: new Date(e.target.value).toISOString() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    🌾 Tipo de Alimento
                  </label>
                  <select
                    value={formData.feedType}
                    onChange={(e) => setFormData({ ...formData, feedType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {feedTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📐 Unidad de Medida
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="kg">📦 Kilogramos (kg)</option>
                    <option value="lbs">⚖️ Libras (lbs)</option>
                    <option value="tons">🚛 Toneladas</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📏 Cantidad
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    💰 Costo (MXN)
                  </label>
                  <input
                    type="number"
                    value={formData.cost}
                    onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    📍 Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Corral Norte, Pastura 3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    👤 Responsable
                  </label>
                  <input
                    type="text"
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ej: Juan Pérez"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  📝 Notas Adicionales
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  rows={3}
                  placeholder="Información adicional sobre el evento de alimentación..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleSaveEvent}
                disabled={!connected || saving}
                className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>
                  {saving ? "💾 Guardando..." : (showCreate ? "➕ Crear Evento" : "💾 Guardar Cambios")}
                </span>
              </button>
              <button
                onClick={handleCloseModals}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ❌ Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`px-6 py-4 rounded-lg shadow-xl border-l-4 ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border-green-500' 
              : notification.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-500'
              : 'bg-blue-50 text-blue-800 border-blue-500'
          }`}>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 mt-0.5">
                {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {notification.type === 'error' && <AlertCircle className="h-5 w-5 text-red-600" />}
                {notification.type === 'info' && <Package className="h-5 w-5 text-blue-600" />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{notification.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventFeeding;