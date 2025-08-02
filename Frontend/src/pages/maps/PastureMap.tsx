import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TreePine,
  Users,
  Maximize2,
  Minimize2,
  Search,
  X,
  AlertTriangle,
  CheckCircle,
  Pause,
  Play,
  Settings,
  Droplets,
  MapPin,
  Plus,
  Crosshair,
  Save,
  Navigation,
} from "lucide-react";

// Declaración global para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

// Interfaces principales para el mapa de potreros
interface PastureMapProps {
  className?: string;
}

interface Pasture {
  id: string;
  name: string;
  code: string;
  area: number;
  coordinates: [number, number][];
  status: "occupied" | "resting" | "available" | "maintenance";
  grassCondition: "excellent" | "good" | "fair" | "poor" | "depleted";
  grassType: string[];
  carryingCapacity: number;
  currentAnimals: number;
  recommendedAnimals: number;
  lastGrazingDate: Date;
  restPeriodDays: number;
  restingDays: number;
  nextAvailableDate: Date;
  soilType: "clay" | "sandy" | "loam" | "rocky";
  drainage: "excellent" | "good" | "fair" | "poor";
  slope: "flat" | "gentle" | "moderate" | "steep";
  waterSources: WaterSource[];
  shadedAreas: number;
  fencing: FenceCondition;
  productivity: PastureProductivity;
  notes?: string;
  lastInspectionDate: Date;
  nextInspectionDate: Date;
  // Nueva propiedad para ubicación
  address?: string;
  centerPoint?: [number, number];
}

interface WaterSource {
  id: string;
  type: "well" | "stream" | "pond" | "artificial_tank";
  position: [number, number];
  capacity?: number;
  waterQuality: "excellent" | "good" | "fair" | "poor";
  isActive: boolean;
  lastTested?: Date;
}

interface FenceCondition {
  type: "electric" | "barbed_wire" | "wooden" | "mesh";
  condition: "excellent" | "good" | "fair" | "poor";
  lastMaintenanceDate: Date;
  needsRepair: boolean;
  segments: {
    id: string;
    length: number;
    condition: "good" | "damaged" | "needs_replacement";
  }[];
}

interface PastureProductivity {
  averageDailyGain: number;
  grassGrowthRate: number;
  biomassPerHectare: number;
  nutritionalValue: {
    protein: number;
    energy: number;
    fiber: number;
  };
  seasonalVariation: {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  };
}

interface MapControls {
  showPastures: boolean;
  showWaterSources: boolean;
  editMode: boolean;
  selectedFilter: string;
}

// Nuevo estado para agregar pasturas
interface NewPasture {
  name: string;
  area: number;
  grassType: string;
  coordinates: [number, number][];
  centerPoint?: [number, number];
  address?: string;
}

// Función utilitaria para concatenar clases CSS
const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Datos de ejemplo para potreros (ubicación Villahermosa, Tabasco)
const SAMPLE_PASTURES: Pasture[] = [
  {
    id: "pasture-1",
    name: "Potrero San José",
    code: "P-001",
    area: 25.5,
    coordinates: [
      [17.989, -92.9475],
      [17.99, -92.9475],
      [17.99, -92.9455],
      [17.989, -92.9455],
    ],
    centerPoint: [17.9895, -92.9465],
    address: "Carretera Villahermosa-Cárdenas Km 15, Villahermosa, Tabasco",
    status: "occupied",
    grassCondition: "good",
    grassType: ["Pasto Estrella", "Bermuda"],
    carryingCapacity: 80,
    currentAnimals: 65,
    recommendedAnimals: 70,
    lastGrazingDate: new Date("2024-12-01"),
    restPeriodDays: 21,
    restingDays: 0,
    nextAvailableDate: new Date("2025-01-15"),
    soilType: "loam",
    drainage: "good",
    slope: "gentle",
    waterSources: [
      {
        id: "ws-1",
        type: "artificial_tank",
        position: [17.9895, -92.9465],
        capacity: 5000,
        waterQuality: "excellent",
        isActive: true,
        lastTested: new Date("2024-12-15"),
      },
    ],
    shadedAreas: 15,
    fencing: {
      type: "electric",
      condition: "good",
      lastMaintenanceDate: new Date("2024-11-01"),
      needsRepair: false,
      segments: [
        { id: "seg-1", length: 800, condition: "good" },
        { id: "seg-2", length: 600, condition: "good" },
      ],
    },
    productivity: {
      averageDailyGain: 0.8,
      grassGrowthRate: 12,
      biomassPerHectare: 4500,
      nutritionalValue: {
        protein: 14,
        energy: 2.6,
        fiber: 28,
      },
      seasonalVariation: {
        spring: 1.2,
        summer: 1.0,
        autumn: 0.8,
        winter: 0.6,
      },
    },
    lastInspectionDate: new Date("2024-12-10"),
    nextInspectionDate: new Date("2025-01-10"),
    notes: "Potrero en excelente estado, ideal para ganado en crecimiento",
  },
  {
    id: "pasture-2",
    name: "Potrero La Esperanza",
    code: "P-002",
    area: 18.3,
    coordinates: [
      [17.988, -92.9475],
      [17.989, -92.9475],
      [17.989, -92.945],
      [17.988, -92.945],
    ],
    centerPoint: [17.9885, -92.9462],
    address: "Ejido La Esperanza, Villahermosa, Tabasco",
    status: "resting",
    grassCondition: "excellent",
    grassType: ["Tanzania", "Brachiaria"],
    carryingCapacity: 60,
    currentAnimals: 0,
    recommendedAnimals: 55,
    lastGrazingDate: new Date("2024-11-15"),
    restPeriodDays: 28,
    restingDays: 25,
    nextAvailableDate: new Date("2025-01-05"),
    soilType: "clay",
    drainage: "fair",
    slope: "flat",
    waterSources: [
      {
        id: "ws-2",
        type: "pond",
        position: [17.9885, -92.946],
        waterQuality: "good",
        isActive: true,
        lastTested: new Date("2024-12-08"),
      },
    ],
    shadedAreas: 25,
    fencing: {
      type: "barbed_wire",
      condition: "fair",
      lastMaintenanceDate: new Date("2024-09-15"),
      needsRepair: true,
      segments: [
        { id: "seg-3", length: 700, condition: "good" },
        { id: "seg-4", length: 500, condition: "damaged" },
      ],
    },
    productivity: {
      averageDailyGain: 0.9,
      grassGrowthRate: 15,
      biomassPerHectare: 5200,
      nutritionalValue: {
        protein: 16,
        energy: 2.8,
        fiber: 26,
      },
      seasonalVariation: {
        spring: 1.3,
        summer: 1.1,
        autumn: 0.9,
        winter: 0.7,
      },
    },
    lastInspectionDate: new Date("2024-12-05"),
    nextInspectionDate: new Date("2025-01-05"),
    notes: "En periodo de descanso, pasto recuperándose bien",
  },
];

// Componente de mapa simulado para potreros
const PastureSimulatedMap: React.FC<{
  pastures: Pasture[];
  controls: MapControls;
  onPastureClick: (pasture: Pasture) => void;
  userLocation: [number, number] | null;
  newPasturePoints: [number, number][];
  onMapClick: (lat: number, lng: number) => void;
}> = ({ pastures, controls, onPastureClick, userLocation, newPasturePoints, onMapClick }) => {
  // Función para obtener color según el estado del potrero
  const getPastureColor = (pasture: Pasture) => {
    // Siempre mostrar por estado
    switch (pasture.status) {
      case "occupied": return "#ef4444";
      case "resting": return "#f59e0b";
      case "available": return "#22c55e";
      case "maintenance": return "#6b7280";
      default: return "#9ca3af";
    }
  };

  // Función para obtener el ícono según el estado
  const getPastureIcon = (pasture: Pasture) => {
    switch (pasture.status) {
      case "occupied": return <Users className="w-4 h-4 text-white" />;
      case "resting": return <Pause className="w-4 h-4 text-white" />;
      case "available": return <Play className="w-4 h-4 text-white" />;
      case "maintenance": return <Settings className="w-4 h-4 text-white" />;
      default: return <TreePine className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div 
      className="w-full h-full bg-gradient-to-br from-green-50 to-yellow-50 relative overflow-hidden rounded-lg cursor-crosshair"
      onClick={(e) => {
        if (controls.editMode) {
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          // Convertir coordenadas de pantalla a coordenadas geográficas simuladas
          const lat = 17.995 - (y / rect.height) * 0.02;
          const lng = -92.955 + (x / rect.width) * 0.02;
          onMapClick(lat, lng);
        }
      }}
    >
      {/* Fondo del mapa simulado */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Cpath d='M0 0h80v80H0V0zm20 20v40h40V20H20zm20 35a15 15 0 1 1 0-30 15 15 0 0 1 0 30z' fill-opacity='0.05'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Título del mapa */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <TreePine className="w-5 h-5 text-green-600" />
          <span className="font-medium text-[#2d5a45]">
            Mapa de Potreros - Villahermosa, Tabasco
          </span>
        </div>
      </div>

      {/* Renderizado de potreros */}
      {controls.showPastures &&
        pastures.map((pasture, index) => (
          <motion.div
            key={pasture.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="absolute cursor-pointer hover:scale-105 transition-all duration-200 group"
            style={{
              left: `${15 + index * 30}%`,
              top: `${25 + index * 20}%`,
              width: "140px",
              height: "100px",
            }}
            onClick={() => onPastureClick(pasture)}
          >
            <div
              className="w-full h-full rounded-lg border-2 shadow-lg relative overflow-hidden"
              style={{
                backgroundColor: getPastureColor(pasture) + "20",
                borderColor: getPastureColor(pasture),
              }}
            >
              <div className="p-2 h-full flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#2d5a45]">
                    {pasture.code}
                  </div>
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: getPastureColor(pasture) }}
                  >
                    {getPastureIcon(pasture)}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-sm font-semibold text-[#2d5a45] truncate">
                    {pasture.name}
                  </div>
                  <div className="text-xs text-gray-600">{pasture.area} ha</div>

                  {/* Mostrar información del estado */}
                  <div className="text-xs text-gray-600">
                    {pasture.status === "occupied"
                      ? "Ocupado"
                      : pasture.status === "resting"
                      ? "Descansando"
                      : pasture.status === "available"
                      ? "Disponible"
                      : "Mantenimiento"}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  {pasture.status === "resting" && (
                    <span>Descanso: {pasture.restingDays}d</span>
                  )}
                  {pasture.status === "occupied" && (
                    <span>Desde: {pasture.lastGrazingDate.toLocaleDateString()}</span>
                  )}
                  {pasture.waterSources.length > 0 && (
                    <Droplets className="w-3 h-3 text-blue-500" />
                  )}
                </div>
              </div>

              {pasture.fencing.needsRepair && (
                <div className="absolute top-1 right-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                </div>
              )}

              {pasture.grassCondition === "excellent" && (
                <div className="absolute top-1 left-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                </div>
              )}
            </div>

            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black/90 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {pasture.name} - {pasture.grassType.join(", ")}
              {pasture.address && <div className="text-xs text-gray-300">{pasture.address}</div>}
            </div>
          </motion.div>
        ))}

      {/* Visualización de fuentes de agua */}
      {controls.showWaterSources &&
        pastures
          .flatMap((p) => p.waterSources)
          .map((waterSource, index) => (
            <motion.div
              key={waterSource.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="absolute"
              style={{
                left: `${20 + index * 25}%`,
                top: `${60 + index * 10}%`,
              }}
            >
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <Droplets className="w-4 h-4 text-white" />
              </div>
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-blue-700 whitespace-nowrap shadow-sm">
                {waterSource.type === "artificial_tank" ? "Tanque"
                  : waterSource.type === "pond" ? "Estanque"
                  : waterSource.type === "well" ? "Pozo" : "Arroyo"}
              </div>
            </motion.div>
          ))}

      {/* Ubicación del usuario */}
      {userLocation && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute"
          style={{
            left: `${50}%`,
            top: `${50}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
            <div className="absolute inset-0 w-4 h-4 bg-blue-600 rounded-full animate-ping opacity-50"></div>
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            Tu ubicación
          </div>
        </motion.div>
      )}

      {/* Puntos de nueva pastura */}
      {newPasturePoints.map((point, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute"
          style={{
            // Convertir coordenadas reales a posición en el mapa simulado
            left: `${20 + (index * 15) + Math.random() * 40}%`,
            top: `${30 + (index * 10) + Math.random() * 30}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">{index + 1}</span>
            </div>
            <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping opacity-50"></div>
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
            Punto {index + 1}
          </div>
        </motion.div>
      ))}

      {/* Líneas conectando los puntos */}
      {newPasturePoints.length > 1 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {newPasturePoints.slice(0, -1).map((point, index) => {
            const nextPoint = newPasturePoints[index + 1];
            // Convertir coordenadas a posiciones en el SVG
            const x1 = 20 + (index * 15) + Math.random() * 40;
            const y1 = 30 + (index * 10) + Math.random() * 30;
            const x2 = 20 + ((index + 1) * 15) + Math.random() * 40;
            const y2 = 30 + ((index + 1) * 10) + Math.random() * 30;
            
            return (
              <line
                key={index}
                x1={`${x1}%`}
                y1={`${y1}%`}
                x2={`${x2}%`}
                y2={`${y2}%`}
                stroke="#ef4444"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-pulse"
              />
            );
          })}
          
          {/* Línea de cierre si hay más de 2 puntos */}
          {newPasturePoints.length > 2 && (
            <line
              x1={`${20 + ((newPasturePoints.length - 1) * 15) + Math.random() * 40}%`}
              y1={`${30 + ((newPasturePoints.length - 1) * 10) + Math.random() * 30}%`}
              x2={`${20 + Math.random() * 40}%`}
              y2={`${30 + Math.random() * 30}%`}
              stroke="#ef4444"
              strokeWidth="2"
              strokeDasharray="5,5"
              className="animate-pulse opacity-50"
            />
          )}
        </svg>
      )}

      {/* Indicador de modo edición */}
      {controls.editMode && (
        <div className="absolute bottom-4 left-4 bg-blue-500/10 border border-blue-500 rounded-lg px-3 py-2">
          <div className="flex items-center gap-2 text-xs text-blue-700">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Modo de Edición - Haz clic para agregar puntos</span>
          </div>
        </div>
      )}
    </div>
  );
};

export const PastureMap: React.FC<PastureMapProps> = ({ className }) => {
  // Estados principales del componente
  const [pastures, setPastures] = useState<Pasture[]>(SAMPLE_PASTURES);
  const [mapControls, setMapControls] = useState<MapControls>({
    showPastures: true,
    showWaterSources: true,
    editMode: false,
    selectedFilter: "all",
  });

  // Estados para interacciones del mapa
  const [selectedPasture, setSelectedPasture] = useState<Pasture | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  // Estados para geolocalización y agregar pasturas
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isAddingPasture, setIsAddingPasture] = useState(false);
  const [newPasture, setNewPasture] = useState<NewPasture>({
    name: "",
    area: 0,
    grassType: "",
    coordinates: [],
  });
  const [newPasturePoints, setNewPasturePoints] = useState<[number, number][]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Referencias
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Coordenadas del centro del área de potreros (Villahermosa, Tabasco)
  const PASTURES_CENTER: [number, number] = [17.9895, -92.946];

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          console.log("📍 Ubicación obtenida:", latitude, longitude);
        },
        (error) => {
          console.error("❌ Error obteniendo ubicación:", error);
          // Usar ubicación por defecto en Villahermosa, Tabasco
          setUserLocation(PASTURES_CENTER);
        }
      );
    } else {
      console.log("Geolocalización no soportada");
      setUserLocation(PASTURES_CENTER);
    }
  };

  // Función para agregar ubicación actual como punto de pastura
  const addCurrentLocationPoint = async () => {
    if (!userLocation) {
      setIsGettingLocation(true);
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            const newPoint: [number, number] = [latitude, longitude];
            
            // Agregar el punto
            const updatedPoints = [...newPasturePoints, newPoint];
            setNewPasturePoints(updatedPoints);
            
            // Si es el primer punto, obtener la dirección
            if (updatedPoints.length === 1) {
              const address = await getAddressFromCoordinates(latitude, longitude);
              setNewPasture(prev => ({
                ...prev,
                centerPoint: newPoint,
                address: address
              }));
            }
            
            setUserLocation([latitude, longitude]);
            setIsGettingLocation(false);
            console.log("📍 Punto agregado desde ubicación actual:", latitude, longitude);
          },
          (error) => {
            console.error("❌ Error obteniendo ubicación:", error);
            setIsGettingLocation(false);
            alert("No se pudo obtener la ubicación actual. Por favor, intenta hacer clic en el mapa.");
          }
        );
      } else {
        setIsGettingLocation(false);
        alert("Geolocalización no soportada en este dispositivo");
      }
    } else {
      // Usar la ubicación ya conocida
      const newPoint: [number, number] = userLocation;
      const updatedPoints = [...newPasturePoints, newPoint];
      setNewPasturePoints(updatedPoints);
      
      // Si es el primer punto, obtener la dirección
      if (updatedPoints.length === 1) {
        const address = await getAddressFromCoordinates(userLocation[0], userLocation[1]);
        setNewPasture(prev => ({
          ...prev,
          centerPoint: newPoint,
          address: address
        }));
      }
      
      console.log("📍 Punto agregado desde ubicación guardada:", userLocation);
    }
  };

  // Función para obtener dirección de coordenadas (geocodificación inversa)
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    } catch (error) {
      console.error("Error obteniendo dirección:", error);
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }
  };

  // Verificar si Leaflet está disponible
  useEffect(() => {
    const checkLeaflet = () => {
      if (typeof window !== "undefined" && window.L) {
        setIsLeafletLoaded(true);
        initializeMap();
      } else {
        console.log("🗺️ Leaflet no disponible, usando mapa simulado de potreros");
      }
    };

    checkLeaflet();
    getCurrentLocation();

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

  // Actualizar mapa cuando cambien los puntos de nueva pastura
  useEffect(() => {
    if (mapInstance.current && isLeafletLoaded) {
      addPasturesToMap(mapInstance.current);
    }
  }, [newPasturePoints, userLocation, pastures, mapControls]);

  // Inicializar mapa de Leaflet para potreros
  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    try {
      const map = window.L.map(mapRef.current, {
        center: userLocation || PASTURES_CENTER,
        zoom: 15,
        zoomControl: true,
        attributionControl: true,
      });

      window.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri",
          maxZoom: 18,
        }
      ).addTo(map);

      mapInstance.current = map;

      // Agregar evento de click para modo edición
      map.on('click', (e: any) => {
        if (mapControls.editMode) {
          handleMapClick(e.latlng.lat, e.latlng.lng);
        }
      });

      addPasturesToMap(map);
      console.log("✅ Mapa de Leaflet para potreros inicializado correctamente");
    } catch (error) {
      console.error("❌ Error inicializando mapa de potreros:", error);
    }
  };

  // Agregar potreros al mapa de Leaflet
  const addPasturesToMap = (map: any) => {
    if (!map || !window.L) return;

    // Limpiar capas anteriores
    map.eachLayer((layer: any) => {
      if (layer instanceof window.L.Marker || layer instanceof window.L.Polygon || layer instanceof window.L.Polyline) {
        map.removeLayer(layer);
      }
    });

    if (mapControls.showPastures) {
      pastures.forEach((pasture) => {
        const color = getPastureColorByMode(pasture);

        const polygon = window.L.polygon(pasture.coordinates, {
          color: color,
          fillColor: color,
          fillOpacity: 0.6,
          weight: 3,
        }).addTo(map);

        polygon.bindPopup(`
          <div style="padding: 12px; min-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #2d5a45; font-weight: bold;">${pasture.name}</h3>
            <div style="margin-bottom: 8px;">
              <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                ${pasture.code}
              </span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0;">
              <div><strong>Área:</strong> ${pasture.area} ha</div>
              <div><strong>Estado:</strong> ${getStatusText(pasture.status)}</div>
              <div><strong>Animales:</strong> ${pasture.currentAnimals}/${pasture.carryingCapacity}</div>
              <div><strong>Condición:</strong> ${getConditionText(pasture.grassCondition)}</div>
            </div>
            ${pasture.address ? `<div style="margin: 8px 0; font-size: 12px; color: #666;"><strong>Dirección:</strong> ${pasture.address}</div>` : ""}
            <div style="margin: 8px 0;">
              <strong>Pastos:</strong> ${pasture.grassType.join(", ")}
            </div>
            ${pasture.status === "resting" ? `<div style="color: #f59e0b;"><strong>Descanso:</strong> ${pasture.restingDays}/${pasture.restPeriodDays} días</div>` : ""}
          </div>
        `);

        polygon.on("click", () => setSelectedPasture(pasture));
      });
    }

    // Agregar marcador de ubicación del usuario
    if (userLocation) {
      const userMarker = window.L.marker(userLocation, {
        icon: window.L.divIcon({
          className: 'user-location-marker',
          html: `<div style="width: 16px; height: 16px; background: #3b82f6; border: 2px solid white; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.3);"></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(map);
      
      userMarker.bindPopup("Tu ubicación actual");
    }

    // Agregar puntos de nueva pastura
    newPasturePoints.forEach((point, index) => {
      const marker = window.L.marker(point, {
        icon: window.L.divIcon({
          className: 'pasture-point-marker',
          html: `<div style="width: 20px; height: 20px; background: #ef4444; color: white; border: 2px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">${index + 1}</div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        })
      }).addTo(map);
      
      marker.bindPopup(`Punto ${index + 1} de la nueva pastura`);
    });

    // Agregar líneas conectando los puntos de nueva pastura
    if (newPasturePoints.length > 1) {
      const polyline = window.L.polyline(newPasturePoints, {
        color: '#ef4444',
        weight: 3,
        dashArray: '10, 5',
        opacity: 0.7
      }).addTo(map);
      
      // Si hay 3 o más puntos, agregar línea de cierre
      if (newPasturePoints.length >= 3) {
        const closingLine = window.L.polyline([newPasturePoints[newPasturePoints.length - 1], newPasturePoints[0]], {
          color: '#ef4444',
          weight: 2,
          dashArray: '5, 5',
          opacity: 0.5
        }).addTo(map);
      }
    }
  };

  // Manejar click en el mapa para agregar puntos de pastura
  const handleMapClick = async (lat: number, lng: number) => {
    if (mapControls.editMode) {
      const newPoints = [...newPasturePoints, [lat, lng] as [number, number]];
      setNewPasturePoints(newPoints);

      if (newPoints.length === 1) {
        // Obtener dirección del primer punto
        const address = await getAddressFromCoordinates(lat, lng);
        setNewPasture(prev => ({
          ...prev,
          centerPoint: [lat, lng],
          address: address
        }));
      }
    }
  };

  // Función para finalizar la creación de pastura
  const finishPastureCreation = async () => {
    if (newPasturePoints.length >= 3 && newPasture.name && newPasture.area > 0) {
      try {
        const newPastureData: Pasture = {
          id: `pasture-${Date.now()}`,
          name: newPasture.name,
          code: `P-${String(pastures.length + 1).padStart(3, '0')}`,
          area: newPasture.area,
          coordinates: newPasturePoints,
          centerPoint: newPasture.centerPoint,
          address: newPasture.address,
          status: "available",
          grassCondition: "good",
          grassType: [newPasture.grassType || "Pasto Natural"],
          carryingCapacity: Math.floor(newPasture.area * 3), // 3 animales por hectárea
          currentAnimals: 0,
          recommendedAnimals: Math.floor(newPasture.area * 2.5),
          lastGrazingDate: new Date(),
          restPeriodDays: 21,
          restingDays: 0,
          nextAvailableDate: new Date(),
          soilType: "loam",
          drainage: "good",
          slope: "gentle",
          waterSources: [],
          shadedAreas: 10,
          fencing: {
            type: "electric",
            condition: "good",
            lastMaintenanceDate: new Date(),
            needsRepair: false,
            segments: []
          },
          productivity: {
            averageDailyGain: 0.7,
            grassGrowthRate: 10,
            biomassPerHectare: 4000,
            nutritionalValue: { protein: 12, energy: 2.4, fiber: 30 },
            seasonalVariation: { spring: 1.1, summer: 1.0, autumn: 0.8, winter: 0.6 }
          },
          lastInspectionDate: new Date(),
          nextInspectionDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };

        // Actualizar el estado de pasturas
        setPastures(prevPastures => [...prevPastures, newPastureData]);
        
        // Resetear estado
        setNewPasture({ name: "", area: 0, grassType: "", coordinates: [] });
        setNewPasturePoints([]);
        setMapControls(prev => ({ ...prev, editMode: false }));
        setShowAddDialog(false);
        setIsAddingPasture(false);

        console.log("✅ Nueva pastura creada exitosamente:", newPastureData);
        
        // Mostrar mensaje de éxito
        alert(`¡Pastura "${newPastureData.name}" creada exitosamente!`);
        
      } catch (error) {
        console.error("❌ Error creando pastura:", error);
        alert("Error al crear la pastura. Por favor, intenta de nuevo.");
      }
    } else {
      alert("Por favor, completa todos los campos y marca al menos 3 puntos en el mapa.");
    }
  };

  const getPastureColorByMode = (pasture: Pasture) => {
    // Siempre mostrar por estado
    switch (pasture.status) {
      case "occupied": return "#ef4444";
      case "resting": return "#f59e0b";
      case "available": return "#22c55e";
      case "maintenance": return "#6b7280";
      default: return "#9ca3af";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "occupied": return "Ocupado";
      case "resting": return "Descansando";
      case "available": return "Disponible";
      case "maintenance": return "Mantenimiento";
      default: return status;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case "excellent": return "Excelente";
      case "good": return "Bueno";
      case "fair": return "Regular";
      case "poor": return "Pobre";
      case "depleted": return "Agotado";
      default: return condition;
    }
  };

  // Funciones para el manejo de controles
  const toggleMapControl = (control: keyof MapControls) => {
    setMapControls((prev) => ({
      ...prev,
      [control]: !prev[control],
    }));
  };

  // Función para filtrar potreros según la búsqueda
  const filteredPastures = pastures.filter(
    (pasture) =>
      pasture.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pasture.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pasture.grassType.some((grass) =>
        grass.toLowerCase().includes(searchQuery.toLowerCase())
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
      {/* Panel de controles simplificado */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[280px]"
      >
        {/* Título y controles principales */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2d5a45] flex items-center gap-2">
            <TreePine className="w-5 h-5" />
            Mapa de Potreros
          </h2>
          <div className="flex gap-2">
            <button
              onClick={getCurrentLocation}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Obtener mi ubicación"
            >
              <Navigation className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Barra de búsqueda */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar potreros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
          />
        </div>

        {/* Botón para agregar nueva pastura */}
        <div className="mb-4">
          <button
            onClick={() => setShowAddDialog(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#519a7c] text-white rounded-md hover:bg-[#457e68] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Agregar Nueva Pastura
          </button>
        </div>

        {/* Controles simplificados */}
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <TreePine className="w-4 h-4 text-green-600" />
              Mostrar Potreros
            </span>
            <input
              type="checkbox"
              checked={mapControls.showPastures}
              onChange={() => toggleMapControl("showPastures")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-600" />
              Fuentes de Agua
            </span>
            <input
              type="checkbox"
              checked={mapControls.showWaterSources}
              onChange={() => toggleMapControl("showWaterSources")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>
        </div>
      </motion.div>

      {/* Diálogo para agregar nueva pastura */}
      <AnimatePresence>
        {showAddDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 flex items-center justify-center z-[2000]"
            onClick={() => setShowAddDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#2d5a45]">Nueva Pastura</h3>
                <button
                  onClick={() => setShowAddDialog(false)}
                  className="p-1 hover:bg-gray-100 rounded-md"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Pastura
                  </label>
                  <input
                    type="text"
                    value={newPasture.name}
                    onChange={(e) => setNewPasture(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    placeholder="Ej: Potrero Norte"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área (hectáreas)
                  </label>
                  <input
                    type="number"
                    value={newPasture.area}
                    onChange={(e) => setNewPasture(prev => ({ ...prev, area: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    placeholder="Ej: 25.5"
                    min="0"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Pasto
                  </label>
                  <input
                    type="text"
                    value={newPasture.grassType}
                    onChange={(e) => setNewPasture(prev => ({ ...prev, grassType: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    placeholder="Ej: Pasto Estrella"
                  />
                </div>

                {newPasture.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-600">
                      {newPasture.address}
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-3 rounded-md">
                  <div className="flex items-center gap-2 text-blue-700 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-medium">Definir Límites</span>
                  </div>
                  <p className="text-xs text-blue-600 mb-3">
                    Define los límites de la pastura usando tu ubicación actual o haciendo clic en el mapa (mínimo 3 puntos).
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      onClick={() => {
                        setMapControls(prev => ({ ...prev, editMode: true }));
                        setShowAddDialog(false);
                        setIsAddingPasture(true);
                      }}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Crosshair className="w-4 h-4" />
                      Clic en Mapa
                    </button>
                    
                    <button
                      onClick={async () => {
                        setMapControls(prev => ({ ...prev, editMode: true }));
                        setShowAddDialog(false);
                        setIsAddingPasture(true);
                        // Agregar inmediatamente la ubicación actual
                        await addCurrentLocationPoint();
                      }}
                      disabled={isGettingLocation}
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-400 transition-colors text-sm"
                    >
                      {isGettingLocation ? (
                        <>
                          <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          GPS...
                        </>
                      ) : (
                        <>
                          <Navigation className="w-4 h-4" />
                          Mi Ubicación
                        </>
                      )}
                    </button>
                  </div>
                  
                  {newPasturePoints.length > 0 && (
                    <div className="bg-white rounded p-2 mb-2">
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        Puntos marcados: {newPasturePoints.length}
                      </div>
                      <div className="text-xs text-green-600">
                        ✓ {newPasturePoints.length >= 3 ? 'Suficientes puntos para crear la pastura' : `Necesitas ${3 - newPasturePoints.length} puntos más`}
                      </div>
                    </div>
                  )}
                </div>

                {newPasturePoints.length > 0 && (
                  <div className="bg-green-50 p-3 rounded-md">
                    <div className="flex items-center gap-2 text-green-700 mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {newPasturePoints.length} puntos marcados
                      </span>
                    </div>
                    {newPasturePoints.length >= 3 && newPasture.name && newPasture.area > 0 && (
                      <button
                        onClick={finishPastureCreation}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm mt-2"
                      >
                        <Save className="w-4 h-4" />
                        Crear Pastura
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Panel de información del potrero seleccionado */}
      <AnimatePresence>
        {selectedPasture && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[350px] max-w-[450px] max-h-[calc(100vh-2rem)] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#2d5a45]">
                Información del Potrero
              </h3>
              <button
                onClick={() => setSelectedPasture(null)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Header del potrero */}
              <div className="border-b pb-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-[#2d5a45] text-lg">
                    {selectedPasture.name}
                  </h4>
                  <span className="bg-[#519a7c] text-white px-2 py-1 rounded text-sm font-medium">
                    {selectedPasture.code}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>Área: {selectedPasture.area} ha</span>
                  <span className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{
                        backgroundColor: getPastureColorByMode(selectedPasture),
                      }}
                    ></div>
                    {getStatusText(selectedPasture.status)}
                  </span>
                </div>
                {selectedPasture.address && (
                  <div className="mt-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    {selectedPasture.address}
                  </div>
                )}
              </div>

              {/* Información de ocupación */}
              <div>
                <h5 className="font-medium text-[#2d5a45] mb-2">Ocupación</h5>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Actual:</span>
                    <p className="font-medium">{selectedPasture.currentAnimals} animales</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Capacidad:</span>
                    <p className="font-medium">{selectedPasture.carryingCapacity} animales</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Recomendado:</span>
                    <p className="font-medium">{selectedPasture.recommendedAnimals} animales</p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Utilización</span>
                    <span>
                      {Math.round(
                        (selectedPasture.currentAnimals / selectedPasture.carryingCapacity) * 100
                      )}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#519a7c] h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (selectedPasture.currentAnimals / selectedPasture.carryingCapacity) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Información de pastoreo */}
              <div>
                <h5 className="font-medium text-[#2d5a45] mb-2">Estado del Pasto</h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Condición:</span>
                    <p className="font-medium capitalize">
                      {getConditionText(selectedPasture.grassCondition)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tipos de Pasto:</span>
                    <p className="font-medium">{selectedPasture.grassType.join(", ")}</p>
                  </div>
                </div>
              </div>

              {/* Alertas */}
              {selectedPasture.fencing.needsRepair && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Alerta de Mantenimiento</span>
                  </div>
                  <p className="text-sm text-red-600 mt-1">
                    Las cercas necesitan reparación. Revisar segmentos dañados.
                  </p>
                </div>
              )}

              {/* Notas */}
              {selectedPasture.notes && (
                <div>
                  <h5 className="font-medium text-[#2d5a45] mb-2">Observaciones</h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded italic">
                    {selectedPasture.notes}
                  </p>
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
          <PastureSimulatedMap
            pastures={filteredPastures}
            controls={mapControls}
            onPastureClick={setSelectedPasture}
            userLocation={userLocation}
            newPasturePoints={newPasturePoints}
            onMapClick={handleMapClick}
          />
        )}
      </motion.div>

      {/* Panel de progreso para agregar pastura */}
      {isAddingPasture && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[350px]"
        >
          <div className="text-center">
            <h4 className="font-medium text-[#2d5a45] mb-2">
              Definiendo límites de pastura
            </h4>
            <p className="text-sm text-gray-600 mb-3">
              Puntos marcados: {newPasturePoints.length}
              {newPasturePoints.length < 3 && ` (mínimo 3 requeridos)`}
            </p>
            
            {/* Botones para agregar puntos */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={addCurrentLocationPoint}
                disabled={isGettingLocation}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors text-sm"
              >
                {isGettingLocation ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Obteniendo...
                  </>
                ) : (
                  <>
                    <Crosshair className="w-4 h-4" />
                    Usar Mi Ubicación
                  </>
                )}
              </button>
              
              <button
                onClick={() => {
                  setNewPasturePoints([]);
                  setNewPasture(prev => ({ ...prev, centerPoint: undefined, address: undefined }));
                }}
                disabled={newPasturePoints.length === 0}
                className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                Limpiar Puntos
              </button>
            </div>

            {/* Lista de puntos marcados */}
            {newPasturePoints.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Puntos marcados:</div>
                <div className="space-y-1 max-h-24 overflow-y-auto">
                  {newPasturePoints.map((point, index) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-white rounded px-2 py-1">
                      <span>Punto {index + 1}: {point[0].toFixed(6)}, {point[1].toFixed(6)}</span>
                      <button
                        onClick={() => {
                          const updatedPoints = newPasturePoints.filter((_, i) => i !== index);
                          setNewPasturePoints(updatedPoints);
                          
                          // Si eliminamos el primer punto y hay otros, actualizar dirección
                          if (index === 0 && updatedPoints.length > 0) {
                            getAddressFromCoordinates(updatedPoints[0][0], updatedPoints[0][1])
                              .then(address => {
                                setNewPasture(prev => ({
                                  ...prev,
                                  centerPoint: updatedPoints[0],
                                  address: address
                                }));
                              });
                          } else if (updatedPoints.length === 0) {
                            setNewPasture(prev => ({ ...prev, centerPoint: undefined, address: undefined }));
                          }
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500 mb-3">
              💡 Puedes usar tu ubicación actual o hacer clic en el mapa para agregar puntos
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setNewPasturePoints([]);
                  setMapControls(prev => ({ ...prev, editMode: false }));
                  setIsAddingPasture(false);
                  setNewPasture({ name: "", area: 0, grassType: "", coordinates: [] });
                }}
                className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
              >
                Cancelar
              </button>
              {newPasturePoints.length >= 3 && newPasture.name && newPasture.area > 0 && (
                <button
                  onClick={finishPastureCreation}
                  className="flex-1 px-3 py-2 bg-[#519a7c] text-white rounded-md hover:bg-[#457e68] transition-colors text-sm"
                >
                  Crear Pastura
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Leyenda del mapa simplificada */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3"
      >
        <h4 className="text-sm font-semibold text-[#2d5a45] mb-2">
          Estado de Potreros
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Ocupado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Descansando</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Disponible</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Mantenimiento</span>
          </div>
          {isAddingPasture && (
            <div className="border-t pt-2 mt-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                <span>Puntos de nueva pastura</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PastureMap;