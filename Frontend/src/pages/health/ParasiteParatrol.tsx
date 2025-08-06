import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bug,
  Shield,
  MapPin,
  Search,
  Filter,
  Plus,
  AlertTriangle,
  Eye,
  Edit,
  Activity,
  Users,
  Zap,
  X,
  Save,
  Trash2,
  Navigation,
  Menu,
  Loader2
} from 'lucide-react';

// Interfaces para tipos de datos
interface Parasite {
  id: string;
  name: string;
  scientificName: string;
  type: 'internal' | 'external';
  category: 'nematode' | 'cestode' | 'trematode' | 'protozoa' | 'arthropod' | 'mite' | 'tick' | 'fly';
  description: string;
  symptoms: string[];
  affectedOrgans: string[];
  transmissionMode: string;
  lifecycle: string;
  seasonality: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  prevalence: number;
  economicImpact: 'low' | 'medium' | 'high';
  zoonoticRisk: boolean;
}

interface ParasiteInfestation {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  parasiteId: string;
  parasiteName: string;
  detectionDate: Date;
  detectionMethod: 'clinical' | 'laboratory' | 'necropsy' | 'field_observation';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  parasiteLoad: 'low' | 'medium' | 'high' | 'very_high';
  location: {
    lat: number;
    lng: number;
    address: string;
    sector: string;
  };
  clinicalSigns: string[];
  laboratoryResults?: {
    eggCount?: number;
    oocystCount?: number;
    larvaeCount?: number;
    adultsFound?: number;
    testMethod: string;
    testDate: Date;
  };
  veterinarian: string;
  treatment?: {
    medicationId: string;
    medicationName: string;
    startDate: Date;
    endDate?: Date;
    dosage: string;
    frequency: string;
    route: string;
    cost: number;
  };
  status: 'active' | 'treating' | 'resolved' | 'chronic' | 'reinfection';
  followUpDate?: Date;
  notes: string;
}

interface ParasiteStats {
  totalInfestations: number;
  activeInfestations: number;
  resolvedInfestations: number;
  criticalCases: number;
  treatmentSuccessRate: number;
  mostCommonParasite: string;
  seasonalTrend: 'increasing' | 'decreasing' | 'stable';
  averageTreatmentDays: number;
  totalTreatmentCost: number;
  affectedAnimals: number;
  reinfectionRate: number;
}

interface SeasonalAlert {
  id: string;
  parasiteName: string;
  season: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  expectedIncrease: number;
  recommendedActions: string[];
  isActive: boolean;
}

interface NewInfestationForm {
  animalId: string;
  animalName: string;
  animalTag: string;
  parasiteId: string;
  parasiteName: string;
  detectionDate: string;
  detectionMethod: string;
  severity: string;
  parasiteLoad: string;
  latitude: number;
  longitude: number;
  address: string;
  sector: string;
  clinicalSigns: string;
  veterinarian: string;
  notes: string;
  eggCount?: number;
  testMethod?: string;
  testDate?: string;
}

// API Service Configuration
const API_BASE_URL = 'http://localhost:5000/api';

class APIService {
  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }
    return response.json();
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });
      return await this.handleResponse(response);
    } catch (error) {
      console.error(`API Request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Parasites
  async getParasites(): Promise<Parasite[]> {
    return this.request('/parasites');
  }

  async createParasite(parasite: Omit<Parasite, 'id'>): Promise<Parasite> {
    return this.request('/parasites', {
      method: 'POST',
      body: JSON.stringify(parasite),
    });
  }

  // Infestations
  async getInfestations(): Promise<ParasiteInfestation[]> {
    const data = await this.request('/infestations');
    return data.map((infestation: any) => ({
      ...infestation,
      detectionDate: new Date(infestation.detectionDate),
      followUpDate: infestation.followUpDate ? new Date(infestation.followUpDate) : undefined,
      laboratoryResults: infestation.laboratoryResults ? {
        ...infestation.laboratoryResults,
        testDate: new Date(infestation.laboratoryResults.testDate)
      } : undefined,
      treatment: infestation.treatment ? {
        ...infestation.treatment,
        startDate: new Date(infestation.treatment.startDate),
        endDate: infestation.treatment.endDate ? new Date(infestation.treatment.endDate) : undefined
      } : undefined
    }));
  }

  async createInfestation(infestation: Omit<ParasiteInfestation, 'id'>): Promise<ParasiteInfestation> {
    const data = await this.request('/infestations', {
      method: 'POST',
      body: JSON.stringify(infestation),
    });
    return {
      ...data,
      detectionDate: new Date(data.detectionDate),
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      laboratoryResults: data.laboratoryResults ? {
        ...data.laboratoryResults,
        testDate: new Date(data.laboratoryResults.testDate)
      } : undefined,
      treatment: data.treatment ? {
        ...data.treatment,
        startDate: new Date(data.treatment.startDate),
        endDate: data.treatment.endDate ? new Date(data.treatment.endDate) : undefined
      } : undefined
    };
  }

  async updateInfestation(id: string, infestation: Partial<ParasiteInfestation>): Promise<ParasiteInfestation> {
    const data = await this.request(`/infestations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(infestation),
    });
    return {
      ...data,
      detectionDate: new Date(data.detectionDate),
      followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      laboratoryResults: data.laboratoryResults ? {
        ...data.laboratoryResults,
        testDate: new Date(data.laboratoryResults.testDate)
      } : undefined,
      treatment: data.treatment ? {
        ...data.treatment,
        startDate: new Date(data.treatment.startDate),
        endDate: data.treatment.endDate ? new Date(data.treatment.endDate) : undefined
      } : undefined
    };
  }

  async deleteInfestation(id: string): Promise<void> {
    await this.request(`/infestations/${id}`, {
      method: 'DELETE',
    });
  }

  // Statistics
  async getStats(): Promise<ParasiteStats> {
    return this.request('/infestations/stats');
  }

  // Seasonal Alerts
  async getSeasonalAlerts(): Promise<SeasonalAlert[]> {
    return this.request('/seasonal-alerts');
  }

  // Test Backend Connection
  async testConnection(): Promise<{ status: string; message: string }> {
    return this.request('/health');
  }
}

const apiService = new APIService();

// Lista de sugerencias de parásitos
const PARASITE_SUGGESTIONS = [
  "Garrapata del Ganado",
  "Lombriz Intestinal", 
  "Mosca del Cuerno",
  "Tenia del Ganado",
  "Fasciola Hepática",
  "Áscaris Bovino",
  "Tricocéfalo",
  "Oesophagostomum",
  "Dictyocaulus",
  "Piojos del Ganado",
  "Ácaros de la Sarna",
  "Moscas de los Cuernos",
  "Garrapata de la Oreja",
  "Coccidios",
  "Cryptosporidium",
  "Giardia",
  "Eimeria",
  "Neospora",
  "Babesia",
  "Anaplasmosis"
];

// Componentes reutilizables
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-4 sm:px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-base sm:text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <p className={`text-xs sm:text-sm text-gray-600 mt-1 ${className}`}>
    {children}
  </p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-4 sm:px-6 py-4 ${className}`}>
    {children}
  </div>
);

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'default';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default', 
  className = '', 
  type = 'button', 
  disabled = false 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500"
  };
  const sizeClasses = {
    sm: "px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm",
    default: "px-3 sm:px-4 py-2 text-sm"
  };

  return (
    <button 
      type={type}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant: string;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant, className = '' }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'internal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'external': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'active': return 'bg-red-100 text-red-800 border-red-200';
      case 'treating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'chronic': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'reinfection': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'mild': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'severe': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'very_high': return 'bg-red-100 text-red-800 border-red-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(variant)} ${className}`}>
      {children}
    </span>
  );
};

// Interfaces para componentes modales
interface NewInfestationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (infestation: NewInfestationForm) => Promise<void>;
  editingInfestation?: ParasiteInfestation | null;
  parasites: Parasite[];
  isLoading: boolean;
}

interface InfestationDetailsModalProps {
  infestation: ParasiteInfestation | null;
  isOpen: boolean;
  onClose: () => void;
  parasites: Parasite[];
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  infestationName: string;
  isLoading: boolean;
}

interface InfestationMapProps {
  infestations: ParasiteInfestation[];
}

interface SeasonalAlertCardProps {
  alert: SeasonalAlert;
}

interface ConnectionStatusProps {
  isConnected: boolean;
  isLoading: boolean;
  onRetry: () => void;
}

// Connection Status Component
const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ isConnected, isLoading, onRetry }) => {
  if (isLoading) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Conectando al servidor...</span>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span className="text-sm font-medium">Sin conexión al servidor</span>
        </div>
        <button 
          onClick={onRetry}
          className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-sm">Conectado al servidor</span>
    </div>
  );
};

// Modal para registrar nuevo caso
const NewInfestationModal: React.FC<NewInfestationModalProps> = ({ isOpen, onClose, onSave, editingInfestation, parasites, isLoading }) => {
  const [formData, setFormData] = useState<NewInfestationForm>({
    animalId: '',
    animalName: '',
    animalTag: '',
    parasiteId: '',
    parasiteName: '',
    detectionDate: new Date().toISOString().split('T')[0],
    detectionMethod: 'clinical',
    severity: 'mild',
    parasiteLoad: 'low',
    latitude: 17.9869,
    longitude: -92.9303,
    address: '',
    sector: '',
    clinicalSigns: '',
    veterinarian: '',
    notes: '',
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (editingInfestation && isOpen) {
      setFormData({
        animalId: editingInfestation.animalId,
        animalName: editingInfestation.animalName,
        animalTag: editingInfestation.animalTag,
        parasiteId: editingInfestation.parasiteId,
        parasiteName: editingInfestation.parasiteName,
        detectionDate: editingInfestation.detectionDate.toISOString().split('T')[0],
        detectionMethod: editingInfestation.detectionMethod,
        severity: editingInfestation.severity,
        parasiteLoad: editingInfestation.parasiteLoad,
        latitude: editingInfestation.location.lat,
        longitude: editingInfestation.location.lng,
        address: editingInfestation.location.address,
        sector: editingInfestation.location.sector,
        clinicalSigns: editingInfestation.clinicalSigns.join(', '),
        veterinarian: editingInfestation.veterinarian,
        notes: editingInfestation.notes,
        eggCount: editingInfestation.laboratoryResults?.eggCount,
        testMethod: editingInfestation.laboratoryResults?.testMethod,
        testDate: editingInfestation.laboratoryResults?.testDate.toISOString().split('T')[0],
      });
    } else if (!editingInfestation && isOpen) {
      setFormData({
        animalId: '',
        animalName: '',
        animalTag: '',
        parasiteId: '',
        parasiteName: '',
        detectionDate: new Date().toISOString().split('T')[0],
        detectionMethod: 'clinical',
        severity: 'mild',
        parasiteLoad: 'low',
        latitude: 17.9869,
        longitude: -92.9303,
        address: '',
        sector: '',
        clinicalSigns: '',
        veterinarian: '',
        notes: '',
      });
    }
  }, [editingInfestation, isOpen]);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          const mockAddress = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}, Villahermosa, Tabasco`;
          
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            address: mockAddress
          }));
          setIsGettingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setFormData(prev => ({
            ...prev,
            latitude: 17.9869,
            longitude: -92.9303,
            address: 'Villahermosa, Tabasco, México'
          }));
          setIsGettingLocation(false);
        }
      );
    } else {
      setIsGettingLocation(false);
      alert('Geolocalización no soportada por este navegador');
    }
  };

  const handleSubmit = async () => {
    if (!formData.animalId || !formData.animalName || !formData.animalTag || !formData.parasiteName.trim() || !formData.veterinarian) {
      alert('Por favor, complete todos los campos obligatorios marcados con *');
      return;
    }
    
    if (!formData.parasiteId) {
      formData.parasiteId = `parasite-${Date.now()}`;
    }
    
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving infestation:', error);
      alert('Error al guardar el caso. Por favor, inténtelo de nuevo.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-x-hidden max-w-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        <div className="flex-shrink-0 bg-white px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate pr-4">
            {editingInfestation ? 'Editar Caso de Infestación' : 'Registrar Nuevo Caso'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0" disabled={isLoading}>
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">ID del Animal *</label>
              <input
                type="text"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                value={formData.animalId}
                onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nombre del Animal *</label>
              <input
                type="text"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                value={formData.animalName}
                onChange={(e) => setFormData({ ...formData, animalName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Etiqueta/Tag *</label>
              <input
                type="text"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                value={formData.animalTag}
                onChange={(e) => setFormData({ ...formData, animalTag: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Nombre del Parásito *</label>
              <input
                type="text"
                list="parasite-suggestions"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                value={formData.parasiteName}
                onChange={(e) => {
                  const selectedParasite = parasites.find(p => p.name === e.target.value);
                  setFormData({ 
                    ...formData, 
                    parasiteName: e.target.value,
                    parasiteId: selectedParasite ? selectedParasite.id : ''
                  });
                }}
                placeholder="Escribe o selecciona un parásito"
              />
              <datalist id="parasite-suggestions">
                {PARASITE_SUGGESTIONS.map((parasite, index) => (
                  <option key={index} value={parasite} />
                ))}
                {parasites.map(parasite => (
                  <option key={parasite.id} value={parasite.name} />
                ))}
              </datalist>
              <p className="text-xs text-gray-500">
                Puedes escribir manualmente o seleccionar de las opciones sugeridas
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Fecha de Detección *</label>
              <input
                type="date"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                value={formData.detectionDate}
                onChange={(e) => setFormData({ ...formData, detectionDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Método de Detección *</label>
              <select
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                value={formData.detectionMethod}
                onChange={(e) => setFormData({ ...formData, detectionMethod: e.target.value })}
              >
                <option value="clinical">Clínico</option>
                <option value="laboratory">Laboratorio</option>
                <option value="necropsy">Necropsia</option>
                <option value="field_observation">Observación de Campo</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Severidad *</label>
              <select
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              >
                <option value="mild">Leve</option>
                <option value="moderate">Moderada</option>
                <option value="severe">Severa</option>
                <option value="critical">Crítica</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Carga Parasitaria *</label>
              <select
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                value={formData.parasiteLoad}
                onChange={(e) => setFormData({ ...formData, parasiteLoad: e.target.value })}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="very_high">Muy Alta</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Veterinario *</label>
              <input
                type="text"
                required
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                value={formData.veterinarian}
                onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Sector</label>
              <input
                type="text"
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h3 className="text-base sm:text-lg font-medium text-gray-900">Ubicación de la Infestación</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation || isLoading}
                className="w-full sm:w-auto"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {isGettingLocation ? 'Obteniendo...' : 'Usar Ubicación Actual'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Latitud</label>
                <input
                  type="number"
                  step="0.000001"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Longitud</label>
                <input
                  type="number"
                  step="0.000001"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Dirección</label>
                <input
                  type="text"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Información clínica y de laboratorio */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Signos Clínicos</label>
              <textarea
                rows={3}
                disabled={isLoading}
                placeholder="Separar con comas: anemia, pérdida de peso, diarrea..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none disabled:opacity-50"
                value={formData.clinicalSigns}
                onChange={(e) => setFormData({ ...formData, clinicalSigns: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Conteo de Huevos (HPG)</label>
                <input
                  type="number"
                  min="0"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                  value={formData.eggCount || ''}
                  onChange={(e) => setFormData({ ...formData, eggCount: parseInt(e.target.value) || undefined })}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Método de Prueba</label>
                <input
                  type="text"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                  value={formData.testMethod || ''}
                  onChange={(e) => setFormData({ ...formData, testMethod: e.target.value })}
                />
              </div>

              <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700">Fecha de Prueba</label>
                <input
                  type="date"
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm disabled:opacity-50"
                  value={formData.testDate || ''}
                  onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Notas Adicionales</label>
              <textarea
                rows={3}
                disabled={isLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none disabled:opacity-50"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {editingInfestation ? 'Actualizar Caso' : 'Registrar Caso'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Modal de detalles del caso
const InfestationDetailsModal: React.FC<InfestationDetailsModalProps> = ({ infestation, isOpen, onClose, parasites }) => {
  if (!isOpen || !infestation) return null;

  const parasite = parasites.find(p => p.id === infestation.parasiteId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-x-hidden max-w-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        <div className="flex-shrink-0 bg-white px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Detalles del Caso</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Información del Animal</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Nombre</label>
                  <p className="font-medium break-words">{infestation.animalName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">ID/Tag</label>
                  <p className="font-medium break-words">{infestation.animalTag}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Veterinario</label>
                  <p className="font-medium break-words">{infestation.veterinarian}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Información del Parásito</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Parásito</label>
                  <p className="font-medium break-words">{infestation.parasiteName}</p>
                </div>
                {parasite && (
                  <div>
                    <label className="text-sm text-gray-600">Nombre Científico</label>
                    <p className="font-medium italic break-words">{parasite.scientificName}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-600">Tipo</label>
                  <div className="mt-1">
                    <Badge variant={parasite?.type || 'internal'}>
                      {parasite?.type === 'external' ? 'Externo' : 'Interno'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Detalles del Caso</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Fecha de Detección</label>
                  <p className="font-medium">{infestation.detectionDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Método de Detección</label>
                  <p className="font-medium">
                    {infestation.detectionMethod === 'clinical' ? 'Clínico' :
                     infestation.detectionMethod === 'laboratory' ? 'Laboratorio' :
                     infestation.detectionMethod === 'necropsy' ? 'Necropsia' : 'Observación'}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Severidad</label>
                  <div className="mt-1">
                    <Badge variant={infestation.severity}>
                      {infestation.severity === 'mild' ? 'Leve' :
                       infestation.severity === 'moderate' ? 'Moderada' :
                       infestation.severity === 'severe' ? 'Severa' : 'Crítica'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Estado</label>
                  <div className="mt-1">
                    <Badge variant={infestation.status}>
                      {infestation.status === 'active' ? 'Activo' :
                       infestation.status === 'treating' ? 'Tratando' :
                       infestation.status === 'resolved' ? 'Resuelto' :
                       infestation.status === 'chronic' ? 'Crónico' : 'Reinfección'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Dirección</label>
                  <p className="font-medium break-words">{infestation.location.address}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Sector</label>
                  <p className="font-medium break-words">{infestation.location.sector}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Coordenadas</label>
                  <p className="font-medium break-words">{infestation.location.lat.toFixed(6)}, {infestation.location.lng.toFixed(6)}</p>
                </div>
              </div>
            </div>
          </div>

          {infestation.clinicalSigns.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Signos Clínicos</h3>
              <div className="flex flex-wrap gap-2">
                {infestation.clinicalSigns.map((sign, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm break-words">
                    {sign}
                  </span>
                ))}
              </div>
            </div>
          )}

          {infestation.laboratoryResults && (
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Resultados de Laboratorio</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {infestation.laboratoryResults.eggCount && (
                    <div>
                      <label className="text-sm text-blue-700">Conteo de Huevos</label>
                      <p className="font-medium">{infestation.laboratoryResults.eggCount} HPG</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-blue-700">Método</label>
                    <p className="font-medium break-words">{infestation.laboratoryResults.testMethod}</p>
                  </div>
                  <div>
                    <label className="text-sm text-blue-700">Fecha</label>
                    <p className="font-medium">{infestation.laboratoryResults.testDate.toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {infestation.treatment && (
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Tratamiento</h3>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-green-700">Medicamento</label>
                    <p className="font-medium break-words">{infestation.treatment.medicationName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-green-700">Dosificación</label>
                    <p className="font-medium break-words">{infestation.treatment.dosage}</p>
                  </div>
                  <div>
                    <label className="text-sm text-green-700">Frecuencia</label>
                    <p className="font-medium break-words">{infestation.treatment.frequency}</p>
                  </div>
                  <div>
                    <label className="text-sm text-green-700">Costo</label>
                    <p className="font-medium">${infestation.treatment.cost}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {infestation.notes && (
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Notas</h3>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4 break-words">{infestation.notes}</p>
            </div>
          )}
        </div>

        <div className="flex-shrink-0 px-4 sm:px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </motion.div>
    </div>
  );
};

// Modal de confirmación para eliminar
const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ isOpen, onClose, onConfirm, infestationName, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-x-hidden max-w-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">Eliminar Caso</h3>
              <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6 break-words">
            ¿Estás seguro de que deseas eliminar el caso de <strong>"{infestationName}"</strong>?
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isLoading}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              variant="danger" 
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full sm:w-auto order-1 sm:order-2"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Eliminar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Componente de Mapa de Infestaciones mejorado
const InfestationMap: React.FC<InfestationMapProps> = ({ infestations }) => {
  return (
    <div className="h-64 sm:h-80 lg:h-96 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden w-full">
      {/* Fondo del mapa simulado */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-yellow-100"></div>
      
      {/* Título de ubicación - responsive */}
      <div className="absolute top-2 sm:top-4 left-2 sm:left-4 bg-white rounded-lg px-2 sm:px-3 py-1 sm:py-2 shadow-md max-w-[calc(100%-8rem)] overflow-hidden">
        <div className="flex items-center gap-2">
          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 flex-shrink-0" />
          <span className="text-xs sm:text-sm font-medium truncate">Mapa de Infestaciones - Villahermosa, Tabasco</span>
        </div>
      </div>
      
      {/* Leyenda - responsive */}
      <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white rounded-lg p-2 sm:p-3 shadow-md text-xs max-w-[6rem] sm:max-w-none overflow-hidden">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-600 rounded-full flex-shrink-0"></div>
            <span className="truncate">Crítico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
            <span className="truncate">Severo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full flex-shrink-0"></div>
            <span className="truncate">Moderado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="truncate">Leve</span>
          </div>
        </div>
      </div>
      
      {/* Marcadores dinámicos basados en casos reales */}
      <div className="relative w-full h-full overflow-hidden">
        {infestations.map((infestation, index) => {
          const x = 20 + (index * 15) % 60;
          const y = 25 + (index * 20) % 50;
          
          const getSeverityColor = (severity: string) => {
            switch (severity) {
              case 'critical': return 'bg-red-600';
              case 'severe': return 'bg-orange-500';
              case 'moderate': return 'bg-yellow-500';
              case 'mild': return 'bg-green-500';
              default: return 'bg-gray-500';
            }
          };

          const getSeveritySize = (severity: string) => {
            switch (severity) {
              case 'critical': return 'w-6 h-6 sm:w-8 sm:h-8';
              case 'severe': return 'w-5 h-5 sm:w-7 sm:h-7';
              case 'moderate': return 'w-4 h-4 sm:w-6 sm:h-6';
              case 'mild': return 'w-3 h-3 sm:w-5 sm:h-5';
              default: return 'w-4 h-4 sm:w-6 sm:h-6';
            }
          };

          return (
            <div 
              key={infestation.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`${getSeverityColor(infestation.severity)} ${getSeveritySize(infestation.severity)} rounded-full flex items-center justify-center shadow-lg cursor-pointer`}
                whileHover={{ scale: 1.2 }}
              >
                <Bug className="w-2 h-2 sm:w-3 sm:h-3 text-white" />
              </motion.div>
              <div className="absolute top-8 sm:top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-28 sm:min-w-36 max-w-48 text-xs opacity-0 hover:opacity-100 transition-opacity pointer-events-none z-10 overflow-hidden">
                <p className="font-medium truncate">{infestation.parasiteName}</p>
                <p className="text-gray-600 truncate">{infestation.animalName}</p>
                <p className="text-gray-600 truncate">{infestation.location.sector}</p>
                <p className="text-gray-600 truncate">{infestation.status === 'resolved' ? 'Resuelto' : 'Activo'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente de Alerta Estacional mejorado
const SeasonalAlertCard: React.FC<SeasonalAlertCardProps> = ({ alert }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-3 sm:p-4 rounded-lg border-l-4 w-full overflow-hidden ${
        alert.riskLevel === 'critical' ? 'border-red-500 bg-red-50' :
        alert.riskLevel === 'high' ? 'border-orange-500 bg-orange-50' :
        alert.riskLevel === 'medium' ? 'border-yellow-500 bg-yellow-50' :
        'border-green-500 bg-green-50'
      }`}
    >
      <div className="flex items-start gap-3 w-full">
        <Bug className={`w-4 h-4 sm:w-5 sm:h-5 ${
          alert.riskLevel === 'critical' ? 'text-red-600' :
          alert.riskLevel === 'high' ? 'text-orange-600' :
          alert.riskLevel === 'medium' ? 'text-yellow-600' :
          'text-green-600'
        } flex-shrink-0 mt-0.5`} />
        <div className="flex-1 min-w-0 w-full">
          <h4 className="font-medium text-gray-900 break-words">{alert.parasiteName}</h4>
          <div className="text-sm text-gray-600 mt-1 w-full">
            <p className="break-words">Temporada: {alert.season}</p>
            <p className="break-words">Incremento esperado: +{alert.expectedIncrease}%</p>
            <div className="mt-2 w-full">
              <p className="font-medium">Acciones recomendadas:</p>
              <ul className="list-disc list-inside mt-1 space-y-1 w-full">
                {alert.recommendedActions.map((action, index) => (
                  <li key={index} className="break-words w-full overflow-hidden">{action}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="flex-shrink-0">
          <Badge variant={alert.riskLevel}>
            {alert.riskLevel === 'critical' ? 'Crítico' :
             alert.riskLevel === 'high' ? 'Alto' :
             alert.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
          </Badge>
        </div>
      </div>
    </motion.div>
  );
};

const ParasitePatrol: React.FC = () => {
  // Estados del componente
  const [infestations, setInfestations] = useState<ParasiteInfestation[]>([]);
  const [parasites, setParasites] = useState<Parasite[]>([]);
  const [stats, setStats] = useState<ParasiteStats>({
    totalInfestations: 0,
    activeInfestations: 0,
    resolvedInfestations: 0,
    criticalCases: 0,
    treatmentSuccessRate: 0,
    mostCommonParasite: '',
    seasonalTrend: 'stable',
    averageTreatmentDays: 0,
    totalTreatmentCost: 0,
    affectedAnimals: 0,
    reinfectionRate: 0
  });
  const [seasonalAlerts, setSeasonalAlerts] = useState<SeasonalAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedParasiteType, setSelectedParasiteType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [showNewInfestationModal, setShowNewInfestationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInfestation, setSelectedInfestation] = useState<ParasiteInfestation | null>(null);
  const [editingInfestation, setEditingInfestation] = useState<ParasiteInfestation | null>(null);
  const [infestationToDelete, setInfestationToDelete] = useState<ParasiteInfestation | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Estados de conexión y carga
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Función para probar la conexión
  const testConnection = async () => {
    try {
      setIsLoading(true);
      await apiService.testConnection();
      setIsConnected(true);
      console.log('✅ Conectado al backend exitosamente');
    } catch (error) {
      setIsConnected(false);
      console.error('❌ Error conectando al backend:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos desde el backend
  const loadData = async () => {
    try {
      setIsInitialLoading(true);
      
      // Cargar parásitos
      const parasitesData = await apiService.getParasites();
      setParasites(parasitesData);
      
      // Cargar infestaciones
      const infestationsData = await apiService.getInfestations();
      setInfestations(infestationsData);
      
      // Cargar estadísticas
      const statsData = await apiService.getStats();
      setStats(statsData);
      
      // Cargar alertas estacionales
      const alertsData = await apiService.getSeasonalAlerts();
      setSeasonalAlerts(alertsData);
      
      console.log('✅ Datos cargados desde el backend');
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      // En caso de error, mostrar datos vacíos pero no fallar
    } finally {
      setIsInitialLoading(false);
    }
  };

  // Manejar nuevo caso o edición
  const handleNewInfestation = async (infestationData: NewInfestationForm) => {
    try {
      setIsLoading(true);
      
      if (editingInfestation) {
        // Actualizar infestación existente
        const updatedData = {
          animalId: infestationData.animalId,
          animalName: infestationData.animalName,
          animalTag: infestationData.animalTag,
          parasiteId: infestationData.parasiteId || `parasite-${Date.now()}`,
          parasiteName: infestationData.parasiteName,
          detectionDate: new Date(infestationData.detectionDate),
          detectionMethod: infestationData.detectionMethod as any,
          severity: infestationData.severity as any,
          parasiteLoad: infestationData.parasiteLoad as any,
          location: {
            lat: infestationData.latitude,
            lng: infestationData.longitude,
            address: infestationData.address,
            sector: infestationData.sector
          },
          clinicalSigns: infestationData.clinicalSigns.split(',').map(s => s.trim()).filter(s => s),
          veterinarian: infestationData.veterinarian,
          notes: infestationData.notes,
          laboratoryResults: infestationData.eggCount || infestationData.testMethod ? {
            eggCount: infestationData.eggCount,
            testMethod: infestationData.testMethod || '',
            testDate: infestationData.testDate ? new Date(infestationData.testDate) : new Date()
          } : undefined
        };

        const updatedInfestation = await apiService.updateInfestation(editingInfestation.id, updatedData);
        
        setInfestations(prev => 
          prev.map(inf => inf.id === editingInfestation.id ? updatedInfestation : inf)
        );
        
        console.log('✅ Infestación actualizada:', updatedInfestation.animalName);
        alert(`✅ Caso actualizado: ${updatedInfestation.animalName} - ${updatedInfestation.parasiteName}`);
        
        setEditingInfestation(null);
      } else {
        // Crear nueva infestación
        const newData = {
          animalId: infestationData.animalId,
          animalName: infestationData.animalName,
          animalTag: infestationData.animalTag,
          parasiteId: infestationData.parasiteId || `parasite-${Date.now()}`,
          parasiteName: infestationData.parasiteName,
          detectionDate: new Date(infestationData.detectionDate),
          detectionMethod: infestationData.detectionMethod as any,
          severity: infestationData.severity as any,
          parasiteLoad: infestationData.parasiteLoad as any,
          location: {
            lat: infestationData.latitude,
            lng: infestationData.longitude,
            address: infestationData.address,
            sector: infestationData.sector
          },
          clinicalSigns: infestationData.clinicalSigns.split(',').map(s => s.trim()).filter(s => s),
          veterinarian: infestationData.veterinarian,
          status: 'active' as const,
          notes: infestationData.notes,
          laboratoryResults: infestationData.eggCount || infestationData.testMethod ? {
            eggCount: infestationData.eggCount,
            testMethod: infestationData.testMethod || '',
            testDate: infestationData.testDate ? new Date(infestationData.testDate) : new Date()
          } : undefined
        };

        const newInfestation = await apiService.createInfestation(newData);
        
        setInfestations(prev => [newInfestation, ...prev]);
        
        console.log('✅ Nueva infestación creada:', newInfestation.animalName);
        alert(`✅ Caso registrado: ${newInfestation.animalName} - ${newInfestation.parasiteName}`);
      }
      
      // Recargar estadísticas
      const updatedStats = await apiService.getStats();
      setStats(updatedStats);
      
    } catch (error) {
      console.error('❌ Error guardando infestación:', error);
      alert('❌ Error al guardar el caso. Verifique la conexión con el servidor.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewInfestation = (infestation: ParasiteInfestation) => {
    setSelectedInfestation(infestation);
    setShowDetailsModal(true);
  };

  const handleEditInfestation = (infestation: ParasiteInfestation) => {
    setEditingInfestation(infestation);
    setShowNewInfestationModal(true);
  };

  const handleDeleteInfestation = (infestation: ParasiteInfestation) => {
    setInfestationToDelete(infestation);
    setShowDeleteModal(true);
  };

  const confirmDeleteInfestation = async () => {
    if (!infestationToDelete) return;
    
    try {
      setIsLoading(true);
      
      await apiService.deleteInfestation(infestationToDelete.id);
      
      setInfestations(prev => prev.filter(inf => inf.id !== infestationToDelete.id));
      
      // Recargar estadísticas
      const updatedStats = await apiService.getStats();
      setStats(updatedStats);
      
      console.log('✅ Caso eliminado:', infestationToDelete.animalName);
      alert(`🗑️ Caso eliminado: ${infestationToDelete.animalName} - ${infestationToDelete.parasiteName}`);
      
      setInfestationToDelete(null);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('❌ Error eliminando infestación:', error);
      alert('❌ Error al eliminar el caso. Verifique la conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowNewInfestationModal(false);
    setEditingInfestation(null);
  };

  // Inicializar la aplicación
  useEffect(() => {
    const initializeApp = async () => {
      // Probar conexión
      await testConnection();
      
      // Si está conectado, cargar datos
      if (isConnected) {
        await loadData();
      } else {
        setIsInitialLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  // Recargar datos cuando se establezca la conexión
  useEffect(() => {
    if (isConnected && infestations.length === 0) {
      loadData();
    }
  }, [isConnected]);

  // Filtrar infestaciones
  const filteredInfestations = infestations.filter(infestation => {
    const matchesSearch = 
      infestation.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infestation.parasiteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infestation.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      infestation.veterinarian.toLowerCase().includes(searchTerm.toLowerCase());
    
    const parasite = parasites.find(p => p.id === infestation.parasiteId);
    const matchesType = selectedParasiteType === 'all' || parasite?.type === selectedParasiteType;
    const matchesStatus = selectedStatus === 'all' || infestation.status === selectedStatus;
    const matchesSeverity = selectedSeverity === 'all' || infestation.severity === selectedSeverity;
    
    return matchesSearch && matchesType && matchesStatus && matchesSeverity;
  });

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Control de Parásitos</h2>
          <p className="text-gray-600">Conectando al servidor y cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-2 sm:p-4 lg:p-6 overflow-x-hidden max-w-screen">
      {/* Connection Status */}
      <ConnectionStatus 
        isConnected={isConnected} 
        isLoading={isLoading}
        onRetry={testConnection}
      />

      {/* Header mejorado para móvil */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-md border-b border-orange-200 sticky top-2 sm:top-4 lg:top-0 z-40 rounded-lg mb-4 sm:mb-6 overflow-hidden"
      >
        <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 truncate">Control de Parásitos</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">Monitoreo y tratamiento integral de parasitosis</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <Button 
                size="sm" 
                onClick={() => setShowNewInfestationModal(true)}
                disabled={!isConnected}
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Registrar Caso</span>
              </Button>
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-900"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="w-full max-w-7xl mx-auto overflow-x-hidden">
        {/* Alertas Estacionales */}
        {seasonalAlerts.filter(alert => alert.isActive).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 w-full"
          >
            <Card className="bg-white/90 backdrop-blur-md border-orange-300 shadow-lg w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 truncate">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 flex-shrink-0" />
                  <span className="truncate">Alertas Estacionales</span>
                </CardTitle>
                <CardDescription className="truncate">
                  Riesgos parasitarios según la temporada actual
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {seasonalAlerts.filter(alert => alert.isActive).map(alert => (
                    <SeasonalAlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6 w-full overflow-x-hidden">
          {/* Estadísticas del Control Parasitario */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12 w-full"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 w-full">
              <Card className="bg-white/90 backdrop-blur-md border-blue-300 shadow-lg w-full overflow-hidden">
                <CardContent className="p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bug className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Total</p>
                      <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{stats.totalInfestations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-md border-red-300 shadow-lg w-full overflow-hidden">
                <CardContent className="p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertTriangle className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Activos</p>
                      <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{stats.activeInfestations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-md border-green-300 shadow-lg col-span-2 sm:col-span-1 w-full overflow-hidden">
                <CardContent className="p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-green-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Éxito</p>
                      <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{stats.treatmentSuccessRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-md border-purple-300 shadow-lg w-full overflow-hidden">
                <CardContent className="p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Animales</p>
                      <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{stats.affectedAnimals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-md border-yellow-300 shadow-lg w-full overflow-hidden">
                <CardContent className="p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Activity className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-yellow-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">Reinfección</p>
                      <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">{stats.reinfectionRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Mapa de Infestaciones */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 w-full overflow-hidden"
          >
            <Card className="bg-white/90 backdrop-blur-md border-gray-300 shadow-lg w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 truncate">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 flex-shrink-0" />
                  <span className="truncate">Mapa de Infestaciones Parasitarias</span>
                </CardTitle>
                <CardDescription className="hidden sm:block truncate">
                  Distribución geográfica de casos activos y tratados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InfestationMap infestations={infestations} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Panel de Filtros - Responsive Sidebar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`lg:col-span-4 w-full overflow-hidden ${sidebarOpen ? 'block' : 'hidden lg:block'}`}
          >
            <Card className="bg-white/90 backdrop-blur-md border-gray-300 shadow-lg w-full overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 truncate">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <span className="truncate">Filtros</span>
                </CardTitle>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Búsqueda */}
                <div className="space-y-2 w-full">
                  <label className="block text-sm font-medium text-gray-700">Buscar</label>
                  <div className="relative w-full">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Animal, parásito..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tipo de parásito */}
                <div className="space-y-2 w-full">
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={selectedParasiteType}
                    onChange={(e) => setSelectedParasiteType(e.target.value)}
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="internal">Internos</option>
                    <option value="external">Externos</option>
                  </select>
                </div>

                {/* Estado */}
                <div className="space-y-2 w-full">
                  <label className="block text-sm font-medium text-gray-700">Estado</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="treating">En tratamiento</option>
                    <option value="resolved">Resuelto</option>
                    <option value="chronic">Crónico</option>
                    <option value="reinfection">Reinfección</option>
                  </select>
                </div>

                {/* Severidad */}
                <div className="space-y-2 w-full">
                  <label className="block text-sm font-medium text-gray-700">Severidad</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                  >
                    <option value="all">Todas las severidades</option>
                    <option value="mild">Leve</option>
                    <option value="moderate">Moderada</option>
                    <option value="severe">Severa</option>
                    <option value="critical">Crítica</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Casos de Infestación */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-12 w-full overflow-hidden"
          >
            <Card className="bg-white/90 backdrop-blur-md border-gray-300 shadow-lg w-full overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">Casos de Infestación ({filteredInfestations.length})</span>
                  <button 
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden text-gray-600 hover:text-gray-900 flex-shrink-0"
                  >
                    <Filter className="w-5 h-5" />
                  </button>
                </CardTitle>
                <CardDescription className="hidden sm:block truncate">
                  Lista de casos registrados de infestaciones parasitarias
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredInfestations.length > 0 ? (
                  <div className="space-y-4 w-full overflow-x-hidden">
                    {filteredInfestations.map((infestation) => (
                      <motion.div
                        key={infestation.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200 w-full overflow-hidden"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 w-full">
                          <div className="flex-1 min-w-0 w-full">
                            <div className="flex flex-wrap items-center gap-2 mb-3 w-full">
                              <h4 className="text-base sm:text-lg font-semibold text-gray-900 break-words flex-1 min-w-0">
                                {infestation.animalName} ({infestation.animalTag})
                              </h4>
                              <div className="flex flex-wrap gap-1 flex-shrink-0">
                                <Badge variant={parasites.find(p => p.id === infestation.parasiteId)?.type || 'internal'}>
                                  {parasites.find(p => p.id === infestation.parasiteId)?.type === 'external' ? 'Externo' : 'Interno'}
                                </Badge>
                                <Badge variant={infestation.status}>
                                  {infestation.status === 'active' ? 'Activo' :
                                   infestation.status === 'treating' ? 'Tratando' :
                                   infestation.status === 'resolved' ? 'Resuelto' :
                                   infestation.status === 'chronic' ? 'Crónico' : 'Reinfección'}
                                </Badge>
                                <Badge variant={infestation.severity}>
                                  {infestation.severity === 'mild' ? 'Leve' :
                                   infestation.severity === 'moderate' ? 'Moderada' :
                                   infestation.severity === 'severe' ? 'Severa' : 'Crítica'}
                                </Badge>
                              </div>
                            </div>

                            <p className="text-sm sm:text-base text-gray-800 mb-3 break-words w-full">
                              <strong>Parásito:</strong> {infestation.parasiteName}
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm mb-3 w-full">
                              <div className="min-w-0">
                                <p className="text-gray-600">Detección:</p>
                                <p className="font-medium truncate">{infestation.detectionDate.toLocaleDateString()}</p>
                              </div>
                              <div className="min-w-0">
                                <p className="text-gray-600">Método:</p>
                                <p className="font-medium break-words">
                                  {infestation.detectionMethod === 'clinical' ? 'Clínico' :
                                   infestation.detectionMethod === 'laboratory' ? 'Laboratorio' :
                                   infestation.detectionMethod === 'necropsy' ? 'Necropsia' : 'Observación'}
                                </p>
                              </div>
                              <div className="min-w-0 sm:col-span-2 lg:col-span-1">
                                <p className="text-gray-600">Veterinario:</p>
                                <p className="font-medium break-words">{infestation.veterinarian}</p>
                              </div>
                            </div>

                            {infestation.laboratoryResults && (
                              <div className="bg-blue-50 rounded-lg p-3 mb-3 w-full overflow-hidden">
                                <h5 className="font-medium text-blue-900 mb-2 text-sm">Resultados de Laboratorio</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm w-full">
                                  {infestation.laboratoryResults.eggCount && (
                                    <div className="min-w-0">
                                      <span className="text-blue-700">Conteo de huevos:</span>
                                      <span className="ml-1 font-medium">{infestation.laboratoryResults.eggCount} HPG</span>
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <span className="text-blue-700">Método:</span>
                                    <span className="ml-1 font-medium break-words">{infestation.laboratoryResults.testMethod}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {infestation.treatment && (
                              <div className="bg-green-50 rounded-lg p-3 mb-3 w-full overflow-hidden">
                                <h5 className="font-medium text-green-900 mb-2 text-sm">Tratamiento</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm w-full">
                                  <div className="min-w-0">
                                    <span className="text-green-700">Medicamento:</span>
                                    <span className="ml-1 font-medium break-words">{infestation.treatment.medicationName}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-green-700">Dosificación:</span>
                                    <span className="ml-1 font-medium break-words">{infestation.treatment.dosage}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-green-700">Frecuencia:</span>
                                    <span className="ml-1 font-medium break-words">{infestation.treatment.frequency}</span>
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-green-700">Costo:</span>
                                    <span className="ml-1 font-medium">${infestation.treatment.cost}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {infestation.clinicalSigns.length > 0 && (
                              <div className="mb-3 w-full">
                                <h5 className="font-medium text-gray-900 mb-2 text-sm">Signos Clínicos</h5>
                                <div className="flex flex-wrap gap-1 w-full">
                                  {infestation.clinicalSigns.map((sign, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs break-words">
                                      {sign}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="text-sm text-gray-600 space-y-1 w-full">
                              <p className="break-words"><strong>Ubicación:</strong> {infestation.location.address}</p>
                              {infestation.notes && <p className="break-words"><strong>Notas:</strong> {infestation.notes}</p>}
                              {infestation.followUpDate && (
                                <p className="break-words"><strong>Próximo seguimiento:</strong> {infestation.followUpDate.toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-row lg:flex-col items-center gap-2 flex-shrink-0">
                            <Button variant="outline" size="sm" onClick={() => handleViewInfestation(infestation)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditInfestation(infestation)}
                              disabled={!isConnected}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleDeleteInfestation(infestation)}
                              disabled={!isConnected}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 sm:py-12 w-full">
                    <Bug className="w-8 h-8 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No hay casos registrados</h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 px-4 break-words">
                      {isConnected 
                        ? "No se encontraron casos que coincidan con los filtros seleccionados." 
                        : "Conecte al servidor para ver los casos registrados."
                      }
                    </p>
                    {isConnected && (
                      <Button onClick={() => setShowNewInfestationModal(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Primer Caso
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modales */}
      <NewInfestationModal
        isOpen={showNewInfestationModal}
        onClose={handleCloseModal}
        onSave={handleNewInfestation}
        editingInfestation={editingInfestation}
        parasites={parasites}
        isLoading={isLoading}
      />

      <InfestationDetailsModal
        infestation={selectedInfestation}
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        parasites={parasites}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDeleteInfestation}
        infestationName={infestationToDelete ? `${infestationToDelete.animalName} - ${infestationToDelete.parasiteName}` : ''}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ParasitePatrol;