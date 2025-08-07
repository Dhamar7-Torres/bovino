import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  BarChart3,
  TrendingUp,
  Bell,
  FileText,
} from "lucide-react";

// Importar componentes de eventos
import EventVaccination from "./EventVaccination";
import EventPurchase from "./EventPurchase";
import EventSales from "./EventSales";
import EventTransport from "./EventTransport";
import EventBreeding from "./EventBreeding";
import EventHealth from "./EventHealth";
import EventFeeding from "./EventFeeding";

// Componente para páginas próximamente
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

// Wrapper para páginas internas
const PageWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a]">
    <div className="relative z-10">{children}</div>
  </div>
);

// Animaciones de transición
const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 },
};

// Componente principal EventsPage
const EventsPage: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Header principal del módulo */}
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

          {/* Título solamente */}
          <div className="py-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-4"
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Módulo de Gestión de Eventos
                </h1>
                <p className="text-white/90">
                  Sistema integral para la administración de eventos del ganado
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Contenido principal con animaciones */}
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
              {/* Rutas principales de eventos */}
              <Route path="" element={<div className="p-8"><h2 className="text-2xl font-bold text-gray-900">Lista de Eventos</h2></div>} />
              <Route path="timeline" element={<div className="p-8"><h2 className="text-2xl font-bold text-gray-900">Línea de Tiempo</h2></div>} />
              <Route path="create" element={<div className="p-8"><h2 className="text-2xl font-bold text-gray-900">Crear Evento</h2></div>} />
              
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
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EventsPage;