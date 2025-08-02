// BullManagement.tsx
// Página para gestión integral de toros y tabla de empadre (CRUD completo)
import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Users,
  Heart,
  Scale,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Crown,
  Syringe,
  Microscope,
  XCircle,
  Timer,
  X,
  Save,
  Info,
} from "lucide-react";

// Interfaces para gestión de toros
interface Bull {
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
  };
  healthStatus: "excellent" | "good" | "fair" | "poor" | "quarantine";
  reproductiveStatus: "active" | "resting" | "retired" | "testing";
  genetics: {
    sireId?: string;
    sireName?: string;
    damId?: string;
    damName?: string;
    genealogy: string[];
  };
  performance: {
    totalMating: number;
    successfulMating: number;
    offspring: number;
    pregnancyRate: number;
    lastMatingDate?: string;
  };
  health: {
    lastCheckupDate: string;
    veterinarian: string;
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
    purpose: "breeding" | "genetic_improvement" | "replacement";
  };
  notes: string;
  photos: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface para registros de empadre
interface MatingRecord {
  id: string;
  bullId: string;
  bullName: string;
  cowId: string;
  cowName: string;
  cowEarTag: string;
  matingDate: string;
  matingTime: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    paddock: string;
  };
  matingType: "natural" | "artificial" | "embryo_transfer";
  estrusDetected: boolean;
  estrusDate?: string;
  assistedBy: {
    id: string;
    name: string;
    role: string;
  };
  pregnancyTestDate?: string;
  pregnancyResult?: "pregnant" | "not_pregnant" | "pending";
  expectedBirthDate?: string;
  actualBirthDate?: string;
  offspring?: {
    id: string;
    earTag: string;
    sex: "male" | "female";
    weight: number;
    healthStatus: string;
  }[];
  observations: string;
  weatherConditions?: string;
  temperature?: number;
  success: boolean;
  costs: {
    veterinary: number;
    medication: number;
    equipment: number;
    total: number;
  };
  followUp: {
    checkDates: string[];
    veterinarian: string;
    notes: string[];
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interfaces para filtros
interface BullFilters {
  searchTerm: string;
  breed: string[];
  healthStatus: string[];
  reproductiveStatus: string[];
  ageRange: { min: number; max: number };
  weightRange: { min: number; max: number };
  activeOnly: boolean;
}

interface MatingFilters {
  searchTerm: string;
  dateRange: { start: string; end: string };
  matingType: string[];
  pregnancyResult: string[];
  bullId: string;
  location: string;
  assistedBy: string;
}

// Interface para formulario de toro
interface BullFormData {
  name: string;
  earTag: string;
  registrationNumber: string;
  breed: string;
  birthDate: string;
  weight: number;
  height: number;
  address: string;
  paddock: string;
  lat: number;
  lng: number;
  healthStatus: "excellent" | "good" | "fair" | "poor" | "quarantine";
  reproductiveStatus: "active" | "resting" | "retired" | "testing";
  diet: string;
  dailyFeed: number;
  supplements: string;
  veterinarian: string;
  notes: string;
}

// Componente AnimatedText para animaciones de texto
const AnimatedText: React.FC<{ 
  children: React.ReactNode; 
  className?: string;
}> = ({ children, className = "" }) => (
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

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

// Componente Modal Base
const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}> = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl",
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Overlay */}
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        
        {/* Modal Content */}
        <motion.div
          className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Componente para ver detalles del toro
const BullDetailModal: React.FC<{
  bull: Bull;
  isOpen: boolean;
  onClose: () => void;
}> = ({ bull, isOpen, onClose }) => {
  const age = new Date().getFullYear() - new Date(bull.birthDate).getFullYear();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles de ${bull.name}`} size="lg">
      <div className="p-6 space-y-6">
        {/* Información básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Información Básica</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nombre:</span>
                  <span className="font-medium">{bull.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Arete:</span>
                  <span className="font-medium">{bull.earTag}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Registro:</span>
                  <span className="font-medium">{bull.registrationNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Raza:</span>
                  <span className="font-medium">{bull.breed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Edad:</span>
                  <span className="font-medium">{age} años</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Peso:</span>
                  <span className="font-medium">{bull.weight} kg</span>
                </div>
                {bull.height && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Altura:</span>
                    <span className="font-medium">{bull.height} cm</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Estados</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estado de Salud:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bull.healthStatus === "excellent" ? "bg-green-100 text-green-800" :
                    bull.healthStatus === "good" ? "bg-blue-100 text-blue-800" :
                    bull.healthStatus === "fair" ? "bg-yellow-100 text-yellow-800" :
                    bull.healthStatus === "poor" ? "bg-orange-100 text-orange-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {bull.healthStatus === "excellent" ? "Excelente" :
                     bull.healthStatus === "good" ? "Bueno" :
                     bull.healthStatus === "fair" ? "Regular" :
                     bull.healthStatus === "poor" ? "Malo" : "Cuarentena"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Estado Reproductivo:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bull.reproductiveStatus === "active" ? "bg-green-100 text-green-800" :
                    bull.reproductiveStatus === "resting" ? "bg-blue-100 text-blue-800" :
                    bull.reproductiveStatus === "retired" ? "bg-gray-100 text-gray-800" :
                    "bg-purple-100 text-purple-800"
                  }`}>
                    {bull.reproductiveStatus === "active" ? "Activo" :
                     bull.reproductiveStatus === "resting" ? "Descanso" :
                     bull.reproductiveStatus === "retired" ? "Retirado" : "Prueba"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ubicación</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Potrero:</span>
                  <span className="font-medium">{bull.currentLocation.paddock}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dirección:</span>
                  <span className="font-medium text-right">{bull.currentLocation.address}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Rendimiento</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Montas:</span>
                  <span className="font-medium">{bull.performance.totalMating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Exitosas:</span>
                  <span className="font-medium">{bull.performance.successfulMating}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Crías:</span>
                  <span className="font-medium">{bull.performance.offspring}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasa de Preñez:</span>
                  <span className="font-medium">{bull.performance.pregnancyRate}%</span>
                </div>
                {bull.performance.lastMatingDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última Monta:</span>
                    <span className="font-medium">
                      {new Date(bull.performance.lastMatingDate).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Genética */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Información Genética</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-gray-600">Padre:</span>
              <span className="font-medium ml-2">{bull.genetics.sireName || "No especificado"}</span>
            </div>
            <div>
              <span className="text-gray-600">Madre:</span>
              <span className="font-medium ml-2">{bull.genetics.damName || "No especificado"}</span>
            </div>
          </div>
          {bull.genetics.genealogy.length > 0 && (
            <div className="mt-2">
              <span className="text-gray-600">Línea Genética:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {bull.genetics.genealogy.map((line, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm">
                    {line}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sección de Salud */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Información de Salud</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Último Chequeo:</span>
              <span className="font-medium">
                {new Date(bull.health.lastCheckupDate).toLocaleDateString('es-MX')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Veterinario:</span>
              <span className="font-medium">{bull.health.veterinarian}</span>
            </div>
          </div>

          {bull.health.vaccinations.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium text-gray-900 mb-2">Vacunas Recientes</h4>
              <div className="space-y-2">
                {bull.health.vaccinations.slice(0, 3).map((vaccination, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{vaccination.vaccine}</span>
                    <span className="text-gray-600">
                      {new Date(vaccination.date).toLocaleDateString('es-MX')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sección de Nutrición */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Nutrición</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Dieta:</span>
              <span className="font-medium">{bull.nutrition.diet}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Alimento Diario:</span>
              <span className="font-medium">{bull.nutrition.dailyFeed} kg</span>
            </div>
            {bull.nutrition.supplements.length > 0 && (
              <div>
                <span className="text-gray-600">Suplementos:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {bull.nutrition.supplements.map((supplement, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-md text-sm">
                      {supplement}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notas */}
        {bull.notes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{bull.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Componente para formulario de toro (crear/editar)
const BullFormModal: React.FC<{
  bull?: Bull;
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: BullFormData) => void;
}> = ({ bull, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<BullFormData>({
    name: "",
    earTag: "",
    registrationNumber: "",
    breed: "",
    birthDate: "",
    weight: 0,
    height: 0,
    address: "",
    paddock: "",
    lat: 0,
    lng: 0,
    healthStatus: "good",
    reproductiveStatus: "active",
    diet: "",
    dailyFeed: 0,
    supplements: "",
    veterinarian: "",
    notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    if (bull) {
      setFormData({
        name: bull.name,
        earTag: bull.earTag,
        registrationNumber: bull.registrationNumber || "",
        breed: bull.breed,
        birthDate: bull.birthDate,
        weight: bull.weight,
        height: bull.height || 0,
        address: bull.currentLocation.address,
        paddock: bull.currentLocation.paddock,
        lat: bull.currentLocation.lat,
        lng: bull.currentLocation.lng,
        healthStatus: bull.healthStatus,
        reproductiveStatus: bull.reproductiveStatus,
        diet: bull.nutrition.diet,
        dailyFeed: bull.nutrition.dailyFeed,
        supplements: bull.nutrition.supplements.join(", "),
        veterinarian: bull.health.veterinarian,
        notes: bull.notes,
      });
    } else {
      setFormData({
        name: "",
        earTag: "",
        registrationNumber: "",
        breed: "",
        birthDate: "",
        weight: 0,
        height: 0,
        address: "",
        paddock: "",
        lat: 0,
        lng: 0,
        healthStatus: "good",
        reproductiveStatus: "active",
        diet: "",
        dailyFeed: 0,
        supplements: "",
        veterinarian: "",
        notes: "",
      });
    }
    setErrors({});
  }, [bull, isOpen]);

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada por este navegador.");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        setFormData(prev => ({
          ...prev,
          lat: latitude,
          lng: longitude,
        }));

        // Obtener dirección desde coordenadas (opcional)
        getAddressFromCoords(latitude, longitude);
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error obteniendo ubicación:", error);
        let errorMessage = "Error obteniendo ubicación.";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Ubicación no disponible.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado.";
            break;
        }
        
        alert(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Función para obtener dirección desde coordenadas (usando API de geocodificación)
  const getAddressFromCoords = async (lat: number, lng: number) => {
    try {
      // Usar un servicio gratuito de geocodificación inversa
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`
      );
      const data = await response.json();
      
      if (data && data.locality) {
        const address = `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`;
        setFormData(prev => ({
          ...prev,
          address: address,
        }));
      }
    } catch (error) {
      console.error("Error obteniendo dirección:", error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "El nombre es requerido";
    if (!formData.earTag.trim()) newErrors.earTag = "El arete es requerido";
    if (!formData.breed.trim()) newErrors.breed = "La raza es requerida";
    if (!formData.birthDate) newErrors.birthDate = "La fecha de nacimiento es requerida";
    if (formData.weight <= 0) newErrors.weight = "El peso debe ser mayor a 0";
    if (!formData.paddock.trim()) newErrors.paddock = "El potrero es requerido";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleInputChange = (field: keyof BullFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={bull ? `Editar ${bull.name}` : "Nuevo Toro"} 
      size="lg"
    >
      <div className="p-6 space-y-6">
        {/* Información Básica */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Básica</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nombre del toro"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Arete *
              </label>
              <input
                type="text"
                value={formData.earTag}
                onChange={(e) => handleInputChange("earTag", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                  errors.earTag ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Número de arete"
              />
              {errors.earTag && <p className="text-red-500 text-xs mt-1">{errors.earTag}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Número de Registro
              </label>
              <input
                type="text"
                value={formData.registrationNumber}
                onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                placeholder="Número de registro"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raza *
              </label>
              <select
                value={formData.breed}
                onChange={(e) => handleInputChange("breed", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                  errors.breed ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Seleccionar raza</option>
                <option value="Brahman">Brahman</option>
                <option value="Angus">Angus</option>
                <option value="Charolais">Charolais</option>
                <option value="Simmental">Simmental</option>
                <option value="Limousin">Limousin</option>
                <option value="Hereford">Hereford</option>
                <option value="Brangus">Brangus</option>
                <option value="Nelore">Nelore</option>
              </select>
              {errors.breed && <p className="text-red-500 text-xs mt-1">{errors.breed}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                  errors.birthDate ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peso (kg) *
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", Number(e.target.value))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                  errors.weight ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Peso en kilogramos"
                min="0"
              />
              {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Altura (cm)
              </label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => handleInputChange("height", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                placeholder="Altura en centímetros"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Potrero *
              </label>
              <input
                type="text"
                value={formData.paddock}
                onChange={(e) => handleInputChange("paddock", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                  errors.paddock ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nombre del potrero"
              />
              {errors.paddock && <p className="text-red-500 text-xs mt-1">{errors.paddock}</p>}
            </div>
          </div>
        </div>

        {/* Estados */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado de Salud
              </label>
              <select
                value={formData.healthStatus}
                onChange={(e) => handleInputChange("healthStatus", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="excellent">Excelente</option>
                <option value="good">Bueno</option>
                <option value="fair">Regular</option>
                <option value="poor">Malo</option>
                <option value="quarantine">Cuarentena</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Estado Reproductivo
              </label>
              <select
                value={formData.reproductiveStatus}
                onChange={(e) => handleInputChange("reproductiveStatus", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="active">Activo</option>
                <option value="resting">Descanso</option>
                <option value="testing">Prueba</option>
                <option value="retired">Retirado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Nutrición */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nutrición</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dieta
              </label>
              <input
                type="text"
                value={formData.diet}
                onChange={(e) => handleInputChange("diet", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                placeholder="Descripción de la dieta"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alimento Diario (kg)
              </label>
              <input
                type="number"
                value={formData.dailyFeed}
                onChange={(e) => handleInputChange("dailyFeed", Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                placeholder="Cantidad diaria de alimento"
                min="0"
                step="0.1"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suplementos
              </label>
              <input
                type="text"
                value={formData.supplements}
                onChange={(e) => handleInputChange("supplements", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                placeholder="Suplementos separados por comas"
              />
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ubicación</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                placeholder="Dirección completa"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitud
                </label>
                <input
                  type="number"
                  value={formData.lat}
                  onChange={(e) => handleInputChange("lat", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  placeholder="Latitud"
                  step="any"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitud
                </label>
                <input
                  type="number"
                  value={formData.lng}
                  onChange={(e) => handleInputChange("lng", Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  placeholder="Longitud"
                  step="any"
                />
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
              >
                {isGettingLocation ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Obteniendo ubicación...
                  </>
                ) : (
                  <>
                    <MapPin className="w-4 h-4 mr-2" />
                    Usar mi ubicación actual
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Adicional</h3>
          <div className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Veterinario
              </label>
              <input
                type="text"
                value={formData.veterinarian}
                onChange={(e) => handleInputChange("veterinarian", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                placeholder="Nombre del veterinario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                placeholder="Notas adicionales sobre el toro"
              />
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {bull ? "Actualizar" : "Crear"} Toro
          </button>
        </div>
      </div>
    </Modal>
  );
};

const BullManagement: React.FC = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState<"bulls" | "mating">("bulls");
  const [isLoading, setIsLoading] = useState(true);
  const [bulls, setBulls] = useState<Bull[]>([]);
  const [matingRecords, setMatingRecords] = useState<MatingRecord[]>([]);
  const [filteredBulls, setFilteredBulls] = useState<Bull[]>([]);
  const [filteredMatingRecords, setFilteredMatingRecords] = useState<MatingRecord[]>([]);
  
  // Estados de UI para modales
  const [showBullDetail, setShowBullDetail] = useState(false);
  const [showBullForm, setShowBullForm] = useState(false);
  const [, setShowMatingForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBull, setSelectedBull] = useState<Bull | null>(null);
  const [, setSelectedMating] = useState<MatingRecord | null>(null);
  const [editingBull, setEditingBull] = useState<Bull | null>(null);
  const [, setEditingMating] = useState<MatingRecord | null>(null);

  // Estado para notificaciones
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
    show: boolean;
  }>({ message: "", type: "success", show: false });
  
  // Estados de filtros
  const [bullFilters, setBullFilters] = useState<BullFilters>({
    searchTerm: "",
    breed: [],
    healthStatus: [],
    reproductiveStatus: [],
    ageRange: { min: 0, max: 20 },
    weightRange: { min: 0, max: 2000 },
    activeOnly: false,
  });
  
  const [matingFilters, setMatingFilters] = useState<MatingFilters>({
    searchTerm: "",
    dateRange: { start: "", end: "" },
    matingType: [],
    pregnancyResult: [],
    bullId: "",
    location: "",
    assistedBy: "",
  });

  // Función para mostrar notificaciones
  const showNotification = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type, show: true });
    
    // Auto-ocultar después de 3 segundos
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  // Funciones para manejar acciones de toros
  const handleViewBull = useCallback((bull: Bull) => {
    setSelectedBull(bull);
    setShowBullDetail(true);
  }, []);

  const handleNewBull = useCallback(() => {
    setEditingBull(null);
    setShowBullForm(true);
  }, []);

  const handleEditBull = useCallback((bull: Bull) => {
    setEditingBull(bull);
    setShowBullForm(true);
  }, []);

  // FUNCIÓN DE ELIMINACIÓN CORREGIDA
  const handleDeleteBull = useCallback((bullId: string) => {
    // Buscar el toro en el estado actual
    const bullToDelete = bulls.find(bull => bull.id === bullId);
    
    if (!bullToDelete) {
      showNotification("Toro no encontrado", "error");
      return;
    }

    // Mostrar confirmación
    const confirmMessage = `¿Está seguro de que desea eliminar el toro "${bullToDelete.name}" (${bullToDelete.earTag})?\n\nEsta acción también eliminará todos los registros de empadre relacionados y no se puede deshacer.`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      // Eliminar el toro del estado
      setBulls(prevBulls => {
        const newBulls = prevBulls.filter(bull => bull.id !== bullId);
        return newBulls;
      });

      // Eliminar registros de empadre relacionados
      setMatingRecords(prevRecords => {
        const relatedRecordsCount = prevRecords.filter(record => record.bullId === bullId).length;
        const newRecords = prevRecords.filter(record => record.bullId !== bullId);
        
        // Mostrar notificación de éxito
        const message = relatedRecordsCount > 0 
          ? `Toro "${bullToDelete.name}" eliminado exitosamente junto con ${relatedRecordsCount} registro(s) de empadre relacionado(s).`
          : `Toro "${bullToDelete.name}" eliminado exitosamente.`;
        
        showNotification(message, "success");
        
        return newRecords;
      });
      
    } catch (error) {
      console.error("Error al eliminar el toro:", error);
      showNotification("Error al eliminar el toro. Por favor, inténtelo de nuevo.", "error");
    }
  }, [bulls, showNotification]);

  const handleSaveBull = useCallback((formData: BullFormData) => {
    try {
      if (editingBull) {
        // Actualizar toro existente
        setBulls(prev => {
          const updated = prev.map(bull => 
            bull.id === editingBull.id 
              ? {
                  ...bull,
                  name: formData.name,
                  earTag: formData.earTag,
                  registrationNumber: formData.registrationNumber,
                  breed: formData.breed,
                  birthDate: formData.birthDate,
                  weight: formData.weight,
                  height: formData.height,
                  currentLocation: {
                    lat: formData.lat || bull.currentLocation.lat,
                    lng: formData.lng || bull.currentLocation.lng,
                    address: formData.address,
                    paddock: formData.paddock,
                  },
                  healthStatus: formData.healthStatus,
                  reproductiveStatus: formData.reproductiveStatus,
                  nutrition: {
                    ...bull.nutrition,
                    diet: formData.diet,
                    dailyFeed: formData.dailyFeed,
                    supplements: formData.supplements.split(',').map(s => s.trim()).filter(s => s),
                  },
                  health: {
                    ...bull.health,
                    veterinarian: formData.veterinarian,
                  },
                  notes: formData.notes,
                  updatedAt: new Date().toISOString(),
                }
              : bull
          );
          return updated;
        });
        
        showNotification(`Toro ${editingBull.name} actualizado exitosamente`, "success");
      } else {
        // Crear nuevo toro
        const newBull: Bull = {
          id: Date.now().toString(),
          name: formData.name,
          earTag: formData.earTag,
          registrationNumber: formData.registrationNumber,
          breed: formData.breed,
          birthDate: formData.birthDate,
          weight: formData.weight,
          height: formData.height,
          currentLocation: {
            lat: formData.lat || 17.9869, // Coordenadas por defecto de Villahermosa, Tabasco
            lng: formData.lng || -92.9303,
            address: formData.address || "Villahermosa, Tabasco",
            paddock: formData.paddock,
          },
          healthStatus: formData.healthStatus,
          reproductiveStatus: formData.reproductiveStatus,
          genetics: {
            genealogy: [],
          },
          performance: {
            totalMating: 0,
            successfulMating: 0,
            offspring: 0,
            pregnancyRate: 0,
          },
          health: {
            lastCheckupDate: new Date().toISOString().split('T')[0],
            veterinarian: formData.veterinarian,
            vaccinations: [],
            treatments: [],
          },
          nutrition: {
            diet: formData.diet,
            dailyFeed: formData.dailyFeed,
            supplements: formData.supplements.split(',').map(s => s.trim()).filter(s => s),
            lastWeightDate: new Date().toISOString().split('T')[0],
          },
          acquisition: {
            date: new Date().toISOString().split('T')[0],
            source: "Registro manual",
            cost: 0,
            purpose: "breeding",
          },
          notes: formData.notes,
          photos: [],
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        setBulls(prev => [...prev, newBull]);
        showNotification(`Nuevo toro ${formData.name} creado exitosamente`, "success");
      }
      
      // Cerrar modal
      setShowBullForm(false);
      setEditingBull(null);
      
    } catch (error) {
      console.error("Error al guardar el toro:", error);
      showNotification("Error al guardar el toro. Por favor, inténtelo de nuevo.", "error");
    }
  }, [editingBull, showNotification]);

  // Funciones para manejar acciones de empadre
  const handleNewMating = useCallback(() => {
    setEditingMating(null);
    setShowMatingForm(true);
  }, []);

  const handleEditMating = useCallback((record: MatingRecord) => {
    setEditingMating(record);
    setShowMatingForm(true);
  }, []);

  const handleDeleteMating = useCallback((recordId: string) => {
    const recordToDelete = matingRecords.find(record => record.id === recordId);
    if (!recordToDelete) {
      showNotification("Registro de empadre no encontrado", "error");
      return;
    }

    const confirmMessage = `¿Está seguro de que desea eliminar el registro de empadre entre "${recordToDelete.bullName}" y "${recordToDelete.cowName}" del ${new Date(recordToDelete.matingDate).toLocaleDateString('es-MX')}?\n\nEsta acción no se puede deshacer.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        setMatingRecords(prev => prev.filter(record => record.id !== recordId));
        showNotification("Registro de empadre eliminado exitosamente", "success");
        
      } catch (error) {
        console.error("Error al eliminar el registro:", error);
        showNotification("Error al eliminar el registro. Por favor, inténtelo de nuevo.", "error");
      }
    }
  }, [matingRecords, showNotification]);

  const handleExport = useCallback(() => {
    console.log("Exportar datos");
    // Aquí implementarías la lógica para exportar
  }, []);

  // Datos mock para desarrollo
  useEffect(() => {
    const loadData = setTimeout(() => {
      setBulls([
        {
          id: "1",
          name: "Toro Campeón",
          earTag: "TC001",
          registrationNumber: "REG-2024-001",
          breed: "Brahman",
          birthDate: "2020-03-15",
          weight: 850,
          height: 145,
          currentLocation: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Potrero Norte, Villahermosa, Tabasco",
            paddock: "Potrero A1"
          },
          healthStatus: "excellent",
          reproductiveStatus: "active",
          genetics: {
            sireId: "SIRE001",
            sireName: "Brahman Elite",
            damId: "DAM001",
            damName: "Vaca Madre",
            genealogy: ["Brahman Elite", "Toro Superior", "Línea Premium"]
          },
          performance: {
            totalMating: 45,
            successfulMating: 38,
            offspring: 32,
            pregnancyRate: 84.4,
            lastMatingDate: "2024-06-15"
          },
          health: {
            lastCheckupDate: "2024-07-10",
            veterinarian: "Dr. Carlos Mendoza",
            vaccinations: [
              {
                date: "2024-06-01",
                vaccine: "Triple Bovina",
                batch: "TB-2024-06",
                nextDue: "2025-06-01"
              }
            ],
            treatments: []
          },
          nutrition: {
            diet: "Pasto estrella + concentrado",
            dailyFeed: 12,
            supplements: ["Vitamina A", "Minerales"],
            lastWeightDate: "2024-07-10"
          },
          acquisition: {
            date: "2020-03-15",
            source: "Rancho Los Altos",
            cost: 45000,
            purpose: "breeding"
          },
          notes: "Excelente toro reproductor con alta tasa de preñez",
          photos: [],
          active: true,
          createdAt: "2024-01-15",
          updatedAt: "2024-07-15"
        },
        {
          id: "2",
          name: "Toro Dorado",
          earTag: "TD002",
          registrationNumber: "REG-2024-002",
          breed: "Angus",
          birthDate: "2019-08-22",
          weight: 920,
          height: 150,
          currentLocation: {
            lat: 17.9950,
            lng: -92.9400,
            address: "Potrero Sur, Villahermosa, Tabasco",
            paddock: "Potrero B2"
          },
          healthStatus: "good",
          reproductiveStatus: "active",
          genetics: {
            sireId: "SIRE002",
            sireName: "Angus Premium",
            damId: "DAM002",
            damName: "Madre Dorada",
            genealogy: ["Angus Premium", "Línea Dorada", "Genética Superior"]
          },
          performance: {
            totalMating: 52,
            successfulMating: 44,
            offspring: 38,
            pregnancyRate: 84.6,
            lastMatingDate: "2024-07-01"
          },
          health: {
            lastCheckupDate: "2024-07-05",
            veterinarian: "Dra. Ana Rodríguez",
            vaccinations: [
              {
                date: "2024-05-15",
                vaccine: "Brucelosis",
                batch: "BR-2024-05",
                nextDue: "2025-05-15"
              }
            ],
            treatments: []
          },
          nutrition: {
            diet: "Pasto bermuda + suplemento proteico",
            dailyFeed: 14,
            supplements: ["Proteína", "Minerales", "Vitamina E"],
            lastWeightDate: "2024-07-05"
          },
          acquisition: {
            date: "2019-08-22",
            source: "Ganadería La Esperanza",
            cost: 52000,
            purpose: "genetic_improvement"
          },
          notes: "Toro con excelente conformación y buenos índices reproductivos",
          photos: [],
          active: true,
          createdAt: "2024-01-10",
          updatedAt: "2024-07-10"
        }
      ]);

      setMatingRecords([
        {
          id: "1",
          bullId: "1",
          bullName: "Toro Campeón",
          cowId: "COW001",
          cowName: "Vaca Luna",
          cowEarTag: "VL001",
          matingDate: "2024-07-15",
          matingTime: "08:30",
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Potrero Norte, Villahermosa, Tabasco",
            paddock: "Potrero A1"
          },
          matingType: "natural",
          estrusDetected: true,
          estrusDate: "2024-07-14",
          assistedBy: {
            id: "VET001",
            name: "Dr. Carlos Mendoza",
            role: "Veterinario"
          },
          pregnancyTestDate: "2024-08-15",
          pregnancyResult: "pregnant",
          expectedBirthDate: "2025-04-15",
          observations: "Monta natural exitosa, vaca en celo evidente",
          weatherConditions: "Soleado",
          temperature: 28,
          success: true,
          costs: {
            veterinary: 800,
            medication: 200,
            equipment: 0,
            total: 1000
          },
          followUp: {
            checkDates: ["2024-08-15", "2024-09-15"],
            veterinarian: "Dr. Carlos Mendoza",
            notes: ["Gestación confirmada", "Desarrollo normal"]
          },
          active: true,
          createdAt: "2024-07-15",
          updatedAt: "2024-08-15"
        },
        {
          id: "2",
          bullId: "2",
          bullName: "Toro Dorado",
          cowId: "COW002",
          cowName: "Vaca Estrella",
          cowEarTag: "VE002",
          matingDate: "2024-07-10",
          matingTime: "14:15",
          location: {
            lat: 17.9950,
            lng: -92.9400,
            address: "Potrero Sur, Villahermosa, Tabasco",
            paddock: "Potrero B2"
          },
          matingType: "artificial",
          estrusDetected: true,
          estrusDate: "2024-07-09",
          assistedBy: {
            id: "VET002",
            name: "Dra. Ana Rodríguez",
            role: "Veterinaria"
          },
          pregnancyTestDate: "2024-08-10",
          pregnancyResult: "pending",
          observations: "Inseminación artificial programada, sincronización exitosa",
          weatherConditions: "Nublado",
          temperature: 26,
          success: true,
          costs: {
            veterinary: 1200,
            medication: 400,
            equipment: 300,
            total: 1900
          },
          followUp: {
            checkDates: ["2024-08-10"],
            veterinarian: "Dra. Ana Rodríguez",
            notes: ["Esperando resultado de gestación"]
          },
          active: true,
          createdAt: "2024-07-10",
          updatedAt: "2024-07-10"
        }
      ]);

      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(loadData);
  }, []);

  // Efectos para filtros
  useEffect(() => {
    applyBullFilters();
  }, [bulls, bullFilters]);

  useEffect(() => {
    applyMatingFilters();
  }, [matingRecords, matingFilters]);

  // Función para aplicar filtros de toros
  const applyBullFilters = useCallback(() => {
    let filtered = [...bulls];

    if (bullFilters.searchTerm) {
      const searchLower = bullFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        bull =>
          bull.name.toLowerCase().includes(searchLower) ||
          bull.earTag.toLowerCase().includes(searchLower) ||
          bull.registrationNumber?.toLowerCase().includes(searchLower)
      );
    }

    if (bullFilters.breed.length > 0) {
      filtered = filtered.filter(bull => bullFilters.breed.includes(bull.breed));
    }

    if (bullFilters.healthStatus.length > 0) {
      filtered = filtered.filter(bull => bullFilters.healthStatus.includes(bull.healthStatus));
    }

    if (bullFilters.reproductiveStatus.length > 0) {
      filtered = filtered.filter(bull => bullFilters.reproductiveStatus.includes(bull.reproductiveStatus));
    }

    if (bullFilters.activeOnly) {
      filtered = filtered.filter(bull => bull.active);
    }

    const currentYear = new Date().getFullYear();
    if (bullFilters.ageRange.min > 0 || bullFilters.ageRange.max < 20) {
      filtered = filtered.filter(bull => {
        const birthYear = new Date(bull.birthDate).getFullYear();
        const age = currentYear - birthYear;
        return age >= bullFilters.ageRange.min && age <= bullFilters.ageRange.max;
      });
    }

    if (bullFilters.weightRange.min > 0 || bullFilters.weightRange.max < 2000) {
      filtered = filtered.filter(bull => 
        bull.weight >= bullFilters.weightRange.min && 
        bull.weight <= bullFilters.weightRange.max
      );
    }

    setFilteredBulls(filtered);
  }, [bulls, bullFilters]);

  // Función para aplicar filtros de empadre
  const applyMatingFilters = useCallback(() => {
    let filtered = [...matingRecords];

    if (matingFilters.searchTerm) {
      const searchLower = matingFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        record =>
          record.bullName.toLowerCase().includes(searchLower) ||
          record.cowName.toLowerCase().includes(searchLower) ||
          record.cowEarTag.toLowerCase().includes(searchLower)
      );
    }

    if (matingFilters.dateRange.start && matingFilters.dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.matingDate);
        const startDate = new Date(matingFilters.dateRange.start);
        const endDate = new Date(matingFilters.dateRange.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    if (matingFilters.matingType.length > 0) {
      filtered = filtered.filter(record => matingFilters.matingType.includes(record.matingType));
    }

    if (matingFilters.pregnancyResult.length > 0) {
      filtered = filtered.filter(record => 
        record.pregnancyResult && matingFilters.pregnancyResult.includes(record.pregnancyResult)
      );
    }

    if (matingFilters.bullId) {
      filtered = filtered.filter(record => record.bullId === matingFilters.bullId);
    }

    setFilteredMatingRecords(filtered);
  }, [matingRecords, matingFilters]);

  // Funciones para obtener estilos de estados
  const getHealthStatusColor = useCallback((status: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800 border-green-200",
      good: "bg-blue-100 text-blue-800 border-blue-200",
      fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
      poor: "bg-orange-100 text-orange-800 border-orange-200",
      quarantine: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status as keyof typeof colors] || colors.fair;
  }, []);

  const getReproductiveStatusColor = useCallback((status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      resting: "bg-blue-100 text-blue-800 border-blue-200",
      retired: "bg-gray-100 text-gray-800 border-gray-200",
      testing: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[status as keyof typeof colors] || colors.active;
  }, []);

  const getPregnancyResultColor = useCallback((result?: string) => {
    const colors = {
      pregnant: "bg-emerald-100 text-emerald-800 border-emerald-200",
      not_pregnant: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return result ? colors[result as keyof typeof colors] || colors.pending : colors.pending;
  }, []);

  // Calcular estadísticas
  const bullStatistics = useMemo(() => {
    const totalBulls = bulls.length;
    const activeBulls = bulls.filter(bull => bull.active && bull.reproductiveStatus === "active").length;
    const avgWeight = bulls.length > 0 ? Math.round(bulls.reduce((sum, bull) => sum + bull.weight, 0) / bulls.length) : 0;
    const avgAge = bulls.length > 0 ? Math.round(bulls.reduce((sum, bull) => {
      const age = new Date().getFullYear() - new Date(bull.birthDate).getFullYear();
      return sum + age;
    }, 0) / bulls.length) : 0;
    const avgPregnancyRate = bulls.length > 0 ? Math.round(bulls.reduce((sum, bull) => sum + bull.performance.pregnancyRate, 0) / bulls.length) : 0;

    return {
      total: totalBulls,
      active: activeBulls,
      avgWeight,
      avgAge,
      avgPregnancyRate
    };
  }, [bulls]);

  const matingStatistics = useMemo(() => {
    const totalMating = matingRecords.length;
    const successful = matingRecords.filter(record => record.success).length;
    const pregnant = matingRecords.filter(record => record.pregnancyResult === "pregnant").length;
    const pending = matingRecords.filter(record => record.pregnancyResult === "pending").length;
    const successRate = totalMating > 0 ? Math.round((successful / totalMating) * 100) : 0;
    const pregnancyRate = totalMating > 0 ? Math.round((pregnant / totalMating) * 100) : 0;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = matingRecords.filter(record => {
      const recordDate = new Date(record.matingDate);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    }).length;

    return {
      total: totalMating,
      successful,
      pregnant,
      pending,
      successRate,
      pregnancyRate,
      thisMonth
    };
  }, [matingRecords]);

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
      className={`bg-white rounded-xl p-4 shadow-md border border-gray-200 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </motion.div>
  );

  // Componente de tarjeta de toro CORREGIDO
  const BullCard: React.FC<{ bull: Bull }> = ({ bull }) => {
    const age = new Date().getFullYear() - new Date(bull.birthDate).getFullYear();
    
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white rounded-xl p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">{bull.name}</h3>
              <Crown className="w-5 h-5 text-yellow-600" />
            </div>
            <p className="text-sm text-gray-600">Arete: {bull.earTag}</p>
            <p className="text-sm text-gray-600">Registro: {bull.registrationNumber}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getHealthStatusColor(bull.healthStatus)}`}>
              <Shield className="w-3 h-3 mr-1" />
              {bull.healthStatus === "excellent" ? "Excelente" :
               bull.healthStatus === "good" ? "Bueno" :
               bull.healthStatus === "fair" ? "Regular" :
               bull.healthStatus === "poor" ? "Malo" : "Cuarentena"}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getReproductiveStatusColor(bull.reproductiveStatus)}`}>
              <Zap className="w-3 h-3 mr-1" />
              {bull.reproductiveStatus === "active" ? "Activo" :
               bull.reproductiveStatus === "resting" ? "Descanso" :
               bull.reproductiveStatus === "retired" ? "Retirado" : "Prueba"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Raza</p>
            <p className="text-sm font-medium text-gray-900">{bull.breed}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Edad</p>
            <p className="text-sm font-medium text-gray-900">{age} años</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Peso</p>
            <p className="text-sm font-medium text-gray-900">{bull.weight} kg</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ubicación</p>
            <p className="text-sm font-medium text-gray-900">{bull.currentLocation.paddock}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h4 className="text-xs font-medium text-gray-600 mb-2">Rendimiento Reproductivo</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Total Montas:</span>
              <span className="font-medium ml-1">{bull.performance.totalMating}</span>
            </div>
            <div>
              <span className="text-gray-500">Exitosas:</span>
              <span className="font-medium ml-1">{bull.performance.successfulMating}</span>
            </div>
            <div>
              <span className="text-gray-500">Crías:</span>
              <span className="font-medium ml-1">{bull.performance.offspring}</span>
            </div>
            <div>
              <span className="text-gray-500">Tasa Preñez:</span>
              <span className="font-medium ml-1">{bull.performance.pregnancyRate}%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => handleViewBull(bull)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleEditBull(bull)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDeleteBull(bull.id)}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">{bull.currentLocation.address.split(',')[0]}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Componente de fila de empadre
  const MatingRow: React.FC<{ record: MatingRecord }> = ({ record }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <Crown className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">{record.bullName}</p>
            <p className="text-xs text-gray-500">ID: {record.bullId}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">{record.cowName}</p>
          <p className="text-xs text-gray-500">Arete: {record.cowEarTag}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {new Date(record.matingDate).toLocaleDateString('es-MX')}
          </p>
          <p className="text-xs text-gray-500">{record.matingTime}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          record.matingType === "natural" ? "bg-green-100 text-green-800" :
          record.matingType === "artificial" ? "bg-blue-100 text-blue-800" :
          "bg-purple-100 text-purple-800"
        }`}>
          {record.matingType === "natural" ? (
            <>
              <Heart className="w-3 h-3 mr-1" />
              Natural
            </>
          ) : record.matingType === "artificial" ? (
            <>
              <Syringe className="w-3 h-3 mr-1" />
              Artificial
            </>
          ) : (
            <>
              <Microscope className="w-3 h-3 mr-1" />
              Transferencia
            </>
          )}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPregnancyResultColor(record.pregnancyResult)}`}>
          {record.pregnancyResult === "pregnant" ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Preñada
            </>
          ) : record.pregnancyResult === "not_pregnant" ? (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              No Preñada
            </>
          ) : (
            <>
              <Timer className="w-3 h-3 mr-1" />
              Pendiente
            </>
          )}
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
            onClick={() => setSelectedMating(record)}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditMating(record)}
            className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteMating(record.id)}
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          className="bg-white rounded-2xl p-8 shadow-xl"
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
            <p className="text-gray-600 font-medium">Cargando gestión de toros...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  // LAYOUT CORREGIDO - SIN ESPACIOS VACÍOS
  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        className="max-w-7xl mx-auto p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200"
          variants={itemVariants}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <AnimatedText>Gestión de Toros y Empadre</AnimatedText>
                </h1>
                <p className="text-gray-600 mt-1">
                  Control integral de toros reproductores y registros de empadre
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
                onClick={handleExport}
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
              onClick={() => setActiveTab("bulls")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "bulls"
                  ? "border-[#519a7c] text-[#519a7c]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4" />
                <span>Toros</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("mating")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "mating"
                  ? "border-[#519a7c] text-[#519a7c]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Empadre</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Contenido de tabs */}
        <AnimatePresence mode="wait">
          {activeTab === "bulls" && (
            <motion.div
              key="bulls"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              {/* Estadísticas de toros */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard
                  title="Total Toros"
                  value={bullStatistics.total}
                  icon={<Crown className="w-8 h-8" />}
                  color="hover:bg-yellow-50"
                />
                <StatCard
                  title="Activos"
                  value={bullStatistics.active}
                  icon={<Zap className="w-8 h-8" />}
                  color="hover:bg-green-50"
                />
                <StatCard
                  title="Peso Promedio"
                  value={`${bullStatistics.avgWeight} kg`}
                  icon={<Scale className="w-8 h-8" />}
                  color="hover:bg-blue-50"
                />
                <StatCard
                  title="Edad Promedio"
                  value={`${bullStatistics.avgAge} años`}
                  icon={<Clock className="w-8 h-8" />}
                  color="hover:bg-purple-50"
                />
                <StatCard
                  title="Tasa Preñez Prom."
                  value={`${bullStatistics.avgPregnancyRate}%`}
                  icon={<TrendingUp className="w-8 h-8" />}
                  color="hover:bg-orange-50"
                />
              </motion.div>

              {/* Controles para toros */}
              <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, arete, registro..."
                      value={bullFilters.searchTerm}
                      onChange={(e) =>
                        setBullFilters(prev => ({ ...prev, searchTerm: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={handleNewBull}
                      className="inline-flex items-center px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Toro
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Grid de toros */}
              <motion.div variants={itemVariants}>
                {filteredBulls.length === 0 ? (
                  <div className="bg-white rounded-xl p-12 text-center shadow-md border border-gray-200">
                    <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No se encontraron toros
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No hay toros que coincidan con los filtros aplicados.
                    </p>
                    <button
                      type="button"
                      onClick={handleNewBull}
                      className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Registrar primer toro
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredBulls.map((bull) => (
                      <BullCard key={bull.id} bull={bull} />
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === "mating" && (
            <motion.div
              key="mating"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              {/* Estadísticas de empadre */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                <StatCard
                  title="Total Empadres"
                  value={matingStatistics.total}
                  icon={<Heart className="w-8 h-8" />}
                  color="hover:bg-pink-50"
                />
                <StatCard
                  title="Exitosos"
                  value={matingStatistics.successful}
                  icon={<CheckCircle className="w-8 h-8" />}
                  color="hover:bg-green-50"
                />
                <StatCard
                  title="Embarazadas"
                  value={matingStatistics.pregnant}
                  icon={<Users className="w-8 h-8" />}
                  color="hover:bg-purple-50"
                />
                <StatCard
                  title="Pendientes"
                  value={matingStatistics.pending}
                  icon={<Clock className="w-8 h-8" />}
                  color="hover:bg-yellow-50"
                />
                <StatCard
                  title="Tasa de Éxito"
                  value={`${matingStatistics.successRate}%`}
                  icon={<Target className="w-8 h-8" />}
                  color="hover:bg-blue-50"
                />
                <StatCard
                  title="Este Mes"
                  value={matingStatistics.thisMonth}
                  icon={<Calendar className="w-8 h-8" />}
                  color="hover:bg-orange-50"
                />
              </motion.div>

              {/* Controles para tabla de empadre */}
              <motion.div variants={itemVariants} className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por toro, vaca, arete..."
                      value={matingFilters.searchTerm}
                      onChange={(e) =>
                        setMatingFilters(prev => ({ ...prev, searchTerm: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleNewMating}
                      className="inline-flex items-center px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Empadre
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Tabla de empadre */}
              <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                {filteredMatingRecords.length === 0 ? (
                  <div className="p-12 text-center">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No se encontraron registros de empadre
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No hay registros de empadre que coincidan con los filtros aplicados.
                    </p>
                    <button
                      onClick={handleNewMating}
                      className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Registrar primer empadre
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Toro
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vaca
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha y Hora
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Resultado
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
                        {filteredMatingRecords.map((record) => (
                          <MatingRow key={record.id} record={record} />
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
        {selectedBull && (
          <BullDetailModal
            bull={selectedBull}
            isOpen={showBullDetail}
            onClose={() => {
              setShowBullDetail(false);
              setSelectedBull(null);
            }}
          />
        )}

        <BullFormModal
          bull={editingBull || undefined}
          isOpen={showBullForm}
          onClose={() => {
            setShowBullForm(false);
            setEditingBull(null);
          }}
          onSave={handleSaveBull}
        />

        {/* Componente de notificación */}
        <AnimatePresence>
          {notification.show && (
            <motion.div
              className="fixed top-4 right-4 z-50"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`
                px-6 py-4 rounded-lg shadow-lg border-l-4 min-w-80 max-w-96
                ${notification.type === "success" ? "bg-green-50 border-green-400 text-green-800" :
                  notification.type === "error" ? "bg-red-50 border-red-400 text-red-800" :
                  "bg-blue-50 border-blue-400 text-blue-800"}
              `}>
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    {notification.type === "success" && <CheckCircle className="w-5 h-5 text-green-400" />}
                    {notification.type === "error" && <XCircle className="w-5 h-5 text-red-400" />}
                    {notification.type === "info" && <Info className="w-5 h-5 text-blue-400" />}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{notification.message}</p>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setNotification(prev => ({ ...prev, show: false }))}
                      className={`
                        inline-flex rounded-md p-1.5 hover:bg-opacity-20 focus:outline-none
                        ${notification.type === "success" ? "text-green-500 hover:bg-green-100" :
                          notification.type === "error" ? "text-red-500 hover:bg-red-100" :
                          "text-blue-500 hover:bg-blue-100"}
                      `}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BullManagement;