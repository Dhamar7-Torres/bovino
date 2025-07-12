import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  Calendar,
  Filter,
  Search,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  MapPin,
  DollarSign,
  Truck,
  Heart,
  Utensils,
  ShoppingBag,
  ShoppingCart,
  Syringe,
  Activity,
  Clock,
  User,
  Building,
  FileText,
  MoreHorizontal,
} from "lucide-react";

// Interfaz para eventos en la timeline
interface TimelineEvent {
  id: string;
  type:
    | "vaccination"
    | "purchase"
    | "sale"
    | "transport"
    | "health"
    | "feeding"
    | "breeding"
    | "general";
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  bovineId: string;
  bovineName?: string;
  details: {
    [key: string]: any;
  };
  status: "completed" | "pending" | "cancelled" | "in_progress";
  priority: "low" | "medium" | "high" | "critical";
  createdBy: string;
  cost?: number;
  notes?: string;
}

// Datos de ejemplo para la timeline
const mockEvents: TimelineEvent[] = [
  {
    id: "1",
    type: "vaccination",
    title: "Vacunación contra Brucelosis",
    description: "Aplicación de vacuna RB51 contra brucelosis bovina",
    date: "2025-07-12",
    time: "09:30",
    location: "Corral A - Sector Norte",
    bovineId: "BOV-001",
    bovineName: "Luna",
    details: {
      vaccine: "RB51 Brucelosis",
      veterinarian: "Dr. María González",
      dose: "2ml",
      nextDueDate: "2026-07-12",
    },
    status: "completed",
    priority: "high",
    createdBy: "Juan Pérez",
    cost: 150,
    notes: "Animal en excelente estado de salud",
  },
  {
    id: "2",
    type: "transport",
    title: "Transporte a Mercado Regional",
    description: "Traslado de 5 bovinos al mercado de Villahermosa",
    date: "2025-07-11",
    time: "06:00",
    location: "Rancho → Mercado Villahermosa",
    bovineId: "BOV-002,BOV-003,BOV-004",
    details: {
      driver: "Carlos Mendoza",
      vehicle: "Camión GAA-123",
      distance: "45 km",
      duration: "1.5 horas",
    },
    status: "completed",
    priority: "medium",
    createdBy: "Ana López",
    cost: 800,
  },
  {
    id: "3",
    type: "sale",
    title: "Venta de Toro Reproductor",
    description: "Venta de toro angus de 2 años a Rancho El Mirador",
    date: "2025-07-10",
    time: "14:20",
    location: "Rancho San José",
    bovineId: "BOV-005",
    bovineName: "Capitán",
    details: {
      buyer: "Rancho El Mirador",
      price: 45000,
      weight: "650 kg",
      pricePerKg: 69.23,
    },
    status: "completed",
    priority: "high",
    createdBy: "Roberto Silva",
    cost: 45000,
    notes: "Toro de excelente genética, certificado sanitario incluido",
  },
  {
    id: "4",
    type: "health",
    title: "Revisión Veterinaria Mensual",
    description: "Chequeo general de salud del hato",
    date: "2025-07-09",
    time: "11:00",
    location: "Instalaciones Veterinarias",
    bovineId: "HATO-GENERAL",
    details: {
      veterinarian: "Dr. Luis Ramírez",
      animalsChecked: 25,
      healthyAnimals: 24,
      treatmentRequired: 1,
    },
    status: "completed",
    priority: "medium",
    createdBy: "Dr. Luis Ramírez",
    cost: 500,
  },
  {
    id: "5",
    type: "purchase",
    title: "Compra de Vaquillas Brahman",
    description: "Adquisición de 3 vaquillas brahman de 18 meses",
    date: "2025-07-08",
    time: "16:45",
    location: "Feria Ganadera de Cunduacán",
    bovineId: "BOV-006,BOV-007,BOV-008",
    details: {
      seller: "Ganadería Los Ceibos",
      totalPrice: 67500,
      averageWeight: "380 kg",
      pricePerKg: 59.21,
    },
    status: "completed",
    priority: "high",
    createdBy: "Fernando Vázquez",
    cost: 67500,
  },
  {
    id: "6",
    type: "feeding",
    title: "Cambio de Alimentación",
    description: "Inicio de programa nutricional para engorda",
    date: "2025-07-07",
    time: "07:30",
    location: "Potrero 3",
    bovineId: "GRUPO-ENGORDA",
    details: {
      feedType: "Concentrado proteico 18%",
      quantity: "500 kg",
      supplier: "Alimentos del Sureste",
    },
    status: "completed",
    priority: "low",
    createdBy: "María Fernández",
    cost: 2500,
  },
  {
    id: "7",
    type: "breeding",
    title: "Inseminación Artificial",
    description: "IA con semen de toro holstein premium",
    date: "2025-07-06",
    time: "10:15",
    location: "Corral de Manejo",
    bovineId: "BOV-009",
    bovineName: "Esperanza",
    details: {
      bullSemen: "Holstein Premium HLP-2024",
      technician: "MVZ Carlos Herrera",
      expectedCalving: "2026-04-13",
    },
    status: "completed",
    priority: "high",
    createdBy: "MVZ Carlos Herrera",
    cost: 800,
    notes: "Vaca en celo óptimo, excelente condición corporal",
  },
  {
    id: "8",
    type: "vaccination",
    title: "Vacunación Triple Viral",
    description: "Vacuna contra IBR, BVD y PI3",
    date: "2025-07-05",
    time: "08:00",
    location: "Corral Central",
    bovineId: "BOV-010,BOV-011,BOV-012",
    details: {
      vaccine: "Triple Viral Bovina",
      veterinarian: "Dr. Patricia Morales",
      animalsVaccinated: 15,
    },
    status: "completed",
    priority: "medium",
    createdBy: "Dr. Patricia Morales",
    cost: 450,
  },
];

// Configuración de tipos de eventos
const eventConfig = {
  vaccination: {
    icon: Syringe,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-300",
    label: "Vacunación",
  },
  purchase: {
    icon: ShoppingCart,
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-300",
    label: "Compra",
  },
  sale: {
    icon: ShoppingBag,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    borderColor: "border-purple-300",
    label: "Venta",
  },
  transport: {
    icon: Truck,
    color: "text-indigo-600",
    bgColor: "bg-indigo-100",
    borderColor: "border-indigo-300",
    label: "Transporte",
  },
  health: {
    icon: Heart,
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-300",
    label: "Salud",
  },
  feeding: {
    icon: Utensils,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    borderColor: "border-orange-300",
    label: "Alimentación",
  },
  breeding: {
    icon: Activity,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    borderColor: "border-pink-300",
    label: "Reproducción",
  },
  general: {
    icon: FileText,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
    borderColor: "border-gray-300",
    label: "General",
  },
};

const EventTimeline: React.FC = () => {
  // Estados
  const [events] = useState<TimelineEvent[]>(mockEvents);
  const [filteredEvents, setFilteredEvents] =
    useState<TimelineEvent[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const eventVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5 },
    },
  };

  // Efecto para filtrar eventos
  useEffect(() => {
    let filtered = events;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.bovineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (event.bovineName &&
            event.bovineName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por tipo de evento
    if (selectedEventType !== "all") {
      filtered = filtered.filter((event) => event.type === selectedEventType);
    }

    // Filtrar por fecha
    if (selectedDate) {
      filtered = filtered.filter((event) => event.date === selectedDate);
    }

    // Ordenar por fecha (más reciente primero)
    filtered.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedEventType, selectedDate]);

  // Función para toggle expand event
  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedEventType("all");
    setSelectedDate("");
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Función para formatear hora
  const formatTime = (timeString: string) => {
    return timeString;
  };

  // Componente de evento individual
  const EventCard: React.FC<{ event: TimelineEvent; index: number }> = ({
    event,
    index,
  }) => {
    const config = eventConfig[event.type];
    const IconComponent = config.icon;
    const isExpanded = expandedEvents.has(event.id);

    return (
      <motion.div
        variants={eventVariants}
        className="relative flex items-start space-x-4 pb-8"
      >
        {/* Línea de tiempo */}
        <div className="flex flex-col items-center">
          <div
            className={`flex items-center justify-center w-10 h-10 rounded-full ${config.bgColor} ${config.borderColor} border-2`}
          >
            <IconComponent className={`h-5 w-5 ${config.color}`} />
          </div>
          {index < filteredEvents.length - 1 && (
            <div className="w-0.5 h-16 bg-gray-300 mt-2"></div>
          )}
        </div>

        {/* Contenido del evento */}
        <div className="flex-1 min-w-0">
          <Card
            className={`transition-all duration-200 hover:shadow-lg ${
              isExpanded ? "ring-2 ring-blue-200" : ""
            }`}
            clickable
            onClick={() => toggleEventExpansion(event.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
                    >
                      {config.label}
                    </span>
                    <span
                      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        event.priority === "critical"
                          ? "bg-red-100 text-red-800"
                          : event.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : event.priority === "medium"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {event.priority === "critical"
                        ? "Crítico"
                        : event.priority === "high"
                        ? "Alto"
                        : event.priority === "medium"
                        ? "Medio"
                        : "Bajo"}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {event.cost && (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600">
                        ${event.cost.toLocaleString()}
                      </p>
                    </div>
                  )}
                  <Button variant="ghost" size="icon">
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Información básica */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(event.date)} • {formatTime(event.time)}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{event.createdBy}</span>
                </div>
                {event.bovineId !== "HATO-GENERAL" &&
                  event.bovineId !== "GRUPO-ENGORDA" && (
                    <div className="flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>
                        {event.bovineId}{" "}
                        {event.bovineName && `(${event.bovineName})`}
                      </span>
                    </div>
                  )}
              </div>
            </CardHeader>

            {/* Detalles expandidos */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(event.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between py-1">
                          <span className="font-medium text-gray-700 capitalize">
                            {key
                              .replace(/([A-Z])/g, " $1")
                              .replace(/^./, (str) => str.toUpperCase())}
                            :
                          </span>
                          <span className="text-gray-600">{value}</span>
                        </div>
                      ))}
                    </div>

                    {event.notes && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Notas:</span>{" "}
                          {event.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          event.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : event.status === "in_progress"
                            ? "bg-blue-100 text-blue-800"
                            : event.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {event.status === "completed"
                          ? "Completado"
                          : event.status === "in_progress"
                          ? "En Progreso"
                          : event.status === "pending"
                          ? "Pendiente"
                          : "Cancelado"}
                      </div>

                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="h-4 w-4 mr-2" />
                        Acciones
                      </Button>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <motion.div
        className="max-w-4xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          variants={eventVariants}
        >
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Línea de Tiempo de Eventos
              </h1>
              <p className="text-gray-600">
                Historial cronológico de actividades del ganado
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            leftIcon={<Filter className="h-4 w-4" />}
          >
            Filtros
          </Button>
        </motion.div>

        {/* Filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Filtros de Búsqueda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Input
                      placeholder="Buscar eventos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      leftIcon={<Search className="h-4 w-4" />}
                      clearable
                      onClear={() => setSearchTerm("")}
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Evento
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={selectedEventType}
                        onChange={(e) => setSelectedEventType(e.target.value)}
                      >
                        <option value="all">Todos los tipos</option>
                        {Object.entries(eventConfig).map(([key, config]) => (
                          <option key={key} value={key}>
                            {config.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Input
                      label="Fecha Específica"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                    />

                    <div className="flex items-end">
                      <Button
                        onClick={clearFilters}
                        variant="outline"
                        fullWidth
                      >
                        Limpiar Filtros
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estadísticas */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
          variants={eventVariants}
        >
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Eventos</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {filteredEvents.length}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Este Mes</p>
                  <p className="text-2xl font-bold text-green-600">
                    {
                      filteredEvents.filter((e) => e.date.startsWith("2025-07"))
                        .length
                    }
                  </p>
                </div>
                <Clock className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Costo Total</p>
                  <p className="text-2xl font-bold text-purple-600">
                    $
                    {filteredEvents
                      .reduce((sum, e) => sum + (e.cost || 0), 0)
                      .toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {
                      filteredEvents.filter((e) => e.status === "pending")
                        .length
                    }
                  </p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Timeline de eventos */}
        <motion.div className="relative" variants={eventVariants}>
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron eventos
                </h3>
                <p className="text-gray-600">
                  Ajusta tus filtros de búsqueda para ver más eventos
                </p>
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="mt-4"
                >
                  Limpiar Filtros
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-0">
              {filteredEvents.map((event, index) => (
                <EventCard key={event.id} event={event} index={index} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Botón de carga de más eventos */}
        {filteredEvents.length > 0 && (
          <motion.div className="text-center mt-8" variants={eventVariants}>
            <Button variant="outline">Cargar Más Eventos</Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EventTimeline;
