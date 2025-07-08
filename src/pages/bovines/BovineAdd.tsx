import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Save,
  ArrowLeft,
  Loader2,
  CheckCircle,
  MapIcon,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// Importar el componente Calendar desde el índice centralizado de componentes UI
import { Calendar } from "../../components/ui";

// Tipos e interfaces para el formulario de bovinos
interface BovineFormData {
  earTag: string;
  name?: string;
  type: "CATTLE" | "BULL" | "COW" | "CALF";
  breed: string;
  gender: "MALE" | "FEMALE";
  birthDate: Date | null;
  weight: number;
  motherEarTag?: string;
  fatherEarTag?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  } | null;
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

// Componente simplificado para seleccionar ubicación
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

// Componente principal para agregar bovinos
const BovineAdd: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<BovineFormData>({
    earTag: "",
    name: "",
    type: "CATTLE",
    breed: "",
    gender: "FEMALE",
    birthDate: null,
    weight: 0,
    motherEarTag: "",
    fatherEarTag: "",
    location: null,
    healthStatus: "HEALTHY",
    notes: "",
    photos: [],
  });

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
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Manejar selección de fecha en el calendario
  const handleDateSelect = (date: Date) => {
    setFormData((prev) => ({
      ...prev,
      birthDate: date,
    }));
    setShowCalendar(false);
  };

  // Manejar selección de ubicación
  const handleLocationSelect = (location: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      location,
    }));
    setShowLocationPicker(false);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simular envío al backend
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setShowSuccess(true);
      setTimeout(() => {
        navigate("/bovines");
      }, 2000);
    } catch (error) {
      console.error("Error al guardar el bovino:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        {/* Header con botón de regreso */}
        <motion.div variants={itemVariants} className="flex items-center mb-6">
          <button
            onClick={() => navigate("/bovines")}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Regresar</span>
          </button>
        </motion.div>

        {/* Título principal con animación de texto */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <motion.h1
            className="text-4xl md:text-5xl font-bold text-white mb-4"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            Registrar Nuevo Bovino
          </motion.h1>
          <motion.p
            className="text-lg text-white/80 max-w-2xl mx-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Completa la información para agregar un nuevo animal al registro
            ganadero
          </motion.p>
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
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
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
                    value={formData.name}
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
                <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
                  Información Adicional
                </h3>

                {/* Fecha de nacimiento con Calendar de shadcn/ui */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCalendar(!showCalendar)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent transition-all text-left flex items-center justify-between bg-white hover:bg-gray-50"
                  >
                    <span
                      className={
                        formData.birthDate ? "text-gray-900" : "text-gray-500"
                      }
                    >
                      {formData.birthDate
                        ? formData.birthDate.toLocaleDateString("es-MX", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Seleccionar fecha de nacimiento"}
                    </span>
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                  </button>

                  {/* Calendario de shadcn/ui */}
                  <AnimatePresence>
                    {showCalendar && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 mt-2 p-4 bg-white border border-gray-300 rounded-lg shadow-xl"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium text-gray-700">
                            Seleccionar Fecha de Nacimiento
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowCalendar(false)}
                            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                          >
                            ×
                          </button>
                        </div>
                        <Calendar
                          mode="single"
                          selectedDate={formData.birthDate || undefined}
                          onDateSelect={handleDateSelect}
                          locale="es"
                          maxDate={new Date()} // No permitir fechas futuras
                          className="rounded-lg border border-gray-200"
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
                    value={formData.motherEarTag}
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
                    value={formData.fatherEarTag}
                    onChange={(e) =>
                      handleInputChange("fatherEarTag", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3d8b40] focus:border-transparent transition-all"
                    placeholder="Ej: MX-000456"
                  />
                </div>

                {/* Estado de salud */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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
              <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
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
                          Ubicación Seleccionada
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
                value={formData.notes}
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
                onClick={() => navigate("/bovines")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.earTag || !formData.breed}
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
                    Guardar Bovino
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
                  ¡Bovino Registrado!
                </h3>
                <p className="text-gray-600 mb-4">
                  El bovino ha sido agregado exitosamente al sistema.
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

export default BovineAdd;
