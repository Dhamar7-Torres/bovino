import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Stethoscope,
  Calendar,
  Search,
  Filter,
  Plus,
  MapPin,
  FileText,
  Syringe,
  Thermometer,
  Pill,
  Activity,
  Eye,
  User,
  Tag,
  TrendingUp,
  History,
  X,
  Save,
} from "lucide-react";

// Interfaces para tipos de datos
interface MedicalEvent {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  eventType:
    | "vaccination"
    | "illness"
    | "treatment"
    | "checkup"
    | "surgery"
    | "medication"
    | "exam"
    | "observation";
  title: string;
  description: string;
  date: Date;
  veterinarian: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    facility: string;
  };
  severity?: "low" | "medium" | "high" | "critical";
  status: "active" | "completed" | "ongoing" | "cancelled";
  medications?: string[];
  diagnosis?: string;
  treatment?: string;
  followUpDate?: Date;
  cost: number;
  attachments: string[];
  notes: string;
  vitalSigns?: {
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    weight: number;
  };
}

interface AnimalProfile {
  id: string;
  name: string;
  tag: string;
  breed: string;
  birthDate: Date;
  gender: "male" | "female";
  currentWeight: number;
  healthStatus: "healthy" | "sick" | "recovering" | "critical";
  lastCheckup: Date;
  totalEvents: number;
  chronicConditions: string[];
  allergies: string[];
}

interface HealthStats {
  totalEvents: number;
  vaccinationsCount: number;
  illnessesCount: number;
  treatmentsCount: number;
  averageRecoveryTime: number;
  healthScore: number;
  lastEventDate: Date;
}

interface NewEventForm {
  animalId: string;
  eventType: string;
  title: string;
  description: string;
  date: string;
  veterinarian: string;
  severity?: string;
  status: string;
  medications: string;
  diagnosis: string;
  treatment: string;
  followUpDate: string;
  cost: number;
  notes: string;
  vitalSigns: {
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    weight: number;
  };
}

// Componentes reutilizables
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

const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = "" 
}) => (
  <div className={`px-4 sm:px-6 py-4 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>
    {children}
  </p>
);

const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`px-4 sm:px-6 py-4 ${className}`}>{children}</div>
);

const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "success" | "danger";
  size?: "sm" | "default";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}> = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  type = "button",
  disabled = false,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm",
  };

  return (
    <button
      type={type}
      disabled={disabled}
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
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200";
      case "sick":
        return "bg-red-100 text-red-800 border-red-200";
      case "recovering":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "critical":
        return "bg-red-100 text-red-800 border-red-200";
      case "vaccination":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "illness":
        return "bg-red-100 text-red-800 border-red-200";
      case "treatment":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "checkup":
        return "bg-green-100 text-green-800 border-green-200";
      case "surgery":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "medication":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "exam":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      case "observation":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "active":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "ongoing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
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

// Modal para crear nuevo evento
const NewEventModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: NewEventForm) => void;
  animals: AnimalProfile[];
}> = ({ isOpen, onClose, onSave, animals }) => {
  const [formData, setFormData] = useState<NewEventForm>({
    animalId: "",
    eventType: "vaccination",
    title: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    veterinarian: "",
    severity: "low",
    status: "active",
    medications: "",
    diagnosis: "",
    treatment: "",
    followUpDate: "",
    cost: 0,
    notes: "",
    vitalSigns: {
      temperature: 0,
      heartRate: 0,
      respiratoryRate: 0,
      weight: 0,
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
    // Resetear formulario
    setFormData({
      animalId: "",
      eventType: "vaccination",
      title: "",
      description: "",
      date: new Date().toISOString().split("T")[0],
      veterinarian: "",
      severity: "low",
      status: "active",
      medications: "",
      diagnosis: "",
      treatment: "",
      followUpDate: "",
      cost: 0,
      notes: "",
      vitalSigns: {
        temperature: 0,
        heartRate: 0,
        respiratoryRate: 0,
        weight: 0,
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-y-auto"
      >
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Nuevo Evento Médico
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Animal */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animal *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.animalId}
                onChange={(e) =>
                  setFormData({ ...formData, animalId: e.target.value })
                }
              >
                <option value="">Seleccionar animal</option>
                {animals.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.name} ({animal.tag})
                  </option>
                ))}
              </select>
            </div>

            {/* Tipo de evento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Evento *
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.eventType}
                onChange={(e) =>
                  setFormData({ ...formData, eventType: e.target.value })
                }
              >
                <option value="vaccination">Vacunación</option>
                <option value="illness">Enfermedad</option>
                <option value="treatment">Tratamiento</option>
                <option value="checkup">Chequeo</option>
                <option value="surgery">Cirugía</option>
                <option value="medication">Medicamento</option>
                <option value="exam">Examen</option>
                <option value="observation">Observación</option>
              </select>
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            {/* Veterinario */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Veterinario *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.veterinarian}
                onChange={(e) =>
                  setFormData({ ...formData, veterinarian: e.target.value })
                }
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="active">Activo</option>
                <option value="completed">Completado</option>
                <option value="ongoing">En progreso</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            {/* Severidad */}
            {["illness", "surgery"].includes(formData.eventType) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severidad
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.severity}
                  onChange={(e) =>
                    setFormData({ ...formData, severity: e.target.value })
                  }
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                  <option value="critical">Crítica</option>
                </select>
              </div>
            )}

            {/* Costo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })
                }
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Signos vitales */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">
              Signos Vitales
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Temperatura (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.vitalSigns.temperature}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitalSigns: {
                        ...formData.vitalSigns,
                        temperature: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pulso (bpm)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.vitalSigns.heartRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitalSigns: {
                        ...formData.vitalSigns,
                        heartRate: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Respiración (rpm)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.vitalSigns.respiratoryRate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitalSigns: {
                        ...formData.vitalSigns,
                        respiratoryRate: parseInt(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Peso (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.vitalSigns.weight}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      vitalSigns: {
                        ...formData.vitalSigns,
                        weight: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                />
              </div>
            </div>
          </div>

          {/* Medicamentos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicamentos (separados por comas)
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.medications}
              onChange={(e) =>
                setFormData({ ...formData, medications: e.target.value })
              }
              placeholder="Ej: Antibiótico, Antiinflamatorio"
            />
          </div>

          {/* Diagnóstico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnóstico
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
            />
          </div>

          {/* Tratamiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tratamiento
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.treatment}
              onChange={(e) =>
                setFormData({ ...formData, treatment: e.target.value })
              }
            />
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          {/* Fecha de seguimiento */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Seguimiento
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.followUpDate}
              onChange={(e) =>
                setFormData({ ...formData, followUpDate: e.target.value })
              }
            />
          </div>

          {/* Botones */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              <Save className="w-4 h-4 mr-2" />
              Guardar Evento
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// Componente de Timeline de Eventos
const EventTimeline: React.FC<{ events: MedicalEvent[] }> = ({ events }) => {
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "vaccination":
        return Syringe;
      case "illness":
        return Thermometer;
      case "treatment":
        return Pill;
      case "checkup":
        return Stethoscope;
      case "surgery":
        return Activity;
      case "medication":
        return Pill;
      case "exam":
        return FileText;
      case "observation":
        return Eye;
      default:
        return Activity;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case "vaccination":
        return "purple";
      case "illness":
        return "red";
      case "treatment":
        return "blue";
      case "checkup":
        return "green";
      case "surgery":
        return "orange";
      case "medication":
        return "indigo";
      case "exam":
        return "cyan";
      case "observation":
        return "gray";
      default:
        return "gray";
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {events.map((event, index) => {
        const Icon = getEventIcon(event.eventType);
        const color = getEventColor(event.eventType);

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex gap-3 sm:gap-4"
          >
            {/* Timeline indicator */}
            <div className="flex flex-col items-center flex-shrink-0">
              <div
                className={`w-8 h-8 sm:w-10 sm:h-10 bg-${color}-100 rounded-full flex items-center justify-center border-2 border-${color}-200`}
              >
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 text-${color}-600`} />
              </div>
              {index < events.length - 1 && (
                <div className="w-0.5 h-12 sm:h-16 bg-gray-200 mt-2"></div>
              )}
            </div>

            {/* Event content */}
            <div className="flex-1 min-w-0">
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-white rounded-lg border border-gray-200 p-3 sm:p-4 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                      {event.title}
                    </h4>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                      <Badge variant={event.eventType}>
                        {event.eventType === "vaccination"
                          ? "Vacunación"
                          : event.eventType === "illness"
                          ? "Enfermedad"
                          : event.eventType === "treatment"
                          ? "Tratamiento"
                          : event.eventType === "checkup"
                          ? "Chequeo"
                          : event.eventType === "surgery"
                          ? "Cirugía"
                          : event.eventType === "medication"
                          ? "Medicamento"
                          : event.eventType === "exam"
                          ? "Examen"
                          : "Observación"}
                      </Badge>
                      <Badge variant={event.status}>
                        {event.status === "active"
                          ? "Activo"
                          : event.status === "completed"
                          ? "Completado"
                          : event.status === "ongoing"
                          ? "En progreso"
                          : "Cancelado"}
                      </Badge>
                      {event.severity && (
                        <Badge variant={event.severity}>
                          {event.severity === "critical"
                            ? "Crítico"
                            : event.severity === "high"
                            ? "Alto"
                            : event.severity === "medium"
                            ? "Medio"
                            : "Bajo"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-3 text-sm sm:text-base">
                  {event.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{event.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{event.veterinarian}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{event.location.facility}</span>
                  </div>
                </div>

                {event.vitalSigns && (
                  <div className="bg-gray-50 rounded-lg p-2 sm:p-3 mb-3">
                    <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                      Signos Vitales
                    </h5>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-600">Temperatura:</span>
                        <span className="ml-1 font-medium">
                          {event.vitalSigns.temperature}°C
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Pulso:</span>
                        <span className="ml-1 font-medium">
                          {event.vitalSigns.heartRate} bpm
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Respiración:</span>
                        <span className="ml-1 font-medium">
                          {event.vitalSigns.respiratoryRate} rpm
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Peso:</span>
                        <span className="ml-1 font-medium">
                          {event.vitalSigns.weight} kg
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {event.medications && event.medications.length > 0 && (
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-900 mb-2 text-sm sm:text-base">
                      Medicamentos
                    </h5>
                    <div className="flex flex-wrap gap-1">
                      {event.medications.map((med, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {event.diagnosis && (
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                      Diagnóstico
                    </h5>
                    <p className="text-gray-700 text-xs sm:text-sm">{event.diagnosis}</p>
                  </div>
                )}

                {event.treatment && (
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                      Tratamiento
                    </h5>
                    <p className="text-gray-700 text-xs sm:text-sm">{event.treatment}</p>
                  </div>
                )}

                {event.notes && (
                  <div className="mb-3">
                    <h5 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">Notas</h5>
                    <p className="text-gray-700 text-xs sm:text-sm">{event.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600 flex-wrap gap-2">
                  <span>Costo: ${event.cost.toLocaleString()}</span>
                  {event.followUpDate && (
                    <span>
                      Seguimiento: {event.followUpDate.toLocaleDateString()}
                    </span>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

const MedicalHistory: React.FC = () => {
  // Estados del componente
  const [selectedAnimal, setSelectedAnimal] = useState<string>("all");
  const [animals, setAnimals] = useState<AnimalProfile[]>([]);
  const [medicalEvents, setMedicalEvents] = useState<MedicalEvent[]>([]);
  const [healthStats, setHealthStats] = useState<HealthStats>({
    totalEvents: 0,
    vaccinationsCount: 0,
    illnessesCount: 0,
    treatmentsCount: 0,
    averageRecoveryTime: 0,
    healthScore: 0,
    lastEventDate: new Date(),
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30");
  const [selectedVeterinarian, setSelectedVeterinarian] =
    useState<string>("all");
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  // Función para generar ID único
  const generateId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  // Función para manejar nuevo evento
  const handleNewEvent = (eventData: NewEventForm) => {
    const selectedAnimalData = animals.find(a => a.id === eventData.animalId);
    if (!selectedAnimalData) return;

    const newEvent: MedicalEvent = {
      id: generateId(),
      animalId: eventData.animalId,
      animalName: selectedAnimalData.name,
      animalTag: selectedAnimalData.tag,
      eventType: eventData.eventType as any,
      title: eventData.title,
      description: eventData.description,
      date: new Date(eventData.date),
      veterinarian: eventData.veterinarian,
      location: {
        lat: 17.9869,
        lng: -92.9303,
        address: "Ubicación actual",
        facility: "Clínica Principal",
      },
      severity: eventData.severity as any,
      status: eventData.status as any,
      medications: eventData.medications ? eventData.medications.split(',').map(m => m.trim()) : [],
      diagnosis: eventData.diagnosis,
      treatment: eventData.treatment,
      followUpDate: eventData.followUpDate ? new Date(eventData.followUpDate) : undefined,
      cost: eventData.cost,
      attachments: [],
      notes: eventData.notes,
      vitalSigns: eventData.vitalSigns.temperature > 0 ? eventData.vitalSigns : undefined,
    };

    setMedicalEvents(prev => [newEvent, ...prev]);
    
    // Actualizar estadísticas
    setHealthStats(prev => ({
      ...prev,
      totalEvents: prev.totalEvents + 1,
      vaccinationsCount: eventData.eventType === 'vaccination' ? prev.vaccinationsCount + 1 : prev.vaccinationsCount,
      illnessesCount: eventData.eventType === 'illness' ? prev.illnessesCount + 1 : prev.illnessesCount,
      treatmentsCount: eventData.eventType === 'treatment' ? prev.treatmentsCount + 1 : prev.treatmentsCount,
      lastEventDate: new Date(),
    }));

    console.log("Nuevo evento creado:", newEvent);
  };

  // Simulación de datos
  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Datos de ejemplo para animales
      const mockAnimals: AnimalProfile[] = [
        {
          id: "COW001",
          name: "Bessie",
          tag: "TAG-001",
          breed: "Holstein",
          birthDate: new Date("2022-03-15"),
          gender: "female",
          currentWeight: 580,
          healthStatus: "healthy",
          lastCheckup: new Date("2025-07-01"),
          totalEvents: 15,
          chronicConditions: [],
          allergies: ["Penicilina"],
        },
        {
          id: "COW002",
          name: "Luna",
          tag: "TAG-002",
          breed: "Jersey",
          birthDate: new Date("2021-11-08"),
          gender: "female",
          currentWeight: 425,
          healthStatus: "recovering",
          lastCheckup: new Date("2025-07-10"),
          totalEvents: 23,
          chronicConditions: ["Mastitis recurrente"],
          allergies: [],
        },
        {
          id: "COW003",
          name: "Estrella",
          tag: "TAG-003",
          breed: "Simmental",
          birthDate: new Date("2020-06-22"),
          gender: "female",
          currentWeight: 650,
          healthStatus: "healthy",
          lastCheckup: new Date("2025-06-28"),
          totalEvents: 31,
          chronicConditions: [],
          allergies: ["Sulfonamidas"],
        },
      ];

      // Datos de ejemplo para eventos médicos
      const mockEvents: MedicalEvent[] = [
        {
          id: "1",
          animalId: "COW001",
          animalName: "Bessie",
          animalTag: "TAG-001",
          eventType: "checkup",
          title: "Chequeo Mensual de Rutina",
          description: "Examen de salud general y evaluación reproductiva",
          date: new Date("2025-07-01"),
          veterinarian: "Dr. García",
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Establo Principal, Sector A",
            facility: "Clínica Veterinaria Principal",
          },
          status: "completed",
          cost: 150,
          attachments: [],
          notes:
            "Animal en excelente estado de salud. Todos los parámetros normales.",
          vitalSigns: {
            temperature: 38.5,
            heartRate: 72,
            respiratoryRate: 24,
            weight: 580,
          },
        },
        {
          id: "2",
          animalId: "COW001",
          animalName: "Bessie",
          animalTag: "TAG-001",
          eventType: "vaccination",
          title: "Vacuna Antiaftosa",
          description:
            "Aplicación de vacuna contra fiebre aftosa - dosis anual",
          date: new Date("2025-06-15"),
          veterinarian: "Dr. Martínez",
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Establo Principal, Sector A",
            facility: "Clínica Veterinaria Principal",
          },
          status: "completed",
          medications: ["Vacuna Antiaftosa"],
          cost: 85,
          attachments: [],
          notes: "Vacunación sin complicaciones. Próxima dosis en 12 meses.",
          followUpDate: new Date("2026-06-15"),
        },
        {
          id: "3",
          animalId: "COW002",
          animalName: "Luna",
          animalTag: "TAG-002",
          eventType: "illness",
          title: "Mastitis Clínica",
          description: "Inflamación aguda de la glándula mamaria",
          date: new Date("2025-07-08"),
          veterinarian: "Dr. López",
          location: {
            lat: 17.9719,
            lng: -92.9456,
            address: "Sector Norte, Establo B",
            facility: "Clínica Veterinaria Norte",
          },
          severity: "medium",
          status: "ongoing",
          diagnosis: "Mastitis clínica en cuarto anterior derecho",
          treatment: "Antibioterapia sistémica y tratamiento intramamario",
          medications: ["Ceftriaxona", "Antiinflamatorio"],
          cost: 320,
          attachments: [],
          notes:
            "Respuesta favorable al tratamiento. Continuar terapia por 5 días más.",
          vitalSigns: {
            temperature: 39.2,
            heartRate: 85,
            respiratoryRate: 28,
            weight: 425,
          },
          followUpDate: new Date("2025-07-15"),
        },
        {
          id: "4",
          animalId: "COW003",
          animalName: "Estrella",
          animalTag: "TAG-003",
          eventType: "surgery",
          title: "Cesárea de Emergencia",
          description: "Intervención quirúrgica por distocia",
          date: new Date("2025-06-25"),
          veterinarian: "Dr. Hernández",
          location: {
            lat: 17.9589,
            lng: -92.9289,
            address: "Corral Sur, Sector C",
            facility: "Quirófano Móvil",
          },
          severity: "high",
          status: "completed",
          diagnosis: "Distocia por presentación anormal del feto",
          treatment: "Cesárea con anestesia epidural y sedación",
          medications: ["Lidocaína", "Xilacina", "Antibióticos profilácticos"],
          cost: 1200,
          attachments: [],
          notes:
            "Cirugía exitosa. Madre y cría en buen estado. Recuperación satisfactoria.",
          vitalSigns: {
            temperature: 38.8,
            heartRate: 78,
            respiratoryRate: 26,
            weight: 650,
          },
          followUpDate: new Date("2025-07-02"),
        },
      ];

      // Estadísticas de ejemplo
      const mockStats: HealthStats = {
        totalEvents: 47,
        vaccinationsCount: 18,
        illnessesCount: 12,
        treatmentsCount: 15,
        averageRecoveryTime: 8.5,
        healthScore: 92,
        lastEventDate: new Date("2025-07-10"),
      };

      setAnimals(mockAnimals);
      setMedicalEvents(mockEvents);
      setHealthStats(mockStats);
    };

    loadData();
  }, []);

  // Filtrar eventos médicos
  const filteredEvents = medicalEvents.filter((event) => {
    const matchesAnimal =
      selectedAnimal === "all" || event.animalId === selectedAnimal;
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.animalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEventType =
      selectedEventType === "all" || event.eventType === selectedEventType;
    const matchesVeterinarian =
      selectedVeterinarian === "all" ||
      event.veterinarian === selectedVeterinarian;

    return (
      matchesAnimal && matchesSearch && matchesEventType && matchesVeterinarian
    );
  });

  // Obtener perfil del animal seleccionado
  const selectedAnimalProfile =
    selectedAnimal !== "all"
      ? animals.find((a) => a.id === selectedAnimal)
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Historial Médico
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Registro completo de eventos médicos del ganado
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                size="sm" 
                onClick={() => setShowNewEventModal(true)}
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Evento
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
          {/* Estadísticas Generales */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12"
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <Card className="bg-white/80 backdrop-blur-md border-blue-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <History className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Total de Eventos
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        {healthStats.totalEvents}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-purple-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Syringe className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Vacunaciones
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        {healthStats.vaccinationsCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-red-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Thermometer className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Enfermedades
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        {healthStats.illnessesCount}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-md border-green-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        Score de Salud
                      </p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        {healthStats.healthScore}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Panel de Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 space-y-4 sm:space-y-6"
          >
            {/* Filtros */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
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
                      placeholder="Evento, animal, descripción..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Animal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Animal
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={selectedAnimal}
                    onChange={(e) => setSelectedAnimal(e.target.value)}
                  >
                    <option value="all">Todos los animales</option>
                    {animals.map((animal) => (
                      <option key={animal.id} value={animal.id}>
                        {animal.name} ({animal.tag})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tipo de evento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Evento
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="vaccination">Vacunaciones</option>
                    <option value="illness">Enfermedades</option>
                    <option value="treatment">Tratamientos</option>
                    <option value="checkup">Chequeos</option>
                    <option value="surgery">Cirugías</option>
                    <option value="medication">Medicamentos</option>
                    <option value="exam">Exámenes</option>
                    <option value="observation">Observaciones</option>
                  </select>
                </div>

                {/* Veterinario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Veterinario
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={selectedVeterinarian}
                    onChange={(e) => setSelectedVeterinarian(e.target.value)}
                  >
                    <option value="all">Todos los veterinarios</option>
                    <option value="Dr. García">Dr. García</option>
                    <option value="Dr. Martínez">Dr. Martínez</option>
                    <option value="Dr. López">Dr. López</option>
                    <option value="Dr. Hernández">Dr. Hernández</option>
                  </select>
                </div>

                {/* Período */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                  >
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="90">Últimos 3 meses</option>
                    <option value="365">Último año</option>
                    <option value="all">Todo el historial</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Perfil del Animal Seleccionado */}
            {selectedAnimalProfile && (
              <Card className="bg-white/80 backdrop-blur-md border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                    Perfil del Animal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-center mb-4">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                      {selectedAnimalProfile.name}
                    </h3>
                    <p className="text-gray-600 text-sm">{selectedAnimalProfile.tag}</p>
                    <Badge
                      variant={selectedAnimalProfile.healthStatus}
                      className="mt-2"
                    >
                      {selectedAnimalProfile.healthStatus === "healthy"
                        ? "Saludable"
                        : selectedAnimalProfile.healthStatus === "sick"
                        ? "Enfermo"
                        : selectedAnimalProfile.healthStatus === "recovering"
                        ? "Recuperándose"
                        : "Crítico"}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Raza:</span>
                      <span className="font-medium">
                        {selectedAnimalProfile.breed}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Edad:</span>
                      <span className="font-medium">
                        {Math.floor(
                          (new Date().getTime() -
                            selectedAnimalProfile.birthDate.getTime()) /
                            (1000 * 60 * 60 * 24 * 365)
                        )}{" "}
                        años
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso actual:</span>
                      <span className="font-medium">
                        {selectedAnimalProfile.currentWeight} kg
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Último chequeo:</span>
                      <span className="font-medium">
                        {selectedAnimalProfile.lastCheckup.toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total eventos:</span>
                      <span className="font-medium">
                        {selectedAnimalProfile.totalEvents}
                      </span>
                    </div>
                  </div>

                  {selectedAnimalProfile.chronicConditions.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 text-sm">
                        Condiciones Crónicas
                      </h5>
                      <div className="space-y-1">
                        {selectedAnimalProfile.chronicConditions.map(
                          (condition, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs mr-1 mb-1"
                            >
                              {condition}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {selectedAnimalProfile.allergies.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 mb-2 text-sm">
                        Alergias
                      </h5>
                      <div className="space-y-1">
                        {selectedAnimalProfile.allergies.map((allergy, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs mr-1 mb-1"
                          >
                            {allergy}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Timeline de Eventos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">
                  Historial de Eventos ({filteredEvents.length})
                  {selectedAnimalProfile && (
                    <span className="text-sm sm:text-base font-normal text-gray-600 ml-2">
                      - {selectedAnimalProfile.name}
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-sm">
                  Cronología detallada de todos los eventos médicos registrados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredEvents.length > 0 ? (
                  <EventTimeline events={filteredEvents} />
                ) : (
                  <div className="text-center py-8 sm:py-12">
                    <Stethoscope className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">
                      No hay eventos médicos
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                      No se encontraron eventos que coincidan con los filtros
                      seleccionados.
                    </p>
                    <Button onClick={() => setShowNewEventModal(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Registrar Primer Evento
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modal para nuevo evento */}
      <NewEventModal
        isOpen={showNewEventModal}
        onClose={() => setShowNewEventModal(false)}
        onSave={handleNewEvent}
        animals={animals}
      />
    </div>
  );
};

export default MedicalHistory;