import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Clipboard,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Target,
  TrendingDown,
  Bell,
  Shield,
  X,
  Save,
  Trash2,
} from 'lucide-react';

// Interfaces para tipos de datos
interface TreatmentPlan {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  planName: string;
  condition: string;
  conditionCategory: 'respiratory' | 'digestive' | 'reproductive' | 'metabolic' | 'infectious' | 'parasitic' | 'injury' | 'chronic';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  diagnosis: string;
  createdDate: Date;
  startDate: Date;
  expectedEndDate: Date;
  actualEndDate?: Date;
  status: 'planned' | 'active' | 'paused' | 'completed' | 'discontinued' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  veterinarian: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    sector: string;
  };
  medications: Array<{
    medicationId: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    route: 'oral' | 'injectable' | 'topical' | 'intravenous' | 'intramuscular';
    duration: number;
    startDay: number;
    endDay: number;
    instructions: string;
    cost: number;
  }>;
  schedule: Array<{
    day: number;
    date: Date;
    tasks: Array<{
      time: string;
      medication: string;
      dosage: string;
      route: string;
      completed: boolean;
      completedBy?: string;
      completedAt?: Date;
      notes?: string;
    }>;
    observations: Array<{
      parameter: string;
      expectedValue: string;
      actualValue?: string;
      status: 'pending' | 'normal' | 'abnormal' | 'critical';
      recordedBy?: string;
      recordedAt?: Date;
    }>;
    dailyNotes?: string;
  }>;
  treatmentGoals: Array<{
    goal: string;
    targetValue: string;
    currentValue?: string;
    achieved: boolean;
    targetDate: Date;
  }>;
  contraindications: string[];
  sideEffects: string[];
  monitoringParameters: Array<{
    parameter: string;
    frequency: string;
    normalRange: string;
    alertThreshold: string;
  }>;
  withdrawalPeriod: number;
  totalCost: number;
  effectiveness: number;
  compliance: number;
  notes: string;
  followUpDate?: Date;
  complications?: string[];
  protocolId?: string;
}

interface NewTreatmentForm {
  animalName: string;
  animalTag: string;
  condition: string;
  conditionCategory: 'respiratory' | 'digestive' | 'reproductive' | 'metabolic' | 'infectious' | 'parasitic' | 'injury' | 'chronic';
  severity: 'mild' | 'moderate' | 'severe' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  veterinarian: string;
  diagnosis: string;
  expectedDuration: number;
  medications: string[];
  notes: string;
  estimatedCost: number;
}

interface TreatmentStats {
  totalActivePlans: number;
  completedThisMonth: number;
  successRate: number;
  averageDuration: number;
  totalCost: number;
  mostCommonCondition: string;
  complianceRate: number;
  alertsCount: number;
  overdueFollowUps: number;
  protocolsCount: number;
  avgEffectiveness: number;
}

interface TreatmentAlert {
  id: string;
  type: 'dose_due' | 'monitoring_due' | 'side_effect' | 'poor_response' | 'follow_up_due' | 'withdrawal_period';
  planId: string;
  animalName: string;
  animalTag: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  scheduledTime?: Date;
  hoursOverdue?: number;
  recommendedAction: string;
  isActive: boolean;
  createdAt: Date;
}

// Componentes reutilizables
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">
    {children}
  </div>
);

const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-sm text-gray-600 mt-1">
    {children}
  </p>
);

const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'default' | 'outline' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'default';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}> = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false, type = 'button' }) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline: "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500"
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm"
  };

  return (
    <button 
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge: React.FC<{ children: React.ReactNode; variant: string; className?: string }> = ({ children, variant, className = '' }) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'planned': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'discontinued': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'mild': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'severe': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'respiratory': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'digestive': return 'bg-green-100 text-green-800 border-green-200';
      case 'reproductive': return 'bg-pink-100 text-pink-800 border-pink-200';
      case 'metabolic': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'infectious': return 'bg-red-100 text-red-800 border-red-200';
      case 'parasitic': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'injury': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'chronic': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      case 'abnormal': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(variant)} ${className}`}>
      {children}
    </span>
  );
};

// Modal para nuevo plan de tratamiento
const NewTreatmentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NewTreatmentForm) => void;
}> = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState<NewTreatmentForm>({
    animalName: '',
    animalTag: '',
    condition: '',
    conditionCategory: 'infectious',
    severity: 'mild',
    priority: 'medium',
    veterinarian: '',
    diagnosis: '',
    expectedDuration: 7,
    medications: [],
    notes: '',
    estimatedCost: 0,
  });

  const [currentMedication, setCurrentMedication] = useState('');

  const addMedication = () => {
    if (currentMedication.trim() && !formData.medications.includes(currentMedication.trim())) {
      setFormData(prev => ({
        ...prev,
        medications: [...prev.medications, currentMedication.trim()]
      }));
      setCurrentMedication('');
    }
  };

  const removeMedication = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.animalName || !formData.condition || !formData.veterinarian) {
      alert('Por favor complete los campos obligatorios: Nombre del animal, condición y veterinario');
      return;
    }

    onSave(formData);
  };

  const resetForm = () => {
    setFormData({
      animalName: '',
      animalTag: '',
      condition: '',
      conditionCategory: 'infectious',
      severity: 'mild',
      priority: 'medium',
      veterinarian: '',
      diagnosis: '',
      expectedDuration: 7,
      medications: [],
      notes: '',
      estimatedCost: 0,
    });
    setCurrentMedication('');
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Nuevo Plan de Tratamiento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Información del Animal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Animal *
              </label>
              <input
                type="text"
                value={formData.animalName}
                onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Bessie"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiqueta/TAG
              </label>
              <input
                type="text"
                value={formData.animalTag}
                onChange={(e) => setFormData(prev => ({ ...prev, animalTag: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: TAG-001"
              />
            </div>
          </div>

          {/* Condición y Categoría */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condición/Enfermedad *
              </label>
              <input
                type="text"
                value={formData.condition}
                onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Mastitis"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoría
              </label>
              <select
                value={formData.conditionCategory}
                onChange={(e) => setFormData(prev => ({ ...prev, conditionCategory: e.target.value as NewTreatmentForm['conditionCategory'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="infectious">Infeccioso</option>
                <option value="respiratory">Respiratorio</option>
                <option value="digestive">Digestivo</option>
                <option value="reproductive">Reproductivo</option>
                <option value="metabolic">Metabólico</option>
                <option value="parasitic">Parasitario</option>
                <option value="injury">Lesión</option>
                <option value="chronic">Crónico</option>
              </select>
            </div>
          </div>

          {/* Severidad y Prioridad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severidad
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as NewTreatmentForm['severity'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="mild">Leve</option>
                <option value="moderate">Moderada</option>
                <option value="severe">Severa</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as NewTreatmentForm['priority'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          {/* Veterinario y Duración */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Veterinario *
              </label>
              <input
                type="text"
                value={formData.veterinarian}
                onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ej: Dr. García"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración Estimada (días)
              </label>
              <input
                type="number"
                min="1"
                value={formData.expectedDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, expectedDuration: parseInt(e.target.value) || 1 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Diagnóstico */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnóstico
            </label>
            <textarea
              value={formData.diagnosis}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Describa el diagnóstico detallado..."
            />
          </div>

          {/* Medicamentos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicamentos
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={currentMedication}
                onChange={(e) => setCurrentMedication(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedication())}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Agregar medicamento"
              />
              <Button type="button" onClick={addMedication}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.medications.map((medication, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {medication}
                  <button
                    type="button"
                    onClick={() => removeMedication(index)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Costo y Notas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Costo Estimado (MXN)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedCost}
                onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Notas adicionales del tratamiento..."
            />
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              <Save className="w-4 h-4 mr-2" />
              Crear Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para ver detalles del plan
const ViewTreatmentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  plan: TreatmentPlan | null;
}> = ({ isOpen, onClose, plan }) => {
  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Detalles del Plan de Tratamiento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Animal</h3>
              <div className="space-y-2">
                <p><strong>Nombre:</strong> {plan.animalName}</p>
                <p><strong>TAG:</strong> {plan.animalTag}</p>
                <p><strong>Condición:</strong> {plan.condition}</p>
                <p><strong>Categoría:</strong> {plan.conditionCategory}</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Estado del Tratamiento</h3>
              <div className="space-y-2">
                <p><strong>Estado:</strong> <Badge variant={plan.status}>{plan.status}</Badge></p>
                <p><strong>Prioridad:</strong> <Badge variant={plan.priority}>{plan.priority}</Badge></p>
                <p><strong>Severidad:</strong> <Badge variant={plan.severity}>{plan.severity}</Badge></p>
                <p><strong>Veterinario:</strong> {plan.veterinarian}</p>
              </div>
            </div>
          </div>

          {/* Diagnóstico */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Diagnóstico</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{plan.diagnosis}</p>
          </div>

          {/* Fechas y duración */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Fecha de inicio</p>
              <p className="text-lg">{plan.startDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Fecha esperada de fin</p>
              <p className="text-lg">{plan.expectedEndDate.toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Duración</p>
              <p className="text-lg">
                {Math.ceil((plan.expectedEndDate.getTime() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24))} días
              </p>
            </div>
          </div>

          {/* Medicamentos */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Medicamentos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plan.medications.map((med, idx) => (
                <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900">{med.medicationName}</h4>
                  <p className="text-sm text-blue-700 mt-1"><strong>Dosis:</strong> {med.dosage}</p>
                  <p className="text-sm text-blue-700"><strong>Frecuencia:</strong> {med.frequency}</p>
                  <p className="text-sm text-blue-700"><strong>Vía:</strong> {med.route}</p>
                  <p className="text-sm text-blue-700"><strong>Duración:</strong> Días {med.startDay}-{med.endDay}</p>
                  <p className="text-sm text-blue-600 mt-2"><strong>Costo:</strong> ${med.cost}</p>
                  <p className="text-sm text-gray-600 mt-2">{med.instructions}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Objetivos del tratamiento */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Objetivos del Tratamiento</h3>
            <div className="space-y-3">
              {plan.treatmentGoals.map((goal, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {goal.achieved ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{goal.goal}</p>
                    <div className="text-sm text-gray-600 mt-1 space-y-1">
                      <p><strong>Objetivo:</strong> {goal.targetValue}</p>
                      <p><strong>Valor actual:</strong> {goal.currentValue || 'Pendiente'}</p>
                      <p><strong>Fecha meta:</strong> {goal.targetDate.toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores de progreso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Efectividad</p>
              <p className="text-2xl font-bold text-green-600">{plan.effectiveness}%</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Cumplimiento</p>
              <p className="text-2xl font-bold text-blue-600">{plan.compliance}%</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">Costo Total</p>
              <p className="text-2xl font-bold text-red-600">${plan.totalCost}</p>
            </div>
          </div>

          {/* Notas */}
          {plan.notes && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{plan.notes}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end p-6 border-t">
          <Button onClick={onClose}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
};

// Modal para editar plan
const EditTreatmentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  plan: TreatmentPlan | null;
  onSave: (updatedPlan: TreatmentPlan) => void;
}> = ({ isOpen, onClose, plan, onSave }) => {
  const [formData, setFormData] = useState<Partial<TreatmentPlan>>({});

  useEffect(() => {
    if (plan) {
      setFormData({ ...plan });
    }
  }, [plan]);

  if (!isOpen || !plan) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.animalName && formData.condition && formData.veterinarian) {
      onSave(formData as TreatmentPlan);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Editar Plan de Tratamiento</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del Animal
              </label>
              <input
                type="text"
                value={formData.animalName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, animalName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TAG
              </label>
              <input
                type="text"
                value={formData.animalTag || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, animalTag: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Condición
            </label>
            <input
              type="text"
              value={formData.condition || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.status || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TreatmentPlan['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planned">Programado</option>
                <option value="active">Activo</option>
                <option value="paused">Pausado</option>
                <option value="completed">Completado</option>
                <option value="discontinued">Discontinuado</option>
                <option value="failed">Fallido</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridad
              </label>
              <select
                value={formData.priority || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as TreatmentPlan['priority'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Baja</option>
                <option value="medium">Media</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Veterinario
            </label>
            <input
              type="text"
              value={formData.veterinarian || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, veterinarian: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Diagnóstico
            </label>
            <textarea
              value={formData.diagnosis || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="success">
              <Save className="w-4 h-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente de Alerta de Tratamiento
const TreatmentAlertCard: React.FC<{ alert: TreatmentAlert }> = ({ alert }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'dose_due': return AlertTriangle;
      case 'monitoring_due': return Eye;
      case 'side_effect': return AlertTriangle;
      case 'poor_response': return TrendingDown;
      case 'follow_up_due': return Clock;
      case 'withdrawal_period': return Shield;
      default: return Bell;
    }
  };

  const Icon = getAlertIcon(alert.type);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`p-4 rounded-lg border-l-4 ${
        alert.priority === 'critical' ? 'border-red-500 bg-red-50' :
        alert.priority === 'high' ? 'border-orange-500 bg-orange-50' :
        alert.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
        'border-blue-500 bg-blue-50'
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${
          alert.priority === 'critical' ? 'text-red-600' :
          alert.priority === 'high' ? 'text-orange-600' :
          alert.priority === 'medium' ? 'text-yellow-600' :
          'text-blue-600'
        } flex-shrink-0 mt-0.5`} />
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{alert.title}</h4>
          <p className="text-sm text-gray-600 mt-1">
            <strong>{alert.animalName} ({alert.animalTag})</strong>
          </p>
          <p className="text-sm text-gray-600">{alert.description}</p>
          {alert.hoursOverdue && (
            <p className="text-sm font-medium text-red-600 mt-1">
              {alert.hoursOverdue} horas de retraso
            </p>
          )}
          {alert.scheduledTime && (
            <p className="text-sm text-gray-600 mt-1">
              <strong>Programado:</strong> {alert.scheduledTime.toLocaleString()}
            </p>
          )}
          <p className="text-sm text-gray-700 mt-2">
            <strong>Acción recomendada:</strong> {alert.recommendedAction}
          </p>
        </div>
        <Badge variant={alert.priority}>
          {alert.priority === 'critical' ? 'Crítico' :
           alert.priority === 'high' ? 'Alto' :
           alert.priority === 'medium' ? 'Medio' : 'Bajo'}
        </Badge>
      </div>
    </motion.div>
  );
};

const TreatmentPlans: React.FC = () => {
  // Estados del componente
  const [treatmentPlans, setTreatmentPlans] = useState<TreatmentPlan[]>([]);
  const [stats, setStats] = useState<TreatmentStats>({
    totalActivePlans: 0,
    completedThisMonth: 0,
    successRate: 0,
    averageDuration: 0,
    totalCost: 0,
    mostCommonCondition: '',
    complianceRate: 0,
    alertsCount: 0,
    overdueFollowUps: 0,
    protocolsCount: 0,
    avgEffectiveness: 0
  });
  const [treatmentAlerts, setTreatmentAlerts] = useState<TreatmentAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  
  // Estados para modales
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TreatmentPlan | null>(null);

  // Funciones para manejar modales y acciones
  const handleNewPlan = (formData: NewTreatmentForm) => {
    const newPlan: TreatmentPlan = {
      id: Date.now().toString(),
      animalId: `COW${Date.now()}`,
      animalName: formData.animalName,
      animalTag: formData.animalTag || `TAG-${Date.now()}`,
      planName: `Tratamiento ${formData.condition}`,
      condition: formData.condition,
      conditionCategory: formData.conditionCategory,
      severity: formData.severity,
      diagnosis: formData.diagnosis,
      createdDate: new Date(),
      startDate: new Date(),
      expectedEndDate: new Date(Date.now() + formData.expectedDuration * 24 * 60 * 60 * 1000),
      status: 'planned',
      priority: formData.priority,
      veterinarian: formData.veterinarian,
      location: {
        lat: 17.9869,
        lng: -92.9303,
        address: 'Ubicación por defecto',
        sector: 'A'
      },
      medications: formData.medications.map((med, idx) => ({
        medicationId: `MED${Date.now()}-${idx}`,
        medicationName: med,
        dosage: 'Por determinar',
        frequency: 'Por determinar',
        route: 'oral',
        duration: formData.expectedDuration,
        startDay: 1,
        endDay: formData.expectedDuration,
        instructions: 'Instrucciones por determinar',
        cost: formData.estimatedCost / formData.medications.length || 0
      })),
      schedule: [],
      treatmentGoals: [
        {
          goal: `Recuperación de ${formData.condition}`,
          targetValue: 'Completa recuperación',
          achieved: false,
          targetDate: new Date(Date.now() + formData.expectedDuration * 24 * 60 * 60 * 1000)
        }
      ],
      contraindications: [],
      sideEffects: [],
      monitoringParameters: [],
      withdrawalPeriod: 7,
      totalCost: formData.estimatedCost,
      effectiveness: 0,
      compliance: 0,
      notes: formData.notes
    };

    setTreatmentPlans(prev => [newPlan, ...prev]);
    
    // Actualizar estadísticas
    setStats(prev => ({
      ...prev,
      totalActivePlans: prev.totalActivePlans + 1,
      totalCost: prev.totalCost + formData.estimatedCost
    }));

    setIsNewPlanModalOpen(false);
    alert('Plan de tratamiento creado exitosamente');
  };

  const handleViewPlan = (plan: TreatmentPlan) => {
    setSelectedPlan(plan);
    setIsViewModalOpen(true);
  };

  const handleEditPlan = (plan: TreatmentPlan) => {
    setSelectedPlan(plan);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (updatedPlan: TreatmentPlan) => {
    setTreatmentPlans(prev => 
      prev.map(plan => plan.id === updatedPlan.id ? updatedPlan : plan)
    );
    setIsEditModalOpen(false);
    setSelectedPlan(null);
    alert('Plan actualizado exitosamente');
  };

  const handleDeletePlan = (planId: string) => {
    const planToDelete = treatmentPlans.find(plan => plan.id === planId);
    
    if (!planToDelete) {
      alert('Plan no encontrado');
      return;
    }

    const confirmMessage = `¿Está seguro de que desea eliminar el plan de tratamiento para ${planToDelete.animalName}?\n\nEsta acción no se puede deshacer.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        // Filtrar el plan a eliminar
        setTreatmentPlans(prev => prev.filter(plan => plan.id !== planId));
        
        // Actualizar estadísticas
        setStats(prev => ({
          ...prev,
          totalActivePlans: Math.max(0, prev.totalActivePlans - 1),
          totalCost: Math.max(0, prev.totalCost - planToDelete.totalCost)
        }));

        // Eliminar alertas relacionadas con este plan
        setTreatmentAlerts(prev => 
          prev.filter(alert => alert.planId !== planId)
        );

        alert(`Plan de tratamiento para ${planToDelete.animalName} eliminado exitosamente`);
      } catch (error) {
        console.error('Error al eliminar el plan:', error);
        alert('Error al eliminar el plan de tratamiento. Por favor, intente nuevamente.');
      }
    }
  };

  // Simulación de datos
  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Datos de ejemplo para planes de tratamiento
      const mockPlans: TreatmentPlan[] = [
        {
          id: '1',
          animalId: 'COW001',
          animalName: 'Bessie',
          animalTag: 'TAG-001',
          planName: 'Tratamiento Mastitis Aguda',
          condition: 'Mastitis',
          conditionCategory: 'infectious',
          severity: 'moderate',
          diagnosis: 'Mastitis clínica en cuarto anterior derecho causada por Staphylococcus aureus',
          createdDate: new Date('2025-07-10'),
          startDate: new Date('2025-07-10'),
          expectedEndDate: new Date('2025-07-17'),
          status: 'active',
          priority: 'high',
          veterinarian: 'Dr. García',
          location: {
            lat: 17.9869,
            lng: -92.9303,
            address: 'Establo Principal, Sector A',
            sector: 'A'
          },
          medications: [
            {
              medicationId: 'MED001',
              medicationName: 'Penicilina G',
              dosage: '20,000 UI/kg',
              frequency: 'Cada 12 horas',
              route: 'intramuscular',
              duration: 7,
              startDay: 1,
              endDay: 7,
              instructions: 'Aplicar en músculos del cuello, alternar lados',
              cost: 15.50
            },
            {
              medicationId: 'MED002',
              medicationName: 'Meloxicam',
              dosage: '0.5 mg/kg',
              frequency: 'Una vez al día',
              route: 'intramuscular',
              duration: 3,
              startDay: 1,
              endDay: 3,
              instructions: 'Antiinflamatorio para reducir la inflamación',
              cost: 8.75
            }
          ],
          schedule: [
            {
              day: 1,
              date: new Date('2025-07-10'),
              tasks: [
                {
                  time: '08:00',
                  medication: 'Penicilina G',
                  dosage: '20,000 UI/kg',
                  route: 'IM',
                  completed: true,
                  completedBy: 'Juan Pérez',
                  completedAt: new Date('2025-07-10T08:15:00'),
                  notes: 'Aplicación sin complicaciones'
                }
              ],
              observations: [
                {
                  parameter: 'Temperatura corporal',
                  expectedValue: '< 39.5°C',
                  actualValue: '39.2°C',
                  status: 'normal',
                  recordedBy: 'Dr. García',
                  recordedAt: new Date('2025-07-10T08:30:00')
                }
              ],
              dailyNotes: 'Buen inicio del tratamiento, animal responde positivamente'
            }
          ],
          treatmentGoals: [
            {
              goal: 'Normalizar temperatura corporal',
              targetValue: '< 39.0°C',
              currentValue: '38.8°C',
              achieved: true,
              targetDate: new Date('2025-07-12')
            }
          ],
          contraindications: ['Alergia conocida a penicilina', 'Gestación en primer trimestre'],
          sideEffects: ['Posible reacción en sitio de inyección', 'Trastornos digestivos leves'],
          monitoringParameters: [
            {
              parameter: 'Temperatura corporal',
              frequency: 'Cada 12 horas',
              normalRange: '38.0 - 39.5°C',
              alertThreshold: '> 40.0°C'
            }
          ],
          withdrawalPeriod: 14,
          totalCost: 172.50,
          effectiveness: 85,
          compliance: 95,
          notes: 'Respuesta favorable al tratamiento. Continuar monitoreo.',
          followUpDate: new Date('2025-07-20')
        }
      ];

      // Estadísticas de ejemplo
      const mockStats: TreatmentStats = {
        totalActivePlans: 8,
        completedThisMonth: 12,
        successRate: 87.5,
        averageDuration: 8.3,
        totalCost: 4567.50,
        mostCommonCondition: 'Mastitis',
        complianceRate: 92.3,
        alertsCount: 5,
        overdueFollowUps: 2,
        protocolsCount: 15,
        avgEffectiveness: 81.2
      };

      // Alertas de tratamiento
      const mockAlerts: TreatmentAlert[] = [
        {
          id: '1',
          type: 'dose_due',
          planId: '1',
          animalName: 'Bessie',
          animalTag: 'TAG-001',
          priority: 'high',
          title: 'Dosis de Medicamento Pendiente',
          description: 'Dosis de Penicilina G programada para las 20:00',
          scheduledTime: new Date('2025-07-12T20:00:00'),
          hoursOverdue: 2,
          recommendedAction: 'Aplicar dosis inmediatamente y ajustar horario',
          isActive: true,
          createdAt: new Date('2025-07-12T22:00:00')
        }
      ];

      setTreatmentPlans(mockPlans);
      setStats(mockStats);
      setTreatmentAlerts(mockAlerts);
    };

    loadData();
  }, []);

  // Filtrar planes de tratamiento
  const filteredPlans = treatmentPlans.filter(plan => {
    const matchesSearch = plan.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.condition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || plan.status === selectedStatus;
    const matchesCategory = selectedCategory === 'all' || plan.conditionCategory === selectedCategory;
    const matchesPriority = selectedPriority === 'all' || plan.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesCategory && matchesPriority;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md border-b border-green-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Planes de Tratamiento</h1>
              <p className="text-gray-600 mt-1">Gestión integral de tratamientos médicos</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                size="sm"
                onClick={() => setIsNewPlanModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Plan
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alertas de Tratamiento */}
        {treatmentAlerts.filter(alert => alert.isActive).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-white/80 backdrop-blur-md border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-orange-600" />
                  Alertas de Tratamiento
                </CardTitle>
                <CardDescription>
                  Dosis pendientes, monitoreos y seguimientos requeridos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {treatmentAlerts.filter(alert => alert.isActive).map(alert => (
                    <TreatmentAlertCard key={alert.id} alert={alert} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Estadísticas de Tratamientos */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <Card className="bg-white/80 backdrop-blur-md border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clipboard className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Planes Activos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalActivePlans}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-md border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.successRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-md border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Cumplimiento</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.complianceRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-md border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Duración Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.averageDuration}</p>
                    <p className="text-xs text-gray-500">días</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-md border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Alertas Activas</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.alertsCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filtros */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200 sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-blue-600" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Búsqueda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Animal, condición..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="planned">Programado</option>
                    <option value="active">Activo</option>
                    <option value="paused">Pausado</option>
                    <option value="completed">Completado</option>
                    <option value="discontinued">Discontinuado</option>
                  </select>
                </div>

                {/* Categoría */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="all">Todas las categorías</option>
                    <option value="respiratory">Respiratorio</option>
                    <option value="digestive">Digestivo</option>
                    <option value="reproductive">Reproductivo</option>
                    <option value="metabolic">Metabólico</option>
                    <option value="infectious">Infeccioso</option>
                    <option value="parasitic">Parasitario</option>
                    <option value="injury">Lesiones</option>
                    <option value="chronic">Crónico</option>
                  </select>
                </div>

                {/* Prioridad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prioridad</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value)}
                  >
                    <option value="all">Todas las prioridades</option>
                    <option value="urgent">Urgente</option>
                    <option value="high">Alta</option>
                    <option value="medium">Media</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Planes de Tratamiento */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle>
                  Planes de Tratamiento ({filteredPlans.length})
                </CardTitle>
                <CardDescription>
                  Gestión de planes de tratamiento individualizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredPlans.map((plan) => (
                    <motion.div
                      key={plan.id}
                      whileHover={{ scale: 1.01 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-xl font-semibold text-gray-900">
                              {plan.animalName} ({plan.animalTag})
                            </h4>
                            <Badge variant={plan.status}>
                              {plan.status === 'planned' ? 'Programado' :
                               plan.status === 'active' ? 'Activo' :
                               plan.status === 'paused' ? 'Pausado' :
                               plan.status === 'completed' ? 'Completado' :
                               plan.status === 'discontinued' ? 'Discontinuado' : 'Fallido'}
                            </Badge>
                            <Badge variant={plan.priority}>
                              {plan.priority === 'urgent' ? 'Urgente' :
                               plan.priority === 'high' ? 'Alta' :
                               plan.priority === 'medium' ? 'Media' : 'Baja'}
                            </Badge>
                            <Badge variant={plan.conditionCategory}>
                              {plan.conditionCategory === 'respiratory' ? 'Respiratorio' :
                               plan.conditionCategory === 'digestive' ? 'Digestivo' :
                               plan.conditionCategory === 'reproductive' ? 'Reproductivo' :
                               plan.conditionCategory === 'metabolic' ? 'Metabólico' :
                               plan.conditionCategory === 'infectious' ? 'Infeccioso' :
                               plan.conditionCategory === 'parasitic' ? 'Parasitario' :
                               plan.conditionCategory === 'injury' ? 'Lesión' : 'Crónico'}
                            </Badge>
                            <Badge variant={plan.severity}>
                              {plan.severity === 'critical' ? 'Crítica' :
                               plan.severity === 'severe' ? 'Severa' :
                               plan.severity === 'moderate' ? 'Moderada' : 'Leve'}
                            </Badge>
                          </div>

                          <h5 className="text-lg font-medium text-gray-900 mb-2">{plan.planName}</h5>
                          <p className="text-gray-700 mb-4">{plan.diagnosis}</p>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                            <div>
                              <p className="text-gray-600">Veterinario:</p>
                              <p className="font-medium">{plan.veterinarian}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Inicio:</p>
                              <p className="font-medium">{plan.startDate.toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Duración:</p>
                              <p className="font-medium">
                                {Math.ceil((plan.expectedEndDate.getTime() - plan.startDate.getTime()) / (1000 * 60 * 60 * 24))} días
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Costo total:</p>
                              <p className="font-medium">${plan.totalCost.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h6 className="font-semibold text-gray-900 mb-2">Medicamentos</h6>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {plan.medications.map((med, idx) => (
                                <div key={idx} className="bg-blue-50 rounded-lg p-3">
                                  <p className="font-medium text-blue-900">{med.medicationName}</p>
                                  <p className="text-sm text-blue-700">
                                    {med.dosage} - {med.frequency} ({med.route})
                                  </p>
                                  <p className="text-sm text-blue-600">
                                    Días {med.startDay}-{med.endDay} | ${med.cost}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="mb-4">
                            <h6 className="font-semibold text-gray-900 mb-2">Objetivos del Tratamiento</h6>
                            <div className="space-y-2">
                              {plan.treatmentGoals.map((goal, idx) => (
                                <div key={idx} className="flex items-center gap-3">
                                  {goal.achieved ? (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  ) : (
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                  )}
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{goal.goal}</p>
                                    <p className="text-xs text-gray-600">
                                      Objetivo: {goal.targetValue} | 
                                      Actual: {goal.currentValue || 'Pendiente'} | 
                                      Meta: {goal.targetDate.toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Efectividad:</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full" 
                                    style={{ width: `${plan.effectiveness}%` }}
                                  />
                                </div>
                                <span className="font-medium">{plan.effectiveness}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-600">Cumplimiento:</p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${plan.compliance}%` }}
                                  />
                                </div>
                                <span className="font-medium">{plan.compliance}%</span>
                              </div>
                            </div>
                            <div>
                              <p className="text-gray-600">Período de retiro:</p>
                              <p className="font-medium">{plan.withdrawalPeriod} días</p>
                            </div>
                          </div>

                          {plan.notes && (
                            <div className="mt-4 text-sm text-gray-700">
                              <strong>Notas:</strong> {plan.notes}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewPlan(plan)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEditPlan(plan)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeletePlan(plan.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Modales */}
      <NewTreatmentModal
        isOpen={isNewPlanModalOpen}
        onClose={() => setIsNewPlanModalOpen(false)}
        onSave={handleNewPlan}
      />

      <ViewTreatmentModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
      />

      <EditTreatmentModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default TreatmentPlans;