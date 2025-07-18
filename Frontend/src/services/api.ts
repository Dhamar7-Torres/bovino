import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { API_CONFIG } from "../constants/urls";

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
  };
}

// Tipo para errores de la API
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
  field?: string;
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

// Clase principal para el cliente API
class ApiClient {
  private instance: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    // Crear instancia de axios con configuración base
    this.instance = axios.create({
      baseURL: `${API_CONFIG.BASE_URL}/api/${API_CONFIG.VERSION}`,
      timeout: API_CONFIG.TIMEOUT,
      headers: API_CONFIG.DEFAULT_HEADERS,
    });

    // Configurar interceptores
    this.setupInterceptors();
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
        return response;
      },
      async (error: AxiosError<ApiError>) => {
        console.error(
          `❌ API Error: ${error.response?.status} ${error.config?.url}`
        );

        // Manejar errores de autenticación
        if (error.response?.status === 401) {
          await this.handleUnauthorized();
        }

        // Manejar errores de red
        if (!error.response) {
          throw new Error("Error de conexión - Verifique su internet");
        }

        // Formatear mensaje de error
        const errorMessage =
          error.response.data?.message || "Error inesperado en el servidor";

        throw new Error(errorMessage);
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

    // Emitir evento para que la app maneje el logout
    window.dispatchEvent(new CustomEvent("auth:unauthorized"));
  }

  // Establecer token de autenticación
  public setAuthToken(token: string | null): void {
    this.authToken = token;
    if (token) {
      localStorage.setItem("authToken", token);
    } else {
      localStorage.removeItem("authToken");
    }
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
        },
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

  // Método para verificar estado de conexión
  public async healthCheck(): Promise<boolean> {
    try {
      await this.get("/health");
      return true;
    } catch (error) {
      console.error("❌ Health check falló:", error);
      return false;
    }
  }

  // Método para configurar headers personalizados
  public setDefaultHeader(key: string, value: string): void {
    this.instance.defaults.headers.common[key] = value;
  }

  // Método para remover headers
  public removeDefaultHeader(key: string): void {
    delete this.instance.defaults.headers.common[key];
  }
}

// Instancia singleton del cliente API
export const apiClient = new ApiClient();

// Helper functions para uso común
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
  download: apiClient.download.bind(apiClient),
  parallel: apiClient.parallel.bind(apiClient),
  retry: apiClient.retry.bind(apiClient),
  healthCheck: apiClient.healthCheck.bind(apiClient),

  // Configuración
  setAuthToken: apiClient.setAuthToken.bind(apiClient),
  setDefaultHeader: apiClient.setDefaultHeader.bind(apiClient),
  removeDefaultHeader: apiClient.removeDefaultHeader.bind(apiClient),
};

export default apiClient;
