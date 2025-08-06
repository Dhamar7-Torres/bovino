import React, { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Eye,
  X,
  Save,
  Calendar,
  MapPin,
  User,
  DollarSign,
  FileText,
  CreditCard,
  Navigation,
  AlertTriangle,
  Loader2,
} from "lucide-react";

// ============================================================================
// CONFIGURACIÓN API
// ============================================================================
const API_BASE_URL = 'http://localhost:5000/api';

// ============================================================================
// INTERFACES
// ============================================================================
interface ExpenseRecord {
  id: string;
  date: string;
  description: string;
  category: "vacunacion" | "tratamientos" | "alimentacion" | "instalaciones" | "transporte" | "otros";
  amount: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  animalId?: string;
  supplier: string;
  status: "paid" | "pending" | "overdue";
  paymentMethod: "efectivo" | "transferencia" | "cheque" | "credito";
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// SERVICIOS API
// ============================================================================
const expenseService = {
  // Obtener todos los gastos
  getAll: async (): Promise<ExpenseRecord[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener gastos:', error);
      throw error;
    }
  },

  // Crear un gasto
  create: async (expenseData: Omit<ExpenseRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ExpenseRecord> => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al crear gasto:', error);
      throw error;
    }
  },

  // Actualizar un gasto
  update: async (id: string, expenseData: Partial<ExpenseRecord>): Promise<ExpenseRecord> => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error al actualizar gasto:', error);
      throw error;
    }
  },

  // Eliminar un gasto
  delete: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error al eliminar gasto:', error);
      throw error;
    }
  },
};

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
const ExpenseTracker: React.FC = () => {
  // Estados principales
  const [, setIsLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);
  
  // Estados para modales
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRecord | null>(null);

  // Estados para formulario - SEPARADOS
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("alimentacion");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formSupplier, setFormSupplier] = useState("");
  const [formPaymentMethod, setFormPaymentMethod] = useState("efectivo");
  const [formAddress, setFormAddress] = useState("");
  const [formAnimalId, setFormAnimalId] = useState("");

  // Estados para operaciones
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Estados para geolocalización
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [currentCoordinates, setCurrentCoordinates] = useState<{lat: number, lng: number} | null>(null);

  // ============================================================================
  // FUNCIONES DE CARGA
  // ============================================================================
  const loadExpenses = async () => {
    try {
      setDataLoading(true);
      setError(null);
      const expensesData = await expenseService.getAll();
      setExpenseRecords(expensesData);
    } catch (error) {
      console.error('Error cargando gastos:', error);
      setError('Error al cargar los gastos. Verifique que el servidor esté funcionando.');
      setExpenseRecords([]);
    } finally {
      setDataLoading(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
    setFormDate(getCurrentDate());
  }, []);

  // ============================================================================
  // FUNCIONES HELPER
  // ============================================================================
  const getCurrentDate = (): string => {
    return new Date().toISOString().split('T')[0];
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      vacunacion: "Vacunación",
      tratamientos: "Tratamientos",
      alimentacion: "Alimentación",
      instalaciones: "Instalaciones",
      transporte: "Transporte",
      otros: "Otros",
    };
    return categoryMap[category] || category;
  };

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      paid: "bg-green-500",
      pending: "bg-yellow-500",
      overdue: "bg-red-500",
    };
    return statusColors[status] || "bg-gray-500";
  };

  const getStatusText = (status: string): string => {
    const statusTexts: Record<string, string> = {
      paid: "Pagado",
      pending: "Pendiente",
      overdue: "Vencido",
    };
    return statusTexts[status] || status;
  };

  const getPaymentMethodText = (method: string): string => {
    const methodTexts: Record<string, string> = {
      efectivo: "Efectivo",
      transferencia: "Transferencia",
      cheque: "Cheque",
      credito: "Crédito",
    };
    return methodTexts[method] || method;
  };

  // Función para limpiar formulario
  const clearForm = () => {
    setFormDescription("");
    setFormCategory("alimentacion");
    setFormAmount("");
    setFormDate(getCurrentDate());
    setFormSupplier("");
    setFormPaymentMethod("efectivo");
    setFormAddress("");
    setFormAnimalId("");
    setCurrentCoordinates(null);
  };

  // Función para obtener ubicación actual
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentCoordinates({ lat: latitude, lng: longitude });

        try {
          // Usar una API de geocodificación gratuita para obtener la dirección
          const response = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=es`
          );
          
          if (response.ok) {
            const data = await response.json();
            const address = `${data.locality || ''}, ${data.principalSubdivision || ''}, ${data.countryName || ''}`.replace(/^,\s*|,\s*$/g, '');
            setFormAddress(address || `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
          } else {
            // Si falla la API, usar coordenadas
            setFormAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
          }
        } catch (error) {
          // Si hay error, usar coordenadas
          setFormAddress(`Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`);
        }

        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = "Error obteniendo ubicación";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permiso de ubicación denegado. Por favor permite el acceso a tu ubicación.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Información de ubicación no disponible.";
            break;
          case error.TIMEOUT:
            errorMessage = "Tiempo de espera agotado obteniendo ubicación.";
            break;
        }
        
        alert(errorMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const handleOpenAddModal = () => {
    clearForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (expense: ExpenseRecord) => {
    setSelectedExpense(expense);
    setFormDescription(expense.description);
    setFormCategory(expense.category);
    setFormAmount(expense.amount.toString());
    setFormDate(expense.date);
    setFormSupplier(expense.supplier);
    setFormPaymentMethod(expense.paymentMethod);
    setFormAddress(expense.location.address);
    setFormAnimalId(expense.animalId || "");
    setCurrentCoordinates({ lat: expense.location.lat, lng: expense.location.lng });
    setShowEditModal(true);
  };

  const handleOpenViewModal = (expense: ExpenseRecord) => {
    setSelectedExpense(expense);
    setShowViewModal(true);
  };

  const handleOpenDeleteModal = (expense: ExpenseRecord) => {
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  };

  const handleSaveExpense = async () => {
    if (!formDescription.trim() || !formAmount.trim() || !formDate.trim() || !formSupplier.trim()) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    setSaving(true);
    try {
      const expenseData = {
        date: formDate,
        description: formDescription,
        category: formCategory as ExpenseRecord['category'],
        amount: parseFloat(formAmount),
        location: {
          lat: currentCoordinates?.lat || 17.9895,
          lng: currentCoordinates?.lng || -92.9475,
          address: formAddress,
        },
        animalId: formAnimalId || undefined,
        supplier: formSupplier,
        status: "pending" as const,
        paymentMethod: formPaymentMethod as ExpenseRecord['paymentMethod'],
      };

      const newExpense = await expenseService.create(expenseData);
      setExpenseRecords(prev => [newExpense, ...prev]);
      setShowAddModal(false);
      clearForm();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar el gasto. Por favor, intente nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateExpense = async () => {
    if (!selectedExpense || !formDescription.trim() || !formAmount.trim() || !formDate.trim() || !formSupplier.trim()) {
      alert("Por favor completa todos los campos obligatorios");
      return;
    }

    setSaving(true);
    try {
      const updatedData = {
        date: formDate,
        description: formDescription,
        category: formCategory as ExpenseRecord['category'],
        amount: parseFloat(formAmount),
        supplier: formSupplier,
        paymentMethod: formPaymentMethod as ExpenseRecord['paymentMethod'],
        location: {
          lat: currentCoordinates?.lat || selectedExpense.location.lat,
          lng: currentCoordinates?.lng || selectedExpense.location.lng,
          address: formAddress,
        },
        animalId: formAnimalId || undefined,
      };

      const updatedExpense = await expenseService.update(selectedExpense.id, updatedData);
      setExpenseRecords(prev => 
        prev.map(expense => 
          expense.id === selectedExpense.id ? updatedExpense : expense
        )
      );
      
      setShowEditModal(false);
      setSelectedExpense(null);
      clearForm();
    } catch (error) {
      console.error("Error al actualizar:", error);
      alert("Error al actualizar el gasto. Por favor, intente nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!selectedExpense) return;

    setDeleting(true);
    try {
      await expenseService.delete(selectedExpense.id);
      setExpenseRecords(prev => 
        prev.filter(expense => expense.id !== selectedExpense.id)
      );
      
      setShowDeleteModal(false);
      setSelectedExpense(null);
    } catch (error) {
      console.error("Error al eliminar:", error);
      alert("Error al eliminar el gasto. Por favor, intente nuevamente.");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Fecha',
      'Descripción',
      'Categoría',
      'Proveedor',
      'Monto',
      'Método de Pago',
      'Estado',
      'Ubicación'
    ];

    const csvData = expenseRecords.map(record => [
      record.date,
      record.description,
      getCategoryName(record.category),
      record.supplier,
      record.amount.toString(),
      getPaymentMethodText(record.paymentMethod),
      getStatusText(record.status),
      record.location.address
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `gastos_${getCurrentDate()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ============================================================================
  // ANIMACIONES
  // ============================================================================
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  // ============================================================================
  // PANTALLAS DE CARGA Y ERROR
  // ============================================================================
  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-white border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-white text-lg font-medium">Cargando gastos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6 flex items-center justify-center">
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-8 border border-red-200">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error de Conexión</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={loadExpenses}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // ============================================================================
  // COMPONENTE PRINCIPAL
  // ============================================================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header con botones */}
        <motion.div
          variants={itemVariants}
          className="flex justify-end space-x-3 mb-6"
        >
          <button
            onClick={handleOpenAddModal}
            className="flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nuevo Gasto
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-all duration-300 shadow-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Exportar CSV
          </button>
        </motion.div>

        {/* Tabla de gastos */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Registros de Gastos Recientes
            </h3>
            <div className="text-sm text-gray-600">
              {expenseRecords.length} registros
            </div>
          </div>

          {expenseRecords.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay gastos registrados</h3>
              <p className="text-gray-600 mb-6">Comienza agregando tu primer gasto.</p>
              <button
                onClick={handleOpenAddModal}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium"
              >
                Agregar Gasto
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Fecha</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Descripción</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Categoría</th>
                    <th className="text-left py-3 px-4 text-gray-700 font-medium">Proveedor</th>
                    <th className="text-right py-3 px-4 text-gray-700 font-medium">Monto</th>
                    <th className="text-center py-3 px-4 text-gray-700 font-medium">Pago</th>
                    <th className="text-center py-3 px-4 text-gray-700 font-medium">Estado</th>
                    <th className="text-center py-3 px-4 text-gray-700 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {expenseRecords.map((record) => (
                    <motion.tr
                      key={record.id}
                      whileHover={{ backgroundColor: "#F9FAFB" }}
                      className="border-b border-gray-100 transition-colors duration-200"
                    >
                      <td className="py-4 px-4 text-gray-600">{formatDate(record.date)}</td>
                      <td className="py-4 px-4 text-gray-900 font-medium">{record.description}</td>
                      <td className="py-4 px-4 text-gray-600">{getCategoryName(record.category)}</td>
                      <td className="py-4 px-4 text-gray-600">{record.supplier}</td>
                      <td className="py-4 px-4 text-right text-gray-900 font-semibold">{formatCurrency(record.amount)}</td>
                      <td className="py-4 px-4 text-center text-gray-600 text-sm">{getPaymentMethodText(record.paymentMethod)}</td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(record.status)}`}></span>
                          <span className="text-gray-600 text-sm">{getStatusText(record.status)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleOpenViewModal(record)}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(record)}
                            className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleOpenDeleteModal(record)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Modal Agregar */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Agregar Nuevo Gasto</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  clearForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Descripción *
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Descripción detallada del gasto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="alimentacion">Alimentación</option>
                    <option value="vacunacion">Vacunación</option>
                    <option value="tratamientos">Tratamientos</option>
                    <option value="instalaciones">Instalaciones</option>
                    <option value="transporte">Transporte</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Monto *
                  </label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Proveedor *
                  </label>
                  <input
                    type="text"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nombre del proveedor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Método de Pago
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Ubicación
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Dirección o ubicación"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 flex items-center"
                      title="Obtener ubicación actual"
                    >
                      {isGettingLocation ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <Navigation className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {currentCoordinates && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordenadas: {currentCoordinates.lat.toFixed(6)}, {currentCoordinates.lng.toFixed(6)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID de Animal (opcional)</label>
                  <input
                    type="text"
                    value={formAnimalId}
                    onChange={(e) => setFormAnimalId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="ID del animal (si aplica)"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    clearForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveExpense}
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Gasto
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Editar Gasto</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedExpense(null);
                  clearForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Descripción *
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Descripción detallada del gasto..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría *</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="alimentacion">Alimentación</option>
                    <option value="vacunacion">Vacunación</option>
                    <option value="tratamientos">Tratamientos</option>
                    <option value="instalaciones">Instalaciones</option>
                    <option value="transporte">Transporte</option>
                    <option value="otros">Otros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Monto *
                  </label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Fecha *
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Proveedor *
                  </label>
                  <input
                    type="text"
                    value={formSupplier}
                    onChange={(e) => setFormSupplier(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Nombre del proveedor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <CreditCard className="w-4 h-4 inline mr-2" />
                    Método de Pago
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="efectivo">Efectivo</option>
                    <option value="transferencia">Transferencia</option>
                    <option value="cheque">Cheque</option>
                    <option value="credito">Crédito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Ubicación
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={formAddress}
                      onChange={(e) => setFormAddress(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Dirección o ubicación"
                    />
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-200 flex items-center"
                      title="Obtener ubicación actual"
                    >
                      {isGettingLocation ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                      ) : (
                        <Navigation className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {currentCoordinates && (
                    <p className="text-xs text-gray-500 mt-1">
                      Coordenadas: {currentCoordinates.lat.toFixed(6)}, {currentCoordinates.lng.toFixed(6)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ID de Animal (opcional)</label>
                  <input
                    type="text"
                    value={formAnimalId}
                    onChange={(e) => setFormAnimalId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="ID del animal (si aplica)"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedExpense(null);
                    clearForm();
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateExpense}
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Actualizando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Actualizar Gasto
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Ver */}
      {showViewModal && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Detalles del Gasto</h2>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedExpense(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Descripción
                  </h4>
                  <p className="text-gray-900">{selectedExpense.description}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Categoría</h4>
                  <p className="text-gray-900">{getCategoryName(selectedExpense.category)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <DollarSign className="w-4 h-4 mr-2" />
                    Monto
                  </h4>
                  <p className="text-gray-900 text-xl font-bold">
                    {formatCurrency(selectedExpense.amount)}
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Fecha
                  </h4>
                  <p className="text-gray-900">{formatDate(selectedExpense.date)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Proveedor
                  </h4>
                  <p className="text-gray-900">{selectedExpense.supplier}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Método de Pago
                  </h4>
                  <p className="text-gray-900">{getPaymentMethodText(selectedExpense.paymentMethod)}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2">Estado</h4>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(selectedExpense.status)}`}></span>
                    <span className="text-gray-900">{getStatusText(selectedExpense.status)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    Ubicación
                  </h4>
                  <p className="text-gray-900">{selectedExpense.location.address}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Coordenadas: {selectedExpense.location.lat.toFixed(6)}, {selectedExpense.location.lng.toFixed(6)}
                  </p>
                </div>

                {selectedExpense.animalId && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-700 mb-2">ID de Animal</h4>
                    <p className="text-gray-900">{selectedExpense.animalId}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleOpenEditModal(selectedExpense);
                  }}
                  className="flex items-center px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedExpense(null);
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {showDeleteModal && selectedExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Confirmar Eliminación</h2>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedExpense(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">¿Estás seguro?</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Esta acción no se puede deshacer. El gasto será eliminado permanentemente.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg text-left">
                  <p className="text-sm text-gray-700">
                    <strong>Descripción:</strong> {selectedExpense.description}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Monto:</strong> {formatCurrency(selectedExpense.amount)}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Fecha:</strong> {formatDate(selectedExpense.date)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedExpense(null);
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={deleting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteExpense}
                  disabled={deleting}
                  className="flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Eliminando...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Eliminar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;