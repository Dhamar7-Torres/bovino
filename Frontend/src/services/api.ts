import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";

// ========================================
// CONFIGURACIÓN DE LA API PARA PUERTO 5000
// ========================================

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000',
  VERSION: '', 
  TIMEOUT: 30000, // 30 segundos
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  ENDPOINTS: {
    // Endpoints de salud
    HEALTH: '/api/health',
    
    // Endpoints de reproducción
    PREGNANCY_TRACKING: '/api/reproduction/pregnancy-tracking',
    PREGNANCY_CHECK: '/api/reproduction/pregnancy-check',
    
    // Endpoints de usuarios
    VETERINARIANS: '/api/users/veterinarians',
    
    // Endpoints de inventario
    INVENTORY_DASHBOARD: '/api/inventory/dashboard',
    INVENTORY_REPORTS: '/api/inventory/reports',
    
    // Endpoints de eventos
    PREGNANCY_EVENTS: '/api/events/pregnancy-check',
    BIRTH_EVENTS: '/api/events/birth',
  }
};

// Tipos para manejo de respuestas de la API
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    currentPage?: number;
  };
}

// Tipo para errores de la API
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  field?: string;
  error?: string;
  errorCode?: string;
}

// Tipo para configuración de upload con progreso
export interface UploadConfig extends AxiosRequestConfig {
  onProgress?: (progressEvent: ProgressEvent) => void;
}

// Configuración para requests con geolocalización
export interface GeoLocationConfig {
  includeLocation?: boolean;
  highAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

// Interfaz para datos de ubicación
export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

// Clase principal para el cliente API
class ApiClient {
  private instance: AxiosInstance;
  private authToken: string | null = null;
  private isConnected: boolean = false;

  constructor() {
    // Cargar token desde localStorage al inicializar
    this.loadAuthToken();

    // Crear instancia de axios con configuración base
    this.instance = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.DEFAULT_HEADERS,
    });

    // Configurar interceptores
    this.setupInterceptors();
  }

  // Cargar token de autenticación desde localStorage
  private loadAuthToken(): void {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('authToken');
    if (token) {
      this.authToken = token;
    }
  }

  // Configuración de interceptores para requests y responses
  private setupInterceptors(): void {
    // Interceptor de request - agregar token de autenticación y geolocalización
    this.instance.interceptors.request.use(
      async (config) => {
        // Agregar token de autenticación si existe
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }

        // Agregar timestamp para evitar cache
        config.headers["X-Request-Time"] = Date.now().toString();

        // Agregar información de dispositivo para analytics
        config.headers["X-Device-Type"] = this.getDeviceType();

        // Agregar información de zona horaria
        config.headers["X-Timezone"] = Intl.DateTimeFormat().resolvedOptions().timeZone;

        console.log(
          `🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
        return config;
      },
      (error) => {
        console.error("❌ Error en request interceptor:", error);
        return Promise.reject(error);
      }
    );

    // Interceptor de response - manejo de errores y formato de respuesta
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        console.log(
          `✅ API Response: ${response.status} ${response.config.url}`
        );
        this.isConnected = true;
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        console.error(
          `❌ API Error: ${error.response?.status || 'Network'} ${error.config?.url}`
        );

        // Marcar como desconectado si es un error de red
        if (!error.response) {
          this.isConnected = false;
        }

        // Manejar errores de autenticación
        if (error.response?.status === 401) {
          await this.handleUnauthorized();
        }

        // Manejar errores de red
        if (!error.response) {
          throw new Error("Error de conexión - Verifique que el backend esté ejecutándose en puerto 5000");
        }

        // Formatear mensaje de error basado en la respuesta del backend
        const errorData = error.response.data;
        let errorMessage = "Error inesperado en el servidor";

        if (errorData) {
          errorMessage = errorData.message || 
                        errorData.error || 
                        `Error HTTP ${error.response.status}`;
        }

        // Crear error personalizado con información adicional
        const customError = new Error(errorMessage) as any;
        customError.status = error.response.status;
        customError.code = errorData?.code || errorData?.errorCode;
        customError.details = errorData?.details;

        throw customError;
      }
    );
  }

  // Detectar tipo de dispositivo para analytics
  private getDeviceType(): string {
    const userAgent = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "tablet";
    if (
      /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
        userAgent
      )
    )
      return "mobile";
    return "desktop";
  }

  // Manejar token de autenticación expirado
  private async handleUnauthorized(): Promise<void> {
    this.authToken = null;
    localStorage.removeItem("authToken");
    localStorage.removeItem("auth_token");

    // Emitir evento para que la app maneje el logout
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }

  // Establecer token de autenticación
  public setAuthToken(token: string | null): void {
    this.authToken = token;
    if (token) {
      localStorage.setItem("auth_token", token);
      localStorage.setItem("authToken", token); // Compatibilidad
    } else {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("authToken");
    }
  }

  // Obtener token actual
  public getAuthToken(): string | null {
    return this.authToken;
  }

  // Verificar si está conectado
  public isApiConnected(): boolean {
    return this.isConnected;
  }

  // Obtener geolocalización actual del usuario
  private async getCurrentPosition(
    options?: GeoLocationConfig
  ): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocalización no soportada en este dispositivo"));
        return;
      }

      const defaultOptions: PositionOptions = {
        enableHighAccuracy: options?.highAccuracy ?? true,
        timeout: options?.timeout ?? 10000,
        maximumAge: options?.maximumAge ?? 60000,
      };

      navigator.geolocation.getCurrentPosition(
        resolve,
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
              message = "Tiempo de espera agotado obteniendo ubicación";
              break;
          }
          reject(new Error(message));
        },
        defaultOptions
      );
    });
  }

  // Agregar coordenadas de geolocalización a los datos del request
  private async addLocationToData(
    data: any,
    config?: GeoLocationConfig
  ): Promise<any> {
    if (!config?.includeLocation) return data;

    try {
      const position = await this.getCurrentPosition(config);
      return {
        ...data,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        } as LocationData,
      };
    } catch (error) {
      console.warn("⚠️ No se pudo obtener ubicación:", error);
      return data;
    }
  }

  // Método GET
  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Método POST con soporte para geolocalización
  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & GeoLocationConfig
  ): Promise<ApiResponse<T>> {
    const dataWithLocation = await this.addLocationToData(data, config);
    const response = await this.instance.post<ApiResponse<T>>(
      url,
      dataWithLocation,
      config
    );
    return response.data;
  }

  // Método PUT con soporte para geolocalización
  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & GeoLocationConfig
  ): Promise<ApiResponse<T>> {
    const dataWithLocation = await this.addLocationToData(data, config);
    const response = await this.instance.put<ApiResponse<T>>(
      url,
      dataWithLocation,
      config
    );
    return response.data;
  }

  // Método PATCH
  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(
      url,
      data,
      config
    );
    return response.data;
  }

  // Método DELETE
  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  // Método para upload de archivos con progreso
  public async upload<T = any>(
    url: string,
    file: File,
    fieldName: string = "file",
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    // Agregar datos adicionales al FormData
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(
          key,
          typeof value === "object" ? JSON.stringify(value) : value
        );
      });
    }

    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    };

    const response = await this.instance.post<ApiResponse<T>>(
      url,
      formData,
      config
    );
    return response.data;
  }

  // Método para upload múltiple de archivos
  public async uploadMultiple<T = any>(
    url: string,
    files: File[],
    fieldName: string = "files",
    onProgress?: (progress: number) => void,
    additionalData?: Record<string, any>
  ): Promise<ApiResponse<T>> {
    const formData = new FormData();
    
    // Agregar todos los archivos
    files.forEach((file, index) => {
      formData.append(`${fieldName}[${index}]`, file);
    });

    // Agregar datos adicionales
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(
          key,
          typeof value === "object" ? JSON.stringify(value) : value
        );
      });
    }

    const config: AxiosRequestConfig = {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    };

    const response = await this.instance.post<ApiResponse<T>>(
      url,
      formData,
      config
    );
    return response.data;
  }

  // Método para download de archivos
  public async download(
    url: string,
    filename?: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const config: AxiosRequestConfig = {
      responseType: "blob",
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    };

    const response = await this.instance.get(url, config);

    // Crear enlace de descarga
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  // Método para múltiples requests en paralelo
  public async parallel<T = any>(
    requests: Array<() => Promise<ApiResponse<T>>>
  ): Promise<ApiResponse<T>[]> {
    try {
      const results = await Promise.all(requests.map((request) => request()));
      return results;
    } catch (error) {
      console.error("❌ Error en requests paralelos:", error);
      throw error;
    }
  }

  // Método para requests con reintentos automáticos
  public async retry<T = any>(
    requestFn: () => Promise<ApiResponse<T>>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<ApiResponse<T>> {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Intento ${attempt}/${maxRetries} falló:`, error);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        }
      }
    }

    throw lastError!;
  }

  // Método para verificar estado de conexión con el backend
  public async healthCheck(): Promise<boolean> {
    try {
      await this.get(API_CONFIG.ENDPOINTS.HEALTH);
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error("❌ Health check falló:", error);
      this.isConnected = false;
      return false;
    }
  }

  // Método para test de conectividad simple (compatible con el código anterior)
  public async testConnection(): Promise<boolean> {
    return this.healthCheck();
  }

  // Método para configurar headers personalizados
  public setDefaultHeader(key: string, value: string): void {
    this.instance.defaults.headers.common[key] = value;
  }

  // Método para remover headers
  public removeDefaultHeader(key: string): void {
    delete this.instance.defaults.headers.common[key];
  }

  // Método para cambiar la URL base (útil para diferentes entornos)
  public setBaseURL(baseURL: string): void {
    this.instance.defaults.baseURL = baseURL;
  }

  // Método para obtener la configuración actual
  public getConfig() {
    return {
      baseURL: this.instance.defaults.baseURL,
      timeout: this.instance.defaults.timeout,
      headers: this.instance.defaults.headers,
      isConnected: this.isConnected,
      hasAuthToken: !!this.authToken,
    };
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();

// ========================================
// SERVICIOS ESPECÍFICOS DEL BACKEND
// ========================================

// Servicio para embarazos/pregnancy tracking
export const pregnancyService = {
  // Obtener todas las gestaciones
  getAll: (filters?: {
    search?: string;
    status?: string;
    trimester?: string;
    veterinarianId?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get(API_CONFIG.ENDPOINTS.PREGNANCY_TRACKING, { params: filters }),

  // Obtener una gestación específica
  getById: (id: string) => apiClient.get(`${API_CONFIG.ENDPOINTS.PREGNANCY_TRACKING}/${id}`),

  // Crear chequeo de embarazo
  createCheck: (data: {
    femaleId: string;
    examDate: string;
    method: string;
    result: string;
    gestationAge?: number;
    expectedCalvingDate?: string;
    veterinarianId: string;
    notes?: string;
  }) => apiClient.post(API_CONFIG.ENDPOINTS.PREGNANCY_CHECK, data),

  // Actualizar gestación
  update: (id: string, data: any) => 
    apiClient.put(`${API_CONFIG.ENDPOINTS.PREGNANCY_TRACKING}/${id}`, data),

  // Eliminar gestación
  delete: (id: string) => 
    apiClient.delete(`${API_CONFIG.ENDPOINTS.PREGNANCY_TRACKING}/${id}`),
};

// Servicio para veterinarios
export const veterinarianService = {
  getAll: () => apiClient.get(API_CONFIG.ENDPOINTS.VETERINARIANS),
  getById: (id: string) => apiClient.get(`${API_CONFIG.ENDPOINTS.VETERINARIANS}/${id}`),
};

// Servicio para inventario
export const inventoryService = {
  getDashboard: (timeRange?: string) => 
    apiClient.get(API_CONFIG.ENDPOINTS.INVENTORY_DASHBOARD, { 
      params: { timeRange } 
    }),
  getReports: (filters?: any) => 
    apiClient.get(API_CONFIG.ENDPOINTS.INVENTORY_REPORTS, { 
      params: filters 
    }),
};

// Helper functions para uso común (compatibilidad con código anterior)
export const api = {
  // Métodos básicos
  get: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.get<T>(url, config),

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & GeoLocationConfig
  ) => apiClient.post<T>(url, data, config),

  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig & GeoLocationConfig
  ) => apiClient.put<T>(url, data, config),

  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
    apiClient.patch<T>(url, data, config),

  delete: <T = any>(url: string, config?: AxiosRequestConfig) =>
    apiClient.delete<T>(url, config),

  // Métodos especializados
  upload: apiClient.upload.bind(apiClient),
  uploadMultiple: apiClient.uploadMultiple.bind(apiClient),
  download: apiClient.download.bind(apiClient),
  parallel: apiClient.parallel.bind(apiClient),
  retry: apiClient.retry.bind(apiClient),
  healthCheck: apiClient.healthCheck.bind(apiClient),
  testConnection: apiClient.testConnection.bind(apiClient),

  // Configuración
  setAuthToken: apiClient.setAuthToken.bind(apiClient),
  getAuthToken: apiClient.getAuthToken.bind(apiClient),
  setDefaultHeader: apiClient.setDefaultHeader.bind(apiClient),
  removeDefaultHeader: apiClient.removeDefaultHeader.bind(apiClient),
  setBaseURL: apiClient.setBaseURL.bind(apiClient),
  getConfig: apiClient.getConfig.bind(apiClient),
  isConnected: apiClient.isApiConnected.bind(apiClient),

  // Servicios específicos
  pregnancy: pregnancyService,
  veterinarians: veterinarianService,
  inventory: inventoryService,
};

// ========================================
// CONSTANTES Y CONFIGURACIÓN EXPORTADA
// ========================================

export { API_CONFIG };
export default apiClient;

// ========================================
// UTILIDADES ADICIONALES
// ========================================

// Hook para React (si se usa en un contexto de React)
export const useApiClient = () => {
  return {
    client: apiClient,
    isConnected: apiClient.isApiConnected(),
    config: apiClient.getConfig(),
    services: {
      pregnancy: pregnancyService,
      veterinarians: veterinarianService,
      inventory: inventoryService,
    }
  };
};

// Función para configurar el cliente en diferentes entornos
export const configureApiClient = (config: {
  baseURL?: string;
  timeout?: number;
  authToken?: string;
  defaultHeaders?: Record<string, string>;
}) => {
  if (config.baseURL) {
    apiClient.setBaseURL(config.baseURL);
  }

  if (config.authToken) {
    apiClient.setAuthToken(config.authToken);
  }

  if (config.defaultHeaders) {
    Object.entries(config.defaultHeaders).forEach(([key, value]) => {
      apiClient.setDefaultHeader(key, value);
    });
  }

  return apiClient;
};