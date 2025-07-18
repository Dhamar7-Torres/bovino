import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Stethoscope,
  Thermometer,
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
  Pill,
  Bandage,
  Monitor,
  Weight,
  Wind,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Interfaces para TypeScript
interface HealthEvent {
  id: string;
  bovineId: string;
  bovineName: string;
  bovineTag: string;
  eventType: HealthEventType;
  status: "scheduled" | "completed" | "in_progress" | "cancelled" | "urgent";
  priority: "low" | "medium" | "high" | "critical";
  scheduledDate: string;
  completedDate?: string;
  location: Location;
  healthData: {
    checkType: CheckType;
    symptoms?: Symptom[];
    diagnosis?: Diagnosis;
    vitalSigns?: VitalSigns;
    physicalExamination?: PhysicalExamination;
    laboratoryTests?: LabTest[];
    treatments?: Treatment[];
    medications?: Medication[];
    followUpRequired: boolean;
    followUpDate?: string;
    prognosis?: "excellent" | "good" | "fair" | "poor" | "grave";
    quarantineRequired?: boolean;
    quarantineDuration?: number;
    contagious?: boolean;
    reportableDisease?: boolean;
  };
  veterinarian: VeterinarianInfo;
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
  category: "checkup" | "emergency" | "treatment" | "prevention" | "monitoring";
  requiresVeterinarian: boolean;
  urgencyLevel: number; // 1-5
}

interface CheckType {
  id: string;
  name: string;
  description: string;
  standardProcedures: string[];
  estimatedDuration: number;
  cost: number;
}

interface Symptom {
  id: string;
  name: string;
  severity: "mild" | "moderate" | "severe" | "critical";
  duration: string;
  onset: "sudden" | "gradual";
  description: string;
  bodySystem:
    | "respiratory"
    | "digestive"
    | "nervous"
    | "reproductive"
    | "musculoskeletal"
    | "skin"
    | "circulatory";
}

interface Diagnosis {
  id: string;
  condition: string;
  certainty: "confirmed" | "suspected" | "differential" | "ruled_out";
  code?: string; // Código veterinario internacional
  description: string;
  causes: string[];
  riskFactors: string[];
  complications: string[];
  treatment: string;
  prevention: string;
}

interface VitalSigns {
  temperature: number; // °C
  heartRate: number; // bpm
  respiratoryRate: number; // rpm
  bloodPressure?: {
    systolic: number;
    diastolic: number;
  };
  weight: number; // kg
  bodyConditionScore: number; // 1-5
  mucousMembranes: "pink" | "pale" | "yellow" | "blue" | "red";
  capillaryRefillTime: number; // segundos
  hydrationStatus:
    | "normal"
    | "mild_dehydration"
    | "moderate_dehydration"
    | "severe_dehydration";
  attitude: "alert" | "depressed" | "lethargic" | "excited" | "aggressive";
}

interface PhysicalExamination {
  generalAppearance: string;
  headAndNeck: string;
  eyes: string;
  ears: string;
  nose: string;
  mouth: string;
  lymphNodes: string;
  chest: string;
  abdomen: string;
  limbs: string;
  skin: string;
  udder?: string;
  reproductiveSystem?: string;
  neurologicalAssessment?: string;
  locomotion: "normal" | "lame" | "stiff" | "ataxic" | "down";
}

interface LabTest {
  id: string;
  testType: string;
  sampleType: "blood" | "urine" | "feces" | "milk" | "tissue" | "swab";
  requestDate: string;
  resultDate?: string;
  results?: {
    parameter: string;
    value: string;
    unit: string;
    reference: string;
    status: "normal" | "abnormal" | "critical";
  }[];
  interpretation?: string;
  cost: number;
  laboratory: string;
}

interface Treatment {
  id: string;
  procedure: string;
  description: string;
  duration: number;
  success: boolean;
  complications?: string[];
  cost: number;
  performedBy: string;
  notes?: string;
}

interface Medication {
  id: string;
  name: string;
  activeIngredient: string;
  dosage: string;
  route:
    | "oral"
    | "injection"
    | "topical"
    | "intravenous"
    | "intramuscular"
    | "subcutaneous";
  frequency: string;
  duration: number; // días
  startDate: string;
  endDate: string;
  withdrawalPeriod: number; // días
  cost: number;
  sideEffects?: string[];
  contraindications?: string[];
  notes?: string;
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
  type: "medication" | "follow_up" | "lab_result" | "quarantine_end";
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

interface HealthStatistics {
  totalEvents: number;
  emergencyEvents: number;
  preventiveEvents: number;
  treatmentEvents: number;
  averageResponseTime: number; // minutos
  mortalityRate: number; // %
  recoveryRate: number; // %
  mostCommonConditions: { condition: string; count: number }[];
  averageTreatmentCost: number;
  quarantinedAnimals: number;
  upcomingFollowUps: number;
  medicationsActive: number;
}

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
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<HealthEvent | null>(null);
  const [statistics, setStatistics] = useState<HealthStatistics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [emergencyAlerts, setEmergencyAlerts] = useState<HealthEvent[]>([]);

  // Hooks de React Router
  const navigate = useNavigate();

  // Tipos de eventos de salud
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
      id: "preventive_care",
      name: "Cuidado Preventivo",
      icon: Shield,
      color: "text-purple-600",
      description: "Medicina preventiva y profilaxis",
      category: "prevention",
      requiresVeterinarian: false,
      urgencyLevel: 1,
    },
    {
      id: "health_monitoring",
      name: "Monitoreo de Salud",
      icon: Monitor,
      color: "text-cyan-600",
      description: "Seguimiento continuo del estado de salud",
      category: "monitoring",
      requiresVeterinarian: false,
      urgencyLevel: 2,
    },
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const loadHealthEvents = async () => {
      setLoading(true);
      try {
        // Simular carga de datos desde la API
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Datos simulados para desarrollo
        const mockEvents: HealthEvent[] = [
          {
            id: "1",
            bovineId: "bov_001",
            bovineName: "Esperanza",
            bovineTag: "ESP-001",
            eventType: healthEventTypes[1], // Emergencia
            status: "completed",
            priority: "critical",
            scheduledDate: "2024-12-20T14:30:00Z",
            completedDate: "2024-12-20T15:45:00Z",
            location: {
              latitude: 17.9869,
              longitude: -92.9303,
              address: "Potrero Norte, Rancho El Progreso",
              farm: "El Progreso",
              section: "Potrero Norte",
              facility: "Campo Abierto",
            },
            healthData: {
              checkType: {
                id: "emergency_exam",
                name: "Examen de Emergencia",
                description: "Evaluación médica urgente",
                standardProcedures: [
                  "Evaluación vital",
                  "Diagnóstico diferencial",
                  "Tratamiento inmediato",
                ],
                estimatedDuration: 60,
                cost: 350.0,
              },
              symptoms: [
                {
                  id: "resp_distress",
                  name: "Dificultad Respiratoria",
                  severity: "severe",
                  duration: "2 horas",
                  onset: "sudden",
                  description: "Respiración laboriosa con ruidos audibles",
                  bodySystem: "respiratory",
                },
                {
                  id: "high_temp",
                  name: "Fiebre Alta",
                  severity: "severe",
                  duration: "3 horas",
                  onset: "gradual",
                  description: "Temperatura corporal elevada",
                  bodySystem: "circulatory",
                },
              ],
              diagnosis: {
                id: "pneumonia_bacterial",
                condition: "Neumonía Bacteriana",
                certainty: "confirmed",
                code: "J15.9",
                description: "Infección bacteriana aguda de los pulmones",
                causes: ["Streptococcus spp.", "Pasteurella spp."],
                riskFactors: ["Estrés", "Cambios climáticos", "Hacinamiento"],
                complications: ["Septicemia", "Insuficiencia respiratoria"],
                treatment: "Antibióticos de amplio espectro, antiinflamatorios",
                prevention: "Vacunación, manejo sanitario adecuado",
              },
              vitalSigns: {
                temperature: 40.5,
                heartRate: 95,
                respiratoryRate: 45,
                weight: 450,
                bodyConditionScore: 3,
                mucousMembranes: "pale",
                capillaryRefillTime: 3,
                hydrationStatus: "mild_dehydration",
                attitude: "depressed",
              },
              physicalExamination: {
                generalAppearance: "Animal deprimido, posición ortopneica",
                headAndNeck: "Sin alteraciones significativas",
                eyes: "Ligeramente hundidos, secreción serosa",
                ears: "Normales",
                nose: "Secreción mucopurulenta bilateral",
                mouth: "Mucosas pálidas",
                lymphNodes: "Submandibulares aumentados",
                chest: "Crepitaciones bilaterales, matidez en base pulmonar",
                abdomen: "Sin alteraciones",
                limbs: "Sin cojeras",
                skin: "Elasticidad disminuida",
                locomotion: "normal",
              },
              laboratoryTests: [
                {
                  id: "cbc_001",
                  testType: "Hemograma Completo",
                  sampleType: "blood",
                  requestDate: "2024-12-20T15:00:00Z",
                  resultDate: "2024-12-20T18:00:00Z",
                  results: [
                    {
                      parameter: "Leucocitos",
                      value: "15.2",
                      unit: "x10³/μL",
                      reference: "4.0-12.0",
                      status: "abnormal",
                    },
                    {
                      parameter: "Neutrófilos",
                      value: "82",
                      unit: "%",
                      reference: "15-45",
                      status: "critical",
                    },
                  ],
                  interpretation:
                    "Leucocitosis con neutrofilia, compatible con infección bacteriana",
                  cost: 80.0,
                  laboratory: "Lab Veterinario Central",
                },
              ],
              treatments: [
                {
                  id: "antibiotic_therapy",
                  procedure: "Terapia Antibiótica",
                  description:
                    "Administración de antibióticos de amplio espectro",
                  duration: 45,
                  success: true,
                  cost: 150.0,
                  performedBy: "Dr. García",
                  notes: "Respuesta favorable al tratamiento",
                },
              ],
              medications: [
                {
                  id: "amoxicillin",
                  name: "Amoxicilina",
                  activeIngredient: "Amoxicillin trihydrate",
                  dosage: "15 mg/kg",
                  route: "intramuscular",
                  frequency: "Cada 12 horas",
                  duration: 7,
                  startDate: "2024-12-20T16:00:00Z",
                  endDate: "2024-12-27T16:00:00Z",
                  withdrawalPeriod: 21,
                  cost: 45.0,
                  sideEffects: ["Reacciones alérgicas"],
                  contraindications: ["Hipersensibilidad a penicilinas"],
                },
              ],
              followUpRequired: true,
              followUpDate: "2024-12-25T10:00:00Z",
              prognosis: "good",
              quarantineRequired: false,
              contagious: true,
              reportableDisease: false,
            },
            veterinarian: {
              id: "vet_001",
              name: "Dr. María García",
              license: "VET-2024-001",
              specialization: "Medicina Interna Bovina",
              phone: "+52 993 123 4567",
              email: "maria.garcia@vet.com",
              clinic: "Clínica Veterinaria El Campo",
              emergencyContact: true,
            },
            cost: 625.0,
            insurance: {
              covered: true,
              claimNumber: "CLM-2024-156",
              coverage: 80,
            },
            notes:
              "Respuesta excelente al tratamiento. Animal recuperado completamente. Continuar con medicación según prescripción.",
            attachments: [
              {
                id: "att_001",
                name: "radiografia_torax.jpg",
                type: "xray",
                url: "/attachments/xray_001.jpg",
                description:
                  "Radiografía de tórax mostrando consolidación pulmonar",
                uploadedAt: "2024-12-20T16:30:00Z",
                size: 2048000,
              },
            ],
            reminders: [
              {
                id: "rem_001",
                type: "follow_up",
                message: "Revisión post-tratamiento programada",
                dueDate: "2024-12-25T10:00:00Z",
                completed: false,
              },
              {
                id: "rem_002",
                type: "medication",
                message: "Completar curso de antibióticos",
                dueDate: "2024-12-27T16:00:00Z",
                completed: false,
              },
            ],
            createdAt: "2024-12-20T14:30:00Z",
            updatedAt: "2024-12-20T15:45:00Z",
            createdBy: "user_001",
            weatherConditions: {
              temperature: 28,
              humidity: 85,
              condition: "Lluvioso",
              windSpeed: 15,
              precipitation: 12,
            },
          },
          {
            id: "2",
            bovineId: "bov_002",
            bovineName: "Paloma",
            bovineTag: "PAL-002",
            eventType: healthEventTypes[0], // Rutina
            status: "scheduled",
            priority: "medium",
            scheduledDate: "2024-12-25T09:00:00Z",
            location: {
              latitude: 17.9869,
              longitude: -92.9303,
              address: "Corral Principal, Rancho El Progreso",
              farm: "El Progreso",
              section: "Corral Principal",
              facility: "Manga de Trabajo",
            },
            healthData: {
              checkType: {
                id: "routine_health",
                name: "Chequeo de Salud Rutinario",
                description: "Examen preventivo general",
                standardProcedures: [
                  "Examen físico",
                  "Signos vitales",
                  "Evaluación nutricional",
                ],
                estimatedDuration: 30,
                cost: 120.0,
              },
              followUpRequired: false,
              prognosis: "excellent",
            },
            veterinarian: {
              id: "vet_002",
              name: "Dr. Carlos López",
              license: "VET-2024-002",
              specialization: "Medicina Preventiva",
              phone: "+52 993 987 6543",
              email: "carlos.lopez@vet.com",
              clinic: "Centro Veterinario Tabasco",
              emergencyContact: false,
            },
            cost: 120.0,
            notes:
              "Chequeo preventivo programado como parte del protocolo sanitario.",
            attachments: [],
            reminders: [
              {
                id: "rem_003",
                type: "follow_up",
                message: "Chequeo rutinario programado",
                dueDate: "2024-12-25T08:30:00Z",
                completed: false,
              },
            ],
            createdAt: "2024-12-15T10:00:00Z",
            updatedAt: "2024-12-15T10:00:00Z",
            createdBy: "user_001",
          },
        ];

        setHealthEvents(mockEvents);

        // Identificar emergencias
        const emergencies = mockEvents.filter(
          (event) =>
            event.priority === "critical" || event.eventType.urgencyLevel >= 4
        );
        setEmergencyAlerts(emergencies);

        // Calcular estadísticas simuladas
        const mockStatistics: HealthStatistics = {
          totalEvents: 89,
          emergencyEvents: 12,
          preventiveEvents: 45,
          treatmentEvents: 32,
          averageResponseTime: 35,
          mortalityRate: 2.1,
          recoveryRate: 94.7,
          mostCommonConditions: [
            { condition: "Mastitis", count: 15 },
            { condition: "Cojera", count: 12 },
            { condition: "Diarrea", count: 8 },
            { condition: "Neumonía", count: 6 },
          ],
          averageTreatmentCost: 285.5,
          quarantinedAnimals: 2,
          upcomingFollowUps: 8,
          medicationsActive: 15,
        };

        setStatistics(mockStatistics);
      } catch (error) {
        console.error("Error cargando eventos de salud:", error);
      } finally {
        setLoading(false);
      }
    };

    loadHealthEvents();
  }, []);

  // Filtrar eventos basado en los criterios seleccionados
  useEffect(() => {
    let filtered = healthEvents;

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.bovineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.bovineTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.eventType.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          event.healthData.diagnosis?.condition
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
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

    // Filtro por prioridad
    if (selectedPriority !== "all") {
      filtered = filtered.filter(
        (event) => event.priority === selectedPriority
      );
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
        case "overdue":
          filtered = filtered.filter((event) => {
            const eDate = new Date(event.scheduledDate);
            return eDate < now && event.status !== "completed";
          });
          break;
      }
    }

    setFilteredEvents(filtered);
  }, [
    healthEvents,
    searchTerm,
    selectedEventType,
    selectedStatus,
    selectedPriority,
    dateFilter,
  ]);

  // Funciones para manejar eventos
  const handleCreateEvent = () => {
    navigate("/events/create?type=health_check");
  };

  const handleViewEvent = (event: HealthEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleEditEvent = (eventId: string) => {
    navigate(`/events/edit/${eventId}`);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este evento de salud?")) {
      setHealthEvents((prev) => prev.filter((event) => event.id !== eventId));
    }
  };

  const handleEmergencyResponse = (eventId: string) => {
    navigate(`/events/detail/${eventId}`);
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "text-blue-600 bg-blue-100",
      completed: "text-green-600 bg-green-100",
      in_progress: "text-yellow-600 bg-yellow-100",
      cancelled: "text-red-600 bg-red-100",
      urgent: "text-red-600 bg-red-100 animate-pulse",
    };
    return colors[status as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  // Función para obtener el color de la prioridad
  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-600 bg-green-100",
      medium: "text-yellow-600 bg-yellow-100",
      high: "text-orange-600 bg-orange-100",
      critical: "text-red-600 bg-red-100 font-bold",
    };
    return (
      colors[priority as keyof typeof colors] || "text-gray-600 bg-gray-100"
    );
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

  // Función para obtener el ícono de urgencia
  const getUrgencyIcon = (urgencyLevel: number) => {
    if (urgencyLevel >= 4)
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (urgencyLevel >= 3)
      return <AlertCircle className="h-4 w-4 text-orange-500" />;
    return <Info className="h-4 w-4 text-blue-500" />;
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando eventos de salud...</p>
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
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white"
              >
                <Heart className="h-8 w-8" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Eventos de Salud
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona la salud y bienestar de tu ganado
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {emergencyAlerts.length > 0 && (
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-xl border border-red-200"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span className="font-medium">
                    {emergencyAlerts.length} Emergencia(s)
                  </span>
                </motion.div>
              )}

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
                className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-red-700 hover:to-pink-700 transition-all shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Nuevo Evento</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Alertas de Emergencia */}
      {emergencyAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
        >
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-red-900 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Alertas de Emergencia
              </h2>
              <span className="text-sm text-red-700">
                Requieren atención inmediata
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {emergencyAlerts.map((alert) => (
                <motion.div
                  key={alert.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleEmergencyResponse(alert.id)}
                  className="bg-white border border-red-200 rounded-xl p-3 cursor-pointer hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-red-900">
                      {alert.bovineName}
                    </span>
                    <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
                      {alert.bovineTag}
                    </span>
                  </div>
                  <p className="text-sm text-red-700">{alert.eventType.name}</p>
                  <p className="text-xs text-red-600 mt-1">
                    {formatDate(alert.scheduledDate)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Estadísticas */}
      {statistics && (
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
                  <p className="text-sm font-medium text-gray-600">
                    Tasa de Recuperación
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {statistics.recoveryRate}%
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {statistics.totalEvents} eventos totales
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
                    Tiempo de Respuesta
                  </p>
                  <p className="text-3xl font-bold text-blue-600">
                    {statistics.averageResponseTime} min
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Promedio de respuesta
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Clock className="h-8 w-8 text-blue-600" />
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
                    Costo Promedio
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    ${statistics.averageTreatmentCost}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Por tratamiento</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <DollarSign className="h-8 w-8 text-purple-600" />
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
                    Seguimientos Pendientes
                  </p>
                  <p className="text-3xl font-bold text-orange-600">
                    {statistics.upcomingFollowUps}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {statistics.medicationsActive} medicaciones activas
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Bell className="h-8 w-8 text-orange-600" />
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Panel de Analíticas (Expandible) */}
      <AnimatePresence>
        {showAnalytics && statistics && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
          >
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Panel de Salud y Analíticas
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
                    Distribución de Eventos de Salud
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Shield className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-sm text-gray-600">Preventivos</p>
                      <p className="text-xl font-bold text-green-600">
                        {statistics.preventiveEvents}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Pill className="h-8 w-8 text-blue-600" />
                      </div>
                      <p className="text-sm text-gray-600">Tratamientos</p>
                      <p className="text-xl font-bold text-blue-600">
                        {statistics.treatmentEvents}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                      </div>
                      <p className="text-sm text-gray-600">Emergencias</p>
                      <p className="text-xl font-bold text-red-600">
                        {statistics.emergencyEvents}
                      </p>
                    </div>

                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Monitor className="h-8 w-8 text-purple-600" />
                      </div>
                      <p className="text-sm text-gray-600">Monitoreos</p>
                      <p className="text-xl font-bold text-purple-600">
                        {statistics.totalEvents -
                          statistics.preventiveEvents -
                          statistics.treatmentEvents -
                          statistics.emergencyEvents}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Condiciones Más Comunes */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Condiciones Más Comunes
                  </h3>
                  <div className="space-y-3">
                    {statistics.mostCommonConditions.map((condition, index) => (
                      <div
                        key={condition.condition}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <span
                            className={`w-3 h-3 rounded-full ${
                              index === 0
                                ? "bg-red-500"
                                : index === 1
                                ? "bg-orange-500"
                                : index === 2
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                            }`}
                          ></span>
                          <span className="text-sm text-gray-700">
                            {condition.condition}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {condition.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Métricas de Rendimiento */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-xl p-4">
                  <h4 className="font-medium text-green-900 mb-2">
                    Tasa de Recuperación
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-green-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{ width: `${statistics.recoveryRate}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-green-900">
                      {statistics.recoveryRate}%
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Excelente desempeño
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Tiempo de Respuesta
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-blue-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full"
                        style={{ width: "75%" }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-blue-900">
                      {statistics.averageResponseTime} min
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    Dentro del objetivo
                  </p>
                </div>

                <div className="bg-red-50 rounded-xl p-4">
                  <h4 className="font-medium text-red-900 mb-2">
                    Tasa de Mortalidad
                  </h4>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-red-200 rounded-full h-3">
                      <div
                        className="bg-red-600 h-3 rounded-full"
                        style={{ width: `${statistics.mortalityRate * 10}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-red-900">
                      {statistics.mortalityRate}%
                    </span>
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    Muy bajo - Excelente
                  </p>
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
                placeholder="Buscar por vaca, diagnóstico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/80"
              />
            </div>

            {/* Filtro por tipo de evento */}
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/80"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programado</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
              <option value="urgent">Urgente</option>
            </select>

            {/* Filtro por prioridad */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/80"
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white/80"
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
              className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:from-red-700 hover:to-pink-700 transition-all"
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
                    <div
                      className={`p-2 rounded-xl bg-gradient-to-r ${
                        event.eventType.color.includes("red")
                          ? "from-red-500 to-red-600"
                          : event.eventType.color.includes("green")
                          ? "from-green-500 to-green-600"
                          : event.eventType.color.includes("blue")
                          ? "from-blue-500 to-blue-600"
                          : event.eventType.color.includes("orange")
                          ? "from-orange-500 to-orange-600"
                          : event.eventType.color.includes("purple")
                          ? "from-purple-500 to-purple-600"
                          : "from-cyan-500 to-cyan-600"
                      } text-white`}
                    >
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
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {event.status === "scheduled"
                        ? "Programado"
                        : event.status === "completed"
                        ? "Completado"
                        : event.status === "in_progress"
                        ? "En Progreso"
                        : event.status === "cancelled"
                        ? "Cancelado"
                        : "Urgente"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                        event.priority
                      )}`}
                    >
                      {event.priority === "low"
                        ? "Baja"
                        : event.priority === "medium"
                        ? "Media"
                        : event.priority === "high"
                        ? "Alta"
                        : "Crítica"}
                    </span>
                  </div>
                </div>

                {/* Información del diagnóstico */}
                {event.healthData.diagnosis && (
                  <div className="bg-blue-50 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-900">
                        {event.healthData.diagnosis.condition}
                      </h4>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.healthData.diagnosis.certainty === "confirmed"
                            ? "bg-green-100 text-green-800"
                            : event.healthData.diagnosis.certainty ===
                              "suspected"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.healthData.diagnosis.certainty === "confirmed"
                          ? "Confirmado"
                          : event.healthData.diagnosis.certainty === "suspected"
                          ? "Sospecha"
                          : event.healthData.diagnosis.certainty ===
                            "differential"
                          ? "Diferencial"
                          : "Descartado"}
                      </span>
                    </div>
                    <p className="text-sm text-blue-800">
                      {event.healthData.diagnosis.description}
                    </p>
                  </div>
                )}

                {/* Signos vitales */}
                {event.healthData.vitalSigns && (
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-red-50 rounded-lg p-2 text-center">
                      <Thermometer className="h-4 w-4 text-red-600 mx-auto mb-1" />
                      <p className="text-xs text-red-700">Temperatura</p>
                      <p className="text-sm font-bold text-red-900">
                        {event.healthData.vitalSigns.temperature}°C
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 text-center">
                      <Activity className="h-4 w-4 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-green-700">Pulso</p>
                      <p className="text-sm font-bold text-green-900">
                        {event.healthData.vitalSigns.heartRate} bpm
                      </p>
                    </div>
                  </div>
                )}

                {/* Información del evento */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.scheduledDate)}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {event.location.facility || event.location.section}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{event.veterinarian.name}</span>
                  </div>

                  {event.cost && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>${event.cost.toFixed(2)}</span>
                      {event.insurance?.covered && (
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                          {event.insurance.coverage}% cubierto
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Medicaciones activas */}
                {event.healthData.medications &&
                  event.healthData.medications.length > 0 && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-purple-900">
                          Medicaciones
                        </span>
                        <span className="text-xs text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                          {event.healthData.medications.length} activa(s)
                        </span>
                      </div>
                      <div className="space-y-1">
                        {event.healthData.medications
                          .slice(0, 2)
                          .map((med, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-xs"
                            >
                              <span className="text-purple-800">
                                {med.name}
                              </span>
                              <span className="text-purple-600">
                                {med.dosage}
                              </span>
                            </div>
                          ))}
                        {event.healthData.medications.length > 2 && (
                          <p className="text-xs text-purple-600 text-center">
                            +{event.healthData.medications.length - 2} más
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                {/* Seguimiento requerido */}
                {event.healthData.followUpRequired && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Bell className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-900">
                        Seguimiento Requerido
                      </span>
                    </div>
                    {event.healthData.followUpDate && (
                      <p className="text-xs text-yellow-700 mt-1">
                        {formatDate(event.healthData.followUpDate)}
                      </p>
                    )}
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

                    {event.healthData.quarantineRequired && (
                      <div className="flex items-center space-x-1 text-xs text-red-600">
                        <Shield className="h-3 w-3" />
                        <span>Cuarentena</span>
                      </div>
                    )}

                    {event.healthData.contagious && (
                      <div className="flex items-center space-x-1 text-xs text-orange-600">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Contagioso</span>
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
              className="bg-white rounded-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-xl ${
                      selectedEvent.eventType.color.includes("red")
                        ? "bg-red-100 text-red-600"
                        : selectedEvent.eventType.color.includes("green")
                        ? "bg-green-100 text-green-600"
                        : selectedEvent.eventType.color.includes("blue")
                        ? "bg-blue-100 text-blue-600"
                        : selectedEvent.eventType.color.includes("orange")
                        ? "bg-orange-100 text-orange-600"
                        : selectedEvent.eventType.color.includes("purple")
                        ? "bg-purple-100 text-purple-600"
                        : "bg-cyan-100 text-cyan-600"
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

              {/* Contenido del modal en tabs o secciones expandidas */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información General */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Información General
                  </h3>

                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          selectedEvent.status
                        )}`}
                      >
                        {selectedEvent.status === "scheduled"
                          ? "Programado"
                          : selectedEvent.status === "completed"
                          ? "Completado"
                          : selectedEvent.status === "in_progress"
                          ? "En Progreso"
                          : selectedEvent.status === "cancelled"
                          ? "Cancelado"
                          : "Urgente"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Prioridad:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                          selectedEvent.priority
                        )}`}
                      >
                        {selectedEvent.priority === "low"
                          ? "Baja"
                          : selectedEvent.priority === "medium"
                          ? "Media"
                          : selectedEvent.priority === "high"
                          ? "Alta"
                          : "Crítica"}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">
                        {formatDate(selectedEvent.scheduledDate)}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Veterinario:</span>
                      <span className="font-medium">
                        {selectedEvent.veterinarian.name}
                      </span>
                    </div>

                    {selectedEvent.cost && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Costo:</span>
                        <span className="font-medium">
                          ${selectedEvent.cost.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Diagnóstico */}
                  {selectedEvent.healthData.diagnosis && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-3">
                        Diagnóstico
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-blue-700 text-sm">
                            Condición:
                          </span>
                          <p className="font-medium text-blue-900">
                            {selectedEvent.healthData.diagnosis.condition}
                          </p>
                        </div>
                        <div>
                          <span className="text-blue-700 text-sm">
                            Certeza:
                          </span>
                          <span
                            className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                              selectedEvent.healthData.diagnosis.certainty ===
                              "confirmed"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {selectedEvent.healthData.diagnosis.certainty ===
                            "confirmed"
                              ? "Confirmado"
                              : "Sospecha"}
                          </span>
                        </div>
                        <div>
                          <span className="text-blue-700 text-sm">
                            Descripción:
                          </span>
                          <p className="text-blue-800 text-sm mt-1">
                            {selectedEvent.healthData.diagnosis.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Signos Vitales y Examen */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Datos Clínicos
                  </h3>

                  {/* Signos Vitales */}
                  {selectedEvent.healthData.vitalSigns && (
                    <div className="bg-red-50 rounded-lg p-4">
                      <h4 className="font-medium text-red-900 mb-3">
                        Signos Vitales
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center">
                          <Thermometer className="h-5 w-5 text-red-600 mx-auto mb-1" />
                          <p className="text-xs text-red-700">Temperatura</p>
                          <p className="font-bold text-red-900">
                            {selectedEvent.healthData.vitalSigns.temperature}°C
                          </p>
                        </div>
                        <div className="text-center">
                          <Activity className="h-5 w-5 text-red-600 mx-auto mb-1" />
                          <p className="text-xs text-red-700">
                            Frecuencia Cardíaca
                          </p>
                          <p className="font-bold text-red-900">
                            {selectedEvent.healthData.vitalSigns.heartRate} bpm
                          </p>
                        </div>
                        <div className="text-center">
                          <Wind className="h-5 w-5 text-red-600 mx-auto mb-1" />
                          <p className="text-xs text-red-700">
                            Freq. Respiratoria
                          </p>
                          <p className="font-bold text-red-900">
                            {
                              selectedEvent.healthData.vitalSigns
                                .respiratoryRate
                            }{" "}
                            rpm
                          </p>
                        </div>
                        <div className="text-center">
                          <Weight className="h-5 w-5 text-red-600 mx-auto mb-1" />
                          <p className="text-xs text-red-700">Peso</p>
                          <p className="font-bold text-red-900">
                            {selectedEvent.healthData.vitalSigns.weight} kg
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-red-700">Mucosas:</span>
                          <span className="font-medium text-red-900 capitalize">
                            {
                              selectedEvent.healthData.vitalSigns
                                .mucousMembranes
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-700">Hidratación:</span>
                          <span className="font-medium text-red-900 capitalize">
                            {selectedEvent.healthData.vitalSigns.hydrationStatus.replace(
                              "_",
                              " "
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-700">Actitud:</span>
                          <span className="font-medium text-red-900 capitalize">
                            {selectedEvent.healthData.vitalSigns.attitude}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Síntomas */}
                  {selectedEvent.healthData.symptoms &&
                    selectedEvent.healthData.symptoms.length > 0 && (
                      <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-medium text-orange-900 mb-3">
                          Síntomas Observados
                        </h4>
                        <div className="space-y-2">
                          {selectedEvent.healthData.symptoms.map(
                            (symptom, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-orange-800">
                                  {symptom.name}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    symptom.severity === "critical"
                                      ? "bg-red-100 text-red-800"
                                      : symptom.severity === "severe"
                                      ? "bg-orange-100 text-orange-800"
                                      : symptom.severity === "moderate"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {symptom.severity === "critical"
                                    ? "Crítico"
                                    : symptom.severity === "severe"
                                    ? "Severo"
                                    : symptom.severity === "moderate"
                                    ? "Moderado"
                                    : "Leve"}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Tratamientos y Medicaciones */}
              {(selectedEvent.healthData.treatments ||
                selectedEvent.healthData.medications) && (
                <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Tratamientos */}
                  {selectedEvent.healthData.treatments &&
                    selectedEvent.healthData.treatments.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-4">
                        <h4 className="font-medium text-purple-900 mb-3">
                          Tratamientos Realizados
                        </h4>
                        <div className="space-y-3">
                          {selectedEvent.healthData.treatments.map(
                            (treatment, index) => (
                              <div
                                key={index}
                                className="border-l-4 border-purple-400 pl-3"
                              >
                                <h5 className="font-medium text-purple-900">
                                  {treatment.procedure}
                                </h5>
                                <p className="text-sm text-purple-800">
                                  {treatment.description}
                                </p>
                                <div className="flex items-center justify-between mt-1 text-xs">
                                  <span className="text-purple-700">
                                    Por: {treatment.performedBy}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-full font-medium ${
                                      treatment.success
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {treatment.success
                                      ? "Exitoso"
                                      : "Con Complicaciones"}
                                  </span>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Medicaciones */}
                  {selectedEvent.healthData.medications &&
                    selectedEvent.healthData.medications.length > 0 && (
                      <div className="bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-3">
                          Medicaciones
                        </h4>
                        <div className="space-y-3">
                          {selectedEvent.healthData.medications.map(
                            (medication, index) => (
                              <div
                                key={index}
                                className="border border-green-200 rounded-lg p-3"
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="font-medium text-green-900">
                                    {medication.name}
                                  </h5>
                                  <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                    {medication.route}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                  <div>
                                    <span className="text-green-700">
                                      Dosis:
                                    </span>
                                    <span className="font-medium ml-1">
                                      {medication.dosage}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-green-700">
                                      Frecuencia:
                                    </span>
                                    <span className="font-medium ml-1">
                                      {medication.frequency}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-green-700">
                                      Duración:
                                    </span>
                                    <span className="font-medium ml-1">
                                      {medication.duration} días
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-green-700">
                                      Retiro:
                                    </span>
                                    <span className="font-medium ml-1">
                                      {medication.withdrawalPeriod} días
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Recordatorios y Seguimiento */}
              {selectedEvent.reminders.length > 0 && (
                <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-medium text-yellow-900 mb-3">
                    Recordatorios y Seguimiento
                  </h4>
                  <div className="space-y-2">
                    {selectedEvent.reminders.map((reminder, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center space-x-2">
                          <Bell className="h-4 w-4 text-yellow-600" />
                          <span className="text-yellow-800">
                            {reminder.message}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-yellow-700">
                            {formatDate(reminder.dueDate)}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reminder.completed
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {reminder.completed ? "Completado" : "Pendiente"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas */}
              {selectedEvent.notes && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Notas del Veterinario
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedEvent.notes}</p>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventHealth;
