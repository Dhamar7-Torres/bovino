// CowManagement.tsx
// Página para gestión integral de vacas y tabla de enmadre (CRUD completo)
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
  Heart,
  Scale,
  Shield,
  Crown,
  UserCheck,
  Activity,
  Baby,
  MapPinIcon,
  Syringe,
  Bell,
  Flower2,
  Milk,
  Droplets,
  Stethoscope,
  Weight,
  Star,
} from "lucide-react";

// Interfaces para gestión de vacas
interface Cow {
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
    facility: string;
  };
  healthStatus: "excellent" | "good" | "fair" | "poor" | "sick";
  reproductiveStatus: "maiden" | "pregnant" | "lactating" | "dry" | "open" | "retired";
  genetics: {
    sireId?: string;
    sireName?: string;
    damId?: string;
    damName?: string;
    genealogy: string[];
  };
  reproductiveHistory: {
    totalPregnancies: number;
    liveCalves: number;
    lastCalvingDate?: string;
    lastBreedingDate?: string;
    estrus: {
      lastCycle: string;
      cycleLength: number; // days
      irregular: boolean;
    };
    conception: {
      attempts: number;
      averageAttempts: number;
      conceptionRate: number; // percentage
    };
  };
  lactation: {
    isLactating: boolean;
    lactationNumber: number;
    startDate?: string;
    peakMilk?: number; // liters per day
    currentMilk?: number; // liters per day
    totalMilk?: number; // liters total
    dryOffDate?: string;
  };
  health: {
    lastCheckupDate: string;
    veterinarian: string;
    bodyConditionScore: number; // 1-5 scale
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
    purpose: "breeding" | "milk_production" | "replacement";
  };
  currentPregnancy?: {
    bullId: string;
    bullName: string;
    breedingDate: string;
    confirmationDate: string;
    expectedCalvingDate: string;
    gestationDay: number;
  };
  notes: string;
  photos: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface para registros de enmadre (maternidad)
interface MotherhoodRecord {
  id: string;
  cowId: string;
  cowName: string;
  cowEarTag: string;
  bullId?: string;
  bullName?: string;
  breedingDate: string;
  breedingType: "natural" | "artificial" | "embryo_transfer";
  pregnancyConfirmDate: string;
  gestationPeriod: number; // days
  calvingDate: string;
  calvingTime: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    paddock: string;
  };
  assistedBy: {
    id: string;
    name: string;
    role: string;
  };
  calvingType: "natural" | "assisted" | "cesarean" | "emergency";
  complications: string[];
  calf: {
    id: string;
    name: string;
    earTag: string;
    gender: "male" | "female";
    birthWeight: number;
    healthStatus: "excellent" | "good" | "fair" | "poor" | "critical";
    alive: boolean;
  };
  placentaExpelled: boolean;
  placentaExpelledTime?: string;
  colostrum: {
    received: boolean;
    quality: "excellent" | "good" | "fair" | "poor";
    timeReceived?: string;
  };
  postCalvingCare: {
    vitamins: boolean;
    antibiotics: boolean;
    monitoring: string[];
  };
  lactationStart: {
    date: string;
    initialMilk: number; // liters
  };
  economicImpact: {
    calvingCost: number;
    veterinaryCost: number;
    expectedValue: number;
  };
  notes: string;
  success: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interfaces para filtros
interface CowFilters {
  searchTerm: string;
  breed: string[];
  healthStatus: string[];
  reproductiveStatus: string[];
  ageRange: { min: number; max: number };
  weightRange: { min: number; max: number };
  lactationStatus: string[];
  location: string[];
  activeOnly: boolean;
}

interface MotherhoodFilters {
  searchTerm: string;
  dateRange: { start: string; end: string };
  calvingType: string[];
  calfGender: string[];
  calfHealth: string[];
  cowId: string;
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
const CowManagement: React.FC = () => {
  // Estados principales
  const [activeTab, setActiveTab] = useState<"cows" | "motherhood">("cows");
  const [isLoading, setIsLoading] = useState(true);
  const [cows, setCows] = useState<Cow[]>([]);
  const [motherhoodRecords, setMotherhoodRecords] = useState<MotherhoodRecord[]>([]);
  const [filteredCows, setFilteredCows] = useState<Cow[]>([]);
  const [filteredMotherhoodRecords, setFilteredMotherhoodRecords] = useState<MotherhoodRecord[]>([]);
  
  // Estados de UI
  const [, setShowCowForm] = useState(false);
  const [, setShowMotherhoodForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [, setSelectedCow] = useState<Cow | null>(null);
  const [, setSelectedMotherhood] = useState<MotherhoodRecord | null>(null);
  const [, setEditingCow] = useState<Cow | null>(null);
  const [, setEditingMotherhood] = useState<MotherhoodRecord | null>(null);
  
  // Estados de filtros
  const [cowFilters, setCowFilters] = useState<CowFilters>({
    searchTerm: "",
    breed: [],
    healthStatus: [],
    reproductiveStatus: [],
    ageRange: { min: 0, max: 20 },
    weightRange: { min: 0, max: 800 },
    lactationStatus: [],
    location: [],
    activeOnly: false,
  });
  
  const [motherhoodFilters, setMotherhoodFilters] = useState<MotherhoodFilters>({
    searchTerm: "",
    dateRange: { start: "", end: "" },
    calvingType: [],
    calfGender: [],
    calfHealth: [],
    cowId: "",
    location: "",
    assistedBy: "",
  });

  // Datos mock para desarrollo
  useEffect(() => {
    // Simular carga de datos
    setTimeout(() => {
      setCows([
        {
          id: "1",
          name: "Vaca Luna",
          earTag: "VL001",
          registrationNumber: "REG-V-2024-001",
          breed: "Holstein",
          birthDate: "2020-05-15",
          weight: 580,
          height: 135,
          currentLocation: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Potrero Norte, Villahermosa, Tabasco",
            paddock: "Potrero A1",
            facility: "Área de Ordeño"
          },
          healthStatus: "excellent",
          reproductiveStatus: "lactating",
          genetics: {
            sireId: "SIRE001",
            sireName: "Holstein Premium",
            damId: "DAM001",
            damName: "Madre Luna",
            genealogy: ["Holstein Premium", "Línea Láctea", "Genética Superior"]
          },
          reproductiveHistory: {
            totalPregnancies: 4,
            liveCalves: 4,
            lastCalvingDate: "2024-03-15",
            lastBreedingDate: "2023-06-20",
            estrus: {
              lastCycle: "2024-07-10",
              cycleLength: 21,
              irregular: false
            },
            conception: {
              attempts: 1,
              averageAttempts: 1.2,
              conceptionRate: 95
            }
          },
          lactation: {
            isLactating: true,
            lactationNumber: 4,
            startDate: "2024-03-18",
            peakMilk: 32,
            currentMilk: 28,
            totalMilk: 3200,
            dryOffDate: "2024-12-15"
          },
          health: {
            lastCheckupDate: "2024-07-10",
            veterinarian: "Dra. María González",
            bodyConditionScore: 3.5,
            vaccinations: [
              {
                date: "2024-06-01",
                vaccine: "IBR-BVD",
                batch: "IBR-2024-06",
                nextDue: "2025-06-01"
              }
            ],
            treatments: []
          },
          nutrition: {
            diet: "Concentrado lácteo + alfalfa",
            dailyFeed: 18,
            supplements: ["Calcio", "Vitamina D", "Minerales"],
            lastWeightDate: "2024-07-10"
          },
          acquisition: {
            date: "2020-05-15",
            source: "Ganadería Los Alpes",
            cost: 25000,
            purpose: "milk_production"
          },
          notes: "Excelente vaca lechera con alta producción",
          photos: [],
          active: true,
          createdAt: "2024-01-15",
          updatedAt: "2024-07-15"
        },
        {
          id: "2",
          name: "Vaca Estrella",
          earTag: "VE002",
          registrationNumber: "REG-V-2024-002",
          breed: "Jersey",
          birthDate: "2021-02-10",
          weight: 450,
          height: 125,
          currentLocation: {
            lat: 17.9950,
            lng: -92.9400,
            address: "Potrero Sur, Villahermosa, Tabasco",
            paddock: "Potrero B2",
            facility: "Área de Reproducción"
          },
          healthStatus: "good",
          reproductiveStatus: "pregnant",
          genetics: {
            sireId: "SIRE002",
            sireName: "Jersey Elite",
            damId: "DAM002",
            damName: "Madre Estrella",
            genealogy: ["Jersey Elite", "Línea Premium", "Genética de Calidad"]
          },
          reproductiveHistory: {
            totalPregnancies: 2,
            liveCalves: 2,
            lastCalvingDate: "2023-08-20",
            lastBreedingDate: "2024-05-15",
            estrus: {
              lastCycle: "2024-05-12",
              cycleLength: 20,
              irregular: false
            },
            conception: {
              attempts: 2,
              averageAttempts: 1.5,
              conceptionRate: 85
            }
          },
          lactation: {
            isLactating: false,
            lactationNumber: 2,
            dryOffDate: "2024-02-15"
          },
          health: {
            lastCheckupDate: "2024-07-05",
            veterinarian: "Dr. Luis Hernández",
            bodyConditionScore: 3.8,
            vaccinations: [
              {
                date: "2024-05-20",
                vaccine: "Brucelosis",
                batch: "BR-2024-05",
                nextDue: "2025-05-20"
              }
            ],
            treatments: []
          },
          nutrition: {
            diet: "Pasto natural + suplemento gestacional",
            dailyFeed: 15,
            supplements: ["Ácido Fólico", "Hierro", "Vitaminas"],
            lastWeightDate: "2024-07-05"
          },
          acquisition: {
            date: "2021-02-10",
            source: "Rancho San José",
            cost: 22000,
            purpose: "breeding"
          },
          currentPregnancy: {
            bullId: "2",
            bullName: "Toro Dorado",
            breedingDate: "2024-05-15",
            confirmationDate: "2024-06-15",
            expectedCalvingDate: "2025-02-15",
            gestationDay: 185
          },
          notes: "Vaca gestante con buen desarrollo fetal",
          photos: [],
          active: true,
          createdAt: "2024-01-10",
          updatedAt: "2024-07-10"
        },
        {
          id: "3",
          name: "Vaca Princesa",
          earTag: "VP003",
          registrationNumber: "REG-V-2024-003",
          breed: "Brown Swiss",
          birthDate: "2019-11-05",
          weight: 620,
          height: 140,
          currentLocation: {
            lat: 17.9800,
            lng: -92.9350,
            address: "Potrero Este, Villahermosa, Tabasco",
            paddock: "Potrero C1",
            facility: "Área de Descanso"
          },
          healthStatus: "good",
          reproductiveStatus: "dry",
          genetics: {
            sireId: "SIRE003",
            sireName: "Brown Elite",
            damId: "DAM003",
            damName: "Madre Princesa",
            genealogy: ["Brown Elite", "Línea Europea", "Genética Tradicional"]
          },
          reproductiveHistory: {
            totalPregnancies: 5,
            liveCalves: 5,
            lastCalvingDate: "2023-12-10",
            lastBreedingDate: "2024-06-01",
            estrus: {
              lastCycle: "2024-06-28",
              cycleLength: 22,
              irregular: false
            },
            conception: {
              attempts: 1,
              averageAttempts: 1.1,
              conceptionRate: 92
            }
          },
          lactation: {
            isLactating: false,
            lactationNumber: 5,
            dryOffDate: "2024-05-15"
          },
          health: {
            lastCheckupDate: "2024-07-01",
            veterinarian: "Dra. Ana Rodríguez",
            bodyConditionScore: 4.0,
            vaccinations: [
              {
                date: "2024-04-15",
                vaccine: "Clostridial",
                batch: "CL-2024-04",
                nextDue: "2025-04-15"
              }
            ],
            treatments: []
          },
          nutrition: {
            diet: "Pasto mejorado + concentrado",
            dailyFeed: 16,
            supplements: ["Minerales", "Vitamina E"],
            lastWeightDate: "2024-07-01"
          },
          acquisition: {
            date: "2019-11-05",
            source: "Ganadería El Progreso",
            cost: 28000,
            purpose: "breeding"
          },
          notes: "Vaca madura con excelente historial reproductivo",
          photos: [],
          active: true,
          createdAt: "2024-01-05",
          updatedAt: "2024-07-05"
        }
      ]);

      setMotherhoodRecords([
        {
          id: "1",
          cowId: "1",
          cowName: "Vaca Luna",
          cowEarTag: "VL001",
          bullId: "1",
          bullName: "Toro Campeón",
          breedingDate: "2023-06-20",
          breedingType: "natural",
          pregnancyConfirmDate: "2023-07-20",
          gestationPeriod: 278,
          calvingDate: "2024-03-15",
          calvingTime: "06:30",
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Potrero Norte, Villahermosa, Tabasco",
            paddock: "Potrero A1"
          },
          assistedBy: {
            id: "VET001",
            name: "Dr. Carlos Mendoza",
            role: "Veterinario"
          },
          calvingType: "natural",
          complications: [],
          calf: {
            id: "CALF001",
            name: "Becerro Estrella",
            earTag: "BE001",
            gender: "male",
            birthWeight: 35,
            healthStatus: "excellent",
            alive: true
          },
          placentaExpelled: true,
          placentaExpelledTime: "07:45",
          colostrum: {
            received: true,
            quality: "excellent",
            timeReceived: "07:00"
          },
          postCalvingCare: {
            vitamins: true,
            antibiotics: false,
            monitoring: ["Peso diario", "Salud general", "Alimentación"]
          },
          lactationStart: {
            date: "2024-03-18",
            initialMilk: 18
          },
          economicImpact: {
            calvingCost: 1500,
            veterinaryCost: 800,
            expectedValue: 15000
          },
          notes: "Parto exitoso sin complicaciones",
          success: true,
          createdAt: "2024-03-15",
          updatedAt: "2024-03-18"
        },
        {
          id: "2",
          cowId: "3",
          cowName: "Vaca Princesa",
          cowEarTag: "VP003",
          bullId: "2",
          bullName: "Toro Dorado",
          breedingDate: "2023-03-15",
          breedingType: "artificial",
          pregnancyConfirmDate: "2023-04-15",
          gestationPeriod: 280,
          calvingDate: "2023-12-10",
          calvingTime: "14:20",
          location: {
            lat: 17.9800,
            lng: -92.9350,
            address: "Potrero Este, Villahermosa, Tabasco",
            paddock: "Potrero C1"
          },
          assistedBy: {
            id: "VET002",
            name: "Dra. Ana Rodríguez",
            role: "Veterinaria"
          },
          calvingType: "assisted",
          complications: ["Presentación posterior"],
          calf: {
            id: "CALF002",
            name: "Becerra Dorada",
            earTag: "BD002",
            gender: "female",
            birthWeight: 32,
            healthStatus: "good",
            alive: true
          },
          placentaExpelled: true,
          placentaExpelledTime: "16:30",
          colostrum: {
            received: true,
            quality: "good",
            timeReceived: "15:00"
          },
          postCalvingCare: {
            vitamins: true,
            antibiotics: true,
            monitoring: ["Recuperación post-parto", "Control antibiótico", "Seguimiento cría"]
          },
          lactationStart: {
            date: "2023-12-13",
            initialMilk: 15
          },
          economicImpact: {
            calvingCost: 2200,
            veterinaryCost: 1200,
            expectedValue: 18000
          },
          notes: "Parto asistido exitoso, requirió antibióticos profilácticos",
          success: true,
          createdAt: "2023-12-10",
          updatedAt: "2023-12-15"
        }
      ]);

      setIsLoading(false);
    }, 1500);
  }, []);

  // Efectos para filtros
  useEffect(() => {
    applyCowFilters();
  }, [cows, cowFilters]);

  useEffect(() => {
    applyMotherhoodFilters();
  }, [motherhoodRecords, motherhoodFilters]);

  // Función para aplicar filtros de vacas
  const applyCowFilters = () => {
    let filtered = [...cows];

    // Filtro por término de búsqueda
    if (cowFilters.searchTerm) {
      const searchLower = cowFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        cow =>
          cow.name.toLowerCase().includes(searchLower) ||
          cow.earTag.toLowerCase().includes(searchLower) ||
          cow.breed.toLowerCase().includes(searchLower) ||
          cow.registrationNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por raza
    if (cowFilters.breed.length > 0) {
      filtered = filtered.filter(cow => cowFilters.breed.includes(cow.breed));
    }

    // Filtro por estado de salud
    if (cowFilters.healthStatus.length > 0) {
      filtered = filtered.filter(cow => cowFilters.healthStatus.includes(cow.healthStatus));
    }

    // Filtro por estado reproductivo
    if (cowFilters.reproductiveStatus.length > 0) {
      filtered = filtered.filter(cow => cowFilters.reproductiveStatus.includes(cow.reproductiveStatus));
    }

    // Filtro por solo activas
    if (cowFilters.activeOnly) {
      filtered = filtered.filter(cow => cow.active);
    }

    // Filtro por rango de edad
    const currentYear = new Date().getFullYear();
    if (cowFilters.ageRange.min > 0 || cowFilters.ageRange.max < 20) {
      filtered = filtered.filter(cow => {
        const birthYear = new Date(cow.birthDate).getFullYear();
        const age = currentYear - birthYear;
        return age >= cowFilters.ageRange.min && age <= cowFilters.ageRange.max;
      });
    }

    // Filtro por rango de peso
    if (cowFilters.weightRange.min > 0 || cowFilters.weightRange.max < 800) {
      filtered = filtered.filter(cow => 
        cow.weight >= cowFilters.weightRange.min && 
        cow.weight <= cowFilters.weightRange.max
      );
    }

    setFilteredCows(filtered);
  };

  // Función para aplicar filtros de enmadre
  const applyMotherhoodFilters = () => {
    let filtered = [...motherhoodRecords];

    // Filtro por término de búsqueda
    if (motherhoodFilters.searchTerm) {
      const searchLower = motherhoodFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        record =>
          record.cowName.toLowerCase().includes(searchLower) ||
          record.cowEarTag.toLowerCase().includes(searchLower) ||
          record.calf.name.toLowerCase().includes(searchLower) ||
          record.calf.earTag.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por rango de fechas
    if (motherhoodFilters.dateRange.start && motherhoodFilters.dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.calvingDate);
        const startDate = new Date(motherhoodFilters.dateRange.start);
        const endDate = new Date(motherhoodFilters.dateRange.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    // Filtro por tipo de parto
    if (motherhoodFilters.calvingType.length > 0) {
      filtered = filtered.filter(record => motherhoodFilters.calvingType.includes(record.calvingType));
    }

    // Filtro por género de cría
    if (motherhoodFilters.calfGender.length > 0) {
      filtered = filtered.filter(record => motherhoodFilters.calfGender.includes(record.calf.gender));
    }

    // Filtro por salud de cría
    if (motherhoodFilters.calfHealth.length > 0) {
      filtered = filtered.filter(record => motherhoodFilters.calfHealth.includes(record.calf.healthStatus));
    }

    // Filtro por vaca específica
    if (motherhoodFilters.cowId) {
      filtered = filtered.filter(record => record.cowId === motherhoodFilters.cowId);
    }

    setFilteredMotherhoodRecords(filtered);
  };

  // Funciones para obtener estilos de estados
  const getHealthStatusColor = (status: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800 border-green-200",
      good: "bg-blue-100 text-blue-800 border-blue-200",
      fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
      poor: "bg-orange-100 text-orange-800 border-orange-200",
      sick: "bg-red-100 text-red-800 border-red-200",
      critical: "bg-red-200 text-red-900 border-red-300",
    };
    return colors[status as keyof typeof colors] || colors.fair;
  };

  const getReproductiveStatusColor = (status: string) => {
    const colors = {
      maiden: "bg-purple-100 text-purple-800 border-purple-200",
      pregnant: "bg-pink-100 text-pink-800 border-pink-200",
      lactating: "bg-blue-100 text-blue-800 border-blue-200",
      dry: "bg-yellow-100 text-yellow-800 border-yellow-200",
      open: "bg-green-100 text-green-800 border-green-200",
      retired: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status as keyof typeof colors] || colors.open;
  };

  const getCalvingTypeColor = (type: string) => {
    const colors = {
      natural: "bg-green-100 text-green-800 border-green-200",
      assisted: "bg-blue-100 text-blue-800 border-blue-200",
      cesarean: "bg-orange-100 text-orange-800 border-orange-200",
      emergency: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[type as keyof typeof colors] || colors.natural;
  };

  // Calcular estadísticas
  const cowStatistics = useMemo(() => {
    const totalCows = cows.length;
    const activeCows = cows.filter(cow => cow.active).length;
    const pregnantCows = cows.filter(cow => cow.reproductiveStatus === "pregnant").length;
    const lactatingCows = cows.filter(cow => cow.lactation.isLactating).length;
    const avgWeight = cows.length > 0 ? Math.round(cows.reduce((sum, cow) => sum + cow.weight, 0) / cows.length) : 0;
    const avgAge = cows.length > 0 ? Math.round(cows.reduce((sum, cow) => {
      const age = new Date().getFullYear() - new Date(cow.birthDate).getFullYear();
      return sum + age;
    }, 0) / cows.length) : 0;
    const avgMilkProduction = lactatingCows > 0 ? 
      Math.round(cows
        .filter(cow => cow.lactation.isLactating && cow.lactation.currentMilk)
        .reduce((sum, cow) => sum + (cow.lactation.currentMilk || 0), 0) / lactatingCows) : 0;

    return {
      total: totalCows,
      active: activeCows,
      pregnant: pregnantCows,
      lactating: lactatingCows,
      avgWeight,
      avgAge,
      avgMilkProduction
    };
  }, [cows]);

  const motherhoodStatistics = useMemo(() => {
    const totalBirths = motherhoodRecords.length;
    const successfulBirths = motherhoodRecords.filter(record => record.success).length;
    const maleCalves = motherhoodRecords.filter(record => record.calf.gender === "male").length;
    const femaleCalves = motherhoodRecords.filter(record => record.calf.gender === "female").length;
    const aliveCalves = motherhoodRecords.filter(record => record.calf.alive).length;
    const naturalBirths = motherhoodRecords.filter(record => record.calvingType === "natural").length;
    const avgBirthWeight = motherhoodRecords.length > 0 ? 
      Math.round(motherhoodRecords.reduce((sum, record) => sum + record.calf.birthWeight, 0) / motherhoodRecords.length) : 0;
    
    // Registros de este mes
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonth = motherhoodRecords.filter(record => {
      const recordDate = new Date(record.calvingDate);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    }).length;

    return {
      total: totalBirths,
      successful: successfulBirths,
      male: maleCalves,
      female: femaleCalves,
      alive: aliveCalves,
      natural: naturalBirths,
      avgBirthWeight,
      thisMonth
    };
  }, [motherhoodRecords]);

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

  // Componente de tarjeta de vaca
  const CowCard: React.FC<{ cow: Cow }> = ({ cow }) => {
    const age = new Date().getFullYear() - new Date(cow.birthDate).getFullYear();
    
    return (
      <motion.div
        variants={itemVariants}
        className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300"
      >
        {/* Header de la tarjeta */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-bold text-gray-900">{cow.name}</h3>
              <Flower2 className="w-5 h-5 text-pink-600" />
            </div>
            <p className="text-sm text-gray-600">Arete: {cow.earTag}</p>
            <p className="text-sm text-gray-600">Registro: {cow.registrationNumber}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getHealthStatusColor(cow.healthStatus)}`}>
              <Shield className="w-3 h-3 mr-1" />
              {cow.healthStatus === "excellent" ? "Excelente" :
               cow.healthStatus === "good" ? "Buena" :
               cow.healthStatus === "fair" ? "Regular" :
               cow.healthStatus === "poor" ? "Mala" : "Enferma"}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getReproductiveStatusColor(cow.reproductiveStatus)}`}>
              <Heart className="w-3 h-3 mr-1" />
              {cow.reproductiveStatus === "maiden" ? "Vaquilla" :
               cow.reproductiveStatus === "pregnant" ? "Gestante" :
               cow.reproductiveStatus === "lactating" ? "Lactando" :
               cow.reproductiveStatus === "dry" ? "Seca" :
               cow.reproductiveStatus === "open" ? "Vacía" : "Retirada"}
            </span>
          </div>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-xs text-gray-500">Raza</p>
            <p className="text-sm font-medium text-gray-900">{cow.breed}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Edad</p>
            <p className="text-sm font-medium text-gray-900">{age} años</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Peso</p>
            <p className="text-sm font-medium text-gray-900">{cow.weight} kg</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Ubicación</p>
            <p className="text-sm font-medium text-gray-900">{cow.currentLocation.paddock}</p>
          </div>
        </div>

        {/* Información específica según estado */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          {cow.reproductiveStatus === "lactating" && cow.lactation.isLactating && (
            <>
              <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                <Milk className="w-3 h-3 mr-1" />
                Información de Lactancia
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Lactancia:</span>
                  <span className="font-medium ml-1">#{cow.lactation.lactationNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500">Actual:</span>
                  <span className="font-medium ml-1">{cow.lactation.currentMilk}L/día</span>
                </div>
                <div>
                  <span className="text-gray-500">Pico:</span>
                  <span className="font-medium ml-1">{cow.lactation.peakMilk}L/día</span>
                </div>
                <div>
                  <span className="text-gray-500">Total:</span>
                  <span className="font-medium ml-1">{cow.lactation.totalMilk}L</span>
                </div>
              </div>
            </>
          )}

          {cow.reproductiveStatus === "pregnant" && cow.currentPregnancy && (
            <>
              <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                <Baby className="w-3 h-3 mr-1" />
                Información de Gestación
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Toro:</span>
                  <span className="font-medium ml-1">{cow.currentPregnancy.bullName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Día:</span>
                  <span className="font-medium ml-1">{cow.currentPregnancy.gestationDay}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Parto esperado:</span>
                  <span className="font-medium ml-1">
                    {new Date(cow.currentPregnancy.expectedCalvingDate).toLocaleDateString('es-MX')}
                  </span>
                </div>
              </div>
            </>
          )}

          {(cow.reproductiveStatus === "dry" || cow.reproductiveStatus === "open") && (
            <>
              <h4 className="text-xs font-medium text-gray-600 mb-2 flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                Historial Reproductivo
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Partos:</span>
                  <span className="font-medium ml-1">{cow.reproductiveHistory.totalPregnancies}</span>
                </div>
                <div>
                  <span className="text-gray-500">Crías vivas:</span>
                  <span className="font-medium ml-1">{cow.reproductiveHistory.liveCalves}</span>
                </div>
                <div>
                  <span className="text-gray-500">Concepción:</span>
                  <span className="font-medium ml-1">{cow.reproductiveHistory.conception.conceptionRate}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Último parto:</span>
                  <span className="font-medium ml-1">
                    {cow.reproductiveHistory.lastCalvingDate ? 
                      new Date(cow.reproductiveHistory.lastCalvingDate).toLocaleDateString('es-MX') : 
                      "N/A"}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSelectedCow(cow)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => setEditingCow(cow)}
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
            <span className="text-xs text-gray-500">{cow.currentLocation.facility}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Componente de fila de enmadre
  const MotherhoodRow: React.FC<{ record: MotherhoodRecord }> = ({ record }) => (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <Flower2 className="w-5 h-5 text-pink-600" />
          <div>
            <p className="text-sm font-medium text-gray-900">{record.cowName}</p>
            <p className="text-xs text-gray-500">Arete: {record.cowEarTag}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">{record.calf.name}</p>
          <p className="text-xs text-gray-500">Arete: {record.calf.earTag}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {new Date(record.calvingDate).toLocaleDateString('es-MX')}
          </p>
          <p className="text-xs text-gray-500">{record.calvingTime}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCalvingTypeColor(record.calvingType)}`}>
          {record.calvingType === "natural" ? (
            <>
              <Heart className="w-3 h-3 mr-1" />
              Natural
            </>
          ) : record.calvingType === "assisted" ? (
            <>
              <Stethoscope className="w-3 h-3 mr-1" />
              Asistido
            </>
          ) : record.calvingType === "cesarean" ? (
            <>
              <Syringe className="w-3 h-3 mr-1" />
              Cesárea
            </>
          ) : (
            <>
              <Bell className="w-3 h-3 mr-1" />
              Emergencia
            </>
          )}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            record.calf.gender === "male" ? "bg-blue-100 text-blue-800" : "bg-pink-100 text-pink-800"
          }`}>
            {record.calf.gender === "male" ? "♂ Macho" : "♀ Hembra"}
          </span>
          <span className="text-sm text-gray-600">{record.calf.birthWeight} kg</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getHealthStatusColor(record.calf.healthStatus)}`}>
          <Shield className="w-3 h-3 mr-1" />
          {record.calf.healthStatus === "excellent" ? "Excelente" :
           record.calf.healthStatus === "good" ? "Buena" :
           record.calf.healthStatus === "fair" ? "Regular" :
           record.calf.healthStatus === "poor" ? "Mala" : "Crítica"}
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
            onClick={() => setSelectedMotherhood(record)}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => setEditingMotherhood(record)}
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
            <p className="text-gray-600 font-medium">Cargando gestión de vacas...</p>
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
                <Flower2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <AnimatedText>Gestión de Vacas y Enmadre</AnimatedText>
                </h1>
                <p className="text-gray-600 mt-1">
                  Control integral de vacas reproductoras y registros de maternidad
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
              onClick={() => setActiveTab("cows")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "cows"
                  ? "border-[#519a7c] text-[#519a7c]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Flower2 className="w-4 h-4" />
                <span>Vacas</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab("motherhood")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "motherhood"
                  ? "border-[#519a7c] text-[#519a7c]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center space-x-2">
                <Baby className="w-4 h-4" />
                <span>Enmadre</span>
              </div>
            </button>
          </div>
        </motion.div>

        {/* Contenido de tabs */}
        <AnimatePresence mode="wait">
          {activeTab === "cows" && (
            <motion.div
              key="cows"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              {/* Estadísticas de vacas */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">
                <StatCard
                  title="Total Vacas"
                  value={cowStatistics.total}
                  icon={<Flower2 className="w-8 h-8" />}
                  color="hover:bg-pink-50"
                />
                <StatCard
                  title="Activas"
                  value={cowStatistics.active}
                  icon={<UserCheck className="w-8 h-8" />}
                  color="hover:bg-green-50"
                />
                <StatCard
                  title="Gestantes"
                  value={cowStatistics.pregnant}
                  icon={<Baby className="w-8 h-8" />}
                  color="hover:bg-purple-50"
                />
                <StatCard
                  title="Lactando"
                  value={cowStatistics.lactating}
                  icon={<Milk className="w-8 h-8" />}
                  color="hover:bg-blue-50"
                />
                <StatCard
                  title="Peso Promedio"
                  value={`${cowStatistics.avgWeight} kg`}
                  icon={<Scale className="w-8 h-8" />}
                  color="hover:bg-yellow-50"
                />
                <StatCard
                  title="Edad Promedio"
                  value={`${cowStatistics.avgAge} años`}
                  icon={<Clock className="w-8 h-8" />}
                  color="hover:bg-orange-50"
                />
                <StatCard
                  title="Leche Promedio"
                  value={`${cowStatistics.avgMilkProduction}L`}
                  icon={<Droplets className="w-8 h-8" />}
                  color="hover:bg-indigo-50"
                />
              </motion.div>

              {/* Controles para vacas */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, arete, raza..."
                      value={cowFilters.searchTerm}
                      onChange={(e) =>
                        setCowFilters(prev => ({ ...prev, searchTerm: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowCowForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Vaca
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Grid de vacas */}
              <motion.div variants={itemVariants}>
                {filteredCows.length === 0 ? (
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-12 text-center shadow-lg border border-white/20">
                    <Flower2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No se encontraron vacas
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No hay vacas que coincidan con los filtros aplicados.
                    </p>
                    <button
                      onClick={() => setShowCowForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Registrar primera vaca
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCows.map((cow) => (
                      <CowCard key={cow.id} cow={cow} />
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}

          {activeTab === "motherhood" && (
            <motion.div
              key="motherhood"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-6"
            >
              {/* Estadísticas de enmadre */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-6">
                <StatCard
                  title="Total Partos"
                  value={motherhoodStatistics.total}
                  icon={<Baby className="w-8 h-8" />}
                  color="hover:bg-pink-50"
                />
                <StatCard
                  title="Exitosos"
                  value={motherhoodStatistics.successful}
                  icon={<CheckCircle className="w-8 h-8" />}
                  color="hover:bg-green-50"
                />
                <StatCard
                  title="Machos"
                  value={motherhoodStatistics.male}
                  icon={<Crown className="w-8 h-8" />}
                  color="hover:bg-blue-50"
                />
                <StatCard
                  title="Hembras"
                  value={motherhoodStatistics.female}
                  icon={<Flower2 className="w-8 h-8" />}
                  color="hover:bg-purple-50"
                />
                <StatCard
                  title="Crías Vivas"
                  value={motherhoodStatistics.alive}
                  icon={<Heart className="w-8 h-8" />}
                  color="hover:bg-red-50"
                />
                <StatCard
                  title="Naturales"
                  value={motherhoodStatistics.natural}
                  icon={<Star className="w-8 h-8" />}
                  color="hover:bg-yellow-50"
                />
                <StatCard
                  title="Peso Promedio"
                  value={`${motherhoodStatistics.avgBirthWeight} kg`}
                  icon={<Weight className="w-8 h-8" />}
                  color="hover:bg-orange-50"
                />
                <StatCard
                  title="Este Mes"
                  value={motherhoodStatistics.thisMonth}
                  icon={<Calendar className="w-8 h-8" />}
                  color="hover:bg-indigo-50"
                />
              </motion.div>

              {/* Controles para tabla de enmadre */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                  <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por vaca, cría, arete..."
                      value={motherhoodFilters.searchTerm}
                      onChange={(e) =>
                        setMotherhoodFilters(prev => ({ ...prev, searchTerm: e.target.value }))
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowMotherhoodForm(true)}
                      className="inline-flex items-center px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Parto
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Tabla de enmadre */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
                {filteredMotherhoodRecords.length === 0 ? (
                  <div className="p-12 text-center">
                    <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      No se encontraron registros de enmadre
                    </h3>
                    <p className="text-gray-600 mb-6">
                      No hay registros de partos que coincidan con los filtros aplicados.
                    </p>
                    <button
                      onClick={() => setShowMotherhoodForm(true)}
                      className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Registrar primer parto
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vaca
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cría
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha y Hora
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo de Parto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cría Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado
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
                        {filteredMotherhoodRecords.map((record) => (
                          <MotherhoodRow key={record.id} record={record} />
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

export default CowManagement;