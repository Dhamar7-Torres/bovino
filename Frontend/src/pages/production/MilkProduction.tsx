import { useState, useEffect } from 'react';
import { 
  Milk, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Save
} from 'lucide-react';

interface MilkRecord {
  id: string;
  cowId: string;
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

const MilkProduction = () => {
  const [records, setRecords] = useState<MilkRecord[]>([]);
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
  const [status, setStatus] = useState('Pendiente');

  // Datos iniciales
  const initialRecords: MilkRecord[] = [
    {
      id: '1',
      cowId: 'COW001',
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
    },
    {
      id: '2',
      cowId: 'COW002',
      cowName: 'Maravilla',
      date: '2025-01-15',
      time: '06:15',
      quantity: 22.0,
      quality: 'Buena',
      fat: 3.5,
      protein: 3.0,
      temperature: 37.0,
      milkingSession: 'Mañana',
      notes: 'Producción normal',
      status: 'Procesada'
    }
  ];

  useEffect(() => {
    setRecords(initialRecords);
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
    setCowId(record.cowId);
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

  // Guardar nuevo registro
  const saveNewRecord = () => {
    if (!cowId || !cowName || !quantity) {
      alert('Complete los campos obligatorios');
      return;
    }

    const newRecord: MilkRecord = {
      id: Date.now().toString(),
      cowId,
      cowName,
      date,
      time,
      quantity: parseFloat(quantity) || 0,
      quality,
      fat: parseFloat(fat) || 0,
      protein: parseFloat(protein) || 0,
      temperature: parseFloat(temperature) || 0,
      milkingSession,
      notes,
      status
    };

    setRecords([newRecord, ...records]);
    setShowCreateModal(false);
    clearForm();
    alert('Registro creado exitosamente');
  };

  // Actualizar registro
  const updateRecord = () => {
    if (!selectedRecord || !cowId || !cowName || !quantity) {
      alert('Complete los campos obligatorios');
      return;
    }

    const updatedRecord: MilkRecord = {
      ...selectedRecord,
      cowId,
      cowName,
      date,
      time,
      quantity: parseFloat(quantity) || 0,
      quality,
      fat: parseFloat(fat) || 0,
      protein: parseFloat(protein) || 0,
      temperature: parseFloat(temperature) || 0,
      milkingSession,
      notes,
      status
    };

    setRecords(records.map(r => r.id === selectedRecord.id ? updatedRecord : r));
    setShowEditModal(false);
    setSelectedRecord(null);
    clearForm();
    alert('Registro actualizado exitosamente');
  };

  // Eliminar registro
  const deleteRecord = (id: string) => {
    if (window.confirm('¿Eliminar este registro?')) {
      setRecords(records.filter(r => r.id !== id));
      alert('Registro eliminado');
    }
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
                Gestión de registros de ordeño
              </p>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={handleCreate}
                className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Nuevo Registro
              </button>
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Registros de Producción ({records.length})
            </h2>
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
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium">{record.cowName}</div>
                        <div className="text-sm text-gray-500">{record.cowId}</div>
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
                ))}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Estado</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Procesada">Procesada</option>
                      <option value="Rechazada">Rechazada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Notas</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="Observaciones..."
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={saveNewRecord}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Guardar
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Estado</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Procesada">Procesada</option>
                      <option value="Rechazada">Rechazada</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Notas</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 border-t flex justify-end gap-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={updateRecord}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Actualizar
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
                      <div><strong>Vaca:</strong> {selectedRecord.cowName} ({selectedRecord.cowId})</div>
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