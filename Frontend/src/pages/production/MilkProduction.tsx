// src/pages/production/MilkProduction.tsx
import React, { useState, useEffect } from 'react';
import { motion, Variants, AnimatePresence } from 'framer-motion';
import {
  Milk,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Calendar,
  Clock,
  Users,
  BarChart3,
  TrendingUp,
  X,
  Save,
  Download,
  Upload,
  RefreshCw,
  Target,
  Droplets
} from 'lucide-react';

// Componentes de shadcn/ui simulados
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

const CardContent: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default',
  className = '',
  disabled = false 
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    default: 'bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white hover:from-[#265a44] hover:to-[#3d7a5c]',
    destructive: 'bg-red-500 text-white hover:bg-red-600',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    ghost: 'hover:bg-gray-100'
  };

  const sizeClasses = {
    default: 'h-10 py-2 px-4',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-12 px-8 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({ 
  className = '',
  ...props
}) => (
  <input
    {...props}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#519a7c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${props.readOnly ? 'bg-gray-50' : ''} ${className}`}
  />
);

interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
  className?: string;
}

const Select: React.FC<SelectProps> = ({ children, value, onChange, className = '' }) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    className={`flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#519a7c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
  >
    {children}
  </select>
);

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium';
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
};

// Interfaces para tipado de datos de producción lechera
interface MilkRecord {
  id: string;
  cowId: string;
  cowName: string;
  date: string;
  time: string;
  quantity: number; // litros
  quality: 'Excelente' | 'Buena' | 'Regular' | 'Deficiente';
  fat: number; // porcentaje de grasa
  protein: number; // porcentaje de proteína
  temperature: number; // temperatura de la leche
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  milkingSession: 'Mañana' | 'Tarde' | 'Noche';
  notes?: string;
  status: 'Procesada' | 'Pendiente' | 'Rechazada';
}

interface MilkStats {
  totalToday: number;
  totalWeek: number;
  totalMonth: number;
  averageQuality: number;
  activeCows: number;
  topProducer: string;
}

interface FilterState {
  dateFrom: string;
  dateTo: string;
  cowId: string;
  quality: string;
  session: string;
  status: string;
}

const MilkProduction: React.FC = () => {
  // Estados principales
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [milkRecords, setMilkRecords] = useState<MilkRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<MilkRecord[]>([]);
  const [milkStats, setMilkStats] = useState<MilkStats>({
    totalToday: 0,
    totalWeek: 0,
    totalMonth: 0,
    averageQuality: 0,
    activeCows: 0,
    topProducer: ''
  });

  // Estados para CRUD
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<MilkRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Estados para filtros
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: '',
    dateTo: '',
    cowId: '',
    quality: '',
    session: '',
    status: ''
  });

  // Estado para formulario
  const [formData, setFormData] = useState<Partial<MilkRecord>>({
    cowId: '',
    cowName: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    quantity: 0,
    quality: 'Buena',
    fat: 0,
    protein: 0,
    temperature: 0,
    location: {
      lat: 16.7569,
      lng: -92.6348,
      name: 'Potrero Principal'
    },
    milkingSession: 'Mañana',
    notes: '',
    status: 'Pendiente'
  });

  // Datos simulados para registros de producción lechera
  const mockMilkRecords: MilkRecord[] = [
    {
      id: '1',
      cowId: 'COW001',
      cowName: 'Esperanza',
      date: '2025-07-16',
      time: '06:00',
      quantity: 25.5,
      quality: 'Excelente',
      fat: 3.8,
      protein: 3.2,
      temperature: 37.2,
      location: { lat: 16.7569, lng: -92.6348, name: 'Potrero A-1' },
      milkingSession: 'Mañana',
      notes: 'Vaca en excelente estado, producción alta',
      status: 'Procesada'
    },
    {
      id: '2',
      cowId: 'COW002',
      cowName: 'Maravilla',
      date: '2025-07-16',
      time: '06:15',
      quantity: 22.0,
      quality: 'Buena',
      fat: 3.5,
      protein: 3.0,
      temperature: 37.0,
      location: { lat: 16.7580, lng: -92.6360, name: 'Potrero A-2' },
      milkingSession: 'Mañana',
      notes: 'Producción normal',
      status: 'Procesada'
    },
    {
      id: '3',
      cowId: 'COW003',
      cowName: 'Bonita',
      date: '2025-07-16',
      time: '17:30',
      quantity: 18.8,
      quality: 'Regular',
      fat: 3.0,
      protein: 2.8,
      temperature: 36.8,
      location: { lat: 16.7550, lng: -92.6340, name: 'Potrero B-1' },
      milkingSession: 'Tarde',
      notes: 'Revisar alimentación',
      status: 'Pendiente'
    },
    {
      id: '4',
      cowId: 'COW004',
      cowName: 'Dulce',
      date: '2025-07-15',
      time: '18:00',
      quantity: 24.2,
      quality: 'Excelente',
      fat: 4.0,
      protein: 3.4,
      temperature: 37.1,
      location: { lat: 16.7590, lng: -92.6370, name: 'Potrero C-1' },
      milkingSession: 'Tarde',
      notes: 'Excelente productora',
      status: 'Procesada'
    },
    {
      id: '5',
      cowId: 'COW005',
      cowName: 'Estrella',
      date: '2025-07-15',
      time: '06:30',
      quantity: 20.5,
      quality: 'Buena',
      fat: 3.6,
      protein: 3.1,
      temperature: 37.0,
      location: { lat: 16.7565, lng: -92.6355, name: 'Potrero A-3' },
      milkingSession: 'Mañana',
      status: 'Procesada'
    }
  ];

  // Estadísticas simuladas
  const mockMilkStats: MilkStats = {
    totalToday: 66.3,
    totalWeek: 485.7,
    totalMonth: 2140.5,
    averageQuality: 4.2,
    activeCows: 125,
    topProducer: 'Esperanza'
  };

  // Efecto para simular carga de datos
  useEffect(() => {
    const timer = setTimeout(() => {
      setMilkRecords(mockMilkRecords);
      setFilteredRecords(mockMilkRecords);
      setMilkStats(mockMilkStats);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Efecto para filtrar registros
  useEffect(() => {
    let filtered = milkRecords.filter(record => {
      const matchesSearch = record.cowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.cowId.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDateFrom = !filters.dateFrom || record.date >= filters.dateFrom;
      const matchesDateTo = !filters.dateTo || record.date <= filters.dateTo;
      const matchesCow = !filters.cowId || record.cowId === filters.cowId;
      const matchesQuality = !filters.quality || record.quality === filters.quality;
      const matchesSession = !filters.session || record.milkingSession === filters.session;
      const matchesStatus = !filters.status || record.status === filters.status;

      return matchesSearch && matchesDateFrom && matchesDateTo && 
             matchesCow && matchesQuality && matchesSession && matchesStatus;
    });

    setFilteredRecords(filtered);
  }, [milkRecords, searchTerm, filters]);

  // Animaciones de Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
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

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  };

  // Funciones CRUD
  const handleCreate = (): void => {
    if (!formData.cowId || !formData.quantity) return;
    
    const newRecord: MilkRecord = {
      id: Date.now().toString(),
      cowId: formData.cowId!,
      cowName: formData.cowName!,
      date: formData.date!,
      time: formData.time!,
      quantity: formData.quantity!,
      quality: formData.quality as MilkRecord['quality'],
      fat: formData.fat!,
      protein: formData.protein!,
      temperature: formData.temperature!,
      location: formData.location!,
      milkingSession: formData.milkingSession as MilkRecord['milkingSession'],
      notes: formData.notes,
      status: formData.status as MilkRecord['status']
    };

    setMilkRecords([newRecord, ...milkRecords]);
    setIsCreateModalOpen(false);
    resetForm();
  };

  const handleEdit = (): void => {
    if (!selectedRecord || !formData.cowId || !formData.quantity) return;

    const updatedRecord: MilkRecord = {
      ...selectedRecord,
      cowId: formData.cowId!,
      cowName: formData.cowName!,
      date: formData.date!,
      time: formData.time!,
      quantity: formData.quantity!,
      quality: formData.quality as MilkRecord['quality'],
      fat: formData.fat!,
      protein: formData.protein!,
      temperature: formData.temperature!,
      location: formData.location!,
      milkingSession: formData.milkingSession as MilkRecord['milkingSession'],
      notes: formData.notes,
      status: formData.status as MilkRecord['status']
    };

    setMilkRecords(milkRecords.map(record => 
      record.id === selectedRecord.id ? updatedRecord : record
    ));
    setIsEditModalOpen(false);
    setSelectedRecord(null);
    resetForm();
  };

  const handleDelete = (id: string): void => {
    setMilkRecords(milkRecords.filter(record => record.id !== id));
  };

  const handleView = (record: MilkRecord): void => {
    setSelectedRecord(record);
    setIsViewModalOpen(true);
  };

  const handleEditClick = (record: MilkRecord): void => {
    setSelectedRecord(record);
    setFormData({
      cowId: record.cowId,
      cowName: record.cowName,
      date: record.date,
      time: record.time,
      quantity: record.quantity,
      quality: record.quality,
      fat: record.fat,
      protein: record.protein,
      temperature: record.temperature,
      location: record.location,
      milkingSession: record.milkingSession,
      notes: record.notes,
      status: record.status
    });
    setIsEditModalOpen(true);
  };

  const resetForm = (): void => {
    setFormData({
      cowId: '',
      cowName: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      quantity: 0,
      quality: 'Buena',
      fat: 0,
      protein: 0,
      temperature: 0,
      location: {
        lat: 16.7569,
        lng: -92.6348,
        name: 'Potrero Principal'
      },
      milkingSession: 'Mañana',
      notes: '',
      status: 'Pendiente'
    });
  };

  const resetFilters = (): void => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      cowId: '',
      quality: '',
      session: '',
      status: ''
    });
    setSearchTerm('');
  };

  // Función para formatear números
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('es-MX', { 
      minimumFractionDigits: 1, 
      maximumFractionDigits: 1 
    }).format(value);
  };

  // Función para obtener color por calidad
  const getQualityColor = (quality: string): string => {
    switch (quality) {
      case 'Excelente': return 'success';
      case 'Buena': return 'info';
      case 'Regular': return 'warning';
      case 'Deficiente': return 'error';
      default: return 'default';
    }
  };

  // Función para obtener color por estado
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'Procesada': return 'success';
      case 'Pendiente': return 'warning';
      case 'Rechazada': return 'error';
      default: return 'default';
    }
  };

  // Componente de Loading con fondo degradado del layout principal
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative">
          <motion.div
            className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <Milk className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-white" />
        </div>
        <motion.p
          className="text-white text-lg font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Cargando Producción Lechera...
        </motion.p>
      </motion.div>
    </div>
  );

  // Componente de Modal para formularios
  const FormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    onSubmit: () => void;
  }> = ({ isOpen, onClose, title, onSubmit }) => (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Milk className="h-6 w-6 text-[#519a7c]" />
                  {title}
                </h2>
                <Button variant="ghost" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Información de la vaca */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID de la Vaca *
                  </label>
                  <Input
                    placeholder="Ej: COW001"
                    value={formData.cowId}
                    onChange={(e) => setFormData({...formData, cowId: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Vaca *
                  </label>
                  <Input
                    placeholder="Ej: Esperanza"
                    value={formData.cowName}
                    onChange={(e) => setFormData({...formData, cowName: e.target.value})}
                  />
                </div>
              </div>

              {/* Fecha y hora */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha *
                  </label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora *
                  </label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sesión de Ordeño
                  </label>
                  <Select
                    value={formData.milkingSession}
                    onChange={(value) => setFormData({...formData, milkingSession: value as any})}
                  >
                    <option value="Mañana">Mañana</option>
                    <option value="Tarde">Tarde</option>
                    <option value="Noche">Noche</option>
                  </Select>
                </div>
              </div>

              {/* Producción y calidad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad (Litros) *
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="25.5"
                    value={formData.quantity?.toString() || ''}
                    onChange={(e) => setFormData({...formData, quantity: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calidad
                  </label>
                  <Select
                    value={formData.quality}
                    onChange={(value) => setFormData({...formData, quality: value as any})}
                  >
                    <option value="Excelente">Excelente</option>
                    <option value="Buena">Buena</option>
                    <option value="Regular">Regular</option>
                    <option value="Deficiente">Deficiente</option>
                  </Select>
                </div>
              </div>

              {/* Análisis de composición */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grasa (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="3.8"
                    value={formData.fat?.toString() || ''}
                    onChange={(e) => setFormData({...formData, fat: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proteína (%)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="3.2"
                    value={formData.protein?.toString() || ''}
                    onChange={(e) => setFormData({...formData, protein: parseFloat(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperatura (°C)
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="37.0"
                    value={formData.temperature?.toString() || ''}
                    onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value) || 0})}
                  />
                </div>
              </div>

              {/* Ubicación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación de Ordeño
                </label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-[#519a7c]" />
                  <span className="text-sm">{formData.location?.name}</span>
                  <Button variant="outline" size="sm" className="ml-auto">
                    Seleccionar en Mapa
                  </Button>
                </div>
              </div>

              {/* Estado y notas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <Select
                    value={formData.status}
                    onChange={(value) => setFormData({...formData, status: value as any})}
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Procesada">Procesada</option>
                    <option value="Rechazada">Rechazada</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas
                  </label>
                  <Input
                    placeholder="Observaciones adicionales..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={onSubmit} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Guardar Registro
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header con título y controles principales */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white drop-shadow-sm mb-2 flex items-center gap-3">
              <Milk className="h-10 w-10" />
              Producción Lechera
            </h1>
            <p className="text-white/90 text-lg">
              Gestión completa de registros de ordeño y control de calidad
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo Registro
            </Button>
          </div>
        </motion.div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Producción Hoy</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(milkStats.totalToday)}</p>
                    <p className="text-sm text-gray-500">litros</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Droplets className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Esta Semana</p>
                    <p className="text-3xl font-bold text-gray-900">{formatNumber(milkStats.totalWeek)}</p>
                    <p className="text-sm text-gray-500">litros</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Vacas Activas</p>
                    <p className="text-3xl font-bold text-gray-900">{milkStats.activeCows}</p>
                    <p className="text-sm text-gray-500">en ordeño</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-full">
                    <Users className="h-8 w-8 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="bg-white/95 backdrop-blur-sm border border-white/20 hover:shadow-xl hover:scale-105 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Calidad Promedio</p>
                    <p className="text-3xl font-bold text-gray-900">{milkStats.averageQuality}</p>
                    <p className="text-sm text-gray-500">/ 5.0</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Target className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Panel de filtros */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Desde
                      </label>
                      <Input
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fecha Hasta
                      </label>
                      <Input
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Calidad
                      </label>
                      <Select
                        value={filters.quality}
                        onChange={(value) => setFilters({...filters, quality: value})}
                      >
                        <option value="">Todas</option>
                        <option value="Excelente">Excelente</option>
                        <option value="Buena">Buena</option>
                        <option value="Regular">Regular</option>
                        <option value="Deficiente">Deficiente</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sesión
                      </label>
                      <Select
                        value={filters.session}
                        onChange={(value) => setFilters({...filters, session: value})}
                      >
                        <option value="">Todas</option>
                        <option value="Mañana">Mañana</option>
                        <option value="Tarde">Tarde</option>
                        <option value="Noche">Noche</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estado
                      </label>
                      <Select
                        value={filters.status}
                        onChange={(value) => setFilters({...filters, status: value})}
                      >
                        <option value="">Todos</option>
                        <option value="Procesada">Procesada</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Rechazada">Rechazada</option>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={resetFilters}
                        className="w-full flex items-center gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Limpiar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de búsqueda y acciones */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar por vaca o ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Importar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabla de registros */}
        <motion.div variants={itemVariants}>
          <Card className="bg-white/95 backdrop-blur-sm border border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-[#519a7c]" />
                  Registros de Producción ({filteredRecords.length})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Vaca
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha / Hora
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Composición
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record, index) => (
                      <motion.tr 
                        key={record.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-[#519a7c]/10 rounded-full mr-3">
                              <Users className="h-4 w-4 text-[#519a7c]" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{record.cowName}</div>
                              <div className="text-sm text-gray-500">{record.cowId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            {record.date}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            {record.time} ({record.milkingSession})
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {formatNumber(record.quantity)} L
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.temperature}°C
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getQualityColor(record.quality) as any}>
                            {record.quality}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Grasa: {record.fat}%
                          </div>
                          <div className="text-sm text-gray-500">
                            Proteína: {record.protein}%
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={getStatusColor(record.status) as any}>
                            {record.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(record)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditClick(record)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(record.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredRecords.length === 0 && (
                <div className="text-center py-12">
                  <Milk className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay registros</h3>
                  <p className="text-gray-500">No se encontraron registros con los filtros aplicados.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Modal para crear registro */}
        <FormModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Nuevo Registro de Producción"
          onSubmit={handleCreate}
        />

        {/* Modal para editar registro */}
        <FormModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title="Editar Registro de Producción"
          onSubmit={handleEdit}
        />

        {/* Modal para ver detalles */}
        <AnimatePresence>
          {isViewModalOpen && selectedRecord && (
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewModalOpen(false)}
            >
              <motion.div
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Eye className="h-6 w-6 text-[#519a7c]" />
                      Detalles del Registro
                    </h2>
                    <Button variant="ghost" onClick={() => setIsViewModalOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Información General</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Vaca:</span>
                            <span className="font-medium">{selectedRecord.cowName} ({selectedRecord.cowId})</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha:</span>
                            <span className="font-medium">{selectedRecord.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Hora:</span>
                            <span className="font-medium">{selectedRecord.time}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Sesión:</span>
                            <span className="font-medium">{selectedRecord.milkingSession}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Producción</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Cantidad:</span>
                            <span className="font-medium">{formatNumber(selectedRecord.quantity)} L</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Calidad:</span>
                            <Badge variant={getQualityColor(selectedRecord.quality) as any}>
                              {selectedRecord.quality}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estado:</span>
                            <Badge variant={getStatusColor(selectedRecord.status) as any}>
                              {selectedRecord.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Análisis de Composición</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Grasa:</span>
                            <span className="font-medium">{selectedRecord.fat}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Proteína:</span>
                            <span className="font-medium">{selectedRecord.protein}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Temperatura:</span>
                            <span className="font-medium">{selectedRecord.temperature}°C</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Ubicación</h3>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <MapPin className="h-5 w-5 text-[#519a7c]" />
                          <span className="text-sm">{selectedRecord.location.name}</span>
                        </div>
                      </div>

                      {selectedRecord.notes && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
                          <p className="text-gray-600 text-sm bg-gray-50 p-3 rounded-lg">
                            {selectedRecord.notes}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end">
                  <Button onClick={() => setIsViewModalOpen(false)}>
                    Cerrar
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default MilkProduction;