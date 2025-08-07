// ============================================================================
// RANCHPAGE.TSX - PÁGINA PRINCIPAL DEL MÓDULO RANCH
// ============================================================================
// Componente principal que maneja el routing interno del módulo ranch,
// incluyendo navegación entre vista general, información de propiedad y personal

import React, { useState, useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import {
  Building,
  FileText,
  Users,
  Home,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Settings,
  MapPin,
  Calendar,
  Bell,
  Download,
  Plus,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

// Importar componentes hijos
import PropertyInfo from "./PropertyInfo";
import Staff from "./Staff";

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface RanchSection {
  id: string;
  name: string;
  path: string;
  icon: React.ElementType;
  description: string;
  color: string;
  badge?: number;
  isActive?: boolean;
}

interface RanchStats {
  totalArea: number;
  totalAnimals: number;
  activeStaff: number;
  facilities: number;
  lastUpdate: string;
  alerts: number;
  documentsExpiring: number;
  staffOnLeave: number;
}

// ============================================================================
// DATOS DE CONFIGURACIÓN
// ============================================================================

const ranchSections: RanchSection[] = [
  {
    id: "overview",
    name: "Vista General",
    path: "#overview",
    icon: Home,
    description: "Información general del rancho, estadísticas y clima",
    color: "bg-[#519a7c]",
    badge: 0
  },
  {
    id: "property",
    name: "Información de Propiedad", 
    path: "#property",
    icon: FileText,
    description: "Datos de la propiedad, documentos legales y fotografías",
    color: "bg-blue-500",
    badge: 2 // Documentos por vencer
  },
  {
    id: "staff",
    name: "Personal",
    path: "#staff", 
    icon: Users,
    description: "Gestión completa del personal del rancho",
    color: "bg-purple-500",
    badge: 0
  }
];

const mockRanchStats: RanchStats = {
  totalArea: 450.5,
  totalAnimals: 285,
  activeStaff: 15,
  facilities: 12,
  lastUpdate: "2025-07-16T10:30:00",
  alerts: 2,
  documentsExpiring: 3,
  staffOnLeave: 1
};

// ============================================================================
// VARIANTES DE ANIMACIÓN
// ============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  }
};

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 1000 : -1000,
    opacity: 0
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 1000 : -1000,
    opacity: 0
  })
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const RanchSectionCard: React.FC<{
  section: RanchSection;
  isActive: boolean;
  onClick: () => void;
}> = ({ section, isActive, onClick }) => {
  const Icon = section.icon;

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      onClick={onClick}
      className={`relative cursor-pointer rounded-xl p-6 shadow-lg border transition-all duration-300 ${
        isActive 
          ? "bg-white border-[#519a7c] shadow-xl scale-105" 
          : "bg-white/90 backdrop-blur-sm border-white/20 hover:shadow-xl"
      }`}
    >
      {/* Badge de notificaciones */}
      {section.badge && section.badge > 0 && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {section.badge}
        </div>
      )}

      {/* Header de la tarjeta */}
      <div className="flex items-center mb-4">
        <div className={`w-12 h-12 rounded-lg ${section.color} flex items-center justify-center mr-4`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-[#2d5a45]">{section.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
        </div>
      </div>

      {/* Indicador de estado activo */}
      {isActive && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute bottom-0 left-0 right-0 h-1 bg-[#519a7c] rounded-b-xl"
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}

      {/* Botón de acción */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm text-gray-500">
          {isActive ? "Sección actual" : "Ir a sección"}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400" />
      </div>
    </motion.div>
  );
};

const RanchStatsOverview: React.FC<{ stats: RanchStats }> = ({ stats }) => {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
    >
      <h3 className="text-lg font-semibold text-[#2d5a45] mb-4 flex items-center">
        <BarChart3 className="w-5 h-5 mr-2" />
        Estadísticas del Rancho
      </h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <MapPin className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-[#2d5a45]">{stats.totalArea}</p>
          <p className="text-sm text-gray-600">Hectáreas</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Activity className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-[#2d5a45]">{stats.totalAnimals}</p>
          <p className="text-sm text-gray-600">Animales</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-[#2d5a45]">{stats.activeStaff}</p>
          <p className="text-sm text-gray-600">Personal</p>
        </div>

        <div className="text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-2">
            <Building className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold text-[#2d5a45]">{stats.facilities}</p>
          <p className="text-sm text-gray-600">Instalaciones</p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-1" />
            Última actualización: {new Date(stats.lastUpdate).toLocaleString('es-MX')}
          </div>
          
          {stats.alerts > 0 && (
            <div className="flex items-center text-red-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              {stats.alerts} alertas activas
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const RanchQuickActions: React.FC = () => {
  const quickActions = [
    {
      name: "Agregar Personal",
      icon: Plus,
      color: "bg-green-500",
      action: () => console.log("Agregar personal")
    },
    {
      name: "Subir Documento",
      icon: FileText,
      color: "bg-blue-500", 
      action: () => console.log("Subir documento")
    },
    {
      name: "Ver Alertas",
      icon: Bell,
      color: "bg-red-500",
      action: () => console.log("Ver alertas")
    },
    {
      name: "Generar Reporte",
      icon: Download,
      color: "bg-purple-500",
      action: () => console.log("Generar reporte")
    }
  ];

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
    >
      <h3 className="text-lg font-semibold text-[#2d5a45] mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2" />
        Acciones Rápidas
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={action.action}
              className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className={`w-8 h-8 ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-[#2d5a45]">{action.name}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
};

const RanchAlerts: React.FC<{ stats: RanchStats }> = ({ stats }) => {
  const alerts = [
    {
      type: "warning",
      message: "3 documentos vencen en los próximos 30 días",
      time: "Hace 2 horas",
      icon: AlertTriangle,
      color: "text-yellow-600"
    },
    {
      type: "info", 
      message: "Revisión veterinaria programada para mañana",
      time: "Hace 4 horas",
      icon: Calendar,
      color: "text-blue-600"
    }
  ];

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
    >
      <h3 className="text-lg font-semibold text-[#2d5a45] mb-4 flex items-center">
        <Bell className="w-5 h-5 mr-2" />
        Alertas Recientes
        {stats.alerts > 0 && (
          <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">
            {stats.alerts}
          </span>
        )}
      </h3>

      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = alert.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start p-3 bg-gray-50 rounded-lg"
            >
              <Icon className={`w-5 h-5 ${alert.color} mr-3 mt-0.5`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-[#2d5a45]">{alert.message}</p>
                <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
              </div>
            </motion.div>
          );
        })}

        {alerts.length === 0 && (
          <div className="text-center py-4">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No hay alertas pendientes</p>
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-3 py-2 text-[#519a7c] border border-[#519a7c] rounded-lg hover:bg-[#519a7c] hover:text-white transition-colors text-sm"
        >
          Ver todas las alertas
        </motion.button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const RanchPage: React.FC = () => {
  const location = useLocation();

  // Estados para manejo de navegación y UI
  const [currentSection, setCurrentSection] = useState<string>("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [direction, setDirection] = useState(0);
  const [showSectionSelector, setShowSectionSelector] = useState(true);

  // Leer parámetros de URL al cargar el componente
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const sectionParam = searchParams.get('section');
    
    console.log('🔍 URL params:', { sectionParam, search: location.search });
    
    // Si hay un parámetro de sección válido, navegar directamente a esa sección
    if (sectionParam && ranchSections.some(s => s.id === sectionParam)) {
      console.log('📍 Navegando a sección:', sectionParam);
      setCurrentSection(sectionParam);
      setShowSectionSelector(false);
    } else {
      // Si no hay parámetro válido, mostrar el selector
      console.log('🏠 Mostrando selector de secciones');
      setCurrentSection("overview");
      setShowSectionSelector(true);
    }
  }, [location.search]);

  // Función para navegar entre secciones
  const handleSectionChange = (sectionId: string) => {
    const section = ranchSections.find(s => s.id === sectionId);
    if (!section) return;

    console.log('🚀 Cambiando a sección:', sectionId);

    setIsLoading(true);
    setDirection(ranchSections.findIndex(s => s.id === sectionId) > ranchSections.findIndex(s => s.id === currentSection) ? 1 : -1);
    
    // Actualizar URL sin navegar
    const newUrl = `/ranch?section=${sectionId}`;
    window.history.pushState(null, '', newUrl);
    
    // Simular tiempo de carga
    setTimeout(() => {
      setCurrentSection(sectionId);
      setShowSectionSelector(false);
      setIsLoading(false);
    }, 300);
  };

  // Función para volver al selector de secciones
  const handleBackToSelector = () => {
    console.log('🔙 Volviendo al selector');
    
    // Actualizar URL para remover parámetros
    window.history.pushState(null, '', '/ranch');
    
    setShowSectionSelector(true);
    setCurrentSection("overview");
  };

  // Obtener información de la sección actual
  const getCurrentSection = () => {
    return ranchSections.find(s => s.id === currentSection);
  };

  const currentSectionInfo = getCurrentSection();

  // Función para renderizar el contenido de la sección
  const renderSectionContent = () => {
    console.log('🎨 Renderizando sección:', currentSection);
    
    switch (currentSection) {
      case "property":
        return <PropertyInfo />;
      case "staff":
        return <Staff />;
      default:
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#E8E8C8] to-[#D3D3B8] p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header Principal */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {!showSectionSelector && currentSectionInfo && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBackToSelector}
                  className="mr-4 p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 hover:bg-white transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-[#519a7c]" />
                </motion.button>
              )}
              
              <div>
                <h1 className="text-4xl font-bold text-[#2d5a45] mb-2">
                  {showSectionSelector ? "Gestión del Rancho" : currentSectionInfo?.name}
                </h1>
                <p className="text-gray-600 text-lg">
                  {showSectionSelector 
                    ? "Administra toda la información y recursos del rancho"
                    : currentSectionInfo?.description
                  }
                </p>
              </div>
            </div>

            {/* Información rápida */}
            <div className="hidden lg:flex items-center space-x-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-white/20">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  Rancho Los Ceibos
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-white/20">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date().toLocaleDateString('es-MX')}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-[#519a7c] border-t-transparent rounded-full"
            />
          </motion.div>
        )}

        {/* Contenido Principal */}
        <AnimatePresence mode="wait" custom={direction}>
          {showSectionSelector ? (
            // Selector de Secciones
            <motion.div
              key="selector"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
            >
              {/* Grid de información general */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <RanchStatsOverview stats={mockRanchStats} />
                <RanchQuickActions />
              </div>

              {/* Grid de alertas y secciones */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                  <motion.div variants={itemVariants}>
                    <h2 className="text-2xl font-semibold text-[#2d5a45] mb-6">
                      Secciones del Rancho
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {ranchSections.map((section) => (
                        <RanchSectionCard
                          key={section.id}
                          section={section}
                          isActive={currentSection === section.id}
                          onClick={() => handleSectionChange(section.id)}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                <div>
                  <RanchAlerts stats={mockRanchStats} />
                </div>
              </div>

              {/* Información adicional */}
              <motion.div variants={itemVariants} className="text-center text-gray-600">
                <p>Selecciona una sección para administrar la información específica del rancho</p>
              </motion.div>
            </motion.div>
          ) : (
            // Contenido de la Sección Actual
            <motion.div
              key="content"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
            >
              {/* Renderizado del contenido específico de la sección */}
              {renderSectionContent()}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navegación inferior en pantallas pequeñas */}
        {!showSectionSelector && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-6 left-6 right-6 lg:hidden"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20">
              <div className="flex justify-around">
                {ranchSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = currentSection === section.id;
                  
                  return (
                    <motion.button
                      key={section.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSectionChange(section.id)}
                      className={`flex flex-col items-center p-2 rounded-lg transition-colors relative ${
                        isActive 
                          ? "bg-[#519a7c] text-white" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium">{section.name.split(' ')[0]}</span>
                      {section.badge && section.badge > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {section.badge}
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default RanchPage;