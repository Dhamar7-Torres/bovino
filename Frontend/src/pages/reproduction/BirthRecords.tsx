import React, { useState, useEffect, useMemo } from "react";
import {
  Baby,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Download,
  Activity,
  FileText,
  X,
  Save,
  MapPin,
  Heart,
  User,
  Scale,
  Crown,
  AlertTriangle,
} from "lucide-react";

// Interfaces optimizadas
interface BirthRecord {
  id: string;
  motherId: string;
  motherName: string;
  motherEarTag: string;
  motherAge: number;
  pregnancyNumber: number;
  gestationDays: number;
  fatherId?: string;
  fatherName?: string;
  fatherEarTag?: string;
  breedingType: "natural" | "artificial_insemination" | "embryo_transfer";
  birthDate: string;
  birthTime: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    paddock?: string;
  };
  laborDetails: {
    duration: number;
    type: "natural" | "assisted" | "cesarean";
    difficulty: "easy" | "moderate" | "difficult";
    assistedBy: {
      name: string;
      role: "veterinarian" | "technician" | "staff";
    };
    complications: string[];
  };
  calf: {
    id: string;
    tempEarTag?: string;
    gender: "male" | "female";
    birthWeight: number;
    healthStatus: "excellent" | "good" | "fair" | "poor";
    firstStanding: boolean;
    firstNursing: boolean;
  };
  motherPostBirth: {
    condition: "excellent" | "good" | "fair" | "poor";
    placentaExpelled: boolean;
    treatmentRequired: boolean;
  };
  economics: {
    totalCost: number;
    estimatedValue: number;
  };
  notes: string;
  status: "active" | "weaned" | "sold" | "deceased";
  outcome: "successful" | "complicated" | "loss";
  createdAt: string;
  updatedAt: string;
}

interface BirthFilters {
  searchTerm: string;
  birthType: string;
  gender: string;
  outcome: string;
  dateRange: {
    start: string;
    end: string;
  };
}

const BirthRecords: React.FC = () => {
  const [records, setRecords] = useState<BirthRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<BirthRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<BirthRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<BirthRecord | null>(null);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [recordToDelete, setRecordToDelete] = useState<BirthRecord | null>(null);
  
  const [filters, setFilters] = useState<BirthFilters>({
    searchTerm: "",
    birthType: "",
    gender: "",
    outcome: "",
    dateRange: { start: "", end: "" },
  });

  const [formData, setFormData] = useState<Partial<BirthRecord>>({});

  const mockRecords: BirthRecord[] = [
    {
      id: "birth-001",
      motherId: "cow-123",
      motherName: "Bella",
      motherEarTag: "MX-001",
      motherAge: 4,
      pregnancyNumber: 3,
      gestationDays: 285,
      fatherId: "bull-001",
      fatherName: "Campeón",
      fatherEarTag: "T-001",
      breedingType: "natural",
      birthDate: "2025-07-15",
      birthTime: "06:30",
      location: {
        lat: 17.989,
        lng: -92.247,
        address: "Rancho San Miguel",
        paddock: "Corral de Partos",
      },
      laborDetails: {
        duration: 45,
        type: "natural",
        difficulty: "easy",
        assistedBy: { name: "Miguel Hernández", role: "staff" },
        complications: [],
      },
      calf: {
        id: "calf-001",
        tempEarTag: "TEMP-001",
        gender: "male",
        birthWeight: 42.5,
        healthStatus: "excellent",
        firstStanding: true,
        firstNursing: true,
      },
      motherPostBirth: {
        condition: "excellent",
        placentaExpelled: true,
        treatmentRequired: false,
      },
      economics: {
        totalCost: 2500,
        estimatedValue: 15000,
      },
      notes: "Nacimiento exitoso sin complicaciones.",
      status: "active",
      outcome: "successful",
      createdAt: "2025-07-15T06:30:00.000Z",
      updatedAt: "2025-07-15T08:00:00.000Z",
    },
    {
      id: "birth-002",
      motherId: "cow-124",
      motherName: "Luna",
      motherEarTag: "MX-002",
      motherAge: 2,
      pregnancyNumber: 1,
      gestationDays: 278,
      breedingType: "artificial_insemination",
      birthDate: "2025-07-12",
      birthTime: "14:20",
      location: {
        lat: 17.995,
        lng: -92.255,
        address: "Potrero Sur",
        paddock: "Potrero 7",
      },
      laborDetails: {
        duration: 110,
        type: "assisted",
        difficulty: "moderate",
        assistedBy: { name: "Dr. García", role: "veterinarian" },
        complications: ["Posición anormal"],
      },
      calf: {
        id: "calf-002",
        tempEarTag: "TEMP-002",
        gender: "female",
        birthWeight: 38.0,
        healthStatus: "good",
        firstStanding: true,
        firstNursing: true,
      },
      motherPostBirth: {
        condition: "good",
        placentaExpelled: true,
        treatmentRequired: true,
      },
      economics: {
        totalCost: 4500,
        estimatedValue: 12000,
      },
      notes: "Primer parto de vaquillona joven. Distocia leve resuelta.",
      status: "active",
      outcome: "complicated",
      createdAt: "2025-07-12T14:20:00.000Z",
      updatedAt: "2025-07-13T09:00:00.000Z",
    },
    {
      id: "birth-003",
      motherId: "cow-125",
      motherName: "Esperanza",
      motherEarTag: "MX-003",
      motherAge: 6,
      pregnancyNumber: 5,
      gestationDays: 290,
      breedingType: "embryo_transfer",
      birthDate: "2025-07-18",
      birthTime: "09:00",
      location: {
        lat: 17.992,
        lng: -92.250,
        address: "Potrero Central",
        paddock: "Potrero 3",
      },
      laborDetails: {
        duration: 180,
        type: "cesarean",
        difficulty: "difficult",
        assistedBy: { name: "Dr. Martínez", role: "veterinarian" },
        complications: ["Becerro grande", "Cirugía"],
      },
      calf: {
        id: "calf-003",
        tempEarTag: "TEMP-003",
        gender: "male",
        birthWeight: 55.0,
        healthStatus: "fair",
        firstStanding: false,
        firstNursing: false,
      },
      motherPostBirth: {
        condition: "fair",
        placentaExpelled: false,
        treatmentRequired: true,
      },
      economics: {
        totalCost: 8000,
        estimatedValue: 18000,
      },
      notes: "Cesárea de emergencia por becerro excesivamente grande. Requiere cuidados especiales.",
      status: "active",
      outcome: "complicated",
      createdAt: "2025-07-18T09:00:00.000Z",
      updatedAt: "2025-07-18T12:00:00.000Z",
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setRecords(mockRecords);
        setFilteredRecords(mockRecords);
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    let filtered = records;

    if (filters.searchTerm) {
      filtered = filtered.filter(record =>
        record.motherName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        record.motherEarTag.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    if (filters.birthType) {
      filtered = filtered.filter(record => record.laborDetails.type === filters.birthType);
    }

    if (filters.gender) {
      filtered = filtered.filter(record => record.calf.gender === filters.gender);
    }

    if (filters.outcome) {
      filtered = filtered.filter(record => record.outcome === filters.outcome);
    }

    if (filters.dateRange.start && filters.dateRange.end) {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.birthDate + 'T12:00:00');
        const startDate = new Date(filters.dateRange.start + 'T12:00:00');
        const endDate = new Date(filters.dateRange.end + 'T12:00:00');
        return recordDate >= startDate && recordDate <= endDate;
      });
    }

    setFilteredRecords(filtered);
  }, [records, filters]);

  const stats = useMemo(() => {
    const total = records.length;
    const males = records.filter(r => r.calf.gender === "male").length;
    const females = records.filter(r => r.calf.gender === "female").length;
    const successful = records.filter(r => r.outcome === "successful").length;
    const averageWeight = records.length > 0 ? 
      (records.reduce((sum, r) => sum + r.calf.birthWeight, 0) / records.length).toFixed(1) : "0";

    return {
      total,
      males,
      females,
      successful,
      averageWeight: `${averageWeight} kg`,
      successRate: total > 0 ? `${((successful / total) * 100).toFixed(1)}%` : "0%",
    };
  }, [records]);

  const resetForm = () => {
    const now = new Date();
    const today = now.toISOString().substr(0, 10);
    const currentTime = now.toTimeString().substr(0, 5);
    
    setFormData({
      breedingType: "natural",
      pregnancyNumber: 1,
      gestationDays: 283,
      birthDate: today,
      birthTime: currentTime,
      laborDetails: {
        duration: 0,
        type: "natural",
        difficulty: "easy",
        assistedBy: { name: "", role: "staff" },
        complications: [],
      },
      calf: {
        id: "",
        gender: "male",
        birthWeight: 0,
        healthStatus: "good",
        firstStanding: false,
        firstNursing: false,
      },
      motherPostBirth: {
        condition: "good",
        placentaExpelled: false,
        treatmentRequired: false,
      },
      economics: {
        totalCost: 0,
        estimatedValue: 0,
      },
      status: "active",
      outcome: "successful",
      location: {
        lat: 17.989,
        lng: -92.247,
        address: "",
      },
    });
  };


  const handleCreate = () => {
    const newRecord: BirthRecord = {
      id: `birth-${Date.now()}`,
      motherId: formData.motherId || `cow-${Date.now()}`,
      motherName: formData.motherName || "",
      motherEarTag: formData.motherEarTag || "",
      motherAge: formData.motherAge || 0,
      pregnancyNumber: formData.pregnancyNumber || 1,
      gestationDays: formData.gestationDays || 283,
      breedingType: formData.breedingType || "natural",
      birthDate: formData.birthDate || new Date().toISOString().substr(0, 10),
      birthTime: formData.birthTime || new Date().toTimeString().substr(0, 5),
      location: formData.location || {
        lat: 17.989,
        lng: -92.247,
        address: "Villahermosa, Tabasco",
      },
      laborDetails: formData.laborDetails || {
        duration: 0,
        type: "natural",
        difficulty: "easy",
        assistedBy: { name: "", role: "staff" },
        complications: [],
      },
      calf: formData.calf || {
        id: `calf-${Date.now()}`,
        gender: "male",
        birthWeight: 0,
        healthStatus: "good",
        firstStanding: false,
        firstNursing: false,
      },
      motherPostBirth: formData.motherPostBirth || {
        condition: "good",
        placentaExpelled: false,
        treatmentRequired: false,
      },
      economics: formData.economics || {
        totalCost: 0,
        estimatedValue: 0,
      },
      notes: formData.notes || "",
      status: formData.status || "active",
      outcome: formData.outcome || "successful",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setRecords(prev => [newRecord, ...prev]);
    setShowForm(false);
    resetForm();
    alert("✅ Registro creado exitosamente");
  };

  const handleUpdate = () => {
    if (!editingRecord) return;

    setRecords(prev => prev.map(record => 
      record.id === editingRecord.id 
        ? { ...record, ...formData, updatedAt: new Date().toISOString() }
        : record
    ));
    setEditingRecord(null);
    setShowForm(false);
    resetForm();
    alert("✅ Registro actualizado exitosamente");
  };

  // FUNCIONES DE ELIMINACIÓN CORREGIDAS
  const initiateDelete = (record: BirthRecord) => {
    console.log("🗑️ Iniciando eliminación para:", record.id);
    setRecordToDelete(record);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (!recordToDelete) {
      console.log("❌ No hay registro para eliminar");
      return;
    }

    console.log("✅ Confirmando eliminación de:", recordToDelete.id);
    
    setRecords(currentRecords => {
      const updatedRecords = currentRecords.filter(r => r.id !== recordToDelete.id);
      console.log("📊 Total antes:", currentRecords.length, "Total después:", updatedRecords.length);
      return updatedRecords;
    });

    if (selectedRecord?.id === recordToDelete.id) {
      setSelectedRecord(null);
    }
    
    if (editingRecord?.id === recordToDelete.id) {
      setEditingRecord(null);
      setShowForm(false);
    }

    setShowDeleteConfirm(false);
    setRecordToDelete(null);
    
    alert(`✅ ${recordToDelete.motherName} eliminado correctamente`);
  };

  const cancelDelete = () => {
    console.log("❌ Eliminación cancelada");
    setShowDeleteConfirm(false);
    setRecordToDelete(null);
  };

  const handleEdit = (record: BirthRecord) => {
    setEditingRecord(record);
    setFormData(record);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditingRecord(null);
    resetForm();
    setShowForm(true);
  };

  const getHealthColor = (health: string) => {
    const colors = {
      excellent: "bg-green-100 text-green-800",
      good: "bg-blue-100 text-blue-800",
      fair: "bg-yellow-100 text-yellow-800",
      poor: "bg-red-100 text-red-800",
    };
    return colors[health as keyof typeof colors] || colors.good;
  };

  const getOutcomeColor = (outcome: string) => {
    const colors = {
      successful: "bg-green-100 text-green-800",
      complicated: "bg-yellow-100 text-yellow-800",
      loss: "bg-red-100 text-red-800",
    };
    return colors[outcome as keyof typeof colors] || colors.successful;
  };

  const getBirthTypeColor = (type: string) => {
    const colors = {
      natural: "bg-green-100 text-green-800",
      assisted: "bg-yellow-100 text-yellow-800",
      cesarean: "bg-red-100 text-red-800",
    };
    return colors[type as keyof typeof colors] || colors.natural;
  };

  const getGenderIcon = (gender: string) => {
    return gender === "male" ? (
      <Crown className="w-4 h-4 text-blue-600" />
    ) : (
      <Heart className="w-4 h-4 text-pink-600" />
    );
  };

  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert("❌ No hay registros para exportar");
      return;
    }

    try {
      const csvData = filteredRecords.map(record => ({
        'ID': record.id,
        'Madre': record.motherName,
        'Arete Madre': record.motherEarTag,
        'Edad Madre': record.motherAge,
        'Gestación #': record.pregnancyNumber,
        'Días Gestación': record.gestationDays,
        'Fecha Nacimiento': formatDate(record.birthDate),
        'Hora Nacimiento': record.birthTime,
        'Tipo Parto': record.laborDetails.type,
        'Dificultad': record.laborDetails.difficulty,
        'Duración (min)': record.laborDetails.duration,
        'Asistido Por': record.laborDetails.assistedBy.name,
        'Género Becerro': record.calf.gender === 'male' ? 'Macho' : 'Hembra',
        'Peso Becerro (kg)': record.calf.birthWeight,
        'Estado Salud': record.calf.healthStatus,
        'Arete Temporal': record.calf.tempEarTag || '',
        'Ubicación': record.location.address,
        'Costo Total': record.economics.totalCost,
        'Valor Estimado': record.economics.estimatedValue,
        'Resultado': record.outcome,
        'Notas': record.notes,
        'Fecha Creación': formatDate(record.createdAt.split('T')[0])
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header as keyof typeof row];
            const stringValue = String(value || '');
            if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          }).join(',')
        )
      ].join('\n');

      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const now = new Date();
      const timestamp = now.toISOString().split('T')[0];
      const filename = `registros_nacimientos_${timestamp}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      alert(`✅ Archivo exportado: ${filename}\n📊 ${filteredRecords.length} registros exportados`);
      
    } catch (error) {
      console.error("❌ Error en exportación:", error);
      alert("❌ Error al exportar los datos");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T12:00:00');
    return date.toLocaleDateString('es-MX');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 border-4 border-[#519a7c] border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600 font-medium">Cargando registros de nacimientos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#519a7c] via-[#f2e9d8] to-[#f4ac3a] p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] rounded-xl flex items-center justify-center">
                <Baby className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Registros de Nacimientos
                </h1>
                <p className="text-gray-600 mt-1">
                  Gestión de nacimientos y seguimiento neonatal bovino
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-xl border-2 transition-all duration-200 flex items-center space-x-2 ${
                  showFilters 
                    ? "bg-[#519a7c] text-white border-[#519a7c]" 
                    : "bg-white text-gray-700 border-gray-300 hover:border-[#519a7c]"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filtros</span>
              </button>

              <button
                type="button"
                onClick={handleNew}
                className="px-6 py-2 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-xl hover:from-[#4e9c75] hover:to-[#519a7c] transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Nacimiento</span>
              </button>
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: "Total", value: stats.total, icon: Activity, color: "text-blue-600" },
              { label: "Machos", value: stats.males, icon: Crown, color: "text-blue-600" },
              { label: "Hembras", value: stats.females, icon: Heart, color: "text-pink-600" },
              { label: "Peso Promedio", value: stats.averageWeight, icon: Scale, color: "text-purple-600" },
            ].map((stat, index) => (
              <div
                key={index}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-white/30 hover:scale-105 transition-transform duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                    placeholder="Nombre de madre..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Parto
                </label>
                <select
                  value={filters.birthType}
                  onChange={(e) => setFilters(prev => ({ ...prev, birthType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="natural">Natural</option>
                  <option value="assisted">Asistido</option>
                  <option value="cesarean">Cesárea</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Género
                </label>
                <select
                  value={filters.gender}
                  onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="male">Macho</option>
                  <option value="female">Hembra</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resultado
                </label>
                <select
                  value={filters.outcome}
                  onChange={(e) => setFilters(prev => ({ ...prev, outcome: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="successful">Exitoso</option>
                  <option value="complicated">Complicado</option>
                  <option value="loss">Pérdida</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setFilters({
                  searchTerm: "",
                  birthType: "",
                  gender: "",
                  outcome: "",
                  dateRange: { start: "", end: "" },
                })}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Limpiar
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(false)}
                className="px-6 py-2 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-lg"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}

        {/* Controles de vista */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">
              Mostrando {filteredRecords.length} de {records.length} nacimientos
            </span>

            <button 
              type="button"
              onClick={handleExport}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:border-[#519a7c] hover:text-[#519a7c] transition-all duration-200 flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Lista de registros */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Header de la tarjeta */}
              <div className="bg-gradient-to-r from-[#519a7c] to-[#4e9c75] p-4 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Baby className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{record.motherName}</h3>
                      <p className="text-white/80 text-sm">Arete: {record.motherEarTag}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getBirthTypeColor(record.laborDetails.type)}`}>
                      {record.laborDetails.type === "natural" && "Natural"}
                      {record.laborDetails.type === "assisted" && "Asistido"}
                      {record.laborDetails.type === "cesarean" && "Cesárea"}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getOutcomeColor(record.outcome)}`}>
                      {record.outcome === "successful" && "Exitoso"}
                      {record.outcome === "complicated" && "Complicado"}
                      {record.outcome === "loss" && "Pérdida"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contenido de la tarjeta */}
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 font-medium">Fecha:</p>
                    <p className="text-gray-900">{formatDate(record.birthDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Hora:</p>
                    <p className="text-gray-900">{record.birthTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Gestación:</p>
                    <p className="text-gray-900">{record.gestationDays} días</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium">Gestación #:</p>
                    <p className="text-gray-900">{record.pregnancyNumber}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    {getGenderIcon(record.calf.gender)}
                    <span className="ml-2">
                      Becerr{record.calf.gender === "male" ? "o" : "a"}
                    </span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-600">Peso:</p>
                      <p className="font-bold text-[#519a7c]">{record.calf.birthWeight} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Salud:</p>
                      <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(record.calf.healthStatus)}`}>
                        {record.calf.healthStatus === "excellent" && "Excelente"}
                        {record.calf.healthStatus === "good" && "Bueno"}
                        {record.calf.healthStatus === "fair" && "Regular"}
                        {record.calf.healthStatus === "poor" && "Malo"}
                      </span>
                    </div>
                    {record.calf.tempEarTag && (
                      <div className="col-span-2">
                        <p className="text-gray-600">Arete:</p>
                        <p className="font-medium">{record.calf.tempEarTag}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3">
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-yellow-600" />
                    Asistencia
                  </h4>
                  <div className="space-y-1 text-sm">
                    <p><span className="text-gray-600">Por:</span> {record.laborDetails.assistedBy.name}</p>
                    <p><span className="text-gray-600">Duración:</span> {record.laborDetails.duration} min</p>
                    <p><span className="text-gray-600">Dificultad:</span> 
                      <span className={`ml-1 font-medium ${
                        record.laborDetails.difficulty === "easy" ? "text-green-600" :
                        record.laborDetails.difficulty === "moderate" ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {record.laborDetails.difficulty === "easy" && "Fácil"}
                        {record.laborDetails.difficulty === "moderate" && "Moderada"}
                        {record.laborDetails.difficulty === "difficult" && "Difícil"}
                      </span>
                    </p>
                  </div>
                </div>

                {record.laborDetails.complications.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-red-600" />
                      Complicaciones ({record.laborDetails.complications.length})
                    </h4>
                    <div className="space-y-1">
                      {record.laborDetails.complications.slice(0, 2).map((comp, idx) => (
                        <p key={idx} className="text-sm text-red-700">• {comp}</p>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{record.location.address}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-bold text-[#519a7c]">
                      ${record.economics.totalCost.toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-600">Costo total</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-green-600">
                      ${record.economics.estimatedValue.toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-600">Valor estimado</p>
                  </div>
                </div>

                {record.notes && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <h4 className="font-medium text-gray-900 mb-1 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-600" />
                      Notas
                    </h4>
                    <p className="text-sm text-gray-700 line-clamp-2">{record.notes}</p>
                  </div>
                )}
              </div>

              {/* Acciones - BOTÓN DE ELIMINAR CORREGIDO */}
              <div className="bg-gray-50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRecord(record)}
                    className="p-2 text-gray-600 hover:text-[#519a7c] hover:bg-white rounded-lg transition-all duration-200"
                    title="Ver detalles"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEdit(record)}
                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white rounded-lg transition-all duration-200"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log("🔥 BOTÓN ELIMINAR PRESIONADO - ID:", record.id);
                      initiateDelete(record);
                    }}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-white rounded-lg transition-all duration-200"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(record.createdAt.split('T')[0])}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN - CORREGIDO */}
        {showDeleteConfirm && recordToDelete && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
                ¿Eliminar Registro?
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Madre:</span> {recordToDelete.motherName}</p>
                  <p><span className="font-medium">Arete:</span> {recordToDelete.motherEarTag}</p>
                  <p><span className="font-medium">Fecha:</span> {formatDate(recordToDelete.birthDate)}</p>
                  <p><span className="font-medium">Becerr{recordToDelete.calf.gender === "male" ? "o" : "a"}:</span> {recordToDelete.calf.birthWeight} kg</p>
                </div>
              </div>
              
              <p className="text-center text-gray-600 mb-6">
                Esta acción no se puede deshacer. Se perderán todos los datos del nacimiento.
              </p>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulario Modal - Simplificado */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingRecord ? "Editar" : "Nuevo"} Nacimiento
                </h2>
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de la madre *
                    </label>
                    <input
                      type="text"
                      value={formData.motherName || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      placeholder="Ej: Bella"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Arete de la madre *
                    </label>
                    <input
                      type="text"
                      value={formData.motherEarTag || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev, motherEarTag: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      placeholder="Ej: MX-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de nacimiento *
                    </label>
                    <input
                      type="date"
                      value={formData.birthDate || new Date().toISOString().substr(0, 10)}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hora de nacimiento *
                    </label>
                    <input
                      type="time"
                      value={formData.birthTime || new Date().toTimeString().substr(0, 5)}
                      onChange={(e) => setFormData(prev => ({ ...prev, birthTime: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Becerro</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Género *
                      </label>
                      <select
                        value={formData.calf?.gender || "male"}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          calf: { ...prev.calf!, gender: e.target.value as "male" | "female" }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                      >
                        <option value="male">Macho</option>
                        <option value="female">Hembra</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Peso al nacer (kg) *
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.calf?.birthWeight || ""}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          calf: { ...prev.calf!, birthWeight: parseFloat(e.target.value) || 0 }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#519a7c] focus:border-transparent"
                        min="0"
                        placeholder="Ej: 42.5"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={editingRecord ? handleUpdate : handleCreate}
                    className="px-6 py-2 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-lg hover:from-[#4e9c75] hover:to-[#519a7c] transition-all duration-200 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{editingRecord ? "Actualizar" : "Guardar"}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de detalles - Simplificado */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Detalles - {selectedRecord.motherName}
                </h2>
                <button 
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información General</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Fecha:</span> {formatDate(selectedRecord.birthDate)}</p>
                      <p><span className="font-medium">Hora:</span> {selectedRecord.birthTime}</p>
                      <p><span className="font-medium">Madre:</span> {selectedRecord.motherName} ({selectedRecord.motherEarTag})</p>
                      <p><span className="font-medium">Edad madre:</span> {selectedRecord.motherAge} años</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Información del Becerro</h3>
                    <div className="space-y-2">
                      <p><span className="font-medium">Género:</span> {selectedRecord.calf.gender === "male" ? "Macho" : "Hembra"}</p>
                      <p><span className="font-medium">Peso:</span> {selectedRecord.calf.birthWeight} kg</p>
                      <p><span className="font-medium">Estado salud:</span> {selectedRecord.calf.healthStatus}</p>
                      {selectedRecord.calf.tempEarTag && (
                        <p><span className="font-medium">Arete temporal:</span> {selectedRecord.calf.tempEarTag}</p>
                      )}
                    </div>
                  </div>
                </div>

                {selectedRecord.notes && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Notas</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedRecord.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedRecord(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRecord(null);
                    handleEdit(selectedRecord);
                  }}
                  className="px-4 py-2 bg-[#519a7c] text-white rounded-lg hover:bg-[#4a8970] flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mensaje cuando no hay registros */}
        {filteredRecords.length === 0 && !isLoading && (
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-12 text-center border border-white/20">
            <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron nacimientos</h3>
            <p className="text-gray-600 mb-6">No hay registros que coincidan con los filtros aplicados.</p>
            <button
              type="button"
              onClick={handleNew}
              className="px-6 py-3 bg-gradient-to-r from-[#519a7c] to-[#4e9c75] text-white rounded-xl hover:from-[#4e9c75] hover:to-[#519a7c] transition-all duration-200 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-5 h-5" />
              <span>Registrar Primer Nacimiento</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BirthRecords;