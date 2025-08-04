import React, { useState, useEffect } from "react";

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
  const [showFilters, setShowFilters] = useState<boolean>(false);

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
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm mx-4">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#519a7c]"></div>
            <p className="text-gray-600">Cargando eventos...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg max-w-sm mx-4">
          <div className="text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <p className="text-red-600 font-semibold mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Recargar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-2 sm:p-3">
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4">
        {/* Header Principal - Aplicando contenedor con límite de ancho */}
        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-6 mb-6">
          {/* Título y Botón Principal */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center space-x-4 min-w-0 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-[#519a7c] to-[#4a8970] rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white text-xl">🩺</span>
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-800 truncate">
                  Historial Médico
                </h1>
                <p className="text-sm text-gray-600 mt-1 truncate">
                  Gestión completa de eventos médicos del ganado
                </p>
              </div>
            </div>
            <button 
              onClick={handleNew}
              className="px-6 py-3 bg-gradient-to-r from-[#f4ac3a] to-[#e09b2a] text-white rounded-xl hover:from-[#e09b2a] hover:to-[#d08920] flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg font-medium flex-shrink-0"
            >
              <span>➕</span>
              <span>Nuevo Evento</span>
            </button>
          </div>

          {/* Estadísticas - Grid responsivo mejorado */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-blue-100 font-medium truncate">Total Eventos</p>
                  <p className="text-2xl font-bold">{healthStats.totalEvents}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📊</span>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-purple-100 font-medium truncate">Vacunaciones</p>
                  <p className="text-2xl font-bold">{healthStats.vaccinationsCount}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">💉</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-red-100 font-medium truncate">Enfermedades</p>
                  <p className="text-2xl font-bold">{healthStats.illnessesCount}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🤒</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-green-100 font-medium truncate">Score Salud</p>
                  <p className="text-2xl font-bold">{healthStats.healthScore}%</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">📈</span>
                </div>
              </div>
            </div>
          </div>

          {/* Búsqueda y Filtros */}
          <div className="space-y-4">
            {/* Barra de Búsqueda */}
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              <input
                type="text"
                placeholder="Buscar por animal, evento, veterinario..."
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-lg placeholder-gray-500 transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-4 py-3 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors"
              >
                <span>🔧</span>
                <span className="font-medium">Filtros</span>
                <span className={`transition-transform ${showFilters ? 'rotate-180' : ''}`}>⬇️</span>
              </button>
            </div>

            <div className={`${showFilters ? 'block' : 'hidden'} lg:grid lg:grid-cols-2 lg:gap-4 space-y-3 lg:space-y-0`}>
              <select
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-lg transition-all duration-300"
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
              >
                <option value="all">🏥 Todos los tipos de eventos</option>
                <option value="vaccination">💉 Vacunaciones</option>
                <option value="illness">🤒 Enfermedades</option>
                <option value="treatment">💊 Tratamientos</option>
                <option value="checkup">🔍 Chequeos</option>
                <option value="surgery">⚕️ Cirugías</option>
              </select>

              <select
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-lg transition-all duration-300"
                value={selectedVeterinarian}
                onChange={(e) => setSelectedVeterinarian(e.target.value)}
              >
                <option value="all">👨‍⚕️ Todos los veterinarios</option>
                <option value="Dr. García">Dr. García</option>
                <option value="Dr. Martínez">Dr. Martínez</option>
                <option value="Dr. López">Dr. López</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content Area - Cards de Eventos con grid responsivo corregido */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🩺</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-3">
              No hay eventos médicos
            </h3>
            <p className="text-sm text-gray-600 mb-6 max-w-sm mx-auto">
              No se encontraron eventos con los filtros seleccionados
            </p>
            <button 
              onClick={handleNew}
              className="px-4 py-2 bg-gradient-to-r from-[#519a7c] to-[#4a8970] text-white rounded-lg hover:from-[#4a8970] hover:to-[#3d7a63] flex items-center space-x-2 mx-auto transition-all duration-300 shadow-md text-sm font-medium"
            >
              <span>➕</span>
              <span>Crear Primer Evento</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white/95 backdrop-blur-sm rounded-lg shadow-md border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Header de la tarjeta */}
                <div className="bg-gradient-to-r from-[#519a7c] to-[#4a8970] p-4 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-bold text-sm leading-tight mb-1 text-white line-clamp-2">
                          {event.title}
                        </h3>
                        <div className="flex items-center space-x-2 text-white/90">
                          <span className="text-xs font-medium truncate">{event.animalName}</span>
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-full flex-shrink-0">{event.animalTag}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getEventTypeColor(event.eventType)}`}>
                        {getEventTypeText(event.eventType)}
                      </span>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contenido de la tarjeta */}
                <div className="p-4 space-y-3">
                  {/* Información básica */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Fecha</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{formatDate(event.date)}</p>
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Veterinario</p>
                      <p className="text-xs font-bold text-gray-800 truncate">{event.veterinarian}</p>
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded min-w-0">
                    <span className="text-gray-500 flex-shrink-0">📍</span>
                    <span className="text-xs text-gray-700 font-medium truncate">{event.location}</span>
                  </div>

                  {/* Descripción */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Signos vitales */}
                  {event.vitalSigns && (
                    <div className="bg-blue-50 rounded p-2">
                      <p className="text-xs font-semibold text-blue-800 mb-1 uppercase tracking-wide">Signos Vitales</p>
                      <div className="grid grid-cols-2 gap-1">
                        <div className="text-center">
                          <p className="text-xs text-blue-600">Temp.</p>
                          <p className="text-xs font-bold text-blue-800">{event.vitalSigns.temperature}°C</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-blue-600">Peso</p>
                          <p className="text-xs font-bold text-blue-800">{event.vitalSigns.weight}kg</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Costo */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Costo</span>
                    <span className="text-base font-bold text-[#f4ac3a]">
                      ${event.cost.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="bg-gray-50/80 backdrop-blur-sm px-4 py-3 flex justify-between items-center border-t border-gray-100">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleView(event)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-all duration-200"
                      title="Ver detalles"
                    >
                      <span>👁️</span>
                    </button>
                    <button 
                      onClick={() => handleEdit(event)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-all duration-200"
                      title="Editar"
                    >
                      <span>✏️</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(event)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-all duration-200"
                      title="Eliminar"
                    >
                      <span>🗑️</span>
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded text-center flex-shrink-0">
                    {formatDate(event.createdAt.split('T')[0])}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de formulario - Con ancho limitado */}
        {showForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
              {/* Header del modal */}
              <div className="bg-gradient-to-r from-[#519a7c] to-[#4a8970] text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                <div className="min-w-0 flex-1 pr-4">
                  <h2 className="text-lg font-bold truncate">
                    {editingEvent ? "✏️ Editar Evento" : "➕ Nuevo Evento"}
                  </h2>
                  <p className="text-white/80 text-sm mt-1 truncate">
                    {editingEvent ? "Modifica la información" : "Registra nuevo evento"}
                  </p>
                </div>
                <button 
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <span className="text-lg">❌</span>
                </button>
              </div>

              {/* Contenido del formulario */}
              <div className="p-6 space-y-4">
                {/* Información básica */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Animal *
                    </label>
                    <input
                      type="text"
                      value={formData.animalName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm ${
                        formErrors.animalName ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Ej: Esperanza"
                    />
                    {formErrors.animalName && (
                      <p className="text-red-500 text-xs mt-1">⚠️ {formErrors.animalName}</p>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm"
                      placeholder="Ej: TAG-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo de Evento *
                    </label>
                    <select
                      value={formData.eventType || "vaccination"}
                      onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as EventType }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm ${
                        formErrors.eventType ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    >
                      <option value="vaccination">💉 Vacunación</option>
                      <option value="illness">🤒 Enfermedad</option>
                      <option value="treatment">💊 Tratamiento</option>
                      <option value="checkup">🔍 Chequeo</option>
                      <option value="surgery">⚕️ Cirugía</option>
                      <option value="medication">💉 Medicamento</option>
                      <option value="exam">🩺 Examen</option>
                      <option value="observation">👁️ Observación</option>
                    </select>
                    {formErrors.eventType && (
                      <p className="text-red-500 text-xs mt-1">⚠️ {formErrors.eventType}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha *
                    </label>
                    <input
                      type="date"
                      value={formData.date || new Date().toISOString().substr(0, 10)}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm ${
                        formErrors.date ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                    />
                    {formErrors.date && (
                      <p className="text-red-500 text-xs mt-1">⚠️ {formErrors.date}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={formData.title || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm ${
                      formErrors.title ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Ej: Vacuna antiaftosa"
                  />
                  {formErrors.title && (
                    <p className="text-red-500 text-xs mt-1">⚠️ {formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <textarea
                    value={formData.description || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm resize-none ${
                      formErrors.description ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Descripción del evento..."
                  />
                  {formErrors.description && (
                    <p className="text-red-500 text-xs mt-1">⚠️ {formErrors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Veterinario *
                    </label>
                    <input
                      type="text"
                      value={formData.veterinarian || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm ${
                        formErrors.veterinarian ? "border-red-300 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Dr. García"
                    />
                    {formErrors.veterinarian && (
                      <p className="text-red-500 text-xs mt-1">⚠️ {formErrors.veterinarian}</p>
                    )}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación *
                  </label>
                  <input
                    type="text"
                    value={formData.location || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm ${
                      formErrors.location ? "border-red-300 bg-red-50" : "border-gray-300"
                    }`}
                    placeholder="Establo Principal"
                  />
                  {formErrors.location && (
                    <p className="text-red-500 text-xs mt-1">⚠️ {formErrors.location}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent text-sm resize-none"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>

              {/* Footer del modal */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end sm:space-x-3 rounded-b-lg">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  ❌ Cancelar
                </button>
                <button
                  onClick={editingEvent ? handleUpdate : handleCreate}
                  className="px-4 py-2 bg-gradient-to-r from-[#519a7c] to-[#4a8970] text-white rounded-lg hover:from-[#4a8970] hover:to-[#3d7a63] flex items-center justify-center space-x-2 transition-all duration-300 shadow-md font-medium text-sm"
                >
                  <span>💾</span>
                  <span>{editingEvent ? "Actualizar" : "Guardar"}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles - Con ancho limitado */}
        {showDetailsModal && selectedEvent && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
              {/* Header del modal */}
              <div className="bg-gradient-to-r from-[#519a7c] to-[#4a8970] text-white px-6 py-4 flex justify-between items-center rounded-t-lg">
                <div className="min-w-0 flex-1 pr-4">
                  <h2 className="text-lg font-bold truncate">
                    🔍 Detalles del Evento
                  </h2>
                  <p className="text-white/80 text-sm mt-1 truncate">
                    Información completa del evento
                  </p>
                </div>
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                >
                  <span className="text-lg">❌</span>
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 space-y-6">
                {/* Información principal */}
                <div className="text-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                  <h3 className="text-3xl font-bold text-gray-800 mb-3">
                    {selectedEvent.title}
                  </h3>
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <span className="text-lg font-semibold text-gray-700">🐄 {selectedEvent.animalName}</span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {selectedEvent.animalTag}
                    </span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getEventTypeColor(selectedEvent.eventType)}`}>
                      {getEventTypeText(selectedEvent.eventType)}
                    </span>
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(selectedEvent.status)}`}>
                      {getStatusText(selectedEvent.status)}
                    </span>
                  </div>
                </div>

                {/* Descripción */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-bold text-lg text-gray-800 mb-3 flex items-center">
                    📋 Descripción
                  </h4>
                  <p className="text-gray-700 leading-relaxed text-lg">{selectedEvent.description}</p>
                </div>

                {/* Detalles en grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-green-50 rounded-2xl p-6">
                    <h4 className="font-bold text-lg text-green-800 mb-4 flex items-center">
                      📅 Información Temporal
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Fecha:</span>
                        <span className="font-bold text-gray-800">
                          {formatFullDate(selectedEvent.date)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Veterinario:</span>
                        <span className="font-bold text-gray-800">{selectedEvent.veterinarian}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Registrado:</span>
                        <span className="font-bold text-gray-800">
                          {formatDate(selectedEvent.createdAt.split('T')[0])}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-2xl p-6">
                    <h4 className="font-bold text-lg text-orange-800 mb-4 flex items-center">
                      📍 Ubicación y Costo
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Ubicación:</span>
                        <span className="font-bold text-gray-800">{selectedEvent.location}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Costo Total:</span>
                        <span className="font-bold text-2xl text-[#f4ac3a]">
                          ${selectedEvent.cost.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signos vitales */}
                {selectedEvent.vitalSigns && (
                  <div className="bg-blue-50 rounded-2xl p-6">
                    <h4 className="font-bold text-lg text-blue-800 mb-4 flex items-center">
                      🩺 Signos Vitales
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="text-center bg-white rounded-xl p-4">
                        <p className="text-sm text-blue-600 font-medium mb-1">Temperatura</p>
                        <p className="text-2xl font-bold text-blue-800">{selectedEvent.vitalSigns.temperature}°C</p>
                      </div>
                      <div className="text-center bg-white rounded-xl p-4">
                        <p className="text-sm text-blue-600 font-medium mb-1">Pulso</p>
                        <p className="text-2xl font-bold text-blue-800">{selectedEvent.vitalSigns.heartRate} bpm</p>
                      </div>
                      <div className="text-center bg-white rounded-xl p-4">
                        <p className="text-sm text-blue-600 font-medium mb-1">Respiración</p>
                        <p className="text-2xl font-bold text-blue-800">{selectedEvent.vitalSigns.respiratoryRate} rpm</p>
                      </div>
                      <div className="text-center bg-white rounded-xl p-4">
                        <p className="text-sm text-blue-600 font-medium mb-1">Peso</p>
                        <p className="text-2xl font-bold text-blue-800">{selectedEvent.vitalSigns.weight} kg</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Medicamentos */}
                {selectedEvent.medications && selectedEvent.medications.length > 0 && (
                  <div className="bg-purple-50 rounded-2xl p-6">
                    <h4 className="font-bold text-lg text-purple-800 mb-4 flex items-center">
                      💊 Medicamentos Administrados
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedEvent.medications.map((med, idx) => (
                        <span
                          key={idx}
                          className="px-4 py-2 bg-purple-200 text-purple-800 rounded-xl text-sm font-semibold"
                        >
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notas */}
                {selectedEvent.notes && (
                  <div className="bg-yellow-50 rounded-2xl p-6 border-l-4 border-yellow-400">
                    <h4 className="font-bold text-lg text-yellow-800 mb-3 flex items-center">
                      📝 Notas Adicionales
                    </h4>
                    <p className="text-gray-700 leading-relaxed">{selectedEvent.notes}</p>
                  </div>
                )}
              </div>

              {/* Footer del modal */}
              <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 sm:justify-end sm:space-x-4 rounded-b-lg">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  ❌ Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleEdit(selectedEvent);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-[#519a7c] to-[#4a8970] text-white rounded-xl hover:from-[#4a8970] hover:to-[#3d7a63] flex items-center justify-center space-x-2 transition-all duration-300 shadow-lg font-medium"
                >
                  <span>✏️</span>
                  <span>Editar Evento</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && eventToDelete && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
              {/* Header del modal */}
              <div className="flex items-center gap-4 p-6 border-b">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-red-600 text-xl">⚠️</span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    🗑️ Eliminar Evento
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    ⚠️ Acción irreversible
                  </p>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                <div className="bg-red-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-800 font-medium text-center text-sm">
                    ¿Eliminar este evento médico?
                  </p>
                  <p className="text-red-700 font-bold text-sm text-center mt-2 break-words">
                    "{eventToDelete.title}"
                  </p>
                  <p className="text-gray-600 text-center mt-1 text-sm">
                    de <strong>{eventToDelete.animalName}</strong>
                  </p>
                </div>
                <p className="text-gray-600 text-center text-xs">
                  Se perderá toda la información permanentemente.
                </p>
              </div>

              {/* Footer del modal */}
              <div className="px-6 pb-6 flex flex-col gap-3 sm:flex-row sm:space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setEventToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  ❌ Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 flex items-center justify-center space-x-2 transition-all duration-300 shadow-md font-medium text-sm"
                >
                  <span>🗑️</span>
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MedicalHistory;