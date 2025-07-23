import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Thermometer,
  AlertTriangle,
  MapPin,
  Search,
  Plus,
  Activity,
  Stethoscope,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  BarChart3,
  X,
  Save,
  Navigation,
} from "lucide-react";
// Nota: Para usar Leaflet, necesitas instalar las dependencias:
// npm install react-leaflet leaflet @types/leaflet
// Por ahora usaremos un mapa simulado

// Interfaces para tipos de datos
interface DiseaseRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  diseaseName: string;
  diseaseType: "viral" | "bacterial" | "parasitic" | "metabolic" | "genetic" | "injury";
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "treating" | "recovered" | "chronic" | "deceased";
  symptoms: string[];
  diagnosisDate: Date;
  recoveryDate?: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
    sector: string;
  };
  veterinarian: string;
  treatment?: string;
  medications: string[];
  notes: string;
  isContagious: boolean;
  quarantineRequired: boolean;
  followUpDate?: Date;
  cost: number;
  actions: string[];
}

interface DiseaseStats {
  totalCases: number;
  activeCases: number;
  recoveredCases: number;
  criticalCases: number;
  newCasesThisWeek: number;
  recoveryRate: number;
  averageRecoveryTime: number;
  mostCommonDisease: string;
  affectedSectors: number;
  totalCost: number;
}

interface NewDiseaseForm {
  animalId: string;
  animalName: string;
  animalTag: string;
  diseaseName: string;
  diseaseType: "viral" | "bacterial" | "parasitic" | "metabolic" | "genetic" | "injury";
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "treating" | "recovered" | "chronic" | "deceased";
  symptoms: string[];
  treatment: string;
  medications: string[];
  notes: string;
  isContagious: boolean;
  quarantineRequired: boolean;
  followUpDate: string;
  cost: number;
  actions: string[];
  latitude: number;
  longitude: number;
  address: string;
  sector: string;
  veterinarian: string;
}

// Componentes reutilizables
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-600 mt-1">{children}</p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "danger" | "success";
  size?: "sm" | "default";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}> = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  type = "button",
  disabled = false,
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  };
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm",
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

const Badge: React.FC<{
  children: React.ReactNode;
  variant: string;
  className?: string;
}> = ({ children, variant, className = "" }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "critical": return "bg-red-100 text-red-800 border-red-200";
      case "high": return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": return "bg-green-100 text-green-800 border-green-200";
      case "active": return "bg-red-100 text-red-800 border-red-200";
      case "treating": return "bg-blue-100 text-blue-800 border-blue-200";
      case "recovered": return "bg-green-100 text-green-800 border-green-200";
      case "chronic": return "bg-purple-100 text-purple-800 border-purple-200";
      case "deceased": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(variant)} ${className}`}
    >
      {children}
    </span>
  );
};

// Modal para nuevo caso de enfermedad
const NewDiseaseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewDiseaseForm) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<NewDiseaseForm>({
    animalId: "",
    animalName: "",
    animalTag: "",
    diseaseName: "",
    diseaseType: "viral",
    severity: "low",
    status: "active",
    symptoms: [],
    treatment: "",
    medications: [],
    notes: "",
    isContagious: false,
    quarantineRequired: false,
    followUpDate: "",
    cost: 0,
    actions: [],
    latitude: 17.9869, // Coordenadas por defecto de Villahermosa, Tabasco
    longitude: -92.9303,
    address: "",
    sector: "",
    veterinarian: "",
  });

  const [currentSymptom, setCurrentSymptom] = useState("");
  const [currentMedication, setCurrentMedication] = useState("");
  const [currentAction, setCurrentAction] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }));
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          setIsGettingLocation(false);
          alert("No se pudo obtener la ubicación actual. Se usarán las coordenadas por defecto.");
        }
      );
    } else {
      alert("Geolocalización no soportada por este navegador.");
      setIsGettingLocation(false);
    }
  };

  // Agregar síntoma
  const addSymptom = () => {
    if (currentSymptom.trim() && !formData.symptoms.includes(currentSymptom.trim())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, currentSymptom.trim()]
      }));
      setCurrentSymptom("");
    }
  };

  // Agregar medicamento
  const addMedication = () => {
    if (currentMedication.trim() && !formData.medications.includes(currentMedication.trim())) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, currentMedication.trim()]
      }));
      setCurrentMedication("");
    }
  };

  // Agregar acción
  const addAction = () => {
    if (currentAction.trim() && !formData.actions.includes(currentAction.trim())) {
      setFormData(prev => ({
        ...prev,
        actions: [...prev.actions, currentAction.trim()]
      }));
      setCurrentAction("");
    }
  };

  // Remover elemento de array
  const removeFromArray = (array: string[], index: number, field: keyof NewDiseaseForm) => {
    const newArray = array.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones básicas
    if (!formData.animalName || !formData.diseaseName || !formData.veterinarian) {
      alert("Por favor complete los campos obligatorios: Nombre del animal, enfermedad y veterinario");
      return;
    }

    onSave(formData);
  };

  const resetForm = () => {
    setFormData({
      animalId: "",
      animalName: "",
      animalTag: "",
      diseaseName: "",
      diseaseType: "viral",
      severity: "low",
      status: "active",
      symptoms: [],
      treatment: "",
      medications: [],
      notes: "",
      isContagious: false,
      quarantineRequired: false,
      followUpDate: "",
      cost: 0,
      actions: [],
      latitude: 17.9869,
      longitude: -92.9303,
      address: "",
      sector: "",
      veterinarian: "",
    });
    setCurrentSymptom("");
    setCurrentMedication("");
    setCurrentAction("");
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Registrar Nuevo Plan de Enfermedad</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Animal */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID del Animal *
              </label>
              <input
                type="text"
                value={formData.animalId}
                onChange={(e) => setFormData(prev => ({ ...prev, animalId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="COW001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Animal *
              </label>
              <input
                type="text"
                value={formData.animalName}
                onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Bessie"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiqueta/TAG
              </label>
              <input
                type="text"
                value={formData.animalTag}
                onChange={(e) => setFormData(prev => ({ ...prev, animalTag: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="TAG-001"
              />
            </div>
          </div>

          {/* Información de la Enfermedad */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Enfermedad *
              </label>
              <input
                type="text"
                value={formData.diseaseName}
                onChange={(e) => setFormData(prev => ({ ...prev, diseaseName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mastitis"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Enfermedad
              </label>
              <select
                value={formData.diseaseType}
                onChange={(e) => setFormData(prev => ({ ...prev, diseaseType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="viral">Viral</option>
                <option value="bacterial">Bacteriana</option>
                <option value="parasitic">Parasitaria</option>
                <option value="metabolic">Metabólica</option>
                <option value="genetic">Genética</option>
                <option value="injury">Lesión</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severidad
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>

          {/* Estado y Veterinario */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de la Enfermedad
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Activa</option>
                <option value="treating">En tratamiento</option>
                <option value="recovered">Recuperada</option>
                <option value="chronic">Crónica</option>
                <option value="deceased">Fallecido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Veterinario *
              </label>
              <input
                type="text"
                value={formData.veterinarian}
                onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Dr. García"
                required
              />
            </div>
          </div>

          {/* Síntomas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Síntomas
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agregar síntoma"
              />
              <Button type="button" onClick={addSymptom}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.symptoms.map((symptom, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {symptom}
                  <button
                    type="button"
                    onClick={() => removeFromArray(formData.symptoms, index, 'symptoms')}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Medicamentos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicamentos
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentMedication}
                onChange={(e) => setCurrentMedication(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agregar medicamento"
              />
              <Button type="button" onClick={addMedication}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.medications.map((medication, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {medication}
                  <button
                    type="button"
                    onClick={() => removeFromArray(formData.medications, index, 'medications')}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Acciones a Tomar */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Acciones a Tomar
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentAction}
                onChange={(e) => setCurrentAction(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAction())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agregar acción"
              />
              <Button type="button" onClick={addAction}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.actions.map((action, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                >
                  {action}
                  <button
                    type="button"
                    onClick={() => removeFromArray(formData.actions, index, 'actions')}
                    className="ml-2 text-orange-600 hover:text-orange-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Tratamiento y Notas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tratamiento
              </label>
              <textarea
                value={formData.treatment}
                onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Describa el tratamiento..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Notas adicionales..."
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ubicación donde se enfermó
            </label>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Latitud</label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Longitud</label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Establo A"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Sector</label>
                <input
                  type="text"
                  value={formData.sector}
                  onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Sector A"
                />
              </div>
            </div>
            <Button
              type="button"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              variant="outline"
              className="mb-4"
            >
              <Navigation className="w-4 h-4 mr-2" />
              {isGettingLocation ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
            </Button>
          </div>

          {/* Opciones adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isContagious"
                checked={formData.isContagious}
                onChange={(e) => setFormData(prev => ({ ...prev, isContagious: e.target.checked }))}
                className="rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="isContagious" className="text-sm text-gray-700">
                ¿Es contagiosa?
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="quarantineRequired"
                checked={formData.quarantineRequired}
                onChange={(e) => setFormData(prev => ({ ...prev, quarantineRequired: e.target.checked }))}
                className="rounded border-gray-300 focus:ring-blue-500"
              />
              <label htmlFor="quarantineRequired" className="text-sm text-gray-700">
                ¿Requiere cuarentena?
              </label>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Fecha de seguimiento
              </label>
              <input
                type="date"
                value={formData.followUpDate}
                onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Costo */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo del Tratamiento (MXN)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              <Save className="w-4 h-4 mr-2" />
              Guardar Plan de Enfermedad
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente de Mapa de Enfermedades (Simulado)
const DiseaseMap: React.FC<{ diseases: DiseaseRecord[] }> = ({ diseases }) => {
  return (
    <div className="h-96 bg-gray-100 rounded-lg overflow-hidden relative">
      {/* Fondo del mapa simulado */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100"></div>
      
      {/* Grid simulado del mapa */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#888" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Título del mapa */}
      <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-md z-10">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium">Villahermosa, Tabasco</span>
        </div>
      </div>

      {/* Marcadores simulados */}
      <div className="absolute inset-0">
        {diseases.map((disease) => {
          // Calcular posición relativa basada en las coordenadas
          const x = ((disease.location.lng + 93) * 100) % 80 + 10; // Simulado
          const y = ((18 - disease.location.lat) * 100) % 70 + 15; // Simulado
          
          return (
            <div
              key={disease.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className="relative group">
                {/* Marcador */}
                <div className={`w-6 h-6 rounded-full border-2 border-white shadow-lg cursor-pointer ${
                  disease.severity === 'critical' ? 'bg-red-500' :
                  disease.severity === 'high' ? 'bg-orange-500' :
                  disease.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  <div className="absolute inset-0 rounded-full animate-ping opacity-75 bg-current"></div>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-30">
                  <h4 className="font-semibold text-sm">{disease.animalName}</h4>
                  <p className="text-xs text-gray-600">{disease.diseaseName}</p>
                  <p className="text-xs text-gray-600">{disease.location.address}</p>
                  <div className="mt-1">
                    <Badge variant={disease.severity} className="text-xs">
                      {disease.severity === 'low' ? 'Baja' : 
                       disease.severity === 'medium' ? 'Media' :
                       disease.severity === 'high' ? 'Alta' : 'Crítica'}
                    </Badge>
                  </div>
                  {/* Flecha del tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda del mapa */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg px-3 py-2 shadow-md z-10">
        <div className="text-xs font-medium text-gray-700 mb-2">Severidad</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-xs text-gray-600">Baja</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-xs text-gray-600">Media</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-xs text-gray-600">Alta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-xs text-gray-600">Crítica</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const DiseaseTracking: React.FC = () => {
  // Estados del componente
  const [diseases, setDiseases] = useState<DiseaseRecord[]>([]);
  const [stats, setStats] = useState<DiseaseStats>({
    totalCases: 0,
    activeCases: 0,
    recoveredCases: 0,
    criticalCases: 0,
    newCasesThisWeek: 0,
    recoveryRate: 0,
    averageRecoveryTime: 0,
    mostCommonDisease: "",
    affectedSectors: 0,
    totalCost: 0,
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSeverity] = useState<string>("all");
  const [isNewDiseaseModalOpen, setIsNewDiseaseModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simulación de datos
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Datos de ejemplo para enfermedades
      const mockDiseases: DiseaseRecord[] = [
        {
          id: "1",
          animalId: "COW001",
          animalName: "Bessie",
          animalTag: "TAG-001",
          diseaseName: "Mastitis",
          diseaseType: "bacterial",
          severity: "high",
          status: "treating",
          symptoms: ["Inflamación de ubre", "Fiebre", "Pérdida de apetito"],
          diagnosisDate: new Date("2025-07-10"),
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Establo Principal, Sector A",
            sector: "A",
          },
          veterinarian: "Dr. García",
          treatment: "Antibióticos y antiinflamatorios",
          medications: ["Penicilina", "Ibuprofeno"],
          notes: "Responde bien al tratamiento. Seguimiento diario.",
          isContagious: false,
          quarantineRequired: false,
          followUpDate: new Date("2025-07-15"),
          cost: 2500,
          actions: ["Aplicar antibiótico cada 12h", "Monitoreo diario", "Aislamiento preventivo"],
        },
        {
          id: "2",
          animalId: "COW002",
          animalName: "Luna",
          animalTag: "TAG-002",
          diseaseName: "Neumonía",
          diseaseType: "viral",
          severity: "critical",
          status: "active",
          symptoms: ["Dificultad respiratoria", "Tos", "Fiebre alta", "Letargo"],
          diagnosisDate: new Date("2025-07-12"),
          location: {
            lat: 17.9719,
            lng: -92.9456,
            address: "Pastizal Norte, Sector B",
            sector: "B",
          },
          veterinarian: "Dr. Martínez",
          treatment: "Oxigenoterapia y medicamentos antivirales",
          medications: ["Ribavirina", "Dexametasona"],
          notes: "Caso crítico. Requiere monitoreo constante.",
          isContagious: true,
          quarantineRequired: true,
          followUpDate: new Date("2025-07-14"),
          cost: 5000,
          actions: ["Aislamiento inmediato", "Oxigenoterapia continua", "Monitoreo vital cada 4h"],
        },
      ];

      setDiseases(mockDiseases);

      // Calcular estadísticas
      const newStats: DiseaseStats = {
        totalCases: mockDiseases.length,
        activeCases: mockDiseases.filter(d => d.status === "active" || d.status === "treating").length,
        recoveredCases: mockDiseases.filter(d => d.status === "recovered").length,
        criticalCases: mockDiseases.filter(d => d.severity === "critical").length,
        newCasesThisWeek: mockDiseases.filter(d => {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return d.diagnosisDate >= weekAgo;
        }).length,
        recoveryRate: 85,
        averageRecoveryTime: 14,
        mostCommonDisease: "Mastitis",
        affectedSectors: 2,
        totalCost: mockDiseases.reduce((sum, d) => sum + d.cost, 0),
      };

      setStats(newStats);
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Función para manejar nuevo caso de enfermedad
  const handleNewDisease = async (formData: NewDiseaseForm) => {
    try {
      const newDisease: DiseaseRecord = {
        id: Date.now().toString(),
        animalId: formData.animalId || `COW${Date.now()}`,
        animalName: formData.animalName,
        animalTag: formData.animalTag || `TAG-${Date.now()}`,
        diseaseName: formData.diseaseName,
        diseaseType: formData.diseaseType,
        severity: formData.severity,
        status: formData.status,
        symptoms: formData.symptoms,
        diagnosisDate: new Date(),
        location: {
          lat: formData.latitude,
          lng: formData.longitude,
          address: formData.address,
          sector: formData.sector,
        },
        veterinarian: formData.veterinarian,
        treatment: formData.treatment,
        medications: formData.medications,
        notes: formData.notes,
        isContagious: formData.isContagious,
        quarantineRequired: formData.quarantineRequired,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : undefined,
        cost: formData.cost,
        actions: formData.actions,
      };

      // TODO: Aquí se haría la llamada al backend
      console.log("Nuevo caso de enfermedad:", newDisease);

      // Agregar a la lista local
      setDiseases(prev => [newDisease, ...prev]);

      // Actualizar estadísticas
      setStats(prev => ({
        ...prev,
        totalCases: prev.totalCases + 1,
        activeCases: prev.activeCases + (newDisease.status === "active" || newDisease.status === "treating" ? 1 : 0),
        criticalCases: prev.criticalCases + (newDisease.severity === "critical" ? 1 : 0),
        totalCost: prev.totalCost + newDisease.cost,
      }));

      setIsNewDiseaseModalOpen(false);
      alert("Caso de enfermedad registrado exitosamente");
    } catch (error) {
      console.error("Error registrando enfermedad:", error);
      alert("Error al registrar el caso de enfermedad");
    }
  };

  // Filtrar enfermedades
  const filteredDiseases = diseases.filter(disease => {
    const matchesSearch = disease.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          disease.diseaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          disease.animalTag.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || disease.status === selectedStatus;
    const matchesSeverity = selectedSeverity === "all" || disease.severity === selectedSeverity;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando sistema de seguimiento de enfermedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de la página */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Stethoscope className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Seguimiento de Enfermedades</h1>
                <p className="text-sm text-gray-600">Sistema integral de control sanitario</p>
              </div>
            </div>
            <Button
              onClick={() => setIsNewDiseaseModalOpen(true)}
              variant="success"
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nuevo Plan
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Activity className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total de Casos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Casos Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.activeCases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Recuperados</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.recoveredCases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Casos Críticos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.criticalCases}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Mapa de enfermedades */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Mapa de Ubicaciones de Enfermedades
                </CardTitle>
                <CardDescription>
                  Visualización geográfica de casos de enfermedades registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DiseaseMap diseases={diseases} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Estadísticas adicionales */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Estadísticas Detalladas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tasa de Recuperación</span>
                  <span className="font-semibold text-green-600">{stats.recoveryRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tiempo Promedio de Recuperación</span>
                  <span className="font-semibold">{stats.averageRecoveryTime} días</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Enfermedad Más Común</span>
                  <span className="font-semibold">{stats.mostCommonDisease}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Sectores Afectados</span>
                  <span className="font-semibold">{stats.affectedSectors}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Costo Total</span>
                  <span className="font-semibold text-red-600">${stats.totalCost.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Lista de casos de enfermedades */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Casos de Enfermedades</CardTitle>
                  <CardDescription>Lista detallada de todos los casos registrados</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  {/* Búsqueda */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                    />
                  </div>

                  {/* Filtro por estado */}
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="treating">En tratamiento</option>
                    <option value="recovered">Recuperado</option>
                    <option value="chronic">Crónico</option>
                    <option value="deceased">Fallecido</option>
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredDiseases.length === 0 ? (
                <div className="text-center py-12">
                  <Thermometer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No se encontraron casos que coincidan con los filtros</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ANIMAL</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ENFERMEDAD</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ESTADO</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">SEVERIDAD</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">UBICACIÓN</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-600">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody>
                      <AnimatePresence>
                        {filteredDiseases.map((disease, index) => (
                          <motion.tr
                            key={disease.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{disease.animalName}</p>
                                <p className="text-sm text-gray-600">{disease.animalTag}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="font-medium text-gray-900">{disease.diseaseName}</p>
                                <p className="text-sm text-gray-600 capitalize">{disease.diseaseType}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant={disease.status}>
                                {disease.status === 'active' ? 'Activo' :
                                 disease.status === 'treating' ? 'En tratamiento' :
                                 disease.status === 'recovered' ? 'Recuperado' :
                                 disease.status === 'chronic' ? 'Crónico' : 'Fallecido'}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <Badge variant={disease.severity}>
                                {disease.severity === 'low' ? 'Baja' :
                                 disease.severity === 'medium' ? 'Media' :
                                 disease.severity === 'high' ? 'Alta' : 'Crítica'}
                              </Badge>
                            </td>
                            <td className="py-4 px-4">
                              <div>
                                <p className="text-sm text-gray-900">{disease.location.address}</p>
                                <p className="text-xs text-gray-600">Sector {disease.location.sector}</p>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </AnimatePresence>
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal para nuevo caso de enfermedad */}
      <NewDiseaseModal
        isOpen={isNewDiseaseModalOpen}
        onClose={() => setIsNewDiseaseModalOpen(false)}
        onSave={handleNewDisease}
      />
    </div>
  );
};

export default DiseaseTracking;