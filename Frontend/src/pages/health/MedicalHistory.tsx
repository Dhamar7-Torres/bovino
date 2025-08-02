import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope,
  Calendar,
  Search,
  Plus,
  MapPin,
  Syringe,
  Thermometer,
  TrendingUp,
  History,
  X,
  Save,
  Edit,
  Trash2,
  AlertTriangle,
  Eye,
} from "lucide-react";

// Tipos para eventos médicos
type EventType = "vaccination" | "illness" | "treatment" | "checkup" | "surgery" | "medication" | "exam" | "observation";
type EventStatus = "active" | "completed" | "ongoing" | "cancelled";
type EventSeverity = "low" | "medium" | "high" | "critical";

// Interfaces para tipos de datos
interface MedicalEvent {
  id: string;
  animalName: string;
  animalTag: string;
  eventType: EventType;
  title: string;
  description: string;
  date: string;
  veterinarian: string;
  location: string;
  severity?: EventSeverity;
  status: EventStatus;
  medications?: string[];
  diagnosis?: string;
  treatment?: string;
  followUpDate?: string;
  cost: number;
  notes: string;
  createdAt: string;
  vitalSigns?: {
    temperature: number;
    heartRate: number;
    respiratoryRate: number;
    weight: number;
  };
}

interface HealthStats {
  totalEvents: number;
  vaccinationsCount: number;
  illnessesCount: number;
  treatmentsCount: number;
  healthScore: number;
}

interface NewEventForm {
  animalName: string;
  animalTag: string;
  eventType: EventType;
  title: string;
  description: string;
  date: string;
  veterinarian: string;
  location: string;
  severity?: EventSeverity;
  status: EventStatus;
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

const MedicalHistory: React.FC = () => {
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  // Estados para modales y formularios
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<MedicalEvent | null>(null);
  const [editingEvent, setEditingEvent] = useState<MedicalEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<MedicalEvent | null>(null);
  
  // Estados para formulario
  const [formData, setFormData] = useState<Partial<NewEventForm>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedVeterinarian, setSelectedVeterinarian] = useState<string>("all");

  // Datos de ejemplo
  const mockEvents: MedicalEvent[] = [
    {
      id: "1",
      animalName: "Bessie",
      animalTag: "TAG-001",
      eventType: "checkup",
      title: "Chequeo Mensual de Rutina",
      description: "Examen de salud general y evaluación reproductiva",
      date: "2025-07-01",
      veterinarian: "Dr. García",
      location: "Establo Principal",
      status: "completed",
      cost: 150,
      notes: "Animal en excelente estado de salud. Todos los parámetros normales.",
      createdAt: "2025-07-01T10:00:00.000Z",
      vitalSigns: {
        temperature: 38.5,
        heartRate: 72,
        respiratoryRate: 24,
        weight: 580,
      },
    },
    {
      id: "2",
      animalName: "Bessie",
      animalTag: "TAG-001",
      eventType: "vaccination",
      title: "Vacuna Antiaftosa",
      description: "Aplicación de vacuna contra fiebre aftosa - dosis anual",
      date: "2025-06-15",
      veterinarian: "Dr. Martínez",
      location: "Establo Principal",
      status: "completed",
      medications: ["Vacuna Antiaftosa"],
      cost: 85,
      notes: "Vacunación sin complicaciones. Próxima dosis en 12 meses.",
      createdAt: "2025-06-15T09:00:00.000Z",
    },
    {
      id: "3",
      animalName: "Luna",
      animalTag: "TAG-002",
      eventType: "illness",
      title: "Mastitis Clínica",
      description: "Inflamación aguda de la glándula mamaria",
      date: "2025-07-08",
      veterinarian: "Dr. López",
      location: "Establo Norte",
      severity: "medium",
      status: "ongoing",
      diagnosis: "Mastitis clínica en cuarto anterior derecho",
      treatment: "Antibioterapia sistémica y tratamiento intramamario",
      medications: ["Ceftriaxona", "Antiinflamatorio"],
      cost: 320,
      notes: "Respuesta favorable al tratamiento. Continuar terapia por 5 días más.",
      createdAt: "2025-07-08T14:30:00.000Z",
      vitalSigns: {
        temperature: 39.2,
        heartRate: 85,
        respiratoryRate: 28,
        weight: 425,
      },
    },
  ];

  // Estadísticas calculadas
  const [healthStats, setHealthStats] = useState<HealthStats>({
    totalEvents: 0,
    vaccinationsCount: 0,
    illnessesCount: 0,
    treatmentsCount: 0,
    healthScore: 92,
  });

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setEvents(mockEvents);
        
        // Calcular estadísticas
        setHealthStats({
          totalEvents: mockEvents.length,
          vaccinationsCount: mockEvents.filter(e => e.eventType === "vaccination").length,
          illnessesCount: mockEvents.filter(e => e.eventType === "illness").length,
          treatmentsCount: mockEvents.filter(e => e.eventType === "treatment").length,
          healthScore: 92,
        });
        
      } catch (err) {
        setError("Error al cargar los eventos médicos");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Validar formulario
  const validateForm = (data: Partial<NewEventForm>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.animalName?.trim()) {
      errors.animalName = "El nombre del animal es obligatorio";
    }
    if (!data.eventType) {
      errors.eventType = "El tipo de evento es obligatorio";
    }
    if (!data.title?.trim()) {
      errors.title = "El título es obligatorio";
    }
    if (!data.description?.trim()) {
      errors.description = "La descripción es obligatoria";
    }
    if (!data.date) {
      errors.date = "La fecha es obligatoria";
    }
    if (!data.veterinarian?.trim()) {
      errors.veterinarian = "El veterinario es obligatorio";
    }
    if (!data.location?.trim()) {
      errors.location = "La ubicación es obligatoria";
    }

    return errors;
  };

  // Resetear formulario
  const resetForm = () => {
    const now = new Date();
    const today = now.toISOString().substr(0, 10);
    
    setFormData({
      animalName: "",
      animalTag: "",
      eventType: "vaccination" as EventType,
      title: "",
      description: "",
      date: today,
      veterinarian: "",
      location: "",
      severity: "low" as EventSeverity,
      status: "active" as EventStatus,
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
    setFormErrors({});
  };

  // Crear nuevo evento
  const handleCreate = () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newEvent: MedicalEvent = {
      id: `event-${Date.now()}`,
      animalName: formData.animalName!,
      animalTag: formData.animalTag || "N/A",
      eventType: formData.eventType!,
      title: formData.title!,
      description: formData.description!,
      date: formData.date!,
      veterinarian: formData.veterinarian!,
      location: formData.location!,
      severity: formData.severity,
      status: formData.status!,
      medications: formData.medications ? formData.medications.split(',').map(m => m.trim()).filter(m => m) : undefined,
      diagnosis: formData.diagnosis || undefined,
      treatment: formData.treatment || undefined,
      followUpDate: formData.followUpDate || undefined,
      cost: formData.cost || 0,
      notes: formData.notes || "",
      createdAt: new Date().toISOString(),
      vitalSigns: formData.vitalSigns?.temperature ? formData.vitalSigns : undefined,
    };

    setEvents(prev => [newEvent, ...prev]);
    setShowForm(false);
    resetForm();

    // Actualizar estadísticas
    setHealthStats(prev => ({
      ...prev,
      totalEvents: prev.totalEvents + 1,
      vaccinationsCount: newEvent.eventType === 'vaccination' ? prev.vaccinationsCount + 1 : prev.vaccinationsCount,
      illnessesCount: newEvent.eventType === 'illness' ? prev.illnessesCount + 1 : prev.illnessesCount,
      treatmentsCount: newEvent.eventType === 'treatment' ? prev.treatmentsCount + 1 : prev.treatmentsCount,
    }));
  };

  // Actualizar evento existente
  const handleUpdate = () => {
    if (!editingEvent) return;

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const updatedData: Partial<MedicalEvent> = {
      animalName: formData.animalName!,
      animalTag: formData.animalTag || "N/A",
      eventType: formData.eventType!,
      title: formData.title!,
      description: formData.description!,
      date: formData.date!,
      veterinarian: formData.veterinarian!,
      location: formData.location!,
      severity: formData.severity,
      status: formData.status!,
      medications: formData.medications ? formData.medications.split(',').map(m => m.trim()).filter(m => m) : undefined,
      diagnosis: formData.diagnosis || undefined,
      treatment: formData.treatment || undefined,
      followUpDate: formData.followUpDate || undefined,
      cost: formData.cost || 0,
      notes: formData.notes || "",
      vitalSigns: formData.vitalSigns?.temperature ? formData.vitalSigns : undefined,
    };

    setEvents(prev => prev.map(event => 
      event.id === editingEvent.id 
        ? { ...event, ...updatedData }
        : event
    ));
    
    setEditingEvent(null);
    setShowForm(false);
    resetForm();
  };

  // Ver detalles
  const handleView = (event: MedicalEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  // Editar evento
  const handleEdit = (event: MedicalEvent) => {
    setEditingEvent(event);
    const formEventData: Partial<NewEventForm> = {
      animalName: event.animalName,
      animalTag: event.animalTag,
      eventType: event.eventType,
      title: event.title,
      description: event.description,
      date: event.date,
      veterinarian: event.veterinarian,
      location: event.location,
      severity: event.severity,
      status: event.status,
      medications: event.medications ? event.medications.join(', ') : "",
      diagnosis: event.diagnosis || "",
      treatment: event.treatment || "",
      followUpDate: event.followUpDate || "",
      cost: event.cost,
      notes: event.notes,
      vitalSigns: event.vitalSigns || {
        temperature: 0,
        heartRate: 0,
        respiratoryRate: 0,
        weight: 0,
      },
    };
    setFormData(formEventData);
    setShowForm(true);
  };

  // Eliminar evento
  const handleDeleteClick = (event: MedicalEvent) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  // Confirmar eliminación
  const confirmDelete = () => {
    if (!eventToDelete) return;

    setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
    
    if (selectedEvent?.id === eventToDelete.id) {
      setSelectedEvent(null);
      setShowDetailsModal(false);
    }
    if (editingEvent?.id === eventToDelete.id) {
      setEditingEvent(null);
      setShowForm(false);
    }
    
    setShowDeleteModal(false);
    setEventToDelete(null);

    // Actualizar estadísticas
    setHealthStats(prev => ({
      ...prev,
      totalEvents: prev.totalEvents - 1,
      vaccinationsCount: eventToDelete.eventType === 'vaccination' ? prev.vaccinationsCount - 1 : prev.vaccinationsCount,
      illnessesCount: eventToDelete.eventType === 'illness' ? prev.illnessesCount - 1 : prev.illnessesCount,
      treatmentsCount: eventToDelete.eventType === 'treatment' ? prev.treatmentsCount - 1 : prev.treatmentsCount,
    }));
  };

  // Nuevo evento
  const handleNew = () => {
    setEditingEvent(null);
    resetForm();
    setShowForm(true);
  };

  // Funciones auxiliares
  const getStatusColor = (status: EventStatus) => {
    const colors = {
      active: "bg-red-100 text-red-800",
      completed: "bg-green-100 text-green-800",
      ongoing: "bg-blue-100 text-blue-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return colors[status];
  };

  const getStatusText = (status: EventStatus) => {
    const texts = {
      active: "Activo",
      completed: "Completado",
      ongoing: "En progreso",
      cancelled: "Cancelado",
    };
    return texts[status];
  };

  const getEventTypeColor = (eventType: EventType) => {
    const colors = {
      vaccination: "bg-purple-100 text-purple-800",
      illness: "bg-red-100 text-red-800",
      treatment: "bg-blue-100 text-blue-800",
      checkup: "bg-green-100 text-green-800",
      surgery: "bg-orange-100 text-orange-800",
      medication: "bg-indigo-100 text-indigo-800",
      exam: "bg-cyan-100 text-cyan-800",
      observation: "bg-gray-100 text-gray-800",
    };
    return colors[eventType];
  };

  const getEventTypeText = (eventType: EventType) => {
    const texts = {
      vaccination: "Vacunación",
      illness: "Enfermedad",
      treatment: "Tratamiento",
      checkup: "Chequeo",
      surgery: "Cirugía",
      medication: "Medicamento",
      exam: "Examen",
      observation: "Observación",
    };
    return texts[eventType];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('es-MX');
  };

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  // Filtrar eventos
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.animalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEventType =
      selectedEventType === "all" || event.eventType === selectedEventType;
    const matchesVeterinarian =
      selectedVeterinarian === "all" || event.veterinarian === selectedVeterinarian;

    return matchesSearch && matchesEventType && matchesVeterinarian;
  });

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#519a7c]"></div>
          <p className="text-gray-600">Cargando eventos médicos...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600">❌ {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Recargar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Simple */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        {/* Header Simple */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#519a7c] rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Historial Médico
                </h1>
                <p className="text-gray-600">
                  Registro completo de eventos médicos del ganado
                </p>
              </div>
            </div>
            <button 
              onClick={handleNew}
              className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo</span>
            </button>
          </div>

          {/* Estadísticas simples */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{healthStats.totalEvents}</p>
                </div>
                <History className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vacunaciones</p>
                  <p className="text-2xl font-bold text-gray-900">{healthStats.vaccinationsCount}</p>
                </div>
                <Syringe className="w-8 h-8 text-purple-600" />
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Enfermedades</p>
                  <p className="text-2xl font-bold text-gray-900">{healthStats.illnessesCount}</p>
                </div>
                <Thermometer className="w-8 h-8 text-red-600" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Score Salud</p>
                  <p className="text-2xl font-bold text-gray-900">{healthStats.healthScore}%</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="vaccination">Vacunaciones</option>
              <option value="illness">Enfermedades</option>
              <option value="treatment">Tratamientos</option>
              <option value="checkup">Chequeos</option>
              <option value="surgery">Cirugías</option>
            </select>

            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              value={selectedVeterinarian}
              onChange={(e) => setSelectedVeterinarian(e.target.value)}
            >
              <option value="all">Todos los veterinarios</option>
              <option value="Dr. García">Dr. García</option>
              <option value="Dr. Martínez">Dr. Martínez</option>
              <option value="Dr. López">Dr. López</option>
            </select>
          </div>
        </div>

        {/* Lista de eventos */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay eventos médicos
            </h3>
            <p className="text-gray-600 mb-6">
              No se encontraron eventos que coincidan con los filtros seleccionados
            </p>
            <button 
              onClick={handleNew}
              className="px-6 py-3 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 mx-auto transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Primer Evento</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header de la tarjeta */}
                <div className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] p-4 text-white">
                  <h3 className="font-bold text-lg">
                    {event.title}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {event.animalName} ({event.animalTag})
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                      {getEventTypeText(event.eventType)}
                    </span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {getStatusText(event.status)}
                    </span>
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Fecha:</p>
                      <p className="font-medium">
                        {formatDate(event.date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Veterinario:</p>
                      <p className="font-medium">{event.veterinarian}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>

                  <p className="text-sm text-gray-700 line-clamp-2">{event.description}</p>

                  {event.vitalSigns && (
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-xs font-medium text-gray-900 mb-1">Signos Vitales</p>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                        <span>Temp: {event.vitalSigns.temperature}°C</span>
                        <span>Peso: {event.vitalSigns.weight}kg</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#519a7c]">
                      ${event.cost.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="bg-gray-50 px-4 py-3 flex justify-between">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleView(event)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(event)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(event)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(event.createdAt.split('T')[0])}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal de formulario */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {/* Header del modal */}
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingEvent ? "Editar Evento Médico" : "Nuevo Evento Médico"}
                  </h2>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Contenido del formulario */}
                <div className="p-6 space-y-4">
                  {/* Información del Animal */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Animal *
                      </label>
                      <input
                        type="text"
                        value={formData.animalName || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.animalName ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Ej: Esperanza"
                      />
                      {formErrors.animalName && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.animalName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tag del Animal
                      </label>
                      <input
                        type="text"
                        value={formData.animalTag || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, animalTag: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        placeholder="Ej: TAG-001"
                      />
                    </div>
                  </div>

                  {/* Tipo de evento y título */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Evento *
                      </label>
                      <select
                        value={formData.eventType || "vaccination"}
                        onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as EventType }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.eventType ? "border-red-300" : "border-gray-300"
                        }`}
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
                      {formErrors.eventType && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.eventType}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Título *
                      </label>
                      <input
                        type="text"
                        value={formData.title || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.title ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Ej: Vacuna antiaftosa"
                      />
                      {formErrors.title && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
                      )}
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción *
                    </label>
                    <textarea
                      value={formData.description || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                        formErrors.description ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Descripción del evento..."
                    />
                    {formErrors.description && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
                    )}
                  </div>

                  {/* Fecha, Veterinario y Ubicación */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha *
                      </label>
                      <input
                        type="date"
                        value={formData.date || new Date().toISOString().substr(0, 10)}
                        onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.date ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {formErrors.date && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Veterinario *
                      </label>
                      <input
                        type="text"
                        value={formData.veterinarian || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.veterinarian ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Dr. García"
                      />
                      {formErrors.veterinarian && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.veterinarian}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ubicación *
                      </label>
                      <input
                        type="text"
                        value={formData.location || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.location ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Establo Principal"
                      />
                      {formErrors.location && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
                      )}
                    </div>
                  </div>

                  {/* Signos vitales */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">
                      Signos Vitales (opcional)
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Temp. (°C)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.vitalSigns?.temperature || ""}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              vitalSigns: {
                                ...prev.vitalSigns,
                                temperature: parseFloat(e.target.value) || 0,
                                heartRate: prev.vitalSigns?.heartRate || 0,
                                respiratoryRate: prev.vitalSigns?.respiratoryRate || 0,
                                weight: prev.vitalSigns?.weight || 0,
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Pulso (bpm)
                        </label>
                        <input
                          type="number"
                          value={formData.vitalSigns?.heartRate || ""}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              vitalSigns: {
                                ...prev.vitalSigns,
                                temperature: prev.vitalSigns?.temperature || 0,
                                heartRate: parseInt(e.target.value) || 0,
                                respiratoryRate: prev.vitalSigns?.respiratoryRate || 0,
                                weight: prev.vitalSigns?.weight || 0,
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Resp. (rpm)
                        </label>
                        <input
                          type="number"
                          value={formData.vitalSigns?.respiratoryRate || ""}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              vitalSigns: {
                                ...prev.vitalSigns,
                                temperature: prev.vitalSigns?.temperature || 0,
                                heartRate: prev.vitalSigns?.heartRate || 0,
                                respiratoryRate: parseInt(e.target.value) || 0,
                                weight: prev.vitalSigns?.weight || 0,
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Peso (kg)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.vitalSigns?.weight || ""}
                          onChange={(e) =>
                            setFormData(prev => ({
                              ...prev,
                              vitalSigns: {
                                ...prev.vitalSigns,
                                temperature: prev.vitalSigns?.temperature || 0,
                                heartRate: prev.vitalSigns?.heartRate || 0,
                                respiratoryRate: prev.vitalSigns?.respiratoryRate || 0,
                                weight: parseFloat(e.target.value) || 0,
                              },
                            }))
                          }
                          className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notas y costo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas
                      </label>
                      <textarea
                        value={formData.notes || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        placeholder="Observaciones adicionales..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Costo
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.cost || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer del modal */}
                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editingEvent ? handleUpdate : handleCreate}
                    className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingEvent ? "Actualizar" : "Guardar"}</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de detalles */}
        <AnimatePresence>
          {showDetailsModal && selectedEvent && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {/* Header del modal */}
                <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white">
                  <h2 className="text-xl font-bold">
                    Detalles del Evento Médico
                  </h2>
                  <button 
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Contenido del modal */}
                <div className="p-6 space-y-6">
                  {/* Información principal */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedEvent.title}
                    </h3>
                    <p className="text-gray-600">
                      {selectedEvent.animalName} ({selectedEvent.animalTag})
                    </p>
                    <div className="flex justify-center space-x-4 mt-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEventTypeColor(selectedEvent.eventType)}`}>
                        {getEventTypeText(selectedEvent.eventType)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedEvent.status)}`}>
                        {getStatusText(selectedEvent.status)}
                      </span>
                    </div>
                  </div>

                  {/* Descripción */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedEvent.description}</p>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-[#519a7c]" />
                        Información Temporal
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div>
                          <span className="text-gray-600">Fecha:</span>
                          <span className="ml-2 font-medium">
                            {formatFullDate(selectedEvent.date)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Veterinario:</span>
                          <span className="ml-2 font-medium">{selectedEvent.veterinarian}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Creado:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(selectedEvent.createdAt.split('T')[0])}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-[#519a7c]" />
                        Ubicación y Costo
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div>
                          <span className="text-gray-600">Ubicación:</span>
                          <span className="ml-2 font-medium">{selectedEvent.location}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Costo:</span>
                          <span className="ml-2 font-bold text-[#519a7c] text-lg">
                            ${selectedEvent.cost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Signos vitales */}
                  {selectedEvent.vitalSigns && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Signos Vitales</h4>
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Temperatura</p>
                            <p className="text-lg font-bold text-blue-600">{selectedEvent.vitalSigns.temperature}°C</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Pulso</p>
                            <p className="text-lg font-bold text-blue-600">{selectedEvent.vitalSigns.heartRate} bpm</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Respiración</p>
                            <p className="text-lg font-bold text-blue-600">{selectedEvent.vitalSigns.respiratoryRate} rpm</p>
                          </div>
                          <div className="text-center">
                            <p className="text-sm text-gray-600">Peso</p>
                            <p className="text-lg font-bold text-blue-600">{selectedEvent.vitalSigns.weight} kg</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Medicamentos */}
                  {selectedEvent.medications && selectedEvent.medications.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Medicamentos</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedEvent.medications.map((med, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                          >
                            {med}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notas */}
                  {selectedEvent.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Notas</h4>
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p className="text-gray-700">{selectedEvent.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer del modal */}
                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleEdit(selectedEvent);
                    }}
                    className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de confirmación de eliminación */}
        <AnimatePresence>
          {showDeleteModal && eventToDelete && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-lg w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {/* Header del modal */}
                <div className="flex items-center gap-4 p-6 border-b">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Eliminar Evento Médico
                    </h3>
                    <p className="text-sm text-gray-600">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>

                {/* Contenido del modal */}
                <div className="p-6">
                  <p className="text-gray-700 mb-6">
                    ¿Estás seguro de que deseas eliminar el evento médico "{eventToDelete.title}" 
                    de {eventToDelete.animalName}?
                    <br />
                    <br />
                    Toda la información del evento se perderá permanentemente.
                  </p>
                </div>

                {/* Footer del modal */}
                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setEventToDelete(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MedicalHistory;