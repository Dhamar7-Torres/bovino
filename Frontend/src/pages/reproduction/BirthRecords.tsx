// BirthRecords.tsx
// CRUD completo para registros de nacimientos bovinos
// Sistema de gestión ganadera - Universidad Juárez Autónoma de Tabasco (UJAT)

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Baby,
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
  Calendar,
  Save,
  ArrowLeft,
  MapPin,
  Info,
  Heart,
  Stethoscope,
  Thermometer,
  Timer,
  Award,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  User,
  TestTube,
  Scale,
  Crown,
  Star,
  Zap,
  Camera,
  Phone,
  Mail,
  Droplets,
  Beef,
  Users,
  Shield,
  Scissors,
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

// Interfaces para registros de nacimientos
interface BirthRecord {
  id: string;
  // Información de la madre
  motherId: string;
  motherName: string;
  motherEarTag: string;
  motherAge: number;
  pregnancyNumber: number;
  gestationDays: number;
  
  // Información del padre
  fatherId?: string;
  fatherName?: string;
  fatherEarTag?: string;
  breedingType: "natural" | "artificial_insemination" | "embryo_transfer";
  
  // Información del nacimiento
  birthDate: string;
  birthTime: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    paddock?: string;
    facility?: string;
  };
  
  // Detalles del parto
  laborDetails: {
    startTime: string;
    endTime: string;
    duration: number; // minutos
    type: "natural" | "assisted" | "cesarean" | "emergency";
    difficulty: "easy" | "moderate" | "difficult" | "complicated";
    complications: BirthComplication[];
    assistedBy: {
      id: string;
      name: string;
      role: "veterinarian" | "technician" | "breeder" | "staff";
      certification?: string;
    };
    equipment: string[];
    medications: BirthMedication[];
  };
  
  // Información del becerro/ternero
  calf: {
    id: string;
    tempEarTag?: string;
    permanentEarTag?: string;
    name?: string;
    gender: "male" | "female";
    birthWeight: number; // kg
    birthHeight?: number; // cm
    healthStatus: "excellent" | "good" | "fair" | "poor" | "critical";
    vitalSigns: {
      heartRate: number; // bpm
      respiratoryRate: number; // por minuto
      temperature: number; // °C
      reflexes: "strong" | "normal" | "weak" | "absent";
    };
    physicalExam: {
      appearance: "normal" | "premature" | "large" | "small";
      coordination: "excellent" | "good" | "poor" | "unable";
      suckingReflex: "strong" | "weak" | "absent";
      umbilicalCord: "normal" | "infected" | "bleeding" | "large";
      eyes: "clear" | "cloudy" | "discharge" | "closed";
      breathing: "normal" | "labored" | "shallow" | "irregular";
    };
    firstStanding: {
      achieved: boolean;
      timeToStand?: number; // minutos después del nacimiento
    };
    firstNursing: {
      achieved: boolean;
      timeToNurse?: number; // minutos después del nacimiento
      colostrumReceived: boolean;
      colostrumSource: "mother" | "supplement" | "bottle" | "tube";
      colostrumAmount?: number; // litros
    };
    identification: {
      earTagApplied: boolean;
      tattoo?: string;
      microchip?: string;
      photos: string[];
    };
    genetics: {
      expectedBreed: string;
      estimatedValue?: number;
      parentageVerified: boolean;
    };
  };
  
  // Condición post-parto de la madre
  motherPostBirth: {
    condition: "excellent" | "good" | "fair" | "poor" | "critical";
    placentaExpelled: boolean;
    placentaExpelledTime?: number; // minutos después del parto
    bleeding: "none" | "minimal" | "moderate" | "severe";
    lacerations: "none" | "minor" | "moderate" | "severe";
    uterineContraction: "excellent" | "good" | "poor";
    milkProduction: "abundant" | "normal" | "low" | "none";
    appetite: "excellent" | "good" | "reduced" | "none";
    mobility: "normal" | "stiff" | "limited" | "unable";
    temperature: number; // °C
    treatmentRequired: boolean;
    medications: PostBirthMedication[];
  };
  
  // Seguimiento y monitoreo
  followUp: {
    nextCheckDate: string;
    veterinaryVisits: VeterinaryVisit[];
    vaccinations: CalfVaccination[];
    weightTracking: WeightRecord[];
    healthIssues: HealthIssue[];
    milestones: DevelopmentMilestone[];
  };
  
  // Información económica
  economics: {
    totalCost: number;
    veterinaryCost: number;
    medicationCost: number;
    facilityCost?: number;
    estimatedValue: number;
    insuranceClaim?: {
      claimed: boolean;
      amount?: number;
      status?: "pending" | "approved" | "denied";
    };
  };
  
  // Factores ambientales
  environmentalFactors: {
    weather: string;
    temperature: number; // °C
    humidity: number; // %
    season: "spring" | "summer" | "fall" | "winter";
    timeOfDay: "early_morning" | "morning" | "afternoon" | "evening" | "night";
  };
  
  notes: string;
  status: "active" | "weaned" | "sold" | "transferred" | "deceased";
  outcome: "successful" | "complicated" | "loss";
  alerts: BirthAlert[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

interface BirthComplication {
  id: string;
  type: "dystocia" | "breach" | "cord_prolapse" | "retained_placenta" | "hemorrhage" | "infection" | "other";
  severity: "mild" | "moderate" | "severe" | "life_threatening";
  description: string;
  treatment: string;
  resolved: boolean;
  impact: "none" | "minor" | "moderate" | "significant";
}

interface BirthMedication {
  id: string;
  name: string;
  dose: string;
  route: "IV" | "IM" | "oral" | "topical" | "epidural";
  time: string;
  veterinarian: string;
  purpose: string;
}

interface PostBirthMedication {
  id: string;
  name: string;
  dose: string;
  frequency: string;
  duration: string;
  purpose: "antibiotic" | "pain_relief" | "hormone" | "vitamin" | "other";
  startDate: string;
  endDate?: string;
}

interface VeterinaryVisit {
  id: string;
  date: string;
  time: string;
  veterinarian: string;
  purpose: "routine" | "health_issue" | "vaccination" | "emergency";
  findings: string;
  treatment: string;
  cost: number;
  nextVisit?: string;
}

interface CalfVaccination {
  id: string;
  vaccine: string;
  date: string;
  veterinarian: string;
  batch: string;
  site: string;
  reactions?: string;
  nextDue?: string;
}

interface WeightRecord {
  id: string;
  date: string;
  weight: number;
  height?: number;
  bodyCondition?: number;
  notes?: string;
}

interface HealthIssue {
  id: string;
  date: string;
  issue: string;
  severity: "mild" | "moderate" | "severe";
  treatment: string;
  resolved: boolean;
  resolvedDate?: string;
}

interface DevelopmentMilestone {
  id: string;
  milestone: string;
  expectedDate: string;
  actualDate?: string;
  achieved: boolean;
  notes?: string;
}

interface BirthAlert {
  id: string;
  type: "health" | "development" | "vaccination" | "weight" | "emergency";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  date: string;
  resolved: boolean;
  resolvedDate?: string;
  resolvedBy?: string;
  actionTaken?: string;
}

interface BirthFilters {
  dateRange: {
    start: string;
    end: string;
  };
  birthType: string[];
  gender: string[];
  healthStatus: string[];
  outcome: string[];
  assistedBy: string[];
  complications: string[];
  status: string[];
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
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<BirthRecord | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar">("grid");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<BirthRecord | null>(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState<BirthFilters>({
    dateRange: {
      start: "",
      end: "",
    },
    birthType: [],
    gender: [],
    healthStatus: [],
    outcome: [],
    assistedBy: [],
    complications: [],
    status: [],
    searchTerm: "",
    weightRange: {
      min: 0,
      max: 100,
    },
  });

  // Estados para formulario
  const [formData, setFormData] = useState<Partial<BirthRecord>>({
    breedingType: "natural",
    pregnancyNumber: 1,
    gestationDays: 283,
    laborDetails: {
      startTime: "",
      endTime: "",
      duration: 0,
      type: "natural",
      difficulty: "easy",
      complications: [],
      assistedBy: {
        id: "",
        name: "",
        role: "staff",
      },
      equipment: [],
      medications: [],
    },
    calf: {
      id: "",
      gender: "male",
      birthWeight: 0,
      healthStatus: "good",
      vitalSigns: {
        heartRate: 120,
        respiratoryRate: 30,
        temperature: 38.5,
        reflexes: "normal",
      },
      physicalExam: {
        appearance: "normal",
        coordination: "good",
        suckingReflex: "strong",
        umbilicalCord: "normal",
        eyes: "clear",
        breathing: "normal",
      },
      firstStanding: {
        achieved: false,
      },
      firstNursing: {
        achieved: false,
        colostrumReceived: false,
        colostrumSource: "mother",
      },
      identification: {
        earTagApplied: false,
        photos: [],
      },
      genetics: {
        expectedBreed: "",
        parentageVerified: false,
      },
    },
    motherPostBirth: {
      condition: "good",
      placentaExpelled: false,
      bleeding: "none",
      lacerations: "none",
      uterineContraction: "good",
      milkProduction: "normal",
      appetite: "good",
      mobility: "normal",
      temperature: 38.5,
      treatmentRequired: false,
      medications: [],
    },
    followUp: {
      nextCheckDate: "",
      veterinaryVisits: [],
      vaccinations: [],
      weightTracking: [],
      healthIssues: [],
      milestones: [],
    },
    economics: {
      totalCost: 0,
      veterinaryCost: 0,
      medicationCost: 0,
      estimatedValue: 0,
    },
    environmentalFactors: {
      weather: "",
      temperature: 25,
      humidity: 60,
      season: "spring",
      timeOfDay: "morning",
    },
    status: "active",
    outcome: "successful",
    alerts: [],
    photos: [],
    location: {
      lat: 17.989,
      lng: -92.247,
      address: "Villahermosa, Tabasco",
    },
  });

  // Datos de ejemplo para desarrollo
  const mockRecords: BirthRecord[] = [
    {
      id: "birth-001",
      motherId: "cow-123",
      motherName: "Bella",
      motherEarTag: "MX-001",
      motherAge: 4,
      pregnancyNumber: 3,
      gestationDays: 285,
      fatherId: "bull-001",
      fatherName: "Campeón",
      fatherEarTag: "T-001",
      breedingType: "natural",
      birthDate: "2025-07-15",
      birthTime: "06:30",
      location: {
        lat: 17.989,
        lng: -92.247,
        address: "Área de Maternidad, Rancho San Miguel",
        paddock: "Corral de Partos",
        facility: "Instalación de Maternidad",
      },
      laborDetails: {
        startTime: "05:45",
        endTime: "06:30",
        duration: 45,
        type: "natural",
        difficulty: "easy",
        complications: [],
        assistedBy: {
          id: "staff-001",
          name: "Miguel Hernández",
          role: "staff",
        },
        equipment: ["Toallas limpias", "Desinfectante", "Termómetro"],
        medications: [],
      },
      calf: {
        id: "calf-001",
        tempEarTag: "TEMP-001",
        gender: "male",
        birthWeight: 42.5,
        birthHeight: 75,
        healthStatus: "excellent",
        vitalSigns: {
          heartRate: 125,
          respiratoryRate: 32,
          temperature: 38.7,
          reflexes: "strong",
        },
        physicalExam: {
          appearance: "normal",
          coordination: "excellent",
          suckingReflex: "strong",
          umbilicalCord: "normal",
          eyes: "clear",
          breathing: "normal",
        },
        firstStanding: {
          achieved: true,
          timeToStand: 25,
        },
        firstNursing: {
          achieved: true,
          timeToNurse: 45,
          colostrumReceived: true,
          colostrumSource: "mother",
          colostrumAmount: 1.5,
        },
        identification: {
          earTagApplied: true,
          photos: ["calf_001_birth.jpg", "calf_001_standing.jpg"],
        },
        genetics: {
          expectedBreed: "Holstein",
          estimatedValue: 15000,
          parentageVerified: true,
        },
      },
      motherPostBirth: {
        condition: "excellent",
        placentaExpelled: true,
        placentaExpelledTime: 30,
        bleeding: "minimal",
        lacerations: "none",
        uterineContraction: "excellent",
        milkProduction: "abundant",
        appetite: "excellent",
        mobility: "normal",
        temperature: 38.4,
        treatmentRequired: false,
        medications: [],
      },
      followUp: {
        nextCheckDate: "2025-07-22",
        veterinaryVisits: [],
        vaccinations: [],
        weightTracking: [
          {
            id: "weight-001",
            date: "2025-07-15",
            weight: 42.5,
            height: 75,
            bodyCondition: 4,
            notes: "Peso al nacer excelente",
          },
        ],
        healthIssues: [],
        milestones: [
          {
            id: "milestone-001",
            milestone: "Primera vez de pie",
            expectedDate: "2025-07-15",
            actualDate: "2025-07-15",
            achieved: true,
            notes: "25 minutos después del nacimiento",
          },
          {
            id: "milestone-002",
            milestone: "Primera vez mamando",
            expectedDate: "2025-07-15",
            actualDate: "2025-07-15",
            achieved: true,
            notes: "45 minutos después del nacimiento",
          },
        ],
      },
      economics: {
        totalCost: 2500,
        veterinaryCost: 1500,
        medicationCost: 0,
        facilityCost: 1000,
        estimatedValue: 15000,
      },
      environmentalFactors: {
        weather: "Despejado, brisa ligera",
        temperature: 24,
        humidity: 65,
        season: "summer",
        timeOfDay: "early_morning",
      },
      notes: "Nacimiento exitoso sin complicaciones. Becerro macho saludable de excelente conformación. Madre en perfectas condiciones post-parto. Calostro recibido adecuadamente.",
      status: "active",
      outcome: "successful",
      alerts: [],
      photos: ["birth_001_scene.jpg", "bella_postbirth.jpg"],
      createdAt: "2025-07-15T06:30:00Z",
      updatedAt: "2025-07-15T08:00:00Z",
    },
    {
      id: "birth-002",
      motherId: "cow-124",
      motherName: "Luna",
      motherEarTag: "MX-002",
      motherAge: 2,
      pregnancyNumber: 1,
      gestationDays: 278,
      fatherId: "bull-002",
      fatherName: "Emperador",
      fatherEarTag: "T-002",
      breedingType: "artificial_insemination",
      birthDate: "2025-07-12",
      birthTime: "14:20",
      location: {
        lat: 17.995,
        lng: -92.255,
        address: "Potrero Sur, Rancho San Miguel",
        paddock: "Potrero 7",
      },
      laborDetails: {
        startTime: "12:30",
        endTime: "14:20",
        duration: 110,
        type: "assisted",
        difficulty: "moderate",
        complications: [
          {
            id: "comp-001",
            type: "dystocia",
            severity: "moderate",
            description: "Posición anormal del becerro, requirió reposicionamiento",
            treatment: "Reposicionamiento manual y tracción asistida",
            resolved: true,
            impact: "minor",
          },
        ],
        assistedBy: {
          id: "vet-001",
          name: "Dr. García",
          role: "veterinarian",
          certification: "MVZ Obstetricia",
        },
        equipment: ["Cadenas obstétricas", "Extractor fetal", "Guantes largos", "Lubricante"],
        medications: [
          {
            id: "med-001",
            name: "Oxitocina",
            dose: "20 UI",
            route: "IM",
            time: "13:45",
            veterinarian: "Dr. García",
            purpose: "Estimular contracciones uterinas",
          },
        ],
      },
      calf: {
        id: "calf-002",
        tempEarTag: "TEMP-002",
        gender: "female",
        birthWeight: 38.0,
        birthHeight: 70,
        healthStatus: "good",
        vitalSigns: {
          heartRate: 115,
          respiratoryRate: 28,
          temperature: 38.3,
          reflexes: "normal",
        },
        physicalExam: {
          appearance: "normal",
          coordination: "good",
          suckingReflex: "normal",
          umbilicalCord: "normal",
          eyes: "clear",
          breathing: "normal",
        },
        firstStanding: {
          achieved: true,
          timeToStand: 65,
        },
        firstNursing: {
          achieved: true,
          timeToNurse: 120,
          colostrumReceived: true,
          colostrumSource: "mother",
          colostrumAmount: 1.2,
        },
        identification: {
          earTagApplied: true,
          photos: ["calf_002_birth.jpg"],
        },
        genetics: {
          expectedBreed: "Holstein",
          estimatedValue: 12000,
          parentageVerified: true,
        },
      },
      motherPostBirth: {
        condition: "good",
        placentaExpelled: true,
        placentaExpelledTime: 90,
        bleeding: "moderate",
        lacerations: "minor",
        uterineContraction: "good",
        milkProduction: "normal",
        appetite: "good",
        mobility: "normal",
        temperature: 38.8,
        treatmentRequired: true,
        medications: [
          {
            id: "postmed-001",
            name: "Antibiótico",
            dose: "10ml",
            frequency: "Cada 12 horas",
            duration: "5 días",
            purpose: "antibiotic",
            startDate: "2025-07-12",
            endDate: "2025-07-17",
          },
        ],
      },
      followUp: {
        nextCheckDate: "2025-07-19",
        veterinaryVisits: [
          {
            id: "visit-001",
            date: "2025-07-13",
            time: "09:00",
            veterinarian: "Dr. García",
            purpose: "routine",
            findings: "Madre recuperándose bien, becerra activa",
            treatment: "Continuar antibiótico, monitoreo diario",
            cost: 800,
            nextVisit: "2025-07-19",
          },
        ],
        vaccinations: [],
        weightTracking: [
          {
            id: "weight-002",
            date: "2025-07-12",
            weight: 38.0,
            height: 70,
            bodyCondition: 3,
            notes: "Peso al nacer normal para vaquillona",
          },
        ],
        healthIssues: [],
        milestones: [],
      },
      economics: {
        totalCost: 4500,
        veterinaryCost: 3000,
        medicationCost: 500,
        facilityCost: 1000,
        estimatedValue: 12000,
      },
      environmentalFactors: {
        weather: "Nublado, temperatura alta",
        temperature: 32,
        humidity: 80,
        season: "summer",
        timeOfDay: "afternoon",
      },
      notes: "Primer parto de vaquillona joven. Distocia leve resuelta con asistencia veterinaria. Becerra hembra saludable. Madre requiere monitoreo por tratamiento antibiótico.",
      status: "active",
      outcome: "complicated",
      alerts: [
        {
          id: "alert-001",
          type: "health",
          severity: "medium",
          title: "Tratamiento Antibiótico",
          message: "Completar curso de antibióticos para prevenir infección post-parto",
          date: "2025-07-12T14:20:00Z",
          resolved: false,
        },
      ],
      photos: ["birth_002_assisted.jpg", "luna_postbirth.jpg"],
      createdAt: "2025-07-12T14:20:00Z",
      updatedAt: "2025-07-13T09:00:00Z",
    },
    {
      id: "birth-003",
      motherId: "cow-125",
      motherName: "Esperanza",
      motherEarTag: "MX-003",
      motherAge: 6,
      pregnancyNumber: 5,
      gestationDays: 290,
      fatherId: "bull-003",
      fatherName: "Titán",
      fatherEarTag: "T-003",
      breedingType: "embryo_transfer",
      birthDate: "2025-07-10",
      birthTime: "03:15",
      location: {
        lat: 17.992,
        lng: -92.250,
        address: "Instalación de Emergencia, Rancho San Miguel",
        facility: "Sala de Cirugía Veterinaria",
      },
      laborDetails: {
        startTime: "00:30",
        endTime: "03:15",
        duration: 165,
        type: "cesarean",
        difficulty: "complicated",
        complications: [
          {
            id: "comp-002",
            type: "dystocia",
            severity: "severe",
            description: "Becerro excesivamente grande, imposible parto natural",
            treatment: "Cesárea de emergencia",
            resolved: true,
            impact: "significant",
          },
          {
            id: "comp-003",
            type: "hemorrhage",
            severity: "moderate",
            description: "Sangrado durante la cirugía",
            treatment: "Control hemostático y transfusión",
            resolved: true,
            impact: "moderate",
          },
        ],
        assistedBy: {
          id: "vet-001",
          name: "Dr. García",
          role: "veterinarian",
          certification: "MVZ Cirugía",
        },
        equipment: ["Equipo quirúrgico completo", "Anestesia", "Monitor vital", "Sutura"],
        medications: [
          {
            id: "med-002",
            name: "Xilacina",
            dose: "0.5mg/kg",
            route: "IV",
            time: "01:00",
            veterinarian: "Dr. García",
            purpose: "Anestesia",
          },
          {
            id: "med-003",
            name: "Ketamina",
            dose: "2mg/kg",
            route: "IV",
            time: "01:05",
            veterinarian: "Dr. García",
            purpose: "Anestesia general",
          },
        ],
      },
      calf: {
        id: "calf-003",
        tempEarTag: "TEMP-003",
        gender: "male",
        birthWeight: 55.0,
        birthHeight: 85,
        healthStatus: "fair",
        vitalSigns: {
          heartRate: 100,
          respiratoryRate: 24,
          temperature: 38.0,
          reflexes: "weak",
        },
        physicalExam: {
          appearance: "large",
          coordination: "poor",
          suckingReflex: "weak",
          umbilicalCord: "large",
          eyes: "clear",
          breathing: "shallow",
        },
        firstStanding: {
          achieved: true,
          timeToStand: 180,
        },
        firstNursing: {
          achieved: true,
          timeToNurse: 300,
          colostrumReceived: true,
          colostrumSource: "supplement",
          colostrumAmount: 2.0,
        },
        identification: {
          earTagApplied: false,
          photos: ["calf_003_cesarean.jpg"],
        },
        genetics: {
          expectedBreed: "Angus x Holstein",
          estimatedValue: 18000,
          parentageVerified: true,
        },
      },
      motherPostBirth: {
        condition: "fair",
        placentaExpelled: false,
        bleeding: "moderate",
        lacerations: "severe",
        uterineContraction: "poor",
        milkProduction: "low",
        appetite: "reduced",
        mobility: "limited",
        temperature: 39.2,
        treatmentRequired: true,
        medications: [
          {
            id: "postmed-002",
            name: "Antibiótico de amplio espectro",
            dose: "20ml",
            frequency: "Cada 8 horas",
            duration: "10 días",
            purpose: "antibiotic",
            startDate: "2025-07-10",
            endDate: "2025-07-20",
          },
          {
            id: "postmed-003",
            name: "Analgésico",
            dose: "5ml",
            frequency: "Cada 12 horas",
            duration: "7 días",
            purpose: "pain_relief",
            startDate: "2025-07-10",
            endDate: "2025-07-17",
          },
        ],
      },
      followUp: {
        nextCheckDate: "2025-07-11",
        veterinaryVisits: [
          {
            id: "visit-002",
            date: "2025-07-10",
            time: "15:00",
            veterinarian: "Dr. García",
            purpose: "emergency",
            findings: "Madre estable post-cirugía, becerro requiere monitoreo intensivo",
            treatment: "Cuidados intensivos, alimentación asistida",
            cost: 8000,
            nextVisit: "2025-07-11",
          },
        ],
        vaccinations: [],
        weightTracking: [
          {
            id: "weight-003",
            date: "2025-07-10",
            weight: 55.0,
            height: 85,
            bodyCondition: 2,
            notes: "Becerro grande, requiere monitoreo especial",
          },
        ],
        healthIssues: [
          {
            id: "health-001",
            date: "2025-07-10",
            issue: "Dificultad respiratoria leve",
            severity: "mild",
            treatment: "Oxígeno suplementario",
            resolved: true,
            resolvedDate: "2025-07-11",
          },
        ],
        milestones: [],
      },
      economics: {
        totalCost: 15000,
        veterinaryCost: 12000,
        medicationCost: 2000,
        facilityCost: 1000,
        estimatedValue: 18000,
        insuranceClaim: {
          claimed: true,
          amount: 10000,
          status: "pending",
        },
      },
      environmentalFactors: {
        weather: "Tormenta nocturna",
        temperature: 20,
        humidity: 90,
        season: "summer",
        timeOfDay: "night",
      },
      notes: "Cesárea de emergencia por becerro excesivamente grande. Cirugía exitosa pero complicada. Madre requiere cuidados intensivos post-quirúrgicos. Becerro grande pero con signos vitales estables.",
      status: "active",
      outcome: "complicated",
      alerts: [
        {
          id: "alert-002",
          type: "health",
          severity: "high",
          title: "Cuidados Post-Quirúrgicos",
          message: "Monitoreo intensivo requerido para madre e hijo",
          date: "2025-07-10T03:15:00Z",
          resolved: false,
        },
        {
          id: "alert-003",
          type: "development",
          severity: "medium",
          title: "Desarrollo Becerro",
          message: "Becerro grande requiere seguimiento especial de desarrollo",
          date: "2025-07-10T03:15:00Z",
          resolved: false,
        },
      ],
      photos: ["birth_003_surgery.jpg", "esperanza_recovery.jpg", "calf_003_icu.jpg"],
      createdAt: "2025-07-10T03:15:00Z",
      updatedAt: "2025-07-10T15:00:00Z",
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
        record.motherName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.motherEarTag.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.fatherName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.calf.tempEarTag?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.laborDetails.assistedBy.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo de parto
    if (filters.birthType.length > 0) {
      filtered = filtered.filter(record => filters.birthType.includes(record.laborDetails.type));
    }

    // Filtro por género
    if (filters.gender.length > 0) {
      filtered = filtered.filter(record => filters.gender.includes(record.calf.gender));
    }

    // Filtro por estado de salud
    if (filters.healthStatus.length > 0) {
      filtered = filtered.filter(record => filters.healthStatus.includes(record.calf.healthStatus));
    }

    // Filtro por resultado
    if (filters.outcome.length > 0) {
      filtered = filtered.filter(record => filters.outcome.includes(record.outcome));
    }

    // Filtro por estado
    if (filters.status.length > 0) {
      filtered = filtered.filter(record => filters.status.includes(record.status));
    }

    // Filtro por complicaciones
    if (filters.complications.length > 0) {
      filtered = filtered.filter(record => {
        if (filters.complications.includes("none") && record.laborDetails.complications.length === 0) return true;
        if (filters.complications.includes("has_complications") && record.laborDetails.complications.length > 0) return true;
        return record.laborDetails.complications.some(comp => filters.complications.includes(comp.type));
      });
    }

    // Filtro por rango de fechas
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.birthDate);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    // Filtro por rango de peso
    if (filters.weightRange.min > 0 || filters.weightRange.max < 100) {
      filtered = filtered.filter(record => 
        record.calf.birthWeight >= filters.weightRange.min && 
        record.calf.birthWeight <= filters.weightRange.max
      );
    }

    setFilteredRecords(filtered);
  }, [records, filters]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = records.length;
    const males = records.filter(r => r.calf.gender === "male").length;
    const females = records.filter(r => r.calf.gender === "female").length;
    const natural = records.filter(r => r.laborDetails.type === "natural").length;
    const assisted = records.filter(r => r.laborDetails.type === "assisted").length;
    const cesarean = records.filter(r => r.laborDetails.type === "cesarean").length;
    const successful = records.filter(r => r.outcome === "successful").length;
    const withComplications = records.filter(r => r.laborDetails.complications.length > 0).length;
    const averageWeight = records.length > 0 ? 
      (records.reduce((sum, r) => sum + r.calf.birthWeight, 0) / records.length).toFixed(1) : "0";

    return {
      total,
      males,
      females,
      natural,
      assisted,
      cesarean,
      successful,
      withComplications,
      averageWeight: `${averageWeight} kg`,
      successRate: total > 0 ? `${((successful / total) * 100).toFixed(1)}%` : "0%",
    };
  }, [records]);

  // Funciones CRUD

  // Crear nuevo registro
  const handleCreate = (data: Partial<BirthRecord>) => {
    const newRecord: BirthRecord = {
      id: `birth-${Date.now()}`,
      motherId: data.motherId || "",
      motherName: data.motherName || "",
      motherEarTag: data.motherEarTag || "",
      motherAge: data.motherAge || 0,
      pregnancyNumber: data.pregnancyNumber || 1,
      gestationDays: data.gestationDays || 283,
      fatherId: data.fatherId,
      fatherName: data.fatherName,
      fatherEarTag: data.fatherEarTag,
      breedingType: data.breedingType || "natural",
      birthDate: data.birthDate || new Date().toISOString().split('T')[0],
      birthTime: data.birthTime || new Date().toTimeString().slice(0, 5),
      location: data.location || {
        lat: 17.989,
        lng: -92.247,
        address: "Villahermosa, Tabasco",
      },
      laborDetails: data.laborDetails || {
        startTime: "",
        endTime: "",
        duration: 0,
        type: "natural",
        difficulty: "easy",
        complications: [],
        assistedBy: {
          id: "",
          name: "",
          role: "staff",
        },
        equipment: [],
        medications: [],
      },
      calf: data.calf || {
        id: `calf-${Date.now()}`,
        gender: "male",
        birthWeight: 0,
        healthStatus: "good",
        vitalSigns: {
          heartRate: 120,
          respiratoryRate: 30,
          temperature: 38.5,
          reflexes: "normal",
        },
        physicalExam: {
          appearance: "normal",
          coordination: "good",
          suckingReflex: "strong",
          umbilicalCord: "normal",
          eyes: "clear",
          breathing: "normal",
        },
        firstStanding: {
          achieved: false,
        },
        firstNursing: {
          achieved: false,
          colostrumReceived: false,
          colostrumSource: "mother",
        },
        identification: {
          earTagApplied: false,
          photos: [],
        },
        genetics: {
          expectedBreed: "",
          parentageVerified: false,
        },
      },
      motherPostBirth: data.motherPostBirth || {
        condition: "good",
        placentaExpelled: false,
        bleeding: "none",
        lacerations: "none",
        uterineContraction: "good",
        milkProduction: "normal",
        appetite: "good",
        mobility: "normal",
        temperature: 38.5,
        treatmentRequired: false,
        medications: [],
      },
      followUp: data.followUp || {
        nextCheckDate: "",
        veterinaryVisits: [],
        vaccinations: [],
        weightTracking: [],
        healthIssues: [],
        milestones: [],
      },
      economics: data.economics || {
        totalCost: 0,
        veterinaryCost: 0,
        medicationCost: 0,
        estimatedValue: 0,
      },
      environmentalFactors: data.environmentalFactors || {
        weather: "",
        temperature: 25,
        humidity: 60,
        season: "spring",
        timeOfDay: "morning",
      },
      notes: data.notes || "",
      status: data.status || "active",
      outcome: data.outcome || "successful",
      alerts: data.alerts || [],
      photos: data.photos || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRecords(prev => [newRecord, ...prev]);
    setShowForm(false);
    resetForm();
  };

  // Actualizar registro existente
  const handleUpdate = (id: string, data: Partial<BirthRecord>) => {
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
    if (window.confirm("¿Está seguro de que desea eliminar este registro de nacimiento?")) {
      setRecords(prev => prev.filter(record => record.id !== id));
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      breedingType: "natural",
      pregnancyNumber: 1,
      gestationDays: 283,
      laborDetails: {
        startTime: "",
        endTime: "",
        duration: 0,
        type: "natural",
        difficulty: "easy",
        complications: [],
        assistedBy: {
          id: "",
          name: "",
          role: "staff",
        },
        equipment: [],
        medications: [],
      },
      calf: {
        id: "",
        gender: "male",
        birthWeight: 0,
        healthStatus: "good",
        vitalSigns: {
          heartRate: 120,
          respiratoryRate: 30,
          temperature: 38.5,
          reflexes: "normal",
        },
        physicalExam: {
          appearance: "normal",
          coordination: "good",
          suckingReflex: "strong",
          umbilicalCord: "normal",
          eyes: "clear",
          breathing: "normal",
        },
        firstStanding: {
          achieved: false,
        },
        firstNursing: {
          achieved: false,
          colostrumReceived: false,
          colostrumSource: "mother",
        },
        identification: {
          earTagApplied: false,
          photos: [],
        },
        genetics: {
          expectedBreed: "",
          parentageVerified: false,
        },
      },
      motherPostBirth: {
        condition: "good",
        placentaExpelled: false,
        bleeding: "none",
        lacerations: "none",
        uterineContraction: "good",
        milkProduction: "normal",
        appetite: "good",
        mobility: "normal",
        temperature: 38.5,
        treatmentRequired: false,
        medications: [],
      },
      followUp: {
        nextCheckDate: "",
        veterinaryVisits: [],
        vaccinations: [],
        weightTracking: [],
        healthIssues: [],
        milestones: [],
      },
      economics: {
        totalCost: 0,
        veterinaryCost: 0,
        medicationCost: 0,
        estimatedValue: 0,
      },
      environmentalFactors: {
        weather: "",
        temperature: 25,
        humidity: 60,
        season: "spring",
        timeOfDay: "morning",
      },
      status: "active",
      outcome: "successful",
      alerts: [],
      photos: [],
      location: {
        lat: 17.989,
        lng: -92.247,
        address: "Villahermosa, Tabasco",
      },
    });
  };

  // Función para obtener color del estado de salud
  const getHealthColor = (health: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800 border-green-200",
      good: "bg-blue-100 text-blue-800 border-blue-200",
      fair: "bg-yellow-100 text-yellow-800 border-yellow-200",
      poor: "bg-orange-100 text-orange-800 border-orange-200",
      critical: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[health as keyof typeof colors] || colors.good;
  };

  // Función para obtener color del resultado
  const getOutcomeColor = (outcome: string) => {
    const colors = {
      successful: "bg-green-100 text-green-800 border-green-200",
      complicated: "bg-yellow-100 text-yellow-800 border-yellow-200",
      loss: "bg-red-100 text-red-800 border-red-200",
    };
    return colors[outcome as keyof typeof colors] || colors.successful;
  };

  // Función para obtener color del tipo de parto
  const getBirthTypeColor = (type: string) => {
    const colors = {
      natural: "bg-green-100 text-green-800 border-green-200",
      assisted: "bg-yellow-100 text-yellow-800 border-yellow-200",
      cesarean: "bg-red-100 text-red-800 border-red-200",
      emergency: "bg-purple-100 text-purple-800 border-purple-200",
    };
    return colors[type as keyof typeof colors] || colors.natural;
  };

  // Función para obtener icono de género
  const getGenderIcon = (gender: string) => {
    return gender === "male" ? (
      <Crown className="w-4 h-4 text-blue-600" />
    ) : (
      <Heart className="w-4 h-4 text-pink-600" />
    );
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
            <p className="text-gray-600 font-medium">Cargando registros de nacimientos...</p>
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
                <Baby className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  <AnimatedText>Registros de Nacimientos</AnimatedText>
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestión completa de nacimientos y seguimiento neonatal bovino
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
                <span>Nuevo Nacimiento</span>
              </motion.button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
            {[
              { label: "Total", value: stats.total, icon: Activity, color: "text-blue-600" },
              { label: "Machos", value: stats.males, icon: Crown, color: "text-blue-600" },
              { label: "Hembras", value: stats.females, icon: Heart, color: "text-pink-600" },
              { label: "Naturales", value: stats.natural, icon: CheckCircle, color: "text-green-600" },
              { label: "Peso Promedio", value: stats.averageWeight, icon: Scale, color: "text-purple-600" },
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
                      placeholder="Madre, padre, asistente..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filtro de tipo de parto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Parto
                  </label>
                  <select
                    multiple
                    value={filters.birthType}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, birthType: values }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  >
                    <option value="natural">Natural</option>
                    <option value="assisted">Asistido</option>
                    <option value="cesarean">Cesárea</option>
                    <option value="emergency">Emergencia</option>
                  </select>
                </div>

                {/* Filtro de género */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  <select
                    multiple
                    value={filters.gender}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, gender: values }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  >
                    <option value="male">Macho</option>
                    <option value="female">Hembra</option>
                  </select>
                </div>

                {/* Filtro de resultado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resultado
                  </label>
                  <select
                    multiple
                    value={filters.outcome}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, outcome: values }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  >
                    <option value="successful">Exitoso</option>
                    <option value="complicated">Complicado</option>
                    <option value="loss">Pérdida</option>
                  </select>
                </div>

                {/* Filtro de fecha */}
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
              </div>

              {/* Botones de control de filtros */}
              <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setFilters({
                    dateRange: { start: "", end: "" },
                    birthType: [],
                    gender: [],
                    healthStatus: [],
                    outcome: [],
                    assistedBy: [],
                    complications: [],
                    status: [],
                    searchTerm: "",
                    weightRange: { min: 0, max: 100 },
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
                Mostrando {filteredRecords.length} de {records.length} nacimientos
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
                <button
                  onClick={() => setViewMode("calendar")}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                    viewMode === "calendar"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Calendario
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

        {/* Lista de registros - Vista Grid */}
        {viewMode === "grid" && (
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
                        <Baby className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{record.motherName}</h3>
                        <p className="text-white/80 text-sm">Arete: {record.motherEarTag}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBirthTypeColor(record.laborDetails.type)}`}>
                        {record.laborDetails.type === "natural" && "Natural"}
                        {record.laborDetails.type === "assisted" && "Asistido"}
                        {record.laborDetails.type === "cesarean" && "Cesárea"}
                        {record.laborDetails.type === "emergency" && "Emergencia"}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getOutcomeColor(record.outcome)}`}>
                        {record.outcome === "successful" && "Exitoso"}
                        {record.outcome === "complicated" && "Complicado"}
                        {record.outcome === "loss" && "Pérdida"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-4 space-y-4">
                  {/* Información del nacimiento */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Fecha:</p>
                      <p className="text-gray-900">{new Date(record.birthDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Hora:</p>
                      <p className="text-gray-900">{record.birthTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Gestación:</p>
                      <p className="text-gray-900">{record.gestationDays} días</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Gestación #:</p>
                      <p className="text-gray-900">{record.pregnancyNumber}</p>
                    </div>
                  </div>

                  {/* Información del becerro */}
                  <div className="bg-blue-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      {getGenderIcon(record.calf.gender)}
                      <span className="ml-2">
                        Becerr{record.calf.gender === "male" ? "o" : "a"}
                      </span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Peso:</p>
                        <p className="font-bold text-[#519a7c]">{record.calf.birthWeight} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Salud:</p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(record.calf.healthStatus)}`}>
                          {record.calf.healthStatus === "excellent" && "Excelente"}
                          {record.calf.healthStatus === "good" && "Bueno"}
                          {record.calf.healthStatus === "fair" && "Regular"}
                          {record.calf.healthStatus === "poor" && "Malo"}
                          {record.calf.healthStatus === "critical" && "Crítico"}
                        </span>
                      </div>
                      {record.calf.tempEarTag && (
                        <div className="col-span-2">
                          <p className="text-gray-600">Arete temporal:</p>
                          <p className="font-medium">{record.calf.tempEarTag}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información del padre */}
                  {record.fatherName && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Crown className="w-4 h-4 mr-2 text-purple-600" />
                        Información del Padre
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Nombre:</span> {record.fatherName}</p>
                        <p><span className="text-gray-600">Arete:</span> {record.fatherEarTag}</p>
                        <p><span className="text-gray-600">Tipo:</span> 
                          <span className="ml-1">
                            {record.breedingType === "natural" && "Natural"}
                            {record.breedingType === "artificial_insemination" && "IA"}
                            {record.breedingType === "embryo_transfer" && "Transferencia"}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Complicaciones */}
                  {record.laborDetails.complications.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                        Complicaciones ({record.laborDetails.complications.length})
                      </h4>
                      <div className="space-y-2">
                        {record.laborDetails.complications.slice(0, 2).map((comp) => (
                          <div key={comp.id} className="text-sm">
                            <p className="font-medium text-red-800">{comp.type}</p>
                            <p className="text-red-700">{comp.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estado post-parto de la madre */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-green-600" />
                      Estado Post-Parto
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Condición:</p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(record.motherPostBirth.condition)}`}>
                          {record.motherPostBirth.condition === "excellent" && "Excelente"}
                          {record.motherPostBirth.condition === "good" && "Bueno"}
                          {record.motherPostBirth.condition === "fair" && "Regular"}
                          {record.motherPostBirth.condition === "poor" && "Malo"}
                          {record.motherPostBirth.condition === "critical" && "Crítico"}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-600">Placenta:</p>
                        <p className={`font-medium ${record.motherPostBirth.placentaExpelled ? "text-green-600" : "text-red-600"}`}>
                          {record.motherPostBirth.placentaExpelled ? "Expulsada" : "Retenida"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Asistencia */}
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2 text-yellow-600" />
                      Asistencia
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Asistido por:</span> {record.laborDetails.assistedBy.name}</p>
                      <p><span className="text-gray-600">Duración:</span> {record.laborDetails.duration} minutos</p>
                      <p><span className="text-gray-600">Dificultad:</span> 
                        <span className={`ml-1 font-medium ${
                          record.laborDetails.difficulty === "easy" ? "text-green-600" :
                          record.laborDetails.difficulty === "moderate" ? "text-yellow-600" :
                          record.laborDetails.difficulty === "difficult" ? "text-orange-600" :
                          "text-red-600"
                        }`}>
                          {record.laborDetails.difficulty === "easy" && "Fácil"}
                          {record.laborDetails.difficulty === "moderate" && "Moderada"}
                          {record.laborDetails.difficulty === "difficult" && "Difícil"}
                          {record.laborDetails.difficulty === "complicated" && "Complicada"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{record.location.address}</span>
                  </div>

                  {/* Costos */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-[#519a7c]">
                        ${record.economics.totalCost.toLocaleString()}
                      </span>
                      <p className="text-xs text-gray-600">Costo total</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-green-600">
                        ${record.economics.estimatedValue.toLocaleString()}
                      </span>
                      <p className="text-xs text-gray-600">Valor estimado</p>
                    </div>
                  </div>

                  {/* Alertas activas */}
                  {record.alerts.filter(alert => !alert.resolved).length > 0 && (
                    <div className="bg-orange-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                        Alertas Activas ({record.alerts.filter(alert => !alert.resolved).length})
                      </h4>
                      <div className="space-y-1">
                        {record.alerts.filter(alert => !alert.resolved).slice(0, 2).map((alert) => (
                          <div key={alert.id} className="text-sm">
                            <p className="font-medium text-orange-800">{alert.title}</p>
                            <p className="text-orange-700">{alert.message}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notas */}
                  {record.notes && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                        <FileText className="w-4 h-4 mr-2 text-gray-600" />
                        Notas
                      </h4>
                      <p className="text-sm text-gray-700 line-clamp-3">{record.notes}</p>
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
        )}

        {/* Vista de lista simplificada para no exceder el límite */}
        {viewMode === "list" && (
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
            variants={itemVariants}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium">Madre</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Fecha</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Tipo</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Becerro</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Peso</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Resultado</th>
                    <th className="px-6 py-4 text-center text-sm font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{record.motherName}</p>
                          <p className="text-sm text-gray-600">{record.motherEarTag}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{new Date(record.birthDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getBirthTypeColor(record.laborDetails.type)}`}>
                          {record.laborDetails.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getGenderIcon(record.calf.gender)}
                          <span className="ml-2">{record.calf.gender === "male" ? "Macho" : "Hembra"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-[#519a7c]">{record.calf.birthWeight} kg</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(record.outcome)}`}>
                          {record.outcome}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button onClick={() => setSelectedRecord(record)}>
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => { setEditingRecord(record); setFormData(record); setShowForm(true); }}>
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(record.id)}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Vista de calendario simplificada */}
        {viewMode === "calendar" && (
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
            variants={itemVariants}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Calendario de Nacimientos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords
                .sort((a, b) => new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime())
                .slice(0, 12)
                .map((record) => (
                  <div key={record.id} className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border-l-4 border-[#519a7c]">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{record.motherName}</h3>
                      {getGenderIcon(record.calf.gender)}
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium">Fecha:</span> {new Date(record.birthDate).toLocaleDateString()}</p>
                      <p><span className="font-medium">Peso:</span> {record.calf.birthWeight} kg</p>
                      <p><span className="font-medium">Tipo:</span> {record.laborDetails.type}</p>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {/* Formulario y modales simplificados por límite de caracteres */}
        <AnimatePresence>
          {showForm && (
            <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <motion.div className="bg-white rounded-2xl w-full max-w-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{editingRecord ? "Editar" : "Nuevo"} Nacimiento</h2>
                  <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
                </div>
                {/* Formulario simplificado */}
                <div className="space-y-4">
                  <input
                    placeholder="Nombre de la madre"
                    value={formData.motherName || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="date"
                    value={formData.birthDate || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                    className="w-full p-2 border rounded"
                  />
                  <input
                    type="number"
                    placeholder="Peso del becerro (kg)"
                    value={formData.calf?.birthWeight || ""}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      calf: { ...prev.calf!, birthWeight: parseFloat(e.target.value) || 0 }
                    }))}
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 bg-gray-300 rounded"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        if (editingRecord) {
                          handleUpdate(editingRecord.id, formData);
                        } else {
                          handleCreate(formData);
                        }
                      }}
                      className="px-4 py-2 bg-[#519a7c] text-white rounded"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de detalles simplificado */}
        <AnimatePresence>
          {selectedRecord && (
            <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
              <motion.div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">{selectedRecord.motherName} - Nacimiento</h2>
                  <button onClick={() => setSelectedRecord(null)}><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <p><strong>Fecha:</strong> {new Date(selectedRecord.birthDate).toLocaleDateString()}</p>
                  <p><strong>Peso becerro:</strong> {selectedRecord.calf.birthWeight} kg</p>
                  <p><strong>Género:</strong> {selectedRecord.calf.gender === "male" ? "Macho" : "Hembra"}</p>
                  <p><strong>Tipo de parto:</strong> {selectedRecord.laborDetails.type}</p>
                  <p><strong>Asistido por:</strong> {selectedRecord.laborDetails.assistedBy.name}</p>
                  {selectedRecord.notes && <p><strong>Notas:</strong> {selectedRecord.notes}</p>}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mensaje cuando no hay registros */}
        {filteredRecords.length === 0 && !isLoading && (
          <motion.div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron nacimientos</h3>
            <p className="text-gray-600 mb-6">No hay registros que coincidan con los filtros aplicados.</p>
            <button
              onClick={() => { setEditingRecord(null); resetForm(); setShowForm(true); }}
              className="px-6 py-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-xl"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Registrar Primer Nacimiento
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default BirthRecords;