import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  FileText, 
  Activity, 
  Package, 
  TrendingUp,
  Calendar,
  AlertTriangle,
  Settings,
  RefreshCw,
  Heart,
  ArrowLeft
} from 'lucide-react';

// Importar los componentes de páginas hijas
import { ReportDashboard } from './ReportDashboard';
import { HealthReports } from './HealthReports';
import { ProductionReports } from './ProductionReports';
import { InventoryReports } from './InventoryReports';

// Función de utilidad para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Interfaces para el módulo de reportes
interface ReportModule {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  color: string;
  stats: {
    total: number;
    thisMonth: number;
    trend: number;
  };
  features: string[];
  isNew?: boolean;
}



// Props del componente principal
interface ReportsPageProps {
  className?: string;
}

// Módulos de reportes disponibles con sus componentes
const REPORT_MODULES: ReportModule[] = [
  {
    id: 'dashboard',
    name: 'Centro de Reportes',
    description: 'Vista general y acceso rápido a todos los reportes',
    icon: <BarChart3 className="w-6 h-6" />,
    component: ReportDashboard,
    color: '#2d6f51',
    stats: {
      total: 127,
      thisMonth: 23,
      trend: 8.5
    },
    features: ['Vista general', 'Acceso rápido', 'Estadísticas'],
    isNew: false
  },
  {
    id: 'health',
    name: 'Reportes de Salud',
    description: 'Análisis veterinarios y estado de salud del ganado',
    icon: <Heart className="w-6 h-6" />,
    component: HealthReports,
    color: '#4e9c75',
    stats: {
      total: 45,
      thisMonth: 12,
      trend: 15.2
    },
    features: ['Salud general', 'Enfermedades', 'Tratamientos', 'Vacunación'],
    isNew: false
  },
  {
    id: 'production',
    name: 'Reportes de Producción',
    description: 'Métricas de rendimiento y productividad',
    icon: <TrendingUp className="w-6 h-6" />,
    component: ProductionReports,
    color: '#519a7c',
    stats: {
      total: 38,
      thisMonth: 8,
      trend: 5.7
    },
    features: ['Peso y crecimiento', 'Eficiencia alimentaria', 'Reproducción'],
    isNew: false
  },
  {
    id: 'inventory',
    name: 'Reportes de Inventario',
    description: 'Conteo, valuación y movimientos del ganado',
    icon: <Package className="w-6 h-6" />,
    component: InventoryReports,
    color: '#3ca373',
    stats: {
      total: 22,
      thisMonth: 6,
      trend: 12.1
    },
    features: ['Inventario completo', 'Valuación', 'Movimientos', 'Auditorías'],
    isNew: true
  },
];



// Componente para tarjeta de módulo
const ModuleCard: React.FC<{ module: ReportModule; index: number; onClick: () => void }> = ({ 
  module, 
  index, 
  onClick 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="group bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
      {/* Badge de nuevo si aplica */}
      {module.isNew && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#f4ac3a] to-[#ff8c42] text-white text-xs px-2 py-1 rounded-full font-medium">
          Nuevo
        </div>
      )}

      {/* Header con icono y estadísticas */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className="p-3 rounded-lg group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: `${module.color}20` }}
        >
          <div style={{ color: module.color }}>
            {module.icon}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold" style={{ color: module.color }}>
            {module.stats.total}
          </div>
          <div className="text-xs text-gray-500">reportes totales</div>
        </div>
      </div>

      {/* Contenido */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-[#2d6f51] transition-colors">
          {module.name}
        </h3>
        <p className="text-gray-600 text-sm mb-3">
          {module.description}
        </p>
        
        {/* Características */}
        <div className="flex flex-wrap gap-1">
          {module.features.map((feature, featureIndex) => (
            <span 
              key={featureIndex}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>
      </div>

      {/* Footer con métricas */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{module.stats.thisMonth}</span> este mes
        </div>
        <div className={cn(
          "flex items-center text-sm font-medium",
          module.stats.trend > 0 ? "text-green-600" : module.stats.trend < 0 ? "text-red-600" : "text-gray-500"
        )}>
          <span className={cn(
            "mr-1",
            module.stats.trend > 0 ? "↗" : module.stats.trend < 0 ? "↘" : "→"
          )}>
            {module.stats.trend !== 0 && `${Math.abs(module.stats.trend)}%`}
          </span>
          {module.stats.trend > 0 ? "Incremento" : module.stats.trend < 0 ? "Decremento" : "Sin cambios"}
        </div>
      </div>

      {/* Efecto de hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"
        style={{ background: `linear-gradient(135deg, ${module.color}, transparent)` }}
      />
    </motion.div>
  );
};



// Componente principal
export const ReportsPage: React.FC<ReportsPageProps> = ({ className }) => {
  // Estado para manejar la navegación interna
  const [currentModule, setCurrentModule] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Obtener el módulo actual
  const activeModule = currentModule ? REPORT_MODULES.find(m => m.id === currentModule) : null;

  // Función para navegar a un módulo específico
  const handleModuleClick = (module: ReportModule) => {
    setCurrentModule(module.id);
  };

  // Función para volver al hub principal
  const handleBackToHub = () => {
    setCurrentModule(null);
  };

  // Función para refrescar datos
  const handleRefresh = async () => {
    setIsLoading(true);
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  // Renderizar página hija si hay un módulo seleccionado
  if (activeModule) {
    const ChildComponent = activeModule.component;
    return (
      <div className={cn("min-h-screen", className)}>
        {/* Barra de navegación superior */}
        <div className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] p-4 shadow-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToHub}
                className="flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al Hub
              </button>
              
              <div className="flex items-center gap-3 text-white">
                <div 
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  {activeModule.icon}
                </div>
                <div>
                  <h1 className="text-xl font-semibold">{activeModule.name}</h1>
                  <p className="text-white/80 text-sm">{activeModule.description}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Renderizar el componente hijo */}
        <ChildComponent />
      </div>
    );
  }

  // Renderizar hub principal
  return (
    <div
      className={cn(
        "min-h-screen",
        // Fondo degradado principal del layout
        "bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]",
        className
      )}
    >
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header principal */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-3">
                Centro de Reportes y Análisis
              </h1>
              <p className="text-white/90 text-lg">
                Sistema integral de reportes para la gestión ganadera inteligente
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                Actualizar
              </button>

              <button className="flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all duration-200">
                <Settings className="w-4 h-4" />
                Configurar
              </button>
            </div>
          </motion.div>

          {/* Estadísticas principales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total de Reportes</p>
                  <p className="text-3xl font-bold text-[#2d6f51]">308</p>
                  <p className="text-green-600 text-sm flex items-center">
                    <span className="mr-1">↗</span> 12.5% este mes
                  </p>
                </div>
                <div className="p-3 bg-[#2d6f51]/20 rounded-lg">
                  <FileText className="w-6 h-6 text-[#2d6f51]" />
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Reportes Activos</p>
                  <p className="text-3xl font-bold text-[#4e9c75]">67</p>
                  <p className="text-green-600 text-sm flex items-center">
                    <span className="mr-1">↗</span> 8.2% este mes
                  </p>
                </div>
                <div className="p-3 bg-[#4e9c75]/20 rounded-lg">
                  <Activity className="w-6 h-6 text-[#4e9c75]" />
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Programados</p>
                  <p className="text-3xl font-bold text-[#519a7c]">23</p>
                  <p className="text-blue-600 text-sm flex items-center">
                    <span className="mr-1">→</span> Sin cambios
                  </p>
                </div>
                <div className="p-3 bg-[#519a7c]/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-[#519a7c]" />
                </div>
              </div>
            </div>

            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Con Alertas</p>
                  <p className="text-3xl font-bold text-[#f4ac3a]">8</p>
                  <p className="text-red-600 text-sm flex items-center">
                    <span className="mr-1">↘</span> 15.8% este mes
                  </p>
                </div>
                <div className="p-3 bg-[#f4ac3a]/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-[#f4ac3a]" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Grid de módulos de reportes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-2xl font-semibold text-white mb-6">
              Módulos de Reportes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {REPORT_MODULES.map((module, index) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  index={index}
                  onClick={() => handleModuleClick(module)}
                />
              ))}
            </div>
          </motion.div>


        </div>
      </div>
    </div>
  );
};