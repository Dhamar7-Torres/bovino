import { api } from "./api";

// Tipos para producción ganadera
interface ProductionRecord {
  id: string;
  cattleId: string;
  earTag: string;
  date: string;
  productionType: ProductionType;
  quantity: number;
  unit: ProductionUnit;
  quality: QualityGrade;
  location: Location;
  observations?: string;
  weather?: WeatherCondition;
  createdAt: string;
  updatedAt: string;
}

interface MilkProduction extends ProductionRecord {
  productionType: ProductionType.MILK;
  fatContent?: number;
  proteinContent?: number;
  somaticCellCount?: number;
  bacterialCount?: number;
  temperature?: number;
}

interface MeatProduction extends ProductionRecord {
  productionType: ProductionType.MEAT;
  weightAtSlaughter: number;
  carcassWeight: number;
  meatGrade: MeatGrade;
  ageAtSlaughter: number;
  feedConversionRatio?: number;
}

interface ReproductionRecord {
  id: string;
  cattleId: string;
  eventType: ReproductionEventType;
  date: string;
  location: Location;
  success: boolean;
  partnerId?: string; // ID del toro/vaca pareja
  gestationPeriod?: number; // en días
  birthWeight?: number;
  calvingDifficulty?: CalvingDifficulty;
  veterinarianId?: string;
  observations?: string;
  createdAt: string;
}

interface ProductionStatistics {
  totalMilkProduction: number;
  averageDailyMilk: number;
  totalMeatProduction: number;
  reproductionRate: number;
  averageCalvingInterval: number;
  mortalityRate: number;
  feedEfficiency: number;
  profitabilityIndex: number;
}

interface ProductionAnalytics {
  period: DateRange;
  cattleCount: number;
  totalProduction: ProductionStatistics;
  trends: ProductionTrend[];
  comparisons: ProductionComparison[];
  recommendations: ProductionRecommendation[];
}

interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp?: string;
}

interface DateRange {
  startDate: string;
  endDate: string;
}

interface ProductionTrend {
  metric: string;
  period: string;
  value: number;
  change: number; // porcentaje de cambio
  trend: "up" | "down" | "stable";
}

interface ProductionComparison {
  metric: string;
  currentValue: number;
  industryAverage: number;
  variance: number;
  performance: "above" | "below" | "average";
}

interface ProductionRecommendation {
  id: string;
  type: RecommendationType;
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  impact: string;
  actionItems: string[];
}

interface WeatherCondition {
  temperature: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
}

// Enums
enum ProductionType {
  MILK = "milk",
  MEAT = "meat",
  BREEDING = "breeding",
  WORK = "work",
}

enum ProductionUnit {
  LITERS = "liters",
  KILOGRAMS = "kg",
  POUNDS = "lbs",
  GALLONS = "gallons",
}

enum QualityGrade {
  EXCELLENT = "excellent",
  GOOD = "good",
  AVERAGE = "average",
  POOR = "poor",
}

enum MeatGrade {
  PRIME = "prime",
  CHOICE = "choice",
  SELECT = "select",
  STANDARD = "standard",
  COMMERCIAL = "commercial",
}

enum ReproductionEventType {
  BREEDING = "breeding",
  PREGNANCY_CHECK = "pregnancy_check",
  CALVING = "calving",
  WEANING = "weaning",
  HEAT_DETECTION = "heat_detection",
}

enum CalvingDifficulty {
  EASY = "easy",
  MODERATE = "moderate",
  DIFFICULT = "difficult",
  ASSISTED = "assisted",
  CESAREAN = "cesarean",
}

enum RecommendationType {
  NUTRITION = "nutrition",
  HEALTH = "health",
  BREEDING = "breeding",
  MANAGEMENT = "management",
  ECONOMICS = "economics",
}

// Endpoints para producción
const PRODUCTION_ENDPOINTS = {
  // Registros de producción
  LIST_PRODUCTION: "/production",
  CREATE_PRODUCTION: "/production",
  GET_PRODUCTION: (id: string) => `/production/${id}`,
  UPDATE_PRODUCTION: (id: string) => `/production/${id}`,
  DELETE_PRODUCTION: (id: string) => `/production/${id}`,

  // Por tipo de producción
  MILK_PRODUCTION: "/production/milk",
  MEAT_PRODUCTION: "/production/meat",
  BREEDING_RECORDS: "/production/breeding",

  // Por ganado
  BY_CATTLE: (cattleId: string) => `/production/cattle/${cattleId}`,
  BY_EAR_TAG: (earTag: string) => `/production/ear-tag/${earTag}`,

  // Análisis y estadísticas
  STATISTICS: "/production/statistics",
  ANALYTICS: "/production/analytics",
  TRENDS: "/production/trends",
  COMPARISONS: "/production/comparisons",
  RECOMMENDATIONS: "/production/recommendations",

  // Reportes
  DAILY_REPORT: "/production/reports/daily",
  MONTHLY_REPORT: "/production/reports/monthly",
  ANNUAL_REPORT: "/production/reports/annual",
  EXPORT: "/production/export",

  // Reproducción
  REPRODUCTION_EVENTS: "/production/reproduction",
  BREEDING_CALENDAR: "/production/breeding/calendar",
  PREGNANCY_STATUS: "/production/pregnancy/status",
  CALVING_SCHEDULE: "/production/calving/schedule",
} as const;

// Servicio principal para gestión de producción ganadera
export class ProductionService {
  private static instance: ProductionService;
  private cache: Map<string, any> = new Map();
  private cacheTimeout: number = 5 * 60 * 1000; // 5 minutos

  // Singleton pattern
  public static getInstance(): ProductionService {
    if (!ProductionService.instance) {
      ProductionService.instance = new ProductionService();
    }
    return ProductionService.instance;
  }

  // ============================================================================
  // GESTIÓN DE CACHÉ
  // ============================================================================

  private getCacheKey(endpoint: string, params?: any): string {
    return `${endpoint}_${JSON.stringify(params || {})}`;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  private clearCache(): void {
    this.cache.clear();
    console.log("🧹 Caché de producción limpiado");
  }

  // ============================================================================
  // REGISTROS DE PRODUCCIÓN GENERAL
  // ============================================================================

  // Obtener todos los registros de producción
  public async getProductionRecords(filters?: {
    cattleId?: string;
    productionType?: ProductionType;
    dateRange?: DateRange;
    location?: string;
  }): Promise<ProductionRecord[]> {
    try {
      const cacheKey = this.getCacheKey(
        PRODUCTION_ENDPOINTS.LIST_PRODUCTION,
        filters
      );
      const cachedData = this.getCache(cacheKey);

      if (cachedData) {
        console.log("📦 Registros de producción obtenidos del caché");
        return cachedData;
      }

      console.log("📊 Obteniendo registros de producción...");

      const response = await api.get<ProductionRecord[]>(
        PRODUCTION_ENDPOINTS.LIST_PRODUCTION,
        { params: filters }
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo registros de producción");
      }

      this.setCache(cacheKey, response.data);
      console.log(
        `✅ ${response.data.length} registros de producción obtenidos`
      );
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo registros de producción:", error);
      throw error;
    }
  }

  // Crear nuevo registro de producción
  public async createProductionRecord(
    recordData: Omit<ProductionRecord, "id" | "createdAt" | "updatedAt">
  ): Promise<ProductionRecord> {
    try {
      console.log("📝 Creando nuevo registro de producción...");

      // Agregar ubicación actual si no se especifica
      if (!recordData.location.latitude || !recordData.location.longitude) {
        recordData.location = await this.getCurrentLocation();
      }

      const response = await api.post<ProductionRecord>(
        PRODUCTION_ENDPOINTS.CREATE_PRODUCTION,
        recordData
      );

      if (!response.success || !response.data) {
        throw new Error("Error creando registro de producción");
      }

      this.clearCache(); // Limpiar caché después de crear
      console.log("✅ Registro de producción creado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error creando registro de producción:", error);
      throw error;
    }
  }

  // Actualizar registro de producción
  public async updateProductionRecord(
    id: string,
    updates: Partial<ProductionRecord>
  ): Promise<ProductionRecord> {
    try {
      console.log(`📝 Actualizando registro de producción: ${id}`);

      const response = await api.put<ProductionRecord>(
        PRODUCTION_ENDPOINTS.UPDATE_PRODUCTION(id),
        updates
      );

      if (!response.success || !response.data) {
        throw new Error("Error actualizando registro de producción");
      }

      this.clearCache();
      console.log("✅ Registro de producción actualizado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error actualizando registro de producción:", error);
      throw error;
    }
  }

  // ============================================================================
  // PRODUCCIÓN LÁCTEA
  // ============================================================================

  // Registrar producción de leche
  public async recordMilkProduction(
    milkData: Omit<MilkProduction, "id" | "createdAt" | "updatedAt">
  ): Promise<MilkProduction> {
    try {
      console.log(
        `🥛 Registrando producción de leche para: ${milkData.earTag}`
      );

      const response = await api.post<MilkProduction>(
        PRODUCTION_ENDPOINTS.MILK_PRODUCTION,
        milkData
      );

      if (!response.success || !response.data) {
        throw new Error("Error registrando producción de leche");
      }

      this.clearCache();
      console.log("✅ Producción de leche registrada exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error registrando producción de leche:", error);
      throw error;
    }
  }

  // Obtener producción láctea por ganado
  public async getMilkProductionByCattle(
    cattleId: string,
    dateRange?: DateRange
  ): Promise<MilkProduction[]> {
    try {
      console.log(`🥛 Obteniendo producción láctea para ganado: ${cattleId}`);

      const response = await api.get<MilkProduction[]>(
        `${PRODUCTION_ENDPOINTS.MILK_PRODUCTION}/cattle/${cattleId}`,
        { params: dateRange }
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo producción láctea");
      }

      console.log(`✅ ${response.data.length} registros lácteos obtenidos`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo producción láctea:", error);
      throw error;
    }
  }

  // ============================================================================
  // PRODUCCIÓN CÁRNICA
  // ============================================================================

  // Registrar producción de carne
  public async recordMeatProduction(
    meatData: Omit<MeatProduction, "id" | "createdAt" | "updatedAt">
  ): Promise<MeatProduction> {
    try {
      console.log(
        `🥩 Registrando producción de carne para: ${meatData.earTag}`
      );

      const response = await api.post<MeatProduction>(
        PRODUCTION_ENDPOINTS.MEAT_PRODUCTION,
        meatData
      );

      if (!response.success || !response.data) {
        throw new Error("Error registrando producción de carne");
      }

      this.clearCache();
      console.log("✅ Producción de carne registrada exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error registrando producción de carne:", error);
      throw error;
    }
  }

  // ============================================================================
  // GESTIÓN REPRODUCTIVA
  // ============================================================================

  // Registrar evento reproductivo
  public async recordReproductionEvent(
    eventData: Omit<ReproductionRecord, "id" | "createdAt">
  ): Promise<ReproductionRecord> {
    try {
      console.log(`🐄 Registrando evento reproductivo: ${eventData.eventType}`);

      // Agregar ubicación actual si no se especifica
      if (!eventData.location.latitude || !eventData.location.longitude) {
        eventData.location = await this.getCurrentLocation();
      }

      const response = await api.post<ReproductionRecord>(
        PRODUCTION_ENDPOINTS.REPRODUCTION_EVENTS,
        eventData
      );

      if (!response.success || !response.data) {
        throw new Error("Error registrando evento reproductivo");
      }

      this.clearCache();
      console.log("✅ Evento reproductivo registrado exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error registrando evento reproductivo:", error);
      throw error;
    }
  }

  // Obtener calendario de reproducción
  public async getBreedingCalendar(
    dateRange: DateRange
  ): Promise<ReproductionRecord[]> {
    try {
      console.log("📅 Obteniendo calendario de reproducción...");

      const response = await api.get<ReproductionRecord[]>(
        PRODUCTION_ENDPOINTS.BREEDING_CALENDAR,
        { params: dateRange }
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo calendario de reproducción");
      }

      console.log(`✅ ${response.data.length} eventos reproductivos obtenidos`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo calendario de reproducción:", error);
      throw error;
    }
  }

  // ============================================================================
  // ANÁLISIS Y ESTADÍSTICAS
  // ============================================================================

  // Obtener estadísticas de producción
  public async getProductionStatistics(filters?: {
    dateRange?: DateRange;
    cattleIds?: string[];
    productionType?: ProductionType;
  }): Promise<ProductionStatistics> {
    try {
      console.log("📊 Obteniendo estadísticas de producción...");

      const response = await api.get<ProductionStatistics>(
        PRODUCTION_ENDPOINTS.STATISTICS,
        { params: filters }
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo estadísticas de producción");
      }

      console.log("✅ Estadísticas de producción obtenidas");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo estadísticas de producción:", error);
      throw error;
    }
  }

  // Obtener análisis completo de producción
  public async getProductionAnalytics(
    period: DateRange,
    includeComparisons: boolean = true
  ): Promise<ProductionAnalytics> {
    try {
      console.log("📈 Obteniendo análisis de producción...");

      const response = await api.get<ProductionAnalytics>(
        PRODUCTION_ENDPOINTS.ANALYTICS,
        {
          params: {
            ...period,
            includeComparisons,
          },
        }
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo análisis de producción");
      }

      console.log("✅ Análisis de producción obtenido");
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo análisis de producción:", error);
      throw error;
    }
  }

  // Obtener recomendaciones de mejora
  public async getProductionRecommendations(
    cattleId?: string
  ): Promise<ProductionRecommendation[]> {
    try {
      console.log("💡 Obteniendo recomendaciones de producción...");

      const response = await api.get<ProductionRecommendation[]>(
        PRODUCTION_ENDPOINTS.RECOMMENDATIONS,
        { params: { cattleId } }
      );

      if (!response.success || !response.data) {
        throw new Error("Error obteniendo recomendaciones");
      }

      console.log(`✅ ${response.data.length} recomendaciones obtenidas`);
      return response.data;
    } catch (error) {
      console.error("❌ Error obteniendo recomendaciones:", error);
      throw error;
    }
  }

  // ============================================================================
  // REPORTES Y EXPORTACIÓN
  // ============================================================================

  // Generar reporte diario
  public async generateDailyReport(date: string): Promise<Blob> {
    try {
      console.log(`📄 Generando reporte diario para: ${date}`);

      const response = await api.get(PRODUCTION_ENDPOINTS.DAILY_REPORT, {
        params: { date },
        responseType: "blob",
      });

      console.log("✅ Reporte diario generado");
      return response.data;
    } catch (error) {
      console.error("❌ Error generando reporte diario:", error);
      throw error;
    }
  }

  // Exportar datos de producción
  public async exportProductionData(
    format: "csv" | "excel" | "pdf",
    filters?: any
  ): Promise<Blob> {
    try {
      console.log(`📤 Exportando datos de producción en formato: ${format}`);

      const response = await api.post(
        PRODUCTION_ENDPOINTS.EXPORT,
        { format, filters },
        { responseType: "blob" }
      );

      console.log("✅ Datos exportados exitosamente");
      return response.data;
    } catch (error) {
      console.error("❌ Error exportando datos:", error);
      throw error;
    }
  }

  // ============================================================================
  // MÉTODOS AUXILIARES
  // ============================================================================

  // Obtener ubicación actual (método privado)
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

  // Validar datos de producción
  public validateProductionData(data: Partial<ProductionRecord>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.cattleId) {
      errors.push("ID de ganado es requerido");
    }

    if (!data.earTag) {
      errors.push("Arete es requerido");
    }

    if (!data.quantity || data.quantity <= 0) {
      errors.push("Cantidad debe ser mayor a cero");
    }

    if (!data.productionType) {
      errors.push("Tipo de producción es requerido");
    }

    if (!data.date) {
      errors.push("Fecha es requerida");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Calcular métricas de rendimiento
  public calculatePerformanceMetrics(records: ProductionRecord[]): {
    totalProduction: number;
    averageDaily: number;
    efficiency: number;
    trend: "up" | "down" | "stable";
  } {
    if (records.length === 0) {
      return {
        totalProduction: 0,
        averageDaily: 0,
        efficiency: 0,
        trend: "stable",
      };
    }

    const totalProduction = records.reduce(
      (sum, record) => sum + record.quantity,
      0
    );
    const averageDaily = totalProduction / records.length;

    // Calcular tendencia comparando primera y segunda mitad
    const midPoint = Math.floor(records.length / 2);
    const firstHalf = records.slice(0, midPoint);
    const secondHalf = records.slice(midPoint);

    const firstHalfAvg =
      firstHalf.reduce((sum, r) => sum + r.quantity, 0) / firstHalf.length;
    const secondHalfAvg =
      secondHalf.reduce((sum, r) => sum + r.quantity, 0) / secondHalf.length;

    let trend: "up" | "down" | "stable" = "stable";
    const changePercent = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    if (changePercent > 5) trend = "up";
    else if (changePercent < -5) trend = "down";

    return {
      totalProduction,
      averageDaily,
      efficiency: averageDaily / records.length, // Métrica simple de eficiencia
      trend,
    };
  }
}

// Exportar instancia singleton
export const productionService = ProductionService.getInstance();

// Exportar tipos principales
export type {
  ProductionRecord,
  MilkProduction,
  MeatProduction,
  ReproductionRecord,
  ProductionStatistics,
  ProductionAnalytics,
  ProductionRecommendation,
};

export {
  ProductionType,
  ProductionUnit,
  QualityGrade,
  MeatGrade,
  ReproductionEventType,
  CalvingDifficulty,
  RecommendationType,
};
