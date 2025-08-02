// CowManagement.tsx
// Página para gestión integral de vacas y tabla de enmadre (CRUD completo)
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Calendar,
  MapPin,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Clock,
  CheckCircle,
  Heart,
  Scale,
  Shield,
  Crown,
  UserCheck,
  Activity,
  Baby,
  Syringe,
  Bell,
  Flower2,
  Milk,
  Droplets,
  Stethoscope,
  Weight,
  Star,
  X,
  Save,
  AlertCircle,
  CircleDollarSign,
} from "lucide-react";

// Interfaces para gestión de vacas
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
      cycleLength: number; // days
      irregular: boolean;
    };
    conception: {
      attempts: number;
      averageAttempts: number;
      conceptionRate: number; // percentage
    };
  };
  lactation: {
    isLactating: boolean;
    lactationNumber: number;
    startDate?: string;
    peakMilk?: number; // liters per day
    currentMilk?: number; // liters per day
    totalMilk?: number; // liters total
    dryOffDate?: string;
  };
  health: {
    lastCheckupDate: string;
    veterinarian: string;
    bodyConditionScore: number; // 1-5 scale
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
    dailyFeed: number; // kg
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

// Interface para registros de enmadre (maternidad)
interface MotherhoodRecord {
  id: string;
  cowId: string;
  cowName: string;
  cowEarTag: string;
  bullId?: string;
  bullName?: string;
  breedingDate: string;
  breedingType: "natural" | "artificial" | "embryo_transfer";
  pregnancyConfirmDate: string;
  gestationPeriod: number; // days
  calvingDate: string;
  calvingTime: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    paddock: string;
  };
  assistedBy: {
    id: string;
    name: string;
    role: string;
  };
  calvingType: "natural" | "assisted" | "cesarean" | "emergency";
  complications: string[];
  calf: {
    id: string;
    name: string;
    earTag: string;
    gender: "male" | "female";
    birthWeight: number;
    healthStatus: "excellent" | "good" | "fair" | "poor" | "critical";
    alive: boolean;
  };
  placentaExpelled: boolean;
  placentaExpelledTime?: string;
  colostrum: {
    received: boolean;
    quality: "excellent" | "good" | "fair" | "poor";
    timeReceived?: string;
  };
  postCalvingCare: {
    vitamins: boolean;
    antibiotics: boolean;
    monitoring: string[];
  };
  lactationStart: {
    date: string;
    initialMilk: number; // liters
  };
  economicImpact: {
    calvingCost: number;
    veterinaryCost: number;
    expectedValue: number;
  };
  notes: string;
  success: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interfaces para filtros
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

interface MotherhoodFilters {
  searchTerm: string;
  dateRange: { start: string; end: string };
  calvingType: string[];
  calfGender: string[];
  calfHealth: string[];
  cowId: string;
  location: string;
  assistedBy: string;
}

// Componente AnimatedText para animaciones de texto
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

// Componente Modal reutilizable
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
          {/* Header del modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-[#519a7c] to-[#4e9c75]">
            <h2 className="text-xl font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Contenido del modal */}
          <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente para ver detalles de vaca
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
              <div className="flex justify-between">
                <span className="text-gray-600">Altura:</span>
                <span className="font-medium">{cow.height || 'N/A'} cm</span>
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

        {/* Estado de salud y reproductivo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-green-600" />
              Estado de Salud
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Estado general:</span>
                <span className={`font-medium px-2 py-1 rounded text-xs ${
                  cow.healthStatus === 'excellent' ? 'bg-green-100 text-green-800' :
                  cow.healthStatus === 'good' ? 'bg-blue-100 text-blue-800' :
                  cow.healthStatus === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                  cow.healthStatus === 'poor' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {cow.healthStatus === 'excellent' ? 'Excelente' :
                   cow.healthStatus === 'good' ? 'Buena' :
                   cow.healthStatus === 'fair' ? 'Regular' :
                   cow.healthStatus === 'poor' ? 'Mala' : 'Enferma'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Última revisión:</span>
                <span className="font-medium">{new Date(cow.health.lastCheckupDate).toLocaleDateString('es-MX')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Veterinario:</span>
                <span className="font-medium">{cow.health.veterinarian}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Condición corporal:</span>
                <span className="font-medium">{cow.health.bodyConditionScore}/5</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-red-600" />
              Estado Reproductivo
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium px-2 py-1 rounded text-xs ${
                  cow.reproductiveStatus === 'maiden' ? 'bg-purple-100 text-purple-800' :
                  cow.reproductiveStatus === 'pregnant' ? 'bg-pink-100 text-pink-800' :
                  cow.reproductiveStatus === 'lactating' ? 'bg-blue-100 text-blue-800' :
                  cow.reproductiveStatus === 'dry' ? 'bg-yellow-100 text-yellow-800' :
                  cow.reproductiveStatus === 'open' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {cow.reproductiveStatus === 'maiden' ? 'Vaquilla' :
                   cow.reproductiveStatus === 'pregnant' ? 'Gestante' :
                   cow.reproductiveStatus === 'lactating' ? 'Lactando' :
                   cow.reproductiveStatus === 'dry' ? 'Seca' :
                   cow.reproductiveStatus === 'open' ? 'Vacía' : 'Retirada'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total partos:</span>
                <span className="font-medium">{cow.reproductiveHistory.totalPregnancies}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Crías vivas:</span>
                <span className="font-medium">{cow.reproductiveHistory.liveCalves}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tasa concepción:</span>
                <span className="font-medium">{cow.reproductiveHistory.conception.conceptionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información específica según estado */}
        {cow.reproductiveStatus === 'lactating' && cow.lactation.isLactating && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Milk className="w-5 h-5 mr-2 text-blue-600" />
              Información de Lactancia
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Lactancia #:</span>
                <p className="font-medium">{cow.lactation.lactationNumber}</p>
              </div>
              <div>
                <span className="text-gray-600">Producción actual:</span>
                <p className="font-medium">{cow.lactation.currentMilk}L/día</p>
              </div>
              <div>
                <span className="text-gray-600">Pico de lactancia:</span>
                <p className="font-medium">{cow.lactation.peakMilk}L/día</p>
              </div>
              <div>
                <span className="text-gray-600">Total acumulado:</span>
                <p className="font-medium">{cow.lactation.totalMilk}L</p>
              </div>
            </div>
          </div>
        )}

        {cow.reproductiveStatus === 'pregnant' && cow.currentPregnancy && (
          <div className="bg-pink-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Baby className="w-5 h-5 mr-2 text-pink-600" />
              Información de Gestación
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Toro:</span>
                <p className="font-medium">{cow.currentPregnancy.bullName}</p>
              </div>
              <div>
                <span className="text-gray-600">Día de gestación:</span>
                <p className="font-medium">{cow.currentPregnancy.gestationDay}</p>
              </div>
              <div>
                <span className="text-gray-600">Fecha de monta:</span>
                <p className="font-medium">{new Date(cow.currentPregnancy.breedingDate).toLocaleDateString('es-MX')}</p>
              </div>
              <div>
                <span className="text-gray-600">Parto esperado:</span>
                <p className="font-medium">{new Date(cow.currentPregnancy.expectedCalvingDate).toLocaleDateString('es-MX')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notas */}
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

// Componente para formulario de vaca
const CowFormModal: React.FC<{
  cow?: Cow;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cowData: Partial<Cow>) => void;
}> = ({ cow, isOpen, onClose, onSave }) => {
  const isEditing = !!cow;
  
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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (!formData.earTag?.trim()) {
      newErrors.earTag = 'El número de arete es requerido';
    }
    if (!formData.breed?.trim()) {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      earTag: '',
      registrationNumber: '',
      breed: '',
      birthDate: '',
      weight: 0,
      height: 0,
      healthStatus: 'good',
      reproductiveStatus: 'maiden',
      notes: '',
      active: true,
    });
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    if (!isEditing) resetForm();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose} 
      title={isEditing ? `Editar ${cow?.name}` : 'Nueva Vaca'} 
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información básica */}
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
          />
          <label htmlFor="active" className="ml-2 block text-sm text-gray-900">
            Vaca activa
          </label>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-[#519a7c] text-white hover:bg-[#4a8970] rounded-lg transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Actualizar' : 'Guardar'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Componente para ver detalles de enmadre
const MotherhoodDetailsModal: React.FC<{
  record: MotherhoodRecord;
  isOpen: boolean;
  onClose: () => void;
}> = ({ record, isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Parto de ${record.cowName}`} size="xl">
      <div className="space-y-6">
        {/* Información del parto */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Flower2 className="w-5 h-5 mr-2 text-pink-600" />
              Información de la Vaca
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">{record.cowName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Arete:</span>
                <span className="font-medium">{record.cowEarTag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Toro:</span>
                <span className="font-medium">{record.bullName || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo reproducción:</span>
                <span className="font-medium">
                  {record.breedingType === 'natural' ? 'Natural' :
                   record.breedingType === 'artificial' ? 'Artificial' : 'Transferencia embrionaria'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Baby className="w-5 h-5 mr-2 text-blue-600" />
              Información de la Cría
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">{record.calf.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Arete:</span>
                <span className="font-medium">{record.calf.earTag}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Género:</span>
                <span className={`font-medium px-2 py-1 rounded text-xs ${
                  record.calf.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                }`}>
                  {record.calf.gender === 'male' ? '♂ Macho' : '♀ Hembra'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Peso nacimiento:</span>
                <span className="font-medium">{record.calf.birthWeight} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado salud:</span>
                <span className={`font-medium px-2 py-1 rounded text-xs ${
                  record.calf.healthStatus === 'excellent' ? 'bg-green-100 text-green-800' :
                  record.calf.healthStatus === 'good' ? 'bg-blue-100 text-blue-800' :
                  record.calf.healthStatus === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                  record.calf.healthStatus === 'poor' ? 'bg-orange-100 text-orange-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {record.calf.healthStatus === 'excellent' ? 'Excelente' :
                   record.calf.healthStatus === 'good' ? 'Buena' :
                   record.calf.healthStatus === 'fair' ? 'Regular' :
                   record.calf.healthStatus === 'poor' ? 'Mala' : 'Crítica'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium px-2 py-1 rounded text-xs ${
                  record.calf.alive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {record.calf.alive ? 'Vivo' : 'Muerto'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalles del parto */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-green-600" />
            Detalles del Parto
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Fecha:</span>
              <p className="font-medium">{new Date(record.calvingDate).toLocaleDateString('es-MX')}</p>
            </div>
            <div>
              <span className="text-gray-600">Hora:</span>
              <p className="font-medium">{record.calvingTime}</p>
            </div>
            <div>
              <span className="text-gray-600">Tipo parto:</span>
              <p className="font-medium">
                {record.calvingType === 'natural' ? 'Natural' :
                 record.calvingType === 'assisted' ? 'Asistido' :
                 record.calvingType === 'cesarean' ? 'Cesárea' : 'Emergencia'}
              </p>
            </div>
            <div>
              <span className="text-gray-600">Gestación:</span>
              <p className="font-medium">{record.gestationPeriod} días</p>
            </div>
            <div>
              <span className="text-gray-600">Asistido por:</span>
              <p className="font-medium">{record.assistedBy.name}</p>
            </div>
            <div>
              <span className="text-gray-600">Ubicación:</span>
              <p className="font-medium">{record.location.paddock}</p>
            </div>
            <div>
              <span className="text-gray-600">Placenta expulsada:</span>
              <p className="font-medium">{record.placentaExpelled ? 'Sí' : 'No'}</p>
            </div>
            {record.placentaExpelledTime && (
              <div>
                <span className="text-gray-600">Hora expulsión:</span>
                <p className="font-medium">{record.placentaExpelledTime}</p>
              </div>
            )}
          </div>
        </div>

        {/* Información de calostro */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Milk className="w-5 h-5 mr-2 text-blue-600" />
            Información de Calostro
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Recibido:</span>
              <p className="font-medium">{record.colostrum.received ? 'Sí' : 'No'}</p>
            </div>
            <div>
              <span className="text-gray-600">Calidad:</span>
              <p className="font-medium">
                {record.colostrum.quality === 'excellent' ? 'Excelente' :
                 record.colostrum.quality === 'good' ? 'Buena' :
                 record.colostrum.quality === 'fair' ? 'Regular' : 'Mala'}
              </p>
            </div>
            {record.colostrum.timeReceived && (
              <div>
                <span className="text-gray-600">Hora recepción:</span>
                <p className="font-medium">{record.colostrum.timeReceived}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cuidados post-parto */}
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Stethoscope className="w-5 h-5 mr-2 text-green-600" />
            Cuidados Post-Parto
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Vitaminas:</span>
              <p className="font-medium">{record.postCalvingCare.vitamins ? 'Sí' : 'No'}</p>
            </div>
            <div>
              <span className="text-gray-600">Antibióticos:</span>
              <p className="font-medium">{record.postCalvingCare.antibiotics ? 'Sí' : 'No'}</p>
            </div>
            <div>
              <span className="text-gray-600">Monitoreo:</span>
              <p className="font-medium">{record.postCalvingCare.monitoring.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Impacto económico */}
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <CircleDollarSign className="w-5 h-5 mr-2 text-yellow-600" />
            Impacto Económico
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Costo parto:</span>
              <p className="font-medium">${record.economicImpact.calvingCost.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-600">Costo veterinario:</span>
              <p className="font-medium">${record.economicImpact.veterinaryCost.toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-600">Valor esperado:</span>
              <p className="font-medium">${record.economicImpact.expectedValue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Complicaciones */}
        {record.complications.length > 0 && (
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
              Complicaciones
            </h3>
            <ul className="list-disc list-inside text-sm text-gray-700">
              {record.complications.map((complication, index) => (
                <li key={index}>{complication}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Notas */}
        {record.notes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
            <p className="text-gray-700">{record.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Componente Modal de Confirmación
const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Eliminar", 
  cancelText = "Cancelar" 
}) => {
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-md"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            </div>
          </div>
          
          {/* Contenido */}
          <div className="p-6">
            <p className="text-gray-600">{message}</p>
          </div>

          {/* Botones */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{confirmText}</span>
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
const MotherhoodFormModal: React.FC<{
  record?: MotherhoodRecord;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<MotherhoodRecord>) => void;
}> = ({ record, isOpen, onClose, onSave }) => {
  const isEditing = !!record;
  
  const [formData, setFormData] = useState({
    cowName: record?.cowName || '',
    cowEarTag: record?.cowEarTag || '',
    calvingDate: record?.calvingDate || '',
    calvingTime: record?.calvingTime || '',
    calvingType: record?.calvingType || 'natural',
    calfName: record?.calf?.name || '',
    calfEarTag: record?.calf?.earTag || '',
    calfGender: record?.calf?.gender || 'male',
    calfBirthWeight: record?.calf?.birthWeight || 0,
    notes: record?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? `Editar Parto de ${record?.cowName}` : 'Nuevo Registro de Parto'} 
      size="lg"
    >
      <div onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Vaca *
            </label>
            <input
              type="text"
              value={formData.cowName}
              onChange={(e) => setFormData(prev => ({ ...prev, cowName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              placeholder="Nombre de la vaca"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arete de la Vaca *
            </label>
            <input
              type="text"
              value={formData.cowEarTag}
              onChange={(e) => setFormData(prev => ({ ...prev, cowEarTag: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              placeholder="Ej: VL001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Parto *
            </label>
            <input
              type="date"
              value={formData.calvingDate}
              onChange={(e) => setFormData(prev => ({ ...prev, calvingDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Parto *
            </label>
            <input
              type="time"
              value={formData.calvingTime}
              onChange={(e) => setFormData(prev => ({ ...prev, calvingTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Parto
            </label>
            <select
              value={formData.calvingType}
              onChange={(e) => setFormData(prev => ({ ...prev, calvingType: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
            >
              <option value="natural">Natural</option>
              <option value="assisted">Asistido</option>
              <option value="cesarean">Cesárea</option>
              <option value="emergency">Emergencia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de la Cría *
            </label>
            <input
              type="text"
              value={formData.calfName}
              onChange={(e) => setFormData(prev => ({ ...prev, calfName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              placeholder="Nombre de la cría"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Arete de la Cría *
            </label>
            <input
              type="text"
              value={formData.calfEarTag}
              onChange={(e) => setFormData(prev => ({ ...prev, calfEarTag: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              placeholder="Ej: BE001"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Género de la Cría
            </label>
            <select
              value={formData.calfGender}
              onChange={(e) => setFormData(prev => ({ ...prev, calfGender: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
            >
              <option value="male">Macho</option>
              <option value="female">Hembra</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Peso al Nacer (kg) *
            </label>
            <input
              type="number"
              value={formData.calfBirthWeight}
              onChange={(e) => setFormData(prev => ({ ...prev, calfBirthWeight: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              placeholder="Peso en kilogramos"
              min="0"
              step="0.1"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
            placeholder="Observaciones sobre el parto..."
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => handleSubmit({} as any)}
            className="px-4 py-2 bg-[#519a7c] text-white hover:bg-[#4a8970] rounded-lg transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isEditing ? 'Actualizar' : 'Guardar'}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
const CowManagement: React.FC = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState<"cows" | "motherhood">("cows");
  const [isLoading, setIsLoading] = useState(true);
  const [cows, setCows] = useState<Cow[]>([]);
  const [motherhoodRecords, setMotherhoodRecords] = useState<MotherhoodRecord[]>([]);
  const [filteredCows, setFilteredCows] = useState<Cow[]>([]);
  const [filteredMotherhoodRecords, setFilteredMotherhoodRecords] = useState<MotherhoodRecord[]>([]);
  
  // Estados de UI
  const [showCowForm, setShowCowForm] = useState(false);
  const [showMotherhoodForm, setShowMotherhoodForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCow, setSelectedCow] = useState<Cow | null>(null);
  const [selectedMotherhood, setSelectedMotherhood] = useState<MotherhoodRecord | null>(null);
  const [editingCow, setEditingCow] = useState<Cow | null>(null);
  const [editingMotherhood, setEditingMotherhood] = useState<MotherhoodRecord | null>(null);
  
  // Estados para modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmMessage, setConfirmMessage] = useState('');
  
  // Estados de filtros
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
  
  const [motherhoodFilters, setMotherhoodFilters] = useState<MotherhoodFilters>({
    searchTerm: "",
    dateRange: { start: "", end: "" },
    calvingType: [],
    calfGender: [],
    calfHealth: [],
    cowId: "",
    location: "",
    assistedBy: "",
  });

  // Datos mock para desarrollo
  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setCows([
        {
          id: "1",
          name: "Vaca Luna",
          earTag: "VL001",
          registrationNumber: "REG-V-2024-001",
          breed: "Holstein",
          birthDate: "2020-05-15",
          weight: 580,
          height: 135,
          currentLocation: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Potrero Norte, Villahermosa, Tabasco",
            paddock: "Potrero A1",
            facility: "Área de Ordeño"
          },
          healthStatus: "excellent",
          reproductiveStatus: "lactating",
          genetics: {
            sireId: "SIRE001",
            sireName: "Holstein Premium",
            damId: "DAM001",
            damName: "Madre Luna",
            genealogy: ["Holstein Premium", "Línea Láctea", "Genética Superior"]
          },
          reproductiveHistory: {
            totalPregnancies: 4,
            liveCalves: 4,
            lastCalvingDate: "2024-03-15",
            lastBreedingDate: "2023-06-20",
            estrus: {
              lastCycle: "2024-07-10",
              cycleLength: 21,
              irregular: false
            },
            conception: {
              attempts: 1,
              averageAttempts: 1.2,
              conceptionRate: 95
            }
          },
          lactation: {
            isLactating: true,
            lactationNumber: 4,
            startDate: "2024-03-18",
            peakMilk: 32,
            currentMilk: 28,
            totalMilk: 3200,
            dryOffDate: "2024-12-15"
          },
          health: {
            lastCheckupDate: "2024-07-10",
            veterinarian: "Dra. María González",
            bodyConditionScore: 3.5,
            vaccinations: [
              {
                date: "2024-06-01",
                vaccine: "IBR-BVD",
                batch: "IBR-2024-06",
                nextDue: "2025-06-01"
              }
            ],
            treatments: []
          },
          nutrition: {
            diet: "Concentrado lácteo + alfalfa",
            dailyFeed: 18,
            supplements: ["Calcio", "Vitamina D", "Minerales"],
            lastWeightDate: "2024-07-10"
          },
          acquisition: {
            date: "2020-05-15",
            source: "Ganadería Los Alpes",
            cost: 25000,
            purpose: "milk_production"
          },
          notes: "Excelente vaca lechera con alta producción",
          photos: [],
          active: true,
          createdAt: "2024-01-15",
          updatedAt: "2024-07-15"
        },
        {
          id: "2",
          name: "Vaca Estrella",
          earTag: "VE002",
          registrationNumber: "REG-V-2024-002",
          breed: "Jersey",
          birthDate: "2021-02-10",
          weight: 450,
          height: 125,
          currentLocation: {
            lat: 17.9950,
            lng: -92.9400,
            address: "Potrero Sur, Villahermosa, Tabasco",
            paddock: "Potrero B2",
            facility: "Área de Reproducción"
          },
          healthStatus: "good",
          reproductiveStatus: "pregnant",
          genetics: {
            sireId: "SIRE002",
            sireName: "Jersey Elite",
            damId: "DAM002",
            damName: "Madre Estrella",
            genealogy: ["Jersey Elite", "Línea Premium", "Genética de Calidad"]
          },
          reproductiveHistory: {
            totalPregnancies: 2,
            liveCalves: 2,
            lastCalvingDate: "2023-08-20",
            lastBreedingDate: "2024-05-15",
            estrus: {
              lastCycle: "2024-05-12",
              cycleLength: 20,
              irregular: false
            },
            conception: {
              attempts: 2,
              averageAttempts: 1.5,
              conceptionRate: 85
            }
          },
          lactation: {
            isLactating: false,
            lactationNumber: 2,
            dryOffDate: "2024-02-15"
          },
          health: {
            lastCheckupDate: "2024-07-05",
            veterinarian: "Dr. Luis Hernández",
            bodyConditionScore: 3.8,
            vaccinations: [
              {
                date: "2024-05-20",
                vaccine: "Brucelosis",
                batch: "BR-2024-05",
                nextDue: "2025-05-20"
              }
            ],
            treatments: []
          },
          nutrition: {
            diet: "Pasto natural + suplemento gestacional",
            dailyFeed: 15,
            supplements: ["Ácido Fólico", "Hierro", "Vitaminas"],
            lastWeightDate: "2024-07-05"
          },
          acquisition: {
            date: "2021-02-10",
            source: "Rancho San José",
            cost: 22000,
            purpose: "breeding"
          },
          currentPregnancy: {
            bullId: "2",
            bullName: "Toro Dorado",
            breedingDate: "2024-05-15",
            confirmationDate: "2024-06-15",
            expectedCalvingDate: "2025-02-15",
            gestationDay: 185
          },
          notes: "Vaca gestante con buen desarrollo fetal",
          photos: [],
          active: true,
          createdAt: "2024-01-10",
          updatedAt: "2024-07-10"
        },
        {
          id: "3",
          name: "Vaca Princesa",
          earTag: "VP003",
          registrationNumber: "REG-V-2024-003",
          breed: "Brown Swiss",
          birthDate: "2019-11-05",
          weight: 620,
          height: 140,
          currentLocation: {
            lat: 17.9800,
            lng: -92.9350,
            address: "Potrero Este, Villahermosa, Tabasco",
            paddock: "Potrero C1",
            facility: "Área de Descanso"
          },
          healthStatus: "good",
          reproductiveStatus: "dry",
          genetics: {
            sireId: "SIRE003",
            sireName: "Brown Elite",
            damId: "DAM003",
            damName: "Madre Princesa",
            genealogy: ["Brown Elite", "Línea Europea", "Genética Tradicional"]
          },
          reproductiveHistory: {
            totalPregnancies: 5,
            liveCalves: 5,
            lastCalvingDate: "2023-12-10",
            lastBreedingDate: "2024-06-01",
            estrus: {
              lastCycle: "2024-06-28",
              cycleLength: 22,
              irregular: false
            },
            conception: {
              attempts: 1,
              averageAttempts: 1.1,
              conceptionRate: 92
            }
          },
          lactation: {
            isLactating: false,
            lactationNumber: 5,
            dryOffDate: "2024-05-15"
          },
          health: {
            lastCheckupDate: "2024-07-01",
            veterinarian: "Dra. Ana Rodríguez",
            bodyConditionScore: 4.0,
            vaccinations: [
              {
                date: "2024-04-15",
                vaccine: "Clostridial",
                batch: "CL-2024-04",
                nextDue: "2025-04-15"
              }
            ],
            treatments: []
          },
          nutrition: {
            diet: "Pasto mejorado + concentrado",
            dailyFeed: 16,
            supplements: ["Minerales", "Vitamina E"],
            lastWeightDate: "2024-07-01"
          },
          acquisition: {
            date: "2019-11-05",
            source: "Ganadería El Progreso",
            cost: 28000,
            purpose: "breeding"
          },
          notes: "Vaca madura con excelente historial reproductivo",
          photos: [],
          active: true,
          createdAt: "2024-01-05",
          updatedAt: "2024-07-05"
        }
      ]);

      setMotherhoodRecords([
        {
          id: "1",
          cowId: "1",
          cowName: "Vaca Luna",
          cowEarTag: "VL001",
          bullId: "1",
          bullName: "Toro Campeón",
          breedingDate: "2023-06-20",
          breedingType: "natural",
          pregnancyConfirmDate: "2023-07-20",
          gestationPeriod: 278,
          calvingDate: "2024-03-15",
          calvingTime: "06:30",
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Potrero Norte, Villahermosa, Tabasco",
            paddock: "Potrero A1"
          },
          assistedBy: {
            id: "VET001",
            name: "Dr. Carlos Mendoza",
            role: "Veterinario"
          },
          calvingType: "natural",
          complications: [],
          calf: {
            id: "CALF001",
            name: "Becerro Estrella",
            earTag: "BE001",
            gender: "male",
            birthWeight: 35,
            healthStatus: "excellent",
            alive: true
          },
          placentaExpelled: true,
          placentaExpelledTime: "07:45",
          colostrum: {
            received: true,
            quality: "excellent",
            timeReceived: "07:00"
          },
          postCalvingCare: {
            vitamins: true,
            antibiotics: false,
            monitoring: ["Peso diario", "Salud general", "Alimentación"]
          },
          lactationStart: {
            date: "2024-03-18",
            initialMilk: 18
          },
          economicImpact: {
            calvingCost: 1500,
            veterinaryCost: 800,
            expectedValue: 15000
          },
          notes: "Parto exitoso sin complicaciones",
          success: true,
          createdAt: "2024-03-15",
          updatedAt: "2024-03-18"
        },
        {
          id: "2",
          cowId: "3",
          cowName: "Vaca Princesa",
          cowEarTag: "VP003",
          bullId: "2",
          bullName: "Toro Dorado",
          breedingDate: "2023-03-15",
          breedingType: "artificial",
          pregnancyConfirmDate: "2023-04-15",
          gestationPeriod: 280,
          calvingDate: "2023-12-10",
          calvingTime: "14:20",
          location: {
            lat: 17.9800,
            lng: -92.9350,
            address: "Potrero Este, Villahermosa, Tabasco",
            paddock: "Potrero C1"
          },
          assistedBy: {
            id: "VET002",
            name: "Dra. Ana Rodríguez",
            role: "Veterinaria"
          },
          calvingType: "assisted",
          complications: ["Presentación posterior"],
          calf: {
            id: "CALF002",
            name: "Becerra Dorada",
            earTag: "BD002",
            gender: "female",
            birthWeight: 32,
            healthStatus: "good",
            alive: true
          },
          placentaExpelled: true,
          placentaExpelledTime: "16:30",
          colostrum: {
            received: true,
            quality: "good",
            timeReceived: "15:00"
          },
          postCalvingCare: {
            vitamins: true,
            antibiotics: true,
            monitoring: ["Recuperación post-parto", "Control antibiótico", "Seguimiento cría"]
          },
          lactationStart: {
            date: "2023-12-13",
            initialMilk: 15
          },
          economicImpact: {
            calvingCost: 2200,
            veterinaryCost: 1200,
            expectedValue: 18000
          },
          notes: "Parto asistido exitoso, requirió antibióticos profilácticos",
          success: true,
          createdAt: "2023-12-10",
          updatedAt: "2023-12-15"
        }
      ]);

      setIsLoading(false);
    }, 1500);
  }, []);

  // Efectos para filtros
  useEffect(() => {
    applyCowFilters();
  }, [cows, cowFilters]);

  useEffect(() => {
    applyMotherhoodFilters();
  }, [motherhoodRecords, motherhoodFilters]);

  // Función para aplicar filtros de vacas
  const applyCowFilters = () => {
    let filtered = [...cows];

    // Filtro por término de búsqueda
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

    // Filtro por raza
    if (cowFilters.breed.length > 0) {
      filtered = filtered.filter(cow => cowFilters.breed.includes(cow.breed));
    }

    // Filtro por estado de salud
    if (cowFilters.healthStatus.length > 0) {
      filtered = filtered.filter(cow => cowFilters.healthStatus.includes(cow.healthStatus));
    }

    // Filtro por estado reproductivo
    if (cowFilters.reproductiveStatus.length > 0) {
      filtered = filtered.filter(cow => cowFilters.reproductiveStatus.includes(cow.reproductiveStatus));
    }

    // Filtro por solo activas
    if (cowFilters.activeOnly) {
      filtered = filtered.filter(cow => cow.active);
    }

    // Filtro por rango de edad
    const currentYear = new Date().getFullYear();
    if (cowFilters.ageRange.min > 0 || cowFilters.ageRange.max < 20) {
      filtered = filtered.filter(cow => {
        const birthYear = new Date(cow.birthDate).getFullYear();
        const age = currentYear - birthYear;
        return age >= cowFilters.ageRange.min && age <= cowFilters.ageRange.max;
      });
    }

    // Filtro por rango de peso
    if (cowFilters.weightRange.min > 0 || cowFilters.weightRange.max < 800) {
      filtered = filtered.filter(cow => 
        cow.weight >= cowFilters.weightRange.min && 
        cow.weight <= cowFilters.weightRange.max
      );
    }

    setFilteredCows(filtered);
  };

  // Función para aplicar filtros de enmadre
  const applyMotherhoodFilters = () => {
    let filtered = [...motherhoodRecords];

    // Filtro por término de búsqueda
    if (motherhoodFilters.searchTerm) {
      const searchLower = motherhoodFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        record =>
          record.cowName.toLowerCase().includes(searchLower) ||
          record.cowEarTag.toLowerCase().includes(searchLower) ||
          record.calf.name.toLowerCase().includes(searchLower) ||
          record.calf.earTag.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por rango de fechas
    if (motherhoodFilters.dateRange.start && motherhoodFilters.dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.calvingDate);
        const startDate = new Date(motherhoodFilters.dateRange.start);
        const endDate = new Date(motherhoodFilters.dateRange.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    // Filtro por tipo de parto
    if (motherhoodFilters.calvingType.length > 0) {
      filtered = filtered.filter(record => motherhoodFilters.calvingType.includes(record.calvingType));
    }

    // Filtro por género de cría
    if (motherhoodFilters.calfGender.length > 0) {
      filtered = filtered.filter(record => motherhoodFilters.calfGender.includes(record.calf.gender));
    }

    // Filtro por salud de cría
    if (motherhoodFilters.calfHealth.length > 0) {
      filtered = filtered.filter(record => motherhoodFilters.calfHealth.includes(record.calf.healthStatus));
    }

    // Filtro por vaca específica
    if (motherhoodFilters.cowId) {
      filtered = filtered.filter(record => record.cowId === motherhoodFilters.cowId);
    }

    setFilteredMotherhoodRecords(filtered);
  };

  // Funciones para CRUD de vacas
  const handleSaveCow = (cowData: Partial<Cow>) => {
    if (editingCow) {
      // Actualizar vaca existente
      setCows(prev => prev.map(cow => 
        cow.id === editingCow.id 
          ? { ...cow, ...cowData, updatedAt: new Date().toISOString() }
          : cow
      ));
      setEditingCow(null);
    } else {
      // Crear nueva vaca
      const newCow: Cow = {
        id: Date.now().toString(),
        name: cowData.name || '',
        earTag: cowData.earTag || '',
        registrationNumber: cowData.registrationNumber,
        breed: cowData.breed || '',
        birthDate: cowData.birthDate || '',
        weight: cowData.weight || 0,
        height: cowData.height,
        currentLocation: {
          lat: 17.9869,
          lng: -92.9303,
          address: "Villahermosa, Tabasco",
          paddock: "Potrero A1",
          facility: "Área General"
        },
        healthStatus: cowData.healthStatus || 'good',
        reproductiveStatus: cowData.reproductiveStatus || 'maiden',
        genetics: {
          genealogy: []
        },
        reproductiveHistory: {
          totalPregnancies: 0,
          liveCalves: 0,
          estrus: {
            lastCycle: '',
            cycleLength: 21,
            irregular: false
          },
          conception: {
            attempts: 0,
            averageAttempts: 0,
            conceptionRate: 0
          }
        },
        lactation: {
          isLactating: false,
          lactationNumber: 0
        },
        health: {
          lastCheckupDate: new Date().toISOString().split('T')[0],
          veterinarian: '',
          bodyConditionScore: 3,
          vaccinations: [],
          treatments: []
        },
        nutrition: {
          diet: '',
          dailyFeed: 0,
          supplements: [],
          lastWeightDate: new Date().toISOString().split('T')[0]
        },
        acquisition: {
          date: new Date().toISOString().split('T')[0],
          source: '',
          cost: 0,
          purpose: 'breeding'
        },
        notes: cowData.notes || '',
        photos: [],
        active: cowData.active ?? true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setCows(prev => [...prev, newCow]);
    }
    setShowCowForm(false);
  };

  const handleDeleteCow = (cow: Cow) => {
    setConfirmTitle('Eliminar Vaca');
    setConfirmMessage(`¿Estás seguro de que quieres eliminar a "${cow.name}" (${cow.earTag})? Esta acción no se puede deshacer.`);
    setConfirmAction(() => () => {
      setCows(prev => prev.filter(c => c.id !== cow.id));
    });
    setShowConfirmModal(true);
  };

  // Funciones para CRUD de enmadre
  const handleSaveMotherhood = (data: Partial<MotherhoodRecord>) => {
    if (editingMotherhood) {
      // Actualizar registro existente
      setMotherhoodRecords(prev => prev.map(record => 
        record.id === editingMotherhood.id 
          ? { ...record, ...data, updatedAt: new Date().toISOString() }
          : record
      ));
      setEditingMotherhood(null);
    } else {
      // Crear nuevo registro
      const newRecord: MotherhoodRecord = {
        id: Date.now().toString(),
        cowId: data.cowId || Date.now().toString(),
        cowName: data.cowName || '',
        cowEarTag: data.cowEarTag || '',
        breedingDate: data.breedingDate || '',
        breedingType: data.breedingType || 'natural',
        pregnancyConfirmDate: data.pregnancyConfirmDate || '',
        gestationPeriod: data.gestationPeriod || 280,
        calvingDate: data.calvingDate || '',
        calvingTime: data.calvingTime || '',
        location: {
          lat: 17.9869,
          lng: -92.9303,
          address: "Villahermosa, Tabasco",
          paddock: "Potrero A1"
        },
        assistedBy: {
          id: "VET001",
          name: "Veterinario",
          role: "Veterinario"
        },
        calvingType: (data as any).calvingType || 'natural',
        complications: [],
        calf: {
          id: Date.now().toString(),
          name: (data as any).calfName || '',
          earTag: (data as any).calfEarTag || '',
          gender: (data as any).calfGender || 'male',
          birthWeight: (data as any).calfBirthWeight || 0,
          healthStatus: 'good',
          alive: true
        },
        placentaExpelled: true,
        colostrum: {
          received: true,
          quality: 'good'
        },
        postCalvingCare: {
          vitamins: false,
          antibiotics: false,
          monitoring: []
        },
        lactationStart: {
          date: data.calvingDate || '',
          initialMilk: 0
        },
        economicImpact: {
          calvingCost: 0,
          veterinaryCost: 0,
          expectedValue: 0
        },
        notes: data.notes || '',
        success: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setMotherhoodRecords(prev => [...prev, newRecord]);
    }
    setShowMotherhoodForm(false);
  };

  const handleDeleteMotherhood = (record: MotherhoodRecord) => {
    setConfirmTitle('Eliminar Registro de Parto');
    setConfirmMessage(`¿Estás seguro de que quieres eliminar el registro del parto de "${record.cowName}" del ${new Date(record.calvingDate).toLocaleDateString('es-MX')}? Esta acción no se puede deshacer.`);
    setConfirmAction(() => () => {
      setMotherhoodRecords(prev => prev.filter(r => r.id !== record.id));
    });
    setShowConfirmModal(true);
  };

  // Funciones para obtener estilos de estados
  const getHealthStatusColor = (status: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800 border-green-200",
      good: "bg-blue-100 text-blue-800 border-blue-200",
      fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
      poor: "bg-orange-100 text-orange-800 border-orange-200",
      sick: "bg-red-100 text-red-800 border-red-200",
      critical: "bg-red-200 text-red-900 border-red-300",
    };
    return colors[status as keyof typeof colors] || colors.fair;
  };

  const getReproductiveStatusColor = (status: string) => {
    const colors = {
      maiden: "bg-purple-100 text-purple-800 border-purple-200",
      pregnant: "bg-pink-100 text-pink-800 border-pink-200",
      lactating: "bg-blue-100 text-blue-800 border-blue-200",
      dry: "bg-yellow-100 text-yellow-800 border-yellow-200",
      open: "bg-green-100 text-green-800 border-green-200",
      retired: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  const getCalvingTypeColor = (type: string) => {
    const colors = {
      natural: "bg-green-100 text-green-800 border-green-200",
      assisted: "bg-blue-100 text-blue-800 border-blue-200",
      cesarean: "bg-orange-100 text-orange-800 border-orange-200",
      emergency: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[type as keyof typeof colors] || colors.natural;
  };

  // Calcular estadísticas
  const cowStatistics = useMemo(() => {
    const totalCows = cows.length;
    const activeCows = cows.filter(cow => cow.active).length;
    const pregnantCows = cows.filter(cow => cow.reproductiveStatus === "pregnant").length;
    const lactatingCows = cows.filter(cow => cow.lactation.isLactating).length;
    const avgWeight = cows.length > 0 ? Math.round(cows.reduce((sum, cow) => sum + cow.weight, 0) / cows.length) : 0;
    const avgAge = cows.length > 0 ? Math.round(cows.reduce((sum, cow) => {
      const age = new Date().getFullYear() - new Date(cow.birthDate).getFullYear();
      return sum + age;
    }, 0) / cows.length) : 0;
    const avgMilkProduction = lactatingCows > 0 ? 
      Math.round(cows
        .filter(cow => cow.lactation.isLactating && cow.lactation.currentMilk)
        .reduce((sum, cow) => sum + (cow.lactation.currentMilk || 0), 0) / lactatingCows) : 0;

    return {
      total: totalCows,
      active: activeCows,
      pregnant: pregnantCows,
      lactating: lactatingCows,
      avgWeight,
      avgAge,
      avgMilkProduction
    };
  }, [cows]);

  const motherhoodStatistics = useMemo(() => {
    const totalBirths = motherhoodRecords.length;
    const successfulBirths = motherhoodRecords.filter(record => record.success).length;
    const maleCalves = motherhoodRecords.filter(record => record.calf.gender === "male").length;
    const femaleCalves = motherhoodRecords.filter(record => record.calf.gender === "female").length;
    const aliveCalves = motherhoodRecords.filter(record => record.calf.alive).length;
    const naturalBirths = motherhoodRecords.filter(record => record.calvingType === "natural").length;
    const avgBirthWeight = motherhoodRecords.length > 0 ? 
      Math.round(motherhoodRecords.reduce((sum, record) => sum + record.calf.birthWeight, 0) / motherhoodRecords.length) : 0;
    
    // Registros de este mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = motherhoodRecords.filter(record => {
      const recordDate = new Date(record.calvingDate);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    }).length;

    return {
      total: totalBirths,
      successful: successfulBirths,
      male: maleCalves,
      female: femaleCalves,
      alive: aliveCalves,
      natural: naturalBirths,
      avgBirthWeight,
      thisMonth
    };
  }, [motherhoodRecords]);

  // Componente de tarjeta de estadística
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
    subtitle?: string;
  }> = ({ title, value, icon, color = "", subtitle }) => (
    <motion.div
      variants={itemVariants}
      className={`bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </motion.div>
  );

  // Componente de tarjeta de vaca
  const CowCard: React.FC<{ cow: Cow }> = ({ cow }) => {
    const age = new Date().getFullYear() - new Date(cow.birthDate).getFullYear();
    
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
      >
        {/* Header de la tarjeta */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">{cow.name}</h3>
              <Flower2 className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-sm text-gray-600">Arete: {cow.earTag}</p>
            <p className="text-sm text-gray-600">Registro: {cow.registrationNumber}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getHealthStatusColor(cow.healthStatus)}`}>
              <Shield className="w-3 h-3 mr-1" />
              {cow.healthStatus === "excellent" ? "Excelente" :
               cow.healthStatus === "good" ? "Buena" :
               cow.healthStatus === "fair" ? "Regular" :
               cow.healthStatus === "poor" ? "Mala" : "Enferma"}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getReproductiveStatusColor(cow.reproductiveStatus)}`}>
              <Heart className="w-3 h-3 mr-1" />
              {cow.reproductiveStatus === "maiden" ? "Vaquilla" :
               cow.reproductiveStatus === "pregnant" ? "Gestante" :
               cow.reproductiveStatus === "lactating" ? "Lactando" :
               cow.reproductiveStatus === "dry" ? "Seca" :
               cow.reproductiveStatus === "open" ? "Vacía" : "Retirada"}
            </span>
          </div>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Raza</p>
            <p className="text-sm font-medium text-gray-900">{cow.breed}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Edad</p>
            <p className="text-sm font-medium text-gray-900">{age} años</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Peso</p>
            <p className="text-sm font-medium text-gray-900">{cow.weight} kg</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ubicación</p>
            <p className="text-sm font-medium text-gray-900">{cow.currentLocation.paddock}</p>
          </div>
        </div>

        {/* Información específica según estado */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          {cow.reproductiveStatus === "lactating" && cow.lactation.isLactating && (
            <>
              <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                <Milk className="w-3 h-3 mr-1" />
                Información de Lactancia
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Lactancia:</span>
                  <span className="font-medium ml-1">#{cow.lactation.lactationNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500">Actual:</span>
                  <span className="font-medium ml-1">{cow.lactation.currentMilk}L/día</span>
                </div>
                <div>
                  <span className="text-gray-500">Pico:</span>
                  <span className="font-medium ml-1">{cow.lactation.peakMilk}L/día</span>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <span className="font-medium ml-1">{cow.lactation.totalMilk}L</span>
                </div>
              </div>
            </>
          )}

          {cow.reproductiveStatus === "pregnant" && cow.currentPregnancy && (
            <>
              <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                <Baby className="w-3 h-3 mr-1" />
                Información de Gestación
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Toro:</span>
                  <span className="font-medium ml-1">{cow.currentPregnancy.bullName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Día:</span>
                  <span className="font-medium ml-1">{cow.currentPregnancy.gestationDay}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Parto esperado:</span>
                  <span className="font-medium ml-1">
                    {new Date(cow.currentPregnancy.expectedCalvingDate).toLocaleDateString('es-MX')}
                  </span>
                </div>
              </div>
            </>
          )}

          {(cow.reproductiveStatus === "dry" || cow.reproductiveStatus === "open") && (
            <>
              <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                Historial Reproductivo
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Partos:</span>
                  <span className="font-medium ml-1">{cow.reproductiveHistory.totalPregnancies}</span>
                </div>
                <div>
                  <span className="text-gray-500">Crías vivas:</span>
                  <span className="font-medium ml-1">{cow.reproductiveHistory.liveCalves}</span>
                </div>
                <div>
                  <span className="text-gray-500">Concepción:</span>
                  <span className="font-medium ml-1">{cow.reproductiveHistory.conception.conceptionRate}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Último parto:</span>
                  <span className="font-medium ml-1">
                    {cow.reproductiveHistory.lastCalvingDate ? 
                      new Date(cow.reproductiveHistory.lastCalvingDate).toLocaleDateString('es-MX') : 
                      "N/A"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Acciones */}
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
            <span className="text-xs text-gray-500">{cow.currentLocation.facility}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Componente de fila de enmadre
  const MotherhoodRow: React.FC<{ record: MotherhoodRecord }> = ({ record }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <Flower2 className="w-5 h-5 text-pink-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">{record.cowName}</p>
            <p className="text-xs text-gray-500">Arete: {record.cowEarTag}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">{record.calf.name}</p>
          <p className="text-xs text-gray-500">Arete: {record.calf.earTag}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {new Date(record.calvingDate).toLocaleDateString('es-MX')}
          </p>
          <p className="text-xs text-gray-500">{record.calvingTime}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCalvingTypeColor(record.calvingType)}`}>
          {record.calvingType === "natural" ? (
            <>
              <Heart className="w-3 h-3 mr-1" />
              Natural
            </>
          ) : record.calvingType === "assisted" ? (
            <>
              <Stethoscope className="w-3 h-3 mr-1" />
              Asistido
            </>
          ) : record.calvingType === "cesarean" ? (
            <>
              <Syringe className="w-3 h-3 mr-1" />
              Cesárea
            </>
          ) : (
            <>
              <Bell className="w-3 h-3 mr-1" />
              Emergencia
            </>
          )}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            record.calf.gender === "male" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
          }`}>
            {record.calf.gender === "male" ? "♂ Macho" : "♀ Hembra"}
          </span>
          <span className="text-sm text-gray-600">{record.calf.birthWeight} kg</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getHealthStatusColor(record.calf.healthStatus)}`}>
          <Shield className="w-3 h-3 mr-1" />
          {record.calf.healthStatus === "excellent" ? "Excelente" :
           record.calf.healthStatus === "good" ? "Buena" :
           record.calf.healthStatus === "fair" ? "Regular" :
           record.calf.healthStatus === "poor" ? "Mala" : "Crítica"}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-1">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{record.location.paddock}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => setSelectedMotherhood(record)}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingMotherhood(record)}
            className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteMotherhood(record)}
            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

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
            <p className="text-gray-600 font-medium">Cargando gestión de vacas...</p>
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
                  <AnimatedText>Gestión de Vacas y Enmadre</AnimatedText>
                </h1>
                <p className="text-gray-600 mt-1">
                  Control integral de vacas reproductoras y registros de maternidad
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 flex items-center space-x-2 ${
                  showFilters 
                    ? "bg-[#519a7c] text-white border-[#519a7c]" 
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#519a7c]"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
              <button
                onClick={() => {/* Función para exportar */}}
                className="px-4 py-2 bg-white text-gray-700 rounded-xl border-2 border-gray-300 hover:border-blue-400 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("cows")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "cows"
                  ? "border-[#519a7c] text-[#519a7c]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Flower2 className="w-4 h-4" />
                <span>Vacas</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("motherhood")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "motherhood"
                  ? "border-[#519a7c] text-[#519a7c]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Baby className="w-4 h-4" />
                <span>Enmadre</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Contenido de tabs */}
        <AnimatePresence mode="wait">
          {activeTab === "cows" && (
            <motion.div
              key="cows"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              {/* Estadísticas de vacas */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
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
                  title="Peso Promedio"
                  value={`${cowStatistics.avgWeight} kg`}
                  icon={<Scale className="w-8 h-8" />}
                  color="hover:bg-yellow-50"
                />
                <StatCard
                  title="Edad Promedio"
                  value={`${cowStatistics.avgAge} años`}
                  icon={<Clock className="w-8 h-8" />}
                  color="hover:bg-orange-50"
                />
                <StatCard
                  title="Leche Promedio"
                  value={`${cowStatistics.avgMilkProduction}L`}
                  icon={<Droplets className="w-8 h-8" />}
                  color="hover:bg-indigo-50"
                />
              </motion.div>

              {/* Controles para vacas */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
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
                      className="inline-flex items-center px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Vaca
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Grid de vacas */}
              <motion.div variants={itemVariants}>
                {filteredCows.length === 0 ? (
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-12 text-center shadow-lg border border-white/20">
                    <Flower2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No se encontraron vacas
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No hay vacas que coincidan con los filtros aplicados.
                    </p>
                    <button
                      onClick={() => setShowCowForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Registrar primera vaca
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCows.map((cow) => (
                      <CowCard key={cow.id} cow={cow} />
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === "motherhood" && (
            <motion.div
              key="motherhood"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              {/* Estadísticas de enmadre */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-6">
                <StatCard
                  title="Total Partos"
                  value={motherhoodStatistics.total}
                  icon={<Baby className="w-8 h-8" />}
                  color="hover:bg-pink-50"
                />
                <StatCard
                  title="Exitosos"
                  value={motherhoodStatistics.successful}
                  icon={<CheckCircle className="w-8 h-8" />}
                  color="hover:bg-green-50"
                />
                <StatCard
                  title="Machos"
                  value={motherhoodStatistics.male}
                  icon={<Crown className="w-8 h-8" />}
                  color="hover:bg-blue-50"
                />
                <StatCard
                  title="Hembras"
                  value={motherhoodStatistics.female}
                  icon={<Flower2 className="w-8 h-8" />}
                  color="hover:bg-purple-50"
                />
                <StatCard
                  title="Crías Vivas"
                  value={motherhoodStatistics.alive}
                  icon={<Heart className="w-8 h-8" />}
                  color="hover:bg-red-50"
                />
                <StatCard
                  title="Naturales"
                  value={motherhoodStatistics.natural}
                  icon={<Star className="w-8 h-8" />}
                  color="hover:bg-yellow-50"
                />
                <StatCard
                  title="Peso Promedio"
                  value={`${motherhoodStatistics.avgBirthWeight} kg`}
                  icon={<Weight className="w-8 h-8" />}
                  color="hover:bg-orange-50"
                />
                <StatCard
                  title="Este Mes"
                  value={motherhoodStatistics.thisMonth}
                  icon={<Calendar className="w-8 h-8" />}
                  color="hover:bg-indigo-50"
                />
              </motion.div>

              {/* Controles para tabla de enmadre */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por vaca, cría, arete..."
                      value={motherhoodFilters.searchTerm}
                      onChange={(e) =>
                        setMotherhoodFilters(prev => ({ ...prev, searchTerm: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowMotherhoodForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Parto
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Tabla de enmadre */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                {filteredMotherhoodRecords.length === 0 ? (
                  <div className="p-12 text-center">
                    <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No se encontraron registros de enmadre
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No hay registros de partos que coincidan con los filtros aplicados.
                    </p>
                    <button
                      onClick={() => setShowMotherhoodForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Registrar primer parto
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vaca
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cría
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha y Hora
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo de Parto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cría Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ubicación
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredMotherhoodRecords.map((record) => (
                          <MotherhoodRow key={record.id} record={record} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modales */}
        {selectedCow && (
          <CowDetailsModal
            cow={selectedCow}
            isOpen={!!selectedCow}
            onClose={() => setSelectedCow(null)}
          />
        )}

        {selectedMotherhood && (
          <MotherhoodDetailsModal
            record={selectedMotherhood}
            isOpen={!!selectedMotherhood}
            onClose={() => setSelectedMotherhood(null)}
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

        {(showMotherhoodForm || editingMotherhood) && (
          <MotherhoodFormModal
            record={editingMotherhood || undefined}
            isOpen={showMotherhoodForm || !!editingMotherhood}
            onClose={() => {
              setShowMotherhoodForm(false);
              setEditingMotherhood(null);
            }}
            onSave={handleSaveMotherhood}
          />
        )}

        {/* Modal de confirmación */}
        <ConfirmModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmAction}
          title={confirmTitle}
          message={confirmMessage}
        />
        
      </motion.div>
    </div>
  );
};

export default CowManagement;