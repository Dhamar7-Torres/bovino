import React, { useState, useEffect, useCallback, useRef } from 'react';

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

interface MapPoint {
  x: number;
  y: number;
}

// ===================================================================
// CONFIGURACIÓN DEL MAPA
// ===================================================================

const MAP_CONFIG = {
  // Villahermosa, Tabasco bounds
  minLat: 17.900,
  maxLat: 18.100,
  minLng: -93.050,
  maxLng: -92.850,
  width: 800,
  height: 600
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

  const mapRef = useRef<HTMLDivElement>(null);

  // ===================================================================
  // EFECTOS
  // ===================================================================

  useEffect(() => {
    loadPastures();
  }, []);

  // ===================================================================
  // FUNCIONES DE CONVERSIÓN DE COORDENADAS
  // ===================================================================

  const latLngToPixel = (lat: number, lng: number): MapPoint => {
    const x = ((lng - MAP_CONFIG.minLng) / (MAP_CONFIG.maxLng - MAP_CONFIG.minLng)) * MAP_CONFIG.width;
    const y = ((MAP_CONFIG.maxLat - lat) / (MAP_CONFIG.maxLat - MAP_CONFIG.minLat)) * MAP_CONFIG.height;
    return { x, y };
  };

  const pixelToLatLng = (x: number, y: number): Coordinates => {
    const lng = MAP_CONFIG.minLng + (x / MAP_CONFIG.width) * (MAP_CONFIG.maxLng - MAP_CONFIG.minLng);
    const lat = MAP_CONFIG.maxLat - (y / MAP_CONFIG.height) * (MAP_CONFIG.maxLat - MAP_CONFIG.minLat);
    return { latitude: lat, longitude: lng };
  };

  // ===================================================================
  // FUNCIONES DE API
  // ===================================================================

  const loadPastures = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Datos de ejemplo con coordenadas en Villahermosa
      const mockPastures: Pasture[] = [
        {
          id: 'potrero_1',
          name: 'Potrero Principal',
          area: 15.5,
          capacity: 50,
          currentAnimals: 32,
          grassType: 'Brachiaria',
          coordinates: [
            { latitude: 17.990, longitude: -92.935 },
            { latitude: 17.990, longitude: -92.925 },
            { latitude: 17.980, longitude: -92.925 },
            { latitude: 17.980, longitude: -92.935 }
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
            { latitude: 17.995, longitude: -92.935 },
            { latitude: 17.995, longitude: -92.925 },
            { latitude: 17.990, longitude: -92.925 },
            { latitude: 17.990, longitude: -92.935 }
          ],
          status: 'resting',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      setPastures(mockPastures);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error loading pastures:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const savePasture = async (pastureData: NewPasture) => {
    try {
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

      // Aquí puedes agregar la llamada a tu API cuando esté lista:
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
      */
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
      return false;
    }
  };

  const deletePasture = async (pastureId: string) => {
    try {
      // Encontrar la pastura
      const pasture = pastures.find(p => p.id === pastureId);
      if (!pasture) return;

      // Eliminar de la lista
      setPastures(prev => prev.filter(p => p.id !== pastureId));
      
      // Mostrar mensaje de éxito
      alert(`✅ Pastura "${pasture.name}" eliminada exitosamente`);
      
      // Aquí puedes agregar la llamada a tu API cuando esté lista:
      /*
      const response = await fetch(`/api/maps/geofences/${pastureId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      */

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar');
      return false;
    }
  };

  // ===================================================================
  // MANEJADORES DE EVENTOS
  // ===================================================================

  const handleMapClick = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawingMode || !mapRef.current) return;

    const rect = mapRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const coordinates = pixelToLatLng(x, y);
    setCurrentDrawingCoords(prev => [...prev, coordinates]);
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

  const removeTempPoint = (index: number) => {
    setCurrentDrawingCoords(prev => prev.filter((_, i) => i !== index));
  };

  const showPastureInfo = (pasture: Pasture) => {
    const occupancy = Math.round((pasture.currentAnimals / pasture.capacity) * 100);
    const statusEmoji = pasture.status === 'active' ? '✅' : pasture.status === 'resting' ? '⏸️' : '🔧';
    
    const message = `${statusEmoji} ${pasture.name}

📏 Área: ${pasture.area} hectáreas
🐄 Capacidad: ${pasture.capacity} animales
📊 Actual: ${pasture.currentAnimals} animales (${occupancy}%)
🌾 Tipo de pasto: ${pasture.grassType}
📈 Estado: ${getStatusText(pasture.status)}

¿Qué deseas hacer con esta pastura?`;

    const action = window.confirm(`${message}\n\n✅ ACEPTAR = Ver solo información\n❌ CANCELAR = Eliminar pastura`);
    
    if (!action) {
      // Si presiona cancelar, preguntar confirmación para eliminar
      const confirmDelete = window.confirm(`🗑️ ¿Eliminar "${pasture.name}"?\n\n⚠️ Esta acción no se puede deshacer.\n\n✅ SÍ, eliminar\n❌ NO, cancelar`);
      if (confirmDelete) {
        deletePasture(pasture.id);
      }
    }
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

  const createPolygonPath = (coordinates: Coordinates[]): string => {
    return coordinates.map((coord, index) => {
      const point = latLngToPixel(coord.latitude, coord.longitude);
      return `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`;
    }).join(' ') + ' Z';
  };

  // ===================================================================
  // RENDERIZADO
  // ===================================================================

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #f3f4f6',
          borderTop: '4px solid #16a34a',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <span style={{ marginLeft: '12px', fontSize: '18px' }}>Cargando mapa de pasturas...</span>
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '600px', position: 'relative' }}>
      {/* Header con controles mejorado */}
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        zIndex: 1000, 
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
        borderRadius: '16px', 
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ 
            backgroundColor: '#22c55e', 
            borderRadius: '12px', 
            padding: '8px', 
            marginRight: '12px',
            boxShadow: '0 4px 8px rgba(34, 197, 94, 0.3)'
          }}>
            <span style={{ fontSize: '20px' }}>🗺️</span>
          </div>
          <div>
            <h2 style={{ 
              fontSize: '22px', 
              fontWeight: 'bold', 
              color: '#1f2937', 
              margin: '0',
              background: 'linear-gradient(135deg, #1f2937 0%, #22c55e 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Mapa de Pasturas
            </h2>
            <p style={{ 
              fontSize: '13px', 
              color: '#6b7280', 
              margin: '2px 0 0 0',
              fontWeight: '500'
            }}>
              Gestión inteligente de pastoreo
            </p>
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!isDrawingMode ? (
            <button
              onClick={handleStartDrawing}
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                color: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
              }}
            >
              <span style={{ fontSize: '16px' }}>➕</span>
              Agregar Nueva Pastura
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '2px dashed #3b82f6',
                borderRadius: '8px',
                padding: '12px',
                textAlign: 'center'
              }}>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#3b82f6', 
                  margin: '0 0 8px 0',
                  fontWeight: '600'
                }}>
                  🎯 Modo de Dibujo Activo
                </p>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  margin: '0'
                }}>
                  Haz clic en el mapa para definir los límites
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleFinishDrawing}
                  disabled={currentDrawingCoords.length < 3}
                  style={{
                    flex: 1,
                    background: currentDrawingCoords.length < 3 
                      ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                      : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: currentDrawingCoords.length < 3 ? 'not-allowed' : 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    boxShadow: currentDrawingCoords.length < 3 
                      ? 'none' 
                      : '0 3px 8px rgba(59, 130, 246, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ✓ Finalizar ({currentDrawingCoords.length})
                </button>
                <button
                  onClick={handleCancelDrawing}
                  style={{
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: 'white',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: '600',
                    boxShadow: '0 3px 8px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
          )}
          
          {/* Estadísticas mejoradas */}
          <div style={{ 
            backgroundColor: 'rgba(248, 250, 252, 0.8)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#22c55e',
                  marginBottom: '4px'
                }}>
                  {pastures.length}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                  📍 Pasturas
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: '#3b82f6',
                  marginBottom: '4px'
                }}>
                  {pastures.reduce((sum, p) => sum + p.capacity, 0)}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500' }}>
                  🐄 Capacidad
                </div>
              </div>
            </div>
            <div style={{ 
              marginTop: '12px',
              padding: '8px 12px',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '600' }}>
                📊 Área Total: {pastures.reduce((sum, p) => sum + p.area, 0).toFixed(1)} ha
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario de nueva pastura mejorado */}
      {showForm && !isDrawingMode && (
        <div style={{ 
          position: 'absolute', 
          top: '20px', 
          right: '20px', 
          zIndex: 1000, 
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
          borderRadius: '16px', 
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
          padding: '24px', 
          width: '340px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ 
              backgroundColor: '#3b82f6', 
              borderRadius: '12px', 
              padding: '8px', 
              marginRight: '12px',
              boxShadow: '0 4px 8px rgba(59, 130, 246, 0.3)'
            }}>
              <span style={{ fontSize: '18px' }}>📝</span>
            </div>
            <div>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '700', 
                margin: '0',
                background: 'linear-gradient(135deg, #1f2937 0%, #3b82f6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Nueva Pastura
              </h3>
              <p style={{ 
                fontSize: '12px', 
                color: '#6b7280', 
                margin: '2px 0 0 0'
              }}>
                Completa la información
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ 
                display: 'flex', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '6px',
                alignItems: 'center',
                gap: '6px'
              }}>
                🏷️ Nombre de la Pastura
              </label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '12px 16px', 
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
                placeholder="Ej: Potrero Norte"
                required
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ 
                  display: 'flex', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '6px',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  📏 Área (ha)
                </label>
                <input
                  type="number"
                  name="area"
                  value={formData.area || ''}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '12px', 
                    padding: '12px 16px', 
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)'
                  }}
                  min="0"
                  step="0.1"
                  placeholder="15.5"
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              <div>
                <label style={{ 
                  display: 'flex', 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '6px',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  🐄 Capacidad
                </label>
                <input
                  type="number"
                  name="capacity"
                  value={formData.capacity || ''}
                  onChange={handleInputChange}
                  style={{ 
                    width: '100%', 
                    border: '2px solid #e5e7eb', 
                    borderRadius: '12px', 
                    padding: '12px 16px', 
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)'
                  }}
                  min="0"
                  placeholder="50"
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'flex', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '6px',
                alignItems: 'center',
                gap: '6px'
              }}>
                🌾 Tipo de Pasto
              </label>
              <select
                name="grassType"
                value={formData.grassType || ''}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '12px 16px', 
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
                required
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="">Seleccionar tipo...</option>
                <option value="Brachiaria">🌿 Brachiaria</option>
                <option value="Guinea">🌱 Guinea</option>
                <option value="Estrella">⭐ Estrella</option>
                <option value="Tanzania">🌾 Tanzania</option>
                <option value="Pangola">🍃 Pangola</option>
                <option value="Otro">🌿 Otro</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'flex', 
                fontSize: '14px', 
                fontWeight: '600', 
                color: '#374151', 
                marginBottom: '6px',
                alignItems: 'center',
                gap: '6px'
              }}>
                📊 Estado
              </label>
              <select
                name="status"
                value={formData.status || 'active'}
                onChange={handleInputChange}
                style={{ 
                  width: '100%', 
                  border: '2px solid #e5e7eb', 
                  borderRadius: '12px', 
                  padding: '12px 16px', 
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  transition: 'all 0.2s ease',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              >
                <option value="active">✅ Activa</option>
                <option value="resting">⏸️ En descanso</option>
                <option value="maintenance">🔧 Mantenimiento</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '12px', paddingTop: '8px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  color: 'white',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.4)';
                }}
              >
                <span style={{ fontSize: '16px' }}>💾</span>
                Guardar Pastura
              </button>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  color: 'white',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(107, 114, 128, 0.4)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(107, 114, 128, 0.5)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(107, 114, 128, 0.4)';
                }}
              >
                ✕
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mensaje de error mejorado */}
      {error && (
        <div style={{ 
          position: 'absolute', 
          bottom: '20px', 
          left: '20px', 
          zIndex: 1000, 
          background: 'linear-gradient(135deg, rgba(254, 242, 242, 0.95) 0%, rgba(255, 245, 245, 0.95) 100%)',
          border: '2px solid #fca5a5', 
          color: '#dc2626', 
          padding: '16px 20px', 
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(220, 38, 38, 0.2)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '400px'
        }}>
          <div style={{
            backgroundColor: '#dc2626',
            borderRadius: '50%',
            padding: '6px',
            color: 'white',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            ⚠️
          </div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
              Error en el sistema
            </div>
            <div style={{ fontSize: '13px', opacity: '0.9' }}>
              {error}
            </div>
          </div>
          <button
            onClick={() => setError(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#dc2626',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Mapa SVG personalizado con diseño mejorado */}
      <div 
        ref={mapRef}
        onClick={handleMapClick}
        style={{ 
          width: '100%', 
          height: '100%', 
          borderRadius: '12px',
          background: `
            radial-gradient(circle at 30% 20%, rgba(34, 197, 94, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #f0fdf4 0%, #dcfce7 25%, #bbf7d0 50%, #86efac 75%, #4ade80 100%)
          `,
          cursor: isDrawingMode ? 'crosshair' : 'default',
          position: 'relative',
          overflow: 'hidden',
          border: '2px solid #e5e7eb',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
      >
        <svg 
          width="100%" 
          height="100%" 
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {/* Definir gradientes y patrones */}
          <defs>
            <pattern id="grassPattern" patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill="#f0fdf4"/>
              <circle cx="2" cy="2" r="0.5" fill="#22c55e" opacity="0.3"/>
            </pattern>
            
            <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.4"/>
            </linearGradient>
            
            <linearGradient id="restingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.4"/>
            </linearGradient>
            
            <linearGradient id="maintenanceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8"/>
              <stop offset="100%" stopColor="#f87171" stopOpacity="0.4"/>
            </linearGradient>

            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>

          {/* Patrón de fondo decorativo */}
          <g opacity="0.1">
            {Array.from({ length: 20 }).map((_, i) => (
              <g key={`decoration-${i}`}>
                <circle
                  cx={Math.random() * MAP_CONFIG.width}
                  cy={Math.random() * MAP_CONFIG.height}
                  r={Math.random() * 3 + 1}
                  fill="#22c55e"
                  opacity="0.3"
                />
              </g>
            ))}
          </g>

          {/* Pasturas existentes con gradientes mejorados */}
          {pastures.map((pasture) => (
            <g key={pasture.id}>
              <path
                d={createPolygonPath(pasture.coordinates)}
                fill={`url(#${pasture.status}Gradient)`}
                stroke={getPastureColor(pasture.status)}
                strokeWidth="3"
                filter="url(#dropShadow)"
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.filter = 'url(#dropShadow) brightness(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.filter = 'url(#dropShadow)';
                }}
              />
              
              {/* Marcador central mejorado */}
              {(() => {
                const centerPoint = pasture.coordinates.reduce(
                  (acc, coord) => {
                    const point = latLngToPixel(coord.latitude, coord.longitude);
                    return { x: acc.x + point.x, y: acc.y + point.y };
                  },
                  { x: 0, y: 0 }
                );
                centerPoint.x /= pasture.coordinates.length;
                centerPoint.y /= pasture.coordinates.length;
                
                return (
                  <g style={{ cursor: 'pointer' }} onClick={(e) => {
                    e.stopPropagation();
                    showPastureInfo(pasture);
                  }}>
                    {/* Sombra del marcador */}
                    <circle
                      cx={centerPoint.x + 2}
                      cy={centerPoint.y + 2}
                      r="12"
                      fill="rgba(0, 0, 0, 0.2)"
                    />
                    {/* Marcador principal */}
                    <circle
                      cx={centerPoint.x}
                      cy={centerPoint.y}
                      r="12"
                      fill={getPastureColor(pasture.status)}
                      stroke="white"
                      strokeWidth="3"
                      filter="url(#dropShadow)"
                    />
                    {/* Icono en el marcador */}
                    <text
                      x={centerPoint.x}
                      y={centerPoint.y + 1}
                      textAnchor="middle"
                      fontSize="14"
                      fill="white"
                      style={{ pointerEvents: 'none', fontWeight: 'bold' }}
                    >
                      🌱
                    </text>
                    {/* Nombre de la pastura con fondo */}
                    <rect
                      x={centerPoint.x - (pasture.name.length * 4)}
                      y={centerPoint.y - 35}
                      width={pasture.name.length * 8}
                      height="18"
                      fill="rgba(255, 255, 255, 0.95)"
                      stroke={getPastureColor(pasture.status)}
                      strokeWidth="1"
                      rx="4"
                      ry="4"
                      filter="url(#dropShadow)"
                    />
                    <text
                      x={centerPoint.x}
                      y={centerPoint.y - 23}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="bold"
                      fill="#374151"
                      style={{ pointerEvents: 'none' }}
                    >
                      {pasture.name}
                    </text>
                  </g>
                );
              })()}
            </g>
          ))}

          {/* Polígono temporal para dibujo con efectos mejorados */}
          {currentDrawingCoords.length > 2 && (
            <path
              d={createPolygonPath(currentDrawingCoords)}
              fill="rgba(59, 130, 246, 0.3)"
              stroke="#3b82f6"
              strokeWidth="3"
              strokeDasharray="8,4"
              filter="url(#dropShadow)"
              style={{
                animation: 'dash 2s linear infinite'
              }}
            />
          )}

          {/* Puntos temporales para dibujo mejorados */}
          {currentDrawingCoords.map((coord, index) => {
            const point = latLngToPixel(coord.latitude, coord.longitude);
            return (
              <g key={`temp-${index}`}>
                {/* Animación de pulso */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="15"
                  fill="#3b82f6"
                  opacity="0.3"
                  style={{
                    animation: 'pulse 2s infinite'
                  }}
                />
                {/* Punto principal */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="8"
                  fill="#3b82f6"
                  stroke="white"
                  strokeWidth="3"
                  style={{ cursor: 'pointer' }}
                  filter="url(#dropShadow)"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTempPoint(index);
                  }}
                />
                {/* Número del punto */}
                <text
                  x={point.x}
                  y={point.y + 1}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="white"
                  style={{ pointerEvents: 'none' }}
                >
                  {index + 1}
                </text>
                {/* Etiqueta con fondo */}
                <rect
                  x={point.x - 12}
                  y={point.y - 25}
                  width="24"
                  height="14"
                  fill="rgba(59, 130, 246, 0.9)"
                  rx="3"
                  ry="3"
                  filter="url(#dropShadow)"
                />
                <text
                  x={point.x}
                  y={point.y - 16}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="bold"
                  fill="white"
                  style={{ pointerEvents: 'none' }}
                >
                  P{index + 1}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Indicador de ubicación mejorado */}
        <div style={{
          position: 'absolute',
          bottom: '15px',
          right: '15px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#374151',
          fontWeight: '500',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          📍 Villahermosa, Tabasco, México
        </div>

        {/* Leyenda de estados */}
        <div style={{
          position: 'absolute',
          top: '15px',
          right: '15px',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#374151' }}>
            Estados de Pasturas
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
              <span>Activa</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '50%' }}></div>
              <span>En descanso</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '50%' }}></div>
              <span>Mantenimiento</span>
            </div>
          </div>
        </div>

        {/* Estilos para animaciones */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes pulse {
              0% { r: 15; opacity: 0.3; }
              50% { r: 20; opacity: 0.1; }
              100% { r: 15; opacity: 0.3; }
            }
            @keyframes dash {
              0% { stroke-dashoffset: 0; }
              100% { stroke-dashoffset: 24; }
            }
          `
        }} />
      </div>
    </div>
  );
};

export default PastureMap;