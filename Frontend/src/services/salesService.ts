// =================================================================
// ARCHIVO: src/services/salesService.ts
// =================================================================
// Servicio para gestión de eventos de ventas de bovinos
// Adaptado a la estructura existente del proyecto

import axios from 'axios';

// =================================================================
// CONFIGURACIÓN DE LA API
// =================================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const API_VERSION = 'v1';
const BASE_ENDPOINT = `${API_BASE_URL}/api/${API_VERSION}/sales`;

// Configurar axios con interceptors
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    const ranchId = localStorage.getItem('selected_ranch_id');
    if (ranchId) {
      config.headers['X-Ranch-ID'] = ranchId;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejo de respuestas
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('❌ Response Error:', error);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/auth/login';
    }
    
    return Promise.reject(error);
  }
);

// =================================================================
// TIPOS E INTERFACES
// =================================================================

export type PaymentStatus = "pending" | "paid" | "overdue";
export type DeliveryMethod = "pickup" | "delivery" | "transport";
export type PaymentMethod = "cash" | "transfer" | "check" | "credit";
export type ContractType = "direct" | "auction" | "contract";

export interface SalesEvent {
  id: string;
  bovineId: string;
  bovineName: string;
  buyerId: string;
  buyerName: string;
  buyerContact: string;
  saleDate: string;
  salePrice: number;
  weight: number;
  pricePerKg: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryMethod: DeliveryMethod;
  healthCertificate: boolean;
  qualityGrade: string;
  documents: string[];
  notes: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  commission: number;
  deliveryDate: string;
  contractType: ContractType;
  createdAt: string;
  updatedAt: string;
}

export interface SalesFilters {
  search?: string;
  paymentStatus?: PaymentStatus | 'all';
  contractType?: ContractType;
  startDate?: string;
  endDate?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SalesStatistics {
  totalSales: number;
  totalRevenue: number;
  pendingCount: number;
  averagePricePerKg: number;
  averageWeight?: number;
  totalCommission?: number;
  salesByMonth?: Array<{
    month: string;
    count: number;
    revenue: number;
  }>;
  topBuyers?: Array<{
    buyerName: string;
    totalPurchases: number;
    totalSpent: number;
  }>;
}

export interface FrequentBuyer {
  buyerId: string;
  buyerName: string;
  buyerContact: string;
  totalPurchases: number;
  totalSpent: number;
  averagePrice: number;
  lastPurchaseDate: string;
}

// =================================================================
// SERVICIO DE VENTAS
// =================================================================

class SalesService {
  
  // =================================================================
  // OPERACIONES CRUD
  // =================================================================

  /**
   * Obtener todos los eventos de ventas con filtros
   */
  async getSalesEvents(filters: SalesFilters = {}): Promise<ApiResponse<SalesEvent[]>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '' && value !== 'all') {
          params.append(key, String(value));
        }
      });
      
      const queryString = params.toString();
      const url = queryString ? `/sales?${queryString}` : '/sales';
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo eventos de ventas:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Obtener evento de venta por ID
   */
  async getSalesEventById(id: string): Promise<ApiResponse<SalesEvent>> {
    try {
      const response = await apiClient.get(`/sales/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo evento de venta:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Crear nuevo evento de venta
   */
  async createSalesEvent(salesData: Omit<SalesEvent, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SalesEvent>> {
    try {
      const response = await apiClient.post('/sales', salesData);
      return response.data;
    } catch (error: any) {
      console.error('Error creando evento de venta:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Actualizar evento de venta
   */
  async updateSalesEvent(id: string, salesData: Partial<SalesEvent>): Promise<ApiResponse<SalesEvent>> {
    try {
      const response = await apiClient.put(`/sales/${id}`, salesData);
      return response.data;
    } catch (error: any) {
      console.error('Error actualizando evento de venta:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Eliminar evento de venta
   */
  async deleteSalesEvent(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await apiClient.delete(`/sales/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error eliminando evento de venta:', error);
      throw this.handleApiError(error);
    }
  }

  // =================================================================
  // ESTADÍSTICAS Y REPORTES
  // =================================================================

  /**
   * Obtener estadísticas de ventas
   */
  async getSalesStatistics(filters?: {
    startDate?: string;
    endDate?: string;
    ranchId?: string;
  }): Promise<ApiResponse<SalesStatistics>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            params.append(key, String(value));
          }
        });
      }
      
      const queryString = params.toString();
      const url = queryString ? `/sales/statistics?${queryString}` : '/sales/statistics';
      
      const response = await apiClient.get(url);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo estadísticas de ventas:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Descargar reporte de ventas en PDF
   */
  async downloadSalesReport(filters?: SalesFilters): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '' && value !== 'all') {
            params.append(key, String(value));
          }
        });
      }
      
      const queryString = params.toString();
      const url = queryString ? `/sales/report?${queryString}` : '/sales/report';
      
      const response = await apiClient.get(url, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf'
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Error descargando reporte de ventas:', error);
      throw this.handleApiError(error);
    }
  }

  // =================================================================
  // OPERACIONES ESPECIALES
  // =================================================================

  /**
   * Marcar pago como completado
   */
  async markPaymentAsCompleted(salesEventId: string, paymentDetails?: {
    paymentDate?: string;
    transactionId?: string;
    notes?: string;
  }): Promise<ApiResponse<SalesEvent>> {
    try {
      const response = await apiClient.patch(`/sales/${salesEventId}/payment/complete`, paymentDetails);
      return response.data;
    } catch (error: any) {
      console.error('Error marcando pago como completado:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Actualizar estado de entrega
   */
  async updateDeliveryStatus(salesEventId: string, deliveryData: {
    status: 'pending' | 'in_transit' | 'delivered' | 'failed';
    deliveryDate?: string;
    notes?: string;
    deliveredBy?: string;
  }): Promise<ApiResponse<SalesEvent>> {
    try {
      const response = await apiClient.patch(`/sales/${salesEventId}/delivery`, deliveryData);
      return response.data;
    } catch (error: any) {
      console.error('Error actualizando estado de entrega:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Subir documentos del evento de venta
   */
  async uploadSalesDocuments(salesEventId: string, files: File[]): Promise<ApiResponse<string[]>> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append(`documents`, file);
      });
      
      const response = await apiClient.post(`/sales/${salesEventId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Error subiendo documentos:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Obtener compradores frecuentes
   */
  async getFrequentBuyers(limit: number = 10): Promise<ApiResponse<FrequentBuyer[]>> {
    try {
      const response = await apiClient.get(`/sales/buyers/frequent?limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Error obteniendo compradores frecuentes:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Duplicar evento de venta
   */
  async duplicateSalesEvent(salesEventId: string, modifications?: Partial<SalesEvent>): Promise<ApiResponse<SalesEvent>> {
    try {
      const response = await apiClient.post(`/sales/${salesEventId}/duplicate`, modifications);
      return response.data;
    } catch (error: any) {
      console.error('Error duplicando evento de venta:', error);
      throw this.handleApiError(error);
    }
  }

  // =================================================================
  // VALIDACIONES
  // =================================================================

  /**
   * Validar datos del bovino antes de la venta
   */
  async validateBovineForSale(bovineId: string): Promise<ApiResponse<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
    estimatedPrice: number;
  }>> {
    try {
      const response = await apiClient.get(`/sales/validate-bovine/${bovineId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error validando bovino para venta:', error);
      throw this.handleApiError(error);
    }
  }

  /**
   * Calcular precio sugerido basado en datos históricos
   */
  async calculateSuggestedPrice(bovineData: {
    weight: number;
    breed?: string;
    age?: number;
    qualityGrade?: string;
  }): Promise<ApiResponse<{
    suggestedPrice: number;
    priceRange: {
      min: number;
      max: number;
    };
    marketAverage: number;
    confidence: number;
  }>> {
    try {
      const response = await apiClient.post('/sales/calculate-price', bovineData);
      return response.data;
    } catch (error: any) {
      console.error('Error calculando precio sugerido:', error);
      throw this.handleApiError(error);
    }
  }

  // =================================================================
  // VALIDACIONES LOCALES
  // =================================================================

  /**
   * Validar datos del evento de ventas antes de enviar
   */
  validateSalesEventData(salesEvent: Partial<SalesEvent>): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!salesEvent.bovineName?.trim()) {
      errors.push('El nombre del bovino es requerido');
    }

    if (!salesEvent.buyerName?.trim()) {
      errors.push('El nombre del comprador es requerido');
    }

    if (!salesEvent.buyerContact?.trim()) {
      errors.push('El contacto del comprador es requerido');
    }

    if (!salesEvent.saleDate) {
      errors.push('La fecha de venta es requerida');
    }

    if (!salesEvent.salePrice || salesEvent.salePrice <= 0) {
      errors.push('El precio de venta debe ser mayor a 0');
    }

    if (!salesEvent.weight || salesEvent.weight <= 0) {
      errors.push('El peso debe ser mayor a 0');
    }

    // Validar email si está en el contacto
    if (salesEvent.buyerContact && salesEvent.buyerContact.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(salesEvent.buyerContact)) {
        errors.push('El formato del email no es válido');
      }
    }

    // Validar teléfono si está en el contacto
    if (salesEvent.buyerContact && salesEvent.buyerContact.match(/^\+?[\d\s\-\(\)]+$/)) {
      if (salesEvent.buyerContact.replace(/[\s\-\(\)\+]/g, '').length < 10) {
        errors.push('El número de teléfono debe tener al menos 10 dígitos');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // =================================================================
  // UTILIDADES
  // =================================================================

  /**
   * Manejo centralizado de errores de API
   */
  private handleApiError(error: any): Error {
    if (error.response) {
      // Error del servidor con respuesta
      const message = error.response.data?.message || 'Error del servidor';
      const status = error.response.status;
      return new Error(`${message} (${status})`);
    } else if (error.request) {
      // Error de red
      return new Error('Error de conexión con el servidor');
    } else {
      // Error de configuración
      return new Error('Error en la configuración de la petición');
    }
  }

  // =================================================================
  // MÉTODOS DE PRUEBA Y DEPURACIÓN
  // =================================================================

  /**
   * Probar conexión con el backend
   */
  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/health`);
      console.log('🔗 Conexión API Sales:', response.data);
      return response.status === 200;
    } catch (error) {
      console.error('❌ Error conectando con API Sales:', error);
      return false;
    }
  }

  /**
   * Obtener información de configuración
   */
  getConfig() {
    return {
      baseUrl: API_BASE_URL,
      version: API_VERSION,
      endpoint: BASE_ENDPOINT,
      hasToken: !!localStorage.getItem('auth_token'),
      hasRanchId: !!localStorage.getItem('selected_ranch_id')
    };
  }
}

// =================================================================
// INSTANCIA SINGLETON DEL SERVICIO
// =================================================================

const salesService = new SalesService();

// =================================================================
// EXPORTACIONES
// =================================================================

export default salesService;

// Exportar también como clase para casos especiales
export { SalesService };

// Exportar métodos individuales para compatibilidad
export const {
  getSalesEvents,
  getSalesEventById,
  createSalesEvent,
  updateSalesEvent,
  deleteSalesEvent,
  getSalesStatistics,
  downloadSalesReport,
  markPaymentAsCompleted,
  updateDeliveryStatus,
  uploadSalesDocuments,
  getFrequentBuyers,
  duplicateSalesEvent,
  validateBovineForSale,
  calculateSuggestedPrice,
  validateSalesEventData,
  testConnection,
  getConfig
} = salesService;