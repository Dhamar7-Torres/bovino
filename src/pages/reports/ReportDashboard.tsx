import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  BarChart3, 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  Activity,
  Map,
  Syringe,
  AlertTriangle,
  Eye,
  Filter,
  RefreshCw,
  Plus
} from 'lucide-react';

// Función de utilidad para combinar clases CSS
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Interfaces del módulo de reportes
interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  stats: {
    total: number;
    trend: number;
    label: string;
  };
  lastUpdated: string;
  isNew?: boolean;
}

interface QuickStat {
  id: string;
  label: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

interface RecentReport {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  status: 'completed' | 'processing' | 'failed';
  downloadUrl?: string;
}

// Props del componente principal
interface ReportDashboardProps {
  className?: string;
}

// Datos de ejemplo para reportes disponibles
const REPORT_CARDS: ReportCard[] = [
  {
    id: 'health-overview',
    title: 'Resumen de Salud',
    description: 'Estado general de salud del ganado',
    icon: <Activity className="w-6 h-6" />,
    path: '/reports/health',
    color: '#2d6f51',
    stats: {
      total: 1248,
      trend: 5.2,
      label: 'animales registrados'
    },
    lastUpdated: '2 horas'
  },
  {
    id: 'vaccination-coverage',
    title: 'Cobertura de Vacunación',
    description: 'Análisis de vacunas aplicadas',
    icon: <Syringe className="w-6 h-6" />,
    path: '/reports/vaccinations',
    color: '#4e9c75',
    stats: {
      total: 95.6,
      trend: 2.1,
      label: '% de cobertura'
    },
    lastUpdated: '1 hora',
    isNew: true
  },
  {
    id: 'geographic-distribution',
    title: 'Distribución Geográfica',
    description: 'Ubicación y movimiento del ganado',
    icon: <Map className="w-6 h-6" />,
    path: '/reports/geographic',
    color: '#519a7c',
    stats: {
      total: 24,
      trend: -1.2,
      label: 'ubicaciones activas'
    },
    lastUpdated: '30 min'
  },
  {
    id: 'production-metrics',
    title: 'Métricas de Producción',
    description: 'Rendimiento y productividad',
    icon: <TrendingUp className="w-6 h-6" />,
    path: '/reports/production',
    color: '#3ca373',
    stats: {
      total: 87.3,
      trend: 4.7,
      label: '% eficiencia'
    },
    lastUpdated: '3 horas'
  },
  {
    id: 'disease-analysis',
    title: 'Análisis de Enfermedades',
    description: 'Seguimiento de patologías',
    icon: <AlertTriangle className="w-6 h-6" />,
    path: '/reports/diseases',
    color: '#f4ac3a',
    stats: {
      total: 12,
      trend: -8.5,
      label: 'casos activos'
    },
    lastUpdated: '1 hora'
  },
  {
    id: 'financial-summary',
    title: 'Resumen Financiero',
    description: 'Costos y rentabilidad',
    icon: <BarChart3 className="w-6 h-6" />,
    path: '/reports/financial',
    color: '#2e8b57',
    stats: {
      total: 156780,
      trend: 12.3,
      label: 'valor del ganado'
    },
    lastUpdated: '6 horas'
  }
];

// Estadísticas rápidas
const QUICK_STATS: QuickStat[] = [
  {
    id: 'total-reports',
    label: 'Reportes Generados',
    value: '1,247',
    change: 8.2,
    icon: <FileText className="w-5 h-5" />,
    color: '#2d6f51'
  },
  {
    id: 'active-alerts',
    label: 'Alertas Activas',
    value: '23',
    change: -15.3,
    icon: <AlertTriangle className="w-5 h-5" />,
    color: '#f4ac3a'
  },
  {
    id: 'data-sources',
    label: 'Fuentes de Datos',
    value: '8',
    change: 0,
    icon: <Activity className="w-5 h-5" />,
    color: '#4e9c75'
  },
  {
    id: 'export-rate',
    label: 'Tasa de Exportación',
    value: '94.5%',
    change: 2.1,
    icon: <Download className="w-5 h-5" />,
    color: '#519a7c'
  }
];

// Reportes recientes
const RECENT_REPORTS: RecentReport[] = [
  {
    id: '1',
    name: 'Resumen Mensual de Vacunación - Enero 2025',
    type: 'Vacunación',
    createdAt: '2025-01-15 14:30',
    status: 'completed',
    downloadUrl: '/downloads/vaccination-jan-2025.pdf'
  },
  {
    id: '2',
    name: 'Análisis de Salud por Potrero',
    type: 'Salud',
    createdAt: '2025-01-15 12:15',
    status: 'completed',
    downloadUrl: '/downloads/health-analysis.xlsx'
  },
  {
    id: '3',
    name: 'Reporte de Productividad Q4 2024',
    type: 'Producción',
    createdAt: '2025-01-15 09:45',
    status: 'processing'
  },
  {
    id: '4',
    name: 'Distribución Geográfica Actualizada',
    type: 'Geográfico',
    createdAt: '2025-01-14 16:20',
    status: 'failed'
  }
];

// Componente para tarjeta de estadística rápida
const QuickStatCard: React.FC<{ stat: QuickStat }> = ({ stat }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
          <div className={cn(
            "flex items-center text-sm mt-2",
            stat.change > 0 ? "text-green-600" : stat.change < 0 ? "text-red-600" : "text-gray-500"
          )}>
            <span className={cn(
              "mr-1",
              stat.change > 0 ? "↗" : stat.change < 0 ? "↘" : "→"
            )}>
              {stat.change !== 0 && `${Math.abs(stat.change)}%`}
            </span>
            {stat.change > 0 ? "Incremento" : stat.change < 0 ? "Decremento" : "Sin cambios"}
          </div>
        </div>
        <div 
          className="p-3 rounded-lg"
          style={{ backgroundColor: `${stat.color}20` }}
        >
          <div style={{ color: stat.color }}>
            {stat.icon}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Componente para tarjeta de reporte
const ReportCard: React.FC<{ report: ReportCard; index: number }> = ({ report, index }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(report.path);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={handleCardClick}
      className="group bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
    >
      {/* Badge de nuevo si aplica */}
      {report.isNew && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-[#f4ac3a] to-[#ff8c42] text-white text-xs px-2 py-1 rounded-full font-medium">
          Nuevo
        </div>
      )}

      {/* Header con icono y título */}
      <div className="flex items-start justify-between mb-4">
        <div 
          className="p-3 rounded-lg group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: `${report.color}20` }}
        >
          <div style={{ color: report.color }}>
            {report.icon}
          </div>
        </div>
        <Eye className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
      </div>

      {/* Contenido */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-[#2d6f51] transition-colors">
          {report.title}
        </h3>
        <p className="text-gray-600 text-sm">
          {report.description}
        </p>
      </div>

      {/* Estadísticas */}
      <div className="mb-4">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold" style={{ color: report.color }}>
            {typeof report.stats.total === 'number' && report.stats.total > 1000 
              ? (report.stats.total / 1000).toFixed(1) + 'K'
              : report.stats.total}
          </span>
          <span className={cn(
            "text-sm font-medium",
            report.stats.trend > 0 ? "text-green-600" : "text-red-600"
          )}>
            {report.stats.trend > 0 ? '+' : ''}{report.stats.trend}%
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{report.stats.label}</p>
      </div>

      {/* Footer */}
      <div className="text-xs text-gray-400 border-t border-gray-100 pt-3">
        Actualizado hace {report.lastUpdated}
      </div>

      {/* Efecto de hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"
        style={{ background: `linear-gradient(135deg, ${report.color}, transparent)` }}
      />
    </motion.div>
  );
};

// Componente para reporte reciente
const RecentReportItem: React.FC<{ report: RecentReport }> = ({ report }) => {
  const getStatusColor = (status: RecentReport['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'failed': return 'text-red-600 bg-red-100';
    }
  };

  const getStatusLabel = (status: RecentReport['status']) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'processing': return 'Procesando';
      case 'failed': return 'Fallido';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-4 bg-gray-50/50 rounded-lg hover:bg-gray-100/50 transition-colors"
    >
      <div className="flex-1">
        <h4 className="font-medium text-gray-800 text-sm">{report.name}</h4>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-gray-500">{report.type}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500">{report.createdAt}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <span className={cn(
          "px-2 py-1 rounded-full text-xs font-medium",
          getStatusColor(report.status)
        )}>
          {getStatusLabel(report.status)}
        </span>
        
        {report.status === 'completed' && report.downloadUrl && (
          <button className="p-1 text-gray-400 hover:text-[#2d6f51] transition-colors">
            <Download className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

// Componente principal del dashboard de reportes
export const ReportDashboard: React.FC<ReportDashboardProps> = ({ className }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Función para refrescar datos
  const handleRefresh = async () => {
    setIsLoading(true);
    // Simular llamada a API
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  // Función para crear nuevo reporte
  const handleCreateReport = () => {
    navigate('/reports/create');
  };

  // Verificar si estamos en la ruta padre
  const isMainDashboard = location.pathname === '/reports';

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
        {isMainDashboard ? (
          <div className="max-w-7xl mx-auto">
            {/* Header del dashboard */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-sm mb-2">
                  Centro de Reportes y Análisis
                </h1>
                <p className="text-white/90">
                  Genera, visualiza y exporta reportes personalizados del sistema ganadero
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

                <button
                  onClick={handleCreateReport}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Crear Reporte
                </button>
              </div>
            </motion.div>

            {/* Estadísticas rápidas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {QUICK_STATS.map((stat) => (
                <QuickStatCard key={stat.id} stat={stat} />
              ))}
            </motion.div>

            {/* Filtros y controles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-semibold text-white">
                  Reportes Disponibles
                </h2>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-white/70" />
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1 text-sm backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
                  >
                    <option value="all">Todos los Reportes</option>
                    <option value="health">Salud</option>
                    <option value="vaccination">Vacunación</option>
                    <option value="production">Producción</option>
                    <option value="financial">Financiero</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Calendar className="w-4 h-4" />
                Última actualización: Hace 2 horas
              </div>
            </motion.div>

            {/* Grid de tarjetas de reportes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
            >
              {REPORT_CARDS.map((report, index) => (
                <ReportCard key={report.id} report={report} index={index} />
              ))}
            </motion.div>

            {/* Reportes recientes */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#2d6f51]" />
                  Reportes Recientes
                </h3>
                <button
                  onClick={() => navigate('/reports/history')}
                  className="text-[#2d6f51] hover:text-[#265a44] text-sm font-medium transition-colors"
                >
                  Ver todos
                </button>
              </div>

              <div className="space-y-3">
                {RECENT_REPORTS.map((report) => (
                  <RecentReportItem key={report.id} report={report} />
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          // Renderizar rutas hijas
          <Outlet />
        )}
      </div>
    </div>
  );
};