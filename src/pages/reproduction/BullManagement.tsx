// BullManagement.tsx
// Página para gestión integral de toros y tabla de empadre
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
  ChevronDown,
  ChevronUp,
  Users,
  Heart,
  Scale,
  TrendingUp,
  Award,
  Shield,
  Zap,
  Target,
  Crown,
  UserX,
  UserCheck,
} from "lucide-react";

// Tipos e interfaces para gestión de toros
interface Bull {
  id: string;
  name: string;
  earTag: string;
  registrationNumber?: string;
  breed: string;
  birthDate: string;
  weight: number;
  height?: number;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
    paddock: string;
  };
  healthStatus: "excellent" | "good" | "fair" | "poor" | "quarantine";
  reproductiveStatus: "active" | "resting" | "retired" | "testing";
  genetics: {
    sireId?: string;
    sireName?: string;
    damId?: string;
    damName?: string;
    genealogy: string[];
  };
  performance: {
    totalMating: number;
    successfulMating: number;
    offspring: number;
    pregnancyRate: number;
    lastMatingDate?: string;
  };
  health: {
    lastCheckupDate: string;
    veterinarian: string;
    vaccinations: {
      date: string;
      vaccine: string;
      batch: string;
      nextDue: string;
    }[];
    treatments: {
      date: string;
      condition: string;
      treatment: string;
      veterinarian: string;
    }[];
  };
  nutrition: {
    diet: string;
    dailyFeed: number; // kg
    supplements: string[];
    lastWeightDate: string;
  };
  acquisition: {
    date: string;
    source: string;
    cost: number;
    purpose: "breeding" | "genetic_improvement" | "replacement";
  };
  notes: string;
  photos: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface para registros de empadre
interface MatingRecord {
  id: string;
  bullId: string;
  bullName: string;
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
  };
  matingType: "natural" | "artificial" | "embryo_transfer";
  estrusDetected: boolean;
  estrusDate?: string;
  assistedBy: {
    id: string;
    name: string;
    role: string;
  };
  pregnancyTestDate?: string;
  pregnancyResult?: "pregnant" | "not_pregnant" | "pending";
  expectedBirthDate?: string;
  actualBirthDate?: string;
  offspring?: {
    id: string;
    name: string;
    gender: "male" | "female";
    alive: boolean;
  };
  complications: string[];
  notes: string;
  cost: number;
  success: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BullFilters {
  breed: string[];
  healthStatus: string[];
  reproductiveStatus: string[];
  ageRange: {
    min: number;
    max: number;
  };
  weightRange: {
    min: number;
    max: number;
  };
  location: string[];
  searchTerm: string;
  activeOnly: boolean;
}

interface MatingFilters {
  dateRange: {
    start: string;
    end: string;
  };
  matingType: string[];
  pregnancyResult: string[];
  bullId: string;
  searchTerm: string;
}

// Componente principal de Gestión de Toros
const BullManagement: React.FC = () => {
  // Estados principales
  const [bulls, setBulls] = useState<Bull[]>([]);
  const [matingRecords, setMatingRecords] = useState<MatingRecord[]>([]);
  const [filteredBulls, setFilteredBulls] = useState<Bull[]>([]);
  const [filteredMatingRecords, setFilteredMatingRecords] = useState<MatingRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"bulls" | "mating">("bulls");
  const [, setShowBullForm] = useState<boolean>(false);
  const [, setShowMatingForm] = useState<boolean>(false);
  const [, setSelectedBull] = useState<Bull | null>(null);
  const [, setSelectedMatingRecord] = useState<MatingRecord | null>(null);
  const [] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Estados para filtros
  const [bullFilters, setBullFilters] = useState<BullFilters>({
    breed: [],
    healthStatus: [],
    reproductiveStatus: [],
    ageRange: { min: 0, max: 20 },
    weightRange: { min: 0, max: 2000 },
    location: [],
    searchTerm: "",
    activeOnly: true,
  });

  const [matingFilters, setMatingFilters] = useState<MatingFilters>({
    dateRange: { start: "", end: "" },
    matingType: [],
    pregnancyResult: [],
    bullId: "",
    searchTerm: "",
  });

  // Estados para formulario
  const [] = useState<boolean>(false);
  const [, setBullFormData] = useState<Partial<Bull>>({});
  const [, setMatingFormData] = useState<Partial<MatingRecord>>({});

  // Datos de ejemplo para desarrollo
  const mockBulls: Bull[] = [
    {
      id: "bull-001",
      name: "Campeón Imperial",
      earTag: "BULL-001",
      registrationNumber: "MEX-2021-001",
      breed: "Holstein",
      birthDate: "2020-03-15",
      weight: 850,
      height: 145,
      currentLocation: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Potrero Norte, Rancho San José",
        paddock: "PN-01",
      },
      healthStatus: "excellent",
      reproductiveStatus: "active",
      genetics: {
        sireId: "bull-sire-001",
        sireName: "Holstein Premier",
        damId: "cow-dam-001",
        damName: "Bella Imperial",
        genealogy: ["Holstein Premier", "Bella Imperial", "Champion Line"],
      },
      performance: {
        totalMating: 45,
        successfulMating: 38,
        offspring: 32,
        pregnancyRate: 84.4,
        lastMatingDate: "2025-01-10",
      },
      health: {
        lastCheckupDate: "2025-01-01",
        veterinarian: "Dr. García Mendoza",
        vaccinations: [
          {
            date: "2024-12-01",
            vaccine: "IBR/BVD",
            batch: "VAC-2024-120",
            nextDue: "2025-06-01",
          },
        ],
        treatments: [],
      },
      nutrition: {
        diet: "Concentrado premium + pasto",
        dailyFeed: 25,
        supplements: ["Vitamina E", "Selenio", "Zinc"],
        lastWeightDate: "2025-01-01",
      },
      acquisition: {
        date: "2021-05-20",
        source: "Genética Superior SA",
        cost: 85000,
        purpose: "breeding",
      },
      notes: "Toro de alto rendimiento, excelente temperamento",
      photos: [],
      active: true,
      createdAt: "2021-05-20T10:00:00Z",
      updatedAt: "2025-01-17T15:30:00Z",
    },
    {
      id: "bull-002",
      name: "Tornado Negro",
      earTag: "BULL-002",
      registrationNumber: "MEX-2019-045",
      breed: "Angus",
      birthDate: "2019-08-10",
      weight: 920,
      height: 150,
      currentLocation: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Potrero Sur, Rancho San José",
        paddock: "PS-02",
      },
      healthStatus: "good",
      reproductiveStatus: "active",
      genetics: {
        sireId: "bull-sire-002",
        sireName: "Black Thunder",
        damId: "cow-dam-002",
        damName: "Midnight Beauty",
        genealogy: ["Black Thunder", "Midnight Beauty", "Premier Angus"],
      },
      performance: {
        totalMating: 62,
        successfulMating: 51,
        offspring: 47,
        pregnancyRate: 82.3,
        lastMatingDate: "2025-01-08",
      },
      health: {
        lastCheckupDate: "2024-12-15",
        veterinarian: "MVZ. Rodríguez López",
        vaccinations: [
          {
            date: "2024-11-15",
            vaccine: "Clostridiosis",
            batch: "VAC-2024-115",
            nextDue: "2025-05-15",
          },
        ],
        treatments: [
          {
            date: "2024-10-20",
            condition: "Cojera leve",
            treatment: "Antiinflamatorio",
            veterinarian: "MVZ. Rodríguez López",
          },
        ],
      },
      nutrition: {
        diet: "Pasto mejorado + suplemento mineral",
        dailyFeed: 22,
        supplements: ["Mineral premium", "Vitamina A"],
        lastWeightDate: "2024-12-15",
      },
      acquisition: {
        date: "2019-10-12",
        source: "Rancho La Esperanza",
        cost: 75000,
        purpose: "breeding",
      },
      notes: "Toro robusto, muy buena genética para carne",
      photos: [],
      active: true,
      createdAt: "2019-10-12T14:00:00Z",
      updatedAt: "2025-01-17T15:30:00Z",
    },
  ];

  const mockMatingRecords: MatingRecord[] = [
    {
      id: "mating-001",
      bullId: "bull-001",
      bullName: "Campeón Imperial",
      cowId: "cow-123",
      cowName: "Bella",
      cowEarTag: "MX-001",
      matingDate: "2025-01-10",
      matingTime: "08:30",
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Potrero Norte, Rancho San José",
        paddock: "PN-01",
      },
      matingType: "natural",
      estrusDetected: true,
      estrusDate: "2025-01-09",
      assistedBy: {
        id: "staff-001",
        name: "Juan Pérez",
        role: "Vaquero",
      },
      pregnancyTestDate: "2025-02-10",
      pregnancyResult: "pregnant",
      expectedBirthDate: "2025-10-10",
      complications: [],
      notes: "Monta natural exitosa, vaca receptiva",
      cost: 0,
      success: true,
      createdAt: "2025-01-10T08:30:00Z",
      updatedAt: "2025-01-10T08:30:00Z",
    },
    {
      id: "mating-002",
      bullId: "bull-002",
      bullName: "Tornado Negro",
      cowId: "cow-124",
      cowName: "Luna",
      cowEarTag: "MX-002",
      matingDate: "2025-01-08",
      matingTime: "14:15",
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Potrero Sur, Rancho San José",
        paddock: "PS-02",
      },
      matingType: "natural",
      estrusDetected: true,
      estrusDate: "2025-01-07",
      assistedBy: {
        id: "staff-002",
        name: "Carlos López",
        role: "Vaquero",
      },
      pregnancyTestDate: "2025-02-08",
      pregnancyResult: "pending",
      expectedBirthDate: "2025-10-08",
      complications: [],
      notes: "Segunda monta, monitorear desarrollo",
      cost: 0,
      success: false,
      createdAt: "2025-01-08T14:15:00Z",
      updatedAt: "2025-01-08T14:15:00Z",
    },
  ];

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1000));
        setBulls(mockBulls);
        setMatingRecords(mockMatingRecords);
        setFilteredBulls(mockBulls);
        setFilteredMatingRecords(mockMatingRecords);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Efecto para aplicar filtros de toros
  useEffect(() => {
    applyBullFilters();
  }, [bullFilters, bulls]);

  // Efecto para aplicar filtros de empadre
  useEffect(() => {
    applyMatingFilters();
  }, [matingFilters, matingRecords]);

  // Función para aplicar filtros de toros
  const applyBullFilters = () => {
    let filtered = [...bulls];

    // Filtro por término de búsqueda
    if (bullFilters.searchTerm) {
      const searchLower = bullFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        bull =>
          bull.name.toLowerCase().includes(searchLower) ||
          bull.earTag.toLowerCase().includes(searchLower) ||
          bull.breed.toLowerCase().includes(searchLower) ||
          bull.registrationNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por raza
    if (bullFilters.breed.length > 0) {
      filtered = filtered.filter(bull => bullFilters.breed.includes(bull.breed));
    }

    // Filtro por estado de salud
    if (bullFilters.healthStatus.length > 0) {
      filtered = filtered.filter(bull => bullFilters.healthStatus.includes(bull.healthStatus));
    }

    // Filtro por estado reproductivo
    if (bullFilters.reproductiveStatus.length > 0) {
      filtered = filtered.filter(bull => bullFilters.reproductiveStatus.includes(bull.reproductiveStatus));
    }

    // Filtro por solo activos
    if (bullFilters.activeOnly) {
      filtered = filtered.filter(bull => bull.active);
    }

    // Filtro por rango de edad
    const currentYear = new Date().getFullYear();
    if (bullFilters.ageRange.min > 0 || bullFilters.ageRange.max < 20) {
      filtered = filtered.filter(bull => {
        const birthYear = new Date(bull.birthDate).getFullYear();
        const age = currentYear - birthYear;
        return age >= bullFilters.ageRange.min && age <= bullFilters.ageRange.max;
      });
    }

    // Filtro por rango de peso
    if (bullFilters.weightRange.min > 0 || bullFilters.weightRange.max < 2000) {
      filtered = filtered.filter(bull => 
        bull.weight >= bullFilters.weightRange.min && 
        bull.weight <= bullFilters.weightRange.max
      );
    }

    setFilteredBulls(filtered);
  };

  // Función para aplicar filtros de empadre
  const applyMatingFilters = () => {
    let filtered = [...matingRecords];

    // Filtro por término de búsqueda
    if (matingFilters.searchTerm) {
      const searchLower = matingFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        record =>
          record.bullName.toLowerCase().includes(searchLower) ||
          record.cowName.toLowerCase().includes(searchLower) ||
          record.cowEarTag.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por rango de fechas
    if (matingFilters.dateRange.start) {
      filtered = filtered.filter(record => record.matingDate >= matingFilters.dateRange.start);
    }
    if (matingFilters.dateRange.end) {
      filtered = filtered.filter(record => record.matingDate <= matingFilters.dateRange.end);
    }

    // Filtro por tipo de monta
    if (matingFilters.matingType.length > 0) {
      filtered = filtered.filter(record => matingFilters.matingType.includes(record.matingType));
    }

    // Filtro por resultado de embarazo
    if (matingFilters.pregnancyResult.length > 0) {
      filtered = filtered.filter(record => 
        record.pregnancyResult && matingFilters.pregnancyResult.includes(record.pregnancyResult)
      );
    }

    // Filtro por toro específico
    if (matingFilters.bullId) {
      filtered = filtered.filter(record => record.bullId === matingFilters.bullId);
    }

    setFilteredMatingRecords(filtered);
  };

  // Función para calcular edad en años
  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  // Función para obtener estadísticas de toros
  const bullStatistics = useMemo(() => {
    const total = bulls.length;
    const active = bulls.filter(b => b.active && b.reproductiveStatus === "active").length;
    const avgAge = total > 0 ? 
      Math.round(bulls.reduce((sum, b) => sum + calculateAge(b.birthDate), 0) / total * 10) / 10 : 0;
    const avgWeight = total > 0 ? 
      Math.round(bulls.reduce((sum, b) => sum + b.weight, 0) / total) : 0;
    const totalOffspring = bulls.reduce((sum, b) => sum + b.performance.offspring, 0);
    const avgPregnancyRate = total > 0 ? 
      Math.round(bulls.reduce((sum, b) => sum + b.performance.pregnancyRate, 0) / total * 10) / 10 : 0;
    const totalInvestment = bulls.reduce((sum, b) => sum + b.acquisition.cost, 0);

    return {
      total,
      active,
      avgAge,
      avgWeight,
      totalOffspring,
      avgPregnancyRate,
      totalInvestment,
    };
  }, [bulls]);

  // Función para obtener estadísticas de empadre
  const matingStatistics = useMemo(() => {
    const total = matingRecords.length;
    const successful = matingRecords.filter(m => m.success).length;
    const pregnant = matingRecords.filter(m => m.pregnancyResult === "pregnant").length;
    const pending = matingRecords.filter(m => m.pregnancyResult === "pending").length;
    const successRate = total > 0 ? Math.round((successful / total) * 100) : 0;
    const pregnancyRate = total > 0 ? Math.round((pregnant / total) * 100) : 0;
    const thisMonth = matingRecords.filter(m => {
      const recordDate = new Date(m.matingDate);
      const now = new Date();
      return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      total,
      successful,
      pregnant,
      pending,
      successRate,
      pregnancyRate,
      thisMonth,
    };
  }, [matingRecords]);

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
      case "quarantine":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para obtener el color de estado reproductivo
  const getReproductiveStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "resting":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "retired":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "testing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
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

  // Componente de tarjeta de toro
  const BullCard: React.FC<{ bull: Bull }> = ({ bull }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-300"
    >
      {/* Header de la tarjeta */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="text-lg font-bold text-gray-900">{bull.name}</h3>
            <Crown className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-600">Arete: {bull.earTag}</p>
          <p className="text-sm text-gray-600">Registro: {bull.registrationNumber}</p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getHealthStatusColor(bull.healthStatus)}`}>
            <Shield className="w-3 h-3 mr-1" />
            {bull.healthStatus === "excellent" ? "Excelente" :
             bull.healthStatus === "good" ? "Bueno" :
             bull.healthStatus === "fair" ? "Regular" :
             bull.healthStatus === "poor" ? "Malo" : "Cuarentena"}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getReproductiveStatusColor(bull.reproductiveStatus)}`}>
            <Zap className="w-3 h-3 mr-1" />
            {bull.reproductiveStatus === "active" ? "Activo" :
             bull.reproductiveStatus === "resting" ? "Descanso" :
             bull.reproductiveStatus === "retired" ? "Retirado" : "Prueba"}
          </span>
        </div>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Raza</p>
          <p className="font-medium">{bull.breed}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Edad</p>
          <p className="font-medium">{calculateAge(bull.birthDate)} años</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Peso</p>
          <p className="font-medium flex items-center">
            <Scale className="w-4 h-4 mr-1 text-gray-500" />
            {bull.weight} kg
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Ubicación</p>
          <p className="font-medium">{bull.currentLocation.paddock}</p>
        </div>
      </div>

      {/* Rendimiento reproductivo */}
      <div className="bg-blue-50 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Target className="w-4 h-4 mr-1 text-blue-600" />
          Rendimiento Reproductivo
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Montas totales:</span>
            <span className="ml-1 font-medium">{bull.performance.totalMating}</span>
          </div>
          <div>
            <span className="text-gray-600">Exitosas:</span>
            <span className="ml-1 font-medium">{bull.performance.successfulMating}</span>
          </div>
          <div>
            <span className="text-gray-600">Crías:</span>
            <span className="ml-1 font-medium">{bull.performance.offspring}</span>
          </div>
          <div>
            <span className="text-gray-600">Tasa de preñez:</span>
            <span className="ml-1 font-medium text-green-600">{bull.performance.pregnancyRate}%</span>
          </div>
        </div>
      </div>

      {/* Genética */}
      <div className="bg-purple-50 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Award className="w-4 h-4 mr-1 text-purple-600" />
          Información Genética
        </p>
        <div className="text-sm">
          {bull.genetics.sireName && (
            <div>
              <span className="text-gray-600">Padre:</span>
              <span className="ml-1 font-medium">{bull.genetics.sireName}</span>
            </div>
          )}
          {bull.genetics.damName && (
            <div>
              <span className="text-gray-600">Madre:</span>
              <span className="ml-1 font-medium">{bull.genetics.damName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Valor de adquisición */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">Valor de adquisición</p>
        <p className="text-lg font-bold text-[#519a7c]">{formatCurrency(bull.acquisition.cost)}</p>
      </div>

      {/* Ubicación */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <MapPin className="w-4 h-4 mr-1" />
        <span>{bull.currentLocation.address}</span>
      </div>

      {/* Estado activo */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">Estado:</span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          bull.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {bull.active ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
          {bull.active ? "Activo" : "Inactivo"}
        </span>
      </div>

      {/* Acciones */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setSelectedBull(bull)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Ver detalles"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setBullFormData(bull);
            setShowBullForm(true);
          }}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setMatingFilters(prev => ({ ...prev, bullId: bull.id }));
            setActiveTab("mating");
          }}
          className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          title="Ver empadres"
        >
          <Heart className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (confirm("¿Estás seguro de que quieres eliminar este toro?")) {
              setBulls(prev => prev.filter(b => b.id !== bull.id));
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

  // Componente de fila de tabla de empadre
  const MatingRow: React.FC<{ record: MatingRecord }> = ({ record }) => (
    <motion.tr
      variants={itemVariants}
      className="bg-white/95 backdrop-blur-sm hover:bg-gray-50 transition-colors border-b border-gray-200"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Crown className="w-5 h-5 text-yellow-600 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">{record.bullName}</div>
            <div className="text-sm text-gray-500">ID: {record.bullId}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{record.cowName}</div>
          <div className="text-sm text-gray-500">Arete: {record.cowEarTag}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatDate(record.matingDate)}</div>
        <div className="text-sm text-gray-500">{record.matingTime}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          record.matingType === "natural" ? "bg-green-100 text-green-800" :
          record.matingType === "artificial" ? "bg-blue-100 text-blue-800" :
          "bg-purple-100 text-purple-800"
        }`}>
          {record.matingType === "natural" ? "Natural" :
           record.matingType === "artificial" ? "Artificial" : "Transferencia"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          record.pregnancyResult === "pregnant" ? "bg-green-100 text-green-800" :
          record.pregnancyResult === "not_pregnant" ? "bg-red-100 text-red-800" :
          "bg-yellow-100 text-yellow-800"
        }`}>
          {record.pregnancyResult === "pregnant" ? "Embarazada" :
           record.pregnancyResult === "not_pregnant" ? "No embarazada" : "Pendiente"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{record.location.paddock}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedMatingRecord(record)}
            className="text-blue-600 hover:text-blue-900"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setMatingFormData(record);
              setShowMatingForm(true);
            }}
            className="text-green-600 hover:text-green-900"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm("¿Estás seguro de que quieres eliminar este registro?")) {
                setMatingRecords(prev => prev.filter(m => m.id !== record.id));
              }
            }}
            className="text-red-600 hover:text-red-900"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
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
                Gestión de Toros
              </h1>
              <p className="text-white/90 text-lg">
                Administración integral de toros reproductores y registros de empadre
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => setShowBullForm(true)}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Toro
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20">
                <Download className="w-5 h-5 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex space-x-1 bg-white/20 backdrop-blur-sm rounded-xl p-1">
            <button
              onClick={() => setActiveTab("bulls")}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "bulls"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Crown className="w-5 h-5 inline mr-2" />
              Toros Reproductores
            </button>
            <button
              onClick={() => setActiveTab("mating")}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "mating"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Heart className="w-5 h-5 inline mr-2" />
              Tabla de Empadre
            </button>
          </div>
        </motion.div>

        {/* Contenido según el tab activo */}
        <AnimatePresence mode="wait">
          {activeTab === "bulls" ? (
            <motion.div
              key="bulls"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Estadísticas de toros */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
                <StatCard
                  title="Total de Toros"
                  value={bullStatistics.total}
                  icon={<Crown className="w-8 h-8" />}
                  color="hover:bg-yellow-50"
                />
                <StatCard
                  title="Activos"
                  value={bullStatistics.active}
                  icon={<Zap className="w-8 h-8" />}
                  color="hover:bg-green-50"
                />
                <StatCard
                  title="Edad Promedio"
                  value={`${bullStatistics.avgAge} años`}
                  icon={<Clock className="w-8 h-8" />}
                  color="hover:bg-blue-50"
                />
                <StatCard
                  title="Peso Promedio"
                  value={`${bullStatistics.avgWeight} kg`}
                  icon={<Scale className="w-8 h-8" />}
                  color="hover:bg-purple-50"
                />
                <StatCard
                  title="Total Crías"
                  value={bullStatistics.totalOffspring}
                  icon={<Users className="w-8 h-8" />}
                  color="hover:bg-pink-50"
                />
                <StatCard
                  title="Tasa Preñez Prom."
                  value={`${bullStatistics.avgPregnancyRate}%`}
                  icon={<Target className="w-8 h-8" />}
                  color="hover:bg-indigo-50"
                />
                <StatCard
                  title="Inversión Total"
                  value={formatCurrency(bullStatistics.totalInvestment)}
                  icon={<TrendingUp className="w-8 h-8" />}
                  color="hover:bg-orange-50"
                />
              </motion.div>

              {/* Controles de búsqueda y filtros para toros */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, arete, raza..."
                      value={bullFilters.searchTerm}
                      onChange={(e) =>
                        setBullFilters(prev => ({ ...prev, searchTerm: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
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
                  </div>
                </div>
              </motion.div>

              {/* Lista de toros */}
              <motion.div variants={itemVariants}>
                {filteredBulls.length === 0 ? (
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-white/20 text-center">
                    <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No se encontraron toros
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No hay toros que coincidan con los filtros aplicados.
                    </p>
                    <button
                      onClick={() => setShowBullForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Registrar primer toro
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBulls.map((bull) => (
                      <BullCard key={bull.id} bull={bull} />
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="mating"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Estadísticas de empadre */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
                <StatCard
                  title="Total Empadres"
                  value={matingStatistics.total}
                  icon={<Heart className="w-8 h-8" />}
                  color="hover:bg-red-50"
                />
                <StatCard
                  title="Exitosos"
                  value={matingStatistics.successful}
                  icon={<CheckCircle className="w-8 h-8" />}
                  color="hover:bg-green-50"
                />
                <StatCard
                  title="Embarazadas"
                  value={matingStatistics.pregnant}
                  icon={<Users className="w-8 h-8" />}
                  color="hover:bg-purple-50"
                />
                <StatCard
                  title="Pendientes"
                  value={matingStatistics.pending}
                  icon={<Clock className="w-8 h-8" />}
                  color="hover:bg-yellow-50"
                />
                <StatCard
                  title="Tasa de Éxito"
                  value={`${matingStatistics.successRate}%`}
                  icon={<Target className="w-8 h-8" />}
                  color="hover:bg-blue-50"
                />
                <StatCard
                  title="Tasa de Preñez"
                  value={`${matingStatistics.pregnancyRate}%`}
                  icon={<TrendingUp className="w-8 h-8" />}
                  color="hover:bg-indigo-50"
                />
                <StatCard
                  title="Este Mes"
                  value={matingStatistics.thisMonth}
                  icon={<Calendar className="w-8 h-8" />}
                  color="hover:bg-orange-50"
                />
              </motion.div>

              {/* Controles para tabla de empadre */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por toro, vaca, arete..."
                      value={matingFilters.searchTerm}
                      onChange={(e) =>
                        setMatingFilters(prev => ({ ...prev, searchTerm: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowMatingForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Empadre
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Tabla de empadre */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                {filteredMatingRecords.length === 0 ? (
                  <div className="p-12 text-center">
                    <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No se encontraron registros de empadre
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No hay registros de empadre que coincidan con los filtros aplicados.
                    </p>
                    <button
                      onClick={() => setShowMatingForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Registrar primer empadre
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Toro
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vaca
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha y Hora
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Resultado
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ubicación
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredMatingRecords.map((record) => (
                          <MatingRow key={record.id} record={record} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BullManagement;