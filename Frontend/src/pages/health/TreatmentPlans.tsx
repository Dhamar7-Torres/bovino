import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clipboard,
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
  RefreshCw,
} from "lucide-react";

// Interface para el plan de tratamiento
interface TreatmentPlan {
  id: string;
  bullName: string;
  bullEarTag: string;
  cowName: string;
  cowEarTag: string;
  treatmentDate: string;
  treatmentTime: string;
  location: string;
  status: "scheduled" | "completed" | "failed";
  result?: "successful" | "unsuccessful" | "pending";
  cost: number;
  notes: string;
  createdAt: string;
}

// Configuración de la API
const API_BASE_URL = 'http://localhost:5000/api';

// Clase para manejar las llamadas a la API
class TreatmentPlansAPI {
  static async getAllTreatmentPlans(): Promise<TreatmentPlan[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/health/treatment-plans`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data || [];
      } else {
        throw new Error(data.message || 'Error al obtener planes de tratamiento');
      }
    } catch (error) {
      console.error('Error fetching treatment plans:', error);
      throw error;
    }
  }

  static async createTreatmentPlan(planData: Omit<TreatmentPlan, 'id' | 'createdAt'>): Promise<TreatmentPlan> {
    try {
      const response = await fetch(`${API_BASE_URL}/health/treatment-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al crear plan de tratamiento');
      }
    } catch (error) {
      console.error('Error creating treatment plan:', error);
      throw error;
    }
  }

  static async updateTreatmentPlan(id: string, planData: Partial<TreatmentPlan>): Promise<TreatmentPlan> {
    try {
      const response = await fetch(`${API_BASE_URL}/health/treatment-plans/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al actualizar plan de tratamiento');
      }
    } catch (error) {
      console.error('Error updating treatment plan:', error);
      throw error;
    }
  }

  static async deleteTreatmentPlan(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/health/treatment-plans/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al eliminar plan de tratamiento');
      }
    } catch (error) {
      console.error('Error deleting treatment plan:', error);
      throw error;
    }
  }

  static async getTreatmentPlanById(id: string): Promise<TreatmentPlan> {
    try {
      const response = await fetch(`${API_BASE_URL}/health/treatment-plans/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        return data.data;
      } else {
        throw new Error(data.message || 'Error al obtener plan de tratamiento');
      }
    } catch (error) {
      console.error('Error fetching treatment plan:', error);
      throw error;
    }
  }
}

const TreatmentPlans: React.FC = () => {
  const [records, setRecords] = useState<TreatmentPlan[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Estados para modales y formularios
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<TreatmentPlan | null>(null);
  const [editingRecord, setEditingRecord] = useState<TreatmentPlan | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<TreatmentPlan | null>(null);
  
  // Estados para formulario
  const [formData, setFormData] = useState<Partial<TreatmentPlan>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Función para cargar datos desde el backend
  const loadTreatmentPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const data = await TreatmentPlansAPI.getAllTreatmentPlans();
      setRecords(data);
      
    } catch (err: any) {
      const errorMessage = err.message || "Error al conectar con el servidor";
      setError(errorMessage);
      console.error("Error loading treatment plans:", err);
      
      // Si es un error de conexión, mostrar mensaje específico
      if (errorMessage.includes('fetch')) {
        setError("No se puede conectar con el servidor. Verifique que el backend esté ejecutándose en el puerto 5000.");
      }
      
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadTreatmentPlans();
  }, [loadTreatmentPlans]);

  // Validar formulario
  const validateForm = (data: Partial<TreatmentPlan>): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!data.bullName?.trim()) errors.bullName = "El nombre del animal es obligatorio";
    if (!data.bullEarTag?.trim()) errors.bullEarTag = "El arete es obligatorio";
    if (!data.cowName?.trim()) errors.cowName = "La condición es obligatoria";
    if (!data.cowEarTag?.trim()) errors.cowEarTag = "El veterinario es obligatorio";
    if (!data.treatmentDate) errors.treatmentDate = "La fecha es obligatoria";
    if (!data.treatmentTime) errors.treatmentTime = "La hora es obligatoria";
    if (!data.location?.trim()) errors.location = "La ubicación es obligatoria";
    if (!data.cost || data.cost <= 0) errors.cost = "El costo debe ser mayor a 0";
    return errors;
  };

  // Resetear formulario
  const resetForm = () => {
    const now = new Date();
    const today = now.toISOString().substr(0, 10);
    const currentTime = now.toTimeString().substr(0, 5);
    
    setFormData({
      bullName: "",
      bullEarTag: "",
      cowName: "",
      cowEarTag: "",
      treatmentDate: today,
      treatmentTime: currentTime,
      location: "",
      status: "scheduled",
      result: "pending",
      cost: 0,
      notes: "",
    });
    setFormErrors({});
  };

  // Crear nuevo registro
  const handleCreate = async () => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const planData = {
        bullName: formData.bullName!,
        bullEarTag: formData.bullEarTag!,
        cowName: formData.cowName!,
        cowEarTag: formData.cowEarTag!,
        treatmentDate: formData.treatmentDate!,
        treatmentTime: formData.treatmentTime!,
        location: formData.location!,
        status: formData.status as "scheduled" | "completed" | "failed" || "scheduled",
        result: formData.result as "successful" | "unsuccessful" | "pending",
        cost: formData.cost!,
        notes: formData.notes || "",
      };

      const newRecord = await TreatmentPlansAPI.createTreatmentPlan(planData);
      
      // Actualizar la lista local
      setRecords(prev => [newRecord, ...prev]);
      
      setShowForm(false);
      resetForm();
      alert("✅ Plan de tratamiento creado exitosamente");
      
    } catch (error: any) {
      setError(error.message || "Error al crear el plan de tratamiento");
      alert("❌ Error al crear el plan de tratamiento: " + (error.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Actualizar registro existente
  const handleUpdate = async () => {
    if (!editingRecord) return;
    
    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const updatedRecord = await TreatmentPlansAPI.updateTreatmentPlan(editingRecord.id, formData);
      
      // Actualizar la lista local
      setRecords(prev => prev.map(record => 
        record.id === editingRecord.id ? updatedRecord : record
      ));
      
      setEditingRecord(null);
      setShowForm(false);
      resetForm();
      alert("✅ Registro actualizado exitosamente");
      
    } catch (error: any) {
      setError(error.message || "Error al actualizar el plan de tratamiento");
      alert("❌ Error al actualizar el plan de tratamiento: " + (error.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ver detalles
  const handleView = (record: TreatmentPlan) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  // Editar registro
  const handleEdit = (record: TreatmentPlan) => {
    setEditingRecord(record);
    setFormData(record);
    setShowForm(true);
  };

  // Eliminar
  const handleDeleteClick = useCallback((record: TreatmentPlan) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  }, []);

  // Confirmar eliminación
  const confirmDelete = useCallback(async () => {
    if (!recordToDelete) return;
    
    try {
      setIsSubmitting(true);
      setError("");

      await TreatmentPlansAPI.deleteTreatmentPlan(recordToDelete.id);
      
      // Actualizar la lista local
      setRecords(prev => prev.filter(r => r.id !== recordToDelete.id));
      
      if (selectedRecord?.id === recordToDelete.id) {
        setSelectedRecord(null);
        setShowDetailsModal(false);
      }
      if (editingRecord?.id === recordToDelete.id) {
        setEditingRecord(null);
        setShowForm(false);
      }
      
      setShowDeleteModal(false);
      setRecordToDelete(null);
      alert("✅ Plan de tratamiento eliminado exitosamente");
      
    } catch (error: any) {
      setError(error.message || "Error al eliminar el plan de tratamiento");
      alert("❌ Error al eliminar el plan de tratamiento: " + (error.message || "Error desconocido"));
    } finally {
      setIsSubmitting(false);
    }
  }, [recordToDelete, selectedRecord, editingRecord]);

  // Nuevo registro
  const handleNew = () => {
    setEditingRecord(null);
    resetForm();
    setShowForm(true);
  };

  // Recargar datos
  const handleRefresh = () => {
    loadTreatmentPlans();
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('es-MX');
  };

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
          <p className="text-gray-600 text-sm">Conectando con el servidor...</p>
        </div>
      </div>
    );
  }

  // Error
  if (error && records.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <div className="flex justify-center space-x-3">
            <button 
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 flex items-center space-x-2"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Reintentar</span>
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Recargar Página
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Asegúrate de que el backend esté ejecutándose en http://localhost:5000
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <Clipboard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Planes de Tratamiento
              </h1>
              <p className="text-gray-600">
                Sistema de gestión médica conectado al backend
              </p>
              {error && (
                <p className="text-red-600 text-sm mt-1">
                  ⚠️ {error}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleRefresh}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2 transition-colors"
              disabled={isLoading}
              title="Recargar datos"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button 
              onClick={handleNew}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
              disabled={isSubmitting}
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo</span>
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

        {/* Indicador de conectividad */}
        <div className="mt-4 flex items-center justify-end">
          <div className="flex items-center space-x-2 text-xs">
            <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className={error ? 'text-red-600' : 'text-green-600'}>
              {error ? 'Desconectado' : 'Conectado al backend'}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de registros */}
      {records.length === 0 && !isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <Clipboard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No hay planes de tratamiento
          </h3>
          <p className="text-gray-600 mb-6">
            {error 
              ? "No se pudieron cargar los datos del servidor"
              : "Aún no se han creado planes de tratamiento"
            }
          </p>
          <div className="flex justify-center space-x-3">
            <button 
              onClick={handleNew}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 mx-auto transition-colors"
              disabled={isSubmitting}
            >
              <Plus className="w-5 h-5" />
              <span>Crear Primer Plan</span>
            </button>
            {error && (
              <button 
                onClick={handleRefresh}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto transition-colors"
                disabled={isLoading}
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Reintentar Conexión</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((record) => (
            <motion.div
              key={record.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              whileHover={{ y: -2 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header de la tarjeta */}
              <div className="bg-green-600 p-4 text-white">
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
                      {formatDate(record.treatmentDate)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hora:</p>
                    <p className="font-medium">{record.treatmentTime}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{record.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    ${record.cost.toLocaleString()}
                  </span>
                </div>

                {record.notes && (
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-sm text-gray-700 line-clamp-2">{record.notes}</p>
                  </div>
                )}
              </div>

              {/* Acciones */}
              <div className="bg-gray-50 px-4 py-3 flex justify-between">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleView(record)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    title="Ver detalles"
                    disabled={isSubmitting}
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleEdit(record)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                    title="Editar"
                    disabled={isSubmitting}
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(record)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Eliminar"
                    disabled={isSubmitting}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-xs text-gray-500">
                  {record.createdAt && formatDate(record.createdAt.split('T')[0])}
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
                  {editingRecord ? "Editar Plan de Tratamiento" : "Nuevo Plan de Tratamiento"}
                </h2>
                <button 
                  onClick={() => setShowForm(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                  disabled={isSubmitting}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Contenido del formulario */}
              <div className="p-6 space-y-4">
                {/* Mostrar errores globales */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {/* Información del Animal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre del Animal *
                    </label>
                    <input
                      type="text"
                      value={formData.bullName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, bullName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        formErrors.bullName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Ej: Bessie"
                      disabled={isSubmitting}
                    />
                    {formErrors.bullName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.bullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      TAG del Animal *
                    </label>
                    <input
                      type="text"
                      value={formData.bullEarTag || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, bullEarTag: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        formErrors.bullEarTag ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Ej: TAG-001"
                      disabled={isSubmitting}
                    />
                    {formErrors.bullEarTag && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.bullEarTag}</p>
                    )}
                  </div>
                </div>

                {/* Información del Tratamiento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condición/Enfermedad *
                    </label>
                    <input
                      type="text"
                      value={formData.cowName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, cowName: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        formErrors.cowName ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Ej: Mastitis"
                      disabled={isSubmitting}
                    />
                    {formErrors.cowName && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.cowName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Veterinario *
                    </label>
                    <input
                      type="text"
                      value={formData.cowEarTag || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, cowEarTag: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        formErrors.cowEarTag ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Ej: Dr. García"
                      disabled={isSubmitting}
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
                      value={formData.treatmentDate || new Date().toISOString().substr(0, 10)}
                      onChange={(e) => setFormData(prev => ({ ...prev, treatmentDate: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        formErrors.treatmentDate ? "border-red-300" : "border-gray-300"
                      }`}
                      disabled={isSubmitting}
                    />
                    {formErrors.treatmentDate && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.treatmentDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hora *
                    </label>
                    <input
                      type="time"
                      value={formData.treatmentTime || new Date().toTimeString().substr(0, 5)}
                      onChange={(e) => setFormData(prev => ({ ...prev, treatmentTime: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        formErrors.treatmentTime ? "border-red-300" : "border-gray-300"
                      }`}
                      disabled={isSubmitting}
                    />
                    {formErrors.treatmentTime && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.treatmentTime}</p>
                    )}
                  </div>
                </div>

                {/* Ubicación y Costo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación *
                    </label>
                    <input
                      type="text"
                      value={formData.location || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        formErrors.location ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="Ej: Potrero Norte"
                      disabled={isSubmitting}
                    />
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
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        formErrors.cost ? "border-red-300" : "border-gray-300"
                      }`}
                      placeholder="0.00"
                      disabled={isSubmitting}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={isSubmitting}
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      disabled={isSubmitting}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Observaciones adicionales..."
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* Footer del modal */}
              <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={editingRecord ? handleUpdate : handleCreate}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting && (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  )}
                  {!isSubmitting && <Save className="w-4 h-4" />}
                  <span>
                    {isSubmitting 
                      ? (editingRecord ? "Actualizando..." : "Guardando...") 
                      : (editingRecord ? "Actualizar" : "Guardar")
                    }
                  </span>
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
              <div className="flex justify-between items-center p-6 border-b bg-green-600 text-white">
                <h2 className="text-xl font-bold">
                  Detalles del Plan de Tratamiento
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
                      <Calendar className="w-5 h-5 mr-2 text-green-600" />
                      Información Temporal
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div>
                        <span className="text-gray-600">Fecha:</span>
                        <span className="ml-2 font-medium">
                          {formatDate(selectedRecord.treatmentDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Hora:</span>
                        <span className="ml-2 font-medium">{selectedRecord.treatmentTime}</span>
                      </div>
                      {selectedRecord.createdAt && (
                        <div>
                          <span className="text-gray-600">Creado:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(selectedRecord.createdAt.split('T')[0])}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <MapPin className="w-5 h-5 mr-2 text-green-600" />
                      Ubicación y Costo
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div>
                        <span className="text-gray-600">Ubicación:</span>
                        <span className="ml-2 font-medium">{selectedRecord.location}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Costo:</span>
                        <span className="ml-2 font-bold text-green-600 text-lg">
                          ${selectedRecord.cost.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">ID:</span>
                        <span className="ml-2 font-mono text-xs text-gray-500">
                          {selectedRecord.id}
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2 transition-colors"
                  disabled={isSubmitting}
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de confirmación de eliminación */}
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
                    Eliminar Plan de Tratamiento
                  </h3>
                  <p className="text-sm text-gray-600">
                    Esta acción no se puede deshacer
                  </p>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                <p className="text-gray-700 mb-6">
                  ¿Estás seguro de que deseas eliminar el plan de tratamiento para{" "}
                  <strong>{recordToDelete.bullName}</strong> con la condición{" "}
                  <strong>{recordToDelete.cowName}</strong>?
                  <br />
                  <br />
                  Toda la información del registro se eliminará permanentemente del servidor.
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
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
                  {!isSubmitting && <Trash2 className="w-4 h-4" />}
                  <span>{isSubmitting ? "Eliminando..." : "Eliminar"}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TreatmentPlans;