// ============================================================================
// STAFF.TSX - GESTIÓN DE PERSONAL DEL RANCHO (CRUD COMPLETO)
// ============================================================================
// Componente CRUD completo para gestionar todo el personal del rancho
// con funciones de crear, leer, actualizar y eliminar empleados

import React, { useState, useEffect } from "react";
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
  Download,
  UserCheck,
} from "lucide-react";

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
    department: string;
    hireDate: string;
    salary: number;
    contractType: "Permanente" | "Temporal" | "Por Proyecto";
    status: "Activo" | "Inactivo" | "Vacaciones" | "Suspendido";
  };
  skills: string[];
  photo?: string;
}

// ============================================================================
// DATOS SIMULADOS INICIALES
// ============================================================================

const initialStaffData: StaffMember[] = [
  {
    id: "1",
    personalInfo: {
      firstName: "Carlos",
      lastName: "Mendoza García",
      dateOfBirth: "1975-03-15",
      nationalId: "MECG750315HTCNDR01",
      phone: "+52 993 123 4567",
      email: "carlos.mendoza@rancho.com",
      address: "Av. Ruiz Cortines 123, Villahermosa, Tabasco",
      emergencyContact: {
        name: "María Mendoza",
        phone: "+52 993 123 4568",
        relationship: "Esposa"
      }
    },
    employment: {
      employeeId: "EMP-001",
      position: "Gerente General",
      department: "Administración",
      hireDate: "2020-01-15",
      salary: 35000,
      contractType: "Permanente",
      status: "Activo"
    },
    skills: ["Liderazgo", "Gestión Ganadera", "Administración"],
    photo: "/api/placeholder/150/150"
  },
  {
    id: "2",
    personalInfo: {
      firstName: "Ana",
      lastName: "López Hernández",
      dateOfBirth: "1988-07-22",
      nationalId: "LOHA880722MTCPRN01",
      phone: "+52 993 234 5678",
      email: "ana.lopez@rancho.com",
      address: "Calle Aldama 45, Villahermosa, Tabasco",
      emergencyContact: {
        name: "José López",
        phone: "+52 993 234 5679",
        relationship: "Padre"
      }
    },
    employment: {
      employeeId: "EMP-002",
      position: "Médico Veterinario",
      department: "Veterinaria",
      hireDate: "2021-03-10",
      salary: 28000,
      contractType: "Permanente",
      status: "Activo"
    },
    skills: ["Medicina Veterinaria", "Reproducción Bovina", "Vacunación"],
    photo: "/api/placeholder/150/150"
  },
  {
    id: "3",
    personalInfo: {
      firstName: "Miguel",
      lastName: "Ramírez Torres",
      dateOfBirth: "1992-11-08",
      nationalId: "RATM921108HTCMRG01",
      phone: "+52 993 345 6789",
      email: "miguel.ramirez@rancho.com",
      address: "Calle Morelos 78, Villahermosa, Tabasco",
      emergencyContact: {
        name: "Rosa Torres",
        phone: "+52 993 345 6790",
        relationship: "Madre"
      }
    },
    employment: {
      employeeId: "EMP-003",
      position: "Vaquero Principal",
      department: "Ganadería",
      hireDate: "2022-05-15",
      salary: 18000,
      contractType: "Permanente",
      status: "Activo"
    },
    skills: ["Manejo de Ganado", "Ordeño", "Pastoreo"],
    photo: "/api/placeholder/150/150"
  },
  {
    id: "4",
    personalInfo: {
      firstName: "Laura",
      lastName: "Hernández Mora",
      dateOfBirth: "1985-04-12",
      nationalId: "HEML850412MTCRRA01",
      phone: "+52 993 456 7890",
      email: "laura.hernandez@rancho.com",
      address: "Av. Universidad 234, Villahermosa, Tabasco",
      emergencyContact: {
        name: "Pedro Hernández",
        phone: "+52 993 456 7891",
        relationship: "Hermano"
      }
    },
    employment: {
      employeeId: "EMP-004",
      position: "Contadora",
      department: "Administración",
      hireDate: "2021-09-01",
      salary: 22000,
      contractType: "Permanente",
      status: "Activo"
    },
    skills: ["Contabilidad", "Finanzas", "Recursos Humanos"],
    photo: "/api/placeholder/150/150"
  }
];

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
// COMPONENTE PRINCIPAL
// ============================================================================

const Staff: React.FC = () => {
  // Estados principales
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(initialStaffData);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>(initialStaffData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("Todos");
  const [selectedStatus, setSelectedStatus] = useState("Todos");
  
  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<StaffMember | null>(null);

  // Estados para formulario
  const [formData, setFormData] = useState<Partial<StaffMember>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Departamentos únicos para filtro
  const departments = ["Todos", ...Array.from(new Set(staffMembers.map(member => member.employment.department)))];
  const statusOptions = ["Todos", "Activo", "Inactivo", "Vacaciones", "Suspendido"];

  // Efecto para filtrar personal
  useEffect(() => {
    let filtered = staffMembers;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.personalInfo.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.personalInfo.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employment.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.employment.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== "Todos") {
      filtered = filtered.filter(member => member.employment.department === selectedDepartment);
    }

    if (selectedStatus !== "Todos") {
      filtered = filtered.filter(member => member.employment.status === selectedStatus);
    }

    setFilteredStaff(filtered);
  }, [staffMembers, searchTerm, selectedDepartment, selectedStatus]);

  // Función para generar ID único
  const generateId = () => {
    return Date.now().toString();
  };

  // Función para generar ID de empleado
  const generateEmployeeId = () => {
    const maxId = Math.max(...staffMembers.map(member => 
      parseInt(member.employment.employeeId.replace('EMP-', '')) || 0
    ));
    return `EMP-${String(maxId + 1).padStart(3, '0')}`;
  };

  // Función para agregar personal
  const handleAddStaff = () => {
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
        department: "",
        hireDate: new Date().toISOString().split('T')[0],
        salary: 0,
        contractType: "Permanente",
        status: "Activo"
      },
      skills: []
    });
    setShowAddModal(true);
  };

  // Función para editar personal
  const handleEditStaff = (member: StaffMember) => {
    setFormData(member);
    setSelectedMember(member);
    setShowEditModal(true);
  };

  // Función para ver detalles
  const handleViewStaff = (member: StaffMember) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  // Función para eliminar personal
  const handleDeleteStaff = (member: StaffMember) => {
    if (confirm(`¿Estás seguro de que quieres eliminar a ${member.personalInfo.firstName} ${member.personalInfo.lastName}?`)) {
      setStaffMembers(prev => prev.filter(m => m.id !== member.id));
    }
  };

  // Función para guardar (agregar o editar)
  const handleSaveStaff = () => {
    if (!formData.personalInfo?.firstName || !formData.personalInfo?.lastName || !formData.employment?.position) {
      alert("Por favor, completa los campos obligatorios");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const newMember: StaffMember = {
        id: selectedMember?.id || generateId(),
        personalInfo: formData.personalInfo!,
        employment: formData.employment!,
        skills: formData.skills || [],
        photo: formData.photo
      };

      if (selectedMember) {
        // Editar
        setStaffMembers(prev => prev.map(m => m.id === selectedMember.id ? newMember : m));
      } else {
        // Agregar
        setStaffMembers(prev => [...prev, newMember]);
      }

      setIsLoading(false);
      setShowAddModal(false);
      setShowEditModal(false);
      setFormData({});
      setSelectedMember(null);
    }, 1000);
  };

  // Función para cancelar
  const handleCancel = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setFormData({});
    setSelectedMember(null);
  };

  // Función para obtener color del estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Activo": return "bg-green-100 text-green-800";
      case "Inactivo": return "bg-gray-100 text-gray-800";
      case "Vacaciones": return "bg-blue-100 text-blue-800";
      case "Suspendido": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Función para obtener icono del departamento
  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case "Administración": return Building;
      case "Veterinaria": return Shield;
      case "Ganadería": return Users;
      case "Mantenimiento": return Award;
      default: return Briefcase;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F5DC] via-[#E8E8C8] to-[#D3D3B8] p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-[#2d5a45] mb-2">
                Gestión de Personal
              </h1>
              <p className="text-gray-600 text-lg">
                Administra todo el personal del rancho
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => console.log("Exportar datos")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
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
                <p className="text-3xl font-bold text-[#2d5a45]">{staffMembers.length}</p>
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
                <p className="text-3xl font-bold text-green-600">
                  {staffMembers.filter(m => m.employment.status === "Activo").length}
                </p>
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
                <p className="text-3xl font-bold text-[#2d5a45]">{departments.length - 1}</p>
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
                  ${Math.round(staffMembers.reduce((sum, m) => sum + m.employment.salary, 0) / staffMembers.length).toLocaleString()}
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
                />
              </div>

              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <div className="flex items-center text-sm text-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                Mostrando {filteredStaff.length} de {staffMembers.length}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lista de Personal */}
        <motion.div variants={itemVariants}>
          {filteredStaff.length === 0 ? (
            <motion.div
              variants={cardVariants}
              className="bg-white/90 backdrop-blur-sm rounded-xl p-12 shadow-lg border border-white/20 text-center"
            >
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {staffMembers.length === 0 ? "No hay personal registrado" : "No se encontró personal"}
              </h3>
              <p className="text-gray-600 mb-4">
                {staffMembers.length === 0 
                  ? "Agrega el primer miembro del personal para comenzar"
                  : "Intenta ajustar los filtros de búsqueda"
                }
              </p>
              {staffMembers.length === 0 && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStaff.map((member) => {
                const DepartmentIcon = getDepartmentIcon(member.employment.department);
                
                return (
                  <motion.div
                    key={member.id}
                    variants={cardVariants}
                    whileHover="hover"
                    className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20"
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
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleEditStaff(member)}
                        className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteStaff(member)}
                        className="px-3 py-2 border border-red-300 text-red-700 text-sm rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
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
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Formulario */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información Personal */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[#2d5a45] mb-4 flex items-center">
                      <User className="w-5 h-5 mr-2" />
                      Información Personal
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        value={formData.personalInfo?.firstName || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo!,
                            firstName: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        placeholder="Ingresa el nombre"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellidos *
                      </label>
                      <input
                        type="text"
                        value={formData.personalInfo?.lastName || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo!,
                            lastName: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        placeholder="Ingresa los apellidos"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        value={formData.personalInfo?.dateOfBirth || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo!,
                            dateOfBirth: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CURP
                      </label>
                      <input
                        type="text"
                        value={formData.personalInfo?.nationalId || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo!,
                            nationalId: e.target.value.toUpperCase()
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        placeholder="CURP de 18 caracteres"
                        maxLength={18}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.personalInfo?.phone || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo!,
                            phone: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        placeholder="+52 993 123 4567"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.personalInfo?.email || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          personalInfo: {
                            ...prev.personalInfo!,
                            email: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        placeholder="ejemplo@rancho.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dirección
                      </label>
                      <textarea
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID de Empleado
                      </label>
                      <input
                        type="text"
                        value={formData.employment?.employeeId || ""}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Puesto *
                      </label>
                      <input
                        type="text"
                        value={formData.employment?.position || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          employment: {
                            ...prev.employment!,
                            position: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        placeholder="Ej: Veterinario, Vaquero, Administrador"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Departamento
                      </label>
                      <select
                        value={formData.employment?.department || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          employment: {
                            ...prev.employment!,
                            department: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      >
                        <option value="">Selecciona un departamento</option>
                        <option value="Administración">Administración</option>
                        <option value="Veterinaria">Veterinaria</option>
                        <option value="Ganadería">Ganadería</option>
                        <option value="Mantenimiento">Mantenimiento</option>
                        <option value="Seguridad">Seguridad</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Contratación
                      </label>
                      <input
                        type="date"
                        value={formData.employment?.hireDate || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          employment: {
                            ...prev.employment!,
                            hireDate: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salario (MXN)
                      </label>
                      <input
                        type="number"
                        value={formData.employment?.salary || ""}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          employment: {
                            ...prev.employment!,
                            salary: parseFloat(e.target.value) || 0
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        placeholder="15000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Contrato
                      </label>
                      <select
                        value={formData.employment?.contractType || "Permanente"}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          employment: {
                            ...prev.employment!,
                            contractType: e.target.value as any
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      >
                        <option value="Permanente">Permanente</option>
                        <option value="Temporal">Temporal</option>
                        <option value="Por Proyecto">Por Proyecto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <select
                        value={formData.employment?.status || "Activo"}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          employment: {
                            ...prev.employment!,
                            status: e.target.value as any
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      >
                        <option value="Activo">Activo</option>
                        <option value="Inactivo">Inactivo</option>
                        <option value="Vacaciones">Vacaciones</option>
                        <option value="Suspendido">Suspendido</option>
                      </select>
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
            onClick={() => setShowViewModal(false)}
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
                    onClick={() => setShowViewModal(false)}
                    className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
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
                      setShowViewModal(false);
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