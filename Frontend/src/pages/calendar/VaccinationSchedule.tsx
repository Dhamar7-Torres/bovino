import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Syringe,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  X,
  Plus,
  Edit3,
  Trash2,
  Filter,
  Search,
  Download,
  Upload,
  Bell,
  Shield,
  FileText,
  Beef,
  User,
  MapPin,
  DollarSign,
  Eye,
  MoreVertical,
  Info,
  TrendingUp,
  Activity,
  Target,
} from "lucide-react";

// Interfaces para TypeScript
interface VaccinationSchedule {
  id: string;
  bovineId: string;
  bovineName: string;
  bovineTag: string;
  vaccineId: string;
  vaccineName: string;
  vaccineType: VaccineType;
  scheduledDate: string;
  scheduledTime: string;
  status: "scheduled" | "completed" | "overdue" | "cancelled" | "rescheduled";
  doseNumber: number;
  totalDoses: number;
  nextDueDate?: string;
  completedDate?: string;
  veterinarian?: string;
  location: string;
  batchNumber?: string;
  expirationDate?: string;
  sideEffects?: string;
  notes?: string;
  cost: number;
  reminderSent: boolean;
  certificateGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface VaccineType {
  id: string;
  name: string;
  manufacturer: string;
  category: "viral" | "bacterial" | "parasitic" | "multivalent" | "other";
  description: string;
  dosageInstructions: string;
  storageRequirements: string;
  sideEffects: string[];
  contraindications: string[];
  withdrawalPeriod: number; // días
  boosterRequired: boolean;
  boosterInterval: number; // días
  ageRestrictions: {
    minAge: number; // meses
    maxAge?: number; // meses
  };
  seasonalRecommendation?: string;
  regulatoryApproval: string;
  costPerDose: number;
  isGovernmentRequired: boolean;
}

interface VaccinationProtocol {
  id: string;
  name: string;
  description: string;
  targetCategory: "calves" | "adults" | "breeding" | "all";
  vaccines: {
    vaccineId: string;
    sequence: number;
    ageInMonths: number;
    intervalDays?: number;
  }[];
  isGovernmentRequired: boolean;
  seasonality?: {
    startMonth: number;
    endMonth: number;
  };
  frequency: "annual" | "biannual" | "as_needed";
  createdBy: string;
  lastUpdated: string;
}

interface VaccinationStats {
  totalScheduled: number;
  completed: number;
  overdue: number;
  upcomingWeek: number;
  complianceRate: number;
  costThisMonth: number;
  mostUsedVaccine: string;
  overdueAnimals: number;
  certificatesIssued: number;
  averageCostPerAnimal: number;
}

// Mock data para tipos de vacunas
const mockVaccineTypes: VaccineType[] = [
  {
    id: "vacc_001",
    name: "Vacuna Antirrábica",
    manufacturer: "Boehringer Ingelheim",
    category: "viral",
    description: "Vacuna inactivada contra el virus de la rabia",
    dosageInstructions: "2ml vía intramuscular",
    storageRequirements: "Refrigeración 2-8°C",
    sideEffects: ["Inflamación local leve", "Fiebre temporal"],
    contraindications: ["Animales enfermos", "Preñez avanzada"],
    withdrawalPeriod: 21,
    boosterRequired: true,
    boosterInterval: 365,
    ageRestrictions: { minAge: 3 },
    seasonalRecommendation: "Primavera",
    regulatoryApproval: "SENASICA-MEX-2024",
    costPerDose: 25.5,
    isGovernmentRequired: true,
  },
  {
    id: "vacc_002",
    name: "Clostridium Multivalente",
    manufacturer: "Zoetis",
    category: "bacterial",
    description: "Protección contra 8 cepas de Clostridium",
    dosageInstructions: "5ml vía subcutánea",
    storageRequirements: "Refrigeración 2-8°C, no congelar",
    sideEffects: ["Nódulo temporal", "Pérdida leve de apetito"],
    contraindications: ["Fiebre", "Estrés severo"],
    withdrawalPeriod: 28,
    boosterRequired: true,
    boosterInterval: 365,
    ageRestrictions: { minAge: 2 },
    regulatoryApproval: "SENASICA-MEX-2023",
    costPerDose: 32.0,
    isGovernmentRequired: false,
  },
  {
    id: "vacc_003",
    name: "IBR-BVD Multivalente",
    manufacturer: "MSD Animal Health",
    category: "viral",
    description: "Protección contra IBR, BVD, PI3 y BRSV",
    dosageInstructions: "2ml vía intramuscular",
    storageRequirements: "Refrigeración 2-8°C",
    sideEffects: ["Fiebre leve", "Reducción temporal de producción"],
    contraindications: ["Preñez primer tercio", "Inmunodepresión"],
    withdrawalPeriod: 21,
    boosterRequired: true,
    boosterInterval: 365,
    ageRestrictions: { minAge: 3 },
    regulatoryApproval: "SENASICA-MEX-2024",
    costPerDose: 45.75,
    isGovernmentRequired: false,
  },
  {
    id: "vacc_004",
    name: "Brucelosis RB51",
    manufacturer: "SAGARPA",
    category: "bacterial",
    description: "Vacuna viva modificada contra Brucella abortus",
    dosageInstructions: "2ml vía subcutánea",
    storageRequirements: "Refrigeración 2-8°C, usar inmediatamente",
    sideEffects: ["Inflamación local"],
    contraindications: ["Machos", "Hembras preñadas", "Mayores 8 meses"],
    withdrawalPeriod: 60,
    boosterRequired: false,
    boosterInterval: 0,
    ageRestrictions: { minAge: 3, maxAge: 8 },
    seasonalRecommendation: "Todo el año",
    regulatoryApproval: "SENASICA-OBLIGATORIA",
    costPerDose: 15.0,
    isGovernmentRequired: true,
  },
];

// Mock data para protocolos de vacunación
const mockVaccinationProtocols: VaccinationProtocol[] = [
  {
    id: "protocol_001",
    name: "Protocolo Básico Becerros",
    description: "Esquema básico de vacunación para becerros de 0-12 meses",
    targetCategory: "calves",
    vaccines: [
      { vaccineId: "vacc_004", sequence: 1, ageInMonths: 4 },
      { vaccineId: "vacc_002", sequence: 2, ageInMonths: 6, intervalDays: 60 },
      { vaccineId: "vacc_003", sequence: 3, ageInMonths: 8, intervalDays: 60 },
      {
        vaccineId: "vacc_001",
        sequence: 4,
        ageInMonths: 12,
        intervalDays: 120,
      },
    ],
    isGovernmentRequired: true,
    frequency: "annual",
    createdBy: "Dr. Carlos Ruiz",
    lastUpdated: "2025-01-15",
  },
  {
    id: "protocol_002",
    name: "Protocolo Ganado Adulto",
    description: "Mantenimiento anual para ganado adulto",
    targetCategory: "adults",
    vaccines: [
      { vaccineId: "vacc_001", sequence: 1, ageInMonths: 0, intervalDays: 365 },
      { vaccineId: "vacc_002", sequence: 2, ageInMonths: 0, intervalDays: 365 },
      { vaccineId: "vacc_003", sequence: 3, ageInMonths: 0, intervalDays: 365 },
    ],
    isGovernmentRequired: false,
    seasonality: { startMonth: 3, endMonth: 5 }, // Marzo-Mayo
    frequency: "annual",
    createdBy: "Veterinario Principal",
    lastUpdated: "2025-02-01",
  },
  {
    id: "protocol_003",
    name: "Protocolo Reproductoras",
    description: "Esquema especial para hembras reproductoras",
    targetCategory: "breeding",
    vaccines: [
      { vaccineId: "vacc_003", sequence: 1, ageInMonths: 0, intervalDays: 365 },
      { vaccineId: "vacc_001", sequence: 2, ageInMonths: 0, intervalDays: 365 },
    ],
    isGovernmentRequired: false,
    seasonality: { startMonth: 1, endMonth: 3 }, // Enero-Marzo
    frequency: "annual",
    createdBy: "Especialista en Reproducción",
    lastUpdated: "2025-01-20",
  },
];

// Mock data para programación de vacunaciones
const mockVaccinationSchedules: VaccinationSchedule[] = [
  {
    id: "sched_001",
    bovineId: "1",
    bovineName: "Luna",
    bovineTag: "B001",
    vaccineId: "vacc_001",
    vaccineName: "Vacuna Antirrábica",
    vaccineType: mockVaccineTypes[0],
    scheduledDate: "2025-07-15",
    scheduledTime: "09:00",
    status: "completed",
    doseNumber: 1,
    totalDoses: 1,
    completedDate: "2025-07-15",
    veterinarian: "Dra. María González",
    location: "Corral A - Zona Norte",
    batchNumber: "RB2025-001",
    expirationDate: "2026-03-15",
    cost: 25.5,
    reminderSent: true,
    certificateGenerated: true,
    createdAt: "2025-07-01T10:30:00Z",
    updatedAt: "2025-07-15T11:30:00Z",
    createdBy: "Dr. Carlos Ruiz",
  },
  {
    id: "sched_002",
    bovineId: "2",
    bovineName: "Toro Alpha",
    bovineTag: "B002",
    vaccineId: "vacc_002",
    vaccineName: "Clostridium Multivalente",
    vaccineType: mockVaccineTypes[1],
    scheduledDate: "2025-07-20",
    scheduledTime: "14:00",
    status: "scheduled",
    doseNumber: 1,
    totalDoses: 1,
    nextDueDate: "2026-07-20",
    veterinarian: "Dr. Pedro Martínez",
    location: "Corral B - Zona Sur",
    cost: 32.0,
    reminderSent: true,
    certificateGenerated: false,
    createdAt: "2025-07-05T15:20:00Z",
    updatedAt: "2025-07-05T15:20:00Z",
    createdBy: "Dr. Carlos Ruiz",
  },
  {
    id: "sched_003",
    bovineId: "3",
    bovineName: "Bella",
    bovineTag: "B003",
    vaccineId: "vacc_003",
    vaccineName: "IBR-BVD Multivalente",
    vaccineType: mockVaccineTypes[2],
    scheduledDate: "2025-07-25",
    scheduledTime: "08:00",
    status: "scheduled",
    doseNumber: 1,
    totalDoses: 1,
    nextDueDate: "2026-07-25",
    veterinarian: "Dra. María González",
    location: "Centro de Reproducción",
    cost: 45.75,
    reminderSent: false,
    certificateGenerated: false,
    createdAt: "2025-07-10T09:15:00Z",
    updatedAt: "2025-07-10T09:15:00Z",
    createdBy: "Dr. Carlos Ruiz",
  },
  {
    id: "sched_004",
    bovineId: "4",
    bovineName: "Max",
    bovineTag: "B004",
    vaccineId: "vacc_001",
    vaccineName: "Vacuna Antirrábica",
    vaccineType: mockVaccineTypes[0],
    scheduledDate: "2025-07-10",
    scheduledTime: "10:00",
    status: "overdue",
    doseNumber: 1,
    totalDoses: 1,
    veterinarian: "Dr. Pedro Martínez",
    location: "Corral C - Enfermería",
    cost: 25.5,
    reminderSent: true,
    certificateGenerated: false,
    createdAt: "2025-06-25T14:00:00Z",
    updatedAt: "2025-07-11T08:00:00Z",
    createdBy: "Cuidador",
  },
  {
    id: "sched_005",
    bovineId: "5",
    bovineName: "Rosa",
    bovineTag: "B005",
    vaccineId: "vacc_004",
    vaccineName: "Brucelosis RB51",
    vaccineType: mockVaccineTypes[3],
    scheduledDate: "2025-08-01",
    scheduledTime: "07:00",
    status: "scheduled",
    doseNumber: 1,
    totalDoses: 1,
    veterinarian: "Veterinario Oficial SENASICA",
    location: "Área de Cuarentena",
    cost: 15.0,
    reminderSent: false,
    certificateGenerated: false,
    createdAt: "2025-07-15T16:30:00Z",
    updatedAt: "2025-07-15T16:30:00Z",
    createdBy: "Dr. Carlos Ruiz",
    notes: "Vacunación obligatoria SENASICA",
  },
];

// Componente principal VaccinationSchedule
const VaccinationSchedule: React.FC = () => {
  // Estados principales
  const [schedules, setSchedules] = useState<VaccinationSchedule[]>(
    mockVaccinationSchedules
  );
  const [filteredSchedules, setFilteredSchedules] = useState<
    VaccinationSchedule[]
  >(mockVaccinationSchedules);
  const [vaccines] = useState<VaccineType[]>(mockVaccineTypes);
  const [protocols] = useState<VaccinationProtocol[]>(mockVaccinationProtocols);
  const [selectedSchedule, setSelectedSchedule] =
    useState<VaccinationSchedule | null>(null);

  // Estados de UI
  const [activeTab, setActiveTab] = useState<
    "schedule" | "protocols" | "history" | "vaccines"
  >("schedule");
  const [, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Estados de filtros
  const [filters, setFilters] = useState({
    status: "all",
    vaccineType: "all",
    dateRange: "all",
    location: "all",
    veterinarian: "all",
    searchQuery: "",
  });

  // Efectos
  useEffect(() => {
    // Aplicar filtros
    let filtered = schedules;

    if (filters.status !== "all") {
      filtered = filtered.filter(
        (schedule) => schedule.status === filters.status
      );
    }

    if (filters.vaccineType !== "all") {
      filtered = filtered.filter(
        (schedule) => schedule.vaccineType.category === filters.vaccineType
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(
        (schedule) =>
          schedule.bovineName.toLowerCase().includes(query) ||
          schedule.bovineTag.toLowerCase().includes(query) ||
          schedule.vaccineName.toLowerCase().includes(query) ||
          (schedule.veterinarian &&
            schedule.veterinarian.toLowerCase().includes(query))
      );
    }

    setFilteredSchedules(filtered);
  }, [schedules, filters]);

  // Calcular estadísticas
  const stats = useMemo((): VaccinationStats => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const completed = schedules.filter((s) => s.status === "completed").length;
    const overdue = schedules.filter((s) => s.status === "overdue").length;
    const upcomingWeek = schedules.filter((s) => {
      const schedDate = new Date(s.scheduledDate);
      return (
        s.status === "scheduled" &&
        schedDate <= oneWeekFromNow &&
        schedDate >= now
      );
    }).length;

    const totalCost = schedules
      .filter(
        (s) =>
          s.completedDate &&
          new Date(s.completedDate).getMonth() === now.getMonth()
      )
      .reduce((sum, s) => sum + s.cost, 0);

    const vaccineUsage = schedules.reduce((acc, s) => {
      acc[s.vaccineName] = (acc[s.vaccineName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedVaccine = Object.entries(vaccineUsage).reduce(
      (a, b) => (vaccineUsage[a[0]] > vaccineUsage[b[0]] ? a : b),
      ["", 0]
    )[0];

    return {
      totalScheduled: schedules.length,
      completed,
      overdue,
      upcomingWeek,
      complianceRate:
        schedules.length > 0 ? (completed / schedules.length) * 100 : 0,
      costThisMonth: totalCost,
      mostUsedVaccine,
      overdueAnimals: new Set(
        schedules.filter((s) => s.status === "overdue").map((s) => s.bovineId)
      ).size,
      certificatesIssued: schedules.filter((s) => s.certificateGenerated)
        .length,
      averageCostPerAnimal:
        schedules.length > 0
          ? schedules.reduce((sum, s) => sum + s.cost, 0) / schedules.length
          : 0,
    };
  }, [schedules]);

  // Funciones auxiliares
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Programado";
      case "completed":
        return "Completado";
      case "overdue":
        return "Vencido";
      case "cancelled":
        return "Cancelado";
      case "rescheduled":
        return "Reprogramado";
      default:
        return "Desconocido";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "viral":
        return "bg-purple-100 text-purple-800";
      case "bacterial":
        return "bg-blue-100 text-blue-800";
      case "parasitic":
        return "bg-green-100 text-green-800";
      case "multivalent":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case "viral":
        return "Viral";
      case "bacterial":
        return "Bacteriana";
      case "parasitic":
        return "Parasitaria";
      case "multivalent":
        return "Multivalente";
      default:
        return "Otra";
    }
  };

  // Funciones de acciones
  const handleCompleteVaccination = async (scheduleId: string) => {
    setIsLoading(true);
    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSchedules((prev) =>
        prev.map((schedule) =>
          schedule.id === scheduleId
            ? {
                ...schedule,
                status: "completed" as const,
                completedDate: new Date().toISOString().split("T")[0],
                certificateGenerated: true,
                updatedAt: new Date().toISOString(),
              }
            : schedule
        )
      );
    } catch (error) {
      console.error("Error al completar vacunación:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta programación?")) {
      return;
    }

    setIsLoading(true);
    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSchedules((prev) =>
        prev.filter((schedule) => schedule.id !== scheduleId)
      );
    } catch (error) {
      console.error("Error al eliminar programación:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isOverdue = (schedule: VaccinationSchedule) => {
    const scheduleDate = new Date(schedule.scheduledDate);
    const today = new Date();
    return schedule.status === "scheduled" && scheduleDate < today;
  };

  const isUpcomingSoon = (schedule: VaccinationSchedule) => {
    const scheduleDate = new Date(schedule.scheduledDate);
    const today = new Date();
    const threeDaysFromNow = new Date(
      today.getTime() + 3 * 24 * 60 * 60 * 1000
    );
    return (
      schedule.status === "scheduled" &&
      scheduleDate <= threeDaysFromNow &&
      scheduleDate >= today
    );
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
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
                  <Syringe className="w-6 h-6" />
                </div>
                Programación de Vacunaciones
              </h1>
              <p className="text-gray-600">
                Gestión completa del calendario de vacunaciones del ganado
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nueva Vacunación
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Importar Protocolo
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar Registros
              </motion.button>
            </div>
          </div>

          {/* Estadísticas del Dashboard */}
          <div className="grid md:grid-cols-5 gap-4 mb-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Programadas</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.totalScheduled}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completadas</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.completed}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Vencidas</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.overdue}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Esta Semana</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.upcomingWeek}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Cumplimiento</p>
                  <p className="text-xl font-bold text-gray-900">
                    {stats.complianceRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Alertas y Notificaciones */}
          {(stats.overdue > 0 || stats.upcomingWeek > 0) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <Bell className="w-5 h-5 text-orange-500" />
                  <h3 className="font-semibold text-gray-900">
                    Notificaciones Importantes
                  </h3>
                </div>

                <div className="space-y-2">
                  {stats.overdue > 0 && (
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 rounded-lg p-3">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>{stats.overdue}</strong> vacunaciones vencidas
                        requieren atención inmediata
                      </span>
                    </div>
                  )}

                  {stats.upcomingWeek > 0 && (
                    <div className="flex items-center gap-2 text-blue-700 bg-blue-50 rounded-lg p-3">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">
                        <strong>{stats.upcomingWeek}</strong> vacunaciones
                        programadas para esta semana
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Pestañas de Navegación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: "schedule", label: "Programación", icon: Calendar },
                { id: "protocols", label: "Protocolos", icon: FileText },
                { id: "history", label: "Historial", icon: Activity },
                { id: "vaccines", label: "Vacunas", icon: Syringe },
              ].map((tab) => (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Búsqueda */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar por bovino, vacuna o veterinario..."
                    value={filters.searchQuery}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        searchQuery: e.target.value,
                      }))
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtros rápidos */}
              <div className="flex gap-3">
                <select
                  value={filters.status}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Todos los estados</option>
                  <option value="scheduled">Programadas</option>
                  <option value="completed">Completadas</option>
                  <option value="overdue">Vencidas</option>
                  <option value="cancelled">Canceladas</option>
                </select>

                <select
                  value={filters.vaccineType}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      vaccineType: e.target.value,
                    }))
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">Todos los tipos</option>
                  <option value="viral">Virales</option>
                  <option value="bacterial">Bacterianas</option>
                  <option value="parasitic">Parasitarias</option>
                  <option value="multivalent">Multivalentes</option>
                </select>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Más Filtros
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contenido Principal por Pestañas */}
        <AnimatePresence mode="wait">
          {activeTab === "schedule" && (
            <motion.div
              key="schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Lista de Vacunaciones Programadas */}
              {filteredSchedules.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                  <Syringe className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No se encontraron vacunaciones
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {filters.searchQuery || filters.status !== "all"
                      ? "Intenta ajustar los filtros de búsqueda"
                      : "Programa la primera vacunación para comenzar"}
                  </p>
                  {!filters.searchQuery && filters.status === "all" && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowCreateModal(true)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 mx-auto"
                    >
                      <Plus className="w-4 h-4" />
                      Programar Vacunación
                    </motion.button>
                  )}
                </div>
              ) : (
                filteredSchedules.map((schedule) => (
                  <motion.div
                    key={schedule.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.01 }}
                    className={`bg-white rounded-lg shadow-sm border-l-4 p-6 hover:shadow-md transition-shadow ${
                      isOverdue(schedule)
                        ? "border-l-red-500"
                        : isUpcomingSoon(schedule)
                        ? "border-l-yellow-500"
                        : schedule.status === "completed"
                        ? "border-l-green-500"
                        : "border-l-blue-500"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header de la vacunación */}
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Syringe className="w-6 h-6 text-green-600" />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {schedule.vaccineName}
                              </h3>

                              <div
                                className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                  schedule.status
                                )}`}
                              >
                                {getStatusText(schedule.status)}
                              </div>

                              <div
                                className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(
                                  schedule.vaccineType.category
                                )}`}
                              >
                                {getCategoryText(schedule.vaccineType.category)}
                              </div>

                              {schedule.vaccineType.isGovernmentRequired && (
                                <div className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  Obligatoria
                                </div>
                              )}
                            </div>

                            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <Beef className="w-4 h-4" />
                                <span>
                                  <strong>{schedule.bovineName}</strong> (
                                  {schedule.bovineTag})
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>
                                  {new Date(
                                    schedule.scheduledDate
                                  ).toLocaleDateString()}{" "}
                                  - {schedule.scheduledTime}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{schedule.location}</span>
                              </div>

                              {schedule.veterinarian && (
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4" />
                                  <span>{schedule.veterinarian}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>${schedule.cost.toFixed(2)}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <Target className="w-4 h-4" />
                                <span>
                                  Dosis {schedule.doseNumber} de{" "}
                                  {schedule.totalDoses}
                                </span>
                              </div>
                            </div>

                            {/* Información adicional */}
                            <div className="bg-gray-50 rounded-lg p-3 mb-3">
                              <div className="grid md:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-500">
                                    Fabricante:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {schedule.vaccineType.manufacturer}
                                  </span>
                                </div>

                                <div>
                                  <span className="text-gray-500">
                                    Dosificación:
                                  </span>
                                  <span className="ml-2 font-medium">
                                    {schedule.vaccineType.dosageInstructions}
                                  </span>
                                </div>

                                {schedule.batchNumber && (
                                  <div>
                                    <span className="text-gray-500">Lote:</span>
                                    <span className="ml-2 font-medium">
                                      {schedule.batchNumber}
                                    </span>
                                  </div>
                                )}

                                {schedule.expirationDate && (
                                  <div>
                                    <span className="text-gray-500">
                                      Vence:
                                    </span>
                                    <span className="ml-2 font-medium">
                                      {new Date(
                                        schedule.expirationDate
                                      ).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}

                                <div>
                                  <span className="text-gray-500">Retiro:</span>
                                  <span className="ml-2 font-medium">
                                    {schedule.vaccineType.withdrawalPeriod} días
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-gray-500">
                                    Recordatorio:
                                  </span>
                                  {schedule.reminderSent ? (
                                    <span className="text-green-600 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3" />
                                      Enviado
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">
                                      Pendiente
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Alertas específicas */}
                            {isOverdue(schedule) && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                                <div className="flex items-center gap-2 text-red-700">
                                  <AlertTriangle className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    Vacunación vencida desde{" "}
                                    {new Date(
                                      schedule.scheduledDate
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            )}

                            {isUpcomingSoon(schedule) && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                                <div className="flex items-center gap-2 text-yellow-700">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm font-medium">
                                    Vacunación próxima - Preparar equipos y
                                    materiales
                                  </span>
                                </div>
                              </div>
                            )}

                            {schedule.notes && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                <div className="flex items-start gap-2 text-blue-700">
                                  <Info className="w-4 h-4 mt-0.5" />
                                  <span className="text-sm">
                                    {schedule.notes}
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Información de creación */}
                            <div className="text-xs text-gray-500">
                              Creado por {schedule.createdBy} el{" "}
                              {new Date(
                                schedule.createdAt
                              ).toLocaleDateString()}
                              {schedule.updatedAt !== schedule.createdAt && (
                                <span>
                                  {" "}
                                  • Actualizado el{" "}
                                  {new Date(
                                    schedule.updatedAt
                                  ).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2 ml-4">
                        {schedule.status === "scheduled" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() =>
                              handleCompleteVaccination(schedule.id)
                            }
                            disabled={isLoading}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Marcar como completada"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </motion.button>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setShowDetailModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit3 className="w-5 h-5" />
                        </motion.button>

                        {schedule.status !== "completed" && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteSchedule(schedule.id)}
                            disabled={isLoading}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            title="Eliminar"
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        )}

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Más opciones"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === "protocols" && (
            <motion.div
              key="protocols"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Lista de Protocolos */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {protocols.map((protocol) => (
                  <motion.div
                    key={protocol.id}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {protocol.name}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {protocol.targetCategory}
                          </p>
                        </div>
                      </div>

                      {protocol.isGovernmentRequired && (
                        <div className="px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs flex items-center gap-1">
                          <Shield className="w-3 h-3" />
                          Obligatorio
                        </div>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4">
                      {protocol.description}
                    </p>

                    <div className="space-y-3 mb-4">
                      <div className="text-sm">
                        <span className="text-gray-500">
                          Vacunas incluidas:
                        </span>
                        <span className="ml-2 font-medium">
                          {protocol.vaccines.length}
                        </span>
                      </div>

                      <div className="text-sm">
                        <span className="text-gray-500">Frecuencia:</span>
                        <span className="ml-2 font-medium capitalize">
                          {protocol.frequency === "annual"
                            ? "Anual"
                            : protocol.frequency === "biannual"
                            ? "Bianual"
                            : "Según necesidad"}
                        </span>
                      </div>

                      {protocol.seasonality && (
                        <div className="text-sm">
                          <span className="text-gray-500">Temporada:</span>
                          <span className="ml-2 font-medium">
                            {protocol.seasonality.startMonth}-
                            {protocol.seasonality.endMonth}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                      >
                        Ver Detalle
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                      >
                        Aplicar
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "vaccines" && (
            <motion.div
              key="vaccines"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Catálogo de Vacunas */}
              <div className="space-y-4">
                {vaccines.map((vaccine) => (
                  <motion.div
                    key={vaccine.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <Syringe className="w-6 h-6 text-purple-600" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {vaccine.name}
                            </h3>
                            <div
                              className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(
                                vaccine.category
                              )}`}
                            >
                              {getCategoryText(vaccine.category)}
                            </div>
                          </div>

                          <p className="text-gray-600 mb-3">
                            {vaccine.description}
                          </p>

                          <div className="grid md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Fabricante:</span>
                              <p className="font-medium">
                                {vaccine.manufacturer}
                              </p>
                            </div>

                            <div>
                              <span className="text-gray-500">
                                Dosificación:
                              </span>
                              <p className="font-medium">
                                {vaccine.dosageInstructions}
                              </p>
                            </div>

                            <div>
                              <span className="text-gray-500">
                                Costo por dosis:
                              </span>
                              <p className="font-medium">
                                ${vaccine.costPerDose.toFixed(2)}
                              </p>
                            </div>

                            <div>
                              <span className="text-gray-500">
                                Almacenamiento:
                              </span>
                              <p className="font-medium">
                                {vaccine.storageRequirements}
                              </p>
                            </div>

                            <div>
                              <span className="text-gray-500">Retiro:</span>
                              <p className="font-medium">
                                {vaccine.withdrawalPeriod} días
                              </p>
                            </div>

                            <div>
                              <span className="text-gray-500">
                                Edad mínima:
                              </span>
                              <p className="font-medium">
                                {vaccine.ageRestrictions.minAge} meses
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          ${vaccine.costPerDose.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">por dosis</div>
                      </div>
                    </div>

                    {/* Información adicional colapsable */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Efectos Secundarios
                          </h4>
                          <ul className="space-y-1 text-gray-600">
                            {vaccine.sideEffects.map((effect, index) => (
                              <li
                                key={index}
                                className="flex items-center gap-2"
                              >
                                <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                                {effect}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">
                            Contraindicaciones
                          </h4>
                          <ul className="space-y-1 text-gray-600">
                            {vaccine.contraindications.map(
                              (contraindication, index) => (
                                <li
                                  key={index}
                                  className="flex items-center gap-2"
                                >
                                  <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                                  {contraindication}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm"
                        >
                          Programar Vacunación
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                        >
                          Ver Ficha Técnica
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200"
            >
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Historial de Vacunaciones
              </h3>
              <p className="text-gray-600 mb-4">
                Esta sección mostrará el historial completo de vacunaciones por
                bovino
              </p>
              <p className="text-sm text-gray-500">
                Funcionalidad en desarrollo
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de Detalles (placeholder) */}
        <AnimatePresence>
          {showDetailModal && selectedSchedule && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Detalles de Vacunación
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Contenido detallado del modal */}
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                      <Syringe className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {selectedSchedule.vaccineName}
                      </h4>
                      <p className="text-gray-600">
                        Bovino: {selectedSchedule.bovineName} (
                        {selectedSchedule.bovineTag})
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900">
                        Información de la Vacunación
                      </h5>
                      {/* Más detalles aquí */}
                    </div>

                    <div className="space-y-4">
                      <h5 className="font-medium text-gray-900">
                        Información de la Vacuna
                      </h5>
                      {/* Más detalles aquí */}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-6 border-t">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Generar Certificado
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Editar
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default VaccinationSchedule;
