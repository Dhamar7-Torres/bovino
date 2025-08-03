import React, { useState, useEffect } from "react";
import {
  Skull,
  MapPin,
  Search,
  Filter,
  Plus,
  TrendingUp,
  Microscope,
  Edit,
  Shield,
  Target,
  Trash2,
  Zap,
} from "lucide-react";

// Interfaces para tipos de datos
interface PostMortemReport {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  weight: number;
  deathDate: Date;
  discoveryDate: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
    sector: string;
    environment: string;
  };
  deathCircumstances: {
    witnessed: boolean;
    timeOfDeath?: Date;
    positionFound: string;
    weatherConditions: string;
    circumstances: string;
  };
  preliminaryCause: string;
  finalCause: string;
  causeCategory:
    | "disease"
    | "trauma"
    | "poisoning"
    | "metabolic"
    | "reproductive"
    | "congenital"
    | "unknown"
    | "predation";
  necropsyPerformed: boolean;
  necropsyDate?: Date;
  pathologist: string;
  veterinarian: string;
  grossFindings: {
    externalExamination: string;
    cardiovascularSystem: string;
    respiratorySystem: string;
    digestiveSystem: string;
    nervousSystem: string;
    reproductiveSystem: string;
    musculoskeletalSystem: string;
    lymphaticSystem: string;
    other: string;
  };
  histopathology?: {
    performed: boolean;
    results: string;
    laboratory: string;
    reportDate?: Date;
  };
  toxicology?: {
    performed: boolean;
    substances: string[];
    results: string;
    laboratory: string;
  };
  microbiology?: {
    performed: boolean;
    organisms: string[];
    antibiogramResults?: string;
    laboratory: string;
  };
  photos: Array<{
    id: string;
    description: string;
    category: "external" | "internal" | "microscopic" | "site";
    timestamp: Date;
  }>;
  samples: Array<{
    id: string;
    type: string;
    organ: string;
    preservationMethod: string;
    laboratory: string;
    status: "collected" | "sent" | "processing" | "completed";
  }>;
  preventiveRecommendations: string[];
  economicImpact: number;
  reportStatus: "preliminary" | "pending_lab" | "completed" | "reviewed";
  createdBy: string;
  createdAt: Date;
  lastUpdated: Date;
  isContagious: boolean;
  requiresQuarantine: boolean;
  notifiableDisease: boolean;
  reportedToAuthorities: boolean;
}

interface MortalityStats {
  totalDeaths: number;
  monthlyDeaths: number;
  mortalityRate: number;
  mostCommonCause: string;
  averageAge: number;
  costImpact: number;
  necropsyRate: number;
  contagiousCases: number;
  seasonalTrend: "increasing" | "decreasing" | "stable";
  preventableCases: number;
}


// Componentes reutilizables
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white/95 backdrop-blur-lg rounded-lg shadow-lg border border-white/40 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200/40 bg-gradient-to-r from-[#519a7c]/20 to-[#f4ac3a]/20">{children}</div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600 mt-1">{children}</p>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Button = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  type = "button"
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "success" | "danger" | "warning";
  size?: "sm" | "default";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    default: "bg-[#519a7c] text-white hover:bg-[#519a7c]/90 focus:ring-[#519a7c]/50",
    outline: "border border-[#519a7c]/60 bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-[#519a7c]/10 focus:ring-[#519a7c]/50",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm",
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant, className = "" }: {
  children: React.ReactNode;
  variant: string;
  className?: string;
}) => {
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
      case "disease":
        return "bg-red-100 text-red-800 border-red-200";
      case "trauma":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "poisoning":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "metabolic":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reproductive":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "congenital":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "predation":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "unknown":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "preliminary":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pending_lab":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "reviewed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
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

// Componente de Mapa de Mortalidad
const MortalityMap = () => {
  return (
    <div className="h-96 bg-gradient-to-br from-[#f2e9d8]/50 to-[#519a7c]/20 rounded-lg flex items-center justify-center relative overflow-hidden border border-[#519a7c]/20">
      <div className="absolute inset-0 bg-gradient-to-br from-[#f2e9d8]/60 to-[#519a7c]/30"></div>

      <div className="absolute top-4 left-4 bg-white/95 rounded-lg px-3 py-2 shadow-md border border-[#519a7c]/30">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#519a7c]" />
          <span className="text-sm font-medium">
            Mapa de Mortalidad - Villahermosa, Tabasco
          </span>
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-white/95 rounded-lg p-3 shadow-md text-xs border border-[#519a7c]/30">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span>Enfermedad</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span>Trauma</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Envenenamiento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            <span>Desconocido</span>
          </div>
        </div>
      </div>

      <div className="relative w-full h-full">
        <div className="absolute top-1/4 left-1/3 transform -translate-x-1/2 -translate-y-1/2">
          <div className="bg-red-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <Skull className="w-4 h-4 text-white" />
          </div>
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white/95 rounded-lg p-2 shadow-lg w-32 text-xs border border-[#519a7c]/30">
            <p className="font-medium text-red-700">Neumonía Severa</p>
            <p className="text-gray-600">Vaca Holstein - 4 años</p>
            <p className="text-gray-600">Sector A - Establo Principal</p>
          </div>
        </div>

        <div className="absolute top-2/3 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <div className="bg-orange-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <TrendingUp className="w-3 h-3 text-white" />
          </div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white/95 rounded-lg p-2 shadow-lg w-28 text-xs border border-[#519a7c]/30">
            <p className="font-medium text-orange-700">Trauma Múltiple</p>
            <p className="text-gray-600">Toro Angus - 6 años</p>
            <p className="text-gray-600">Sector B - Pastizal</p>
          </div>
        </div>

        <div className="absolute bottom-1/4 left-2/3 transform -translate-x-1/2 translate-y-1/2">
          <div className="bg-purple-500 rounded-full w-7 h-7 flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
            <Zap className="w-3 h-3 text-white" />
          </div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/95 rounded-lg p-2 shadow-lg w-28 text-xs border border-[#519a7c]/30">
            <p className="font-medium text-purple-700">Intoxicación</p>
            <p className="text-gray-600">Novilla Jersey - 2 años</p>
            <p className="text-gray-600">Sector C - Potrero Sur</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const PostMortemReports = () => {
  const [reports, setReports] = useState<PostMortemReport[]>([]);
  const [stats, setStats] = useState<MortalityStats>({
    totalDeaths: 0,
    monthlyDeaths: 0,
    mortalityRate: 0,
    mostCommonCause: "",
    averageAge: 0,
    costImpact: 0,
    necropsyRate: 0,
    contagiousCases: 0,
    seasonalTrend: "stable",
    preventableCases: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCause, setSelectedCause] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30");

  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockReports: PostMortemReport[] = [
        {
          id: "1",
          animalId: "COW004",
          animalName: "Margarita",
          animalTag: "TAG-004",
          breed: "Holstein",
          age: 4,
          gender: "female",
          weight: 520,
          deathDate: new Date("2025-07-08"),
          discoveryDate: new Date("2025-07-08"),
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Establo Principal, Sector A",
            sector: "A",
            environment: "Confinamiento",
          },
          deathCircumstances: {
            witnessed: false,
            positionFound: "Decúbito lateral izquierdo",
            weatherConditions: "Caluroso, 32°C",
            circumstances: "Encontrada muerta en la mañana, sin signos previos aparentes",
          },
          preliminaryCause: "Neumonía severa",
          finalCause: "Neumonía bacteriana por Mannheimia haemolytica",
          causeCategory: "disease",
          necropsyPerformed: true,
          necropsyDate: new Date("2025-07-08"),
          pathologist: "Dr. Hernández",
          veterinarian: "Dr. García",
          grossFindings: {
            externalExamination: "Animal en buen estado nutricional, sin lesiones externas evidentes",
            cardiovascularSystem: "Corazón aumentado de tamaño, congestión venosa",
            respiratorySystem: "Pulmones consolidados bilateralmente, exudado purulento en bronquios",
            digestiveSystem: "Sin hallazgos significativos",
            nervousSystem: "Sin alteraciones macroscópicas",
            reproductiveSystem: "Útero gestante de 6 meses",
            musculoskeletalSystem: "Sin lesiones",
            lymphaticSystem: "Nódulos linfáticos mediastínicos aumentados",
            other: "Hígado con congestión pasiva",
          },
          histopathology: {
            performed: true,
            results: "Bronconeumonía supurativa severa con colonias bacterianas",
            laboratory: "Laboratorio Veterinario Central",
            reportDate: new Date("2025-07-12"),
          },
          microbiology: {
            performed: true,
            organisms: ["Mannheimia haemolytica"],
            antibiogramResults: "Sensible a penicilina, resistente a tetraciclina",
            laboratory: "Laboratorio Veterinario Central",
          },
          photos: [],
          samples: [],
          preventiveRecommendations: [
            "Mejorar ventilación en establos",
            "Implementar programa de vacunación respiratoria",
            "Monitoreo de estrés térmico",
            "Separar animales gestantes",
          ],
          economicImpact: 15000,
          reportStatus: "completed",
          createdBy: "Dr. García",
          createdAt: new Date("2025-07-08"),
          lastUpdated: new Date("2025-07-12"),
          isContagious: true,
          requiresQuarantine: false,
          notifiableDisease: false,
          reportedToAuthorities: false,
        },
        {
          id: "2",
          animalId: "BULL001",
          animalName: "Campeón",
          animalTag: "TAG-B001",
          breed: "Angus",
          age: 6,
          gender: "male",
          weight: 850,
          deathDate: new Date("2025-07-05"),
          discoveryDate: new Date("2025-07-05"),
          location: {
            lat: 17.9719,
            lng: -92.9456,
            address: "Pastizal Norte, Sector B",
            sector: "B",
            environment: "Pastoreo",
          },
          deathCircumstances: {
            witnessed: true,
            timeOfDeath: new Date("2025-07-05T14:30:00"),
            positionFound: "Decúbito lateral derecho",
            weatherConditions: "Lluvia ligera, 28°C",
            circumstances: "Observado cayendo súbitamente durante pastoreo",
          },
          preliminaryCause: "Trauma múltiple",
          finalCause: "Traumatismo craneoencefálico severo",
          causeCategory: "trauma",
          necropsyPerformed: true,
          necropsyDate: new Date("2025-07-05"),
          pathologist: "Dr. Hernández",
          veterinarian: "Dr. Martínez",
          grossFindings: {
            externalExamination: "Herida contusa en región frontal, hematoma subcutáneo extenso",
            cardiovascularSystem: "Sin alteraciones",
            respiratorySystem: "Congestión pulmonar leve",
            digestiveSystem: "Sin hallazgos",
            nervousSystem: "Fractura de hueso frontal, hemorragia subdural severa",
            reproductiveSystem: "Sin alteraciones",
            musculoskeletalSystem: "Fractura en miembro anterior izquierdo",
            lymphaticSystem: "Sin alteraciones",
            other: "Hematomas múltiples en flanco izquierdo",
          },
          photos: [],
          samples: [],
          preventiveRecommendations: [
            "Inspección de infraestructura en pastizales",
            "Remoción de objetos peligrosos",
            "Mejora de cercas y protecciones",
            "Supervisión durante pastoreo",
          ],
          economicImpact: 25000,
          reportStatus: "completed",
          createdBy: "Dr. Martínez",
          createdAt: new Date("2025-07-05"),
          lastUpdated: new Date("2025-07-06"),
          isContagious: false,
          requiresQuarantine: false,
          notifiableDisease: false,
          reportedToAuthorities: false,
        },
      ];

      const mockStats: MortalityStats = {
        totalDeaths: 18,
        monthlyDeaths: 3,
        mortalityRate: 2.8,
        mostCommonCause: "Enfermedades respiratorias",
        averageAge: 4.2,
        costImpact: 180000,
        necropsyRate: 85.5,
        contagiousCases: 2,
        seasonalTrend: "increasing",
        preventableCases: 12,
      };

      setReports(mockReports);
      setStats(mockStats);
    };

    loadData();
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.finalCause.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.animalId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.breed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCause = selectedCause === "all" || report.causeCategory === selectedCause;
    const matchesStatus = selectedStatus === "all" || report.reportStatus === selectedStatus;

    const now = new Date();
    const reportDate = new Date(report.deathDate);
    const daysDifference = Math.floor((now.getTime() - reportDate.getTime()) / (1000 * 3600 * 24));
    
    let matchesPeriod = true;
    if (selectedPeriod === "7") {
      matchesPeriod = daysDifference <= 7;
    } else if (selectedPeriod === "30") {
      matchesPeriod = daysDifference <= 30;
    } else if (selectedPeriod === "90") {
      matchesPeriod = daysDifference <= 90;
    } else if (selectedPeriod === "365") {
      matchesPeriod = daysDifference <= 365;
    }

    return matchesSearch && matchesCause && matchesStatus && matchesPeriod;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-2 sm:p-6 overflow-x-hidden">
      <div className="bg-white/90 backdrop-blur-lg border-b border-[#519a7c]/30 sticky top-0 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Reportes Post-Mortem
              </h1>
              <p className="text-gray-600 mt-1">
                Análisis patológico y causa de mortalidad
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Reporte
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-gray-100/90 to-gray-50/90 border-gray-300/60">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200/80 rounded-lg flex items-center justify-center">
                      <Skull className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">Total Muertes</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalDeaths}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-100/90 to-red-50/90 border-red-300/60">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-200/80 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-red-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-red-800">Tasa Mortalidad</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.mortalityRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#519a7c]/20 to-[#519a7c]/10 border-[#519a7c]/40">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#519a7c]/30 rounded-lg flex items-center justify-center">
                      <Microscope className="w-6 h-6 text-[#519a7c]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#519a7c]">Tasa Necropsia</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.necropsyRate}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <Card className="bg-gradient-to-br from-green-100/90 to-green-50/90 border-green-300/60">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-200/80 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-700" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-800">Casos Prevenibles</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.preventableCases}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-[#f4ac3a]/20 to-[#f4ac3a]/10 border-[#f4ac3a]/40">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#f4ac3a]/30 rounded-lg flex items-center justify-center">
                      <Target className="w-6 h-6 text-[#f4ac3a]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-orange-700">Impacto Económico</p>
                      <p className="text-2xl font-bold text-gray-900">${(stats.costImpact / 1000).toFixed(0)}K</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="lg:col-span-8">
            <Card className="bg-white/95 border-[#519a7c]/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#519a7c]" />
                  Mapa de Casos de Mortalidad
                </CardTitle>
                <CardDescription>
                  Distribución geográfica de casos por causa de muerte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MortalityMap />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="bg-white/95 border-[#519a7c]/40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-[#519a7c]" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Animal, causa, etiqueta..."
                      className="w-full pl-10 pr-4 py-2 border border-[#519a7c]/60 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] bg-white/90 backdrop-blur-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Causa</label>
                  <select
                    className="w-full px-3 py-2 border border-[#519a7c]/60 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] bg-white/90 backdrop-blur-sm"
                    value={selectedCause}
                    onChange={(e) => setSelectedCause(e.target.value)}
                  >
                    <option value="all">Todas las causas</option>
                    <option value="disease">Enfermedades</option>
                    <option value="trauma">Traumas</option>
                    <option value="poisoning">Envenenamientos</option>
                    <option value="metabolic">Metabólicas</option>
                    <option value="reproductive">Reproductivas</option>
                    <option value="congenital">Congénitas</option>
                    <option value="predation">Depredación</option>
                    <option value="unknown">Desconocidas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    className="w-full px-3 py-2 border border-[#519a7c]/60 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] bg-white/90 backdrop-blur-sm"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="preliminary">Preliminar</option>
                    <option value="pending_lab">Pendiente lab</option>
                    <option value="completed">Completado</option>
                    <option value="reviewed">Revisado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                  <select
                    className="w-full px-3 py-2 border border-[#519a7c]/60 rounded-md focus:ring-2 focus:ring-[#519a7c]/50 focus:border-[#519a7c] bg-white/90 backdrop-blur-sm"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="90">Últimos 3 meses</option>
                    <option value="365">Último año</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-12">
            <Card className="bg-white/95 border-[#519a7c]/40">
              <CardHeader>
                <CardTitle>Reportes Post-Mortem ({filteredReports.length})</CardTitle>
                <CardDescription>
                  Análisis patológicos y determinación de causa de muerte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div
                      key={report.id}
                      className="border border-white/60 bg-white/90 backdrop-blur-sm rounded-lg p-6 hover:shadow-lg hover:bg-white/95 transition-all duration-200 break-words"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-xl font-semibold text-gray-900">
                              {report.animalName} ({report.animalTag})
                            </h4>
                            <Badge variant={report.causeCategory}>
                              {report.causeCategory === "disease" ? "Enfermedad" :
                               report.causeCategory === "trauma" ? "Trauma" :
                               report.causeCategory === "poisoning" ? "Envenenamiento" :
                               report.causeCategory === "metabolic" ? "Metabólica" :
                               report.causeCategory === "reproductive" ? "Reproductiva" :
                               report.causeCategory === "congenital" ? "Congénita" :
                               report.causeCategory === "predation" ? "Depredación" : "Desconocida"}
                            </Badge>
                            <Badge variant={report.reportStatus}>
                              {report.reportStatus === "preliminary" ? "Preliminar" :
                               report.reportStatus === "pending_lab" ? "Pendiente Lab" :
                               report.reportStatus === "completed" ? "Completado" : "Revisado"}
                            </Badge>
                            {report.isContagious && <Badge variant="critical">Contagioso</Badge>}
                            {report.requiresQuarantine && <Badge variant="warning">Cuarentena</Badge>}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-600">Raza:</p>
                              <p className="font-medium">{report.breed}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Edad:</p>
                              <p className="font-medium">{report.age} años</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Peso:</p>
                              <p className="font-medium">{report.weight} kg</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Fecha muerte:</p>
                              <p className="font-medium">{report.deathDate.toLocaleDateString()}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-900 mb-2">Causa Final de Muerte</h5>
                            <p className="text-gray-800 bg-gradient-to-r from-[#f2e9d8]/60 to-[#f2e9d8]/40 backdrop-blur-sm p-3 rounded-lg border border-[#519a7c]/20 break-words overflow-wrap-anywhere">
                              {report.finalCause}
                            </p>
                          </div>

                          <div className="mb-4">
                            <h5 className="font-semibold text-gray-900 mb-2">Recomendaciones Preventivas</h5>
                            <div className="space-y-1">
                              {report.preventiveRecommendations.map((rec, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                  <div className="w-2 h-2 bg-[#519a7c] rounded-full mt-2 flex-shrink-0"></div>
                                  <span className="text-sm text-gray-700">{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div>
                              <strong>Veterinario:</strong> {report.veterinarian}
                            </div>
                            <div>
                              <strong>Impacto económico:</strong> ${report.economicImpact.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hover:bg-[#519a7c]/10 hover:border-[#519a7c]"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostMortemReports;