import React from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Plus,
  List,
  Clock,
  Syringe,
  ShoppingCart,
  ShoppingBag,
  Truck,
  Heart,
  Utensils,
  Users,
  BarChart3,
  TrendingUp,
  Bell,
  FileText,
} from "lucide-react";

// Importar componentes de eventos
import EventList from "./EventList";
import EventTimeline from "./EventTimeline";
import EventDetail from "./EventDetail";
import EventCreate from "./EventCreate";
import EventEdit from "./EventEdit";
import EventVaccination from "./EventVaccination";
import EventPurchase from "./EventPurchase";
import EventSales from "./EventSales";
import EventTransport from "./EventTransport";
import EventBreeding from "./EventBreeding";
import EventHealth from "./EventHealth";
import EventFeeding from "./EventFeeding";

// Componentes temporales para rutas no implementadas
const ComingSoonPage: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
}> = ({ title, description, icon }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md"
    >
      <div className="mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="inline-flex px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
        Próximamente
      </div>
    </motion.div>
  </div>
);

// Componente de estadísticas del header
const HeaderStats: React.FC = () => {
  const stats = [
    {
      label: "Eventos Totales",
      value: "247",
      change: "+12",
      color: "text-blue-600",
    },
    { label: "Este Mes", value: "42", change: "+8", color: "text-green-600" },
    {
      label: "Pendientes",
      value: "15",
      change: "-3",
      color: "text-orange-600",
    },
    {
      label: "Completados",
      value: "232",
      change: "+15",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/20 backdrop-blur-sm rounded-2xl p-4"
        >
          <div className="text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-white/80 text-sm font-medium">
              {stat.label}
            </div>
            <div className="text-white/60 text-xs mt-1">
              {stat.change} vs anterior
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Componente de acciones rápidas
const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Nueva Vacunación",
      icon: Syringe,
      color: "bg-blue-600",
      hoverColor: "hover:bg-blue-700",
      path: "/events/vaccination",
    },
    {
      label: "Nueva Compra",
      icon: ShoppingCart,
      color: "bg-green-600",
      hoverColor: "hover:bg-green-700",
      path: "/events/purchase",
    },
    {
      label: "Nueva Venta",
      icon: ShoppingBag,
      color: "bg-purple-600",
      hoverColor: "hover:bg-purple-700",
      path: "/events/sales",
    },
    {
      label: "Nuevo Transporte",
      icon: Truck,
      color: "bg-indigo-600",
      hoverColor: "hover:bg-indigo-700",
      path: "/events/transport",
    },
    {
      label: "Evento Reproducción",
      icon: Users,
      color: "bg-pink-600",
      hoverColor: "hover:bg-pink-700",
      path: "/events/breeding",
    },
    {
      label: "Evento Salud",
      icon: Heart,
      color: "bg-red-600",
      hoverColor: "hover:bg-red-700",
      path: "/events/health",
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action, index) => (
        <motion.button
          key={action.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(action.path)}
          className={`${action.color} ${action.hoverColor} text-white px-4 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all duration-200 shadow-lg`}
        >
          <action.icon className="w-5 h-5" />
          <span className="hidden lg:block">{action.label}</span>
        </motion.button>
      ))}
    </div>
  );
};

// Componente de navegación secundaria
const EventNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Todos los Eventos", path: "/events", icon: List, exact: true },
    { label: "Línea de Tiempo", path: "/events/timeline", icon: Clock },
    { label: "Crear Evento", path: "/events/create", icon: Plus },
    { label: "Vacunaciones", path: "/events/vaccination", icon: Syringe },
    { label: "Compras", path: "/events/purchase", icon: ShoppingCart },
    { label: "Ventas", path: "/events/sales", icon: ShoppingBag },
    { label: "Transporte", path: "/events/transport", icon: Truck },
    { label: "Reproducción", path: "/events/breeding", icon: Users },
    { label: "Salud", path: "/events/health", icon: Heart },
    { label: "Alimentación", path: "/events/feeding", icon: Utensils },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto py-4">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-blue-100 text-blue-700 shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Animaciones de transición de página
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

// Componente principal EventPage
const EventPage: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header principal del módulo */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-6 lg:space-y-0">
            <div className="flex-1">
              {/* Título y descripción */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4 mb-6"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    Gestión de Eventos
                  </h1>
                  <p className="text-white/80 text-lg">
                    Registro y seguimiento completo de actividades del ganado
                  </p>
                </div>
              </motion.div>

              {/* Estadísticas */}
              <HeaderStats />
            </div>

            {/* Acciones rápidas */}
            <div className="flex-shrink-0">
              <QuickActions />
            </div>
          </div>
        </div>
      </div>

      {/* Navegación secundaria */}
      <EventNavigation />

      {/* Contenido principal con animaciones */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageTransition}
          >
            <Routes>
              {/* Ruta principal - Lista de eventos */}
              <Route index element={<EventList />} />

              {/* Rutas principales de eventos */}
              <Route path="list" element={<EventList />} />
              <Route path="timeline" element={<EventTimeline />} />
              <Route path="detail/:id" element={<EventDetail />} />
              <Route path="create" element={<EventCreate />} />
              <Route path="edit/:id" element={<EventEdit />} />

              {/* Rutas específicas por tipo de evento */}
              <Route path="vaccination" element={<EventVaccination />} />
              <Route path="purchase" element={<EventPurchase />} />
              <Route path="sales" element={<EventSales />} />
              <Route path="transport" element={<EventTransport />} />
              <Route path="breeding" element={<EventBreeding />} />
              <Route path="health" element={<EventHealth />} />
              <Route path="feeding" element={<EventFeeding />} />

              {/* Rutas adicionales del módulo */}
              <Route
                path="reports"
                element={
                  <ComingSoonPage
                    title="Reportes de Eventos"
                    description="Análisis y estadísticas de actividades del ganado"
                    icon={
                      <BarChart3 className="w-12 h-12 text-blue-600 mx-auto" />
                    }
                  />
                }
              />

              <Route
                path="analytics"
                element={
                  <ComingSoonPage
                    title="Análisis Predictivo"
                    description="Tendencias y predicciones basadas en eventos históricos"
                    icon={
                      <TrendingUp className="w-12 h-12 text-purple-600 mx-auto" />
                    }
                  />
                }
              />

              <Route
                path="notifications"
                element={
                  <ComingSoonPage
                    title="Notificaciones y Alertas"
                    description="Configuración de recordatorios y alertas automáticas"
                    icon={
                      <Bell className="w-12 h-12 text-yellow-600 mx-auto" />
                    }
                  />
                }
              />

              <Route
                path="templates"
                element={
                  <ComingSoonPage
                    title="Plantillas de Eventos"
                    description="Plantillas predefinidas para eventos recurrentes"
                    icon={
                      <FileText className="w-12 h-12 text-gray-600 mx-auto" />
                    }
                  />
                }
              />

              {/* Ruta por defecto - Redirige a la lista */}
              <Route path="*" element={<EventList />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EventPage;
