// BullManagement.tsx
// Página para gestión integral de toros y tabla de empadre (CRUD completo)
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
  Users,
  Heart,
  Scale,
  TrendingUp,
  Shield,
  Zap,
  Target,
  Crown,
  MapPinIcon,
  Syringe,
  Microscope,
  XCircle,
  Timer
} from "lucide-react";

// Interfaces para gestión de toros
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
    earTag: string;
    sex: "male" | "female";
    weight: number;
    healthStatus: string;
  }[];
  observations: string;
  weatherConditions?: string;
  temperature?: number;
  success: boolean;
  costs: {
    veterinary: number;
    medication: number;
    equipment: number;
    total: number;
  };
  followUp: {
    checkDates: string[];
    veterinarian: string;
    notes: string[];
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interfaces para filtros
interface BullFilters {
  searchTerm: string;
  breed: string[];
  healthStatus: string[];
  reproductiveStatus: string[];
  ageRange: { min: number; max: number };
  weightRange: { min: number; max: number };
  activeOnly: boolean;
}

interface MatingFilters {
  searchTerm: string;
  dateRange: { start: string; end: string };
  matingType: string[];
  pregnancyResult: string[];
  bullId: string;
  location: string;
  assistedBy: string;
}

// Componente AnimatedText para animaciones de texto
const AnimatedText: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <motion.span
    className={className}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {children}
  </motion.span>
);

// Variantes de animación
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
      type: "spring",
      stiffness: 100,
    },
  },
};

// Componente principal
const BullManagement: React.FC = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState<"bulls" | "mating">("bulls");
  const [isLoading, setIsLoading] = useState(true);
  const [bulls, setBulls] = useState<Bull[]>([]);
  const [matingRecords, setMatingRecords] = useState<MatingRecord[]>([]);
  const [filteredBulls, setFilteredBulls] = useState<Bull[]>([]);
  const [filteredMatingRecords, setFilteredMatingRecords] = useState<MatingRecord[]>([]);
  
  // Estados de UI
  const [, setShowBullForm] = useState(false);
  const [, setShowMatingForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [, setSelectedBull] = useState<Bull | null>(null);
  const [, setSelectedMating] = useState<MatingRecord | null>(null);
  const [, setEditingBull] = useState<Bull | null>(null);
  const [, setEditingMating] = useState<MatingRecord | null>(null);
  
  // Estados de filtros
  const [bullFilters, setBullFilters] = useState<BullFilters>({
    searchTerm: "",
    breed: [],
    healthStatus: [],
    reproductiveStatus: [],
    ageRange: { min: 0, max: 20 },
    weightRange: { min: 0, max: 2000 },
    activeOnly: false,
  });
  
  const [matingFilters, setMatingFilters] = useState<MatingFilters>({
    searchTerm: "",
    dateRange: { start: "", end: "" },
    matingType: [],
    pregnancyResult: [],
    bullId: "",
    location: "",
    assistedBy: "",
  });

  // Datos mock para desarrollo
  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setBulls([
        {
          id: "1",
          name: "Toro Campeón",
          earTag: "TC001",
          registrationNumber: "REG-2024-001",
          breed: "Brahman",
          birthDate: "2020-03-15",
          weight: 850,
          height: 145,
          currentLocation: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Potrero Norte, Villahermosa, Tabasco",
            paddock: "Potrero A1"
          },
          healthStatus: "excellent",
          reproductiveStatus: "active",
          genetics: {
            sireId: "SIRE001",
            sireName: "Brahman Elite",
            damId: "DAM001",
            damName: "Vaca Madre",
            genealogy: ["Brahman Elite", "Toro Superior", "Línea Premium"]
          },
          performance: {
            totalMating: 45,
            successfulMating: 38,
            offspring: 32,
            pregnancyRate: 84.4,
            lastMatingDate: "2024-06-15"
          },
          health: {
            lastCheckupDate: "2024-07-10",
            veterinarian: "Dr. Carlos Mendoza",
            vaccinations: [
              {
                date: "2024-06-01",
                vaccine: "Triple Bovina",
                batch: "TB-2024-06",
                nextDue: "2025-06-01"
              }
            ],
            treatments: []
          },
          nutrition: {
            diet: "Pasto estrella + concentrado",
            dailyFeed: 12,
            supplements: ["Vitamina A", "Minerales"],
            lastWeightDate: "2024-07-10"
          },
          acquisition: {
            date: "2020-03-15",
            source: "Rancho Los Altos",
            cost: 45000,
            purpose: "breeding"
          },
          notes: "Excelente toro reproductor con alta tasa de preñez",
          photos: [],
          active: true,
          createdAt: "2024-01-15",
          updatedAt: "2024-07-15"
        },
        {
          id: "2",
          name: "Toro Dorado",
          earTag: "TD002",
          registrationNumber: "REG-2024-002",
          breed: "Angus",
          birthDate: "2019-08-22",
          weight: 920,
          height: 150,
          currentLocation: {
            lat: 17.9950,
            lng: -92.9400,
            address: "Potrero Sur, Villahermosa, Tabasco",
            paddock: "Potrero B2"
          },
          healthStatus: "good",
          reproductiveStatus: "active",
          genetics: {
            sireId: "SIRE002",
            sireName: "Angus Premium",
            damId: "DAM002",
            damName: "Madre Dorada",
            genealogy: ["Angus Premium", "Línea Dorada", "Genética Superior"]
          },
          performance: {
            totalMating: 52,
            successfulMating: 44,
            offspring: 38,
            pregnancyRate: 84.6,
            lastMatingDate: "2024-07-01"
          },
          health: {
            lastCheckupDate: "2024-07-05",
            veterinarian: "Dra. Ana Rodríguez",
            vaccinations: [
              {
                date: "2024-05-15",
                vaccine: "Brucelosis",
                batch: "BR-2024-05",
                nextDue: "2025-05-15"
              }
            ],
            treatments: []
          },
          nutrition: {
            diet: "Pasto bermuda + suplemento proteico",
            dailyFeed: 14,
            supplements: ["Proteína", "Minerales", "Vitamina E"],
            lastWeightDate: "2024-07-05"
          },
          acquisition: {
            date: "2019-08-22",
            source: "Ganadería La Esperanza",
            cost: 52000,
            purpose: "genetic_improvement"
          },
          notes: "Toro con excelente conformación y buenos índices reproductivos",
          photos: [],
          active: true,
          createdAt: "2024-01-10",
          updatedAt: "2024-07-10"
        }
      ]);

      setMatingRecords([
        {
          id: "1",
          bullId: "1",
          bullName: "Toro Campeón",
          cowId: "COW001",
          cowName: "Vaca Luna",
          cowEarTag: "VL001",
          matingDate: "2024-07-15",
          matingTime: "08:30",
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Potrero Norte, Villahermosa, Tabasco",
            paddock: "Potrero A1"
          },
          matingType: "natural",
          estrusDetected: true,
          estrusDate: "2024-07-14",
          assistedBy: {
            id: "VET001",
            name: "Dr. Carlos Mendoza",
            role: "Veterinario"
          },
          pregnancyTestDate: "2024-08-15",
          pregnancyResult: "pregnant",
          expectedBirthDate: "2025-04-15",
          observations: "Monta natural exitosa, vaca en celo evidente",
          weatherConditions: "Soleado",
          temperature: 28,
          success: true,
          costs: {
            veterinary: 800,
            medication: 200,
            equipment: 0,
            total: 1000
          },
          followUp: {
            checkDates: ["2024-08-15", "2024-09-15"],
            veterinarian: "Dr. Carlos Mendoza",
            notes: ["Gestación confirmada", "Desarrollo normal"]
          },
          active: true,
          createdAt: "2024-07-15",
          updatedAt: "2024-08-15"
        },
        {
          id: "2",
          bullId: "2",
          bullName: "Toro Dorado",
          cowId: "COW002",
          cowName: "Vaca Estrella",
          cowEarTag: "VE002",
          matingDate: "2024-07-10",
          matingTime: "14:15",
          location: {
            lat: 17.9950,
            lng: -92.9400,
            address: "Potrero Sur, Villahermosa, Tabasco",
            paddock: "Potrero B2"
          },
          matingType: "artificial",
          estrusDetected: true,
          estrusDate: "2024-07-09",
          assistedBy: {
            id: "VET002",
            name: "Dra. Ana Rodríguez",
            role: "Veterinaria"
          },
          pregnancyTestDate: "2024-08-10",
          pregnancyResult: "pending",
          observations: "Inseminación artificial programada, sincronización exitosa",
          weatherConditions: "Nublado",
          temperature: 26,
          success: true,
          costs: {
            veterinary: 1200,
            medication: 400,
            equipment: 300,
            total: 1900
          },
          followUp: {
            checkDates: ["2024-08-10"],
            veterinarian: "Dra. Ana Rodríguez",
            notes: ["Esperando resultado de gestación"]
          },
          active: true,
          createdAt: "2024-07-10",
          updatedAt: "2024-07-10"
        }
      ]);

      setIsLoading(false);
    }, 1500);
  }, []);

  // Efectos para filtros
  useEffect(() => {
    applyBullFilters();
  }, [bulls, bullFilters]);

  useEffect(() => {
    applyMatingFilters();
  }, [matingRecords, matingFilters]);

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
    if (matingFilters.dateRange.start && matingFilters.dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.matingDate);
        const startDate = new Date(matingFilters.dateRange.start);
        const endDate = new Date(matingFilters.dateRange.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    // Filtro por tipo de monta
    if (matingFilters.matingType.length > 0) {
      filtered = filtered.filter(record => matingFilters.matingType.includes(record.matingType));
    }

    // Filtro por resultado de gestación
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

  // Funciones para obtener estilos de estados
  const getHealthStatusColor = (status: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800 border-green-200",
      good: "bg-blue-100 text-blue-800 border-blue-200",
      fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
      poor: "bg-orange-100 text-orange-800 border-orange-200",
      quarantine: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[status as keyof typeof colors] || colors.fair;
  };

  const getReproductiveStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      resting: "bg-blue-100 text-blue-800 border-blue-200",
      retired: "bg-gray-100 text-gray-800 border-gray-200",
      testing: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getPregnancyResultColor = (result?: string) => {
    const colors = {
      pregnant: "bg-emerald-100 text-emerald-800 border-emerald-200",
      not_pregnant: "bg-red-100 text-red-800 border-red-200",
      pending: "bg-blue-100 text-blue-800 border-blue-200",
    };
    return result ? colors[result as keyof typeof colors] || colors.pending : colors.pending;
  };

  // Calcular estadísticas
  const bullStatistics = useMemo(() => {
    const totalBulls = bulls.length;
    const activeBulls = bulls.filter(bull => bull.active && bull.reproductiveStatus === "active").length;
    const avgWeight = bulls.length > 0 ? Math.round(bulls.reduce((sum, bull) => sum + bull.weight, 0) / bulls.length) : 0;
    const avgAge = bulls.length > 0 ? Math.round(bulls.reduce((sum, bull) => {
      const age = new Date().getFullYear() - new Date(bull.birthDate).getFullYear();
      return sum + age;
    }, 0) / bulls.length) : 0;
    const avgPregnancyRate = bulls.length > 0 ? Math.round(bulls.reduce((sum, bull) => sum + bull.performance.pregnancyRate, 0) / bulls.length) : 0;

    return {
      total: totalBulls,
      active: activeBulls,
      avgWeight,
      avgAge,
      avgPregnancyRate
    };
  }, [bulls]);

  const matingStatistics = useMemo(() => {
    const totalMating = matingRecords.length;
    const successful = matingRecords.filter(record => record.success).length;
    const pregnant = matingRecords.filter(record => record.pregnancyResult === "pregnant").length;
    const pending = matingRecords.filter(record => record.pregnancyResult === "pending").length;
    const successRate = totalMating > 0 ? Math.round((successful / totalMating) * 100) : 0;
    const pregnancyRate = totalMating > 0 ? Math.round((pregnant / totalMating) * 100) : 0;
    
    // Registros de este mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = matingRecords.filter(record => {
      const recordDate = new Date(record.matingDate);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    }).length;

    return {
      total: totalMating,
      successful,
      pregnant,
      pending,
      successRate,
      pregnancyRate,
      thisMonth
    };
  }, [matingRecords]);

  // Componente de tarjeta de estadística
  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
    subtitle?: string;
  }> = ({ title, value, icon, color = "", subtitle }) => (
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
  const BullCard: React.FC<{ bull: Bull }> = ({ bull }) => {
    const age = new Date().getFullYear() - new Date(bull.birthDate).getFullYear();
    
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
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
            <p className="text-xs text-gray-500">Raza</p>
            <p className="text-sm font-medium text-gray-900">{bull.breed}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Edad</p>
            <p className="text-sm font-medium text-gray-900">{age} años</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Peso</p>
            <p className="text-sm font-medium text-gray-900">{bull.weight} kg</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ubicación</p>
            <p className="text-sm font-medium text-gray-900">{bull.currentLocation.paddock}</p>
          </div>
        </div>

        {/* Estadísticas de rendimiento */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h4 className="text-xs font-medium text-gray-600 mb-2">Rendimiento Reproductivo</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-gray-500">Total Montas:</span>
              <span className="font-medium ml-1">{bull.performance.totalMating}</span>
            </div>
            <div>
              <span className="text-gray-500">Exitosas:</span>
              <span className="font-medium ml-1">{bull.performance.successfulMating}</span>
            </div>
            <div>
              <span className="text-gray-500">Crías:</span>
              <span className="font-medium ml-1">{bull.performance.offspring}</span>
            </div>
            <div>
              <span className="text-gray-500">Tasa Preñez:</span>
              <span className="font-medium ml-1">{bull.performance.pregnancyRate}%</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedBull(bull)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingBull(bull)}
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => {/* Función para eliminar */}}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">{bull.currentLocation.address.split(',')[0]}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Componente de fila de empadre
  const MatingRow: React.FC<{ record: MatingRecord }> = ({ record }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <Crown className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">{record.bullName}</p>
            <p className="text-xs text-gray-500">ID: {record.bullId}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">{record.cowName}</p>
          <p className="text-xs text-gray-500">Arete: {record.cowEarTag}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {new Date(record.matingDate).toLocaleDateString('es-MX')}
          </p>
          <p className="text-xs text-gray-500">{record.matingTime}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          record.matingType === "natural" ? "bg-green-100 text-green-800" :
          record.matingType === "artificial" ? "bg-blue-100 text-blue-800" :
          "bg-purple-100 text-purple-800"
        }`}>
          {record.matingType === "natural" ? (
            <>
              <Heart className="w-3 h-3 mr-1" />
              Natural
            </>
          ) : record.matingType === "artificial" ? (
            <>
              <Syringe className="w-3 h-3 mr-1" />
              Artificial
            </>
          ) : (
            <>
              <Microscope className="w-3 h-3 mr-1" />
              Transferencia
            </>
          )}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPregnancyResultColor(record.pregnancyResult)}`}>
          {record.pregnancyResult === "pregnant" ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Preñada
            </>
          ) : record.pregnancyResult === "not_pregnant" ? (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              No Preñada
            </>
          ) : (
            <>
              <Timer className="w-3 h-3 mr-1" />
              Pendiente
            </>
          )}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-1">
          <MapPinIcon className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{record.location.paddock}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={() => setSelectedMating(record)}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingMating(record)}
            className="p-1 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {/* Función para eliminar */}}
            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );

  // Pantalla de carga
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
            <p className="text-gray-600 font-medium">Cargando gestión de toros...</p>
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
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <AnimatedText>Gestión de Toros y Empadre</AnimatedText>
                </h1>
                <p className="text-gray-600 mt-1">
                  Control integral de toros reproductores y registros de empadre
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 flex items-center space-x-2 ${
                  showFilters 
                    ? "bg-[#519a7c] text-white border-[#519a7c]" 
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#519a7c]"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>
              <button
                onClick={() => {/* Función para exportar */}}
                className="px-4 py-2 bg-white text-gray-700 rounded-xl border-2 border-gray-300 hover:border-blue-400 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex mt-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("bulls")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "bulls"
                  ? "border-[#519a7c] text-[#519a7c]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Crown className="w-4 h-4" />
                <span>Toros</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("mating")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "mating"
                  ? "border-[#519a7c] text-[#519a7c]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>Empadre</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Contenido de tabs */}
        <AnimatePresence mode="wait">
          {activeTab === "bulls" && (
            <motion.div
              key="bulls"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              {/* Estadísticas de toros */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                  title="Total Toros"
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
                  title="Peso Promedio"
                  value={`${bullStatistics.avgWeight} kg`}
                  icon={<Scale className="w-8 h-8" />}
                  color="hover:bg-blue-50"
                />
                <StatCard
                  title="Edad Promedio"
                  value={`${bullStatistics.avgAge} años`}
                  icon={<Clock className="w-8 h-8" />}
                  color="hover:bg-purple-50"
                />
                <StatCard
                  title="Tasa Preñez Prom."
                  value={`${bullStatistics.avgPregnancyRate}%`}
                  icon={<TrendingUp className="w-8 h-8" />}
                  color="hover:bg-orange-50"
                />
              </motion.div>

              {/* Controles para toros */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, arete, registro..."
                      value={bullFilters.searchTerm}
                      onChange={(e) =>
                        setBullFilters(prev => ({ ...prev, searchTerm: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowBullForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Toro
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Grid de toros */}
              <motion.div variants={itemVariants}>
                {filteredBulls.length === 0 ? (
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-12 text-center shadow-lg border border-white/20">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredBulls.map((bull) => (
                      <BullCard key={bull.id} bull={bull} />
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === "mating" && (
            <motion.div
              key="mating"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              {/* Estadísticas de empadre */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <StatCard
                  title="Total Empadres"
                  value={matingStatistics.total}
                  icon={<Heart className="w-8 h-8" />}
                  color="hover:bg-pink-50"
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
                  title="Este Mes"
                  value={matingStatistics.thisMonth}
                  icon={<Calendar className="w-8 h-8" />}
                  color="hover:bg-orange-50"
                />
              </motion.div>

              {/* Controles para tabla de empadre */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
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

        {/* Modales y formularios serían implementados aquí */}
        {/* FormModal components would go here for create/edit operations */}
        
      </motion.div>
    </div>
  );
};

export default BullManagement;