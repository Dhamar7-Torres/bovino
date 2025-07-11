import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  Grid,
  List,
  Activity,
  Bell,
  RefreshCw,
  DollarSign,
  Heart,
  Package,
  CheckCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Interfaces para TypeScript
interface EventData {
  id: string;
  title: string;
  description: string;
  type: EventType;
  status: EventStatus;
  priority: Priority;
  scheduledDate: string;
  scheduledTime: string;
  location: EventLocation;
  bovineInfo: BovineInfo;
  veterinarian?: string;
  cost?: number;
  reminderCount?: number;
  isRecurring?: boolean;
  tags: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface EventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface EventStatus {
  id: string;
  name: string;
  color: string;
  description: string;
}

interface Priority {
  id: string;
  name: string;
  color: string;
  level: number;
}

interface EventLocation {
  latitude: number;
  longitude: number;
  address: string;
  farm: string;
  section: string;
}

interface BovineInfo {
  id: string;
  name: string;
  tag: string;
  breed: string;
}

interface ViewMode {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

interface SortOption {
  field: string;
  direction: "asc" | "desc";
  label: string;
}

const EventList: React.FC = () => {
  // Estados principales
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedView, setSelectedView] = useState<string>("grid");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("scheduledDate-desc");
  const [showFilters, setShowFilters] = useState(false);
  const [bulkActions, setBulkActions] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  // Hook de navegación
  const navigate = useNavigate();

  // Datos mock para desarrollo
  const mockEvents: EventData[] = [
    {
      id: "evt_001",
      title: "Transporte al Mercado",
      description: "Traslado de ganado para venta en mercado local",
      type: {
        id: "transport",
        name: "Transporte",
        icon: Users,
        color: "bg-purple-500",
        description: "Movilización de ganado",
      },
      status: {
        id: "scheduled",
        name: "Programado",
        color: "bg-blue-100 text-blue-800",
        description: "Evento programado",
      },
      priority: {
        id: "high",
        name: "Alta",
        color: "bg-orange-100 text-orange-800",
        level: 3,
      },
      scheduledDate: "2024-12-29",
      scheduledTime: "23:00",
      location: {
        latitude: 17.9869,
        longitude: -92.9303,
        address: "Zona de Carga, Rancho El Progreso",
        farm: "Rancho El Progreso",
        section: "Zona de Carga",
      },
      bovineInfo: {
        id: "group_001",
        name: "Múltiples",
        tag: "LOTE-A1",
        breed: "Mixto",
      },
      cost: 450.0,
      tags: ["transporte", "venta", "mercado"],
      createdAt: "2024-12-20T10:00:00Z",
      updatedAt: "2024-12-25T15:30:00Z",
    },
    {
      id: "evt_002",
      title: "Inseminación Artificial",
      description: "Proceso de inseminación artificial programada",
      type: {
        id: "breeding",
        name: "Reproducción",
        icon: Heart,
        color: "bg-pink-500",
        description: "Eventos reproductivos",
      },
      status: {
        id: "scheduled",
        name: "Programado",
        color: "bg-blue-100 text-blue-800",
        description: "Evento programado",
      },
      priority: {
        id: "medium",
        name: "Media",
        color: "bg-yellow-100 text-yellow-800",
        level: 2,
      },
      scheduledDate: "2024-12-28",
      scheduledTime: "03:00",
      location: {
        latitude: 17.9869,
        longitude: -92.9303,
        address: "Manga de Trabajo, Rancho El Progreso",
        farm: "Rancho El Progreso",
        section: "Manga de Trabajo",
      },
      bovineInfo: {
        id: "bov_002",
        name: "Tormenta",
        tag: "TOR-003",
        breed: "Angus",
      },
      veterinarian: "Dr. Carlos López",
      tags: ["reproducción", "inseminación", "programado"],
      createdAt: "2024-12-15T08:00:00Z",
      updatedAt: "2024-12-20T14:00:00Z",
    },
    {
      id: "evt_003",
      title: "Emergencia Médica - Paloma",
      description: "Atención médica urgente requerida",
      type: {
        id: "health",
        name: "Salud",
        icon: Heart,
        color: "bg-red-500",
        description: "Consultas médicas",
      },
      status: {
        id: "in_progress",
        name: "En Progreso",
        color: "bg-yellow-100 text-yellow-800",
        description: "En ejecución",
      },
      priority: {
        id: "emergency",
        name: "Emergencia",
        color: "bg-red-100 text-red-800",
        level: 5,
      },
      scheduledDate: "2024-12-25",
      scheduledTime: "08:30",
      location: {
        latitude: 17.9869,
        longitude: -92.9303,
        address: "Potrero Sur, Rancho El Progreso",
        farm: "Rancho El Progreso",
        section: "Potrero Sur",
      },
      bovineInfo: {
        id: "bov_003",
        name: "Paloma",
        tag: "PAL-002",
        breed: "Jersey",
      },
      veterinarian: "Dr. María García",
      cost: 650.0,
      tags: ["emergencia", "urgente", "salud"],
      createdAt: "2024-12-25T08:00:00Z",
      updatedAt: "2024-12-25T08:30:00Z",
    },
    {
      id: "evt_004",
      title: "Suplementación Nutricional",
      description: "Administración de suplementos vitamínicos",
      type: {
        id: "feeding",
        name: "Alimentación",
        icon: Package,
        color: "bg-green-500",
        description: "Nutrición y alimentación",
      },
      status: {
        id: "completed",
        name: "Completado",
        color: "bg-green-100 text-green-800",
        description: "Finalizado exitosamente",
      },
      priority: {
        id: "low",
        name: "Baja",
        color: "bg-green-100 text-green-800",
        level: 1,
      },
      scheduledDate: "2024-12-22",
      scheduledTime: "01:00",
      location: {
        latitude: 17.9869,
        longitude: -92.9303,
        address: "Comederos, Rancho El Progreso",
        farm: "Rancho El Progreso",
        section: "Comederos",
      },
      bovineInfo: {
        id: "bov_004",
        name: "Luna",
        tag: "LUN-004",
        breed: "Holstein",
      },
      cost: 85.0,
      tags: ["alimentación", "suplementos", "completado"],
      completedAt: "2024-12-22T02:00:00Z",
      createdAt: "2024-12-20T10:00:00Z",
      updatedAt: "2024-12-22T02:00:00Z",
    },
  ];

  // Estados de los eventos (simulado)
  const eventStatuses = [
    { id: "all", name: "Todos", count: 5 },
    { id: "scheduled", name: "Programados", count: 2 },
    { id: "in_progress", name: "En Progreso", count: 1 },
    { id: "completed", name: "Completados", count: 2 },
    { id: "overdue", name: "Vencidos", count: 2 },
    { id: "high_priority", name: "Alta Prioridad", count: 3 },
  ];

  // Modos de vista
  const viewModes: ViewMode[] = [
    {
      id: "grid",
      name: "Tarjetas",
      icon: Grid,
      description: "Vista en tarjetas",
    },
    {
      id: "list",
      name: "Lista",
      icon: List,
      description: "Vista en lista",
    },
    {
      id: "timeline",
      name: "Línea de Tiempo",
      icon: Activity,
      description: "Vista cronológica",
    },
  ];

  // Opciones de ordenamiento
  const sortOptions: SortOption[] = [
    {
      field: "scheduledDate",
      direction: "desc",
      label: "Fecha (Más reciente)",
    },
    { field: "scheduledDate", direction: "asc", label: "Fecha (Más antiguo)" },
    { field: "priority", direction: "desc", label: "Prioridad (Mayor)" },
    { field: "priority", direction: "asc", label: "Prioridad (Menor)" },
    { field: "title", direction: "asc", label: "Título (A-Z)" },
    { field: "title", direction: "desc", label: "Título (Z-A)" },
  ];

  // Cargar eventos
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        // Simular carga desde API
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setEvents(mockEvents);
      } catch (error) {
        console.error("Error cargando eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Filtrar y ordenar eventos
  const filteredEvents = events
    .filter((event) => {
      // Filtro por término de búsqueda
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          event.title.toLowerCase().includes(searchLower) ||
          event.description.toLowerCase().includes(searchLower) ||
          event.bovineInfo.name.toLowerCase().includes(searchLower) ||
          event.bovineInfo.tag.toLowerCase().includes(searchLower) ||
          event.tags.some((tag) => tag.toLowerCase().includes(searchLower));

        if (!matchesSearch) return false;
      }

      // Filtro por estado/categoría
      if (selectedFilter !== "all") {
        switch (selectedFilter) {
          case "high_priority":
            return ["high", "critical", "emergency"].includes(
              event.priority.id
            );
          default:
            return event.status.id === selectedFilter;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const [field, direction] = sortBy.split("-");
      const multiplier = direction === "asc" ? 1 : -1;

      switch (field) {
        case "scheduledDate":
          return (
            new Date(a.scheduledDate).getTime() -
            new Date(b.scheduledDate).getTime() * multiplier
          );
        case "priority":
          return (a.priority.level - b.priority.level) * multiplier;
        case "title":
          return a.title.localeCompare(b.title) * multiplier;
        default:
          return 0;
      }
    });

  // Funciones de manejo
  const handleCreateEvent = () => {
    navigate("/events/create");
  };

  const handleViewEvent = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/events/edit/${eventId}`);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    }
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2024-01-01T${timeString}`).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  // Renderizado de vistas
  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredEvents.map((event, index) => (
        <motion.div
          key={event.id}
          variants={itemVariants}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer relative"
          onClick={() => handleViewEvent(event.id)}
        >
          {/* Selección múltiple */}
          {bulkActions && (
            <div className="absolute top-3 left-3 z-10">
              <input
                type="checkbox"
                checked={selectedEvents.includes(event.id)}
                onChange={(e) => {
                  e.stopPropagation();
                  toggleEventSelection(event.id);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </div>
          )}

          {/* Header del evento */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-xl ${event.type.color} text-white`}>
                <event.type.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {event.title}
                </h3>
                <p className="text-xs text-gray-600">
                  {event.bovineInfo.name} • {event.bovineInfo.tag}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-1">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${event.status.color}`}
              >
                {event.status.name}
              </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${event.priority.color}`}
              >
                {event.priority.name}
              </span>
            </div>
          </div>

          {/* Información del evento */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2 text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(event.scheduledDate)}</span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-4 w-4" />
              <span>{formatTime(event.scheduledTime)}</span>
            </div>

            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{event.location.section}</span>
            </div>

            {event.veterinarian && (
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>{event.veterinarian}</span>
              </div>
            )}

            {event.cost && (
              <div className="flex items-center space-x-2 text-green-600 font-medium">
                <DollarSign className="h-4 w-4" />
                <span>${event.cost}</span>
              </div>
            )}
          </div>

          {/* Descripción */}
          <p className="text-sm text-gray-700 mt-3 line-clamp-2">
            {event.description}
          </p>

          {/* Footer con acciones */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {event.isRecurring && (
                <div className="p-1 bg-blue-100 rounded">
                  <RefreshCw className="h-3 w-3 text-blue-600" />
                </div>
              )}
              {event.reminderCount && event.reminderCount > 0 && (
                <div className="flex items-center space-x-1 text-yellow-600">
                  <Bell className="h-3 w-3" />
                  <span className="text-xs">{event.reminderCount}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewEvent(event.id);
                }}
                className="p-1 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
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
                className="p-1 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
              >
                <Edit3 className="h-4 w-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  // Mostrar menú de más opciones
                }}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
              >
                <MoreVertical className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {bulkActions && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedEvents.length === filteredEvents.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedEvents(
                          filteredEvents.map((event) => event.id)
                        );
                      } else {
                        setSelectedEvents([]);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Evento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bovino
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha/Ubicación
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prioridad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Costo
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <motion.tr
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: "#f9fafb" }}
                className="cursor-pointer"
                onClick={() => handleViewEvent(event.id)}
              >
                {bulkActions && (
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEvents.includes(event.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleEventSelection(event.id);
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className={`p-2 rounded-lg ${event.type.color} bg-opacity-10 mr-3`}
                    >
                      <event.type.icon
                        className={`h-5 w-5 ${event.type.color.replace(
                          "bg-",
                          "text-"
                        )}`}
                      />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {event.type.name}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {event.bovineInfo.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.bovineInfo.tag}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {formatDate(event.scheduledDate)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {event.location.section}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${event.status.color}`}
                  >
                    {event.status.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${event.priority.color}`}
                  >
                    {event.priority.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {event.cost ? `$${event.cost}` : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event.id);
                      }}
                      className="text-indigo-600 hover:text-indigo-900"
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
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTimelineView = () => (
    <div className="space-y-6">
      {filteredEvents
        .sort(
          (a, b) =>
            new Date(b.scheduledDate).getTime() -
            new Date(a.scheduledDate).getTime()
        )
        .map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start space-x-4"
          >
            <div className="relative flex flex-col items-center">
              <div
                className={`p-2 rounded-full ${event.type.color} text-white z-10`}
              >
                <event.type.icon className="h-4 w-4" />
              </div>
              {index < filteredEvents.length - 1 && (
                <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-0.5 h-16 bg-gray-300"></div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {event.title}
                </h3>
                <span className="text-xs text-gray-500">
                  {formatDate(event.scheduledDate)}
                </span>
              </div>

              <div className="flex items-center space-x-4 mb-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${event.status.color}`}
                >
                  {event.status.name}
                </span>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${event.priority.color}`}
                >
                  {event.priority.name}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-2">
                {event.bovineInfo.name} ({event.bovineInfo.tag}) •{" "}
                {event.location.section}
              </p>

              <p className="text-sm text-gray-700">{event.description}</p>
            </div>
          </motion.div>
        ))}
    </div>
  );

  const renderEventsByView = () => {
    switch (selectedView) {
      case "list":
        return renderListView();
      case "timeline":
        return renderTimelineView();
      default:
        return renderGridView();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando eventos...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Header principal */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-500 rounded-xl text-white">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Eventos del Ganado
                </h1>
                <p className="text-gray-600">
                  Gestiona todos los eventos de tu rancho en un solo lugar
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Actualizar</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBulkActions(!bulkActions)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Selección múltiple</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateEvent}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Crear Evento</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Panel de resumen rápido */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              Resumen Rápido
            </h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-gray-400 hover:text-gray-600"
            >
              <MoreVertical className="h-5 w-5" />
            </motion.button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {eventStatuses.map((status, index) => (
              <motion.div
                key={status.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedFilter(status.id)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  selectedFilter === status.id
                    ? "bg-blue-100 border-2 border-blue-500"
                    : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold ${
                      status.id === "total"
                        ? "text-blue-600"
                        : status.id === "scheduled"
                        ? "text-blue-600"
                        : status.id === "in_progress"
                        ? "text-yellow-600"
                        : status.id === "completed"
                        ? "text-green-600"
                        : status.id === "overdue"
                        ? "text-red-600"
                        : "text-orange-600"
                    }`}
                  >
                    {status.count}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {status.name}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Controles de filtros y vista */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-4">
              {/* Filtros */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </motion.button>

              {/* Búsqueda avanzada */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Search className="h-4 w-4" />
                <span>Avanzado</span>
              </motion.button>

              {/* Ordenamiento */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option
                    key={`${option.field}-${option.direction}`}
                    value={`${option.field}-${option.direction}`}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Modos de vista */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {viewModes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedView(mode.id)}
                    className={`p-2 rounded-md transition-colors ${
                      selectedView === mode.id
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <mode.icon className="h-4 w-4" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lista de eventos */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filteredEvents.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay eventos
              </h3>
              <p className="text-gray-600 mb-6">
                {events.length === 0
                  ? "Comienza creando tu primer evento."
                  : "No se encontraron eventos que coincidan con los filtros aplicados."}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateEvent}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Crear Primer Evento
              </motion.button>
            </div>
          ) : (
            renderEventsByView()
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EventList;
