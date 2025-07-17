// CowManagement.tsx
// Página para gestión integral de vacas y tabla de enmadre
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
  ChevronDown,
  ChevronUp,
  Users,
  Heart,
  Scale,
  TrendingUp,
  Award,
  Shield,
  UserX,
  UserCheck,
  Baby,
  Milk,
  Droplets,
  Flower2,
  CalendarDays,
} from "lucide-react";

// Tipos e interfaces para gestión de vacas
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

// Interface para registros de enmadre (donde la vaca es la madre)
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

interface CowFilters {
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
  lactationStatus: string[];
  location: string[];
  searchTerm: string;
  activeOnly: boolean;
}

interface MotherhoodFilters {
  dateRange: {
    start: string;
    end: string;
  };
  calvingType: string[];
  calfGender: string[];
  calfHealth: string[];
  cowId: string;
  searchTerm: string;
}

// Componente principal de Gestión de Vacas
const CowManagement: React.FC = () => {
  // Estados principales
  const [cows, setCows] = useState<Cow[]>([]);
  const [motherhoodRecords, setMotherhoodRecords] = useState<MotherhoodRecord[]>([]);
  const [filteredCows, setFilteredCows] = useState<Cow[]>([]);
  const [filteredMotherhoodRecords, setFilteredMotherhoodRecords] = useState<MotherhoodRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"cows" | "motherhood">("cows");
  const [, setShowCowForm] = useState<boolean>(false);
  const [, setShowMotherhoodForm] = useState<boolean>(false);
  const [, setSelectedCow] = useState<Cow | null>(null);
  const [, setSelectedMotherhoodRecord] = useState<MotherhoodRecord | null>(null);
  const [] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Estados para filtros
  const [cowFilters, setCowFilters] = useState<CowFilters>({
    breed: [],
    healthStatus: [],
    reproductiveStatus: [],
    ageRange: { min: 0, max: 20 },
    weightRange: { min: 0, max: 1000 },
    lactationStatus: [],
    location: [],
    searchTerm: "",
    activeOnly: true,
  });

  const [motherhoodFilters, setMotherhoodFilters] = useState<MotherhoodFilters>({
    dateRange: { start: "", end: "" },
    calvingType: [],
    calfGender: [],
    calfHealth: [],
    cowId: "",
    searchTerm: "",
  });

  // Estados para formulario
  const [] = useState<boolean>(false);
  const [, setCowFormData] = useState<Partial<Cow>>({});
  const [, setMotherhoodFormData] = useState<Partial<MotherhoodRecord>>({});

  // Datos de ejemplo para desarrollo
  const mockCows: Cow[] = [
    {
      id: "cow-001",
      name: "Bella Esperanza",
      earTag: "MX-001",
      registrationNumber: "MEX-2020-101",
      breed: "Holstein",
      birthDate: "2020-04-15",
      weight: 650,
      height: 140,
      currentLocation: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Potrero Norte, Rancho San José",
        paddock: "PN-01",
      },
      healthStatus: "excellent",
      reproductiveStatus: "lactating",
      genetics: {
        sireId: "bull-001",
        sireName: "Holstein Champion",
        damId: "cow-dam-001",
        damName: "Estrella Blanca",
        genealogy: ["Holstein Champion", "Estrella Blanca", "Premier Line"],
      },
      reproductiveHistory: {
        totalPregnancies: 3,
        liveCalves: 3,
        lastCalvingDate: "2024-10-15",
        lastBreedingDate: "2024-01-15",
        estrus: {
          lastCycle: "2024-12-01",
          cycleLength: 21,
          irregular: false,
        },
        conception: {
          attempts: 3,
          averageAttempts: 1.3,
          conceptionRate: 85,
        },
      },
      lactation: {
        isLactating: true,
        lactationNumber: 3,
        startDate: "2024-10-16",
        peakMilk: 35,
        currentMilk: 28,
        totalMilk: 8450,
        dryOffDate: "2025-07-15",
      },
      health: {
        lastCheckupDate: "2025-01-01",
        veterinarian: "Dr. García Mendoza",
        bodyConditionScore: 3.5,
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
        diet: "TMR (Total Mixed Ration) + pasto",
        dailyFeed: 22,
        supplements: ["Minerales", "Vitamina E", "Calcio"],
        lastWeightDate: "2025-01-01",
      },
      acquisition: {
        date: "2020-06-20",
        source: "Genética Superior SA",
        cost: 45000,
        purpose: "milk_production",
      },
      currentPregnancy: {
        bullId: "bull-001",
        bullName: "Campeón Imperial",
        breedingDate: "2025-01-10",
        confirmationDate: "2025-02-10",
        expectedCalvingDate: "2025-10-10",
        gestationDay: 35,
      },
      notes: "Vaca de alta producción, excelente temperamento para ordeño",
      photos: [],
      active: true,
      createdAt: "2020-06-20T10:00:00Z",
      updatedAt: "2025-01-17T15:30:00Z",
    },
    {
      id: "cow-002",
      name: "Luna Plateada",
      earTag: "MX-002",
      registrationNumber: "MEX-2019-205",
      breed: "Jersey",
      birthDate: "2019-08-22",
      weight: 450,
      height: 125,
      currentLocation: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Potrero Sur, Rancho San José",
        paddock: "PS-02",
      },
      healthStatus: "good",
      reproductiveStatus: "pregnant",
      genetics: {
        sireId: "bull-jersey-001",
        sireName: "Jersey Star",
        damId: "cow-dam-002",
        damName: "Golden Moon",
        genealogy: ["Jersey Star", "Golden Moon", "Elite Jersey"],
      },
      reproductiveHistory: {
        totalPregnancies: 4,
        liveCalves: 4,
        lastCalvingDate: "2024-03-20",
        lastBreedingDate: "2024-06-15",
        estrus: {
          lastCycle: "2024-06-10",
          cycleLength: 20,
          irregular: false,
        },
        conception: {
          attempts: 4,
          averageAttempts: 1.5,
          conceptionRate: 80,
        },
      },
      lactation: {
        isLactating: false,
        lactationNumber: 4,
        startDate: "2024-03-21",
        peakMilk: 25,
        currentMilk: 0,
        totalMilk: 6200,
        dryOffDate: "2024-12-20",
      },
      health: {
        lastCheckupDate: "2024-12-15",
        veterinarian: "MVZ. Rodríguez López",
        bodyConditionScore: 3.0,
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
            condition: "Mastitis leve",
            treatment: "Antibiótico intramamario",
            veterinarian: "MVZ. Rodríguez López",
          },
        ],
      },
      nutrition: {
        diet: "Concentrado Jersey + heno de alfalfa",
        dailyFeed: 18,
        supplements: ["Mineral específico", "Vitamina A+D"],
        lastWeightDate: "2024-12-15",
      },
      acquisition: {
        date: "2019-10-12",
        source: "Rancho La Esperanza",
        cost: 38000,
        purpose: "milk_production",
      },
      currentPregnancy: {
        bullId: "bull-jersey-001",
        bullName: "Jersey Premium",
        breedingDate: "2024-06-15",
        confirmationDate: "2024-07-15",
        expectedCalvingDate: "2025-03-15",
        gestationDay: 218,
      },
      notes: "Excelente producción de grasa láctea, requiere manejo especial",
      photos: [],
      active: true,
      createdAt: "2019-10-12T14:00:00Z",
      updatedAt: "2025-01-17T15:30:00Z",
    },
  ];

  const mockMotherhoodRecords: MotherhoodRecord[] = [
    {
      id: "motherhood-001",
      cowId: "cow-001",
      cowName: "Bella Esperanza",
      cowEarTag: "MX-001",
      bullId: "bull-001",
      bullName: "Campeón Imperial",
      breedingDate: "2024-01-15",
      breedingType: "artificial",
      pregnancyConfirmDate: "2024-02-15",
      gestationPeriod: 283,
      calvingDate: "2024-10-15",
      calvingTime: "14:30",
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Establo Principal, Rancho San José",
        paddock: "EP-01",
      },
      assistedBy: {
        id: "vet-001",
        name: "Dr. García Mendoza",
        role: "Veterinario",
      },
      calvingType: "natural",
      complications: [],
      calf: {
        id: "calf-001",
        name: "Estrella Nueva",
        earTag: "MX-101",
        gender: "female",
        birthWeight: 38.5,
        healthStatus: "excellent",
        alive: true,
      },
      placentaExpelled: true,
      placentaExpelledTime: "15:15",
      colostrum: {
        received: true,
        quality: "excellent",
        timeReceived: "14:45",
      },
      postCalvingCare: {
        vitamins: true,
        antibiotics: false,
        monitoring: ["temperatura", "apetito", "producción inicial"],
      },
      lactationStart: {
        date: "2024-10-16",
        initialMilk: 18,
      },
      economicImpact: {
        calvingCost: 2500,
        veterinaryCost: 1500,
        expectedValue: 35000,
      },
      notes: "Parto exitoso, ternera hembra de excelente calidad genética",
      success: true,
      createdAt: "2024-10-15T14:30:00Z",
      updatedAt: "2024-10-15T14:30:00Z",
    },
    {
      id: "motherhood-002",
      cowId: "cow-002",
      cowName: "Luna Plateada",
      cowEarTag: "MX-002",
      bullId: "bull-jersey-001",
      bullName: "Jersey Premium",
      breedingDate: "2023-06-20",
      breedingType: "natural",
      pregnancyConfirmDate: "2023-07-20",
      gestationPeriod: 279,
      calvingDate: "2024-03-20",
      calvingTime: "08:15",
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Potrero Sur, Rancho San José",
        paddock: "PS-02",
      },
      assistedBy: {
        id: "tech-001",
        name: "MVZ. Rodríguez López",
        role: "Técnico",
      },
      calvingType: "assisted",
      complications: ["posición anormal"],
      calf: {
        id: "calf-002",
        name: "Rayo Dorado",
        earTag: "MX-102",
        gender: "male",
        birthWeight: 32.2,
        healthStatus: "good",
        alive: true,
      },
      placentaExpelled: true,
      placentaExpelledTime: "09:30",
      colostrum: {
        received: true,
        quality: "good",
        timeReceived: "08:30",
      },
      postCalvingCare: {
        vitamins: true,
        antibiotics: true,
        monitoring: ["temperatura", "apetito", "lochia"],
      },
      lactationStart: {
        date: "2024-03-21",
        initialMilk: 15,
      },
      economicImpact: {
        calvingCost: 3200,
        veterinaryCost: 2100,
        expectedValue: 28000,
      },
      notes: "Parto asistido debido a posición, madre y cría en buen estado",
      success: true,
      createdAt: "2024-03-20T08:15:00Z",
      updatedAt: "2024-03-20T08:15:00Z",
    },
  ];

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Simular carga de datos
        await new Promise(resolve => setTimeout(resolve, 1200));
        setCows(mockCows);
        setMotherhoodRecords(mockMotherhoodRecords);
        setFilteredCows(mockCows);
        setFilteredMotherhoodRecords(mockMotherhoodRecords);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Efecto para aplicar filtros de vacas
  useEffect(() => {
    applyCowFilters();
  }, [cowFilters, cows]);

  // Efecto para aplicar filtros de enmadre
  useEffect(() => {
    applyMotherhoodFilters();
  }, [motherhoodFilters, motherhoodRecords]);

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

    // Filtro por estado de lactancia
    if (cowFilters.lactationStatus.length > 0) {
      filtered = filtered.filter(cow => {
        const lactationStatus = cow.lactation.isLactating ? "lactating" : "dry";
        return cowFilters.lactationStatus.includes(lactationStatus);
      });
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
    if (cowFilters.weightRange.min > 0 || cowFilters.weightRange.max < 1000) {
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
    if (motherhoodFilters.dateRange.start) {
      filtered = filtered.filter(record => record.calvingDate >= motherhoodFilters.dateRange.start);
    }
    if (motherhoodFilters.dateRange.end) {
      filtered = filtered.filter(record => record.calvingDate <= motherhoodFilters.dateRange.end);
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

  // Función para calcular días de gestación actuales
  const calculateGestationDays = (breedingDate: string) => {
    const breeding = new Date(breedingDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - breeding.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Función para obtener estadísticas de vacas
  const cowStatistics = useMemo(() => {
    const total = cows.length;
    const pregnant = cows.filter(c => c.reproductiveStatus === "pregnant").length;
    const lactating = cows.filter(c => c.reproductiveStatus === "lactating").length;
    const dry = cows.filter(c => c.reproductiveStatus === "dry").length;
    const open = cows.filter(c => c.reproductiveStatus === "open").length;
    const avgAge = total > 0 ? 
      Math.round(cows.reduce((sum, c) => sum + calculateAge(c.birthDate), 0) / total * 10) / 10 : 0;
    const avgWeight = total > 0 ? 
      Math.round(cows.reduce((sum, c) => sum + c.weight, 0) / total) : 0;
    const totalCalves = cows.reduce((sum, c) => sum + c.reproductiveHistory.liveCalves, 0);
    const avgConceptionRate = total > 0 ? 
      Math.round(cows.reduce((sum, c) => sum + c.reproductiveHistory.conception.conceptionRate, 0) / total * 10) / 10 : 0;
    const totalMilkProduction = cows.filter(c => c.lactation.isLactating)
      .reduce((sum, c) => sum + (c.lactation.currentMilk || 0), 0);
    const totalInvestment = cows.reduce((sum, c) => sum + c.acquisition.cost, 0);

    return {
      total,
      pregnant,
      lactating,
      dry,
      open,
      avgAge,
      avgWeight,
      totalCalves,
      avgConceptionRate,
      totalMilkProduction,
      totalInvestment,
    };
  }, [cows]);

  // Función para obtener estadísticas de enmadre
  const motherhoodStatistics = useMemo(() => {
    const total = motherhoodRecords.length;
    const successful = motherhoodRecords.filter(m => m.success).length;
    const natural = motherhoodRecords.filter(m => m.calvingType === "natural").length;
    const assisted = motherhoodRecords.filter(m => m.calvingType === "assisted").length;
    const cesarean = motherhoodRecords.filter(m => m.calvingType === "cesarean").length;
    const femaleCalves = motherhoodRecords.filter(m => m.calf.gender === "female").length;
    const maleCalves = motherhoodRecords.filter(m => m.calf.gender === "male").length;
    const avgBirthWeight = total > 0 ? 
      Math.round(motherhoodRecords.reduce((sum, m) => sum + m.calf.birthWeight, 0) / total * 10) / 10 : 0;
    const totalEconomicValue = motherhoodRecords.reduce((sum, m) => sum + m.economicImpact.expectedValue, 0);
    const thisMonth = motherhoodRecords.filter(m => {
      const recordDate = new Date(m.calvingDate);
      const now = new Date();
      return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      total,
      successful,
      natural,
      assisted,
      cesarean,
      femaleCalves,
      maleCalves,
      avgBirthWeight,
      totalEconomicValue,
      thisMonth,
    };
  }, [motherhoodRecords]);

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
      case "sick":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para obtener el color de estado reproductivo
  const getReproductiveStatusColor = (status: string) => {
    switch (status) {
      case "pregnant":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "lactating":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "dry":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "open":
        return "bg-green-100 text-green-800 border-green-200";
      case "maiden":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "retired":
        return "bg-gray-100 text-gray-800 border-gray-200";
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

  // Componente de tarjeta de vaca
  const CowCard: React.FC<{ cow: Cow }> = ({ cow }) => (
    <motion.div
      variants={itemVariants}
      className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-300"
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
             cow.healthStatus === "good" ? "Bueno" :
             cow.healthStatus === "fair" ? "Regular" :
             cow.healthStatus === "poor" ? "Malo" : "Enferma"}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getReproductiveStatusColor(cow.reproductiveStatus)}`}>
            {cow.reproductiveStatus === "pregnant" && <Heart className="w-3 h-3 mr-1" />}
            {cow.reproductiveStatus === "lactating" && <Milk className="w-3 h-3 mr-1" />}
            {cow.reproductiveStatus === "dry" && <Droplets className="w-3 h-3 mr-1" />}
            {cow.reproductiveStatus === "open" && <Heart className="w-3 h-3 mr-1" />}
            {cow.reproductiveStatus === "maiden" && <Baby className="w-3 h-3 mr-1" />}
            <span className="ml-1">
              {cow.reproductiveStatus === "pregnant" ? "Embarazada" :
               cow.reproductiveStatus === "lactating" ? "Lactando" :
               cow.reproductiveStatus === "dry" ? "Seca" :
               cow.reproductiveStatus === "open" ? "Abierta" :
               cow.reproductiveStatus === "maiden" ? "Vaquilla" : "Retirada"}
            </span>
          </span>
        </div>
      </div>

      {/* Información básica */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Raza</p>
          <p className="font-medium">{cow.breed}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Edad</p>
          <p className="font-medium">{calculateAge(cow.birthDate)} años</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Peso</p>
          <p className="font-medium flex items-center">
            <Scale className="w-4 h-4 mr-1 text-gray-500" />
            {cow.weight} kg
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Ubicación</p>
          <p className="font-medium">{cow.currentLocation.paddock}</p>
        </div>
      </div>

      {/* Información reproductiva */}
      <div className="bg-purple-50 rounded-lg p-3 mb-4">
        <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
          <Heart className="w-4 h-4 mr-1 text-purple-600" />
          Historial Reproductivo
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-600">Embarazos:</span>
            <span className="ml-1 font-medium">{cow.reproductiveHistory.totalPregnancies}</span>
          </div>
          <div>
            <span className="text-gray-600">Crías vivas:</span>
            <span className="ml-1 font-medium">{cow.reproductiveHistory.liveCalves}</span>
          </div>
          <div className="col-span-2">
            <span className="text-gray-600">Tasa de concepción:</span>
            <span className="ml-1 font-medium text-green-600">{cow.reproductiveHistory.conception.conceptionRate}%</span>
          </div>
        </div>
      </div>

      {/* Embarazo actual */}
      {cow.currentPregnancy && (
        <div className="bg-pink-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Heart className="w-4 h-4 mr-1 text-pink-600" />
            Embarazo Actual
          </p>
          <div className="text-sm">
            <div>
              <span className="text-gray-600">Toro:</span>
              <span className="ml-1 font-medium">{cow.currentPregnancy.bullName}</span>
            </div>
            <div>
              <span className="text-gray-600">Día de gestación:</span>
              <span className="ml-1 font-medium">{calculateGestationDays(cow.currentPregnancy.breedingDate)}</span>
            </div>
            <div>
              <span className="text-gray-600">Parto esperado:</span>
              <span className="ml-1 font-medium">{formatDate(cow.currentPregnancy.expectedCalvingDate)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Lactancia */}
      {cow.lactation.isLactating && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Milk className="w-4 h-4 mr-1 text-blue-600" />
            Lactancia Actual
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Lactancia #:</span>
              <span className="ml-1 font-medium">{cow.lactation.lactationNumber}</span>
            </div>
            <div>
              <span className="text-gray-600">Producción actual:</span>
              <span className="ml-1 font-medium">{cow.lactation.currentMilk} L/día</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Total producido:</span>
              <span className="ml-1 font-medium">{cow.lactation.totalMilk} L</span>
            </div>
          </div>
        </div>
      )}

      {/* Valor de adquisición */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">Valor de adquisición</p>
        <p className="text-lg font-bold text-[#519a7c]">{formatCurrency(cow.acquisition.cost)}</p>
      </div>

      {/* Ubicación */}
      <div className="flex items-center text-sm text-gray-600 mb-4">
        <MapPin className="w-4 h-4 mr-1" />
        <span>{cow.currentLocation.address}</span>
      </div>

      {/* Estado activo */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-600">Estado:</span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          cow.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {cow.active ? <UserCheck className="w-3 h-3 mr-1" /> : <UserX className="w-3 h-3 mr-1" />}
          {cow.active ? "Activa" : "Inactiva"}
        </span>
      </div>

      {/* Acciones */}
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setSelectedCow(cow)}
          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Ver detalles"
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setCowFormData(cow);
            setShowCowForm(true);
          }}
          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setMotherhoodFilters(prev => ({ ...prev, cowId: cow.id }));
            setActiveTab("motherhood");
          }}
          className="p-2 text-pink-600 hover:bg-pink-50 rounded-lg transition-colors"
          title="Ver enmadres"
        >
          <Baby className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            if (confirm("¿Estás seguro de que quieres eliminar esta vaca?")) {
              setCows(prev => prev.filter(c => c.id !== cow.id));
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

  // Componente de fila de tabla de enmadre
  const MotherhoodRow: React.FC<{ record: MotherhoodRecord }> = ({ record }) => (
    <motion.tr
      variants={itemVariants}
      className="bg-white/95 backdrop-blur-sm hover:bg-gray-50 transition-colors border-b border-gray-200"
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <Flower2 className="w-5 h-5 text-pink-600 mr-2" />
          <div>
            <div className="text-sm font-medium text-gray-900">{record.cowName}</div>
            <div className="text-sm text-gray-500">Arete: {record.cowEarTag}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <span className="text-2xl mr-2">{getGenderIcon(record.calf.gender)}</span>
          <div>
            <div className="text-sm font-medium text-gray-900">{record.calf.name}</div>
            <div className="text-sm text-gray-500">Arete: {record.calf.earTag}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{formatDate(record.calvingDate)}</div>
        <div className="text-sm text-gray-500">{record.calvingTime}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          record.calvingType === "natural" ? "bg-green-100 text-green-800" :
          record.calvingType === "assisted" ? "bg-blue-100 text-blue-800" :
          record.calvingType === "cesarean" ? "bg-orange-100 text-orange-800" :
          "bg-red-100 text-red-800"
        }`}>
          {record.calvingType === "natural" ? "Natural" :
           record.calvingType === "assisted" ? "Asistido" :
           record.calvingType === "cesarean" ? "Cesárea" : "Emergencia"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{record.calf.birthWeight} kg</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthStatusColor(record.calf.healthStatus)}`}>
          {record.calf.healthStatus === "excellent" ? "Excelente" :
           record.calf.healthStatus === "good" ? "Bueno" :
           record.calf.healthStatus === "fair" ? "Regular" :
           record.calf.healthStatus === "poor" ? "Malo" : "Crítico"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{record.location.paddock}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedMotherhoodRecord(record)}
            className="text-blue-600 hover:text-blue-900"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setMotherhoodFormData(record);
              setShowMotherhoodForm(true);
            }}
            className="text-green-600 hover:text-green-900"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (confirm("¿Estás seguro de que quieres eliminar este registro?")) {
                setMotherhoodRecords(prev => prev.filter(m => m.id !== record.id));
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
                Gestión de Vacas
              </h1>
              <p className="text-white/90 text-lg">
                Administración integral de vacas reproductoras y registros de enmadre
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => setShowCowForm(true)}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nueva Vaca
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
              onClick={() => setActiveTab("cows")}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "cows"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Flower2 className="w-5 h-5 inline mr-2" />
              Vacas Reproductoras
            </button>
            <button
              onClick={() => setActiveTab("motherhood")}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "motherhood"
                  ? "bg-white text-gray-900 shadow-lg"
                  : "text-white hover:bg-white/10"
              }`}
            >
              <Baby className="w-5 h-5 inline mr-2" />
              Tabla de Enmadre
            </button>
          </div>
        </motion.div>

        {/* Contenido según el tab activo */}
        <AnimatePresence mode="wait">
          {activeTab === "cows" ? (
            <motion.div
              key="cows"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Estadísticas de vacas */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                <StatCard
                  title="Total de Vacas"
                  value={cowStatistics.total}
                  icon={<Flower2 className="w-8 h-8" />}
                  color="hover:bg-pink-50"
                />
                <StatCard
                  title="Embarazadas"
                  value={cowStatistics.pregnant}
                  icon={<Heart className="w-8 h-8" />}
                  color="hover:bg-purple-50"
                />
                <StatCard
                  title="Lactando"
                  value={cowStatistics.lactating}
                  icon={<Milk className="w-8 h-8" />}
                  color="hover:bg-blue-50"
                />
                <StatCard
                  title="Secas"
                  value={cowStatistics.dry}
                  icon={<Droplets className="w-8 h-8" />}
                  color="hover:bg-yellow-50"
                />
                <StatCard
                  title="Producción Diaria"
                  value={`${cowStatistics.totalMilkProduction} L`}
                  icon={<TrendingUp className="w-8 h-8" />}
                  color="hover:bg-green-50"
                  subtitle="Leche total"
                />
                <StatCard
                  title="Inversión Total"
                  value={formatCurrency(cowStatistics.totalInvestment)}
                  icon={<Award className="w-8 h-8" />}
                  color="hover:bg-orange-50"
                />
              </motion.div>

              {/* Controles de búsqueda y filtros para vacas */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-6">
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

              {/* Lista de vacas */}
              <motion.div variants={itemVariants}>
                {filteredCows.length === 0 ? (
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-white/20 text-center">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCows.map((cow) => (
                      <CowCard key={cow.id} cow={cow} />
                    ))}
                  </div>
                )}
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="motherhood"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Estadísticas de enmadre */}
              <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard
                  title="Total Partos"
                  value={motherhoodStatistics.total}
                  icon={<Baby className="w-8 h-8" />}
                  color="hover:bg-pink-50"
                />
                <StatCard
                  title="Naturales"
                  value={motherhoodStatistics.natural}
                  icon={<Heart className="w-8 h-8" />}
                  color="hover:bg-green-50"
                />
                <StatCard
                  title="Hembras / Machos"
                  value={`${motherhoodStatistics.femaleCalves} / ${motherhoodStatistics.maleCalves}`}
                  icon={<Users className="w-8 h-8" />}
                  color="hover:bg-purple-50"
                />
                <StatCard
                  title="Peso Promedio"
                  value={`${motherhoodStatistics.avgBirthWeight} kg`}
                  icon={<Scale className="w-8 h-8" />}
                  color="hover:bg-blue-50"
                />
                <StatCard
                  title="Este Mes"
                  value={motherhoodStatistics.thisMonth}
                  icon={<CalendarDays className="w-8 h-8" />}
                  color="hover:bg-orange-50"
                />
              </motion.div>

              {/* Controles para tabla de enmadre */}
              <motion.div variants={itemVariants} className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-6">
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
                            Madre
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
                            Peso
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Salud
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
      </motion.div>
    </div>
  );
};

export default CowManagement;