import { useState, useEffect } from 'react';
import { 
  Milk, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Save,
  Loader2,
  AlertCircle
} from 'lucide-react';

interface MilkRecord {
  id: string;
  bovineId: string;
  cowName: string;
  date: string;
  time: string;
  quantity: number;
  quality: string;
  fat: number;
  protein: number;
  temperature: number;
  milkingSession: string;
  notes: string;
  status: string;
}

// API configuration
const API_BASE_URL = 'http://localhost:5000/api';

const MilkProduction = () => {
  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MilkRecord | null>(null);

  // Campos del formulario
  const [cowId, setCowId] = useState('');
  const [cowName, setCowName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [quantity, setQuantity] = useState('');
  const [quality, setQuality] = useState('Buena');
  const [fat, setFat] = useState('');
  const [protein, setProtein] = useState('');
  const [temperature, setTemperature] = useState('');
  const [milkingSession, setMilkingSession] = useState('Mañana');
  const [notes, setNotes] = useState('');
  const [, setStatus] = useState('Pendiente');

  // =============================================================================
  // API FUNCTIONS
  // =============================================================================

  // Función para hacer llamadas a la API con manejo de errores
  const apiCall = async (url: string, options: RequestInit = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof Error) {
        throw new Error(`Error de conexión: ${error.message}`);
      }
      throw new Error('Error de conexión con el servidor');
    }
  };

  // Obtener todos los registros de producción
  const fetchRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Primero intentamos obtener registros específicos de leche
      let data;
      try {
        data = await apiCall('/production/milk');
      } catch (error) {
        // Si no existe endpoint específico de leche, usamos endpoint general
        console.warn('Endpoint específico de leche no disponible, usando endpoint general');
        data = await apiCall('/production/records?type=MILK');
      }
      
      if (data.success && data.data) {
        // Mapear datos del backend al formato del frontend
        const mappedRecords = (Array.isArray(data.data) ? data.data : []).map(transformBackendRecord);
        setRecords(mappedRecords);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
      setError(error instanceof Error ? error.message : 'Error obteniendo registros');
      // Usar datos de ejemplo si hay error de conexión
      setRecords([
        {
          id: '1',
          bovineId: 'COW001',
          cowName: 'Esperanza',
          date: '2025-01-15',
          time: '06:00',
          quantity: 25.5,
          quality: 'Excelente',
          fat: 3.8,
          protein: 3.2,
          temperature: 37.2,
          milkingSession: 'Mañana',
          notes: 'Vaca en excelente estado',
          status: 'Procesada'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Transformar datos del backend al formato del frontend
  const transformBackendRecord = (backendRecord: any): MilkRecord => {
    return {
      id: backendRecord.id || Date.now().toString(),
      bovineId: backendRecord.bovineId || backendRecord.cowId || '',
      cowName: backendRecord.cowName || `Vaca ${backendRecord.bovineId}`,
      date: backendRecord.productionDate ? backendRecord.productionDate.split('T')[0] : backendRecord.date || '',
      time: backendRecord.milkingTime || backendRecord.time || '06:00',
      quantity: parseFloat(backendRecord.quantity || backendRecord.value || '0'),
      quality: backendRecord.milkInfo?.quality || backendRecord.quality || 'Buena',
      fat: parseFloat(backendRecord.milkInfo?.fatContent || backendRecord.fat || '0'),
      protein: parseFloat(backendRecord.milkInfo?.proteinContent || backendRecord.protein || '0'),
      temperature: parseFloat(backendRecord.milkInfo?.temperature || backendRecord.temperature || '0'),
      milkingSession: mapMilkingSession(backendRecord.milkInfo?.milkingTime || backendRecord.milkingSession),
      notes: backendRecord.notes || '',
      status: backendRecord.status || 'Pendiente'
    };
  };

  // Mapear sesión de ordeño entre backend y frontend
  const mapMilkingSession = (session: string): string => {
    const sessionMap: { [key: string]: string } = {
      'MORNING': 'Mañana',
      'AFTERNOON': 'Tarde', 
      'EVENING': 'Noche',
      'NIGHT': 'Noche'
    };
    return sessionMap[session] || session || 'Mañana';
  };

  // Mapear sesión de ordeño del frontend al backend
  const mapMilkingSessionToBackend = (session: string): string => {
    const sessionMap: { [key: string]: string } = {
      'Mañana': 'MORNING',
      'Tarde': 'AFTERNOON',
      'Noche': 'EVENING'
    };
    return sessionMap[session] || 'MORNING';
  };

  // Crear nuevo registro
  const createRecord = async () => {
    if (!cowId || !cowName || !quantity) {
      alert('Complete los campos obligatorios');
      return;
    }

    const payload = {
      bovineId: cowId,
      quantity: parseFloat(quantity),
      milkingDate: `${date}T${time}:00`,
      milkingTime: mapMilkingSessionToBackend(milkingSession),
      quality: quality.toUpperCase(),
      fatContent: parseFloat(fat) || undefined,
      proteinContent: parseFloat(protein) || undefined,
      temperature: parseFloat(temperature) || undefined,
      location: {
        address: 'Finca Principal'
      },
      notes: notes || undefined
    };

    try {
      setSaving(true);
      const data = await apiCall('/production/milk', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (data.success) {
        alert('Registro creado exitosamente');
        setShowCreateModal(false);
        clearForm();
        fetchRecords(); // Recargar datos
      }
    } catch (error) {
      alert(`Error creando registro: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  // Actualizar registro
  const updateRecord = async () => {
    if (!selectedRecord || !cowId || !cowName || !quantity) {
      alert('Complete los campos obligatorios');
      return;
    }

    const payload = {
      bovineId: cowId,
      quantity: parseFloat(quantity),
      milkingDate: `${date}T${time}:00`,
      milkingTime: mapMilkingSessionToBackend(milkingSession),
      quality: quality.toUpperCase(),
      fatContent: parseFloat(fat) || undefined,
      proteinContent: parseFloat(protein) || undefined,
      temperature: parseFloat(temperature) || undefined,
      notes: notes || undefined
    };

    try {
      setSaving(true);
      const data = await apiCall(`/production/milk/${selectedRecord.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (data.success) {
        alert('Registro actualizado exitosamente');
        setShowEditModal(false);
        setSelectedRecord(null);
        clearForm();
        fetchRecords(); // Recargar datos
      }
    } catch (error) {
      alert(`Error actualizando registro: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
  };

  // Eliminar registro
  const deleteRecord = async (id: string) => {
    if (!window.confirm('¿Eliminar este registro?')) {
      return;
    }

    try {
      const data = await apiCall(`/production/milk/${id}`, {
        method: 'DELETE',
      });

      if (data.success) {
        alert('Registro eliminado exitosamente');
        fetchRecords(); // Recargar datos
      }
    } catch (error) {
      alert(`Error eliminando registro: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Probar conexión con el backend
  const testConnection = async () => {
    try {
      setError(null);
      const data = await apiCall('/health');
      if (data.success) {
        alert('✅ Conexión exitosa con el backend');
      }
    } catch (error) {
      setError(`❌ Error de conexión: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  useEffect(() => {
    fetchRecords();
  }, []);

  // Limpiar formulario
  const clearForm = () => {
    setCowId('');
    setCowName('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime(new Date().toTimeString().slice(0, 5));
    setQuantity('');
    setQuality('Buena');
    setFat('');
    setProtein('');
    setTemperature('');
    setMilkingSession('Mañana');
    setNotes('');
    setStatus('Pendiente');
  };

  // Cargar datos para editar
  const loadRecord = (record: MilkRecord) => {
    setCowId(record.bovineId);
    setCowName(record.cowName);
    setDate(record.date);
    setTime(record.time);
    setQuantity(record.quantity.toString());
    setQuality(record.quality);
    setFat(record.fat.toString());
    setProtein(record.protein.toString());
    setTemperature(record.temperature.toString());
    setMilkingSession(record.milkingSession);
    setNotes(record.notes);
    setStatus(record.status);
  };

  // Abrir modal crear
  const handleCreate = () => {
    clearForm();
    setShowCreateModal(true);
  };

  // Abrir modal editar
  const handleEdit = (record: MilkRecord) => {
    setSelectedRecord(record);
    loadRecord(record);
    setShowEditModal(true);
  };

  // Ver detalles
  const viewRecord = (record: MilkRecord) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-yellow-100 to-orange-400 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <Milk className="h-10 w-10" />
                Producción Lechera
              </h1>
              <p className="text-white/90 mt-2">
                Gestión de registros de ordeño - Conectado al Backend
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={testConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4" />
                Probar Conexión
              </button>
              <button 
                onClick={handleCreate}
                disabled={loading}
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 flex items-center gap-2 disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Nuevo Registro
              </button>
            </div>
          </div>

          {/* Connection Status */}
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error de conexión:</strong> {error}
            </div>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              Registros de Producción ({records.length})
            </h2>
            {loading && (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando...
              </div>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Vaca</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Fecha/Hora</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Cantidad</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Calidad</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        Cargando registros...
                      </div>
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      No hay registros disponibles
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{record.cowName}</div>
                          <div className="text-sm text-gray-500">{record.bovineId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{record.date}</div>
                        <div className="text-sm text-gray-500">{record.time} ({record.milkingSession})</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{record.quantity} L</div>
                        <div className="text-sm text-gray-500">{record.temperature}°C</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.quality === 'Excelente' ? 'bg-green-100 text-green-800' :
                          record.quality === 'Buena' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.quality}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          record.status === 'Procesada' ? 'bg-green-100 text-green-800' :
                          record.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewRecord(record)}
                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(record)}
                            className="p-1 text-green-600 hover:bg-green-100 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteRecord(record.id)}
                            className="p-1 text-red-600 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Crear */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Nuevo Registro</h3>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ID Vaca *</label>
                    <input
                      type="text"
                      value={cowId}
                      onChange={(e) => setCowId(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="COW001"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre Vaca *</label>
                    <input
                      type="text"
                      value={cowName}
                      onChange={(e) => setCowName(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Esperanza"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hora *</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sesión</label>
                    <select
                      value={milkingSession}
                      onChange={(e) => setMilkingSession(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noche">Noche</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cantidad (L) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="25.5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Calidad</label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Excelente">Excelente</option>
                      <option value="Buena">Buena</option>
                      <option value="Regular">Regular</option>
                      <option value="Deficiente">Deficiente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Grasa (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={fat}
                      onChange={(e) => setFat(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="3.8"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Proteína (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="3.2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Temperatura (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="37.0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notas</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={createRecord}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Editar */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Editar Registro</h3>
                  <button 
                    onClick={() => setShowEditModal(false)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">ID Vaca *</label>
                    <input
                      type="text"
                      value={cowId}
                      onChange={(e) => setCowId(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre Vaca *</label>
                    <input
                      type="text"
                      value={cowName}
                      onChange={(e) => setCowName(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Fecha *</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Hora *</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sesión</label>
                    <select
                      value={milkingSession}
                      onChange={(e) => setMilkingSession(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Mañana">Mañana</option>
                      <option value="Tarde">Tarde</option>
                      <option value="Noche">Noche</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Cantidad (L) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Calidad</label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Excelente">Excelente</option>
                      <option value="Buena">Buena</option>
                      <option value="Regular">Regular</option>
                      <option value="Deficiente">Deficiente</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Grasa (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={fat}
                      onChange={(e) => setFat(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Proteína (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={protein}
                      onChange={(e) => setProtein(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Temperatura (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notas</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    rows={3}
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  onClick={updateRecord}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {saving ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ver */}
        {showViewModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl">
              <div className="p-6 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Detalles del Registro</h3>
                  <button 
                    onClick={() => setShowViewModal(false)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Información General</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Vaca:</strong> {selectedRecord.cowName} ({selectedRecord.bovineId})</div>
                      <div><strong>Fecha:</strong> {selectedRecord.date}</div>
                      <div><strong>Hora:</strong> {selectedRecord.time}</div>
                      <div><strong>Sesión:</strong> {selectedRecord.milkingSession}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Análisis</h4>
                    <div className="space-y-2 text-sm">
                      <div><strong>Cantidad:</strong> {selectedRecord.quantity} L</div>
                      <div><strong>Calidad:</strong> {selectedRecord.quality}</div>
                      <div><strong>Grasa:</strong> {selectedRecord.fat}%</div>
                      <div><strong>Proteína:</strong> {selectedRecord.protein}%</div>
                      <div><strong>Temperatura:</strong> {selectedRecord.temperature}°C</div>
                      <div><strong>Estado:</strong> {selectedRecord.status}</div>
                    </div>
                  </div>
                </div>
                {selectedRecord.notes && (
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Notas</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded">{selectedRecord.notes}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t flex justify-end">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilkProduction;