import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Eye,
  Edit,
  Trash2,
  Save,
  X,
} from "lucide-react";

// Interfaces
interface ReproductiveEvent {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  eventType: "heat_detection" | "insemination" | "pregnancy_check" | "birth" | "weaning" | "synchronization" | "embryo_transfer" | "examination";
  eventDate: Date;
  location: {
    lat: number;
    lng: number;
    address: string;
    sector: string;
  };
  veterinarian: string;
  technician?: string;
  details: {
    heatIntensity?: "low" | "medium" | "high";
    heatSigns?: string[];
    semenBull?: string;
    semenBatch?: string;
    inseminationMethod?: "artificial" | "natural";
    gestationDays?: number;
    gestationStatus?: "open" | "pregnant" | "uncertain";
    expectedCalvingDate?: Date;
  };
  status: "scheduled" | "completed" | "cancelled" | "pending";
  results?: string;
  cost: number;
  notes: string;
}

// Componentes básicos
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>{children}</h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600 mt-1">{children}</p>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = "default", 
  size = "default", 
  className = "", 
  disabled = false 
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "default" | "outline" | "success" | "danger" | "warning";
  size?: "sm" | "default";
  className?: string;
  disabled?: boolean;
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={(e) => onClick?.(e)}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ children, variant, className = "" }: { children: React.ReactNode; variant: string; className?: string }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "scheduled": return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed": return "bg-green-100 text-green-800 border-green-200";
      case "cancelled": return "bg-gray-100 text-gray-800 border-gray-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "heat_detection": return "bg-pink-100 text-pink-800 border-pink-200";
      case "insemination": return "bg-blue-100 text-blue-800 border-blue-200";
      case "pregnancy_check": return "bg-green-100 text-green-800 border-green-200";
      case "birth": return "bg-purple-100 text-purple-800 border-purple-200";
      case "weaning": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "synchronization": return "bg-orange-100 text-orange-800 border-orange-200";
      case "examination": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(variant)} ${className}`}>
      {children}
    </span>
  );
};

// Modal para Nuevo Evento
const NewEventModal = ({ 
  isOpen, 
  onClose, 
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSave: (event: Omit<ReproductiveEvent, "id">) => void; 
}) => {
  const [formData, setFormData] = useState({
    animalName: "",
    animalTag: "",
    eventType: "heat_detection" as ReproductiveEvent["eventType"],
    eventDate: new Date().toISOString().split("T")[0],
    veterinarian: "",
    address: "",
    sector: "",
    cost: 0,
    notes: "",
    results: "",
    status: "completed" as ReproductiveEvent["status"],
    heatIntensity: "medium" as "low" | "medium" | "high",
    semenBull: "",
    gestationStatus: "uncertain" as "open" | "pregnant" | "uncertain",
    gestationDays: 0,
  });

  const handleSubmit = () => {
    if (!formData.animalName.trim() || !formData.animalTag.trim() || !formData.veterinarian.trim()) {
      alert("Por favor completa los campos obligatorios: nombre del animal, etiqueta y veterinario");
      return;
    }

    const eventData: Omit<ReproductiveEvent, "id"> = {
      animalId: `MANUAL_${formData.animalTag}_${Date.now()}`,
      animalName: formData.animalName,
      animalTag: formData.animalTag,
      eventType: formData.eventType,
      eventDate: new Date(formData.eventDate),
      location: {
        lat: 17.9869 + Math.random() * 0.1,
        lng: -92.9303 + Math.random() * 0.1,
        address: formData.address || `Sector ${formData.sector || "A"}`,
        sector: formData.sector || "A",
      },
      veterinarian: formData.veterinarian,
      details: {
        heatIntensity: formData.eventType === "heat_detection" ? formData.heatIntensity : undefined,
        semenBull: formData.eventType === "insemination" ? formData.semenBull : undefined,
        gestationStatus: formData.eventType === "pregnancy_check" ? formData.gestationStatus : undefined,
        gestationDays: formData.eventType === "pregnancy_check" ? formData.gestationDays : undefined,
      },
      status: formData.status,
      results: formData.results,
      cost: formData.cost,
      notes: formData.notes,
    };

    onSave(eventData);
    onClose();
    
    // Reset form
    setFormData({
      animalName: "",
      animalTag: "",
      eventType: "heat_detection",
      eventDate: new Date().toISOString().split("T")[0],
      veterinarian: "",
      address: "",
      sector: "",
      cost: 0,
      notes: "",
      results: "",
      status: "completed",
      heatIntensity: "medium",
      semenBull: "",
      gestationStatus: "uncertain",
      gestationDays: 0,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Nuevo Evento Reproductivo</h2>
            <button onClick={() => onClose()} className="text-gray-400 hover:text-gray-600">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Animal *</label>
                <input
                  type="text"
                  value={formData.animalName}
                  onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: Bessie, Luna, Margarita"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Etiqueta/Tag *</label>
                <input
                  type="text"
                  value={formData.animalTag}
                  onChange={(e) => setFormData(prev => ({ ...prev, animalTag: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: TAG-001, COW-123"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Evento *</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as ReproductiveEvent["eventType"] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="heat_detection">Detección de Celo</option>
                  <option value="insemination">Inseminación</option>
                  <option value="pregnancy_check">Examen de Gestación</option>
                  <option value="birth">Parto</option>
                  <option value="weaning">Destete</option>
                  <option value="synchronization">Sincronización</option>
                  <option value="examination">Examen</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fecha *</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Veterinario *</label>
                <input
                  type="text"
                  value={formData.veterinarian}
                  onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del veterinario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
                <input
                  type="text"
                  value={formData.sector}
                  onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="A, B, C..."
                />
              </div>
            </div>

            {formData.eventType === "heat_detection" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Intensidad del Celo</label>
                <select
                  value={formData.heatIntensity}
                  onChange={(e) => setFormData(prev => ({ ...prev, heatIntensity: e.target.value as "low" | "medium" | "high" }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            )}

            {formData.eventType === "insemination" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Toro</label>
                <input
                  type="text"
                  value={formData.semenBull}
                  onChange={(e) => setFormData(prev => ({ ...prev, semenBull: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre del toro"
                />
              </div>
            )}

            {formData.eventType === "pregnancy_check" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado de Gestación</label>
                  <select
                    value={formData.gestationStatus}
                    onChange={(e) => setFormData(prev => ({ ...prev, gestationStatus: e.target.value as "open" | "pregnant" | "uncertain" }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="uncertain">Incierto</option>
                    <option value="open">Vacía</option>
                    <option value="pregnant">Gestante</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Días de Gestación</label>
                  <input
                    type="number"
                    value={formData.gestationDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, gestationDays: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="300"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ReproductiveEvent["status"] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="completed">Completado</option>
                  <option value="scheduled">Programado</option>
                  <option value="pending">Pendiente</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Costo ($)</label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Resultados</label>
              <textarea
                value={formData.results}
                onChange={(e) => setFormData(prev => ({ ...prev, results: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Resultados del evento..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Observaciones adicionales..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => onClose()}>Cancelar</Button>
              <Button onClick={() => handleSubmit()}>
                <Save className="w-4 h-4 mr-2" />
                Guardar Evento
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal
const ReproductiveHealth = () => {
  const [events, setEvents] = useState<ReproductiveEvent[]>([]);
  const [showNewEventModal, setShowNewEventModal] = useState(false);

  // Datos iniciales
  useEffect(() => {
    const mockEvents: ReproductiveEvent[] = [
      {
        id: "1",
        animalId: "COW001",
        animalName: "Bessie",
        animalTag: "TAG-001",
        eventType: "pregnancy_check",
        eventDate: new Date("2025-07-01"),
        location: {
          lat: 17.9869,
          lng: -92.9303,
          address: "Establo Principal, Sector A",
          sector: "A",
        },
        veterinarian: "Dr. García",
        details: {
          gestationDays: 180,
          gestationStatus: "pregnant",
          expectedCalvingDate: new Date("2025-10-20"),
        },
        status: "completed",
        results: "Gestación de 180 días confirmada",
        cost: 150,
        notes: "Gestación progresando normalmente",
      },
      {
        id: "2",
        animalId: "COW002",
        animalName: "Luna",
        animalTag: "TAG-002",
        eventType: "heat_detection",
        eventDate: new Date("2025-06-25"),
        location: {
          lat: 17.9719,
          lng: -92.9456,
          address: "Pastizal Norte, Sector B",
          sector: "B",
        },
        veterinarian: "Dr. Martínez",
        details: {
          heatIntensity: "high",
          heatSigns: ["Monta otros animales", "Vulva inflamada"],
        },
        status: "completed",
        results: "Celo intenso detectado",
        cost: 0,
        notes: "Lista para servicio",
      },
      {
        id: "3",
        animalId: "COW002",
        animalName: "Luna",
        animalTag: "TAG-002",
        eventType: "insemination",
        eventDate: new Date("2025-06-27"),
        location: {
          lat: 17.9719,
          lng: -92.9456,
          address: "Corral de manejo, Sector B",
          sector: "B",
        },
        veterinarian: "Dr. Martínez",
        technician: "Carlos Ruiz",
        details: {
          semenBull: "Toro Elite 2024",
          semenBatch: "ELT-2024-067",
          inseminationMethod: "artificial",
        },
        status: "completed",
        results: "Inseminación artificial realizada exitosamente",
        cost: 75,
        notes: "IA realizada con semen de alta calidad",
      },
    ];

    setEvents(mockEvents);
  }, []);

  // ✅ FUNCIÓN PARA ELIMINAR EVENTO - CORREGIDA Y FUNCIONAL
  const handleDeleteEvent = (eventId: string) => {
    console.log("🗑️ Intentando eliminar evento con ID:", eventId);
    console.log("📋 Eventos actuales:", events.map(e => ({ id: e.id, name: e.animalName })));
    
    if (window.confirm("¿Estás seguro de que quieres eliminar este evento?")) {
      // Filtrar el evento específico
      const eventToDelete = events.find(event => event.id === eventId);
      console.log("🎯 Evento a eliminar:", eventToDelete?.animalName, eventToDelete?.eventType);
      
      const updatedEvents = events.filter(event => event.id !== eventId);
      
      console.log(`📊 Eventos antes: ${events.length}, después: ${updatedEvents.length}`);
      
      // Actualizar el estado inmediatamente
      setEvents(updatedEvents);
      
      console.log("✅ Estado actualizado, evento eliminado");
      
      // Mostrar confirmación
      alert(`✅ Evento eliminado: ${eventToDelete?.animalName} - ${eventToDelete?.eventType}`);
    } else {
      console.log("❌ Eliminación cancelada por el usuario");
    }
  };

  // Función para agregar nuevo evento
  const handleNewEvent = (eventData: Omit<ReproductiveEvent, "id">) => {
    const newEvent: ReproductiveEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    
    const updatedEvents = [newEvent, ...events];
    setEvents(updatedEvents);
    
    console.log(`✅ Evento agregado: ${newEvent.animalName} - ${newEvent.eventType}`);
    alert(`✅ Evento agregado correctamente. Ahora hay ${updatedEvents.length} eventos.`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Salud Reproductiva</h1>
              <p className="text-gray-600 mt-1">Manejo integral de la reproducción bovina</p>
            </div>
            <Button size="sm" onClick={() => setShowNewEventModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Evento
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Solo Eventos Reproductivos */}
        <Card className="bg-white/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Eventos Reproductivos ({events.length})
            </CardTitle>
            <CardDescription>Registro de eventos y procedimientos reproductivos</CardDescription>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos registrados</h3>
                <p className="text-gray-500 mb-4">Agrega el primer evento reproductivo</p>
                <Button onClick={() => setShowNewEventModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Primer Evento
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h4 className="text-xl font-semibold text-gray-900">
                            {event.animalName} ({event.animalTag})
                          </h4>
                          <Badge variant={event.eventType}>
                            {event.eventType === "heat_detection" ? "Detección Celo" :
                             event.eventType === "insemination" ? "Inseminación" :
                             event.eventType === "pregnancy_check" ? "Examen Gestación" :
                             event.eventType === "birth" ? "Parto" :
                             event.eventType === "weaning" ? "Destete" :
                             event.eventType === "synchronization" ? "Sincronización" : "Examen"}
                          </Badge>
                          <Badge variant={event.status}>
                            {event.status === "scheduled" ? "Programado" :
                             event.status === "completed" ? "Completado" :
                             event.status === "cancelled" ? "Cancelado" : "Pendiente"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                          <div>
                            <p className="text-gray-600">Fecha:</p>
                            <p className="font-medium">{event.eventDate.toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Veterinario:</p>
                            <p className="font-medium">{event.veterinarian}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Ubicación:</p>
                            <p className="font-medium">{event.location.address}</p>
                          </div>
                        </div>

                        {event.details.gestationStatus && (
                          <div className="bg-green-50 rounded-lg p-3 mb-3">
                            <h5 className="font-medium text-green-900 mb-2">Resultado del Examen</h5>
                            <div className="text-sm">
                              <p><strong>Estado:</strong> {
                                event.details.gestationStatus === "pregnant" ? "Gestante" :
                                event.details.gestationStatus === "open" ? "Vacía" : "Incierto"
                              }</p>
                              {event.details.gestationDays && (
                                <p><strong>Días de gestación:</strong> {event.details.gestationDays}</p>
                              )}
                              {event.details.expectedCalvingDate && (
                                <p><strong>Parto esperado:</strong> {event.details.expectedCalvingDate.toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>
                        )}

                        {event.details.semenBull && (
                          <div className="bg-blue-50 rounded-lg p-3 mb-3">
                            <h5 className="font-medium text-blue-900 mb-2">Detalles de Inseminación</h5>
                            <div className="text-sm">
                              <p><strong>Toro:</strong> {event.details.semenBull}</p>
                              <p><strong>Lote de semen:</strong> {event.details.semenBatch}</p>
                              <p><strong>Método:</strong> {
                                event.details.inseminationMethod === "artificial" ? "Artificial" : "Natural"
                              }</p>
                            </div>
                          </div>
                        )}

                        {event.details.heatSigns && event.details.heatSigns.length > 0 && (
                          <div className="mb-3">
                            <h5 className="font-medium text-gray-900 mb-2">Signos de Celo</h5>
                            <div className="flex flex-wrap gap-1">
                              {event.details.heatSigns.map((sign, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs"
                                >
                                  {sign}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {event.results && (
                          <div className="text-sm text-gray-700 mb-3">
                            <strong>Resultados:</strong> {event.results}
                          </div>
                        )}

                        <div className="text-sm text-gray-600 mt-3">
                          <strong>Costo:</strong> ${event.cost}
                          {event.notes && <p><strong>Notas:</strong> {event.notes}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => alert(`Ver evento: ${event.animalName} - ${event.eventType}`)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => alert(`Editar evento: ${event.animalName} - ${event.eventType}`)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => {
                            console.log("🔴 CLICK en botón eliminar");
                            console.log("🔍 Evento seleccionado:", { 
                              id: event.id, 
                              name: event.animalName, 
                              type: event.eventType 
                            });
                            handleDeleteEvent(event.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal */}
      <NewEventModal
        isOpen={showNewEventModal}
        onClose={() => setShowNewEventModal(false)}
        onSave={(eventData) => handleNewEvent(eventData)}
      />
    </div>
  );
};

export default ReproductiveHealth;