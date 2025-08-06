import React, { useState, useEffect } from "react";

// ============================================================================
// CONFIGURACIÓN DE API PARA BACKEND EN PUERTO 5000
// ============================================================================

const API_BASE_URL = 'http://localhost:5000/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<ApiResponse> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    defaultOptions.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
};

// Servicio de API para enfermedades
const diseaseAPI = {
  getAll: (): Promise<ApiResponse> => apiRequest('/health/illnesses'),
  create: (diseaseData: any): Promise<ApiResponse> => apiRequest('/health/illnesses', {
    method: 'POST',
    body: diseaseData,
  }),
  update: (id: string, diseaseData: any): Promise<ApiResponse> => apiRequest(`/health/illnesses/${id}`, {
    method: 'PUT',
    body: diseaseData,
  }),
  delete: (id: string): Promise<ApiResponse> => apiRequest(`/health/illnesses/${id}`, {
    method: 'DELETE',
  }),
  ping: (): Promise<ApiResponse> => apiRequest('/ping'),
};

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

type DiseaseType = "viral" | "bacterial" | "parasitic" | "metabolic" | "genetic" | "injury";
type SeverityLevel = "low" | "medium" | "high" | "critical";
type DiseaseStatus = "active" | "treating" | "recovered" | "chronic" | "deceased";

interface DiseaseLocation {
  lat: number;
  lng: number;
  address: string;
  sector: string;
}

interface DiseaseRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  diseaseName: string;
  diseaseType: DiseaseType;
  severity: SeverityLevel;
  status: DiseaseStatus;
  symptoms: string[];
  diagnosisDate: Date;
  recoveryDate?: Date;
  location: DiseaseLocation;
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
  diseaseType: DiseaseType;
  severity: SeverityLevel;
  status: DiseaseStatus;
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

interface ConnectionStatus {
  isConnected: boolean;
  lastChecked: Date;
  error?: string;
}

// ============================================================================
// COMPONENTES UI REUTILIZABLES
// ============================================================================

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "danger" | "success";
  size?: "xs" | "sm" | "default";
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  type = "button",
  disabled = false,
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0";
  
  const variantClasses: Record<string, string> = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
  };
  
  const sizeClasses: Record<string, string> = {
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

interface BadgeProps {
  children: React.ReactNode;
  variant: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant }) => {
  const getVariantClasses = (variant: string): string => {
    const variants: Record<string, string> = {
      critical: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
      high: "bg-orange-50 text-orange-700 ring-1 ring-orange-600/20",
      medium: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20",
      low: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
      active: "bg-red-50 text-red-700 ring-1 ring-red-600/20",
      treating: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20",
      recovered: "bg-green-50 text-green-700 ring-1 ring-green-600/20",
      chronic: "bg-purple-50 text-purple-700 ring-1 ring-purple-600/20",
      deceased: "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20",
    };
    
    return variants[variant] || "bg-gray-50 text-gray-700 ring-1 ring-gray-600/20";
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium flex-shrink-0 ${getVariantClasses(variant)}`}>
      {children}
    </span>
  );
};

// ============================================================================
// COMPONENTE DE ESTADO DE CONEXIÓN
// ============================================================================

interface ConnectionStatusProps {
  status: ConnectionStatus;
  onTestConnection: () => void;
}

const ConnectionStatusComponent: React.FC<ConnectionStatusProps> = ({ status, onTestConnection }) => {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
      status.isConnected 
        ? 'bg-green-50 border-green-200 text-green-700' 
        : 'bg-red-50 border-red-200 text-red-700'
    }`}>
      <div className={`w-3 h-3 rounded-full ${status.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
      <span className="text-xs sm:text-sm font-medium">
        {status.isConnected ? 'Conectado' : 'Desconectado'}
      </span>
      <button
        onClick={onTestConnection}
        className="text-xs underline hover:no-underline ml-2"
      >
        Probar Conexión
      </button>
      {status.error && (
        <span className="text-xs opacity-75">({status.error})</span>
      )}
    </div>
  );
};

// ============================================================================
// COMPONENTE TARJETA DE ENFERMEDAD
// ============================================================================

interface DiseaseCardProps {
  disease: DiseaseRecord;
  onEdit: (disease: DiseaseRecord) => void;
  onDelete: (disease: DiseaseRecord) => void;
}

const DiseaseCard: React.FC<DiseaseCardProps> = ({ disease, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusLabel = (status: DiseaseStatus): string => {
    const labels: Record<DiseaseStatus, string> = {
      'active': 'Activo',
      'treating': 'En tratamiento',
      'recovered': 'Recuperado',
      'chronic': 'Crónico',
      'deceased': 'Fallecido'
    };
    return labels[status] || status;
  };

  const getSeverityLabel = (severity: SeverityLevel): string => {
    const labels: Record<SeverityLevel, string> = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta',
      'critical': 'Crítica'
    };
    return labels[severity] || severity;
  };

  const getDiseaseTypeLabel = (type: DiseaseType): string => {
    const labels: Record<DiseaseType, string> = {
      'viral': 'Viral',
      'bacterial': 'Bacteriana',
      'parasitic': 'Parasitaria',
      'metabolic': 'Metabólica',
      'genetic': 'Genética',
      'injury': 'Lesión'
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm rounded-lg sm:rounded-xl shadow-lg border border-white/20 overflow-hidden w-full">
      <div className="p-4 w-full">
        {/* Header de la tarjeta */}
        <div className="flex items-start justify-between mb-3 w-full">
          <div className="flex-1 min-w-0 pr-2 overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {disease.animalName}
            </h3>
            <p className="text-sm text-gray-500 truncate">{disease.animalTag}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Badge variant={disease.status}>{getStatusLabel(disease.status)}</Badge>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              {isExpanded ? '▲' : '▼'}
            </button>
          </div>
        </div>

        {/* Información principal */}
        <div className="mb-3 w-full overflow-hidden">
          <p className="font-medium text-gray-900 mb-2 truncate">{disease.diseaseName}</p>
          <div className="flex items-center gap-2 flex-wrap w-full">
            <Badge variant={disease.severity}>{getSeverityLabel(disease.severity)}</Badge>
            <span className="text-sm text-gray-600 truncate">
              • {getDiseaseTypeLabel(disease.diseaseType)}
            </span>
          </div>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-1 gap-3 mb-3 w-full">
          <div className="flex items-center text-sm text-gray-600 overflow-hidden">
            <span className="mr-2">👨‍⚕️</span>
            <span className="truncate flex-1">{disease.veterinarian}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <span className="mr-2">💰</span>
            <span className="font-medium">${disease.cost.toLocaleString()}</span>
          </div>
        </div>

        {/* Información expandible */}
        {isExpanded && (
          <div className="border-t pt-3 space-y-3 w-full overflow-hidden">
            {/* Fecha de diagnóstico */}
            <div className="flex items-center text-sm w-full">
              <span className="mr-2">📅</span>
              <span className="text-gray-600 flex-shrink-0">Diagnóstico: </span>
              <span className="ml-1 font-medium truncate">
                {disease.diagnosisDate.toLocaleDateString('es-ES')}
              </span>
            </div>

            {/* Ubicación */}
            <div className="flex items-start text-sm w-full">
              <span className="mr-2 mt-0.5">📍</span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <span className="text-gray-600">Sector {disease.location.sector}</span>
                <p className="text-gray-500 text-xs truncate mt-1">{disease.location.address}</p>
              </div>
            </div>

            {/* Síntomas */}
            {disease.symptoms.length > 0 && (
              <div className="w-full">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="mr-2">⚠️</span>
                  <span>Síntomas ({disease.symptoms.length})</span>
                </div>
                <div className="flex flex-wrap gap-1 w-full">
                  {disease.symptoms.slice(0, 3).map((symptom, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-red-50 text-red-700 rounded-md text-xs"
                    >
                      {symptom}
                    </span>
                  ))}
                  {disease.symptoms.length > 3 && (
                    <span className="text-xs text-gray-500 py-1">
                      +{disease.symptoms.length - 3} más
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Medicamentos */}
            {disease.medications.length > 0 && (
              <div className="w-full">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <span className="mr-2">💊</span>
                  <span>Medicamentos ({disease.medications.length})</span>
                </div>
                <div className="flex flex-wrap gap-1 w-full">
                  {disease.medications.slice(0, 3).map((medication, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs"
                    >
                      {medication}
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
                <span className="mr-2 mt-0.5">📋</span>
                <div className="min-w-0 flex-1 overflow-hidden">
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
          <div className="flex items-center gap-1 text-xs text-gray-500 flex-wrap flex-1 overflow-hidden">
            {disease.isContagious && (
              <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs">
                Contagioso
              </span>
            )}
            {disease.quarantineRequired && (
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs">
                Cuarentena
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="xs"
              onClick={() => onEdit(disease)}
              className="text-blue-600 hover:text-blue-700"
            >
              ✏️ Editar
            </Button>
            <Button
              variant="outline"
              size="xs"
              onClick={() => onDelete(disease)}
              className="text-red-600 hover:text-red-700"
            >
              🗑️ Eliminar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL PARA CREAR/EDITAR CASO
// ============================================================================

interface DiseaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewDiseaseForm) => void;
  editingDisease?: DiseaseRecord | null;
  isEditing?: boolean;
}

const DiseaseModal: React.FC<DiseaseModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingDisease = null, 
  isEditing = false 
}) => {
  
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

  const removeSymptom = (index: number) => {
    const newSymptoms = formData.symptoms.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, symptoms: newSymptoms }));
  };

  const removeMedication = (index: number) => {
    const newMedications = formData.medications.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, medications: newMedications }));
  };

  const handleSubmit = () => {
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
    <div className="fixed inset-0 bg-black/50 z-50 overflow-hidden">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
          {/* Header del modal */}
          <div className="flex items-center justify-between p-6 border-b bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditing ? "Editar Caso" : "Nuevo Caso de Enfermedad"}
            </h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              
              {/* Información básica del animal */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3">Información del Animal</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
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
                  <div>
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
                  <div>
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
                  <div>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={formData.diseaseType}
                      onChange={(e) => setFormData(prev => ({ ...prev, diseaseType: e.target.value as DiseaseType }))}
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severidad
                    </label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as SeverityLevel }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estado
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as DiseaseStatus }))}
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Agregar síntoma"
                  />
                  <Button type="button" onClick={addSymptom} size="sm">
                    ➕ Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.symptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm"
                    >
                      {symptom}
                      <button
                        type="button"
                        onClick={() => removeSymptom(index)}
                        className="ml-2 text-red-500 hover:text-red-700"
                      >
                        ✕
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
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Agregar medicamento"
                  />
                  <Button type="button" onClick={addMedication} size="sm">
                    ➕ Agregar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.medications.map((medication, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {medication}
                      <button
                        type="button"
                        onClick={() => removeMedication(index)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Tratamiento y Ubicación */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-base font-medium text-gray-900 mb-3">Tratamiento</h3>
                  <textarea
                    value={formData.treatment}
                    onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Descripción del tratamiento"
                    rows={4}
                  />
                </div>
                <div>
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
                <div className="max-w-xs">
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

          {/* Footer con botones */}
          <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              variant="success"
            >
              💾 {isEditing ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// MODAL DE CONFIRMACIÓN PARA ELIMINAR
// ============================================================================

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  diseaseName: string;
  animalName: string;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, onConfirm, diseaseName, animalName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 overflow-hidden">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
                <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-700">
                ¿Estás seguro de que deseas eliminar el caso de{" "}
                <strong>{diseaseName}</strong> del animal{" "}
                <strong>{animalName}</strong>?
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button variant="danger" onClick={onConfirm}>
                🗑️ Eliminar
              </Button>
            </div>
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
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    isConnected: false,
    lastChecked: new Date(),
  });

  // Función para transformar datos del backend al formato del frontend
  const transformBackendData = (backendData: any): DiseaseRecord => {
    return {
      id: backendData.id || Date.now().toString(),
      animalId: backendData.animalId || backendData.bovineId || 'N/A',
      animalName: backendData.animalName || backendData.bovineName || 'Animal sin nombre',
      animalTag: backendData.animalTag || backendData.bovineTag || 'Sin etiqueta',
      diseaseName: backendData.diseaseName || backendData.diagnosisInfo?.condition || 'Enfermedad sin especificar',
      diseaseType: backendData.diseaseType || backendData.diagnosisInfo?.classification || 'viral',
      severity: backendData.severity || backendData.diagnosisInfo?.severity || 'low',
      status: backendData.status || 'active',
      symptoms: backendData.symptoms || backendData.clinicalData?.symptoms || [],
      diagnosisDate: backendData.diagnosisDate ? new Date(backendData.diagnosisDate) : new Date(),
      recoveryDate: backendData.recoveryDate ? new Date(backendData.recoveryDate) : undefined,
      location: {
        lat: backendData.location?.lat || backendData.latitude || 17.9869,
        lng: backendData.location?.lng || backendData.longitude || -92.9303,
        address: backendData.location?.address || backendData.address || '',
        sector: backendData.location?.sector || backendData.sector || '',
      },
      veterinarian: backendData.veterinarian || backendData.veterinarianId || 'Dr. Sin asignar',
      treatment: backendData.treatment || backendData.treatmentPlan?.description || '',
      medications: backendData.medications || backendData.treatmentPlan?.medications || [],
      notes: backendData.notes || '',
      isContagious: backendData.isContagious || false,
      quarantineRequired: backendData.quarantineRequired || false,
      followUpDate: backendData.followUpDate ? new Date(backendData.followUpDate) : undefined,
      cost: backendData.cost || backendData.totalCost || 0,
      actions: backendData.actions || [],
    };
  };

  // Función para transformar datos del frontend al formato del backend
  const transformToBackendFormat = (frontendData: NewDiseaseForm): any => {
    return {
      animalId: frontendData.animalId,
      animalName: frontendData.animalName,
      animalTag: frontendData.animalTag,
      diseaseName: frontendData.diseaseName,
      diagnosisInfo: {
        condition: frontendData.diseaseName,
        classification: frontendData.diseaseType,
        severity: frontendData.severity,
      },
      clinicalData: {
        symptoms: frontendData.symptoms,
        vitalSigns: {},
        physicalExamination: frontendData.treatment,
      },
      treatmentPlan: {
        description: frontendData.treatment,
        medications: frontendData.medications,
        startDate: new Date().toISOString(),
      },
      epidemiologyInfo: {
        caseClassification: frontendData.status,
        isContagious: frontendData.isContagious,
        quarantineRequired: frontendData.quarantineRequired,
      },
      veterinarianId: frontendData.veterinarian,
      diagnosisDate: new Date().toISOString(),
      totalCost: frontendData.cost,
      notes: frontendData.notes,
      reportableDisease: false,
      location: {
        lat: frontendData.latitude,
        lng: frontendData.longitude,
        address: frontendData.address,
        sector: frontendData.sector,
      },
    };
  };

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

  // Función para probar la conexión
  const testConnection = async (): Promise<void> => {
    try {
      await diseaseAPI.ping();
      setConnectionStatus({
        isConnected: true,
        lastChecked: new Date(),
      });
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Error desconocido',
      });
    }
  };

  // Cargar datos desde el backend
  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Probar conexión primero
      await testConnection();
      
      // Cargar enfermedades
      const response = await diseaseAPI.getAll();
      
      if (response.success && response.data) {
        // Si response.data es un array, úsalo directamente
        const diseaseData = Array.isArray(response.data) ? response.data : response.data.illnesses || [];
        const transformedDiseases = diseaseData.map(transformBackendData);
        setDiseases(transformedDiseases);
        setStats(calculateStats(transformedDiseases));
      } else {
        // Si no hay datos del backend, usar datos mock como respaldo
        console.log('No se encontraron datos en el backend, usando datos mock');
        loadMockData();
      }
    } catch (error) {
      console.error('Error conectando con el backend:', error);
      setConnectionStatus({
        isConnected: false,
        lastChecked: new Date(),
        error: error instanceof Error ? error.message : 'Error de conexión',
      });
      
      // Usar datos mock como respaldo
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  // Datos mock como respaldo
  const loadMockData = (): void => {
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
    ];
    
    setDiseases(mockDiseases);
    setStats(calculateStats(mockDiseases));
  };

  useEffect(() => {
    loadData();
    
    // Test de conexión cada 30 segundos
    const connectionInterval = setInterval(testConnection, 30000);
    
    return () => clearInterval(connectionInterval);
  }, []);

  const handleNewDisease = async (formData: NewDiseaseForm): Promise<void> => {
    try {
      if (connectionStatus.isConnected) {
        // Usar backend
        const backendData = transformToBackendFormat(formData);
        const response = await diseaseAPI.create(backendData);
        
        if (response.success) {
          // Recargar datos desde el backend
          await loadData();
          setIsModalOpen(false);
          alert("Caso registrado exitosamente ");
        } else {
          throw new Error(response.message || 'Error ');
        }
      } else {
        // Fallback local
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
        alert("Caso registrado ");
      }
    } catch (error) {
      console.error("Error registrando enfermedad:", error);
      alert("Error al registrar el caso: " + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleEditDisease = async (formData: NewDiseaseForm): Promise<void> => {
    if (!selectedDisease) return;

    try {
      if (connectionStatus.isConnected) {
        // Usar backend
        const backendData = transformToBackendFormat(formData);
        const response = await diseaseAPI.update(selectedDisease.id, backendData);
        
        if (response.success) {
          // Recargar datos desde el backend
          await loadData();
          setIsEditModalOpen(false);
          setSelectedDisease(null);
          alert("Caso actualizado exitosamente");
        } else {
          throw new Error(response.message || 'Error');
        }
      } else {
        // Fallback local
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
        alert("Caso actualizado ");
      }
    } catch (error) {
      console.error("Error actualizando enfermedad:", error);
      alert("Error al actualizar el caso: " + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleDeleteDisease = async (): Promise<void> => {
    if (!selectedDisease) return;

    try {
      if (connectionStatus.isConnected) {
        // Usar backend
        const response = await diseaseAPI.delete(selectedDisease.id);
        
        if (response.success) {
          // Recargar datos desde el backend
          await loadData();
          setIsDeleteModalOpen(false);
          setSelectedDisease(null);
          alert("Caso eliminado exitosamente ");
        } else {
          throw new Error(response.message || 'Error');
        }
      } else {
        // Fallback local
        const updatedDiseases = diseases.filter(d => d.id !== selectedDisease.id);
        setDiseases(updatedDiseases);
        setStats(calculateStats(updatedDiseases));
        setIsDeleteModalOpen(false);
        setSelectedDisease(null);
        alert("Caso eliminado");
      }
    } catch (error) {
      console.error("Error eliminando enfermedad:", error);
      alert("Error al eliminar el caso: " + (error instanceof Error ? error.message : 'Error desconocido'));
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
      <div className="min-h-screen bg-gradient-to-br from-green-600 via-yellow-200 to-orange-400 p-4 overflow-x-hidden">
        <div className="flex items-center justify-center h-64 w-full">
          <div className="text-center bg-white/90 backdrop-blur-sm rounded-xl p-8 border border-white/30 max-w-sm w-full mx-auto">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-yellow-200 to-orange-400 p-4 lg:p-6 overflow-x-hidden">
      <div className="w-full max-w-7xl mx-auto space-y-6">
      
        {/* Header con estado de conexión */}
        <div className="text-center mb-6 px-2 w-full">
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
            🏥 Control de Enfermedades 
          </h1>
          <p className="text-base text-white/90 drop-shadow mb-4">
            Seguimiento y gestión de casos veterinarios
          </p>
          
          {/* Estado de conexión */}
          <div className="flex justify-center">
            <ConnectionStatusComponent 
              status={connectionStatus} 
              onTestConnection={testConnection}
            />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 w-full">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center w-full">
              <span className="text-4xl mr-4">📊</span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-sm font-medium text-blue-100 truncate">Total</p>
                <p className="text-2xl font-bold">{stats.totalCases}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center w-full">
              <span className="text-4xl mr-4">⚠️</span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-sm font-medium text-orange-100 truncate">Activos</p>
                <p className="text-2xl font-bold">{stats.activeCases}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center w-full">
              <span className="text-4xl mr-4">✅</span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-sm font-medium text-green-100 truncate">Recuperados</p>
                <p className="text-2xl font-bold">{stats.recoveredCases}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-xl p-6 border border-white/20">
            <div className="flex items-center w-full">
              <span className="text-4xl mr-4">🚨</span>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-sm font-medium text-red-100 truncate">Críticos</p>
                <p className="text-2xl font-bold">{stats.criticalCases}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de control */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden w-full">
          <div className="p-6 border-b border-gray-200 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 w-full">
              <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
                <span className="text-2xl">🌡️</span>
                <h3 className="text-xl font-semibold text-gray-900 truncate">Casos de Enfermedades</h3>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button onClick={() => setIsModalOpen(true)} variant="success">
                  ➕ Nuevo Caso
                </Button>
              </div>
            </div>
            
            <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
              <div className="relative flex-1 min-w-0">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                <input
                  type="text"
                  placeholder="Buscar por animal o enfermedad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                />
              </div>

              <div className="flex-shrink-0 w-full sm:w-auto">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
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
          </div>

          {/* Lista de casos */}
          <div className="p-6 w-full">
            <div className="space-y-4 w-full">
              {filteredDiseases.length === 0 ? (
                <div className="text-center py-12 bg-white/90 rounded-xl border border-white/30 w-full">
                  <span className="text-6xl mb-4 block">🌡️</span>
                  <p className="text-gray-500 text-lg font-medium">No se encontraron casos</p>
                  <p className="text-gray-400 text-sm mt-2">
                    {searchTerm || selectedStatus !== "all" 
                      ? "Intenta ajustar los filtros de búsqueda" 
                      : "Comienza registrando tu primer caso"}
                  </p>
                  {!connectionStatus.isConnected && (
                    <p className="text-orange-500 text-sm mt-2">
                      ⚠️ Trabajando sin conexión 
                    </p>
                  )}
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