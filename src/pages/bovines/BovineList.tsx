import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  CheckSquare,
  Square,
  RefreshCw,
  SortAsc,
  SortDesc,
  FileDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Interfaces para los datos de bovinos
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface BovineData {
  id: string;
  earTag: string;
  name?: string;
  type: "CATTLE" | "BULL" | "COW" | "CALF";
  breed: string;
  gender: "MALE" | "FEMALE";
  birthDate: Date;
  age: {
    years: number;
    months: number;
    days: number;
  };
  weight: number;
  motherEarTag?: string;
  fatherEarTag?: string;
  location: Location;
  healthStatus: "HEALTHY" | "SICK" | "RECOVERING" | "QUARANTINE" | "DECEASED";
  lastVaccination?: Date;
  nextVaccinationDue?: Date;
  photos: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FilterOptions {
  searchTerm: string;
  type: string;
  breed: string;
  gender: string;
  healthStatus: string;
  ageRange: string;
  weightRange: string;
  vaccinationStatus: string;
}

interface SortOption {
  field: keyof BovineData | "age" | "vaccinationStatus";
  direction: "asc" | "desc";
}

type ViewMode = "table" | "cards";

// Componente para mostrar el estado de salud
const HealthStatusBadge: React.FC<{ status: BovineData["healthStatus"] }> = ({
  status,
}) => {
  const statusConfig = {
    HEALTHY: {
      color: "bg-green-100 text-green-800",
      icon: CheckCircle,
      label: "Saludable",
    },
    SICK: {
      color: "bg-red-100 text-red-800",
      icon: AlertTriangle,
      label: "Enfermo",
    },
    RECOVERING: {
      color: "bg-yellow-100 text-yellow-800",
      icon: Clock,
      label: "Recuperándose",
    },
    QUARANTINE: {
      color: "bg-orange-100 text-orange-800",
      icon: Shield,
      label: "Cuarentena",
    },
    DECEASED: {
      color: "bg-gray-100 text-gray-800",
      icon: AlertTriangle,
      label: "Fallecido",
    },
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <IconComponent className="w-3 h-3" />
      {config.label}
    </div>
  );
};

// Componente para la tarjeta de bovino
const BovineCard: React.FC<{
  bovine: BovineData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  index: number;
}> = ({ bovine, isSelected, onSelect, onView, onEdit, onDelete, index }) => {
  const [showMenu, setShowMenu] = useState(false);

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      return `${years - 1}a ${months + 12}m`;
    }
    return `${years}a ${months}m`;
  };

  const getVaccinationStatus = () => {
    if (!bovine.nextVaccinationDue)
      return {
        status: "unknown",
        color: "bg-gray-100 text-gray-600",
        label: "Sin datos",
      };

    const today = new Date();
    const dueDate = new Date(bovine.nextVaccinationDue);
    const daysUntilDue = Math.ceil(
      (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilDue < 0) {
      return {
        status: "overdue",
        color: "bg-red-100 text-red-600",
        label: "Vencida",
      };
    } else if (daysUntilDue <= 7) {
      return {
        status: "due",
        color: "bg-yellow-100 text-yellow-600",
        label: "Próxima",
      };
    } else {
      return {
        status: "current",
        color: "bg-green-100 text-green-600",
        label: "Al día",
      };
    }
  };

  const vaccinationStatus = getVaccinationStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-lg shadow-md border-2 transition-all duration-300 hover:shadow-lg ${
        isSelected
          ? "border-[#3d8b40] bg-green-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {/* Header con foto y checkbox */}
      <div className="relative">
        {bovine.photos.length > 0 ? (
          <img
            src={bovine.photos[0]}
            alt={`Foto de ${bovine.name || bovine.earTag}`}
            className="w-full h-32 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg flex items-center justify-center">
            <Users className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {/* Checkbox de selección */}
        <button
          onClick={() => onSelect(bovine.id)}
          className="absolute top-2 left-2 p-1 bg-white/90 backdrop-blur-sm rounded"
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-[#3d8b40]" />
          ) : (
            <Square className="w-4 h-4 text-gray-600" />
          )}
        </button>

        {/* Menú de acciones */}
        <div className="absolute top-2 right-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 bg-white/90 backdrop-blur-sm rounded text-gray-600 hover:text-gray-800"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]"
              >
                <button
                  onClick={() => {
                    onView(bovine.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Eye className="w-4 h-4" />
                  Ver
                </button>
                <button
                  onClick={() => {
                    onEdit(bovine.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    onDelete(bovine.id);
                    setShowMenu(false);
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Badge de estado de salud */}
        <div className="absolute bottom-2 left-2">
          <HealthStatusBadge status={bovine.healthStatus} />
        </div>
      </div>

      {/* Contenido de la tarjeta */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {bovine.name || `Bovino ${bovine.earTag}`}
            </h3>
            <p className="text-sm text-gray-600">Arete: {bovine.earTag}</p>
          </div>
          <span
            className={`px-2 py-1 rounded text-xs font-medium ${vaccinationStatus.color}`}
          >
            {vaccinationStatus.label}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-medium text-gray-700">Raza:</span>
            <p className="text-gray-600">{bovine.breed}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Tipo:</span>
            <p className="text-gray-600">{bovine.type}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Edad:</span>
            <p className="text-gray-600">{calculateAge(bovine.birthDate)}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Peso:</span>
            <p className="text-gray-600">{bovine.weight} kg</p>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={() => onView(bovine.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-[#3d8b40] hover:bg-green-50 rounded transition-colors"
          >
            <Eye className="w-4 h-4" />
            Ver
          </button>
          <button
            onClick={() => onEdit(bovine.id)}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Componente para la fila de tabla
const BovineTableRow: React.FC<{
  bovine: BovineData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ bovine, isSelected, onSelect, onView, onEdit, onDelete }) => {
  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birth.getDate())) {
      return `${years - 1}a ${months + 12}m`;
    }
    return `${years}a ${months}m`;
  };

  return (
    <motion.tr
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
        isSelected ? "bg-green-50" : ""
      }`}
    >
      <td className="px-4 py-3">
        <button
          onClick={() => onSelect(bovine.id)}
          className="flex items-center justify-center"
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-[#3d8b40]" />
          ) : (
            <Square className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {bovine.photos.length > 0 ? (
            <img
              src={bovine.photos[0]}
              alt={`Foto de ${bovine.name || bovine.earTag}`}
              className="w-10 h-10 object-cover rounded-full"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900">
              {bovine.name || `Bovino ${bovine.earTag}`}
            </p>
            <p className="text-sm text-gray-600">{bovine.earTag}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{bovine.breed}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{bovine.type}</td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {bovine.gender === "MALE" ? "Macho" : "Hembra"}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {calculateAge(bovine.birthDate)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{bovine.weight} kg</td>
      <td className="px-4 py-3">
        <HealthStatusBadge status={bovine.healthStatus} />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(bovine.id)}
            className="p-1 text-gray-600 hover:text-[#3d8b40] transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(bovine.id)}
            className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
            title="Editar"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(bovine.id)}
            className="p-1 text-gray-600 hover:text-red-600 transition-colors"
            title="Eliminar"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// Componente principal de lista de bovinos
const BovineList: React.FC = () => {
  const navigate = useNavigate();

  // Estados principales
  const [bovines, setBovines] = useState<BovineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [selectedBovines, setSelectedBovines] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [] = useState(false);

  // Estados de filtros y ordenamiento
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: "",
    type: "",
    breed: "",
    gender: "",
    healthStatus: "",
    ageRange: "",
    weightRange: "",
    vaccinationStatus: "",
  });

  const [sortOption, setSortOption] = useState<SortOption>({
    field: "updatedAt",
    direction: "desc",
  });

  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Datos mock
  useEffect(() => {
    const loadBovines = async () => {
      try {
        setLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Datos simulados
        const mockBovines: BovineData[] = [
          {
            id: "1",
            earTag: "MX-001234",
            name: "Lupita",
            type: "COW",
            breed: "Holstein",
            gender: "FEMALE",
            birthDate: new Date("2020-03-15"),
            age: { years: 4, months: 4, days: 23 },
            weight: 550,
            motherEarTag: "MX-000123",
            fatherEarTag: "MX-000456",
            location: {
              latitude: 17.9869,
              longitude: -92.9303,
              address: "Rancho San José",
            },
            healthStatus: "HEALTHY",
            lastVaccination: new Date("2024-06-15"),
            nextVaccinationDue: new Date("2025-06-15"),
            photos: [
              "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400",
            ],
            notes: "Excelente productora de leche",
            createdAt: new Date("2020-03-15"),
            updatedAt: new Date("2024-07-08"),
          },
          {
            id: "2",
            earTag: "MX-001235",
            name: "Torito",
            type: "BULL",
            breed: "Brahman",
            gender: "MALE",
            birthDate: new Date("2019-08-20"),
            age: { years: 4, months: 11, days: 18 },
            weight: 750,
            location: {
              latitude: 17.99,
              longitude: -92.925,
              address: "Potrero Norte",
            },
            healthStatus: "HEALTHY",
            lastVaccination: new Date("2024-05-10"),
            nextVaccinationDue: new Date("2024-12-10"),
            photos: [
              "https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=400",
            ],
            notes: "Reproductor de élite",
            createdAt: new Date("2019-08-20"),
            updatedAt: new Date("2024-07-05"),
          },
          {
            id: "3",
            earTag: "MX-001236",
            name: "Blanquita",
            type: "COW",
            breed: "Charolais",
            gender: "FEMALE",
            birthDate: new Date("2021-01-10"),
            age: { years: 3, months: 6, days: 28 },
            weight: 480,
            location: {
              latitude: 17.985,
              longitude: -92.928,
              address: "Potrero Sur",
            },
            healthStatus: "RECOVERING",
            lastVaccination: new Date("2024-04-20"),
            nextVaccinationDue: new Date("2024-08-15"),
            photos: [],
            notes: "En tratamiento por mastitis leve",
            createdAt: new Date("2021-01-10"),
            updatedAt: new Date("2024-07-01"),
          },
          {
            id: "4",
            earTag: "MX-001237",
            type: "CALF",
            breed: "Holstein",
            gender: "FEMALE",
            birthDate: new Date("2024-02-14"),
            age: { years: 0, months: 5, days: 24 },
            weight: 85,
            motherEarTag: "MX-001234",
            location: {
              latitude: 17.988,
              longitude: -92.932,
              address: "Corral de Terneros",
            },
            healthStatus: "HEALTHY",
            photos: [],
            createdAt: new Date("2024-02-14"),
            updatedAt: new Date("2024-07-08"),
          },
          {
            id: "5",
            earTag: "MX-001238",
            name: "Negrito",
            type: "BULL",
            breed: "Angus",
            gender: "MALE",
            birthDate: new Date("2018-11-05"),
            age: { years: 5, months: 8, days: 3 },
            weight: 820,
            location: {
              latitude: 17.992,
              longitude: -92.92,
              address: "Potrero Principal",
            },
            healthStatus: "QUARANTINE",
            lastVaccination: new Date("2024-03-15"),
            nextVaccinationDue: new Date("2024-07-10"),
            photos: [],
            notes: "En cuarentena preventiva",
            createdAt: new Date("2018-11-05"),
            updatedAt: new Date("2024-06-28"),
          },
        ];

        setBovines(mockBovines);
      } catch (error) {
        console.error("Error cargando bovinos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBovines();
  }, []);

  // Filtrar y ordenar bovinos
  const filteredAndSortedBovines = useMemo(() => {
    let filtered = bovines;

    // Aplicar filtros
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (bovine) =>
          bovine.earTag.toLowerCase().includes(searchLower) ||
          bovine.name?.toLowerCase().includes(searchLower) ||
          bovine.breed.toLowerCase().includes(searchLower) ||
          bovine.notes?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.type) {
      filtered = filtered.filter((bovine) => bovine.type === filters.type);
    }

    if (filters.breed) {
      filtered = filtered.filter((bovine) => bovine.breed === filters.breed);
    }

    if (filters.gender) {
      filtered = filtered.filter((bovine) => bovine.gender === filters.gender);
    }

    if (filters.healthStatus) {
      filtered = filtered.filter(
        (bovine) => bovine.healthStatus === filters.healthStatus
      );
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortOption.field) {
        case "age":
          aValue = a.age.years * 12 + a.age.months;
          bValue = b.age.years * 12 + b.age.months;
          break;
        case "vaccinationStatus":
          const aStatus = a.nextVaccinationDue
            ? new Date(a.nextVaccinationDue).getTime()
            : 0;
          const bStatus = b.nextVaccinationDue
            ? new Date(b.nextVaccinationDue).getTime()
            : 0;
          aValue = aStatus;
          bValue = bStatus;
          break;
        default:
          aValue = a[sortOption.field as keyof BovineData];
          bValue = b[sortOption.field as keyof BovineData];
      }

      if (aValue < bValue) return sortOption.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOption.direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [bovines, filters, sortOption]);

  // Paginación
  const totalItems = filteredAndSortedBovines.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBovines = filteredAndSortedBovines.slice(startIndex, endIndex);

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: bovines.length,
      healthy: bovines.filter((b) => b.healthStatus === "HEALTHY").length,
      sick: bovines.filter(
        (b) => b.healthStatus === "SICK" || b.healthStatus === "RECOVERING"
      ).length,
      quarantine: bovines.filter((b) => b.healthStatus === "QUARANTINE").length,
      bulls: bovines.filter((b) => b.type === "BULL").length,
      cows: bovines.filter((b) => b.type === "COW").length,
      calves: bovines.filter((b) => b.type === "CALF").length,
      avgWeight:
        bovines.length > 0
          ? Math.round(
              bovines.reduce((sum, b) => sum + b.weight, 0) / bovines.length
            )
          : 0,
    };
  }, [bovines]);

  // Obtener razas únicas
  const uniqueBreeds = useMemo(() => {
    return Array.from(new Set(bovines.map((b) => b.breed))).sort();
  }, [bovines]);

  // Manejar selección
  const handleSelectBovine = (id: string) => {
    setSelectedBovines((prev) =>
      prev.includes(id)
        ? prev.filter((selectedId) => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBovines.length === currentBovines.length) {
      setSelectedBovines([]);
    } else {
      setSelectedBovines(currentBovines.map((b) => b.id));
    }
  };

  // Acciones de bovinos
  const handleViewBovine = (id: string) => {
    navigate(`/bovines/detail/${id}`);
  };

  const handleEditBovine = (id: string) => {
    navigate(`/bovines/edit/${id}`);
  };

  const handleDeleteBovine = (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este bovino?")) {
      setBovines((prev) => prev.filter((b) => b.id !== id));
      setSelectedBovines((prev) =>
        prev.filter((selectedId) => selectedId !== id)
      );
    }
  };

  // Acciones batch
  const handleBatchDelete = () => {
    if (
      window.confirm(
        `¿Estás seguro de que deseas eliminar ${selectedBovines.length} bovino(s)?`
      )
    ) {
      setBovines((prev) => prev.filter((b) => !selectedBovines.includes(b.id)));
      setSelectedBovines([]);
    }
  };

  const handleExport = () => {
    // Simular exportación
    alert("Exportando datos...");
  };

  // Limpiar filtros
  const clearFilters = () => {
    setFilters({
      searchTerm: "",
      type: "",
      breed: "",
      gender: "",
      healthStatus: "",
      ageRange: "",
      weightRange: "",
      vaccinationStatus: "",
    });
    setCurrentPage(1);
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-[#3d8b40] border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-lg font-medium text-gray-700">
            Cargando ganado bovino...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header con título y estadísticas */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Gestión de Ganado Bovino
          </h1>
          <p className="text-lg text-white/80 max-w-2xl mx-auto mb-6">
            Administra y supervisa todo tu ganado desde un solo lugar
          </p>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.healthy}
              </div>
              <div className="text-sm text-gray-600">Saludables</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.sick}
              </div>
              <div className="text-sm text-gray-600">Enfermos</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stats.quarantine}
              </div>
              <div className="text-sm text-gray-600">Cuarentena</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.bulls}
              </div>
              <div className="text-sm text-gray-600">Toros</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stats.cows}
              </div>
              <div className="text-sm text-gray-600">Vacas</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.calves}
              </div>
              <div className="text-sm text-gray-600">Becerros</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-gray-600">
                {stats.avgWeight}kg
              </div>
              <div className="text-sm text-gray-600">Peso Prom.</div>
            </div>
          </div>
        </motion.div>

        {/* Controles principales */}
        <motion.div
          variants={itemVariants}
          className="bg-[#fffdf8]/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por arete, nombre, raza o notas..."
                value={filters.searchTerm}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    searchTerm: e.target.value,
                  }))
                }
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
              />
            </div>

            {/* Controles */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-all duration-300 ${
                  showFilters
                    ? "bg-[#3d8b40] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Filter className="w-5 h-5" />
                Filtros
              </button>

              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-3 py-3 transition-colors ${
                    viewMode === "cards"
                      ? "bg-[#3d8b40] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-3 transition-colors ${
                    viewMode === "table"
                      ? "bg-[#3d8b40] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={() => navigate("/bovines/add")}
                className="flex items-center gap-2 px-4 py-3 bg-[#3d8b40] text-white rounded-lg hover:bg-[#2d6e30] transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                Agregar
              </button>
            </div>
          </div>

          {/* Filtros expandibles */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 pt-4 overflow-hidden"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, type: e.target.value }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="CATTLE">Ganado</option>
                    <option value="BULL">Toro</option>
                    <option value="COW">Vaca</option>
                    <option value="CALF">Becerro</option>
                  </select>

                  <select
                    value={filters.breed}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, breed: e.target.value }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
                  >
                    <option value="">Todas las razas</option>
                    {uniqueBreeds.map((breed) => (
                      <option key={breed} value={breed}>
                        {breed}
                      </option>
                    ))}
                  </select>

                  <select
                    value={filters.gender}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        gender: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
                  >
                    <option value="">Todos los sexos</option>
                    <option value="MALE">Macho</option>
                    <option value="FEMALE">Hembra</option>
                  </select>

                  <select
                    value={filters.healthStatus}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        healthStatus: e.target.value,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
                  >
                    <option value="">Todos los estados</option>
                    <option value="HEALTHY">Saludable</option>
                    <option value="SICK">Enfermo</option>
                    <option value="RECOVERING">Recuperándose</option>
                    <option value="QUARANTINE">Cuarentena</option>
                    <option value="DECEASED">Fallecido</option>
                  </select>

                  <select
                    value={sortOption.field}
                    onChange={(e) =>
                      setSortOption((prev) => ({
                        ...prev,
                        field: e.target.value as any,
                      }))
                    }
                    className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
                  >
                    <option value="updatedAt">Última actualización</option>
                    <option value="createdAt">Fecha de registro</option>
                    <option value="earTag">Arete</option>
                    <option value="name">Nombre</option>
                    <option value="breed">Raza</option>
                    <option value="age">Edad</option>
                    <option value="weight">Peso</option>
                  </select>

                  <button
                    onClick={() =>
                      setSortOption((prev) => ({
                        ...prev,
                        direction: prev.direction === "asc" ? "desc" : "asc",
                      }))
                    }
                    className="flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                  >
                    {sortOption.direction === "asc" ? (
                      <SortAsc className="w-4 h-4" />
                    ) : (
                      <SortDesc className="w-4 h-4" />
                    )}
                    {sortOption.direction === "asc"
                      ? "Ascendente"
                      : "Descendente"}
                  </button>
                </div>

                <div className="flex justify-end mt-4">
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Limpiar filtros
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Acciones batch */}
          <AnimatePresence>
            {selectedBovines.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium text-blue-900">
                    {selectedBovines.length} bovino(s) seleccionado(s)
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-3 py-2 bg-white text-blue-700 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
                  >
                    <FileDown className="w-4 h-4" />
                    Exportar
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                  <button
                    onClick={() => setSelectedBovines([])}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Lista/Tabla de bovinos */}
        <motion.div
          variants={itemVariants}
          className="bg-[#fffdf8]/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden"
        >
          {/* Header de resultados */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Resultados ({filteredAndSortedBovines.length})
              </h2>
              <div className="flex items-center gap-4">
                {viewMode === "table" && (
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    {selectedBovines.length === currentBovines.length ? (
                      <CheckSquare className="w-4 h-4" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                    Seleccionar todo
                  </button>
                )}
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={12}>12 por página</option>
                  <option value={24}>24 por página</option>
                  <option value={48}>48 por página</option>
                  <option value={96}>96 por página</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contenido */}
          {currentBovines.length > 0 ? (
            <>
              {viewMode === "cards" ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {currentBovines.map((bovine, index) => (
                      <BovineCard
                        key={bovine.id}
                        bovine={bovine}
                        isSelected={selectedBovines.includes(bovine.id)}
                        onSelect={handleSelectBovine}
                        onView={handleViewBovine}
                        onEdit={handleEditBovine}
                        onDelete={handleDeleteBovine}
                        index={index}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <button
                            onClick={handleSelectAll}
                            className="flex items-center justify-center"
                          >
                            {selectedBovines.length ===
                            currentBovines.length ? (
                              <CheckSquare className="w-4 h-4 text-[#3d8b40]" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-600" />
                            )}
                          </button>
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Bovino
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Raza
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Tipo
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Sexo
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Edad
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Peso
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Estado
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentBovines.map((bovine) => (
                        <BovineTableRow
                          key={bovine.id}
                          bovine={bovine}
                          isSelected={selectedBovines.includes(bovine.id)}
                          onSelect={handleSelectBovine}
                          onView={handleViewBovine}
                          onEdit={handleEditBovine}
                          onDelete={handleDeleteBovine}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Mostrando {startIndex + 1} a{" "}
                      {Math.min(endIndex, totalItems)} de {totalItems}{" "}
                      resultados
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Anterior
                      </button>

                      <div className="flex gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const page = i + 1;
                            const isActive = page === currentPage;
                            return (
                              <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 text-sm rounded transition-colors ${
                                  isActive
                                    ? "bg-[#3d8b40] text-white"
                                    : "border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1)
                          )
                        }
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Siguiente
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No se encontraron bovinos
              </h3>
              <p className="text-gray-600 mb-4">
                {filters.searchTerm || Object.values(filters).some((v) => v)
                  ? "No hay bovinos que coincidan con los filtros aplicados."
                  : "Aún no tienes bovinos registrados en el sistema."}
              </p>
              {filters.searchTerm || Object.values(filters).some((v) => v) ? (
                <button
                  onClick={clearFilters}
                  className="text-[#3d8b40] hover:text-[#2d6e30] font-medium"
                >
                  Limpiar filtros
                </button>
              ) : (
                <button
                  onClick={() => navigate("/bovines/add")}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3d8b40] text-white rounded-lg hover:bg-[#2d6e30] transition-colors mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Agregar primer bovino
                </button>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BovineList;
