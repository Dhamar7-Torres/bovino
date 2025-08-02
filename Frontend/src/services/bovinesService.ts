import { api, apiClient } from "./api";
import {
  CATTLE_ENDPOINTS,
  MAP_ENDPOINTS,
  FILE_ENDPOINTS,
} from "../constants/urls";
import {
  Bovine,
  BovineType,
  BovineGender,
  HealthStatus,
  Vaccination,
  Illness,
} from "../constants/bovineTypes";

// Interfaces para el servicio de bovinos
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  accuracy?: number;
  timestamp?: string;
}

interface BovineSearchParams {
  searchTerm?: string;
  type?: BovineType;
  breed?: string;
  gender?: BovineGender;
  healthStatus?: HealthStatus;
  ageMin?: number;
  ageMax?: number;
  weightMin?: number;
  weightMax?: number;
  locationRadius?: number;
  centerLocation?: Location;
  hasVaccinations?: boolean;
  hasIllnesses?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface PaginatedResponse<T> {
  items: Bovine[];
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface BovineStats {
  totalCount: number;
  countByType: Record<BovineType, number>;
  countByGender: Record<BovineGender, number>;
  countByHealthStatus: Record<HealthStatus, number>;
  averageAge: number;
  averageWeight: number;
  vaccinationCoverage: number;
  illnessRate: number;
}

interface BulkOperation {
  ids: string[];
  operation: "update" | "delete" | "vaccinate" | "move_location";
  data?: any;
}

interface GenealogyInfo {
  bovine: Bovine;
  parents: {
    mother?: Bovine;
    father?: Bovine;
  };
  offspring: Bovine[];
  siblings: Bovine[];
  lineage: {
    generation: number;
    ancestors: Bovine[];
  }[];
}

interface ExportOptions {
  format: "csv" | "excel" | "pdf";
  fields?: string[];
  includeVaccinations?: boolean;
  includeIllnesses?: boolean;
  includePhotos?: boolean;
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
}

// Configuración para el servicio de bovinos
const BOVINES_CONFIG = {
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutos
  BATCH_SIZE: 50, // Tamaño para operaciones en lote
  MAX_PHOTO_SIZE: 10 * 1024 * 1024, // 10MB máximo por foto
  SUPPORTED_IMAGE_FORMATS: ["image/jpeg", "image/png", "image/webp"],
  LOCATION_ACCURACY_THRESHOLD: 100, // metros
  SYNC_INTERVAL: 2 * 60 * 1000, // 2 minutos para sincronización
} as const;

// Clase principal del servicio de bovinos
class BovinesService {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private syncTimer: number | null = null;
  private pendingOperations: any[] = [];

  constructor() {
    // Inicializar sincronización automática
    this.startAutoSync();

    // Configurar listeners para offline/online
    window.addEventListener("online", this.handleOnline.bind(this));
    window.addEventListener("offline", this.handleOffline.bind(this));
  }

  // MÉTODOS DE CACHE Y SINCRONIZACIÓN

  // Obtener datos del cache
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired =
      Date.now() - cached.timestamp > BOVINES_CONFIG.CACHE_DURATION;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  // Guardar en cache
  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  // Limpiar cache
  private clearCache(): void {
    this.cache.clear();
  }

  // Iniciar sincronización automática
  private startAutoSync(): void {
    if (this.syncTimer) clearInterval(this.syncTimer);

    this.syncTimer = window.setInterval(async () => {
      if (navigator.onLine && this.pendingOperations.length > 0) {
        await this.syncPendingOperations();
      }
    }, BOVINES_CONFIG.SYNC_INTERVAL);
  }

  // Manejar conexión restaurada
  private async handleOnline(): Promise<void> {
    console.log(
      "🌐 Conexión restaurada - Sincronizando operaciones pendientes..."
    );
    await this.syncPendingOperations();
  }

  // Manejar pérdida de conexión
  private handleOffline(): void {
    console.log("📱 Modo offline activado");
  }

  // Sincronizar operaciones pendientes
  private async syncPendingOperations(): Promise<void> {
    if (this.pendingOperations.length === 0) return;

    try {
      console.log(
        `🔄 Sincronizando ${this.pendingOperations.length} operaciones...`
      );

      // Procesar operaciones en lotes
      const batches = this.chunkArray(
        this.pendingOperations,
        BOVINES_CONFIG.BATCH_SIZE
      );

      for (const batch of batches) {
        await Promise.allSettled(
          batch.map((operation) => this.executePendingOperation(operation))
        );
      }

      this.pendingOperations = [];
      console.log("✅ Sincronización completada");
    } catch (error) {
      console.error("❌ Error en sincronización:", error);
    }
  }

  // Ejecutar operación pendiente
  private async executePendingOperation(operation: any): Promise<void> {
    try {
      switch (operation.type) {
        case "create":
          await this.createBovine(operation.data, false);
          break;
        case "update":
          await this.updateBovine(operation.id, operation.data, false);
          break;
        case "delete":
          await this.deleteBovine(operation.id, false);
          break;
        case "add_vaccination":
          await this.addVaccination(operation.bovineId, operation.data, false);
          break;
        case "add_illness":
          await this.addIllness(operation.bovineId, operation.data, false);
          break;
      }
    } catch (error) {
      console.error("❌ Error ejecutando operación pendiente:", error);
    }
  }

  // Dividir array en chunks
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // MÉTODOS CRUD BÁSICOS

  // Obtener lista de bovinos con filtros y paginación
  public async getBovines(
    params?: BovineSearchParams
  ): Promise<PaginatedResponse<Bovine>> {
    try {
      const cacheKey = `bovines_${JSON.stringify(params || {})}`;
      const cached = this.getFromCache<PaginatedResponse<Bovine>>(cacheKey);

      if (cached) {
        console.log("📦 Bovinos obtenidos del cache");
        return cached;
      }

      console.log("🐄 Obteniendo lista de bovinos...");

      const response = await api.get<PaginatedResponse<Bovine>>(
        CATTLE_ENDPOINTS.LIST,
        { params }
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo bovinos");
      }

      // Procesar fechas en los datos
      const processedData = {
        ...response.data,
        data: response.data.data.map((bovine) => ({
          ...bovine,
          birthDate: new Date(bovine.birthDate),
          createdAt: new Date(bovine.createdAt),
          updatedAt: new Date(bovine.updatedAt),
          vaccinations: bovine.vaccinations.map((vac) => ({
            ...vac,
            applicationDate: new Date(vac.applicationDate),
            nextDueDate: vac.nextDueDate
              ? new Date(vac.nextDueDate)
              : undefined,
            createdAt: new Date(vac.createdAt),
          })),
          illnesses: bovine.illnesses.map((ill) => ({
            ...ill,
            diagnosisDate: new Date(ill.diagnosisDate),
            recoveryDate: ill.recoveryDate
              ? new Date(ill.recoveryDate)
              : undefined,
            createdAt: new Date(ill.createdAt),
          })),
        })),
      };

      this.setCache(cacheKey, processedData);

      console.log(`✅ ${processedData.data.length} bovinos obtenidos`);
      return processedData;
    } catch (error) {
      console.error("❌ Error obteniendo bovinos:", error);
      throw error;
    }
  }

  // Obtener bovino por ID
  public async getBovineById(id: string): Promise<Bovine> {
    try {
      const cacheKey = `bovine_${id}`;
      const cached = this.getFromCache<Bovine>(cacheKey);

      if (cached) {
        console.log("📦 Bovino obtenido del cache");
        return cached;
      }

      console.log(`🐄 Obteniendo bovino con ID: ${id}`);

      const response = await api.get<Bovine>(CATTLE_ENDPOINTS.GET_BY_ID(id));

      if (!response.success || !response.data) {
        throw new Error("Bovino no encontrado");
      }

      // Procesar fechas
      const bovine = {
        ...response.data,
        birthDate: new Date(response.data.birthDate),
        createdAt: new Date(response.data.createdAt),
        updatedAt: new Date(response.data.updatedAt),
        vaccinations: response.data.vaccinations.map((vac) => ({
          ...vac,
          applicationDate: new Date(vac.applicationDate),
          nextDueDate: vac.nextDueDate ? new Date(vac.nextDueDate) : undefined,
          createdAt: new Date(vac.createdAt),
        })),
        illnesses: response.data.illnesses.map((ill) => ({
          ...ill,
          diagnosisDate: new Date(ill.diagnosisDate),
          recoveryDate: ill.recoveryDate
            ? new Date(ill.recoveryDate)
            : undefined,
          createdAt: new Date(ill.createdAt),
        })),
      };

      this.setCache(cacheKey, bovine);

      console.log(`✅ Bovino obtenido: ${bovine.earTag}`);
      return bovine;
    } catch (error) {
      console.error("❌ Error obteniendo bovino:", error);
      throw error;
    }
  }

  // Obtener bovino por arete
  public async getBovineByEarTag(earTag: string): Promise<Bovine> {
    try {
      console.log(`🏷️ Buscando bovino con arete: ${earTag}`);

      const response = await api.get<Bovine>(
        CATTLE_ENDPOINTS.BY_EAR_TAG(earTag)
      );

      if (!response.success || !response.data) {
        throw new Error("Bovino no encontrado");
      }

      console.log(
        `✅ Bovino encontrado: ${response.data.name || response.data.earTag}`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error buscando bovino por arete:", error);
      throw error;
    }
  }

  // Crear nuevo bovino
  public async createBovine(
    bovineData: Omit<
      Bovine,
      "id" | "createdAt" | "updatedAt" | "vaccinations" | "illnesses"
    >,
    sync: boolean = true
  ): Promise<Bovine> {
    try {
      // Validaciones
      if (!bovineData.earTag) {
        throw new Error("El número de arete es obligatorio");
      }

      // Agregar ubicación actual si no se especifica
      if (!bovineData.location.latitude || !bovineData.location.longitude) {
        bovineData.location = await this.getCurrentLocation();
      }

      console.log(`🆕 Creando nuevo bovino: ${bovineData.earTag}`);

      if (!navigator.onLine && sync) {
        // Modo offline - agregar a operaciones pendientes
        this.pendingOperations.push({
          type: "create",
          data: bovineData,
          timestamp: Date.now(),
        });

        // Crear ID temporal para uso offline
        const tempId = `temp_${Date.now()}`;
        const tempBovine: Bovine = {
          ...bovineData,
          id: tempId,
          vaccinations: [],
          illnesses: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        console.log("📱 Bovino guardado para sincronización offline");
        return tempBovine;
      }

      const response = await api.post<Bovine>(
        CATTLE_ENDPOINTS.CREATE,
        bovineData,
        { includeLocation: true }
      );

      if (!response.success || !response.data) {
        throw new Error("Error creando bovino");
      }

      // Limpiar cache relevante
      this.clearCache();

      console.log(`✅ Bovino creado exitosamente: ${response.data.earTag}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error creando bovino:", error);
      throw error;
    }
  }

  // Actualizar bovino
  public async updateBovine(
    id: string,
    updates: Partial<Bovine>,
    sync: boolean = true
  ): Promise<Bovine> {
    try {
      console.log(`✏️ Actualizando bovino: ${id}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "update",
          id,
          data: updates,
          timestamp: Date.now(),
        });

        console.log("📱 Actualización guardada para sincronización offline");
        throw new Error(
          "Actualización guardada para cuando se restaure la conexión"
        );
      }

      const response = await api.put<Bovine>(
        CATTLE_ENDPOINTS.UPDATE(id),
        updates,
        { includeLocation: true }
      );

      if (!response.success || !response.data) {
        throw new Error("Error actualizando bovino");
      }

      // Actualizar cache
      this.setCache(`bovine_${id}`, response.data);
      this.clearCache(); // Limpiar cache de listas

      console.log(`✅ Bovino actualizado: ${response.data.earTag}`);
      return response.data;
    } catch (error) {
      console.error("❌ Error actualizando bovino:", error);
      throw error;
    }
  }

  // Eliminar bovino
  public async deleteBovine(id: string, sync: boolean = true): Promise<void> {
    try {
      console.log(`🗑️ Eliminando bovino: ${id}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "delete",
          id,
          timestamp: Date.now(),
        });

        console.log("📱 Eliminación guardada para sincronización offline");
        return;
      }

      const response = await api.delete(CATTLE_ENDPOINTS.DELETE(id));

      if (!response.success) {
        throw new Error("Error eliminando bovino");
      }

      // Limpiar cache
      this.cache.delete(`bovine_${id}`);
      this.clearCache();

      console.log("✅ Bovino eliminado exitosamente");
    } catch (error) {
      console.error("❌ Error eliminando bovino:", error);
      throw error;
    }
  }

  // MÉTODOS DE GEOLOCALIZACIÓN

  // Obtener ubicación actual
  private async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalización no soportada"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          });
        },
        (error) => {
          let message = "Error obteniendo ubicación";
          switch (error.code) {
            case error.PERMISSION_DENIED:
              message = "Permiso de ubicación denegado";
              break;
            case error.POSITION_UNAVAILABLE:
              message = "Ubicación no disponible";
              break;
            case error.TIMEOUT:
              message = "Tiempo de espera agotado";
              break;
          }
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

  // Actualizar ubicación de bovino
  public async updateBovineLocation(
    id: string,
    location?: Location
  ): Promise<Bovine> {
    try {
      const newLocation = location || (await this.getCurrentLocation());

      console.log(`📍 Actualizando ubicación del bovino: ${id}`);

      return await this.updateBovine(id, { location: newLocation });
    } catch (error) {
      console.error("❌ Error actualizando ubicación:", error);
      throw error;
    }
  }

  // Obtener bovinos en un área específica
  public async getBovinesInArea(
    centerLocation: Location,
    radiusKm: number
  ): Promise<Bovine[]> {
    try {
      console.log(`🌍 Buscando bovinos en un radio de ${radiusKm}km`);

      const response = await api.get<Bovine[]>(MAP_ENDPOINTS.CATTLE_BY_AREA, {
        params: {
          latitude: centerLocation.latitude,
          longitude: centerLocation.longitude,
          radius: radiusKm,
        },
      });

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo bovinos por área");
      }

      console.log(`✅ ${response.data.length} bovinos encontrados en el área`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo bovinos por área:", error);
      throw error;
    }
  }

  // MÉTODOS DE VACUNACIONES E ENFERMEDADES

  // Agregar vacunación a bovino
  public async addVaccination(
    bovineId: string,
    vaccinationData: Omit<Vaccination, "id" | "bovineId" | "createdAt">,
    sync: boolean = true
  ): Promise<Vaccination> {
    try {
      // Agregar ubicación actual si no se especifica
      if (
        !vaccinationData.location.latitude ||
        !vaccinationData.location.longitude
      ) {
        vaccinationData.location = await this.getCurrentLocation();
      }

      console.log(`💉 Agregando vacunación al bovino: ${bovineId}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "add_vaccination",
          bovineId,
          data: vaccinationData,
          timestamp: Date.now(),
        });

        console.log("📱 Vacunación guardada para sincronización offline");
        throw new Error(
          "Vacunación guardada para cuando se restaure la conexión"
        );
      }

      const response = await api.post<Vaccination>(
        `/cattle/${bovineId}/vaccinations`,
        vaccinationData,
        { includeLocation: true }
      );

      if (!response.success || !response.data) {
        throw new Error("Error agregando vacunación");
      }

      // Limpiar cache del bovino
      this.cache.delete(`bovine_${bovineId}`);
      this.clearCache();

      console.log("✅ Vacunación agregada exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error agregando vacunación:", error);
      throw error;
    }
  }

  // Agregar enfermedad a bovino
  public async addIllness(
    bovineId: string,
    illnessData: Omit<Illness, "id" | "bovineId" | "createdAt">,
    sync: boolean = true
  ): Promise<Illness> {
    try {
      // Agregar ubicación actual si no se especifica
      if (!illnessData.location.latitude || !illnessData.location.longitude) {
        illnessData.location = await this.getCurrentLocation();
      }

      console.log(`🏥 Agregando enfermedad al bovino: ${bovineId}`);

      if (!navigator.onLine && sync) {
        this.pendingOperations.push({
          type: "add_illness",
          bovineId,
          data: illnessData,
          timestamp: Date.now(),
        });

        console.log("📱 Enfermedad guardada para sincronización offline");
        throw new Error(
          "Enfermedad guardada para cuando se restaure la conexión"
        );
      }

      const response = await api.post<Illness>(
        `/cattle/${bovineId}/illnesses`,
        illnessData,
        { includeLocation: true }
      );

      if (!response.success || !response.data) {
        throw new Error("Error agregando enfermedad");
      }

      // Limpiar cache del bovino
      this.cache.delete(`bovine_${bovineId}`);
      this.clearCache();

      console.log("✅ Enfermedad agregada exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error agregando enfermedad:", error);
      throw error;
    }
  }

  // MÉTODOS DE BÚSQUEDA Y FILTRADO

  // Búsqueda avanzada de bovinos
  public async searchBovines(searchTerm: string): Promise<Bovine[]> {
    try {
      console.log(`🔍 Buscando bovinos con término: ${searchTerm}`);

      const response = await api.get<Bovine[]>(CATTLE_ENDPOINTS.SEARCH, {
        params: { q: searchTerm },
      });

      if (!response.success || !response.data) {
        throw new Error("Error en búsqueda");
      }

      console.log(`✅ ${response.data.length} bovinos encontrados`);
      return response.data;
    } catch (error) {
      console.error("❌ Error en búsqueda:", error);
      throw error;
    }
  }

  // Filtrar bovinos por tipo
  public async getBovinesByType(type: BovineType): Promise<Bovine[]> {
    try {
      const response = await api.get<Bovine[]>(CATTLE_ENDPOINTS.BY_TYPE(type));

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo bovinos por tipo");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo bovinos por tipo:", error);
      throw error;
    }
  }

  // Filtrar bovinos por estado de salud
  public async getBovinesByHealthStatus(
    status: HealthStatus
  ): Promise<Bovine[]> {
    try {
      const response = await api.get<Bovine[]>(
        CATTLE_ENDPOINTS.BY_HEALTH_STATUS(status)
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo bovinos por estado de salud");
      }

      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo bovinos por estado de salud:", error);
      throw error;
    }
  }

  // MÉTODOS DE ESTADÍSTICAS

  // Obtener estadísticas generales
  public async getBovineStats(): Promise<BovineStats> {
    try {
      console.log("📊 Obteniendo estadísticas de bovinos...");

      const response = await api.get<BovineStats>(CATTLE_ENDPOINTS.STATS);

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo estadísticas");
      }

      console.log("✅ Estadísticas obtenidas");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas:", error);
      throw error;
    }
  }

  // MÉTODOS DE GENEALOGÍA

  // Obtener información genealógica
  public async getBovineGenealogy(id: string): Promise<GenealogyInfo> {
    try {
      console.log(`🌳 Obteniendo genealogía del bovino: ${id}`);

      const response = await api.get<GenealogyInfo>(
        CATTLE_ENDPOINTS.GENEALOGY(id)
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo genealogía");
      }

      console.log("✅ Genealogía obtenida");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo genealogía:", error);
      throw error;
    }
  }

  // MÉTODOS DE ARCHIVOS Y FOTOS

  // Subir foto de bovino
  public async uploadBovinePhoto(
    bovineId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<string> {
    try {
      // Validar archivo
      if (file.size > BOVINES_CONFIG.MAX_PHOTO_SIZE) {
        throw new Error("El archivo es demasiado grande (máximo 10MB)");
      }

      const supportedFormats = BOVINES_CONFIG.SUPPORTED_IMAGE_FORMATS;
      if (!supportedFormats.includes(file.type as any)) {
        throw new Error("Formato de imagen no soportado");
      }

      console.log(`📸 Subiendo foto para bovino: ${bovineId}`);

      const response = await apiClient.upload<{ url: string }>(
        FILE_ENDPOINTS.CATTLE_PHOTO_UPLOAD(bovineId),
        file,
        "photo",
        onProgress
      );

      if (!response.success || !response.data) {
        throw new Error("Error subiendo foto");
      }

      console.log("✅ Foto subida exitosamente");
      return response.data.url;
    } catch (error) {
      console.error("❌ Error subiendo foto:", error);
      throw error;
    }
  }

  // MÉTODOS DE OPERACIONES EN LOTE

  // Operación en lote
  public async bulkOperation(operation: BulkOperation): Promise<void> {
    try {
      console.log(`🔄 Ejecutando operación en lote: ${operation.operation}`);

      const response = await api.post(CATTLE_ENDPOINTS.BULK_UPDATE, operation);

      if (!response.success) {
        throw new Error("Error en operación en lote");
      }

      this.clearCache();
      console.log("✅ Operación en lote completada");
    } catch (error) {
      console.error("❌ Error en operación en lote:", error);
      throw error;
    }
  }

  // MÉTODOS DE EXPORTACIÓN

  // Exportar datos de bovinos
  public async exportBovines(options: ExportOptions): Promise<void> {
    try {
      console.log(`📤 Exportando bovinos en formato: ${options.format}`);

      await apiClient.download(
        CATTLE_ENDPOINTS.EXPORT,
        `bovines_export.${options.format}`,
        (progress) => {
          console.log(`📥 Progreso de descarga: ${progress}%`);
        }
      );

      console.log("✅ Exportación completada");
    } catch (error) {
      console.error("❌ Error exportando:", error);
      throw error;
    }
  }

  // MÉTODOS DE UTILIDAD

  // Validar número de arete único
  public async validateEarTag(
    earTag: string,
    excludeId?: string
  ): Promise<boolean> {
    try {
      const bovines = await this.getBovines({ searchTerm: earTag, limit: 1 });

      if (bovines.data.length === 0) return true;

      if (excludeId && bovines.data[0].id === excludeId) return true;

      return false;
    } catch (error) {
      console.error("❌ Error validando arete:", error);
      return false;
    }
  }

  // Calcular edad en días
  public calculateAge(birthDate: Date): number {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birthDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Obtener estado de salud con color
  public getHealthStatusColor(status: HealthStatus): string {
    const colors = {
      [HealthStatus.HEALTHY]: "#10B981", // Verde
      [HealthStatus.SICK]: "#EF4444", // Rojo
      [HealthStatus.QUARANTINE]: "#F59E0B", // Amarillo
      [HealthStatus.RECOVERING]: "#3B82F6", // Azul
      [HealthStatus.DEAD]: "#6B7280", // Gris
    };

    return colors[status] || "#6B7280";
  }

  // Destructor
  public destroy(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    window.removeEventListener("online", this.handleOnline.bind(this));
    window.removeEventListener("offline", this.handleOffline.bind(this));

    this.clearCache();
  }
}

// Instancia singleton del servicio de bovinos
export const bovinesService = new BovinesService();

// Export default para compatibilidad
export default bovinesService;
