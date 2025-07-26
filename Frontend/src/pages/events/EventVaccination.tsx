import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  MapPin,
  Syringe,
  DollarSign,
  UserCheck,
  Heart,
  ArrowLeft,
  Save,
  Plus,
  Activity,
  Edit,
  Trash2,
  X,
  FileText,
  RefreshCw,
  Search,
  Eye,
  Calendar,
  User,
  Shield,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

// Interfaz para el evento de vacunación
interface VaccinationEvent {
  id: string;
  bovineIds: string[];
  bovineName?: string;
  vaccineId: string;
  vaccineName: string;
  vaccineType: string;
  manufacturer: string;
  batchNumber: string;
  expirationDate: string;
  veterinarianId: string;
  veterinarianName: string;
  veterinarianLicense: string;
  applicationDate: string;
  applicationTime: string;
  doseAmount: number;
  doseUnit: string;
  applicationMethod: string;
  applicationSite: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  nextDueDate: string;
  vaccinationSchedule: string;
  cost: number;
  vaccineCost: number;
  veterinarianFee: number;
  complianceType: string;
  diseasesPrevented: string[];
  notes: string;
  status: "completed" | "pending" | "cancelled" | "scheduled";
  createdAt: string;
}

// Interfaz para eventos de timeline
interface TimelineEvent {
  id: string;
  type: "vaccination" | "purchase" | "sale" | "transport" | "health" | "feeding" | "breeding" | "general";
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  bovineId: string;
  bovineName?: string;
  details: {
    [key: string]: any;
  };
  status: "completed" | "pending" | "cancelled" | "in_progress";
  priority: "low" | "medium" | "high" | "critical";
  createdBy: string;
  cost?: number;
  notes?: string;
}

// Claves de localStorage
const VACCINATION_STORAGE_KEY = 'vaccination_events';
const TIMELINE_STORAGE_KEY = 'cattle_events';

// Función para agregar evento a timeline
const addEventToTimeline = (newEvent: TimelineEvent) => {
  try {
    const existingEvents = JSON.parse(localStorage.getItem(TIMELINE_STORAGE_KEY) || '[]');
    const filteredEvents = existingEvents.filter((e: TimelineEvent) => e.id !== newEvent.id);
    const updatedEvents = [newEvent, ...filteredEvents];
    localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(updatedEvents));
    window.dispatchEvent(new CustomEvent('eventsUpdated', { 
      detail: { events: updatedEvents } 
    }));
    console.log("✅ Evento agregado a timeline:", newEvent.id);
    return newEvent;
  } catch (error) {
    console.error("❌ Error agregando a timeline:", error);
    return newEvent;
  }
};

// Función para eliminar evento de timeline
const removeEventFromTimeline = (eventId: string) => {
  try {
    const existingEvents = JSON.parse(localStorage.getItem(TIMELINE_STORAGE_KEY) || '[]');
    const filteredEvents = existingEvents.filter((e: TimelineEvent) => e.id !== eventId);
    localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(filteredEvents));
    window.dispatchEvent(new CustomEvent('eventsUpdated', { 
      detail: { events: filteredEvents } 
    }));
    console.log("✅ Evento eliminado de timeline:", eventId);
  } catch (error) {
    console.error("❌ Error eliminando de timeline:", error);
  }
};

// Función para convertir evento de vacunación a evento de timeline
const convertToTimelineEvent = (vacEvent: VaccinationEvent): TimelineEvent => ({
  id: vacEvent.id,
  type: "vaccination",
  title: `Vacunación: ${vacEvent.vaccineName}`,
  description: `Aplicación de ${vacEvent.vaccineName} (${vacEvent.vaccineType})`,
  date: vacEvent.applicationDate,
  time: vacEvent.applicationTime,
  location: vacEvent.location.address,
  bovineId: vacEvent.bovineIds.filter(id => id.trim()).join(", "),
  bovineName: vacEvent.bovineName,
  details: {
    vaccine: vacEvent.vaccineName,
    veterinarian: vacEvent.veterinarianName,
    dose: `${vacEvent.doseAmount} ${vacEvent.doseUnit}`,
    method: vacEvent.applicationMethod,
    site: vacEvent.applicationSite,
    manufacturer: vacEvent.manufacturer,
    batchNumber: vacEvent.batchNumber,
    nextDueDate: vacEvent.nextDueDate || "No programada",
    diseasesPrevented: vacEvent.diseasesPrevented.join(", ") || "No especificadas"
  },
  status: vacEvent.status === "completed" ? "completed" : 
          vacEvent.status === "pending" ? "pending" : 
          vacEvent.status === "scheduled" ? "pending" : "cancelled",
  priority: vacEvent.complianceType === "mandatory" ? "high" : "medium",
  createdBy: vacEvent.veterinarianName || "Usuario",
  cost: vacEvent.cost,
  notes: vacEvent.notes
});

const EventVaccination: React.FC = () => {
  // Estados principales
  const [events, setEvents] = useState<VaccinationEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<VaccinationEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<VaccinationEvent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");

  // Estado del formulario
  const [formData, setFormData] = useState<VaccinationEvent>({
    id: "",
    bovineIds: [""],
    bovineName: "",
    vaccineId: "",
    vaccineName: "",
    vaccineType: "",
    manufacturer: "",
    batchNumber: "",
    expirationDate: "",
    veterinarianId: "",
    veterinarianName: "",
    veterinarianLicense: "",
    applicationDate: new Date().toISOString().split("T")[0],
    applicationTime: new Date().toTimeString().slice(0, 5),
    doseAmount: 0,
    doseUnit: "ml",
    applicationMethod: "",
    applicationSite: "",
    location: {
      lat: 17.9995,
      lng: -92.9476,
      address: "Villahermosa, Tabasco, México",
    },
    nextDueDate: "",
    vaccinationSchedule: "",
    cost: 0,
    vaccineCost: 0,
    veterinarianFee: 0,
    complianceType: "",
    diseasesPrevented: [],
    notes: "",
    status: "scheduled",
    createdAt: new Date().toISOString(),
  });

  // Cargar eventos del localStorage
  useEffect(() => {
    loadEvents();
  }, []);

  // Filtrar eventos cuando cambien los filtros
  useEffect(() => {
    let filtered = [...events];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.bovineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.bovineIds.some(id => id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        event.veterinarianName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo
    if (selectedType !== "all") {
      filtered = filtered.filter(event => event.vaccineType === selectedType);
    }

    // Filtrar por estado
    if (selectedStatus !== "all") {
      filtered = filtered.filter(event => event.status === selectedStatus);
    }

    // Filtrar por fecha
    if (selectedDate !== "all") {
      const today = new Date().toISOString().split("T")[0];
      const thisWeek = new Date();
      thisWeek.setDate(thisWeek.getDate() - 7);
      const thisMonth = new Date();
      thisMonth.setMonth(thisMonth.getMonth() - 1);

      switch (selectedDate) {
        case "today":
          filtered = filtered.filter(event => event.applicationDate === today);
          break;
        case "week":
          filtered = filtered.filter(event => 
            new Date(event.applicationDate) >= thisWeek
          );
          break;
        case "month":
          filtered = filtered.filter(event => 
            new Date(event.applicationDate) >= thisMonth
          );
          break;
      }
    }

    // Ordenar por fecha (más reciente primero)
    filtered.sort((a, b) => 
      new Date(b.applicationDate + " " + b.applicationTime).getTime() - 
      new Date(a.applicationDate + " " + a.applicationTime).getTime()
    );

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedType, selectedStatus, selectedDate]);

  // Calcular estadísticas
  const stats = {
    total: events.length,
    completed: events.filter(e => e.status === "completed").length,
    pending: events.filter(e => e.status === "pending" || e.status === "scheduled").length,
    nextDue: events.filter(e => e.nextDueDate && new Date(e.nextDueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length,
  };

  const loadEvents = () => {
    try {
      const stored = localStorage.getItem(VACCINATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("📋 Eventos de vacunación cargados:", parsed.length);
        setEvents(parsed);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("❌ Error cargando eventos:", error);
      setEvents([]);
    }
  };

  const saveEvents = (newEvents: VaccinationEvent[]) => {
    try {
      localStorage.setItem(VACCINATION_STORAGE_KEY, JSON.stringify(newEvents));
      console.log("💾 Eventos guardados:", newEvents.length);
      setEvents(newEvents);
    } catch (error) {
      console.error("❌ Error guardando eventos:", error);
    }
  };

  // Función para crear/actualizar evento
  const handleSaveEvent = async () => {
    setLoading(true);
    
    try {
      const eventToSave: VaccinationEvent = {
        ...formData,
        id: editingEvent?.id || `vac-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        bovineIds: formData.bovineIds.filter(id => id.trim()),
        diseasesPrevented: formData.diseasesPrevented.filter(d => d.trim()),
        createdAt: editingEvent?.createdAt || new Date().toISOString(),
      };

      let newEvents: VaccinationEvent[];
      if (editingEvent) {
        newEvents = events.map(e => e.id === editingEvent.id ? eventToSave : e);
      } else {
        newEvents = [eventToSave, ...events];
      }

      saveEvents(newEvents);
      
      // Agregar a timeline
      const timelineEvent = convertToTimelineEvent(eventToSave);
      addEventToTimeline(timelineEvent);
      
      setShowForm(false);
      setEditingEvent(null);
      resetForm();
      alert(editingEvent ? "Evento actualizado exitosamente" : "Evento de vacunación registrado exitosamente");
      
    } catch (error) {
      console.error("❌ Error al guardar:", error);
      alert("Error al guardar el evento");
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar evento
  const handleDelete = async (eventId: string) => {
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) return;

    const confirmed = confirm(`¿Eliminar vacunación "${eventToDelete.vaccineName}"?`);
    if (!confirmed) return;

    setDeleteLoading(eventId);

    try {
      const newEvents = events.filter(e => e.id !== eventId);
      setEvents(newEvents);
      localStorage.setItem(VACCINATION_STORAGE_KEY, JSON.stringify(newEvents));
      removeEventFromTimeline(eventId);
      
      if (editingEvent?.id === eventId) {
        setEditingEvent(null);
        setShowForm(false);
      }
      
      alert("Evento eliminado exitosamente");
    } catch (error) {
      console.error("❌ Error eliminando:", error);
      alert("Error al eliminar el evento");
    } finally {
      setDeleteLoading(null);
    }
  };

  // Función para editar evento
  const handleEdit = (event: VaccinationEvent) => {
    setFormData(event);
    setEditingEvent(event);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      bovineIds: [""],
      bovineName: "",
      vaccineId: "",
      vaccineName: "",
      vaccineType: "",
      manufacturer: "",
      batchNumber: "",
      expirationDate: "",
      veterinarianId: "",
      veterinarianName: "",
      veterinarianLicense: "",
      applicationDate: new Date().toISOString().split("T")[0],
      applicationTime: new Date().toTimeString().slice(0, 5),
      doseAmount: 0,
      doseUnit: "ml",
      applicationMethod: "",
      applicationSite: "",
      location: {
        lat: 17.9995,
        lng: -92.9476,
        address: "Villahermosa, Tabasco, México",
      },
      nextDueDate: "",
      vaccinationSchedule: "",
      cost: 0,
      vaccineCost: 0,
      veterinarianFee: 0,
      complianceType: "",
      diseasesPrevented: [],
      notes: "",
      status: "scheduled",
      createdAt: new Date().toISOString(),
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Completado";
      case "pending": return "Pendiente";
      case "scheduled": return "Programado";
      case "cancelled": return "Cancelado";
      default: return "Desconocido";
    }
  };

  const getVaccineTypeIcon = (type: string) => {
    switch (type) {
      case "viral": return "🦠";
      case "bacterial": return "🔬";
      case "parasitic": return "🐛";
      case "combination": return "💊";
      case "toxoid": return "🧪";
      default: return "💉";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header del formulario */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  setShowForm(false);
                  setEditingEvent(null);
                  resetForm();
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {editingEvent ? "Editar Vacunación" : "Nueva Vacunación"}
                </h1>
                <p className="text-gray-600">
                  {editingEvent ? "Actualiza los datos del evento" : "Registra un nuevo evento de vacunación"}
                </p>
              </div>
            </div>
          </div>

          {/* Formulario simple */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nombre de la Vacuna"
                    placeholder="Ej: Triple Viral Bovina"
                    value={formData.vaccineName}
                    onChange={(e) => setFormData({...formData, vaccineName: e.target.value})}
                    required
                  />
                  <Input
                    label="Nombre del Animal"
                    placeholder="Ej: Esperanza"
                    value={formData.bovineName}
                    onChange={(e) => setFormData({...formData, bovineName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo de Vacuna
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      value={formData.vaccineType}
                      onChange={(e) => setFormData({...formData, vaccineType: e.target.value})}
                    >
                      <option value="">Selecciona tipo</option>
                      <option value="viral">Viral</option>
                      <option value="bacterial">Bacteriana</option>
                      <option value="parasitic">Parasitaria</option>
                      <option value="combination">Combinada</option>
                      <option value="toxoid">Toxoide</option>
                    </select>
                  </div>
                  <Input
                    label="Fecha de Aplicación"
                    type="date"
                    value={formData.applicationDate}
                    onChange={(e) => setFormData({...formData, applicationDate: e.target.value})}
                    required
                  />
                  <Input
                    label="Hora"
                    type="time"
                    value={formData.applicationTime}
                    onChange={(e) => setFormData({...formData, applicationTime: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Veterinario"
                    placeholder="Dr. María González"
                    value={formData.veterinarianName}
                    onChange={(e) => setFormData({...formData, veterinarianName: e.target.value})}
                    required
                  />
                  <Input
                    label="Ubicación"
                    placeholder="Corral A - Sector Norte"
                    value={formData.location.address}
                    onChange={(e) => setFormData({
                      ...formData, 
                      location: {...formData.location, address: e.target.value}
                    })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Costo Total"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.cost.toString()}
                    onChange={(e) => setFormData({...formData, cost: parseFloat(e.target.value) || 0})}
                    leftIcon={<DollarSign className="h-4 w-4" />}
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Estado
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as VaccinationEvent['status']})}
                    >
                      <option value="scheduled">Programado</option>
                      <option value="completed">Completado</option>
                      <option value="pending">Pendiente</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </div>
                </div>

                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Notas adicionales..."
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                />

                <div className="flex space-x-4">
                  <Button
                    onClick={() => {
                      setShowForm(false);
                      setEditingEvent(null);
                      resetForm();
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveEvent}
                    disabled={loading || !formData.vaccineName || !formData.veterinarianName}
                    variant="primary"
                    className="flex-1"
                    leftIcon={loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  >
                    {loading ? "Guardando..." : editingEvent ? "Actualizar" : "Guardar"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl">
              <Syringe className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Eventos de Vacunación</h1>
              <p className="text-gray-600">Gestiona las vacunas de tu ganado</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              leftIcon={<Calendar className="h-4 w-4" />}
              className="bg-green-500 text-white border-green-500 hover:bg-green-600"
            >
              Ver Timeline
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              variant="primary"
              leftIcon={<Plus className="h-4 w-4" />}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Nuevo Evento
            </Button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Vacunas</p>
                <p className="text-3xl font-bold text-green-600">{stats.total}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completadas</p>
                <p className="text-3xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-xl">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Próximas</p>
                <p className="text-3xl font-bold text-orange-600">{stats.nextDue}</p>
              </div>
              <div className="bg-orange-100 p-3 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filtros */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por vaca o evento..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">Todos los tipos</option>
              <option value="viral">Viral</option>
              <option value="bacterial">Bacteriana</option>
              <option value="parasitic">Parasitaria</option>
              <option value="combination">Combinada</option>
              <option value="toxoid">Toxoide</option>
            </select>

            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completado</option>
              <option value="pending">Pendiente</option>
              <option value="scheduled">Programado</option>
              <option value="cancelled">Cancelado</option>
            </select>

            <select
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>
        </div>

        {/* Lista de eventos */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                <div className="p-6">
                  {/* Header de la card */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-100 p-2 rounded-xl">
                        <span className="text-2xl">{getVaccineTypeIcon(event.vaccineType)}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{event.vaccineName}</h3>
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {getStatusText(event.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Información del animal */}
                  <div className="mb-4">
                    <p className="text-gray-600 text-sm">
                      {event.bovineName && (
                        <span className="font-medium text-gray-900">{event.bovineName} • </span>
                      )}
                      {event.bovineIds.filter(id => id.trim()).join(", ")}
                    </p>
                  </div>

                  {/* Detalles */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {formatDate(event.applicationDate)}, {event.applicationTime}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {event.location.address}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {event.veterinarianName}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2" />
                      ${event.cost.toLocaleString()}
                    </div>
                  </div>

                  {/* Notas */}
                  {event.notes && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {event.notes}
                    </p>
                  )}

                  {/* Acciones */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-1">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={deleteLoading === event.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {deleteLoading === event.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {event.nextDueDate && (
                      <span className="text-xs text-gray-500">
                        Próxima: {formatDate(event.nextDueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Estado vacío */}
        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Syringe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {events.length === 0 ? "No hay vacunaciones registradas" : "No se encontraron eventos"}
            </h3>
            <p className="text-gray-600 mb-6">
              {events.length === 0 
                ? "Comienza registrando tu primera vacunación"
                : "Intenta ajustar los filtros de búsqueda"
              }
            </p>
            {events.length === 0 && (
              <Button
                onClick={() => setShowForm(true)}
                variant="primary"
                leftIcon={<Plus className="h-4 w-4" />}
              >
                Registrar Primera Vacunación
              </Button>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default EventVaccination;