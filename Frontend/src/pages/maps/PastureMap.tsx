import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  Maximize2,
  Minimize2,
  Search,
  X,
  AlertTriangle,
  RefreshCw,
  Plus,
  Save,
  Crosshair,
  Trash2,
  Target,
  Info,
  Leaf,
  Eye,
} from "lucide-react";

// Declaración global para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

// Interfaces principales
interface PastureMapProps {
  className?: string;
}

interface PastureData {
  id: string;
  name: string;
  area: number; // en hectáreas
  grassType: string;
  capacity: number; // número de cabezas de ganado
  status: "excellent" | "good" | "fair" | "poor";
  lastGrazed?: Date;
  soilCondition?: "excellent" | "good" | "fair" | "poor";
  notes?: string;
}

interface PastureLocationPin {
  id: string;
  pasture: PastureData;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  waterSource: boolean;
  fencing: "excellent" | "good" | "needs_repair" | "poor";
  notes?: string;
  addedBy: "gps" | "manual";
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

// Componente de mapa simulado mejorado
const PastureSimulatedMap: React.FC<{
  pasturePins: PastureLocationPin[];
  userLocation: UserLocation | null;
  onPinClick: (pin: PastureLocationPin) => void;
}> = ({ pasturePins, userLocation, onPinClick }) => {
  
  // Función para obtener color según el estado de la pastura
  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "#22c55e"; // Verde brillante
      case "good": return "#3b82f6"; // Azul
      case "fair": return "#f59e0b"; // Amarillo/Naranja
      case "poor": return "#ef4444"; // Rojo
      default: return "#9ca3af"; // Gris
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "excellent": return "Excelente";
      case "good": return "Bueno";
      case "fair": return "Regular";
      case "poor": return "Pobre";
      default: return "Desconocido";
    }
  };

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
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md pointer-events-none">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-[#519a7c]" />
          <span className="font-medium text-[#2d5a45]">
            Mapa de Pasturas - {pasturePins.length} registradas
          </span>
          {pasturePins.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-[#519a7c]">
              <div className="w-2 h-2 bg-[#519a7c] rounded-full animate-pulse"></div>
              <span>ACTIVO</span>
            </div>
          )}
        </div>
      </div>

      {/* Renderizado de ubicación del usuario */}
      {userLocation && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute pointer-events-none z-20"
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
          </div>
        </motion.div>
      )}

      {/* Renderizado de pins de pastura */}
      {pasturePins.map((pin, index) => {
        // Posición distribuida para el mapa simulado
        const leftPercent = 15 + (index % 7) * 12;
        const topPercent = 15 + Math.floor(index / 7) * 15;
        
        return (
          <motion.div
            key={pin.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 200 }}
            className="absolute cursor-pointer hover:scale-125 transition-all duration-200 group z-10"
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => onPinClick(pin)}
          >
            <div className="relative">
              {/* Pin principal */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative animate-pulse hover:animate-none"
                style={{ backgroundColor: getStatusColor(pin.pasture.status) }}
              >
                <Leaf className="w-6 h-6 text-white font-bold" />
                
                {/* Indicador de fuente de agua */}
                {pin.waterSource && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Etiqueta con nombre */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg">
                {pin.pasture.name}
              </div>

              {/* Tooltip detallado al hover */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black/95 text-white text-sm rounded-lg px-4 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-30 shadow-2xl">
                <div className="space-y-2">
                  <div className="font-bold text-yellow-300">
                    {pin.pasture.name}
                  </div>
                  <div>
                    {pin.pasture.area} ha • {pin.pasture.grassType}
                  </div>
                  <div>Capacidad: {pin.pasture.capacity} cabezas</div>
                  <div className="text-green-300">Estado: {getStatusLabel(pin.pasture.status)}</div>
                  <div className="text-blue-300">Registrado: {pin.timestamp.toLocaleTimeString()}</div>
                  <div className="text-gray-300">Precisión: ±{pin.accuracy}m</div>
                  {pin.waterSource && <div className="text-cyan-300">💧 Con fuente de agua</div>}
                  {pin.notes && <div className="text-purple-300">Nota: {pin.notes}</div>}
                </div>
                {/* Flecha del tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/95"></div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Mensaje si no hay pins */}
      {pasturePins.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-600 bg-white/90 p-8 rounded-xl shadow-lg backdrop-blur-sm"
        >
          <Leaf className="w-16 h-16 mx-auto mb-4 text-[#519a7c]" />
          <h3 className="text-xl font-bold text-[#2d5a45] mb-2">¡Bienvenido al Mapa de Pasturas!</h3>
          <p className="text-base mb-2">No hay pasturas registradas aún</p>
          <p className="text-sm text-gray-500">Haz clic en "Agregar Pastura" para comenzar el registro</p>
          <div className="mt-4 text-xs text-blue-600">
            📍 Los pins aparecerán aquí una vez que agregues pasturas
          </div>
        </motion.div>
      )}

      {/* Contador de pins en tiempo real */}
      {pasturePins.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-[#519a7c] text-white px-4 py-2 rounded-full shadow-lg"
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <Leaf className="w-4 h-4" />
            <span>{pasturePins.length} Pastura{pasturePins.length !== 1 ? 's' : ''} en el Mapa</span>
          </div>
        </motion.div>
      )}

      {/* Leyenda del mapa actualizada */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
        <h4 className="text-sm font-semibold text-[#2d5a45] mb-2">
          Estados de las Pasturas
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Excelente</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Bueno</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Regular</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Pobre</span>
          </div>
        </div>
      </div>

      {/* Indicador de mapa simulado */}
      <div className="absolute bottom-4 left-4 bg-blue-500/10 border border-blue-500 rounded-lg px-3 py-2 pointer-events-none">
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <span>GPS Tracking - Modo Desarrollo</span>
        </div>
      </div>
    </div>
  );
};

export const PastureMap: React.FC<PastureMapProps> = ({ className }) => {
  // Estados principales
  const [pasturePins, setPasturePins] = useState<PastureLocationPin[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPin, setSelectedPin] = useState<PastureLocationPin | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  
  // Estados para agregar pastura
  const [showAddPastureDialog, setShowAddPastureDialog] = useState(false);
  const [pastureForm, setPastureForm] = useState<PastureData>({
    id: "",
    name: "",
    area: 0,
    grassType: "",
    capacity: 0,
    status: "excellent",
    soilCondition: "good",
    notes: "",
  });
  
  // Estados para ubicación
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [currentPasture, setCurrentPasture] = useState<PastureData | null>(null);
  const [locationForm, setLocationForm] = useState({
    waterSource: false,
    fencing: "good" as "excellent" | "good" | "needs_repair" | "poor",
    notes: "",
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Referencias
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Coordenadas del centro del área (Villahermosa, Tabasco)
  const RANCH_CENTER: [number, number] = [17.989, -92.9465];

  // Función para agregar nueva pastura
  const handleAddPasture = useCallback(() => {
    if (!pastureForm.name.trim() || !pastureForm.grassType.trim() || pastureForm.area <= 0) {
      alert("Por favor completa los campos obligatorios (Nombre, Tipo de Pasto, Área)");
      return;
    }

    const newPasture: PastureData = {
      ...pastureForm,
      id: `pasture-${Date.now()}`,
      name: pastureForm.name.trim(),
      grassType: pastureForm.grassType.trim(),
      notes: pastureForm.notes?.trim() || undefined,
    };

    setCurrentPasture(newPasture);
    setShowAddPastureDialog(false);
    
    // Limpiar formulario
    setPastureForm({
      id: "",
      name: "",
      area: 0,
      grassType: "",
      capacity: 0,
      status: "excellent",
      soilCondition: "good",
      notes: "",
    });

    // Proceder a obtener ubicación
    getCurrentLocation();
  }, [pastureForm]);

  // Función mejorada para obtener la ubicación actual del usuario
  const getCurrentLocation = useCallback(async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    // Verificar si la geolocalización está disponible
    if (!navigator.geolocation) {
      setLocationError("La geolocalización no está soportada en este navegador");
      setIsGettingLocation(false);
      return;
    }

    // Verificar permisos primero
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'denied') {
        setLocationError("Permiso de ubicación denegado. Por favor, habilita la ubicación en tu navegador.");
        setIsGettingLocation(false);
        return;
      }
    } catch (error) {
      console.log('⚠️ No se pudo verificar permisos de geolocalización');
    }

    // Opciones mejoradas para obtener ubicación
    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        };

        setUserLocation(location);
        setShowLocationDialog(true);
        setIsGettingLocation(false);
        setLocationError(null);
      },
      (error) => {
        let errorMessage = "Error obteniendo ubicación";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado. Por favor, permite el acceso a la ubicación y recarga la página.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Ubicación no disponible. Verifica que el GPS esté activado y tengas conexión.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado. Intenta nuevamente o verifica tu conexión GPS.";
            break;
          default:
            errorMessage = `Error desconocido obteniendo ubicación (código: ${error.code})`;
        }
        
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      options
    );
  }, []);

  // Función para registrar la ubicación de la pastura
  const registerPastureLocation = useCallback(() => {
    if (!currentPasture || !userLocation) return;

    const newPin: PastureLocationPin = {
      id: `pin-${Date.now()}`,
      pasture: currentPasture,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      accuracy: userLocation.accuracy,
      timestamp: new Date(),
      waterSource: locationForm.waterSource,
      fencing: locationForm.fencing,
      notes: locationForm.notes.trim() || undefined,
      addedBy: "gps",
    };
    
    setPasturePins(prev => [...prev, newPin]);
    
    // Limpiar estados
    setLocationForm({ waterSource: false, fencing: "good", notes: "" });
    setCurrentPasture(null);
    setUserLocation(null);
    setShowLocationDialog(false);

    // Mostrar mensaje de éxito
    setSuccessMessage(`¡Pastura ${newPin.pasture.name} registrada exitosamente en el mapa!`);
    setTimeout(() => setSuccessMessage(null), 5000);
  }, [currentPasture, userLocation, locationForm]);

  // Función para eliminar un pin
  const removePin = useCallback((pinId: string) => {
    setPasturePins(prev => prev.filter(p => p.id !== pinId));
    setSelectedPin(null);
  }, []);

  // Función para manejar clic en pin
  const handlePinClick = useCallback((pin: PastureLocationPin) => {
    setSelectedPin(pin);
  }, []);

  // Verificar si Leaflet está disponible
  useEffect(() => {
    const checkLeaflet = () => {
      if (typeof window !== "undefined" && window.L) {
        setIsLeafletLoaded(true);
        setTimeout(() => initializeMap(), 500);
      }
    };

    checkLeaflet();

    // Intentar cargar Leaflet si no está disponible
    if (!isLeafletLoaded && typeof window !== "undefined") {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => checkLeaflet();
      script.onerror = () => console.log("❌ Error cargando Leaflet, continuando con mapa simulado");
      document.head.appendChild(script);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    return () => {
      if (mapInstance.current) {
        try {
          mapInstance.current.remove();
          mapInstance.current = null;
        } catch (error) {
          console.log("⚠️ Error limpiando mapa:", error);
        }
      }
    };
  }, []);

  // Inicializar mapa de Leaflet
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.L || mapInstance.current) return;

    try {
      const map = window.L.map(mapRef.current, {
        center: RANCH_CENTER,
        zoom: 16,
        zoomControl: true,
        attributionControl: true,
      });

      window.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri",
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstance.current = map;

      // Agregar pins existentes si los hay
      if (pasturePins.length > 0) {
        pasturePins.forEach((pin) => addPinToMap(map, pin));
      }

    } catch (error) {
      console.error("❌ Error inicializando mapa de Leaflet:", error);
      setIsLeafletLoaded(false);
    }
  }, [pasturePins]);

  // Actualizar Leaflet cuando cambien los pins
  useEffect(() => {
    if (mapInstance.current && isLeafletLoaded && pasturePins.length > 0) {
      // Limpiar marcadores existentes
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof window.L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });
      
      // Agregar todos los pins actuales
      pasturePins.forEach((pin) => addPinToMap(mapInstance.current, pin));
    }
  }, [pasturePins, isLeafletLoaded]);

  // Agregar un pin individual al mapa de Leaflet
  const addPinToMap = useCallback((map: any, pin: PastureLocationPin) => {
    if (!map || !window.L) return;

    try {
      const marker = window.L.marker([pin.latitude, pin.longitude]).addTo(map);

      marker.bindPopup(`
        <div style="padding: 15px; min-width: 280px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 10px 0; color: #2d5a45; font-weight: bold; font-size: 18px;">
            🌱 ${pin.pasture.name}
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0;">
            <div><strong>Área:</strong> ${pin.pasture.area} ha</div>
            <div><strong>Tipo de Pasto:</strong> ${pin.pasture.grassType}</div>
            <div><strong>Capacidad:</strong> ${pin.pasture.capacity} cabezas</div>
            <div><strong>Estado:</strong> ${pin.pasture.status}</div>
            ${pin.pasture.soilCondition ? `<div><strong>Suelo:</strong> ${pin.pasture.soilCondition}</div>` : ''}
            ${pin.pasture.lastGrazed ? `<div><strong>Último Pastoreo:</strong> ${pin.pasture.lastGrazed.toLocaleDateString()}</div>` : ''}
          </div>
          <div style="margin: 10px 0; padding: 10px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <div style="font-weight: bold; color: #166534; margin-bottom: 5px;">📍 Información de Ubicación:</div>
            <div><strong>Cercado:</strong> ${pin.fencing}</div>
            <div><strong>Fuente de Agua:</strong> ${pin.waterSource ? 'Sí' : 'No'}</div>
            <div><strong>Registrado:</strong> ${pin.timestamp.toLocaleString()}</div>
            <div><strong>Precisión GPS:</strong> ±${pin.accuracy}m</div>
          </div>
          ${pin.notes ? `
            <div style="margin: 10px 0; padding: 10px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <div style="font-weight: bold; color: #92400e; margin-bottom: 5px;">📝 Observaciones:</div>
              <div style="font-style: italic;">"${pin.notes}"</div>
            </div>
          ` : ''}
        </div>
      `);

      marker.on("click", () => handlePinClick(pin));

      // Centrar mapa en el nuevo pin solo si es el primero
      if (pasturePins.length <= 1) {
        map.setView([pin.latitude, pin.longitude], 17);
      }

    } catch (error) {
      console.error("❌ Error agregando pin a Leaflet:", error);
    }
  }, [handlePinClick, pasturePins.length]);

  // Filtrar pins según búsqueda
  const filteredPins = pasturePins.filter(
    (pin) =>
      pin.pasture.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.pasture.grassType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.pasture.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <div
        className={cn(
          "relative w-full overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl",
          isFullscreen ? "fixed inset-4 z-50" : "h-[calc(100vh-3rem)]",
          className
        )}
      >
        {/* Panel de control principal */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[320px] max-h-[calc(100vh-2rem)] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#2d5a45] flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Mapa de Pasturas
            </h2>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Botón principal para agregar pastura */}
          <div className="mb-4">
            <button
              onClick={() => setShowAddPastureDialog(true)}
              disabled={isGettingLocation}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                isGettingLocation
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#519a7c] text-white hover:bg-[#457e68] shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              )}
            >
              {isGettingLocation ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {isGettingLocation ? "Obteniendo ubicación..." : "Agregar Pastura"}
            </button>
          </div>

          {/* Error de ubicación */}
          <AnimatePresence>
            {locationError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-medium">Error de Ubicación</span>
                </div>
                <p className="text-sm text-red-600 mb-3">{locationError}</p>
                <button
                  onClick={getCurrentLocation}
                  className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors"
                >
                  Intentar nuevamente
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mensaje de éxito */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-center gap-2 text-green-700">
                  <Target className="w-4 h-4" />
                  <span className="font-medium">¡Éxito!</span>
                </div>
                <p className="text-sm text-green-600 mt-1">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Barra de búsqueda */}
          {pasturePins.length > 0 && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, tipo de pasto o estado..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Lista de pasturas registradas */}
          {pasturePins.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Pasturas Registradas ({filteredPins.length})
                </h3>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredPins
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((pin) => (
                  <motion.div 
                    key={pin.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => handlePinClick(pin)}>
                      <div className="font-medium text-sm">
                        {pin.pasture.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {pin.pasture.area} ha • {pin.pasture.grassType}
                      </div>
                      <div className="text-xs text-blue-600 capitalize">
                        {pin.pasture.status} • Cap: {pin.pasture.capacity} cabezas
                      </div>
                      {pin.waterSource && (
                        <div className="text-xs text-cyan-600">
                          💧 Con fuente de agua
                        </div>
                      )}
                      {pin.notes && (
                        <div className="text-xs text-gray-600 italic mt-1 truncate">
                          "{pin.notes}"
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePinClick(pin)}
                        className="text-[#519a7c] hover:text-[#457e68] p-1 opacity-0 group-hover:opacity-100 transition-all"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => removePin(pin.id)}
                        className="text-red-500 hover:text-red-700 p-1 ml-2 opacity-0 group-hover:opacity-100 transition-all"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje si no hay pasturas */}
          {pasturePins.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Leaf className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No hay pasturas registradas</p>
              <p className="text-xs">Haz clic en "Agregar Pastura" para comenzar</p>
            </div>
          )}

          {/* Resumen */}
          {pasturePins.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-t pt-3 mt-4"
            >
              <h3 className="text-sm font-medium text-gray-700 mb-2">Resumen</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-green-700 font-medium">Total</div>
                  <div className="text-green-900 font-bold">{pasturePins.length}</div>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-blue-700 font-medium">Área Total</div>
                  <div className="text-blue-900 font-bold">
                    {pasturePins.reduce((total, pin) => total + pin.pasture.area, 0).toFixed(1)} ha
                  </div>
                </div>
              </div>
            </motion.div>
          )}
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
                className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">
                  Agregar Nueva Pastura
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Pastura *
                    </label>
                    <input
                      type="text"
                      value={pastureForm.name}
                      onChange={(e) => setPastureForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Pastura Norte, Las Flores"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Área (hectáreas) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={pastureForm.area || ""}
                        onChange={(e) => setPastureForm(prev => ({ 
                          ...prev, 
                          area: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="Ej: 5.5"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacidad (cabezas)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={pastureForm.capacity || ""}
                        onChange={(e) => setPastureForm(prev => ({ 
                          ...prev, 
                          capacity: parseInt(e.target.value) || 0 
                        }))}
                        placeholder="Ej: 25"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Pasto *
                    </label>
                    <input
                      type="text"
                      value={pastureForm.grassType}
                      onChange={(e) => setPastureForm(prev => ({ ...prev, grassType: e.target.value }))}
                      placeholder="Ej: Estrella, Guinea, Brachiaria"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado de la pastura
                      </label>
                      <select
                        value={pastureForm.status}
                        onChange={(e) => setPastureForm(prev => ({ 
                          ...prev, 
                          status: e.target.value as "excellent" | "good" | "fair" | "poor"
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      >
                        <option value="excellent">Excelente</option>
                        <option value="good">Bueno</option>
                        <option value="fair">Regular</option>
                        <option value="poor">Pobre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condición del Suelo
                      </label>
                      <select
                        value={pastureForm.soilCondition}
                        onChange={(e) => setPastureForm(prev => ({ 
                          ...prev, 
                          soilCondition: e.target.value as "excellent" | "good" | "fair" | "poor"
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      >
                        <option value="excellent">Excelente</option>
                        <option value="good">Buena</option>
                        <option value="fair">Regular</option>
                        <option value="poor">Mala</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones
                    </label>
                    <textarea
                      value={pastureForm.notes || ""}
                      onChange={(e) => setPastureForm(prev => ({ ...prev, notes: e.target.value || undefined }))}
                      placeholder="Notas sobre la pastura, condiciones especiales..."
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
                    onClick={handleAddPasture}
                    className="flex-1 px-4 py-2 bg-[#519a7c] text-white rounded-md hover:bg-[#457e68] transition-colors flex items-center justify-center gap-2"
                  >
                    <Target className="w-4 h-4" />
                    Continuar
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dialog para registrar ubicación */}
        <AnimatePresence>
          {showLocationDialog && currentPasture && userLocation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4"
              onClick={() => setShowLocationDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">
                  Registrar Ubicación de la Pastura
                </h3>

                <div className="mb-4 p-3 bg-green-50 rounded text-sm">
                  <div className="font-medium">Pastura: {currentPasture.name}</div>
                  <div className="text-gray-600">{currentPasture.area} ha • {currentPasture.grassType}</div>
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
                  <div className="font-medium">📍 Ubicación GPS obtenida:</div>
                  <div>Lat: {userLocation.latitude.toFixed(6)}</div>
                  <div>Lng: {userLocation.longitude.toFixed(6)}</div>
                  <div>Precisión: ±{userLocation.accuracy.toFixed(1)}m</div>
                  <div>Hora: {userLocation.timestamp.toLocaleString()}</div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado del Cercado
                    </label>
                    <select
                      value={locationForm.fencing}
                      onChange={(e) => setLocationForm(prev => ({ 
                        ...prev, 
                        fencing: e.target.value as typeof prev.fencing 
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    >
                      <option value="excellent">🟢 Excelente</option>
                      <option value="good">🔵 Bueno</option>
                      <option value="needs_repair">🟡 Necesita reparación</option>
                      <option value="poor">🔴 Malo</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <input
                        type="checkbox"
                        checked={locationForm.waterSource}
                        onChange={(e) => setLocationForm(prev => ({ 
                          ...prev, 
                          waterSource: e.target.checked 
                        }))}
                        className="w-4 h-4 text-[#519a7c] focus:ring-[#519a7c] border-gray-300 rounded"
                      />
                      💧 Tiene fuente de agua disponible
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones adicionales (opcional)
                    </label>
                    <textarea
                      value={locationForm.notes}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Condiciones del pasto, infraestructura, accesos..."
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowLocationDialog(false)}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={registerPastureLocation}
                    className="flex-1 px-4 py-2 bg-[#519a7c] text-white rounded-md hover:bg-[#457e68] transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Registrar en Mapa
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel de información del pin seleccionado */}
        <AnimatePresence>
          {selectedPin && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[350px] max-w-[400px] max-h-[calc(100vh-2rem)] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-[#2d5a45] flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Información de la Pastura
                </h3>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Información de la pastura */}
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">
                    🌱 {selectedPin.pasture.name}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                    <div>Área: {selectedPin.pasture.area} ha</div>
                    <div>Pasto: {selectedPin.pasture.grassType}</div>
                    <div>Capacidad: {selectedPin.pasture.capacity} cabezas</div>
                    <div>Estado: {selectedPin.pasture.status}</div>
                    {selectedPin.pasture.soilCondition && <div>Suelo: {selectedPin.pasture.soilCondition}</div>}
                    {selectedPin.pasture.lastGrazed && (
                      <div>Último pastoreo: {selectedPin.pasture.lastGrazed.toLocaleDateString()}</div>
                    )}
                  </div>
                  {selectedPin.pasture.notes && (
                    <div className="mt-2 text-sm text-green-700 italic">
                      Notas: {selectedPin.pasture.notes}
                    </div>
                  )}
                </div>

                {/* Información de la ubicación */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">📍 Registro de Ubicación</h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div>📅 Fecha: {selectedPin.timestamp.toLocaleDateString()}</div>
                    <div>🕐 Hora: {selectedPin.timestamp.toLocaleTimeString()}</div>
                    <div>🚧 Cercado: {selectedPin.fencing}</div>
                    <div>💧 Fuente de agua: {selectedPin.waterSource ? "Sí" : "No"}</div>
                    <div>📍 Coordenadas: {selectedPin.latitude.toFixed(6)}, {selectedPin.longitude.toFixed(6)}</div>
                    <div>📊 Precisión: ±{selectedPin.accuracy}m</div>
                    {selectedPin.notes && (
                      <div className="mt-2 p-2 bg-blue-100 rounded">
                        <div className="font-medium">Observaciones:</div>
                        <div className="italic">"{selectedPin.notes}"</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => removePin(selectedPin.id)}
                    className="flex-1 px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                  <button 
                    onClick={() => setSelectedPin(null)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
                  >
                    Cerrar
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
              pasturePins={filteredPins}
              userLocation={userLocation}
              onPinClick={handlePinClick}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PastureMap;