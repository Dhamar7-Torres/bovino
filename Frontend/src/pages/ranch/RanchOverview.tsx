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
  Activity,
  Building,
  TrendingUp,
  Home,
  Shield,
  TreePine,
  Mountain,
  Package,
  Heart,
  Beef,
  User,
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
// DATOS SIMULADOS
// ============================================================================

const mockRanchData: RanchOverviewData = {
  id: "ranch-001",
  name: "Rancho Los Ceibos",
  description: "Rancho ganadero especializado en producción de leche y carne en la región de Tabasco",
  establishedYear: 1985,
  totalArea: 450.5,
  location: {
    latitude: 17.9869,
    longitude: -92.9303,
    address: "Carretera Villahermosa-Frontera Km 15, Tabasco, México",
    region: "Villahermosa, Tabasco"
  },
  owner: {
    name: "Dr. Carlos Mendoza Jiménez",
    email: "carlos.mendoza@rancholosceibos.com",
    phone: "+52 993 123 4567"
  },
  statistics: {
    totalAnimals: 285,
    activeFacilities: 12,
    zones: 8,
    staff: 15
  },
  status: {
    isOperational: true,
    lastInspection: "2025-07-10",
    nextInspection: "2025-10-10",
    alertCount: 2
  },
  weather: {
    temperature: 28,
    humidity: 75,
    windSpeed: 12,
    condition: "Parcialmente nublado"
  },
  facilities: [
    { id: "f1", name: "Corral Principal", type: "corral", status: "active", capacity: 50, current: 45, coordinates: { latitude: 17.9869, longitude: -92.9303 } },
    { id: "f2", name: "Establo Norte", type: "barn", status: "active", capacity: 30, current: 28, coordinates: { latitude: 17.9875, longitude: -92.9298 } },
    { id: "f3", name: "Área de Alimentación", type: "feed", status: "active", capacity: 100, current: 85, coordinates: { latitude: 17.9863, longitude: -92.9308 } },
    { id: "f4", name: "Clínica Veterinaria", type: "medical", status: "active", capacity: 10, current: 3, coordinates: { latitude: 17.9871, longitude: -92.9295 } }
  ],
  recentActivities: [
    { id: "a1", type: "vaccination", description: "Vacunación contra brucelosis - Lote A", timestamp: "2025-07-16T08:30:00", location: "Corral Principal", status: "completed" },
    { id: "a2", type: "feeding", description: "Alimentación matutina - Concentrado", timestamp: "2025-07-16T06:00:00", location: "Área de Alimentación", status: "completed" },
    { id: "a3", type: "inspection", description: "Inspección sanitaria rutinaria", timestamp: "2025-07-16T14:00:00", location: "Establo Norte", status: "pending" }
  ]
};

// ============================================================================
// VARIANTES DE ANIMACIÓN
// ============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  }
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const StatusBadge: React.FC<{ status: string; count?: number }> = ({ status, count }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "operational":
        return { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Operacional" };
      case "maintenance":
        return { color: "bg-yellow-100 text-yellow-800", icon: Settings, text: "Mantenimiento" };
      case "alert":
        return { color: "bg-red-100 text-red-800", icon: AlertTriangle, text: "Alertas" };
      default:
        return { color: "bg-gray-100 text-gray-800", icon: Clock, text: "Desconocido" };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
    >
      <Icon className="w-4 h-4 mr-1" />
      {config.text}
      {count && <span className="ml-2 bg-white bg-opacity-70 px-2 py-0.5 rounded-full text-xs">{count}</span>}
    </motion.div>
  );
};

const WeatherCard: React.FC<{ weather: RanchOverviewData['weather'] }> = ({ weather }) => {
  const getWeatherIcon = (condition: string) => {
    if (condition.includes("nublado")) return Sun;
    if (condition.includes("lluvia")) return Droplets;
    return Sun;
  };

  const WeatherIcon = getWeatherIcon(weather.condition);

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#2d5a45]">Clima Actual</h3>
        <WeatherIcon className="w-6 h-6 text-yellow-500" />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center">
          <Thermometer className="w-5 h-5 text-red-400 mr-2" />
          <div>
            <p className="text-2xl font-bold text-[#2d5a45]">{weather.temperature}°C</p>
            <p className="text-sm text-gray-600">Temperatura</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Droplets className="w-5 h-5 text-blue-400 mr-2" />
          <div>
            <p className="text-2xl font-bold text-[#2d5a45]">{weather.humidity}%</p>
            <p className="text-sm text-gray-600">Humedad</p>
          </div>
        </div>
        
        <div className="flex items-center">
          <Wind className="w-5 h-5 text-gray-400 mr-2" />
          <div>
            <p className="text-2xl font-bold text-[#2d5a45]">{weather.windSpeed} km/h</p>
            <p className="text-sm text-gray-600">Viento</p>
          </div>
        </div>
        
        <div className="col-span-2">
          <p className="text-sm text-gray-600 mt-2">{weather.condition}</p>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard: React.FC<{ 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  color: string;
  subtitle?: string;
}> = ({ title, value, icon: Icon, color, subtitle }) => {
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>
      
      <div>
        <p className="text-3xl font-bold text-[#2d5a45] mb-1">{value.toLocaleString()}</p>
        <p className="text-gray-600 font-medium">{title}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </motion.div>
  );
};

const FacilityList: React.FC<{ facilities: RanchFacility[] }> = ({ facilities }) => {
  const getFacilityIcon = (type: string) => {
    switch (type) {
      case "corral": return Home;
      case "barn": return Building;
      case "feed": return Package;
      case "water": return Droplets;
      case "medical": return Heart;
      case "office": return FileText;
      default: return Building;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "text-green-600 bg-green-100";
      case "maintenance": return "text-yellow-600 bg-yellow-100";
      case "inactive": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
    >
      <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Instalaciones Principales</h3>
      
      <div className="space-y-3">
        {facilities.map((facility, index) => {
          const Icon = getFacilityIcon(facility.type);
          const occupancyPercentage = (facility.current / facility.capacity) * 100;
          
          return (
            <motion.div
              key={facility.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center">
                <Icon className="w-5 h-5 text-[#519a7c] mr-3" />
                <div>
                  <p className="font-medium text-[#2d5a45]">{facility.name}</p>
                  <p className="text-sm text-gray-600">{facility.current}/{facility.capacity} ocupado</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#519a7c] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${occupancyPercentage}%` }}
                  />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(facility.status)}`}>
                  {facility.status}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

const RecentActivitiesList: React.FC<{ activities: RecentActivity[] }> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "vaccination": return Shield;
      case "feeding": return Package;
      case "treatment": return Heart;
      case "inspection": return Eye;
      case "movement": return MapPin;
      default: return Activity;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "pending": return "text-yellow-600";
      case "cancelled": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
    >
      <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Actividades Recientes</h3>
      
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          const timeAgo = new Date(activity.timestamp).toLocaleTimeString('es-MX', { 
            hour: '2-digit', 
            minute: '2-digit' 
          });
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-8 h-8 bg-[#519a7c] rounded-full flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#2d5a45]">{activity.description}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-gray-600">{activity.location} • {timeAgo}</p>
                  <span className={`text-sm font-medium ${getStatusColor(activity.status)}`}>
                    {activity.status === 'completed' ? 'Completado' : 
                     activity.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
      
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 py-2 text-[#519a7c] border border-[#519a7c] rounded-lg hover:bg-[#519a7c] hover:text-white transition-colors"
      >
        Ver todas las actividades
      </motion.button>
    </motion.div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const RanchOverview: React.FC = () => {
  // Estados para manejo de datos y UI
  const [ranchData] = useState<RanchOverviewData>(mockRanchData);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Efecto para simular carga inicial de datos
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  // Función para refrescar datos
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  // Función para editar información del rancho
  const handleEdit = () => {
    console.log("Editando información del rancho...");
  };

  // Función para compartir información
  const handleShare = () => {
    console.log("Compartiendo información del rancho...");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#E8E8C8] to-[#D3D3B8] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-[#519a7c] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#E8E8C8] to-[#D3D3B8] p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header de la página */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2d5a45] mb-2">
                {ranchData.name}
              </h1>
              <p className="text-gray-600 text-lg">{ranchData.description}</p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{ranchData.location.region}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span className="text-sm">Establecido en {ranchData.establishedYear}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mountain className="w-4 h-4 mr-1" />
                  <span className="text-sm">{ranchData.totalArea} hectáreas</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <StatusBadge 
                status={ranchData.status.isOperational ? "operational" : "maintenance"} 
              />
              {ranchData.status.alertCount > 0 && (
                <StatusBadge status="alert" count={ranchData.status.alertCount} />
              )}
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 hover:bg-white transition-colors"
              >
                <motion.div
                  animate={refreshing ? { rotate: 360 } : { rotate: 0 }}
                  transition={{ duration: 1, repeat: refreshing ? Infinity : 0, ease: "linear" }}
                >
                  <Activity className="w-5 h-5 text-[#519a7c]" />
                </motion.div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEdit}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 hover:bg-white transition-colors"
              >
                <Edit3 className="w-5 h-5 text-[#519a7c]" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="p-2 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border border-white/20 hover:bg-white transition-colors"
              >
                <Share2 className="w-5 h-5 text-[#519a7c]" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Grid principal de estadísticas */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total de Animales"
            value={ranchData.statistics.totalAnimals}
            icon={Beef}
            color="bg-[#519a7c]"
            subtitle="En todas las instalaciones"
          />
          <StatCard
            title="Instalaciones Activas"
            value={ranchData.statistics.activeFacilities}
            icon={Building}
            color="bg-blue-500"
            subtitle="En funcionamiento"
          />
          <StatCard
            title="Zonas de Pastoreo"
            value={ranchData.statistics.zones}
            icon={TreePine}
            color="bg-green-500"
            subtitle="Áreas disponibles"
          />
          <StatCard
            title="Personal Activo"
            value={ranchData.statistics.staff}
            icon={Users}
            color="bg-purple-500"
            subtitle="Trabajadores en turno"
          />
        </motion.div>

        {/* Grid de información detallada */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Información del clima */}
          <motion.div variants={itemVariants}>
            <WeatherCard weather={ranchData.weather} />
          </motion.div>

          {/* Información del propietario y contacto */}
          <motion.div
            variants={cardVariants}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
          >
            <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Información de Contacto</h3>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="w-5 h-5 text-[#519a7c] mr-3" />
                <div>
                  <p className="font-medium text-[#2d5a45]">{ranchData.owner.name}</p>
                  <p className="text-sm text-gray-600">Propietario</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-[#519a7c] mr-3" />
                <div>
                  <p className="font-medium text-[#2d5a45]">{ranchData.owner.email}</p>
                  <p className="text-sm text-gray-600">Correo electrónico</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone className="w-5 h-5 text-[#519a7c] mr-3" />
                <div>
                  <p className="font-medium text-[#2d5a45]">{ranchData.owner.phone}</p>
                  <p className="text-sm text-gray-600">Teléfono</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <strong>Dirección:</strong> {ranchData.location.address}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Estado de inspecciones */}
          <motion.div
            variants={cardVariants}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
          >
            <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Estado de Inspecciones</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-[#2d5a45]">Última Inspección</span>
                </div>
                <span className="text-sm text-gray-600">
                  {new Date(ranchData.status.lastInspection).toLocaleDateString('es-MX')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-[#2d5a45]">Próxima Inspección</span>
                </div>
                <span className="text-sm text-gray-600">
                  {new Date(ranchData.status.nextInspection).toLocaleDateString('es-MX')}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors"
                >
                  Programar Inspección
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Grid de listas detalladas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lista de instalaciones */}
          <motion.div variants={itemVariants}>
            <FacilityList facilities={ranchData.facilities} />
          </motion.div>

          {/* Lista de actividades recientes */}
          <motion.div variants={itemVariants}>
            <RecentActivitiesList activities={ranchData.recentActivities} />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default RanchOverview;