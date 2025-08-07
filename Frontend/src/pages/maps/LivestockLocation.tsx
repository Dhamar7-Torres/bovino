import React, { useState, useCallback } from "react";
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
  Eye,
} from "lucide-react";

// Interfaces principales
interface LivestockLocationProps {
  className?: string;
}

interface AnimalData {
  id: string;
  earTag: string;
  name?: string;
  breed: string;
  cattleType: "cow" | "bull" | "calf" | "heifer" | "steer";
  gender: "male" | "female";
  age: number; // en meses
  weight?: number; // en kg
  healthStatus: "healthy" | "sick" | "quarantine" | "treatment" | "recovery";
  color?: string;
  notes?: string;
}

interface AnimalLocationPin {
  id: string;
  animal: AnimalData;
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  deviceType: "gps_collar" | "ear_tag" | "manual" | "rfid";
  batteryLevel?: number;
  signalStrength?: number;
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
const LivestockSimulatedMap: React.FC<{
  animalPins: AnimalLocationPin[];
  userLocation: UserLocation | null;
  onPinClick: (pin: AnimalLocationPin) => void;
}> = ({ animalPins, userLocation, onPinClick }) => {
  
  // Función para obtener color según el estado de salud
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "#22c55e"; // Verde brillante
      case "sick": return "#ef4444"; // Rojo
      case "quarantine": return "#f59e0b"; // Amarillo/Naranja
      case "treatment": return "#8b5cf6"; // Morado
      case "recovery": return "#3b82f6"; // Azul
      default: return "#9ca3af"; // Gris
    }
  };

  const getHealthStatusLabel = (status: string) => {
    switch (status) {
      case "healthy": return "Saludable";
      case "sick": return "Enfermo";
      case "quarantine": return "Cuarentena";
      case "treatment": return "En Tratamiento";
      case "recovery": return "Recuperándose";
      default: return "Desconocido";
    }
  };

  const getCattleTypeIcon = (type: string) => {
    switch (type) {
      case "cow": return "🐄";
      case "bull": return "🐂";
      case "calf": return "🐮";
      case "heifer": return "🐄";
      case "steer": return "🐂";
      default: return "🐄";
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
          <span className="font-medium text-green-800">
            Mapa de Ganado - {animalPins.length} animales registrados
          </span>
          {animalPins.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
              <span>ACTIVO</span>
            </div>
          )}
        </div>
      </div>

      {/* Renderizado de ubicación del usuario */}
      {userLocation && (
        <div
          className="absolute pointer-events-none z-20 transition-all duration-300"
          style={{
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 1,
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
        </div>
      )}

      {/* Renderizado de pins de animales */}
      {animalPins.map((pin, index) => {
        // Posición distribuida para el mapa simulado
        const leftPercent = 15 + (index % 7) * 12;
        const topPercent = 15 + Math.floor(index / 7) * 15;
        
        return (
          <div
            key={pin.id}
            className="absolute cursor-pointer hover:scale-125 transition-all duration-200 group z-10"
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              transform: "translate(-50%, -50%)",
              opacity: 1,
            }}
            onClick={() => onPinClick(pin)}
          >
            <div className="relative">
              {/* Pin principal */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-4 border-white relative animate-pulse hover:animate-none"
                style={{ backgroundColor: getHealthStatusColor(pin.animal.healthStatus) }}
              >
                <span className="text-lg">{getCattleTypeIcon(pin.animal.cattleType)}</span>
                
                {/* Indicador de dispositivo */}
                {pin.deviceType === "gps_collar" && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Etiqueta con ID del animal */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black text-white px-3 py-1 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg">
                {pin.animal.earTag}
              </div>

              {/* Tooltip detallado al hover */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black/95 text-white text-sm rounded-lg px-4 py-3 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-30 shadow-2xl">
                <div className="space-y-2">
                  <div className="font-bold text-yellow-300">
                    {pin.animal.earTag} - {pin.animal.name || "Sin nombre"}
                  </div>
                  <div>
                    {pin.animal.breed} • {pin.animal.age} meses
                  </div>
                  {pin.animal.weight && <div>Peso: {pin.animal.weight} kg</div>}
                  <div className="text-green-300">Estado: {getHealthStatusLabel(pin.animal.healthStatus)}</div>
                  <div className="text-blue-300">Registrado: {pin.timestamp.toLocaleTimeString()}</div>
                  <div className="text-gray-300">Precisión: ±{pin.accuracy}m</div>
                  {pin.deviceType === "gps_collar" && <div className="text-cyan-300">📡 Collar GPS</div>}
                  {pin.batteryLevel && <div className="text-purple-300">🔋 Batería: {pin.batteryLevel}%</div>}
                  {pin.notes && <div className="text-purple-300">Nota: {pin.notes}</div>}
                </div>
                {/* Flecha del tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/95"></div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Mensaje si no hay pins */}
      {animalPins.length === 0 && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-600 bg-white/90 p-8 rounded-xl shadow-lg backdrop-blur-sm transition-all duration-300">
          <div className="text-6xl mb-4">🐄</div>
          <h3 className="text-xl font-bold text-green-800 mb-2">¡Bienvenido al Mapa de Ganado!</h3>
          <p className="text-base mb-2">No hay animales registrados aún</p>
          <p className="text-sm text-gray-500">Haz clic en "Agregar Animal" para comenzar el registro</p>
          <div className="mt-4 text-xs text-blue-600">
            📍 Los animales aparecerán aquí una vez que agregues el ganado
          </div>
        </div>
      )}

      {/* Contador de pins en tiempo real */}
      {animalPins.length > 0 && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="text-lg">🐄</span>
            <span>{animalPins.length} Animal{animalPins.length !== 1 ? 'es' : ''} en el Mapa</span>
          </div>
        </div>
      )}

      {/* Leyenda del mapa actualizada */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
        <h4 className="text-sm font-semibold text-green-800 mb-2">
          Estados de Salud
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Saludable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Enfermo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Cuarentena</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Tratamiento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Recuperación</span>
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

export const LivestockLocation: React.FC<LivestockLocationProps> = ({ className }) => {
  // Estados principales
  const [animalPins, setAnimalPins] = useState<AnimalLocationPin[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPin, setSelectedPin] = useState<AnimalLocationPin | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Estados para agregar animal
  const [showAddAnimalDialog, setShowAddAnimalDialog] = useState(false);
  const [animalForm, setAnimalForm] = useState<AnimalData>({
    id: "",
    earTag: "",
    name: "",
    breed: "",
    cattleType: "cow",
    gender: "female",
    age: 0,
    weight: 0,
    healthStatus: "healthy",
    color: "",
    notes: "",
  });
  
  // Estados para ubicación
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [currentAnimal, setCurrentAnimal] = useState<AnimalData | null>(null);
  const [locationForm, setLocationForm] = useState({
    deviceType: "manual" as "gps_collar" | "ear_tag" | "manual" | "rfid",
    batteryLevel: 100,
    signalStrength: 100,
    notes: "",
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Función para agregar nuevo animal
  const handleAddAnimal = useCallback(() => {
    if (!animalForm.earTag.trim() || !animalForm.breed.trim() || animalForm.age <= 0) {
      alert("Por favor completa los campos obligatorios (Arete, Raza, Edad)");
      return;
    }

    const newAnimal: AnimalData = {
      ...animalForm,
      id: `animal-${Date.now()}`,
      earTag: animalForm.earTag.trim(),
      breed: animalForm.breed.trim(),
      name: animalForm.name?.trim() || undefined,
      notes: animalForm.notes?.trim() || undefined,
    };

    setCurrentAnimal(newAnimal);
    setShowAddAnimalDialog(false);
    
    // Limpiar formulario
    setAnimalForm({
      id: "",
      earTag: "",
      name: "",
      breed: "",
      cattleType: "cow",
      gender: "female",
      age: 0,
      weight: 0,
      healthStatus: "healthy",
      color: "",
      notes: "",
    });

    // Proceder a obtener ubicación
    getCurrentLocation();
  }, [animalForm]);

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

  // Función para registrar la ubicación del animal
  const registerAnimalLocation = useCallback(() => {
    if (!currentAnimal || !userLocation) return;

    const newPin: AnimalLocationPin = {
      id: `pin-${Date.now()}`,
      animal: currentAnimal,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
      accuracy: userLocation.accuracy,
      timestamp: new Date(),
      deviceType: locationForm.deviceType,
      batteryLevel: locationForm.deviceType === "gps_collar" ? locationForm.batteryLevel : undefined,
      signalStrength: locationForm.deviceType === "gps_collar" ? locationForm.signalStrength : undefined,
      notes: locationForm.notes.trim() || undefined,
      addedBy: "gps",
    };
    
    setAnimalPins(prev => [...prev, newPin]);
    
    // Limpiar estados
    setLocationForm({ 
      deviceType: "manual", 
      batteryLevel: 100, 
      signalStrength: 100, 
      notes: "" 
    });
    setCurrentAnimal(null);
    setUserLocation(null);
    setShowLocationDialog(false);

    // Mostrar mensaje de éxito
    setSuccessMessage(`¡Animal ${newPin.animal.earTag} registrado exitosamente en el mapa!`);
    setTimeout(() => setSuccessMessage(null), 5000);
  }, [currentAnimal, userLocation, locationForm]);

  // Función para eliminar un pin
  const removePin = useCallback((pinId: string) => {
    setAnimalPins(prev => prev.filter(p => p.id !== pinId));
    setSelectedPin(null);
  }, []);

  // Función para manejar clic en pin
  const handlePinClick = useCallback((pin: AnimalLocationPin) => {
    setSelectedPin(pin);
  }, []);

  // Filtrar pins según búsqueda
  const filteredPins = animalPins.filter(
    (pin) =>
      pin.animal.earTag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.animal.breed.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.animal.healthStatus.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pin.animal.name && pin.animal.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-yellow-100 to-orange-400 p-6">
      <div
        className={cn(
          "relative w-full overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl",
          isFullscreen ? "fixed inset-4 z-50" : "h-[calc(100vh-3rem)]",
          className
        )}
      >
        {/* Panel de control principal */}
        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[320px] max-h-[calc(100vh-2rem)] overflow-y-auto transition-all duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-green-800 flex items-center gap-2">
              <Navigation className="w-5 h-5" />
              Mapa de Ganado
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

          {/* Botón principal para agregar animal */}
          <div className="mb-4">
            <button
              onClick={() => setShowAddAnimalDialog(true)}
              disabled={isGettingLocation}
              className={cn(
                "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200",
                isGettingLocation
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transform hover:scale-[1.02]"
              )}
            >
              {isGettingLocation ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              {isGettingLocation ? "Obteniendo ubicación..." : "Agregar Animal"}
            </button>
          </div>

          {/* Error de ubicación */}
          {locationError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg transition-all duration-300">
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
            </div>
          )}

          {/* Mensaje de éxito */}
          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg transition-all duration-300">
              <div className="flex items-center gap-2 text-green-700">
                <Target className="w-4 h-4" />
                <span className="font-medium">¡Éxito!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">{successMessage}</p>
            </div>
          )}

          {/* Barra de búsqueda */}
          {animalPins.length > 0 && (
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por arete, raza, estado o nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent transition-all duration-200"
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

          {/* Lista de animales registrados */}
          {animalPins.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-base">🐄</span>
                  Animales Registrados ({filteredPins.length})
                </h3>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {filteredPins
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((pin) => (
                  <div 
                    key={pin.id} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => handlePinClick(pin)}>
                      <div className="font-medium text-sm">
                        {pin.animal.earTag} - {pin.animal.name || "Sin nombre"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {pin.animal.breed} • {pin.animal.age} meses • {pin.animal.gender}
                      </div>
                      <div className="text-xs text-blue-600 capitalize">
                        {pin.animal.healthStatus} • {pin.animal.cattleType}
                      </div>
                      {pin.deviceType === "gps_collar" && (
                        <div className="text-xs text-cyan-600">
                          📡 Collar GPS
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
                        className="text-green-600 hover:text-green-800 p-1 opacity-0 group-hover:opacity-100 transition-all"
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje si no hay animales */}
          {animalPins.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-6xl mb-3">🐄</div>
              <p className="text-sm">No hay animales registrados</p>
              <p className="text-xs">Haz clic en "Agregar Animal" para comenzar</p>
            </div>
          )}

          {/* Resumen */}
          {animalPins.length > 0 && (
            <div className="border-t pt-3 mt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Resumen</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-green-50 p-2 rounded">
                  <div className="text-green-700 font-medium">Total</div>
                  <div className="text-green-900 font-bold">{animalPins.length}</div>
                </div>
                <div className="bg-blue-50 p-2 rounded">
                  <div className="text-blue-700 font-medium">Saludables</div>
                  <div className="text-blue-900 font-bold">
                    {animalPins.filter(pin => pin.animal.healthStatus === "healthy").length}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog para agregar animal */}
        {showAddAnimalDialog && (
          <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto transition-all duration-300 scale-100"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Agregar Nuevo Animal
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Arete *
                  </label>
                  <input
                    type="text"
                    value={animalForm.earTag}
                    onChange={(e) => setAnimalForm(prev => ({ ...prev, earTag: e.target.value }))}
                    placeholder="Ej: COW-001, A123"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre (opcional)
                  </label>
                  <input
                    type="text"
                    value={animalForm.name}
                    onChange={(e) => setAnimalForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ej: Luna, Toro Grande"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
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
                      placeholder="Ej: Holstein, Brahman"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Edad (meses) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={animalForm.age || ""}
                      onChange={(e) => setAnimalForm(prev => ({ 
                        ...prev, 
                        age: parseInt(e.target.value) || 0 
                      }))}
                      placeholder="Ej: 24"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Ganado
                    </label>
                    <select
                      value={animalForm.cattleType}
                      onChange={(e) => setAnimalForm(prev => ({ 
                        ...prev, 
                        cattleType: e.target.value as typeof prev.cattleType
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="cow">Vaca</option>
                      <option value="bull">Toro</option>
                      <option value="calf">Ternero</option>
                      <option value="heifer">Novilla</option>
                      <option value="steer">Novillo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Género
                    </label>
                    <select
                      value={animalForm.gender}
                      onChange={(e) => setAnimalForm(prev => ({ 
                        ...prev, 
                        gender: e.target.value as "male" | "female"
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="female">Hembra</option>
                      <option value="male">Macho</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Peso (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={animalForm.weight || ""}
                      onChange={(e) => setAnimalForm(prev => ({ 
                        ...prev, 
                        weight: parseFloat(e.target.value) || 0 
                      }))}
                      placeholder="Ej: 450"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado de Salud
                    </label>
                    <select
                      value={animalForm.healthStatus}
                      onChange={(e) => setAnimalForm(prev => ({ 
                        ...prev, 
                        healthStatus: e.target.value as typeof prev.healthStatus
                      }))}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent"
                    >
                      <option value="healthy">Saludable</option>
                      <option value="sick">Enfermo</option>
                      <option value="quarantine">Cuarentena</option>
                      <option value="treatment">En Tratamiento</option>
                      <option value="recovery">Recuperándose</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <input
                    type="text"
                    value={animalForm.color || ""}
                    onChange={(e) => setAnimalForm(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Ej: Negro con blanco, Marrón"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    value={animalForm.notes || ""}
                    onChange={(e) => setAnimalForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Notas sobre el animal, comportamiento especial..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddAnimalDialog(false)}
                  className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddAnimal}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Continuar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dialog para registrar ubicación */}
        {showLocationDialog && currentAnimal && userLocation && (
          <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg p-6 w-full max-w-md transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                Registrar Ubicación del Animal
              </h3>

              <div className="mb-4 p-3 bg-green-50 rounded text-sm">
                <div className="font-medium">Animal: {currentAnimal.earTag}</div>
                <div className="text-gray-600">{currentAnimal.breed} • {currentAnimal.age} meses</div>
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
                    Tipo de Dispositivo
                  </label>
                  <select
                    value={locationForm.deviceType}
                    onChange={(e) => setLocationForm(prev => ({ 
                      ...prev, 
                      deviceType: e.target.value as typeof prev.deviceType 
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent"
                  >
                    <option value="manual">📱 Registro Manual</option>
                    <option value="gps_collar">📡 Collar GPS</option>
                    <option value="ear_tag">🏷️ Arete Electrónico</option>
                    <option value="rfid">📻 RFID</option>
                  </select>
                </div>

                {locationForm.deviceType === "gps_collar" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nivel de Batería (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={locationForm.batteryLevel}
                        onChange={(e) => setLocationForm(prev => ({ 
                          ...prev, 
                          batteryLevel: parseInt(e.target.value) || 0 
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Señal (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={locationForm.signalStrength}
                        onChange={(e) => setLocationForm(prev => ({ 
                          ...prev, 
                          signalStrength: parseInt(e.target.value) || 0 
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones adicionales (opcional)
                  </label>
                  <textarea
                    value={locationForm.notes}
                    onChange={(e) => setLocationForm(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Comportamiento del animal, condiciones del área..."
                    rows={3}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600 focus:border-transparent resize-none"
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
                  onClick={registerAnimalLocation}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Registrar en Mapa
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Panel de información del pin seleccionado */}
        {selectedPin && (
          <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[350px] max-w-[400px] max-h-[calc(100vh-2rem)] overflow-y-auto transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-green-800 flex items-center gap-2">
                <Info className="w-5 h-5" />
                Información del Animal
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
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">
                  🐄 {selectedPin.animal.earTag} - {selectedPin.animal.name || "Sin nombre"}
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm text-green-800">
                  <div>Raza: {selectedPin.animal.breed}</div>
                  <div>Tipo: {selectedPin.animal.cattleType}</div>
                  <div>Género: {selectedPin.animal.gender}</div>
                  <div>Edad: {selectedPin.animal.age} meses</div>
                  {selectedPin.animal.weight && <div>Peso: {selectedPin.animal.weight} kg</div>}
                  <div>Estado: {selectedPin.animal.healthStatus}</div>
                  {selectedPin.animal.color && <div>Color: {selectedPin.animal.color}</div>}
                </div>
                {selectedPin.animal.notes && (
                  <div className="mt-2 text-sm text-green-700 italic">
                    Notas: {selectedPin.animal.notes}
                  </div>
                )}
              </div>

              {/* Información de la ubicación */}
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📍 Registro de Ubicación</h4>
                <div className="space-y-2 text-sm text-blue-800">
                  <div>📅 Fecha: {selectedPin.timestamp.toLocaleDateString()}</div>
                  <div>🕐 Hora: {selectedPin.timestamp.toLocaleTimeString()}</div>
                  <div>📱 Dispositivo: {selectedPin.deviceType}</div>
                  <div>📍 Coordenadas: {selectedPin.latitude.toFixed(6)}, {selectedPin.longitude.toFixed(6)}</div>
                  <div>📊 Precisión: ±{selectedPin.accuracy}m</div>
                  {selectedPin.batteryLevel && (
                    <div>🔋 Batería: {selectedPin.batteryLevel}%</div>
                  )}
                  {selectedPin.signalStrength && (
                    <div>📶 Señal: {selectedPin.signalStrength}%</div>
                  )}
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
          </div>
        )}

        {/* Contenedor del mapa */}
        <div className="w-full h-full transition-all duration-500">
          <LivestockSimulatedMap
            animalPins={filteredPins}
            userLocation={userLocation}
            onPinClick={handlePinClick}
          />
        </div>
      </div>
    </div>
  );
};

export default LivestockLocation;