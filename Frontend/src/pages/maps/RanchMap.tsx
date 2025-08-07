import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Navigation,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Settings,
  X,
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

interface RanchLocation {
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates: [number, number];
  isCurrentLocation: boolean;
}

interface GeolocationState {
  isLoading: boolean;
  hasPermission: boolean;
  error: string | null;
  currentPosition: [number, number] | null;
}

// Función utilitaria para concatenar clases CSS
const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Componente para configurar ubicación del rancho
const LocationSetup: React.FC<{
  location: RanchLocation;
  onLocationChange: (location: RanchLocation) => void;
  onGetCurrentLocation: () => void;
  geolocation: GeolocationState;
  isVisible: boolean;
  onClose: () => void;
}> = ({ location, onLocationChange, onGetCurrentLocation, geolocation, isVisible, onClose }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute top-4 right-4 z-[1001] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[350px]"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#2d5a45] flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Configurar Ubicación del Rancho
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Botón para obtener ubicación actual */}
      <div className="mb-4">
        <button
          onClick={onGetCurrentLocation}
          disabled={geolocation.isLoading}
          className={cn(
            "w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors",
            geolocation.isLoading
              ? "bg-gray-100 text-gray-500 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          )}
        >
          <Navigation className={cn("w-4 h-4", geolocation.isLoading && "animate-spin")} />
          {geolocation.isLoading ? "Obteniendo ubicación..." : "Usar Mi Ubicación Actual"}
        </button>
        
        {geolocation.error && (
          <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{geolocation.error}</span>
          </div>
        )}
        
        {location.isCurrentLocation && (
          <div className="mt-2 flex items-center gap-2 text-green-600 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Usando ubicación actual</span>
          </div>
        )}
      </div>

      {/* Formulario de dirección */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección del Rancho
          </label>
          <input
            type="text"
            value={location.address}
            onChange={(e) => onLocationChange({ ...location, address: e.target.value })}
            placeholder="Ej: Carretera a Villahermosa Km 15"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              value={location.city}
              onChange={(e) => onLocationChange({ ...location, city: e.target.value })}
              placeholder="Villahermosa"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <input
              type="text"
              value={location.state}
              onChange={(e) => onLocationChange({ ...location, state: e.target.value })}
              placeholder="Tabasco"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              País
            </label>
            <input
              type="text"
              value={location.country}
              onChange={(e) => onLocationChange({ ...location, country: e.target.value })}
              placeholder="México"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Postal
            </label>
            <input
              type="text"
              value={location.postalCode}
              onChange={(e) => onLocationChange({ ...location, postalCode: e.target.value })}
              placeholder="86000"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
            />
          </div>
        </div>

        {/* Coordenadas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Coordenadas
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={location.coordinates[0]}
              onChange={(e) => onLocationChange({ 
                ...location, 
                coordinates: [parseFloat(e.target.value) || 0, location.coordinates[1]],
                isCurrentLocation: false
              })}
              placeholder="Latitud"
              step="any"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
            />
            <input
              type="number"
              value={location.coordinates[1]}
              onChange={(e) => onLocationChange({ 
                ...location, 
                coordinates: [location.coordinates[0], parseFloat(e.target.value) || 0],
                isCurrentLocation: false
              })}
              placeholder="Longitud"
              step="any"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 pt-3">
          <button
            onClick={() => {
              console.log("Guardando ubicación:", location);
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-[#519a7c] text-white rounded-md hover:bg-[#457e68] transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Guardar Ubicación
          </button>
          <button
            onClick={() => onLocationChange({
              address: "",
              city: "Villahermosa",
              state: "Tabasco",
              country: "México",
              postalCode: "",
              coordinates: [17.9895, -92.947],
              isCurrentLocation: false
            })}
            className="px-4 py-2 text-[#519a7c] border border-[#519a7c] rounded-md hover:bg-[#519a7c] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Limpiar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Componente de mapa simulado
const SimulatedMap: React.FC<{
  location: RanchLocation;
}> = ({ location }) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-yellow-50 relative overflow-hidden rounded-lg">
      {/* Fondo del mapa simulado */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23059669' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Título del mapa con ubicación */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-green-600" />
          <span className="font-medium text-[#2d5a45]">
            Rancho - {location.city}, {location.state}
          </span>
          {location.isCurrentLocation && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Ubicación actual
            </span>
          )}
        </div>
      </div>

      {/* Marcador del rancho en el centro */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-12 h-12 bg-[#519a7c] rounded-full flex items-center justify-center shadow-lg border-4 border-white"
        >
          <span className="text-white text-lg">🏠</span>
        </motion.div>
        <div className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-white/90 px-3 py-1 rounded-lg text-sm font-medium text-[#2d5a45] whitespace-nowrap shadow-sm">
          Mi Rancho
        </div>
      </div>

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
  // Estados para la ubicación del rancho
  const [ranchLocation, setRanchLocation] = useState<RanchLocation>({
    address: "",
    city: "Villahermosa",
    state: "Tabasco",
    country: "México",
    postalCode: "",
    coordinates: [17.9895, -92.947],
    isCurrentLocation: false,
  });

  // Estados para geolocalización
  const [geolocation, setGeolocation] = useState<GeolocationState>({
    isLoading: false,
    hasPermission: false,
    error: null,
    currentPosition: null,
  });

  // Estados para UI
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  const [showLocationSetup, setShowLocationSetup] = useState(false);

  // Referencias
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeolocation(prev => ({
        ...prev,
        error: "La geolocalización no está soportada en este navegador"
      }));
      return;
    }

    setGeolocation(prev => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setGeolocation(prev => ({
          ...prev,
          isLoading: false,
          hasPermission: true,
          currentPosition: [lat, lng]
        }));

        setRanchLocation(prev => ({
          ...prev,
          coordinates: [lat, lng],
          isCurrentLocation: true
        }));

        // Actualizar centro del mapa si está disponible
        if (mapInstance.current) {
          mapInstance.current.setView([lat, lng], 16);
        }
      },
      (error) => {
        let errorMessage = "Error al obtener ubicación";
        
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

        setGeolocation(prev => ({
          ...prev,
          isLoading: false,
          error: errorMessage
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

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
        center: ranchLocation.coordinates,
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

      // Agregar marcador del rancho
      addRanchMarker(map);

      console.log("✅ Mapa de Leaflet inicializado correctamente");
    } catch (error) {
      console.error("❌ Error inicializando mapa de Leaflet:", error);
    }
  };

  // Agregar marcador del rancho
  const addRanchMarker = (map: any) => {
    if (!map || !window.L) return;

    const ranchMarker = window.L.marker(ranchLocation.coordinates, {
      icon: window.L.divIcon({
        className: 'ranch-location-marker',
        html: '<div style="background: #519a7c; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🏠</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      })
    }).addTo(map);

    ranchMarker.bindPopup(`
      <div style="padding: 12px; text-align: center;">
        <h3 style="margin: 0 0 8px 0; color: #2d5a45; font-weight: bold; font-size: 16px;">🏠 Mi Rancho</h3>
        <p style="margin: 0; color: #666; font-size: 14px;">${ranchLocation.address || "Dirección no especificada"}</p>
        <p style="margin: 4px 0 0 0; font-size: 14px; font-weight: 500;">${ranchLocation.city}, ${ranchLocation.state}</p>
        ${ranchLocation.isCurrentLocation ? '<p style="margin: 6px 0 0 0; color: #059669; font-size: 12px; background: #dcfce7; padding: 4px 8px; border-radius: 12px; display: inline-block;">📍 Ubicación actual</p>' : ''}
      </div>
    `);
  };

  // Actualizar mapa cuando cambie la ubicación
  useEffect(() => {
    if (mapInstance.current && ranchLocation.coordinates) {
      mapInstance.current.setView(ranchLocation.coordinates, 16);
      // Limpiar marcadores existentes
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof window.L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });
      addRanchMarker(mapInstance.current);
    }
  }, [ranchLocation.coordinates]);

  return (
    <div
      className={cn(
        "relative w-full h-screen overflow-hidden",
        "bg-gradient-to-br from-[#F5F5DC] via-[#E8E8C8] to-[#D3D3B8]",
        "h-[600px]",
        className
      )}
    >
      {/* Botón flotante para configurar ubicación */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setShowLocationSetup(true)}
        className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-colors group"
      >
        <Settings className="w-5 h-5 text-[#2d5a45] group-hover:rotate-90 transition-transform duration-300" />
      </motion.button>

      {/* Componente de configuración de ubicación */}
      <AnimatePresence>
        {showLocationSetup && (
          <LocationSetup
            location={ranchLocation}
            onLocationChange={setRanchLocation}
            onGetCurrentLocation={getCurrentLocation}
            geolocation={geolocation}
            isVisible={showLocationSetup}
            onClose={() => setShowLocationSetup(false)}
          />
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
            location={ranchLocation}
          />
        )}
      </motion.div>
    </div>
  );
};

export default RanchMap;