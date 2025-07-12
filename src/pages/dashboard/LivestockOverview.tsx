import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  MapPin,
  Activity,
  Heart,
  Scale,
  Eye,
  Search,
  Grid3X3,
  List,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Baby,
  Crown,
  Star,
  Navigation,
} from "lucide-react";

// Tipos de ganado
type AnimalType = "cow" | "bull" | "calf" | "heifer" | "steer";
type AnimalStatus =
  | "healthy"
  | "monitoring"
  | "sick"
  | "pregnant"
  | "lactating"
  | "breeding";
type ProductionStage = "calf" | "growing" | "mature" | "breeding" | "retired";

// Interfaz principal para los animales
interface Animal {
  id: string;
  name: string;
  type: AnimalType;
  breed: string;
  age_months: number;
  weight_kg: number;
  status: AnimalStatus;
  production_stage: ProductionStage;
  location: {
    lat: number;
    lng: number;
    pasture_name: string;
    sector: string;
    last_updated: string;
  };
  health: {
    score: number; // 0-100
    last_checkup: string;
    vaccinations_current: boolean;
    temperature: number;
    heart_rate?: number;
  };
  productivity: {
    milk_yield_daily?: number; // litros por día
    weight_gain_monthly?: number; // kg por mes
    breeding_cycles?: number;
    last_breeding?: string;
  };
  genetics: {
    sire_id?: string;
    dam_id?: string;
    generation: number;
    genetic_merit_score?: number;
  };
  ear_tag: string;
  microchip_id: string;
  birth_date: string;
  acquisition_date: string;
  value_estimate: number;
  notes?: string;
}

// Interfaz para estadísticas del rebaño
interface LivestockStats {
  total_animals: number;
  by_type: Record<AnimalType, number>;
  by_status: Record<AnimalStatus, number>;
  by_stage: Record<ProductionStage, number>;
  average_age_months: number;
  average_weight_kg: number;
  average_health_score: number;
  total_value: number;
  pregnant_animals: number;
  lactating_animals: number;
}

// Interfaz para filtros
interface LivestockFilter {
  type: AnimalType | "all";
  status: AnimalStatus | "all";
  stage: ProductionStage | "all";
  location: string | "all";
  search: string;
  age_range: { min: number; max: number };
  weight_range: { min: number; max: number };
  health_score_min: number;
}

const LivestockOverview: React.FC = () => {
  // Estados principales
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);
  const [livestockStats, setLivestockStats] = useState<LivestockStats | null>(
    null
  );
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  // Estados para vista y filtros
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<
    "id" | "age" | "weight" | "health" | "value"
  >("id");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<LivestockFilter>({
    type: "all",
    status: "all",
    stage: "all",
    location: "all",
    search: "",
    age_range: { min: 0, max: 120 },
    weight_range: { min: 0, max: 1000 },
    health_score_min: 0,
  });

  // Cargar datos simulados
  useEffect(() => {
    const loadLivestockData = async () => {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockAnimals: Animal[] = [
        {
          id: "COW-001",
          name: "Bella",
          type: "cow",
          breed: "Holstein",
          age_months: 36,
          weight_kg: 545,
          status: "lactating",
          production_stage: "mature",
          location: {
            lat: 14.6349,
            lng: -90.5069,
            pasture_name: "North Pasture",
            sector: "A-1",
            last_updated: "2025-07-11T08:30:00Z",
          },
          health: {
            score: 92,
            last_checkup: "2025-07-08T00:00:00Z",
            vaccinations_current: true,
            temperature: 38.5,
            heart_rate: 68,
          },
          productivity: {
            milk_yield_daily: 28.5,
            weight_gain_monthly: 15,
            breeding_cycles: 3,
            last_breeding: "2024-10-15T00:00:00Z",
          },
          genetics: {
            sire_id: "BULL-005",
            dam_id: "COW-089",
            generation: 3,
            genetic_merit_score: 87,
          },
          ear_tag: "BEL-001",
          microchip_id: "982000123456789",
          birth_date: "2022-07-15T00:00:00Z",
          acquisition_date: "2022-07-15T00:00:00Z",
          value_estimate: 2850,
          notes: "High milk producer, excellent maternal instincts",
        },
        {
          id: "BULL-002",
          name: "Thunder",
          type: "bull",
          breed: "Angus",
          age_months: 48,
          weight_kg: 920,
          status: "breeding",
          production_stage: "mature",
          location: {
            lat: 14.632,
            lng: -90.5055,
            pasture_name: "Bull Paddock",
            sector: "B-1",
            last_updated: "2025-07-11T07:15:00Z",
          },
          health: {
            score: 95,
            last_checkup: "2025-07-05T00:00:00Z",
            vaccinations_current: true,
            temperature: 38.8,
            heart_rate: 65,
          },
          productivity: {
            breeding_cycles: 12,
            last_breeding: "2025-07-01T00:00:00Z",
          },
          genetics: {
            generation: 4,
            genetic_merit_score: 95,
          },
          ear_tag: "THU-002",
          microchip_id: "982000987654321",
          birth_date: "2021-03-20T00:00:00Z",
          acquisition_date: "2021-08-10T00:00:00Z",
          value_estimate: 8500,
          notes: "Premium breeding bull, excellent genetics",
        },
        {
          id: "COW-087",
          name: "Luna",
          type: "cow",
          breed: "Jersey",
          age_months: 28,
          weight_kg: 420,
          status: "sick",
          production_stage: "mature",
          location: {
            lat: 14.6355,
            lng: -90.508,
            pasture_name: "Medical Isolation",
            sector: "MED-1",
            last_updated: "2025-07-11T09:00:00Z",
          },
          health: {
            score: 65,
            last_checkup: "2025-07-09T00:00:00Z",
            vaccinations_current: true,
            temperature: 40.2,
            heart_rate: 78,
          },
          productivity: {
            milk_yield_daily: 15.2,
            weight_gain_monthly: -5,
            breeding_cycles: 2,
          },
          genetics: {
            sire_id: "BULL-008",
            dam_id: "COW-145",
            generation: 2,
            genetic_merit_score: 78,
          },
          ear_tag: "LUN-087",
          microchip_id: "982000456789123",
          birth_date: "2022-11-10T00:00:00Z",
          acquisition_date: "2022-11-10T00:00:00Z",
          value_estimate: 2200,
          notes: "Under treatment for respiratory infection",
        },
        {
          id: "CALF-045",
          name: "Charlie",
          type: "calf",
          breed: "Holstein-Angus Cross",
          age_months: 6,
          weight_kg: 180,
          status: "healthy",
          production_stage: "calf",
          location: {
            lat: 14.634,
            lng: -90.507,
            pasture_name: "Calf Paddock",
            sector: "C-2",
            last_updated: "2025-07-11T08:45:00Z",
          },
          health: {
            score: 88,
            last_checkup: "2025-07-06T00:00:00Z",
            vaccinations_current: true,
            temperature: 38.6,
          },
          productivity: {
            weight_gain_monthly: 35,
          },
          genetics: {
            sire_id: "BULL-002",
            dam_id: "COW-001",
            generation: 4,
            genetic_merit_score: 85,
          },
          ear_tag: "CHA-045",
          microchip_id: "982000789123456",
          birth_date: "2025-01-15T00:00:00Z",
          acquisition_date: "2025-01-15T00:00:00Z",
          value_estimate: 850,
          notes: "Strong growth rate, excellent genetics",
        },
        {
          id: "COW-156",
          name: "Daisy",
          type: "cow",
          breed: "Simmental",
          age_months: 42,
          weight_kg: 580,
          status: "pregnant",
          production_stage: "breeding",
          location: {
            lat: 14.633,
            lng: -90.5065,
            pasture_name: "Maternity Pasture",
            sector: "MAT-1",
            last_updated: "2025-07-11T07:30:00Z",
          },
          health: {
            score: 90,
            last_checkup: "2025-07-07T00:00:00Z",
            vaccinations_current: true,
            temperature: 38.7,
            heart_rate: 72,
          },
          productivity: {
            milk_yield_daily: 22.0,
            breeding_cycles: 4,
            last_breeding: "2024-10-20T00:00:00Z",
          },
          genetics: {
            sire_id: "BULL-002",
            dam_id: "COW-098",
            generation: 3,
            genetic_merit_score: 82,
          },
          ear_tag: "DAI-156",
          microchip_id: "982000654321987",
          birth_date: "2021-09-05T00:00:00Z",
          acquisition_date: "2021-09-05T00:00:00Z",
          value_estimate: 3200,
          notes: "Due to calve in 45 days, excellent maternal record",
        },
      ];

      // Calcular estadísticas
      const stats: LivestockStats = {
        total_animals: mockAnimals.length,
        by_type: mockAnimals.reduce((acc, animal) => {
          acc[animal.type] = (acc[animal.type] || 0) + 1;
          return acc;
        }, {} as Record<AnimalType, number>),
        by_status: mockAnimals.reduce((acc, animal) => {
          acc[animal.status] = (acc[animal.status] || 0) + 1;
          return acc;
        }, {} as Record<AnimalStatus, number>),
        by_stage: mockAnimals.reduce((acc, animal) => {
          acc[animal.production_stage] =
            (acc[animal.production_stage] || 0) + 1;
          return acc;
        }, {} as Record<ProductionStage, number>),
        average_age_months:
          mockAnimals.reduce((sum, animal) => sum + animal.age_months, 0) /
          mockAnimals.length,
        average_weight_kg:
          mockAnimals.reduce((sum, animal) => sum + animal.weight_kg, 0) /
          mockAnimals.length,
        average_health_score:
          mockAnimals.reduce((sum, animal) => sum + animal.health.score, 0) /
          mockAnimals.length,
        total_value: mockAnimals.reduce(
          (sum, animal) => sum + animal.value_estimate,
          0
        ),
        pregnant_animals: mockAnimals.filter(
          (animal) => animal.status === "pregnant"
        ).length,
        lactating_animals: mockAnimals.filter(
          (animal) => animal.status === "lactating"
        ).length,
      };

      setAnimals(mockAnimals);
      setFilteredAnimals(mockAnimals);
      setLivestockStats(stats);
      setIsLoading(false);
    };

    loadLivestockData();
  }, []);

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    let filtered = animals;

    // Aplicar filtros
    if (filters.type !== "all") {
      filtered = filtered.filter((animal) => animal.type === filters.type);
    }

    if (filters.status !== "all") {
      filtered = filtered.filter((animal) => animal.status === filters.status);
    }

    if (filters.stage !== "all") {
      filtered = filtered.filter(
        (animal) => animal.production_stage === filters.stage
      );
    }

    if (filters.location !== "all") {
      filtered = filtered.filter((animal) =>
        animal.location.pasture_name
          .toLowerCase()
          .includes(filters.location.toLowerCase())
      );
    }

    if (filters.search) {
      filtered = filtered.filter(
        (animal) =>
          animal.id.toLowerCase().includes(filters.search.toLowerCase()) ||
          animal.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          animal.breed.toLowerCase().includes(filters.search.toLowerCase()) ||
          animal.ear_tag.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Filtros por rango
    filtered = filtered.filter(
      (animal) =>
        animal.age_months >= filters.age_range.min &&
        animal.age_months <= filters.age_range.max &&
        animal.weight_kg >= filters.weight_range.min &&
        animal.weight_kg <= filters.weight_range.max &&
        animal.health.score >= filters.health_score_min
    );

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      let aValue: number | string;
      let bValue: number | string;

      switch (sortBy) {
        case "age":
          aValue = a.age_months;
          bValue = b.age_months;
          break;
        case "weight":
          aValue = a.weight_kg;
          bValue = b.weight_kg;
          break;
        case "health":
          aValue = a.health.score;
          bValue = b.health.score;
          break;
        case "value":
          aValue = a.value_estimate;
          bValue = b.value_estimate;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else {
        return sortOrder === "asc"
          ? (aValue as number) - (bValue as number)
          : (bValue as number) - (aValue as number);
      }
    });

    setFilteredAnimals(filtered);
  }, [animals, filters, sortBy, sortOrder]);

  // Función para obtener el color del estado
  const getStatusColor = (status: AnimalStatus): string => {
    switch (status) {
      case "healthy":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "monitoring":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "sick":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "pregnant":
        return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "lactating":
        return "text-pink-500 bg-pink-500/10 border-pink-500/20";
      case "breeding":
        return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  // Función para obtener el ícono del tipo de animal
  const getAnimalTypeIcon = (type: AnimalType) => {
    switch (type) {
      case "cow":
        return <Users className="w-5 h-5" />;
      case "bull":
        return <Crown className="w-5 h-5" />;
      case "calf":
        return <Baby className="w-5 h-5" />;
      case "heifer":
        return <Heart className="w-5 h-5" />;
      case "steer":
        return <Star className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  // Componente para el card del animal
  const AnimalCard: React.FC<{ animal: Animal; index: number }> = ({
    animal,
    index,
  }) => {
    const ageYears = Math.floor(animal.age_months / 12);
    const ageMonths = animal.age_months % 12;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.02, y: -2 }}
        onClick={() => {
          setSelectedAnimal(animal);
          setShowDetails(true);
        }}
        className="relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 
                   cursor-pointer hover:bg-white/10 transition-all duration-300 shadow-lg overflow-hidden"
      >
        {/* Efecto de brillo animado */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent -skew-x-12"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 3,
            delay: index * 0.2,
            repeat: Infinity,
            repeatDelay: 10,
          }}
        />

        <div className="relative z-10">
          {/* Header del card */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div
                className={`p-3 rounded-xl ${getStatusColor(animal.status)}`}
              >
                {getAnimalTypeIcon(animal.type)}
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">{animal.name}</h3>
                <p className="text-white/70 text-sm">
                  {animal.id} • {animal.breed}
                </p>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                animal.status
              )}`}
            >
              {animal.status}
            </div>
          </div>

          {/* Información básica */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-white/60 text-xs">Age</p>
              <p className="text-white font-semibold">
                {ageYears}y {ageMonths}m
              </p>
            </div>
            <div>
              <p className="text-white/60 text-xs">Weight</p>
              <p className="text-white font-semibold">{animal.weight_kg} kg</p>
            </div>
          </div>

          {/* Puntuación de salud */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-white/70 text-sm">Health Score</span>
              <span
                className={`text-sm font-medium ${
                  animal.health.score >= 90
                    ? "text-green-400"
                    : animal.health.score >= 70
                    ? "text-yellow-400"
                    : "text-red-400"
                }`}
              >
                {animal.health.score}%
              </span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${animal.health.score}%` }}
                transition={{ delay: index * 0.1 + 0.5, duration: 1 }}
                className={`h-full rounded-full ${
                  animal.health.score >= 90
                    ? "bg-green-500"
                    : animal.health.score >= 70
                    ? "bg-yellow-500"
                    : "bg-red-500"
                }`}
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="flex items-center text-sm text-white/70 mb-3">
            <MapPin className="w-4 h-4 mr-2" />
            <span>
              {animal.location.pasture_name} - {animal.location.sector}
            </span>
          </div>

          {/* Información adicional según el tipo */}
          {animal.productivity?.milk_yield_daily && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">Daily Milk:</span>
              <span className="text-white font-medium">
                {animal.productivity.milk_yield_daily}L
              </span>
            </div>
          )}

          {animal.status === "pregnant" && (
            <div className="flex items-center text-sm text-purple-400 mt-2">
              <Baby className="w-4 h-4 mr-1" />
              <span>Pregnant</span>
            </div>
          )}

          {/* Indicadores de alerta */}
          {animal.health.score < 70 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 right-2 p-2 bg-red-500/20 rounded-lg"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </motion.div>
          )}

          {!animal.health.vaccinations_current && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-2 left-2 p-2 bg-yellow-500/20 rounded-lg"
            >
              <Clock className="w-4 h-4 text-yellow-400" />
            </motion.div>
          )}
        </div>
      </motion.div>
    );
  };

  // Componente para estadísticas rápidas
  const QuickStatsCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    index: number;
  }> = ({ title, value, subtitle, icon, color, index }) => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
      >
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${color} bg-white/10`}>{icon}</div>
          <div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-sm font-medium text-white/90">{title}</p>
            <p className="text-xs text-white/60">{subtitle}</p>
          </div>
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-white/20 border-t-purple-500 rounded-full"
          />
        </div>
      </div>
    );
  }

  if (!livestockStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
        <div className="text-center text-white">
          Error loading livestock data
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Livestock Overview
            </h1>
            <p className="text-white/70">
              Comprehensive view of all animals in the herd
            </p>
          </div>

          {/* Controles de vista */}
          <div className="flex items-center space-x-3 mt-4 lg:mt-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                       focus:outline-none focus:border-purple-500"
            >
              <option value="id">Sort by ID</option>
              <option value="age">Sort by Age</option>
              <option value="weight">Sort by Weight</option>
              <option value="health">Sort by Health</option>
              <option value="value">Sort by Value</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20"
            >
              {sortOrder === "asc" ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              className="p-2 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/30"
            >
              {viewMode === "grid" ? (
                <List className="w-4 h-4" />
              ) : (
                <Grid3X3 className="w-4 h-4" />
              )}
            </button>
          </div>
        </motion.div>

        {/* Estadísticas rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8"
        >
          <QuickStatsCard
            title="Total Animals"
            value={livestockStats.total_animals}
            subtitle="In herd"
            icon={<Users className="w-5 h-5" />}
            color="text-blue-500"
            index={0}
          />
          <QuickStatsCard
            title="Avg Health"
            value={`${livestockStats.average_health_score.toFixed(1)}%`}
            subtitle="Health score"
            icon={<Heart className="w-5 h-5" />}
            color="text-green-500"
            index={1}
          />
          <QuickStatsCard
            title="Avg Weight"
            value={`${livestockStats.average_weight_kg.toFixed(0)}kg`}
            subtitle="Herd average"
            icon={<Scale className="w-5 h-5" />}
            color="text-purple-500"
            index={2}
          />
          <QuickStatsCard
            title="Pregnant"
            value={livestockStats.pregnant_animals}
            subtitle="Expecting"
            icon={<Baby className="w-5 h-5" />}
            color="text-pink-500"
            index={3}
          />
          <QuickStatsCard
            title="Lactating"
            value={livestockStats.lactating_animals}
            subtitle="Producing milk"
            icon={<Activity className="w-5 h-5" />}
            color="text-yellow-500"
            index={4}
          />
          <QuickStatsCard
            title="Total Value"
            value={`$${(livestockStats.total_value / 1000).toFixed(0)}k`}
            subtitle="Estimated"
            icon={<TrendingUp className="w-5 h-5" />}
            color="text-orange-500"
            index={5}
          />
        </motion.div>

        {/* Controles de filtro */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
              <input
                type="text"
                placeholder="Search animals by ID, name, breed, or ear tag..."
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg
                         text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: e.target.value as AnimalType | "all",
                  }))
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                         focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Types</option>
                <option value="cow">Cows</option>
                <option value="bull">Bulls</option>
                <option value="calf">Calves</option>
                <option value="heifer">Heifers</option>
                <option value="steer">Steers</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    status: e.target.value as AnimalStatus | "all",
                  }))
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                         focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Status</option>
                <option value="healthy">Healthy</option>
                <option value="monitoring">Monitoring</option>
                <option value="sick">Sick</option>
                <option value="pregnant">Pregnant</option>
                <option value="lactating">Lactating</option>
                <option value="breeding">Breeding</option>
              </select>

              <select
                value={filters.stage}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    stage: e.target.value as ProductionStage | "all",
                  }))
                }
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                         focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Stages</option>
                <option value="calf">Calf</option>
                <option value="growing">Growing</option>
                <option value="mature">Mature</option>
                <option value="breeding">Breeding</option>
                <option value="retired">Retired</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Lista/Grid de animales */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`grid gap-6 ${
            viewMode === "grid"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1"
          }`}
        >
          {filteredAnimals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white/70 mb-2">
                No animals found
              </h3>
              <p className="text-white/50">
                Try adjusting your filters or search terms
              </p>
            </div>
          ) : (
            filteredAnimals.map((animal, index) => (
              <AnimalCard key={animal.id} animal={animal} index={index} />
            ))
          )}
        </motion.div>

        {/* Modal de detalles del animal */}
        <AnimatePresence>
          {showDetails && selectedAnimal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowDetails(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-white/10 
                         p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header del modal */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-4 rounded-xl ${getStatusColor(
                        selectedAnimal.status
                      )}`}
                    >
                      {getAnimalTypeIcon(selectedAnimal.type)}
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        {selectedAnimal.name}
                      </h2>
                      <p className="text-white/70 text-lg">
                        {selectedAnimal.id} • {selectedAnimal.breed}
                      </p>
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(
                          selectedAnimal.status
                        )}`}
                      >
                        {selectedAnimal.status}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Navigation className="w-5 h-5 text-white/70 rotate-45" />
                  </button>
                </div>

                {/* Contenido del modal en grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Información básica */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-3">
                      Basic Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Age:</span>
                        <span className="text-white font-medium">
                          {Math.floor(selectedAnimal.age_months / 12)}y{" "}
                          {selectedAnimal.age_months % 12}m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Weight:</span>
                        <span className="text-white font-medium">
                          {selectedAnimal.weight_kg} kg
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Ear Tag:</span>
                        <span className="text-white font-medium">
                          {selectedAnimal.ear_tag}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Microchip:</span>
                        <span className="text-white font-medium">
                          {selectedAnimal.microchip_id}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Value:</span>
                        <span className="text-white font-medium">
                          ${selectedAnimal.value_estimate.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información de salud */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-3">
                      Health Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Health Score:</span>
                        <span
                          className={`font-medium ${
                            selectedAnimal.health.score >= 90
                              ? "text-green-400"
                              : selectedAnimal.health.score >= 70
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          {selectedAnimal.health.score}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Temperature:</span>
                        <span className="text-white font-medium">
                          {selectedAnimal.health.temperature}°C
                        </span>
                      </div>
                      {selectedAnimal.health.heart_rate && (
                        <div className="flex justify-between">
                          <span className="text-white/60">Heart Rate:</span>
                          <span className="text-white font-medium">
                            {selectedAnimal.health.heart_rate} bpm
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-white/60">Vaccinations:</span>
                        <span
                          className={`font-medium ${
                            selectedAnimal.health.vaccinations_current
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {selectedAnimal.health.vaccinations_current
                            ? "Current"
                            : "Overdue"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Last Checkup:</span>
                        <span className="text-white font-medium">
                          {new Date(
                            selectedAnimal.health.last_checkup
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información de productividad */}
                  {selectedAnimal.productivity && (
                    <div className="bg-white/5 rounded-xl p-4">
                      <h3 className="font-semibold text-white mb-3">
                        Productivity
                      </h3>
                      <div className="space-y-2 text-sm">
                        {selectedAnimal.productivity.milk_yield_daily && (
                          <div className="flex justify-between">
                            <span className="text-white/60">
                              Daily Milk Yield:
                            </span>
                            <span className="text-white font-medium">
                              {selectedAnimal.productivity.milk_yield_daily}L
                            </span>
                          </div>
                        )}
                        {selectedAnimal.productivity.weight_gain_monthly && (
                          <div className="flex justify-between">
                            <span className="text-white/60">
                              Monthly Weight Gain:
                            </span>
                            <span
                              className={`font-medium ${
                                selectedAnimal.productivity
                                  .weight_gain_monthly > 0
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {selectedAnimal.productivity.weight_gain_monthly >
                              0
                                ? "+"
                                : ""}
                              {selectedAnimal.productivity.weight_gain_monthly}{" "}
                              kg
                            </span>
                          </div>
                        )}
                        {selectedAnimal.productivity.breeding_cycles && (
                          <div className="flex justify-between">
                            <span className="text-white/60">
                              Breeding Cycles:
                            </span>
                            <span className="text-white font-medium">
                              {selectedAnimal.productivity.breeding_cycles}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Información de ubicación */}
                  <div className="bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-3">
                      Location Details
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-white/60 mr-2" />
                        <span className="text-white">
                          {selectedAnimal.location.pasture_name}
                        </span>
                      </div>
                      <div className="text-white/60">
                        Sector: {selectedAnimal.location.sector}
                      </div>
                      <div className="text-white/60">
                        Coordinates: {selectedAnimal.location.lat},{" "}
                        {selectedAnimal.location.lng}
                      </div>
                      <div className="text-white/60">
                        Last Updated:{" "}
                        {new Date(
                          selectedAnimal.location.last_updated
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notas adicionales */}
                {selectedAnimal.notes && (
                  <div className="mt-6 bg-white/5 rounded-xl p-4">
                    <h3 className="font-semibold text-white mb-2">Notes</h3>
                    <p className="text-white/80">{selectedAnimal.notes}</p>
                  </div>
                )}

                {/* Botones de acción */}
                <div className="flex space-x-3 mt-6">
                  <button
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 
                                   rounded-lg transition-colors flex items-center justify-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View on Map
                  </button>
                  <button
                    className="px-4 py-2 bg-green-600/20 border border-green-500/30 text-green-300 
                                   rounded-lg hover:bg-green-600/30 transition-colors"
                  >
                    Edit Details
                  </button>
                  <button
                    className="px-4 py-2 bg-blue-600/20 border border-blue-500/30 text-blue-300 
                                   rounded-lg hover:bg-blue-600/30 transition-colors"
                  >
                    Health Record
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LivestockOverview;
