import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle,
  MapIcon,
  MapPin,
  Calendar as CalendarIcon,
  User,
  Weight,
  Heart,
  RefreshCw,
  Info,
  History,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// Interfaces para los datos del bovino
interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

interface BovineFormData {
  id: string;
  earTag: string;
  name?: string;
  type: "CATTLE" | "BULL" | "COW" | "CALF";
  breed: string;
  gender: "MALE" | "FEMALE";
  birthDate: Date | null;
  weight: number;
  motherEarTag?: string;
  fatherEarTag?: string;
  location: Location | null;
  healthStatus: "HEALTHY" | "SICK" | "RECOVERING" | "QUARANTINE" | "DECEASED";
  notes?: string;
  photos?: string[];
}

interface LocationPickerProps {
  onLocationSelect: (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
  initialLocation?: { latitude: number; longitude: number };
}

interface ChangeLog {
  field: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
}

// Componente para seleccionar ubicación
const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
}) => {
  const [coordinates, setCoordinates] = useState({
    latitude: initialLocation?.latitude || 17.9869,
    longitude: initialLocation?.longitude || -92.9303,
  });

  const handleLocationInput = () => {
    const lat = coordinates.latitude;
    const lng = coordinates.longitude;

    const address = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
    onLocationSelect({
      latitude: lat,
      longitude: lng,
      address,
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setCoordinates({ latitude: lat, longitude: lng });
          onLocationSelect({
            latitude: lat,
            longitude: lng,
            address: `Ubicación actual: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          });
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
        }
      );
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white border border-gray-300 rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Latitud
          </label>
          <input
            type="number"
            step="0.000001"
            value={coordinates.latitude}
            onChange={(e) =>
              setCoordinates((prev) => ({
                ...prev,
                latitude: parseFloat(e.target.value) || 0,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
            placeholder="17.9869"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Longitud
          </label>
          <input
            type="number"
            step="0.000001"
            value={coordinates.longitude}
            onChange={(e) =>
              setCoordinates((prev) => ({
                ...prev,
                longitude: parseFloat(e.target.value) || 0,
              }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent"
            placeholder="-92.9303"
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={getCurrentLocation}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
        >
          Usar Ubicación Actual
        </button>
        <button
          type="button"
          onClick={handleLocationInput}
          className="flex-1 px-4 py-2 bg-[#3d8b40] text-white rounded hover:bg-[#2d6e30] transition-colors text-sm"
        >
          Confirmar Ubicación
        </button>
      </div>

      <div className="text-xs text-gray-500 text-center">
        📍 Tabasco, México (coordenadas por defecto)
      </div>
    </div>
  );
};

// Componente para mostrar cambios realizados
const ChangeIndicator: React.FC<{ changes: ChangeLog[] }> = ({ changes }) => {
  const [showChanges, setShowChanges] = useState(false);

  if (changes.length === 0) return null;

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowChanges(!showChanges)}
        className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
      >
        <History className="w-4 h-4" />
        <span className="font-medium">
          {changes.length} cambio(s) pendiente(s)
        </span>
        <motion.div
          animate={{ rotate: showChanges ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowLeft className="w-4 h-4 transform rotate-90" />
        </motion.div>
      </button>

      <AnimatePresence>
        {showChanges && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-3 bg-white rounded-lg border border-blue-200 overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {changes.map((change, index) => (
                <div key={index} className="text-sm">
                  <span className="font-medium text-gray-900">
                    {change.field}:
                  </span>
                  <span className="text-gray-600 ml-2">
                    "{change.oldValue}" → "{change.newValue}"
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Componente principal de edición del bovino
const BovineEdit: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [originalData, setOriginalData] = useState<BovineFormData | null>(null);
  const [formData, setFormData] = useState<BovineFormData | null>(null);
  const [changes, setChanges] = useState<ChangeLog[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Lista de razas bovinas comunes en México
  const breeds = [
    "Brahman",
    "Angus",
    "Hereford",
    "Simmental",
    "Charolais",
    "Holstein",
    "Jersey",
    "Gyr",
    "Nelore",
    "Criollo",
    "Suizo Pardo",
    "Limousin",
  ];

  // Cargar datos existentes del bovino
  useEffect(() => {
    const loadBovineData = async () => {
      try {
        setIsLoading(true);
        // Simular carga desde API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Datos simulados del bovino existente
        const mockData: BovineFormData = {
          id: id || "1",
          earTag: "MX-001234",
          name: "Lupita",
          type: "COW",
          breed: "Holstein",
          gender: "FEMALE",
          birthDate: new Date("2020-03-15"),
          weight: 550,
          motherEarTag: "MX-000123",
          fatherEarTag: "MX-000456",
          location: {
            latitude: 17.9869,
            longitude: -92.9303,
            address: "Rancho San José, Tabasco, México",
          },
          healthStatus: "HEALTHY",
          notes:
            "Excelente productora de leche. Carácter dócil. Requiere seguimiento especial en período de lactancia.",
          photos: [
            "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=400",
          ],
        };

        setOriginalData(mockData);
        setFormData(mockData);
      } catch (error) {
        console.error("Error cargando datos del bovino:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBovineData();
  }, [id]);

  // Detectar cambios en el formulario
  useEffect(() => {
    if (!originalData || !formData) return;

    const newChanges: ChangeLog[] = [];
    const fieldsToCheck: (keyof BovineFormData)[] = [
      "earTag",
      "name",
      "type",
      "breed",
      "gender",
      "weight",
      "motherEarTag",
      "fatherEarTag",
      "healthStatus",
      "notes",
    ];

    fieldsToCheck.forEach((field) => {
      if (originalData[field] !== formData[field]) {
        newChanges.push({
          field: getFieldDisplayName(field),
          oldValue: originalData[field],
          newValue: formData[field],
          timestamp: new Date(),
        });
      }
    });

    // Verificar cambios en fecha de nacimiento
    if (originalData.birthDate?.getTime() !== formData.birthDate?.getTime()) {
      newChanges.push({
        field: "Fecha de Nacimiento",
        oldValue:
          originalData.birthDate?.toLocaleDateString("es-MX") ||
          "No establecida",
        newValue:
          formData.birthDate?.toLocaleDateString("es-MX") || "No establecida",
        timestamp: new Date(),
      });
    }

    // Verificar cambios en ubicación
    if (
      originalData.location?.latitude !== formData.location?.latitude ||
      originalData.location?.longitude !== formData.location?.longitude
    ) {
      newChanges.push({
        field: "Ubicación",
        oldValue: originalData.location
          ? `${originalData.location.latitude.toFixed(
              6
            )}, ${originalData.location.longitude.toFixed(6)}`
          : "No establecida",
        newValue: formData.location
          ? `${formData.location.latitude.toFixed(
              6
            )}, ${formData.location.longitude.toFixed(6)}`
          : "No establecida",
        timestamp: new Date(),
      });
    }

    setChanges(newChanges);
    setHasUnsavedChanges(newChanges.length > 0);
  }, [originalData, formData]);

  // Función para obtener el nombre legible del campo
  const getFieldDisplayName = (field: keyof BovineFormData): string => {
    const fieldNames: Record<keyof BovineFormData, string> = {
      id: "ID",
      earTag: "Arete",
      name: "Nombre",
      type: "Tipo",
      breed: "Raza",
      gender: "Sexo",
      birthDate: "Fecha de Nacimiento",
      weight: "Peso",
      motherEarTag: "Arete de la Madre",
      fatherEarTag: "Arete del Padre",
      location: "Ubicación",
      healthStatus: "Estado de Salud",
      notes: "Notas",
      photos: "Fotos",
    };
    return fieldNames[field];
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4 },
    },
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: keyof BovineFormData, value: any) => {
    if (!formData) return;

    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [field]: value,
          }
        : null
    );
  };

  // Manejar selección de ubicación
  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    handleInputChange("location", location);
    setShowLocationPicker(false);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setIsSubmitting(true);

    try {
      // Simular envío al backend
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setShowSuccess(true);
      setTimeout(() => {
        navigate(`/bovines/detail/${formData.id}`);
      }, 2000);
    } catch (error) {
      console.error("Error al actualizar el bovino:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetear cambios
  const handleReset = () => {
    if (originalData) {
      setFormData({ ...originalData });
    }
  };

  // Manejar navegación con cambios pendientes
  const handleNavigation = (path: string) => {
    if (hasUnsavedChanges) {
      const confirmLeave = window.confirm(
        "Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?"
      );
      if (confirmLeave) {
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  if (isLoading) {
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
            Cargando datos del bovino...
          </p>
        </motion.div>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error al cargar datos
          </h2>
          <p className="text-gray-600 mb-4">
            No se pudieron cargar los datos del bovino.
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
        className="max-w-4xl mx-auto"
      >
        {/* Header con botón de regreso y estado de cambios */}
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => handleNavigation("/bovines")}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Regresar</span>
          </button>

          {hasUnsavedChanges && (
            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
              <Info className="w-4 h-4" />
              Cambios sin guardar
            </div>
          )}
        </motion.div>

        {/* Título principal */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Editar Bovino {formData.earTag}
          </motion.h1>
          <motion.p
            className="text-lg text-white/80 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Modifica la información del bovino y guarda los cambios
          </motion.p>
        </motion.div>

        {/* Indicador de cambios */}
        <motion.div variants={itemVariants}>
          <ChangeIndicator changes={changes} />
        </motion.div>

        {/* Formulario principal */}
        <motion.div variants={itemVariants}>
          <form
            onSubmit={handleSubmit}
            className="bg-[#fffdf8]/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 md:p-8 border border-white/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Información básica */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <User className="w-5 h-5 text-[#3d8b40]" />
                  Información Básica
                </h3>

                {/* Arete/ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Arete *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.earTag}
                    onChange={(e) =>
                      handleInputChange("earTag", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent transition-all"
                    placeholder="Ej: MX-001234"
                  />
                </div>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent transition-all"
                    placeholder="Ej: Lupita"
                  />
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) =>
                      handleInputChange(
                        "type",
                        e.target.value as BovineFormData["type"]
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent transition-all"
                  >
                    <option value="CATTLE">Ganado</option>
                    <option value="BULL">Toro</option>
                    <option value="COW">Vaca</option>
                    <option value="CALF">Becerro</option>
                  </select>
                </div>

                {/* Sexo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexo *
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="FEMALE"
                        checked={formData.gender === "FEMALE"}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        className="mr-2 text-[#3d8b40] focus:ring-[#3d8b40]"
                      />
                      Hembra
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="gender"
                        value="MALE"
                        checked={formData.gender === "MALE"}
                        onChange={(e) =>
                          handleInputChange("gender", e.target.value)
                        }
                        className="mr-2 text-[#3d8b40] focus:ring-[#3d8b40]"
                      />
                      Macho
                    </label>
                  </div>
                </div>

                {/* Raza */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Raza *
                  </label>
                  <select
                    required
                    value={formData.breed}
                    onChange={(e) => handleInputChange("breed", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent transition-all"
                  >
                    <option value="">Seleccionar raza</option>
                    {breeds.map((breed) => (
                      <option key={breed} value={breed}>
                        {breed}
                      </option>
                    ))}
                  </select>
                </div>
              </motion.div>

              {/* Información adicional */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <Weight className="w-5 h-5 text-[#3d8b40]" />
                  Información Adicional
                </h3>

                {/* Fecha de nacimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent transition-all text-left flex items-center justify-between"
                  >
                    <span>
                      {formData.birthDate
                        ? formData.birthDate.toLocaleDateString("es-MX")
                        : "Seleccionar fecha"}
                    </span>
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                  </button>

                  {/* Calendario simplificado */}
                  <AnimatePresence>
                    {showCalendar && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-lg"
                      >
                        <input
                          type="date"
                          value={
                            formData.birthDate
                              ? formData.birthDate.toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value)
                              : null;
                            handleInputChange("birthDate", date);
                            setShowCalendar(false);
                          }}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Peso */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) =>
                      handleInputChange(
                        "weight",
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent transition-all"
                    placeholder="Ej: 450.5"
                  />
                </div>

                {/* Madre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arete de la Madre
                  </label>
                  <input
                    type="text"
                    value={formData.motherEarTag || ""}
                    onChange={(e) =>
                      handleInputChange("motherEarTag", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent transition-all"
                    placeholder="Ej: MX-000123"
                  />
                </div>

                {/* Padre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Arete del Padre
                  </label>
                  <input
                    type="text"
                    value={formData.fatherEarTag || ""}
                    onChange={(e) =>
                      handleInputChange("fatherEarTag", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent transition-all"
                    placeholder="Ej: MX-000456"
                  />
                </div>

                {/* Estado de salud */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#3d8b40]" />
                    Estado de Salud
                  </label>
                  <select
                    value={formData.healthStatus}
                    onChange={(e) =>
                      handleInputChange(
                        "healthStatus",
                        e.target.value as BovineFormData["healthStatus"]
                      )
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent transition-all"
                  >
                    <option value="HEALTHY">Saludable</option>
                    <option value="SICK">Enfermo</option>
                    <option value="RECOVERING">En Recuperación</option>
                    <option value="QUARANTINE">En Cuarentena</option>
                    <option value="DECEASED">Fallecido</option>
                  </select>
                </div>
              </motion.div>
            </div>

            {/* Sección de ubicación */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#3d8b40]" />
                Ubicación
              </h3>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#3d8b40] text-white rounded-lg hover:bg-[#2d6e30] transition-all duration-300"
                >
                  <MapIcon className="w-5 h-5" />
                  {formData.location
                    ? "Cambiar Ubicación"
                    : "Seleccionar Ubicación"}
                </button>

                {formData.location && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-800">
                          Ubicación Actual
                        </p>
                        <p className="text-sm text-green-600">
                          {formData.location.address ||
                            `Lat: ${formData.location.latitude.toFixed(
                              6
                            )}, Lng: ${formData.location.longitude.toFixed(6)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <AnimatePresence>
                  {showLocationPicker && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <LocationPicker
                        onLocationSelect={handleLocationSelect}
                        initialLocation={formData.location || undefined}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Notas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent transition-all resize-none"
                placeholder="Información adicional sobre el bovino..."
              />
            </motion.div>

            {/* Botones de acción */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200"
            >
              <button
                type="button"
                onClick={() => handleNavigation("/bovines")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                disabled={isSubmitting}
              >
                Cancelar
              </button>

              {hasUnsavedChanges && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                  disabled={isSubmitting}
                >
                  <RefreshCw className="w-5 h-5" />
                  Resetear
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !hasUnsavedChanges}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[#3d8b40] text-white rounded-lg hover:bg-[#2d6e30] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {hasUnsavedChanges ? "Guardar Cambios" : "Sin Cambios"}
                  </>
                )}
              </button>
            </motion.div>
          </form>
        </motion.div>

        {/* Modal de éxito */}
        <AnimatePresence>
          {showSuccess && (
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
                className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
              >
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ¡Cambios Guardados!
                </h3>
                <p className="text-gray-600 mb-4">
                  La información del bovino ha sido actualizada exitosamente.
                </p>
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#3d8b40]" />
                  <span className="ml-2 text-sm text-gray-600">
                    Redirigiendo...
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default BovineEdit;
