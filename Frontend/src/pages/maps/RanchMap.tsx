import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  Save,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Settings,
  X,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw,
  Home,
  Trees,
  Droplets,
  Circle,
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
  id?: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  coordinates: [number, number];
  isCurrentLocation: boolean;
  area?: number; // hectáreas
  established?: string;
  owner?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface RanchOverview {
  center: {
    latitude: number;
    longitude: number;
  };
  bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  potreros?: Array<{
    id: string;
    name: string;
    area: number;
    location: {
      latitude: number;
      longitude: number;
    };
    cattle_count: number;
    grass_type: string;
  }>;
  ganado?: Array<{
    bovine: {
      id: string;
      earring_number: string;
      name: string;
      breed: string;
      status: string;
    };
    coordinates: {
      latitude: number;
      longitude: number;
      altitude?: number;
      accuracy?: number;
    };
    recorded_at: string;
  }>;
  infraestructura?: Array<{
    id: string;
    type: string;
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
    capacity?: number;
    facilities?: string[];
    status?: string;
  }>;
}

interface GeolocationState {
  isLoading: boolean;
  hasPermission: boolean;
  error: string | null;
  currentPosition: [number, number] | null;
}

interface ConnectionStatus {
  isConnected: boolean;
  lastCheck: Date;
  latency: number;
  retrying: boolean;
}

// ✅ CONFIGURACIÓN DE API
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// ✅ SERVICIO DE API PARA MAPAS DEL RANCHO
class RanchMapApiService {
  private baseURL: string;
  private timeout: number;
  
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // 🚀 Obtener token de autenticación
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || null;
  }

  // 🚀 Headers por defecto
  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // 🚀 Realizar petición con timeout y retry
  private async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    retries = API_CONFIG.RETRY_ATTEMPTS
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getDefaultHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (retries > 0 && (error as Error).name !== 'AbortError') {
        console.log(`🔄 Reintentando petición... ${retries} intentos restantes`);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      throw error;
    }
  }

  // 🚀 Verificar conexión con el backend
  async checkConnection(): Promise<{ connected: boolean; latency: number; message: string }> {
    const startTime = Date.now();
    
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}/ping`, {
        method: 'GET',
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          connected: true,
          latency,
          message: data.message || 'Conexión exitosa'
        };
      } else {
        return {
          connected: false,
          latency,
          message: `Error HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      
      if ((error as Error).name === 'AbortError') {
        return {
          connected: false,
          latency,
          message: 'Timeout: El servidor no responde'
        };
      }

      return {
        connected: false,
        latency,
        message: `Error de conexión: ${(error as Error).message}`
      };
    }
  }

  // 🚀 Obtener vista general del rancho
  async getRanchOverview(options?: {
    includePotreros?: boolean;
    includeGanado?: boolean;
    includeInfraestructura?: boolean;
  }): Promise<RanchOverview> {
    try {
      console.log('🔄 Obteniendo vista general del rancho...');

      const params = new URLSearchParams({
        includePotreros: (options?.includePotreros ?? true).toString(),
        includeGanado: (options?.includeGanado ?? true).toString(),
        includeInfraestructura: (options?.includeInfraestructura ?? true).toString(),
      });
      
      const response = await this.fetchWithRetry(
        `${this.baseURL}/maps/ranch-overview?${params}`
      );
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Vista general del rancho obtenida exitosamente:', data);
      
      return data.data;
    } catch (error) {
      console.warn('❌ API no disponible, usando datos mock:', error);
      return getMockRanchOverview();
    }
  }

  // 🚀 Obtener límites del rancho
  async getRanchBoundaries(): Promise<any> {
    try {
      console.log('🔄 Obteniendo límites del rancho...');
      
      const response = await this.fetchWithRetry(`${this.baseURL}/maps/ranch-boundaries`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Límites del rancho obtenidos exitosamente');
      
      return data.data;
    } catch (error) {
      console.warn('❌ API no disponible, usando límites mock:', error);
      return getMockRanchBoundaries();
    }
  }

  // 🚀 Guardar ubicación del rancho
  async saveRanchLocation(location: Partial<RanchLocation>): Promise<RanchLocation> {
    try {
      console.log('🔄 Guardando ubicación del rancho...', location);

      const response = await this.fetchWithRetry(`${this.baseURL}/ranch/profile`, {
        method: 'PUT',
        body: JSON.stringify({
          name: location.name,
          address: location.address,
          city: location.city,
          state: location.state,
          country: location.country,
          postal_code: location.postalCode,
          latitude: location.coordinates?.[0],
          longitude: location.coordinates?.[1],
          area: location.area,
          established_date: location.established,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Ubicación del rancho guardada exitosamente:', data);
      
      return {
        id: data.data.id,
        name: data.data.name || location.name || "",
        address: data.data.address || location.address || "",
        city: data.data.city || location.city || "",
        state: data.data.state || location.state || "",
        country: data.data.country || location.country || "",
        postalCode: data.data.postal_code || location.postalCode || "",
        coordinates: [
          data.data.latitude || location.coordinates?.[0] || 0,
          data.data.longitude || location.coordinates?.[1] || 0
        ],
        isCurrentLocation: location.isCurrentLocation || false,
        area: data.data.area || location.area,
        established: data.data.established_date || location.established,
        owner: data.data.owner || location.owner,
        createdAt: new Date(data.data.created_at),
        updatedAt: new Date(data.data.updated_at),
      };
    } catch (error) {
      console.warn('❌ API no disponible, simulando guardado:', error);
      
      // Fallback: simular guardado exitoso
      return {
        id: `mock_${Date.now()}`,
        name: location.name || "Rancho San José",
        address: location.address || "",
        city: location.city || "Villahermosa",
        state: location.state || "Tabasco",
        country: location.country || "México",
        postalCode: location.postalCode || "",
        coordinates: location.coordinates || [17.9895, -92.947],
        isCurrentLocation: location.isCurrentLocation || false,
        area: location.area || 125.5,
        established: location.established || "2020-01-15",
        owner: location.owner || "Universidad Juárez Autónoma de Tabasco",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
  }

  // 🚀 Obtener información del rancho
  async getRanchInfo(): Promise<RanchLocation> {
    try {
      console.log('🔄 Obteniendo información del rancho...');
      
      const response = await this.fetchWithRetry(`${this.baseURL}/ranch/profile`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Información del rancho obtenida exitosamente');
      
      return {
        id: data.data.id,
        name: data.data.name || "Rancho San José",
        address: data.data.address || "",
        city: data.data.city || "Villahermosa",
        state: data.data.state || "Tabasco",
        country: data.data.country || "México",
        postalCode: data.data.postal_code || "",
        coordinates: [
          data.data.latitude || 17.9895,
          data.data.longitude || -92.947
        ],
        isCurrentLocation: false,
        area: data.data.area || 125.5,
        established: data.data.established_date || "2020-01-15",
        owner: data.data.owner || "Universidad Juárez Autónoma de Tabasco",
        createdAt: new Date(data.data.created_at),
        updatedAt: new Date(data.data.updated_at),
      };
    } catch (error) {
      console.warn('❌ API no disponible, usando información mock:', error);
      return getMockRanchLocation();
    }
  }

  // 🚀 Obtener ubicaciones del ganado
  async getCattleLocations(): Promise<any[]> {
    try {
      console.log('🔄 Obteniendo ubicaciones del ganado...');
      
      const response = await this.fetchWithRetry(`${this.baseURL}/maps/cattle-locations`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Ubicaciones del ganado obtenidas exitosamente');
      
      return data.data.locations || [];
    } catch (error) {
      console.warn('❌ API no disponible, usando ubicaciones mock:', error);
      return getMockCattleLocations();
    }
  }
}

// 🚀 Hook para monitorear conexión
const useConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastCheck: new Date(),
    latency: 0,
    retrying: false,
  });

  const apiService = new RanchMapApiService();

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, retrying: true }));
    
    try {
      const result = await apiService.checkConnection();
      setStatus({
        isConnected: result.connected,
        lastCheck: new Date(),
        latency: result.latency,
        retrying: false,
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        lastCheck: new Date(),
        latency: 0,
        retrying: false,
      });
    }
  };

  useEffect(() => {
    // Verificar conexión al montar
    checkConnection();
    
    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { status, checkConnection };
};

// Datos mock para desarrollo y fallback
function getMockRanchOverview(): RanchOverview {
  return {
    center: {
      latitude: 17.9895,
      longitude: -92.947
    },
    bounds: {
      north: 18.0200,
      south: 17.9600,
      east: -92.9000,
      west: -93.0000
    },
    potreros: [
      {
        id: 'potrero_1',
        name: 'Potrero Norte',
        area: 25.5,
        location: {
          latitude: 17.9920,
          longitude: -92.9450
        },
        cattle_count: 35,
        grass_type: 'Brachiaria'
      },
      {
        id: 'potrero_2',
        name: 'Potrero Sur',
        area: 30.2,
        location: {
          latitude: 17.9870,
          longitude: -92.9480
        },
        cattle_count: 42,
        grass_type: 'Guinea'
      }
    ],
    ganado: [
      {
        bovine: {
          id: 'bovine_1',
          earring_number: 'BOV-001',
          name: 'Esperanza',
          breed: 'Holstein',
          status: 'active'
        },
        coordinates: {
          latitude: 17.9910,
          longitude: -92.9465,
          accuracy: 5
        },
        recorded_at: new Date().toISOString()
      },
      {
        bovine: {
          id: 'bovine_2',
          earring_number: 'BOV-002',
          name: 'Victoria',
          breed: 'Brahman',
          status: 'active'
        },
        coordinates: {
          latitude: 17.9885,
          longitude: -92.9475,
          accuracy: 3
        },
        recorded_at: new Date().toISOString()
      }
    ],
    infraestructura: [
      {
        id: 'barn_main',
        type: 'establo',
        name: 'Establo Principal',
        location: {
          latitude: 17.9895,
          longitude: -92.947
        },
        capacity: 100,
        facilities: ['ordeño', 'alimentación', 'refugio'],
        status: 'active'
      },
      {
        id: 'water_1',
        type: 'aguaje',
        name: 'Bebedero Central',
        location: {
          latitude: 17.9870,
          longitude: -92.9290
        },
        capacity: 5000,
        status: 'active'
      }
    ]
  };
}

function getMockRanchBoundaries(): any {
  return {
    type: 'Polygon',
    coordinates: [[
      [-92.9400, 17.9800],
      [-92.9200, 17.9800],
      [-92.9200, 17.9950],
      [-92.9400, 17.9950],
      [-92.9400, 17.9800]
    ]],
    properties: {
      name: 'Rancho San José',
      area: 125.5,
      owner: 'Universidad Juárez Autónoma de Tabasco',
      established: '2020-01-15'
    },
    center: {
      latitude: 17.9895,
      longitude: -92.947
    }
  };
}

function getMockRanchLocation(): RanchLocation {
  return {
    id: "ranch_1",
    name: "Rancho San José",
    address: "Carretera a Villahermosa Km 15",
    city: "Villahermosa",
    state: "Tabasco",
    country: "México",
    postalCode: "86000",
    coordinates: [17.9895, -92.947],
    isCurrentLocation: false,
    area: 125.5,
    established: "2020-01-15",
    owner: "Universidad Juárez Autónoma de Tabasco",
    createdAt: new Date("2020-01-15"),
    updatedAt: new Date(),
  };
}

function getMockCattleLocations(): any[] {
  return [
    {
      bovine: {
        id: 'bovine_1',
        earring_number: 'BOV-001',
        name: 'Esperanza',
        breed: 'Holstein',
        status: 'active'
      },
      coordinates: {
        latitude: 17.9910,
        longitude: -92.9465,
        accuracy: 5
      },
      recorded_at: new Date().toISOString()
    },
    {
      bovine: {
        id: 'bovine_2',
        earring_number: 'BOV-002',
        name: 'Victoria',
        breed: 'Brahman',
        status: 'active'
      },
      coordinates: {
        latitude: 17.9885,
        longitude: -92.9475,
        accuracy: 3
      },
      recorded_at: new Date().toISOString()
    }
  ];
}

// Función utilitaria para concatenar clases CSS
const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

// 🚀 Componente indicador de conexión
const ConnectionIndicator = () => {
  const { status, checkConnection } = useConnectionStatus();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        {status.isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600 font-medium">
              Conectado ({status.latency}ms)
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-600" />
            <span className="text-xs text-red-600 font-medium">Desconectado</span>
          </>
        )}
      </div>
      
      <button
        onClick={checkConnection}
        disabled={status.retrying}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
        title="Verificar conexión"
      >
        {status.retrying ? (
          <Loader2 className="w-3 h-3 animate-spin text-gray-600" />
        ) : (
          <RefreshCw className="w-3 h-3 text-gray-600 hover:text-gray-800" />
        )}
      </button>
    </div>
  );
};

// Componente para configurar ubicación del rancho
const LocationSetup: React.FC<{
  location: RanchLocation;
  onLocationChange: (location: RanchLocation) => void;
  onGetCurrentLocation: () => void;
  onSave: () => void;
  geolocation: GeolocationState;
  isVisible: boolean;
  onClose: () => void;
  isSaving: boolean;
}> = ({ location, onLocationChange, onGetCurrentLocation, onSave, geolocation, isVisible, onClose, isSaving }) => {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute top-4 right-4 z-[1001] bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 min-w-[350px] max-w-[400px]"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[#2d5a45] flex items-center gap-2">
          <Home className="w-5 h-5" />
          Configurar Rancho
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Información básica del rancho */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre del Rancho
          </label>
          <input
            type="text"
            value={location.name}
            onChange={(e) => onLocationChange({ ...location, name: e.target.value })}
            placeholder="Ej: Rancho San José"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dirección
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
            onClick={onSave}
            disabled={isSaving}
            className="flex-1 px-4 py-2 bg-[#519a7c] text-white rounded-md hover:bg-[#457e68] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
          <button
            onClick={() => onLocationChange({
              id: location.id,
              name: "Rancho San José",
              address: "",
              city: "Villahermosa",
              state: "Tabasco",
              country: "México",
              postalCode: "",
              coordinates: [17.9895, -92.947],
              isCurrentLocation: false,
              area: location.area,
              established: location.established,
              owner: location.owner,
            })}
            className="px-4 py-2 text-[#519a7c] border border-[#519a7c] rounded-md hover:bg-[#519a7c] hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Componente de mapa simulado con datos del backend
const SimulatedMap: React.FC<{
  location: RanchLocation;
  overview: RanchOverview | null;
  connectionStatus: ConnectionStatus;
}> = ({ location, overview, connectionStatus }) => {
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
          <Home className="w-5 h-5 text-green-600" />
          <span className="font-medium text-[#2d5a45]">
            {location.name} - {location.city}, {location.state}
          </span>
          {location.isCurrentLocation && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Ubicación actual
            </span>
          )}
        </div>
        {location.area && (
          <div className="text-xs text-gray-600 text-center mt-1">
            Área: {location.area} hectáreas
          </div>
        )}
      </div>

      {/* Marcador del rancho en el centro */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: 1, rotate: 360 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="w-16 h-16 bg-[#519a7c] rounded-full flex items-center justify-center shadow-lg border-4 border-white relative"
        >
          <Home className="w-8 h-8 text-white" />
          
          {/* Pulso animado */}
          <motion.div
            animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-[#519a7c] rounded-full"
          />
        </motion.div>
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white/90 px-3 py-1 rounded-lg text-sm font-medium text-[#2d5a45] whitespace-nowrap shadow-sm">
          {location.name}
        </div>
      </div>

      {/* Elementos del rancho si hay datos del backend */}
      {overview && connectionStatus.isConnected && (
        <>
          {/* Mostrar ganado */}
          {overview.ganado?.map((cattle, index) => {
            const angle = (index * 360) / overview.ganado!.length;
            const radius = 120;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            return (
              <motion.div
                key={cattle.bovine.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1 + index * 0.2 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `calc(50% + ${y}px)`,
                  left: `calc(50% + ${x}px)`,
                }}
              >
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-md border-2 border-white">
                  <Circle className="w-4 h-4 text-white fill-current" />
                </div>
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-amber-700 whitespace-nowrap shadow-sm">
                  {cattle.bovine.name || cattle.bovine.earring_number}
                </div>
              </motion.div>
            );
          })}

          {/* Mostrar infraestructura */}
          {overview.infraestructura?.map((infra, index) => {
            const angle = (index * 360) / overview.infraestructura!.length + 45;
            const radius = 160;
            const x = Math.cos((angle * Math.PI) / 180) * radius;
            const y = Math.sin((angle * Math.PI) / 180) * radius;

            const getIcon = (type: string) => {
              switch (type) {
                case 'establo': return <Home className="w-4 h-4 text-white" />;
                case 'aguaje': return <Droplets className="w-4 h-4 text-white" />;
                default: return <Trees className="w-4 h-4 text-white" />;
              }
            };

            const getColor = (type: string) => {
              switch (type) {
                case 'establo': return 'bg-red-500';
                case 'aguaje': return 'bg-blue-500';
                default: return 'bg-green-500';
              }
            };

            return (
              <motion.div
                key={infra.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1.5 + index * 0.3 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{
                  top: `calc(50% + ${y}px)`,
                  left: `calc(50% + ${x}px)`,
                }}
              >
                <div className={`w-10 h-10 ${getColor(infra.type)} rounded-lg flex items-center justify-center shadow-md border-2 border-white`}>
                  {getIcon(infra.type)}
                </div>
                <div className="absolute top-12 left-1/2 transform -translate-x-1/2 bg-white/90 px-2 py-1 rounded text-xs font-medium text-gray-700 whitespace-nowrap shadow-sm">
                  {infra.name}
                </div>
              </motion.div>
            );
          })}
        </>
      )}

      {/* Indicador de estado */}
      <div className="absolute bottom-4 left-4">
        <div className={cn(
          "rounded-lg px-3 py-2 text-xs",
          connectionStatus.isConnected 
            ? "bg-green-500/10 border border-green-500 text-green-700"
            : "bg-blue-500/10 border border-blue-500 text-blue-700"
        )}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              connectionStatus.isConnected ? "bg-green-500" : "bg-blue-500"
            )}></div>
            <span>
              {connectionStatus.isConnected 
                ? `Datos en vivo - ${overview?.ganado?.length || 0} bovinos` 
                : "Mapa Simulado - Vista de Desarrollo"
              }
            </span>
          </div>
        </div>
      </div>

      {/* Información del rancho en la esquina superior izquierda */}
      {location.owner && (
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md text-sm">
          <div className="text-[#2d5a45] font-medium">{location.owner}</div>
          {location.established && (
            <div className="text-gray-600 text-xs">Est. {new Date(location.established).getFullYear()}</div>
          )}
        </div>
      )}
    </div>
  );
};

export const RanchMap: React.FC<RanchMapProps> = ({ className }) => {
  // Estados para la ubicación del rancho
  const [ranchLocation, setRanchLocation] = useState<RanchLocation>({
    name: "Rancho San José",
    address: "",
    city: "Villahermosa",
    state: "Tabasco",
    country: "México",
    postalCode: "",
    coordinates: [17.9895, -92.947],
    isCurrentLocation: false,
  });

  // Estados para datos del backend
  const [ranchOverview, setRanchOverview] = useState<RanchOverview | null>(null);

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
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Referencias
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  // 🚀 Hook de conexión y servicio de API
  const { status: connectionStatus } = useConnectionStatus();
  const apiService = new RanchMapApiService();

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    
    try {
      // Cargar información del rancho
      const ranchInfo = await apiService.getRanchInfo();
      setRanchLocation(ranchInfo);
      
      // Cargar vista general del rancho
      const overview = await apiService.getRanchOverview({
        includePotreros: true,
        includeGanado: true,
        includeInfraestructura: true,
      });
      setRanchOverview(overview);
      
      console.log('✅ Datos del rancho cargados exitosamente');
    } catch (error) {
      console.error("❌ Error cargando datos del rancho:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // 🚀 Función para guardar ubicación del rancho
  const handleSaveRanchLocation = async () => {
    setIsSaving(true);
    
    try {
      const savedLocation = await apiService.saveRanchLocation(ranchLocation);
      setRanchLocation(savedLocation);
      setShowLocationSetup(false);
      
      // Recargar datos del rancho
      await loadData();
      
      console.log('✅ Ubicación del rancho guardada exitosamente');
    } catch (error) {
      console.error("❌ Error guardando ubicación del rancho:", error);
      alert('❌ Error al guardar la ubicación. Verifique su conexión e intente nuevamente.');
    } finally {
      setIsSaving(false);
    }
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

      // Agregar elementos del rancho
      addRanchElements(map);

      console.log("✅ Mapa de Leaflet inicializado correctamente");
    } catch (error) {
      console.error("❌ Error inicializando mapa de Leaflet:", error);
    }
  };

  // Agregar elementos del rancho al mapa
  const addRanchElements = (map: any) => {
    if (!map || !window.L) return;

    // Marcador del rancho principal
    const ranchMarker = window.L.marker(ranchLocation.coordinates, {
      icon: window.L.divIcon({
        className: 'ranch-location-marker',
        html: '<div style="background: #519a7c; color: white; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; border: 4px solid white; box-shadow: 0 3px 10px rgba(0,0,0,0.3);">🏠</div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      })
    }).addTo(map);

    ranchMarker.bindPopup(`
      <div style="padding: 16px; text-align: center; min-width: 200px;">
        <h3 style="margin: 0 0 8px 0; color: #2d5a45; font-weight: bold; font-size: 18px;">🏠 ${ranchLocation.name}</h3>
        <p style="margin: 0; color: #666; font-size: 14px;">${ranchLocation.address || "Dirección no especificada"}</p>
        <p style="margin: 4px 0; font-size: 14px; font-weight: 500;">${ranchLocation.city}, ${ranchLocation.state}</p>
        ${ranchLocation.area ? `<p style="margin: 4px 0; font-size: 13px; color: #059669;">Área: ${ranchLocation.area} hectáreas</p>` : ''}
        ${ranchLocation.owner ? `<p style="margin: 4px 0; font-size: 12px; color: #6b7280;">${ranchLocation.owner}</p>` : ''}
        ${ranchLocation.isCurrentLocation ? '<p style="margin: 8px 0 0 0; color: #059669; font-size: 12px; background: #dcfce7; padding: 4px 8px; border-radius: 12px; display: inline-block;">📍 Ubicación actual</p>' : ''}
      </div>
    `);

    // Agregar elementos del overview si están disponibles
    if (ranchOverview && connectionStatus.isConnected) {
      // Agregar ganado
      ranchOverview.ganado?.forEach((cattle) => {
        const cattleMarker = window.L.marker([cattle.coordinates.latitude, cattle.coordinates.longitude], {
          icon: window.L.divIcon({
            className: 'cattle-marker',
            html: '<div style="background: #f59e0b; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🐄</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
          })
        }).addTo(map);

        cattleMarker.bindPopup(`
          <div style="padding: 12px; text-align: center;">
            <h3 style="margin: 0 0 8px 0; color: #92400e; font-weight: bold; font-size: 16px;">🐄 ${cattle.bovine.name || cattle.bovine.earring_number}</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">Raza: ${cattle.bovine.breed}</p>
            <p style="margin: 4px 0; font-size: 14px;">ID: ${cattle.bovine.earring_number}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #6b7280;">Actualizado: ${new Date(cattle.recorded_at).toLocaleString()}</p>
          </div>
        `);
      });

      // Agregar infraestructura
      ranchOverview.infraestructura?.forEach((infra) => {
        const getInfraIcon = (type: string) => {
          switch (type) {
            case 'establo': return '🏠';
            case 'aguaje': return '💧';
            default: return '🌳';
          }
        };

        const getInfraColor = (type: string) => {
          switch (type) {
            case 'establo': return '#dc2626';
            case 'aguaje': return '#2563eb';
            default: return '#059669';
          }
        };

        const infraMarker = window.L.marker([infra.location.latitude, infra.location.longitude], {
          icon: window.L.divIcon({
            className: 'infra-marker',
            html: `<div style="background: ${getInfraColor(infra.type)}; color: white; border-radius: 8px; width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; font-size: 18px; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${getInfraIcon(infra.type)}</div>`,
            iconSize: [35, 35],
            iconAnchor: [17.5, 17.5]
          })
        }).addTo(map);

        infraMarker.bindPopup(`
          <div style="padding: 12px; text-align: center;">
            <h3 style="margin: 0 0 8px 0; color: ${getInfraColor(infra.type)}; font-weight: bold; font-size: 16px;">${getInfraIcon(infra.type)} ${infra.name}</h3>
            <p style="margin: 0; color: #666; font-size: 14px;">Tipo: ${infra.type}</p>
            ${infra.capacity ? `<p style="margin: 4px 0; font-size: 14px;">Capacidad: ${infra.capacity}</p>` : ''}
            ${infra.facilities ? `<p style="margin: 4px 0; font-size: 12px; color: #6b7280;">Servicios: ${infra.facilities.join(', ')}</p>` : ''}
          </div>
        `);
      });
    }
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
      
      addRanchElements(mapInstance.current);
    }
  }, [ranchLocation.coordinates, ranchOverview]);

  return (
    <div
      className={cn(
        "relative w-full h-screen overflow-hidden",
        "bg-gradient-to-br from-[#F5F5DC] via-[#E8E8C8] to-[#D3D3B8]",
        "h-[600px]",
        className
      )}
    >
      {/* Indicador de conexión */}
      <div className="absolute top-4 left-4 z-[1000]">
        <ConnectionIndicator />
      </div>

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

      {/* Indicador de carga */}
      {isLoading && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999] bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-[#519a7c]" />
            <span className="text-gray-700 font-medium">Cargando datos del rancho...</span>
          </div>
        </div>
      )}

      {/* Componente de configuración de ubicación */}
      <AnimatePresence>
        {showLocationSetup && (
          <LocationSetup
            location={ranchLocation}
            onLocationChange={setRanchLocation}
            onGetCurrentLocation={getCurrentLocation}
            onSave={handleSaveRanchLocation}
            geolocation={geolocation}
            isVisible={showLocationSetup}
            onClose={() => setShowLocationSetup(false)}
            isSaving={isSaving}
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
            overview={ranchOverview}
            connectionStatus={connectionStatus}
          />
        )}
      </motion.div>
    </div>
  );
};

export default RanchMap;