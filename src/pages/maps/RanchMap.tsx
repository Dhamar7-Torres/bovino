import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Home,
  TreePine,
  Droplets,
  Fence,
  Users,
  Settings,
  Maximize2,
  Minimize2,
  Search,
  Edit,
  X,
  Plus,
} from "lucide-react";

// Declaración global para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

// Interfaces principales para el mapa del rancho
interface RanchMapProps {
  className?: string;
}

interface RanchZone {
  id: string;
  name: string;
  type: "pasture" | "facility" | "water" | "forest" | "crop";
  coordinates: [number, number][];
  area: number; // en hectáreas
  capacity?: number; // capacidad de animales si aplica
  currentOccupancy?: number;
  color: string;
  description?: string;
}

interface RanchFacility {
  id: string;
  name: string;
  type:
    | "barn"
    | "water_source"
    | "feeding_station"
    | "veterinary"
    | "office"
    | "storage";
  position: [number, number];
  status: "active" | "maintenance" | "inactive";
  capacity?: number;
  description?: string;
}

interface MapControls {
  showZones: boolean;
  showFacilities: boolean;
  showBoundaries: boolean;
  showLivestock: boolean;
  editMode: boolean;
  selectedFilter: string;
}

// Función utilitaria para concatenar clases CSS
const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Datos de ejemplo para el rancho (ubicación Villahermosa, Tabasco)
const SAMPLE_ZONES: RanchZone[] = [
  {
    id: "zone-1",
    name: "Potrero Norte",
    type: "pasture",
    coordinates: [
      [17.989, -92.9475],
      [17.99, -92.9475],
      [17.99, -92.9465],
      [17.989, -92.9465],
    ],
    area: 15.5,
    capacity: 50,
    currentOccupancy: 32,
    color: "#22c55e",
    description: "Área principal de pastoreo para ganado adulto",
  },
  {
    id: "zone-2",
    name: "Potrero Sur",
    type: "pasture",
    coordinates: [
      [17.988, -92.9475],
      [17.989, -92.9475],
      [17.989, -92.9455],
      [17.988, -92.9455],
    ],
    area: 12.3,
    capacity: 40,
    currentOccupancy: 28,
    color: "#84cc16",
    description: "Área de pastoreo para ganado joven",
  },
  {
    id: "zone-3",
    name: "Zona de Cultivo",
    type: "crop",
    coordinates: [
      [17.99, -92.9455],
      [17.991, -92.9455],
      [17.991, -92.9445],
      [17.99, -92.9445],
    ],
    area: 8.7,
    color: "#eab308",
    description: "Área destinada al cultivo de forrajes",
  },
];

const SAMPLE_FACILITIES: RanchFacility[] = [
  {
    id: "facility-1",
    name: "Establo Principal",
    type: "barn",
    position: [17.9895, -92.947],
    status: "active",
    capacity: 100,
    description: "Establo principal para ordeño y refugio nocturno",
  },
  {
    id: "facility-2",
    name: "Pozo de Agua",
    type: "water_source",
    position: [17.989, -92.946],
    status: "active",
    description: "Fuente principal de agua para el ganado",
  },
  {
    id: "facility-3",
    name: "Centro Veterinario",
    type: "veterinary",
    position: [17.9905, -92.948],
    status: "maintenance",
    description: "Clínica veterinaria para atención médica",
  },
  {
    id: "facility-4",
    name: "Oficina Administrativa",
    type: "office",
    position: [17.9892, -92.9473],
    status: "active",
    description: "Oficinas administrativas del rancho",
  },
];

// Componente de mapa simulado para fallback
const SimulatedMap: React.FC<{
  zones: RanchZone[];
  facilities: RanchFacility[];
  controls: MapControls;
  onZoneClick: (zone: RanchZone) => void;
  onFacilityClick: (facility: RanchFacility) => void;
}> = ({ zones, facilities, controls, onZoneClick, onFacilityClick }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-yellow-50 relative overflow-hidden rounded-lg">
      {/* Fondo del mapa simulado */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Título del mapa */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <span className="font-medium text-[#2d5a45]">
            Rancho - Villahermosa, Tabasco
          </span>
        </div>
      </div>

      {/* Simulación de zonas */}
      {controls.showZones &&
        zones.map((zone, index) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="absolute cursor-pointer hover:scale-105 transition-transform"
            style={{
              left: `${20 + index * 25}%`,
              top: `${30 + index * 15}%`,
              width: "120px",
              height: "80px",
            }}
            onClick={() => onZoneClick(zone)}
          >
            <div
              className="w-full h-full rounded-lg border-2 border-opacity-60 flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: zone.color + "40",
                borderColor: zone.color,
              }}
            >
              <div className="text-center text-xs">
                <div className="font-semibold text-[#2d5a45]">{zone.name}</div>
                <div className="text-gray-600">{zone.area} ha</div>
                {zone.currentOccupancy && zone.capacity && (
                  <div className="text-gray-500">
                    {zone.currentOccupancy}/{zone.capacity}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}

      {/* Simulación de instalaciones */}
      {controls.showFacilities &&
        facilities.map((facility, index) => (
          <motion.div
            key={facility.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="absolute cursor-pointer hover:scale-110 transition-transform"
            style={{
              left: `${25 + index * 20}%`,
              top: `${20 + index * 20}%`,
            }}
            onClick={() => onFacilityClick(facility)}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white",
                facility.status === "active" && "bg-green-500",
                facility.status === "maintenance" && "bg-yellow-500",
                facility.status === "inactive" && "bg-red-500"
              )}
            >
              {facility.type === "barn" && (
                <Home className="w-5 h-5 text-white" />
              )}
              {facility.type === "water_source" && (
                <Droplets className="w-5 h-5 text-white" />
              )}
              {facility.type === "veterinary" && (
                <Plus className="w-5 h-5 text-white" />
              )}
              {facility.type === "office" && (
                <Settings className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-[#2d5a45] whitespace-nowrap shadow-sm">
              {facility.name}
            </div>
          </motion.div>
        ))}

      {/* Simulación de límites */}
      {controls.showBoundaries && (
        <div className="absolute inset-4 border-2 border-dashed border-gray-400 rounded-lg pointer-events-none">
          <div className="absolute -top-6 left-0 bg-white/90 px-2 py-1 rounded text-xs text-gray-600">
            Límite del Rancho
          </div>
        </div>
      )}

      {/* Indicador de mapa simulado */}
      <div className="absolute bottom-4 left-4 bg-blue-500/10 border border-blue-500 rounded-lg px-3 py-2">
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>Mapa Simulado - Vista de Desarrollo</span>
        </div>
      </div>
    </div>
  );
};

export const RanchMap: React.FC<RanchMapProps> = ({ className }) => {
  // Estados principales del componente
  const [zones] = useState<RanchZone[]>(SAMPLE_ZONES);
  const [facilities] = useState<RanchFacility[]>(SAMPLE_FACILITIES);
  const [mapControls, setMapControls] = useState<MapControls>({
    showZones: true,
    showFacilities: true,
    showBoundaries: true,
    showLivestock: false,
    editMode: false,
    selectedFilter: "all",
  });

  // Estados para interacciones del mapa
  const [selectedZone, setSelectedZone] = useState<RanchZone | null>(null);
  const [selectedFacility, setSelectedFacility] =
    useState<RanchFacility | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);

  // Referencias
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Coordenadas del centro del rancho (Villahermosa, Tabasco)
  const RANCH_CENTER: [number, number] = [17.9895, -92.947];

  // Verificar si Leaflet está disponible
  useEffect(() => {
    const checkLeaflet = () => {
      if (typeof window !== "undefined" && window.L) {
        setIsLeafletLoaded(true);
        initializeMap();
      } else {
        console.log("🗺️ Leaflet no disponible, usando mapa simulado");
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

  // Inicializar mapa de Leaflet
  const initializeMap = () => {
    if (!mapRef.current || !window.L) return;

    try {
      const map = window.L.map(mapRef.current, {
        center: RANCH_CENTER,
        zoom: 16,
        zoomControl: true,
        attributionControl: true,
      });

      // Agregar capa de tiles
      window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      mapInstance.current = map;

      // Agregar elementos del rancho al mapa
      addRanchElementsToMap(map);

      console.log("✅ Mapa de Leaflet inicializado correctamente");
    } catch (error) {
      console.error("❌ Error inicializando mapa de Leaflet:", error);
    }
  };

  // Agregar elementos del rancho al mapa de Leaflet
  const addRanchElementsToMap = (map: any) => {
    if (!map || !window.L) return;

    // Agregar zonas
    if (mapControls.showZones) {
      zones.forEach((zone) => {
        const polygon = window.L.polygon(zone.coordinates, {
          color: zone.color,
          fillColor: zone.color,
          fillOpacity: 0.4,
          weight: 2,
        }).addTo(map);

        polygon.bindPopup(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; color: #2d5a45; font-weight: bold;">${
              zone.name
            }</h3>
            <p style="margin: 0; color: #666; text-transform: capitalize;">${
              zone.type
            }</p>
            <p style="margin: 4px 0 0 0;">Área: ${zone.area} hectáreas</p>
            ${
              zone.capacity
                ? `<p style="margin: 0;">Ocupación: ${
                    zone.currentOccupancy || 0
                  } / ${zone.capacity} animales</p>`
                : ""
            }
          </div>
        `);

        polygon.on("click", () => setSelectedZone(zone));
      });
    }

    // Agregar instalaciones
    if (mapControls.showFacilities) {
      facilities.forEach((facility) => {
        const marker = window.L.marker(facility.position).addTo(map);

        marker.bindPopup(`
          <div style="padding: 8px;">
            <h3 style="margin: 0 0 4px 0; color: #2d5a45; font-weight: bold;">${
              facility.name
            }</h3>
            <p style="margin: 0; color: #666; text-transform: capitalize;">${facility.type.replace(
              "_",
              " "
            )}</p>
            <p style="margin: 4px 0 0 0; font-weight: bold;">
              Estado: ${
                facility.status === "active"
                  ? "Activo"
                  : facility.status === "maintenance"
                  ? "Mantenimiento"
                  : "Inactivo"
              }
            </p>
            ${
              facility.capacity
                ? `<p style="margin: 0;">Capacidad: ${facility.capacity}</p>`
                : ""
            }
          </div>
        `);

        marker.on("click", () => setSelectedFacility(facility));
      });
    }
  };

  // Funciones para el manejo de controles
  const toggleMapControl = (control: keyof MapControls) => {
    setMapControls((prev) => ({
      ...prev,
      [control]: !prev[control],
    }));
  };

  // Función para filtrar elementos según la búsqueda
  const filteredFacilities = facilities.filter(
    (facility) =>
      facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facility.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredZones = zones.filter(
    (zone) =>
      zone.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      zone.type.toLowerCase().includes(searchQuery.toLowerCase())
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
        className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[280px]"
      >
        {/* Título del mapa */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#2d5a45] flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Mapa del Rancho
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
            placeholder="Buscar zonas o instalaciones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
          />
        </div>

        {/* Controles de visibilidad */}
        <div className="space-y-3 mb-4">
          <h3 className="text-sm font-medium text-gray-700">Mostrar en Mapa</h3>

          {/* Control de zonas */}
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <TreePine className="w-4 h-4 text-green-600" />
              Zonas del Rancho
            </span>
            <input
              type="checkbox"
              checked={mapControls.showZones}
              onChange={() => toggleMapControl("showZones")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>

          {/* Control de instalaciones */}
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Home className="w-4 h-4 text-blue-600" />
              Instalaciones
            </span>
            <input
              type="checkbox"
              checked={mapControls.showFacilities}
              onChange={() => toggleMapControl("showFacilities")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>

          {/* Control de límites */}
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Fence className="w-4 h-4 text-gray-600" />
              Límites y Cercas
            </span>
            <input
              type="checkbox"
              checked={mapControls.showBoundaries}
              onChange={() => toggleMapControl("showBoundaries")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>

          {/* Control de ganado */}
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4 text-orange-600" />
              Ubicación del Ganado
            </span>
            <input
              type="checkbox"
              checked={mapControls.showLivestock}
              onChange={() => toggleMapControl("showLivestock")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>
        </div>

        {/* Modo de edición */}
        <div className="border-t pt-3">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Modo Edición
            </span>
            <input
              type="checkbox"
              checked={mapControls.editMode}
              onChange={() => toggleMapControl("editMode")}
              className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
            />
          </label>
          {mapControls.editMode && (
            <p className="text-xs text-gray-500 mt-1">
              Haz clic en el mapa para agregar puntos
            </p>
          )}
        </div>
      </motion.div>

      {/* Panel de información derecho */}
      <AnimatePresence>
        {(selectedZone || selectedFacility) && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={panelVariants}
            className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[300px] max-w-[400px]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#2d5a45]">
                {selectedZone
                  ? "Información de Zona"
                  : "Información de Instalación"}
              </h3>
              <button
                onClick={() => {
                  setSelectedZone(null);
                  setSelectedFacility(null);
                }}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {selectedZone && (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-[#2d5a45]">
                    {selectedZone.name}
                  </h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedZone.type}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Área:</span>
                    <p className="font-medium">{selectedZone.area} ha</p>
                  </div>
                  {selectedZone.capacity && (
                    <div>
                      <span className="text-gray-500">Capacidad:</span>
                      <p className="font-medium">
                        {selectedZone.capacity} animales
                      </p>
                    </div>
                  )}
                  {selectedZone.currentOccupancy && (
                    <div>
                      <span className="text-gray-500">Ocupación:</span>
                      <p className="font-medium">
                        {selectedZone.currentOccupancy} animales
                      </p>
                    </div>
                  )}
                  {selectedZone.capacity && selectedZone.currentOccupancy && (
                    <div>
                      <span className="text-gray-500">Utilización:</span>
                      <p className="font-medium">
                        {Math.round(
                          (selectedZone.currentOccupancy /
                            selectedZone.capacity) *
                            100
                        )}
                        %
                      </p>
                    </div>
                  )}
                </div>

                {selectedZone.description && (
                  <div>
                    <span className="text-gray-500 text-sm">Descripción:</span>
                    <p className="text-sm mt-1">{selectedZone.description}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-3 py-2 bg-[#519a7c] text-white rounded-md hover:bg-[#457e68] transition-colors text-sm">
                    Editar Zona
                  </button>
                  <button className="px-3 py-2 text-[#519a7c] border border-[#519a7c] rounded-md hover:bg-[#519a7c] hover:text-white transition-colors text-sm">
                    Ver Detalles
                  </button>
                </div>
              </div>
            )}

            {selectedFacility && (
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-[#2d5a45]">
                    {selectedFacility.name}
                  </h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedFacility.type.replace("_", " ")}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Estado:</span>
                    <p
                      className={cn(
                        "font-medium capitalize",
                        selectedFacility.status === "active" &&
                          "text-green-600",
                        selectedFacility.status === "maintenance" &&
                          "text-yellow-600",
                        selectedFacility.status === "inactive" && "text-red-600"
                      )}
                    >
                      {selectedFacility.status === "active"
                        ? "Activo"
                        : selectedFacility.status === "maintenance"
                        ? "Mantenimiento"
                        : "Inactivo"}
                    </p>
                  </div>
                  {selectedFacility.capacity && (
                    <div>
                      <span className="text-gray-500">Capacidad:</span>
                      <p className="font-medium">{selectedFacility.capacity}</p>
                    </div>
                  )}
                </div>

                {selectedFacility.description && (
                  <div>
                    <span className="text-gray-500 text-sm">Descripción:</span>
                    <p className="text-sm mt-1">
                      {selectedFacility.description}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button className="flex-1 px-3 py-2 bg-[#519a7c] text-white rounded-md hover:bg-[#457e68] transition-colors text-sm">
                    Editar Instalación
                  </button>
                  <button className="px-3 py-2 text-[#519a7c] border border-[#519a7c] rounded-md hover:bg-[#519a7c] hover:text-white transition-colors text-sm">
                    Ver Detalles
                  </button>
                </div>
              </div>
            )}
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
          <SimulatedMap
            zones={filteredZones}
            facilities={filteredFacilities}
            controls={mapControls}
            onZoneClick={setSelectedZone}
            onFacilityClick={setSelectedFacility}
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
        <h4 className="text-sm font-semibold text-[#2d5a45] mb-2">Leyenda</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500/60 border border-green-500 rounded"></div>
            <span>Pastoreo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500/60 border border-yellow-500 rounded"></div>
            <span>Cultivo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500/60 border border-blue-500 rounded"></div>
            <span>Instalaciones</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500/60 border border-gray-500 rounded"></div>
            <span>Límites</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RanchMap;
