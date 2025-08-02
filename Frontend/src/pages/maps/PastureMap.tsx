import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// ===================================================================
// INTERFACES Y TIPOS
// ===================================================================

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface Pasture {
  id: string;
  name: string;
  area: number; // hectáreas
  capacity: number; // número máximo de animales
  currentAnimals: number;
  grassType: string;
  coordinates: Coordinates[];
  status: 'active' | 'resting' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

interface NewPasture {
  name: string;
  area: number;
  capacity: number;
  grassType: string;
  coordinates: Coordinates[];
  status: 'active' | 'resting' | 'maintenance';
}

// ===================================================================
// CONFIGURACIÓN BÁSICA
// ===================================================================

// Coordenadas por defecto para Villahermosa, Tabasco
const DEFAULT_CENTER: [number, number] = [17.9869, -92.9303];

// ===================================================================
// COMPONENTE DE EVENTOS DEL MAPA
// ===================================================================

interface MapEventsProps {
  onMapClick: (coordinates: Coordinates) => void;
  isDrawingMode: boolean;
}

const MapEvents: React.FC<MapEventsProps> = ({ onMapClick, isDrawingMode }) => {
  useMapEvents({
    click: (e: any) => {
      if (isDrawingMode) {
        onMapClick({
          latitude: e.latlng.lat,
          longitude: e.latlng.lng
        });
      }
    },
  });

  return null;
};

// ===================================================================
// COMPONENTE PRINCIPAL
// ===================================================================

const PastureMap: React.FC = () => {
  // Estados principales
  const [pastures, setPastures] = useState<Pasture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [currentDrawingCoords, setCurrentDrawingCoords] = useState<Coordinates[]>([]);
  
  // Estados del formulario
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<NewPasture>>({
    name: '',
    area: 0,
    capacity: 0,
    grassType: '',
    status: 'active'
  });

  // ===================================================================
  // EFECTOS
  // ===================================================================

  useEffect(() => {
    loadPastures();
  }, []);

  // ===================================================================
  // FUNCIONES DE API
  // ===================================================================

  const loadPastures = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simular datos de ejemplo por ahora
      const mockPastures: Pasture[] = [
        {
          id: 'potrero_1',
          name: 'Potrero Principal',
          area: 15.5,
          capacity: 50,
          currentAnimals: 32,
          grassType: 'Brachiaria',
          coordinates: [
            { latitude: 17.9900, longitude: -92.9350 },
            { latitude: 17.9900, longitude: -92.9250 },
            { latitude: 17.9800, longitude: -92.9250 },
            { latitude: 17.9800, longitude: -92.9350 }
          ],
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'potrero_2',
          name: 'Potrero Norte',
          area: 12.0,
          capacity: 40,
          currentAnimals: 25,
          grassType: 'Guinea',
          coordinates: [
            { latitude: 17.9950, longitude: -92.9350 },
            { latitude: 17.9950, longitude: -92.9250 },
            { latitude: 17.9900, longitude: -92.9250 },
            { latitude: 17.9900, longitude: -92.9350 }
          ],
          status: 'resting',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setPastures(mockPastures);

      // Descomentar cuando tengas la API lista:
      /*
      const response = await fetch('/api/maps/ranch-data?includePotreros=true', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar las pasturas');
      }

      const data = await response.json();
      
      if (data.success && data.data.potreros) {
        setPastures(data.data.potreros.map((potrero: any) => ({
          id: potrero.id,
          name: potrero.name,
          area: potrero.area,
          capacity: potrero.capacity,
          currentAnimals: potrero.currentAnimals,
          grassType: potrero.grassType,
          coordinates: potrero.coordinates,
          status: potrero.status || 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })));
      }
      */
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error loading pastures:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const savePasture = async (pastureData: NewPasture) => {
    try {
      // Simular guardado exitoso por ahora
      const newPasture: Pasture = {
        id: `potrero_${Date.now()}`,
        ...pastureData,
        currentAnimals: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setPastures(prev => [...prev, newPasture]);
      resetForm();
      return true;

      // Descomentar cuando tengas la API lista:
      /*
      const response = await fetch('/api/maps/geofences', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: pastureData.name,
          type: 'pasture',
          coordinates: pastureData.coordinates,
          metadata: {
            area: pastureData.area,
            capacity: pastureData.capacity,
            grassType: pastureData.grassType,
            status: pastureData.status
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error al guardar la pastura');
      }

      const result = await response.json();
      
      if (result.success) {
        await loadPastures();
        resetForm();
        return true;
      } else {
        throw new Error(result.message || 'Error al guardar');
      }
      */
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
      return false;
    }
  };

  // ===================================================================
  // MANEJADORES DE EVENTOS
  // ===================================================================

  const handleMapClick = useCallback((coordinates: Coordinates) => {
    if (isDrawingMode) {
      setCurrentDrawingCoords(prev => [...prev, coordinates]);
    }
  }, [isDrawingMode]);

  const handleStartDrawing = () => {
    setIsDrawingMode(true);
    setCurrentDrawingCoords([]);
    setShowForm(true);
  };

  const handleFinishDrawing = () => {
    if (currentDrawingCoords.length < 3) {
      alert('Necesitas al menos 3 puntos para crear una pastura');
      return;
    }
    
    setIsDrawingMode(false);
    setFormData(prev => ({
      ...prev,
      coordinates: currentDrawingCoords
    }));
  };

  const handleCancelDrawing = () => {
    setIsDrawingMode(false);
    setCurrentDrawingCoords([]);
    setShowForm(false);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'area' || name === 'capacity' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.grassType || currentDrawingCoords.length < 3) {
      alert('Por favor completa todos los campos y define el área de la pastura');
      return;
    }

    const newPasture: NewPasture = {
      name: formData.name!,
      area: formData.area || 0,
      capacity: formData.capacity || 0,
      grassType: formData.grassType!,
      coordinates: currentDrawingCoords,
      status: formData.status as 'active' | 'resting' | 'maintenance'
    };

    const success = await savePasture(newPasture);
    if (success) {
      alert('Pastura registrada exitosamente');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      area: 0,
      capacity: 0,
      grassType: '',
      status: 'active'
    });
    setCurrentDrawingCoords([]);
    setShowForm(false);
    setIsDrawingMode(false);
  };

  // ===================================================================
  // FUNCIONES DE UTILIDAD
  // ===================================================================

  const getPastureColor = (status: string) => {
    switch (status) {
      case 'active': return '#22c55e';
      case 'resting': return '#f59e0b';
      case 'maintenance': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'resting': return 'En descanso';
      case 'maintenance': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  };

  // ===================================================================
  // RENDERIZADO
  // ===================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        <span className="ml-3 text-lg">Cargando mapa de pasturas...</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      {/* Header con controles */}
      <div style={{ 
        position: 'absolute', 
        top: '16px', 
        left: '16px', 
        zIndex: 1000, 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
        padding: '16px' 
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#374151', marginBottom: '12px' }}>
          Mapa de Pasturas
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {!isDrawingMode ? (
            <button
              onClick={handleStartDrawing}
              style={{
                backgroundColor: '#16a34a',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#15803d'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
            >
              ➕ Agregar Nueva Pastura
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280' }}>
                Haz clic en el mapa para definir los límites de la pastura
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleFinishDrawing}
                  disabled={currentDrawingCoords.length < 3}
                  style={{
                    backgroundColor: currentDrawingCoords.length < 3 ? '#9ca3af' : '#2563eb',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: currentDrawingCoords.length < 3 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Finalizar ({currentDrawingCoords.length})
                </button>
                <button
                  onClick={handleCancelDrawing}
                  style={{
                    backgroundColor: '#6b7280',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            <p>📍 Total: {pastures.length} pasturas</p>
            <p>🐄 Capacidad total: {pastures.reduce((sum, p) => sum + p.capacity, 0)} animales</p>
          </div>
        </div>
      </div>

      {/* Formulario de nueva pastura */}
      {showForm && !isDrawingMode && (
        <div style={{ 
          position: 'absolute', 
          top: '16px', 
          right: '16px', 
          zIndex: 1000, 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
          padding: '16px', 
          width: '320px' 
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
            Registrar Nueva Pastura
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Nombre de la Pastura
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  padding: '8px 12px', 
                  fontSize: '14px' 
                }}
                placeholder="Ej: Potrero Norte"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Área (ha)
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area || ''}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px', 
                    padding: '8px 12px', 
                    fontSize: '14px' 
                  }}
                  min="0"
                  step="0.1"
                  placeholder="15.5"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                  Capacidad
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity || ''}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '6px', 
                    padding: '8px 12px', 
                    fontSize: '14px' 
                  }}
                  min="0"
                  placeholder="50"
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Tipo de Pasto
              </label>
              <select
                name="grassType"
                value={formData.grassType || ''}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  padding: '8px 12px', 
                  fontSize: '14px' 
                }}
                required
              >
                <option value="">Seleccionar...</option>
                <option value="Brachiaria">Brachiaria</option>
                <option value="Guinea">Guinea</option>
                <option value="Estrella">Estrella</option>
                <option value="Tanzania">Tanzania</option>
                <option value="Pangola">Pangola</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
                Estado
              </label>
              <select
                name="status"
                value={formData.status || 'active'}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '6px', 
                  padding: '8px 12px', 
                  fontSize: '14px' 
                }}
              >
                <option value="active">Activa</option>
                <option value="resting">En descanso</option>
                <option value="maintenance">Mantenimiento</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '8px', paddingTop: '8px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  backgroundColor: '#16a34a',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Guardar Pastura
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  flex: 1,
                  backgroundColor: '#6b7280',
                  color: 'white',
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div style={{ 
          position: 'absolute', 
          bottom: '16px', 
          left: '16px', 
          zIndex: 1000, 
          backgroundColor: '#fef2f2', 
          border: '1px solid #fca5a5', 
          color: '#dc2626', 
          padding: '12px 16px', 
          borderRadius: '6px' 
        }}>
          {error}
        </div>
      )}

      {/* Mapa */}
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={15}
        style={{ width: '100%', height: '100%', borderRadius: '8px' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Eventos del mapa */}
        <MapEvents 
          onMapClick={handleMapClick} 
          isDrawingMode={isDrawingMode} 
        />

        {/* Pasturas existentes */}
        {pastures.map((pasture) => (
          <React.Fragment key={pasture.id}>
            {/* Polígono de la pastura */}
            <Polygon
              positions={pasture.coordinates.map(coord => [coord.latitude, coord.longitude] as [number, number])}
              pathOptions={{
                color: getPastureColor(pasture.status),
                fillColor: getPastureColor(pasture.status),
                fillOpacity: 0.3,
                weight: 2
              }}
            >
              <Popup>
                <div style={{ padding: '8px' }}>
                  <h3 style={{ fontWeight: 'bold', fontSize: '18px', margin: '0 0 8px 0' }}>
                    {pasture.name}
                  </h3>
                  <div style={{ fontSize: '14px', lineHeight: '1.4' }}>
                    <p><strong>Área:</strong> {pasture.area} hectáreas</p>
                    <p><strong>Capacidad:</strong> {pasture.capacity} animales</p>
                    <p><strong>Actual:</strong> {pasture.currentAnimals} animales</p>
                    <p><strong>Tipo de pasto:</strong> {pasture.grassType}</p>
                    <p><strong>Estado:</strong> 
                      <span style={{
                        marginLeft: '4px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        color: 'white',
                        backgroundColor: pasture.status === 'active' ? '#22c55e' :
                                       pasture.status === 'resting' ? '#f59e0b' : '#ef4444'
                      }}>
                        {getStatusText(pasture.status)}
                      </span>
                    </p>
                    <p><strong>Ocupación:</strong> {Math.round((pasture.currentAnimals / pasture.capacity) * 100)}%</p>
                  </div>
                </div>
              </Popup>
            </Polygon>
          </React.Fragment>
        ))}

        {/* Marcadores temporales para dibujo */}
        {currentDrawingCoords.map((coord, index) => (
          <Marker
            key={`temp-${index}`}
            position={[coord.latitude, coord.longitude]}
          >
            <Popup>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '14px', margin: '0 0 8px 0' }}>Punto {index + 1}</p>
                <button
                  onClick={() => {
                    setCurrentDrawingCoords(prev => prev.filter((_, i) => i !== index));
                  }}
                  style={{
                    color: '#dc2626',
                    fontSize: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Eliminar
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Polígono temporal para dibujo */}
        {currentDrawingCoords.length > 2 && (
          <Polygon
            positions={currentDrawingCoords.map(coord => [coord.latitude, coord.longitude] as [number, number])}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#3b82f6",
              fillOpacity: 0.2,
              weight: 2,
              dashArray: "5, 5"
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default PastureMap;