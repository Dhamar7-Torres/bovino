import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Weight,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Heart,
  Baby,
  User,
  Eye,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Interfaces
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

// Componente para el estado de salud
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

// Componente principal
const BovineDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [bovineData, setBovineData] = useState<BovineData | null>(null);
  const [loading, setLoading] = useState(false);

  // Si no hay ID, mostrar selector de bovinos
  if (!id) {
    const allBovines = [
      {
        id: "1",
        earTag: "MX-001234",
        name: "Lupita",
        breed: "Holstein",
        age: { years: 4, months: 4 },
        weight: 550,
        healthStatus: "HEALTHY" as const,
        location: "Potrero A",
        photo: "https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=400&q=80",
      },
      {
        id: "2",
        earTag: "MX-001235",
        name: "Esperanza",
        breed: "Jersey",
        age: { years: 3, months: 8 },
        weight: 480,
        healthStatus: "HEALTHY" as const,
        location: "Potrero B",
        photo: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&q=80",
      },
      {
        id: "3",
        earTag: "MX-001236",
        name: "Princesa",
        breed: "Brown Swiss",
        age: { years: 5, months: 2 },
        weight: 600,
        healthStatus: "RECOVERING" as const,
        location: "Potrero C",
        photo: "https://images.unsplash.com/photo-1544737151-6e4b3999de9a?w=400&q=80",
      },
      {
        id: "4",
        earTag: "MX-001237",
        name: "Campeona",
        breed: "Holstein",
        age: { years: 2, months: 11 },
        weight: 420,
        healthStatus: "HEALTHY" as const,
        location: "Potrero A",
        photo: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&q=80",
      },
      {
        id: "5",
        earTag: "MX-001238",
        name: "Bella",
        breed: "Angus",
        age: { years: 3, months: 6 },
        weight: 520,
        healthStatus: "QUARANTINE" as const,
        location: "Área de Cuarentena",
        photo: "https://images.unsplash.com/photo-1562907550-096d3bc2bd90?w=400&q=80",
      },
      {
        id: "6",
        earTag: "MX-001239",
        name: "Rosa",
        breed: "Holstein",
        age: { years: 4, months: 1 },
        weight: 540,
        healthStatus: "HEALTHY" as const,
        location: "Potrero B",
        photo: "https://images.unsplash.com/photo-1551702661-b3b7ad4aac22?w=400&q=80",
      },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] p-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/bovines")}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-300"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="font-medium">Regresar</span>
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Selecciona un Bovino
            </h1>
            <div></div>
          </div>

          {/* Grid de bovinos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {allBovines.map((bovine) => (
              <div
                key={bovine.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/bovines/detail/${bovine.id}`)}
              >
                {/* Foto */}
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={bovine.photo}
                    alt={bovine.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <HealthStatusBadge status={bovine.healthStatus} />
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {bovine.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">Arete: {bovine.earTag}</p>

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

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium">
                      <Eye className="w-4 h-4" />
                      Ver Detalles
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Cargar datos del bovino específico
  useEffect(() => {
    if (id) {
      setLoading(true);
      
      const allBovinesData: { [key: string]: BovineData } = {
        "1": {
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
            address: "Potrero A, Rancho San José, Tabasco",
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
          ],
          illnesses: [],
          photos: [
            "https://images.unsplash.com/photo-1560114928-40f1f1eb26a0?w=400&q=80",
          ],
          notes: "Excelente productora de leche. Carácter dócil.",
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
        },
        "2": {
          id: "2",
          earTag: "MX-001235",
          name: "Esperanza",
          type: "COW",
          breed: "Jersey",
          gender: "FEMALE",
          birthDate: new Date("2021-01-20"),
          age: { years: 3, months: 8, days: 15 },
          weight: 480,
          motherEarTag: "MX-000789",
          fatherEarTag: "MX-000321",
          location: {
            latitude: 17.9875,
            longitude: -92.9310,
            address: "Potrero B, Rancho San José, Tabasco",
          },
          healthStatus: "HEALTHY",
          vaccinations: [
            {
              id: "v3",
              vaccineType: "Bacteriana",
              vaccineName: "Brucelosis",
              dose: "2ml",
              applicationDate: new Date("2024-05-20"),
              veterinarianName: "Dr. Ana López",
              batchNumber: "BR-2024-002",
              manufacturer: "Pfizer",
              location: { latitude: 17.9875, longitude: -92.9310 },
            },
          ],
          illnesses: [],
          photos: [
            "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?w=400&q=80",
          ],
          notes: "Vaca joven con gran potencial productivo. Muy dócil al manejo.",
          createdAt: new Date("2021-01-20"),
          updatedAt: new Date("2024-07-05"),
          lastVaccination: new Date("2024-05-20"),
          nextVaccinationDue: new Date("2025-05-20"),
          totalWeight: 480,
          weightHistory: [
            { date: new Date("2024-01-01"), weight: 450 },
            { date: new Date("2024-04-01"), weight: 465 },
            { date: new Date("2024-07-01"), weight: 480 },
          ],
        },
        "3": {
          id: "3",
          earTag: "MX-001236",
          name: "Princesa",
          type: "COW",
          breed: "Brown Swiss",
          gender: "FEMALE",
          birthDate: new Date("2019-05-10"),
          age: { years: 5, months: 2, days: 8 },
          weight: 600,
          motherEarTag: "MX-000654",
          fatherEarTag: "MX-000987",
          location: {
            latitude: 17.9880,
            longitude: -92.9295,
            address: "Potrero C, Rancho San José, Tabasco",
          },
          healthStatus: "RECOVERING",
          vaccinations: [],
          illnesses: [
            {
              id: "i2",
              diseaseName: "Cojera leve",
              diagnosisDate: new Date("2024-06-01"),
              symptoms: ["Dificultad para caminar", "Inflamación en pata trasera"],
              severity: "LOW",
              treatment: "Antiinflamatorios y reposo",
              veterinarianName: "Dr. Patricia Ruiz",
              recoveryDate: new Date("2024-06-15"),
              location: { latitude: 17.9880, longitude: -92.9295 },
              isContagious: false,
              notes: "Recuperación completa esperada",
            },
          ],
          photos: [
            "https://images.unsplash.com/photo-1544737151-6e4b3999de9a?w=400&q=80",
          ],
          notes: "Vaca madura y experimentada. Excelente madre.",
          createdAt: new Date("2019-05-10"),
          updatedAt: new Date("2024-06-20"),
          totalWeight: 600,
          weightHistory: [
            { date: new Date("2024-01-01"), weight: 590 },
            { date: new Date("2024-04-01"), weight: 595 },
            { date: new Date("2024-07-01"), weight: 600 },
          ],
        },
        "4": {
          id: "4",
          earTag: "MX-001237",
          name: "Campeona",
          type: "COW",
          breed: "Holstein",
          gender: "FEMALE",
          birthDate: new Date("2022-08-15"),
          age: { years: 2, months: 11, days: 12 },
          weight: 420,
          motherEarTag: "MX-001234",
          fatherEarTag: "MX-000456",
          location: {
            latitude: 17.9869,
            longitude: -92.9303,
            address: "Potrero A, Rancho San José, Tabasco",
          },
          healthStatus: "HEALTHY",
          vaccinations: [],
          illnesses: [],
          photos: [
            "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400&q=80",
          ],
          notes: "Vaca joven con excelente genética. Hija de Lupita.",
          createdAt: new Date("2022-08-15"),
          updatedAt: new Date("2024-07-01"),
          totalWeight: 420,
          weightHistory: [
            { date: new Date("2024-01-01"), weight: 380 },
            { date: new Date("2024-04-01"), weight: 400 },
            { date: new Date("2024-07-01"), weight: 420 },
          ],
        },
        "5": {
          id: "5",
          earTag: "MX-001238",
          name: "Bella",
          type: "COW",
          breed: "Angus",
          gender: "FEMALE",
          birthDate: new Date("2021-03-10"),
          age: { years: 3, months: 6, days: 20 },
          weight: 520,
          motherEarTag: "MX-000555",
          fatherEarTag: "MX-000888",
          location: {
            latitude: 17.9860,
            longitude: -92.9320,
            address: "Área de Cuarentena, Rancho San José, Tabasco",
          },
          healthStatus: "QUARANTINE",
          vaccinations: [],
          illnesses: [
            {
              id: "i3",
              diseaseName: "Sospecha de Brucelosis",
              diagnosisDate: new Date("2024-06-25"),
              symptoms: ["Pérdida de peso", "Letargia", "Fiebre intermitente"],
              severity: "MEDIUM",
              treatment: "Aislamiento y monitoreo. Pendiente resultados laboratorio",
              veterinarianName: "Dr. Elena Morales",
              location: { latitude: 17.9860, longitude: -92.9320 },
              isContagious: true,
              notes: "En cuarentena preventiva hasta confirmar diagnóstico",
            },
          ],
          photos: [
            "https://images.unsplash.com/photo-1562907550-096d3bc2bd90?w=400&q=80",
          ],
          notes: "En cuarentena preventiva. Requiere monitoreo constante.",
          createdAt: new Date("2021-03-10"),
          updatedAt: new Date("2024-06-25"),
          totalWeight: 520,
          weightHistory: [
            { date: new Date("2024-01-01"), weight: 530 },
            { date: new Date("2024-04-01"), weight: 525 },
            { date: new Date("2024-07-01"), weight: 520 },
          ],
        },
        "6": {
          id: "6",
          earTag: "MX-001239",
          name: "Rosa",
          type: "COW",
          breed: "Holstein",
          gender: "FEMALE",
          birthDate: new Date("2020-06-25"),
          age: { years: 4, months: 1, days: 5 },
          weight: 540,
          motherEarTag: "MX-000333",
          fatherEarTag: "MX-000666",
          location: {
            latitude: 17.9875,
            longitude: -92.9310,
            address: "Potrero B, Rancho San José, Tabasco",
          },
          healthStatus: "HEALTHY",
          vaccinations: [],
          illnesses: [],
          photos: [
            "https://images.unsplash.com/photo-1551702661-b3b7ad4aac22?w=400&q=80",
          ],
          notes: "Vaca estable y productiva. Buen temperamento.",
          createdAt: new Date("2020-06-25"),
          updatedAt: new Date("2024-06-20"),
          totalWeight: 540,
          weightHistory: [
            { date: new Date("2024-01-01"), weight: 525 },
            { date: new Date("2024-04-01"), weight: 532 },
            { date: new Date("2024-07-01"), weight: 540 },
          ],
        },
      };

      const data = allBovinesData[id];
      if (data) {
        setBovineData(data);
      }
      setLoading(false);
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center">
          <div className="w-12 h-12 border-4 border-[#3d8b40] border-t-transparent rounded-full mx-auto mb-4 animate-spin"></div>
          <p className="text-lg font-medium text-gray-700">
            Cargando información del bovino...
          </p>
        </div>
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

  // Vista de detalle del bovino específico
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/bovines")}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Regresar</span>
          </button>
        </div>

        {/* Información del bovino */}
        <div className="bg-[#fffdf8]/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
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

              {/* Foto */}
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

          {/* Información detallada */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      {bovineData.age.years} años, {bovineData.age.months} meses
                    </p>
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-[#3d8b40]" />
                  Ubicación
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Dirección:
                    </span>
                    <p className="text-gray-900">
                      {bovineData.location.address}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Coordenadas:
                    </span>
                    <p className="text-gray-900">
                      {bovineData.location.latitude.toFixed(6)}, {bovineData.location.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Salud */}
              <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-[#3d8b40]" />
                  Estado de Salud
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Estado:
                    </span>
                    <div className="mt-1">
                      <HealthStatusBadge status={bovineData.healthStatus} />
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Vacunas:
                    </span>
                    <p className="text-gray-900">
                      {bovineData.vaccinations.length} aplicadas
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Enfermedades:
                    </span>
                    <p className="text-gray-900">
                      {bovineData.illnesses.length} registradas
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BovineDetail;