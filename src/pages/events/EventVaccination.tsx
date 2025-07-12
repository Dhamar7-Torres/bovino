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
  Syringe,
  DollarSign,
  UserCheck,
  Calendar as CalendarIcon,
  Camera,
  FileText,
  Heart,
  ArrowLeft,
  Save,
  Plus,
  AlertTriangle,
  Shield,
  Clock,
  Thermometer,
  Activity,
  Stethoscope,
  Clipboard,
  Bell,
  CheckCircle,
} from "lucide-react";

// Interfaz para el evento de vacunación
interface VaccinationEvent {
  id?: string;
  bovineIds: string[];
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
  animalCondition: string;
  preVaccinationCheck: {
    temperature: number;
    weight: number;
    generalHealth: string;
    previousReactions: boolean;
    currentMedications: string;
  };
  postVaccinationMonitoring: {
    monitoringPeriod: number; // en horas
    adverseReactions: boolean;
    reactionType: string;
    reactionSeverity: string;
    treatmentRequired: boolean;
    notes: string;
  };
  nextDueDate: string;
  vaccinationSchedule: string;
  cost: number;
  vaccineCost: number;
  veterinarianFee: number;
  documents: string[];
  certificateIssued: boolean;
  complianceType: string; // obligatoria, preventiva, tratamiento
  diseasesPrevented: string[];
  notes: string;
  status: string;
  approved: boolean;
  approvedBy: string;
}

const EventVaccination: React.FC = () => {
  // Estados para el formulario
  const [vaccinationEvent, setVaccinationEvent] = useState<VaccinationEvent>({
    bovineIds: [""],
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
    animalCondition: "",
    preVaccinationCheck: {
      temperature: 38.5,
      weight: 0,
      generalHealth: "",
      previousReactions: false,
      currentMedications: "",
    },
    postVaccinationMonitoring: {
      monitoringPeriod: 24,
      adverseReactions: false,
      reactionType: "",
      reactionSeverity: "",
      treatmentRequired: false,
      notes: "",
    },
    nextDueDate: "",
    vaccinationSchedule: "",
    cost: 0,
    vaccineCost: 0,
    veterinarianFee: 0,
    documents: [],
    certificateIssued: false,
    complianceType: "",
    diseasesPrevented: [],
    notes: "",
    status: "planned",
    approved: false,
    approvedBy: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPreCheck, setShowPreCheck] = useState(false);
  const [showPostMonitoring, setShowPostMonitoring] = useState(false);

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
    setVaccinationEvent((prev) => {
      const updated = { ...prev, [field]: value };

      // Calcular costo total automáticamente
      if (["vaccineCost", "veterinarianFee"].includes(field)) {
        updated.cost = updated.vaccineCost + updated.veterinarianFee;
      }

      // Calcular fecha de próxima vacuna basada en el tipo
      if (field === "vaccineType" || field === "applicationDate") {
        const scheduleMap: { [key: string]: number } = {
          annual: 365,
          biannual: 180,
          quarterly: 90,
          monthly: 30,
          single: 0,
        };

        if (updated.vaccinationSchedule && updated.applicationDate) {
          const daysToAdd = scheduleMap[updated.vaccinationSchedule] || 0;
          if (daysToAdd > 0) {
            const nextDate = new Date(updated.applicationDate);
            nextDate.setDate(nextDate.getDate() + daysToAdd);
            updated.nextDueDate = nextDate.toISOString().split("T")[0];
          }
        }
      }

      return updated;
    });
  };

  // Función para manejar cambios en pre-vacunación
  const handlePreCheckChange = (field: string, value: any) => {
    setVaccinationEvent((prev) => ({
      ...prev,
      preVaccinationCheck: {
        ...prev.preVaccinationCheck,
        [field]: value,
      },
    }));
  };

  // Función para manejar cambios en post-vacunación
  const handlePostMonitoringChange = (field: string, value: any) => {
    setVaccinationEvent((prev) => ({
      ...prev,
      postVaccinationMonitoring: {
        ...prev.postVaccinationMonitoring,
        [field]: value,
      },
    }));
  };

  // Función para manejar cambios en ubicación
  const handleLocationChange = (field: string, value: any) => {
    setVaccinationEvent((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));
  };

  // Función para agregar/quitar IDs de animales
  const handleBovineIdsChange = (index: number, value: string) => {
    setVaccinationEvent((prev) => {
      const newIds = [...prev.bovineIds];
      newIds[index] = value;
      return { ...prev, bovineIds: newIds };
    });
  };

  const addBovineId = () => {
    setVaccinationEvent((prev) => ({
      ...prev,
      bovineIds: [...prev.bovineIds, ""],
    }));
  };

  const removeBovineId = (index: number) => {
    setVaccinationEvent((prev) => ({
      ...prev,
      bovineIds: prev.bovineIds.filter((_, i) => i !== index),
    }));
  };

  // Función para agregar/quitar enfermedades prevenidas
  const addDiseasePrevented = () => {
    setVaccinationEvent((prev) => ({
      ...prev,
      diseasesPrevented: [...prev.diseasesPrevented, ""],
    }));
  };

  const handleDiseasePreventedChange = (index: number, value: string) => {
    setVaccinationEvent((prev) => {
      const newDiseases = [...prev.diseasesPrevented];
      newDiseases[index] = value;
      return { ...prev, diseasesPrevented: newDiseases };
    });
  };

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
    }
  };

  // Función para guardar el evento
  const handleSaveEvent = async () => {
    setLoading(true);
    try {
      // Aquí iría la lógica para guardar en el backend
      console.log("Guardando evento de vacunación:", vaccinationEvent);

      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("Evento de vacunación registrado exitosamente");
    } catch (error) {
      console.error("Error guardando evento:", error);
      alert("Error al guardar el evento");
    } finally {
      setLoading(false);
    }
  };

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
                Registro de Vacunación
              </h1>
              <p className="text-gray-600">
                Registra un nuevo evento de vacunación de ganado
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
              {loading ? "Guardando..." : "Guardar Vacunación"}
            </Button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna izquierda - Información principal */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            variants={itemVariants}
          >
            {/* Información de los Animales */}
            <Card>
              <CardHeader icon={<Heart className="h-5 w-5 text-red-600" />}>
                <div>
                  <CardTitle>Animales a Vacunar</CardTitle>
                  <CardDescription>
                    IDs de los bovinos que recibirán la vacuna
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vaccinationEvent.bovineIds.map((id, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder={`ID del Animal ${index + 1}`}
                        value={id}
                        onChange={(e) =>
                          handleBovineIdsChange(index, e.target.value)
                        }
                        className="flex-1"
                      />
                      {vaccinationEvent.bovineIds.length > 1 && (
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

            {/* Información de la Vacuna */}
            <Card>
              <CardHeader icon={<Syringe className="h-5 w-5 text-blue-600" />}>
                <div>
                  <CardTitle>Información de la Vacuna</CardTitle>
                  <CardDescription>
                    Detalles de la vacuna a aplicar
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="ID de la Vacuna"
                      placeholder="Código de la vacuna"
                      value={vaccinationEvent.vaccineId}
                      onChange={(e) =>
                        handleInputChange("vaccineId", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Nombre de la Vacuna"
                      placeholder="Nombre comercial"
                      value={vaccinationEvent.vaccineName}
                      onChange={(e) =>
                        handleInputChange("vaccineName", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Tipo de Vacuna <span className="text-red-500">*</span>
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={vaccinationEvent.vaccineType}
                        onChange={(e) =>
                          handleInputChange("vaccineType", e.target.value)
                        }
                        required
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
                      label="Fabricante"
                      placeholder="Laboratorio fabricante"
                      value={vaccinationEvent.manufacturer}
                      onChange={(e) =>
                        handleInputChange("manufacturer", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Número de Lote"
                      placeholder="Lote de la vacuna"
                      value={vaccinationEvent.batchNumber}
                      onChange={(e) =>
                        handleInputChange("batchNumber", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Fecha de Vencimiento"
                      type="date"
                      value={vaccinationEvent.expirationDate}
                      onChange={(e) =>
                        handleInputChange("expirationDate", e.target.value)
                      }
                      required
                    />
                  </div>

                  {/* Enfermedades Prevenidas */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Enfermedades Prevenidas
                    </label>
                    <div className="space-y-2">
                      {vaccinationEvent.diseasesPrevented.map(
                        (disease, index) => (
                          <Input
                            key={index}
                            placeholder={`Enfermedad ${index + 1}`}
                            value={disease}
                            onChange={(e) =>
                              handleDiseasePreventedChange(
                                index,
                                e.target.value
                              )
                            }
                          />
                        )
                      )}
                      <Button
                        variant="outline"
                        onClick={addDiseasePrevented}
                        leftIcon={<Plus className="h-4 w-4" />}
                        size="sm"
                      >
                        Agregar Enfermedad
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información del Veterinario */}
            <Card>
              <CardHeader
                icon={<UserCheck className="h-5 w-5 text-green-600" />}
              >
                <div>
                  <CardTitle>Veterinario Responsable</CardTitle>
                  <CardDescription>
                    Profesional que aplicará la vacuna
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="ID del Veterinario"
                      placeholder="Cédula profesional"
                      value={vaccinationEvent.veterinarianId}
                      onChange={(e) =>
                        handleInputChange("veterinarianId", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Nombre del Veterinario"
                      placeholder="Nombre completo"
                      value={vaccinationEvent.veterinarianName}
                      onChange={(e) =>
                        handleInputChange("veterinarianName", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Licencia/Registro"
                      placeholder="Número de licencia"
                      value={vaccinationEvent.veterinarianLicense}
                      onChange={(e) =>
                        handleInputChange("veterinarianLicense", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalles de Aplicación */}
            <Card>
              <CardHeader
                icon={<Activity className="h-5 w-5 text-purple-600" />}
              >
                <div>
                  <CardTitle>Detalles de Aplicación</CardTitle>
                  <CardDescription>
                    Información sobre la administración de la vacuna
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Fecha de Aplicación"
                      type="date"
                      value={vaccinationEvent.applicationDate}
                      onChange={(e) =>
                        handleInputChange("applicationDate", e.target.value)
                      }
                      required
                    />
                    <Input
                      label="Hora de Aplicación"
                      type="time"
                      value={vaccinationEvent.applicationTime}
                      onChange={(e) =>
                        handleInputChange("applicationTime", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex space-x-2">
                      <Input
                        label="Dosis"
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={vaccinationEvent.doseAmount.toString()}
                        onChange={(e) =>
                          handleInputChange(
                            "doseAmount",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="flex-1"
                        required
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Unidad
                        </label>
                        <select
                          className="w-20 px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={vaccinationEvent.doseUnit}
                          onChange={(e) =>
                            handleInputChange("doseUnit", e.target.value)
                          }
                        >
                          <option value="ml">ml</option>
                          <option value="cc">cc</option>
                          <option value="mg">mg</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Método de Aplicación
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={vaccinationEvent.applicationMethod}
                        onChange={(e) =>
                          handleInputChange("applicationMethod", e.target.value)
                        }
                        required
                      >
                        <option value="">Selecciona método</option>
                        <option value="intramuscular">Intramuscular</option>
                        <option value="subcutaneous">Subcutánea</option>
                        <option value="intranasal">Intranasal</option>
                        <option value="oral">Oral</option>
                        <option value="topical">Tópica</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Sitio de Aplicación
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={vaccinationEvent.applicationSite}
                        onChange={(e) =>
                          handleInputChange("applicationSite", e.target.value)
                        }
                        required
                      >
                        <option value="">Selecciona sitio</option>
                        <option value="neck">Cuello</option>
                        <option value="shoulder">Hombro</option>
                        <option value="hip">Cadera</option>
                        <option value="thigh">Muslo</option>
                        <option value="nose">Nariz</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Programa de Vacunación
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={vaccinationEvent.vaccinationSchedule}
                        onChange={(e) =>
                          handleInputChange(
                            "vaccinationSchedule",
                            e.target.value
                          )
                        }
                      >
                        <option value="">Selecciona programa</option>
                        <option value="single">Dosis única</option>
                        <option value="annual">Anual</option>
                        <option value="biannual">Semestral</option>
                        <option value="quarterly">Trimestral</option>
                        <option value="monthly">Mensual</option>
                      </select>
                    </div>

                    <Input
                      label="Próxima Vacunación"
                      type="date"
                      value={vaccinationEvent.nextDueDate}
                      onChange={(e) =>
                        handleInputChange("nextDueDate", e.target.value)
                      }
                      description="Se calcula automáticamente"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Tipo de Cumplimiento
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={vaccinationEvent.complianceType}
                      onChange={(e) =>
                        handleInputChange("complianceType", e.target.value)
                      }
                    >
                      <option value="">Selecciona tipo</option>
                      <option value="mandatory">Obligatoria</option>
                      <option value="preventive">Preventiva</option>
                      <option value="treatment">Tratamiento</option>
                      <option value="voluntary">Voluntaria</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pre-Vacunación */}
            <Card>
              <CardHeader
                icon={<Stethoscope className="h-5 w-5 text-indigo-600" />}
                actions={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPreCheck(!showPreCheck)}
                  >
                    {showPreCheck ? "Ocultar" : "Mostrar"}
                  </Button>
                }
              >
                <div>
                  <CardTitle>Chequeo Pre-Vacunación</CardTitle>
                  <CardDescription>
                    Evaluación del estado del animal antes de vacunar
                  </CardDescription>
                </div>
              </CardHeader>
              {showPreCheck && (
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Temperatura (°C)"
                        type="number"
                        step="0.1"
                        placeholder="38.5"
                        value={vaccinationEvent.preVaccinationCheck.temperature.toString()}
                        onChange={(e) =>
                          handlePreCheckChange(
                            "temperature",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        leftIcon={<Thermometer className="h-4 w-4" />}
                      />
                      <Input
                        label="Peso (kg)"
                        type="number"
                        placeholder="Peso del animal"
                        value={vaccinationEvent.preVaccinationCheck.weight.toString()}
                        onChange={(e) =>
                          handlePreCheckChange(
                            "weight",
                            parseFloat(e.target.value) || 0
                          )
                        }
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Estado General
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={
                            vaccinationEvent.preVaccinationCheck.generalHealth
                          }
                          onChange={(e) =>
                            handlePreCheckChange(
                              "generalHealth",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Evaluar estado</option>
                          <option value="excellent">Excelente</option>
                          <option value="good">Bueno</option>
                          <option value="fair">Regular</option>
                          <option value="poor">Malo</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="previousReactions"
                        checked={
                          vaccinationEvent.preVaccinationCheck.previousReactions
                        }
                        onChange={(e) =>
                          handlePreCheckChange(
                            "previousReactions",
                            e.target.checked
                          )
                        }
                        className="rounded border-gray-300"
                      />
                      <label
                        htmlFor="previousReactions"
                        className="text-sm text-gray-700"
                      >
                        Reacciones previas a vacunas
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medicamentos Actuales
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-vertical"
                        placeholder="Lista de medicamentos o tratamientos actuales..."
                        value={
                          vaccinationEvent.preVaccinationCheck
                            .currentMedications
                        }
                        onChange={(e) =>
                          handlePreCheckChange(
                            "currentMedications",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Post-Vacunación */}
            <Card>
              <CardHeader
                icon={<Clipboard className="h-5 w-5 text-orange-600" />}
                actions={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPostMonitoring(!showPostMonitoring)}
                  >
                    {showPostMonitoring ? "Ocultar" : "Mostrar"}
                  </Button>
                }
              >
                <div>
                  <CardTitle>Monitoreo Post-Vacunación</CardTitle>
                  <CardDescription>
                    Seguimiento después de la aplicación
                  </CardDescription>
                </div>
              </CardHeader>
              {showPostMonitoring && (
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Período de Monitoreo (horas)"
                        type="number"
                        placeholder="24"
                        value={vaccinationEvent.postVaccinationMonitoring.monitoringPeriod.toString()}
                        onChange={(e) =>
                          handlePostMonitoringChange(
                            "monitoringPeriod",
                            parseInt(e.target.value) || 0
                          )
                        }
                        leftIcon={<Clock className="h-4 w-4" />}
                      />
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Severidad de Reacción
                        </label>
                        <select
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          value={
                            vaccinationEvent.postVaccinationMonitoring
                              .reactionSeverity
                          }
                          onChange={(e) =>
                            handlePostMonitoringChange(
                              "reactionSeverity",
                              e.target.value
                            )
                          }
                        >
                          <option value="">Sin reacción</option>
                          <option value="mild">Leve</option>
                          <option value="moderate">Moderada</option>
                          <option value="severe">Severa</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="adverseReactions"
                          checked={
                            vaccinationEvent.postVaccinationMonitoring
                              .adverseReactions
                          }
                          onChange={(e) =>
                            handlePostMonitoringChange(
                              "adverseReactions",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor="adverseReactions"
                          className="text-sm text-gray-700"
                        >
                          Reacciones adversas observadas
                        </label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="treatmentRequired"
                          checked={
                            vaccinationEvent.postVaccinationMonitoring
                              .treatmentRequired
                          }
                          onChange={(e) =>
                            handlePostMonitoringChange(
                              "treatmentRequired",
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300"
                        />
                        <label
                          htmlFor="treatmentRequired"
                          className="text-sm text-gray-700"
                        >
                          Tratamiento requerido
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tipo de Reacción
                      </label>
                      <Input
                        placeholder="Describe el tipo de reacción observada..."
                        value={
                          vaccinationEvent.postVaccinationMonitoring
                            .reactionType
                        }
                        onChange={(e) =>
                          handlePostMonitoringChange(
                            "reactionType",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notas de Monitoreo
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[80px] resize-vertical"
                        placeholder="Observaciones durante el período de monitoreo..."
                        value={vaccinationEvent.postVaccinationMonitoring.notes}
                        onChange={(e) =>
                          handlePostMonitoringChange("notes", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Costos */}
            <Card>
              <CardHeader
                icon={<DollarSign className="h-5 w-5 text-green-600" />}
              >
                <CardTitle>Costos de Vacunación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Costo de Vacuna"
                      type="number"
                      step="0.01"
                      placeholder="$0.00"
                      value={vaccinationEvent.vaccineCost.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "vaccineCost",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      leftIcon={<DollarSign className="h-4 w-4" />}
                    />
                    <Input
                      label="Honorarios Veterinario"
                      type="number"
                      step="0.01"
                      placeholder="$0.00"
                      value={vaccinationEvent.veterinarianFee.toString()}
                      onChange={(e) =>
                        handleInputChange(
                          "veterinarianFee",
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
                        ${vaccinationEvent.cost.toLocaleString()}
                      </span>
                    </div>
                    {vaccinationEvent.bovineIds.filter((id) => id.trim())
                      .length > 0 && (
                      <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
                        <span>Costo por Animal:</span>
                        <span>
                          $
                          {(
                            vaccinationEvent.cost /
                            vaccinationEvent.bovineIds.filter((id) => id.trim())
                              .length
                          ).toFixed(2)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notas Adicionales */}
            <Card>
              <CardHeader
                icon={<FileText className="h-5 w-5 text-indigo-600" />}
              >
                <CardTitle>Notas Adicionales</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-vertical"
                  placeholder="Observaciones especiales, protocolos seguidos, recomendaciones..."
                  value={vaccinationEvent.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Columna derecha - Ubicación y Documentos */}
          <motion.div className="space-y-6" variants={itemVariants}>
            {/* Ubicación */}
            <Card>
              <CardHeader icon={<MapPin className="h-5 w-5 text-red-600" />}>
                <div>
                  <CardTitle>Ubicación de Vacunación</CardTitle>
                  <CardDescription>
                    Lugar donde se aplicó la vacuna
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    label="Dirección"
                    placeholder="Ubicación específica"
                    value={vaccinationEvent.location.address}
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
                      value={vaccinationEvent.location.lat.toString()}
                      onChange={(e) =>
                        handleLocationChange("lat", parseFloat(e.target.value))
                      }
                    />
                    <Input
                      label="Longitud"
                      type="number"
                      step="any"
                      size="sm"
                      value={vaccinationEvent.location.lng.toString()}
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
                      <p className="text-sm">Ubicación de Vacunación</p>
                      <p className="text-xs">
                        Lat: {vaccinationEvent.location.lat.toFixed(4)}
                      </p>
                      <p className="text-xs">
                        Lng: {vaccinationEvent.location.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estado y Aprobación */}
            <Card>
              <CardHeader icon={<Shield className="h-5 w-5 text-blue-600" />}>
                <CardTitle>Estado de la Vacunación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Estado Actual
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={vaccinationEvent.status}
                      onChange={(e) =>
                        handleInputChange("status", e.target.value)
                      }
                    >
                      <option value="planned">Planificada</option>
                      <option value="completed">Completada</option>
                      <option value="cancelled">Cancelada</option>
                      <option value="rescheduled">Reprogramada</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="approved"
                      checked={vaccinationEvent.approved}
                      onChange={(e) =>
                        handleInputChange("approved", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <label htmlFor="approved" className="text-sm text-gray-700">
                      Vacunación aprobada
                    </label>
                  </div>

                  {vaccinationEvent.approved && (
                    <Input
                      label="Aprobado por"
                      placeholder="Nombre del supervisor"
                      value={vaccinationEvent.approvedBy}
                      onChange={(e) =>
                        handleInputChange("approvedBy", e.target.value)
                      }
                    />
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="certificateIssued"
                      checked={vaccinationEvent.certificateIssued}
                      onChange={(e) =>
                        handleInputChange("certificateIssued", e.target.checked)
                      }
                      className="rounded border-gray-300"
                    />
                    <label
                      htmlFor="certificateIssued"
                      className="text-sm text-gray-700"
                    >
                      Certificado emitido
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recordatorios */}
            <Card>
              <CardHeader icon={<Bell className="h-5 w-5 text-yellow-600" />}>
                <CardTitle>Recordatorios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-gray-700">
                      Vacuna verificada
                    </span>
                  </div>

                  {vaccinationEvent.nextDueDate && (
                    <div className="flex items-center space-x-2">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-700">
                        Próxima:{" "}
                        {new Date(
                          vaccinationEvent.nextDueDate
                        ).toLocaleDateString("es-ES")}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-gray-700">
                      Monitorear por 24h
                    </span>
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
                    Certificado de Vacunación
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<Camera className="h-4 w-4" />}
                  >
                    Foto de la Vacuna
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<FileText className="h-4 w-4" />}
                  >
                    Hoja de Seguimiento
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    leftIcon={<Stethoscope className="h-4 w-4" />}
                  >
                    Reporte Veterinario
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Resumen de Condición */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="text-center">
                  Condición del Animal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-3">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Estado General
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={vaccinationEvent.animalCondition}
                      onChange={(e) =>
                        handleInputChange("animalCondition", e.target.value)
                      }
                    >
                      <option value="">Evaluar condición</option>
                      <option value="excellent">Excelente</option>
                      <option value="good">Buena</option>
                      <option value="fair">Regular</option>
                      <option value="poor">Pobre</option>
                      <option value="sick">Enfermo</option>
                    </select>
                  </div>

                  <div
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      vaccinationEvent.animalCondition === "excellent"
                        ? "bg-green-100 text-green-800"
                        : vaccinationEvent.animalCondition === "good"
                        ? "bg-blue-100 text-blue-800"
                        : vaccinationEvent.animalCondition === "fair"
                        ? "bg-yellow-100 text-yellow-800"
                        : vaccinationEvent.animalCondition === "poor" ||
                          vaccinationEvent.animalCondition === "sick"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {vaccinationEvent.animalCondition || "Sin evaluar"}
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      Temp: {vaccinationEvent.preVaccinationCheck.temperature}°C
                    </p>
                    <p>
                      Peso:{" "}
                      {vaccinationEvent.preVaccinationCheck.weight || "---"} kg
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default EventVaccination;
