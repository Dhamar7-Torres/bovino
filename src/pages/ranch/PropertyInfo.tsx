// ============================================================================
// PROPERTYINFO.TSX - GESTIÓN DE INFORMACIÓN DE LA PROPIEDAD
// ============================================================================
// Componente para visualizar y editar toda la información del rancho,
// incluyendo documentos legales, fotos, coordenadas y datos operacionales

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
  Plus,
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
  Home,
  TreePine,
  Droplets,
  Settings,
  Users,
  Beef,
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

  // Infraestructura
  infrastructure: {
    buildings: number;
    corrals: number;
    waterSources: number;
    electricalSystems: string[];
    roadAccess: "paved" | "gravel" | "dirt" | "limited";
    internetAccess: boolean;
    phoneService: boolean;
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
// DATOS SIMULADOS
// ============================================================================

const mockPropertyInfo: PropertyInfo = {
  basicInfo: {
    id: "ranch-001",
    name: "Rancho Los Ceibos",
    description: "Rancho ganadero especializado en producción de leche y carne con tecnología moderna",
    establishedYear: 1985,
    registrationNumber: "RANCH-TAB-001-1985",
    propertyType: "mixed"
  },
  location: {
    address: "Carretera Villahermosa-Frontera Km 15",
    city: "Villahermosa",
    state: "Tabasco",
    country: "México",
    postalCode: "86035",
    coordinates: {
      latitude: 17.9869,
      longitude: -92.9303
    },
    elevation: 12,
    timezone: "America/Mexico_City"
  },
  dimensions: {
    totalArea: 450.5,
    usableArea: 425.0,
    pastureArea: 380.0,
    buildingArea: 2500,
    waterBodyArea: 15.5,
    forestArea: 30.0
  },
  ownership: {
    ownerName: "Dr. Carlos Mendoza Jiménez",
    ownerType: "individual",
    contactInfo: {
      email: "carlos.mendoza@rancholosceibos.com",
      phone: "+52 993 123 4567",
      alternatePhone: "+52 993 987 6543",
      website: "www.rancholosceibos.com"
    },
    administratorName: "Ing. María González López",
    administratorContact: "maria.gonzalez@rancholosceibos.com"
  },
  operations: {
    primaryActivity: ["Producción de leche", "Cría de ganado bovino"],
    secondaryActivity: ["Producción de forrajes", "Servicios veterinarios"],
    certifications: ["Buenas Prácticas Ganaderas", "Certificación Orgánica"],
    operatingLicense: "SENASICA-TAB-2024-001",
    capacity: {
      maxAnimals: 350,
      currentAnimals: 285,
      staffCapacity: 20,
      currentStaff: 15
    }
  },
  infrastructure: {
    buildings: 12,
    corrals: 8,
    waterSources: 6,
    electricalSystems: ["Red eléctrica principal", "Planta solar", "Generador de emergencia"],
    roadAccess: "paved",
    internetAccess: true,
    phoneService: true
  },
  documents: [
    {
      id: "doc1",
      name: "Escritura de Propiedad",
      type: "title",
      uploadDate: "2024-01-15",
      fileSize: 2.5,
      fileType: "PDF",
      status: "valid"
    },
    {
      id: "doc2", 
      name: "Permiso SENASICA",
      type: "permit",
      uploadDate: "2024-03-20",
      expirationDate: "2025-03-20",
      fileSize: 1.2,
      fileType: "PDF",
      status: "valid"
    },
    {
      id: "doc3",
      name: "Seguro de Ganado",
      type: "insurance",
      uploadDate: "2024-01-01",
      expirationDate: "2024-12-31",
      fileSize: 0.8,
      fileType: "PDF",
      status: "requires_renewal"
    }
  ],
  photos: [
    {
      id: "photo1",
      url: "/api/placeholder/400/300",
      caption: "Vista aérea del rancho",
      category: "aerial",
      uploadDate: "2024-06-15",
      isMain: true
    },
    {
      id: "photo2",
      url: "/api/placeholder/400/300", 
      caption: "Instalaciones principales",
      category: "facilities",
      uploadDate: "2024-06-15",
      isMain: false
    }
  ],
  dates: {
    lastUpdate: "2025-07-16",
    lastInspection: "2025-07-10",
    nextInspection: "2025-10-10",
    licenseRenewal: "2025-03-20"
  }
};

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
}> = ({ label, value, isEditing, onChange, type = "text", icon: Icon }) => {
  return (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      {Icon && <Icon className="w-5 h-5 text-[#519a7c] flex-shrink-0" />}
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        {isEditing ? (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
          />
        ) : (
          <p className="font-medium text-[#2d5a45]">{value}</p>
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
      case "insurance": return Home;
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
            // Fallback para imágenes que no cargan
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
  const [propertyData, setPropertyData] = useState<PropertyInfo>(mockPropertyInfo);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "documents" | "photos" | "infrastructure">("basic");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Referencias para inputs de archivos
  const documentInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Función para manejar la subida de documentos
  const handleDocumentUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simular subida de archivo
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Agregar documento simulado
          const newDocument: PropertyDocument = {
            id: `doc-${Date.now()}`,
            name: files[0].name,
            type: "other",
            uploadDate: new Date().toISOString().split('T')[0],
            fileSize: Math.round(files[0].size / (1024 * 1024) * 100) / 100,
            fileType: files[0].type.toUpperCase().includes('PDF') ? 'PDF' : 'DOC',
            status: "valid"
          };

          setPropertyData(prev => ({
            ...prev,
            documents: [...prev.documents, newDocument]
          }));

          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Reset input
    event.target.value = '';
  }, []);

  // Función para manejar la subida de fotos
  const handlePhotoUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simular subida de foto
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          
          // Agregar foto simulada
          const newPhoto: PropertyPhoto = {
            id: `photo-${Date.now()}`,
            url: "/api/placeholder/400/300",
            caption: "Nueva foto del rancho",
            category: "general",
            uploadDate: new Date().toISOString().split('T')[0],
            isMain: false
          };

          setPropertyData(prev => ({
            ...prev,
            photos: [...prev.photos, newPhoto]
          }));

          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Reset input
    event.target.value = '';
  }, []);

  // Función para guardar cambios
  const handleSave = () => {
    setIsEditing(false);
    // Aquí se enviarían los datos al backend
    console.log("Guardando cambios:", propertyData);
  };

  // Función para cancelar edición
  const handleCancel = () => {
    setIsEditing(false);
    // Revertir cambios
    setPropertyData(mockPropertyInfo);
  };

  // Tabs de navegación
  const tabs = [
    { id: "basic", label: "Información Básica", icon: Building },
    { id: "documents", label: "Documentos", icon: FileText },
    { id: "photos", label: "Fotografías", icon: Camera },
    { id: "infrastructure", label: "Infraestructura", icon: Settings },
  ] as const;

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
                Información de la Propiedad
              </h1>
              <p className="text-gray-600 text-lg">
                Gestiona toda la información, documentos y fotos del rancho
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
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </motion.button>
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
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, name: value }
                    }))}
                    icon={Building}
                  />
                  <EditableField
                    label="Descripción"
                    value={propertyData.basicInfo.description}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, description: value }
                    }))}
                    icon={FileText}
                  />
                  <EditableField
                    label="Año de Establecimiento"
                    value={propertyData.basicInfo.establishedYear}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, establishedYear: parseInt(value) || 0 }
                    }))}
                    type="number"
                    icon={Calendar}
                  />
                  <EditableField
                    label="Número de Registro"
                    value={propertyData.basicInfo.registrationNumber}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      basicInfo: { ...prev.basicInfo, registrationNumber: value }
                    }))}
                    icon={Shield}
                  />
                </div>
              </motion.div>

              {/* Ubicación */}
              <motion.div
                variants={cardVariants}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
              >
                <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Ubicación</h3>
                <div className="space-y-4">
                  <EditableField
                    label="Dirección"
                    value={propertyData.location.address}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      location: { ...prev.location, address: value }
                    }))}
                    icon={MapPin}
                  />
                  <EditableField
                    label="Ciudad"
                    value={propertyData.location.city}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      location: { ...prev.location, city: value }
                    }))}
                    icon={Building}
                  />
                  <EditableField
                    label="Estado"
                    value={propertyData.location.state}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      location: { ...prev.location, state: value }
                    }))}
                    icon={Globe}
                  />
                  <EditableField
                    label="Código Postal"
                    value={propertyData.location.postalCode}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      location: { ...prev.location, postalCode: value }
                    }))}
                    icon={Mail}
                  />
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
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions, totalArea: parseFloat(value) || 0 }
                    }))}
                    type="number"
                    icon={Ruler}
                  />
                  <EditableField
                    label="Área de Pastoreo (hectáreas)"
                    value={propertyData.dimensions.pastureArea}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions, pastureArea: parseFloat(value) || 0 }
                    }))}
                    type="number"
                    icon={TreePine}
                  />
                  <EditableField
                    label="Área de Construcciones (m²)"
                    value={propertyData.dimensions.buildingArea}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions, buildingArea: parseFloat(value) || 0 }
                    }))}
                    type="number"
                    icon={Building}
                  />
                  <EditableField
                    label="Área de Cuerpos de Agua (hectáreas)"
                    value={propertyData.dimensions.waterBodyArea}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      dimensions: { ...prev.dimensions, waterBodyArea: parseFloat(value) || 0 }
                    }))}
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
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      ownership: { ...prev.ownership, ownerName: value }
                    }))}
                    icon={User}
                  />
                  <EditableField
                    label="Email"
                    value={propertyData.ownership.contactInfo.email}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      ownership: {
                        ...prev.ownership,
                        contactInfo: { ...prev.ownership.contactInfo, email: value }
                      }
                    }))}
                    type="email"
                    icon={Mail}
                  />
                  <EditableField
                    label="Teléfono"
                    value={propertyData.ownership.contactInfo.phone}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      ownership: {
                        ...prev.ownership,
                        contactInfo: { ...prev.ownership.contactInfo, phone: value }
                      }
                    }))}
                    type="tel"
                    icon={Phone}
                  />
                  <EditableField
                    label="Administrador"
                    value={propertyData.ownership.administratorName || ""}
                    isEditing={isEditing}
                    onChange={(value) => setPropertyData(prev => ({
                      ...prev,
                      ownership: { ...prev.ownership, administratorName: value }
                    }))}
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
                      setPropertyData(prev => ({
                        ...prev,
                        documents: prev.documents.filter(doc => doc.id !== document.id)
                      }));
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
                      setPropertyData(prev => ({
                        ...prev,
                        photos: prev.photos.map(p => ({
                          ...p,
                          isMain: p.id === photo.id
                        }))
                      }));
                    }}
                    onDelete={() => {
                      setPropertyData(prev => ({
                        ...prev,
                        photos: prev.photos.filter(p => p.id !== photo.id)
                      }));
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

          {activeTab === "infrastructure" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Capacidad Operacional */}
              <motion.div
                variants={cardVariants}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
              >
                <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Capacidad Operacional</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Building className="w-5 h-5 text-[#519a7c] mr-3" />
                      <div>
                        <p className="font-medium text-[#2d5a45]">Edificaciones</p>
                        <p className="text-sm text-gray-600">Total de construcciones</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-[#2d5a45]">{propertyData.infrastructure.buildings}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Home className="w-5 h-5 text-[#519a7c] mr-3" />
                      <div>
                        <p className="font-medium text-[#2d5a45]">Corrales</p>
                        <p className="text-sm text-gray-600">Áreas de confinamiento</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-[#2d5a45]">{propertyData.infrastructure.corrals}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Droplets className="w-5 h-5 text-[#519a7c] mr-3" />
                      <div>
                        <p className="font-medium text-[#2d5a45]">Fuentes de Agua</p>
                        <p className="text-sm text-gray-600">Pozos, tanques, etc.</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-[#2d5a45]">{propertyData.infrastructure.waterSources}</span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Beef className="w-5 h-5 text-[#519a7c] mr-2" />
                      <p className="font-medium text-[#2d5a45]">Capacidad Animal</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Actual / Máximo</span>
                      <span className="text-lg font-bold text-[#2d5a45]">
                        {propertyData.operations.capacity.currentAnimals} / {propertyData.operations.capacity.maxAnimals}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-[#519a7c] h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(propertyData.operations.capacity.currentAnimals / propertyData.operations.capacity.maxAnimals) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Servicios y Conectividad */}
              <motion.div
                variants={cardVariants}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
              >
                <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Servicios y Conectividad</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Globe className="w-5 h-5 text-[#519a7c] mr-3" />
                      <span className="font-medium text-[#2d5a45]">Internet</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      propertyData.infrastructure.internetAccess 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {propertyData.infrastructure.internetAccess ? "Disponible" : "No disponible"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-[#519a7c] mr-3" />
                      <span className="font-medium text-[#2d5a45]">Telefonía</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      propertyData.infrastructure.phoneService 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {propertyData.infrastructure.phoneService ? "Disponible" : "No disponible"}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <Settings className="w-5 h-5 text-[#519a7c] mr-2" />
                      <span className="font-medium text-[#2d5a45]">Acceso por Carretera</span>
                    </div>
                    <span className="text-sm text-gray-600 capitalize">
                      {propertyData.infrastructure.roadAccess === "paved" ? "Pavimentada" :
                       propertyData.infrastructure.roadAccess === "gravel" ? "Grava" :
                       propertyData.infrastructure.roadAccess === "dirt" ? "Terracería" : "Limitado"}
                    </span>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="w-5 h-5 text-[#519a7c] mr-2" />
                      <span className="font-medium text-[#2d5a45]">Sistemas Eléctricos</span>
                    </div>
                    <div className="space-y-2">
                      {propertyData.infrastructure.electricalSystems.map((system, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-[#519a7c] rounded-full mr-2" />
                          <span className="text-sm text-gray-700">{system}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Actividades y Certificaciones */}
              <motion.div
                variants={cardVariants}
                className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 lg:col-span-2"
              >
                <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Actividades y Certificaciones</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-[#2d5a45] mb-3">Actividades Principales</h4>
                    <div className="space-y-2">
                      {propertyData.operations.primaryActivity.map((activity, index) => (
                        <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                          <span className="text-sm text-gray-700">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-[#2d5a45] mb-3">Actividades Secundarias</h4>
                    <div className="space-y-2">
                      {propertyData.operations.secondaryActivity.map((activity, index) => (
                        <div key={index} className="flex items-center p-2 bg-blue-50 rounded-lg">
                          <Plus className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm text-gray-700">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="font-medium text-[#2d5a45] mb-3">Certificaciones</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {propertyData.operations.certifications.map((cert, index) => (
                        <div key={index} className="flex items-center p-2 bg-yellow-50 rounded-lg">
                          <Shield className="w-4 h-4 text-yellow-600 mr-2" />
                          <span className="text-sm text-gray-700">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PropertyInfo;