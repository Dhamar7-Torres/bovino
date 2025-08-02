import React, { useState, useMemo, useCallback } from "react";
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
  Truck,
  DollarSign,
  User,
  Calendar,
  ArrowLeft,
  Save,
  Plus,
  Navigation,
  Search,
  Eye,
  Edit3,
  Trash2,
  Loader,
  Package,
  Phone,
  Clipboard,
} from "lucide-react";

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface TransportLocation {
  lat: number;
  lng: number;
  address: string;
}

interface TransportEvent {
  id: string;
  bovineIds: string[];
  bovineNames: string[];
  driverName: string;
  driverLicense: string;
  vehicleType: 'cattle_truck' | 'trailer' | 'pickup_truck' | 'cattle_car';
  vehiclePlate: string;
  originLocation: TransportLocation;
  destinationLocation: TransportLocation;
  departureDate: string;
  arrivalDate: string;
  estimatedDuration: number;
  actualDuration: number;
  distance: number;
  totalCost: number;
  transportCost: number;
  fuelCost: number;
  tollCost: number;
  driverPayment: number;
  temperature: number;
  humidity: number;
  weatherConditions: 'sunny' | 'cloudy' | 'rainy' | 'windy' | 'stormy';
  animalCondition: 'excellent' | 'good' | 'fair' | 'poor';
  healthCertificates: boolean;
  transportPermits: boolean;
  insurance: boolean;
  emergencyContacts: string[];
  routeNotes: string;
  incidents: string;
  status: 'planned' | 'in_transit' | 'completed' | 'cancelled' | 'delayed';
  createdAt: string;
  updatedAt: string;
  responsible: string;
}

type ViewMode = 'list' | 'create' | 'edit' | 'detail';

interface FormErrors {
  [key: string]: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const EventTransport: React.FC = () => {
  // Estados principales
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [events, setEvents] = useState<TransportEvent[]>([
    {
      id: "TRN-001",
      bovineIds: ["ESP-001", "ESP-002"],
      bovineNames: ["Esperanza", "Paloma"],
      driverName: "Juan Pérez García",
      driverLicense: "12345678",
      vehicleType: "cattle_truck",
      vehiclePlate: "ABC-123-XYZ",
      originLocation: {
        lat: 17.9995,
        lng: -92.9476,
        address: "Corral Norte",
      },
      destinationLocation: {
        lat: 18.5,
        lng: -93.0,
        address: "Mercado de Ganado Central",
      },
      departureDate: "2024-12-29",
      arrivalDate: "2024-12-29",
      estimatedDuration: 4,
      actualDuration: 0,
      distance: 45,
      totalCost: 2500,
      transportCost: 1500,
      fuelCost: 600,
      tollCost: 200,
      driverPayment: 200,
      temperature: 28,
      humidity: 70,
      weatherConditions: "sunny",
      animalCondition: "excellent",
      healthCertificates: true,
      transportPermits: true,
      insurance: true,
      emergencyContacts: ["555-0123", "555-0456"],
      routeNotes: "Ruta directa por carretera federal",
      incidents: "",
      status: "completed",
      createdAt: "2024-12-20T10:00:00Z",
      updatedAt: "2024-12-20T10:00:00Z",
      responsible: "Juan Pérez",
    },
    {
      id: "TRN-002",
      bovineIds: ["PAL-002"],
      bovineNames: ["Tormenta"],
      driverName: "María López Sánchez",
      driverLicense: "87654321",
      vehicleType: "trailer",
      vehiclePlate: "XYZ-456-ABC",
      originLocation: {
        lat: 17.9869,
        lng: -92.9303,
        address: "Corral Sur",
      },
      destinationLocation: {
        lat: 17.8,
        lng: -92.8,
        address: "Rastro Municipal",
      },
      departureDate: "2024-12-30",
      arrivalDate: "2024-12-30",
      estimatedDuration: 2,
      actualDuration: 0,
      distance: 25,
      totalCost: 1800,
      transportCost: 1000,
      fuelCost: 400,
      tollCost: 150,
      driverPayment: 250,
      temperature: 26,
      humidity: 65,
      weatherConditions: "cloudy",
      animalCondition: "good",
      healthCertificates: true,
      transportPermits: true,
      insurance: true,
      emergencyContacts: ["555-0789"],
      routeNotes: "Transporte directo sin paradas",
      incidents: "",
      status: "planned",
      createdAt: "2024-12-15T08:00:00Z",
      updatedAt: "2024-12-28T14:30:00Z",
      responsible: "María González",
    },
    {
      id: "TRN-003",
      bovineIds: ["ESP-003", "PAL-003"],
      bovineNames: ["Bruno", "Luna"],
      driverName: "Carlos Mendoza Rivera",
      driverLicense: "11223344",
      vehicleType: "cattle_truck",
      vehiclePlate: "DEF-789-GHI",
      originLocation: {
        lat: 17.9995,
        lng: -92.9476,
        address: "Corral Este",
      },
      destinationLocation: {
        lat: 18.2,
        lng: -92.7,
        address: "Finca La Esperanza",
      },
      departureDate: "2024-12-31",
      arrivalDate: "2024-12-31",
      estimatedDuration: 3,
      actualDuration: 0,
      distance: 35,
      totalCost: 2200,
      transportCost: 1200,
      fuelCost: 500,
      tollCost: 250,
      driverPayment: 250,
      temperature: 30,
      humidity: 75,
      weatherConditions: "sunny",
      animalCondition: "excellent",
      healthCertificates: true,
      transportPermits: true,
      insurance: true,
      emergencyContacts: ["555-1111"],
      routeNotes: "Transporte especial para reproducción",
      incidents: "",
      status: "in_transit",
      createdAt: "2024-12-22T09:00:00Z",
      updatedAt: "2024-12-30T08:00:00Z",
      responsible: "Ana Rodríguez",
    }
  ]);
  
  const [, setSelectedEvent] = useState<TransportEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Estado para el formulario
  const getInitialFormData = (): Partial<TransportEvent> => ({
    bovineIds: [""],
    bovineNames: [""],
    driverName: "",
    driverLicense: "",
    vehicleType: "cattle_truck",
    vehiclePlate: "",
    originLocation: {
      lat: 17.9995,
      lng: -92.9476,
      address: "",
    },
    destinationLocation: {
      lat: 18.5,
      lng: -93.0,
      address: "",
    },
    departureDate: new Date().toISOString().split("T")[0],
    arrivalDate: "",
    estimatedDuration: 0,
    actualDuration: 0,
    distance: 0,
    transportCost: 0,
    fuelCost: 0,
    tollCost: 0,
    driverPayment: 0,
    temperature: 25,
    humidity: 60,
    weatherConditions: "sunny",
    animalCondition: "excellent",
    healthCertificates: false,
    transportPermits: false,
    insurance: false,
    emergencyContacts: [""],
    routeNotes: "",
    incidents: "",
    status: "planned",
    responsible: "",
  });

  const [formData, setFormData] = useState<Partial<TransportEvent>>(getInitialFormData());

  // Eventos filtrados
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = 
        event.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.bovineIds.some(id => id.toLowerCase().includes(searchTerm.toLowerCase())) ||
        event.bovineNames.some(name => name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        event.originLocation.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.destinationLocation.address.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || event.status === statusFilter;
      const matchesType = typeFilter === "all" || event.vehicleType === typeFilter;
      
      let matchesDate = true;
      if (dateFilter !== "all") {
        const eventDate = new Date(event.departureDate);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        switch (dateFilter) {
          case "today":
            matchesDate = eventDate.toDateString() === today.toDateString();
            break;
          case "yesterday":
            matchesDate = eventDate.toDateString() === yesterday.toDateString();
            break;
          case "week":
            matchesDate = eventDate >= weekAgo;
            break;
        }
      }
      
      return matchesSearch && matchesStatus && matchesType && matchesDate;
    });
  }, [events, searchTerm, statusFilter, typeFilter, dateFilter]);

  // Función para obtener ubicación actual
  const getCurrentLocation = useCallback(async (
    locationType: "originLocation" | "destinationLocation"
  ) => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada en este navegador");
      return;
    }

    setLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        });
      });

      const { latitude, longitude } = position.coords;
      const address = await reverseGeocode(latitude, longitude);
      
      setFormData(prev => ({
        ...prev,
        [locationType]: {
          lat: latitude,
          lng: longitude,
          address: address
        }
      }));

      setErrors(prev => ({
        ...prev,
        [`${locationType}.address`]: ""
      }));

    } catch (error) {
      console.error("Error obteniendo ubicación:", error);
      setErrors(prev => ({
        ...prev,
        [`${locationType}.address`]: "No se pudo obtener la ubicación. Verifica los permisos."
      }));
    } finally {
      setLoading(false);
    }
  }, []);

  // Función simulada de reverse geocoding
  const reverseGeocode = async (_lat: number, _lng: number): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const locations = [
      "Corral Norte",
      "Corral Sur", 
      "Corral Este",
      "Corral Oeste",
      "Área de Cuarentena",
      "Zona de Carga",
      "Mercado de Ganado Central",
      "Rastro Municipal"
    ];
    
    return locations[Math.floor(Math.random() * locations.length)];
  };

  // Validación del formulario
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.driverName?.trim()) {
      newErrors.driverName = "El nombre del conductor es requerido";
    }

    if (!formData.vehiclePlate?.trim()) {
      newErrors.vehiclePlate = "Las placas del vehículo son requeridas";
    }

    if (!formData.vehicleType) {
      newErrors.vehicleType = "El tipo de vehículo es requerido";
    }

    if (!formData.responsible?.trim()) {
      newErrors.responsible = "El responsable es requerido";
    }

    if (!formData.departureDate) {
      newErrors.departureDate = "La fecha de transporte es requerida";
    }

    if (!formData.originLocation?.address?.trim()) {
      newErrors['originLocation.address'] = "La dirección de origen es requerida";
    }

    if (!formData.destinationLocation?.address?.trim()) {
      newErrors['destinationLocation.address'] = "La dirección de destino es requerida";
    }

    if ((formData.transportCost || 0) < 0) {
      newErrors.transportCost = "El costo de transporte no puede ser negativo";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Funciones de manejo de eventos
  const handleCreate = useCallback(() => {
    setFormData(getInitialFormData());
    setErrors({});
    setCurrentView('create');
  }, []);

  const handleEdit = useCallback((event: TransportEvent) => {
    setFormData(event);
    setErrors({});
    setCurrentView('edit');
  }, []);

  const handleView = useCallback((event: TransportEvent) => {
    setSelectedEvent(event);
    setCurrentView('detail');
  }, []);

  const handleDelete = useCallback(async (eventId: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este evento de transporte?")) {
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEvents(prev => prev.filter(e => e.id !== eventId));
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el evento");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const totalCost = (formData.transportCost || 0) + (formData.fuelCost || 0) + 
                       (formData.tollCost || 0) + (formData.driverPayment || 0);
      
      const eventData: TransportEvent = {
        ...formData as TransportEvent,
        totalCost,
        id: currentView === 'create' ? `TRN-${String(events.length + 1).padStart(3, '0')}` : formData.id!,
        createdAt: currentView === 'create' ? new Date().toISOString() : formData.createdAt!,
        updatedAt: new Date().toISOString(),
      };

      if (currentView === 'create') {
        setEvents(prev => [...prev, eventData]);
      } else {
        setEvents(prev => prev.map(e => e.id === eventData.id ? eventData : e));
      }
      
      setCurrentView('list');
      alert(`Evento ${currentView === 'create' ? 'creado' : 'actualizado'} exitosamente`);
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el evento");
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, currentView, events.length]);

  const handleInputChange = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  }, [errors]);

  const handleLocationChange = useCallback((
    locationType: "originLocation" | "destinationLocation",
    field: string,
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [locationType]: {
        ...prev[locationType],
        [field]: value,
      },
    }));

    const errorKey = `${locationType}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: "" }));
    }
  }, [errors]);

  // Funciones de utilidad para renderizado
  const getStatusText = (status: string) => {
    const statusMap = {
      'planned': 'Programado',
      'in_transit': 'En Tránsito',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
      'delayed': 'Retrasado'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 text-white';
      case 'cancelled':
        return 'bg-red-500 text-white';
      case 'delayed':
        return 'bg-yellow-500 text-white';
      case 'in_transit':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-blue-500 text-white';
    }
  };

  const getVehicleTypeText = (type: string) => {
    const typeMap = {
      'cattle_truck': 'Camión Ganadero',
      'trailer': 'Tráiler',
      'pickup_truck': 'Camioneta',
      'cattle_car': 'Carro de Ganado'
    };
    return typeMap[type as keyof typeof typeMap] || type;
  };

  // Configuración de animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // VISTA LISTA (siguiendo el diseño de referencia)
  if (currentView === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-yellow-400">
        {/* Header Verde - Siguiendo el diseño de referencia */}
        <div className="bg-green-500 px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500 p-3 rounded-full shadow-lg">
                  <Truck className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    Eventos de Transporte
                  </h1>
                  <p className="text-green-100 text-lg">
                    Gestiona el transporte y movilización de tu ganado
                  </p>
                </div>
              </div>
              <Button
                onClick={handleCreate}
                className="bg-green-600 hover:bg-green-700 text-white shadow-lg px-6 py-3 text-lg font-medium"
                leftIcon={<Plus className="h-5 w-5" />}
              >
                Nuevo Evento
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido Principal */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Filtros - Siguiendo el diseño de referencia */}
            <motion.div
              className="bg-white rounded-xl shadow-sm p-6 mb-8"
              variants={itemVariants}
            >
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por vaca, conductor, ubicación..."
                      className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-700"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 min-w-[160px]"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="cattle_truck">Camión Ganadero</option>
                    <option value="trailer">Tráiler</option>
                    <option value="pickup_truck">Camioneta</option>
                    <option value="cattle_car">Carro de Ganado</option>
                  </select>
                  
                  <select
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 min-w-[160px]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="planned">Programado</option>
                    <option value="in_transit">En Tránsito</option>
                    <option value="completed">Completado</option>
                    <option value="delayed">Retrasado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>

                  <select
                    className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-700 min-w-[160px]"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="all">Todas las fechas</option>
                    <option value="today">Hoy</option>
                    <option value="yesterday">Ayer</option>
                    <option value="week">Última semana</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Lista de eventos - Siguiendo el diseño de referencia */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              variants={containerVariants}
            >
              <AnimatePresence>
                {filteredEvents.map((event) => (
                  <motion.div
                    key={event.id}
                    variants={itemVariants}
                    layout
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                  >
                    {/* Header del evento */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-500 p-3 rounded-full">
                          <Package className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">
                            {getVehicleTypeText(event.vehicleType)}
                          </h3>
                          <p className="text-gray-600">
                            {event.bovineNames.map((name, index) => (
                              <span key={index}>
                                {name} • {event.bovineIds[index]}
                                {index < event.bovineNames.length - 1 && ", "}
                              </span>
                            ))}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(event.status)}`}>
                        {getStatusText(event.status)}
                      </span>
                    </div>

                    {/* Información del destino */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 text-lg mb-2">
                        {event.destinationLocation.address}
                      </h4>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Distancia: {event.distance} km</span>
                        <span className="font-semibold">Costo: ${event.totalCost.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Información detallada */}
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="h-4 w-4 mr-3" />
                        <span>{new Date(event.departureDate).toLocaleDateString('es-ES', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        })}, {event.estimatedDuration > 0 ? `${String(Math.floor(event.estimatedDuration)).padStart(2, '0')}:00` : '00:00'}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <MapPin className="h-4 w-4 mr-3" />
                        <span>{event.originLocation.address}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-600">
                        <User className="h-4 w-4 mr-3" />
                        <span>{event.responsible}</span>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleView(event)}
                        className="flex-1 flex items-center justify-center py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Eye className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleEdit(event)}
                        className="flex-1 flex items-center justify-center py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <Edit3 className="h-4 w-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="flex-1 flex items-center justify-center py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Estado vacío */}
            {filteredEvents.length === 0 && (
              <motion.div
                className="text-center py-12"
                variants={itemVariants}
              >
                <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron eventos
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  No hay eventos de transporte que coincidan con los filtros seleccionados.
                  Intenta cambiar los criterios de búsqueda o crear un nuevo evento.
                </p>
                <Button 
                  onClick={handleCreate} 
                  leftIcon={<Plus className="h-4 w-4" />}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Crear primer evento
                </Button>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // VISTA CREAR/EDITAR (manteniendo el diseño actual)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <motion.div
        className="max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="flex items-center justify-between mb-8"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentView('list')}
              className="hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {currentView === 'create' ? 'Crear' : 'Editar'} Evento de Transporte
              </h1>
              <p className="text-gray-600">
                {currentView === 'create' 
                  ? 'Registra un nuevo evento de transporte de ganado'
                  : 'Modifica la información del evento de transporte'
                }
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline"
              onClick={() => setCurrentView('list')}
              className="hover:bg-gray-100"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              leftIcon={
                loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    <Loader className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Save className="h-4 w-4" />
                )
              }
            >
              {loading 
                ? 'Guardando...' 
                : currentView === 'create' 
                  ? 'Crear Transporte' 
                  : 'Actualizar Transporte'
              }
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario principal */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            variants={itemVariants}
          >
            {/* Información básica */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="h-5 w-5 mr-2 text-blue-600" />
                  Información del Transporte
                </CardTitle>
                <CardDescription>
                  Datos básicos del evento de transporte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Conductor *"
                        placeholder="Nombre completo del conductor"
                        value={formData.driverName || ""}
                        onChange={(e) => handleInputChange("driverName", e.target.value)}
                        error={errors.driverName}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        label="Licencia de Conducir"
                        placeholder="Número de licencia"
                        value={formData.driverLicense || ""}
                        onChange={(e) => handleInputChange("driverLicense", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Placas del Vehículo *"
                        placeholder="ABC-123-XYZ"
                        value={formData.vehiclePlate || ""}
                        onChange={(e) => handleInputChange("vehiclePlate", e.target.value)}
                        error={errors.vehiclePlate}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Vehículo *
                      </label>
                      <select
                        className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors.vehicleType ? 'border-red-300' : 'border-gray-300'
                        }`}
                        value={formData.vehicleType || ""}
                        onChange={(e) => handleInputChange("vehicleType", e.target.value)}
                      >
                        <option value="">Selecciona tipo</option>
                        <option value="cattle_truck">Camión Ganadero</option>
                        <option value="trailer">Tráiler Ganadero</option>
                        <option value="pickup_truck">Camioneta</option>
                        <option value="cattle_car">Carro de Ganado</option>
                      </select>
                      {errors.vehicleType && (
                        <p className="text-sm text-red-600">{errors.vehicleType}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Responsable *"
                        placeholder="Encargado del evento"
                        value={formData.responsible || ""}
                        onChange={(e) => handleInputChange("responsible", e.target.value)}
                        error={errors.responsible}
                        required
                      />
                    </div>
                    <div>
                      <Input
                        label="Fecha de Transporte *"
                        type="date"
                        value={formData.departureDate || ""}
                        onChange={(e) => handleInputChange("departureDate", e.target.value)}
                        error={errors.departureDate}
                        required
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Costos */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Costos del Transporte
                </CardTitle>
                <CardDescription>
                  Detalle de gastos asociados al transporte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Costo de Transporte"
                        type="number"
                        step="0.01"
                        placeholder="$0.00"
                        value={formData.transportCost?.toString() || ""}
                        onChange={(e) => handleInputChange("transportCost", parseFloat(e.target.value) || 0)}
                        error={errors.transportCost}
                      />
                    </div>
                    <div>
                      <Input
                        label="Costo de Combustible"
                        type="number"
                        step="0.01"
                        placeholder="$0.00"
                        value={formData.fuelCost?.toString() || ""}
                        onChange={(e) => handleInputChange("fuelCost", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Costo de Casetas"
                        type="number"
                        step="0.01"
                        placeholder="$0.00"
                        value={formData.tollCost?.toString() || ""}
                        onChange={(e) => handleInputChange("tollCost", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                    <div>
                      <Input
                        label="Pago al Conductor"
                        type="number"
                        step="0.01"
                        placeholder="$0.00"
                        value={formData.driverPayment?.toString() || ""}
                        onChange={(e) => handleInputChange("driverPayment", parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>

                  {/* Resumen de costos */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-700">Costo Total:</span>
                      <span className="text-xl font-bold text-green-600">
                        ${((formData.transportCost || 0) + (formData.fuelCost || 0) + 
                           (formData.tollCost || 0) + (formData.driverPayment || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notas adicionales */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clipboard className="h-5 w-5 mr-2 text-purple-600" />
                  Notas y Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas de la Ruta
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Información importante sobre la ruta..."
                      value={formData.routeNotes || ""}
                      onChange={(e) => handleInputChange("routeNotes", e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incidentes (si los hay)
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Reportar cualquier incidente durante el transporte..."
                      value={formData.incidents || ""}
                      onChange={(e) => handleInputChange("incidents", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Columna derecha */}
          <motion.div className="space-y-6" variants={itemVariants}>
            {/* Ubicación de Origen */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-green-600" />
                  Ubicación de Origen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Input
                      label="Dirección de Origen *"
                      placeholder="Dirección completa"
                      value={formData.originLocation?.address || ""}
                      onChange={(e) => handleLocationChange("originLocation", "address", e.target.value)}
                      error={errors['originLocation.address']}
                      required
                    />
                  </div>

                  <Button
                    onClick={() => getCurrentLocation("originLocation")}
                    variant="outline"
                    fullWidth
                    leftIcon={loading ? <Loader className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                    disabled={loading}
                    className="hover:bg-green-50 hover:border-green-300"
                  >
                    {loading ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ubicación de Destino */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  Ubicación de Destino
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Input
                      label="Dirección de Destino *"
                      placeholder="Dirección completa"
                      value={formData.destinationLocation?.address || ""}
                      onChange={(e) => handleLocationChange("destinationLocation", "address", e.target.value)}
                      error={errors['destinationLocation.address']}
                      required
                    />
                  </div>

                  <Button
                    onClick={() => getCurrentLocation("destinationLocation")}
                    variant="outline"
                    fullWidth
                    leftIcon={loading ? <Loader className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                    disabled={loading}
                    className="hover:bg-red-50 hover:border-red-300"
                  >
                    {loading ? "Obteniendo ubicación..." : "Usar ubicación actual"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estado y configuración */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle>Estado del Transporte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Estado Actual
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={formData.status || "planned"}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                    >
                      <option value="planned">Planificado</option>
                      <option value="in_transit">En Tránsito</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                      <option value="delayed">Retrasado</option>
                    </select>
                  </div>

                  {/* Permisos y certificaciones */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Permisos y Certificaciones</h4>
                    
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.healthCertificates || false}
                        onChange={(e) => handleInputChange("healthCertificates", e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">Certificados de Salud</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.transportPermits || false}
                        onChange={(e) => handleInputChange("transportPermits", e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">Permisos de Transporte</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.insurance || false}
                        onChange={(e) => handleInputChange("insurance", e.target.checked)}
                      />
                      <span className="text-sm text-gray-700">Seguro de Transporte</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contactos de emergencia */}
            <Card className="border border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="h-5 w-5 mr-2 text-orange-600" />
                  Contacto de Emergencia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Input
                    label="Teléfono de Emergencia"
                    placeholder="555-0123"
                    value={formData.emergencyContacts?.[0] || ""}
                    onChange={(e) => {
                      const contacts = [...(formData.emergencyContacts || [""])];
                      contacts[0] = e.target.value;
                      handleInputChange("emergencyContacts", contacts);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventTransport;