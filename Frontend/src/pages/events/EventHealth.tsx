import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Baby,
  Activity,
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
  TrendingUp,
  Target,
  DollarSign,
  AlertTriangle,
  BarChart3,
  LineChart,
  Shield,
  Clock,
  AlertCircle,
  Info,
  Users,
  Stethoscope,
  Save,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Importar funciones de integración con Timeline
// import { addEventToTimeline } from './EventTimeline';

// ==================== INTERFACES ====================
interface ReproductionEvent {
  id: string;
  bovineId: string;
  bovineName: string;
  bovineTag: string;
  eventType: ReproductionEventType;
  status: "scheduled" | "completed" | "in_progress" | "cancelled" | "failed";
  priority: "low" | "medium" | "high" | "critical";
  scheduledDate: string;
  completedDate?: string;
  location: Location;
  reproductionData: {
    method: "natural" | "artificial_insemination";
    bullId?: string;
    bullName?: string;
    bullBreed?: string;
    semenBatch?: string;
    semenProvider?: string;
    technician?: string;
    attempts?: number;
    success?: boolean;
    expectedDueDate?: string;
    heatDetectionDate?: string;
    inseminationTime?: string;
    semenQuality?: "excellent" | "good" | "fair" | "poor";
    cervixCondition?: "excellent" | "good" | "fair" | "poor";
    followUpDate?: string;
    gestationConfirmed?: boolean;
    gestationMethod?: "palpation" | "ultrasound" | "blood_test";
    fetusCount?: number;
    complications?: string[];
    nextCheckDate?: string;
    notes?: string;
  };
  veterinarian?: VeterinarianInfo;
  cost?: number;
  insurance?: {
    covered: boolean;
    claimNumber?: string;
    coverage: number;
  };
  notes?: string;
  attachments: Attachment[];
  reminders: EventReminder[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  weatherConditions?: WeatherInfo;
  relatedEvents?: string[];
}

interface ReproductionEventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  category: "heat_detection" | "insemination" | "pregnancy_check" | "breeding_management";
  requiresVeterinarian: boolean;
  urgencyLevel: number; // 1-5
}

interface VeterinarianInfo {
  id: string;
  name: string;
  license: string;
  specialization: string;
  phone: string;
  email: string;
  clinic?: string;
  emergencyContact: boolean;
}

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  farm?: string;
  section?: string;
  facility?: string;
}

interface Attachment {
  id: string;
  name: string;
  type: "image" | "document" | "xray" | "lab_result" | "video";
  url: string;
  description?: string;
  uploadedAt: string;
  size: number;
}

interface EventReminder {
  id: string;
  type: "medication" | "follow_up" | "lab_result" | "pregnancy_check";
  message: string;
  dueDate: string;
  completed: boolean;
}

interface WeatherInfo {
  temperature: number;
  humidity: number;
  condition: string;
  windSpeed: number;
  precipitation: number;
}

interface ReproductionStatistics {
  totalEvents: number;
  successfulInseminations: number;
  pregnancyRate: number;
  currentPregnant: number;
  expectedCalvings: number;
  averageGestation: number;
  heatDetectionAccuracy: number;
  activeBulls: number;
  totalCost: number;
  upcomingFollowUps: number;
  activePregnancies: number;
}

interface Bovine {
  id: string;
  name: string;
  tag: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  status: "active" | "pregnant" | "lactating" | "dry" | "sick";
  lastHeatDate?: string;
  breedingHistory: any[];
}

// ==================== CONFIGURACIONES ====================
const reproductionEventTypes: ReproductionEventType[] = [
  {
    id: "heat_detection",
    name: "Detección de Celo",
    icon: Target,
    color: "text-pink-600",
    description: "Detección y confirmación del celo en hembras",
    category: "heat_detection",
    requiresVeterinarian: false,
    urgencyLevel: 3,
  },
  {
    id: "artificial_insemination",
    name: "Inseminación Artificial",
    icon: Activity,
    color: "text-blue-600",
    description: "Procedimiento de inseminación artificial",
    category: "insemination",
    requiresVeterinarian: true,
    urgencyLevel: 4,
  },
  {
    id: "natural_breeding",
    name: "Monta Natural",
    icon: Users,
    color: "text-green-600",
    description: "Servicio por monta natural",
    category: "insemination",
    requiresVeterinarian: false,
    urgencyLevel: 3,
  },
  {
    id: "pregnancy_check",
    name: "Diagnóstico de Gestación",
    icon: Stethoscope,
    color: "text-purple-600",
    description: "Confirmación de gestación",
    category: "pregnancy_check",
    requiresVeterinarian: true,
    urgencyLevel: 3,
  },
  {
    id: "breeding_management",
    name: "Manejo Reproductivo",
    icon: FileText,
    color: "text-orange-600",
    description: "Actividades generales de manejo reproductivo",
    category: "breeding_management",
    requiresVeterinarian: false,
    urgencyLevel: 2,
  },
];

// Datos mock
const mockBovines: Bovine[] = [
  {
    id: "bov_001",
    name: "Luna",
    tag: "L-001",
    breed: "Holstein",
    age: 3,
    gender: "female",
    status: "active",
    lastHeatDate: "2024-12-15",
    breedingHistory: [],
  },
  {
    id: "bov_002",
    name: "Esperanza",
    tag: "E-002",
    breed: "Jersey",
    age: 4,
    gender: "female",
    status: "pregnant",
    breedingHistory: [],
  },
  {
    id: "bov_003",
    name: "Bella",
    tag: "B-003",
    breed: "Angus",
    age: 2,
    gender: "female",
    status: "active",
    lastHeatDate: "2024-12-10",
    breedingHistory: [],
  },
];

// ==================== COMPONENTE PRINCIPAL ====================
const EventHealth: React.FC = () => {
  // Estados principales
  const [reproductionEvents, setReproductionEvents] = useState<ReproductionEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ReproductionEvent[]>([]);
  const [bovines] = useState<Bovine[]>(mockBovines);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ReproductionEvent | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Estados para el formulario
  const [formData, setFormData] = useState<Partial<ReproductionEvent>>({
    bovineId: "",
    eventType: reproductionEventTypes[0],
    scheduledDate: "",
    priority: "medium",
    status: "scheduled",
    location: {
      latitude: 17.9869,
      longitude: -92.9303,
      address: "",
      farm: "El Progreso",
      section: "",
      facility: "",
    },
    reproductionData: {
      method: "artificial_insemination",
      attempts: 1,
      success: false,
    },
    reminders: [],
    attachments: [],
  });

  // Estados para estadísticas
  const [statistics, setStatistics] = useState<ReproductionStatistics>({
    totalEvents: 0,
    successfulInseminations: 0,
    pregnancyRate: 0,
    currentPregnant: 0,
    expectedCalvings: 0,
    averageGestation: 283,
    heatDetectionAccuracy: 0,
    activeBulls: 3,
    totalCost: 0,
    upcomingFollowUps: 0,
    activePregnancies: 0,
  });

  // Hooks de React Router
  const navigate = useNavigate();

  // ==================== EFFECTS ====================
  useEffect(() => {
    const loadReproductionEvents = async () => {
      setLoading(true);
      try {
        // Simular carga de datos desde la API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Datos simulados para desarrollo
        const mockEvents: ReproductionEvent[] = [
          {
            id: "rep_001",
            bovineId: "bov_001",
            bovineName: "Luna",
            bovineTag: "L-001",
            eventType: reproductionEventTypes[1], // IA
            status: "completed",
            priority: "high",
            scheduledDate: "2024-12-20T09:00:00Z",
            completedDate: "2024-12-20T09:30:00Z",
            location: {
              latitude: 17.9869,
              longitude: -92.9303,
              address: "Corral de Inseminación, Rancho El Progreso",
              farm: "El Progreso",
              section: "Corral A",
              facility: "Manga de Trabajo",
            },
            reproductionData: {
              method: "artificial_insemination",
              semenBatch: "HOL-2024-001",
              semenProvider: "Genética Premium SA",
              technician: "Dr. Carlos Herrera",
              attempts: 1,
              success: true,
              expectedDueDate: "2025-09-20",
              heatDetectionDate: "2024-12-19",
              inseminationTime: "09:15",
              semenQuality: "excellent",
              cervixCondition: "excellent",
              followUpDate: "2025-01-20",
              gestationConfirmed: false,
              nextCheckDate: "2025-01-15",
              complications: [],
            },
            cost: 250,
            veterinarian: {
              id: "vet_001",
              name: "Dr. Carlos Herrera",
              license: "VET-2024-001",
              specialization: "Reproducción Bovina",
              phone: "+52 993 123 4567",
              email: "carlos.herrera@vet.com",
              clinic: "Centro de Reproducción Animal",
              emergencyContact: true,
            },
            notes: "Inseminación exitosa, vaca en celo óptimo",
            attachments: [],
            reminders: [
              {
                id: "rem_001",
                type: "pregnancy_check",
                message: "Diagnóstico de gestación programado",
                dueDate: "2025-01-15T10:00:00Z",
                completed: false,
              },
            ],
            createdAt: "2024-12-20T08:00:00Z",
            updatedAt: "2024-12-20T09:30:00Z",
            createdBy: "user_001",
          },
          {
            id: "rep_002",
            bovineId: "bov_002",
            bovineName: "Esperanza",
            bovineTag: "E-002",
            eventType: reproductionEventTypes[3], // Pregnancy check
            status: "completed",
            priority: "high",
            scheduledDate: "2024-12-18T10:00:00Z",
            completedDate: "2024-12-18T10:30:00Z",
            location: {
              latitude: 17.9869,
              longitude: -92.9303,
              address: "Instalaciones Veterinarias",
              farm: "El Progreso",
              section: "Área Veterinaria",
              facility: "Consulta",
            },
            reproductionData: {
              method: "artificial_insemination",
              gestationConfirmed: true,
              gestationMethod: "palpation",
              fetusCount: 1,
              expectedDueDate: "2025-08-15",
              nextCheckDate: "2025-02-15",
            },
            cost: 180,
            veterinarian: {
              id: "vet_001",
              name: "Dr. Carlos Herrera",
              license: "VET-2024-001",
              specialization: "Reproducción Bovina",
              phone: "+52 993 123 4567",
              email: "carlos.herrera@vet.com",
              clinic: "Centro de Reproducción Animal",
              emergencyContact: true,
            },
            notes: "Gestación confirmada, feto en desarrollo normal",
            attachments: [],
            reminders: [],
            createdAt: "2024-12-18T09:00:00Z",
            updatedAt: "2024-12-18T10:30:00Z",
            createdBy: "user_001",
          },
        ];

        setReproductionEvents(mockEvents);
        calculateStatistics(mockEvents);
      } catch (error) {
        console.error("Error cargando eventos de reproducción:", error);
      } finally {
        setLoading(false);
      }
    };

    loadReproductionEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [reproductionEvents, searchTerm, selectedEventType, selectedStatus, selectedPriority, dateFilter]);

  // ==================== FUNCIONES ====================
  const calculateStatistics = (events: ReproductionEvent[]) => {
    const successful = events.filter(e => e.reproductionData.success).length;
    const totalCost = events.reduce((sum, e) => sum + (e.cost || 0), 0);
    const pregnant = bovines.filter(b => b.status === "pregnant").length;
    const upcomingFollowUps = events.filter(e => 
      e.reminders.some(r => !r.completed && new Date(r.dueDate) > new Date())
    ).length;

    setStatistics({
      totalEvents: events.length,
      successfulInseminations: successful,
      pregnancyRate: events.length > 0 ? (successful / events.length) * 100 : 0,
      currentPregnant: pregnant,
      expectedCalvings: pregnant,
      averageGestation: 283,
      heatDetectionAccuracy: 85,
      activeBulls: 3,
      totalCost,
      upcomingFollowUps,
      activePregnancies: pregnant,
    });
  };

  const filterEvents = () => {
    let filtered = reproductionEvents;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.bovineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.bovineTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventType.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedEventType !== "all") {
      filtered = filtered.filter(event => event.eventType.id === selectedEventType);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(event => event.status === selectedStatus);
    }

    if (selectedPriority !== "all") {
      filtered = filtered.filter(event => event.priority === selectedPriority);
    }

    if (dateFilter !== "all") {
      const now = new Date();
      switch (dateFilter) {
        case "today":
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.scheduledDate);
            return eventDate.toDateString() === now.toDateString();
          });
          break;
        case "week":
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.scheduledDate);
            return eventDate >= now && eventDate <= weekFromNow;
          });
          break;
        case "month":
          const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.scheduledDate);
            return eventDate >= now && eventDate <= monthFromNow;
          });
          break;
        case "overdue":
          filtered = filtered.filter(event => {
            const eventDate = new Date(event.scheduledDate);
            return eventDate < now && event.status !== "completed";
          });
          break;
      }
    }

    setFilteredEvents(filtered);
  };

  const handleCreateEvent = () => {
    setFormData({
      bovineId: "",
      eventType: reproductionEventTypes[0],
      scheduledDate: "",
      priority: "medium",
      status: "scheduled",
      location: {
        latitude: 17.9869,
        longitude: -92.9303,
        address: "",
        farm: "El Progreso",
        section: "",
        facility: "",
      },
      reproductionData: {
        method: "artificial_insemination",
        attempts: 1,
        success: false,
      },
      reminders: [],
      attachments: [],
    });
    setShowCreateModal(true);
  };

  const handleEditEvent = (event: ReproductionEvent) => {
    setFormData(event);
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este evento de reproducción?")) {
      const updatedEvents = reproductionEvents.filter(event => event.id !== eventId);
      setReproductionEvents(updatedEvents);
      calculateStatistics(updatedEvents);
    }
  };

  const handleViewEvent = (event: ReproductionEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleSaveEvent = () => {
    if (!formData.bovineId || !formData.scheduledDate) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    const selectedBovine = bovines.find(b => b.id === formData.bovineId);
    if (!selectedBovine) return;

    const eventData: ReproductionEvent = {
      id: selectedEvent?.id || `rep_${Date.now()}`,
      bovineId: formData.bovineId,
      bovineName: selectedBovine.name,
      bovineTag: selectedBovine.tag,
      eventType: formData.eventType!,
      status: formData.status!,
      priority: formData.priority!,
      scheduledDate: formData.scheduledDate!,
      completedDate: formData.completedDate,
      location: formData.location!,
      reproductionData: formData.reproductionData!,
      veterinarian: formData.veterinarian,
      cost: formData.cost,
      insurance: formData.insurance,
      notes: formData.notes,
      attachments: formData.attachments!,
      reminders: formData.reminders!,
      createdAt: selectedEvent?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "user_001",
      weatherConditions: formData.weatherConditions,
      relatedEvents: formData.relatedEvents,
    };

    let updatedEvents: ReproductionEvent[];
    if (selectedEvent) {
      // Editar evento existente
      updatedEvents = reproductionEvents.map(event => 
        event.id === selectedEvent.id ? eventData : event
      );
      setShowEditModal(false);
    } else {
      // Crear nuevo evento
      updatedEvents = [eventData, ...reproductionEvents];
      setShowCreateModal(false);

      // Integrar con Timeline - Descomenta estas líneas cuando implementes la integración
      /*
      addEventToTimeline({
        type: 'breeding',
        title: `${eventData.eventType.name} - ${eventData.bovineName}`,
        description: `${eventData.reproductionData.method === 'artificial_insemination' ? 'Inseminación artificial' : 'Monta natural'} para ${eventData.bovineName}`,
        date: new Date(eventData.scheduledDate).toISOString().split('T')[0],
        time: new Date(eventData.scheduledDate).toTimeString().slice(0, 5),
        location: eventData.location.facility || eventData.location.section || eventData.location.address,
        bovineId: eventData.bovineId,
        bovineName: eventData.bovineName,
        details: {
          method: eventData.reproductionData.method === 'artificial_insemination' ? 'Inseminación Artificial' : 'Monta Natural',
          technician: eventData.reproductionData.technician,
          semenBatch: eventData.reproductionData.semenBatch,
          bullName: eventData.reproductionData.bullName,
          expectedDueDate: eventData.reproductionData.expectedDueDate,
          success: eventData.reproductionData.success,
        },
        status: eventData.status,
        priority: eventData.priority,
        createdBy: eventData.createdBy,
        cost: eventData.cost,
        notes: eventData.notes,
      });
      */
    }

    setReproductionEvents(updatedEvents);
    calculateStatistics(updatedEvents);
    setSelectedEvent(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "text-blue-600 bg-blue-100",
      completed: "text-green-600 bg-green-100",
      in_progress: "text-yellow-600 bg-yellow-100",
      cancelled: "text-red-600 bg-red-100",
      failed: "text-red-600 bg-red-100",
    };
    return colors[status as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-600 bg-green-100",
      medium: "text-yellow-600 bg-yellow-100",
      high: "text-orange-600 bg-orange-100",
      critical: "text-red-600 bg-red-100",
    };
    return colors[priority as keyof typeof colors] || "text-gray-600 bg-gray-100";
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

  const getUrgencyIcon = (urgencyLevel: number) => {
    if (urgencyLevel >= 4)
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (urgencyLevel >= 3)
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  // ==================== FORMULARIO MODAL ====================
  const FormModal = ({ isEdit = false }: { isEdit?: boolean }) => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => isEdit ? setShowEditModal(false) : setShowCreateModal(false)}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Editar" : "Crear"} Evento de Reproducción
          </h2>
          <button
            onClick={() => isEdit ? setShowEditModal(false) : setShowCreateModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Básica */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vaca *
              </label>
              <select
                value={formData.bovineId}
                onChange={(e) => {
                  const selectedBovine = bovines.find(b => b.id === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    bovineId: e.target.value,
                    bovineName: selectedBovine?.name || "",
                    bovineTag: selectedBovine?.tag || "",
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              >
                <option value="">Seleccionar vaca</option>
                {bovines.filter(b => b.gender === "female").map(bovine => (
                  <option key={bovine.id} value={bovine.id}>
                    {bovine.name} ({bovine.tag}) - {bovine.breed}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Evento *
              </label>
              <select
                value={formData.eventType?.id}
                onChange={(e) => {
                  const eventType = reproductionEventTypes.find(t => t.id === e.target.value);
                  setFormData(prev => ({ ...prev, eventType }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              >
                {reproductionEventTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha y Hora *
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledDate ? new Date(formData.scheduledDate).toISOString().slice(0, 16) : ""}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  scheduledDate: new Date(e.target.value).toISOString() 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="scheduled">Programado</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completado</option>
                  <option value="failed">Fallido</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
            </div>
          </div>

          {/* Datos de Reproducción */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Datos de Reproducción</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método
              </label>
              <select
                value={formData.reproductionData?.method}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  reproductionData: { ...prev.reproductionData!, method: e.target.value as any }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              >
                <option value="artificial_insemination">Inseminación Artificial</option>
                <option value="natural">Monta Natural</option>
              </select>
            </div>

            {formData.reproductionData?.method === "artificial_insemination" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lote de Semen
                  </label>
                  <input
                    type="text"
                    value={formData.reproductionData?.semenBatch || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      reproductionData: { ...prev.reproductionData!, semenBatch: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Ej: HOL-2024-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proveedor de Semen
                  </label>
                  <input
                    type="text"
                    value={formData.reproductionData?.semenProvider || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      reproductionData: { ...prev.reproductionData!, semenProvider: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Ej: Genética Premium SA"
                  />
                </div>
              </>
            )}

            {formData.reproductionData?.method === "natural" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Toro
                  </label>
                  <input
                    type="text"
                    value={formData.reproductionData?.bullName || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      reproductionData: { ...prev.reproductionData!, bullName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Nombre del toro"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raza del Toro
                  </label>
                  <input
                    type="text"
                    value={formData.reproductionData?.bullBreed || ""}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      reproductionData: { ...prev.reproductionData!, bullBreed: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                    placeholder="Ej: Holstein, Angus"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Técnico/Veterinario
              </label>
              <input
                type="text"
                value={formData.reproductionData?.technician || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  reproductionData: { ...prev.reproductionData!, technician: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Nombre del técnico"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo (MXN)
              </label>
              <input
                type="number"
                value={formData.cost || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sección
              </label>
              <input
                type="text"
                value={formData.location?.section || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location!, section: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Ej: Potrero A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instalación
              </label>
              <input
                type="text"
                value={formData.location?.facility || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location!, facility: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Ej: Manga de trabajo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección
              </label>
              <input
                type="text"
                value={formData.location?.address || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { ...prev.location!, address: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                placeholder="Dirección completa"
              />
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas y Observaciones
          </label>
          <textarea
            value={formData.notes || ""}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
            placeholder="Observaciones adicionales..."
          />
        </div>

        {/* Botones */}
        <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={() => isEdit ? setShowEditModal(false) : setShowCreateModal(false)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveEvent}
            className="flex items-center space-x-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>{isEdit ? "Actualizar" : "Crear"} Evento</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando eventos de reproducción...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
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
                  Gestiona la reproducción y genética de tu ganado
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-xl font-medium hover:bg-blue-700 transition-all"
              >
                <BarChart3 className="h-5 w-5" />
                <span>Analíticas</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateEvent}
                className="flex items-center space-x-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-pink-700 hover:to-purple-700 transition-all shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Nuevo Evento</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Preñez</p>
                <p className="text-3xl font-bold text-green-600">
                  {statistics.pregnancyRate.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {statistics.successfulInseminations} exitosas
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
                <p className="text-sm font-medium text-gray-600">Vacas Preñadas</p>
                <p className="text-3xl font-bold text-blue-600">
                  {statistics.currentPregnant}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {statistics.expectedCalvings} partos esperados
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
                <p className="text-sm font-medium text-gray-600">Eventos Totales</p>
                <p className="text-3xl font-bold text-purple-600">
                  {statistics.totalEvents}
                </p>
                <p className="text-sm text-gray-500 mt-1">Este período</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-xl">
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Costo Total</p>
                <p className="text-3xl font-bold text-orange-600">
                  ${statistics.totalCost.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500 mt-1">Inversión reproductiva</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-xl">
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Panel de Analíticas (Expandible) */}
      <AnimatePresence>
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Panel de Reproducción y Analíticas
                </h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAnalytics(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Distribución de Eventos */}
                <div className="lg:col-span-2 bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Distribución de Eventos Reproductivos
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Target className="h-8 w-8 text-pink-600" />
                      </div>
                      <p className="text-sm text-gray-600">Detección Celo</p>
                      <p className="text-xl font-bold text-pink-600">
                        {reproductionEvents.filter(e => e.eventType.id === 'heat_detection').length}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Activity className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">Inseminaciones</p>
                      <p className="text-xl font-bold text-blue-600">
                        {reproductionEvents.filter(e => 
                          e.eventType.id === 'artificial_insemination' || e.eventType.id === 'natural_breeding'
                        ).length}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Stethoscope className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="text-sm text-gray-600">Diagnósticos</p>
                      <p className="text-xl font-bold text-purple-600">
                        {reproductionEvents.filter(e => e.eventType.id === 'pregnancy_check').length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Métricas de Eficiencia */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Eficiencia Reproductiva
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Tasa de Preñez</span>
                        <span className="font-medium">{statistics.pregnancyRate.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${statistics.pregnancyRate}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Detección de Celo</span>
                        <span className="font-medium">{statistics.heatDetectionAccuracy}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-pink-500 h-2 rounded-full" 
                          style={{ width: `${statistics.heatDetectionAccuracy}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-1">Próximos Seguimientos</p>
                      <p className="text-2xl font-bold text-blue-600">{statistics.upcomingFollowUps}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filtros y Búsqueda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por vaca, evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/80"
              />
            </div>

            {/* Filtro por tipo de evento */}
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todos los tipos</option>
              {reproductionEventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            {/* Filtro por estado */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programado</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completado</option>
              <option value="failed">Fallido</option>
              <option value="cancelled">Cancelado</option>
            </select>

            {/* Filtro por prioridad */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todas las prioridades</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
            </select>

            {/* Filtro por fecha */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Próxima semana</option>
              <option value="month">Próximo mes</option>
              <option value="overdue">Vencidos</option>
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
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay eventos de reproducción
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ||
              selectedEventType !== "all" ||
              selectedStatus !== "all" ||
              selectedPriority !== "all" ||
              dateFilter !== "all"
                ? "No se encontraron eventos que coincidan con los filtros aplicados."
                : "Comienza creando tu primer evento de reproducción."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateEvent}
              className="bg-gradient-to-r from-pink-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-pink-700 hover:to-purple-700 transition-all"
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
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleViewEvent(event)}
              >
                {/* Header del evento */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white`}>
                      <event.eventType.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        {event.eventType.name}
                        {getUrgencyIcon(event.eventType.urgencyLevel)}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {event.bovineName} • {event.bovineTag}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status === "scheduled" ? "Programado" :
                       event.status === "completed" ? "Completado" :
                       event.status === "in_progress" ? "En Progreso" :
                       event.status === "failed" ? "Fallido" : "Cancelado"}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(event.priority)}`}>
                      {event.priority === "low" ? "Baja" :
                       event.priority === "medium" ? "Media" :
                       event.priority === "high" ? "Alta" : "Crítica"}
                    </span>
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
                    <span>{event.location.facility || event.location.section || "No especificado"}</span>
                  </div>

                  {event.reproductionData.technician && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{event.reproductionData.technician}</span>
                    </div>
                  )}

                  {event.cost && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>${event.cost.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Datos específicos de reproducción */}
                <div className="mt-4 p-3 bg-pink-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-pink-900">
                      {event.reproductionData.method === "artificial_insemination" ? "Inseminación Artificial" : "Monta Natural"}
                    </span>
                    {event.reproductionData.success !== undefined && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        event.reproductionData.success 
                          ? "bg-green-100 text-green-800" 
                          : "bg-red-100 text-red-800"
                      }`}>
                        {event.reproductionData.success ? "Exitoso" : "Fallido"}
                      </span>
                    )}
                  </div>
                  
                  {event.reproductionData.method === "artificial_insemination" && event.reproductionData.semenBatch && (
                    <p className="text-xs text-pink-700">
                      Lote: {event.reproductionData.semenBatch}
                    </p>
                  )}
                  
                  {event.reproductionData.method === "natural" && event.reproductionData.bullName && (
                    <p className="text-xs text-pink-700">
                      Toro: {event.reproductionData.bullName}
                    </p>
                  )}
                  
                  {event.reproductionData.expectedDueDate && (
                    <p className="text-xs text-pink-700 mt-1">
                      Fecha esperada de parto: {formatDate(event.reproductionData.expectedDueDate)}
                    </p>
                  )}
                </div>

                {/* Acciones */}
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
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewEvent(event);
                      }}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                      className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modales */}
      <AnimatePresence>
        {showCreateModal && <FormModal />}
        {showEditModal && <FormModal isEdit />}
        
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
              className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-pink-100 text-pink-600">
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

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información General */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Información General</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                        {selectedEvent.status === "scheduled" ? "Programado" :
                         selectedEvent.status === "completed" ? "Completado" :
                         selectedEvent.status === "in_progress" ? "En Progreso" :
                         selectedEvent.status === "failed" ? "Fallido" : "Cancelado"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Prioridad:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedEvent.priority)}`}>
                        {selectedEvent.priority === "low" ? "Baja" :
                         selectedEvent.priority === "medium" ? "Media" :
                         selectedEvent.priority === "high" ? "Alta" : "Crítica"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">{formatDate(selectedEvent.scheduledDate)}</span>
                    </div>

                    {selectedEvent.reproductionData.technician && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Técnico:</span>
                        <span className="font-medium">{selectedEvent.reproductionData.technician}</span>
                      </div>
                    )}

                    {selectedEvent.cost && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Costo:</span>
                        <span className="font-medium">${selectedEvent.cost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Datos de Reproducción */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Datos de Reproducción</h3>
                  
                  <div className="bg-pink-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-pink-700">Método:</span>
                        <span className="font-medium text-pink-900">
                          {selectedEvent.reproductionData.method === "artificial_insemination" 
                            ? "Inseminación Artificial" 
                            : "Monta Natural"}
                        </span>
                      </div>

                      {selectedEvent.reproductionData.method === "artificial_insemination" && (
                        <>
                          {selectedEvent.reproductionData.semenBatch && (
                            <div className="flex justify-between">
                              <span className="text-pink-700">Lote de Semen:</span>
                              <span className="font-medium text-pink-900">
                                {selectedEvent.reproductionData.semenBatch}
                              </span>
                            </div>
                          )}
                          {selectedEvent.reproductionData.semenProvider && (
                            <div className="flex justify-between">
                              <span className="text-pink-700">Proveedor:</span>
                              <span className="font-medium text-pink-900">
                                {selectedEvent.reproductionData.semenProvider}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {selectedEvent.reproductionData.method === "natural" && (
                        <>
                          {selectedEvent.reproductionData.bullName && (
                            <div className="flex justify-between">
                              <span className="text-pink-700">Toro:</span>
                              <span className="font-medium text-pink-900">
                                {selectedEvent.reproductionData.bullName}
                              </span>
                            </div>
                          )}
                          {selectedEvent.reproductionData.bullBreed && (
                            <div className="flex justify-between">
                              <span className="text-pink-700">Raza del Toro:</span>
                              <span className="font-medium text-pink-900">
                                {selectedEvent.reproductionData.bullBreed}
                              </span>
                            </div>
                          )}
                        </>
                      )}

                      {selectedEvent.reproductionData.expectedDueDate && (
                        <div className="flex justify-between">
                          <span className="text-pink-700">Fecha Esperada de Parto:</span>
                          <span className="font-medium text-pink-900">
                            {formatDate(selectedEvent.reproductionData.expectedDueDate)}
                          </span>
                        </div>
                      )}

                      {selectedEvent.reproductionData.success !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-pink-700">Resultado:</span>
                          <span className={`font-medium flex items-center space-x-1 ${
                            selectedEvent.reproductionData.success ? "text-green-700" : "text-red-700"
                          }`}>
                            {selectedEvent.reproductionData.success ? (
                              <>
                                <CheckCircle className="h-4 w-4" />
                                <span>Exitoso</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-4 w-4" />
                                <span>Fallido</span>
                              </>
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {selectedEvent.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Notas y Observaciones</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedEvent.notes}</p>
                  </div>
                </div>
              )}

              {/* Ubicación */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Ubicación</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {selectedEvent.location.section && (
                      <div>
                        <span className="font-medium text-blue-700">Sección:</span>
                        <p className="text-blue-900">{selectedEvent.location.section}</p>
                      </div>
                    )}
                    {selectedEvent.location.facility && (
                      <div>
                        <span className="font-medium text-blue-700">Instalación:</span>
                        <p className="text-blue-900">{selectedEvent.location.facility}</p>
                      </div>
                    )}
                    {selectedEvent.location.address && (
                      <div>
                        <span className="font-medium text-blue-700">Dirección:</span>
                        <p className="text-blue-900">{selectedEvent.location.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEditEvent(selectedEvent);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Editar</span>
                </button>

                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventHealth;