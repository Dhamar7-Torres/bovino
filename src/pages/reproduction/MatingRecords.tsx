// MatingRecords.tsx
// Página para gestión de registros de apareamiento del ganado bovino
import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Calendar,
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
  X,
  ChevronDown,
  ChevronUp,
  Heart,
  TrendingUp,
  Award,
  Target,
  Crown,
  Baby,
  Flower2,
  Thermometer,
  ClipboardList,
  Timer,
  TestTube,
  Syringe,
} from "lucide-react";

// Tipos e interfaces para registros de apareamiento
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
    paddock: string;
    environment: "field" | "barn" | "breeding_facility";
  };
  matingType: "natural" | "artificial_insemination" | "embryo_transfer" | "synchronized";
  method: "cervical" | "intrauterine" | "laparoscopic" | "direct";
  estrusDetection: {
    detected: boolean;
    detectionDate?: string;
    detectionTime?: string;
    intensity: "weak" | "moderate" | "strong";
    signs: string[];
    detectedBy: string;
  };
  semenInformation?: {
    batch: string;
    provider: string;
    quality: "excellent" | "good" | "fair";
    motility: number; // percentage
    concentration: number; // millions per ml
    storageCondition: string;
    thawingTime?: string;
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
      duration: number; // minutes
      difficulty: "easy" | "moderate" | "difficult";
      equipment: string[];
    };
    animalCondition: {
      bullCondition?: "excellent" | "good" | "fair" | "poor";
      cowCondition: "excellent" | "good" | "fair" | "poor";
      cowReceptivity: "very_receptive" | "receptive" | "reluctant" | "resistant";
      stressLevel: "low" | "moderate" | "high";
    };
  };
  followUp: {
    pregnancyTestScheduled: boolean;
    pregnancyTestDate?: string;
    pregnancyTestMethod?: "palpation" | "ultrasound" | "blood_test";
    pregnancyResult?: "pregnant" | "not_pregnant" | "questionable";
    pregnancyConfirmDate?: string;
    expectedCalvingDate?: string;
    repeatBreeding?: {
      scheduled: boolean;
      nextDate?: string;
      reason: string;
    };
  };
  economicData: {
    procedureCost: number;
    semenCost: number;
    laborCost: number;
    equipmentCost: number;
    totalCost: number;
    expectedROI: number;
  };
  weatherConditions: {
    temperature: number; // celsius
    humidity: number; // percentage
    weather: "sunny" | "cloudy" | "rainy" | "windy";
    conditions: "optimal" | "acceptable" | "poor";
  };
  complications: string[];
  successProbability: number; // percentage based on historical data
  notes: string;
  photos: string[];
  documents: string[];
  status: "completed" | "pending_result" | "successful" | "failed" | "cancelled";
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
  pregnancyResult: string[];
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
  const [, setSelectedRecord] = useState<MatingRecord | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar">("grid");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Estados para filtros
  const [filters, setFilters] = useState<MatingFilters>({
    dateRange: {
      start: "",
      end: "",
    },
    matingType: [],
    status: [],
    pregnancyResult: [],
    bullId: "",
    cowId: "",
    assistedBy: [],
    location: [],
    searchTerm: "",
  });

  // Datos de ejemplo para desarrollo
  const mockRecords: MatingRecord[] = [
    {
      id: "mating-001",
      bullId: "bull-001",
      bullName: "Campeón Imperial",
      bullEarTag: "BULL-001",
      cowId: "cow-001",
      cowName: "Bella Esperanza",
      cowEarTag: "MX-001",
      matingDate: "2025-01-15",
      matingTime: "08:30",
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Potrero Norte, Rancho San José",
        paddock: "PN-01",
        environment: "field",
      },
      matingType: "artificial_insemination",
      method: "cervical",
      estrusDetection: {
        detected: true,
        detectionDate: "2025-01-14",
        detectionTime: "16:00",
        intensity: "strong",
        signs: ["mounting", "mucus_discharge", "restlessness", "decreased_appetite"],
        detectedBy: "Juan Pérez - Vaquero",
      },
      semenInformation: {
        batch: "SEM-2025-001",
        provider: "Genética Superior SA",
        quality: "excellent",
        motility: 85,
        concentration: 50,
        storageCondition: "Nitrógeno líquido -196°C",
        thawingTime: "30 segundos a 37°C",
      },
      technicalDetails: {
        assistedBy: {
          id: "vet-001",
          name: "Dr. García Mendoza",
          role: "veterinarian",
          certification: "Certificado en IA Bovina",
        },
        procedure: {
          startTime: "08:30",
          endTime: "08:45",
          duration: 15,
          difficulty: "easy",
          equipment: ["pistola IA", "catéter", "guantes", "lubricante"],
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
        pregnancyTestDate: "2025-02-15",
        pregnancyTestMethod: "ultrasound",
        pregnancyResult: "pregnant",
        pregnancyConfirmDate: "2025-02-15",
        expectedCalvingDate: "2025-10-15",
      },
      economicData: {
        procedureCost: 800,
        semenCost: 1200,
        laborCost: 500,
        equipmentCost: 200,
        totalCost: 2700,
        expectedROI: 25000,
      },
      weatherConditions: {
        temperature: 22,
        humidity: 65,
        weather: "sunny",
        conditions: "optimal",
      },
      complications: [],
      successProbability: 85,
      notes: "Inseminación exitosa, vaca muy receptiva, condiciones óptimas",
      photos: [],
      documents: [],
      status: "successful",
      createdAt: "2025-01-15T08:30:00Z",
      updatedAt: "2025-02-15T10:00:00Z",
    },
    {
      id: "mating-002",
      bullId: "bull-002",
      bullName: "Tornado Negro",
      bullEarTag: "BULL-002",
      cowId: "cow-002",
      cowName: "Luna Plateada",
      cowEarTag: "MX-002",
      matingDate: "2025-01-12",
      matingTime: "14:15",
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Establo Principal, Rancho San José",
        paddock: "EP-01",
        environment: "barn",
      },
      matingType: "natural",
      method: "direct",
      estrusDetection: {
        detected: true,
        detectionDate: "2025-01-11",
        detectionTime: "18:30",
        intensity: "moderate",
        signs: ["mounting", "restlessness", "increased_vocalization"],
        detectedBy: "Carlos López - Vaquero",
      },
      technicalDetails: {
        assistedBy: {
          id: "staff-001",
          name: "Carlos López",
          role: "staff",
        },
        procedure: {
          startTime: "14:15",
          endTime: "14:25",
          duration: 10,
          difficulty: "easy",
          equipment: ["halter", "rope"],
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
        pregnancyTestDate: "2025-02-12",
        pregnancyTestMethod: "palpation",
        pregnancyResult: "questionable",
      },
      economicData: {
        procedureCost: 200,
        semenCost: 0,
        laborCost: 300,
        equipmentCost: 50,
        totalCost: 550,
        expectedROI: 22000,
      },
      weatherConditions: {
        temperature: 24,
        humidity: 70,
        weather: "cloudy",
        conditions: "acceptable",
      },
      complications: [],
      successProbability: 75,
      notes: "Monta natural supervisada, ambos animales cooperativos",
      photos: [],
      documents: [],
      status: "pending_result",
      createdAt: "2025-01-12T14:15:00Z",
      updatedAt: "2025-01-12T14:25:00Z",
    },
    {
      id: "mating-003",
      bullId: "bull-001",
      bullName: "Campeón Imperial",
      bullEarTag: "BULL-001",
      cowId: "cow-003",
      cowName: "Estrella Dorada",
      cowEarTag: "MX-003",
      matingDate: "2025-01-10",
      matingTime: "10:00",
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Centro de Reproducción, Rancho San José",
        paddock: "CR-01",
        environment: "breeding_facility",
      },
      matingType: "synchronized",
      method: "intrauterine",
      estrusDetection: {
        detected: true,
        detectionDate: "2025-01-09",
        detectionTime: "12:00",
        intensity: "strong",
        signs: ["synchronized_estrus", "mucus_discharge", "mounting"],
        detectedBy: "Dr. García Mendoza",
      },
      semenInformation: {
        batch: "SEM-2025-002",
        provider: "ABS Global",
        quality: "excellent",
        motility: 90,
        concentration: 55,
        storageCondition: "Nitrógeno líquido -196°C",
        thawingTime: "35 segundos a 37°C",
      },
      technicalDetails: {
        assistedBy: {
          id: "vet-001",
          name: "Dr. García Mendoza",
          role: "veterinarian",
          certification: "Especialista en Reproducción Bovina",
        },
        procedure: {
          startTime: "10:00",
          endTime: "10:20",
          duration: 20,
          difficulty: "moderate",
          equipment: ["pistola IA", "catéter intrauterino", "ecógrafo", "guantes"],
        },
        animalCondition: {
          cowCondition: "excellent",
          cowReceptivity: "very_receptive",
          stressLevel: "low",
        },
      },
      followUp: {
        pregnancyTestScheduled: true,
        pregnancyTestDate: "2025-02-10",
        pregnancyTestMethod: "ultrasound",
        pregnancyResult: "not_pregnant",
        pregnancyConfirmDate: "2025-02-10",
        repeatBreeding: {
          scheduled: true,
          nextDate: "2025-02-25",
          reason: "No se confirmó embarazo en primer intento",
        },
      },
      economicData: {
        procedureCost: 1200,
        semenCost: 1500,
        laborCost: 800,
        equipmentCost: 300,
        totalCost: 3800,
        expectedROI: 28000,
      },
      weatherConditions: {
        temperature: 20,
        humidity: 60,
        weather: "sunny",
        conditions: "optimal",
      },
      complications: ["cervix_dilation_difficulty"],
      successProbability: 80,
      notes: "Procedimiento de sincronización exitoso, requiere segundo intento",
      photos: [],
      documents: [],
      status: "failed",
      createdAt: "2025-01-10T10:00:00Z",
      updatedAt: "2025-02-10T14:00:00Z",
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
          record.bullName.toLowerCase().includes(searchLower) ||
          record.bullEarTag.toLowerCase().includes(searchLower) ||
          record.cowName.toLowerCase().includes(searchLower) ||
          record.cowEarTag.toLowerCase().includes(searchLower) ||
          record.technicalDetails.assistedBy.name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por rango de fechas
    if (filters.dateRange.start) {
      filtered = filtered.filter(record => record.matingDate >= filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(record => record.matingDate <= filters.dateRange.end);
    }

    // Filtro por tipo de apareamiento
    if (filters.matingType.length > 0) {
      filtered = filtered.filter(record => filters.matingType.includes(record.matingType));
    }

    // Filtro por estado
    if (filters.status.length > 0) {
      filtered = filtered.filter(record => filters.status.includes(record.status));
    }

    // Filtro por resultado de embarazo
    if (filters.pregnancyResult.length > 0) {
      filtered = filtered.filter(record => 
        record.followUp.pregnancyResult && 
        filters.pregnancyResult.includes(record.followUp.pregnancyResult)
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

    setFilteredRecords(filtered);
  };

  // Función para obtener estadísticas
  const statistics = useMemo(() => {
    const total = records.length;
    const completed = records.filter(r => r.status === "completed").length;
    const successful = records.filter(r => r.status === "successful").length;
    const failed = records.filter(r => r.status === "failed").length;
    const pending = records.filter(r => r.status === "pending_result").length;
    const pregnant = records.filter(r => r.followUp.pregnancyResult === "pregnant").length;
    const notPregnant = records.filter(r => r.followUp.pregnancyResult === "not_pregnant").length;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;
    const pregnancyRate = (pregnant + notPregnant) > 0 ? Math.round((pregnant / (pregnant + notPregnant)) * 100) : 0;
    const avgCost = total > 0 ? Math.round(records.reduce((sum, r) => sum + r.economicData.totalCost, 0) / total) : 0;
    const totalCost = records.reduce((sum, r) => sum + r.economicData.totalCost, 0);
    const expectedROI = records.reduce((sum, r) => sum + r.economicData.expectedROI, 0);
    
    // Estadísticas por tipo
    const artificial = records.filter(r => r.matingType === "artificial_insemination").length;
    const natural = records.filter(r => r.matingType === "natural").length;
    const synchronized = records.filter(r => r.matingType === "synchronized").length;
    const embryo = records.filter(r => r.matingType === "embryo_transfer").length;

    return {
      total,
      completed,
      successful,
      failed,
      pending,
      pregnant,
      notPregnant,
      successRate,
      pregnancyRate,
      avgCost,
      totalCost,
      expectedROI,
      artificial,
      natural,
      synchronized,
      embryo,
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

  // Función para obtener el ícono de tipo de apareamiento
  const getMatingTypeIcon = (type: string) => {
    switch (type) {
      case "natural":
        return <Heart className="w-5 h-5 text-red-600" />;
      case "artificial_insemination":
        return <Syringe className="w-5 h-5 text-blue-600" />;
      case "embryo_transfer":
        return <TestTube className="w-5 h-5 text-purple-600" />;
      case "synchronized":
        return <Timer className="w-5 h-5 text-orange-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  // Función para obtener el color de tipo de apareamiento
  const getMatingTypeColor = (type: string) => {
    switch (type) {
      case "natural":
        return "bg-red-100 text-red-800 border-red-200";
      case "artificial_insemination":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "embryo_transfer":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "synchronized":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para obtener el color de estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "successful":
        return "bg-green-100 text-green-800 border-green-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "pending_result":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para obtener el ícono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "successful":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "completed":
        return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case "pending_result":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-600" />;
      case "cancelled":
        return <X className="w-4 h-4 text-gray-600" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-gray-600" />;
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

            {/* Filtro por tipo de apareamiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de apareamiento
              </label>
              <select
                multiple
                value={filters.matingType}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    matingType: Array.from(e.target.selectedOptions, option => option.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="natural">Natural</option>
                <option value="artificial_insemination">Inseminación Artificial</option>
                <option value="embryo_transfer">Transferencia de Embriones</option>
                <option value="synchronized">Sincronizado</option>
              </select>
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
                <option value="successful">Exitoso</option>
                <option value="completed">Completado</option>
                <option value="pending_result">Pendiente</option>
                <option value="failed">Fallido</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>
          </div>

          {/* Botones de acción de filtros */}
          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={() =>
                setFilters({
                  dateRange: { start: "", end: "" },
                  matingType: [],
                  status: [],
                  pregnancyResult: [],
                  bullId: "",
                  cowId: "",
                  assistedBy: [],
                  location: [],
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
  const RecordCard: React.FC<{ record: MatingRecord }> = ({ record }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-300"
    >
      {/* Header de la tarjeta */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <Crown className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-gray-900">{record.bullName}</span>
            <X className="w-4 h-4 text-gray-400" />
            <Flower2 className="w-5 h-5 text-pink-600" />
            <span className="font-medium text-gray-900">{record.cowName}</span>
          </div>
          <p className="text-sm text-gray-600">
            {record.bullEarTag} × {record.cowEarTag}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMatingTypeColor(record.matingType)}`}>
            {getMatingTypeIcon(record.matingType)}
            <span className="ml-1">
              {record.matingType === "natural" ? "Natural" :
               record.matingType === "artificial_insemination" ? "IA" :
               record.matingType === "embryo_transfer" ? "TE" : "Sincronizado"}
            </span>
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
            {getStatusIcon(record.status)}
            <span className="ml-1">
              {record.status === "successful" ? "Exitoso" :
               record.status === "completed" ? "Completado" :
               record.status === "pending_result" ? "Pendiente" :
               record.status === "failed" ? "Fallido" : "Cancelado"}
            </span>
          </span>
        </div>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Fecha</p>
          <p className="font-medium">{formatDate(record.matingDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Hora</p>
          <p className="font-medium">{record.matingTime}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Método</p>
          <p className="font-medium capitalize">{record.method}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Ubicación</p>
          <p className="font-medium">{record.location.paddock}</p>
        </div>
      </div>

      {/* Detección de estro */}
      <div className="bg-orange-50 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Eye className="w-4 h-4 mr-1 text-orange-600" />
          Detección de Estro
        </p>
        <div className="text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Detectado:</span>
            <span className={`font-medium ${record.estrusDetection.detected ? 'text-green-600' : 'text-red-600'}`}>
              {record.estrusDetection.detected ? 'Sí' : 'No'}
            </span>
          </div>
          {record.estrusDetection.detected && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Intensidad:</span>
                <span className="font-medium capitalize">{record.estrusDetection.intensity}</span>
              </div>
              <div className="mt-1">
                <span className="text-gray-600">Signos:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {record.estrusDetection.signs.slice(0, 3).map((sign, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                    >
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
            </>
          )}
        </div>
      </div>

      {/* Información del semen (si aplica) */}
      {record.semenInformation && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <TestTube className="w-4 h-4 mr-1 text-blue-600" />
            Información del Semen
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Lote:</span>
              <span className="ml-1 font-medium">{record.semenInformation.batch}</span>
            </div>
            <div>
              <span className="text-gray-600">Calidad:</span>
              <span className="ml-1 font-medium capitalize">{record.semenInformation.quality}</span>
            </div>
            <div>
              <span className="text-gray-600">Motilidad:</span>
              <span className="ml-1 font-medium">{record.semenInformation.motility}%</span>
            </div>
            <div>
              <span className="text-gray-600">Concentración:</span>
              <span className="ml-1 font-medium">{record.semenInformation.concentration}M/ml</span>
            </div>
          </div>
        </div>
      )}

      {/* Seguimiento y resultado */}
      <div className="bg-purple-50 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <ClipboardList className="w-4 h-4 mr-1 text-purple-600" />
          Seguimiento
        </p>
        <div className="text-sm">
          {record.followUp.pregnancyResult && (
            <div className="flex items-center justify-between mb-1">
              <span className="text-gray-600">Resultado:</span>
              <span className={`font-medium px-2 py-1 rounded-full text-xs ${
                record.followUp.pregnancyResult === "pregnant" ? 'bg-green-100 text-green-800' :
                record.followUp.pregnancyResult === "not_pregnant" ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {record.followUp.pregnancyResult === "pregnant" ? "Embarazada" :
                 record.followUp.pregnancyResult === "not_pregnant" ? "No embarazada" : "Dudoso"}
              </span>
            </div>
          )}
          {record.followUp.pregnancyTestDate && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Prueba:</span>
              <span className="font-medium">{formatDate(record.followUp.pregnancyTestDate)}</span>
            </div>
          )}
          {record.followUp.expectedCalvingDate && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Parto esperado:</span>
              <span className="font-medium">{formatDate(record.followUp.expectedCalvingDate)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Información económica */}
      <div className="bg-green-50 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <TrendingUp className="w-4 h-4 mr-1 text-green-600" />
          Información Económica
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Costo total:</span>
            <span className="ml-1 font-medium">{formatCurrency(record.economicData.totalCost)}</span>
          </div>
          <div>
            <span className="text-gray-600">ROI esperado:</span>
            <span className="ml-1 font-medium">{formatCurrency(record.economicData.expectedROI)}</span>
          </div>
        </div>
      </div>

      {/* Condiciones ambientales */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Thermometer className="w-4 h-4 mr-1 text-gray-600" />
          Condiciones Ambientales
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Temperatura:</span>
            <span className="ml-1 font-medium">{record.weatherConditions.temperature}°C</span>
          </div>
          <div>
            <span className="text-gray-600">Humedad:</span>
            <span className="ml-1 font-medium">{record.weatherConditions.humidity}%</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Condiciones:</span>
            <span className={`ml-1 font-medium ${
              record.weatherConditions.conditions === "optimal" ? 'text-green-600' :
              record.weatherConditions.conditions === "acceptable" ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {record.weatherConditions.conditions === "optimal" ? "Óptimas" :
               record.weatherConditions.conditions === "acceptable" ? "Aceptables" : "Pobres"}
            </span>
          </div>
        </div>
      </div>

      {/* Probabilidad de éxito */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Probabilidad de éxito:</span>
          <span className="text-sm font-medium">{record.successProbability}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              record.successProbability >= 80 ? 'bg-green-500' :
              record.successProbability >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${record.successProbability}%` }}
          ></div>
        </div>
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
          onClick={() => alert("Funcionalidad en desarrollo")}
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
                Registros de Apareamiento
              </h1>
              <p className="text-white/90 text-lg">
                Gestión integral de apareamientos y seguimiento reproductivo
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => alert("Funcionalidad en desarrollo")}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Apareamiento
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20">
                <Download className="w-5 h-5 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Apareamientos"
            value={statistics.total}
            icon={<Heart className="w-8 h-8" />}
            color="hover:bg-red-50"
          />
          <StatCard
            title="Exitosos"
            value={statistics.successful}
            icon={<CheckCircle className="w-8 h-8" />}
            color="hover:bg-green-50"
          />
          <StatCard
            title="Tasa de Éxito"
            value={`${statistics.successRate}%`}
            icon={<Target className="w-8 h-8" />}
            color="hover:bg-blue-50"
          />
          <StatCard
            title="Tasa de Preñez"
            value={`${statistics.pregnancyRate}%`}
            icon={<Baby className="w-8 h-8" />}
            color="hover:bg-purple-50"
          />
          <StatCard
            title="Costo Promedio"
            value={formatCurrency(statistics.avgCost)}
            icon={<TrendingUp className="w-8 h-8" />}
            color="hover:bg-yellow-50"
          />
          <StatCard
            title="ROI Esperado"
            value={formatCurrency(statistics.expectedROI)}
            icon={<Award className="w-8 h-8" />}
            color="hover:bg-indigo-50"
          />
        </motion.div>

        {/* Estadísticas por tipo */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Natural"
            value={statistics.natural}
            icon={<Heart className="w-8 h-8" />}
            color="hover:bg-red-50"
          />
          <StatCard
            title="Inseminación Artificial"
            value={statistics.artificial}
            icon={<Syringe className="w-8 h-8" />}
            color="hover:bg-blue-50"
          />
          <StatCard
            title="Sincronizado"
            value={statistics.synchronized}
            icon={<Timer className="w-8 h-8" />}
            color="hover:bg-orange-50"
          />
          <StatCard
            title="Transferencia Embriones"
            value={statistics.embryo}
            icon={<TestTube className="w-8 h-8" />}
            color="hover:bg-purple-50"
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
                placeholder="Buscar por toro, vaca, técnico..."
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
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "calendar" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  }`}
                >
                  <Calendar className="w-4 h-4" />
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
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron registros
              </h3>
              <p className="text-gray-600 mb-6">
                No hay registros de apareamiento que coincidan con los filtros aplicados.
              </p>
              <button
                onClick={() => alert("Funcionalidad en desarrollo")}
                className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Crear primer registro
              </button>
            </div>
          ) : (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : viewMode === "list"
              ? "space-y-4"
              : "bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
            }>
              {viewMode === "calendar" ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Vista de Calendario
                  </h3>
                  <p className="text-gray-600">
                    Funcionalidad de calendario en desarrollo
                  </p>
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <RecordCard key={record.id} record={record} />
                ))
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default MatingRecords;