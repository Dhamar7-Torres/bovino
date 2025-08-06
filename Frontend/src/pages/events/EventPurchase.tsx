import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Download,
  Eye,
  Package,
  MapPin,
  X,
  Save,
  Navigation,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

// ============================================================================
// API SERVICE - Comunicación con el backend
// ============================================================================

const API_BASE_URL = "http://localhost:5000/api";

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string>;
  error?: string;
}

class PurchaseApiService {
  private static async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Error in API request to ${endpoint}:`, error);
      throw error;
    }
  }

  // Test de conectividad
  static async ping(): Promise<ApiResponse> {
    return this.makeRequest("/ping");
  }

  // Estado del sistema
  static async health(): Promise<ApiResponse> {
    return this.makeRequest("/health");
  }

  // Registrar compra usando el endpoint de finanzas
  static async recordPurchase(purchaseData: any): Promise<ApiResponse> {
    return this.makeRequest("/finances/purchases/record", {
      method: "POST",
      body: JSON.stringify(purchaseData),
    });
  }

  // Obtener resumen de gastos/compras
  static async getExpenseOverview(params?: {
    period?: string;
    category?: string;
    includeRecurring?: boolean;
    includeBudgetComparison?: boolean;
    sortBy?: string;
  }): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append("period", params.period);
    if (params?.category) searchParams.append("category", params.category);
    if (params?.includeRecurring) searchParams.append("includeRecurring", params.includeRecurring.toString());
    if (params?.includeBudgetComparison) searchParams.append("includeBudgetComparison", params.includeBudgetComparison.toString());
    if (params?.sortBy) searchParams.append("sortBy", params.sortBy);

    const queryString = searchParams.toString();
    return this.makeRequest(`/finances/expenses/overview${queryString ? `?${queryString}` : ""}`);
  }

  // Obtener gastos recurrentes
  static async getRecurringExpenses(params?: {
    status?: string;
    category?: string;
    includeUpcoming?: boolean;
    daysAhead?: string;
  }): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.category) searchParams.append("category", params.category);
    if (params?.includeUpcoming) searchParams.append("includeUpcoming", params.includeUpcoming.toString());
    if (params?.daysAhead) searchParams.append("daysAhead", params.daysAhead);

    const queryString = searchParams.toString();
    return this.makeRequest(`/finances/expenses/recurring${queryString ? `?${queryString}` : ""}`);
  }

  // Crear transacción financiera (compra)
  static async createTransaction(transactionData: any): Promise<ApiResponse> {
    return this.makeRequest("/finances/transactions", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  }

  // Obtener transacciones financieras
  static async getTransactions(params?: {
    type?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.append("type", params.type);
    if (params?.category) searchParams.append("category", params.category);
    if (params?.startDate) searchParams.append("startDate", params.startDate);
    if (params?.endDate) searchParams.append("endDate", params.endDate);
    if (params?.status) searchParams.append("status", params.status);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    return this.makeRequest(`/finances/transactions${queryString ? `?${queryString}` : ""}`);
  }

  // Actualizar transacción
  static async updateTransaction(id: string, updates: any): Promise<ApiResponse> {
    return this.makeRequest(`/finances/transactions/${id}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  // Eliminar transacción
  static async deleteTransaction(id: string): Promise<ApiResponse> {
    return this.makeRequest(`/finances/transactions/${id}`, {
      method: "DELETE",
    });
  }

  // Obtener estadísticas financieras
  static async getFinancialStats(params?: {
    period?: string;
    type?: string;
  }): Promise<ApiResponse> {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append("period", params.period);
    if (params?.type) searchParams.append("type", params.type);

    const queryString = searchParams.toString();
    return this.makeRequest(`/finances/stats${queryString ? `?${queryString}` : ""}`);
  }
}

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface Purchase {
  id: string;
  purchaseCode: string;
  date: Date;
  vendorName: string;
  vendorContact?: string;
  description: string;
  category: PurchaseCategory;
  items: PurchaseItem[];
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  location?: string;
  notes?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PurchaseItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

enum PurchaseCategory {
  FEED = 'feed',
  MEDICATION = 'medication',
  EQUIPMENT = 'equipment',
  SERVICES = 'services',
  MAINTENANCE = 'maintenance',
  UTILITIES = 'utilities',
  OTHER = 'other'
}

enum PaymentMethod {
  CASH = 'cash',
  TRANSFER = 'bank_transfer',
  CHECK = 'check',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card'
}

enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'approved',
  CANCELLED = 'cancelled',
  REFUNDED = 'overdue'
}

interface PurchaseFilters {
  search?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ConnectionState {
  isConnected: boolean;
  connectionStatus: "connected" | "disconnected" | "connecting";
  lastChecked: Date;
}

interface NotificationState {
  id: string;
  type: "success" | "warning" | "error" | "info";
  title: string;
  message: string;
  timestamp: Date;
  autoHide?: boolean;
}

// ============================================================================
// COMPONENTES DE NOTIFICACIÓN
// ============================================================================

const NotificationToast: React.FC<{
  notification: NotificationState;
  onClose: (id: string) => void;
}> = ({ notification, onClose }) => {
  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "error":
        return "bg-red-50 border-red-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  useEffect(() => {
    if (notification.autoHide) {
      const timer = setTimeout(() => {
        onClose(notification.id);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.autoHide, onClose]);

  return (
    <div className={`p-4 rounded-lg border shadow-lg ${getBgColor()} max-w-sm mb-2`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 text-sm">
            {notification.title}
          </h4>
          <p className="text-gray-700 text-sm mt-1">{notification.message}</p>
          <p className="text-gray-500 text-xs mt-2">
            {notification.timestamp.toLocaleTimeString("es-MX")}
          </p>
        </div>
        <button
          onClick={() => onClose(notification.id)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Indicador de conexión
const ConnectionIndicator: React.FC<{
  connection: ConnectionState;
  onTestConnection: () => void;
}> = ({ connection, onTestConnection }) => {
  return (
    <div className="fixed bottom-4 left-4 z-30">
      <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg border border-white/20 flex items-center gap-2">
        {connection.connectionStatus === "connecting" ? (
          <RefreshCw className="w-3 h-3 text-yellow-500 animate-spin" />
        ) : connection.isConnected ? (
          <Wifi className="w-3 h-3 text-green-500" />
        ) : (
          <WifiOff className="w-3 h-3 text-red-500" />
        )}
        
        <span className="text-xs font-medium text-gray-700">
          {connection.connectionStatus === "connecting" 
            ? "Conectando..." 
            : connection.isConnected 
              ? "Backend conectado" 
              : "Sin conexión"
          }
        </span>
        
        <button
          onClick={onTestConnection}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
          disabled={connection.connectionStatus === "connecting"}
        >
          Test
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const EventPurchase: React.FC = () => {
  // Estados principales
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  
  // Estados del modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view');
  
  // Estados de filtros y búsqueda
  const [filters, setFilters] = useState<PurchaseFilters>({
    search: '',
    category: '',
    status: ''
  });
  
  // Estados para el formulario
  const [formData, setFormData] = useState<Partial<Purchase>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  
  // Estados de paginación
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Estados de conexión y notificaciones
  const [connection, setConnection] = useState<ConnectionState>({
    isConnected: false,
    connectionStatus: "disconnected",
    lastChecked: new Date()
  });

  const [notifications, setNotifications] = useState<NotificationState[]>([]);

  // ============================================================================
  // FUNCIONES DE NOTIFICACIÓN Y CONEXIÓN
  // ============================================================================

  const addNotification = (
    notification: Omit<NotificationState, "id" | "timestamp">
  ) => {
    const newNotification: NotificationState = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const testConnection = async (): Promise<boolean> => {
    try {
      setConnection(prev => ({ ...prev, connectionStatus: "connecting" }));
      
      const response = await PurchaseApiService.ping();
      
      if (response.success) {
        setConnection({
          isConnected: true,
          connectionStatus: "connected",
          lastChecked: new Date()
        });
        
        addNotification({
          type: "success",
          title: "Conexión establecida",
          message: "Backend conectado correctamente",
          autoHide: true,
        });
        
        return true;
      } else {
        throw new Error("Ping fallido");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      
      setConnection({
        isConnected: false,
        connectionStatus: "disconnected",
        lastChecked: new Date()
      });
      
      addNotification({
        type: "error",
        title: "Error de conexión",
        message: `No se pudo conectar al backend: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        autoHide: false,
      });
      
      return false;
    }
  };

  // ============================================================================
  // EFECTOS Y HOOKS
  // ============================================================================

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (connection.isConnected) {
      loadPurchases();
    }
  }, [pagination.page, filters, connection.isConnected]);

  const initializeApp = async () => {
    setLoading(true);
    const connected = await testConnection();
    
    if (connected) {
      await loadPurchases();
    } else {
      // Cargar datos de fallback si no hay conexión
      loadFallbackData();
    }
    
    setLoading(false);
  };

  // ============================================================================
  // FUNCIONES DE API
  // ============================================================================

  const loadPurchases = useCallback(async () => {
    if (!connection.isConnected) {
      loadFallbackData();
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Usar el endpoint de transacciones financieras del backend
      const params = {
        type: 'expense', // Las compras son gastos
        category: filters.category || undefined,
        status: filters.status || undefined,
        page: pagination.page,
        limit: pagination.limit
      };

      const response = await PurchaseApiService.getTransactions(params);
      
      if (response.success && response.data) {
        // Transformar los datos del backend al formato de Purchase
        const transactions = response.data.transactions || response.data || [];
        const transformedPurchases = transformBackendTransactions(transactions);
        
        // Aplicar filtro de búsqueda local si existe
        let filteredPurchases = transformedPurchases;
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredPurchases = transformedPurchases.filter(purchase =>
            purchase.purchaseCode.toLowerCase().includes(searchLower) ||
            purchase.vendorName.toLowerCase().includes(searchLower) ||
            purchase.description.toLowerCase().includes(searchLower)
          );
        }

        setPurchases(filteredPurchases);
        
        // Actualizar paginación si está disponible en la respuesta
        if (response.data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: response.data.pagination.total,
            totalPages: response.data.pagination.totalPages
          }));
        }

        addNotification({
          type: "success",
          title: "Datos cargados",
          message: `Se cargaron ${filteredPurchases.length} compras desde el backend`,
          autoHide: true,
        });
        
      } else {
        throw new Error(response.message || 'Error al cargar compras');
      }
      
    } catch (err) {
      console.error('Error loading purchases from backend:', err);
      
      addNotification({
        type: "warning",
        title: "Error de conexión",
        message: "Usando datos locales. Verifique la conexión al backend.",
        autoHide: false,
      });
      
      // Cargar datos de fallback
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, connection.isConnected]);

  const transformBackendTransactions = (transactions: any[]): Purchase[] => {
    return transactions.map((transaction, index) => ({
      id: transaction.id || `fallback-${index}`,
      purchaseCode: transaction.reference || `COMP-${new Date().getFullYear()}-${String(index + 1).padStart(3, '0')}`,
      date: new Date(transaction.date || transaction.createdAt),
      vendorName: transaction.vendor?.name || transaction.description || 'Proveedor desconocido',
      vendorContact: transaction.vendor?.contactInfo?.email || '',
      description: transaction.description || '',
      category: mapBackendCategoryToPurchaseCategory(transaction.category),
      items: transaction.items || [],
      totalAmount: transaction.amount || 0,
      currency: transaction.currency || 'MXN',
      paymentMethod: mapBackendPaymentMethod(transaction.paymentMethod),
      status: mapBackendStatus(transaction.status),
      location: transaction.location ? 
        `${transaction.location.latitude}, ${transaction.location.longitude}` : '',
      notes: transaction.notes || '',
      invoiceNumber: transaction.invoiceNumber || '',
      receiptUrl: transaction.attachments?.[0] || '',
      createdBy: transaction.createdBy || 'system',
      createdAt: new Date(transaction.createdAt || Date.now()),
      updatedAt: new Date(transaction.updatedAt || Date.now())
    }));
  };

  const mapBackendCategoryToPurchaseCategory = (backendCategory: string): PurchaseCategory => {
    const mapping: Record<string, PurchaseCategory> = {
      'feed': PurchaseCategory.FEED,
      'feed_purchase': PurchaseCategory.FEED,
      'veterinary': PurchaseCategory.MEDICATION,
      'veterinary_services': PurchaseCategory.SERVICES,
      'medication': PurchaseCategory.MEDICATION,
      'equipment': PurchaseCategory.EQUIPMENT,
      'equipment_purchase': PurchaseCategory.EQUIPMENT,
      'utilities': PurchaseCategory.UTILITIES,
      'maintenance': PurchaseCategory.MAINTENANCE,
      'services': PurchaseCategory.SERVICES,
      'professional_services': PurchaseCategory.SERVICES
    };
    
    return mapping[backendCategory] || PurchaseCategory.OTHER;
  };

  const mapBackendPaymentMethod = (backendMethod: string): PaymentMethod => {
    const mapping: Record<string, PaymentMethod> = {
      'cash': PaymentMethod.CASH,
      'bank_transfer': PaymentMethod.TRANSFER,
      'check': PaymentMethod.CHECK,
      'credit_card': PaymentMethod.CREDIT_CARD,
      'debit_card': PaymentMethod.DEBIT_CARD
    };
    
    return mapping[backendMethod] || PaymentMethod.CASH;
  };

  const mapBackendStatus = (backendStatus: string): PurchaseStatus => {
    const mapping: Record<string, PurchaseStatus> = {
      'pending': PurchaseStatus.PENDING,
      'approved': PurchaseStatus.COMPLETED,
      'paid': PurchaseStatus.COMPLETED,
      'cancelled': PurchaseStatus.CANCELLED,
      'overdue': PurchaseStatus.REFUNDED
    };
    
    return mapping[backendStatus] || PurchaseStatus.PENDING;
  };

  const loadFallbackData = () => {
    // Datos de prueba para cuando no hay conexión al backend
    const mockPurchases: Purchase[] = [
      {
        id: '1',
        purchaseCode: 'COMP-2025-001',
        date: new Date('2025-01-15'),
        vendorName: 'Forrajes del Norte S.A.',
        vendorContact: 'juan.perez@forrajes.com',
        description: 'Compra de alimento balanceado',
        category: PurchaseCategory.FEED,
        items: [
          {
            id: '1-1',
            name: 'Alimento balanceado 18% proteína',
            description: 'Saco de 40kg',
            quantity: 50,
            unit: 'saco',
            unitPrice: 280,
            totalPrice: 14000
          }
        ],
        totalAmount: 14000,
        currency: 'MXN',
        paymentMethod: PaymentMethod.TRANSFER,
        status: PurchaseStatus.COMPLETED,
        location: '17.989242, -92.947472 (Villahermosa, Tabasco)',
        notes: 'Entrega completa sin problemas',
        invoiceNumber: 'F-2025-0215',
        createdBy: 'admin',
        createdAt: new Date('2025-01-15'),
        updatedAt: new Date('2025-01-15')
      },
      {
        id: '2',
        purchaseCode: 'COMP-2025-002',
        date: new Date('2025-01-20'),
        vendorName: 'Veterinaria San Marcos',
        vendorContact: 'contacto@vetsanmarcos.com',
        description: 'Medicamentos y vacunas',
        category: PurchaseCategory.MEDICATION,
        items: [
          {
            id: '2-1',
            name: 'Vacuna Triple Bovina',
            description: 'Frasco 50 dosis',
            quantity: 5,
            unit: 'frasco',
            unitPrice: 450,
            totalPrice: 2250
          },
          {
            id: '2-2',
            name: 'Ivermectina 1%',
            description: 'Frasco 500ml',
            quantity: 2,
            unit: 'frasco',
            unitPrice: 320,
            totalPrice: 640
          }
        ],
        totalAmount: 2890,
        currency: 'MXN',
        paymentMethod: PaymentMethod.CASH,
        status: PurchaseStatus.PENDING,
        location: 'Clínica Veterinaria',
        notes: 'Pendiente de aplicación',
        invoiceNumber: 'VM-2025-0045',
        createdBy: 'veterinario',
        createdAt: new Date('2025-01-20'),
        updatedAt: new Date('2025-01-20')
      }
    ];

    // Aplicar filtros
    let filteredPurchases = mockPurchases;
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredPurchases = filteredPurchases.filter(purchase =>
        purchase.purchaseCode.toLowerCase().includes(searchLower) ||
        purchase.vendorName.toLowerCase().includes(searchLower) ||
        purchase.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filteredPurchases = filteredPurchases.filter(purchase =>
        purchase.category === filters.category
      );
    }

    if (filters.status) {
      filteredPurchases = filteredPurchases.filter(purchase =>
        purchase.status === filters.status
      );
    }

    setPurchases(filteredPurchases);
    setPagination(prev => ({
      ...prev,
      total: filteredPurchases.length,
      totalPages: Math.ceil(filteredPurchases.length / prev.limit)
    }));
  };

  const savePurchase = async (purchaseData: Partial<Purchase>) => {
    if (!connection.isConnected) {
      // Modo offline - guardar localmente
      savePurchaseOffline(purchaseData);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Transformar datos de Purchase a formato del backend
      const transactionData = {
        type: 'expense',
        category: mapPurchaseCategoryToBackend(purchaseData.category!),
        amount: purchaseData.totalAmount || 0,
        currency: purchaseData.currency || 'MXN',
        description: purchaseData.description || '',
        date: purchaseData.date || new Date(),
        paymentMethod: mapPaymentMethodToBackend(purchaseData.paymentMethod!),
        vendor: {
          name: purchaseData.vendorName || '',
          contactInfo: {
            email: purchaseData.vendorContact || ''
          }
        },
        location: purchaseData.location ? {
          latitude: parseFloat(purchaseData.location.split(',')[0]) || 0,
          longitude: parseFloat(purchaseData.location.split(',')[1]) || 0,
          description: purchaseData.location
        } : undefined,
        reference: purchaseData.purchaseCode,
        invoiceNumber: purchaseData.invoiceNumber,
        notes: purchaseData.notes,
        tags: [purchaseData.category || 'purchase']
      };

      let response;
      
      if (modalMode === 'edit' && selectedPurchase) {
        // Actualizar compra existente
        response = await PurchaseApiService.updateTransaction(selectedPurchase.id, transactionData);
      } else {
        // Crear nueva compra
        response = await PurchaseApiService.createTransaction(transactionData);
      }

      if (response.success) {
        addNotification({
          type: "success",
          title: modalMode === 'edit' ? "Compra actualizada" : "Compra registrada",
          message: modalMode === 'edit' 
            ? "La compra se ha actualizado correctamente" 
            : "La nueva compra se ha registrado en el sistema",
          autoHide: true,
        });

        // Recargar la lista
        await loadPurchases();
        
        // Cerrar modal
        setShowModal(false);
        setSelectedPurchase(null);
        setFormData({});
        setFormErrors({});
        setGettingLocation(false);
      } else {
        throw new Error(response.message || 'Error al guardar compra');
      }
      
    } catch (err) {
      console.error('Error saving purchase:', err);
      
      addNotification({
        type: "error",
        title: "Error al guardar",
        message: `No se pudo guardar la compra: ${err instanceof Error ? err.message : 'Error desconocido'}`,
        autoHide: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const savePurchaseOffline = async (purchaseData: Partial<Purchase>) => {
    // Simular guardado offline
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (modalMode === 'edit' && selectedPurchase) {
      // Actualizar compra existente
      setPurchases(prev => prev.map(purchase => 
        purchase.id === selectedPurchase.id 
          ? { ...purchase, ...purchaseData, updatedAt: new Date() }
          : purchase
      ));
    } else {
      // Crear nueva compra
      const newPurchase: Purchase = {
        id: Date.now().toString(),
        purchaseCode: `COMP-2025-${String(Date.now()).slice(-3)}`,
        date: new Date(),
        createdBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
        currency: 'MXN',
        items: [],
        totalAmount: 0,
        ...purchaseData
      } as Purchase;
      
      setPurchases(prev => [newPurchase, ...prev]);
    }
    
    addNotification({
      type: "warning",
      title: "Guardado offline",
      message: "La compra se guardó localmente. Se sincronizará cuando se restaure la conexión.",
      autoHide: false,
    });
    
    setShowModal(false);
    setSelectedPurchase(null);
    setFormData({});
    setFormErrors({});
    setGettingLocation(false);
  };

  const mapPurchaseCategoryToBackend = (category: PurchaseCategory): string => {
    const mapping: Record<PurchaseCategory, string> = {
      [PurchaseCategory.FEED]: 'feed_purchase',
      [PurchaseCategory.MEDICATION]: 'medication',
      [PurchaseCategory.EQUIPMENT]: 'equipment_purchase',
      [PurchaseCategory.SERVICES]: 'professional_services',
      [PurchaseCategory.MAINTENANCE]: 'maintenance',
      [PurchaseCategory.UTILITIES]: 'utilities',
      [PurchaseCategory.OTHER]: 'other_expenses'
    };
    
    return mapping[category] || 'other_expenses';
  };

  const mapPaymentMethodToBackend = (method: PaymentMethod): string => {
    const mapping: Record<PaymentMethod, string> = {
      [PaymentMethod.CASH]: 'cash',
      [PaymentMethod.TRANSFER]: 'bank_transfer',
      [PaymentMethod.CHECK]: 'check',
      [PaymentMethod.CREDIT_CARD]: 'credit_card',
      [PaymentMethod.DEBIT_CARD]: 'debit_card'
    };
    
    return mapping[method] || 'cash';
  };

  const deletePurchase = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta compra? Esta acción no se puede deshacer.')) return;
    
    if (!connection.isConnected) {
      // Modo offline
      setPurchases(prev => prev.filter(purchase => purchase.id !== id));
      addNotification({
        type: "warning",
        title: "Eliminado offline",
        message: "La compra se eliminó localmente. El cambio se sincronizará cuando se restaure la conexión.",
        autoHide: false,
      });
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await PurchaseApiService.deleteTransaction(id);
      
      if (response.success) {
        setPurchases(prev => prev.filter(purchase => purchase.id !== id));
        
        addNotification({
          type: "success",
          title: "Compra eliminada",
          message: "La compra se ha eliminado correctamente del sistema",
          autoHide: true,
        });
      } else {
        throw new Error(response.message || 'Error al eliminar compra');
      }
      
    } catch (err) {
      console.error('Error deleting purchase:', err);
      
      addNotification({
        type: "error",
        title: "Error al eliminar",
        message: `No se pudo eliminar la compra: ${err instanceof Error ? err.message : 'Error desconocido'}`,
        autoHide: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    try {
      const headers = ['Código', 'Fecha', 'Proveedor', 'Categoría', 'Descripción', 'Monto', 'Estado'];
      const csvContent = [
        headers.join(','),
        ...purchases.map(purchase => [
          purchase.purchaseCode,
          formatDate(purchase.date),
          purchase.vendorName,
          getCategoryLabel(purchase.category),
          `"${purchase.description}"`,
          purchase.totalAmount,
          getStatusLabel(purchase.status)
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `compras_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Error al exportar datos');
    }
  };

  // ============================================================================
  // MANEJADORES DE EVENTOS
  // ============================================================================

  const handleCreate = () => {
    setSelectedPurchase(null);
    setFormData({
      vendorName: '',
      description: '',
      category: PurchaseCategory.OTHER,
      totalAmount: 0,
      paymentMethod: PaymentMethod.CASH,
      status: PurchaseStatus.PENDING,
      location: '',
      notes: '',
      invoiceNumber: ''
    });
    setFormErrors({});
    setGettingLocation(false);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setFormData(purchase);
    setFormErrors({});
    setGettingLocation(false);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setGettingLocation(false);
    setModalMode('view');
    setShowModal(true);
  };

  const handleFilterChange = (filterKey: keyof PurchaseFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.vendorName?.trim()) {
      errors.vendorName = 'El nombre del proveedor es obligatorio';
    }

    if (!formData.description?.trim()) {
      errors.description = 'La descripción es obligatoria';
    }

    if (!formData.category) {
      errors.category = 'La categoría es obligatoria';
    }

    if (!formData.totalAmount || formData.totalAmount <= 0) {
      errors.totalAmount = 'El monto debe ser mayor a 0';
    }

    if (!formData.paymentMethod) {
      errors.paymentMethod = 'El método de pago es obligatorio';
    }

    if (!formData.status) {
      errors.status = 'El estado es obligatorio';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      savePurchase(formData);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está disponible en este navegador');
      return;
    }

    setGettingLocation(true);
    setError('');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache por 1 minuto
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        handleFormChange('location', locationString);
        setGettingLocation(false);
        
        // Opcional: También mostrar una dirección aproximada si hay servicio disponible
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = 'Error al obtener la ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Permite el acceso a la ubicación para usar esta función.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación.';
            break;
          default:
            errorMessage = 'Error desconocido al obtener la ubicación.';
            break;
        }
        
        setError(errorMessage);
      },
      options
    );
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Usar un servicio gratuito de geocodificación inversa
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.locality || data.city || data.principalSubdivision || 'Ubicación desconocida';
        const fullLocation = `${lat.toFixed(6)}, ${lng.toFixed(6)} (${address})`;
        handleFormChange('location', fullLocation);
      }
    } catch (error) {
      // Si falla la geocodificación inversa, mantener solo las coordenadas
      console.log('No se pudo obtener la dirección:', error);
    }
  };

  // ============================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-MX');
  };

  const getCategoryLabel = (category: PurchaseCategory) => {
    const labels = {
      [PurchaseCategory.FEED]: 'Alimento',
      [PurchaseCategory.MEDICATION]: 'Medicamento',
      [PurchaseCategory.EQUIPMENT]: 'Equipo',
      [PurchaseCategory.SERVICES]: 'Servicios',
      [PurchaseCategory.MAINTENANCE]: 'Mantenimiento',
      [PurchaseCategory.UTILITIES]: 'Servicios Públicos',
      [PurchaseCategory.OTHER]: 'Otros'
    };
    return labels[category] || category;
  };

  const getStatusColor = (status: PurchaseStatus) => {
    const colors = {
      [PurchaseStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [PurchaseStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [PurchaseStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [PurchaseStatus.REFUNDED]: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: PurchaseStatus) => {
    const labels = {
      [PurchaseStatus.PENDING]: 'Pendiente',
      [PurchaseStatus.COMPLETED]: 'Completada',
      [PurchaseStatus.CANCELLED]: 'Cancelada',
      [PurchaseStatus.REFUNDED]: 'Reembolsada'
    };
    return labels[status] || status;
  };

  // ============================================================================
  // COMPONENTES DE RENDERIZADO
  // ============================================================================

  const renderPurchaseForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proveedor *
          </label>
          <input
            type="text"
            value={formData.vendorName || ''}
            onChange={(e) => handleFormChange('vendorName', e.target.value)}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.vendorName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nombre del proveedor"
            disabled={modalMode === 'view'}
          />
          {formErrors.vendorName && (
            <p className="mt-1 text-sm text-red-600">{formErrors.vendorName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría *
          </label>
          <select
            value={formData.category || ''}
            onChange={(e) => handleFormChange('category', e.target.value)}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.category ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={modalMode === 'view'}
          >
            <option value="">Seleccionar categoría</option>
            {Object.values(PurchaseCategory).map(category => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
          {formErrors.category && (
            <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleFormChange('description', e.target.value)}
            rows={3}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Descripción de la compra"
            disabled={modalMode === 'view'}
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto Total *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.totalAmount || ''}
            onChange={(e) => handleFormChange('totalAmount', parseFloat(e.target.value))}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.totalAmount ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0.00"
            disabled={modalMode === 'view'}
          />
          {formErrors.totalAmount && (
            <p className="mt-1 text-sm text-red-600">{formErrors.totalAmount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Método de Pago *
          </label>
          <select
            value={formData.paymentMethod || ''}
            onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.paymentMethod ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={modalMode === 'view'}
          >
            <option value="">Seleccionar método</option>
            <option value={PaymentMethod.CASH}>Efectivo</option>
            <option value={PaymentMethod.TRANSFER}>Transferencia</option>
            <option value={PaymentMethod.CHECK}>Cheque</option>
            <option value={PaymentMethod.CREDIT_CARD}>Tarjeta de Crédito</option>
            <option value={PaymentMethod.DEBIT_CARD}>Tarjeta de Débito</option>
          </select>
          {formErrors.paymentMethod && (
            <p className="mt-1 text-sm text-red-600">{formErrors.paymentMethod}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado *
          </label>
          <select
            value={formData.status || ''}
            onChange={(e) => handleFormChange('status', e.target.value)}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.status ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={modalMode === 'view'}
          >
            <option value="">Seleccionar estado</option>
            {Object.values(PurchaseStatus).map(status => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
          {formErrors.status && (
            <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleFormChange('location', e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ubicación de entrega"
              disabled={modalMode === 'view'}
            />
            {modalMode !== 'view' && (
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className={`flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md transition-colors ${
                  gettingLocation 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title="Obtener ubicación actual"
              >
                {gettingLocation ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                ) : (
                  <Navigation size={16} />
                )}
                <span className="text-sm">
                  {gettingLocation ? 'Obteniendo...' : 'Mi ubicación'}
                </span>
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Puedes escribir manualmente o usar tu ubicación actual
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Factura
          </label>
          <input
            type="text"
            value={formData.invoiceNumber || ''}
            onChange={(e) => handleFormChange('invoiceNumber', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Número de factura"
            disabled={modalMode === 'view'}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => handleFormChange('notes', e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Notas adicionales"
            disabled={modalMode === 'view'}
          />
        </div>
      </div>
    </div>
  );

  const renderViewDetails = () => {
    if (!selectedPurchase) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Código de Compra</label>
            <p className="mt-1 text-sm text-gray-900">{selectedPurchase.purchaseCode}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPurchase.date)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Proveedor</label>
            <p className="mt-1 text-sm text-gray-900">{selectedPurchase.vendorName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <p className="mt-1 text-sm text-gray-900">{getCategoryLabel(selectedPurchase.category)}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <p className="mt-1 text-sm text-gray-900">{selectedPurchase.description}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monto Total</label>
            <p className="mt-1 text-sm text-gray-900 font-semibold">
              {formatCurrency(selectedPurchase.totalAmount, selectedPurchase.currency)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPurchase.status)}`}>
              {getStatusLabel(selectedPurchase.status)}
            </span>
          </div>
          {selectedPurchase.location && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Ubicación</label>
              <div className="mt-1 flex items-start gap-2">
                <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-900">{selectedPurchase.location}</p>
              </div>
              {selectedPurchase.location.includes(',') && selectedPurchase.location.includes('.') && (
                <p className="mt-1 text-xs text-gray-500">
                  Coordenadas GPS registradas
                </p>
              )}
            </div>
          )}
          {selectedPurchase.invoiceNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Factura</label>
              <p className="mt-1 text-sm text-gray-900">{selectedPurchase.invoiceNumber}</p>
            </div>
          )}
          {selectedPurchase.notes && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notas</label>
              <p className="mt-1 text-sm text-gray-900">{selectedPurchase.notes}</p>
            </div>
          )}
        </div>

        {selectedPurchase.items && selectedPurchase.items.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Items de la Compra</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedPurchase.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500">{item.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTable = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/80 divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-gray-50/60">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {purchase.purchaseCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(purchase.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {purchase.vendorName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getCategoryLabel(purchase.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(purchase.totalAmount, purchase.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(purchase.status)}`}>
                    {getStatusLabel(purchase.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleView(purchase)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(purchase)}
                      className="text-green-600 hover:text-green-900 p-1"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deletePurchase(purchase.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          disabled={pagination.page === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
          disabled={pagination.page === pagination.totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            a{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            de{' '}
            <span className="font-medium">{pagination.total}</span> resultados
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Compras
          </h1>
          <p className="text-gray-600">
            Registra, edita y gestiona todas las compras de tu rancho - Conectado al Backend
          </p>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Barra de herramientas */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar compras..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm"
              />
            </div>
            
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm"
            >
              <option value="">Todas las categorías</option>
              {Object.values(PurchaseCategory).map(category => (
                <option key={category} value={category}>
                  {getCategoryLabel(category)}
                </option>
              ))}
            </select>

            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm"
            >
              <option value="">Todos los estados</option>
              {Object.values(PurchaseStatus).map(status => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus size={20} />
              Nueva Compra
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors shadow-lg"
            >
              <Download size={20} />
              Exportar
            </button>
            <button
              onClick={() => loadPurchases()}
              disabled={loading}
              className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors shadow-lg disabled:opacity-50"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Tabla */}
        {!loading && purchases.length > 0 && renderTable()}

        {/* Estado vacío */}
        {!loading && purchases.length === 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay compras registradas
            </h3>
            <p className="text-gray-500 mb-4">
              {connection.isConnected 
                ? "Comienza registrando tu primera compra" 
                : "Sin conexión al backend. Verifica la conectividad."
              }
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus size={20} />
              Registrar Compra
            </button>
          </div>
        )}

        {/* Paginación */}
        {!loading && purchases.length > 0 && renderPagination()}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'create' && 'Nueva Compra'}
                  {modalMode === 'edit' && 'Editar Compra'}
                  {modalMode === 'view' && 'Detalles de Compra'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setGettingLocation(false);
                    setFormData({});
                    setFormErrors({});
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                {modalMode === 'view' ? renderViewDetails() : renderPurchaseForm()}
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setGettingLocation(false);
                    setFormData({});
                    setFormErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {modalMode === 'create' ? 'Crear Compra' : 'Guardar Cambios'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Panel de notificaciones */}
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.slice(0, 3).map((notification) => (
            <NotificationToast
              key={notification.id}
              notification={notification}
              onClose={removeNotification}
            />
          ))}
        </div>

        {/* Indicador de conexión */}
        <ConnectionIndicator 
          connection={connection} 
          onTestConnection={testConnection}
        />
      </div>
    </div>
  );
};

export default EventPurchase;