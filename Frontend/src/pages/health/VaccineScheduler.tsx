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
  Bell,
  Shield,
  FileText,
  User,
  MapPin,
  DollarSign,
  Eye,
  Info,
  Activity,
  Target,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Interfaces TypeScript - Comentarios en español
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
  status: ScheduleStatus;
  doseNumber: number;
  totalDoses: number;
  nextDueDate?: string;
  completedDate?: string;
  veterinarian?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  batchNumber?: string;
  expirationDate?: string;
  notes?: string;
  cost: number;
  reminderSent: boolean;
  certificateGenerated: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  priority: Priority;
}

interface VaccineType {
  id: string;
  name: string;
  manufacturer: string;
  category: VaccineCategory;
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
  targetCategory: AnimalCategory;
  vaccines: ProtocolVaccine[];
  isGovernmentRequired: boolean;
  seasonality?: {
    startMonth: number;
    endMonth: number;
  };
  frequency: Frequency;
  createdBy: string;
  lastUpdated: string;
}

interface ProtocolVaccine {
  vaccineId: string;
  vaccineName: string;
  sequence: number;
  ageInMonths: number;
  intervalDays?: number;
  isOptional: boolean;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  schedules: VaccinationSchedule[];
  hasScheduled: boolean;
  hasOverdue: boolean;
  hasCompleted: boolean;
}

// Enums para tipos específicos
enum ScheduleStatus {
  SCHEDULED = "scheduled",
  COMPLETED = "completed",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
  RESCHEDULED = "rescheduled",
}

enum VaccineCategory {
  VIRAL = "viral",
  BACTERIAL = "bacterial",
  PARASITIC = "parasitic",
  MULTIVALENT = "multivalent",
  OTHER = "other",
}

enum AnimalCategory {
  CALVES = "calves",
  ADULTS = "adults",
  BREEDING = "breeding",
  ALL = "all",
}

enum Frequency {
  ANNUAL = "annual",
  BIANNUAL = "biannual",
  AS_NEEDED = "as_needed",
}

enum Priority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  URGENT = "urgent",
}

// Componente principal del programador de vacunas
const VaccineScheduler: React.FC = () => {
  // Estados del componente - Comentarios en español
  const [schedules, setSchedules] = useState<VaccinationSchedule[]>([]);
  const [protocols, setProtocols] = useState<VaccinationProtocol[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list" | "protocols">(
    "calendar"
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ScheduleStatus | "all">(
    "all"
  );
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<VaccinationSchedule | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [, setShowCreateModal] = useState(false);

  // Carga de datos simulada
  useEffect(() => {
    const loadSchedulerData = async () => {
      setIsLoading(true);

      // Datos de ejemplo para programaciones
      const mockSchedules: VaccinationSchedule[] = [
        {
          id: "sched-001",
          bovineId: "bovine-001",
          bovineName: "Esperanza",
          bovineTag: "ESP-001",
          vaccineId: "vac-001",
          vaccineName: "Triple Viral Bovina",
          vaccineType: {
            id: "vac-001",
            name: "Triple Viral Bovina",
            manufacturer: "Zoetis",
            category: VaccineCategory.VIRAL,
            description: "Vacuna contra IBR, BVD y PI3",
            dosageInstructions: "2 ml intramuscular",
            storageRequirements: "2-8°C",
            sideEffects: ["Ligera fiebre", "Inflamación local"],
            contraindications: ["Embarazo", "Inmunosupresión"],
            withdrawalPeriod: 21,
            boosterRequired: true,
            boosterInterval: 365,
            ageRestrictions: { minAge: 3 },
            regulatoryApproval: "SENASICA-2024-001",
            costPerDose: 45.5,
            isGovernmentRequired: true,
          },
          scheduledDate: "2025-07-15",
          scheduledTime: "09:00",
          status: ScheduleStatus.SCHEDULED,
          doseNumber: 1,
          totalDoses: 2,
          nextDueDate: "2025-08-15",
          veterinarian: "Dr. María García",
          location: {
            latitude: 17.9889,
            longitude: -92.9303,
            address: "Sector Norte, Rancho La Esperanza",
          },
          cost: 45.5,
          reminderSent: true,
          certificateGenerated: false,
          createdAt: "2025-07-10T08:00:00Z",
          updatedAt: "2025-07-10T08:00:00Z",
          createdBy: "admin",
          priority: Priority.HIGH,
          notes: "Primera dosis del protocolo anual",
        },
        {
          id: "sched-002",
          bovineId: "bovine-002",
          bovineName: "Tormenta",
          bovineTag: "TOR-002",
          vaccineId: "vac-002",
          vaccineName: "Vacuna contra Brucelosis",
          vaccineType: {
            id: "vac-002",
            name: "Vacuna contra Brucelosis",
            manufacturer: "Colorado Serum Company",
            category: VaccineCategory.BACTERIAL,
            description: "Vacuna RB51 contra brucelosis bovina",
            dosageInstructions: "5 ml subcutáneo",
            storageRequirements: "2-8°C",
            sideEffects: ["Inflamación local", "Posible fiebre"],
            contraindications: ["Animales gestantes"],
            withdrawalPeriod: 0,
            boosterRequired: false,
            boosterInterval: 0,
            ageRestrictions: { minAge: 3, maxAge: 8 },
            regulatoryApproval: "SENASICA-2024-002",
            costPerDose: 65.0,
            isGovernmentRequired: true,
          },
          scheduledDate: "2025-07-20",
          scheduledTime: "14:30",
          status: ScheduleStatus.SCHEDULED,
          doseNumber: 1,
          totalDoses: 1,
          veterinarian: "Dr. Carlos Rodríguez",
          location: {
            latitude: 17.992,
            longitude: -92.925,
            address: "Corral Principal, Rancho La Esperanza",
          },
          cost: 65.0,
          reminderSent: false,
          certificateGenerated: false,
          createdAt: "2025-07-08T10:00:00Z",
          updatedAt: "2025-07-08T10:00:00Z",
          createdBy: "admin",
          priority: Priority.URGENT,
          notes: "Vacunación obligatoria para hembras jóvenes",
        },
        {
          id: "sched-003",
          bovineId: "bovine-003",
          bovineName: "Madrugada",
          bovineTag: "MAD-003",
          vaccineId: "vac-003",
          vaccineName: "Vacuna Pentavalente",
          vaccineType: {
            id: "vac-003",
            name: "Vacuna Pentavalente",
            manufacturer: "MSD Animal Health",
            category: VaccineCategory.MULTIVALENT,
            description: "Protección contra 5 enfermedades principales",
            dosageInstructions: "3 ml intramuscular",
            storageRequirements: "2-8°C",
            sideEffects: ["Inflamación mínima"],
            contraindications: ["Enfermedad aguda"],
            withdrawalPeriod: 14,
            boosterRequired: true,
            boosterInterval: 180,
            ageRestrictions: { minAge: 6 },
            regulatoryApproval: "SENASICA-2024-003",
            costPerDose: 58.75,
            isGovernmentRequired: false,
          },
          scheduledDate: "2025-07-10",
          scheduledTime: "11:00",
          status: ScheduleStatus.OVERDUE,
          doseNumber: 2,
          totalDoses: 2,
          nextDueDate: "2026-01-10",
          veterinarian: "Dr. María García",
          location: {
            latitude: 17.985,
            longitude: -92.94,
            address: "Potrero Sur, Rancho La Esperanza",
          },
          cost: 58.75,
          reminderSent: true,
          certificateGenerated: false,
          createdAt: "2025-07-05T07:00:00Z",
          updatedAt: "2025-07-05T07:00:00Z",
          createdBy: "admin",
          priority: Priority.MEDIUM,
          notes: "Segunda dosis del refuerzo",
        },
      ];

      // Datos de ejemplo para protocolos
      const mockProtocols: VaccinationProtocol[] = [
        {
          id: "prot-001",
          name: "Protocolo Terneros",
          description:
            "Protocolo estándar de vacunación para terneros de 0-12 meses",
          targetCategory: AnimalCategory.CALVES,
          vaccines: [
            {
              vaccineId: "vac-001",
              vaccineName: "Triple Viral Bovina",
              sequence: 1,
              ageInMonths: 3,
              intervalDays: 30,
              isOptional: false,
            },
            {
              vaccineId: "vac-003",
              vaccineName: "Vacuna Pentavalente",
              sequence: 2,
              ageInMonths: 6,
              intervalDays: 60,
              isOptional: false,
            },
          ],
          isGovernmentRequired: true,
          seasonality: { startMonth: 3, endMonth: 11 },
          frequency: Frequency.ANNUAL,
          createdBy: "Dr. García",
          lastUpdated: "2025-07-08T00:00:00Z",
        },
        {
          id: "prot-002",
          name: "Protocolo Reproductoras",
          description: "Protocolo especializado para hembras reproductoras",
          targetCategory: AnimalCategory.BREEDING,
          vaccines: [
            {
              vaccineId: "vac-002",
              vaccineName: "Vacuna contra Brucelosis",
              sequence: 1,
              ageInMonths: 4,
              isOptional: false,
            },
          ],
          isGovernmentRequired: true,
          frequency: Frequency.AS_NEEDED,
          createdBy: "Dr. Rodríguez",
          lastUpdated: "2025-07-05T00:00:00Z",
        },
      ];

      setTimeout(() => {
        setSchedules(mockSchedules);
        setProtocols(mockProtocols);
        setIsLoading(false);
      }, 1200);
    };

    loadSchedulerData();
  }, []);

  // Filtrado de programaciones
  const filteredSchedules = useMemo(() => {
    let filtered = schedules;

    if (searchTerm) {
      filtered = filtered.filter(
        (schedule) =>
          schedule.bovineName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          schedule.bovineTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
          schedule.vaccineName
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          schedule.veterinarian
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (schedule) => schedule.status === statusFilter
      );
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (schedule) => schedule.priority === priorityFilter
      );
    }

    return filtered;
  }, [schedules, searchTerm, statusFilter, priorityFilter]);

  // Generación del calendario
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const currentDateStr = new Date().toDateString();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);

      const daySchedules = filteredSchedules.filter(
        (schedule) =>
          new Date(schedule.scheduledDate).toDateString() ===
          date.toDateString()
      );

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === currentDateStr,
        isSelected: selectedDate?.toDateString() === date.toDateString(),
        schedules: daySchedules,
        hasScheduled: daySchedules.some(
          (s) => s.status === ScheduleStatus.SCHEDULED
        ),
        hasOverdue: daySchedules.some(
          (s) => s.status === ScheduleStatus.OVERDUE
        ),
        hasCompleted: daySchedules.some(
          (s) => s.status === ScheduleStatus.COMPLETED
        ),
      });
    }

    return days;
  }, [currentDate, filteredSchedules, selectedDate]);

  // Cálculo de estadísticas
  const getSchedulerStats = () => {
    const total = schedules.length;
    const scheduled = schedules.filter(
      (s) => s.status === ScheduleStatus.SCHEDULED
    ).length;
    const completed = schedules.filter(
      (s) => s.status === ScheduleStatus.COMPLETED
    ).length;
    const overdue = schedules.filter(
      (s) => s.status === ScheduleStatus.OVERDUE
    ).length;
    const thisWeek = schedules.filter((s) => {
      const scheduleDate = new Date(s.scheduledDate);
      const now = new Date();
      const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      return scheduleDate >= now && scheduleDate <= weekFromNow;
    }).length;
    const totalCost = schedules.reduce((sum, s) => sum + s.cost, 0);

    return { total, scheduled, completed, overdue, thisWeek, totalCost };
  };

  const stats = getSchedulerStats();

  // Funciones de utilidad
  const getStatusColor = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.SCHEDULED:
        return "text-blue-600 bg-blue-100";
      case ScheduleStatus.COMPLETED:
        return "text-green-600 bg-green-100";
      case ScheduleStatus.OVERDUE:
        return "text-red-600 bg-red-100";
      case ScheduleStatus.CANCELLED:
        return "text-gray-600 bg-gray-100";
      case ScheduleStatus.RESCHEDULED:
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return "text-gray-600 bg-gray-100";
      case Priority.MEDIUM:
        return "text-blue-600 bg-blue-100";
      case Priority.HIGH:
        return "text-orange-600 bg-orange-100";
      case Priority.URGENT:
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: ScheduleStatus) => {
    switch (status) {
      case ScheduleStatus.SCHEDULED:
        return "Programada";
      case ScheduleStatus.COMPLETED:
        return "Completada";
      case ScheduleStatus.OVERDUE:
        return "Vencida";
      case ScheduleStatus.CANCELLED:
        return "Cancelada";
      case ScheduleStatus.RESCHEDULED:
        return "Reprogramada";
      default:
        return status;
    }
  };

  const getPriorityText = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW:
        return "Baja";
      case Priority.MEDIUM:
        return "Media";
      case Priority.HIGH:
        return "Alta";
      case Priority.URGENT:
        return "Urgente";
      default:
        return priority;
    }
  };

  // Navegación del calendario
  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con título y controles */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                Programador de Vacunas
              </h1>
              <p className="text-white/90 text-lg">
                Gestión y planificación de calendarios de vacunación
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-colors"
              >
                <Plus size={20} />
                Nueva Programación
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl flex items-center gap-2 backdrop-blur-sm transition-colors"
              >
                <Filter size={20} />
                Filtros
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg transition-colors"
              >
                <Download size={20} />
                Exportar
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Tarjetas de estadísticas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Programadas
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Programadas</p>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.scheduled}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Completadas</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.completed}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Vencidas</p>
                <p className="text-3xl font-bold text-red-600">
                  {stats.overdue}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Esta Semana</p>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.thisWeek}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Bell className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Costo Total</p>
                <p className="text-3xl font-bold text-emerald-600">
                  ${stats.totalCost.toFixed(2)}
                </p>
              </div>
              <div className="bg-emerald-100 p-3 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Panel de filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Animal, vacuna, veterinario..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as ScheduleStatus | "all")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="all">Todos los estados</option>
                    <option value={ScheduleStatus.SCHEDULED}>Programada</option>
                    <option value={ScheduleStatus.COMPLETED}>Completada</option>
                    <option value={ScheduleStatus.OVERDUE}>Vencida</option>
                    <option value={ScheduleStatus.CANCELLED}>Cancelada</option>
                    <option value={ScheduleStatus.RESCHEDULED}>
                      Reprogramada
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridad
                  </label>
                  <select
                    value={priorityFilter}
                    onChange={(e) =>
                      setPriorityFilter(e.target.value as Priority | "all")
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="all">Todas las prioridades</option>
                    <option value={Priority.LOW}>Baja</option>
                    <option value={Priority.MEDIUM}>Media</option>
                    <option value={Priority.HIGH}>Alta</option>
                    <option value={Priority.URGENT}>Urgente</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vista
                  </label>
                  <select
                    value={viewMode}
                    onChange={(e) =>
                      setViewMode(
                        e.target.value as "calendar" | "list" | "protocols"
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="calendar">Calendario</option>
                    <option value="list">Lista</option>
                    <option value="protocols">Protocolos</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                >
                  Limpiar Filtros
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Aplicar
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading state */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/95 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-white/20 text-center"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full mx-auto mb-4"
            />
            <p className="text-gray-600 text-lg">
              Cargando programador de vacunas...
            </p>
          </motion.div>
        ) : (
          <>
            {/* Vista de Calendario */}
            {viewMode === "calendar" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden"
              >
                {/* Header del calendario */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                      {currentDate.toLocaleDateString("es-ES", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h2>
                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigateMonth("prev")}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronLeft size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentDate(new Date())}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                      >
                        Hoy
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigateMonth("next")}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ChevronRight size={20} />
                      </motion.button>
                    </div>
                  </div>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 border-b border-gray-200">
                  {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(
                    (day) => (
                      <div
                        key={day}
                        className="p-4 text-center text-sm font-medium text-gray-500 bg-gray-50"
                      >
                        {day}
                      </div>
                    )
                  )}
                </div>

                {/* Calendario de días */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedDate(day.date)}
                      className={`p-2 h-24 border-r border-b border-gray-100 cursor-pointer transition-colors ${
                        !day.isCurrentMonth
                          ? "bg-gray-50 text-gray-400"
                          : day.isToday
                          ? "bg-blue-50"
                          : day.isSelected
                          ? "bg-emerald-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="h-full flex flex-col">
                        <div
                          className={`text-sm font-medium mb-1 ${
                            day.isToday
                              ? "text-blue-600"
                              : day.isSelected
                              ? "text-emerald-600"
                              : ""
                          }`}
                        >
                          {day.date.getDate()}
                        </div>

                        <div className="flex-1 space-y-1">
                          {day.schedules.slice(0, 2).map((schedule) => (
                            <motion.div
                              key={schedule.id}
                              whileHover={{ scale: 1.05 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSchedule(schedule);
                                setShowDetailModal(true);
                              }}
                              className={`text-xs px-1 py-0.5 rounded truncate cursor-pointer ${
                                schedule.status === ScheduleStatus.SCHEDULED
                                  ? "bg-blue-100 text-blue-700"
                                  : schedule.status === ScheduleStatus.OVERDUE
                                  ? "bg-red-100 text-red-700"
                                  : schedule.status === ScheduleStatus.COMPLETED
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {schedule.bovineName}
                            </motion.div>
                          ))}

                          {day.schedules.length > 2 && (
                            <div className="text-xs text-gray-500 px-1">
                              +{day.schedules.length - 2} más
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Vista de Lista */}
            {viewMode === "list" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden"
              >
                {filteredSchedules.length === 0 ? (
                  <div className="p-12 text-center">
                    <Syringe className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No se encontraron programaciones
                    </h3>
                    <p className="text-gray-500">
                      Intenta ajustar los filtros o crear una nueva programación
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredSchedules.map((schedule) => (
                      <motion.div
                        key={schedule.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedSchedule(schedule);
                          setShowDetailModal(true);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <Syringe className="w-6 h-6 text-emerald-600" />
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {schedule.bovineName} ({schedule.bovineTag})
                                </h3>
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                                    schedule.status
                                  )}`}
                                >
                                  {getStatusText(schedule.status)}
                                </span>
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                                    schedule.priority
                                  )}`}
                                >
                                  {getPriorityText(schedule.priority)}
                                </span>
                              </div>

                              <p className="text-gray-700 font-medium mb-1">
                                {schedule.vaccineName}
                              </p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                  <Calendar size={14} />
                                  {new Date(
                                    schedule.scheduledDate
                                  ).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {schedule.scheduledTime}
                                </div>
                                <div className="flex items-center gap-1">
                                  <User size={14} />
                                  {schedule.veterinarian || "Sin asignar"}
                                </div>
                                <div className="flex items-center gap-1">
                                  <DollarSign size={14} />$
                                  {schedule.cost.toFixed(2)}
                                </div>
                              </div>

                              {schedule.notes && (
                                <p className="text-sm text-gray-500 mt-2 italic">
                                  {schedule.notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSchedule(schedule);
                                setShowDetailModal(true);
                              }}
                              className="text-emerald-600 hover:text-emerald-900 p-2 rounded-lg hover:bg-emerald-50"
                              title="Ver detalles"
                            >
                              <Eye size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50"
                              title="Editar"
                            >
                              <Edit3 size={16} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50"
                              title="Eliminar"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Vista de Protocolos */}
            {viewMode === "protocols" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                {protocols.map((protocol) => (
                  <motion.div
                    key={protocol.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {protocol.name}
                          </h3>
                          <p className="text-sm text-gray-500 capitalize">
                            {protocol.targetCategory === AnimalCategory.CALVES
                              ? "Terneros"
                              : protocol.targetCategory ===
                                AnimalCategory.ADULTS
                              ? "Adultos"
                              : protocol.targetCategory ===
                                AnimalCategory.BREEDING
                              ? "Reproductoras"
                              : "Todos"}
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
                          {protocol.frequency === Frequency.ANNUAL
                            ? "Anual"
                            : protocol.frequency === Frequency.BIANNUAL
                            ? "Semestral"
                            : "Según necesidad"}
                        </span>
                      </div>

                      {protocol.seasonality && (
                        <div className="text-sm">
                          <span className="text-gray-500">Temporada:</span>
                          <span className="ml-2 font-medium">
                            Mes {protocol.seasonality.startMonth} -{" "}
                            {protocol.seasonality.endMonth}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 mb-4">
                      <h4 className="text-sm font-medium text-gray-700">
                        Secuencia de Vacunas:
                      </h4>
                      {protocol.vaccines.map((vaccine) => (
                        <div
                          key={vaccine.vaccineId}
                          className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {vaccine.sequence}. {vaccine.vaccineName}
                            </p>
                            <p className="text-xs text-gray-500">
                              A los {vaccine.ageInMonths} meses
                              {vaccine.intervalDays &&
                                `, cada ${vaccine.intervalDays} días`}
                            </p>
                          </div>
                          {!vaccine.isOptional && (
                            <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                              Requerida
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        Por: {protocol.createdBy}
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-emerald-600 hover:text-emerald-900 p-1 rounded"
                          title="Aplicar protocolo"
                        >
                          <Target size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Editar protocolo"
                        >
                          <Edit3 size={16} />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}

        {/* Modal de detalles */}
        <AnimatePresence>
          {showDetailModal && selectedSchedule && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-gray-900">
                      Detalles de Programación
                    </h3>
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                    >
                      <X size={24} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Activity size={20} />
                        Información del Animal
                      </h4>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Nombre:</span>{" "}
                          {selectedSchedule.bovineName}
                        </p>
                        <p>
                          <span className="font-medium">Etiqueta:</span>{" "}
                          {selectedSchedule.bovineTag}
                        </p>
                        <p>
                          <span className="font-medium">ID:</span>{" "}
                          {selectedSchedule.bovineId}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Syringe size={20} />
                        Información de la Vacuna
                      </h4>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Vacuna:</span>{" "}
                          {selectedSchedule.vaccineName}
                        </p>
                        <p>
                          <span className="font-medium">Fabricante:</span>{" "}
                          {selectedSchedule.vaccineType.manufacturer}
                        </p>
                        <p>
                          <span className="font-medium">Categoría:</span>{" "}
                          {selectedSchedule.vaccineType.category}
                        </p>
                        <p>
                          <span className="font-medium">Dosis:</span>{" "}
                          {selectedSchedule.doseNumber} de{" "}
                          {selectedSchedule.totalDoses}
                        </p>
                        <p>
                          <span className="font-medium">Costo:</span> $
                          {selectedSchedule.cost.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Calendar size={20} />
                        Programación
                      </h4>
                      <div className="space-y-2">
                        <p>
                          <span className="font-medium">Fecha programada:</span>{" "}
                          {new Date(
                            selectedSchedule.scheduledDate
                          ).toLocaleDateString()}
                        </p>
                        <p>
                          <span className="font-medium">Hora:</span>{" "}
                          {selectedSchedule.scheduledTime}
                        </p>
                        {selectedSchedule.nextDueDate && (
                          <p>
                            <span className="font-medium">Próxima dosis:</span>{" "}
                            {new Date(
                              selectedSchedule.nextDueDate
                            ).toLocaleDateString()}
                          </p>
                        )}
                        {selectedSchedule.completedDate && (
                          <p>
                            <span className="font-medium">Completada:</span>{" "}
                            {new Date(
                              selectedSchedule.completedDate
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin size={20} />
                        Ubicación y Personal
                      </h4>
                      <div className="space-y-2">
                        {selectedSchedule.veterinarian && (
                          <p>
                            <span className="font-medium">Veterinario:</span>{" "}
                            {selectedSchedule.veterinarian}
                          </p>
                        )}
                        <p>
                          <span className="font-medium">Ubicación:</span>{" "}
                          {selectedSchedule.location.address}
                        </p>
                        <p>
                          <span className="font-medium">Creado por:</span>{" "}
                          {selectedSchedule.createdBy}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                        <Info size={20} />
                        Estado y Prioridad
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Estado:</span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                              selectedSchedule.status
                            )}`}
                          >
                            {getStatusText(selectedSchedule.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Prioridad:</span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                              selectedSchedule.priority
                            )}`}
                          >
                            {getPriorityText(selectedSchedule.priority)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Recordatorio enviado:
                          </span>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              selectedSchedule.reminderSent
                                ? "text-green-600 bg-green-100"
                                : "text-gray-600 bg-gray-100"
                            }`}
                          >
                            {selectedSchedule.reminderSent ? "Sí" : "No"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                        <Shield size={20} />
                        Información de la Vacuna
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p>
                          <span className="font-medium">Descripción:</span>{" "}
                          {selectedSchedule.vaccineType.description}
                        </p>
                        <p>
                          <span className="font-medium">Instrucciones:</span>{" "}
                          {selectedSchedule.vaccineType.dosageInstructions}
                        </p>
                        <p>
                          <span className="font-medium">
                            Período de retiro:
                          </span>{" "}
                          {selectedSchedule.vaccineType.withdrawalPeriod} días
                        </p>
                        {selectedSchedule.vaccineType.isGovernmentRequired && (
                          <div className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                            ⚠️ Vacuna obligatoria por regulación gubernamental
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedSchedule.notes && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                        <FileText size={20} />
                        Notas Adicionales
                      </h4>
                      <p className="text-gray-700">{selectedSchedule.notes}</p>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cerrar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                  >
                    <Edit3 size={16} />
                    Editar
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VaccineScheduler;
