// ArtificialInsemination.tsx
// CRUD completo para gestión de inseminación artificial de ganado bovino
// Sistema de gestión ganadera - Universidad Juárez Autónoma de Tabasco (UJAT)

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
  AlertTriangle,
  Activity,
  FileText,
  X,
  Target,
  User,
  TestTube,
  Heart,
  Save,
  ArrowLeft,
  Syringe,
  MapIcon,
  Info,
} from "lucide-react";

// Simulación de react-bits para animación de texto
const AnimatedText: React.FC<{ children: string; className?: string }> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            delay: index * 0.03,
            duration: 0.3 
          }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
};

// Interfaces para inseminación artificial
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
    paddock?: string;
  };
  semenBatch: string;
  semenProvider: string;
  method: "cervical" | "intrauterine" | "embryo_transfer";
  status: "scheduled" | "completed" | "failed" | "cancelled";
  estrusDetection: {
    date: string;
    time: string;
    intensity: "low" | "medium" | "high";
    signs: string[];
    detectedBy: string;
  };
  previousAttempts: number;
  expectedBirthDate?: string;
  notes: string;
  cost: number;
  followUpDate?: string;
  pregnancyTestDate?: string;
  result?: "pregnant" | "not_pregnant" | "pending";
  semenQuality: {
    motility: number;
    concentration: number;
    morphology: number;
  };
  weatherConditions?: string;
  equipment: string[];
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
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<InseminationRecord | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [, setShowMap] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<InseminationRecord | null>(null);
  
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
  const [formData, setFormData] = useState<Partial<InseminationRecord>>({
    method: "cervical",
    status: "scheduled",
    previousAttempts: 0,
    cost: 0,
    semenQuality: {
      motility: 0,
      concentration: 0,
      morphology: 0,
    },
    estrusDetection: {
      date: "",
      time: "",
      intensity: "medium",
      signs: [],
      detectedBy: "",
    },
    location: {
      lat: 17.989,
      lng: -92.247,
      address: "Villahermosa, Tabasco",
    },
    equipment: [],
  });

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
      date: "2025-07-15",
      time: "08:30",
      location: {
        lat: 17.989,
        lng: -92.247,
        address: "Potrero Norte, Rancho San Miguel",
        paddock: "Potrero 3",
      },
      semenBatch: "HOL-2025-001",
      semenProvider: "Genética Superior S.A.",
      method: "cervical",
      status: "completed",
      estrusDetection: {
        date: "2025-07-14",
        time: "06:00",
        intensity: "high",
        signs: ["Monta activa", "Moco claro", "Vulva hinchada"],
        detectedBy: "Miguel Hernández",
      },
      previousAttempts: 1,
      expectedBirthDate: "2026-04-22",
      notes: "Procedimiento exitoso. Animal en excelentes condiciones.",
      cost: 1500,
      followUpDate: "2025-07-22",
      pregnancyTestDate: "2025-08-15",
      result: "pregnant",
      semenQuality: {
        motility: 85,
        concentration: 120,
        morphology: 92,
      },
      weatherConditions: "Soleado, 24°C",
      equipment: ["Pistola IA", "Catéter", "Guantes", "Termo criogénico"],
      createdAt: "2025-07-15T08:30:00Z",
      updatedAt: "2025-07-15T08:45:00Z",
    },
    {
      id: "ins-002",
      animalId: "cow-124",
      animalName: "Luna",
      animalEarTag: "MX-002",
      technicianId: "tech-002",
      technicianName: "Dra. Martínez",
      date: "2025-07-16",
      time: "09:15",
      location: {
        lat: 17.995,
        lng: -92.255,
        address: "Potrero Sur, Rancho San Miguel",
        paddock: "Potrero 7",
      },
      semenBatch: "BRO-2025-003",
      semenProvider: "Genética del Trópico",
      method: "intrauterine",
      status: "scheduled",
      estrusDetection: {
        date: "2025-07-15",
        time: "18:30",
        intensity: "medium",
        signs: ["Inquietud", "Disminución apetito"],
        detectedBy: "Ana López",
      },
      previousAttempts: 0,
      notes: "Primera inseminación. Seguimiento especial requerido.",
      cost: 1800,
      followUpDate: "2025-07-23",
      pregnancyTestDate: "2025-08-16",
      result: "pending",
      semenQuality: {
        motility: 78,
        concentration: 95,
        morphology: 88,
      },
      weatherConditions: "Nublado, 26°C",
      equipment: ["Sistema IA avanzado", "Ultrasonido", "Termómetro"],
      createdAt: "2025-07-16T09:15:00Z",
      updatedAt: "2025-07-16T09:15:00Z",
    },
  ];

  // Variantes de animación
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecords(mockRecords);
        setFilteredRecords(mockRecords);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Aplicar filtros a los registros
  useEffect(() => {
    let filtered = records;

    // Filtro de búsqueda por texto
    if (filters.searchTerm) {
      filtered = filtered.filter(record =>
        record.animalName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.animalEarTag.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.technicianName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.semenProvider.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (filters.status.length > 0) {
      filtered = filtered.filter(record => filters.status.includes(record.status));
    }

    // Filtro por método
    if (filters.method.length > 0) {
      filtered = filtered.filter(record => filters.method.includes(record.method));
    }

    // Filtro por técnico
    if (filters.technician.length > 0) {
      filtered = filtered.filter(record => filters.technician.includes(record.technicianId));
    }

    // Filtro por resultado
    if (filters.result.length > 0) {
      filtered = filtered.filter(record => 
        record.result && filters.result.includes(record.result)
      );
    }

    // Filtro por rango de fechas
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    setFilteredRecords(filtered);
  }, [records, filters]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = records.length;
    const completed = records.filter(r => r.status === "completed").length;
    const pregnant = records.filter(r => r.result === "pregnant").length;
    const pending = records.filter(r => r.result === "pending").length;
    const successRate = completed > 0 ? ((pregnant / completed) * 100).toFixed(1) : "0";

    return {
      total,
      completed,
      pregnant,
      pending,
      successRate: `${successRate}%`,
      scheduled: records.filter(r => r.status === "scheduled").length,
    };
  }, [records]);

  // Funciones CRUD

  // Crear nuevo registro
  const handleCreate = (data: Partial<InseminationRecord>) => {
    const newRecord: InseminationRecord = {
      id: `ins-${Date.now()}`,
      animalId: data.animalId || "",
      animalName: data.animalName || "",
      animalEarTag: data.animalEarTag || "",
      bullId: data.bullId,
      bullName: data.bullName,
      technicianId: data.technicianId || "",
      technicianName: data.technicianName || "",
      date: data.date || new Date().toISOString().split('T')[0],
      time: data.time || new Date().toTimeString().slice(0, 5),
      location: data.location || {
        lat: 17.989,
        lng: -92.247,
        address: "Villahermosa, Tabasco",
      },
      semenBatch: data.semenBatch || "",
      semenProvider: data.semenProvider || "",
      method: data.method || "cervical",
      status: data.status || "scheduled",
      estrusDetection: data.estrusDetection || {
        date: "",
        time: "",
        intensity: "medium",
        signs: [],
        detectedBy: "",
      },
      previousAttempts: data.previousAttempts || 0,
      expectedBirthDate: data.expectedBirthDate,
      notes: data.notes || "",
      cost: data.cost || 0,
      followUpDate: data.followUpDate,
      pregnancyTestDate: data.pregnancyTestDate,
      result: data.result,
      semenQuality: data.semenQuality || {
        motility: 0,
        concentration: 0,
        morphology: 0,
      },
      weatherConditions: data.weatherConditions,
      equipment: data.equipment || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRecords(prev => [newRecord, ...prev]);
    setShowForm(false);
    resetForm();
  };

  // Actualizar registro existente
  const handleUpdate = (id: string, data: Partial<InseminationRecord>) => {
    setRecords(prev => prev.map(record => 
      record.id === id 
        ? { ...record, ...data, updatedAt: new Date().toISOString() }
        : record
    ));
    setEditingRecord(null);
    setShowForm(false);
    resetForm();
  };

  // Eliminar registro
  const handleDelete = (id: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este registro?")) {
      setRecords(prev => prev.filter(record => record.id !== id));
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      method: "cervical",
      status: "scheduled",
      previousAttempts: 0,
      cost: 0,
      semenQuality: {
        motility: 0,
        concentration: 0,
        morphology: 0,
      },
      estrusDetection: {
        date: "",
        time: "",
        intensity: "medium",
        signs: [],
        detectedBy: "",
      },
      location: {
        lat: 17.989,
        lng: -92.247,
        address: "Villahermosa, Tabasco",
      },
      equipment: [],
    });
  };

  // Función para obtener color del estado
  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-yellow-100 text-yellow-800 border-yellow-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  // Función para obtener color del resultado
  const getResultColor = (result?: string) => {
    const colors = {
      pregnant: "bg-emerald-100 text-emerald-800 border-emerald-200",
      not_pregnant: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return result ? colors[result as keyof typeof colors] || colors.pending : colors.pending;
  };

  // Si está cargando
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              className="w-12 h-12 border-4 border-[#519a7c] border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-600 font-medium">Cargando registros de inseminación...</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20"
          variants={itemVariants}
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-xl flex items-center justify-center">
                <Syringe className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <AnimatedText>Inseminación Artificial</AnimatedText>
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestión completa de procedimientos de inseminación artificial
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 flex items-center space-x-2 ${
                  showFilters 
                    ? "bg-[#519a7c] text-white border-[#519a7c]" 
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#519a7c]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </motion.button>

              <motion.button
                onClick={() => {
                  setEditingRecord(null);
                  resetForm();
                  setShowForm(true);
                }}
                className="px-6 py-2 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-xl hover:from-[#4e9c75] hover:to-[#519a7c] transition-all duration-200 flex items-center space-x-2 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus className="w-4 h-4" />
                <span>Nueva Inseminación</span>
              </motion.button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
            {[
              { label: "Total", value: stats.total, icon: Activity, color: "text-blue-600" },
              { label: "Programadas", value: stats.scheduled, icon: Clock, color: "text-yellow-600" },
              { label: "Completadas", value: stats.completed, icon: CheckCircle, color: "text-green-600" },
              { label: "Gestantes", value: stats.pregnant, icon: Heart, color: "text-pink-600" },
              { label: "Pendientes", value: stats.pending, icon: AlertTriangle, color: "text-orange-600" },
              { label: "Éxito", value: stats.successRate, icon: Target, color: "text-emerald-600" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30"
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Panel de filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {/* Búsqueda por texto */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                      placeholder="Animal, técnico, proveedor..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filtro de fecha inicio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  />
                </div>

                {/* Filtro de fecha fin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  />
                </div>

                {/* Filtro de estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    multiple
                    value={filters.status}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, status: values }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  >
                    <option value="scheduled">Programada</option>
                    <option value="completed">Completada</option>
                    <option value="failed">Fallida</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>

                {/* Filtro de método */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Método
                  </label>
                  <select
                    multiple
                    value={filters.method}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, method: values }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  >
                    <option value="cervical">Cervical</option>
                    <option value="intrauterine">Intrauterino</option>
                    <option value="embryo_transfer">Transferencia de Embriones</option>
                  </select>
                </div>
              </div>

              {/* Botones de control de filtros */}
              <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setFilters({
                    dateRange: { start: "", end: "" },
                    status: [],
                    method: [],
                    technician: [],
                    result: [],
                    searchTerm: "",
                  })}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Limpiar Filtros
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="px-6 py-2 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-lg hover:from-[#4e9c75] hover:to-[#519a7c] transition-all duration-200"
                >
                  Aplicar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controles de vista */}
        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-6 border border-white/20"
          variants={itemVariants}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 font-medium">
                Mostrando {filteredRecords.length} de {records.length} registros
              </span>
            </div>

            <div className="flex items-center space-x-3">
              {/* Botones de vista */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === "grid"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Tarjetas
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === "list"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Lista
                </button>
              </div>

              {/* Botón de exportar */}
              <motion.button
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:border-[#519a7c] hover:text-[#519a7c] transition-all duration-200 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Lista de registros */}
        {viewMode === "grid" ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {filteredRecords.map((record) => (
              <motion.div
                key={record.id}
                className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300"
                variants={itemVariants}
                whileHover={{ y: -5 }}
              >
                {/* Header de la tarjeta */}
                <div className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{record.animalName}</h3>
                        <p className="text-white/80 text-sm">Arete: {record.animalEarTag}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                        {record.status === "scheduled" && "Programada"}
                        {record.status === "completed" && "Completada"}
                        {record.status === "failed" && "Fallida"}
                        {record.status === "cancelled" && "Cancelada"}
                      </span>
                      {record.result && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border mt-1 ${getResultColor(record.result)}`}>
                          {record.result === "pregnant" && "Gestante"}
                          {record.result === "not_pregnant" && "No Gestante"}
                          {record.result === "pending" && "Pendiente"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-4 space-y-4">
                  {/* Información principal */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Fecha:</p>
                      <p className="text-gray-900">{new Date(record.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Hora:</p>
                      <p className="text-gray-900">{record.time}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Método:</p>
                      <p className="text-gray-900">
                        {record.method === "cervical" && "Cervical"}
                        {record.method === "intrauterine" && "Intrauterino"}
                        {record.method === "embryo_transfer" && "Transferencia"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Técnico:</p>
                      <p className="text-gray-900">{record.technicianName}</p>
                    </div>
                  </div>

                  {/* Información del semen */}
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <TestTube className="w-4 h-4 mr-2 text-[#519a7c]" />
                      Información del Semen
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Lote:</span> {record.semenBatch}</p>
                      <p><span className="text-gray-600">Proveedor:</span> {record.semenProvider}</p>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Motilidad</p>
                          <p className="font-medium text-[#519a7c]">{record.semenQuality.motility}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Concentración</p>
                          <p className="font-medium text-[#519a7c]">{record.semenQuality.concentration}M</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-600">Morfología</p>
                          <p className="font-medium text-[#519a7c]">{record.semenQuality.morphology}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{record.location.address}</span>
                  </div>

                  {/* Costo */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#519a7c]">
                      ${record.cost.toLocaleString()}
                    </span>
                    {record.expectedBirthDate && (
                      <span className="text-sm text-gray-600">
                        Parto esperado: {new Date(record.expectedBirthDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Notas */}
                  {record.notes && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-blue-600" />
                        Notas
                      </h4>
                      <p className="text-sm text-gray-700">{record.notes}</p>
                    </div>
                  )}
                </div>

                {/* Acciones */}
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => setSelectedRecord(record)}
                      className="p-2 text-gray-600 hover:text-[#519a7c] hover:bg-white rounded-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Eye className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setEditingRecord(record);
                        setFormData(record);
                        setShowForm(true);
                      }}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => handleDelete(record.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                  <button
                    onClick={() => setShowMap(true)}
                    className="flex items-center space-x-1 text-sm text-[#519a7c] hover:text-[#4e9c75] transition-colors"
                  >
                    <MapIcon className="w-4 h-4" />
                    <span>Ver Ubicación</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // Vista de lista
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            variants={itemVariants}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium">Animal</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Método</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Técnico</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Resultado</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Costo</th>
                    <th className="px-6 py-4 text-center text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <motion.tr
                      key={record.id}
                      className="hover:bg-gray-50 transition-colors"
                      whileHover={{ backgroundColor: "rgba(81, 154, 124, 0.05)" }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{record.animalName}</p>
                          <p className="text-sm text-gray-600">{record.animalEarTag}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900">{new Date(record.date).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{record.time}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-gray-900">
                          {record.method === "cervical" && "Cervical"}
                          {record.method === "intrauterine" && "Intrauterino"}
                          {record.method === "embryo_transfer" && "Transferencia"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{record.technicianName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status === "scheduled" && "Programada"}
                          {record.status === "completed" && "Completada"}
                          {record.status === "failed" && "Fallida"}
                          {record.status === "cancelled" && "Cancelada"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {record.result && (
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getResultColor(record.result)}`}>
                            {record.result === "pregnant" && "Gestante"}
                            {record.result === "not_pregnant" && "No Gestante"}
                            {record.result === "pending" && "Pendiente"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-[#519a7c]">
                          ${record.cost.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <motion.button
                            onClick={() => setSelectedRecord(record)}
                            className="p-1 text-gray-600 hover:text-[#519a7c] transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Eye className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              setEditingRecord(record);
                              setFormData(record);
                              setShowForm(true);
                            }}
                            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDelete(record.id)}
                            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Modal de formulario */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header del formulario */}
                <div className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Syringe className="w-6 h-6" />
                      <h2 className="text-xl font-bold">
                        {editingRecord ? "Editar Inseminación" : "Nueva Inseminación"}
                      </h2>
                    </div>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingRecord(null);
                        resetForm();
                      }}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Contenido del formulario */}
                <div className="p-6 space-y-6">
                  {/* Información del animal */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-[#519a7c]" />
                      Información del Animal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ID del Animal *
                        </label>
                        <input
                          type="text"
                          value={formData.animalId || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, animalId: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="cow-123"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Animal *
                        </label>
                        <input
                          type="text"
                          value={formData.animalName || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="Bella"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Arete *
                        </label>
                        <input
                          type="text"
                          value={formData.animalEarTag || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, animalEarTag: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="MX-001"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información de la inseminación */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Syringe className="w-5 h-5 mr-2 text-blue-600" />
                      Detalles de la Inseminación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha *
                        </label>
                        <input
                          type="date"
                          value={formData.date || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hora *
                        </label>
                        <input
                          type="time"
                          value={formData.time || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Método *
                        </label>
                        <select
                          value={formData.method || "cervical"}
                          onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          required
                        >
                          <option value="cervical">Cervical</option>
                          <option value="intrauterine">Intrauterino</option>
                          <option value="embryo_transfer">Transferencia de Embriones</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado *
                        </label>
                        <select
                          value={formData.status || "scheduled"}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          required
                        >
                          <option value="scheduled">Programada</option>
                          <option value="completed">Completada</option>
                          <option value="failed">Fallida</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Información del técnico */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2 text-green-600" />
                      Técnico Responsable
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ID del Técnico *
                        </label>
                        <input
                          type="text"
                          value={formData.technicianId || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, technicianId: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="tech-001"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Técnico *
                        </label>
                        <input
                          type="text"
                          value={formData.technicianName || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, technicianName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="Dr. García"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información del semen */}
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <TestTube className="w-5 h-5 mr-2 text-yellow-600" />
                      Información del Semen
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lote de Semen *
                        </label>
                        <input
                          type="text"
                          value={formData.semenBatch || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, semenBatch: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="HOL-2025-001"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Proveedor *
                        </label>
                        <input
                          type="text"
                          value={formData.semenProvider || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, semenProvider: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="Genética Superior S.A."
                          required
                        />
                      </div>
                    </div>
                    
                    <h4 className="font-medium text-gray-900 mb-3">Calidad del Semen</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Motilidad (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.semenQuality?.motility || 0}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            semenQuality: { 
                              ...prev.semenQuality!, 
                              motility: parseInt(e.target.value) || 0 
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Concentración (M/ml)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.semenQuality?.concentration || 0}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            semenQuality: { 
                              ...prev.semenQuality!, 
                              concentration: parseInt(e.target.value) || 0 
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Morfología (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.semenQuality?.morphology || 0}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            semenQuality: { 
                              ...prev.semenQuality!, 
                              morphology: parseInt(e.target.value) || 0 
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                      Ubicación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Latitud
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.location?.lat || 17.989}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            location: { 
                              ...prev.location!, 
                              lat: parseFloat(e.target.value) || 17.989 
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Longitud
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={formData.location?.lng || -92.247}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            location: { 
                              ...prev.location!, 
                              lng: parseFloat(e.target.value) || -92.247 
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Dirección
                        </label>
                        <input
                          type="text"
                          value={formData.location?.address || ""}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            location: { 
                              ...prev.location!, 
                              address: e.target.value 
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="Potrero Norte, Rancho San Miguel"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-gray-600" />
                      Información Adicional
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Intentos Previos
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.previousAttempts || 0}
                          onChange={(e) => setFormData(prev => ({ ...prev, previousAttempts: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Costo ($)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={formData.cost || 0}
                          onChange={(e) => setFormData(prev => ({ ...prev, cost: parseInt(e.target.value) || 0 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas
                      </label>
                      <textarea
                        value={formData.notes || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        rows={3}
                        placeholder="Observaciones adicionales..."
                      />
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-3 rounded-b-2xl">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingRecord(null);
                      resetForm();
                    }}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors flex items-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Cancelar</span>
                  </button>
                  <motion.button
                    onClick={() => {
                      if (editingRecord) {
                        handleUpdate(editingRecord.id, formData);
                      } else {
                        handleCreate(formData);
                      }
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-lg hover:from-[#4e9c75] hover:to-[#519a7c] transition-all duration-200 flex items-center space-x-2 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingRecord ? "Actualizar" : "Guardar"}</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de detalles */}
        <AnimatePresence>
          {selectedRecord && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRecord(null)}
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header del modal */}
                <div className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold">{selectedRecord.animalName}</h2>
                      <p className="text-white/80">Arete: {selectedRecord.animalEarTag}</p>
                    </div>
                    <button
                      onClick={() => setSelectedRecord(null)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Contenido del modal */}
                <div className="p-6 space-y-6">
                  {/* Información general */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 border-b pb-2">Información General</h3>
                      <div className="space-y-2">
                        <p><span className="font-medium text-gray-600">Fecha:</span> {new Date(selectedRecord.date).toLocaleDateString()}</p>
                        <p><span className="font-medium text-gray-600">Hora:</span> {selectedRecord.time}</p>
                        <p><span className="font-medium text-gray-600">Método:</span> {selectedRecord.method}</p>
                        <p><span className="font-medium text-gray-600">Estado:</span> 
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(selectedRecord.status)}`}>
                            {selectedRecord.status}
                          </span>
                        </p>
                        <p><span className="font-medium text-gray-600">Técnico:</span> {selectedRecord.technicianName}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 border-b pb-2">Resultados</h3>
                      <div className="space-y-2">
                        {selectedRecord.result && (
                          <p><span className="font-medium text-gray-600">Resultado:</span>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${getResultColor(selectedRecord.result)}`}>
                              {selectedRecord.result}
                            </span>
                          </p>
                        )}
                        <p><span className="font-medium text-gray-600">Intentos Previos:</span> {selectedRecord.previousAttempts}</p>
                        <p><span className="font-medium text-gray-600">Costo:</span> ${selectedRecord.cost.toLocaleString()}</p>
                        {selectedRecord.expectedBirthDate && (
                          <p><span className="font-medium text-gray-600">Parto Esperado:</span> {new Date(selectedRecord.expectedBirthDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Información del semen */}
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Información del Semen</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><span className="font-medium text-gray-600">Lote:</span> {selectedRecord.semenBatch}</p>
                        <p><span className="font-medium text-gray-600">Proveedor:</span> {selectedRecord.semenProvider}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-sm text-gray-600">Motilidad</p>
                          <p className="font-bold text-[#519a7c]">{selectedRecord.semenQuality.motility}%</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Concentración</p>
                          <p className="font-bold text-[#519a7c]">{selectedRecord.semenQuality.concentration}M</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Morfología</p>
                          <p className="font-bold text-[#519a7c]">{selectedRecord.semenQuality.morphology}%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Ubicación</h3>
                    <p className="text-gray-700">{selectedRecord.location.address}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Coordenadas: {selectedRecord.location.lat.toFixed(6)}, {selectedRecord.location.lng.toFixed(6)}
                    </p>
                  </div>

                  {/* Equipos utilizados */}
                  {selectedRecord.equipment && selectedRecord.equipment.length > 0 && (
                    <div className="bg-green-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Equipos Utilizados</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedRecord.equipment.map((item, index) => (
                          <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Condiciones climáticas */}
                  {selectedRecord.weatherConditions && (
                    <div className="bg-orange-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Condiciones Climáticas</h3>
                      <p className="text-gray-700">{selectedRecord.weatherConditions}</p>
                    </div>
                  )}

                  {/* Notas */}
                  {selectedRecord.notes && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Notas</h3>
                      <p className="text-gray-700">{selectedRecord.notes}</p>
                    </div>
                  )}

                  {/* Fechas importantes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRecord.followUpDate && (
                      <div className="bg-purple-50 rounded-xl p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Fecha de Seguimiento</h4>
                        <p className="text-gray-700">{new Date(selectedRecord.followUpDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {selectedRecord.pregnancyTestDate && (
                      <div className="bg-pink-50 rounded-xl p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Prueba de Gestación</h4>
                        <p className="text-gray-700">{new Date(selectedRecord.pregnancyTestDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mensaje cuando no hay registros */}
        {filteredRecords.length === 0 && !isLoading && (
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20"
            variants={itemVariants}
          >
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Syringe className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron registros
              </h3>
              <p className="text-gray-600 mb-6">
                No hay registros de inseminación artificial que coincidan con los filtros aplicados.
              </p>
              <button
                onClick={() => {
                  setEditingRecord(null);
                  resetForm();
                  setShowForm(true);
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-xl hover:from-[#4e9c75] hover:to-[#519a7c] transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Crear Primera Inseminación</span>
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ArtificialInsemination;