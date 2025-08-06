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
  Edit,
  CheckCircle,
  Clock,
  Database,
  Activity,
  Settings,
  MapPin
} from "lucide-react";

// Declaración global para Leaflet
declare global {
  interface Window {
    L: any;
  }
}

// ======================================================================
// CONFIGURACIÓN DE LA API - CONECTA AL BACKEND EN PUERTO 5000
// ======================================================================

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 15000, // 15 segundos timeout
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo entre reintentos
};

// ======================================================================
// INTERFACES MEJORADAS PARA EL BACKEND
// ======================================================================

interface PastureData {
  id?: string;
  name: string;
  area: number; // en hectáreas
  grassType: string;
  capacity: number; // número de cabezas de ganado
  status: "excellent" | "good" | "fair" | "poor";
  lastGrazed?: Date;
  soilCondition?: "excellent" | "good" | "fair" | "poor";
  notes?: string;
  // Campos del backend
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: Date;
  };
  coordinates?: Array<{
    latitude: number;
    longitude: number;
  }>;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  ranchId?: string;
  // Campos específicos del sistema de mapas
  description?: string;
  type?: string;
  alertsEnabled?: boolean;
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

interface BackendHealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  database: 'connected' | 'disconnected';
  timestamp: string;
  version: string;
  services: {
    api: boolean;
    database: boolean;
    geolocation: boolean;
  };
}

interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp?: string;
  requestId?: string;
}

interface PastureMapProps {
  className?: string;
}

// ======================================================================
// CLASE MEJORADA PARA MANEJAR LA API DEL BACKEND
// ======================================================================

class PasturesAPI {
  // Función utilitaria para hacer peticiones HTTP con reintentos
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
      console.log(`🔄 Realizando petición: ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, defaultOptions);
      clearTimeout(timeout);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log(`✅ Petición exitosa: ${response.status}`);
      return response;
      
    } catch (error) {
      clearTimeout(timeout);
      
      if (retries > 0 && !(error instanceof Error && error.name === 'AbortError')) {
        console.log(`⚠️ Reintentando petición... Intentos restantes: ${retries - 1}`);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      console.error(`❌ Error en petición después de ${API_CONFIG.RETRY_ATTEMPTS} intentos:`, error);
      throw error;
    }
  }

  // ======================================================================
  // VERIFICACIÓN DE ESTADO DEL BACKEND
  // ======================================================================
  
  static async checkBackendHealth(): Promise<BackendHealthStatus> {
    try {
      const response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/health`);
      const data: APIResponse<BackendHealthStatus> = await response.json();
      
      if (data.success && data.data) {
        console.log('🟢 Backend estado: SALUDABLE');
        return data.data;
      } else {
        throw new Error('Respuesta de salud inválida');
      }
    } catch (error) {
      console.error('🔴 Backend estado: NO DISPONIBLE');
      // Retornar estado por defecto cuando el backend no está disponible
      return {
        status: 'down',
        uptime: 0,
        database: 'disconnected',
        timestamp: new Date().toISOString(),
        version: 'unknown',
        services: {
          api: false,
          database: false,
          geolocation: false,
        }
      };
    }
  }

  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 Probando conectividad con el backend...');
      const response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/ping`, {
        method: 'GET'
      });
      
      const data: APIResponse = await response.json();
      const isHealthy = data.success && data.message === 'pong';
      
      console.log(isHealthy ? '✅ Conectividad: EXITOSA' : '⚠️ Conectividad: DEGRADADA');
      return isHealthy;
      
    } catch (error) {
      console.error('❌ Conectividad: FALLIDA', error);
      return false;
    }
  }

  // ======================================================================
  // OPERACIONES DE PASTURAS MEJORADAS
  // ======================================================================
  
  static async getAllPastures(): Promise<PastureData[]> {
    try {
      console.log('📥 Cargando pasturas desde el backend...');
      
      // Primero intentar endpoint específico de pasturas
      let response: Response;
      try {
        response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/pastures`);
      } catch (error) {
        console.log('⚠️ Endpoint /pastures no disponible, intentando con /maps/geofence-areas');
        // Fallback a geofence areas
        response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/maps/geofence-areas`);
      }

      const data: APIResponse<PastureData[]> = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        const pasturesData = data.data;
        console.log(`✅ ${pasturesData.length} pasturas cargadas exitosamente`);
        
        // Adaptar datos del backend a nuestra interfaz
        return pasturesData.map((item: any) => ({
          id: item.id,
          name: item.name || 'Pastura sin nombre',
          area: parseFloat(item.area) || 0,
          grassType: item.grassType || 'No especificado',
          capacity: parseInt(item.capacity) || 0,
          status: item.status || 'good',
          soilCondition: item.soilCondition || 'good',
          notes: item.notes || item.description,
          location: item.location || (item.center ? {
            latitude: parseFloat(item.center.latitude),
            longitude: parseFloat(item.center.longitude),
            accuracy: 10,
            timestamp: item.updatedAt ? new Date(item.updatedAt) : new Date()
          } : null),
          coordinates: Array.isArray(item.coordinates) ? item.coordinates : [],
          isActive: item.isActive !== false,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          ranchId: item.ranchId,
          description: item.description,
          type: item.type,
          alertsEnabled: item.alertsEnabled
        }));
      } else {
        throw new Error(data.message || 'Respuesta del servidor inválida');
      }
    } catch (error: any) {
      console.error('❌ Error cargando pasturas:', error);
      
      // Mejorar el mensaje de error basado en el tipo de error
      if (error.name === 'AbortError') {
        throw new Error('Tiempo de espera agotado. Verifique su conexión a internet.');
      } else if (error.message.includes('fetch')) {
        throw new Error('No se puede conectar con el servidor. Verifique que el backend esté ejecutándose en el puerto 5000.');
      } else {
        throw new Error(error.message || 'Error desconocido al cargar pasturas');
      }
    }
  }

  static async createPasture(pastureData: Omit<PastureData, 'id' | 'createdAt' | 'updatedAt'>): Promise<PastureData> {
    try {
      console.log('📤 Creando nueva pastura...', pastureData.name);
      
      const payload = {
        ...pastureData,
        type: 'PASTURE',
        isActive: true,
        alertsEnabled: true,
        center: pastureData.location ? {
          latitude: pastureData.location.latitude,
          longitude: pastureData.location.longitude
        } : null,
      };

      let response: Response;
      try {
        response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/pastures`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.log('⚠️ Endpoint /pastures no disponible, usando /maps/geofence-areas');
        // Fallback a geofence areas con estructura específica
        response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/maps/geofence-areas`, {
          method: 'POST',
          body: JSON.stringify({
            name: pastureData.name,
            description: pastureData.notes || `Pastura de ${pastureData.area} ha con pasto ${pastureData.grassType}`,
            type: 'PASTURE',
            center: payload.center,
            coordinates: pastureData.coordinates || [],
            isActive: true,
            alertsEnabled: true,
            area: pastureData.area,
            grassType: pastureData.grassType,
            capacity: pastureData.capacity,
            status: pastureData.status,
            soilCondition: pastureData.soilCondition
          }),
        });
      }

      const data: APIResponse<PastureData> = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ Pastura creada exitosamente:', data.data.id);
        return {
          ...pastureData,
          id: data.data.id,
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt
        };
      } else {
        throw new Error(data.message || 'Error al crear la pastura');
      }
    } catch (error: any) {
      console.error('❌ Error creando pastura:', error);
      throw new Error(error.message || 'Error al crear pastura');
    }
  }

  static async updatePasture(id: string, pastureData: Partial<PastureData>): Promise<PastureData> {
    try {
      console.log('📝 Actualizando pastura:', id);
      
      let response: Response;
      try {
        response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/pastures/${id}`, {
          method: 'PUT',
          body: JSON.stringify(pastureData),
        });
      } catch (error) {
        console.log('⚠️ Usando endpoint de geofence-areas para actualizar');
        response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/maps/geofence-areas/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            name: pastureData.name,
            description: pastureData.notes,
            area: pastureData.area,
            grassType: pastureData.grassType,
            capacity: pastureData.capacity,
            status: pastureData.status,
            soilCondition: pastureData.soilCondition,
            center: pastureData.location ? {
              latitude: pastureData.location.latitude,
              longitude: pastureData.location.longitude
            } : undefined
          }),
        });
      }

      const data: APIResponse<PastureData> = await response.json();
      
      if (data.success && data.data) {
        console.log('✅ Pastura actualizada exitosamente');
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar la pastura');
      }
    } catch (error: any) {
      console.error('❌ Error actualizando pastura:', error);
      throw new Error(error.message || 'Error al actualizar pastura');
    }
  }

  static async deletePasture(id: string): Promise<void> {
    try {
      console.log('🗑️ Eliminando pastura:', id);
      
      let response: Response;
      try {
        response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/pastures/${id}`, {
          method: 'DELETE',
        });
      } catch (error) {
        console.log('⚠️ Usando endpoint de geofence-areas para eliminar');
        response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/maps/geofence-areas/${id}`, {
          method: 'DELETE',
        });
      }

      const data: APIResponse = await response.json();
      
      if (data.success) {
        console.log('✅ Pastura eliminada exitosamente');
      } else {
        throw new Error(data.message || 'Error al eliminar la pastura');
      }
    } catch (error: any) {
      console.error('❌ Error eliminando pastura:', error);
      throw new Error(error.message || 'Error al eliminar pastura');
    }
  }

  // ======================================================================
  // NUEVAS FUNCIONES PARA MEJOR INTEGRACIÓN
  // ======================================================================

  static async getServerInfo(): Promise<any> {
    try {
      const response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/info`);
      const data: APIResponse = await response.json();
      return data.data || {};
    } catch (error) {
      console.error('Error obteniendo información del servidor:', error);
      return null;
    }
  }

  static async getSystemTime(): Promise<Date> {
    try {
      const response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/time`);
      const data: APIResponse = await response.json();
      return new Date(data.data?.timestamp || Date.now());
    } catch (error) {
      console.error('Error obteniendo tiempo del servidor:', error);
      return new Date();
    }
  }

  static async testEcho(payload: any): Promise<any> {
    try {
      const response = await this.fetchWithRetry(`${API_CONFIG.BASE_URL}/echo`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data: APIResponse = await response.json();
      return data.echo || {};
    } catch (error) {
      console.error('Error en test echo:', error);
      return null;
    }
  }
}

// ======================================================================
// FUNCIÓN UTILITARIA PARA CONCATENAR CLASES CSS
// ======================================================================

const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(" ");
};

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "excellent": return "Excelente";
      case "good": return "Bueno";
      case "fair": return "Regular";
      case "poor": return "Pobre";
      default: return "Desconocido";
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
      {/* Fondo del mapa simulado */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.03'%3E%3Cpath d='M11 18c3.866 0 7-3.133 7-7s-3.134-7-7-7-7 3.133-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.133 7-7s-3.134-7-7-7-7 3.133-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Header del mapa mejorado */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm rounded-lg px-6 py-3 shadow-lg pointer-events-none border border-green-200">
        <div className="flex items-center gap-3">
          <MapPin className="w-6 h-6 text-[#519a7c]" />
          <div className="text-center">
            <div className="font-bold text-[#2d5a45] text-lg">
              Sistema de Gestión de Pasturas
            </div>
            <div className="text-sm text-[#519a7c] flex items-center gap-2 justify-center">
              <Server className="w-4 h-4" />
              <span>Puerto 5000</span>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{pasturePins.length} pasturas registradas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Estado del backend */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md pointer-events-none">
        <div className="flex items-center gap-2 text-sm">
          <Activity className="w-4 h-4" />
          <span className={cn("font-medium", getHealthStatusColor(backendHealth?.status))}>
            Backend: {backendHealth?.status === 'healthy' ? 'Saludable' : 
                     backendHealth?.status === 'degraded' ? 'Degradado' : 
                     backendHealth?.status === 'down' ? 'Desconectado' : 'Verificando...'}
          </span>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <Database className="w-3 h-3" />
            <span>DB: {backendHealth?.database === 'connected' ? 'OK' : 'ERROR'}</span>
          </div>
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
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-xl border-4 border-white">
              <Crosshair className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg">
              Tu ubicación GPS
            </div>
            {/* Círculo de precisión */}
            <div className="absolute inset-0 border-2 border-blue-300 rounded-full animate-ping"></div>
          </div>
        </motion.div>
      )}

      {/* Renderizado de pins de pastura mejorado */}
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
              {/* Pin principal mejorado */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-4 border-white relative hover:animate-pulse"
                style={{ backgroundColor: getStatusColor(pin.pasture.status) }}
              >
                <Leaf className="w-7 h-7 text-white font-bold" />
                
                {/* Badge con ID de la pastura */}
                <div className="absolute -top-3 -right-3 bg-white text-xs font-bold text-gray-700 rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-gray-200">
                  {index + 1}
                </div>

                {/* Indicador de fuente de agua mejorado */}
                {pin.waterSource && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-500 rounded-full border-3 border-white flex items-center justify-center shadow-lg">
                    <div className="text-white text-xs font-bold">💧</div>
                  </div>
                )}
              </div>

              {/* Etiqueta con nombre mejorada */}
              <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 bg-black/90 text-white px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap shadow-xl border border-gray-600">
                {pin.pasture.name}
                <div className="text-xs text-gray-300">{pin.pasture.area} ha</div>
              </div>

              {/* Tooltip detallado mejorado */}
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 -translate-y-full bg-black/95 text-white text-sm rounded-xl px-5 py-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-40 shadow-2xl max-w-xs">
                <div className="space-y-3">
                  <div className="font-bold text-yellow-300 text-base border-b border-gray-600 pb-2">
                    🌱 {pin.pasture.name}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-blue-300">Área:</span> {pin.pasture.area} ha</div>
                    <div><span className="text-green-300">Pasto:</span> {pin.pasture.grassType}</div>
                    <div><span className="text-purple-300">Capacidad:</span> {pin.pasture.capacity} cabezas</div>
                    <div><span className="text-orange-300">Estado:</span> {getStatusLabel(pin.pasture.status)}</div>
                  </div>
                  <div className="border-t border-gray-600 pt-2 space-y-1">
                    <div className="text-cyan-300 text-xs">📍 GPS: ±{pin.accuracy}m</div>
                    <div className="text-green-300 text-xs">🕐 {pin.timestamp.toLocaleTimeString()}</div>
                    {pin.waterSource && <div className="text-cyan-300 text-xs">💧 Con fuente de agua</div>}
                  </div>
                  {pin.pasture.id && (
                    <div className="border-t border-gray-600 pt-2">
                      <div className="text-gray-400 text-xs">🆔 ID: {pin.pasture.id}</div>
                      <div className="text-green-400 text-xs">🌐 Sincronizado con Backend</div>
                    </div>
                  )}
                  {pin.notes && (
                    <div className="border-t border-gray-600 pt-2">
                      <div className="text-yellow-300 text-xs">📝 "{pin.notes}"</div>
                    </div>
                  )}
                </div>
                {/* Flecha del tooltip */}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-6 border-transparent border-t-black/95"></div>
              </div>
            </div>
          </motion.div>
        );
      })}

      {/* Mensaje si no hay pins - mejorado */}
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
                ¡Sistema de Gestión de Pasturas Listo!
              </h3>
              <p className="text-lg mb-3 text-gray-700">
                Conectado exitosamente al backend
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Las pasturas registradas aparecerán automáticamente en el mapa
              </p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-center gap-2 text-blue-600">
                <Server className="w-4 h-4" />
                <span>Backend: Puerto 5000</span>
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-center gap-2 text-green-600">
                <Database className="w-4 h-4" />
                <span>Base de datos: {backendHealth?.database === 'connected' ? 'Conectada' : 'Desconectada'}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-purple-600">
                <Activity className="w-4 h-4" />
                <span>Sistema: {backendHealth?.status === 'healthy' ? 'Saludable' : 'En revisión'}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Contador de pins en tiempo real - mejorado */}
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

      {/* Leyenda del mapa mejorada */}
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

      {/* Indicador de conexión backend mejorado */}
      <div className="absolute bottom-4 left-4 bg-green-50 border-2 border-green-200 rounded-xl px-4 py-3 pointer-events-none shadow-lg">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <Server className="w-4 h-4 text-green-700" />
            <span className="text-green-800 font-semibold">Backend Activo</span>
          </div>
          <div className="h-4 w-px bg-green-300"></div>
          <div className="text-green-700 text-xs">
            <div>Puerto: 5000</div>
            <div>Estado: {backendHealth?.status || 'verificando'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ======================================================================
// COMPONENTE PRINCIPAL MEJORADO
// ======================================================================

export const PastureMap: React.FC<PastureMapProps> = ({ className }) => {
  // Estados principales
  const [allPastures, setAllPastures] = useState<PastureData[]>([]);
  const [pasturePins, setPasturePins] = useState<PastureLocationPin[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [selectedPin, setSelectedPin] = useState<PastureLocationPin | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLeafletLoaded, setIsLeafletLoaded] = useState(false);
  
  // Estados para el backend mejorados
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [backendHealth, setBackendHealth] = useState<BackendHealthStatus | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverInfo, setServerInfo] = useState<any>(null);
  
  // Estados para agregar pastura
  const [showAddPastureDialog, setShowAddPastureDialog] = useState(false);
  const [pastureForm, setPastureForm] = useState<PastureData>({
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

  // ======================================================================
  // FUNCIONES MEJORADAS PARA EL BACKEND
  // ======================================================================

  const checkBackendConnection = useCallback(async () => {
    try {
      console.log('🔄 Verificando estado del backend...');
      setBackendError(null);
      
      // Verificar conectividad básica
      const isConnected = await PasturesAPI.testConnection();
      setIsConnected(isConnected);
      
      if (isConnected) {
        // Obtener estado de salud del backend
        const health = await PasturesAPI.checkBackendHealth();
        setBackendHealth(health);
        
        // Obtener información del servidor
        const info = await PasturesAPI.getServerInfo();
        setServerInfo(info);
        
        console.log('✅ Backend conectado y saludable');
      } else {
        setBackendError("No se puede conectar con el servidor en puerto 5000");
        setBackendHealth({
          status: 'down',
          uptime: 0,
          database: 'disconnected',
          timestamp: new Date().toISOString(),
          version: 'unknown',
          services: { api: false, database: false, geolocation: false }
        });
      }
      
      return isConnected;
    } catch (error: any) {
      console.error('❌ Error verificando backend:', error);
      setIsConnected(false);
      setBackendError(error.message || "Error de conexión con el backend");
      return false;
    }
  }, []);

  const loadPasturesFromBackend = useCallback(async () => {
    try {
      setIsLoading(true);
      setBackendError(null);
      
      console.log("🔄 Iniciando carga de pasturas desde el backend...");
      
      // Verificar conexión primero
      const connectionOk = await checkBackendConnection();
      if (!connectionOk) {
        return;
      }

      const pastures = await PasturesAPI.getAllPastures();
      
      console.log(`✅ ${pastures.length} pasturas cargadas exitosamente`);
      setAllPastures(pastures);
      
      // Convertir pasturas con ubicación a pins
      const pins: PastureLocationPin[] = pastures
        .filter(pasture => pasture.location?.latitude && pasture.location?.longitude)
        .map(pasture => ({
          id: `pin-${pasture.id}`,
          pasture: pasture,
          latitude: pasture.location!.latitude,
          longitude: pasture.location!.longitude,
          accuracy: pasture.location!.accuracy || 10,
          timestamp: pasture.location!.timestamp ? new Date(pasture.location.timestamp) : new Date(),
          waterSource: false, // Valor por defecto
          fencing: "good", // Valor por defecto
          notes: pasture.notes,
          addedBy: "gps"
        }));
      
      console.log(`📍 ${pins.length} pins generados para el mapa`);
      setPasturePins(pins);
      
    } catch (error: any) {
      console.error("❌ Error cargando pasturas:", error);
      setBackendError(error.message || "Error conectando con el servidor");
      setIsConnected(false);
      
    } finally {
      setIsLoading(false);
    }
  }, [checkBackendConnection]);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadPasturesFromBackend();
    
    // Configurar verificación periódica del estado del backend cada 30 segundos
    const healthCheckInterval = setInterval(checkBackendConnection, 30000);
    
    return () => clearInterval(healthCheckInterval);
  }, [loadPasturesFromBackend, checkBackendConnection]);

  // Función para validar formulario mejorada
  const validatePastureForm = (data: PastureData): string[] => {
    const errors: string[] = [];
    
    if (!data.name?.trim()) {
      errors.push("El nombre es obligatorio");
    } else if (data.name.trim().length < 3) {
      errors.push("El nombre debe tener al menos 3 caracteres");
    } else if (data.name.trim().length > 50) {
      errors.push("El nombre no puede exceder 50 caracteres");
    }
    
    if (!data.grassType?.trim()) {
      errors.push("El tipo de pasto es obligatorio");
    }
    
    if (!data.area || data.area <= 0) {
      errors.push("El área debe ser mayor a 0");
    } else if (data.area > 1000) {
      errors.push("El área parece muy grande (máximo 1000 ha)");
    }
    
    if (!data.capacity || data.capacity <= 0) {
      errors.push("La capacidad debe ser mayor a 0");
    } else if (data.capacity > 10000) {
      errors.push("La capacidad parece muy alta (máximo 10,000 cabezas)");
    }
    
    return errors;
  };

  // Función mejorada para agregar nueva pastura
  const handleAddPasture = async () => {
    const errors = validatePastureForm(pastureForm);
    if (errors.length > 0) {
      alert("❌ Errores en el formulario:\n\n" + errors.join("\n"));
      return;
    }

    try {
      setIsSubmitting(true);
      setBackendError(null);

      console.log("📤 Iniciando creación de nueva pastura...");
      
      // Verificar conexión antes de proceder
      const connectionOk = await checkBackendConnection();
      if (!connectionOk) {
        throw new Error("No hay conexión con el backend");
      }
      
      const pastureData: Omit<PastureData, 'id' | 'createdAt' | 'updatedAt'> = {
        name: pastureForm.name.trim(),
        area: pastureForm.area,
        grassType: pastureForm.grassType.trim(),
        capacity: pastureForm.capacity,
        status: pastureForm.status,
        soilCondition: pastureForm.soilCondition,
        notes: pastureForm.notes?.trim() || undefined,
      };

      const newPasture = await PasturesAPI.createPasture(pastureData);
      
      console.log("✅ Pastura creada exitosamente:", newPasture.id);
      
      // Actualizar la lista local
      setAllPastures(prev => [...prev, newPasture]);
      setCurrentPasture(newPasture);
      setShowAddPastureDialog(false);
      
      // Limpiar formulario
      setPastureForm({
        name: "",
        area: 0,
        grassType: "",
        capacity: 0,
        status: "excellent",
        soilCondition: "good",
        notes: "",
      });

      // Mostrar mensaje de éxito y proceder a obtener ubicación
      setSuccessMessage(`¡Pastura "${newPasture.name}" creada exitosamente! Ahora obteniendo ubicación GPS...`);
      setTimeout(() => setSuccessMessage(null), 5000);
      
      // Proceder a obtener ubicación
      getCurrentLocation();
      
    } catch (error: any) {
      console.error("❌ Error creando pastura:", error);
      setBackendError(error.message || "Error al crear la pastura");
      alert("❌ Error al crear la pastura:\n\n" + (error.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función mejorada para obtener ubicación
  const getCurrentLocation = useCallback(async () => {
    setIsGettingLocation(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError("La geolocalización no está soportada en este navegador");
      setIsGettingLocation(false);
      return;
    }

    // Verificar permisos
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'denied') {
        setLocationError("Permiso de ubicación denegado. Por favor, habilita la ubicación en tu navegador y recarga la página.");
        setIsGettingLocation(false);
        return;
      }
    } catch (error) {
      console.log('⚠️ No se pudo verificar permisos de geolocalización');
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000 // Cache por 1 minuto
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
        };

        console.log("📍 Ubicación GPS obtenida:", {
          lat: location.latitude.toFixed(6),
          lng: location.longitude.toFixed(6),
          accuracy: `±${location.accuracy.toFixed(1)}m`
        });
        
        setUserLocation(location);
        setShowLocationDialog(true);
        setIsGettingLocation(false);
        setLocationError(null);
      },
      (error) => {
        let errorMessage = "Error obteniendo ubicación GPS";
        
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
            errorMessage = `Error desconocido obteniendo ubicación (código: ${error.code}). Mensaje: ${error.message}`;
        }
        
        console.error("❌ Error de geolocalización:", errorMessage);
        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      options
    );
  }, []);

  // Función mejorada para registrar ubicación
  const registerPastureLocation = async () => {
    if (!currentPasture || !userLocation) return;

    try {
      setIsSubmitting(true);
      setBackendError(null);

      console.log("📤 Registrando ubicación GPS en el backend...");
      
      // Verificar conexión
      const connectionOk = await checkBackendConnection();
      if (!connectionOk) {
        throw new Error("No hay conexión con el backend");
      }

      // Actualizar pastura con ubicación
      const updatedPasture = await PasturesAPI.updatePasture(currentPasture.id!, {
        ...currentPasture,
        location: {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          accuracy: userLocation.accuracy,
          timestamp: new Date()
        },
        notes: locationForm.notes.trim() || currentPasture.notes
      });
      
      console.log("✅ Ubicación GPS registrada exitosamente");

      // Actualizar pastura en la lista local
      setAllPastures(prev => prev.map(pasture => 
        pasture.id === currentPasture.id ? updatedPasture : pasture
      ));

      // Crear pin para el mapa
      const newPin: PastureLocationPin = {
        id: `pin-${currentPasture.id}`,
        pasture: updatedPasture,
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
        const filtered = prev.filter(p => p.pasture.id !== currentPasture.id);
        return [...filtered, newPin];
      });
      
      // Limpiar estados
      setLocationForm({ waterSource: false, fencing: "good", notes: "" });
      setCurrentPasture(null);
      setUserLocation(null);
      setShowLocationDialog(false);

      // Mostrar mensaje de éxito
      setSuccessMessage(`🎉 ¡Pastura "${updatedPasture.name}" registrada exitosamente en el mapa con precisión GPS de ±${userLocation.accuracy.toFixed(1)}m!`);
      setTimeout(() => setSuccessMessage(null), 7000);
      
      console.log("🎉 REGISTRO COMPLETADO EXITOSAMENTE");
      
    } catch (error: any) {
      console.error("❌ Error registrando ubicación:", error);
      setBackendError(error.message || "Error al registrar ubicación");
      alert("❌ Error al registrar ubicación GPS:\n\n" + (error.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función mejorada para eliminar pastura
  const removePin = async (pinId: string) => {
    const pin = pasturePins.find(p => p.id === pinId);
    if (!pin || !pin.pasture.id) return;

    const confirmMessage = `¿Estás seguro de que deseas eliminar la pastura "${pin.pasture.name}"?\n\n` +
      `Esta acción eliminará:\n` +
      `• Registro de la pastura\n` +
      `• Ubicación GPS asociada\n` +
      `• Toda la información relacionada\n\n` +
      `Esta acción NO se puede deshacer.`;

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setIsSubmitting(true);
      setBackendError(null);

      console.log("🗑️ Eliminando pastura del backend:", pin.pasture.id);
      
      // Verificar conexión
      const connectionOk = await checkBackendConnection();
      if (!connectionOk) {
        throw new Error("No hay conexión con el backend");
      }
      
      await PasturesAPI.deletePasture(pin.pasture.id);
      
      console.log("✅ Pastura eliminada exitosamente del backend");

      // Actualizar listas locales
      setAllPastures(prev => prev.filter(p => p.id !== pin.pasture.id));
      setPasturePins(prev => prev.filter(p => p.id !== pinId));
      
      if (selectedPin?.id === pinId) {
        setSelectedPin(null);
      }
      
      setSuccessMessage(`✅ Pastura "${pin.pasture.name}" eliminada exitosamente del sistema`);
      setTimeout(() => setSuccessMessage(null), 4000);
      
    } catch (error: any) {
      console.error("❌ Error eliminando pastura:", error);
      setBackendError(error.message || "Error al eliminar pastura");
      alert("❌ Error al eliminar pastura:\n\n" + (error.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para manejar clic en pin
  const handlePinClick = useCallback((pin: PastureLocationPin) => {
    setSelectedPin(pin);
    console.log("📌 Pin seleccionado:", pin.pasture.name);
  }, []);

  // Función mejorada para recargar datos
  const handleRefresh = async () => {
    console.log("🔄 Recargando datos del sistema...");
    setSuccessMessage("🔄 Recargando datos del backend...");
    await loadPasturesFromBackend();
    setTimeout(() => setSuccessMessage(null), 2000);
  };

  // Verificar Leaflet (sin cambios significativos)
  useEffect(() => {
    const checkLeaflet = () => {
      if (typeof window !== "undefined" && window.L) {
        setIsLeafletLoaded(true);
        setTimeout(() => initializeMap(), 500);
      }
    };

    checkLeaflet();

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

  // Inicializar mapa de Leaflet (sin cambios significativos)
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
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof window.L.Marker) {
          mapInstance.current.removeLayer(layer);
        }
      });
      
      pasturePins.forEach((pin) => addPinToMap(mapInstance.current, pin));
    }
  }, [pasturePins, isLeafletLoaded]);

  // Agregar pin a Leaflet (con mejoras menores)
  const addPinToMap = useCallback((map: any, pin: PastureLocationPin) => {
    if (!map || !window.L) return;

    try {
      const marker = window.L.marker([pin.latitude, pin.longitude]).addTo(map);

      marker.bindPopup(`
        <div style="padding: 18px; min-width: 300px; font-family: Arial, sans-serif;">
          <h3 style="margin: 0 0 12px 0; color: #2d5a45; font-weight: bold; font-size: 20px;">
            🌱 ${pin.pasture.name}
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0;">
            <div><strong>Área:</strong> ${pin.pasture.area} ha</div>
            <div><strong>Tipo de Pasto:</strong> ${pin.pasture.grassType}</div>
            <div><strong>Capacidad:</strong> ${pin.pasture.capacity} cabezas</div>
            <div><strong>Estado:</strong> <span style="text-transform: capitalize; color: ${pin.pasture.status === 'excellent' ? 'green' : pin.pasture.status === 'good' ? 'blue' : pin.pasture.status === 'fair' ? 'orange' : 'red'};">${pin.pasture.status}</span></div>
            ${pin.pasture.soilCondition ? `<div><strong>Suelo:</strong> <span style="text-transform: capitalize;">${pin.pasture.soilCondition}</span></div>` : ''}
          </div>
          <div style="margin: 12px 0; padding: 12px; background: #f0fdf4; border-radius: 8px; border-left: 4px solid #22c55e;">
            <div style="font-weight: bold; color: #166534; margin-bottom: 6px;">📍 Información de Ubicación:</div>
            <div><strong>Cercado:</strong> ${pin.fencing}</div>
            <div><strong>Fuente de Agua:</strong> <span style="color: ${pin.waterSource ? 'blue' : 'gray'};">${pin.waterSource ? '✅ Disponible' : '❌ No disponible'}</span></div>
            <div><strong>Registrado:</strong> ${pin.timestamp.toLocaleString()}</div>
            <div><strong>Precisión GPS:</strong> ±${pin.accuracy}m</div>
          </div>
          ${pin.notes ? `
            <div style="margin: 12px 0; padding: 12px; background: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <div style="font-weight: bold; color: #92400e; margin-bottom: 6px;">📝 Observaciones:</div>
              <div style="font-style: italic;">"${pin.notes}"</div>
            </div>
          ` : ''}
          <div style="margin-top: 18px; text-align: center; font-size: 11px; color: #666; padding: 8px; background: #f9fafb; border-radius: 6px;">
            <div>🌐 Sincronizado con Backend • ID: ${pin.pasture.id}</div>
            <div style="margin-top: 4px;">Backend: Puerto 5000 • Estado: ${backendHealth?.status || 'verificando'}</div>
          </div>
        </div>
      `);

      marker.on("click", () => handlePinClick(pin));

      if (pasturePins.length <= 1) {
        map.setView([pin.latitude, pin.longitude], 17);
      }

    } catch (error) {
      console.error("❌ Error agregando pin a Leaflet:", error);
    }
  }, [handlePinClick, pasturePins.length, backendHealth]);

  // Filtrar pins según búsqueda
  const filteredPins = pasturePins.filter(
    (pin) =>
      pin.pasture.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.pasture.grassType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pin.pasture.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pin.pasture.id && pin.pasture.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // ======================================================================
  // RENDERIZADO PRINCIPAL
  // ======================================================================

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="text-center bg-white/90 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <RefreshCw className="w-16 h-16 text-green-600 animate-spin" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Conectando con el Backend
          </h2>
          <p className="text-lg text-gray-600 mb-2">
            Puerto 5000 • Cargando datos de pasturas...
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
        {/* Panel de control principal mejorado */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-5 min-w-[350px] max-h-[calc(100vh-2rem)] overflow-y-auto border border-gray-200"
        >
          {/* Header mejorado */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[#2d5a45] flex items-center gap-2">
              <Navigation className="w-6 h-6" />
              Sistema de Pasturas
            </h2>
            <div className="flex items-center gap-2">
              {/* Indicador de conexión mejorado */}
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
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Estado de conexión mejorado */}
          <div className={cn(
            "mb-5 p-4 rounded-xl text-sm border-2",
            isConnected 
              ? "bg-green-50 border-green-200" 
              : "bg-red-50 border-red-200"
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
                    <span>Puerto:</span>
                    <span className="font-mono">5000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pasturas:</span>
                    <span className="font-bold">{allPastures.length} sincronizadas</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GPS:</span>
                    <span className="font-bold">{pasturePins.length} geolocalizadas</span>
                  </div>
                  {backendHealth && (
                    <div className="flex justify-between">
                      <span>Base de datos:</span>
                      <span className={cn(
                        "font-bold",
                        backendHealth.database === 'connected' ? "text-green-700" : "text-red-700"
                      )}>
                        {backendHealth.database === 'connected' ? 'Conectada' : 'Desconectada'}
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div>
                  <div>{backendError || "Verificar que el servidor esté ejecutándose"}</div>
                  <div className="mt-2 text-xs text-gray-500">
                    Asegúrate de que el backend esté corriendo en localhost:5000
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Botones principales mejorados */}
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
              Recargar Datos del Backend
            </button>
          </div>

          {/* Mensajes de error, éxito, etc. - sin cambios significativos pero con mejor styling */}
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
                  <span className="font-bold">Error de Conexión Backend</span>
                </div>
                <p className="text-sm text-red-600 mb-4 leading-relaxed">{backendError}</p>
                <div className="flex gap-2">
                  <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="flex-1 text-sm bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Reintentar conexión
                  </button>
                  <button
                    onClick={checkBackendConnection}
                    disabled={isLoading}
                    className="flex-1 text-sm bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                  >
                    Verificar estado
                  </button>
                </div>
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
                  <span className="font-bold">Error de Geolocalización</span>
                </div>
                <p className="text-sm text-yellow-600 mb-4 leading-relaxed">{locationError}</p>
                <button
                  onClick={getCurrentLocation}
                  className="w-full text-sm bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  Intentar obtener ubicación nuevamente
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
                  <span className="font-bold">¡Operación Exitosa!</span>
                </div>
                <p className="text-sm text-green-600 leading-relaxed">{successMessage}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resto del componente sin cambios significativos en el contenido, solo mejoras visuales... */}
          
          {/* Barra de búsqueda */}
          {pasturePins.length > 0 && (
            <div className="relative mb-5">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, tipo de pasto, estado, ID..."
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

          {/* Lista de pasturas registradas mejorada */}
          {pasturePins.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-[#519a7c]" />
                  Pasturas Geolocalizadas ({filteredPins.length})
                </h3>
                {searchQuery && (
                  <span className="text-xs text-gray-500">
                    Filtrando por: "{searchQuery}"
                  </span>
                )}
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {filteredPins
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((pin) => (
                  <motion.div 
                    key={pin.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-200 group shadow-sm border border-gray-200"
                  >
                    <div className="flex-1 cursor-pointer" onClick={() => handlePinClick(pin)}>
                      <div className="font-bold text-sm flex items-center gap-2 mb-1">
                        <span className="text-[#2d5a45]">{pin.pasture.name}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
                          Backend
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {pin.pasture.area} ha • {pin.pasture.grassType}
                        {pin.pasture.id && <span className="ml-2 text-gray-400">ID: {pin.pasture.id.substring(0, 8)}...</span>}
                      </div>
                      <div className="text-xs space-y-1">
                        <div className="flex items-center gap-4">
                          <span className={cn(
                            "px-2 py-1 rounded-full text-xs font-medium capitalize",
                            pin.pasture.status === 'excellent' ? "bg-green-100 text-green-700" :
                            pin.pasture.status === 'good' ? "bg-blue-100 text-blue-700" :
                            pin.pasture.status === 'fair' ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {pin.pasture.status}
                          </span>
                          <span className="text-gray-600">
                            Cap: {pin.pasture.capacity} cabezas
                          </span>
                        </div>
                        {pin.waterSource && (
                          <div className="flex items-center gap-1 text-cyan-600">
                            <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                            <span>Con fuente de agua</span>
                          </div>
                        )}
                      </div>
                      {pin.notes && (
                        <div className="text-xs text-gray-600 italic mt-2 p-2 bg-white rounded border-l-2 border-yellow-300">
                          "{pin.notes}"
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePinClick(pin)}
                        className="text-[#519a7c] hover:text-[#457e68] p-2 opacity-0 group-hover:opacity-100 transition-all hover:bg-[#519a7c]/10 rounded-lg"
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => removePin(pin.id)}
                        disabled={isSubmitting}
                        className="text-red-500 hover:text-red-700 p-2 ml-1 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-50 hover:bg-red-50 rounded-lg"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Mensaje si no hay pasturas */}
          {allPastures.length === 0 && isConnected && (
            <div className="text-center py-10 text-gray-500">
              <Leaf className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-semibold mb-2">No hay pasturas registradas</h4>
              <p className="text-sm">Haz clic en "Agregar Pastura" para comenzar</p>
            </div>
          )}

          {/* Resumen estadístico mejorado */}
          {isConnected && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-t-2 border-gray-200 pt-5 mt-5"
            >
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Estadísticas del Sistema
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                  <div className="text-blue-700 font-bold">Total Pasturas</div>
                  <div className="text-blue-900 font-black text-lg">{allPastures.length}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
                  <div className="text-green-700 font-bold">Con GPS</div>
                  <div className="text-green-900 font-black text-lg">{pasturePins.length}</div>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-xl border border-yellow-200">
                  <div className="text-yellow-700 font-bold">Área Total</div>
                  <div className="text-yellow-900 font-black text-lg">
                    {allPastures.reduce((total, pasture) => total + pasture.area, 0).toFixed(1)} ha
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl border border-purple-200">
                  <div className="text-purple-700 font-bold">Backend</div>
                  <div className="text-purple-900 font-black text-lg">
                    {isConnected ? "✅ OK" : "❌ ERROR"}
                  </div>
                </div>
              </div>
              
              {/* Información adicional del backend */}
              {backendHealth && (
                <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Estado del sistema:</span>
                      <span className="font-bold capitalize">{backendHealth.status}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Base de datos:</span>
                      <span className="font-bold">{backendHealth.database}</span>
                    </div>
                    {serverInfo && serverInfo.version && (
                      <div className="flex justify-between">
                        <span>Versión API:</span>
                        <span className="font-mono">{serverInfo.version}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Dialogs y resto del componente (sin cambios significativos en lógica, solo mejoras visuales) */}
        
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
                  Registrar Nueva Pastura
                </h3>

                {backendError && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-700">
                    <div className="font-bold mb-2">Error de conexión:</div>
                    <div>{backendError}</div>
                  </div>
                )}
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Nombre de la Pastura *
                    </label>
                    <input
                      type="text"
                      value={pastureForm.name}
                      onChange={(e) => setPastureForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ej: Pastura Norte, Las Flores, Potrero Principal"
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
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
                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent transition-all"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Capacidad (cabezas) *
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
                      value={pastureForm.grassType}
                      onChange={(e) => setPastureForm(prev => ({ ...prev, grassType: e.target.value }))}
                      placeholder="Ej: Estrella, Guinea, Brachiaria, Tanzania"
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent transition-all"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Estado de la pastura
                      </label>
                      <select
                        value={pastureForm.status}
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
                        Condición del Suelo
                      </label>
                      <select
                        value={pastureForm.soilCondition}
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
                      placeholder="Notas sobre la pastura, condiciones especiales, infraestructura..."
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

        {/* Dialog para registrar ubicación mejorado */}
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
                  Registrar Ubicación GPS
                </h3>

                <div className="mb-6 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                  <div className="font-bold text-green-900 mb-2">📍 Pastura: {currentPasture.name}</div>
                  <div className="text-green-700 text-sm space-y-1">
                    <div>{currentPasture.area} ha • {currentPasture.grassType}</div>
                    <div>Capacidad: {currentPasture.capacity} cabezas</div>
                    {currentPasture.id && (
                      <div className="text-xs text-green-600">ID: {currentPasture.id}</div>
                    )}
                  </div>
                </div>
                
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-200">
                  <div className="font-bold text-blue-900 mb-3">🛰️ Ubicación GPS obtenida:</div>
                  <div className="text-blue-700 text-sm space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div><strong>Latitud:</strong></div>
                      <div className="font-mono">{userLocation.latitude.toFixed(6)}</div>
                      <div><strong>Longitud:</strong></div>
                      <div className="font-mono">{userLocation.longitude.toFixed(6)}</div>
                      <div><strong>Precisión:</strong></div>
                      <div className="font-bold">±{userLocation.accuracy.toFixed(1)}m</div>
                      <div><strong>Fecha/Hora:</strong></div>
                      <div>{userLocation.timestamp.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {backendError && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-sm text-red-700">
                    <div className="font-bold mb-2">Error:</div>
                    <div>{backendError}</div>
                  </div>
                )}

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
                      💧 Tiene fuente de agua disponible
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Observaciones adicionales (opcional)
                    </label>
                    <textarea
                      value={locationForm.notes}
                      onChange={(e) => setLocationForm(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Condiciones del pasto, infraestructura, accesos, observaciones especiales..."
                      rows={4}
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
                    {isSubmitting ? "Registrando..." : "Registrar en Mapa"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Panel de información del pin seleccionado mejorado */}
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
                {/* Información de la pastura mejorada */}
                <div className="p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2 text-lg">
                    🌱 {selectedPin.pasture.name}
                    {selectedPin.pasture.id && (
                      <span className="text-xs bg-green-200 text-green-800 px-3 py-1 rounded-full font-medium">
                        ID: {selectedPin.pasture.id.substring(0, 8)}...
                      </span>
                    )}
                  </h4>
                  <div className="grid grid-cols-2 gap-3 text-sm text-green-800">
                    <div><strong>Área:</strong> {selectedPin.pasture.area} ha</div>
                    <div><strong>Tipo de Pasto:</strong> {selectedPin.pasture.grassType}</div>
                    <div><strong>Capacidad:</strong> {selectedPin.pasture.capacity} cabezas</div>
                    <div><strong>Estado:</strong> 
                      <span className={cn(
                        "ml-1 px-2 py-1 rounded-full text-xs font-bold capitalize",
                        selectedPin.pasture.status === 'excellent' ? "bg-green-200 text-green-800" :
                        selectedPin.pasture.status === 'good' ? "bg-blue-200 text-blue-800" :
                        selectedPin.pasture.status === 'fair' ? "bg-yellow-200 text-yellow-800" :
                        "bg-red-200 text-red-800"
                      )}>
                        {selectedPin.pasture.status}
                      </span>
                    </div>
                    {selectedPin.pasture.soilCondition && (
                      <div className="col-span-2">
                        <strong>Condición del suelo:</strong> 
                        <span className="ml-1 capitalize">{selectedPin.pasture.soilCondition}</span>
                      </div>
                    )}
                    {selectedPin.pasture.lastGrazed && (
                      <div className="col-span-2">
                        <strong>Último pastoreo:</strong> {selectedPin.pasture.lastGrazed.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  {selectedPin.pasture.notes && (
                    <div className="mt-3 text-sm text-green-700 p-3 bg-green-100 rounded-lg border border-green-200">
                      <strong className="block mb-1">Notas:</strong>
                      <em>"{selectedPin.pasture.notes}"</em>
                    </div>
                  )}
                </div>

                {/* Información de la ubicación mejorada */}
                <div className="p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    📍 Registro de Ubicación GPS
                  </h4>
                  <div className="space-y-3 text-sm text-blue-800">
                    <div className="grid grid-cols-2 gap-3">
                      <div><strong>Fecha:</strong></div>
                      <div>{selectedPin.timestamp.toLocaleDateString()}</div>
                      <div><strong>Hora:</strong></div>
                      <div>{selectedPin.timestamp.toLocaleTimeString()}</div>
                      <div><strong>Cercado:</strong></div>
                      <div className="capitalize font-medium">{selectedPin.fencing}</div>
                      <div><strong>Fuente de agua:</strong></div>
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
                        <div><strong>Precisión GPS:</strong></div>
                        <div className="font-bold">±{selectedPin.accuracy}m</div>
                      </div>
                    </div>
                    {selectedPin.notes && (
                      <div className="mt-3 p-3 bg-blue-100 rounded-lg border border-blue-200">
                        <strong className="block mb-1">Observaciones del registro:</strong>
                        <em>"{selectedPin.notes}"</em>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información de sincronización mejorada */}
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
                      <div><strong>Puerto:</strong></div>
                      <div className="font-mono">5000</div>
                      <div><strong>Base de datos:</strong></div>
                      <div className={cn(
                        "font-bold",
                        backendHealth?.database === 'connected' ? "text-green-700" : "text-red-700"
                      )}>
                        {backendHealth?.database === 'connected' ? 'Conectada' : 'Desconectada'}
                      </div>
                      {selectedPin.pasture.createdAt && (
                        <>
                          <div><strong>Creado:</strong></div>
                          <div>{new Date(selectedPin.pasture.createdAt).toLocaleString()}</div>
                        </>
                      )}
                      {selectedPin.pasture.updatedAt && (
                        <>
                          <div><strong>Actualizado:</strong></div>
                          <div>{new Date(selectedPin.pasture.updatedAt).toLocaleString()}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botones de acción mejorados */}
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

        {/* Banner de error de conexión mejorado */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-red-600 text-white p-4 text-center z-40 shadow-lg"
          >
            <div className="flex items-center justify-center gap-3">
              <AlertTriangle className="w-6 h-6" />
              <span className="font-bold">
                ⚠️ Sin conexión al backend (Puerto 5000) - Los datos pueden estar desactualizados
              </span>
              <button
                onClick={handleRefresh}
                className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-bold transition-colors shadow-md"
              >
                Reintentar conexión
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
              backendHealth={backendHealth}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default PastureMap;