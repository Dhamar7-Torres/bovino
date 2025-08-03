import React, { useState, useEffect, useRef } from "react";
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
  status: "active" | "resting" | "maintenance" | "dry";
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

// Componente de mapa simulado
const PastureSimulatedMap: React.FC<{
  pasturePins: PastureLocationPin[];
  userLocation: UserLocation | null;
  onPinClick: (pin: PastureLocationPin) => void;
}> = ({ pasturePins, userLocation, onPinClick }) => {
  
  // Función para obtener color según el estado de la pastura
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "#22c55e"; // Verde - activo
      case "resting": return "#3b82f6"; // Azul - en descanso
      case "maintenance": return "#f59e0b"; // Amarillo - mantenimiento
      case "dry": return "#ef4444"; // Rojo - seco
      default: return "#9ca3af"; // Gris - desconocido
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
          <Navigation className="w-5 h-5 text-green-600" />
          <span className="font-medium text-[#2d5a45]">
            Mapa de Pastura - {pasturePins.length} pasturas registradas
          </span>
          {pasturePins.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
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
          </div>
        </motion.div>
      )}

      {/* Renderizado de pins de pastura */}
      {pasturePins.map((pin, index) => {
        console.log("🎯 RENDERIZANDO PIN:", pin.pasture.name, "Index:", index);
        
        // Posición distribuida para el mapa simulado
        const leftPercent = 15 + (index % 7) * 12;
        const topPercent = 15 + Math.floor(index / 7) * 15;
        
        return (
          <motion.div
            key={pin.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.2, type: "spring", stiffness: 200 }}
            className="absolute cursor-pointer hover:scale-125 transition-all duration-200 group z-10"
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
            }}
            onClick={() => {
              console.log("🖱️ CLICK EN PIN:", pin.pasture.name);
              onPinClick(pin);
            }}
          >
            <div className="relative">
              {/* Pin principal - MÁS GRANDE Y VISIBLE */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative animate-pulse"
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

              {/* Etiqueta con nombre - MÁS VISIBLE */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg">
                {pin.pasture.name}
              </div>

              {/* Tooltip detallado al hover */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black/95 text-white text-sm rounded-lg px-4 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 shadow-2xl">
                <div className="space-y-2">
                  <div className="font-bold text-yellow-300">
                    {pin.pasture.name}
                  </div>
                  <div>
                    {pin.pasture.area} ha • {pin.pasture.grassType}
                  </div>
                  <div>Capacidad: {pin.pasture.capacity} cabezas</div>
                  <div className="text-green-300">Estado: {pin.pasture.status}</div>
                  <div className="text-blue-300">Registrado: {pin.timestamp.toLocaleTimeString()}</div>
                  <div className="text-gray-300">Precisión: ±{pin.accuracy}m</div>
                  {pin.waterSource && <div className="text-cyan-300">💧 Con fuente de agua</div>}
                  {pin.notes && <div className="text-purple-300">Nota: {pin.notes}</div>}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Mensaje si no hay pins - SIEMPRE VISIBLE HASTA QUE HAYA PINS */}
      {pasturePins.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-600 bg-white/90 p-8 rounded-xl shadow-lg"
        >
          <Leaf className="w-16 h-16 mx-auto mb-4 text-green-500" />
          <h3 className="text-xl font-bold text-[#2d5a45] mb-2">¡Bienvenido al Mapa de Pastura!</h3>
          <p className="text-base mb-2">No hay pasturas registradas aún</p>
          <p className="text-sm text-gray-500">Haz clic en "Agregar Pastura" para comenzar el registro</p>
          <div className="mt-4 text-xs text-blue-600">
            📍 Los pins aparecerán aquí una vez que agregues pastura
          </div>
        </motion.div>
      )}

      {/* CONTADOR DE PINS EN TIEMPO REAL */}
      {pasturePins.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg"
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <Leaf className="w-4 h-4" />
            <span>{pasturePins.length} Potrero{pasturePins.length !== 1 ? 's' : ''} en el Mapa</span>
          </div>
        </motion.div>
      )}

      {/* Leyenda del mapa */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
        <h4 className="text-sm font-semibold text-[#2d5a45] mb-2">
          Estados de la Pastura
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
          <span>GPS Tracking - Desarrollo</span>
        </div>
      </div>
    </div>
  );
};

export const PastureMap: React.FC<PastureMapProps> = ({
  className,
}) => {
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
    status: "active",
    lastGrazed: undefined,
    soilCondition: "good",
    notes: undefined,
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
  const handleAddPasture = () => {
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
      status: "active",
      lastGrazed: undefined,
      soilCondition: "good",
      notes: undefined,
    });

    // Proceder a obtener ubicación
    getCurrentLocation();
  };

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
        setShowLocationDialog(true);
        setIsGettingLocation(false);
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

  // Función para registrar la ubicación de la pastura
  const registerPastureLocation = () => {
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

    console.log("🔥 REGISTRANDO PASTURA:", newPin);
    
    setPasturePins(prev => {
      const updated = [...prev, newPin];
      console.log("📍 TOTAL PASTURAS AHORA:", updated.length);
      return updated;
    });
    
    // Limpiar estados
    setLocationForm({ waterSource: false, fencing: "good", notes: "" });
    setCurrentPasture(null);
    setUserLocation(null);
    setShowLocationDialog(false);

    // Mostrar mensaje de éxito
    setSuccessMessage(`¡Pastura ${newPin.pasture.name} registrado exitosamente en el mapa!`);
    setTimeout(() => setSuccessMessage(null), 5000);
    
    console.log("🎉 REGISTRO COMPLETADO EXITOSAMENTE");
  };

  // Función para eliminar un pin
  const removePin = (pinId: string) => {
    console.log("🗑️ Eliminando pin:", pinId);
    
    setPasturePins(prev => {
      const updated = prev.filter(p => p.id !== pinId);
      console.log("📍 Pins restantes:", updated.length);
      return updated;
    });
    
    setSelectedPin(null);
    
    console.log("✅ Pin eliminado de la lista");
  };

  // Función para manejar clic en pin
  const handlePinClick = (pin: PastureLocationPin) => {
    setSelectedPin(pin);
  };

  // Verificar si Leaflet está disponible - VERSIÓN SIMPLIFICADA
  useEffect(() => {
    console.log("🗺️ Verificando Leaflet...");
    
    const checkLeaflet = () => {
      if (typeof window !== "undefined" && window.L) {
        console.log("✅ Leaflet disponible, inicializando mapa...");
        setIsLeafletLoaded(true);
        setTimeout(() => initializeMap(), 500); // Pequeño delay para asegurar que el DOM esté listo
      } else {
        console.log("⚠️ Leaflet no disponible, usando mapa simulado");
      }
    };

    checkLeaflet();

    // Intentar cargar Leaflet si no está disponible
    if (!isLeafletLoaded && typeof window !== "undefined") {
      console.log("📦 Cargando Leaflet desde CDN...");
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        console.log("✅ Leaflet cargado desde CDN");
        checkLeaflet();
      };
      script.onerror = () => {
        console.log("❌ Error cargando Leaflet, continuando con mapa simulado");
      };
      document.head.appendChild(script);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    return () => {
      if (mapInstance.current) {
        console.log("🧹 Limpiando instancia del mapa");
        try {
          mapInstance.current.remove();
          mapInstance.current = null;
        } catch (error) {
          console.log("⚠️ Error limpiando mapa:", error);
        }
      }
    };
  }, []); // SOLO ejecutar una vez

  // Inicializar mapa de Leaflet - VERSIÓN SIMPLIFICADA
  const initializeMap = () => {
    if (!mapRef.current || !window.L || mapInstance.current) {
      console.log("❌ No se puede inicializar mapa:", {
        mapRef: !!mapRef.current,
        leaflet: !!window.L,
        alreadyExists: !!mapInstance.current
      });
      return;
    }

    try {
      console.log("🚀 Inicializando mapa de Leaflet...");
      
      const map = window.L.map(mapRef.current, {
        center: RANCH_CENTER,
        zoom: 16,
        zoomControl: true,
        attributionControl: true,
      });

      console.log("🗺️ Mapa creado, agregando tiles...");

      window.L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri",
          maxZoom: 19,
        }
      ).addTo(map);

      mapInstance.current = map;

      console.log("✅ Mapa de Leaflet inicializado correctamente");
      console.log("📍 Pins existentes a agregar:", pasturePins.length);

      // Agregar pins existentes si los hay
      if (pasturePins.length > 0) {
        console.log("🎯 Agregando", pasturePins.length, "pins existentes...");
        pasturePins.forEach((pin, index) => {
          console.log(`📌 Agregando pin ${index + 1}:`, pin.pasture.name);
          addPinToMap(map, pin);
        });
      }

    } catch (error) {
      console.error("❌ Error inicializando mapa de Leaflet:", error);
      setIsLeafletLoaded(false); // Fallback al mapa simulado
    }
  };

  // Actualizar Leaflet cuando cambien los pins
  useEffect(() => {
    if (mapInstance.current && isLeafletLoaded && pasturePins.length > 0) {
      console.log("🔄 Actualizando pins en Leaflet, total:", pasturePins.length);
      
      // Limpiar marcadores existentes
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof window.L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });
      
      // Agregar todos los pins actuales
      pasturePins.forEach((pin, index) => {
        console.log(`📌 Re-agregando pin ${index + 1}:`, pin.pasture.name);
        addPinToMap(mapInstance.current, pin);
      });
    }
  }, [pasturePins, isLeafletLoaded]); // Ejecutar cuando cambien los pins o se cargue Leaflet

  // Agregar un pin individual al mapa de Leaflet - VERSIÓN SIMPLIFICADA
  const addPinToMap = (map: any, pin: PastureLocationPin) => {
    if (!map || !window.L) {
      console.log("❌ No se puede agregar pin: mapa o Leaflet no disponible");
      return;
    }

    try {
      console.log("📍 Agregando pin para", pin.pasture.name, "en", pin.latitude, pin.longitude);

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
          <div style="margin-top: 15px; text-align: center;">
            <button onclick="alert('Función no implementada')" style="background: #2d5a45; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">
              Ver Más Detalles
            </button>
          </div>
        </div>
      `);

      marker.on("click", () => {
        console.log("🖱️ Click en marker de Leaflet:", pin.pasture.name);
        handlePinClick(pin);
      });

      // Centrar mapa en el nuevo pin solo si es el primero o es nuevo
      if (pasturePins.length <= 1) {
        console.log("🎯 Centrando mapa en el pin");
        map.setView([pin.latitude, pin.longitude], 17);
      }

      console.log("✅ Pin agregado exitosamente a Leaflet");

    } catch (error) {
      console.error("❌ Error agregando pin a Leaflet:", error);
    }
  };

  // Filtrar pins según búsqueda
  const filteredPins = pasturePins.filter(
    (pin) =>
      pin.pasture.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.pasture.grassType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.pasture.status.toLowerCase().includes(searchQuery.toLowerCase())
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

        {/* Botón principal para agregar potrero */}
        <div className="mb-4">
          <button
            onClick={() => setShowAddPastureDialog(true)}
            disabled={isGettingLocation}
            className={cn(
              "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors",
              isGettingLocation
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-[#519a7c] text-white hover:bg-[#457e68] shadow-md"
            )}
          >
            {isGettingLocation ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Plus className="w-5 h-5" />
            )}
            {isGettingLocation ? "Obteniendo ubicación..." : "Agregar Potrero"}
          </button>
        </div>

        {/* Error de ubicación */}
        {locationError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-sm text-red-600 mt-1">{locationError}</p>
          </div>
        )}

        {/* Mensaje de éxito */}
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

        {/* Barra de búsqueda */}
        {pasturePins.length > 0 && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre, tipo de pasto o estado..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
            />
          </div>
        )}

        {/* Lista de potreros registrados */}
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
                <div key={pin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                      <div className="text-xs text-gray-600 italic mt-1">
                        "{pin.notes}"
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removePin(pin.id)}
                    className="text-red-500 hover:text-red-700 p-1 ml-2"
                    title="Eliminar registro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mensaje si no hay potreros */}
        {pasturePins.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Leaf className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No hay pasturas registrados</p>
            <p className="text-xs">Haz clic en "Agregar Pastura" para comenzar</p>
          </div>
        )}

        {/* Resumen */}
        {pasturePins.length > 0 && (
          <div className="border-t pt-3 mt-4">
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
          </div>
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
                    placeholder="Ej: Potrero Norte, Las Flores"
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
                        status: e.target.value as "active" | "resting" | "maintenance" | "dry"
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    >
                      <option value="active">Excelente</option>
                      <option value="resting">Bueno</option>
                      <option value="maintenance">Regular</option>
                      <option value="dry">Pobre</option>
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
                    placeholder="Notas sobre el potrero, condiciones especiales..."
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
                Registrar Ubicación del Potrero
              </h3>

              <div className="mb-4 p-3 bg-green-50 rounded text-sm">
                <div className="font-medium">Potrero: {currentPasture.name}</div>
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
            className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[350px] max-w-[400px]"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#2d5a45] flex items-center gap-2">
                <Info className="w-5 h-5" />
                Información del Potrero
              </h3>
              <button
                onClick={() => setSelectedPin(null)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Información del potrero */}
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
  );
};

export default PastureMap;