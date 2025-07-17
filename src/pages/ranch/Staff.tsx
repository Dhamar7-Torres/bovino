// ============================================================================
// STAFF.TSX - GESTIÓN DEL PERSONAL DEL RANCHO
// ============================================================================
// Componente para gestionar el personal del rancho, incluyendo empleados,
// roles, horarios, actividades y estadísticas con animaciones

import React, { useState, useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  Search,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Star,
  Award,
  Edit3,
  Eye,
  BarChart3,
  UserCheck,
  Download,
  Upload,
  Plus,
} from "lucide-react";

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface StaffMember {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth: string;
    nationalId: string;
    photo?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
  };
  employment: {
    employeeId: string;
    position: StaffPosition;
    department: StaffDepartment;
    hireDate: string;
    contractType: ContractType;
    salary: number;
    status: EmploymentStatus;
  };
  workInfo: {
    schedule: WorkSchedule;
    skills: string[];
    certifications: string[];
    experience: number; // años
    rating: number; // 1-5
  };
  performance: {
    attendanceRate: number;
    tasksCompleted: number;
    efficiency: number;
    lastEvaluation: string;
    notes: string[];
  };
  activities: StaffActivity[];
}

interface StaffActivity {
  id: string;
  date: string;
  type: ActivityType;
  description: string;
  location: string;
  duration: number; // minutos
  status: "completed" | "in-progress" | "cancelled";
  assignedBy: string;
}

interface WorkSchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface DaySchedule {
  isWorkDay: boolean;
  startTime?: string;
  endTime?: string;
  breakTime?: {
    start: string;
    end: string;
  };
}

interface StaffStatistics {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  newHires: number;
  departments: Record<StaffDepartment, number>;
  positions: Record<StaffPosition, number>;
  averageExperience: number;
  averageRating: number;
  attendanceRate: number;
  turnoverRate: number;
}

type StaffPosition = 
  | "ranch_manager" 
  | "veterinarian" 
  | "livestock_supervisor" 
  | "farm_worker" 
  | "feed_specialist" 
  | "maintenance_worker" 
  | "security_guard" 
  | "administrative_assistant" 
  | "driver" 
  | "cleaner";

type StaffDepartment = 
  | "administration" 
  | "livestock" 
  | "veterinary" 
  | "maintenance" 
  | "security" 
  | "operations";

type ContractType = "full_time" | "part_time" | "temporary" | "contractor";

type EmploymentStatus = "active" | "on_leave" | "suspended" | "terminated";

type ActivityType = 
  | "feeding" 
  | "vaccination" 
  | "cleaning" 
  | "maintenance" 
  | "inspection" 
  | "transport" 
  | "administration" 
  | "training";

type ViewMode = "grid" | "list" | "org_chart";

type FilterType = "all" | "department" | "position" | "status";

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Staff: React.FC = () => {
  // Estados para manejo de datos y UI
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [statistics, setStatistics] = useState<StaffStatistics | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);
  const [showMemberDetail, setShowMemberDetail] = useState<boolean>(false);
  const [, setShowAddForm] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterValue, setFilterValue] = useState<string>("");
  const [showStatistics, setShowStatistics] = useState<boolean>(false);

  // Datos simulados del personal - En producción vendrían de la API
  const mockStaffData: StaffMember[] = [
    {
      id: "staff-001",
      personalInfo: {
        firstName: "Carlos",
        lastName: "Mendoza García",
        fullName: "Carlos Mendoza García",
        dateOfBirth: "1985-03-15",
        nationalId: "MEGC850315HTCNRL02",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      },
      contactInfo: {
        email: "carlos.mendoza@ranchosanjose.com",
        phone: "+52 993 123 4567",
        emergencyContact: {
          name: "María Mendoza",
          phone: "+52 993 123 4568",
          relationship: "Esposa",
        },
        address: {
          street: "Calle Principal 123",
          city: "Villahermosa",
          state: "Tabasco",
          zipCode: "86000",
        },
      },
      employment: {
        employeeId: "EMP-001",
        position: "ranch_manager",
        department: "administration",
        hireDate: "2018-06-01",
        contractType: "full_time",
        salary: 35000,
        status: "active",
      },
      workInfo: {
        schedule: {
          monday: { isWorkDay: true, startTime: "06:00", endTime: "15:00", breakTime: { start: "12:00", end: "13:00" } },
          tuesday: { isWorkDay: true, startTime: "06:00", endTime: "15:00", breakTime: { start: "12:00", end: "13:00" } },
          wednesday: { isWorkDay: true, startTime: "06:00", endTime: "15:00", breakTime: { start: "12:00", end: "13:00" } },
          thursday: { isWorkDay: true, startTime: "06:00", endTime: "15:00", breakTime: { start: "12:00", end: "13:00" } },
          friday: { isWorkDay: true, startTime: "06:00", endTime: "15:00", breakTime: { start: "12:00", end: "13:00" } },
          saturday: { isWorkDay: true, startTime: "07:00", endTime: "12:00" },
          sunday: { isWorkDay: false },
        },
        skills: ["Gestión de Personal", "Planificación", "Liderazgo", "Ganadería"],
        certifications: ["Certificación en Gestión Ganadera", "Curso de Liderazgo"],
        experience: 12,
        rating: 4.8,
      },
      performance: {
        attendanceRate: 98,
        tasksCompleted: 245,
        efficiency: 92,
        lastEvaluation: "2024-12-15",
        notes: ["Excelente liderazgo", "Muy responsable", "Conocimiento técnico sobresaliente"],
      },
      activities: [
        {
          id: "act-001",
          date: "2025-01-15",
          type: "administration",
          description: "Revisión de reportes mensuales",
          location: "Oficina Principal",
          duration: 120,
          status: "completed",
          assignedBy: "system",
        },
      ],
    },
    {
      id: "staff-002",
      personalInfo: {
        firstName: "Ana",
        lastName: "Jiménez López",
        fullName: "Ana Jiménez López",
        dateOfBirth: "1990-08-22",
        nationalId: "JILA900822MTCMPL08",
        photo: "https://images.unsplash.com/photo-1494790108755-2616b612b182?w=150&h=150&fit=crop&crop=face",
      },
      contactInfo: {
        email: "ana.jimenez@ranchosanjose.com",
        phone: "+52 993 234 5678",
        emergencyContact: {
          name: "Roberto Jiménez",
          phone: "+52 993 234 5679",
          relationship: "Padre",
        },
        address: {
          street: "Av. Universidad 456",
          city: "Villahermosa",
          state: "Tabasco",
          zipCode: "86040",
        },
      },
      employment: {
        employeeId: "EMP-002",
        position: "veterinarian",
        department: "veterinary",
        hireDate: "2020-03-15",
        contractType: "full_time",
        salary: 28000,
        status: "active",
      },
      workInfo: {
        schedule: {
          monday: { isWorkDay: true, startTime: "07:00", endTime: "16:00", breakTime: { start: "12:00", end: "13:00" } },
          tuesday: { isWorkDay: true, startTime: "07:00", endTime: "16:00", breakTime: { start: "12:00", end: "13:00" } },
          wednesday: { isWorkDay: true, startTime: "07:00", endTime: "16:00", breakTime: { start: "12:00", end: "13:00" } },
          thursday: { isWorkDay: true, startTime: "07:00", endTime: "16:00", breakTime: { start: "12:00", end: "13:00" } },
          friday: { isWorkDay: true, startTime: "07:00", endTime: "16:00", breakTime: { start: "12:00", end: "13:00" } },
          saturday: { isWorkDay: false },
          sunday: { isWorkDay: true, startTime: "08:00", endTime: "12:00" },
        },
        skills: ["Medicina Veterinaria", "Cirugía", "Diagnóstico", "Vacunación"],
        certifications: ["Médico Veterinario Zootecnista", "Especialización en Bovinos"],
        experience: 8,
        rating: 4.7,
      },
      performance: {
        attendanceRate: 96,
        tasksCompleted: 189,
        efficiency: 89,
        lastEvaluation: "2024-11-20",
        notes: ["Excelente conocimiento técnico", "Muy cuidadosa con los animales"],
      },
      activities: [
        {
          id: "act-002",
          date: "2025-01-15",
          type: "vaccination",
          description: "Vacunación del lote 15",
          location: "Corral Principal",
          duration: 180,
          status: "completed",
          assignedBy: "staff-001",
        },
      ],
    },
    {
      id: "staff-003",
      personalInfo: {
        firstName: "Miguel",
        lastName: "Torres Sánchez",
        fullName: "Miguel Torres Sánchez",
        dateOfBirth: "1982-11-10",
        nationalId: "TOSM821110HTCRNG01",
        photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      },
      contactInfo: {
        email: "miguel.torres@ranchosanjose.com",
        phone: "+52 993 345 6789",
        emergencyContact: {
          name: "Carmen Torres",
          phone: "+52 993 345 6790",
          relationship: "Esposa",
        },
        address: {
          street: "Col. Centro 789",
          city: "Villahermosa",
          state: "Tabasco",
          zipCode: "86020",
        },
      },
      employment: {
        employeeId: "EMP-003",
        position: "livestock_supervisor",
        department: "livestock",
        hireDate: "2019-09-01",
        contractType: "full_time",
        salary: 22000,
        status: "active",
      },
      workInfo: {
        schedule: {
          monday: { isWorkDay: true, startTime: "05:30", endTime: "14:30", breakTime: { start: "11:30", end: "12:30" } },
          tuesday: { isWorkDay: true, startTime: "05:30", endTime: "14:30", breakTime: { start: "11:30", end: "12:30" } },
          wednesday: { isWorkDay: true, startTime: "05:30", endTime: "14:30", breakTime: { start: "11:30", end: "12:30" } },
          thursday: { isWorkDay: true, startTime: "05:30", endTime: "14:30", breakTime: { start: "11:30", end: "12:30" } },
          friday: { isWorkDay: true, startTime: "05:30", endTime: "14:30", breakTime: { start: "11:30", end: "12:30" } },
          saturday: { isWorkDay: true, startTime: "06:00", endTime: "11:00" },
          sunday: { isWorkDay: false },
        },
        skills: ["Manejo de Ganado", "Alimentación", "Identificación", "Pastoreo"],
        certifications: ["Curso de Manejo Bovino", "Certificación en BPG"],
        experience: 15,
        rating: 4.5,
      },
      performance: {
        attendanceRate: 94,
        tasksCompleted: 312,
        efficiency: 87,
        lastEvaluation: "2024-10-30",
        notes: ["Gran experiencia en campo", "Conoce muy bien a los animales"],
      },
      activities: [
        {
          id: "act-003",
          date: "2025-01-15",
          type: "feeding",
          description: "Distribución de alimento balanceado",
          location: "Centro de Alimentación",
          duration: 90,
          status: "completed",
          assignedBy: "staff-001",
        },
      ],
    },
    // Agrego más empleados para completar el ejemplo
    {
      id: "staff-004",
      personalInfo: {
        firstName: "Luis",
        lastName: "Ramírez Cruz",
        fullName: "Luis Ramírez Cruz",
        dateOfBirth: "1995-05-18",
        nationalId: "RACL950518HTCMRS05",
      },
      contactInfo: {
        email: "luis.ramirez@ranchosanjose.com",
        phone: "+52 993 456 7890",
        emergencyContact: {
          name: "Elena Ramírez",
          phone: "+52 993 456 7891",
          relationship: "Madre",
        },
        address: {
          street: "Fracc. Las Flores 321",
          city: "Villahermosa",
          state: "Tabasco",
          zipCode: "86035",
        },
      },
      employment: {
        employeeId: "EMP-004",
        position: "farm_worker",
        department: "operations",
        hireDate: "2021-08-15",
        contractType: "full_time",
        salary: 15000,
        status: "active",
      },
      workInfo: {
        schedule: {
          monday: { isWorkDay: true, startTime: "06:00", endTime: "15:00", breakTime: { start: "12:00", end: "13:00" } },
          tuesday: { isWorkDay: true, startTime: "06:00", endTime: "15:00", breakTime: { start: "12:00", end: "13:00" } },
          wednesday: { isWorkDay: true, startTime: "06:00", endTime: "15:00", breakTime: { start: "12:00", end: "13:00" } },
          thursday: { isWorkDay: true, startTime: "06:00", endTime: "15:00", breakTime: { start: "12:00", end: "13:00" } },
          friday: { isWorkDay: true, startTime: "06:00", endTime: "15:00", breakTime: { start: "12:00", end: "13:00" } },
          saturday: { isWorkDay: true, startTime: "07:00", endTime: "12:00" },
          sunday: { isWorkDay: false },
        },
        skills: ["Mantenimiento", "Limpieza", "Operación de Equipos"],
        certifications: ["Curso Básico de Ganadería"],
        experience: 4,
        rating: 4.2,
      },
      performance: {
        attendanceRate: 92,
        tasksCompleted: 156,
        efficiency: 85,
        lastEvaluation: "2024-09-15",
        notes: ["Trabajador dedicado", "Siempre dispuesto a aprender"],
      },
      activities: [
        {
          id: "act-004",
          date: "2025-01-15",
          type: "cleaning",
          description: "Limpieza de corrales",
          location: "Corral Norte",
          duration: 120,
          status: "in-progress",
          assignedBy: "staff-003",
        },
      ],
    },
  ];

  const mockStatistics: StaffStatistics = {
    totalEmployees: 12,
    activeEmployees: 11,
    onLeave: 1,
    newHires: 2,
    departments: {
      administration: 2,
      livestock: 4,
      veterinary: 2,
      maintenance: 2,
      security: 1,
      operations: 1,
    },
    positions: {
      ranch_manager: 1,
      veterinarian: 2,
      livestock_supervisor: 2,
      farm_worker: 4,
      feed_specialist: 1,
      maintenance_worker: 2,
      security_guard: 1,
      administrative_assistant: 1,
      driver: 1,
      cleaner: 1,
    },
    averageExperience: 8.5,
    averageRating: 4.4,
    attendanceRate: 94.5,
    turnoverRate: 12.5,
  };

  // Efecto para simular carga de datos
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simular llamada a API
      setTimeout(() => {
        setStaffMembers(mockStaffData);
        setStatistics(mockStatistics);
        setIsLoading(false);
      }, 1500);
    };

    loadData();
  }, []);

  // Variantes de animación para Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
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

  const cardHoverVariants: Variants = {
    hover: {
      scale: 1.02,
      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
  };

  // Funciones auxiliares
  const getPositionLabel = (position: StaffPosition): string => {
    const labels: Record<StaffPosition, string> = {
      ranch_manager: "Gerente del Rancho",
      veterinarian: "Veterinario",
      livestock_supervisor: "Supervisor de Ganado",
      farm_worker: "Trabajador de Campo",
      feed_specialist: "Especialista en Alimentación",
      maintenance_worker: "Trabajador de Mantenimiento",
      security_guard: "Guardia de Seguridad",
      administrative_assistant: "Asistente Administrativo",
      driver: "Conductor",
      cleaner: "Personal de Limpieza",
    };
    return labels[position];
  };

  const getDepartmentLabel = (department: StaffDepartment): string => {
    const labels: Record<StaffDepartment, string> = {
      administration: "Administración",
      livestock: "Ganadería",
      veterinary: "Veterinaria",
      maintenance: "Mantenimiento",
      security: "Seguridad",
      operations: "Operaciones",
    };
    return labels[department];
  };

  const getStatusColor = (status: EmploymentStatus): string => {
    switch (status) {
      case "active":
        return "text-green-600 bg-green-100";
      case "on_leave":
        return "text-yellow-600 bg-yellow-100";
      case "suspended":
        return "text-red-600 bg-red-100";
      case "terminated":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusLabel = (status: EmploymentStatus): string => {
    const labels: Record<EmploymentStatus, string> = {
      active: "Activo",
      on_leave: "En Licencia",
      suspended: "Suspendido",
      terminated: "Terminado",
    };
    return labels[status];
  };

  // Función para filtrar empleados
  const filteredStaff = staffMembers.filter((member) => {
    const matchesSearch = 
      member.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employment.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getPositionLabel(member.employment.position).toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "all") return true;
    if (filterType === "department") return member.employment.department === filterValue;
    if (filterType === "position") return member.employment.position === filterValue;
    if (filterType === "status") return member.employment.status === filterValue;

    return true;
  });

  // Función para abrir detalle de empleado
  const handleViewMember = (member: StaffMember) => {
    setSelectedMember(member);
    setShowMemberDetail(true);
  };

  // Componente de loading con fondo degradado del layout principal
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
          />
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-semibold text-white mb-2"
          >
            Cargando Personal del Rancho
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/80"
          >
            Obteniendo información del personal...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Contenedor principal con padding y espaciado */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header con título y acciones */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <motion.h1
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl font-bold bg-gradient-to-r from-[#519a7c] to-[#f4ac3a] bg-clip-text text-transparent mb-2"
                  >
                    Personal del Rancho
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-600 text-lg mb-4"
                  >
                    Gestión integral del personal y recursos humanos
                  </motion.p>
                  
                  {statistics && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-wrap items-center gap-6 text-sm text-gray-500"
                    >
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{statistics.totalEmployees} empleados totales</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        <span>{statistics.activeEmployees} activos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4" />
                        <span>Calificación promedio: {statistics.averageRating}/5</span>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Acciones rápidas */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-3 mt-6 lg:mt-0"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowAddForm(true)}
                    className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white px-6 py-3 rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 flex items-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" />
                    Nuevo Empleado
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowStatistics(!showStatistics)}
                    className="bg-white/20 text-gray-700 px-6 py-3 rounded-lg hover:bg-white/30 border border-gray-200 flex items-center gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Estadísticas
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Estadísticas expandidas */}
          <AnimatePresence>
            {showStatistics && statistics && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                variants={itemVariants}
              >
                <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">Estadísticas del Personal</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        title: "Empleados Activos",
                        value: statistics.activeEmployees,
                        total: statistics.totalEmployees,
                        icon: <UserCheck className="w-6 h-6 text-green-600" />,
                        color: "text-green-600",
                      },
                      {
                        title: "Experiencia Promedio",
                        value: `${statistics.averageExperience} años`,
                        icon: <Award className="w-6 h-6 text-blue-600" />,
                        color: "text-blue-600",
                      },
                      {
                        title: "Asistencia",
                        value: `${statistics.attendanceRate}%`,
                        icon: <Calendar className="w-6 h-6 text-[#519a7c]" />,
                        color: "text-[#519a7c]",
                      },
                      {
                        title: "Calificación Promedio",
                        value: `${statistics.averageRating}/5`,
                        icon: <Star className="w-6 h-6 text-[#f4ac3a]" />,
                        color: "text-[#f4ac3a]",
                      },
                    ].map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-gray-600 text-sm mb-1">{stat.title}</p>
                            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                            {stat.total && (
                              <p className="text-xs text-gray-500">de {stat.total} total</p>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            {stat.icon}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Controles de búsqueda y filtros */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Búsqueda */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, ID o puesto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-4">
                  <select
                    value={filterType}
                    onChange={(e) => {
                      setFilterType(e.target.value as FilterType);
                      setFilterValue("");
                    }}
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  >
                    <option value="all">Todos</option>
                    <option value="department">Por Departamento</option>
                    <option value="position">Por Puesto</option>
                    <option value="status">Por Estado</option>
                  </select>

                  {filterType !== "all" && (
                    <select
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    >
                      <option value="">Seleccionar...</option>
                      {filterType === "department" && 
                        Object.keys(statistics?.departments || {}).map((dept) => (
                          <option key={dept} value={dept}>
                            {getDepartmentLabel(dept as StaffDepartment)}
                          </option>
                        ))
                      }
                      {filterType === "position" && 
                        Object.keys(statistics?.positions || {}).map((pos) => (
                          <option key={pos} value={pos}>
                            {getPositionLabel(pos as StaffPosition)}
                          </option>
                        ))
                      }
                      {filterType === "status" && 
                        ["active", "on_leave", "suspended"].map((status) => (
                          <option key={status} value={status}>
                            {getStatusLabel(status as EmploymentStatus)}
                          </option>
                        ))
                      }
                    </select>
                  )}
                </div>

                {/* Modo de vista */}
                <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                  {[
                    { mode: "grid", icon: <BarChart3 className="w-4 h-4" />, label: "Cuadrícula" },
                    { mode: "list", icon: <Users className="w-4 h-4" />, label: "Lista" },
                  ].map((view) => (
                    <motion.button
                      key={view.mode}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setViewMode(view.mode as ViewMode)}
                      className={`px-4 py-3 flex items-center gap-2 transition-colors ${
                        viewMode === view.mode
                          ? "bg-[#519a7c] text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {view.icon}
                      <span className="hidden sm:inline">{view.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Lista de empleados */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Personal ({filteredStaff.length} de {staffMembers.length})
                </h3>
                
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-600 hover:text-gray-800 p-2"
                  >
                    <Download className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-600 hover:text-gray-800 p-2"
                  >
                    <Upload className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              {/* Vista en cuadrícula */}
              {viewMode === "grid" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredStaff.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      variants={cardHoverVariants}
                      whileHover="hover"
                      className="bg-white border border-gray-200 rounded-lg p-6 cursor-pointer"
                      onClick={() => handleViewMember(member)}
                    >
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-[#519a7c] rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
                          {member.personalInfo.photo ? (
                            <img
                              src={member.personalInfo.photo}
                              alt={member.personalInfo.fullName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            member.personalInfo.firstName.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800 mb-1">
                            {member.personalInfo.fullName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {getPositionLabel(member.employment.position)}
                          </p>
                        </div>
                        <div className="relative">
                          <MoreVertical className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Departamento:</span>
                          <span className="font-medium">
                            {getDepartmentLabel(member.employment.department)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Experiencia:</span>
                          <span className="font-medium">{member.workInfo.experience} años</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Calificación:</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-[#f4ac3a] fill-current" />
                            <span className="font-medium">{member.workInfo.rating}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Estado:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.employment.status)}`}>
                            {getStatusLabel(member.employment.status)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-gray-600 hover:text-[#519a7c]"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Lógica para llamar
                              }}
                            >
                              <Phone className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-gray-600 hover:text-[#519a7c]"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Lógica para enviar email
                              }}
                            >
                              <Mail className="w-4 h-4" />
                            </motion.button>
                          </div>
                          <span className="text-xs text-gray-500">
                            ID: {member.employment.employeeId}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Vista de lista */}
              {viewMode === "list" && (
                <div className="space-y-4">
                  {filteredStaff.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      variants={cardHoverVariants}
                      whileHover="hover"
                      className="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer"
                      onClick={() => handleViewMember(member)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-[#519a7c] rounded-full flex items-center justify-center text-white font-semibold">
                            {member.personalInfo.photo ? (
                              <img
                                src={member.personalInfo.photo}
                                alt={member.personalInfo.fullName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              member.personalInfo.firstName.charAt(0).toUpperCase()
                            )}
                          </div>
                          
                          <div>
                            <h4 className="font-semibold text-gray-800">
                              {member.personalInfo.fullName}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {getPositionLabel(member.employment.position)} • {getDepartmentLabel(member.employment.department)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Experiencia</p>
                            <p className="font-semibold">{member.workInfo.experience} años</p>
                          </div>
                          
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Calificación</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-[#f4ac3a] fill-current" />
                              <span className="font-semibold">{member.workInfo.rating}</span>
                            </div>
                          </div>

                          <div className="text-center">
                            <p className="text-sm text-gray-600">Asistencia</p>
                            <p className="font-semibold">{member.performance.attendanceRate}%</p>
                          </div>

                          <div className="text-center">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(member.employment.status)}`}>
                              {getStatusLabel(member.employment.status)}
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-gray-600 hover:text-[#519a7c]"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewMember(member);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-gray-600 hover:text-blue-600"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Lógica para editar
                              }}
                            >
                              <Edit3 className="w-4 h-4" />
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Mensaje cuando no hay resultados */}
              {filteredStaff.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">
                    No se encontraron empleados
                  </h3>
                  <p className="text-gray-500">
                    Intenta ajustar los filtros de búsqueda
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Modal de detalle de empleado */}
      <AnimatePresence>
        {showMemberDetail && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowMemberDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Detalle del Empleado</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMemberDetail(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Plus className="w-6 h-6 rotate-45" />
                </motion.button>
              </div>

              {/* Información básica */}
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 bg-[#519a7c] rounded-full flex items-center justify-center text-white font-bold text-2xl">
                    {selectedMember.personalInfo.photo ? (
                      <img
                        src={selectedMember.personalInfo.photo}
                        alt={selectedMember.personalInfo.fullName}
                        className="w-20 h-20 rounded-full object-cover"
                      />
                    ) : (
                      selectedMember.personalInfo.firstName.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedMember.personalInfo.fullName}
                    </h3>
                    <p className="text-gray-600">
                      {getPositionLabel(selectedMember.employment.position)}
                    </p>
                    <p className="text-gray-500">
                      {getDepartmentLabel(selectedMember.employment.department)}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(selectedMember.employment.status)}`}>
                      {getStatusLabel(selectedMember.employment.status)}
                    </span>
                  </div>
                </div>

                {/* Información de contacto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Información Personal</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID Empleado:</span>
                        <span className="font-medium">{selectedMember.employment.employeeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha de Nacimiento:</span>
                        <span className="font-medium">
                          {new Date(selectedMember.personalInfo.dateOfBirth).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">CURP:</span>
                        <span className="font-medium">{selectedMember.personalInfo.nationalId}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Contacto</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{selectedMember.contactInfo.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{selectedMember.contactInfo.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">
                          {selectedMember.contactInfo.address.city}, {selectedMember.contactInfo.address.state}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Información laboral */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Información Laboral</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 mb-1">Fecha de Contratación</p>
                      <p className="font-medium">
                        {new Date(selectedMember.employment.hireDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 mb-1">Experiencia</p>
                      <p className="font-medium">{selectedMember.workInfo.experience} años</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 mb-1">Calificación</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-[#f4ac3a] fill-current" />
                        <span className="font-medium">{selectedMember.workInfo.rating}/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Rendimiento */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Rendimiento</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 mb-1">Asistencia</p>
                      <p className="font-medium text-green-600">{selectedMember.performance.attendanceRate}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 mb-1">Tareas Completadas</p>
                      <p className="font-medium">{selectedMember.performance.tasksCompleted}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-600 mb-1">Eficiencia</p>
                      <p className="font-medium text-blue-600">{selectedMember.performance.efficiency}%</p>
                    </div>
                  </div>
                </div>

                {/* Habilidades y certificaciones */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-3">Habilidades y Certificaciones</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Habilidades:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.workInfo.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-[#519a7c] text-white text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-2">Certificaciones:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.workInfo.certifications.map((cert, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-[#f4ac3a] text-white text-xs rounded-full"
                          >
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 pt-4 border-t">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white px-6 py-3 rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Editar Información
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-white/20 text-gray-700 px-6 py-3 rounded-lg hover:bg-white/30 border border-gray-200 flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Perfil
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Staff;