import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Scale,
  DollarSign,
  CheckCircle,
} from "lucide-react";

// Interfaces simplificadas
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

interface FeedingStatistics {
  totalEvents: number;
  totalFeedConsumed: number;
  averageDailyConsumption: number;
  totalCost: number;
  averageCostPerKg: number;
  feedEfficiency: number;
}

const EventFeeding: React.FC = () => {
  // Estados principales
  const [feedingEvents, setFeedingEvents] = useState<FeedingEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<FeedingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  
  // Estados para modales
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<FeedingEvent | null>(null);
  const [statistics, setStatistics] = useState<FeedingStatistics | null>(null);

  // Estados para formulario
  const [formData, setFormData] = useState<Partial<FeedingEvent>>({
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

  // Estados para notificaciones
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({ show: false, message: '', type: 'info' });

  // Estados para geolocalización
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Opciones para selects
  const eventTypes = [
    { id: "daily_feeding", name: "Alimentación Diaria", color: "text-green-600" },
    { id: "supplement_feeding", name: "Suplementación", color: "text-blue-600" },
    { id: "forage_feeding", name: "Forraje", color: "text-yellow-600" },
    { id: "mineral_feeding", name: "Minerales", color: "text-purple-600" },
    { id: "treatment_feeding", name: "Alimentación Terapéutica", color: "text-red-600" },
  ];

  const feedTypes = [
    { id: "alfalfa_hay", name: "Heno de Alfalfa", category: "hay" },
    { id: "corn_silage", name: "Ensilaje de Maíz", category: "silage" },
    { id: "protein_concentrate", name: "Concentrado Proteico", category: "concentrate" },
    { id: "grain_corn", name: "Grano de Maíz", category: "grain" },
    { id: "mineral_supplement", name: "Suplemento Mineral", category: "mineral" },
  ];

  const statusOptions = [
    { id: "scheduled", name: "Programado", color: "text-blue-600 bg-blue-100" },
    { id: "completed", name: "Completado", color: "text-green-600 bg-green-100" },
    { id: "in_progress", name: "En Progreso", color: "text-yellow-600 bg-yellow-100" },
    { id: "cancelled", name: "Cancelado", color: "text-red-600 bg-red-100" },
    { id: "pending", name: "Pendiente", color: "text-purple-600 bg-purple-100" },
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const loadFeedingEvents = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockEvents: FeedingEvent[] = [
          {
            id: "1",
            bovineId: "bov_001",
            bovineName: "Esperanza",
            bovineTag: "ESP-001",
            eventType: "daily_feeding",
            status: "completed",
            scheduledDate: "2024-12-20T07:00:00Z",
            completedDate: "2024-12-20T07:15:00Z",
            feedType: "alfalfa_hay",
            quantity: 15,
            unit: "kg",
            cost: 375.0,
            location: "Corral Norte",
            responsible: "Juan Pérez",
            notes: "Alimentación matutina completada satisfactoriamente.",
            createdAt: "2024-12-19T10:00:00Z",
            updatedAt: "2024-12-20T07:15:00Z",
          },
          {
            id: "2",
            bovineId: "bov_002",
            bovineName: "Paloma",
            bovineTag: "PAL-002",
            eventType: "supplement_feeding",
            status: "scheduled",
            scheduledDate: "2024-12-25T08:00:00Z",
            feedType: "protein_concentrate",
            quantity: 8,
            unit: "kg",
            cost: 360.0,
            location: "Corral Sur",
            responsible: "María González",
            notes: "Suplementación proteica programada para mejorar condición corporal",
            createdAt: "2024-12-20T14:00:00Z",
            updatedAt: "2024-12-20T14:00:00Z",
          },
        ];

        setFeedingEvents(mockEvents);

        const mockStatistics: FeedingStatistics = {
          totalEvents: 156,
          totalFeedConsumed: 2340,
          averageDailyConsumption: 18.5,
          totalCost: 45600.0,
          averageCostPerKg: 19.5,
          feedEfficiency: 92.5,
        };

        setStatistics(mockStatistics);
      } catch (error) {
        console.error("Error cargando eventos de alimentación:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeedingEvents();
  }, []);

  // Filtrar eventos
  useEffect(() => {
    let filtered = feedingEvents;

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.bovineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.bovineTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.feedType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedEventType !== "all") {
      filtered = filtered.filter((event) => event.eventType === selectedEventType);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((event) => event.status === selectedStatus);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((event) => {
            const eDate = new Date(event.scheduledDate);
            return eDate.toDateString() === now.toDateString();
          });
          break;
        case "week":
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((event) => {
            const eDate = new Date(event.scheduledDate);
            return eDate >= now && eDate <= weekFromNow;
          });
          break;
        case "month":
          const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((event) => {
            const eDate = new Date(event.scheduledDate);
            return eDate >= now && eDate <= monthFromNow;
          });
          break;
      }
    }

    setFilteredEvents(filtered);
  }, [feedingEvents, searchTerm, selectedEventType, selectedStatus, dateFilter]);

  // Funciones CRUD
  const handleCreateEvent = () => {
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
    setShowCreateModal(true);
  };

  const handleEditEvent = (event: FeedingEvent) => {
    setFormData(event);
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleViewEvent = (event: FeedingEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    const eventToDelete = feedingEvents.find(e => e.id === eventId);
    const eventName = eventToDelete ? `${eventToDelete.bovineName} - ${getEventTypeName(eventToDelete.eventType)}` : 'este evento';
    
    if (window.confirm(`¿Estás seguro de eliminar el evento de alimentación para ${eventName}?`)) {
      try {
        setFeedingEvents((prev) => prev.filter((event) => event.id !== eventId));
        showNotification("Evento eliminado correctamente", "success");
      } catch (error) {
        console.error("Error al eliminar evento:", error);
        showNotification("Error al eliminar el evento", "error");
      }
    }
  };

  // Función para mostrar notificaciones
  const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'info' });
    }, 3000);
  };

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("La geolocalización no está soportada por este navegador");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Usar servicio de geocodificación inversa para obtener la dirección
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=demo&language=es&no_annotations=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const result = data.results[0];
              const address = result.formatted || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
              setFormData(prev => ({ ...prev, location: address }));
              showNotification("Ubicación obtenida correctamente", "success");
            } else {
              // Si no hay resultados de geocodificación, usar coordenadas
              setFormData(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
              showNotification("Coordenadas obtenidas", "info");
            }
          } else {
            // Si falla la geocodificación, usar coordenadas
            setFormData(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
            showNotification("Coordenadas obtenidas", "info");
          }
        } catch (error) {
          console.error("Error en geocodificación:", error);
          // Usar coordenadas como fallback
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({ ...prev, location: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}` }));
          showNotification("Coordenadas obtenidas", "info");
        }
        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = "No se pudo obtener la ubicación";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Acceso a la ubicación denegado por el usuario";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Información de ubicación no disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado al obtener la ubicación";
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSaveEvent = () => {
    if (!formData.bovineName || !formData.bovineTag || !formData.scheduledDate) {
      showNotification("Por favor completa todos los campos requeridos", "error");
      return;
    }

    const now = new Date().toISOString();
    
    if (showCreateModal) {
      // Crear nuevo evento
      const newEvent: FeedingEvent = {
        ...formData as FeedingEvent,
        id: Date.now().toString(),
        bovineId: `bov_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };
      setFeedingEvents((prev) => [...prev, newEvent]);
      setShowCreateModal(false);
      showNotification("Evento creado correctamente", "success");
    } else if (showEditModal && selectedEvent) {
      // Editar evento existente
      const updatedEvent: FeedingEvent = {
        ...selectedEvent,
        ...formData,
        updatedAt: now,
      };
      setFeedingEvents((prev) =>
        prev.map((event) => (event.id === selectedEvent.id ? updatedEvent : event))
      );
      setShowEditModal(false);
      showNotification("Evento actualizado correctamente", "success");
    }

    setFormData({});
    setSelectedEvent(null);
  };

  const handleCancelEdit = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setFormData({});
    setSelectedEvent(null);
    setLocationError(null);
    setIsGettingLocation(false);
  };

  // Funciones auxiliares
  const getStatusColor = (status: string) => {
    const statusObj = statusOptions.find(s => s.id === status);
    return statusObj?.color || "text-gray-600 bg-gray-100";
  };

  const getEventTypeName = (eventType: string) => {
    const type = eventTypes.find(t => t.id === eventType);
    return type?.name || eventType;
  };

  const getFeedTypeName = (feedType: string) => {
    const type = feedTypes.find(t => t.id === feedType);
    return type?.name || feedType;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando eventos de alimentación...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl text-white"
              >
                <Package className="h-8 w-8" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Eventos de Alimentación
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona la nutrición y alimentación de tu ganado
                </p>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateEvent}
              className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Nuevo Evento</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas */}
      {statistics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                  <p className="text-3xl font-bold text-green-600">{statistics.totalEvents}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Package className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Consumo Total</p>
                  <p className="text-3xl font-bold text-blue-600">{statistics.totalFeedConsumed} kg</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Scale className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Costo Total</p>
                  <p className="text-3xl font-bold text-purple-600">${statistics.totalCost.toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Eficiencia</p>
                  <p className="text-3xl font-bold text-orange-600">{statistics.feedEfficiency}%</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <CheckCircle className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filtros */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por vaca, alimento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
              />
            </div>

            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todos los tipos</option>
              {eventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todos los estados</option>
              {statusOptions.map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Próxima semana</option>
              <option value="month">Próximo mes</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Lista de Eventos */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
      >
        {filteredEvents.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200"
          >
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay eventos de alimentación
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedEventType !== "all" || selectedStatus !== "all" || dateFilter !== "all"
                ? "No se encontraron eventos que coincidan con los filtros aplicados."
                : "Comienza creando tu primer evento de alimentación."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateEvent}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:from-green-700 hover:to-blue-700 transition-all"
            >
              Crear Primer Evento
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
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
                        {event.bovineName} • {event.bovineTag}
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
                    {getFeedTypeName(event.feedType)}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Cantidad:</span>
                      <span className="font-medium ml-1">{event.quantity} {event.unit}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Costo:</span>
                      <span className="font-medium ml-1">${event.cost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Información del evento */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.scheduledDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{event.responsible}</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex items-center justify-end space-x-1 mt-4 pt-4 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewEvent(event);
                    }}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                    title="Ver detalles"
                  >
                    <Eye className="h-4 w-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEvent(event);
                    }}
                    className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
                    title="Editar"
                  >
                    <Edit3 className="h-4 w-4" />
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteEvent(event.id);
                    }}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal de detalles */}
      <AnimatePresence>
        {showDetailsModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles del Evento
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </motion.button>
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
                    <label className="text-sm font-medium text-gray-600">Vaca</label>
                    <p className="text-gray-900">{selectedEvent.bovineName} ({selectedEvent.bovineTag})</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Fecha</label>
                    <p className="text-gray-900">{formatDate(selectedEvent.scheduledDate)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tipo de Alimento</label>
                    <p className="text-gray-900">{getFeedTypeName(selectedEvent.feedType)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cantidad</label>
                    <p className="text-gray-900">{selectedEvent.quantity} {selectedEvent.unit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Ubicación</label>
                    <p className="text-gray-900">{selectedEvent.location}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Responsable</label>
                    <p className="text-gray-900">{selectedEvent.responsible}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Costo</label>
                  <p className="text-gray-900 text-xl font-bold">${selectedEvent.cost.toFixed(2)}</p>
                </div>

                {selectedEvent.notes && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Notas</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedEvent.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEditEvent(selectedEvent);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editar</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de crear/editar */}
      <AnimatePresence>
        {(showCreateModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleCancelEdit}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {showCreateModal ? "Crear Evento de Alimentación" : "Editar Evento"}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleCancelEdit}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Vaca *
                    </label>
                    <input
                      type="text"
                      value={formData.bovineName || ""}
                      onChange={(e) => setFormData({ ...formData, bovineName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej: Esperanza"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etiqueta *
                    </label>
                    <input
                      type="text"
                      value={formData.bovineTag || ""}
                      onChange={(e) => setFormData({ ...formData, bovineTag: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej: ESP-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Evento
                    </label>
                    <select
                      value={formData.eventType || ""}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {eventTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.status || ""}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {statusOptions.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha y Hora *
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
                      Tipo de Alimento
                    </label>
                    <select
                      value={formData.feedType || ""}
                      onChange={(e) => setFormData({ ...formData, feedType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      {feedTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Unidad
                    </label>
                    <select
                      value={formData.unit || ""}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="kg">Kilogramos (kg)</option>
                      <option value="lbs">Libras (lbs)</option>
                      <option value="tons">Toneladas</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      value={formData.quantity || ""}
                      onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="0"
                      min="0"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Costo
                    </label>
                    <input
                      type="number"
                      value={formData.cost || ""}
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
                      Ubicación
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={formData.location || ""}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Ej: Corral Norte"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        title="Obtener ubicación actual"
                      >
                        {isGettingLocation ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                      </motion.button>
                    </div>
                    {locationError && (
                      <p className="text-red-500 text-xs mt-1">{locationError}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Responsable
                    </label>
                    <input
                      type="text"
                      value={formData.responsible || ""}
                      onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Ej: Juan Pérez"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Notas adicionales..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSaveEvent}
                  className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>{showCreateModal ? "Crear Evento" : "Guardar Cambios"}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCancelEdit}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notificación */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            className="fixed top-4 right-4 z-50"
          >
            <div className={`px-6 py-4 rounded-lg shadow-lg ${
              notification.type === 'success' 
                ? 'bg-green-500 text-white' 
                : notification.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-blue-500 text-white'
            }`}>
              <div className="flex items-center space-x-2">
                {notification.type === 'success' && <CheckCircle className="h-5 w-5" />}
                {notification.type === 'error' && <X className="h-5 w-5" />}
                {notification.type === 'info' && <Package className="h-5 w-5" />}
                <span>{notification.message}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventFeeding;