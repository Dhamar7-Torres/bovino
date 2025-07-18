import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Filter,
  Search,
  Download,
  Printer,
  Grid3X3,
  List,
  Syringe,
  Heart,
  Stethoscope,
  AlertTriangle,
  Baby,
  Package,
  Beef,
  Users,
  FileText,
  Clock,
  User,
  CheckCircle,
  X,
  MoreHorizontal,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { Link } from "react-router-dom";

// Interfaces para TypeScript
interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  date: string;
  time: string;
  endTime: string;
  duration: number;
  location: {
    lat: number;
    lng: number;
    address: string;
    section?: string;
  };
  bovineIds: string[];
  bovineNames: string[];
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "completed" | "cancelled" | "in_progress";
  reminderSet: boolean;
  veterinarian?: string;
  cost?: number;
  tags: string[];
  isRecurring: boolean;
  createdBy: string;
  weather?: WeatherInfo;
}

interface EventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  textColor: string;
  category: "health" | "reproduction" | "nutrition" | "general";
}

interface WeatherInfo {
  temperature: number;
  condition: string;
  icon: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  events: CalendarEvent[];
  eventCount: number;
  hasUrgentEvents: boolean;
  isPastDue: boolean;
}

interface CalendarFilter {
  eventTypes: string[];
  priorities: string[];
  statuses: string[];
  showCompleted: boolean;
  showCancelled: boolean;
  searchQuery: string;
  veterinarian?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

interface MonthStats {
  totalEvents: number;
  completedEvents: number;
  pendingEvents: number;
  urgentEvents: number;
  eventsByType: Record<string, number>;
  totalCost: number;
  completionRate: number;
}

// Tipos de eventos disponibles
const eventTypes: Record<string, EventType> = {
  vaccination: {
    id: "vaccination",
    name: "Vacunación",
    icon: Syringe,
    color: "bg-green-500",
    textColor: "text-green-700",
    category: "health",
  },
  illness: {
    id: "illness",
    name: "Enfermedad",
    icon: Heart,
    color: "bg-red-500",
    textColor: "text-red-700",
    category: "health",
  },
  checkup: {
    id: "checkup",
    name: "Revisión Médica",
    icon: Stethoscope,
    color: "bg-blue-500",
    textColor: "text-blue-700",
    category: "health",
  },
  birth: {
    id: "birth",
    name: "Parto",
    icon: Baby,
    color: "bg-pink-500",
    textColor: "text-pink-700",
    category: "reproduction",
  },
  breeding: {
    id: "breeding",
    name: "Monta/Inseminación",
    icon: Users,
    color: "bg-purple-500",
    textColor: "text-purple-700",
    category: "reproduction",
  },
  feeding: {
    id: "feeding",
    name: "Alimentación",
    icon: Package,
    color: "bg-orange-500",
    textColor: "text-orange-700",
    category: "nutrition",
  },
  emergency: {
    id: "emergency",
    name: "Emergencia",
    icon: AlertTriangle,
    color: "bg-yellow-500",
    textColor: "text-yellow-700",
    category: "health",
  },
  general: {
    id: "general",
    name: "General",
    icon: FileText,
    color: "bg-gray-500",
    textColor: "text-gray-700",
    category: "general",
  },
};

// Mock data para eventos del calendario
const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "evt_001",
    title: "Vacunación Antirrábica - Lote A",
    description: "Aplicación de vacuna antirrábica a bovinos del lote A",
    eventType: eventTypes.vaccination,
    date: "2025-07-15",
    time: "09:00",
    endTime: "11:00",
    duration: 120,
    location: {
      lat: 20.5888,
      lng: -100.3899,
      address: "Corral A - Zona Norte",
      section: "Lote A",
    },
    bovineIds: ["1", "3", "5"],
    bovineNames: ["Luna", "Bella", "Rosa"],
    priority: "high",
    status: "completed",
    reminderSet: true,
    veterinarian: "Dra. María González",
    cost: 450.0,
    tags: ["vacunacion", "lote-a", "sanitario"],
    isRecurring: false,
    createdBy: "Dr. Carlos Ruiz",
    weather: {
      temperature: 24,
      condition: "Soleado",
      icon: "☀️",
    },
  },
  {
    id: "evt_002",
    title: "Chequeo Médico - Toro Alpha",
    description: "Revisión médica rutinaria del toro reproductor",
    eventType: eventTypes.checkup,
    date: "2025-07-20",
    time: "14:00",
    endTime: "15:30",
    duration: 90,
    location: {
      lat: 20.59,
      lng: -100.385,
      address: "Corral B - Zona Sur",
      section: "Área de Reproductores",
    },
    bovineIds: ["2"],
    bovineNames: ["Toro Alpha"],
    priority: "medium",
    status: "pending",
    reminderSet: true,
    veterinarian: "Dr. Pedro Martínez",
    cost: 200.0,
    tags: ["chequeo", "reproductor"],
    isRecurring: false,
    createdBy: "Dr. Carlos Ruiz",
  },
  {
    id: "evt_003",
    title: "Parto Asistido - Bella",
    description: "Asistencia en parto de la vaca Bella",
    eventType: eventTypes.birth,
    date: "2025-07-25",
    time: "06:00",
    endTime: "08:00",
    duration: 120,
    location: {
      lat: 20.587,
      lng: -100.388,
      address: "Establo de Maternidad",
    },
    bovineIds: ["3"],
    bovineNames: ["Bella"],
    priority: "urgent",
    status: "pending",
    reminderSet: true,
    veterinarian: "Dra. María González",
    tags: ["parto", "maternidad", "emergencia"],
    isRecurring: false,
    createdBy: "Dr. Carlos Ruiz",
  },
  {
    id: "evt_004",
    title: "Suplementación Nutricional",
    description: "Aplicación de suplementos vitamínicos",
    eventType: eventTypes.feeding,
    date: "2025-07-18",
    time: "16:00",
    endTime: "17:00",
    duration: 60,
    location: {
      lat: 20.589,
      lng: -100.387,
      address: "Área de Alimentación",
    },
    bovineIds: ["1", "2", "4", "5"],
    bovineNames: ["Luna", "Toro Alpha", "Max", "Rosa"],
    priority: "low",
    status: "pending",
    reminderSet: false,
    cost: 150.0,
    tags: ["nutricion", "vitaminas"],
    isRecurring: true,
    createdBy: "Nutricionista",
  },
  {
    id: "evt_005",
    title: "Emergencia - Cojera Max",
    description: "Atención urgente por cojera en bovino Max",
    eventType: eventTypes.emergency,
    date: "2025-07-12",
    time: "10:30",
    endTime: "12:00",
    duration: 90,
    location: {
      lat: 20.5885,
      lng: -100.3885,
      address: "Corral C - Enfermería",
    },
    bovineIds: ["4"],
    bovineNames: ["Max"],
    priority: "urgent",
    status: "completed",
    reminderSet: true,
    veterinarian: "Dr. Pedro Martínez",
    cost: 300.0,
    tags: ["emergencia", "cojera", "tratamiento"],
    isRecurring: false,
    createdBy: "Cuidador",
  },
  {
    id: "evt_006",
    title: "Inseminación Artificial - Rosa",
    description: "Proceso de inseminación artificial programada",
    eventType: eventTypes.breeding,
    date: "2025-07-22",
    time: "08:00",
    endTime: "09:00",
    duration: 60,
    location: {
      lat: 20.5875,
      lng: -100.3875,
      address: "Centro de Reproducción",
    },
    bovineIds: ["5"],
    bovineNames: ["Rosa"],
    priority: "high",
    status: "pending",
    reminderSet: true,
    veterinarian: "Especialista en Reproducción",
    cost: 500.0,
    tags: ["reproduccion", "inseminacion"],
    isRecurring: false,
    createdBy: "Dr. Carlos Ruiz",
  },
];

// Nombres de los meses y días
const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const DAYS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Componente principal MonthView
const MonthView: React.FC = () => {
  // Estados principales
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [events] = useState<CalendarEvent[]>(mockCalendarEvents);
  const [viewMode, setViewMode] = useState<"month" | "list">("month");
  const [showFilters, setShowFilters] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  // Estados de filtros
  const [filters, setFilters] = useState<CalendarFilter>({
    eventTypes: [],
    priorities: [],
    statuses: [],
    showCompleted: true,
    showCancelled: false,
    searchQuery: "",
  });

  // Estados de UI
  const [] = useState(false);
  const [] = useState(false);

  // Funciones para navegación del calendario
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Filtrar eventos según criterios activos
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Filtro por tipo de evento
      if (
        filters.eventTypes.length > 0 &&
        !filters.eventTypes.includes(event.eventType.id)
      ) {
        return false;
      }

      // Filtro por prioridad
      if (
        filters.priorities.length > 0 &&
        !filters.priorities.includes(event.priority)
      ) {
        return false;
      }

      // Filtro por estado
      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(event.status)
      ) {
        return false;
      }

      // Mostrar/ocultar completados
      if (!filters.showCompleted && event.status === "completed") {
        return false;
      }

      // Mostrar/ocultar cancelados
      if (!filters.showCancelled && event.status === "cancelled") {
        return false;
      }

      // Filtro por búsqueda
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          event.bovineNames.some((name) =>
            name.toLowerCase().includes(query)
          ) ||
          (event.veterinarian &&
            event.veterinarian.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [events, filters]);

  // Generar días del calendario para el mes actual
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();

    // Primer día del mes y último día del mes
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Días a mostrar antes del primer día del mes
    const daysFromPrevMonth = firstDay.getDay();

    // Días totales a mostrar (6 semanas × 7 días)
    const totalDays = 42;

    const days: CalendarDay[] = [];

    // Días del mes anterior
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      const dayEvents = filteredEvents.filter(
        (event) => new Date(event.date).toDateString() === date.toDateString()
      );

      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate?.toDateString() === date.toDateString(),
        events: dayEvents,
        eventCount: dayEvents.length,
        hasUrgentEvents: dayEvents.some((e) => e.priority === "urgent"),
        isPastDue: dayEvents.some(
          (e) => e.status === "pending" && new Date(e.date) < today
        ),
      });
    }

    // Días del mes actual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const dayEvents = filteredEvents.filter(
        (event) => new Date(event.date).toDateString() === date.toDateString()
      );

      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate?.toDateString() === date.toDateString(),
        events: dayEvents,
        eventCount: dayEvents.length,
        hasUrgentEvents: dayEvents.some((e) => e.priority === "urgent"),
        isPastDue: dayEvents.some(
          (e) => e.status === "pending" && new Date(e.date) < today
        ),
      });
    }

    // Días del mes siguiente para completar la grilla
    const remainingDays = totalDays - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      const dayEvents = filteredEvents.filter(
        (event) => new Date(event.date).toDateString() === date.toDateString()
      );

      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.toDateString() === today.toDateString(),
        isSelected: selectedDate?.toDateString() === date.toDateString(),
        events: dayEvents,
        eventCount: dayEvents.length,
        hasUrgentEvents: dayEvents.some((e) => e.priority === "urgent"),
        isPastDue: dayEvents.some(
          (e) => e.status === "pending" && new Date(e.date) < today
        ),
      });
    }

    return days;
  }, [currentDate, filteredEvents, selectedDate]);

  // Calcular estadísticas del mes
  const monthStats = useMemo((): MonthStats => {
    const monthEvents = filteredEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });

    const eventsByType = monthEvents.reduce((acc, event) => {
      acc[event.eventType.id] = (acc[event.eventType.id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalCost = monthEvents.reduce(
      (sum, event) => sum + (event.cost || 0),
      0
    );
    const completedEvents = monthEvents.filter(
      (e) => e.status === "completed"
    ).length;
    const pendingEvents = monthEvents.filter(
      (e) => e.status === "pending"
    ).length;
    const urgentEvents = monthEvents.filter(
      (e) => e.priority === "urgent"
    ).length;

    return {
      totalEvents: monthEvents.length,
      completedEvents,
      pendingEvents,
      urgentEvents,
      eventsByType,
      totalCost,
      completionRate:
        monthEvents.length > 0
          ? (completedEvents / monthEvents.length) * 100
          : 0,
    };
  }, [filteredEvents, currentDate]);

  // Función para manejar clic en día
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    if (day.events.length === 1) {
      setSelectedEvent(day.events[0]);
      setShowEventModal(true);
    }
  };

  // Función para obtener color de prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "border-l-green-500";
      case "medium":
        return "border-l-yellow-500";
      case "high":
        return "border-l-orange-500";
      case "urgent":
        return "border-l-red-500";
      default:
        return "border-l-gray-500";
    }
  };

  // Función para obtener color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                  <Calendar className="w-6 h-6" />
                </div>
                Calendario Mensual
              </h1>
              <p className="text-gray-600">
                Vista completa de eventos y actividades del ganado
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() =>
                  setViewMode(viewMode === "month" ? "list" : "month")
                }
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                {viewMode === "month" ? (
                  <List className="w-4 h-4" />
                ) : (
                  <Grid3X3 className="w-4 h-4" />
                )}
                {viewMode === "month" ? "Vista Lista" : "Vista Mes"}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filtros
              </motion.button>

              <Link
                to="/calendar/create"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo Evento
              </Link>
            </div>
          </div>

          {/* Estadísticas del Mes */}
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Eventos</p>
                  <p className="text-xl font-bold text-gray-900">
                    {monthStats.totalEvents}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completados</p>
                  <p className="text-xl font-bold text-gray-900">
                    {monthStats.completedEvents}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pendientes</p>
                  <p className="text-xl font-bold text-gray-900">
                    {monthStats.pendingEvents}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Urgentes</p>
                  <p className="text-xl font-bold text-gray-900">
                    {monthStats.urgentEvents}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completado</p>
                  <p className="text-xl font-bold text-gray-900">
                    {monthStats.completionRate.toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Filtros de Eventos
                </h3>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Búsqueda */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Búsqueda
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Buscar eventos..."
                        value={filters.searchQuery}
                        onChange={(e) =>
                          setFilters((prev) => ({
                            ...prev,
                            searchQuery: e.target.value,
                          }))
                        }
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Tipos de Evento */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipos de Evento
                    </label>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {Object.values(eventTypes).map((type) => (
                        <label
                          key={type.id}
                          className="flex items-center gap-2"
                        >
                          <input
                            type="checkbox"
                            checked={filters.eventTypes.includes(type.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFilters((prev) => ({
                                  ...prev,
                                  eventTypes: [...prev.eventTypes, type.id],
                                }));
                              } else {
                                setFilters((prev) => ({
                                  ...prev,
                                  eventTypes: prev.eventTypes.filter(
                                    (t) => t !== type.id
                                  ),
                                }));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className="flex items-center gap-2">
                            <type.icon
                              className={`w-4 h-4 ${type.textColor}`}
                            />
                            <span className="text-sm">{type.name}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Estados y Opciones */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prioridades
                      </label>
                      <div className="space-y-2">
                        {[
                          {
                            id: "urgent",
                            label: "Urgente",
                            color: "text-red-600",
                          },
                          {
                            id: "high",
                            label: "Alta",
                            color: "text-orange-600",
                          },
                          {
                            id: "medium",
                            label: "Media",
                            color: "text-yellow-600",
                          },
                          { id: "low", label: "Baja", color: "text-green-600" },
                        ].map((priority) => (
                          <label
                            key={priority.id}
                            className="flex items-center gap-2"
                          >
                            <input
                              type="checkbox"
                              checked={filters.priorities.includes(priority.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFilters((prev) => ({
                                    ...prev,
                                    priorities: [
                                      ...prev.priorities,
                                      priority.id,
                                    ],
                                  }));
                                } else {
                                  setFilters((prev) => ({
                                    ...prev,
                                    priorities: prev.priorities.filter(
                                      (p) => p !== priority.id
                                    ),
                                  }));
                                }
                              }}
                              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className={`text-sm ${priority.color}`}>
                              {priority.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.showCompleted}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              showCompleted: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">Mostrar completados</span>
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filters.showCancelled}
                          onChange={(e) =>
                            setFilters((prev) => ({
                              ...prev,
                              showCancelled: e.target.checked,
                            }))
                          }
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="text-sm">Mostrar cancelados</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setFilters({
                        eventTypes: [],
                        priorities: [],
                        statuses: [],
                        showCompleted: true,
                        showCancelled: false,
                        searchQuery: "",
                      })
                    }
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Limpiar Filtros
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Aplicar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navegación del Calendario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6"
        >
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateMonth("prev")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </motion.button>

              <h2 className="text-xl font-semibold text-gray-900">
                {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateMonth("next")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </motion.button>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={goToToday}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
              >
                Hoy
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Printer className="w-4 h-4" />
              </motion.button>
            </div>
          </div>

          {/* Calendario */}
          {viewMode === "month" ? (
            <div className="p-4">
              {/* Encabezados de días */}
              <div className="grid grid-cols-7 mb-2">
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="p-2 text-center text-sm font-medium text-gray-500"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Días del calendario */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => handleDayClick(day)}
                    className={`min-h-[120px] p-2 border rounded-lg cursor-pointer transition-all ${
                      day.isCurrentMonth
                        ? "bg-white border-gray-200 hover:border-blue-300 hover:shadow-md"
                        : "bg-gray-50 border-gray-100 text-gray-400"
                    } ${day.isToday ? "border-blue-500 bg-blue-50" : ""} ${
                      day.isSelected ? "border-blue-600 bg-blue-100" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`text-sm font-medium ${
                          day.isToday
                            ? "text-blue-600"
                            : day.isCurrentMonth
                            ? "text-gray-900"
                            : "text-gray-400"
                        }`}
                      >
                        {day.date.getDate()}
                      </span>

                      {day.hasUrgentEvents && (
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                      )}
                    </div>

                    {/* Eventos del día */}
                    <div className="space-y-1">
                      {day.events.slice(0, 3).map((event) => (
                        <motion.div
                          key={event.id}
                          whileHover={{ scale: 1.05 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                            setShowEventModal(true);
                          }}
                          className={`text-xs p-1 rounded border-l-2 ${getPriorityColor(
                            event.priority
                          )} ${event.eventType.color.replace(
                            "bg-",
                            "bg-opacity-20 bg-"
                          )} hover:shadow-sm cursor-pointer`}
                        >
                          <div className="flex items-center gap-1">
                            <event.eventType.icon className="w-3 h-3" />
                            <span className="truncate font-medium">
                              {event.title}
                            </span>
                          </div>
                          <div className="text-gray-600">{event.time}</div>
                        </motion.div>
                      ))}

                      {day.events.length > 3 && (
                        <div className="text-xs text-gray-500 text-center py-1">
                          +{day.events.length - 3} más
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            /* Vista de Lista */
            <div className="p-4">
              <div className="space-y-3">
                {filteredEvents
                  .filter((event) => {
                    const eventDate = new Date(event.date);
                    return (
                      eventDate.getMonth() === currentDate.getMonth() &&
                      eventDate.getFullYear() === currentDate.getFullYear()
                    );
                  })
                  .sort(
                    (a, b) =>
                      new Date(a.date + " " + a.time).getTime() -
                      new Date(b.date + " " + b.time).getTime()
                  )
                  .map((event) => (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowEventModal(true);
                      }}
                      className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-10 h-10 ${event.eventType.color} rounded-lg flex items-center justify-center text-white`}
                          >
                            <event.eventType.icon className="w-5 h-5" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">
                                {event.title}
                              </h3>
                              <div
                                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                                  event.status
                                )}`}
                              >
                                {event.status === "pending"
                                  ? "Pendiente"
                                  : event.status === "completed"
                                  ? "Completado"
                                  : event.status === "cancelled"
                                  ? "Cancelado"
                                  : "En Progreso"}
                              </div>
                              <div
                                className={`px-2 py-1 rounded-full text-xs ${
                                  event.priority === "urgent"
                                    ? "bg-red-100 text-red-800"
                                    : event.priority === "high"
                                    ? "bg-orange-100 text-orange-800"
                                    : event.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                                }`}
                              >
                                {event.priority === "urgent"
                                  ? "Urgente"
                                  : event.priority === "high"
                                  ? "Alta"
                                  : event.priority === "medium"
                                  ? "Media"
                                  : "Baja"}
                              </div>
                            </div>

                            <p className="text-gray-600 text-sm mb-2">
                              {event.description}
                            </p>

                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(event.date).toLocaleDateString()}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {event.time} - {event.endTime}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <Beef className="w-4 h-4" />
                                <span>{event.bovineNames.join(", ")}</span>
                              </div>

                              {event.veterinarian && (
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4" />
                                  <span>{event.veterinarian}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Acción para el botón de más opciones
                          }}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Modal de Evento (placeholder) */}
        <AnimatePresence>
          {showEventModal && selectedEvent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowEventModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detalles del Evento
                  </h3>
                  <button
                    onClick={() => setShowEventModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 ${selectedEvent.eventType.color} rounded-lg flex items-center justify-center text-white`}
                    >
                      <selectedEvent.eventType.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {selectedEvent.title}
                      </h4>
                      <p className="text-gray-600">
                        {selectedEvent.eventType.name}
                      </p>
                    </div>
                  </div>

                  <p className="text-gray-700">{selectedEvent.description}</p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-500">
                        Fecha y Hora:
                      </span>
                      <p>
                        {new Date(selectedEvent.date).toLocaleDateString()} -{" "}
                        {selectedEvent.time}
                      </p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">Duración:</span>
                      <p>{selectedEvent.duration} minutos</p>
                    </div>

                    <div>
                      <span className="text-sm text-gray-500">Bovinos:</span>
                      <p>{selectedEvent.bovineNames.join(", ")}</p>
                    </div>

                    {selectedEvent.veterinarian && (
                      <div>
                        <span className="text-sm text-gray-500">
                          Veterinario:
                        </span>
                        <p>{selectedEvent.veterinarian}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Link
                      to={`/calendar/events/${selectedEvent.id}`}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-center"
                    >
                      Ver Detalles Completos
                    </Link>

                    <Link
                      to={`/calendar/edit/${selectedEvent.id}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Editar
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default MonthView;
