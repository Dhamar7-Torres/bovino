import React, { useState, useEffect } from "react";
import {
  Thermometer,
  AlertTriangle,
  Search,
  Plus,
  Activity,
  Edit,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Trash2,
  Menu,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Stethoscope,
  DollarSign,
  Pill,
  FileText,
} from "lucide-react";

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

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

// ============================================================================
// COMPONENTES UI SIMPLES
// ============================================================================

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "danger" | "success";
  size?: "xs" | "sm" | "default";
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
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  };
  
  const sizeClasses = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
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
}> = ({ children, variant }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "critical": return "bg-red-50 text-red-700 ring-1 ring-red-600/20";
      case "high": return "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20";
      case "medium": return "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20";
      case "low": return "bg-green-50 text-green-700 ring-1 ring-green-600/20";
      case "active": return "bg-red-50 text-red-700 ring-1 ring-red-600/20";
      case "treating": return "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20";
      case "recovered": return "bg-green-50 text-green-700 ring-1 ring-green-600/20";
      case "chronic": return "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20";
      case "deceased": return "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20";
      default: return "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20";
    }
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getVariantClasses(variant)}`}>
      {children}
    </span>
  );
};

// ============================================================================
// COMPONENTE DE DISEASE CARD PARA MÓVILES
// ============================================================================
interface DiseaseCardProps {
  disease: DiseaseRecord;
  onEdit: (disease: DiseaseRecord) => void;
  onDelete: (disease: DiseaseRecord) => void;
}

const DiseaseCard: React.FC<DiseaseCardProps> = ({ disease, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'treating': return 'En tratamiento';
      case 'recovered': return 'Recuperado';
      case 'chronic': return 'Crónico';
      case 'deceased': return 'Fallecido';
      default: return status;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'low': return 'Baja';
      case 'medium': return 'Media';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return severity;
    }
  };

  const getDiseaseTypeLabel = (type: string) => {
    switch (type) {
      case 'viral': return 'Viral';
      case 'bacterial': return 'Bacteriana';
      case 'parasitic': return 'Parasitaria';
      case 'metabolic': return 'Metabólica';
      case 'genetic': return 'Genética';
      case 'injury': return 'Lesión';
      default: return type;
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden w-full">
      <div className="p-4 w-full">
        {/* Header compacto */}
        <div className="flex items-start justify-between mb-3 w-full">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {disease.animalName}
            </h3>
            <p className="text-sm text-gray-500 truncate">{disease.animalTag}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={disease.status}>{getStatusLabel(disease.status)}</Badge>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 flex-shrink-0"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Enfermedad y tipo */}
        <div className="mb-3 w-full">
          <p className="font-medium text-gray-900 mb-1 truncate">{disease.diseaseName}</p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={disease.severity}>{getSeverityLabel(disease.severity)}</Badge>
            <span className="text-sm text-gray-600 truncate">• {getDiseaseTypeLabel(disease.diseaseType)}</span>
          </div>
        </div>

        {/* Info básica siempre visible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3 w-full">
          <div className="flex items-center text-sm text-gray-600 min-w-0">
            <Stethoscope className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="truncate">{disease.veterinarian}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600 min-w-0">
            <DollarSign className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="font-medium truncate">${disease.cost.toLocaleString()}</span>
          </div>
        </div>

        {/* Información expandible */}
        {isExpanded && (
          <div className="border-t pt-3 space-y-3 animate-in slide-in-from-top-2 duration-200 w-full">
            {/* Fecha de diagnóstico */}
            <div className="flex items-center text-sm w-full">
              <Calendar className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Diagnóstico: </span>
              <span className="ml-1 font-medium">{disease.diagnosisDate.toLocaleDateString('es-ES')}</span>
            </div>

            {/* Ubicación */}
            <div className="flex items-start text-sm w-full">
              <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="text-gray-600">Sector {disease.location.sector}</span>
                <p className="text-gray-500 text-xs truncate">{disease.location.address}</p>
              </div>
            </div>

            {/* Síntomas */}
            {disease.symptoms.length > 0 && (
              <div className="w-full">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <AlertTriangle className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span>Síntomas ({disease.symptoms.length})</span>
                </div>
                <div className="flex flex-wrap gap-1 w-full">
                  {disease.symptoms.slice(0, 4).map((symptom, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs max-w-full"
                    >
                      <span className="truncate">{symptom}</span>
                    </span>
                  ))}
                  {disease.symptoms.length > 4 && (
                    <span className="text-xs text-gray-500 py-1">
                      +{disease.symptoms.length - 4} más
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Medicamentos */}
            {disease.medications.length > 0 && (
              <div className="w-full">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Pill className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                  <span>Medicamentos ({disease.medications.length})</span>
                </div>
                <div className="flex flex-wrap gap-1 w-full">
                  {disease.medications.slice(0, 3).map((medication, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs max-w-full"
                    >
                      <span className="truncate">{medication}</span>
                    </span>
                  ))}
                  {disease.medications.length > 3 && (
                    <span className="text-xs text-gray-500 py-1">
                      +{disease.medications.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tratamiento */}
            {disease.treatment && (
              <div className="flex items-start text-sm w-full">
                <FileText className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-gray-600">Tratamiento:</span>
                  <p className="text-gray-700 mt-1 break-words">{disease.treatment}</p>
                </div>
              </div>
            )}

            {/* Notas */}
            {disease.notes && (
              <div className="bg-gray-50 rounded-lg p-3 w-full">
                <p className="text-xs text-gray-500 mb-1">Notas</p>
                <p className="text-sm text-gray-700 break-words">{disease.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Acciones */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t w-full">
          <div className="flex items-center gap-1 text-xs text-gray-500 flex-wrap flex-1 min-w-0">
            {disease.isContagious && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full whitespace-nowrap">
                Contagioso
              </span>
            )}
            {disease.quarantineRequired && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full whitespace-nowrap">
                Cuarentena
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0 ml-2">
            <Button
              variant="outline"
              size="xs"
              onClick={() => onEdit(disease)}
              className="text-blue-600 hover:text-blue-700 border-blue-200"
            >
              <Edit className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">Editar</span>
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => onDelete(disease)}
              className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">Eliminar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL PARA NUEVO/EDITAR CASO
// ============================================================================

const DiseaseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewDiseaseForm) => void;
  editingDisease?: DiseaseRecord | null;
  isEditing?: boolean;
}> = ({ isOpen, onClose, onSave, editingDisease = null, isEditing = false }) => {
  
  const getInitialFormData = (): NewDiseaseForm => ({
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

  const [formData, setFormData] = useState<NewDiseaseForm>(getInitialFormData());
  const [currentSymptom, setCurrentSymptom] = useState("");
  const [currentMedication, setCurrentMedication] = useState("");

  const addSymptom = () => {
    if (currentSymptom.trim() && !formData.symptoms.includes(currentSymptom.trim())) {
      setFormData(prev => ({
        ...prev,
        symptoms: [...prev.symptoms, currentSymptom.trim()]
      }));
      setCurrentSymptom("");
    }
  };

  const addMedication = () => {
    if (currentMedication.trim() && !formData.medications.includes(currentMedication.trim())) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, currentMedication.trim()]
      }));
      setCurrentMedication("");
    }
  };

  const removeFromArray = (array: string[], index: number, field: keyof NewDiseaseForm) => {
    const newArray = array.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.animalName.trim()) {
      alert("El nombre del animal es requerido");
      return;
    }
    
    if (!formData.diseaseName.trim()) {
      alert("El nombre de la enfermedad es requerido");
      return;
    }
    
    if (!formData.veterinarian.trim()) {
      alert("El veterinario es requerido");
      return;
    }

    const cleanFormData: NewDiseaseForm = {
      ...formData,
      animalName: formData.animalName.trim(),
      diseaseName: formData.diseaseName.trim(),
      veterinarian: formData.veterinarian.trim(),
      treatment: formData.treatment.trim(),
      notes: formData.notes.trim(),
      address: formData.address.trim(),
      sector: formData.sector.trim(),
      animalId: formData.animalId.trim() || `COW${Date.now()}`,
      animalTag: formData.animalTag.trim() || `TAG-${Date.now()}`,
    };

    onSave(cleanFormData);
  };

  useEffect(() => {
    if (isOpen) {
      if (isEditing && editingDisease) {
        setFormData({
          animalId: editingDisease.animalId,
          animalName: editingDisease.animalName,
          animalTag: editingDisease.animalTag,
          diseaseName: editingDisease.diseaseName,
          diseaseType: editingDisease.diseaseType,
          severity: editingDisease.severity,
          status: editingDisease.status,
          symptoms: [...editingDisease.symptoms],
          treatment: editingDisease.treatment || "",
          medications: [...editingDisease.medications],
          notes: editingDisease.notes,
          isContagious: editingDisease.isContagious,
          quarantineRequired: editingDisease.quarantineRequired,
          followUpDate: editingDisease.followUpDate ? editingDisease.followUpDate.toISOString().split('T')[0] : "",
          cost: editingDisease.cost,
          actions: [...editingDisease.actions],
          latitude: editingDisease.location.lat,
          longitude: editingDisease.location.lng,
          address: editingDisease.location.address,
          sector: editingDisease.location.sector,
          veterinarian: editingDisease.veterinarian,
        });
      } else {
        setFormData(getInitialFormData());
        setCurrentSymptom("");
        setCurrentMedication("");
      }
    }
  }, [isOpen, isEditing, editingDisease]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl my-4 mx-2 max-h-[95vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gray-50 flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            {isEditing ? "Editar Caso" : "Nuevo Caso de Enfermedad"}
          </h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="space-y-6">
              
              {/* Información básica del animal */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Información del Animal</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Animal *
                    </label>
                    <input
                      type="text"
                      value={formData.animalName}
                      onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Bessie"
                      required
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Etiqueta del Animal
                    </label>
                    <input
                      type="text"
                      value={formData.animalTag}
                      onChange={(e) => setFormData(prev => ({ ...prev, animalTag: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: TAG-001"
                    />
                  </div>
                </div>
              </div>

              {/* Información de la enfermedad */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Información de la Enfermedad</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Enfermedad *
                    </label>
                    <input
                      type="text"
                      value={formData.diseaseName}
                      onChange={(e) => setFormData(prev => ({ ...prev, diseaseName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Mastitis"
                      required
                    />
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Veterinario *
                    </label>
                    <input
                      type="text"
                      value={formData.veterinarian}
                      onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Dr. García"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={formData.diseaseType}
                      onChange={(e) => setFormData(prev => ({ ...prev, diseaseType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="viral">Viral</option>
                      <option value="bacterial">Bacteriana</option>
                      <option value="parasitic">Parasitaria</option>
                      <option value="metabolic">Metabólica</option>
                      <option value="genetic">Genética</option>
                      <option value="injury">Lesión</option>
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severidad
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                  <div className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="active">Activo</option>
                      <option value="treating">En tratamiento</option>
                      <option value="recovered">Recuperado</option>
                      <option value="chronic">Crónico</option>
                      <option value="deceased">Fallecido</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Síntomas */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Síntomas</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentSymptom}
                    onChange={(e) => setCurrentSymptom(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSymptom())}
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Agregar síntoma"
                  />
                  <Button type="button" onClick={addSymptom} size="sm" className="flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.symptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm max-w-full"
                    >
                      <span className="truncate max-w-40">{symptom}</span>
                      <button
                        type="button"
                        onClick={() => removeFromArray(formData.symptoms, index, 'symptoms')}
                        className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Medicamentos */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Medicamentos</h3>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentMedication}
                    onChange={(e) => setCurrentMedication(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                    className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Agregar medicamento"
                  />
                  <Button type="button" onClick={addMedication} size="sm" className="flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.medications.map((medication, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm max-w-full"
                    >
                      <span className="truncate max-w-40">{medication}</span>
                      <button
                        type="button"
                        onClick={() => removeFromArray(formData.medications, index, 'medications')}
                        className="ml-2 text-blue-500 hover:text-blue-700 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tratamiento y ubicación */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="min-w-0">
                  <h3 className="text-base font-medium text-gray-900 mb-3">Tratamiento</h3>
                  <textarea
                    value={formData.treatment}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Descripción del tratamiento"
                    rows={4}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-medium text-gray-900 mb-3">Ubicación</h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Dirección"
                    />
                    <input
                      type="text"
                      value={formData.sector}
                      onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Sector"
                    />
                  </div>
                </div>
              </div>

              {/* Costo */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Información Económica</h3>
                <div className="max-w-sm">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Costo del Tratamiento (MXN)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Notas Adicionales</h3>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Observaciones adicionales"
                  rows={3}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50 flex-shrink-0">
          <Button type="button" variant="outline" onClick={onClose} className="order-2 sm:order-1 flex-shrink-0">
            Cancelar
          </Button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="order-1 sm:order-2 inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 px-4 py-2 text-sm flex-shrink-0"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "Actualizar" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL DE CONFIRMACIÓN PARA ELIMINAR
// ============================================================================

const DeleteModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  diseaseName: string;
  animalName: string;
}> = ({ isOpen, onClose, onConfirm, diseaseName, animalName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white/98 backdrop-blur-sm rounded-xl shadow-2xl w-full max-w-md border border-white/20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
              <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700 break-words">
              ¿Estás seguro de que deseas eliminar el caso de <strong className="break-words">{diseaseName}</strong> del animal{" "}
              <strong className="break-words">{animalName}</strong>?
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-3">
            <Button variant="outline" onClick={onClose} className="order-2 sm:order-1 flex-shrink-0">
              Cancelar
            </Button>
            <Button variant="danger" onClick={onConfirm} className="order-1 sm:order-2 flex-shrink-0">
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const DiseaseTracking: React.FC = () => {
  const [diseases, setDiseases] = useState<DiseaseRecord[]>([]);
  const [stats, setStats] = useState<DiseaseStats>({
    totalCases: 0,
    activeCases: 0,
    recoveredCases: 0,
    criticalCases: 0,
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [isMobile, setIsMobile] = useState<boolean>(true);

  // Detectar si es móvil y configurar vista por defecto
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setViewMode(mobile ? "cards" : "table");
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const calculateStats = (diseaseList: DiseaseRecord[]): DiseaseStats => {
    const activeCases = diseaseList.filter(d => d.status === "active" || d.status === "treating").length;
    const recoveredCases = diseaseList.filter(d => d.status === "recovered").length;
    const criticalCases = diseaseList.filter(d => d.severity === "critical").length;

    return {
      totalCases: diseaseList.length,
      activeCases,
      recoveredCases,
      criticalCases,
    };
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockDiseases: DiseaseRecord[] = [
        {
          id: "1",
          animalId: "COW001",
          animalName: "Bessie",
          animalTag: "TAG-001",
          diseaseName: "Mastitis Aguda",
          diseaseType: "bacterial",
          severity: "high",
          status: "treating",
          symptoms: ["Inflamación de ubre", "Fiebre alta", "Pérdida de apetito", "Leche con sangre"],
          diagnosisDate: new Date("2025-07-10"),
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Establo Principal, Área de Ordeño",
            sector: "A",
          },
          veterinarian: "Dr. García",
          treatment: "Antibióticos intravenosos, antiinflamatorios y terapia de apoyo",
          medications: ["Penicilina", "Ibuprofeno", "Suero fisiológico"],
          notes: "Responde bien al tratamiento. Seguimiento diario de temperatura y producción láctea.",
          isContagious: false,
          quarantineRequired: false,
          followUpDate: new Date("2025-07-15"),
          cost: 2500,
          actions: ["Aplicar antibiótico cada 12h", "Monitoreo diario"],
        },
        {
          id: "2",
          animalId: "COW002",
          animalName: "Luna",
          animalTag: "TAG-002",
          diseaseName: "Parasitosis Gastrointestinal",
          diseaseType: "parasitic",
          severity: "medium",
          status: "active",
          symptoms: ["Pérdida de peso", "Debilidad general", "Diarrea intermitente"],
          diagnosisDate: new Date("2025-07-08"),
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Pastizal Norte, Zona de Pastoreo",
            sector: "B",
          },
          veterinarian: "Dra. Martínez",
          treatment: "Desparasitante de amplio espectro y suplementos nutricionales",
          medications: ["Ivermectina", "Complejo B", "Vitaminas A-D-E"],
          notes: "Inicio de tratamiento antiparasitario. Separar del rebaño hasta nueva evaluación.",
          isContagious: true,
          quarantineRequired: true,
          followUpDate: new Date("2025-07-12"),
          cost: 850,
          actions: ["Desparasitante oral", "Aislamiento temporal"],
        },
        {
          id: "3",
          animalId: "COW003",
          animalName: "Esperanza",
          animalTag: "TAG-003",
          diseaseName: "Neumonía",
          diseaseType: "bacterial",
          severity: "critical",
          status: "treating",
          symptoms: ["Dificultad respiratoria", "Fiebre alta", "Secreción nasal", "Tos persistente"],
          diagnosisDate: new Date("2025-07-09"),
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Enfermería, Área de Cuidados Intensivos",
            sector: "C",
          },
          veterinarian: "Dr. García",
          treatment: "Antibióticos de amplio espectro, broncodilatadores y oxigenoterapia",
          medications: ["Amoxicilina", "Prednisolona", "Bromhexina"],
          notes: "Estado crítico. Requiere monitoreo constante y cuidados intensivos.",
          isContagious: true,
          quarantineRequired: true,
          followUpDate: new Date("2025-07-11"),
          cost: 4200,
          actions: ["Oxigenoterapia", "Antibióticos IV", "Monitoreo 24h"],
        }
      ];

      setDiseases(mockDiseases);
      setStats(calculateStats(mockDiseases));
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleNewDisease = (formData: NewDiseaseForm) => {
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

      const updatedDiseases = [newDisease, ...diseases];
      setDiseases(updatedDiseases);
      setStats(calculateStats(updatedDiseases));
      setIsModalOpen(false);
      alert("Caso registrado exitosamente");
    } catch (error) {
      console.error("Error registrando enfermedad:", error);
      alert("Error al registrar el caso");
    }
  };

  const handleEditDisease = (formData: NewDiseaseForm) => {
    if (!selectedDisease) return;

    try {
      const updatedDisease: DiseaseRecord = {
        ...selectedDisease,
        animalName: formData.animalName,
        animalTag: formData.animalTag,
        diseaseName: formData.diseaseName,
        diseaseType: formData.diseaseType,
        severity: formData.severity,
        status: formData.status,
        symptoms: formData.symptoms,
        veterinarian: formData.veterinarian,
        treatment: formData.treatment,
        medications: formData.medications,
        notes: formData.notes,
        cost: formData.cost,
        location: {
          lat: formData.latitude,
          lng: formData.longitude,
          address: formData.address,
          sector: formData.sector,
        },
      };

      const updatedDiseases = diseases.map(d => d.id === selectedDisease.id ? updatedDisease : d);
      setDiseases(updatedDiseases);
      setStats(calculateStats(updatedDiseases));
      setIsEditModalOpen(false);
      setSelectedDisease(null);
      alert("Caso actualizado exitosamente");
    } catch (error) {
      console.error("Error actualizando enfermedad:", error);
      alert("Error al actualizar el caso");
    }
  };

  const handleDeleteDisease = () => {
    if (!selectedDisease) return;

    try {
      const updatedDiseases = diseases.filter(d => d.id !== selectedDisease.id);
      setDiseases(updatedDiseases);
      setStats(calculateStats(updatedDiseases));
      setIsDeleteModalOpen(false);
      setSelectedDisease(null);
      alert("Caso eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando enfermedad:", error);
      alert("Error al eliminar el caso");
    }
  };

  const filteredDiseases = diseases.filter(disease => {
    const matchesSearch = disease.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          disease.diseaseName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || disease.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-3 sm:p-6 overflow-x-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-8 border border-white/30 max-w-sm w-full mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#519a7c] mx-auto"></div>
            <p className="mt-4 text-gray-700 font-medium">Cargando casos de enfermedades...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-3 sm:p-6 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6">
      
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg">
          Control de Enfermedades
        </h1>
        <p className="text-white/90 drop-shadow">
          Seguimiento y gestión de casos veterinarios
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-6 w-full">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-xl p-3 sm:p-6 border border-white/20 min-w-0">
          <div className="flex items-center">
            <Activity className="w-6 h-6 sm:w-10 sm:h-10 text-blue-200 flex-shrink-0" />
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-blue-100 truncate">Total de Casos</p>
              <p className="text-lg sm:text-2xl font-bold">{stats.totalCases}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-xl p-3 sm:p-6 border border-white/20 min-w-0">
          <div className="flex items-center">
            <AlertTriangle className="w-6 h-6 sm:w-10 sm:h-10 text-orange-200 flex-shrink-0" />
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-orange-100 truncate">Casos Activos</p>
              <p className="text-lg sm:text-2xl font-bold">{stats.activeCases}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-xl p-3 sm:p-6 border border-white/20 min-w-0">
          <div className="flex items-center">
            <CheckCircle className="w-6 h-6 sm:w-10 sm:h-10 text-green-200 flex-shrink-0" />
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-green-100 truncate">Recuperados</p>
              <p className="text-lg sm:text-2xl font-bold">{stats.recoveredCases}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-xl p-3 sm:p-6 border border-white/20 min-w-0">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 sm:w-10 sm:h-10 text-red-200 flex-shrink-0" />
            <div className="ml-2 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-red-100 truncate">Casos Críticos</p>
              <p className="text-lg sm:text-2xl font-bold">{stats.criticalCases}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles */}
      <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 w-full">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Thermometer className="w-6 h-6 text-red-500 flex-shrink-0" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">Casos de Enfermedades</h3>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              {!isMobile && (
                <Button
                  variant="outline"
                  onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
                  size="sm"
                >
                  <Menu className="w-4 h-4 mr-2" />
                  {viewMode === "table" ? "Cards" : "Tabla"}
                </Button>
              )}
              <Button onClick={() => setIsModalOpen(true)} variant="success" size="sm" className="whitespace-nowrap">
                <Plus className="w-4 h-4 mr-2" />
                <span className="hidden xs:inline">Nuevo Caso</span>
                <span className="xs:hidden">Nuevo</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar animal o enfermedad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full text-sm"
              />
            </div>

            <div className="flex-shrink-0 w-full sm:w-auto">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full sm:w-auto min-w-0"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activo</option>
                <option value="treating">En tratamiento</option>
                <option value="recovered">Recuperado</option>
                <option value="chronic">Crónico</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista responsive */}
        <div className="p-4 sm:p-6 w-full">
          {viewMode === "cards" || isMobile ? (
            // Vista de cards (por defecto en móvil)
            <div className="space-y-4 w-full">
              {filteredDiseases.length === 0 ? (
                <div className="text-center py-12 bg-white/90 rounded-xl border border-white/30">
                  <Thermometer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">No se encontraron casos</p>
                  <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
                </div>
              ) : (
                filteredDiseases.map((disease) => (
                  <DiseaseCard
                    key={disease.id}
                    disease={disease}
                    onEdit={(disease) => {
                      setSelectedDisease(disease);
                      setIsEditModalOpen(true);
                    }}
                    onDelete={(disease) => {
                      setSelectedDisease(disease);
                      setIsDeleteModalOpen(true);
                    }}
                  />
                ))
              )}
            </div>
          ) : (
            // Vista de tabla para desktop
            <div className="w-full overflow-x-auto">
              <div className="rounded-lg border border-white/30 bg-white/95 backdrop-blur-sm min-w-full">
                {filteredDiseases.length === 0 ? (
                  <div className="text-center py-12 bg-white/90 rounded-lg border border-white/30">
                    <Thermometer className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg font-medium">No se encontraron casos</p>
                  </div>
                ) : (
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-600 text-xs sm:text-sm w-48">ANIMAL</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-600 text-xs sm:text-sm w-48">ENFERMEDAD</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-600 text-xs sm:text-sm w-32">ESTADO</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-600 text-xs sm:text-sm w-32">SEVERIDAD</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-600 text-xs sm:text-sm w-40">VETERINARIO</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-600 text-xs sm:text-sm w-32">COSTO</th>
                        <th className="text-left py-3 px-2 sm:px-4 font-medium text-gray-600 text-xs sm:text-sm w-32">ACCIONES</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredDiseases.map((disease) => (
                        <tr key={disease.id} className="hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-2 sm:px-4 w-48">
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{disease.animalName}</p>
                              <p className="text-xs text-gray-500 truncate">{disease.animalTag}</p>
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4 w-48">
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 text-sm truncate">{disease.diseaseName}</p>
                              <p className="text-xs text-gray-500 capitalize truncate">{disease.diseaseType}</p>
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4 w-32">
                            <div className="min-w-0">
                              <Badge variant={disease.status}>
                                {disease.status === 'active' ? 'Activo' :
                                 disease.status === 'treating' ? 'Tratando' :
                                 disease.status === 'recovered' ? 'Recuperado' :
                                 disease.status === 'chronic' ? 'Crónico' : 'Fallecido'}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4 w-32">
                            <div className="min-w-0">
                              <Badge variant={disease.severity}>
                                {disease.severity === 'low' ? 'Baja' :
                                 disease.severity === 'medium' ? 'Media' :
                                 disease.severity === 'high' ? 'Alta' : 'Crítica'}
                              </Badge>
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4 w-40">
                            <div className="min-w-0">
                              <p className="text-sm text-gray-900 truncate">{disease.veterinarian}</p>
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4 w-32">
                            <div className="min-w-0">
                              <span className="font-medium text-gray-900 text-sm truncate">${disease.cost.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 sm:px-4 w-32">
                            <div className="flex items-center gap-1">
                              <Button 
                                variant="outline" 
                                size="xs"
                                onClick={() => {
                                  setSelectedDisease(disease);
                                  setIsEditModalOpen(true);
                                }}
                                className="text-blue-600 hover:text-blue-700 border-blue-200 flex-shrink-0"
                              >
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="xs"
                                onClick={() => {
                                  setSelectedDisease(disease);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 flex-shrink-0"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <DiseaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleNewDisease}
      />

      <DiseaseModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedDisease(null);
        }}
        onSave={handleEditDisease}
        editingDisease={selectedDisease}
        isEditing={true}
      />

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDisease(null);
        }}
        onConfirm={handleDeleteDisease}
        diseaseName={selectedDisease?.diseaseName || ""}
        animalName={selectedDisease?.animalName || ""}
      />
    </div>
    </div>
  );
};

export default DiseaseTracking;