import React, { useState, useCallback } from "react";
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
import {
  ShoppingBag,
  DollarSign,
  ArrowLeft,
  Save,
  Plus,
  TrendingUp,
  Award,
  Edit,
  Trash2,
  Eye,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  Download,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

// Importar servicios y hooks adaptados a tu estructura
import { 
  useSalesEvents, 
  useSalesStatistics, 
  useSalesOperations,
  useSalesForm,
  useSalesFilters 
} from "../../hooks/useSales";

// Importar tipos del servicio
import type {
  SalesEvent,
  PaymentStatus,
} from "../../services/salesService";

// Tipos de vista
type ViewMode = "list" | "create" | "edit" | "detail";

// Constantes utilizadas
const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: "Pagado",
  pending: "Pendiente",
  overdue: "Vencido",
};

const EventSales: React.FC = () => {
  // Estados principales
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedEvent, setSelectedEvent] = useState<SalesEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Hooks para filtros
  const { 
    filters, 
    updateFilter, 
    resetFilters,
    activeFiltersCount 
  } = useSalesFilters();

  // Hooks para datos del backend
  const { 
    data: salesResponse, 
    loading: salesLoading, 
    error: salesError, 
    refetch: refetchSales 
  } = useSalesEvents(filters);

  const { 
    data: statisticsResponse, 
    refetch: refetchStatistics 
  } = useSalesStatistics();

  // Hook para operaciones CRUD
  const {
    loading: operationsLoading,
    createSalesEvent,
    updateSalesEvent,
    deleteSalesEvent,
    markPaymentAsCompleted,
    downloadReport
  } = useSalesOperations();

  // Hook para formulario
  const {
    formData,
    errors: formErrors,
    updateField,
    validateForm,
    resetForm,
    setFormData
  } = useSalesForm();

  // Datos procesados
  const salesEvents = salesResponse?.data || [];
  const statistics = statisticsResponse?.data || {
    totalSales: 0,
    totalRevenue: 0,
    pendingCount: 0,
    averagePricePerKg: 0,
  };

  // Mostrar notificaciones
  const showNotification = useCallback((message: string, type: 'success' | 'error') => {
    if (type === 'success') {
      setSuccessMessage(message);
      setError(null);
    } else {
      setError(message);
      setSuccessMessage(null);
    }

    // Auto-hide después de 5 segundos
    setTimeout(() => {
      setSuccessMessage(null);
      setError(null);
    }, 5000);
  }, []);

  // CRUD Operations
  const handleCreate = useCallback(async () => {
    if (!validateForm()) return;

    try {
      const response = await createSalesEvent(formData as Omit<SalesEvent, 'id' | 'createdAt' | 'updatedAt'>);
      
      if (response.success) {
        showNotification('Evento de venta creado exitosamente', 'success');
        resetForm();
        setViewMode("list");
        refetchSales();
        refetchStatistics();
      } else {
        showNotification(response.message || 'Error al crear el evento de venta', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al crear el evento de venta', 'error');
    }
  }, [formData, validateForm, createSalesEvent, resetForm, showNotification, refetchSales, refetchStatistics]);

  const handleUpdate = useCallback(async () => {
    if (!selectedEvent || !validateForm()) return;

    try {
      const response = await updateSalesEvent(selectedEvent.id, formData);
      
      if (response.success) {
        showNotification('Evento de venta actualizado exitosamente', 'success');
        setViewMode("list");
        setSelectedEvent(null);
        refetchSales();
        refetchStatistics();
      } else {
        showNotification(response.message || 'Error al actualizar el evento de venta', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al actualizar el evento de venta', 'error');
    }
  }, [selectedEvent, formData, validateForm, updateSalesEvent, showNotification, refetchSales, refetchStatistics]);

  const handleDelete = useCallback(async (eventId: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este evento de venta?")) {
      return;
    }

    try {
      const response = await deleteSalesEvent(eventId);
      
      if (response.success) {
        showNotification('Evento de venta eliminado exitosamente', 'success');
        refetchSales();
        refetchStatistics();
      } else {
        showNotification(response.message || 'Error al eliminar el evento de venta', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al eliminar el evento de venta', 'error');
    }
  }, [deleteSalesEvent, showNotification, refetchSales, refetchStatistics]);

  const handleMarkAsPaid = useCallback(async (eventId: string) => {
    try {
      const response = await markPaymentAsCompleted(eventId);
      
      if (response.success) {
        showNotification('Pago marcado como completado', 'success');
        refetchSales();
        refetchStatistics();
      } else {
        showNotification(response.message || 'Error al marcar el pago', 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Error al marcar el pago', 'error');
    }
  }, [markPaymentAsCompleted, showNotification, refetchSales, refetchStatistics]);

  const handleDownloadReport = useCallback(async () => {
    try {
      const blob = await downloadReport(filters);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-ventas-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showNotification('Reporte descargado exitosamente', 'success');
    } catch (err: any) {
      showNotification(err.message || 'Error al descargar el reporte', 'error');
    }
  }, [filters, downloadReport, showNotification]);

  // Funciones de navegación
  const openEditForm = useCallback((event: SalesEvent) => {
    setSelectedEvent(event);
    setFormData(event);
    setViewMode("edit");
  }, [setFormData]);

  const viewEventDetail = useCallback((event: SalesEvent) => {
    setSelectedEvent(event);
    setViewMode("detail");
  }, []);

  const goBackToList = useCallback(() => {
    setViewMode("list");
    setSelectedEvent(null);
    resetForm();
  }, [resetForm]);

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

  // Componente de notificaciones
  const NotificationBanner = () => {
    if (!error && !successMessage) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg ${
          error 
            ? 'bg-red-100 border border-red-400 text-red-700' 
            : 'bg-green-100 border border-green-400 text-green-700'
        }`}
      >
        <div className="flex items-center gap-2">
          {error ? (
            <AlertTriangle size={20} />
          ) : (
            <CheckCircle size={20} />
          )}
          <span>{error || successMessage}</span>
          <button
            onClick={() => {
              setError(null);
              setSuccessMessage(null);
            }}
            className="ml-auto"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    );
  };

  // Renderizar lista de eventos
  const renderEventsList = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header con búsqueda y filtros */}
      <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Eventos de Ventas</h1>
            <p className="text-gray-600">Gestiona los eventos de venta de tu ganado</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={refetchSales}
              variant="outline"
              disabled={salesLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw size={16} className={salesLoading ? "animate-spin" : ""} />
              Actualizar
            </Button>
            
            <Button
              onClick={handleDownloadReport}
              variant="outline"
              disabled={operationsLoading || salesEvents.length === 0}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Reporte
            </Button>
            
            <Button
              onClick={() => {
                resetForm();
                setViewMode("create");
              }}
              className="bg-green-600 hover:bg-green-700 text-white transition-colors duration-200"
            >
              <Plus size={20} className="mr-2" />
              Nueva Venta
            </Button>
          </div>
        </div>

        {/* Búsqueda y filtros */}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              placeholder="Buscar por bovino, comprador o ID..."
              value={filters.search || ''}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10"
              aria-label="Buscar eventos"
            />
          </div>
          
          <select
            value={filters.paymentStatus || 'all'}
            onChange={(e) => updateFilter('paymentStatus', e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-all duration-200"
            aria-label="Filtrar por estado"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="paid">Pagado</option>
            <option value="overdue">Vencido</option>
          </select>

          {activeFiltersCount > 0 && (
            <Button
              onClick={resetFilters}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X size={16} />
              Limpiar ({activeFiltersCount})
            </Button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">Total Ventas</p>
                <p className="text-2xl font-bold">{statistics.totalSales}</p>
              </div>
              <ShoppingBag size={32} className="text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">Ingresos Totales</p>
                <p className="text-2xl font-bold">
                  ${statistics.totalRevenue.toLocaleString()}
                </p>
              </div>
              <DollarSign size={32} className="text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100">Pendientes</p>
                <p className="text-2xl font-bold">{statistics.pendingCount}</p>
              </div>
              <AlertCircle size={32} className="text-yellow-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">Precio Promedio/Kg</p>
                <p className="text-2xl font-bold">
                  ${statistics.averagePricePerKg.toFixed(2)}
                </p>
              </div>
              <TrendingUp size={32} className="text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Loading state */}
      {salesLoading && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardContent className="p-8 text-center">
              <Loader2 size={48} className="mx-auto text-green-600 mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cargando eventos de ventas...</h3>
              <p className="text-gray-600">Por favor espera mientras obtenemos los datos.</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Error state */}
      {salesError && !salesLoading && (
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 backdrop-blur-sm border border-red-200 shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error al cargar los datos</h3>
              <p className="text-gray-600 mb-4">{salesError}</p>
              <Button onClick={refetchSales} className="bg-red-600 hover:bg-red-700 text-white">
                <RefreshCw size={16} className="mr-2" />
                Reintentar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Lista de eventos */}
      {!salesLoading && !salesError && (
        <motion.div variants={itemVariants} className="space-y-4">
          {salesEvents.length === 0 ? (
            <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
              <CardContent className="p-8 text-center">
                <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos de venta</h3>
                <p className="text-gray-600 mb-4">
                  {filters.search || filters.paymentStatus !== 'all'
                    ? "No se encontraron eventos que coincidan con los filtros."
                    : "Comienza registrando tu primera venta de ganado."}
                </p>
                {!filters.search && filters.paymentStatus === 'all' && (
                  <Button
                    onClick={() => {
                      resetForm();
                      setViewMode("create");
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus size={20} className="mr-2" />
                    Registrar Primera Venta
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            salesEvents.map((event) => (
              <motion.div key={event.id} layout>
                <Card className="bg-white/80 backdrop-blur-sm hover:bg-white/90 transition-all duration-200 border border-white/20 shadow-lg hover:shadow-xl">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {event.bovineName}
                          </h3>
                          <span className="text-sm text-gray-500">#{event.bovineId}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            event.paymentStatus === "paid"
                              ? "bg-green-100 text-green-800"
                              : event.paymentStatus === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {PAYMENT_STATUS_LABELS[event.paymentStatus]}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Comprador:</span>
                            <p className="font-medium">{event.buyerName}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Precio:</span>
                            <p className="font-medium">${event.salePrice.toLocaleString()}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Peso:</span>
                            <p className="font-medium">{event.weight} kg</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Fecha:</span>
                            <p className="font-medium">{new Date(event.saleDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {event.paymentStatus === "pending" && (
                          <Button
                            onClick={() => handleMarkAsPaid(event.id)}
                            variant="outline"
                            size="sm"
                            className="border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                            disabled={operationsLoading}
                          >
                            <CheckCircle size={16} />
                            Marcar Pagado
                          </Button>
                        )}
                        
                        <Button
                          onClick={() => viewEventDetail(event)}
                          variant="outline"
                          size="sm"
                          className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                          aria-label={`Ver detalles de ${event.bovineName}`}
                        >
                          <Eye size={16} />
                          Ver
                        </Button>
                        <Button
                          onClick={() => openEditForm(event)}
                          variant="outline"
                          size="sm"
                          className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                          aria-label={`Editar ${event.bovineName}`}
                        >
                          <Edit size={16} />
                          Editar
                        </Button>
                        <Button
                          onClick={() => handleDelete(event.id)}
                          variant="outline"
                          size="sm"
                          className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400"
                          aria-label={`Eliminar ${event.bovineName}`}
                          disabled={operationsLoading}
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>
      )}
    </motion.div>
  );

  // Renderizar formulario
  const renderForm = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-gray-900">
                  {viewMode === "create" ? "Registrar Nueva Venta" : "Editar Evento de Venta"}
                </CardTitle>
                <CardDescription>
                  {viewMode === "create" 
                    ? "Completa la información del evento de venta"
                    : "Modifica los datos del evento de venta"}
                </CardDescription>
              </div>
              <Button
                onClick={goBackToList}
                variant="outline"
                className="flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Volver
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Mostrar errores de validación */}
            {Object.keys(formErrors).length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="text-red-800 font-medium mb-2">Por favor corrige los siguientes errores:</h4>
                <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
                  {Object.values(formErrors).map((errorMsg, index) => (
                    <li key={index}>{errorMsg}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Información del Bovino */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Información del Bovino
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="bovineId">
                    ID del Bovino <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="bovineId"
                    value={formData.bovineId || ""}
                    onChange={(e) => updateField("bovineId", e.target.value)}
                    placeholder="Ej: BOV001"
                    className="bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="bovineName">
                    Nombre del Bovino <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="bovineName"
                    value={formData.bovineName || ""}
                    onChange={(e) => updateField("bovineName", e.target.value)}
                    placeholder="Ej: Toro Premium 001"
                    className="bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="weight">
                    Peso (kg) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight || ""}
                    onChange={(e) => updateField("weight", Number(e.target.value))}
                    placeholder="Ej: 500"
                    min="0"
                    className="bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="salePrice">
                    Precio de Venta ($) <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="salePrice"
                    type="number"
                    value={formData.salePrice || ""}
                    onChange={(e) => updateField("salePrice", Number(e.target.value))}
                    placeholder="Ej: 45000"
                    min="0"
                    step="0.01"
                    className="bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Información del Comprador */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                Información del Comprador
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="buyerName">
                    Nombre del Comprador <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="buyerName"
                    value={formData.buyerName || ""}
                    onChange={(e) => updateField("buyerName", e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className="bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700" htmlFor="buyerContact">
                    Contacto del Comprador <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="buyerContact"
                    value={formData.buyerContact || ""}
                    onChange={(e) => updateField("buyerContact", e.target.value)}
                    placeholder="Ej: +52 993 123 4567"
                    className="bg-white/60 backdrop-blur-sm border-white/30 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Campos calculados automáticamente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Precio por Kg ($)
                </label>
                <Input
                  type="number"
                  value={formData.pricePerKg || ""}
                  readOnly
                  className="bg-gray-100/60 backdrop-blur-sm border-gray-200/30 text-gray-600"
                  placeholder="Se calcula automáticamente"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Comisión ($)
                </label>
                <Input
                  type="number"
                  value={formData.commission || ""}
                  readOnly
                  className="bg-gray-100/60 backdrop-blur-sm border-gray-200/30 text-gray-600"
                  placeholder="Se calcula automáticamente (5%)"
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                onClick={goBackToList}
                variant="outline"
                disabled={operationsLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={viewMode === "create" ? handleCreate : handleUpdate}
                className="bg-green-600 hover:bg-green-700 text-white"
                disabled={operationsLoading}
              >
                {operationsLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save size={20} className="mr-2" />
                )}
                {viewMode === "create" ? "Registrar Venta" : "Actualizar Venta"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );

  // Renderizar detalle del evento (simplificado)
  const renderEventDetail = () => {
    if (!selectedEvent) return null;

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl text-gray-900">
                    Detalle del Evento de Venta
                  </CardTitle>
                  <CardDescription>
                    Información completa del evento de venta #{selectedEvent.id}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => openEditForm(selectedEvent)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <Edit size={20} />
                    Editar
                  </Button>
                  <Button
                    onClick={goBackToList}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft size={20} />
                    Volver
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-8">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                  <Award className="text-green-600" size={20} />
                  Información del Bovino
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">ID del Bovino</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.bovineId}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.bovineName}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Peso</p>
                    <p className="font-semibold text-gray-900">{selectedEvent.weight} kg</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-500">Precio Total</p>
                    <p className="font-semibold text-gray-900">${selectedEvent.salePrice.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    );
  };

  // Renderizar vista principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <NotificationBanner />
      <AnimatePresence mode="wait">
        {viewMode === "list" && renderEventsList()}
        {(viewMode === "create" || viewMode === "edit") && renderForm()}
        {viewMode === "detail" && renderEventDetail()}
      </AnimatePresence>
    </div>
  );
};

export default EventSales;