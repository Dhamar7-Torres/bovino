// PregnancyTracking.tsx
// CRUD completo para seguimiento de gestaciones bovinas
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
  Activity,
  FileText,
  X,
  Calendar,
  Save,
  ArrowLeft,
  MapPin,
  Info,
  Heart,
  Stethoscope,
  Timer,
  AlertTriangle,
  User,
  Crown,
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

// Interfaces para seguimiento de gestación
interface PregnancyRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalEarTag: string;
  bullId?: string;
  bullName?: string;
  bullEarTag?: string;
  breedingDate: string;
  breedingType: "natural" | "artificial_insemination" | "embryo_transfer";
  confirmationDate: string;
  confirmationMethod: "palpation" | "ultrasound" | "blood_test" | "visual";
  gestationDay: number;
  expectedCalvingDate: string;
  currentStage: "early" | "middle" | "late";
  pregnancyNumber: number; // Número de gestación de la vaca
  veterinarian: {
    id: string;
    name: string;
    license: string;
    phone?: string;
    email?: string;
  };
  location: {
    lat: number;
    lng: number;
    address: string;
    paddock?: string;
    facility?: string;
  };
  examinations: PregnancyExamination[];
  nutritionPlan: {
    currentStage: "maintenance" | "increased" | "pre_calving";
    supplements: string[];
    specialDiet: boolean;
    waterAccess: "excellent" | "good" | "fair" | "poor";
    notes?: string;
  };
  healthStatus: {
    overall: "excellent" | "good" | "fair" | "poor" | "critical";
    bodyCondition: number; // 1-5 escala
    weight: number; // kg
    temperature: number; // °C
    heartRate: number; // bpm
    respiratoryRate: number; // por minuto
    bloodPressure?: string;
  };
  complications: {
    hasComplications: boolean;
    type?: "metabolic" | "reproductive" | "physical" | "nutritional" | "infectious";
    description?: string;
    severity: "mild" | "moderate" | "severe";
    treatmentRequired: boolean;
    veterinaryAction?: string;
  };
  monitoringSchedule: {
    nextExamDate: string;
    frequency: "weekly" | "biweekly" | "monthly";
    specialRequirements?: string[];
  };
  notes: string;
  cost: number;
  status: "active" | "completed" | "lost" | "transferred" | "aborted";
  outcome?: {
    type: "successful_birth" | "miscarriage" | "stillbirth" | "early_termination";
    date?: string;
    details?: string;
  };
  alerts: PregnancyAlert[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

interface PregnancyExamination {
  id: string;
  date: string;
  time: string;
  type: "routine" | "emergency" | "follow_up" | "pre_calving";
  veterinarian: string;
  gestationDay: number;
  findings: {
    fetalMovement: "strong" | "moderate" | "weak" | "none";
    fetalSize: "normal" | "small" | "large";
    placentalHealth: "normal" | "concerning" | "abnormal";
    amnioticFluid: "normal" | "low" | "high";
    cervicalCondition: "normal" | "soft" | "dilated";
  };
  measurements: {
    fetalLength?: number; // cm
    fetalWeight?: number; // kg estimado
    heartRate?: number; // bpm
  };
  ultrasoundImages?: string[];
  recommendations: string[];
  nextExamDate?: string;
  cost: number;
  notes: string;
}

interface PregnancyAlert {
  id: string;
  type: "health" | "schedule" | "nutrition" | "behavior" | "emergency";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  date: string;
  resolved: boolean;
  resolvedDate?: string;
  resolvedBy?: string;
  actionTaken?: string;
}

interface PregnancyFilters {
  dateRange: {
    start: string;
    end: string;
  };
  stage: string[];
  status: string[];
  veterinarian: string[];
  complications: string[];
  pregnancyNumber: string[];
  searchTerm: string;
  dueRange: {
    start: string;
    end: string;
  };
}

// Componente principal de Seguimiento de Gestación
const PregnancyTracking: React.FC = () => {
  // Estados principales
  const [records, setRecords] = useState<PregnancyRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PregnancyRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<PregnancyRecord | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "calendar">("grid");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [editingRecord, setEditingRecord] = useState<PregnancyRecord | null>(null);
  
  // Estados para filtros
  const [filters, setFilters] = useState<PregnancyFilters>({
    dateRange: {
      start: "",
      end: "",
    },
    stage: [],
    status: [],
    veterinarian: [],
    complications: [],
    pregnancyNumber: [],
    searchTerm: "",
    dueRange: {
      start: "",
      end: "",
    },
  });

  // Estados para formulario
  const [formData, setFormData] = useState<Partial<PregnancyRecord>>({
    breedingType: "natural",
    confirmationMethod: "ultrasound",
    currentStage: "early",
    pregnancyNumber: 1,
    gestationDay: 0,
    cost: 0,
    status: "active",
    veterinarian: {
      id: "",
      name: "",
      license: "",
    },
    location: {
      lat: 17.989,
      lng: -92.247,
      address: "Villahermosa, Tabasco",
    },
    examinations: [],
    nutritionPlan: {
      currentStage: "maintenance",
      supplements: [],
      specialDiet: false,
      waterAccess: "good",
    },
    healthStatus: {
      overall: "good",
      bodyCondition: 3,
      weight: 500,
      temperature: 38.5,
      heartRate: 60,
      respiratoryRate: 20,
    },
    complications: {
      hasComplications: false,
      severity: "mild",
      treatmentRequired: false,
    },
    monitoringSchedule: {
      nextExamDate: "",
      frequency: "monthly",
    },
    alerts: [],
    photos: [],
  });

  // Datos de ejemplo para desarrollo
  const mockRecords: PregnancyRecord[] = [
    {
      id: "pregnancy-001",
      animalId: "cow-123",
      animalName: "Bella",
      animalEarTag: "MX-001",
      bullId: "bull-001",
      bullName: "Campeón",
      bullEarTag: "T-001",
      breedingDate: "2025-04-15",
      breedingType: "natural",
      confirmationDate: "2025-05-15",
      confirmationMethod: "ultrasound",
      gestationDay: 92,
      expectedCalvingDate: "2026-01-22",
      currentStage: "early",
      pregnancyNumber: 3,
      veterinarian: {
        id: "vet-001",
        name: "Dr. García",
        license: "MVZ-123456",
        phone: "+52 993 123 4567",
        email: "dr.garcia@veterinaria.com",
      },
      location: {
        lat: 17.989,
        lng: -92.247,
        address: "Potrero Norte, Rancho San Miguel",
        paddock: "Potrero 3",
        facility: "Área de Maternidad",
      },
      examinations: [
        {
          id: "exam-001",
          date: "2025-05-15",
          time: "09:00",
          type: "routine",
          veterinarian: "Dr. García",
          gestationDay: 30,
          findings: {
            fetalMovement: "strong",
            fetalSize: "normal",
            placentalHealth: "normal",
            amnioticFluid: "normal",
            cervicalCondition: "normal",
          },
          measurements: {
            fetalLength: 8.5,
            heartRate: 180,
          },
          recommendations: ["Continuar monitoreo mensual", "Suplementos vitamínicos"],
          nextExamDate: "2025-06-15",
          cost: 800,
          notes: "Desarrollo fetal normal. Sin complicaciones observadas.",
        },
        {
          id: "exam-002",
          date: "2025-06-15",
          time: "10:30",
          type: "routine",
          veterinarian: "Dr. García",
          gestationDay: 61,
          findings: {
            fetalMovement: "strong",
            fetalSize: "normal",
            placentalHealth: "normal",
            amnioticFluid: "normal",
            cervicalCondition: "normal",
          },
          measurements: {
            fetalLength: 15.2,
            fetalWeight: 2.5,
            heartRate: 175,
          },
          recommendations: ["Aumentar proteína en dieta", "Monitoreo quincenal"],
          nextExamDate: "2025-07-01",
          cost: 850,
          notes: "Crecimiento fetal excelente. Incrementar nutrición.",
        },
      ],
      nutritionPlan: {
        currentStage: "increased",
        supplements: ["Vitaminas prenatales", "Calcio", "Fósforo"],
        specialDiet: true,
        waterAccess: "excellent",
        notes: "Dieta rica en proteínas y minerales",
      },
      healthStatus: {
        overall: "excellent",
        bodyCondition: 4,
        weight: 580,
        temperature: 38.3,
        heartRate: 65,
        respiratoryRate: 18,
        bloodPressure: "120/80",
      },
      complications: {
        hasComplications: false,
        severity: "mild",
        treatmentRequired: false,
      },
      monitoringSchedule: {
        nextExamDate: "2025-07-01",
        frequency: "biweekly",
        specialRequirements: ["Ultrasonido mensual", "Análisis de sangre"],
      },
      notes: "Gestación transcurriendo normalmente. Vaca en excelentes condiciones. Propietario muy colaborativo con el programa de seguimiento.",
      cost: 15000,
      status: "active",
      alerts: [],
      photos: ["ultrasound_001.jpg", "exam_002.jpg"],
      createdAt: "2025-05-15T09:00:00Z",
      updatedAt: "2025-06-15T10:30:00Z",
    },
    {
      id: "pregnancy-002",
      animalId: "cow-124",
      animalName: "Luna",
      animalEarTag: "MX-002",
      bullId: "bull-002",
      bullName: "Emperador",
      bullEarTag: "T-002",
      breedingDate: "2025-03-20",
      breedingType: "artificial_insemination",
      confirmationDate: "2025-04-20",
      confirmationMethod: "palpation",
      gestationDay: 118,
      expectedCalvingDate: "2025-12-26",
      currentStage: "middle",
      pregnancyNumber: 1,
      veterinarian: {
        id: "vet-002",
        name: "Dra. Martínez",
        license: "MVZ-789012",
        phone: "+52 993 987 6543",
        email: "dra.martinez@reprovet.com",
      },
      location: {
        lat: 17.995,
        lng: -92.255,
        address: "Potrero Sur, Rancho San Miguel",
        paddock: "Potrero 7",
        facility: "Área de Gestación",
      },
      examinations: [
        {
          id: "exam-003",
          date: "2025-04-20",
          time: "14:00",
          type: "routine",
          veterinarian: "Dra. Martínez",
          gestationDay: 31,
          findings: {
            fetalMovement: "moderate",
            fetalSize: "normal",
            placentalHealth: "normal",
            amnioticFluid: "normal",
            cervicalCondition: "normal",
          },
          measurements: {
            fetalLength: 9.0,
            heartRate: 170,
          },
          recommendations: ["Monitoreo cada 3 semanas", "Suplementación mineral"],
          nextExamDate: "2025-05-11",
          cost: 750,
          notes: "Primera gestación. Desarrollo normal.",
        },
      ],
      nutritionPlan: {
        currentStage: "increased",
        supplements: ["Complejo vitamínico", "Minerales"],
        specialDiet: false,
        waterAccess: "good",
        notes: "Dieta estándar con suplementos",
      },
      healthStatus: {
        overall: "good",
        bodyCondition: 3,
        weight: 520,
        temperature: 38.4,
        heartRate: 68,
        respiratoryRate: 22,
      },
      complications: {
        hasComplications: true,
        type: "nutritional",
        description: "Ligera pérdida de condición corporal",
        severity: "mild",
        treatmentRequired: true,
        veterinaryAction: "Ajuste nutricional y suplementación",
      },
      monitoringSchedule: {
        nextExamDate: "2025-07-20",
        frequency: "monthly",
        specialRequirements: ["Control de peso semanal"],
      },
      notes: "Primera gestación. Requiere monitoreo cercano de condición corporal. Vaquilla joven adaptándose bien.",
      cost: 12000,
      status: "active",
      alerts: [
        {
          id: "alert-001",
          type: "nutrition",
          severity: "medium",
          title: "Pérdida de Condición Corporal",
          message: "Se observa ligera pérdida de peso. Revisar plan nutricional.",
          date: "2025-06-15T00:00:00Z",
          resolved: false,
        },
      ],
      photos: ["luna_exam_001.jpg"],
      createdAt: "2025-04-20T14:00:00Z",
      updatedAt: "2025-06-15T16:00:00Z",
    },
    {
      id: "pregnancy-003",
      animalId: "cow-125",
      animalName: "Esperanza",
      animalEarTag: "MX-003",
      bullId: "bull-003",
      bullName: "Titán",
      bullEarTag: "T-003",
      breedingDate: "2025-01-10",
      breedingType: "embryo_transfer",
      confirmationDate: "2025-02-10",
      confirmationMethod: "ultrasound",
      gestationDay: 188,
      expectedCalvingDate: "2025-10-18",
      currentStage: "late",
      pregnancyNumber: 5,
      veterinarian: {
        id: "vet-001",
        name: "Dr. García",
        license: "MVZ-123456",
        phone: "+52 993 123 4567",
        email: "dr.garcia@veterinaria.com",
      },
      location: {
        lat: 17.992,
        lng: -92.250,
        address: "Área de Maternidad, Rancho San Miguel",
        paddock: "Corral de Maternidad",
        facility: "Instalación de Partos",
      },
      examinations: [
        {
          id: "exam-004",
          date: "2025-07-10",
          time: "08:00",
          type: "pre_calving",
          veterinarian: "Dr. García",
          gestationDay: 180,
          findings: {
            fetalMovement: "strong",
            fetalSize: "large",
            placentalHealth: "normal",
            amnioticFluid: "normal",
            cervicalCondition: "soft",
          },
          measurements: {
            fetalLength: 45.0,
            fetalWeight: 35.0,
            heartRate: 160,
          },
          recommendations: ["Monitoreo diario", "Preparar área de parto", "Asistencia veterinaria en parto"],
          nextExamDate: "2025-07-17",
          cost: 1200,
          notes: "Preparándose para parto. Becerro grande, posible parto asistido.",
        },
      ],
      nutritionPlan: {
        currentStage: "pre_calving",
        supplements: ["Calcio", "Magnesio", "Vitamina D"],
        specialDiet: true,
        waterAccess: "excellent",
        notes: "Dieta pre-parto con restricción energética controlada",
      },
      healthStatus: {
        overall: "good",
        bodyCondition: 4,
        weight: 650,
        temperature: 38.6,
        heartRate: 72,
        respiratoryRate: 24,
        bloodPressure: "125/85",
      },
      complications: {
        hasComplications: true,
        type: "physical",
        description: "Becerro de gran tamaño, posible distocia",
        severity: "moderate",
        treatmentRequired: true,
        veterinaryAction: "Preparación para parto asistido",
      },
      monitoringSchedule: {
        nextExamDate: "2025-07-17",
        frequency: "weekly",
        specialRequirements: ["Monitoreo diario", "Vigilancia 24/7 cerca del parto"],
      },
      notes: "Vaca multípara experimentada. Gestación avanzada con becerro grande. Preparación para posible parto asistido. Ubicada en área de maternidad para monitoreo intensivo.",
      cost: 25000,
      status: "active",
      alerts: [
        {
          id: "alert-002",
          type: "emergency",
          severity: "high",
          title: "Parto Próximo - Becerro Grande",
          message: "Monitoreo intensivo requerido. Preparar para posible asistencia en parto.",
          date: "2025-07-10T00:00:00Z",
          resolved: false,
        },
      ],
      photos: ["esperanza_ultrasound_latest.jpg", "maternity_area.jpg"],
      createdAt: "2025-02-10T10:00:00Z",
      updatedAt: "2025-07-10T08:00:00Z",
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
        await new Promise(resolve => setTimeout(resolve, 1200));
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
        record.bullName?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.veterinarian.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filtro por etapa
    if (filters.stage.length > 0) {
      filtered = filtered.filter(record => filters.stage.includes(record.currentStage));
    }

    // Filtro por estado
    if (filters.status.length > 0) {
      filtered = filtered.filter(record => filters.status.includes(record.status));
    }

    // Filtro por veterinario
    if (filters.veterinarian.length > 0) {
      filtered = filtered.filter(record => filters.veterinarian.includes(record.veterinarian.id));
    }

    // Filtro por complicaciones
    if (filters.complications.length > 0) {
      filtered = filtered.filter(record => {
        if (filters.complications.includes("none") && !record.complications.hasComplications) return true;
        if (filters.complications.includes("has_complications") && record.complications.hasComplications) return true;
        return record.complications.type && filters.complications.includes(record.complications.type);
      });
    }

    // Filtro por rango de fechas de confirmación
    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.confirmationDate);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    // Filtro por rango de fechas de parto esperado
    if (filters.dueRange.start && filters.dueRange.end) {
      filtered = filtered.filter(record => {
        const dueDate = new Date(record.expectedCalvingDate);
        const startDate = new Date(filters.dueRange.start);
        const endDate = new Date(filters.dueRange.end);
        return dueDate >= startDate && dueDate <= endDate;
      });
    }

    setFilteredRecords(filtered);
  }, [records, filters]);

  // Estadísticas calculadas
  const stats = useMemo(() => {
    const total = records.length;
    const active = records.filter(r => r.status === "active").length;
    const early = records.filter(r => r.currentStage === "early").length;
    const middle = records.filter(r => r.currentStage === "middle").length;
    const late = records.filter(r => r.currentStage === "late").length;
    const withComplications = records.filter(r => r.complications.hasComplications).length;
    const dueThisWeek = records.filter(r => {
      const dueDate = new Date(r.expectedCalvingDate);
      const today = new Date();
      const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
      return dueDate >= today && dueDate <= nextWeek;
    }).length;

    return {
      total,
      active,
      early,
      middle,
      late,
      withComplications,
      dueThisWeek,
      averageGestationDay: records.length > 0 ? Math.round(records.reduce((sum, r) => sum + r.gestationDay, 0) / records.length) : 0,
    };
  }, [records]);

  // Funciones CRUD

  // Crear nuevo registro
  const handleCreate = (data: Partial<PregnancyRecord>) => {
    const today = new Date();
    const breedingDate = new Date(data.breedingDate || today);
    const gestationDays = Math.floor((today.getTime() - breedingDate.getTime()) / (1000 * 60 * 60 * 24));
    const expectedCalving = new Date(breedingDate.getTime() + (283 * 24 * 60 * 60 * 1000)); // 283 días promedio

    const newRecord: PregnancyRecord = {
      id: `pregnancy-${Date.now()}`,
      animalId: data.animalId || "",
      animalName: data.animalName || "",
      animalEarTag: data.animalEarTag || "",
      bullId: data.bullId,
      bullName: data.bullName,
      bullEarTag: data.bullEarTag,
      breedingDate: data.breedingDate || today.toISOString().split('T')[0],
      breedingType: data.breedingType || "natural",
      confirmationDate: data.confirmationDate || today.toISOString().split('T')[0],
      confirmationMethod: data.confirmationMethod || "ultrasound",
      gestationDay: data.gestationDay || gestationDays,
      expectedCalvingDate: data.expectedCalvingDate || expectedCalving.toISOString().split('T')[0],
      currentStage: data.currentStage || "early",
      pregnancyNumber: data.pregnancyNumber || 1,
      veterinarian: data.veterinarian || {
        id: "",
        name: "",
        license: "",
      },
      location: data.location || {
        lat: 17.989,
        lng: -92.247,
        address: "Villahermosa, Tabasco",
      },
      examinations: data.examinations || [],
      nutritionPlan: data.nutritionPlan || {
        currentStage: "maintenance",
        supplements: [],
        specialDiet: false,
        waterAccess: "good",
      },
      healthStatus: data.healthStatus || {
        overall: "good",
        bodyCondition: 3,
        weight: 500,
        temperature: 38.5,
        heartRate: 60,
        respiratoryRate: 20,
      },
      complications: data.complications || {
        hasComplications: false,
        severity: "mild",
        treatmentRequired: false,
      },
      monitoringSchedule: data.monitoringSchedule || {
        nextExamDate: "",
        frequency: "monthly",
      },
      notes: data.notes || "",
      cost: data.cost || 0,
      status: data.status || "active",
      outcome: data.outcome,
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
  const handleUpdate = (id: string, data: Partial<PregnancyRecord>) => {
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
    if (window.confirm("¿Está seguro de que desea eliminar este registro de gestación?")) {
      setRecords(prev => prev.filter(record => record.id !== id));
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      breedingType: "natural",
      confirmationMethod: "ultrasound",
      currentStage: "early",
      pregnancyNumber: 1,
      gestationDay: 0,
      cost: 0,
      status: "active",
      veterinarian: {
        id: "",
        name: "",
        license: "",
      },
      location: {
        lat: 17.989,
        lng: -92.247,
        address: "Villahermosa, Tabasco",
      },
      examinations: [],
      nutritionPlan: {
        currentStage: "maintenance",
        supplements: [],
        specialDiet: false,
        waterAccess: "good",
      },
      healthStatus: {
        overall: "good",
        bodyCondition: 3,
        weight: 500,
        temperature: 38.5,
        heartRate: 60,
        respiratoryRate: 20,
      },
      complications: {
        hasComplications: false,
        severity: "mild",
        treatmentRequired: false,
      },
      monitoringSchedule: {
        nextExamDate: "",
        frequency: "monthly",
      },
      alerts: [],
      photos: [],
    });
  };

  // Función para obtener color del estado
  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      lost: "bg-red-100 text-red-800 border-red-200",
      transferred: "bg-yellow-100 text-yellow-800 border-yellow-200",
      aborted: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  // Función para obtener color de la etapa
  const getStageColor = (stage: string) => {
    const colors = {
      early: "bg-blue-100 text-blue-800 border-blue-200",
      middle: "bg-yellow-100 text-yellow-800 border-yellow-200",
      late: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[stage as keyof typeof colors] || colors.early;
  };

  // Función para obtener color de salud
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

  // Función para calcular días restantes
  const getDaysRemaining = (dueDate: string): number => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Función para obtener icono de alerta
  const getAlertIcon = (severity: string) => {
    const icons = {
      critical: <AlertTriangle className="w-4 h-4 text-red-600" />,
      high: <AlertTriangle className="w-4 h-4 text-orange-600" />,
      medium: <Info className="w-4 h-4 text-yellow-600" />,
      low: <Info className="w-4 h-4 text-blue-600" />,
    };
    return icons[severity as keyof typeof icons] || icons.low;
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
            <p className="text-gray-600 font-medium">Cargando seguimiento de gestaciones...</p>
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
                  <AnimatedText>Seguimiento de Gestaciones</AnimatedText>
                </h1>
                <p className="text-gray-600 mt-1">
                  Monitoreo integral de embarazos y salud maternal bovina
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
                <span>Nueva Gestación</span>
              </motion.button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
            {[
              { label: "Total", value: stats.total, icon: Activity, color: "text-blue-600" },
              { label: "Activas", value: stats.active, icon: Heart, color: "text-green-600" },
              { label: "Temprana", value: stats.early, icon: Timer, color: "text-blue-600" },
              { label: "Media", value: stats.middle, icon: Clock, color: "text-yellow-600" },
              { label: "Tardía", value: stats.late, icon: Baby, color: "text-orange-600" },
              { label: "Partos Semana", value: stats.dueThisWeek, icon: Calendar, color: "text-red-600" },
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
                      placeholder="Animal, veterinario, arete..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filtro de etapa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etapa
                  </label>
                  <select
                    multiple
                    value={filters.stage}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, stage: values }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  >
                    <option value="early">Temprana (0-90d)</option>
                    <option value="middle">Media (91-210d)</option>
                    <option value="late">Tardía (210+d)</option>
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
                    <option value="active">Activa</option>
                    <option value="completed">Completada</option>
                    <option value="lost">Perdida</option>
                    <option value="transferred">Transferida</option>
                    <option value="aborted">Abortada</option>
                  </select>
                </div>

                {/* Filtro de complicaciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complicaciones
                  </label>
                  <select
                    multiple
                    value={filters.complications}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions, option => option.value);
                      setFilters(prev => ({ ...prev, complications: values }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  >
                    <option value="none">Sin Complicaciones</option>
                    <option value="has_complications">Con Complicaciones</option>
                    <option value="metabolic">Metabólicas</option>
                    <option value="reproductive">Reproductivas</option>
                    <option value="physical">Físicas</option>
                    <option value="nutritional">Nutricionales</option>
                  </select>
                </div>

                {/* Filtro de parto próximo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parto Inicio
                  </label>
                  <input
                    type="date"
                    value={filters.dueRange.start}
                    onChange={(e) => setFilters(prev => ({ 
                      ...prev, 
                      dueRange: { ...prev.dueRange, start: e.target.value }
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
                    stage: [],
                    status: [],
                    veterinarian: [],
                    complications: [],
                    pregnancyNumber: [],
                    searchTerm: "",
                    dueRange: { start: "", end: "" },
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
                Mostrando {filteredRecords.length} de {records.length} gestaciones
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
                        <Baby className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{record.animalName}</h3>
                        <p className="text-white/80 text-sm">Arete: {record.animalEarTag}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStageColor(record.currentStage)}`}>
                        {record.currentStage === "early" && "Temprana"}
                        {record.currentStage === "middle" && "Media"}
                        {record.currentStage === "late" && "Tardía"}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                        {record.status === "active" && "Activa"}
                        {record.status === "completed" && "Completada"}
                        {record.status === "lost" && "Perdida"}
                        {record.status === "transferred" && "Transferida"}
                        {record.status === "aborted" && "Abortada"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-4 space-y-4">
                  {/* Información principal */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-medium">Día Gestación:</p>
                      <p className="text-2xl font-bold text-[#519a7c]">{record.gestationDay}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Días Restantes:</p>
                      <p className="text-2xl font-bold text-orange-600">{getDaysRemaining(record.expectedCalvingDate)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Parto Esperado:</p>
                      <p className="text-gray-900">{new Date(record.expectedCalvingDate).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-medium">Gestación #:</p>
                      <p className="text-gray-900">{record.pregnancyNumber}</p>
                    </div>
                  </div>

                  {/* Información del toro */}
                  {record.bullName && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <Crown className="w-4 h-4 mr-2 text-blue-600" />
                        Información del Toro
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Nombre:</span> {record.bullName}</p>
                        <p><span className="text-gray-600">Arete:</span> {record.bullEarTag}</p>
                        <p><span className="text-gray-600">Tipo apareamiento:</span> 
                          <span className="ml-1">
                            {record.breedingType === "natural" && "Natural"}
                            {record.breedingType === "artificial_insemination" && "IA"}
                            {record.breedingType === "embryo_transfer" && "Transferencia"}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Estado de salud */}
                  <div className="bg-green-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Stethoscope className="w-4 h-4 mr-2 text-green-600" />
                      Estado de Salud
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">General:</p>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(record.healthStatus.overall)}`}>
                          {record.healthStatus.overall === "excellent" && "Excelente"}
                          {record.healthStatus.overall === "good" && "Bueno"}
                          {record.healthStatus.overall === "fair" && "Regular"}
                          {record.healthStatus.overall === "poor" && "Malo"}
                          {record.healthStatus.overall === "critical" && "Crítico"}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-600">Condición Corporal:</p>
                        <p className="font-medium text-[#519a7c]">{record.healthStatus.bodyCondition}/5</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Peso:</p>
                        <p className="font-medium">{record.healthStatus.weight} kg</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Temperatura:</p>
                        <p className="font-medium">{record.healthStatus.temperature}°C</p>
                      </div>
                    </div>
                  </div>

                  {/* Complicaciones */}
                  {record.complications.hasComplications && (
                    <div className="bg-red-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                        Complicaciones
                      </h4>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-gray-600">Tipo:</span> {record.complications.type}</p>
                        <p><span className="text-gray-600">Severidad:</span> 
                          <span className={`ml-1 font-medium ${
                            record.complications.severity === "severe" ? "text-red-600" :
                            record.complications.severity === "moderate" ? "text-yellow-600" :
                            "text-green-600"
                          }`}>
                            {record.complications.severity === "severe" && "Severa"}
                            {record.complications.severity === "moderate" && "Moderada"}
                            {record.complications.severity === "mild" && "Leve"}
                          </span>
                        </p>
                        {record.complications.description && (
                          <p className="text-gray-700 mt-1">{record.complications.description}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Veterinario */}
                  <div className="bg-purple-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2 text-purple-600" />
                      Veterinario Responsable
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Nombre:</span> {record.veterinarian.name}</p>
                      <p><span className="text-gray-600">Licencia:</span> {record.veterinarian.license}</p>
                      {record.veterinarian.phone && (
                        <p><span className="text-gray-600">Teléfono:</span> {record.veterinarian.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Próximo examen */}
                  <div className="bg-yellow-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-yellow-600" />
                      Próximo Examen
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p><span className="text-gray-600">Fecha:</span> {new Date(record.monitoringSchedule.nextExamDate).toLocaleDateString()}</p>
                      <p><span className="text-gray-600">Frecuencia:</span> 
                        <span className="ml-1">
                          {record.monitoringSchedule.frequency === "weekly" && "Semanal"}
                          {record.monitoringSchedule.frequency === "biweekly" && "Quincenal"}
                          {record.monitoringSchedule.frequency === "monthly" && "Mensual"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Alertas activas */}
                  {record.alerts.filter(alert => !alert.resolved).length > 0 && (
                    <div className="bg-orange-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                        <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                        Alertas Activas ({record.alerts.filter(alert => !alert.resolved).length})
                      </h4>
                      <div className="space-y-2">
                        {record.alerts.filter(alert => !alert.resolved).slice(0, 2).map((alert) => (
                          <div key={alert.id} className="flex items-start space-x-2 text-sm">
                            {getAlertIcon(alert.severity)}
                            <div>
                              <p className="font-medium text-gray-900">{alert.title}</p>
                              <p className="text-gray-600">{alert.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ubicación */}
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{record.location.address}</span>
                  </div>

                  {/* Costo total */}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#519a7c]">
                      ${record.cost.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {record.examinations.length} exámenes
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
        ) : viewMode === "list" ? (
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
                    <th className="px-6 py-4 text-left text-sm font-medium">Gestación</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Etapa</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Parto Esperado</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Salud</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Veterinario</th>
                    <th className="px-6 py-4 text-left text-sm font-medium">Estado</th>
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
                          <p className="font-bold text-[#519a7c]">Día {record.gestationDay}</p>
                          <p className="text-sm text-gray-600">Gestación #{record.pregnancyNumber}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStageColor(record.currentStage)}`}>
                          {record.currentStage === "early" && "Temprana"}
                          {record.currentStage === "middle" && "Media"}
                          {record.currentStage === "late" && "Tardía"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-gray-900">{new Date(record.expectedCalvingDate).toLocaleDateString()}</p>
                          <p className="text-sm text-orange-600 font-medium">{getDaysRemaining(record.expectedCalvingDate)} días</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(record.healthStatus.overall)}`}>
                          {record.healthStatus.overall === "excellent" && "Excelente"}
                          {record.healthStatus.overall === "good" && "Bueno"}
                          {record.healthStatus.overall === "fair" && "Regular"}
                          {record.healthStatus.overall === "poor" && "Malo"}
                          {record.healthStatus.overall === "critical" && "Crítico"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{record.veterinarian.name}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status === "active" && "Activa"}
                          {record.status === "completed" && "Completada"}
                          {record.status === "lost" && "Perdida"}
                          {record.status === "transferred" && "Transferida"}
                          {record.status === "aborted" && "Abortada"}
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
        ) : (
          // Vista de calendario (próximos partos)
          <motion.div
            className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
            variants={itemVariants}
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-[#519a7c]" />
              Calendario de Partos
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRecords
                .sort((a, b) => new Date(a.expectedCalvingDate).getTime() - new Date(b.expectedCalvingDate).getTime())
                .slice(0, 12)
                .map((record) => (
                  <motion.div
                    key={record.id}
                    className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border-l-4 border-[#519a7c]"
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-gray-900">{record.animalName}</h3>
                      <span className="text-sm text-gray-600">{record.animalEarTag}</span>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p><span className="font-medium text-gray-600">Parto esperado:</span> {new Date(record.expectedCalvingDate).toLocaleDateString()}</p>
                      <p><span className="font-medium text-gray-600">Días restantes:</span> 
                        <span className={`ml-1 font-bold ${
                          getDaysRemaining(record.expectedCalvingDate) <= 7 ? "text-red-600" :
                          getDaysRemaining(record.expectedCalvingDate) <= 30 ? "text-orange-600" :
                          "text-green-600"
                        }`}>
                          {getDaysRemaining(record.expectedCalvingDate)}
                        </span>
                      </p>
                      <p><span className="font-medium text-gray-600">Gestación:</span> Día {record.gestationDay}</p>
                      <p><span className="font-medium text-gray-600">Veterinario:</span> {record.veterinarian.name}</p>
                    </div>
                    
                    {getDaysRemaining(record.expectedCalvingDate) <= 7 && (
                      <div className="mt-3 bg-red-100 border border-red-200 rounded-lg p-2">
                        <p className="text-red-800 text-xs font-medium">
                          ⚠️ Parto inminente - Requiere monitoreo intensivo
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
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
                      <Baby className="w-6 h-6" />
                      <h2 className="text-xl font-bold">
                        {editingRecord ? "Editar Gestación" : "Nueva Gestación"}
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

                {/* Contenido del formulario - Simplificado para ejemplo */}
                <div className="p-6 space-y-6">
                  {/* Información básica del animal */}
                  <div className="bg-blue-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Heart className="w-5 h-5 mr-2 text-blue-600" />
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

                  {/* Información de gestación */}
                  <div className="bg-green-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                      <Baby className="w-5 h-5 mr-2 text-green-600" />
                      Detalles de Gestación
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Apareamiento *
                        </label>
                        <input
                          type="date"
                          value={formData.breedingDate || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, breedingDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Confirmación *
                        </label>
                        <input
                          type="date"
                          value={formData.confirmationDate || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmationDate: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Método de Confirmación *
                        </label>
                        <select
                          value={formData.confirmationMethod || "ultrasound"}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmationMethod: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          required
                        >
                          <option value="ultrasound">Ultrasonido</option>
                          <option value="palpation">Palpación</option>
                          <option value="blood_test">Análisis de Sangre</option>
                          <option value="visual">Visual</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Gestación
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formData.pregnancyNumber || 1}
                          onChange={(e) => setFormData(prev => ({ ...prev, pregnancyNumber: parseInt(e.target.value) || 1 }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Información adicional simplificada */}
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
                          value={formData.status || "active"}
                          onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        >
                          <option value="active">Activa</option>
                          <option value="completed">Completada</option>
                          <option value="lost">Perdida</option>
                          <option value="transferred">Transferida</option>
                          <option value="aborted">Abortada</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Costo Total ($)
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
                        Notas Generales
                      </label>
                      <textarea
                        value={formData.notes || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        rows={3}
                        placeholder="Observaciones sobre la gestación..."
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

        {/* Modal de detalles completo */}
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
                className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
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
                      <p className="text-white/80">Arete: {selectedRecord.animalEarTag} • Gestación #{selectedRecord.pregnancyNumber}</p>
                    </div>
                    <button
                      onClick={() => setSelectedRecord(null)}
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Contenido del modal con toda la información */}
                <div className="p-6 space-y-6">
                  {/* Información general resumida */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Estado de Gestación</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-gray-600">Día:</span> {selectedRecord.gestationDay}</p>
                        <p><span className="font-medium text-gray-600">Etapa:</span> {selectedRecord.currentStage}</p>
                        <p><span className="font-medium text-gray-600">Días restantes:</span> {getDaysRemaining(selectedRecord.expectedCalvingDate)}</p>
                        <p><span className="font-medium text-gray-600">Parto esperado:</span> {new Date(selectedRecord.expectedCalvingDate).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Estado de Salud</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-gray-600">General:</span> {selectedRecord.healthStatus.overall}</p>
                        <p><span className="font-medium text-gray-600">Condición corporal:</span> {selectedRecord.healthStatus.bodyCondition}/5</p>
                        <p><span className="font-medium text-gray-600">Peso:</span> {selectedRecord.healthStatus.weight} kg</p>
                        <p><span className="font-medium text-gray-600">Temperatura:</span> {selectedRecord.healthStatus.temperature}°C</p>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Veterinario</h3>
                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium text-gray-600">Nombre:</span> {selectedRecord.veterinarian.name}</p>
                        <p><span className="font-medium text-gray-600">Licencia:</span> {selectedRecord.veterinarian.license}</p>
                        {selectedRecord.veterinarian.phone && (
                          <p><span className="font-medium text-gray-600">Teléfono:</span> {selectedRecord.veterinarian.phone}</p>
                        )}
                        {selectedRecord.veterinarian.email && (
                          <p><span className="font-medium text-gray-600">Email:</span> {selectedRecord.veterinarian.email}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Historial de exámenes */}
                  <div className="bg-yellow-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Historial de Exámenes ({selectedRecord.examinations.length})</h3>
                    <div className="space-y-3">
                      {selectedRecord.examinations.slice(0, 3).map((exam) => (
                        <div key={exam.id} className="bg-white rounded-lg p-3 border">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-medium text-gray-900">{new Date(exam.date).toLocaleDateString()} - {exam.time}</p>
                              <p className="text-sm text-gray-600">Día {exam.gestationDay} • {exam.type}</p>
                            </div>
                            <span className="text-sm font-medium text-[#519a7c]">${exam.cost}</span>
                          </div>
                          <p className="text-sm text-gray-700">{exam.notes}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {exam.recommendations.slice(0, 2).map((rec, index) => (
                              <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {rec}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Notas */}
                  {selectedRecord.notes && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Notas Generales</h3>
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
                <Baby className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No se encontraron gestaciones
              </h3>
              <p className="text-gray-600 mb-6">
                No hay registros de gestación que coincidan con los filtros aplicados.
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
                <span>Registrar Primera Gestación</span>
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default PregnancyTracking;