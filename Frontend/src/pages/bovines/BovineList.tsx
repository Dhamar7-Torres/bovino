import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  MapPin,
  Calendar,
  Weight,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Grid3X3,
  List,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Interface para los datos del bovino en la lista
interface BovineListItem {
  id: string;
  earTag: string;
  name?: string;
  type: "CATTLE" | "BULL" | "COW" | "CALF";
  breed: string;
  gender: "MALE" | "FEMALE";
  age: {
    years: number;
    months: number;
  };
  weight: number;
  healthStatus: "HEALTHY" | "SICK" | "RECOVERING" | "QUARANTINE" | "DECEASED";
  lastVaccination?: Date;
  location: string;
  photo?: string;
  createdAt: Date;
}

// Componente para mostrar el estado de salud
const HealthStatusBadge: React.FC<{ status: BovineListItem["healthStatus"] }> = ({
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

// Componente de tarjeta de bovino
const BovineCard: React.FC<{
  bovine: BovineListItem;
  index: number;
  viewMode: "grid" | "list";
}> = ({ bovine, viewMode }) => {
  const navigate = useNavigate();

  if (viewMode === "list") {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 p-4">
        <div className="flex items-center gap-4">
          {/* Foto del bovino */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            {bovine.photo ? (
              <img
                src={bovine.photo}
                alt={bovine.name || bovine.earTag}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Información básica */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {bovine.name || `Bovino ${bovine.earTag}`}
              </h3>
              <HealthStatusBadge status={bovine.healthStatus} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Arete:</span> {bovine.earTag}
              </div>
              <div>
                <span className="font-medium">Raza:</span> {bovine.breed}
              </div>
              <div>
                <span className="font-medium">Edad:</span> {bovine.age.years}a {bovine.age.months}m
              </div>
              <div>
                <span className="font-medium">Peso:</span> {bovine.weight} kg
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/bovines/detail/${bovine.id}`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate(`/bovines/edit/${bovine.id}`)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
      onClick={() => navigate(`/bovines/detail/${bovine.id}`)}
    >
      {/* Foto del bovino */}
      <div className="relative h-48 bg-gray-100">
        {bovine.photo ? (
          <img
            src={bovine.photo}
            alt={bovine.name || bovine.earTag}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Users className="w-16 h-16 text-gray-400" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <HealthStatusBadge status={bovine.healthStatus} />
        </div>
      </div>

      {/* Información */}
      <div className="p-4">
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {bovine.name || `Bovino ${bovine.earTag}`}
          </h3>
          <p className="text-sm text-gray-600">Arete: {bovine.earTag}</p>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium">Raza:</span>
            <span>{bovine.breed}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>{bovine.age.years} años, {bovine.age.months} meses</span>
          </div>
          <div className="flex items-center gap-2">
            <Weight className="w-4 h-4" />
            <span>{bovine.weight} kg</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>{bovine.location}</span>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/bovines/detail/${bovine.id}`);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            Ver
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/bovines/edit/${bovine.id}`);
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal de lista de bovinos
const BovineList: React.FC = () => {
  const navigate = useNavigate();
  const [bovines, setBovines] = useState<BovineListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Cargar datos de bovinos
  useEffect(() => {
    const loadBovines = () => {
      // Datos simulados - sin async para evitar problemas
      const mockBovines: BovineListItem[] = [
        {
          id: "1",
          earTag: "MX-001234",
          name: "Lupita",
          type: "COW",
          breed: "Holstein",
          gender: "FEMALE",
          age: { years: 4, months: 4 },
          weight: 550,
          healthStatus: "HEALTHY",
          lastVaccination: new Date("2024-06-15"),
          location: "Potrero A",
          photo: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400",
          createdAt: new Date("2020-03-15"),
        },
        {
          id: "2",
          earTag: "MX-001235",
          name: "Esperanza",
          type: "COW",
          breed: "Jersey",
          gender: "FEMALE",
          age: { years: 3, months: 8 },
          weight: 480,
          healthStatus: "HEALTHY",
          lastVaccination: new Date("2024-06-10"),
          location: "Potrero B",
          photo: "https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=400",
          createdAt: new Date("2021-01-20"),
        },
        {
          id: "3",
          earTag: "MX-001236",
          name: "Princesa",
          type: "COW",
          breed: "Brown Swiss",
          gender: "FEMALE",
          age: { years: 5, months: 2 },
          weight: 600,
          healthStatus: "RECOVERING",
          lastVaccination: new Date("2024-05-20"),
          location: "Potrero C",
          photo: "https://images.unsplash.com/photo-1544737151-6e4b3999de9a?w=400",
          createdAt: new Date("2019-05-10"),
        },
        {
          id: "4",
          earTag: "MX-001237",
          name: "Campeona",
          type: "COW",
          breed: "Holstein",
          gender: "FEMALE",
          age: { years: 2, months: 11 },
          weight: 420,
          healthStatus: "HEALTHY",
          lastVaccination: new Date("2024-07-01"),
          location: "Potrero A",
          photo: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400",
          createdAt: new Date("2022-08-15"),
        },
        {
          id: "5",
          earTag: "MX-001238",
          name: "Bella",
          type: "COW",
          breed: "Angus",
          gender: "FEMALE",
          age: { years: 3, months: 6 },
          weight: 520,
          healthStatus: "QUARANTINE",
          lastVaccination: new Date("2024-04-15"),
          location: "Área de Cuarentena",
          photo: "https://images.unsplash.com/photo-1562907550-096d3bc2bd90?w=400",
          createdAt: new Date("2021-03-10"),
        },
        {
          id: "6",
          earTag: "MX-001239",
          name: "Rosa",
          type: "COW",
          breed: "Holstein",
          gender: "FEMALE",
          age: { years: 4, months: 1 },
          weight: 540,
          healthStatus: "HEALTHY",
          lastVaccination: new Date("2024-06-20"),
          location: "Potrero B",
          createdAt: new Date("2020-06-25"),
        },
      ];

      setBovines(mockBovines);
      setLoading(false);
    };

    // Simular una pequeña carga para mostrar el loading
    setTimeout(loadBovines, 300); // Reducido aún más el tiempo
  }, []);

  // Filtrar bovinos
  const filteredBovines = bovines.filter((bovine) => {
    const matchesSearch = 
      bovine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bovine.earTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bovine.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === "ALL" || bovine.healthStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

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
            Cargando lista de bovinos...
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
        {/* Header con controles */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Título y estadísticas */}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Lista de Bovinos
              </h1>
              <p className="text-gray-600">
                {filteredBovines.length} bovinos encontrados
              </p>
            </div>

            {/* Controles */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, arete o raza..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent w-full sm:w-64"
                />
              </div>

              {/* Filtro de estado */}
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent appearance-none bg-white"
                >
                  <option value="ALL">Todos los estados</option>
                  <option value="HEALTHY">Saludables</option>
                  <option value="SICK">Enfermos</option>
                  <option value="RECOVERING">Recuperándose</option>
                  <option value="QUARANTINE">Cuarentena</option>
                </select>
              </div>

              {/* Modo de vista */}
              <div className="flex border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${
                    viewMode === "grid"
                      ? "bg-[#3d8b40] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  } transition-colors`}
                  title="Vista de cuadrícula"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${
                    viewMode === "list"
                      ? "bg-[#3d8b40] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-50"
                  } transition-colors`}
                  title="Vista de lista"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Botón agregar */}
              <button
                onClick={() => navigate("/bovines/add")}
                className="flex items-center gap-2 px-4 py-2 bg-[#3d8b40] text-white rounded-lg hover:bg-[#2d6e30] transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Agregar Bovino
              </button>
            </div>
          </div>
        </motion.div>

        {/* Lista de bovinos */}
        {filteredBovines.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"
                : "space-y-4"
            }
          >
            {filteredBovines.map((bovine, index) => (
              <BovineCard
                key={bovine.id}
                bovine={bovine}
                index={index}
                viewMode={viewMode}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-12 text-center"
          >
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No se encontraron bovinos
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== "ALL"
                ? "Intenta ajustar los filtros de búsqueda."
                : "Comienza agregando tu primer bovino."}
            </p>
            <button
              onClick={() => navigate("/bovines/add")}
              className="flex items-center gap-2 px-6 py-3 bg-[#3d8b40] text-white rounded-lg hover:bg-[#2d6e30] transition-colors font-medium mx-auto"
            >
              <Plus className="w-5 h-5" />
              Agregar Primer Bovino
            </button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default BovineList;