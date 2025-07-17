// Función para obtener color del resultado de embarazo
  const getPregnancyResultColor = (result?: string) => {
    const colors = {
      pregnant: "bg-green-100 text-green-800 border-green-200",
      not_pregnant: "bg-red-100 text-red-800 border-red-200",
      questionable: "bg-yellow-100 text-yellow-800 border-yellow-200",
      pending: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return result ? colors[result as keyof typeof colors] || colors.pending : colors.pending;
  };// MatingRecords.tsx
// CRUD completo para gestión de registros de apareamiento bovino
// Sistema de gestión ganadera - Universidad Juárez Autónoma de Tabasco (UJAT)

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Heart,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Clock,
  CheckCircle,
  Activity,
  FileText,
  X,
  Target,
  Save,
  ArrowLeft,
  MapPin,
  Info,
  Zap,
  Crown,
  Baby,
  TestTube,
  Thermometer,
  Timer,
  Award,
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

// Interfaces para registros de apareamiento
interface MatingRecord {
  id: string;
  bullId: string;
  bullName: string;
  bullEarTag: string;
  cowId: string;
  cowName: string;
  cowEarTag: string;
  matingDate: string;
  matingTime: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    paddock?: string;
    environment: "field" | "barn" | "breeding_facility";
  };
  matingType: "natural" | "artificial_insemination" | "embryo_transfer" | "synchronized";
  method: "natural_service" | "hand_mating" | "pasture_breeding" | "controlled_breeding";
  estrusDetection: {
    detected: boolean;
    detectionDate: string;
    detectionTime: string;
    intensity: "weak" | "moderate" | "strong";
    signs: string[];
    detectedBy: string;
  };
  technicalDetails: {
    assistedBy: {
      id: string;
      name: string;
      role: "veterinarian" | "technician" | "inseminator" | "staff";
      certification?: string;
    };
    procedure: {
      startTime: string;
      endTime: string;
      duration: number; // minutos
      difficulty: "easy" | "moderate" | "difficult";
      equipment: string[];
    };
    animalCondition: {
      bullCondition: "excellent" | "good" | "fair" | "poor";
      cowCondition: "excellent" | "good" | "fair" | "poor";
      cowReceptivity: "very_receptive" | "receptive" | "reluctant" | "resistant";
      stressLevel: "low" | "moderate" | "high";
    };
  };
  followUp: {
    pregnancyTestScheduled: boolean;
    pregnancyTestDate?: string;
    pregnancyTestMethod?: "palpation" | "ultrasound" | "blood_test";
    pregnancyResult?: "pregnant" | "not_pregnant" | "questionable" | "pending";
    pregnancyConfirmDate?: string;
    expectedCalvingDate?: string;
    repeatBreeding?: {
      scheduled: boolean;
      nextDate?: string;
      reason?: string;
    };
  };
  environmentalFactors: {
    temperature: number;
    humidity: number;
    weather: string;
    moonPhase?: string;
    timeOfDay: "early_morning" | "morning" | "afternoon" | "evening" | "night";
  };
  notes: string;
  cost: number;
  status: "scheduled" | "in_progress" | "completed" | "failed" | "cancelled";
  result?: "successful" | "unsuccessful" | "pending" | "questionable";
  complications?: string[];
  createdAt: string;
  updatedAt: string;
}

interface MatingFilters {
  dateRange: {
    start: string;
    end: string;
  };
  matingType: string[];
  status: string[];
  result: string[];
  bullId: string;
  cowId: string;
  assistedBy: string[];
  location: string[];
  searchTerm: string;
}

// Componente principal de Registros de Apareamiento
const MatingRecords: React.FC = () => {
  // Estados principales
  const [records, setRecords] = useState<MatingRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MatingRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<MatingRecord | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<MatingRecord | null>(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState<MatingFilters>({
    dateRange: {
      start: "",
      end: "",
    },
    matingType: [],
    status: [],
    result: [],
    bullId: "",
    cowId: "",
    assistedBy: [],
    location: [],
    searchTerm: "",
  });

  // Estados para formulario
  const [formData, setFormData] = useState<Partial<MatingRecord>>({
    matingType: "natural",
    method: "natural_service",
    status: "scheduled",
    cost: 0,
    estrusDetection: {
      detected: false,
      detectionDate: "",
      detectionTime: "",
      intensity: "moderate",
      signs: [],
      detectedBy: "",
    },
    location: {
      lat: 17.989,
      lng: -92.247,
      address: "Villahermosa, Tabasco",
      environment: "field",
    },
    technicalDetails: {
      assistedBy: {
        id: "",
        name: "",
        role: "staff",
      },
      procedure: {
        startTime: "",
        endTime: "",
        duration: 0,
        difficulty: "easy",
        equipment: [],
      },
      animalCondition: {
        bullCondition: "good",
        cowCondition: "good",
        cowReceptivity: "receptive",
        stressLevel: "low",
      },
    },
    followUp: {
      pregnancyTestScheduled: false,
    },
    environmentalFactors: {
      temperature: 25,
      humidity: 60,
      weather: "",
      timeOfDay: "morning",
    },
  });

  // Datos de ejemplo para desarrollo
  const mockRecords: MatingRecord[] = [
    {
      id: "mating-001",
      bullId: "bull-001",
      bullName: "Campeón",
      bullEarTag: "T-001",
      cowId: "cow-123",
      cowName: "Bella",
      cowEarTag: "MX-001",
      matingDate: "2025-07-15",
      matingTime: "07:30",
      location: {
        lat: 17.989,
        lng: -92.247,
        address: "Potrero Norte, Rancho San Miguel",
        paddock: "Potrero 3",
        environment: "field",
      },
      matingType: "natural",
      method: "natural_service",
      estrusDetection: {
        detected: true,
        detectionDate: "2025-07-14",
        detectionTime: "18:00",
        intensity: "strong",
        signs: ["Monta activa", "Vulva hinchada", "Moco claro", "Inquietud"],
        detectedBy: "Miguel Hernández",
      },
      technicalDetails: {
        assistedBy: {
          id: "staff-001",
          name: "Miguel Hernández",
          role: "staff",
        },
        procedure: {
          startTime: "07:30",
          endTime: "07:45",
          duration: 15,
          difficulty: "easy",
          equipment: ["Cuerda de manejo", "Collar de servicio"],
        },
        animalCondition: {
          bullCondition: "excellent",
          cowCondition: "excellent",
          cowReceptivity: "very_receptive",
          stressLevel: "low",
        },
      },
      followUp: {
        pregnancyTestScheduled: true,
        pregnancyTestDate: "2025-08-15",
        pregnancyTestMethod: "ultrasound",
        pregnancyResult: "pregnant",
        pregnancyConfirmDate: "2025-08-15",
        expectedCalvingDate: "2026-04-22",
      },
      environmentalFactors: {
        temperature: 24,
        humidity: 65,
        weather: "Soleado, brisa ligera",
        moonPhase: "Cuarto creciente",
        timeOfDay: "early_morning",
      },
      notes: "Apareamiento natural exitoso. Vaca muy receptiva. Toro mostró excelente comportamiento. Sin complicaciones.",
      cost: 800,
      status: "completed",
      result: "successful",
      createdAt: "2025-07-15T07:30:00Z",
      updatedAt: "2025-08-15T10:00:00Z",
    },
    {
      id: "mating-002",
      bullId: "bull-002",
      bullName: "Emperador",
      bullEarTag: "T-002",
      cowId: "cow-124",
      cowName: "Luna",
      cowEarTag: "MX-002",
      matingDate: "2025-07-16",
      matingTime: "08:15",
      location: {
        lat: 17.995,
        lng: -92.255,
        address: "Potrero Sur, Rancho San Miguel",
        paddock: "Potrero 7",
        environment: "barn",
      },
      matingType: "natural",
      method: "hand_mating",
      estrusDetection: {
        detected: true,
        detectionDate: "2025-07-15",
        detectionTime: "16:30",
        intensity: "moderate",
        signs: ["Vulva ligeramente hinchada", "Inquietud leve"],
        detectedBy: "Ana López",
      },
      technicalDetails: {
        assistedBy: {
          id: "vet-001",
          name: "Dr. García",
          role: "veterinarian",
          certification: "MVZ Reproductivo",
        },
        procedure: {
          startTime: "08:15",
          endTime: "08:35",
          duration: 20,
          difficulty: "moderate",
          equipment: ["Manga de manejo", "Nariguera", "Collar de servicio"],
        },
        animalCondition: {
          bullCondition: "good",
          cowCondition: "good",
          cowReceptivity: "receptive",
          stressLevel: "moderate",
        },
      },
      followUp: {
        pregnancyTestScheduled: true,
        pregnancyTestDate: "2025-08-16",
        pregnancyTestMethod: "palpation",
        pregnancyResult: "pending",
      },
      environmentalFactors: {
        temperature: 26,
        humidity: 70,
        weather: "Nublado, sin viento",
        moonPhase: "Cuarto creciente",
        timeOfDay: "morning",
      },
      notes: "Apareamiento controlado en corral. Se requirió ligera asistencia para posicionamiento. Vaca mostró receptividad moderada.",
      cost: 1200,
      status: "completed",
      result: "pending",
      createdAt: "2025-07-16T08:15:00Z",
      updatedAt: "2025-07-16T08:35:00Z",
    },
    {
      id: "mating-003",
      bullId: "bull-003",
      bullName: "Titán",
      bullEarTag: "T-003",
      cowId: "cow-125",
      cowName: "Esperanza",
      cowEarTag: "MX-003",
      matingDate: "2025-07-18",
      matingTime: "09:00",
      location: {
        lat: 17.992,
        lng: -92.250,
        address: "Área de Reproducción, Rancho San Miguel",
        paddock: "Corral de Servicio",
        environment: "breeding_facility",
      },
      matingType: "synchronized",
      method: "controlled_breeding",
      estrusDetection: {
        detected: true,
        detectionDate: "2025-07-17",
        detectionTime: "14:00",
        intensity: "strong",
        signs: ["Estro sincronizado", "Vulva hinchada", "Moco abundante"],
        detectedBy: "Dr. García",
      },
      technicalDetails: {
        assistedBy: {
          id: "vet-001",
          name: "Dr. García",
          role: "veterinarian",
          certification: "MVZ Reproductivo",
        },
        procedure: {
          startTime: "09:00",
          endTime: "09:10",
          duration: 10,
          difficulty: "easy",
          equipment: ["Protocolo IATF", "Hormonas", "Equipos de sincronización"],
        },
        animalCondition: {
          bullCondition: "excellent",
          cowCondition: "excellent",
          cowReceptivity: "very_receptive",
          stressLevel: "low",
        },
      },
      followUp: {
        pregnancyTestScheduled: true,
        pregnancyTestDate: "2025-08-18",
        pregnancyTestMethod: "ultrasound",
      },
      environmentalFactors: {
        temperature: 23,
        humidity: 55,
        weather: "Fresco, ideal para reproducción",
        moonPhase: "Luna llena",
        timeOfDay: "morning",
      },
      notes: "Programa de sincronización de estros exitoso. Condiciones ideales para apareamiento. Animal en protocolo IATF.",
      cost: 2500,
      status: "scheduled",
      result: "pending",
      createdAt: "2025-07-17T14:00:00Z",
      updatedAt: "2025-07-17T14:00:00Z",
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
        record.bullName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.cowName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.bullEarTag.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.cowEarTag.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.technicalDetails.assistedBy.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo de apareamiento
    if (filters.matingType.length > 0) {
      filtered = filtered.filter(record => filters.matingType.includes(record.matingType));
    }

    // Filtro por estado
    if (filters.status.length > 0) {
      filtered = filtered.filter(record => filters.status.includes(record.status));
    }

    // Filtro por resultado
    if (filters.result.length > 0) {
      filtered = filtered.filter(record => 
        record.result && filters.result.includes(record.result)
      );
    }

    // Filtro por toro específico
    if (filters.bullId) {
      filtered = filtered.filter(record => record.bullId === filters.bullId);
    }

    // Filtro por vaca específica
    if (filters.cowId) {
      filtered = filtered.filter(record => record.cowId === filters.cowId);
    }

    // Filtro por rango de fechas
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.matingDate);
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
    const successful = records.filter(r => r.result === "successful").length;
    const pregnant = records.filter(r => r.followUp.pregnancyResult === "pregnant").length;
    const successRate = completed > 0 ? ((successful / completed) * 100).toFixed(1) : "0";
    const pregnancyRate = completed > 0 ? ((pregnant / completed) * 100).toFixed(1) : "0";

    return {
      total,
      completed,
      successful,
      pregnant,
      successRate: `${successRate}%`,
      pregnancyRate: `${pregnancyRate}%`,
      scheduled: records.filter(r => r.status === "scheduled").length,
      pending: records.filter(r => r.result === "pending").length,
    };
  }, [records]);

  // Funciones CRUD

  // Crear nuevo registro
  const handleCreate = (data: Partial<MatingRecord>) => {
    const newRecord: MatingRecord = {
      id: `mating-${Date.now()}`,
      bullId: data.bullId || "",
      bullName: data.bullName || "",
      bullEarTag: data.bullEarTag || "",
      cowId: data.cowId || "",
      cowName: data.cowName || "",
      cowEarTag: data.cowEarTag || "",
      matingDate: data.matingDate || new Date().toISOString().split('T')[0],
      matingTime: data.matingTime || new Date().toTimeString().slice(0, 5),
      location: data.location || {
        lat: 17.989,
        lng: -92.247,
        address: "Villahermosa, Tabasco",
        environment: "field",
      },
      matingType: data.matingType || "natural",
      method: data.method || "natural_service",
      estrusDetection: data.estrusDetection || {
        detected: false,
        detectionDate: "",
        detectionTime: "",
        intensity: "moderate",
        signs: [],
        detectedBy: "",
      },
      technicalDetails: data.technicalDetails || {
        assistedBy: {
          id: "",
          name: "",
          role: "staff",
        },
        procedure: {
          startTime: "",
          endTime: "",
          duration: 0,
          difficulty: "easy",
          equipment: [],
        },
        animalCondition: {
          bullCondition: "good",
          cowCondition: "good",
          cowReceptivity: "receptive",
          stressLevel: "low",
        },
      },
      followUp: data.followUp || {
        pregnancyTestScheduled: false,
      },
      environmentalFactors: data.environmentalFactors || {
        temperature: 25,
        humidity: 60,
        weather: "",
        timeOfDay: "morning",
      },
      notes: data.notes || "",
      cost: data.cost || 0,
      status: data.status || "scheduled",
      result: data.result,
      complications: data.complications,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRecords(prev => [newRecord, ...prev]);
    setShowForm(false);
    resetForm();
  };

  // Actualizar registro existente
  const handleUpdate = (id: string, data: Partial<MatingRecord>) => {
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
    if (window.confirm("¿Está seguro de que desea eliminar este registro de apareamiento?")) {
      setRecords(prev => prev.filter(record => record.id !== id));
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      matingType: "natural",
      method: "natural_service",
      status: "scheduled",
      cost: 0,
      estrusDetection: {
        detected: false,
        detectionDate: "",
        detectionTime: "",
        intensity: "moderate",
        signs: [],
        detectedBy: "",
      },
      location: {
        lat: 17.989,
        lng: -92.247,
        address: "Villahermosa, Tabasco",
        environment: "field",
      },
      technicalDetails: {
        assistedBy: {
          id: "",
          name: "",
          role: "staff",
        },
        procedure: {
          startTime: "",
          endTime: "",
          duration: 0,
          difficulty: "easy",
          equipment: [],
        },
        animalCondition: {
          bullCondition: "good",
          cowCondition: "good",
          cowReceptivity: "receptive",
          stressLevel: "low",
        },
      },
      followUp: {
        pregnancyTestScheduled: false,
      },
      environmentalFactors: {
        temperature: 25,
        humidity: 60,
        weather: "",
        timeOfDay: "morning",
      },
    });
  };

  // Función para obtener color del estado
  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-yellow-100 text-yellow-800 border-yellow-200",
      in_progress: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      cancelled: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  // Función para obtener color del resultado
  const getResultColor = (result?: string) => {
    const colors = {
      successful: "bg-emerald-100 text-emerald-800 border-emerald-200",
      unsuccessful: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-blue-100 text-blue-800 border-blue-200",
      questionable: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return result ? colors[result as keyof typeof colors] || colors.pending : colors.pending;
  };

  // Función para obtener icono del tipo de apareamiento
  const getMatingTypeIcon = (type: string) => {
    const icons = {
      natural: <Heart className="w-5 h-5" />,
      artificial_insemination: <TestTube className="w-5 h-5" />,
      embryo_transfer: <Zap className="w-5 h-5" />,
      synchronized: <Timer className="w-5 h-5" />,
    };
    return icons[type as keyof typeof icons] || icons.natural;
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
            <p className="text-gray-600 font-medium">Cargando registros de apareamiento...</p>
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
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <AnimatedText>Registros de Apareamiento</AnimatedText>
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestión completa de servicios reproductivos y apareamientos
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
                <span>Nuevo Apareamiento</span>
              </motion.button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
            {[
              { label: "Total", value: stats.total, icon: Activity, color: "text-blue-600" },
              { label: "Programados", value: stats.scheduled, icon: Clock, color: "text-yellow-600" },
              { label: "Completados", value: stats.completed, icon: CheckCircle, color: "text-green-600" },
              { label: "Exitosos", value: stats.successful, icon: Award, color: "text-emerald-600" },
              { label: "Tasa Éxito", value: stats.successRate, icon: Target, color: "text-purple-600" },
              { label: "Tasa Gestación", value: stats.pregnancyRate, icon: Baby, color: "text-pink-600" },
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
                      placeholder="Toro, vaca, técnico..."
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

                {/* Filtro de tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    multiple
                    value={filters.matingType}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, matingType: values }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  >
                    <option value="natural">Natural</option>
                    <option value="artificial_insemination">IA</option>
                    <option value="embryo_transfer">Transferencia</option>
                    <option value="synchronized">Sincronizado</option>
                  </select>
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
                    <option value="scheduled">Programado</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="completed">Completado</option>
                    <option value="failed">Fallido</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Botones de control de filtros */}
              <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setFilters({
                    dateRange: { start: "", end: "" },
                    matingType: [],
                    status: [],
                    result: [],
                    bullId: "",
                    cowId: "",
                    assistedBy: [],
                    location: [],
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
                        {getMatingTypeIcon(record.matingType)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{record.bullName} × {record.cowName}</h3>
                        <p className="text-white/80 text-sm">
                          {record.bullEarTag} × {record.cowEarTag}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                        {record.status === "scheduled" && "Programado"}
                        {record.status === "in_progress" && "En Progreso"}
                        {record.status === "completed" && "Completado"}
                        {record.status === "failed" && "Fallido"}
                        {record.status === "cancelled" && "Cancelado"}
                      </span>
                      {record.result && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getResultColor(record.result)}`}>
                          {record.result === "successful" && "Exitoso"}
                          {record.result === "unsuccessful" && "Fallido"}
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
                      <p className="text-gray-900">{new Date(record.matingDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Hora:</p>
                      <p className="text-gray-900">{record.matingTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Tipo:</p>
                      <p className="text-gray-900">
                        {record.matingType === "natural" && "Natural"}
                        {record.matingType === "artificial_insemination" && "IA"}
                        {record.matingType === "embryo_transfer" && "Transferencia"}
                        {record.matingType === "synchronized" && "Sincronizado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Método:</p>
                      <p className="text-gray-900">
                        {record.method === "natural_service" && "Servicio Natural"}
                        {record.method === "hand_mating" && "Monta Asistida"}
                        {record.method === "pasture_breeding" && "Potrero"}
                        {record.method === "controlled_breeding" && "Controlado"}
                      </p>
                    </div>
                  </div>

                  {/* Detección de estro */}
                  {record.estrusDetection.detected && (
                    <div className="bg-pink-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Zap className="w-4 h-4 mr-2 text-pink-600" />
                        Detección de Estro
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Intensidad:</span> 
                          <span className={`ml-1 font-medium ${
                            record.estrusDetection.intensity === "strong" ? "text-green-600" :
                            record.estrusDetection.intensity === "moderate" ? "text-yellow-600" :
                            "text-red-600"
                          }`}>
                            {record.estrusDetection.intensity === "strong" && "Fuerte"}
                            {record.estrusDetection.intensity === "moderate" && "Moderada"}
                            {record.estrusDetection.intensity === "weak" && "Débil"}
                          </span>
                        </p>
                        <p><span className="text-gray-600">Detectado por:</span> {record.estrusDetection.detectedBy}</p>
                        {record.estrusDetection.signs.length > 0 && (
                          <div>
                            <p className="text-gray-600 font-medium">Signos:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {record.estrusDetection.signs.slice(0, 3).map((sign, index) => (
                                <span key={index} className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs">
                                  {sign}
                                </span>
                              ))}
                              {record.estrusDetection.signs.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{record.estrusDetection.signs.length - 3} más
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Condición de los animales */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Crown className="w-4 h-4 mr-2 text-blue-600" />
                      Condición de Animales
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Toro:</p>
                        <span className={`font-medium ${
                          record.technicalDetails.animalCondition.bullCondition === "excellent" ? "text-green-600" :
                          record.technicalDetails.animalCondition.bullCondition === "good" ? "text-blue-600" :
                          record.technicalDetails.animalCondition.bullCondition === "fair" ? "text-yellow-600" :
                          "text-red-600"
                        }`}>
                          {record.technicalDetails.animalCondition.bullCondition === "excellent" && "Excelente"}
                          {record.technicalDetails.animalCondition.bullCondition === "good" && "Bueno"}
                          {record.technicalDetails.animalCondition.bullCondition === "fair" && "Regular"}
                          {record.technicalDetails.animalCondition.bullCondition === "poor" && "Malo"}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-600">Vaca:</p>
                        <span className={`font-medium ${
                          record.technicalDetails.animalCondition.cowCondition === "excellent" ? "text-green-600" :
                          record.technicalDetails.animalCondition.cowCondition === "good" ? "text-blue-600" :
                          record.technicalDetails.animalCondition.cowCondition === "fair" ? "text-yellow-600" :
                          "text-red-600"
                        }`}>
                          {record.technicalDetails.animalCondition.cowCondition === "excellent" && "Excelente"}
                          {record.technicalDetails.animalCondition.cowCondition === "good" && "Bueno"}
                          {record.technicalDetails.animalCondition.cowCondition === "fair" && "Regular"}
                          {record.technicalDetails.animalCondition.cowCondition === "poor" && "Malo"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Seguimiento */}
                  {record.followUp.pregnancyTestScheduled && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Baby className="w-4 h-4 mr-2 text-green-600" />
                        Seguimiento
                      </h4>
                      <div className="space-y-1 text-sm">
                        {record.followUp.pregnancyTestDate && (
                          <p><span className="text-gray-600">Prueba gestación:</span> {new Date(record.followUp.pregnancyTestDate).toLocaleDateString()}</p>
                        )}
                        {record.followUp.pregnancyResult && (
                          <p><span className="text-gray-600">Resultado:</span> 
                            <span className={`ml-1 font-medium ${
                              record.followUp.pregnancyResult === "pregnant" ? "text-green-600" :
                              record.followUp.pregnancyResult === "not_pregnant" ? "text-red-600" :
                              "text-yellow-600"
                            }`}>
                              {record.followUp.pregnancyResult === "pregnant" && "Gestante"}
                              {record.followUp.pregnancyResult === "not_pregnant" && "No Gestante"}
                              {record.followUp.pregnancyResult === "questionable" && "Dudoso"}
                            </span>
                          </p>
                        )}
                        {record.followUp.expectedCalvingDate && (
                          <p><span className="text-gray-600">Parto esperado:</span> {new Date(record.followUp.expectedCalvingDate).toLocaleDateString()}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Factores ambientales */}
                  <div className="bg-orange-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Thermometer className="w-4 h-4 mr-2 text-orange-600" />
                      Condiciones Ambientales
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="text-gray-600">Temperatura:</span> {record.environmentalFactors.temperature}°C</p>
                      <p><span className="text-gray-600">Humedad:</span> {record.environmentalFactors.humidity}%</p>
                    </div>
                    {record.environmentalFactors.weather && (
                      <p className="text-sm text-gray-700 mt-1">{record.environmentalFactors.weather}</p>
                    )}
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
                    <span className="text-sm text-gray-600">
                      Asistido por: {record.technicalDetails.assistedBy.name}
                    </span>
                  </div>

                  {/* Notas */}
                  {record.notes && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-600" />
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
                  <div className="text-xs text-gray-500">
                    {new Date(record.createdAt).toLocaleDateString()}
                  </div>
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
                    <th className="px-6 py-4 text-left text-sm font-medium">Animales</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Resultado</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Gestación</th>
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
                          <p className="font-medium text-gray-900">{record.bullName} × {record.cowName}</p>
                          <p className="text-sm text-gray-600">{record.bullEarTag} × {record.cowEarTag}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900">{new Date(record.matingDate).toLocaleDateString()}</p>
                          <p className="text-sm text-gray-600">{record.matingTime}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getMatingTypeIcon(record.matingType)}
                          <span className="text-gray-900">
                            {record.matingType === "natural" && "Natural"}
                            {record.matingType === "artificial_insemination" && "IA"}
                            {record.matingType === "embryo_transfer" && "Transferencia"}
                            {record.matingType === "synchronized" && "Sincronizado"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status === "scheduled" && "Programado"}
                          {record.status === "in_progress" && "En Progreso"}
                          {record.status === "completed" && "Completado"}
                          {record.status === "failed" && "Fallido"}
                          {record.status === "cancelled" && "Cancelado"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {record.result && (
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getResultColor(record.result)}`}>
                            {record.result === "successful" && "Exitoso"}
                            {record.result === "unsuccessful" && "Fallido"}
                            {record.result === "pending" && "Pendiente"}
                            {record.result === "questionable" && "Dudoso"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {record.followUp.pregnancyResult && (
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getPregnancyResultColor(record.followUp.pregnancyResult)}`}>
                            {record.followUp.pregnancyResult === "pregnant" && "Gestante"}
                            {record.followUp.pregnancyResult === "not_pregnant" && "No Gestante"}
                            {record.followUp.pregnancyResult === "questionable" && "Dudoso"}
                            {record.followUp.pregnancyResult === "pending" && "Pendiente"}
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header del formulario */}
                <div className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Heart className="w-6 h-6" />
                      <h2 className="text-xl font-bold">
                        {editingRecord ? "Editar Apareamiento" : "Nuevo Apareamiento"}
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
                  {/* Información de los animales */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Crown className="w-5 h-5 mr-2 text-blue-600" />
                      Información de los Animales
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Información del toro */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Toro</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ID del Toro *
                            </label>
                            <input
                              type="text"
                              value={formData.bullId || ""}
                              onChange={(e) => setFormData(prev => ({ ...prev, bullId: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                              placeholder="bull-001"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nombre del Toro *
                            </label>
                            <input
                              type="text"
                              value={formData.bullName || ""}
                              onChange={(e) => setFormData(prev => ({ ...prev, bullName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                              placeholder="Campeón"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Arete del Toro *
                            </label>
                            <input
                              type="text"
                              value={formData.bullEarTag || ""}
                              onChange={(e) => setFormData(prev => ({ ...prev, bullEarTag: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                              placeholder="T-001"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Información de la vaca */}
                      <div className="space-y-4">
                        <h4 className="font-medium text-gray-900">Vaca</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              ID de la Vaca *
                            </label>
                            <input
                              type="text"
                              value={formData.cowId || ""}
                              onChange={(e) => setFormData(prev => ({ ...prev, cowId: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                              placeholder="cow-123"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Nombre de la Vaca *
                            </label>
                            <input
                              type="text"
                              value={formData.cowName || ""}
                              onChange={(e) => setFormData(prev => ({ ...prev, cowName: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                              placeholder="Bella"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Arete de la Vaca *
                            </label>
                            <input
                              type="text"
                              value={formData.cowEarTag || ""}
                              onChange={(e) => setFormData(prev => ({ ...prev, cowEarTag: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                              placeholder="MX-001"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Detalles del apareamiento */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-green-600" />
                      Detalles del Apareamiento
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha *
                        </label>
                        <input
                          type="date"
                          value={formData.matingDate || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, matingDate: e.target.value }))}
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
                          value={formData.matingTime || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, matingTime: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo *
                        </label>
                        <select
                          value={formData.matingType || "natural"}
                          onChange={(e) => setFormData(prev => ({ ...prev, matingType: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          required
                        >
                          <option value="natural">Natural</option>
                          <option value="artificial_insemination">Inseminación Artificial</option>
                          <option value="embryo_transfer">Transferencia de Embriones</option>
                          <option value="synchronized">Sincronizado</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Método *
                        </label>
                        <select
                          value={formData.method || "natural_service"}
                          onChange={(e) => setFormData(prev => ({ ...prev, method: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          required
                        >
                          <option value="natural_service">Servicio Natural</option>
                          <option value="hand_mating">Monta Asistida</option>
                          <option value="pasture_breeding">Apareamiento en Potrero</option>
                          <option value="controlled_breeding">Apareamiento Controlado</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-purple-600" />
                      Ubicación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                          Ambiente
                        </label>
                        <select
                          value={formData.location?.environment || "field"}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            location: { 
                              ...prev.location!, 
                              environment: e.target.value as any 
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        >
                          <option value="field">Campo</option>
                          <option value="barn">Establo</option>
                          <option value="breeding_facility">Instalación de Reproducción</option>
                        </select>
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
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Info className="w-5 h-5 mr-2 text-yellow-600" />
                      Información Adicional
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado
                        </label>
                        <select
                          value={formData.status || "scheduled"}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        >
                          <option value="scheduled">Programado</option>
                          <option value="in_progress">En Progreso</option>
                          <option value="completed">Completado</option>
                          <option value="failed">Fallido</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
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
                        placeholder="Observaciones adicionales del apareamiento..."
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
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
                      <h2 className="text-2xl font-bold">
                        {selectedRecord.bullName} × {selectedRecord.cowName}
                      </h2>
                      <p className="text-white/80">
                        {selectedRecord.bullEarTag} × {selectedRecord.cowEarTag}
                      </p>
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
                        <p><span className="font-medium text-gray-600">Fecha:</span> {new Date(selectedRecord.matingDate).toLocaleDateString()}</p>
                        <p><span className="font-medium text-gray-600">Hora:</span> {selectedRecord.matingTime}</p>
                        <p><span className="font-medium text-gray-600">Tipo:</span> {selectedRecord.matingType}</p>
                        <p><span className="font-medium text-gray-600">Método:</span> {selectedRecord.method}</p>
                        <p><span className="font-medium text-gray-600">Estado:</span> 
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${getStatusColor(selectedRecord.status)}`}>
                            {selectedRecord.status}
                          </span>
                        </p>
                        <p><span className="font-medium text-gray-600">Costo:</span> ${selectedRecord.cost.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-900 border-b pb-2">Resultados</h3>
                      <div className="space-y-2">
                        {selectedRecord.result && (
                          <p><span className="font-medium text-gray-600">Resultado:</span>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${getResultColor(selectedRecord.result)}`}>
                              {selectedRecord.result === "successful" && "Exitoso"}
                              {selectedRecord.result === "unsuccessful" && "Fallido"}
                              {selectedRecord.result === "pending" && "Pendiente"}
                              {selectedRecord.result === "questionable" && "Dudoso"}
                            </span>
                          </p>
                        )}
                        {selectedRecord.followUp.pregnancyResult && (
                          <p><span className="font-medium text-gray-600">Gestación:</span>
                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ml-2 ${getPregnancyResultColor(selectedRecord.followUp.pregnancyResult)}`}>
                              {selectedRecord.followUp.pregnancyResult === "pregnant" && "Gestante"}
                              {selectedRecord.followUp.pregnancyResult === "not_pregnant" && "No Gestante"}
                              {selectedRecord.followUp.pregnancyResult === "questionable" && "Dudoso"}
                              {selectedRecord.followUp.pregnancyResult === "pending" && "Pendiente"}
                            </span>
                          </p>
                        )}
                        {selectedRecord.followUp.expectedCalvingDate && (
                          <p><span className="font-medium text-gray-600">Parto esperado:</span> {new Date(selectedRecord.followUp.expectedCalvingDate).toLocaleDateString()}</p>
                        )}
                        <p><span className="font-medium text-gray-600">Asistido por:</span> {selectedRecord.technicalDetails.assistedBy.name}</p>
                      </div>
                    </div>
                  </div>

                  {/* Detección de estro */}
                  {selectedRecord.estrusDetection.detected && (
                    <div className="bg-pink-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Detección de Estro</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p><span className="font-medium text-gray-600">Fecha detección:</span> {new Date(selectedRecord.estrusDetection.detectionDate).toLocaleDateString()}</p>
                          <p><span className="font-medium text-gray-600">Hora:</span> {selectedRecord.estrusDetection.detectionTime}</p>
                          <p><span className="font-medium text-gray-600">Intensidad:</span> {selectedRecord.estrusDetection.intensity}</p>
                          <p><span className="font-medium text-gray-600">Detectado por:</span> {selectedRecord.estrusDetection.detectedBy}</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-600 mb-2">Signos observados:</p>
                          <div className="flex flex-wrap gap-1">
                            {selectedRecord.estrusDetection.signs.map((sign, index) => (
                              <span key={index} className="bg-pink-100 text-pink-800 px-2 py-1 rounded-full text-xs">
                                {sign}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Condición de animales */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Condición de los Animales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Toro</h4>
                        <p><span className="font-medium text-gray-600">Condición:</span> {selectedRecord.technicalDetails.animalCondition.bullCondition}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Vaca</h4>
                        <p><span className="font-medium text-gray-600">Condición:</span> {selectedRecord.technicalDetails.animalCondition.cowCondition}</p>
                        <p><span className="font-medium text-gray-600">Receptividad:</span> {selectedRecord.technicalDetails.animalCondition.cowReceptivity}</p>
                        <p><span className="font-medium text-gray-600">Nivel de estrés:</span> {selectedRecord.technicalDetails.animalCondition.stressLevel}</p>
                      </div>
                    </div>
                  </div>

                  {/* Factores ambientales */}
                  <div className="bg-orange-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Condiciones Ambientales</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><span className="font-medium text-gray-600">Temperatura:</span> {selectedRecord.environmentalFactors.temperature}°C</p>
                        <p><span className="font-medium text-gray-600">Humedad:</span> {selectedRecord.environmentalFactors.humidity}%</p>
                      </div>
                      <div>
                        <p><span className="font-medium text-gray-600">Momento del día:</span> {selectedRecord.environmentalFactors.timeOfDay}</p>
                        {selectedRecord.environmentalFactors.weather && (
                          <p><span className="font-medium text-gray-600">Clima:</span> {selectedRecord.environmentalFactors.weather}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="bg-purple-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Ubicación</h3>
                    <p className="text-gray-700">{selectedRecord.location.address}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Coordenadas: {selectedRecord.location.lat.toFixed(6)}, {selectedRecord.location.lng.toFixed(6)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Ambiente: {selectedRecord.location.environment}
                    </p>
                  </div>

                  {/* Notas */}
                  {selectedRecord.notes && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Notas</h3>
                      <p className="text-gray-700">{selectedRecord.notes}</p>
                    </div>
                  )}
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
                <Heart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron registros
              </h3>
              <p className="text-gray-600 mb-6">
                No hay registros de apareamiento que coincidan con los filtros aplicados.
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
                <span>Crear Primer Apareamiento</span>
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default MatingRecords;