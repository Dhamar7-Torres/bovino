import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  Plus,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  Activity,
  Award,
  MapPin,
  X,
  Save,
  Calendar,
  AlertTriangle,
} from "lucide-react";

// Interface simplificada
interface MatingRecord {
  id: string;
  bullName: string;
  bullEarTag: string;
  cowName: string;
  cowEarTag: string;
  matingDate: string;
  matingTime: string;
  location: string;
  status: "scheduled" | "completed" | "failed";
  result?: "successful" | "unsuccessful" | "pending";
  cost: number;
  notes: string;
  createdAt: string;
}

const MatingRecords: React.FC = () => {
  const [records, setRecords] = useState<MatingRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  // Estados para modales y formularios
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<MatingRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<MatingRecord | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<MatingRecord | null>(null);
  
  // Estados para formulario
  const [formData, setFormData] = useState<Partial<MatingRecord>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Estados para geolocalización
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);

  // Datos de ejemplo ultra simples - FECHAS CORREGIDAS
  const mockRecords: MatingRecord[] = [
    {
      id: "1",
      bullName: "Campeón",
      bullEarTag: "T-001",
      cowName: "Bella",
      cowEarTag: "MX-001",
      matingDate: "2025-07-15",
      matingTime: "07:30",
      location: "Potrero Norte",
      status: "completed",
      result: "successful",
      cost: 800,
      notes: "Apareamiento exitoso",
      createdAt: "2025-07-15T07:30:00.000Z",
    },
    {
      id: "2",
      bullName: "Emperador",
      bullEarTag: "T-002",
      cowName: "Luna",
      cowEarTag: "MX-002",
      matingDate: "2025-07-16",
      matingTime: "08:15",
      location: "Potrero Sur",
      status: "completed",
      result: "pending",
      cost: 1200,
      notes: "Pendiente de confirmación",
      createdAt: "2025-07-16T08:15:00.000Z",
    },
    {
      id: "3",
      bullName: "Titán",
      bullEarTag: "T-003",
      cowName: "Esperanza",
      cowEarTag: "MX-003",
      matingDate: "2025-07-18",
      matingTime: "09:00",
      location: "Potrero Central",
      status: "scheduled",
      result: "pending",
      cost: 1000,
      notes: "Programado para mañana",
      createdAt: "2025-07-17T10:00:00.000Z",
    },
  ];

  // Cargar datos
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // Simular carga
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setRecords(mockRecords);
        console.log("✅ Datos cargados correctamente:", mockRecords);
      } catch (err) {
        console.error("❌ Error cargando datos:", err);
        setError("Error al cargar los registros");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // FUNCIONES CRUD CORREGIDAS

  // Validar formulario
  const validateForm = (data: Partial<MatingRecord>): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!data.bullName?.trim()) {
      errors.bullName = "El nombre del toro es obligatorio";
    }
    if (!data.bullEarTag?.trim()) {
      errors.bullEarTag = "El arete del toro es obligatorio";
    }
    if (!data.cowName?.trim()) {
      errors.cowName = "El nombre de la vaca es obligatorio";
    }
    if (!data.cowEarTag?.trim()) {
      errors.cowEarTag = "El arete de la vaca es obligatorio";
    }
    if (!data.matingDate) {
      errors.matingDate = "La fecha es obligatoria";
    }
    if (!data.matingTime) {
      errors.matingTime = "La hora es obligatoria";
    }
    if (!data.location?.trim()) {
      errors.location = "La ubicación es obligatoria";
    }
    if (!data.cost || data.cost <= 0) {
      errors.cost = "El costo debe ser mayor a 0";
    }

    return errors;
  };

  // Resetear formulario - SIMPLIFICADO
  const resetForm = () => {
    const now = new Date();
    const today = now.toISOString().substr(0, 10); // YYYY-MM-DD
    const currentTime = now.toTimeString().substr(0, 5); // HH:MM
    
    setFormData({
      bullName: "",
      bullEarTag: "",
      cowName: "",
      cowEarTag: "",
      matingDate: today,
      matingTime: currentTime,
      location: "",
      status: "scheduled",
      result: "pending",
      cost: 0,
      notes: "",
    });
    setFormErrors({});
  };

  // Obtener ubicación actual - SIMPLIFICADO
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        setFormData(prev => ({ 
          ...prev, 
          location: locationString
        }));
        setIsGettingLocation(false);
        alert(`✅ Ubicación obtenida: ${locationString}`);
      },
      (error) => {
        setIsGettingLocation(false);
        let message = "Error obteniendo ubicación: ";
        
        if (error.code === 1) message += "Permiso denegado";
        else if (error.code === 2) message += "Ubicación no disponible"; 
        else if (error.code === 3) message += "Tiempo agotado";
        else message += "Error desconocido";
        
        alert(message);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 5000, 
        maximumAge: 0 
      }
    );
  };

  // Crear nuevo registro
  const handleCreate = () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const newRecord: MatingRecord = {
      id: `mating-${Date.now()}`,
      bullName: formData.bullName!,
      bullEarTag: formData.bullEarTag!,
      cowName: formData.cowName!,
      cowEarTag: formData.cowEarTag!,
      matingDate: formData.matingDate!,
      matingTime: formData.matingTime!,
      location: formData.location!,
      status: formData.status as "scheduled" | "completed" | "failed" || "scheduled",
      result: formData.result as "successful" | "unsuccessful" | "pending",
      cost: formData.cost!,
      notes: formData.notes || "",
      createdAt: new Date().toISOString(),
    };

    setRecords(prev => [newRecord, ...prev]);
    setShowForm(false);
    resetForm();
    alert("✅ Registro de apareamiento creado exitosamente");
  };

  // Actualizar registro existente
  const handleUpdate = () => {
    if (!editingRecord) return;

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setRecords(prev => prev.map(record => 
      record.id === editingRecord.id 
        ? { ...record, ...formData }
        : record
    ));
    
    setEditingRecord(null);
    setShowForm(false);
    resetForm();
    alert("✅ Registro actualizado exitosamente");
  };

  // Ver detalles
  const handleView = (record: MatingRecord) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  // Editar registro
  const handleEdit = (record: MatingRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowForm(true);
  };

  // FUNCIÓN ELIMINAR CORREGIDA - Usando modal de confirmación
  const handleDeleteClick = useCallback((record: MatingRecord) => {
    console.log("🔴 CLICK en botón eliminar para:", record.id, record.bullName);
    setRecordToDelete(record);
    setShowDeleteModal(true);
  }, []);

  // Confirmar eliminación - NUEVA FUNCIÓN
  const confirmDelete = useCallback(() => {
    if (!recordToDelete) return;

    console.log("🗑️ Eliminando registro:", recordToDelete.id);
    
    setRecords(prev => {
      const newRecords = prev.filter(r => r.id !== recordToDelete.id);
      console.log("📝 Registros actualizados:", newRecords.length, "registros restantes");
      return newRecords;
    });
    
    // Cerrar modales si están abiertos
    if (selectedRecord?.id === recordToDelete.id) {
      setSelectedRecord(null);
      setShowDetailsModal(false);
    }
    if (editingRecord?.id === recordToDelete.id) {
      setEditingRecord(null);
      setShowForm(false);
    }
    
    // Cerrar modal de confirmación
    setShowDeleteModal(false);
    setRecordToDelete(null);
    
    console.log("✅ Registro eliminado correctamente");
  }, [recordToDelete, selectedRecord, editingRecord]);

  // Nuevo registro
  const handleNew = () => {
    setEditingRecord(null);
    resetForm();
    setShowForm(true);
  };

  // Funciones auxiliares
  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-yellow-100 text-yellow-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || colors.scheduled;
  };

  const getStatusText = (status: string) => {
    const texts = {
      scheduled: "Programado",
      completed: "Completado",
      failed: "Fallido",
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getResultColor = (result?: string) => {
    const colors = {
      successful: "bg-green-100 text-green-800",
      unsuccessful: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
    };
    return colors[result as keyof typeof colors] || colors.pending;
  };

  const getResultText = (result?: string) => {
    const texts = {
      successful: "Exitoso",
      unsuccessful: "Fallido",
      pending: "Pendiente",
    };
    return texts[result as keyof typeof texts] || "Pendiente";
  };

  // Función para formatear fechas - CORREGIDO
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T12:00:00'); // Medio día para evitar problemas de zona
    return date.toLocaleDateString('es-MX');
  };

  // Función para formatear fecha completa - CORREGIDO
  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString + 'T12:00:00'); // Medio día para evitar problemas de zona
    return date.toLocaleDateString('es-MX', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  // Debug: Log del componente
  console.log("🔄 MatingRecords renderizado - Estado:", {
    isLoading,
    recordsCount: records.length,
    error
  });

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#519a7c]"></div>
            <p className="text-gray-600">Cargando registros...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-lg">
          <p className="text-red-600">❌ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Recargar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Simple */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#519a7c] rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Registros de Apareamiento
                </h1>
                <p className="text-gray-600">
                  Sistema de gestión reproductiva
                </p>
              </div>
            </div>
            <button 
              onClick={handleNew}
              className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo</span>
            </button>
          </div>

          {/* Estadísticas simples */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{records.length}</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Completados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {records.filter(r => r.status === "completed").length}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Programados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {records.filter(r => r.status === "scheduled").length}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Exitosos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {records.filter(r => r.result === "successful").length}
                  </p>
                </div>
                <Award className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Lista de registros */}
        {records.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No hay registros
            </h3>
            <p className="text-gray-600 mb-6">
              Aún no se han registrado apareamientos
            </p>
            <button 
              onClick={handleNew}
              className="px-6 py-3 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 mx-auto transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Crear Primer Registro</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map((record) => (
              <motion.div
                key={record.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                whileHover={{ y: -2 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header de la tarjeta */}
                <div className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] p-4 text-white">
                  <h3 className="font-bold text-lg">
                    {record.bullName} × {record.cowName}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {record.bullEarTag} × {record.cowEarTag}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                      {getStatusText(record.status)}
                    </span>
                    {record.result && (
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getResultColor(record.result)}`}>
                        {getResultText(record.result)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-600">Fecha:</p>
                      <p className="font-medium">
                        {formatDate(record.matingDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Hora:</p>
                      <p className="font-medium">{record.matingTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{record.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-[#519a7c]">
                      ${record.cost.toLocaleString()}
                    </span>
                  </div>

                  {record.notes && (
                    <div className="bg-gray-50 rounded p-2">
                      <p className="text-sm text-gray-700 line-clamp-2">{record.notes}</p>
                    </div>
                  )}
                </div>

                {/* Acciones - CORREGIDAS */}
                <div className="bg-gray-50 px-4 py-3 flex justify-between">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleView(record)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(record)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(record)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatDate(record.createdAt.split('T')[0])}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal de formulario */}
        <AnimatePresence>
          {showForm && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {/* Header del modal */}
                <div className="flex justify-between items-center p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingRecord ? "Editar Apareamiento" : "Nuevo Apareamiento"}
                  </h2>
                  <button 
                    onClick={() => setShowForm(false)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Contenido del formulario */}
                <div className="p-6 space-y-4">
                  {/* Información del Toro */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Toro *
                      </label>
                      <input
                        type="text"
                        value={formData.bullName || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, bullName: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.bullName ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Ej: Campeón"
                      />
                      {formErrors.bullName && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.bullName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Arete del Toro *
                      </label>
                      <input
                        type="text"
                        value={formData.bullEarTag || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, bullEarTag: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.bullEarTag ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Ej: T-001"
                      />
                      {formErrors.bullEarTag && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.bullEarTag}</p>
                      )}
                    </div>
                  </div>

                  {/* Información de la Vaca */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de la Vaca *
                      </label>
                      <input
                        type="text"
                        value={formData.cowName || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, cowName: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.cowName ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Ej: Bella"
                      />
                      {formErrors.cowName && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.cowName}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Arete de la Vaca *
                      </label>
                      <input
                        type="text"
                        value={formData.cowEarTag || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, cowEarTag: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.cowEarTag ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Ej: MX-001"
                      />
                      {formErrors.cowEarTag && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.cowEarTag}</p>
                      )}
                    </div>
                  </div>

                  {/* Fecha y Hora */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha *
                      </label>
                      <input
                        type="date"
                        value={formData.matingDate || new Date().toISOString().substr(0, 10)}
                        onChange={(e) => setFormData(prev => ({ ...prev, matingDate: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.matingDate ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {formErrors.matingDate && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.matingDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Hora *
                      </label>
                      <input
                        type="time"
                        value={formData.matingTime || new Date().toTimeString().substr(0, 5)}
                        onChange={(e) => setFormData(prev => ({ ...prev, matingTime: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.matingTime ? "border-red-300" : "border-gray-300"
                        }`}
                      />
                      {formErrors.matingTime && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.matingTime}</p>
                      )}
                    </div>
                  </div>

                  {/* Ubicación y Costo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ubicación *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={formData.location || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                          className={`flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                            formErrors.location ? "border-red-300" : "border-gray-300"
                          }`}
                          placeholder="Ej: Potrero Norte"
                        />
                        <button
                          type="button"
                          onClick={getCurrentLocation}
                          disabled={isGettingLocation}
                          className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors flex items-center space-x-1 text-sm"
                          title="Usar mi ubicación actual"
                        >
                          {isGettingLocation ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              <span>GPS</span>
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3 h-3" />
                              <span>GPS</span>
                            </>
                          )}
                        </button>
                      </div>
                      {formErrors.location && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Costo *
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.cost || ""}
                        onChange={(e) => setFormData(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent ${
                          formErrors.cost ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="0.00"
                      />
                      {formErrors.cost && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.cost}</p>
                      )}
                    </div>
                  </div>

                  {/* Estado y Resultado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado
                      </label>
                      <select
                        value={formData.status || "scheduled"}
                        onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      >
                        <option value="scheduled">Programado</option>
                        <option value="completed">Completado</option>
                        <option value="failed">Fallido</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resultado
                      </label>
                      <select
                        value={formData.result || "pending"}
                        onChange={(e) => setFormData(prev => ({ ...prev, result: e.target.value as any }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      >
                        <option value="pending">Pendiente</option>
                        <option value="successful">Exitoso</option>
                        <option value="unsuccessful">Fallido</option>
                      </select>
                    </div>
                  </div>

                  {/* Notas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas
                    </label>
                    <textarea
                      value={formData.notes || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      placeholder="Observaciones adicionales..."
                    />
                  </div>
                </div>

                {/* Footer del modal */}
                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                  <button
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={editingRecord ? handleUpdate : handleCreate}
                    className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingRecord ? "Actualizar" : "Guardar"}</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal de detalles */}
        <AnimatePresence>
          {showDetailsModal && selectedRecord && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {/* Header del modal */}
                <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white">
                  <h2 className="text-xl font-bold">
                    Detalles del Apareamiento
                  </h2>
                  <button 
                    onClick={() => setShowDetailsModal(false)}
                    className="p-2 hover:bg-white/20 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Contenido del modal */}
                <div className="p-6 space-y-6">
                  {/* Información principal */}
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedRecord.bullName} × {selectedRecord.cowName}
                    </h3>
                    <p className="text-gray-600">
                      {selectedRecord.bullEarTag} × {selectedRecord.cowEarTag}
                    </p>
                    <div className="flex justify-center space-x-4 mt-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRecord.status)}`}>
                        {getStatusText(selectedRecord.status)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getResultColor(selectedRecord.result)}`}>
                        {getResultText(selectedRecord.result)}
                      </span>
                    </div>
                  </div>

                  {/* Detalles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <Calendar className="w-5 h-5 mr-2 text-[#519a7c]" />
                        Información Temporal
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div>
                          <span className="text-gray-600">Fecha:</span>
                          <span className="ml-2 font-medium">
                            {formatFullDate(selectedRecord.matingDate)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Hora:</span>
                          <span className="ml-2 font-medium">{selectedRecord.matingTime}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Creado:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(selectedRecord.createdAt.split('T')[0])}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-900 flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-[#519a7c]" />
                        Ubicación y Costo
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div>
                          <span className="text-gray-600">Ubicación:</span>
                          <span className="ml-2 font-medium">{selectedRecord.location}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Costo:</span>
                          <span className="ml-2 font-bold text-[#519a7c] text-lg">
                            ${selectedRecord.cost.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notas */}
                  {selectedRecord.notes && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Notas</h4>
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p className="text-gray-700">{selectedRecord.notes}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer del modal */}
                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cerrar
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleEdit(selectedRecord);
                    }}
                    className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN - NUEVO */}
        <AnimatePresence>
          {showDeleteModal && recordToDelete && (
            <motion.div 
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="bg-white rounded-lg w-full max-w-md"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {/* Header del modal */}
                <div className="flex items-center gap-4 p-6 border-b">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Eliminar Apareamiento
                    </h3>
                    <p className="text-sm text-gray-600">
                      Esta acción no se puede deshacer
                    </p>
                  </div>
                </div>

                {/* Contenido del modal */}
                <div className="p-6">
                  <p className="text-gray-700 mb-6">
                    ¿Estás seguro de que deseas eliminar el apareamiento entre{" "}
                    <strong>{recordToDelete.bullName}</strong> y{" "}
                    <strong>{recordToDelete.cowName}</strong>?
                    <br />
                    <br />
                    Toda la información del registro se perderá permanentemente.
                  </p>
                </div>

                {/* Footer del modal */}
                <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setRecordToDelete(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Eliminar</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MatingRecords;