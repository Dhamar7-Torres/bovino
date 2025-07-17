import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  PieChart,
  Beef,
  Milk,
  Target,
  Award,
  Scale,
  Heart,
  Zap,
  CheckCircle,
  RefreshCw,
  Eye,
  Plus,
  ChevronRight,
  Calculator,
  LineChart,
  TrendingUpIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Componentes UI básicos
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "outline" | "destructive";
  size?: "default" | "sm" | "lg";
}> = ({ children, onClick, disabled, className = "", variant = "default", size = "default" }) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:opacity-50 disabled:pointer-events-none";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    outline: "border border-gray-300 bg-white hover:bg-gray-50",
    destructive: "bg-red-600 text-white hover:bg-red-700"
  }[variant];
  const sizeClasses = {
    sm: "h-8 px-3 text-sm",
    default: "h-10 px-4 py-2",
    lg: "h-12 px-6 text-lg"
  }[size];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </button>
  );
};

const Card: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
  onClick?: () => void;
}> = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`rounded-lg border bg-white shadow-sm ${onClick ? 'cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex flex-col space-y-1.5 p-6">{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`}>{children}</h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-600">{children}</p>
);

const CardContent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="p-6 pt-0">{children}</div>
);

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>
    {children}
  </span>
);

// Funciones helper del layout
const getMainBackgroundClasses = () => "bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]";
const CSS_CLASSES = {
  titlePrimary: "text-4xl font-bold text-white drop-shadow-sm",
  card: "bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20",
  cardHover: "hover:shadow-xl hover:scale-105 transition-all duration-300",
  buttonPrimary: "bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200"
};

// Interfaces para los datos de producción
interface ProductionMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  target?: string;
  critical?: boolean;
}

interface ProductionRecord {
  id: string;
  animalId: string;
  animalTag: string;
  type: "milk" | "weight" | "breeding" | "feed_efficiency";
  value: number;
  unit: string;
  date: Date;
  location: {
    sector: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  measuredBy: string;
  notes?: string;
  quality?: "excellent" | "good" | "average" | "poor";
}

interface AnimalProductivity {
  id: string;
  animalTag: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  category: "dairy" | "beef" | "breeding";
  productivity: {
    milkPerDay?: number;
    weightGain?: number;
    feedConversion?: number;
    reproductiveEfficiency?: number;
  };
  location: {
    currentSector: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  lastUpdate: Date;
  status: "active" | "dry" | "pregnant" | "sick" | "sold";
  performance: "excellent" | "good" | "average" | "poor";
}

interface ProductionAlert {
  id: string;
  type: "low_production" | "weight_loss" | "feed_efficiency" | "breeding_issue";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  animalIds: string[];
  affectedMetric: string;
  threshold: number;
  currentValue: number;
  location: {
    sector: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  createdAt: Date;
  resolvedAt?: Date;
  status: "active" | "resolved" | "dismissed";
}

interface BreedingRecord {
  id: string;
  femaleId: string;
  femaleTag: string;
  maleId?: string;
  maleTag?: string;
  breedingDate: Date;
  expectedCalvingDate: Date;
  actualCalvingDate?: Date;
  breedingMethod: "natural" | "artificial";
  success: boolean;
  location: {
    sector: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  veterinarian: string;
  notes?: string;
}

// Datos de ejemplo (fuera del componente para evitar recreación)
const sampleProductionRecords: ProductionRecord[] = [
  {
    id: "prod-001",
    animalId: "cattle-001",
    animalTag: "L-1247",
    type: "milk",
    value: 28.5,
    unit: "litros",
    date: new Date(2025, 5, 16),
    location: {
      sector: "Sector de Ordeño A",
      coordinates: {
        lat: 14.6349,
        lng: -90.5069
      }
    },
    measuredBy: "Juan Pérez - Ordeñador",
    quality: "excellent",
    notes: "Producción excepcional para la época"
  },
  {
    id: "prod-002",
    animalId: "cattle-002",
    animalTag: "C-1248",
    type: "weight",
    value: 485,
    unit: "kg",
    date: new Date(2025, 5, 15),
    location: {
      sector: "Potrero Principal",
      coordinates: {
        lat: 14.6355,
        lng: -90.5075
      }
    },
    measuredBy: "Dr. Carlos Mendoza",
    quality: "good",
    notes: "Ganancia de peso satisfactoria"
  }
];

const sampleAnimalProductivity: AnimalProductivity[] = [
  {
    id: "anim-001",
    animalTag: "L-1247",
    breed: "Holstein",
    age: 4,
    gender: "female",
    category: "dairy",
    productivity: {
      milkPerDay: 28.5,
      feedConversion: 1.8,
      reproductiveEfficiency: 92
    },
    location: {
      currentSector: "Sector de Ordeño A",
      coordinates: {
        lat: 14.6349,
        lng: -90.5069
      }
    },
    lastUpdate: new Date(2025, 5, 16),
    status: "active",
    performance: "excellent"
  },
  {
    id: "anim-002",
    animalTag: "C-1248",
    breed: "Angus",
    age: 2,
    gender: "male",
    category: "beef",
    productivity: {
      weightGain: 1.2,
      feedConversion: 2.1
    },
    location: {
      currentSector: "Potrero Principal",
      coordinates: {
        lat: 14.6355,
        lng: -90.5075
      }
    },
    lastUpdate: new Date(2025, 5, 15),
    status: "active",
    performance: "good"
  }
];

const sampleProductionAlerts: ProductionAlert[] = [
  {
    id: "alert-001",
    type: "low_production",
    priority: "high",
    title: "Baja Producción Lechera",
    description: "3 vacas con producción por debajo del promedio en los últimos 7 días",
    animalIds: ["cattle-003", "cattle-004", "cattle-005"],
    affectedMetric: "Producción de leche",
    threshold: 25.0,
    currentValue: 18.2,
    location: {
      sector: "Sector de Ordeño B",
      coordinates: {
        lat: 14.6340,
        lng: -90.5080
      }
    },
    createdAt: new Date(2025, 5, 14),
    status: "active"
  },
  {
    id: "alert-002",
    type: "feed_efficiency",
    priority: "medium",
    title: "Eficiencia Alimentaria Baja",
    description: "Conversión alimenticia por encima del objetivo en el Sector Norte",
    animalIds: ["cattle-006", "cattle-007"],
    affectedMetric: "Conversión alimenticia",
    threshold: 2.0,
    currentValue: 2.8,
    location: {
      sector: "Sector Norte",
      coordinates: {
        lat: 14.6350,
        lng: -90.5065
      }
    },
    createdAt: new Date(2025, 5, 15),
    status: "active"
  }
];

const sampleBreedingRecords: BreedingRecord[] = [
  {
    id: "breed-001",
    femaleId: "cattle-008",
    femaleTag: "R-1249",
    maleId: "cattle-009",
    maleTag: "T-1250",
    breedingDate: new Date(2025, 2, 15),
    expectedCalvingDate: new Date(2025, 11, 22),
    breedingMethod: "natural",
    success: true,
    location: {
      sector: "Potrero de Reproducción",
      coordinates: {
        lat: 14.6360,
        lng: -90.5055
      }
    },
    veterinarian: "Dr. Ana Rodríguez",
    notes: "Monta confirmada, gestación en progreso"
  }
];

const ProductionReports: React.FC = () => {
  const navigate = useNavigate();

  // Estados del componente
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
  const [animalProductivity, setAnimalProductivity] = useState<AnimalProductivity[]>([]);
  const [productionAlerts, setProductionAlerts] = useState<ProductionAlert[]>([]);
  const [, setBreedingRecords] = useState<BreedingRecord[]>([]);

  // Métricas de producción
  const productionMetrics: ProductionMetric[] = [
    {
      id: "milk-production",
      title: "Producción Lechera",
      value: "24.8 L",
      change: 5.2,
      trend: "up",
      icon: Milk,
      color: "text-blue-600",
      description: "Promedio diario por vaca",
      target: "25.0 L"
    },
    {
      id: "weight-gain",
      title: "Ganancia de Peso",
      value: "1.15 kg",
      change: 8.3,
      trend: "up",
      icon: Scale,
      color: "text-green-600",
      description: "Promedio diario del hato",
      target: "1.2 kg"
    },
    {
      id: "feed-conversion",
      title: "Conversión Alimenticia",
      value: "2.1:1",
      change: -3.8,
      trend: "down",
      icon: Calculator,
      color: "text-purple-600",
      description: "Ratio alimento/ganancia",
      target: "2.0:1"
    },
    {
      id: "reproductive-rate",
      title: "Tasa Reproductiva",
      value: "89.2%",
      change: 2.1,
      trend: "up",
      icon: Heart,
      color: "text-pink-600",
      description: "Éxito en servicios",
      target: "90.0%"
    },
    {
      id: "mortality-rate",
      title: "Tasa de Mortalidad",
      value: "0.6%",
      change: -25.0,
      trend: "down",
      icon: Activity,
      color: "text-red-600",
      description: "Mortalidad mensual",
      target: "< 1.0%"
    },
    {
      id: "efficiency-index",
      title: "Índice de Eficiencia",
      value: "87.4",
      change: 4.7,
      trend: "up",
      icon: Target,
      color: "text-indigo-600",
      description: "Índice compuesto de productividad",
      target: "90.0"
    }
  ];

  // Efectos y funciones
  useEffect(() => {
    // Inicializar con datos de ejemplo
    setProductionRecords(sampleProductionRecords);
    setAnimalProductivity(sampleAnimalProductivity);
    setProductionAlerts(sampleProductionAlerts);
    setBreedingRecords(sampleBreedingRecords);
  }, []);

  const handleRefreshData = () => {
    setIsLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };


  const getPerformanceBadgeColor = (performance: string) => {
    switch (performance) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "average":
        return "bg-yellow-100 text-yellow-800";
      case "poor":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "dairy":
        return <Milk className="w-4 h-4 text-blue-500" />;
      case "beef":
        return <Beef className="w-4 h-4 text-red-500" />;
      case "breeding":
        return <Heart className="w-4 h-4 text-pink-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className={`min-h-screen ${getMainBackgroundClasses()}`}>
      {/* Contenedor principal */}
      <div className="p-6 space-y-6">
        
        {/* Header del módulo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className={`${CSS_CLASSES.titlePrimary} mb-2`}>
              Reportes de Producción y Rendimiento
            </h1>
            <p className="text-white/90 text-lg">
              Análisis integral de productividad, crecimiento y eficiencia del hato ganadero
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={handleRefreshData}
              disabled={isLoading}
              className={`${CSS_CLASSES.buttonPrimary} shadow-lg`}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            
            <Button 
              onClick={() => navigate('/production/record/add')}
              className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm shadow-lg border border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Registro
            </Button>
            
            <Button 
              onClick={() => navigate('/production/analysis')}
              className="bg-purple-500/80 text-white hover:bg-purple-500/90 backdrop-blur-sm shadow-lg"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Análisis Avanzado
            </Button>
          </div>
        </motion.div>

        {/* Métricas de producción */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          {productionMetrics.map((metric, index) => (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`${CSS_CLASSES.card} p-4 ${CSS_CLASSES.cardHover} ${
                metric.critical ? 'ring-2 ring-red-400 ring-opacity-50' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gray-50`}>
                  <metric.icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                <div className={`flex items-center text-xs ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  ) : metric.trend === 'down' ? (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  ) : (
                    <Activity className="w-3 h-3 mr-1" />
                  )}
                  {metric.change > 0 ? '+' : ''}{metric.change}%
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {metric.value}
                </h3>
                <p className="text-gray-600 font-medium text-sm mb-1">
                  {metric.title}
                </p>
                <p className="text-xs text-gray-500 mb-1">
                  {metric.description}
                </p>
                {metric.target && (
                  <p className="text-xs text-blue-600 font-medium">
                    Meta: {metric.target}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Sistema de pestañas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="space-y-6">
            {/* Navegación de pestañas */}
            <div className="bg-white/20 backdrop-blur-sm p-1 rounded-lg flex flex-wrap gap-1">
              {[
                { id: "overview", label: "Vista General", icon: BarChart3 },
                { id: "milk", label: "Producción Lechera", icon: Milk },
                { id: "weight", label: "Ganancia de Peso", icon: Scale },
                { id: "breeding", label: "Reproducción", icon: Heart },
                { id: "efficiency", label: "Eficiencia", icon: Target },
                { id: "analytics", label: "Análisis", icon: PieChart }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    selectedTab === tab.id
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Contenido de las pestañas */}
            <div>
              {selectedTab === "overview" && (
                <div className="space-y-6">
                  {/* Resumen general de producción */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Animales de alto rendimiento */}
                    <Card className={`${CSS_CLASSES.card}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-600" />
                          Animales de Alto Rendimiento
                        </CardTitle>
                        <CardDescription>
                          Top performers del hato por categoría
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {animalProductivity.filter(animal => animal.performance === 'excellent').map((animal) => (
                            <div key={animal.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getCategoryIcon(animal.category)}
                                  <span className="font-medium text-gray-900">
                                    {animal.animalTag} - {animal.breed}
                                  </span>
                                  <Badge className={getPerformanceBadgeColor(animal.performance)}>
                                    Excelente
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-600 space-y-1">
                                  {animal.productivity.milkPerDay && (
                                    <p>Leche: {animal.productivity.milkPerDay} L/día</p>
                                  )}
                                  {animal.productivity.weightGain && (
                                    <p>Ganancia: {animal.productivity.weightGain} kg/día</p>
                                  )}
                                  {animal.productivity.feedConversion && (
                                    <p>Conversión: {animal.productivity.feedConversion}:1</p>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  {animal.location.currentSector}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Button 
                            onClick={() => setSelectedTab("efficiency")}
                            variant="outline" 
                            className="w-full"
                          >
                            Ver Análisis de Eficiencia
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Registros de producción recientes */}
                    <Card className={`${CSS_CLASSES.card}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <LineChart className="w-5 h-5 text-green-600" />
                          Registros Recientes
                        </CardTitle>
                        <CardDescription>
                          Últimas mediciones de producción registradas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {productionRecords.slice(0, 5).map((record) => (
                            <div key={record.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {record.type === 'milk' ? <Milk className="w-4 h-4 text-blue-500" /> :
                                   record.type === 'weight' ? <Scale className="w-4 h-4 text-green-500" /> :
                                   record.type === 'breeding' ? <Heart className="w-4 h-4 text-pink-500" /> :
                                   <Calculator className="w-4 h-4 text-purple-500" />}
                                  <span className="font-medium text-gray-900">
                                    {record.animalTag}
                                  </span>
                                  {record.quality && (
                                    <Badge className={
                                      record.quality === 'excellent' ? 'bg-green-100 text-green-800' :
                                      record.quality === 'good' ? 'bg-blue-100 text-blue-800' :
                                      record.quality === 'average' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-red-100 text-red-800'
                                    }>
                                      {record.quality === 'excellent' ? 'Excelente' :
                                       record.quality === 'good' ? 'Bueno' :
                                       record.quality === 'average' ? 'Promedio' : 'Pobre'}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {record.type === 'milk' ? 'Producción' :
                                   record.type === 'weight' ? 'Peso' :
                                   record.type === 'breeding' ? 'Reproducción' : 'Eficiencia'}: 
                                  {' '}{record.value} {record.unit}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {record.date.toLocaleDateString()} - {record.location.sector}
                                </p>
                              </div>
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4">
                          <Button 
                            variant="outline" 
                            className="w-full"
                          >
                            Ver Todos los Registros
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Alertas de producción activas */}
                  <Card className={`${CSS_CLASSES.card}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        Alertas de Producción Activas
                      </CardTitle>
                      <CardDescription>
                        Notificaciones sobre rendimiento y eficiencia
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {productionAlerts.filter(alert => alert.status === 'active').map((alert) => (
                          <div key={alert.id} className="flex items-start justify-between p-4 border border-gray-200 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={getPriorityColor(alert.priority)}>
                                  {alert.priority === 'low' ? 'Baja' :
                                   alert.priority === 'medium' ? 'Media' :
                                   alert.priority === 'high' ? 'Alta' : 'Crítica'}
                                </Badge>
                                <span className="font-medium text-gray-900">
                                  {alert.title}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">
                                {alert.description}
                              </p>
                              <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                                <div>
                                  <span className="font-medium">Umbral:</span> {alert.threshold}
                                </div>
                                <div>
                                  <span className="font-medium">Actual:</span> {alert.currentValue}
                                </div>
                                <div>
                                  <span className="font-medium">Animales:</span> {alert.animalIds.length}
                                </div>
                                <div>
                                  <span className="font-medium">Ubicación:</span> {alert.location.sector}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedTab === "milk" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Milk className="w-5 h-5 text-blue-600" />
                      Análisis de Producción Lechera
                    </CardTitle>
                    <CardDescription>
                      Seguimiento detallado de producción láctea por animal y sector
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-medium text-blue-900 mb-2">Producción Diaria</h4>
                          <p className="text-2xl font-bold text-blue-600">1,892 L</p>
                          <p className="text-sm text-blue-600">+5.2% vs ayer</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h4 className="font-medium text-green-900 mb-2">Promedio por Vaca</h4>
                          <p className="text-2xl font-bold text-green-600">24.8 L</p>
                          <p className="text-sm text-green-600">Meta: 25.0 L</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-medium text-purple-900 mb-2">Calidad Promedio</h4>
                          <p className="text-2xl font-bold text-purple-600">A+</p>
                          <p className="text-sm text-purple-600">Excelente</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Distribución por Sector</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Ordeño A</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                              </div>
                              <span className="text-sm font-medium">856 L</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Ordeño B</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                              </div>
                              <span className="text-sm font-medium">642 L</span>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Ordeño C</span>
                            <div className="flex items-center gap-2">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                              </div>
                              <span className="text-sm font-medium">394 L</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "weight" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-green-600" />
                      Control de Ganancia de Peso
                    </CardTitle>
                    <CardDescription>
                      Monitoreo de crecimiento y desarrollo del ganado
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Módulo de control de peso con gráficas de crecimiento, comparativas por edad y raza...
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "breeding" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="w-5 h-5 text-pink-600" />
                      Rendimiento Reproductivo
                    </CardTitle>
                    <CardDescription>
                      Análisis de eficiencia reproductiva y genealogía
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Módulo reproductivo con seguimiento de gestaciones, tasas de concepción y genealogía...
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "efficiency" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-indigo-600" />
                      Análisis de Eficiencia
                    </CardTitle>
                    <CardDescription>
                      Índices de productividad y optimización del hato
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Módulo de eficiencia con KPIs, benchmarking y recomendaciones de mejora...
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "analytics" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-purple-600" />
                      Análisis y Proyecciones
                    </CardTitle>
                    <CardDescription>
                      Reportes avanzados y predicciones de producción
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Proyección Anual</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Producción Leche</span>
                              <span className="text-sm font-medium">690,180 L</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Ganancia de Peso</span>
                              <span className="text-sm font-medium">125,400 kg</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Nuevos Nacimientos</span>
                              <span className="text-sm font-medium">89 animales</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Eficiencia vs Objetivo</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Producción Lechera</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '99.2%' }}></div>
                                </div>
                                <span className="text-sm font-medium">99.2%</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Ganancia de Peso</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '95.8%' }}></div>
                                </div>
                                <span className="text-sm font-medium">95.8%</span>
                              </div>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Reproducción</span>
                              <div className="flex items-center gap-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div className="bg-pink-500 h-2 rounded-full" style={{ width: '89.2%' }}></div>
                                </div>
                                <span className="text-sm font-medium">89.2%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Recomendaciones de IA</h4>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <TrendingUpIcon className="w-4 h-4 text-green-500 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              Incrementar concentrado en Sector B para mejorar producción lechera
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Target className="w-4 h-4 text-blue-500 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              Optimizar horarios de ordeño para maximizar eficiencia
                            </span>
                          </div>
                          <div className="flex items-start gap-2">
                            <Heart className="w-4 h-4 text-pink-500 mt-0.5" />
                            <span className="text-sm text-gray-700">
                              Revisar protocolo reproductivo en vacas de baja eficiencia
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductionReports;