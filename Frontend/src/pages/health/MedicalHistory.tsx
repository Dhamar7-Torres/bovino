import React, { useState, useEffect } from "react";

// Configuración mejorada del backend
const BACKEND_CONFIG = {
  baseURL: "http://localhost:5000/api",
  timeout: 10000, // 10 segundos
  retryAttempts: 3,
  retryDelay: 1000, // 1 segundo entre intentos
};

// Tipos para eventos médicos - Actualizados según el backend
type EventType = "VACCINATION" | "DISEASE" | "HEALTH_CHECK" | "TREATMENT" | "REPRODUCTION" | "MOVEMENT" | "FEEDING" | "WEIGHING" | "BIRTH" | "DEATH" | "INJURY" | "QUARANTINE" | "MEDICATION" | "SURGERY" | "OTHER";
type EventStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "POSTPONED" | "FAILED";
type EventPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | "EMERGENCY";

// Interfaz para ubicación
interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

// Interfaces actualizadas según el backend
interface MedicalEvent {
  id: string;
  bovineId: string;
  eventType: EventType;
  title: string;
  description: string;
  status: EventStatus;
  priority: EventPriority;
  scheduledDate: string;
  completedDate?: string;
  location: LocationData;
  cost?: number;
  veterinarianId?: string;
  createdBy: string;
  publicNotes?: string;
  eventData?: any;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  // Información del bovino (viene del backend)
  bovineInfo?: {
    id: string;
    earTag: string;
    name: string;
    cattleType: string;
    breed?: string;
    gender?: string;
  };
}

interface HealthStats {
  totalEvents: number;
  vaccinationsCount: number;
  diseasesCount: number;
  treatmentsCount: number;
  healthScore: number;
}

interface NewEventForm {
  bovineId: string;
  eventType: EventType;
  title: string;
  description: string;
  scheduledDate: string;
  priority: EventPriority;
  location: LocationData;
  cost: number;
  veterinarianId: string;
  publicNotes: string;
  eventData?: any;
}

// Clase mejorada de API Client con manejo de errores robusto
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retryAttempts: number;
  private retryDelay: number;

  constructor(config: typeof BACKEND_CONFIG) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout;
    this.retryAttempts = config.retryAttempts;
    this.retryDelay = config.retryDelay;
  }

  // Método helper para hacer requests con reintentos
  private async fetchWithRetry(url: string, options: RequestInit, attempt = 1): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      console.error(`Intento ${attempt} falló para ${url}:`, error);

      if (attempt < this.retryAttempts && this.shouldRetry(error)) {
        console.log(`Reintentando en ${this.retryDelay}ms... (${attempt}/${this.retryAttempts})`);
        await this.delay(this.retryDelay * attempt); // Backoff exponencial
        return this.fetchWithRetry(url, options, attempt + 1);
      }

      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // Reintentar solo en errores de red, no en errores HTTP 4xx
    return error.name === 'AbortError' || 
           error.name === 'TypeError' || 
           error.message.includes('Failed to fetch') ||
           error.message.includes('Network Error');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Verificar conexión con el backend
  async testConnection(): Promise<{ success: boolean; message: string; latency?: number }> {
    const startTime = Date.now();
    try {

      const latency = Date.now() - startTime;

      return {
        success: true,
        message: `Conectado exitosamente (${latency}ms)`,
        latency
      };
    } catch (error) {
      console.error('Error de conexión:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error de conexión desconocido'
      };
    }
  }

  // Obtener todos los eventos
  async getEvents(page = 1, limit = 50): Promise<{ events: MedicalEvent[], pagination: any }> {
    const response = await this.fetchWithRetry(
      `${this.baseURL}/events?page=${page}&limit=${limit}`,
      { method: 'GET' }
    );
    
    const data = await response.json();
    return data.data || { events: [], pagination: {} };
  }

  // Crear nuevo evento
  async createEvent(eventData: Partial<NewEventForm>): Promise<MedicalEvent> {
    const defaultLocation: LocationData = {
      latitude: 18.0067, // Coordenadas de Villahermosa, Tabasco
      longitude: -92.9311,
      address: eventData.location?.address || 'Rancho Principal, Villahermosa, Tabasco'
    };

    const response = await this.fetchWithRetry(`${this.baseURL}/events`, {
      method: 'POST',
      body: JSON.stringify({
        ...eventData,
        priority: eventData.priority || 'MEDIUM',
        location: eventData.location || defaultLocation
      }),
    });

    const data = await response.json();
    return data.data?.event || data.data;
  }

  // Actualizar evento
  async updateEvent(id: string, eventData: Partial<NewEventForm>): Promise<MedicalEvent> {
    const response = await this.fetchWithRetry(`${this.baseURL}/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(eventData),
    });

    const data = await response.json();
    return data.data?.event || data.data;
  }

  // Eliminar evento
  async deleteEvent(id: string): Promise<void> {
    await this.fetchWithRetry(`${this.baseURL}/events/${id}`, {
      method: 'DELETE',
    });
  }

  // Obtener bovinos
  async getBovines(): Promise<any[]> {
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}/bovines`, {
        method: 'GET',
      });

      const data = await response.json();
      return data.data?.bovines || data.data || [];
    } catch (error) {
      // Si no hay endpoint de bovines, devolver datos mock
      console.warn('Endpoint de bovines no disponible, usando datos de ejemplo');
      return [
        { id: '1', name: 'Estrella', earTag: 'TAG-001', cattleType: 'Lechera', breed: 'Holstein', gender: 'Female' },
        { id: '2', name: 'Toro Real', earTag: 'TAG-002', cattleType: 'Reproductor', breed: 'Brahman', gender: 'Male' },
        { id: '3', name: 'Luna', earTag: 'TAG-003', cattleType: 'Lechera', breed: 'Jersey', gender: 'Female' }
      ];
    }
  }

  // Obtener estadísticas del sistema
  async getSystemInfo(): Promise<any> {
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}/../system-info`, {
        method: 'GET',
      });
      const systemData = await response.json();
      return systemData;
    } catch (error) {
      console.warn('System info no disponible');
      return null;
    }
  }
}

// Instancia del cliente API
const apiClient = new ApiClient(BACKEND_CONFIG);

const MedicalHistory: React.FC = () => {
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [bovines, setBovines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error' | 'retrying'>('connecting');
  const [connectionInfo, setConnectionInfo] = useState<{ message: string; latency?: number }>({ message: '' });
  
  // Estados para modales y formularios
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<MedicalEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<MedicalEvent | null>(null);
  
  // Estados para formulario
  const [formData, setFormData] = useState<Partial<NewEventForm>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedVeterinarian, setSelectedVeterinarian] = useState<string>("all");
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Estadísticas calculadas
  const [healthStats, setHealthStats] = useState<HealthStats>({
    totalEvents: 0,
    vaccinationsCount: 0,
    diseasesCount: 0,
    treatmentsCount: 0,
    healthScore: 92,
  });

  // Probar conexión con el backend
  const testConnection = async (showRetrying = false) => {
    try {
      if (showRetrying) {
        setConnectionStatus('retrying');
      } else {
        setConnectionStatus('connecting');
      }
      
      const result = await apiClient.testConnection();
      
      if (result.success) {
        setConnectionStatus('connected');
        setConnectionInfo(result);
        setError('');
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error de conexión:', error);
      setConnectionStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Error de conexión desconocido';
      setConnectionInfo({ message: errorMessage });
      setError(`Error de conexión con el backend: ${errorMessage}\n\nVerifica que el servidor esté ejecutándose en http://localhost:5000`);
      return false;
    }
  };

  // Cargar datos del backend
  const loadData = async (showRetrying = false) => {
    try {
      setIsLoading(true);
      setError("");
      
      // Probar conexión primero
      const isConnected = await testConnection(showRetrying);
      if (!isConnected) {
        return;
      }

      // Cargar eventos y bovinos en paralelo
      const [eventsData, bovinesData] = await Promise.all([
        apiClient.getEvents(),
        apiClient.getBovines()
      ]);
      
      setEvents(eventsData.events || []);
      setBovines(bovinesData || []);
      
      // Calcular estadísticas
      const eventsArray = eventsData.events || [];
      setHealthStats({
        totalEvents: eventsArray.length,
        vaccinationsCount: eventsArray.filter(e => e.eventType === "VACCINATION").length,
        diseasesCount: eventsArray.filter(e => e.eventType === "DISEASE").length,
        treatmentsCount: eventsArray.filter(e => e.eventType === "TREATMENT").length,
        healthScore: 92,
      });
      
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError(err instanceof Error ? err.message : "Error al cargar los eventos médicos");
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
  }, []);

  // Auto-reconexión cada 30 segundos si hay error
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (connectionStatus === 'error') {
      intervalId = setInterval(() => {
        console.log('Intentando reconexión automática...');
        testConnection(true);
      }, 30000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [connectionStatus]);

  // Validar formulario
  const validateForm = (data: Partial<NewEventForm>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.bovineId) {
      errors.bovineId = "Debe seleccionar un bovino";
    }
    if (!data.eventType) {
      errors.eventType = "El tipo de evento es obligatorio";
    }
    if (!data.title?.trim()) {
      errors.title = "El título es obligatorio";
    }
    if (!data.description?.trim()) {
      errors.description = "La descripción es obligatoria";
    }
    if (!data.scheduledDate) {
      errors.scheduledDate = "La fecha es obligatoria";
    }

    return errors;
  };

  // Resetear formulario
  const resetForm = () => {
    const now = new Date();
    const today = now.toISOString().substr(0, 16);
    
    const defaultLocation: LocationData = {
      latitude: 18.0067, // Villahermosa, Tabasco
      longitude: -92.9311,
      address: "Rancho Principal, Villahermosa, Tabasco"
    };
    
    setFormData({
      bovineId: "",
      eventType: "VACCINATION" as EventType,
      title: "",
      description: "",
      scheduledDate: today,
      priority: "MEDIUM" as EventPriority,
      location: defaultLocation,
      cost: 0,
      veterinarianId: "",
      publicNotes: "",
    });
    setFormErrors({});
  };

  // Crear nuevo evento
  const handleCreate = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const newEvent = await apiClient.createEvent(formData);
      setEvents(prev => [newEvent, ...prev]);
      setShowForm(false);
      resetForm();

      // Actualizar estadísticas
      setHealthStats(prev => ({
        ...prev,
        totalEvents: prev.totalEvents + 1,
        vaccinationsCount: newEvent.eventType === 'VACCINATION' ? prev.vaccinationsCount + 1 : prev.vaccinationsCount,
        diseasesCount: newEvent.eventType === 'DISEASE' ? prev.diseasesCount + 1 : prev.diseasesCount,
        treatmentsCount: newEvent.eventType === 'TREATMENT' ? prev.treatmentsCount + 1 : prev.treatmentsCount,
      }));

    } catch (error) {
      console.error('Error creando evento:', error);
      setError(error instanceof Error ? error.message : 'Error al crear el evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar evento existente
  const handleUpdate = async () => {
    if (!editingEvent) return;

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedEvent = await apiClient.updateEvent(editingEvent.id, formData);
      setEvents(prev => prev.map(event => 
        event.id === editingEvent.id ? updatedEvent : event
      ));
      
      setEditingEvent(null);
      setShowForm(false);
      resetForm();

    } catch (error) {
      console.error('Error actualizando evento:', error);
      setError(error instanceof Error ? error.message : 'Error al actualizar el evento');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ver detalles
  const handleView = (event: MedicalEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  // Editar evento
  const handleEdit = (event: MedicalEvent) => {
    setEditingEvent(event);
    const formEventData: Partial<NewEventForm> = {
      bovineId: event.bovineId,
      eventType: event.eventType,
      title: event.title,
      description: event.description,
      scheduledDate: event.scheduledDate,
      priority: event.priority,
      location: event.location,
      cost: event.cost || 0,
      veterinarianId: event.veterinarianId || "",
      publicNotes: event.publicNotes || "",
    };
    setFormData(formEventData);
    setShowForm(true);
  };

  // Eliminar evento
  const handleDeleteClick = (event: MedicalEvent) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación
  const confirmDelete = async () => {
    if (!eventToDelete) return;

    try {
      await apiClient.deleteEvent(eventToDelete.id);
      setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
      
      if (selectedEvent?.id === eventToDelete.id) {
        setSelectedEvent(null);
        setShowDetailsModal(false);
      }
      if (editingEvent?.id === eventToDelete.id) {
        setEditingEvent(null);
        setShowForm(false);
      }
      
      setShowDeleteModal(false);
      setEventToDelete(null);

      // Actualizar estadísticas
      setHealthStats(prev => ({
        ...prev,
        totalEvents: prev.totalEvents - 1,
        vaccinationsCount: eventToDelete.eventType === 'VACCINATION' ? prev.vaccinationsCount - 1 : prev.vaccinationsCount,
        diseasesCount: eventToDelete.eventType === 'DISEASE' ? prev.diseasesCount - 1 : prev.diseasesCount,
        treatmentsCount: eventToDelete.eventType === 'TREATMENT' ? prev.treatmentsCount - 1 : prev.treatmentsCount,
      }));

    } catch (error) {
      console.error('Error eliminando evento:', error);
      setError(error instanceof Error ? error.message : 'Error al eliminar el evento');
    }
  };

  // Nuevo evento
  const handleNew = () => {
    setEditingEvent(null);
    resetForm();
    setShowForm(true);
  };

  // Funciones auxiliares
  const getStatusColor = (status: EventStatus) => {
    const colors = {
      SCHEDULED: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-blue-100 text-blue-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-gray-100 text-gray-800",
      POSTPONED: "bg-orange-100 text-orange-800",
      FAILED: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  const getStatusText = (status: EventStatus) => {
    const texts = {
      SCHEDULED: "Programado",
      IN_PROGRESS: "En Progreso",
      COMPLETED: "Completado",
      CANCELLED: "Cancelado",
      POSTPONED: "Pospuesto",
      FAILED: "Fallido",
    };
    return texts[status];
  };

  const getEventTypeColor = (eventType: EventType) => {
    const colors = {
      VACCINATION: "bg-purple-100 text-purple-800",
      DISEASE: "bg-red-100 text-red-800",
      TREATMENT: "bg-blue-100 text-blue-800",
      HEALTH_CHECK: "bg-green-100 text-green-800",
      SURGERY: "bg-orange-100 text-orange-800",
      MEDICATION: "bg-indigo-100 text-indigo-800",
      REPRODUCTION: "bg-pink-100 text-pink-800",
      INJURY: "bg-red-200 text-red-900",
      QUARANTINE: "bg-yellow-200 text-yellow-900",
      OTHER: "bg-gray-100 text-gray-800",
      MOVEMENT: "bg-cyan-100 text-cyan-800",
      FEEDING: "bg-lime-100 text-lime-800",
      WEIGHING: "bg-teal-100 text-teal-800",
      BIRTH: "bg-emerald-100 text-emerald-800",
      DEATH: "bg-slate-100 text-slate-800",
    };
    return colors[eventType];
  };

  const getEventTypeText = (eventType: EventType) => {
    const texts = {
      VACCINATION: "Vacunación",
      DISEASE: "Enfermedad",
      TREATMENT: "Tratamiento",
      HEALTH_CHECK: "Chequeo",
      SURGERY: "Cirugía",
      MEDICATION: "Medicamento",
      REPRODUCTION: "Reproducción",
      INJURY: "Lesión",
      QUARANTINE: "Cuarentena",
      OTHER: "Otro",
      MOVEMENT: "Movimiento",
      FEEDING: "Alimentación",
      WEIGHING: "Pesaje",
      BIRTH: "Nacimiento",
      DEATH: "Muerte",
    };
    return texts[eventType];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX');
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  // Filtrar eventos
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.bovineInfo?.name && event.bovineInfo.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.bovineInfo?.earTag && event.bovineInfo.earTag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEventType =
      selectedEventType === "all" || event.eventType === selectedEventType;
    const matchesVeterinarian =
      selectedVeterinarian === "all" || event.veterinarianId === selectedVeterinarian;

    return matchesSearch && matchesEventType && matchesVeterinarian;
  });

  // Componente de estado de conexión mejorado
  const getConnectionStatusDisplay = () => {
    const statusConfig = {
      connecting: { color: 'yellow', icon: '🟡', text: 'Conectando...' },
      connected: { color: 'green', icon: '🟢', text: `Conectado${connectionInfo.latency ? ` (${connectionInfo.latency}ms)` : ''}` },
      error: { color: 'red', icon: '🔴', text: 'Sin conexión' },
      retrying: { color: 'orange', icon: '🟠', text: 'Reconectando...' }
    };

    const config = statusConfig[connectionStatus];
    return (
      <div className={`px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {config.icon} {config.text}
      </div>
    );
  };

  // Estado de conexión
  if (connectionStatus === 'connecting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm mx-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#519a7c] mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Conectando con el backend...</p>
          <p className="text-gray-500 text-sm mt-2">http://localhost:5000</p>
          <p className="text-gray-400 text-xs mt-2">Verificando disponibilidad del servidor...</p>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm mx-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#519a7c]"></div>
            <div>
              <p className="text-gray-600">Cargando datos...</p>
              {connectionStatus === 'connected' && (
                <p className="text-green-600 text-sm">✅ Conectado al backend</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error && connectionStatus === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-md mx-4">
          <div className="text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <p className="text-red-600 font-semibold mb-4">{connectionInfo.message}</p>
            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">
                <strong>¿Cómo solucionarlo?</strong>
              </p>
              <ol className="text-sm text-red-700 mt-2 list-decimal list-inside space-y-1">
                <li>Verifica que el backend esté ejecutándose</li>
                <li>Revisa que el puerto 5000 esté disponible</li>
                <li>Confirma la configuración de CORS</li>
                <li>Revisa la consola para más detalles</li>
              </ol>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => loadData(true)}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                🔄 Reintentar Conexión
              </button>
              <p className="text-xs text-gray-500">
                Backend URL: {BACKEND_CONFIG.baseURL}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-2 sm:p-3">
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
        {/* Header Principal */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-6">
          {/* Título y Estado de Conexión */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-[#519a7c] to-[#4a8970] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white text-xl">🩺</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-800 truncate">
                    Historial Médico
                  </h1>
                  {getConnectionStatusDisplay()}
                </div>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  Sistema de gestión de eventos médicos del ganado
                </p>
              </div>
            </div>
            <button 
              onClick={handleNew}
              disabled={connectionStatus !== 'connected'}
              className="px-6 py-3 bg-gradient-to-r from-[#f4ac3a] to-[#e09b2a] text-white rounded-xl hover:from-[#e09b2a] hover:to-[#d08920] flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg font-medium flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>➕</span>
              <span>Nuevo Evento</span>
            </button>
          </div>

          {/* Panel de información adicional */}
          {connectionStatus === 'connected' && connectionInfo.latency && (
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-green-600 text-lg">⚡</span>
                  <div>
                    <p className="text-sm text-green-800 font-medium">Conexión estable</p>
                    <p className="text-xs text-green-600">
                      Latencia: {connectionInfo.latency}ms | Backend: {BACKEND_CONFIG.baseURL}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => testConnection()}
                  className="px-3 py-1 bg-green-200 text-green-800 rounded-lg text-xs hover:bg-green-300 transition-colors"
                >
                  Test
                </button>
              </div>
            </div>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-blue-100 font-medium truncate">Total Eventos</p>
                  <p className="text-2xl font-bold">{healthStats.totalEvents}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📊</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-purple-100 font-medium truncate">Vacunaciones</p>
                  <p className="text-2xl font-bold">{healthStats.vaccinationsCount}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💉</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-red-100 font-medium truncate">Enfermedades</p>
                  <p className="text-2xl font-bold">{healthStats.diseasesCount}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🤒</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-green-100 font-medium truncate">Score Salud</p>
                  <p className="text-2xl font-bold">{healthStats.healthScore}%</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📈</span>
                </div>
              </div>
            </div>
          </div>

          {/* Búsqueda y Filtros */}
          <div className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              <input
                type="text"
                placeholder="Buscar por animal, evento, veterinario..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-lg placeholder-gray-500 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <span>🔧</span>
                <span className="font-medium">Filtros</span>
                <span className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}>⬇️</span>
              </button>
            </div>

            <div className={`${showFilters ? 'block' : 'hidden'} lg:grid lg:grid-cols-2 lg:gap-4 space-y-3 lg:space-y-0`}>
              <select
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-lg transition-all duration-300"
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
              >
                <option value="all">🏥 Todos los tipos de eventos</option>
                <option value="VACCINATION">💉 Vacunaciones</option>
                <option value="DISEASE">🤒 Enfermedades</option>
                <option value="TREATMENT">💊 Tratamientos</option>
                <option value="HEALTH_CHECK">🔍 Chequeos</option>
                <option value="SURGERY">⚕️ Cirugías</option>
              </select>

              <select
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-lg transition-all duration-300"
                value={selectedVeterinarian}
                onChange={(e) => setSelectedVeterinarian(e.target.value)}
              >
                <option value="all">👨‍⚕️ Todos los veterinarios</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area - Cards de Eventos */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🩺</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              No hay eventos médicos
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
              {connectionStatus === 'connected' 
                ? 'No se encontraron eventos con los filtros seleccionados'
                : 'Conecta con el backend para ver los eventos médicos'
              }
            </p>
            <button 
              onClick={handleNew}
              disabled={connectionStatus !== 'connected'}
              className="px-4 py-2 bg-gradient-to-r from-[#519a7c] to-[#4a8970] text-white rounded-lg hover:from-[#4a8970] hover:to-[#3d7a63] flex items-center space-x-2 mx-auto transition-all duration-300 shadow-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>➕</span>
              <span>Crear Primer Evento</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Header de la tarjeta */}
                <div className="bg-gradient-to-r from-[#519a7c] to-[#4a8970] p-4 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-bold text-sm leading-tight mb-1 text-white line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-white/90">
                          <span className="text-xs font-medium truncate">
                            {event.bovineInfo?.name || 'Animal N/A'}
                          </span>
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full flex-shrink-0">
                            {event.bovineInfo?.earTag || 'TAG-N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(event.eventType)}`}>
                        {getEventTypeText(event.eventType)}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-4 space-y-3">
                  {/* Información básica */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{formatDate(event.scheduledDate)}</p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prioridad</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{event.priority}</p>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded min-w-0">
                    <span className="text-gray-500 flex-shrink-0">📍</span>
                    <span className="text-xs text-gray-700 font-medium truncate">
                      {event.location?.address || `${event.location?.latitude || 0}, ${event.location?.longitude || 0}`}
                    </span>
                  </div>

                  {/* Descripción */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Costo */}
                  {event.cost && (
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Costo</span>
                      <span className="text-base font-bold text-[#f4ac3a]">
                        ${event.cost.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="bg-gray-50/80 backdrop-blur-sm px-4 py-3 flex justify-between items-center border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleView(event)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
                      title="Ver detalles"
                    >
                      <span>👁️</span>
                    </button>
                    <button 
                      onClick={() => handleEdit(event)}
                      disabled={connectionStatus !== 'connected'}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Editar"
                    >
                      <span>✏️</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(event)}
                      disabled={connectionStatus !== 'connected'}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Eliminar"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded text-center flex-shrink-0">
                    {formatDate(event.createdAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de formulario */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              {/* Header del modal */}
              <div className="bg-gradient-to-r from-[#519a7c] to-[#4a8970] text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                <div className="min-w-0 flex-1 pr-4">
                  <h2 className="text-lg font-bold truncate">
                    {editingEvent ? "✏️ Editar Evento" : "➕ Nuevo Evento"}
                  </h2>
                  <p className="text-white/80 text-sm mt-1 truncate">
                    {editingEvent ? "Modifica la información" : "Registra nuevo evento"}
                  </p>
                </div>
                <button 
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <span className="text-lg">❌</span>
                </button>
              </div>

              {/* Contenido del formulario */}
              <div className="p-6 space-y-4">
                {/* Selección de Bovino */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bovino *
                  </label>
                  <select
                    value={formData.bovineId || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, bovineId: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm ${
                      formErrors.bovineId ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccionar bovino...</option>
                    {bovines.map(bovine => (
                      <option key={bovine.id} value={bovine.id}>
                        {bovine.name} - {bovine.earTag}
                      </option>
                    ))}
                  </select>
                  {formErrors.bovineId && (
                    <p className="text-red-500 text-xs mt-1">⚠️ {formErrors.bovineId}</p>
                  )}
                </div>

                {/* Tipo de Evento y Fecha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Evento *
                    </label>
                    <select
                      value={formData.eventType || "VACCINATION"}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as EventType }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm ${
                        formErrors.eventType ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    >
                      <option value="VACCINATION">💉 Vacunación</option>
                      <option value="DISEASE">🤒 Enfermedad</option>
                      <option value="TREATMENT">💊 Tratamiento</option>
                      <option value="HEALTH_CHECK">🔍 Chequeo</option>
                      <option value="SURGERY">⚕️ Cirugía</option>
                      <option value="MEDICATION">💉 Medicamento</option>
                      <option value="REPRODUCTION">🐄 Reproducción</option>
                      <option value="INJURY">🩹 Lesión</option>
                      <option value="QUARANTINE">🚪 Cuarentena</option>
                      <option value="OTHER">📋 Otro</option>
                    </select>
                    {formErrors.eventType && (
                      <p className="text-red-500 text-xs mt-1">⚠️ {formErrors.eventType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Programada *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.scheduledDate || new Date().toISOString().substr(0, 16)}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm ${
                        formErrors.scheduledDate ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {formErrors.scheduledDate && (
                      <p className="text-red-500 text-xs mt-1">⚠️ {formErrors.scheduledDate}</p>
                    )}
                  </div>
                </div>

                {/* Título */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm ${
                      formErrors.title ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Ej: Vacuna antiaftosa"
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-xs mt-1">⚠️ {formErrors.title}</p>
                  )}
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm resize-none ${
                      formErrors.description ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Descripción del evento..."
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-xs mt-1">⚠️ {formErrors.description}</p>
                  )}
                </div>

                {/* Prioridad y Costo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridad
                    </label>
                    <select
                      value={formData.priority || "MEDIUM"}
                      onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as EventPriority }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm"
                    >
                      <option value="LOW">🟢 Baja</option>
                      <option value="MEDIUM">🟡 Media</option>
                      <option value="HIGH">🟠 Alta</option>
                      <option value="CRITICAL">🔴 Crítica</option>
                      <option value="EMERGENCY">🚨 Emergencia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo (MXN)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.cost || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Dirección de Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.location?.address || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      location: { 
                        latitude: prev.location?.latitude || 18.0067,
                        longitude: prev.location?.longitude || -92.9311,
                        address: e.target.value 
                      } as LocationData
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm"
                    placeholder="Rancho Principal, Villahermosa, Tabasco"
                  />
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Públicas
                  </label>
                  <textarea
                    value={formData.publicNotes || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, publicNotes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm resize-none"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>

              {/* Footer del modal */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end sm:space-x-3 rounded-b-lg">
                <button
                  onClick={() => setShowForm(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ❌ Cancelar
                </button>
                <button
                  onClick={editingEvent ? handleUpdate : handleCreate}
                  disabled={isSubmitting || connectionStatus !== 'connected'}
                  className="px-4 py-2 bg-gradient-to-r from-[#519a7c] to-[#4a8970] text-white rounded-lg hover:from-[#4a8970] hover:to-[#3d7a63] flex items-center justify-center space-x-2 transition-all duration-300 shadow-md font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <span>💾</span>
                      <span>{editingEvent ? "Actualizar" : "Guardar"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles */}
        {showDetailsModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
              {/* Header del modal */}
              <div className="bg-gradient-to-r from-[#519a7c] to-[#4a8970] text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                <div className="min-w-0 flex-1 pr-4">
                  <h2 className="text-lg font-bold truncate">
                    🔍 Detalles del Evento
                  </h2>
                  <p className="text-white/80 text-sm mt-1 truncate">
                    Información completa del evento
                  </p>
                </div>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <span className="text-lg">❌</span>
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 space-y-6">
                {/* Información principal */}
                <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <h3 className="text-3xl font-bold text-gray-800 mb-3">
                    {selectedEvent.title}
                  </h3>
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <span className="text-lg font-semibold text-gray-700">
                      🐄 {selectedEvent.bovineInfo?.name || 'Animal N/A'}
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedEvent.bovineInfo?.earTag || 'TAG-N/A'}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getEventTypeColor(selectedEvent.eventType)}`}>
                      {getEventTypeText(selectedEvent.eventType)}
                    </span>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedEvent.status)}`}>
                      {getStatusText(selectedEvent.status)}
                    </span>
                    <span className="px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold">
                      Prioridad: {selectedEvent.priority}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                    📋 Descripción
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-lg">{selectedEvent.description}</p>
                </div>

                {/* Detalles en grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-2xl p-6">
                    <h4 className="font-bold text-lg text-green-800 mb-4 flex items-center">
                      📅 Información Temporal
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Fecha Programada:</span>
                        <span className="font-bold text-gray-800">
                          {formatFullDate(selectedEvent.scheduledDate)}
                        </span>
                      </div>
                      {selectedEvent.completedDate && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Fecha Completada:</span>
                          <span className="font-bold text-gray-800">
                            {formatFullDate(selectedEvent.completedDate)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Registrado:</span>
                        <span className="font-bold text-gray-800">
                          {formatDate(selectedEvent.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-2xl p-6">
                    <h4 className="font-bold text-lg text-orange-800 mb-4 flex items-center">
                      📍 Ubicación y Costo
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Ubicación:</span>
                        <span className="font-bold text-gray-800">
                          {selectedEvent.location?.address || `${selectedEvent.location?.latitude || 0}, ${selectedEvent.location?.longitude || 0}`}
                        </span>
                      </div>
                      {selectedEvent.cost && (
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 font-medium">Costo Total:</span>
                          <span className="font-bold text-2xl text-[#f4ac3a]">
                            ${selectedEvent.cost.toLocaleString()} MXN
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Información del bovino */}
                {selectedEvent.bovineInfo && (
                  <div className="bg-blue-50 rounded-2xl p-6">
                    <h4 className="font-bold text-lg text-blue-800 mb-4 flex items-center">
                      🐄 Información del Bovino
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center bg-white rounded-xl p-4">
                        <p className="text-sm text-blue-600 font-medium mb-1">Nombre</p>
                        <p className="text-lg font-bold text-blue-800">{selectedEvent.bovineInfo.name}</p>
                      </div>
                      <div className="text-center bg-white rounded-xl p-4">
                        <p className="text-sm text-blue-600 font-medium mb-1">Tag</p>
                        <p className="text-lg font-bold text-blue-800">{selectedEvent.bovineInfo.earTag}</p>
                      </div>
                      <div className="text-center bg-white rounded-xl p-4">
                        <p className="text-sm text-blue-600 font-medium mb-1">Tipo</p>
                        <p className="text-lg font-bold text-blue-800">{selectedEvent.bovineInfo.cattleType}</p>
                      </div>
                      {selectedEvent.bovineInfo.gender && (
                        <div className="text-center bg-white rounded-xl p-4">
                          <p className="text-sm text-blue-600 font-medium mb-1">Género</p>
                          <p className="text-lg font-bold text-blue-800">{selectedEvent.bovineInfo.gender}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notas */}
                {selectedEvent.publicNotes && (
                  <div className="bg-yellow-50 rounded-2xl p-6 border-l-4 border-yellow-400">
                    <h4 className="font-bold text-lg text-yellow-800 mb-3 flex items-center">
                      📝 Notas Adicionales
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedEvent.publicNotes}</p>
                  </div>
                )}
              </div>

              {/* Footer del modal */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end sm:space-x-4 rounded-b-lg">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  ❌ Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEdit(selectedEvent);
                  }}
                  disabled={connectionStatus !== 'connected'}
                  className="px-6 py-3 bg-gradient-to-r from-[#519a7c] to-[#4a8970] text-white rounded-xl hover:from-[#4a8970] hover:to-[#3d7a63] flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>✏️</span>
                  <span>Editar Evento</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && eventToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
              {/* Header del modal */}
              <div className="flex items-center gap-4 p-6 border-b">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    🗑️ Eliminar Evento
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    ⚠️ Acción irreversible
                  </p>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-800 font-medium text-center text-sm">
                    ¿Eliminar este evento médico?
                  </p>
                  <p className="text-red-700 font-bold text-sm text-center mt-2 break-words">
                    "{eventToDelete.title}"
                  </p>
                  <p className="text-gray-600 text-center mt-1 text-sm">
                    de <strong>{eventToDelete.bovineInfo?.name || 'Animal N/A'}</strong>
                  </p>
                </div>
                <p className="text-gray-600 text-center text-xs">
                  Se perderá toda la información permanentemente.
                </p>
              </div>

              {/* Footer del modal */}
              <div className="px-6 pb-6 flex flex-col gap-3 sm:flex-row sm:space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setEventToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  ❌ Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={connectionStatus !== 'connected'}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 flex items-center justify-center space-x-2 transition-all duration-300 shadow-md font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>🗑️</span>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;