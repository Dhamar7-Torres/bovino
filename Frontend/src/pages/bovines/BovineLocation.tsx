import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Navigation,
  Satellite,
  Route,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  Target,
  BarChart3,
  TrendingUp,
  MapIcon,
  Plus,
  Edit3,
  Trash2,
  Bell,
  Shield,
  Radio,
  Battery,
  Signal,
  Globe,
  History,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Interfaces para los datos de ubicación
interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy: number;
  timestamp: Date;
  speed?: number;
  heading?: number;
  source: "GPS" | "MANUAL" | "ESTIMATED";
  batteryLevel?: number;
  signalStrength?: number;
  notes?: string;
}

interface GeofenceArea {
  id: string;
  name: string;
  type: "SAFE_ZONE" | "RESTRICTED" | "FEEDING" | "WATERING" | "MEDICAL";
  center: { latitude: number; longitude: number };
  radius: number;
  isActive: boolean;
  alertsEnabled: boolean;
  entryTime?: Date;
  exitTime?: Date;
  violations: number;
  createdAt: Date;
}

interface MovementPattern {
  id: string;
  date: Date;
  totalDistance: number;
  avgSpeed: number;
  maxSpeed: number;
  timeInMovement: number;
  timeStationary: number;
  areasVisited: string[];
  healthMetrics: {
    activityLevel: "LOW" | "MODERATE" | "HIGH";
    behaviorPattern: "NORMAL" | "RESTLESS" | "LETHARGIC";
    grazingTime: number;
    restingTime: number;
  };
}

interface BovineLocationData {
  bovineId: string;
  earTag: string;
  name?: string;
  currentLocation: LocationPoint;
  lastUpdate: Date;
  isTracking: boolean;
  deviceStatus: {
    batteryLevel: number;
    signalStrength: number;
    isOnline: boolean;
    deviceId: string;
    firmwareVersion: string;
  };
  locationHistory: LocationPoint[];
  geofences: GeofenceArea[];
  movementPatterns: MovementPattern[];
  alerts: {
    id: string;
    type:
      | "GEOFENCE_VIOLATION"
      | "LOW_BATTERY"
      | "DEVICE_OFFLINE"
      | "UNUSUAL_MOVEMENT";
    message: string;
    severity: "INFO" | "WARNING" | "CRITICAL";
    timestamp: Date;
    isRead: boolean;
  }[];
}

// Componente del mapa simulado (reemplazaría Leaflet en producción)
const LocationMap: React.FC<{
  center: { latitude: number; longitude: number };
  locations: LocationPoint[];
  geofences: GeofenceArea[];
  showRoute: boolean;
  showGeofences: boolean;
  onLocationClick?: (lat: number, lng: number) => void;
}> = ({ center, locations, geofences, showRoute, showGeofences }) => {
  const [mapMode, setMapMode] = useState<"satellite" | "terrain" | "hybrid">(
    "satellite"
  );

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden border-2 border-gray-200">
      {/* Controles del mapa */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
          <div className="flex gap-1">
            <button
              onClick={() => setMapMode("satellite")}
              className={`p-2 rounded text-xs ${
                mapMode === "satellite"
                  ? "bg-[#3d8b40] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Vista satelital"
            >
              <Satellite className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMapMode("terrain")}
              className={`p-2 rounded text-xs ${
                mapMode === "terrain"
                  ? "bg-[#3d8b40] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Vista terreno"
            >
              <MapIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMapMode("hybrid")}
              className={`p-2 rounded text-xs ${
                mapMode === "hybrid"
                  ? "bg-[#3d8b40] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title="Vista híbrida"
            >
              <Globe className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Indicador de centro del mapa */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
        <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
          Ubicación Actual
        </div>
      </div>

      {/* Geofences */}
      {showGeofences &&
        geofences.map((geofence, index) => (
          <motion.div
            key={geofence.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.3, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full border-4 ${
              geofence.type === "SAFE_ZONE"
                ? "border-green-500"
                : geofence.type === "RESTRICTED"
                ? "border-red-500"
                : geofence.type === "FEEDING"
                ? "border-blue-500"
                : geofence.type === "WATERING"
                ? "border-cyan-500"
                : "border-purple-500"
            }`}
            style={{
              top: `${45 + index * 5}%`,
              left: `${50 + index * 10 - 25}%`,
              width: `${geofence.radius / 10}px`,
              height: `${geofence.radius / 10}px`,
              backgroundColor:
                geofence.type === "SAFE_ZONE"
                  ? "rgba(34, 197, 94, 0.2)"
                  : geofence.type === "RESTRICTED"
                  ? "rgba(239, 68, 68, 0.2)"
                  : geofence.type === "FEEDING"
                  ? "rgba(59, 130, 246, 0.2)"
                  : geofence.type === "WATERING"
                  ? "rgba(6, 182, 212, 0.2)"
                  : "rgba(147, 51, 234, 0.2)",
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-medium">
              {geofence.name}
            </div>
          </motion.div>
        ))}

      {/* Ruta histórica */}
      {showRoute && locations.length > 1 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {locations.slice(1).map((_location, index) => {
            return (
              <motion.line
                key={index}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                x1={`${40 + index * 5}%`}
                y1={`${50 + index * 3}%`}
                x2={`${45 + index * 5}%`}
                y2={`${50 + (index + 1) * 3}%`}
                stroke="#3d8b40"
                strokeWidth="3"
                strokeDasharray="5,5"
              />
            );
          })}
        </svg>
      )}

      {/* Puntos de ubicación histórica */}
      {locations.slice(-10).map((location, index) => (
        <motion.div
          key={location.id}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.7 - index * 0.05, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{
            top: `${45 + index * 2}%`,
            left: `${45 + index * 3}%`,
          }}
        >
          <div
            className={`w-3 h-3 rounded-full border-2 border-white shadow-md ${
              location.source === "GPS"
                ? "bg-green-500"
                : location.source === "MANUAL"
                ? "bg-blue-500"
                : "bg-yellow-500"
            }`}
          ></div>
        </motion.div>
      ))}

      {/* Información del mapa */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md text-sm">
        <div className="font-medium text-gray-900 mb-1">
          Información del Mapa
        </div>
        <div className="text-gray-600 space-y-1">
          <div>
            Centro: {center.latitude.toFixed(6)}, {center.longitude.toFixed(6)}
          </div>
          <div>Zoom: Automático</div>
          <div>
            Modo:{" "}
            {mapMode === "satellite"
              ? "Satelital"
              : mapMode === "terrain"
              ? "Terreno"
              : "Híbrido"}
          </div>
        </div>
      </div>

      {/* Escala del mapa */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg p-2 shadow-md">
        <div className="text-xs text-gray-600 mb-1">Escala</div>
        <div className="w-16 h-1 bg-black"></div>
        <div className="text-xs text-gray-600 mt-1">100m</div>
      </div>
    </div>
  );
};

// Componente para mostrar alertas
const AlertCard: React.FC<{
  alert: BovineLocationData["alerts"][0];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}> = ({ alert, onMarkAsRead, onDismiss }) => {
  const getSeverityIcon = () => {
    switch (alert.severity) {
      case "CRITICAL":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "WARNING":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
    }
  };

  const getSeverityColor = () => {
    switch (alert.severity) {
      case "CRITICAL":
        return "border-red-200 bg-red-50";
      case "WARNING":
        return "border-yellow-200 bg-yellow-50";
      default:
        return "border-blue-200 bg-blue-50";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`p-4 rounded-lg border ${getSeverityColor()} ${
        !alert.isRead ? "ring-2 ring-opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        {getSeverityIcon()}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-medium text-gray-900">
              {alert.type.replace("_", " ")}
            </h4>
            <span className="text-xs text-gray-500">
              {alert.timestamp.toLocaleTimeString("es-MX")}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{alert.message}</p>
          <div className="flex gap-2">
            {!alert.isRead && (
              <button
                onClick={() => onMarkAsRead(alert.id)}
                className="text-xs text-blue-600 hover:text-blue-800"
              >
                Marcar como leído
              </button>
            )}
            <button
              onClick={() => onDismiss(alert.id)}
              className="text-xs text-gray-600 hover:text-gray-800"
            >
              Descartar
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Componente principal de ubicación del bovino
const BovineLocation: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Estados principales
  const [locationData, setLocationData] = useState<BovineLocationData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "map" | "history" | "geofences" | "analytics"
  >("map");
  const [showRoute, setShowRoute] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<
    "1h" | "6h" | "24h" | "7d" | "30d"
  >("24h");
  const [, setShowNewGeofenceModal] = useState(false);

  // Cargar datos de ubicación
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Datos simulados
        const mockData: BovineLocationData = {
          bovineId: id || "1",
          earTag: "MX-001234",
          name: "Lupita",
          currentLocation: {
            id: "current",
            latitude: 17.9869,
            longitude: -92.9303,
            accuracy: 3.5,
            timestamp: new Date(),
            speed: 0.2,
            heading: 135,
            source: "GPS",
            batteryLevel: 87,
            signalStrength: 4,
          },
          lastUpdate: new Date(),
          isTracking: true,
          deviceStatus: {
            batteryLevel: 87,
            signalStrength: 4,
            isOnline: true,
            deviceId: "GPS-001234",
            firmwareVersion: "v2.1.4",
          },
          locationHistory: [
            {
              id: "1",
              latitude: 17.986,
              longitude: -92.931,
              accuracy: 4.2,
              timestamp: new Date(Date.now() - 3600000),
              source: "GPS",
            },
            {
              id: "2",
              latitude: 17.9865,
              longitude: -92.9305,
              accuracy: 3.8,
              timestamp: new Date(Date.now() - 1800000),
              source: "GPS",
            },
            {
              id: "3",
              latitude: 17.9869,
              longitude: -92.9303,
              accuracy: 3.5,
              timestamp: new Date(),
              source: "GPS",
            },
          ],
          geofences: [
            {
              id: "1",
              name: "Zona Segura Principal",
              type: "SAFE_ZONE",
              center: { latitude: 17.987, longitude: -92.93 },
              radius: 500,
              isActive: true,
              alertsEnabled: true,
              violations: 0,
              createdAt: new Date("2024-01-15"),
            },
            {
              id: "2",
              name: "Zona de Alimentación",
              type: "FEEDING",
              center: { latitude: 17.9875, longitude: -92.931 },
              radius: 200,
              isActive: true,
              alertsEnabled: true,
              violations: 0,
              createdAt: new Date("2024-02-01"),
            },
            {
              id: "3",
              name: "Área Restringida - Carretera",
              type: "RESTRICTED",
              center: { latitude: 17.985, longitude: -92.928 },
              radius: 100,
              isActive: true,
              alertsEnabled: true,
              violations: 2,
              createdAt: new Date("2024-01-20"),
            },
          ],
          movementPatterns: [
            {
              id: "1",
              date: new Date(),
              totalDistance: 2.4,
              avgSpeed: 0.3,
              maxSpeed: 1.2,
              timeInMovement: 180,
              timeStationary: 1260,
              areasVisited: ["Zona Segura Principal", "Zona de Alimentación"],
              healthMetrics: {
                activityLevel: "MODERATE",
                behaviorPattern: "NORMAL",
                grazingTime: 420,
                restingTime: 840,
              },
            },
          ],
          alerts: [
            {
              id: "1",
              type: "LOW_BATTERY",
              message:
                "El nivel de batería del dispositivo GPS está por debajo del 20%",
              severity: "WARNING",
              timestamp: new Date(Date.now() - 1800000),
              isRead: false,
            },
            {
              id: "2",
              type: "GEOFENCE_VIOLATION",
              message:
                "El bovino salió de la zona segura principal hace 30 minutos",
              severity: "CRITICAL",
              timestamp: new Date(Date.now() - 3600000),
              isRead: true,
            },
          ],
        };

        setLocationData(mockData);
        setIsTracking(mockData.isTracking);
      } catch (error) {
        console.error("Error cargando datos de ubicación:", error);
      } finally {
        setLoading(false);
      }
    };

    loadLocationData();
  }, [id]);

  // Manejar acciones de alertas
  const handleMarkAsRead = (alertId: string) => {
    if (!locationData) return;

    setLocationData((prev) =>
      prev
        ? {
            ...prev,
            alerts: prev.alerts.map((alert) =>
              alert.id === alertId ? { ...alert, isRead: true } : alert
            ),
          }
        : null
    );
  };

  const handleDismissAlert = (alertId: string) => {
    if (!locationData) return;

    setLocationData((prev) =>
      prev
        ? {
            ...prev,
            alerts: prev.alerts.filter((alert) => alert.id !== alertId),
          }
        : null
    );
  };

  // Alternar seguimiento
  const toggleTracking = async () => {
    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setIsTracking(!isTracking);

      if (locationData) {
        setLocationData((prev) =>
          prev
            ? {
                ...prev,
                isTracking: !isTracking,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error al cambiar estado de seguimiento:", error);
    }
  };

  // Obtener ubicación actual del dispositivo
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation: LocationPoint = {
            id: Date.now().toString(),
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(),
            source: "MANUAL",
          };

          if (locationData) {
            setLocationData((prev) =>
              prev
                ? {
                    ...prev,
                    currentLocation: newLocation,
                    locationHistory: [...prev.locationHistory, newLocation],
                    lastUpdate: new Date(),
                  }
                : null
            );
          }
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
        }
      );
    }
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#3d8b40] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-lg font-medium text-gray-700">
            Cargando datos de ubicación...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!locationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error al cargar ubicación
          </h2>
          <p className="text-gray-600 mb-4">
            No se pudieron cargar los datos de ubicación del bovino.
          </p>
          <button
            onClick={() => navigate(`/bovines/detail/${id}`)}
            className="px-6 py-3 bg-[#3d8b40] text-white rounded-lg hover:bg-[#2d6e30] transition-all duration-300"
          >
            Regresar al detalle
          </button>
        </div>
      </div>
    );
  }

  const unreadAlerts = locationData.alerts.filter(
    (alert) => !alert.isRead
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header con navegación */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => navigate(`/bovines/detail/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Regresar al Detalle</span>
          </button>

          <div className="flex items-center gap-3">
            {/* Estado del dispositivo */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white">
              <div
                className={`w-2 h-2 rounded-full ${
                  locationData.deviceStatus.isOnline
                    ? "bg-green-400"
                    : "bg-red-400"
                }`}
              ></div>
              <span className="text-sm font-medium">
                {locationData.deviceStatus.isOnline ? "Online" : "Offline"}
              </span>
            </div>

            {/* Alertas */}
            {unreadAlerts > 0 && (
              <div className="relative px-3 py-2 bg-red-500/80 backdrop-blur-sm rounded-lg text-white">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                  {unreadAlerts}
                </span>
              </div>
            )}

            {/* Toggle seguimiento */}
            <button
              onClick={toggleTracking}
              className={`flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-lg transition-all duration-300 ${
                isTracking
                  ? "bg-green-500/80 text-white hover:bg-green-600/80"
                  : "bg-gray-500/80 text-white hover:bg-gray-600/80"
              }`}
            >
              <Radio className="w-4 h-4" />
              <span className="font-medium">
                {isTracking ? "Rastreando" : "Pausado"}
              </span>
            </button>
          </div>
        </motion.div>

        {/* Título y información del bovino */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ubicación de {locationData.name || locationData.earTag}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Seguimiento GPS en tiempo real y gestión de geofencing
          </p>
        </motion.div>

        {/* Estado del dispositivo y métricas */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Battery className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {locationData.deviceStatus.batteryLevel}%
            </div>
            <div className="text-sm text-gray-600">Batería</div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Signal className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {locationData.deviceStatus.signalStrength}/5
            </div>
            <div className="text-sm text-gray-600">Señal GPS</div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {locationData.currentLocation.accuracy.toFixed(1)}m
            </div>
            <div className="text-sm text-gray-600">Precisión</div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.floor(
                (Date.now() - locationData.lastUpdate.getTime()) / 60000
              )}
              m
            </div>
            <div className="text-sm text-gray-600">Últ. Actualización</div>
          </div>
        </motion.div>

        {/* Navegación por pestañas */}
        <motion.div
          variants={itemVariants}
          className="bg-[#fffdf8]/90 backdrop-blur-sm rounded-t-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "map", label: "Mapa en Vivo", icon: MapPin },
                { id: "history", label: "Historial", icon: History },
                { id: "geofences", label: "Geofencing", icon: Shield },
                { id: "analytics", label: "Análisis", icon: BarChart3 },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-[#3d8b40] text-[#3d8b40]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "map" && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Controles del mapa */}
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="showRoute"
                          checked={showRoute}
                          onChange={(e) => setShowRoute(e.target.checked)}
                          className="rounded text-[#3d8b40] focus:ring-[#3d8b40]"
                        />
                        <label
                          htmlFor="showRoute"
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          Mostrar ruta
                        </label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="showGeofences"
                          checked={showGeofences}
                          onChange={(e) => setShowGeofences(e.target.checked)}
                          className="rounded text-[#3d8b40] focus:ring-[#3d8b40]"
                        />
                        <label
                          htmlFor="showGeofences"
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          Mostrar geofences
                        </label>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={getCurrentLocation}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                      >
                        <Target className="w-4 h-4" />
                        Ubicación Manual
                      </button>
                      <button
                        onClick={() => {
                          /* Centrar mapa */
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors text-sm"
                      >
                        <Navigation className="w-4 h-4" />
                        Centrar
                      </button>
                    </div>
                  </div>

                  {/* Mapa */}
                  <LocationMap
                    center={locationData.currentLocation}
                    locations={locationData.locationHistory}
                    geofences={locationData.geofences}
                    showRoute={showRoute}
                    showGeofences={showGeofences}
                  />

                  {/* Información de la ubicación actual */}
                  <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Ubicación Actual
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Latitud:
                        </span>
                        <p className="text-gray-900">
                          {locationData.currentLocation.latitude.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Longitud:
                        </span>
                        <p className="text-gray-900">
                          {locationData.currentLocation.longitude.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Precisión:
                        </span>
                        <p className="text-gray-900">
                          {locationData.currentLocation.accuracy.toFixed(1)} m
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Última actualización:
                        </span>
                        <p className="text-gray-900">
                          {locationData.lastUpdate.toLocaleTimeString("es-MX")}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Controles de filtrado temporal */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Historial de Ubicaciones
                    </h3>
                    <div className="flex gap-2">
                      {(["1h", "6h", "24h", "7d", "30d"] as const).map(
                        (range) => (
                          <button
                            key={range}
                            onClick={() => setSelectedTimeRange(range)}
                            className={`px-3 py-2 text-sm rounded transition-colors ${
                              selectedTimeRange === range
                                ? "bg-[#3d8b40] text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {range === "1h"
                              ? "1 Hora"
                              : range === "6h"
                              ? "6 Horas"
                              : range === "24h"
                              ? "24 Horas"
                              : range === "7d"
                              ? "7 Días"
                              : "30 Días"}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Lista de ubicaciones históricas */}
                  <div className="space-y-3">
                    {locationData.locationHistory
                      .slice()
                      .reverse()
                      .map((location, index) => (
                        <motion.div
                          key={location.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-3 h-3 rounded-full ${
                                  location.source === "GPS"
                                    ? "bg-green-500"
                                    : location.source === "MANUAL"
                                    ? "bg-blue-500"
                                    : "bg-yellow-500"
                                }`}
                              ></div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {location.latitude.toFixed(6)},{" "}
                                  {location.longitude.toFixed(6)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {location.timestamp.toLocaleString("es-MX")} •
                                  Precisión: {location.accuracy.toFixed(1)}m •
                                  Fuente: {location.source}
                                </p>
                              </div>
                            </div>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "geofences" && (
                <motion.div
                  key="geofences"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Header de geofences */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">
                      Gestión de Geofences
                    </h3>
                    <button
                      onClick={() => setShowNewGeofenceModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-[#3d8b40] text-white rounded-lg hover:bg-[#2d6e30] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Nuevo Geofence
                    </button>
                  </div>

                  {/* Lista de geofences */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {locationData.geofences.map((geofence, index) => (
                      <motion.div
                        key={geofence.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {geofence.name}
                            </h4>
                            <div className="flex items-center gap-2">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  geofence.type === "SAFE_ZONE"
                                    ? "bg-green-100 text-green-800"
                                    : geofence.type === "RESTRICTED"
                                    ? "bg-red-100 text-red-800"
                                    : geofence.type === "FEEDING"
                                    ? "bg-blue-100 text-blue-800"
                                    : geofence.type === "WATERING"
                                    ? "bg-cyan-100 text-cyan-800"
                                    : "bg-purple-100 text-purple-800"
                                }`}
                              >
                                {geofence.type.replace("_", " ")}
                              </span>
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  geofence.isActive
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              ></span>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Centro:</span>
                            <span className="text-gray-900">
                              {geofence.center.latitude.toFixed(4)},{" "}
                              {geofence.center.longitude.toFixed(4)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Radio:</span>
                            <span className="text-gray-900">
                              {geofence.radius}m
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Violaciones:</span>
                            <span
                              className={`font-medium ${
                                geofence.violations > 0
                                  ? "text-red-600"
                                  : "text-green-600"
                              }`}
                            >
                              {geofence.violations}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Alertas:</span>
                            <span
                              className={`font-medium ${
                                geofence.alertsEnabled
                                  ? "text-green-600"
                                  : "text-gray-600"
                              }`}
                            >
                              {geofence.alertsEnabled
                                ? "Habilitadas"
                                : "Deshabilitadas"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === "analytics" && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    Análisis de Movimiento
                  </h3>

                  {/* Métricas de movimiento */}
                  {locationData.movementPatterns.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Route className="w-6 h-6 text-blue-500" />
                          <h4 className="font-semibold text-gray-900">
                            Distancia Recorrida
                          </h4>
                        </div>
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {locationData.movementPatterns[0].totalDistance} km
                        </div>
                        <p className="text-sm text-gray-600">Hoy</p>
                      </div>

                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <TrendingUp className="w-6 h-6 text-green-500" />
                          <h4 className="font-semibold text-gray-900">
                            Actividad
                          </h4>
                        </div>
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {
                            locationData.movementPatterns[0].healthMetrics
                              .activityLevel
                          }
                        </div>
                        <p className="text-sm text-gray-600">
                          Nivel de actividad
                        </p>
                      </div>

                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Clock className="w-6 h-6 text-purple-500" />
                          <h4 className="font-semibold text-gray-900">
                            Tiempo Pastoreo
                          </h4>
                        </div>
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {Math.round(
                            locationData.movementPatterns[0].healthMetrics
                              .grazingTime / 60
                          )}{" "}
                          h
                        </div>
                        <p className="text-sm text-gray-600">Hoy</p>
                      </div>
                    </div>
                  )}

                  {/* Gráfico simulado de actividad diaria */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      Actividad Diaria
                    </h4>
                    <div className="h-40 bg-gradient-to-r from-blue-100 to-green-100 rounded flex items-end justify-around p-4">
                      {Array.from({ length: 24 }, (_, i) => (
                        <div
                          key={i}
                          className="bg-[#3d8b40] rounded-t"
                          style={{
                            height: `${Math.random() * 80 + 20}%`,
                            width: "3%",
                          }}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>00:00</span>
                      <span>06:00</span>
                      <span>12:00</span>
                      <span>18:00</span>
                      <span>24:00</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Panel lateral de alertas */}
        <AnimatePresence>
          {locationData.alerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="fixed right-4 top-4 w-80 max-h-96 overflow-y-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 z-50"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Alertas</h3>
                <span className="text-sm text-gray-600">
                  {unreadAlerts} sin leer
                </span>
              </div>
              <div className="space-y-3">
                {locationData.alerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismissAlert}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BovineLocation;
