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
  Navigation,
} from "lucide-react";

interface IncomeRecord {
  id: string;
  date: string;
  description: string;
  category:
    | "venta_ganado"
    | "productos_lacteos"
    | "servicios_veterinarios"
    | "otros";
  amount: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  animalId?: string;
  status: "completed" | "pending" | "cancelled";
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
};

// Formulario para agregar/editar ingreso
interface IncomeFormProps {
  formData: {
    description: string;
    category: IncomeRecord["category"];
    amount: string;
    date: string;
    address: string;
    animalId: string;
    status: IncomeRecord["status"];
  };
  onFormChange: (field: string, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onGetLocation: () => void;
  isGettingLocation: boolean;
  submitLabel: string;
}

const IncomeForm: React.FC<IncomeFormProps> = ({ 
  formData, 
  onFormChange, 
  onSubmit, 
  onCancel, 
  onGetLocation,
  isGettingLocation,
  submitLabel 
}) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Descripción *
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => onFormChange("description", e.target.value)}
          placeholder="Descripción del ingreso"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Categoría *
        </label>
        <select
          value={formData.category}
          onChange={(e) => onFormChange("category", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="venta_ganado">Venta de Ganado</option>
          <option value="productos_lacteos">Productos Lácteos</option>
          <option value="servicios_veterinarios">Servicios Veterinarios</option>
          <option value="otros">Otros</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Monto *
        </label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) => onFormChange("amount", e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Fecha *
        </label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => onFormChange("date", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ubicación
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onFormChange("address", e.target.value)}
            placeholder="Dirección o ubicación"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <button
            type="button"
            onClick={onGetLocation}
            disabled={isGettingLocation}
            className="flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors duration-200"
          >
            {isGettingLocation ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Haga clic en el botón para obtener su ubicación actual
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ID Animal (opcional)
        </label>
        <input
          type="text"
          value={formData.animalId}
          onChange={(e) => onFormChange("animalId", e.target.value)}
          placeholder="ID del animal relacionado"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado
        </label>
        <select
          value={formData.status}
          onChange={(e) => onFormChange("status", e.target.value as IncomeRecord["status"])}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="completed">Completado</option>
          <option value="pending">Pendiente</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>
    </div>

    <div className="flex justify-end space-x-3 pt-4">
      <button
        onClick={onCancel}
        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
      >
        Cancelar
      </button>
      <button
        onClick={onSubmit}
        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
      >
        <Save className="w-4 h-4 mr-2" />
        {submitLabel}
      </button>
    </div>
  </div>
);

const IncomeTracker: React.FC = () => {
  // Estados del componente
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<IncomeRecord | null>(null);
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Formulario para nuevo/editar ingreso
  const [formData, setFormData] = useState({
    description: "",
    category: "venta_ganado" as IncomeRecord["category"],
    amount: "",
    date: new Date().toISOString().split('T')[0],
    address: "",
    animalId: "",
    status: "completed" as IncomeRecord["status"],
  });

  // Datos iniciales de ejemplo para ingresos
  const initialIncomeRecords: IncomeRecord[] = [
    {
      id: "inc_001",
      date: "2024-06-15",
      description: "Venta de 5 cabezas de ganado Holstein",
      category: "venta_ganado",
      amount: 125000,
      location: {
        lat: 17.9895,
        lng: -92.9475,
        address: "Rancho San José, Villahermosa",
      },
      animalId: "cow_015",
      status: "completed",
    },
    {
      id: "inc_002",
      date: "2024-06-14",
      description: "Venta de leche orgánica - 500L",
      category: "productos_lacteos",
      amount: 8500,
      location: {
        lat: 17.9995,
        lng: -92.9375,
        address: "Lechería La Esperanza",
      },
      status: "completed",
    },
    {
      id: "inc_003",
      date: "2024-06-13",
      description: "Servicios veterinarios a rancho vecino",
      category: "servicios_veterinarios",
      amount: 15000,
      location: { lat: 17.9795, lng: -92.9575, address: "Rancho El Mirador" },
      status: "completed",
    },
  ];

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const timer = setTimeout(() => {
      setIncomeRecords(initialIncomeRecords);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Funciones de geolocalización
  const getCurrentLocation = async (): Promise<{ address: string; lat: number; lng: number } | null> => {
    if (!navigator.geolocation) {
      alert("La geolocalización no está soportada en este navegador");
      return null;
    }

    return new Promise((resolve) => {
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Usar la API de geocodificación inversa (aquí simulamos con una dirección)
            // En un caso real, usarías Google Maps API o similar
            const address = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}, Villahermosa, Tabasco`;
            
            setIsGettingLocation(false);
            resolve({
              address,
              lat: latitude,
              lng: longitude
            });
          } catch (error) {
            console.error("Error obteniendo dirección:", error);
            setIsGettingLocation(false);
            resolve({
              address: `Ubicación actual (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
              lat: latitude,
              lng: longitude
            });
          }
        },
        (error) => {
          console.error("Error obteniendo ubicación:", error);
          setIsGettingLocation(false);
          alert("No se pudo obtener la ubicación. Verifique los permisos.");
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        }
      );
    });
  };

  const handleGetCurrentLocation = async () => {
    const location = await getCurrentLocation();
    if (location) {
      handleFormChange("address", location.address);
    }
  };
  const resetForm = () => {
    setFormData({
      description: "",
      category: "venta_ganado",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      address: "",
      animalId: "",
      status: "completed",
    });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Funciones de CRUD
  const handleAddIncome = () => {
    if (!formData.description || !formData.amount) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    const newRecord: IncomeRecord = {
      id: `inc_${Date.now()}`,
      date: formData.date,
      description: formData.description,
      category: formData.category,
      amount: parseFloat(formData.amount),
      location: {
        lat: 17.9895,
        lng: -92.9475,
        address: formData.address || "Ubicación no especificada",
      },
      animalId: formData.animalId || undefined,
      status: formData.status,
    };

    setIncomeRecords(prev => [newRecord, ...prev]);
    setShowAddModal(false);
    resetForm();
    alert("Ingreso agregado exitosamente");
  };

  const handleEditIncome = () => {
    if (!selectedRecord || !formData.description || !formData.amount) {
      alert("Por favor complete todos los campos obligatorios");
      return;
    }

    const updatedRecord: IncomeRecord = {
      ...selectedRecord,
      date: formData.date,
      description: formData.description,
      category: formData.category,
      amount: parseFloat(formData.amount),
      location: {
        ...selectedRecord.location,
        address: formData.address,
      },
      animalId: formData.animalId || undefined,
      status: formData.status,
    };

    setIncomeRecords(prev => 
      prev.map(record => 
        record.id === selectedRecord.id ? updatedRecord : record
      )
    );
    
    setShowEditModal(false);
    setSelectedRecord(null);
    resetForm();
    alert("Ingreso actualizado exitosamente");
  };

  const handleDeleteIncome = (recordId: string) => {
    if (window.confirm("¿Está seguro de que desea eliminar este registro?")) {
      setIncomeRecords(prev => prev.filter(record => record.id !== recordId));
      alert("Registro eliminado exitosamente");
    }
  };

  const handleViewRecord = (record: IncomeRecord) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleEditRecord = (record: IncomeRecord) => {
    setSelectedRecord(record);
    setFormData({
      description: record.description,
      category: record.category,
      amount: record.amount.toString(),
      date: record.date,
      address: record.location.address,
      animalId: record.animalId || "",
      status: record.status,
    });
    setShowEditModal(true);
  };

  const handleExport = () => {
    try {
      const csvContent = [
        "Fecha,Descripción,Categoría,Monto,Ubicación,Estado",
        ...incomeRecords.map(record => 
          `${record.date},"${record.description}","${getCategoryName(record.category)}",${record.amount},"${record.location.address}","${record.status}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `ingresos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      alert("Datos exportados exitosamente");
    } catch (error) {
      console.error("Error al exportar:", error);
      alert("Error al exportar los datos");
    }
  };

  // Animaciones de Framer Motion
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

  // Función para formatear números a moneda
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Función para formatear fechas
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Obtener el nombre de la categoría
  const getCategoryName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      venta_ganado: "Venta de Ganado",
      productos_lacteos: "Productos Lácteos",
      servicios_veterinarios: "Servicios Veterinarios",
      otros: "Otros",
    };
    return categoryMap[category] || category;
  };

  // Obtener el color del estado
  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      completed: "bg-green-500",
      pending: "bg-yellow-500",
      cancelled: "bg-red-500",
    };
    return statusColors[status] || "bg-gray-500";
  };

  const getStatusText = (status: string): string => {
    const statusText: Record<string, string> = {
      completed: "Completado",
      pending: "Pendiente",
      cancelled: "Cancelado",
    };
    return statusText[status] || status;
  };

  // Componente de Loading
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-yellow-400">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-white border-t-transparent rounded-full"
      />
    </div>
  );



  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-400 via-green-500 to-yellow-400 p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header del Seguimiento de Ingresos */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Seguimiento de Ingresos
            </h1>
            <p className="text-white/80 text-lg">
              Control detallado de todos los ingresos del rancho
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Ingreso
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg font-medium transition-all duration-300 shadow-lg backdrop-blur-sm"
            >
              <Download className="w-5 h-5 mr-2" />
              Exportar
            </button>
          </div>
        </motion.div>

        {/* Tabla de registros de ingresos */}
        <motion.div
          variants={itemVariants}
          className="bg-white/90 backdrop-blur-md rounded-xl p-6 border border-white/20 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              Registros Recientes
            </h3>
            <div className="text-sm text-gray-600">
              {incomeRecords.length} registros
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">
                    Fecha
                  </th>
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">
                    Descripción
                  </th>
                  <th className="text-left py-3 px-4 text-gray-700 font-medium">
                    Categoría
                  </th>
                  <th className="text-right py-3 px-4 text-gray-700 font-medium">
                    Monto
                  </th>
                  <th className="text-center py-3 px-4 text-gray-700 font-medium">
                    Estado
                  </th>
                  <th className="text-center py-3 px-4 text-gray-700 font-medium">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {incomeRecords.map((record) => (
                  <motion.tr
                    key={record.id}
                    whileHover={{
                      backgroundColor: "#F9FAFB",
                    }}
                    className="border-b border-gray-100 transition-colors duration-200"
                  >
                    <td className="py-4 px-4 text-gray-600">
                      {formatDate(record.date)}
                    </td>
                    <td className="py-4 px-4 text-gray-900 font-medium">
                      {record.description}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {getCategoryName(record.category)}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-900 font-semibold">
                      {formatCurrency(record.amount)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span
                        className={`inline-block w-3 h-3 rounded-full ${getStatusColor(
                          record.status
                        )}`}
                        title={getStatusText(record.status)}
                      ></span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleViewRecord(record)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditRecord(record)}
                          className="p-2 text-yellow-500 hover:bg-yellow-50 rounded-lg transition-colors duration-200"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteIncome(record.id)}
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
        </motion.div>
      </motion.div>

      {/* Modal para agregar ingreso */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          resetForm();
        }}
        title="Agregar Nuevo Ingreso"
      >
        <IncomeForm 
          formData={formData}
          onFormChange={handleFormChange}
          onSubmit={handleAddIncome} 
          onCancel={() => {
            setShowAddModal(false);
            resetForm();
          }}
          onGetLocation={handleGetCurrentLocation}
          isGettingLocation={isGettingLocation}
          submitLabel="Guardar Ingreso" 
        />
      </Modal>

      {/* Modal para editar ingreso */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRecord(null);
          resetForm();
        }}
        title="Editar Ingreso"
      >
        <IncomeForm 
          formData={formData}
          onFormChange={handleFormChange}
          onSubmit={handleEditIncome} 
          onCancel={() => {
            setShowEditModal(false);
            setSelectedRecord(null);
            resetForm();
          }}
          onGetLocation={handleGetCurrentLocation}
          isGettingLocation={isGettingLocation}
          submitLabel="Actualizar Ingreso" 
        />
      </Modal>

      {/* Modal para ver detalles */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedRecord(null);
        }}
        title="Detalles del Ingreso"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <div className="flex items-center text-gray-900">
                  <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                  {formatDate(selectedRecord.date)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <div className="text-gray-900">
                  {getCategoryName(selectedRecord.category)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto
                </label>
                <div className="text-gray-900 font-semibold text-lg">
                  {formatCurrency(selectedRecord.amount)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <div className="flex items-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full mr-2 ${getStatusColor(
                      selectedRecord.status
                    )}`}
                  ></span>
                  {getStatusText(selectedRecord.status)}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <div className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                {selectedRecord.description}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ubicación
              </label>
              <div className="flex items-center text-gray-900">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                {selectedRecord.location.address}
              </div>
            </div>

            {selectedRecord.animalId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Animal Relacionado
                </label>
                <div className="text-gray-900">
                  {selectedRecord.animalId}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IncomeTracker;