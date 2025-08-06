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
  Wifi,
  WifiOff,
  Server,
  CheckCircle,
  Database,
  Activity,
  MapPin
} from "lucide-react";

// ======================================================================
// CONFIGURACIÓN DE LA API CORREGIDA - USAR ENDPOINTS CORRECTOS DEL BACKEND
// ======================================================================

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// ======================================================================
// INTERFACES CORREGIDAS PARA COINCIDIR CON EL BACKEND
// ======================================================================

interface GeofenceArea {
  id: string;
  name: string;
  description?: string;
  type: 'pasture' | 'facility' | 'restricted' | 'safe_zone';
  coordinates?: Array<{
    latitude: number;
    longitude: number;
  }>;
  center?: {
    latitude: number;
    longitude: number;
  };
  radius?: number;
  isActive?: boolean;
  alertsEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Campos específicos para pasturas
  area?: number;
  grassType?: string;
  capacity?: number;
  status?: "excellent" | "good" | "fair" | "poor";
  soilCondition?: "excellent" | "good" | "fair" | "poor";
  notes?: string;
}

interface PastureLocationPin {
  id: string;
  geofence: GeofenceArea;
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

interface BackendHealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  memory?: any;
  timestamp: string;
  version: string;
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  echo?: any; // Para el endpoint /echo
}

// ======================================================================
// CLASE API CORREGIDA PARA USAR ENDPOINTS CORRECTOS
// ======================================================================

class PasturesAPI {
  private static async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    retries = API_CONFIG.RETRY_ATTEMPTS
  ): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      ...options,
    };

    try {
      console.log(`🔄 Petición: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, defaultOptions);
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log(`✅ Respuesta exitosa: ${response.status}`);
      return response;
      
    } catch (error) {
      clearTimeout(timeout);
      
      if (retries > 0 && !(error instanceof Error && error.name === 'AbortError')) {
        console.log(`⚠️ Reintentando... Intentos restantes: ${retries - 1}`);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      console.error(`❌ Error después de ${API_CONFIG.RETRY_ATTEMPTS} intentos:`, error);
      throw error;
    }
  }

  // ===================================================================
  // VERIFICACIÓN DE SALUD DEL BACKEND CORREGIDA
  // ===================================================================
  
  static async checkBackendHealth(): Promise<BackendHealthStatus> {
    try {
      const response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/health`);
      const data = await response.json();
      
      // Corregir: el backend devuelve datos directamente, no en data.data
      if (data.success !== false) {
        console.log('🟢 Backend estado: SALUDABLE');
        return {
          status: data.status || 'healthy',
          uptime: data.uptime || 0,
          timestamp: data.timestamp || new Date().toISOString(),
          version: data.version || '1.0.0',
          memory: data.memory
        };
      } else {
        throw new Error('Respuesta de salud inválida');
      }
    } catch (error) {
      console.error('🔴 Backend estado: NO DISPONIBLE', error);
      return {
        status: 'down',
        uptime: 0,
        timestamp: new Date().toISOString(),
        version: 'unknown'
      };
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Probando conectividad...');
      const response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/ping`);
      const data = await response.json();
      
      const isHealthy = data.success && data.message === 'pong';
      console.log(isHealthy ? '✅ Conectividad: EXITOSA' : '⚠️ Conectividad: DEGRADADA');
      return isHealthy;
      
    } catch (error) {
      console.error('❌ Conectividad: FALLIDA', error);
      return false;
    }
  }

  // ===================================================================
  // OPERACIONES DE GEOFENCE/PASTURAS USANDO ENDPOINTS CORRECTOS
  // ===================================================================
  
  static async getAllPastures(): Promise<GeofenceArea[]> {
    try {
      console.log('📥 Cargando geocercas/pasturas...');
      
      // Usar el endpoint correcto del backend: /api/maps/geofences
      const response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/maps/geofences`);
      const data: APIResponse<GeofenceArea[]> = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const geofences = data.data;
        console.log(`✅ ${geofences.length} geocercas cargadas`);
        
        // Filtrar solo las que son pasturas o convertir todas a formato compatible
        return geofences.map((item: any) => ({
          id: item.id,
          name: item.name || 'Área sin nombre',
          description: item.description,
          type: item.type || 'pasture',
          coordinates: item.coordinates || [],
          center: item.center,
          radius: item.radius,
          isActive: item.active !== false,
          alertsEnabled: item.alertsEnabled,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          // Campos específicos de pasturas con valores por defecto
          area: parseFloat(item.area || item.capacity || Math.random() * 10 + 1),
          grassType: item.grassType || item.type === 'pasture' ? 'Brachiaria' : 'N/A',
          capacity: parseInt(item.capacity || Math.floor(Math.random() * 50) + 10),
          status: (item.status || 'good') as "excellent" | "good" | "fair" | "poor",
          soilCondition: (item.soilCondition || 'good') as "excellent" | "good" | "fair" | "poor",
          notes: item.notes || item.description
        }));
      } else {
        throw new Error(data.message || 'Respuesta inválida del servidor');
      }
    } catch (error: any) {
      console.error('❌ Error cargando pasturas:', error);
      
      if (error.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado. Verifique su conexión.');
      } else if (error.message.includes('fetch')) {
        throw new Error('No se puede conectar. Verifique que el backend esté ejecutándose en puerto 5000.');
      } else {
        throw new Error(error.message || 'Error desconocido');
      }
    }
  }

  static async createPasture(pastureData: Partial<GeofenceArea>): Promise<GeofenceArea> {
    try {
      console.log('📤 Creando nueva geocerca/pastura...', pastureData.name);
      
      const payload = {
        name: pastureData.name,
        description: pastureData.notes || pastureData.description,
        type: 'pasture',
        coordinates: pastureData.coordinates || [],
        center: pastureData.center,
        alertOnEntry: false,
        alertOnExit: true,
        capacity: pastureData.capacity,
        grassType: pastureData.grassType,
        // Agregar campos adicionales si los necesita el backend
        area: pastureData.area,
        status: pastureData.status,
        soilCondition: pastureData.soilCondition
      };

      const response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/maps/geofences`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data: APIResponse<GeofenceArea> = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ Geocerca creada exitosamente:', data.data.id);
        return data.data;
      } else {
        throw new Error(data.message || 'Error al crear la geocerca');
      }
    } catch (error: any) {
      console.error('❌ Error creando pastura:', error);
      throw new Error(error.message || 'Error al crear pastura');
    }
  }

  static async updatePasture(id: string, pastureData: Partial<GeofenceArea>): Promise<GeofenceArea> {
    try {
      console.log('📝 Actualizando geocerca:', id);
      
      const response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/maps/geofences/${id}`, {
        method: 'PUT',
        body: JSON.stringify(pastureData),
      });

      const data: APIResponse<GeofenceArea> = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ Geocerca actualizada exitosamente');
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar');
      }
    } catch (error: any) {
      console.error('❌ Error actualizando:', error);
      throw new Error(error.message || 'Error al actualizar');
    }
  }

  static async deletePasture(id: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando geocerca:', id);
      
      const response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/maps/geofences/${id}`, {
        method: 'DELETE',
      });

      const data: APIResponse = await response.json();
      
      if (data.success) {
        console.log('✅ Geocerca eliminada exitosamente');
      } else {
        throw new Error(data.message || 'Error al eliminar');
      }
    } catch (error: any) {
      console.error('❌ Error eliminando:', error);
      throw new Error(error.message || 'Error al eliminar');
    }
  }

  // ===================================================================
  // FUNCIONES AUXILIARES CORREGIDAS
  // ===================================================================

  static async getServerInfo(): Promise<any> {
    try {
      const response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/info`);
      const data: APIResponse = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('Error obteniendo info del servidor:', error);
      return null;
    }
  }

  static async testEcho(payload: any): Promise<any> {
    try {
      const response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/echo`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data: APIResponse = await response.json();
      return data.echo || data;
    } catch (error) {
      console.error('Error en test echo:', error);
      return null;
    }
  }
}

// ======================================================================
// COMPONENTE DE MAPA SIMULADO MEJORADO
// ======================================================================

const PastureSimulatedMap: React.FC<{
  pasturePins: PastureLocationPin[];
  userLocation: UserLocation | null;
  onPinClick: (pin: PastureLocationPin) => void;
  backendHealth: BackendHealthStatus | null;
}> = ({ pasturePins, userLocation, onPinClick, backendHealth }) => {
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "excellent": return "#22c55e";
      case "good": return "#3b82f6";
      case "fair": return "#f59e0b";
      case "poor": return "#ef4444";
      default: return "#9ca3af";
    }
  };

  const getHealthStatusColor = (status?: string) => {
    switch (status) {
      case "healthy": return "text-green-600";
      case "degraded": return "text-yellow-600";
      case "down": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden rounded-lg">
      {/* Fondo del mapa con patrón */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M11 18c3.866 0 7-3.133 7-7s-3.134-7-7-7-7 3.133-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.133 7-7s-3.134-7-7-7-7 3.133-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Header del mapa */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg pointer-events-none border border-green-200">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-[#519a7c]" />
          <div className="text-center">
            <div className="font-bold text-[#2d5a45] text-lg">
              Sistema de Gestión de Pasturas
            </div>
            <div className="text-sm text-[#519a7c] flex items-center gap-2 justify-center">
              <Server className="w-4 h-4" />
              <span>Backend Puerto 5000</span>
              <div className={`w-2 h-2 rounded-full ${backendHealth?.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span>{pasturePins.length} registradas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del backend */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md pointer-events-none">
        <div className="flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4" />
          <span className={`font-medium ${getHealthStatusColor(backendHealth?.status)}`}>
            Backend: {backendHealth?.status === 'healthy' ? 'Saludable' : 
                     backendHealth?.status === 'degraded' ? 'Degradado' : 
                     backendHealth?.status === 'down' ? 'Desconectado' : 'Verificando...'}
          </span>
        </div>
      </div>

      {/* Ubicación del usuario */}
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
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-xl border-4 border-white">
              <Crosshair className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg">
              Tu ubicación GPS
            </div>
            <div className="absolute inset-0 border-2 border-blue-300 rounded-full animate-ping"></div>
          </div>
        </motion.div>
      )}

      {/* Pins de pasturas */}
      {pasturePins.map((pin, index) => {
        const leftPercent = 15 + (index % 7) * 12;
        const topPercent = 15 + Math.floor(index / 7) * 15;
        
        return (
          <motion.div
            key={pin.id}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.15, type: "spring", stiffness: 250 }}
            className="absolute cursor-pointer hover:scale-110 transition-all duration-300 group z-10"
            style={{
              left: `${leftPercent}%`,
              top: `${topPercent}%`,
              transform: "translate(-50%, -50%)",
            }}
            onClick={() => onPinClick(pin)}
          >
            <div className="relative">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-4 border-white relative hover:animate-pulse"
                style={{ backgroundColor: getStatusColor(pin.geofence.status || 'good') }}
              >
                <Leaf className="w-7 h-7 text-white font-bold" />
                
                <div className="absolute -top-3 -right-3 bg-white text-xs font-bold text-gray-700 rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-gray-200">
                  {index + 1}
                </div>

                {pin.waterSource && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                    <div className="text-white text-xs font-bold">💧</div>
                  </div>
                )}
              </div>

              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap shadow-xl border border-gray-600">
                {pin.geofence.name}
                <div className="text-xs text-gray-300">{pin.geofence.area?.toFixed(1)} ha</div>
              </div>

              {/* Tooltip detallado */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black/95 text-white text-sm rounded-xl px-5 py-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-40 shadow-2xl max-w-xs">
                <div className="space-y-3">
                  <div className="font-bold text-yellow-300 text-base border-b border-gray-600 pb-2">
                    🌱 {pin.geofence.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-blue-300">Área:</span> {pin.geofence.area?.toFixed(1)} ha</div>
                    <div><span className="text-green-300">Pasto:</span> {pin.geofence.grassType}</div>
                    <div><span className="text-purple-300">Capacidad:</span> {pin.geofence.capacity} cabezas</div>
                    <div><span className="text-orange-300">Estado:</span> {pin.geofence.status}</div>
                  </div>
                  <div className="border-t border-gray-600 pt-2 space-y-1">
                    <div className="text-cyan-300 text-xs">📍 GPS: ±{pin.accuracy}m</div>
                    <div className="text-green-300 text-xs">🕐 {pin.timestamp.toLocaleTimeString()}</div>
                    {pin.waterSource && <div className="text-cyan-300 text-xs">💧 Con fuente de agua</div>}
                  </div>
                  {pin.geofence.id && (
                    <div className="border-t border-gray-600 pt-2">
                      <div className="text-gray-400 text-xs">🆔 ID: {pin.geofence.id.substring(0, 8)}...</div>
                      <div className="text-green-400 text-xs">🌐 Sincronizado con Backend</div>
                    </div>
                  )}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-6 border-transparent border-t-black/95"></div>
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
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-gray-600 bg-white/95 p-10 rounded-2xl shadow-xl backdrop-blur-sm border-2 border-green-100"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="relative">
                <Leaf className="w-20 h-20 text-[#519a7c]" />
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-[#2d5a45] mb-2">
                ¡Sistema Listo para Pasturas!
              </h3>
              <p className="text-lg mb-3 text-gray-700">
                Conectado exitosamente al backend
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Las pasturas registradas aparecerán automáticamente
              </p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Server className="w-4 h-4" />
                <span>Backend: /api/maps/geofences</span>
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Database className="w-4 h-4" />
                <span>Estado: {backendHealth?.status || 'verificando'}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-purple-600">
                <Activity className="w-4 h-4" />
                <span>Endpoints: Configurados</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Contador de pins */}
      {pasturePins.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-32 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-[#519a7c] to-[#457e68] text-white px-6 py-3 rounded-full shadow-xl border-2 border-white"
        >
          <div className="flex items-center gap-3 text-sm font-bold">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              <span>{pasturePins.length} Pastura{pasturePins.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="h-4 w-px bg-white/50"></div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>Geolocalizadas</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Leyenda */}
      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-4 border border-gray-200">
        <h4 className="text-sm font-bold text-[#2d5a45] mb-3 flex items-center gap-2">
          <Info className="w-4 h-4" />
          Estados de las Pasturas
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-green-500 rounded-full shadow-sm"></div>
            <span className="font-medium">Excelente</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-blue-500 rounded-full shadow-sm"></div>
            <span className="font-medium">Bueno</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-yellow-500 rounded-full shadow-sm"></div>
            <span className="font-medium">Regular</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
            <span className="font-medium">Pobre</span>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-3 mt-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
            <span>💧 = Fuente de agua</span>
          </div>
        </div>
      </div>

      {/* Indicador de conexión */}
      <div className="absolute bottom-4 left-4 bg-green-50 border-2 border-green-200 rounded-xl px-4 py-3 pointer-events-none shadow-lg">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${backendHealth?.status === 'healthy' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <Server className="w-4 h-4 text-green-700" />
            <span className="text-green-800 font-semibold">
              {backendHealth?.status === 'healthy' ? 'Backend Activo' : 'Backend Inactivo'}
            </span>
          </div>
          <div className="h-4 w-px bg-green-300"></div>
          <div className="text-green-700 text-xs">
            <div>Puerto: 5000</div>
            <div>API: /maps/geofences</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================================================================
// COMPONENTE PRINCIPAL CORREGIDO
// ======================================================================

export const PastureMap: React.FC<{ className?: string }> = ({ className }) => {
  // Estados principales
  const [allPastures, setAllPastures] = useState<GeofenceArea[]>([]);
  const [pasturePins, setPasturePins] = useState<PastureLocationPin[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPin, setSelectedPin] = useState<PastureLocationPin | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Estados para el backend
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [backendHealth, setBackendHealth] = useState<BackendHealthStatus | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para formularios
  const [showAddPastureDialog, setShowAddPastureDialog] = useState(false);
  const [pastureForm, setPastureForm] = useState<Partial<GeofenceArea>>({
    name: "",
    area: 0,
    grassType: "",
    capacity: 0,
    status: "excellent",
    soilCondition: "good",
    notes: "",
  });
  
  const [showLocationDialog, setShowLocationDialog] = useState(false);
  const [currentPasture, setCurrentPasture] = useState<GeofenceArea | null>(null);
  const [locationForm, setLocationForm] = useState({
    waterSource: false,
    fencing: "good" as "excellent" | "good" | "needs_repair" | "poor",
    notes: "",
  });
  
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Referencias
  const timeoutRefs = useRef<Set<NodeJS.Timeout>>(new Set());

  // ======================================================================
  // FUNCIONES HELPER CORREGIDAS
  // ======================================================================

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout));
    timeoutRefs.current.clear();
  }, []);

  const addTimeout = useCallback((timeout: NodeJS.Timeout) => {
    timeoutRefs.current.add(timeout);
  }, []);

  const cn = (...classes: (string | undefined | false)[]) => {
    return classes.filter(Boolean).join(" ");
  };

  // ======================================================================
  // FUNCIONES BACKEND CORREGIDAS
  // ======================================================================

  const checkBackendConnection = useCallback(async () => {
    try {
      console.log('🔄 Verificando backend...');
      setBackendError(null);
      
      const isConnected = await PasturesAPI.testConnection();
      setIsConnected(isConnected);
      
      if (isConnected) {
        const health = await PasturesAPI.checkBackendHealth();
        setBackendHealth(health);
        console.log('✅ Backend OK');
      } else {
        setBackendError("Backend no disponible en puerto 5000");
        setBackendHealth({ status: 'down', uptime: 0, timestamp: new Date().toISOString(), version: 'unknown' });
      }
      
      return isConnected;
    } catch (error: any) {
      console.error('❌ Error verificando backend:', error);
      setIsConnected(false);
      setBackendError(error.message || "Error de conexión");
      return false;
    }
  }, []);

  const loadPasturesFromBackend = useCallback(async () => {
    try {
      setIsLoading(true);
      setBackendError(null);
      
      console.log("🔄 Cargando pasturas...");
      
      const connectionOk = await checkBackendConnection();
      if (!connectionOk) {
        return;
      }

      const pastures = await PasturesAPI.getAllPastures();
      
      console.log(`✅ ${pastures.length} pasturas cargadas`);
      setAllPastures(pastures);
      
      // Crear pins para pasturas que tengan ubicación
      const pins: PastureLocationPin[] = pastures
        .filter(pasture => 
          (pasture.center?.latitude && pasture.center?.longitude) || 
          (pasture.coordinates && pasture.coordinates.length > 0)
        )
        .map((pasture) => {
          let latitude: number;
          let longitude: number;
          
          if (pasture.center?.latitude && pasture.center?.longitude) {
            latitude = pasture.center.latitude;
            longitude = pasture.center.longitude;
          } else if (pasture.coordinates && pasture.coordinates.length > 0) {
            // Calcular centro de las coordenadas
            const avgLat = pasture.coordinates.reduce((sum, coord) => sum + coord.latitude, 0) / pasture.coordinates.length;
            const avgLng = pasture.coordinates.reduce((sum, coord) => sum + coord.longitude, 0) / pasture.coordinates.length;
            latitude = avgLat;
            longitude = avgLng;
          } else {
            return null; // No debería llegar aquí por el filtro
          }
          
          return {
            id: `pin-${pasture.id}`,
            geofence: pasture,
            latitude,
            longitude,
            accuracy: 10,
            timestamp: new Date(),
            waterSource: Math.random() > 0.7, // Valor aleatorio para demo
            fencing: "good",
            notes: pasture.notes,
            addedBy: "gps"
          } as PastureLocationPin;
        })
        .filter((pin): pin is PastureLocationPin => pin !== null);
      
      console.log(`📍 ${pins.length} pins generados`);
      setPasturePins(pins);
      
    } catch (error: any) {
      console.error("❌ Error cargando pasturas:", error);
      setBackendError(error.message);
      setIsConnected(false);
      
    } finally {
      setIsLoading(false);
    }
  }, [checkBackendConnection]);

  // ======================================================================
  // EFECTOS CORREGIDOS
  // ======================================================================

  useEffect(() => {
    loadPasturesFromBackend();
    
    // Verificación periódica cada 30 segundos
    const healthCheckInterval = setInterval(checkBackendConnection, 30000);
    
    return () => {
      clearInterval(healthCheckInterval);
      clearAllTimeouts();
    };
  }, [loadPasturesFromBackend, checkBackendConnection, clearAllTimeouts]);

  // ======================================================================
  // FUNCIONES DE FORMULARIO CORREGIDAS
  // ======================================================================

  const validatePastureForm = (data: Partial<GeofenceArea>): string[] => {
    const errors: string[] = [];
    
    if (!data.name?.trim()) {
      errors.push("El nombre es obligatorio");
    } else if (data.name.trim().length < 3) {
      errors.push("El nombre debe tener al menos 3 caracteres");
    }
    
    if (!data.grassType?.trim()) {
      errors.push("El tipo de pasto es obligatorio");
    }
    
    if (!data.area || data.area <= 0) {
      errors.push("El área debe ser mayor a 0");
    }
    
    if (!data.capacity || data.capacity <= 0) {
      errors.push("La capacidad debe ser mayor a 0");
    }
    
    return errors;
  };

  const handleAddPasture = async () => {
    const errors = validatePastureForm(pastureForm);
    if (errors.length > 0) {
      alert("❌ Errores:\n\n" + errors.join("\n"));
      return;
    }

    try {
      setIsSubmitting(true);
      setBackendError(null);

      const connectionOk = await checkBackendConnection();
      if (!connectionOk) {
        throw new Error("Sin conexión al backend");
      }
      
      const newPasture = await PasturesAPI.createPasture(pastureForm);
      
      setAllPastures(prev => [...prev, newPasture]);
      setCurrentPasture(newPasture);
      setShowAddPastureDialog(false);
      
      setPastureForm({
        name: "",
        area: 0,
        grassType: "",
        capacity: 0,
        status: "excellent",
        soilCondition: "good",
        notes: "",
      });

      setSuccessMessage(`¡Pastura "${newPasture.name}" creada! Obteniendo ubicación GPS...`);
      const successTimeout = setTimeout(() => setSuccessMessage(null), 5000);
      addTimeout(successTimeout);
      
      getCurrentLocation();
      
    } catch (error: any) {
      console.error("❌ Error creando pastura:", error);
      setBackendError(error.message);
      alert("❌ Error:\n\n" + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCurrentLocation = useCallback(async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("Geolocalización no soportada");
      setIsGettingLocation(false);
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000
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
        let errorMessage = "Error obteniendo ubicación GPS";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso denegado. Permite acceso a ubicación.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Ubicación no disponible. Verifica GPS.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo agotado. Intenta nuevamente.";
            break;
        }
        
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      options
    );
  }, []);

  const registerPastureLocation = async () => {
    if (!currentPasture || !userLocation) return;

    try {
      setIsSubmitting(true);
      setBackendError(null);

      const connectionOk = await checkBackendConnection();
      if (!connectionOk) {
        throw new Error("Sin conexión al backend");
      }

      const updatedPasture = await PasturesAPI.updatePasture(currentPasture.id, {
        ...currentPasture,
        center: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude
        },
        notes: locationForm.notes.trim() || currentPasture.notes
      });

      setAllPastures(prev => prev.map(pasture => 
        pasture.id === currentPasture.id ? updatedPasture : pasture
      ));

      const newPin: PastureLocationPin = {
        id: `pin-${currentPasture.id}`,
        geofence: updatedPasture,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy,
        timestamp: new Date(),
        waterSource: locationForm.waterSource,
        fencing: locationForm.fencing,
        notes: locationForm.notes.trim() || undefined,
        addedBy: "gps"
      };

      setPasturePins(prev => {
        const filtered = prev.filter(p => p.geofence.id !== currentPasture.id);
        return [...filtered, newPin];
      });
      
      // Limpiar estados
      setLocationForm({ waterSource: false, fencing: "good", notes: "" });
      setCurrentPasture(null);
      setUserLocation(null);
      setShowLocationDialog(false);

      setSuccessMessage(`🎉 Pastura "${updatedPasture.name}" registrada con precisión ±${userLocation.accuracy.toFixed(1)}m`);
      const successTimeout = setTimeout(() => setSuccessMessage(null), 7000);
      addTimeout(successTimeout);
      
    } catch (error: any) {
      console.error("❌ Error registrando ubicación:", error);
      setBackendError(error.message);
      alert("❌ Error registrando ubicación:\n\n" + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const removePin = async (pinId: string) => {
    const pin = pasturePins.find(p => p.id === pinId);
    if (!pin || !pin.geofence.id) return;

    if (!confirm(`¿Eliminar "${pin.geofence.name}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      setIsSubmitting(true);
      setBackendError(null);

      const connectionOk = await checkBackendConnection();
      if (!connectionOk) {
        throw new Error("Sin conexión al backend");
      }
      
      await PasturesAPI.deletePasture(pin.geofence.id);

      setAllPastures(prev => prev.filter(p => p.id !== pin.geofence.id));
      setPasturePins(prev => prev.filter(p => p.id !== pinId));
      
      if (selectedPin?.id === pinId) {
        setSelectedPin(null);
      }
      
      setSuccessMessage(`✅ Pastura "${pin.geofence.name}" eliminada`);
      const successTimeout = setTimeout(() => setSuccessMessage(null), 4000);
      addTimeout(successTimeout);
      
    } catch (error: any) {
      console.error("❌ Error eliminando:", error);
      setBackendError(error.message);
      alert("❌ Error eliminando:\n\n" + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinClick = useCallback((pin: PastureLocationPin) => {
    setSelectedPin(pin);
  }, []);

  const handleRefresh = async () => {
    setSuccessMessage("🔄 Recargando...");
    await loadPasturesFromBackend();
    const timeout = setTimeout(() => setSuccessMessage(null), 2000);
    addTimeout(timeout);
  };

  const filteredPins = pasturePins.filter(
    (pin) =>
      pin.geofence.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.geofence.grassType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.geofence.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pin.geofence.id && pin.geofence.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ======================================================================
  // RENDERIZADO
  // ======================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="text-center bg-white/90 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <RefreshCw className="w-16 h-16 text-green-600 animate-spin" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Conectando con Backend
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Puerto 5000 • API: /maps/geofences
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Server className="w-4 h-4" />
            <span>Verificando estado del sistema</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <div
        className={cn(
          "relative w-full overflow-hidden bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl",
          isFullscreen ? "fixed inset-4 z-50" : "h-[calc(100vh-3rem)]",
          className
        )}
      >
        {/* Panel de control */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-5 min-w-[350px] max-h-[calc(100vh-2rem)] overflow-y-auto border border-gray-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#2d5a45] flex items-center gap-2">
              <Navigation className="w-6 h-6" />
              Sistema de Pasturas
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {isConnected ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <Wifi className="w-5 h-5" />
                    <span className="text-xs font-medium">CONECTADO</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <WifiOff className="w-5 h-5" />
                    <span className="text-xs font-medium">DESCONECTADO</span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Estado de conexión */}
          <div className={cn(
            "mb-5 p-4 rounded-xl text-sm border-2",
            isConnected ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          )}>
            <div className={cn(
              "flex items-center gap-3 font-bold mb-2",
              isConnected ? "text-green-700" : "text-red-700"
            )}>
              {isConnected ? <Server className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              <div>
                {isConnected ? "Backend Conectado" : "Backend Desconectado"}
                {backendHealth && (
                  <span className="ml-2 text-xs px-2 py-1 rounded-full bg-white/70">
                    {backendHealth.status}
                  </span>
                )}
              </div>
            </div>
            <div className={cn(
              "text-xs space-y-1",
              isConnected ? "text-green-600" : "text-red-600"
            )}>
              {isConnected ? (
                <>
                  <div className="flex justify-between">
                    <span>API:</span>
                    <span className="font-mono">/maps/geofences</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pasturas:</span>
                    <span className="font-bold">{allPastures.length} sincronizadas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GPS:</span>
                    <span className="font-bold">{pasturePins.length} geolocalizadas</span>
                  </div>
                </>
              ) : (
                <div>
                  <div>{backendError || "Verificar servidor en puerto 5000"}</div>
                  <div className="mt-2 text-xs text-gray-500">
                    Endpoint: /api/maps/geofences
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botones principales */}
          <div className="space-y-3 mb-5">
            <button
              onClick={() => setShowAddPastureDialog(true)}
              disabled={isGettingLocation || isSubmitting || !isConnected}
              className={cn(
                "w-full flex items-center justify-center gap-3 px-5 py-4 rounded-xl font-bold transition-all duration-200 text-lg",
                (isGettingLocation || isSubmitting || !isConnected)
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#519a7c] to-[#457e68] text-white hover:from-[#457e68] hover:to-[#3d6b58] shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isGettingLocation ? (
                <RefreshCw className="w-6 h-6 animate-spin" />
              ) : (
                <Plus className="w-6 h-6" />
              )}
              {isSubmitting ? "Guardando..." : isGettingLocation ? "Obteniendo ubicación..." : "Agregar Pastura"}
            </button>

            <button
              onClick={handleRefresh}
              disabled={isLoading || isSubmitting}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              <RefreshCw className={cn("w-5 h-5", isLoading && "animate-spin")} />
              Recargar Datos
            </button>
          </div>

          {/* Mensajes de estado */}
          <AnimatePresence>
            {backendError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl"
              >
                <div className="flex items-center gap-2 text-red-700 mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-bold">Error de Conexión</span>
                </div>
                <p className="text-sm text-red-600 mb-4">{backendError}</p>
                <button
                  onClick={handleRefresh}
                  className="w-full text-sm bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Reintentar
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {locationError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl"
              >
                <div className="flex items-center gap-2 text-yellow-700 mb-3">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-bold">Error GPS</span>
                </div>
                <p className="text-sm text-yellow-600 mb-4">{locationError}</p>
                <button
                  onClick={getCurrentLocation}
                  className="w-full text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Reintentar GPS
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl"
              >
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-bold">¡Éxito!</span>
                </div>
                <p className="text-sm text-green-600">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Barra de búsqueda */}
          {pasturePins.length > 0 && (
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar pasturas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent transition-all duration-200 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}

          {/* Lista de pasturas */}
          {pasturePins.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-[#519a7c]" />
                  Pasturas ({filteredPins.length})
                </h3>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredPins.map((pin) => (
                  <motion.div 
                    key={pin.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group shadow-sm border border-gray-200"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => handlePinClick(pin)}>
                      <div className="font-bold text-sm flex items-center gap-2 mb-1">
                        <span className="text-[#2d5a45]">{pin.geofence.name}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                          Backend
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {pin.geofence.area?.toFixed(1)} ha • {pin.geofence.grassType}
                        {pin.geofence.id && <span className="ml-2 text-gray-400">ID: {pin.geofence.id.substring(0, 8)}...</span>}
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium capitalize",
                            pin.geofence.status === 'excellent' ? "bg-green-100 text-green-700" :
                            pin.geofence.status === 'good' ? "bg-blue-100 text-blue-700" :
                            pin.geofence.status === 'fair' ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {pin.geofence.status}
                          </span>
                          <span className="text-gray-600">
                            Cap: {pin.geofence.capacity}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePinClick(pin)}
                        className="text-[#519a7c] hover:text-[#457e68] p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-[#519a7c]/10 rounded-lg"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => removePin(pin.id)}
                        disabled={isSubmitting}
                        className="text-red-500 hover:text-red-700 p-2 ml-1 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Estadísticas */}
          {isConnected && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-t-2 border-gray-200 pt-5 mt-5"
            >
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Estadísticas
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                  <div className="text-blue-700 font-bold">Total</div>
                  <div className="text-blue-900 font-black text-lg">{allPastures.length}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
                  <div className="text-green-700 font-bold">Con GPS</div>
                  <div className="text-green-900 font-black text-lg">{pasturePins.length}</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl border border-purple-200">
                  <div className="text-purple-700 font-bold">Backend</div>
                  <div className="text-purple-900 font-black text-lg">
                    {isConnected ? "✅ OK" : "❌ ERROR"}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-xl border border-yellow-200">
                  <div className="text-yellow-700 font-bold">API</div>
                  <div className="text-yellow-900 font-black text-xs">geofences</div>
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
              className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4"
              onClick={() => !isSubmitting && setShowAddPastureDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-[#2d5a45] mb-6 flex items-center gap-3">
                  <Plus className="w-7 h-7" />
                  Nueva Pastura
                </h3>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      value={pastureForm.name || ""}
                      onChange={(e) => setPastureForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Potrero Norte, Las Flores"
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Área (ha) *
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
                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent transition-all"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Capacidad *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={pastureForm.capacity || ""}
                        onChange={(e) => setPastureForm(prev => ({ 
                          ...prev, 
                          capacity: parseInt(e.target.value) || 0 
                        }))}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent transition-all"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Tipo de Pasto *
                    </label>
                    <input
                      type="text"
                      value={pastureForm.grassType || ""}
                      onChange={(e) => setPastureForm(prev => ({ ...prev, grassType: e.target.value }))}
                      placeholder="Ej: Brachiaria, Guinea, Tanzania"
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Estado
                      </label>
                      <select
                        value={pastureForm.status || "excellent"}
                        onChange={(e) => setPastureForm(prev => ({ 
                          ...prev, 
                          status: e.target.value as "excellent" | "good" | "fair" | "poor"
                        }))}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent transition-all"
                        disabled={isSubmitting}
                      >
                        <option value="excellent">🟢 Excelente</option>
                        <option value="good">🔵 Bueno</option>
                        <option value="fair">🟡 Regular</option>
                        <option value="poor">🔴 Pobre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Suelo
                      </label>
                      <select
                        value={pastureForm.soilCondition || "good"}
                        onChange={(e) => setPastureForm(prev => ({ 
                          ...prev, 
                          soilCondition: e.target.value as "excellent" | "good" | "fair" | "poor"
                        }))}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent transition-all"
                        disabled={isSubmitting}
                      >
                        <option value="excellent">🟢 Excelente</option>
                        <option value="good">🔵 Buena</option>
                        <option value="fair">🟡 Regular</option>
                        <option value="poor">🔴 Mala</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Observaciones
                    </label>
                    <textarea
                      value={pastureForm.notes || ""}
                      onChange={(e) => setPastureForm(prev => ({ ...prev, notes: e.target.value || undefined }))}
                      placeholder="Notas sobre la pastura..."
                      rows={4}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent resize-none transition-all"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowAddPastureDialog(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleAddPasture}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#519a7c] to-[#457e68] text-white rounded-xl hover:from-[#457e68] hover:to-[#3d6b58] transition-all flex items-center justify-center gap-3 disabled:opacity-50 font-bold"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Target className="w-5 h-5" />
                    )}
                    {isSubmitting ? "Guardando..." : "Crear y Geolocalizar"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dialog para ubicación */}
        <AnimatePresence>
          {showLocationDialog && currentPasture && userLocation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-[2000] flex items-center justify-center p-4"
              onClick={() => !isSubmitting && setShowLocationDialog(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-bold text-[#2d5a45] mb-6 flex items-center gap-3">
                  <MapPin className="w-7 h-7" />
                  Registrar Ubicación
                </h3>

                <div className="mb-6 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="font-bold text-green-900 mb-2">📍 {currentPasture.name}</div>
                  <div className="text-green-700 text-sm space-y-1">
                    <div>{currentPasture.area} ha • {currentPasture.grassType}</div>
                    <div>Capacidad: {currentPasture.capacity} cabezas</div>
                  </div>
                </div>
                
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="font-bold text-blue-900 mb-3">🛰️ GPS obtenido:</div>
                  <div className="text-blue-700 text-sm space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong>Lat:</strong></div>
                      <div className="font-mono">{userLocation.latitude.toFixed(6)}</div>
                      <div><strong>Lng:</strong></div>
                      <div className="font-mono">{userLocation.longitude.toFixed(6)}</div>
                      <div><strong>Precisión:</strong></div>
                      <div className="font-bold">±{userLocation.accuracy.toFixed(1)}m</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      Estado del Cercado
                    </label>
                    <select
                      value={locationForm.fencing}
                      onChange={(e) => setLocationForm(prev => ({ 
                        ...prev, 
                        fencing: e.target.value as typeof prev.fencing 
                      }))}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent transition-all"
                      disabled={isSubmitting}
                    >
                      <option value="excellent">🟢 Excelente</option>
                      <option value="good">🔵 Bueno</option>
                      <option value="needs_repair">🟡 Necesita reparación</option>
                      <option value="poor">🔴 Malo</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 text-sm font-bold text-gray-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={locationForm.waterSource}
                        onChange={(e) => setLocationForm(prev => ({ 
                          ...prev, 
                          waterSource: e.target.checked 
                        }))}
                        className="w-5 h-5 text-[#519a7c] focus:ring-[#519a7c] border-2 border-gray-300 rounded"
                        disabled={isSubmitting}
                      />
                      💧 Tiene fuente de agua
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Observaciones
                    </label>
                    <textarea
                      value={locationForm.notes}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Condiciones especiales, accesos..."
                      rows={3}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent resize-none transition-all"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setShowLocationDialog(false)}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={registerPastureLocation}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#519a7c] to-[#457e68] text-white rounded-xl hover:from-[#457e68] hover:to-[#3d6b58] transition-all flex items-center justify-center gap-3 disabled:opacity-50 font-bold"
                  >
                    {isSubmitting ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {isSubmitting ? "Registrando..." : "Registrar"}
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
              className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-6 min-w-[400px] max-w-[450px] max-h-[calc(100vh-2rem)] overflow-y-auto border border-gray-200"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-bold text-[#2d5a45] flex items-center gap-3">
                  <Info className="w-6 h-6" />
                  Información Detallada
                </h3>
                <button
                  onClick={() => setSelectedPin(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                {/* Info de la pastura */}
                <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2 text-lg">
                    🌱 {selectedPin.geofence.name}
                    {selectedPin.geofence.id && (
                      <span className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full font-medium">
                        ID: {selectedPin.geofence.id.substring(0, 8)}...
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm text-green-800">
                    <div><strong>Área:</strong> {selectedPin.geofence.area?.toFixed(1)} ha</div>
                    <div><strong>Pasto:</strong> {selectedPin.geofence.grassType}</div>
                    <div><strong>Capacidad:</strong> {selectedPin.geofence.capacity} cabezas</div>
                    <div><strong>Estado:</strong> 
                      <span className={cn(
                        "ml-1 px-2 py-1 rounded-full text-xs font-bold capitalize",
                        selectedPin.geofence.status === 'excellent' ? "bg-green-200 text-green-800" :
                        selectedPin.geofence.status === 'good' ? "bg-blue-200 text-blue-800" :
                        selectedPin.geofence.status === 'fair' ? "bg-yellow-200 text-yellow-800" :
                        "bg-red-200 text-red-800"
                      )}>
                        {selectedPin.geofence.status}
                      </span>
                    </div>
                    {selectedPin.geofence.soilCondition && (
                      <div className="col-span-2">
                        <strong>Suelo:</strong> 
                        <span className="ml-1 capitalize">{selectedPin.geofence.soilCondition}</span>
                      </div>
                    )}
                  </div>
                  {selectedPin.geofence.notes && (
                    <div className="mt-3 text-sm text-green-700 p-3 bg-green-100 rounded-lg border border-green-200">
                      <strong className="block mb-1">Notas:</strong>
                      <em>"{selectedPin.geofence.notes}"</em>
                    </div>
                  )}
                </div>

                {/* Info de ubicación */}
                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    📍 Registro GPS
                  </h4>
                  <div className="space-y-3 text-sm text-blue-800">
                    <div className="grid grid-cols-2 gap-3">
                      <div><strong>Fecha:</strong></div>
                      <div>{selectedPin.timestamp.toLocaleDateString()}</div>
                      <div><strong>Hora:</strong></div>
                      <div>{selectedPin.timestamp.toLocaleTimeString()}</div>
                      <div><strong>Cercado:</strong></div>
                      <div className="capitalize font-medium">{selectedPin.fencing}</div>
                      <div><strong>Agua:</strong></div>
                      <div className={cn(
                        "font-bold",
                        selectedPin.waterSource ? "text-cyan-700" : "text-gray-600"
                      )}>
                        {selectedPin.waterSource ? "✅ Disponible" : "❌ No disponible"}
                      </div>
                    </div>
                    <div className="border-t border-blue-300 pt-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><strong>Coordenadas:</strong></div>
                        <div className="font-mono text-xs">
                          {selectedPin.latitude.toFixed(6)}, {selectedPin.longitude.toFixed(6)}
                        </div>
                        <div><strong>Precisión:</strong></div>
                        <div className="font-bold">±{selectedPin.accuracy}m</div>
                      </div>
                    </div>
                    {selectedPin.notes && (
                      <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
                        <strong className="block mb-1">Observaciones:</strong>
                        <em>"{selectedPin.notes}"</em>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info de sincronización */}
                <div className="p-5 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200">
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    🌐 Estado de Sincronización
                  </h4>
                  <div className="space-y-2 text-sm text-purple-800">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-green-600" />
                      <span className="font-medium">Sincronizado con backend</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><strong>API:</strong></div>
                      <div className="font-mono">/maps/geofences</div>
                      <div><strong>Puerto:</strong></div>
                      <div className="font-mono">5000</div>
                      {selectedPin.geofence.createdAt && (
                        <>
                          <div><strong>Creado:</strong></div>
                          <div>{new Date(selectedPin.geofence.createdAt).toLocaleString()}</div>
                        </>
                      )}
                      {selectedPin.geofence.updatedAt && (
                        <>
                          <div><strong>Actualizado:</strong></div>
                          <div>{new Date(selectedPin.geofence.updatedAt).toLocaleString()}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3">
                  <button 
                    onClick={() => removePin(selectedPin.id)}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 text-red-600 border-2 border-red-300 rounded-xl hover:bg-red-50 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 font-medium"
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
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all text-sm font-medium"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Banner de error de conexión */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white p-4 text-center z-40 shadow-lg"
          >
            <div className="flex items-center justify-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              <span className="font-bold">
                ⚠️ Sin conexión al backend (/api/maps/geofences) - Puerto 5000
              </span>
              <button
                onClick={handleRefresh}
                className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-bold transition-colors shadow-md"
              >
                Reintentar
              </button>
            </div>
          </motion.div>
        )}

        {/* Contenedor del mapa */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="w-full h-full"
        >
          <PastureSimulatedMap
            pasturePins={filteredPins}
            userLocation={userLocation}
            onPinClick={handlePinClick}
            backendHealth={backendHealth}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default PastureMap;