import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Thermometer,
  AlertTriangle,
  MapPin,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Activity,
  Stethoscope,
  FileText,
  Eye,
  Edit,
  CheckCircle,
  AlertCircle,
  Heart,
  BarChart3,
} from "lucide-react";

// Interfaces para tipos de datos
interface DiseaseRecord {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  diseaseName: string;
  diseaseType:
    | "viral"
    | "bacterial"
    | "parasitic"
    | "metabolic"
    | "genetic"
    | "injury";
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "treating" | "recovered" | "chronic" | "deceased";
  symptoms: string[];
  diagnosisDate: Date;
  recoveryDate?: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
    sector: string;
  };
  veterinarian: string;
  treatment?: string;
  medications: string[];
  notes: string;
  isContagious: boolean;
  quarantineRequired: boolean;
  followUpDate?: Date;
  cost: number;
}

interface DiseaseStats {
  totalCases: number;
  activeCases: number;
  recoveredCases: number;
  criticalCases: number;
  newCasesThisWeek: number;
  recoveryRate: number;
  averageRecoveryTime: number;
  mostCommonDisease: string;
  affectedSectors: number;
  totalCost: number;
}

interface OutbreakAlert {
  id: string;
  diseaseName: string;
  affectedAnimals: number;
  location: string;
  riskLevel: "low" | "medium" | "high" | "critical";
  createdAt: Date;
  isActive: boolean;
}

// Componentes reutilizables del dashboard anterior
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
  >
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <p className="text-sm text-gray-600 mt-1">{children}</p>;

const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "danger";
  size?: "sm" | "default";
  className?: string;
}> = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const Badge: React.FC<{
  children: React.ReactNode;
  variant: string;
  className?: string;
}> = ({ children, variant, className = "" }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      case "active":
        return "bg-red-100 text-red-800 border-red-200";
      case "treating":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "recovered":
        return "bg-green-100 text-green-800 border-green-200";
      case "chronic":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "deceased":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(
        variant
      )} ${className}`}
    >
      {children}
    </span>
  );
};

// Componente de Mapa de Enfermedades
const DiseaseMap: React.FC = () => {
  return (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Fondo del mapa simulado */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-100"></div>

      {/* Título de ubicación */}
      <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-red-600" />
          <span className="text-sm font-medium">
            Mapa de Brotes - Villahermosa, Tabasco
          </span>
        </div>
      </div>

      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-md text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Crítico</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Alto</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Medio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Bajo</span>
          </div>
        </div>
      </div>

      {/* Marcadores simulados de enfermedades */}
      <div className="relative w-full h-full">
        {/* Brote crítico */}
        <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Thermometer className="w-4 h-4 text-white" />
          </motion.div>
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-36 text-xs">
            <p className="font-medium text-red-700">Mastitis Severa</p>
            <p className="text-gray-600">3 animales afectados</p>
            <p className="text-gray-600">Sector A - Establo Principal</p>
          </div>
        </div>

        {/* Caso moderado */}
        <div className="absolute top-2/3 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-yellow-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <AlertTriangle className="w-3 h-3 text-white" />
          </motion.div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
            <p className="font-medium text-yellow-700">Cojera Leve</p>
            <p className="text-gray-600">1 animal</p>
            <p className="text-gray-600">Sector B</p>
          </div>
        </div>

        {/* Caso recuperado */}
        <div className="absolute bottom-1/4 left-2/3 transform -translate-x-1/2 translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-green-500 rounded-full w-5 h-5 flex items-center justify-center shadow-lg cursor-pointer opacity-75"
            whileHover={{ scale: 1.2 }}
          >
            <CheckCircle className="w-3 h-3 text-white" />
          </motion.div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
            <p className="font-medium text-green-700">Recuperado</p>
            <p className="text-gray-600">Neumonía</p>
            <p className="text-gray-600">Sector C</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const DiseaseTracking: React.FC = () => {
  // Estados del componente
  const [diseases, setDiseases] = useState<DiseaseRecord[]>([]);
  const [stats, setStats] = useState<DiseaseStats>({
    totalCases: 0,
    activeCases: 0,
    recoveredCases: 0,
    criticalCases: 0,
    newCasesThisWeek: 0,
    recoveryRate: 0,
    averageRecoveryTime: 0,
    mostCommonDisease: "",
    affectedSectors: 0,
    totalCost: 0,
  });
  const [outbreakAlerts, setOutbreakAlerts] = useState<OutbreakAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");

  // Simulación de datos
  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Datos de ejemplo para enfermedades
      const mockDiseases: DiseaseRecord[] = [
        {
          id: "1",
          animalId: "COW001",
          animalName: "Bessie",
          animalTag: "TAG-001",
          diseaseName: "Mastitis",
          diseaseType: "bacterial",
          severity: "high",
          status: "treating",
          symptoms: ["Inflamación de ubre", "Fiebre", "Pérdida de apetito"],
          diagnosisDate: new Date("2025-07-10"),
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Establo Principal, Sector A",
            sector: "A",
          },
          veterinarian: "Dr. García",
          treatment: "Antibióticos y antiinflamatorios",
          medications: ["Penicilina", "Ibuprofeno"],
          notes: "Responde bien al tratamiento. Seguimiento diario.",
          isContagious: false,
          quarantineRequired: false,
          followUpDate: new Date("2025-07-15"),
          cost: 2500,
        },
        {
          id: "2",
          animalId: "COW002",
          animalName: "Luna",
          animalTag: "TAG-002",
          diseaseName: "Neumonía",
          diseaseType: "viral",
          severity: "critical",
          status: "active",
          symptoms: [
            "Dificultad respiratoria",
            "Tos",
            "Fiebre alta",
            "Letargo",
          ],
          diagnosisDate: new Date("2025-07-12"),
          location: {
            lat: 17.9719,
            lng: -92.9456,
            address: "Pastizal Norte, Sector B",
            sector: "B",
          },
          veterinarian: "Dr. Martínez",
          treatment: "Oxigenoterapia y medicamentos antivirales",
          medications: ["Ribavirina", "Dexametasona"],
          notes: "Caso crítico. Requiere monitoreo constante.",
          isContagious: true,
          quarantineRequired: true,
          followUpDate: new Date("2025-07-13"),
          cost: 4500,
        },
        {
          id: "3",
          animalId: "COW003",
          animalName: "Estrella",
          animalTag: "TAG-003",
          diseaseName: "Cojera",
          diseaseType: "injury",
          severity: "medium",
          status: "recovered",
          symptoms: ["Cojera en pata trasera", "Inflamación"],
          diagnosisDate: new Date("2025-07-05"),
          recoveryDate: new Date("2025-07-11"),
          location: {
            lat: 17.9589,
            lng: -92.9289,
            address: "Corral Sur, Sector C",
            sector: "C",
          },
          veterinarian: "Dr. López",
          treatment: "Descanso y antiinflamatorios",
          medications: ["Meloxicam"],
          notes: "Recuperación completa. Sin complicaciones.",
          isContagious: false,
          quarantineRequired: false,
          cost: 800,
        },
      ];

      // Estadísticas de ejemplo
      const mockStats: DiseaseStats = {
        totalCases: 15,
        activeCases: 6,
        recoveredCases: 8,
        criticalCases: 2,
        newCasesThisWeek: 3,
        recoveryRate: 87.5,
        averageRecoveryTime: 7.5,
        mostCommonDisease: "Mastitis",
        affectedSectors: 3,
        totalCost: 18500,
      };

      // Alertas de brotes
      const mockAlerts: OutbreakAlert[] = [
        {
          id: "1",
          diseaseName: "Mastitis",
          affectedAnimals: 3,
          location: "Sector A",
          riskLevel: "high",
          createdAt: new Date("2025-07-10"),
          isActive: true,
        },
        {
          id: "2",
          diseaseName: "Neumonía",
          affectedAnimals: 1,
          location: "Sector B",
          riskLevel: "critical",
          createdAt: new Date("2025-07-12"),
          isActive: true,
        },
      ];

      setDiseases(mockDiseases);
      setStats(mockStats);
      setOutbreakAlerts(mockAlerts);
    };

    loadData();
  }, []);

  // Filtrar enfermedades según criterios
  const filteredDiseases = diseases.filter((disease) => {
    const matchesSearch =
      disease.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disease.diseaseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      disease.animalTag.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      selectedStatus === "all" || disease.status === selectedStatus;
    const matchesSeverity =
      selectedSeverity === "all" || disease.severity === selectedSeverity;

    return matchesSearch && matchesStatus && matchesSeverity;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Seguimiento de Enfermedades
              </h1>
              <p className="text-gray-600 mt-1">
                Monitoreo y control de enfermedades del ganado
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Reportes
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Registrar Caso
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas de Brotes */}
        {outbreakAlerts.filter((alert) => alert.isActive).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Alertas de Brotes Activos
                  </h3>
                  <div className="space-y-2">
                    {outbreakAlerts
                      .filter((alert) => alert.isActive)
                      .map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-center justify-between bg-white rounded-lg p-3 border border-red-100"
                        >
                          <div>
                            <p className="font-medium text-red-900">
                              {alert.diseaseName} en {alert.location}
                            </p>
                            <p className="text-sm text-red-700">
                              {alert.affectedAnimals} animales afectados
                            </p>
                          </div>
                          <Badge variant={alert.riskLevel}>
                            {alert.riskLevel === "critical"
                              ? "Crítico"
                              : alert.riskLevel === "high"
                              ? "Alto"
                              : alert.riskLevel === "medium"
                              ? "Medio"
                              : "Bajo"}
                          </Badge>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Estadísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <Card className="bg-white/80 backdrop-blur-md border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total de Casos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.totalCases}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Casos Activos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.activeCases}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-orange-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Casos Críticos
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.criticalCases}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Tasa de Recuperación
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.recoveryRate}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Nuevos Esta Semana
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats.newCasesThisWeek}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Mapa de Enfermedades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-red-600" />
                  Mapa de Distribución de Enfermedades
                </CardTitle>
                <CardDescription>
                  Ubicación geográfica de casos activos y brotes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DiseaseMap />
              </CardContent>
            </Card>
          </motion.div>

          {/* Panel de Control */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Filtros */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filtros de Búsqueda
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Animal, enfermedad, etiqueta..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activo</option>
                    <option value="treating">En tratamiento</option>
                    <option value="recovered">Recuperado</option>
                    <option value="chronic">Crónico</option>
                  </select>
                </div>

                {/* Severidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severidad
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedSeverity}
                    onChange={(e) => setSelectedSeverity(e.target.value)}
                  >
                    <option value="all">Todas las severidades</option>
                    <option value="critical">Crítica</option>
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas Adicionales */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-green-600" />
                  Información Clave
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Enfermedad más común:
                  </span>
                  <span className="font-medium">{stats.mostCommonDisease}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Tiempo promedio de recuperación:
                  </span>
                  <span className="font-medium">
                    {stats.averageRecoveryTime} días
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Sectores afectados:
                  </span>
                  <span className="font-medium">
                    {stats.affectedSectors} de 5
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Costo total:</span>
                  <span className="font-medium">
                    ${stats.totalCost.toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Enfermedades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-12"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle>
                  Casos de Enfermedades ({filteredDiseases.length})
                </CardTitle>
                <CardDescription>
                  Lista detallada de todos los casos registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDiseases.map((disease) => (
                    <motion.div
                      key={disease.id}
                      whileHover={{ scale: 1.01 }}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {disease.animalName} ({disease.animalTag})
                            </h4>
                            <Badge variant={disease.severity}>
                              {disease.severity === "critical"
                                ? "Crítica"
                                : disease.severity === "high"
                                ? "Alta"
                                : disease.severity === "medium"
                                ? "Media"
                                : "Baja"}
                            </Badge>
                            <Badge variant={disease.status}>
                              {disease.status === "active"
                                ? "Activo"
                                : disease.status === "treating"
                                ? "En tratamiento"
                                : disease.status === "recovered"
                                ? "Recuperado"
                                : disease.status === "chronic"
                                ? "Crónico"
                                : "Fallecido"}
                            </Badge>
                            {disease.isContagious && (
                              <Badge variant="critical">Contagioso</Badge>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Enfermedad:</p>
                              <p className="font-medium">
                                {disease.diseaseName}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Veterinario:</p>
                              <p className="font-medium">
                                {disease.veterinarian}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Ubicación:</p>
                              <p className="font-medium">
                                {disease.location.address}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">
                                Fecha de diagnóstico:
                              </p>
                              <p className="font-medium">
                                {disease.diagnosisDate.toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Tratamiento:</p>
                              <p className="font-medium">
                                {disease.treatment || "No especificado"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Costo:</p>
                              <p className="font-medium">
                                ${disease.cost.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {disease.symptoms.length > 0 && (
                            <div className="mt-3">
                              <p className="text-gray-600 text-sm">Síntomas:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {disease.symptoms.map((symptom, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                                  >
                                    {symptom}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DiseaseTracking;
