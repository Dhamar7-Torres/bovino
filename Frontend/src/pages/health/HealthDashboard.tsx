import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Syringe,
  Thermometer,
  Calendar,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Shield,
  Stethoscope,
  Pill,
  Heart,
  Clock,
  ArrowRight,
  Plus,
  Filter,
} from "lucide-react";

// Interfaces para tipos de datos
interface HealthStats {
  totalAnimals: number;
  healthyAnimals: number;
  sickAnimals: number;
  vaccinatedToday: number;
  upcomingVaccinations: number;
  criticalAlerts: number;
  healthScore: number;
}

interface VaccinationEvent {
  id: string;
  animalId: string;
  animalName: string;
  vaccineName: string;
  date: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  status: "completed" | "pending" | "overdue";
  veterinarian: string;
}

// Componente Card personalizado
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = "",
}) => (
  <div
    className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
  >
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => <p className="text-sm text-gray-600 mt-1">{children}</p>;

const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

// Componente Button personalizado
const Button: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline";
  size?: "sm" | "default";
  className?: string;
}> = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

// Componente de Calendario simple
const SimpleCalendar: React.FC<{
  selectedDate?: Date;
  onSelect?: (date: Date) => void;
}> = ({ selectedDate, onSelect }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const days = [];

  // Días en blanco del mes anterior
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
  }

  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const isSelected =
      selectedDate && date.toDateString() === selectedDate.toDateString();
    const isToday = date.toDateString() === today.toDateString();

    days.push(
      <button
        key={day}
        onClick={() => onSelect && onSelect(date)}
        className={`w-8 h-8 text-sm rounded-md transition-colors ${
          isSelected
            ? "bg-blue-600 text-white"
            : isToday
            ? "bg-blue-100 text-blue-700"
            : "hover:bg-gray-100"
        }`}
      >
        {day}
      </button>
    );
  }

  return (
    <div className="p-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </h3>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-gray-500 p-2"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{days}</div>
    </div>
  );
};

// Componente de Mapa simple (placeholder)
const SimpleMap: React.FC = () => {
  return (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Fondo del mapa simulado */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-blue-100"></div>

      {/* Título de ubicación */}
      <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">Villahermosa, Tabasco</span>
        </div>
      </div>

      {/* Marcadores simulados */}
      <div className="relative w-full h-full">
        {/* Marcador de vacunación */}
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-green-600 rounded-full w-6 h-6 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Syringe className="w-3 h-3 text-white" />
          </motion.div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
            <p className="font-medium">Vacunación Bessie</p>
            <p className="text-gray-600">Rancho La Esperanza</p>
          </div>
        </div>

        {/* Marcador de enfermedad */}
        <div className="absolute top-2/3 right-1/3 transform translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-red-600 rounded-full w-6 h-6 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Thermometer className="w-3 h-3 text-white" />
          </motion.div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
            <p className="font-medium">Mastitis - Estrella</p>
            <p className="text-gray-600">Establo Principal</p>
          </div>
        </div>
      </div>

      {/* Control de zoom simulado */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md">
        <div className="flex flex-col">
          <button className="p-2 hover:bg-gray-100">+</button>
          <div className="border-t border-gray-200"></div>
          <button className="p-2 hover:bg-gray-100">-</button>
        </div>
      </div>
    </div>
  );
};

const HealthDashboard: React.FC = () => {
  // Estados para el dashboard
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [vaccinationEvents, setVaccinationEvents] = useState<
    VaccinationEvent[]
  >([]);
  const [healthStats, setHealthStats] = useState<HealthStats>({
    totalAnimals: 0,
    healthyAnimals: 0,
    sickAnimals: 0,
    vaccinatedToday: 0,
    upcomingVaccinations: 0,
    criticalAlerts: 0,
    healthScore: 0,
  });

  // Simulación de datos (en producción esto vendría de la API)
  useEffect(() => {
    const loadData = async () => {
      // Simular carga de datos
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Datos de ejemplo para vacunaciones
      const mockVaccinations: VaccinationEvent[] = [
        {
          id: "1",
          animalId: "COW001",
          animalName: "Bessie",
          vaccineName: "Vacuna Antiaftosa",
          date: new Date("2025-07-12"),
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: "Rancho La Esperanza, Villahermosa",
          },
          status: "completed",
          veterinarian: "Dr. García",
        },
        {
          id: "2",
          animalId: "COW002",
          animalName: "Luna",
          vaccineName: "Vacuna Brucelosis",
          date: new Date("2025-07-13"),
          location: {
            lat: 17.9719,
            lng: -92.9456,
            address: "Sector Norte, Villahermosa",
          },
          status: "pending",
          veterinarian: "Dr. Martínez",
        },
      ];

      // Estadísticas de ejemplo
      const mockStats: HealthStats = {
        totalAnimals: 156,
        healthyAnimals: 142,
        sickAnimals: 8,
        vaccinatedToday: 12,
        upcomingVaccinations: 24,
        criticalAlerts: 3,
        healthScore: 94,
      };

      setVaccinationEvents(mockVaccinations);
      setHealthStats(mockStats);
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header del Dashboard */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard de Salud
              </h1>
              <p className="text-gray-600 mt-1">
                Monitoreo integral de salud bovina
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Evento
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tarjetas de Estadísticas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Total de Animales */}
              <Card className="bg-white/80 backdrop-blur-md border-blue-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Activity className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Total de Animales
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {healthStats.totalAnimals}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Animales Saludables */}
              <Card className="bg-white/80 backdrop-blur-md border-green-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Animales Saludables
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {healthStats.healthyAnimals}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vacunaciones Hoy */}
              <Card className="bg-white/80 backdrop-blur-md border-purple-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Syringe className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Vacunadas Hoy
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {healthStats.vaccinatedToday}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alertas Críticas */}
              <Card className="bg-white/80 backdrop-blur-md border-red-200 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Alertas Críticas
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {healthStats.criticalAlerts}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Mapa de Eventos de Salud */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-600" />
                  Mapa de Eventos de Salud
                </CardTitle>
                <CardDescription>
                  Ubicaciones de vacunaciones y enfermedades registradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleMap />
              </CardContent>
            </Card>
          </motion.div>

          {/* Panel Lateral - Calendario y Eventos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Calendario */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Calendario de Eventos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SimpleCalendar
                  selectedDate={selectedDate}
                  onSelect={setSelectedDate}
                />
              </CardContent>
            </Card>

            {/* Próximas Vacunaciones */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-orange-600" />
                  Próximas Vacunaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {vaccinationEvents
                  .filter((event) => event.status === "pending")
                  .map((event) => (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.02 }}
                      className="p-3 bg-orange-50 rounded-lg border border-orange-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {event.animalName}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {event.vaccineName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {event.date.toLocaleDateString()}
                          </p>
                        </div>
                        <Syringe className="w-5 h-5 text-orange-600" />
                      </div>
                    </motion.div>
                  ))}
              </CardContent>
            </Card>

            {/* Score de Salud */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Score de Salud General
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {healthStats.healthScore}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${healthStats.healthScore}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                      className="bg-green-600 h-2 rounded-full"
                    />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    Excelente estado general
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Navegación Rápida a Módulos */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-12"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle>Módulos de Salud</CardTitle>
                <CardDescription>
                  Acceso rápido a las diferentes secciones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Registros de Vacunación",
                      icon: Syringe,
                      color: "green",
                      href: "/health/vaccination-records",
                    },
                    {
                      title: "Historial Médico",
                      icon: Stethoscope,
                      color: "blue",
                      href: "/health/medical-history",
                    },
                    {
                      title: "Inventario de Medicamentos",
                      icon: Pill,
                      color: "purple",
                      href: "/health/medication-inventory",
                    },
                    {
                      title: "Salud Reproductiva",
                      icon: Heart,
                      color: "pink",
                      href: "/health/reproductive",
                    },
                  ].map((module, index) => (
                    <motion.div
                      key={module.title}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Button
                        variant="outline"
                        className="h-auto p-4 w-full flex-col items-center gap-3 hover:shadow-md"
                        onClick={() => (window.location.href = module.href)}
                      >
                        <module.icon
                          className={`w-8 h-8 text-${module.color}-600`}
                        />
                        <span className="text-sm font-medium text-center">
                          {module.title}
                        </span>
                        <ArrowRight className="w-4 h-4 opacity-50" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
