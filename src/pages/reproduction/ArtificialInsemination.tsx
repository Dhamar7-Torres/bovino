import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Calendar, MapPin, Beef, User, Syringe, Clock, CheckCircle, AlertCircle, Plus, Search, Edit, Trash2, Eye, X } from 'lucide-react';

// Función utility para clases CSS
const cn = (...classes: (string | undefined)[]) => {
  return classes.filter(Boolean).join(' ');
};

// Interfaces específicas para el CRUD de Inseminación Artificial
interface ArtificialInseminationProps {
  className?: string;
}

interface InseminationRecord {
  id: string;
  // Información del animal
  animalId: string;
  animalTag: string;
  animalName: string;
  animalBreed: string;
  
  // Información del procedimiento
  inseminationDate: Date;
  inseminationTime: string;
  
  // Ubicación donde se realizó
  location: {
    lat: number;
    lng: number;
    address: string;
    sector: string;
    potrero: string;
  };
  
  // Material genético utilizado
  semenInfo: {
    bullName: string;
    bullId: string;
    bullBreed: string;
    semenBatch: string;
    semenDate: Date;
    motility: number;
    concentration: number;
    dosesUsed: number;
  };
  
  // Personal responsable
  technician: {
    name: string;
    certification: string;
    experience: number;
  };
  
  veterinarian?: {
    name: string;
    license: string;
  };
  
  // Condiciones del procedimiento
  conditions: {
    animalCondition: string;
    estrusStatus: string;
    temperature: number;
    weather: string;
    facility: string;
  };
  
  // Resultados y seguimiento
  results: {
    success: boolean;
    complications?: string[];
    pregnancyCheck?: {
      date: Date;
      result: boolean;
      method: string;
    };
  };
  
  // Costos
  cost: {
    semenCost: number;
    serviceCost: number;
    additionalCosts: number;
    total: number;
  };
  
  // Notas adicionales
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

interface FilterOptions {
  dateRange: string;
  technician: string;
  bull: string;
  sector: string;
  pregnancyResult: string;
}

// Componente principal del CRUD de Inseminación Artificial
export const ArtificialInsemination: React.FC<ArtificialInseminationProps> = ({ 
  className 
}) => {
  // Estados del componente
  const [records, setRecords] = useState<InseminationRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<InseminationRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'month',
    technician: 'all',
    bull: 'all',
    sector: 'all',
    pregnancyResult: 'all'
  });

  // Datos de ejemplo para registros de inseminación artificial
  const mockRecords: InseminationRecord[] = [
    {
      id: 'IA-001',
      animalId: 'COW-156',
      animalTag: 'TAG-0156',
      animalName: 'Esperanza',
      animalBreed: 'Holstein',
      inseminationDate: new Date('2025-07-15'),
      inseminationTime: '08:30',
      location: {
        lat: 17.0732,
        lng: -93.1451,
        address: 'Potrero San José, Corral A',
        sector: 'Norte',
        potrero: 'San José'
      },
      semenInfo: {
        bullName: 'Elite Champion 2024',
        bullId: 'BULL-001',
        bullBreed: 'Holstein',
        semenBatch: 'ELT-2024-067',
        semenDate: new Date('2025-06-10'),
        motility: 85,
        concentration: 150,
        dosesUsed: 1
      },
      technician: {
        name: 'Carlos Ruiz',
        certification: 'Técnico Certificado IA Nivel 3',
        experience: 8
      },
      veterinarian: {
        name: 'Dr. María González',
        license: 'VET-2024-001'
      },
      conditions: {
        animalCondition: 'Excelente',
        estrusStatus: 'Celo óptimo',
        temperature: 22,
        weather: 'Despejado',
        facility: 'Corral de manejo climatizado'
      },
      results: {
        success: true,
        complications: [],
        pregnancyCheck: {
          date: new Date('2025-08-12'),
          result: true,
          method: 'Ultrasonido'
        }
      },
      cost: {
        semenCost: 250,
        serviceCost: 150,
        additionalCosts: 50,
        total: 450
      },
      notes: 'Inseminación exitosa, animal presentaba signos de celo óptimos. Se realizó seguimiento post-IA sin complicaciones.',
      createdAt: new Date('2025-07-15'),
      updatedAt: new Date('2025-08-12')
    },
    {
      id: 'IA-002',
      animalId: 'COW-089',
      animalTag: 'TAG-0089',
      animalName: 'Marisol',
      animalBreed: 'Angus',
      inseminationDate: new Date('2025-07-12'),
      inseminationTime: '14:45',
      location: {
        lat: 17.0845,
        lng: -93.1523,
        address: 'Potrero Las Flores, Corral B',
        sector: 'Sur',
        potrero: 'Las Flores'
      },
      semenInfo: {
        bullName: 'Black Angus Premium',
        bullId: 'BULL-002',
        bullBreed: 'Angus',
        semenBatch: 'ANG-2024-089',
        semenDate: new Date('2025-05-20'),
        motility: 82,
        concentration: 140,
        dosesUsed: 1
      },
      technician: {
        name: 'Juan Pérez',
        certification: 'Especialista en IA',
        experience: 12
      },
      conditions: {
        animalCondition: 'Buena',
        estrusStatus: 'Celo moderado',
        temperature: 24,
        weather: 'Parcialmente nublado',
        facility: 'Corral principal'
      },
      results: {
        success: true,
        complications: [],
        pregnancyCheck: {
          date: new Date('2025-08-09'),
          result: false,
          method: 'Palpación rectal'
        }
      },
      cost: {
        semenCost: 300,
        serviceCost: 150,
        additionalCosts: 25,
        total: 475
      },
      notes: 'Procedimiento realizado correctamente. Animal no resultó gestante en primera verificación.',
      createdAt: new Date('2025-07-12'),
      updatedAt: new Date('2025-08-09')
    },
    {
      id: 'IA-003',
      animalId: 'COW-203',
      animalTag: 'TAG-0203',
      animalName: 'Paloma',
      animalBreed: 'Charolais',
      inseminationDate: new Date('2025-07-10'),
      inseminationTime: '09:15',
      location: {
        lat: 17.0698,
        lng: -93.1389,
        address: 'Potrero El Roble, Corral C',
        sector: 'Este',
        potrero: 'El Roble'
      },
      semenInfo: {
        bullName: 'Charolais Champion',
        bullId: 'BULL-003',
        bullBreed: 'Charolais',
        semenBatch: 'CHA-2024-045',
        semenDate: new Date('2025-04-15'),
        motility: 88,
        concentration: 160,
        dosesUsed: 1
      },
      technician: {
        name: 'Carlos Ruiz',
        certification: 'Técnico Certificado IA Nivel 3',
        experience: 8
      },
      conditions: {
        animalCondition: 'Regular',
        estrusStatus: 'Celo tardío',
        temperature: 20,
        weather: 'Lluvia ligera',
        facility: 'Corral de cuarentena'
      },
      results: {
        success: true,
        complications: ['Dificultad menor en manipulación'],
        pregnancyCheck: {
          date: new Date('2025-08-07'),
          result: true,
          method: 'Ultrasonido'
        }
      },
      cost: {
        semenCost: 280,
        serviceCost: 150,
        additionalCosts: 75,
        total: 505
      },
      notes: 'Animal presentaba resistencia inicial. Se requirió manejo adicional pero el procedimiento fue exitoso.',
      createdAt: new Date('2025-07-10'),
      updatedAt: new Date('2025-08-07')
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

  // Funciones CRUD simplificadas
  const handleCreate = () => {
    // TODO: Implementar modal de creación
    console.log('Crear nuevo registro');
  };

  const handleEdit = (record: InseminationRecord) => {
    // TODO: Implementar modal de edición
    console.log('Editar registro:', record.id);
  };

  const handleView = (record: InseminationRecord) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  const handleDelete = (recordId: string) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este registro de inseminación?')) {
      setRecords(records.filter(record => record.id !== recordId));
    }
  };

  // Función para filtrar registros
  const getFilteredRecords = () => {
    return records.filter(record => {
      const matchesSearch = record.animalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.animalTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.semenInfo.bullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           record.technician.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesTechnician = filters.technician === 'all' || record.technician.name === filters.technician;
      const matchesBull = filters.bull === 'all' || record.semenInfo.bullName === filters.bull;
      const matchesSector = filters.sector === 'all' || record.location.sector === filters.sector;
      
      let matchesPregnancy = true;
      if (filters.pregnancyResult !== 'all') {
        if (record.results.pregnancyCheck) {
          matchesPregnancy = filters.pregnancyResult === 'positive' ? 
            record.results.pregnancyCheck.result : 
            !record.results.pregnancyCheck.result;
        } else {
          matchesPregnancy = filters.pregnancyResult === 'pending';
        }
      }
      
      return matchesSearch && matchesTechnician && matchesBull && matchesSector && matchesPregnancy;
    });
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
  const RecordCard: React.FC<{ record: InseminationRecord }> = ({ record }) => {
    const pregnancyStatus = record.results.pregnancyCheck ? 
      (record.results.pregnancyCheck.result ? 'Gestante' : 'No gestante') : 'Pendiente';
    
    const pregnancyColor = record.results.pregnancyCheck ? 
      (record.results.pregnancyCheck.result ? 'text-green-600' : 'text-red-600') : 'text-yellow-600';

    return (
      <motion.div
        variants={itemVariants}
        className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-lg">
              <Syringe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{record.animalName}</h3>
              <p className="text-sm text-gray-600">{record.animalTag} • {record.animalBreed}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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
              {record.inseminationDate.toLocaleDateString('es-MX')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-[#519a7c]" />
            <span className="text-sm text-gray-600">{record.inseminationTime}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-[#519a7c]" />
            <span className="text-sm text-gray-600">{record.location.sector}</span>
          </div>
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-[#519a7c]" />
            <span className="text-sm text-gray-600">{record.technician.name}</span>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Toro:</span>
            <span className="text-sm font-medium text-gray-800">{record.semenInfo.bullName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Lote de semen:</span>
            <span className="text-sm font-medium text-gray-800">{record.semenInfo.semenBatch}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Estado gestación:</span>
            <span className={`text-sm font-medium ${pregnancyColor}`}>{pregnancyStatus}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Costo total:</span>
            <span className="text-sm font-bold text-[#519a7c]">{formatCurrency(record.cost.total)}</span>
          </div>
        </div>
      </motion.div>
    );
  };

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
            className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {/* Header del modal */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-lg">
                    <Syringe className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      Registro de Inseminación Artificial
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Información del animal */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Beef className="w-5 h-5 mr-2 text-[#519a7c]" />
                    Información del Animal
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre:</span>
                      <span className="font-medium">{selectedRecord.animalName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Etiqueta:</span>
                      <span className="font-medium">{selectedRecord.animalTag}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Raza:</span>
                      <span className="font-medium">{selectedRecord.animalBreed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID Sistema:</span>
                      <span className="font-medium">{selectedRecord.animalId}</span>
                    </div>
                  </div>
                </div>

                {/* Información del procedimiento */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-[#519a7c]" />
                    Detalles del Procedimiento
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fecha:</span>
                      <span className="font-medium">{selectedRecord.inseminationDate.toLocaleDateString('es-MX')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hora:</span>
                      <span className="font-medium">{selectedRecord.inseminationTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Condición animal:</span>
                      <span className="font-medium">{selectedRecord.conditions.animalCondition}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estado estro:</span>
                      <span className="font-medium">{selectedRecord.conditions.estrusStatus}</span>
                    </div>
                  </div>
                </div>

                {/* Información de ubicación */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 mr-2 text-[#519a7c]" />
                    Ubicación
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sector:</span>
                      <span className="font-medium">{selectedRecord.location.sector}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Potrero:</span>
                      <span className="font-medium">{selectedRecord.location.potrero}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dirección:</span>
                      <span className="font-medium">{selectedRecord.location.address}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Coordenadas:</span>
                      <span className="font-medium">
                        {selectedRecord.location.lat.toFixed(4)}, {selectedRecord.location.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Información del material genético */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <Syringe className="w-5 h-5 mr-2 text-[#519a7c]" />
                    Material Genético
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Toro:</span>
                      <span className="font-medium">{selectedRecord.semenInfo.bullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Raza:</span>
                      <span className="font-medium">{selectedRecord.semenInfo.bullBreed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lote:</span>
                      <span className="font-medium">{selectedRecord.semenInfo.semenBatch}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Motilidad:</span>
                      <span className="font-medium">{selectedRecord.semenInfo.motility}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Concentración:</span>
                      <span className="font-medium">{selectedRecord.semenInfo.concentration} M/ml</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultados y costos */}
              <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resultados */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-[#519a7c]" />
                    Resultados
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Procedimiento exitoso:</span>
                      <span className={`font-medium ${selectedRecord.results.success ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedRecord.results.success ? 'Sí' : 'No'}
                      </span>
                    </div>
                    {selectedRecord.results.pregnancyCheck && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Chequeo gestación:</span>
                          <span className="font-medium">
                            {selectedRecord.results.pregnancyCheck.date.toLocaleDateString('es-MX')}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Resultado:</span>
                          <span className={`font-medium ${selectedRecord.results.pregnancyCheck.result ? 'text-green-600' : 'text-red-600'}`}>
                            {selectedRecord.results.pregnancyCheck.result ? 'Gestante' : 'No gestante'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Método:</span>
                          <span className="font-medium">{selectedRecord.results.pregnancyCheck.method}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Costos */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">
                    Análisis de Costos
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Costo del semen:</span>
                      <span className="font-medium">{formatCurrency(selectedRecord.cost.semenCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Costo del servicio:</span>
                      <span className="font-medium">{formatCurrency(selectedRecord.cost.serviceCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Costos adicionales:</span>
                      <span className="font-medium">{formatCurrency(selectedRecord.cost.additionalCosts)}</span>
                    </div>
                    <div className="border-t pt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-800 font-semibold">Total:</span>
                        <span className="font-bold text-[#519a7c] text-lg">{formatCurrency(selectedRecord.cost.total)}</span>
                      </div>
                    </div>
                  </div>
                </div>
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
                Registros de Inseminación Artificial
              </h1>
              <p className="text-white/90">
                Historial completo de inseminaciones realizadas con geolocalización y seguimiento
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
                <span>Registrar Inseminación</span>
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
                placeholder="Buscar por animal, toro, técnico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              />
            </div>

            {/* Filtros */}
            <div className="flex items-center space-x-4">
              <select
                value={filters.technician}
                onChange={(e) => setFilters(prev => ({ ...prev, technician: e.target.value }))}
                className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
              >
                <option value="all">Todos los técnicos</option>
                <option value="Carlos Ruiz">Carlos Ruiz</option>
                <option value="Juan Pérez">Juan Pérez</option>
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
              label: 'Total Registros', 
              value: records.length.toString(), 
              icon: Syringe, 
              color: 'from-[#519a7c] to-[#4e9c75]' 
            },
            { 
              label: 'Gestaciones Confirmadas', 
              value: records.filter(r => r.results.pregnancyCheck?.result).length.toString(), 
              icon: CheckCircle, 
              color: 'from-green-500 to-green-600' 
            },
            { 
              label: 'Tasa de Éxito', 
              value: `${Math.round((records.filter(r => r.results.pregnancyCheck?.result).length / records.filter(r => r.results.pregnancyCheck).length) * 100) || 0}%`, 
              icon: Clock, 
              color: 'from-blue-500 to-blue-600' 
            },
            { 
              label: 'Costo Promedio', 
              value: formatCurrency(records.reduce((acc, r) => acc + r.cost.total, 0) / records.length || 0), 
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
                No hay registros de inseminación que coincidan con los filtros aplicados.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Modal para ver detalles */}
        {showViewModal && <ViewModal />}
      </div>
    </div>
  );
};

export default ArtificialInsemination;