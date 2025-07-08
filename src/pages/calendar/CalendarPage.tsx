import React, { useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Plus,
  Settings,
  Bell,
  Search,
  Clock,
  Syringe,
  Activity,
  Eye,
  EyeOff,
  BookOpen,
  Target,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  CalendarDays,
  FileText,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

// Importar los componentes del calendario
import MonthView from "./MonthView";
import CreateEvent from "./CreateEvent";
import EditEvent from "./EditEvent";
import EventDetail from "./EventDetail";
import EventReminders from "./EventReminders";
import VaccinationSchedule from "./VaccinationSchedule";

// Interfaces para TypeScript
interface CalendarPageProps {
  className?: string;
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  href: string;
  color: string;
  badge?: number;
}

interface CalendarStats {
  totalEvents: number;
  todayEvents: number;
  upcomingWeek: number;
  overdueEvents: number;
  completedThisWeek: number;
  vaccinationsScheduled: number;
  remindersActive: number;
  complianceRate: number;
}

// Mock data para estadísticas del calendario
const mockCalendarStats: CalendarStats = {
  totalEvents: 24,
  todayEvents: 3,
  upcomingWeek: 8,
  overdueEvents: 2,
  completedThisWeek: 12,
  vaccinationsScheduled: 15,
  remindersActive: 6,
  complianceRate: 87.5,
};

// Acciones rápidas del calendario
const quickActions: QuickAction[] = [
  {
    id: "create_event",
    title: "Nuevo Evento",
    description: "Crear un nuevo evento en el calendario",
    icon: Plus,
    href: "/calendar/create",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    id: "vaccination",
    title: "Programar Vacunación",
    description: "Programar vacunación para bovinos",
    icon: Syringe,
    href: "/calendar/vaccination",
    color: "bg-green-500 hover:bg-green-600",
    badge: 3,
  },
  {
    id: "monthly_view",
    title: "Vista Mensual",
    description: "Ver calendario mensual completo",
    icon: CalendarDays,
    href: "/calendar/month",
    color: "bg-purple-500 hover:bg-purple-600",
  },
  {
    id: "reminders",
    title: "Gestionar Recordatorios",
    description: "Configurar y administrar recordatorios",
    icon: Bell,
    href: "/calendar/reminders",
    color: "bg-orange-500 hover:bg-orange-600",
    badge: 6,
  },
];

// Eventos recientes para vista rápida
const recentEvents = [
  {
    id: "evt_001",
    title: "Vacunación Antirrábica - Lote A",
    date: "2025-07-15",
    time: "09:00",
    status: "completed",
    type: "vaccination",
    bovines: ["Luna", "Bella", "Rosa"],
  },
  {
    id: "evt_002",
    title: "Chequeo Médico - Toro Alpha",
    date: "2025-07-20",
    time: "14:00",
    status: "scheduled",
    type: "checkup",
    bovines: ["Toro Alpha"],
  },
  {
    id: "evt_003",
    title: "Parto Asistido - Bella",
    date: "2025-07-25",
    time: "06:00",
    status: "scheduled",
    type: "birth",
    bovines: ["Bella"],
  },
  {
    id: "evt_004",
    title: "Emergencia - Cojera Max",
    date: "2025-07-12",
    time: "10:30",
    status: "completed",
    type: "emergency",
    bovines: ["Max"],
  },
];

// Componente principal CalendarPage
const CalendarPage: React.FC<CalendarPageProps> = ({ className = "" }) => {
  const location = useLocation();

  // Estados
  const [stats] = useState<CalendarStats>(mockCalendarStats);
  const [showQuickStats, setShowQuickStats] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Detectar si estamos en la página principal del calendario
  const isCalendarHome =
    location.pathname === "/calendar" || location.pathname === "/calendar/";

  // Funciones auxiliares
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "scheduled":
        return "text-blue-600 bg-blue-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      case "in_progress":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Completado";
      case "scheduled":
        return "Programado";
      case "overdue":
        return "Vencido";
      case "in_progress":
        return "En Progreso";
      default:
        return "Desconocido";
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case "vaccination":
        return Syringe;
      case "checkup":
        return Activity;
      case "birth":
        return Users;
      case "emergency":
        return AlertTriangle;
      default:
        return Calendar;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "vaccination":
        return "text-green-600";
      case "checkup":
        return "text-blue-600";
      case "birth":
        return "text-pink-600";
      case "emergency":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Si no estamos en la página principal, mostrar solo las rutas anidadas
  if (!isCalendarHome) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${className}`}
      >
        <Routes>
          <Route path="month" element={<MonthView />} />
          <Route path="create" element={<CreateEvent />} />
          <Route path="edit" element={<EditEvent />} />
          <Route path="edit/:id" element={<EditEvent />} />
          <Route path="events" element={<EventDetail />} />
          <Route path="events/:id" element={<EventDetail />} />
          <Route path="reminders" element={<EventReminders />} />
          <Route path="vaccination" element={<VaccinationSchedule />} />
          {/* Ruta por defecto para rutas no encontradas */}
          <Route path="*" element={<Navigate to="/calendar" replace />} />
        </Routes>
      </div>
    );
  }

  // Página principal del calendario
  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6 ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header Principal */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3 flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                  <Calendar className="w-8 h-8" />
                </div>
                Calendario de Eventos
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                Gestión completa de eventos, vacunaciones y actividades del
                ganado
              </p>
              {/* Breadcrumb */}
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <Link
                  to="/dashboard"
                  className="hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                <span>›</span>
                <span className="text-gray-900 font-medium">Calendario</span>
              </nav>
            </div>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowQuickStats(!showQuickStats)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                {showQuickStats ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {showQuickStats ? "Ocultar Stats" : "Mostrar Stats"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Settings className="w-4 h-4" />
                Configuración
              </motion.button>
              <Link
                to="/calendar/create"
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg font-medium"
              >
                <Plus className="w-5 h-5" />
                Nuevo Evento
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas Rápidas */}
        <AnimatePresence>
          {showQuickStats && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8 overflow-hidden"
            >
              <div className="grid md:grid-cols-4 lg:grid-cols-8 gap-4">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Total Eventos</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stats.totalEvents}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Hoy</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stats.todayEvents}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
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
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vencidos</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stats.overdueEvents}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Completados</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stats.completedThisWeek}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Syringe className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vacunaciones</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stats.vaccinationsScheduled}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Bell className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Recordatorios</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stats.remindersActive}
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cumplimiento</p>
                      <p className="text-xl font-bold text-gray-900">
                        {stats.complianceRate}%
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Acciones Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-500" />
            Acciones Rápidas
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <motion.div
                key={action.id}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="relative"
              >
                <Link
                  to={action.href}
                  className="block bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}
                    >
                      <action.icon className="w-6 h-6" />
                    </div>
                    {action.badge && (
                      <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {action.badge}
                      </div>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 text-sm">{action.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Navegación Principal del Calendario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            Módulos del Calendario
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link
                to="/calendar/month"
                className="block bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <CalendarDays className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                      Vista Mensual
                    </h3>
                    <p className="text-sm text-gray-500">Calendario completo</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Visualiza todos los eventos en una vista mensual clara y
                  organizada con filtros avanzados.
                </p>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Link
                to="/calendar/vaccination"
                className="block bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                    <Syringe className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-green-600 transition-colors">
                      Vacunaciones
                    </h3>
                    <p className="text-sm text-gray-500">
                      Programación sanitaria
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Gestiona el calendario completo de vacunaciones con
                  protocolos, recordatorios y certificados.
                </p>
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }}>
              <Link
                to="/calendar/reminders"
                className="block bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg transition-all group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                    <Bell className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-orange-600 transition-colors">
                      Recordatorios
                    </h3>
                    <p className="text-sm text-gray-500">
                      Notificaciones inteligentes
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm">
                  Configura recordatorios automáticos por email, SMS y push para
                  nunca perderte un evento.
                </p>
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Eventos Recientes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" />
                Eventos Recientes
              </h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar eventos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="completed">Completados</option>
                  <option value="scheduled">Programados</option>
                  <option value="overdue">Vencidos</option>
                </select>
                <Link
                  to="/calendar/month"
                  className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                >
                  Ver Todos
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              {recentEvents.map((event) => {
                const EventIcon = getEventTypeIcon(event.type);
                return (
                  <motion.div
                    key={event.id}
                    whileHover={{ scale: 1.01 }}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      <EventIcon
                        className={`w-5 h-5 ${getEventTypeColor(event.type)}`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-medium text-gray-900">
                          {event.title}
                        </h3>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            event.status
                          )}`}
                        >
                          {getStatusText(event.status)}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{event.bovines.join(", ")}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/calendar/events/${event.id}`}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/calendar/edit/${event.id}`}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Footer con Enlaces de Ayuda */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center py-6"
        >
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
            <Link
              to="/help/calendar"
              className="hover:text-blue-600 transition-colors"
            >
              Ayuda del Calendario
            </Link>
            <span>•</span>
            <Link
              to="/settings/calendar"
              className="hover:text-blue-600 transition-colors"
            >
              Configuración
            </Link>
            <span>•</span>
            <button className="hover:text-blue-600 transition-colors">
              Exportar Datos
            </button>
            <span>•</span>
            <button className="hover:text-blue-600 transition-colors">
              Importar Eventos
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default CalendarPage;
