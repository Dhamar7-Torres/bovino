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
  ShoppingBag,
  DollarSign,
  UserCheck,
  Calendar as CalendarIcon,
  Camera,
  FileText,
  Truck,
  ArrowLeft,
  Save,
  Plus,
  TrendingUp,
  Award,
  FileCheck,
} from "lucide-react";

// Interfaz para el evento de venta
interface SalesEvent {
  id?: string;
  bovineId: string;
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
  paymentStatus: string;
  commission: number;
  deliveryDate: string;
  contractType: string;
}

const EventSales: React.FC = () => {
  // Estados para el formulario
  const [salesEvent, setSalesEvent] = useState<SalesEvent>({
    bovineId: "",
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
    deliveryMethod: "",
    healthCertificate: false,
    qualityGrade: "",
    documents: [],
    notes: "",
    paymentMethod: "",
    paymentStatus: "pending",
    commission: 0,
    deliveryDate: "",
    contractType: "direct",
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
    setSalesEvent((prev) => {
      const updated = { ...prev, [field]: value };

      // Calcular precio por kg automáticamente
      if (field === "salePrice" || field === "weight") {
        if (updated.weight > 0 && updated.salePrice > 0) {
          updated.pricePerKg = updated.salePrice / updated.weight;
        }
      }

      return updated;
    });
  };

  // Función para manejar cambios en la ubicación
  const handleLocationChange = (field: string, value: any) => {
    setSalesEvent((prev) => ({
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
          setSalesEvent((prev) => ({
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
      console.log("Guardando evento de venta:", salesEvent);

      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mostrar notificación de éxito
      alert("Evento de venta registrado exitosamente");

      // Resetear formulario
      setSalesEvent({
        bovineId: "",
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
        deliveryMethod: "",
        healthCertificate: false,
        qualityGrade: "",
        documents: [],
        notes: "",
        paymentMethod: "",
        paymentStatus: "pending",
        commission: 0,
        deliveryDate: "",
        contractType: "direct",
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
                Registro de Venta
              </h1>
              <p className="text-gray-600">
                Registra un nuevo evento de venta de ganado
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
              {loading ? "Guardando..." : "Guardar Venta"}
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
                icon={<ShoppingBag className="h-5 w-5 text-green-600" />}
              >
                <div>
                  <CardTitle>Información del Animal</CardTitle>
                  <CardDescription>
                    Datos del bovino que se está vendiendo
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="ID del Animal"
                      placeholder="Ingresa el ID del animal"
                      value={salesEvent.bovineId}
                      onChange={(e) =>
                        handleInputChange("bovineId", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Peso (kg)"
                      type="number"
                      placeholder="Peso del animal"
                      value={salesEvent.weight.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "weight",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      required
                    />
                    <Input
                      label="Precio por Kg"
                      type="number"
                      step="0.01"
                      placeholder="$0.00"
                      value={salesEvent.pricePerKg.toFixed(2)}
                      readOnly
                      leftIcon={<DollarSign className="h-4 w-4" />}
                      description="Calculado automáticamente"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Grado de Calidad <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={salesEvent.qualityGrade}
                      onChange={(e) =>
                        handleInputChange("qualityGrade", e.target.value)
                      }
                      required
                    >
                      <option value="">Selecciona el grado</option>
                      <option value="premium">Premium (AAA)</option>
                      <option value="choice">Selecta (AA)</option>
                      <option value="good">Buena (A)</option>
                      <option value="standard">Estándar (B)</option>
                      <option value="commercial">Comercial (C)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del Comprador */}
            <Card>
              <CardHeader
                icon={<UserCheck className="h-5 w-5 text-blue-600" />}
              >
                <div>
                  <CardTitle>Información del Comprador</CardTitle>
                  <CardDescription>
                    Datos de contacto del comprador
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="ID del Comprador"
                      placeholder="ID o RFC del comprador"
                      value={salesEvent.buyerId}
                      onChange={(e) =>
                        handleInputChange("buyerId", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Nombre del Comprador"
                      placeholder="Nombre completo o empresa"
                      value={salesEvent.buyerName}
                      onChange={(e) =>
                        handleInputChange("buyerName", e.target.value)
                      }
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Contacto del Comprador"
                      placeholder="Teléfono o email"
                      value={salesEvent.buyerContact}
                      onChange={(e) =>
                        handleInputChange("buyerContact", e.target.value)
                      }
                      description="Número de teléfono o correo electrónico"
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Contrato
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={salesEvent.contractType}
                        onChange={(e) =>
                          handleInputChange("contractType", e.target.value)
                        }
                      >
                        <option value="direct">Venta Directa</option>
                        <option value="auction">Subasta</option>
                        <option value="contract">Contrato a Futuro</option>
                        <option value="consignment">Consignación</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalles de la Venta */}
            <Card>
              <CardHeader
                icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
              >
                <div>
                  <CardTitle>Detalles de la Venta</CardTitle>
                  <CardDescription>
                    Información financiera y comercial
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Precio Total de Venta"
                      type="number"
                      step="0.01"
                      placeholder="$0.00"
                      value={salesEvent.salePrice.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "salePrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      leftIcon={<DollarSign className="h-4 w-4" />}
                      required
                    />
                    <Input
                      label="Comisión (%)"
                      type="number"
                      step="0.1"
                      placeholder="0.0"
                      value={salesEvent.commission.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "commission",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      description="Porcentaje de comisión"
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Método de Pago
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={salesEvent.paymentMethod}
                        onChange={(e) =>
                          handleInputChange("paymentMethod", e.target.value)
                        }
                      >
                        <option value="">Selecciona método</option>
                        <option value="cash">Efectivo</option>
                        <option value="transfer">Transferencia Bancaria</option>
                        <option value="check">Cheque</option>
                        <option value="credit">Crédito</option>
                        <option value="installments">Pagos a Plazos</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Fecha de Venta"
                      type="date"
                      value={salesEvent.saleDate}
                      onChange={(e) =>
                        handleInputChange("saleDate", e.target.value)
                      }
                      rightIcon={<CalendarIcon className="h-4 w-4" />}
                      required
                    />
                    <Input
                      label="Fecha de Entrega"
                      type="date"
                      value={salesEvent.deliveryDate}
                      onChange={(e) =>
                        handleInputChange("deliveryDate", e.target.value)
                      }
                      rightIcon={<CalendarIcon className="h-4 w-4" />}
                      description="Fecha programada para entrega"
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Estado del Pago
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        value={salesEvent.paymentStatus}
                        onChange={(e) =>
                          handleInputChange("paymentStatus", e.target.value)
                        }
                      >
                        <option value="pending">Pendiente</option>
                        <option value="partial">Parcial</option>
                        <option value="completed">Completado</option>
                        <option value="overdue">Vencido</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumen Financiero */}
            <Card variant="gradient">
              <CardHeader icon={<Award className="h-5 w-5 text-indigo-600" />}>
                <CardTitle>Resumen Financiero</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Precio Total</p>
                    <p className="text-lg font-bold text-green-600">
                      ${salesEvent.salePrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Comisión</p>
                    <p className="text-lg font-bold text-orange-600">
                      $
                      {(
                        (salesEvent.salePrice * salesEvent.commission) /
                        100
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">Neto</p>
                    <p className="text-lg font-bold text-blue-600">
                      $
                      {(
                        salesEvent.salePrice -
                        (salesEvent.salePrice * salesEvent.commission) / 100
                      ).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600">$/Kg</p>
                    <p className="text-lg font-bold text-purple-600">
                      ${salesEvent.pricePerKg.toFixed(2)}
                    </p>
                  </div>
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
                  placeholder="Condiciones especiales, términos del contrato, observaciones, etc."
                  value={salesEvent.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Columna derecha - Ubicación y Entrega */}
          <motion.div className="space-y-6" variants={itemVariants}>
            {/* Ubicación */}
            <Card>
              <CardHeader icon={<MapPin className="h-5 w-5 text-red-600" />}>
                <div>
                  <CardTitle>Ubicación de Venta</CardTitle>
                  <CardDescription>
                    Lugar donde se realizó la venta
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Dirección"
                    placeholder="Dirección del lugar"
                    value={salesEvent.location.address}
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
                      value={salesEvent.location.lat.toString()}
                      onChange={(e) =>
                        handleLocationChange("lat", parseFloat(e.target.value))
                      }
                    />
                    <Input
                      label="Longitud"
                      type="number"
                      step="any"
                      size="sm"
                      value={salesEvent.location.lng.toString()}
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

                  {/* Mapa simple */}
                  <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center border">
                    <div className="text-center text-gray-500">
                      <MapPin className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Mapa de Ubicación</p>
                      <p className="text-xs">
                        Lat: {salesEvent.location.lat.toFixed(4)}
                      </p>
                      <p className="text-xs">
                        Lng: {salesEvent.location.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Entrega y Transporte */}
            <Card>
              <CardHeader icon={<Truck className="h-5 w-5 text-indigo-600" />}>
                <CardTitle>Información de Entrega</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Método de Entrega
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                      value={salesEvent.deliveryMethod}
                      onChange={(e) =>
                        handleInputChange("deliveryMethod", e.target.value)
                      }
                    >
                      <option value="">Selecciona método</option>
                      <option value="pickup">Retiro en Rancho</option>
                      <option value="delivery">Entrega a Domicilio</option>
                      <option value="market">Entrega en Mercado</option>
                      <option value="processing_plant">
                        Planta Procesadora
                      </option>
                      <option value="auction_house">Casa de Subastas</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="healthCertificate"
                      checked={salesEvent.healthCertificate}
                      onChange={(e) =>
                        handleInputChange("healthCertificate", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <label
                      htmlFor="healthCertificate"
                      className="text-sm text-gray-700"
                    >
                      Certificado sanitario incluido
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Documentos */}
            <Card>
              <CardHeader
                icon={<FileCheck className="h-5 w-5 text-teal-600" />}
              >
                <CardTitle>Documentos de Venta</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant="info"
                    fullWidth
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Contrato de Venta
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<Camera className="h-4 w-4" />}
                  >
                    Certificado Sanitario
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<FileText className="h-4 w-4" />}
                  >
                    Factura/Recibo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estado de la Venta */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-center">
                  Estado de la Venta
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-2">
                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      salesEvent.paymentStatus === "completed"
                        ? "bg-green-100 text-green-800"
                        : salesEvent.paymentStatus === "partial"
                        ? "bg-yellow-100 text-yellow-800"
                        : salesEvent.paymentStatus === "overdue"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {salesEvent.paymentStatus === "completed" &&
                      "Pagado Completo"}
                    {salesEvent.paymentStatus === "partial" && "Pago Parcial"}
                    {salesEvent.paymentStatus === "pending" && "Pago Pendiente"}
                    {salesEvent.paymentStatus === "overdue" && "Pago Vencido"}
                  </div>
                  <p className="text-xs text-gray-600">
                    {salesEvent.healthCertificate
                      ? "Con Certificado Sanitario"
                      : "Sin Certificado Sanitario"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventSales;
