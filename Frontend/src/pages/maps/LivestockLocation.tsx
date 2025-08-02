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
  Heart,
  RefreshCw,
  MapPin,
  Plus,
  Save,
  Crosshair,
  MapIcon,
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

interface Pasture {
  id: string;
  name: string;
  description?: string;
  center: { latitude: number; longitude: number };
  isActive: boolean;
  isCurrentLocation: boolean;
  addedAt: Date;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
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

// Componente de mapa simulado para ganado
const LivestockSimulatedMap: React.FC<{
  animals: AnimalLocation[];
  pastures: Pasture[];
  userLocation: UserLocation | null;
  onAnimalClick: (animal: AnimalLocation) => void;
  onMapClick: (lat: number, lng: number) => void;
}> = ({ animals, pastures, userLocation, onAnimalClick, onMapClick }) => {
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

  return (
    <div 
      className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden rounded-lg cursor-crosshair"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Convertir coordenadas relativas a lat/lng aproximadas
        const lat = 17.990 - (y / 100) * 0.01;
        const lng = -92.948 + (x / 100) * 0.01;
        
        onMapClick(lat, lng);
      }}
    >
      {/* Fondo del mapa simulado */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M11 18c3.866 0 7-3.133 7-7s-3.134-7-7-7-7 3.133-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.133 7-7s-3.134-7-7-7-7 3.133-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Título del mapa */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md pointer-events-none">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-[#2d5a45]">
            Mapa de Ganado - Haz clic para agregar pastura
          </span>
        </div>
      </div>

      {/* Renderizado de pasturas */}
      {pastures.map((pasture, index) => (
        <motion.div
          key={pasture.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="absolute rounded-full border-2 pointer-events-none"
          style={{
            left: `${20 + index * 15}%`,
            top: `${20 + index * 15}%`,
            width: "80px",
            height: "80px",
            borderColor: pasture.isCurrentLocation ? "#3b82f6" : "#22c55e",
            backgroundColor: pasture.isCurrentLocation ? "#3b82f620" : "#22c55e20",
            borderStyle: pasture.isCurrentLocation ? "solid" : "dashed",
          }}
        >
          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-gray-700 whitespace-nowrap shadow-sm">
            {pasture.name}
            {pasture.isCurrentLocation && " (Mi ubicación)"}
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MapPin className={`w-4 h-4 ${pasture.isCurrentLocation ? 'text-blue-600' : 'text-green-600'}`} />
          </div>
        </motion.div>
      ))}

      {/* Renderizado de ubicación del usuario */}
      {userLocation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute pointer-events-none"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shadow-lg border-2 border-white">
              <Crosshair className="w-4 h-4 text-white" />
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium whitespace-nowrap">
              Tu ubicación
            </div>
            {/* Círculo de precisión */}
            <div 
              className="absolute rounded-full border border-blue-500 bg-blue-500 bg-opacity-10"
              style={{
                width: `${Math.max(userLocation.accuracy / 2, 20)}px`,
                height: `${Math.max(userLocation.accuracy / 2, 20)}px`,
                left: "50%",
                top: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Renderizado de animales */}
      {animals.map((animal, index) => (
        <motion.div
          key={animal.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + index * 0.1 }}
          className="absolute cursor-pointer hover:scale-110 transition-all duration-200 group"
          style={{
            left: `${25 + index * 20}%`,
            top: `${30 + index * 15}%`,
          }}
          onClick={(e) => {
            e.stopPropagation();
            onAnimalClick(animal);
          }}
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

      {/* Indicador de mapa simulado */}
      <div className="absolute bottom-4 left-4 bg-blue-500/10 border border-blue-500 rounded-lg px-3 py-2 pointer-events-none">
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
  const [pastures, setPastures] = useState<Pasture[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalLocation | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const [showAddPastureDialog, setShowAddPastureDialog] = useState(false);
  const [newPastureLocation, setNewPastureLocation] = useState<{lat: number, lng: number} | null>(null);
  const [pastureForm, setPastureForm] = useState({
    name: "",
    description: "",
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Referencias
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Coordenadas del centro del área de pastoreo (Villahermosa, Tabasco)
  const LIVESTOCK_CENTER: [number, number] = [17.989, -92.9465];

  // Función para obtener la ubicación actual del usuario
  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocalización no soportada por este navegador");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        const location: UserLocation = {
          latitude,
          longitude,
          accuracy,
          timestamp: new Date(),
        };

        setUserLocation(location);
        setIsGettingLocation(false);
        
        // Agregar la ubicación actual como una pastura
        const currentLocationPasture: Pasture = {
          id: `current-location-${Date.now()}`,
          name: "Mi Ubicación",
          description: "Ubicación actual obtenida por GPS",
          center: { latitude, longitude },
          isActive: true,
          isCurrentLocation: true,
          addedAt: new Date(),
        };

        setPastures(prev => {
          // Remover ubicación actual previa si existe
          const filtered = prev.filter(p => !p.isCurrentLocation);
          return [...filtered, currentLocationPasture];
        });
      },
      (error) => {
        let errorMessage = "Error obteniendo ubicación";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Ubicación no disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado";
            break;
        }
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutos
      }
    );
  };

  // Función para manejar clics en el mapa
  const handleMapClick = (lat: number, lng: number) => {
    setNewPastureLocation({ lat, lng });
    setShowAddPastureDialog(true);
  };

  // Función para agregar una nueva pastura
  const addPasture = () => {
    if (!newPastureLocation || !pastureForm.name.trim()) return;

    const newPasture: Pasture = {
      id: `pasture-${Date.now()}`,
      name: pastureForm.name.trim(),
      description: pastureForm.description.trim(),
      center: { 
        latitude: newPastureLocation.lat, 
        longitude: newPastureLocation.lng 
      },
      isActive: true,
      isCurrentLocation: false,
      addedAt: new Date(),
    };

    setPastures(prev => [...prev, newPasture]);
    
    // Limpiar form
    setPastureForm({ name: "", description: "" });
    setNewPastureLocation(null);
    setShowAddPastureDialog(false);
  };

  // Función para eliminar una pastura
  const removePasture = (pastureId: string) => {
    setPastures(prev => prev.filter(p => p.id !== pastureId));
  };

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

    // Agregar animales
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
    });

    // Agregar event listener para clics en el mapa
    map.on('click', (e: any) => {
      handleMapClick(e.latlng.lat, e.latlng.lng);
    });
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

  return (
    <div
      className={cn(
        "relative w-full h-screen overflow-hidden",
        "bg-gradient-to-br from-[#F5F5DC] via-[#E8E8C8] to-[#D3D3B8]",
        isFullscreen ? "fixed inset-0 z-50" : "h-[600px]",
        className
      )}
    >
      {/* Panel de control simplificado */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[300px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2d5a45] flex items-center gap-2">
            <Navigation className="w-5 h-5" />
            Control de Ganado
          </h2>
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

        {/* Barra de búsqueda */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar animal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
          />
        </div>

        {/* Alertas críticas */}
        {criticalAlerts.length > 0 && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">
                {criticalAlerts.length} Alerta{criticalAlerts.length > 1 ? 's' : ''} Crítica{criticalAlerts.length > 1 ? 's' : ''}
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

        {/* Gestión de ubicación */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Ubicación</h3>
          
          {/* Botón para obtener ubicación actual */}
          <button
            onClick={getCurrentLocation}
            disabled={isGettingLocation}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors",
              isGettingLocation
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            )}
          >
            {isGettingLocation ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Crosshair className="w-4 h-4" />
            )}
            {isGettingLocation ? "Obteniendo ubicación..." : "Obtener mi ubicación"}
          </button>

          {/* Error de ubicación */}
          {locationError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {locationError}
            </div>
          )}

          {/* Lista de pasturas */}
          {pastures.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Pasturas Registradas</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {pastures.map((pasture) => (
                  <div key={pasture.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{pasture.name}</div>
                      {pasture.description && (
                        <div className="text-xs text-gray-500">{pasture.description}</div>
                      )}
                    </div>
                    {!pasture.isCurrentLocation && (
                      <button
                        onClick={() => removePasture(pasture.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Resumen del ganado */}
        <div className="border-t pt-3 mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Resumen del Ganado
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
          </div>
        </div>
      </motion.div>

      {/* Dialog para agregar pastura */}
      <AnimatePresence>
        {showAddPastureDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4"
            onClick={() => setShowAddPastureDialog(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">
                Agregar Nueva Pastura
              </h3>
              
              {newPastureLocation && (
                <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                  <div className="font-medium">Ubicación seleccionada:</div>
                  <div>Lat: {newPastureLocation.lat.toFixed(6)}</div>
                  <div>Lng: {newPastureLocation.lng.toFixed(6)}</div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la pastura *
                  </label>
                  <input
                    type="text"
                    value={pastureForm.name}
                    onChange={(e) => setPastureForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Potrero Norte"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={pastureForm.description}
                    onChange={(e) => setPastureForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descripción de la pastura..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddPastureDialog(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={addPasture}
                  disabled={!pastureForm.name.trim()}
                  className={cn(
                    "flex-1 px-4 py-2 rounded-md transition-colors flex items-center justify-center gap-2",
                    pastureForm.name.trim()
                      ? "bg-[#519a7c] text-white hover:bg-[#457e68]"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  )}
                >
                  <Save className="w-4 h-4" />
                  Guardar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel de información del animal seleccionado */}
      <AnimatePresence>
        {selectedAnimal && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[350px] max-w-[400px] max-h-[calc(100vh-2rem)] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#2d5a45]">
                {selectedAnimal.name || selectedAnimal.earTag}
              </h3>
              <button
                onClick={() => setSelectedAnimal(null)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Arete:</span>
                  <p className="font-medium">{selectedAnimal.earTag}</p>
                </div>
                <div>
                  <span className="text-gray-500">Raza:</span>
                  <p className="font-medium">{selectedAnimal.breed}</p>
                </div>
                <div>
                  <span className="text-gray-500">Edad:</span>
                  <p className="font-medium">{selectedAnimal.age} años</p>
                </div>
                <div>
                  <span className="text-gray-500">Peso:</span>
                  <p className="font-medium">{selectedAnimal.weight} kg</p>
                </div>
              </div>

              {/* Estado de salud */}
              <div className={cn(
                "p-3 rounded-lg",
                selectedAnimal.healthStatus.isHealthy ? "bg-green-50" : "bg-red-50"
              )}>
                <h4 className="font-medium text-sm mb-2">Estado de Salud</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Temperatura: {selectedAnimal.healthStatus.temperature}°C</div>
                  <div>FC: {selectedAnimal.healthStatus.heartRate} bpm</div>
                  <div>Actividad: {selectedAnimal.healthStatus.activityLevel}</div>
                  <div>Estrés: {selectedAnimal.healthStatus.stressLevel}</div>
                </div>
              </div>

              {/* Estado del dispositivo */}
              <div className="p-3 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Dispositivo GPS</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Batería:</span>
                    <span className={cn(
                      "font-medium",
                      selectedAnimal.deviceInfo.batteryLevel > 50 ? "text-green-600" :
                      selectedAnimal.deviceInfo.batteryLevel > 20 ? "text-yellow-600" : "text-red-600"
                    )}>
                      {selectedAnimal.deviceInfo.batteryLevel}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Señal:</span>
                    <span className="font-medium">{selectedAnimal.deviceInfo.signalStrength}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estado:</span>
                    <span className={cn(
                      "font-medium",
                      selectedAnimal.deviceInfo.isOnline ? "text-green-600" : "text-red-600"
                    )}>
                      {selectedAnimal.deviceInfo.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alertas */}
              {selectedAnimal.alerts.length > 0 && (
                <div>
                  <h4 className="font-medium text-sm mb-2 text-red-700">
                    Alertas Activas ({selectedAnimal.alerts.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedAnimal.alerts.map((alert) => (
                      <div key={alert.id} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <div className="flex items-center gap-1 mb-1">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span className="font-medium text-red-700">
                            {alert.severity === "critical" ? "Crítica" : 
                             alert.severity === "warning" ? "Advertencia" : "Info"}
                          </span>
                        </div>
                        <p className="text-red-600">{alert.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            pastures={pastures}
            userLocation={userLocation}
            onAnimalClick={setSelectedAnimal}
            onMapClick={handleMapClick}
          />
        )}
      </motion.div>
    </div>
  );
};

export default LivestockLocation;