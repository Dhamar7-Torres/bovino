import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Syringe,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  BarChart3,
  PieChart,
  ChevronRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Thermometer,
  Shield,
  Zap,
  Navigation,
  Bell,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Componentes UI básicos (reemplazando ShadCN)
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

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
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

// Interfaces para los datos de salud
interface HealthMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: "up" | "down" | "stable";
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  critical?: boolean;
}

interface VaccinationRecord {
  id: string;
  animalId: string;
  animalTag: string;
  vaccineType: string;
  date: Date;
  nextDue?: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  veterinarian: string;
  status: "completed" | "pending" | "overdue";
  notes?: string;
}

interface DiseaseCase {
  id: string;
  animalId: string;
  animalTag: string;
  diseaseType: string;
  severity: "mild" | "moderate" | "severe" | "critical";
  diagnosisDate: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  symptoms: string[];
  treatment: string;
  status: "active" | "recovering" | "recovered" | "deceased";
  veterinarian: string;
}

interface HealthAlert {
  id: string;
  type: "vaccination_due" | "disease_outbreak" | "temperature_anomaly" | "behavior_change";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  animalIds: string[];
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  createdAt: Date;
  resolvedAt?: Date;
  status: "active" | "resolved" | "dismissed";
}

// Datos de ejemplo (fuera del componente para evitar recreación)
const sampleVaccinations: VaccinationRecord[] = [
  {
    id: "vac-001",
    animalId: "cattle-001",
    animalTag: "T-1247",
    vaccineType: "Fiebre Aftosa",
    date: new Date(2025, 5, 15),
    nextDue: new Date(2025, 11, 15),
    location: {
      lat: 14.6349,
      lng: -90.5069,
      address: "Sector Norte, Potrero 3"
    },
    veterinarian: "Dr. María González",
    status: "completed",
    notes: "Aplicación exitosa, sin reacciones adversas"
  },
  {
    id: "vac-002",
    animalId: "cattle-002",
    animalTag: "T-1248",
    vaccineType: "Brucelosis",
    date: new Date(2025, 5, 10),
    location: {
      lat: 14.6355,
      lng: -90.5075,
      address: "Sector Sur, Corral Principal"
    },
    veterinarian: "Dr. Carlos Mendoza",
    status: "pending"
  }
];

const sampleDiseases: DiseaseCase[] = [
  {
    id: "dis-001",
    animalId: "cattle-003",
    animalTag: "T-1249",
    diseaseType: "Mastitis",
    severity: "moderate",
    diagnosisDate: new Date(2025, 5, 12),
    location: {
      lat: 14.6340,
      lng: -90.5080,
      address: "Sector Este, Ordeño A"
    },
    symptoms: ["Inflamación de ubre", "Secreción purulenta", "Fiebre leve"],
    treatment: "Antibióticos + antiinflamatorios",
    status: "recovering",
    veterinarian: "Dr. Ana Rodríguez"
  }
];

const sampleAlerts: HealthAlert[] = [
  {
    id: "alert-001",
    type: "vaccination_due",
    priority: "high",
    title: "Vacunación Vencida",
    description: "5 animales requieren vacunación contra fiebre aftosa",
    animalIds: ["cattle-001", "cattle-002", "cattle-003", "cattle-004", "cattle-005"],
    location: {
      lat: 14.6345,
      lng: -90.5070,
      address: "Potrero Principal"
    },
    createdAt: new Date(2025, 5, 14),
    status: "active"
  },
  {
    id: "alert-002",
    type: "disease_outbreak",
    priority: "critical",
    title: "Posible Brote de Diarrea",
    description: "3 casos reportados en el mismo sector en 48 horas",
    animalIds: ["cattle-006", "cattle-007", "cattle-008"],
    location: {
      lat: 14.6350,
      lng: -90.5065,
      address: "Sector Norte"
    },
    createdAt: new Date(2025, 5, 16),
    status: "active"
  }
];

const HealthReports: React.FC = () => {
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);

  // Estados del componente
  const [selectedTab, setSelectedTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(false);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [diseases, setDiseases] = useState<DiseaseCase[]>([]);
  const [alerts, setAlerts] = useState<HealthAlert[]>([]);

  // Métricas de salud
  const healthMetrics: HealthMetric[] = [
    {
      id: "vaccination-coverage",
      title: "Cobertura de Vacunación",
      value: "94.2%",
      change: 3.1,
      trend: "up",
      icon: Shield,
      color: "text-green-600",
      description: "Porcentaje de ganado vacunado según protocolo"
    },
    {
      id: "active-diseases",
      title: "Casos Activos",
      value: "7",
      change: -15.3,
      trend: "down",
      icon: AlertTriangle,
      color: "text-red-600",
      description: "Enfermedades en tratamiento activo",
      critical: true
    },
    {
      id: "pending-vaccinations",
      title: "Vacunas Pendientes",
      value: "23",
      change: 8.7,
      trend: "up",
      icon: Syringe,
      color: "text-orange-600",
      description: "Vacunaciones programadas próximas"
    },
    {
      id: "health-alerts",
      title: "Alertas Activas",
      value: "5",
      change: -25.0,
      trend: "down",
      icon: Bell,
      color: "text-purple-600",
      description: "Notificaciones de salud sin resolver"
    },
    {
      id: "mortality-rate",
      title: "Tasa de Mortalidad",
      value: "0.8%",
      change: -12.5,
      trend: "down",
      icon: Activity,
      color: "text-blue-600",
      description: "Mortalidad en los últimos 30 días"
    },
    {
      id: "avg-temperature",
      title: "Temperatura Promedio",
      value: "38.6°C",
      change: 0.3,
      trend: "stable",
      icon: Thermometer,
      color: "text-amber-600",
      description: "Temperatura corporal promedio del hato"
    }
  ];

  // Efectos y funciones
  useEffect(() => {
    // Inicializar con datos de ejemplo
    setVaccinations(sampleVaccinations);
    setDiseases(sampleDiseases);
    setAlerts(sampleAlerts);
  }, []);

  const handleRefreshData = () => {
    setIsLoading(true);
    // Simular carga de datos
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
      case "recovered":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
      case "recovering":
        return <Clock className="w-4 h-4 text-orange-500" />;
      case "active":
      case "overdue":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild":
        return "bg-green-100 text-green-800";
      case "moderate":
        return "bg-yellow-100 text-yellow-800";
      case "severe":
        return "bg-orange-100 text-orange-800";
      case "critical":
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
              Reportes de Salud del Ganado
            </h1>
            <p className="text-white/90 text-lg">
              Monitoreo integral de salud, vacunaciones y enfermedades del hato
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
              onClick={() => navigate('/health/vaccination/add')}
              className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm shadow-lg border border-white/20"
            >
              <Syringe className="w-4 h-4 mr-2" />
              Nueva Vacuna
            </Button>
            
            <Button 
              onClick={() => navigate('/health/disease/report')}
              className="bg-red-500/80 text-white hover:bg-red-500/90 backdrop-blur-sm shadow-lg"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reportar Enfermedad
            </Button>
          </div>
        </motion.div>

        {/* Métricas de salud */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
        >
          {healthMetrics.map((metric, index) => (
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
                <p className="text-xs text-gray-500">
                  {metric.description}
                </p>
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
                { id: "vaccinations", label: "Vacunaciones", icon: Syringe },
                { id: "diseases", label: "Enfermedades", icon: AlertTriangle },
                { id: "alerts", label: "Alertas", icon: Activity },
                { id: "map", label: "Mapa Sanitario", icon: MapPin },
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
                  {/* Resumen de salud general */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Vacunaciones recientes */}
                    <Card className={`${CSS_CLASSES.card}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Syringe className="w-5 h-5 text-green-600" />
                          Vacunaciones Recientes
                        </CardTitle>
                        <CardDescription>
                          Últimas aplicaciones de vacunas registradas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {vaccinations.slice(0, 5).map((vaccination) => (
                            <div key={vaccination.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getStatusIcon(vaccination.status)}
                                  <span className="font-medium text-gray-900">
                                    {vaccination.animalTag}
                                  </span>
                                  <Badge className="bg-green-100 text-green-800">
                                    {vaccination.vaccineType}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {vaccination.date.toLocaleDateString()} - {vaccination.location.address}
                                </p>
                                <p className="text-xs text-gray-500">
                                  Dr. {vaccination.veterinarian}
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
                            onClick={() => setSelectedTab("vaccinations")}
                            variant="outline" 
                            className="w-full"
                          >
                            Ver Todas las Vacunaciones
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Casos de enfermedad activos */}
                    <Card className={`${CSS_CLASSES.card}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                          Casos Activos de Enfermedad
                        </CardTitle>
                        <CardDescription>
                          Enfermedades en tratamiento o seguimiento
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {diseases.slice(0, 5).map((disease) => (
                            <div key={disease.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getStatusIcon(disease.status)}
                                  <span className="font-medium text-gray-900">
                                    {disease.animalTag}
                                  </span>
                                  <Badge className={getSeverityColor(disease.severity)}>
                                    {disease.diseaseType}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {disease.diagnosisDate.toLocaleDateString()} - {disease.location.address}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {disease.treatment}
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
                            onClick={() => setSelectedTab("diseases")}
                            variant="outline" 
                            className="w-full"
                          >
                            Ver Todos los Casos
                            <ChevronRight className="w-4 h-4 ml-2" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Alertas de salud activas */}
                  <Card className={`${CSS_CLASSES.card}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-600" />
                        Alertas de Salud Activas
                      </CardTitle>
                      <CardDescription>
                        Notificaciones importantes que requieren atención
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {alerts.filter(alert => alert.status === 'active').map((alert) => (
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
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span>
                                  <Users className="w-3 h-3 inline mr-1" />
                                  {alert.animalIds.length} animales afectados
                                </span>
                                {alert.location && (
                                  <span>
                                    <MapPin className="w-3 h-3 inline mr-1" />
                                    {alert.location.address}
                                  </span>
                                )}
                                <span>
                                  <Clock className="w-3 h-3 inline mr-1" />
                                  {alert.createdAt.toLocaleDateString()}
                                </span>
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
                      <div className="mt-4">
                        <Button 
                          onClick={() => setSelectedTab("alerts")}
                          variant="outline" 
                          className="w-full"
                        >
                          Gestionar Todas las Alertas
                          <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {selectedTab === "vaccinations" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle>Control de Vacunaciones</CardTitle>
                    <CardDescription>
                      Gestión completa del programa de vacunación del hato
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Módulo de vacunaciones con calendario, geolocalización y seguimiento...
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "diseases" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle>Registro de Enfermedades</CardTitle>
                    <CardDescription>
                      Seguimiento de casos, tratamientos y recuperación
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Módulo de enfermedades con diagnósticos, tratamientos y geolocalización...
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "alerts" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle>Centro de Alertas</CardTitle>
                    <CardDescription>
                      Notificaciones y alertas del sistema de salud
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Sistema de alertas con notificaciones automáticas y geolocalización...
                    </p>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "map" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Navigation className="w-5 h-5" />
                      Mapa Sanitario del Hato
                    </CardTitle>
                    <CardDescription>
                      Visualización geográfica de eventos de salud
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      ref={mapRef}
                      className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center"
                    >
                      <div className="text-center">
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">
                          Mapa interactivo con Leaflet
                        </p>
                        <p className="text-sm text-gray-500">
                          Ubicaciones de vacunaciones, enfermedades y alertas
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedTab === "analytics" && (
                <Card className={`${CSS_CLASSES.card}`}>
                  <CardHeader>
                    <CardTitle>Análisis y Tendencias</CardTitle>
                    <CardDescription>
                      Estadísticas y proyecciones de salud del hato
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      Módulo de análisis con gráficos, tendencias y predicciones...
                    </p>
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

export default HealthReports;