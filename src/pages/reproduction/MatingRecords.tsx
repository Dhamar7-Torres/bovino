import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Calendar, MapPin, Beef, User, Heart, Clock, CheckCircle, AlertCircle, Plus, Search, Edit, Trash2, Eye, X, Save } from 'lucide-react';

// Función utility para clases CSS
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};


// Interfaces específicas para el CRUD de Registros de Apareamiento
interface MatingRecordsProps {
  className?: string;
}

interface MatingRecord {
  id: string;
  
  // Información de la hembra
  female: {
    id: string;
    tag: string;
    name: string;
    breed: string;
    age: number;
    weight: number;
    reproductiveStatus: string;
  };
  
  // Información del macho
  male: {
    id: string;
    tag: string;
    name: string;
    breed: string;
    age: number;
    weight: number;
    performance: {
      libido: number; // 1-10
      fertility: number; // porcentaje
      offspring: number; // número de crías
    };
  };
  
  // Información del apareamiento
  mating: {
    date: Date;
    time: string;
    duration: number; // minutos
    naturalBehavior: boolean;
    assistanceRequired: boolean;
    location: {
      lat: number;
      lng: number;
      address: string;
      sector: string;
      potrero: string;
      paddock: string;
    };
    weather: {
      temperature: number;
      humidity: number;
      condition: string;
    };
  };
  
  // Condiciones y observaciones
  conditions: {
    femaleCondition: string;
    maleCondition: string;
    estrusStage: string;
    matingScore: number; // 1-10
    complications: string[];
    supervision: {
      supervisor: string;
      veterinarian?: string;
      assistants: string[];
    };
  };
  
  // Seguimiento post-apareamiento
  followUp: {
    pregnancyCheck?: {
      date: Date;
      result: boolean;
      method: string;
      veterinarian: string;
    };
    behaviorObservations: string[];
    healthStatus: {
      female: string;
      male: string;
    };
    nextCheckDate?: Date;
  };
  
  // Costos y análisis económico
  economics: {
    matingCost: number;
    supervisionCost: number;
    veterinaryCost: number;
    facilityUsage: number;
    totalCost: number;
    expectedValue: number; // valor esperado de la cría
  };
  
  // Datos genéticos
  genetics: {
    pedigreeCompatibility: number; // 1-10
    expectedTraits: string[];
    breedingObjective: string;
    geneticDiversity: number; // 1-10
    inbreedingCoefficient: number;
  };
  
  // Metadatos
  notes: string;
  status: 'completed' | 'monitoring' | 'confirmed_pregnancy' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface FilterOptions {
  dateRange: string;
  supervisor: string;
  sector: string;
  pregnancyResult: string;
  maleBreed: string;
  femaleBreed: string;
}

interface FormData {
  femaleId?: string;
  maleId?: string;
  matingDate?: string;
  matingTime?: string;
  location?: string;
  supervisor?: string;
  notes?: string;
}

// Componente principal del CRUD de Registros de Apareamiento
export const MatingRecords: React.FC<MatingRecordsProps> = ({ 
  className 
}) => {
  // Estados del componente
  const [records, setRecords] = useState<MatingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MatingRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MatingRecord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'month',
    supervisor: 'all',
    sector: 'all',
    pregnancyResult: 'all',
    maleBreed: 'all',
    femaleBreed: 'all'
  });

  // Estados para formulario de creación/edición
  const [formData, setFormData] = useState<FormData>({});

  // Datos de ejemplo para registros de apareamiento
  const mockRecords: MatingRecord[] = [
    {
      id: 'MT-001',
      female: {
        id: 'COW-F-156',
        tag: 'F-TAG-0156',
        name: 'Esperanza',
        breed: 'Holstein',
        age: 4,
        weight: 450,
        reproductiveStatus: 'En celo'
      },
      male: {
        id: 'BULL-M-001',
        tag: 'M-TAG-001',
        name: 'Campeón Real',
        breed: 'Holstein',
        age: 6,
        weight: 850,
        performance: {
          libido: 9,
          fertility: 85,
          offspring: 47
        }
      },
      mating: {
        date: new Date('2025-07-15'),
        time: '08:45',
        duration: 12,
        naturalBehavior: true,
        assistanceRequired: false,
        location: {
          lat: 17.0732,
          lng: -93.1451,
          address: 'Potrero Norte, Paddock A1',
          sector: 'Norte',
          potrero: 'San José',
          paddock: 'A1'
        },
        weather: {
          temperature: 24,
          humidity: 68,
          condition: 'Despejado'
        }
      },
      conditions: {
        femaleCondition: 'Excelente',
        maleCondition: 'Excelente',
        estrusStage: 'Estro óptimo',
        matingScore: 9,
        complications: [],
        supervision: {
          supervisor: 'Carlos Mendoza',
          veterinarian: 'Dr. María González',
          assistants: ['Juan Pérez', 'Ana López']
        }
      },
      followUp: {
        pregnancyCheck: {
          date: new Date('2025-08-12'),
          result: true,
          method: 'Ultrasonido',
          veterinarian: 'Dr. María González'
        },
        behaviorObservations: [
          'Comportamiento normal post-apareamiento',
          'No signos de estrés',
          'Alimentación regular'
        ],
        healthStatus: {
          female: 'Excelente',
          male: 'Excelente'
        },
        nextCheckDate: new Date('2025-09-15')
      },
      economics: {
        matingCost: 150,
        supervisionCost: 100,
        veterinaryCost: 200,
        facilityUsage: 50,
        totalCost: 500,
        expectedValue: 25000
      },
      genetics: {
        pedigreeCompatibility: 8,
        expectedTraits: ['Alta producción lechera', 'Resistencia a enfermedades', 'Conformación corporal'],
        breedingObjective: 'Mejoramiento genético para producción lechera',
        geneticDiversity: 7,
        inbreedingCoefficient: 0.05
      },
      notes: 'Apareamiento exitoso entre animales de alto valor genético. Excelente comportamiento natural.',
      status: 'confirmed_pregnancy',
      createdAt: new Date('2025-07-15'),
      updatedAt: new Date('2025-08-12'),
      createdBy: 'Carlos Mendoza'
    },
    {
      id: 'MT-002',
      female: {
        id: 'COW-F-089',
        tag: 'F-TAG-0089',
        name: 'Marisol',
        breed: 'Angus',
        age: 3,
        weight: 420,
        reproductiveStatus: 'Celo moderado'
      },
      male: {
        id: 'BULL-M-002',
        tag: 'M-TAG-002',
        name: 'Black Thunder',
        breed: 'Angus',
        age: 5,
        weight: 900,
        performance: {
          libido: 8,
          fertility: 78,
          offspring: 32
        }
      },
      mating: {
        date: new Date('2025-07-12'),
        time: '15:30',
        duration: 15,
        naturalBehavior: true,
        assistanceRequired: true,
        location: {
          lat: 17.0845,
          lng: -93.1523,
          address: 'Potrero Sur, Paddock B2',
          sector: 'Sur',
          potrero: 'Las Flores',
          paddock: 'B2'
        },
        weather: {
          temperature: 26,
          humidity: 72,
          condition: 'Parcialmente nublado'
        }
      },
      conditions: {
        femaleCondition: 'Buena',
        maleCondition: 'Buena',
        estrusStage: 'Celo tardío',
        matingScore: 7,
        complications: ['Resistencia inicial de la hembra'],
        supervision: {
          supervisor: 'Miguel Rodríguez',
          veterinarian: 'Dr. Pedro Martínez',
          assistants: ['Carlos Ruiz']
        }
      },
      followUp: {
        pregnancyCheck: {
          date: new Date('2025-08-09'),
          result: false,
          method: 'Palpación rectal',
          veterinarian: 'Dr. Pedro Martínez'
        },
        behaviorObservations: [
          'Comportamiento ligeramente estresado inicialmente',
          'Normalización después de 24 horas',
          'Alimentación regular'
        ],
        healthStatus: {
          female: 'Buena',
          male: 'Excelente'
        },
        nextCheckDate: new Date('2025-08-25')
      },
      economics: {
        matingCost: 150,
        supervisionCost: 120,
        veterinaryCost: 180,
        facilityUsage: 50,
        totalCost: 500,
        expectedValue: 20000
      },
      genetics: {
        pedigreeCompatibility: 7,
        expectedTraits: ['Carne de calidad', 'Resistencia al clima', 'Crecimiento rápido'],
        breedingObjective: 'Mejoramiento para producción cárnica',
        geneticDiversity: 6,
        inbreedingCoefficient: 0.08
      },
      notes: 'Apareamiento con asistencia debido a resistencia inicial. No resultó en gestación.',
      status: 'failed',
      createdAt: new Date('2025-07-12'),
      updatedAt: new Date('2025-08-09'),
      createdBy: 'Miguel Rodríguez'
    },
    {
      id: 'MT-003',
      female: {
        id: 'COW-F-203',
        tag: 'F-TAG-0203',
        name: 'Paloma',
        breed: 'Charolais',
        age: 5,
        weight: 520,
        reproductiveStatus: 'Celo intenso'
      },
      male: {
        id: 'BULL-M-003',
        tag: 'M-TAG-003',
        name: 'Golden King',
        breed: 'Charolais',
        age: 7,
        weight: 950,
        performance: {
          libido: 9,
          fertility: 82,
          offspring: 55
        }
      },
      mating: {
        date: new Date('2025-07-10'),
        time: '10:15',
        duration: 18,
        naturalBehavior: true,
        assistanceRequired: false,
        location: {
          lat: 17.0698,
          lng: -93.1389,
          address: 'Potrero Este, Paddock C3',
          sector: 'Este',
          potrero: 'El Roble',
          paddock: 'C3'
        },
        weather: {
          temperature: 22,
          humidity: 65,
          condition: 'Lluvia ligera'
        }
      },
      conditions: {
        femaleCondition: 'Excelente',
        maleCondition: 'Excelente',
        estrusStage: 'Estro intenso',
        matingScore: 10,
        complications: [],
        supervision: {
          supervisor: 'Carlos Mendoza',
          veterinarian: 'Dr. Ana Morales',
          assistants: ['Luis García', 'María Fernández']
        }
      },
      followUp: {
        behaviorObservations: [
          'Comportamiento excelente post-apareamiento',
          'Signos positivos de gestación',
          'Alimentación incrementada'
        ],
        healthStatus: {
          female: 'Excelente',
          male: 'Excelente'
        },
        nextCheckDate: new Date('2025-08-07')
      },
      economics: {
        matingCost: 200,
        supervisionCost: 150,
        veterinaryCost: 250,
        facilityUsage: 75,
        totalCost: 675,
        expectedValue: 30000
      },
      genetics: {
        pedigreeCompatibility: 9,
        expectedTraits: ['Crecimiento superior', 'Musculatura excepcional', 'Resistencia'],
        breedingObjective: 'Línea de élite para reproducción',
        geneticDiversity: 8,
        inbreedingCoefficient: 0.03
      },
      notes: 'Apareamiento de élite entre animales de alto valor genético. Resultados esperados excelentes.',
      status: 'monitoring',
      createdAt: new Date('2025-07-10'),
      updatedAt: new Date('2025-07-10'),
      createdBy: 'Carlos Mendoza'
    }
  ];

  // Efectos del componente
  useEffect(() => {
    // Simular carga de datos
    const timer = setTimeout(() => {
      setRecords(mockRecords);
      setIsLoading(false);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // Variantes de animación para Framer Motion
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.2 }
    }
  };

  // Funciones CRUD
  const handleCreate = () => {
    setFormData({});
    setEditingRecord(null);
    setShowCreateModal(true);
  };

  const handleEdit = (record: MatingRecord) => {
    setEditingRecord(record);
    setFormData({
      femaleId: record.female.id,
      maleId: record.male.id,
      matingDate: record.mating.date.toISOString().split('T')[0],
      matingTime: record.mating.time,
      location: record.mating.location.address,
      supervisor: record.conditions.supervision.supervisor,
      notes: record.notes
    });
    setShowEditModal(true);
  };

  const handleView = (record: MatingRecord) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleDelete = (recordId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de apareamiento?')) {
      setRecords(records.filter(record => record.id !== recordId));
    }
  };

  const handleSave = () => {
    if (editingRecord) {
      // Actualizar registro existente
      const updatedRecord = {
        ...editingRecord,
        // Actualizar campos editables
        notes: formData.notes || editingRecord.notes,
        updatedAt: new Date()
      };
      
      setRecords(records.map(record => 
        record.id === editingRecord.id ? updatedRecord : record
      ));
      setShowEditModal(false);
    } else {
      // Crear nuevo registro - simplificado para demostración
      const newRecord: MatingRecord = {
        id: `MT-${Date.now()}`,
        female: {
          id: formData.femaleId || 'COW-NEW',
          tag: 'NEW-TAG',
          name: 'Nueva Hembra',
          breed: 'Holstein',
          age: 3,
          weight: 400,
          reproductiveStatus: 'En celo'
        },
        male: {
          id: formData.maleId || 'BULL-NEW',
          tag: 'NEW-BULL',
          name: 'Nuevo Macho',
          breed: 'Holstein',
          age: 5,
          weight: 800,
          performance: { libido: 8, fertility: 80, offspring: 20 }
        },
        mating: {
          date: new Date(formData.matingDate || new Date()),
          time: formData.matingTime || '08:00',
          duration: 15,
          naturalBehavior: true,
          assistanceRequired: false,
          location: {
            lat: 17.0732,
            lng: -93.1451,
            address: formData.location || 'Nueva ubicación',
            sector: 'Norte',
            potrero: 'Nuevo',
            paddock: 'A1'
          },
          weather: { temperature: 25, humidity: 70, condition: 'Despejado' }
        },
        conditions: {
          femaleCondition: 'Buena',
          maleCondition: 'Buena',
          estrusStage: 'Celo moderado',
          matingScore: 7,
          complications: [],
          supervision: {
            supervisor: formData.supervisor || 'Supervisor',
            assistants: []
          }
        },
        followUp: {
          behaviorObservations: [],
          healthStatus: { female: 'Buena', male: 'Buena' }
        },
        economics: {
          matingCost: 150,
          supervisionCost: 100,
          veterinaryCost: 150,
          facilityUsage: 50,
          totalCost: 450,
          expectedValue: 20000
        },
        genetics: {
          pedigreeCompatibility: 7,
          expectedTraits: ['Producción estándar'],
          breedingObjective: 'Mejoramiento general',
          geneticDiversity: 6,
          inbreedingCoefficient: 0.06
        },
        notes: formData.notes || 'Nuevo registro de apareamiento',
        status: 'monitoring',
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: 'Usuario'
      };
      
      setRecords([newRecord, ...records]);
      setShowCreateModal(false);
    }
    
    setFormData({});
    setEditingRecord(null);
  };

  // Función para filtrar registros
  const getFilteredRecords = () => {
    return records.filter(record => {
      const matchesSearch = record.female.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.female.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.male.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.male.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.conditions.supervision.supervisor.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSupervisor = filters.supervisor === 'all' || record.conditions.supervision.supervisor === filters.supervisor;
      const matchesSector = filters.sector === 'all' || record.mating.location.sector === filters.sector;
      const matchesMaleBreed = filters.maleBreed === 'all' || record.male.breed === filters.maleBreed;
      const matchesFemaleBreed = filters.femaleBreed === 'all' || record.female.breed === filters.femaleBreed;
      
      let matchesPregnancy = true;
      if (filters.pregnancyResult !== 'all') {
        if (record.followUp.pregnancyCheck) {
          matchesPregnancy = filters.pregnancyResult === 'positive' ? 
            record.followUp.pregnancyCheck.result : 
            !record.followUp.pregnancyCheck.result;
        } else {
          matchesPregnancy = filters.pregnancyResult === 'pending';
        }
      }
      
      return matchesSearch && matchesSupervisor && matchesSector && matchesMaleBreed && matchesFemaleBreed && matchesPregnancy;
    });
  };

  // Función para obtener el color según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed_pregnancy': return 'bg-green-100 text-green-800';
      case 'monitoring': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed_pregnancy': return 'Gestación Confirmada';
      case 'monitoring': return 'En Seguimiento';
      case 'completed': return 'Completado';
      case 'failed': return 'Fallido';
      default: return 'Sin Estado';
    }
  };

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  // Componente de loading con spinner
  const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center min-h-[400px]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-[#519a7c] border-t-transparent rounded-full"
      />
    </div>
  );

  // Componente para tarjeta de registro
  const RecordCard: React.FC<{ record: MatingRecord }> = ({ record }) => {
    const pregnancyStatus = record.followUp.pregnancyCheck ? 
      (record.followUp.pregnancyCheck.result ? 'Gestante' : 'No gestante') : 'Pendiente';
    
    const pregnancyColor = record.followUp.pregnancyCheck ? 
      (record.followUp.pregnancyCheck.result ? 'text-green-600' : 'text-red-600') : 'text-yellow-600';

    return (
      <motion.div
        variants={itemVariants}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                {record.female.name} ♀ × {record.male.name} ♂
              </h3>
              <p className="text-sm text-gray-600">
                {record.female.tag} × {record.male.tag}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
              {getStatusText(record.status)}
            </span>
            <button
              onClick={() => handleView(record)}
              className="p-2 text-gray-600 hover:text-[#519a7c] transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleEdit(record)}
              className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(record.id)}
              className="p-2 text-gray-600 hover:text-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#519a7c]" />
            <span className="text-sm text-gray-600">
              {record.mating.date.toLocaleDateString('es-MX')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#519a7c]" />
            <span className="text-sm text-gray-600">{record.mating.time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#519a7c]" />
            <span className="text-sm text-gray-600">{record.mating.location.sector}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-[#519a7c]" />
            <span className="text-sm text-gray-600">{record.conditions.supervision.supervisor}</span>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Duración:</span>
            <span className="text-sm font-medium text-gray-800">{record.mating.duration} min</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Puntuación:</span>
            <span className="text-sm font-medium text-gray-800">{record.conditions.matingScore}/10</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Estado gestación:</span>
            <span className={`text-sm font-medium ${pregnancyColor}`}>{pregnancyStatus}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Costo total:</span>
            <span className="text-sm font-bold text-[#519a7c]">{formatCurrency(record.economics.totalCost)}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Modal para crear/editar registros
  const FormModal: React.FC<{ isEdit: boolean }> = ({ isEdit }) => (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
        }}
      >
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Header del modal */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-lg">
                  <Heart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {isEdit ? 'Editar Registro de Apareamiento' : 'Nuevo Registro de Apareamiento'}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Formulario */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Hembra
                  </label>
                  <input
                    type="text"
                    value={formData.femaleId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, femaleId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    placeholder="COW-F-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ID Macho
                  </label>
                  <input
                    type="text"
                    value={formData.maleId || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, maleId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    placeholder="BULL-M-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Apareamiento
                  </label>
                  <input
                    type="date"
                    value={formData.matingDate || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, matingDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hora
                  </label>
                  <input
                    type="time"
                    value={formData.matingTime || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, matingTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  placeholder="Potrero Norte, Paddock A1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supervisor
                </label>
                <input
                  type="text"
                  value={formData.supervisor || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, supervisor: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  placeholder="Nombre del supervisor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  placeholder="Observaciones del apareamiento..."
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white px-6 py-2 rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 flex items-center space-x-2"
              >
                <Save className="w-5 h-5" />
                <span>{isEdit ? 'Actualizar' : 'Guardar'}</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // Modal para ver detalles completos
  const ViewModal: React.FC = () => {
    if (!selectedRecord) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setShowViewModal(false)}
        >
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Registro de Apareamiento
                    </h2>
                    <p className="text-gray-600">ID: {selectedRecord.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información de la hembra */}
                <div className="bg-pink-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Beef className="w-5 h-5 mr-2 text-pink-600" />
                    Hembra
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium">{selectedRecord.female.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Etiqueta:</span>
                      <span className="font-medium">{selectedRecord.female.tag}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Raza:</span>
                      <span className="font-medium">{selectedRecord.female.breed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Edad:</span>
                      <span className="font-medium">{selectedRecord.female.age} años</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso:</span>
                      <span className="font-medium">{selectedRecord.female.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado reproductivo:</span>
                      <span className="font-medium">{selectedRecord.female.reproductiveStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Información del macho */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Beef className="w-5 h-5 mr-2 text-blue-600" />
                    Macho
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium">{selectedRecord.male.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Etiqueta:</span>
                      <span className="font-medium">{selectedRecord.male.tag}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Raza:</span>
                      <span className="font-medium">{selectedRecord.male.breed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Edad:</span>
                      <span className="font-medium">{selectedRecord.male.age} años</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Peso:</span>
                      <span className="font-medium">{selectedRecord.male.weight} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Libido:</span>
                      <span className="font-medium">{selectedRecord.male.performance.libido}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fertilidad:</span>
                      <span className="font-medium">{selectedRecord.male.performance.fertility}%</span>
                    </div>
                  </div>
                </div>

                {/* Información del apareamiento */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Heart className="w-5 h-5 mr-2 text-green-600" />
                    Apareamiento
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">{selectedRecord.mating.date.toLocaleDateString('es-MX')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hora:</span>
                      <span className="font-medium">{selectedRecord.mating.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duración:</span>
                      <span className="font-medium">{selectedRecord.mating.duration} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Natural:</span>
                      <span className="font-medium">{selectedRecord.mating.naturalBehavior ? 'Sí' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Asistencia:</span>
                      <span className="font-medium">{selectedRecord.mating.assistanceRequired ? 'Sí' : 'No'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Puntuación:</span>
                      <span className="font-medium">{selectedRecord.conditions.matingScore}/10</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ubicación y condiciones */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-[#519a7c]" />
                    Ubicación y Condiciones
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sector:</span>
                      <span className="font-medium">{selectedRecord.mating.location.sector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Potrero:</span>
                      <span className="font-medium">{selectedRecord.mating.location.potrero}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Paddock:</span>
                      <span className="font-medium">{selectedRecord.mating.location.paddock}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Temperatura:</span>
                      <span className="font-medium">{selectedRecord.mating.weather.temperature}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Humedad:</span>
                      <span className="font-medium">{selectedRecord.mating.weather.humidity}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Clima:</span>
                      <span className="font-medium">{selectedRecord.mating.weather.condition}</span>
                    </div>
                  </div>
                </div>

                {/* Supervisión y personal */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <User className="w-5 h-5 mr-2 text-[#519a7c]" />
                    Personal y Supervisión
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Supervisor:</span>
                      <span className="font-medium">{selectedRecord.conditions.supervision.supervisor}</span>
                    </div>
                    {selectedRecord.conditions.supervision.veterinarian && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Veterinario:</span>
                        <span className="font-medium">{selectedRecord.conditions.supervision.veterinarian}</span>
                      </div>
                    )}
                    {selectedRecord.conditions.supervision.assistants.length > 0 && (
                      <div>
                        <span className="text-gray-600">Asistentes:</span>
                        <div className="mt-1">
                          {selectedRecord.conditions.supervision.assistants.map((assistant, index) => (
                            <span key={index} className="inline-block bg-gray-200 rounded-full px-2 py-1 text-xs text-gray-700 mr-1 mb-1">
                              {assistant}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resultados y economía */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Seguimiento y resultados */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-[#519a7c]" />
                    Seguimiento y Resultados
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado:</span>
                      <span className={`font-medium ${
                        selectedRecord.status === 'confirmed_pregnancy' ? 'text-green-600' :
                        selectedRecord.status === 'monitoring' ? 'text-blue-600' :
                        selectedRecord.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {getStatusText(selectedRecord.status)}
                      </span>
                    </div>
                    {selectedRecord.followUp.pregnancyCheck && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chequeo gestación:</span>
                          <span className="font-medium">
                            {selectedRecord.followUp.pregnancyCheck.date.toLocaleDateString('es-MX')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Resultado:</span>
                          <span className={`font-medium ${selectedRecord.followUp.pregnancyCheck.result ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedRecord.followUp.pregnancyCheck.result ? 'Gestante' : 'No gestante'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Método:</span>
                          <span className="font-medium">{selectedRecord.followUp.pregnancyCheck.method}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado hembra:</span>
                      <span className="font-medium">{selectedRecord.followUp.healthStatus.female}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado macho:</span>
                      <span className="font-medium">{selectedRecord.followUp.healthStatus.male}</span>
                    </div>
                  </div>
                </div>

                {/* Análisis económico */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Análisis Económico
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Costo apareamiento:</span>
                      <span className="font-medium">{formatCurrency(selectedRecord.economics.matingCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Costo supervisión:</span>
                      <span className="font-medium">{formatCurrency(selectedRecord.economics.supervisionCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Costo veterinario:</span>
                      <span className="font-medium">{formatCurrency(selectedRecord.economics.veterinaryCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uso de instalaciones:</span>
                      <span className="font-medium">{formatCurrency(selectedRecord.economics.facilityUsage)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-800 font-semibold">Total:</span>
                        <span className="font-bold text-[#519a7c] text-lg">{formatCurrency(selectedRecord.economics.totalCost)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor esperado:</span>
                      <span className="font-bold text-green-600">{formatCurrency(selectedRecord.economics.expectedValue)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información genética */}
              <div className="mt-6 bg-yellow-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Información Genética
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Compatibilidad pedigrí:</span>
                      <span className="font-medium">{selectedRecord.genetics.pedigreeCompatibility}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Diversidad genética:</span>
                      <span className="font-medium">{selectedRecord.genetics.geneticDiversity}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coef. consanguinidad:</span>
                      <span className="font-medium">{selectedRecord.genetics.inbreedingCoefficient}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Objetivo reproductivo:</span>
                    <p className="font-medium text-sm mt-1">{selectedRecord.genetics.breedingObjective}</p>
                  </div>
                </div>
                {selectedRecord.genetics.expectedTraits.length > 0 && (
                  <div className="mt-4">
                    <span className="text-gray-600">Características esperadas:</span>
                    <div className="mt-1">
                      {selectedRecord.genetics.expectedTraits.map((trait, index) => (
                        <span key={index} className="inline-block bg-yellow-200 rounded-full px-2 py-1 text-xs text-yellow-800 mr-1 mb-1">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notas */}
              {selectedRecord.notes && (
                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Notas Adicionales</h3>
                  <p className="text-gray-700">{selectedRecord.notes}</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  };

  // Renderizado principal
  if (isLoading) {
    return (
      <div className={cn(
        "min-h-screen",
        "bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]",
        className
      )}>
        <LoadingSpinner />
      </div>
    );
  }

  const filteredRecords = getFilteredRecords();

  return (
    <div className={cn(
      "min-h-screen",
      // Fondo degradado principal del layout
      "bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a]",
      className
    )}>
      <div className="p-6">
        {/* Header con título y controles principales */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-sm mb-2">
                Registros de Apareamiento
              </h1>
              <p className="text-white/90">
                Gestión completa de apareamientos naturales con seguimiento genético y geolocalización
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCreate}
                className="bg-gradient-to-r from-[#2d6f51] to-[#4e9c75] text-white px-6 py-2 rounded-lg hover:from-[#265a44] hover:to-[#3d7a5c] transition-all duration-200 flex items-center space-x-2"
              >
                <Plus className="w-5 h-5" />
                <span>Registrar Apareamiento</span>
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Barra de búsqueda y filtros */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Barra de búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por animal, supervisor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <select
                value={filters.supervisor}
                onChange={(e) => setFilters(prev => ({ ...prev, supervisor: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="all">Todos los supervisores</option>
                <option value="Carlos Mendoza">Carlos Mendoza</option>
                <option value="Miguel Rodríguez">Miguel Rodríguez</option>
              </select>

              <select
                value={filters.sector}
                onChange={(e) => setFilters(prev => ({ ...prev, sector: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="all">Todos los sectores</option>
                <option value="Norte">Norte</option>
                <option value="Sur">Sur</option>
                <option value="Este">Este</option>
                <option value="Oeste">Oeste</option>
              </select>

              <select
                value={filters.pregnancyResult}
                onChange={(e) => setFilters(prev => ({ ...prev, pregnancyResult: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="all">Todos los resultados</option>
                <option value="positive">Gestantes</option>
                <option value="negative">No gestantes</option>
                <option value="pending">Pendientes</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Estadísticas rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          {[
            { 
              label: 'Total Apareamientos', 
              value: records.length.toString(), 
              icon: Heart, 
              color: 'from-[#519a7c] to-[#4e9c75]' 
            },
            { 
              label: 'Gestaciones Confirmadas', 
              value: records.filter(r => r.followUp.pregnancyCheck?.result).length.toString(), 
              icon: CheckCircle, 
              color: 'from-green-500 to-green-600' 
            },
            { 
              label: 'Tasa de Éxito', 
              value: `${Math.round((records.filter(r => r.followUp.pregnancyCheck?.result).length / records.filter(r => r.followUp.pregnancyCheck).length) * 100) || 0}%`, 
              icon: Clock, 
              color: 'from-blue-500 to-blue-600' 
            },
            { 
              label: 'Valor Promedio', 
              value: formatCurrency(records.reduce((acc, r) => acc + r.economics.expectedValue, 0) / records.length || 0), 
              icon: Beef, 
              color: 'from-yellow-500 to-yellow-600' 
            }
          ].map((stat) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Lista de registros */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
        >
          {filteredRecords.length > 0 ? (
            filteredRecords.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))
          ) : (
            <motion.div
              variants={itemVariants}
              className="col-span-full bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-12 text-center"
            >
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No se encontraron registros
              </h3>
              <p className="text-gray-500">
                No hay registros de apareamiento que coincidan con los filtros aplicados.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Modales */}
        {showCreateModal && <FormModal isEdit={false} />}
        {showEditModal && <FormModal isEdit={true} />}
        {showViewModal && <ViewModal />}
      </div>
    </div>
  );
};

export default MatingRecords;