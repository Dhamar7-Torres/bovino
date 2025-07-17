// src/pages/production/ProductionDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Milk,
  Beef,
  Heart,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Clock,
  CheckCircle,
  Users,
  MapPin,
  Thermometer,
  Droplets
} from 'lucide-react';

// Componentes de shadcn/ui simulados
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

interface ProgressProps {
  value: number;
  className?: string;
  children?: React.ReactNode;
}

const Progress: React.FC<ProgressProps> = ({ value, className = '', children }) => (
  <div className={`relative w-full overflow-hidden rounded-full ${className}`}>
    {children || (
      <div 
        className="h-full bg-[#519a7c] rounded-full transition-all duration-300" 
        style={{ width: `${value}%` }} 
      />
    )}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'success' | 'warning' | 'error';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variantClasses = {
    default: 'bg-gray-900 text-gray-50',
    outline: 'border border-gray-200 text-gray-900',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Interfaces para tipado de datos de producción
interface ProductionStats {
  totalCattle: number;
  milkProduction: number;
  meatProduction: number;
  breedingProduction: number;
  monthlyGrowth: number;
  activeAlerts: number;
  dailyTemperature: number;
  humidity: number;
}

interface MonthlyProduction {
  month: string;
  milk: number;
  meat: number;
  breeding: number;
}

interface ProductionCategory {
  name: string;
  value: number;
  color: string;
  trend: 'up' | 'down' | 'stable';
  percentage: number;
}

interface ProductionAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
  location?: string;
}

interface DailyTask {
  id: string;
  title: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  time: string;
}

const ProductionDashboard: React.FC = () => {
  // Estados para controlar la carga y datos
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('week');
  const [productionStats, setProductionStats] = useState<ProductionStats>({
    totalCattle: 0,
    milkProduction: 0,
    meatProduction: 0,
    breedingProduction: 0,
    monthlyGrowth: 0,
    activeAlerts: 0,
    dailyTemperature: 0,
    humidity: 0
  });

  // Datos simulados para estadísticas de producción
  const mockProductionStats: ProductionStats = {
    totalCattle: 1247,
    milkProduction: 8420, // litros por día
    meatProduction: 2850, // kg este mes
    breedingProduction: 89, // crías este año
    monthlyGrowth: 12.5,
    activeAlerts: 3,
    dailyTemperature: 24.5,
    humidity: 68
  };

  // Datos para gráfico de líneas - producción mensual
  const monthlyProductionData: MonthlyProduction[] = [
    { month: 'Ene', milk: 7800, meat: 2200, breeding: 15 },
    { month: 'Feb', milk: 8100, meat: 2400, breeding: 18 },
    { month: 'Mar', milk: 8350, meat: 2650, breeding: 22 },
    { month: 'Abr', milk: 8420, meat: 2850, breeding: 19 },
    { month: 'May', milk: 8580, meat: 2950, breeding: 25 },
    { month: 'Jun', milk: 8650, meat: 3100, breeding: 28 }
  ];

  // Datos para distribución de producción
  const productionCategories: ProductionCategory[] = [
    { 
      name: 'Producción Lechera', 
      value: 65, 
      color: '#519a7c', 
      trend: 'up',
      percentage: 8.5 
    },
    { 
      name: 'Producción Cárnica', 
      value: 25, 
      color: '#f4ac3a', 
      trend: 'up',
      percentage: 12.3 
    },
    { 
      name: 'Reproducción', 
      value: 10, 
      color: '#f2e9d8', 
      trend: 'stable',
      percentage: 5.2 
    }
  ];

  // Alertas actuales de producción
  const productionAlerts: ProductionAlert[] = [
    {
      id: '1',
      type: 'warning',
      message: 'Disminución en producción lechera en sector B',
      timestamp: '2 horas',
      location: 'Potrero B-3'
    },
    {
      id: '2',
      type: 'info',
      message: 'Programado mantenimiento de equipos de ordeño',
      timestamp: '4 horas',
      location: 'Sala de ordeño'
    },
    {
      id: '3',
      type: 'error',
      message: 'Falla en sistema de refrigeración',
      timestamp: '6 horas',
      location: 'Tanque principal'
    }
  ];

  // Tareas diarias de producción
  const dailyTasks: DailyTask[] = [
    { id: '1', title: 'Ordeño matutino - Sector A', completed: true, priority: 'high', time: '05:00' },
    { id: '2', title: 'Inspección sanitaria - Ganado reproductor', completed: true, priority: 'medium', time: '08:00' },
    { id: '3', title: 'Ordeño vespertino - Sector B', completed: false, priority: 'high', time: '17:00' },
    { id: '4', title: 'Revisión de alimentación', completed: false, priority: 'medium', time: '18:30' }
  ];

  // Efecto para simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setProductionStats(mockProductionStats);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Animaciones de Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Función para formatear números
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-MX').format(value);
  };

  // Componente de Loading con fondo degradado del layout principal
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative">
          <motion.div
            className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        </div>
        <motion.p
          className="text-white text-lg font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Cargando Dashboard de Producción...
        </motion.p>
      </motion.div>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header con título y controles */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2">
              Dashboard de Producción
            </h1>
            <p className="text-white/90 text-lg">
              Monitoreo integral de la producción ganadera en tiempo real
            </p>
          </div>
          
          {/* Selector de rango temporal */}
          <div className="flex gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-1">
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  selectedTimeRange === range
                    ? 'bg-white text-[#519a7c] shadow-sm'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                {range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Métricas principales de producción */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Ganado */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total de Ganado</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(productionStats.totalCattle)}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-500 font-medium">+{productionStats.monthlyGrowth}%</span>
                      <span className="text-sm text-gray-500 ml-1">este mes</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[#9c6d3f]/10 rounded-full">
                    <Users className="h-8 w-8 text-[#9c6d3f]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Producción Lechera */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Producción Lechera</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(productionStats.milkProduction)}</p>
                    <p className="text-sm text-gray-500">litros/día</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                      <span className="text-sm text-blue-500 font-medium">+8.5%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Milk className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Producción Cárnica */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Producción Cárnica</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(productionStats.meatProduction)}</p>
                    <p className="text-sm text-gray-500">kg este mes</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-sm text-orange-500 font-medium">+12.3%</span>
                    </div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Beef className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Reproducción */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Crías este Año</p>
                    <p className="text-3xl font-bold text-gray-900">{productionStats.breedingProduction}</p>
                    <p className="text-sm text-gray-500">de 120 objetivo</p>
                    <div className="flex items-center mt-2">
                      <Heart className="h-4 w-4 text-pink-500 mr-1" />
                      <span className="text-sm text-pink-500 font-medium">74% completado</span>
                    </div>
                  </div>
                  <div className="p-3 bg-pink-100 rounded-full">
                    <Heart className="h-8 w-8 text-pink-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Gráficos y estadísticas avanzadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de producción mensual */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <BarChart3 className="h-5 w-5 text-[#519a7c]" />
                  Tendencia de Producción Mensual
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyProductionData.slice(-3).map((data) => (
                    <div key={data.month} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 w-12">{data.month}</span>
                      <div className="flex-1 mx-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 bg-gradient-to-r from-[#519a7c] to-[#f4ac3a] rounded-full transition-all duration-1000 delay-300" 
                              style={{ width: `${(data.milk / 9000) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16">{formatNumber(data.milk)}L</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Distribución de producción */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <PieChart className="h-5 w-5 text-[#519a7c]" />
                  Distribución de Producción
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {productionCategories.map((category) => (
                  <div key={category.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                      <div className="flex items-center gap-1">
                        {category.trend === 'up' ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : category.trend === 'down' ? (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        ) : (
                          <Activity className="h-3 w-3 text-gray-500" />
                        )}
                        <span className="text-sm text-gray-600">{category.value}%</span>
                      </div>
                    </div>
                    <Progress value={category.value} className="h-2 bg-gray-200">
                      <div 
                        className="h-full rounded-full transition-all duration-1000 delay-500" 
                        style={{ 
                          width: `${category.value}%`,
                          backgroundColor: category.color
                        }} 
                      />
                    </Progress>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Alertas y tareas del día */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertas de producción */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <AlertTriangle className="h-5 w-5 text-[#f4ac3a]" />
                  Alertas de Producción
                  <Badge variant="error" className="ml-auto">
                    {productionAlerts.length} activas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {productionAlerts.map((alert) => (
                  <div key={alert.id} className={`p-3 rounded-lg border-l-4 ${
                    alert.type === 'error' ? 'bg-red-50 border-red-500' :
                    alert.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                    'bg-blue-50 border-blue-500'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                        {alert.location && (
                          <div className="flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span className="text-xs text-gray-500">{alert.location}</span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        hace {alert.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* Tareas del día */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Calendar className="h-5 w-5 text-[#519a7c]" />
                  Tareas de Producción Hoy
                  <Badge variant="success" className="ml-auto">
                    {dailyTasks.filter(task => task.completed).length}/{dailyTasks.length} completadas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dailyTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                    <div className={`p-1 rounded-full ${
                      task.completed ? 'bg-green-100' : 'bg-gray-200'
                    }`}>
                      <CheckCircle className={`h-4 w-4 ${
                        task.completed ? 'text-green-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        task.completed ? 'text-gray-500 line-through' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{task.time}</span>
                        <Badge 
                          variant={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
                          className="text-xs"
                        >
                          {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Condiciones ambientales */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Thermometer className="h-5 w-5 text-[#519a7c]" />
                Condiciones Ambientales del Rancho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                  <Thermometer className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-700 mb-1">{productionStats.dailyTemperature}°C</div>
                  <div className="text-sm text-blue-600">Temperatura</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg">
                  <Droplets className="h-8 w-8 text-cyan-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-cyan-700 mb-1">{productionStats.humidity}%</div>
                  <div className="text-sm text-cyan-600">Humedad</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-700 mb-1">Óptimas</div>
                  <div className="text-sm text-green-600">Condiciones</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                  <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-700 mb-1">94%</div>
                  <div className="text-sm text-purple-600">Eficiencia</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ProductionDashboard;