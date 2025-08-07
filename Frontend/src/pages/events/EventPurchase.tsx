import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Download,
  Eye,
  Package,
  MapPin,
  X,
  Save,
  Navigation
} from 'lucide-react';

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================

interface Purchase {
  id: string;
  purchaseCode: string;
  date: Date;
  vendorName: string;
  vendorContact?: string;
  description: string;
  category: PurchaseCategory;
  items: PurchaseItem[];
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PurchaseStatus;
  location?: string;
  notes?: string;
  invoiceNumber?: string;
  receiptUrl?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

interface PurchaseItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  category?: string;
}

enum PurchaseCategory {
  FEED = 'feed',
  MEDICATION = 'medication',
  EQUIPMENT = 'equipment',
  SERVICES = 'services',
  MAINTENANCE = 'maintenance',
  UTILITIES = 'utilities',
  OTHER = 'other'
}

enum PaymentMethod {
  CASH = 'cash',
  TRANSFER = 'transfer',
  CHECK = 'check',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card'
}

enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

interface PurchaseFilters {
  search?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

const EventPurchase: React.FC = () => {
  // Estados principales
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Empezar en true para la carga inicial
  const [error, setError] = useState<string>('');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  
  // Estados del modal
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'view' | 'create' | 'edit'>('view');
  
  // Estados de filtros y búsqueda
  const [filters, setFilters] = useState<PurchaseFilters>({
    search: ''
  });
  
  // Estados para el formulario
  const [formData, setFormData] = useState<Partial<Purchase>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [gettingLocation, setGettingLocation] = useState<boolean>(false);
  
  // Estados de paginación
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // ============================================================================
  // EFECTOS Y HOOKS
  // ============================================================================

  useEffect(() => {
    loadPurchases();
  }, [pagination.page, filters]);

  // ============================================================================
  // FUNCIONES DE API
  // ============================================================================

  const loadPurchases = useCallback(async () => {
    setLoading(true);
    setError('');
    
    try {
      // Datos de prueba - simula una base de datos local
      const mockPurchases: Purchase[] = [
        {
          id: '1',
          purchaseCode: 'COMP-2025-001',
          date: new Date('2025-01-15'),
          vendorName: 'Forrajes del Norte S.A.',
          vendorContact: 'juan.perez@forrajes.com',
          description: 'Compra de alimento balanceado',
          category: PurchaseCategory.FEED,
          items: [
            {
              id: '1-1',
              name: 'Alimento balanceado 18% proteína',
              description: 'Saco de 40kg',
              quantity: 50,
              unit: 'saco',
              unitPrice: 280,
              totalPrice: 14000
            }
          ],
          totalAmount: 14000,
          currency: 'MXN',
          paymentMethod: PaymentMethod.TRANSFER,
          status: PurchaseStatus.COMPLETED,
          location: '17.989242, -92.947472 (Villahermosa, Tabasco)',
          notes: 'Entrega completa sin problemas',
          invoiceNumber: 'F-2025-0215',
          createdBy: 'admin',
          createdAt: new Date('2025-01-15'),
          updatedAt: new Date('2025-01-15')
        },
        {
          id: '2',
          purchaseCode: 'COMP-2025-002',
          date: new Date('2025-01-20'),
          vendorName: 'Veterinaria San Marcos',
          vendorContact: 'contacto@vetsanmarcos.com',
          description: 'Medicamentos y vacunas',
          category: PurchaseCategory.MEDICATION,
          items: [
            {
              id: '2-1',
              name: 'Vacuna Triple Bovina',
              description: 'Frasco 50 dosis',
              quantity: 5,
              unit: 'frasco',
              unitPrice: 450,
              totalPrice: 2250
            },
            {
              id: '2-2',
              name: 'Ivermectina 1%',
              description: 'Frasco 500ml',
              quantity: 2,
              unit: 'frasco',
              unitPrice: 320,
              totalPrice: 640
            }
          ],
          totalAmount: 2890,
          currency: 'MXN',
          paymentMethod: PaymentMethod.CASH,
          status: PurchaseStatus.PENDING,
          location: 'Clínica Veterinaria',
          notes: 'Pendiente de aplicación',
          invoiceNumber: 'VM-2025-0045',
          createdBy: 'veterinario',
          createdAt: new Date('2025-01-20'),
          updatedAt: new Date('2025-01-20')
        },
        {
          id: '3',
          purchaseCode: 'COMP-2025-003',
          date: new Date('2025-01-25'),
          vendorName: 'Equipos Ganaderos MX',
          vendorContact: 'ventas@equiposganaderos.mx',
          description: 'Comederos automáticos',
          category: PurchaseCategory.EQUIPMENT,
          items: [
            {
              id: '3-1',
              name: 'Comedero automático 200L',
              description: 'Acero inoxidable con temporizador',
              quantity: 3,
              unit: 'pieza',
              unitPrice: 1850,
              totalPrice: 5550
            }
          ],
          totalAmount: 5550,
          currency: 'MXN',
          paymentMethod: PaymentMethod.CREDIT_CARD,
          status: PurchaseStatus.COMPLETED,
          location: '17.995123, -92.943567 (Corral 3, Rancho San José)',
          notes: 'Instalación incluida',
          invoiceNumber: 'EQ-2025-0123',
          createdBy: 'admin',
          createdAt: new Date('2025-01-25'),
          updatedAt: new Date('2025-01-25')
        }
      ];

      // Simular filtrado por búsqueda
      let filteredPurchases = mockPurchases;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredPurchases = filteredPurchases.filter(purchase =>
          purchase.purchaseCode.toLowerCase().includes(searchLower) ||
          purchase.vendorName.toLowerCase().includes(searchLower) ||
          purchase.description.toLowerCase().includes(searchLower)
        );
      }

      // Simular paginación
      const total = filteredPurchases.length;
      const totalPages = Math.ceil(total / pagination.limit);
      const startIndex = (pagination.page - 1) * pagination.limit;
      const endIndex = startIndex + pagination.limit;
      const paginatedPurchases = filteredPurchases.slice(startIndex, endIndex);

      setPurchases(paginatedPurchases);
      setPagination(prev => ({
        ...prev,
        total,
        totalPages
      }));
      
    } catch (err) {
      console.error('Error loading purchases:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar compras');
      setPurchases([]);
      setPagination(prev => ({
        ...prev,
        total: 0,
        totalPages: 0
      }));
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters]);

  const savePurchase = async (purchaseData: Partial<Purchase>) => {
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (modalMode === 'edit' && selectedPurchase) {
        // Actualizar compra existente
        setPurchases(prev => prev.map(purchase => 
          purchase.id === selectedPurchase.id 
            ? { ...purchase, ...purchaseData, updatedAt: new Date() }
            : purchase
        ));
      } else {
        // Crear nueva compra
        const newPurchase: Purchase = {
          id: Date.now().toString(),
          purchaseCode: `COMP-2025-${String(Date.now()).slice(-3)}`,
          date: new Date(),
          createdBy: 'admin',
          createdAt: new Date(),
          updatedAt: new Date(),
          currency: 'MXN',
          items: [],
          totalAmount: 0,
          ...purchaseData
        } as Purchase;
        
        setPurchases(prev => [newPurchase, ...prev]);
      }
      
      setShowModal(false);
      setSelectedPurchase(null);
      setFormData({});
      setFormErrors({});
      setGettingLocation(false);
      
    } catch (err) {
      console.error('Error saving purchase:', err);
      setError(err instanceof Error ? err.message : 'Error al guardar compra');
    } finally {
      setLoading(false);
    }
  };

  const deletePurchase = async (id: string) => {
    if (!confirm('¿Está seguro de eliminar esta compra? Esta acción no se puede deshacer.')) return;
    
    setLoading(true);
    setError('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setPurchases(prev => prev.filter(purchase => purchase.id !== id));
      
    } catch (err) {
      console.error('Error deleting purchase:', err);
      setError(err instanceof Error ? err.message : 'Error al eliminar compra');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    try {
      const headers = ['Código', 'Fecha', 'Proveedor', 'Categoría', 'Descripción', 'Monto', 'Estado'];
      const csvContent = [
        headers.join(','),
        ...purchases.map(purchase => [
          purchase.purchaseCode,
          formatDate(purchase.date),
          purchase.vendorName,
          getCategoryLabel(purchase.category),
          `"${purchase.description}"`,
          purchase.totalAmount,
          getStatusLabel(purchase.status)
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `compras_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setError('Error al exportar datos');
    }
  };

  // ============================================================================
  // MANEJADORES DE EVENTOS
  // ============================================================================

  const handleCreate = () => {
    setSelectedPurchase(null);
    setFormData({
      vendorName: '',
      description: '',
      category: PurchaseCategory.OTHER,
      totalAmount: 0,
      paymentMethod: PaymentMethod.CASH,
      status: PurchaseStatus.PENDING,
      location: '',
      notes: '',
      invoiceNumber: ''
    });
    setFormErrors({});
    setGettingLocation(false);
    setModalMode('create');
    setShowModal(true);
  };

  const handleEdit = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setFormData(purchase);
    setFormErrors({});
    setGettingLocation(false);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleView = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setGettingLocation(false);
    setModalMode('view');
    setShowModal(true);
  };

  const handleFilterChange = (filterKey: keyof PurchaseFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.vendorName?.trim()) {
      errors.vendorName = 'El nombre del proveedor es obligatorio';
    }

    if (!formData.description?.trim()) {
      errors.description = 'La descripción es obligatoria';
    }

    if (!formData.category) {
      errors.category = 'La categoría es obligatoria';
    }

    if (!formData.totalAmount || formData.totalAmount <= 0) {
      errors.totalAmount = 'El monto debe ser mayor a 0';
    }

    if (!formData.paymentMethod) {
      errors.paymentMethod = 'El método de pago es obligatorio';
    }

    if (!formData.status) {
      errors.status = 'El estado es obligatorio';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      savePurchase(formData);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('La geolocalización no está disponible en este navegador');
      return;
    }

    setGettingLocation(true);
    setError('');

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000 // Cache por 1 minuto
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const locationString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        
        handleFormChange('location', locationString);
        setGettingLocation(false);
        
        // Opcional: También mostrar una dirección aproximada si hay servicio disponible
        reverseGeocode(latitude, longitude);
      },
      (error) => {
        setGettingLocation(false);
        let errorMessage = 'Error al obtener la ubicación';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Permiso de ubicación denegado. Permite el acceso a la ubicación para usar esta función.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Información de ubicación no disponible.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Tiempo de espera agotado al obtener la ubicación.';
            break;
          default:
            errorMessage = 'Error desconocido al obtener la ubicación.';
            break;
        }
        
        setError(errorMessage);
      },
      options
    );
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      // Usar un servicio gratuito de geocodificación inversa
      // Nota: En producción, considera usar un servicio más robusto como Google Maps API
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=es`
      );
      
      if (response.ok) {
        const data = await response.json();
        const address = data.locality || data.city || data.principalSubdivision || 'Ubicación desconocida';
        const fullLocation = `${lat.toFixed(6)}, ${lng.toFixed(6)} (${address})`;
        handleFormChange('location', fullLocation);
      }
    } catch (error) {
      // Si falla la geocodificación inversa, mantener solo las coordenadas
      console.log('No se pudo obtener la dirección:', error);
    }
  };

  // ============================================================================
  // FUNCIONES DE UTILIDAD
  // ============================================================================

  const formatCurrency = (amount: number, currency: string = 'MXN') => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-MX');
  };

  const getCategoryLabel = (category: PurchaseCategory) => {
    const labels = {
      [PurchaseCategory.FEED]: 'Alimento',
      [PurchaseCategory.MEDICATION]: 'Medicamento',
      [PurchaseCategory.EQUIPMENT]: 'Equipo',
      [PurchaseCategory.SERVICES]: 'Servicios',
      [PurchaseCategory.MAINTENANCE]: 'Mantenimiento',
      [PurchaseCategory.UTILITIES]: 'Servicios Públicos',
      [PurchaseCategory.OTHER]: 'Otros'
    };
    return labels[category] || category;
  };

  const getStatusColor = (status: PurchaseStatus) => {
    const colors = {
      [PurchaseStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
      [PurchaseStatus.COMPLETED]: 'bg-green-100 text-green-800',
      [PurchaseStatus.CANCELLED]: 'bg-red-100 text-red-800',
      [PurchaseStatus.REFUNDED]: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: PurchaseStatus) => {
    const labels = {
      [PurchaseStatus.PENDING]: 'Pendiente',
      [PurchaseStatus.COMPLETED]: 'Completada',
      [PurchaseStatus.CANCELLED]: 'Cancelada',
      [PurchaseStatus.REFUNDED]: 'Reembolsada'
    };
    return labels[status] || status;
  };

  // ============================================================================
  // COMPONENTES DE RENDERIZADO
  // ============================================================================

  const renderPurchaseForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Proveedor *
          </label>
          <input
            type="text"
            value={formData.vendorName || ''}
            onChange={(e) => handleFormChange('vendorName', e.target.value)}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.vendorName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Nombre del proveedor"
            disabled={modalMode === 'view'}
          />
          {formErrors.vendorName && (
            <p className="mt-1 text-sm text-red-600">{formErrors.vendorName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoría *
          </label>
          <select
            value={formData.category || ''}
            onChange={(e) => handleFormChange('category', e.target.value)}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.category ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={modalMode === 'view'}
          >
            <option value="">Seleccionar categoría</option>
            {Object.values(PurchaseCategory).map(category => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
          {formErrors.category && (
            <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descripción *
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleFormChange('description', e.target.value)}
            rows={3}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.description ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Descripción de la compra"
            disabled={modalMode === 'view'}
          />
          {formErrors.description && (
            <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Monto Total *
          </label>
          <input
            type="number"
            step="0.01"
            value={formData.totalAmount || ''}
            onChange={(e) => handleFormChange('totalAmount', parseFloat(e.target.value))}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.totalAmount ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="0.00"
            disabled={modalMode === 'view'}
          />
          {formErrors.totalAmount && (
            <p className="mt-1 text-sm text-red-600">{formErrors.totalAmount}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Método de Pago *
          </label>
          <select
            value={formData.paymentMethod || ''}
            onChange={(e) => handleFormChange('paymentMethod', e.target.value)}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.paymentMethod ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={modalMode === 'view'}
          >
            <option value="">Seleccionar método</option>
            <option value={PaymentMethod.CASH}>Efectivo</option>
            <option value={PaymentMethod.TRANSFER}>Transferencia</option>
            <option value={PaymentMethod.CHECK}>Cheque</option>
            <option value={PaymentMethod.CREDIT_CARD}>Tarjeta de Crédito</option>
            <option value={PaymentMethod.DEBIT_CARD}>Tarjeta de Débito</option>
          </select>
          {formErrors.paymentMethod && (
            <p className="mt-1 text-sm text-red-600">{formErrors.paymentMethod}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Estado *
          </label>
          <select
            value={formData.status || ''}
            onChange={(e) => handleFormChange('status', e.target.value)}
            className={`w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              formErrors.status ? 'border-red-300' : 'border-gray-300'
            }`}
            disabled={modalMode === 'view'}
          >
            <option value="">Seleccionar estado</option>
            {Object.values(PurchaseStatus).map(status => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>
          {formErrors.status && (
            <p className="mt-1 text-sm text-red-600">{formErrors.status}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ubicación
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={formData.location || ''}
              onChange={(e) => handleFormChange('location', e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ubicación de entrega"
              disabled={modalMode === 'view'}
            />
            {modalMode !== 'view' && (
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={gettingLocation}
                className={`flex items-center gap-1 px-3 py-2 border border-gray-300 rounded-md transition-colors ${
                  gettingLocation 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                title="Obtener ubicación actual"
              >
                {gettingLocation ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
                ) : (
                  <Navigation size={16} />
                )}
                <span className="text-sm">
                  {gettingLocation ? 'Obteniendo...' : 'Mi ubicación'}
                </span>
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Puedes escribir manualmente o usar tu ubicación actual
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Factura
          </label>
          <input
            type="text"
            value={formData.invoiceNumber || ''}
            onChange={(e) => handleFormChange('invoiceNumber', e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Número de factura"
            disabled={modalMode === 'view'}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas
          </label>
          <textarea
            value={formData.notes || ''}
            onChange={(e) => handleFormChange('notes', e.target.value)}
            rows={2}
            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Notas adicionales"
            disabled={modalMode === 'view'}
          />
        </div>
      </div>
    </div>
  );

  const renderViewDetails = () => {
    if (!selectedPurchase) return null;

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Código de Compra</label>
            <p className="mt-1 text-sm text-gray-900">{selectedPurchase.purchaseCode}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha</label>
            <p className="mt-1 text-sm text-gray-900">{formatDate(selectedPurchase.date)}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Proveedor</label>
            <p className="mt-1 text-sm text-gray-900">{selectedPurchase.vendorName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Categoría</label>
            <p className="mt-1 text-sm text-gray-900">{getCategoryLabel(selectedPurchase.category)}</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <p className="mt-1 text-sm text-gray-900">{selectedPurchase.description}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Monto Total</label>
            <p className="mt-1 text-sm text-gray-900 font-semibold">
              {formatCurrency(selectedPurchase.totalAmount, selectedPurchase.currency)}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Estado</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedPurchase.status)}`}>
              {getStatusLabel(selectedPurchase.status)}
            </span>
          </div>
          {selectedPurchase.location && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Ubicación</label>
              <div className="mt-1 flex items-start gap-2">
                <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-900">{selectedPurchase.location}</p>
              </div>
              {selectedPurchase.location.includes(',') && selectedPurchase.location.includes('.') && (
                <p className="mt-1 text-xs text-gray-500">
                  Coordenadas GPS registradas
                </p>
              )}
            </div>
          )}
          {selectedPurchase.invoiceNumber && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Número de Factura</label>
              <p className="mt-1 text-sm text-gray-900">{selectedPurchase.invoiceNumber}</p>
            </div>
          )}
          {selectedPurchase.notes && (
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notas</label>
              <p className="mt-1 text-sm text-gray-900">{selectedPurchase.notes}</p>
            </div>
          )}
        </div>

        {selectedPurchase.items && selectedPurchase.items.length > 0 && (
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-3">Items de la Compra</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedPurchase.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-gray-500">{item.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity} {item.unit}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(item.unitPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {formatCurrency(item.totalPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTable = () => (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Proveedor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white/80 divide-y divide-gray-200">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="hover:bg-gray-50/60">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {purchase.purchaseCode}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(purchase.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {purchase.vendorName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {getCategoryLabel(purchase.category)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(purchase.totalAmount, purchase.currency)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(purchase.status)}`}>
                    {getStatusLabel(purchase.status)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => handleView(purchase)}
                      className="text-blue-600 hover:text-blue-900 p-1"
                      title="Ver detalles"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleEdit(purchase)}
                      className="text-green-600 hover:text-green-900 p-1"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => deletePurchase(purchase.id)}
                      className="text-red-600 hover:text-red-900 p-1"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPagination = () => (
    <div className="bg-white/90 backdrop-blur-sm px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
          disabled={pagination.page === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
          disabled={pagination.page === pagination.totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
        >
          Siguiente
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Mostrando{' '}
            <span className="font-medium">
              {(pagination.page - 1) * pagination.limit + 1}
            </span>{' '}
            a{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            de{' '}
            <span className="font-medium">{pagination.total}</span> resultados
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
              disabled={pagination.page === pagination.totalPages}
              className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
            >
              Siguiente
            </button>
          </nav>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Compras
          </h1>
          <p className="text-gray-600">
            Registra, edita y gestiona todas las compras de tu rancho
          </p>
        </div>

        {/* Mensajes de error */}
        {error && (
          <div className="mb-4 p-4 bg-red-50/90 backdrop-blur-sm border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Barra de herramientas */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar compras..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/90 backdrop-blur-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus size={20} />
              Nueva Compra
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors shadow-lg"
            >
              <Download size={20} />
              Exportar
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Tabla */}
        {!loading && purchases.length > 0 && renderTable()}

        {/* Estado vacío */}
        {!loading && purchases.length === 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm p-8 text-center">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay compras registradas
            </h3>
            <p className="text-gray-500 mb-4">
              Comienza registrando tu primera compra
            </p>
            <button
              onClick={handleCreate}
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors shadow-lg"
            >
              <Plus size={20} />
              Registrar Compra
            </button>
          </div>
        )}

        {/* Paginación */}
        {!loading && purchases.length > 0 && renderPagination()}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {modalMode === 'create' && 'Nueva Compra'}
                  {modalMode === 'edit' && 'Editar Compra'}
                  {modalMode === 'view' && 'Detalles de Compra'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setGettingLocation(false);
                    setFormData({});
                    setFormErrors({});
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6">
                {modalMode === 'view' ? renderViewDetails() : renderPurchaseForm()}
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setGettingLocation(false);
                    setFormData({});
                    setFormErrors({});
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  {modalMode === 'view' ? 'Cerrar' : 'Cancelar'}
                </button>
                {modalMode !== 'view' && (
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        {modalMode === 'create' ? 'Crear Compra' : 'Guardar Cambios'}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventPurchase;