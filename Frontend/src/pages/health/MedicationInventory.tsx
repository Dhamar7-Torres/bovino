import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Calendar,
  Search,
  Filter,
  Plus,
  BarChart3,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface Medication {
  id: string;
  name: string;
  genericName?: string;
  category: "antibiotic" | "vaccine" | "antiparasitic" | "antiinflammatory" | "vitamin" | "hormone" | "anesthetic" | "other";
  manufacturer: string;
  supplier: string;
  description: string;
  activeIngredient: string;
  concentration: string;
  presentation: "injectable" | "oral" | "topical" | "powder" | "tablet" | "suspension";
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  location: {
    warehouse: string;
    shelf: string;
    position: string;
  };
  expirationDate: Date;
  batchNumber: string;
  registrationNumber: string;
  storageConditions: string;
  withdrawalPeriod?: number;
  requiresPrescription: boolean;
  isControlled: boolean;
  lastUpdated: Date;
  status: "available" | "low_stock" | "out_of_stock" | "expired" | "near_expiry";
}

interface InventoryMovement {
  id: string;
  medicationId: string;
  medicationName: string;
  type: "purchase" | "usage" | "adjustment" | "transfer" | "disposal" | "return";
  quantity: number;
  unitCost?: number;
  totalCost?: number;
  date: Date;
  reason: string;
  animalId?: string;
  animalName?: string;
  veterinarian?: string;
  supplier?: string;
  batchNumber?: string;
  expirationDate?: Date;
  location: string;
  performedBy: string;
  notes: string;
  referenceDocument?: string;
}

interface InventoryStats {
  totalMedications: number;
  totalValue: number;
  lowStockItems: number;
  expiredItems: number;
  nearExpiryItems: number;
  categoriesCount: number;
  monthlyConsumption: number;
  averageStockDays: number;
}

interface NewMedicationForm {
  name: string;
  genericName: string;
  category: string;
  manufacturer: string;
  supplier: string;
  description: string;
  activeIngredient: string;
  concentration: string;
  presentation: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitCost: number;
  warehouse: string;
  shelf: string;
  position: string;
  expirationDate: string;
  batchNumber: string;
  registrationNumber: string;
  storageConditions: string;
  withdrawalPeriod: number;
  requiresPrescription: boolean;
  isControlled: boolean;
}

// ============================================================================
// SERVICIO API
// ============================================================================

const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private static getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private static async fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getAuthToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response;
  }

  // Medicamentos
  static async getMedicines(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    location?: string;
  }): Promise<{ data: { medicines: Medication[]; total: number; }; message: string }> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.category && params.category !== 'all') queryParams.append('category', params.category);
    if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params?.location && params.location !== 'all') queryParams.append('location', params.location);

    const response = await this.fetchWithAuth(`/inventory/medicines?${queryParams}`);
    return response.json();
  }

  static async getMedicine(id: string): Promise<{ data: Medication; message: string }> {
    const response = await this.fetchWithAuth(`/inventory/medicines/${id}`);
    return response.json();
  }

  static async createMedicine(medication: Omit<NewMedicationForm, 'id'>): Promise<{ data: Medication; message: string }> {
    const medicationData = {
      ...medication,
      location: {
        warehouse: medication.warehouse,
        shelf: medication.shelf,
        position: medication.position,
      },
      totalValue: medication.currentStock * medication.unitCost,
    };

    const response = await this.fetchWithAuth('/inventory/medicines', {
      method: 'POST',
      body: JSON.stringify(medicationData),
    });
    return response.json();
  }

  static async updateMedicine(id: string, medication: Partial<NewMedicationForm>): Promise<{ data: Medication; message: string }> {
    const medicationData = {
      ...medication,
      ...(medication.warehouse && {
        location: {
          warehouse: medication.warehouse,
          shelf: medication.shelf,
          position: medication.position,
        },
      }),
      ...(medication.currentStock && medication.unitCost && {
        totalValue: medication.currentStock * medication.unitCost,
      }),
    };

    const response = await this.fetchWithAuth(`/inventory/medicines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(medicationData),
    });
    return response.json();
  }

  static async deleteMedicine(id: string): Promise<{ message: string }> {
    const response = await this.fetchWithAuth(`/inventory/medicines/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  }

  // Movimientos
  static async getMovements(params?: {
    page?: number;
    limit?: number;
    medicationId?: string;
    type?: string;
  }): Promise<{ data: { movements: InventoryMovement[]; total: number; }; message: string }> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.medicationId) queryParams.append('medicationId', params.medicationId);
    if (params?.type) queryParams.append('type', params.type);

    const response = await this.fetchWithAuth(`/inventory/movements?${queryParams}`);
    return response.json();
  }

  // Estadísticas
  static async getInventoryStats(): Promise<{ data: InventoryStats; message: string }> {
    const response = await this.fetchWithAuth('/inventory/stats');
    return response.json();
  }

  // Alertas
  static async getAlerts(): Promise<{ data: any[]; message: string }> {
    const response = await this.fetchWithAuth('/inventory/alerts');
    return response.json();
  }
}

// ============================================================================
// COMPONENTES BASE
// ============================================================================

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden w-full max-w-full ${className}`}>
    {children}
  </div>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div className={`p-2 sm:p-3 w-full max-w-full ${className}`}>{children}</div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "success" | "danger" | "warning";
  size?: "xs" | "sm" | "default" | "lg";
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  loading?: boolean;
}> = ({ 
  children, 
  onClick, 
  variant = "default", 
  size = "default", 
  className = "", 
  disabled = false, 
  fullWidth = false,
  loading = false 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 min-w-0";
  const variantClasses = {
    default: "bg-[#519a7c] text-white hover:bg-[#4a8770] focus:ring-[#519a7c] shadow-lg hover:shadow-xl",
    outline: "border-2 border-[#519a7c] bg-white/80 text-[#519a7c] hover:bg-[#519a7c] hover:text-white focus:ring-[#519a7c]",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-lg",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-lg",
    warning: "bg-amber-600 text-white hover:bg-amber-700 focus:ring-amber-500 shadow-lg",
  };
  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-2 sm:px-3 py-1.5 text-xs sm:text-sm",
    default: "px-3 sm:px-4 py-2 text-xs sm:text-sm",
    lg: "px-4 sm:px-6 py-3 text-sm sm:text-base",
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={onClick}
    >
      {loading && <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-2" />}
      <span className="truncate">{children}</span>
    </button>
  );
};

const Badge: React.FC<{ children: React.ReactNode; variant: string; className?: string }> = ({ children, variant, className = "" }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "available": return "bg-green-100 text-green-800 ring-green-600/30";
      case "low_stock": return "bg-amber-100 text-amber-800 ring-amber-600/30";
      case "out_of_stock": return "bg-red-100 text-red-800 ring-red-600/30";
      case "expired": return "bg-red-100 text-red-800 ring-red-600/30";
      case "near_expiry": return "bg-orange-100 text-orange-800 ring-orange-600/30";
      case "antibiotic": return "bg-blue-100 text-blue-800 ring-blue-600/30";
      case "vaccine": return "bg-purple-100 text-purple-800 ring-purple-600/30";
      case "antiparasitic": return "bg-green-100 text-green-800 ring-green-600/30";
      case "antiinflammatory": return "bg-amber-100 text-amber-800 ring-amber-600/30";
      case "vitamin": return "bg-orange-100 text-orange-800 ring-orange-600/30";
      case "hormone": return "bg-pink-100 text-pink-800 ring-pink-600/30";
      case "anesthetic": return "bg-indigo-100 text-indigo-800 ring-indigo-600/30";
      case "other": return "bg-gray-100 text-gray-800 ring-gray-600/30";
      case "success": return "bg-green-100 text-green-800 ring-green-600/30";
      case "warning": return "bg-amber-100 text-amber-800 ring-amber-600/30";
      default: return "bg-gray-100 text-gray-800 ring-gray-600/30";
    }
  };

  return (
    <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 rounded-lg text-xs font-medium ring-1 ring-inset whitespace-nowrap max-w-full truncate ${getVariantClasses(variant)} ${className}`}>
      {children}
    </span>
  );
};

// ============================================================================
// COMPONENTE DE ERROR
// ============================================================================

const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <Card>
    <CardContent className="p-8 text-center">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Error de Conexión</h3>
      <p className="text-sm text-gray-600 mb-4 max-w-full break-words">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Intentar de nuevo
        </Button>
      )}
    </CardContent>
  </Card>
);

// ============================================================================
// COMPONENTE DE CARGA
// ============================================================================

const LoadingSpinner: React.FC<{ message?: string }> = ({ message = "Cargando..." }) => (
  <Card>
    <CardContent className="p-8 text-center">
      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#519a7c]" />
      <p className="text-sm text-gray-600">{message}</p>
    </CardContent>
  </Card>
);

// ============================================================================
// MODAL DE NUEVO MEDICAMENTO (CONECTADO)
// ============================================================================

const NewMedicationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (medication: NewMedicationForm) => Promise<void>;
  editingMedication?: Medication | null;
}> = ({ isOpen, onClose, onSave, editingMedication }) => {
  const [formData, setFormData] = useState<NewMedicationForm>({
    name: "",
    genericName: "",
    category: "antibiotic",
    manufacturer: "",
    supplier: "",
    description: "",
    activeIngredient: "",
    concentration: "",
    presentation: "injectable",
    currentStock: 0,
    minStock: 0,
    maxStock: 0,
    unit: "",
    unitCost: 0,
    warehouse: "Almacén Principal",
    shelf: "",
    position: "",
    expirationDate: "",
    batchNumber: "",
    registrationNumber: "",
    storageConditions: "",
    withdrawalPeriod: 0,
    requiresPrescription: false,
    isControlled: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingMedication && isOpen) {
      setFormData({
        name: editingMedication.name,
        genericName: editingMedication.genericName || "",
        category: editingMedication.category,
        manufacturer: editingMedication.manufacturer,
        supplier: editingMedication.supplier,
        description: editingMedication.description,
        activeIngredient: editingMedication.activeIngredient,
        concentration: editingMedication.concentration,
        presentation: editingMedication.presentation,
        currentStock: editingMedication.currentStock,
        minStock: editingMedication.minStock,
        maxStock: editingMedication.maxStock,
        unit: editingMedication.unit,
        unitCost: editingMedication.unitCost,
        warehouse: editingMedication.location.warehouse,
        shelf: editingMedication.location.shelf,
        position: editingMedication.location.position,
        expirationDate: editingMedication.expirationDate.toISOString().split('T')[0],
        batchNumber: editingMedication.batchNumber,
        registrationNumber: editingMedication.registrationNumber,
        storageConditions: editingMedication.storageConditions,
        withdrawalPeriod: editingMedication.withdrawalPeriod || 0,
        requiresPrescription: editingMedication.requiresPrescription,
        isControlled: editingMedication.isControlled,
      });
    } else if (!editingMedication && isOpen) {
      setFormData({
        name: "",
        genericName: "",
        category: "antibiotic",
        manufacturer: "",
        supplier: "",
        description: "",
        activeIngredient: "",
        concentration: "",
        presentation: "injectable",
        currentStock: 0,
        minStock: 0,
        maxStock: 0,
        unit: "",
        unitCost: 0,
        warehouse: "Almacén Principal",
        shelf: "",
        position: "",
        expirationDate: "",
        batchNumber: "",
        registrationNumber: "",
        storageConditions: "",
        withdrawalPeriod: 0,
        requiresPrescription: false,
        isControlled: false,
      });
    }
    setError(null);
  }, [editingMedication, isOpen]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el medicamento');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="flex min-h-full items-end justify-center p-0 sm:p-2 text-center sm:items-center">
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          className="relative transform overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white/95 backdrop-blur-sm text-left shadow-2xl transition-all w-full max-w-3xl sm:max-h-[90vh] max-h-full"
        >
          {/* Fixed header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200/50">
            <div className="flex items-center justify-between min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">
                {editingMedication ? "Editar Medicamento" : "Nuevo Medicamento"}
              </h3>
              <button onClick={onClose} className="rounded-full p-2 hover:bg-gray-100 transition-colors flex-shrink-0">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="px-3 sm:px-6 pt-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable content */}
          <div className="overflow-y-auto max-h-[calc(100vh-140px)] sm:max-h-[calc(90vh-140px)] overflow-x-hidden">
            <div className="p-3 sm:p-6 w-full max-w-full">
              <div className="space-y-4 sm:space-y-6 w-full max-w-full">
                {/* Basic Info Section */}
                <div className="space-y-2 sm:space-y-3 w-full max-w-full">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Información Básica
                  </h4>
                  
                  <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                    <div className="w-full max-w-full">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Nombre Comercial *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
                      <div className="w-full max-w-full min-w-0">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Nombre Genérico
                        </label>
                        <input
                          type="text"
                          className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                          value={formData.genericName}
                          onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                        />
                      </div>

                      <div className="w-full max-w-full min-w-0">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Categoría *
                        </label>
                        <select
                          required
                          className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        >
                          <option value="antibiotic">Antibiótico</option>
                          <option value="vaccine">Vacuna</option>
                          <option value="antiparasitic">Antiparasitario</option>
                          <option value="antiinflammatory">Antiinflamatorio</option>
                          <option value="vitamin">Vitamina</option>
                          <option value="hormone">Hormona</option>
                          <option value="anesthetic">Anestésico</option>
                          <option value="other">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
                      <div className="w-full max-w-full min-w-0">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Fabricante *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                          value={formData.manufacturer}
                          onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                        />
                      </div>

                      <div className="w-full max-w-full min-w-0">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                          Proveedor *
                        </label>
                        <input
                          type="text"
                          required
                          className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                          value={formData.supplier}
                          onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pharmaceutical Info */}
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Información Farmacológica
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Principio Activo *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.activeIngredient}
                        onChange={(e) => setFormData({ ...formData, activeIngredient: e.target.value })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Concentración *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.concentration}
                        onChange={(e) => setFormData({ ...formData, concentration: e.target.value })}
                      />
                    </div>

                    <div className="sm:col-span-2 w-full max-w-full">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Presentación *
                      </label>
                      <select
                        required
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.presentation}
                        onChange={(e) => setFormData({ ...formData, presentation: e.target.value })}
                      >
                        <option value="injectable">Inyectable</option>
                        <option value="oral">Oral</option>
                        <option value="topical">Tópico</option>
                        <option value="powder">Polvo</option>
                        <option value="tablet">Tableta</option>
                        <option value="suspension">Suspensión</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Inventory Info */}
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Información de Inventario
                  </h4>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4 w-full max-w-full">
                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stock Actual *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full max-w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs"
                        value={formData.currentStock}
                        onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stock Mínimo *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full max-w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Stock Máximo *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        className="w-full max-w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs"
                        value={formData.maxStock}
                        onChange={(e) => setFormData({ ...formData, maxStock: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Unidad *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ej: frascos 100ml"
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Costo Unitario ($) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.unitCost}
                        onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Location Info */}
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Ubicación
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 w-full max-w-full">
                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Almacén *
                      </label>
                      <select
                        required
                        className="w-full max-w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs"
                        value={formData.warehouse}
                        onChange={(e) => setFormData({ ...formData, warehouse: e.target.value })}
                      >
                        <option value="Almacén Principal">Principal</option>
                        <option value="Almacén Secundario">Secundario</option>
                        <option value="Refrigerador">Refrigerador</option>
                      </select>
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Estante *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="A-1"
                        className="w-full max-w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs"
                        value={formData.shelf}
                        onChange={(e) => setFormData({ ...formData, shelf: e.target.value })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Posición *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="01"
                        className="w-full max-w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs"
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Batch Info */}
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Información del Lote
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Fecha de Vencimiento *
                      </label>
                      <input
                        type="date"
                        required
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.expirationDate}
                        onChange={(e) => setFormData({ ...formData, expirationDate: e.target.value })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Número de Lote *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.batchNumber}
                        onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Registro SENASA
                      </label>
                      <input
                        type="text"
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.registrationNumber}
                        onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                      />
                    </div>

                    <div className="w-full max-w-full min-w-0">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                        Período de Retiro (días)
                      </label>
                      <input
                        type="number"
                        min="0"
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={formData.withdrawalPeriod}
                        onChange={(e) => setFormData({ ...formData, withdrawalPeriod: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                  <h4 className="text-sm sm:text-base font-medium text-gray-900 border-b border-gray-200 pb-2">
                    Información Adicional
                  </h4>
                  
                  <div className="w-full max-w-full">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Descripción *
                    </label>
                    <textarea
                      required
                      rows={3}
                      className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>

                  <div className="w-full max-w-full">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Condiciones de Almacenamiento *
                    </label>
                    <textarea
                      required
                      rows={2}
                      placeholder="ej: Refrigeración 2-8°C"
                      className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm resize-none"
                      value={formData.storageConditions}
                      onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3 w-full max-w-full">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="requiresPrescription"
                        className="h-4 w-4 text-[#519a7c] focus:ring-[#519a7c] border-gray-300 rounded"
                        checked={formData.requiresPrescription}
                        onChange={(e) => setFormData({ ...formData, requiresPrescription: e.target.checked })}
                      />
                      <label htmlFor="requiresPrescription" className="ml-2 text-xs sm:text-sm text-gray-700">
                        Requiere Prescripción Veterinaria
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isControlled"
                        className="h-4 w-4 text-[#519a7c] focus:ring-[#519a7c] border-gray-300 rounded"
                        checked={formData.isControlled}
                        onChange={(e) => setFormData({ ...formData, isControlled: e.target.checked })}
                      />
                      <label htmlFor="isControlled" className="ml-2 text-xs sm:text-sm text-gray-700">
                        Sustancia Controlada
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed bottom buttons */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 px-3 sm:px-6 py-3 sm:py-4">
            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full max-w-full">
              <Button variant="outline" onClick={onClose} fullWidth className="sm:w-auto">
                Cancelar
              </Button>
              <Button onClick={handleSubmit} fullWidth className="sm:w-auto" loading={loading}>
                <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span className="truncate">{editingMedication ? "Actualizar" : "Guardar"}</span>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL - CONECTADO AL BACKEND
// ============================================================================

const MedicationInventory: React.FC = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalMedications: 0,
    totalValue: 0,
    lowStockItems: 0,
    expiredItems: 0,
    nearExpiryItems: 0,
    categoriesCount: 0,
    monthlyConsumption: 0,
    averageStockDays: 0,
  });

  // Estados de UI
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("all");
  const [showMovements, setShowMovements] = useState(false);
  const [showNewMedicationModal, setShowNewMedicationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [medicationToDelete, setMedicationToDelete] = useState<Medication | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Estados de carga y error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [, setTotalItems] = useState(0);

  // ============================================================================
  // FUNCIONES DE CARGA DE DATOS
  // ============================================================================

  const loadMedicines = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ApiService.getMedicines({
        page: currentPage,
        limit: 20,
        search: searchTerm || undefined,
        category: selectedCategory !== "all" ? selectedCategory : undefined,
        status: selectedStatus !== "all" ? selectedStatus : undefined,
        location: selectedLocation !== "all" ? selectedLocation : undefined,
      });

      const medicationsData = response.data.medicines.map(med => ({
        ...med,
        expirationDate: new Date(med.expirationDate),
        lastUpdated: new Date(med.lastUpdated),
      }));

      setMedications(medicationsData);
      setTotalItems(response.data.total);
      setTotalPages(Math.ceil(response.data.total / 20));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar medicamentos');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await ApiService.getInventoryStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadMovements = async () => {
    try {
      const response = await ApiService.getMovements({ page: 1, limit: 20 });
      const movementsData = response.data.movements.map(mov => ({
        ...mov,
        date: new Date(mov.date),
      }));
      setMovements(movementsData);
    } catch (err) {
      console.error('Error loading movements:', err);
    }
  };

  // ============================================================================
  // EFECTOS
  // ============================================================================

  useEffect(() => {
    loadMedicines();
  }, [currentPage, searchTerm, selectedCategory, selectedStatus, selectedLocation]);

  useEffect(() => {
    loadStats();
    loadMovements();
  }, []);

  // ============================================================================
  // HANDLERS DE ACCIONES
  // ============================================================================

  const handleNewMedication = async (medicationData: NewMedicationForm) => {
    setActionLoading(true);
    try {
      if (editingMedication) {
        await ApiService.updateMedicine(editingMedication.id, medicationData);
      } else {
        await ApiService.createMedicine(medicationData);
      }
      
      await loadMedicines();
      await loadStats();
      setEditingMedication(null);
    } catch (err) {
      throw err; // Re-throw para que el modal maneje el error
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewMedication = (medication: Medication) => {
    setSelectedMedication(medication);
    setShowDetailsModal(true);
  };

  const handleEditMedication = (medication: Medication) => {
    setEditingMedication(medication);
    setShowNewMedicationModal(true);
  };

  const handleDeleteMedication = (medication: Medication) => {
    setMedicationToDelete(medication);
    setShowDeleteModal(true);
  };

  const confirmDeleteMedication = async () => {
    if (!medicationToDelete) return;

    setActionLoading(true);
    try {
      await ApiService.deleteMedicine(medicationToDelete.id);
      await loadMedicines();
      await loadStats();
      setMedicationToDelete(null);
      setShowDeleteModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar medicamento');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowNewMedicationModal(false);
    setEditingMedication(null);
  };

  const handleRetry = () => {
    loadMedicines();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading && medications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] overflow-x-hidden max-w-screen">
        <div className="w-full max-w-5xl mx-auto p-2 sm:p-3 lg:p-4 space-y-3 sm:space-y-4 overflow-x-hidden">
          <LoadingSpinner message="Conectando con el servidor..." />
        </div>
      </div>
    );
  }

  if (error && medications.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] overflow-x-hidden max-w-screen">
        <div className="w-full max-w-5xl mx-auto p-2 sm:p-3 lg:p-4 space-y-3 sm:space-y-4 overflow-x-hidden">
          <ErrorMessage message={error} onRetry={handleRetry} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] overflow-x-hidden max-w-screen">
      <div className="w-full max-w-5xl mx-auto p-2 sm:p-3 lg:p-4 space-y-3 sm:space-y-4 overflow-x-hidden">
        {/* Header */}
        <Card>
          <CardContent className="p-3 sm:p-4 w-full max-w-full">
            <div className="flex items-center justify-between mb-3 sm:mb-4 min-w-0 w-full max-w-full">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#519a7c] to-[#4a8770] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1 max-w-full">
                  <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Inventario de Medicamentos</h1>
                  <p className="text-xs text-gray-600 truncate">Gestión y control veterinario</p>
                </div>
              </div>
              <Button onClick={() => setShowNewMedicationModal(true)} className="flex-shrink-0">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Agregar</span>
                <span className="sm:hidden">+</span>
              </Button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mb-3 sm:mb-4 w-full max-w-full">
              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 min-w-0 max-w-full">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="text-lg sm:text-2xl font-bold text-blue-600">{stats.totalMedications}</div>
                <div className="text-xs text-blue-600 truncate">Total</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 min-w-0 max-w-full">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="text-white text-xs font-bold">$</div>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-green-600">${stats.totalValue.toLocaleString()}</div>
                <div className="text-xs text-green-600 truncate">Valor</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200 min-w-0 max-w-full">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-amber-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="text-white text-xs font-bold">⚠</div>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-amber-600">{stats.lowStockItems}</div>
                <div className="text-xs text-amber-600 truncate">Stock Bajo</div>
              </div>
              <div className="text-center p-2 sm:p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200 min-w-0 max-w-full">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-lg flex items-center justify-center mx-auto mb-2">
                  <div className="text-white text-xs font-bold">⏰</div>
                </div>
                <div className="text-lg sm:text-2xl font-bold text-red-600">{stats.nearExpiryItems}</div>
                <div className="text-xs text-red-600 truncate">Por Vencer</div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-red-800">{error}</p>
                    <button 
                      onClick={() => setError(null)}
                      className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                    >
                      Ocultar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Search and filters */}
            <div className="space-y-3 sm:space-y-4 w-full max-w-full">
              <div className="relative w-full max-w-full">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar medicamentos..."
                  className="w-full max-w-full pl-9 sm:pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm shadow-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {loading && (
                  <Loader2 className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 animate-spin" />
                )}
              </div>

              <div className="flex gap-2 sm:gap-3 w-full max-w-full">
                <Button 
                  variant="outline" 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex-1 min-w-0"
                >
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="truncate">Filtros</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowMovements(!showMovements)}
                  className="flex-1 min-w-0"
                >
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  <span className="truncate">{showMovements ? "Inventario" : "Movimientos"}</span>
                </Button>
              </div>
            </div>

            {/* Filtros colapsables */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden w-full max-w-full"
                >
                  <div className="pt-4 sm:pt-6 space-y-3 sm:space-y-4 w-full max-w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 w-full max-w-full">
                      <select
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                      >
                        <option value="all">Todas las categorías</option>
                        <option value="antibiotic">Antibióticos</option>
                        <option value="vaccine">Vacunas</option>
                        <option value="antiparasitic">Antiparasitarios</option>
                        <option value="vitamin">Vitaminas</option>
                        <option value="hormone">Hormonas</option>
                        <option value="anesthetic">Anestésicos</option>
                        <option value="other">Otros</option>
                      </select>

                      <select
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                      >
                        <option value="all">Todos los estados</option>
                        <option value="available">Disponible</option>
                        <option value="low_stock">Stock bajo</option>
                        <option value="out_of_stock">Sin stock</option>
                        <option value="near_expiry">Por vencer</option>
                        <option value="expired">Vencido</option>
                      </select>

                      <select
                        className="w-full max-w-full px-2 sm:px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] text-xs sm:text-sm"
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                      >
                        <option value="all">Todas las ubicaciones</option>
                        <option value="Almacén Principal">Almacén Principal</option>
                        <option value="Almacén Secundario">Almacén Secundario</option>
                        <option value="Refrigerador">Refrigerador</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Content area */}
        <AnimatePresence mode="wait">
          {!showMovements ? (
            <motion.div key="inventory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {loading ? (
                <LoadingSpinner message="Cargando medicamentos..." />
              ) : medications.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                  {/* Medication cards with simplified design for demo */}
                  {medications.map((med) => (
                    <Card key={med.id}>
                      <CardContent className="p-3 w-full max-w-full">
                        <div className="flex items-start justify-between gap-2 min-w-0 w-full max-w-full">
                          <div className="min-w-0 flex-1 max-w-full">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate min-w-0 max-w-full">
                                {med.name}
                              </h3>
                              <Badge variant={med.status}>
                                {med.status === "available" ? "✓" :
                                 med.status === "low_stock" ? "⚠" :
                                 med.status === "out_of_stock" ? "✗" :
                                 med.status === "near_expiry" ? "⏰" : "❌"}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-gray-600 w-full max-w-full">
                              <span className="flex items-center gap-1 min-w-0 flex-1">
                                <Package className="w-3 h-3 flex-shrink-0" />
                                <span className={`font-medium ${
                                  med.currentStock <= med.minStock ? "text-red-600" :
                                  med.currentStock <= med.minStock * 1.5 ? "text-amber-600" : "text-green-600"
                                }`}>
                                  {med.currentStock}
                                </span>
                                <span className="truncate">/ {med.minStock} {med.unit}</span>
                              </span>
                              <span className="font-medium flex-shrink-0">${med.totalValue.toFixed(0)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => handleViewMedication(med)}
                              className="p-1.5 rounded-lg hover:bg-[#519a7c]/10 text-[#519a7c] transition-colors"
                            >
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleEditMedication(med)}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                            >
                              <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteMedication(med)}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                            >
                              <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        size="sm"
                      >
                        Anterior
                      </Button>
                      <span className="text-sm text-gray-600">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button 
                        variant="outline" 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        size="sm"
                      >
                        Siguiente
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 sm:p-12 text-center w-full max-w-full">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No hay medicamentos</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-full break-words">
                      No se encontraron medicamentos que coincidan con los filtros seleccionados.
                    </p>
                    <Button onClick={() => setShowNewMedicationModal(true)}>
                      <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="truncate">Agregar Primer Medicamento</span>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          ) : (
            <motion.div key="movements" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="space-y-3 sm:space-y-4 w-full max-w-full">
                {movements.map((movement) => (
                  <Card key={movement.id}>
                    <CardContent className="p-3 sm:p-4 w-full max-w-full">
                      <div className="flex items-start justify-between gap-3 min-w-0 w-full max-w-full">
                        <div className="min-w-0 flex-1 max-w-full">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate min-w-0 max-w-full">
                              {movement.medicationName}
                            </h3>
                            <Badge variant={movement.type === "purchase" ? "success" : movement.type === "usage" ? "warning" : "other"}>
                              {movement.type === "purchase" ? "Compra" :
                               movement.type === "usage" ? "Uso" :
                               movement.type === "adjustment" ? "Ajuste" :
                               movement.type === "transfer" ? "Transferencia" :
                               movement.type === "disposal" ? "Descarte" : "Devolución"}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center justify-between text-xs text-gray-600 mb-2 w-full max-w-full">
                            <span className="flex items-center gap-1 min-w-0 flex-1">
                              <Calendar className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{movement.date.toLocaleDateString()}</span>
                            </span>
                            <span className={`font-medium text-sm ${
                              movement.quantity > 0 ? "text-green-600" : "text-red-600"
                            } flex-shrink-0`}>
                              {movement.quantity > 0 ? "+" : ""}{movement.quantity}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 break-words w-full max-w-full">
                            <strong>Motivo:</strong> {movement.reason}
                          </p>

                          {movement.notes && (
                            <p className="text-xs text-gray-600 break-words mt-1 w-full max-w-full">
                              <strong>Notas:</strong> {movement.notes}
                            </p>
                          )}

                          {movement.totalCost && (
                            <p className="text-xs text-gray-600 mt-1">
                              <strong>Costo:</strong> ${movement.totalCost.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modals */}
        <NewMedicationModal
          isOpen={showNewMedicationModal}
          onClose={handleCloseModal}
          onSave={handleNewMedication}
          editingMedication={editingMedication}
        />

        {/* Details Modal - Simplified version */}
        {showDetailsModal && selectedMedication && (
          <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDetailsModal(false)} />
            
            <div className="flex min-h-full items-end justify-center p-0 sm:p-2 text-center sm:items-center">
              <motion.div
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 100 }}
                className="relative transform overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white/95 backdrop-blur-sm text-left shadow-2xl transition-all w-full max-w-xl max-h-full"
              >
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-200/50">
                  <div className="flex items-center justify-between min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate pr-2">
                      {selectedMedication.name}
                    </h3>
                    <button onClick={() => setShowDetailsModal(false)} className="rounded-full p-2 hover:bg-gray-100 transition-colors flex-shrink-0">
                      <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[calc(100vh-120px)] p-3 sm:p-4 space-y-4 overflow-x-hidden">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-full">
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-[#519a7c]/10 to-[#519a7c]/5 rounded-xl border border-[#519a7c]/20 min-w-0 max-w-full">
                      <div className={`text-xl sm:text-2xl font-bold ${
                        selectedMedication.currentStock <= selectedMedication.minStock ? "text-red-600" :
                        selectedMedication.currentStock <= selectedMedication.minStock * 1.5 ? "text-amber-600" : "text-green-600"
                      }`}>
                        {selectedMedication.currentStock}
                      </div>
                      <div className="text-xs text-gray-600 break-words">{selectedMedication.unit} en stock</div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-[#f4ac3a]/10 to-[#f4ac3a]/5 rounded-xl border border-[#f4ac3a]/20 min-w-0 max-w-full">
                      <div className="text-xl sm:text-2xl font-bold text-gray-900">
                        ${selectedMedication.totalValue.toFixed(0)}
                      </div>
                      <div className="text-xs text-gray-600">Valor total</div>
                    </div>
                  </div>

                  <div className="space-y-4 text-xs sm:text-sm w-full max-w-full">
                    <div className="bg-gradient-to-r from-white to-gray-50/50 p-3 sm:p-4 rounded-xl w-full max-w-full">
                      <h4 className="font-medium text-gray-900 mb-2">Información Básica</h4>
                      <div className="space-y-2 w-full max-w-full">
                        <div className="min-w-0 max-w-full">
                          <span className="text-gray-600">Categoría: </span>
                          <Badge variant={selectedMedication.category}>
                            {selectedMedication.category === "antibiotic" ? "Antibiótico" :
                             selectedMedication.category === "vaccine" ? "Vacuna" :
                             selectedMedication.category === "antiparasitic" ? "Antiparasitario" :
                             selectedMedication.category === "antiinflammatory" ? "Antiinflamatorio" :
                             selectedMedication.category === "vitamin" ? "Vitamina" :
                             selectedMedication.category === "hormone" ? "Hormona" :
                             selectedMedication.category === "anesthetic" ? "Anestésico" : "Otro"}
                          </Badge>
                        </div>
                        <div className="min-w-0 max-w-full">
                          <span className="text-gray-600">Fabricante: </span>
                          <span className="font-medium break-words">{selectedMedication.manufacturer}</span>
                        </div>
                        <div className="min-w-0 max-w-full">
                          <span className="text-gray-600">Proveedor: </span>
                          <span className="font-medium break-words">{selectedMedication.supplier}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t border-gray-200/50 px-3 sm:px-4 py-3 sm:py-4">
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)} fullWidth>
                    Cerrar
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && medicationToDelete && (
          <div className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
            
            <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-sm text-left shadow-2xl transition-all w-full max-w-md"
              >
                <div className="p-4 sm:p-6 w-full max-w-full">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 min-w-0 w-full max-w-full">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1 max-w-full">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">Eliminar Medicamento</h3>
                      <p className="text-xs sm:text-sm text-gray-600">Esta acción no se puede deshacer</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-4 sm:mb-6 w-full max-w-full">
                    ¿Estás seguro de que deseas eliminar <strong className="break-words">"{medicationToDelete.name}"</strong>?
                  </p>
                  
                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 w-full max-w-full">
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)} fullWidth className="sm:w-auto">
                      Cancelar
                    </Button>
                    <Button variant="danger" onClick={confirmDeleteMedication} fullWidth className="sm:w-auto" loading={actionLoading}>
                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                      <span className="truncate">Eliminar</span>
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicationInventory;