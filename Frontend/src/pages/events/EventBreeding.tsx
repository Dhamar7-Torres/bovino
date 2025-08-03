import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Baby,
  Calendar,
  MapPin,
  User,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  X,
  Bell,
  FileText,
  MoreVertical,
  Stethoscope,
  Zap,
  Users,
  DollarSign,
  Save,
} from "lucide-react";

// Interfaces para TypeScript
interface BreedingEvent {
  id: string;
  bovineId: string;
  bovineName: string;
  bovineTag: string;
  eventType: BreedingEventType;
  status: "scheduled" | "completed" | "failed" | "cancelled" | "pending";
  scheduledDate: string;
  completedDate?: string;
  location: Location;
  notes?: string;

  // Datos específicos según el tipo de evento
  breedingData?: {
    method: "natural" | "artificial_insemination";
    bullId?: string;
    bullTag?: string;
    bullBreed?: string;
    semenBatch?: string;
    semenProvider?: string;
    technician?: string;
    attempts?: number;
    success?: boolean;
    expectedDueDate?: string;
  };

  pregnancyData?: {
    gestationWeek: number;
    method: "palpation" | "ultrasound" | "blood_test";
    result: "pregnant" | "not_pregnant" | "inconclusive";
    fetusCount?: number;
    expectedCalvingDate?: string;
    veterinarian: string;
    nextCheckDate?: string;
  };

  birthData?: {
    calvingDate: string;
    calvingTime: string;
    assistanceRequired: boolean;
    complications?: string[];
    calfGender?: "male" | "female";
    calfWeight?: number;
    calfHealthStatus: "healthy" | "weak" | "sick" | "deceased";
    placentaExpulsion: boolean;
    veterinarian?: string;
    calfTag?: string;
  };

  weaningData?: {
    weaningDate: string;
    weaningWeight?: number;
    method: "natural" | "early" | "gradual";
    reason?: string;
    newLocation?: string;
  };

  cost?: number;
  currency?: string;
  veterinarian?: string;
  reminders: EventReminder[];
  attachments: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface BreedingEventType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  category: "breeding" | "pregnancy" | "birth" | "weaning";
  duration?: number; // minutos
  requiresVeterinarian: boolean;
}

interface Location {
  latitude: number;
  longitude: number;
  address: string;
  farm?: string;
  section?: string;
}

interface EventReminder {
  id: string;
  type: "notification" | "email" | "sms";
  timeBeforeEvent: number; // horas
  message: string;
  sent: boolean;
}

interface BreedingStatistics {
  totalEvents: number;
  successfulBreedings: number;
  pregnancyRate: number;
  currentPregnant: number;
  expectedCalvings: number;
  completedBirths: number;
  weanedCalves: number;
  averageGestation: number;
  complications: number;
}

// Formulario para crear/editar eventos
interface EventFormData {
  bovineId: string;
  bovineName: string;
  bovineTag: string;
  eventTypeId: string;
  status: string;
  scheduledDate: string;
  scheduledTime: string;
  location: {
    address: string;
    farm: string;
    section: string;
  };
  notes: string;
  cost: string;
  currency: string;
  veterinarian: string;
  // Datos específicos según el tipo
  breedingMethod?: string;
  semenBatch?: string;
  semenProvider?: string;
  technician?: string;
  expectedDueDate?: string;
}

const EventBreeding: React.FC = () => {
  // Estados principales
  const [breedingEvents, setBreedingEvents] = useState<BreedingEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<BreedingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  
  // Estados para modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BreedingEvent | null>(null);
  const [statistics, setStatistics] = useState<BreedingStatistics | null>(null);
  
  // Estados para formulario
  const [formData, setFormData] = useState<EventFormData>({
    bovineId: "",
    bovineName: "",
    bovineTag: "",
    eventTypeId: "",
    status: "scheduled",
    scheduledDate: "",
    scheduledTime: "",
    location: {
      address: "",
      farm: "",
      section: "",
    },
    notes: "",
    cost: "",
    currency: "MXN",
    veterinarian: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Estados para ubicación
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Tipos de eventos de reproducción
  const breedingEventTypes: BreedingEventType[] = [
    {
      id: "artificial_insemination",
      name: "Inseminación Artificial",
      icon: Zap,
      color: "text-blue-600",
      description: "Procedimiento de inseminación artificial",
      category: "breeding",
      duration: 30,
      requiresVeterinarian: true,
    },
    {
      id: "natural_breeding",
      name: "Monta Natural",
      icon: Heart,
      color: "text-pink-600",
      description: "Reproducción natural con toro",
      category: "breeding",
      duration: 60,
      requiresVeterinarian: false,
    },
    {
      id: "pregnancy_check",
      name: "Diagnóstico de Preñez",
      icon: Stethoscope,
      color: "text-purple-600",
      description: "Verificación de estado de gestación",
      category: "pregnancy",
      duration: 45,
      requiresVeterinarian: true,
    },
    {
      id: "calving",
      name: "Parto",
      icon: Baby,
      color: "text-green-600",
      description: "Evento de nacimiento de ternero",
      category: "birth",
      duration: 180,
      requiresVeterinarian: false,
    },
    {
      id: "weaning",
      name: "Destete",
      icon: Users,
      color: "text-orange-600",
      description: "Separación de ternero de la madre",
      category: "weaning",
      duration: 120,
      requiresVeterinarian: false,
    },
  ];

  // Función para obtener ubicación actual
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      alert("La geolocalización no es soportada por este navegador");
      return;
    }

    setLoadingLocation(true);
    
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      const { latitude, longitude } = position.coords;
      
      // Simular reverse geocoding (en producción usarías una API real)
      const address = `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`;
      
      const location = { latitude, longitude, address };
      setUserLocation(location);
      
      // Actualizar el formulario con la ubicación actual
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          address: address
        }
      }));

    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      alert("No se pudo obtener la ubicación actual");
    } finally {
      setLoadingLocation(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadBreedingEvents = async () => {
      setLoading(true);
      try {
        // Simular carga de datos desde la API
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Datos simulados para desarrollo
        const mockEvents: BreedingEvent[] = [
          {
            id: "1",
            bovineId: "bov_001",
            bovineName: "Esperanza",
            bovineTag: "ESP-001",
            eventType: breedingEventTypes[0],
            status: "completed",
            scheduledDate: "2024-12-15T08:00:00Z",
            completedDate: "2024-12-15T08:30:00Z",
            location: {
              latitude: 17.9869,
              longitude: -92.9303,
              address: "Sector Norte, Rancho El Progreso",
              farm: "El Progreso",
              section: "Sector Norte",
            },
            breedingData: {
              method: "artificial_insemination",
              semenBatch: "BS2024-456",
              semenProvider: "GenSemen International",
              technician: "Dr. García",
              attempts: 1,
              success: true,
              expectedDueDate: "2024-09-22",
            },
            cost: 250.0,
            currency: "MXN",
            veterinarian: "Dr. María García",
            reminders: [],
            attachments: [],
            createdAt: "2024-12-01T10:00:00Z",
            updatedAt: "2024-12-15T08:30:00Z",
            createdBy: "user_001",
            notes: "Procedimiento exitoso sin complicaciones",
          },
          {
            id: "2",
            bovineId: "bov_002",
            bovineName: "Paloma",
            bovineTag: "PAL-002",
            eventType: breedingEventTypes[2],
            status: "scheduled",
            scheduledDate: "2024-12-25T09:00:00Z",
            location: {
              latitude: 17.9869,
              longitude: -92.9303,
              address: "Sector Sur, Rancho El Progreso",
              farm: "El Progreso",
              section: "Sector Sur",
            },
            pregnancyData: {
              gestationWeek: 6,
              method: "ultrasound",
              result: "pregnant",
              fetusCount: 1,
              expectedCalvingDate: "2024-09-20",
              veterinarian: "Dr. López",
              nextCheckDate: "2024-01-25",
            },
            cost: 180.0,
            currency: "MXN",
            veterinarian: "Dr. Carlos López",
            reminders: [
              {
                id: "rem_001",
                type: "notification",
                timeBeforeEvent: 24,
                message: "Recordatorio: Diagnóstico de preñez programado para mañana",
                sent: false,
              },
            ],
            attachments: [],
            createdAt: "2024-12-10T14:00:00Z",
            updatedAt: "2024-12-10T14:00:00Z",
            createdBy: "user_001",
            notes: "Segunda verificación de gestación",
          },
        ];

        setBreedingEvents(mockEvents);

        // Calcular estadísticas simuladas
        const mockStatistics: BreedingStatistics = {
          totalEvents: 48,
          successfulBreedings: 42,
          pregnancyRate: 87.5,
          currentPregnant: 15,
          expectedCalvings: 8,
          completedBirths: 23,
          weanedCalves: 18,
          averageGestation: 284,
          complications: 3,
        };

        setStatistics(mockStatistics);
      } catch (error) {
        console.error("Error cargando eventos de reproducción:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBreedingEvents();
  }, []);

  // Filtrar eventos basado en los criterios seleccionados
  useEffect(() => {
    let filtered = breedingEvents;

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.bovineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.bovineTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.eventType.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo de evento
    if (selectedEventType !== "all") {
      filtered = filtered.filter(
        (event) => event.eventType.id === selectedEventType
      );
    }

    // Filtro por estado
    if (selectedStatus !== "all") {
      filtered = filtered.filter((event) => event.status === selectedStatus);
    }

    // Filtro por fecha
    if (dateFilter !== "all") {
      const now = new Date();

      switch (dateFilter) {
        case "today":
          filtered = filtered.filter((event) => {
            const eDate = new Date(event.scheduledDate);
            return eDate.toDateString() === now.toDateString();
          });
          break;
        case "week":
          const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((event) => {
            const eDate = new Date(event.scheduledDate);
            return eDate >= now && eDate <= weekFromNow;
          });
          break;
        case "month":
          const monthFromNow = new Date(
            now.getTime() + 30 * 24 * 60 * 60 * 1000
          );
          filtered = filtered.filter((event) => {
            const eDate = new Date(event.scheduledDate);
            return eDate >= now && eDate <= monthFromNow;
          });
          break;
      }
    }

    setFilteredEvents(filtered);
  }, [
    breedingEvents,
    searchTerm,
    selectedEventType,
    selectedStatus,
    dateFilter,
  ]);

  // Función para resetear formulario
  const resetForm = useCallback(() => {
    setFormData({
      bovineId: "",
      bovineName: "",
      bovineTag: "",
      eventTypeId: "",
      status: "scheduled",
      scheduledDate: "",
      scheduledTime: "",
      location: {
        address: "",
        farm: "",
        section: "",
      },
      notes: "",
      cost: "",
      currency: "MXN",
      veterinarian: "",
    });
    setFormErrors({});
    setSelectedEvent(null);
  }, []);

  // Funciones para manejar eventos
  const handleCreateEvent = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleViewEvent = (event: BreedingEvent) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleEditEvent = (event: BreedingEvent) => {
    const eventDate = new Date(event.scheduledDate);
    
    setFormData({
      bovineId: event.bovineId,
      bovineName: event.bovineName,
      bovineTag: event.bovineTag,
      eventTypeId: event.eventType.id,
      status: event.status,
      scheduledDate: eventDate.toISOString().split('T')[0],
      scheduledTime: eventDate.toTimeString().slice(0, 5),
      location: {
        address: event.location.address,
        farm: event.location.farm || "",
        section: event.location.section || "",
      },
      notes: event.notes || "",
      cost: event.cost ? event.cost.toString() : "",
      currency: event.currency || "MXN",
      veterinarian: event.veterinarian || "",
      breedingMethod: event.breedingData?.method,
      semenBatch: event.breedingData?.semenBatch,
      semenProvider: event.breedingData?.semenProvider,
      technician: event.breedingData?.technician,
      expectedDueDate: event.breedingData?.expectedDueDate,
    });
    setSelectedEvent(event);
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm("¿Estás seguro de eliminar este evento de reproducción?")) {
      try {
        // Eliminar del estado local inmediatamente para UI responsiva
        const eventToDelete = breedingEvents.find(event => event.id === eventId);
        setBreedingEvents((prev) => prev.filter((event) => event.id !== eventId));
        
        // Simular llamada a API
        await new Promise((resolve) => setTimeout(resolve, 500));
        
        // Actualizar estadísticas si existen
        if (statistics) {
          setStatistics({
            ...statistics,
            totalEvents: statistics.totalEvents - 1,
          });
        }

        // Mostrar mensaje de éxito
        alert(`Evento "${eventToDelete?.eventType.name}" eliminado exitosamente`);
        console.log(`Evento ${eventId} eliminado exitosamente`);
      } catch (error) {
        console.error("Error eliminando evento:", error);
        alert("Error al eliminar el evento");
        // Revertir la eliminación en caso de error
        window.location.reload();
      }
    }
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.bovineName.trim()) {
      errors.bovineName = "El nombre del bovino es requerido";
    }

    if (!formData.bovineTag.trim()) {
      errors.bovineTag = "El tag del bovino es requerido";
    }

    if (!formData.eventTypeId) {
      errors.eventTypeId = "Debe seleccionar un tipo de evento";
    }

    if (!formData.scheduledDate) {
      errors.scheduledDate = "La fecha es requerida";
    }

    if (!formData.scheduledTime) {
      errors.scheduledTime = "La hora es requerida";
    }

    if (!formData.location.address) {
      errors.locationAddress = "La dirección es requerida";
    }

    // Validar costo si se proporcionó
    if (formData.cost && formData.cost.trim() !== "") {
      const costValue = parseFloat(formData.cost);
      if (isNaN(costValue) || costValue < 0) {
        errors.cost = "El costo debe ser un número válido mayor o igual a 0";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar cambio en el campo de costo
  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Permitir cadena vacía, números y un solo punto decimal
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData(prev => ({ ...prev, cost: value }));
      
      // Limpiar error si existe
      if (formErrors.cost) {
        setFormErrors(prev => ({ ...prev, cost: "" }));
      }
    }
  };

  // Guardar evento (crear o editar)
  const handleSaveEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);

    try {
      // Simular llamada a API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const eventType = breedingEventTypes.find(type => type.id === formData.eventTypeId);
      if (!eventType) {
        alert("Tipo de evento no válido");
        return;
      }

      // Generar ID único para el bovino si no existe
      const bovineId = formData.bovineId || `bovine_${Date.now()}`;

      // Convertir el costo a número si se proporcionó
      const costValue = formData.cost && formData.cost.trim() !== "" 
        ? parseFloat(formData.cost) 
        : undefined;

      const eventData: BreedingEvent = {
        id: selectedEvent ? selectedEvent.id : `event_${Date.now()}`,
        bovineId: bovineId,
        bovineName: formData.bovineName,
        bovineTag: formData.bovineTag,
        eventType,
        status: formData.status as any,
        scheduledDate: new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString(),
        location: {
          latitude: userLocation?.latitude || 17.9869,
          longitude: userLocation?.longitude || -92.9303,
          address: formData.location.address,
          farm: formData.location.farm,
          section: formData.location.section,
        },
        notes: formData.notes,
        cost: costValue,
        currency: formData.currency,
        veterinarian: formData.veterinarian,
        reminders: [],
        attachments: [],
        createdAt: selectedEvent ? selectedEvent.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "user_001",
      };

      // Agregar datos específicos según el tipo
      if (eventType.category === "breeding") {
        eventData.breedingData = {
          method: formData.breedingMethod as any,
          semenBatch: formData.semenBatch,
          semenProvider: formData.semenProvider,
          technician: formData.technician,
          expectedDueDate: formData.expectedDueDate,
        };
      }

      if (selectedEvent) {
        // Editar evento existente
        setBreedingEvents(prev => 
          prev.map(event => event.id === selectedEvent.id ? eventData : event)
        );
        setShowEditModal(false);
        alert("Evento actualizado exitosamente");
      } else {
        // Crear nuevo evento
        setBreedingEvents(prev => [...prev, eventData]);
        
        // Actualizar estadísticas
        if (statistics) {
          setStatistics({
            ...statistics,
            totalEvents: statistics.totalEvents + 1,
          });
        }
        
        setShowCreateModal(false);
        alert("Evento creado exitosamente");
      }

      setSelectedEvent(null);
      
    } catch (error) {
      console.error("Error guardando evento:", error);
      alert("Error al guardar el evento");
    } finally {
      setIsSaving(false);
    }
  };

  // Función para obtener el color del estado
  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "text-blue-600 bg-blue-100",
      completed: "text-green-600 bg-green-100",
      failed: "text-red-600 bg-red-100",
      cancelled: "text-gray-600 bg-gray-100",
      pending: "text-yellow-600 bg-yellow-100",
    };
    return colors[status as keyof typeof colors] || "text-gray-600 bg-gray-100";
  };

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Función para formatear costo
  const formatCost = (cost?: number, currency?: string) => {
    if (!cost) return "";
    
    const formatter = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: currency || "MXN",
    });
    
    return formatter.format(cost);
  };

  // Componente de formulario reutilizable
  const EventForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={handleSaveEvent} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nombre del bovino */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Bovino *
          </label>
          <input
            type="text"
            placeholder="Ej: Esperanza"
            value={formData.bovineName}
            onChange={(e) => setFormData(prev => ({ ...prev, bovineName: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              formErrors.bovineName ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.bovineName && (
            <p className="text-red-500 text-sm mt-1">{formErrors.bovineName}</p>
          )}
        </div>

        {/* Tag del bovino */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tag del Bovino *
          </label>
          <input
            type="text"
            placeholder="Ej: ESP-001"
            value={formData.bovineTag}
            onChange={(e) => setFormData(prev => ({ ...prev, bovineTag: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              formErrors.bovineTag ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.bovineTag && (
            <p className="text-red-500 text-sm mt-1">{formErrors.bovineTag}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipo de evento */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Evento *
          </label>
          <select
            value={formData.eventTypeId}
            onChange={(e) => setFormData(prev => ({ ...prev, eventTypeId: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              formErrors.eventTypeId ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Seleccionar tipo</option>
            {breedingEventTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {formErrors.eventTypeId && (
            <p className="text-red-500 text-sm mt-1">{formErrors.eventTypeId}</p>
          )}
        </div>

        {/* Estado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estado
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="scheduled">Programado</option>
            <option value="completed">Completado</option>
            <option value="pending">Pendiente</option>
            <option value="cancelled">Cancelado</option>
            <option value="failed">Fallido</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Fecha */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fecha *
          </label>
          <input
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              formErrors.scheduledDate ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.scheduledDate && (
            <p className="text-red-500 text-sm mt-1">{formErrors.scheduledDate}</p>
          )}
        </div>

        {/* Hora */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hora *
          </label>
          <input
            type="time"
            value={formData.scheduledTime}
            onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              formErrors.scheduledTime ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.scheduledTime && (
            <p className="text-red-500 text-sm mt-1">{formErrors.scheduledTime}</p>
          )}
        </div>
      </div>

      {/* Ubicación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ubicación *
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Dirección del evento"
            value={formData.location.address}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              location: { ...prev.location, address: e.target.value }
            }))}
            className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              formErrors.locationAddress ? "border-red-500" : "border-gray-300"
            }`}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            onClick={getCurrentLocation}
            disabled={loadingLocation}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loadingLocation ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <MapPin className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">
              {loadingLocation ? "Obteniendo..." : "Mi Ubicación"}
            </span>
          </motion.button>
        </div>
        {formErrors.locationAddress && (
          <p className="text-red-500 text-sm mt-1">{formErrors.locationAddress}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rancho */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rancho
          </label>
          <input
            type="text"
            placeholder="Nombre del rancho"
            value={formData.location.farm}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              location: { ...prev.location, farm: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Sección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sección
          </label>
          <input
            type="text"
            placeholder="Sección del rancho"
            value={formData.location.section}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              location: { ...prev.location, section: e.target.value }
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Campos específicos para inseminación artificial */}
      {formData.eventTypeId === "artificial_insemination" && (
        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Datos de Inseminación Artificial
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lote de Semen
              </label>
              <input
                type="text"
                placeholder="Código del lote"
                value={formData.semenBatch || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, semenBatch: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proveedor de Semen
              </label>
              <input
                type="text"
                placeholder="Empresa proveedora"
                value={formData.semenProvider || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, semenProvider: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Técnico
              </label>
              <input
                type="text"
                placeholder="Nombre del técnico"
                value={formData.technician || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, technician: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Esperada de Parto
              </label>
              <input
                type="date"
                value={formData.expectedDueDate || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedDueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Veterinario */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Veterinario
          </label>
          <input
            type="text"
            placeholder="Nombre del veterinario"
            value={formData.veterinarian}
            onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Costo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Costo
          </label>
          <input
            type="text"
            placeholder="0.00"
            value={formData.cost}
            onChange={handleCostChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              formErrors.cost ? "border-red-500" : "border-gray-300"
            }`}
          />
          {formErrors.cost && (
            <p className="text-red-500 text-sm mt-1">{formErrors.cost}</p>
          )}
        </div>

        {/* Moneda */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Moneda
          </label>
          <select
            value={formData.currency}
            onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="MXN">MXN (Pesos)</option>
            <option value="USD">USD (Dólares)</option>
            <option value="EUR">EUR (Euros)</option>
          </select>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notas
        </label>
        <textarea
          rows={3}
          placeholder="Observaciones adicionales..."
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Botones */}
      <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => {
            if (isEdit) {
              setShowEditModal(false);
            } else {
              setShowCreateModal(false);
            }
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isSaving}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>{isEdit ? "Actualizar Evento" : "Crear Evento"}</span>
            </>
          )}
        </motion.button>
      </div>
    </form>
  );

  // Animaciones
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">
            Cargando eventos de reproducción...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 rounded-2xl mb-6"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="flex items-center space-x-4 mb-4 sm:mb-0">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white"
              >
                <Heart className="h-8 w-8" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Eventos de Reproducción
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestiona los eventos reproductivos de tu ganado
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateEvent}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                <Plus className="h-5 w-5" />
                <span>Nuevo Evento</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filtros y Búsqueda */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6"
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por vaca o evento..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
              />
            </div>

            {/* Filtro por tipo */}
            <select
              value={selectedEventType}
              onChange={(e) => setSelectedEventType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todos los tipos</option>
              {breedingEventTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>

            {/* Filtro por estado */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todos los estados</option>
              <option value="scheduled">Programado</option>
              <option value="completed">Completado</option>
              <option value="failed">Fallido</option>
              <option value="cancelled">Cancelado</option>
              <option value="pending">Pendiente</option>
            </select>

            {/* Filtro por fecha */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80"
            >
              <option value="all">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Próxima semana</option>
              <option value="month">Próximo mes</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Lista de Eventos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
      >
        {filteredEvents.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-200"
          >
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay eventos de reproducción
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ||
              selectedEventType !== "all" ||
              selectedStatus !== "all" ||
              dateFilter !== "all"
                ? "No se encontraron eventos que coincidan con los filtros aplicados."
                : "Comienza creando tu primer evento de reproducción."}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateEvent}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Crear Primer Evento
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all"
              >
                {/* Header del evento */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`p-2 rounded-xl bg-gradient-to-r ${
                        event.eventType.color.includes("blue")
                          ? "from-blue-500 to-blue-600"
                          : event.eventType.color.includes("pink")
                          ? "from-pink-500 to-pink-600"
                          : event.eventType.color.includes("purple")
                          ? "from-purple-500 to-purple-600"
                          : event.eventType.color.includes("green")
                          ? "from-green-500 to-green-600"
                          : "from-orange-500 to-orange-600"
                      } text-white`}
                    >
                      <event.eventType.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {event.eventType.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {event.bovineName} • {event.bovineTag}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                        event.status
                      )}`}
                    >
                      {event.status === "scheduled"
                        ? "Programado"
                        : event.status === "completed"
                        ? "Completado"
                        : event.status === "failed"
                        ? "Fallido"
                        : event.status === "cancelled"
                        ? "Cancelado"
                        : "Pendiente"}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <MoreVertical className="h-4 w-4 text-gray-400" />
                    </motion.button>
                  </div>
                </div>

                {/* Información del evento */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(event.scheduledDate)}</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {event.location.farm} - {event.location.section}
                    </span>
                  </div>

                  {event.veterinarian && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{event.veterinarian}</span>
                    </div>
                  )}

                  {event.cost && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCost(event.cost, event.currency)}</span>
                    </div>
                  )}
                </div>

                {/* Notas si existen */}
                {event.notes && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {event.notes}
                    </p>
                  </div>
                )}

                {/* Acciones rápidas */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    {event.reminders.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-blue-600">
                        <Bell className="h-3 w-3" />
                        <span>{event.reminders.length}</span>
                      </div>
                    )}

                    {event.attachments.length > 0 && (
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <FileText className="h-3 w-3" />
                        <span>{event.attachments.length}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleViewEvent(event)}
                      className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                    >
                      <Eye className="h-4 w-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditEvent(event)}
                      className="p-2 hover:bg-yellow-100 rounded-lg transition-colors text-yellow-600"
                    >
                      <Edit3 className="h-4 w-4" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal de crear evento */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Crear Nuevo Evento de Reproducción
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              <EventForm isEdit={false} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de editar evento */}
      <AnimatePresence>
        {showEditModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Editar Evento de Reproducción
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEditModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              <EventForm isEdit={true} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de detalles del evento */}
      <AnimatePresence>
        {showDetailsModal && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-3 rounded-xl ${
                      selectedEvent.eventType.color.includes("blue")
                        ? "bg-blue-100 text-blue-600"
                        : selectedEvent.eventType.color.includes("pink")
                        ? "bg-pink-100 text-pink-600"
                        : selectedEvent.eventType.color.includes("purple")
                        ? "bg-purple-100 text-purple-600"
                        : selectedEvent.eventType.color.includes("green")
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-600"
                    }`}
                  >
                    <selectedEvent.eventType.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedEvent.eventType.name}
                    </h2>
                    <p className="text-gray-600">
                      {selectedEvent.bovineName} • {selectedEvent.bovineTag}
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </motion.button>
              </div>

              {/* Contenido del modal */}
              <div className="space-y-6">
                {/* Estado y fechas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedEvent.status
                      )}`}
                    >
                      {selectedEvent.status === "scheduled"
                        ? "Programado"
                        : selectedEvent.status === "completed"
                        ? "Completado"
                        : selectedEvent.status === "failed"
                        ? "Fallido"
                        : selectedEvent.status === "cancelled"
                        ? "Cancelado"
                        : "Pendiente"}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Programada
                    </label>
                    <p className="text-gray-900">
                      {formatDate(selectedEvent.scheduledDate)}
                    </p>
                  </div>
                </div>

                {/* Ubicación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación
                  </label>
                  <div className="flex items-center space-x-2 text-gray-900">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{selectedEvent.location.address}</span>
                  </div>
                </div>

                {/* Veterinario y costo */}
                {(selectedEvent.veterinarian || selectedEvent.cost) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEvent.veterinarian && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Veterinario
                        </label>
                        <div className="flex items-center space-x-2 text-gray-900">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{selectedEvent.veterinarian}</span>
                        </div>
                      </div>
                    )}

                    {selectedEvent.cost && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Costo
                        </label>
                        <div className="flex items-center space-x-2 text-gray-900">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span>{formatCost(selectedEvent.cost, selectedEvent.currency)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Notas */}
                {selectedEvent.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas
                    </label>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedEvent.notes}</p>
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleEditEvent(selectedEvent);
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    <span>Editar</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventBreeding;