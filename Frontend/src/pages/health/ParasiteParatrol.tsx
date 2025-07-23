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
  Navigation
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

interface TreatmentProtocol {
  id: string;
  name: string;
  parasiteTypes: string[];
  medications: Array<{
    medicationId: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    duration: string;
    route: string;
  }>;
  schedule: Array<{
    day: number;
    actions: string[];
    observations: string[];
  }>;
  withdrawalPeriod: number;
  contraindications: string[];
  precautions: string[];
  expectedEffectiveness: number;
  cost: number;
  isStandard: boolean;
  createdBy: string;
  lastUpdated: Date;
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

// Componentes reutilizables
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-600 mt-1">
    {children}
  </p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'default' | 'outline' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'default';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}> = ({ children, onClick, variant = 'default', size = 'default', className = '', type = 'button', disabled = false }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500"
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm"
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

const Badge: React.FC<{ children: React.ReactNode; variant: string; className?: string }> = ({ children, variant, className = '' }) => {
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(variant)} ${className}`}>
      {children}
    </span>
  );
};

// Modal para registrar nuevo caso
const NewInfestationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (infestation: NewInfestationForm) => void;
  editingInfestation?: ParasiteInfestation | null;
  parasites: Parasite[];
}> = ({ isOpen, onClose, onSave, editingInfestation, parasites }) => {
  const [formData, setFormData] = useState<NewInfestationForm>({
    animalId: '',
    animalName: '',
    animalTag: '',
    parasiteId: '',
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
          
          // Simular geocoding inverso para obtener dirección
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
          // Usar ubicación por defecto (Villahermosa, Tabasco)
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

  const handleSubmit = () => {
    // Validación básica
    if (!formData.animalId || !formData.animalName || !formData.animalTag || !formData.parasiteId || !formData.veterinarian) {
      alert('Por favor, complete todos los campos obligatorios marcados con *');
      return;
    }
    
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto"
      >
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            {editingInfestation ? 'Editar Caso de Infestación' : 'Registrar Nuevo Caso'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ID del Animal *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.animalId}
                onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Animal *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.animalName}
                onChange={(e) => setFormData({ ...formData, animalName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Etiqueta/Tag *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.animalTag}
                onChange={(e) => setFormData({ ...formData, animalTag: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Parásito *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.parasiteId}
                onChange={(e) => setFormData({ ...formData, parasiteId: e.target.value })}
              >
                <option value="">Seleccionar parásito</option>
                {parasites.map(parasite => (
                  <option key={parasite.id} value={parasite.id}>{parasite.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Detección *</label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.detectionDate}
                onChange={(e) => setFormData({ ...formData, detectionDate: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Método de Detección *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.detectionMethod}
                onChange={(e) => setFormData({ ...formData, detectionMethod: e.target.value })}
              >
                <option value="clinical">Clínico</option>
                <option value="laboratory">Laboratorio</option>
                <option value="necropsy">Necropsia</option>
                <option value="field_observation">Observación de Campo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severidad *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
              >
                <option value="mild">Leve</option>
                <option value="moderate">Moderada</option>
                <option value="severe">Severa</option>
                <option value="critical">Crítica</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Carga Parasitaria *</label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.parasiteLoad}
                onChange={(e) => setFormData({ ...formData, parasiteLoad: e.target.value })}
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="very_high">Muy Alta</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Veterinario *</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.veterinarian}
                onChange={(e) => setFormData({ ...formData, veterinarian: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Ubicación de la Infestación</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
              >
                <Navigation className="w-4 h-4 mr-2" />
                {isGettingLocation ? 'Obteniendo...' : 'Usar Ubicación Actual'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Latitud</label>
                <input
                  type="number"
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Longitud</label>
                <input
                  type="number"
                  step="0.000001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Información clínica y de laboratorio */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Signos Clínicos</label>
              <textarea
                rows={3}
                placeholder="Separar con comas: anemia, pérdida de peso, diarrea..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.clinicalSigns}
                onChange={(e) => setFormData({ ...formData, clinicalSigns: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Conteo de Huevos (HPG)</label>
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.eggCount || ''}
                  onChange={(e) => setFormData({ ...formData, eggCount: parseInt(e.target.value) || undefined })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Método de Prueba</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.testMethod || ''}
                  onChange={(e) => setFormData({ ...formData, testMethod: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha de Prueba</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.testDate || ''}
                  onChange={(e) => setFormData({ ...formData, testDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas Adicionales</label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" />
              {editingInfestation ? 'Actualizar Caso' : 'Registrar Caso'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Modal de detalles del caso
const InfestationDetailsModal: React.FC<{
  infestation: ParasiteInfestation | null;
  isOpen: boolean;
  onClose: () => void;
  parasites: Parasite[];
}> = ({ infestation, isOpen, onClose, parasites }) => {
  if (!isOpen || !infestation) return null;

  const parasite = parasites.find(p => p.id === infestation.parasiteId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto"
      >
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Detalles del Caso</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Animal</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Nombre</label>
                  <p className="font-medium">{infestation.animalName}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">ID/Tag</label>
                  <p className="font-medium">{infestation.animalTag}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Veterinario</label>
                  <p className="font-medium">{infestation.veterinarian}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Parásito</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Parásito</label>
                  <p className="font-medium">{infestation.parasiteName}</p>
                </div>
                {parasite && (
                  <div>
                    <label className="text-sm text-gray-600">Nombre Científico</label>
                    <p className="font-medium italic">{parasite.scientificName}</p>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Detalles del Caso</h3>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">Dirección</label>
                  <p className="font-medium">{infestation.location.address}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Sector</label>
                  <p className="font-medium">{infestation.location.sector}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Coordenadas</label>
                  <p className="font-medium">{infestation.location.lat.toFixed(6)}, {infestation.location.lng.toFixed(6)}</p>
                </div>
              </div>
            </div>
          </div>

          {infestation.clinicalSigns.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Signos Clínicos</h3>
              <div className="flex flex-wrap gap-2">
                {infestation.clinicalSigns.map((sign, idx) => (
                  <span key={idx} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                    {sign}
                  </span>
                ))}
              </div>
            </div>
          )}

          {infestation.laboratoryResults && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resultados de Laboratorio</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {infestation.laboratoryResults.eggCount && (
                    <div>
                      <label className="text-sm text-blue-700">Conteo de Huevos</label>
                      <p className="font-medium">{infestation.laboratoryResults.eggCount} HPG</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-blue-700">Método</label>
                    <p className="font-medium">{infestation.laboratoryResults.testMethod}</p>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tratamiento</h3>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-green-700">Medicamento</label>
                    <p className="font-medium">{infestation.treatment.medicationName}</p>
                  </div>
                  <div>
                    <label className="text-sm text-green-700">Dosificación</label>
                    <p className="font-medium">{infestation.treatment.dosage}</p>
                  </div>
                  <div>
                    <label className="text-sm text-green-700">Frecuencia</label>
                    <p className="font-medium">{infestation.treatment.frequency}</p>
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notas</h3>
              <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{infestation.notes}</p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </div>
      </motion.div>
    </div>
  );
};

// Modal de confirmación para eliminar
const DeleteConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  infestationName: string;
}> = ({ isOpen, onClose, onConfirm, infestationName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Eliminar Caso</h3>
              <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
            </div>
          </div>
          
          <p className="text-gray-700 mb-6">
            ¿Estás seguro de que deseas eliminar el caso de <strong>"{infestationName}"</strong>?
          </p>
          
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Componente de Mapa de Infestaciones actualizado
const InfestationMap: React.FC<{ infestations: ParasiteInfestation[] }> = ({ infestations }) => {
  return (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Fondo del mapa simulado */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-yellow-100"></div>
      
      {/* Título de ubicación */}
      <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium">Mapa de Infestaciones - Villahermosa, Tabasco</span>
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-md text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Crítico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Severo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Moderado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Leve</span>
          </div>
        </div>
      </div>
      
      {/* Marcadores dinámicos basados en casos reales */}
      <div className="relative w-full h-full">
        {infestations.map((infestation, index) => {
          // Convertir coordenadas reales a posición en el mapa (simulado)
          const x = 20 + (index * 15) % 60; // Distribuir horizontalmente
          const y = 25 + (index * 20) % 50; // Distribuir verticalmente
          
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
              case 'critical': return 'w-8 h-8';
              case 'severe': return 'w-7 h-7';
              case 'moderate': return 'w-6 h-6';
              case 'mild': return 'w-5 h-5';
              default: return 'w-6 h-6';
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
                <Bug className="w-3 h-3 text-white" />
              </motion.div>
              <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-36 text-xs opacity-0 hover:opacity-100 transition-opacity">
                <p className="font-medium">{infestation.parasiteName}</p>
                <p className="text-gray-600">{infestation.animalName}</p>
                <p className="text-gray-600">{infestation.location.sector}</p>
                <p className="text-gray-600">{infestation.status === 'resolved' ? 'Resuelto' : 'Activo'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente de Alerta Estacional
const SeasonalAlertCard: React.FC<{ alert: SeasonalAlert }> = ({ alert }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-lg border-l-4 ${
        alert.riskLevel === 'critical' ? 'border-red-500 bg-red-50' :
        alert.riskLevel === 'high' ? 'border-orange-500 bg-orange-50' :
        alert.riskLevel === 'medium' ? 'border-yellow-500 bg-yellow-50' :
        'border-green-500 bg-green-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <Bug className={`w-5 h-5 ${
          alert.riskLevel === 'critical' ? 'text-red-600' :
          alert.riskLevel === 'high' ? 'text-orange-600' :
          alert.riskLevel === 'medium' ? 'text-yellow-600' :
          'text-green-600'
        } flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{alert.parasiteName}</h4>
          <div className="text-sm text-gray-600 mt-1">
            <p>Temporada: {alert.season}</p>
            <p>Incremento esperado: +{alert.expectedIncrease}%</p>
            <div className="mt-2">
              <p className="font-medium">Acciones recomendadas:</p>
              <ul className="list-disc list-inside mt-1">
                {alert.recommendedActions.map((action, index) => (
                  <li key={index}>{action}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <Badge variant={alert.riskLevel}>
          {alert.riskLevel === 'critical' ? 'Crítico' :
           alert.riskLevel === 'high' ? 'Alto' :
           alert.riskLevel === 'medium' ? 'Medio' : 'Bajo'}
        </Badge>
      </div>
    </motion.div>
  );
};

const ParasitePatrol: React.FC = () => {
  // Estados del componente
  const [infestations, setInfestations] = useState<ParasiteInfestation[]>([]);
  const [parasites, setParasites] = useState<Parasite[]>([]);
  const [] = useState<TreatmentProtocol[]>([]);
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
  const [] = useState<'infestations' | 'protocols' | 'parasites'>('infestations');
  const [showNewInfestationModal, setShowNewInfestationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInfestation, setSelectedInfestation] = useState<ParasiteInfestation | null>(null);
  const [editingInfestation, setEditingInfestation] = useState<ParasiteInfestation | null>(null);
  const [infestationToDelete, setInfestationToDelete] = useState<ParasiteInfestation | null>(null);

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

  // Manejar nuevo caso o edición
  const handleNewInfestation = (infestationData: NewInfestationForm) => {
    if (editingInfestation) {
      // Actualizar caso existente
      const updatedInfestation: ParasiteInfestation = {
        ...editingInfestation,
        animalId: infestationData.animalId,
        animalName: infestationData.animalName,
        animalTag: infestationData.animalTag,
        parasiteId: infestationData.parasiteId,
        parasiteName: parasites.find(p => p.id === infestationData.parasiteId)?.name || '',
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

      setInfestations(prev => prev.map(inf => inf.id === editingInfestation.id ? updatedInfestation : inf));
      setEditingInfestation(null);
    } else {
      // Crear nuevo caso
      const newInfestation: ParasiteInfestation = {
        id: generateId(),
        animalId: infestationData.animalId,
        animalName: infestationData.animalName,
        animalTag: infestationData.animalTag,
        parasiteId: infestationData.parasiteId,
        parasiteName: parasites.find(p => p.id === infestationData.parasiteId)?.name || '',
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
        status: 'active',
        notes: infestationData.notes,
        laboratoryResults: infestationData.eggCount || infestationData.testMethod ? {
          eggCount: infestationData.eggCount,
          testMethod: infestationData.testMethod || '',
          testDate: infestationData.testDate ? new Date(infestationData.testDate) : new Date()
        } : undefined
      };

      setInfestations(prev => {
        const newList = [newInfestation, ...prev];
        
        // Actualizar estadísticas dinámicamente
        const totalInfestations = newList.length;
        const activeInfestations = newList.filter(i => i.status === 'active' || i.status === 'treating').length;
        const criticalCases = newList.filter(i => i.severity === 'critical').length;
        
        // Encontrar el parásito más común
        const parasiteCounts = newList.reduce((acc, infestation) => {
          acc[infestation.parasiteName] = (acc[infestation.parasiteName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostCommonParasite = Object.keys(parasiteCounts).length > 0 
          ? Object.entries(parasiteCounts).sort(([,a], [,b]) => b - a)[0][0]
          : 'Ninguno';
        
        setStats(prev => ({
          ...prev,
          totalInfestations,
          activeInfestations,
          criticalCases,
          affectedAnimals: totalInfestations,
          mostCommonParasite,
          treatmentSuccessRate: totalInfestations > 0 ? 85.0 : 0
        }));
        
        return newList;
      });
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

  const confirmDeleteInfestation = () => {
    if (infestationToDelete) {
      setInfestations(prev => {
        const newList = prev.filter(inf => inf.id !== infestationToDelete.id);
        
        // Actualizar estadísticas dinámicamente
        const totalInfestations = newList.length;
        const activeInfestations = newList.filter(i => i.status === 'active' || i.status === 'treating').length;
        const criticalCases = newList.filter(i => i.severity === 'critical').length;
        
        // Encontrar el parásito más común
        const parasiteCounts = newList.reduce((acc, infestation) => {
          acc[infestation.parasiteName] = (acc[infestation.parasiteName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        const mostCommonParasite = Object.keys(parasiteCounts).length > 0 
          ? Object.entries(parasiteCounts).sort(([,a], [,b]) => b - a)[0][0]
          : 'Ninguno';
        
        setStats(prev => ({
          ...prev,
          totalInfestations,
          activeInfestations,
          criticalCases,
          affectedAnimals: totalInfestations,
          mostCommonParasite,
          treatmentSuccessRate: totalInfestations > 0 ? 85.0 : 0
        }));
        
        return newList;
      });

      console.log('Caso eliminado:', infestationToDelete.animalName);
      alert(`🗑️ Caso eliminado: ${infestationToDelete.animalName} - ${infestationToDelete.parasiteName}`);
      setInfestationToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleCloseModal = () => {
    setShowNewInfestationModal(false);
    setEditingInfestation(null);
  };

  // Simulación de datos
  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo para parásitos (siempre se cargan para el selector)
      const mockParasites: Parasite[] = [
        {
          id: '1',
          name: 'Garrapata del Ganado',
          scientificName: 'Rhipicephalus microplus',
          type: 'external',
          category: 'tick',
          description: 'Ectoparásito hematófago que afecta principalmente al ganado bovino',
          symptoms: ['Anemia', 'Pérdida de peso', 'Irritación de piel', 'Transmisión de enfermedades'],
          affectedOrgans: ['Piel', 'Sistema circulatorio'],
          transmissionMode: 'Contacto directo y ambiental',
          lifecycle: '21-63 días dependiendo de condiciones ambientales',
          seasonality: ['Primavera', 'Verano', 'Otoño'],
          riskLevel: 'high',
          prevalence: 75,
          economicImpact: 'high',
          zoonoticRisk: false
        },
        {
          id: '2',
          name: 'Lombriz Intestinal',
          scientificName: 'Haemonchus contortus',
          type: 'internal',
          category: 'nematode',
          description: 'Nematodo gastrointestinal hematófago que causa anemia severa',
          symptoms: ['Anemia severa', 'Diarrea', 'Pérdida de peso', 'Edema submandibular'],
          affectedOrgans: ['Abomaso', 'Sistema digestivo'],
          transmissionMode: 'Ingestión de larvas infectivas',
          lifecycle: '18-21 días',
          seasonality: ['Verano', 'Otoño'],
          riskLevel: 'critical',
          prevalence: 60,
          economicImpact: 'high',
          zoonoticRisk: false
        },
        {
          id: '3',
          name: 'Mosca del Cuerno',
          scientificName: 'Haematobia irritans',
          type: 'external',
          category: 'fly',
          description: 'Díptero hematófago que causa estrés y pérdida de peso',
          symptoms: ['Irritación', 'Pérdida de peso', 'Reducción en producción de leche'],
          affectedOrgans: ['Piel'],
          transmissionMode: 'Vuelo directo',
          lifecycle: '10-20 días',
          seasonality: ['Primavera', 'Verano'],
          riskLevel: 'medium',
          prevalence: 45,
          economicImpact: 'medium',
          zoonoticRisk: false
        }
      ];

      // Inicializar con casos de ejemplo (comentado para empezar sin casos)
      const mockInfestations: ParasiteInfestation[] = [
        // {
        //   id: '1',
        //   animalId: 'COW001',
        //   animalName: 'Bessie',
        //   animalTag: 'TAG-001',
        //   parasiteId: '1',
        //   parasiteName: 'Garrapata del Ganado',
        //   detectionDate: new Date('2025-07-08'),
        //   detectionMethod: 'clinical',
        //   severity: 'moderate',
        //   parasiteLoad: 'medium',
        //   location: {
        //     lat: 17.9869,
        //     lng: -92.9303,
        //     address: 'Pastizal Norte, Sector A, Villahermosa, Tabasco',
        //     sector: 'A'
        //   },
        //   clinicalSigns: ['Presencia visible de garrapatas', 'Irritación de piel', 'Rascado excesivo'],
        //   veterinarian: 'Dr. García',
        //   treatment: {
        //     medicationId: 'MED001',
        //     medicationName: 'Fipronil Pour-On',
        //     startDate: new Date('2025-07-08'),
        //     endDate: new Date('2025-07-15'),
        //     dosage: '1ml/10kg',
        //     frequency: 'Aplicación única',
        //     route: 'Tópica',
        //     cost: 45.50
        //   },
        //   status: 'treating',
        //   followUpDate: new Date('2025-07-22'),
        //   notes: 'Aplicación tópica realizada. Monitorear efectividad en 14 días.'
        // }
      ];

      // Estadísticas iniciales (empezar en 0)
      const initialStats: ParasiteStats = {
        totalInfestations: mockInfestations.length,
        activeInfestations: mockInfestations.filter(i => i.status === 'active' || i.status === 'treating').length,
        resolvedInfestations: mockInfestations.filter(i => i.status === 'resolved').length,
        criticalCases: mockInfestations.filter(i => i.severity === 'critical').length,
        treatmentSuccessRate: mockInfestations.length > 0 ? 89.5 : 0,
        mostCommonParasite: 'Ninguno',
        seasonalTrend: 'stable',
        averageTreatmentDays: 0,
        totalTreatmentCost: 0,
        affectedAnimals: mockInfestations.length,
        reinfectionRate: 0
      };

      // Alertas estacionales (siempre activas)
      const mockAlerts: SeasonalAlert[] = [
        {
          id: '1',
          parasiteName: 'Garrapata del Ganado',
          season: 'Verano',
          riskLevel: 'high',
          expectedIncrease: 35,
          recommendedActions: [
            'Intensificar inspecciones semanales',
            'Aplicar tratamientos preventivos',
            'Mejorar manejo de pastizales'
          ],
          isActive: true
        },
        {
          id: '2',
          parasiteName: 'Mosca del Cuerno',
          season: 'Temporada de lluvias',
          riskLevel: 'medium',
          expectedIncrease: 25,
          recommendedActions: [
            'Usar orejeras repelentes',
            'Aplicar insecticidas tópicos',
            'Controlar charcos de agua'
          ],
          isActive: true
        }
      ];

      setParasites(mockParasites);
      setInfestations(mockInfestations);
      setStats(initialStats);
      setSeasonalAlerts(mockAlerts);
    };

    loadData();
  }, []);

  // Filtrar infestaciones con funcionalidad corregida
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Control de Parásitos</h1>
              <p className="text-gray-600 mt-1">Monitoreo y tratamiento integral de parasitosis</p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={() => setShowNewInfestationModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Registrar Caso
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas Estacionales */}
        {seasonalAlerts.filter(alert => alert.isActive).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-white/80 backdrop-blur-md border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  Alertas Estacionales
                </CardTitle>
                <CardDescription>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Estadísticas del Control Parasitario */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card className="bg-white/80 backdrop-blur-md border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Bug className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Infestaciones</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalInfestations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Casos Activos</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeInfestations}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.treatmentSuccessRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Animales Afectados</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.affectedAnimals}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Reinfección</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.reinfectionRate}%</p>
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
            className="lg:col-span-8"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Mapa de Infestaciones Parasitarias
                </CardTitle>
                <CardDescription>
                  Distribución geográfica de casos activos y tratados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InfestationMap infestations={infestations} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Panel de Filtros */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Filtros */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Animal, parásito, veterinario..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tipo de parásito */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedParasiteType}
                    onChange={(e) => setSelectedParasiteType(e.target.value)}
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="internal">Internos</option>
                    <option value="external">Externos</option>
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Severidad</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="lg:col-span-12"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle>
                  Casos de Infestación ({filteredInfestations.length})
                </CardTitle>
                <CardDescription>
                  Lista de casos registrados de infestaciones parasitarias
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredInfestations.length > 0 ? (
                  <div className="space-y-4">
                    {filteredInfestations.map((infestation) => (
                      <motion.div
                        key={infestation.id}
                        whileHover={{ scale: 1.01 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {infestation.animalName} ({infestation.animalTag})
                              </h4>
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

                            <p className="text-lg text-gray-800 mb-3">
                              <strong>Parásito:</strong> {infestation.parasiteName}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                              <div>
                                <p className="text-gray-600">Detección:</p>
                                <p className="font-medium">{infestation.detectionDate.toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-gray-600">Método:</p>
                                <p className="font-medium">
                                  {infestation.detectionMethod === 'clinical' ? 'Clínico' :
                                   infestation.detectionMethod === 'laboratory' ? 'Laboratorio' :
                                   infestation.detectionMethod === 'necropsy' ? 'Necropsia' : 'Observación'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">Veterinario:</p>
                                <p className="font-medium">{infestation.veterinarian}</p>
                              </div>
                            </div>

                            {infestation.laboratoryResults && (
                              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                                <h5 className="font-medium text-blue-900 mb-2">Resultados de Laboratorio</h5>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  {infestation.laboratoryResults.eggCount && (
                                    <div>
                                      <span className="text-blue-700">Conteo de huevos:</span>
                                      <span className="ml-1 font-medium">{infestation.laboratoryResults.eggCount} HPG</span>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-blue-700">Método:</span>
                                    <span className="ml-1 font-medium">{infestation.laboratoryResults.testMethod}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {infestation.treatment && (
                              <div className="bg-green-50 rounded-lg p-3 mb-3">
                                <h5 className="font-medium text-green-900 mb-2">Tratamiento</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                  <div>
                                    <span className="text-green-700">Medicamento:</span>
                                    <span className="ml-1 font-medium">{infestation.treatment.medicationName}</span>
                                  </div>
                                  <div>
                                    <span className="text-green-700">Dosificación:</span>
                                    <span className="ml-1 font-medium">{infestation.treatment.dosage}</span>
                                  </div>
                                  <div>
                                    <span className="text-green-700">Frecuencia:</span>
                                    <span className="ml-1 font-medium">{infestation.treatment.frequency}</span>
                                  </div>
                                  <div>
                                    <span className="text-green-700">Costo:</span>
                                    <span className="ml-1 font-medium">${infestation.treatment.cost}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {infestation.clinicalSigns.length > 0 && (
                              <div className="mb-3">
                                <h5 className="font-medium text-gray-900 mb-2">Signos Clínicos</h5>
                                <div className="flex flex-wrap gap-1">
                                  {infestation.clinicalSigns.map((sign, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                      {sign}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            <div className="text-sm text-gray-600">
                              <p><strong>Ubicación:</strong> {infestation.location.address}</p>
                              {infestation.notes && <p><strong>Notas:</strong> {infestation.notes}</p>}
                              {infestation.followUpDate && (
                                <p><strong>Próximo seguimiento:</strong> {infestation.followUpDate.toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button variant="outline" size="sm" onClick={() => handleViewInfestation(infestation)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleEditInfestation(infestation)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="danger" size="sm" onClick={() => handleDeleteInfestation(infestation)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Bug className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay casos registrados</h3>
                    <p className="text-gray-600 mb-4">
                      No se encontraron casos que coincidan con los filtros seleccionados.
                    </p>
                    <Button onClick={() => setShowNewInfestationModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Registrar Primer Caso
                    </Button>
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
      />
    </div>
  );
};

export default ParasitePatrol;
