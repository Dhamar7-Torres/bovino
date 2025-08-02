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
  ShoppingBag,
  DollarSign,
  UserCheck,
  Calendar as CalendarIcon,
  FileText,
  Truck,
  ArrowLeft,
  Save,
  Plus,
  TrendingUp,
  Award,
  Edit,
  Trash2,
  Eye,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";

// Interfaz para el evento de venta
interface SalesEvent {
  id: string;
  bovineId: string;
  bovineName: string;
  buyerId: string;
  buyerName: string;
  buyerContact: string;
  saleDate: string;
  salePrice: number;
  weight: number;
  pricePerKg: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  deliveryMethod: string;
  healthCertificate: boolean;
  qualityGrade: string;
  documents: string[];
  notes: string;
  paymentMethod: string;
  paymentStatus: "pending" | "paid" | "overdue";
  commission: number;
  deliveryDate: string;
  contractType: "direct" | "auction" | "contract";
  createdAt: string;
  updatedAt: string;
}

// Datos simulados (en una app real esto vendría de tu API)
const initialSalesEvents: SalesEvent[] = [
  {
    id: "1",
    bovineId: "BOV001",
    bovineName: "Toro Premium 001",
    buyerId: "BUY001",
    buyerName: "Juan Pérez",
    buyerContact: "+52 993 123 4567",
    saleDate: "2025-01-15",
    salePrice: 45000,
    weight: 500,
    pricePerKg: 90,
    location: {
      lat: 17.9995,
      lng: -92.9476,
      address: "Villahermosa, Tabasco, México",
    },
    deliveryMethod: "pickup",
    healthCertificate: true,
    qualityGrade: "Premium",
    documents: ["certificado_salud.pdf", "contrato_venta.pdf"],
    notes: "Toro de alta calidad, excelente para reproducción",
    paymentMethod: "transfer",
    paymentStatus: "paid",
    commission: 2250,
    deliveryDate: "2025-01-20",
    contractType: "direct",
    createdAt: "2025-01-10T10:00:00Z",
    updatedAt: "2025-01-15T14:30:00Z",
  },
];

type ViewMode = "list" | "create" | "edit" | "detail";

const EventSales: React.FC = () => {
  // Estados principales
  const [salesEvents, setSalesEvents] = useState<SalesEvent[]>(initialSalesEvents);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedEvent, setSelectedEvent] = useState<SalesEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Estado del formulario
  const [formData, setFormData] = useState<Partial<SalesEvent>>({
    bovineId: "",
    bovineName: "",
    buyerId: "",
    buyerName: "",
    buyerContact: "",
    saleDate: new Date().toISOString().split("T")[0],
    salePrice: 0,
    weight: 0,
    pricePerKg: 0,
    location: {
      lat: 17.9995,
      lng: -92.9476,
      address: "Villahermosa, Tabasco, México",
    },
    deliveryMethod: "pickup",
    healthCertificate: false,
    qualityGrade: "",
    documents: [],
    notes: "",
    paymentMethod: "cash",
    paymentStatus: "pending",
    commission: 0,
    deliveryDate: "",
    contractType: "direct",
  });

  // Errores de validación
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calcular precio por kg automáticamente
  useEffect(() => {
    if (formData.salePrice && formData.weight && formData.weight > 0) {
      const pricePerKg = formData.salePrice / formData.weight;
      setFormData(prev => ({
        ...prev,
        pricePerKg: Math.round(pricePerKg * 100) / 100
      }));
    }
  }, [formData.salePrice, formData.weight]);

  // Calcular comisión automáticamente (5% del precio de venta)
  useEffect(() => {
    if (formData.salePrice) {
      const commission = formData.salePrice * 0.05;
      setFormData(prev => ({
        ...prev,
        commission: Math.round(commission * 100) / 100
      }));
    }
  }, [formData.salePrice]);

  // Filtrar eventos
  const filteredEvents = salesEvents.filter(event => {
    const matchesSearch = 
      event.bovineName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.buyerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.bovineId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || event.paymentStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Funciones CRUD
  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const newEvent: SalesEvent = {
        ...formData as SalesEvent,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setSalesEvents(prev => [...prev, newEvent]);
      resetForm();
      setViewMode("list");
      
      // Aquí harías la llamada a tu API
      // await api.createSalesEvent(newEvent);
      
    } catch (error) {
      console.error("Error creating sales event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedEvent || !validateForm()) return;

    setLoading(true);
    try {
      const updatedEvent: SalesEvent = {
        ...formData as SalesEvent,
        id: selectedEvent.id,
        createdAt: selectedEvent.createdAt,
        updatedAt: new Date().toISOString(),
      };

      setSalesEvents(prev => prev.map(event => 
        event.id === selectedEvent.id ? updatedEvent : event
      ));
      
      setViewMode("list");
      setSelectedEvent(null);
      
      // Aquí harías la llamada a tu API
      // await api.updateSalesEvent(updatedEvent);
      
    } catch (error) {
      console.error("Error updating sales event:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este evento de venta?")) {
      return;
    }

    setLoading(true);
    try {
      setSalesEvents(prev => prev.filter(event => event.id !== eventId));
      
      // Aquí harías la llamada a tu API
      // await api.deleteSalesEvent(eventId);
      
    } catch (error) {
      console.error("Error deleting sales event:", error);
    } finally {
      setLoading(false);
    }
  };

  // Validación del formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bovineName?.trim()) {
      newErrors.bovineName = "El nombre del bovino es requerido";
    }
    if (!formData.buyerName?.trim()) {
      newErrors.buyerName = "El nombre del comprador es requerido";
    }
    if (!formData.buyerContact?.trim()) {
      newErrors.buyerContact = "El contacto del comprador es requerido";
    }
    if (!formData.saleDate) {
      newErrors.saleDate = "La fecha de venta es requerida";
    }
    if (!formData.salePrice || formData.salePrice <= 0) {
      newErrors.salePrice = "El precio de venta debe ser mayor a 0";
    }
    if (!formData.weight || formData.weight <= 0) {
      newErrors.weight = "El peso debe ser mayor a 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      bovineId: "",
      bovineName: "",
      buyerId: "",
      buyerName: "",
      buyerContact: "",
      saleDate: new Date().toISOString().split("T")[0],
      salePrice: 0,
      weight: 0,
      pricePerKg: 0,
      location: {
        lat: 17.9995,
        lng: -92.9476,
        address: "Villahermosa, Tabasco, México",
      },
      deliveryMethod: "pickup",
      healthCertificate: false,
      qualityGrade: "",
      documents: [],
      notes: "",
      paymentMethod: "cash",
      paymentStatus: "pending",
      commission: 0,
      deliveryDate: "",
      contractType: "direct",
    });
    setErrors({});
  };

  // Manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Limpiar error si existe
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  // Abrir formulario de edición
  const openEditForm = (event: SalesEvent) => {
    setSelectedEvent(event);
    setFormData(event);
    setViewMode("edit");
  };

  // Ver detalles del evento
  const viewEventDetail = (event: SalesEvent) => {
    setSelectedEvent(event);
    setViewMode("detail");
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Renderizar lista de eventos
  const renderEventsList = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header con búsqueda y filtros */}
      <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Eventos de Ventas</h1>
            <p className="text-gray-600">Gestiona los eventos de venta de tu ganado</p>
          </div>
          
          <Button
            onClick={() => {
              resetForm();
              setViewMode("create");
            }}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus size={20} className="mr-2" />
            Nueva Venta
          </Button>
        </div>

        {/* Búsqueda y filtros */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Buscar por bovino, comprador o ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
            <option value="overdue">Vencido</option>
          </select>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Ventas</p>
                <p className="text-2xl font-bold">{salesEvents.length}</p>
              </div>
              <ShoppingBag size={32} className="text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Ingresos Totales</p>
                <p className="text-2xl font-bold">
                  ${salesEvents.reduce((sum, event) => sum + event.salePrice, 0).toLocaleString()}
                </p>
              </div>
              <DollarSign size={32} className="text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Pendientes</p>
                <p className="text-2xl font-bold">
                  {salesEvents.filter(e => e.paymentStatus === "pending").length}
                </p>
              </div>
              <AlertCircle size={32} className="text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Precio Promedio/Kg</p>
                <p className="text-2xl font-bold">
                  ${(salesEvents.reduce((sum, event) => sum + event.pricePerKg, 0) / salesEvents.length || 0).toFixed(2)}
                </p>
              </div>
              <TrendingUp size={32} className="text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Lista de eventos */}
      <motion.div variants={itemVariants} className="space-y-4">
        {filteredEvents.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardContent className="p-8 text-center">
              <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos de venta</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filterStatus !== "all" 
                  ? "No se encontraron eventos que coincidan con los filtros."
                  : "Comienza registrando tu primera venta de ganado."}
              </p>
              {!searchTerm && filterStatus === "all" && (
                <Button
                  onClick={() => {
                    resetForm();
                    setViewMode("create");
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Plus size={20} className="mr-2" />
                  Registrar Primera Venta
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <motion.div key={event.id} layout>
              <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 border border-white/20">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {event.bovineName}
                        </h3>
                        <span className="text-sm text-gray-500">#{event.bovineId}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : event.paymentStatus === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {event.paymentStatus === "paid" ? "Pagado" :
                           event.paymentStatus === "pending" ? "Pendiente" : "Vencido"}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Comprador:</span>
                          <p className="font-medium">{event.buyerName}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Precio:</span>
                          <p className="font-medium">${event.salePrice.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Peso:</span>
                          <p className="font-medium">{event.weight} kg</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Fecha:</span>
                          <p className="font-medium">{new Date(event.saleDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => viewEventDetail(event)}
                        variant="outline"
                        size="sm"
                        className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                      >
                        <Eye size={16} />
                        Ver
                      </Button>
                      <Button
                        onClick={() => openEditForm(event)}
                        variant="outline"
                        size="sm"
                        className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                      >
                        <Edit size={16} />
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDelete(event.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
    </motion.div>
  );

  // Renderizar formulario (crear/editar)
  const renderForm = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-gray-900">
                  {viewMode === "create" ? "Registrar Nueva Venta" : "Editar Evento de Venta"}
                </CardTitle>
                <CardDescription>
                  {viewMode === "create" 
                    ? "Completa la información del evento de venta"
                    : "Modifica los datos del evento de venta"}
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  setViewMode("list");
                  setSelectedEvent(null);
                  resetForm();
                }}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Volver
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Información del Bovino */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Información del Bovino
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    ID del Bovino <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.bovineId || ""}
                    onChange={(e) => handleInputChange("bovineId", e.target.value)}
                    placeholder="Ej: BOV001"
                    className={errors.bovineId ? "border-red-500" : ""}
                  />
                  {errors.bovineId && (
                    <p className="text-red-500 text-sm">{errors.bovineId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre del Bovino <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.bovineName || ""}
                    onChange={(e) => handleInputChange("bovineName", e.target.value)}
                    placeholder="Ej: Toro Premium 001"
                    className={`bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white ${errors.bovineName ? "border-red-500" : ""}`}
                  />
                  {errors.bovineName && (
                    <p className="text-red-500 text-sm">{errors.bovineName}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Peso (kg) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.weight || ""}
                    onChange={(e) => handleInputChange("weight", Number(e.target.value))}
                    placeholder="Ej: 500"
                    min="0"
                    className={`bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white ${errors.weight ? "border-red-500" : ""}`}
                  />
                  {errors.weight && (
                    <p className="text-red-500 text-sm">{errors.weight}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Grado de Calidad
                  </label>
                  <Input
                    value={formData.qualityGrade || ""}
                    onChange={(e) => handleInputChange("qualityGrade", e.target.value)}
                    placeholder="Ej: Premium, Standard, Select, Choice, Prime..."
                    className="bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white"
                  />
                  <p className="text-xs text-gray-500">Puedes escribir cualquier grado de calidad personalizado</p>
                </div>
              </div>
            </div>

            {/* Información del Comprador */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Información del Comprador
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    ID del Comprador
                  </label>
                  <Input
                    value={formData.buyerId || ""}
                    onChange={(e) => handleInputChange("buyerId", e.target.value)}
                    placeholder="Ej: BUY001"
                    className="bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre del Comprador <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.buyerName || ""}
                    onChange={(e) => handleInputChange("buyerName", e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className={`bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white ${errors.buyerName ? "border-red-500" : ""}`}
                  />
                  {errors.buyerName && (
                    <p className="text-red-500 text-sm">{errors.buyerName}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Contacto del Comprador <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.buyerContact || ""}
                    onChange={(e) => handleInputChange("buyerContact", e.target.value)}
                    placeholder="Ej: +52 993 123 4567"
                    className={`bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white ${errors.buyerContact ? "border-red-500" : ""}`}
                  />
                  {errors.buyerContact && (
                    <p className="text-red-500 text-sm">{errors.buyerContact}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Información de la Venta */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Detalles de la Venta
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Venta <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="date"
                    value={formData.saleDate || ""}
                    onChange={(e) => handleInputChange("saleDate", e.target.value)}
                    className={`bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white ${errors.saleDate ? "border-red-500" : ""}`}
                  />
                  {errors.saleDate && (
                    <p className="text-red-500 text-sm">{errors.saleDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha de Entrega
                  </label>
                  <Input
                    type="date"
                    value={formData.deliveryDate || ""}
                    onChange={(e) => handleInputChange("deliveryDate", e.target.value)}
                    className="bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Precio de Venta ($) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={formData.salePrice || ""}
                    onChange={(e) => handleInputChange("salePrice", Number(e.target.value))}
                    placeholder="Ej: 45000"
                    min="0"
                    step="0.01"
                    className={`bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white ${errors.salePrice ? "border-red-500" : ""}`}
                  />
                  {errors.salePrice && (
                    <p className="text-red-500 text-sm">{errors.salePrice}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Precio por Kg ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.pricePerKg || ""}
                    readOnly
                    className="bg-gray-100/60 backdrop-blur-sm border-gray-200/30 text-gray-600"
                    placeholder="Se calcula automáticamente"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Comisión ($)
                  </label>
                  <Input
                    type="number"
                    value={formData.commission || ""}
                    readOnly
                    className="bg-gray-100/60 backdrop-blur-sm border-gray-200/30 text-gray-600"
                    placeholder="Se calcula automáticamente (5%)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Método de Pago
                  </label>
                  <select
                    value={formData.paymentMethod || ""}
                    onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                    className="w-full px-4 py-2 border border-white/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/60 backdrop-blur-sm hover:bg-white transition-all duration-200"
                  >
                    <option value="cash">Efectivo</option>
                    <option value="transfer">Transferencia</option>
                    <option value="check">Cheque</option>
                    <option value="credit">Crédito</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Estado del Pago
                  </label>
                  <select
                    value={formData.paymentStatus || ""}
                    onChange={(e) => handleInputChange("paymentStatus", e.target.value)}
                    className="w-full px-4 py-2 border border-white/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/60 backdrop-blur-sm hover:bg-white transition-all duration-200"
                  >
                    <option value="pending">Pendiente</option>
                    <option value="paid">Pagado</option>
                    <option value="overdue">Vencido</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Método de Entrega
                  </label>
                  <select
                    value={formData.deliveryMethod || ""}
                    onChange={(e) => handleInputChange("deliveryMethod", e.target.value)}
                    className="w-full px-4 py-2 border border-white/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/60 backdrop-blur-sm hover:bg-white transition-all duration-200"
                  >
                    <option value="pickup">Recolección en granja</option>
                    <option value="delivery">Entrega a domicilio</option>
                    <option value="transport">Transporte especializado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Información Adicional */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Información Adicional
              </h3>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="healthCertificate"
                  checked={formData.healthCertificate || false}
                  onChange={(e) => handleInputChange("healthCertificate", e.target.checked)}
                  className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="healthCertificate" className="text-sm font-medium text-gray-700">
                  Certificado de salud incluido
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Contrato
                </label>
                <select
                  value={formData.contractType || ""}
                  onChange={(e) => handleInputChange("contractType", e.target.value)}
                  className="w-full px-4 py-2 border border-white/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/60 backdrop-blur-sm hover:bg-white transition-all duration-200"
                >
                  <option value="direct">Venta Directa</option>
                  <option value="auction">Subasta</option>
                  <option value="contract">Contrato a Futuro</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Notas Adicionales
                </label>
                <textarea
                  value={formData.notes || ""}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  placeholder="Información adicional sobre la venta..."
                  rows={4}
                  className="w-full px-4 py-3 border border-white/30 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/60 backdrop-blur-sm resize-none hover:bg-white transition-all duration-200"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                onClick={() => {
                  setViewMode("list");
                  setSelectedEvent(null);
                  resetForm();
                }}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                onClick={viewMode === "create" ? handleCreate : handleUpdate}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save size={20} className="mr-2" />
                )}
                {viewMode === "create" ? "Registrar Venta" : "Actualizar Venta"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // Renderizar detalle del evento
  const renderEventDetail = () => {
    if (!selectedEvent) return null;

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-gray-900">
                    Detalle del Evento de Venta
                  </CardTitle>
                  <CardDescription>
                    Información completa del evento de venta #{selectedEvent.id}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => openEditForm(selectedEvent)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Edit size={20} />
                    Editar
                  </Button>
                  <Button
                    onClick={() => {
                      setViewMode("list");
                      setSelectedEvent(null);
                    }}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft size={20} />
                    Volver
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              {/* Información del Bovino */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <Award className="text-green-600" size={20} />
                  Información del Bovino
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">ID del Bovino</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.bovineId}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.bovineName}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Peso</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.weight} kg</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Grado de Calidad</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.qualityGrade || "No especificado"}</p>
                  </div>
                </div>
              </div>

              {/* Información del Comprador */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <UserCheck className="text-blue-600" size={20} />
                  Información del Comprador
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.buyerName}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Contacto</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.buyerContact}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">ID del Comprador</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.buyerId || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Detalles de la Venta */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <DollarSign className="text-green-600" size={20} />
                  Detalles de la Venta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <p className="text-sm text-green-600">Precio Total</p>
                    <p className="text-2xl font-bold text-green-700">${selectedEvent.salePrice.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-600">Precio por Kg</p>
                    <p className="text-xl font-bold text-blue-700">${selectedEvent.pricePerKg}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <p className="text-sm text-purple-600">Comisión</p>
                    <p className="text-xl font-bold text-purple-700">${selectedEvent.commission.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Estado del Pago</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedEvent.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : selectedEvent.paymentStatus === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}>
                        {selectedEvent.paymentStatus === "paid" ? "Pagado" :
                         selectedEvent.paymentStatus === "pending" ? "Pendiente" : "Vencido"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fechas y Logística */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <Truck className="text-orange-600" size={20} />
                  Fechas y Logística
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Fecha de Venta</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedEvent.saleDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Fecha de Entrega</p>
                    <p className="font-semibold text-gray-900">
                      {selectedEvent.deliveryDate 
                        ? new Date(selectedEvent.deliveryDate).toLocaleDateString()
                        : "No especificada"
                      }
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Método de Entrega</p>
                    <p className="font-semibold text-gray-900">
                      {selectedEvent.deliveryMethod === "pickup" ? "Recolección en granja" :
                       selectedEvent.deliveryMethod === "delivery" ? "Entrega a domicilio" :
                       "Transporte especializado"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Método de Pago</p>
                    <p className="font-semibold text-gray-900">
                      {selectedEvent.paymentMethod === "cash" ? "Efectivo" :
                       selectedEvent.paymentMethod === "transfer" ? "Transferencia" :
                       selectedEvent.paymentMethod === "check" ? "Cheque" : "Crédito"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información Adicional */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <FileText className="text-indigo-600" size={20} />
                  Información Adicional
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500">Certificado de Salud</p>
                    <div className="flex items-center gap-2 mt-1">
                      {selectedEvent.healthCertificate ? (
                        <CheckCircle className="text-green-600" size={16} />
                      ) : (
                        <X className="text-red-600" size={16} />
                      )}
                      <span className="font-semibold text-gray-900">
                        {selectedEvent.healthCertificate ? "Incluido" : "No incluido"}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500">Tipo de Contrato</p>
                    <p className="font-semibold text-gray-900">
                      {selectedEvent.contractType === "direct" ? "Venta Directa" :
                       selectedEvent.contractType === "auction" ? "Subasta" : "Contrato a Futuro"}
                    </p>
                  </div>
                </div>

                {selectedEvent.notes && (
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Notas</p>
                    <p className="text-gray-900">{selectedEvent.notes}</p>
                  </div>
                )}
              </div>

              {/* Ubicación */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <MapPin className="text-red-600" size={20} />
                  Ubicación
                </h3>
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                  <p className="text-sm text-gray-500">Dirección</p>
                  <p className="font-semibold text-gray-900">{selectedEvent.location.address}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Coordenadas: {selectedEvent.location.lat}, {selectedEvent.location.lng}
                  </p>
                </div>
              </div>

              {/* Fechas del Sistema */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <CalendarIcon className="text-gray-600" size={20} />
                  Información del Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500">Fecha de Creación</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedEvent.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-500">Última Actualización</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedEvent.updatedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  };

  // Renderizar vista principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d8b40] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <AnimatePresence mode="wait">
        {viewMode === "list" && renderEventsList()}
        {(viewMode === "create" || viewMode === "edit") && renderForm()}
        {viewMode === "detail" && renderEventDetail()}
      </AnimatePresence>
    </div>
  );
};

export default EventSales;