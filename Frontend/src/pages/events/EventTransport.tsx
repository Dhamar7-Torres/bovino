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
  Truck,
  DollarSign,
  User,
  Calendar as CalendarIcon,
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
} from "lucide-react";

// Interfaz para el evento de transporte
interface TransportEvent {
  id?: string;
  bovineIds: string[];
  driverId: string;
  driverName: string;
  driverLicense: string;
  vehicleId: string;
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
  estimatedDuration: number; // en horas
  actualDuration: number; // en horas
  distance: number; // en km
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
  status: string;
  documents: string[];
}

const EventTransport: React.FC = () => {
  // Estados para el formulario
  const [transportEvent, setTransportEvent] = useState<TransportEvent>({
    bovineIds: [""],
    driverId: "",
    driverName: "",
    driverLicense: "",
    vehicleId: "",
    vehicleType: "",
    vehiclePlate: "",
    originLocation: {
      lat: 17.9995,
      lng: -92.9476,
      address: "Villahermosa, Tabasco, México",
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
    documents: [],
  });

  const [loading, setLoading] = useState(false);
  const [showRoute, setShowRoute] = useState(false);

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
    setTransportEvent((prev) => {
      const updated = { ...prev, [field]: value };

      // Calcular costo total automáticamente
      if (
        ["transportCost", "fuelCost", "tollCost", "driverPayment"].includes(
          field
        )
      ) {
        // Los cálculos se pueden hacer aquí
      }

      return updated;
    });
  };

  // Función para manejar cambios en ubicaciones
  const handleLocationChange = (
    locationType: "originLocation" | "destinationLocation",
    field: string,
    value: any
  ) => {
    setTransportEvent((prev) => ({
      ...prev,
      [locationType]: {
        ...prev[locationType],
        [field]: value,
      },
    }));
  };

  // Función para agregar/quitar IDs de animales
  const handleBovineIdsChange = (index: number, value: string) => {
    setTransportEvent((prev) => {
      const newIds = [...prev.bovineIds];
      newIds[index] = value;
      return { ...prev, bovineIds: newIds };
    });
  };

  const addBovineId = () => {
    setTransportEvent((prev) => ({
      ...prev,
      bovineIds: [...prev.bovineIds, ""],
    }));
  };

  const removeBovineId = (index: number) => {
    setTransportEvent((prev) => ({
      ...prev,
      bovineIds: prev.bovineIds.filter((_, i) => i !== index),
    }));
  };

  // Función para agregar/quitar contactos de emergencia
  const handleEmergencyContactChange = (index: number, value: string) => {
    setTransportEvent((prev) => {
      const newContacts = [...prev.emergencyContacts];
      newContacts[index] = value;
      return { ...prev, emergencyContacts: newContacts };
    });
  };

  const addEmergencyContact = () => {
    setTransportEvent((prev) => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, ""],
    }));
  };

  // Función para calcular distancia estimada (simulada)
  const calculateDistance = () => {
    const lat1 = transportEvent.originLocation.lat;
    const lng1 = transportEvent.originLocation.lng;
    const lat2 = transportEvent.destinationLocation.lat;
    const lng2 = transportEvent.destinationLocation.lng;

    // Fórmula simple de distancia (aproximada)
    const distance =
      Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)) * 111; // aprox km

    setTransportEvent((prev) => ({
      ...prev,
      distance: Math.round(distance),
      estimatedDuration: Math.round(distance / 60), // asumiendo 60 km/h promedio
    }));
  };

  // Función para obtener ubicación actual
  const getCurrentLocation = (
    locationType: "originLocation" | "destinationLocation"
  ) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          handleLocationChange(locationType, "lat", latitude);
          handleLocationChange(locationType, "lng", longitude);
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          alert("No se pudo obtener la ubicación actual");
        }
      );
    }
  };

  // Función para guardar el evento
  const handleSaveEvent = async () => {
    setLoading(true);
    try {
      // Aquí iría la lógica para guardar en el backend
      console.log("Guardando evento de transporte:", transportEvent);

      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("Evento de transporte registrado exitosamente");
    } catch (error) {
      console.error("Error guardando evento:", error);
      alert("Error al guardar el evento");
    } finally {
      setLoading(false);
    }
  };

  // Calcular costo total
  const totalCost =
    transportEvent.transportCost +
    transportEvent.fuelCost +
    transportEvent.tollCost +
    transportEvent.driverPayment;

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
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Registro de Transporte
              </h1>
              <p className="text-gray-600">
                Registra un nuevo evento de transporte de ganado
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
              {loading ? "Guardando..." : "Guardar Transporte"}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Información básica */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            variants={itemVariants}
          >
            {/* Información de los Animales */}
            <Card>
              <CardHeader icon={<Truck className="h-5 w-5 text-green-600" />}>
                <div>
                  <CardTitle>Animales a Transportar</CardTitle>
                  <CardDescription>
                    IDs de los bovinos que serán transportados
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transportEvent.bovineIds.map((id, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder={`ID del Animal ${index + 1}`}
                        value={id}
                        onChange={(e) =>
                          handleBovineIdsChange(index, e.target.value)
                        }
                        className="flex-1"
                      />
                      {transportEvent.bovineIds.length > 1 && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeBovineId(index)}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    onClick={addBovineId}
                    leftIcon={<Plus className="h-4 w-4" />}
                    fullWidth
                  >
                    Agregar Animal
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Información del Conductor y Vehículo */}
            <Card>
              <CardHeader icon={<User className="h-5 w-5 text-blue-600" />}>
                <div>
                  <CardTitle>Conductor y Vehículo</CardTitle>
                  <CardDescription>
                    Información del transporte y conductor
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="ID del Conductor"
                      placeholder="ID del conductor"
                      value={transportEvent.driverId}
                      onChange={(e) =>
                        handleInputChange("driverId", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Nombre del Conductor"
                      placeholder="Nombre completo"
                      value={transportEvent.driverName}
                      onChange={(e) =>
                        handleInputChange("driverName", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Licencia de Conducir"
                      placeholder="Número de licencia"
                      value={transportEvent.driverLicense}
                      onChange={(e) =>
                        handleInputChange("driverLicense", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="ID del Vehículo"
                      placeholder="ID interno"
                      value={transportEvent.vehicleId}
                      onChange={(e) =>
                        handleInputChange("vehicleId", e.target.value)
                      }
                    />
                    <Input
                      label="Placas del Vehículo"
                      placeholder="Número de placas"
                      value={transportEvent.vehiclePlate}
                      onChange={(e) =>
                        handleInputChange("vehiclePlate", e.target.value)
                      }
                      required
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Vehículo <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={transportEvent.vehicleType}
                        onChange={(e) =>
                          handleInputChange("vehicleType", e.target.value)
                        }
                        required
                      >
                        <option value="">Selecciona tipo</option>
                        <option value="cattle_truck">Camión Ganadero</option>
                        <option value="trailer">Tráiler Ganadero</option>
                        <option value="pickup_truck">Camioneta</option>
                        <option value="cattle_car">Carro de Ganado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalles del Viaje */}
            <Card>
              <CardHeader icon={<Route className="h-5 w-5 text-purple-600" />}>
                <div>
                  <CardTitle>Detalles del Viaje</CardTitle>
                  <CardDescription>
                    Fechas, horarios y duración del transporte
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Fecha de Salida"
                      type="date"
                      value={transportEvent.departureDate}
                      onChange={(e) =>
                        handleInputChange("departureDate", e.target.value)
                      }
                      rightIcon={<CalendarIcon className="h-4 w-4" />}
                      required
                    />
                    <Input
                      label="Fecha de Llegada Estimada"
                      type="date"
                      value={transportEvent.arrivalDate}
                      onChange={(e) =>
                        handleInputChange("arrivalDate", e.target.value)
                      }
                      rightIcon={<CalendarIcon className="h-4 w-4" />}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Distancia (km)"
                      type="number"
                      placeholder="0"
                      value={transportEvent.distance.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "distance",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      description="Distancia total del recorrido"
                    />
                    <Input
                      label="Duración Estimada (horas)"
                      type="number"
                      step="0.5"
                      placeholder="0"
                      value={transportEvent.estimatedDuration.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "estimatedDuration",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      leftIcon={<Clock className="h-4 w-4" />}
                    />
                    <Input
                      label="Duración Real (horas)"
                      type="number"
                      step="0.5"
                      placeholder="0"
                      value={transportEvent.actualDuration.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "actualDuration",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      leftIcon={<Clock className="h-4 w-4" />}
                      description="Llenar al completar viaje"
                    />
                  </div>

                  <Button
                    onClick={calculateDistance}
                    variant="outline"
                    leftIcon={<Navigation className="h-4 w-4" />}
                  >
                    Calcular Distancia y Tiempo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Costos del Transporte */}
            <Card>
              <CardHeader
                icon={<DollarSign className="h-5 w-5 text-green-600" />}
              >
                <div>
                  <CardTitle>Costos del Transporte</CardTitle>
                  <CardDescription>
                    Desglose de gastos del viaje
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Costo Base de Transporte"
                      type="number"
                      step="0.01"
                      placeholder="$0.00"
                      value={transportEvent.transportCost.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "transportCost",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      leftIcon={<DollarSign className="h-4 w-4" />}
                    />
                    <Input
                      label="Costo de Combustible"
                      type="number"
                      step="0.01"
                      placeholder="$0.00"
                      value={transportEvent.fuelCost.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "fuelCost",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      leftIcon={<DollarSign className="h-4 w-4" />}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Costo de Casetas"
                      type="number"
                      step="0.01"
                      placeholder="$0.00"
                      value={transportEvent.tollCost.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "tollCost",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      leftIcon={<DollarSign className="h-4 w-4" />}
                    />
                    <Input
                      label="Pago al Conductor"
                      type="number"
                      step="0.01"
                      placeholder="$0.00"
                      value={transportEvent.driverPayment.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "driverPayment",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      leftIcon={<DollarSign className="h-4 w-4" />}
                    />
                  </div>

                  {/* Resumen de costos */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">
                        Costo Total:
                      </span>
                      <span className="text-xl font-bold text-green-600">
                        ${totalCost.toLocaleString()}
                      </span>
                    </div>
                    {transportEvent.distance > 0 && (
                      <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                        <span>Costo por Km:</span>
                        <span>
                          ${(totalCost / transportEvent.distance).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Condiciones y Estado */}
            <Card>
              <CardHeader
                icon={<Thermometer className="h-5 w-5 text-orange-600" />}
              >
                <div>
                  <CardTitle>Condiciones del Viaje</CardTitle>
                  <CardDescription>
                    Condiciones ambientales y estado de los animales
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Temperatura (°C)"
                      type="number"
                      placeholder="25"
                      value={transportEvent.temperature.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "temperature",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      leftIcon={<Thermometer className="h-4 w-4" />}
                    />
                    <Input
                      label="Humedad (%)"
                      type="number"
                      placeholder="60"
                      value={transportEvent.humidity.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "humidity",
                          parseFloat(e.target.value) || 0
                        )
                      }
                    />
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Condiciones Climáticas
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={transportEvent.weatherConditions}
                        onChange={(e) =>
                          handleInputChange("weatherConditions", e.target.value)
                        }
                      >
                        <option value="">Selecciona condición</option>
                        <option value="sunny">Soleado</option>
                        <option value="cloudy">Nublado</option>
                        <option value="rainy">Lluvioso</option>
                        <option value="stormy">Tormentoso</option>
                        <option value="foggy">Neblina</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Condición de los Animales
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={transportEvent.animalCondition}
                      onChange={(e) =>
                        handleInputChange("animalCondition", e.target.value)
                      }
                    >
                      <option value="">Selecciona condición</option>
                      <option value="excellent">Excelente</option>
                      <option value="good">Buena</option>
                      <option value="fair">Regular</option>
                      <option value="stressed">Estresados</option>
                      <option value="sick">Enfermos</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notas e Incidentes */}
            <Card>
              <CardHeader
                icon={<FileText className="h-5 w-5 text-indigo-600" />}
              >
                <CardTitle>Observaciones e Incidentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas de la Ruta
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-vertical"
                      placeholder="Detalles de la ruta, paradas, observaciones..."
                      value={transportEvent.routeNotes}
                      onChange={(e) =>
                        handleInputChange("routeNotes", e.target.value)
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Incidentes o Problemas
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-vertical"
                      placeholder="Registra cualquier incidente, problema o situación especial..."
                      value={transportEvent.incidents}
                      onChange={(e) =>
                        handleInputChange("incidents", e.target.value)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Columna derecha - Ubicaciones y Documentos */}
          <motion.div className="space-y-6" variants={itemVariants}>
            {/* Ubicación de Origen */}
            <Card>
              <CardHeader icon={<MapPin className="h-5 w-5 text-green-600" />}>
                <div>
                  <CardTitle>Ubicación de Origen</CardTitle>
                  <CardDescription>
                    Punto de partida del transporte
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Dirección de Origen"
                    placeholder="Dirección completa"
                    value={transportEvent.originLocation.address}
                    onChange={(e) =>
                      handleLocationChange(
                        "originLocation",
                        "address",
                        e.target.value
                      )
                    }
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Latitud"
                      type="number"
                      step="any"
                      size="sm"
                      value={transportEvent.originLocation.lat.toString()}
                      onChange={(e) =>
                        handleLocationChange(
                          "originLocation",
                          "lat",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                    <Input
                      label="Longitud"
                      type="number"
                      step="any"
                      size="sm"
                      value={transportEvent.originLocation.lng.toString()}
                      onChange={(e) =>
                        handleLocationChange(
                          "originLocation",
                          "lng",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>

                  <Button
                    onClick={() => getCurrentLocation("originLocation")}
                    variant="outline"
                    fullWidth
                    leftIcon={<MapPin className="h-4 w-4" />}
                  >
                    Mi Ubicación
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Ubicación de Destino */}
            <Card>
              <CardHeader icon={<MapPin className="h-5 w-5 text-red-600" />}>
                <div>
                  <CardTitle>Ubicación de Destino</CardTitle>
                  <CardDescription>
                    Punto de llegada del transporte
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Dirección de Destino"
                    placeholder="Dirección completa"
                    value={transportEvent.destinationLocation.address}
                    onChange={(e) =>
                      handleLocationChange(
                        "destinationLocation",
                        "address",
                        e.target.value
                      )
                    }
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      label="Latitud"
                      type="number"
                      step="any"
                      size="sm"
                      value={transportEvent.destinationLocation.lat.toString()}
                      onChange={(e) =>
                        handleLocationChange(
                          "destinationLocation",
                          "lat",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                    <Input
                      label="Longitud"
                      type="number"
                      step="any"
                      size="sm"
                      value={transportEvent.destinationLocation.lng.toString()}
                      onChange={(e) =>
                        handleLocationChange(
                          "destinationLocation",
                          "lng",
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </div>

                  <Button
                    onClick={() => getCurrentLocation("destinationLocation")}
                    variant="outline"
                    fullWidth
                    leftIcon={<MapPin className="h-4 w-4" />}
                  >
                    Ubicación Actual
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Mapa de Ruta */}
            <Card>
              <CardHeader>
                <CardTitle>Ruta de Transporte</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 bg-gray-200 rounded-lg flex items-center justify-center border">
                  <div className="text-center text-gray-500">
                    <Route className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Mapa de Ruta</p>
                    <p className="text-xs">
                      Distancia: {transportEvent.distance} km
                    </p>
                    <p className="text-xs">
                      Tiempo: {transportEvent.estimatedDuration} h
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowRoute(!showRoute)}
                  variant="outline"
                  fullWidth
                  className="mt-2"
                >
                  {showRoute ? "Ocultar" : "Mostrar"} Ruta Detallada
                </Button>
              </CardContent>
            </Card>

            {/* Permisos y Documentos */}
            <Card>
              <CardHeader icon={<Shield className="h-5 w-5 text-blue-600" />}>
                <CardTitle>Permisos y Seguros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="healthCertificates"
                      checked={transportEvent.healthCertificates}
                      onChange={(e) =>
                        handleInputChange(
                          "healthCertificates",
                          e.target.checked
                        )
                      }
                      className="rounded border-gray-300"
                    />
                    <label
                      htmlFor="healthCertificates"
                      className="text-sm text-gray-700"
                    >
                      Certificados sanitarios
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="transportPermits"
                      checked={transportEvent.transportPermits}
                      onChange={(e) =>
                        handleInputChange("transportPermits", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <label
                      htmlFor="transportPermits"
                      className="text-sm text-gray-700"
                    >
                      Permisos de transporte
                    </label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="insurance"
                      checked={transportEvent.insurance}
                      onChange={(e) =>
                        handleInputChange("insurance", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <label
                      htmlFor="insurance"
                      className="text-sm text-gray-700"
                    >
                      Seguro de transporte
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contactos de Emergencia */}
            <Card>
              <CardHeader
                icon={<AlertTriangle className="h-5 w-5 text-orange-600" />}
              >
                <CardTitle>Contactos de Emergencia</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transportEvent.emergencyContacts.map((contact, index) => (
                    <Input
                      key={index}
                      placeholder={`Contacto ${index + 1}`}
                      value={contact}
                      onChange={(e) =>
                        handleEmergencyContactChange(index, e.target.value)
                      }
                    />
                  ))}
                  <Button
                    variant="outline"
                    onClick={addEmergencyContact}
                    leftIcon={<Plus className="h-4 w-4" />}
                    fullWidth
                  >
                    Agregar Contacto
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estado del Transporte */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-center">
                  Estado del Transporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Estado Actual
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={transportEvent.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                    >
                      <option value="planned">Planificado</option>
                      <option value="in_transit">En Tránsito</option>
                      <option value="delivered">Entregado</option>
                      <option value="cancelled">Cancelado</option>
                      <option value="delayed">Retrasado</option>
                    </select>
                  </div>

                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      transportEvent.status === "delivered"
                        ? "bg-green-100 text-green-800"
                        : transportEvent.status === "in_transit"
                        ? "bg-blue-100 text-blue-800"
                        : transportEvent.status === "delayed"
                        ? "bg-yellow-100 text-yellow-800"
                        : transportEvent.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {transportEvent.status === "planned" && "Planificado"}
                    {transportEvent.status === "in_transit" && "En Tránsito"}
                    {transportEvent.status === "delivered" && "Entregado"}
                    {transportEvent.status === "cancelled" && "Cancelado"}
                    {transportEvent.status === "delayed" && "Retrasado"}
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
                <div className="space-y-2">
                  <Button
                    variant="info"
                    fullWidth
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    Guía de Embarque
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<FileText className="h-4 w-4" />}
                  >
                    Manifiesto de Carga
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<Camera className="h-4 w-4" />}
                  >
                    Fotos del Viaje
                  </Button>
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
