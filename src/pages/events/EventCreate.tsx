import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  User,
  Syringe,
  Heart,
  Stethoscope,
  Package,
  Users,
  DollarSign,
  Save,
  X,
  Plus,
  Map,
  Navigation,
  Star,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

// Interfaces para TypeScript
interface EventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  category: "health" | "reproduction" | "nutrition" | "general" | "vaccination";
  description: string;
  duration?: number; // minutos
  requiresVeterinarian: boolean;
  fields: EventField[];
}

interface EventField {
  id: string;
  name: string;
  type:
    | "text"
    | "number"
    | "date"
    | "time"
    | "select"
    | "multiselect"
    | "textarea"
    | "boolean"
    | "file";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

interface BovineOption {
  id: string;
  name: string;
  tag: string;
  breed: string;
  age: number;
  gender: "male" | "female";
  healthStatus: "healthy" | "sick" | "recovering" | "critical";
  location: string;
}

interface VeterinarianOption {
  id: string;
  name: string;
  license: string;
  phone: string;
  email: string;
  specialization: string;
  clinic?: string;
  rating: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  address: string;
  farm?: string;
  section?: string;
}

interface EventFormData {
  title: string;
  description: string;
  eventType: string;
  date: string;
  time: string;
  duration: number;
  location: LocationData | null;
  bovineIds: string[];
  veterinarianId?: string;
  priority: "low" | "medium" | "high" | "urgent";
  reminderType: "none" | "day" | "week" | "month";
  tags: string[];
  notes: string;
  cost?: number;
  isRecurring: boolean;
  recurringPattern?: {
    frequency: "daily" | "weekly" | "monthly" | "yearly";
    interval: number;
    endDate?: string;
  };
  customFields: Record<string, any>;
  attachments: File[];
}

const EventCreate: React.FC = () => {
  // Estados principales
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    eventType: "",
    date: "",
    time: "",
    duration: 60,
    location: null,
    bovineIds: [],
    veterinarianId: "",
    priority: "medium",
    reminderType: "day",
    tags: [],
    notes: "",
    cost: 0,
    isRecurring: false,
    recurringPattern: undefined,
    customFields: {},
    attachments: [],
  });

  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [totalSteps] = useState(4);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bovineOptions, setBovineOptions] = useState<BovineOption[]>([]);
  const [veterinarianOptions, setVeterinarianOptions] = useState<
    VeterinarianOption[]
  >([]);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [, setShowLocationModal] = useState(false);
  const [tagInput, setTagInput] = useState("");

  // Hooks de React Router
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener el tipo de evento desde los parámetros de la URL si existe
  const urlParams = new URLSearchParams(location.search);
  const preselectedType = urlParams.get("type");

  // Tipos de eventos disponibles
  const eventTypes: EventType[] = [
    {
      id: "vaccination",
      name: "Vacunación",
      icon: Syringe,
      color: "bg-blue-500",
      category: "vaccination",
      description: "Aplicación de vacunas preventivas",
      duration: 30,
      requiresVeterinarian: true,
      fields: [
        {
          id: "vaccine_type",
          name: "vaccine_type",
          type: "select",
          label: "Tipo de Vacuna",
          required: true,
          options: [
            { value: "fmd", label: "Fiebre Aftosa" },
            { value: "brucellosis", label: "Brucelosis" },
            { value: "rabies", label: "Rabia" },
            { value: "clostridiosis", label: "Clostridiosis" },
            { value: "other", label: "Otra" },
          ],
        },
        {
          id: "dose_number",
          name: "dose_number",
          type: "number",
          label: "Número de Dosis",
          required: true,
          validation: { min: 1, max: 10 },
        },
        {
          id: "batch_number",
          name: "batch_number",
          type: "text",
          label: "Número de Lote",
          required: true,
          placeholder: "Ej: VB2024-001",
        },
      ],
    },
    {
      id: "health_check",
      name: "Revisión de Salud",
      icon: Stethoscope,
      color: "bg-green-500",
      category: "health",
      description: "Examen general de salud del ganado",
      duration: 45,
      requiresVeterinarian: true,
      fields: [
        {
          id: "check_type",
          name: "check_type",
          type: "select",
          label: "Tipo de Revisión",
          required: true,
          options: [
            { value: "routine", label: "Rutinaria" },
            { value: "symptoms", label: "Por Síntomas" },
            { value: "follow_up", label: "Seguimiento" },
            { value: "pre_breeding", label: "Pre-reproducción" },
          ],
        },
        {
          id: "temperature",
          name: "temperature",
          type: "number",
          label: "Temperatura (°C)",
          required: false,
          validation: { min: 35, max: 42 },
        },
        {
          id: "weight",
          name: "weight",
          type: "number",
          label: "Peso (kg)",
          required: false,
          validation: { min: 50, max: 1500 },
        },
      ],
    },
    {
      id: "breeding",
      name: "Reproducción",
      icon: Heart,
      color: "bg-pink-500",
      category: "reproduction",
      description: "Eventos relacionados con reproducción",
      duration: 60,
      requiresVeterinarian: false,
      fields: [
        {
          id: "breeding_type",
          name: "breeding_type",
          type: "select",
          label: "Tipo de Reproducción",
          required: true,
          options: [
            { value: "natural", label: "Monta Natural" },
            { value: "artificial", label: "Inseminación Artificial" },
            { value: "pregnancy_check", label: "Diagnóstico de Preñez" },
            { value: "calving", label: "Parto" },
          ],
        },
        {
          id: "bull_tag",
          name: "bull_tag",
          type: "text",
          label: "Arete del Toro",
          required: false,
          placeholder: "Ej: TORO-001",
        },
      ],
    },
    {
      id: "nutrition",
      name: "Alimentación",
      icon: Package,
      color: "bg-orange-500",
      category: "nutrition",
      description: "Control de alimentación y suplementos",
      duration: 30,
      requiresVeterinarian: false,
      fields: [
        {
          id: "feed_type",
          name: "feed_type",
          type: "select",
          label: "Tipo de Alimento",
          required: true,
          options: [
            { value: "concentrate", label: "Concentrado" },
            { value: "forage", label: "Forraje" },
            { value: "supplement", label: "Suplemento" },
            { value: "medication", label: "Medicamento" },
          ],
        },
        {
          id: "quantity",
          name: "quantity",
          type: "number",
          label: "Cantidad (kg)",
          required: true,
          validation: { min: 0.1, max: 100 },
        },
      ],
    },
    {
      id: "transport",
      name: "Transporte",
      icon: Users,
      color: "bg-purple-500",
      category: "general",
      description: "Movimiento de ganado entre ubicaciones",
      duration: 120,
      requiresVeterinarian: false,
      fields: [
        {
          id: "destination",
          name: "destination",
          type: "text",
          label: "Destino",
          required: true,
          placeholder: "Ubicación de destino",
        },
        {
          id: "transport_type",
          name: "transport_type",
          type: "select",
          label: "Tipo de Transporte",
          required: true,
          options: [
            { value: "truck", label: "Camión" },
            { value: "trailer", label: "Tráiler" },
            { value: "walking", label: "A pie" },
            { value: "other", label: "Otro" },
          ],
        },
      ],
    },
    {
      id: "sale",
      name: "Venta",
      icon: DollarSign,
      color: "bg-emerald-500",
      category: "general",
      description: "Registro de venta de ganado",
      duration: 90,
      requiresVeterinarian: false,
      fields: [
        {
          id: "buyer_name",
          name: "buyer_name",
          type: "text",
          label: "Nombre del Comprador",
          required: true,
          placeholder: "Nombre completo",
        },
        {
          id: "sale_price",
          name: "sale_price",
          type: "number",
          label: "Precio de Venta",
          required: true,
          validation: { min: 0 },
        },
        {
          id: "payment_method",
          name: "payment_method",
          type: "select",
          label: "Método de Pago",
          required: true,
          options: [
            { value: "cash", label: "Efectivo" },
            { value: "transfer", label: "Transferencia" },
            { value: "check", label: "Cheque" },
            { value: "credit", label: "Crédito" },
          ],
        },
      ],
    },
  ];

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        // Simular carga de bovinos disponibles
        const mockBovines: BovineOption[] = [
          {
            id: "bov_001",
            name: "Esperanza",
            tag: "ESP-001",
            breed: "Holstein",
            age: 3,
            gender: "female",
            healthStatus: "healthy",
            location: "Sector Norte",
          },
          {
            id: "bov_002",
            name: "Paloma",
            tag: "PAL-002",
            breed: "Jersey",
            age: 2,
            gender: "female",
            healthStatus: "healthy",
            location: "Sector Sur",
          },
          {
            id: "bov_003",
            name: "Tormenta",
            tag: "TOR-003",
            breed: "Angus",
            age: 4,
            gender: "male",
            healthStatus: "healthy",
            location: "Sector Este",
          },
        ];

        // Simular carga de veterinarios disponibles
        const mockVeterinarians: VeterinarianOption[] = [
          {
            id: "vet_001",
            name: "Dr. María García",
            license: "VET-2024-001",
            phone: "+52 993 123 4567",
            email: "maria.garcia@vet.com",
            specialization: "Bovinos",
            clinic: "Clínica Veterinaria El Campo",
            rating: 4.9,
          },
          {
            id: "vet_002",
            name: "Dr. Carlos López",
            license: "VET-2024-002",
            phone: "+52 993 987 6543",
            email: "carlos.lopez@vet.com",
            specialization: "Reproducción",
            clinic: "Centro Veterinario Tabasco",
            rating: 4.7,
          },
        ];

        setBovineOptions(mockBovines);
        setVeterinarianOptions(mockVeterinarians);

        // Si hay un tipo preseleccionado, establecerlo
        if (preselectedType) {
          const selectedType = eventTypes.find(
            (type) => type.id === preselectedType
          );
          if (selectedType) {
            setFormData((prev) => ({
              ...prev,
              eventType: selectedType.id,
              title: selectedType.name,
              duration: selectedType.duration || 60,
            }));
          }
        }
      } catch (error) {
        console.error("Error cargando datos iniciales:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [preselectedType]);

  // Obtener la ubicación actual del usuario
  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocalización no soportada");
      }

      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // Simular reverse geocoding
      const address = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(
        6
      )}`;

      const locationData: LocationData = {
        latitude,
        longitude,
        address,
        farm: "Rancho El Progreso",
        section: "Determinado por GPS",
      };

      setFormData((prev) => ({
        ...prev,
        location: locationData,
      }));
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      alert(
        "No se pudo obtener la ubicación actual. Por favor, ingresa la ubicación manualmente."
      );
    } finally {
      setIsLoadingLocation(false);
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validaciones básicas
    if (!formData.title.trim()) {
      newErrors.title = "El título es requerido";
    }

    if (!formData.eventType) {
      newErrors.eventType = "Selecciona un tipo de evento";
    }

    if (!formData.date) {
      newErrors.date = "La fecha es requerida";
    }

    if (!formData.time) {
      newErrors.time = "La hora es requerida";
    }

    if (formData.bovineIds.length === 0) {
      newErrors.bovineIds = "Selecciona al menos un bovino";
    }

    if (!formData.location) {
      newErrors.location = "La ubicación es requerida";
    }

    // Validar campos específicos del tipo de evento
    const selectedEventType = eventTypes.find(
      (type) => type.id === formData.eventType
    );
    if (selectedEventType) {
      selectedEventType.fields.forEach((field) => {
        if (field.required && !formData.customFields[field.name]) {
          newErrors[field.name] = `${field.label} es requerido`;
        }

        // Validaciones numéricas
        if (
          field.type === "number" &&
          formData.customFields[field.name] &&
          field.validation
        ) {
          const value = Number(formData.customFields[field.name]);
          if (
            field.validation.min !== undefined &&
            value < field.validation.min
          ) {
            newErrors[
              field.name
            ] = `El valor mínimo es ${field.validation.min}`;
          }
          if (
            field.validation.max !== undefined &&
            value > field.validation.max
          ) {
            newErrors[
              field.name
            ] = `El valor máximo es ${field.validation.max}`;
          }
        }
      });

      // Validar veterinario si es requerido
      if (selectedEventType.requiresVeterinarian && !formData.veterinarianId) {
        newErrors.veterinarianId = "Selecciona un veterinario";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simular envío al backend
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Datos del evento:", formData);

      // Mostrar éxito y navegar de vuelta
      alert("Evento creado exitosamente");
      navigate("/events");
    } catch (error) {
      console.error("Error creando evento:", error);
      alert("Error al crear el evento. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error si existe
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Manejar cambios en campos personalizados
  const handleCustomFieldChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [fieldName]: value,
      },
    }));

    // Limpiar error si existe
    if (errors[fieldName]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  // Agregar tag
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  // Remover tag
  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  // Obtener el tipo de evento seleccionado
  const selectedEventType = eventTypes.find(
    (type) => type.id === formData.eventType
  );

  // Renderizar campos específicos del tipo de evento
  const renderCustomFields = () => {
    if (!selectedEventType) return null;

    return selectedEventType.fields.map((field) => (
      <div key={field.id} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {field.type === "text" && (
          <input
            type="text"
            value={formData.customFields[field.name] || ""}
            onChange={(e) =>
              handleCustomFieldChange(field.name, e.target.value)
            }
            placeholder={field.placeholder}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 ${
              errors[field.name] ? "border-red-500" : "border-gray-200"
            }`}
          />
        )}

        {field.type === "number" && (
          <input
            type="number"
            value={formData.customFields[field.name] || ""}
            onChange={(e) =>
              handleCustomFieldChange(field.name, Number(e.target.value))
            }
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 ${
              errors[field.name] ? "border-red-500" : "border-gray-200"
            }`}
          />
        )}

        {field.type === "select" && (
          <select
            value={formData.customFields[field.name] || ""}
            onChange={(e) =>
              handleCustomFieldChange(field.name, e.target.value)
            }
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 ${
              errors[field.name] ? "border-red-500" : "border-gray-200"
            }`}
          >
            <option value="">Seleccionar...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {field.type === "textarea" && (
          <textarea
            value={formData.customFields[field.name] || ""}
            onChange={(e) =>
              handleCustomFieldChange(field.name, e.target.value)
            }
            placeholder={field.placeholder}
            rows={3}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 resize-none ${
              errors[field.name] ? "border-red-500" : "border-gray-200"
            }`}
          />
        )}

        {errors[field.name] && (
          <p className="text-red-500 text-sm">{errors[field.name]}</p>
        )}
      </div>
    ));
  };

  // Pasos del formulario
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Información Básica
              </h2>
              <p className="text-gray-600">
                Configura los detalles principales del evento
              </p>
            </div>

            {/* Tipo de Evento */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Tipo de Evento <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventTypes.map((type) => (
                  <motion.div
                    key={type.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleInputChange("eventType", type.id)}
                    className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.eventType === type.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${type.color} text-white`}
                      >
                        <type.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {type.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {type.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              {errors.eventType && (
                <p className="text-red-500 text-sm">{errors.eventType}</p>
              )}
            </div>

            {/* Título y Descripción */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título del Evento <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Ej: Vacunación mensual"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 ${
                    errors.title ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-500 text-sm">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Duración (minutos)
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) =>
                    handleInputChange("duration", Number(e.target.value))
                  }
                  min="5"
                  max="480"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Descripción detallada del evento..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 resize-none"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Fecha y Ubicación
              </h2>
              <p className="text-gray-600">
                Establece cuándo y dónde se realizará el evento
              </p>
            </div>

            {/* Fecha y Hora */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fecha <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 ${
                    errors.date ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.date && (
                  <p className="text-red-500 text-sm">{errors.date}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Hora <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange("time", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 ${
                    errors.time ? "border-red-500" : "border-gray-200"
                  }`}
                />
                {errors.time && (
                  <p className="text-red-500 text-sm">{errors.time}</p>
                )}
              </div>
            </div>

            {/* Ubicación */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Ubicación <span className="text-red-500">*</span>
              </label>

              {formData.location ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900">
                          {formData.location.address}
                        </p>
                        {formData.location.farm && (
                          <p className="text-sm text-green-700">
                            {formData.location.farm} -{" "}
                            {formData.location.section}
                          </p>
                        )}
                        <p className="text-xs text-green-600 mt-1">
                          Lat: {formData.location.latitude.toFixed(6)}, Lng:{" "}
                          {formData.location.longitude.toFixed(6)}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, location: null }))
                      }
                      className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={getCurrentLocation}
                    disabled={isLoadingLocation}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isLoadingLocation ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Navigation className="h-5 w-5" />
                    )}
                    <span>
                      {isLoadingLocation
                        ? "Obteniendo..."
                        : "Usar Ubicación Actual"}
                    </span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLocationModal(true)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <Map className="h-5 w-5" />
                    <span>Seleccionar en Mapa</span>
                  </motion.button>
                </div>
              )}

              {errors.location && (
                <p className="text-red-500 text-sm">{errors.location}</p>
              )}
            </div>

            {/* Prioridad y Recordatorio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Prioridad
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    handleInputChange("priority", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Recordatorio
                </label>
                <select
                  value={formData.reminderType}
                  onChange={(e) =>
                    handleInputChange("reminderType", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                >
                  <option value="none">Sin recordatorio</option>
                  <option value="day">1 día antes</option>
                  <option value="week">1 semana antes</option>
                  <option value="month">1 mes antes</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Bovinos y Personal
              </h2>
              <p className="text-gray-600">
                Selecciona los animales y personal involucrado
              </p>
            </div>

            {/* Selección de Bovinos */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Bovinos <span className="text-red-500">*</span>
              </label>

              <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-xl bg-white/80">
                {bovineOptions.map((bovine) => (
                  <div
                    key={bovine.id}
                    className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors"
                  >
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.bovineIds.includes(bovine.id)}
                        onChange={(e) => {
                          const newIds = e.target.checked
                            ? [...formData.bovineIds, bovine.id]
                            : formData.bovineIds.filter(
                                (id) => id !== bovine.id
                              );
                          handleInputChange("bovineIds", newIds);
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              {bovine.name} ({bovine.tag})
                            </p>
                            <p className="text-sm text-gray-600">
                              {bovine.breed} • {bovine.age} años •{" "}
                              {bovine.gender === "male" ? "Macho" : "Hembra"}
                            </p>
                          </div>
                          <div className="text-right">
                            <span
                              className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                bovine.healthStatus === "healthy"
                                  ? "bg-green-100 text-green-800"
                                  : bovine.healthStatus === "sick"
                                  ? "bg-red-100 text-red-800"
                                  : bovine.healthStatus === "recovering"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {bovine.healthStatus === "healthy"
                                ? "Saludable"
                                : bovine.healthStatus === "sick"
                                ? "Enfermo"
                                : bovine.healthStatus === "recovering"
                                ? "Recuperándose"
                                : "Crítico"}
                            </span>
                            <p className="text-xs text-gray-500 mt-1">
                              {bovine.location}
                            </p>
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              {errors.bovineIds && (
                <p className="text-red-500 text-sm">{errors.bovineIds}</p>
              )}
            </div>

            {/* Veterinario (si es requerido) */}
            {selectedEventType?.requiresVeterinarian && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Veterinario <span className="text-red-500">*</span>
                </label>

                <div className="space-y-3">
                  {veterinarianOptions.map((vet) => (
                    <motion.div
                      key={vet.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() =>
                        handleInputChange("veterinarianId", vet.id)
                      }
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.veterinarianId === vet.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {vet.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {vet.specialization}
                            </p>
                            <p className="text-xs text-gray-500">
                              {vet.clinic}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1 mb-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="text-sm font-medium">
                              {vet.rating}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{vet.phone}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {errors.veterinarianId && (
                  <p className="text-red-500 text-sm">
                    {errors.veterinarianId}
                  </p>
                )}
              </div>
            )}

            {/* Costo estimado */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Costo Estimado ($)
              </label>
              <input
                type="number"
                value={formData.cost || ""}
                onChange={(e) =>
                  handleInputChange("cost", Number(e.target.value))
                }
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Detalles Específicos
              </h2>
              <p className="text-gray-600">
                Completa la información específica del evento
              </p>
            </div>

            {/* Campos específicos del tipo de evento */}
            {selectedEventType && selectedEventType.fields.length > 0 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Información Específica de {selectedEventType.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderCustomFields()}
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Etiquetas
              </label>

              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    <span>{tag}</span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeTag(tag)}
                      className="hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </motion.button>
                  </span>
                ))}
              </div>

              <div className="flex space-x-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addTag()}
                  placeholder="Agregar etiqueta..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={addTag}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </motion.button>
              </div>
            </div>

            {/* Notas */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Notas Adicionales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Información adicional, observaciones, instrucciones especiales..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 resize-none"
              />
            </div>

            {/* Evento recurrente */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={formData.isRecurring}
                  onChange={(e) =>
                    handleInputChange("isRecurring", e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isRecurring"
                  className="text-sm font-medium text-gray-700"
                >
                  Evento Recurrente
                </label>
              </div>

              {formData.isRecurring && (
                <div className="pl-6 space-y-4 border-l-2 border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Frecuencia
                      </label>
                      <select
                        value={formData.recurringPattern?.frequency || "weekly"}
                        onChange={(e) =>
                          handleInputChange("recurringPattern", {
                            ...formData.recurringPattern,
                            frequency: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                      >
                        <option value="daily">Diario</option>
                        <option value="weekly">Semanal</option>
                        <option value="monthly">Mensual</option>
                        <option value="yearly">Anual</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Intervalo
                      </label>
                      <input
                        type="number"
                        value={formData.recurringPattern?.interval || 1}
                        onChange={(e) =>
                          handleInputChange("recurringPattern", {
                            ...formData.recurringPattern,
                            interval: Number(e.target.value),
                          })
                        }
                        min="1"
                        max="12"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Fecha de Finalización
                    </label>
                    <input
                      type="date"
                      value={formData.recurringPattern?.endDate || ""}
                      onChange={(e) =>
                        handleInputChange("recurringPattern", {
                          ...formData.recurringPattern,
                          endDate: e.target.value,
                        })
                      }
                      min={formData.date}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading && !preselectedType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Cargando formulario...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/events")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </motion.button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Crear Nuevo Evento
                </h1>
                <p className="text-gray-600">
                  Paso {currentStep} de {totalSteps} -{" "}
                  {currentStep === 1
                    ? "Información Básica"
                    : currentStep === 2
                    ? "Fecha y Ubicación"
                    : currentStep === 3
                    ? "Bovinos y Personal"
                    : "Detalles Específicos"}
                </p>
              </div>
            </div>

            {/* Progreso */}
            <div className="flex items-center space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    i + 1 <= currentStep ? "bg-blue-600" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Contenido del formulario */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8">
          {renderStep()}

          {/* Botones de navegación */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Anterior</span>
            </motion.button>

            <div className="flex items-center space-x-3">
              {currentStep < totalSteps ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setCurrentStep((prev) => Math.min(totalSteps, prev + 1))
                  }
                  className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <span>Siguiente</span>
                  <ArrowLeft className="h-4 w-4 rotate-180" />
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  <span>{loading ? "Creando..." : "Crear Evento"}</span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventCreate;
