// BirthRecords.tsx
// Página para gestión de registros de nacimientos del ganado bovino
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
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Baby,
  Heart,
  Scale,
  TrendingUp,
  AlertCircle,
  Stethoscope,
  UserCheck,
} from "lucide-react";

// Tipos e interfaces para registros de nacimientos
interface BirthRecord {
  id: string;
  motherId: string;
  motherName: string;
  motherEarTag: string;
  fatherId?: string;
  fatherName?: string;
  calfId: string;
  calfName: string;
  calfEarTag: string;
  birthDate: string;
  birthTime: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  birthType: "natural" | "assisted" | "cesarean" | "emergency";
  gender: "male" | "female";
  birthWeight: number; // kg
  currentWeight?: number; // kg
  healthStatus: "excellent" | "good" | "fair" | "poor" | "critical";
  complications: string[];
  assistedBy: {
    id: string;
    name: string;
    role: "veterinarian" | "technician" | "owner" | "staff";
  };
  deliveryDuration: number; // minutes
  placentaExpelled: boolean;
  placentaExpelledTime?: string;
  colostrum: {
    received: boolean;
    timeReceived?: string;
    source: "mother" | "substitute" | "frozen";
  };
  identification: {
    earTagApplied: boolean;
    earTagNumber?: string;
    tattoo?: string;
    microchip?: string;
  };
  vaccinations: {
    date: string;
    vaccine: string;
    batch: string;
  }[];
  notes: string;
  photos: string[];
  cost: number;
  expectedDueDate?: string;
  gestationPeriod: number; // days
  previousCalves: number;
  createdAt: string;
  updatedAt: string;
}

interface BirthFilters {
  dateRange: {
    start: string;
    end: string;
  };
  birthType: string[];
  gender: string[];
  healthStatus: string[];
  assistedBy: string[];
  searchTerm: string;
  weightRange: {
    min: number;
    max: number;
  };
}

// Componente principal de Registros de Nacimientos
const BirthRecords: React.FC = () => {
  // Estados principales
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BirthRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, setShowForm] = useState<boolean>(false);
  const [, setSelectedRecord] = useState<BirthRecord | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Estados para filtros
  const [filters, setFilters] = useState<BirthFilters>({
    dateRange: {
      start: "",
      end: "",
    },
    birthType: [],
    gender: [],
    healthStatus: [],
    assistedBy: [],
    searchTerm: "",
    weightRange: {
      min: 0,
      max: 100,
    },
  });

  // Estados para formulario
  const [] = useState<boolean>(false);
  const [, setFormData] = useState<Partial<BirthRecord>>({});

  // Datos de ejemplo para desarrollo
  const mockRecords: BirthRecord[] = [
    {
      id: "birth-001",
      motherId: "cow-123",
      motherName: "Bella",
      motherEarTag: "MX-001",
      fatherId: "bull-456",
      fatherName: "Campeón",
      calfId: "calf-001",
      calfName: "Estrella",
      calfEarTag: "MX-101",
      birthDate: "2025-01-15",
      birthTime: "14:30",
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Potrero Norte, Rancho San José, Tuxtla Gutiérrez, Chiapas",
      },
      birthType: "natural",
      gender: "female",
      birthWeight: 32.5,
      currentWeight: 35.2,
      healthStatus: "excellent",
      complications: [],
      assistedBy: {
        id: "vet-001",
        name: "Dr. García Mendoza",
        role: "veterinarian",
      },
      deliveryDuration: 45,
      placentaExpelled: true,
      placentaExpelledTime: "15:15",
      colostrum: {
        received: true,
        timeReceived: "14:45",
        source: "mother",
      },
      identification: {
        earTagApplied: true,
        earTagNumber: "MX-101",
        tattoo: "E01",
      },
      vaccinations: [
        {
          date: "2025-01-15",
          vaccine: "Vitamina A",
          batch: "VAC-2025-001",
        },
      ],
      notes: "Parto sin complicaciones, ternera saludable y activa",
      photos: [],
      cost: 2500,
      expectedDueDate: "2025-01-12",
      gestationPeriod: 283,
      previousCalves: 2,
      createdAt: "2025-01-15T14:30:00Z",
      updatedAt: "2025-01-15T14:30:00Z",
    },
    {
      id: "birth-002",
      motherId: "cow-124",
      motherName: "Luna",
      motherEarTag: "MX-002",
      calfId: "calf-002",
      calfName: "Rayo",
      calfEarTag: "MX-102",
      birthDate: "2025-01-16",
      birthTime: "08:15",
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Potrero Sur, Rancho San José, Tuxtla Gutiérrez, Chiapas",
      },
      birthType: "assisted",
      gender: "male",
      birthWeight: 38.7,
      currentWeight: 42.1,
      healthStatus: "good",
      complications: ["distocia menor"],
      assistedBy: {
        id: "tech-001",
        name: "MVZ. Rodríguez López",
        role: "technician",
      },
      deliveryDuration: 85,
      placentaExpelled: true,
      placentaExpelledTime: "09:30",
      colostrum: {
        received: true,
        timeReceived: "08:30",
        source: "mother",
      },
      identification: {
        earTagApplied: true,
        earTagNumber: "MX-102",
        microchip: "982000123456789",
      },
      vaccinations: [
        {
          date: "2025-01-16",
          vaccine: "Vitamina A + E",
          batch: "VAC-2025-002",
        },
      ],
      notes: "Parto asistido debido a tamaño del ternero, madre y cría en buen estado",
      photos: [],
      cost: 3200,
      expectedDueDate: "2025-01-14",
      gestationPeriod: 285,
      previousCalves: 0,
      createdAt: "2025-01-16T08:15:00Z",
      updatedAt: "2025-01-16T08:15:00Z",
    },
    {
      id: "birth-003",
      motherId: "cow-125",
      motherName: "Paloma",
      motherEarTag: "MX-003",
      calfId: "calf-003",
      calfName: "Trueno",
      calfEarTag: "MX-103",
      birthDate: "2025-01-17",
      birthTime: "22:45",
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Establo Principal, Rancho San José, Tuxtla Gutiérrez, Chiapas",
      },
      birthType: "cesarean",
      gender: "male",
      birthWeight: 45.2,
      currentWeight: 47.8,
      healthStatus: "fair",
      complications: ["distocia severa", "posición anormal"],
      assistedBy: {
        id: "vet-002",
        name: "Dr. Martínez Silva",
        role: "veterinarian",
      },
      deliveryDuration: 180,
      placentaExpelled: false,
      colostrum: {
        received: true,
        timeReceived: "23:30",
        source: "substitute",
      },
      identification: {
        earTagApplied: true,
        earTagNumber: "MX-103",
        tattoo: "T03",
        microchip: "982000123456790",
      },
      vaccinations: [
        {
          date: "2025-01-18",
          vaccine: "Antibiótico preventivo",
          batch: "VAC-2025-003",
        },
      ],
      notes: "Cesárea de emergencia, ternero grande, seguimiento estrecho requerido",
      photos: [],
      cost: 8500,
      expectedDueDate: "2025-01-15",
      gestationPeriod: 287,
      previousCalves: 3,
      createdAt: "2025-01-17T22:45:00Z",
      updatedAt: "2025-01-17T22:45:00Z",
    },
  ];

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1200));
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
          record.motherName.toLowerCase().includes(searchLower) ||
          record.motherEarTag.toLowerCase().includes(searchLower) ||
          record.calfName.toLowerCase().includes(searchLower) ||
          record.calfEarTag.toLowerCase().includes(searchLower) ||
          record.assistedBy.name.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por rango de fechas
    if (filters.dateRange.start) {
      filtered = filtered.filter(record => record.birthDate >= filters.dateRange.start);
    }
    if (filters.dateRange.end) {
      filtered = filtered.filter(record => record.birthDate <= filters.dateRange.end);
    }

    // Filtro por tipo de parto
    if (filters.birthType.length > 0) {
      filtered = filtered.filter(record => filters.birthType.includes(record.birthType));
    }

    // Filtro por género
    if (filters.gender.length > 0) {
      filtered = filtered.filter(record => filters.gender.includes(record.gender));
    }

    // Filtro por estado de salud
    if (filters.healthStatus.length > 0) {
      filtered = filtered.filter(record => filters.healthStatus.includes(record.healthStatus));
    }

    // Filtro por rango de peso
    if (filters.weightRange.min > 0 || filters.weightRange.max < 100) {
      filtered = filtered.filter(record => 
        record.birthWeight >= filters.weightRange.min && 
        record.birthWeight <= filters.weightRange.max
      );
    }

    setFilteredRecords(filtered);
  };

  // Función para obtener estadísticas
  const statistics = useMemo(() => {
    const total = records.length;
    const males = records.filter(r => r.gender === "male").length;
    const females = records.filter(r => r.gender === "female").length;
    const natural = records.filter(r => r.birthType === "natural").length;
    const assisted = records.filter(r => r.birthType === "assisted").length;
    const cesarean = records.filter(r => r.birthType === "cesarean").length;
    const avgWeight = total > 0 ? 
      Math.round((records.reduce((sum, r) => sum + r.birthWeight, 0) / total) * 10) / 10 : 0;
    const healthy = records.filter(r => r.healthStatus === "excellent" || r.healthStatus === "good").length;
    const healthRate = total > 0 ? Math.round((healthy / total) * 100) : 0;
    const totalCost = records.reduce((sum, r) => sum + r.cost, 0);

    return {
      total,
      males,
      females,
      malePercentage: total > 0 ? Math.round((males / total) * 100) : 0,
      femalePercentage: total > 0 ? Math.round((females / total) * 100) : 0,
      natural,
      assisted,
      cesarean,
      avgWeight,
      healthy,
      healthRate,
      totalCost,
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

  // Función para obtener el ícono de tipo de parto
  const getBirthTypeIcon = (type: string) => {
    switch (type) {
      case "natural":
        return <Heart className="w-5 h-5 text-green-600" />;
      case "assisted":
        return <UserCheck className="w-5 h-5 text-blue-600" />;
      case "cesarean":
        return <Stethoscope className="w-5 h-5 text-orange-600" />;
      case "emergency":
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Baby className="w-5 h-5 text-gray-600" />;
    }
  };

  // Función para obtener el color de tipo de parto
  const getBirthTypeColor = (type: string) => {
    switch (type) {
      case "natural":
        return "bg-green-100 text-green-800 border-green-200";
      case "assisted":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cesarean":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "emergency":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para obtener el color de estado de salud
  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "good":
        return "bg-green-100 text-green-800 border-green-200";
      case "fair":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "poor":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para obtener el ícono de género
  const getGenderIcon = (gender: string) => {
    return gender === "male" ? "♂" : "♀";
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

  // Función para calcular edad en días
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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

            {/* Filtro por tipo de parto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de parto
              </label>
              <select
                multiple
                value={filters.birthType}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    birthType: Array.from(e.target.selectedOptions, option => option.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="natural">Natural</option>
                <option value="assisted">Asistido</option>
                <option value="cesarean">Cesárea</option>
                <option value="emergency">Emergencia</option>
              </select>
            </div>

            {/* Filtro por género */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género
              </label>
              <select
                multiple
                value={filters.gender}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    gender: Array.from(e.target.selectedOptions, option => option.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="male">Macho</option>
                <option value="female">Hembra</option>
              </select>
            </div>

            {/* Filtro por peso */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rango de peso al nacer (kg)
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Mín"
                  value={filters.weightRange.min || ""}
                  onChange={(e) =>
                    setFilters(prev => ({
                      ...prev,
                      weightRange: { ...prev.weightRange, min: Number(e.target.value) || 0 },
                    }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                />
                <input
                  type="number"
                  placeholder="Máx"
                  value={filters.weightRange.max === 100 ? "" : filters.weightRange.max}
                  onChange={(e) =>
                    setFilters(prev => ({
                      ...prev,
                      weightRange: { ...prev.weightRange, max: Number(e.target.value) || 100 },
                    }))
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por estado de salud */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de salud
              </label>
              <select
                multiple
                value={filters.healthStatus}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    healthStatus: Array.from(e.target.selectedOptions, option => option.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="excellent">Excelente</option>
                <option value="good">Bueno</option>
                <option value="fair">Regular</option>
                <option value="poor">Malo</option>
                <option value="critical">Crítico</option>
              </select>
            </div>
          </div>

          {/* Botones de acción de filtros */}
          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={() =>
                setFilters({
                  dateRange: { start: "", end: "" },
                  birthType: [],
                  gender: [],
                  healthStatus: [],
                  assistedBy: [],
                  searchTerm: "",
                  weightRange: { min: 0, max: 100 },
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
  const RecordCard: React.FC<{ record: BirthRecord }> = ({ record }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-300"
    >
      {/* Header de la tarjeta */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{record.calfName}</h3>
            <span className="text-2xl font-bold text-blue-600">
              {getGenderIcon(record.gender)}
            </span>
          </div>
          <p className="text-sm text-gray-600">Arete: {record.calfEarTag}</p>
          <p className="text-sm text-gray-600">Madre: {record.motherName} ({record.motherEarTag})</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBirthTypeColor(record.birthType)}`}>
            {getBirthTypeIcon(record.birthType)}
            <span className="ml-1">
              {record.birthType === "natural" ? "Natural" :
               record.birthType === "assisted" ? "Asistido" :
               record.birthType === "cesarean" ? "Cesárea" : "Emergencia"}
            </span>
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getHealthStatusColor(record.healthStatus)}`}>
            <Heart className="w-3 h-3 mr-1" />
            {record.healthStatus === "excellent" ? "Excelente" :
             record.healthStatus === "good" ? "Bueno" :
             record.healthStatus === "fair" ? "Regular" :
             record.healthStatus === "poor" ? "Malo" : "Crítico"}
          </span>
        </div>
      </div>

      {/* Información principal */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Fecha de nacimiento</p>
          <p className="font-medium">{formatDate(record.birthDate)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Hora</p>
          <p className="font-medium">{record.birthTime}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Peso al nacer</p>
          <p className="font-medium flex items-center">
            <Scale className="w-4 h-4 mr-1 text-gray-500" />
            {record.birthWeight} kg
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Edad</p>
          <p className="font-medium">{calculateAge(record.birthDate)} días</p>
        </div>
      </div>

      {/* Información del parto */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Información del parto</p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Duración:</span>
            <span className="ml-1 font-medium">{record.deliveryDuration} min</span>
          </div>
          <div>
            <span className="text-gray-600">Asistido por:</span>
            <span className="ml-1 font-medium">{record.assistedBy.name}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Placenta expulsada:</span>
            <span className={`ml-1 font-medium ${record.placentaExpelled ? 'text-green-600' : 'text-red-600'}`}>
              {record.placentaExpelled ? 'Sí' : 'No'}
              {record.placentaExpelledTime && ` (${record.placentaExpelledTime})`}
            </span>
          </div>
        </div>
      </div>

      {/* Información del calostro */}
      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Calostro</p>
        <div className="text-sm">
          <div className="flex items-center">
            <span className="text-gray-600">Recibido:</span>
            <span className={`ml-1 font-medium ${record.colostrum.received ? 'text-green-600' : 'text-red-600'}`}>
              {record.colostrum.received ? 'Sí' : 'No'}
            </span>
          </div>
          {record.colostrum.received && (
            <>
              <div>
                <span className="text-gray-600">Hora:</span>
                <span className="ml-1 font-medium">{record.colostrum.timeReceived}</span>
              </div>
              <div>
                <span className="text-gray-600">Fuente:</span>
                <span className="ml-1 font-medium">
                  {record.colostrum.source === "mother" ? "Madre" :
                   record.colostrum.source === "substitute" ? "Sustituto" : "Congelado"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Complicaciones */}
      {record.complications.length > 0 && (
        <div className="bg-yellow-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1 text-yellow-600" />
            Complicaciones
          </p>
          <div className="flex flex-wrap gap-1">
            {record.complications.map((complication, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
              >
                {complication}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Costo */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">Costo total</p>
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
                Registros de Nacimientos
              </h1>
              <p className="text-white/90 text-lg">
                Gestión integral de nacimientos y seguimiento de crías
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Nacimiento
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
            title="Total de Nacimientos"
            value={statistics.total}
            icon={<Baby className="w-8 h-8" />}
            color="hover:bg-blue-50"
          />
          <StatCard
            title="Machos"
            value={`${statistics.males} (${statistics.malePercentage}%)`}
            icon={<span className="text-2xl">♂</span>}
            color="hover:bg-blue-50"
          />
          <StatCard
            title="Hembras"
            value={`${statistics.females} (${statistics.femalePercentage}%)`}
            icon={<span className="text-2xl">♀</span>}
            color="hover:bg-pink-50"
          />
          <StatCard
            title="Peso Promedio"
            value={`${statistics.avgWeight} kg`}
            icon={<Scale className="w-8 h-8" />}
            color="hover:bg-green-50"
          />
          <StatCard
            title="Tasa de Salud"
            value={`${statistics.healthRate}%`}
            icon={<Heart className="w-8 h-8" />}
            color="hover:bg-red-50"
            subtitle="Excelente/Bueno"
          />
          <StatCard
            title="Costo Total"
            value={formatCurrency(statistics.totalCost)}
            icon={<TrendingUp className="w-8 h-8" />}
            color="hover:bg-yellow-50"
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
                placeholder="Buscar por madre, cría, arete, técnico..."
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
              <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron registros
              </h3>
              <p className="text-gray-600 mb-6">
                No hay registros de nacimientos que coincidan con los filtros aplicados.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Registrar primer nacimiento
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

export default BirthRecords;