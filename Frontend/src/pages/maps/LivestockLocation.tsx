import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  Users,
  Maximize2,
  Minimize2,
  Search,
  X,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Plus,
  Save,
  Crosshair,
  Trash2,
  Target,
  Info,
  Wifi,
  WifiOff,
} from "lucide-react";

// Declaración global para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

// Configuración de la API
const API_BASE_URL = 'http://localhost:5000/api';

// Interfaces adaptadas al backend
interface BovineData {
  id?: string;
  earTag: string;
  name?: string;
  breed: string;
  age: number;
  weight: number;
  sex: "male" | "female";
  color?: string;
  notes?: string;
  healthStatus?: string;
  birthDate?: string;
  // Campos de ubicación del backend
  location?: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    timestamp: Date;
    source: 'GPS' | 'MANUAL' | 'ESTIMATED';
  };
  trackingConfig?: {
    isEnabled: boolean;
    deviceId?: string;
    batteryLevel?: number;
    signalStrength?: number;
    lastUpdate?: Date;
    updateInterval?: number;
    geofenceAlerts?: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface AnimalLocationPin {
  id: string;
  animal: BovineData;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  activity: "grazing" | "walking" | "running" | "resting" | "drinking" | "other";
  notes?: string;
  addedBy: "gps" | "manual";
  source: 'GPS' | 'MANUAL' | 'ESTIMATED';
}

interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

interface LivestockLocationProps {
  className?: string;
}

// Clase para manejar las llamadas a la API del backend
class LivestockAPI {
  // ======================================================================
  // OPERACIONES DE BOVINOS (CRUD)
  // ======================================================================
  
  static async getAllBovines(): Promise<BovineData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cattle`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Error al obtener bovinos');
      }
    } catch (error) {
      console.error('Error fetching bovines:', error);
      throw error;
    }
  }

  static async createBovine(bovineData: Omit<BovineData, 'id' | 'createdAt' | 'updatedAt'>): Promise<BovineData> {
    try {
      const response = await fetch(`${API_BASE_URL}/cattle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bovineData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al crear bovino');
      }
    } catch (error) {
      console.error('Error creating bovine:', error);
      throw error;
    }
  }

  static async updateBovine(id: string, bovineData: Partial<BovineData>): Promise<BovineData> {
    try {
      const response = await fetch(`${API_BASE_URL}/cattle/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bovineData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar bovino');
      }
    } catch (error) {
      console.error('Error updating bovine:', error);
      throw error;
    }
  }

  static async deleteBovine(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/cattle/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al eliminar bovino');
      }
    } catch (error) {
      console.error('Error deleting bovine:', error);
      throw error;
    }
  }

  // ======================================================================
  // OPERACIONES DE GEOLOCALIZACIÓN
  // ======================================================================

  static async updateBovineLocation(id: string, locationData: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    source?: 'GPS' | 'MANUAL' | 'ESTIMATED';
    speed?: number;
    heading?: number;
    batteryLevel?: number;
    signalStrength?: number;
    notes?: string;
  }): Promise<BovineData> {
    try {
      const response = await fetch(`${API_BASE_URL}/cattle/${id}/location`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          location: {
            ...locationData,
            timestamp: new Date(),
            source: locationData.source || 'GPS'
          },
          trackingConfig: {
            isEnabled: true,
            batteryLevel: locationData.batteryLevel,
            signalStrength: locationData.signalStrength,
            lastUpdate: new Date(),
            geofenceAlerts: true
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar ubicación');
      }
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  static async getBovinesNearby(latitude: number, longitude: number, radiusKm: number = 5): Promise<BovineData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cattle/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Error al obtener bovinos cercanos');
      }
    } catch (error) {
      console.error('Error fetching nearby bovines:', error);
      throw error;
    }
  }

  static async getBovinesByArea(northEast: {lat: number, lng: number}, southWest: {lat: number, lng: number}): Promise<BovineData[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/cattle/by-area?ne_lat=${northEast.lat}&ne_lng=${northEast.lng}&sw_lat=${southWest.lat}&sw_lng=${southWest.lng}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Error al obtener bovinos por área');
      }
    } catch (error) {
      console.error('Error fetching bovines by area:', error);
      throw error;
    }
  }

  // ======================================================================
  // OPERACIONES DE ESTADÍSTICAS
  // ======================================================================

  static async getBovineStats(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/cattle/stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data || {};
      } else {
        throw new Error(data.message || 'Error al obtener estadísticas');
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
}

// Función utilitaria para concatenar clases CSS
const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// Componente de mapa simulado
const LivestockSimulatedMap: React.FC<{
  animalPins: AnimalLocationPin[];
  userLocation: UserLocation | null;
  onPinClick: (pin: AnimalLocationPin) => void;
}> = ({ animalPins, userLocation, onPinClick }) => {
  
  // Función para obtener color según la antigüedad
  const getTimeColor = (timestamp: Date) => {
    const hoursAgo = (Date.now() - timestamp.getTime()) / (1000 * 60 * 60);
    
    if (hoursAgo < 1) return "#22c55e"; // Verde - muy reciente
    if (hoursAgo < 6) return "#3b82f6"; // Azul - reciente  
    if (hoursAgo < 24) return "#f59e0b"; // Amarillo - hace unas horas
    return "#9ca3af"; // Gris - más de un día
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
          <Navigation className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-[#2d5a45]">
            Mapa de Ganado - {animalPins.length} animales registrados
          </span>
          {animalPins.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>CONECTADO</span>
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

      {/* Renderizado de pins de animales */}
      {animalPins.map((pin, index) => {
        console.log("🎯 RENDERIZANDO PIN:", pin.animal.earTag, "Index:", index);
        
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
              console.log("🖱️ CLICK EN PIN:", pin.animal.earTag);
              onPinClick(pin);
            }}
          >
            <div className="relative">
              {/* Pin principal - MÁS GRANDE Y VISIBLE */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative animate-pulse"
                style={{ backgroundColor: getTimeColor(pin.timestamp) }}
              >
                <Users className="w-6 h-6 text-white font-bold" />
                
                {/* Indicador de estado */}
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Etiqueta con arete - MÁS VISIBLE */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg">
                {pin.animal.earTag}
              </div>

              {/* Tooltip detallado al hover */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black/95 text-white text-sm rounded-lg px-4 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-20 shadow-2xl">
                <div className="space-y-2">
                  <div className="font-bold text-yellow-300">
                    {pin.animal.name || pin.animal.earTag}
                  </div>
                  <div>
                    {pin.animal.breed} • {pin.animal.age} años
                  </div>
                  <div className="text-green-300">Actividad: {pin.activity}</div>
                  <div className="text-blue-300">Registrado: {pin.timestamp.toLocaleTimeString()}</div>
                  <div className="text-gray-300">Precisión: ±{pin.accuracy}m</div>
                  <div className="text-purple-300">Fuente: {pin.source}</div>
                  {pin.notes && <div className="text-purple-300">Nota: {pin.notes}</div>}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Mensaje si no hay pins */}
      {animalPins.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-600 bg-white/90 p-8 rounded-xl shadow-lg"
        >
          <MapPin className="w-16 h-16 mx-auto mb-4 text-blue-500" />
          <h3 className="text-xl font-bold text-[#2d5a45] mb-2">¡Bienvenido al Sistema de Geolocalización!</h3>
          <p className="text-base mb-2">Conectado al servidor backend</p>
          <p className="text-sm text-gray-500">Los bovinos registrados aparecerán automáticamente en el mapa</p>
          <div className="mt-4 text-xs text-blue-600">
            🌐 Sincronización con base de datos activa
          </div>
        </motion.div>
      )}

      {/* CONTADOR DE PINS EN TIEMPO REAL */}
      {animalPins.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg"
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <Users className="w-4 h-4" />
            <span>{animalPins.length} Animal{animalPins.length !== 1 ? 'es' : ''} en el Mapa</span>
          </div>
        </motion.div>
      )}

      {/* Leyenda del mapa */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
        <h4 className="text-sm font-semibold text-[#2d5a45] mb-2">
          Leyenda
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>&lt; 1 hora</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>1-6 horas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>6-24 horas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span>&gt; 1 día</span>
          </div>
        </div>
      </div>

      {/* Indicador de conexión backend */}
      <div className="absolute bottom-4 left-4 bg-green-500/10 border border-green-500 rounded-lg px-3 py-2 pointer-events-none">
        <div className="flex items-center gap-2 text-xs text-green-700">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Backend Conectado - Puerto 5000</span>
        </div>
      </div>
    </div>
  );
};

export const LivestockLocation: React.FC<LivestockLocationProps> = ({
  className,
}) => {
  // Estados principales
  const [allBovines, setAllBovines] = useState<BovineData[]>([]);
  const [animalPins, setAnimalPins] = useState<AnimalLocationPin[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPin, setSelectedPin] = useState<AnimalLocationPin | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  
  // Estados para el backend
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para agregar animal
  const [showAddAnimalDialog, setShowAddAnimalDialog] = useState(false);
  const [animalForm, setAnimalForm] = useState<BovineData>({
    earTag: "",
    name: undefined,
    breed: "",
    age: 0,
    weight: 0,
    sex: "female",
    color: undefined,
    notes: undefined,
  });
  
  // Estados para ubicación
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [currentAnimal, setCurrentAnimal] = useState<BovineData | null>(null);
  const [locationForm, setLocationForm] = useState({
    activity: "grazing" as "grazing" | "walking" | "running" | "resting" | "drinking" | "other",
    notes: "",
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [, setLocationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Referencias
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // Coordenadas del centro del área (Villahermosa, Tabasco)
  const LIVESTOCK_CENTER: [number, number] = [17.989, -92.9465];

  // ======================================================================
  // FUNCIONES PARA CONECTAR CON EL BACKEND
  // ======================================================================

  // Función para cargar bovinos desde el backend
  const loadBovinesFromBackend = useCallback(async () => {
    try {
      setIsLoading(true);
      setBackendError(null);
      
      console.log("🔄 Cargando bovinos desde el backend...");
      const bovines = await LivestockAPI.getAllBovines();
      
      console.log("✅ Bovinos cargados:", bovines.length);
      setAllBovines(bovines);
      setIsConnected(true);
      
      // Convertir bovinos con ubicación a pins
      const pins: AnimalLocationPin[] = bovines
        .filter(bovine => bovine.location && bovine.location.latitude && bovine.location.longitude)
        .map(bovine => ({
          id: `pin-${bovine.id}`,
          animal: bovine,
          latitude: bovine.location!.latitude,
          longitude: bovine.location!.longitude,
          accuracy: bovine.location!.accuracy || 10,
          timestamp: new Date(bovine.location!.timestamp),
          activity: "grazing", // Valor por defecto
          notes: bovine.notes,
          addedBy: "gps",
          source: bovine.location!.source || 'GPS'
        }));
      
      console.log("📍 Pins generados:", pins.length);
      setAnimalPins(pins);
      
    } catch (error: any) {
      console.error("❌ Error cargando bovinos:", error);
      setBackendError(error.message || "Error conectando con el servidor");
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadBovinesFromBackend();
  }, [loadBovinesFromBackend]);

  // Función para validar formulario
  const validateAnimalForm = (data: BovineData): string[] => {
    const errors: string[] = [];
    if (!data.earTag?.trim()) errors.push("El arete es obligatorio");
    if (!data.breed?.trim()) errors.push("La raza es obligatoria");
    if (!data.age || data.age <= 0) errors.push("La edad debe ser mayor a 0");
    if (!data.weight || data.weight <= 0) errors.push("El peso debe ser mayor a 0");
    return errors;
  };

  // Función para agregar nuevo animal al backend
  const handleAddAnimal = async () => {
    const errors = validateAnimalForm(animalForm);
    if (errors.length > 0) {
      alert("Errores en el formulario:\n" + errors.join("\n"));
      return;
    }

    try {
      setIsSubmitting(true);
      setBackendError(null);

      console.log("📤 Creando nuevo bovino en el backend...");
      
      const bovineData: Omit<BovineData, 'id' | 'createdAt' | 'updatedAt'> = {
        earTag: animalForm.earTag.trim(),
        name: animalForm.name?.trim() || undefined,
        breed: animalForm.breed.trim(),
        age: animalForm.age,
        weight: animalForm.weight,
        sex: animalForm.sex,
        color: animalForm.color?.trim() || undefined,
        notes: animalForm.notes?.trim() || undefined,
        healthStatus: "healthy",
      };

      const newBovine = await LivestockAPI.createBovine(bovineData);
      
      console.log("✅ Bovino creado exitosamente:", newBovine.id);
      
      // Actualizar la lista local
      setAllBovines(prev => [...prev, newBovine]);
      setCurrentAnimal(newBovine);
      setShowAddAnimalDialog(false);
      
      // Limpiar formulario
      setAnimalForm({
        earTag: "",
        name: undefined,
        breed: "",
        age: 0,
        weight: 0,
        sex: "female",
        color: undefined,
        notes: undefined,
      });

      // Proceder a obtener ubicación
      getCurrentLocation();
      
    } catch (error: any) {
      console.error("❌ Error creando bovino:", error);
      setBackendError(error.message || "Error al crear el animal");
      alert("❌ Error al crear el animal: " + (error.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
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

        console.log("📍 Ubicación obtenida:", { latitude, longitude, accuracy });
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
        console.error("❌ Error de geolocalización:", errorMessage);
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

  // Función para registrar la ubicación del animal en el backend
  const registerAnimalLocation = async () => {
    if (!currentAnimal || !userLocation) return;

    try {
      setIsSubmitting(true);
      setBackendError(null);

      console.log("📤 Actualizando ubicación en el backend...");
      
      const locationData = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        source: 'GPS' as 'GPS' | 'MANUAL' | 'ESTIMATED',
        notes: locationForm.notes.trim() || undefined
      };

      const updatedBovine = await LivestockAPI.updateBovineLocation(currentAnimal.id!, locationData);
      
      console.log("✅ Ubicación actualizada exitosamente");

      // Actualizar bovino en la lista local
      setAllBovines(prev => prev.map(bovine => 
        bovine.id === currentAnimal.id ? updatedBovine : bovine
      ));

      // Crear pin para el mapa
      const newPin: AnimalLocationPin = {
        id: `pin-${currentAnimal.id}`,
        animal: updatedBovine,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        timestamp: new Date(),
        activity: locationForm.activity,
        notes: locationForm.notes.trim() || undefined,
        addedBy: "gps",
        source: 'GPS'
      };

      setAnimalPins(prev => {
        // Remover pin anterior del mismo animal si existe
        const filtered = prev.filter(p => p.animal.id !== currentAnimal.id);
        return [...filtered, newPin];
      });
      
      // Limpiar estados
      setLocationForm({ activity: "grazing", notes: "" });
      setCurrentAnimal(null);
      setUserLocation(null);
      setShowLocationDialog(false);

      // Mostrar mensaje de éxito
      setSuccessMessage(`¡Animal ${updatedBovine.earTag} registrado exitosamente en el mapa!`);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      console.log("🎉 REGISTRO COMPLETADO EXITOSAMENTE");
      
    } catch (error: any) {
      console.error("❌ Error registrando ubicación:", error);
      setBackendError(error.message || "Error al registrar ubicación");
      alert("❌ Error al registrar ubicación: " + (error.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para eliminar un pin y bovino del backend
  const removePin = async (pinId: string) => {
    const pin = animalPins.find(p => p.id === pinId);
    if (!pin || !pin.animal.id) return;

    if (!confirm(`¿Estás seguro de que deseas eliminar el bovino ${pin.animal.earTag}?`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      setBackendError(null);

      console.log("🗑️ Eliminando bovino del backend:", pin.animal.id);
      
      await LivestockAPI.deleteBovine(pin.animal.id);
      
      console.log("✅ Bovino eliminado exitosamente");

      // Actualizar listas locales
      setAllBovines(prev => prev.filter(b => b.id !== pin.animal.id));
      setAnimalPins(prev => prev.filter(p => p.id !== pinId));
      
      if (selectedPin?.id === pinId) {
        setSelectedPin(null);
      }
      
      setSuccessMessage(`Bovino ${pin.animal.earTag} eliminado exitosamente`);
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (error: any) {
      console.error("❌ Error eliminando bovino:", error);
      setBackendError(error.message || "Error al eliminar bovino");
      alert("❌ Error al eliminar bovino: " + (error.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para manejar clic en pin
  const handlePinClick = (pin: AnimalLocationPin) => {
    setSelectedPin(pin);
  };

  // Función para recargar datos
  const handleRefresh = () => {
    loadBovinesFromBackend();
  };

  // Verificar si Leaflet está disponible
  useEffect(() => {
    console.log("🗺️ Verificando Leaflet...");
    
    const checkLeaflet = () => {
      if (typeof window !== "undefined" && window.L) {
        console.log("✅ Leaflet disponible, inicializando mapa...");
        setIsLeafletLoaded(true);
        setTimeout(() => initializeMap(), 500);
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
  }, []);

  // Inicializar mapa de Leaflet
  const initializeMap = () => {
    if (!mapRef.current || !window.L || mapInstance.current) {
      console.log("❌ No se puede inicializar mapa");
      return;
    }

    try {
      console.log("🚀 Inicializando mapa de Leaflet...");
      
      const map = window.L.map(mapRef.current, {
        center: LIVESTOCK_CENTER,
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
      console.log("✅ Mapa de Leaflet inicializado correctamente");

      // Agregar pins existentes
      if (animalPins.length > 0) {
        animalPins.forEach((pin) => {
          addPinToMap(map, pin);
        });
      }
    } catch (error) {
      console.error("❌ Error inicializando mapa de Leaflet:", error);
      setIsLeafletLoaded(false);
    }
  };

  // Actualizar Leaflet cuando cambien los pins
  useEffect(() => {
    if (mapInstance.current && isLeafletLoaded && animalPins.length > 0) {
      console.log("🔄 Actualizando pins en Leaflet");
      
      // Limpiar marcadores existentes
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof window.L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });
      
      // Agregar todos los pins actuales
      animalPins.forEach((pin) => {
        addPinToMap(mapInstance.current, pin);
      });
    }
  }, [animalPins, isLeafletLoaded]);

  // Agregar un pin individual al mapa de Leaflet
  const addPinToMap = (map: any, pin: AnimalLocationPin) => {
    if (!map || !window.L) return;

    try {
      const marker = window.L.marker([pin.latitude, pin.longitude]).addTo(map);

      marker.bindPopup(`
        <div style="padding: 15px; min-width: 280px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 10px 0; color: #2d5a45; font-weight: bold; font-size: 18px;">
            🐄 ${pin.animal.name || pin.animal.earTag}
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0;">
            <div><strong>Arete:</strong> ${pin.animal.earTag}</div>
            <div><strong>Raza:</strong> ${pin.animal.breed}</div>
            <div><strong>Edad:</strong> ${pin.animal.age} años</div>
            <div><strong>Peso:</strong> ${pin.animal.weight} kg</div>
            <div><strong>Sexo:</strong> ${pin.animal.sex === "male" ? "Macho" : "Hembra"}</div>
            ${pin.animal.color ? `<div><strong>Color:</strong> ${pin.animal.color}</div>` : ''}
          </div>
          <div style="margin: 10px 0; padding: 10px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <div style="font-weight: bold; color: #166534; margin-bottom: 5px;">📍 Información de Ubicación:</div>
            <div><strong>Actividad:</strong> ${pin.activity}</div>
            <div><strong>Registrado:</strong> ${pin.timestamp.toLocaleString()}</div>
            <div><strong>Precisión GPS:</strong> ±${pin.accuracy}m</div>
            <div><strong>Fuente:</strong> ${pin.source}</div>
          </div>
          ${pin.notes ? `
            <div style="margin: 10px 0; padding: 10px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <div style="font-weight: bold; color: #92400e; margin-bottom: 5px;">📝 Observaciones:</div>
              <div style="font-style: italic;">"${pin.notes}"</div>
            </div>
          ` : ''}
          <div style="margin-top: 15px; text-align: center; font-size: 11px; color: #666;">
            <div>🌐 Sincronizado con backend • ID: ${pin.animal.id}</div>
          </div>
        </div>
      `);

      marker.on("click", () => {
        handlePinClick(pin);
      });

      if (animalPins.length <= 1) {
        map.setView([pin.latitude, pin.longitude], 17);
      }
    } catch (error) {
      console.error("❌ Error agregando pin a Leaflet:", error);
    }
  };

  // Filtrar pins según búsqueda
  const filteredPins = animalPins.filter(
    (pin) =>
      pin.animal.earTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pin.animal.name &&
        pin.animal.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pin.animal.breed.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Renderizado principal
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <RefreshCw className="w-12 h-12 text-green-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Conectando con el Backend</h2>
          <p className="text-gray-600">Puerto 5000 • Cargando datos del ganado...</p>
        </div>
      </div>
    );
  }

  return (
    // CONTENEDOR PRINCIPAL CON DEGRADADO IMPLEMENTADO
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <div
        className={cn(
          "relative w-full h-full overflow-hidden rounded-xl shadow-2xl",
          isFullscreen ? "fixed inset-6 z-50" : "h-[calc(100vh-3rem)]",
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
              Sistema de Geolocalización
            </h2>
            <div className="flex items-center gap-2">
              {/* Indicador de conexión */}
              <div className="flex items-center gap-1">
                {isConnected ? (
                  <Wifi className="w-4 h-4 text-green-600" />
                ) : (
                  <WifiOff className="w-4 h-4 text-red-600" />
                )}
              </div>
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

          {/* Estado de conexión */}
          <div className={cn(
            "mb-4 p-3 rounded-lg text-sm",
            isConnected ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          )}>
            <div className={cn(
              "flex items-center gap-2 font-medium",
              isConnected ? "text-green-700" : "text-red-700"
            )}>
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
              {isConnected ? "Conectado al Backend" : "Desconectado del Backend"}
            </div>
            <p className={cn(
              "text-xs mt-1",
              isConnected ? "text-green-600" : "text-red-600"
            )}>
              {isConnected 
                ? `Puerto 5000 • ${allBovines.length} bovinos sincronizados`
                : backendError || "Verificar que el servidor esté ejecutándose"
              }
            </p>
          </div>

          {/* Botones principales */}
          <div className="space-y-2 mb-4">
            <button
              onClick={() => setShowAddAnimalDialog(true)}
              disabled={isGettingLocation || isSubmitting || !isConnected}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors",
                (isGettingLocation || isSubmitting || !isConnected)
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-[#519a7c] text-white hover:bg-[#457e68] shadow-md"
              )}
            >
              {isGettingLocation ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {isSubmitting ? "Guardando..." : isGettingLocation ? "Obteniendo ubicación..." : "Agregar Bovino"}
            </button>

            <button
              onClick={handleRefresh}
              disabled={isLoading || isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
              Recargar Datos
            </button>
          </div>

          {/* Error del backend */}
          {backendError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-4 h-4" />
                <span className="font-medium">Error de Conexión</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{backendError}</p>
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
          {animalPins.length > 0 && (
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
          )}

          {/* Lista de animales registrados */}
          {animalPins.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Bovinos Geolocalizados ({filteredPins.length})
                </h3>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredPins
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((pin) => (
                  <div key={pin.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 cursor-pointer" onClick={() => handlePinClick(pin)}>
                      <div className="font-medium text-sm flex items-center gap-2">
                        {pin.animal.name || pin.animal.earTag}
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          {pin.source}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {pin.animal.breed} • {pin.animal.age} años • ID: {pin.animal.id}
                      </div>
                      <div className="text-xs text-blue-600 capitalize">
                        {pin.activity} • {pin.timestamp.toLocaleString()}
                      </div>
                      {pin.notes && (
                        <div className="text-xs text-gray-600 italic mt-1">
                          "{pin.notes}"
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removePin(pin.id)}
                      disabled={isSubmitting}
                      className="text-red-500 hover:text-red-700 p-1 ml-2 disabled:opacity-50"
                      title="Eliminar bovino"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje si no hay animales */}
          {allBovines.length === 0 && isConnected && (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">No hay bovinos registrados</p>
              <p className="text-xs">Haz clic en "Agregar Bovino" para comenzar</p>
            </div>
          )}

          {/* Resumen */}
          {isConnected && (
            <div className="border-t pt-3 mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Estadísticas</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-blue-700 font-medium">Total Bovinos</div>
                  <div className="text-blue-900 font-bold">{allBovines.length}</div>
                </div>
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-green-700 font-medium">Con GPS</div>
                  <div className="text-green-900 font-bold">{animalPins.length}</div>
                </div>
                <div className="bg-yellow-50 p-2 rounded">
                  <div className="text-yellow-700 font-medium">Última Hora</div>
                  <div className="text-yellow-900 font-bold">
                    {animalPins.filter(p => 
                      (Date.now() - p.timestamp.getTime()) < 60 * 60 * 1000
                    ).length}
                  </div>
                </div>
                <div className="bg-purple-50 p-2 rounded">
                  <div className="text-purple-700 font-medium">Conectado</div>
                  <div className="text-purple-900 font-bold">{isConnected ? "Sí" : "No"}</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Dialog para agregar animal */}
        <AnimatePresence>
          {showAddAnimalDialog && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4"
              onClick={() => !isSubmitting && setShowAddAnimalDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">
                  Registrar Nuevo Bovino
                </h3>
                
                {backendError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {backendError}
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Arete * 
                      </label>
                      <input
                        type="text"
                        value={animalForm.earTag}
                        onChange={(e) => setAnimalForm(prev => ({ ...prev, earTag: e.target.value }))}
                        placeholder="Ej: COW-001"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={animalForm.name || ""}
                        onChange={(e) => setAnimalForm(prev => ({ ...prev, name: e.target.value || undefined }))}
                        placeholder="Ej: Luna"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Raza *
                      </label>
                      <input
                        type="text"
                        value={animalForm.breed}
                        onChange={(e) => setAnimalForm(prev => ({ ...prev, breed: e.target.value }))}
                        placeholder="Ej: Holstein"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sexo *
                      </label>
                      <select
                        value={animalForm.sex}
                        onChange={(e) => setAnimalForm(prev => ({ 
                          ...prev, 
                          sex: e.target.value as "male" | "female" 
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        disabled={isSubmitting}
                      >
                        <option value="female">Hembra</option>
                        <option value="male">Macho</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Edad (años) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={animalForm.age || ""}
                        onChange={(e) => setAnimalForm(prev => ({ 
                          ...prev, 
                          age: parseInt(e.target.value) || 0 
                        }))}
                        placeholder="Ej: 3"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Peso (kg) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="2000"
                        value={animalForm.weight || ""}
                        onChange={(e) => setAnimalForm(prev => ({ 
                          ...prev, 
                          weight: parseInt(e.target.value) || 0 
                        }))}
                        placeholder="Ej: 450"
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      value={animalForm.color || ""}
                      onChange={(e) => setAnimalForm(prev => ({ ...prev, color: e.target.value || undefined }))}
                      placeholder="Ej: Negro con blanco"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas adicionales
                    </label>
                    <textarea
                      value={animalForm.notes || ""}
                      onChange={(e) => setAnimalForm(prev => ({ ...prev, notes: e.target.value || undefined }))}
                      placeholder="Observaciones sobre el bovino..."
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent resize-none"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddAnimalDialog(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddAnimal}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-[#519a7c] text-white rounded-md hover:bg-[#457e68] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Target className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Guardando..." : "Continuar"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dialog para registrar ubicación */}
        <AnimatePresence>
          {showLocationDialog && currentAnimal && userLocation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4"
              onClick={() => !isSubmitting && setShowLocationDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">
                  Registrar Ubicación GPS
                </h3>

                <div className="mb-4 p-3 bg-green-50 rounded text-sm">
                  <div className="font-medium">Bovino: {currentAnimal.name || currentAnimal.earTag}</div>
                  <div className="text-gray-600">{currentAnimal.breed} • {currentAnimal.age} años</div>
                  {currentAnimal.id && (
                    <div className="text-xs text-blue-600">ID: {currentAnimal.id}</div>
                  )}
                </div>
                
                <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
                  <div className="font-medium">📍 Ubicación GPS obtenida:</div>
                  <div>Lat: {userLocation.latitude.toFixed(6)}</div>
                  <div>Lng: {userLocation.longitude.toFixed(6)}</div>
                  <div>Precisión: ±{userLocation.accuracy.toFixed(1)}m</div>
                  <div>Hora: {userLocation.timestamp.toLocaleString()}</div>
                </div>

                {backendError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {backendError}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ¿Qué está haciendo el bovino?
                    </label>
                    <select
                      value={locationForm.activity}
                      onChange={(e) => setLocationForm(prev => ({ 
                        ...prev, 
                        activity: e.target.value as typeof prev.activity 
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      disabled={isSubmitting}
                    >
                      <option value="grazing">🌱 Pastoreando</option>
                      <option value="walking">🚶 Caminando</option>
                      <option value="running">🏃 Corriendo</option>
                      <option value="resting">😴 Descansando</option>
                      <option value="drinking">💧 Bebiendo agua</option>
                      <option value="other">❓ Otra actividad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observaciones (opcional)
                    </label>
                    <textarea
                      value={locationForm.notes}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Notas sobre el comportamiento, estado de salud, etc..."
                      rows={3}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent resize-none"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowLocationDialog(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={registerAnimalLocation}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 bg-[#519a7c] text-white rounded-md hover:bg-[#457e68] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Guardando..." : "Registrar en Mapa"}
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
                  Información del Bovino
                </h3>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Información del animal */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    {selectedPin.animal.name || selectedPin.animal.earTag}
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      ID: {selectedPin.animal.id}
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-800">
                    <div>Arete: {selectedPin.animal.earTag}</div>
                    <div>Raza: {selectedPin.animal.breed}</div>
                    <div>Edad: {selectedPin.animal.age} años</div>
                    <div>Peso: {selectedPin.animal.weight} kg</div>
                    <div>Sexo: {selectedPin.animal.sex === "male" ? "Macho" : "Hembra"}</div>
                    {selectedPin.animal.color && <div>Color: {selectedPin.animal.color}</div>}
                  </div>
                  {selectedPin.animal.notes && (
                    <div className="mt-2 text-sm text-blue-700 italic">
                      Notas: {selectedPin.animal.notes}
                    </div>
                  )}
                </div>

                {/* Información de la ubicación */}
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Registro de Ubicación GPS</h4>
                  <div className="space-y-2 text-sm text-green-800">
                    <div>📅 Fecha: {selectedPin.timestamp.toLocaleDateString()}</div>
                    <div>🕐 Hora: {selectedPin.timestamp.toLocaleTimeString()}</div>
                    <div>🎯 Actividad: {selectedPin.activity}</div>
                    <div>📍 Coordenadas: {selectedPin.latitude.toFixed(6)}, {selectedPin.longitude.toFixed(6)}</div>
                    <div>📊 Precisión: ±{selectedPin.accuracy}m</div>
                    <div>🔸 Fuente: {selectedPin.source}</div>
                    {selectedPin.notes && (
                      <div className="mt-2 p-2 bg-green-100 rounded">
                        <div className="font-medium">Observaciones:</div>
                        <div className="italic">"{selectedPin.notes}"</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información de sincronización */}
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900 mb-2">Estado de Sincronización</h4>
                  <div className="space-y-1 text-sm text-purple-800">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-green-600" />
                      <span>Sincronizado con backend</span>
                    </div>
                    <div>Base de datos: Puerto 5000</div>
                    {selectedPin.animal.createdAt && (
                      <div>Creado: {new Date(selectedPin.animal.createdAt).toLocaleString()}</div>
                    )}
                    {selectedPin.animal.updatedAt && (
                      <div>Actualizado: {new Date(selectedPin.animal.updatedAt).toLocaleString()}</div>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => removePin(selectedPin.id)}
                    disabled={isSubmitting}
                    className="flex-1 px-3 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-colors text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    {isSubmitting ? "Eliminando..." : "Eliminar"}
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
            <LivestockSimulatedMap
              animalPins={filteredPins}
              userLocation={userLocation}
              onPinClick={handlePinClick}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default LivestockLocation;