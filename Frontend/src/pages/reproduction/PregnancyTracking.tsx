import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Filter,
  Calendar,
  MapPin,
  Heart,
  Baby,
  Stethoscope,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  X,
  Save,
  FileText,
  Menu,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ========================================
// INTERFACES Y TIPOS
// ========================================

interface Veterinarian {
  id: string;
  name: string;
  license: string;
  phone: string;
  email: string;
}

interface Location {
  lat: number;
  lng: number;
  address: string;
  paddock: string;
  facility: string;
}

interface Examination {
  id: string;
  date: string;
  time: string;
  type: "routine" | "emergency" | "pre_calving";
  veterinarian: string;
  gestationDay: number;
  findings: {
    fetalMovement: "none" | "weak" | "moderate" | "strong";
    fetalSize: "small" | "normal" | "large";
    placentalHealth: "normal" | "concerning" | "abnormal";
    amnioticFluid: "normal" | "low" | "excessive";
    cervicalCondition: "closed" | "soft" | "dilated";
  };
  measurements: {
    fetalLength?: number;
    fetalWeight?: number;
    heartRate?: number;
  };
  recommendations: string[];
  nextExamDate?: string;
  cost: number;
  notes: string;
}

interface NutritionPlan {
  currentStage: "normal" | "increased" | "pre_calving";
  supplements: string[];
  specialDiet: boolean;
  waterAccess: "poor" | "fair" | "good" | "excellent";
  notes: string;
}

interface HealthStatus {
  overall: "poor" | "fair" | "good" | "excellent";
  bodyCondition: number; // 1-5 scale
  weight: number;
  temperature: number;
  heartRate: number;
  respiratoryRate: number;
  bloodPressure?: string;
}

interface Complications {
  hasComplications: boolean;
  type?: "nutritional" | "infectious" | "metabolic" | "physical" | "other";
  description?: string;
  severity?: "mild" | "moderate" | "severe";
  treatmentRequired: boolean;
  veterinaryAction?: string;
}

interface MonitoringSchedule {
  nextExamDate: string;
  frequency: "weekly" | "biweekly" | "monthly";
  specialRequirements: string[];
}

interface Alert {
  id: string;
  type: "health" | "nutrition" | "emergency" | "routine";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  message: string;
  date: string;
  resolved: boolean;
}

type BreedingType = "natural_mating" | "artificial_insemination" | "embryo_transfer";
type ConfirmationMethod = "ultrasound" | "palpation" | "blood_test" | "hormone_test";
type PregnancyStage = "early" | "middle" | "late";
type PregnancyStatus = "active" | "completed" | "terminated" | "lost";

interface PregnancyRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalEarTag: string;
  bullId: string;
  bullName: string;
  bullEarTag: string;
  breedingDate: string;
  breedingType: BreedingType;
  confirmationDate: string;
  confirmationMethod: ConfirmationMethod;
  gestationDay: number;
  expectedCalvingDate: string;
  currentStage: PregnancyStage;
  pregnancyNumber: number;
  veterinarian: Veterinarian;
  location: Location;
  examinations: Examination[];
  nutritionPlan: NutritionPlan;
  healthStatus: HealthStatus;
  complications: Complications;
  monitoringSchedule: MonitoringSchedule;
  notes: string;
  cost: number;
  status: PregnancyStatus;
  alerts: Alert[];
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

interface FilterOptions {
  searchTerm: string;
  breedingType: BreedingType | "";
  currentStage: PregnancyStage | "";
  status: PregnancyStatus | "";
  veterinarian: string;
  hasComplications: string;
  dateRange: {
    start: string;
    end: string;
  };
}

interface FormDataType {
  animalName?: string;
  animalEarTag?: string;
  bullName?: string;
  bullEarTag?: string;
  breedingDate?: string;
  breedingType?: BreedingType;
  confirmationDate?: string;
  confirmationMethod?: ConfirmationMethod;
  gestationDay?: number;
  expectedCalvingDate?: string;
  currentStage?: PregnancyStage;
  pregnancyNumber?: number;
  status?: PregnancyStatus;
  notes?: string;
}

// ========================================
// COMPONENTES UI REUTILIZABLES
// ========================================

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "ghost";
  size?: "xs" | "sm" | "md" | "lg";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  className = "",
  type = "button",
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";
  
  const variants = {
    primary: "bg-[#519a7c] text-white hover:bg-[#4a8b6e] focus-visible:ring-[#519a7c]",
    secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 focus-visible:ring-gray-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus-visible:ring-yellow-600",
    error: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
    ghost: "hover:bg-gray-100 focus-visible:ring-gray-500",
  };
  
  const sizes = {
    xs: "h-7 px-2 text-xs",
    sm: "h-8 px-3 text-sm",
    md: "h-9 px-4 py-2 text-sm",
    lg: "h-11 px-6 text-base",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
};

interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  disabled?: boolean;
}

const Input: React.FC<InputProps> = ({
  type = "text",
  placeholder,
  value,
  onChange,
  className = "",
  disabled = false,
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    disabled={disabled}
    className={`flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#519a7c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  />
);

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  children,
  value,
  onChange,
  className = "",
  disabled = false,
}) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    disabled={disabled}
    className={`flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#519a7c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </select>
);

interface TextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  className?: string;
  rows?: number;
  disabled?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({
  placeholder,
  value,
  onChange,
  className = "",
  rows = 3,
  disabled = false,
}) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    rows={rows}
    disabled={disabled}
    className={`flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#519a7c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${className}`}
  />
);

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`rounded-lg border border-gray-200 bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`flex flex-col space-y-1.5 p-4 sm:p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<CardProps> = ({ children, className = "" }) => (
  <h3 className={`text-base sm:text-lg font-medium leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent: React.FC<CardProps> = ({ children, className = "" }) => (
  <div className={`p-4 pt-0 sm:p-6 sm:pt-0 ${className}`}>
    {children}
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className = "" }) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ========================================
// COMPONENTE DE PREGNANCY CARD PARA MÓVILES
// ========================================
interface PregnancyCardProps {
  pregnancy: PregnancyRecord;
  onView: (pregnancy: PregnancyRecord) => void;
  onEdit: (pregnancy: PregnancyRecord) => void;
  onDelete: (pregnancy: PregnancyRecord) => void;
}

const PregnancyCard: React.FC<PregnancyCardProps> = ({ pregnancy, onView, onEdit, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = (status: PregnancyStatus) => {
    const statusConfig = {
      active: { variant: "success" as const, label: "Activo" },
      completed: { variant: "info" as const, label: "Completado" },
      terminated: { variant: "error" as const, label: "Terminado" },
      lost: { variant: "error" as const, label: "Perdido" },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStageBadge = (stage: PregnancyStage) => {
    const stageConfig = {
      early: { variant: "info" as const, label: "Temprano" },
      middle: { variant: "warning" as const, label: "Medio" },
      late: { variant: "error" as const, label: "Tardío" },
    };
    
    const config = stageConfig[stage];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getBreedingTypeBadge = (type: BreedingType) => {
    const typeLabels = {
      natural_mating: "Monta Natural",
      artificial_insemination: "IA",
      embryo_transfer: "TE",
    };
    
    return <Badge variant="default">{typeLabels[type]}</Badge>;
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Header de la card */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">
              {pregnancy.animalName}
            </h3>
            <p className="text-sm text-gray-500">
              {pregnancy.animalEarTag}
            </p>
          </div>
          <div className="flex items-center gap-2 ml-3">
            {getStatusBadge(pregnancy.status)}
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Información básica siempre visible */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-500">Toro</p>
            <p className="text-sm font-medium">{pregnancy.bullName}</p>
            <p className="text-xs text-gray-400">{pregnancy.bullEarTag}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Gestación</p>
            <p className="text-sm font-medium">{pregnancy.gestationDay} días</p>
            <p className="text-xs text-gray-400">#{pregnancy.pregnancyNumber}</p>
          </div>
        </div>

        {/* Información expandible */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="border-t pt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Tipo</p>
                    {getBreedingTypeBadge(pregnancy.breedingType)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Etapa</p>
                    {getStageBadge(pregnancy.currentStage)}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Fecha de Parto</p>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                    {new Date(pregnancy.expectedCalvingDate).toLocaleDateString('es-ES')}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500">Complicaciones</p>
                  {pregnancy.complications.hasComplications ? (
                    <Badge variant="warning">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Sí
                    </Badge>
                  ) : (
                    <Badge variant="success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      No
                    </Badge>
                  )}
                </div>

                <div>
                  <p className="text-xs text-gray-500">Veterinario</p>
                  <p className="text-sm">{pregnancy.veterinarian.name}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Acciones */}
        <div className="flex items-center justify-end gap-1 mt-3 pt-3 border-t">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onView(pregnancy)}
            className="text-blue-600 hover:text-blue-900"
          >
            <Eye className="h-3 w-3 mr-1" />
            Ver
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onEdit(pregnancy)}
            className="text-yellow-600 hover:text-yellow-900"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Editar
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onDelete(pregnancy)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Eliminar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ========================================
// DATOS MOCK
// ========================================

const mockPregnancies: PregnancyRecord[] = [
  {
    id: "pregnancy-001",
    animalId: "cow-123",
    animalName: "Bella",
    animalEarTag: "MX-001",
    bullId: "bull-001",
    bullName: "Campeón",
    bullEarTag: "T-001",
    breedingDate: "2025-04-15",
    breedingType: "artificial_insemination",
    confirmationDate: "2025-05-15",
    confirmationMethod: "ultrasound",
    gestationDay: 92,
    expectedCalvingDate: "2025-12-31",
    currentStage: "middle",
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
        date: "2025-07-15",
        time: "09:00",
        type: "routine",
        veterinarian: "Dr. García",
        gestationDay: 92,
        findings: {
          fetalMovement: "strong",
          fetalSize: "normal",
          placentalHealth: "normal",
          amnioticFluid: "normal",
          cervicalCondition: "closed",
        },
        measurements: {
          fetalLength: 18.5,
          fetalWeight: 8.2,
          heartRate: 165,
        },
        recommendations: ["Continuar monitoreo mensual", "Suplementos vitamínicos"],
        nextExamDate: "2025-08-15",
        cost: 800,
        notes: "Desarrollo fetal normal. Sin complicaciones observadas.",
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
      treatmentRequired: false,
    },
    monitoringSchedule: {
      nextExamDate: "2025-08-15",
      frequency: "monthly",
      specialRequirements: ["Ultrasonido mensual", "Análisis de sangre"],
    },
    notes: "Gestación transcurriendo normalmente. Vaca en excelentes condiciones.",
    cost: 15000,
    status: "active",
    alerts: [],
    photos: ["ultrasound_001.jpg", "exam_002.jpg"],
    createdAt: "2025-05-15T09:00:00Z",
    updatedAt: "2025-07-15T10:30:00Z",
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
    breedingType: "natural_mating",
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
        date: "2025-07-10",
        time: "14:00",
        type: "routine",
        veterinarian: "Dra. Martínez",
        gestationDay: 112,
        findings: {
          fetalMovement: "moderate",
          fetalSize: "normal",
          placentalHealth: "normal",
          amnioticFluid: "normal",
          cervicalCondition: "closed",
        },
        measurements: {
          fetalLength: 22.0,
          heartRate: 170,
        },
        recommendations: ["Monitoreo cada 3 semanas", "Suplementación mineral"],
        nextExamDate: "2025-08-01",
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
      nextExamDate: "2025-08-01",
      frequency: "biweekly",
      specialRequirements: ["Control de peso semanal"],
    },
    notes: "Primera gestación. Requiere monitoreo cercano de condición corporal.",
    cost: 12000,
    status: "active",
    alerts: [
      {
        id: "alert-001",
        type: "nutrition",
        severity: "medium",
        title: "Pérdida de Condición Corporal",
        message: "Se observa ligera pérdida de peso. Revisar plan nutricional.",
        date: "2025-07-10T00:00:00Z",
        resolved: false,
      },
    ],
    photos: ["luna_exam_001.jpg"],
    createdAt: "2025-04-20T14:00:00Z",
    updatedAt: "2025-07-10T16:00:00Z",
  },
];

const mockVeterinarians: Veterinarian[] = [
  {
    id: "vet-001",
    name: "Dr. García",
    license: "MVZ-123456",
    phone: "+52 993 123 4567",
    email: "dr.garcia@veterinaria.com",
  },
  {
    id: "vet-002",
    name: "Dra. Martínez",
    license: "MVZ-789012",
    phone: "+52 993 987 6543",
    email: "dra.martinez@reprovet.com",
  },
];

// ========================================
// COMPONENTE PRINCIPAL
// ========================================

const PregnancyTracking: React.FC = () => {
  // Estados principales
  const [pregnancies, setPregnancies] = useState<PregnancyRecord[]>(mockPregnancies);
  const [veterinarians] = useState<Veterinarian[]>(mockVeterinarians);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estados para modales y formularios
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedPregnancy, setSelectedPregnancy] = useState<PregnancyRecord | null>(null);
  const [formData, setFormData] = useState<FormDataType>({});

  // Estados para modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [pregnancyToDelete, setPregnancyToDelete] = useState<PregnancyRecord | null>(null);

  // Estados para filtros y vista
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    breedingType: "",
    currentStage: "",
    status: "",
    veterinarian: "",
    hasComplications: "",
    dateRange: {
      start: "",
      end: "",
    },
  });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Detectar si es móvil
  const [isMobile, setIsMobile] = useState<boolean>(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setViewMode(window.innerWidth < 768 ? "cards" : "table");
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Variantes de animación
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
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

  // Filtrado de datos
  const filteredPregnancies = useMemo(() => {
    return pregnancies.filter((pregnancy) => {
      const matchesSearch = 
        pregnancy.animalName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        pregnancy.animalEarTag.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        pregnancy.bullName.toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesBreedingType = !filters.breedingType || pregnancy.breedingType === filters.breedingType;
      const matchesStage = !filters.currentStage || pregnancy.currentStage === filters.currentStage;
      const matchesStatus = !filters.status || pregnancy.status === filters.status;
      const matchesVeterinarian = !filters.veterinarian || pregnancy.veterinarian.id === filters.veterinarian;
      const matchesComplications = !filters.hasComplications || 
        (filters.hasComplications === "true" && pregnancy.complications.hasComplications) ||
        (filters.hasComplications === "false" && !pregnancy.complications.hasComplications);

      return matchesSearch && matchesBreedingType && matchesStage && 
             matchesStatus && matchesVeterinarian && matchesComplications;
    });
  }, [pregnancies, filters]);

  // Estadísticas
  const stats = useMemo(() => {
    const total = pregnancies.length;
    const active = pregnancies.filter(p => p.status === "active").length;
    const withComplications = pregnancies.filter(p => p.complications.hasComplications).length;
    const nearCalving = pregnancies.filter(p => p.gestationDay > 250).length;

    return { total, active, withComplications, nearCalving };
  }, [pregnancies]);

  // Funciones CRUD
  const handleCreate = () => {
    setFormData({
      animalName: "",
      animalEarTag: "",
      bullName: "",
      bullEarTag: "",
      breedingDate: "",
      breedingType: "artificial_insemination",
      confirmationDate: "",
      confirmationMethod: "ultrasound",
      gestationDay: 0,
      expectedCalvingDate: "",
      currentStage: "early",
      pregnancyNumber: 1,
      status: "active",
      notes: "",
    });
    setIsCreateModalOpen(true);
  };

  const handleEdit = (pregnancy: PregnancyRecord) => {
    setSelectedPregnancy(pregnancy);
    setFormData(pregnancy);
    setIsEditModalOpen(true);
  };

  const handleView = (pregnancy: PregnancyRecord) => {
    setSelectedPregnancy(pregnancy);
    setIsViewModalOpen(true);
  };

  const handleDeleteClick = useCallback((pregnancy: PregnancyRecord) => {
    setPregnancyToDelete(pregnancy);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!pregnancyToDelete) return;

    try {
      setIsLoading(true);
      
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setPregnancies(prev => {
        const newPregnancies = prev.filter(p => p.id !== pregnancyToDelete.id);
        return newPregnancies;
      });
      
      // Cerrar modales si están abiertos
      if (selectedPregnancy?.id === pregnancyToDelete.id) {
        setSelectedPregnancy(null);
        setIsViewModalOpen(false);
        setIsEditModalOpen(false);
      }
      
      // Cerrar modal de confirmación
      setShowDeleteModal(false);
      setPregnancyToDelete(null);
      
    } catch (err) {
      setError("Error al eliminar el registro de embarazo");
    } finally {
      setIsLoading(false);
    }
  }, [pregnancyToDelete, selectedPregnancy]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (selectedPregnancy) {
        // Actualizar
        const updatedData: Partial<PregnancyRecord> = {};
        
        if (formData.animalName !== undefined) updatedData.animalName = formData.animalName;
        if (formData.animalEarTag !== undefined) updatedData.animalEarTag = formData.animalEarTag;
        if (formData.bullName !== undefined) updatedData.bullName = formData.bullName;
        if (formData.bullEarTag !== undefined) updatedData.bullEarTag = formData.bullEarTag;
        if (formData.breedingDate !== undefined) updatedData.breedingDate = formData.breedingDate;
        if (formData.breedingType !== undefined) updatedData.breedingType = formData.breedingType;
        if (formData.confirmationDate !== undefined) updatedData.confirmationDate = formData.confirmationDate;
        if (formData.confirmationMethod !== undefined) updatedData.confirmationMethod = formData.confirmationMethod;
        if (formData.gestationDay !== undefined) updatedData.gestationDay = formData.gestationDay;
        if (formData.expectedCalvingDate !== undefined) updatedData.expectedCalvingDate = formData.expectedCalvingDate;
        if (formData.currentStage !== undefined) updatedData.currentStage = formData.currentStage;
        if (formData.pregnancyNumber !== undefined) updatedData.pregnancyNumber = formData.pregnancyNumber;
        if (formData.status !== undefined) updatedData.status = formData.status;
        if (formData.notes !== undefined) updatedData.notes = formData.notes;
        
        updatedData.updatedAt = new Date().toISOString();
        
        setPregnancies(prev => prev.map(p => 
          p.id === selectedPregnancy.id 
            ? { ...p, ...updatedData }
            : p
        ));
        setIsEditModalOpen(false);
      } else {
        // Crear nuevo
        const newPregnancy: PregnancyRecord = {
          id: `pregnancy-${Date.now()}`,
          animalId: `cow-${Date.now()}`,
          animalName: formData.animalName || "",
          animalEarTag: formData.animalEarTag || "",
          bullId: `bull-${Date.now()}`,
          bullName: formData.bullName || "",
          bullEarTag: formData.bullEarTag || "",
          breedingDate: formData.breedingDate || "",
          breedingType: formData.breedingType || "artificial_insemination",
          confirmationDate: formData.confirmationDate || "",
          confirmationMethod: formData.confirmationMethod || "ultrasound",
          gestationDay: formData.gestationDay || 0,
          expectedCalvingDate: formData.expectedCalvingDate || "",
          currentStage: formData.currentStage || "early",
          pregnancyNumber: formData.pregnancyNumber || 1,
          status: formData.status || "active",
          notes: formData.notes || "",
          veterinarian: veterinarians[0],
          location: {
            lat: 17.989,
            lng: -92.247,
            address: "Potrero Norte, Rancho San Miguel",
            paddock: "Potrero 1",
            facility: "Área de Maternidad",
          },
          examinations: [],
          nutritionPlan: {
            currentStage: "normal",
            supplements: [],
            specialDiet: false,
            waterAccess: "good",
            notes: "",
          },
          healthStatus: {
            overall: "good",
            bodyCondition: 3,
            weight: 500,
            temperature: 38.5,
            heartRate: 70,
            respiratoryRate: 20,
          },
          complications: {
            hasComplications: false,
            treatmentRequired: false,
          },
          monitoringSchedule: {
            nextExamDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            frequency: "monthly",
            specialRequirements: [],
          },
          cost: 0,
          alerts: [],
          photos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setPregnancies(prev => [...prev, newPregnancy]);
        setIsCreateModalOpen(false);
      }

      setFormData({});
      setSelectedPregnancy(null);
    } catch (err) {
      setError("Error al guardar el registro");
    } finally {
      setIsLoading(false);
    }
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      breedingType: "",
      currentStage: "",
      status: "",
      veterinarian: "",
      hasComplications: "",
      dateRange: { start: "", end: "" },
    });
  };

  // Funciones auxiliares para badges
  const getStatusBadge = (status: PregnancyStatus) => {
    const statusConfig = {
      active: { variant: "success" as const, label: "Activo" },
      completed: { variant: "info" as const, label: "Completado" },
      terminated: { variant: "error" as const, label: "Terminado" },
      lost: { variant: "error" as const, label: "Perdido" },
    };
    
    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStageBadge = (stage: PregnancyStage) => {
    const stageConfig = {
      early: { variant: "info" as const, label: "Temprano" },
      middle: { variant: "warning" as const, label: "Medio" },
      late: { variant: "error" as const, label: "Tardío" },
    };
    
    const config = stageConfig[stage];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getBreedingTypeBadge = (type: BreedingType) => {
    const typeLabels = {
      natural_mating: "Monta Natural",
      artificial_insemination: "IA",
      embryo_transfer: "TE",
    };
    
    return <Badge variant="default">{typeLabels[type]}</Badge>;
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 p-3 sm:p-4 md:p-6"
    >
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center px-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Seguimiento de Embarazos
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gestión completa del programa de reproducción bovina
          </p>
        </motion.div>

        {/* Estadísticas */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-xs sm:text-sm font-medium">Total</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Baby className="h-6 w-6 sm:h-8 sm:w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-xs sm:text-sm font-medium">Activos</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.active}</p>
                  </div>
                  <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-yellow-100 text-xs sm:text-sm font-medium">Complicaciones</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.withComplications}</p>
                  </div>
                  <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-xs sm:text-sm font-medium">Próximas al Parto</p>
                    <p className="text-xl sm:text-2xl font-bold">{stats.nearCalving}</p>
                  </div>
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Controles y filtros */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardContent className="p-3 sm:p-6">
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex flex-col sm:flex-row gap-3 flex-1">
                    <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Buscar por vaca, etiqueta o toro..."
                        value={filters.searchTerm}
                        onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                        className="pl-10"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2"
                        size="sm"
                      >
                        <Filter className="h-4 w-4" />
                        Filtros
                      </Button>
                      {!isMobile && (
                        <Button
                          variant="secondary"
                          onClick={() => setViewMode(viewMode === "table" ? "cards" : "table")}
                          className="flex items-center gap-2"
                          size="sm"
                        >
                          <Menu className="h-4 w-4" />
                          {viewMode === "table" ? "Cards" : "Tabla"}
                        </Button>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={handleCreate}
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Nuevo Embarazo
                  </Button>
                </div>

                {/* Panel de filtros expandible */}
                <AnimatePresence>
                  {showFilters && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pt-3 border-t border-gray-200 overflow-hidden"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                        <Select
                          value={filters.breedingType}
                          onChange={(value) => setFilters(prev => ({ ...prev, breedingType: value as BreedingType | "" }))}
                        >
                          <option value="">Tipo de Reproducción</option>
                          <option value="natural_mating">Monta Natural</option>
                          <option value="artificial_insemination">Inseminación Artificial</option>
                          <option value="embryo_transfer">Transferencia de Embriones</option>
                        </Select>

                        <Select
                          value={filters.currentStage}
                          onChange={(value) => setFilters(prev => ({ ...prev, currentStage: value as PregnancyStage | "" }))}
                        >
                          <option value="">Etapa de Gestación</option>
                          <option value="early">Temprano (0-84 días)</option>
                          <option value="middle">Medio (85-210 días)</option>
                          <option value="late">Tardío (211-280 días)</option>
                        </Select>

                        <Select
                          value={filters.status}
                          onChange={(value) => setFilters(prev => ({ ...prev, status: value as PregnancyStatus | "" }))}
                        >
                          <option value="">Estado</option>
                          <option value="active">Activo</option>
                          <option value="completed">Completado</option>
                          <option value="terminated">Terminado</option>
                          <option value="lost">Perdido</option>
                        </Select>

                        <Select
                          value={filters.veterinarian}
                          onChange={(value) => setFilters(prev => ({ ...prev, veterinarian: value }))}
                        >
                          <option value="">Veterinario</option>
                          {veterinarians.map(vet => (
                            <option key={vet.id} value={vet.id}>{vet.name}</option>
                          ))}
                        </Select>

                        <Select
                          value={filters.hasComplications}
                          onChange={(value) => setFilters(prev => ({ ...prev, hasComplications: value }))}
                        >
                          <option value="">Complicaciones</option>
                          <option value="true">Con Complicaciones</option>
                          <option value="false">Sin Complicaciones</option>
                        </Select>

                        <Button
                          variant="secondary"
                          onClick={resetFilters}
                          className="h-9 w-full"
                          size="sm"
                        >
                          Limpiar
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div variants={itemVariants}>
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">{error}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setError(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Lista de embarazos - Responsive */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Baby className="h-5 w-5 text-[#519a7c]" />
                  <span className="text-sm sm:text-base">
                    Registros de Embarazos ({filteredPregnancies.length})
                  </span>
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {viewMode === "cards" || isMobile ? (
                // Vista de cards para móviles
                <div className="p-3 sm:p-6 space-y-3">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Activity className="h-6 w-6 animate-spin text-[#519a7c] mr-2" />
                      <span className="text-sm">Cargando...</span>
                    </div>
                  ) : filteredPregnancies.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Baby className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-sm">No se encontraron registros de embarazos</p>
                    </div>
                  ) : (
                    filteredPregnancies.map((pregnancy) => (
                      <PregnancyCard
                        key={pregnancy.id}
                        pregnancy={pregnancy}
                        onView={handleView}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                      />
                    ))
                  )}
                </div>
              ) : (
                // Vista de tabla para desktop
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vaca
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Toro
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Días de Gestación
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Etapa
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha de Parto
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Complicaciones
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {isLoading ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center">
                            <div className="flex items-center justify-center">
                              <Activity className="h-6 w-6 animate-spin text-[#519a7c] mr-2" />
                              Cargando...
                            </div>
                          </td>
                        </tr>
                      ) : filteredPregnancies.length === 0 ? (
                        <tr>
                          <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                            No se encontraron registros de embarazos
                          </td>
                        </tr>
                      ) : (
                        filteredPregnancies.map((pregnancy) => (
                          <tr key={pregnancy.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {pregnancy.animalName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {pregnancy.animalEarTag}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{pregnancy.bullName}</div>
                              <div className="text-sm text-gray-500">{pregnancy.bullEarTag}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {getBreedingTypeBadge(pregnancy.breedingType)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{pregnancy.gestationDay} días</div>
                              <div className="text-sm text-gray-500">
                                Embarazo #{pregnancy.pregnancyNumber}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {getStageBadge(pregnancy.currentStage)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                {new Date(pregnancy.expectedCalvingDate).toLocaleDateString('es-ES')}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {getStatusBadge(pregnancy.status)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {pregnancy.complications.hasComplications ? (
                                <Badge variant="warning">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Sí
                                </Badge>
                              ) : (
                                <Badge variant="success">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  No
                                </Badge>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex items-center justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => handleView(pregnancy)}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => handleEdit(pregnancy)}
                                  className="text-yellow-600 hover:text-yellow-900"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => handleDeleteClick(pregnancy)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal de creación */}
        <AnimatePresence>
          {isCreateModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4"
              onClick={() => setIsCreateModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Nuevo Registro de Embarazo
                  </h2>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsCreateModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la Vaca *
                        </label>
                        <Input
                          placeholder="Ej: Bella"
                          value={formData.animalName || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Etiqueta de la Vaca *
                        </label>
                        <Input
                          placeholder="Ej: MX-001"
                          value={formData.animalEarTag || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, animalEarTag: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre del Toro *
                        </label>
                        <Input
                          placeholder="Ej: Campeón"
                          value={formData.bullName || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, bullName: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Etiqueta del Toro *
                        </label>
                        <Input
                          placeholder="Ej: T-001"
                          value={formData.bullEarTag || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, bullEarTag: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Reproducción *
                        </label>
                        <Input
                          type="date"
                          value={formData.breedingDate || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, breedingDate: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Reproducción *
                        </label>
                        <Select
                          value={formData.breedingType || ""}
                          onChange={(value) => setFormData(prev => ({ ...prev, breedingType: value as BreedingType }))}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="natural_mating">Monta Natural</option>
                          <option value="artificial_insemination">Inseminación Artificial</option>
                          <option value="embryo_transfer">Transferencia de Embriones</option>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha de Confirmación *
                        </label>
                        <Input
                          type="date"
                          value={formData.confirmationDate || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, confirmationDate: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Método de Confirmación *
                        </label>
                        <Select
                          value={formData.confirmationMethod || ""}
                          onChange={(value) => setFormData(prev => ({ ...prev, confirmationMethod: value as ConfirmationMethod }))}
                        >
                          <option value="">Seleccionar...</option>
                          <option value="ultrasound">Ultrasonido</option>
                          <option value="palpation">Palpación</option>
                          <option value="blood_test">Examen de Sangre</option>
                          <option value="hormone_test">Prueba Hormonal</option>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Días de Gestación
                        </label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={formData.gestationDay?.toString() || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, gestationDay: parseInt(e.target.value) || 0 }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha Esperada de Parto
                        </label>
                        <Input
                          type="date"
                          value={formData.expectedCalvingDate || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, expectedCalvingDate: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Número de Embarazo
                        </label>
                        <Input
                          type="number"
                          placeholder="1"
                          value={formData.pregnancyNumber?.toString() || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, pregnancyNumber: parseInt(e.target.value) || 1 }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado
                        </label>
                        <Select
                          value={formData.status || ""}
                          onChange={(value) => setFormData(prev => ({ ...prev, status: value as PregnancyStatus }))}
                        >
                          <option value="active">Activo</option>
                          <option value="completed">Completado</option>
                          <option value="terminated">Terminado</option>
                          <option value="lost">Perdido</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas
                      </label>
                      <Textarea
                        placeholder="Observaciones sobre el embarazo..."
                        value={formData.notes || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50">
                  <Button
                    variant="secondary"
                    onClick={() => setIsCreateModalOpen(false)}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    {isLoading ? (
                      <Activity className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Guardar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de edición */}
        <AnimatePresence>
          {isEditModalOpen && selectedPregnancy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4"
              onClick={() => setIsEditModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Editar Registro de Embarazo
                  </h2>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre de la Vaca *
                        </label>
                        <Input
                          placeholder="Ej: Bella"
                          value={formData.animalName || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Etiqueta de la Vaca *
                        </label>
                        <Input
                          placeholder="Ej: MX-001"
                          value={formData.animalEarTag || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, animalEarTag: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Días de Gestación
                        </label>
                        <Input
                          type="number"
                          value={formData.gestationDay?.toString() || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, gestationDay: parseInt(e.target.value) || 0 }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Fecha Esperada de Parto
                        </label>
                        <Input
                          type="date"
                          value={formData.expectedCalvingDate || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, expectedCalvingDate: e.target.value }))}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Estado
                        </label>
                        <Select
                          value={formData.status || "active"}
                          onChange={(value) => setFormData(prev => ({ ...prev, status: value as PregnancyStatus }))}
                        >
                          <option value="active">Activo</option>
                          <option value="completed">Completado</option>
                          <option value="terminated">Terminado</option>
                          <option value="lost">Perdido</option>
                        </Select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Etapa Actual
                        </label>
                        <Select
                          value={formData.currentStage || "early"}
                          onChange={(value) => setFormData(prev => ({ ...prev, currentStage: value as PregnancyStage }))}
                        >
                          <option value="early">Temprano (0-84 días)</option>
                          <option value="middle">Medio (85-210 días)</option>
                          <option value="late">Tardío (211-280 días)</option>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas
                      </label>
                      <Textarea
                        placeholder="Observaciones sobre el embarazo..."
                        value={formData.notes || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50">
                  <Button
                    variant="secondary"
                    onClick={() => setIsEditModalOpen(false)}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    {isLoading ? (
                      <Activity className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Actualizar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de visualización */}
        <AnimatePresence>
          {isViewModalOpen && selectedPregnancy && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4"
              onClick={() => setIsViewModalOpen(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="flex items-center justify-between p-4 sm:p-6 border-b">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Detalles del Embarazo - {selectedPregnancy.animalName}
                  </h2>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                  <div className="space-y-4 sm:space-y-6">
                    {/* Información básica */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">Animal</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">{selectedPregnancy.animalName}</p>
                          <p className="text-sm text-gray-500">{selectedPregnancy.animalEarTag}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">Toro</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">{selectedPregnancy.bullName}</p>
                          <p className="text-sm text-gray-500">{selectedPregnancy.bullEarTag}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">Gestación</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">{selectedPregnancy.gestationDay} días</p>
                          <p className="text-sm text-gray-500">Embarazo #{selectedPregnancy.pregnancyNumber}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">Fecha de Parto</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">
                            {new Date(selectedPregnancy.expectedCalvingDate).toLocaleDateString('es-ES')}
                          </p>
                          <p className="text-sm text-gray-500">
                            {getStageBadge(selectedPregnancy.currentStage)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">Estado</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            {getStatusBadge(selectedPregnancy.status)}
                            {getBreedingTypeBadge(selectedPregnancy.breedingType)}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-gray-600">Veterinario</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">{selectedPregnancy.veterinarian.name}</p>
                          <p className="text-sm text-gray-500">{selectedPregnancy.veterinarian.license}</p>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Estado de salud */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          Estado de Salud
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-600">Estado General</p>
                            <p className="font-semibold capitalize">{selectedPregnancy.healthStatus.overall}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Condición Corporal</p>
                            <p className="font-semibold">{selectedPregnancy.healthStatus.bodyCondition}/5</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Peso</p>
                            <p className="font-semibold">{selectedPregnancy.healthStatus.weight} kg</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Temperatura</p>
                            <p className="font-semibold">{selectedPregnancy.healthStatus.temperature}°C</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Complicaciones */}
                    {selectedPregnancy.complications.hasComplications && (
                      <Card className="border-yellow-200 bg-yellow-50">
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-yellow-800">
                            <AlertTriangle className="h-5 w-5" />
                            Complicaciones
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <span className="text-sm text-yellow-600">Tipo:</span>
                              <span className="ml-2 font-semibold text-yellow-800 capitalize">
                                {selectedPregnancy.complications.type}
                              </span>
                            </div>
                            <div>
                              <span className="text-sm text-yellow-600">Severidad:</span>
                              <Badge 
                                variant={selectedPregnancy.complications.severity === "severe" ? "error" : "warning"}
                                className="ml-2"
                              >
                                {selectedPregnancy.complications.severity}
                              </Badge>
                            </div>
                            {selectedPregnancy.complications.description && (
                              <div>
                                <span className="text-sm text-yellow-600">Descripción:</span>
                                <p className="ml-2 text-yellow-800">{selectedPregnancy.complications.description}</p>
                              </div>
                            )}
                            {selectedPregnancy.complications.veterinaryAction && (
                              <div>
                                <span className="text-sm text-yellow-600">Acción Veterinaria:</span>
                                <p className="ml-2 text-yellow-800">{selectedPregnancy.complications.veterinaryAction}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Exámenes recientes */}
                    {selectedPregnancy.examinations.length > 0 && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Stethoscope className="h-5 w-5 text-blue-500" />
                            Último Examen
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {(() => {
                            const lastExam = selectedPregnancy.examinations[selectedPregnancy.examinations.length - 1];
                            return (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                  <div>
                                    <p className="text-sm text-gray-600">Fecha</p>
                                    <p className="font-semibold">
                                      {new Date(lastExam.date).toLocaleDateString('es-ES')}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Tipo</p>
                                    <p className="font-semibold capitalize">{lastExam.type}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Día de Gestación</p>
                                    <p className="font-semibold">{lastExam.gestationDay}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-gray-600">Costo</p>
                                    <p className="font-semibold">${lastExam.cost.toLocaleString()}</p>
                                  </div>
                                </div>
                                {lastExam.notes && (
                                  <div>
                                    <p className="text-sm text-gray-600 mb-1">Notas:</p>
                                    <p className="text-gray-800">{lastExam.notes}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })()}
                        </CardContent>
                      </Card>
                    )}

                    {/* Información de ubicación */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-green-500" />
                          Ubicación
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p><strong>Dirección:</strong> {selectedPregnancy.location.address}</p>
                          <p><strong>Potrero:</strong> {selectedPregnancy.location.paddock}</p>
                          <p><strong>Instalación:</strong> {selectedPregnancy.location.facility}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Notas */}
                    {selectedPregnancy.notes && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-gray-500" />
                            Notas
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-800">{selectedPregnancy.notes}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t bg-gray-50">
                  <Button
                    variant="secondary"
                    onClick={() => setIsViewModalOpen(false)}
                    size="sm"
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => {
                      setIsViewModalOpen(false);
                      handleEdit(selectedPregnancy);
                    }}
                    className="flex items-center gap-2"
                    size="sm"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de confirmación de eliminación */}
        <AnimatePresence>
          {showDeleteModal && pregnancyToDelete && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-3 sm:p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-lg shadow-xl w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {/* Header del modal */}
                <div className="flex items-center gap-4 p-4 sm:p-6 border-b">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Eliminar Registro de Embarazo
                    </h3>
                    <p className="text-sm text-gray-600">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>

                {/* Contenido del modal */}
                <div className="p-4 sm:p-6">
                  <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
                    ¿Estás seguro de que deseas eliminar el registro de embarazo de{" "}
                    <strong>{pregnancyToDelete.animalName}</strong> (Arete: <strong>{pregnancyToDelete.animalEarTag}</strong>)?
                    <br />
                    <br />
                    <span className="text-sm text-gray-600">
                      Toro: {pregnancyToDelete.bullName} ({pregnancyToDelete.bullEarTag})
                      <br />
                      Días de gestación: {pregnancyToDelete.gestationDay}
                      <br />
                      Embarazo: #{pregnancyToDelete.pregnancyNumber}
                      <br />
                      Veterinario: {pregnancyToDelete.veterinarian.name}
                    </span>
                    <br />
                    <br />
                    Toda la información del embarazo se perderá permanentemente, incluyendo exámenes, notas y datos de salud.
                  </p>
                </div>

                {/* Footer del modal */}
                <div className="flex justify-end space-x-3 p-4 sm:p-6 border-t bg-gray-50">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setPregnancyToDelete(null);
                    }}
                    size="sm"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="error"
                    onClick={confirmDelete}
                    className="flex items-center space-x-2"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Activity className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>Eliminar</span>
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default PregnancyTracking;