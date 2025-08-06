import React, { useState, useEffect } from "react";
import {
  Skull,
  MapPin,
  Search,
  Plus,
  TrendingUp,
  Microscope,
  Edit,
  Shield,
  Target,
  Trash2,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  Activity,
  Navigation,
  Wifi,
  WifiOff,
  Loader2,
  RefreshCw
} from "lucide-react";

// Interfaces para tipos de datos
interface PostMortemReport {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  weight: number;
  deathDate: Date;
  discoveryDate: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
    sector: string;
    environment: string;
  };
  deathCircumstances: {
    witnessed: boolean;
    timeOfDeath?: Date;
    positionFound: string;
    weatherConditions: string;
    circumstances: string;
  };
  preliminaryCause: string;
  finalCause: string;
  causeCategory:
    | "disease"
    | "trauma"
    | "poisoning"
    | "metabolic"
    | "reproductive"
    | "congenital"
    | "unknown"
    | "predation";
  necropsyPerformed: boolean;
  necropsyDate?: Date;
  pathologist: string;
  veterinarian: string;
  grossFindings: {
    externalExamination: string;
    cardiovascularSystem: string;
    respiratorySystem: string;
    digestiveSystem: string;
    nervousSystem: string;
    reproductiveSystem: string;
    musculoskeletalSystem: string;
    lymphaticSystem: string;
    other: string;
  };
  histopathology?: {
    performed: boolean;
    results: string;
    laboratory: string;
    reportDate?: Date;
  };
  toxicology?: {
    performed: boolean;
    substances: string[];
    results: string;
    laboratory: string;
  };
  microbiology?: {
    performed: boolean;
    organisms: string[];
    antibiogramResults?: string;
    laboratory: string;
  };
  photos: Array<{
    id: string;
    description: string;
    category: "external" | "internal" | "microscopic" | "site";
    timestamp: Date;
  }>;
  samples: Array<{
    id: string;
    type: string;
    organ: string;
    preservationMethod: string;
    laboratory: string;
    status: "collected" | "sent" | "processing" | "completed";
  }>;
  preventiveRecommendations: string[];
  economicImpact: number;
  reportStatus: "preliminary" | "pending_lab" | "completed" | "reviewed";
  createdBy: string;
  createdAt: Date;
  lastUpdated: Date;
  isContagious: boolean;
  requiresQuarantine: boolean;
  notifiableDisease: boolean;
  reportedToAuthorities: boolean;
}

interface MortalityStats {
  totalDeaths: number;
  monthlyDeaths: number;
  mortalityRate: number;
  mostCommonCause: string;
  averageAge: number;
  costImpact: number;
  necropsyRate: number;
  contagiousCases: number;
  seasonalTrend: "increasing" | "decreasing" | "stable";
  preventableCases: number;
}

interface ConnectionStatus {
  isConnected: boolean;
  lastCheck: Date;
  latency: number;
  retrying: boolean;
}

// ✅ CONFIGURACIÓN MEJORADA DE API
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// ✅ SERVICIO DE API MEJORADO con mejor manejo de conexión
class ApiService {
  private baseURL: string;
  private timeout: number;
  
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // 🚀 NUEVA FUNCIÓN: Obtener token de autenticación
  private getAuthToken(): string | null {
    return localStorage.getItem('auth_token') || localStorage.getItem('token') || null;
  }

  // 🚀 NUEVA FUNCIÓN: Headers por defecto
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

  // 🚀 NUEVA FUNCIÓN: Realizar petición con timeout y retry
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

  // 🚀 NUEVA FUNCIÓN: Verificar conexión con el backend
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

  // 🚀 MEJORADO: Obtener reportes con mejor manejo de errores
  async getReports(): Promise<PostMortemReport[]> {
    try {
      console.log('🔄 Obteniendo reportes desde el backend...');
      
      const response = await this.fetchWithRetry(`${this.baseURL}/health/necropsy`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Reportes obtenidos exitosamente:', data);
      
      // Procesar datos para asegurar formato correcto
      const reports = (data.data || data.reports || []).map((report: any) => ({
        ...report,
        deathDate: new Date(report.deathDate),
        discoveryDate: new Date(report.discoveryDate),
        createdAt: new Date(report.createdAt),
        lastUpdated: new Date(report.lastUpdated),
      }));

      return reports;
    } catch (error) {
      console.warn('❌ API no disponible, usando datos mock:', error);
      return getMockReports();
    }
  }

  // 🚀 MEJORADO: Crear reporte
  async createReport(reportData: Partial<PostMortemReport>): Promise<PostMortemReport> {
    try {
      console.log('🔄 Creando nuevo reporte...', reportData);

      const response = await this.fetchWithRetry(`${this.baseURL}/health/necropsy`, {
        method: 'POST',
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Reporte creado exitosamente:', data);
      
      return {
        ...data.data,
        createdAt: new Date(data.data.createdAt),
        lastUpdated: new Date(data.data.lastUpdated),
        deathDate: new Date(data.data.deathDate),
        discoveryDate: new Date(data.data.discoveryDate),
      };
    } catch (error) {
      console.warn('❌ API no disponible, simulando creación:', error);
      
      // Fallback: crear reporte mock
      const newReport: PostMortemReport = {
        id: `mock_${Date.now()}`,
        animalId: reportData.animalTag || `ID_${Date.now()}`,
        animalName: reportData.animalName || "Sin nombre",
        animalTag: reportData.animalTag || "Sin tag",
        breed: reportData.breed || "Sin especificar",
        age: reportData.age || 0,
        gender: reportData.gender || "female",
        weight: reportData.weight || 0,
        deathDate: reportData.deathDate || new Date(),
        discoveryDate: reportData.discoveryDate || new Date(),
        location: reportData.location || {
          lat: 18.0736,
          lng: -93.1000,
          address: "Ubicación por defecto",
          sector: "",
          environment: "",
        },
        deathCircumstances: reportData.deathCircumstances || {
          witnessed: false,
          positionFound: "",
          weatherConditions: "",
          circumstances: "",
        },
        preliminaryCause: reportData.preliminaryCause || "",
        finalCause: reportData.finalCause || "",
        causeCategory: reportData.causeCategory || "unknown",
        necropsyPerformed: reportData.necropsyPerformed || false,
        pathologist: reportData.pathologist || "",
        veterinarian: reportData.veterinarian || "",
        grossFindings: reportData.grossFindings || {
          externalExamination: "",
          cardiovascularSystem: "",
          respiratorySystem: "",
          digestiveSystem: "",
          nervousSystem: "",
          reproductiveSystem: "",
          musculoskeletalSystem: "",
          lymphaticSystem: "",
          other: "",
        },
        photos: [],
        samples: [],
        preventiveRecommendations: reportData.preventiveRecommendations || [],
        economicImpact: reportData.economicImpact || 0,
        reportStatus: reportData.reportStatus || "preliminary",
        createdBy: reportData.createdBy || "Usuario Mock",
        createdAt: new Date(),
        lastUpdated: new Date(),
        isContagious: reportData.isContagious || false,
        requiresQuarantine: reportData.requiresQuarantine || false,
        notifiableDisease: reportData.notifiableDisease || false,
        reportedToAuthorities: reportData.reportedToAuthorities || false,
      };
      
      return newReport;
    }
  }

  // 🚀 MEJORADO: Actualizar reporte
  async updateReport(id: string, reportData: Partial<PostMortemReport>): Promise<PostMortemReport> {
    try {
      console.log(`🔄 Actualizando reporte ${id}...`);

      const response = await this.fetchWithRetry(`${this.baseURL}/health/necropsy/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Error HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Reporte actualizado exitosamente');
      
      return {
        ...data.data,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.warn('❌ API no disponible, simulando actualización:', error);
      return { ...reportData, id, lastUpdated: new Date() } as PostMortemReport;
    }
  }

  // 🚀 MEJORADO: Eliminar reporte
  async deleteReport(id: string): Promise<boolean> {
    try {
      console.log(`🔄 Eliminando reporte ${id}...`);

      const response = await this.fetchWithRetry(`${this.baseURL}/health/necropsy/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }

      console.log('✅ Reporte eliminado exitosamente');
      return true;
    } catch (error) {
      console.warn('❌ API no disponible, simulando eliminación:', error);
      return true;
    }
  }

  // 🚀 MEJORADO: Obtener estadísticas
  async getStats(): Promise<MortalityStats> {
    try {
      console.log('🔄 Obteniendo estadísticas...');

      const response = await this.fetchWithRetry(`${this.baseURL}/dashboard/mortality-rates`);
      
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

// 🚀 NUEVA FUNCIÓN: Hook para monitorear conexión
const useConnectionStatus = () => {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastCheck: new Date(),
    latency: 0,
    retrying: false,
  });

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

// Instancia del servicio de API
const apiService = new ApiService();

// ✅ NUEVA FUNCIÓN: Obtener ubicación actual
const getCurrentLocation = (): Promise<{ lat: number; lng: number; address: string }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no soportada'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Intentar obtener dirección usando geocoding inverso
        try {
          // En una aplicación real, usarías una API como Google Maps o Mapbox
          // Por ahora, generamos una dirección simulada basada en las coordenadas
          const address = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)} - Cunduacán, Tabasco`;
          resolve({ lat, lng, address });
        } catch (error) {
          resolve({ lat, lng, address: `Ubicación: ${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        }
      },
      (error) => {
        console.error('Error obteniendo ubicación:', error);
        // Ubicación por defecto (Cunduacán, Tabasco)
        resolve({
          lat: 18.0736,
          lng: -93.1000,
          address: "Ubicación por defecto - Cunduacán, Tabasco"
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  });
};

// Datos mock para desarrollo y fallback
function getMockReports(): PostMortemReport[] {
  return [
    {
      id: "mock_1",
      animalId: "COW004",
      animalName: "Margarita",
      animalTag: "TAG-004",
      breed: "Holstein",
      age: 4,
      gender: "female",
      weight: 520,
      deathDate: new Date("2025-07-08"),
      discoveryDate: new Date("2025-07-08"),
      location: {
        lat: 18.0736,
        lng: -93.1000,
        address: "Establo Principal, Cunduacán, Tabasco",
        sector: "A",
        environment: "Confinamiento",
      },
      deathCircumstances: {
        witnessed: false,
        positionFound: "Decúbito lateral izquierdo",
        weatherConditions: "Caluroso, 32°C",
        circumstances: "Encontrada muerta en la mañana, sin signos previos aparentes",
      },
      preliminaryCause: "Neumonía severa",
      finalCause: "Neumonía bacteriana por Mannheimia haemolytica",
      causeCategory: "disease",
      necropsyPerformed: true,
      necropsyDate: new Date("2025-07-08"),
      pathologist: "Dr. Hernández",
      veterinarian: "Dr. García",
      grossFindings: {
        externalExamination: "Animal en buen estado nutricional, sin lesiones externas evidentes",
        cardiovascularSystem: "Corazón aumentado de tamaño, congestión venosa",
        respiratorySystem: "Pulmones consolidados bilateralmente, exudado purulento en bronquios",
        digestiveSystem: "Sin hallazgos significativos",
        nervousSystem: "Sin alteraciones macroscópicas",
        reproductiveSystem: "Útero gestante de 6 meses",
        musculoskeletalSystem: "Sin lesiones",
        lymphaticSystem: "Nódulos linfáticos mediastínicos aumentados",
        other: "Hígado con congestión pasiva",
      },
      histopathology: {
        performed: true,
        results: "Bronconeumonía supurativa severa con colonias bacterianas",
        laboratory: "Laboratorio Veterinario Central",
        reportDate: new Date("2025-07-12"),
      },
      microbiology: {
        performed: true,
        organisms: ["Mannheimia haemolytica"],
        antibiogramResults: "Sensible a penicilina, resistente a tetraciclina",
        laboratory: "Laboratorio Veterinario Central",
      },
      photos: [],
      samples: [],
      preventiveRecommendations: [
        "Mejorar ventilación en establos",
        "Implementar programa de vacunación respiratoria",
        "Monitoreo de estrés térmico",
        "Separar animales gestantes",
      ],
      economicImpact: 15000,
      reportStatus: "completed",
      createdBy: "Dr. García",
      createdAt: new Date("2025-07-08"),
      lastUpdated: new Date("2025-07-12"),
      isContagious: true,
      requiresQuarantine: false,
      notifiableDisease: false,
      reportedToAuthorities: false,
    },
  ];
}

function getMockStats(): MortalityStats {
  return {
    totalDeaths: 18,
    monthlyDeaths: 3,
    mortalityRate: 2.8,
    mostCommonCause: "Enfermedades respiratorias",
    averageAge: 4.2,
    costImpact: 180000,
    necropsyRate: 85.5,
    contagiousCases: 2,
    seasonalTrend: "increasing",
    preventableCases: 12,
  };
}

// 🚀 NUEVO COMPONENTE: Indicador de conexión
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
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "disease":
        return "bg-red-100 text-red-800 border-red-200";
      case "trauma":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "poisoning":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "metabolic":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reproductive":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "congenital":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "predation":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "unknown":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "preliminary":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending_lab":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "reviewed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
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

// ✅ COMPONENTE DE MAPA MEJORADO - Con ubicaciones reales
const MortalityMap = ({ reports }: { reports: PostMortemReport[] }) => {
  return (
    <div className="h-96 bg-gradient-to-br from-[#f2e9d8]/50 to-[#519a7c]/20 rounded-lg flex items-center justify-center relative overflow-hidden border border-[#519a7c]/20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f2e9d8]/60 to-[#519a7c]/30"></div>

      <div className="absolute top-4 left-4 bg-white/95 rounded-lg px-3 py-2 shadow-md border border-[#519a7c]/30">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#519a7c]" />
          <span className="text-sm font-medium">
            Mapa de Mortalidad - Cunduacán, Tabasco
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-white/95 rounded-lg p-3 shadow-md text-xs border border-[#519a7c]/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Enfermedad</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Trauma</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Envenenamiento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Desconocido</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-full">
        {/* ✅ MEJORADO: Mostrar ubicaciones reales de reportes */}
        {reports.map((report, index) => {
          const getColorForCause = (cause: string) => {
            switch (cause) {
              case "disease": return "bg-red-600";
              case "trauma": return "bg-orange-500";
              case "poisoning": return "bg-purple-500";
              case "metabolic": return "bg-blue-500";
              case "reproductive": return "bg-pink-500";
              case "predation": return "bg-gray-700";
              default: return "bg-gray-500";
            }
          };

          // Convertir coordenadas reales a posición en el mapa (simulado)
          const position = {
            top: `${20 + (index * 15) % 60}%`,
            left: `${25 + (index * 20) % 50}%`,
          };

          return (
            <div key={report.id} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={position}>
              <div className={`${getColorForCause(report.causeCategory)} rounded-full w-8 h-8 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform`}>
                <Skull className="w-4 h-4 text-white" />
              </div>
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white/95 rounded-lg p-2 shadow-lg w-40 text-xs border border-[#519a7c]/30 z-10">
                <p className="font-medium text-gray-800">{report.finalCause || report.preliminaryCause}</p>
                <p className="text-gray-600">{report.animalName} - {report.breed}</p>
                <p className="text-gray-600">{report.location.address}</p>
                <p className="text-gray-500">Lat: {report.location.lat.toFixed(4)}, Lng: {report.location.lng.toFixed(4)}</p>
              </div>
            </div>
          );
        })}

        {/* Mostrar mensaje si no hay reportes */}
        {reports.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 rounded-lg p-4 text-center shadow-md">
              <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No hay reportes para mostrar</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ FORMULARIO MEJORADO - Con geolocalización automática y mejor validación
const ReportFormModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  report, 
  isEditing = false 
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: Partial<PostMortemReport>) => void;
  report?: PostMortemReport;
  isEditing?: boolean;
}) => {
  const [formData, setFormData] = useState<Partial<PostMortemReport>>({
    animalName: "",
    animalTag: "",
    breed: "",
    age: 0,
    gender: "female",
    weight: 0,
    deathDate: new Date(),
    discoveryDate: new Date(),
    location: {
      lat: 18.0736,
      lng: -93.1000,
      address: "",
      sector: "",
      environment: "",
    },
    deathCircumstances: {
      witnessed: false,
      positionFound: "",
      weatherConditions: "",
      circumstances: "",
    },
    preliminaryCause: "",
    finalCause: "",
    causeCategory: "unknown",
    necropsyPerformed: false,
    pathologist: "",
    veterinarian: "",
    grossFindings: {
      externalExamination: "",
      cardiovascularSystem: "",
      respiratorySystem: "",
      digestiveSystem: "",
      nervousSystem: "",
      reproductiveSystem: "",
      musculoskeletalSystem: "",
      lymphaticSystem: "",
      other: "",
    },
    preventiveRecommendations: [],
    economicImpact: 0,
    reportStatus: "preliminary",
    isContagious: false,
    requiresQuarantine: false,
    notifiableDisease: false,
    reportedToAuthorities: false,
  });

  const [recommendations, setRecommendations] = useState<string>("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // ✅ NUEVA FUNCIÓN: Obtener ubicación actual
  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location!,
          lat: location.lat,
          lng: location.lng,
          address: location.address,
        }
      }));
    } catch (error) {
      console.error('Error obteniendo ubicación:', error);
      alert('No se pudo obtener la ubicación actual. Se usará la ubicación por defecto.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // 🚀 NUEVA FUNCIÓN: Validar formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.animalName?.trim()) {
      errors.animalName = "El nombre del animal es obligatorio";
    }

    if (!formData.animalTag?.trim()) {
      errors.animalTag = "La etiqueta/tag es obligatoria";
    }

    if (!formData.veterinarian?.trim()) {
      errors.veterinarian = "El veterinario es obligatorio";
    }

    if (!formData.breed?.trim()) {
      errors.breed = "La raza es obligatoria";
    }

    if (!formData.age || formData.age <= 0) {
      errors.age = "La edad debe ser mayor a 0";
    }

    if (!formData.weight || formData.weight <= 0) {
      errors.weight = "El peso debe ser mayor a 0";
    }

    if (!formData.location?.address?.trim()) {
      errors.address = "La ubicación es obligatoria";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (report && isEditing) {
      setFormData(report);
      setRecommendations(report.preventiveRecommendations.join("\n"));
    } else if (isOpen) {
      // Auto-obtener ubicación al abrir formulario nuevo
      handleGetCurrentLocation();
      
      // Reset form for new report
      setFormData({
        animalName: "",
        animalTag: "",
        breed: "",
        age: 0,
        gender: "female",
        weight: 0,
        deathDate: new Date(),
        discoveryDate: new Date(),
        location: {
          lat: 18.0736,
          lng: -93.1000,
          address: "",
          sector: "",
          environment: "",
        },
        deathCircumstances: {
          witnessed: false,
          positionFound: "",
          weatherConditions: "",
          circumstances: "",
        },
        preliminaryCause: "",
        finalCause: "",
        causeCategory: "unknown",
        necropsyPerformed: false,
        pathologist: "",
        veterinarian: "",
        grossFindings: {
          externalExamination: "",
          cardiovascularSystem: "",
          respiratorySystem: "",
          digestiveSystem: "",
          nervousSystem: "",
          reproductiveSystem: "",
          musculoskeletalSystem: "",
          lymphaticSystem: "",
          other: "",
        },
        preventiveRecommendations: [],
        economicImpact: 0,
        reportStatus: "preliminary",
        isContagious: false,
        requiresQuarantine: false,
        notifiableDisease: false,
        reportedToAuthorities: false,
      });
      setRecommendations("");
      setFormErrors({});
    }
  }, [report, isEditing, isOpen]);

  // ✅ FUNCIÓN MEJORADA: Guardar reporte con validación
  const handleSubmit = () => {
    if (!validateForm()) {
      alert('Por favor corrija los errores en el formulario antes de continuar.');
      return;
    }

    const submitData = {
      ...formData,
      preventiveRecommendations: recommendations.split("\n").filter(rec => rec.trim() !== ""),
      animalId: formData.animalTag, // Usar el tag como ID del animal
    };

    console.log('🚀 Enviando datos del reporte:', submitData);
    onSave(submitData);
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

  const updateNestedFormData = (parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof typeof prev] as any,
        [field]: value
      }
    }));

    // Limpiar error si el campo se corrige
    const errorKey = `${parentField}.${field}`;
    if (formErrors[errorKey]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
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
              {isEditing ? "Editar Reporte Post-Mortem" : "Nuevo Reporte Post-Mortem"}
            </h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información del Animal */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#519a7c]" />
                Información del Animal
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Animal *</label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] ${
                    formErrors.animalName ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.animalName}
                  onChange={(e) => updateFormData("animalName", e.target.value)}
                />
                {formErrors.animalName && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.animalName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta/Tag *</label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] ${
                    formErrors.animalTag ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.animalTag}
                  onChange={(e) => updateFormData("animalTag", e.target.value)}
                />
                {formErrors.animalTag && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.animalTag}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raza *</label>
                  <input
                    type="text"
                    required
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] ${
                      formErrors.breed ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.breed}
                    onChange={(e) => updateFormData("breed", e.target.value)}
                  />
                  {formErrors.breed && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.breed}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Género *</label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                    value={formData.gender}
                    onChange={(e) => updateFormData("gender", e.target.value)}
                  >
                    <option value="female">Hembra</option>
                    <option value="male">Macho</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Edad (años) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] ${
                      formErrors.age ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.age}
                    onChange={(e) => updateFormData("age", parseFloat(e.target.value) || 0)}
                  />
                  {formErrors.age && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.age}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] ${
                      formErrors.weight ? 'border-red-500' : 'border-gray-300'
                    }`}
                    value={formData.weight}
                    onChange={(e) => updateFormData("weight", parseFloat(e.target.value) || 0)}
                  />
                  {formErrors.weight && (
                    <p className="text-xs text-red-600 mt-1">{formErrors.weight}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Muerte *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                    value={formData.deathDate ? new Date(formData.deathDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateFormData("deathDate", new Date(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Descubrimiento *</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                    value={formData.discoveryDate ? new Date(formData.discoveryDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => updateFormData("discoveryDate", new Date(e.target.value))}
                  />
                </div>
              </div>
            </div>

            {/* ✅ UBICACIÓN MEJORADA - Con geolocalización */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#519a7c]" />
                Ubicación y Circunstancias
              </h3>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Dirección/Ubicación *</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleGetCurrentLocation}
                    disabled={isGettingLocation}
                    className="text-xs"
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        Obteniendo...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3 h-3 mr-1" />
                        Mi Ubicación
                      </>
                    )}
                  </Button>
                </div>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] ${
                    formErrors.address ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.location?.address}
                  onChange={(e) => updateNestedFormData("location", "address", e.target.value)}
                />
                {formErrors.address && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.address}</p>
                )}
                {formData.location?.lat && formData.location?.lng && (
                  <p className="text-xs text-gray-500 mt-1">
                    Coordenadas: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                    value={formData.location?.sector}
                    onChange={(e) => updateNestedFormData("location", "sector", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ambiente</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                    value={formData.location?.environment}
                    onChange={(e) => updateNestedFormData("location", "environment", e.target.value)}
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Confinamiento">Confinamiento</option>
                    <option value="Pastoreo">Pastoreo</option>
                    <option value="Corral">Corral</option>
                    <option value="Establo">Establo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Circunstancias de la Muerte</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.deathCircumstances?.circumstances}
                  onChange={(e) => updateNestedFormData("deathCircumstances", "circumstances", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condiciones Climáticas</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.deathCircumstances?.weatherConditions}
                  onChange={(e) => updateNestedFormData("deathCircumstances", "weatherConditions", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Posición Encontrada</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.deathCircumstances?.positionFound}
                  onChange={(e) => updateNestedFormData("deathCircumstances", "positionFound", e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="witnessed"
                  className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]/50"
                  checked={formData.deathCircumstances?.witnessed}
                  onChange={(e) => updateNestedFormData("deathCircumstances", "witnessed", e.target.checked)}
                />
                <label htmlFor="witnessed" className="text-sm font-medium text-gray-700">Muerte presenciada</label>
              </div>
            </div>
          </div>

          {/* Causa y Diagnóstico */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Microscope className="w-5 h-5 text-[#519a7c]" />
              Causa y Diagnóstico
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Causa Preliminar</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.preliminaryCause}
                  onChange={(e) => updateFormData("preliminaryCause", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría de Causa</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.causeCategory}
                  onChange={(e) => updateFormData("causeCategory", e.target.value)}
                >
                  <option value="unknown">Desconocida</option>
                  <option value="disease">Enfermedad</option>
                  <option value="trauma">Trauma</option>
                  <option value="poisoning">Envenenamiento</option>
                  <option value="metabolic">Metabólica</option>
                  <option value="reproductive">Reproductiva</option>
                  <option value="congenital">Congénita</option>
                  <option value="predation">Depredación</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Causa Final (Diagnóstico Definitivo)</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                value={formData.finalCause}
                onChange={(e) => updateFormData("finalCause", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario *</label>
                <input
                  type="text"
                  required
                  className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] ${
                    formErrors.veterinarian ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.veterinarian}
                  onChange={(e) => updateFormData("veterinarian", e.target.value)}
                />
                {formErrors.veterinarian && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.veterinarian}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Patólogo</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.pathologist}
                  onChange={(e) => updateFormData("pathologist", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="necropsyPerformed"
                className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]/50"
                checked={formData.necropsyPerformed}
                onChange={(e) => updateFormData("necropsyPerformed", e.target.checked)}
              />
              <label htmlFor="necropsyPerformed" className="text-sm font-medium text-gray-700">Necropsia realizada</label>
            </div>
          </div>

          {/* Hallazgos Macroscópicos */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Hallazgos Macroscópicos</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Examen Externo</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.grossFindings?.externalExamination}
                  onChange={(e) => updateNestedFormData("grossFindings", "externalExamination", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sistema Cardiovascular</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.grossFindings?.cardiovascularSystem}
                  onChange={(e) => updateNestedFormData("grossFindings", "cardiovascularSystem", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sistema Respiratorio</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.grossFindings?.respiratorySystem}
                  onChange={(e) => updateNestedFormData("grossFindings", "respiratorySystem", e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sistema Digestivo</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.grossFindings?.digestiveSystem}
                  onChange={(e) => updateNestedFormData("grossFindings", "digestiveSystem", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Recomendaciones y Estado */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Recomendaciones y Estado</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Recomendaciones Preventivas (una por línea)</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                placeholder="Escriba cada recomendación en una línea nueva..."
                value={recommendations}
                onChange={(e) => setRecommendations(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Impacto Económico ($)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.economicImpact}
                  onChange={(e) => updateFormData("economicImpact", parseFloat(e.target.value) || 0)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado del Reporte</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.reportStatus}
                  onChange={(e) => updateFormData("reportStatus", e.target.value)}
                >
                  <option value="preliminary">Preliminar</option>
                  <option value="pending_lab">Pendiente de laboratorio</option>
                  <option value="completed">Completado</option>
                  <option value="reviewed">Revisado</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isContagious"
                  className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]/50"
                  checked={formData.isContagious}
                  onChange={(e) => updateFormData("isContagious", e.target.checked)}
                />
                <label htmlFor="isContagious" className="text-sm font-medium text-gray-700">Es contagioso</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="requiresQuarantine"
                  className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]/50"
                  checked={formData.requiresQuarantine}
                  onChange={(e) => updateFormData("requiresQuarantine", e.target.checked)}
                />
                <label htmlFor="requiresQuarantine" className="text-sm font-medium text-gray-700">Requiere cuarentena</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notifiableDisease"
                  className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]/50"
                  checked={formData.notifiableDisease}
                  onChange={(e) => updateFormData("notifiableDisease", e.target.checked)}
                />
                <label htmlFor="notifiableDisease" className="text-sm font-medium text-gray-700">Enfermedad notificable</label>
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
              {isEditing ? "Actualizar Reporte" : "Guardar Reporte"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PostMortemReports = () => {
  const [reports, setReports] = useState<PostMortemReport[]>([]);
  const [stats, setStats] = useState<MortalityStats>({
    totalDeaths: 0,
    monthlyDeaths: 0,
    mortalityRate: 0,
    mostCommonCause: "",
    averageAge: 0,
    costImpact: 0,
    necropsyRate: 0,
    contagiousCases: 0,
    seasonalTrend: "stable",
    preventableCases: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<PostMortemReport | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string>("");
  
  // 🚀 NUEVO: Estado de conexión
  const { status: connectionStatus, checkConnection } = useConnectionStatus();

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
      
      setLoadingMessage("Cargando datos...");
      const [reportsData, statsData] = await Promise.all([
        apiService.getReports(),
        apiService.getStats()
      ]);
      
      setReports(reportsData);
      setStats(statsData);
      
      console.log('✅ Datos cargados exitosamente');
    } catch (error) {
      console.error("❌ Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handlers para CRUD
  const handleNewReport = () => {
    setEditingReport(undefined);
    setIsFormModalOpen(true);
  };

  const handleEditReport = (report: PostMortemReport) => {
    setEditingReport(report);
    setIsFormModalOpen(true);
  };

  const handleDeleteReport = (reportId: string) => {
    setReportToDelete(reportId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!reportToDelete) return;
    
    setIsLoading(true);
    setLoadingMessage("Eliminando reporte...");
    
    try {
      await apiService.deleteReport(reportToDelete);
      setReports(prev => prev.filter(r => r.id !== reportToDelete));
      setShowDeleteConfirm(false);
      setReportToDelete("");
      
      // Actualizar estadísticas
      const newStats = await apiService.getStats();
      setStats(newStats);
    } catch (error) {
      console.error("Error eliminando reporte:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FUNCIÓN CORREGIDA: Guardar reporte
  const handleSaveReport = async (reportData: Partial<PostMortemReport>) => {
    setIsLoading(true);
    setLoadingMessage(editingReport ? "Actualizando reporte..." : "Guardando reporte...");
    
    try {
      let savedReport: PostMortemReport;
      
      if (editingReport) {
        // Actualizar reporte existente
        savedReport = await apiService.updateReport(editingReport.id, reportData);
        setReports(prev => prev.map(r => r.id === editingReport.id ? savedReport : r));
        console.log('✅ Reporte actualizado:', savedReport);
      } else {
        // Crear nuevo reporte
        savedReport = await apiService.createReport({
          ...reportData,
          createdBy: "Usuario Actual", // En una app real, esto vendría del contexto de usuario
        });
        setReports(prev => [savedReport, ...prev]);
        console.log('✅ Nuevo reporte creado:', savedReport);
      }
      
      setIsFormModalOpen(false);
      setEditingReport(undefined);
      
      // Recargar estadísticas
      const newStats = await apiService.getStats();
      setStats(newStats);
      
    } catch (error) {
      console.error("Error guardando reporte:", error);
      alert('❌ Error al guardar el reporte. Verifique su conexión e intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ FILTRADO SIMPLIFICADO - Solo búsqueda
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.finalCause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.animalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.veterinarian.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-2 sm:p-6 overflow-x-hidden">
      {/* 🚀 NUEVO: Header con indicador de conexión */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-[#519a7c]/30 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reportes Post-Mortem
              </h1>
              <p className="text-gray-600 mt-1">
                Análisis patológico y causa de mortalidad
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* 🚀 NUEVO: Indicador de conexión */}
              <ConnectionIndicator />
              
              {/* Búsqueda mejorada */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar reportes..."
                  className="w-64 pl-10 pr-4 py-2 border border-[#519a7c]/60 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] bg-white/90 backdrop-blur-sm"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button size="sm" onClick={handleNewReport}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Reporte
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 gap-6">
          {/* 🚀 NUEVO: Indicador de estado de backend */}
          {!connectionStatus.isConnected && (
            <Card className="bg-orange-100/90 border-orange-300/60">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card className="bg-gradient-to-br from-gray-100/90 to-gray-50/90 border-gray-300/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200/80 rounded-lg flex items-center justify-center">
                    <Skull className="w-6 h-6 text-gray-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Total Muertes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalDeaths}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-100/90 to-red-50/90 border-red-300/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-200/80 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-red-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-red-800">Tasa Mortalidad</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.mortalityRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#519a7c]/20 to-[#519a7c]/10 border-[#519a7c]/40">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#519a7c]/30 rounded-lg flex items-center justify-center">
                    <Microscope className="w-6 h-6 text-[#519a7c]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#519a7c]">Tasa Necropsia</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.necropsyRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-100/90 to-green-50/90 border-green-300/60">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-200/80 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-700" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Casos Prevenibles</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.preventableCases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#f4ac3a]/20 to-[#f4ac3a]/10 border-[#f4ac3a]/40">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f4ac3a]/30 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-[#f4ac3a]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-orange-700">Impacto Económico</p>
                    <p className="text-2xl font-bold text-gray-900">${(stats.costImpact / 1000).toFixed(0)}K</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mapa Mejorado - Ancho completo */}
          <Card className="bg-white/95 border-[#519a7c]/40">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#519a7c]" />
                Mapa de Casos de Mortalidad ({filteredReports.length} reportes)
              </CardTitle>
              <CardDescription>
                Distribución geográfica de casos por causa de muerte - Cunduacán, Tabasco
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MortalityMap reports={filteredReports} />
            </CardContent>
          </Card>

          {/* Lista de Reportes */}
          <Card className="bg-white/95 border-[#519a7c]/40">
            <CardHeader>
              <CardTitle>Reportes Post-Mortem ({filteredReports.length})</CardTitle>
              <CardDescription>
                Análisis patológicos y determinación de causa de muerte
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-12">
                    <Skull className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay reportes</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm ? 'No se encontraron reportes que coincidan con tu búsqueda.' : 'Aún no hay reportes post-mortem registrados.'}
                    </p>
                    {!searchTerm && (
                      <Button onClick={handleNewReport}>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Primer Reporte
                      </Button>
                    )}
                  </div>
                ) : (
                  filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="border border-white/60 bg-white/90 backdrop-blur-sm rounded-lg p-6 hover:shadow-lg hover:bg-white/95 transition-all duration-200 break-words"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-xl font-semibold text-gray-900">
                              {report.animalName} ({report.animalTag})
                            </h4>
                            <Badge variant={report.causeCategory}>
                              {report.causeCategory === "disease" ? "Enfermedad" :
                               report.causeCategory === "trauma" ? "Trauma" :
                               report.causeCategory === "poisoning" ? "Envenenamiento" :
                               report.causeCategory === "metabolic" ? "Metabólica" :
                               report.causeCategory === "reproductive" ? "Reproductiva" :
                               report.causeCategory === "congenital" ? "Congénita" :
                               report.causeCategory === "predation" ? "Depredación" : "Desconocida"}
                            </Badge>
                            <Badge variant={report.reportStatus}>
                              {report.reportStatus === "preliminary" ? "Preliminar" :
                               report.reportStatus === "pending_lab" ? "Pendiente Lab" :
                               report.reportStatus === "completed" ? "Completado" : "Revisado"}
                            </Badge>
                            {report.isContagious && <Badge variant="critical">Contagioso</Badge>}
                            {report.requiresQuarantine && <Badge variant="warning">Cuarentena</Badge>}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-600">Raza:</p>
                              <p className="font-medium">{report.breed}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Edad:</p>
                              <p className="font-medium">{report.age} años</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Peso:</p>
                              <p className="font-medium">{report.weight} kg</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Fecha muerte:</p>
                              <p className="font-medium">{new Date(report.deathDate).toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-900 mb-2">Causa Final de Muerte</h5>
                            <p className="text-gray-800 bg-gradient-to-r from-[#f2e9d8]/60 to-[#f2e9d8]/40 backdrop-blur-sm p-3 rounded-lg border border-[#519a7c]/20 break-words overflow-wrap-anywhere">
                              {report.finalCause || report.preliminaryCause || 'No especificada'}
                            </p>
                          </div>

                          {report.preventiveRecommendations && report.preventiveRecommendations.length > 0 && (
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-900 mb-2">Recomendaciones Preventivas</h5>
                              <div className="space-y-1">
                                {report.preventiveRecommendations.map((rec, idx) => (
                                  <div key={idx} className="flex items-start gap-2">
                                    <div className="w-2 h-2 bg-[#519a7c] rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm text-gray-700">{rec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Veterinario:</strong> {report.veterinarian}
                            </div>
                            <div>
                              <strong>Impacto económico:</strong> ${report.economicImpact?.toLocaleString() || 0}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hover:bg-[#519a7c]/10 hover:border-[#519a7c]"
                            onClick={() => handleEditReport(report)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                            onClick={() => handleDeleteReport(report.id)}
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
        </div>
      </div>

      {/* Modals */}
      <LoadingModal isOpen={isLoading} message={loadingMessage} />
      
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Eliminar Reporte"
        message="¿Estás seguro de que deseas eliminar este reporte post-mortem? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />

      <ReportFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveReport}
        report={editingReport}
        isEditing={!!editingReport}
      />
    </div>
  );
};

export default PostMortemReports;