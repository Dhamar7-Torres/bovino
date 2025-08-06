import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  MapPin,
  Calendar,
  FileText,
  Camera,
  Upload,
  Save,
  Edit3,
  X,
  Download,
  Eye,
  Trash2,
  Building,
  Ruler,
  Globe,
  User,
  Phone,
  Mail,
  CheckCircle,
  Shield,
  TreePine,
  Droplets,
  Users,
  PlusCircle,
  Navigation,
  Loader,
  Wifi,
  WifiOff,
  AlertCircle,
  RefreshCw
} from "lucide-react";

// ============================================================================
// CONFIGURACIÓN DE API
// ============================================================================

const API_BASE_URL = 'http://localhost:5000/api';

// Servicio de API
class ApiService {
  private static token: string | null = null;

  static setAuthToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  static getAuthToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  static clearAuthToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private static async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = this.getAuthToken();
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const headers = {
      ...defaultHeaders,
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body,
      ...options,
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.clearAuthToken();
        throw new Error('Sesión expirada. Por favor inicie sesión nuevamente.');
      }
      
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Método para verificar conectividad
  static async checkHealth(): Promise<boolean> {
    try {
      await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      return true;
    } catch {
      return false;
    }
  }

  // Métodos para propiedades
  static async getPropertyInfo(): Promise<any> {
    return this.request('/ranch/property-info?includeDocuments=true&includePhotos=true');
  }

  static async savePropertyInfo(data: any): Promise<any> {
    return this.request('/ranch/property-info', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  static async updatePropertyInfo(id: string, data: any): Promise<any> {
    return this.request(`/ranch/property-info/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  static async deleteProperty(id: string): Promise<any> {
    return this.request(`/ranch/property-info/${id}`, {
      method: 'DELETE',
    });
  }

  // Métodos para documentos
  static async uploadDocuments(files: FileList, metadata: any): Promise<any> {
    const formData = new FormData();
    
    Array.from(files).forEach((file) => {
      formData.append('documents', file);
    });
    
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/ranch/documents`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al subir documentos');
    }

    return response.json();
  }

  static async deleteDocument(documentId: string): Promise<any> {
    return this.request(`/ranch/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  // Métodos para fotos
  static async uploadPhotos(files: FileList, metadata: any): Promise<any> {
    const formData = new FormData();
    
    Array.from(files).forEach((file) => {
      formData.append('photos', file);
    });
    
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });

    const token = this.getAuthToken();
    const headers: Record<string, string> = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/upload/ranch/photos`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al subir fotos');
    }

    return response.json();
  }

  static async deletePhoto(photoId: string): Promise<any> {
    return this.request(`/ranch/photos/${photoId}`, {
      method: 'DELETE',
    });
  }

  // Método para autenticación demo (crear un token temporal)
  static async loginDemo(): Promise<any> {
    return this.request('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ 
        username: 'demo_user', 
        password: 'demo123' 
      }),
    }).catch(() => {
      // Si no existe el endpoint de demo, crear token simulado
      const demoToken = 'demo-token-' + Date.now();
      this.setAuthToken(demoToken);
      return { success: true, token: demoToken };
    });
  }
}

// ============================================================================
// INTERFACES Y TIPOS (mantener las existentes)
// ============================================================================

interface PropertyDocument {
  id: string;
  name: string;
  type: "title" | "permit" | "insurance" | "certification" | "map" | "other";
  uploadDate: string;
  expirationDate?: string;
  fileSize: number;
  fileType: string;
  status: "valid" | "expired" | "pending" | "requires_renewal";
  url?: string;
}

interface PropertyPhoto {
  id: string;
  url: string;
  caption: string;
  category: "aerial" | "facilities" | "pastures" | "buildings" | "equipment" | "general";
  uploadDate: string;
  isMain: boolean;
}

interface PropertyInfo {
  basicInfo: {
    id: string;
    name: string;
    description: string;
    establishedYear: number;
    registrationNumber: string;
    propertyType: "ranch" | "farm" | "dairy" | "feedlot" | "mixed";
  };
  location: {
    address: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
    elevation: number;
    timezone: string;
  };
  dimensions: {
    totalArea: number;
    usableArea: number;
    pastureArea: number;
    buildingArea: number;
    waterBodyArea: number;
    forestArea: number;
  };
  ownership: {
    ownerName: string;
    ownerType: "individual" | "corporation" | "cooperative" | "government";
    contactInfo: {
      email: string;
      phone: string;
      alternatePhone?: string;
      website?: string;
    };
    administratorName?: string;
    administratorContact?: string;
  };
  operations: {
    primaryActivity: string[];
    secondaryActivity: string[];
    certifications: string[];
    operatingLicense: string;
    capacity: {
      maxAnimals: number;
      currentAnimals: number;
      staffCapacity: number;
      currentStaff: number;
    };
  };
  documents: PropertyDocument[];
  photos: PropertyPhoto[];
  dates: {
    lastUpdate: string;
    lastInspection?: string;
    nextInspection?: string;
    licenseRenewal?: string;
  };
}

// ============================================================================
// DATOS INICIALES VACÍOS
// ============================================================================

const createEmptyPropertyInfo = (): PropertyInfo => ({
  basicInfo: {
    id: "",
    name: "",
    description: "",
    establishedYear: new Date().getFullYear(),
    registrationNumber: "",
    propertyType: "ranch"
  },
  location: {
    address: "",
    city: "",
    state: "",
    country: "México",
    postalCode: "",
    coordinates: {
      latitude: 0,
      longitude: 0
    },
    elevation: 0,
    timezone: "America/Mexico_City"
  },
  dimensions: {
    totalArea: 0,
    usableArea: 0,
    pastureArea: 0,
    buildingArea: 0,
    waterBodyArea: 0,
    forestArea: 0
  },
  ownership: {
    ownerName: "",
    ownerType: "individual",
    contactInfo: {
      email: "",
      phone: "",
      alternatePhone: "",
      website: ""
    },
    administratorName: "",
    administratorContact: ""
  },
  operations: {
    primaryActivity: [],
    secondaryActivity: [],
    certifications: [],
    operatingLicense: "",
    capacity: {
      maxAnimals: 0,
      currentAnimals: 0,
      staffCapacity: 0,
      currentStaff: 0
    }
  },
  documents: [],
  photos: [],
  dates: {
    lastUpdate: new Date().toISOString().split('T')[0],
    lastInspection: "",
    nextInspection: "",
    licenseRenewal: ""
  }
});

// ============================================================================
// VARIANTES DE ANIMACIÓN (mantener las existentes)
// ============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  }
};

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

// Componente de estado de conectividad
const ConnectionStatus: React.FC<{
  isConnected: boolean;
  onRetry: () => void;
}> = ({ isConnected, onRetry }) => {
  if (isConnected) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-red-500 text-white p-4 rounded-lg mb-4 flex items-center justify-between shadow-lg"
    >
      <div className="flex items-center space-x-3">
        <WifiOff className="w-5 h-5" />
        <div>
          <p className="font-medium">Sin conexión al servidor</p>
          <p className="text-sm opacity-90">Verifique que el backend esté ejecutándose en el puerto 5000</p>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRetry}
        className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors flex items-center space-x-2"
      >
        <RefreshCw className="w-4 h-4" />
        <span>Reintentar</span>
      </motion.button>
    </motion.div>
  );
};

// Componente de notificación de error
const ErrorNotification: React.FC<{
  error: string | null;
  onDismiss: () => void;
}> = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-3 z-50 max-w-md"
    >
      <AlertCircle className="w-5 h-5 flex-shrink-0" />
      <p className="flex-1">{error}</p>
      <button
        onClick={onDismiss}
        className="text-white/80 hover:text-white"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// Componente EditableField (mantener el existente)
const EditableField: React.FC<{
  label: string;
  value: string | number;
  isEditing: boolean;
  onChange: (value: string) => void;
  type?: "text" | "number" | "email" | "tel" | "url";
  icon?: React.ElementType;
  required?: boolean;
}> = ({ label, value, isEditing, onChange, type = "text", icon: Icon, required = false }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      {Icon && <Icon className="w-5 h-5 text-[#519a7c] flex-shrink-0" />}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </p>
        {isEditing ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            required={required}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
            placeholder={`Ingrese ${label.toLowerCase()}`}
          />
        ) : (
          <p className="font-medium text-[#2d5a45]">
            {value || <span className="text-gray-400 italic">Sin especificar</span>}
          </p>
        )}
      </div>
    </div>
  );
};

// Componentes DocumentCard y PhotoCard actualizados
const DocumentCard: React.FC<{
  document: PropertyDocument;
  onView: () => void;
  onDownload: () => void;
  onDelete: () => void;
}> = ({ document, onView, onDownload, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid": return "bg-green-100 text-green-800";
      case "expired": return "bg-red-100 text-red-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "requires_renewal": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "valid": return "Vigente";
      case "expired": return "Expirado";
      case "pending": return "Pendiente";
      case "requires_renewal": return "Renovar";
      default: return "Desconocido";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "title": return FileText;
      case "permit": return Shield;
      case "insurance": return Shield;
      case "certification": return CheckCircle;
      case "map": return MapPin;
      default: return FileText;
    }
  };

  const TypeIcon = getTypeIcon(document.type);

  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#519a7c] bg-opacity-10 rounded-lg flex items-center justify-center">
            <TypeIcon className="w-5 h-5 text-[#519a7c]" />
          </div>
          <div>
            <h4 className="font-medium text-[#2d5a45]">{document.name}</h4>
            <p className="text-sm text-gray-600">{document.fileType} • {document.fileSize} MB</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
          {getStatusText(document.status)}
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-3">
        <p>Subido: {new Date(document.uploadDate).toLocaleDateString('es-MX', { 
          year: 'numeric', 
          month: '2-digit', 
          day: '2-digit' 
        })}</p>
        {document.expirationDate && (
          <p>Expira: {new Date(document.expirationDate).toLocaleDateString('es-MX', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          })}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onView}
          className="flex-1 px-3 py-2 bg-[#519a7c] text-white text-sm rounded-md hover:bg-[#2d5a45] transition-colors"
        >
          <Eye className="w-4 h-4 inline mr-1" />
          Ver
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDownload}
          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-50 transition-colors"
        >
          <Download className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDelete}
          className="px-3 py-2 border border-red-300 text-red-700 text-sm rounded-md hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};

const PhotoCard: React.FC<{
  photo: PropertyPhoto;
  onSetMain: () => void;
  onDelete: () => void;
}> = ({ photo, onSetMain, onDelete }) => {
  return (
    <motion.div
      variants={cardVariants}
      whileHover="hover"
      className="relative bg-white rounded-lg overflow-hidden shadow-md"
    >
      <div className="aspect-video bg-gray-200 relative">
        <img
          src={photo.url}
          alt={photo.caption}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3f4f6'/%3E%3Ctext x='200' y='150' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='14' fill='%236b7280'%3EImagen no disponible%3C/text%3E%3C/svg%3E";
          }}
        />
        
        {photo.isMain && (
          <div className="absolute top-2 left-2 bg-[#519a7c] text-white px-2 py-1 rounded-md text-xs font-medium">
            Principal
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex space-x-1">
          {!photo.isMain && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onSetMain}
              className="w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
            >
              <CheckCircle className="w-4 h-4" />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onDelete}
            className="w-8 h-8 bg-black bg-opacity-50 text-white rounded-full flex items-center justify-center hover:bg-opacity-70"
          >
            <Trash2 className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
      
      <div className="p-3">
        <p className="font-medium text-[#2d5a45] text-sm">{photo.caption}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
          <span className="capitalize">{photo.category}</span>
          <span>{new Date(photo.uploadDate).toLocaleDateString('es-MX', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
          })}</span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const PropertyInfo: React.FC = () => {
  // Estados existentes
  const [propertyData, setPropertyData] = useState<PropertyInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "documents" | "photos">("basic");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Nuevos estados para backend
  const [isConnected, setIsConnected] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedData, setLastSavedData] = useState<PropertyInfo | null>(null);

  // Referencias
  const documentInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // FUNCIONES DE BACKEND
  // ============================================================================

  // Verificar conectividad
  const checkConnection = useCallback(async () => {
    try {
      const connected = await ApiService.checkHealth();
      setIsConnected(connected);
      if (!connected) {
        setError('No se pudo conectar con el servidor en el puerto 5000');
      }
      return connected;
    } catch (error) {
      setIsConnected(false);
      setError('Error de conectividad con el backend');
      return false;
    }
  }, []);

  // Cargar datos existentes
  const loadPropertyData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Verificar conexión primero
      const connected = await checkConnection();
      if (!connected) return;

      const response = await ApiService.getPropertyInfo();
      
      if (response.success && response.data) {
        setPropertyData(response.data);
        setLastSavedData(response.data);
      }
    } catch (error) {
      console.error('Error cargando propiedad:', error);
      if (error instanceof Error) {
        if (error.message.includes('401') || error.message.includes('Sesión expirada')) {
          // Intentar login demo
          try {
            await ApiService.loginDemo();
            // Reintentar después del login
            const response = await ApiService.getPropertyInfo();
            if (response.success && response.data) {
              setPropertyData(response.data);
              setLastSavedData(response.data);
            }
          } catch (loginError) {
            setError('Error de autenticación. Usando modo offline.');
            // Continuar sin datos del backend
          }
        } else {
          setError(error.message);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkConnection]);

  // Guardar propiedad
  const savePropertyData = useCallback(async (data: PropertyInfo) => {
    try {
      setIsSaving(true);
      setError(null);

      let response;
      if (data.basicInfo.id && lastSavedData) {
        // Actualizar existente
        response = await ApiService.updatePropertyInfo(data.basicInfo.id, data);
      } else {
        // Crear nueva
        response = await ApiService.savePropertyInfo(data);
      }

      if (response.success) {
        setLastSavedData(data);
        setError(null);
        return true;
      } else {
        throw new Error(response.message || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error guardando propiedad:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [lastSavedData]);

  // Eliminar propiedad
  const deletePropertyData = useCallback(async (propertyId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await ApiService.deleteProperty(propertyId);
      
      if (response.success) {
        setPropertyData(null);
        setLastSavedData(null);
        return true;
      } else {
        throw new Error(response.message || 'Error al eliminar');
      }
    } catch (error) {
      console.error('Error eliminando propiedad:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Cargar datos al iniciar
  useEffect(() => {
    loadPropertyData();
  }, [loadPropertyData]);

  // Verificar conexión periódicamente
  useEffect(() => {
    const interval = setInterval(checkConnection, 30000); // cada 30 segundos
    return () => clearInterval(interval);
  }, [checkConnection]);

  // ============================================================================
  // HANDLERS ACTUALIZADOS
  // ============================================================================

  // Función para obtener ubicación actual (mantener la existente)
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("La geolocalización no está soportada en este navegador");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        
        setPropertyData(prev => prev ? ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: { latitude, longitude }
          }
        }) : null);

        // Intentar obtener la dirección usando reverse geocoding
        fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`)
          .then(response => response.json())
          .then(data => {
            if (data && propertyData) {
              setPropertyData(prev => prev ? ({
                ...prev,
                location: {
                  ...prev.location,
                  address: data.locality || prev.location.address,
                  city: data.city || prev.location.city,
                  state: data.principalSubdivision || prev.location.state,
                  country: data.countryName || prev.location.country,
                  postalCode: data.postcode || prev.location.postalCode
                }
              }) : null);
            }
          })
          .catch(error => {
            console.warn("No se pudo obtener la dirección:", error);
          })
          .finally(() => {
            setIsGettingLocation(false);
          });
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = "No se pudo obtener la ubicación";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado. Por favor, habilite la ubicación en su navegador.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Información de ubicación no disponible.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado para obtener la ubicación.";
            break;
        }
        
        setError(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  }, [propertyData]);

  // Crear nueva propiedad
  const handleCreateNew = () => {
    const newProperty = createEmptyPropertyInfo();
    newProperty.basicInfo.id = `property-${Date.now()}`;
    setPropertyData(newProperty);
    setIsEditing(true);
  };

  // Subida de documentos con backend real
  const handleDocumentUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const metadata = {
        type: 'other',
        documentType: 'ranch_document',
        description: 'Documento subido desde la interfaz de propiedad'
      };

      const response = await ApiService.uploadDocuments(files, metadata);

      if (response.success) {
        // Convertir respuesta del backend al formato esperado
        const newDocuments: PropertyDocument[] = response.data.map((doc: any) => ({
          id: doc.id,
          name: doc.originalName || files[0].name,
          type: "other",
          uploadDate: new Date().toISOString().split('T')[0],
          fileSize: Math.round(doc.size / (1024 * 1024) * 100) / 100,
          fileType: doc.mimetype?.includes('pdf') ? 'PDF' : 'DOC',
          status: "valid" as const,
          url: doc.url
        }));

        setPropertyData(prev => prev ? ({
          ...prev,
          documents: [...prev.documents, ...newDocuments]
        }) : null);

        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      } else {
        throw new Error(response.message || 'Error al subir documentos');
      }
    } catch (error) {
      console.error('Error subiendo documentos:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
      setIsUploading(false);
      setUploadProgress(0);
    }

    event.target.value = '';
  }, []);

  // Subida de fotos con backend real
  const handlePhotoUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);

      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const metadata = {
        category: 'general',
        description: 'Foto subida desde la interfaz de propiedad'
      };

      const response = await ApiService.uploadPhotos(files, metadata);

      if (response.success) {
        const newPhotos: PropertyPhoto[] = response.data.map((photo: any, index: number) => ({
          id: photo.id,
          url: photo.url || "/api/placeholder/400/300",
          caption: `Foto del rancho ${index + 1}`,
          category: "general" as const,
          uploadDate: new Date().toISOString().split('T')[0],
          isMain: propertyData?.photos.length === 0 && index === 0
        }));

        setPropertyData(prev => prev ? ({
          ...prev,
          photos: [...prev.photos, ...newPhotos]
        }) : null);

        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000);
      } else {
        throw new Error(response.message || 'Error al subir fotos');
      }
    } catch (error) {
      console.error('Error subiendo fotos:', error);
      if (error instanceof Error) {
        setError(error.message);
      }
      setIsUploading(false);
      setUploadProgress(0);
    }

    event.target.value = '';
  }, [propertyData?.photos.length]);

  // Función para guardar cambios
  const handleSave = async () => {
    if (!propertyData) return;
    
    // Validar campos requeridos
    const requiredFields = [
      propertyData.basicInfo.name,
      propertyData.ownership.ownerName,
      propertyData.location.address,
      propertyData.location.city,
      propertyData.location.state
    ];

    if (requiredFields.some(field => !field.trim())) {
      setError("Por favor complete los campos requeridos (marcados con *)");
      return;
    }

    // Validar capacidades
    if (propertyData.operations.capacity.currentAnimals > propertyData.operations.capacity.maxAnimals) {
      setError("Los animales actuales no pueden ser mayores a la capacidad máxima");
      return;
    }

    if (propertyData.operations.capacity.currentStaff > propertyData.operations.capacity.staffCapacity) {
      setError("El personal actual no puede ser mayor a la capacidad de personal");
      return;
    }

    const success = await savePropertyData(propertyData);
    
    if (success) {
      setIsEditing(false);
      setError(null);
    }
  };

  // Función para cancelar edición
  const handleCancel = () => {
    if (lastSavedData) {
      // Restaurar datos guardados
      setPropertyData(lastSavedData);
    } else {
      // Si era nueva propiedad, limpiar
      setPropertyData(null);
    }
    setIsEditing(false);
    setError(null);
  };

  // Función para eliminar información
  const handleDelete = async () => {
    if (!propertyData?.basicInfo.id) return;
    
    if (window.confirm("¿Está seguro que desea eliminar toda la información de la propiedad? Esta acción no se puede deshacer.")) {
      const success = await deletePropertyData(propertyData.basicInfo.id);
      if (success) {
        setIsEditing(false);
        setActiveTab("basic");
      }
    }
  };

  // Función para descartar error
  const dismissError = () => {
    setError(null);
  };

  // Función para reintentar conexión
  const retryConnection = async () => {
    await checkConnection();
    if (isConnected) {
      await loadPropertyData();
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  // Tabs de navegación
  const tabs = [
    { id: "basic", label: "Información Básica", icon: Building },
    { id: "documents", label: "Documentos", icon: FileText },
    { id: "photos", label: "Fotografías", icon: Camera },
  ] as const;

  // Mostrar loading inicial
  if (isLoading && !propertyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl text-center"
        >
          <Loader className="w-12 h-12 text-[#519a7c] animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#2d5a45] mb-2">Conectando con el servidor...</h2>
          <p className="text-gray-600">Verificando datos existentes en el puerto 5000</p>
        </motion.div>
      </div>
    );
  }

  // Si no hay datos, mostrar pantalla de inicio
  if (!propertyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
        <div className="max-w-4xl mx-auto">
          {/* Estado de conectividad */}
          <ConnectionStatus 
            isConnected={isConnected} 
            onRetry={retryConnection}
          />
          
          {/* Notificación de error */}
          <ErrorNotification 
            error={error} 
            onDismiss={dismissError}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-white/20">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-24 h-24 bg-[#519a7c] bg-opacity-10 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <div className="relative">
                  <Building className="w-12 h-12 text-[#519a7c]" />
                  {isConnected && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <Wifi className="w-2 h-2 text-white" />
                    </div>
                  )}
                </div>
              </motion.div>
              
              <h1 className="text-4xl font-bold text-[#2d5a45] mb-4">
                Sistema de Gestión de Propiedades
              </h1>
              
              <p className="text-lg text-gray-600 mb-2 max-w-2xl mx-auto">
                Crea la información de tu propiedad para gestionar todos los datos, 
                documentos y fotografías de tu rancho de manera organizada.
              </p>

              <div className="flex items-center justify-center space-x-2 text-sm mb-8">
                {isConnected ? (
                  <div className="flex items-center text-green-600">
                    <Wifi className="w-4 h-4 mr-1" />
                    Conectado al servidor (Puerto 5000)
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <WifiOff className="w-4 h-4 mr-1" />
                    Sin conexión al servidor
                  </div>
                )}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateNew}
                disabled={isSaving}
                className="px-8 py-4 bg-[#519a7c] text-white rounded-xl hover:bg-[#2d5a45] transition-colors flex items-center mx-auto text-lg font-medium shadow-lg disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader className="w-6 h-6 mr-3 animate-spin" />
                ) : (
                  <PlusCircle className="w-6 h-6 mr-3" />
                )}
                {isSaving ? 'Creando...' : 'Crear Nueva Propiedad'}
              </motion.button>
              
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: Building, title: "Información Básica", desc: "Datos generales y ubicación" },
                  { icon: FileText, title: "Documentos", desc: "Gestión de archivos importantes" },
                  { icon: Camera, title: "Fotografías", desc: "Galería visual de la propiedad" }
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="text-center p-4"
                  >
                    <div className="w-12 h-12 bg-[#519a7c] bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <feature.icon className="w-6 h-6 text-[#519a7c]" />
                    </div>
                    <h3 className="font-semibold text-[#2d5a45] mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Estado de conectividad */}
        <ConnectionStatus 
          isConnected={isConnected} 
          onRetry={retryConnection}
        />
        
        {/* Notificación de error */}
        <ErrorNotification 
          error={error} 
          onDismiss={dismissError}
        />

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-4xl font-bold text-[#2d5a45] mb-2">
                  {propertyData.basicInfo.name || "Nueva Propiedad"}
                </h1>
                <p className="text-gray-600 text-lg">
                  {isEditing ? "Editando información" : 
                   lastSavedData ? "Información guardada - Puede editar o eliminar" :
                   "Gestiona toda la información del rancho"}
                </p>
              </div>
              {/* Indicador de estado */}
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <div className="flex items-center text-green-600 text-sm">
                    <Wifi className="w-4 h-4 mr-1" />
                    Online
                  </div>
                ) : (
                  <div className="flex items-center text-red-600 text-sm">
                    <WifiOff className="w-4 h-4 mr-1" />
                    Offline
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors flex items-center disabled:opacity-50"
                  >
                    {isSaving ? (
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center disabled:opacity-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </motion.button>
                </>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors flex items-center"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar
                  </motion.button>
                  {lastSavedData && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDelete}
                      disabled={isLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      {isLoading ? 'Eliminando...' : 'Eliminar'}
                    </motion.button>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-2">
            <div className="flex space-x-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg transition-colors ${
                      isActive 
                        ? "bg-[#519a7c] text-white" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Progress Bar para uploads */}
        {isUploading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#2d5a45] flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Subiendo archivo...
              </span>
              <span className="text-sm text-gray-600">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-[#519a7c] h-2 rounded-full"
                style={{ width: `${uploadProgress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}

        {/* Content based on active tab */}
        <motion.div variants={itemVariants}>
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información Básica */}
              <motion.div
                variants={cardVariants}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
              >
                <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Datos Generales</h3>
                <div className="space-y-4">
                  <EditableField
                    label="Nombre del Rancho"
                    value={propertyData.basicInfo.name}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, name: value }
                    }) : null)}
                    icon={Building}
                    required
                  />
                  <EditableField
                    label="Descripción"
                    value={propertyData.basicInfo.description}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, description: value }
                    }) : null)}
                    icon={FileText}
                  />
                  <EditableField
                    label="Año de Establecimiento"
                    value={propertyData.basicInfo.establishedYear.toString()}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, establishedYear: parseInt(value) || new Date().getFullYear() }
                    }) : null)}
                    type="number"
                    icon={Calendar}
                  />
                  <EditableField
                    label="Número de Registro"
                    value={propertyData.basicInfo.registrationNumber}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, registrationNumber: value }
                    }) : null)}
                    icon={Shield}
                  />
                </div>
              </motion.div>

              {/* Ubicación */}
              <motion.div
                variants={cardVariants}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-[#2d5a45]">Ubicación</h3>
                  {isEditing && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm disabled:opacity-50"
                    >
                      {isGettingLocation ? (
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Navigation className="w-4 h-4 mr-2" />
                      )}
                      {isGettingLocation ? "Obteniendo..." : "Mi Ubicación"}
                    </motion.button>
                  )}
                </div>
                <div className="space-y-4">
                  <EditableField
                    label="Dirección"
                    value={propertyData.location.address}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      location: { ...prev.location, address: value }
                    }) : null)}
                    icon={MapPin}
                    required
                  />
                  <EditableField
                    label="Ciudad"
                    value={propertyData.location.city}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      location: { ...prev.location, city: value }
                    }) : null)}
                    icon={Building}
                    required
                  />
                  <EditableField
                    label="Estado"
                    value={propertyData.location.state}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      location: { ...prev.location, state: value }
                    }) : null)}
                    icon={Globe}
                    required
                  />
                  <EditableField
                    label="Código Postal"
                    value={propertyData.location.postalCode}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      location: { ...prev.location, postalCode: value }
                    }) : null)}
                    icon={Mail}
                  />
                  
                  {/* Coordenadas */}
                  <div className="grid grid-cols-2 gap-4">
                    <EditableField
                      label="Latitud"
                      value={propertyData.location.coordinates.latitude.toString()}
                      isEditing={isEditing}
                      onChange={(value) => setPropertyData(prev => prev ? ({
                        ...prev,
                        location: { 
                          ...prev.location, 
                          coordinates: { 
                            ...prev.location.coordinates, 
                            latitude: parseFloat(value) || 0 
                          }
                        }
                      }) : null)}
                      type="number"
                      icon={MapPin}
                    />
                    <EditableField
                      label="Longitud"
                      value={propertyData.location.coordinates.longitude.toString()}
                      isEditing={isEditing}
                      onChange={(value) => setPropertyData(prev => prev ? ({
                        ...prev,
                        location: { 
                          ...prev.location, 
                          coordinates: { 
                            ...prev.location.coordinates, 
                            longitude: parseFloat(value) || 0 
                          }
                        }
                      }) : null)}
                      type="number"
                      icon={MapPin}
                    />
                  </div>
                </div>
              </motion.div>

              {/* Dimensiones */}
              <motion.div
                variants={cardVariants}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
              >
                <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Dimensiones</h3>
                <div className="space-y-4">
                  <EditableField
                    label="Área Total (hectáreas)"
                    value={propertyData.dimensions.totalArea.toString()}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      dimensions: { ...prev.dimensions, totalArea: parseFloat(value) || 0 }
                    }) : null)}
                    type="number"
                    icon={Ruler}
                  />
                  <EditableField
                    label="Área de Pastoreo (hectáreas)"
                    value={propertyData.dimensions.pastureArea.toString()}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      dimensions: { ...prev.dimensions, pastureArea: parseFloat(value) || 0 }
                    }) : null)}
                    type="number"
                    icon={TreePine}
                  />
                  <EditableField
                    label="Área de Construcciones (m²)"
                    value={propertyData.dimensions.buildingArea.toString()}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      dimensions: { ...prev.dimensions, buildingArea: parseFloat(value) || 0 }
                    }) : null)}
                    type="number"
                    icon={Building}
                  />
                  <EditableField
                    label="Área de Cuerpos de Agua (hectáreas)"
                    value={propertyData.dimensions.waterBodyArea.toString()}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      dimensions: { ...prev.dimensions, waterBodyArea: parseFloat(value) || 0 }
                    }) : null)}
                    type="number"
                    icon={Droplets}
                  />
                </div>
              </motion.div>

              {/* Información del Propietario */}
              <motion.div
                variants={cardVariants}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
              >
                <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Propietario</h3>
                <div className="space-y-4">
                  <EditableField
                    label="Nombre del Propietario"
                    value={propertyData.ownership.ownerName}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      ownership: { ...prev.ownership, ownerName: value }
                    }) : null)}
                    icon={User}
                    required
                  />
                  <EditableField
                    label="Email"
                    value={propertyData.ownership.contactInfo.email}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      ownership: {
                        ...prev.ownership,
                        contactInfo: { ...prev.ownership.contactInfo, email: value }
                      }
                    }) : null)}
                    type="email"
                    icon={Mail}
                  />
                  <EditableField
                    label="Teléfono"
                    value={propertyData.ownership.contactInfo.phone}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      ownership: {
                        ...prev.ownership,
                        contactInfo: { ...prev.ownership.contactInfo, phone: value }
                      }
                    }) : null)}
                    type="tel"
                    icon={Phone}
                  />
                  <EditableField
                    label="Administrador"
                    value={propertyData.ownership.administratorName || ""}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      ownership: { ...prev.ownership, administratorName: value }
                    }) : null)}
                    icon={Users}
                  />
                </div>
              </motion.div>

              {/* Capacidad Operacional */}
              <motion.div
                variants={cardVariants}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 lg:col-span-2"
              >
                <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Capacidad Operacional</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <EditableField
                    label="Capacidad Máxima de Animales"
                    value={propertyData.operations.capacity.maxAnimals.toString()}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      operations: {
                        ...prev.operations,
                        capacity: { ...prev.operations.capacity, maxAnimals: parseInt(value) || 0 }
                      }
                    }) : null)}
                    type="number"
                    icon={CheckCircle}
                  />

                  <EditableField
                    label="Animales Actuales"
                    value={propertyData.operations.capacity.currentAnimals.toString()}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      operations: {
                        ...prev.operations,
                        capacity: { ...prev.operations.capacity, currentAnimals: parseInt(value) || 0 }
                      }
                    }) : null)}
                    type="number"
                    icon={CheckCircle}
                  />

                  <EditableField
                    label="Capacidad de Personal"
                    value={propertyData.operations.capacity.staffCapacity.toString()}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      operations: {
                        ...prev.operations,
                        capacity: { ...prev.operations.capacity, staffCapacity: parseInt(value) || 0 }
                      }
                    }) : null)}
                    type="number"
                    icon={Users}
                  />

                  <EditableField
                    label="Personal Actual"
                    value={propertyData.operations.capacity.currentStaff.toString()}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      operations: {
                        ...prev.operations,
                        capacity: { ...prev.operations.capacity, currentStaff: parseInt(value) || 0 }
                      }
                    }) : null)}
                    type="number"
                    icon={Users}
                  />
                </div>
              </motion.div>
            </div>
          )}

          {activeTab === "documents" && (
            <div>
              {/* Header con botón de subida */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-[#2d5a45]">Documentos del Rancho</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => documentInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors flex items-center disabled:opacity-50"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Subir Documento
                </motion.button>
                <input
                  ref={documentInputRef}
                  type="file"
                  onChange={handleDocumentUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  className="hidden"
                />
              </div>

              {/* Grid de documentos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertyData.documents.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onView={() => {
                      if (document.url) {
                        window.open(document.url, '_blank');
                      } else {
                        setError('URL del documento no disponible');
                      }
                    }}
                    onDownload={() => {
                      if (document.url) {
                        const a = window.document.createElement('a');
                        a.href = document.url;
                        a.download = document.name;
                        a.click();
                      } else {
                        setError('No se puede descargar el documento');
                      }
                    }}
                    onDelete={async () => {
                      if (window.confirm(`¿Está seguro que desea eliminar "${document.name}"?`)) {
                        try {
                          await ApiService.deleteDocument(document.id);
                          setPropertyData(prev => prev ? ({
                            ...prev,
                            documents: prev.documents.filter(doc => doc.id !== document.id)
                          }) : null);
                        } catch (error) {
                          console.error('Error eliminando documento:', error);
                          if (error instanceof Error) {
                            setError(error.message);
                          }
                        }
                      }
                    }}
                  />
                ))}
              </div>

              {propertyData.documents.length === 0 && (
                <motion.div
                  variants={cardVariants}
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-white/20 text-center"
                >
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay documentos</h3>
                  <p className="text-gray-600 mb-4">Sube el primer documento para comenzar</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => documentInputRef.current?.click()}
                    className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors"
                  >
                    Subir Documento
                  </motion.button>
                </motion.div>
              )}
            </div>
          )}

          {activeTab === "photos" && (
            <div>
              {/* Header con botón de subida */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold text-[#2d5a45]">Fotografías del Rancho</h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => photoInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors flex items-center disabled:opacity-50"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Subir Foto
                </motion.button>
                <input
                  ref={photoInputRef}
                  type="file"
                  onChange={handlePhotoUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>

              {/* Grid de fotos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {propertyData.photos.map((photo) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    onSetMain={() => {
                      setPropertyData(prev => prev ? ({
                        ...prev,
                        photos: prev.photos.map(p => ({
                          ...p,
                          isMain: p.id === photo.id
                        }))
                      }) : null);
                    }}
                    onDelete={async () => {
                      if (window.confirm('¿Está seguro que desea eliminar esta foto?')) {
                        try {
                          await ApiService.deletePhoto(photo.id);
                          setPropertyData(prev => prev ? ({
                            ...prev,
                            photos: prev.photos.filter(p => p.id !== photo.id)
                          }) : null);
                        } catch (error) {
                          console.error('Error eliminando foto:', error);
                          if (error instanceof Error) {
                            setError(error.message);
                          }
                        }
                      }
                    }}
                  />
                ))}
              </div>

              {propertyData.photos.length === 0 && (
                <motion.div
                  variants={cardVariants}
                  className="bg-white/90 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-white/20 text-center"
                >
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay fotografías</h3>
                  <p className="text-gray-600 mb-4">Sube la primera foto para comenzar</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => photoInputRef.current?.click()}
                    className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors"
                  >
                    Subir Foto
                  </motion.button>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PropertyInfo;