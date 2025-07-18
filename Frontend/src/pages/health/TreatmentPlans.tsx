import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clipboard,
  Pill,
  Calendar,
  MapPin,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  BarChart3,
  Stethoscope,
  Target,
  TrendingDown,
  Bell,
  Settings,
  FileText,
  Download,
  Play,
  Pause,
  Zap,
  Shield,
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
    duration: number; // días
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
  withdrawalPeriod: number; // días
  totalCost: number;
  effectiveness: number; // porcentaje
  compliance: number; // porcentaje
  notes: string;
  followUpDate?: Date;
  complications?: string[];
  protocolId?: string;
}

interface TreatmentProtocol {
  id: string;
  name: string;
  description: string;
  category: string;
  conditions: string[];
  standardDuration: number;
  medications: Array<{
    medicationName: string;
    dosage: string;
    frequency: string;
    route: string;
    duration: number;
    isEssential: boolean;
  }>;
  monitoringSchedule: Array<{
    parameter: string;
    frequency: string;
    criticalValues: string;
  }>;
  expectedOutcomes: {
    successRate: number;
    averageRecoveryTime: number;
    commonSideEffects: string[];
  };
  contraindications: string[];
  cost: number;
  isStandard: boolean;
  createdBy: string;
  lastUpdated: Date;
  timesUsed: number;
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
}> = ({ children, onClick, variant = 'default', size = 'default', className = '', disabled = false }) => {
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

// Componente de Mapa de Tratamientos
const TreatmentMap: React.FC = () => {
  return (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Fondo del mapa simulado */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-green-100"></div>
      
      {/* Título de ubicación */}
      <div className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">Mapa de Tratamientos - Villahermosa, Tabasco</span>
        </div>
      </div>
      
      {/* Leyenda */}
      <div className="absolute top-4 right-4 bg-white rounded-lg p-3 shadow-md text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            <span>Activo</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Programado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Pausado</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Crítico</span>
          </div>
        </div>
      </div>
      
      {/* Marcadores simulados de tratamientos */}
      <div className="relative w-full h-full">
        {/* Tratamiento activo */}
        <div className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-green-600 rounded-full w-8 h-8 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Pill className="w-4 h-4 text-white" />
          </motion.div>
          <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-36 text-xs">
            <p className="font-medium text-green-700">Tratamiento Activo</p>
            <p className="text-gray-600">Mastitis - Bessie</p>
            <p className="text-gray-600">Día 3 de 7</p>
            <p className="text-gray-600">Sector A</p>
          </div>
        </div>
        
        {/* Tratamiento crítico */}
        <div className="absolute top-2/3 right-1/4 transform translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-red-500 rounded-full w-7 h-7 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <AlertTriangle className="w-4 h-4 text-white" />
          </motion.div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
            <p className="font-medium text-red-700">Urgente</p>
            <p className="text-gray-600">Neumonía - Luna</p>
            <p className="text-gray-600">Dosis vencida</p>
            <p className="text-gray-600">Sector B</p>
          </div>
        </div>
        
        {/* Tratamiento programado */}
        <div className="absolute bottom-1/4 left-2/3 transform -translate-x-1/2 translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Clock className="w-3 h-3 text-white" />
          </motion.div>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
            <p className="font-medium text-blue-700">Programado</p>
            <p className="text-gray-600">Desparasitación</p>
            <p className="text-gray-600">Inicia mañana</p>
            <p className="text-gray-600">Sector C</p>
          </div>
        </div>
        
        {/* Tratamiento pausado */}
        <div className="absolute top-1/2 right-1/3 transform translate-x-1/2 -translate-y-1/2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-yellow-500 rounded-full w-5 h-5 flex items-center justify-center shadow-lg cursor-pointer"
            whileHover={{ scale: 1.2 }}
          >
            <Pause className="w-3 h-3 text-white" />
          </motion.div>
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg p-2 shadow-lg min-w-32 text-xs">
            <p className="font-medium text-yellow-700">Pausado</p>
            <p className="text-gray-600">Antiinflamatorio</p>
            <p className="text-gray-600">Reacción adversa</p>
            <p className="text-gray-600">Sector D</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Alerta de Tratamiento
const TreatmentAlertCard: React.FC<{ alert: TreatmentAlert }> = ({ alert }) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'dose_due': return Pill;
      case 'monitoring_due': return Stethoscope;
      case 'side_effect': return AlertTriangle;
      case 'poor_response': return TrendingDown;
      case 'follow_up_due': return Calendar;
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
  const [protocols, setProtocols] = useState<TreatmentProtocol[]>([]);
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
  const [viewMode, setViewMode] = useState<'plans' | 'protocols' | 'schedule'>('plans');

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
                },
                {
                  time: '08:15',
                  medication: 'Meloxicam',
                  dosage: '0.5 mg/kg',
                  route: 'IM',
                  completed: true,
                  completedBy: 'Juan Pérez',
                  completedAt: new Date('2025-07-10T08:20:00')
                },
                {
                  time: '20:00',
                  medication: 'Penicilina G',
                  dosage: '20,000 UI/kg',
                  route: 'IM',
                  completed: true,
                  completedBy: 'Carlos Ruiz',
                  completedAt: new Date('2025-07-10T20:10:00')
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
                },
                {
                  parameter: 'Inflamación de ubre',
                  expectedValue: 'Reducción visible',
                  actualValue: 'Ligera mejora',
                  status: 'normal',
                  recordedBy: 'Dr. García',
                  recordedAt: new Date('2025-07-10T20:30:00')
                }
              ],
              dailyNotes: 'Buen inicio del tratamiento, animal responde positivamente'
            },
            {
              day: 2,
              date: new Date('2025-07-11'),
              tasks: [
                {
                  time: '08:00',
                  medication: 'Penicilina G',
                  dosage: '20,000 UI/kg',
                  route: 'IM',
                  completed: true,
                  completedBy: 'Juan Pérez',
                  completedAt: new Date('2025-07-11T08:05:00')
                },
                {
                  time: '08:15',
                  medication: 'Meloxicam',
                  dosage: '0.5 mg/kg',
                  route: 'IM',
                  completed: true,
                  completedBy: 'Juan Pérez',
                  completedAt: new Date('2025-07-11T08:18:00')
                }
              ],
              observations: [
                {
                  parameter: 'Temperatura corporal',
                  expectedValue: '< 39.0°C',
                  actualValue: '38.8°C',
                  status: 'normal',
                  recordedBy: 'Dr. García',
                  recordedAt: new Date('2025-07-11T08:25:00')
                }
              ],
              dailyNotes: 'Mejora notable en la inflamación y temperatura'
            }
          ],
          treatmentGoals: [
            {
              goal: 'Normalizar temperatura corporal',
              targetValue: '< 39.0°C',
              currentValue: '38.8°C',
              achieved: true,
              targetDate: new Date('2025-07-12')
            },
            {
              goal: 'Reducir inflamación de ubre',
              targetValue: 'Ausencia de inflamación',
              currentValue: 'Mejora del 70%',
              achieved: false,
              targetDate: new Date('2025-07-15')
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
            },
            {
              parameter: 'Apetito',
              frequency: 'Diario',
              normalRange: 'Normal',
              alertThreshold: 'Anorexia > 24h'
            }
          ],
          withdrawalPeriod: 14,
          totalCost: 172.50,
          effectiveness: 85,
          compliance: 95,
          notes: 'Respuesta favorable al tratamiento. Continuar monitoreo.',
          followUpDate: new Date('2025-07-20')
        },
        {
          id: '2',
          animalId: 'COW002',
          animalName: 'Luna',
          animalTag: 'TAG-002',
          planName: 'Tratamiento Neumonía Bacteriana',
          condition: 'Neumonía',
          conditionCategory: 'respiratory',
          severity: 'severe',
          diagnosis: 'Neumonía bacteriana por Mannheimia haemolytica con compromiso respiratorio severo',
          createdDate: new Date('2025-07-08'),
          startDate: new Date('2025-07-08'),
          expectedEndDate: new Date('2025-07-18'),
          status: 'active',
          priority: 'urgent',
          veterinarian: 'Dr. Martínez',
          location: {
            lat: 17.9719,
            lng: -92.9456,
            address: 'Establo de Aislamiento, Sector B',
            sector: 'B'
          },
          medications: [
            {
              medicationId: 'MED003',
              medicationName: 'Florfenicol',
              dosage: '20 mg/kg',
              frequency: 'Cada 48 horas',
              route: 'intramuscular',
              duration: 10,
              startDay: 1,
              endDay: 10,
              instructions: 'Antibiótico de amplio espectro para neumonía',
              cost: 45.00
            },
            {
              medicationId: 'MED004',
              medicationName: 'Dexametasona',
              dosage: '0.1 mg/kg',
              frequency: 'Una vez al día',
              route: 'intramuscular',
              duration: 5,
              startDay: 1,
              endDay: 5,
              instructions: 'Corticoide para reducir inflamación pulmonar',
              cost: 12.25
            }
          ],
          schedule: [], // Se generaría dinámicamente
          treatmentGoals: [
            {
              goal: 'Normalizar función respiratoria',
              targetValue: '< 30 rpm',
              currentValue: '45 rpm',
              achieved: false,
              targetDate: new Date('2025-07-15')
            },
            {
              goal: 'Eliminar secreción nasal',
              targetValue: 'Ausencia de secreción',
              currentValue: 'Secreción mucopurulenta moderada',
              achieved: false,
              targetDate: new Date('2025-07-16')
            }
          ],
          contraindications: ['Insuficiencia renal', 'Gestación avanzada'],
          sideEffects: ['Inmunodepresión temporal', 'Retención de líquidos'],
          monitoringParameters: [
            {
              parameter: 'Frecuencia respiratoria',
              frequency: 'Cada 6 horas',
              normalRange: '15-30 rpm',
              alertThreshold: '> 50 rpm'
            },
            {
              parameter: 'Temperatura corporal',
              frequency: 'Cada 8 horas',
              normalRange: '38.0-39.5°C',
              alertThreshold: '> 41.0°C'
            }
          ],
          withdrawalPeriod: 21,
          totalCost: 285.00,
          effectiveness: 70,
          compliance: 88,
          notes: 'Caso severo que requiere monitoreo intensivo. Respuesta inicial lenta.',
          followUpDate: new Date('2025-07-25'),
          complications: ['Dificultad respiratoria persistente']
        }
      ];

      // Datos de ejemplo para protocolos
      const mockProtocols: TreatmentProtocol[] = [
        {
          id: '1',
          name: 'Protocolo Estándar Mastitis',
          description: 'Tratamiento estandarizado para mastitis clínica en ganado lechero',
          category: 'Infectología',
          conditions: ['Mastitis clínica', 'Mastitis subclínica'],
          standardDuration: 7,
          medications: [
            {
              medicationName: 'Penicilina G',
              dosage: '20,000 UI/kg',
              frequency: 'Cada 12 horas',
              route: 'intramuscular',
              duration: 7,
              isEssential: true
            },
            {
              medicationName: 'Meloxicam',
              dosage: '0.5 mg/kg',
              frequency: 'Una vez al día',
              route: 'intramuscular',
              duration: 3,
              isEssential: false
            }
          ],
          monitoringSchedule: [
            {
              parameter: 'Temperatura corporal',
              frequency: 'Cada 12 horas',
              criticalValues: '> 40.0°C'
            },
            {
              parameter: 'Calidad de leche',
              frequency: 'Diario',
              criticalValues: 'Presencia de grumos o sangre'
            }
          ],
          expectedOutcomes: {
            successRate: 85,
            averageRecoveryTime: 5,
            commonSideEffects: ['Reacción en sitio de inyección', 'Trastornos digestivos leves']
          },
          contraindications: ['Alergia a penicilina', 'Insuficiencia renal severa'],
          cost: 175,
          isStandard: true,
          createdBy: 'Dr. García',
          lastUpdated: new Date('2025-06-15'),
          timesUsed: 23
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
        },
        {
          id: '2',
          type: 'monitoring_due',
          planId: '2',
          animalName: 'Luna',
          animalTag: 'TAG-002',
          priority: 'medium',
          title: 'Monitoreo de Signos Vitales Pendiente',
          description: 'Evaluación de frecuencia respiratoria programada',
          scheduledTime: new Date('2025-07-12T18:00:00'),
          hoursOverdue: 6,
          recommendedAction: 'Realizar evaluación respiratoria y registrar en historial',
          isActive: true,
          createdAt: new Date('2025-07-13T00:00:00')
        },
        {
          id: '3',
          type: 'side_effect',
          planId: '1',
          animalName: 'Bessie',
          animalTag: 'TAG-001',
          priority: 'critical',
          title: 'Posible Reacción Adversa',
          description: 'Animal presenta inflamación en sitio de inyección',
          recommendedAction: 'Evaluar inmediatamente, considerar cambio de medicamento',
          isActive: true,
          createdAt: new Date('2025-07-12T15:30:00')
        }
      ];

      setTreatmentPlans(mockPlans);
      setProtocols(mockProtocols);
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
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Protocolos
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
              <Button size="sm">
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Estadísticas de Tratamientos */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12"
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

          {/* Mapa de Tratamientos */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  Mapa de Tratamientos Activos
                </CardTitle>
                <CardDescription>
                  Distribución geográfica de planes de tratamiento en curso
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TreatmentMap />
              </CardContent>
            </Card>
          </motion.div>

          {/* Panel de Control */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4 space-y-6"
          >
            {/* Selector de Vista */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-600" />
                  Vista
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant={viewMode === 'plans' ? 'default' : 'outline'}
                    onClick={() => setViewMode('plans')}
                    className="justify-start"
                  >
                    <Clipboard className="w-4 h-4 mr-2" />
                    Planes Activos
                  </Button>
                  <Button 
                    variant={viewMode === 'protocols' ? 'default' : 'outline'}
                    onClick={() => setViewMode('protocols')}
                    className="justify-start"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Protocolos
                  </Button>
                  <Button 
                    variant={viewMode === 'schedule' ? 'default' : 'outline'}
                    onClick={() => setViewMode('schedule')}
                    className="justify-start"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Cronograma Hoy
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
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

            {/* Estadísticas Adicionales */}
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  Indicadores
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Condición más común:</span>
                  <span className="font-medium">{stats.mostCommonCondition}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Completados este mes:</span>
                  <span className="font-medium">{stats.completedThisMonth}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Costo total:</span>
                  <span className="font-medium">${stats.totalCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Seguimientos pendientes:</span>
                  <span className="font-medium text-orange-600">{stats.overdueFollowUps}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Protocolos disponibles:</span>
                  <span className="font-medium">{stats.protocolsCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Efectividad promedio:</span>
                  <span className="font-medium">{stats.avgEffectiveness}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Vista Principal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-12"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={viewMode}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Card className="bg-white/80 backdrop-blur-md border-gray-200">
                  <CardHeader>
                    <CardTitle>
                      {viewMode === 'plans' ? `Planes de Tratamiento (${filteredPlans.length})` :
                       viewMode === 'protocols' ? `Protocolos Estándar (${protocols.length})` :
                       'Cronograma de Hoy'}
                    </CardTitle>
                    <CardDescription>
                      {viewMode === 'plans' ? 'Gestión de planes de tratamiento individualizados' :
                       viewMode === 'protocols' ? 'Protocolos estandarizados de tratamiento' :
                       'Tareas y medicaciones programadas para hoy'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {viewMode === 'plans' && filteredPlans.map((plan) => (
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
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              {plan.status === 'active' && (
                                <Button variant="warning" size="sm">
                                  <Pause className="w-4 h-4" />
                                </Button>
                              )}
                              {plan.status === 'paused' && (
                                <Button variant="success" size="sm">
                                  <Play className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {viewMode === 'protocols' && protocols.map((protocol) => (
                        <motion.div
                          key={protocol.id}
                          whileHover={{ scale: 1.01 }}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h4 className="text-xl font-semibold text-gray-900">{protocol.name}</h4>
                                {protocol.isStandard && (
                                  <Badge variant="success">Estándar</Badge>
                                )}
                                <span className="text-sm text-gray-600">{protocol.category}</span>
                              </div>

                              <p className="text-gray-700 mb-4">{protocol.description}</p>

                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-4">
                                <div>
                                  <p className="text-gray-600">Duración estándar:</p>
                                  <p className="font-medium">{protocol.standardDuration} días</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Tasa de éxito:</p>
                                  <p className="font-medium">{protocol.expectedOutcomes.successRate}%</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Tiempo promedio:</p>
                                  <p className="font-medium">{protocol.expectedOutcomes.averageRecoveryTime} días</p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Costo:</p>
                                  <p className="font-medium">${protocol.cost}</p>
                                </div>
                              </div>

                              <div className="mb-4">
                                <h6 className="font-semibold text-gray-900 mb-2">Condiciones Tratadas</h6>
                                <div className="flex flex-wrap gap-1">
                                  {protocol.conditions.map((condition, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                      {condition}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div className="mb-4">
                                <h6 className="font-semibold text-gray-900 mb-2">Medicamentos</h6>
                                <div className="space-y-2">
                                  {protocol.medications.map((med, idx) => (
                                    <div key={idx} className={`p-3 rounded-lg ${med.isEssential ? 'bg-red-50 border border-red-200' : 'bg-gray-50'}`}>
                                      <div className="flex items-center gap-2">
                                        <p className="font-medium">{med.medicationName}</p>
                                        {med.isEssential && (
                                          <Badge variant="critical">Esencial</Badge>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        {med.dosage} - {med.frequency} ({med.route}) por {med.duration} días
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="text-sm text-gray-600">
                                <p><strong>Usado:</strong> {protocol.timesUsed} veces</p>
                                <p><strong>Creado por:</strong> {protocol.createdBy}</p>
                                <p><strong>Última actualización:</strong> {protocol.lastUpdated.toLocaleDateString()}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 ml-4">
                              <Button variant="outline" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="success" size="sm">
                                <Zap className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {viewMode === 'schedule' && (
                        <div className="text-center py-12">
                          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Cronograma de Hoy</h3>
                          <p className="text-gray-600 mb-4">
                            Vista detallada de todas las tareas programadas para hoy
                          </p>
                          <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Ver Cronograma Completo
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TreatmentPlans;