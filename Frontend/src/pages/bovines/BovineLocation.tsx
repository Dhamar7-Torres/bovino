import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Route,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  TrendingUp,
  Bell,
  Radio,
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

// Componente del mapa simulado
const LocationMap = ({
  center,
  locations,
  geofences,
  showRoute,
  showGeofences,
}: {
  center: { latitude: number; longitude: number };
  locations: LocationPoint[];
  geofences: GeofenceArea[];
  showRoute: boolean;
  showGeofences: boolean;
}) => {
  const [mapMode] = useState<"satellite" | "terrain" | "hybrid">(
    "satellite"
  );

  return (
    <div className="relative w-full h-96 bg-gradient-to-br from-green-100 to-green-200 rounded-lg overflow-hidden border-2 border-gray-200">

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
    </div>
  );
};

// Componente para mostrar alertas
const AlertCard = ({
  alert,
  onMarkAsRead,
  onDismiss,
}: {
  alert: BovineLocationData["alerts"][0];
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
}) => {
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
const BovineLocation = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Estados principales
  const [locationData, setLocationData] = useState<BovineLocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"map" | "history" | "analytics">("map");
  const [showRoute, setShowRoute] = useState(true);
  const [showGeofences, setShowGeofences] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<"1h" | "6h" | "24h" | "7d" | "30d">("24h");
  const [availableBovines, setAvailableBovines] = useState<{id: string, name: string, earTag: string}[]>([]);
  const [selectedBovineId, setSelectedBovineId] = useState<string>(id || "1");

  // Cargar datos de ubicación
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Primero cargar lista de bovinos disponibles
        const mockBovines = [
          { id: "1", name: "Lupita", earTag: "MX-001234" },
          { id: "2", name: "Estrella", earTag: "MX-001235" },
          { id: "3", name: "Bella", earTag: "MX-001236" },
          { id: "4", name: "Rosa", earTag: "MX-001237" },
          { id: "5", name: "Luna", earTag: "MX-001238" },
        ];
        setAvailableBovines(mockBovines);

        // Buscar el bovino seleccionado
        const selectedBovine = mockBovines.find(b => b.id === selectedBovineId) || mockBovines[0];

        // Generar datos simulados para el bovino seleccionado
        const mockData: BovineLocationData = {
          bovineId: selectedBovine.id,
          earTag: selectedBovine.earTag,
          name: selectedBovine.name,
          currentLocation: {
            id: "current",
            latitude: 17.9869 + (Math.random() - 0.5) * 0.01,
            longitude: -92.9303 + (Math.random() - 0.5) * 0.01,
            accuracy: 3.5 + Math.random() * 2,
            timestamp: new Date(),
            speed: Math.random() * 0.5,
            heading: Math.random() * 360,
            source: "GPS",
            batteryLevel: 65 + Math.random() * 30,
            signalStrength: 3 + Math.random() * 2,
          },
          lastUpdate: new Date(),
          isTracking: true,
          deviceStatus: {
            batteryLevel: Math.floor(65 + Math.random() * 30),
            signalStrength: Math.floor(3 + Math.random() * 2),
            isOnline: Math.random() > 0.2, // 80% probabilidad de estar online
            deviceId: `GPS-${selectedBovine.earTag}`,
            firmwareVersion: "v2.1.4",
          },
          locationHistory: Array.from({ length: 10 }, (_, i) => ({
            id: `${i + 1}`,
            latitude: 17.9869 + (Math.random() - 0.5) * 0.02,
            longitude: -92.9303 + (Math.random() - 0.5) * 0.02,
            accuracy: 3 + Math.random() * 3,
            timestamp: new Date(Date.now() - i * 600000), // Cada 10 minutos
            source: "GPS" as const,
          })),
          geofences: [
            {
              id: "1",
              name: "Zona Segura Principal",
              type: "SAFE_ZONE",
              center: { latitude: 17.987, longitude: -92.93 },
              radius: 500,
              isActive: true,
              alertsEnabled: true,
              violations: Math.floor(Math.random() * 2),
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
              violations: Math.floor(Math.random() * 5),
              createdAt: new Date("2024-01-20"),
            },
          ],
          movementPatterns: [
            {
              id: "1",
              date: new Date(),
              totalDistance: 1.5 + Math.random() * 2,
              avgSpeed: 0.2 + Math.random() * 0.3,
              maxSpeed: 0.8 + Math.random() * 0.8,
              timeInMovement: 120 + Math.random() * 240,
              timeStationary: 1000 + Math.random() * 400,
              areasVisited: ["Zona Segura Principal", "Zona de Alimentación"],
              healthMetrics: {
                activityLevel: ["LOW", "MODERATE", "HIGH"][Math.floor(Math.random() * 3)] as any,
                behaviorPattern: ["NORMAL", "RESTLESS", "LETHARGIC"][Math.floor(Math.random() * 3)] as any,
                grazingTime: 300 + Math.random() * 300,
                restingTime: 600 + Math.random() * 400,
              },
            },
          ],
          alerts: Math.random() > 0.5 ? [
            {
              id: "1",
              type: ["LOW_BATTERY", "GEOFENCE_VIOLATION", "DEVICE_OFFLINE", "UNUSUAL_MOVEMENT"][Math.floor(Math.random() * 4)] as any,
              message: `Alerta para ${selectedBovine.name} (${selectedBovine.earTag})`,
              severity: ["INFO", "WARNING", "CRITICAL"][Math.floor(Math.random() * 3)] as any,
              timestamp: new Date(Date.now() - Math.random() * 3600000),
              isRead: Math.random() > 0.5,
            },
          ] : [],
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
  }, [selectedBovineId]); // Recargar cuando cambie el bovino seleccionado

  // Actualizar coordenadas cuando cambie locationData
  useEffect(() => {
    if (locationData?.currentLocation) {
      setManualCoordinates({
        latitude: locationData.currentLocation.latitude,
        longitude: locationData.currentLocation.longitude,
      });
    }
  }, [locationData?.currentLocation]);

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

  // Estados para ubicación manual
  const [showManualLocation, setShowManualLocation] = useState(false);
  const [manualCoordinates, setManualCoordinates] = useState({
    latitude: locationData?.currentLocation.latitude || 17.9869,
    longitude: locationData?.currentLocation.longitude || -92.9303,
  });

  // Manejar ubicación manual
  const handleManualLocationSubmit = () => {
    const newLocation: LocationPoint = {
      id: Date.now().toString(),
      latitude: manualCoordinates.latitude,
      longitude: manualCoordinates.longitude,
      accuracy: 0, // Manual no tiene precisión GPS
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
    setShowManualLocation(false);
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

  const unreadAlerts = locationData.alerts.filter((alert) => !alert.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header con navegación */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
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
                  locationData.deviceStatus.isOnline ? "bg-green-400" : "bg-red-400"
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
                {unreadAlerts > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                    {unreadAlerts}
                  </span>
                )}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ubicación de {locationData.name || locationData.earTag}
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-6">
            Seguimiento GPS en tiempo real y gestión de geofencing
          </p>
          
          {/* Selector de bovino */}
          <div className="flex justify-center">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <label className="block text-sm font-medium text-white mb-2">
                Seleccionar Bovino para Rastrear:
              </label>
              <select
                value={selectedBovineId}
                onChange={(e) => setSelectedBovineId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent bg-white text-gray-900 min-w-[250px]"
              >
                {availableBovines.map((bovine) => (
                  <option key={bovine.id} value={bovine.id}>
                    {bovine.name} ({bovine.earTag})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Navegación por pestañas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#fffdf8]/90 backdrop-blur-sm rounded-t-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "map", label: "Mapa en Vivo" },
                { id: "history", label: "Historial" },
                { id: "analytics", label: "Análisis" },
              ].map((tab) => {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-[#3d8b40] text-[#3d8b40]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
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
                        onClick={() => setShowManualLocation(!showManualLocation)}
                        className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                      >
                        Ubicación Manual
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

                  {/* Panel de ubicación manual */}
                  <AnimatePresence>
                    {showManualLocation && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-6 bg-white border border-gray-300 rounded-lg p-4"
                      >
                        <h4 className="font-medium text-gray-900 mb-4">Ubicación Manual</h4>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Latitud
                            </label>
                            <input
                              type="number"
                              step="0.000001"
                              value={manualCoordinates.latitude}
                              onChange={(e) =>
                                setManualCoordinates((prev) => ({
                                  ...prev,
                                  latitude: parseFloat(e.target.value) || 0,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
                              placeholder="17.9869"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Longitud
                            </label>
                            <input
                              type="number"
                              step="0.000001"
                              value={manualCoordinates.longitude}
                              onChange={(e) =>
                                setManualCoordinates((prev) => ({
                                  ...prev,
                                  longitude: parseFloat(e.target.value) || 0,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
                              placeholder="-92.9303"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={getCurrentLocation}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                          >
                            Usar Ubicación Actual
                          </button>
                          <button
                            onClick={handleManualLocationSubmit}
                            className="flex-1 px-4 py-2 bg-[#3d8b40] text-white rounded hover:bg-[#2d6e30] transition-colors text-sm"
                          >
                            Confirmar Ubicación
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 text-center mt-2">
                          📍 Tabasco, México (coordenadas por defecto)
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Información de la ubicación actual */}
                  <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      Ubicación Actual
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Latitud:</span>
                        <p className="text-gray-900">
                          {locationData.currentLocation.latitude.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Longitud:</span>
                        <p className="text-gray-900">
                          {locationData.currentLocation.longitude.toFixed(6)}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Precisión:</span>
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
                      {(["1h", "6h", "24h", "7d", "30d"] as const).map((range) => (
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
                      ))}
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
                                  {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {location.timestamp.toLocaleString("es-MX")} • Precisión:{" "}
                                  {location.accuracy.toFixed(1)}m • Fuente: {location.source}
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
                          <h4 className="font-semibold text-gray-900">Distancia Recorrida</h4>
                        </div>
                        <div className="text-3xl font-bold text-blue-600 mb-1">
                          {locationData.movementPatterns[0].totalDistance} km
                        </div>
                        <p className="text-sm text-gray-600">Hoy</p>
                      </div>

                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <TrendingUp className="w-6 h-6 text-green-500" />
                          <h4 className="font-semibold text-gray-900">Actividad</h4>
                        </div>
                        <div className="text-3xl font-bold text-green-600 mb-1">
                          {locationData.movementPatterns[0].healthMetrics.activityLevel}
                        </div>
                        <p className="text-sm text-gray-600">Nivel de actividad</p>
                      </div>

                      <div className="bg-white rounded-lg p-6 border border-gray-200">
                        <div className="flex items-center gap-3 mb-3">
                          <Clock className="w-6 h-6 text-purple-500" />
                          <h4 className="font-semibold text-gray-900">Tiempo Pastoreo</h4>
                        </div>
                        <div className="text-3xl font-bold text-purple-600 mb-1">
                          {Math.round(
                            locationData.movementPatterns[0].healthMetrics.grazingTime / 60
                          )}{" "}
                          h
                        </div>
                        <p className="text-sm text-gray-600">Hoy</p>
                      </div>
                    </div>
                  )}

                  {/* Gráfico simulado de actividad diaria */}
                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-4">Actividad Diaria</h4>
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
                <span className="text-sm text-gray-600">{unreadAlerts} sin leer</span>
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
      </div>
    </div>
  );
};

export default BovineLocation;