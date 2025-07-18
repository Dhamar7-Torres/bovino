import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MapPin,
  Calendar,
  Weight,
  Heart,
  Shield,
  Baby,
  User,
  Share2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Thermometer,
  Activity,
  FileText,
  Printer,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Interfaces para los datos del bovino
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface Vaccination {
  id: string;
  vaccineType: string;
  vaccineName: string;
  dose: string;
  applicationDate: Date;
  nextDueDate?: Date;
  veterinarianName: string;
  batchNumber: string;
  manufacturer: string;
  location: Location;
  notes?: string;
  sideEffects?: string[];
}

interface Illness {
  id: string;
  diseaseName: string;
  diagnosisDate: Date;
  symptoms: string[];
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  treatment?: string;
  veterinarianName: string;
  recoveryDate?: Date;
  location: Location;
  notes?: string;
  isContagious: boolean;
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
  vaccinations: Vaccination[];
  illnesses: Illness[];
  photos: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  lastVaccination?: Date;
  nextVaccinationDue?: Date;
  totalWeight: number;
  weightHistory: { date: Date; weight: number }[];
}

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
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
    >
      <IconComponent className="w-4 h-4" />
      {config.label}
    </div>
  );
};

// Componente para mostrar el nivel de severidad
const SeverityBadge: React.FC<{ severity: Illness["severity"] }> = ({
  severity,
}) => {
  const severityConfig = {
    LOW: { color: "bg-blue-100 text-blue-800", label: "Leve" },
    MEDIUM: { color: "bg-yellow-100 text-yellow-800", label: "Moderado" },
    HIGH: { color: "bg-orange-100 text-orange-800", label: "Alto" },
    CRITICAL: { color: "bg-red-100 text-red-800", label: "Crítico" },
  };

  const config = severityConfig[severity];

  return (
    <span
      className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
};

// Componente para la tarjeta de vacunación
const VaccinationCard: React.FC<{
  vaccination: Vaccination;
  index: number;
}> = ({ vaccination, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {vaccination.vaccineName}
            </h4>
            <p className="text-sm text-gray-600">{vaccination.vaccineType}</p>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {vaccination.applicationDate.toLocaleDateString("es-MX")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Dosis:</span>
          <p className="text-gray-600">{vaccination.dose}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Veterinario:</span>
          <p className="text-gray-600">{vaccination.veterinarianName}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Lote:</span>
          <p className="text-gray-600">{vaccination.batchNumber}</p>
        </div>
        <div>
          <span className="font-medium text-gray-700">Fabricante:</span>
          <p className="text-gray-600">{vaccination.manufacturer}</p>
        </div>
      </div>

      {vaccination.nextDueDate && (
        <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              Próxima dosis:{" "}
              {vaccination.nextDueDate.toLocaleDateString("es-MX")}
            </span>
          </div>
        </div>
      )}

      {vaccination.notes && (
        <div className="mt-3 text-sm text-gray-600">
          <span className="font-medium">Notas:</span> {vaccination.notes}
        </div>
      )}
    </motion.div>
  );
};

// Componente para la tarjeta de enfermedad
const IllnessCard: React.FC<{ illness: Illness; index: number }> = ({
  illness,
  index,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Thermometer className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {illness.diseaseName}
            </h4>
            <div className="flex items-center gap-2 mt-1">
              <SeverityBadge severity={illness.severity} />
              {illness.isContagious && (
                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  Contagioso
                </span>
              )}
            </div>
          </div>
        </div>
        <span className="text-sm text-gray-500">
          {illness.diagnosisDate.toLocaleDateString("es-MX")}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <span className="font-medium text-gray-700">Síntomas:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {illness.symptoms.map((symptom, index) => (
              <span
                key={index}
                className="inline-flex px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>

        <div>
          <span className="font-medium text-gray-700">Veterinario:</span>
          <p className="text-gray-600">{illness.veterinarianName}</p>
        </div>

        {illness.treatment && (
          <div>
            <span className="font-medium text-gray-700">Tratamiento:</span>
            <p className="text-gray-600">{illness.treatment}</p>
          </div>
        )}

        {illness.recoveryDate && (
          <div className="p-2 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Recuperado: {illness.recoveryDate.toLocaleDateString("es-MX")}
              </span>
            </div>
          </div>
        )}

        {illness.notes && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Notas:</span> {illness.notes}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Componente principal de detalle del bovino
const BovineDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<
    "info" | "health" | "history" | "location"
  >("info");
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [, setShowShareModal] = useState(false);

  // Datos simulados del bovino (en producción vendrían del backend)
  const [bovineData, setBovineData] = useState<BovineData | null>(null);

  // Cargar datos del bovino
  useEffect(() => {
    const loadBovineData = async () => {
      try {
        // Simular carga de datos desde API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Datos simulados
        const mockData: BovineData = {
          id: id || "1",
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
            address: "Rancho San José, Tabasco, México",
          },
          healthStatus: "HEALTHY",
          vaccinations: [
            {
              id: "v1",
              vaccineType: "Viral",
              vaccineName: "IBR-PI3-BRSV-BVD",
              dose: "5ml",
              applicationDate: new Date("2024-06-15"),
              nextDueDate: new Date("2025-06-15"),
              veterinarianName: "Dr. Carlos Mendoza",
              batchNumber: "VX-2024-001",
              manufacturer: "Zoetis",
              location: { latitude: 17.9869, longitude: -92.9303 },
              notes: "Sin reacciones adversas",
            },
            {
              id: "v2",
              vaccineType: "Bacteriana",
              vaccineName: "Clostridiosis",
              dose: "2ml",
              applicationDate: new Date("2024-05-10"),
              veterinarianName: "Dr. María González",
              batchNumber: "CL-2024-045",
              manufacturer: "MSD Animal Health",
              location: { latitude: 17.9869, longitude: -92.9303 },
            },
          ],
          illnesses: [
            {
              id: "i1",
              diseaseName: "Mastitis Subclínica",
              diagnosisDate: new Date("2024-04-20"),
              symptoms: [
                "Reducción en producción láctea",
                "Inflamación leve",
                "Cambio en consistencia",
              ],
              severity: "MEDIUM",
              treatment: "Antibióticos intramamarios por 3 días",
              veterinarianName: "Dr. Luis Fernández",
              recoveryDate: new Date("2024-04-28"),
              location: { latitude: 17.9869, longitude: -92.9303 },
              isContagious: false,
              notes: "Respuesta favorable al tratamiento",
            },
          ],
          photos: [
            "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400",
            "https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=400",
          ],
          notes:
            "Excelente productora de leche. Carácter dócil. Requiere seguimiento especial en período de lactancia.",
          createdAt: new Date("2020-03-15"),
          updatedAt: new Date("2024-07-08"),
          lastVaccination: new Date("2024-06-15"),
          nextVaccinationDue: new Date("2025-06-15"),
          totalWeight: 550,
          weightHistory: [
            { date: new Date("2024-01-01"), weight: 520 },
            { date: new Date("2024-04-01"), weight: 535 },
            { date: new Date("2024-07-01"), weight: 550 },
          ],
        };

        setBovineData(mockData);
      } catch (error) {
        console.error("Error cargando datos del bovino:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBovineData();
  }, [id]);

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

  // Manejar eliminación
  const handleDelete = async () => {
    try {
      // Simular eliminación
      await new Promise((resolve) => setTimeout(resolve, 1000));
      navigate("/bovines");
    } catch (error) {
      console.error("Error eliminando bovino:", error);
    }
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
            Cargando información del bovino...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!bovineData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bovino no encontrado
          </h2>
          <p className="text-gray-600 mb-4">
            No se pudo encontrar la información del bovino solicitado.
          </p>
          <button
            onClick={() => navigate("/bovines")}
            className="px-6 py-3 bg-[#3d8b40] text-white rounded-lg hover:bg-[#2d6e30] transition-all duration-300"
          >
            Regresar a la lista
          </button>
        </div>
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
        {/* Header con navegación y acciones */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => navigate("/bovines")}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Regresar</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowShareModal(true)}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-300"
              title="Compartir"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-300"
              title="Imprimir"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate(`/bovines/edit/${bovineData.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/80 backdrop-blur-sm rounded-lg text-white hover:bg-blue-600/80 transition-all duration-300"
            >
              <Edit className="w-4 h-4" />
              <span className="font-medium">Editar</span>
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-500/80 backdrop-blur-sm rounded-lg text-white hover:bg-red-600/80 transition-all duration-300"
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium">Eliminar</span>
            </button>
          </div>
        </motion.div>

        {/* Información principal del bovino */}
        <motion.div
          variants={itemVariants}
          className="bg-[#fffdf8]/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-6"
        >
          <div className="bg-gradient-to-r from-[#3d8b40] to-[#2d6e30] p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {bovineData.name || `Bovino ${bovineData.earTag}`}
                  </h1>
                  <HealthStatusBadge status={bovineData.healthStatus} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                  <div>
                    <p className="text-white/80 text-sm">Arete</p>
                    <p className="font-semibold text-lg">{bovineData.earTag}</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Raza</p>
                    <p className="font-semibold text-lg">{bovineData.breed}</p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Edad</p>
                    <p className="font-semibold text-lg">
                      {bovineData.age.years}a {bovineData.age.months}m
                    </p>
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Peso</p>
                    <p className="font-semibold text-lg">
                      {bovineData.weight} kg
                    </p>
                  </div>
                </div>
              </div>

              {/* Foto del bovino */}
              {bovineData.photos.length > 0 && (
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-white/20">
                  <img
                    src={bovineData.photos[0]}
                    alt={`Foto de ${bovineData.name || bovineData.earTag}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Navegación por pestañas */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: "info", label: "Información", icon: FileText },
                { id: "health", label: "Salud", icon: Heart },
                { id: "history", label: "Historial", icon: Clock },
                { id: "location", label: "Ubicación", icon: MapPin },
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? "border-[#3d8b40] text-[#3d8b40]"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Contenido de las pestañas */}
          <div className="p-6">
            <AnimatePresence mode="wait">
              {activeTab === "info" && (
                <motion.div
                  key="info"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {/* Información básica */}
                  <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-[#3d8b40]" />
                      Información Básica
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Tipo:
                        </span>
                        <p className="text-gray-900">{bovineData.type}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Sexo:
                        </span>
                        <p className="text-gray-900">
                          {bovineData.gender === "MALE" ? "Macho" : "Hembra"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Fecha de Nacimiento:
                        </span>
                        <p className="text-gray-900">
                          {bovineData.birthDate.toLocaleDateString("es-MX")}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Registrado:
                        </span>
                        <p className="text-gray-900">
                          {bovineData.createdAt.toLocaleDateString("es-MX")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Genealogía */}
                  <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Baby className="w-5 h-5 text-[#3d8b40]" />
                      Genealogía
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Madre:
                        </span>
                        <p className="text-gray-900">
                          {bovineData.motherEarTag || "No registrada"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Padre:
                        </span>
                        <p className="text-gray-900">
                          {bovineData.fatherEarTag || "No registrado"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Datos físicos */}
                  <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Weight className="w-5 h-5 text-[#3d8b40]" />
                      Datos Físicos
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Peso Actual:
                        </span>
                        <p className="text-gray-900">{bovineData.weight} kg</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">
                          Edad:
                        </span>
                        <p className="text-gray-900">
                          {bovineData.age.years} años, {bovineData.age.months}{" "}
                          meses, {bovineData.age.days} días
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notas */}
                  {bovineData.notes && (
                    <div className="md:col-span-2 lg:col-span-3 bg-white rounded-lg p-6 shadow-md border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Notas
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        {bovineData.notes}
                      </p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "health" && (
                <motion.div
                  key="health"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                  {/* Resumen de salud */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Vacunas
                      </h4>
                      <p className="text-2xl font-bold text-green-600">
                        {bovineData.vaccinations.length}
                      </p>
                      <p className="text-sm text-gray-600">Aplicadas</p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Thermometer className="w-6 h-6 text-red-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Enfermedades
                      </h4>
                      <p className="text-2xl font-bold text-red-600">
                        {bovineData.illnesses.length}
                      </p>
                      <p className="text-sm text-gray-600">Registradas</p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Activity className="w-6 h-6 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        Estado
                      </h4>
                      <p className="text-2xl font-bold text-blue-600">
                        <HealthStatusBadge status={bovineData.healthStatus} />
                      </p>
                    </div>
                  </div>

                  {/* Vacunaciones */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Historial de Vacunaciones
                    </h3>
                    {bovineData.vaccinations.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bovineData.vaccinations.map((vaccination, index) => (
                          <VaccinationCard
                            key={vaccination.id}
                            vaccination={vaccination}
                            index={index}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay vacunaciones registradas</p>
                      </div>
                    )}
                  </div>

                  {/* Enfermedades */}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6">
                      Historial de Enfermedades
                    </h3>
                    {bovineData.illnesses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bovineData.illnesses.map((illness, index) => (
                          <IllnessCard
                            key={illness.id}
                            illness={illness}
                            index={index}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Thermometer className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No hay enfermedades registradas</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === "history" && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900">
                    Historial de Peso
                  </h3>
                  <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                    <div className="space-y-4">
                      {bovineData.weightHistory.map((record, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Weight className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {record.weight} kg
                              </p>
                              <p className="text-sm text-gray-600">
                                {record.date.toLocaleDateString("es-MX")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {index > 0 && (
                              <p
                                className={`text-sm font-medium ${
                                  record.weight >
                                  bovineData.weightHistory[index - 1].weight
                                    ? "text-green-600"
                                    : record.weight <
                                      bovineData.weightHistory[index - 1].weight
                                    ? "text-red-600"
                                    : "text-gray-600"
                                }`}
                              >
                                {record.weight >
                                  bovineData.weightHistory[index - 1].weight &&
                                  "+"}
                                {(
                                  record.weight -
                                  bovineData.weightHistory[index - 1].weight
                                ).toFixed(1)}{" "}
                                kg
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === "location" && (
                <motion.div
                  key="location"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-gray-900">
                    Ubicación Actual
                  </h3>
                  <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">
                          Coordenadas GPS
                        </h4>
                        <p className="text-gray-600 mb-2">
                          Latitud: {bovineData.location.latitude.toFixed(6)}
                        </p>
                        <p className="text-gray-600 mb-4">
                          Longitud: {bovineData.location.longitude.toFixed(6)}
                        </p>
                        {bovineData.location.address && (
                          <p className="text-gray-700 font-medium">
                            📍 {bovineData.location.address}
                          </p>
                        )}
                        <button className="mt-4 px-4 py-2 bg-[#3d8b40] text-white rounded-lg hover:bg-[#2d6e30] transition-colors">
                          Ver en Mapa
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Modal de confirmación de eliminación */}
        <AnimatePresence>
          {showDeleteModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-6 max-w-md w-full"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Confirmar Eliminación
                  </h3>
                  <p className="text-gray-600 mb-6">
                    ¿Estás seguro de que deseas eliminar el bovino{" "}
                    <strong>{bovineData.earTag}</strong>? Esta acción no se
                    puede deshacer.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BovineDetail;
