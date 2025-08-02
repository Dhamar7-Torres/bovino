import React, { useState, useEffect, useCallback } from "react";

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

// Componentes básicos simplificados
const Button = ({ 
  children, 
  onClick, 
  variant = "default", 
  size = "default", 
  className = "", 
  disabled = false,
  title 
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: "default" | "outline" | "success" | "danger" | "warning";
  size?: "sm" | "default";
  className?: string;
  disabled?: boolean;
  title?: string;
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500",
  };
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    default: "px-4 py-2 text-sm",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={(e) => onClick?.(e)}
      disabled={disabled}
      title={title}
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

// Modal para Ver Detalles de Evento
const ViewEventModal = ({ 
  isOpen, 
  onClose, 
  event 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  event: ReproductiveEvent | null;
}) => {
  if (!isOpen || !event) return null;

  const getEventTypeLabel = (type: string) => {
    const labels = {
      heat_detection: "Detección de Celo",
      insemination: "Inseminación",
      pregnancy_check: "Examen de Gestación",
      birth: "Parto",
      weaning: "Destete",
      synchronization: "Sincronización",
      embryo_transfer: "Transferencia de Embriones",
      examination: "Examen"
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      scheduled: "Programado",
      completed: "Completado",
      cancelled: "Cancelado",
      pending: "Pendiente"
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              👁️ Detalles del Evento Reproductivo
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Información básica */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Animal</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre:</p>
                  <p className="font-medium text-gray-900">{event.animalName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Etiqueta:</p>
                  <p className="font-medium text-gray-900">{event.animalTag}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">ID Animal:</p>
                  <p className="font-medium text-gray-900">{event.animalId}</p>
                </div>
              </div>
            </div>

            {/* Información del evento */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Detalles del Evento</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tipo de Evento:</p>
                  <p className="font-medium text-gray-900">{getEventTypeLabel(event.eventType)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha:</p>
                  <p className="font-medium text-gray-900">{event.eventDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado:</p>
                  <Badge variant={event.status}>{getStatusLabel(event.status)}</Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Costo:</p>
                  <p className="font-medium text-gray-900">${event.cost}</p>
                </div>
              </div>
            </div>

            {/* Personal */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Veterinario:</p>
                  <p className="font-medium text-gray-900">{event.veterinarian}</p>
                </div>
                {event.technician && (
                  <div>
                    <p className="text-sm text-gray-600">Técnico:</p>
                    <p className="font-medium text-gray-900">{event.technician}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Ubicación */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Ubicación</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Dirección:</p>
                  <p className="font-medium text-gray-900">{event.location.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Sector:</p>
                  <p className="font-medium text-gray-900">{event.location.sector}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Coordenadas:</p>
                  <p className="font-medium text-gray-900">{event.location.lat.toFixed(4)}, {event.location.lng.toFixed(4)}</p>
                </div>
              </div>
            </div>

            {/* Detalles específicos del evento */}
            {Object.keys(event.details).filter(key => event.details[key as keyof typeof event.details] !== undefined).length > 0 && (
              <div className="bg-teal-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Detalles Específicos</h3>
                <div className="space-y-3">
                  {event.details.heatIntensity && (
                    <div>
                      <p className="text-sm text-gray-600">Intensidad del Celo:</p>
                      <p className="font-medium text-gray-900 capitalize">{event.details.heatIntensity}</p>
                    </div>
                  )}
                  
                  {event.details.heatSigns && event.details.heatSigns.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Signos de Celo:</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {event.details.heatSigns.map((sign, idx) => (
                          <span key={idx} className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs">
                            {sign}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {event.details.semenBull && (
                    <div>
                      <p className="text-sm text-gray-600">Toro:</p>
                      <p className="font-medium text-gray-900">{event.details.semenBull}</p>
                    </div>
                  )}

                  {event.details.semenBatch && (
                    <div>
                      <p className="text-sm text-gray-600">Lote de Semen:</p>
                      <p className="font-medium text-gray-900">{event.details.semenBatch}</p>
                    </div>
                  )}

                  {event.details.inseminationMethod && (
                    <div>
                      <p className="text-sm text-gray-600">Método de Inseminación:</p>
                      <p className="font-medium text-gray-900 capitalize">{event.details.inseminationMethod}</p>
                    </div>
                  )}

                  {event.details.gestationStatus && (
                    <div>
                      <p className="text-sm text-gray-600">Estado de Gestación:</p>
                      <p className="font-medium text-gray-900 capitalize">{event.details.gestationStatus}</p>
                    </div>
                  )}

                  {event.details.gestationDays && (
                    <div>
                      <p className="text-sm text-gray-600">Días de Gestación:</p>
                      <p className="font-medium text-gray-900">{event.details.gestationDays} días</p>
                    </div>
                  )}

                  {event.details.expectedCalvingDate && (
                    <div>
                      <p className="text-sm text-gray-600">Fecha Esperada de Parto:</p>
                      <p className="font-medium text-gray-900">{event.details.expectedCalvingDate.toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Resultados y notas */}
            {(event.results || event.notes) && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Observaciones</h3>
                {event.results && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600">Resultados:</p>
                    <p className="font-medium text-gray-900">{event.results}</p>
                  </div>
                )}
                {event.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notas:</p>
                    <p className="font-medium text-gray-900">{event.notes}</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end">
              <Button variant="outline" onClick={onClose}>Cerrar</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal para Editar Evento (simplificado)
const EditEventModal = ({ 
  isOpen, 
  onClose, 
  event,
  onSave 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  event: ReproductiveEvent | null;
  onSave: (updatedEvent: ReproductiveEvent) => void; 
}) => {
  const [formData, setFormData] = useState({
    animalName: "",
    animalTag: "",
    eventType: "heat_detection" as ReproductiveEvent["eventType"],
    eventDate: "",
    veterinarian: "",
    technician: "",
    address: "",
    sector: "",
    cost: 0,
    notes: "",
    results: "",
    status: "completed" as ReproductiveEvent["status"],
  });

  // Cargar datos del evento cuando se abre el modal
  useEffect(() => {
    if (event && isOpen) {
      setFormData({
        animalName: event.animalName,
        animalTag: event.animalTag,
        eventType: event.eventType,
        eventDate: event.eventDate.toISOString().split("T")[0],
        veterinarian: event.veterinarian,
        technician: event.technician || "",
        address: event.location.address,
        sector: event.location.sector,
        cost: event.cost,
        notes: event.notes,
        results: event.results || "",
        status: event.status,
      });
    }
  }, [event, isOpen]);

  const handleSubmit = () => {
    if (!event) return;

    if (!formData.animalName.trim() || !formData.animalTag.trim() || !formData.veterinarian.trim()) {
      alert("Por favor completa los campos obligatorios: nombre del animal, etiqueta y veterinario");
      return;
    }

    const updatedEvent: ReproductiveEvent = {
      ...event,
      animalName: formData.animalName,
      animalTag: formData.animalTag,
      eventType: formData.eventType,
      eventDate: new Date(formData.eventDate),
      veterinarian: formData.veterinarian,
      technician: formData.technician || undefined,
      location: {
        ...event.location,
        address: formData.address,
        sector: formData.sector,
      },
      status: formData.status,
      results: formData.results,
      cost: formData.cost,
      notes: formData.notes,
    };

    onSave(updatedEvent);
    onClose();
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              ✏️ Editar Evento Reproductivo
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Animal *</label>
                <input
                  type="text"
                  value={formData.animalName}
                  onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Bessie, Luna, Margarita"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta/Tag *</label>
                <input
                  type="text"
                  value={formData.animalTag}
                  onChange={(e) => setFormData(prev => ({ ...prev, animalTag: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: TAG-001, COW-123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento *</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as ReproductiveEvent["eventType"] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario *</label>
                <input
                  type="text"
                  value={formData.veterinarian}
                  onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre del veterinario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Costo ($)</label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ReproductiveEvent["status"] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="completed">Completado</option>
                <option value="scheduled">Programado</option>
                <option value="pending">Pendiente</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Observaciones adicionales..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleSubmit}>
                💾 Guardar Cambios
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Modal para Nuevo Evento (simplificado)
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
      details: {},
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
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Nuevo Evento Reproductivo</h2>
            <button onClick={() => onClose()} className="text-gray-400 hover:text-gray-600">
              ✕
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Animal *</label>
                <input
                  type="text"
                  value={formData.animalName}
                  onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Bessie, Luna, Margarita"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Etiqueta/Tag *</label>
                <input
                  type="text"
                  value={formData.animalTag}
                  onChange={(e) => setFormData(prev => ({ ...prev, animalTag: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: TAG-001, COW-123"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento *</label>
                <select
                  value={formData.eventType}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventType: e.target.value as ReproductiveEvent["eventType"] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, eventDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Veterinario *</label>
                <input
                  type="text"
                  value={formData.veterinarian}
                  onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nombre del veterinario"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sector</label>
                <input
                  type="text"
                  value={formData.sector}
                  onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="A, B, C..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ReproductiveEvent["status"] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="completed">Completado</option>
                  <option value="scheduled">Programado</option>
                  <option value="pending">Pendiente</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Costo ($)</label>
                <input
                  type="number"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Observaciones adicionales..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => onClose()}>Cancelar</Button>
              <Button onClick={() => handleSubmit()}>
                💾 Guardar Evento
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal ajustado al layout
const ReproductiveHealth = () => {
  const [events, setEvents] = useState<ReproductiveEvent[]>([]);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ReproductiveEvent | null>(null);
  
  // Estados para modal de eliminación
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<ReproductiveEvent | null>(null);

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

  // Funciones de eliminación
  const handleDeleteClick = useCallback((event: ReproductiveEvent) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (!eventToDelete) return;

    setEvents(prev => prev.filter(e => e.id !== eventToDelete.id));
    
    if (selectedEvent?.id === eventToDelete.id) {
      setSelectedEvent(null);
      setShowViewModal(false);
      setShowEditModal(false);
    }
    
    setShowDeleteModal(false);
    setEventToDelete(null);
    
    alert(`✅ Evento eliminado: ${eventToDelete.animalName} - ${eventToDelete.eventType}`);
  }, [eventToDelete, selectedEvent]);

  // Función para ver evento
  const handleViewEvent = (event: ReproductiveEvent) => {
    setSelectedEvent(event);
    setShowViewModal(true);
  };

  // Función para editar evento
  const handleEditEvent = (event: ReproductiveEvent) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  // Función para guardar evento editado
  const handleSaveEditedEvent = (updatedEvent: ReproductiveEvent) => {
    const updatedEvents = events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    );
    setEvents(updatedEvents);
    alert("✅ Evento actualizado correctamente");
  };

  // Función para agregar nuevo evento
  const handleNewEvent = (eventData: Omit<ReproductiveEvent, "id">) => {
    const newEvent: ReproductiveEvent = {
      ...eventData,
      id: Date.now().toString(),
    };
    
    const updatedEvents = [newEvent, ...events];
    setEvents(updatedEvents);
    
    alert(`✅ Evento agregado correctamente. Ahora hay ${updatedEvents.length} eventos.`);
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header ajustado al layout */}
      <div className="bg-white/90 border-b border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🐄 Salud Reproductiva</h1>
            <p className="text-gray-600 mt-1">Manejo integral de la reproducción bovina</p>
          </div>
          <Button size="sm" onClick={() => setShowNewEventModal(true)}>
            ➕ Nuevo Evento
          </Button>
        </div>
      </div>

      {/* Contenido principal con scroll contenido */}
      <div className="px-4 pb-4 h-full overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Eventos Reproductivos */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                📅 Eventos Reproductivos ({events.length})
              </h3>
              <p className="text-sm text-gray-600 mt-1">Registro de eventos y procedimientos reproductivos</p>
            </div>
            <div className="px-4 py-3">
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos registrados</h3>
                  <p className="text-gray-600 mb-4">Agrega el primer evento reproductivo</p>
                  <Button onClick={() => setShowNewEventModal(true)}>
                    ➕ Agregar Primer Evento
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-sm hover:bg-white transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-lg font-semibold text-gray-900">
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

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                              <p className="text-gray-600">Fecha:</p>
                              <p className="font-medium text-gray-900">{event.eventDate.toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Veterinario:</p>
                              <p className="font-medium text-gray-900">{event.veterinarian}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Costo:</p>
                              <p className="font-medium text-gray-900">${event.cost}</p>
                            </div>
                          </div>

                          {event.results && (
                            <div className="text-sm text-gray-700 mb-2">
                              <strong>Resultados:</strong> {event.results}
                            </div>
                          )}

                          {event.notes && (
                            <div className="text-sm text-gray-600">
                              <strong>Notas:</strong> {event.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewEvent(event)}
                            title="Ver detalles"
                          >
                            👁️
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditEvent(event)}
                            title="Editar evento"
                          >
                            ✏️
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteClick(event)}
                            title="Eliminar evento"
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modales */}
      <NewEventModal
        isOpen={showNewEventModal}
        onClose={() => setShowNewEventModal(false)}
        onSave={handleNewEvent}
      />

      <ViewEventModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        event={selectedEvent}
      />

      <EditEventModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        event={selectedEvent}
        onSave={handleSaveEditedEvent}
      />

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && eventToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center gap-4 p-6 border-b">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-2xl">
                ⚠️
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Eliminar Evento Reproductivo
                </h3>
                <p className="text-sm text-gray-600">
                  Esta acción no se puede deshacer
                </p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-gray-700 mb-4">
                ¿Estás seguro de que deseas eliminar el evento reproductivo de{" "}
                <strong>{eventToDelete.animalName}</strong> (Tag: <strong>{eventToDelete.animalTag}</strong>)?
                <br />
                <br />
                <span className="text-sm text-gray-600">
                  Fecha: {eventToDelete.eventDate.toLocaleDateString()}
                  <br />
                  Veterinario: {eventToDelete.veterinarian}
                </span>
              </p>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setEventToDelete(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
              >
                <span>🗑️ Eliminar</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReproductiveHealth;