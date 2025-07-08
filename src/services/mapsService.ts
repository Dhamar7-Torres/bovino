// @ts-ignore - Leaflet se cargará via CDN
declare const L: any;

import { MAP_ENDPOINTS } from "../constants/urls";
import {
  ZOOM_LEVELS,
  MarkerCategory,
  MARKER_COLORS,
  MARKER_ICONS,
} from "../constants/mapDefaults";
import { api } from "./api";

// Tipos locales para el servicio de mapas
interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: string;
  address?: string;
}

interface MarkerData {
  id: string;
  location: Location;
  category: MarkerCategory;
  data?: any;
}

interface GeocodingResult {
  address: string;
  location: Location;
  confidence: number;
}

interface HeatmapPoint {
  latitude: number;
  longitude: number;
  intensity: number;
}

// Servicio principal para manejo de mapas con Leaflet
export class MapsService {
  private static instance: MapsService;
  private mapInstances: Map<string, any> = new Map();
  private markerGroups: Map<string, any> = new Map();
  private currentLocationMarker: any | null = null;

  // Singleton pattern para asegurar una sola instancia
  public static getInstance(): MapsService {
    if (!MapsService.instance) {
      MapsService.instance = new MapsService();
    }
    return MapsService.instance;
  }

  // ============================================================================
  // INICIALIZACIÓN Y CONFIGURACIÓN DE MAPAS
  // ============================================================================

  // Inicializar un nuevo mapa Leaflet
  public initializeMap(
    containerId: string,
    center: Location,
    zoom: number = ZOOM_LEVELS.FARM
  ): any {
    try {
      console.log(`🗺️ Inicializando mapa en contenedor: ${containerId}`);

      // Crear instancia del mapa
      const map = L.map(containerId, {
        center: [center.latitude, center.longitude],
        zoom: zoom,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: true, // Mejor rendimiento para muchos marcadores
      });

      // Agregar capa de tiles (mapa base)
      const tileLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors",
          maxZoom: 18,
        }
      );
      tileLayer.addTo(map);

      // Guardar referencia del mapa
      this.mapInstances.set(containerId, map);

      console.log("✅ Mapa inicializado correctamente");
      return map;
    } catch (error) {
      console.error("❌ Error inicializando mapa:", error);
      throw error;
    }
  }

  // Obtener instancia de mapa existente
  public getMapInstance(containerId: string): any | null {
    return this.mapInstances.get(containerId) || null;
  }

  // Destruir instancia de mapa
  public destroyMap(containerId: string): void {
    const map = this.mapInstances.get(containerId);
    if (map) {
      map.remove();
      this.mapInstances.delete(containerId);
      this.markerGroups.delete(containerId);
      console.log(`🗑️ Mapa ${containerId} destruido`);
    }
  }

  // ============================================================================
  // GEOLOCALIZACIÓN Y UBICACIÓN ACTUAL
  // ============================================================================

  // Obtener ubicación actual del usuario
  public async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalización no soportada en este navegador"));
        return;
      }

      console.log("📍 Obteniendo ubicación actual del usuario...");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          };

          console.log("✅ Ubicación obtenida:", location);
          resolve(location);
        },
        (error) => {
          let message = "Error obteniendo ubicación";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = "Permiso de ubicación denegado por el usuario";
              break;
            case error.POSITION_UNAVAILABLE:
              message = "Información de ubicación no disponible";
              break;
            case error.TIMEOUT:
              message = "Tiempo de espera agotado para obtener ubicación";
              break;
          }
          console.error("❌ Error de geolocalización:", message);
          reject(new Error(message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        }
      );
    });
  }

  // Marcar ubicación actual en el mapa
  public async markCurrentLocation(mapId: string): Promise<void> {
    try {
      const location = await this.getCurrentLocation();
      const map = this.getMapInstance(mapId);

      if (!map) {
        throw new Error(`Mapa con ID ${mapId} no encontrado`);
      }

      // Remover marcador anterior si existe
      if (this.currentLocationMarker) {
        map.removeLayer(this.currentLocationMarker);
      }

      // Crear icono personalizado para ubicación actual
      const currentLocationIcon = L.divIcon({
        className: "current-location-marker",
        html: `
          <div class="pulse-marker">
            <div class="pulse-inner"></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      // Agregar nuevo marcador
      this.currentLocationMarker = L.marker(
        [location.latitude, location.longitude],
        { icon: currentLocationIcon }
      ).addTo(map);

      // Centrar mapa en la ubicación actual
      map.setView([location.latitude, location.longitude], 15);

      console.log("📍 Ubicación actual marcada en el mapa");
    } catch (error) {
      console.error("❌ Error marcando ubicación actual:", error);
      throw error;
    }
  }

  // ============================================================================
  // GESTIÓN DE MARCADORES
  // ============================================================================

  // Crear marcador personalizado
  public createCustomMarker(
    location: Location,
    category: MarkerCategory,
    data?: any
  ): any {
    // Obtener color e icono según la categoría
    const color = MARKER_COLORS[category];
    const iconName = MARKER_ICONS[category];

    // Crear icono personalizado
    const customIcon = L.divIcon({
      className: `custom-marker marker-${category}`,
      html: `
        <div class="marker-pin" style="background-color: ${color};">
          <i class="icon-${iconName}"></i>
        </div>
        <div class="marker-shadow"></div>
      `,
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -40],
    });

    // Crear marcador
    const marker = L.marker([location.latitude, location.longitude], {
      icon: customIcon,
    });

    // Agregar popup si hay datos adicionales
    if (data) {
      const popupContent = this.createPopupContent(category, data);
      marker.bindPopup(popupContent);
    }

    return marker;
  }

  // Crear contenido del popup según la categoría
  private createPopupContent(category: MarkerCategory, data: any): string {
    switch (category) {
      case MarkerCategory.CATTLE:
        return `
          <div class="marker-popup cattle-popup">
            <h3>🐄 ${data.earTag}</h3>
            <p><strong>Raza:</strong> ${data.breed}</p>
            <p><strong>Estado:</strong> ${data.healthStatus}</p>
            <p><strong>Última ubicación:</strong> ${new Date(
              data.lastSeen
            ).toLocaleDateString()}</p>
          </div>
        `;
      case MarkerCategory.VACCINATION:
        return `
          <div class="marker-popup vaccination-popup">
            <h3>💉 Vacunación</h3>
            <p><strong>Tipo:</strong> ${data.vaccineType}</p>
            <p><strong>Fecha:</strong> ${new Date(
              data.date
            ).toLocaleDateString()}</p>
            <p><strong>Veterinario:</strong> ${data.veterinarian}</p>
          </div>
        `;
      case MarkerCategory.ILLNESS:
        return `
          <div class="marker-popup illness-popup">
            <h3>🩺 Enfermedad</h3>
            <p><strong>Tipo:</strong> ${data.diseaseType}</p>
            <p><strong>Gravedad:</strong> ${data.severity}</p>
            <p><strong>Fecha:</strong> ${new Date(
              data.date
            ).toLocaleDateString()}</p>
          </div>
        `;
      default:
        return `
          <div class="marker-popup default-popup">
            <h3>📍 Ubicación</h3>
            <p>Información no disponible</p>
          </div>
        `;
    }
  }

  // Agregar múltiples marcadores al mapa
  public addMarkersToMap(
    mapId: string,
    markers: MarkerData[],
    groupName: string = "default"
  ): void {
    const map = this.getMapInstance(mapId);
    if (!map) {
      throw new Error(`Mapa con ID ${mapId} no encontrado`);
    }

    // Crear o obtener grupo de marcadores
    let markerGroup = this.markerGroups.get(`${mapId}_${groupName}`);
    if (!markerGroup) {
      markerGroup = L.layerGroup();
      this.markerGroups.set(`${mapId}_${groupName}`, markerGroup);
      markerGroup.addTo(map);
    }

    // Agregar cada marcador al grupo
    markers.forEach((markerData) => {
      const marker = this.createCustomMarker(
        markerData.location,
        markerData.category,
        markerData.data
      );
      markerGroup!.addLayer(marker);
    });

    console.log(
      `✅ ${markers.length} marcadores agregados al grupo ${groupName}`
    );
  }

  // Limpiar marcadores de un grupo específico
  public clearMarkerGroup(mapId: string, groupName: string = "default"): void {
    const markerGroup = this.markerGroups.get(`${mapId}_${groupName}`);
    if (markerGroup) {
      markerGroup.clearLayers();
      console.log(`🧹 Marcadores del grupo ${groupName} limpiados`);
    }
  }

  // ============================================================================
  // GEOCODIFICACIÓN
  // ============================================================================

  // Geocodificar dirección a coordenadas
  public async geocodeAddress(address: string): Promise<GeocodingResult[]> {
    try {
      console.log(`🔍 Geocodificando dirección: ${address}`);

      const response = await api.post<GeocodingResult[]>(
        MAP_ENDPOINTS.GEOCODE,
        {
          address: address,
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error en la geocodificación");
      }

      console.log(`✅ ${response.data.length} resultados encontrados`);
      return response.data;
    } catch (error) {
      console.error("❌ Error en geocodificación:", error);
      throw error;
    }
  }

  // Geocodificación inversa: coordenadas a dirección
  public async reverseGeocode(location: Location): Promise<GeocodingResult> {
    try {
      console.log(`🔍 Geocodificación inversa para:`, location);

      const response = await api.post<GeocodingResult>(
        MAP_ENDPOINTS.REVERSE_GEOCODE,
        {
          latitude: location.latitude,
          longitude: location.longitude,
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error en la geocodificación inversa");
      }

      console.log("✅ Dirección obtenida:", response.data.address);
      return response.data;
    } catch (error) {
      console.error("❌ Error en geocodificación inversa:", error);
      throw error;
    }
  }

  // ============================================================================
  // CÁLCULOS GEOESPACIALES
  // ============================================================================

  // Calcular distancia entre dos puntos (en metros)
  public calculateDistance(point1: Location, point2: Location): number {
    const R = 6371000; // Radio de la Tierra en metros
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  }

  // Verificar si un punto está dentro de un radio específico
  public isWithinRadius(
    center: Location,
    point: Location,
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistance(center, point);
    return distance <= radiusMeters;
  }

  // Calcular el centro de un conjunto de puntos
  public calculateCenter(locations: Location[]): Location {
    if (locations.length === 0) {
      throw new Error(
        "Se necesita al menos una ubicación para calcular el centro"
      );
    }

    const totalLat = locations.reduce((sum, loc) => sum + loc.latitude, 0);
    const totalLng = locations.reduce((sum, loc) => sum + loc.longitude, 0);

    return {
      latitude: totalLat / locations.length,
      longitude: totalLng / locations.length,
      timestamp: new Date().toISOString(),
    };
  }

  // ============================================================================
  // DATOS DEL BACKEND
  // ============================================================================

  // Obtener ubicaciones de ganado
  public async getCattleLocations(): Promise<MarkerData[]> {
    try {
      console.log("🐄 Obteniendo ubicaciones de ganado...");

      const response = await api.get<any[]>(MAP_ENDPOINTS.CATTLE_LOCATIONS);

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo ubicaciones de ganado");
      }

      // Convertir a formato de marcadores
      const markers: MarkerData[] = response.data.map((cattle) => ({
        id: cattle.id,
        location: cattle.location,
        category: MarkerCategory.CATTLE,
        data: cattle,
      }));

      console.log(`✅ ${markers.length} ubicaciones de ganado obtenidas`);
      return markers;
    } catch (error) {
      console.error("❌ Error obteniendo ubicaciones de ganado:", error);
      throw error;
    }
  }

  // Obtener ubicaciones de vacunaciones
  public async getVaccinationLocations(): Promise<MarkerData[]> {
    try {
      console.log("💉 Obteniendo ubicaciones de vacunaciones...");

      const response = await api.get<any[]>(
        MAP_ENDPOINTS.VACCINATION_LOCATIONS
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo ubicaciones de vacunaciones");
      }

      const markers: MarkerData[] = response.data.map((vaccination) => ({
        id: vaccination.id,
        location: vaccination.location,
        category: MarkerCategory.VACCINATION,
        data: vaccination,
      }));

      console.log(`✅ ${markers.length} ubicaciones de vacunaciones obtenidas`);
      return markers;
    } catch (error) {
      console.error("❌ Error obteniendo ubicaciones de vacunaciones:", error);
      throw error;
    }
  }

  // Obtener ubicaciones de enfermedades
  public async getIllnessLocations(): Promise<MarkerData[]> {
    try {
      console.log("🩺 Obteniendo ubicaciones de enfermedades...");

      const response = await api.get<any[]>(MAP_ENDPOINTS.ILLNESS_LOCATIONS);

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo ubicaciones de enfermedades");
      }

      const markers: MarkerData[] = response.data.map((illness) => ({
        id: illness.id,
        location: illness.location,
        category: MarkerCategory.ILLNESS,
        data: illness,
      }));

      console.log(`✅ ${markers.length} ubicaciones de enfermedades obtenidas`);
      return markers;
    } catch (error) {
      console.error("❌ Error obteniendo ubicaciones de enfermedades:", error);
      throw error;
    }
  }

  // ============================================================================
  // ANÁLISIS Y VISUALIZACIONES AVANZADAS
  // ============================================================================

  // Crear mapa de calor para densidad de eventos
  public async createHeatmap(
    mapId: string,
    eventType: "vaccination" | "illness"
  ): Promise<void> {
    try {
      console.log(`🔥 Creando mapa de calor para: ${eventType}`);

      const map = this.getMapInstance(mapId);
      if (!map) {
        throw new Error(`Mapa con ID ${mapId} no encontrado`);
      }

      // Obtener datos para el mapa de calor
      const endpoint =
        eventType === "vaccination"
          ? MAP_ENDPOINTS.VACCINATION_LOCATIONS
          : MAP_ENDPOINTS.ILLNESS_LOCATIONS;

      const response = await api.get<HeatmapPoint[]>(endpoint);

      if (!response.success || !response.data) {
        throw new Error(
          `Error obteniendo datos para mapa de calor de ${eventType}`
        );
      }

      // Aquí se integraría con una librería de heatmap como Leaflet.heat
      // Por ahora, simplemente log de los datos
      console.log(
        `✅ Datos de mapa de calor obtenidos: ${response.data.length} puntos`
      );
    } catch (error) {
      console.error("❌ Error creando mapa de calor:", error);
      throw error;
    }
  }

  // Ajustar vista del mapa para mostrar todos los marcadores
  public fitMapToBounds(mapId: string, locations: Location[]): void {
    const map = this.getMapInstance(mapId);
    if (!map || locations.length === 0) return;

    const group = L.featureGroup(
      locations.map((loc: Location) => L.marker([loc.latitude, loc.longitude]))
    );

    map.fitBounds(group.getBounds().pad(0.1)); // 10% de padding
    console.log(
      "🎯 Vista del mapa ajustada para mostrar todas las ubicaciones"
    );
  }
}

// Exportar instancia singleton
export const mapsService = MapsService.getInstance();
