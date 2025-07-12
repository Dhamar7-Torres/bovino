import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Baby,
  Calendar,
  MapPin,
  User,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Bell,
  FileText,
  MoreVertical,
  TrendingUp,
  Stethoscope,
  Zap,
  Users,
  DollarSign,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Interfaces para TypeScript
interface BreedingEvent {
  id: string;
  bovineId: string;
  bovineName: string;
  bovineTag: string;
  eventType: BreedingEventType;
  status: "scheduled" | "completed" | "failed" | "cancelled" | "pending";
  scheduledDate: string;
  completedDate?: string;
  location: Location;
  notes?: string;

  // Datos específicos según el tipo de evento
  breedingData?: {
    method: "natural" | "artificial_insemination";
    bullId?: string;
    bullTag?: string;
    bullBreed?: string;
    semenBatch?: string;
    semenProvider?: string;
    technician?: string;
    attempts?: number;
    success?: boolean;
    expectedDueDate?: string;
  };

  pregnancyData?: {
    gestationWeek: number;
    method: "palpation" | "ultrasound" | "blood_test";
    result: "pregnant" | "not_pregnant" | "inconclusive";
    fetusCount?: number;
    expectedCalvingDate?: string;
    veterinarian: string;
    nextCheckDate?: string;
  };

  birthData?: {
    calvingDate: string;
    calvingTime: string;
    assistanceRequired: boolean;
    complications?: string[];
    calfGender?: "male" | "female";
    calfWeight?: number;
    calfHealthStatus: "healthy" | "weak" | "sick" | "deceased";
    placentaExpulsion: boolean;
    veterinarian?: string;
    calfTag?: string;
  };

  weaningData?: {
    weaningDate: string;
    weaningWeight?: number;
    method: "natural" | "early" | "gradual";
    reason?: string;
    newLocation?: string;
  };

  cost?: number;
  veterinarian?: string;
  reminders: EventReminder[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface BreedingEventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  category: "breeding" | "pregnancy" | "birth" | "weaning";
  duration?: number; // minutos
  requiresVeterinarian: boolean;
}

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  farm?: string;
  section?: string;
}

interface EventReminder {
  id: string;
  type: "notification" | "email" | "sms";
  timeBeforeEvent: number; // horas
  message: string;
  sent: boolean;
}

interface BreedingStatistics {
  totalEvents: number;
  successfulBreedings: number;
  pregnancyRate: number;
  currentPregnant: number;
  expectedCalvings: number;
  completedBirths: number;
  weanedCalves: number;
  averageGestation: number;
  complications: number;
}

const EventBreeding: React.FC = () => {
  // Estados principales
  const [breedingEvents, setBreedingEvents] = useState<BreedingEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<BreedingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BreedingEvent | null>(
    null
  );
  const [] = useState<"grid" | "list" | "calendar">("grid");
  const [statistics, setStatistics] = useState<BreedingStatistics | null>(null);

  // Hooks de React Router
  const navigate = useNavigate();
  const [] = useSearchParams();

  // Tipos de eventos de reproducción
  const breedingEventTypes: BreedingEventType[] = [
    {
      id: "artificial_insemination",
      name: "Inseminación Artificial",
      icon: Zap,
      color: "text-blue-600",
      description: "Procedimiento de inseminación artificial",
      category: "breeding",
      duration: 30,
      requiresVeterinarian: true,
    },
    {
      id: "natural_breeding",
      name: "Monta Natural",
      icon: Heart,
      color: "text-pink-600",
      description: "Reproducción natural con toro",
      category: "breeding",
      duration: 60,
      requiresVeterinarian: false,
    },
    {
      id: "pregnancy_check",
      name: "Diagnóstico de Preñez",
      icon: Stethoscope,
      color: "text-purple-600",
      description: "Verificación de estado de gestación",
      category: "pregnancy",
      duration: 45,
      requiresVeterinarian: true,
    },
    {
      id: "calving",
      name: "Parto",
      icon: Baby,
      color: "text-green-600",
      description: "Evento de nacimiento de ternero",
      category: "birth",
      duration: 180,
      requiresVeterinarian: false,
    },
    {
      id: "weaning",
      name: "Destete",
      icon: Users,
      color: "text-orange-600",
      description: "Separación de ternero de la madre",
      category: "weaning",
      duration: 120,
      requiresVeterinarian: false,
    },
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const loadBreedingEvents = async () => {
      setLoading(true);
      try {
        // Simular carga de datos desde la API
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Datos simulados para desarrollo
        const mockEvents: BreedingEvent[] = [
          {
            id: "1",
            bovineId: "bov_001",
            bovineName: "Esperanza",
            bovineTag: "ESP-001",
            eventType: breedingEventTypes[0],
            status: "completed",
            scheduledDate: "2024-12-15T08:00:00Z",
            completedDate: "2024-12-15T08:30:00Z",
            location: {
              latitude: 17.9869,
              longitude: -92.9303,
              address: "Sector Norte, Rancho El Progreso",
              farm: "El Progreso",
              section: "Sector Norte",
            },
            breedingData: {
              method: "artificial_insemination",
              semenBatch: "BS2024-456",
              semenProvider: "GenSemen International",
              technician: "Dr. García",
              attempts: 1,
              success: true,
              expectedDueDate: "2024-09-22",
            },
            cost: 250.0,
            veterinarian: "Dr. María García",
            reminders: [],
            attachments: [],
            createdAt: "2024-12-01T10:00:00Z",
            updatedAt: "2024-12-15T08:30:00Z",
            createdBy: "user_001",
            notes: "Procedimiento exitoso sin complicaciones",
          },
          {
            id: "2",
            bovineId: "bov_002",
            bovineName: "Paloma",
            bovineTag: "PAL-002",
            eventType: breedingEventTypes[2],
            status: "scheduled",
            scheduledDate: "2024-12-25T09:00:00Z",
            location: {
              latitude: 17.9869,
              longitude: -92.9303,
              address: "Sector Sur, Rancho El Progreso",
              farm: "El Progreso",
              section: "Sector Sur",
            },
            pregnancyData: {
              gestationWeek: 6,
              method: "ultrasound",
              result: "pregnant",
              fetusCount: 1,
              expectedCalvingDate: "2024-09-20",
              veterinarian: "Dr. López",
              nextCheckDate: "2024-01-25",
            },
            cost: 180.0,
            veterinarian: "Dr. Carlos López",
            reminders: [
              {
                id: "rem_001",
                type: "notification",
                timeBeforeEvent: 24,
                message:
                  "Recordatorio: Diagnóstico de preñez programado para mañana",
                sent: false,
              },
            ],
            attachments: [],
            createdAt: "2024-12-10T14:00:00Z",
            updatedAt: "2024-12-10T14:00:00Z",
            createdBy: "user_001",
            notes: "Segunda verificación de gestación",
          },
        ];

        setBreedingEvents(mockEvents);

        // Calcular estadísticas simuladas
        const mockStatistics: BreedingStatistics = {
          totalEvents: 48,
          successfulBreedings: 42,
          pregnancyRate: 87.5,
          currentPregnant: 15,
          expectedCalvings: 8,
          completedBirths: 23,
          weanedCalves: 18,
          averageGestation: 284,
          complications: 3,
        };

        setStatistics(mockStatistics);
      } catch (error) {
        console.error("Error cargando eventos de reproducción:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBreedingEvents();
  }, []);

  // Filtrar eventos basado en los criterios seleccionados
  useEffect(() => {
    let filtered = breedingEvents;

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.bovineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.bovineTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.eventType.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo de evento
    if (selectedEventType !== "all") {
      filtered = filtered.filter(
        (event) => event.eventType.id === selectedEventType
      );
    }

    // Filtro por estado
    if (selectedStatus !== "all") {
      filtered = filtered.filter((event) => event.status === selectedStatus);
    }

    // Filtro por fecha
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
          const monthFromNow = new Date(
            now.getTime() + 30 * 24 * 60 * 60 * 1000
          );
          filtered = filtered.filter((event) => {
            const eDate = new Date(event.scheduledDate);
            return eDate >= now && eDate <= monthFromNow;
          });
          break;
      }
    }

    setFilteredEvents(filtered);
  }, [
    breedingEvents,
    searchTerm,
    selectedEventType,
    selectedStatus,
    dateFilter,
  ]);

  // Funciones para manejar eventos
  const handleCreateEvent = () => {
    setShowCreateModal(true);
  };

  const handleViewEvent = (event: BreedingEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/events/breeding/edit/${eventId}`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (
      window.confirm("¿Estás seguro de eliminar este evento de reproducción?")
    ) {
      // Implementar lógica de eliminación
      setBreedingEvents((prev) => prev.filter((event) => event.id !== eventId));
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "text-blue-600 bg-blue-100",
      completed: "text-green-600 bg-green-100",
      failed: "text-red-600 bg-red-100",
      cancelled: "text-gray-600 bg-gray-100",
      pending: "text-yellow-600 bg-yellow-100",
    };
    return colors[status as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  // Función para formatear fecha
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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Cargando eventos de reproducción...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
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
                className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white"
              >
                <Heart className="h-8 w-8" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Eventos de Reproducción
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona los eventos reproductivos de tu ganado
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateEvent}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Nuevo Evento</span>
              </motion.button>
            </div>
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
            <motion.div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Tasa de Preñez
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {statistics.pregnancyRate}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Actualmente Preñadas
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {statistics.currentPregnant}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <Heart className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Partos Esperados
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {statistics.expectedCalvings}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Baby className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Terneros Destetados
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {statistics.weanedCalves}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Filtros y Búsqueda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por vaca o evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
              />
            </div>

            {/* Filtro por tipo */}
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todos los tipos</option>
              {breedingEventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            {/* Filtro por estado */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programado</option>
              <option value="completed">Completado</option>
              <option value="failed">Fallido</option>
              <option value="cancelled">Cancelado</option>
              <option value="pending">Pendiente</option>
            </select>

            {/* Filtro por fecha */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
      >
        {filteredEvents.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200"
          >
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay eventos de reproducción
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ||
              selectedEventType !== "all" ||
              selectedStatus !== "all" ||
              dateFilter !== "all"
                ? "No se encontraron eventos que coincidan con los filtros aplicados."
                : "Comienza creando tu primer evento de reproducción."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateEvent}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Crear Primer Evento
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleViewEvent(event)}
              >
                {/* Header del evento */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-xl bg-gradient-to-r ${
                        event.eventType.color.includes("blue")
                          ? "from-blue-500 to-blue-600"
                          : event.eventType.color.includes("pink")
                          ? "from-pink-500 to-pink-600"
                          : event.eventType.color.includes("purple")
                          ? "from-purple-500 to-purple-600"
                          : event.eventType.color.includes("green")
                          ? "from-green-500 to-green-600"
                          : "from-orange-500 to-orange-600"
                      } text-white`}
                    >
                      <event.eventType.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {event.eventType.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {event.bovineName} • {event.bovineTag}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {event.status === "scheduled"
                        ? "Programado"
                        : event.status === "completed"
                        ? "Completado"
                        : event.status === "failed"
                        ? "Fallido"
                        : event.status === "cancelled"
                        ? "Cancelado"
                        : "Pendiente"}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Mostrar menú de opciones
                      }}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </motion.button>
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
                    <span>
                      {event.location.farm} - {event.location.section}
                    </span>
                  </div>

                  {event.veterinarian && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{event.veterinarian}</span>
                    </div>
                  )}

                  {event.cost && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>${event.cost.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Notas si existen */}
                {event.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {event.notes}
                    </p>
                  </div>
                )}

                {/* Acciones rápidas */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    {event.reminders.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600">
                        <Bell className="h-3 w-3" />
                        <span>{event.reminders.length}</span>
                      </div>
                    )}

                    {event.attachments.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <FileText className="h-3 w-3" />
                        <span>{event.attachments.length}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEvent(event);
                      }}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event.id);
                      }}
                      className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
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
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal de detalles del evento */}
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
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-xl ${
                      selectedEvent.eventType.color.includes("blue")
                        ? "bg-blue-100 text-blue-600"
                        : selectedEvent.eventType.color.includes("pink")
                        ? "bg-pink-100 text-pink-600"
                        : selectedEvent.eventType.color.includes("purple")
                        ? "bg-purple-100 text-purple-600"
                        : selectedEvent.eventType.color.includes("green")
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    <selectedEvent.eventType.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedEvent.eventType.name}
                    </h2>
                    <p className="text-gray-600">
                      {selectedEvent.bovineName} • {selectedEvent.bovineTag}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Contenido del modal */}
              <div className="space-y-6">
                {/* Estado y fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedEvent.status
                      )}`}
                    >
                      {selectedEvent.status === "scheduled"
                        ? "Programado"
                        : selectedEvent.status === "completed"
                        ? "Completado"
                        : selectedEvent.status === "failed"
                        ? "Fallido"
                        : selectedEvent.status === "cancelled"
                        ? "Cancelado"
                        : "Pendiente"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Programada
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedEvent.scheduledDate)}
                    </p>
                  </div>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{selectedEvent.location.address}</span>
                  </div>
                </div>

                {/* Veterinario y costo */}
                {(selectedEvent.veterinarian || selectedEvent.cost) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEvent.veterinarian && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Veterinario
                        </label>
                        <div className="flex items-center space-x-2 text-gray-900">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{selectedEvent.veterinarian}</span>
                        </div>
                      </div>
                    )}

                    {selectedEvent.cost && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Costo
                        </label>
                        <div className="flex items-center space-x-2 text-gray-900">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>${selectedEvent.cost.toFixed(2)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Datos específicos del evento */}
                {selectedEvent.breedingData && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Datos de Reproducción
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <span className="text-sm text-gray-600">Método:</span>
                          <p className="font-medium">
                            {selectedEvent.breedingData.method ===
                            "artificial_insemination"
                              ? "Inseminación Artificial"
                              : "Monta Natural"}
                          </p>
                        </div>
                        {selectedEvent.breedingData.semenBatch && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Lote de Semen:
                            </span>
                            <p className="font-medium">
                              {selectedEvent.breedingData.semenBatch}
                            </p>
                          </div>
                        )}
                        {selectedEvent.breedingData.technician && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Técnico:
                            </span>
                            <p className="font-medium">
                              {selectedEvent.breedingData.technician}
                            </p>
                          </div>
                        )}
                        {selectedEvent.breedingData.expectedDueDate && (
                          <div>
                            <span className="text-sm text-gray-600">
                              Fecha Esperada de Parto:
                            </span>
                            <p className="font-medium">
                              {new Date(
                                selectedEvent.breedingData.expectedDueDate
                              ).toLocaleDateString("es-ES")}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Notas */}
                {selectedEvent.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedEvent.notes}</p>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleEditEvent(selectedEvent.id);
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
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventBreeding;
