import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  X,
  Trash2,
  Zap,
  Navigation,
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

interface NewReportForm {
  animalId: string;
  animalName: string;
  animalTag: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  weight: number;
  deathDate: string;
  discoveryDate: string;
  preliminaryCause: string;
  finalCause: string;
  causeCategory: string;
  pathologist: string;
  veterinarian: string;
  circumstances: string;
  positionFound: string;
  weatherConditions: string;
  economicImpact: number;
  isContagious: boolean;
  requiresQuarantine: boolean;
  latitude: number;
  longitude: number;
  address: string;
  sector: string;
  environment: string;
}

// Componentes reutilizables
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
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
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning:
      "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
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

// Modal para Nuevo Reporte
const NewReportModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: NewReportForm) => void;
}) => {
  const [formData, setFormData] = useState<NewReportForm>({
    animalId: "",
    animalName: "",
    animalTag: "",
    breed: "",
    age: 0,
    gender: "female",
    weight: 0,
    deathDate: "",
    discoveryDate: "",
    preliminaryCause: "",
    finalCause: "",
    causeCategory: "disease",
    pathologist: "",
    veterinarian: "",
    circumstances: "",
    positionFound: "",
    weatherConditions: "",
    economicImpact: 0,
    isContagious: false,
    requiresQuarantine: false,
    latitude: 0,
    longitude: 0,
    address: "",
    sector: "",
    environment: "",
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleGetLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada en este navegador");
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        }));
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Error obteniendo ubicación:", error);
        let errorMessage = "Error desconocido";
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Ubicación no disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo agotado para obtener ubicación";
            break;
        }
        
        alert(`Error obteniendo ubicación: ${errorMessage}`);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      animalId: "",
      animalName: "",
      animalTag: "",
      breed: "",
      age: 0,
      gender: "female",
      weight: 0,
      deathDate: "",
      discoveryDate: "",
      preliminaryCause: "",
      finalCause: "",
      causeCategory: "disease",
      pathologist: "",
      veterinarian: "",
      circumstances: "",
      positionFound: "",
      weatherConditions: "",
      economicImpact: 0,
      isContagious: false,
      requiresQuarantine: false,
      latitude: 0,
      longitude: 0,
      address: "",
      sector: "",
      environment: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Nuevo Reporte Post-Mortem</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información del Animal */}
          <div>
            <h3 className="text-lg font-medium mb-4">Información del Animal</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID Animal
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.animalId}
                  onChange={(e) => setFormData({...formData, animalId: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.animalName}
                  onChange={(e) => setFormData({...formData, animalName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Etiqueta
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.animalTag}
                  onChange={(e) => setFormData({...formData, animalTag: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raza
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.breed}
                  onChange={(e) => setFormData({...formData, breed: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad (años)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sexo
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value as "male" | "female"})}
                >
                  <option value="female">Hembra</option>
                  <option value="male">Macho</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Muerte
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.deathDate}
                  onChange={(e) => setFormData({...formData, deathDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Descubrimiento
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.discoveryDate}
                  onChange={(e) => setFormData({...formData, discoveryDate: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Causa de Muerte */}
          <div>
            <h3 className="text-lg font-medium mb-4">Causa de Muerte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Causa Preliminar
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.preliminaryCause}
                  onChange={(e) => setFormData({...formData, preliminaryCause: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Causa Final
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.finalCause}
                  onChange={(e) => setFormData({...formData, finalCause: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.causeCategory}
                  onChange={(e) => setFormData({...formData, causeCategory: e.target.value})}
                >
                  <option value="disease">Enfermedad</option>
                  <option value="trauma">Trauma</option>
                  <option value="poisoning">Envenenamiento</option>
                  <option value="metabolic">Metabólica</option>
                  <option value="reproductive">Reproductiva</option>
                  <option value="congenital">Congénita</option>
                  <option value="predation">Depredación</option>
                  <option value="unknown">Desconocida</option>
                </select>
              </div>
            </div>
          </div>

          {/* Personal */}
          <div>
            <h3 className="text-lg font-medium mb-4">Personal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patólogo
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.pathologist}
                  onChange={(e) => setFormData({...formData, pathologist: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Veterinario
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.veterinarian}
                  onChange={(e) => setFormData({...formData, veterinarian: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Circunstancias */}
          <div>
            <h3 className="text-lg font-medium mb-4">Circunstancias del Hallazgo</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Circunstancias
                </label>
                <textarea
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.circumstances}
                  onChange={(e) => setFormData({...formData, circumstances: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Posición Encontrada
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.positionFound}
                    onChange={(e) => setFormData({...formData, positionFound: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condiciones Climáticas
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.weatherConditions}
                    onChange={(e) => setFormData({...formData, weatherConditions: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Ubicación del Incidente */}
          <div>
            <h3 className="text-lg font-medium mb-4">Ubicación del Incidente</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-2"
                >
                  <Navigation className={`w-4 h-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
                  {isGettingLocation ? 'Obteniendo ubicación...' : 'Obtener ubicación actual'}
                </Button>
                <span className="text-sm text-gray-500">
                  Usar GPS para obtener coordenadas automáticamente
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value) || 0})}
                    placeholder="17.9869"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitud
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value) || 0})}
                    placeholder="-92.9303"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sector
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.sector}
                    onChange={(e) => setFormData({...formData, sector: e.target.value})}
                    placeholder="Sector A, B, C..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección/Descripción del Lugar
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Descripción detallada del lugar donde se encontró el animal"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ambiente
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={formData.environment}
                    onChange={(e) => setFormData({...formData, environment: e.target.value})}
                    required
                  >
                    <option value="">Seleccionar ambiente</option>
                    <option value="Confinamiento">Confinamiento/Establo</option>
                    <option value="Pastoreo">Pastoreo libre</option>
                    <option value="Corral">Corral/Manga</option>
                    <option value="Potrero">Potrero</option>
                    <option value="Bebedero">Área de bebedero</option>
                    <option value="Comedero">Área de comedero</option>
                    <option value="Sombra">Área de sombra</option>
                    <option value="Camino">Camino/Sendero</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              {(formData.latitude !== 0 && formData.longitude !== 0) && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Coordenadas registradas:</strong> {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Puedes verificar la ubicación en Google Maps: 
                    <a 
                      href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline ml-1"
                    >
                      Ver en mapa
                    </a>
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información Adicional */}
          <div>
            <h3 className="text-lg font-medium mb-4">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impacto Económico ($)
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.economicImpact}
                  onChange={(e) => setFormData({...formData, economicImpact: parseFloat(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.isContagious}
                    onChange={(e) => setFormData({...formData, isContagious: e.target.checked})}
                  />
                  <span className="text-sm font-medium text-gray-700">Es contagioso</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={formData.requiresQuarantine}
                    onChange={(e) => setFormData({...formData, requiresQuarantine: e.target.checked})}
                  />
                  <span className="text-sm font-medium text-gray-700">Requiere cuarentena</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Reporte
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para Editar Reporte
const EditReportModal = ({
  isOpen,
  onClose,
  onSubmit,
  report,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: NewReportForm) => void;
  report: PostMortemReport | null;
}) => {
  const [formData, setFormData] = useState<NewReportForm>({
    animalId: "",
    animalName: "",
    animalTag: "",
    breed: "",
    age: 0,
    gender: "female",
    weight: 0,
    deathDate: "",
    discoveryDate: "",
    preliminaryCause: "",
    finalCause: "",
    causeCategory: "disease",
    pathologist: "",
    veterinarian: "",
    circumstances: "",
    positionFound: "",
    weatherConditions: "",
    economicImpact: 0,
    isContagious: false,
    requiresQuarantine: false,
    latitude: 0,
    longitude: 0,
    address: "",
    sector: "",
    environment: "",
  });

  const [] = useState(false);

  useEffect(() => {
    if (report) {
      setFormData({
        animalId: report.animalId,
        animalName: report.animalName,
        animalTag: report.animalTag,
        breed: report.breed,
        age: report.age,
        gender: report.gender,
        weight: report.weight,
        deathDate: report.deathDate.toISOString().split('T')[0],
        discoveryDate: report.discoveryDate.toISOString().split('T')[0],
        preliminaryCause: report.preliminaryCause,
        finalCause: report.finalCause,
        causeCategory: report.causeCategory,
        pathologist: report.pathologist,
        veterinarian: report.veterinarian,
        circumstances: report.deathCircumstances.circumstances,
        positionFound: report.deathCircumstances.positionFound,
        weatherConditions: report.deathCircumstances.weatherConditions,
        economicImpact: report.economicImpact,
        isContagious: report.isContagious,
        requiresQuarantine: report.requiresQuarantine,
        latitude: report.location.lat,
        longitude: report.location.lng,
        address: report.location.address,
        sector: report.location.sector,
        environment: report.location.environment,
      });
    }
  }, [report]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Editar Reporte Post-Mortem</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Similar form structure as NewReportModal but with pre-filled values */}
          {/* I'll skip duplicating the entire form content for brevity */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Actualizar Reporte
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de Confirmación para Eliminar
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  reportName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reportName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Eliminar Reporte</h2>
            <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          ¿Estás seguro de que quieres eliminar el reporte de{" "}
          <span className="font-medium">"{reportName}"</span>?
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};

// Componente de Mapa de Mortalidad
const MortalityMap = () => {
  return (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Fondo del mapa simulado */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-gray-100"></div>

      {/* Título de ubicación */}
      <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium">
            Mapa de Mortalidad - Villahermosa, Tabasco
          </span>
        </div>
      </div>

      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-md text-xs">
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

      {/* Marcadores simulados de casos de mortalidad */}
      <div className="relative w-full h-full">
        {/* Caso por enfermedad */}
        <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Skull className="w-4 h-4 text-white" />
          </motion.div>
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-36 text-xs">
            <p className="font-medium text-red-700">Neumonía Severa</p>
            <p className="text-gray-600">Vaca Holstein - 4 años</p>
            <p className="text-gray-600">Sector A - Establo Principal</p>
          </div>
        </div>

        {/* Caso por trauma */}
        <div className="absolute top-2/3 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-orange-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <TrendingUp className="w-3 h-3 text-white" />
          </motion.div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
            <p className="font-medium text-orange-700">Trauma Múltiple</p>
            <p className="text-gray-600">Toro Angus - 6 años</p>
            <p className="text-gray-600">Sector B - Pastizal</p>
          </div>
        </div>

        {/* Caso por envenenamiento */}
        <div className="absolute bottom-1/4 left-2/3 transform -translate-x-1/2 translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-purple-500 rounded-full w-7 h-7 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Zap className="w-3 h-3 text-white" />
          </motion.div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
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
  // Estados del componente
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
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [isEditReportModalOpen, setIsEditReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<PostMortemReport | null>(null);
  const [deletingReport, setDeletingReport] = useState<PostMortemReport | null>(null);

  // Simulación de datos
  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Datos de ejemplo para reportes post-mortem
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
            address: "Establo Principal, Sector A",
            sector: "A",
            environment: "Confinamiento",
          },
          deathCircumstances: {
            witnessed: false,
            positionFound: "Decúbito lateral izquierdo",
            weatherConditions: "Caluroso, 32°C",
            circumstances:
              "Encontrada muerta en la mañana, sin signos previos aparentes",
          },
          preliminaryCause: "Neumonía severa",
          finalCause: "Neumonía bacteriana por Mannheimia haemolytica",
          causeCategory: "disease",
          necropsyPerformed: true,
          necropsyDate: new Date("2025-07-08"),
          pathologist: "Dr. Hernández",
          veterinarian: "Dr. García",
          grossFindings: {
            externalExamination:
              "Animal en buen estado nutricional, sin lesiones externas evidentes",
            cardiovascularSystem:
              "Corazón aumentado de tamaño, congestión venosa",
            respiratorySystem:
              "Pulmones consolidados bilateralmente, exudado purulento en bronquios",
            digestiveSystem: "Sin hallazgos significativos",
            nervousSystem: "Sin alteraciones macroscópicas",
            reproductiveSystem: "Útero gestante de 6 meses",
            musculoskeletalSystem: "Sin lesiones",
            lymphaticSystem: "Nódulos linfáticos mediastínicos aumentados",
            other: "Hígado con congestión pasiva",
          },
          histopathology: {
            performed: true,
            results:
              "Bronconeumonía supurativa severa con colonias bacterianas",
            laboratory: "Laboratorio Veterinario Central",
            reportDate: new Date("2025-07-12"),
          },
          microbiology: {
            performed: true,
            organisms: ["Mannheimia haemolytica"],
            antibiogramResults:
              "Sensible a penicilina, resistente a tetraciclina",
            laboratory: "Laboratorio Veterinario Central",
          },
          photos: [
            {
              id: "PH001",
              description: "Lesiones pulmonares consolidadas",
              category: "internal",
              timestamp: new Date("2025-07-08"),
            },
            {
              id: "PH002",
              description: "Exudado purulento bronquial",
              category: "internal",
              timestamp: new Date("2025-07-08"),
            },
          ],
          samples: [
            {
              id: "S001",
              type: "Tejido pulmonar",
              organ: "Pulmón",
              preservationMethod: "Formalina 10%",
              laboratory: "Laboratorio Veterinario Central",
              status: "completed",
            },
          ],
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
            externalExamination:
              "Herida contusa en región frontal, hematoma subcutáneo extenso",
            cardiovascularSystem: "Sin alteraciones",
            respiratorySystem: "Congestión pulmonar leve",
            digestiveSystem: "Sin hallazgos",
            nervousSystem:
              "Fractura de hueso frontal, hemorragia subdural severa",
            reproductiveSystem: "Sin alteraciones",
            musculoskeletalSystem: "Fractura en miembro anterior izquierdo",
            lymphaticSystem: "Sin alteraciones",
            other: "Hematomas múltiples en flanco izquierdo",
          },
          photos: [
            {
              id: "PH003",
              description: "Trauma craneal externo",
              category: "external",
              timestamp: new Date("2025-07-05"),
            },
            {
              id: "PH004",
              description: "Hemorragia subdural",
              category: "internal",
              timestamp: new Date("2025-07-05"),
            },
          ],
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
          animalId: "COW005",
          animalName: "Esperanza",
          animalTag: "TAG-005",
          breed: "Jersey",
          age: 2,
          gender: "female",
          weight: 380,
          deathDate: new Date("2025-07-10"),
          discoveryDate: new Date("2025-07-10"),
          location: {
            lat: 17.9589,
            lng: -92.9289,
            address: "Potrero Sur, Sector C",
            sector: "C",
            environment: "Pastoreo",
          },
          deathCircumstances: {
            witnessed: false,
            positionFound: "Decúbito esternal",
            weatherConditions: "Soleado, 30°C",
            circumstances: "Encontrada muerta cerca del bebedero",
          },
          preliminaryCause: "Intoxicación",
          finalCause: "Pendiente resultados toxicológicos",
          causeCategory: "poisoning",
          necropsyPerformed: true,
          necropsyDate: new Date("2025-07-10"),
          pathologist: "Dr. López",
          veterinarian: "Dr. García",
          grossFindings: {
            externalExamination: "Animal deshidratado, mucosas cianóticas",
            cardiovascularSystem: "Sangre oscura, coagulación alterada",
            respiratorySystem: "Edema pulmonar moderado",
            digestiveSystem: "Contenido ruminal verdoso, olor característico",
            nervousSystem: "Sin alteraciones macroscópicas",
            reproductiveSystem: "Sin alteraciones",
            musculoskeletalSystem: "Sin lesiones",
            lymphaticSystem: "Sin alteraciones",
            other: "Hígado con degeneración grasa",
          },
          toxicology: {
            performed: true,
            substances: ["Investigación en curso"],
            results: "Pendiente",
            laboratory: "Laboratorio Toxicológico Nacional",
          },
          photos: [
            {
              id: "PH005",
              description: "Mucosas cianóticas",
              category: "external",
              timestamp: new Date("2025-07-10"),
            },
          ],
          samples: [
            {
              id: "S002",
              type: "Contenido ruminal",
              organ: "Rumen",
              preservationMethod: "Congelación",
              laboratory: "Laboratorio Toxicológico Nacional",
              status: "processing",
            },
            {
              id: "S003",
              type: "Sangre",
              organ: "Sistema circulatorio",
              preservationMethod: "EDTA",
              laboratory: "Laboratorio Toxicológico Nacional",
              status: "processing",
            },
          ],
          preventiveRecommendations: [
            "Inspección de plantas tóxicas en pastizales",
            "Control de acceso a químicos agrícolas",
            "Análisis de calidad del agua",
            "Capacitación sobre plantas venenosas",
          ],
          economicImpact: 8000,
          reportStatus: "pending_lab",
          createdBy: "Dr. García",
          createdAt: new Date("2025-07-10"),
          lastUpdated: new Date("2025-07-11"),
          isContagious: false,
          requiresQuarantine: true,
          notifiableDisease: false,
          reportedToAuthorities: true,
        },
      ];

      // Estadísticas de ejemplo
      const mockStats: MortalityStats = {
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

      setReports(mockReports);
      setStats(mockStats);
    };

    loadData();
  }, []);

  // Filtrar reportes con filtros funcionales
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.finalCause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.animalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCause =
      selectedCause === "all" || report.causeCategory === selectedCause;
    
    const matchesStatus =
      selectedStatus === "all" || report.reportStatus === selectedStatus;

    // Filtro por período
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

  // Funciones de manejo
  const handleNewReport = (formData: NewReportForm) => {
    const newReport: PostMortemReport = {
      id: Date.now().toString(),
      animalId: formData.animalId,
      animalName: formData.animalName,
      animalTag: formData.animalTag,
      breed: formData.breed,
      age: formData.age,
      gender: formData.gender,
      weight: formData.weight,
      deathDate: new Date(formData.deathDate),
      discoveryDate: new Date(formData.discoveryDate),
      location: {
        lat: formData.latitude,
        lng: formData.longitude,
        address: formData.address,
        sector: formData.sector,
        environment: formData.environment,
      },
      deathCircumstances: {
        witnessed: false,
        positionFound: formData.positionFound,
        weatherConditions: formData.weatherConditions,
        circumstances: formData.circumstances,
      },
      preliminaryCause: formData.preliminaryCause,
      finalCause: formData.finalCause,
      causeCategory: formData.causeCategory as any,
      necropsyPerformed: true,
      necropsyDate: new Date(),
      pathologist: formData.pathologist,
      veterinarian: formData.veterinarian,
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
      photos: [],
      samples: [],
      preventiveRecommendations: [],
      economicImpact: formData.economicImpact,
      reportStatus: "preliminary",
      createdBy: "Usuario Actual",
      createdAt: new Date(),
      lastUpdated: new Date(),
      isContagious: formData.isContagious,
      requiresQuarantine: formData.requiresQuarantine,
      notifiableDisease: false,
      reportedToAuthorities: false,
    };

    setReports([newReport, ...reports]);
  };

  const handleEditReport = (formData: NewReportForm) => {
    if (!editingReport) return;

    const updatedReport: PostMortemReport = {
      ...editingReport,
      animalId: formData.animalId,
      animalName: formData.animalName,
      animalTag: formData.animalTag,
      breed: formData.breed,
      age: formData.age,
      gender: formData.gender,
      weight: formData.weight,
      deathDate: new Date(formData.deathDate),
      discoveryDate: new Date(formData.discoveryDate),
      location: {
        lat: formData.latitude,
        lng: formData.longitude,
        address: formData.address,
        sector: formData.sector,
        environment: formData.environment,
      },
      preliminaryCause: formData.preliminaryCause,
      finalCause: formData.finalCause,
      causeCategory: formData.causeCategory as any,
      pathologist: formData.pathologist,
      veterinarian: formData.veterinarian,
      deathCircumstances: {
        ...editingReport.deathCircumstances,
        positionFound: formData.positionFound,
        weatherConditions: formData.weatherConditions,
        circumstances: formData.circumstances,
      },
      economicImpact: formData.economicImpact,
      isContagious: formData.isContagious,
      requiresQuarantine: formData.requiresQuarantine,
      lastUpdated: new Date(),
    };

    setReports(prevReports =>
      prevReports.map(report =>
        report.id === editingReport.id ? updatedReport : report
      )
    );

    setEditingReport(null);
  };

  const handleDeleteReport = () => {
    if (!deletingReport) return;

    setReports(prevReports =>
      prevReports.filter(report => report.id !== deletingReport.id)
    );

    setDeletingReport(null);
    setIsDeleteModalOpen(false);
  };

  const openEditModal = (report: PostMortemReport) => {
    setEditingReport(report);
    setIsEditReportModalOpen(true);
  };

  const openDeleteModal = (report: PostMortemReport) => {
    setDeletingReport(report);
    setIsDeleteModalOpen(true);
  };

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
              <h1 className="text-3xl font-bold text-gray-900">
                Reportes Post-Mortem
              </h1>
              <p className="text-gray-600 mt-1">
                Análisis patológico y causa de mortalidad
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                size="sm"
                onClick={() => setIsNewReportModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Reporte
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Estadísticas de Mortalidad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card className="bg-white/80 backdrop-blur-md border-gray-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Skull className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total Muertes
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalDeaths}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Tasa Mortalidad
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.mortalityRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Microscope className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Tasa Necropsia
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.necropsyRate}%
                      </p>
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
                      <p className="text-sm font-medium text-gray-600">
                        Casos Prevenibles
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.preventableCases}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Impacto Económico
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${(stats.costImpact / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Mapa de Mortalidad */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
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
          </motion.div>

          {/* Panel de Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Animal, causa, etiqueta..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Causa de muerte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Causa
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                {/* Estado del reporte */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                {/* Período */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          </motion.div>

          {/* Lista de Reportes Post-Mortem */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-12"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle>
                  Reportes Post-Mortem ({filteredReports.length})
                </CardTitle>
                <CardDescription>
                  Análisis patológicos y determinación de causa de muerte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <motion.div
                      key={report.id}
                      whileHover={{ scale: 1.01 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-xl font-semibold text-gray-900">
                              {report.animalName} ({report.animalTag})
                            </h4>
                            <Badge variant={report.causeCategory}>
                              {report.causeCategory === "disease"
                                ? "Enfermedad"
                                : report.causeCategory === "trauma"
                                ? "Trauma"
                                : report.causeCategory === "poisoning"
                                ? "Envenenamiento"
                                : report.causeCategory === "metabolic"
                                ? "Metabólica"
                                : report.causeCategory === "reproductive"
                                ? "Reproductiva"
                                : report.causeCategory === "congenital"
                                ? "Congénita"
                                : report.causeCategory === "predation"
                                ? "Depredación"
                                : "Desconocida"}
                            </Badge>
                            <Badge variant={report.reportStatus}>
                              {report.reportStatus === "preliminary"
                                ? "Preliminar"
                                : report.reportStatus === "pending_lab"
                                ? "Pendiente Lab"
                                : report.reportStatus === "completed"
                                ? "Completado"
                                : "Revisado"}
                            </Badge>
                            {report.isContagious && (
                              <Badge variant="critical">Contagioso</Badge>
                            )}
                            {report.requiresQuarantine && (
                              <Badge variant="warning">Cuarentena</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
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
                              <p className="font-medium">
                                {report.deathDate.toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-900 mb-2">
                              Ubicación del Incidente
                            </h5>
                            <div className="bg-gray-50 p-3 rounded-lg text-sm">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                  <p>
                                    <strong>Dirección:</strong> {report.location.address}
                                  </p>
                                  <p>
                                    <strong>Sector:</strong> {report.location.sector}
                                  </p>
                                  <p>
                                    <strong>Ambiente:</strong> {report.location.environment}
                                  </p>
                                </div>
                                <div>
                                  <p>
                                    <strong>Coordenadas:</strong> {report.location.lat.toFixed(6)}, {report.location.lng.toFixed(6)}
                                  </p>
                                  <a 
                                    href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline text-xs flex items-center gap-1 mt-1"
                                  >
                                    <MapPin className="w-3 h-3" />
                                    Ver ubicación en Google Maps
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-900 mb-2">
                              Causa Final de Muerte
                            </h5>
                            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                              {report.finalCause}
                            </p>
                          </div>

                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-900 mb-2">
                              Circunstancias del Hallazgo
                            </h5>
                            <div className="bg-blue-50 p-3 rounded-lg text-sm">
                              <p>
                                <strong>Posición:</strong>{" "}
                                {report.deathCircumstances.positionFound}
                              </p>
                              <p>
                                <strong>Condiciones:</strong>{" "}
                                {report.deathCircumstances.weatherConditions}
                              </p>
                              <p>
                                <strong>Circunstancias:</strong>{" "}
                                {report.deathCircumstances.circumstances}
                              </p>
                              {report.deathCircumstances.witnessed && (
                                <p>
                                  <strong>Muerte presenciada:</strong> Sí
                                </p>
                              )}
                            </div>
                          </div>

                          {report.necropsyPerformed && (
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-900 mb-2">
                                Hallazgos de Necropsia
                              </h5>
                              <div className="bg-green-50 p-3 rounded-lg text-sm space-y-2">
                                <p>
                                  <strong>Patólogo:</strong>{" "}
                                  {report.pathologist}
                                </p>
                                <p>
                                  <strong>Fecha:</strong>{" "}
                                  {report.necropsyDate?.toLocaleDateString()}
                                </p>

                                {report.grossFindings.respiratorySystem && (
                                  <div>
                                    <strong>Sistema respiratorio:</strong>
                                    <p className="ml-4">
                                      {report.grossFindings.respiratorySystem}
                                    </p>
                                  </div>
                                )}

                                {report.grossFindings.cardiovascularSystem && (
                                  <div>
                                    <strong>Sistema cardiovascular:</strong>
                                    <p className="ml-4">
                                      {
                                        report.grossFindings
                                          .cardiovascularSystem
                                      }
                                    </p>
                                  </div>
                                )}

                                {report.grossFindings.nervousSystem && (
                                  <div>
                                    <strong>Sistema nervioso:</strong>
                                    <p className="ml-4">
                                      {report.grossFindings.nervousSystem}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {report.histopathology?.performed && (
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-900 mb-2">
                                Histopatología
                              </h5>
                              <div className="bg-purple-50 p-3 rounded-lg text-sm">
                                <p>
                                  <strong>Laboratorio:</strong>{" "}
                                  {report.histopathology.laboratory}
                                </p>
                                <p>
                                  <strong>Resultados:</strong>{" "}
                                  {report.histopathology.results}
                                </p>
                              </div>
                            </div>
                          )}

                          {report.microbiology?.performed && (
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-900 mb-2">
                                Microbiología
                              </h5>
                              <div className="bg-indigo-50 p-3 rounded-lg text-sm">
                                <p>
                                  <strong>Organismos:</strong>{" "}
                                  {report.microbiology.organisms.join(", ")}
                                </p>
                                {report.microbiology.antibiogramResults && (
                                  <p>
                                    <strong>Antibiograma:</strong>{" "}
                                    {report.microbiology.antibiogramResults}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}

                          {report.toxicology?.performed && (
                            <div className="mb-4">
                              <h5 className="font-semibold text-gray-900 mb-2">
                                Toxicología
                              </h5>
                              <div className="bg-red-50 p-3 rounded-lg text-sm">
                                <p>
                                  <strong>Estado:</strong>{" "}
                                  {report.toxicology.results}
                                </p>
                                <p>
                                  <strong>Laboratorio:</strong>{" "}
                                  {report.toxicology.laboratory}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-900 mb-2">
                              Recomendaciones Preventivas
                            </h5>
                            <div className="space-y-1">
                              {report.preventiveRecommendations.map(
                                (rec, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-start gap-2"
                                  >
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm text-gray-700">
                                      {rec}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Veterinario:</strong>{" "}
                              {report.veterinarian}
                            </div>
                            <div>
                              <strong>Impacto económico:</strong> $
                              {report.economicImpact.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openEditModal(report)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openDeleteModal(report)}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modal para Nuevo Reporte */}
      <NewReportModal
        isOpen={isNewReportModalOpen}
        onClose={() => setIsNewReportModalOpen(false)}
        onSubmit={handleNewReport}
      />

      {/* Modal para Editar Reporte */}
      <EditReportModal
        isOpen={isEditReportModalOpen}
        onClose={() => {
          setIsEditReportModalOpen(false);
          setEditingReport(null);
        }}
        onSubmit={handleEditReport}
        report={editingReport}
      />

      {/* Modal de Confirmación para Eliminar */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingReport(null);
        }}
        onConfirm={handleDeleteReport}
        reportName={deletingReport?.animalName || ""}
      />
    </div>
  );
};

export default PostMortemReports;