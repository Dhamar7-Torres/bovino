import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  Users,
  Signal,
  Maximize2,
  Minimize2,
  Search,
  X,
  AlertTriangle,
  CheckCircle,
  Radio,
  Target,
  Route,
  Heart,
  RefreshCw,
} from "lucide-react";

// Declaración global para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

// Interfaces principales para ubicación del ganado
interface LivestockLocationProps {
  className?: string;
}

interface AnimalLocation {
  id: string;
  earTag: string;
  name?: string;
  breed: string;
  age: number;
  weight: number;
  sex: "male" | "female";

  // Ubicación actual
  currentLocation: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy: number;
    timestamp: Date;
    speed?: number; // km/h
    heading?: number; // grados (0-360)
  };

  // Estado del dispositivo GPS
  deviceInfo: {
    deviceId: string;
    batteryLevel: number; // porcentaje (0-100)
    signalStrength: number; // porcentaje (0-100)
    isOnline: boolean;
    lastSeen: Date;
    firmwareVersion: string;
    deviceType: "collar" | "ear_tag" | "implant" | "anklet";
  };

  // Estado de salud y actividad
  healthStatus: {
    temperature: number; // °C
    heartRate: number; // bpm
    activityLevel: "low" | "moderate" | "high" | "resting";
    stressLevel: "low" | "medium" | "high";
    isHealthy: boolean;
    lastHealthCheck: Date;
  };

  // Comportamiento y patrones
  behaviorPatterns: {
    averageSpeed: number; // km/h
    dailyDistance: number; // km
    timeGrazing: number; // horas por día
    timeResting: number; // horas por día
    socialBehavior: "solitary" | "group" | "leader";
    preferredAreas: string[]; // IDs de zonas preferidas
  };

  // Historial de ubicaciones
  locationHistory: LocationPoint[];

  // Alertas activas
  alerts: AnimalAlert[];
}

interface LocationPoint {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  accuracy: number;
  speed?: number;
  activity: "grazing" | "walking" | "running" | "resting" | "drinking";
  temperature?: number;
  heartRate?: number;
}

interface AnimalAlert {
  id: string;
  type:
    | "geofence_violation"
    | "health_anomaly"
    | "device_offline"
    | "battery_low"
    | "unusual_behavior"
    | "emergency";
  severity: "info" | "warning" | "critical" | "emergency";
  message: string;
  timestamp: Date;
  isRead: boolean;
  isResolved: boolean;
  location?: {
    latitude: number;
    longitude: number;
  };
}

interface Geofence {
  id: string;
  name: string;
  type:
    | "safe_zone"
    | "restricted"
    | "feeding"
    | "watering"
    | "medical"
    | "breeding";
  center: { latitude: number; longitude: number };
  radius: number; // metros
  isActive: boolean;
  alertsEnabled: boolean;
  animalsInside: string[]; // IDs de animales dentro
  entryExitLog: {
    animalId: string;
    action: "enter" | "exit";
    timestamp: Date;
  }[];
}

interface LivestockGroup {
  id: string;
  name: string;
  animalIds: string[];
  groupType: "herd" | "breeding_group" | "medical_group" | "custom";
  leader?: string; // ID del animal líder
  averageLocation: {
    latitude: number;
    longitude: number;
  };
  cohesion: number; // porcentaje de cohesión del grupo (0-100)
  isTracked: boolean;
}

interface MapControls {
  showAnimals: boolean;
  showTrails: boolean;
  showGeofences: boolean;
  showGroups: boolean;
  showAlerts: boolean;
  showHealthStatus: boolean;
  realTimeTracking: boolean;
  selectedFilter: "all" | "healthy" | "alerts" | "offline" | "low_battery";
  viewMode: "individual" | "groups" | "heatmap" | "activity";
  timeRange: "1h" | "6h" | "24h" | "7d" | "30d";
}

// Función utilitaria para concatenar clases CSS
const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Datos de ejemplo para ganado (ubicación Villahermosa, Tabasco)
const SAMPLE_ANIMALS: AnimalLocation[] = [
  {
    id: "animal-1",
    earTag: "COW-001",
    name: "Esperanza",
    breed: "Holstein",
    age: 4,
    weight: 550,
    sex: "female",
    currentLocation: {
      latitude: 17.9892,
      longitude: -92.9467,
      altitude: 12,
      accuracy: 3.2,
      timestamp: new Date(),
      speed: 2.1,
      heading: 145,
    },
    deviceInfo: {
      deviceId: "GPS-COL-001",
      batteryLevel: 78,
      signalStrength: 92,
      isOnline: true,
      lastSeen: new Date(),
      firmwareVersion: "2.1.4",
      deviceType: "collar",
    },
    healthStatus: {
      temperature: 38.9,
      heartRate: 72,
      activityLevel: "moderate",
      stressLevel: "low",
      isHealthy: true,
      lastHealthCheck: new Date("2024-12-10"),
    },
    behaviorPatterns: {
      averageSpeed: 1.8,
      dailyDistance: 4.2,
      timeGrazing: 8.5,
      timeResting: 12.0,
      socialBehavior: "group",
      preferredAreas: ["pasture-1", "water-source-1"],
    },
    locationHistory: [
      {
        id: "loc-1",
        latitude: 17.989,
        longitude: -92.9465,
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        accuracy: 3.1,
        speed: 1.5,
        activity: "grazing",
        temperature: 38.8,
        heartRate: 70,
      },
    ],
    alerts: [],
  },
  {
    id: "animal-2",
    earTag: "BULL-001",
    name: "Toro Bravo",
    breed: "Brahman",
    age: 6,
    weight: 850,
    sex: "male",
    currentLocation: {
      latitude: 17.9895,
      longitude: -92.9472,
      altitude: 11,
      accuracy: 2.8,
      timestamp: new Date(),
      speed: 0.5,
      heading: 90,
    },
    deviceInfo: {
      deviceId: "GPS-COL-002",
      batteryLevel: 23,
      signalStrength: 88,
      isOnline: true,
      lastSeen: new Date(),
      firmwareVersion: "2.1.4",
      deviceType: "collar",
    },
    healthStatus: {
      temperature: 39.2,
      heartRate: 65,
      activityLevel: "low",
      stressLevel: "medium",
      isHealthy: true,
      lastHealthCheck: new Date("2024-12-08"),
    },
    behaviorPatterns: {
      averageSpeed: 1.2,
      dailyDistance: 2.8,
      timeGrazing: 6.0,
      timeResting: 16.0,
      socialBehavior: "solitary",
      preferredAreas: ["pasture-2"],
    },
    locationHistory: [],
    alerts: [
      {
        id: "alert-1",
        type: "battery_low",
        severity: "warning",
        message: "Batería del dispositivo GPS baja (23%)",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
        isResolved: false,
        location: {
          latitude: 17.9895,
          longitude: -92.9472,
        },
      },
    ],
  },
  {
    id: "animal-3",
    earTag: "COW-002",
    name: "Luna",
    breed: "Jersey",
    age: 3,
    weight: 420,
    sex: "female",
    currentLocation: {
      latitude: 17.9888,
      longitude: -92.9463,
      altitude: 13,
      accuracy: 4.1,
      timestamp: new Date(),
      speed: 3.2,
      heading: 220,
    },
    deviceInfo: {
      deviceId: "GPS-TAG-003",
      batteryLevel: 91,
      signalStrength: 76,
      isOnline: false,
      lastSeen: new Date(Date.now() - 15 * 60 * 1000),
      firmwareVersion: "2.0.8",
      deviceType: "ear_tag",
    },
    healthStatus: {
      temperature: 40.1,
      heartRate: 95,
      activityLevel: "high",
      stressLevel: "high",
      isHealthy: false,
      lastHealthCheck: new Date("2024-12-12"),
    },
    behaviorPatterns: {
      averageSpeed: 2.1,
      dailyDistance: 5.8,
      timeGrazing: 7.2,
      timeResting: 10.5,
      socialBehavior: "group",
      preferredAreas: ["pasture-1", "pasture-3"],
    },
    locationHistory: [],
    alerts: [
      {
        id: "alert-2",
        type: "health_anomaly",
        severity: "critical",
        message:
          "Temperatura corporal elevada (40.1°C) - Revisar inmediatamente",
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        isRead: false,
        isResolved: false,
        location: {
          latitude: 17.9888,
          longitude: -92.9463,
        },
      },
      {
        id: "alert-3",
        type: "device_offline",
        severity: "warning",
        message: "Dispositivo GPS fuera de línea desde hace 15 minutos",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        isRead: false,
        isResolved: false,
      },
    ],
  },
];

const SAMPLE_GEOFENCES: Geofence[] = [
  {
    id: "geo-1",
    name: "Zona Segura Principal",
    type: "safe_zone",
    center: { latitude: 17.9892, longitude: -92.9467 },
    radius: 200,
    isActive: true,
    alertsEnabled: true,
    animalsInside: ["animal-1", "animal-2"],
    entryExitLog: [],
  },
  {
    id: "geo-2",
    name: "Área de Agua",
    type: "watering",
    center: { latitude: 17.9885, longitude: -92.946 },
    radius: 50,
    isActive: true,
    alertsEnabled: false,
    animalsInside: [],
    entryExitLog: [],
  },
];

const SAMPLE_GROUPS: LivestockGroup[] = [
  {
    id: "group-1",
    name: "Grupo Lechero A",
    animalIds: ["animal-1", "animal-3"],
    groupType: "herd",
    leader: "animal-1",
    averageLocation: {
      latitude: 17.989,
      longitude: -92.9465,
    },
    cohesion: 85,
    isTracked: true,
  },
];

// Componente de mapa simulado para ganado
const LivestockSimulatedMap: React.FC<{
  animals: AnimalLocation[];
  geofences: Geofence[];
  groups: LivestockGroup[];
  controls: MapControls;
  onAnimalClick: (animal: AnimalLocation) => void;
}> = ({ animals, geofences, controls, onAnimalClick }) => {
  // Función para obtener color del animal según su estado
  const getAnimalColor = (animal: AnimalLocation) => {
    if (!animal.deviceInfo.isOnline) return "#6b7280"; // gris - offline
    if (!animal.healthStatus.isHealthy) return "#ef4444"; // rojo - enfermo
    if (animal.deviceInfo.batteryLevel < 20) return "#f59e0b"; // amarillo - batería baja
    if (animal.alerts.some((a) => a.severity === "critical")) return "#dc2626"; // rojo oscuro - crítico
    if (animal.alerts.some((a) => a.severity === "warning")) return "#f97316"; // naranja - advertencia
    return "#22c55e"; // verde - normal
  };

  // Función para obtener el ícono del animal
  const getAnimalIcon = (animal: AnimalLocation) => {
    if (!animal.deviceInfo.isOnline)
      return <Radio className="w-3 h-3 text-white" />;
    if (!animal.healthStatus.isHealthy)
      return <Heart className="w-3 h-3 text-white" />;
    if (animal.alerts.length > 0)
      return <AlertTriangle className="w-3 h-3 text-white" />;
    return <CheckCircle className="w-3 h-3 text-white" />;
  };

  // Función para filtrar animales según el filtro seleccionado
  const getFilteredAnimals = () => {
    switch (controls.selectedFilter) {
      case "healthy":
        return animals.filter(
          (a) => a.healthStatus.isHealthy && a.deviceInfo.isOnline
        );
      case "alerts":
        return animals.filter((a) => a.alerts.length > 0);
      case "offline":
        return animals.filter((a) => !a.deviceInfo.isOnline);
      case "low_battery":
        return animals.filter((a) => a.deviceInfo.batteryLevel < 30);
      default:
        return animals;
    }
  };

  const filteredAnimals = getFilteredAnimals();

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden rounded-lg">
      {/* Fondo del mapa simulado */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M11 18c3.866 0 7-3.133 7-7s-3.134-7-7-7-7 3.133-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.133 7-7s-3.134-7-7-7-7 3.133-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Título del mapa */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-[#2d5a45]">
            Ubicación del Ganado - Tiempo Real
          </span>
          {controls.realTimeTracking && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>LIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Renderizado de geofences */}
      {controls.showGeofences &&
        geofences.map((geofence, index) => (
          <motion.div
            key={geofence.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="absolute rounded-full border-2 border-dashed pointer-events-none"
            style={{
              left: `${25 + index * 20}%`,
              top: `${30 + index * 15}%`,
              width: `${geofence.radius / 5}px`,
              height: `${geofence.radius / 5}px`,
              borderColor:
                geofence.type === "safe_zone"
                  ? "#22c55e"
                  : geofence.type === "watering"
                  ? "#3b82f6"
                  : geofence.type === "restricted"
                  ? "#ef4444"
                  : "#6b7280",
              backgroundColor:
                geofence.type === "safe_zone"
                  ? "#22c55e20"
                  : geofence.type === "watering"
                  ? "#3b82f620"
                  : geofence.type === "restricted"
                  ? "#ef444420"
                  : "#6b728020",
            }}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-gray-700 whitespace-nowrap shadow-sm">
              {geofence.name}
            </div>
          </motion.div>
        ))}

      {/* Renderizado de animales */}
      {controls.showAnimals &&
        filteredAnimals.map((animal, index) => (
          <motion.div
            key={animal.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="absolute cursor-pointer hover:scale-110 transition-all duration-200 group"
            style={{
              left: `${20 + index * 25}%`,
              top: `${25 + index * 20}%`,
            }}
            onClick={() => onAnimalClick(animal)}
          >
            {/* Marcador del animal */}
            <div
              className="relative"
              style={{
                transform: `rotate(${animal.currentLocation.heading || 0}deg)`,
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-3 border-white relative"
                style={{ backgroundColor: getAnimalColor(animal) }}
              >
                {getAnimalIcon(animal)}

                {/* Indicador de batería */}
                <div className="absolute -top-1 -right-1 w-4 h-2 bg-white rounded-sm border">
                  <div
                    className="h-full rounded-sm"
                    style={{
                      width: `${animal.deviceInfo.batteryLevel}%`,
                      backgroundColor:
                        animal.deviceInfo.batteryLevel > 50
                          ? "#22c55e"
                          : animal.deviceInfo.batteryLevel > 20
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  />
                </div>

                {/* Indicador de señal */}
                <div className="absolute -bottom-1 -right-1">
                  <Signal
                    className="w-3 h-3 text-white"
                    style={{
                      opacity: animal.deviceInfo.signalStrength / 100,
                    }}
                  />
                </div>
              </div>

              {/* Dirección de movimiento */}
              {animal.currentLocation.speed &&
                animal.currentLocation.speed > 0.5 && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
                    <div className="w-0 h-0 border-l-2 border-r-2 border-b-4 border-transparent border-b-current text-blue-500" />
                  </div>
                )}
            </div>

            {/* Información del animal */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-[#2d5a45] whitespace-nowrap shadow-sm">
              {animal.earTag}
            </div>

            {/* Trail de movimiento */}
            {controls.showTrails && animal.locationHistory.length > 0 && (
              <div className="absolute top-6 left-6 pointer-events-none">
                {animal.locationHistory.slice(-5).map((point, i) => (
                  <div
                    key={point.id}
                    className="absolute w-2 h-2 bg-blue-400 rounded-full"
                    style={{
                      left: `${i * 8}px`,
                      top: `${i * 6}px`,
                      opacity: 0.3 + i * 0.15,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Tooltip expandido al hover */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black/90 text-white text-xs rounded px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              <div className="space-y-1">
                <div className="font-medium">
                  {animal.name || animal.earTag}
                </div>
                <div>
                  {animal.breed} • {animal.age} años
                </div>
                <div>Actividad: {animal.healthStatus.activityLevel}</div>
                <div>Temp: {animal.healthStatus.temperature}°C</div>
                <div>Batería: {animal.deviceInfo.batteryLevel}%</div>
                {animal.currentLocation.speed && (
                  <div>Velocidad: {animal.currentLocation.speed} km/h</div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

      {/* Indicador de estadísticas */}
      <div className="absolute bottom-16 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
        <div className="space-y-2 text-xs">
          <div className="font-semibold text-[#2d5a45] mb-2">
            Estado del Rebaño
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Total:</span>
            <span className="font-medium">{animals.length} animales</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Online:</span>
            <span className="font-medium text-green-600">
              {animals.filter((a) => a.deviceInfo.isOnline).length}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Alertas:</span>
            <span className="font-medium text-red-600">
              {animals.filter((a) => a.alerts.length > 0).length}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span>Batería Baja:</span>
            <span className="font-medium text-yellow-600">
              {animals.filter((a) => a.deviceInfo.batteryLevel < 30).length}
            </span>
          </div>
        </div>
      </div>

      {/* Indicador de mapa simulado */}
      <div className="absolute bottom-4 left-4 bg-blue-500/10 border border-blue-500 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>GPS Tracking - Desarrollo</span>
        </div>
      </div>
    </div>
  );
};

export const LivestockLocation: React.FC<LivestockLocationProps> = ({
  className,
}) => {
  // Estados principales del componente
  const [animals] = useState<AnimalLocation[]>(SAMPLE_ANIMALS);
  const [geofences] = useState<Geofence[]>(SAMPLE_GEOFENCES);
  const [groups] = useState<LivestockGroup[]>(SAMPLE_GROUPS);
  const [mapControls, setMapControls] = useState<MapControls>({
    showAnimals: true,
    showTrails: true,
    showGeofences: true,
    showGroups: false,
    showAlerts: true,
    showHealthStatus: true,
    realTimeTracking: true,
    selectedFilter: "all",
    viewMode: "individual",
    timeRange: "24h",
  });

  // Estados para interacciones del mapa
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalLocation | null>(
    null
  );
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  // Referencias
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Coordenadas del centro del área de pastoreo (Villahermosa, Tabasco)
  const LIVESTOCK_CENTER: [number, number] = [17.989, -92.9465];

  // Verificar si Leaflet está disponible
  useEffect(() => {
    const checkLeaflet = () => {
      if (typeof window !== "undefined" && window.L) {
        setIsLeafletLoaded(true);
        initializeMap();
      } else {
        console.log("🗺️ Leaflet no disponible, usando mapa simulado de ganado");
      }
    };

    checkLeaflet();

    // Intentar cargar Leaflet si no está disponible
    if (!isLeafletLoaded) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = checkLeaflet;
      document.head.appendChild(script);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
      }
    };
  }, []);

  // Simulación de actualizaciones en tiempo real
  useEffect(() => {
    if (!mapControls.realTimeTracking) return;

    const interval = setInterval(() => {
      // Aquí se simularían las actualizaciones GPS en tiempo real
      console.log("📡 Actualizando ubicaciones GPS...");
    }, 30000); // Actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [mapControls.realTimeTracking]);

  // Inicializar mapa de Leaflet para ganado
  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    try {
      const map = window.L.map(mapRef.current, {
        center: LIVESTOCK_CENTER,
        zoom: 17,
        zoomControl: true,
        attributionControl: true,
      });

      // Agregar capa de tiles híbrida para mejor visualización del ganado
      window.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri",
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstance.current = map;

      // Agregar elementos del ganado al mapa
      addLivestockToMap(map);

      console.log("✅ Mapa de Leaflet para ganado inicializado correctamente");
    } catch (error) {
      console.error("❌ Error inicializando mapa de ganado:", error);
    }
  };

  // Agregar ganado al mapa de Leaflet
  const addLivestockToMap = (map: any) => {
    if (!map || !window.L) return;

    // Agregar geofences
    if (mapControls.showGeofences) {
      geofences.forEach((geofence) => {
        const circle = window.L.circle(
          [geofence.center.latitude, geofence.center.longitude],
          {
            radius: geofence.radius,
            color: getGeofenceColor(geofence.type),
            fillColor: getGeofenceColor(geofence.type),
            fillOpacity: 0.2,
            weight: 2,
            dashArray: "5,5",
          }
        ).addTo(map);

        circle.bindPopup(`
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 4px 0; color: #2d5a45; font-weight: bold;">${
              geofence.name
            }</h4>
            <p style="margin: 0; text-transform: capitalize;">${getGeofenceTypeText(
              geofence.type
            )}</p>
            <p style="margin: 4px 0 0 0;">Radio: ${geofence.radius}m</p>
            <p style="margin: 0;">Animales dentro: ${
              geofence.animalsInside.length
            }</p>
            <p style="margin: 0; color: ${
              geofence.isActive ? "#059669" : "#dc2626"
            };">
              ${geofence.isActive ? "Activa" : "Inactiva"}
            </p>
          </div>
        `);
      });
    }

    // Agregar animales
    if (mapControls.showAnimals) {
      animals.forEach((animal) => {
        const marker = window.L.marker([
          animal.currentLocation.latitude,
          animal.currentLocation.longitude,
        ]).addTo(map);

        marker.bindPopup(`
          <div style="padding: 12px; min-width: 280px;">
            <h3 style="margin: 0 0 8px 0; color: #2d5a45; font-weight: bold;">
              ${animal.name || animal.earTag}
            </h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0;">
              <div><strong>Raza:</strong> ${animal.breed}</div>
              <div><strong>Edad:</strong> ${animal.age} años</div>
              <div><strong>Peso:</strong> ${animal.weight} kg</div>
              <div><strong>Sexo:</strong> ${
                animal.sex === "male" ? "Macho" : "Hembra"
              }</div>
            </div>
            <div style="margin: 8px 0; padding: 6px; background: ${
              animal.healthStatus.isHealthy ? "#f0fdf4" : "#fef2f2"
            }; border-radius: 4px;">
              <strong>Estado de Salud:</strong> ${
                animal.healthStatus.isHealthy
                  ? "Saludable"
                  : "Requiere Atención"
              }<br>
              <small>Temp: ${animal.healthStatus.temperature}°C | FC: ${
          animal.healthStatus.heartRate
        } bpm</small>
            </div>
            <div style="margin: 8px 0;">
              <strong>Dispositivo:</strong> ${animal.deviceInfo.deviceType.replace(
                "_",
                " "
              )}<br>
              <small>Batería: ${animal.deviceInfo.batteryLevel}% | Señal: ${
          animal.deviceInfo.signalStrength
        }%</small>
            </div>
            ${
              animal.alerts.length > 0
                ? `<div style="margin-top: 8px; padding: 6px; background: #fef2f2; border-radius: 4px; color: #dc2626;">
                <strong>⚠️ ${animal.alerts.length} Alerta(s) Activa(s)</strong>
              </div>`
                : ""
            }
          </div>
        `);

        marker.on("click", () => setSelectedAnimal(animal));

        // Agregar trail si está habilitado
        if (mapControls.showTrails && animal.locationHistory.length > 0) {
          const trailCoords = animal.locationHistory.map((point) => [
            point.latitude,
            point.longitude,
          ]);
          trailCoords.push([
            animal.currentLocation.latitude,
            animal.currentLocation.longitude,
          ]);

          window.L.polyline(trailCoords, {
            color: getAnimalStatusColor(animal),
            weight: 3,
            opacity: 0.7,
            dashArray: "5,5",
          }).addTo(map);
        }
      });
    }
  };

  // Funciones auxiliares para obtener colores y textos
  const getGeofenceColor = (type: string) => {
    switch (type) {
      case "safe_zone":
        return "#22c55e";
      case "watering":
        return "#3b82f6";
      case "feeding":
        return "#f59e0b";
      case "restricted":
        return "#ef4444";
      case "medical":
        return "#8b5cf6";
      case "breeding":
        return "#ec4899";
      default:
        return "#6b7280";
    }
  };

  const getGeofenceTypeText = (type: string) => {
    switch (type) {
      case "safe_zone":
        return "Zona Segura";
      case "watering":
        return "Área de Agua";
      case "feeding":
        return "Área de Alimentación";
      case "restricted":
        return "Zona Restringida";
      case "medical":
        return "Área Médica";
      case "breeding":
        return "Área de Reproducción";
      default:
        return type;
    }
  };

  const getAnimalStatusColor = (animal: AnimalLocation) => {
    if (!animal.deviceInfo.isOnline) return "#6b7280";
    if (!animal.healthStatus.isHealthy) return "#ef4444";
    if (animal.alerts.some((a) => a.severity === "critical")) return "#dc2626";
    if (animal.alerts.some((a) => a.severity === "warning")) return "#f97316";
    return "#22c55e";
  };

  // Funciones para el manejo de controles
  const toggleMapControl = (control: keyof MapControls) => {
    if (control === "realTimeTracking") {
      setMapControls((prev) => ({
        ...prev,
        [control]: !prev[control],
      }));
      return;
    }

    setMapControls((prev) => ({
      ...prev,
      [control]: !prev[control],
    }));
  };

  const setFilter = (
    filter: "all" | "healthy" | "alerts" | "offline" | "low_battery"
  ) => {
    setMapControls((prev) => ({
      ...prev,
      selectedFilter: filter,
    }));
  };

  // Función para filtrar animales según la búsqueda
  const filteredAnimals = animals.filter(
    (animal) =>
      animal.earTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (animal.name &&
        animal.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      animal.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Obtener alertas críticas
  const criticalAlerts = animals.flatMap((a) =>
    a.alerts.filter(
      (alert) => alert.severity === "critical" || alert.severity === "emergency"
    )
  );

  // Animaciones para los controles
  const controlsVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  const panelVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <div
      className={cn(
        "relative w-full h-screen overflow-hidden",
        // Fondo degradado principal del layout
        "bg-gradient-to-br from-[#F5F5DC] via-[#E8E8C8] to-[#D3D3B8]",
        isFullscreen ? "fixed inset-0 z-50" : "h-[600px]",
        className
      )}
    >
      {/* Panel de controles lateral */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={controlsVariants}
        className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[320px]"
      >
        {/* Título del mapa */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2d5a45] flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Ubicación del Ganado
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleMapControl("realTimeTracking")}
              className={cn(
                "p-2 rounded-md transition-colors",
                mapControls.realTimeTracking
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              )}
              title="Seguimiento en tiempo real"
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4",
                  mapControls.realTimeTracking && "animate-spin"
                )}
              />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Alertas críticas */}
        {criticalAlerts.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">
                Alertas Críticas ({criticalAlerts.length})
              </span>
            </div>
            <div className="space-y-1 text-sm text-red-600">
              {criticalAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id}>• {alert.message}</div>
              ))}
              {criticalAlerts.length > 2 && (
                <div className="text-xs">
                  + {criticalAlerts.length - 2} más...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Barra de búsqueda */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por arete, nombre o raza..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
          />
        </div>

        {/* Filtros rápidos */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Filtros</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "px-3 py-2 text-xs rounded-md transition-colors",
                mapControls.selectedFilter === "all"
                  ? "bg-[#519a7c] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Todos ({animals.length})
            </button>
            <button
              onClick={() => setFilter("alerts")}
              className={cn(
                "px-3 py-2 text-xs rounded-md transition-colors",
                mapControls.selectedFilter === "alerts"
                  ? "bg-[#519a7c] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Con Alertas ({animals.filter((a) => a.alerts.length > 0).length})
            </button>
            <button
              onClick={() => setFilter("offline")}
              className={cn(
                "px-3 py-2 text-xs rounded-md transition-colors",
                mapControls.selectedFilter === "offline"
                  ? "bg-[#519a7c] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Sin Conexión (
              {animals.filter((a) => !a.deviceInfo.isOnline).length})
            </button>
            <button
              onClick={() => setFilter("low_battery")}
              className={cn(
                "px-3 py-2 text-xs rounded-md transition-colors",
                mapControls.selectedFilter === "low_battery"
                  ? "bg-[#519a7c] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Batería Baja (
              {animals.filter((a) => a.deviceInfo.batteryLevel < 30).length})
            </button>
          </div>
        </div>

        {/* Controles de visibilidad */}
        <div className="space-y-3 mb-4">
          <h3 className="text-sm font-medium text-gray-700">Mostrar en Mapa</h3>

          {/* Control de animales */}
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Animales
            </span>
            <input
              type="checkbox"
              checked={mapControls.showAnimals}
              onChange={() => toggleMapControl("showAnimals")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>

          {/* Control de trails */}
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Route className="w-4 h-4 text-purple-600" />
              Trayectorias
            </span>
            <input
              type="checkbox"
              checked={mapControls.showTrails}
              onChange={() => toggleMapControl("showTrails")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>

          {/* Control de geofences */}
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Target className="w-4 h-4 text-orange-600" />
              Geo-cercas
            </span>
            <input
              type="checkbox"
              checked={mapControls.showGeofences}
              onChange={() => toggleMapControl("showGeofences")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>

          {/* Control de grupos */}
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-green-600" />
              Grupos
            </span>
            <input
              type="checkbox"
              checked={mapControls.showGroups}
              onChange={() => toggleMapControl("showGroups")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>
        </div>

        {/* Estadísticas rápidas */}
        <div className="border-t pt-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Estado General
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-green-50 p-2 rounded">
              <div className="text-green-700 font-medium">Online</div>
              <div className="text-green-900 font-bold">
                {animals.filter((a) => a.deviceInfo.isOnline).length}/
                {animals.length}
              </div>
            </div>
            <div className="bg-blue-50 p-2 rounded">
              <div className="text-blue-700 font-medium">Saludables</div>
              <div className="text-blue-900 font-bold">
                {animals.filter((a) => a.healthStatus.isHealthy).length}/
                {animals.length}
              </div>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="text-red-700 font-medium">Alertas</div>
              <div className="text-red-900 font-bold">
                {animals.filter((a) => a.alerts.length > 0).length}
              </div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="text-yellow-700 font-medium">Batería Baja</div>
              <div className="text-yellow-900 font-bold">
                {animals.filter((a) => a.deviceInfo.batteryLevel < 30).length}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Panel de información del animal seleccionado */}
      <AnimatePresence>
        {selectedAnimal && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[380px] max-w-[450px] max-h-[calc(100vh-2rem)] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#2d5a45]">
                Información del Animal
              </h3>
              <button
                onClick={() => setSelectedAnimal(null)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Header del animal */}
              <div className="border-b pb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-[#2d5a45] text-lg">
                    {selectedAnimal.name || selectedAnimal.earTag}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-sm font-medium",
                        selectedAnimal.healthStatus.isHealthy
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      )}
                    >
                      {selectedAnimal.healthStatus.isHealthy
                        ? "Saludable"
                        : "Requiere Atención"}
                    </span>
                    <div
                      className={cn(
                        "w-3 h-3 rounded-full",
                        selectedAnimal.deviceInfo.isOnline
                          ? "bg-green-500"
                          : "bg-red-500"
                      )}
                    ></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
                  <span>Arete: {selectedAnimal.earTag}</span>
                  <span>Raza: {selectedAnimal.breed}</span>
                  <span>Edad: {selectedAnimal.age} años</span>
                  <span>Peso: {selectedAnimal.weight} kg</span>
                </div>
              </div>

              {/* Ubicación actual */}
              <div>
                <h5 className="font-medium text-[#2d5a45] mb-2">
                  Ubicación Actual
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Latitud:</span>
                    <p className="font-medium">
                      {selectedAnimal.currentLocation.latitude.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Longitud:</span>
                    <p className="font-medium">
                      {selectedAnimal.currentLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Precisión:</span>
                    <p className="font-medium">
                      {selectedAnimal.currentLocation.accuracy} m
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Última actualización:</span>
                    <p className="font-medium">
                      {selectedAnimal.currentLocation.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                  {selectedAnimal.currentLocation.speed && (
                    <>
                      <div>
                        <span className="text-gray-500">Velocidad:</span>
                        <p className="font-medium">
                          {selectedAnimal.currentLocation.speed} km/h
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Dirección:</span>
                        <p className="font-medium">
                          {selectedAnimal.currentLocation.heading}°
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Estado del dispositivo */}
              <div>
                <h5 className="font-medium text-[#2d5a45] mb-2">
                  Dispositivo GPS
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Tipo:</span>
                    <p className="font-medium capitalize">
                      {selectedAnimal.deviceInfo.deviceType.replace("_", " ")}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">ID:</span>
                    <p className="font-medium">
                      {selectedAnimal.deviceInfo.deviceId}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Batería:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            selectedAnimal.deviceInfo.batteryLevel > 50
                              ? "bg-green-500"
                              : selectedAnimal.deviceInfo.batteryLevel > 20
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          )}
                          style={{
                            width: `${selectedAnimal.deviceInfo.batteryLevel}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">
                        {selectedAnimal.deviceInfo.batteryLevel}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Señal:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${selectedAnimal.deviceInfo.signalStrength}%`,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium">
                        {selectedAnimal.deviceInfo.signalStrength}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado de salud */}
              <div>
                <h5 className="font-medium text-[#2d5a45] mb-2">
                  Estado de Salud
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Temperatura:</span>
                    <p
                      className={cn(
                        "font-medium",
                        selectedAnimal.healthStatus.temperature > 39.5
                          ? "text-red-600"
                          : selectedAnimal.healthStatus.temperature < 38.0
                          ? "text-blue-600"
                          : "text-green-600"
                      )}
                    >
                      {selectedAnimal.healthStatus.temperature}°C
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Frecuencia cardíaca:</span>
                    <p className="font-medium">
                      {selectedAnimal.healthStatus.heartRate} bpm
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Actividad:</span>
                    <p className="font-medium capitalize">
                      {selectedAnimal.healthStatus.activityLevel}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Estrés:</span>
                    <p
                      className={cn(
                        "font-medium",
                        selectedAnimal.healthStatus.stressLevel === "low"
                          ? "text-green-600"
                          : selectedAnimal.healthStatus.stressLevel === "medium"
                          ? "text-yellow-600"
                          : "text-red-600"
                      )}
                    >
                      {selectedAnimal.healthStatus.stressLevel === "low"
                        ? "Bajo"
                        : selectedAnimal.healthStatus.stressLevel === "medium"
                        ? "Medio"
                        : "Alto"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patrones de comportamiento */}
              <div>
                <h5 className="font-medium text-[#2d5a45] mb-2">
                  Comportamiento
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Velocidad promedio:</span>
                    <p className="font-medium">
                      {selectedAnimal.behaviorPatterns.averageSpeed} km/h
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Distancia diaria:</span>
                    <p className="font-medium">
                      {selectedAnimal.behaviorPatterns.dailyDistance} km
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tiempo pastoreando:</span>
                    <p className="font-medium">
                      {selectedAnimal.behaviorPatterns.timeGrazing} h/día
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tiempo descansando:</span>
                    <p className="font-medium">
                      {selectedAnimal.behaviorPatterns.timeResting} h/día
                    </p>
                  </div>
                </div>
              </div>

              {/* Alertas activas */}
              {selectedAnimal.alerts.length > 0 && (
                <div>
                  <h5 className="font-medium text-[#2d5a45] mb-2">
                    Alertas Activas
                  </h5>
                  <div className="space-y-2">
                    {selectedAnimal.alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={cn(
                          "p-3 rounded-lg border",
                          alert.severity === "critical" ||
                            alert.severity === "emergency"
                            ? "bg-red-50 border-red-200"
                            : alert.severity === "warning"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-blue-50 border-blue-200"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle
                            className={cn(
                              "w-4 h-4",
                              alert.severity === "critical" ||
                                alert.severity === "emergency"
                                ? "text-red-600"
                                : alert.severity === "warning"
                                ? "text-yellow-600"
                                : "text-blue-600"
                            )}
                          />
                          <span
                            className={cn(
                              "font-medium text-sm",
                              alert.severity === "critical" ||
                                alert.severity === "emergency"
                                ? "text-red-700"
                                : alert.severity === "warning"
                                ? "text-yellow-700"
                                : "text-blue-700"
                            )}
                          >
                            {alert.severity === "critical"
                              ? "Crítica"
                              : alert.severity === "warning"
                              ? "Advertencia"
                              : alert.severity === "emergency"
                              ? "Emergencia"
                              : "Información"}
                          </span>
                          <span className="text-xs text-gray-500 ml-auto">
                            {alert.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <button className="flex-1 px-3 py-2 bg-[#519a7c] text-white rounded-md hover:bg-[#457e68] transition-colors text-sm">
                  Ver Historial
                </button>
                <button className="px-3 py-2 text-[#519a7c] border border-[#519a7c] rounded-md hover:bg-[#519a7c] hover:text-white transition-colors text-sm">
                  Configurar
                </button>
                <button className="px-3 py-2 text-[#519a7c] border border-[#519a7c] rounded-md hover:bg-[#519a7c] hover:text-white transition-colors text-sm">
                  Localizar
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Contenedor del mapa */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        {isLeafletLoaded ? (
          <div
            ref={mapRef}
            className="w-full h-full rounded-lg overflow-hidden"
            style={{ height: "100%", width: "100%" }}
          />
        ) : (
          <LivestockSimulatedMap
            animals={filteredAnimals}
            geofences={geofences}
            groups={groups}
            controls={mapControls}
            onAnimalClick={setSelectedAnimal}
          />
        )}
      </motion.div>

      {/* Leyenda del mapa */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3"
      >
        <h4 className="text-sm font-semibold text-[#2d5a45] mb-2">
          Estado de los Animales
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Saludable y conectado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Batería baja / Advertencia</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Problema de salud / Crítico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Sin conexión</span>
          </div>
        </div>
      </motion.div>

      {/* Indicador de seguimiento en tiempo real */}
      {mapControls.realTimeTracking && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg"
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">Seguimiento GPS Activo</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LivestockLocation;
