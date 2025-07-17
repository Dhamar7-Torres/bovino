import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Droplets, 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  Activity,
  Users,
  TestTube,
  Zap,
  Award
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
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
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline' | 'premium' | 'excellent';
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
    premium: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white',
    excellent: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Interfaces para tipado de datos
interface MilkProductionStats {
  totalMilkingCows: number;
  dailyProduction: number;
  averagePerCow: number;
  qualityGrade: string;
  fatContent: number;
  proteinContent: number;
}

interface CowMilkRecord {
  id: string;
  name: string;
  breed: string;
  lactationNumber: number;
  daysInMilk: number;
  lastMilking: string;
  dailyProduction: number;
  morningMilk: number;
  afternoonMilk: number;
  fatPercentage: number;
  proteinPercentage: number;
  somaticCells: number;
  quality: 'excellent' | 'good' | 'average' | 'poor';
  location: string;
  status: 'active' | 'dry' | 'sick' | 'fresh';
  notes?: string;
}

interface DailyMilkProduction {
  date: string;
  morning: number;
  afternoon: number;
  total: number;
  quality: number;
}

interface QualityDistribution {
  name: string;
  value: number;
  color: string;
}

interface MilkingSession {
  id: string;
  session: 'morning' | 'afternoon';
  date: string;
  startTime: string;
  endTime: string;
  cowsMillked: number;
  totalLiters: number;
  averageTime: number;
  quality: number;
}

const MilkProduction: React.FC = () => {
  // Estados para controlar la carga y datos
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [, setSelectedCow] = useState<CowMilkRecord | null>(null);
  const [, setShowAddModal] = useState<boolean>(false);
  const [] = useState<'morning' | 'afternoon'>('morning');

  // Estados para datos
  const [milkStats, setMilkStats] = useState<MilkProductionStats>({
    totalMilkingCows: 0,
    dailyProduction: 0,
    averagePerCow: 0,
    qualityGrade: '',
    fatContent: 0,
    proteinContent: 0
  });

  // Datos simulados para estadísticas de producción lechera
  const mockMilkStats: MilkProductionStats = {
    totalMilkingCows: 178,
    dailyProduction: 4250,
    averagePerCow: 23.9,
    qualityGrade: 'Premium',
    fatContent: 3.8,
    proteinContent: 3.2
  };

  // Datos para gráfico de producción diaria
  const dailyProductionData: DailyMilkProduction[] = [
    { date: '01/06', morning: 2100, afternoon: 1950, total: 4050, quality: 96 },
    { date: '02/06', morning: 2150, afternoon: 2000, total: 4150, quality: 97 },
    { date: '03/06', morning: 2200, afternoon: 2050, total: 4250, quality: 95 },
    { date: '04/06', morning: 2180, afternoon: 1980, total: 4160, quality: 98 },
    { date: '05/06', morning: 2250, afternoon: 2100, total: 4350, quality: 96 },
    { date: '06/06', morning: 2200, afternoon: 2050, total: 4250, quality: 97 },
    { date: '07/06', morning: 2300, afternoon: 2150, total: 4450, quality: 98 }
  ];

  // Datos para distribución de calidad
  const qualityDistribution: QualityDistribution[] = [
    { name: 'Excelente', value: 35, color: '#10b981' },
    { name: 'Buena', value: 45, color: '#3b82f6' },
    { name: 'Promedio', value: 15, color: '#f59e0b' },
    { name: 'Deficiente', value: 5, color: '#ef4444' }
  ];

  // Datos de sesiones de ordeño
  const milkingSessions: MilkingSession[] = [
    {
      id: 'S001',
      session: 'morning',
      date: '2024-06-15',
      startTime: '05:30',
      endTime: '07:45',
      cowsMillked: 178,
      totalLiters: 2300,
      averageTime: 8.5,
      quality: 97
    },
    {
      id: 'S002',
      session: 'afternoon',
      date: '2024-06-15',
      startTime: '16:00',
      endTime: '18:30',
      cowsMillked: 175,
      totalLiters: 2150,
      averageTime: 9.2,
      quality: 96
    }
  ];

  // Datos simulados de registros de vacas lecheras
  const cowMilkRecords: CowMilkRecord[] = [
    {
      id: 'COW-L001',
      name: 'Estrella',
      breed: 'Holstein',
      lactationNumber: 3,
      daysInMilk: 180,
      lastMilking: '2024-06-15 17:30',
      dailyProduction: 32.5,
      morningMilk: 18.5,
      afternoonMilk: 14.0,
      fatPercentage: 3.9,
      proteinPercentage: 3.3,
      somaticCells: 145000,
      quality: 'excellent',
      location: 'Sala de Ordeño A',
      status: 'active',
      notes: 'Excelente productora, récord del hato'
    },
    {
      id: 'COW-L002',
      name: 'Luna',
      breed: 'Jersey',
      lactationNumber: 2,
      daysInMilk: 220,
      lastMilking: '2024-06-15 17:25',
      dailyProduction: 28.8,
      morningMilk: 16.2,
      afternoonMilk: 12.6,
      fatPercentage: 4.2,
      proteinPercentage: 3.5,
      somaticCells: 180000,
      quality: 'excellent',
      location: 'Sala de Ordeño A',
      status: 'active',
      notes: 'Alta calidad en grasa y proteína'
    },
    {
      id: 'COW-L003',
      name: 'Bella',
      breed: 'Holstein',
      lactationNumber: 1,
      daysInMilk: 90,
      lastMilking: '2024-06-15 17:40',
      dailyProduction: 25.2,
      morningMilk: 14.5,
      afternoonMilk: 10.7,
      fatPercentage: 3.7,
      proteinPercentage: 3.1,
      somaticCells: 95000,
      quality: 'good',
      location: 'Sala de Ordeño B',
      status: 'active',
      notes: 'Primera lactancia prometedora'
    },
    {
      id: 'COW-L004',
      name: 'Margarita',
      breed: 'Brown Swiss',
      lactationNumber: 4,
      daysInMilk: 280,
      lastMilking: '2024-06-15 17:15',
      dailyProduction: 18.5,
      morningMilk: 10.5,
      afternoonMilk: 8.0,
      fatPercentage: 3.8,
      proteinPercentage: 3.4,
      somaticCells: 290000,
      quality: 'average',
      location: 'Sala de Ordeño B',
      status: 'active',
      notes: 'Final de lactancia, considerar secado'
    },
    {
      id: 'COW-L005',
      name: 'Rosa',
      breed: 'Holstein',
      lactationNumber: 2,
      daysInMilk: 45,
      lastMilking: '2024-06-15 17:35',
      dailyProduction: 35.8,
      morningMilk: 20.5,
      afternoonMilk: 15.3,
      fatPercentage: 3.6,
      proteinPercentage: 3.0,
      somaticCells: 75000,
      quality: 'excellent',
      location: 'Sala de Ordeño A',
      status: 'fresh',
      notes: 'Recién parida, excelente inicio'
    }
  ];

  // Efecto para simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setMilkStats(mockMilkStats);
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

  // Función para formatear litros
  const formatLiters = (liters: number): string => {
    return `${formatNumber(liters)} L`;
  };

  // Función para formatear fechas

  // Función para formatear hora
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para obtener color de calidad
  const getQualityColor = (quality: string): string => {
    switch (quality) {
      case 'excellent': return 'excellent';
      case 'good': return 'success';
      case 'average': return 'warning';
      case 'poor': return 'error';
      default: return 'outline';
    }
  };

  // Función para obtener texto de calidad
  const getQualityText = (quality: string): string => {
    switch (quality) {
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
      case 'active': return 'success';
      case 'fresh': return 'premium';
      case 'dry': return 'warning';
      case 'sick': return 'error';
      default: return 'outline';
    }
  };

  // Función para obtener texto de estado
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active': return 'Activa';
      case 'fresh': return 'Recién Parida';
      case 'dry': return 'Seca';
      case 'sick': return 'Enferma';
      default: return 'Sin Estado';
    }
  };

  // Función para evaluar células somáticas
  const getSomaticCellsStatus = (count: number): { color: string; status: string } => {
    if (count < 100000) return { color: 'excellent', status: 'Excelente' };
    if (count < 200000) return { color: 'success', status: 'Buena' };
    if (count < 400000) return { color: 'warning', status: 'Atención' };
    return { color: 'error', status: 'Problema' };
  };

  // Filtrar registros basado en búsqueda y filtro
  const filteredRecords = cowMilkRecords.filter(record => {
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
        <p className="text-white text-lg font-semibold">Cargando Producción Lechera...</p>
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
              <span className="ml-1">vs ayer</span>
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
            Producción Lechera
          </h1>
          <p className="text-white/90 text-lg">
            Gestión integral de ordeño y calidad láctea
          </p>
        </motion.div>

        {/* Tarjetas de estadísticas principales */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
        >
          <StatsCard
            title="Vacas en Ordeño"
            value={milkStats.totalMilkingCows}
            icon={<Users className="h-8 w-8" />}
            trend="up"
            trendValue={2.1}
            description="Vacas en lactancia activa"
            color="text-[#6366f1]"
          />
          
          <StatsCard
            title="Producción Diaria"
            value={formatLiters(milkStats.dailyProduction)}
            icon={<Droplets className="h-8 w-8" />}
            trend="up"
            trendValue={5.8}
            description="Litros producidos hoy"
            color="text-[#06b6d4]"
          />
          
          <StatsCard
            title="Promedio por Vaca"
            value={`${milkStats.averagePerCow} L`}
            icon={<BarChart3 className="h-8 w-8" />}
            trend="up"
            trendValue={3.2}
            description="Litros por vaca por día"
            color="text-[#10b981]"
          />
          
          <StatsCard
            title="Grado de Calidad"
            value={milkStats.qualityGrade}
            icon={<Award className="h-8 w-8" />}
            trend="stable"
            trendValue={0}
            description="Clasificación de calidad actual"
            color="text-[#f59e0b]"
          />
          
          <StatsCard
            title="Contenido Graso"
            value={`${milkStats.fatContent}%`}
            icon={<TestTube className="h-8 w-8" />}
            trend="up"
            trendValue={1.2}
            description="Porcentaje promedio de grasa"
            color="text-[#8b5cf6]"
          />
          
          <StatsCard
            title="Contenido Proteico"
            value={`${milkStats.proteinContent}%`}
            icon={<Zap className="h-8 w-8" />}
            trend="up"
            trendValue={0.8}
            description="Porcentaje promedio de proteína"
            color="text-[#ef4444]"
          />
        </motion.div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de producción diaria */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <Activity className="h-5 w-5 text-[#519a7c]" />
                  Producción Diaria Últimos 7 Días
                </CardTitle>
                <CardDescription>
                  Litros producidos por sesión de ordeño
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={dailyProductionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="date" 
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
                    <Area
                      type="monotone"
                      dataKey="morning"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Ordeño Matutino"
                    />
                    <Area
                      type="monotone"
                      dataKey="afternoon"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Ordeño Vespertino"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráfico de calidad */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <TestTube className="h-5 w-5 text-[#519a7c]" />
                  Distribución de Calidad de Leche
                </CardTitle>
                <CardDescription>
                  Clasificación según análisis de calidad
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={qualityDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry: any) => `${entry.name}: ${entry.value}%`}
                      labelLine={false}
                    >
                      {qualityDistribution.map((entry, index) => (
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

        {/* Sesiones de ordeño del día */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Clock className="h-5 w-5 text-[#519a7c]" />
                Sesiones de Ordeño del Día
              </CardTitle>
              <CardDescription>
                Resumen de ordeños matutino y vespertino
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {milkingSessions.map((session) => (
                  <div key={session.id} className="p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                        {session.session === 'morning' ? (
                          <>
                            <Clock className="h-4 w-4 text-blue-500" />
                            Ordeño Matutino
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 text-orange-500" />
                            Ordeño Vespertino
                          </>
                        )}
                      </h4>
                      <Badge variant={session.quality >= 97 ? 'excellent' : session.quality >= 95 ? 'success' : 'warning'}>
                        {session.quality}% Calidad
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Horario</p>
                        <p className="font-medium">{session.startTime} - {session.endTime}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Vacas Ordeñadas</p>
                        <p className="font-medium">{session.cowsMillked}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Producido</p>
                        <p className="font-medium">{formatLiters(session.totalLiters)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tiempo Promedio</p>
                        <p className="font-medium">{session.averageTime} min/vaca</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabla de registros de vacas lecheras */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Droplets className="h-5 w-5 text-[#06b6d4]" />
                    Registro Individual de Producción
                  </CardTitle>
                  <CardDescription>
                    Seguimiento detallado por vaca lechera
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Registro
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
                    <option value="active">Activas</option>
                    <option value="fresh">Recién Paridas</option>
                    <option value="dry">Secas</option>
                    <option value="sick">Enfermas</option>
                  </select>
                </div>
              </div>

              {/* Tabla de registros */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Vaca</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Producción Diaria</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Ordeños</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Calidad</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Composición</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Células Somáticas</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Estado</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Días en Leche</th>
                      <th className="text-center p-3 text-sm font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((record, index) => {
                      const somaticStatus = getSomaticCellsStatus(record.somaticCells);
                      return (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-3">
                            <div className="font-medium text-gray-900">{record.name}</div>
                            <div className="text-sm text-gray-500">{record.breed} • Lactancia #{record.lactationNumber}</div>
                          </td>
                          <td className="p-3">
                            <div className="font-medium text-gray-800">{formatLiters(record.dailyProduction)}</div>
                            <div className="text-xs text-gray-500">Último: {formatTime(record.lastMilking)}</div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm space-y-1">
                              <div>🌅 {formatLiters(record.morningMilk)}</div>
                              <div>🌆 {formatLiters(record.afternoonMilk)}</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={getQualityColor(record.quality) as any}>
                              {getQualityText(record.quality)}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div>Grasa: {record.fatPercentage}%</div>
                              <div>Proteína: {record.proteinPercentage}%</div>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-sm">
                              <div className="font-medium">{formatNumber(record.somaticCells)}</div>
                              <Badge variant={somaticStatus.color as any} className="text-xs">
                                {somaticStatus.status}
                              </Badge>
                            </div>
                          </td>
                          <td className="p-3">
                            <Badge variant={getStatusColor(record.status) as any}>
                              {getStatusText(record.status)}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <div className="text-sm font-medium text-gray-800">
                              {record.daysInMilk} días
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedCow(record)}
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
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredRecords.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Droplets className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No se encontraron vacas con los filtros aplicados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Alertas y notificaciones */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <AlertTriangle className="h-5 w-5 text-[#f4ac3a]" />
                Alertas de Producción Lechera
              </CardTitle>
              <CardDescription>
                Notificaciones importantes y recomendaciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-red-50 rounded-lg border-l-4 border-red-400">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-red-900">Células Somáticas Altas</h4>
                    <Badge variant="outline" className="bg-red-100 text-red-800">
                      3 vacas
                    </Badge>
                  </div>
                  <p className="text-sm text-red-700">
                    Vacas con conteo elevado que requieren atención veterinaria
                  </p>
                </div>

                <div className="p-4 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-yellow-900">Próximas a Secar</h4>
                    <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                      8 vacas
                    </Badge>
                  </div>
                  <p className="text-sm text-yellow-700">
                    Vacas con más de 300 días en lactancia para considerar secado
                  </p>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">Análisis de Calidad</h4>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      Programado
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">
                    Análisis de laboratorio programado para mañana a las 08:00
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

export default MilkProduction;