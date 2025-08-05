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
  Baby,
  Scale,
  Tag,
  AlertCircle,
  Navigation,
  Loader2,
  Wifi,
  WifiOff,
  RefreshCw,
} from "lucide-react";

// Configuración de la API
const API_BASE_URL = 'http://localhost:5000/api'; // Configurado para puerto 5000

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

// Servicio API para bovinos
class BovineApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Obtener todos los bovinos
  async getBovines(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}/bovines?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching bovines:', error);
      throw error;
    }
  }

  // Crear nuevo bovino
  async createBovine(bovineData: BovineForm) {
    try {
      const response = await fetch(`${this.baseUrl}/bovines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bovineData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating bovine:', error);
      throw error;
    }
  }

  // Actualizar bovino
  async updateBovine(id: string, bovineData: BovineForm) {
    try {
      const response = await fetch(`${this.baseUrl}/bovines/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bovineData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error updating bovine:', error);
      throw error;
    }
  }

  // Eliminar bovino
  async deleteBovine(id: string) {
    try {
      const response = await fetch(`${this.baseUrl}/bovines/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error deleting bovine:', error);
      throw error;
    }
  }

  // Probar conexión con el servidor
  async testConnection() {
    try {
      const response = await fetch(`${this.baseUrl}/ping`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error testing connection:', error);
      throw error;
    }
  }
}

// Instancia del servicio API
const bovineApi = new BovineApiService(API_BASE_URL);

// Componentes reutilizables con fondo blanco sólido
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
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
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

// Componente para probar conexión con el backend
const ConnectionTest = ({ onConnectionStatus }: { onConnectionStatus: (status: boolean) => void }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTest, setLastTest] = useState<Date | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      await bovineApi.testConnection();
      setIsConnected(true);
      onConnectionStatus(true);
      setLastTest(new Date());
    } catch (error) {
      setIsConnected(false);
      onConnectionStatus(false);
      console.error('Connection test failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
        ) : isConnected === true ? (
          <Wifi className="w-4 h-4 text-green-600" />
        ) : isConnected === false ? (
          <WifiOff className="w-4 h-4 text-red-600" />
        ) : (
          <Wifi className="w-4 h-4 text-gray-400" />
        )}
        
        <span className="text-sm font-medium">
          {isLoading ? 'Probando conexión...' :
           isConnected === true ? 'Conectado al backend' :
           isConnected === false ? 'Sin conexión al backend' :
           'Estado desconocido'}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={testConnection}
        disabled={isLoading}
        className="ml-auto"
      >
        <RefreshCw className={`w-3 h-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
        Probar
      </Button>

      {lastTest && (
        <span className="text-xs text-gray-500">
          Última prueba: {lastTest.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

// Modal para Nuevo Bovino con conexión al backend
const NewBovineModal = ({
  isOpen,
  onClose,
  onSubmit,
  isConnected,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: BovineForm) => void;
  isConnected: boolean;
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!formData.earTag || !formData.name || !formData.breed || !formData.sector || !formData.paddock) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }
    
    if (!isConnected) {
      alert("No hay conexión con el servidor. Los datos se guardarán localmente.");
      onSubmit(formData);
      resetForm();
      onClose();
      return;
    }

    setIsSubmitting(true);
    
    try {
      await bovineApi.createBovine(formData);
      alert("Bovino registrado exitosamente en el servidor");
      onSubmit(formData);
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error al crear bovino:', error);
      alert(`Error al registrar bovino: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto border border-gray-200 shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900">Registrar Nuevo Bovino</h2>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Estado de conexión */}
          <div className={`p-3 rounded-lg border ${isConnected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-yellow-600" />
              )}
              <span className="text-sm font-medium">
                {isConnected ? 'Conectado al servidor - Los datos se guardarán en la base de datos' : 'Sin conexión - Los datos se guardarán localmente'}
              </span>
            </div>
          </div>

          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5 text-blue-600" />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.earTag}
                  onChange={(e) => setFormData({...formData, earTag: e.target.value})}
                  placeholder="Ej: COW001, B-123"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nombre del bovino"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raza *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.breed}
                  onChange={(e) => setFormData({...formData, breed: e.target.value})}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})}
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
              <MapPin className="w-5 h-5 text-orange-600" />
              Ubicación
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleGetLocation}
                  disabled={isGettingLocation || isSubmitting}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: parseFloat(e.target.value) || 0})}
                    placeholder="17.9869"
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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
                    disabled={isSubmitting}
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

          {/* Notas */}
          <div>
            <h3 className="text-lg font-medium mb-4">Notas Adicionales</h3>
            <textarea
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Observaciones, características especiales, historial médico, etc."
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? 'Registrando...' : 'Registrar Bovino'}
            </Button>
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
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos del servidor
  const loadBovinesFromServer = async () => {
    setIsLoading(true);
    try {
      const response = await bovineApi.getBovines();
      if (response.success && response.data) {
        // Adaptar los datos del servidor al formato del frontend
        const adaptedBovines = (response.data.bovines || []).map((bovine: any) => ({
          ...bovine,
          birthDate: new Date(bovine.birthDate),
          acquisitionDate: new Date(bovine.acquisitionDate),
          createdAt: new Date(bovine.createdAt),
          lastUpdated: new Date(bovine.lastUpdated),
        }));
        
        setBovines(adaptedBovines);
        
        // Calcular estadísticas
        const calculatedStats = calculateStats(adaptedBovines);
        setStats(calculatedStats);
      }
    } catch (error) {
      console.error('Error loading bovines from server:', error);
      // Cargar datos mock si no hay conexión
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos mock como fallback
  const loadMockData = () => {
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
      }
    ];

    setBovines(mockBovines);
    setStats(calculateStats(mockBovines));
  };

  // Calcular estadísticas
  const calculateStats = (bovinesList: Bovine[]): BovineStats => {
    return {
      total: bovinesList.length,
      healthy: bovinesList.filter(b => b.healthStatus === "healthy").length,
      sick: bovinesList.filter(b => b.healthStatus === "sick" || b.healthStatus === "treatment").length,
      pregnant: bovinesList.filter(b => b.reproductiveStatus === "pregnant").length,
      lactating: bovinesList.filter(b => b.reproductiveStatus === "lactating").length,
      males: bovinesList.filter(b => b.gender === "male").length,
      females: bovinesList.filter(b => b.gender === "female").length,
      avgAge: bovinesList.length > 0 ? bovinesList.reduce((sum, b) => sum + calculateAge(b.birthDate), 0) / bovinesList.length : 0,
      avgWeight: bovinesList.length > 0 ? bovinesList.reduce((sum, b) => sum + b.currentWeight, 0) / bovinesList.length : 0,
      newBirths: bovinesList.filter(b => {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        return b.birthDate >= oneMonthAgo;
      }).length,
    };
  };

  // Calcular edad
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

  // Cargar datos al iniciar
  useEffect(() => {
    if (isConnected) {
      loadBovinesFromServer();
    } else {
      loadMockData();
      setIsLoading(false);
    }
  }, [isConnected]);

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

  // Manejar nuevo bovino
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
    setStats(calculateStats([newBovine, ...bovines]));
    
    // Recargar desde servidor si está conectado
    if (isConnected) {
      setTimeout(() => loadBovinesFromServer(), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-lg animate-slideDown">
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
          
          {/* Prueba de conexión */}
          <div className="mt-4">
            <ConnectionTest onConnectionStatus={setIsConnected} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Estadísticas del Ganado */}
          <div className="lg:col-span-12 animate-slideUp">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              <Card className="bg-blue-50 border-blue-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-blue-700">
                        Total Bovinos
                      </p>
                      <p className="text-2xl font-bold text-blue-900">
                        {stats.total}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-700">
                        Sanos
                      </p>
                      <p className="text-2xl font-bold text-green-900">
                        {stats.healthy}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-pink-50 border-pink-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                      <Baby className="w-6 h-6 text-pink-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-pink-700">
                        Gestantes
                      </p>
                      <p className="text-2xl font-bold text-pink-900">
                        {stats.pregnant}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Scale className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-700">
                        Peso Promedio
                      </p>
                      <p className="text-2xl font-bold text-orange-900">
                        {stats.avgWeight.toFixed(0)} kg
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-yellow-50 border-yellow-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-700">
                        Edad Promedio
                      </p>
                      <p className="text-2xl font-bold text-yellow-900">
                        {stats.avgAge.toFixed(1)} años
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Panel de Filtros */}
          <div className="lg:col-span-4 animate-slideLeft">
            <Card>
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
                      placeholder="Nombre, arete, raza..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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

                {/* Botón para recargar datos */}
                {isConnected && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={loadBovinesFromServer}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? 'Cargando...' : 'Recargar datos'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lista de Bovinos */}
          <div className="lg:col-span-8 animate-slideRight">
            <Card>
              <CardHeader>
                <CardTitle>
                  Bovinos Registrados ({filteredBovines.length})
                </CardTitle>
                <CardDescription>
                  Lista completa del ganado con información detallada
                  {!isConnected && (
                    <span className="text-yellow-600 ml-2">(Datos locales - Sin conexión al servidor)</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Cargando bovinos...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBovines.map((bovine) => (
                      <div
                        key={bovine.id}
                        className="border border-gray-200 bg-white rounded-lg p-6 hover:shadow-lg hover:scale-101 transition-all duration-200"
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
                              className="hover:bg-green-50 hover:border-green-300"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {filteredBovines.length === 0 && (
                      <div className="text-center py-8">
                        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No se encontraron bovinos que coincidan con los filtros</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal para Nuevo Bovino */}
      <NewBovineModal
        isOpen={isNewBovineModalOpen}
        onClose={() => setIsNewBovineModalOpen(false)}
        onSubmit={handleNewBovine}
        isConnected={isConnected}
      />

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out 0.1s both;
        }

        .animate-slideLeft {
          animation: slideLeft 0.5s ease-out 0.2s both;
        }

        .animate-slideRight {
          animation: slideRight 0.5s ease-out 0.3s both;
        }

        .hover\\:scale-101:hover {
          transform: scale(1.01);
        }
      `}</style>
    </div>
  );
};

export default BovineAdd;