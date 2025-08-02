import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import {
  MapPin,
  Syringe,
  DollarSign,
  Heart,
  ArrowLeft,
  Save,
  Plus,
  Activity,
  Edit,
  Trash2,
  X,
  RefreshCw,
  Search,
  Eye,
  Calendar,
  User,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

// Interfaces
interface VaccinationEvent {
  id: string;
  bovineIds: string[];
  bovineName?: string;
  vaccineName: string;
  vaccineType: string;
  manufacturer: string;
  batchNumber: string;
  expirationDate: string;
  veterinarianName: string;
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
  cost: number;
  diseasesPrevented: string[];
  notes: string;
  status: "completed" | "pending" | "cancelled" | "scheduled";
  createdAt: string;
}

interface TimelineEvent {
  id: string;
  type: "vaccination";
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  bovineId: string;
  bovineName?: string;
  details: { [key: string]: any };
  status: "completed" | "pending" | "cancelled" | "in_progress";
  priority: "low" | "medium" | "high" | "critical";
  createdBy: string;
  cost?: number;
  notes?: string;
}

// Constantes
const VACCINATION_STORAGE_KEY = 'vaccination_events';
const TIMELINE_STORAGE_KEY = 'cattle_events';

// Funciones auxiliares
const addEventToTimeline = (event: TimelineEvent): void => {
  try {
    const existing = JSON.parse(localStorage.getItem(TIMELINE_STORAGE_KEY) || '[]');
    const filtered = existing.filter((e: TimelineEvent) => e.id !== event.id);
    const updated = [event, ...filtered];
    localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('eventsUpdated', { detail: { events: updated } }));
  } catch (error) {
    console.error('Error agregando a timeline:', error);
  }
};

const removeEventFromTimeline = (eventId: string): void => {
  try {
    const existing = JSON.parse(localStorage.getItem(TIMELINE_STORAGE_KEY) || '[]');
    const filtered = existing.filter((e: TimelineEvent) => e.id !== eventId);
    localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('eventsUpdated', { detail: { events: filtered } }));
  } catch (error) {
    console.error('Error eliminando de timeline:', error);
  }
};

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
  },
  status: "completed",
  priority: "medium",
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
  const [viewingEvent, setViewingEvent] = useState<VaccinationEvent | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Estado del formulario
  const [formData, setFormData] = useState<VaccinationEvent>({
    id: "",
    bovineIds: [""],
    bovineName: "",
    vaccineName: "",
    vaccineType: "",
    manufacturer: "",
    batchNumber: "",
    expirationDate: "",
    veterinarianName: "",
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
    cost: 0,
    diseasesPrevented: [],
    notes: "",
    status: "scheduled",
    createdAt: new Date().toISOString(),
  });

  // Cargar eventos
  useEffect(() => {
    loadEvents();
  }, []);

  // Filtrar eventos
  useEffect(() => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.vaccineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.bovineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.bovineIds.some(id => id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        event.veterinarianName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== "all") {
      filtered = filtered.filter(event => event.vaccineType === selectedType);
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter(event => event.status === selectedStatus);
    }

    filtered.sort((a, b) => 
      new Date(b.applicationDate + " " + b.applicationTime).getTime() - 
      new Date(a.applicationDate + " " + a.applicationTime).getTime()
    );

    setFilteredEvents(filtered);
  }, [events, searchTerm, selectedType, selectedStatus]);

  // Funciones
  const loadEvents = (): void => {
    try {
      const stored = localStorage.getItem(VACCINATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setEvents(parsed);
      }
    } catch (error) {
      console.error("Error cargando eventos:", error);
      setEvents([]);
    }
  };

  const saveEvents = (newEvents: VaccinationEvent[]): void => {
    try {
      localStorage.setItem(VACCINATION_STORAGE_KEY, JSON.stringify(newEvents));
      setEvents(newEvents);
    } catch (error) {
      console.error("Error guardando eventos:", error);
    }
  };

  const getCurrentLocation = async (): Promise<void> => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada");
      return;
    }

    setGettingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
        );
        const data = await response.json();
        const address = data.city ? 
          `${data.city}, ${data.principalSubdivision}, ${data.countryName}` :
          `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

        setFormData(prev => ({
          ...prev,
          location: { lat: latitude, lng: longitude, address }
        }));

        alert("✅ Ubicación obtenida exitosamente");
      } catch (geocodeError) {
        setFormData(prev => ({
          ...prev,
          location: {
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          }
        }));
        alert("✅ Coordenadas obtenidas");
      }
    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      alert("❌ No se pudo obtener la ubicación");
    } finally {
      setGettingLocation(false);
    }
  };

  const handleSaveEvent = async (): Promise<void> => {
    if (!formData.vaccineName || !formData.veterinarianName) {
      alert("Por favor completa los campos requeridos");
      return;
    }

    setLoading(true);
    
    try {
      const eventToSave: VaccinationEvent = {
        ...formData,
        id: editingEvent?.id || `vac-${Date.now()}`,
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
      
      const timelineEvent = convertToTimelineEvent(eventToSave);
      addEventToTimeline(timelineEvent);
      
      setShowForm(false);
      setEditingEvent(null);
      resetForm();
      alert(editingEvent ? "Evento actualizado" : "Evento guardado exitosamente");
      
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el evento");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (event: VaccinationEvent): void => {
    setFormData(event);
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleView = (event: VaccinationEvent): void => {
    setViewingEvent(event);
  };

  const closeViewModal = (): void => {
    setViewingEvent(null);
  };

  const handleDelete = async (eventId: string): Promise<void> => {
    const eventToDelete = events.find(e => e.id === eventId);
    if (!eventToDelete) return;

    const confirmed = confirm(
      `¿Eliminar vacunación "${eventToDelete.vaccineName}"?\n\n` +
      `Animal: ${eventToDelete.bovineName || eventToDelete.bovineIds.join(", ")}\n` +
      `Esta acción no se puede deshacer.`
    );
    
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
        resetForm();
      }

      if (viewingEvent?.id === eventId) {
        setViewingEvent(null);
      }
      
      alert("✅ Evento eliminado exitosamente");
      
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("❌ Error al eliminar el evento");
    } finally {
      setDeleteLoading(null);
    }
  };

  const resetForm = (): void => {
    setFormData({
      id: "",
      bovineIds: [""],
      bovineName: "",
      vaccineName: "",
      vaccineType: "",
      manufacturer: "",
      batchNumber: "",
      expirationDate: "",
      veterinarianName: "",
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
      cost: 0,
      diseasesPrevented: [],
      notes: "",
      status: "scheduled",
      createdAt: new Date().toISOString(),
    });
  };

  // Funciones auxiliares de UI
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case "completed": return "Completado";
      case "pending": return "Pendiente";
      case "scheduled": return "Programado";
      case "cancelled": return "Cancelado";
      default: return "Desconocido";
    }
  };

  const getVaccineTypeIcon = (type: string): string => {
    switch (type) {
      case "viral": return "🦠";
      case "bacterial": return "🔬";
      case "parasitic": return "🐛";
      case "combination": return "💊";
      case "toxoid": return "🧪";
      default: return "💉";
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  // Calcular estadísticas
  const stats = {
    total: events.length,
    completed: events.filter(e => e.status === "completed").length,
    pending: events.filter(e => e.status === "pending" || e.status === "scheduled").length,
    nextDue: events.filter(e => e.nextDueDate && new Date(e.nextDueDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length,
  };

  // Renderizado del formulario
  if (showForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
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

          <Card>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nombre de la Vacuna *"
                    placeholder="Ej: Triple Viral Bovina"
                    value={formData.vaccineName}
                    onChange={(e) => setFormData({...formData, vaccineName: e.target.value})}
                    required
                  />
                  <Input
                    label="Nombre del Animal"
                    placeholder="Ej: Esperanza"
                    value={formData.bovineName || ""}
                    onChange={(e) => setFormData({...formData, bovineName: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo de Vacuna
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
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
                    label="Fecha de Aplicación *"
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
                    label="Veterinario *"
                    placeholder="Dr. María González"
                    value={formData.veterinarianName}
                    onChange={(e) => setFormData({...formData, veterinarianName: e.target.value})}
                    required
                  />
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Ubicación *
                    </label>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Corral A - Sector Norte"
                        value={formData.location.address}
                        onChange={(e) => setFormData({
                          ...formData, 
                          location: {...formData.location, address: e.target.value}
                        })}
                        required
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={getCurrentLocation}
                        disabled={gettingLocation}
                        variant="outline"
                        size="icon"
                        className="shrink-0"
                      >
                        {gettingLocation ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    {gettingLocation && (
                      <p className="text-xs text-green-600">Obteniendo ubicación actual...</p>
                    )}
                  </div>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 min-h-[100px]"
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
                    variant="success"
                    className="flex-1 bg-green-600 hover:bg-green-700"
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

  // Renderizado principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-2xl">
              <Syringe className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Eventos de Vacunación</h1>
              <p className="text-gray-600">Gestiona las vacunas de tu ganado</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            variant="success"
            leftIcon={<Plus className="h-4 w-4" />}
            className="bg-emerald-500 hover:bg-emerald-600"
          >
            Nuevo Evento
          </Button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <div className="mb-4">
                    <p className="text-gray-600 text-sm">
                      {event.bovineName && (
                        <span className="font-medium text-gray-900">{event.bovineName} • </span>
                      )}
                      {event.bovineIds.filter(id => id.trim()).join(", ")}
                    </p>
                  </div>

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

                  {event.notes && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {event.notes}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleView(event)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(event)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Editar evento"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        disabled={deleteLoading === event.id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Eliminar evento"
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

      {/* Modal de Vista */}
      <AnimatePresence>
        {viewingEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeViewModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <span className="text-3xl">{getVaccineTypeIcon(viewingEvent.vaccineType)}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{viewingEvent.vaccineName}</h2>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(viewingEvent.status)}`}>
                        {getStatusText(viewingEvent.status)}
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={closeViewModal}
                    variant="outline"
                    size="icon"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Heart className="h-5 w-5 text-red-500 mr-2" />
                    Información del Animal
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nombre:</span>
                      <p className="font-medium">{viewingEvent.bovineName || "No especificado"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">IDs:</span>
                      <p className="font-medium">{viewingEvent.bovineIds.filter(id => id.trim()).join(", ")}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Syringe className="h-5 w-5 text-blue-500 mr-2" />
                    Detalles de la Vacuna
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Tipo:</span>
                      <p className="font-medium capitalize">{viewingEvent.vaccineType}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Fabricante:</span>
                      <p className="font-medium">{viewingEvent.manufacturer || "No especificado"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Lote:</span>
                      <p className="font-medium">{viewingEvent.batchNumber || "No especificado"}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Dosis:</span>
                      <p className="font-medium">{viewingEvent.doseAmount} {viewingEvent.doseUnit}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Activity className="h-5 w-5 text-green-500 mr-2" />
                    Aplicación
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Fecha y Hora:</span>
                      <p className="font-medium">{formatDate(viewingEvent.applicationDate)}, {viewingEvent.applicationTime}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Veterinario:</span>
                      <p className="font-medium">{viewingEvent.veterinarianName}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500">Ubicación:</span>
                      <p className="font-medium">{viewingEvent.location.address}</p>
                      <p className="text-xs text-gray-400">
                        {viewingEvent.location.lat.toFixed(6)}, {viewingEvent.location.lng.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </div>

                {viewingEvent.notes && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">Notas</h3>
                    <p className="text-sm text-gray-700">{viewingEvent.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      closeViewModal();
                      handleEdit(viewingEvent);
                    }}
                    variant="primary"
                    leftIcon={<Edit className="h-4 w-4" />}
                    className="flex-1"
                  >
                    Editar
                  </Button>
                  <Button
                    onClick={() => {
                      closeViewModal();
                      handleDelete(viewingEvent.id);
                    }}
                    variant="destructive"
                    leftIcon={<Trash2 className="h-4 w-4" />}
                    className="flex-1"
                  >
                    Eliminar
                  </Button>
                  <Button
                    onClick={closeViewModal}
                    variant="outline"
                    className="flex-1"
                  >
                    Cerrar
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventVaccination;