import React, { useState, useEffect } from "react";
import {
  Skull,
  MapPin,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Microscope,
  Edit,
  Shield,
  Target,
  Trash2,
  Zap,
  X,
  Save,
  AlertTriangle,
  CheckCircle,
  Activity
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

// API Service - Simulación de conexión con backend
const API_BASE_URL = 'http://localhost:5000/api';

const apiService = {
  // Obtener todos los reportes
  async getReports(): Promise<PostMortemReport[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/health/necropsy`);
      if (!response.ok) throw new Error('Error al obtener reportes');
      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.warn('API no disponible, usando datos mock:', error);
      // Retorna datos mock si la API no está disponible
      return getMockReports();
    }
  },

  // Crear nuevo reporte
  async createReport(reportData: Partial<PostMortemReport>): Promise<PostMortemReport> {
    try {
      const response = await fetch(`${API_BASE_URL}/health/necropsy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      if (!response.ok) throw new Error('Error al crear reporte');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.warn('API no disponible, simulando creación');
      // Simula la creación del reporte
      const newReport: PostMortemReport = {
        id: Date.now().toString(),
        ...reportData,
        createdAt: new Date(),
        lastUpdated: new Date(),
      } as PostMortemReport;
      return newReport;
    }
  },

  // Actualizar reporte
  async updateReport(id: string, reportData: Partial<PostMortemReport>): Promise<PostMortemReport> {
    try {
      const response = await fetch(`${API_BASE_URL}/health/necropsy/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportData),
      });
      if (!response.ok) throw new Error('Error al actualizar reporte');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.warn('API no disponible, simulando actualización');
      return { ...reportData, id, lastUpdated: new Date() } as PostMortemReport;
    }
  },

  // Eliminar reporte
  async deleteReport(id: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health/necropsy/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Error al eliminar reporte');
      return true;
    } catch (error) {
      console.warn('API no disponible, simulando eliminación');
      return true;
    }
  },

  // Obtener estadísticas
  async getStats(): Promise<MortalityStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/mortality-rates`);
      if (!response.ok) throw new Error('Error al obtener estadísticas');
      const data = await response.json();
      return data.data;
    } catch (error) {
      console.warn('API no disponible, usando estadísticas mock');
      return getMockStats();
    }
  }
};

// Datos mock para desarrollo
function getMockReports(): PostMortemReport[] {
  return [
    {
      id: "1",
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
        lat: 17.9869,
        lng: -92.9303,
        address: "Establo Principal, Sector A",
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
    {
      id: "2",
      animalId: "BULL001",
      animalName: "Campeón",
      animalTag: "TAG-B001",
      breed: "Angus",
      age: 6,
      gender: "male",
      weight: 850,
      deathDate: new Date("2025-07-05"),
      discoveryDate: new Date("2025-07-05"),
      location: {
        lat: 17.9719,
        lng: -92.9456,
        address: "Pastizal Norte, Sector B",
        sector: "B",
        environment: "Pastoreo",
      },
      deathCircumstances: {
        witnessed: true,
        timeOfDeath: new Date("2025-07-05T14:30:00"),
        positionFound: "Decúbito lateral derecho",
        weatherConditions: "Lluvia ligera, 28°C",
        circumstances: "Observado cayendo súbitamente durante pastoreo",
      },
      preliminaryCause: "Trauma múltiple",
      finalCause: "Traumatismo craneoencefálico severo",
      causeCategory: "trauma",
      necropsyPerformed: true,
      necropsyDate: new Date("2025-07-05"),
      pathologist: "Dr. Hernández",
      veterinarian: "Dr. Martínez",
      grossFindings: {
        externalExamination: "Herida contusa en región frontal, hematoma subcutáneo extenso",
        cardiovascularSystem: "Sin alteraciones",
        respiratorySystem: "Congestión pulmonar leve",
        digestiveSystem: "Sin hallazgos",
        nervousSystem: "Fractura de hueso frontal, hemorragia subdural severa",
        reproductiveSystem: "Sin alteraciones",
        musculoskeletalSystem: "Fractura en miembro anterior izquierdo",
        lymphaticSystem: "Sin alteraciones",
        other: "Hematomas múltiples en flanco izquierdo",
      },
      photos: [],
      samples: [],
      preventiveRecommendations: [
        "Inspección de infraestructura en pastizales",
        "Remoción de objetos peligrosos",
        "Mejora de cercas y protecciones",
        "Supervisión durante pastoreo",
      ],
      economicImpact: 25000,
      reportStatus: "completed",
      createdBy: "Dr. Martínez",
      createdAt: new Date("2025-07-05"),
      lastUpdated: new Date("2025-07-06"),
      isContagious: false,
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

// Formulario de Reporte (Modal)
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
      lat: 17.9869,
      lng: -92.9303,
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

  useEffect(() => {
    if (report && isEditing) {
      setFormData(report);
      setRecommendations(report.preventiveRecommendations.join("\n"));
    } else {
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
          lat: 17.9869,
          lng: -92.9303,
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
    }
  }, [report, isEditing, isOpen]);

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      preventiveRecommendations: recommendations.split("\n").filter(rec => rec.trim() !== ""),
      animalId: formData.animalTag, // Usar el tag como ID del animal
    };

    onSave(submitData);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedFormData = (parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField as keyof typeof prev] as any,
        [field]: value
      }
    }));
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.animalName}
                  onChange={(e) => updateFormData("animalName", e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta/Tag *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.animalTag}
                  onChange={(e) => updateFormData("animalTag", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Raza *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                    value={formData.breed}
                    onChange={(e) => updateFormData("breed", e.target.value)}
                  />
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                    value={formData.age}
                    onChange={(e) => updateFormData("age", parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                    value={formData.weight}
                    onChange={(e) => updateFormData("weight", parseFloat(e.target.value))}
                  />
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

            {/* Ubicación y Circunstancias */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#519a7c]" />
                Ubicación y Circunstancias
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección/Ubicación *</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.location?.address}
                  onChange={(e) => updateNestedFormData("location", "address", e.target.value)}
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c]"
                  value={formData.veterinarian}
                  onChange={(e) => updateFormData("veterinarian", e.target.value)}
                />
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

// Componente de Mapa de Mortalidad
const MortalityMap = () => {
  return (
    <div className="h-96 bg-gradient-to-br from-[#f2e9d8]/50 to-[#519a7c]/20 rounded-lg flex items-center justify-center relative overflow-hidden border border-[#519a7c]/20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f2e9d8]/60 to-[#519a7c]/30"></div>

      <div className="absolute top-4 left-4 bg-white/95 rounded-lg px-3 py-2 shadow-md border border-[#519a7c]/30">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#519a7c]" />
          <span className="text-sm font-medium">
            Mapa de Mortalidad - Villahermosa, Tabasco
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
        <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <Skull className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white/95 rounded-lg p-2 shadow-lg w-32 text-xs border border-[#519a7c]/30">
            <p className="font-medium text-red-700">Neumonía Severa</p>
            <p className="text-gray-600">Vaca Holstein - 4 años</p>
            <p className="text-gray-600">Sector A - Establo Principal</p>
          </div>
        </div>

        <div className="absolute top-2/3 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <div className="bg-orange-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white/95 rounded-lg p-2 shadow-lg w-28 text-xs border border-[#519a7c]/30">
            <p className="font-medium text-orange-700">Trauma Múltiple</p>
            <p className="text-gray-600">Toro Angus - 6 años</p>
            <p className="text-gray-600">Sector B - Pastizal</p>
          </div>
        </div>

        <div className="absolute bottom-1/4 left-2/3 transform -translate-x-1/2 translate-y-1/2">
          <div className="bg-purple-500 rounded-full w-7 h-7 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 rounded-lg p-2 shadow-lg w-28 text-xs border border-[#519a7c]/30">
            <p className="font-medium text-purple-700">Intoxicación</p>
            <p className="text-gray-600">Novilla Jersey - 2 años</p>
            <p className="text-gray-600">Sector C - Potrero Sur</p>
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
  const [selectedCause, setSelectedCause] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<PostMortemReport | undefined>();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string>("");

  // Cargar datos iniciales
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    setLoadingMessage("Cargando datos...");
    
    try {
      const [reportsData, statsData] = await Promise.all([
        apiService.getReports(),
        apiService.getStats()
      ]);
      
      setReports(reportsData);
      setStats(statsData);
    } catch (error) {
      console.error("Error cargando datos:", error);
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
    } catch (error) {
      console.error("Error eliminando reporte:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReport = async (reportData: Partial<PostMortemReport>) => {
    setIsLoading(true);
    setLoadingMessage(editingReport ? "Actualizando reporte..." : "Guardando reporte...");
    
    try {
      if (editingReport) {
        // Actualizar reporte existente
        const updatedReport = await apiService.updateReport(editingReport.id, reportData);
        setReports(prev => prev.map(r => r.id === editingReport.id ? updatedReport : r));
      } else {
        // Crear nuevo reporte
        const newReport = await apiService.createReport({
          ...reportData,
          createdBy: "Usuario Actual", // En una app real, esto vendría del contexto de usuario
        });
        setReports(prev => [newReport, ...prev]);
      }
      
      setIsFormModalOpen(false);
      setEditingReport(undefined);
      
      // Recargar estadísticas
      const newStats = await apiService.getStats();
      setStats(newStats);
    } catch (error) {
      console.error("Error guardando reporte:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtrado de reportes
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.finalCause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.animalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCause = selectedCause === "all" || report.causeCategory === selectedCause;
    const matchesStatus = selectedStatus === "all" || report.reportStatus === selectedStatus;

    const now = new Date();
    const reportDate = new Date(report.deathDate);
    const daysDifference = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 3600 * 24));
    
    let matchesPeriod = true;
    if (selectedPeriod === "7") {
      matchesPeriod = daysDifference <= 7;
    } else if (selectedPeriod === "30") {
      matchesPeriod = daysDifference <= 30;
    } else if (selectedPeriod === "90") {
      matchesPeriod = daysDifference <= 90;
    } else if (selectedPeriod === "365") {
      matchesPeriod = daysDifference <= 365;
    }

    return matchesSearch && matchesCause && matchesStatus && matchesPeriod;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-2 sm:p-6 overflow-x-hidden">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-lg border-b border-[#519a7c]/30 sticky top-0 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              <Button size="sm" onClick={handleNewReport}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Reporte
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Estadísticas */}
          <div className="lg:col-span-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
          </div>

          {/* Mapa y Filtros */}
          <div className="lg:col-span-8">
            <Card className="bg-white/95 border-[#519a7c]/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#519a7c]" />
                  Mapa de Casos de Mortalidad
                </CardTitle>
                <CardDescription>
                  Distribución geográfica de casos por causa de muerte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MortalityMap />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="bg-white/95 border-[#519a7c]/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#519a7c]" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Animal, causa, etiqueta..."
                      className="w-full pl-10 pr-4 py-2 border border-[#519a7c]/60 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] bg-white/90 backdrop-blur-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Causa</label>
                  <select
                    className="w-full px-3 py-2 border border-[#519a7c]/60 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] bg-white/90 backdrop-blur-sm"
                    value={selectedCause}
                    onChange={(e) => setSelectedCause(e.target.value)}
                  >
                    <option value="all">Todas las causas</option>
                    <option value="disease">Enfermedades</option>
                    <option value="trauma">Traumas</option>
                    <option value="poisoning">Envenenamientos</option>
                    <option value="metabolic">Metabólicas</option>
                    <option value="reproductive">Reproductivas</option>
                    <option value="congenital">Congénitas</option>
                    <option value="predation">Depredación</option>
                    <option value="unknown">Desconocidas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    className="w-full px-3 py-2 border border-[#519a7c]/60 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] bg-white/90 backdrop-blur-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="preliminary">Preliminar</option>
                    <option value="pending_lab">Pendiente lab</option>
                    <option value="completed">Completado</option>
                    <option value="reviewed">Revisado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                  <select
                    className="w-full px-3 py-2 border border-[#519a7c]/60 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] bg-white/90 backdrop-blur-sm"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="90">Últimos 3 meses</option>
                    <option value="365">Último año</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Reportes */}
          <div className="lg:col-span-12">
            <Card className="bg-white/95 border-[#519a7c]/40">
              <CardHeader>
                <CardTitle>Reportes Post-Mortem ({filteredReports.length})</CardTitle>
                <CardDescription>
                  Análisis patológicos y determinación de causa de muerte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.map((report) => (
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
                              {report.finalCause}
                            </p>
                          </div>

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

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Veterinario:</strong> {report.veterinarian}
                            </div>
                            <div>
                              <strong>Impacto económico:</strong> ${report.economicImpact.toLocaleString()}
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
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