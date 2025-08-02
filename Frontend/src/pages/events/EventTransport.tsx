import React, { useState, useMemo } from "react";
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
  Camera,
  FileText,
  Route,
  ArrowLeft,
  Save,
  Plus,
  Clock,
  AlertTriangle,
  Shield,
  Thermometer,
  Navigation,
  Search,
  Eye,
  Edit3,
  Trash2,
  Filter,
  Download,
  X,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader,
  Package,
  TrendingUp,
  BarChart3,
  Activity,
  Users,
  MapPin as LocationIcon,
} from "lucide-react";

// Interfaz para el evento de transporte
interface TransportEvent {
  id: string;
  bovineIds: string[];
  bovineNames: string[];
  driverName: string;
  driverLicense: string;
  vehicleType: string;
  vehiclePlate: string;
  originLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  destinationLocation: {
    lat: number;
    lng: number;
    address: string;
  };
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
  weatherConditions: string;
  animalCondition: string;
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
        address: "Mercado de Ganado",
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
      status: "planned",
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
      departureDate: "2024-12-28",
      arrivalDate: "2024-12-28",
      estimatedDuration: 2,
      actualDuration: 2.5,
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
      incidents: "Ligero retraso por tráfico",
      status: "completed",
      createdAt: "2024-12-15T08:00:00Z",
      updatedAt: "2024-12-28T14:30:00Z",
      responsible: "María González",
    },
    {
      id: "TRN-003",
      bovineIds: ["ESP-003", "PAL-003"],
      bovineNames: ["Bruno", "Luna"],
      driverName: "Carlos Mendoza",
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
      departureDate: "2024-12-30",
      arrivalDate: "2024-12-30",
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
  
  const [selectedEvent, setSelectedEvent] = useState<TransportEvent | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  // Estado para el formulario
  const [formData, setFormData] = useState<Partial<TransportEvent>>({
    bovineIds: [""],
    bovineNames: [""],
    driverName: "",
    driverLicense: "",
    vehicleType: "",
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
    weatherConditions: "",
    animalCondition: "",
    healthCertificates: false,
    transportPermits: false,
    insurance: false,
    emergencyContacts: [""],
    routeNotes: "",
    incidents: "",
    status: "planned",
    responsible: "",
  });

  // Calcular estadísticas
  const stats = useMemo(() => {
    const totalEvents = events.length;
    const totalDistance = events.reduce((sum, event) => sum + event.distance, 0);
    const totalCost = events.reduce((sum, event) => sum + event.totalCost, 0);
    const completedEvents = events.filter(e => e.status === 'completed').length;
    const efficiency = totalEvents > 0 ? (completedEvents / totalEvents) * 100 : 0;

    return {
      totalEvents,
      totalDistance,
      totalCost,
      efficiency: Math.round(efficiency * 10) / 10
    };
  }, [events]);

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
  const getCurrentLocation = (
    locationType: "originLocation" | "destinationLocation"
  ) => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Simular reverse geocoding
            const address = await reverseGeocode(latitude, longitude);
            
            setFormData(prev => ({
              ...prev,
              [locationType]: {
                lat: latitude,
                lng: longitude,
                address: address
              }
            }));
          } catch (error) {
            console.error("Error obteniendo dirección:", error);
            setFormData(prev => ({
              ...prev,
              [locationType]: {
                lat: latitude,
                lng: longitude,
                address: `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`
              }
            }));
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          alert("No se pudo obtener la ubicación actual. Verifica los permisos de ubicación.");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      alert("La geolocalización no está soportada en este navegador");
    }
  };

  // Función simulada de reverse geocoding
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    // En una aplicación real, aquí usarías una API como Google Maps o OpenStreetMap
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulación de direcciones basadas en las coordenadas de Tabasco
    const locations = [
      "Corral Norte, Rancho El Progreso",
      "Corral Sur, Rancho El Progreso", 
      "Corral Este, Rancho El Progreso",
      "Corral Oeste, Rancho El Progreso",
      "Área de Cuarentena, Rancho El Progreso",
      "Zona de Carga, Rancho El Progreso"
    ];
    
    return locations[Math.floor(Math.random() * locations.length)];
  };

  // Animaciones
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

  // Funciones CRUD básicas
  const handleCreate = () => {
    setFormData({
      bovineIds: [""],
      bovineNames: [""],
      driverName: "",
      driverLicense: "",
      vehicleType: "",
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
      weatherConditions: "",
      animalCondition: "",
      healthCertificates: false,
      transportPermits: false,
      insurance: false,
      emergencyContacts: [""],
      routeNotes: "",
      incidents: "",
      status: "planned",
      responsible: "",
    });
    setCurrentView('create');
  };

  const handleEdit = (event: TransportEvent) => {
    setFormData(event);
    setCurrentView('edit');
  };

  const handleView = (event: TransportEvent) => {
    setSelectedEvent(event);
    setCurrentView('detail');
  };

  const handleDelete = async (eventId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este evento de transporte?")) {
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
    }
  };

  const handleSave = async () => {
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
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (
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
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'delayed':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'in_transit':
        return <Loader className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

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
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'delayed':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_transit':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  // Renderizado condicional según la vista
  if (currentView === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
        <motion.div
          className="max-w-7xl mx-auto"
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
              <div className="bg-purple-500 p-3 rounded-full">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Eventos de Transporte
                </h1>
                <p className="text-gray-600">
                  Gestiona el transporte y movilización de tu ganado
                </p>
              </div>
            </div>
            <Button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700"
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Nuevo Evento
            </Button>
          </motion.div>

          {/* Tarjetas de estadísticas */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            variants={itemVariants}
          >
            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Eventos</p>
                    <p className="text-3xl font-bold text-green-600">{stats.totalEvents}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <Package className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Distancia Total</p>
                    <p className="text-3xl font-bold text-blue-600">{stats.totalDistance} km</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Costo Total</p>
                    <p className="text-3xl font-bold text-purple-600">${stats.totalCost.toLocaleString()}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <DollarSign className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Eficiencia</p>
                    <p className="text-3xl font-bold text-orange-600">{stats.efficiency}%</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-full">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Filtros y búsqueda */}
          <motion.div
            className="bg-white rounded-lg shadow-sm p-6 mb-6"
            variants={itemVariants}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por vaca, alimento..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

          {/* Lista de eventos */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            <AnimatePresence>
              {filteredEvents.map((event) => (
                <motion.div
                  key={event.id}
                  variants={itemVariants}
                  layout
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-200 h-full bg-white">
                    <CardContent className="p-6">
                      {/* Header del evento */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="bg-green-100 p-2 rounded-lg">
                            <Truck className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{getVehicleTypeText(event.vehicleType)}</h3>
                            <p className="text-sm text-gray-500">
                              {event.bovineNames.map((name, index) => (
                                <span key={index}>
                                  {name} • {event.bovineIds[index]}
                                  {index < event.bovineNames.length - 1 && ", "}
                                </span>
                              ))}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                          {getStatusText(event.status)}
                        </span>
                      </div>

                      {/* Tipo de transporte */}
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {event.destinationLocation.address}
                        </h4>
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>Distancia: {event.distance} km</span>
                          <span>Costo: ${event.totalCost.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Información del evento */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{new Date(event.departureDate).toLocaleDateString()}, {event.estimatedDuration}h</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <LocationIcon className="h-4 w-4 mr-2" />
                          <span>{event.originLocation.address}</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="h-4 w-4 mr-2" />
                          <span>{event.responsible}</span>
                        </div>
                      </div>

                      {/* Botones de acción */}
                      <div className="flex space-x-2 pt-4 border-t border-gray-100">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(event)}
                          className="flex-1"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(event)}
                          className="flex-1"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(event.id)}
                          className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredEvents.length === 0 && (
            <motion.div
              className="text-center py-12"
              variants={itemVariants}
            >
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No se encontraron eventos
              </h3>
              <p className="text-gray-600 mb-4">
                No hay eventos de transporte que coincidan con los filtros seleccionados.
              </p>
              <Button onClick={handleCreate} leftIcon={<Plus className="h-4 w-4" />}>
                Crear primer evento
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    );
  }

  // Vista de crear/editar (simplificada para el ejemplo)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 p-6">
      <motion.div
        className="max-w-4xl mx-auto"
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
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              onClick={() => setCurrentView('list')}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={loading}
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
                    <Save className="h-4 w-4" />
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
            <Card>
              <CardHeader>
                <CardTitle>Información del Transporte</CardTitle>
                <CardDescription>
                  Datos básicos del evento de transporte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Conductor"
                      placeholder="Nombre del conductor"
                      value={formData.driverName || ""}
                      onChange={(e) =>
                        handleInputChange("driverName", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Placas del Vehículo"
                      placeholder="Número de placas"
                      value={formData.vehiclePlate || ""}
                      onChange={(e) =>
                        handleInputChange("vehiclePlate", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Vehículo
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={formData.vehicleType || ""}
                        onChange={(e) =>
                          handleInputChange("vehicleType", e.target.value)
                        }
                      >
                        <option value="">Selecciona tipo</option>
                        <option value="cattle_truck">Camión Ganadero</option>
                        <option value="trailer">Tráiler Ganadero</option>
                        <option value="pickup_truck">Camioneta</option>
                        <option value="cattle_car">Carro de Ganado</option>
                      </select>
                    </div>
                    <Input
                      label="Responsable"
                      placeholder="Encargado del evento"
                      value={formData.responsible || ""}
                      onChange={(e) =>
                        handleInputChange("responsible", e.target.value)
                      }
                    />
                  </div>

                  <Input
                    label="Fecha de Transporte"
                    type="date"
                    value={formData.departureDate || ""}
                    onChange={(e) =>
                      handleInputChange("departureDate", e.target.value)
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Costos */}
            <Card>
              <CardHeader>
                <CardTitle>Costos del Transporte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Costo de Transporte"
                    type="number"
                    step="0.01"
                    placeholder="$0.00"
                    value={formData.transportCost?.toString() || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "transportCost",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                  <Input
                    label="Costo de Combustible"
                    type="number"
                    step="0.01"
                    placeholder="$0.00"
                    value={formData.fuelCost?.toString() || ""}
                    onChange={(e) =>
                      handleInputChange(
                        "fuelCost",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Columna derecha */}
          <motion.div className="space-y-6" variants={itemVariants}>
            {/* Ubicación de Origen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-green-600" />
                  Ubicación de Origen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Dirección de Origen"
                    placeholder="Dirección completa"
                    value={formData.originLocation?.address || ""}
                    onChange={(e) =>
                      handleLocationChange(
                        "originLocation",
                        "address",
                        e.target.value
                      )
                    }
                  />

                  <Button
                    onClick={() => getCurrentLocation("originLocation")}
                    variant="outline"
                    fullWidth
                    leftIcon={loading ? <Loader className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                    disabled={loading}
                  >
                    {loading ? "Obteniendo ubicación..." : "Usar mi ubicación actual"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ubicación de Destino */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-600" />
                  Ubicación de Destino
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Dirección de Destino"
                    placeholder="Dirección completa"
                    value={formData.destinationLocation?.address || ""}
                    onChange={(e) =>
                      handleLocationChange(
                        "destinationLocation",
                        "address",
                        e.target.value
                      )
                    }
                  />

                  <Button
                    onClick={() => getCurrentLocation("destinationLocation")}
                    variant="outline"
                    fullWidth
                    leftIcon={loading ? <Loader className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                    disabled={loading}
                  >
                    {loading ? "Obteniendo ubicación..." : "Usar ubicación actual"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estado */}
            <Card>
              <CardHeader>
                <CardTitle>Estado del Transporte</CardTitle>
              </CardHeader>
              <CardContent>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.status || "planned"}
                  onChange={(e) =>
                    handleInputChange("status", e.target.value)
                  }
                >
                  <option value="planned">Planificado</option>
                  <option value="in_transit">En Tránsito</option>
                  <option value="completed">Completado</option>
                  <option value="cancelled">Cancelado</option>
                  <option value="delayed">Retrasado</option>
                </select>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventTransport;