import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import {
  TreePine,
  Navigation,
  Home,
  Users,
  Target,
  Settings,
  BarChart3,
  Activity,
  AlertTriangle,
  Clock,
  Layers,
  Download,
  RefreshCw,
  Zap,
} from "lucide-react";

// Importar los componentes de mapas
import RanchMap from "./RanchMap";
import PastureMap from "./PastureMap";
import LivestockLocation from "./LivestockLocation";

// Interfaces para la página principal de mapas
interface MapsPageProps {
  className?: string;
}

interface MapModule {
  id: string;
  name: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  color: string;
  stats?: {
    label: string;
    value: string | number;
    trend?: "up" | "down" | "stable";
  }[];
  alerts?: number;
  isActive?: boolean;
}

interface MapStats {
  totalArea: number;
  activePastures: number;
  animalsTracked: number;
  devicesOnline: number;
  alertsActive: number;
  geofences: number;
  lastUpdate: Date;
}

// Función utilitaria para concatenar clases CSS
const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Datos de estadísticas del sistema de mapas
const MAP_STATS: MapStats = {
  totalArea: 156.5, // hectáreas
  activePastures: 8,
  animalsTracked: 247,
  devicesOnline: 234,
  alertsActive: 3,
  geofences: 12,
  lastUpdate: new Date(),
};

// Configuración de los módulos de mapas
const MAP_MODULES: MapModule[] = [
  {
    id: "ranch-overview",
    name: "Vista General del Rancho",
    description: "Mapa completo con instalaciones, zonas y límites del rancho",
    path: "/maps/ranch",
    icon: <Home className="w-6 h-6" />,
    component: <RanchMap />,
    color: "#22c55e",
    stats: [
      { label: "Área Total", value: "156.5 ha" },
      { label: "Instalaciones", value: 15 },
      { label: "Zonas", value: 8 },
    ],
    alerts: 0,
    isActive: true,
  },
  {
    id: "pasture-management",
    name: "Gestión de Potreros",
    description: "Mapa especializado para rotación y manejo de pastoreo",
    path: "/maps/pastures",
    icon: <TreePine className="w-6 h-6" />,
    component: <PastureMap />,
    color: "#84cc16",
    stats: [
      { label: "Potreros Activos", value: 8 },
      { label: "En Rotación", value: 3 },
      { label: "Descansando", value: 2 },
    ],
    alerts: 1,
    isActive: true,
  },
  {
    id: "livestock-tracking",
    name: "Ubicación del Ganado",
    description: "Tracking GPS en tiempo real de cada animal individual",
    path: "/maps/livestock",
    icon: <Navigation className="w-6 h-6" />,
    component: <LivestockLocation />,
    color: "#3b82f6",
    stats: [
      { label: "Animales Rastreados", value: 247 },
      { label: "Dispositivos Online", value: 234 },
      { label: "Alertas Activas", value: 3 },
    ],
    alerts: 3,
    isActive: true,
  },
];

// Componente de estadísticas generales
const MapsStatistics: React.FC<{ stats: MapStats }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg p-4 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Layers className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#2d5a45]">
              {stats.totalArea}
            </div>
            <div className="text-sm text-gray-500">Hectáreas</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-lg p-4 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <TreePine className="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#2d5a45]">
              {stats.activePastures}
            </div>
            <div className="text-sm text-gray-500">Potreros</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg p-4 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#2d5a45]">
              {stats.animalsTracked}
            </div>
            <div className="text-sm text-gray-500">Animales</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-lg p-4 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Zap className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#2d5a45]">
              {stats.devicesOnline}
            </div>
            <div className="text-sm text-gray-500">Online</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-lg p-4 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#2d5a45]">
              {stats.alertsActive}
            </div>
            <div className="text-sm text-gray-500">Alertas</div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-lg p-4 shadow-md"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="text-xl font-bold text-[#2d5a45]">
              {stats.geofences}
            </div>
            <div className="text-sm text-gray-500">Geo-cercas</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Componente de navegación de mapas
const MapsNavigation: React.FC<{
  modules: MapModule[];
  currentPath: string;
  onModuleSelect: (module: MapModule) => void;
}> = ({ modules, currentPath, onModuleSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {modules.map((module) => {
        const isSelected = currentPath.includes(
          module.path.split("/").pop() || ""
        );

        return (
          <motion.button
            key={module.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onModuleSelect(module)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200",
              isSelected
                ? "bg-[#519a7c] text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 shadow-md"
            )}
          >
            <div
              className={cn("flex-shrink-0", isSelected ? "text-white" : "")}
              style={{ color: isSelected ? "white" : module.color }}
            >
              {module.icon}
            </div>
            <span className="font-medium">{module.name}</span>
            {module.alerts && module.alerts > 0 && (
              <div
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold",
                  isSelected
                    ? "bg-white text-[#519a7c]"
                    : "bg-red-500 text-white"
                )}
              >
                {module.alerts}
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
};

// Componente principal de la página de mapas
export const MapsPage: React.FC<MapsPageProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedModule, setSelectedModule] = useState<MapModule | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Determinar el módulo activo basado en la ruta actual
  useEffect(() => {
    const currentModule = MAP_MODULES.find((module) =>
      location.pathname.includes(module.path.split("/").pop() || "")
    );
    setSelectedModule(currentModule || null);
  }, [location.pathname]);

  // Función para navegar a un módulo específico
  const handleModuleSelect = (module: MapModule) => {
    setIsLoading(true);
    setSelectedModule(module);
    navigate(module.path);

    // Simular tiempo de carga
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  // Función para refrescar datos
  const handleRefresh = () => {
    setIsLoading(true);
    // Simular actualización de datos
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div
      className={cn(
        "min-h-screen",
        // Fondo degradado principal del layout
        "bg-gradient-to-br from-[#F5F5DC] via-[#E8E8C8] to-[#D3D3B8]",
        className
      )}
    >
      <div className="p-6">
        {/* Header de la página */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#2d5a45] mb-2">
                Sistema de Mapas y Geolocalización
              </h1>
              <p className="text-gray-600">
                Gestión integral de ubicaciones, potreros y seguimiento GPS del
                ganado
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <RefreshCw
                  className={cn("w-4 h-4", isLoading && "animate-spin")}
                />
                Actualizar
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 bg-[#519a7c] text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Exportar
              </motion.button>
            </div>
          </div>

          {/* Indicador de última actualización */}
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>
              Última actualización: {MAP_STATS.lastUpdate.toLocaleString()}
            </span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-2"></div>
          </div>
        </motion.div>

        {/* Estadísticas generales */}
        <MapsStatistics stats={MAP_STATS} />

        {/* Navegación de módulos */}
        <MapsNavigation
          modules={MAP_MODULES}
          currentPath={location.pathname}
          onModuleSelect={handleModuleSelect}
        />

        {/* Contenedor principal del mapa */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white rounded-xl shadow-lg overflow-hidden"
          style={{ minHeight: "600px" }}
        >
          {/* Overlay de carga */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center"
              >
                <div className="flex items-center gap-3 text-[#519a7c]">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <span className="text-lg font-medium">Cargando mapa...</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Rutas de los mapas */}
          <Routes>
            <Route path="/" element={<Navigate to="/maps/ranch" replace />} />
            <Route path="/ranch" element={<RanchMap />} />
            <Route path="/pastures" element={<PastureMap />} />
            <Route path="/livestock" element={<LivestockLocation />} />
          </Routes>

          {/* Información del módulo activo */}
          {selectedModule && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs z-40"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: selectedModule.color + "20" }}
                >
                  <div style={{ color: selectedModule.color }}>
                    {selectedModule.icon}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#2d5a45] text-sm">
                    {selectedModule.name}
                  </h3>
                  <p className="text-xs text-gray-600">Módulo Activo</p>
                </div>
              </div>

              {selectedModule.stats && (
                <div className="space-y-2">
                  {selectedModule.stats.map((stat, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-gray-600">{stat.label}:</span>
                      <span className="font-medium text-[#2d5a45]">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {selectedModule.alerts && selectedModule.alerts > 0 && (
                <div className="mt-3 p-2 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700 text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{selectedModule.alerts} alerta(s) activa(s)</span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Panel de herramientas adicionales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-[#2d5a45]">
                Actividad Reciente
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  Última rotación de potrero
                </span>
                <span className="text-[#2d5a45]">Hace 2 horas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Alerta GPS resuelta</span>
                <span className="text-[#2d5a45]">Hace 4 horas</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nuevo animal rastreado</span>
                <span className="text-[#2d5a45]">Ayer</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-[#2d5a45]">
                Métricas del Sistema
              </h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Precisión GPS promedio</span>
                <span className="text-green-600 font-medium">2.8m</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Uptime de dispositivos</span>
                <span className="text-green-600 font-medium">98.7%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cobertura del rancho</span>
                <span className="text-green-600 font-medium">100%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Settings className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-[#2d5a45]">Acciones Rápidas</h3>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                Configurar nueva geo-cerca
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                Exportar datos de ubicación
              </button>
              <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors">
                Programar rotación de potreros
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MapsPage;
