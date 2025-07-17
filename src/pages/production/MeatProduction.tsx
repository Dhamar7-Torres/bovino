import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Beef, 
  Scale, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Users,
  Star
} from 'lucide-react';
import { 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area
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

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c]',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
  };
  
  const sizeClasses = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 py-2 px-4',
    lg: 'h-11 px-8'
  };
  
  return (
    <button 
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'premium';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    outline: 'border border-gray-200 text-gray-900',
    premium: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white'
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

interface ProgressProps {
  value: number;
  className?: string;
  color?: string;
}

const Progress: React.FC<ProgressProps> = ({ value, className = '', color = 'bg-blue-600' }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 ${className}`}>
    <div className={`${color} h-2.5 rounded-full transition-all duration-300`} style={{ width: `${value}%` }} />
  </div>
);

// Interfaces para tipado de datos
interface MeatProductionStats {
  totalCattle: number;
  readyForSlaughter: number;
  averageWeight: number;
  monthlyProduction: number;
  weightGainRate: number;
  feedEfficiency: number;
}

interface CattleRecord {
  id: string;
  name: string;
  breed: string;
  currentWeight: number;
  targetWeight: number;
  age: number;
  condition: 'excellent' | 'good' | 'average' | 'poor';
  location: string;
  entryDate: string;
  expectedSlaughterDate: string;
  dailyGain: number;
  feedConsumption: number;
  notes?: string;
  status: 'growing' | 'ready' | 'scheduled' | 'sold';
}

interface WeightProgress {
  date: string;
  averageWeight: number;
  dailyGain: number;
  feedCost: number;
}

interface ConditionDistribution {
  name: string;
  value: number;
  color: string;
}

interface MonthlyProduction {
  month: string;
  sold: number;
  weight: number;
  revenue: number;
}

const MeatProduction: React.FC = () => {
  // Estados para controlar la carga y datos
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [, setSelectedAnimal] = useState<CattleRecord | null>(null);
  const [, setShowAddModal] = useState<boolean>(false);

  // Estados para datos
  const [meatStats, setMeatStats] = useState<MeatProductionStats>({
    totalCattle: 0,
    readyForSlaughter: 0,
    averageWeight: 0,
    monthlyProduction: 0,
    weightGainRate: 0,
    feedEfficiency: 0
  });

  // Datos simulados para estadísticas de producción cárnica
  const mockMeatStats: MeatProductionStats = {
    totalCattle: 485,
    readyForSlaughter: 32,
    averageWeight: 485,
    monthlyProduction: 2850,
    weightGainRate: 1.2,
    feedEfficiency: 6.8
  };

  // Datos para gráfico de progreso de peso
  const weightProgressData: WeightProgress[] = [
    { date: 'Ene', averageWeight: 420, dailyGain: 1.1, feedCost: 45000 },
    { date: 'Feb', averageWeight: 435, dailyGain: 1.15, feedCost: 47000 },
    { date: 'Mar', averageWeight: 450, dailyGain: 1.18, feedCost: 48500 },
    { date: 'Abr', averageWeight: 465, dailyGain: 1.22, feedCost: 50000 },
    { date: 'May', averageWeight: 480, dailyGain: 1.25, feedCost: 51500 },
    { date: 'Jun', averageWeight: 485, dailyGain: 1.20, feedCost: 52000 }
  ];

  // Datos para gráfico de producción mensual
  const monthlyProductionData: MonthlyProduction[] = [
    { month: 'Ene', sold: 25, weight: 2200, revenue: 380000 },
    { month: 'Feb', sold: 28, weight: 2450, revenue: 420000 },
    { month: 'Mar', sold: 32, weight: 2800, revenue: 485000 },
    { month: 'Abr', sold: 30, weight: 2650, revenue: 460000 },
    { month: 'May', sold: 35, weight: 3100, revenue: 520000 },
    { month: 'Jun', sold: 33, weight: 2850, revenue: 495000 }
  ];

  // Datos para gráfico de distribución de condiciones
  const conditionDistribution: ConditionDistribution[] = [
    { name: 'Excelente', value: 25, color: '#22c55e' },
    { name: 'Buena', value: 45, color: '#3b82f6' },
    { name: 'Promedio', value: 25, color: '#f59e0b' },
    { name: 'Deficiente', value: 5, color: '#ef4444' }
  ];

  // Datos simulados de registros de ganado
  const cattleRecords: CattleRecord[] = [
    {
      id: 'BEEF-001',
      name: 'Toro Supremo',
      breed: 'Angus',
      currentWeight: 520,
      targetWeight: 550,
      age: 24,
      condition: 'excellent',
      location: 'Potrero Engorde A',
      entryDate: '2024-01-15',
      expectedSlaughterDate: '2025-01-30',
      dailyGain: 1.3,
      feedConsumption: 8.5,
      notes: 'Excelente desarrollo muscular',
      status: 'ready'
    },
    {
      id: 'BEEF-002',
      name: 'Emperador',
      breed: 'Hereford',
      currentWeight: 485,
      targetWeight: 520,
      age: 22,
      condition: 'good',
      location: 'Potrero Engorde B',
      entryDate: '2024-02-20',
      expectedSlaughterDate: '2025-02-15',
      dailyGain: 1.1,
      feedConsumption: 7.8,
      notes: 'Buena conformación',
      status: 'growing'
    },
    {
      id: 'BEEF-003',
      name: 'Campeón',
      breed: 'Brahman',
      currentWeight: 510,
      targetWeight: 540,
      age: 26,
      condition: 'excellent',
      location: 'Potrero Engorde A',
      entryDate: '2023-12-10',
      expectedSlaughterDate: '2025-01-20',
      dailyGain: 1.2,
      feedConsumption: 8.2,
      notes: 'Listo para comercialización',
      status: 'ready'
    },
    {
      id: 'BEEF-004',
      name: 'Majestuoso',
      breed: 'Simmental',
      currentWeight: 470,
      targetWeight: 510,
      age: 20,
      condition: 'good',
      location: 'Potrero Engorde C',
      entryDate: '2024-03-15',
      expectedSlaughterDate: '2025-03-10',
      dailyGain: 1.15,
      feedConsumption: 7.5,
      notes: 'Desarrollo normal',
      status: 'growing'
    },
    {
      id: 'BEEF-005',
      name: 'Titán',
      breed: 'Charolais',
      currentWeight: 535,
      targetWeight: 560,
      age: 28,
      condition: 'excellent',
      location: 'Potrero Engorde A',
      entryDate: '2023-11-20',
      expectedSlaughterDate: '2025-01-15',
      dailyGain: 1.4,
      feedConsumption: 9.0,
      notes: 'Programado para venta premium',
      status: 'scheduled'
    }
  ];

  // Efecto para simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setMeatStats(mockMeatStats);
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

  // Función para formatear peso
  const formatWeight = (weight: number): string => {
    return `${formatNumber(weight)} kg`;
  };

  // Función para obtener color de condición
  const getConditionColor = (condition: string): string => {
    switch (condition) {
      case 'excellent': return 'success';
      case 'good': return 'default';
      case 'average': return 'warning';
      case 'poor': return 'error';
      default: return 'outline';
    }
  };

  // Función para obtener texto de condición
  const getConditionText = (condition: string): string => {
    switch (condition) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Buena';
      case 'average': return 'Promedio';
      case 'poor': return 'Deficiente';
      default: return 'Sin evaluar';
    }
  };

  // Función para obtener color de estado
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ready': return 'success';
      case 'growing': return 'default';
      case 'scheduled': return 'premium';
      case 'sold': return 'outline';
      default: return 'warning';
    }
  };

  // Función para obtener texto de estado
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'ready': return 'Listo';
      case 'growing': return 'En Engorde';
      case 'scheduled': return 'Programado';
      case 'sold': return 'Vendido';
      default: return 'Sin Estado';
    }
  };

  // Calcular progreso hacia peso objetivo
  const calculateProgress = (current: number, target: number): number => {
    return Math.min((current / target) * 100, 100);
  };

  // Filtrar registros basado en búsqueda y filtro
  const filteredRecords = cattleRecords.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || record.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Componente de Loading con fondo degradado del layout principal
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-white text-lg font-semibold">Cargando Producción Cárnica...</p>
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
            Producción Cárnica
          </h1>
          <p className="text-white/90 text-lg">
            Gestión integral de engorde y comercialización bovina
          </p>
        </motion.div>

        {/* Tarjetas de estadísticas principales */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
        >
          <StatsCard
            title="Total de Ganado"
            value={meatStats.totalCattle}
            icon={<Users className="h-8 w-8" />}
            trend="up"
            trendValue={3.2}
            description="Animales en programa de engorde"
            color="text-[#8b5a2b]"
          />
          
          <StatsCard
            title="Listos para Faena"
            value={meatStats.readyForSlaughter}
            icon={<CheckCircle className="h-8 w-8" />}
            trend="up"
            trendValue={15.8}
            description="Peso objetivo alcanzado"
            color="text-[#22c55e]"
          />
          
          <StatsCard
            title="Peso Promedio"
            value={formatWeight(meatStats.averageWeight)}
            icon={<Scale className="h-8 w-8" />}
            trend="up"
            trendValue={2.1}
            description="Peso vivo promedio del hato"
            color="text-[#3b82f6]"
          />
          
          <StatsCard
            title="Producción Mensual"
            value={formatWeight(meatStats.monthlyProduction)}
            icon={<Beef className="h-8 w-8" />}
            trend="up"
            trendValue={8.7}
            description="Kilogramos comercializados"
            color="text-[#dc2626]"
          />
          
          <StatsCard
            title="Ganancia Diaria"
            value={`${meatStats.weightGainRate} kg/día`}
            icon={<TrendingUp className="h-8 w-8" />}
            trend="up"
            trendValue={4.3}
            description="Ganancia promedio de peso"
            color="text-[#f59e0b]"
          />
          
          <StatsCard
            title="Eficiencia Alimenticia"
            value={`${meatStats.feedEfficiency}:1`}
            icon={<Target className="h-8 w-8" />}
            trend="down"
            trendValue={-2.1}
            description="Conversión alimento/ganancia"
            color="text-[#8b5cf6]"
          />
        </motion.div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de progreso de peso */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <BarChart3 className="h-5 w-5 text-[#519a7c]" />
                  Progreso de Peso Mensual
                </CardTitle>
                <CardDescription>
                  Evolución del peso promedio y ganancia diaria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weightProgressData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="weight"
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="gain"
                      orientation="right"
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
                    <Area
                      yAxisId="weight"
                      type="monotone"
                      dataKey="averageWeight"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      name="Peso Promedio (kg)"
                    />
                    <Line 
                      yAxisId="gain"
                      type="monotone" 
                      dataKey="dailyGain" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      name="Ganancia Diaria (kg)"
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráfico de producción mensual */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Activity className="h-5 w-5 text-[#519a7c]" />
                  Producción y Ventas Mensuales
                </CardTitle>
                <CardDescription>
                  Animales vendidos y peso comercializado
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyProductionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="count"
                      stroke="#666"
                      fontSize={12}
                    />
                    <YAxis 
                      yAxisId="weight"
                      orientation="right"
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
                    <Bar 
                      yAxisId="count"
                      dataKey="sold" 
                      fill="#8b5cf6" 
                      name="Animales Vendidos"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      yAxisId="weight"
                      dataKey="weight" 
                      fill="#f59e0b" 
                      name="Peso Total (kg)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Distribución de condiciones corporales */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <PieChart className="h-5 w-5 text-[#519a7c]" />
                Distribución de Condición Corporal
              </CardTitle>
              <CardDescription>
                Estado físico del ganado en engorde
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={conditionDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry: any) => `${entry.name}: ${entry.value}%`}
                      labelLine={false}
                    >
                      {conditionDistribution.map((entry, index) => (
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
                
                <div className="space-y-4">
                  {conditionDistribution.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-medium text-gray-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gray-800">{item.value}%</div>
                        <div className="text-sm text-gray-500">
                          {Math.round((item.value / 100) * meatStats.totalCattle)} animales
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabla de registros de ganado */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Beef className="h-5 w-5 text-[#dc2626]" />
                    Registro de Ganado en Engorde
                  </CardTitle>
                  <CardDescription>
                    Seguimiento individual de peso y desarrollo
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Animal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filtros y búsqueda */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Buscar por nombre, raza o ubicación..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] outline-none"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] outline-none bg-white"
                  >
                    <option value="all">Todos los Estados</option>
                    <option value="growing">En Engorde</option>
                    <option value="ready">Listos</option>
                    <option value="scheduled">Programados</option>
                    <option value="sold">Vendidos</option>
                  </select>
                </div>
              </div>

              {/* Tabla de registros */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Animal</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Peso Actual</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Objetivo</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Progreso</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Condición</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Estado</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Ubicación</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Ganancia</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, index) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3">
                          <div className="font-medium text-gray-900">{record.name}</div>
                          <div className="text-sm text-gray-500">{record.breed} • {record.age} meses</div>
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-gray-800">{formatWeight(record.currentWeight)}</div>
                        </td>
                        <td className="p-3 text-gray-700">{formatWeight(record.targetWeight)}</td>
                        <td className="p-3">
                          <div className="space-y-1">
                            <Progress 
                              value={calculateProgress(record.currentWeight, record.targetWeight)}
                              color="bg-gradient-to-r from-[#519a7c] to-[#22c55e]"
                            />
                            <div className="text-xs text-gray-500">
                              {calculateProgress(record.currentWeight, record.targetWeight).toFixed(1)}%
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={getConditionColor(record.condition) as any}>
                            {getConditionText(record.condition)}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={getStatusColor(record.status) as any}>
                            {record.status === 'scheduled' && <Star className="h-3 w-3 mr-1" />}
                            {getStatusText(record.status)}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-gray-700">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {record.location}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="text-sm font-medium text-gray-800">
                            {record.dailyGain} kg/día
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedAnimal(record)}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {/* Lógica para editar */}}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredRecords.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Beef className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No se encontraron animales con los filtros aplicados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Próximas actividades */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <AlertTriangle className="h-5 w-5 text-[#f4ac3a]" />
                Próximas Actividades de Engorde
              </CardTitle>
              <CardDescription>
                Tareas programadas y alertas importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900">Listos para Venta</h4>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      5 animales
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700">
                    Animales que han alcanzado el peso objetivo de comercialización
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">Pesajes Programados</h4>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      23 esta semana
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">
                    Pesajes de control y evaluación de ganancia de peso
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-yellow-900">Ajuste de Dieta</h4>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      8 requieren
                    </Badge>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Animales que necesitan ajuste en la alimentación
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MeatProduction;