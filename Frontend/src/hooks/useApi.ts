import { useState, useCallback, useRef, useEffect } from "react";
import axios, {
  AxiosRequestConfig,
  AxiosResponse,
  CancelTokenSource,
} from "axios";

// Tipos para el estado de la API
export interface ApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  status?: number;
}

// Tipos para errores de API
export interface ApiError {
  code: string;
  message: string;
  status?: number;
  details?: any;
}

// Tipos para respuesta de API
export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

// Configuración de headers por defecto
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// URLs base para diferentes entornos
const getBaseURL = (): string => {
  const env = import.meta.env?.MODE || "development";

  if (env === "production") {
    return import.meta.env?.VITE_API_URL || "https://api.bovinecare.com";
  }

  return import.meta.env?.VITE_API_URL || "http://localhost:3001";
};

// Configuración de axios
const apiClient = axios.create({
  baseURL: `${getBaseURL()}/api/v1`,
  timeout: 30000, // 30 segundos
  headers: DEFAULT_HEADERS,
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    // Obtener token del localStorage si existe
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas y errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Manejo de token expirado
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      // Redireccionar al login si es necesario
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Hook principal para llamadas a la API
export const useApi = <T = any>() => {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  // Referencia para cancelar peticiones
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  // Función para crear error personalizado
  const createApiError = useCallback((error: any): ApiError => {
    if (axios.isCancel(error)) {
      return {
        code: "REQUEST_CANCELLED",
        message: "Petición cancelada",
      };
    }

    if (error.response) {
      // Error de respuesta del servidor
      return {
        code: error.response.data?.code || "SERVER_ERROR",
        message: error.response.data?.message || "Error del servidor",
        status: error.response.status,
        details: error.response.data,
      };
    }

    if (error.request) {
      // Error de red
      return {
        code: "NETWORK_ERROR",
        message: "Error de conexión de red",
        details: error.request,
      };
    }

    // Error desconocido
    return {
      code: "UNKNOWN_ERROR",
      message: error.message || "Error desconocido",
      details: error,
    };
  }, []);

  // Función para realizar petición GET
  const get = useCallback(
    async (
      url: string,
      config?: AxiosRequestConfig
    ): Promise<ApiResponse<T> | null> => {
      try {
        // Cancelar petición anterior si existe
        if (cancelTokenRef.current) {
          cancelTokenRef.current.cancel("Nueva petición iniciada");
        }

        // Crear nuevo token de cancelación
        cancelTokenRef.current = axios.CancelToken.source();

        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await apiClient.get<ApiResponse<T>>(url, {
          ...config,
          cancelToken: cancelTokenRef.current.token,
        });

        const responseData = response.data;

        setState({
          data: responseData.data,
          loading: false,
          error: null,
          status: response.status,
        });

        return responseData;
      } catch (error) {
        const apiError = createApiError(error);

        setState((prev) => ({
          ...prev,
          loading: false,
          error: apiError.message,
          status: apiError.status,
        }));

        return null;
      }
    },
    [createApiError]
  );

  // Función para realizar petición POST
  const post = useCallback(
    async (
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<ApiResponse<T> | null> => {
      try {
        if (cancelTokenRef.current) {
          cancelTokenRef.current.cancel("Nueva petición iniciada");
        }

        cancelTokenRef.current = axios.CancelToken.source();

        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await apiClient.post<ApiResponse<T>>(url, data, {
          ...config,
          cancelToken: cancelTokenRef.current.token,
        });

        const responseData = response.data;

        setState({
          data: responseData.data,
          loading: false,
          error: null,
          status: response.status,
        });

        return responseData;
      } catch (error) {
        const apiError = createApiError(error);

        setState((prev) => ({
          ...prev,
          loading: false,
          error: apiError.message,
          status: apiError.status,
        }));

        return null;
      }
    },
    [createApiError]
  );

  // Función para realizar petición PUT
  const put = useCallback(
    async (
      url: string,
      data?: any,
      config?: AxiosRequestConfig
    ): Promise<ApiResponse<T> | null> => {
      try {
        if (cancelTokenRef.current) {
          cancelTokenRef.current.cancel("Nueva petición iniciada");
        }

        cancelTokenRef.current = axios.CancelToken.source();

        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await apiClient.put<ApiResponse<T>>(url, data, {
          ...config,
          cancelToken: cancelTokenRef.current.token,
        });

        const responseData = response.data;

        setState({
          data: responseData.data,
          loading: false,
          error: null,
          status: response.status,
        });

        return responseData;
      } catch (error) {
        const apiError = createApiError(error);

        setState((prev) => ({
          ...prev,
          loading: false,
          error: apiError.message,
          status: apiError.status,
        }));

        return null;
      }
    },
    [createApiError]
  );

  // Función para realizar petición DELETE
  const del = useCallback(
    async (
      url: string,
      config?: AxiosRequestConfig
    ): Promise<ApiResponse<T> | null> => {
      try {
        if (cancelTokenRef.current) {
          cancelTokenRef.current.cancel("Nueva petición iniciada");
        }

        cancelTokenRef.current = axios.CancelToken.source();

        setState((prev) => ({ ...prev, loading: true, error: null }));

        const response = await apiClient.delete<ApiResponse<T>>(url, {
          ...config,
          cancelToken: cancelTokenRef.current.token,
        });

        const responseData = response.data;

        setState({
          data: responseData.data,
          loading: false,
          error: null,
          status: response.status,
        });

        return responseData;
      } catch (error) {
        const apiError = createApiError(error);

        setState((prev) => ({
          ...prev,
          loading: false,
          error: apiError.message,
          status: apiError.status,
        }));

        return null;
      }
    },
    [createApiError]
  );

  // Función para subir archivos
  const upload = useCallback(
    async (
      url: string,
      file: File,
      fieldName: string = "file",
      onProgress?: (progress: number) => void
    ): Promise<ApiResponse<T> | null> => {
      try {
        if (cancelTokenRef.current) {
          cancelTokenRef.current.cancel("Nueva petición iniciada");
        }

        cancelTokenRef.current = axios.CancelToken.source();

        setState((prev) => ({ ...prev, loading: true, error: null }));

        const formData = new FormData();
        formData.append(fieldName, file);

        const response = await apiClient.post<ApiResponse<T>>(url, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          cancelToken: cancelTokenRef.current.token,
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        });

        const responseData = response.data;

        setState({
          data: responseData.data,
          loading: false,
          error: null,
          status: response.status,
        });

        return responseData;
      } catch (error) {
        const apiError = createApiError(error);

        setState((prev) => ({
          ...prev,
          loading: false,
          error: apiError.message,
          status: apiError.status,
        }));

        return null;
      }
    },
    [createApiError]
  );

  // Función para cancelar petición actual
  const cancel = useCallback(() => {
    if (cancelTokenRef.current) {
      cancelTokenRef.current.cancel("Petición cancelada por el usuario");
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, []);

  // Función para resetear el estado
  const reset = useCallback(() => {
    cancel();
    setState({
      data: null,
      loading: false,
      error: null,
    });
  }, [cancel]);

  // Limpiar al desmontar el componente
  useEffect(() => {
    return () => {
      if (cancelTokenRef.current) {
        cancelTokenRef.current.cancel("Componente desmontado");
      }
    };
  }, []);

  return {
    // Estado
    ...state,

    // Funciones CRUD
    get,
    post,
    put,
    delete: del,
    upload,

    // Utilidades
    cancel,
    reset,

    // Cliente axios directo para casos especiales
    client: apiClient,
  };
};

// Hook especializado para operaciones CRUD de bovinos
export const useBovineApi = () => {
  const api = useApi();

  return {
    ...api,

    // Obtener lista de bovinos
    getBovines: (params?: Record<string, any>) =>
      api.get("/cattle", { params }),

    // Obtener bovino por ID
    getBovine: (id: string) => api.get(`/cattle/${id}`),

    // Crear nuevo bovino
    createBovine: (data: any) => api.post("/cattle", data),

    // Actualizar bovino
    updateBovine: (id: string, data: any) => api.put(`/cattle/${id}`, data),

    // Eliminar bovino
    deleteBovine: (id: string) => api.delete(`/cattle/${id}`),

    // Buscar por arete
    getBovineByEarTag: (earTag: string) => api.get(`/cattle/ear-tag/${earTag}`),

    // Subir foto de bovino
    uploadBovinePhoto: (
      bovineId: string,
      file: File,
      onProgress?: (progress: number) => void
    ) => api.upload(`/cattle/${bovineId}/photos`, file, "photo", onProgress),
  };
};

// Hook especializado para vacunaciones
export const useVaccinationApi = () => {
  const api = useApi();

  return {
    ...api,

    // Obtener vacunaciones
    getVaccinations: (params?: Record<string, any>) =>
      api.get("/vaccinations", { params }),

    // Crear vacunación
    createVaccination: (data: any) => api.post("/vaccinations", data),

    // Obtener vacunaciones por bovino
    getVaccinationsByBovine: (bovineId: string) =>
      api.get(`/vaccinations/cattle/${bovineId}`),

    // Obtener próximas vacunaciones
    getUpcomingVaccinations: () => api.get("/vaccinations/upcoming"),

    // Marcar como aplicada
    markVaccinationApplied: (id: string, data: any) =>
      api.put(`/vaccinations/${id}`, data),
  };
};

// Hook especializado para enfermedades
export const useIllnessApi = () => {
  const api = useApi();

  return {
    ...api,

    // Obtener enfermedades
    getIllnesses: (params?: Record<string, any>) =>
      api.get("/illnesses", { params }),

    // Crear diagnóstico
    createIllness: (data: any) => api.post("/illnesses", data),

    // Obtener enfermedades por bovino
    getIllnessesByBovine: (bovineId: string) =>
      api.get(`/illnesses/cattle/${bovineId}`),

    // Marcar como recuperado
    markRecovered: (id: string, data: any) =>
      api.put(`/illnesses/${id}`, { ...data, recoveryDate: new Date() }),

    // Obtener análisis epidemiológico
    getOutbreakAnalysis: () => api.get("/illnesses/outbreak-analysis"),
  };
};

// Hook para reportes
export const useReportsApi = () => {
  const api = useApi();

  return {
    ...api,

    // Reporte de salud general
    getHealthReport: (params?: Record<string, any>) =>
      api.get("/reports/health/overview", { params }),

    // Reporte de cobertura de vacunación
    getVaccinationCoverage: (params?: Record<string, any>) =>
      api.get("/reports/vaccinations/coverage", { params }),

    // Exportar reporte en PDF
    exportToPDF: (reportType: string, params?: Record<string, any>) =>
      api.get(`/reports/export/pdf/${reportType}`, {
        params,
        responseType: "blob",
      }),

    // Exportar reporte en Excel
    exportToExcel: (reportType: string, params?: Record<string, any>) =>
      api.get(`/reports/export/excel/${reportType}`, {
        params,
        responseType: "blob",
      }),
  };
};

export default useApi;
