import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  MapPin,
  Save,
  X,
  Syringe,
  Heart,
  Stethoscope,
  AlertTriangle,
  Baby,
  Package,
  Beef,
  ChevronDown,
  Users,
  FileText,
  Map,
  CheckCircle,
  Loader,
  Cog,
} from "lucide-react";

// Interfaces para TypeScript
interface CreateEventFormData {
  title: string;
  description: string;
  eventType: EventType;
  date: string;
  time: string;
  duration: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  bovineIds: string[];
  priority: "low" | "medium" | "high" | "urgent";
  reminderType: "none" | "day" | "week" | "month";
  tags: string[];
  notes: string;
  attachments: File[];
  veterinarian?: string;
  cost?: number;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
}

interface EventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  category: "health" | "reproduction" | "nutrition" | "general";
}

interface RecurringPattern {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval: number;
  endDate?: string;
  occurrences?: number;
}

interface BovineMock {
  id: string;
  name: string;
  tag: string;
  breed: string;
  age: number;
  gender: "male" | "female";
}

// Tipos de eventos disponibles
const eventTypes: EventType[] = [
  {
    id: "vaccination",
    name: "Vacunación",
    icon: Syringe,
    color: "bg-green-500",
    category: "health",
  },
  {
    id: "illness",
    name: "Enfermedad",
    icon: Heart,
    color: "bg-red-500",
    category: "health",
  },
  {
    id: "checkup",
    name: "Revisión Médica",
    icon: Stethoscope,
    color: "bg-blue-500",
    category: "health",
  },
  {
    id: "birth",
    name: "Parto",
    icon: Baby,
    color: "bg-pink-500",
    category: "reproduction",
  },
  {
    id: "breeding",
    name: "Monta/Inseminación",
    icon: Users,
    color: "bg-purple-500",
    category: "reproduction",
  },
  {
    id: "feeding",
    name: "Alimentación Especial",
    icon: Package,
    color: "bg-orange-500",
    category: "nutrition",
  },
  {
    id: "emergency",
    name: "Emergencia",
    icon: AlertTriangle,
    color: "bg-yellow-500",
    category: "health",
  },
  {
    id: "general",
    name: "Evento General",
    icon: FileText,
    color: "bg-gray-500",
    category: "general",
  },
];

// Mock data para bovinos (simulando base de datos)
const mockBovines: BovineMock[] = [
  {
    id: "1",
    name: "Luna",
    tag: "B001",
    breed: "Holstein",
    age: 3,
    gender: "female",
  },
  {
    id: "2",
    name: "Toro Alpha",
    tag: "B002",
    breed: "Angus",
    age: 5,
    gender: "male",
  },
  {
    id: "3",
    name: "Bella",
    tag: "B003",
    breed: "Jersey",
    age: 2,
    gender: "female",
  },
  {
    id: "4",
    name: "Max",
    tag: "B004",
    breed: "Simmental",
    age: 4,
    gender: "male",
  },
  {
    id: "5",
    name: "Rosa",
    tag: "B005",
    breed: "Charolais",
    age: 3,
    gender: "female",
  },
];

// Componente para simular selección de ubicación (reemplaza Leaflet temporalmente)
const LocationPicker: React.FC<{
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  selectedLocation: { lat: number; lng: number } | null;
}> = ({ onLocationSelect, selectedLocation }) => {
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Simular coordenadas basadas en la posición del clic
    const lat = 20.5888 + (y - 200) * 0.001;
    const lng = -100.3899 + (x - 200) * 0.001;

    onLocationSelect({ lat, lng });
  };

  return (
    <div
      className="w-full h-96 bg-green-100 rounded-lg relative cursor-crosshair overflow-hidden"
      onClick={handleMapClick}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23059669' fill-opacity='0.05'%3E%3Cpath d='M20 20.5V18H0v-2h20v-2H0v-2h20v-2H0V8h20V6H0V4h20V2H0V0h22v20h2V0h2v20h2V0h2v20h2V0h2v20h2V0h2v22H20v-1.5zM0 20h2v20H0V20zm4 0h2v20H4V20zm4 0h2v20H8V20zm4 0h2v20h-2V20zm4 0h2v20h-2V20zm4 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2zm0 4h20v2H20v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {/* Simular un mapa con cuadrícula */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-green-700 pointer-events-none">
          <MapPin className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm font-medium">
            Haz clic para seleccionar ubicación
          </p>
          <p className="text-xs text-green-600">
            Mapa simulado - Querétaro, México
          </p>
        </div>
      </div>

      {/* Marcador de ubicación seleccionada */}
      {selectedLocation && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg"
          style={{
            left: `${(selectedLocation.lng + 100.3899) / 0.001 + 200 - 12}px`,
            top: `${200 - (selectedLocation.lat - 20.5888) / 0.001 - 12}px`,
          }}
        >
          <div className="absolute -top-8 -left-8 w-16 text-center">
            <div className="bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              Ubicación
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Componente principal CreateEvent
const CreateEvent: React.FC = () => {
  // Estados del formulario
  const [formData, setFormData] = useState<CreateEventFormData>({
    title: "",
    description: "",
    eventType: eventTypes[0],
    date: "",
    time: "",
    duration: 60,
    location: {
      lat: 20.5888, // Coordenadas de Querétaro, México
      lng: -100.3899,
      address: "",
    },
    bovineIds: [],
    priority: "medium",
    reminderType: "day",
    tags: [],
    notes: "",
    attachments: [],
    veterinarian: "",
    cost: 0,
    isRecurring: false,
  });

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [showEventTypeDropdown, setShowEventTypeDropdown] = useState(false);
  const [searchBovine, setSearchBovine] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Efectos
  useEffect(() => {
    // Configurar fecha y hora por defecto (ahora + 1 hora)
    const now = new Date();
    const defaultDate = new Date(now.getTime() + 60 * 60 * 1000);

    setFormData((prev) => ({
      ...prev,
      date: defaultDate.toISOString().split("T")[0],
      time: defaultDate.toTimeString().slice(0, 5),
    }));
  }, []);

  // Función para validar el formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido";
    }

    if (!formData.date) {
      newErrors.date = "La fecha es requerida";
    }

    if (!formData.time) {
      newErrors.time = "La hora es requerida";
    }

    if (formData.bovineIds.length === 0) {
      newErrors.bovines = "Debe seleccionar al menos un bovino";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Aquí iría la lógica para enviar los datos al backend
      console.log("Datos del evento a enviar:", formData);

      // Redireccionar o mostrar mensaje de éxito
      alert("Evento creado exitosamente");
    } catch (error) {
      console.error("Error al crear el evento:", error);
      alert("Error al crear el evento");
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar selección de ubicación en el mapa
  const handleLocationSelect = (location: { lat: number; lng: number }) => {
    setSelectedLocation(location);
    setFormData((prev) => ({
      ...prev,
      location: {
        ...location,
        address: `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`,
      },
    }));
  };

  // Manejar selección de bovinos
  const toggleBovineSelection = (bovineId: string) => {
    setFormData((prev) => ({
      ...prev,
      bovineIds: prev.bovineIds.includes(bovineId)
        ? prev.bovineIds.filter((id) => id !== bovineId)
        : [...prev.bovineIds, bovineId],
    }));
  };

  // Manejar tags
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Filtrar bovinos según búsqueda
  const filteredBovines = mockBovines.filter(
    (bovine) =>
      bovine.name.toLowerCase().includes(searchBovine.toLowerCase()) ||
      bovine.tag.toLowerCase().includes(searchBovine.toLowerCase()) ||
      bovine.breed.toLowerCase().includes(searchBovine.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Nuevo Evento
          </h1>
          <p className="text-gray-600">
            Registra eventos importantes para el manejo de tu ganado
          </p>
        </motion.div>

        {/* Formulario */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-8 space-y-8"
        >
          {/* Información Básica */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              Información Básica
            </h2>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Evento *
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ej: Vacunación antirrábica - Lote A"
              />
              {errors.title && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm mt-1"
                >
                  {errors.title}
                </motion.p>
              )}
            </div>

            {/* Tipo de Evento */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Evento *
              </label>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={() => setShowEventTypeDropdown(!showEventTypeDropdown)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all flex items-center justify-between bg-white"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${formData.eventType.color}`}
                  />
                  <formData.eventType.icon className="w-5 h-5 text-gray-600" />
                  <span>{formData.eventType.name}</span>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    showEventTypeDropdown ? "rotate-180" : ""
                  }`}
                />
              </motion.button>

              <AnimatePresence>
                {showEventTypeDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
                  >
                    {eventTypes.map((type) => (
                      <motion.button
                        key={type.id}
                        whileHover={{ backgroundColor: "#f9fafb" }}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, eventType: type }));
                          setShowEventTypeDropdown(false);
                        }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className={`w-3 h-3 rounded-full ${type.color}`} />
                        <type.icon className="w-5 h-5 text-gray-600" />
                        <span className="text-left">{type.name}</span>
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.01 }}
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Describe los detalles del evento..."
              />
            </div>
          </div>

          {/* Fecha y Hora */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Fecha y Hora
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.date ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.date && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.date}
                  </motion.p>
                )}
              </div>

              {/* Hora */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hora *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="time"
                  value={formData.time}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, time: e.target.value }))
                  }
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.time ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.time && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-1"
                  >
                    {errors.time}
                  </motion.p>
                )}
              </div>

              {/* Duración */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duración (minutos)
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration: parseInt(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-500" />
              Ubicación
            </h2>

            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="w-full px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Map className="w-5 h-5 text-blue-600" />
                {showMap ? "Ocultar Mapa" : "Seleccionar en Mapa"}
              </motion.button>

              <AnimatePresence>
                {showMap && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 400 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden rounded-lg border border-gray-300"
                  >
                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      selectedLocation={selectedLocation}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {selectedLocation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-800">
                    Ubicación seleccionada: {selectedLocation.lat.toFixed(6)},{" "}
                    {selectedLocation.lng.toFixed(6)}
                  </span>
                </motion.div>
              )}
            </div>
          </div>

          {/* Selección de Bovinos */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Beef className="w-5 h-5 text-blue-500" />
              Bovinos *
            </h2>

            <div className="space-y-4">
              {/* Buscador */}
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="text"
                placeholder="Buscar por nombre, etiqueta o raza..."
                value={searchBovine}
                onChange={(e) => setSearchBovine(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />

              {/* Lista de bovinos */}
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredBovines.map((bovine) => (
                  <motion.div
                    key={bovine.id}
                    whileHover={{ backgroundColor: "#f9fafb" }}
                    className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.bovineIds.includes(bovine.id)}
                        onChange={() => toggleBovineSelection(bovine.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {bovine.name}
                          </span>
                          <span className="text-sm text-gray-500">
                            ({bovine.tag})
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {bovine.breed} • {bovine.age} años •{" "}
                          {bovine.gender === "male" ? "Macho" : "Hembra"}
                        </div>
                      </div>
                    </label>
                  </motion.div>
                ))}
              </div>

              {errors.bovines && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 text-sm"
                >
                  {errors.bovines}
                </motion.p>
              )}

              {/* Bovinos seleccionados */}
              {formData.bovineIds.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                >
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    Bovinos seleccionados ({formData.bovineIds.length}):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.bovineIds.map((id) => {
                      const bovine = mockBovines.find((b) => b.id === id);
                      return bovine ? (
                        <span
                          key={id}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
                        >
                          {bovine.name} ({bovine.tag})
                        </span>
                      ) : null;
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Detalles Adicionales */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Cog className="w-5 h-5 text-blue-500" />
              Detalles Adicionales
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Prioridad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridad
                </label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      priority: e.target.value as any,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </motion.select>
              </div>

              {/* Recordatorio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recordatorio
                </label>
                <motion.select
                  whileFocus={{ scale: 1.01 }}
                  value={formData.reminderType}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      reminderType: e.target.value as any,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                >
                  <option value="none">Sin recordatorio</option>
                  <option value="day">1 día antes</option>
                  <option value="week">1 semana antes</option>
                  <option value="month">1 mes antes</option>
                </motion.select>
              </div>

              {/* Veterinario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Veterinario
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  value={formData.veterinarian}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      veterinarian: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Nombre del veterinario"
                />
              </div>

              {/* Costo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Costo Estimado ($)
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      cost: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiquetas
              </label>
              <div className="flex gap-2 mb-2">
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Agregar etiqueta..."
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  +
                </motion.button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas Adicionales
              </label>
              <motion.textarea
                whileFocus={{ scale: 1.01 }}
                value={formData.notes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Información adicional sobre el evento..."
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4 pt-6 border-t border-gray-200"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Crear Evento
                </>
              )}
            </motion.button>
          </motion.div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default CreateEvent;
