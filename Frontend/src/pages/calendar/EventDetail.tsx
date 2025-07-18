import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  User,
  DollarSign,
  Syringe,
  Heart,
  Stethoscope,
  AlertTriangle,
  Baby,
  Package,
  Beef,
  Users,
  FileText,
  Edit3,
  Copy,
  CheckCircle,
  Bell,
  Tag,
  Download,
  Printer,
  Share,
  Eye,
  AlertCircle,
  Info,
  History,
  Phone,
  Mail,
  MapIcon,
  Star,
  MessageSquare,
  Paperclip,
  Image,
  File,
  ExternalLink,
  Calendar as CalendarIcon,
  Navigation,
  Activity,
  TrendingUp,
  Shield,
  Loader,
} from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";

// Interfaces para TypeScript
interface EventDetailData {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  date: string;
  time: string;
  duration: number;
  endTime: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    farm?: string;
    section?: string;
  };
  bovines: BovineDetail[];
  priority: "low" | "medium" | "high" | "urgent";
  reminderType: "none" | "day" | "week" | "month";
  tags: string[];
  notes: string;
  attachments: AttachmentFile[];
  veterinarian?: VeterinarianInfo;
  cost?: number;
  actualCost?: number;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  status: "pending" | "completed" | "cancelled" | "in_progress";
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  createdBy: string;
  lastModifiedBy: string;
  weather?: WeatherInfo;
  results?: EventResults;
}

interface EventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  category: "health" | "reproduction" | "nutrition" | "general";
  description?: string;
}

interface BovineDetail {
  id: string;
  name: string;
  tag: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  weight?: number;
  healthStatus: "healthy" | "sick" | "recovering" | "critical";
  lastCheckup?: string;
  notes?: string;
}

interface VeterinarianInfo {
  id: string;
  name: string;
  license: string;
  phone: string;
  email: string;
  specialization: string;
  clinic?: string;
  rating?: number;
}

interface AttachmentFile {
  id: string;
  name: string;
  type: "image" | "document" | "video" | "other";
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
}

interface WeatherInfo {
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  description: string;
}

interface EventResults {
  success: boolean;
  notes: string;
  complications?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  medicationsAdministered?: string[];
  dosages?: Record<string, string>;
}

interface RecurringPattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  endDate?: string;
  occurrences?: number;
}

interface EventHistory {
  id: string;
  action: "created" | "updated" | "completed" | "cancelled" | "rescheduled";
  timestamp: string;
  user: string;
  changes?: Record<string, { old: any; new: any }>;
  notes?: string;
}

// Tipos de eventos disponibles
const eventTypes: Record<string, EventType> = {
  vaccination: {
    id: "vaccination",
    name: "Vacunación",
    icon: Syringe,
    color: "bg-green-500",
    category: "health",
    description: "Aplicación de vacunas preventivas",
  },
  illness: {
    id: "illness",
    name: "Enfermedad",
    icon: Heart,
    color: "bg-red-500",
    category: "health",
    description: "Tratamiento de enfermedades",
  },
  checkup: {
    id: "checkup",
    name: "Revisión Médica",
    icon: Stethoscope,
    color: "bg-blue-500",
    category: "health",
    description: "Chequeo médico rutinario",
  },
  birth: {
    id: "birth",
    name: "Parto",
    icon: Baby,
    color: "bg-pink-500",
    category: "reproduction",
    description: "Asistencia en parto",
  },
  breeding: {
    id: "breeding",
    name: "Monta/Inseminación",
    icon: Users,
    color: "bg-purple-500",
    category: "reproduction",
    description: "Proceso reproductivo",
  },
  feeding: {
    id: "feeding",
    name: "Alimentación Especial",
    icon: Package,
    color: "bg-orange-500",
    category: "nutrition",
    description: "Suplementación nutricional",
  },
  emergency: {
    id: "emergency",
    name: "Emergencia",
    icon: AlertTriangle,
    color: "bg-yellow-500",
    category: "health",
    description: "Atención de emergencia",
  },
  general: {
    id: "general",
    name: "Evento General",
    icon: FileText,
    color: "bg-gray-500",
    category: "general",
    description: "Evento de propósito general",
  },
};

// Mock data para evento detallado
const mockEventDetail: EventDetailData = {
  id: "evt_001",
  title: "Vacunación Antirrábica - Lote A",
  description:
    "Aplicación de vacuna antirrábica a bovinos del lote A según programa sanitario establecido. Esta vacunación forma parte del protocolo anual de prevención de enfermedades zoonóticas.",
  eventType: eventTypes.vaccination,
  date: "2025-07-15",
  time: "09:00",
  duration: 120,
  endTime: "11:00",
  location: {
    lat: 20.5888,
    lng: -100.3899,
    address: "Rancho El Paraíso, Querétaro, México",
    farm: "Rancho El Paraíso",
    section: "Corral A - Zona Norte",
  },
  bovines: [
    {
      id: "1",
      name: "Luna",
      tag: "B001",
      breed: "Holstein",
      age: 3,
      gender: "female",
      weight: 450,
      healthStatus: "healthy",
      lastCheckup: "2025-06-15",
      notes: "Excelente condición corporal",
    },
    {
      id: "3",
      name: "Bella",
      tag: "B003",
      breed: "Jersey",
      age: 2,
      gender: "female",
      weight: 380,
      healthStatus: "healthy",
      lastCheckup: "2025-06-15",
    },
    {
      id: "5",
      name: "Rosa",
      tag: "B005",
      breed: "Charolais",
      age: 3,
      gender: "female",
      weight: 520,
      healthStatus: "healthy",
      lastCheckup: "2025-06-10",
      notes: "Preñez confirmada - 5 meses",
    },
  ],
  priority: "high",
  reminderType: "day",
  tags: ["vacunacion", "lote-a", "sanitario", "antirrábica", "obligatorio"],
  notes:
    "Verificar ayuno de 12 horas antes de la aplicación. Mantener en observación 2 horas post-vacunación. Registrar cualquier reacción adversa inmediatamente.",
  attachments: [
    {
      id: "att_001",
      name: "Certificado_Vacuna_Antirrábica.pdf",
      type: "document",
      size: 2456789,
      url: "#",
      uploadedAt: "2025-07-01T10:30:00Z",
      uploadedBy: "Dr. María González",
    },
    {
      id: "att_002",
      name: "Protocolo_Vacunacion.pdf",
      type: "document",
      size: 1234567,
      url: "#",
      uploadedAt: "2025-07-01T10:35:00Z",
      uploadedBy: "Administrador",
    },
    {
      id: "att_003",
      name: "Foto_Lote_A_Pre_Vacunacion.jpg",
      type: "image",
      size: 3456789,
      url: "#",
      uploadedAt: "2025-07-14T16:20:00Z",
      uploadedBy: "Técnico de Campo",
    },
  ],
  veterinarian: {
    id: "vet_001",
    name: "Dra. María González Rodríguez",
    license: "MVZ-12345-QRO",
    phone: "+52 442 123 4567",
    email: "maria.gonzalez@veterinaria.com",
    specialization: "Medicina Bovina y Zoonosis",
    clinic: "Clínica Veterinaria San Francisco",
    rating: 4.8,
  },
  cost: 450.0,
  actualCost: 465.0,
  isRecurring: false,
  status: "completed",
  createdAt: "2025-07-01T10:30:00Z",
  updatedAt: "2025-07-15T11:30:00Z",
  completedAt: "2025-07-15T11:30:00Z",
  createdBy: "Dr. Carlos Ruiz",
  lastModifiedBy: "Dra. María González",
  weather: {
    temperature: 24,
    humidity: 65,
    condition: "Parcialmente nublado",
    windSpeed: 12,
    description: "Condiciones ideales para trabajo de campo",
  },
  results: {
    success: true,
    notes:
      "Vacunación completada exitosamente en todos los bovinos. No se presentaron reacciones adversas inmediatas.",
    followUpRequired: true,
    followUpDate: "2025-07-22",
    medicationsAdministered: ["Vacuna Antirrábica Boehringer", "Vitamina B12"],
    dosages: {
      "Vacuna Antirrábica": "2ml IM",
      "Vitamina B12": "5ml IM",
    },
  },
};

// Mock historial del evento
const mockEventHistory: EventHistory[] = [
  {
    id: "hist_001",
    action: "created",
    timestamp: "2025-07-01T10:30:00Z",
    user: "Dr. Carlos Ruiz",
    notes: "Evento creado según programa sanitario anual",
  },
  {
    id: "hist_002",
    action: "updated",
    timestamp: "2025-07-05T14:20:00Z",
    user: "Administrador",
    changes: {
      veterinarian: { old: "Dr. Pedro Martínez", new: "Dra. María González" },
      cost: { old: 350.0, new: 450.0 },
    },
    notes: "Cambio de veterinario por disponibilidad",
  },
  {
    id: "hist_003",
    action: "completed",
    timestamp: "2025-07-15T11:30:00Z",
    user: "Dra. María González",
    notes: "Vacunación completada exitosamente",
  },
];

// Componente para simular mapa de ubicación
const LocationMap: React.FC<{
  location: { lat: number; lng: number; address: string };
  className?: string;
}> = ({ location, className = "" }) => {
  return (
    <div
      className={`bg-green-100 rounded-lg relative overflow-hidden ${className}`}
    >
      <div
        className="w-full h-full"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-green-700">
            <MapPin className="w-8 h-8 mx-auto mb-2" />
            <p className="text-sm font-medium">Ubicación del Evento</p>
            <p className="text-xs text-green-600">{location.address}</p>
          </div>
        </div>

        {/* Marcador central */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg">
            <div className="absolute -top-8 -left-12 w-24 text-center">
              <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                Ubicación
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal EventDetail
const EventDetail: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // Estados
  const [eventData] = useState<EventDetailData>(mockEventDetail);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "bovines" | "results" | "attachments"
  >("overview");

  // Efectos
  useEffect(() => {
    // Simular carga de datos del evento
    const loadEventData = async () => {
      setIsLoading(true);
      try {
        // Aquí iría la llamada a la API para cargar el evento
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Los datos ya están mockeados en el estado inicial
      } catch (error) {
        console.error("Error al cargar el evento:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  // Funciones auxiliares
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return "Desconocido";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "low":
        return "Baja";
      case "medium":
        return "Media";
      case "high":
        return "Alta";
      case "urgent":
        return "Urgente";
      default:
        return "Sin definir";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "image":
        return Image;
      case "document":
        return File;
      case "video":
        return File;
      default:
        return Paperclip;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Cargando detalles del evento...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/calendar")}
              className="p-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </motion.button>

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div
                  className={`w-12 h-12 ${eventData.eventType.color} rounded-xl flex items-center justify-center text-white`}
                >
                  <eventData.eventType.icon className="w-6 h-6" />
                </div>
                {eventData.title}
              </h1>
              <p className="text-gray-600">{eventData.eventType.description}</p>
            </div>

            {/* Estado y Prioridad */}
            <div className="flex gap-3">
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(
                  eventData.status
                )}`}
              >
                {getStatusText(eventData.status)}
              </div>
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium ${getPriorityColor(
                  eventData.priority
                )}`}
              >
                Prioridad {getPriorityText(eventData.priority)}
              </div>
            </div>
          </div>

          {/* Acciones Rápidas */}
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/calendar/edit/${eventData.id}`}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Editar
            </Link>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Duplicar
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors flex items-center gap-2"
            >
              <Share className="w-4 h-4" />
              Compartir
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowHistory(!showHistory)}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <History className="w-4 h-4" />
              Historial
            </motion.button>
          </div>
        </motion.div>

        {/* Pestañas de Navegación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: "overview", label: "Resumen", icon: Eye },
                { id: "bovines", label: "Bovinos", icon: Beef },
                { id: "results", label: "Resultados", icon: Activity },
                { id: "attachments", label: "Archivos", icon: Paperclip },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === "bovines" && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {eventData.bovines.length}
                    </span>
                  )}
                  {tab.id === "attachments" && (
                    <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {eventData.attachments.length}
                    </span>
                  )}
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Historial del Evento */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 overflow-hidden"
            >
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-500" />
                  Historial del Evento
                </h3>

                <div className="space-y-4">
                  {mockEventHistory.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {item.action === "created"
                              ? "Creado"
                              : item.action === "updated"
                              ? "Actualizado"
                              : item.action === "completed"
                              ? "Completado"
                              : "Cancelado"}
                          </span>
                          <span className="text-sm text-gray-500">
                            por {item.user}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                        {item.notes && (
                          <p className="text-sm text-gray-700">{item.notes}</p>
                        )}
                        {item.changes && (
                          <div className="mt-2 text-xs text-gray-600">
                            <strong>Cambios:</strong>
                            {Object.entries(item.changes).map(
                              ([field, change]) => (
                                <div key={field} className="ml-2">
                                  {field}: {JSON.stringify(change.old)} →{" "}
                                  {JSON.stringify(change.new)}
                                </div>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Contenido Principal por Pestañas */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Información Principal */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Columna Izquierda */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Detalles del Evento */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      Detalles del Evento
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">
                          Descripción
                        </h4>
                        <div className="text-gray-600">
                          {showFullDescription ? (
                            <p>{eventData.description}</p>
                          ) : (
                            <p>{eventData.description.substring(0, 200)}...</p>
                          )}
                          <button
                            onClick={() =>
                              setShowFullDescription(!showFullDescription)
                            }
                            className="text-blue-500 hover:text-blue-600 text-sm ml-2"
                          >
                            {showFullDescription ? "Ver menos" : "Ver más"}
                          </button>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Fecha</p>
                            <p className="font-medium">
                              {new Date(eventData.date).toLocaleDateString(
                                "es-ES",
                                {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Horario</p>
                            <p className="font-medium">
                              {eventData.time} - {eventData.endTime}
                            </p>
                            <p className="text-xs text-gray-500">
                              {eventData.duration} minutos
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <DollarSign className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Costo</p>
                            <p className="font-medium">
                              $
                              {eventData.actualCost?.toFixed(2) ||
                                eventData.cost?.toFixed(2)}
                              {eventData.actualCost &&
                                eventData.actualCost !== eventData.cost && (
                                  <span className="text-xs text-gray-500 ml-2">
                                    (Est. ${eventData.cost?.toFixed(2)})
                                  </span>
                                )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">
                              Recordatorio
                            </p>
                            <p className="font-medium">
                              {eventData.reminderType === "none"
                                ? "Sin recordatorio"
                                : eventData.reminderType === "day"
                                ? "1 día antes"
                                : eventData.reminderType === "week"
                                ? "1 semana antes"
                                : "1 mes antes"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-500" />
                      Ubicación
                    </h3>

                    <div className="space-y-4">
                      <LocationMap
                        location={eventData.location}
                        className="h-64"
                      />

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Dirección</p>
                          <p className="font-medium">
                            {eventData.location.address}
                          </p>
                        </div>

                        {eventData.location.farm && (
                          <div>
                            <p className="text-sm text-gray-500">Rancho</p>
                            <p className="font-medium">
                              {eventData.location.farm}
                            </p>
                          </div>
                        )}

                        {eventData.location.section && (
                          <div>
                            <p className="text-sm text-gray-500">Sección</p>
                            <p className="font-medium">
                              {eventData.location.section}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-sm text-gray-500">Coordenadas</p>
                          <p className="font-medium font-mono text-sm">
                            {eventData.location.lat.toFixed(6)},{" "}
                            {eventData.location.lng.toFixed(6)}
                          </p>
                        </div>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        Abrir en Google Maps
                      </motion.button>
                    </div>
                  </div>

                  {/* Notas Adicionales */}
                  {eventData.notes && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        Notas Adicionales
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-gray-700">{eventData.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna Derecha */}
                <div className="space-y-6">
                  {/* Información del Veterinario */}
                  {eventData.veterinarian && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Veterinario
                      </h3>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {eventData.veterinarian.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {eventData.veterinarian.specialization}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span>
                              Cédula: {eventData.veterinarian.license}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-gray-400" />
                            <a
                              href={`tel:${eventData.veterinarian.phone}`}
                              className="text-blue-600 hover:underline"
                            >
                              {eventData.veterinarian.phone}
                            </a>
                          </div>

                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <a
                              href={`mailto:${eventData.veterinarian.email}`}
                              className="text-blue-600 hover:underline"
                            >
                              {eventData.veterinarian.email}
                            </a>
                          </div>

                          {eventData.veterinarian.clinic && (
                            <div className="flex items-center gap-2">
                              <MapIcon className="w-4 h-4 text-gray-400" />
                              <span>{eventData.veterinarian.clinic}</span>
                            </div>
                          )}

                          {eventData.veterinarian.rating && (
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-400 fill-current" />
                              <span>{eventData.veterinarian.rating}/5.0</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información del Clima */}
                  {eventData.weather && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        Condiciones Climáticas
                      </h3>

                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Temperatura</span>
                          <span className="font-medium">
                            {eventData.weather.temperature}°C
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Humedad</span>
                          <span className="font-medium">
                            {eventData.weather.humidity}%
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Viento</span>
                          <span className="font-medium">
                            {eventData.weather.windSpeed} km/h
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Condición</span>
                          <span className="font-medium">
                            {eventData.weather.condition}
                          </span>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-3 mt-4">
                          <p className="text-sm text-blue-800">
                            {eventData.weather.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Etiquetas */}
                  {eventData.tags.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-blue-500" />
                        Etiquetas
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {eventData.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadatos */}
                  <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-blue-500" />
                      Información del Sistema
                    </h3>

                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-gray-500">ID del Evento:</span>
                        <span className="ml-2 font-mono">{eventData.id}</span>
                      </div>

                      <div>
                        <span className="text-gray-500">Creado por:</span>
                        <span className="ml-2">{eventData.createdBy}</span>
                      </div>

                      <div>
                        <span className="text-gray-500">
                          Fecha de creación:
                        </span>
                        <span className="ml-2">
                          {new Date(eventData.createdAt).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-500">
                          Última modificación:
                        </span>
                        <span className="ml-2">
                          {new Date(eventData.updatedAt).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <span className="text-gray-500">Modificado por:</span>
                        <span className="ml-2">{eventData.lastModifiedBy}</span>
                      </div>

                      {eventData.completedAt && (
                        <div>
                          <span className="text-gray-500">Completado el:</span>
                          <span className="ml-2">
                            {new Date(eventData.completedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "bovines" && (
            <motion.div
              key="bovines"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Beef className="w-5 h-5 text-blue-500" />
                  Bovinos Participantes ({eventData.bovines.length})
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {eventData.bovines.map((bovine) => (
                    <motion.div
                      key={bovine.id}
                      whileHover={{ scale: 1.02 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Beef className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {bovine.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Etiqueta: {bovine.tag}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Raza:</span>
                          <span>{bovine.breed}</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Edad:</span>
                          <span>{bovine.age} años</span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600">Género:</span>
                          <span>
                            {bovine.gender === "male" ? "Macho" : "Hembra"}
                          </span>
                        </div>

                        {bovine.weight && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Peso:</span>
                            <span>{bovine.weight} kg</span>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <span className="text-gray-600">Estado:</span>
                          <span
                            className={`capitalize ${
                              bovine.healthStatus === "healthy"
                                ? "text-green-600"
                                : bovine.healthStatus === "sick"
                                ? "text-red-600"
                                : bovine.healthStatus === "recovering"
                                ? "text-yellow-600"
                                : "text-red-700"
                            }`}
                          >
                            {bovine.healthStatus === "healthy"
                              ? "Saludable"
                              : bovine.healthStatus === "sick"
                              ? "Enfermo"
                              : bovine.healthStatus === "recovering"
                              ? "En recuperación"
                              : "Crítico"}
                          </span>
                        </div>

                        {bovine.lastCheckup && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">
                              Último chequeo:
                            </span>
                            <span>
                              {new Date(
                                bovine.lastCheckup
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {bovine.notes && (
                        <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                          {bovine.notes}
                        </div>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-3 px-3 py-2 text-blue-600 border border-blue-200 rounded hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Ver Detalles
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "results" && (
            <motion.div
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {eventData.results ? (
                <div className="bg-white rounded-2xl shadow-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-500" />
                    Resultados del Evento
                  </h3>

                  <div className="space-y-6">
                    {/* Estado General */}
                    <div
                      className={`p-4 rounded-lg ${
                        eventData.results.success
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {eventData.results.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <span
                          className={`font-medium ${
                            eventData.results.success
                              ? "text-green-800"
                              : "text-red-800"
                          }`}
                        >
                          {eventData.results.success
                            ? "Evento Exitoso"
                            : "Evento con Complicaciones"}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          eventData.results.success
                            ? "text-green-700"
                            : "text-red-700"
                        }`}
                      >
                        {eventData.results.notes}
                      </p>
                    </div>

                    {/* Medicamentos Administrados */}
                    {eventData.results.medicationsAdministered && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Medicamentos Administrados
                        </h4>
                        <div className="space-y-2">
                          {eventData.results.medicationsAdministered.map(
                            (medication) => (
                              <div
                                key={medication}
                                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                              >
                                <span className="font-medium">
                                  {medication}
                                </span>
                                {eventData.results?.dosages?.[medication] && (
                                  <span className="text-sm text-gray-600">
                                    {eventData.results.dosages[medication]}
                                  </span>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Complicaciones */}
                    {eventData.results.complications && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" />
                          Complicaciones
                        </h4>
                        <p className="text-yellow-700 text-sm">
                          {eventData.results.complications}
                        </p>
                      </div>
                    )}

                    {/* Seguimiento */}
                    {eventData.results.followUpRequired && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          Seguimiento Requerido
                        </h4>
                        {eventData.results.followUpDate && (
                          <p className="text-blue-700 text-sm">
                            Fecha programada:{" "}
                            {new Date(
                              eventData.results.followUpDate
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-xl p-6 text-center">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Sin Resultados Registrados
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Los resultados se registrarán una vez que el evento sea
                    completado.
                  </p>
                  {eventData.status === "pending" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Completar Evento
                    </motion.button>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === "attachments" && (
            <motion.div
              key="attachments"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Paperclip className="w-5 h-5 text-blue-500" />
                  Archivos Adjuntos ({eventData.attachments.length})
                </h3>

                {eventData.attachments.length > 0 ? (
                  <div className="space-y-4">
                    {eventData.attachments.map((file) => {
                      const FileIcon = getFileIcon(file.type);
                      return (
                        <motion.div
                          key={file.id}
                          whileHover={{ scale: 1.01 }}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                file.type === "image"
                                  ? "bg-green-100"
                                  : file.type === "document"
                                  ? "bg-blue-100"
                                  : "bg-gray-100"
                              }`}
                            >
                              <FileIcon
                                className={`w-5 h-5 ${
                                  file.type === "image"
                                    ? "text-green-600"
                                    : file.type === "document"
                                    ? "text-blue-600"
                                    : "text-gray-600"
                                }`}
                              />
                            </div>

                            <div>
                              <h4 className="font-medium text-gray-900">
                                {file.name}
                              </h4>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{formatFileSize(file.size)}</span>
                                <span>•</span>
                                <span>Subido por {file.uploadedBy}</span>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    file.uploadedAt
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                            >
                              <Download className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Paperclip className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      Sin Archivos Adjuntos
                    </h4>
                    <p className="text-gray-600">
                      No hay archivos asociados a este evento.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EventDetail;
