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
  Loader2,
  ChevronDown,
  ChevronUp,
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

interface UserLocation {
  lat: number;
  lng: number;
  address: string;
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

// Modal para crear/editar reportes
const ReportModal = ({ 
  report, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  report: PostMortemReport | null; 
  isOpen: boolean; 
  onClose: () => void;
  onSave: (report: Partial<PostMortemReport>) => void;
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
    preliminaryCause: "",
    finalCause: "",
    causeCategory: "unknown",
    necropsyPerformed: false,
    pathologist: "",
    veterinarian: "",
    preventiveRecommendations: [],
    economicImpact: 0,
    reportStatus: "preliminary",
    isContagious: false,
    requiresQuarantine: false,
    notifiableDisease: false,
  });
  
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (report) {
      setFormData(report);
    } else {
      // Resetear formulario para nuevo reporte
      setFormData({
        animalName: "",
        animalTag: "",
        breed: "",
        age: 0,
        gender: "female",
        weight: 0,
        deathDate: new Date(),
        discoveryDate: new Date(),
        preliminaryCause: "",
        finalCause: "",
        causeCategory: "unknown",
        necropsyPerformed: false,
        pathologist: "",
        veterinarian: "",
        preventiveRecommendations: [],
        economicImpact: 0,
        reportStatus: "preliminary",
        isContagious: false,
        requiresQuarantine: false,
        notifiableDisease: false,
      });
      // Obtener ubicación actual
      getCurrentLocation();
    }
  }, [report, isOpen]);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            // Simular geocodificación reversa para obtener dirección
            const address = await reverseGeocode(latitude, longitude);
            
            const location: UserLocation = {
              lat: latitude,
              lng: longitude,
              address: address
            };
            
            setUserLocation(location);
            
            // Actualizar datos del formulario con ubicación
            setFormData(prev => ({
              ...prev,
              location: {
                lat: latitude,
                lng: longitude,
                address: address,
                sector: determineSector(latitude, longitude),
                environment: "Pastoreo"
              }
            }));
          },
          (error) => {
            console.error("Error obteniendo ubicación:", error);
            // Usar ubicación por defecto (Villahermosa, Tabasco)
            const defaultLocation: UserLocation = {
              lat: 17.9869,
              lng: -92.9303,
              address: "Villahermosa, Tabasco, México"
            };
            setUserLocation(defaultLocation);
            setFormData(prev => ({
              ...prev,
              location: {
                lat: 17.9869,
                lng: -92.9303,
                address: "Villahermosa, Tabasco, México",
                sector: "A",
                environment: "Pastoreo"
              }
            }));
          },
          { 
            enableHighAccuracy: true, 
            timeout: 10000, 
            maximumAge: 300000 
          }
        );
      }
    } catch (error) {
      console.error("Error accediendo a geolocalización:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // Simular geocodificación basada en coordenadas de Tabasco
    if (lat >= 17.3 && lat <= 18.7 && lng >= -94.1 && lng <= -91.0) {
      return `Rancho Ganadero, Villahermosa, Tabasco, México (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
    } else {
      return `Ubicación: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  };

  const determineSector = (lat: number, lng: number): string => {
    // Determinar sector basado en coordenadas
    const latIndex = Math.floor((lat - 17.9) * 100) % 4;
    const lngIndex = Math.floor((lng + 93) * 100) % 4;
    const sectors = ["A", "B", "C", "D"];
    // Combinar ambos índices para determinar el sector
    const sectorIndex = (latIndex + lngIndex) % sectors.length;
    return sectors[sectorIndex] || "A";
  };

  const handleSave = () => {
    const reportData = {
      ...formData,
      id: report?.id || `report_${Date.now()}`,
      animalId: formData.animalTag || `animal_${Date.now()}`,
      createdAt: report?.createdAt || new Date(),
      lastUpdated: new Date(),
      createdBy: "Usuario Actual",
      deathCircumstances: {
        witnessed: false,
        positionFound: "Decúbito lateral",
        weatherConditions: "Condiciones normales",
        circumstances: formData.preliminaryCause || "Sin detalles adicionales"
      },
      grossFindings: {
        externalExamination: "Pendiente de registro",
        cardiovascularSystem: "Pendiente de registro",
        respiratorySystem: "Pendiente de registro",
        digestiveSystem: "Pendiente de registro",
        nervousSystem: "Pendiente de registro",
        reproductiveSystem: "Pendiente de registro",
        musculoskeletalSystem: "Pendiente de registro",
        lymphaticSystem: "Pendiente de registro",
        other: "Pendiente de registro"
      },
      photos: [],
      samples: [],
    };
    
    onSave(reportData as PostMortemReport);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {report ? "Editar Reporte" : "Nuevo Reporte Post-Mortem"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información del Animal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Animal *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                value={formData.animalName}
                onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiqueta/Arete *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                value={formData.animalTag}
                onChange={(e) => setFormData(prev => ({ ...prev, animalTag: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Raza
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                value={formData.breed}
                onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad (años)
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexo
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as "male" | "female" }))}
              >
                <option value="female">Hembra</option>
                <option value="male">Macho</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg)
              </label>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Muerte *
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                value={formData.deathDate ? new Date(formData.deathDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, deathDate: new Date(e.target.value) }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Descubrimiento *
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                value={formData.discoveryDate ? new Date(formData.discoveryDate).toISOString().split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, discoveryDate: new Date(e.target.value) }))}
                required
              />
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Ubicación
              </label>
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isLoadingLocation}
                className="text-sm text-[#519a7c] hover:text-[#519a7c]/80 flex items-center gap-1"
              >
                {isLoadingLocation ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MapPin className="w-4 h-4" />
                )}
                {isLoadingLocation ? "Obteniendo..." : "Obtener ubicación actual"}
              </button>
            </div>
            {userLocation && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-800">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  {userLocation.address}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Coordenadas: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </p>
              </div>
            )}
          </div>

          {/* Causa de Muerte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Causa Preliminar *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                value={formData.preliminaryCause}
                onChange={(e) => setFormData(prev => ({ ...prev, preliminaryCause: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría de Causa
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                value={formData.causeCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, causeCategory: e.target.value as any }))}
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

          {/* Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Veterinario *
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                value={formData.veterinarian}
                onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patólogo
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
                value={formData.pathologist}
                onChange={(e) => setFormData(prev => ({ ...prev, pathologist: e.target.value }))}
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="necropsyPerformed"
                className="mr-2 w-4 h-4 text-[#519a7c] focus:ring-[#519a7c] border-gray-300 rounded"
                checked={formData.necropsyPerformed}
                onChange={(e) => setFormData(prev => ({ ...prev, necropsyPerformed: e.target.checked }))}
              />
              <label htmlFor="necropsyPerformed" className="text-sm text-gray-700">
                Necropsia realizada
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isContagious"
                className="mr-2 w-4 h-4 text-[#519a7c] focus:ring-[#519a7c] border-gray-300 rounded"
                checked={formData.isContagious}
                onChange={(e) => setFormData(prev => ({ ...prev, isContagious: e.target.checked }))}
              />
              <label htmlFor="isContagious" className="text-sm text-gray-700">
                Enfermedad contagiosa
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiresQuarantine"
                className="mr-2 w-4 h-4 text-[#519a7c] focus:ring-[#519a7c] border-gray-300 rounded"
                checked={formData.requiresQuarantine}
                onChange={(e) => setFormData(prev => ({ ...prev, requiresQuarantine: e.target.checked }))}
              />
              <label htmlFor="requiresQuarantine" className="text-sm text-gray-700">
                Requiere cuarentena
              </label>
            </div>
          </div>

          {/* Impacto Económico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Impacto Económico (MXN)
            </label>
            <input
              type="number"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c]"
              value={formData.economicImpact}
              onChange={(e) => setFormData(prev => ({ ...prev, economicImpact: parseInt(e.target.value) || 0 }))}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            {report ? "Actualizar" : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente de Mapa de Mortalidad
const MortalityMap = ({ reports }: { reports: PostMortemReport[] }) => {
  const [selectedReport, setSelectedReport] = useState<PostMortemReport | null>(null);

  // Función para obtener color según causa de muerte
  const getColor = (causeCategory: string) => {
    switch (causeCategory) {
      case "disease": return "bg-red-600";
      case "trauma": return "bg-orange-500";
      case "poisoning": return "bg-purple-500";
      case "metabolic": return "bg-blue-500";
      case "reproductive": return "bg-pink-500";
      case "congenital": return "bg-indigo-500";
      case "predation": return "bg-yellow-500";
      default: return "bg-gray-500";
    }
  };

  // Función para obtener ícono según causa de muerte
  const getIcon = (causeCategory: string) => {
    switch (causeCategory) {
      case "disease": return <Skull className="w-3 h-3 text-white" />;
      case "trauma": return <TrendingUp className="w-3 h-3 text-white" />;
      case "poisoning": return <Zap className="w-3 h-3 text-white" />;
      case "metabolic": return <Target className="w-3 h-3 text-white" />;
      case "reproductive": return <Shield className="w-3 h-3 text-white" />;
      default: return <AlertTriangle className="w-3 h-3 text-white" />;
    }
  };

  // Función para convertir coordenadas GPS a posición en el mapa
  const getMapPosition = (lat: number, lng: number) => {
    // Rangos de coordenadas para Tabasco
    const latMin = 17.3, latMax = 18.7;
    const lngMin = -94.1, lngMax = -91.0;
    
    // Convertir a porcentaje dentro del área del mapa
    const x = ((lng - lngMin) / (lngMax - lngMin)) * 80 + 10;
    const y = ((latMax - lat) / (latMax - latMin)) * 80 + 10;
    
    return { x: Math.max(10, Math.min(90, x)), y: Math.max(10, Math.min(90, y)) };
  };

  return (
    <div className="h-96 bg-gradient-to-br from-[#f2e9d8]/50 to-[#519a7c]/20 rounded-lg flex items-center justify-center relative overflow-hidden border border-[#519a7c]/20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f2e9d8]/60 to-[#519a7c]/30"></div>

      <div className="absolute top-4 left-4 bg-white/95 rounded-lg px-3 py-2 shadow-md border border-[#519a7c]/30">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#519a7c]" />
          <span className="text-sm font-medium">
            Mapa de Mortalidad - {reports.length} Casos
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-white/95 rounded-lg p-3 shadow-md text-xs border border-[#519a7c]/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Enfermedad ({reports.filter(r => r.causeCategory === 'disease').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Trauma ({reports.filter(r => r.causeCategory === 'trauma').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Envenenamiento ({reports.filter(r => r.causeCategory === 'poisoning').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Metabólica ({reports.filter(r => r.causeCategory === 'metabolic').length})</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Otros ({reports.filter(r => !['disease', 'trauma', 'poisoning', 'metabolic'].includes(r.causeCategory)).length})</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-full">
        {reports.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay casos para mostrar</p>
            </div>
          </div>
        )}
        
        {reports.map((report) => {
          if (!report.location) {
            return null;
          }
          
          const position = getMapPosition(report.location.lat, report.location.lng);
          const colorClass = getColor(report.causeCategory);
          const iconElement = getIcon(report.causeCategory);

          return (
            <div
              key={report.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${position.x}%`, top: `${position.y}%` }}
            >
              <div
                className={`${colorClass} rounded-full w-8 h-8 flex items-center justify-center shadow-lg cursor-pointer hover:scale-125 transition-all duration-200 border-2 border-white`}
                onClick={() => setSelectedReport(selectedReport?.id === report.id ? null : report)}
                title={`${report.animalName} - ${report.causeCategory}`}
              >
                {iconElement}
              </div>
              {selectedReport?.id === report.id && (
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white/98 rounded-lg p-4 shadow-xl w-64 text-xs border-2 border-[#519a7c]/30 z-20">
                  <div className="flex items-start justify-between mb-2">
                    <h6 className="font-bold text-gray-800 text-sm">{report.animalName}</h6>
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-medium text-red-700 mb-2">{report.finalCause || report.preliminaryCause}</p>
                  <div className="space-y-1 text-gray-600">
                    <p><strong>Arete:</strong> {report.animalTag}</p>
                    <p><strong>Raza:</strong> {report.breed} - {report.age} años</p>
                    <p><strong>Sector:</strong> {report.location.sector}</p>
                    <p><strong>Peso:</strong> {report.weight} kg</p>
                    <p><strong>Fecha:</strong> {report.deathDate.toLocaleDateString()}</p>
                  </div>
                  <p className="text-gray-500 mt-2 text-xs">{report.location.address}</p>
                  <div className="flex items-center gap-2 mt-3 flex-wrap">
                    <Badge variant={report.causeCategory}>
                      {report.causeCategory === "disease" ? "Enfermedad" :
                       report.causeCategory === "trauma" ? "Trauma" :
                       report.causeCategory === "poisoning" ? "Envenenamiento" :
                       report.causeCategory === "metabolic" ? "Metabólica" :
                       report.causeCategory === "reproductive" ? "Reproductiva" :
                       report.causeCategory === "congenital" ? "Congénita" :
                       report.causeCategory === "predation" ? "Depredación" : "Desconocida"}
                    </Badge>
                    {report.isContagious && <Badge variant="critical">Contagioso</Badge>}
                    {report.requiresQuarantine && <Badge variant="warning">Cuarentena</Badge>}
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<PostMortemReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Simular llamada al backend
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockReports: PostMortemReport[] = [
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
            address: "Establo Principal, Villahermosa, Tabasco",
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
            address: "Pastizal Norte, Villahermosa, Tabasco",
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
        {
          id: "3",
          animalId: "COW009",
          animalName: "Esperanza",
          animalTag: "TAG-009",
          breed: "Jersey",
          age: 2,
          gender: "female",
          weight: 380,
          deathDate: new Date("2025-07-10"),
          discoveryDate: new Date("2025-07-10"),
          location: {
            lat: 17.9650,
            lng: -92.9200,
            address: "Potrero Sur, Villahermosa, Tabasco",
            sector: "C",
            environment: "Pastoreo",
          },
          deathCircumstances: {
            witnessed: false,
            positionFound: "Decúbito esternal",
            weatherConditions: "Soleado, 35°C",
            circumstances: "Encontrada con signos de convulsiones",
          },
          preliminaryCause: "Intoxicación por plantas tóxicas",
          finalCause: "Intoxicación por Ricinus communis (ricino)",
          causeCategory: "poisoning",
          necropsyPerformed: true,
          necropsyDate: new Date("2025-07-10"),
          pathologist: "Dr. Hernández",
          veterinarian: "Dr. López",
          grossFindings: {
            externalExamination: "Deshidratación severa, mucosas pálidas",
            cardiovascularSystem: "Corazón normal",
            respiratorySystem: "Edema pulmonar leve",
            digestiveSystem: "Gastroenteritis hemorrágica severa",
            nervousSystem: "Congestión cerebral",
            reproductiveSystem: "Sin alteraciones",
            musculoskeletalSystem: "Sin lesiones",
            lymphaticSystem: "Sin alteraciones",
            other: "Hígado con degeneración grasa",
          },
          photos: [],
          samples: [],
          preventiveRecommendations: [
            "Eliminar plantas tóxicas del potrero",
            "Capacitación sobre plantas peligrosas",
            "Inspección regular de pastizales",
            "Suplementación nutricional adecuada",
          ],
          economicImpact: 12000,
          reportStatus: "completed",
          createdBy: "Dr. López",
          createdAt: new Date("2025-07-10"),
          lastUpdated: new Date("2025-07-11"),
          isContagious: false,
          requiresQuarantine: false,
          notifiableDisease: false,
          reportedToAuthorities: false,
        },
        {
          id: "4",
          animalId: "COW012",
          animalName: "Princesa",
          animalTag: "TAG-012",
          breed: "Brahman",
          age: 5,
          gender: "female",
          weight: 620,
          deathDate: new Date("2025-07-12"),
          discoveryDate: new Date("2025-07-12"),
          location: {
            lat: 17.9750,
            lng: -92.9100,
            address: "Sector Este, Villahermosa, Tabasco",
            sector: "D",
            environment: "Semi-estabulado",
          },
          deathCircumstances: {
            witnessed: true,
            timeOfDeath: new Date("2025-07-12T06:15:00"),
            positionFound: "Decúbito lateral",
            weatherConditions: "Lluvioso, 26°C",
            circumstances: "Colapso súbito durante ordeño",
          },
          preliminaryCause: "Falla metabólica",
          finalCause: "Cetosis severa con lipidosis hepática",
          causeCategory: "metabolic",
          necropsyPerformed: true,
          necropsyDate: new Date("2025-07-12"),
          pathologist: "Dr. Hernández",
          veterinarian: "Dr. Ramírez",
          grossFindings: {
            externalExamination: "Animal en condición corporal baja",
            cardiovascularSystem: "Sin alteraciones significativas",
            respiratorySystem: "Sin hallazgos",
            digestiveSystem: "Rumen con contenido escaso",
            nervousSystem: "Sin alteraciones macroscópicas",
            reproductiveSystem: "Útero post-parto reciente",
            musculoskeletalSystem: "Atrofia muscular leve",
            lymphaticSystem: "Sin alteraciones",
            other: "Hígado amarillento y friable (lipidosis)",
          },
          photos: [],
          samples: [],
          preventiveRecommendations: [
            "Monitoreo de condición corporal post-parto",
            "Suplementación energética en vacas lecheras",
            "Análisis periódicos de cetonas",
            "Manejo nutricional especializado",
          ],
          economicImpact: 18000,
          reportStatus: "completed",
          createdBy: "Dr. Ramírez",
          createdAt: new Date("2025-07-12"),
          lastUpdated: new Date("2025-07-13"),
          isContagious: false,
          requiresQuarantine: false,
          notifiableDisease: false,
          reportedToAuthorities: false,
        },
      ];

      const mockStats: MortalityStats = {
        totalDeaths: 22,
        monthlyDeaths: 4,
        mortalityRate: 3.2,
        mostCommonCause: "Enfermedades infecciosas",
        averageAge: 4.25,
        costImpact: 250000,
        necropsyRate: 100,
        contagiousCases: 1,
        seasonalTrend: "increasing",
        preventableCases: 18,
      };

      setReports(mockReports);
      setStats(mockStats);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSaveReport = async (reportData: Partial<PostMortemReport>) => {
    try {
      if (editingReport) {
        // Actualizar reporte existente
        setReports(prev => prev.map(report => 
          report.id === editingReport.id 
            ? { ...report, ...reportData } as PostMortemReport
            : report
        ));
      } else {
        // Crear nuevo reporte
        setReports(prev => [...prev, reportData as PostMortemReport]);
        
        // Actualizar estadísticas
        setStats(prev => ({
          ...prev,
          totalDeaths: prev.totalDeaths + 1,
          monthlyDeaths: prev.monthlyDeaths + 1,
          costImpact: prev.costImpact + (reportData.economicImpact || 0)
        }));
      }

      // Simular llamada al backend
      console.log(editingReport ? "Actualizando reporte:" : "Creando reporte:", reportData);
      
      // Aquí iría la llamada real al backend:
      // await fetch(`/api/health/necropsy${editingReport ? `/${editingReport.id}` : ''}`, {
      //   method: editingReport ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(reportData)
      // });

    } catch (error) {
      console.error("Error guardando reporte:", error);
    }
  };

  const handleEditReport = (report: PostMortemReport) => {
    setEditingReport(report);
    setIsModalOpen(true);
  };

  const handleDeleteReport = async (reportId: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este reporte?")) {
      try {
        const reportToDelete = reports.find(r => r.id === reportId);
        setReports(prev => prev.filter(report => report.id !== reportId));
        
        // Actualizar estadísticas
        if (reportToDelete) {
          setStats(prev => ({
            ...prev,
            totalDeaths: Math.max(0, prev.totalDeaths - 1),
            monthlyDeaths: Math.max(0, prev.monthlyDeaths - 1),
            costImpact: Math.max(0, prev.costImpact - reportToDelete.economicImpact)
          }));
        }

        // Simular llamada al backend
        console.log("Eliminando reporte:", reportId);
        
        // Aquí iría la llamada real al backend:
        // await fetch(`/api/health/necropsy/${reportId}`, { method: 'DELETE' });

      } catch (error) {
        console.error("Error eliminando reporte:", error);
      }
    }
  };

  const toggleExpandReport = (reportId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const handleNewReport = () => {
    setEditingReport(null);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#519a7c] mx-auto mb-4" />
          <p className="text-gray-700">Cargando reportes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-2 sm:p-6 overflow-x-hidden">
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
              <Button onClick={handleNewReport} size="sm">
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

          {/* Mapa */}
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
                <MortalityMap reports={filteredReports} />
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
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
                  {filteredReports.map((report) => {
                    const isExpanded = expandedReports.has(report.id);
                    
                    return (
                      <div
                        key={report.id}
                        className="border border-white/60 bg-white/90 backdrop-blur-sm rounded-lg p-6 hover:shadow-lg hover:bg-white/95 transition-all duration-200"
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
                                <p className="font-medium">{report.deathDate.toLocaleDateString()}</p>
                              </div>
                            </div>

                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-900 mb-2">Causa Final de Muerte</h5>
                              <p className="text-gray-800 bg-gradient-to-r from-[#f2e9d8]/60 to-[#f2e9d8]/40 backdrop-blur-sm p-3 rounded-lg border border-[#519a7c]/20">
                                {report.finalCause}
                              </p>
                            </div>

                            {!isExpanded && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                  <strong>Veterinario:</strong> {report.veterinarian}
                                </div>
                                <div>
                                  <strong>Impacto económico:</strong> ${report.economicImpact.toLocaleString()}
                                </div>
                              </div>
                            )}

                            {isExpanded && (
                              <div className="space-y-4 mt-4 border-t border-gray-200 pt-4">
                                <div>
                                  <h5 className="font-semibold text-gray-900 mb-2">Ubicación</h5>
                                  <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    {report.location.address} - Sector {report.location.sector}
                                  </p>
                                </div>

                                <div>
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

                                {report.histopathology?.performed && (
                                  <div>
                                    <h5 className="font-semibold text-gray-900 mb-2">Histopatología</h5>
                                    <p className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                                      {report.histopathology.results}
                                    </p>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Veterinario:</strong> {report.veterinarian}
                                  </div>
                                  <div>
                                    <strong>Patólogo:</strong> {report.pathologist}
                                  </div>
                                  <div>
                                    <strong>Impacto económico:</strong> ${report.economicImpact.toLocaleString()}
                                  </div>
                                  <div>
                                    <strong>Creado por:</strong> {report.createdBy}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleExpandReport(report.id)}
                              className="hover:bg-blue-50 hover:border-blue-300"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditReport(report)}
                              className="hover:bg-[#519a7c]/10 hover:border-[#519a7c]"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteReport(report.id)}
                              className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {filteredReports.length === 0 && (
                    <div className="text-center py-12">
                      <Skull className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay reportes que coincidan
                      </h3>
                      <p className="text-gray-600">
                        Ajusta los filtros o crea un nuevo reporte post-mortem.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal */}
      <ReportModal
        report={editingReport}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingReport(null);
        }}
        onSave={handleSaveReport}
      />
    </div>
  );
};

export default PostMortemReports;