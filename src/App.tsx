import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Beef, Syringe, Calendar, Bell } from "lucide-react";

// Importar el Layout completo
import { Layout } from "./components/layout";
import AuthPage from "./pages/auth/AuthPage";
import BovinesPage from "./pages/bovines/BovinesPage";
import { CalendarPage } from "./pages/calendar";
import EventPage from "./pages/events/EventsPage";
import FeedingPage from "./pages/feeding/FeedingPage"; 
import { FinancesPage } from "./pages/finances"; 
import HealthPage from "./pages/health/HealthPage"; 
import MapsPage from "./pages/maps"; 
import InventoryPage from "./pages/inventory/InventoryPage"; 
import ProductionPage from "./pages/production"; 
import RanchPage from "./pages/ranch/RanchPage"; 

// Agregar las fuentes elegantes al head
const addGoogleFonts = () => {
  const link = document.createElement("link");
  link.href =
    "https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap";
  link.rel = "stylesheet";
  document.head.appendChild(link);
};

// Ejecutar al cargar
if (typeof window !== "undefined") {
  addGoogleFonts();
}

// Dashboard principal actualizado con widgets exactos a la imagen
const DashboardPage: React.FC = () => {
  return (
    <div
      className="space-y-8 min-h-screen p-8 -m-8"
      style={{
        fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif',
      }}
    >
      <div className="flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold drop-shadow-lg"
          style={{
            fontFamily:
              '"Playfair Display", "Georgia", "Times New Roman", serif',
            textShadow: "0 2px 8px rgba(255,255,255,0.8)",
            color: "#8B4513", // Color cafecito
          }}
        >
          Dashboard Principal
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-[#2d5a41] to-[#1a4d36] text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center gap-2"
          style={{
            boxShadow:
              "0 8px 32px rgba(45, 90, 65, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
            fontFamily: '"Crimson Text", "Georgia", "Times New Roman", serif',
          }}
        >
          <Plus size={20} />
          Nuevo Registro
        </motion.button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Widgets de estadísticas con diseño exacto a la imagen */}
        {[
          {
            title: "Total Ganado",
            value: "1,247",
            description: "Cabezas registradas",
            change: "+12 este mes",
            changeColor: "text-gray-600",
            icon: Beef,
            iconColor: "#9c6d3f", // Marrón
            iconBg: "#c9a47e", // Fondo más claro marrón
            progressColor: "#9c6d3f", // Barra marrón
            progressValue: 75,
          },
          {
            title: "Vacunas Pendientes",
            value: "23",
            description: "Requieren atención",
            change: "+3 hoy",
            changeColor: "text-[#d94343]", // Rojo para +3 hoy
            icon: Syringe,
            iconColor: "#e47b3e", // Naranja brillante
            iconBg: "#fef3cd", // Fondo naranja claro
            progressColor: "#e6a066", // Naranja claro para barra
            progressValue: 60,
            urgent: true,
          },
          {
            title: "Eventos Hoy",
            value: "8",
            description: "Programados",
            icon: Calendar,
            iconColor: "#9c6ad5", // Morado
            iconBg: "#f3f0ff", // Fondo morado claro
            progressColor: "#bfa3ec", // Morado suave para barra
            progressValue: 45,
          },
          {
            title: "Alertas Activas",
            value: "3",
            description: "Requieren acción",
            change: "-1 hoy",
            changeColor: "text-[#71a9d6]", // Azul claro para -1 hoy
            icon: Bell,
            iconColor: "#4a7cb1", // Azul
            iconBg: "#e1f5fe", // Fondo azul claro
            progressColor: "#a5c7e6", // Azul pastel para barra
            progressValue: 30,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
              type: "spring",
              stiffness: 120,
            }}
            whileHover={{
              y: -4,
              scale: 1.02,
              transition: { duration: 0.2 },
            }}
            className={`
              bg-[#f5f5dc] rounded-2xl p-6 shadow-md hover:shadow-lg
              backdrop-blur-sm relative overflow-hidden cursor-pointer group
              border border-gray-200/50
              ${stat.urgent ? "ring-1 ring-red-200" : ""}
            `}
            style={{
              boxShadow:
                "0 4px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.8)",
            }}
          >
            {/* Efecto de brillo sutil al hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              {/* Header con título e ícono */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3
                    className="text-sm font-semibold text-black mb-2"
                    style={{
                      fontFamily:
                        '"Crimson Text", "Georgia", "Times New Roman", serif',
                    }}
                  >
                    {stat.title}
                  </h3>
                </div>
                {/* Ícono en la esquina superior derecha */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: stat.iconBg }}
                >
                  <stat.icon size={32} style={{ color: stat.iconColor }} />
                </div>
              </div>
              {/* Valor principal y cambio */}
              <div className="mb-3">
                <div className="flex items-baseline gap-3">
                  <span
                    className="text-3xl font-bold text-black"
                    style={{
                      fontFamily:
                        '"Playfair Display", "Georgia", "Times New Roman", serif',
                    }}
                  >
                    {stat.value}
                  </span>
                  {stat.change && (
                    <span
                      className={`text-xs font-semibold ${stat.changeColor}`}
                    >
                      ({stat.change})
                    </span>
                  )}
                </div>
              </div>
              {/* Descripción */}
              <p className="text-xs text-black font-medium mb-4">
                {stat.description}
              </p>
              {/* Barra de progreso */}
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${stat.progressValue}%` }}
                  transition={{ duration: 1.5, delay: index * 0.2 }}
                  className="h-1.5 rounded-full"
                  style={{ backgroundColor: stat.progressColor }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      {/* Sección adicional simplificada */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12"
      >
        <div className="w-full">
          <div className="bg-[#f5f5dc]/90 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-gray-200/30 h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#3d8b40] to-[#f4ac3a] rounded-xl flex items-center justify-center">
                🏢
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black">Bovino UJAT</h3>
                <p className="text-[#3d8b40] font-semibold">
                  Gestión Ganadera Inteligente
                </p>
              </div>
            </div>
            <p className="text-black leading-relaxed mb-6 font-medium">
              Sistema integral para el manejo, seguimiento y control de ganado
              bovino con tecnología de geolocalización avanzada desarrollado en
              la UJAT.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="text-2xl font-bold text-[#3d8b40]">1,247</div>
                <div className="text-sm text-black font-medium">
                  Animales Registrados
                </div>
              </div>
              <div className="text-center p-4 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200">
                <div className="text-2xl font-bold text-[#f4ac3a]">342</div>
                <div className="text-sm text-black font-medium">
                  Vacunas este Mes
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-[#f5f5dc]/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30">
            <h4 className="font-semibold text-black mb-4">Enlaces Útiles</h4>
            <ul className="space-y-3">
              {[
                "Guía de Usuario",
                "API Documentation",
                "Centro de Ayuda",
                "Política de Privacidad",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="flex items-center gap-3 text-black hover:text-[#3d8b40] transition-colors text-sm font-medium"
                  >
                    <span>📋</span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#f5f5dc]/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/30">
            <h4 className="font-semibold text-black mb-4">Funcionalidades</h4>
            <ul className="space-y-3">
              {[
                "Rastreo de Ganado",
                "Control de Vacunas",
                "Reportes de Salud",
                "Gestión de Ubicaciones",
              ].map((feature) => (
                <li key={feature}>
                  <a
                    href="#"
                    className="flex items-center gap-3 text-black hover:text-[#f4ac3a] transition-colors text-sm font-medium"
                  >
                    <span>⚡</span>
                    {feature}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Páginas de módulos con diseño actualizado
const ModulePage: React.FC<{
  title: string;
  description: string;
  icon: string;
}> = ({ title, description, icon }) => (
  <div className="min-h-screen bg-gradient-to-br from-white/30 via-white/15 to-white/5 backdrop-blur-sm flex flex-col items-center justify-center p-8 rounded-3xl border border-white/20">
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center max-w-2xl"
    >
      <h1 className="text-5xl font-bold text-black mb-6 drop-shadow-lg">
        {title}
      </h1>
      <p className="text-xl text-black/90 mb-12 drop-shadow">{description}</p>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mb-8"
      >
        <div className="w-32 h-32 mx-auto mb-8 text-8xl">{icon}</div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-lg text-black/80 bg-white/30 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30"
      >
        Página en construcción...
      </motion.p>
    </motion.div>
  </div>
);

// Páginas específicas de módulos

// ✅ COMENTAMOS EL PLACEHOLDER DE HEALTH PORQUE YA TENEMOS EL REAL
// const HealthPage: React.FC = () => (
//   <ModulePage
//     title="Gestión de Salud"
//     description="Control veterinario y salud del ganado"
//     icon="💉"
//   />
// );

const ReproductionPage: React.FC = () => (
  <ModulePage
    title="Gestión de Reproducción"
    description="Control reproductivo y genético del ganado"
    icon="🍼"
  />
);

// ✅ COMENTAMOS EL PLACEHOLDER DE PRODUCTION PORQUE YA TENEMOS EL REAL
// const ProductionPage: React.FC = () => (
//   <ModulePage
//     title="Gestión de Producción"
//     description="Control y métricas de producción ganadera"
//     icon="📈"
//   />
// );

// ✅ COMENTAMOS EL PLACEHOLDER DE MAPS PORQUE YA TENEMOS EL REAL
// const MapsPage: React.FC = () => (
//   <ModulePage
//     title="Gestión de Mapas"
//     description="Geolocalización y seguimiento GPS del ganado"
//     icon="🗺️"
//   />
// );

// ✅ COMENTAMOS EL PLACEHOLDER DE INVENTORY PORQUE YA TENEMOS EL REAL
// const InventoryPage: React.FC = () => (
//   <ModulePage
//     title="Gestión de Inventario"
//     description="Control de medicinas y suministros del rancho"
//     icon="📦"
//   />
// );

// ✅ COMENTAMOS LA PÁGINA PLACEHOLDER DE FINANZAS
// const FinancesPage: React.FC = () => (
//   <ModulePage
//     title="Gestión Financiera"
//     description="Control de costos, ingresos y gastos del rancho"
//     icon="💰"
//   />
// );

const ReportsPage: React.FC = () => (
  <ModulePage
    title="Gestión de Reportes"
    description="Informes y análisis del rendimiento del rancho"
    icon="📊"
  />
);

// ✅ COMENTAMOS EL PLACEHOLDER DE RANCH PORQUE YA TENEMOS EL REAL
// const RanchPage: React.FC = () => (
//   <ModulePage
//     title="Gestión del Rancho"
//     description="Administración de instalaciones y propiedades"
//     icon="🏡"
//   />
// );

const SettingsPage: React.FC = () => (
  <ModulePage
    title="Configuración del Sistema"
    description="Preferencias y configuración de la aplicación"
    icon="⚙️"
  />
);

// Componente principal de la aplicación
const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Ruta raíz - redirige al dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Rutas de autenticación - FUERA del Layout */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/*" element={<AuthPage />} />
          {/* Layout principal con rutas anidadas */}
          <Route path="/*" element={<Layout />}>
            <Route path="dashboard/*" element={<DashboardPage />} />
            <Route path="bovines/*" element={<BovinesPage />} />
            <Route path="calendar/*" element={<CalendarPage />} />
            <Route path="feeding/*" element={<FeedingPage />} /> {/* ← NUEVA RUTA */}
            {/* Resto de módulos (mantenemos los existentes) */}
            <Route path="health/*" element={<HealthPage />} /> {/* ← RUTA ACTUALIZADA CON MÓDULO REAL */}
            <Route path="reproduction/*" element={<ReproductionPage />} />
            <Route path="production/*" element={<ProductionPage />} /> {/* ← RUTA ACTUALIZADA CON MÓDULO REAL */}
            <Route path="maps/*" element={<MapsPage />} /> {/* ← RUTA ACTUALIZADA CON MÓDULO REAL */}
            <Route path="events/*" element={<EventPage />} />
            <Route path="inventory/*" element={<InventoryPage />} /> {/* ← RUTA ACTUALIZADA CON MÓDULO REAL */}
            <Route path="finances/*" element={<FinancesPage />} /> {/* ← RUTA ACTUALIZADA */}
            <Route path="reports/*" element={<ReportsPage />} />
            <Route path="ranch/*" element={<RanchPage />} /> {/* ← RUTA ACTUALIZADA CON MÓDULO RANCH REAL */}
            <Route path="settings/*" element={<SettingsPage />} />
            {/* Ruta 404 actualizada con nueva paleta */}
            <Route
              path="*"
              element={
                <div className="min-h-screen bg-gradient-to-br from-white/30 via-white/15 to-white/5 backdrop-blur-sm flex flex-col items-center justify-center p-8 rounded-3xl border border-white/20">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center max-w-2xl"
                  >
                    <h1 className="text-5xl font-bold text-black mb-6 drop-shadow-lg">
                      Página no encontrada
                    </h1>
                    <p className="text-xl text-black/90 mb-12 drop-shadow">
                      La página que buscas no existe
                    </p>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                      className="mb-8"
                    >
                      <div className="w-32 h-32 mx-auto mb-8 text-8xl">😕</div>
                    </motion.div>
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={() => window.history.back()}
                      className="bg-gradient-to-r from-[#3d8b40] to-[#f4ac3a] text-white px-8 py-3 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-semibold"
                    >
                      ← Volver atrás
                    </motion.button>
                  </motion.div>
                </div>
              }
            />
          </Route>
        </Routes>
      </div>
    </Router>
  );
};

export default App;