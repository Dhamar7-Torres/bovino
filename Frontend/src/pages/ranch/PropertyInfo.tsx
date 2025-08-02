import React, { useState, useRef, useCallback } from "react";
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
} from "lucide-react";

// ============================================================================
// INTERFACES Y TIPOS
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
  // Información básica
  basicInfo: {
    id: string;
    name: string;
    description: string;
    establishedYear: number;
    registrationNumber: string;
    propertyType: "ranch" | "farm" | "dairy" | "feedlot" | "mixed";
  };

  // Ubicación y dimensiones
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

  // Dimensiones de la propiedad
  dimensions: {
    totalArea: number; // hectáreas
    usableArea: number; // hectáreas
    pastureArea: number; // hectáreas
    buildingArea: number; // m²
    waterBodyArea: number; // hectáreas
    forestArea: number; // hectáreas
  };

  // Información del propietario/administrador
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

  // Características operacionales
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

  // Documentos y fotos
  documents: PropertyDocument[];
  photos: PropertyPhoto[];

  // Fechas importantes
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
// VARIANTES DE ANIMACIÓN
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
        <p>Subido: {new Date(document.uploadDate).toLocaleDateString('es-MX')}</p>
        {document.expirationDate && (
          <p>Expira: {new Date(document.expirationDate).toLocaleDateString('es-MX')}</p>
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
          <span>{new Date(photo.uploadDate).toLocaleDateString('es-MX')}</span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const PropertyInfo: React.FC = () => {
  // Estados para manejo de datos y UI
  const [propertyData, setPropertyData] = useState<PropertyInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "documents" | "photos">("basic");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Referencias para inputs de archivos
  const documentInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Función para obtener ubicación actual
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada en este navegador");
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
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    );
  }, [propertyData]);

  // Función para crear nueva propiedad
  const handleCreateNew = () => {
    const newProperty = createEmptyPropertyInfo();
    newProperty.basicInfo.id = `property-${Date.now()}`;
    setPropertyData(newProperty);
    setIsEditing(true);
  };

  // Función para manejar la subida de documentos
  const handleDocumentUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!propertyData) return;
    
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          const newDocument: PropertyDocument = {
            id: `doc-${Date.now()}`,
            name: files[0].name,
            type: "other",
            uploadDate: new Date().toISOString().split('T')[0],
            fileSize: Math.round(files[0].size / (1024 * 1024) * 100) / 100,
            fileType: files[0].type.toUpperCase().includes('PDF') ? 'PDF' : 'DOC',
            status: "valid"
          };

          setPropertyData(prev => prev ? ({
            ...prev,
            documents: [...prev.documents, newDocument]
          }) : null);

          return 100;
        }
        return prev + 10;
      });
    }, 200);

    event.target.value = '';
  }, [propertyData]);

  // Función para manejar la subida de fotos
  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (!propertyData) return;
    
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          const newPhoto: PropertyPhoto = {
            id: `photo-${Date.now()}`,
            url: "/api/placeholder/400/300",
            caption: "Nueva foto del rancho",
            category: "general",
            uploadDate: new Date().toISOString().split('T')[0],
            isMain: propertyData.photos.length === 0
          };

          setPropertyData(prev => prev ? ({
            ...prev,
            photos: [...prev.photos, newPhoto]
          }) : null);

          return 100;
        }
        return prev + 10;
      });
    }, 200);

    event.target.value = '';
  }, [propertyData]);

  // Función para guardar cambios
  const handleSave = () => {
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
      alert("Por favor complete los campos requeridos (marcados con *)");
      return;
    }

    // Validar capacidades
    if (propertyData.operations.capacity.currentAnimals > propertyData.operations.capacity.maxAnimals) {
      alert("Los animales actuales no pueden ser mayores a la capacidad máxima");
      return;
    }

    if (propertyData.operations.capacity.currentStaff > propertyData.operations.capacity.staffCapacity) {
      alert("El personal actual no puede ser mayor a la capacidad de personal");
      return;
    }

    setIsEditing(false);
    setIsSaved(true);
    // Aquí se enviarían los datos al backend
    console.log("Guardando propiedad:", propertyData);
    alert("Información guardada exitosamente");
  };

  // Función para cancelar edición
  const handleCancel = () => {
    setIsEditing(false);
    if (propertyData && !isSaved) {
      // Si estaba creando una nueva propiedad y cancela, volver al estado inicial
      setPropertyData(null);
    }
  };

  // Función para eliminar información
  const handleDelete = () => {
    if (window.confirm("¿Está seguro que desea eliminar toda la información de la propiedad? Esta acción no se puede deshacer.")) {
      setPropertyData(null);
      setIsSaved(false);
      setIsEditing(false);
      setActiveTab("basic");
      alert("Información eliminada exitosamente");
    }
  };

  // Tabs de navegación
  const tabs = [
    { id: "basic", label: "Información Básica", icon: Building },
    { id: "documents", label: "Documentos", icon: FileText },
    { id: "photos", label: "Fotografías", icon: Camera },
  ] as const;

  // Si no hay datos, mostrar pantalla de inicio
  if (!propertyData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#E8E8C8] to-[#D3D3B8] p-6">
        <div className="max-w-4xl mx-auto">
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
                <Building className="w-12 h-12 text-[#519a7c]" />
              </motion.div>
              
              <h1 className="text-4xl font-bold text-[#2d5a45] mb-4">
                Sistema de Gestión de Propiedades
              </h1>
              
              <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                Crea la información de tu propiedad para gestionar todos los datos, 
                documentos y fotografías de tu rancho de manera organizada. 
                <span className="font-medium text-[#2d5a45]">Solo puedes tener una propiedad registrada.</span>
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateNew}
                className="px-8 py-4 bg-[#519a7c] text-white rounded-xl hover:bg-[#2d5a45] transition-colors flex items-center mx-auto text-lg font-medium shadow-lg"
              >
                <PlusCircle className="w-6 h-6 mr-3" />
                Crear Nueva Propiedad
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
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#E8E8C8] to-[#D3D3B8] p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2d5a45] mb-2">
                {propertyData.basicInfo.name || "Nueva Propiedad"}
              </h1>
              <p className="text-gray-600 text-lg">
                {isEditing ? "Editando información" : 
                 isSaved ? "Información guardada - Puede editar o eliminar la información actual" :
                 "Gestiona toda la información, documentos y fotos del rancho"}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSave}
                    className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Guardar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
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
                  {isSaved && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDelete}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
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
              <span className="text-sm font-medium text-[#2d5a45]">Subiendo archivo...</span>
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
                    value={propertyData.basicInfo.establishedYear}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => prev ? ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, establishedYear: parseInt(value) || 0 }
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
                      value={propertyData.location.coordinates.latitude}
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
                      value={propertyData.location.coordinates.longitude}
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
                    value={propertyData.dimensions.totalArea}
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
                    value={propertyData.dimensions.pastureArea}
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
                    value={propertyData.dimensions.buildingArea}
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
                    value={propertyData.dimensions.waterBodyArea}
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
                    value={propertyData.operations.capacity.maxAnimals}
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
                    value={propertyData.operations.capacity.currentAnimals}
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
                    value={propertyData.operations.capacity.staffCapacity}
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
                    value={propertyData.operations.capacity.currentStaff}
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
                  className="hidden"
                />
              </div>

              {/* Grid de documentos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {propertyData.documents.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onView={() => console.log("Ver documento:", document.id)}
                    onDownload={() => console.log("Descargar documento:", document.id)}
                    onDelete={() => {
                      setPropertyData(prev => prev ? ({
                        ...prev,
                        documents: prev.documents.filter(doc => doc.id !== document.id)
                      }) : null);
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
                    onDelete={() => {
                      setPropertyData(prev => prev ? ({
                        ...prev,
                        photos: prev.photos.filter(p => p.id !== photo.id)
                      }) : null);
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