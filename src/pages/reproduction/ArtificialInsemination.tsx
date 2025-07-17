// ArtificialInsemination.tsx
// Página para gestión de inseminación artificial de ganado bovino
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  MapPin,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  FileText,
  X,
  ChevronDown,
  ChevronUp,
  Target,
} from "lucide-react";

// Tipos e interfaces para inseminación artificial
interface InseminationRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalEarTag: string;
  bullId?: string;
  bullName?: string;
  technicianId: string;
  technicianName: string;
  date: string;
  time: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  semenBatch: string;
  semenProvider: string;
  method: "cervical" | "intrauterine" | "embryo_transfer";
  status: "scheduled" | "completed" | "failed" | "cancelled";
  estrusDetection: {
    date: string;
    intensity: "low" | "medium" | "high";
    signs: string[];
  };
  previousAttempts: number;
  expectedBirthDate?: string;
  notes: string;
  cost: number;
  followUpDate?: string;
  pregnancyTestDate?: string;
  result?: "pregnant" | "not_pregnant" | "pending";
  createdAt: string;
  updatedAt: string;
}

interface InseminationFilters {
  dateRange: {
    start: string;
    end: string;
  };
  status: string[];
  method: string[];
  technician: string[];
  result: string[];
  searchTerm: string;
}

// Componente principal de Inseminación Artificial
const ArtificialInsemination: React.FC = () => {
  // Estados principales
  const [records, setRecords] = useState<InseminationRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<InseminationRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, setShowForm] = useState<boolean>(false);
  const [, setSelectedRecord] = useState<InseminationRecord | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Estados para filtros
  const [filters, setFilters] = useState<InseminationFilters>({
    dateRange: {
      start: "",
      end: "",
    },
    status: [],
    method: [],
    technician: [],
    result: [],
    searchTerm: "",
  });

  // Estados para formulario
  const [] = useState<boolean>(false);
  const [, setFormData] = useState<Partial<InseminationRecord>>({});

  // Datos de ejemplo para desarrollo
  const mockRecords: InseminationRecord[] = [
    {
      id: "ins-001",
      animalId: "cow-123",
      animalName: "Bella",
      animalEarTag: "MX-001",
      bullId: "bull-456",
      bullName: "Campeón",
      technicianId: "tech-001",
      technicianName: "Dr. García",
      date: "2025-01-15",
      time: "08:30",
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Rancho San José, Tuxtla Gutiérrez, Chiapas",
      },
      semenBatch: "SEM-2025-001",
      semenProvider: "Genética Superior SA",
      method: "cervical",
      status: "completed",
      estrusDetection: {
        date: "2025-01-14",
        intensity: "high",
        signs: ["monta", "mucosidad", "inquietud"],
      },
      previousAttempts: 0,
      expectedBirthDate: "2025-10-15",
      notes: "Inseminación exitosa, animal receptivo",
      cost: 1500,
      followUpDate: "2025-01-22",
      pregnancyTestDate: "2025-02-15",
      result: "pregnant",
      createdAt: "2025-01-15T08:30:00Z",
      updatedAt: "2025-01-15T08:30:00Z",
    },
    {
      id: "ins-002",
      animalId: "cow-124",
      animalName: "Luna",
      animalEarTag: "MX-002",
      technicianId: "tech-002",
      technicianName: "MVZ. Rodríguez",
      date: "2025-01-16",
      time: "10:15",
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Rancho San José, Tuxtla Gutiérrez, Chiapas",
      },
      semenBatch: "SEM-2025-002",
      semenProvider: "ABS Global",
      method: "intrauterine",
      status: "scheduled",
      estrusDetection: {
        date: "2025-01-15",
        intensity: "medium",
        signs: ["mucosidad", "inquietud"],
      },
      previousAttempts: 1,
      notes: "Segunda inseminación, monitorear cuidadosamente",
      cost: 1800,
      followUpDate: "2025-01-23",
      pregnancyTestDate: "2025-02-16",
      result: "pending",
      createdAt: "2025-01-16T10:15:00Z",
      updatedAt: "2025-01-16T10:15:00Z",
    },
  ];

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecords(mockRecords);
        setFilteredRecords(mockRecords);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Efecto para aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [filters, records]);

  // Función para aplicar filtros
  const applyFilters = () => {
    let filtered = [...records];

    // Filtro por término de búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        record =>
          record.animalName.toLowerCase().includes(searchLower) ||
          record.animalEarTag.toLowerCase().includes(searchLower) ||
          record.technicianName.toLowerCase().includes(searchLower) ||
          record.semenProvider.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por rango de fechas
    if (filters.dateRange.start) {
      filtered = filtered.filter(record => record.date >= filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(record => record.date <= filters.dateRange.end);
    }

    // Filtro por estado
    if (filters.status.length > 0) {
      filtered = filtered.filter(record => filters.status.includes(record.status));
    }

    // Filtro por método
    if (filters.method.length > 0) {
      filtered = filtered.filter(record => filters.method.includes(record.method));
    }

    // Filtro por resultado
    if (filters.result.length > 0) {
      filtered = filtered.filter(record => 
        record.result && filters.result.includes(record.result)
      );
    }

    setFilteredRecords(filtered);
  };

  // Función para obtener estadísticas
  const statistics = useMemo(() => {
    const total = records.length;
    const completed = records.filter(r => r.status === "completed").length;
    const scheduled = records.filter(r => r.status === "scheduled").length;
    const pregnant = records.filter(r => r.result === "pregnant").length;
    const successRate = completed > 0 ? Math.round((pregnant / completed) * 100) : 0;

    return {
      total,
      completed,
      scheduled,
      pregnant,
      successRate,
    };
  }, [records]);

  // Animaciones de Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.1,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // Función para obtener el ícono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "scheduled":
        return <Clock className="w-5 h-5 text-blue-600" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-600" />;
      case "cancelled":
        return <X className="w-5 h-5 text-gray-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  // Función para obtener el color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  // Función para obtener el color de resultado
  const getResultColor = (result: string) => {
    switch (result) {
      case "pregnant":
        return "bg-green-100 text-green-800 border-green-200";
      case "not_pregnant":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
    }).format(amount);
  };

  // Componente de tarjeta de estadísticas
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
  }> = ({ title, value, icon, color, subtitle }) => (
    <motion.div
      variants={itemVariants}
      className={`bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="text-gray-400">{icon}</div>
      </div>
    </motion.div>
  );

  // Componente de filtros
  const FiltersPanel: React.FC = () => (
    <AnimatePresence>
      {showFilters && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Rango de fechas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha inicio
              </label>
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha fin
              </label>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              />
            </div>

            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                multiple
                value={filters.status}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    status: Array.from(e.target.selectedOptions, option => option.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="scheduled">Programado</option>
                <option value="completed">Completado</option>
                <option value="failed">Fallido</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Filtro por método */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Método
              </label>
              <select
                multiple
                value={filters.method}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    method: Array.from(e.target.selectedOptions, option => option.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="cervical">Cervical</option>
                <option value="intrauterine">Intrauterino</option>
                <option value="embryo_transfer">Transferencia de embriones</option>
              </select>
            </div>
          </div>

          {/* Botones de acción de filtros */}
          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={() =>
                setFilters({
                  dateRange: { start: "", end: "" },
                  status: [],
                  method: [],
                  technician: [],
                  result: [],
                  searchTerm: "",
                })
              }
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpiar filtros
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] transition-colors"
            >
              Aplicar filtros
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Componente de tarjeta de registro
  const RecordCard: React.FC<{ record: InseminationRecord }> = ({ record }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-300"
    >
      {/* Header de la tarjeta */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{record.animalName}</h3>
          <p className="text-sm text-gray-600">Arete: {record.animalEarTag}</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
            {getStatusIcon(record.status)}
            <span className="ml-1">
              {record.status === "completed" ? "Completado" :
               record.status === "scheduled" ? "Programado" :
               record.status === "failed" ? "Fallido" : "Cancelado"}
            </span>
          </span>
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Fecha</p>
          <p className="font-medium">{formatDate(record.date)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Hora</p>
          <p className="font-medium">{record.time}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Técnico</p>
          <p className="font-medium">{record.technicianName}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Método</p>
          <p className="font-medium">
            {record.method === "cervical" ? "Cervical" :
             record.method === "intrauterine" ? "Intrauterino" : "Transferencia"}
          </p>
        </div>
      </div>

      {/* Información del semen */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-1">Información del semen</p>
        <p className="text-sm text-gray-600">Lote: {record.semenBatch}</p>
        <p className="text-sm text-gray-600">Proveedor: {record.semenProvider}</p>
      </div>

      {/* Resultado de embarazo */}
      {record.result && (
        <div className="mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getResultColor(record.result)}`}>
            <Target className="w-3 h-3 mr-1" />
            {record.result === "pregnant" ? "Embarazada" :
             record.result === "not_pregnant" ? "No embarazada" : "Pendiente"}
          </span>
        </div>
      )}

      {/* Costo */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">Costo</p>
        <p className="text-lg font-bold text-[#519a7c]">{formatCurrency(record.cost)}</p>
      </div>

      {/* Ubicación */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <MapPin className="w-4 h-4 mr-1" />
        <span>{record.location.address}</span>
      </div>

      {/* Acciones */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setSelectedRecord(record)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Ver detalles"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setFormData(record);
            setShowForm(true);
          }}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (confirm("¿Estás seguro de que quieres eliminar este registro?")) {
              setRecords(prev => prev.filter(r => r.id !== record.id));
            }
          }}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );

  // Componente de carga
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
      />
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2">
                Inseminación Artificial
              </h1>
              <p className="text-white/90 text-lg">
                Gestión integral de inseminación artificial del ganado
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nueva Inseminación
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20">
                <Download className="w-5 h-5 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatCard
            title="Total de Registros"
            value={statistics.total}
            icon={<FileText className="w-8 h-8" />}
            color="hover:bg-blue-50"
          />
          <StatCard
            title="Completadas"
            value={statistics.completed}
            icon={<CheckCircle className="w-8 h-8" />}
            color="hover:bg-green-50"
          />
          <StatCard
            title="Programadas"
            value={statistics.scheduled}
            icon={<Clock className="w-8 h-8" />}
            color="hover:bg-yellow-50"
          />
          <StatCard
            title="Embarazadas"
            value={statistics.pregnant}
            icon={<Target className="w-8 h-8" />}
            color="hover:bg-purple-50"
          />
          <StatCard
            title="Tasa de Éxito"
            value={`${statistics.successRate}%`}
            icon={<Activity className="w-8 h-8" />}
            color="hover:bg-indigo-50"
            subtitle="Embarazos confirmados"
          />
        </motion.div>

        {/* Controles de búsqueda y filtros */}
        <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Barra de búsqueda */}
            <div className="relative flex-1 md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por animal, arete, técnico..."
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters(prev => ({ ...prev, searchTerm: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              />
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                  showFilters
                    ? "bg-[#519a7c] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {showFilters ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
              </button>
              
              <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  }`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                    <div className="bg-current rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "list" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  }`}
                >
                  <div className="w-4 h-4 flex flex-col space-y-1">
                    <div className="h-0.5 bg-current rounded"></div>
                    <div className="h-0.5 bg-current rounded"></div>
                    <div className="h-0.5 bg-current rounded"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Panel de filtros */}
        <FiltersPanel />

        {/* Lista de registros */}
        <motion.div variants={itemVariants}>
          {filteredRecords.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-white/20 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron registros
              </h3>
              <p className="text-gray-600 mb-6">
                No hay registros de inseminación que coincidan con los filtros aplicados.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear primer registro
              </button>
            </div>
          ) : (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {filteredRecords.map((record) => (
                <RecordCard key={record.id} record={record} />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ArtificialInsemination;