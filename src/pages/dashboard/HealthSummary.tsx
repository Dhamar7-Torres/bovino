import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  Activity,
  Thermometer,
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Calendar,
  Search,
  Stethoscope,
  Pill,
  Zap,
  Users,
} from "lucide-react";

// Tipos de condiciones de salud
type HealthStatus =
  | "healthy"
  | "monitoring"
  | "treatment"
  | "critical"
  | "recovered";
type ConditionType =
  | "respiratory"
  | "digestive"
  | "reproductive"
  | "musculoskeletal"
  | "infectious"
  | "nutritional";

// Interfaz para condiciones de salud
interface HealthCondition {
  id: string;
  animal_id: string;
  condition_name: string;
  type: ConditionType;
  status: HealthStatus;
  severity: "mild" | "moderate" | "severe";
  diagnosed_date: string;
  symptoms: string[];
  treatment_plan?: string;
  veterinarian: string;
  location: {
    lat: number;
    lng: number;
    area_name: string;
  };
  vital_signs?: {
    temperature: number;
    heart_rate: number;
    respiratory_rate: number;
    weight: number;
  };
  notes?: string;
  next_checkup?: string;
}

// Interfaz para vacunaciones
interface VaccinationRecord {
  id: string;
  animal_id: string;
  vaccine_name: string;
  vaccine_type: string;
  administered_date: string;
  next_due_date: string;
  veterinarian: string;
  batch_number: string;
  location: {
    lat: number;
    lng: number;
    facility_name: string;
  };
  status: "completed" | "due" | "overdue";
  side_effects?: string[];
}

// Interfaz para estadísticas de salud
interface HealthStatistics {
  total_animals: number;
  healthy_animals: number;
  animals_under_treatment: number;
  critical_cases: number;
  vaccinations_due: number;
  average_health_score: number;
  mortality_rate: number;
  recovery_rate: number;
}

// Interfaz para tratamientos activos
interface ActiveTreatment {
  id: string;
  animal_id: string;
  condition_id: string;
  treatment_name: string;
  medication: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string;
  administered_by: string;
  progress: number; // 0-100%
  location: {
    lat: number;
    lng: number;
    treatment_area: string;
  };
}

const HealthSummary: React.FC = () => {
  // Estados principales
  const [healthStats, setHealthStats] = useState<HealthStatistics | null>(null);
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>(
    []
  );
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [activeTreatments, setActiveTreatments] = useState<ActiveTreatment[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState<
    "overview" | "conditions" | "vaccinations" | "treatments"
  >("overview");

  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<HealthStatus | "all">("all");
  const [conditionTypeFilter, setConditionTypeFilter] = useState<
    ConditionType | "all"
  >("all");

  // Cargar datos simulados
  useEffect(() => {
    const loadHealthData = async () => {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const mockStats: HealthStatistics = {
        total_animals: 247,
        healthy_animals: 231,
        animals_under_treatment: 12,
        critical_cases: 4,
        vaccinations_due: 8,
        average_health_score: 87.3,
        mortality_rate: 1.2,
        recovery_rate: 94.5,
      };

      const mockConditions: HealthCondition[] = [
        {
          id: "cond-001",
          animal_id: "COW-087",
          condition_name: "Respiratory Infection",
          type: "respiratory",
          status: "treatment",
          severity: "moderate",
          diagnosed_date: "2025-07-09T00:00:00Z",
          symptoms: ["coughing", "nasal_discharge", "elevated_temperature"],
          treatment_plan: "Antibiotic therapy for 7 days",
          veterinarian: "Dr. Ana Rodríguez",
          location: {
            lat: 14.6349,
            lng: -90.5069,
            area_name: "Barn 2 - Medical Bay",
          },
          vital_signs: {
            temperature: 40.2,
            heart_rate: 78,
            respiratory_rate: 24,
            weight: 450,
          },
          notes: "Responding well to treatment. Monitor for 48h.",
          next_checkup: "2025-07-13T09:00:00Z",
        },
        {
          id: "cond-002",
          animal_id: "BULL-023",
          condition_name: "Lameness - Right Front Leg",
          type: "musculoskeletal",
          status: "monitoring",
          severity: "mild",
          diagnosed_date: "2025-07-08T00:00:00Z",
          symptoms: ["limping", "reduced_mobility", "swelling"],
          treatment_plan: "Rest and anti-inflammatory medication",
          veterinarian: "Dr. Carlos Méndez",
          location: {
            lat: 14.632,
            lng: -90.5055,
            area_name: "Rehabilitation Pen",
          },
          vital_signs: {
            temperature: 38.8,
            heart_rate: 65,
            respiratory_rate: 18,
            weight: 820,
          },
          next_checkup: "2025-07-14T10:30:00Z",
        },
        {
          id: "cond-003",
          animal_id: "COW-156",
          condition_name: "Mastitis",
          type: "infectious",
          status: "critical",
          severity: "severe",
          diagnosed_date: "2025-07-10T00:00:00Z",
          symptoms: ["udder_swelling", "abnormal_milk", "fever"],
          treatment_plan: "Intramammary antibiotic therapy",
          veterinarian: "Dr. Ana Rodríguez",
          location: {
            lat: 14.6355,
            lng: -90.508,
            area_name: "Milking Facility - Isolation",
          },
          vital_signs: {
            temperature: 41.0,
            heart_rate: 88,
            respiratory_rate: 26,
            weight: 520,
          },
          notes: "Severe case. Immediate isolation required.",
          next_checkup: "2025-07-12T08:00:00Z",
        },
      ];

      const mockVaccinations: VaccinationRecord[] = [
        {
          id: "vacc-001",
          animal_id: "COW-145",
          vaccine_name: "IBR/BVD Combo",
          vaccine_type: "respiratory",
          administered_date: "2025-06-15T00:00:00Z",
          next_due_date: "2025-12-15T00:00:00Z",
          veterinarian: "Dr. Luis García",
          batch_number: "VB-2025-089",
          location: {
            lat: 14.634,
            lng: -90.507,
            facility_name: "Vaccination Station 1",
          },
          status: "completed",
        },
        {
          id: "vacc-002",
          animal_id: "BULL-008",
          vaccine_name: "Clostridial 7-Way",
          vaccine_type: "preventive",
          administered_date: "2025-04-20T00:00:00Z",
          next_due_date: "2025-07-20T00:00:00Z",
          veterinarian: "Dr. Carlos Méndez",
          batch_number: "CL-2025-034",
          location: {
            lat: 14.633,
            lng: -90.5065,
            facility_name: "Main Health Center",
          },
          status: "overdue",
        },
      ];

      const mockTreatments: ActiveTreatment[] = [
        {
          id: "treat-001",
          animal_id: "COW-087",
          condition_id: "cond-001",
          treatment_name: "Respiratory Infection Treatment",
          medication: "Oxytetracycline",
          dosage: "20mg/kg",
          frequency: "Once daily",
          start_date: "2025-07-09T00:00:00Z",
          end_date: "2025-07-16T00:00:00Z",
          administered_by: "José Hernández",
          progress: 42,
          location: {
            lat: 14.6349,
            lng: -90.5069,
            treatment_area: "Medical Treatment Bay",
          },
        },
        {
          id: "treat-002",
          animal_id: "COW-156",
          condition_id: "cond-003",
          treatment_name: "Mastitis Treatment Protocol",
          medication: "Intramammary Penicillin",
          dosage: "200mg per quarter",
          frequency: "Twice daily",
          start_date: "2025-07-10T00:00:00Z",
          end_date: "2025-07-17T00:00:00Z",
          administered_by: "María López",
          progress: 28,
          location: {
            lat: 14.6355,
            lng: -90.508,
            treatment_area: "Milking Facility - Treatment",
          },
        },
      ];

      setHealthStats(mockStats);
      setHealthConditions(mockConditions);
      setVaccinations(mockVaccinations);
      setActiveTreatments(mockTreatments);
      setIsLoading(false);
    };

    loadHealthData();
  }, []);

  // Función para obtener el color del estado de salud
  const getHealthStatusColor = (status: HealthStatus): string => {
    switch (status) {
      case "healthy":
        return "text-green-500 bg-green-500/10 border-green-500/20";
      case "monitoring":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      case "treatment":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "critical":
        return "text-red-500 bg-red-500/10 border-red-500/20";
      case "recovered":
        return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  // Función para obtener el ícono del tipo de condición
  const getConditionTypeIcon = (type: ConditionType) => {
    switch (type) {
      case "respiratory":
        return <Activity className="w-4 h-4" />;
      case "digestive":
        return <Zap className="w-4 h-4" />;
      case "reproductive":
        return <Heart className="w-4 h-4" />;
      case "musculoskeletal":
        return <Users className="w-4 h-4" />;
      case "infectious":
        return <Shield className="w-4 h-4" />;
      case "nutritional":
        return <Pill className="w-4 h-4" />;
      default:
        return <Stethoscope className="w-4 h-4" />;
    }
  };

  // Componente para estadísticas principales
  const HealthStatsCard: React.FC<{
    title: string;
    value: string | number;
    subtitle: string;
    icon: React.ReactNode;
    trend?: number;
    color: string;
    index: number;
  }> = ({ title, value, subtitle, icon, trend, color, index }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ scale: 1.02, y: -2 }}
        className={`relative p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 
                   hover:bg-white/10 transition-all duration-300 shadow-lg overflow-hidden`}
      >
        {/* Efecto de brillo */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12"
          initial={{ x: "-100%" }}
          animate={{ x: "200%" }}
          transition={{
            duration: 2,
            delay: index * 0.3,
            repeat: Infinity,
            repeatDelay: 8,
          }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-white/10`}>{icon}</div>
            {trend !== undefined && (
              <div
                className={`flex items-center text-sm font-medium ${
                  trend > 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {trend > 0 ? (
                  <TrendingUp className="w-4 h-4 mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 mr-1" />
                )}
                {Math.abs(trend)}%
              </div>
            )}
          </div>

          <motion.div
            className="text-3xl font-bold text-white mb-1"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.5 + index * 0.1,
              type: "spring" as const,
              stiffness: 200,
              damping: 15,
            }}
          >
            {value}
          </motion.div>

          <h3 className="text-lg font-semibold text-white/90 mb-1">{title}</h3>
          <p className="text-sm text-white/70">{subtitle}</p>
        </div>
      </motion.div>
    );
  };

  // Componente para condiciones de salud
  const HealthConditionCard: React.FC<{
    condition: HealthCondition;
    index: number;
  }> = ({ condition, index }) => {
    const timeAgo = React.useMemo(() => {
      const now = new Date();
      const conditionDate = new Date(condition.diagnosed_date);
      const diffDays = Math.floor(
        (now.getTime() - conditionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return diffDays === 0
        ? "Today"
        : diffDays === 1
        ? "Yesterday"
        : `${diffDays} days ago`;
    }, [condition.diagnosed_date]);

    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ scale: 1.01, x: 5 }}
        className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 
                   hover:bg-white/10 transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${getHealthStatusColor(
                condition.status
              )}`}
            >
              {getConditionTypeIcon(condition.type)}
            </div>
            <div>
              <h4 className="font-semibold text-white">
                {condition.condition_name}
              </h4>
              <p className="text-sm text-white/60">{condition.animal_id}</p>
            </div>
          </div>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(
              condition.status
            )}`}
          >
            {condition.status}
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Severity:</span>
            <span
              className={`font-medium capitalize ${
                condition.severity === "severe"
                  ? "text-red-400"
                  : condition.severity === "moderate"
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {condition.severity}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/60">Veterinarian:</span>
            <span className="text-white">{condition.veterinarian}</span>
          </div>

          <div className="flex items-center text-white/60">
            <MapPin className="w-3 h-3 mr-1" />
            <span className="truncate">{condition.location.area_name}</span>
          </div>

          <div className="flex items-center text-white/60">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Diagnosed {timeAgo}</span>
          </div>

          {condition.vital_signs && (
            <div className="mt-3 p-2 bg-white/5 rounded-lg">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center">
                  <Thermometer className="w-3 h-3 mr-1 text-red-400" />
                  <span className="text-white/70">
                    {condition.vital_signs.temperature}°C
                  </span>
                </div>
                <div className="flex items-center">
                  <Heart className="w-3 h-3 mr-1 text-pink-400" />
                  <span className="text-white/70">
                    {condition.vital_signs.heart_rate} bpm
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  // Componente para tratamientos activos
  const TreatmentCard: React.FC<{
    treatment: ActiveTreatment;
    index: number;
  }> = ({ treatment, index }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="p-4 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10"
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-white">
              {treatment.treatment_name}
            </h4>
            <p className="text-sm text-white/60">{treatment.animal_id}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-purple-400">
              {treatment.progress}%
            </div>
            <div className="text-xs text-white/60">Progress</div>
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/60">Medication:</span>
            <span className="text-white font-medium">
              {treatment.medication}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/60">Dosage:</span>
            <span className="text-white">{treatment.dosage}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-white/60">Frequency:</span>
            <span className="text-white">{treatment.frequency}</span>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="mt-3">
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${treatment.progress}%` }}
              transition={{ delay: index * 0.2 + 0.5, duration: 1 }}
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            />
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

  if (!healthStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
        <div className="text-center text-white">Error loading health data</div>
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
              Health Summary
            </h1>
            <p className="text-white/70">
              Comprehensive health monitoring and medical records
            </p>
          </div>

          {/* Navegación de vistas */}
          <div className="flex space-x-2 mt-4 lg:mt-0">
            {["overview", "conditions", "vaccinations", "treatments"].map(
              (view) => (
                <button
                  key={view}
                  onClick={() => setSelectedView(view as typeof selectedView)}
                  className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                    selectedView === view
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {view}
                </button>
              )
            )}
          </div>
        </motion.div>

        {/* Vista Overview */}
        {selectedView === "overview" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <HealthStatsCard
                title="Healthy Animals"
                value={healthStats.healthy_animals}
                subtitle={`${(
                  (healthStats.healthy_animals / healthStats.total_animals) *
                  100
                ).toFixed(1)}% of total`}
                icon={<Heart className="w-6 h-6" />}
                trend={2.3}
                color="text-green-500"
                index={0}
              />
              <HealthStatsCard
                title="Under Treatment"
                value={healthStats.animals_under_treatment}
                subtitle="Active cases"
                icon={<Stethoscope className="w-6 h-6" />}
                trend={-1.2}
                color="text-yellow-500"
                index={1}
              />
              <HealthStatsCard
                title="Critical Cases"
                value={healthStats.critical_cases}
                subtitle="Immediate attention"
                icon={<AlertTriangle className="w-6 h-6" />}
                trend={-0.8}
                color="text-red-500"
                index={2}
              />
              <HealthStatsCard
                title="Health Score"
                value={`${healthStats.average_health_score}%`}
                subtitle="Overall average"
                icon={<Activity className="w-6 h-6" />}
                trend={1.5}
                color="text-blue-500"
                index={3}
              />
            </div>

            {/* Secciones adicionales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Condiciones recientes */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Recent Health Conditions
                </h3>
                <div className="space-y-3">
                  {healthConditions.slice(0, 3).map((condition, index) => (
                    <HealthConditionCard
                      key={condition.id}
                      condition={condition}
                      index={index}
                    />
                  ))}
                </div>
              </div>

              {/* Tratamientos activos */}
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
                <h3 className="text-xl font-bold text-white mb-4">
                  Active Treatments
                </h3>
                <div className="space-y-3">
                  {activeTreatments.map((treatment, index) => (
                    <TreatmentCard
                      key={treatment.id}
                      treatment={treatment}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Vista Conditions */}
        {selectedView === "conditions" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Filtros */}
            <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4">
              <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/50" />
                  <input
                    type="text"
                    placeholder="Search conditions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg
                             text-white placeholder-white/50 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as HealthStatus | "all")
                  }
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                           focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="healthy">Healthy</option>
                  <option value="monitoring">Monitoring</option>
                  <option value="treatment">Treatment</option>
                  <option value="critical">Critical</option>
                  <option value="recovered">Recovered</option>
                </select>

                <select
                  value={conditionTypeFilter}
                  onChange={(e) =>
                    setConditionTypeFilter(
                      e.target.value as ConditionType | "all"
                    )
                  }
                  className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white
                           focus:outline-none focus:border-purple-500"
                >
                  <option value="all">All Types</option>
                  <option value="respiratory">Respiratory</option>
                  <option value="digestive">Digestive</option>
                  <option value="reproductive">Reproductive</option>
                  <option value="musculoskeletal">Musculoskeletal</option>
                  <option value="infectious">Infectious</option>
                  <option value="nutritional">Nutritional</option>
                </select>
              </div>
            </div>

            {/* Lista de condiciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {healthConditions
                .filter((condition) => {
                  const matchesSearch =
                    searchTerm === "" ||
                    condition.condition_name
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase()) ||
                    condition.animal_id
                      .toLowerCase()
                      .includes(searchTerm.toLowerCase());
                  const matchesStatus =
                    statusFilter === "all" || condition.status === statusFilter;
                  const matchesType =
                    conditionTypeFilter === "all" ||
                    condition.type === conditionTypeFilter;
                  return matchesSearch && matchesStatus && matchesType;
                })
                .map((condition, index) => (
                  <HealthConditionCard
                    key={condition.id}
                    condition={condition}
                    index={index}
                  />
                ))}
            </div>
          </motion.div>
        )}

        {/* Vista Vaccinations */}
        {selectedView === "vaccinations" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6"
          >
            <h3 className="text-xl font-bold text-white mb-4">
              Vaccination Records
            </h3>
            <div className="space-y-4">
              {vaccinations.map((vaccination, index) => (
                <motion.div
                  key={vaccination.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-white">
                        {vaccination.vaccine_name}
                      </h4>
                      <p className="text-sm text-white/60">
                        {vaccination.animal_id}
                      </p>
                      <div className="flex items-center mt-2 text-sm text-white/70">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>
                          Next due:{" "}
                          {new Date(
                            vaccination.next_due_date
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        vaccination.status === "completed"
                          ? "text-green-500 bg-green-500/10"
                          : vaccination.status === "due"
                          ? "text-yellow-500 bg-yellow-500/10"
                          : "text-red-500 bg-red-500/10"
                      }`}
                    >
                      {vaccination.status}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Vista Treatments */}
        {selectedView === "treatments" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {activeTreatments.map((treatment, index) => (
              <TreatmentCard
                key={treatment.id}
                treatment={treatment}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HealthSummary;
