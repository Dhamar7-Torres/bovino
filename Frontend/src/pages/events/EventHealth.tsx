import React, { useState, useEffect } from "react";
import {
  Heart,
  Calendar,
  MapPin,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  AlertTriangle,
  Stethoscope,
  Save,
  ArrowLeft,
  Thermometer,
  Pill,
  Bandage,
  Shield,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ==================== TIPOS ====================
interface HealthEvent {
  id: string;
  bovineName: string;
  bovineTag: string;
  eventType: string;
  status: string;
  priority: string;
  scheduledDate: string;
  checkType: string;
  temperature?: number;
  weight?: number;
  diagnosis?: string;
  treatment?: string;
  prognosis: string;
  cost?: number;
  latitude: number;
  longitude: number;
  notes?: string;
  veterinarian?: string;
  createdAt: string;
}

// ==================== DATOS ====================
const EVENT_TYPES = [
  { id: "routine_checkup", name: "Revisión Rutinaria", icon: Stethoscope },
  { id: "emergency_call", name: "Emergencia Médica", icon: AlertTriangle },
  { id: "disease_treatment", name: "Tratamiento de Enfermedad", icon: Pill },
  { id: "injury_treatment", name: "Tratamiento de Lesión", icon: Bandage },
  { id: "vaccination", name: "Vacunación", icon: Shield },
  { id: "preventive_care", name: "Cuidado Preventivo", icon: Heart },
];

const CHECK_TYPES = [
  { id: "general_exam", name: "Examen General" },
  { id: "emergency_exam", name: "Examen de Emergencia" },
  { id: "follow_up", name: "Seguimiento" },
];

// ==================== COMPONENTE PRINCIPAL ====================
const EventHealth: React.FC = () => {
  const navigate = useNavigate();

  // Estados de eventos
  const [events, setEvents] = useState<HealthEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HealthEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEventType, setFilterEventType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  // Estados de modales
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<HealthEvent | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);

  // Estados del formulario - CADA UNO INDIVIDUAL
  const [formName, setFormName] = useState("");
  const [formTag, setFormTag] = useState("");
  const [formType, setFormType] = useState("routine_checkup");
  const [formDate, setFormDate] = useState("");
  const [formStatus, setFormStatus] = useState("scheduled");
  const [formPriority, setFormPriority] = useState("medium");
  const [formCheckType, setFormCheckType] = useState("general_exam");
  const [formTemp, setFormTemp] = useState("");
  const [formWeight, setFormWeight] = useState("");
  const [formDiagnosis, setFormDiagnosis] = useState("");
  const [formTreatment, setFormTreatment] = useState("");
  const [formPrognosis, setFormPrognosis] = useState("good");
  const [formCost, setFormCost] = useState("");
  const [formLat, setFormLat] = useState("17.9869");
  const [formLng, setFormLng] = useState("-92.9303");
  const [formNotes, setFormNotes] = useState("");
  const [formVet, setFormVet] = useState("");

  const [saving, setSaving] = useState(false);

  // ==================== FUNCIONES DE CARGA ====================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockEvents: HealthEvent[] = [
        {
          id: "1",
          bovineName: "Luna",
          bovineTag: "L-001",
          eventType: "routine_checkup",
          status: "completed",
          priority: "medium",
          scheduledDate: "2024-12-20T09:00:00",
          checkType: "general_exam",
          temperature: 38.5,
          weight: 450,
          diagnosis: "Estado general bueno",
          treatment: "Ninguno",
          prognosis: "excellent",
          cost: 150,
          latitude: 17.9869,
          longitude: -92.9303,
          notes: "Revisión rutinaria sin novedades",
          veterinarian: "Dr. Carlos Herrera",
          createdAt: "2024-12-20T08:00:00",
        },
        {
          id: "2",
          bovineName: "Esperanza",
          bovineTag: "E-002",
          eventType: "disease_treatment",
          status: "in_progress",
          priority: "high",
          scheduledDate: "2024-12-18T10:00:00",
          checkType: "emergency_exam",
          temperature: 39.8,
          weight: 420,
          diagnosis: "Neumonía bacteriana leve",
          treatment: "Antibioterapia con penicilina",
          prognosis: "good",
          cost: 280,
          latitude: 17.9869,
          longitude: -92.9303,
          notes: "Respondiendo bien al tratamiento",
          veterinarian: "Dr. Carlos Herrera",
          createdAt: "2024-12-18T09:00:00",
        },
      ];

      setEvents(mockEvents);
      setLoading(false);
    };

    loadData();
  }, []);

  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.bovineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.bovineTag.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterEventType !== "all") {
      filtered = filtered.filter(event => event.eventType === filterEventType);
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter(event => event.status === filterStatus);
    }

    setFilteredEvents(filtered);
  }, [events, searchTerm, filterEventType, filterStatus]);

  // ==================== FUNCIONES DE MODAL ====================
  const clearForm = () => {
    setFormName("");
    setFormTag("");
    setFormType("routine_checkup");
    setFormDate("");
    setFormStatus("scheduled");
    setFormPriority("medium");
    setFormCheckType("general_exam");
    setFormTemp("");
    setFormWeight("");
    setFormDiagnosis("");
    setFormTreatment("");
    setFormPrognosis("good");
    setFormCost("");
    setFormLat("17.9869");
    setFormLng("-92.9303");
    setFormNotes("");
    setFormVet("");
  };

  const openCreate = () => {
    clearForm();
    setIsEditing(false);
    setSelectedEvent(null);
    setShowModal(true);
  };

  const openEdit = (event: HealthEvent) => {
    setFormName(event.bovineName);
    setFormTag(event.bovineTag);
    setFormType(event.eventType);
    setFormDate(new Date(event.scheduledDate).toISOString().slice(0, 16));
    setFormStatus(event.status);
    setFormPriority(event.priority);
    setFormCheckType(event.checkType);
    setFormTemp(event.temperature?.toString() || "");
    setFormWeight(event.weight?.toString() || "");
    setFormDiagnosis(event.diagnosis || "");
    setFormTreatment(event.treatment || "");
    setFormPrognosis(event.prognosis);
    setFormCost(event.cost?.toString() || "");
    setFormLat(event.latitude.toString());
    setFormLng(event.longitude.toString());
    setFormNotes(event.notes || "");
    setFormVet(event.veterinarian || "");
    
    setIsEditing(true);
    setSelectedEvent(event);
    setShowModal(true);
  };

  const openView = (event: HealthEvent) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setShowViewModal(false);
    setIsEditing(false);
    setSelectedEvent(null);
    clearForm();
  };

  const saveEvent = async () => {
    if (!formName.trim()) {
      alert("El nombre es obligatorio");
      return;
    }
    if (!formDate) {
      alert("La fecha es obligatoria");
      return;
    }

    setSaving(true);

    try {
      const newEvent: HealthEvent = {
        id: selectedEvent?.id || Date.now().toString(),
        bovineName: formName,
        bovineTag: formTag || formName.substring(0, 3).toUpperCase() + "-" + Math.floor(Math.random() * 1000),
        eventType: formType,
        status: formStatus,
        priority: formPriority,
        scheduledDate: formDate,
        checkType: formCheckType,
        temperature: formTemp ? parseFloat(formTemp) : undefined,
        weight: formWeight ? parseFloat(formWeight) : undefined,
        diagnosis: formDiagnosis || undefined,
        treatment: formTreatment || undefined,
        prognosis: formPrognosis,
        cost: formCost ? parseFloat(formCost) : undefined,
        latitude: parseFloat(formLat),
        longitude: parseFloat(formLng),
        notes: formNotes || undefined,
        veterinarian: formVet || undefined,
        createdAt: selectedEvent?.createdAt || new Date().toISOString(),
      };

      if (isEditing && selectedEvent) {
        setEvents(prev => prev.map(event => event.id === selectedEvent.id ? newEvent : event));
      } else {
        setEvents(prev => [newEvent, ...prev]);
      }

      closeModal();
    } catch (error) {
      console.error("Error:", error);
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const deleteEvent = (id: string) => {
    if (window.confirm("¿Eliminar evento?")) {
      setEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  // ==================== FUNCIONES DE UTILIDAD ====================
  const getEventTypeName = (typeId: string) => {
    return EVENT_TYPES.find(t => t.id === typeId)?.name || typeId;
  };

  const getEventTypeIcon = (typeId: string) => {
    const type = EVENT_TYPES.find(t => t.id === typeId);
    return type ? type.icon : Stethoscope;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "text-blue-600 bg-blue-100",
      completed: "text-green-600 bg-green-100",
      in_progress: "text-yellow-600 bg-yellow-100",
      cancelled: "text-red-600 bg-red-100",
      emergency: "text-red-700 bg-red-200",
    };
    return colors[status as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-green-600 bg-green-100",
      medium: "text-yellow-600 bg-yellow-100",
      high: "text-orange-600 bg-orange-100",
      critical: "text-red-600 bg-red-100",
      emergency: "text-red-700 bg-red-200",
    };
    return colors[priority as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusText = (status: string) => {
    const texts = {
      scheduled: "Programado",
      completed: "Completado",
      in_progress: "En Progreso",
      cancelled: "Cancelado",
      emergency: "Emergencia",
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getPriorityText = (priority: string) => {
    const texts = {
      low: "Baja",
      medium: "Media",
      high: "Alta",
      critical: "Crítica",
      emergency: "Emergencia",
    };
    return texts[priority as keyof typeof texts] || priority;
  };

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#519a7c] mx-auto mb-4"></div>
          <p className="text-gray-800 text-lg font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="p-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-xl text-white">
                <Stethoscope className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Eventos de Salud</h1>
                <p className="text-gray-600 mt-1">Gestiona la salud y cuidado médico de tu ganado</p>
              </div>
            </div>

            <button
              onClick={openCreate}
              className="flex items-center space-x-2 bg-gradient-to-r from-[#519a7c] to-[#f4ac3a] text-white px-6 py-3 rounded-xl font-medium hover:from-[#4e9c75] hover:to-[#e8a234] shadow-lg"
            >
              <Plus className="h-5 w-5" />
              <span>Nuevo Evento</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] bg-white/80"
              />
            </div>

            <select
              value={filterEventType}
              onChange={(e) => setFilterEventType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] bg-white/80"
            >
              <option value="all">Todos los tipos</option>
              {EVENT_TYPES.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] bg-white/80"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programado</option>
              <option value="in_progress">En Progreso</option>
              <option value="completed">Completado</option>
              <option value="cancelled">Cancelado</option>
              <option value="emergency">Emergencia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Eventos */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {filteredEvents.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200">
            <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay eventos</h3>
            <p className="text-gray-600 mb-6">Comienza creando tu primer evento de salud.</p>
            <button
              onClick={openCreate}
              className="bg-gradient-to-r from-[#519a7c] to-[#f4ac3a] text-white px-6 py-3 rounded-xl font-medium hover:from-[#4e9c75] hover:to-[#e8a234]"
            >
              Crear Evento
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const EventIcon = getEventTypeIcon(event.eventType);
              return (
                <div
                  key={event.id}
                  className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => openView(event)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white">
                        <EventIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {getEventTypeName(event.eventType)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {event.bovineName} • {event.bovineTag}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(event.priority)}`}>
                        {getPriorityText(event.priority)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(event.scheduledDate)}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>{event.latitude.toFixed(4)}, {event.longitude.toFixed(4)}</span>
                    </div>

                    {event.temperature && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Thermometer className="h-4 w-4" />
                        <span>{event.temperature}°C</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openView(event);
                        }}
                        className="p-2 hover:bg-blue-100 rounded-lg text-blue-600"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(event);
                        }}
                        className="p-2 hover:bg-yellow-100 rounded-lg text-yellow-600"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteEvent(event.id);
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Formulario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {isEditing ? "Editar" : "Crear"} Evento
              </h2>
              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Columna 1 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Información Básica</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Vaca *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                    placeholder="Nombre de la vaca"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Etiqueta
                  </label>
                  <input
                    type="text"
                    value={formTag}
                    onChange={(e) => setFormTag(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                    placeholder="L-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Evento
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                  >
                    {EVENT_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha y Hora *
                  </label>
                  <input
                    type="datetime-local"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                    >
                      <option value="scheduled">Programado</option>
                      <option value="in_progress">En Progreso</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                      <option value="emergency">Emergencia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                      <option value="critical">Crítica</option>
                      <option value="emergency">Emergencia</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Veterinario</label>
                  <input
                    type="text"
                    value={formVet}
                    onChange={(e) => setFormVet(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                    placeholder="Nombre del veterinario"
                  />
                </div>
              </div>

              {/* Columna 2 */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Datos de Salud</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Revisión</label>
                  <select
                    value={formCheckType}
                    onChange={(e) => setFormCheckType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                  >
                    {CHECK_TYPES.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Temperatura (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formTemp}
                      onChange={(e) => setFormTemp(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                      placeholder="38.5"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Peso (kg)</label>
                    <input
                      type="number"
                      value={formWeight}
                      onChange={(e) => setFormWeight(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                      placeholder="450"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Diagnóstico</label>
                  <input
                    type="text"
                    value={formDiagnosis}
                    onChange={(e) => setFormDiagnosis(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                    placeholder="Descripción del diagnóstico"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tratamiento</label>
                  <input
                    type="text"
                    value={formTreatment}
                    onChange={(e) => setFormTreatment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                    placeholder="Descripción del tratamiento"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pronóstico</label>
                  <select
                    value={formPrognosis}
                    onChange={(e) => setFormPrognosis(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                  >
                    <option value="excellent">Excelente</option>
                    <option value="good">Bueno</option>
                    <option value="fair">Regular</option>
                    <option value="poor">Pobre</option>
                    <option value="grave">Grave</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Costo (MXN)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Ubicación */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Ubicación GPS</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Latitud</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formLat}
                    onChange={(e) => setFormLat(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Longitud</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formLng}
                    onChange={(e) => setFormLng(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                  />
                </div>
              </div>
            </div>

            {/* Notas */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
              <textarea
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c]"
                placeholder="Observaciones adicionales..."
              />
            </div>

            {/* Botones */}
            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveEvent}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4e9c75] disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{isEditing ? "Actualizar" : "Crear"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista */}
      {showViewModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                  {React.createElement(getEventTypeIcon(selectedEvent.eventType), { className: "h-6 w-6" })}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {getEventTypeName(selectedEvent.eventType)}
                  </h2>
                  <p className="text-gray-600">
                    {selectedEvent.bovineName} • {selectedEvent.bovineTag}
                  </p>
                </div>
              </div>

              <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Información General</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedEvent.status)}`}>
                      {getStatusText(selectedEvent.status)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Fecha:</span>
                    <span className="font-medium">{formatDate(selectedEvent.scheduledDate)}</span>
                  </div>

                  {selectedEvent.veterinarian && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Veterinario:</span>
                      <span className="font-medium">{selectedEvent.veterinarian}</span>
                    </div>
                  )}

                  {selectedEvent.cost && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Costo:</span>
                      <span className="font-medium">${selectedEvent.cost.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Datos de Salud</h3>
                
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  {selectedEvent.diagnosis && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Diagnóstico:</span>
                      <span className="font-medium text-blue-900">{selectedEvent.diagnosis}</span>
                    </div>
                  )}

                  {selectedEvent.treatment && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Tratamiento:</span>
                      <span className="font-medium text-blue-900">{selectedEvent.treatment}</span>
                    </div>
                  )}

                  {selectedEvent.temperature && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Temperatura:</span>
                      <span className="font-medium text-blue-900">{selectedEvent.temperature}°C</span>
                    </div>
                  )}

                  {selectedEvent.weight && (
                    <div className="flex justify-between">
                      <span className="text-blue-700">Peso:</span>
                      <span className="font-medium text-blue-900">{selectedEvent.weight}kg</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {selectedEvent.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Notas</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{selectedEvent.notes}</p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={() => {
                  closeModal();
                  openEdit(selectedEvent);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4e9c75]"
              >
                <Edit3 className="h-4 w-4" />
                <span>Editar</span>
              </button>

              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventHealth;