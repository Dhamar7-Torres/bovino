import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Filter,
  Calendar,
  MapPin,
  Heart,
  Baby,
  AlertTriangle,
  CheckCircle,
  Clock,
  X,
  Save,
  FileText,
  Menu,
  ChevronDown,
  ChevronUp,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
} from "lucide-react";

// ========================================
// CONFIGURACIÓN DE LA API
// ========================================

const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    PREGNANCY_TRACKING: '/reproduction/pregnancy-tracking',
    PREGNANCY_CHECK: '/reproduction/pregnancy-check',
    HEALTH: '/health',
    VETERINARIANS: '/users/veterinarians',
  }
};

// ========================================
// SERVICIO DE API
// ========================================

interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiService {
  private static baseURL = API_CONFIG.BASE_URL;
  private static token: string | null = null;

  static setAuthToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  static getAuthToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private static getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    let data;
    if (isJson) {
      data = await response.json();
    } else {
      data = { success: false, message: await response.text() };
    }

    if (!response.ok) {
      const error: ApiError = {
        message: data.message || `Error HTTP ${response.status}`,
        status: response.status,
        code: data.error || data.errorCode
      };
      throw error;
    }

    return data.data || data;
  }

  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const url = new URL(`${this.baseURL}${endpoint}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  static async post<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  static async put<T>(endpoint: string, data?: any): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.handleResponse<T>(response);
  }

  static async delete<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(response);
  }

  static async testConnection(): Promise<boolean> {
    try {
      await this.get('/health');
      return true;
    } catch (error) {
      console.error('Error de conectividad:', error);
      return false;
    }
  }
}

// ========================================
// INTERFACES Y TIPOS (ACTUALIZADAS PARA BACKEND)
// ========================================

interface Veterinarian {
  id: string;
  name: string;
  license: string;
  phone: string;
  email: string;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
  paddock: string;
  facility: string;
}

interface Examination {
  id: string;
  date: string;
  time: string;
  type: "routine" | "emergency" | "pre_calving";
  veterinarian: string;
  gestationDay: number;
  findings: {
    fetalMovement: "none" | "weak" | "moderate" | "strong";
    fetalSize: "small" | "normal" | "large";
    placentalHealth: "normal" | "concerning" | "abnormal";
    amnioticFluid: "normal" | "low" | "excessive";
    cervicalCondition: "closed" | "soft" | "dilated";
  };
  measurements: {
    fetalLength?: number;
    fetalWeight?: number;
    heartRate?: number;
  };
  recommendations: string[];
  nextExamDate?: string;
  cost: number;
  notes: string;
}

interface NutritionPlan {
  currentStage: "normal" | "increased" | "pre_calving";
  supplements: string[];
  specialDiet: boolean;
  waterAccess: "poor" | "fair" | "good" | "excellent";
  notes: string;
}

interface HealthStatus {
  overall: "poor" | "fair" | "good" | "excellent";
  bodyCondition: number;
  weight: number;
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  bloodPressure?: string;
}

interface Complications {
  hasComplications: boolean;
  type?: "nutritional" | "infectious" | "metabolic" | "physical" | "other";
  description?: string;
  severity?: "mild" | "moderate" | "severe";
  treatmentRequired: boolean;
  veterinaryAction?: string;
}

interface MonitoringSchedule {
  nextExamDate: string;
  frequency: "weekly" | "biweekly" | "monthly";
  specialRequirements: string[];
}

interface Alert {
  id: string;
  type: "health" | "nutrition" | "emergency" | "routine";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  date: string;
  resolved: boolean;
}

type BreedingType = "natural_mating" | "artificial_insemination" | "embryo_transfer";
type ConfirmationMethod = "ultrasound" | "palpation" | "blood_test" | "hormone_test";
type PregnancyStage = "early" | "middle" | "late";
type PregnancyStatus = "active" | "completed" | "terminated" | "lost";

interface PregnancyRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalEarTag: string;
  bullId: string;
  bullName: string;
  bullEarTag: string;
  breedingDate: string;
  breedingType: BreedingType;
  confirmationDate: string;
  confirmationMethod: ConfirmationMethod;
  gestationDay: number;
  expectedCalvingDate: string;
  currentStage: PregnancyStage;
  pregnancyNumber: number;
  veterinarian: Veterinarian;
  location: Location;
  examinations: Examination[];
  nutritionPlan: NutritionPlan;
  healthStatus: HealthStatus;
  complications: Complications;
  monitoringSchedule: MonitoringSchedule;
  notes: string;
  cost: number;
  status: PregnancyStatus;
  alerts: Alert[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

interface FilterOptions {
  searchTerm: string;
  breedingType: BreedingType | "";
  currentStage: PregnancyStage | "";
  status: PregnancyStatus | "";
  veterinarian: string;
  hasComplications: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface FormDataType {
  animalName?: string;
  animalEarTag?: string;
  bullName?: string;
  bullEarTag?: string;
  breedingDate?: string;
  breedingType?: BreedingType;
  confirmationDate?: string;
  confirmationMethod?: ConfirmationMethod;
  gestationDay?: number;
  expectedCalvingDate?: string;
  currentStage?: PregnancyStage;
  pregnancyNumber?: number;
  status?: PregnancyStatus;
  notes?: string;
}

// ========================================
// SERVICIO DE SEGUIMIENTO DE EMBARAZOS
// ========================================

class PregnancyTrackingService {
  // Obtener todas las gestaciones
  static async getAllPregnancies(filters?: {
    search?: string;
    status?: string;
    trimester?: string;
    veterinarianId?: string;
    page?: number;
    limit?: number;
  }): Promise<{pregnancies: PregnancyRecord[], total: number, pagination: any}> {
    try {
      const response = await ApiService.get<{
        data: PregnancyRecord[], 
        pagination: any
      }>(
        API_CONFIG.ENDPOINTS.PREGNANCY_TRACKING,
        filters
      );
      
      return {
        pregnancies: response.data || [],
        total: response.pagination?.total || 0,
        pagination: response.pagination || {}
      };
    } catch (error) {
      console.error('Error obteniendo embarazos:', error);
      throw error;
    }
  }

  // Obtener un embarazo específico
  static async getPregnancy(id: string): Promise<PregnancyRecord> {
    try {
      return await ApiService.get<PregnancyRecord>(`${API_CONFIG.ENDPOINTS.PREGNANCY_TRACKING}/${id}`);
    } catch (error) {
      console.error('Error obteniendo embarazo:', error);
      throw error;
    }
  }

  // Crear nuevo chequeo de embarazo
  static async createPregnancyCheck(data: {
    femaleId: string;
    examDate: string;
    method: string;
    result: string;
    gestationAge?: number;
    expectedCalvingDate?: string;
    veterinarianId: string;
    notes?: string;
  }): Promise<any> {
    try {
      return await ApiService.post<any>(API_CONFIG.ENDPOINTS.PREGNANCY_CHECK, data);
    } catch (error) {
      console.error('Error creando chequeo de embarazo:', error);
      throw error;
    }
  }

  // Actualizar embarazo
  static async updatePregnancy(id: string, data: Partial<PregnancyRecord>): Promise<PregnancyRecord> {
    try {
      return await ApiService.put<PregnancyRecord>(`${API_CONFIG.ENDPOINTS.PREGNANCY_TRACKING}/${id}`, data);
    } catch (error) {
      console.error('Error actualizando embarazo:', error);
      throw error;
    }
  }

  // Eliminar embarazo
  static async deletePregnancy(id: string): Promise<boolean> {
    try {
      await ApiService.delete(`${API_CONFIG.ENDPOINTS.PREGNANCY_TRACKING}/${id}`);
      return true;
    } catch (error) {
      console.error('Error eliminando embarazo:', error);
      throw error;
    }
  }

  // Obtener veterinarios
  static async getVeterinarians(): Promise<Veterinarian[]> {
    try {
      const response = await ApiService.get<{data: Veterinarian[]}>(API_CONFIG.ENDPOINTS.VETERINARIANS);
      return response.data || [];
    } catch (error) {
      console.error('Error obteniendo veterinarios:', error);
      return [];
    }
  }

  // Obtener estadísticas del dashboard
  static async getDashboardStats(): Promise<{
    total: number;
    active: number;
    withComplications: number;
    nearCalving: number;
  }> {
    try {
      // Por ahora usar datos mock, implementar endpoint específico más tarde
      return {
        total: 0,
        active: 0,
        withComplications: 0,
        nearCalving: 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

// ========================================
// HOOK PERSONALIZADO PARA MANEJAR API
// ========================================

const useApiState = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<boolean | null>(null);

  const executeAsync = async <T,>(
    apiCall: () => Promise<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: ApiError) => void
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      onSuccess?.(result);
      return result;
    } catch (err: any) {
      const errorMessage = err.message || 'Error desconocido';
      setError(errorMessage);
      onError?.(err);
      console.error('Error en API:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    const isConnected = await ApiService.testConnection();
    setConnected(isConnected);
    return isConnected;
  };

  return { loading, error, connected, executeAsync, testConnection, setError };
};

// ========================================
// COMPONENTES UI REUTILIZABLES
// ========================================

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  type = "button",
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-[#519a7c] text-white hover:bg-[#4a8b6e] focus-visible:ring-[#519a7c]",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-600",
    error: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
    ghost: "hover:bg-gray-100 focus-visible:ring-gray-500",
  };
  
  const sizes = {
    xs: "h-7 px-2 text-xs",
    sm: "h-8 px-3 text-sm",
    md: "h-9 px-4 py-2 text-sm",
    lg: "h-11 px-6 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  disabled = false,
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#519a7c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  children,
  value,
  onChange,
  className = "",
  disabled = false,
}) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    disabled={disabled}
    className={`flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#519a7c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </select>
);

interface TextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
  disabled?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  value,
  onChange,
  className = "",
  rows = 3,
  disabled = false,
}) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
    disabled={disabled}
    className={`flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#519a7c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${className}`}
  />
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`rounded-lg border border-white/20 bg-white/90 backdrop-blur-sm shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<CardProps> = ({ children, className = "" }) => (
  <h3 className={`text-base sm:text-lg font-medium leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`p-4 pt-0 sm:p-6 sm:pt-0 ${className}`}>
    {children}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ========================================
// COMPONENTE DE INDICADOR DE CONECTIVIDAD
// ========================================

const ConnectionIndicator: React.FC<{ connected: boolean | null, onRetry: () => void }> = ({ connected, onRetry }) => {
  if (connected === null) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 px-3 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm ${
      connected 
        ? "bg-green-100 text-green-800 border border-green-200" 
        : "bg-red-100 text-red-800 border border-red-200"
    }`}>
      {connected ? (
        <>
          <Wifi className="w-4 h-4" />
          <span>Conectado</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span>Sin conexión</span>
          <button
            onClick={onRetry}
            className="ml-2 px-2 py-1 bg-red-200 hover:bg-red-300 rounded transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </>
      )}
    </div>
  );
};

// ========================================
// COMPONENTE DE PREGNANCY CARD PARA MÓVILES
// ========================================
interface PregnancyCardProps {
  pregnancy: PregnancyRecord;
  onView: (pregnancy: PregnancyRecord) => void;
  onEdit: (pregnancy: PregnancyRecord) => void;
  onDelete: (pregnancy: PregnancyRecord) => void;
}

const PregnancyCard: React.FC<PregnancyCardProps> = ({ pregnancy, onView, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = (status: PregnancyStatus) => {
    const statusConfig = {
      active: { variant: "success" as const, label: "Activo" },
      completed: { variant: "info" as const, label: "Completado" },
      terminated: { variant: "error" as const, label: "Terminado" },
      lost: { variant: "error" as const, label: "Perdido" },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStageBadge = (stage: PregnancyStage) => {
    const stageConfig = {
      early: { variant: "info" as const, label: "Temprano" },
      middle: { variant: "warning" as const, label: "Medio" },
      late: { variant: "error" as const, label: "Tardío" },
    };
    
    const config = stageConfig[stage];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getBreedingTypeBadge = (type: BreedingType) => {
    const typeLabels = {
      natural_mating: "Monta Natural",
      artificial_insemination: "IA",
      embryo_transfer: "TE",
    };
    
    return <Badge variant="default">{typeLabels[type]}</Badge>;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Header de la card */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {pregnancy.animalName}
            </h3>
            <p className="text-sm text-gray-500">
              {pregnancy.animalEarTag}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-3">
            {getStatusBadge(pregnancy.status)}
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Información básica siempre visible */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500">Toro</p>
            <p className="text-sm font-medium">{pregnancy.bullName}</p>
            <p className="text-xs text-gray-400">{pregnancy.bullEarTag}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Gestación</p>
            <p className="text-sm font-medium">{pregnancy.gestationDay} días</p>
            <p className="text-xs text-gray-400">#{pregnancy.pregnancyNumber}</p>
          </div>
        </div>

        {/* Información expandible */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Tipo</p>
                    {getBreedingTypeBadge(pregnancy.breedingType)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Etapa</p>
                    {getStageBadge(pregnancy.currentStage)}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Fecha de Parto</p>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                    {new Date(pregnancy.expectedCalvingDate).toLocaleDateString('es-ES')}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Complicaciones</p>
                  {pregnancy.complications.hasComplications ? (
                    <Badge variant="warning">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Sí
                    </Badge>
                  ) : (
                    <Badge variant="success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      No
                    </Badge>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500">Veterinario</p>
                  <p className="text-sm">{pregnancy.veterinarian.name}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onView(pregnancy)}
            className="text-blue-600 hover:text-blue-900"
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onEdit(pregnancy)}
            className="text-yellow-600 hover:text-yellow-900"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onDelete(pregnancy)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ========================================
// COMPONENTE PRINCIPAL CONECTADO AL BACKEND
// ========================================

const PregnancyTracking: React.FC = () => {
  // Estados principales
  const [pregnancies, setPregnancies] = useState<PregnancyRecord[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);

  // Estados para modales y formularios
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedPregnancy, setSelectedPregnancy] = useState<PregnancyRecord | null>(null);
  const [formData, setFormData] = useState<FormDataType>({});

  // Estados para modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [pregnancyToDelete, setPregnancyToDelete] = useState<PregnancyRecord | null>(null);

  // Estados para filtros y vista
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    breedingType: "",
    currentStage: "",
    status: "",
    veterinarian: "",
    hasComplications: "",
    dateRange: {
      start: "",
      end: "",
    },
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPregnancies, setTotalPregnancies] = useState(0);
  const [pageSize] = useState(20);

  // Detectar si es móvil
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Hook de API
  const { loading, error, connected, executeAsync, testConnection, setError } = useApiState();

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setViewMode(window.innerWidth < 768 ? "cards" : "table");
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Cargar datos desde la API
  const loadPregnancies = async (page = 1) => {
    const apiFilters = {
      search: filters.searchTerm || undefined,
      status: filters.status || undefined,
      veterinarianId: filters.veterinarian || undefined,
      page,
      limit: pageSize
    };

    await executeAsync(
      () => PregnancyTrackingService.getAllPregnancies(apiFilters),
      (data) => {
        setPregnancies(data.pregnancies);
        setTotalPregnancies(data.total);
        setCurrentPage(page);
      },
      (error) => {
        console.error('Error cargando embarazos:', error);
        setPregnancies([]);
      }
    );
  };

  const loadVeterinarians = async () => {
    await executeAsync(
      () => PregnancyTrackingService.getVeterinarians(),
      (data) => {
        setVeterinarians(data);
      }
    );
  };

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const initializeData = async () => {
      await testConnection();
      await loadVeterinarians();
      await loadPregnancies(1);
    };
    
    initializeData();
  }, []);

  // Efecto para recargar cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadPregnancies(1);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [filters.searchTerm, filters.status, filters.veterinarian]);

  // Variantes de animación
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Filtrado de datos (solo filtros locales, los principales van al backend)
  const filteredPregnancies = useMemo(() => {
    return pregnancies.filter((pregnancy) => {
      const matchesBreedingType = !filters.breedingType || pregnancy.breedingType === filters.breedingType;
      const matchesStage = !filters.currentStage || pregnancy.currentStage === filters.currentStage;
      const matchesComplications = !filters.hasComplications || 
        (filters.hasComplications === "true" && pregnancy.complications.hasComplications) ||
        (filters.hasComplications === "false" && !pregnancy.complications.hasComplications);

      return matchesBreedingType && matchesStage && matchesComplications;
    });
  }, [pregnancies, filters]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = pregnancies.length;
    const active = pregnancies.filter(p => p.status === "active").length;
    const withComplications = pregnancies.filter(p => p.complications.hasComplications).length;
    const nearCalving = pregnancies.filter(p => p.gestationDay > 250).length;

    return { total, active, withComplications, nearCalving };
  }, [pregnancies]);

  // Funciones CRUD actualizadas para backend
  const handleCreate = () => {
    setFormData({
      animalName: "",
      animalEarTag: "",
      bullName: "",
      bullEarTag: "",
      breedingDate: "",
      breedingType: "artificial_insemination",
      confirmationDate: "",
      confirmationMethod: "ultrasound",
      gestationDay: 0,
      expectedCalvingDate: "",
      currentStage: "early",
      pregnancyNumber: 1,
      status: "active",
      notes: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (pregnancy: PregnancyRecord) => {
    setSelectedPregnancy(pregnancy);
    setFormData(pregnancy);
    setIsEditModalOpen(true);
  };

  const handleView = (pregnancy: PregnancyRecord) => {
    setSelectedPregnancy(pregnancy);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = useCallback((pregnancy: PregnancyRecord) => {
    setPregnancyToDelete(pregnancy);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pregnancyToDelete) return;

    await executeAsync(
      () => PregnancyTrackingService.deletePregnancy(pregnancyToDelete.id),
      () => {
        // Cerrar modales si están abiertos
        if (selectedPregnancy?.id === pregnancyToDelete.id) {
          setSelectedPregnancy(null);
          setIsViewModalOpen(false);
          setIsEditModalOpen(false);
        }
        
        // Cerrar modal de confirmación
        setShowDeleteModal(false);
        setPregnancyToDelete(null);
        
        // Recargar datos
        loadPregnancies(currentPage);
      }
    );
  }, [pregnancyToDelete, selectedPregnancy, currentPage]);

  const handleSave = async () => {
    if (!formData.animalName || !formData.animalEarTag) {
      setError("Por favor completa los campos obligatorios");
      return;
    }

    if (selectedPregnancy) {
      // Actualizar
      await executeAsync(
        () => PregnancyTrackingService.updatePregnancy(selectedPregnancy.id, formData),
        () => {
          setIsEditModalOpen(false);
          setFormData({});
          setSelectedPregnancy(null);
          loadPregnancies(currentPage);
        }
      );
    } else {
      // Crear nuevo - usar endpoint de pregnancy-check
      const pregnancyCheckData = {
        femaleId: 'temp-female-id', // En un caso real, necesitarías seleccionar la vaca
        examDate: formData.confirmationDate || new Date().toISOString().split('T')[0],
        method: formData.confirmationMethod || 'ultrasound',
        result: 'pregnant',
        gestationAge: formData.gestationDay,
        expectedCalvingDate: formData.expectedCalvingDate,
        veterinarianId: veterinarians[0]?.id || 'temp-vet-id',
        notes: formData.notes || ''
      };

      await executeAsync(
        () => PregnancyTrackingService.createPregnancyCheck(pregnancyCheckData),
        () => {
          setIsCreateModalOpen(false);
          setFormData({});
          loadPregnancies(currentPage);
        }
      );
    }
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      breedingType: "",
      currentStage: "",
      status: "",
      veterinarian: "",
      hasComplications: "",
      dateRange: { start: "", end: "" },
    });
  };

  // Funciones auxiliares para badges
  const getStatusBadge = (status: PregnancyStatus) => {
    const statusConfig = {
      active: { variant: "success" as const, label: "Activo" },
      completed: { variant: "info" as const, label: "Completado" },
      terminated: { variant: "error" as const, label: "Terminado" },
      lost: { variant: "error" as const, label: "Perdido" },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStageBadge = (stage: PregnancyStage) => {
    const stageConfig = {
      early: { variant: "info" as const, label: "Temprano" },
      middle: { variant: "warning" as const, label: "Medio" },
      late: { variant: "error" as const, label: "Tardío" },
    };
    
    const config = stageConfig[stage];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getBreedingTypeBadge = (type: BreedingType) => {
    const typeLabels = {
      natural_mating: "Monta Natural",
      artificial_insemination: "IA",
      embryo_transfer: "TE",
    };
    
    return <Badge variant="default">{typeLabels[type]}</Badge>;
  };

  // Calcular número total de páginas
  const totalPages = Math.ceil(totalPregnancies / pageSize);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-3 sm:p-4 md:p-6"
    >
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        
        {/* Indicador de conectividad */}
        <ConnectionIndicator 
          connected={connected} 
          onRetry={testConnection}
        />

        {/* Header */}
        <motion.div variants={itemVariants} className="text-center px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Seguimiento de Embarazos
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gestión completa del programa de reproducción bovina conectado al sistema
          </p>
          {error && (
            <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded-lg text-red-700 text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
                <button
                  onClick={() => loadPregnancies(currentPage)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Estadísticas */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-white/30">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm font-medium">Total</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Baby className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-white/30">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm font-medium">Activos</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.active}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-white/30">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-xs sm:text-sm font-medium">Complicaciones</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.withComplications}</p>
                  </div>
                  <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white border-white/30">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs sm:text-sm font-medium">Próximas al Parto</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.nearCalving}</p>
                  </div>
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Controles y filtros */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por vaca, etiqueta o toro..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        <Filter className="h-4 w-4" />
                        Filtros
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => loadPregnancies(currentPage)}
                        disabled={loading}
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Recargar
                      </Button>
                      {!isMobile && (
                        <Button
                          variant="secondary"
                          onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
                          className="flex items-center gap-2"
                          size="sm"
                        >
                          <Menu className="h-4 w-4" />
                          {viewMode === "table" ? "Cards" : "Tabla"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleCreate}
                    disabled={loading || !connected}
                    className="flex items-center gap-2 w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Nuevo Embarazo
                  </Button>
                </div>

                {/* Panel de filtros expandible */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pt-3 border-t border-gray-200 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                        <Select
                          value={filters.breedingType}
                          onChange={(value) => setFilters(prev => ({ ...prev, breedingType: value as BreedingType | "" }))}
                        >
                          <option value="">Tipo de Reproducción</option>
                          <option value="natural_mating">Monta Natural</option>
                          <option value="artificial_insemination">Inseminación Artificial</option>
                          <option value="embryo_transfer">Transferencia de Embriones</option>
                        </Select>

                        <Select
                          value={filters.currentStage}
                          onChange={(value) => setFilters(prev => ({ ...prev, currentStage: value as PregnancyStage | "" }))}
                        >
                          <option value="">Etapa de Gestación</option>
                          <option value="early">Temprano (0-84 días)</option>
                          <option value="middle">Medio (85-210 días)</option>
                          <option value="late">Tardío (211-280 días)</option>
                        </Select>

                        <Select
                          value={filters.status}
                          onChange={(value) => setFilters(prev => ({ ...prev, status: value as PregnancyStatus | "" }))}
                        >
                          <option value="">Estado</option>
                          <option value="active">Activo</option>
                          <option value="completed">Completado</option>
                          <option value="terminated">Terminado</option>
                          <option value="lost">Perdido</option>
                        </Select>

                        <Select
                          value={filters.veterinarian}
                          onChange={(value) => setFilters(prev => ({ ...prev, veterinarian: value }))}
                        >
                          <option value="">Veterinario</option>
                          {veterinarians.map(vet => (
                            <option key={vet.id} value={vet.id}>{vet.name}</option>
                          ))}
                        </Select>

                        <Select
                          value={filters.hasComplications}
                          onChange={(value) => setFilters(prev => ({ ...prev, hasComplications: value }))}
                        >
                          <option value="">Complicaciones</option>
                          <option value="true">Con Complicaciones</option>
                          <option value="false">Sin Complicaciones</option>
                        </Select>

                        <Button
                          variant="secondary"
                          onClick={resetFilters}
                          className="h-9 w-full"
                          size="sm"
                        >
                          Limpiar
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Lista de embarazos - Responsive */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-[#519a7c]" />
                  <span className="text-sm sm:text-base">
                    Registros de Embarazos ({filteredPregnancies.length})
                  </span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-[#519a7c] mr-2" />
                  <span className="text-sm">Cargando desde el servidor...</span>
                </div>
              ) : viewMode === "cards" || isMobile ? (
                // Vista de cards para móviles
                <div className="p-3 sm:p-6 space-y-3">
                  {filteredPregnancies.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Baby className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No se encontraron registros de embarazos</p>
                      {!connected && (
                        <p className="text-xs mt-2 text-red-500">
                          Sin conexión al servidor. Verifique que el backend esté ejecutándose.
                        </p>
                      )}
                    </div>
                  ) : (
                    filteredPregnancies.map((pregnancy) => (
                      <PregnancyCard
                        key={pregnancy.id}
                        pregnancy={pregnancy}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                      />
                    ))
                  )}
                </div>
              ) : (
                // Vista de tabla para desktop
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50/90 backdrop-blur-sm border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vaca
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Toro
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Días de Gestación
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Etapa
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Parto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Complicaciones
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white/70 backdrop-blur-sm divide-y divide-gray-200">
                      {filteredPregnancies.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                              <Baby className="h-12 w-12 mb-3 text-gray-300" />
                              <p>No se encontraron registros de embarazos</p>
                              {!connected && (
                                <p className="text-xs mt-2 text-red-500">
                                  Sin conexión al servidor Backend (Puerto 5000)
                                </p>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredPregnancies.map((pregnancy) => (
                          <tr key={pregnancy.id} className="hover:bg-white/90 backdrop-blur-sm transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {pregnancy.animalName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {pregnancy.animalEarTag}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{pregnancy.bullName}</div>
                              <div className="text-sm text-gray-500">{pregnancy.bullEarTag}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {getBreedingTypeBadge(pregnancy.breedingType)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{pregnancy.gestationDay} días</div>
                              <div className="text-sm text-gray-500">
                                Embarazo #{pregnancy.pregnancyNumber}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {getStageBadge(pregnancy.currentStage)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                {new Date(pregnancy.expectedCalvingDate).toLocaleDateString('es-ES')}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {getStatusBadge(pregnancy.status)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {pregnancy.complications.hasComplications ? (
                                <Badge variant="warning">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Sí
                                </Badge>
                              ) : (
                                <Badge variant="success">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  No
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => handleView(pregnancy)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => handleEdit(pregnancy)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => handleDeleteClick(pregnancy)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Mostrando {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalPregnancies)} de {totalPregnancies} resultados
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => loadPregnancies(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                        size="sm"
                      >
                        Anterior
                      </Button>
                      {/* Páginas numéricas */}
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "primary" : "secondary"}
                            onClick={() => loadPregnancies(pageNum)}
                            disabled={loading}
                            size="sm"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                      <Button
                        variant="secondary"
                        onClick={() => loadPregnancies(currentPage + 1)}
                        disabled={currentPage === totalPages || loading}
                        size="sm"
                      >
                        Siguiente
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de creación */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4"
              onClick={() => setIsCreateModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Nuevo Registro de Embarazo
                  </h2>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la Vaca *
                        </label>
                        <Input
                          placeholder="Ej: Bella"
                          value={formData.animalName || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Etiqueta de la Vaca *
                        </label>
                        <Input
                          placeholder="Ej: MX-001"
                          value={formData.animalEarTag || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, animalEarTag: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Toro *
                        </label>
                        <Input
                          placeholder="Ej: Campeón"
                          value={formData.bullName || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, bullName: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Etiqueta del Toro *
                        </label>
                        <Input
                          placeholder="Ej: T-001"
                          value={formData.bullEarTag || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, bullEarTag: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Reproducción *
                        </label>
                        <Input
                          type="date"
                          value={formData.breedingDate || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, breedingDate: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Reproducción *
                        </label>
                        <Select
                          value={formData.breedingType || ""}
                          onChange={(value) => setFormData(prev => ({ ...prev, breedingType: value as BreedingType }))}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="natural_mating">Monta Natural</option>
                          <option value="artificial_insemination">Inseminación Artificial</option>
                          <option value="embryo_transfer">Transferencia de Embriones</option>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Confirmación *
                        </label>
                        <Input
                          type="date"
                          value={formData.confirmationDate || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmationDate: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Método de Confirmación *
                        </label>
                        <Select
                          value={formData.confirmationMethod || ""}
                          onChange={(value) => setFormData(prev => ({ ...prev, confirmationMethod: value as ConfirmationMethod }))}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="ultrasound">Ultrasonido</option>
                          <option value="palpation">Palpación</option>
                          <option value="blood_test">Examen de Sangre</option>
                          <option value="hormone_test">Prueba Hormonal</option>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Días de Gestación
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.gestationDay?.toString() || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, gestationDay: parseInt(e.target.value) || 0 }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha Esperada de Parto
                        </label>
                        <Input
                          type="date"
                          value={formData.expectedCalvingDate || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, expectedCalvingDate: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas
                      </label>
                      <Textarea
                        placeholder="Observaciones sobre el embarazo..."
                        value={formData.notes || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50">
                  <Button
                    variant="secondary"
                    onClick={() => setIsCreateModalOpen(false)}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading || !connected}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Guardar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de edición */}
        <AnimatePresence>
          {isEditModalOpen && selectedPregnancy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4"
              onClick={() => setIsEditModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Editar Registro de Embarazo
                  </h2>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la Vaca *
                        </label>
                        <Input
                          placeholder="Ej: Bella"
                          value={formData.animalName || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Etiqueta de la Vaca *
                        </label>
                        <Input
                          placeholder="Ej: MX-001"
                          value={formData.animalEarTag || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, animalEarTag: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Días de Gestación
                        </label>
                        <Input
                          type="number"
                          value={formData.gestationDay?.toString() || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, gestationDay: parseInt(e.target.value) || 0 }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha Esperada de Parto
                        </label>
                        <Input
                          type="date"
                          value={formData.expectedCalvingDate || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, expectedCalvingDate: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado
                        </label>
                        <Select
                          value={formData.status || "active"}
                          onChange={(value) => setFormData(prev => ({ ...prev, status: value as PregnancyStatus }))}
                        >
                          <option value="active">Activo</option>
                          <option value="completed">Completado</option>
                          <option value="terminated">Terminado</option>
                          <option value="lost">Perdido</option>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Etapa Actual
                        </label>
                        <Select
                          value={formData.currentStage || "early"}
                          onChange={(value) => setFormData(prev => ({ ...prev, currentStage: value as PregnancyStage }))}
                        >
                          <option value="early">Temprano (0-84 días)</option>
                          <option value="middle">Medio (85-210 días)</option>
                          <option value="late">Tardío (211-280 días)</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas
                      </label>
                      <Textarea
                        placeholder="Observaciones sobre el embarazo..."
                        value={formData.notes || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50">
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditModalOpen(false)}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading || !connected}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Actualizar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de visualización */}
        <AnimatePresence>
          {isViewModalOpen && selectedPregnancy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4"
              onClick={() => setIsViewModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Detalles del Embarazo - {selectedPregnancy.animalName}
                  </h2>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Información básica */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">Animal</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">{selectedPregnancy.animalName}</p>
                          <p className="text-sm text-gray-500">{selectedPregnancy.animalEarTag}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">Toro</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">{selectedPregnancy.bullName}</p>
                          <p className="text-sm text-gray-500">{selectedPregnancy.bullEarTag}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">Gestación</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">{selectedPregnancy.gestationDay} días</p>
                          <p className="text-sm text-gray-500">Embarazo #{selectedPregnancy.pregnancyNumber}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">Fecha de Parto</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">
                            {new Date(selectedPregnancy.expectedCalvingDate).toLocaleDateString('es-ES')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getStageBadge(selectedPregnancy.currentStage)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">Estado</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            {getStatusBadge(selectedPregnancy.status)}
                            {getBreedingTypeBadge(selectedPregnancy.breedingType)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">Veterinario</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">{selectedPregnancy.veterinarian.name}</p>
                          <p className="text-sm text-gray-500">{selectedPregnancy.veterinarian.license}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Estado de salud */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          Estado de Salud
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Estado General</p>
                            <p className="font-semibold capitalize">{selectedPregnancy.healthStatus.overall}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Condición Corporal</p>
                            <p className="font-semibold">{selectedPregnancy.healthStatus.bodyCondition}/5</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Peso</p>
                            <p className="font-semibold">{selectedPregnancy.healthStatus.weight} kg</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Temperatura</p>
                            <p className="font-semibold">{selectedPregnancy.healthStatus.temperature}°C</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Complicaciones */}
                    {selectedPregnancy.complications.hasComplications && (
                      <Card className="border-yellow-200 bg-yellow-50/90 backdrop-blur-sm">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-yellow-800">
                            <AlertTriangle className="h-5 w-5" />
                            Complicaciones
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm text-yellow-600">Tipo:</span>
                              <span className="ml-2 font-semibold text-yellow-800 capitalize">
                                {selectedPregnancy.complications.type}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-yellow-600">Severidad:</span>
                              <Badge 
                                variant={selectedPregnancy.complications.severity === "severe" ? "error" : "warning"}
                                className="ml-2"
                              >
                                {selectedPregnancy.complications.severity}
                              </Badge>
                            </div>
                            {selectedPregnancy.complications.description && (
                              <div>
                                <span className="text-sm text-yellow-600">Descripción:</span>
                                <p className="ml-2 text-yellow-800">{selectedPregnancy.complications.description}</p>
                              </div>
                            )}
                            {selectedPregnancy.complications.veterinaryAction && (
                              <div>
                                <span className="text-sm text-yellow-600">Acción Veterinaria:</span>
                                <p className="ml-2 text-yellow-800">{selectedPregnancy.complications.veterinaryAction}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Información de ubicación */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-green-500" />
                          Ubicación
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Dirección:</strong> {selectedPregnancy.location.address}</p>
                          <p><strong>Potrero:</strong> {selectedPregnancy.location.paddock}</p>
                          <p><strong>Instalación:</strong> {selectedPregnancy.location.facility}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Notas */}
                    {selectedPregnancy.notes && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500" />
                            Notas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-800">{selectedPregnancy.notes}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50">
                  <Button
                    variant="secondary"
                    onClick={() => setIsViewModalOpen(false)}
                    size="sm"
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleEdit(selectedPregnancy);
                    }}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de confirmación de eliminación */}
        <AnimatePresence>
          {showDeleteModal && pregnancyToDelete && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-lg shadow-xl w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {/* Header del modal */}
                <div className="flex items-center gap-4 p-4 sm:p-6 border-b">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Eliminar Registro de Embarazo
                    </h3>
                    <p className="text-sm text-gray-600">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>

                {/* Contenido del modal */}
                <div className="p-4 sm:p-6">
                  <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                    ¿Estás seguro de que deseas eliminar el registro de embarazo de{" "}
                    <strong>{pregnancyToDelete.animalName}</strong> (Arete: <strong>{pregnancyToDelete.animalEarTag}</strong>)?
                    <br />
                    <br />
                    <span className="text-sm text-gray-600">
                      Toro: {pregnancyToDelete.bullName} ({pregnancyToDelete.bullEarTag})
                      <br />
                      Días de gestación: {pregnancyToDelete.gestationDay}
                      <br />
                      Embarazo: #{pregnancyToDelete.pregnancyNumber}
                      <br />
                      Veterinario: {pregnancyToDelete.veterinarian.name}
                    </span>
                    <br />
                    <br />
                    Toda la información del embarazo se perderá permanentemente, incluyendo exámenes, notas y datos de salud.
                  </p>
                </div>

                {/* Footer del modal */}
                <div className="flex justify-end space-x-3 p-4 sm:p-6 border-t bg-gray-50">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setPregnancyToDelete(null);
                    }}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="error"
                    onClick={confirmDelete}
                    className="flex items-center space-x-2"
                    size="sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>Eliminar</span>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PregnancyTracking;