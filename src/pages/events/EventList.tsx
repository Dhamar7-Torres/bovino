import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Grid,
  List,
  BarChart3,
  Filter,
  Search,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Eye,
  Edit3,
  Trash2,
  MoreVertical,
  MapPin,
  User,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Bell,
  Heart,
  Syringe,
  Package,
  Users,
  Baby,
  FileText,
  Activity,
  X,
  ChevronDown,
  ChevronUp,
  CalendarDays,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Interfaces para TypeScript
interface Event {
  id: string;
  title: string;
  description: string;
  type: EventType;
  category: EventCategory;
  status: EventStatus;
  priority: Priority;
  scheduledDate: string;
  completedDate?: string;
  estimatedDuration: number;
  actualDuration?: number;
  location: EventLocation;
  bovineInfo: BovineInfo;
  veterinarian?: VeterinarianInfo;
  responsible: string;
  cost?: number;
  actualCost?: number;
  tags: string[];
  notes?: string;
  attachmentCount: number;
  reminderCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  weatherCondition?: string;
  urgencyLevel: number;
  followUpRequired: boolean;
  followUpDate?: string;
  relatedEvents?: string[];
  customData?: Record<string, any>;
}

interface EventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface EventCategory {
  id: string;
  name: string;
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
  farm: string;
  section: string;
  facility?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

interface BovineInfo {
  id: string;
  name: string;
  tag: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  healthStatus: string;
  weight?: number;
  photo?: string;
}

interface VeterinarianInfo {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  rating: number;
  emergencyContact: boolean;
}

interface FilterOptions {
  categories: string[];
  statuses: string[];
  priorities: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  costRange: {
    min?: number;
    max?: number;
  };
  tags: string[];
  veterinarians: string[];
  locations: string[];
  urgencyLevel?: number;
  searchTerm: string;
}

interface SortOption {
  field: keyof Event;
  direction: "asc" | "desc";
  label: string;
}

interface ViewMode {
  id: "grid" | "list" | "calendar" | "kanban" | "timeline";
  name: string;
  icon: React.ComponentType<any>;
  description: string;
}

const EventList: React.FC = () => {
  // Estados principales
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode["id"]>("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [bulkActions, setBulkActions] = useState(false);

  // Estados de filtros
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    statuses: [],
    priorities: [],
    dateRange: {},
    costRange: {},
    tags: [],
    veterinarians: [],
    locations: [],
    searchTerm: "",
  });

  // Estados de ordenamiento
  const [sortBy, setSortBy] = useState<SortOption>({
    field: "scheduledDate",
    direction: "desc",
    label: "Fecha (Más reciente)",
  });

  // Estados de UI
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickStats, setShowQuickStats] = useState(true);

  // Hook de navegación
  const navigate = useNavigate();

  // Configuraciones de vista
  const viewModes: ViewMode[] = [
    {
      id: "grid",
      name: "Cuadrícula",
      icon: Grid,
      description: "Vista en tarjetas organizadas",
    },
    {
      id: "list",
      name: "Lista",
      icon: List,
      description: "Vista en lista detallada",
    },
    {
      id: "calendar",
      name: "Calendario",
      icon: Calendar,
      description: "Vista de calendario mensual",
    },
    {
      id: "kanban",
      name: "Kanban",
      icon: BarChart3,
      description: "Tablero por estados",
    },
    {
      id: "timeline",
      name: "Línea de Tiempo",
      icon: Activity,
      description: "Vista cronológica",
    },
  ];

  // Tipos de eventos
  const eventTypes: EventType[] = [
    {
      id: "vaccination",
      name: "Vacunación",
      icon: Syringe,
      color: "text-blue-600",
      description: "Vacunas y prevención",
    },
    {
      id: "health",
      name: "Salud",
      icon: Heart,
      color: "text-red-600",
      description: "Consultas médicas",
    },
    {
      id: "breeding",
      name: "Reproducción",
      icon: Baby,
      color: "text-pink-600",
      description: "Eventos reproductivos",
    },
    {
      id: "feeding",
      name: "Alimentación",
      icon: Package,
      color: "text-green-600",
      description: "Nutrición y alimentación",
    },
    {
      id: "transport",
      name: "Transporte",
      icon: Users,
      color: "text-purple-600",
      description: "Movilización de ganado",
    },
    {
      id: "sale",
      name: "Venta",
      icon: DollarSign,
      color: "text-emerald-600",
      description: "Transacciones comerciales",
    },
  ];

  // Categorías de eventos
  const eventCategories: EventCategory[] = [
    {
      id: "medical",
      name: "Médico",
      color: "bg-red-100 text-red-800",
      description: "Eventos relacionados con salud",
    },
    {
      id: "reproductive",
      name: "Reproductivo",
      color: "bg-pink-100 text-pink-800",
      description: "Reproducción y cría",
    },
    {
      id: "nutritional",
      name: "Nutricional",
      color: "bg-green-100 text-green-800",
      description: "Alimentación y nutrición",
    },
    {
      id: "commercial",
      name: "Comercial",
      color: "bg-blue-100 text-blue-800",
      description: "Compras, ventas y transacciones",
    },
    {
      id: "management",
      name: "Manejo",
      color: "bg-purple-100 text-purple-800",
      description: "Manejo general del ganado",
    },
    {
      id: "maintenance",
      name: "Mantenimiento",
      color: "bg-gray-100 text-gray-800",
      description: "Mantenimiento de instalaciones",
    },
  ];

  // Estados de eventos
  const eventStatuses: EventStatus[] = [
    {
      id: "scheduled",
      name: "Programado",
      color: "bg-blue-100 text-blue-800",
      description: "Evento programado",
    },
    {
      id: "in_progress",
      name: "En Progreso",
      color: "bg-yellow-100 text-yellow-800",
      description: "En ejecución",
    },
    {
      id: "completed",
      name: "Completado",
      color: "bg-green-100 text-green-800",
      description: "Finalizado exitosamente",
    },
    {
      id: "cancelled",
      name: "Cancelado",
      color: "bg-red-100 text-red-800",
      description: "Evento cancelado",
    },
    {
      id: "postponed",
      name: "Pospuesto",
      color: "bg-purple-100 text-purple-800",
      description: "Reprogramado",
    },
    {
      id: "overdue",
      name: "Vencido",
      color: "bg-orange-100 text-orange-800",
      description: "Fecha vencida",
    },
  ];

  // Prioridades
  const priorities: Priority[] = [
    { id: "low", name: "Baja", color: "bg-green-100 text-green-800", level: 1 },
    {
      id: "medium",
      name: "Media",
      color: "bg-yellow-100 text-yellow-800",
      level: 2,
    },
    {
      id: "high",
      name: "Alta",
      color: "bg-orange-100 text-orange-800",
      level: 3,
    },
    {
      id: "critical",
      name: "Crítica",
      color: "bg-red-100 text-red-800",
      level: 4,
    },
    {
      id: "emergency",
      name: "Emergencia",
      color: "bg-red-200 text-red-900",
      level: 5,
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
    { field: "cost", direction: "desc", label: "Costo (Mayor)" },
    { field: "cost", direction: "asc", label: "Costo (Menor)" },
    { field: "urgencyLevel", direction: "desc", label: "Urgencia (Mayor)" },
    { field: "createdAt", direction: "desc", label: "Creación (Reciente)" },
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      try {
        // Simular carga de datos desde la API
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Datos simulados combinando diferentes tipos de eventos
        const mockEvents: Event[] = [
          {
            id: "evt_001",
            title: "Vacunación Rutinaria - Sector Norte",
            description:
              "Aplicación de vacunas anuales según calendario sanitario",
            type: eventTypes[0],
            category: eventCategories[0],
            status: eventStatuses[2], // completed
            priority: priorities[2], // high
            scheduledDate: "2024-12-20T08:00:00Z",
            completedDate: "2024-12-20T09:30:00Z",
            estimatedDuration: 90,
            actualDuration: 90,
            location: {
              farm: "Rancho El Progreso",
              section: "Sector Norte",
              facility: "Corral Principal",
              coordinates: { latitude: 17.9869, longitude: -92.9303 },
            },
            bovineInfo: {
              id: "bov_001",
              name: "Esperanza",
              tag: "ESP-001",
              breed: "Holstein",
              age: 3,
              gender: "female",
              healthStatus: "Saludable",
              weight: 450,
              photo: "/api/placeholder/150/150",
            },
            veterinarian: {
              id: "vet_001",
              name: "Dr. María García",
              specialization: "Medicina Preventiva",
              phone: "+52 993 123 4567",
              rating: 4.9,
              emergencyContact: true,
            },
            responsible: "Juan Pérez",
            cost: 250.0,
            actualCost: 235.0,
            tags: ["rutina", "preventivo", "anual"],
            notes: "Vacunación completada sin complicaciones",
            attachmentCount: 2,
            reminderCount: 0,
            createdAt: "2024-12-15T10:00:00Z",
            updatedAt: "2024-12-20T09:30:00Z",
            createdBy: "admin",
            weatherCondition: "Soleado",
            urgencyLevel: 3,
            followUpRequired: false,
            customData: {
              vaccineType: "Fiebre Aftosa",
              batchNumber: "VB2024-456",
            },
          },
          {
            id: "evt_002",
            title: "Emergencia Médica - Paloma",
            description: "Atención de emergencia por dificultad respiratoria",
            type: eventTypes[1],
            category: eventCategories[0],
            status: eventStatuses[1], // in_progress
            priority: priorities[4], // emergency
            scheduledDate: "2024-12-25T14:30:00Z",
            estimatedDuration: 120,
            location: {
              farm: "Rancho El Progreso",
              section: "Potrero Sur",
              facility: "Campo Abierto",
            },
            bovineInfo: {
              id: "bov_002",
              name: "Paloma",
              tag: "PAL-002",
              breed: "Jersey",
              age: 2,
              gender: "female",
              healthStatus: "Enfermo",
              weight: 380,
            },
            veterinarian: {
              id: "vet_001",
              name: "Dr. María García",
              specialization: "Medicina de Emergencias",
              phone: "+52 993 123 4567",
              rating: 4.9,
              emergencyContact: true,
            },
            responsible: "María González",
            cost: 650.0,
            tags: ["emergencia", "respiratorio", "crítico"],
            notes: "Paciente en tratamiento intensivo",
            attachmentCount: 1,
            reminderCount: 3,
            createdAt: "2024-12-25T14:15:00Z",
            updatedAt: "2024-12-25T14:45:00Z",
            createdBy: "vet_001",
            weatherCondition: "Lluvioso",
            urgencyLevel: 5,
            followUpRequired: true,
            followUpDate: "2024-12-26T08:00:00Z",
            customData: {
              symptoms: ["Disnea", "Fiebre alta"],
              diagnosis: "Neumonía bacteriana",
            },
          },
          {
            id: "evt_003",
            title: "Inseminación Artificial - Tormenta",
            description: "Procedimiento de inseminación artificial programado",
            type: eventTypes[2],
            category: eventCategories[1],
            status: eventStatuses[0], // scheduled
            priority: priorities[1], // medium
            scheduledDate: "2024-12-28T09:00:00Z",
            estimatedDuration: 60,
            location: {
              farm: "Rancho El Progreso",
              section: "Manga de Trabajo",
              facility: "Área de Reproducción",
            },
            bovineInfo: {
              id: "bov_003",
              name: "Tormenta",
              tag: "TOR-003",
              breed: "Angus",
              age: 4,
              gender: "female",
              healthStatus: "Saludable",
              weight: 520,
            },
            veterinarian: {
              id: "vet_002",
              name: "Dr. Carlos López",
              specialization: "Reproducción Bovina",
              phone: "+52 993 987 6543",
              rating: 4.7,
              emergencyContact: false,
            },
            responsible: "Pedro Martínez",
            cost: 180.0,
            tags: ["reproducción", "IA", "programado"],
            attachmentCount: 0,
            reminderCount: 2,
            createdAt: "2024-12-20T16:00:00Z",
            updatedAt: "2024-12-20T16:00:00Z",
            createdBy: "admin",
            urgencyLevel: 2,
            followUpRequired: true,
            followUpDate: "2024-01-15T10:00:00Z",
            customData: {
              semenBatch: "BS2024-789",
              expectedDueDate: "2024-09-25",
            },
          },
          {
            id: "evt_004",
            title: "Suplementación Nutricional",
            description: "Administración de suplementos minerales",
            type: eventTypes[3],
            category: eventCategories[2],
            status: eventStatuses[2], // completed
            priority: priorities[0], // low
            scheduledDate: "2024-12-22T07:00:00Z",
            completedDate: "2024-12-22T07:45:00Z",
            estimatedDuration: 45,
            actualDuration: 45,
            location: {
              farm: "Rancho El Progreso",
              section: "Comederos",
              facility: "Área de Alimentación",
            },
            bovineInfo: {
              id: "bov_004",
              name: "Luna",
              tag: "LUN-004",
              breed: "Brahman",
              age: 5,
              gender: "female",
              healthStatus: "Saludable",
              weight: 490,
            },
            responsible: "Ana Rodríguez",
            cost: 85.0,
            actualCost: 80.0,
            tags: ["alimentación", "suplementos", "minerales"],
            attachmentCount: 1,
            reminderCount: 0,
            createdAt: "2024-12-21T12:00:00Z",
            updatedAt: "2024-12-22T07:45:00Z",
            createdBy: "nutrition_specialist",
            urgencyLevel: 1,
            followUpRequired: false,
            customData: {
              supplementType: "Mineral Block",
              quantity: "2 kg",
            },
          },
          {
            id: "evt_005",
            title: "Transporte al Mercado",
            description: "Traslado de ganado para venta en el mercado regional",
            type: eventTypes[4],
            category: eventCategories[3],
            status: eventStatuses[0], // scheduled
            priority: priorities[2], // high
            scheduledDate: "2024-12-30T05:00:00Z",
            estimatedDuration: 240,
            location: {
              farm: "Rancho El Progreso",
              section: "Zona de Carga",
              facility: "Rampa de Embarque",
            },
            bovineInfo: {
              id: "bov_005",
              name: "Múltiples",
              tag: "LOTE-A1",
              breed: "Mixto",
              age: 2,
              gender: "male",
              healthStatus: "Saludable",
            },
            responsible: "Roberto Hernández",
            cost: 450.0,
            tags: ["transporte", "venta", "mercado"],
            attachmentCount: 2,
            reminderCount: 1,
            createdAt: "2024-12-23T14:00:00Z",
            updatedAt: "2024-12-23T14:00:00Z",
            createdBy: "transport_manager",
            urgencyLevel: 3,
            followUpRequired: false,
            customData: {
              destination: "Mercado Regional Villahermosa",
              animalCount: 8,
              truckType: "Tráiler Ganadero",
            },
          },
        ];

        setEvents(mockEvents);
        setFilteredEvents(mockEvents);
      } catch (error) {
        console.error("Error cargando eventos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    let filtered = [...events];

    // Filtro por término de búsqueda
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term) ||
          event.bovineInfo.name.toLowerCase().includes(term) ||
          event.bovineInfo.tag.toLowerCase().includes(term) ||
          event.type.name.toLowerCase().includes(term) ||
          event.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    // Filtro por categorías
    if (filters.categories.length > 0) {
      filtered = filtered.filter((event) =>
        filters.categories.includes(event.category.id)
      );
    }

    // Filtro por estados
    if (filters.statuses.length > 0) {
      filtered = filtered.filter((event) =>
        filters.statuses.includes(event.status.id)
      );
    }

    // Filtro por prioridades
    if (filters.priorities.length > 0) {
      filtered = filtered.filter((event) =>
        filters.priorities.includes(event.priority.id)
      );
    }

    // Filtro por rango de fechas
    if (filters.dateRange.start) {
      filtered = filtered.filter(
        (event) =>
          new Date(event.scheduledDate) >= new Date(filters.dateRange.start!)
      );
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(
        (event) =>
          new Date(event.scheduledDate) <= new Date(filters.dateRange.end!)
      );
    }

    // Filtro por rango de costos
    if (filters.costRange.min !== undefined) {
      filtered = filtered.filter(
        (event) => (event.cost || 0) >= filters.costRange.min!
      );
    }
    if (filters.costRange.max !== undefined) {
      filtered = filtered.filter(
        (event) => (event.cost || 0) <= filters.costRange.max!
      );
    }

    // Filtro por etiquetas
    if (filters.tags.length > 0) {
      filtered = filtered.filter((event) =>
        filters.tags.some((tag) => event.tags.includes(tag))
      );
    }

    // Filtro por veterinarios
    if (filters.veterinarians.length > 0) {
      filtered = filtered.filter(
        (event) =>
          event.veterinarian &&
          filters.veterinarians.includes(event.veterinarian.id)
      );
    }

    // Filtro por ubicaciones
    if (filters.locations.length > 0) {
      filtered = filtered.filter((event) =>
        filters.locations.includes(event.location.section)
      );
    }

    // Filtro por nivel de urgencia
    if (filters.urgencyLevel !== undefined) {
      filtered = filtered.filter(
        (event) => event.urgencyLevel >= filters.urgencyLevel!
      );
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      const aValue = a[sortBy.field];
      const bValue = b[sortBy.field];

      if (aValue === undefined || bValue === undefined) return 0;

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortBy.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortBy.direction === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    setFilteredEvents(filtered);
  }, [events, filters, sortBy]);

  // Funciones de manejo
  const handleRefresh = async () => {
    setRefreshing(true);
    // Simular actualización
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleViewEvent = (eventId: string) => {
    navigate(`/events/detail/${eventId}`);
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/events/edit/${eventId}`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este evento?")) {
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    }
  };

  const handleBulkAction = (action: string) => {
    // Implementar acciones en lote
    console.log(`Acción en lote: ${action} para eventos:`, selectedEvents);
  };

  const toggleEventSelection = (eventId: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventId)
        ? prev.filter((id) => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      categories: [],
      statuses: [],
      priorities: [],
      dateRange: {},
      costRange: {},
      tags: [],
      veterinarians: [],
      locations: [],
      searchTerm: "",
    });
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

  const getUrgencyColor = (level: number) => {
    if (level >= 5) return "text-red-600";
    if (level >= 4) return "text-orange-600";
    if (level >= 3) return "text-yellow-600";
    if (level >= 2) return "text-blue-600";
    return "text-green-600";
  };

  // Estadísticas rápidas
  const quickStats = {
    total: filteredEvents.length,
    scheduled: filteredEvents.filter((e) => e.status.id === "scheduled").length,
    inProgress: filteredEvents.filter((e) => e.status.id === "in_progress")
      .length,
    completed: filteredEvents.filter((e) => e.status.id === "completed").length,
    overdue: filteredEvents.filter(
      (e) =>
        e.status.id === "scheduled" && new Date(e.scheduledDate) < new Date()
    ).length,
    highPriority: filteredEvents.filter((e) => e.priority.level >= 3).length,
    totalCost: filteredEvents.reduce((sum, e) => sum + (e.cost || 0), 0),
  };

  // Renderizado condicional por modo de vista
  const renderEventsByView = () => {
    switch (viewMode) {
      case "grid":
        return renderGridView();
      case "list":
        return renderListView();
      case "calendar":
        return renderCalendarView();
      case "kanban":
        return renderKanbanView();
      case "timeline":
        return renderTimelineView();
      default:
        return renderGridView();
    }
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredEvents.map((event) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer relative"
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
              <div
                className={`p-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white`}
              >
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
              <MapPin className="h-4 w-4" />
              <span>{event.location.section}</span>
            </div>

            {event.veterinarian && (
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-4 w-4" />
                <span>{event.veterinarian.name}</span>
              </div>
            )}

            {event.cost && (
              <div className="flex items-center space-x-2 text-gray-600">
                <DollarSign className="h-4 w-4" />
                <span>${event.cost.toFixed(2)}</span>
              </div>
            )}
          </div>

          {/* Etiquetas */}
          {event.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {event.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
              {event.tags.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{event.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Indicadores de urgencia y seguimiento */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              {event.urgencyLevel >= 4 && (
                <AlertTriangle
                  className={`h-4 w-4 ${getUrgencyColor(event.urgencyLevel)}`}
                />
              )}
              {event.followUpRequired && (
                <Bell className="h-4 w-4 text-yellow-600" />
              )}
              {event.attachmentCount > 0 && (
                <div className="flex items-center space-x-1 text-green-600">
                  <FileText className="h-3 w-3" />
                  <span className="text-xs">{event.attachmentCount}</span>
                </div>
              )}
              {event.reminderCount > 0 && (
                <div className="flex items-center space-x-1 text-blue-600">
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
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden">
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
                Fecha
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEvents.map((event) => (
              <motion.tr
                key={event.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
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
                        className={`h-5 w-5 ${event.type.color}`}
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
                  {event.cost ? `$${event.cost.toFixed(2)}` : "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEvent(event.id);
                      }}
                      className="text-blue-600 hover:text-blue-900"
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
                      className="text-yellow-600 hover:text-yellow-900"
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

  const renderCalendarView = () => (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
      <div className="text-center py-12">
        <CalendarDays className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Vista de Calendario
        </h3>
        <p className="text-gray-600">Vista de calendario en desarrollo</p>
        <p className="text-sm text-gray-500 mt-2">
          Se integrará con componentes de calendario
        </p>
      </div>
    </div>
  );

  const renderKanbanView = () => (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {eventStatuses.map((status) => (
        <div key={status.id} className="flex-shrink-0 w-80">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">{status.name}</h3>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}
              >
                {filteredEvents.filter((e) => e.status.id === status.id).length}
              </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredEvents
                .filter((event) => event.status.id === status.id)
                .map((event) => (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-3 rounded-lg border border-gray-200 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => handleViewEvent(event.id)}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <event.type.icon
                        className={`h-4 w-4 ${event.type.color}`}
                      />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {event.title}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 mb-2">
                      {event.bovineInfo.name} • {event.bovineInfo.tag}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(event.scheduledDate).toLocaleDateString(
                          "es-ES"
                        )}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${event.priority.color}`}
                      >
                        {event.priority.name}
                      </span>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderTimelineView = () => (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
      <div className="space-y-6">
        {filteredEvents
          .sort(
            (a, b) =>
              new Date(a.scheduledDate).getTime() -
              new Date(b.scheduledDate).getTime()
          )
          .map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-4"
            >
              <div className="flex-shrink-0 relative">
                <div
                  className={`p-2 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white`}
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
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
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
                className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl text-white"
              >
                <Calendar className="h-8 w-8" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Eventos del Ganado
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona todos los eventos de tu rancho en un solo lugar
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                <span>Actualizar</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setBulkActions(!bulkActions)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  bulkActions
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <CheckCircle className="h-4 w-4" />
                <span>Selección múltiple</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/events/create")}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Crear Evento</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas Rápidas */}
      {showQuickStats && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
        >
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Resumen Rápido
              </h2>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQuickStats(!showQuickStats)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showQuickStats ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </motion.button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {quickStats.total}
                </p>
                <p className="text-sm text-gray-600">Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {quickStats.scheduled}
                </p>
                <p className="text-sm text-gray-600">Programados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {quickStats.inProgress}
                </p>
                <p className="text-sm text-gray-600">En Progreso</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">
                  {quickStats.completed}
                </p>
                <p className="text-sm text-gray-600">Completados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">
                  {quickStats.overdue}
                </p>
                <p className="text-sm text-gray-600">Vencidos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {quickStats.highPriority}
                </p>
                <p className="text-sm text-gray-600">Alta Prioridad</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  ${quickStats.totalCost.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Costo Total</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Barra de Filtros y Controles */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          {/* Barra superior de controles */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Buscar eventos..."
                  value={filters.searchTerm}
                  onChange={(e) =>
                    handleFilterChange("searchTerm", e.target.value)
                  }
                  className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                />
              </div>

              {/* Filtros rápidos */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters
                    ? "bg-blue-600 text-white"
                    : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Filter className="h-4 w-4" />
                <span>Filtros</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span>Avanzado</span>
              </motion.button>
            </div>

            <div className="flex items-center space-x-4">
              {/* Selector de ordenamiento */}
              <select
                value={`${sortBy.field}-${sortBy.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split("-") as [
                    keyof Event,
                    "asc" | "desc"
                  ];
                  const option = sortOptions.find(
                    (opt) => opt.field === field && opt.direction === direction
                  );
                  if (option) setSortBy(option);
                }}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
              >
                {sortOptions.map((option, index) => (
                  <option
                    key={index}
                    value={`${option.field}-${option.direction}`}
                  >
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Selector de vista */}
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                {viewModes.map((mode) => (
                  <motion.button
                    key={mode.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(mode.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === mode.id
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                    title={mode.description}
                  >
                    <mode.icon className="h-4 w-4" />
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* Panel de filtros expandible */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 pt-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {/* Filtro por categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      multiple
                      value={filters.categories}
                      onChange={(e) =>
                        handleFilterChange(
                          "categories",
                          Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          )
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                    >
                      {eventCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por estado */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      multiple
                      value={filters.statuses}
                      onChange={(e) =>
                        handleFilterChange(
                          "statuses",
                          Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          )
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                    >
                      {eventStatuses.map((status) => (
                        <option key={status.id} value={status.id}>
                          {status.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por prioridad */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prioridad
                    </label>
                    <select
                      multiple
                      value={filters.priorities}
                      onChange={(e) =>
                        handleFilterChange(
                          "priorities",
                          Array.from(
                            e.target.selectedOptions,
                            (option) => option.value
                          )
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                    >
                      {priorities.map((priority) => (
                        <option key={priority.id} value={priority.id}>
                          {priority.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por fecha inicio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.start || ""}
                      onChange={(e) =>
                        handleFilterChange("dateRange", {
                          ...filters.dateRange,
                          start: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                    />
                  </div>

                  {/* Filtro por fecha fin */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={filters.dateRange.end || ""}
                      onChange={(e) =>
                        handleFilterChange("dateRange", {
                          ...filters.dateRange,
                          end: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Mostrando {filteredEvents.length} de {events.length} eventos
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Limpiar filtros
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Acciones en lote */}
      {bulkActions && selectedEvents.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-blue-900">
                  {selectedEvents.length} eventos seleccionados
                </span>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBulkAction("export")}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Exportar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleBulkAction("delete")}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </motion.button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedEvents([])}
                className="text-blue-600 hover:text-blue-800"
              >
                <X className="h-4 w-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Contenido principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
      >
        {filteredEvents.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200">
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
              onClick={() => navigate("/events/create")}
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
  );
};

export default EventList;
