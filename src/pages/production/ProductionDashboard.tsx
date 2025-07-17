import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Users, 
  Droplets, 
  Beef, 
  Heart,
  TrendingUp,
  TrendingDown,
  Calendar,
  AlertTriangle,
  BarChart3,
  PieChart,
  Target,
  Activity
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

// Componentes UI básicos (reemplazando shadcn)
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
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

const CardDescription: React.FC<CardProps> = ({ children, className = '' }) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
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
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    {children || <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${value}%` }} />}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variantClasses = variant === 'outline' 
    ? 'border border-gray-200 text-gray-900' 
    : 'bg-gray-900 text-gray-50';
  
  return (
    <div className={`${baseClasses} ${variantClasses} ${className}`}>
      {children}
    </div>
  );
};

// Interfaces para tipado de datos
interface ProductionStats {
  totalCattle: number;
  milkProduction: number;
  meatProduction: number;
  breedingProduction: number;
  monthlyGrowth: number;
  activeAlerts: number;
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

const ProductionDashboard: React.FC = () => {
  // Estado para controlar la carga y datos
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [productionStats, setProductionStats] = useState<ProductionStats>({
    totalCattle: 0,
    milkProduction: 0,
    meatProduction: 0,
    breedingProduction: 0,
    monthlyGrowth: 0,
    activeAlerts: 0
  });

  // Datos simulados para estadísticas de producción
  const mockProductionStats: ProductionStats = {
    totalCattle: 1247,
    milkProduction: 8420, // litros por día
    meatProduction: 2850, // kg este mes
    breedingProduction: 89, // crías este año
    monthlyGrowth: 12.5,
    activeAlerts: 3
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

  // Datos para gráfico de torta - distribución de producción
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
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Función para formatear números
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-MX').format(value);
  };

  // Componente de Loading con fondo degradado del layout principal
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-white text-lg font-semibold">Cargando Dashboard de Producción...</p>
      </div>
    </div>
  );

  // Componente para tarjeta de estadística con animación
  const StatsCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: number;
    description?: string;
    color: string;
  }> = ({ title, value, icon, trend, trendValue, description, color }) => (
    <motion.div variants={itemVariants}>
      <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className={`h-8 w-8 ${color}`}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-800 mb-1">
            {typeof value === 'number' ? formatNumber(value) : value}
          </div>
          {trend && trendValue && (
            <div className="flex items-center text-xs text-gray-600">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              ) : trend === 'down' ? (
                <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
              ) : (
                <Activity className="h-4 w-4 text-gray-500 mr-1" />
              )}
              <span className={trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}>
                {trendValue > 0 ? '+' : ''}{trendValue}%
              </span>
              <span className="ml-1">vs mes anterior</span>
            </div>
          )}
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
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
        {/* Header con título animado */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
            Dashboard de Producción
          </h1>
          <p className="text-white/90 text-lg">
            Monitoreo integral de la producción ganadera
          </p>
        </motion.div>

        {/* Tarjetas de estadísticas principales */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          variants={containerVariants}
        >
          <StatsCard
            title="Total de Ganado"
            value={productionStats.totalCattle}
            icon={<Users className="h-8 w-8" />}
            trend="up"
            trendValue={5.2}
            description="Cabezas de ganado registradas"
            color="text-[#9c6d3f]"
          />
          
          <StatsCard
            title="Producción Lechera"
            value={`${formatNumber(productionStats.milkProduction)} L`}
            icon={<Droplets className="h-8 w-8" />}
            trend="up"
            trendValue={8.5}
            description="Litros producidos hoy"
            color="text-[#519a7c]"
          />
          
          <StatsCard
            title="Producción Cárnica"
            value={`${formatNumber(productionStats.meatProduction)} kg`}
            icon={<Beef className="h-8 w-8" />}
            trend="up"
            trendValue={12.3}
            description="Kilogramos este mes"
            color="text-[#f4ac3a]"
          />
          
          <StatsCard
            title="Reproducción"
            value={productionStats.breedingProduction}
            icon={<Heart className="h-8 w-8" />}
            trend="stable"
            trendValue={5.2}
            description="Crías nacidas este año"
            color="text-[#9c6ad5]"
          />
        </motion.div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de líneas - Tendencia mensual */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <BarChart3 className="h-5 w-5 text-[#519a7c]" />
                  Tendencia de Producción Mensual
                </CardTitle>
                <CardDescription>
                  Evolución de la producción en los últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyProductionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#666"
                      fontSize={12}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="milk" 
                      stroke="#519a7c" 
                      strokeWidth={3}
                      name="Leche (L)"
                      dot={{ fill: '#519a7c', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="meat" 
                      stroke="#f4ac3a" 
                      strokeWidth={3}
                      name="Carne (kg)"
                      dot={{ fill: '#f4ac3a', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="breeding" 
                      stroke="#9c6ad5" 
                      strokeWidth={3}
                      name="Crías"
                      dot={{ fill: '#9c6ad5', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráfico de torta - Distribución de producción */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <PieChart className="h-5 w-5 text-[#519a7c]" />
                  Distribución de Producción
                </CardTitle>
                <CardDescription>
                  Porcentaje de enfoque por tipo de producción
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={productionCategories}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry: any) => `${entry.name}: ${entry.percentage}%`}
                      labelLine={false}
                    >
                      {productionCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '8px'
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Alertas y objetivos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertas activas */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  Alertas de Producción
                </CardTitle>
                <CardDescription>
                  Notificaciones importantes del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                  <div>
                    <p className="font-medium text-gray-800">Producción lechera por debajo del objetivo</p>
                    <p className="text-sm text-gray-600">Sector Norte - 15% menos de lo esperado</p>
                  </div>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800">
                    Media
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div>
                    <p className="font-medium text-gray-800">Revisión de reproductores programada</p>
                    <p className="text-sm text-gray-600">3 toros requieren evaluación médica</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    Baja
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div>
                    <p className="font-medium text-gray-800">Meta mensual alcanzada</p>
                    <p className="text-sm text-gray-600">Producción cárnica superó expectativas</p>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Éxito
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Objetivos mensuales */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Target className="h-5 w-5 text-[#519a7c]" />
                  Objetivos Mensuales
                </CardTitle>
                <CardDescription>
                  Progreso hacia las metas establecidas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Producción Lechera</span>
                    <span className="text-sm text-gray-600">85% completado</span>
                  </div>
                  <Progress value={85} className="h-2 bg-gray-200">
                    <div className="h-full bg-[#519a7c] rounded-full transition-all duration-300" style={{ width: '85%' }} />
                  </Progress>
                  <p className="text-xs text-gray-500 mt-1">8,420L / 9,900L objetivo mensual</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Producción Cárnica</span>
                    <span className="text-sm text-gray-600">95% completado</span>
                  </div>
                  <Progress value={95} className="h-2 bg-gray-200">
                    <div className="h-full bg-[#f4ac3a] rounded-full transition-all duration-300" style={{ width: '95%' }} />
                  </Progress>
                  <p className="text-xs text-gray-500 mt-1">2,850kg / 3,000kg objetivo mensual</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Reproducción</span>
                    <span className="text-sm text-gray-600">74% completado</span>
                  </div>
                  <Progress value={74} className="h-2 bg-gray-200">
                    <div className="h-full bg-[#9c6ad5] rounded-full transition-all duration-300" style={{ width: '74%' }} />
                  </Progress>
                  <p className="text-xs text-gray-500 mt-1">89 crías / 120 objetivo anual</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Información adicional */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Calendar className="h-5 w-5 text-[#519a7c]" />
                Resumen de Actividades del Día
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">12</div>
                  <div className="text-sm text-gray-600">Ordeños Programados</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">8</div>
                  <div className="text-sm text-gray-600">Revisiones Veterinarias</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">5</div>
                  <div className="text-sm text-gray-600">Inseminaciones Programadas</div>
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