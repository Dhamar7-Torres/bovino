import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Calendar,
  Search,
  Filter,
  Plus,
  MapPin,
  FileText,
  Syringe,
  Thermometer,
  Pill,
  Activity,
  Eye,
  Edit,
  User,
  Tag,
  TrendingUp,
  History,
  Download,
} from "lucide-react";

// Interfaces para tipos de datos
interface MedicalEvent {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  eventType:
    | "vaccination"
    | "illness"
    | "treatment"
    | "checkup"
    | "surgery"
    | "medication"
    | "exam"
    | "observation";
  title: string;
  description: string;
  date: Date;
  veterinarian: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    facility: string;
  };
  severity?: "low" | "medium" | "high" | "critical";
  status: "active" | "completed" | "ongoing" | "cancelled";
  medications?: string[];
  diagnosis?: string;
  treatment?: string;
  followUpDate?: Date;
  cost: number;
  attachments: string[];
  notes: string;
  vitalSigns?: {
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    weight: number;
  };
}

interface AnimalProfile {
  id: string;
  name: string;
  tag: string;
  breed: string;
  birthDate: Date;
  gender: "male" | "female";
  currentWeight: number;
  healthStatus: "healthy" | "sick" | "recovering" | "critical";
  lastCheckup: Date;
  totalEvents: number;
  chronicConditions: string[];
  allergies: string[];
}

interface HealthStats {
  totalEvents: number;
  vaccinationsCount: number;
  illnessesCount: number;
  treatmentsCount: number;
  averageRecoveryTime: number;
  healthScore: number;
  lastEventDate: Date;
}

// Componentes reutilizables
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
  >
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <p className="text-sm text-gray-600 mt-1">{children}</p>;

const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "success" | "danger";
  size?: "sm" | "default";
  className?: string;
}> = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Badge: React.FC<{
  children: React.ReactNode;
  variant: string;
  className?: string;
}> = ({ children, variant, className = "" }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200";
      case "sick":
        return "bg-red-100 text-red-800 border-red-200";
      case "recovering":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "vaccination":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "illness":
        return "bg-red-100 text-red-800 border-red-200";
      case "treatment":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "checkup":
        return "bg-green-100 text-green-800 border-green-200";
      case "surgery":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medication":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "exam":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "observation":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "active":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "ongoing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(
        variant
      )} ${className}`}
    >
      {children}
    </span>
  );
};

// Componente de Timeline de Eventos
const EventTimeline: React.FC<{ events: MedicalEvent[] }> = ({ events }) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "vaccination":
        return Syringe;
      case "illness":
        return Thermometer;
      case "treatment":
        return Pill;
      case "checkup":
        return Stethoscope;
      case "surgery":
        return Activity;
      case "medication":
        return Pill;
      case "exam":
        return FileText;
      case "observation":
        return Eye;
      default:
        return Activity;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "vaccination":
        return "purple";
      case "illness":
        return "red";
      case "treatment":
        return "blue";
      case "checkup":
        return "green";
      case "surgery":
        return "orange";
      case "medication":
        return "indigo";
      case "exam":
        return "cyan";
      case "observation":
        return "gray";
      default:
        return "gray";
    }
  };

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const Icon = getEventIcon(event.eventType);
        const color = getEventColor(event.eventType);

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-4"
          >
            {/* Timeline indicator */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 bg-${color}-100 rounded-full flex items-center justify-center border-2 border-${color}-200`}
              >
                <Icon className={`w-5 h-5 text-${color}-600`} />
              </div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-16 bg-gray-200 mt-2"></div>
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 min-w-0">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={event.eventType}>
                        {event.eventType === "vaccination"
                          ? "Vacunación"
                          : event.eventType === "illness"
                          ? "Enfermedad"
                          : event.eventType === "treatment"
                          ? "Tratamiento"
                          : event.eventType === "checkup"
                          ? "Chequeo"
                          : event.eventType === "surgery"
                          ? "Cirugía"
                          : event.eventType === "medication"
                          ? "Medicamento"
                          : event.eventType === "exam"
                          ? "Examen"
                          : "Observación"}
                      </Badge>
                      <Badge variant={event.status}>
                        {event.status === "active"
                          ? "Activo"
                          : event.status === "completed"
                          ? "Completado"
                          : event.status === "ongoing"
                          ? "En progreso"
                          : "Cancelado"}
                      </Badge>
                      {event.severity && (
                        <Badge variant={event.severity}>
                          {event.severity === "critical"
                            ? "Crítico"
                            : event.severity === "high"
                            ? "Alto"
                            : event.severity === "medium"
                            ? "Medio"
                            : "Bajo"}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-gray-600 mb-3">{event.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{event.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span>{event.veterinarian}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{event.location.facility}</span>
                  </div>
                </div>

                {event.vitalSigns && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <h5 className="font-medium text-gray-900 mb-2">
                      Signos Vitales
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Temperatura:</span>
                        <span className="ml-1 font-medium">
                          {event.vitalSigns.temperature}°C
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Pulso:</span>
                        <span className="ml-1 font-medium">
                          {event.vitalSigns.heartRate} bpm
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Respiración:</span>
                        <span className="ml-1 font-medium">
                          {event.vitalSigns.respiratoryRate} rpm
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Peso:</span>
                        <span className="ml-1 font-medium">
                          {event.vitalSigns.weight} kg
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {event.medications && event.medications.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-900 mb-2">
                      Medicamentos
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {event.medications.map((med, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {event.diagnosis && (
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-900 mb-1">
                      Diagnóstico
                    </h5>
                    <p className="text-gray-700 text-sm">{event.diagnosis}</p>
                  </div>
                )}

                {event.treatment && (
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-900 mb-1">
                      Tratamiento
                    </h5>
                    <p className="text-gray-700 text-sm">{event.treatment}</p>
                  </div>
                )}

                {event.notes && (
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-900 mb-1">Notas</h5>
                    <p className="text-gray-700 text-sm">{event.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Costo: ${event.cost.toLocaleString()}</span>
                  {event.followUpDate && (
                    <span>
                      Seguimiento: {event.followUpDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const MedicalHistory: React.FC = () => {
  // Estados del componente
  const [selectedAnimal, setSelectedAnimal] = useState<string>("all");
  const [animals, setAnimals] = useState<AnimalProfile[]>([]);
  const [medicalEvents, setMedicalEvents] = useState<MedicalEvent[]>([]);
  const [healthStats, setHealthStats] = useState<HealthStats>({
    totalEvents: 0,
    vaccinationsCount: 0,
    illnessesCount: 0,
    treatmentsCount: 0,
    averageRecoveryTime: 0,
    healthScore: 0,
    lastEventDate: new Date(),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30");
  const [selectedVeterinarian, setSelectedVeterinarian] =
    useState<string>("all");

  // Simulación de datos
  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Datos de ejemplo para animales
      const mockAnimals: AnimalProfile[] = [
        {
          id: "COW001",
          name: "Bessie",
          tag: "TAG-001",
          breed: "Holstein",
          birthDate: new Date("2022-03-15"),
          gender: "female",
          currentWeight: 580,
          healthStatus: "healthy",
          lastCheckup: new Date("2025-07-01"),
          totalEvents: 15,
          chronicConditions: [],
          allergies: ["Penicilina"],
        },
        {
          id: "COW002",
          name: "Luna",
          tag: "TAG-002",
          breed: "Jersey",
          birthDate: new Date("2021-11-08"),
          gender: "female",
          currentWeight: 425,
          healthStatus: "recovering",
          lastCheckup: new Date("2025-07-10"),
          totalEvents: 23,
          chronicConditions: ["Mastitis recurrente"],
          allergies: [],
        },
        {
          id: "COW003",
          name: "Estrella",
          tag: "TAG-003",
          breed: "Simmental",
          birthDate: new Date("2020-06-22"),
          gender: "female",
          currentWeight: 650,
          healthStatus: "healthy",
          lastCheckup: new Date("2025-06-28"),
          totalEvents: 31,
          chronicConditions: [],
          allergies: ["Sulfonamidas"],
        },
      ];

      // Datos de ejemplo para eventos médicos
      const mockEvents: MedicalEvent[] = [
        {
          id: "1",
          animalId: "COW001",
          animalName: "Bessie",
          animalTag: "TAG-001",
          eventType: "checkup",
          title: "Chequeo Mensual de Rutina",
          description: "Examen de salud general y evaluación reproductiva",
          date: new Date("2025-07-01"),
          veterinarian: "Dr. García",
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Establo Principal, Sector A",
            facility: "Clínica Veterinaria Principal",
          },
          status: "completed",
          cost: 150,
          attachments: [],
          notes:
            "Animal en excelente estado de salud. Todos los parámetros normales.",
          vitalSigns: {
            temperature: 38.5,
            heartRate: 72,
            respiratoryRate: 24,
            weight: 580,
          },
        },
        {
          id: "2",
          animalId: "COW001",
          animalName: "Bessie",
          animalTag: "TAG-001",
          eventType: "vaccination",
          title: "Vacuna Antiaftosa",
          description:
            "Aplicación de vacuna contra fiebre aftosa - dosis anual",
          date: new Date("2025-06-15"),
          veterinarian: "Dr. Martínez",
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Establo Principal, Sector A",
            facility: "Clínica Veterinaria Principal",
          },
          status: "completed",
          medications: ["Vacuna Antiaftosa"],
          cost: 85,
          attachments: [],
          notes: "Vacunación sin complicaciones. Próxima dosis en 12 meses.",
          followUpDate: new Date("2026-06-15"),
        },
        {
          id: "3",
          animalId: "COW002",
          animalName: "Luna",
          animalTag: "TAG-002",
          eventType: "illness",
          title: "Mastitis Clínica",
          description: "Inflamación aguda de la glándula mamaria",
          date: new Date("2025-07-08"),
          veterinarian: "Dr. López",
          location: {
            lat: 17.9719,
            lng: -92.9456,
            address: "Sector Norte, Establo B",
            facility: "Clínica Veterinaria Norte",
          },
          severity: "medium",
          status: "ongoing",
          diagnosis: "Mastitis clínica en cuarto anterior derecho",
          treatment: "Antibioterapia sistémica y tratamiento intramamario",
          medications: ["Ceftriaxona", "Antiinflamatorio"],
          cost: 320,
          attachments: [],
          notes:
            "Respuesta favorable al tratamiento. Continuar terapia por 5 días más.",
          vitalSigns: {
            temperature: 39.2,
            heartRate: 85,
            respiratoryRate: 28,
            weight: 425,
          },
          followUpDate: new Date("2025-07-15"),
        },
        {
          id: "4",
          animalId: "COW003",
          animalName: "Estrella",
          animalTag: "TAG-003",
          eventType: "surgery",
          title: "Cesárea de Emergencia",
          description: "Intervención quirúrgica por distocia",
          date: new Date("2025-06-25"),
          veterinarian: "Dr. Hernández",
          location: {
            lat: 17.9589,
            lng: -92.9289,
            address: "Corral Sur, Sector C",
            facility: "Quirófano Móvil",
          },
          severity: "high",
          status: "completed",
          diagnosis: "Distocia por presentación anormal del feto",
          treatment: "Cesárea con anestesia epidural y sedación",
          medications: ["Lidocaína", "Xilacina", "Antibióticos profilácticos"],
          cost: 1200,
          attachments: [],
          notes:
            "Cirugía exitosa. Madre y cría en buen estado. Recuperación satisfactoria.",
          vitalSigns: {
            temperature: 38.8,
            heartRate: 78,
            respiratoryRate: 26,
            weight: 650,
          },
          followUpDate: new Date("2025-07-02"),
        },
      ];

      // Estadísticas de ejemplo
      const mockStats: HealthStats = {
        totalEvents: 47,
        vaccinationsCount: 18,
        illnessesCount: 12,
        treatmentsCount: 15,
        averageRecoveryTime: 8.5,
        healthScore: 92,
        lastEventDate: new Date("2025-07-10"),
      };

      setAnimals(mockAnimals);
      setMedicalEvents(mockEvents);
      setHealthStats(mockStats);
    };

    loadData();
  }, []);

  // Filtrar eventos médicos
  const filteredEvents = medicalEvents.filter((event) => {
    const matchesAnimal =
      selectedAnimal === "all" || event.animalId === selectedAnimal;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.animalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEventType =
      selectedEventType === "all" || event.eventType === selectedEventType;
    const matchesVeterinarian =
      selectedVeterinarian === "all" ||
      event.veterinarian === selectedVeterinarian;

    return (
      matchesAnimal && matchesSearch && matchesEventType && matchesVeterinarian
    );
  });

  // Obtener perfil del animal seleccionado
  const selectedAnimalProfile =
    selectedAnimal !== "all"
      ? animals.find((a) => a.id === selectedAnimal)
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Historial Médico
              </h1>
              <p className="text-gray-600 mt-1">
                Registro completo de eventos médicos del ganado
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Evento
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Estadísticas Generales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white/80 backdrop-blur-md border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <History className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total de Eventos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {healthStats.totalEvents}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Syringe className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Vacunaciones
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {healthStats.vaccinationsCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Thermometer className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Enfermedades
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {healthStats.illnessesCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Score de Salud
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {healthStats.healthScore}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Panel de Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Filtros */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filtros de Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Evento, animal, descripción..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Animal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animal
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedAnimal}
                    onChange={(e) => setSelectedAnimal(e.target.value)}
                  >
                    <option value="all">Todos los animales</option>
                    {animals.map((animal) => (
                      <option key={animal.id} value={animal.id}>
                        {animal.name} ({animal.tag})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de evento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Evento
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="vaccination">Vacunaciones</option>
                    <option value="illness">Enfermedades</option>
                    <option value="treatment">Tratamientos</option>
                    <option value="checkup">Chequeos</option>
                    <option value="surgery">Cirugías</option>
                    <option value="medication">Medicamentos</option>
                    <option value="exam">Exámenes</option>
                    <option value="observation">Observaciones</option>
                  </select>
                </div>

                {/* Veterinario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veterinario
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedVeterinarian}
                    onChange={(e) => setSelectedVeterinarian(e.target.value)}
                  >
                    <option value="all">Todos los veterinarios</option>
                    <option value="Dr. García">Dr. García</option>
                    <option value="Dr. Martínez">Dr. Martínez</option>
                    <option value="Dr. López">Dr. López</option>
                    <option value="Dr. Hernández">Dr. Hernández</option>
                  </select>
                </div>

                {/* Período */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                  >
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="90">Últimos 3 meses</option>
                    <option value="365">Último año</option>
                    <option value="all">Todo el historial</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Perfil del Animal Seleccionado */}
            {selectedAnimalProfile && (
              <Card className="bg-white/80 backdrop-blur-md border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="w-5 h-5 text-green-600" />
                    Perfil del Animal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      {selectedAnimalProfile.name}
                    </h3>
                    <p className="text-gray-600">{selectedAnimalProfile.tag}</p>
                    <Badge
                      variant={selectedAnimalProfile.healthStatus}
                      className="mt-2"
                    >
                      {selectedAnimalProfile.healthStatus === "healthy"
                        ? "Saludable"
                        : selectedAnimalProfile.healthStatus === "sick"
                        ? "Enfermo"
                        : selectedAnimalProfile.healthStatus === "recovering"
                        ? "Recuperándose"
                        : "Crítico"}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Raza:</span>
                      <span className="font-medium">
                        {selectedAnimalProfile.breed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Edad:</span>
                      <span className="font-medium">
                        {Math.floor(
                          (new Date().getTime() -
                            selectedAnimalProfile.birthDate.getTime()) /
                            (1000 * 60 * 60 * 24 * 365)
                        )}{" "}
                        años
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso actual:</span>
                      <span className="font-medium">
                        {selectedAnimalProfile.currentWeight} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Último chequeo:</span>
                      <span className="font-medium">
                        {selectedAnimalProfile.lastCheckup.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total eventos:</span>
                      <span className="font-medium">
                        {selectedAnimalProfile.totalEvents}
                      </span>
                    </div>
                  </div>

                  {selectedAnimalProfile.chronicConditions.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        Condiciones Crónicas
                      </h5>
                      <div className="space-y-1">
                        {selectedAnimalProfile.chronicConditions.map(
                          (condition, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs"
                            >
                              {condition}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {selectedAnimalProfile.allergies.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2">
                        Alergias
                      </h5>
                      <div className="space-y-1">
                        {selectedAnimalProfile.allergies.map((allergy, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Timeline de Eventos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle>
                  Historial de Eventos ({filteredEvents.length})
                  {selectedAnimalProfile && (
                    <span className="text-base font-normal text-gray-600 ml-2">
                      - {selectedAnimalProfile.name}
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Cronología detallada de todos los eventos médicos registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredEvents.length > 0 ? (
                  <EventTimeline events={filteredEvents} />
                ) : (
                  <div className="text-center py-12">
                    <Stethoscope className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay eventos médicos
                    </h3>
                    <p className="text-gray-600 mb-4">
                      No se encontraron eventos que coincidan con los filtros
                      seleccionados.
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Registrar Primer Evento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MedicalHistory;
