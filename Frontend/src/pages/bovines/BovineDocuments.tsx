import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group"
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

            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
                >
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Categoría y tags */}
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
    </motion.div>
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
          ? "border-[#3d8b40] bg-green-50"
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

      <motion.div
        animate={{ scale: isDragOver ? 1.05 : 1 }}
        transition={{ duration: 0.2 }}
      >
        <CloudUpload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {isDragOver ? "Suelta los archivos aquí" : "Subir documentos"}
        </h3>
        <p className="text-gray-600 mb-4">
          Arrastra y suelta archivos aquí o{" "}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[#3d8b40] hover:text-[#2d6e30] font-medium"
            disabled={isUploading}
          >
            selecciona archivos
          </button>
        </p>
        <p className="text-sm text-gray-500">
          Formatos soportados: PDF, DOC, DOCX, JPG, PNG, GIF, MP4, MOV, AVI
        </p>
        <p className="text-sm text-gray-500">Tamaño máximo: 50MB por archivo</p>
      </motion.div>
    </div>
  );
};

// Componente principal de documentos del bovino
const BovineDocuments: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // Estados
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentFile[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState<
    DocumentCategory | "ALL"
  >("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<DocumentFile | null>(
    null
  );
  const [showNewDocumentModal, setShowNewDocumentModal] = useState(false);
  const [newDocumentForm, setNewDocumentForm] = useState({
    name: "",
    description: "",
    category: "OTHER" as DocumentCategory,
    tags: "",
    isPublic: false,
    file: null as File | null,
  });

  // Cargar documentos simulados al montar el componente
  React.useEffect(() => {
    const mockDocuments: DocumentFile[] = [
      {
        id: "1",
        name: "Certificado de Vacunación - IBR.pdf",
        type: "application/pdf",
        size: 2048576,
        category: "VACCINATION",
        uploadDate: new Date("2024-06-15"),
        lastModified: new Date("2024-06-15"),
        description:
          "Certificado de vacunación contra IBR aplicada el 15/06/2024",
        tags: ["IBR", "vacuna", "certificado"],
        uploadedBy: "Dr. Carlos Mendoza",
        bovineId: id || "1",
        url: "/documents/cert-vacuna-ibr.pdf",
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
        bovineId: id || "1",
        url: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400",
        thumbnailUrl:
          "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=200",
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
        description:
          "Reporte médico completo del tratamiento de mastitis subclínica",
        tags: ["mastitis", "tratamiento", "reporte médico"],
        uploadedBy: "Dr. Luis Fernández",
        bovineId: id || "1",
        url: "/documents/reporte-mastitis.pdf",
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
        bovineId: id || "1",
        url: "/documents/registro-genealogico.pdf",
        isPublic: false,
        version: 1,
      },
    ];

    setDocuments(mockDocuments);
    setFilteredDocuments(mockDocuments);
  }, [id]);

  // Filtrar documentos
  React.useEffect(() => {
    let filtered = documents;

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

    setFilteredDocuments(filtered);
  }, [documents, selectedCategory, searchTerm]);

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

    // Simular subida de archivos
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `upload-${Date.now()}-${i}`;

      try {
        // Simular progreso de subida
        for (let progress = 0; progress <= 100; progress += 10) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          setUploadProgress((prev) =>
            prev.map((p) => (p.fileId === fileId ? { ...p, progress } : p))
          );
        }

        // Crear nuevo documento
        const newDocument: DocumentFile = {
          id: `doc-${Date.now()}-${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          category: "OTHER", // Por defecto, se puede cambiar después
          uploadDate: new Date(),
          lastModified: new Date(),
          tags: [],
          uploadedBy: "Usuario Actual",
          bovineId: id || "1",
          url: URL.createObjectURL(file),
          isPublic: false,
          version: 1,
        };

        // Agregar thumbnail para imágenes
        if (file.type.startsWith("image/")) {
          newDocument.thumbnailUrl = URL.createObjectURL(file);
          newDocument.category = "PHOTO";
        }

        setDocuments((prev) => [...prev, newDocument]);

        // Marcar como completado
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.fileId === fileId ? { ...p, status: "completed" } : p
          )
        );
      } catch (error) {
        // Marcar como error
        setUploadProgress((prev) =>
          prev.map((p) =>
            p.fileId === fileId
              ? { ...p, status: "error", error: "Error al subir archivo" }
              : p
          )
        );
      }
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

  const confirmDelete = () => {
    if (documentToDelete) {
      setDocuments((prev) =>
        prev.filter((doc) => doc.id !== documentToDelete.id)
      );
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    }
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

    // Crear nuevo documento
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
      bovineId: id || "1",
      url: URL.createObjectURL(newDocumentForm.file),
      isPublic: newDocumentForm.isPublic,
      version: 1,
    };

    // Agregar thumbnail para imágenes
    if (newDocumentForm.file.type.startsWith("image/")) {
      newDocument.thumbnailUrl = URL.createObjectURL(newDocumentForm.file);
    }

    // Agregar documento a la lista
    setDocuments((prev) => [...prev, newDocument]);

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

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => navigate(`/bovines/detail/${id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Regresar al Detalle</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 backdrop-blur-sm rounded-lg text-white transition-all duration-300 ${
                showFilters ? "bg-white/30" : "bg-white/20 hover:bg-white/30"
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="font-medium">Filtros</span>
            </button>
          </div>
        </motion.div>

        {/* Título */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Documentos del Bovino
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto">
            Gestiona todos los documentos, certificados y archivos relacionados
            con el bovino
          </p>
        </motion.div>

        {/* Estadísticas de documentos */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
        >
          <div
            className={`bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center cursor-pointer transition-all duration-300 ${
              selectedCategory === "ALL"
                ? "ring-2 ring-[#3d8b40]"
                : "hover:bg-white"
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
                className={`bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center cursor-pointer transition-all duration-300 ${
                  selectedCategory === stat.category
                    ? "ring-2 ring-[#3d8b40]"
                    : "hover:bg-white"
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
        </motion.div>

        {/* Barra de búsqueda y filtros */}
        <motion.div
          variants={itemVariants}
          className="bg-[#fffdf8]/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar documentos por nombre, descripción o tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
              />
            </div>

            {/* Filtros adicionales */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  className="flex gap-2"
                >
                  <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent">
                    <option value="">Ordenar por</option>
                    <option value="date">Fecha</option>
                    <option value="name">Nombre</option>
                    <option value="size">Tamaño</option>
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Área de subida de archivos */}
        <motion.div
          variants={itemVariants}
          className="bg-[#fffdf8]/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6"
        >
          <FileUploader
            onFileUpload={handleFileUpload}
            isUploading={isUploading}
          />

          {/* Progreso de subida */}
          <AnimatePresence>
            {uploadProgress.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-6 space-y-3"
              >
                <h4 className="font-semibold text-gray-900">
                  Subiendo archivos...
                </h4>
                {uploadProgress.map((progress) => (
                  <div
                    key={progress.fileId}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
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
                      <motion.div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          progress.status === "completed"
                            ? "bg-green-500"
                            : progress.status === "error"
                            ? "bg-red-500"
                            : "bg-[#3d8b40]"
                        }`}
                        style={{ width: `${progress.progress}%` }}
                      />
                    </div>
                    {progress.error && (
                      <p className="text-sm text-red-600 mt-1">
                        {progress.error}
                      </p>
                    )}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Lista de documentos */}
        <motion.div
          variants={itemVariants}
          className="bg-[#fffdf8]/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Documentos ({filteredDocuments.length})
            </h2>
            <button 
              onClick={handleNewDocument}
              className="flex items-center gap-2 px-4 py-2 bg-[#3d8b40] text-white rounded-lg hover:bg-[#2d6e30] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Documento
            </button>
          </div>

          {filteredDocuments.length > 0 ? (
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
                No se encontraron documentos
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
                  className="text-[#3d8b40] hover:text-[#2d6e30] font-medium"
                >
                  Limpiar filtros
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Modal de confirmación de eliminación */}
        <AnimatePresence>
          {showDeleteModal && documentToDelete && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Confirmar Eliminación
                  </h3>
                  <p className="text-gray-600 mb-6">
                    ¿Estás seguro de que deseas eliminar el documento{" "}
                    <strong>{documentToDelete.name}</strong>? Esta acción no se
                    puede deshacer.
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
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de nuevo documento */}
        <AnimatePresence>
          {showNewDocumentModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Nuevo Documento
                  </h3>
                  <button
                    onClick={handleCloseNewDocumentModal}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <Plus className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Selección de archivo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Archivo *
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
                            ? newDocumentForm.file.name
                            : "Haz clic para seleccionar un archivo"}
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
                      Nombre del documento *
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
                      placeholder="Ingresa el nombre del documento"
                    />
                  </div>

                  {/* Categoría */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoría *
                    </label>
                    <select
                      value={newDocumentForm.category}
                      onChange={(e) =>
                        setNewDocumentForm((prev) => ({
                          ...prev,
                          category: e.target.value as DocumentCategory,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
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
                      Descripción
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
                      placeholder="Describe el contenido del documento (opcional)"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etiquetas
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
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
                        className="w-4 h-4 text-[#3d8b40] border-2 border-gray-300 rounded focus:ring-[#3d8b40] focus:ring-2"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        Documento público
                      </span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1 ml-7">
                      Los documentos públicos pueden ser vistos por otros usuarios
                    </p>
                  </div>

                  {/* Vista previa del archivo */}
                  {newDocumentForm.file && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Vista previa del archivo
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
                            {(newDocumentForm.file.size / 1024 / 1024).toFixed(2)} MB
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
                    className="flex-1 px-4 py-2 bg-[#3d8b40] text-white rounded-lg hover:bg-[#2d6e30] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Crear Documento
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BovineDocuments;