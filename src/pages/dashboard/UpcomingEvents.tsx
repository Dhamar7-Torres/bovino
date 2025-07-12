import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  AlertTriangle,
  CheckCircle,
  Bell,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Shield,
  Heart,
  Pill,
  Baby,
  Scale,
  Truck,
  Stethoscope,
  Zap,
  Navigation,
  CalendarDays,
  Timer,
  Users,
} from "lucide-react";

// Tipos de eventos disponibles
type EventType =
  | "vaccination"
  | "health_check"
  | "medication"
  | "breeding"
  | "calving"
  | "weaning"
  | "weighing"
  | "movement"
  | "veterinary";
type EventPriority = "low" | "medium" | "high" | "critical";
type EventStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "overdue";

// Interfaz para eventos
interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  priority: EventPriority;
  status: EventStatus;
  scheduled_date: string;
  estimated_duration_minutes: number;
  animal_ids: string[];
  assigned_to: string;
  veterinarian?: string;
  location: {
    lat: number;
    lng: number;
    area_name: string;
    specific_location: string;
  };
  requirements?: string[];
  notes?: string;
  reminder_settings: {
    advance_days: number[];
    notified: boolean;
  };
  related_events?: string[];
  cost_estimate?: number;
  equipment_needed?: string[];
}

// Interfaz para resumen de eventos
interface EventsSummary {
  total_events: number;
  today_events: number;
  this_week_events: number;
  overdue_events: number;
  high_priority_events: number;
  by_type: Record<EventType, number>;
  by_status: Record<EventStatus, number>;
}

// Interfaz para filtros
interface EventFilter {
  type: EventType | "all";
  priority: EventPriority | "all";
  status: EventStatus | "all";
  date_range: "today" | "week" | "month" | "all";
  assigned_to: string | "all";
  search: string;
}

const UpcomingEvents: React.FC = () => {
  // Estados principales
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<UpcomingEvent[]>([]);
  const [eventsSummary, setEventsSummary] = useState<EventsSummary | null>(
    null
  );
  const [selectedEvent, setSelectedEvent] = useState<UpcomingEvent | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // Estados para filtros
  const [filters, setFilters] = useState<EventFilter>({
    type: "all",
    priority: "all",
    status: "all",
    date_range: "week",
    assigned_to: "all",
    search: "",
  });

  // Cargar datos simulados
  useEffect(() => {
    const loadEventsData = async () => {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockEvents: UpcomingEvent[] = [
        {
          id: "event-001",
          title: "Vaccination - IBR/BVD Booster",
          description: "Annual booster vaccination for respiratory diseases",
          type: "vaccination",
          priority: "high",
          status: "scheduled",
          scheduled_date: "2025-07-12T09:00:00Z",
          estimated_duration_minutes: 120,
          animal_ids: ["COW-001", "COW-045", "BULL-023"],
          assigned_to: "José Hernández",
          veterinarian: "Dr. Ana Rodríguez",
          location: {
            lat: 14.6349,
            lng: -90.5069,
            area_name: "Vaccination Station 1",
            specific_location: "Main Health Center",
          },
          requirements: ["IBR/BVD vaccine", "syringes", "record sheets"],
          notes: "Check animal temperatures before vaccination",
          reminder_settings: {
            advance_days: [7, 3, 1],
            notified: true,
          },
          cost_estimate: 285,
          equipment_needed: ["vaccination gun", "cooler", "gloves"],
        },
        {
          id: "event-002",
          title: "Health Check - Luna (COW-087)",
          description:
            "Follow-up examination for respiratory infection treatment",
          type: "health_check",
          priority: "critical",
          status: "scheduled",
          scheduled_date: "2025-07-12T14:30:00Z",
          estimated_duration_minutes: 45,
          animal_ids: ["COW-087"],
          assigned_to: "María López",
          veterinarian: "Dr. Ana Rodríguez",
          location: {
            lat: 14.6355,
            lng: -90.508,
            area_name: "Medical Isolation",
            specific_location: "Treatment Bay 2",
          },
          requirements: ["thermometer", "stethoscope", "treatment record"],
          notes:
            "Day 3 of antibiotic treatment. Monitor temperature and breathing.",
          reminder_settings: {
            advance_days: [1],
            notified: false,
          },
          related_events: ["treatment-001"],
        },
        {
          id: "event-003",
          title: "Expected Calving - Daisy (COW-156)",
          description: "Estimated calving date based on breeding records",
          type: "calving",
          priority: "high",
          status: "scheduled",
          scheduled_date: "2025-08-25T00:00:00Z",
          estimated_duration_minutes: 360,
          animal_ids: ["COW-156"],
          assigned_to: "Carlos Mendoza",
          veterinarian: "Dr. Luis García",
          location: {
            lat: 14.633,
            lng: -90.5065,
            area_name: "Maternity Pasture",
            specific_location: "Calving Pen 1",
          },
          requirements: ["calving kit", "iodine", "towels", "birthing records"],
          notes: "First-time mother. Monitor closely for signs of labor.",
          reminder_settings: {
            advance_days: [14, 7, 3, 1],
            notified: true,
          },
          cost_estimate: 150,
          equipment_needed: ["calving chains", "lubricant", "emergency kit"],
        },
        {
          id: "event-004",
          title: "Medication Administration",
          description: "Continue antibiotic treatment for mastitis",
          type: "medication",
          priority: "high",
          status: "scheduled",
          scheduled_date: "2025-07-12T06:00:00Z",
          estimated_duration_minutes: 30,
          animal_ids: ["COW-156"],
          assigned_to: "José Hernández",
          location: {
            lat: 14.6355,
            lng: -90.508,
            area_name: "Milking Facility",
            specific_location: "Treatment Station",
          },
          requirements: ["intramammary antibiotics", "alcohol wipes", "gloves"],
          notes: "Day 2 of treatment. Apply to all four quarters.",
          reminder_settings: {
            advance_days: [0],
            notified: true,
          },
          related_events: ["treatment-002"],
        },
        {
          id: "event-005",
          title: "Weekly Weighing - Young Stock",
          description: "Monitor growth rates of calves and heifers",
          type: "weighing",
          priority: "medium",
          status: "scheduled",
          scheduled_date: "2025-07-14T08:00:00Z",
          estimated_duration_minutes: 180,
          animal_ids: ["CALF-045", "HEIFER-012", "HEIFER-034", "CALF-067"],
          assigned_to: "María López",
          location: {
            lat: 14.634,
            lng: -90.507,
            area_name: "Young Stock Area",
            specific_location: "Weighing Station",
          },
          requirements: [
            "livestock scale",
            "record sheets",
            "identification scanner",
          ],
          notes: "Update growth charts and adjust feeding plans if needed.",
          reminder_settings: {
            advance_days: [2],
            notified: false,
          },
          cost_estimate: 0,
        },
        {
          id: "event-006",
          title: "Pasture Rotation - Group A",
          description: "Move cattle from North Pasture to East Pasture",
          type: "movement",
          priority: "medium",
          status: "scheduled",
          scheduled_date: "2025-07-13T16:00:00Z",
          estimated_duration_minutes: 90,
          animal_ids: ["COW-001", "COW-024", "COW-038", "BULL-002"],
          assigned_to: "Carlos Mendoza",
          location: {
            lat: 14.632,
            lng: -90.5055,
            area_name: "East Pasture",
            specific_location: "Gate 3",
          },
          requirements: [
            "herding equipment",
            "gate keys",
            "animal count sheet",
          ],
          notes: "North pasture needs 3-week rest period for grass recovery.",
          reminder_settings: {
            advance_days: [1],
            notified: true,
          },
        },
        {
          id: "event-007",
          title: "Breeding - AI Service",
          description: "Artificial insemination for selected cows in estrus",
          type: "breeding",
          priority: "high",
          status: "confirmed",
          scheduled_date: "2025-07-12T10:30:00Z",
          estimated_duration_minutes: 60,
          animal_ids: ["COW-078", "COW-091"],
          assigned_to: "Dr. Luis García",
          location: {
            lat: 14.634,
            lng: -90.507,
            area_name: "Breeding Facility",
            specific_location: "AI Station",
          },
          requirements: ["AI equipment", "semen straws", "breeding records"],
          notes:
            "Use premium Angus semen. Record exact timing for pregnancy detection.",
          reminder_settings: {
            advance_days: [0],
            notified: true,
          },
          cost_estimate: 120,
          equipment_needed: ["AI gun", "liquid nitrogen", "protective gear"],
        },
        {
          id: "event-008",
          title: "Emergency Veterinary Call",
          description: "Urgent examination for limping bull",
          type: "veterinary",
          priority: "critical",
          status: "overdue",
          scheduled_date: "2025-07-11T15:00:00Z",
          estimated_duration_minutes: 60,
          animal_ids: ["BULL-023"],
          assigned_to: "Dr. Carlos Méndez",
          location: {
            lat: 14.632,
            lng: -90.5055,
            area_name: "Rehabilitation Pen",
            specific_location: "Medical Examination Area",
          },
          requirements: ["X-ray equipment", "sedatives", "examination tools"],
          notes:
            "Bull showing severe lameness in right front leg. Suspected fracture.",
          reminder_settings: {
            advance_days: [0],
            notified: true,
          },
          cost_estimate: 450,
        },
      ];

      // Calcular resumen
      const summary: EventsSummary = {
        total_events: mockEvents.length,
        today_events: mockEvents.filter((e) => {
          const eventDate = new Date(e.scheduled_date);
          const today = new Date();
          return eventDate.toDateString() === today.toDateString();
        }).length,
        this_week_events: mockEvents.filter((e) => {
          const eventDate = new Date(e.scheduled_date);
          const weekFromNow = new Date();
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          return eventDate <= weekFromNow;
        }).length,
        overdue_events: mockEvents.filter((e) => e.status === "overdue").length,
        high_priority_events: mockEvents.filter(
          (e) => e.priority === "high" || e.priority === "critical"
        ).length,
        by_type: mockEvents.reduce((acc, event) => {
          acc[event.type] = (acc[event.type] || 0) + 1;
          return acc;
        }, {} as Record<EventType, number>),
        by_status: mockEvents.reduce((acc, event) => {
          acc[event.status] = (acc[event.status] || 0) + 1;
          return acc;
        }, {} as Record<EventStatus, number>),
      };

      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
      setEventsSummary(summary);
      setIsLoading(false);
    };

    loadEventsData();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let filtered = events;

    // Filtro por tipo
    if (filters.type !== "all") {
      filtered = filtered.filter((event) => event.type === filters.type);
    }

    // Filtro por prioridad
    if (filters.priority !== "all") {
      filtered = filtered.filter(
        (event) => event.priority === filters.priority
      );
    }

    // Filtro por estado
    if (filters.status !== "all") {
      filtered = filtered.filter((event) => event.status === filters.status);
    }

    // Filtro por rango de fecha
    const now = new Date();
    if (filters.date_range !== "all") {
      const ranges = {
        today: 1,
        week: 7,
        month: 30,
      };
      const days = ranges[filters.date_range];
      const rangeEnd = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.scheduled_date);
        return eventDate >= now && eventDate <= rangeEnd;
      });
    }

    // Filtro por responsable
    if (filters.assigned_to !== "all") {
      filtered = filtered.filter((event) =>
        event.assigned_to
          .toLowerCase()
          .includes(filters.assigned_to.toLowerCase())
      );
    }

    // Filtro por búsqueda
    if (filters.search) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          event.description
            .toLowerCase()
            .includes(filters.search.toLowerCase()) ||
          event.animal_ids.some((id) =>
            id.toLowerCase().includes(filters.search.toLowerCase())
          ) ||
          event.location.area_name
            .toLowerCase()
            .includes(filters.search.toLowerCase())
      );
    }

    // Ordenar por fecha y prioridad
    filtered.sort((a, b) => {
      const dateA = new Date(a.scheduled_date);
      const dateB = new Date(b.scheduled_date);

      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }

      // Si las fechas son iguales, ordenar por prioridad
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    setFilteredEvents(filtered);
  }, [events, filters]);

  // Función para obtener el color de la prioridad
  const getPriorityColor = (priority: EventPriority): string => {
    switch (priority) {
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "high":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "low":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: EventStatus): string => {
    switch (status) {
      case "scheduled":
        return "text-blue-500 bg-blue-500/10";
      case "confirmed":
        return "text-green-500 bg-green-500/10";
      case "in_progress":
        return "text-purple-500 bg-purple-500/10";
      case "completed":
        return "text-green-600 bg-green-600/10";
      case "cancelled":
        return "text-gray-500 bg-gray-500/10";
      case "overdue":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  // Función para obtener el ícono del tipo de evento
  const getEventTypeIcon = (type: EventType) => {
    switch (type) {
      case "vaccination":
        return <Shield className="w-5 h-5" />;
      case "health_check":
        return <Heart className="w-5 h-5" />;
      case "medication":
        return <Pill className="w-5 h-5" />;
      case "breeding":
        return <Baby className="w-5 h-5" />;
      case "calving":
        return <Baby className="w-5 h-5" />;
      case "weaning":
        return <Users className="w-5 h-5" />;
      case "weighing":
        return <Scale className="w-5 h-5" />;
      case "movement":
        return <Truck className="w-5 h-5" />;
      case "veterinary":
        return <Stethoscope className="w-5 h-5" />;
      default:
        return <Calendar className="w-5 h-5" />;
    }
  };

  // Componente para el card de evento
  const EventCard: React.FC<{ event: UpcomingEvent; index: number }> = ({
    event,
    index,
  }) => {
    const eventDate = new Date(event.scheduled_date);
    const isToday = eventDate.toDateString() === new Date().toDateString();
    const isOverdue = event.status === "overdue";
    const timeUntil = React.useMemo(() => {
      const now = new Date();
      const diffMs = eventDate.getTime() - now.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor(
        (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );

      if (isOverdue) return "Overdue";
      if (diffDays === 0 && diffHours <= 0) return "Starting soon";
      if (diffDays === 0) return `In ${diffHours}h`;
      if (diffDays === 1) return "Tomorrow";
      return `In ${diffDays} days`;
    }, [eventDate, isOverdue]);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.01, y: -2 }}
        onClick={() => {
          setSelectedEvent(event);
          setShowDetails(true);
        }}
        className={`relative p-6 rounded-2xl backdrop-blur-xl border cursor-pointer 
                   transition-all duration-300 shadow-lg overflow-hidden
                   ${
                     isOverdue
                       ? "bg-red-500/10 border-red-500/30 shadow-red-500/20"
                       : isToday
                       ? "bg-blue-500/10 border-blue-500/30 shadow-blue-500/20"
                       : "bg-white/5 border-white/10 hover:bg-white/10"
                   }`}
      >
        {/* Indicador de urgencia */}
        {(isOverdue || event.priority === "critical") && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 right-2 p-2 bg-red-500/20 rounded-full"
          >
            <AlertTriangle className="w-4 h-4 text-red-400" />
          </motion.div>
        )}

        {/* Header del evento */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded-xl ${getPriorityColor(event.priority)}`}
            >
              {getEventTypeIcon(event.type)}
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">{event.title}</h3>
              <p className="text-white/70 text-sm">{event.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                event.priority
              )}`}
            >
              {event.priority}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                event.status
              )}`}
            >
              {event.status}
            </div>
          </div>
        </div>

        {/* Información del evento */}
        <div className="space-y-3">
          {/* Fecha y hora */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-white/70">
              <Calendar className="w-4 h-4 mr-2" />
              <span className="text-sm">
                {eventDate.toLocaleDateString()} at{" "}
                {eventDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div
              className={`text-sm font-medium ${
                isOverdue
                  ? "text-red-400"
                  : isToday
                  ? "text-blue-400"
                  : "text-white/80"
              }`}
            >
              {timeUntil}
            </div>
          </div>

          {/* Duración */}
          <div className="flex items-center text-white/70">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {event.estimated_duration_minutes} minutes
            </span>
          </div>

          {/* Animales involucrados */}
          <div className="flex items-center text-white/70">
            <Users className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {event.animal_ids.length === 1
                ? event.animal_ids[0]
                : `${event.animal_ids.length} animals`}
            </span>
          </div>

          {/* Ubicación */}
          <div className="flex items-center text-white/70">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm truncate">{event.location.area_name}</span>
          </div>

          {/* Responsable */}
          <div className="flex items-center justify-between">
            <div className="flex items-center text-white/70">
              <User className="w-4 h-4 mr-2" />
              <span className="text-sm">{event.assigned_to}</span>
            </div>
            {event.veterinarian && (
              <div className="flex items-center text-purple-400">
                <Stethoscope className="w-3 h-3 mr-1" />
                <span className="text-xs">{event.veterinarian}</span>
              </div>
            )}
          </div>

          {/* Costo estimado */}
          {event.cost_estimate && (
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-white/60 text-sm">Estimated Cost:</span>
              <span className="text-white font-medium">
                ${event.cost_estimate}
              </span>
            </div>
          )}
        </div>

        {/* Indicador de recordatorio */}
        {event.reminder_settings.notified && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-2 left-2 p-2 bg-blue-500/20 rounded-full"
          >
            <Bell className="w-3 h-3 text-blue-400" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  // Componente para estadísticas rápidas
  const QuickStatsCard: React.FC<{
    title: string;
    value: number;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    index: number;
  }> = ({ title, value, subtitle, icon, color, index }) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color} bg-white/10`}>{icon}</div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm font-medium text-white/90">{title}</p>
            <p className="text-xs text-white/60">{subtitle}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white/20 border-t-purple-500 rounded-full"
          />
        </div>
      </div>
    );
  }

  if (!eventsSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
        <div className="text-center text-white">Error loading events data</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Upcoming Events
            </h1>
            <p className="text-white/70">
              Schedule and manage livestock care activities
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <button
              onClick={() =>
                setViewMode(viewMode === "list" ? "calendar" : "list")
              }
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-colors"
            >
              {viewMode === "list" ? (
                <CalendarDays className="w-4 h-4" />
              ) : (
                <Users className="w-4 h-4" />
              )}
            </button>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Event
            </button>
          </div>
        </motion.div>

        {/* Estadísticas rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8"
        >
          <QuickStatsCard
            title="Total Events"
            value={eventsSummary.total_events}
            subtitle="Scheduled"
            icon={<Calendar className="w-5 h-5" />}
            color="text-blue-500"
            index={0}
          />
          <QuickStatsCard
            title="Today"
            value={eventsSummary.today_events}
            subtitle="Events today"
            icon={<Timer className="w-5 h-5" />}
            color="text-green-500"
            index={1}
          />
          <QuickStatsCard
            title="This Week"
            value={eventsSummary.this_week_events}
            subtitle="Next 7 days"
            icon={<CalendarDays className="w-5 h-5" />}
            color="text-purple-500"
            index={2}
          />
          <QuickStatsCard
            title="Overdue"
            value={eventsSummary.overdue_events}
            subtitle="Require attention"
            icon={<AlertTriangle className="w-5 h-5" />}
            color="text-red-500"
            index={3}
          />
          <QuickStatsCard
            title="High Priority"
            value={eventsSummary.high_priority_events}
            subtitle="Critical & High"
            icon={<Zap className="w-5 h-5" />}
            color="text-orange-500"
            index={4}
          />
          <QuickStatsCard
            title="Completed"
            value={eventsSummary.by_status.completed || 0}
            subtitle="This month"
            icon={<CheckCircle className="w-5 h-5" />}
            color="text-green-600"
            index={5}
          />
        </motion.div>

        {/* Controles de filtro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search events, animals, or locations..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg
                         text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: e.target.value as EventType | "all",
                  }))
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                         focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Types</option>
                <option value="vaccination">Vaccination</option>
                <option value="health_check">Health Check</option>
                <option value="medication">Medication</option>
                <option value="breeding">Breeding</option>
                <option value="calving">Calving</option>
                <option value="weighing">Weighing</option>
                <option value="movement">Movement</option>
                <option value="veterinary">Veterinary</option>
              </select>

              <select
                value={filters.priority}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    priority: e.target.value as EventPriority | "all",
                  }))
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                         focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filters.date_range}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    date_range: e.target.value as typeof filters.date_range,
                  }))
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                         focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Lista de eventos */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">
                No events found
              </h3>
              <p className="text-white/50">
                Try adjusting your filters or create a new event
              </p>
            </div>
          ) : (
            filteredEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
            ))
          )}
        </motion.div>

        {/* Modal de detalles del evento */}
        <AnimatePresence>
          {showDetails && selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 
                         p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header del modal */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-4 rounded-xl ${getPriorityColor(
                        selectedEvent.priority
                      )}`}
                    >
                      {getEventTypeIcon(selectedEvent.type)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        {selectedEvent.title}
                      </h2>
                      <p className="text-white/70 text-lg">
                        {selectedEvent.description}
                      </p>
                      <div className="flex items-center space-x-3 mt-2">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                            selectedEvent.priority
                          )}`}
                        >
                          {selectedEvent.priority}
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            selectedEvent.status
                          )}`}
                        >
                          {selectedEvent.status}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Navigation className="w-5 h-5 text-white/70 rotate-45" />
                  </button>
                </div>

                {/* Contenido del modal */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información básica */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-3">
                      Event Details
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-white/60 mr-3" />
                        <span className="text-white">
                          {new Date(
                            selectedEvent.scheduled_date
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 text-white/60 mr-3" />
                        <span className="text-white">
                          {selectedEvent.estimated_duration_minutes} minutes
                        </span>
                      </div>
                      <div className="flex items-center">
                        <User className="w-4 h-4 text-white/60 mr-3" />
                        <span className="text-white">
                          {selectedEvent.assigned_to}
                        </span>
                      </div>
                      {selectedEvent.veterinarian && (
                        <div className="flex items-center">
                          <Stethoscope className="w-4 h-4 text-white/60 mr-3" />
                          <span className="text-white">
                            {selectedEvent.veterinarian}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-3">Location</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-white/60 mr-2" />
                        <span className="text-white">
                          {selectedEvent.location.area_name}
                        </span>
                      </div>
                      <div className="text-white/70">
                        {selectedEvent.location.specific_location}
                      </div>
                      <div className="text-white/60">
                        Coordinates: {selectedEvent.location.lat},{" "}
                        {selectedEvent.location.lng}
                      </div>
                    </div>
                  </div>

                  {/* Animales involucrados */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-3">
                      Animals Involved
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.animal_ids.map((id) => (
                        <span
                          key={id}
                          className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm"
                        >
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Requisitos */}
                  {selectedEvent.requirements && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <h3 className="font-semibold text-white mb-3">
                        Requirements
                      </h3>
                      <ul className="space-y-1 text-sm text-white/80">
                        {selectedEvent.requirements.map((req, index) => (
                          <li key={index} className="flex items-center">
                            <CheckCircle className="w-3 h-3 text-green-400 mr-2" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Notas */}
                {selectedEvent.notes && (
                  <div className="mt-6 bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Notes</h3>
                    <p className="text-white/80">{selectedEvent.notes}</p>
                  </div>
                )}

                {/* Costo */}
                {selectedEvent.cost_estimate && (
                  <div className="mt-4 text-center">
                    <span className="text-white/60">Estimated Cost: </span>
                    <span className="text-2xl font-bold text-green-400">
                      ${selectedEvent.cost_estimate}
                    </span>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex space-x-3 mt-6">
                  <button
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 
                                   rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Location
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600/20 border border-green-500/30 text-green-300 
                                   rounded-lg hover:bg-green-600/30 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 
                                   rounded-lg hover:bg-blue-600/30 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    className="px-4 py-2 bg-red-600/20 border border-red-500/30 text-red-300 
                                   rounded-lg hover:bg-red-600/30 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UpcomingEvents;
