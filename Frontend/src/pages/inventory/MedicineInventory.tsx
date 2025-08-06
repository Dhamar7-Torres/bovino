import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  X, 
  Save, 
  Search, 
  Wifi, 
  WifiOff, 
  Loader2, 
  RefreshCw, 
  Package, 
  AlertTriangle, 
  CheckCircle, 
  TrendingDown, 
  Calendar,
  DollarSign
} from "lucide-react";

// Interfaces para tipos de datos
interface Medicine {
  id: string;
  name: string;
  category: string;
  manufacturer: string;
  activeIngredient?: string;
  concentration?: string;
  stock: number;
  minStock?: number;
  price: number;
  expirationDate?: string;
  batchNumber?: string;
  description: string;
  requiresRefrigeration?: boolean;
  controlledSubstance?: boolean;
  location?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
}

interface InventoryStats {
  totalMedicines: number;
  lowStockCount: number;
  expiringCount: number;
  totalValue: number;
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

interface ConnectionStatus {
  isConnected: boolean;
  lastCheck: Date;
  latency: number;
  retrying: boolean;
}

// ✅ CONFIGURACIÓN DE API
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// ✅ SERVICIO DE API PARA MEDICAMENTOS
class MedicineApiService {
  private baseURL: string;
  private timeout: number;
  
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // 🚀 Obtener token de autenticación
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || null;
  }

  // 🚀 Headers por defecto
  private getDefaultHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  // 🚀 Realizar petición con timeout y retry
  private async fetchWithRetry(
    url: string, 
    options: RequestInit = {}, 
    retries = API_CONFIG.RETRY_ATTEMPTS
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getDefaultHeaders(),
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (retries > 0 && (error as Error).name !== 'AbortError') {
        console.log(`🔄 Reintentando petición... ${retries} intentos restantes`);
        await new Promise(resolve => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
        return this.fetchWithRetry(url, options, retries - 1);
      }
      
      throw error;
    }
  }

  // 🚀 Verificar conexión con el backend
  async checkConnection(): Promise<{ connected: boolean; latency: number; message: string }> {
    const startTime = Date.now();
    
    try {
      const response = await this.fetchWithRetry(`${this.baseURL}/ping`, {
        method: 'GET',
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        return {
          connected: true,
          latency,
          message: data.message || 'Conexión exitosa'
        };
      } else {
        return {
          connected: false,
          latency,
          message: `Error HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      
      if ((error as Error).name === 'AbortError') {
        return {
          connected: false,
          latency,
          message: 'Timeout: El servidor no responde'
        };
      }

      return {
        connected: false,
        latency,
        message: `Error de conexión: ${(error as Error).message}`
      };
    }
  }

  // 🚀 Obtener medicamentos
  async getMedicines(): Promise<Medicine[]> {
    try {
      console.log('🔄 Obteniendo medicamentos desde el backend...');
      
      const response = await this.fetchWithRetry(`${this.baseURL}/inventory/medicines`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Medicamentos obtenidos exitosamente:', data);
      
      // Procesar datos para asegurar formato correcto
      const medicines = (data.data || data.medicines || []).map((medicine: any) => ({
        ...medicine,
        createdAt: medicine.createdAt ? new Date(medicine.createdAt) : new Date(),
        updatedAt: medicine.updatedAt ? new Date(medicine.updatedAt) : new Date(),
      }));

      return medicines;
    } catch (error) {
      console.warn('❌ API no disponible, usando datos mock:', error);
      return getMockMedicines();
    }
  }

  // 🚀 Crear medicamento
  async createMedicine(medicineData: Partial<Medicine>): Promise<Medicine> {
    try {
      console.log('🔄 Creando nuevo medicamento...', medicineData);

      const response = await this.fetchWithRetry(`${this.baseURL}/inventory/medicines`, {
        method: 'POST',
        body: JSON.stringify(medicineData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Medicamento creado exitosamente:', data);
      
      return {
        ...data.data,
        createdAt: new Date(data.data.createdAt),
        updatedAt: new Date(data.data.updatedAt),
      };
    } catch (error) {
      console.warn('❌ API no disponible, simulando creación:', error);
      
      // Fallback: crear medicamento mock
      const newMedicine: Medicine = {
        id: `mock_${Date.now()}`,
        name: medicineData.name || "Sin nombre",
        category: medicineData.category || "antibiotic",
        manufacturer: medicineData.manufacturer || "Sin especificar",
        activeIngredient: medicineData.activeIngredient || "",
        concentration: medicineData.concentration || "",
        stock: medicineData.stock || 0,
        minStock: medicineData.minStock || 5,
        price: medicineData.price || 0,
        expirationDate: medicineData.expirationDate || "",
        batchNumber: medicineData.batchNumber || "",
        description: medicineData.description || "",
        requiresRefrigeration: medicineData.requiresRefrigeration || false,
        controlledSubstance: medicineData.controlledSubstance || false,
        location: medicineData.location || "Almacén Principal",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: "Usuario Mock",
      };
      
      return newMedicine;
    }
  }

  // 🚀 Actualizar medicamento
  async updateMedicine(id: string, medicineData: Partial<Medicine>): Promise<Medicine> {
    try {
      console.log(`🔄 Actualizando medicamento ${id}...`);

      const response = await this.fetchWithRetry(`${this.baseURL}/inventory/medicines/${id}`, {
        method: 'PUT',
        body: JSON.stringify(medicineData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Medicamento actualizado exitosamente');
      
      return {
        ...data.data,
        updatedAt: new Date(),
      };
    } catch (error) {
      console.warn('❌ API no disponible, simulando actualización:', error);
      return { ...medicineData, id, updatedAt: new Date() } as Medicine;
    }
  }

  // 🚀 Eliminar medicamento
  async deleteMedicine(id: string): Promise<boolean> {
    try {
      console.log(`🔄 Eliminando medicamento ${id}...`);

      const response = await this.fetchWithRetry(`${this.baseURL}/inventory/medicines/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      console.log('✅ Medicamento eliminado exitosamente');
      return true;
    } catch (error) {
      console.warn('❌ API no disponible, simulando eliminación:', error);
      return true;
    }
  }

  // 🚀 Obtener estadísticas de inventario
  async getInventoryStats(): Promise<InventoryStats> {
    try {
      console.log('🔄 Obteniendo estadísticas de inventario...');

      const response = await this.fetchWithRetry(`${this.baseURL}/inventory/stats`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Estadísticas obtenidas exitosamente');
      return data.data;
    } catch (error) {
      console.warn('❌ API no disponible, usando estadísticas mock:', error);
      return getMockStats();
    }
  }
}

// 🚀 Hook para monitorear conexión
const useConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastCheck: new Date(),
    latency: 0,
    retrying: false,
  });

  const apiService = new MedicineApiService();

  const checkConnection = async () => {
    setStatus(prev => ({ ...prev, retrying: true }));
    
    try {
      const result = await apiService.checkConnection();
      setStatus({
        isConnected: result.connected,
        lastCheck: new Date(),
        latency: result.latency,
        retrying: false,
      });
    } catch (error) {
      setStatus({
        isConnected: false,
        lastCheck: new Date(),
        latency: 0,
        retrying: false,
      });
    }
  };

  useEffect(() => {
    // Verificar conexión al montar
    checkConnection();
    
    // Verificar conexión cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return { status, checkConnection };
};

// Datos mock para desarrollo y fallback
function getMockMedicines(): Medicine[] {
  return [
    {
      id: "mock_1",
      name: "Penicilina G",
      category: "antibiotic",
      manufacturer: "FarmVet",
      activeIngredient: "Bencilpenicilina",
      concentration: "1.000.000 UI/vial",
      stock: 15,
      minStock: 5,
      price: 45.50,
      expirationDate: "2025-12-31",
      batchNumber: "PEN2024-001",
      description: "Antibiótico de amplio espectro para infecciones bacterianas",
      requiresRefrigeration: true,
      controlledSubstance: false,
      location: "Refrigerador A-1",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-07-20"),
      createdBy: "Dr. García"
    },
    {
      id: "mock_2",
      name: "Vacuna Triple Bovina",
      category: "vaccine",
      manufacturer: "BioVet Labs",
      activeIngredient: "Virus inactivados IBR, BVD, PI3",
      concentration: "Dosis única 2ml",
      stock: 8,
      minStock: 10,
      price: 125.00,
      expirationDate: "2025-06-15",
      batchNumber: "VAC2024-TB-003",
      description: "Vacuna para prevención de rinotraqueítis, diarrea viral y parainfluenza",
      requiresRefrigeration: true,
      controlledSubstance: false,
      location: "Refrigerador B-2",
      createdAt: new Date("2024-02-20"),
      updatedAt: new Date("2024-07-18"),
      createdBy: "Dr. Martínez"
    },
  ];
}

function getMockStats(): InventoryStats {
  return {
    totalMedicines: 25,
    lowStockCount: 3,
    expiringCount: 2,
    totalValue: 12450.75,
    topCategories: [
      { category: "Antibióticos", count: 8 },
      { category: "Vacunas", count: 6 },
      { category: "Antiparasitarios", count: 5 },
      { category: "Vitaminas", count: 4 },
    ]
  };
}

// 🚀 Componente indicador de conexión
const ConnectionIndicator = () => {
  const { status, checkConnection } = useConnectionStatus();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2">
        {status.isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-600" />
            <span className="text-xs text-green-600 font-medium">
              Conectado ({status.latency}ms)
            </span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-600" />
            <span className="text-xs text-red-600 font-medium">Desconectado</span>
          </>
        )}
      </div>
      
      <button
        onClick={checkConnection}
        disabled={status.retrying}
        className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
        title="Verificar conexión"
      >
        {status.retrying ? (
          <Loader2 className="w-3 h-3 animate-spin text-gray-600" />
        ) : (
          <RefreshCw className="w-3 h-3 text-gray-600 hover:text-gray-800" />
        )}
      </button>
    </div>
  );
};

// Componentes reutilizables
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/40 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200/40 bg-gradient-to-r from-[#519a7c]/20 to-[#f4ac3a]/20">{children}</div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600 mt-1">{children}</p>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Button = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  type = "button"
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "success" | "danger" | "warning";
  size?: "sm" | "default";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    default: "bg-[#519a7c] text-white hover:bg-[#519a7c]/90 focus:ring-[#519a7c]/50",
    outline: "border border-[#519a7c]/60 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-[#519a7c]/10 focus:ring-[#519a7c]/50",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant, className = "" }: {
  children: React.ReactNode;
  variant: string;
  className?: string;
}) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "low-stock":
        return "bg-red-100 text-red-800 border-red-200";
      case "expiring":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "refrigerated":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "controlled":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "good-stock":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(
        variant
      )} ${className}`}
    >
      {children}
    </span>
  );
};

// Modal de carga
const LoadingModal = ({ isOpen, message }: { isOpen: boolean; message: string }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-lg rounded-lg p-6 shadow-xl border border-[#519a7c]/30">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#519a7c] border-t-transparent"></div>
          <span className="text-gray-700 font-medium">{message}</span>
        </div>
      </div>
    </div>
  );
};

// Modal de confirmación
const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger"
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "default";
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-lg rounded-lg shadow-xl border border-[#519a7c]/30 max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            {variant === "danger" && <AlertTriangle className="w-6 h-6 text-red-600" />}
            {variant === "warning" && <AlertTriangle className="w-6 h-6 text-yellow-600" />}
            {variant === "default" && <CheckCircle className="w-6 h-6 text-[#519a7c]" />}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              {cancelText}
            </Button>
            <Button variant={variant} onClick={onConfirm}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Formulario de medicamento mejorado
const MedicineFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  medicine, 
  isEditing = false 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (medicine: Partial<Medicine>) => void;
  medicine?: Medicine;
  isEditing?: boolean;
}) => {
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: "",
    category: "antibiotic",
    manufacturer: "",
    activeIngredient: "",
    concentration: "",
    stock: 0,
    minStock: 5,
    price: 0,
    expirationDate: "",
    batchNumber: "",
    description: "",
    requiresRefrigeration: false,
    controlledSubstance: false,
    location: "Almacén Principal",
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Categorías de medicamentos
  const categories = [
    { value: "antibiotic", label: "Antibiótico" },
    { value: "vaccine", label: "Vacuna" },
    { value: "antiparasitic", label: "Antiparasitario" },
    { value: "antiinflammatory", label: "Antiinflamatorio" },
    { value: "analgesic", label: "Analgésico" },
    { value: "vitamin", label: "Vitamina" },
    { value: "mineral", label: "Mineral" },
    { value: "hormone", label: "Hormonal" },
    { value: "anesthetic", label: "Anestésico" },
    { value: "antidiarrheal", label: "Antidiarreico" },
    { value: "respiratory", label: "Respiratorio" },
    { value: "dermatological", label: "Dermatológico" },
    { value: "reproductive", label: "Reproductivo" },
    { value: "immunomodulator", label: "Inmunomodulador" },
    { value: "antiseptic", label: "Antiséptico" },
  ];

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      errors.name = "El nombre es obligatorio";
    }

    if (!formData.manufacturer?.trim()) {
      errors.manufacturer = "El fabricante es obligatorio";
    }

    if (!formData.activeIngredient?.trim()) {
      errors.activeIngredient = "El principio activo es obligatorio";
    }

    if (!formData.concentration?.trim()) {
      errors.concentration = "La concentración es obligatoria";
    }

    if (formData.stock === undefined || formData.stock < 0) {
      errors.stock = "El stock debe ser mayor o igual a 0";
    }

    if (formData.price === undefined || formData.price < 0) {
      errors.price = "El precio debe ser mayor o igual a 0";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (medicine && isEditing) {
      setFormData(medicine);
    } else if (isOpen) {
      // Reset form for new medicine
      setFormData({
        name: "",
        category: "antibiotic",
        manufacturer: "",
        activeIngredient: "",
        concentration: "",
        stock: 0,
        minStock: 5,
        price: 0,
        expirationDate: "",
        batchNumber: "",
        description: "",
        requiresRefrigeration: false,
        controlledSubstance: false,
        location: "Almacén Principal",
      });
      setFormErrors({});
    }
  }, [medicine, isEditing, isOpen]);

  const handleSubmit = () => {
    if (!validateForm()) {
      alert('Por favor corrija los errores en el formulario antes de continuar.');
      return;
    }

    console.log('🚀 Enviando datos del medicamento:', formData);
    onSave(formData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error si el campo se corrige
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-lg rounded-lg shadow-xl border border-[#519a7c]/30 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-[#519a7c]/20 to-[#f4ac3a]/20 px-6 py-4 border-b border-gray-200/40">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? "Editar Medicamento" : "Nuevo Medicamento"}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#519a7c]" />
                Información Básica
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Medicamento *</label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.category}
                  onChange={(e) => updateFormData("category", e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fabricante *</label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] ${
                    formErrors.manufacturer ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.manufacturer}
                  onChange={(e) => updateFormData("manufacturer", e.target.value)}
                />
                {formErrors.manufacturer && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.manufacturer}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Principio Activo *</label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] ${
                    formErrors.activeIngredient ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.activeIngredient}
                  onChange={(e) => updateFormData("activeIngredient", e.target.value)}
                />
                {formErrors.activeIngredient && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.activeIngredient}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Concentración *</label>
                <input
                  type="text"
                  required
                  placeholder="ej: 1.000.000 UI/vial, 10mg/ml"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] ${
                    formErrors.concentration ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.concentration}
                  onChange={(e) => updateFormData("concentration", e.target.value)}
                />
                {formErrors.concentration && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.concentration}</p>
                )}
              </div>
            </div>

            {/* Información de Stock e Inventario */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-[#519a7c]" />
                Stock e Inventario
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Actual *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] ${
                      formErrors.stock ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.stock}
                    onChange={(e) => updateFormData("stock", parseInt(e.target.value) || 0)}
                  />
                  {formErrors.stock && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.stock}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                    value={formData.minStock}
                    onChange={(e) => updateFormData("minStock", parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($/unidad) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] ${
                    formErrors.price ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.price}
                  onChange={(e) => updateFormData("price", parseFloat(e.target.value) || 0)}
                />
                {formErrors.price && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.expirationDate}
                  onChange={(e) => updateFormData("expirationDate", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de Lote</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.batchNumber}
                  onChange={(e) => updateFormData("batchNumber", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                <input
                  type="text"
                  placeholder="ej: Refrigerador A-1, Estante B-3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Descripción y Características</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresRefrigeration"
                  className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]/50"
                  checked={formData.requiresRefrigeration}
                  onChange={(e) => updateFormData("requiresRefrigeration", e.target.checked)}
                />
                <label htmlFor="requiresRefrigeration" className="text-sm font-medium text-gray-700">
                  Requiere refrigeración
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="controlledSubstance"
                  className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]/50"
                  checked={formData.controlledSubstance}
                  onChange={(e) => updateFormData("controlledSubstance", e.target.checked)}
                />
                <label htmlFor="controlledSubstance" className="text-sm font-medium text-gray-700">
                  Sustancia controlada
                </label>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="mt-8 flex gap-3 justify-end border-t border-gray-200/40 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Actualizar Medicamento" : "Guardar Medicamento"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MedicineInventory: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    totalMedicines: 0,
    lowStockCount: 0,
    expiringCount: 0,
    totalValue: 0,
    topCategories: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [medicineToDelete, setMedicineToDelete] = useState<string>("");

  // 🚀 Hook de conexión
  const { status: connectionStatus, checkConnection } = useConnectionStatus();
  const apiService = new MedicineApiService();

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setLoadingMessage("Conectando al servidor...");
    
    try {
      // Primero verificar conexión
      const connectionResult = await apiService.checkConnection();
      console.log('🔗 Estado de conexión:', connectionResult);
      
      setLoadingMessage("Cargando inventario...");
      const [medicinesData, statsData] = await Promise.all([
        apiService.getMedicines(),
        apiService.getInventoryStats()
      ]);
      
      setMedicines(medicinesData);
      setStats(statsData);
      
      console.log('✅ Datos cargados exitosamente');
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers para CRUD
  const handleNewMedicine = () => {
    setEditingMedicine(undefined);
    setShowModal(true);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setShowModal(true);
  };

  const handleDeleteMedicine = (medicineId: string) => {
    setMedicineToDelete(medicineId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!medicineToDelete) return;
    
    setIsLoading(true);
    setLoadingMessage("Eliminando medicamento...");
    
    try {
      await apiService.deleteMedicine(medicineToDelete);
      setMedicines(prev => prev.filter(m => m.id !== medicineToDelete));
      setShowDeleteConfirm(false);
      setMedicineToDelete("");
      
      // Actualizar estadísticas
      const newStats = await apiService.getInventoryStats();
      setStats(newStats);
    } catch (error) {
      console.error("Error eliminando medicamento:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMedicine = async (medicineData: Partial<Medicine>) => {
    setIsLoading(true);
    setLoadingMessage(editingMedicine ? "Actualizando medicamento..." : "Guardando medicamento...");
    
    try {
      let savedMedicine: Medicine;
      
      if (editingMedicine) {
        // Actualizar medicamento existente
        savedMedicine = await apiService.updateMedicine(editingMedicine.id, medicineData);
        setMedicines(prev => prev.map(m => m.id === editingMedicine.id ? savedMedicine : m));
        console.log('✅ Medicamento actualizado:', savedMedicine);
      } else {
        // Crear nuevo medicamento
        savedMedicine = await apiService.createMedicine(medicineData);
        setMedicines(prev => [savedMedicine, ...prev]);
        console.log('✅ Nuevo medicamento creado:', savedMedicine);
      }
      
      setShowModal(false);
      setEditingMedicine(undefined);
      
      // Recargar estadísticas
      const newStats = await apiService.getInventoryStats();
      setStats(newStats);
      
    } catch (error) {
      console.error("Error guardando medicamento:", error);
      alert('❌ Error al guardar el medicamento. Verifique su conexión e intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const openDetailModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setShowDetailModal(true);
  };

  // Filtrado de medicamentos
  const filteredMedicines = medicines.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.activeIngredient?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medicine.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "" || medicine.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas
  const uniqueCategories = Array.from(new Set(medicines.map(m => m.category)));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-2 sm:p-6">
      {/* 🚀 Header con indicador de conexión */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-[#519a7c]/30 sticky top-0 z-40 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Inventario de Medicamentos
              </h1>
              <p className="text-gray-600 mt-1">
                Gestión de medicamentos veterinarios
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* 🚀 Indicador de conexión */}
              <ConnectionIndicator />
              
              {/* Filtros */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar medicamentos..."
                    className="w-64 pl-10 pr-4 py-2 border border-[#519a7c]/60 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] bg-white/90 backdrop-blur-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="px-3 py-2 border border-[#519a7c]/60 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] bg-white/90 backdrop-blur-sm"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {uniqueCategories.map(category => (
                    <option key={category} value={category}>
                      {category === "antibiotic" ? "Antibióticos" :
                       category === "vaccine" ? "Vacunas" :
                       category === "antiparasitic" ? "Antiparasitarios" :
                       category === "vitamin" ? "Vitaminas" : category}
                    </option>
                  ))}
                </select>
              </div>
              
              <Button size="sm" onClick={handleNewMedicine}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Medicamento
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* 🚀 Indicador de estado de backend */}
        {!connectionStatus.isConnected && (
          <Card className="bg-orange-100/90 border-orange-300/60 mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Sin conexión al servidor
                  </p>
                  <p className="text-xs text-orange-600">
                    Trabajando en modo offline. Los datos se mostrarán pero no se sincronizarán.
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={checkConnection}
                  className="ml-auto"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-gradient-to-br from-blue-100/90 to-blue-50/90 border-blue-300/60">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-200/80 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6 text-blue-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">Total Medicamentos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalMedicines}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-100/90 to-red-50/90 border-red-300/60">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-200/80 rounded-lg flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-red-800">Stock Bajo</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.lowStockCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-100/90 to-yellow-50/90 border-yellow-300/60">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-200/80 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-yellow-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Por Vencer</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.expiringCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-100/90 to-green-50/90 border-green-300/60">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-200/80 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Valor Total</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalValue.toFixed(0)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Medicamentos */}
        <Card className="bg-white/95 border-[#519a7c]/40">
          <CardHeader>
            <CardTitle>Medicamentos ({filteredMedicines.length})</CardTitle>
            <CardDescription>
              Inventario completo de medicamentos veterinarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredMedicines.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay medicamentos</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || categoryFilter ? 'No se encontraron medicamentos que coincidan con los filtros.' : 'Aún no hay medicamentos registrados en el inventario.'}
                  </p>
                  {!searchTerm && !categoryFilter && (
                    <Button onClick={handleNewMedicine}>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Primer Medicamento
                    </Button>
                  )}
                </div>
              ) : (
                filteredMedicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="border border-white/60 bg-white/90 backdrop-blur-sm rounded-lg p-6 hover:shadow-lg hover:bg-white/95 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-xl font-semibold text-gray-900">
                            {medicine.name}
                          </h4>
                          <Badge variant={medicine.stock <= (medicine.minStock || 5) ? "low-stock" : "good-stock"}>
                            {medicine.stock <= (medicine.minStock || 5) ? "Stock Bajo" : "Stock OK"}
                          </Badge>
                          {medicine.requiresRefrigeration && (
                            <Badge variant="refrigerated">Refrigeración</Badge>
                          )}
                          {medicine.controlledSubstance && (
                            <Badge variant="controlled">Controlado</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-600">Categoría:</p>
                            <p className="font-medium">
                              {medicine.category === "antibiotic" ? "Antibiótico" :
                               medicine.category === "vaccine" ? "Vacuna" :
                               medicine.category === "antiparasitic" ? "Antiparasitario" :
                               medicine.category === "vitamin" ? "Vitamina" : medicine.category}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Fabricante:</p>
                            <p className="font-medium">{medicine.manufacturer}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Stock:</p>
                            <p className="font-medium">{medicine.stock} unidades</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Principio Activo:</p>
                            <p className="font-medium">{medicine.activeIngredient || 'No especificado'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Concentración:</p>
                            <p className="font-medium">{medicine.concentration || 'No especificada'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Precio:</p>
                            <p className="font-medium">${medicine.price.toFixed(2)}</p>
                          </div>
                        </div>

                        {medicine.description && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 bg-gradient-to-r from-[#f2e9d8]/60 to-[#f2e9d8]/40 backdrop-blur-sm p-3 rounded-lg border border-[#519a7c]/20">
                              {medicine.description}
                            </p>
                          </div>
                        )}

                        {medicine.location && (
                          <div className="text-sm text-gray-600">
                            <strong>Ubicación:</strong> {medicine.location}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openDetailModal(medicine)}
                          className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditMedicine(medicine)}
                          className="hover:bg-[#519a7c]/10 hover:border-[#519a7c]"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <LoadingModal isOpen={isLoading} message={loadingMessage} />
        
        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={confirmDelete}
          title="Eliminar Medicamento"
          message="¿Estás seguro de que deseas eliminar este medicamento del inventario? Esta acción no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
        />

        <MedicineFormModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveMedicine}
          medicine={editingMedicine}
          isEditing={!!editingMedicine}
        />

        {/* Modal Detalle */}
        {showDetailModal && selectedMedicine && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-lg rounded-lg shadow-xl border border-[#519a7c]/30 max-w-2xl w-full">
              <div className="bg-gradient-to-r from-[#519a7c]/20 to-[#f4ac3a]/20 px-6 py-4 border-b border-gray-200/40">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Detalle del Medicamento</h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedMedicine.name}</h3>
                    <p className="text-gray-600">{selectedMedicine.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Categoría:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedMedicine.category === "antibiotic" ? "Antibiótico" :
                           selectedMedicine.category === "vaccine" ? "Vacuna" :
                           selectedMedicine.category === "antiparasitic" ? "Antiparasitario" :
                           selectedMedicine.category === "vitamin" ? "Vitamina" : selectedMedicine.category}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Fabricante:</span>
                        <span className="ml-2 text-gray-900">{selectedMedicine.manufacturer}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Principio Activo:</span>
                        <span className="ml-2 text-gray-900">{selectedMedicine.activeIngredient || 'No especificado'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Concentración:</span>
                        <span className="ml-2 text-gray-900">{selectedMedicine.concentration || 'No especificada'}</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-700">Stock Actual:</span>
                        <span className="ml-2 text-gray-900">{selectedMedicine.stock} unidades</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Stock Mínimo:</span>
                        <span className="ml-2 text-gray-900">{selectedMedicine.minStock || 'No definido'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Precio:</span>
                        <span className="ml-2 text-gray-900">${selectedMedicine.price.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Ubicación:</span>
                        <span className="ml-2 text-gray-900">{selectedMedicine.location || 'No especificada'}</span>
                      </div>
                    </div>
                  </div>

                  {(selectedMedicine.expirationDate || selectedMedicine.batchNumber) && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Información adicional</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedMedicine.expirationDate && (
                          <div>
                            <span className="font-medium text-gray-700">Vence:</span>
                            <span className="ml-2 text-gray-900">
                              {new Date(selectedMedicine.expirationDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {selectedMedicine.batchNumber && (
                          <div>
                            <span className="font-medium text-gray-700">Lote:</span>
                            <span className="ml-2 text-gray-900">{selectedMedicine.batchNumber}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(selectedMedicine.requiresRefrigeration || selectedMedicine.controlledSubstance) && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Características especiales</h4>
                      <div className="flex gap-2">
                        {selectedMedicine.requiresRefrigeration && (
                          <Badge variant="refrigerated">Requiere refrigeración</Badge>
                        )}
                        {selectedMedicine.controlledSubstance && (
                          <Badge variant="controlled">Sustancia controlada</Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicineInventory;