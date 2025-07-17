import React, { useState, useEffect } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  Droplets, 
  Beef, 
  Heart,
  ChevronRight,
  Home,
  ArrowLeft,
  TrendingUp,
  Activity,
  Target,
  Calendar,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

// Importar los componentes del módulo production
import ProductionDashboard from './ProductionDashboard';
import MilkProduction from './MilkProduction';
import MeatProduction from './MeatProduction';
import BreedingProduction from './BreedingProduction';

// Componentes UI básicos
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
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
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
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100'
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
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Definir tipos para la navegación
type ProductionSection = 'dashboard' | 'milk' | 'meat' | 'breeding' | 'overview';

interface NavigationItem {
  id: ProductionSection;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  stats?: {
    value: string;
    label: string;
    trend?: 'up' | 'down' | 'stable';
  };
}

interface QuickStat {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
}

const ProductionPage: React.FC = () => {
  // Estado para controlar la sección actual
  const [currentSection, setCurrentSection] = useState<ProductionSection>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Datos de navegación para las diferentes secciones
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      title: 'Dashboard General',
      description: 'Vista integral de toda la producción',
      icon: <BarChart3 className="h-8 w-8" />,
      color: 'text-[#519a7c]',
      stats: {
        value: '1,247',
        label: 'Total Ganado',
        trend: 'up'
      }
    },
    {
      id: 'milk',
      title: 'Producción Lechera',
      description: 'Gestión de ordeño y calidad láctea',
      icon: <Droplets className="h-8 w-8" />,
      color: 'text-[#06b6d4]',
      stats: {
        value: '4,250 L',
        label: 'Producción Diaria',
        trend: 'up'
      }
    },
    {
      id: 'meat',
      title: 'Producción Cárnica',
      description: 'Engorde y comercialización bovina',
      icon: <Beef className="h-8 w-8" />,
      color: 'text-[#dc2626]',
      stats: {
        value: '2,850 kg',
        label: 'Producción Mensual',
        trend: 'up'
      }
    },
    {
      id: 'breeding',
      title: 'Producción de Cría',
      description: 'Reproducción y genética bovina',
      icon: <Heart className="h-8 w-8" />,
      color: 'text-[#e91e63]',
      stats: {
        value: '89',
        label: 'Crías este Año',
        trend: 'stable'
      }
    }
  ];

  // Estadísticas rápidas para la vista general
  const quickStats: QuickStat[] = [
    {
      label: 'Producción Total Hoy',
      value: '4,250 L',
      icon: <Droplets className="h-6 w-6" />,
      color: 'text-blue-600',
      change: '+5.8%',
      trend: 'up'
    },
    {
      label: 'Animales Listos',
      value: '32',
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'text-green-600',
      change: '+12.3%',
      trend: 'up'
    },
    {
      label: 'Vacas Preñadas',
      value: '89',
      icon: <Heart className="h-6 w-6" />,
      color: 'text-pink-600',
      change: '+2.1%',
      trend: 'up'
    },
    {
      label: 'Eficiencia Global',
      value: '94.5%',
      icon: <Target className="h-6 w-6" />,
      color: 'text-purple-600',
      change: '+1.2%',
      trend: 'up'
    }
  ];

  // Efecto para simular carga
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Animaciones de Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.1
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

  // Función para renderizar el breadcrumb
  const renderBreadcrumb = () => {
    const currentItem = navigationItems.find(item => item.id === currentSection);
    
    return (
      <motion.div 
        className="flex items-center gap-2 text-white/90 mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => setCurrentSection('overview')}
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Producción</span>
        </button>
        
        {currentSection !== 'overview' && (
          <>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white font-medium">
              {currentItem?.title}
            </span>
          </>
        )}
      </motion.div>
    );
  };

  // Función para renderizar la vista general
  const renderOverview = () => (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header de bienvenida */}
      <motion.div variants={itemVariants} className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white drop-shadow-lg mb-2">
          Centro de Producción
        </h1>
        <p className="text-white/90 text-lg">
          Gestión integral de todos los aspectos productivos del rancho
        </p>
      </motion.div>

      {/* Estadísticas rápidas */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <Activity className="h-5 w-5 text-[#519a7c]" />
              Resumen del Día
            </CardTitle>
            <CardDescription>
              Métricas clave de producción actualizadas en tiempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickStats.map((stat, statIndex) => (
                <motion.div
                  key={statIndex}
                  className="p-4 bg-gray-50 rounded-lg border"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`${stat.color}`}>
                      {stat.icon}
                    </div>
                    <Badge variant={stat.trend === 'up' ? 'success' : stat.trend === 'down' ? 'error' : 'default'}>
                      {stat.change}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tarjetas de navegación principales */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={containerVariants}
      >
        {navigationItems.map((item) => (
          <motion.div
            key={item.id}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            className="cursor-pointer"
            onClick={() => setCurrentSection(item.id)}
          >
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl transition-all duration-300 group">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gray-50 group-hover:bg-gray-100 transition-colors ${item.color}`}>
                      {item.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg text-gray-800 group-hover:text-[#519a7c] transition-colors">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {item.description}
                      </CardDescription>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#519a7c] transition-colors" />
                </div>
              </CardHeader>
              
              {item.stats && (
                <CardContent>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600">{item.stats.label}</p>
                      <p className="text-xl font-bold text-gray-800">{item.stats.value}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {item.stats.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : item.stats.trend === 'down' ? (
                        <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                      ) : (
                        <Activity className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Alertas y notificaciones importantes */}
      <motion.div variants={itemVariants}>
        <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <AlertTriangle className="h-5 w-5 text-[#f4ac3a]" />
              Alertas de Producción
            </CardTitle>
            <CardDescription>
              Notificaciones importantes que requieren atención
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Meta de producción lechera alcanzada</p>
                    <p className="text-sm text-green-700">Se superó el objetivo diario en un 8.5%</p>
                  </div>
                </div>
                <Badge variant="success">Completado</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-400">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-900">Pesajes programados</p>
                    <p className="text-sm text-yellow-700">23 animales requieren pesaje esta semana</p>
                  </div>
                </div>
                <Badge variant="warning">Pendiente</Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <div className="flex items-center gap-3">
                  <Heart className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Diagnósticos de gestación</p>
                    <p className="text-sm text-blue-700">7 vacas pendientes de confirmación de preñez</p>
                  </div>
                </div>
                <Badge variant="info">Programado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // Función para renderizar el contenido según la sección
  const renderSectionContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <ProductionDashboard />;
      case 'milk':
        return <MilkProduction />;
      case 'meat':
        return <MeatProduction />;
      case 'breeding':
        return <BreedingProduction />;
      case 'overview':
      default:
        return renderOverview();
    }
  };

  // Componente de Loading
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
        />
        <p className="text-white text-lg font-semibold">Cargando Centro de Producción...</p>
      </div>
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <div className="max-w-7xl mx-auto p-6">
        {/* Breadcrumb y navegación */}
        {renderBreadcrumb()}
        
        {/* Botón de regreso cuando no está en overview */}
        {currentSection !== 'overview' && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button
              variant="ghost"
              onClick={() => setCurrentSection('overview')}
              className="text-white hover:bg-white/10 border border-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Centro de Producción
            </Button>
          </motion.div>
        )}

        {/* Contenido principal con transiciones */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
          >
            {renderSectionContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProductionPage;