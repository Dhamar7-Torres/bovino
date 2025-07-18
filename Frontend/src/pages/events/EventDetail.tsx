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
  Users,
  FileText,
  Edit3,
  Trash2,
  Share2,
  Download,
  Printer,
  CheckCircle,
  AlertTriangle,
  Phone,
  Mail,
  Star,
  Activity,
  Shield,
  Target,
  TrendingUp,
  Info,
  History,
  Bell,
  Tag,
  Paperclip,
  Image,
  File,
  ExternalLink,
  Copy,
  MessageSquare,
  Thermometer,
  Weight,
  Plus,
  X,
  Map,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";

// Interfaces para TypeScript
interface EventDetailData {
  id: string;
  title: string;
  description: string;
  eventType: EventType;
  status: "scheduled" | "in_progress" | "completed" | "cancelled" | "postponed";
  priority: "low" | "medium" | "high" | "urgent";
  date: string;
  time: string;
  duration: number;
  endTime: string;
  location: LocationDetail;
  bovines: BovineDetail[];
  veterinarian?: VeterinarianDetail;
  cost?: number;
  actualCost?: number;
  tags: string[];
  notes: string;
  attachments: AttachmentFile[];
  reminderType: "none" | "day" | "week" | "month";
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  createdBy: string;
  lastModifiedBy: string;
  results?: EventResults;
  customFields: Record<string, any>;
  weather?: WeatherInfo;
  timeline: EventTimelineItem[];
}

interface EventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  category: "health" | "reproduction" | "nutrition" | "general" | "vaccination";
  description: string;
}

interface LocationDetail {
  latitude: number;
  longitude: number;
  address: string;
  farm?: string;
  section?: string;
  notes?: string;
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
  photo?: string;
}

interface VeterinarianDetail {
  id: string;
  name: string;
  license: string;
  phone: string;
  email: string;
  specialization: string;
  clinic?: string;
  rating: number;
  photo?: string;
  experience: number;
}

interface AttachmentFile {
  id: string;
  name: string;
  type: "image" | "document" | "video" | "other";
  size: number;
  url: string;
  uploadedAt: string;
  uploadedBy: string;
  thumbnail?: string;
}

interface EventResults {
  success: boolean;
  notes: string;
  complications?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  medicationsAdministered?: string[];
  dosages?: Record<string, string>;
  vitals?: {
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    weight?: number;
  };
}

interface WeatherInfo {
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  description: string;
  icon: string;
}

interface RecurringPattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  endDate?: string;
  occurrences?: number;
  nextOccurrence?: string;
}

interface EventTimelineItem {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  user: string;
  type:
    | "created"
    | "updated"
    | "completed"
    | "cancelled"
    | "note_added"
    | "attachment_added";
}

const EventDetail: React.FC = () => {
  // Estados principales
  const [eventData, setEventData] = useState<EventDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [, setShowShareModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "bovines" | "results" | "timeline" | "attachments"
  >("overview");
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Hooks de React Router
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  // Cargar datos del evento
  useEffect(() => {
    const loadEventDetail = async () => {
      if (!eventId) return;

      setLoading(true);
      try {
        // Simular carga de datos desde la API
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Datos simulados para desarrollo
        const mockEventData: EventDetailData = {
          id: eventId,
          title: "Vacunación Mensual - Sector Norte",
          description:
            "Aplicación de vacunas preventivas según el calendario sanitario establecido",
          eventType: {
            id: "vaccination",
            name: "Vacunación",
            icon: Syringe,
            color: "bg-blue-500",
            category: "vaccination",
            description: "Aplicación de vacunas preventivas",
          },
          status: "completed",
          priority: "high",
          date: "2024-12-15",
          time: "08:00",
          duration: 120,
          endTime: "10:00",
          location: {
            latitude: 17.9869,
            longitude: -92.9303,
            address: "Sector Norte, Rancho El Progreso, Villahermosa, Tabasco",
            farm: "Rancho El Progreso",
            section: "Sector Norte",
            notes: "Cerca del corral principal",
          },
          bovines: [
            {
              id: "bov_001",
              name: "Esperanza",
              tag: "ESP-001",
              breed: "Holstein",
              age: 3,
              gender: "female",
              weight: 450,
              healthStatus: "healthy",
              lastCheckup: "2024-11-15",
              notes: "Vaca productora, excelente salud general",
              photo: "/api/placeholder/150/150",
            },
            {
              id: "bov_002",
              name: "Paloma",
              tag: "PAL-002",
              breed: "Jersey",
              age: 2,
              gender: "female",
              weight: 380,
              healthStatus: "healthy",
              lastCheckup: "2024-11-10",
              notes: "Primera vacunación anual completada",
            },
            {
              id: "bov_003",
              name: "Tormenta",
              tag: "TOR-003",
              breed: "Angus",
              age: 4,
              gender: "male",
              weight: 650,
              healthStatus: "healthy",
              lastCheckup: "2024-11-20",
              notes: "Toro reproductor en excelentes condiciones",
            },
          ],
          veterinarian: {
            id: "vet_001",
            name: "Dr. María García",
            license: "VET-2024-001",
            phone: "+52 993 123 4567",
            email: "maria.garcia@vet.com",
            specialization: "Medicina Bovina Preventiva",
            clinic: "Clínica Veterinaria El Campo",
            rating: 4.9,
            photo: "/api/placeholder/100/100",
            experience: 12,
          },
          cost: 850.0,
          actualCost: 820.0,
          tags: ["rutina", "preventivo", "sector-norte", "alta-prioridad"],
          notes:
            "Aplicación exitosa de vacunas contra fiebre aftosa y brucelosis. Todos los animales respondieron bien al tratamiento. Sin efectos adversos observados.",
          attachments: [
            {
              id: "att_001",
              name: "certificado_vacunacion.pdf",
              type: "document",
              size: 245760,
              url: "/api/documents/cert_001.pdf",
              uploadedAt: "2024-12-15T10:30:00Z",
              uploadedBy: "Dr. María García",
              thumbnail: "/api/thumbnails/doc_001.jpg",
            },
            {
              id: "att_002",
              name: "proceso_vacunacion.jpg",
              type: "image",
              size: 1024000,
              url: "/api/images/proc_001.jpg",
              uploadedAt: "2024-12-15T09:15:00Z",
              uploadedBy: "Operador Campo",
              thumbnail: "/api/placeholder/200/150",
            },
          ],
          reminderType: "day",
          isRecurring: true,
          recurringPattern: {
            frequency: "monthly",
            interval: 1,
            endDate: "2025-12-31",
            nextOccurrence: "2025-01-15",
          },
          createdAt: "2024-12-01T10:00:00Z",
          updatedAt: "2024-12-15T10:30:00Z",
          completedAt: "2024-12-15T10:00:00Z",
          createdBy: "Administrador Ranch",
          lastModifiedBy: "Dr. María García",
          results: {
            success: true,
            notes:
              "Vacunación completada exitosamente. Todos los animales toleraron bien el procedimiento.",
            complications: undefined,
            followUpRequired: false,
            followUpDate: undefined,
            medicationsAdministered: [
              "Vacuna Fiebre Aftosa",
              "Vacuna Brucelosis",
            ],
            dosages: {
              "Vacuna Fiebre Aftosa": "2ml IM",
              "Vacuna Brucelosis": "2ml IM",
            },
            vitals: {
              temperature: 38.5,
              heartRate: 65,
              respiratoryRate: 18,
            },
          },
          customFields: {
            vaccine_type: "fmd_brucellosis",
            dose_number: 1,
            batch_number: "VB2024-456",
            manufacturer: "Laboratorios Zoetis",
            expiration_date: "2025-06-30",
            injection_site: "Cuello - lado izquierdo",
            adverse_reactions: "Ninguna observada",
          },
          weather: {
            temperature: 28,
            humidity: 75,
            condition: "Parcialmente nublado",
            windSpeed: 12,
            description: "Condiciones ideales para trabajo al aire libre",
            icon: "partly-cloudy",
          },
          timeline: [
            {
              id: "tl_001",
              timestamp: "2024-12-01T10:00:00Z",
              action: "Evento Creado",
              description: "Evento de vacunación programado",
              user: "Administrador Ranch",
              type: "created",
            },
            {
              id: "tl_002",
              timestamp: "2024-12-14T16:00:00Z",
              action: "Recordatorio Enviado",
              description: "Notificación enviada 24 horas antes",
              user: "Sistema",
              type: "updated",
            },
            {
              id: "tl_003",
              timestamp: "2024-12-15T08:00:00Z",
              action: "Evento Iniciado",
              description:
                "Dr. García llegó al rancho y comenzó la preparación",
              user: "Dr. María García",
              type: "updated",
            },
            {
              id: "tl_004",
              timestamp: "2024-12-15T10:00:00Z",
              action: "Evento Completado",
              description: "Vacunación finalizada exitosamente",
              user: "Dr. María García",
              type: "completed",
            },
            {
              id: "tl_005",
              timestamp: "2024-12-15T10:30:00Z",
              action: "Documentos Subidos",
              description: "Certificado de vacunación y fotos del proceso",
              user: "Dr. María García",
              type: "attachment_added",
            },
          ],
        };

        setEventData(mockEventData);
      } catch (error) {
        console.error("Error cargando detalles del evento:", error);
      } finally {
        setLoading(false);
      }
    };

    loadEventDetail();
  }, [eventId]);

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-blue-100 text-blue-800",
      in_progress: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
      postponed: "bg-purple-100 text-purple-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  // Función para obtener el color de la prioridad
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return (
      colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
    );
  };

  // Función para formatear fecha
  const formatDate = (dateString: string, timeString?: string) => {
    const date = new Date(dateString + (timeString ? `T${timeString}` : ""));
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      ...(timeString && { hour: "2-digit", minute: "2-digit" }),
    });
  };

  // Función para formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Función para manejar eliminación
  const handleDelete = async () => {
    if (!eventData) return;

    try {
      // Simular eliminación
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("Evento eliminado exitosamente");
      navigate("/events");
    } catch (error) {
      console.error("Error eliminando evento:", error);
      alert("Error al eliminar el evento");
    }
  };

  // Función para agregar nota
  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setAddingNote(true);
    try {
      // Simular adición de nota
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Agregar nota al timeline
      const newTimelineItem: EventTimelineItem = {
        id: `tl_${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: "Nota Agregada",
        description: newNote,
        user: "Usuario Actual",
        type: "note_added",
      };

      setEventData((prev) =>
        prev
          ? {
              ...prev,
              timeline: [...prev.timeline, newTimelineItem],
            }
          : null
      );

      setNewNote("");
    } catch (error) {
      console.error("Error agregando nota:", error);
    } finally {
      setAddingNote(false);
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
          <p className="text-gray-600 text-lg">
            Cargando detalles del evento...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Evento no encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            El evento que buscas no existe o ha sido eliminado.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/events")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Volver a Eventos
          </motion.button>
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
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/events")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </motion.button>

              <div
                className={`p-3 rounded-xl ${eventData.eventType.color} text-white`}
              >
                <eventData.eventType.icon className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {eventData.title}
                </h1>
                <div className="flex items-center space-x-4 mt-1">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                      eventData.status
                    )}`}
                  >
                    {eventData.status === "scheduled"
                      ? "Programado"
                      : eventData.status === "in_progress"
                      ? "En Progreso"
                      : eventData.status === "completed"
                      ? "Completado"
                      : eventData.status === "cancelled"
                      ? "Cancelado"
                      : "Pospuesto"}
                  </span>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                      eventData.priority
                    )}`}
                  >
                    {eventData.priority === "low"
                      ? "Baja"
                      : eventData.priority === "medium"
                      ? "Media"
                      : eventData.priority === "high"
                      ? "Alta"
                      : "Urgente"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowShareModal(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Share2 className="h-4 w-4" />
                <span>Compartir</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/events/edit/${eventData.id}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Editar</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Eliminar</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Información Básica */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Fecha y Hora</p>
                      <p className="font-medium text-gray-900">
                        {formatDate(eventData.date, eventData.time)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Duración</p>
                      <p className="font-medium text-gray-900">
                        {eventData.duration} minutos
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Ubicación</p>
                      <p className="font-medium text-gray-900">
                        {eventData.location.farm}
                      </p>
                      <p className="text-sm text-gray-600">
                        {eventData.location.section}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {eventData.veterinarian && (
                    <div className="flex items-center space-x-3">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Veterinario</p>
                        <p className="font-medium text-gray-900">
                          {eventData.veterinarian.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {eventData.veterinarian.specialization}
                        </p>
                      </div>
                    </div>
                  )}

                  {eventData.cost && (
                    <div className="flex items-center space-x-3">
                      <DollarSign className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-600">Costo</p>
                        <p className="font-medium text-gray-900">
                          ${eventData.actualCost || eventData.cost}
                          {eventData.actualCost &&
                            eventData.actualCost !== eventData.cost && (
                              <span className="text-sm text-gray-500 ml-2">
                                (Est: ${eventData.cost})
                              </span>
                            )}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Bovinos</p>
                      <p className="font-medium text-gray-900">
                        {eventData.bovines.length} animales
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {eventData.description && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Descripción
                  </h3>
                  <p className="text-gray-700">{eventData.description}</p>
                </div>
              )}
            </motion.div>

            {/* Tabs de Navegación */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200"
            >
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: "overview", label: "Resumen", icon: Info },
                    { id: "bovines", label: "Bovinos", icon: Users },
                    { id: "results", label: "Resultados", icon: CheckCircle },
                    { id: "timeline", label: "Historial", icon: History },
                    { id: "attachments", label: "Adjuntos", icon: Paperclip },
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </motion.button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Tab: Resumen */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    {/* Clima */}
                    {eventData.weather && (
                      <div className="bg-blue-50 rounded-xl p-4">
                        <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Activity className="h-5 w-5 mr-2" />
                          Condiciones Climáticas
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Temperatura</p>
                            <p className="font-medium">
                              {eventData.weather.temperature}°C
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Humedad</p>
                            <p className="font-medium">
                              {eventData.weather.humidity}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Viento</p>
                            <p className="font-medium">
                              {eventData.weather.windSpeed} km/h
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Condición</p>
                            <p className="font-medium">
                              {eventData.weather.condition}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Campos Personalizados */}
                    {Object.keys(eventData.customFields).length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-4">
                          Detalles Específicos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(eventData.customFields).map(
                            ([key, value]) => (
                              <div
                                key={key}
                                className="bg-gray-50 rounded-lg p-3"
                              >
                                <p className="text-sm text-gray-600 capitalize">
                                  {key.replace(/_/g, " ")}
                                </p>
                                <p className="font-medium text-gray-900">
                                  {String(value)}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Etiquetas */}
                    {eventData.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Etiquetas
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {eventData.tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notas */}
                    {eventData.notes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">
                          Notas
                        </h4>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-gray-700">{eventData.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Bovinos */}
                {activeTab === "bovines" && (
                  <div className="space-y-4">
                    {eventData.bovines.map((bovine) => (
                      <motion.div
                        key={bovine.id}
                        whileHover={{ scale: 1.02 }}
                        className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => navigate(`/bovines/${bovine.id}`)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            {bovine.photo ? (
                              <img
                                src={bovine.photo}
                                alt={bovine.name}
                                className="w-16 h-16 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {bovine.name} ({bovine.tag})
                              </h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                <p>
                                  {bovine.breed} • {bovine.age} años •{" "}
                                  {bovine.gender === "male"
                                    ? "Macho"
                                    : "Hembra"}
                                </p>
                                {bovine.weight && (
                                  <p>Peso: {bovine.weight} kg</p>
                                )}
                                {bovine.lastCheckup && (
                                  <p>
                                    Último chequeo:{" "}
                                    {new Date(
                                      bovine.lastCheckup
                                    ).toLocaleDateString("es-ES")}
                                  </p>
                                )}
                              </div>
                              {bovine.notes && (
                                <p className="text-sm text-gray-500 mt-2">
                                  {bovine.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                              bovine.healthStatus === "healthy"
                                ? "bg-green-100 text-green-800"
                                : bovine.healthStatus === "sick"
                                ? "bg-red-100 text-red-800"
                                : bovine.healthStatus === "recovering"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {bovine.healthStatus === "healthy"
                              ? "Saludable"
                              : bovine.healthStatus === "sick"
                              ? "Enfermo"
                              : bovine.healthStatus === "recovering"
                              ? "Recuperándose"
                              : "Crítico"}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Tab: Resultados */}
                {activeTab === "results" && (
                  <div className="space-y-6">
                    {eventData.results ? (
                      <div>
                        <div
                          className={`p-4 rounded-xl mb-6 ${
                            eventData.results.success
                              ? "bg-green-50 border border-green-200"
                              : "bg-red-50 border border-red-200"
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            {eventData.results.success ? (
                              <CheckCircle className="h-6 w-6 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-6 w-6 text-red-600" />
                            )}
                            <div>
                              <h4
                                className={`font-medium ${
                                  eventData.results.success
                                    ? "text-green-900"
                                    : "text-red-900"
                                }`}
                              >
                                {eventData.results.success
                                  ? "Evento Completado Exitosamente"
                                  : "Evento con Complicaciones"}
                              </h4>
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
                          </div>
                        </div>

                        {/* Vitales */}
                        {eventData.results.vitals && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-4">
                              Signos Vitales Promedio
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {eventData.results.vitals.temperature && (
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                  <Thermometer className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">
                                    Temperatura
                                  </p>
                                  <p className="font-bold text-blue-900">
                                    {eventData.results.vitals.temperature}°C
                                  </p>
                                </div>
                              )}
                              {eventData.results.vitals.heartRate && (
                                <div className="bg-red-50 rounded-lg p-3 text-center">
                                  <Activity className="h-6 w-6 text-red-600 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">
                                    Frecuencia Cardíaca
                                  </p>
                                  <p className="font-bold text-red-900">
                                    {eventData.results.vitals.heartRate} bpm
                                  </p>
                                </div>
                              )}
                              {eventData.results.vitals.respiratoryRate && (
                                <div className="bg-green-50 rounded-lg p-3 text-center">
                                  <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">
                                    Frecuencia Respiratoria
                                  </p>
                                  <p className="font-bold text-green-900">
                                    {eventData.results.vitals.respiratoryRate}{" "}
                                    rpm
                                  </p>
                                </div>
                              )}
                              {eventData.results.vitals.weight && (
                                <div className="bg-purple-50 rounded-lg p-3 text-center">
                                  <Weight className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                                  <p className="text-sm text-gray-600">
                                    Peso Promedio
                                  </p>
                                  <p className="font-bold text-purple-900">
                                    {eventData.results.vitals.weight} kg
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Medicamentos */}
                        {eventData.results.medicationsAdministered && (
                          <div>
                            <h4 className="font-medium text-gray-900 mb-4">
                              Medicamentos Administrados
                            </h4>
                            <div className="space-y-3">
                              {eventData.results.medicationsAdministered.map(
                                (medication, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                  >
                                    <div className="flex items-center space-x-3">
                                      <Syringe className="h-5 w-5 text-gray-500" />
                                      <span className="font-medium text-gray-900">
                                        {medication}
                                      </span>
                                    </div>
                                    {eventData.results?.dosages?.[
                                      medication
                                    ] && (
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

                        {/* Seguimiento */}
                        {eventData.results.followUpRequired && (
                          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                            <div className="flex items-center space-x-3">
                              <Bell className="h-5 w-5 text-yellow-600" />
                              <div>
                                <h4 className="font-medium text-yellow-900">
                                  Seguimiento Requerido
                                </h4>
                                {eventData.results.followUpDate && (
                                  <p className="text-sm text-yellow-700">
                                    Fecha programada:{" "}
                                    {new Date(
                                      eventData.results.followUpDate
                                    ).toLocaleDateString("es-ES")}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          Sin Resultados
                        </h4>
                        <p className="text-gray-600">
                          Los resultados se mostrarán una vez que el evento sea
                          completado.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab: Historial */}
                {activeTab === "timeline" && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      {eventData.timeline.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start space-x-4"
                        >
                          <div
                            className={`p-2 rounded-full ${
                              item.type === "created"
                                ? "bg-blue-100"
                                : item.type === "updated"
                                ? "bg-yellow-100"
                                : item.type === "completed"
                                ? "bg-green-100"
                                : item.type === "cancelled"
                                ? "bg-red-100"
                                : item.type === "note_added"
                                ? "bg-purple-100"
                                : "bg-gray-100"
                            }`}
                          >
                            {item.type === "created" && (
                              <Plus className="h-4 w-4 text-blue-600" />
                            )}
                            {item.type === "updated" && (
                              <Edit3 className="h-4 w-4 text-yellow-600" />
                            )}
                            {item.type === "completed" && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                            {item.type === "cancelled" && (
                              <X className="h-4 w-4 text-red-600" />
                            )}
                            {item.type === "note_added" && (
                              <MessageSquare className="h-4 w-4 text-purple-600" />
                            )}
                            {item.type === "attachment_added" && (
                              <Paperclip className="h-4 w-4 text-gray-600" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-900">
                                {item.action}
                              </h4>
                              <time className="text-sm text-gray-500">
                                {new Date(item.timestamp).toLocaleDateString(
                                  "es-ES",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </time>
                            </div>
                            <p className="text-gray-600">{item.description}</p>
                            <p className="text-sm text-gray-500">
                              Por: {item.user}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Agregar Nueva Nota */}
                    <div className="border-t border-gray-200 pt-6">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Agregar Nota
                      </h4>
                      <div className="space-y-3">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Escribe una nota sobre este evento..."
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handleAddNote}
                          disabled={!newNote.trim() || addingNote}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {addingNote ? "Agregando..." : "Agregar Nota"}
                        </motion.button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tab: Adjuntos */}
                {activeTab === "attachments" && (
                  <div className="space-y-6">
                    {eventData.attachments.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {eventData.attachments.map((attachment) => (
                          <motion.div
                            key={attachment.id}
                            whileHover={{ scale: 1.02 }}
                            className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => {
                              if (attachment.type === "image") {
                                setSelectedImage(attachment.url);
                                setShowImageModal(true);
                              } else {
                                window.open(attachment.url, "_blank");
                              }
                            }}
                          >
                            <div className="flex items-start space-x-4">
                              <div className="flex-shrink-0">
                                {attachment.type === "image" ? (
                                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Image className="h-6 w-6 text-blue-600" />
                                  </div>
                                ) : attachment.type === "document" ? (
                                  <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                                    <FileText className="h-6 w-6 text-red-600" />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <File className="h-6 w-6 text-gray-600" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {attachment.name}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {formatFileSize(attachment.size)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Subido por {attachment.uploadedBy} •{" "}
                                  {new Date(
                                    attachment.uploadedAt
                                  ).toLocaleDateString("es-ES")}
                                </p>
                              </div>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(attachment.url, "_blank");
                                }}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Paperclip className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">
                          Sin Adjuntos
                        </h4>
                        <p className="text-gray-600">
                          No hay archivos adjuntos para este evento.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Información del Veterinario */}
            {eventData.veterinarian && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Veterinario
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    {eventData.veterinarian.photo ? (
                      <img
                        src={eventData.veterinarian.photo}
                        alt={eventData.veterinarian.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-6 w-6 text-blue-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900">
                        {eventData.veterinarian.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {eventData.veterinarian.specialization}
                      </p>
                      <div className="flex items-center space-x-1 mt-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">
                          {eventData.veterinarian.rating}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({eventData.veterinarian.experience} años exp.)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {eventData.veterinarian.phone}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {eventData.veterinarian.email}
                      </span>
                    </div>
                    {eventData.veterinarian.clinic && (
                      <div className="flex items-center space-x-3">
                        <Shield className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {eventData.veterinarian.clinic}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Mapa de Ubicación */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Ubicación</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowMap(!showMap)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {showMap ? "Ocultar" : "Ver"} Mapa
                </motion.button>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">
                      {eventData.location.farm}
                    </p>
                    <p className="text-sm text-gray-600">
                      {eventData.location.section}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {eventData.location.address}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  <p>Lat: {eventData.location.latitude.toFixed(6)}</p>
                  <p>Lng: {eventData.location.longitude.toFixed(6)}</p>
                </div>
              </div>

              {showMap && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 200 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 bg-gray-200 rounded-lg flex items-center justify-center"
                >
                  <div className="text-center text-gray-500">
                    <Map className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Mapa interactivo</p>
                    <p className="text-xs">Integración con Leaflet</p>
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Información de Recurrencia */}
            {eventData.isRecurring && eventData.recurringPattern && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200"
              >
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Evento Recurrente
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Frecuencia</p>
                      <p className="font-medium text-gray-900">
                        {eventData.recurringPattern.frequency === "daily"
                          ? "Diario"
                          : eventData.recurringPattern.frequency === "weekly"
                          ? "Semanal"
                          : eventData.recurringPattern.frequency === "monthly"
                          ? "Mensual"
                          : "Anual"}
                        {eventData.recurringPattern.interval > 1 &&
                          ` (cada ${eventData.recurringPattern.interval})`}
                      </p>
                    </div>
                  </div>

                  {eventData.recurringPattern.nextOccurrence && (
                    <div className="flex items-center space-x-3">
                      <Bell className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">
                          Próxima Ocurrencia
                        </p>
                        <p className="font-medium text-gray-900">
                          {new Date(
                            eventData.recurringPattern.nextOccurrence
                          ).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                  )}

                  {eventData.recurringPattern.endDate && (
                    <div className="flex items-center space-x-3">
                      <Target className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Finaliza</p>
                        <p className="font-medium text-gray-900">
                          {new Date(
                            eventData.recurringPattern.endDate
                          ).toLocaleDateString("es-ES")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Acciones Rápidas */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200"
            >
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Acciones Rápidas
              </h3>
              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Download className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Descargar Reporte</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Printer className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Imprimir Certificado</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Copy className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-700">Duplicar Evento</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modal de Eliminación */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Eliminar Evento
                </h3>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de que quieres eliminar este evento? Esta acción
                  no se puede deshacer.
                </p>
                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Eliminar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Imagen */}
      <AnimatePresence>
        {showImageModal && selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh]"
            >
              <img
                src={selectedImage}
                alt="Imagen ampliada"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="h-6 w-6" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventDetail;
