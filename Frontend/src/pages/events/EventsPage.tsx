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
  <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center p-6">
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center max-w-md border border-white/20"
    >
      <div className="mb-4">{icon}</div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <div className="inline-flex px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
        Próximamente
      </div>
    </motion.div>
  </div>
);

// Componente de navegación secundaria mejorado
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
    <div className="bg-white/90 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-6 overflow-x-auto py-4 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(item.path)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
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

// Wrapper para páginas internas con fondo consistente
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a]">
    <div className="relative z-10">{children}</div>
  </div>
);

// Animaciones de transición de página
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

// Componente principal EventPage
const EventsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Header principal del módulo estilo referencia */}
      <div className="bg-[#4a9d4f] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 pb-2"
          >
            <div className="flex items-center space-x-2 text-sm text-white/80">
              <span>🏠 Inicio</span>
              <span>›</span>
              <span>📊 Eventos</span>
              <span>›</span>
              <span className="text-white font-medium">Gestión de Eventos</span>
            </div>
          </motion.div>

          {/* Título y acciones */}
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-4 mb-6 lg:mb-0"
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    Módulo de Gestión de Eventos
                  </h1>
                  <p className="text-white/90">
                    Sistema integral para la administración de eventos del
                    ganado
                  </p>
                </div>
              </motion.div>

              {/* Botones de acción */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-3"
              >
                <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>Agregar Evento</span>
                </button>
                <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Bell className="w-4 h-4" />
                  <span>Mapa de Ubicaciones</span>
                </button>
                <button className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <FileText className="w-4 h-4" />
                  <span>Reportes</span>
                </button>
                <button className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <TrendingUp className="w-4 h-4" />
                  <span>Actualizar</span>
                </button>
              </motion.div>
            </div>

            {/* Estadísticas horizontales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8"
            >
              <div className="flex flex-wrap items-center gap-6">
                {/* Total */}
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                  <Users className="w-8 h-8 text-white" />
                  <div>
                    <div className="text-3xl font-bold text-white">247</div>
                    <div className="text-white/90 text-sm font-medium">
                      Total
                    </div>
                  </div>
                </div>

                {/* Programados */}
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                  <Heart className="w-8 h-8 text-green-200" />
                  <div>
                    <div className="text-3xl font-bold text-green-200">42</div>
                    <div className="text-white/90 text-sm font-medium">
                      Programados
                    </div>
                  </div>
                </div>

                {/* En Progreso */}
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                  <Clock className="w-8 h-8 text-yellow-200" />
                  <div>
                    <div className="text-3xl font-bold text-yellow-200">15</div>
                    <div className="text-white/90 text-sm font-medium">
                      En Progreso
                    </div>
                  </div>
                </div>

                {/* Completados */}
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
                  <div className="text-3xl font-bold text-blue-200">232</div>
                  <div className="text-white/90 text-sm font-medium">
                    Completados
                  </div>
                </div>

                {/* Actualizado */}
                <div className="ml-auto text-right">
                  <div className="text-white/80 text-sm">
                    Actualizado:{" "}
                    {new Date().toLocaleTimeString("es-ES", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    p.m.
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navegación secundaria con acciones rápidas */}
      <EventNavigation />

      {/* Acciones rápidas debajo de la navegación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/events/vaccination")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-medium flex flex-col items-center space-y-2 transition-all duration-200 shadow-lg min-h-[80px] justify-center"
            >
              <Syringe className="w-5 h-5" />
              <span className="text-xs text-center leading-tight">
                Nueva Vacunación
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/events/purchase")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-medium flex flex-col items-center space-y-2 transition-all duration-200 shadow-lg min-h-[80px] justify-center"
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="text-xs text-center leading-tight">
                Nueva Compra
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/events/sales")}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-xl font-medium flex flex-col items-center space-y-2 transition-all duration-200 shadow-lg min-h-[80px] justify-center"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="text-xs text-center leading-tight">
                Nueva Venta
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/events/transport")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-medium flex flex-col items-center space-y-2 transition-all duration-200 shadow-lg min-h-[80px] justify-center"
            >
              <Truck className="w-5 h-5" />
              <span className="text-xs text-center leading-tight">
                Nuevo Transporte
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/events/breeding")}
              className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-3 rounded-xl font-medium flex flex-col items-center space-y-2 transition-all duration-200 shadow-lg min-h-[80px] justify-center"
            >
              <Heart className="w-5 h-5" />
              <span className="text-xs text-center leading-tight">
                Evento Reproducción
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/events/health")}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-medium flex flex-col items-center space-y-2 transition-all duration-200 shadow-lg min-h-[80px] justify-center"
            >
              <Activity className="w-5 h-5" />
              <span className="text-xs text-center leading-tight">
                Evento Salud
              </span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Contenido principal con animaciones y fondo consistente */}
      <div className="relative bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] min-h-screen">
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
              <Route
                index
                element={
                  <PageWrapper>
                    <EventList />
                  </PageWrapper>
                }
              />

              {/* Rutas principales de eventos */}
              <Route
                path="list"
                element={
                  <PageWrapper>
                    <EventList />
                  </PageWrapper>
                }
              />
              <Route
                path="timeline"
                element={
                  <PageWrapper>
                    <EventTimeline />
                  </PageWrapper>
                }
              />
              <Route
                path="detail/:id"
                element={
                  <PageWrapper>
                    <EventDetail />
                  </PageWrapper>
                }
              />
              <Route
                path="create"
                element={
                  <PageWrapper>
                    <EventCreate />
                  </PageWrapper>
                }
              />
              <Route
                path="edit/:id"
                element={
                  <PageWrapper>
                    <EventEdit />
                  </PageWrapper>
                }
              />

              {/* Rutas específicas por tipo de evento */}
              <Route
                path="vaccination"
                element={
                  <PageWrapper>
                    <EventVaccination />
                  </PageWrapper>
                }
              />
              <Route
                path="purchase"
                element={
                  <PageWrapper>
                    <EventPurchase />
                  </PageWrapper>
                }
              />
              <Route
                path="sales"
                element={
                  <PageWrapper>
                    <EventSales />
                  </PageWrapper>
                }
              />
              <Route
                path="transport"
                element={
                  <PageWrapper>
                    <EventTransport />
                  </PageWrapper>
                }
              />
              <Route
                path="breeding"
                element={
                  <PageWrapper>
                    <EventBreeding />
                  </PageWrapper>
                }
              />
              <Route
                path="health"
                element={
                  <PageWrapper>
                    <EventHealth />
                  </PageWrapper>
                }
              />
              <Route
                path="feeding"
                element={
                  <PageWrapper>
                    <EventFeeding />
                  </PageWrapper>
                }
              />

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
              <Route
                path="*"
                element={
                  <PageWrapper>
                    <EventList />
                  </PageWrapper>
                }
              />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EventsPage;
