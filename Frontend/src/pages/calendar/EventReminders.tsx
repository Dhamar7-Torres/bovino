import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Clock,
  Calendar,
  Users,
  Mail,
  Phone,
  MessageSquare,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  EyeOff,
  MoreVertical,
  Beef,
  Syringe,
  Heart,
  Baby,
  Package,
  Stethoscope,
  FileText,
  MapPin,
  DollarSign,
  Loader,
} from "lucide-react";

// Interfaces para TypeScript
interface ReminderData {
  id: string;
  eventId: string;
  eventTitle: string;
  eventType: EventType;
  eventDate: string;
  eventTime: string;
  reminderType: ReminderType;
  reminderTime: string;
  status: "active" | "sent" | "dismissed" | "failed" | "scheduled";
  recipients: Recipient[];
  methods: NotificationMethod[];
  priority: "low" | "medium" | "high" | "urgent";
  message: string;
  customMessage?: string;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  dismissedAt?: string;
  createdBy: string;
  metadata?: ReminderMetadata;
}

interface EventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  category: "health" | "reproduction" | "nutrition" | "general";
}

interface ReminderType {
  id: string;
  name: string;
  timeOffset: number; // en minutos
  description: string;
  isDefault: boolean;
}

interface Recipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: "owner" | "veterinarian" | "worker" | "admin" | "external";
  isActive: boolean;
  preferences: NotificationPreferences;
}

interface NotificationMethod {
  type: "email" | "sms" | "push" | "whatsapp" | "call" | "system";
  isEnabled: boolean;
  settings?: Record<string, any>;
}

interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  whatsapp: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
  frequency: "immediate" | "daily_digest" | "weekly_summary";
}

interface RecurringPattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  endDate?: string;
  occurrences?: number;
}

interface ReminderMetadata {
  bovineCount: number;
  location: string;
  estimatedCost?: number;
  urgencyLevel: number;
  weatherAlert?: boolean;
  equipmentNeeded?: string[];
}

// Tipos de eventos disponibles
const eventTypes: Record<string, EventType> = {
  vaccination: {
    id: "vaccination",
    name: "Vacunación",
    icon: Syringe,
    color: "bg-green-500",
    category: "health",
  },
  illness: {
    id: "illness",
    name: "Enfermedad",
    icon: Heart,
    color: "bg-red-500",
    category: "health",
  },
  checkup: {
    id: "checkup",
    name: "Revisión Médica",
    icon: Stethoscope,
    color: "bg-blue-500",
    category: "health",
  },
  birth: {
    id: "birth",
    name: "Parto",
    icon: Baby,
    color: "bg-pink-500",
    category: "reproduction",
  },
  feeding: {
    id: "feeding",
    name: "Alimentación",
    icon: Package,
    color: "bg-orange-500",
    category: "nutrition",
  },
  general: {
    id: "general",
    name: "General",
    icon: FileText,
    color: "bg-gray-500",
    category: "general",
  },
};

// Tipos de recordatorios disponibles
const reminderTypes: ReminderType[] = [
  {
    id: "15min",
    name: "15 minutos antes",
    timeOffset: 15,
    description: "Recordatorio inmediato",
    isDefault: false,
  },
  {
    id: "1hour",
    name: "1 hora antes",
    timeOffset: 60,
    description: "Preparación inmediata",
    isDefault: false,
  },
  {
    id: "1day",
    name: "1 día antes",
    timeOffset: 1440,
    description: "Recordatorio estándar",
    isDefault: true,
  },
  {
    id: "3days",
    name: "3 días antes",
    timeOffset: 4320,
    description: "Planificación temprana",
    isDefault: false,
  },
  {
    id: "1week",
    name: "1 semana antes",
    timeOffset: 10080,
    description: "Planificación extendida",
    isDefault: false,
  },
  {
    id: "1month",
    name: "1 mes antes",
    timeOffset: 43200,
    description: "Planificación a largo plazo",
    isDefault: false,
  },
];

// Mock data para recordatorios
const mockReminders: ReminderData[] = [
  {
    id: "rem_001",
    eventId: "evt_001",
    eventTitle: "Vacunación Antirrábica - Lote A",
    eventType: eventTypes.vaccination,
    eventDate: "2025-07-15",
    eventTime: "09:00",
    reminderType: reminderTypes[2], // 1 día antes
    reminderTime: "2025-07-14T09:00:00Z",
    status: "sent",
    recipients: [
      {
        id: "user_001",
        name: "Dr. Carlos Ruiz",
        email: "carlos.ruiz@rancho.com",
        phone: "+52 442 123 4567",
        role: "owner",
        isActive: true,
        preferences: {
          email: true,
          sms: true,
          push: true,
          whatsapp: false,
          quietHours: { enabled: true, start: "22:00", end: "06:00" },
          frequency: "immediate",
        },
      },
      {
        id: "vet_001",
        name: "Dra. María González",
        email: "maria.gonzalez@veterinaria.com",
        phone: "+52 442 765 4321",
        role: "veterinarian",
        isActive: true,
        preferences: {
          email: true,
          sms: false,
          push: true,
          whatsapp: true,
          quietHours: { enabled: false, start: "00:00", end: "00:00" },
          frequency: "immediate",
        },
      },
    ],
    methods: [
      { type: "email", isEnabled: true },
      { type: "sms", isEnabled: true },
      { type: "push", isEnabled: true },
    ],
    priority: "high",
    message:
      "Recordatorio: Vacunación Antirrábica programada para mañana a las 09:00. Verificar ayuno de 12 horas.",
    isRecurring: false,
    createdAt: "2025-07-01T10:30:00Z",
    updatedAt: "2025-07-14T09:00:00Z",
    sentAt: "2025-07-14T09:00:00Z",
    createdBy: "Dr. Carlos Ruiz",
    metadata: {
      bovineCount: 3,
      location: "Corral A - Zona Norte",
      estimatedCost: 450.0,
      urgencyLevel: 8,
      equipmentNeeded: ["Jeringas", "Vacunas", "Registros"],
    },
  },
  {
    id: "rem_002",
    eventId: "evt_002",
    eventTitle: "Chequeo Médico - Toro Alpha",
    eventType: eventTypes.checkup,
    eventDate: "2025-07-20",
    eventTime: "14:00",
    reminderType: reminderTypes[3], // 3 días antes
    reminderTime: "2025-07-17T14:00:00Z",
    status: "scheduled",
    recipients: [
      {
        id: "user_001",
        name: "Dr. Carlos Ruiz",
        email: "carlos.ruiz@rancho.com",
        phone: "+52 442 123 4567",
        role: "owner",
        isActive: true,
        preferences: {
          email: true,
          sms: true,
          push: true,
          whatsapp: false,
          quietHours: { enabled: true, start: "22:00", end: "06:00" },
          frequency: "immediate",
        },
      },
    ],
    methods: [
      { type: "email", isEnabled: true },
      { type: "push", isEnabled: true },
    ],
    priority: "medium",
    message:
      "Recordatorio: Chequeo médico programado para el Toro Alpha. Revisar historial previo.",
    isRecurring: false,
    createdAt: "2025-07-05T15:20:00Z",
    updatedAt: "2025-07-05T15:20:00Z",
    createdBy: "Dr. Carlos Ruiz",
    metadata: {
      bovineCount: 1,
      location: "Corral B - Zona Sur",
      urgencyLevel: 5,
    },
  },
  {
    id: "rem_003",
    eventId: "evt_003",
    eventTitle: "Parto Asistido - Bella",
    eventType: eventTypes.birth,
    eventDate: "2025-07-25",
    eventTime: "06:00",
    reminderType: reminderTypes[1], // 1 hora antes
    reminderTime: "2025-07-25T05:00:00Z",
    status: "active",
    recipients: [
      {
        id: "user_001",
        name: "Dr. Carlos Ruiz",
        email: "carlos.ruiz@rancho.com",
        phone: "+52 442 123 4567",
        role: "owner",
        isActive: true,
        preferences: {
          email: true,
          sms: true,
          push: true,
          whatsapp: false,
          quietHours: { enabled: true, start: "22:00", end: "06:00" },
          frequency: "immediate",
        },
      },
      {
        id: "worker_001",
        name: "Pedro Martínez",
        email: "pedro.martinez@rancho.com",
        phone: "+52 442 987 6543",
        role: "worker",
        isActive: true,
        preferences: {
          email: false,
          sms: true,
          push: false,
          whatsapp: true,
          quietHours: { enabled: false, start: "00:00", end: "00:00" },
          frequency: "immediate",
        },
      },
    ],
    methods: [
      { type: "sms", isEnabled: true },
      { type: "call", isEnabled: true },
      { type: "whatsapp", isEnabled: true },
    ],
    priority: "urgent",
    message:
      "¡URGENTE! Parto asistido de Bella programado en 1 hora. Preparar equipo de emergencia.",
    isRecurring: false,
    createdAt: "2025-07-20T10:00:00Z",
    updatedAt: "2025-07-20T10:00:00Z",
    createdBy: "Dr. Carlos Ruiz",
    metadata: {
      bovineCount: 1,
      location: "Establo de Maternidad",
      urgencyLevel: 10,
      weatherAlert: true,
      equipmentNeeded: ["Kit de parto", "Guantes", "Antisépticos", "Toallas"],
    },
  },
];

// Mock plantillas de recordatorios

// Componente principal EventReminder
const EventReminder: React.FC = () => {
  // Estados principales
  const [reminders, setReminders] = useState<ReminderData[]>(mockReminders);
  const [filteredReminders, setFilteredReminders] =
    useState<ReminderData[]>(mockReminders);
  const [, setSelectedReminder] = useState<ReminderData | null>(null);
  const [isLoading] = useState(false);

  // Estados de UI
  const [activeTab, setActiveTab] = useState<
    "all" | "active" | "sent" | "failed"
  >("all");
  const [, setShowCreateModal] = useState(false);
  const [, setShowEditModal] = useState(false);
  const [, setShowSettingsModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Estados del formulario
  const [] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Efectos
  useEffect(() => {
    // Aplicar filtros
    let filtered = reminders;

    // Filtro por pestaña activa
    if (activeTab !== "all") {
      filtered = filtered.filter((reminder) => reminder.status === activeTab);
    }

    // Filtro por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(
        (reminder) =>
          reminder.eventTitle
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          reminder.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (reminder) => reminder.status === statusFilter
      );
    }

    // Filtro por prioridad
    if (priorityFilter !== "all") {
      filtered = filtered.filter(
        (reminder) => reminder.priority === priorityFilter
      );
    }

    setFilteredReminders(filtered);
  }, [reminders, activeTab, searchQuery, statusFilter, priorityFilter]);

  // Funciones auxiliares
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "sent":
        return "bg-green-100 text-green-800 border-green-200";
      case "dismissed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "sent":
        return "Enviado";
      case "dismissed":
        return "Descartado";
      case "failed":
        return "Fallido";
      case "scheduled":
        return "Programado";
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

  const formatTimeOffset = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} minutos`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      return `${hours} hora${hours > 1 ? "s" : ""}`;
    } else if (minutes < 10080) {
      const days = Math.floor(minutes / 1440);
      return `${days} día${days > 1 ? "s" : ""}`;
    } else if (minutes < 43200) {
      const weeks = Math.floor(minutes / 10080);
      return `${weeks} semana${weeks > 1 ? "s" : ""}`;
    } else {
      const months = Math.floor(minutes / 43200);
      return `${months} mes${months > 1 ? "es" : ""}`;
    }
  };

  // Funciones de acciones
  const handleDismissReminder = async (reminderId: string) => {
    setIsUpdating(true);
    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id === reminderId
            ? {
                ...reminder,
                status: "dismissed" as const,
                dismissedAt: new Date().toISOString(),
              }
            : reminder
        )
      );
    } catch (error) {
      console.error("Error al descartar recordatorio:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendReminder = async (reminderId: string) => {
    setIsUpdating(true);
    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setReminders((prev) =>
        prev.map((reminder) =>
          reminder.id === reminderId
            ? {
                ...reminder,
                status: "sent" as const,
                sentAt: new Date().toISOString(),
              }
            : reminder
        )
      );
    } catch (error) {
      console.error("Error al reenviar recordatorio:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteReminder = async (reminderId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este recordatorio?")) {
      return;
    }

    setIsUpdating(true);
    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setReminders((prev) =>
        prev.filter((reminder) => reminder.id !== reminderId)
      );
    } catch (error) {
      console.error("Error al eliminar recordatorio:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Contar recordatorios por estado
  const reminderCounts = {
    all: reminders.length,
    active: reminders.filter((r) => r.status === "active").length,
    sent: reminders.filter((r) => r.status === "sent").length,
    failed: reminders.filter((r) => r.status === "failed").length,
  };

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
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                  <Bell className="w-6 h-6" />
                </div>
                Gestión de Recordatorios
              </h1>
              <p className="text-gray-600">
                Administra notificaciones y recordatorios para eventos del
                ganado
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Nuevo Recordatorio
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSettingsModal(true)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configuración
              </motion.button>
            </div>
          </div>

          {/* Estadísticas Rápidas */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Bell className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-xl font-bold text-gray-900">
                    {reminderCounts.all}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Activos</p>
                  <p className="text-xl font-bold text-gray-900">
                    {reminderCounts.active}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Enviados</p>
                  <p className="text-xl font-bold text-gray-900">
                    {reminderCounts.sent}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <X className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Fallidos</p>
                  <p className="text-xl font-bold text-gray-900">
                    {reminderCounts.failed}
                  </p>
                </div>
              </div>
            </div>
          </div>
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
                { id: "all", label: "Todos", count: reminderCounts.all },
                {
                  id: "active",
                  label: "Activos",
                  count: reminderCounts.active,
                },
                { id: "sent", label: "Enviados", count: reminderCounts.sent },
                {
                  id: "failed",
                  label: "Fallidos",
                  count: reminderCounts.failed,
                },
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
                  {tab.label}
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Filtros y Búsqueda */}
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
                    placeholder="Buscar recordatorios..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filtros
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${
                      showFilters ? "rotate-180" : ""
                    }`}
                  />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setPriorityFilter("all");
                  }}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Limpiar
                </motion.button>
              </div>
            </div>

            {/* Filtros Expandidos */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-gray-200 overflow-hidden"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todos los estados</option>
                        <option value="active">Activo</option>
                        <option value="sent">Enviado</option>
                        <option value="scheduled">Programado</option>
                        <option value="dismissed">Descartado</option>
                        <option value="failed">Fallido</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prioridad
                      </label>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="all">Todas las prioridades</option>
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta</option>
                        <option value="urgent">Urgente</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Lista de Recordatorios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {isLoading ? (
            <div className="text-center py-8">
              <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
              <p className="text-gray-600">Cargando recordatorios...</p>
            </div>
          ) : filteredReminders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron recordatorios
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ||
                statusFilter !== "all" ||
                priorityFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Crea tu primer recordatorio para comenzar"}
              </p>
              {!searchQuery &&
                statusFilter === "all" &&
                priorityFilter === "all" && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    Crear Recordatorio
                  </motion.button>
                )}
            </div>
          ) : (
            filteredReminders.map((reminder) => (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header del Recordatorio */}
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-12 h-12 ${reminder.eventType.color} rounded-lg flex items-center justify-center text-white flex-shrink-0`}
                      >
                        <reminder.eventType.icon className="w-6 h-6" />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {reminder.eventTitle}
                          </h3>

                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              reminder.status
                            )}`}
                          >
                            {getStatusText(reminder.status)}
                          </div>

                          <div
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                              reminder.priority
                            )}`}
                          >
                            {getPriorityText(reminder.priority)}
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 mb-2">
                          <p>{reminder.message}</p>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(
                                reminder.eventDate
                              ).toLocaleDateString()}{" "}
                              - {reminder.eventTime}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              Recordatorio:{" "}
                              {formatTimeOffset(
                                reminder.reminderType.timeOffset
                              )}{" "}
                              antes
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>
                              {reminder.recipients.length} destinatario
                              {reminder.recipients.length > 1 ? "s" : ""}
                            </span>
                          </div>

                          {reminder.metadata?.bovineCount && (
                            <div className="flex items-center gap-1">
                              <Beef className="w-4 h-4" />
                              <span>
                                {reminder.metadata.bovineCount} bovino
                                {reminder.metadata.bovineCount > 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Métodos de Notificación */}
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-sm text-gray-500">Métodos:</span>
                      <div className="flex gap-2">
                        {reminder.methods.map((method) => {
                          if (!method.isEnabled) return null;

                          const getMethodIcon = () => {
                            switch (method.type) {
                              case "email":
                                return Mail;
                              case "sms":
                                return MessageSquare;
                              case "push":
                                return Bell;
                              case "whatsapp":
                                return MessageSquare;
                              case "call":
                                return Phone;
                              default:
                                return Bell;
                            }
                          };

                          const MethodIcon = getMethodIcon();

                          return (
                            <div
                              key={method.type}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs"
                            >
                              <MethodIcon className="w-3 h-3" />
                              <span className="capitalize">{method.type}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Metadatos Adicionales */}
                    {reminder.metadata && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4">
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          {reminder.metadata.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span>{reminder.metadata.location}</span>
                            </div>
                          )}

                          {reminder.metadata.estimatedCost && (
                            <div className="flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-gray-400" />
                              <span>
                                ${reminder.metadata.estimatedCost.toFixed(2)}
                              </span>
                            </div>
                          )}

                          {reminder.metadata.equipmentNeeded && (
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span>
                                {reminder.metadata.equipmentNeeded.join(", ")}
                              </span>
                            </div>
                          )}

                          {reminder.metadata.weatherAlert && (
                            <div className="flex items-center gap-2 text-yellow-600">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Alerta meteorológica</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Información de Timing */}
                    <div className="flex items-center gap-6 text-xs text-gray-500">
                      <span>
                        Creado: {new Date(reminder.createdAt).toLocaleString()}
                      </span>
                      {reminder.sentAt && (
                        <span>
                          Enviado: {new Date(reminder.sentAt).toLocaleString()}
                        </span>
                      )}
                      {reminder.dismissedAt && (
                        <span>
                          Descartado:{" "}
                          {new Date(reminder.dismissedAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2 ml-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedReminder(reminder);
                        setShowEditModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Edit3 className="w-4 h-4" />
                    </motion.button>

                    {reminder.status === "failed" && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleResendReminder(reminder.id)}
                        disabled={isUpdating}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors disabled:opacity-50"
                        title="Reenviar"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </motion.button>
                    )}

                    {(reminder.status === "active" ||
                      reminder.status === "scheduled") && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDismissReminder(reminder.id)}
                        disabled={isUpdating}
                        className="p-2 text-gray-400 hover:text-yellow-600 transition-colors disabled:opacity-50"
                        title="Descartar"
                      >
                        <EyeOff className="w-4 h-4" />
                      </motion.button>
                    )}

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteReminder(reminder.id)}
                      disabled={isUpdating}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      title="Más opciones"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Modales van aquí - CreateReminderModal, EditReminderModal, SettingsModal */}
        {/* Por brevedad del código, no incluyo los modales completos aquí */}
        {/* Pero estarían implementados con formularios completos para crear/editar recordatorios */}
      </motion.div>
    </div>
  );
};

export default EventReminder;
