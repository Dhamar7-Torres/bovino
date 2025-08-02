import React, { useState } from "react";
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
import { Modal, ModalHeader, ModalBody, ModalFooter } from "../../components/ui/Modal";
import { Badge } from "../../components/ui/Badge";
import {
  MapPin,
  ShoppingCart,
  DollarSign,
  User,
  Calendar as CalendarIcon,
  Camera,
  FileText,
  Truck,
  ArrowLeft,
  Save,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Download,
} from "lucide-react";

// Interfaz para el evento de compra
interface PurchaseEvent {
  id?: string;
  bovineId: string;
  bovineName?: string;
  sellerId: string;
  sellerName: string;
  sellerContact: string;
  purchaseDate: string;
  purchasePrice: number;
  weight: number;
  condition: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  transportMethod: string;
  veterinaryCheckup: boolean;
  documents: string[];
  notes: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
}

// Datos mock para la tabla
const mockPurchaseEvents: PurchaseEvent[] = [
  {
    id: "PUR-001",
    bovineId: "BOV-001",
    bovineName: "Luna",
    sellerId: "SELL-001",
    sellerName: "Juan Pérez",
    sellerContact: "993-123-4567",
    purchaseDate: "2025-07-20",
    purchasePrice: 25000,
    weight: 450,
    condition: "excellent",
    location: {
      lat: 17.9995,
      lng: -92.9476,
      address: "Villahermosa, Tabasco, México",
    },
    transportMethod: "own_truck",
    veterinaryCheckup: true,
    documents: ["cert_001.pdf"],
    notes: "Animal en excelente estado",
    paymentMethod: "transfer",
    paymentStatus: "completed",
    createdAt: "2025-07-20T10:30:00Z",
    updatedAt: "2025-07-20T10:30:00Z",
  },
  {
    id: "PUR-002",
    bovineId: "BOV-002",
    bovineName: "Estrella",
    sellerId: "SELL-002",
    sellerName: "María González",
    sellerContact: "993-987-6543",
    purchaseDate: "2025-07-18",
    purchasePrice: 28000,
    weight: 480,
    condition: "good",
    location: {
      lat: 18.1,
      lng: -93.2,
      address: "Comalcalco, Tabasco, México",
    },
    transportMethod: "hired_transport",
    veterinaryCheckup: true,
    documents: ["cert_002.pdf", "transport_002.pdf"],
    notes: "Transporte sin incidentes",
    paymentMethod: "cash",
    paymentStatus: "completed",
    createdAt: "2025-07-18T14:15:00Z",
    updatedAt: "2025-07-18T14:15:00Z",
  },
  {
    id: "PUR-003",
    bovineId: "BOV-003",
    bovineName: "Paloma",
    sellerId: "SELL-003",
    sellerName: "Carlos Mendoza",
    sellerContact: "993-555-7890",
    purchaseDate: "2025-07-15",
    purchasePrice: 22000,
    weight: 420,
    condition: "fair",
    location: {
      lat: 17.8,
      lng: -92.7,
      address: "Macuspana, Tabasco, México",
    },
    transportMethod: "seller_delivery",
    veterinaryCheckup: false,
    documents: [],
    notes: "Pendiente chequeo veterinario",
    paymentMethod: "check",
    paymentStatus: "pending",
    createdAt: "2025-07-15T09:00:00Z",
    updatedAt: "2025-07-15T09:00:00Z",
  },
];

type ViewMode = "list" | "create" | "edit" | "view";

const EventPurchase: React.FC = () => {
  // Estados principales
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [events, setEvents] = useState<PurchaseEvent[]>(mockPurchaseEvents);
  const [selectedEvent, setSelectedEvent] = useState<PurchaseEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Estados para modales
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    eventId: "",
    eventName: "",
  });

  // Estado para el formulario
  const [formData, setFormData] = useState<PurchaseEvent>({
    bovineId: "",
    bovineName: "",
    sellerId: "",
    sellerName: "",
    sellerContact: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    purchasePrice: 0,
    weight: 0,
    condition: "",
    location: {
      lat: 17.9995,
      lng: -92.9476,
      address: "Villahermosa, Tabasco, México",
    },
    transportMethod: "",
    veterinaryCheckup: false,
    documents: [],
    notes: "",
    paymentMethod: "",
    paymentStatus: "pending",
    createdAt: "",
    updatedAt: "",
  });

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

  // Funciones utilitarias
  const generateId = () => `PUR-${String(Date.now()).slice(-6)}`;

  const resetForm = () => {
    setFormData({
      bovineId: "",
      bovineName: "",
      sellerId: "",
      sellerName: "",
      sellerContact: "",
      purchaseDate: new Date().toISOString().split("T")[0],
      purchasePrice: 0,
      weight: 0,
      condition: "",
      location: {
        lat: 17.9995,
        lng: -92.9476,
        address: "Villahermosa, Tabasco, México",
      },
      transportMethod: "",
      veterinaryCheckup: false,
      documents: [],
      notes: "",
      paymentMethod: "",
      paymentStatus: "pending",
      createdAt: "",
      updatedAt: "",
    });
  };

  // Funciones CRUD
  const handleCreate = async () => {
    setLoading(true);
    try {
      const newEvent: PurchaseEvent = {
        ...formData,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setEvents(prev => [newEvent, ...prev]);
      resetForm();
      setViewMode("list");
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Evento de compra creado exitosamente");
    } catch (error) {
      console.error("Error creando evento:", error);
      alert("Error al crear el evento");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedEvent?.id) return;
    
    setLoading(true);
    try {
      const updatedEvent: PurchaseEvent = {
        ...formData,
        id: selectedEvent.id,
        createdAt: selectedEvent.createdAt,
        updatedAt: new Date().toISOString(),
      };
      
      setEvents(prev => 
        prev.map(event => 
          event.id === selectedEvent.id ? updatedEvent : event
        )
      );
      
      resetForm();
      setSelectedEvent(null);
      setViewMode("list");
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Evento actualizado exitosamente");
    } catch (error) {
      console.error("Error actualizando evento:", error);
      alert("Error al actualizar el evento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    setLoading(true);
    try {
      setEvents(prev => prev.filter(event => event.id !== eventId));
      setDeleteModal({ isOpen: false, eventId: "", eventName: "" });
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      alert("Evento eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando evento:", error);
      alert("Error al eliminar el evento");
    } finally {
      setLoading(false);
    }
  };

  // Funciones de navegación
  const handleCreateNew = () => {
    resetForm();
    setSelectedEvent(null);
    setViewMode("create");
  };

  const handleEdit = (event: PurchaseEvent) => {
    setFormData({ ...event });
    setSelectedEvent(event);
    setViewMode("edit");
  };

  const handleView = (event: PurchaseEvent) => {
    setFormData({ ...event });
    setSelectedEvent(event);
    setViewMode("view");
  };

  const handleBackToList = () => {
    resetForm();
    setSelectedEvent(null);
    setViewMode("list");
    setCurrentPage(1); // Reset pagination when going back to list
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  // Funciones de filtrado
  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.bovineName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.sellerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.bovineId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === "all" || 
      event.paymentStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // Configuración de columnas para la tabla

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationChange("lat", latitude);
          handleLocationChange("lng", longitude);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          alert("No se pudo obtener la ubicación actual");
        }
      );
    } else {
      alert("Geolocalización no soportada por este navegador");
    }
  };

  // Renderizado principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <motion.div
        className="max-w-7xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="wait">
          {viewMode === "list" ? (
            // VISTA DE LISTA
            <motion.div
              key="list"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Eventos de Compra
                  </h1>
                  <p className="text-gray-600">
                    Gestiona los eventos de compra de ganado
                  </p>
                </div>
                <Button
                  onClick={handleCreateNew}
                  variant="primary"
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Nuevo Evento
                </Button>
              </div>

              {/* Filtros y búsqueda */}
              <Card className="mb-6">
                <CardContent>
                  <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-1">
                      <Input
                        placeholder="Buscar por animal, vendedor o ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        leftIcon={<Search className="h-4 w-4" />}
                      />
                    </div>
                    <div className="flex space-x-2">
                      <select
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">Todos los estados</option>
                        <option value="completed">Completado</option>
                        <option value="pending">Pendiente</option>
                        <option value="partial">Parcial</option>
                      </select>
                      <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
                        Exportar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tabla de eventos */}
              <Card>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Animal
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Vendedor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Precio
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Condición
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Estado Pago
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-12 text-center">
                              <div className="flex items-center justify-center">
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                  className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"
                                />
                                <span className="ml-2 text-gray-500">Cargando...</span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredEvents.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                              No se encontraron eventos de compra
                            </td>
                          </tr>
                        ) : (
                          filteredEvents
                            .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                            .map((event) => (
                              <tr key={event.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {event.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {event.bovineName || "Sin nombre"}
                                    </div>
                                    <div className="text-sm text-gray-500">{event.bovineId}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {event.sellerName}
                                    </div>
                                    <div className="text-sm text-gray-500">{event.sellerContact}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div>
                                    <div className="text-sm text-gray-900">
                                      {new Date(event.purchaseDate).toLocaleDateString()}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-semibold text-green-600">
                                    ${event.purchasePrice.toLocaleString()}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge
                                    className={
                                      event.condition === "excellent"
                                        ? "bg-green-100 text-green-800"
                                        : event.condition === "good"
                                        ? "bg-blue-100 text-blue-800"
                                        : event.condition === "fair"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-red-100 text-red-800"
                                    }
                                  >
                                    {event.condition === "excellent"
                                      ? "Excelente"
                                      : event.condition === "good"
                                      ? "Buena"
                                      : event.condition === "fair"
                                      ? "Regular"
                                      : "Pobre"}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <Badge
                                    className={
                                      event.paymentStatus === "completed"
                                        ? "bg-green-100 text-green-800"
                                        : event.paymentStatus === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-orange-100 text-orange-800"
                                    }
                                  >
                                    {event.paymentStatus === "completed"
                                      ? "Completado"
                                      : event.paymentStatus === "pending"
                                      ? "Pendiente"
                                      : "Parcial"}
                                  </Badge>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end space-x-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleView(event)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleEdit(event)}
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() =>
                                        setDeleteModal({
                                          isOpen: true,
                                          eventId: event.id!,
                                          eventName: event.bovineName || event.bovineId,
                                        })
                                      }
                                    >
                                      <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginación simple */}
                  {filteredEvents.length > 0 && (
                    <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
                      <div className="flex items-center text-sm text-gray-700">
                        <span>
                          Mostrando {((currentPage - 1) * pageSize) + 1} a{" "}
                          {Math.min(currentPage * pageSize, filteredEvents.length)} de{" "}
                          {filteredEvents.length} resultados
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </Button>
                        <span className="text-sm text-gray-700">
                          Página {currentPage} de {Math.ceil(filteredEvents.length / pageSize)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentPage(prev => 
                            Math.min(Math.ceil(filteredEvents.length / pageSize), prev + 1)
                          )}
                          disabled={currentPage >= Math.ceil(filteredEvents.length / pageSize)}
                        >
                          Siguiente
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            // VISTA DE FORMULARIO
            <motion.div
              key="form"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              {/* Header del formulario */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <Button variant="outline" size="icon" onClick={handleBackToList}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {viewMode === "create" && "Nuevo Evento de Compra"}
                      {viewMode === "edit" && "Editar Evento de Compra"}
                      {viewMode === "view" && "Ver Evento de Compra"}
                    </h1>
                    <p className="text-gray-600">
                      {viewMode === "create" && "Registra un nuevo evento de compra de ganado"}
                      {viewMode === "edit" && "Modifica los datos del evento de compra"}
                      {viewMode === "view" && "Información detallada del evento de compra"}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleBackToList}>
                    Cancelar
                  </Button>
                  {viewMode !== "view" && (
                    <Button
                      onClick={viewMode === "create" ? handleCreate : handleUpdate}
                      disabled={loading}
                      variant="success"
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
                      {loading ? "Guardando..." : viewMode === "create" ? "Crear Evento" : "Actualizar Evento"}
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna izquierda - Información básica */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Información del Animal */}
                  <Card>
                    <CardHeader icon={<ShoppingCart className="h-5 w-5 text-green-600" />}>
                      <div>
                        <CardTitle>Información del Animal</CardTitle>
                        <CardDescription>
                          Datos del bovino que se está comprando
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="ID del Animal"
                            placeholder="Ingresa el ID del animal"
                            value={formData.bovineId}
                            onChange={(e) => handleInputChange("bovineId", e.target.value)}
                            required
                            readOnly={viewMode === "view"}
                          />
                          <Input
                            label="Nombre del Animal"
                            placeholder="Nombre del animal (opcional)"
                            value={formData.bovineName || ""}
                            onChange={(e) => handleInputChange("bovineName", e.target.value)}
                            readOnly={viewMode === "view"}
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Peso (kg)"
                            type="number"
                            placeholder="Peso del animal"
                            value={formData.weight.toString()}
                            onChange={(e) => handleInputChange("weight", parseFloat(e.target.value) || 0)}
                            required
                            readOnly={viewMode === "view"}
                          />
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Condición del Animal <span className="text-red-500">*</span>
                            </label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              value={formData.condition}
                              onChange={(e) => handleInputChange("condition", e.target.value)}
                              required
                              disabled={viewMode === "view"}
                            >
                              <option value="">Selecciona la condición</option>
                              <option value="excellent">Excelente</option>
                              <option value="good">Buena</option>
                              <option value="fair">Regular</option>
                              <option value="poor">Pobre</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información del Vendedor */}
                  <Card>
                    <CardHeader icon={<User className="h-5 w-5 text-blue-600" />}>
                      <div>
                        <CardTitle>Información del Vendedor</CardTitle>
                        <CardDescription>
                          Datos de contacto del vendedor
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="ID del Vendedor"
                            placeholder="ID o RFC del vendedor"
                            value={formData.sellerId}
                            onChange={(e) => handleInputChange("sellerId", e.target.value)}
                            required
                            readOnly={viewMode === "view"}
                          />
                          <Input
                            label="Nombre del Vendedor"
                            placeholder="Nombre completo"
                            value={formData.sellerName}
                            onChange={(e) => handleInputChange("sellerName", e.target.value)}
                            required
                            readOnly={viewMode === "view"}
                          />
                        </div>
                        <Input
                          label="Contacto del Vendedor"
                          placeholder="Teléfono o email"
                          value={formData.sellerContact}
                          onChange={(e) => handleInputChange("sellerContact", e.target.value)}
                          description="Número de teléfono o correo electrónico"
                          readOnly={viewMode === "view"}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Detalles de la Compra */}
                  <Card>
                    <CardHeader icon={<DollarSign className="h-5 w-5 text-purple-600" />}>
                      <div>
                        <CardTitle>Detalles de la Compra</CardTitle>
                        <CardDescription>
                          Información financiera y de pago
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <Input
                            label="Precio de Compra"
                            type="number"
                            placeholder="$0.00"
                            value={formData.purchasePrice.toString()}
                            onChange={(e) => handleInputChange("purchasePrice", parseFloat(e.target.value) || 0)}
                            leftIcon={<DollarSign className="h-4 w-4" />}
                            required
                            readOnly={viewMode === "view"}
                          />
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700">
                              Método de Pago
                            </label>
                            <select
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              value={formData.paymentMethod}
                              onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                              disabled={viewMode === "view"}
                            >
                              <option value="">Selecciona método</option>
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
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                              value={formData.paymentStatus}
                              onChange={(e) => handleInputChange("paymentStatus", e.target.value)}
                              disabled={viewMode === "view"}
                            >
                              <option value="pending">Pendiente</option>
                              <option value="partial">Parcial</option>
                              <option value="completed">Completado</option>
                            </select>
                          </div>
                        </div>

                        <Input
                          label="Fecha de Compra"
                          type="date"
                          value={formData.purchaseDate}
                          onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                          rightIcon={<CalendarIcon className="h-4 w-4" />}
                          required
                          readOnly={viewMode === "view"}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notas Adicionales */}
                  <Card>
                    <CardHeader icon={<FileText className="h-5 w-5 text-orange-600" />}>
                      <CardTitle>Notas Adicionales</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-vertical bg-white"
                        placeholder="Observaciones, condiciones especiales, etc."
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        readOnly={viewMode === "view"}
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Columna derecha - Ubicación y Transporte */}
                <div className="space-y-6">
                  {/* Ubicación */}
                  <Card>
                    <CardHeader icon={<MapPin className="h-5 w-5 text-red-600" />}>
                      <div>
                        <CardTitle>Ubicación de Compra</CardTitle>
                        <CardDescription>
                          Lugar donde se realizó la compra
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Input
                          label="Dirección"
                          placeholder="Dirección del lugar"
                          value={formData.location.address}
                          onChange={(e) => handleLocationChange("address", e.target.value)}
                          readOnly={viewMode === "view"}
                        />

                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            label="Latitud"
                            type="number"
                            step="any"
                            size="sm"
                            value={formData.location.lat.toString()}
                            onChange={(e) => handleLocationChange("lat", parseFloat(e.target.value))}
                            readOnly={viewMode === "view"}
                          />
                          <Input
                            label="Longitud"
                            type="number"
                            step="any"
                            size="sm"
                            value={formData.location.lng.toString()}
                            onChange={(e) => handleLocationChange("lng", parseFloat(e.target.value))}
                            readOnly={viewMode === "view"}
                          />
                        </div>

                        {viewMode !== "view" && (
                          <Button
                            onClick={getCurrentLocation}
                            variant="primary"
                            fullWidth
                            leftIcon={<MapPin className="h-4 w-4" />}
                          >
                            Obtener Mi Ubicación
                          </Button>
                        )}

                        {/* Mapa simple */}
                        <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center border">
                          <div className="text-center text-gray-500">
                            <MapPin className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">Mapa Interactivo</p>
                            <p className="text-xs">
                              Lat: {formData.location.lat.toFixed(4)}
                            </p>
                            <p className="text-xs">
                              Lng: {formData.location.lng.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Transporte */}
                  <Card>
                    <CardHeader icon={<Truck className="h-5 w-5 text-indigo-600" />}>
                      <CardTitle>Información de Transporte</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Método de Transporte
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            value={formData.transportMethod}
                            onChange={(e) => handleInputChange("transportMethod", e.target.value)}
                            disabled={viewMode === "view"}
                          >
                            <option value="">Selecciona método</option>
                            <option value="own_truck">Camión Propio</option>
                            <option value="hired_transport">Transporte Contratado</option>
                            <option value="seller_delivery">Entrega del Vendedor</option>
                            <option value="walking">A pie</option>
                          </select>
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="veterinaryCheckup"
                            checked={formData.veterinaryCheckup}
                            onChange={(e) => handleInputChange("veterinaryCheckup", e.target.checked)}
                            className="rounded border-gray-300"
                            disabled={viewMode === "view"}
                          />
                          <label
                            htmlFor="veterinaryCheckup"
                            className="text-sm text-gray-700"
                          >
                            Chequeo veterinario realizado
                          </label>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Documentos */}
                  <Card>
                    <CardHeader icon={<Camera className="h-5 w-5 text-teal-600" />}>
                      <CardTitle>Documentos</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {viewMode !== "view" ? (
                        <Button
                          variant="info"
                          fullWidth
                          leftIcon={<Plus className="h-4 w-4" />}
                        >
                          Agregar Documento
                        </Button>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {formData.documents.length === 0 
                            ? "No hay documentos adjuntos"
                            : `${formData.documents.length} documento(s) adjunto(s)`
                          }
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de confirmación de eliminación */}
        <Modal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ isOpen: false, eventId: "", eventName: "" })}
          size="default"
        >
          <ModalHeader
            onClose={() => setDeleteModal({ isOpen: false, eventId: "", eventName: "" })}
          >
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Eliminar Evento de Compra
                </h3>
                <p className="text-sm text-gray-500">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody>
            <p className="text-gray-700">
              ¿Estás seguro de que deseas eliminar el evento de compra del animal{" "}
              <span className="font-semibold">"{deleteModal.eventName}"</span>? 
              Toda la información asociada se perderá permanentemente.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ isOpen: false, eventId: "", eventName: "" })}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deleteModal.eventId)}
              disabled={loading}
              leftIcon={loading ? undefined : <Trash2 className="h-4 w-4" />}
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </Button>
          </ModalFooter>
        </Modal>
      </motion.div>
    </div>
  );
};

export default EventPurchase;