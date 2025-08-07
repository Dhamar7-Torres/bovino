// CowManagement.tsx
// Página para gestión integral de vacas y tabla de enmadre (CRUD completo) con backend
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  MapPin,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Clock,
  Scale,
  UserCheck,
  Baby,
  Flower2,
  Milk,
  X,
  Save,
  AlertCircle,
  Wifi,
  WifiOff,
} from "lucide-react";

// ===================================================================
// CONFIGURACIÓN DE API
// ===================================================================

const API_BASE_URL = 'http://localhost:5000/api';

// Servicio para comunicación con el backend
class ApiService {
  private static baseUrl = API_BASE_URL;

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  }

  // ===== BOVINOS =====
  static async getBovines(): Promise<{ success: boolean; data: Cow[] }> {
    const response = await fetch(`${this.baseUrl}/bovines`);
    return this.handleResponse(response);
  }

  static async getBovine(id: string): Promise<{ success: boolean; data: Cow }> {
    const response = await fetch(`${this.baseUrl}/bovines/${id}`);
    return this.handleResponse(response);
  }

  static async createBovine(data: Partial<Cow>): Promise<{ success: boolean; data: Cow }> {
    const response = await fetch(`${this.baseUrl}/bovines`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async updateBovine(id: string, data: Partial<Cow>): Promise<{ success: boolean; data: Cow }> {
    const response = await fetch(`${this.baseUrl}/bovines/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async deleteBovine(id: string): Promise<{ success: boolean }> {
    const response = await fetch(`${this.baseUrl}/bovines/${id}`, {
      method: 'DELETE',
    });
    return this.handleResponse(response);
  }

  // ===== ESTADO DEL SISTEMA =====
  static async checkHealth(): Promise<{ success: boolean; data: any }> {
    const response = await fetch(`${this.baseUrl}/health`);
    return this.handleResponse(response);
  }

  static async ping(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${this.baseUrl}/ping`);
    return this.handleResponse(response);
  }
}

// ===================================================================
// INTERFACES (manteniendo las originales)
// ===================================================================

interface Cow {
  id: string;
  name: string;
  earTag: string;
  registrationNumber?: string;
  breed: string;
  birthDate: string;
  weight: number;
  height?: number;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
    paddock: string;
    facility: string;
  };
  healthStatus: "excellent" | "good" | "fair" | "poor" | "sick";
  reproductiveStatus: "maiden" | "pregnant" | "lactating" | "dry" | "open" | "retired";
  genetics: {
    sireId?: string;
    sireName?: string;
    damId?: string;
    damName?: string;
    genealogy: string[];
  };
  reproductiveHistory: {
    totalPregnancies: number;
    liveCalves: number;
    lastCalvingDate?: string;
    lastBreedingDate?: string;
    estrus: {
      lastCycle: string;
      cycleLength: number;
      irregular: boolean;
    };
    conception: {
      attempts: number;
      averageAttempts: number;
      conceptionRate: number;
    };
  };
  lactation: {
    isLactating: boolean;
    lactationNumber: number;
    startDate?: string;
    peakMilk?: number;
    currentMilk?: number;
    totalMilk?: number;
    dryOffDate?: string;
  };
  health: {
    lastCheckupDate: string;
    veterinarian: string;
    bodyConditionScore: number;
    vaccinations: {
      date: string;
      vaccine: string;
      batch: string;
      nextDue: string;
    }[];
    treatments: {
      date: string;
      condition: string;
      treatment: string;
      veterinarian: string;
    }[];
  };
  nutrition: {
    diet: string;
    dailyFeed: number;
    supplements: string[];
    lastWeightDate: string;
  };
  acquisition: {
    date: string;
    source: string;
    cost: number;
    purpose: "breeding" | "milk_production" | "replacement";
  };
  currentPregnancy?: {
    bullId: string;
    bullName: string;
    breedingDate: string;
    confirmationDate: string;
    expectedCalvingDate: string;
    gestationDay: number;
  };
  notes: string;
  photos: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CowFilters {
  searchTerm: string;
  breed: string[];
  healthStatus: string[];
  reproductiveStatus: string[];
  ageRange: { min: number; max: number };
  weightRange: { min: number; max: number };
  lactationStatus: string[];
  location: string[];
  activeOnly: boolean;
}

// ===================================================================
// COMPONENTES AUXILIARES
// ===================================================================

const AnimatedText: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <motion.span
    className={className}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {children}
  </motion.span>
);

// Variantes de animación
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

// ===================================================================
// COMPONENTE MODAL REUTILIZABLE
// ===================================================================

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}> = ({ isOpen, onClose, title, children, size = 'lg' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-7xl',
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#519a7c] to-[#4e9c75]">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// ===================================================================
// COMPONENTE DE ESTADO DE CONEXIÓN
// ===================================================================

const ConnectionStatus: React.FC<{ 
  isOnline: boolean; 
  isConnecting: boolean; 
  lastUpdate: Date | null 
}> = ({ isOnline, isConnecting, lastUpdate }) => (
  <div className="flex items-center space-x-2 text-sm">
    {isConnecting ? (
      <>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Wifi className="w-4 h-4 text-yellow-500" />
        </motion.div>
        <span className="text-yellow-600">Conectando...</span>
      </>
    ) : isOnline ? (
      <>
        <Wifi className="w-4 h-4 text-green-500" />
        <span className="text-green-600">Conectado</span>
        {lastUpdate && (
          <span className="text-gray-500">
            (act. {lastUpdate.toLocaleTimeString('es-MX')})
          </span>
        )}
      </>
    ) : (
      <>
        <WifiOff className="w-4 h-4 text-red-500" />
        <span className="text-red-600">Sin conexión</span>
      </>
    )}
  </div>
);

// ===================================================================
// COMPONENTE DE DETALLES DE VACA
// ===================================================================

const CowDetailsModal: React.FC<{
  cow: Cow;
  isOpen: boolean;
  onClose: () => void;
}> = ({ cow, isOpen, onClose }) => {
  const age = new Date().getFullYear() - new Date(cow.birthDate).getFullYear();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles de ${cow.name}`} size="xl">
      <div className="space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Flower2 className="w-5 h-5 mr-2 text-pink-600" />
              Información General
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">{cow.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Arete:</span>
                <span className="font-medium">{cow.earTag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Registro:</span>
                <span className="font-medium">{cow.registrationNumber || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Raza:</span>
                <span className="font-medium">{cow.breed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Edad:</span>
                <span className="font-medium">{age} años</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peso:</span>
                <span className="font-medium">{cow.weight} kg</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Ubicación Actual
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Potrero:</span>
                <span className="font-medium">{cow.currentLocation.paddock}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Instalación:</span>
                <span className="font-medium">{cow.currentLocation.facility}</span>
              </div>
              <div>
                <span className="text-gray-600">Dirección:</span>
                <p className="font-medium mt-1">{cow.currentLocation.address}</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Más información si es necesaria */}
        {cow.notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
            <p className="text-gray-700">{cow.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

// ===================================================================
// FORMULARIO DE VACAS CON API - CORREGIDO
// ===================================================================

const CowFormModal: React.FC<{
  cow?: Cow;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cowData: Partial<Cow>) => void;
}> = ({ cow, isOpen, onClose, onSave }) => {
  const isEditing = !!cow;
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Cow>>({
    name: cow?.name || '',
    earTag: cow?.earTag || '',
    registrationNumber: cow?.registrationNumber || '',
    breed: cow?.breed || '',
    birthDate: cow?.birthDate || '',
    weight: cow?.weight || 0,
    height: cow?.height || 0,
    healthStatus: cow?.healthStatus || 'good',
    reproductiveStatus: cow?.reproductiveStatus || 'maiden',
    notes: cow?.notes || '',
    active: cow?.active ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Función de validación que faltaba
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.earTag?.trim()) {
      newErrors.earTag = 'El número de arete es requerido';
    }

    if (!formData.breed) {
      newErrors.breed = 'La raza es requerida';
    }

    if (!formData.birthDate) {
      newErrors.birthDate = 'La fecha de nacimiento es requerida';
    }

    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = 'El peso debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error guardando vaca:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? `Editar ${cow?.name}` : 'Nueva Vaca'} 
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campos del formulario */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nombre de la vaca"
              disabled={isSubmitting}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Arete *
            </label>
            <input
              type="text"
              value={formData.earTag || ''}
              onChange={(e) => handleInputChange('earTag', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                errors.earTag ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ej: VL001"
              disabled={isSubmitting}
            />
            {errors.earTag && <p className="text-red-500 text-xs mt-1">{errors.earTag}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Registro
            </label>
            <input
              type="text"
              value={formData.registrationNumber || ''}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              placeholder="Ej: REG-V-2024-001"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Raza *
            </label>
            <select
              value={formData.breed || ''}
              onChange={(e) => handleInputChange('breed', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                errors.breed ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Seleccionar raza</option>
              <option value="Holstein">Holstein</option>
              <option value="Jersey">Jersey</option>
              <option value="Brown Swiss">Brown Swiss</option>
              <option value="Angus">Angus</option>
              <option value="Brahman">Brahman</option>
              <option value="Charolais">Charolais</option>
              <option value="Simmental">Simmental</option>
              <option value="Criollo">Criollo</option>
            </select>
            {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento *
            </label>
            <input
              type="date"
              value={formData.birthDate || ''}
              onChange={(e) => handleInputChange('birthDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                errors.birthDate ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            />
            {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Peso (kg) *
            </label>
            <input
              type="number"
              value={formData.weight || ''}
              onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                errors.weight ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Peso en kilogramos"
              min="0"
              step="0.1"
              disabled={isSubmitting}
            />
            {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Altura (cm)
            </label>
            <input
              type="number"
              value={formData.height || ''}
              onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              placeholder="Altura en centímetros"
              min="0"
              step="0.1"
              disabled={isSubmitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado de Salud
            </label>
            <select
              value={formData.healthStatus || 'good'}
              onChange={(e) => handleInputChange('healthStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="excellent">Excelente</option>
              <option value="good">Buena</option>
              <option value="fair">Regular</option>
              <option value="poor">Mala</option>
              <option value="sick">Enferma</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado Reproductivo
            </label>
            <select
              value={formData.reproductiveStatus || 'maiden'}
              onChange={(e) => handleInputChange('reproductiveStatus', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              disabled={isSubmitting}
            >
              <option value="maiden">Vaquilla</option>
              <option value="pregnant">Gestante</option>
              <option value="lactating">Lactando</option>
              <option value="dry">Seca</option>
              <option value="open">Vacía</option>
              <option value="retired">Retirada</option>
            </select>
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
            placeholder="Observaciones, comentarios especiales..."
            disabled={isSubmitting}
          />
        </div>

        {/* Estado activo */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={formData.active ?? true}
            onChange={(e) => handleInputChange('active', e.target.checked)}
            className="h-4 w-4 text-[#519a7c] focus:ring-[#519a7c] border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
            Vaca activa
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#519a7c] text-white hover:bg-[#4a8970] rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                />
                <span>Guardando...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Actualizar' : 'Guardar'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const CowManagement: React.FC = () => {
  // Estados principales
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [cows, setCows] = useState<Cow[]>([]);
  const [filteredCows, setFilteredCows] = useState<Cow[]>([]);
  
  // Estados de UI
  const [showCowForm, setShowCowForm] = useState(false);
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Estados de filtros (mantener originales)
  const [cowFilters, setCowFilters] = useState<CowFilters>({
    searchTerm: "",
    breed: [],
    healthStatus: [],
    reproductiveStatus: [],
    ageRange: { min: 0, max: 20 },
    weightRange: { min: 0, max: 800 },
    lactationStatus: [],
    location: [],
    activeOnly: false,
  });

  // ===================================================================
  // EFECTOS Y FUNCIONES DE API
  // ===================================================================

  // Verificar conexión al backend
  const checkConnection = async () => {
    try {
      setIsConnecting(true);
      await ApiService.ping();
      setIsOnline(true);
      setError(null);
      setLastUpdate(new Date());
    } catch (error) {
      setIsOnline(false);
      setError(`Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Cargar datos del backend
  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Cargar vacas
      const cowsResponse = await ApiService.getBovines();
      if (cowsResponse.success) {
        setCows(cowsResponse.data);
      }

      setLastUpdate(new Date());
      setIsOnline(true);
    } catch (error) {
      setError(`Error cargando datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto inicial
  useEffect(() => {
    const initializeApp = async () => {
      await checkConnection();
      await loadData();
    };

    initializeApp();

    // Verificar conexión cada 30 segundos
    const connectionInterval = setInterval(checkConnection, 30000);

    return () => clearInterval(connectionInterval);
  }, []);

  // Efectos para filtros (mantener originales)
  useEffect(() => {
    applyCowFilters();
  }, [cows, cowFilters]);

  // Función para aplicar filtros de vacas (mantener original)
  const applyCowFilters = () => {
    let filtered = [...cows];

    if (cowFilters.searchTerm) {
      const searchLower = cowFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        cow =>
          cow.name.toLowerCase().includes(searchLower) ||
          cow.earTag.toLowerCase().includes(searchLower) ||
          cow.breed.toLowerCase().includes(searchLower) ||
          cow.registrationNumber?.toLowerCase().includes(searchLower)
      );
    }

    if (cowFilters.activeOnly) {
      filtered = filtered.filter(cow => cow.active);
    }

    setFilteredCows(filtered);
  };

  // Funciones CRUD con backend
  const handleSaveCow = async (cowData: Partial<Cow>) => {
    try {
      if (editingCow) {
        const response = await ApiService.updateBovine(editingCow.id, cowData);
        if (response.success) {
          setCows(prev => prev.map(cow => 
            cow.id === editingCow.id ? response.data : cow
          ));
          setEditingCow(null);
        }
      } else {
        const response = await ApiService.createBovine(cowData);
        if (response.success) {
          setCows(prev => [...prev, response.data]);
        }
      }
      setShowCowForm(false);
      setLastUpdate(new Date());
    } catch (error) {
      setError(`Error guardando vaca: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error;
    }
  };

  const handleDeleteCow = async (cow: Cow) => {
    if (!window.confirm(`¿Estás seguro de eliminar a "${cow.name}"?`)) return;

    try {
      const response = await ApiService.deleteBovine(cow.id);
      if (response.success) {
        setCows(prev => prev.filter(c => c.id !== cow.id));
        setLastUpdate(new Date());
      }
    } catch (error) {
      setError(`Error eliminando vaca: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Calcular estadísticas (mantener original)
  const cowStatistics = useMemo(() => {
    const totalCows = cows.length;
    const activeCows = cows.filter(cow => cow.active).length;
    const pregnantCows = cows.filter(cow => cow.reproductiveStatus === "pregnant").length;
    const lactatingCows = cows.filter(cow => cow.lactation.isLactating).length;
    const avgWeight = cows.length > 0 ? Math.round(cows.reduce((sum, cow) => sum + cow.weight, 0) / cows.length) : 0;

    return {
      total: totalCows,
      active: activeCows,
      pregnant: pregnantCows,
      lactating: lactatingCows,
      avgWeight,
    };
  }, [cows]);

  // Componente de tarjeta de estadística (mantener original)
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, icon, color = "" }) => (
    <motion.div
      variants={itemVariants}
      className={`bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </motion.div>
  );

  // Componente de tarjeta de vaca (simplificado)
  const CowCard: React.FC<{ cow: Cow }> = ({ cow }) => {
    const age = new Date().getFullYear() - new Date(cow.birthDate).getFullYear();
    
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
              <Flower2 className="w-5 h-5 text-pink-600" />
              <span>{cow.name}</span>
            </h3>
            <p className="text-sm text-gray-600">Arete: {cow.earTag}</p>
            <p className="text-sm text-gray-600">Raza: {cow.breed}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              cow.healthStatus === 'excellent' ? 'bg-green-100 text-green-800' :
              cow.healthStatus === 'good' ? 'bg-blue-100 text-blue-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {cow.healthStatus === 'excellent' ? 'Excelente' :
               cow.healthStatus === 'good' ? 'Buena' : 'Regular'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <span className="text-gray-500">Edad:</span>
            <span className="font-medium ml-2">{age} años</span>
          </div>
          <div>
            <span className="text-gray-500">Peso:</span>
            <span className="font-medium ml-2">{cow.weight} kg</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedCow(cow)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingCow(cow)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDeleteCow(cow)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">{cow.currentLocation?.facility || 'N/A'}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Pantalla de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              className="w-12 h-12 border-4 border-[#519a7c] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600 font-medium">Conectando con el servidor...</p>
            <ConnectionStatus 
              isOnline={isOnline} 
              isConnecting={isConnecting} 
              lastUpdate={lastUpdate} 
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20"
          variants={itemVariants}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-xl flex items-center justify-center">
                <Flower2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <AnimatedText>Gestión de Vacas (Backend)</AnimatedText>
                </h1>
                <p className="text-gray-600 mt-1">
                  Conectado al servidor en puerto 5000
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <ConnectionStatus 
                isOnline={isOnline} 
                isConnecting={isConnecting} 
                lastUpdate={lastUpdate} 
              />
              <button
                onClick={loadData}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
                disabled={isLoading}
              >
                <Clock className="w-4 h-4" />
                <span>Actualizar</span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
            variants={itemVariants}
          >
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <h3 className="text-red-800 font-medium">Error de Conexión</h3>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto p-1 hover:bg-red-100 rounded"
              >
                <X className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </motion.div>
        )}

        {/* Estadísticas */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
          <StatCard
            title="Total Vacas"
            value={cowStatistics.total}
            icon={<Flower2 className="w-8 h-8" />}
            color="hover:bg-pink-50"
          />
          <StatCard
            title="Activas"
            value={cowStatistics.active}
            icon={<UserCheck className="w-8 h-8" />}
            color="hover:bg-green-50"
          />
          <StatCard
            title="Gestantes"
            value={cowStatistics.pregnant}
            icon={<Baby className="w-8 h-8" />}
            color="hover:bg-purple-50"
          />
          <StatCard
            title="Lactando"
            value={cowStatistics.lactating}
            icon={<Milk className="w-8 h-8" />}
            color="hover:bg-blue-50"
          />
          <StatCard
            title="Peso Prom."
            value={`${cowStatistics.avgWeight} kg`}
            icon={<Scale className="w-8 h-8" />}
            color="hover:bg-yellow-50"
          />
        </motion.div>

        {/* Controles */}
        <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre, arete, raza..."
                value={cowFilters.searchTerm}
                onChange={(e) =>
                  setCowFilters(prev => ({ ...prev, searchTerm: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCowForm(true)}
                className="inline-flex items-center px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] transition-colors disabled:opacity-50"
                disabled={!isOnline}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva Vaca
              </button>
            </div>
          </div>
        </motion.div>

        {/* Grid de vacas */}
        <motion.div variants={itemVariants}>
          {!isOnline ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-12 text-center shadow-lg border border-white/20">
              <WifiOff className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sin conexión al servidor
              </h3>
              <p className="text-gray-600 mb-6">
                No se puede conectar con el backend. Verifique que el servidor esté ejecutándose en el puerto 5000.
              </p>
              <button
                onClick={loadData}
                className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
              >
                <Wifi className="w-5 h-5 mr-2" />
                Intentar conexión
              </button>
            </div>
          ) : filteredCows.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-12 text-center shadow-lg border border-white/20">
              <Flower2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron vacas
              </h3>
              <p className="text-gray-600 mb-6">
                {cowFilters.searchTerm 
                  ? "No hay vacas que coincidan con la búsqueda."
                  : "Aún no hay vacas registradas en el sistema."
                }
              </p>
              {!cowFilters.searchTerm && (
                <button
                  onClick={() => setShowCowForm(true)}
                  className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Registrar primera vaca
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCows.map((cow) => (
                <CowCard key={cow.id} cow={cow} />
              ))}
            </div>
          )}
        </motion.div>

        {/* Modales */}
        {selectedCow && (
          <CowDetailsModal
            cow={selectedCow}
            isOpen={!!selectedCow}
            onClose={() => setSelectedCow(null)}
          />
        )}

        {(showCowForm || editingCow) && (
          <CowFormModal
            cow={editingCow || undefined}
            isOpen={showCowForm || !!editingCow}
            onClose={() => {
              setShowCowForm(false);
              setEditingCow(null);
            }}
            onSave={handleSaveCow}
          />
        )}
      </motion.div>
    </div>
  );
};

export default CowManagement;