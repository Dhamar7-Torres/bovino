import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Heart, 
  Calendar, 
  Users,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  BarChart3,
  PieChart,
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
  variant?: 'default' | 'success' | 'warning' | 'error' | 'outline';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    outline: 'border border-gray-200 text-gray-900'
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Interfaces para tipado de datos
interface BreedingStats {
  totalBreeders: number;
  pregnantCows: number;
  expectedBirths: number;
  successRate: number;
  monthlyBirths: number;
  activeInseminations: number;
}

interface BreedingRecord {
  id: string;
  cowId: string;
  cowName: string;
  bullName: string;
  breedingDate: string;
  expectedDate: string;
  status: 'pregnant' | 'open' | 'calved' | 'failed';
  location: string;
  gestationDays: number;
  notes?: string;
}

interface MonthlyBreedingData {
  month: string;
  inseminations: number;
  pregnancies: number;
  births: number;
  successRate: number;
}

interface BreedingDistribution {
  name: string;
  value: number;
  color: string;
}

const BreedingProduction: React.FC = () => {
  // Estados para controlar la carga y datos
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [, setSelectedRecord] = useState<BreedingRecord | null>(null);
  const [, setShowAddModal] = useState<boolean>(false);

  // Estados para datos
  const [breedingStats, setBreedingStats] = useState<BreedingStats>({
    totalBreeders: 0,
    pregnantCows: 0,
    expectedBirths: 0,
    successRate: 0,
    monthlyBirths: 0,
    activeInseminations: 0
  });

  // Datos simulados para estadísticas de reproducción
  const mockBreedingStats: BreedingStats = {
    totalBreeders: 320,
    pregnantCows: 89,
    expectedBirths: 45,
    successRate: 78.5,
    monthlyBirths: 28,
    activeInseminations: 15
  };

  // Datos para gráfico de líneas - tendencia de reproducción
  const monthlyBreedingData: MonthlyBreedingData[] = [
    { month: 'Ene', inseminations: 45, pregnancies: 35, births: 32, successRate: 77.8 },
    { month: 'Feb', inseminations: 52, pregnancies: 41, births: 29, successRate: 78.8 },
    { month: 'Mar', inseminations: 48, pregnancies: 38, births: 35, successRate: 79.2 },
    { month: 'Abr', inseminations: 55, pregnancies: 43, births: 28, successRate: 78.2 },
    { month: 'May', inseminations: 50, pregnancies: 39, births: 31, successRate: 78.0 },
    { month: 'Jun', inseminations: 47, pregnancies: 37, births: 33, successRate: 78.7 }
  ];

  // Datos para gráfico de torta - distribución de estados reproductivos
  const breedingDistribution: BreedingDistribution[] = [
    { name: 'Preñadas', value: 35, color: '#22c55e' },
    { name: 'Vacías', value: 45, color: '#f59e0b' },
    { name: 'Recién Paridas', value: 15, color: '#3b82f6' },
    { name: 'En Servicio', value: 5, color: '#8b5cf6' }
  ];

  // Datos simulados de registros de reproducción
  const breedingRecords: BreedingRecord[] = [
    {
      id: '1',
      cowId: 'COW-001',
      cowName: 'Margarita',
      bullName: 'Toro Campeón',
      breedingDate: '2024-12-15',
      expectedDate: '2025-09-22',
      status: 'pregnant',
      location: 'Potrero Norte A',
      gestationDays: 125,
      notes: 'Primera inseminación exitosa'
    },
    {
      id: '2',
      cowId: 'COW-045',
      cowName: 'Esperanza',
      bullName: 'Toro Real',
      breedingDate: '2024-11-28',
      expectedDate: '2025-09-05',
      status: 'pregnant',
      location: 'Potrero Sur B',
      gestationDays: 142,
      notes: 'Segundo servicio'
    },
    {
      id: '3',
      cowId: 'COW-023',
      cowName: 'Paloma',
      bullName: 'Toro Estrella',
      breedingDate: '2024-10-10',
      expectedDate: '2025-07-17',
      status: 'pregnant',
      location: 'Potrero Central',
      gestationDays: 180,
      notes: 'Excelente desarrollo'
    },
    {
      id: '4',
      cowId: 'COW-067',
      cowName: 'Rosa',
      bullName: 'Toro Campeón',
      breedingDate: '2024-12-20',
      expectedDate: '2025-09-27',
      status: 'open',
      location: 'Potrero Norte B',
      gestationDays: 0,
      notes: 'Pendiente diagnóstico'
    },
    {
      id: '5',
      cowId: 'COW-089',
      cowName: 'Violeta',
      bullName: 'Toro Real',
      breedingDate: '2024-06-15',
      expectedDate: '2025-03-22',
      status: 'calved',
      location: 'Maternidad',
      gestationDays: 280,
      notes: 'Parto exitoso, cría saludable'
    }
  ];

  // Efecto para simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setBreedingStats(mockBreedingStats);
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

  // Función para formatear fechas
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  };

  // Función para obtener color de estado
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'pregnant': return 'success';
      case 'open': return 'warning';
      case 'calved': return 'default';
      case 'failed': return 'error';
      default: return 'outline';
    }
  };

  // Función para obtener texto de estado
  const getStatusText = (status: string): string => {
    switch (status) {
      case 'pregnant': return 'Preñada';
      case 'open': return 'Vacía';
      case 'calved': return 'Parida';
      case 'failed': return 'Fallido';
      default: return 'Desconocido';
    }
  };

  // Filtrar registros basado en búsqueda y filtro
  const filteredRecords = breedingRecords.filter(record => {
    const matchesSearch = record.cowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.bullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
        <p className="text-white text-lg font-semibold">Cargando Producción de Cría...</p>
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
            Producción de Cría
          </h1>
          <p className="text-white/90 text-lg">
            Gestión integral de reproducción y genética bovina
          </p>
        </motion.div>

        {/* Tarjetas de estadísticas principales */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
          variants={containerVariants}
        >
          <StatsCard
            title="Total de Reproductores"
            value={breedingStats.totalBreeders}
            icon={<Users className="h-8 w-8" />}
            trend="up"
            trendValue={3.2}
            description="Hembras y machos en programa"
            color="text-[#519a7c]"
          />
          
          <StatsCard
            title="Vacas Preñadas"
            value={breedingStats.pregnantCows}
            icon={<Heart className="h-8 w-8" />}
            trend="up"
            trendValue={8.5}
            description="Gestaciones confirmadas"
            color="text-[#e91e63]"
          />
          
          <StatsCard
            title="Partos Esperados"
            value={breedingStats.expectedBirths}
            icon={<Calendar className="h-8 w-8" />}
            trend="stable"
            trendValue={2.1}
            description="Próximos 30 días"
            color="text-[#f4ac3a]"
          />
          
          <StatsCard
            title="Tasa de Éxito"
            value={`${breedingStats.successRate}%`}
            icon={<CheckCircle className="h-8 w-8" />}
            trend="up"
            trendValue={1.8}
            description="Fertilidad promedio"
            color="text-[#22c55e]"
          />
          
          <StatsCard
            title="Partos del Mes"
            value={breedingStats.monthlyBirths}
            icon={<Activity className="h-8 w-8" />}
            trend="up"
            trendValue={12.5}
            description="Crías nacidas este mes"
            color="text-[#3b82f6]"
          />
          
          <StatsCard
            title="Inseminaciones Activas"
            value={breedingStats.activeInseminations}
            icon={<Clock className="h-8 w-8" />}
            trend="down"
            trendValue={-5.2}
            description="En proceso de confirmación"
            color="text-[#8b5cf6]"
          />
        </motion.div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Gráfico de líneas - Tendencia reproductiva */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <BarChart3 className="h-5 w-5 text-[#519a7c]" />
                  Tendencia Reproductiva Mensual
                </CardTitle>
                <CardDescription>
                  Inseminaciones, embarazos y partos por mes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyBreedingData}>
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
                      dataKey="inseminations" 
                      stroke="#8b5cf6" 
                      strokeWidth={3}
                      name="Inseminaciones"
                      dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="pregnancies" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      name="Embarazos"
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="births" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Partos"
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Gráfico de torta - Distribución reproductiva */}
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-800">
                  <PieChart className="h-5 w-5 text-[#519a7c]" />
                  Estado Reproductivo del Hato
                </CardTitle>
                <CardDescription>
                  Distribución actual del estado reproductivo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      dataKey="value"
                      data={breedingDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry: any) => `${entry.name}: ${entry.value}%`}
                      labelLine={false}
                    >
                      {breedingDistribution.map((entry, index) => (
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

        {/* Sección de registros de reproducción */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2 text-gray-800">
                    <Heart className="h-5 w-5 text-[#e91e63]" />
                    Registros de Reproducción
                  </CardTitle>
                  <CardDescription>
                    Historial completo de servicios y gestaciones
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nuevo Servicio
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
                    placeholder="Buscar por vaca, toro o ubicación..."
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
                    <option value="pregnant">Preñadas</option>
                    <option value="open">Vacías</option>
                    <option value="calved">Paridas</option>
                    <option value="failed">Fallidos</option>
                  </select>
                </div>
              </div>

              {/* Tabla de registros */}
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Vaca</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Toro</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Fecha Servicio</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Fecha Esperada</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Estado</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Ubicación</th>
                      <th className="text-left p-3 text-sm font-medium text-gray-700">Gestación</th>
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
                          <div className="font-medium text-gray-900">{record.cowName}</div>
                          <div className="text-sm text-gray-500">{record.cowId}</div>
                        </td>
                        <td className="p-3 text-gray-700">{record.bullName}</td>
                        <td className="p-3 text-gray-700">{formatDate(record.breedingDate)}</td>
                        <td className="p-3 text-gray-700">
                          {record.status === 'pregnant' ? formatDate(record.expectedDate) : '-'}
                        </td>
                        <td className="p-3">
                          <Badge variant={getStatusColor(record.status) as any}>
                            {getStatusText(record.status)}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1 text-gray-700">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            {record.location}
                          </div>
                        </td>
                        <td className="p-3 text-gray-700">
                          {record.status === 'pregnant' ? `${record.gestationDays} días` : '-'}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedRecord(record)}
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
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No se encontraron registros con los filtros aplicados.</p>
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
                <AlertCircle className="h-5 w-5 text-[#f4ac3a]" />
                Próximas Actividades Reproductivas
              </CardTitle>
              <CardDescription>
                Eventos programados y recordatorios importantes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-900">Diagnósticos de Gestación</h4>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      7 pendientes
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700">
                    Confirmación de preñez entre 45-60 días post-servicio
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-900">Partos Próximos</h4>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      12 este mes
                    </Badge>
                  </div>
                  <p className="text-sm text-green-700">
                    Vacas con fecha probable de parto en los próximos 30 días
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-900">Servicios Programados</h4>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800">
                      5 esta semana
                    </Badge>
                  </div>
                  <p className="text-sm text-purple-700">
                    Inseminaciones artificiales y montas naturales programadas
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

export default BreedingProduction;