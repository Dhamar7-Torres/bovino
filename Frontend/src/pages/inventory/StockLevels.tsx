import React, { useState, useEffect, useCallback } from "react";
import {
  Package,
  TrendingUp,
  AlertTriangle,
  Search,
  X,
  Check,
  Clock,
  MapPin,
  Zap,
  Activity,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Save,
  Trash2,
  RefreshCw,
} from "lucide-react";

// Configuración de la API
const API_BASE_URL = "http://localhost:5000/api";

// Tipos específicos para formularios
interface StockLevelFormData {
  itemName?: string;
  category?: string;
  currentStock?: number;
  minimumStock?: number;
  maximumStock?: number;
  reorderPoint?: number;
  unitCost?: number;
  location?: {
    warehouse?: string;
    zone?: string;
    shelf?: string;
    position?: string;
  };
  autoReorder?: boolean;
  preferredSupplier?: string;
}

// Interfaces para gestión de niveles de stock
interface StockLevel {
  id: string;
  itemId: string;
  itemName: string;
  category: string;
  currentStock: number;
  availableStock: number;
  reservedStock: number;
  inTransitStock: number;

  // Puntos de control
  minimumStock: number;
  maximumStock: number;
  reorderPoint: number;
  safetyStock: number;
  optimalStock: number;

  // Métricas de rendimiento
  turnoverRate: number; // rotaciones por año
  averageDemand: number; // consumo promedio mensual
  leadTime: number; // tiempo de reposición en días
  serviceLevel: number; // nivel de servicio %

  // Información financiera
  unitCost: number;
  totalValue: number;
  averageCost: number;

  // Ubicación y organización
  location: {
    warehouse: string;
    zone?: string;
    shelf: string;
    position: string;
  };

  // Estado y alertas
  status: StockStatus;
  riskLevel: RiskLevel;
  lastMovementDate: Date;
  lastReorderDate?: Date;
  nextReorderDate?: Date;

  // Configuración automática
  autoReorder: boolean;
  reorderQuantity: number;
  preferredSupplier: string;

  // Análisis temporal
  stockDays: number; // días de stock disponible
  velocity: StockVelocity;
  seasonality: SeasonalPattern;

  // Metadatos
  lastUpdated: Date;
  updatedBy: string;
  notes?: string;
}

interface StockAnalytics {
  totalItems: number;
  totalValue: number;
  averageTurnover: number;
  totalStockDays: number;

  // Distribución por estado
  statusDistribution: {
    optimal: number;
    adequate: number;
    low: number;
    critical: number;
    overstock: number;
  };

  // Distribución por velocidad
  velocityDistribution: {
    fast: number;
    medium: number;
    slow: number;
    obsolete: number;
  };

  // Métricas financieras
  inventoryTurnover: number;
  daysOfSupply: number;
  carryingCost: number;
  stockoutRisk: number;

  // Recomendaciones activas
  activeRecommendations: number;
  potentialSavings: number;

  // Tendencias
  trends: {
    period: string;
    totalValue: number;
    turnover: number;
    stockouts: number;
  }[];
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  pagination?: {
    total: number;
    currentPage: number;
    totalPages: number;
  };
}

// Enums
enum StockStatus {
  OPTIMAL = "optimal",
  ADEQUATE = "adequate",
  LOW = "low",
  CRITICAL = "critical",
  OVERSTOCK = "overstock",
  OUT_OF_STOCK = "out_of_stock",
}

enum RiskLevel {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

enum StockVelocity {
  FAST = "fast", // >12 rotaciones/año
  MEDIUM = "medium", // 4-12 rotaciones/año
  SLOW = "slow", // 1-4 rotaciones/año
  OBSOLETE = "obsolete", // <1 rotación/año
}

enum SeasonalPattern {
  NONE = "none",
  SPRING = "spring",
  SUMMER = "summer",
  FALL = "fall",
  WINTER = "winter",
  YEAR_ROUND = "year_round",
}

// Servicio API
class StockLevelsAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // GET - Obtener niveles de stock
  static async getStockLevels(params = {}): Promise<ApiResponse<StockLevel[]>> {
    try {
      const queryParams = new URLSearchParams(params as any).toString();
      const url = `${API_BASE_URL}/inventory/stock/levels${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      // Transformar fechas de string a Date
      if (result.success && result.data) {
        result.data = result.data.map((item: any) => ({
          ...item,
          lastMovementDate: item.lastMovementDate ? new Date(item.lastMovementDate) : undefined,
          lastReorderDate: item.lastReorderDate ? new Date(item.lastReorderDate) : undefined,
          nextReorderDate: item.nextReorderDate ? new Date(item.nextReorderDate) : undefined,
          lastUpdated: new Date(item.lastUpdated || Date.now())
        }));
      }

      return result;
    } catch (error) {
      console.error('Error obteniendo niveles de stock:', error);
      throw error;
    }
  }

  // POST - Crear nuevo item de stock
  static async createStockItem(itemData: Omit<StockLevel, "id">): Promise<ApiResponse<StockLevel>> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      // Transformar fechas
      if (result.success && result.data) {
        result.data.lastUpdated = new Date(result.data.lastUpdated || Date.now());
        if (result.data.lastMovementDate) {
          result.data.lastMovementDate = new Date(result.data.lastMovementDate);
        }
      }

      return result;
    } catch (error) {
      console.error('Error creando item de stock:', error);
      throw error;
    }
  }

  // PUT - Actualizar item de stock
  static async updateStockItem(id: string, itemData: Partial<StockLevel>): Promise<ApiResponse<StockLevel>> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const result = await response.json();
      
      // Transformar fechas
      if (result.success && result.data) {
        result.data.lastUpdated = new Date(result.data.lastUpdated || Date.now());
        if (result.data.lastMovementDate) {
          result.data.lastMovementDate = new Date(result.data.lastMovementDate);
        }
      }

      return result;
    } catch (error) {
      console.error('Error actualizando item de stock:', error);
      throw error;
    }
  }

  // DELETE - Eliminar item de stock
  static async deleteStockItem(id: string): Promise<ApiResponse<null>> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error eliminando item de stock:', error);
      throw error;
    }
  }

  // POST - Actualizar stock (movimiento)
  static async updateStock(itemId: string, movementData: {
    movementType: string;
    quantity: number;
    reason: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/stock/movement`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          medicineId: itemId,
          ...movementData
        }),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error actualizando stock:', error);
      throw error;
    }
  }

  // GET - Obtener estadísticas
  static async getAnalytics(): Promise<ApiResponse<StockAnalytics>> {
    try {
      const response = await fetch(`${API_BASE_URL}/inventory/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// Componente de Loading
const LoadingSpinner = ({ message = "Cargando..." }: { message?: string }) => (
  <div className="flex items-center justify-center py-8">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto"></div>
      <p className="text-white mt-2">{message}</p>
    </div>
  </div>
);

// Componente de Error
const ErrorMessage = ({ 
  message, 
  onRetry 
}: { 
  message: string; 
  onRetry?: () => void; 
}) => (
  <div className="bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-lg p-4 my-4">
    <div className="flex items-center">
      <div className="text-red-600 mr-3">⚠️</div>
      <div className="flex-1">
        <p className="text-red-800 font-medium">Error</p>
        <p className="text-red-600 text-sm mt-1">{message}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="ml-3 px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors flex items-center space-x-1"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Reintentar</span>
        </button>
      )}
    </div>
  </div>
);

const StockLevels: React.FC = () => {
  // Agregar estilos CSS para animaciones
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  // Estados del componente
  const [stockLevels, setStockLevels] = useState<StockLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de UI
  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StockLevel | null>(null);

  // Estado de búsqueda
  const [searchTerm, setSearchTerm] = useState("");

  // Estados para formularios
  const [newFormData, setNewFormData] = useState<StockLevelFormData>({
    itemName: "",
    category: "",
    currentStock: 0,
    minimumStock: 0,
    maximumStock: 0,
    reorderPoint: 0,
    unitCost: 0,
    location: {
      warehouse: "",
      shelf: "",
      position: "",
    },
    autoReorder: false,
    preferredSupplier: "",
  });

  const [editFormData, setEditFormData] = useState<StockLevelFormData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar datos desde el backend
  const loadStockData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const stockResponse = await StockLevelsAPI.getStockLevels();
      
      if (stockResponse.success) {
        setStockLevels(stockResponse.data || []);
      } else {
        throw new Error(stockResponse.message || "Error al cargar datos de stock");
      }

    } catch (error) {
      console.error("Error cargando datos de stock:", error);
      setError(error instanceof Error ? error.message : "Error al cargar datos de stock");
      
      // Si hay error de conexión, usar datos mock
      if (error instanceof Error && error.message.includes('fetch')) {
        console.log("Usando datos mock debido a error de conexión");
        const mockStockLevels: StockLevel[] = [
          {
            id: "1",
            itemId: "med-001",
            itemName: "Penicilina G Procaínica",
            category: "Medicamentos",
            currentStock: 15,
            availableStock: 13,
            reservedStock: 2,
            inTransitStock: 0,
            minimumStock: 8,
            maximumStock: 50,
            reorderPoint: 12,
            safetyStock: 5,
            optimalStock: 25,
            turnoverRate: 8.5,
            averageDemand: 4.2,
            leadTime: 7,
            serviceLevel: 95,
            unitCost: 45.5,
            totalValue: 682.5,
            averageCost: 44.8,
            location: {
              warehouse: "Farmacia Veterinaria",
              zone: "Área Fría",
              shelf: "A-2",
              position: "03",
            },
            status: StockStatus.ADEQUATE,
            riskLevel: RiskLevel.LOW,
            lastMovementDate: new Date("2025-07-10"),
            lastReorderDate: new Date("2025-06-15"),
            nextReorderDate: new Date("2025-08-15"),
            autoReorder: true,
            reorderQuantity: 30,
            preferredSupplier: "FarmVet Industries",
            stockDays: 45,
            velocity: StockVelocity.MEDIUM,
            seasonality: SeasonalPattern.YEAR_ROUND,
            lastUpdated: new Date("2025-07-12"),
            updatedBy: "Dr. García",
          },
          {
            id: "2",
            itemId: "vac-003",
            itemName: "Vacuna Triple Bovina",
            category: "Vacunas",
            currentStock: 8,
            availableStock: 8,
            reservedStock: 0,
            inTransitStock: 25,
            minimumStock: 15,
            maximumStock: 100,
            reorderPoint: 20,
            safetyStock: 10,
            optimalStock: 40,
            turnoverRate: 12.3,
            averageDemand: 8.1,
            leadTime: 14,
            serviceLevel: 90,
            unitCost: 125.0,
            totalValue: 1000.0,
            averageCost: 122.5,
            location: {
              warehouse: "Farmacia Veterinaria",
              zone: "Área Fría",
              shelf: "B-1",
              position: "07",
            },
            status: StockStatus.LOW,
            riskLevel: RiskLevel.HIGH,
            lastMovementDate: new Date("2025-07-08"),
            lastReorderDate: new Date("2025-07-05"),
            autoReorder: true,
            reorderQuantity: 50,
            preferredSupplier: "BioVet Laboratories",
            stockDays: 12,
            velocity: StockVelocity.FAST,
            seasonality: SeasonalPattern.SPRING,
            lastUpdated: new Date("2025-07-12"),
            updatedBy: "Dr. López",
          },
        ];
        setStockLevels(mockStockLevels);
        setError("⚠️ Usando datos de prueba - Backend no disponible");
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadStockData();
  }, [loadStockData]);

  // Funciones auxiliares
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getStatusColor = (status: StockStatus) => {
    switch (status) {
      case StockStatus.OPTIMAL:
        return {
          bg: "bg-green-50/90",
          border: "border-l-green-500",
          text: "text-green-700",
          badge: "bg-green-100 text-green-800",
          icon: "text-green-500",
        };
      case StockStatus.ADEQUATE:
        return {
          bg: "bg-blue-50/90",
          border: "border-l-blue-500",
          text: "text-blue-700",
          badge: "bg-blue-100 text-blue-800",
          icon: "text-blue-500",
        };
      case StockStatus.LOW:
        return {
          bg: "bg-yellow-50/90",
          border: "border-l-yellow-500",
          text: "text-yellow-700",
          badge: "bg-yellow-100 text-yellow-800",
          icon: "text-yellow-500",
        };
      case StockStatus.CRITICAL:
        return {
          bg: "bg-red-50/90",
          border: "border-l-red-500",
          text: "text-red-700",
          badge: "bg-red-100 text-red-800",
          icon: "text-red-500",
        };
      case StockStatus.OVERSTOCK:
        return {
          bg: "bg-purple-50/90",
          border: "border-l-purple-500",
          text: "text-purple-700",
          badge: "bg-purple-100 text-purple-800",
          icon: "text-purple-500",
        };
      case StockStatus.OUT_OF_STOCK:
        return {
          bg: "bg-gray-50/90",
          border: "border-l-gray-500",
          text: "text-gray-700",
          badge: "bg-gray-100 text-gray-800",
          icon: "text-gray-500",
        };
      default:
        return {
          bg: "bg-gray-50/90",
          border: "border-l-gray-500",
          text: "text-gray-700",
          badge: "bg-gray-100 text-gray-800",
          icon: "text-gray-500",
        };
    }
  };

  const getStatusIcon = (status: StockStatus) => {
    switch (status) {
      case StockStatus.OPTIMAL:
        return <CheckCircle className="w-4 h-4" />;
      case StockStatus.ADEQUATE:
        return <Check className="w-4 h-4" />;
      case StockStatus.LOW:
        return <AlertTriangle className="w-4 h-4" />;
      case StockStatus.CRITICAL:
        return <AlertCircle className="w-4 h-4" />;
      case StockStatus.OVERSTOCK:
        return <TrendingUp className="w-4 h-4" />;
      case StockStatus.OUT_OF_STOCK:
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: StockStatus) => {
    switch (status) {
      case StockStatus.OPTIMAL:
        return "Óptimo";
      case StockStatus.ADEQUATE:
        return "Adecuado";
      case StockStatus.LOW:
        return "Bajo";
      case StockStatus.CRITICAL:
        return "Crítico";
      case StockStatus.OVERSTOCK:
        return "Exceso";
      case StockStatus.OUT_OF_STOCK:
        return "Agotado";
      default:
        return "Desconocido";
    }
  };

  const getVelocityIcon = (velocity: StockVelocity) => {
    switch (velocity) {
      case StockVelocity.FAST:
        return <Zap className="w-4 h-4 text-green-500" />;
      case StockVelocity.MEDIUM:
        return <Activity className="w-4 h-4 text-blue-500" />;
      case StockVelocity.SLOW:
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case StockVelocity.OBSOLETE:
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getVelocityLabel = (velocity: StockVelocity) => {
    switch (velocity) {
      case StockVelocity.FAST:
        return "Rápida";
      case StockVelocity.MEDIUM:
        return "Media";
      case StockVelocity.SLOW:
        return "Lenta";
      case StockVelocity.OBSOLETE:
        return "Obsoleta";
      default:
        return "Desconocida";
    }
  };

  const getRiskColor = (risk: RiskLevel) => {
    switch (risk) {
      case RiskLevel.LOW:
        return "bg-green-100 text-green-800";
      case RiskLevel.MEDIUM:
        return "bg-yellow-100 text-yellow-800";
      case RiskLevel.HIGH:
        return "bg-orange-100 text-orange-800";
      case RiskLevel.CRITICAL:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Funciones de CRUD
  const handleNewItem = () => {
    setNewFormData({
      itemName: "",
      category: "",
      currentStock: 0,
      minimumStock: 0,
      maximumStock: 0,
      reorderPoint: 0,
      unitCost: 0,
      location: {
        warehouse: "",
        shelf: "",
        position: "",
      },
      autoReorder: false,
      preferredSupplier: "",
    });
    setShowNewModal(true);
  };

  const handleEditItem = (item: StockLevel) => {
    setEditingItem(item);
    setEditFormData({
      itemName: item.itemName,
      category: item.category,
      currentStock: item.currentStock,
      minimumStock: item.minimumStock,
      maximumStock: item.maximumStock,
      reorderPoint: item.reorderPoint,
      unitCost: item.unitCost,
      location: {
        warehouse: item.location.warehouse,
        zone: item.location.zone,
        shelf: item.location.shelf,
        position: item.location.position,
      },
      autoReorder: item.autoReorder,
      preferredSupplier: item.preferredSupplier,
    });
    setShowEditModal(true);
  };

  const handleSaveNew = async () => {
    if (!newFormData.itemName || !newFormData.category || !newFormData.location?.warehouse) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);

    try {
      const newItemData: Omit<StockLevel, "id"> = {
        itemId: `item-${Date.now()}`,
        itemName: newFormData.itemName,
        category: newFormData.category,
        currentStock: newFormData.currentStock || 0,
        availableStock: newFormData.currentStock || 0,
        reservedStock: 0,
        inTransitStock: 0,
        minimumStock: newFormData.minimumStock || 0,
        maximumStock: newFormData.maximumStock || 0,
        reorderPoint: newFormData.reorderPoint || 0,
        safetyStock: Math.round((newFormData.minimumStock || 0) * 0.5),
        optimalStock: Math.round(((newFormData.minimumStock || 0) + (newFormData.maximumStock || 0)) / 2),
        turnoverRate: 0,
        averageDemand: 0,
        leadTime: 7,
        serviceLevel: 95,
        unitCost: newFormData.unitCost || 0,
        totalValue: (newFormData.currentStock || 0) * (newFormData.unitCost || 0),
        averageCost: newFormData.unitCost || 0,
        location: {
          warehouse: newFormData.location?.warehouse || "",
          zone: newFormData.location?.zone,
          shelf: newFormData.location?.shelf || "",
          position: newFormData.location?.position || "",
        },
        status: StockStatus.ADEQUATE,
        riskLevel: RiskLevel.LOW,
        lastMovementDate: new Date(),
        autoReorder: newFormData.autoReorder || false,
        reorderQuantity: newFormData.maximumStock || 0,
        preferredSupplier: newFormData.preferredSupplier || "",
        stockDays: 30,
        velocity: StockVelocity.MEDIUM,
        seasonality: SeasonalPattern.YEAR_ROUND,
        lastUpdated: new Date(),
        updatedBy: "Usuario Actual",
      };

      const response = await StockLevelsAPI.createStockItem(newItemData);
      
      if (response.success) {
        setStockLevels(prev => [...prev, response.data]);
        setShowNewModal(false);
        setNewFormData({
          itemName: "",
          category: "",
          currentStock: 0,
          minimumStock: 0,
          maximumStock: 0,
          reorderPoint: 0,
          unitCost: 0,
          location: {
            warehouse: "",
            shelf: "",
            position: "",
          },
          autoReorder: false,
          preferredSupplier: "",
        });
        alert("✅ Item creado exitosamente");
      } else {
        throw new Error(response.message || "Error al crear item");
      }
    } catch (error) {
      console.error("Error creando item:", error);
      alert("❌ Error al crear el item. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (itemId: string, itemName: string) => {
    try {
      const confirmDelete = window.confirm(
        `¿Estás seguro de que deseas eliminar "${itemName}"?\n\nEsta acción no se puede deshacer.`
      );
      
      if (!confirmDelete) return;

      const response = await StockLevelsAPI.deleteStockItem(itemId);
      
      if (response.success) {
        setStockLevels(prev => prev.filter(item => item.id !== itemId));
        alert("✅ Item eliminado exitosamente");
      } else {
        throw new Error(response.message || "Error al eliminar item");
      }
    } catch (error) {
      console.error("Error eliminando item:", error);
      alert("❌ Error al eliminar el item. Por favor intenta de nuevo.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    if (!editFormData.itemName || !editFormData.category || !editFormData.location?.warehouse) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }

    setIsSubmitting(true);

    try {
      const updatedItemData: Partial<StockLevel> = {
        itemName: editFormData.itemName,
        category: editFormData.category,
        currentStock: editFormData.currentStock,
        minimumStock: editFormData.minimumStock,
        maximumStock: editFormData.maximumStock,
        reorderPoint: editFormData.reorderPoint,
        unitCost: editFormData.unitCost,
        totalValue: (editFormData.currentStock || 0) * (editFormData.unitCost || 0),
        location: {
          warehouse: editFormData.location?.warehouse || "",
          zone: editFormData.location?.zone,
          shelf: editFormData.location?.shelf || "",
          position: editFormData.location?.position || "",
        },
        autoReorder: editFormData.autoReorder,
        preferredSupplier: editFormData.preferredSupplier,
        lastUpdated: new Date(),
        updatedBy: "Usuario Actual",
      };

      const response = await StockLevelsAPI.updateStockItem(editingItem.id, updatedItemData);
      
      if (response.success) {
        setStockLevels(prev => prev.map(item => 
          item.id === editingItem.id ? response.data : item
        ));
        setShowEditModal(false);
        setEditingItem(null);
        setEditFormData({});
        alert("✅ Item actualizado exitosamente");
      } else {
        throw new Error(response.message || "Error al actualizar item");
      }
    } catch (error) {
      console.error("Error actualizando item:", error);
      alert("❌ Error al actualizar el item. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrado de items
  const filteredStockLevels = stockLevels.filter((item) => {
    const matchesSearch =
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
        <div className="container mx-auto px-6 py-8">
          <LoadingSpinner message="Cargando niveles de stock..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div 
          className="mb-8 opacity-0 animate-fade-in"
          style={{
            animation: 'fadeIn 0.5s ease-out forwards'
          }}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2">
                Niveles de Stock
              </h1>
              <p className="text-white/90 text-lg">
                Gestión y optimización de puntos de reorden y niveles de
                inventario
              </p>
            </div>

            <div className="flex items-center space-x-4 mt-4 lg:mt-0">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              <button
                onClick={loadStockData}
                disabled={isLoading}
                className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
                title="Recargar datos"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Recargar</span>
              </button>

              <button
                onClick={handleNewItem}
                className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c] px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo</span>
              </button>
            </div>
          </div>

          {/* Mostrar mensaje de error si existe */}
          {error && (
            <ErrorMessage 
              message={error} 
              onRetry={error.includes('Backend') ? loadStockData : undefined} 
            />
          )}
        </div>

        {/* Lista de Niveles de Stock */}
        <div className="space-y-4">
          {filteredStockLevels.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No se encontraron items
              </h3>
              <p className="text-gray-500">
                {searchTerm ? 'Ajusta la búsqueda para ver más resultados' : 'Agrega el primer item de stock'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleNewItem}
                  className="mt-4 bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white px-4 py-2 rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 flex items-center space-x-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Agregar Primer Item</span>
                </button>
              )}
            </div>
          ) : (
            filteredStockLevels.map((item, index) => {
              const statusColors = getStatusColor(item.status);

              return (
                <div
                  key={item.id}
                  className={`bg-white/90 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg border-l-4 ${statusColors.border} ${statusColors.bg} hover:shadow-xl transition-all duration-200 opacity-0`}
                  style={{ 
                    animation: `slideUp 0.3s ease-out forwards`,
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="p-6">
                    {/* Header principal */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {/* Icono de estado */}
                        <div className={`mt-1 ${statusColors.icon}`}>
                          {getStatusIcon(item.status)}
                        </div>

                        {/* Información principal */}
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3
                              className={`text-lg font-semibold ${statusColors.text}`}
                            >
                              {item.itemName}
                            </h3>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors.badge}`}
                            >
                              {getStatusLabel(item.status)}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                              {item.category}
                            </span>
                            {getVelocityIcon(item.velocity)}
                            <span className="text-xs text-gray-600">
                              {getVelocityLabel(item.velocity)}
                            </span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                                item.riskLevel
                              )}`}
                            >
                              Riesgo {item.riskLevel.toUpperCase()}
                            </span>
                            {item.autoReorder && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Auto-Reorden
                              </span>
                            )}
                          </div>

                          {/* Información de stock en grid */}
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                            <div>
                              <span className="font-medium text-gray-700">
                                Stock Actual:
                              </span>
                              <div className="flex items-center space-x-2 mt-1">
                                <span
                                  className={`text-lg font-bold ${
                                    item.currentStock <= item.minimumStock
                                      ? "text-red-600"
                                      : item.currentStock >= item.optimalStock
                                      ? "text-green-600"
                                      : "text-gray-900"
                                  }`}
                                >
                                  {item.currentStock.toLocaleString()}
                                </span>
                                <span className="text-gray-600">unidades</span>
                              </div>
                              {item.reservedStock > 0 && (
                                <div className="text-xs text-orange-600">
                                  {item.reservedStock} reservadas
                                </div>
                              )}
                              {item.inTransitStock > 0 && (
                                <div className="text-xs text-blue-600">
                                  {item.inTransitStock} en tránsito
                                </div>
                              )}
                            </div>

                            <div>
                              <span className="font-medium text-gray-700">
                                Puntos de Control:
                              </span>
                              <div className="space-y-1 mt-1 text-xs">
                                <div className="flex justify-between">
                                  <span>Mínimo:</span>
                                  <span className="font-medium">
                                    {item.minimumStock}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Reorden:</span>
                                  <span className="font-medium">
                                    {item.reorderPoint}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Óptimo:</span>
                                  <span className="font-medium">
                                    {item.optimalStock}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Máximo:</span>
                                  <span className="font-medium">
                                    {item.maximumStock}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <span className="font-medium text-gray-700">
                                Rendimiento:
                              </span>
                              <div className="space-y-1 mt-1 text-xs">
                                <div className="flex justify-between">
                                  <span>Rotación:</span>
                                  <span className="font-medium">
                                    {item.turnoverRate.toFixed(1)}x/año
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Demanda:</span>
                                  <span className="font-medium">
                                    {item.averageDemand.toFixed(1)}/mes
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Días stock:</span>
                                  <span className="font-medium">
                                    {item.stockDays}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Servicio:</span>
                                  <span className="font-medium">
                                    {item.serviceLevel}%
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <span className="font-medium text-gray-700">
                                Información:
                              </span>
                              <div className="space-y-1 mt-1 text-xs">
                                <div className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{item.location.warehouse}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Package className="w-3 h-3" />
                                  <span>
                                    {item.location.shelf}-{item.location.position}
                                  </span>
                                </div>
                                <div className="font-medium text-gray-900">
                                  {formatCurrency(item.totalValue)}
                                </div>
                                {item.nextReorderDate && (
                                  <div className="flex items-center space-x-1 text-blue-600">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      Reorden: {formatDate(item.nextReorderDate)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Barra de progreso de stock */}
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-700">
                                Nivel de Stock
                              </span>
                              <span className="text-sm text-gray-600">
                                {Math.round(
                                  (item.currentStock / item.maximumStock) * 100
                                )}
                                % del máximo
                              </span>
                            </div>
                            <div className="relative">
                              <div className="w-full bg-gray-200 rounded-full h-3">
                                {/* Barra principal de stock */}
                                <div
                                  className={`h-3 rounded-full transition-all duration-300 ${
                                    item.currentStock <= item.minimumStock
                                      ? "bg-red-500"
                                      : item.currentStock <= item.reorderPoint
                                      ? "bg-yellow-500"
                                      : item.currentStock <= item.optimalStock
                                      ? "bg-green-500"
                                      : "bg-blue-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      (item.currentStock / item.maximumStock) *
                                        100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>

                              {/* Marcadores de puntos críticos */}
                              <div className="absolute top-0 h-3 w-full">
                                {/* Punto mínimo */}
                                <div
                                  className="absolute top-0 w-0.5 h-3 bg-red-600"
                                  style={{
                                    left: `${
                                      (item.minimumStock / item.maximumStock) *
                                      100
                                    }%`,
                                  }}
                                />
                                {/* Punto de reorden */}
                                <div
                                  className="absolute top-0 w-0.5 h-3 bg-yellow-600"
                                  style={{
                                    left: `${
                                      (item.reorderPoint / item.maximumStock) *
                                      100
                                    }%`,
                                  }}
                                />
                                {/* Punto óptimo */}
                                <div
                                  className="absolute top-0 w-0.5 h-3 bg-green-600"
                                  style={{
                                    left: `${
                                      (item.optimalStock / item.maximumStock) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Leyenda de la barra */}
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                                  <span>Mín: {item.minimumStock}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                                  <span>Reorden: {item.reorderPoint}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                                  <span>Ópt: {item.optimalStock}</span>
                                </div>
                              </div>
                              <span>Máx: {item.maximumStock}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                          title="Editar item"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id, item.itemName)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors duration-200 flex items-center space-x-1"
                          title="Eliminar item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal de Nuevo Item */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Nuevo Item de Stock
                  </h2>
                  <button
                    onClick={() => setShowNewModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Item *
                      </label>
                      <input
                        type="text"
                        value={newFormData.itemName || ""}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            itemName: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría *
                      </label>
                      <select
                        value={newFormData.category || ""}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        <option value="Medicamentos">Medicamentos</option>
                        <option value="Vacunas">Vacunas</option>
                        <option value="Suplementos">Suplementos</option>
                        <option value="Equipos">Equipos</option>
                        <option value="Vitaminas">Vitaminas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Inicial
                      </label>
                      <input
                        type="number"
                        value={newFormData.currentStock || 0}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            currentStock: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Mínimo *
                      </label>
                      <input
                        type="number"
                        value={newFormData.minimumStock || 0}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            minimumStock: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Máximo *
                      </label>
                      <input
                        type="number"
                        value={newFormData.maximumStock || 0}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            maximumStock: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Punto de Reorden *
                      </label>
                      <input
                        type="number"
                        value={newFormData.reorderPoint || 0}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            reorderPoint: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Costo Unitario *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newFormData.unitCost || 0}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            unitCost: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Almacén *
                      </label>
                      <input
                        type="text"
                        value={newFormData.location?.warehouse || ""}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            location: {
                              warehouse: e.target.value,
                              zone: prev.location?.zone || "",
                              shelf: prev.location?.shelf || "",
                              position: prev.location?.position || "",
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estante
                      </label>
                      <input
                        type="text"
                        value={newFormData.location?.shelf || ""}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            location: {
                              warehouse: prev.location?.warehouse || "",
                              zone: prev.location?.zone || "",
                              shelf: e.target.value,
                              position: prev.location?.position || "",
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posición
                      </label>
                      <input
                        type="text"
                        value={newFormData.location?.position || ""}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            location: {
                              warehouse: prev.location?.warehouse || "",
                              zone: prev.location?.zone || "",
                              shelf: prev.location?.shelf || "",
                              position: e.target.value,
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proveedor Preferido
                      </label>
                      <input
                        type="text"
                        value={newFormData.preferredSupplier || ""}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            preferredSupplier: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newFormData.autoReorder || false}
                        onChange={(e) =>
                          setNewFormData((prev) => ({
                            ...prev,
                            autoReorder: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                      <label className="ml-2 text-sm font-medium text-gray-700">
                        Auto-Reorden Habilitado
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 mt-8">
                  <button
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveNew}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Creando...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Crear Item</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Editar Item */}
        {showEditModal && editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Editar Item de Stock
                  </h2>
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingItem(null);
                      setEditFormData({});
                    }}
                    className="text-gray-400 hover:text-gray-600"
                    disabled={isSubmitting}
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Item *
                      </label>
                      <input
                        type="text"
                        value={editFormData.itemName || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            itemName: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría *
                      </label>
                      <select
                        value={editFormData.category || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      >
                        <option value="">Seleccionar categoría</option>
                        <option value="Medicamentos">Medicamentos</option>
                        <option value="Vacunas">Vacunas</option>
                        <option value="Suplementos">Suplementos</option>
                        <option value="Equipos">Equipos</option>
                        <option value="Vitaminas">Vitaminas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Actual
                      </label>
                      <input
                        type="number"
                        value={editFormData.currentStock ?? 0}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            currentStock: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Mínimo *
                      </label>
                      <input
                        type="number"
                        value={editFormData.minimumStock ?? 0}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            minimumStock: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Stock Máximo *
                      </label>
                      <input
                        type="number"
                        value={editFormData.maximumStock ?? 0}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            maximumStock: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Punto de Reorden *
                      </label>
                      <input
                        type="number"
                        value={editFormData.reorderPoint ?? 0}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            reorderPoint: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Costo Unitario *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editFormData.unitCost ?? 0}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            unitCost: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Almacén *
                      </label>
                      <input
                        type="text"
                        value={editFormData.location?.warehouse || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            location: {
                              warehouse: e.target.value,
                              zone: prev.location?.zone || "",
                              shelf: prev.location?.shelf || "",
                              position: prev.location?.position || "",
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estante
                      </label>
                      <input
                        type="text"
                        value={editFormData.location?.shelf || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            location: {
                              warehouse: prev.location?.warehouse || "",
                              zone: prev.location?.zone || "",
                              shelf: e.target.value,
                              position: prev.location?.position || "",
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Posición
                      </label>
                      <input
                        type="text"
                        value={editFormData.location?.position || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            location: {
                              warehouse: prev.location?.warehouse || "",
                              zone: prev.location?.zone || "",
                              shelf: prev.location?.shelf || "",
                              position: e.target.value,
                            },
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Proveedor Preferido
                      </label>
                      <input
                        type="text"
                        value={editFormData.preferredSupplier || ""}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            preferredSupplier: e.target.value,
                          }))
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editFormData.autoReorder ?? false}
                        onChange={(e) =>
                          setEditFormData((prev) => ({
                            ...prev,
                            autoReorder: e.target.checked,
                          }))
                        }
                        className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                      <label className="ml-2 text-sm font-medium text-gray-700">
                        Auto-Reorden Habilitado
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 mt-8">
                  <button
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingItem(null);
                      setEditFormData({});
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Guardando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Guardar Cambios</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockLevels;