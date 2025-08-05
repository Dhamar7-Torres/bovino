import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Trash2,
  Search,
  Filter,
  FileText,
  Image,
  Film,
  Archive,
  ArrowLeft,
  Calendar,
  User,
  Tag,
  CloudUpload,
  CheckCircle,
  AlertTriangle,
  FileImage,
  FileVideo,
  FileArchive,
  File,
  Plus,
  MoreVertical,
  Wifi,
  WifiOff,
  RefreshCw,
  Loader2,
} from "lucide-react";

// Configuración de la API - Puerto 5000
const API_BASE_URL = 'http://localhost:5000/api';

// Interfaces para los documentos
interface DocumentFile {
  id: string;
  name: string;
  type: string;
  size: number;
  category: DocumentCategory;
  uploadDate: Date;
  lastModified: Date;
  description?: string;
  tags: string[];
  uploadedBy: string;
  bovineId: string;
  url: string;
  thumbnailUrl?: string;
  isPublic: boolean;
  version: number;
  parentId?: string;
}

type DocumentCategory =
  | "VACCINATION"
  | "MEDICAL"
  | "GENEALOGY"
  | "CERTIFICATE"
  | "PHOTO"
  | "VIDEO"
  | "REPORT"
  | "OTHER";

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: "uploading" | "completed" | "error";
  error?: string;
}

// Servicio API para documentos
class DocumentApiService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  // Obtener documentos de un bovino
  async getDocumentsByBovine(bovineId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/bovines/${bovineId}/documents`, {
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
      console.error('Error fetching documents:', error);
      throw error;
    }
  }

  // Subir documento
  async uploadDocument(bovineId: string, file: File, metadata: any) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('metadata', JSON.stringify(metadata));

      const response = await fetch(`${this.baseUrl}/bovines/${bovineId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  }

  // Eliminar documento
  async deleteDocument(documentId: string) {
    try {
      const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
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
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  // Probar conexión
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
const documentApi = new DocumentApiService(API_BASE_URL);

// Configuración de categorías de documentos
const documentCategories = {
  VACCINATION: {
    label: "Vacunación",
    icon: FileText,
    color: "bg-blue-100 text-blue-800",
    borderColor: "border-blue-200",
  },
  MEDICAL: {
    label: "Médico",
    icon: FileText,
    color: "bg-red-100 text-red-800",
    borderColor: "border-red-200",
  },
  GENEALOGY: {
    label: "Genealogía",
    icon: Archive,
    color: "bg-purple-100 text-purple-800",
    borderColor: "border-purple-200",
  },
  CERTIFICATE: {
    label: "Certificados",
    icon: FileText,
    color: "bg-green-100 text-green-800",
    borderColor: "border-green-200",
  },
  PHOTO: {
    label: "Fotos",
    icon: Image,
    color: "bg-yellow-100 text-yellow-800",
    borderColor: "border-yellow-200",
  },
  VIDEO: {
    label: "Videos",
    icon: Film,
    color: "bg-indigo-100 text-indigo-800",
    borderColor: "border-indigo-200",
  },
  REPORT: {
    label: "Reportes",
    icon: FileText,
    color: "bg-gray-100 text-gray-800",
    borderColor: "border-gray-200",
  },
  OTHER: {
    label: "Otros",
    icon: File,
    color: "bg-gray-100 text-gray-800",
    borderColor: "border-gray-200",
  },
};

// Componente para mostrar el ícono del tipo de archivo
const FileTypeIcon: React.FC<{ fileType: string; className?: string }> = ({
  fileType,
  className = "w-6 h-6",
}) => {
  if (fileType.startsWith("image/")) {
    return <FileImage className={`${className} text-blue-500`} />;
  } else if (fileType.startsWith("video/")) {
    return <FileVideo className={`${className} text-purple-500`} />;
  } else if (fileType.includes("zip") || fileType.includes("rar")) {
    return <FileArchive className={`${className} text-orange-500`} />;
  } else {
    return <File className={`${className} text-gray-500`} />;
  }
};

// Componente para probar conexión con el backend
const ConnectionTest: React.FC<{ onConnectionStatus: (status: boolean) => void }> = ({ onConnectionStatus }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTest, setLastTest] = useState<Date | null>(null);

  const testConnection = async () => {
    setIsLoading(true);
    try {
      await documentApi.testConnection();
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
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-200">
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
           isConnected === true ? 'Conectado al backend (Puerto 5000)' :
           isConnected === false ? 'Sin conexión al backend' :
           'Estado desconocido'}
        </span>
      </div>

      <button
        onClick={testConnection}
        disabled={isLoading}
        className="ml-auto flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 bg-white text-gray-700 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        Probar
      </button>

      {lastTest && (
        <span className="text-xs text-gray-500">
          {lastTest.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

// Componente para la tarjeta de documento
const DocumentCard: React.FC<{
  document: DocumentFile;
  onDelete: (doc: DocumentFile) => void;
  index: number;
}> = ({ document, onDelete, index }) => {
  const [showMenu, setShowMenu] = useState(false);
  const category = documentCategories[document.category];

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group animate-slideUp"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Preview/Thumbnail */}
      <div className="h-32 bg-gray-50 relative overflow-hidden">
        {document.thumbnailUrl ? (
          <img
            src={document.thumbnailUrl}
            alt={document.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <FileTypeIcon fileType={document.type} className="w-12 h-12" />
          </div>
        )}
        
        {/* Overlay con botón de descarga */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
          <a
            href={document.url}
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-2 hover:bg-opacity-100"
          >
            <FileText className="w-5 h-5 text-gray-700" />
          </a>
        </div>
      </div>

      {/* Información del documento */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 mr-2">
            {document.name}
          </h4>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
                <a
                  href={document.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                  onClick={() => setShowMenu(false)}
                >
                  <FileText className="w-4 h-4" />
                  Ver/Descargar
                </a>
                <button
                  onClick={() => {
                    onDelete(document);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Categoría */}
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${category.color}`}
          >
            <category.icon className="w-3 h-3" />
            {category.label}
          </span>
        </div>

        {/* Tags */}
        {document.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {document.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700"
              >
                <Tag className="w-2.5 h-2.5 mr-1" />
                {tag}
              </span>
            ))}
            {document.tags.length > 2 && (
              <span className="text-xs text-gray-500">
                +{document.tags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Metadatos */}
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>{formatFileSize(document.size)}</span>
            <span>v{document.version}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {document.uploadDate.toLocaleDateString("es-MX")}
          </div>
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {document.uploadedBy}
          </div>
        </div>

        {/* Descripción */}
        {document.description && (
          <p className="text-xs text-gray-600 mt-2 line-clamp-2">
            {document.description}
          </p>
        )}
      </div>
    </div>
  );
};

// Componente para subir archivos con drag & drop
const FileUploader: React.FC<{
  onFileUpload: (files: FileList) => void;
  isUploading: boolean;
}> = ({ onFileUpload, isUploading }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileUpload(files);
      }
    },
    [onFileUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      onFileUpload(files);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
        isDragOver
          ? "border-blue-500 bg-blue-50 scale-105"
          : "border-gray-300 hover:border-gray-400"
      } ${isUploading ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
      />

      <div className="transition-transform duration-200">
        <CloudUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isDragOver ? "Suelta los archivos aquí" : "Subir documentos"}
        </h3>
        <p className="text-gray-600 mb-4">
          Arrastra y suelta archivos aquí o{" "}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-700 font-medium underline"
            disabled={isUploading}
          >
            selecciona archivos
          </button>
        </p>
        <p className="text-sm text-gray-500">
          Formatos soportados: PDF, DOC, DOCX, JPG, PNG, GIF, MP4, MOV, AVI
        </p>
        <p className="text-sm text-gray-500">Tamaño máximo: 50MB por archivo</p>
      </div>
    </div>
  );
};

// Componente principal de documentos del bovino
const BovineDocuments: React.FC = () => {
  // Simular params de navegación
  const bovineId = "1"; // En una app real vendría de useParams()

  // Estados
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentFile[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentFile | null>(null);
  const [showNewDocumentModal, setShowNewDocumentModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState("date");
  const [newDocumentForm, setNewDocumentForm] = useState({
    name: "",
    description: "",
    category: "OTHER" as DocumentCategory,
    tags: "",
    isPublic: false,
    file: null as File | null,
  });

  // Cargar documentos del servidor
  const loadDocumentsFromServer = async () => {
    setIsLoading(true);
    try {
      const response = await documentApi.getDocumentsByBovine(bovineId);
      if (response.success && response.data) {
        const adaptedDocuments = (response.data.documents || []).map((doc: any) => ({
          ...doc,
          uploadDate: new Date(doc.uploadDate),
          lastModified: new Date(doc.lastModified),
        }));
        
        setDocuments(adaptedDocuments);
      }
    } catch (error) {
      console.error('Error loading documents from server:', error);
      // Cargar datos mock si no hay conexión
      loadMockData();
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos mock como fallback
  const loadMockData = () => {
    const mockDocuments: DocumentFile[] = [
      {
        id: "1",
        name: "Certificado de Vacunación - IBR.pdf",
        type: "application/pdf",
        size: 2048576,
        category: "VACCINATION",
        uploadDate: new Date("2024-06-15"),
        lastModified: new Date("2024-06-15"),
        description: "Certificado de vacunación contra IBR aplicada el 15/06/2024",
        tags: ["IBR", "vacuna", "certificado"],
        uploadedBy: "Dr. Carlos Mendoza",
        bovineId: bovineId,
        url: "#",
        isPublic: false,
        version: 1,
      },
      {
        id: "2",
        name: "Foto_Bovino_Lupita_001.jpg",
        type: "image/jpeg",
        size: 1536000,
        category: "PHOTO",
        uploadDate: new Date("2024-07-01"),
        lastModified: new Date("2024-07-01"),
        description: "Foto reciente del bovino mostrando buen estado de salud",
        tags: ["foto", "salud", "estado"],
        uploadedBy: "Juan Pérez",
        bovineId: bovineId,
        url: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400",
        thumbnailUrl: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=200",
        isPublic: true,
        version: 1,
      },
      {
        id: "3",
        name: "Reporte_Medico_Mastitis.pdf",
        type: "application/pdf",
        size: 3072000,
        category: "MEDICAL",
        uploadDate: new Date("2024-04-20"),
        lastModified: new Date("2024-04-25"),
        description: "Reporte médico completo del tratamiento de mastitis subclínica",
        tags: ["mastitis", "tratamiento", "reporte médico"],
        uploadedBy: "Dr. Luis Fernández",
        bovineId: bovineId,
        url: "#",
        isPublic: false,
        version: 2,
      },
      {
        id: "4",
        name: "Registro_Genealogico.pdf",
        type: "application/pdf",
        size: 1024000,
        category: "GENEALOGY",
        uploadDate: new Date("2024-03-15"),
        lastModified: new Date("2024-03-15"),
        description: "Registro genealógico oficial con línea de ascendencia",
        tags: ["genealogía", "registro", "ascendencia"],
        uploadedBy: "Registro Ganadero",
        bovineId: bovineId,
        url: "#",
        isPublic: false,
        version: 1,
      },
      {
        id: "5",
        name: "Video_Comportamiento_Pastoreo.mp4",
        type: "video/mp4",
        size: 25600000,
        category: "VIDEO",
        uploadDate: new Date("2024-05-10"),
        lastModified: new Date("2024-05-10"),
        description: "Video mostrando comportamiento normal durante el pastoreo",
        tags: ["comportamiento", "pastoreo", "video"],
        uploadedBy: "María González",
        bovineId: bovineId,
        url: "#",
        isPublic: true,
        version: 1,
      },
    ];

    setDocuments(mockDocuments);
  };

  // Cargar datos al iniciar
  useEffect(() => {
    if (isConnected) {
      loadDocumentsFromServer();
    } else {
      loadMockData();
      setIsLoading(false);
    }
  }, [isConnected]);

  // Filtrar y ordenar documentos
  useEffect(() => {
    let filtered = [...documents];

    // Filtro por categoría
    if (selectedCategory !== "ALL") {
      filtered = filtered.filter((doc) => doc.category === selectedCategory);
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (doc) =>
          doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.tags.some((tag) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Ordenar documentos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return b.uploadDate.getTime() - a.uploadDate.getTime();
        case "name":
          return a.name.localeCompare(b.name);
        case "size":
          return b.size - a.size;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

    setFilteredDocuments(filtered);
  }, [documents, selectedCategory, searchTerm, sortBy]);

  // Manejar subida de archivos
  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    const newProgress: UploadProgress[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `upload-${Date.now()}-${i}`;

      newProgress.push({
        fileId,
        fileName: file.name,
        progress: 0,
        status: "uploading",
      });
    }

    setUploadProgress(newProgress);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `upload-${Date.now()}-${i}`;

      try {
        if (isConnected) {
          // Subir al servidor
          const metadata = {
            name: file.name,
            category: file.type.startsWith("image/") ? "PHOTO" : "OTHER",
            description: "",
            tags: [],
            isPublic: false,
          };

          await documentApi.uploadDocument(bovineId, file, metadata);
        }

        // Simular progreso de subida
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setUploadProgress((prev) =>
            prev.map((p) => (p.fileId === fileId ? { ...p, progress } : p))
          );
        }

        // Crear nuevo documento localmente
        const newDocument: DocumentFile = {
          id: `doc-${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          category: file.type.startsWith("image/") ? "PHOTO" : 
                   file.type.startsWith("video/") ? "VIDEO" : "OTHER",
          uploadDate: new Date(),
          lastModified: new Date(),
          tags: [],
          uploadedBy: "Usuario Actual",
          bovineId: bovineId,
          url: URL.createObjectURL(file),
          isPublic: false,
          version: 1,
        };

        // Agregar thumbnail para imágenes
        if (file.type.startsWith("image/")) {
          newDocument.thumbnailUrl = URL.createObjectURL(file);
        }

        setDocuments((prev) => [...prev, newDocument]);

        // Marcar como completado
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.fileId === fileId ? { ...p, status: "completed" } : p
          )
        );
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.fileId === fileId
              ? { ...p, status: "error", error: "Error al subir archivo" }
              : p
          )
        );
      }
    }

    // Recargar documentos si está conectado
    if (isConnected) {
      setTimeout(() => loadDocumentsFromServer(), 1000);
    }

    // Limpiar progreso después de un tiempo
    setTimeout(() => {
      setUploadProgress([]);
      setIsUploading(false);
    }, 2000);
  };

  // Manejar eliminación de documentos
  const handleDeleteDocument = (document: DocumentFile) => {
    setDocumentToDelete(document);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      if (isConnected) {
        await documentApi.deleteDocument(documentToDelete.id);
        alert('Documento eliminado exitosamente del servidor');
      } else {
        alert('Documento eliminado localmente (sin conexión al servidor)');
      }

      setDocuments((prev) =>
        prev.filter((doc) => doc.id !== documentToDelete.id)
      );

      if (isConnected) {
        setTimeout(() => loadDocumentsFromServer(), 1000);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert(`Error al eliminar el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    setShowDeleteModal(false);
    setDocumentToDelete(null);
  };

  // Manejar nuevo documento
  const handleNewDocument = () => {
    setShowNewDocumentModal(true);
  };

  const handleNewDocumentSubmit = async () => {
    if (!newDocumentForm.file || !newDocumentForm.name.trim()) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    try {
      if (isConnected) {
        const metadata = {
          name: newDocumentForm.name.trim(),
          category: newDocumentForm.category,
          description: newDocumentForm.description.trim(),
          tags: newDocumentForm.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag.length > 0),
          isPublic: newDocumentForm.isPublic,
        };

        await documentApi.uploadDocument(bovineId, newDocumentForm.file, metadata);
        alert('Documento creado exitosamente en el servidor');
      } else {
        alert('Documento creado localmente (sin conexión al servidor)');
      }

      // Crear documento localmente
      const newDocument: DocumentFile = {
        id: `doc-${Date.now()}`,
        name: newDocumentForm.name.trim(),
        type: newDocumentForm.file.type,
        size: newDocumentForm.file.size,
        category: newDocumentForm.category,
        uploadDate: new Date(),
        lastModified: new Date(),
        description: newDocumentForm.description.trim(),
        tags: newDocumentForm.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        uploadedBy: "Usuario Actual",
        bovineId: bovineId,
        url: URL.createObjectURL(newDocumentForm.file),
        isPublic: newDocumentForm.isPublic,
        version: 1,
      };

      if (newDocumentForm.file.type.startsWith("image/")) {
        newDocument.thumbnailUrl = URL.createObjectURL(newDocumentForm.file);
      }

      setDocuments((prev) => [...prev, newDocument]);

      // Recargar desde servidor si está conectado
      if (isConnected) {
        setTimeout(() => loadDocumentsFromServer(), 1000);
      }
    } catch (error) {
      console.error('Error creating document:', error);
      alert(`Error al crear el documento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }

    // Limpiar formulario y cerrar modal
    setNewDocumentForm({
      name: "",
      description: "",
      category: "OTHER",
      tags: "",
      isPublic: false,
      file: null,
    });
    setShowNewDocumentModal(false);
  };

  const handleCloseNewDocumentModal = () => {
    setNewDocumentForm({
      name: "",
      description: "",
      category: "OTHER",
      tags: "",
      isPublic: false,
      file: null,
    });
    setShowNewDocumentModal(false);
  };

  // Obtener estadísticas de documentos
  const getDocumentStats = () => {
    const stats = Object.keys(documentCategories).map((category) => ({
      category: category as DocumentCategory,
      count: documents.filter((doc) => doc.category === category).length,
      config: documentCategories[category as DocumentCategory],
    }));

    return stats.filter((stat) => stat.count > 0);
  };

  const goBack = () => {
    alert('Navegación simulada - En una app real usarías navigate()');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-slideDown">
          <button
            onClick={goBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-300 shadow-sm border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Regresar al Detalle</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 shadow-sm border ${
                showFilters 
                  ? "bg-blue-50 border-blue-200 text-blue-700" 
                  : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filtros</span>
            </button>
          </div>
        </div>

        {/* Prueba de conexión */}
        <div className="mb-6 animate-slideUp">
          <ConnectionTest onConnectionStatus={setIsConnected} />
        </div>

        {/* Título */}
        <div className="text-center mb-8 animate-slideUp">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            📄 Documentos del Bovino
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Gestiona todos los documentos, certificados y archivos relacionados con el bovino
            {!isConnected && (
              <span className="block text-yellow-600 mt-2 font-medium">
                ⚠️ Modo offline - Sin conexión al servidor puerto 5000
              </span>
            )}
          </p>
        </div>

        {/* Estadísticas de documentos */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8 animate-slideLeft">
          <div
            className={`bg-white rounded-lg p-4 text-center cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md border-2 ${
              selectedCategory === "ALL"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
            onClick={() => setSelectedCategory("ALL")}
          >
            <div className="text-2xl font-bold text-gray-900">
              {documents.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </div>

          {getDocumentStats().map((stat) => {
            const IconComponent = stat.config.icon;
            return (
              <div
                key={stat.category}
                className={`bg-white rounded-lg p-4 text-center cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md border-2 ${
                  selectedCategory === stat.category
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedCategory(stat.category)}
              >
                <div className="flex items-center justify-center mb-2">
                  <IconComponent className="w-6 h-6 text-gray-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.count}
                </div>
                <div className="text-sm text-gray-600">{stat.config.label}</div>
              </div>
            );
          })}
        </div>

        {/* Barra de búsqueda y filtros */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 animate-slideRight">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar documentos por nombre, descripción o tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtros adicionales */}
            {showFilters && (
              <div className="flex gap-2 animate-slideDown">
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date">Fecha (más reciente)</option>
                  <option value="name">Nombre (A-Z)</option>
                  <option value="size">Tamaño (mayor)</option>
                  <option value="category">Categoría</option>
                </select>
                {isConnected && (
                  <button
                    onClick={loadDocumentsFromServer}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    {isLoading ? 'Cargando...' : 'Recargar'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Área de subida de archivos */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6 animate-slideUp">
          {/* Estado de conexión */}
          <div className={`p-3 rounded-lg border mb-6 ${isConnected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-yellow-600" />
              )}
              <span className="text-sm font-medium">
                {isConnected ? '✅ Conectado al servidor - Los archivos se subirán a la base de datos' : '⚠️ Sin conexión - Los archivos se guardarán localmente'}
              </span>
            </div>
          </div>

          <FileUploader
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
          />

          {/* Progreso de subida */}
          {uploadProgress.length > 0 && (
            <div className="mt-6 space-y-3 animate-slideDown">
              <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                Subiendo archivos...
              </h4>
              {uploadProgress.map((progress) => (
                <div
                  key={progress.fileId}
                  className="bg-gray-50 rounded-lg p-4 shadow-sm border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 flex items-center gap-2">
                      <FileTypeIcon fileType={progress.fileName.split('.').pop() || ''} className="w-4 h-4" />
                      {progress.fileName}
                    </span>
                    <div className="flex items-center gap-2">
                      {progress.status === "completed" && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                      {progress.status === "error" && (
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                      )}
                      <span className="text-sm text-gray-600">
                        {progress.progress}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        progress.status === "completed"
                          ? "bg-green-500"
                          : progress.status === "error"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  {progress.error && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {progress.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lista de documentos */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 animate-slideUp">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              📚 Documentos ({filteredDocuments.length})
            </h2>
            <button 
              onClick={handleNewDocument}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            >
              <Plus className="w-4 h-4" />
              Nuevo Documento
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600">Cargando documentos...</span>
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDocuments.map((document, index) => (
                <DocumentCard
                  key={document.id}
                  document={document}
                  onDelete={handleDeleteDocument}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📭 No se encontraron documentos
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== "ALL"
                  ? "No hay documentos que coincidan con los filtros aplicados."
                  : "Aún no se han subido documentos para este bovino."}
              </p>
              {(searchTerm || selectedCategory !== "ALL") && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("ALL");
                  }}
                  className="text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  🧹 Limpiar filtros
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && documentToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full animate-slideUp shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  🗑️ Confirmar Eliminación
                </h3>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de que deseas eliminar el documento{" "}
                  <strong className="text-gray-900">"{documentToDelete.name}"</strong>? 
                  <br />
                  <span className="text-red-600 text-sm">Esta acción no se puede deshacer.</span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de nuevo documento */}
        {showNewDocumentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  📄 Nuevo Documento
                </h3>
                <button
                  onClick={handleCloseNewDocumentModal}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>

              {/* Estado de conexión */}
              <div className={`p-3 rounded-lg border mb-6 ${isConnected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-600" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-yellow-600" />
                  )}
                  <span className="text-sm font-medium">
                    {isConnected ? '✅ Conectado - El documento se guardará en el servidor' : '⚠️ Sin conexión - El documento se guardará localmente'}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                {/* Selección de archivo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📎 Archivo *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setNewDocumentForm((prev) => ({
                          ...prev,
                          file,
                          name: file ? file.name : prev.name,
                        }));
                      }}
                      className="hidden"
                      id="document-file-input"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi"
                    />
                    <label
                      htmlFor="document-file-input"
                      className="cursor-pointer"
                    >
                      <CloudUpload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        {newDocumentForm.file
                          ? `📄 ${newDocumentForm.file.name}`
                          : "🔍 Haz clic para seleccionar un archivo"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PDF, DOC, DOCX, JPG, PNG, GIF, MP4, MOV, AVI (máx. 50MB)
                      </p>
                    </label>
                  </div>
                </div>

                {/* Nombre del documento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏷️ Nombre del documento *
                  </label>
                  <input
                    type="text"
                    value={newDocumentForm.name}
                    onChange={(e) =>
                      setNewDocumentForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ingresa el nombre del documento"
                  />
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📂 Categoría *
                  </label>
                  <select
                    value={newDocumentForm.category}
                    onChange={(e) =>
                      setNewDocumentForm((prev) => ({
                        ...prev,
                        category: e.target.value as DocumentCategory,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(documentCategories).map(([key, config]) => (
                      <option key={key} value={key}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Descripción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Descripción
                  </label>
                  <textarea
                    value={newDocumentForm.description}
                    onChange={(e) =>
                      setNewDocumentForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe el contenido del documento (opcional)"
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏷️ Etiquetas
                  </label>
                  <input
                    type="text"
                    value={newDocumentForm.tags}
                    onChange={(e) =>
                      setNewDocumentForm((prev) => ({
                        ...prev,
                        tags: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Separar con comas: vacuna, certificado, IBR"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Separa las etiquetas con comas para facilitar la búsqueda
                  </p>
                </div>

                {/* Visibilidad */}
                <div>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={newDocumentForm.isPublic}
                      onChange={(e) =>
                        setNewDocumentForm((prev) => ({
                          ...prev,
                          isPublic: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      🌍 Documento público
                    </span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1 ml-7">
                    Los documentos públicos pueden ser vistos por otros usuarios
                  </p>
                </div>

                {/* Vista previa del archivo */}
                {newDocumentForm.file && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                      👁️ Vista previa del archivo
                    </h4>
                    <div className="flex items-center gap-3">
                      <FileTypeIcon 
                        fileType={newDocumentForm.file.type} 
                        className="w-8 h-8" 
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {newDocumentForm.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          📏 {(newDocumentForm.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 mt-8">
                <button
                  onClick={handleCloseNewDocumentModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleNewDocumentSubmit}
                  disabled={!newDocumentForm.file || !newDocumentForm.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Crear Documento
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

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

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default BovineDocuments;