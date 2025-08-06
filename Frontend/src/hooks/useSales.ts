// =================================================================
// ARCHIVO: src/hooks/useSales.ts
// =================================================================
// Hooks personalizados para gestión de eventos de ventas
// Adaptado a la estructura de servicios existente

import { useState, useEffect, useCallback } from 'react';
import salesService, { SalesFilters, SalesEvent } from '../services/salesService';

// =================================================================
// INTERFACE PARA ESTADOS DE API
// =================================================================

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
  refetch: () => Promise<void>;
}

// =================================================================
// HOOK GENÉRICO PARA LLAMADAS A LA API
// =================================================================

function useApiCall<T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = []
): UseApiReturn<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.message || 'Error desconocido'
      });
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    ...state,
    refetch: fetchData,
  };
}

// =================================================================
// HOOKS ESPECÍFICOS PARA VENTAS
// =================================================================

/**
 * Hook para obtener eventos de ventas con filtros
 */
export function useSalesEvents(filters: SalesFilters = {}) {
  return useApiCall(
    () => salesService.getSalesEvents(filters),
    [JSON.stringify(filters)]
  );
}

/**
 * Hook para obtener un evento de venta específico por ID
 */
export function useSalesEvent(id: string) {
  return useApiCall(
    () => salesService.getSalesEventById(id),
    [id]
  );
}

/**
 * Hook para obtener estadísticas de ventas
 */
export function useSalesStatistics(filters?: {
  startDate?: string;
  endDate?: string;
  ranchId?: string;
}) {
  return useApiCall(
    () => salesService.getSalesStatistics(filters),
    [JSON.stringify(filters)]
  );
}

/**
 * Hook para obtener compradores frecuentes
 */
export function useFrequentBuyers(limit: number = 10) {
  return useApiCall(
    () => salesService.getFrequentBuyers(limit),
    [limit]
  );
}

// =================================================================
// HOOKS PARA OPERACIONES CRUD
// =================================================================

/**
 * Hook para operaciones CRUD de eventos de ventas
 */
export function useSalesOperations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSalesEvent = async (salesData: Omit<SalesEvent, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesService.createSalesEvent(salesData);
      setLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const updateSalesEvent = async (id: string, salesData: Partial<SalesEvent>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesService.updateSalesEvent(id, salesData);
      setLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const deleteSalesEvent = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesService.deleteSalesEvent(id);
      setLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const markPaymentAsCompleted = async (salesEventId: string, paymentDetails?: {
    paymentDate?: string;
    transactionId?: string;
    notes?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesService.markPaymentAsCompleted(salesEventId, paymentDetails);
      setLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const uploadDocuments = async (salesEventId: string, files: File[]) => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesService.uploadSalesDocuments(salesEventId, files);
      setLoading(false);
      return response;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const downloadReport = async (filters?: SalesFilters) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await salesService.downloadSalesReport(filters);
      setLoading(false);
      return blob;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return {
    loading,
    error,
    createSalesEvent,
    updateSalesEvent,
    deleteSalesEvent,
    markPaymentAsCompleted,
    uploadDocuments,
    downloadReport,
    clearError: () => setError(null)
  };
}

// =================================================================
// HOOKS PARA VALIDACIONES
// =================================================================

/**
 * Hook para validar datos de bovinos antes de la venta
 */
export function useBovineValidation() {
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  const validateBovine = async (bovineId: string) => {
    setLoading(true);
    try {
      const response = await salesService.validateBovineForSale(bovineId);
      setValidationResult(response.data);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const calculateSuggestedPrice = async (bovineData: {
    weight: number;
    breed?: string;
    age?: number;
    qualityGrade?: string;
  }) => {
    setLoading(true);
    try {
      const response = await salesService.calculateSuggestedPrice(bovineData);
      setLoading(false);
      return response.data;
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  return {
    loading,
    validationResult,
    validateBovine,
    calculateSuggestedPrice,
    clearValidation: () => setValidationResult(null)
  };
}

// =================================================================
// HOOK PARA CONEXIÓN Y CONFIGURACIÓN
// =================================================================

/**
 * Hook para probar la conexión del servicio de ventas
 */
export function useSalesConnection() {
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    testing: boolean;
    config: any;
  }>({
    isConnected: false,
    testing: false,
    config: null
  });

  const testConnection = async () => {
    setConnectionStatus(prev => ({ ...prev, testing: true }));
    try {
      const isConnected = await salesService.testConnection();
      const config = salesService.getConfig();
      setConnectionStatus({
        isConnected,
        testing: false,
        config
      });
      return isConnected;
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        testing: false,
        config: null
      });
      return false;
    }
  };

  useEffect(() => {
    // Probar conexión al montar el hook
    testConnection();
  }, []);

  return {
    ...connectionStatus,
    testConnection
  };
}

// =================================================================
// HOOK PARA MANEJO DE FORMULARIOS
// =================================================================

/**
 * Hook para manejar formularios de eventos de ventas
 */
export function useSalesForm(initialData?: Partial<SalesEvent>) {
  const [formData, setFormData] = useState<Partial<SalesEvent>>(initialData || {
    bovineId: "",
    bovineName: "",
    buyerId: "",
    buyerName: "",
    buyerContact: "",
    saleDate: new Date().toISOString().split("T")[0],
    salePrice: 0,
    weight: 0,
    pricePerKg: 0,
    location: {
      lat: 17.9995,
      lng: -92.9476,
      address: "Villahermosa, Tabasco, México",
    },
    deliveryMethod: "pickup",
    healthCertificate: false,
    qualityGrade: "",
    documents: [],
    notes: "",
    paymentMethod: "cash",
    paymentStatus: "pending",
    commission: 0,
    deliveryDate: "",
    contractType: "direct",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error del campo si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const validateForm = () => {
    const validation = salesService.validateSalesEventData(formData);
    
    if (!validation.isValid) {
      const newErrors: Record<string, string> = {};
      validation.errors.forEach((error, index) => {
        newErrors[`error_${index}`] = error;
      });
      setErrors(newErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const resetForm = () => {
    setFormData(initialData || {});
    setErrors({});
  };

  // Calcular precio por kg automáticamente
  useEffect(() => {
    if (formData.salePrice && formData.weight && formData.weight > 0) {
      const pricePerKg = formData.salePrice / formData.weight;
      setFormData(prev => ({
        ...prev,
        pricePerKg: Math.round(pricePerKg * 100) / 100
      }));
    }
  }, [formData.salePrice, formData.weight]);

  // Calcular comisión automáticamente (5%)
  useEffect(() => {
    if (formData.salePrice) {
      const commission = formData.salePrice * 0.05;
      setFormData(prev => ({
        ...prev,
        commission: Math.round(commission * 100) / 100
      }));
    }
  }, [formData.salePrice]);

  return {
    formData,
    errors,
    updateField,
    validateForm,
    resetForm,
    setFormData,
    setErrors
  };
}

// =================================================================
// HOOK PARA FILTROS DE BÚSQUEDA
// =================================================================

/**
 * Hook para manejar filtros de búsqueda de eventos de ventas
 */
export function useSalesFilters(initialFilters?: SalesFilters) {
  const [filters, setFilters] = useState<SalesFilters>(initialFilters || {
    search: '',
    paymentStatus: 'all',
    page: 1,
    limit: 50
  });

  const updateFilter = (key: keyof SalesFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Resetear página cuando se cambian otros filtros
      ...(key !== 'page' && { page: 1 })
    }));
  };

  const resetFilters = () => {
    setFilters(initialFilters || {
      search: '',
      paymentStatus: 'all',
      page: 1,
      limit: 50
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.paymentStatus && filters.paymentStatus !== 'all') count++;
    if (filters.contractType) count++;
    if (filters.startDate) count++;
    if (filters.endDate) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    return count;
  };

  return {
    filters,
    updateFilter,
    resetFilters,
    setFilters,
    activeFiltersCount: getActiveFiltersCount()
  };
}

// =================================================================
// EXPORTACIONES POR DEFECTO
// =================================================================

export default {
  useSalesEvents,
  useSalesEvent,
  useSalesStatistics,
  useFrequentBuyers,
  useSalesOperations,
  useBovineValidation,
  useSalesConnection,
  useSalesForm,
  useSalesFilters
};