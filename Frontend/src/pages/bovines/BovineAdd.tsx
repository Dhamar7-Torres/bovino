import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  X,
  Save,
  Eye,
  Calendar,
  MapPin,
  Heart,
  Activity,
  Truck,
  Baby,
  Scale,
  Tag,
  Users,
  FileText,
  AlertCircle,
  Navigation,
  Loader2,
} from "lucide-react";

// Interfaces para tipos de datos
interface Bovine {
  id: string;
  earTag: string;
  name: string;
  breed: string;
  gender: "male" | "female";
  birthDate: Date;
  acquisitionDate: Date;
  currentWeight: number;
  birthWeight?: number;
  color: string;
  healthStatus: "healthy" | "sick" | "treatment" | "quarantine" | "deceased";
  reproductiveStatus: "open" | "pregnant" | "lactating" | "dry" | "breeding";
  productionType: "dairy" | "beef" | "breeding" | "dual_purpose";
  location: {
    sector: string;
    paddock: string;
    barn?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  genealogy: {
    sireId?: string;
    damId?: string;
    sireName?: string;
    damName?: string;
  };
  acquisition: {
    source: "birth" | "purchase" | "donation" | "transfer";
    supplier?: string;
    price?: number;
    documents?: string[];
  };
  identification: {
    rfidTag?: string;
    tattoo?: string;
    brandNumber?: string;
    microchip?: string;
  };
  notes: string;
  photos: string[];
  createdAt: Date;
  lastUpdated: Date;
  createdBy: string;
  isActive: boolean;
}

interface BovineStats {
  total: number;
  healthy: number;
  sick: number;
  pregnant: number;
  lactating: number;
  males: number;
  females: number;
  avgAge: number;
  avgWeight: number;
  newBirths: number;
}

interface BovineForm {
  earTag: string;
  name: string;
  breed: string;
  gender: "male" | "female";
  birthDate: string;
  acquisitionDate: string;
  currentWeight: number;
  birthWeight: number;
  color: string;
  healthStatus: "healthy" | "sick" | "treatment" | "quarantine" | "deceased";
  reproductiveStatus: "open" | "pregnant" | "lactating" | "dry" | "breeding";
  productionType: "dairy" | "beef" | "breeding" | "dual_purpose";
  sector: string;
  paddock: string;
  barn: string;
  latitude: number;
  longitude: number;
  address: string;
  sireId: string;
  damId: string;
  sireName: string;
  damName: string;
  source: "birth" | "purchase" | "donation" | "transfer";
  supplier: string;
  price: number;
  rfidTag: string;
  tattoo: string;
  brandNumber: string;
  microchip: string;
  notes: string;
}

// Componentes reutilizables
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">{children}</div>
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
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "success" | "danger" | "warning";
  size?: "sm" | "default";
  className?: string;
  disabled?: boolean;
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    default: "bg-[#519a7c] text-white hover:bg-[#519a7c]/90 focus:ring-[#519a7c]/50",
    outline: "border border-[#519a7c] bg-white text-gray-700 hover:bg-gray-50 focus:ring-[#519a7c]/50",
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
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200";
      case "sick":
        return "bg-red-100 text-red-800 border-red-200";
      case "treatment":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "quarantine":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "deceased":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "pregnant":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "lactating":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "open":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "dry":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "breeding":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "male":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "female":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "dairy":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "beef":
        return "bg-red-100 text-red-800 border-red-200";
      case "dual_purpose":
        return "bg-green-100 text-green-800 border-green-200";
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

// Modal para Nuevo Bovino
const NewBovineModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: BovineForm) => void;
}) => {
  const [formData, setFormData] = useState<BovineForm>({
    earTag: "",
    name: "",
    breed: "",
    gender: "female",
    birthDate: "",
    acquisitionDate: "",
    currentWeight: 0,
    birthWeight: 0,
    color: "",
    healthStatus: "healthy",
    reproductiveStatus: "open",
    productionType: "dairy",
    sector: "",
    paddock: "",
    barn: "",
    latitude: 0,
    longitude: 0,
    address: "",
    sireId: "",
    damId: "",
    sireName: "",
    damName: "",
    source: "birth",
    supplier: "",
    price: 0,
    rfidTag: "",
    tattoo: "",
    brandNumber: "",
    microchip: "",
    notes: "",
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

  const handleSubmit = () => {
    if (!formData.earTag || !formData.name || !formData.breed || !formData.birthDate || !formData.acquisitionDate || !formData.currentWeight || !formData.sector || !formData.paddock) {
      alert("Por favor, completa todos los campos requeridos");
      return;
    }

    onSubmit(formData);
    // Reset form
    setFormData({
      earTag: "",
      name: "",
      breed: "",
      gender: "female",
      birthDate: "",
      acquisitionDate: "",
      currentWeight: 0,
      birthWeight: 0,
      color: "",
      healthStatus: "healthy",
      reproductiveStatus: "open",
      productionType: "dairy",
      sector: "",
      paddock: "",
      barn: "",
      latitude: 0,
      longitude: 0,
      address: "",
      sireId: "",
      damId: "",
      sireName: "",
      damName: "",
      source: "birth",
      supplier: "",
      price: 0,
      rfidTag: "",
      tattoo: "",
      brandNumber: "",
      microchip: "",
      notes: "",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto border border-gray-300 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Registrar Nuevo Bovino</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6 bg-white">
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-[#519a7c]" />
              Información Básica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Arete/Etiqueta *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] bg-white"
                  value={formData.earTag}
                  onChange={(e) => setFormData({...formData, earTag: e.target.value})}
                  placeholder="Ej: COW001, B-123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] bg-white"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nombre del bovino"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raza *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] bg-white"
                  value={formData.breed}
                  onChange={(e) => setFormData({...formData, breed: e.target.value})}
                >
                  <option value="">Seleccionar raza</option>
                  <option value="Holstein">Holstein</option>
                  <option value="Jersey">Jersey</option>
                  <option value="Angus">Angus</option>
                  <option value="Hereford">Hereford</option>
                  <option value="Charolais">Charolais</option>
                  <option value="Simmental">Simmental</option>
                  <option value="Brahman">Brahman</option>
                  <option value="Nelore">Nelore</option>
                  <option value="Gyr">Gyr</option>
                  <option value="Criollo">Criollo</option>
                  <option value="Mestizo">Mestizo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sexo *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value as "male" | "female"})}
                >
                  <option value="female">Hembra</option>
                  <option value="male">Macho</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  placeholder="Ej: Negro, Blanco, Pinto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Producción *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.productionType}
                  onChange={(e) => setFormData({...formData, productionType: e.target.value as any})}
                >
                  <option value="dairy">Lechero</option>
                  <option value="beef">Carne</option>
                  <option value="breeding">Reproducción</option>
                  <option value="dual_purpose">Doble Propósito</option>
                </select>
              </div>
            </div>
          </div>

          {/* Fechas y Peso */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Fechas y Medidas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Nacimiento *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] bg-white"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Adquisición *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.acquisitionDate}
                  onChange={(e) => setFormData({...formData, acquisitionDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso Actual (kg) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.currentWeight}
                  onChange={(e) => setFormData({...formData, currentWeight: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso al Nacer (kg)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.birthWeight}
                  onChange={(e) => setFormData({...formData, birthWeight: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          {/* Estado de Salud y Reproductivo */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-600" />
              Estado de Salud y Reproductivo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado de Salud *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.healthStatus}
                  onChange={(e) => setFormData({...formData, healthStatus: e.target.value as any})}
                >
                  <option value="healthy">Sano</option>
                  <option value="sick">Enfermo</option>
                  <option value="treatment">En Tratamiento</option>
                  <option value="quarantine">Cuarentena</option>
                  <option value="deceased">Fallecido</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado Reproductivo
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.reproductiveStatus}
                  onChange={(e) => setFormData({...formData, reproductiveStatus: e.target.value as any})}
                >
                  <option value="open">Vacía</option>
                  <option value="pregnant">Gestante</option>
                  <option value="lactating">Lactando</option>
                  <option value="dry">Seca</option>
                  <option value="breeding">En Reproducción</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#f4ac3a]" />
              Ubicación
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button 
                  variant="outline" 
                  onClick={handleGetLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-2"
                >
                  {isGettingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  {isGettingLocation ? 'Obteniendo ubicación...' : 'Obtener ubicación GPS'}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] bg-white"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: parseFloat(e.target.value) || 0})}
                    placeholder="-92.9303"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección/Descripción
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Descripción del lugar"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sector *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={formData.sector}
                    onChange={(e) => setFormData({...formData, sector: e.target.value})}
                    placeholder="Ej: A, B, Norte"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Potrero/Pastizal *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={formData.paddock}
                    onChange={(e) => setFormData({...formData, paddock: e.target.value})}
                    placeholder="Ej: Potrero 1, Pradera Norte"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Establo/Corral
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={formData.barn}
                    onChange={(e) => setFormData({...formData, barn: e.target.value})}
                    placeholder="Ej: Establo 1, Corral A"
                  />
                </div>
              </div>

              {(formData.latitude !== 0 && formData.longitude !== 0) && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
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

          {/* Genealogía */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#519a7c]" />
              Información Genealógica
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID del Padre
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.sireId}
                  onChange={(e) => setFormData({...formData, sireId: e.target.value})}
                  placeholder="Ej: BULL001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Padre
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.sireName}
                  onChange={(e) => setFormData({...formData, sireName: e.target.value})}
                  placeholder="Nombre del toro"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ID de la Madre
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.damId}
                  onChange={(e) => setFormData({...formData, damId: e.target.value})}
                  placeholder="Ej: COW002"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Madre
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.damName}
                  onChange={(e) => setFormData({...formData, damName: e.target.value})}
                  placeholder="Nombre de la madre"
                />
              </div>
            </div>
          </div>

          {/* Información de Adquisición */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#f4ac3a]" />
              Información de Adquisición
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origen *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.source}
                  onChange={(e) => setFormData({...formData, source: e.target.value as any})}
                >
                  <option value="birth">Nacimiento</option>
                  <option value="purchase">Compra</option>
                  <option value="donation">Donación</option>
                  <option value="transfer">Transferencia</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proveedor
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.supplier}
                  onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                  placeholder="Nombre del proveedor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Precio ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          {/* Identificación Adicional */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#519a7c]" />
              Identificación Adicional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  RFID
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.rfidTag}
                  onChange={(e) => setFormData({...formData, rfidTag: e.target.value})}
                  placeholder="Chip RFID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tatuaje
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.tattoo}
                  onChange={(e) => setFormData({...formData, tattoo: e.target.value})}
                  placeholder="Número de tatuaje"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marca/Fierro
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.brandNumber}
                  onChange={(e) => setFormData({...formData, brandNumber: e.target.value})}
                  placeholder="Número de marca"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Microchip
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.microchip}
                  onChange={(e) => setFormData({...formData, microchip: e.target.value})}
                  placeholder="ID del microchip"
                />
              </div>
            </div>
          </div>

          {/* Notas */}
          <div>
            <h3 className="text-lg font-medium mb-4">Notas Adicionales</h3>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Observaciones, características especiales, historial médico, etc."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" />
              Registrar Bovino
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal para Editar Bovino (simplificada para demostración)
const EditBovineModal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md border border-gray-300 shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Editar Bovino</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-gray-600 mb-4">Funcionalidad de edición disponible aquí.</p>
        <Button onClick={onClose}>Cerrar</Button>
      </div>
    </div>
  );
};

// Modal de Confirmación para Eliminar
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  bovineName,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  bovineName: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 border border-gray-300 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Eliminar Bovino</h2>
            <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          ¿Estás seguro de que quieres eliminar el bovino{" "}
          <span className="font-medium">"{bovineName}"</span>?
        </p>

        <div className="flex justify-end gap-2">
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
  );
};

// Modal para Ver Detalles (simplificada para demostración)
const ViewBovineModal = ({
  isOpen,
  onClose,
  bovine,
}: {
  isOpen: boolean;
  onClose: () => void;
  bovine: Bovine | null;
}) => {
  if (!isOpen || !bovine) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-gray-300 shadow-xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Detalles del Bovino</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6 bg-white">
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">{bovine.name}</h3>
            <p className="text-lg text-gray-600">Arete: {bovine.earTag}</p>
            <p className="text-sm text-gray-600 mt-2">Raza: {bovine.breed}</p>
            <p className="text-sm text-gray-600">Peso: {bovine.currentWeight} kg</p>
            <p className="text-sm text-gray-600">Ubicación: {bovine.location.sector} - {bovine.location.paddock}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const BovineAdd = () => {
  // Estados del componente
  const [bovines, setBovines] = useState<Bovine[]>([]);
  const [stats, setStats] = useState<BovineStats>({
    total: 0,
    healthy: 0,
    sick: 0,
    pregnant: 0,
    lactating: 0,
    males: 0,
    females: 0,
    avgAge: 0,
    avgWeight: 0,
    newBirths: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBreed, setSelectedBreed] = useState<string>("all");
  const [selectedHealthStatus, setSelectedHealthStatus] = useState<string>("all");
  const [selectedGender, setSelectedGender] = useState<string>("all");
  const [selectedProductionType, setSelectedProductionType] = useState<string>("all");
  const [isNewBovineModalOpen, setIsNewBovineModalOpen] = useState(false);
  const [isEditBovineModalOpen, setIsEditBovineModalOpen] = useState(false);
  const [isViewBovineModalOpen, setIsViewBovineModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewingBovine, setViewingBovine] = useState<Bovine | null>(null);
  const [deletingBovine, setDeletingBovine] = useState<Bovine | null>(null);

  // Simulación de datos
  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Datos de ejemplo para bovinos
      const mockBovines: Bovine[] = [
        {
          id: "1",
          earTag: "COW001",
          name: "Margarita",
          breed: "Holstein",
          gender: "female",
          birthDate: new Date("2020-03-15"),
          acquisitionDate: new Date("2020-03-15"),
          currentWeight: 520,
          birthWeight: 35,
          color: "Negro y Blanco",
          healthStatus: "healthy",
          reproductiveStatus: "lactating",
          productionType: "dairy",
          location: {
            sector: "A",
            paddock: "Potrero Norte",
            barn: "Establo 1",
            latitude: 17.9869,
            longitude: -92.9303,
            address: "Establo Principal, Sector A",
          },
          genealogy: {
            sireId: "BULL001",
            damId: "COW002",
            sireName: "Campeón",
            damName: "Esperanza",
          },
          acquisition: {
            source: "birth",
            supplier: "",
            price: 0,
            documents: [],
          },
          identification: {
            rfidTag: "RF001",
            tattoo: "T001",
            brandNumber: "B001",
            microchip: "MC001",
          },
          notes: "Excelente productora de leche. Muy dócil y fácil de manejar.",
          photos: [],
          createdAt: new Date("2020-03-15"),
          lastUpdated: new Date("2025-01-15"),
          createdBy: "Dr. García",
          isActive: true,
        },
        {
          id: "2",
          earTag: "BULL001",
          name: "Campeón",
          breed: "Angus",
          gender: "male",
          birthDate: new Date("2019-01-10"),
          acquisitionDate: new Date("2021-06-15"),
          currentWeight: 850,
          birthWeight: 42,
          color: "Negro",
          healthStatus: "healthy",
          reproductiveStatus: "breeding",
          productionType: "breeding",
          location: {
            sector: "B",
            paddock: "Potrero Sur",
            barn: "Corral de Toros",
            latitude: 17.9719,
            longitude: -92.9456,
            address: "Pastizal Norte, Sector B",
          },
          genealogy: {
            sireId: "",
            damId: "",
            sireName: "",
            damName: "",
          },
          acquisition: {
            source: "purchase",
            supplier: "Rancho Los Álamos",
            price: 35000,
            documents: ["Certificado de registro", "Historial sanitario"],
          },
          identification: {
            rfidTag: "RF002",
            tattoo: "T002",
            brandNumber: "B002",
            microchip: "MC002",
          },
          notes: "Toro reproductor de excelente genética. Muy buena conformación.",
          photos: [],
          createdAt: new Date("2021-06-15"),
          lastUpdated: new Date("2025-01-10"),
          createdBy: "Dr. Martínez",
          isActive: true,
        },
        {
          id: "3",
          earTag: "COW002",
          name: "Esperanza",
          breed: "Jersey",
          gender: "female",
          birthDate: new Date("2021-05-20"),
          acquisitionDate: new Date("2021-05-20"),
          currentWeight: 380,
          birthWeight: 28,
          color: "Café Claro",
          healthStatus: "treatment",
          reproductiveStatus: "pregnant",
          productionType: "dairy",
          location: {
            sector: "C",
            paddock: "Potrero Este",
            barn: "Establo 2",
            latitude: 17.9589,
            longitude: -92.9289,
            address: "Potrero Sur, Sector C",
          },
          genealogy: {
            sireId: "BULL002",
            damId: "COW003",
            sireName: "Dorado",
            damName: "Paloma",
          },
          acquisition: {
            source: "birth",
            supplier: "",
            price: 0,
            documents: [],
          },
          identification: {
            rfidTag: "RF003",
            tattoo: "T003",
            brandNumber: "B003",
            microchip: "",
          },
          notes: "En tratamiento por mastitis leve. Gestación de 6 meses.",
          photos: [],
          createdAt: new Date("2021-05-20"),
          lastUpdated: new Date("2025-01-12"),
          createdBy: "Dr. García",
          isActive: true,
        },
      ];

      // Calcular estadísticas
      const mockStats: BovineStats = {
        total: mockBovines.length,
        healthy: mockBovines.filter(b => b.healthStatus === "healthy").length,
        sick: mockBovines.filter(b => b.healthStatus === "sick" || b.healthStatus === "treatment").length,
        pregnant: mockBovines.filter(b => b.reproductiveStatus === "pregnant").length,
        lactating: mockBovines.filter(b => b.reproductiveStatus === "lactating").length,
        males: mockBovines.filter(b => b.gender === "male").length,
        females: mockBovines.filter(b => b.gender === "female").length,
        avgAge: 3.2,
        avgWeight: 583.3,
        newBirths: 2,
      };

      setBovines(mockBovines);
      setStats(mockStats);
    };

    loadData();
  }, []);

  // Filtrar bovinos
  const filteredBovines = bovines.filter((bovine) => {
    const matchesSearch =
      bovine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bovine.earTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bovine.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBreed = selectedBreed === "all" || bovine.breed === selectedBreed;
    const matchesHealth = selectedHealthStatus === "all" || bovine.healthStatus === selectedHealthStatus;
    const matchesGender = selectedGender === "all" || bovine.gender === selectedGender;
    const matchesProduction = selectedProductionType === "all" || bovine.productionType === selectedProductionType;

    return matchesSearch && matchesBreed && matchesHealth && matchesGender && matchesProduction;
  });

  // Funciones de manejo
  const handleNewBovine = (formData: BovineForm) => {
    const newBovine: Bovine = {
      id: Date.now().toString(),
      earTag: formData.earTag,
      name: formData.name,
      breed: formData.breed,
      gender: formData.gender,
      birthDate: new Date(formData.birthDate),
      acquisitionDate: new Date(formData.acquisitionDate),
      currentWeight: formData.currentWeight,
      birthWeight: formData.birthWeight,
      color: formData.color,
      healthStatus: formData.healthStatus,
      reproductiveStatus: formData.reproductiveStatus,
      productionType: formData.productionType,
      location: {
        sector: formData.sector,
        paddock: formData.paddock,
        barn: formData.barn,
        latitude: formData.latitude,
        longitude: formData.longitude,
        address: formData.address,
      },
      genealogy: {
        sireId: formData.sireId,
        damId: formData.damId,
        sireName: formData.sireName,
        damName: formData.damName,
      },
      acquisition: {
        source: formData.source,
        supplier: formData.supplier,
        price: formData.price,
        documents: [],
      },
      identification: {
        rfidTag: formData.rfidTag,
        tattoo: formData.tattoo,
        brandNumber: formData.brandNumber,
        microchip: formData.microchip,
      },
      notes: formData.notes,
      photos: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
      createdBy: "Usuario Actual",
      isActive: true,
    };

    setBovines([newBovine, ...bovines]);
    
    // Actualizar estadísticas
    setStats(prevStats => ({
      ...prevStats,
      total: prevStats.total + 1,
      [formData.gender === "male" ? "males" : "females"]: prevStats[formData.gender === "male" ? "males" : "females"] + 1,
      [formData.healthStatus === "healthy" ? "healthy" : "sick"]: prevStats[formData.healthStatus === "healthy" ? "healthy" : "sick"] + 1,
    }));
  };

  const handleDeleteBovine = () => {
    if (!deletingBovine) return;

    setBovines(prevBovines =>
      prevBovines.filter(bovine => bovine.id !== deletingBovine.id)
    );

    setStats(prevStats => ({
      ...prevStats,
      total: prevStats.total - 1,
      [deletingBovine.gender === "male" ? "males" : "females"]: prevStats[deletingBovine.gender === "male" ? "males" : "females"] - 1,
      [deletingBovine.healthStatus === "healthy" ? "healthy" : "sick"]: prevStats[deletingBovine.healthStatus === "healthy" ? "healthy" : "sick"] - 1,
    }));

    setDeletingBovine(null);
    setIsDeleteModalOpen(false);
  };

  const openViewModal = (bovine: Bovine) => {
    setViewingBovine(bovine);
    setIsViewBovineModalOpen(true);
  };

  const openDeleteModal = (bovine: Bovine) => {
    setDeletingBovine(bovine);
    setIsDeleteModalOpen(true);
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-lg mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestión de Bovinos
              </h1>
              <p className="text-gray-600 mt-1">
                Registro, edición y administración del ganado
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                size="sm"
                onClick={() => setIsNewBovineModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Registrar Bovino
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Estadísticas del Ganado */}
          <div className="lg:col-span-12">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-[#519a7c]/20 to-[#519a7c]/10 border-[#519a7c]/40">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#519a7c]/30 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-[#519a7c]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#519a7c]">
                        Total Bovinos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.total}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500/20 to-green-500/10 border-green-500/40">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/30 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        Sanos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.healthy}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-pink-500/20 to-pink-500/10 border-pink-500/40">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-500/30 rounded-lg flex items-center justify-center">
                      <Baby className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-pink-700">
                        Gestantes
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.pregnant}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#f4ac3a]/20 to-[#f4ac3a]/10 border-[#f4ac3a]/40">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#f4ac3a]/30 rounded-lg flex items-center justify-center">
                      <Scale className="w-6 h-6 text-[#f4ac3a]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-700">
                        Peso Promedio
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.avgWeight.toFixed(0)} kg
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-amber-500/20 to-amber-500/10 border-amber-500/40">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-500/30 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-700">
                        Edad Promedio
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.avgAge} años
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Panel de Filtros */}
          <div className="lg:col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#519a7c]" />
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
                      placeholder="Nombre, arete, raza..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-[#519a7c] bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Raza */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raza
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedBreed}
                    onChange={(e) => setSelectedBreed(e.target.value)}
                  >
                    <option value="all">Todas las razas</option>
                    <option value="Holstein">Holstein</option>
                    <option value="Jersey">Jersey</option>
                    <option value="Angus">Angus</option>
                    <option value="Hereford">Hereford</option>
                    <option value="Charolais">Charolais</option>
                    <option value="Simmental">Simmental</option>
                    <option value="Brahman">Brahman</option>
                    <option value="Nelore">Nelore</option>
                    <option value="Gyr">Gyr</option>
                    <option value="Criollo">Criollo</option>
                    <option value="Mestizo">Mestizo</option>
                  </select>
                </div>

                {/* Estado de Salud */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado de Salud
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedHealthStatus}
                    onChange={(e) => setSelectedHealthStatus(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="healthy">Sano</option>
                    <option value="sick">Enfermo</option>
                    <option value="treatment">En Tratamiento</option>
                    <option value="quarantine">Cuarentena</option>
                  </select>
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexo
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedGender}
                    onChange={(e) => setSelectedGender(e.target.value)}
                  >
                    <option value="all">Ambos</option>
                    <option value="female">Hembras</option>
                    <option value="male">Machos</option>
                  </select>
                </div>

                {/* Tipo de Producción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Producción
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={selectedProductionType}
                    onChange={(e) => setSelectedProductionType(e.target.value)}
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="dairy">Lechero</option>
                    <option value="beef">Carne</option>
                    <option value="breeding">Reproducción</option>
                    <option value="dual_purpose">Doble Propósito</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Bovinos */}
          <div className="lg:col-span-8">
            <Card>
              <CardHeader>
                <CardTitle>
                  Bovinos Registrados ({filteredBovines.length})
                </CardTitle>
                <CardDescription>
                  Lista completa del ganado con información detallada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredBovines.map((bovine) => (
                    <div
                      key={bovine.id}
                      className="border border-gray-200 bg-white rounded-lg p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-xl font-semibold text-gray-900">
                              {bovine.name} ({bovine.earTag})
                            </h4>
                            <Badge variant={bovine.gender}>
                              {bovine.gender === "male" ? "Macho" : "Hembra"}
                            </Badge>
                            <Badge variant={bovine.healthStatus}>
                              {bovine.healthStatus === "healthy" ? "Sano" : 
                               bovine.healthStatus === "sick" ? "Enfermo" :
                               bovine.healthStatus === "treatment" ? "En Tratamiento" :
                               bovine.healthStatus === "quarantine" ? "Cuarentena" : "Fallecido"}
                            </Badge>
                            <Badge variant={bovine.reproductiveStatus}>
                              {bovine.reproductiveStatus === "open" ? "Vacía" :
                               bovine.reproductiveStatus === "pregnant" ? "Gestante" :
                               bovine.reproductiveStatus === "lactating" ? "Lactando" :
                               bovine.reproductiveStatus === "dry" ? "Seca" : "En Reproducción"}
                            </Badge>
                            <Badge variant={bovine.productionType}>
                              {bovine.productionType === "dairy" ? "Lechero" :
                               bovine.productionType === "beef" ? "Carne" :
                               bovine.productionType === "breeding" ? "Reproducción" : "Doble Propósito"}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-600">Raza:</p>
                              <p className="font-medium">{bovine.breed}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Edad:</p>
                              <p className="font-medium">{calculateAge(bovine.birthDate)} años</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Peso:</p>
                              <p className="font-medium">{bovine.currentWeight} kg</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Ubicación:</p>
                              <p className="font-medium">{bovine.location.sector} - {bovine.location.paddock}</p>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-200">
                            <p>
                              <strong>Color:</strong> {bovine.color} | 
                              <strong> Nacimiento:</strong> {bovine.birthDate.toLocaleDateString()} | 
                              <strong> Adquisición:</strong> {bovine.acquisitionDate.toLocaleDateString()}
                            </p>
                            {(bovine.location.latitude && bovine.location.longitude) && (
                              <p className="mt-1">
                                <strong>GPS:</strong> {bovine.location.latitude.toFixed(4)}, {bovine.location.longitude.toFixed(4)} | 
                                <a 
                                  href={`https://www.google.com/maps?q=${bovine.location.latitude},${bovine.location.longitude}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-800 underline"
                                >
                                  Ver en mapa
                                </a>
                              </p>
                            )}
                            {bovine.notes && (
                              <p className="mt-2 text-gray-700">
                                <strong>Notas:</strong> {bovine.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openViewModal(bovine)}
                            className="hover:bg-green-50 hover:border-green-300"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsEditBovineModalOpen(true)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openDeleteModal(bovine)}
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
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

      {/* Modales */}
      <NewBovineModal
        isOpen={isNewBovineModalOpen}
        onClose={() => setIsNewBovineModalOpen(false)}
        onSubmit={handleNewBovine}
      />

      <EditBovineModal
        isOpen={isEditBovineModalOpen}
        onClose={() => setIsEditBovineModalOpen(false)}
      />

      <ViewBovineModal
        isOpen={isViewBovineModalOpen}
        onClose={() => {
          setIsViewBovineModalOpen(false);
          setViewingBovine(null);
        }}
        bovine={viewingBovine}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingBovine(null);
        }}
        onConfirm={handleDeleteBovine}
        bovineName={deletingBovine?.name || ""}
      />
    </div>
  );
};

export default BovineAdd;