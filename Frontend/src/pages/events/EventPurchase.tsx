import React, { useState } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

// Interfaz para el evento de compra
interface PurchaseEvent {
  id?: string;
  bovineId: string;
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
}

const EventPurchase: React.FC = () => {
  // Estados para el formulario
  const [purchaseEvent, setPurchaseEvent] = useState<PurchaseEvent>({
    bovineId: "",
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
  });

  const [loading, setLoading] = useState(false);

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

  // Función para manejar cambios en el formulario
  const handleInputChange = (field: string, value: any) => {
    setPurchaseEvent((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Función para manejar cambios en la ubicación
  const handleLocationChange = (field: string, value: any) => {
    setPurchaseEvent((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  // Función para obtener dirección actual
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setPurchaseEvent((prev) => ({
            ...prev,
            location: {
              ...prev.location,
              lat: latitude,
              lng: longitude,
            },
          }));
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

  // Función para guardar el evento
  const handleSaveEvent = async () => {
    setLoading(true);
    try {
      // Aquí iría la lógica para guardar en el backend
      console.log("Guardando evento de compra:", purchaseEvent);

      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mostrar notificación de éxito
      alert("Evento de compra registrado exitosamente");

      // Resetear formulario
      setPurchaseEvent({
        bovineId: "",
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
      });
    } catch (error) {
      console.error("Error guardando evento:", error);
      alert("Error al guardar el evento");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
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
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Registro de Compra
              </h1>
              <p className="text-gray-600">
                Registra un nuevo evento de compra de ganado
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">Cancelar</Button>
            <Button
              onClick={handleSaveEvent}
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
              {loading ? "Guardando..." : "Guardar Evento"}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Información básica */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            variants={itemVariants}
          >
            {/* Información del Animal */}
            <Card>
              <CardHeader
                icon={<ShoppingCart className="h-5 w-5 text-green-600" />}
              >
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
                      value={purchaseEvent.bovineId}
                      onChange={(e) =>
                        handleInputChange("bovineId", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Peso (kg)"
                      type="number"
                      placeholder="Peso del animal"
                      value={purchaseEvent.weight.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "weight",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Condición del Animal{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={purchaseEvent.condition}
                      onChange={(e) =>
                        handleInputChange("condition", e.target.value)
                      }
                      required
                    >
                      <option value="">Selecciona la condición</option>
                      <option value="excellent">Excelente</option>
                      <option value="good">Buena</option>
                      <option value="fair">Regular</option>
                      <option value="poor">Pobre</option>
                    </select>
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
                      value={purchaseEvent.sellerId}
                      onChange={(e) =>
                        handleInputChange("sellerId", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Nombre del Vendedor"
                      placeholder="Nombre completo"
                      value={purchaseEvent.sellerName}
                      onChange={(e) =>
                        handleInputChange("sellerName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <Input
                    label="Contacto del Vendedor"
                    placeholder="Teléfono o email"
                    value={purchaseEvent.sellerContact}
                    onChange={(e) =>
                      handleInputChange("sellerContact", e.target.value)
                    }
                    description="Número de teléfono o correo electrónico"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Detalles de la Compra */}
            <Card>
              <CardHeader
                icon={<DollarSign className="h-5 w-5 text-purple-600" />}
              >
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
                      value={purchaseEvent.purchasePrice.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "purchasePrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      leftIcon={<DollarSign className="h-4 w-4" />}
                      required
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Método de Pago
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={purchaseEvent.paymentMethod}
                        onChange={(e) =>
                          handleInputChange("paymentMethod", e.target.value)
                        }
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
                        value={purchaseEvent.paymentStatus}
                        onChange={(e) =>
                          handleInputChange("paymentStatus", e.target.value)
                        }
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
                    value={purchaseEvent.purchaseDate}
                    onChange={(e) =>
                      handleInputChange("purchaseDate", e.target.value)
                    }
                    rightIcon={<CalendarIcon className="h-4 w-4" />}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notas Adicionales */}
            <Card>
              <CardHeader
                icon={<FileText className="h-5 w-5 text-orange-600" />}
              >
                <CardTitle>Notas Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-vertical bg-white"
                  placeholder="Observaciones, condiciones especiales, etc."
                  value={purchaseEvent.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Columna derecha - Ubicación y Transporte */}
          <motion.div className="space-y-6" variants={itemVariants}>
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
                    value={purchaseEvent.location.address}
                    onChange={(e) =>
                      handleLocationChange("address", e.target.value)
                    }
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Latitud"
                      type="number"
                      step="any"
                      size="sm"
                      value={purchaseEvent.location.lat.toString()}
                      onChange={(e) =>
                        handleLocationChange("lat", parseFloat(e.target.value))
                      }
                    />
                    <Input
                      label="Longitud"
                      type="number"
                      step="any"
                      size="sm"
                      value={purchaseEvent.location.lng.toString()}
                      onChange={(e) =>
                        handleLocationChange("lng", parseFloat(e.target.value))
                      }
                    />
                  </div>

                  <Button
                    onClick={getCurrentLocation}
                    variant="primary"
                    fullWidth
                    leftIcon={<MapPin className="h-4 w-4" />}
                  >
                    Obtener Mi Ubicación
                  </Button>

                  {/* Mapa simple con iframe */}
                  <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center border">
                    <div className="text-center text-gray-500">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Mapa Interactivo</p>
                      <p className="text-xs">
                        Lat: {purchaseEvent.location.lat.toFixed(4)}
                      </p>
                      <p className="text-xs">
                        Lng: {purchaseEvent.location.lng.toFixed(4)}
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
                      value={purchaseEvent.transportMethod}
                      onChange={(e) =>
                        handleInputChange("transportMethod", e.target.value)
                      }
                    >
                      <option value="">Selecciona método</option>
                      <option value="own_truck">Camión Propio</option>
                      <option value="hired_transport">
                        Transporte Contratado
                      </option>
                      <option value="seller_delivery">
                        Entrega del Vendedor
                      </option>
                      <option value="walking">A pie</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="veterinaryCheckup"
                      checked={purchaseEvent.veterinaryCheckup}
                      onChange={(e) =>
                        handleInputChange("veterinaryCheckup", e.target.checked)
                      }
                      className="rounded border-gray-300"
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
                <Button
                  variant="info"
                  fullWidth
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Agregar Documento
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventPurchase;
