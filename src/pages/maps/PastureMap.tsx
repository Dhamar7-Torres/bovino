import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TreePine,
  Users,
  Maximize2,
  Minimize2,
  Search,
  X,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Pause,
  Play,
  Settings,
  Droplets,
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
  code: string; // Código identificador único (ej: "P-001")
  area: number; // en hectáreas
  coordinates: [number, number][];

  // Estado del pastoreo
  status: "occupied" | "resting" | "available" | "maintenance";
  grassCondition: "excellent" | "good" | "fair" | "poor" | "depleted";
  grassType: string[];

  // Capacidad y ocupación
  carryingCapacity: number; // animales máximos
  currentAnimals: number; // animales actuales
  recommendedAnimals: number; // animales recomendados

  // Gestión de rotación
  lastGrazingDate: Date;
  restPeriodDays: number; // días de descanso necesarios
  restingDays: number; // días que lleva descansando
  nextAvailableDate: Date;

  // Condiciones ambientales
  soilType: "clay" | "sandy" | "loam" | "rocky";
  drainage: "excellent" | "good" | "fair" | "poor";
  slope: "flat" | "gentle" | "moderate" | "steep";

  // Recursos
  waterSources: WaterSource[];
  shadedAreas: number; // porcentaje de área con sombra
  fencing: FenceCondition;

  // Métricas de productividad
  productivity: PastureProductivity;

  // Observaciones y notas
  notes?: string;
  lastInspectionDate: Date;
  nextInspectionDate: Date;
}

interface WaterSource {
  id: string;
  type: "well" | "stream" | "pond" | "artificial_tank";
  position: [number, number];
  capacity?: number; // en litros
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
    length: number; // metros
    condition: "good" | "damaged" | "needs_replacement";
  }[];
}

interface PastureProductivity {
  averageDailyGain: number; // kg/animal/día
  grassGrowthRate: number; // cm/semana
  biomassPerHectare: number; // kg/ha
  nutritionalValue: {
    protein: number; // porcentaje
    energy: number; // Mcal/kg
    fiber: number; // porcentaje
  };
  seasonalVariation: {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  };
}

interface PastureRotationPlan {
  id: string;
  name: string;
  pastureIds: string[];
  rotationCycle: number; // días por rotación completa
  currentPasture: string;
  nextRotationDate: Date;
  isActive: boolean;
  createdDate: Date;
  notes?: string;
}

interface MapControls {
  showPastures: boolean;
  showWaterSources: boolean;
  showRotationPlan: boolean;
  showProductivity: boolean;
  showAnimals: boolean;
  editMode: boolean;
  selectedFilter: string;
  viewMode: "status" | "condition" | "capacity" | "productivity";
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
  {
    id: "pasture-3",
    name: "Potrero Nuevo Amanecer",
    code: "P-003",
    area: 12.7,
    coordinates: [
      [17.99, -92.945],
      [17.991, -92.945],
      [17.991, -92.9435],
      [17.99, -92.9435],
    ],
    status: "available",
    grassCondition: "fair",
    grassType: ["Pasto Natural"],
    carryingCapacity: 40,
    currentAnimals: 0,
    recommendedAnimals: 35,
    lastGrazingDate: new Date("2024-10-20"),
    restPeriodDays: 35,
    restingDays: 50,
    nextAvailableDate: new Date("2024-12-25"),
    soilType: "sandy",
    drainage: "excellent",
    slope: "moderate",
    waterSources: [
      {
        id: "ws-3",
        type: "well",
        position: [17.9905, -92.944],
        waterQuality: "excellent",
        isActive: true,
        lastTested: new Date("2024-12-12"),
      },
    ],
    shadedAreas: 5,
    fencing: {
      type: "electric",
      condition: "excellent",
      lastMaintenanceDate: new Date("2024-12-01"),
      needsRepair: false,
      segments: [
        { id: "seg-5", length: 600, condition: "good" },
        { id: "seg-6", length: 400, condition: "good" },
      ],
    },
    productivity: {
      averageDailyGain: 0.6,
      grassGrowthRate: 8,
      biomassPerHectare: 3200,
      nutritionalValue: {
        protein: 10,
        energy: 2.2,
        fiber: 32,
      },
      seasonalVariation: {
        spring: 1.0,
        summer: 0.8,
        autumn: 0.6,
        winter: 0.4,
      },
    },
    lastInspectionDate: new Date("2024-12-01"),
    nextInspectionDate: new Date("2025-01-01"),
    notes: "Necesita mejoramiento de pastos",
  },
];

const SAMPLE_ROTATION_PLANS: PastureRotationPlan[] = [
  {
    id: "rotation-1",
    name: "Rotación Grupo A",
    pastureIds: ["pasture-1", "pasture-2", "pasture-3"],
    rotationCycle: 84, // 12 semanas
    currentPasture: "pasture-1",
    nextRotationDate: new Date("2025-01-15"),
    isActive: true,
    createdDate: new Date("2024-10-01"),
    notes: "Plan de rotación para ganado de engorde",
  },
];

// Componente de mapa simulado para potreros
const PastureSimulatedMap: React.FC<{
  pastures: Pasture[];
  rotationPlans: PastureRotationPlan[];
  controls: MapControls;
  onPastureClick: (pasture: Pasture) => void;
}> = ({ pastures, rotationPlans, controls, onPastureClick }) => {
  // Función para obtener color según el estado del potrero
  const getPastureColor = (pasture: Pasture) => {
    if (controls.viewMode === "status") {
      switch (pasture.status) {
        case "occupied":
          return "#ef4444"; // rojo
        case "resting":
          return "#f59e0b"; // amarillo
        case "available":
          return "#22c55e"; // verde
        case "maintenance":
          return "#6b7280"; // gris
        default:
          return "#9ca3af";
      }
    } else if (controls.viewMode === "condition") {
      switch (pasture.grassCondition) {
        case "excellent":
          return "#10b981"; // verde oscuro
        case "good":
          return "#22c55e"; // verde
        case "fair":
          return "#f59e0b"; // amarillo
        case "poor":
          return "#ef4444"; // rojo
        case "depleted":
          return "#7f1d1d"; // rojo oscuro
        default:
          return "#9ca3af";
      }
    } else if (controls.viewMode === "capacity") {
      const utilization = pasture.currentAnimals / pasture.carryingCapacity;
      if (utilization > 0.9) return "#ef4444"; // sobrecarga
      if (utilization > 0.7) return "#f59e0b"; // alta utilización
      if (utilization > 0.3) return "#22c55e"; // utilización normal
      return "#3b82f6"; // baja utilización o vacío
    }
    return "#22c55e";
  };

  // Función para obtener el ícono según el estado
  const getPastureIcon = (pasture: Pasture) => {
    switch (pasture.status) {
      case "occupied":
        return <Users className="w-4 h-4 text-white" />;
      case "resting":
        return <Pause className="w-4 h-4 text-white" />;
      case "available":
        return <Play className="w-4 h-4 text-white" />;
      case "maintenance":
        return <Settings className="w-4 h-4 text-white" />;
      default:
        return <TreePine className="w-4 h-4 text-white" />;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-yellow-50 relative overflow-hidden rounded-lg">
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
              {/* Contenido del potrero */}
              <div className="p-2 h-full flex flex-col justify-between">
                {/* Header con código y estado */}
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

                {/* Información principal */}
                <div className="text-center">
                  <div className="text-sm font-semibold text-[#2d5a45] truncate">
                    {pasture.name}
                  </div>
                  <div className="text-xs text-gray-600">{pasture.area} ha</div>

                  {/* Información específica según el modo de vista */}
                  {controls.viewMode === "capacity" && (
                    <div className="text-xs">
                      <span className="font-medium">
                        {pasture.currentAnimals}
                      </span>
                      <span className="text-gray-500">
                        /{pasture.carryingCapacity}
                      </span>
                    </div>
                  )}

                  {controls.viewMode === "condition" && (
                    <div className="text-xs capitalize text-gray-600">
                      {pasture.grassCondition === "excellent"
                        ? "Excelente"
                        : pasture.grassCondition === "good"
                        ? "Bueno"
                        : pasture.grassCondition === "fair"
                        ? "Regular"
                        : pasture.grassCondition === "poor"
                        ? "Pobre"
                        : "Agotado"}
                    </div>
                  )}

                  {controls.viewMode === "status" && (
                    <div className="text-xs text-gray-600">
                      {pasture.status === "occupied"
                        ? "Ocupado"
                        : pasture.status === "resting"
                        ? "Descansando"
                        : pasture.status === "available"
                        ? "Disponible"
                        : "Mantenimiento"}
                    </div>
                  )}
                </div>

                {/* Footer con información adicional */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  {pasture.status === "resting" && (
                    <span>Descanso: {pasture.restingDays}d</span>
                  )}
                  {pasture.status === "occupied" && (
                    <span>
                      Desde: {pasture.lastGrazingDate.toLocaleDateString()}
                    </span>
                  )}
                  {pasture.waterSources.length > 0 && (
                    <Droplets className="w-3 h-3 text-blue-500" />
                  )}
                </div>
              </div>

              {/* Indicadores de alerta */}
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

            {/* Tooltip expandido al hover */}
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black/90 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              {pasture.name} - {pasture.grassType.join(", ")}
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
                {waterSource.type === "artificial_tank"
                  ? "Tanque"
                  : waterSource.type === "pond"
                  ? "Estanque"
                  : waterSource.type === "well"
                  ? "Pozo"
                  : "Arroyo"}
              </div>
            </motion.div>
          ))}

      {/* Plan de rotación visual */}
      {controls.showRotationPlan && rotationPlans.length > 0 && (
        <div className="absolute bottom-16 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <RotateCcw className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-[#2d5a45]">
              Plan de Rotación Activo
            </span>
          </div>
          {rotationPlans[0] && (
            <div className="space-y-1 text-xs">
              <div>
                <strong>{rotationPlans[0].name}</strong>
              </div>
              <div>Ciclo: {rotationPlans[0].rotationCycle} días</div>
              <div>
                Próxima rotación:{" "}
                {rotationPlans[0].nextRotationDate.toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Indicador de mapa simulado */}
      <div className="absolute bottom-4 left-4 bg-blue-500/10 border border-blue-500 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Vista de Potreros - Desarrollo</span>
        </div>
      </div>
    </div>
  );
};

export const PastureMap: React.FC<PastureMapProps> = ({ className }) => {
  // Estados principales del componente
  const [pastures] = useState<Pasture[]>(SAMPLE_PASTURES);
  const [rotationPlans] = useState<PastureRotationPlan[]>(
    SAMPLE_ROTATION_PLANS
  );
  const [mapControls, setMapControls] = useState<MapControls>({
    showPastures: true,
    showWaterSources: true,
    showRotationPlan: true,
    showProductivity: false,
    showAnimals: false,
    editMode: false,
    selectedFilter: "all",
    viewMode: "status",
  });

  // Estados para interacciones del mapa
  const [selectedPasture, setSelectedPasture] = useState<Pasture | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  // Referencias
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Coordenadas del centro del área de potreros (Villahermosa, Tabasco)
  const PASTURES_CENTER: [number, number] = [17.9895, -92.946];

  // Verificar si Leaflet está disponible
  useEffect(() => {
    const checkLeaflet = () => {
      if (typeof window !== "undefined" && window.L) {
        setIsLeafletLoaded(true);
        initializeMap();
      } else {
        console.log(
          "🗺️ Leaflet no disponible, usando mapa simulado de potreros"
        );
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

  // Inicializar mapa de Leaflet para potreros
  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    try {
      const map = window.L.map(mapRef.current, {
        center: PASTURES_CENTER,
        zoom: 15,
        zoomControl: true,
        attributionControl: true,
      });

      // Agregar capa de tiles satelital para mejor visualización de potreros
      window.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution:
            "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
          maxZoom: 18,
        }
      ).addTo(map);

      mapInstance.current = map;

      // Agregar potreros al mapa
      addPasturesToMap(map);

      console.log(
        "✅ Mapa de Leaflet para potreros inicializado correctamente"
      );
    } catch (error) {
      console.error("❌ Error inicializando mapa de potreros:", error);
    }
  };

  // Agregar potreros al mapa de Leaflet
  const addPasturesToMap = (map: any) => {
    if (!map || !window.L) return;

    // Agregar potreros como polígonos
    if (mapControls.showPastures) {
      pastures.forEach((pasture) => {
        const color = getPastureColorByMode(pasture, mapControls.viewMode);

        const polygon = window.L.polygon(pasture.coordinates, {
          color: color,
          fillColor: color,
          fillOpacity: 0.6,
          weight: 3,
        }).addTo(map);

        polygon.bindPopup(`
          <div style="padding: 12px; min-width: 250px;">
            <h3 style="margin: 0 0 8px 0; color: #2d5a45; font-weight: bold;">${
              pasture.name
            }</h3>
            <div style="margin-bottom: 8px;">
              <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: bold;">
                ${pasture.code}
              </span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0;">
              <div><strong>Área:</strong> ${pasture.area} ha</div>
              <div><strong>Estado:</strong> ${getStatusText(
                pasture.status
              )}</div>
              <div><strong>Animales:</strong> ${pasture.currentAnimals}/${
          pasture.carryingCapacity
        }</div>
              <div><strong>Condición:</strong> ${getConditionText(
                pasture.grassCondition
              )}</div>
            </div>
            <div style="margin: 8px 0;">
              <strong>Pastos:</strong> ${pasture.grassType.join(", ")}
            </div>
            ${
              pasture.status === "resting"
                ? `<div style="color: #f59e0b;"><strong>Descanso:</strong> ${pasture.restingDays}/${pasture.restPeriodDays} días</div>`
                : ""
            }
            ${
              pasture.notes
                ? `<div style="margin-top: 8px; padding: 6px; background: #f3f4f6; border-radius: 4px; font-style: italic; font-size: 12px;">${pasture.notes}</div>`
                : ""
            }
          </div>
        `);

        polygon.on("click", () => setSelectedPasture(pasture));
      });
    }

    // Agregar fuentes de agua
    if (mapControls.showWaterSources) {
      pastures.forEach((pasture) => {
        pasture.waterSources.forEach((waterSource) => {
          const marker = window.L.marker(waterSource.position).addTo(map);

          marker.bindPopup(`
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 4px 0; color: #2563eb; font-weight: bold;">Fuente de Agua</h4>
              <p style="margin: 0; text-transform: capitalize;">${getWaterSourceText(
                waterSource.type
              )}</p>
              <p style="margin: 4px 0 0 0;">Calidad: ${getWaterQualityText(
                waterSource.waterQuality
              )}</p>
              ${
                waterSource.capacity
                  ? `<p style="margin: 0;">Capacidad: ${waterSource.capacity} L</p>`
                  : ""
              }
              <p style="margin: 0; color: ${
                waterSource.isActive ? "#059669" : "#dc2626"
              };">
                ${waterSource.isActive ? "Activa" : "Inactiva"}
              </p>
            </div>
          `);
        });
      });
    }
  };

  const getPastureColorByMode = (pasture: Pasture, viewMode: string) => {
    if (viewMode === "status") {
      switch (pasture.status) {
        case "occupied":
          return "#ef4444";
        case "resting":
          return "#f59e0b";
        case "available":
          return "#22c55e";
        case "maintenance":
          return "#6b7280";
        default:
          return "#9ca3af";
      }
    } else if (viewMode === "condition") {
      switch (pasture.grassCondition) {
        case "excellent":
          return "#10b981";
        case "good":
          return "#22c55e";
        case "fair":
          return "#f59e0b";
        case "poor":
          return "#ef4444";
        case "depleted":
          return "#7f1d1d";
        default:
          return "#9ca3af";
      }
    } else if (viewMode === "capacity") {
      const utilization = pasture.currentAnimals / pasture.carryingCapacity;
      if (utilization > 0.9) return "#ef4444";
      if (utilization > 0.7) return "#f59e0b";
      if (utilization > 0.3) return "#22c55e";
      return "#3b82f6";
    }
    return "#22c55e";
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "occupied":
        return "Ocupado";
      case "resting":
        return "Descansando";
      case "available":
        return "Disponible";
      case "maintenance":
        return "Mantenimiento";
      default:
        return status;
    }
  };

  const getConditionText = (condition: string) => {
    switch (condition) {
      case "excellent":
        return "Excelente";
      case "good":
        return "Bueno";
      case "fair":
        return "Regular";
      case "poor":
        return "Pobre";
      case "depleted":
        return "Agotado";
      default:
        return condition;
    }
  };

  const getWaterSourceText = (type: string) => {
    switch (type) {
      case "well":
        return "Pozo";
      case "stream":
        return "Arroyo";
      case "pond":
        return "Estanque";
      case "artificial_tank":
        return "Tanque Artificial";
      default:
        return type;
    }
  };

  const getWaterQualityText = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "Excelente";
      case "good":
        return "Buena";
      case "fair":
        return "Regular";
      case "poor":
        return "Pobre";
      default:
        return quality;
    }
  };

  // Funciones para el manejo de controles
  const toggleMapControl = (control: keyof MapControls) => {
    setMapControls((prev) => ({
      ...prev,
      [control]: !prev[control],
    }));
  };

  const setViewMode = (
    mode: "status" | "condition" | "capacity" | "productivity"
  ) => {
    setMapControls((prev) => ({
      ...prev,
      viewMode: mode,
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
        className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[300px]"
      >
        {/* Título del mapa */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2d5a45] flex items-center gap-2">
            <TreePine className="w-5 h-5" />
            Mapa de Potreros
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
            placeholder="Buscar potreros..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
          />
        </div>

        {/* Modos de visualización */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Modo de Vista
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setViewMode("status")}
              className={cn(
                "px-3 py-2 text-xs rounded-md transition-colors",
                mapControls.viewMode === "status"
                  ? "bg-[#519a7c] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Estado
            </button>
            <button
              onClick={() => setViewMode("condition")}
              className={cn(
                "px-3 py-2 text-xs rounded-md transition-colors",
                mapControls.viewMode === "condition"
                  ? "bg-[#519a7c] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Condición
            </button>
            <button
              onClick={() => setViewMode("capacity")}
              className={cn(
                "px-3 py-2 text-xs rounded-md transition-colors",
                mapControls.viewMode === "capacity"
                  ? "bg-[#519a7c] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Capacidad
            </button>
            <button
              onClick={() => setViewMode("productivity")}
              className={cn(
                "px-3 py-2 text-xs rounded-md transition-colors",
                mapControls.viewMode === "productivity"
                  ? "bg-[#519a7c] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              Productividad
            </button>
          </div>
        </div>

        {/* Controles de visibilidad */}
        <div className="space-y-3 mb-4">
          <h3 className="text-sm font-medium text-gray-700">Mostrar en Mapa</h3>

          {/* Control de potreros */}
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <TreePine className="w-4 h-4 text-green-600" />
              Potreros
            </span>
            <input
              type="checkbox"
              checked={mapControls.showPastures}
              onChange={() => toggleMapControl("showPastures")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>

          {/* Control de fuentes de agua */}
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

          {/* Control de plan de rotación */}
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-orange-600" />
              Plan de Rotación
            </span>
            <input
              type="checkbox"
              checked={mapControls.showRotationPlan}
              onChange={() => toggleMapControl("showRotationPlan")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>

          {/* Control de animales */}
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              Ubicación del Ganado
            </span>
            <input
              type="checkbox"
              checked={mapControls.showAnimals}
              onChange={() => toggleMapControl("showAnimals")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>
        </div>

        {/* Estadísticas rápidas */}
        <div className="border-t pt-3">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Resumen</h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-green-50 p-2 rounded">
              <div className="text-green-700 font-medium">Disponibles</div>
              <div className="text-green-900 font-bold">
                {pastures.filter((p) => p.status === "available").length}
              </div>
            </div>
            <div className="bg-red-50 p-2 rounded">
              <div className="text-red-700 font-medium">Ocupados</div>
              <div className="text-red-900 font-bold">
                {pastures.filter((p) => p.status === "occupied").length}
              </div>
            </div>
            <div className="bg-yellow-50 p-2 rounded">
              <div className="text-yellow-700 font-medium">Descansando</div>
              <div className="text-yellow-900 font-bold">
                {pastures.filter((p) => p.status === "resting").length}
              </div>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <div className="text-gray-700 font-medium">Total Animales</div>
              <div className="text-gray-900 font-bold">
                {pastures.reduce((total, p) => total + p.currentAnimals, 0)}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Panel de información derecho */}
      <AnimatePresence>
        {selectedPasture && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
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
                        backgroundColor: getPastureColorByMode(
                          selectedPasture,
                          mapControls.viewMode
                        ),
                      }}
                    ></div>
                    {getStatusText(selectedPasture.status)}
                  </span>
                </div>
              </div>

              {/* Información de ocupación */}
              <div>
                <h5 className="font-medium text-[#2d5a45] mb-2">Ocupación</h5>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Actual:</span>
                    <p className="font-medium">
                      {selectedPasture.currentAnimals} animales
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Capacidad:</span>
                    <p className="font-medium">
                      {selectedPasture.carryingCapacity} animales
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Recomendado:</span>
                    <p className="font-medium">
                      {selectedPasture.recommendedAnimals} animales
                    </p>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Utilización</span>
                    <span>
                      {Math.round(
                        (selectedPasture.currentAnimals /
                          selectedPasture.carryingCapacity) *
                          100
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-[#519a7c] h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (selectedPasture.currentAnimals /
                            selectedPasture.carryingCapacity) *
                            100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Información de pastoreo */}
              <div>
                <h5 className="font-medium text-[#2d5a45] mb-2">
                  Estado del Pasto
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Condición:</span>
                    <p className="font-medium capitalize">
                      {getConditionText(selectedPasture.grassCondition)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Tipos de Pasto:</span>
                    <p className="font-medium">
                      {selectedPasture.grassType.join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información de rotación */}
              {(selectedPasture.status === "resting" ||
                selectedPasture.status === "occupied") && (
                <div>
                  <h5 className="font-medium text-[#2d5a45] mb-2">Rotación</h5>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedPasture.status === "resting" && (
                      <>
                        <div>
                          <span className="text-gray-500">
                            Días de descanso:
                          </span>
                          <p className="font-medium">
                            {selectedPasture.restingDays} /{" "}
                            {selectedPasture.restPeriodDays}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Disponible el:</span>
                          <p className="font-medium">
                            {selectedPasture.nextAvailableDate.toLocaleDateString()}
                          </p>
                        </div>
                      </>
                    )}
                    {selectedPasture.status === "occupied" && (
                      <>
                        <div>
                          <span className="text-gray-500">
                            Último pastoreo:
                          </span>
                          <p className="font-medium">
                            {selectedPasture.lastGrazingDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            Días pastoreando:
                          </span>
                          <p className="font-medium">
                            {Math.floor(
                              (Date.now() -
                                selectedPasture.lastGrazingDate.getTime()) /
                                (1000 * 60 * 60 * 24)
                            )}{" "}
                            días
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Recursos del potrero */}
              <div>
                <h5 className="font-medium text-[#2d5a45] mb-2">Recursos</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Fuentes de agua:</span>
                    <span className="font-medium">
                      {selectedPasture.waterSources.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Áreas con sombra:</span>
                    <span className="font-medium">
                      {selectedPasture.shadedAreas}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Estado de cercas:</span>
                    <span
                      className={cn(
                        "font-medium capitalize",
                        selectedPasture.fencing.condition === "excellent" &&
                          "text-green-600",
                        selectedPasture.fencing.condition === "good" &&
                          "text-green-600",
                        selectedPasture.fencing.condition === "fair" &&
                          "text-yellow-600",
                        selectedPasture.fencing.condition === "poor" &&
                          "text-red-600"
                      )}
                    >
                      {selectedPasture.fencing.condition === "excellent"
                        ? "Excelente"
                        : selectedPasture.fencing.condition === "good"
                        ? "Bueno"
                        : selectedPasture.fencing.condition === "fair"
                        ? "Regular"
                        : "Pobre"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Productividad */}
              <div>
                <h5 className="font-medium text-[#2d5a45] mb-2">
                  Productividad
                </h5>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Ganancia diaria:</span>
                    <p className="font-medium">
                      {selectedPasture.productivity.averageDailyGain} kg/animal
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Biomasa:</span>
                    <p className="font-medium">
                      {selectedPasture.productivity.biomassPerHectare} kg/ha
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Proteína:</span>
                    <p className="font-medium">
                      {selectedPasture.productivity.nutritionalValue.protein}%
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Fibra:</span>
                    <p className="font-medium">
                      {selectedPasture.productivity.nutritionalValue.fiber}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Notas */}
              {selectedPasture.notes && (
                <div>
                  <h5 className="font-medium text-[#2d5a45] mb-2">
                    Observaciones
                  </h5>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded italic">
                    {selectedPasture.notes}
                  </p>
                </div>
              )}

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

              {/* Botones de acción */}
              <div className="flex gap-2 mt-6 pt-4 border-t">
                <button className="flex-1 px-3 py-2 bg-[#519a7c] text-white rounded-md hover:bg-[#457e68] transition-colors text-sm">
                  Editar Potrero
                </button>
                <button className="px-3 py-2 text-[#519a7c] border border-[#519a7c] rounded-md hover:bg-[#519a7c] hover:text-white transition-colors text-sm">
                  Ver Historial
                </button>
                <button className="px-3 py-2 text-[#519a7c] border border-[#519a7c] rounded-md hover:bg-[#519a7c] hover:text-white transition-colors text-sm">
                  Programar
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
          <PastureSimulatedMap
            pastures={filteredPastures}
            rotationPlans={rotationPlans}
            controls={mapControls}
            onPastureClick={setSelectedPasture}
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
          Leyenda -{" "}
          {mapControls.viewMode === "status"
            ? "Estado"
            : mapControls.viewMode === "condition"
            ? "Condición"
            : mapControls.viewMode === "capacity"
            ? "Capacidad"
            : "Productividad"}
        </h4>
        <div className="space-y-2 text-xs">
          {mapControls.viewMode === "status" && (
            <>
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
            </>
          )}
          {mapControls.viewMode === "condition" && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-600 rounded"></div>
                <span>Excelente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Bueno</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Regular</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Pobre</span>
              </div>
            </>
          )}
          {mapControls.viewMode === "capacity" && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Sobrecargado ({">"}90%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Alta utilización (70-90%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Normal (30-70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Baja utilización ({"<"}30%)</span>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PastureMap;
