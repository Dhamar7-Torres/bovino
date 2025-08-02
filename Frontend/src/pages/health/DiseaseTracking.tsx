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
}> = ({ children, variant }) => {
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(variant)}`}>
      {children}
    </span>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEditing ? "Editar Caso" : "Nuevo Caso de Enfermedad"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enfermedad *
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
          </div>

          {/* Tipo y severidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

          {/* Veterinario */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

          {/* Síntomas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <Button type="button" onClick={addSymptom} size="sm">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <Button type="button" onClick={addMedication} size="sm">
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

          {/* Costo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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

          {/* Botones */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              <Save className="w-4 h-4 mr-2" />
              {isEditing ? "Actualizar" : "Guardar"}
            </Button>
          </div>
        </form>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Confirmar Eliminación</h3>
              <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              ¿Estás seguro de que deseas eliminar el caso de <strong>{diseaseName}</strong> del animal{" "}
              <strong>{animalName}</strong>?
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={onConfirm}>
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
// COMPONENTE PRINCIPAL - SOLO CONTENIDO DEL MÓDULO
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
          actions: ["Aplicar antibiótico cada 12h", "Monitoreo diario"],
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
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <Activity className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Casos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalCases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Casos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeCases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recuperados</p>
              <p className="text-2xl font-bold text-gray-900">{stats.recoveredCases}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Casos Críticos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.criticalCases}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controles y lista */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Casos de Enfermedades</h3>
            <Button onClick={() => setIsModalOpen(true)} variant="success">
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Caso
            </Button>
          </div>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />
            </div>

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
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {filteredDiseases.length === 0 ? (
            <div className="text-center py-12">
              <Thermometer className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron casos</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-6 font-medium text-gray-600">ANIMAL</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">ENFERMEDAD</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">ESTADO</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">SEVERIDAD</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">COSTO</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-600">ACCIONES</th>
                </tr>
              </thead>
              <tbody>
                {filteredDiseases.map((disease) => (
                  <tr key={disease.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{disease.animalName}</p>
                        <p className="text-sm text-gray-600">{disease.animalTag}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-gray-900">{disease.diseaseName}</p>
                        <p className="text-sm text-gray-600 capitalize">{disease.diseaseType}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={disease.status}>
                        {disease.status === 'active' ? 'Activo' :
                         disease.status === 'treating' ? 'En tratamiento' :
                         disease.status === 'recovered' ? 'Recuperado' :
                         disease.status === 'chronic' ? 'Crónico' : 'Fallecido'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <Badge variant={disease.severity}>
                        {disease.severity === 'low' ? 'Baja' :
                         disease.severity === 'medium' ? 'Media' :
                         disease.severity === 'high' ? 'Alta' : 'Crítica'}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium">${disease.cost.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedDisease(disease);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedDisease(disease);
                            setIsDeleteModalOpen(true);
                          }}
                          className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
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
    </>
  );
};

export default DiseaseTracking;