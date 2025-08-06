import React, { useState, useCallback, useMemo, useEffect } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Search,
  Edit3,
  Trash2,
  Eye,
  Phone,
  Mail,
  Calendar,
  Briefcase,
  User,
  X,
  Save,
  Building,
  Shield,
  Award,
  Filter,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Loader,
  Wifi,
  WifiOff,
  RefreshCw
} from "lucide-react";

// ============================================================================
// TIPOS Y ENUMS
// ============================================================================

type ContractType = "Permanente" | "Temporal" | "Por Proyecto";
type EmploymentStatus = "Activo" | "Inactivo" | "Vacaciones" | "Suspendido";
type Department = "Administración" | "Veterinaria" | "Ganadería" | "Mantenimiento" | "Seguridad";

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface StaffMember {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    nationalId: string;
    phone: string;
    email: string;
    address: string;
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  employment: {
    employeeId: string;
    position: string;
    department: Department;
    hireDate: string;
    salary: number;
    contractType: ContractType;
    status: EmploymentStatus;
  };
  skills: string[];
  photo?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current: number;
    total: number;
    pageSize: number;
    totalItems: number;
  };
}

interface FormErrors {
  [key: string]: string;
}

// ============================================================================
// SERVICIO API
// ============================================================================

class StaffApiService {
  private baseURL = 'http://localhost:5000/api';
  
  private getAuthToken(): string | null {
    // En una aplicación real, obtendrías esto del contexto de autenticación o localStorage
    return localStorage.getItem('auth_token');
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = this.getAuthToken();
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error instanceof Error ? error : new Error('Error de conexión');
    }
  }

  // Obtener todo el personal
  async getStaff(params?: {
    page?: number;
    limit?: number;
    search?: string;
    department?: string;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<StaffMember>>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.department && params.department !== 'Todos') queryParams.append('department', params.department);
    if (params?.status && params.status !== 'Todos') queryParams.append('status', params.status);

    const queryString = queryParams.toString();
    return this.makeRequest<PaginatedResponse<StaffMember>>(
      `/ranch/staff${queryString ? `?${queryString}` : ''}`
    );
  }

  // Obtener un miembro del personal por ID
  async getStaffMember(id: string): Promise<ApiResponse<StaffMember>> {
    return this.makeRequest<StaffMember>(`/ranch/staff/${id}`);
  }

  // Crear nuevo miembro del personal
  async createStaffMember(memberData: Omit<StaffMember, 'id'>): Promise<ApiResponse<StaffMember>> {
    return this.makeRequest<StaffMember>('/ranch/staff', {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  }

  // Actualizar miembro del personal
  async updateStaffMember(id: string, memberData: Partial<StaffMember>): Promise<ApiResponse<StaffMember>> {
    return this.makeRequest<StaffMember>(`/ranch/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  }

  // Eliminar miembro del personal
  async deleteStaffMember(id: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/ranch/staff/${id}`, {
      method: 'DELETE',
    });
  }

  // Verificar conexión con el backend
  async checkConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/ping`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

// Instancia del servicio API
const staffApi = new StaffApiService();

// ============================================================================
// CONSTANTES
// ============================================================================

const STATUS_COLORS: Record<EmploymentStatus, string> = {
  "Activo": "bg-green-100 text-green-800",
  "Inactivo": "bg-gray-100 text-gray-800",
  "Vacaciones": "bg-blue-100 text-blue-800",
  "Suspendido": "bg-red-100 text-red-800",
};

const DEPARTMENT_ICONS: Record<Department, any> = {
  "Administración": Building,
  "Veterinaria": Shield,
  "Ganadería": Users,
  "Mantenimiento": Award,
  "Seguridad": Shield,
};

const DEPARTMENTS: Department[] = ["Administración", "Veterinaria", "Ganadería", "Mantenimiento", "Seguridad"];
const STATUS_OPTIONS: EmploymentStatus[] = ["Activo", "Inactivo", "Vacaciones", "Suspendido"];
const CONTRACT_TYPES: ContractType[] = ["Permanente", "Temporal", "Por Proyecto"];

// ============================================================================
// VARIANTES DE ANIMACIÓN
// ============================================================================

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  hover: {
    scale: 1.02,
    transition: {
      duration: 0.2
    }
  }
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: 0.2
    }
  }
};

// ============================================================================
// FUNCIONES DE VALIDACIÓN
// ============================================================================

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+52\s?)?[0-9\s\-]{10,15}$/;
  return phoneRegex.test(phone);
};

const validateCURP = (curp: string): boolean => {
  const curpRegex = /^[A-Z]{1}[AEIOU]{1}[A-Z]{2}[0-9]{2}(0[1-9]|1[0-2])(0[1-9]|1[0-9]|2[0-9]|3[0-1])[HM]{1}(AS|BC|BS|CC|CS|CH|CL|CM|DF|DG|GT|GR|HG|JC|MC|MN|MS|NT|NL|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS|NE)[B-DF-HJ-NP-TV-Z]{3}[0-9A-Z]{1}[0-9]{1}$/;
  return curpRegex.test(curp);
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const Staff: React.FC = () => {
  // Estados principales
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  
  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);

  // Estados para formulario
  const [formData, setFormData] = useState<Partial<StaffMember>>({});
  const [isLoading, setSaveLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [skillInput, setSkillInput] = useState("");

  // Estados para API y conexión
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Estados para notificaciones
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Listas memoizadas para filtros
  const departments = useMemo(() => ["Todos", ...DEPARTMENTS], []);
  const statusOptions = useMemo(() => ["Todos", ...STATUS_OPTIONS], []);

  // Estadísticas memoizadas
  const statistics = useMemo(() => {
    const totalStaff = staffMembers.length;
    const activeStaff = staffMembers.filter(m => m.employment.status === "Activo").length;
    const totalDepartments = new Set(staffMembers.map(m => m.employment.department)).size;
    const averageSalary = totalStaff > 0 
      ? Math.round(staffMembers.reduce((sum, m) => sum + m.employment.salary, 0) / totalStaff)
      : 0;

    return {
      totalStaff: totalItems || totalStaff,
      activeStaff,
      totalDepartments,
      averageSalary,
    };
  }, [staffMembers, totalItems]);

  // ============================================================================
  // FUNCIONES DE API
  // ============================================================================

  // Verificar conexión con el backend
  const checkConnection = useCallback(async () => {
    const connected = await staffApi.checkConnection();
    setIsConnected(connected);
    return connected;
  }, []);

  // Cargar datos del personal desde el backend
  const loadStaffData = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoadingData(true);
    setApiError(null);

    try {
      const response = await staffApi.getStaff({
        page: currentPage,
        limit: 12,
        search: searchTerm || undefined,
        department: selectedDepartment !== "Todos" ? selectedDepartment : undefined,
        status: selectedStatus !== "Todos" ? selectedStatus : undefined,
      });

      if (response.success && response.data) {
        setStaffMembers(response.data.data);
        setCurrentPage(response.data.pagination.current);
        setTotalPages(response.data.pagination.total);
        setTotalItems(response.data.pagination.totalItems);
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error loading staff data:', error);
      setApiError(error instanceof Error ? error.message : 'Error desconocido');
      setIsConnected(false);
      // En caso de error, mostrar datos vacíos o de respaldo
      setStaffMembers([]);
    } finally {
      if (showLoader) setIsLoadingData(false);
    }
  }, [currentPage, searchTerm, selectedDepartment, selectedStatus]);

  // Recargar datos
  const refreshData = useCallback(() => {
    loadStaffData(true);
  }, [loadStaffData]);

  // ============================================================================
  // EFECTOS
  // ============================================================================

  // Cargar datos iniciales
  useEffect(() => {
    checkConnection();
    loadStaffData();
  }, [loadStaffData, checkConnection]);

  // Recargar datos cuando cambien los filtros
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      loadStaffData();
    }, 500); // Debounce de 500ms para la búsqueda

    return () => clearTimeout(timeoutId);
  }, [searchTerm, selectedDepartment, selectedStatus]);

  // ============================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================

  // Función para generar ID de empleado
  const generateEmployeeId = useCallback(() => {
    const maxId = Math.max(...staffMembers.map(member => 
      parseInt(member.employment.employeeId.replace('EMP-', '')) || 0
    ));
    return `EMP-${String(maxId + 1).padStart(3, '0')}`;
  }, [staffMembers]);

  // Función para mostrar notificación de éxito
  const showSuccessNotification = useCallback((message: string) => {
    setSuccessMessage(message);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  }, []);

  // ============================================================================
  // FUNCIONES DE VALIDACIÓN
  // ============================================================================

  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};

    // Validaciones de información personal
    if (!formData.personalInfo?.firstName?.trim()) {
      errors.firstName = "El nombre es obligatorio";
    } else if (formData.personalInfo.firstName.length < 2) {
      errors.firstName = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.personalInfo?.lastName?.trim()) {
      errors.lastName = "Los apellidos son obligatorios";
    } else if (formData.personalInfo.lastName.length < 2) {
      errors.lastName = "Los apellidos deben tener al menos 2 caracteres";
    }

    if (formData.personalInfo?.email && !validateEmail(formData.personalInfo.email)) {
      errors.email = "El formato del email no es válido";
    }

    if (formData.personalInfo?.phone && !validatePhone(formData.personalInfo.phone)) {
      errors.phone = "El formato del teléfono no es válido";
    }

    if (formData.personalInfo?.nationalId && !validateCURP(formData.personalInfo.nationalId)) {
      errors.nationalId = "El formato de la CURP no es válido";
    }

    // Validaciones de información laboral
    if (!formData.employment?.position?.trim()) {
      errors.position = "El puesto es obligatorio";
    }

    if (!formData.employment?.department?.trim()) {
      errors.department = "El departamento es obligatorio";
    }

    if (formData.employment?.salary && formData.employment.salary < 0) {
      errors.salary = "El salario debe ser un número positivo";
    }

    // Validar fecha de nacimiento (debe ser mayor de 18 años)
    if (formData.personalInfo?.dateOfBirth) {
      const birthDate = new Date(formData.personalInfo.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        errors.dateOfBirth = "El empleado debe ser mayor de 18 años";
      }
    }

    // Validar fecha de contratación (no puede ser futura)
    if (formData.employment?.hireDate) {
      const hireDate = new Date(formData.employment.hireDate);
      const today = new Date();
      if (hireDate > today) {
        errors.hireDate = "La fecha de contratación no puede ser futura";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // ============================================================================
  // FUNCIONES DE MANEJO DE PERSONAL
  // ============================================================================

  // Función para agregar personal
  const handleAddStaff = useCallback(() => {
    setFormData({
      personalInfo: {
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        nationalId: "",
        phone: "",
        email: "",
        address: "",
        emergencyContact: {
          name: "",
          phone: "",
          relationship: ""
        }
      },
      employment: {
        employeeId: generateEmployeeId(),
        position: "",
        department: "Administración",
        hireDate: new Date().toISOString().split('T')[0],
        salary: 0,
        contractType: "Permanente",
        status: "Activo"
      },
      skills: []
    });
    setFormErrors({});
    setSkillInput("");
    setShowAddModal(true);
  }, [generateEmployeeId]);

  // Función para editar personal
  const handleEditStaff = useCallback((member: StaffMember) => {
    setFormData(member);
    setSelectedMember(member);
    setFormErrors({});
    setSkillInput("");
    setShowEditModal(true);
  }, []);

  // Función para ver detalles
  const handleViewStaff = useCallback((member: StaffMember) => {
    setSelectedMember(member);
    setShowViewModal(true);
  }, []);

  // Función para eliminar personal
  const handleDeleteStaff = useCallback(async (member: StaffMember) => {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${member.personalInfo.firstName} ${member.personalInfo.lastName}?`)) {
      try {
        setIsLoadingData(true);
        const response = await staffApi.deleteStaffMember(member.id);
        
        if (response.success) {
          showSuccessNotification("Personal eliminado exitosamente");
          loadStaffData(false); // Recargar datos sin mostrar loader
        }
      } catch (error) {
        console.error('Error deleting staff member:', error);
        setApiError(error instanceof Error ? error.message : 'Error al eliminar');
      } finally {
        setIsLoadingData(false);
      }
    }
  }, [showSuccessNotification, loadStaffData]);

  // Función para agregar habilidad
  const handleAddSkill = useCallback(() => {
    if (skillInput.trim() && formData.skills && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...(prev.skills || []), skillInput.trim()]
      }));
      setSkillInput("");
    }
  }, [skillInput, formData.skills]);

  // Función para eliminar habilidad
  const handleRemoveSkill = useCallback((skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills?.filter(skill => skill !== skillToRemove) || []
    }));
  }, []);

  // Función para guardar (agregar o editar)
  const handleSaveStaff = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setSaveLoading(true);
    setApiError(null);

    try {
      const memberData = {
        personalInfo: formData.personalInfo!,
        employment: formData.employment!,
        skills: formData.skills || [],
        photo: formData.photo
      };

      let response: ApiResponse<StaffMember>;

      if (selectedMember) {
        // Editar
        response = await staffApi.updateStaffMember(selectedMember.id, memberData);
      } else {
        // Agregar
        response = await staffApi.createStaffMember(memberData as StaffMember);
      }

      if (response.success) {
        showSuccessNotification(
          selectedMember ? "Personal actualizado exitosamente" : "Personal agregado exitosamente"
        );
        
        setShowAddModal(false);
        setShowEditModal(false);
        setFormData({});
        setSelectedMember(null);
        setFormErrors({});
        
        // Recargar datos
        loadStaffData(false);
      }

    } catch (error) {
      console.error("Error al guardar:", error);
      setApiError(error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setSaveLoading(false);
    }
  }, [validateForm, selectedMember, formData, showSuccessNotification, loadStaffData]);

  // Función para cancelar
  const handleCancel = useCallback(() => {
    setShowAddModal(false);
    setShowEditModal(false);
    setFormData({});
    setSelectedMember(null);
    setFormErrors({});
    setSkillInput("");
    setApiError(null);
  }, []);

  // Función para obtener color del estado
  const getStatusColor = useCallback((status: EmploymentStatus) => {
    return STATUS_COLORS[status] || "bg-gray-100 text-gray-800";
  }, []);

  // Función para obtener icono del departamento
  const getDepartmentIcon = useCallback((department: Department) => {
    return DEPARTMENT_ICONS[department] || Briefcase;
  }, []);

  // Función para cerrar modal de vista
  const closeViewModal = useCallback(() => {
    setShowViewModal(false);
    setSelectedMember(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Notificación de éxito */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center"
            >
              <CheckCircle className="w-5 h-5 mr-2" />
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notificación de error de API */}
        <AnimatePresence>
          {apiError && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center max-w-md"
            >
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{apiError}</span>
              <button 
                onClick={() => setApiError(null)}
                className="ml-3 text-white hover:text-gray-200"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center">
                <h1 className="text-4xl font-bold text-[#2d5a45] mb-2 mr-4">
                  Gestión de Personal
                </h1>
                {/* Indicador de conexión */}
                <div className="flex items-center mb-2">
                  {isConnected ? (
                    <div className="flex items-center text-green-600">
                      <Wifi className="w-5 h-5 mr-1" />
                      <span className="text-sm font-medium">Conectado</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <WifiOff className="w-5 h-5 mr-1" />
                      <span className="text-sm font-medium">Desconectado</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-lg">
                Administra todo el personal del rancho
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshData}
                disabled={isLoadingData}
                className="px-4 py-2 border border-[#519a7c] text-[#519a7c] rounded-lg hover:bg-[#519a7c] hover:text-white transition-colors flex items-center disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingData ? 'animate-spin' : ''}`} />
                Actualizar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddStaff}
                className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar Personal
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            variants={cardVariants}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Personal</p>
                <p className="text-3xl font-bold text-[#2d5a45]">{statistics.totalStaff}</p>
              </div>
              <Users className="w-8 h-8 text-[#519a7c]" />
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Personal Activo</p>
                <p className="text-3xl font-bold text-green-600">{statistics.activeStaff}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-500" />
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Departamentos</p>
                <p className="text-3xl font-bold text-[#2d5a45]">{statistics.totalDepartments}</p>
              </div>
              <Building className="w-8 h-8 text-[#519a7c]" />
            </div>
          </motion.div>

          <motion.div
            variants={cardVariants}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Salario Promedio</p>
                <p className="text-3xl font-bold text-[#2d5a45]">
                  ${statistics.averageSalary.toLocaleString()}
                </p>
              </div>
              <Award className="w-8 h-8 text-[#519a7c]" />
            </div>
          </motion.div>
        </motion.div>

        {/* Filtros y Búsqueda */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar personal..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  aria-label="Buscar personal"
                />
              </div>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                aria-label="Filtrar por departamento"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                aria-label="Filtrar por estado"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <div className="flex items-center text-sm text-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                {isLoadingData ? (
                  <div className="flex items-center">
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Cargando...
                  </div>
                ) : (
                  `Mostrando ${staffMembers.length} de ${totalItems}`
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lista de Personal */}
        <motion.div variants={itemVariants}>
          {isLoadingData ? (
            <motion.div
              variants={cardVariants}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-white/20 text-center"
            >
              <Loader className="w-12 h-12 text-[#519a7c] mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Cargando personal...
              </h3>
              <p className="text-gray-600">
                Por favor espera mientras obtenemos los datos del servidor
              </p>
            </motion.div>
          ) : !isConnected ? (
            <motion.div
              variants={cardVariants}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-white/20 text-center"
            >
              <WifiOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sin conexión al servidor
              </h3>
              <p className="text-gray-600 mb-4">
                No se puede conectar con el backend. Verifica que el servidor esté ejecutándose en el puerto 5000.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={refreshData}
                className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors"
              >
                Reintentar conexión
              </motion.button>
            </motion.div>
          ) : staffMembers.length === 0 ? (
            <motion.div
              variants={cardVariants}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-white/20 text-center"
            >
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay personal registrado
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedDepartment !== "Todos" || selectedStatus !== "Todos"
                  ? "No se encontró personal con los filtros seleccionados"
                  : "Agrega el primer miembro del personal para comenzar"
                }
              </p>
              {(!searchTerm && selectedDepartment === "Todos" && selectedStatus === "Todos") && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddStaff}
                  className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors"
                >
                  Agregar Personal
                </motion.button>
              )}
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {staffMembers.map((member) => {
                  const DepartmentIcon = getDepartmentIcon(member.employment.department);
                  
                  return (
                    <motion.div
                      key={member.id}
                      variants={cardVariants}
                      whileHover="hover"
                      className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-shadow duration-200"
                    >
                      {/* Header de la tarjeta */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <img
                            src={member.photo || "/api/placeholder/60/60"}
                            alt={`${member.personalInfo.firstName} ${member.personalInfo.lastName}`}
                            className="w-16 h-16 rounded-full object-cover border-2 border-[#519a7c]"
                            onError={(e) => {
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Crect width='60' height='60' fill='%23f3f4f6'/%3E%3Ctext x='30' y='35' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='24' fill='%236b7280'%3E👤%3C/text%3E%3C/svg%3E";
                            }}
                          />
                          
                          <div>
                            <h3 className="text-lg font-semibold text-[#2d5a45]">
                              {member.personalInfo.firstName} {member.personalInfo.lastName}
                            </h3>
                            <p className="text-gray-600">{member.employment.position}</p>
                            <div className="flex items-center mt-1">
                              <DepartmentIcon className="w-4 h-4 text-[#519a7c] mr-1" />
                              <span className="text-sm text-gray-500">{member.employment.department}</span>
                            </div>
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(member.employment.status)}`}>
                          {member.employment.status}
                        </span>
                      </div>

                      {/* Información de contacto */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="w-4 h-4 mr-2" />
                          {member.personalInfo.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {member.personalInfo.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          Ingreso: {new Date(member.employment.hireDate).toLocaleDateString('es-MX')}
                        </div>
                      </div>

                      {/* Información laboral */}
                      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-gray-600">ID Empleado</p>
                          <p className="font-medium text-[#2d5a45]">{member.employment.employeeId}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Salario</p>
                          <p className="font-medium text-[#2d5a45]">${member.employment.salary.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Habilidades */}
                      {member.skills && member.skills.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Habilidades</p>
                          <div className="flex flex-wrap gap-1">
                            {member.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-[#519a7c] bg-opacity-10 text-[#519a7c] text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {member.skills.length > 3 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                +{member.skills.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Botones de acción */}
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleViewStaff(member)}
                          className="flex-1 px-3 py-2 bg-[#519a7c] text-white text-sm rounded-lg hover:bg-[#2d5a45] transition-colors flex items-center justify-center"
                          aria-label={`Ver detalles de ${member.personalInfo.firstName}`}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEditStaff(member)}
                          className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                          aria-label={`Editar ${member.personalInfo.firstName}`}
                        >
                          <Edit3 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDeleteStaff(member)}
                          className="px-3 py-2 border border-red-300 text-red-700 text-sm rounded-lg hover:bg-red-50 transition-colors"
                          aria-label={`Eliminar ${member.personalInfo.firstName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1 || isLoadingData}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    
                    <span className="px-4 py-2 text-gray-700">
                      Página {currentPage} de {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages || isLoadingData}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Modal de Agregar/Editar Personal */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={handleCancel}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="bg-gradient-to-r from-[#519a7c] to-[#2d5a45] text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">
                    {showAddModal ? "Agregar Personal" : "Editar Personal"}
                  </h2>
                  <button
                    onClick={handleCancel}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    aria-label="Cerrar modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Mostrar errores generales si existen */}
                {Object.keys(formErrors).length > 0 && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <h4 className="text-red-800 font-medium">Por favor corrige los siguientes errores:</h4>
                    </div>
                    <ul className="text-red-700 text-sm list-disc list-inside">
                      {Object.values(formErrors).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Mostrar error de API si existe */}
                {apiError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                      <p className="text-red-800 font-medium">Error del servidor:</p>
                    </div>
                    <p className="text-red-700 text-sm mt-1">{apiError}</p>
                  </div>
                )}

                {/* Formulario */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información Personal */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#2d5a45] mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Información Personal
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
                        Nombre *
                      </label>
                      <input
                        id="firstName"
                        type="text"
                        value={formData.personalInfo?.firstName || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo!,
                            firstName: e.target.value
                          }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.firstName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ingresa el nombre"
                        aria-describedby={formErrors.firstName ? "firstName-error" : undefined}
                      />
                      {formErrors.firstName && (
                        <p id="firstName-error" className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                        Apellidos *
                      </label>
                      <input
                        id="lastName"
                        type="text"
                        value={formData.personalInfo?.lastName || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo!,
                            lastName: e.target.value
                          }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.lastName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ingresa los apellidos"
                        aria-describedby={formErrors.lastName ? "lastName-error" : undefined}
                      />
                      {formErrors.lastName && (
                        <p id="lastName-error" className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dateOfBirth">
                        Fecha de Nacimiento
                      </label>
                      <input
                        id="dateOfBirth"
                        type="date"
                        value={formData.personalInfo?.dateOfBirth || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo!,
                            dateOfBirth: e.target.value
                          }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
                        }`}
                        aria-describedby={formErrors.dateOfBirth ? "dateOfBirth-error" : undefined}
                      />
                      {formErrors.dateOfBirth && (
                        <p id="dateOfBirth-error" className="text-red-500 text-sm mt-1">{formErrors.dateOfBirth}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="nationalId">
                        CURP
                      </label>
                      <input
                        id="nationalId"
                        type="text"
                        value={formData.personalInfo?.nationalId || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo!,
                            nationalId: e.target.value.toUpperCase()
                          }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.nationalId ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="CURP de 18 caracteres"
                        maxLength={18}
                        aria-describedby={formErrors.nationalId ? "nationalId-error" : undefined}
                      />
                      {formErrors.nationalId && (
                        <p id="nationalId-error" className="text-red-500 text-sm mt-1">{formErrors.nationalId}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                        Teléfono
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.personalInfo?.phone || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo!,
                            phone: e.target.value
                          }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.phone ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="+52 993 123 4567"
                        aria-describedby={formErrors.phone ? "phone-error" : undefined}
                      />
                      {formErrors.phone && (
                        <p id="phone-error" className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={formData.personalInfo?.email || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo!,
                            email: e.target.value
                          }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="ejemplo@rancho.com"
                        aria-describedby={formErrors.email ? "email-error" : undefined}
                      />
                      {formErrors.email && (
                        <p id="email-error" className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="address">
                        Dirección
                      </label>
                      <textarea
                        id="address"
                        value={formData.personalInfo?.address || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo!,
                            address: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        rows={3}
                        placeholder="Dirección completa"
                      />
                    </div>
                  </div>

                  {/* Información Laboral */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#2d5a45] mb-4 flex items-center">
                      <Briefcase className="w-5 h-5 mr-2" />
                      Información Laboral
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="employeeId">
                        ID de Empleado
                      </label>
                      <input
                        id="employeeId"
                        type="text"
                        value={formData.employment?.employeeId || ""}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="position">
                        Puesto *
                      </label>
                      <input
                        id="position"
                        type="text"
                        value={formData.employment?.position || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          employment: {
                            ...prev.employment!,
                            position: e.target.value
                          }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.position ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="Ej: Veterinario, Vaquero, Administrador"
                        aria-describedby={formErrors.position ? "position-error" : undefined}
                      />
                      {formErrors.position && (
                        <p id="position-error" className="text-red-500 text-sm mt-1">{formErrors.position}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="department">
                        Departamento *
                      </label>
                      <select
                        id="department"
                        value={formData.employment?.department || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          employment: {
                            ...prev.employment!,
                            department: e.target.value as Department
                          }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.department ? 'border-red-300' : 'border-gray-300'
                        }`}
                        aria-describedby={formErrors.department ? "department-error" : undefined}
                      >
                        <option value="">Selecciona un departamento</option>
                        {DEPARTMENTS.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      {formErrors.department && (
                        <p id="department-error" className="text-red-500 text-sm mt-1">{formErrors.department}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="hireDate">
                        Fecha de Contratación
                      </label>
                      <input
                        id="hireDate"
                        type="date"
                        value={formData.employment?.hireDate || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          employment: {
                            ...prev.employment!,
                            hireDate: e.target.value
                          }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.hireDate ? 'border-red-300' : 'border-gray-300'
                        }`}
                        aria-describedby={formErrors.hireDate ? "hireDate-error" : undefined}
                      />
                      {formErrors.hireDate && (
                        <p id="hireDate-error" className="text-red-500 text-sm mt-1">{formErrors.hireDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="salary">
                        Salario (MXN)
                      </label>
                      <input
                        id="salary"
                        type="number"
                        value={formData.employment?.salary || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          employment: {
                            ...prev.employment!,
                            salary: parseFloat(e.target.value) || 0
                          }
                        }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.salary ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="15000"
                        min="0"
                        aria-describedby={formErrors.salary ? "salary-error" : undefined}
                      />
                      {formErrors.salary && (
                        <p id="salary-error" className="text-red-500 text-sm mt-1">{formErrors.salary}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="contractType">
                        Tipo de Contrato
                      </label>
                      <select
                        id="contractType"
                        value={formData.employment?.contractType || "Permanente"}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          employment: {
                            ...prev.employment!,
                            contractType: e.target.value as ContractType
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      >
                        {CONTRACT_TYPES.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                        Estado
                      </label>
                      <select
                        id="status"
                        value={formData.employment?.status || "Activo"}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          employment: {
                            ...prev.employment!,
                            status: e.target.value as EmploymentStatus
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      >
                        {STATUS_OPTIONS.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                    </div>

                    {/* Habilidades */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-3">Habilidades</h4>
                      
                      <div className="flex gap-2 mb-3">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddSkill();
                            }
                          }}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="Ej: Liderazgo, Manejo de ganado..."
                        />
                        <button
                          type="button"
                          onClick={handleAddSkill}
                          className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors"
                          aria-label="Agregar habilidad"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      {formData.skills && formData.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 bg-[#519a7c] bg-opacity-10 text-[#519a7c] text-sm rounded-full border border-[#519a7c] border-opacity-20"
                            >
                              {skill}
                              <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="ml-2 text-[#519a7c] hover:text-red-500"
                                aria-label={`Eliminar habilidad ${skill}`}
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Contacto de Emergencia */}
                    <div className="pt-4 border-t border-gray-200">
                      <h4 className="font-medium text-gray-800 mb-3">Contacto de Emergencia</h4>
                      
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={formData.personalInfo?.emergencyContact?.name || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: {
                              ...prev.personalInfo!,
                              emergencyContact: {
                                ...prev.personalInfo!.emergencyContact!,
                                name: e.target.value
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="Nombre del contacto"
                        />
                        
                        <input
                          type="tel"
                          value={formData.personalInfo?.emergencyContact?.phone || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: {
                              ...prev.personalInfo!,
                              emergencyContact: {
                                ...prev.personalInfo!.emergencyContact!,
                                phone: e.target.value
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="Teléfono del contacto"
                        />
                        
                        <input
                          type="text"
                          value={formData.personalInfo?.emergencyContact?.relationship || ""}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            personalInfo: {
                              ...prev.personalInfo!,
                              emergencyContact: {
                                ...prev.personalInfo!.emergencyContact!,
                                relationship: e.target.value
                              }
                            }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                          placeholder="Parentesco (Ej: Esposa, Hijo, Madre)"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    Cancelar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSaveStaff}
                    disabled={isLoading}
                    className="px-6 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors flex items-center disabled:opacity-50"
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {isLoading ? "Guardando..." : "Guardar"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Ver Detalles */}
      <AnimatePresence>
        {showViewModal && selectedMember && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeViewModal}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="bg-gradient-to-r from-[#519a7c] to-[#2d5a45] text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      src={selectedMember.photo || "/api/placeholder/80/80"}
                      alt={`${selectedMember.personalInfo.firstName} ${selectedMember.personalInfo.lastName}`}
                      className="w-20 h-20 rounded-full object-cover border-4 border-white"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f3f4f6'/%3E%3Ctext x='40' y='45' text-anchor='middle' dominant-baseline='middle' font-family='Arial' font-size='32' fill='%236b7280'%3E👤%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <div>
                      <h2 className="text-2xl font-bold">
                        {selectedMember.personalInfo.firstName} {selectedMember.personalInfo.lastName}
                      </h2>
                      <p className="text-white/90">{selectedMember.employment.position}</p>
                      <p className="text-white/80">{selectedMember.employment.department}</p>
                    </div>
                  </div>
                  <button
                    onClick={closeViewModal}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                    aria-label="Cerrar modal"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información Personal */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Información Personal</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha de Nacimiento:</span>
                        <span className="font-medium">
                          {new Date(selectedMember.personalInfo.dateOfBirth).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">CURP:</span>
                        <span className="font-medium">{selectedMember.personalInfo.nationalId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Teléfono:</span>
                        <span className="font-medium">{selectedMember.personalInfo.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{selectedMember.personalInfo.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Dirección:</span>
                        <p className="font-medium mt-1">{selectedMember.personalInfo.address}</p>
                      </div>
                    </div>
                  </div>

                  {/* Información Laboral */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Información Laboral</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">ID Empleado:</span>
                        <span className="font-medium">{selectedMember.employment.employeeId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fecha de Ingreso:</span>
                        <span className="font-medium">
                          {new Date(selectedMember.employment.hireDate).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Salario:</span>
                        <span className="font-medium">${selectedMember.employment.salary.toLocaleString()} MXN</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo de Contrato:</span>
                        <span className="font-medium">{selectedMember.employment.contractType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estado:</span>
                        <span className={`px-2 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedMember.employment.status)}`}>
                          {selectedMember.employment.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contacto de Emergencia */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Contacto de Emergencia</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Nombre:</span>
                        <span className="font-medium">{selectedMember.personalInfo.emergencyContact.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Teléfono:</span>
                        <span className="font-medium">{selectedMember.personalInfo.emergencyContact.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Parentesco:</span>
                        <span className="font-medium">{selectedMember.personalInfo.emergencyContact.relationship}</span>
                      </div>
                    </div>
                  </div>

                  {/* Habilidades */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-[#2d5a45] mb-4">Habilidades</h3>
                    {selectedMember.skills && selectedMember.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedMember.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-[#519a7c] bg-opacity-10 text-[#519a7c] text-sm rounded-full border border-[#519a7c] border-opacity-20"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No se han registrado habilidades</p>
                    )}
                  </div>
                </div>

                {/* Botones de acción en el modal */}
                <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      closeViewModal();
                      handleEditStaff(selectedMember);
                    }}
                    className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#2d5a45] transition-colors flex items-center"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Editar
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