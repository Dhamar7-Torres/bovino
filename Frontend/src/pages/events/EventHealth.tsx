import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Calendar,
  MapPin,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Bell,
  FileText,
  AlertTriangle,
  AlertCircle,
  Info,
  Stethoscope,
  Save,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Thermometer,
  Pill,
  Bandage,
  Shield,
  Clock,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ==================== INTERFACES ====================
interface HealthEvent {
  id: string;
  bovineId: string;
  bovineName: string;
  bovineTag: string;
  eventType: HealthEventType;
  status: "scheduled" | "completed" | "in_progress" | "cancelled" | "emergency";
  priority: "low" | "medium" | "high" | "critical" | "emergency";
  scheduledDate: string;
  completedDate?: string;
  location: Location;
  healthData: {
    checkType: HealthCheckType;
    symptoms?: string[];
    diagnosis?: string;
    treatment?: string;
    medication?: MedicationInfo[];
    vitalSigns?: VitalSigns;
    bodyConditionScore?: number; // 1-9 escala
    weight?: number;
    temperature?: number;
    heartRate?: number;
    respiratoryRate?: number;
    findings?: string[];
    recommendations?: string[];
    followUpDate?: string;
    followUpRequired: boolean;
    severity?: "mild" | "moderate" | "severe" | "critical";
    contagious?: boolean;
    quarantine?: boolean;
    prognosis: "excellent" | "good" | "fair" | "poor" | "grave";
    recoveryDate?: string;
    complications?: string[];
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

interface HealthEventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  category: "checkup" | "emergency" | "treatment" | "vaccination" | "prevention";
  requiresVeterinarian: boolean;
  urgencyLevel: number; // 1-5
}

interface HealthCheckType {
  id: string;
  name: string;
  description: string;
  standardProcedures: string[];
  estimatedDuration: number; // minutos
  cost: number;
}

interface MedicationInfo {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  route: "oral" | "injectable" | "topical" | "intravenous";
  startDate: string;
  endDate: string;
  sideEffects?: string[];
  completed: boolean;
}

interface VitalSigns {
  temperature: number; // Celsius
  heartRate: number; // bpm
  respiratoryRate: number; // rpm
  bloodPressure?: string;
  oxygenSaturation?: number;
  capillaryRefillTime?: number; // segundos
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
  rating?: number;
  experience?: number;
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
  type: "medication" | "follow_up" | "lab_result" | "vaccination";
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

// ==================== CONFIGURACIONES ====================
const healthEventTypes: HealthEventType[] = [
  {
    id: "routine_checkup",
    name: "Revisión Rutinaria",
    icon: Stethoscope,
    color: "text-green-600",
    description: "Examen de salud preventivo rutinario",
    category: "checkup",
    requiresVeterinarian: true,
    urgencyLevel: 2,
  },
  {
    id: "emergency_call",
    name: "Emergencia Médica",
    icon: AlertTriangle,
    color: "text-red-600",
    description: "Situación médica urgente",
    category: "emergency",
    requiresVeterinarian: true,
    urgencyLevel: 5,
  },
  {
    id: "disease_treatment",
    name: "Tratamiento de Enfermedad",
    icon: Pill,
    color: "text-blue-600",
    description: "Tratamiento médico específico",
    category: "treatment",
    requiresVeterinarian: true,
    urgencyLevel: 3,
  },
  {
    id: "injury_treatment",
    name: "Tratamiento de Lesión",
    icon: Bandage,
    color: "text-orange-600",
    description: "Atención médica por lesiones",
    category: "treatment",
    requiresVeterinarian: true,
    urgencyLevel: 4,
  },
  {
    id: "vaccination",
    name: "Vacunación",
    icon: Shield,
    color: "text-purple-600",
    description: "Aplicación de vacunas preventivas",
    category: "vaccination",
    requiresVeterinarian: true,
    urgencyLevel: 2,
  },
  {
    id: "preventive_care",
    name: "Cuidado Preventivo",
    icon: Heart,
    color: "text-pink-600",
    description: "Medidas preventivas de salud",
    category: "prevention",
    requiresVeterinarian: false,
    urgencyLevel: 1,
  },
];

const healthCheckTypes: HealthCheckType[] = [
  {
    id: "general_exam",
    name: "Examen General",
    description: "Revisión completa del estado de salud",
    standardProcedures: ["Examen físico", "Signos vitales", "Peso corporal"],
    estimatedDuration: 30,
    cost: 150,
  },
  {
    id: "emergency_exam",
    name: "Examen de Emergencia",
    description: "Evaluación urgente por enfermedad o lesión",
    standardProcedures: ["Evaluación rápida", "Estabilización", "Diagnóstico"],
    estimatedDuration: 45,
    cost: 300,
  },
  {
    id: "follow_up",
    name: "Seguimiento",
    description: "Revisión posterior a tratamiento",
    standardProcedures: ["Evaluación de progreso", "Ajuste de tratamiento"],
    estimatedDuration: 20,
    cost: 100,
  },
];

// ==================== COMPONENTE PRINCIPAL ====================
const EventHealth: React.FC = () => {
  // Estados principales
  const [healthEvents, setHealthEvents] = useState<HealthEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HealthEvent[]>([]);
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
  const [selectedEvent, setSelectedEvent] = useState<HealthEvent | null>(null);
  
  // Estados para el formulario
  const [formData, setFormData] = useState<Partial<HealthEvent>>({
    bovineId: "",
    bovineName: "",
    bovineTag: "",
    eventType: healthEventTypes[0],
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
    healthData: {
      checkType: healthCheckTypes[0],
      followUpRequired: false,
      prognosis: "good",
      symptoms: [],
      findings: [],
      recommendations: [],
    },
    reminders: [],
    attachments: [],
  });

  // Estados para estadísticas
  const [statistics, setStatistics] = useState<HealthStatistics>({
    totalEvents: 0,
    emergencyEvents: 0,
    completedTreatments: 0,
    activePatients: 0,
    upcomingCheckups: 0,
    averageRecoveryTime: 7,
    healthyAnimals: 0,
    sickAnimals: 0,
    totalCost: 0,
    upcomingFollowUps: 0,
    medicationCompliance: 85,
  });

  // Hooks de React Router
  const navigate = useNavigate();

  // ==================== EFFECTS ====================
  useEffect(() => {
    const loadHealthEvents = async () => {
      setLoading(true);
      try {
        // Simular carga de datos desde la API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Datos simulados para desarrollo
        const mockEvents: HealthEvent[] = [
          {
            id: "health_001",
            bovineId: "bov_001",
            bovineName: "Luna",
            bovineTag: "L-001",
            eventType: healthEventTypes[0], // Rutinaria
            status: "completed",
            priority: "medium",
            scheduledDate: "2024-12-20T09:00:00Z",
            completedDate: "2024-12-20T09:45:00Z",
            location: {
              latitude: 17.9869,
              longitude: -92.9303,
              address: "Corral Principal, Rancho El Progreso",
              farm: "El Progreso",
              section: "Corral Principal",
              facility: "Manga de Trabajo",
            },
            healthData: {
              checkType: healthCheckTypes[0],
              vitalSigns: {
                temperature: 38.5,
                heartRate: 72,
                respiratoryRate: 20,
              },
              bodyConditionScore: 7,
              weight: 450,
              findings: ["Estado general bueno", "Condición corporal óptima"],
              recommendations: ["Continuar con alimentación actual", "Próxima revisión en 3 meses"],
              followUpRequired: false,
              prognosis: "excellent",
            },
            cost: 150,
            veterinarian: {
              id: "vet_001",
              name: "Dr. Carlos Herrera",
              license: "VET-2024-001",
              specialization: "Medicina Bovina General",
              phone: "+52 993 123 4567",
              email: "carlos.herrera@vet.com",
              clinic: "Clínica Veterinaria El Campo",
              emergencyContact: true,
              rating: 4.8,
              experience: 15,
            },
            notes: "Revisión rutinaria completada sin novedades",
            attachments: [],
            reminders: [],
            createdAt: "2024-12-20T08:00:00Z",
            updatedAt: "2024-12-20T09:45:00Z",
            createdBy: "user_001",
          },
          {
            id: "health_002",
            bovineId: "bov_002",
            bovineName: "Esperanza",
            bovineTag: "E-002",
            eventType: healthEventTypes[2], // Tratamiento enfermedad
            status: "in_progress",
            priority: "high",
            scheduledDate: "2024-12-18T10:00:00Z",
            location: {
              latitude: 17.9869,
              longitude: -92.9303,
              address: "Instalaciones Veterinarias",
              farm: "El Progreso",
              section: "Área Veterinaria",
              facility: "Consulta",
            },
            healthData: {
              checkType: healthCheckTypes[1],
              symptoms: ["Fiebre", "Falta de apetito", "Tos persistente"],
              diagnosis: "Neumonía bacteriana leve",
              treatment: "Antibioterapia con penicilina",
              medication: [{
                id: "med_001",
                name: "Penicilina G",
                dosage: "20,000 UI/kg",
                frequency: "Cada 12 horas",
                duration: "7 días",
                route: "injectable",
                startDate: "2024-12-18",
                endDate: "2024-12-25",
                completed: false,
              }],
              vitalSigns: {
                temperature: 39.8,
                heartRate: 85,
                respiratoryRate: 28,
              },
              severity: "moderate",
              followUpRequired: true,
              followUpDate: "2024-12-25T10:00:00Z",
              prognosis: "good",
            },
            cost: 280,
            veterinarian: {
              id: "vet_001",
              name: "Dr. Carlos Herrera",
              license: "VET-2024-001",
              specialization: "Medicina Bovina General",
              phone: "+52 993 123 4567",
              email: "carlos.herrera@vet.com",
              clinic: "Clínica Veterinaria El Campo",
              emergencyContact: true,
              rating: 4.8,
              experience: 15,
            },
            notes: "Respondiendo bien al tratamiento, mejoría notable",
            attachments: [],
            reminders: [
              {
                id: "rem_001",
                type: "medication",
                message: "Aplicar dosis de penicilina",
                dueDate: "2024-12-22T08:00:00Z",
                completed: false,
              },
              {
                id: "rem_002",
                type: "follow_up",
                message: "Revisión post-tratamiento",
                dueDate: "2024-12-25T10:00:00Z",
                completed: false,
              },
            ],
            createdAt: "2024-12-18T09:00:00Z",
            updatedAt: "2024-12-21T16:30:00Z",
            createdBy: "user_001",
          },
        ];

        setHealthEvents(mockEvents);
      } catch (error) {
        console.error("Error cargando eventos de salud:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHealthEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [healthEvents, searchTerm, selectedEventType, selectedStatus, selectedPriority, dateFilter]);

  // ==================== FUNCIONES ====================
  const filterEvents = () => {
    let filtered = healthEvents;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.bovineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.bovineTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.healthData.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleCreateEvent = async () => {
    // Obtener ubicación actual
    const currentLocation = await getCurrentLocation();
    
    setFormData({
      bovineId: "",
      bovineName: "",
      bovineTag: "",
      eventType: healthEventTypes[0],
      scheduledDate: "",
      priority: "medium",
      status: "scheduled",
      location: {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        address: `${currentLocation.latitude.toFixed(6)}, ${currentLocation.longitude.toFixed(6)}`,
        farm: "El Progreso",
        section: "",
        facility: "",
      },
      healthData: {
        checkType: healthCheckTypes[0],
        followUpRequired: false,
        prognosis: "good",
        symptoms: [],
        findings: [],
        recommendations: [],
      },
      reminders: [],
      attachments: [],
    });
    setShowCreateModal(true);
  };

  const handleEditEvent = (event: HealthEvent) => {
    setFormData({
      ...event,
      // Asegurar que todos los campos estén disponibles para edición
      bovineName: event.bovineName,
      bovineTag: event.bovineTag,
    });
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este evento de salud?")) {
      const updatedEvents = healthEvents.filter(event => event.id !== eventId);
      setHealthEvents(updatedEvents);
    }
  };

  const handleViewEvent = (event: HealthEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleSaveEvent = () => {
    if (!formData.bovineName || !formData.scheduledDate) {
      alert("Por favor completa los campos obligatorios (Nombre de la vaca y Fecha)");
      return;
    }

    const eventData: HealthEvent = {
      id: selectedEvent?.id || `health_${Date.now()}`,
      bovineId: formData.bovineId || `bovine_${Date.now()}`,
      bovineName: formData.bovineName!,
      bovineTag: formData.bovineTag || formData.bovineName!.toUpperCase().substring(0, 3) + "-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      eventType: formData.eventType!,
      status: formData.status!,
      priority: formData.priority!,
      scheduledDate: formData.scheduledDate!,
      completedDate: formData.completedDate,
      location: formData.location!,
      healthData: formData.healthData!,
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

    let updatedEvents: HealthEvent[];
    if (selectedEvent) {
      // Editar evento existente
      updatedEvents = healthEvents.map(event => 
        event.id === selectedEvent.id ? eventData : event
      );
      setShowEditModal(false);
    } else {
      // Crear nuevo evento
      updatedEvents = [eventData, ...healthEvents];
      setShowCreateModal(false);
    }

    setHealthEvents(updatedEvents);
    setSelectedEvent(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "text-blue-600 bg-blue-100",
      completed: "text-green-600 bg-green-100",
      in_progress: "text-yellow-600 bg-yellow-100",
      cancelled: "text-red-600 bg-red-100",
      emergency: "text-red-600 bg-red-200",
    };
    return colors[status as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-600 bg-green-100",
      medium: "text-yellow-600 bg-yellow-100",
      high: "text-orange-600 bg-orange-100",
      critical: "text-red-600 bg-red-100",
      emergency: "text-red-700 bg-red-200",
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
            {isEdit ? "Editar" : "Crear"} Evento de Salud
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
                Nombre de la Vaca *
              </label>
              <input
                type="text"
                value={formData.bovineName || ""}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    bovineId: `bovine_${Date.now()}`, // Generar ID único
                    bovineName: e.target.value,
                    bovineTag: e.target.value.toUpperCase().substring(0, 3) + "-" + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                placeholder="Ingresa el nombre de la vaca"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Evento *
              </label>
              <select
                value={formData.eventType?.id}
                onChange={(e) => {
                  const eventType = healthEventTypes.find(t => t.id === e.target.value);
                  setFormData(prev => ({ ...prev, eventType }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                required
              >
                {healthEventTypes.map(type => (
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                >
                  <option value="scheduled">Programado</option>
                  <option value="in_progress">En Progreso</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="emergency">Emergencia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                  <option value="emergency">Emergencia</option>
                </select>
              </div>
            </div>
          </div>

          {/* Datos de Salud */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Datos de Salud</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Revisión
              </label>
              <select
                value={formData.healthData?.checkType?.id}
                onChange={(e) => {
                  const checkType = healthCheckTypes.find(t => t.id === e.target.value);
                  setFormData(prev => ({
                    ...prev,
                    healthData: { ...prev.healthData!, checkType: checkType! }
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
              >
                {healthCheckTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.healthData?.temperature || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    healthData: { ...prev.healthData!, temperature: parseFloat(e.target.value) || undefined }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                  placeholder="38.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  value={formData.healthData?.weight || ""}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    healthData: { ...prev.healthData!, weight: parseFloat(e.target.value) || undefined }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                  placeholder="450"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnóstico
              </label>
              <input
                type="text"
                value={formData.healthData?.diagnosis || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  healthData: { ...prev.healthData!, diagnosis: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                placeholder="Descripción del diagnóstico"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tratamiento
              </label>
              <input
                type="text"
                value={formData.healthData?.treatment || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  healthData: { ...prev.healthData!, treatment: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                placeholder="Descripción del tratamiento"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pronóstico
              </label>
              <select
                value={formData.healthData?.prognosis}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  healthData: { ...prev.healthData!, prognosis: e.target.value as any }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
              >
                <option value="excellent">Excelente</option>
                <option value="good">Bueno</option>
                <option value="fair">Regular</option>
                <option value="poor">Pobre</option>
                <option value="grave">Grave</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo (MXN)
              </label>
              <input
                type="number"
                value={formData.cost || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Ubicación GPS</h3>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={async () => {
                try {
                  const location = await getCurrentLocation();
                  setFormData(prev => ({
                    ...prev,
                    location: {
                      ...prev.location!,
                      latitude: location.latitude,
                      longitude: location.longitude,
                      address: `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`,
                    }
                  }));
                } catch (error) {
                  console.error('Error obteniendo ubicación:', error);
                  alert('No se pudo obtener la ubicación actual');
                }
              }}
              className="flex items-center space-x-2 px-3 py-1 bg-[#519a7c] text-white text-sm rounded-lg hover:bg-[#4e9c75] transition-colors"
            >
              <MapPin className="h-4 w-4" />
              <span>Obtener Ubicación</span>
            </motion.button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Latitud
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.location?.latitude || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { 
                    ...prev.location!, 
                    latitude: parseFloat(e.target.value) || 0,
                    address: `${parseFloat(e.target.value) || 0}, ${prev.location?.longitude || 0}`
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                placeholder="17.986900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Longitud
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.location?.longitude || ""}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  location: { 
                    ...prev.location!, 
                    longitude: parseFloat(e.target.value) || 0,
                    address: `${prev.location?.latitude || 0}, ${parseFloat(e.target.value) || 0}`
                  }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                placeholder="-92.930300"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
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
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-lg hover:from-[#4e9c75] hover:to-[#3d7a5c] transition-colors"
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
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#519a7c] mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg font-medium">Cargando eventos de salud...</p>
        </motion.div>
      </div>
    );
  }

  // Función para obtener ubicación actual
  const getCurrentLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalización no soportada'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error obteniendo ubicación:', error);
          // Fallback a ubicación por defecto (Cunduacán, Tabasco)
          resolve({
            latitude: 17.9869,
            longitude: -92.9303,
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    });
  };

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
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-xl text-white"
              >
                <Stethoscope className="h-8 w-8" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Eventos de Salud
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona la salud y cuidado médico de tu ganado
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateEvent}
                className="flex items-center space-x-2 bg-gradient-to-r from-[#519a7c] to-[#f4ac3a] text-white px-6 py-3 rounded-xl font-medium hover:from-[#4e9c75] hover:to-[#e8a234] transition-all shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Nuevo Evento</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtros y Búsqueda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por animal, evento, diagnóstico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent bg-white/80"
              />
            </div>

            {/* Filtro por tipo de evento */}
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent bg-white/80"
            >
              <option value="all">Todos los tipos</option>
              {healthEventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            {/* Filtro por estado */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent bg-white/80"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programado</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
              <option value="emergency">Emergencia</option>
            </select>

            {/* Filtro por prioridad */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent bg-white/80"
            >
              <option value="all">Todas las prioridades</option>
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="critical">Crítica</option>
              <option value="emergency">Emergencia</option>
            </select>

            {/* Filtro por fecha */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent bg-white/80"
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
            <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay eventos de salud
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ||
              selectedEventType !== "all" ||
              selectedStatus !== "all" ||
              selectedPriority !== "all" ||
              dateFilter !== "all"
                ? "No se encontraron eventos que coincidan con los filtros aplicados."
                : "Comienza creando tu primer evento de salud."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateEvent}
              className="bg-gradient-to-r from-[#519a7c] to-[#f4ac3a] text-white px-6 py-3 rounded-xl font-medium hover:from-[#4e9c75] hover:to-[#e8a234] transition-all"
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
                    <div className={`p-2 rounded-xl bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white`}>
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
                       event.status === "cancelled" ? "Cancelado" : "Emergencia"}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(event.priority)}`}>
                      {event.priority === "low" ? "Baja" :
                       event.priority === "medium" ? "Media" :
                       event.priority === "high" ? "Alta" : 
                       event.priority === "critical" ? "Crítica" : "Emergencia"}
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
                    <span>
                      {event.location.latitude && event.location.longitude 
                        ? `${event.location.latitude.toFixed(4)}, ${event.location.longitude.toFixed(4)}`
                        : "Ubicación no disponible"
                      }
                    </span>
                  </div>

                  {event.veterinarian && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <UserCheck className="h-4 w-4" />
                      <span>{event.veterinarian.name}</span>
                    </div>
                  )}

                  {event.healthData.temperature && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Thermometer className="h-4 w-4" />
                      <span>{event.healthData.temperature}°C</span>
                    </div>
                  )}
                </div>

                {/* Datos específicos de salud */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      {event.healthData.checkType.name}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      event.healthData.prognosis === "excellent" ? "bg-green-100 text-green-800" :
                      event.healthData.prognosis === "good" ? "bg-blue-100 text-blue-800" :
                      event.healthData.prognosis === "fair" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {event.healthData.prognosis === "excellent" ? "Excelente" :
                       event.healthData.prognosis === "good" ? "Bueno" :
                       event.healthData.prognosis === "fair" ? "Regular" :
                       event.healthData.prognosis === "poor" ? "Pobre" : "Grave"}
                    </span>
                  </div>
                  
                  {event.healthData.diagnosis && (
                    <p className="text-xs text-blue-700 mb-1">
                      <strong>Diagnóstico:</strong> {event.healthData.diagnosis}
                    </p>
                  )}
                  
                  {event.healthData.treatment && (
                    <p className="text-xs text-blue-700">
                      <strong>Tratamiento:</strong> {event.healthData.treatment}
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
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                      className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
                      title="Editar evento"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEvent(event.id);
                      }}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                      title="Eliminar evento"
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
                  <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
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
                         selectedEvent.status === "cancelled" ? "Cancelado" : "Emergencia"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Prioridad:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedEvent.priority)}`}>
                        {selectedEvent.priority === "low" ? "Baja" :
                         selectedEvent.priority === "medium" ? "Media" :
                         selectedEvent.priority === "high" ? "Alta" : 
                         selectedEvent.priority === "critical" ? "Crítica" : "Emergencia"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">{formatDate(selectedEvent.scheduledDate)}</span>
                    </div>

                    {selectedEvent.veterinarian && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Veterinario:</span>
                        <span className="font-medium">{selectedEvent.veterinarian.name}</span>
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

                {/* Datos de Salud */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Datos de Salud</h3>
                  
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Tipo de Revisión:</span>
                        <span className="font-medium text-blue-900">
                          {selectedEvent.healthData.checkType.name}
                        </span>
                      </div>

                      {selectedEvent.healthData.diagnosis && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Diagnóstico:</span>
                          <span className="font-medium text-blue-900">
                            {selectedEvent.healthData.diagnosis}
                          </span>
                        </div>
                      )}

                      {selectedEvent.healthData.treatment && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Tratamiento:</span>
                          <span className="font-medium text-blue-900">
                            {selectedEvent.healthData.treatment}
                          </span>
                        </div>
                      )}

                      {selectedEvent.healthData.temperature && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Temperatura:</span>
                          <span className="font-medium text-blue-900">
                            {selectedEvent.healthData.temperature}°C
                          </span>
                        </div>
                      )}

                      {selectedEvent.healthData.weight && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Peso:</span>
                          <span className="font-medium text-blue-900">
                            {selectedEvent.healthData.weight}kg
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-blue-700">Pronóstico:</span>
                        <span className={`font-medium flex items-center space-x-1 ${
                          selectedEvent.healthData.prognosis === "excellent" ? "text-green-700" :
                          selectedEvent.healthData.prognosis === "good" ? "text-blue-700" :
                          selectedEvent.healthData.prognosis === "fair" ? "text-yellow-700" :
                          "text-red-700"
                        }`}>
                          {selectedEvent.healthData.prognosis === "excellent" ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>Excelente</span>
                            </>
                          ) : selectedEvent.healthData.prognosis === "good" ? (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              <span>Bueno</span>
                            </>
                          ) : selectedEvent.healthData.prognosis === "fair" ? (
                            <>
                              <Clock className="h-4 w-4" />
                              <span>Regular</span>
                            </>
                          ) : selectedEvent.healthData.prognosis === "poor" ? (
                            <>
                              <XCircle className="h-4 w-4" />
                              <span>Pobre</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="h-4 w-4" />
                              <span>Grave</span>
                            </>
                          )}
                        </span>
                      </div>
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
                <h3 className="text-lg font-medium text-gray-900 mb-3">Ubicación GPS</h3>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700">Latitud:</span>
                      <p className="text-green-900">
                        {selectedEvent.location.latitude ? selectedEvent.location.latitude.toFixed(6) : "No disponible"}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Longitud:</span>
                      <p className="text-green-900">
                        {selectedEvent.location.longitude ? selectedEvent.location.longitude.toFixed(6) : "No disponible"}
                      </p>
                    </div>
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
                  className="flex items-center space-x-2 px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4e9c75] transition-colors"
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