import React, { useState } from "react";
import {
  Routes,
  Route,
  useLocation,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  ChevronRight,
  Syringe,
  Calendar,
  ClipboardList,
  Clipboard,
  Microscope,
  Pill,
  FileText,
  Skull,
  HeartHandshake,
  Bug,
  Menu,
  X,
} from "lucide-react";

// Importar todos los componentes del módulo health - Comentarios en español
import VaccinationRecords from "./VaccinationRecords";
import VaccineScheduler from "./VaccineScheduler";
import MedicalHistory from "./MedicalHistory";
import TreatmentPlans from "./TreatmentPlans";
import DiseaseTracking from "./DiseaseTracking";
import MedicationInventory from "./MedicationInventory";
import PostMortemReports from "./PostMortemReports";
import ReproductiveHealth from "./ReproductiveHealth";
import ParasiteParatrol from "./ParasiteParatrol";

// Componente de navegación secundaria para el módulo health
const HealthNavigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", path: "/health", icon: Home, exact: true },
    {
      label: "Registros de Vacunación",
      path: "/health/vaccination-records",
      icon: Syringe,
    },
    {
      label: "Historial Médico",
      path: "/health/medical-history",
      icon: ClipboardList,
    },
    {
      label: "Planes de Tratamiento",
      path: "/health/treatment-plans",
      icon: Clipboard,
    },
    {
      label: "Seguimiento de Enfermedades",
      path: "/health/disease-tracking",
      icon: Microscope,
    },
    {
      label: "Inventario de Medicamentos",
      path: "/health/medication-inventory",
      icon: Pill,
    },
    {
      label: "Programador de Vacunas",
      path: "/health/vaccine-scheduler",
      icon: Calendar,
    },
    { label: "Reportes de Salud", path: "/health/reports", icon: FileText },
    { label: "Reportes Post-Mortem", path: "/health/postmortem", icon: Skull },
    {
      label: "Salud Reproductiva",
      path: "/health/reproductive",
      icon: HeartHandshake,
    },
    {
      label: "Control de Parásitos",
      path: "/health/parasite-control",
      icon: Bug,
    },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMenuOpen(false); // Cerrar menú móvil después de navegar
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-3 sm:p-4 mb-6 sm:mb-8"
    >
      {/* Navegación móvil - Menú hamburguesa */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-800">Módulo de Salud</span>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Menú desplegable móvil */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path, item.exact);

                  return (
                    <motion.button
                      key={item.path}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleNavigation(item.path)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all ${
                        active
                          ? "bg-emerald-100 text-emerald-700 shadow-md"
                          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      <Icon size={18} />
                      <span className="truncate">{item.label}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navegación desktop - Scroll horizontal */}
      <div className="hidden lg:block">
        <div className="flex items-center overflow-x-auto space-x-1 pb-2 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);

            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap text-sm font-medium transition-all ${
                  active
                    ? "bg-emerald-100 text-emerald-700 shadow-md"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

// Breadcrumbs para el módulo health
const HealthBreadcrumbs: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter(Boolean);
    const breadcrumbs = [
      { label: "Inicio", path: "/dashboard" },
      { label: "Salud", path: "/health" },
    ];

    if (pathSegments.length > 1) {
      const lastSegment = pathSegments[pathSegments.length - 1];
      const breadcrumbMap: { [key: string]: string } = {
        "vaccination-records": "Registros de Vacunación",
        "medical-history": "Historial Médico",
        "treatment-plans": "Planes de Tratamiento",
        "disease-tracking": "Seguimiento de Enfermedades",
        "medication-inventory": "Inventario de Medicamentos",
        "vaccine-scheduler": "Programador de Vacunas",
        reports: "Reportes de Salud",
        postmortem: "Reportes Post-Mortem",
        reproductive: "Salud Reproductiva",
        "parasite-control": "Control de Parásitos",
      };

      if (breadcrumbMap[lastSegment]) {
        breadcrumbs.push({
          label: breadcrumbMap[lastSegment],
          path: location.pathname,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <motion.nav
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center space-x-1 sm:space-x-2 text-white/80 mb-4 sm:mb-6 overflow-x-auto scrollbar-hide"
    >
      {breadcrumbs.map((crumb, index) => (
        <React.Fragment key={crumb.path}>
          {index > 0 && (
            <ChevronRight 
              size={14} 
              className="text-white/60 flex-shrink-0 sm:w-4 sm:h-4" 
            />
          )}
          <button
            onClick={() => navigate(crumb.path)}
            className={`text-xs sm:text-sm hover:text-white transition-colors whitespace-nowrap ${
              index === breadcrumbs.length - 1
                ? "text-white font-medium"
                : "hover:underline"
            }`}
          >
            {crumb.label}
          </button>
        </React.Fragment>
      ))}
    </motion.nav>
  );
};

// Componente principal de la página Health - Router interno del módulo de salud
const HealthPage: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Container principal responsive */}
      <div className="min-h-screen p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumbs */}
          <HealthBreadcrumbs />

          {/* Navegación del módulo (solo mostrar en páginas que no sean el dashboard) */}
          {location.pathname !== "/health" && <HealthNavigation />}

          {/* Contenido principal con animaciones */}
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="w-full overflow-hidden"
            >
              {/* Wrapper para hacer responsivo el contenido */}
              <div className="w-full">
                <Routes>

                  {/* Todas las rutas del módulo health completamente implementadas */}
                  <Route
                    path="vaccination-records"
                    element={<VaccinationRecords />}
                  />
                  <Route path="vaccine-scheduler" element={<VaccineScheduler />} />
                  <Route path="medical-history" element={<MedicalHistory />} />
                  <Route path="treatment-plans" element={<TreatmentPlans />} />
                  <Route path="disease-tracking" element={<DiseaseTracking />} />
                  <Route
                    path="medication-inventory"
                    element={<MedicationInventory />}
                  />
                  <Route path="postmortem" element={<PostMortemReports />} />
                  <Route path="reproductive" element={<ReproductiveHealth />} />
                  <Route path="parasite-control" element={<ParasiteParatrol />} />

                  {/* Ruta fallback - redirigir al dashboard */}
                  <Route path="*" element={<Navigate to="/health" replace />} />
                </Routes>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Estilos para ocultar scrollbars en navegadores webkit */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Router principal del módulo health - Gestiona todas las rutas de salud animal
export default HealthPage;