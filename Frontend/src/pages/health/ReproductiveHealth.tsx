import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Baby,
  Calendar,
  MapPin,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Clock,
  Eye,
  Edit,
  BarChart3,
  Stethoscope,
  Target,
  Users,
  Zap,
  Droplets,
  Settings,
  FileText,
  Download,
  Bell,
  Star,
} from "lucide-react";

// Interfaces para tipos de datos
interface ReproductiveEvent {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  eventType:
    | "heat_detection"
    | "insemination"
    | "pregnancy_check"
    | "birth"
    | "weaning"
    | "synchronization"
    | "embryo_transfer"
    | "examination";
  eventDate: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
    sector: string;
  };
  veterinarian: string;
  technician?: string;
  details: {
    // Para detección de celo
    heatIntensity?: "low" | "medium" | "high";
    heatSigns?: string[];

    // Para inseminación
    semenBull?: string;
    semenBatch?: string;
    inseminationMethod?: "artificial" | "natural";
    inseminationTime?: Date;

    // Para examen de gestación
    gestationDays?: number;
    gestationStatus?: "open" | "pregnant" | "uncertain";
    expectedCalvingDate?: Date;
    fetusViability?: "normal" | "abnormal";

    // Para parto
    calvingEase?: "normal" | "assisted" | "difficult" | "caesarean";
    calfGender?: "male" | "female";
    calfWeight?: number;
    calfViability?: "alive" | "dead" | "weak";
    placentaExpulsion?: "normal" | "retained";

    // Para sincronización
    protocol?: string;
    hormones?: string[];
    responseToTreatment?: "good" | "poor" | "none";
  };
  status: "scheduled" | "completed" | "cancelled" | "pending";
  results?: string;
  complications?: string;
  nextEvent?: {
    type: string;
    scheduledDate: Date;
  };
  cost: number;
  notes: string;
}

interface AnimalReproductiveProfile {
  id: string;
  name: string;
  tag: string;
  breed: string;
  birthDate: Date;
  currentAge: number;
  reproductiveStatus:
    | "open"
    | "pregnant"
    | "lactating"
    | "dry"
    | "heifer"
    | "culled";
  currentCycle: {
    cycleNumber: number;
    lastHeatDate?: Date;
    nextExpectedHeat?: Date;
    averageCycleLength: number;
  };
  gestationInfo?: {
    isPregnant: boolean;
    pregnancyDate?: Date;
    gestationDays?: number;
    expectedCalvingDate?: Date;
    sire?: string;
  };
  lactationInfo?: {
    isLactating: boolean;
    calvingDate?: Date;
    lactationDays?: number;
    dryOffDate?: Date;
  };
  reproductiveHistory: {
    totalCalvings: number;
    totalConceptions: number;
    averageCalvingInterval: number;
    lastCalvingDate?: Date;
    lastServiceDate?: Date;
    servicesPerConception: number;
  };
  healthIssues: string[];
  bodyConditionScore: number;
  lastExaminationDate: Date;
  nextScheduledEvent?: {
    type: string;
    date: Date;
  };
}

interface ReproductiveStats {
  totalFemales: number;
  pregnantCows: number;
  pregnancyRate: number;
  conceptionRate: number;
  averageCalvingInterval: number;
  averageServicesPerConception: number;
  heatDetectionRate: number;
  calfMortality: number;
  replacementRate: number;
  seasonalCalvings: { season: string; count: number }[];
  monthlyConceptions: number;
  cullingRate: number;
}

interface SynchronizationProtocol {
  id: string;
  name: string;
  description: string;
  duration: number; // días
  targetAnimals: string[];
  hormoneSchedule: Array<{
    day: number;
    hormone: string;
    dose: string;
    route: string;
    time: string;
  }>;
  expectedResults: {
    synchronizationRate: number;
    conceptionRate: number;
    costPerAnimal: number;
  };
  contraindications: string[];
  isActive: boolean;
  createdBy: string;
  lastUpdated: Date;
}

interface ReproductiveAlert {
  id: string;
  type:
    | "overdue_heat"
    | "pregnancy_check_due"
    | "calving_due"
    | "breeding_problem"
    | "health_issue";
  animalId: string;
  animalName: string;
  animalTag: string;
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  daysOverdue?: number;
  recommendedAction: string;
  isActive: boolean;
  createdAt: Date;
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
  variant?: "default" | "outline" | "success" | "danger" | "warning";
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
    warning:
      "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
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
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "open":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pregnant":
        return "bg-green-100 text-green-800 border-green-200";
      case "lactating":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "dry":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "heifer":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "culled":
        return "bg-red-100 text-red-800 border-red-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "normal":
        return "bg-green-100 text-green-800 border-green-200";
      case "assisted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "difficult":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "caesarean":
        return "bg-red-100 text-red-800 border-red-200";
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

// Componente de Mapa Reproductivo
const ReproductiveMap: React.FC = () => {
  return (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Fondo del mapa simulado */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 to-purple-100"></div>

      {/* Título de ubicación */}
      <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-pink-600" />
          <span className="text-sm font-medium">
            Mapa Reproductivo - Villahermosa, Tabasco
          </span>
        </div>
      </div>

      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-md text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>Gestantes</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>En celo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Lactando</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
            <span>Vaquillas</span>
          </div>
        </div>
      </div>

      {/* Marcadores simulados de eventos reproductivos */}
      <div className="relative w-full h-full">
        {/* Vaca gestante */}
        <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-green-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Baby className="w-4 h-4 text-white" />
          </motion.div>
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-36 text-xs">
            <p className="font-medium text-green-700">Gestante - 180 días</p>
            <p className="text-gray-600">Vaca Holstein - Bessie</p>
            <p className="text-gray-600">Sector A - Establo Principal</p>
          </div>
        </div>

        {/* Vaca en celo */}
        <div className="absolute top-2/3 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Heart className="w-3 h-3 text-white" />
          </motion.div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
            <p className="font-medium text-blue-700">En Celo</p>
            <p className="text-gray-600">Vaca Jersey - Luna</p>
            <p className="text-gray-600">Sector B</p>
          </div>
        </div>

        {/* Vaca lactando */}
        <div className="absolute bottom-1/4 left-2/3 transform -translate-x-1/2 translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-purple-500 rounded-full w-7 h-7 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Droplets className="w-3 h-3 text-white" />
          </motion.div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
            <p className="font-medium text-purple-700">Lactando</p>
            <p className="text-gray-600">Vaca Angus - Estrella</p>
            <p className="text-gray-600">Sector C</p>
          </div>
        </div>

        {/* Vaquilla */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-pink-500 rounded-full w-5 h-5 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Star className="w-3 h-3 text-white" />
          </motion.div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
            <p className="font-medium text-pink-700">Vaquilla</p>
            <p className="text-gray-600">15 meses - Lista para servicio</p>
            <p className="text-gray-600">Sector D</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Alerta Reproductiva
const ReproductiveAlertCard: React.FC<{ alert: ReproductiveAlert }> = ({
  alert,
}) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case "overdue_heat":
        return Clock;
      case "pregnancy_check_due":
        return Stethoscope;
      case "calving_due":
        return Baby;
      case "breeding_problem":
        return AlertTriangle;
      case "health_issue":
        return Heart;
      default:
        return Bell;
    }
  };

  const Icon = getAlertIcon(alert.type);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-lg border-l-4 ${
        alert.priority === "critical"
          ? "border-red-500 bg-red-50"
          : alert.priority === "high"
          ? "border-orange-500 bg-orange-50"
          : alert.priority === "medium"
          ? "border-yellow-500 bg-yellow-50"
          : "border-blue-500 bg-blue-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`w-5 h-5 ${
            alert.priority === "critical"
              ? "text-red-600"
              : alert.priority === "high"
              ? "text-orange-600"
              : alert.priority === "medium"
              ? "text-yellow-600"
              : "text-blue-600"
          } flex-shrink-0 mt-0.5`}
        />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{alert.title}</h4>
          <p className="text-sm text-gray-600 mt-1">
            <strong>
              {alert.animalName} ({alert.animalTag})
            </strong>
          </p>
          <p className="text-sm text-gray-600">{alert.description}</p>
          {alert.daysOverdue && (
            <p className="text-sm font-medium text-red-600 mt-1">
              {alert.daysOverdue} días de retraso
            </p>
          )}
          <p className="text-sm text-gray-700 mt-2">
            <strong>Acción recomendada:</strong> {alert.recommendedAction}
          </p>
        </div>
        <Badge variant={alert.priority}>
          {alert.priority === "critical"
            ? "Crítico"
            : alert.priority === "high"
            ? "Alto"
            : alert.priority === "medium"
            ? "Medio"
            : "Bajo"}
        </Badge>
      </div>
    </motion.div>
  );
};

const ReproductiveHealth: React.FC = () => {
  // Estados del componente
  const [animals, setAnimals] = useState<AnimalReproductiveProfile[]>([]);
  const [events, setEvents] = useState<ReproductiveEvent[]>([]);
  const [protocols, setProtocols] = useState<SynchronizationProtocol[]>([]);
  const [stats, setStats] = useState<ReproductiveStats>({
    totalFemales: 0,
    pregnantCows: 0,
    pregnancyRate: 0,
    conceptionRate: 0,
    averageCalvingInterval: 0,
    averageServicesPerConception: 0,
    heatDetectionRate: 0,
    calfMortality: 0,
    replacementRate: 0,
    seasonalCalvings: [],
    monthlyConceptions: 0,
    cullingRate: 0,
  });
  const [reproductiveAlerts, setReproductiveAlerts] = useState<
    ReproductiveAlert[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"animals" | "events" | "protocols">(
    "animals"
  );

  // Simulación de datos
  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Datos de ejemplo para perfiles reproductivos
      const mockAnimals: AnimalReproductiveProfile[] = [
        {
          id: "COW001",
          name: "Bessie",
          tag: "TAG-001",
          breed: "Holstein",
          birthDate: new Date("2021-03-15"),
          currentAge: 4.3,
          reproductiveStatus: "pregnant",
          currentCycle: {
            cycleNumber: 3,
            lastHeatDate: new Date("2025-01-10"),
            averageCycleLength: 21,
          },
          gestationInfo: {
            isPregnant: true,
            pregnancyDate: new Date("2025-01-12"),
            gestationDays: 180,
            expectedCalvingDate: new Date("2025-10-20"),
            sire: "Toro Elite 2024",
          },
          reproductiveHistory: {
            totalCalvings: 2,
            totalConceptions: 3,
            averageCalvingInterval: 385,
            lastCalvingDate: new Date("2024-01-15"),
            lastServiceDate: new Date("2025-01-12"),
            servicesPerConception: 1.5,
          },
          healthIssues: [],
          bodyConditionScore: 3.5,
          lastExaminationDate: new Date("2025-07-01"),
          nextScheduledEvent: {
            type: "Examen gestación",
            date: new Date("2025-08-15"),
          },
        },
        {
          id: "COW002",
          name: "Luna",
          tag: "TAG-002",
          breed: "Jersey",
          birthDate: new Date("2021-11-08"),
          currentAge: 3.7,
          reproductiveStatus: "open",
          currentCycle: {
            cycleNumber: 2,
            lastHeatDate: new Date("2025-06-25"),
            nextExpectedHeat: new Date("2025-07-16"),
            averageCycleLength: 21,
          },
          reproductiveHistory: {
            totalCalvings: 1,
            totalConceptions: 2,
            averageCalvingInterval: 365,
            lastCalvingDate: new Date("2024-03-10"),
            lastServiceDate: new Date("2025-06-27"),
            servicesPerConception: 2.0,
          },
          healthIssues: ["Quiste ovárico"],
          bodyConditionScore: 3.0,
          lastExaminationDate: new Date("2025-06-30"),
          nextScheduledEvent: {
            type: "Detección de celo",
            date: new Date("2025-07-16"),
          },
        },
        {
          id: "HEI001",
          name: "Esperanza",
          tag: "TAG-H001",
          breed: "Angus",
          birthDate: new Date("2023-05-20"),
          currentAge: 2.2,
          reproductiveStatus: "heifer",
          currentCycle: {
            cycleNumber: 0,
            averageCycleLength: 21,
          },
          reproductiveHistory: {
            totalCalvings: 0,
            totalConceptions: 0,
            averageCalvingInterval: 0,
            servicesPerConception: 0,
          },
          healthIssues: [],
          bodyConditionScore: 3.2,
          lastExaminationDate: new Date("2025-07-05"),
          nextScheduledEvent: {
            type: "Primer servicio",
            date: new Date("2025-08-01"),
          },
        },
      ];

      // Datos de ejemplo para eventos reproductivos
      const mockEvents: ReproductiveEvent[] = [
        {
          id: "1",
          animalId: "COW001",
          animalName: "Bessie",
          animalTag: "TAG-001",
          eventType: "pregnancy_check",
          eventDate: new Date("2025-07-01"),
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Establo Principal, Sector A",
            sector: "A",
          },
          veterinarian: "Dr. García",
          details: {
            gestationDays: 180,
            gestationStatus: "pregnant",
            expectedCalvingDate: new Date("2025-10-20"),
            fetusViability: "normal",
          },
          status: "completed",
          results: "Gestación de 180 días confirmada, feto viable",
          cost: 150,
          notes: "Gestación progresando normalmente, próximo examen en 45 días",
        },
        {
          id: "2",
          animalId: "COW002",
          animalName: "Luna",
          animalTag: "TAG-002",
          eventType: "heat_detection",
          eventDate: new Date("2025-06-25"),
          location: {
            lat: 17.9719,
            lng: -92.9456,
            address: "Pastizal Norte, Sector B",
            sector: "B",
          },
          veterinarian: "Dr. Martínez",
          technician: "Juan Pérez",
          details: {
            heatIntensity: "high",
            heatSigns: [
              "Monta otros animales",
              "Vulva inflamada",
              "Moco claro",
            ],
          },
          status: "completed",
          results: "Celo intenso detectado, lista para servicio",
          nextEvent: {
            type: "Inseminación artificial",
            scheduledDate: new Date("2025-06-27"),
          },
          cost: 0,
          notes: "Excelente detección de celo, programar IA en 12-18 horas",
        },
        {
          id: "3",
          animalId: "COW002",
          animalName: "Luna",
          animalTag: "TAG-002",
          eventType: "insemination",
          eventDate: new Date("2025-06-27"),
          location: {
            lat: 17.9719,
            lng: -92.9456,
            address: "Corral de manejo, Sector B",
            sector: "B",
          },
          veterinarian: "Dr. Martínez",
          technician: "Carlos Ruiz",
          details: {
            semenBull: "Toro Elite 2024",
            semenBatch: "ELT-2024-067",
            inseminationMethod: "artificial",
            inseminationTime: new Date("2025-06-27T08:30:00"),
          },
          status: "completed",
          results: "Inseminación artificial realizada exitosamente",
          nextEvent: {
            type: "Examen de gestación",
            scheduledDate: new Date("2025-07-25"),
          },
          cost: 75,
          notes:
            "IA realizada con semen de alta calidad, examen de gestación en 28 días",
        },
      ];

      // Datos de ejemplo para protocolos
      const mockProtocols: SynchronizationProtocol[] = [
        {
          id: "1",
          name: "Protocolo IATF Estándar",
          description:
            "Inseminación artificial a tiempo fijo para vacas multíparas",
          duration: 9,
          targetAnimals: ["Vacas multíparas", "Condición corporal 2.5-4.0"],
          hormoneSchedule: [
            {
              day: 0,
              hormone: "GnRH",
              dose: "2ml",
              route: "IM",
              time: "08:00",
            },
            {
              day: 7,
              hormone: "PGF2α",
              dose: "5ml",
              route: "IM",
              time: "08:00",
            },
            {
              day: 9,
              hormone: "GnRH",
              dose: "2ml",
              route: "IM",
              time: "08:00",
            },
          ],
          expectedResults: {
            synchronizationRate: 85,
            conceptionRate: 50,
            costPerAnimal: 125,
          },
          contraindications: [
            "Gestación",
            "Puerperio < 40 días",
            "Patologías reproductivas",
          ],
          isActive: true,
          createdBy: "Dr. García",
          lastUpdated: new Date("2025-06-01"),
        },
      ];

      // Estadísticas de ejemplo
      const mockStats: ReproductiveStats = {
        totalFemales: 89,
        pregnantCows: 42,
        pregnancyRate: 47.2,
        conceptionRate: 65.5,
        averageCalvingInterval: 385,
        averageServicesPerConception: 1.8,
        heatDetectionRate: 78.5,
        calfMortality: 4.2,
        replacementRate: 18.5,
        seasonalCalvings: [
          { season: "Primavera", count: 28 },
          { season: "Verano", count: 35 },
          { season: "Otoño", count: 22 },
          { season: "Invierno", count: 18 },
        ],
        monthlyConceptions: 8,
        cullingRate: 12.5,
      };

      // Alertas reproductivas
      const mockAlerts: ReproductiveAlert[] = [
        {
          id: "1",
          type: "overdue_heat",
          animalId: "COW003",
          animalName: "Margarita",
          animalTag: "TAG-003",
          priority: "medium",
          title: "Celo Retrasado",
          description: "No se ha detectado celo en los últimos 25 días",
          daysOverdue: 4,
          recommendedAction:
            "Examen reproductivo para descartar gestación o patologías",
          isActive: true,
          createdAt: new Date("2025-07-08"),
        },
        {
          id: "2",
          type: "pregnancy_check_due",
          animalId: "COW002",
          animalName: "Luna",
          animalTag: "TAG-002",
          priority: "high",
          title: "Examen de Gestación Pendiente",
          description: "Examen de gestación programado hace 3 días",
          daysOverdue: 3,
          recommendedAction: "Realizar examen de gestación por ultrasonido",
          isActive: true,
          createdAt: new Date("2025-07-09"),
        },
        {
          id: "3",
          type: "calving_due",
          animalId: "COW001",
          animalName: "Bessie",
          animalTag: "TAG-001",
          priority: "critical",
          title: "Parto Próximo",
          description: "Fecha esperada de parto en 5 días",
          recommendedAction: "Monitoreo diario y preparar área de maternidad",
          isActive: true,
          createdAt: new Date("2025-07-10"),
        },
      ];

      setAnimals(mockAnimals);
      setEvents(mockEvents);
      setProtocols(mockProtocols);
      setStats(mockStats);
      setReproductiveAlerts(mockAlerts);
    };

    loadData();
  }, []);

  // Filtrar datos según el modo de vista
  const filteredAnimals = animals.filter((animal) => {
    const matchesSearch =
      animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      animal.tag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || animal.reproductiveStatus === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.animalTag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedEventType === "all" || event.eventType === selectedEventType;

    return matchesSearch && matchesType;
  });

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
                Salud Reproductiva
              </h1>
              <p className="text-gray-600 mt-1">
                Manejo integral de la reproducción bovina
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Calendario
              </Button>
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
        {/* Alertas Reproductivas */}
        {reproductiveAlerts.filter((alert) => alert.isActive).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-white/80 backdrop-blur-md border-pink-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-pink-600" />
                  Alertas Reproductivas
                </CardTitle>
                <CardDescription>
                  Eventos y seguimientos que requieren atención
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reproductiveAlerts
                    .filter((alert) => alert.isActive)
                    .map((alert) => (
                      <ReproductiveAlertCard key={alert.id} alert={alert} />
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Estadísticas Reproductivas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card className="bg-white/80 backdrop-blur-md border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Hembras Reproductivas
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalFemales}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Baby className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Tasa de Preñez
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.pregnancyRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Tasa de Concepción
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.conceptionRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-pink-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Detección de Celo
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.heatDetectionRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Intervalo Entre Partos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.averageCalvingInterval}
                      </p>
                      <p className="text-xs text-gray-500">días</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Mapa Reproductivo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-pink-600" />
                  Mapa de Estado Reproductivo
                </CardTitle>
                <CardDescription>
                  Distribución geográfica por estado reproductivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ReproductiveMap />
              </CardContent>
            </Card>
          </motion.div>

          {/* Panel de Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Selector de Vista */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Vista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    variant={viewMode === "animals" ? "default" : "outline"}
                    onClick={() => setViewMode("animals")}
                    className="justify-start"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Animales
                  </Button>
                  <Button
                    variant={viewMode === "events" ? "default" : "outline"}
                    onClick={() => setViewMode("events")}
                    className="justify-start"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Eventos
                  </Button>
                  <Button
                    variant={viewMode === "protocols" ? "default" : "outline"}
                    onClick={() => setViewMode("protocols")}
                    className="justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Protocolos
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filtros
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
                      placeholder="Animal, etiqueta..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {viewMode === "animals" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado Reproductivo
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">Todos los estados</option>
                      <option value="open">Vacía</option>
                      <option value="pregnant">Gestante</option>
                      <option value="lactating">Lactando</option>
                      <option value="dry">Seca</option>
                      <option value="heifer">Vaquilla</option>
                    </select>
                  </div>
                )}

                {viewMode === "events" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Evento
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={selectedEventType}
                      onChange={(e) => setSelectedEventType(e.target.value)}
                    >
                      <option value="all">Todos los eventos</option>
                      <option value="heat_detection">Detección de celo</option>
                      <option value="insemination">Inseminación</option>
                      <option value="pregnancy_check">Examen gestación</option>
                      <option value="birth">Parto</option>
                      <option value="weaning">Destete</option>
                      <option value="synchronization">Sincronización</option>
                      <option value="examination">Examen</option>
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Indicadores Clave */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Indicadores Clave
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Servicios por concepción:
                  </span>
                  <span className="font-medium">
                    {stats.averageServicesPerConception}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Mortalidad de terneros:
                  </span>
                  <span className="font-medium">{stats.calfMortality}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Tasa de reemplazo:
                  </span>
                  <span className="font-medium">{stats.replacementRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Concepciones este mes:
                  </span>
                  <span className="font-medium">
                    {stats.monthlyConceptions}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Tasa de descarte:
                  </span>
                  <span className="font-medium">{stats.cullingRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Vacas gestantes:
                  </span>
                  <span className="font-medium text-green-600">
                    {stats.pregnantCows}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vista Principal (Animales/Eventos/Protocolos) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-12"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-white/80 backdrop-blur-md border-gray-200">
                  <CardHeader>
                    <CardTitle>
                      {viewMode === "animals"
                        ? `Perfil Reproductivo (${filteredAnimals.length})`
                        : viewMode === "events"
                        ? `Eventos Reproductivos (${filteredEvents.length})`
                        : `Protocolos de Sincronización (${protocols.length})`}
                    </CardTitle>
                    <CardDescription>
                      {viewMode === "animals"
                        ? "Estado reproductivo individual de cada animal"
                        : viewMode === "events"
                        ? "Registro de eventos y procedimientos reproductivos"
                        : "Protocolos estandarizados de sincronización"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {viewMode === "animals" &&
                        filteredAnimals.map((animal) => (
                          <motion.div
                            key={animal.id}
                            whileHover={{ scale: 1.01 }}
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h4 className="text-xl font-semibold text-gray-900">
                                    {animal.name} ({animal.tag})
                                  </h4>
                                  <Badge variant={animal.reproductiveStatus}>
                                    {animal.reproductiveStatus === "open"
                                      ? "Vacía"
                                      : animal.reproductiveStatus === "pregnant"
                                      ? "Gestante"
                                      : animal.reproductiveStatus ===
                                        "lactating"
                                      ? "Lactando"
                                      : animal.reproductiveStatus === "dry"
                                      ? "Seca"
                                      : animal.reproductiveStatus === "heifer"
                                      ? "Vaquilla"
                                      : "Descartada"}
                                  </Badge>
                                  <span className="text-sm text-gray-600">
                                    {animal.breed} -{" "}
                                    {animal.currentAge.toFixed(1)} años
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                                  <div>
                                    <p className="text-gray-600">
                                      Condición corporal:
                                    </p>
                                    <p className="font-medium">
                                      {animal.bodyConditionScore}/5
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">
                                      Total partos:
                                    </p>
                                    <p className="font-medium">
                                      {animal.reproductiveHistory.totalCalvings}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">
                                      Servicios/concepción:
                                    </p>
                                    <p className="font-medium">
                                      {
                                        animal.reproductiveHistory
                                          .servicesPerConception
                                      }
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">
                                      Último examen:
                                    </p>
                                    <p className="font-medium">
                                      {animal.lastExaminationDate.toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>

                                {animal.gestationInfo?.isPregnant && (
                                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                                    <h5 className="font-semibold text-green-900 mb-2">
                                      Información de Gestación
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                      <div>
                                        <span className="text-green-700">
                                          Días de gestación:
                                        </span>
                                        <span className="ml-1 font-medium">
                                          {animal.gestationInfo.gestationDays}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-green-700">
                                          Fecha esperada de parto:
                                        </span>
                                        <span className="ml-1 font-medium">
                                          {animal.gestationInfo.expectedCalvingDate?.toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-green-700">
                                          Padre:
                                        </span>
                                        <span className="ml-1 font-medium">
                                          {animal.gestationInfo.sire}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {animal.currentCycle.lastHeatDate && (
                                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                                    <h5 className="font-semibold text-blue-900 mb-2">
                                      Ciclo Reproductivo
                                    </h5>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                      <div>
                                        <span className="text-blue-700">
                                          Último celo:
                                        </span>
                                        <span className="ml-1 font-medium">
                                          {animal.currentCycle.lastHeatDate.toLocaleDateString()}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-blue-700">
                                          Próximo celo esperado:
                                        </span>
                                        <span className="ml-1 font-medium">
                                          {animal.currentCycle.nextExpectedHeat?.toLocaleDateString() ||
                                            "N/A"}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-blue-700">
                                          Ciclo promedio:
                                        </span>
                                        <span className="ml-1 font-medium">
                                          {
                                            animal.currentCycle
                                              .averageCycleLength
                                          }{" "}
                                          días
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {animal.healthIssues.length > 0 && (
                                  <div className="mb-4">
                                    <h5 className="font-semibold text-gray-900 mb-2">
                                      Problemas de Salud
                                    </h5>
                                    <div className="flex flex-wrap gap-1">
                                      {animal.healthIssues.map((issue, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs"
                                        >
                                          {issue}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {animal.nextScheduledEvent && (
                                  <div className="text-sm text-gray-600">
                                    <strong>Próximo evento:</strong>{" "}
                                    {animal.nextScheduledEvent.type} -{" "}
                                    {animal.nextScheduledEvent.date.toLocaleDateString()}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Calendar className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                      {viewMode === "events" &&
                        filteredEvents.map((event) => (
                          <motion.div
                            key={event.id}
                            whileHover={{ scale: 1.01 }}
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h4 className="text-xl font-semibold text-gray-900">
                                    {event.animalName} ({event.animalTag})
                                  </h4>
                                  <Badge variant={event.eventType}>
                                    {event.eventType === "heat_detection"
                                      ? "Detección Celo"
                                      : event.eventType === "insemination"
                                      ? "Inseminación"
                                      : event.eventType === "pregnancy_check"
                                      ? "Examen Gestación"
                                      : event.eventType === "birth"
                                      ? "Parto"
                                      : event.eventType === "weaning"
                                      ? "Destete"
                                      : event.eventType === "synchronization"
                                      ? "Sincronización"
                                      : event.eventType === "embryo_transfer"
                                      ? "Transfer Embrión"
                                      : "Examen"}
                                  </Badge>
                                  <Badge variant={event.status}>
                                    {event.status === "scheduled"
                                      ? "Programado"
                                      : event.status === "completed"
                                      ? "Completado"
                                      : event.status === "cancelled"
                                      ? "Cancelado"
                                      : "Pendiente"}
                                  </Badge>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                  <div>
                                    <p className="text-gray-600">Fecha:</p>
                                    <p className="font-medium">
                                      {event.eventDate.toLocaleDateString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">
                                      Veterinario:
                                    </p>
                                    <p className="font-medium">
                                      {event.veterinarian}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">Ubicación:</p>
                                    <p className="font-medium">
                                      {event.location.address}
                                    </p>
                                  </div>
                                </div>

                                {event.details.gestationStatus && (
                                  <div className="bg-green-50 rounded-lg p-3 mb-3">
                                    <h5 className="font-medium text-green-900 mb-2">
                                      Resultado del Examen
                                    </h5>
                                    <div className="text-sm">
                                      <p>
                                        <strong>Estado:</strong>{" "}
                                        {event.details.gestationStatus ===
                                        "pregnant"
                                          ? "Gestante"
                                          : "Vacía"}
                                      </p>
                                      {event.details.gestationDays && (
                                        <p>
                                          <strong>Días de gestación:</strong>{" "}
                                          {event.details.gestationDays}
                                        </p>
                                      )}
                                      {event.details.expectedCalvingDate && (
                                        <p>
                                          <strong>Parto esperado:</strong>{" "}
                                          {event.details.expectedCalvingDate.toLocaleDateString()}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {event.details.semenBull && (
                                  <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                    <h5 className="font-medium text-blue-900 mb-2">
                                      Detalles de Inseminación
                                    </h5>
                                    <div className="text-sm">
                                      <p>
                                        <strong>Toro:</strong>{" "}
                                        {event.details.semenBull}
                                      </p>
                                      <p>
                                        <strong>Lote de semen:</strong>{" "}
                                        {event.details.semenBatch}
                                      </p>
                                      <p>
                                        <strong>Método:</strong>{" "}
                                        {event.details.inseminationMethod ===
                                        "artificial"
                                          ? "Artificial"
                                          : "Natural"}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {event.details.heatSigns &&
                                  event.details.heatSigns.length > 0 && (
                                    <div className="mb-3">
                                      <h5 className="font-medium text-gray-900 mb-2">
                                        Signos de Celo
                                      </h5>
                                      <div className="flex flex-wrap gap-1">
                                        {event.details.heatSigns.map(
                                          (sign, idx) => (
                                            <span
                                              key={idx}
                                              className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs"
                                            >
                                              {sign}
                                            </span>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )}

                                {event.results && (
                                  <div className="text-sm text-gray-700 mb-3">
                                    <strong>Resultados:</strong> {event.results}
                                  </div>
                                )}

                                {event.nextEvent && (
                                  <div className="text-sm text-blue-600">
                                    <strong>Próximo evento:</strong>{" "}
                                    {event.nextEvent.type} -{" "}
                                    {event.nextEvent.scheduledDate.toLocaleDateString()}
                                  </div>
                                )}

                                <div className="text-sm text-gray-600 mt-3">
                                  <strong>Costo:</strong> ${event.cost}
                                  {event.notes && (
                                    <p>
                                      <strong>Notas:</strong> {event.notes}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}

                      {viewMode === "protocols" &&
                        protocols.map((protocol) => (
                          <motion.div
                            key={protocol.id}
                            whileHover={{ scale: 1.01 }}
                            className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <h4 className="text-xl font-semibold text-gray-900">
                                    {protocol.name}
                                  </h4>
                                  {protocol.isActive && (
                                    <Badge variant="success">Activo</Badge>
                                  )}
                                  <span className="text-sm text-gray-600">
                                    {protocol.duration} días
                                  </span>
                                </div>

                                <p className="text-gray-700 mb-4">
                                  {protocol.description}
                                </p>

                                <div className="mb-4">
                                  <h5 className="font-semibold text-gray-900 mb-2">
                                    Cronograma Hormonal
                                  </h5>
                                  <div className="space-y-2">
                                    {protocol.hormoneSchedule.map(
                                      (schedule, idx) => (
                                        <div
                                          key={idx}
                                          className="bg-gray-50 rounded p-3 text-sm"
                                        >
                                          <p>
                                            <strong>Día {schedule.day}:</strong>{" "}
                                            {schedule.hormone} - {schedule.dose}{" "}
                                            ({schedule.route}) a las{" "}
                                            {schedule.time}
                                          </p>
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                                  <div>
                                    <p className="text-gray-600">
                                      Tasa de sincronización:
                                    </p>
                                    <p className="font-medium">
                                      {
                                        protocol.expectedResults
                                          .synchronizationRate
                                      }
                                      %
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">
                                      Tasa de concepción:
                                    </p>
                                    <p className="font-medium">
                                      {protocol.expectedResults.conceptionRate}%
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-gray-600">
                                      Costo por animal:
                                    </p>
                                    <p className="font-medium">
                                      ${protocol.expectedResults.costPerAnimal}
                                    </p>
                                  </div>
                                </div>

                                <div className="mb-4">
                                  <h5 className="font-semibold text-gray-900 mb-2">
                                    Animales Objetivo
                                  </h5>
                                  <div className="flex flex-wrap gap-1">
                                    {protocol.targetAnimals.map(
                                      (target, idx) => (
                                        <span
                                          key={idx}
                                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                        >
                                          {target}
                                        </span>
                                      )
                                    )}
                                  </div>
                                </div>

                                {protocol.contraindications.length > 0 && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-2">
                                      Contraindicaciones
                                    </h5>
                                    <div className="flex flex-wrap gap-1">
                                      {protocol.contraindications.map(
                                        (contraindication, idx) => (
                                          <span
                                            key={idx}
                                            className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs"
                                          >
                                            {contraindication}
                                          </span>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                                <div className="text-sm text-gray-600 mt-4">
                                  <p>
                                    <strong>Creado por:</strong>{" "}
                                    {protocol.createdBy}
                                  </p>
                                  <p>
                                    <strong>Última actualización:</strong>{" "}
                                    {protocol.lastUpdated.toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="success" size="sm">
                                  <Zap className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ReproductiveHealth;
