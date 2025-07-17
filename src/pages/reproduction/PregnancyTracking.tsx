// PregnancyTracking.tsx
// Página para seguimiento de embarazos del ganado bovino
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
  AlertTriangle,
  Activity,
  ChevronDown,
  ChevronUp,
  Heart,
  TrendingUp,
  Baby,
  Flower2,
  CalendarDays,
  Stethoscope,
  Bell,
  AlertCircle,
  Timer,
  LineChart,
  Monitor,
} from "lucide-react";

// Tipos e interfaces para seguimiento de embarazos
interface PregnancyRecord {
  id: string;
  cowId: string;
  cowName: string;
  cowEarTag: string;
  cowAge: number;
  cowWeight: number;
  bullId?: string;
  bullName?: string;
  bullEarTag?: string;
  breedingDate: string;
  breedingType: "natural" | "artificial_insemination" | "embryo_transfer" | "synchronized";
  confirmationDate: string;
  confirmationMethod: "palpation" | "ultrasound" | "blood_test" | "hormone_test";
  gestationDay: number;
  gestationWeek: number;
  expectedCalvingDate: string;
  currentStatus: "early" | "mid" | "late" | "overdue" | "aborted" | "completed";
  pregnancyNumber: number; // número de embarazo de la vaca
  location: {
    lat: number;
    lng: number;
    address: string;
    paddock: string;
    facility: string;
  };
  healthMonitoring: {
    lastCheckupDate: string;
    veterinarian: string;
    bodyConditionScore: number; // escala 1-5
    weight: number;
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    appetite: "excellent" | "good" | "fair" | "poor";
    mobility: "normal" | "reduced" | "limited" | "immobile";
  };
  ultrasoundExams: {
    date: string;
    gestationDay: number;
    fetalHeartbeat: boolean;
    fetalMovement: boolean;
    fetalSize: string; // mm or cm
    placentalCondition: "normal" | "calcification" | "detachment" | "infection";
    amnioticFluid: "normal" | "oligohydramnios" | "polyhydramnios";
    fetalPosition: "normal" | "breech" | "transverse" | "abnormal";
    veterinarian: string;
    images: string[];
    notes: string;
  }[];
  nutritionPlan: {
    currentDiet: string;
    dailyFeed: number; // kg
    supplements: string[];
    waterIntake: number; // liters
    specialRequirements: string[];
    lastUpdate: string;
  };
  vaccination: {
    preBreedingVaccines: {
      vaccine: string;
      date: string;
      batch: string;
    }[];
    pregnancyVaccines: {
      vaccine: string;
      date: string;
      batch: string;
      gestationDay: number;
    }[];
    nextDue: {
      vaccine: string;
      dueDate: string;
    }[];
  };
  complications: {
    date: string;
    type: "bleeding" | "infection" | "metabolic" | "behavioral" | "nutritional" | "other";
    severity: "mild" | "moderate" | "severe" | "critical";
    description: string;
    treatment: string;
    veterinarian: string;
    resolved: boolean;
    resolutionDate?: string;
  }[];
  alerts: {
    id: string;
    type: "checkup_due" | "vaccination_due" | "calving_approaching" | "complication" | "overdue";
    priority: "low" | "medium" | "high" | "critical";
    message: string;
    date: string;
    acknowledged: boolean;
    acknowledgedBy?: string;
    acknowledgedDate?: string;
  }[];
  calvingPreparation: {
    calvingPenReady: boolean;
    calvingKitPrepared: boolean;
    veterinarianOnCall: boolean;
    emergencyContactsNotified: boolean;
    calvingWatchSchedule: {
      date: string;
      timeSlots: {
        start: string;
        end: string;
        responsible: string;
      }[];
    }[];
    estimatedCalfWeight: number;
    potentialComplications: string[];
  };
  economicProjection: {
    totalCosts: {
      feed: number;
      veterinary: number;
      supplements: number;
      facilities: number;
      labor: number;
    };
    expectedValue: {
      calfValue: number;
      milkProductionIncrease: number;
      breedingValue: number;
    };
    roi: number;
  };
  milestones: {
    date: string;
    gestationDay: number;
    milestone: string;
    completed: boolean;
    notes?: string;
  }[];
  documents: {
    type: "ultrasound" | "blood_test" | "veterinary_report" | "breeding_certificate" | "other";
    filename: string;
    uploadDate: string;
    description: string;
  }[];
  notes: string;
  photos: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PregnancyFilters {
  status: string[];
  gestationStage: string[];
  pregnancyNumber: string[];
  veterinarian: string[];
  dueRange: {
    start: string;
    end: string;
  };
  location: string[];
  complications: boolean;
  searchTerm: string;
}

// Componente principal de Seguimiento de Embarazos
const PregnancyTracking: React.FC = () => {
  // Estados principales
  const [records, setRecords] = useState<PregnancyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PregnancyRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [, setSelectedRecord] = useState<PregnancyRecord | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar" | "timeline">("grid");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  // Estados para filtros
  const [filters, setFilters] = useState<PregnancyFilters>({
    status: [],
    gestationStage: [],
    pregnancyNumber: [],
    veterinarian: [],
    dueRange: {
      start: "",
      end: "",
    },
    location: [],
    complications: false,
    searchTerm: "",
  });

  // Datos de ejemplo para desarrollo
  const mockRecords: PregnancyRecord[] = [
    {
      id: "pregnancy-001",
      cowId: "cow-001",
      cowName: "Bella Esperanza",
      cowEarTag: "MX-001",
      cowAge: 4,
      cowWeight: 650,
      bullId: "bull-001",
      bullName: "Campeón Imperial",
      bullEarTag: "BULL-001",
      breedingDate: "2024-07-15",
      breedingType: "artificial_insemination",
      confirmationDate: "2024-08-15",
      confirmationMethod: "ultrasound",
      gestationDay: 185,
      gestationWeek: 26,
      expectedCalvingDate: "2025-04-15",
      currentStatus: "mid",
      pregnancyNumber: 3,
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Potrero Norte, Rancho San José",
        paddock: "PN-01",
        facility: "Establo Principal",
      },
      healthMonitoring: {
        lastCheckupDate: "2025-01-15",
        veterinarian: "Dr. García Mendoza",
        bodyConditionScore: 3.5,
        weight: 675,
        temperature: 38.5,
        heartRate: 72,
        respiratoryRate: 28,
        appetite: "excellent",
        mobility: "normal",
      },
      ultrasoundExams: [
        {
          date: "2024-08-15",
          gestationDay: 31,
          fetalHeartbeat: true,
          fetalMovement: false,
          fetalSize: "15mm",
          placentalCondition: "normal",
          amnioticFluid: "normal",
          fetalPosition: "normal",
          veterinarian: "Dr. García Mendoza",
          images: [],
          notes: "Confirmación de embarazo, desarrollo normal",
        },
        {
          date: "2024-11-15",
          gestationDay: 123,
          fetalHeartbeat: true,
          fetalMovement: true,
          fetalSize: "85mm",
          placentalCondition: "normal",
          amnioticFluid: "normal",
          fetalPosition: "normal",
          veterinarian: "Dr. García Mendoza",
          images: [],
          notes: "Desarrollo fetal normal, movimiento activo",
        },
      ],
      nutritionPlan: {
        currentDiet: "TMR gestación + suplemento mineral",
        dailyFeed: 25,
        supplements: ["Calcio", "Fósforo", "Vitamina E", "Ácido Fólico"],
        waterIntake: 65,
        specialRequirements: ["Aumentar proteína en último tercio"],
        lastUpdate: "2025-01-01",
      },
      vaccination: {
        preBreedingVaccines: [
          {
            vaccine: "IBR/BVD",
            date: "2024-06-15",
            batch: "VAC-2024-060",
          },
        ],
        pregnancyVaccines: [
          {
            vaccine: "Clostridiosis",
            date: "2024-12-15",
            batch: "VAC-2024-120",
            gestationDay: 153,
          },
        ],
        nextDue: [
          {
            vaccine: "Vacuna preparto",
            dueDate: "2025-03-15",
          },
        ],
      },
      complications: [],
      alerts: [
        {
          id: "alert-001",
          type: "vaccination_due",
          priority: "medium",
          message: "Vacuna preparto vence en 30 días",
          date: "2025-01-17",
          acknowledged: false,
        },
      ],
      calvingPreparation: {
        calvingPenReady: false,
        calvingKitPrepared: false,
        veterinarianOnCall: true,
        emergencyContactsNotified: false,
        calvingWatchSchedule: [],
        estimatedCalfWeight: 38,
        potentialComplications: [],
      },
      economicProjection: {
        totalCosts: {
          feed: 8500,
          veterinary: 3200,
          supplements: 1800,
          facilities: 2000,
          labor: 2500,
        },
        expectedValue: {
          calfValue: 25000,
          milkProductionIncrease: 45000,
          breedingValue: 35000,
        },
        roi: 285,
      },
      milestones: [
        {
          date: "2024-08-15",
          gestationDay: 31,
          milestone: "Confirmación de embarazo",
          completed: true,
          notes: "Ultrasonido confirma embarazo viable",
        },
        {
          date: "2024-11-15",
          gestationDay: 123,
          milestone: "Segundo examen ultrasónico",
          completed: true,
          notes: "Desarrollo normal del feto",
        },
        {
          date: "2025-03-15",
          gestationDay: 243,
          milestone: "Vacunación preparto",
          completed: false,
        },
        {
          date: "2025-04-01",
          gestationDay: 260,
          milestone: "Preparación área de parto",
          completed: false,
        },
      ],
      documents: [
        {
          type: "ultrasound",
          filename: "ultrasonido_2024-08-15.pdf",
          uploadDate: "2024-08-15",
          description: "Confirmación de embarazo",
        },
      ],
      notes: "Embarazo de alto valor, excelente madre, vigilar de cerca",
      photos: [],
      active: true,
      createdAt: "2024-08-15T10:00:00Z",
      updatedAt: "2025-01-17T15:30:00Z",
    },
    {
      id: "pregnancy-002",
      cowId: "cow-002",
      cowName: "Luna Plateada",
      cowEarTag: "MX-002",
      cowAge: 6,
      cowWeight: 450,
      bullId: "bull-002",
      bullName: "Tornado Negro",
      bullEarTag: "BULL-002",
      breedingDate: "2024-09-10",
      breedingType: "natural",
      confirmationDate: "2024-10-10",
      confirmationMethod: "palpation",
      gestationDay: 129,
      gestationWeek: 18,
      expectedCalvingDate: "2025-06-10",
      currentStatus: "early",
      pregnancyNumber: 5,
      location: {
        lat: 16.7569,
        lng: -93.1292,
        address: "Potrero Sur, Rancho San José",
        paddock: "PS-02",
        facility: "Establo Secundario",
      },
      healthMonitoring: {
        lastCheckupDate: "2025-01-10",
        veterinarian: "MVZ. Rodríguez López",
        bodyConditionScore: 3.0,
        weight: 465,
        temperature: 38.3,
        heartRate: 75,
        respiratoryRate: 30,
        appetite: "good",
        mobility: "normal",
      },
      ultrasoundExams: [
        {
          date: "2024-10-10",
          gestationDay: 30,
          fetalHeartbeat: true,
          fetalMovement: false,
          fetalSize: "12mm",
          placentalCondition: "normal",
          amnioticFluid: "normal",
          fetalPosition: "normal",
          veterinarian: "MVZ. Rodríguez López",
          images: [],
          notes: "Embarazo confirmado por palpación",
        },
      ],
      nutritionPlan: {
        currentDiet: "Pasto mejorado + concentrado gestación",
        dailyFeed: 20,
        supplements: ["Mineral completo", "Vitamina A+D"],
        waterIntake: 55,
        specialRequirements: ["Monitorear peso, vaca mayor"],
        lastUpdate: "2024-12-15",
      },
      vaccination: {
        preBreedingVaccines: [
          {
            vaccine: "Brucelosis",
            date: "2024-08-10",
            batch: "VAC-2024-080",
          },
        ],
        pregnancyVaccines: [],
        nextDue: [
          {
            vaccine: "IBR/BVD gestación",
            dueDate: "2025-02-10",
          },
        ],
      },
      complications: [
        {
          date: "2024-12-15",
          type: "nutritional",
          severity: "mild",
          description: "Pérdida de peso leve",
          treatment: "Ajuste dietético, suplemento energético",
          veterinarian: "MVZ. Rodríguez López",
          resolved: true,
          resolutionDate: "2025-01-05",
        },
      ],
      alerts: [
        {
          id: "alert-002",
          type: "vaccination_due",
          priority: "high",
          message: "Vacuna IBR/BVD vence en 15 días",
          date: "2025-01-17",
          acknowledged: false,
        },
      ],
      calvingPreparation: {
        calvingPenReady: false,
        calvingKitPrepared: false,
        veterinarianOnCall: false,
        emergencyContactsNotified: false,
        calvingWatchSchedule: [],
        estimatedCalfWeight: 32,
        potentialComplications: ["Edad avanzada", "Parto anterior complicado"],
      },
      economicProjection: {
        totalCosts: {
          feed: 6800,
          veterinary: 2800,
          supplements: 1500,
          facilities: 1800,
          labor: 2200,
        },
        expectedValue: {
          calfValue: 20000,
          milkProductionIncrease: 35000,
          breedingValue: 25000,
        },
        roi: 235,
      },
      milestones: [
        {
          date: "2024-10-10",
          gestationDay: 30,
          milestone: "Confirmación de embarazo",
          completed: true,
          notes: "Confirmado por palpación",
        },
        {
          date: "2025-02-10",
          gestationDay: 153,
          milestone: "Vacunación gestación",
          completed: false,
        },
      ],
      documents: [],
      notes: "Vaca de edad avanzada, requiere monitoreo especial",
      photos: [],
      active: true,
      createdAt: "2024-10-10T14:00:00Z",
      updatedAt: "2025-01-17T15:30:00Z",
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
          record.cowName.toLowerCase().includes(searchLower) ||
          record.cowEarTag.toLowerCase().includes(searchLower) ||
          record.bullName?.toLowerCase().includes(searchLower) ||
          record.healthMonitoring.veterinarian.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por estado
    if (filters.status.length > 0) {
      filtered = filtered.filter(record => filters.status.includes(record.currentStatus));
    }

    // Filtro por etapa de gestación
    if (filters.gestationStage.length > 0) {
      filtered = filtered.filter(record => {
        const stage = record.gestationDay <= 90 ? "early" :
                     record.gestationDay <= 210 ? "mid" : "late";
        return filters.gestationStage.includes(stage);
      });
    }

    // Filtro por número de embarazo
    if (filters.pregnancyNumber.length > 0) {
      filtered = filtered.filter(record => 
        filters.pregnancyNumber.includes(record.pregnancyNumber.toString())
      );
    }

    // Filtro por veterinario
    if (filters.veterinarian.length > 0) {
      filtered = filtered.filter(record => 
        filters.veterinarian.includes(record.healthMonitoring.veterinarian)
      );
    }

    // Filtro por rango de fecha de parto
    if (filters.dueRange.start) {
      filtered = filtered.filter(record => record.expectedCalvingDate >= filters.dueRange.start);
    }
    if (filters.dueRange.end) {
      filtered = filtered.filter(record => record.expectedCalvingDate <= filters.dueRange.end);
    }

    // Filtro por complicaciones
    if (filters.complications) {
      filtered = filtered.filter(record => record.complications.length > 0);
    }

    setFilteredRecords(filtered);
  };

  // Función para calcular días hasta el parto
  const calculateDaysToCalving = (expectedDate: string) => {
    const today = new Date();
    const calvingDate = new Date(expectedDate);
    const diffTime = calvingDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Función para obtener estadísticas
  const statistics = useMemo(() => {
    const total = records.length;
    const early = records.filter(r => r.currentStatus === "early").length;
    const mid = records.filter(r => r.currentStatus === "mid").length;
    const late = records.filter(r => r.currentStatus === "late").length;
    const overdue = records.filter(r => r.currentStatus === "overdue").length;
    const withComplications = records.filter(r => r.complications.length > 0).length;
    const dueThisWeek = records.filter(r => {
      const daysToCalving = calculateDaysToCalving(r.expectedCalvingDate);
      return daysToCalving >= 0 && daysToCalving <= 7;
    }).length;
    const dueThisMonth = records.filter(r => {
      const daysToCalving = calculateDaysToCalving(r.expectedCalvingDate);
      return daysToCalving >= 0 && daysToCalving <= 30;
    }).length;
    const totalAlerts = records.reduce((sum, r) => sum + r.alerts.filter(a => !a.acknowledged).length, 0);
    const avgGestationDay = total > 0 ? 
      Math.round(records.reduce((sum, r) => sum + r.gestationDay, 0) / total) : 0;
    const totalProjectedROI = records.reduce((sum, r) => sum + r.economicProjection.roi, 0);

    return {
      total,
      early,
      mid,
      late,
      overdue,
      withComplications,
      dueThisWeek,
      dueThisMonth,
      totalAlerts,
      avgGestationDay,
      totalProjectedROI,
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

  // Función para obtener el color de estado de gestación
  const getGestationStatusColor = (status: string) => {
    switch (status) {
      case "early":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "mid":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "late":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      case "aborted":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Función para obtener el color de prioridad de alerta
  const getAlertPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
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
            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado de gestación
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
                <option value="early">Temprano (0-90 días)</option>
                <option value="mid">Medio (91-210 días)</option>
                <option value="late">Tardío (211-283 días)</option>
                <option value="overdue">Vencido</option>
                <option value="completed">Completado</option>
              </select>
            </div>

            {/* Filtro por número de embarazo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número de embarazo
              </label>
              <select
                multiple
                value={filters.pregnancyNumber}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    pregnancyNumber: Array.from(e.target.selectedOptions, option => option.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="1">Primer embarazo</option>
                <option value="2">Segundo embarazo</option>
                <option value="3">Tercer embarazo</option>
                <option value="4">Cuarto embarazo</option>
                <option value="5">Quinto embarazo +</option>
              </select>
            </div>

            {/* Rango de fechas de parto */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de parto desde
              </label>
              <input
                type="date"
                value={filters.dueRange.start}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    dueRange: { ...prev.dueRange, start: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de parto hasta
              </label>
              <input
                type="date"
                value={filters.dueRange.end}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    dueRange: { ...prev.dueRange, end: e.target.value },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              />
            </div>

            {/* Filtro por complicaciones */}
            <div className="col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={filters.complications}
                  onChange={(e) =>
                    setFilters(prev => ({ ...prev, complications: e.target.checked }))
                  }
                  className="rounded border-gray-300 text-[#519a7c] focus:ring-[#519a7c]"
                />
                <span className="text-sm font-medium text-gray-700">
                  Solo mostrar embarazos con complicaciones
                </span>
              </label>
            </div>
          </div>

          {/* Botones de acción de filtros */}
          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={() =>
                setFilters({
                  status: [],
                  gestationStage: [],
                  pregnancyNumber: [],
                  veterinarian: [],
                  dueRange: { start: "", end: "" },
                  location: [],
                  complications: false,
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

  // Componente de tarjeta de embarazo
  const PregnancyCard: React.FC<{ record: PregnancyRecord }> = ({ record }) => {
    const daysToCalving = calculateDaysToCalving(record.expectedCalvingDate);
    const gestationProgress = Math.round((record.gestationDay / 283) * 100);
    const unacknowledgedAlerts = record.alerts.filter(a => !a.acknowledged);

    return (
      <motion.div
        variants={itemVariants}
        className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-300"
      >
        {/* Header de la tarjeta */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Flower2 className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-bold text-gray-900">{record.cowName}</h3>
              {unacknowledgedAlerts.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Bell className="w-4 h-4 text-red-600" />
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {unacknowledgedAlerts.length}
                  </span>
                </div>
              )}
            </div>
            <p className="text-sm text-gray-600">Arete: {record.cowEarTag}</p>
            <p className="text-sm text-gray-600">Embarazo #{record.pregnancyNumber}</p>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getGestationStatusColor(record.currentStatus)}`}>
              <Timer className="w-3 h-3 mr-1" />
              {record.currentStatus === "early" ? "Temprano" :
               record.currentStatus === "mid" ? "Medio" :
               record.currentStatus === "late" ? "Tardío" :
               record.currentStatus === "overdue" ? "Vencido" : 
               record.currentStatus === "completed" ? "Completado" : "Abortado"}
            </span>
            {record.complications.length > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Complicaciones
              </span>
            )}
          </div>
        </div>

        {/* Información básica */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Día de gestación</p>
            <p className="font-medium">{record.gestationDay} días</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Semana</p>
            <p className="font-medium">{record.gestationWeek} semanas</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Parto esperado</p>
            <p className="font-medium">{formatDate(record.expectedCalvingDate)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Días restantes</p>
            <p className={`font-medium ${
              daysToCalving < 0 ? 'text-red-600' :
              daysToCalving <= 7 ? 'text-orange-600' :
              daysToCalving <= 30 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {daysToCalving < 0 ? `${Math.abs(daysToCalving)} días vencido` : `${daysToCalving} días`}
            </p>
          </div>
        </div>

        {/* Progreso de gestación */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Progreso de gestación:</span>
            <span className="text-sm font-medium">{gestationProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${
                gestationProgress >= 90 ? 'bg-orange-500' :
                gestationProgress >= 75 ? 'bg-yellow-500' :
                gestationProgress >= 50 ? 'bg-blue-500' : 'bg-green-500'
              }`}
              style={{ width: `${gestationProgress}%` }}
            ></div>
          </div>
        </div>

        {/* Información reproductiva */}
        <div className="bg-purple-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Heart className="w-4 h-4 mr-1 text-purple-600" />
            Información Reproductiva
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Toro:</span>
              <span className="ml-1 font-medium">{record.bullName || "No registrado"}</span>
            </div>
            <div>
              <span className="text-gray-600">Tipo:</span>
              <span className="ml-1 font-medium">
                {record.breedingType === "artificial_insemination" ? "IA" :
                 record.breedingType === "natural" ? "Natural" :
                 record.breedingType === "embryo_transfer" ? "TE" : "Sincronizado"}
              </span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Confirmación:</span>
              <span className="ml-1 font-medium">
                {record.confirmationMethod === "ultrasound" ? "Ultrasonido" :
                 record.confirmationMethod === "palpation" ? "Palpación" :
                 record.confirmationMethod === "blood_test" ? "Análisis sangre" : "Hormonas"}
              </span>
            </div>
          </div>
        </div>

        {/* Monitoreo de salud */}
        <div className="bg-blue-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <Stethoscope className="w-4 h-4 mr-1 text-blue-600" />
            Monitoreo de Salud
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">Peso actual:</span>
              <span className="ml-1 font-medium">{record.healthMonitoring.weight} kg</span>
            </div>
            <div>
              <span className="text-gray-600">Condición corporal:</span>
              <span className="ml-1 font-medium">{record.healthMonitoring.bodyConditionScore}/5</span>
            </div>
            <div>
              <span className="text-gray-600">Apetito:</span>
              <span className="ml-1 font-medium capitalize">{record.healthMonitoring.appetite}</span>
            </div>
            <div>
              <span className="text-gray-600">Último chequeo:</span>
              <span className="ml-1 font-medium">{formatDate(record.healthMonitoring.lastCheckupDate)}</span>
            </div>
          </div>
        </div>

        {/* Últimos exámenes ultrasónicos */}
        {record.ultrasoundExams.length > 0 && (
          <div className="bg-green-50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Monitor className="w-4 h-4 mr-1 text-green-600" />
              Último Ultrasonido
            </p>
            <div className="text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fecha:</span>
                <span className="font-medium">{formatDate(record.ultrasoundExams[record.ultrasoundExams.length - 1].date)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Latido fetal:</span>
                <span className={`font-medium ${record.ultrasoundExams[record.ultrasoundExams.length - 1].fetalHeartbeat ? 'text-green-600' : 'text-red-600'}`}>
                  {record.ultrasoundExams[record.ultrasoundExams.length - 1].fetalHeartbeat ? 'Presente' : 'Ausente'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tamaño fetal:</span>
                <span className="font-medium">{record.ultrasoundExams[record.ultrasoundExams.length - 1].fetalSize}</span>
              </div>
            </div>
          </div>
        )}

        {/* Alertas activas */}
        {unacknowledgedAlerts.length > 0 && (
          <div className="bg-red-50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1 text-red-600" />
              Alertas Activas
            </p>
            <div className="space-y-2">
              {unacknowledgedAlerts.slice(0, 2).map((alert) => (
                <div key={alert.id} className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${getAlertPriorityColor(alert.priority)}`}
                  ></div>
                  <span className="text-sm text-gray-700">{alert.message}</span>
                </div>
              ))}
              {unacknowledgedAlerts.length > 2 && (
                <p className="text-xs text-gray-500">
                  +{unacknowledgedAlerts.length - 2} alertas más
                </p>
              )}
            </div>
          </div>
        )}

        {/* Proyección económica */}
        <div className="bg-yellow-50 rounded-lg p-3 mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1 text-yellow-600" />
            Proyección Económica
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-600">ROI esperado:</span>
              <span className="ml-1 font-medium text-green-600">{record.economicProjection.roi}%</span>
            </div>
            <div>
              <span className="text-gray-600">Valor esperado:</span>
              <span className="ml-1 font-medium">
                {formatCurrency(
                  record.economicProjection.expectedValue.calfValue +
                  record.economicProjection.expectedValue.milkProductionIncrease
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="flex items-center text-sm text-gray-600 mb-4">
          <MapPin className="w-4 h-4 mr-1" />
          <span>{record.location.paddock} - {record.location.facility}</span>
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
            onClick={() => alert("Funcionalidad en desarrollo")}
            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Agregar ultrasonido"
          >
            <Monitor className="w-4 h-4" />
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
  };

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
                Seguimiento de Embarazos
              </h1>
              <p className="text-white/90 text-lg">
                Monitoreo integral de gestación y cuidado prenatal
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button
                onClick={() => alert("Funcionalidad en desarrollo")}
                className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nuevo Embarazo
              </button>
              <button className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 border border-white/20">
                <Download className="w-5 h-5 mr-2" />
                Exportar
              </button>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas principales */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          <StatCard
            title="Total Embarazos"
            value={statistics.total}
            icon={<Heart className="w-8 h-8" />}
            color="hover:bg-pink-50"
          />
          <StatCard
            title="Temprano (0-90d)"
            value={statistics.early}
            icon={<Timer className="w-8 h-8" />}
            color="hover:bg-blue-50"
          />
          <StatCard
            title="Medio (91-210d)"
            value={statistics.mid}
            icon={<Activity className="w-8 h-8" />}
            color="hover:bg-yellow-50"
          />
          <StatCard
            title="Tardío (211-283d)"
            value={statistics.late}
            icon={<CalendarDays className="w-8 h-8" />}
            color="hover:bg-orange-50"
          />
          <StatCard
            title="Partos Esta Semana"
            value={statistics.dueThisWeek}
            icon={<Baby className="w-8 h-8" />}
            color="hover:bg-green-50"
          />
          <StatCard
            title="ROI Proyectado"
            value={`${Math.round(statistics.totalProjectedROI / statistics.total || 0)}%`}
            icon={<TrendingUp className="w-8 h-8" />}
            color="hover:bg-indigo-50"
            subtitle="Promedio"
          />
        </motion.div>

        {/* Estadísticas adicionales */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Con Complicaciones"
            value={statistics.withComplications}
            icon={<AlertTriangle className="w-8 h-8" />}
            color="hover:bg-red-50"
          />
          <StatCard
            title="Alertas Activas"
            value={statistics.totalAlerts}
            icon={<Bell className="w-8 h-8" />}
            color="hover:bg-yellow-50"
          />
          <StatCard
            title="Partos Este Mes"
            value={statistics.dueThisMonth}
            icon={<Calendar className="w-8 h-8" />}
            color="hover:bg-purple-50"
          />
          <StatCard
            title="Día Gestación Promedio"
            value={statistics.avgGestationDay}
            icon={<LineChart className="w-8 h-8" />}
            color="hover:bg-gray-50"
            subtitle="días"
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
                placeholder="Buscar por vaca, toro, veterinario..."
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
                  onClick={() => setViewMode("timeline")}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === "timeline" ? "bg-white shadow-sm" : "hover:bg-gray-200"
                  }`}
                >
                  <Timer className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Panel de filtros */}
        <FiltersPanel />

        {/* Lista de embarazos */}
        <motion.div variants={itemVariants}>
          {filteredRecords.length === 0 ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-white/20 text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron embarazos
              </h3>
              <p className="text-gray-600 mb-6">
                No hay registros de embarazos que coincidan con los filtros aplicados.
              </p>
              <button
                onClick={() => alert("Funcionalidad en desarrollo")}
                className="inline-flex items-center px-6 py-3 bg-[#519a7c] text-white rounded-xl hover:bg-[#4a8970] transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Registrar primer embarazo
              </button>
            </div>
          ) : (
            <div className={viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : viewMode === "list"
              ? "space-y-4"
              : "bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
            }>
              {viewMode === "timeline" ? (
                <div className="text-center py-12">
                  <Timer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Vista de Línea de Tiempo
                  </h3>
                  <p className="text-gray-600">
                    Funcionalidad de línea de tiempo en desarrollo
                  </p>
                </div>
              ) : (
                filteredRecords.map((record) => (
                  <PregnancyCard key={record.id} record={record} />
                ))
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PregnancyTracking;