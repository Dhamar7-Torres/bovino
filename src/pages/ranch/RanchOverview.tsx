// ============================================================================
// RANCHOVERVIEW.TSX - VISTA GENERAL DEL RANCHO
// ============================================================================
// Componente principal para mostrar información general del rancho con mapa,
// estadísticas, instalaciones y estado operacional con animaciones

import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  MapPin,
  Users,
  BarChart3,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Settings,
  FileText,
  Phone,
  Mail,
  Clock,
  Thermometer,
  Droplets,
  Wind,
  Sun,
  Eye,
  Edit3,
  Share2,
  Bell,
  Activity,
} from "lucide-react";

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface RanchOverviewData {
  id: string;
  name: string;
  description: string;
  establishedYear: number;
  totalArea: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    region: string;
  };
  owner: {
    name: string;
    email: string;
    phone: string;
  };
  statistics: {
    totalAnimals: number;
    activeFacilities: number;
    zones: number;
    staff: number;
  };
  status: {
    isOperational: boolean;
    lastInspection: string;
    nextInspection: string;
    alertCount: number;
  };
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    condition: string;
  };
  facilities: RanchFacility[];
  recentActivities: RecentActivity[];
}

interface RanchFacility {
  id: string;
  name: string;
  type: "corral" | "barn" | "feed" | "water" | "medical" | "office";
  status: "active" | "maintenance" | "inactive";
  capacity: number;
  current: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

interface RecentActivity {
  id: string;
  type: "vaccination" | "feeding" | "treatment" | "inspection" | "movement";
  description: string;
  timestamp: string;
  location: string;
  status: "completed" | "pending" | "cancelled";
}


// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const RanchOverview: React.FC = () => {
  // Estados para manejo de datos y UI
  const [ranchData, setRanchData] = useState<RanchOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedFacility, setSelectedFacility] = useState<string | null>(null);
  const [showActivities, setShowActivities] = useState<boolean>(false);
  const [weatherExpanded, setWeatherExpanded] = useState<boolean>(false);

  // Datos simulados del rancho - En producción vendrían de la API
  const mockRanchData: RanchOverviewData = {
    id: "ranch-001",
    name: "Rancho San José",
    description: "Rancho ganadero especializado en producción bovina mixta con tecnología avanzada",
    establishedYear: 1987,
    totalArea: 2500, // hectáreas
    location: {
      latitude: 17.9890,
      longitude: -92.9476,
      address: "Carretera Villahermosa-Frontera Km 15.5",
      region: "Villahermosa, Tabasco, México",
    },
    owner: {
      name: "José Manuel Rodríguez García",
      email: "jm.rodriguez@ranchosanjose.com",
      phone: "+52 993 123 4567",
    },
    statistics: {
      totalAnimals: 847,
      activeFacilities: 15,
      zones: 8,
      staff: 12,
    },
    status: {
      isOperational: true,
      lastInspection: "2025-01-10",
      nextInspection: "2025-01-20",
      alertCount: 2,
    },
    weather: {
      temperature: 28,
      humidity: 76,
      windSpeed: 12,
      condition: "partly cloudy",
    },
    facilities: [
      {
        id: "fac-001",
        name: "Corral Principal",
        type: "corral",
        status: "active",
        capacity: 200,
        current: 187,
        coordinates: { latitude: 17.9892, longitude: -92.9478 },
      },
      {
        id: "fac-002",
        name: "Establo Norte",
        type: "barn",
        status: "active",
        capacity: 150,
        current: 143,
        coordinates: { latitude: 17.9894, longitude: -92.9475 },
      },
      {
        id: "fac-003",
        name: "Centro de Alimentación",
        type: "feed",
        status: "active",
        capacity: 500,
        current: 387,
        coordinates: { latitude: 17.9888, longitude: -92.9480 },
      },
      {
        id: "fac-004",
        name: "Depósito de Agua",
        type: "water",
        status: "maintenance",
        capacity: 1000,
        current: 750,
        coordinates: { latitude: 17.9891, longitude: -92.9473 },
      },
      {
        id: "fac-005",
        name: "Clínica Veterinaria",
        type: "medical",
        status: "active",
        capacity: 20,
        current: 3,
        coordinates: { latitude: 17.9889, longitude: -92.9477 },
      },
    ],
    recentActivities: [
      {
        id: "act-001",
        type: "vaccination",
        description: "Vacunación antiaftosa - Lote 15",
        timestamp: "2025-01-15T09:30:00Z",
        location: "Corral Principal",
        status: "completed",
      },
      {
        id: "act-002",
        type: "feeding",
        description: "Distribución de alimento balanceado",
        timestamp: "2025-01-15T06:00:00Z",
        location: "Centro de Alimentación",
        status: "completed",
      },
      {
        id: "act-003",
        type: "inspection",
        description: "Inspección sanitaria mensual",
        timestamp: "2025-01-16T14:00:00Z",
        location: "Todo el rancho",
        status: "pending",
      },
    ],
  };

  // Efecto para simular carga de datos
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simular llamada a API
      setTimeout(() => {
        setRanchData(mockRanchData);
        setIsLoading(false);
      }, 1500);
    };

    loadData();
  }, []);

  // Variantes de animación para Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const cardHoverVariants: Variants = {
    hover: {
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  // Función para obtener icono del clima
  const getWeatherIcon = (condition: string): React.ReactNode => {
    switch (condition) {
      case "sunny":
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case "cloudy":
        return <Sun className="w-6 h-6 text-gray-500" />;
      case "rainy":
        return <Droplets className="w-6 h-6 text-blue-500" />;
      case "windy":
        return <Wind className="w-6 h-6 text-gray-600" />;
      default:
        return <Sun className="w-6 h-6 text-yellow-500" />;
    }
  };

  // Función para obtener color según el estado
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
      case "completed":
        return "text-green-600 bg-green-100";
      case "maintenance":
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "inactive":
      case "cancelled":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Función para obtener icono de instalación
  const getFacilityIcon = (type: string): React.ReactNode => {
    switch (type) {
      case "corral":
        return <Users className="w-5 h-5" />;
      case "barn":
        return <FileText className="w-5 h-5" />;
      case "feed":
        return <BarChart3 className="w-5 h-5" />;
      case "water":
        return <Droplets className="w-5 h-5" />;
      case "medical":
        return <Activity className="w-5 h-5" />;
      case "office":
        return <Settings className="w-5 h-5" />;
      default:
        return <MapPin className="w-5 h-5" />;
    }
  };

  // Componente de loading con fondo degradado del layout principal
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold text-white mb-2"
          >
            Cargando Vista General del Rancho
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/80"
          >
            Obteniendo información actualizada...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (!ranchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white"
        >
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">Error al Cargar Datos</h2>
          <p className="text-white/80">No se pudo obtener la información del rancho</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Contenedor principal con padding y espaciado */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header con información básica del rancho */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold bg-gradient-to-r from-[#519a7c] to-[#f4ac3a] bg-clip-text text-transparent mb-2"
                  >
                    {ranchData.name}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 text-lg mb-4"
                  >
                    {ranchData.description}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex flex-wrap items-center gap-4 text-sm text-gray-500"
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Establecido en {ranchData.establishedYear}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{ranchData.totalArea} hectáreas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{ranchData.location.region}</span>
                    </div>
                  </motion.div>
                </div>

                {/* Acciones rápidas */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3 mt-6 lg:mt-0"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white px-6 py-3 rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar Información
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 text-gray-700 px-6 py-3 rounded-lg hover:bg-white/30 border border-gray-200 flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir
                  </motion.button>
                </motion.div>
              </div>

              {/* Estado operacional */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-6 flex flex-wrap items-center gap-4"
              >
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                  ranchData.status.isOperational 
                    ? "text-green-600 bg-green-100" 
                    : "text-red-600 bg-red-100"
                }`}>
                  {ranchData.status.isOperational ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                  {ranchData.status.isOperational ? "Operacional" : "Fuera de Servicio"}
                </div>
                
                {ranchData.status.alertCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium text-yellow-600 bg-yellow-100">
                    <Bell className="w-4 h-4" />
                    {ranchData.status.alertCount} Alertas Activas
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Grid de estadísticas principales */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Total de Animales",
                  value: ranchData.statistics.totalAnimals.toLocaleString(),
                  icon: <Users className="w-8 h-8 text-[#519a7c]" />,
                  color: "from-green-500 to-green-600",
                },
                {
                  title: "Instalaciones Activas",
                  value: ranchData.statistics.activeFacilities,
                  icon: <Settings className="w-8 h-8 text-[#f4ac3a]" />,
                  color: "from-orange-500 to-orange-600",
                },
                {
                  title: "Zonas Productivas",
                  value: ranchData.statistics.zones,
                  icon: <MapPin className="w-8 h-8 text-blue-600" />,
                  color: "from-blue-500 to-blue-600",
                },
                {
                  title: "Personal Activo",
                  value: ranchData.statistics.staff,
                  icon: <Users className="w-8 h-8 text-purple-600" />,
                  color: "from-purple-500 to-purple-600",
                },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  variants={cardHoverVariants}
                  whileHover="hover"
                  className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {stat.icon}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Sección de clima actual */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Condiciones Climáticas</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setWeatherExpanded(!weatherExpanded)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Eye className="w-5 h-5" />
                </motion.button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-6 h-6 text-red-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{ranchData.weather.temperature}°C</p>
                    <p className="text-sm text-gray-600">Temperatura</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Droplets className="w-6 h-6 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{ranchData.weather.humidity}%</p>
                    <p className="text-sm text-gray-600">Humedad</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Wind className="w-6 h-6 text-gray-500" />
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{ranchData.weather.windSpeed} km/h</p>
                    <p className="text-sm text-gray-600">Viento</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getWeatherIcon(ranchData.weather.condition)}
                  <div>
                    <p className="text-lg font-semibold text-gray-800 capitalize">
                      {ranchData.weather.condition.replace("_", " ")}
                    </p>
                    <p className="text-sm text-gray-600">Condición</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Grid de instalaciones y actividades */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Instalaciones */}
            <motion.div variants={itemVariants}>
              <motion.div
                variants={cardHoverVariants}
                whileHover="hover"
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Instalaciones</h3>
                  <span className="text-sm text-gray-500">
                    {ranchData.facilities.length} instalaciones
                  </span>
                </div>
                
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {ranchData.facilities.map((facility, index) => (
                    <motion.div
                      key={facility.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedFacility === facility.id 
                          ? "border-[#519a7c] bg-green-50" 
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedFacility(
                        selectedFacility === facility.id ? null : facility.id
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getFacilityIcon(facility.type)}
                          <div>
                            <h4 className="font-medium text-gray-800">{facility.name}</h4>
                            <p className="text-sm text-gray-600">
                              {facility.current}/{facility.capacity} - {facility.type}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(facility.status)}`}>
                          {facility.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Actividades recientes */}
            <motion.div variants={itemVariants}>
              <motion.div
                variants={cardHoverVariants}
                whileHover="hover"
                className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-800">Actividades Recientes</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowActivities(!showActivities)}
                    className="text-[#519a7c] hover:text-[#457e68] font-medium text-sm"
                  >
                    Ver todas
                  </motion.button>
                </div>
                
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {ranchData.recentActivities.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 mb-1">
                            {activity.description}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(activity.timestamp).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {activity.location}
                            </span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Información de contacto del propietario */}
          <motion.div variants={itemVariants}>
            <motion.div
              variants={cardHoverVariants}
              whileHover="hover"
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Información del Propietario</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Users className="w-6 h-6 text-[#519a7c]" />
                  <div>
                    <p className="font-medium text-gray-800">{ranchData.owner.name}</p>
                    <p className="text-sm text-gray-600">Propietario</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-[#f4ac3a]" />
                  <div>
                    <p className="font-medium text-gray-800">{ranchData.owner.email}</p>
                    <p className="text-sm text-gray-600">Correo electrónico</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-800">{ranchData.owner.phone}</p>
                    <p className="text-sm text-gray-600">Teléfono</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Acciones rápidas finales */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Ver Mapa Completo", icon: <MapPin className="w-5 h-5" />, color: "bg-green-600" },
                { label: "Generar Reporte", icon: <FileText className="w-5 h-5" />, color: "bg-blue-600" },
                { label: "Gestionar Alertas", icon: <Bell className="w-5 h-5" />, color: "bg-yellow-600" },
                { label: "Ver Detalles", icon: <Eye className="w-5 h-5" />, color: "bg-purple-600" },
              ].map((action, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`${action.color} text-white p-4 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-3`}
                >
                  {action.icon}
                  <span className="font-medium">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default RanchOverview;