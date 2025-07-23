import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Filter,
  BarChart3,
  Plus,
  Search,
  X,
  Edit,
  Trash2,
} from "lucide-react";

// Interfaces para tipos de datos
interface HealthReport {
  id: string;
  title: string;
  type:
    | "vaccination"
    | "disease"
    | "treatment"
    | "reproductive"
    | "general"
    | "financial";
  description: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
  generatedBy: string;
  status: "generating" | "ready" | "error";
  format: "pdf" | "excel" | "csv";
  size: string;
  downloadUrl?: string;
  stats: {
    totalAnimals: number;
    dataPoints: number;
    recommendations: number;
  };
}

interface NewReportForm {
  title: string;
  type: string;
  description: string;
  dateStart: string;
  dateEnd: string;
  format: string;
}

// Componentes reutilizables
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-600 mt-1">{children}</p>
);

const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Button = ({
  children,
  onClick,
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  type = "button"
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "success" | "danger";
  size?: "sm" | "default";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = {
    default: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    outline:
      "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-blue-500",
    success: "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };
  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    default: "px-4 py-2 text-sm",
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

const Badge = ({ children, variant, className = "" }: {
  children: React.ReactNode;
  variant: string;
  className?: string;
}) => {
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "generating":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "vaccination":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "disease":
        return "bg-red-100 text-red-800 border-red-200";
      case "treatment":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "reproductive":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "general":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "financial":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getVariantClasses(
        variant
      )} ${className}`}
    >
      {children}
    </span>
  );
};

// Modal para Editar Reporte
const EditReportModal = ({
  isOpen,
  onClose,
  onSubmit,
  report,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: NewReportForm) => void;
  report: HealthReport | null;
}) => {
  const [formData, setFormData] = useState<NewReportForm>({
    title: "",
    type: "vaccination",
    description: "",
    dateStart: "",
    dateEnd: "",
    format: "pdf",
  });

  useEffect(() => {
    if (report) {
      setFormData({
        title: report.title,
        type: report.type,
        description: report.description,
        dateStart: report.dateRange.start.toISOString().split('T')[0],
        dateEnd: report.dateRange.end.toISOString().split('T')[0],
        format: report.format,
      });
    }
  }, [report]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen || !report) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Editar Reporte</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="vaccination">Vacunación</option>
              <option value="disease">Enfermedades</option>
              <option value="treatment">Tratamientos</option>
              <option value="reproductive">Reproductiva</option>
              <option value="financial">Financieros</option>
              <option value="general">Generales</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.dateStart}
                onChange={(e) => setFormData({...formData, dateStart: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.dateEnd}
                onChange={(e) => setFormData({...formData, dateEnd: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formato
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.format}
              onChange={(e) => setFormData({...formData, format: e.target.value})}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Actualizar Reporte
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal de Confirmación para Eliminar
const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  reportTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  reportTitle: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Eliminar Reporte</h2>
            <p className="text-sm text-gray-600">Esta acción no se puede deshacer</p>
          </div>
        </div>
        
        <p className="text-gray-700 mb-6">
          ¿Estás seguro de que quieres eliminar el reporte{" "}
          <span className="font-medium">"{reportTitle}"</span>?
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  );
};
const NewReportModal = ({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: NewReportForm) => void;
}) => {
  const [formData, setFormData] = useState<NewReportForm>({
    title: "",
    type: "vaccination",
    description: "",
    dateStart: "",
    dateEnd: "",
    format: "pdf",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      title: "",
      type: "vaccination",
      description: "",
      dateStart: "",
      dateEnd: "",
      format: "pdf",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Nuevo Reporte</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="vaccination">Vacunación</option>
              <option value="disease">Enfermedades</option>
              <option value="treatment">Tratamientos</option>
              <option value="reproductive">Reproductiva</option>
              <option value="financial">Financieros</option>
              <option value="general">Generales</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.dateStart}
                onChange={(e) => setFormData({...formData, dateStart: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={formData.dateEnd}
                onChange={(e) => setFormData({...formData, dateEnd: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Formato
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={formData.format}
              onChange={(e) => setFormData({...formData, format: e.target.value})}
            >
              <option value="pdf">PDF</option>
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Generar Reporte
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente de Gráfico Interactivo
const InteractiveChart = ({
  data,
  title,
  onTypeClick,
  selectedType,
}: {
  data: any[];
  title: string;
  onTypeClick: (type: string) => void;
  selectedType: string;
}) => {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="h-64 bg-gray-50 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-700 mb-4">{title}</h4>
      
      <div className="flex items-end gap-3 h-32">
        {data.map((item, index) => {
          const height = (item.value / maxValue) * 100;
          const isSelected = selectedType === item.type;
          
          return (
            <div 
              key={index} 
              className="flex flex-col items-center gap-2 cursor-pointer transition-all hover:opacity-80"
              onClick={() => onTypeClick(item.type)}
            >
              <div
                className={`${
                  isSelected ? 'bg-blue-700' : 'bg-blue-500'
                } rounded-t min-w-8 transition-colors`}
                style={{ height: `${height}%` }}
              />
              <span className={`text-xs text-center max-w-16 truncate ${
                isSelected ? 'text-blue-700 font-medium' : 'text-gray-600'
              }`}>
                {item.label}
              </span>
              <span className="text-xs font-medium text-gray-800">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const HealthReports = () => {
  // Estados del componente
  const [reports, setReports] = useState<HealthReport[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("30");
  const [isNewReportModalOpen, setIsNewReportModalOpen] = useState(false);
  const [isEditReportModalOpen, setIsEditReportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<HealthReport | null>(null);
  const [deletingReport, setDeletingReport] = useState<HealthReport | null>(null);

  // Simulación de datos
  useEffect(() => {
    const loadData = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Datos de ejemplo para reportes
      const mockReports: HealthReport[] = [
        {
          id: "1",
          title: "Reporte Mensual de Vacunaciones",
          type: "vaccination",
          description:
            "Análisis completo de todas las vacunaciones realizadas en el mes",
          dateRange: {
            start: new Date("2025-06-01"),
            end: new Date("2025-06-30"),
          },
          generatedAt: new Date("2025-07-01"),
          generatedBy: "Dr. García",
          status: "ready",
          format: "pdf",
          size: "2.4 MB",
          downloadUrl: "#",
          stats: {
            totalAnimals: 156,
            dataPoints: 324,
            recommendations: 8,
          },
        },
        {
          id: "2",
          title: "Análisis de Enfermedades Q2 2025",
          type: "disease",
          description:
            "Reporte trimestral de incidencia y tratamiento de enfermedades",
          dateRange: {
            start: new Date("2025-04-01"),
            end: new Date("2025-06-30"),
          },
          generatedAt: new Date("2025-07-05"),
          generatedBy: "Dr. Martínez",
          status: "ready",
          format: "excel",
          size: "5.1 MB",
          downloadUrl: "#",
          stats: {
            totalAnimals: 156,
            dataPoints: 89,
            recommendations: 12,
          },
        },
        {
          id: "3",
          title: "Reporte de Costos de Tratamiento",
          type: "financial",
          description:
            "Análisis financiero de gastos en medicamentos y tratamientos",
          dateRange: {
            start: new Date("2025-01-01"),
            end: new Date("2025-06-30"),
          },
          generatedAt: new Date("2025-07-10"),
          generatedBy: "Admin",
          status: "generating",
          format: "pdf",
          size: "---",
          stats: {
            totalAnimals: 156,
            dataPoints: 445,
            recommendations: 15,
          },
        },
        {
          id: "4",
          title: "Estadísticas de Salud Reproductiva",
          type: "reproductive",
          description: "Análisis de fertilidad, gestaciones y partos",
          dateRange: {
            start: new Date("2025-05-01"),
            end: new Date("2025-07-12"),
          },
          generatedAt: new Date("2025-07-12"),
          generatedBy: "Dr. López",
          status: "ready",
          format: "csv",
          size: "1.8 MB",
          downloadUrl: "#",
          stats: {
            totalAnimals: 89,
            dataPoints: 156,
            recommendations: 6,
          },
        },
      ];

      setReports(mockReports);
    };

    loadData();
  }, []);

  // Filtrar reportes
  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || report.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || report.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Datos para gráficos
  const chartData = [
    { label: "Vacunación", value: 8, type: "vaccination" },
    { label: "Enfermedades", value: 6, type: "disease" },
    { label: "Reproducción", value: 4, type: "reproductive" },
    { label: "Financieros", value: 3, type: "financial" },
    { label: "Generales", value: 3, type: "general" },
  ];

  // Funciones de manejo
  const handleNewReport = (formData: NewReportForm) => {
    const newReport: HealthReport = {
      id: Date.now().toString(),
      title: formData.title,
      type: formData.type as any,
      description: formData.description,
      dateRange: {
        start: new Date(formData.dateStart),
        end: new Date(formData.dateEnd),
      },
      generatedAt: new Date(),
      generatedBy: "Usuario Actual",
      status: "generating",
      format: formData.format as any,
      size: "---",
      stats: {
        totalAnimals: 0,
        dataPoints: 0,
        recommendations: 0,
      },
    };

    setReports([newReport, ...reports]);

    // Simular generación del reporte
    setTimeout(() => {
      setReports(prevReports => 
        prevReports.map(report => 
          report.id === newReport.id 
            ? { ...report, status: "ready" as const, size: "1.2 MB" }
            : report
        )
      );
    }, 3000);
  };

  const handleEditReport = (formData: NewReportForm) => {
    if (!editingReport) return;

    const updatedReport: HealthReport = {
      ...editingReport,
      title: formData.title,
      type: formData.type as any,
      description: formData.description,
      dateRange: {
        start: new Date(formData.dateStart),
        end: new Date(formData.dateEnd),
      },
      format: formData.format as any,
      status: "generating",
    };

    setReports(prevReports =>
      prevReports.map(report =>
        report.id === editingReport.id ? updatedReport : report
      )
    );

    // Simular regeneración del reporte
    setTimeout(() => {
      setReports(prevReports =>
        prevReports.map(report =>
          report.id === editingReport.id
            ? { ...report, status: "ready" as const, size: "1.3 MB", generatedAt: new Date() }
            : report
        )
      );
    }, 2000);

    setEditingReport(null);
  };

  const handleDeleteReport = () => {
    if (!deletingReport) return;

    setReports(prevReports =>
      prevReports.filter(report => report.id !== deletingReport.id)
    );

    setDeletingReport(null);
    setIsDeleteModalOpen(false);
  };

  const openEditModal = (report: HealthReport) => {
    setEditingReport(report);
    setIsEditReportModalOpen(true);
  };

  const openDeleteModal = (report: HealthReport) => {
    setDeletingReport(report);
    setIsDeleteModalOpen(true);
  };

  const handleChartTypeClick = (type: string) => {
    setSelectedType(type);
  };

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
              <h1 className="text-3xl font-bold text-gray-900">
                Reportes de Salud
              </h1>
              <p className="text-gray-600 mt-1">
                Generación y análisis de reportes del ganado
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                size="sm"
                onClick={() => setIsNewReportModalOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Reporte
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Gráfico de Análisis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200 mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Reportes por Tipo
                </CardTitle>
                <CardDescription>
                  Haz clic en una barra para filtrar reportes por tipo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <InteractiveChart
                  data={chartData}
                  title=""
                  onTypeClick={handleChartTypeClick}
                  selectedType={selectedType}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Panel de Filtros */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buscar
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Título, descripción..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Tipo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                  >
                    <option value="all">Todos los tipos</option>
                    <option value="vaccination">Vacunación</option>
                    <option value="disease">Enfermedades</option>
                    <option value="treatment">Tratamientos</option>
                    <option value="reproductive">Reproductiva</option>
                    <option value="financial">Financieros</option>
                    <option value="general">Generales</option>
                  </select>
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                  >
                    <option value="all">Todos los estados</option>
                    <option value="ready">Listo</option>
                    <option value="generating">Generando</option>
                    <option value="error">Error</option>
                  </select>
                </div>

                {/* Rango de fechas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Período
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={selectedDateRange}
                    onChange={(e) => setSelectedDateRange(e.target.value)}
                  >
                    <option value="7">Últimos 7 días</option>
                    <option value="30">Últimos 30 días</option>
                    <option value="90">Últimos 3 meses</option>
                    <option value="365">Último año</option>
                  </select>
                </div>

                {selectedType !== "all" && (
                  <div className="pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setSelectedType("all")}
                      className="w-full"
                    >
                      Limpiar filtro de tipo
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Reportes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-12"
          >
            <Card className="bg-white/80 backdrop-blur-md border-gray-200">
              <CardHeader>
                <CardTitle>
                  Reportes Generados ({filteredReports.length})
                </CardTitle>
                <CardDescription>
                  Lista de todos los reportes disponibles
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <motion.div
                      key={report.id}
                      whileHover={{ scale: 1.01 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">
                              {report.title}
                            </h4>
                            <Badge variant={report.type}>
                              {report.type === "vaccination"
                                ? "Vacunación"
                                : report.type === "disease"
                                ? "Enfermedades"
                                : report.type === "treatment"
                                ? "Tratamientos"
                                : report.type === "reproductive"
                                ? "Reproductiva"
                                : report.type === "financial"
                                ? "Financiero"
                                : "General"}
                            </Badge>
                            <Badge variant={report.status}>
                              {report.status === "ready"
                                ? "Listo"
                                : report.status === "generating"
                                ? "Generando..."
                                : "Error"}
                            </Badge>
                          </div>

                          <p className="text-gray-600 mb-4">
                            {report.description}
                          </p>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Período:</p>
                              <p className="font-medium">
                                {report.dateRange.start.toLocaleDateString()} -{" "}
                                {report.dateRange.end.toLocaleDateString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Generado por:</p>
                              <p className="font-medium">
                                {report.generatedBy}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Formato:</p>
                              <p className="font-medium uppercase">
                                {report.format}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Tamaño:</p>
                              <p className="font-medium">{report.size}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6 mt-4 text-sm text-gray-600">
                            <span>{report.stats.totalAnimals} animales</span>
                            <span>
                              {report.stats.dataPoints} puntos de datos
                            </span>
                            <span>
                              {report.stats.recommendations} recomendaciones
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 ml-4">
                          {report.status === "ready" && (
                            <>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openEditModal(report)}
                                className="hover:bg-blue-50 hover:border-blue-300"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => openDeleteModal(report)}
                                className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
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

      {/* Modal para Nuevo Reporte */}
      <NewReportModal
        isOpen={isNewReportModalOpen}
        onClose={() => setIsNewReportModalOpen(false)}
        onSubmit={handleNewReport}
      />

      {/* Modal para Editar Reporte */}
      <EditReportModal
        isOpen={isEditReportModalOpen}
        onClose={() => {
          setIsEditReportModalOpen(false);
          setEditingReport(null);
        }}
        onSubmit={handleEditReport}
        report={editingReport}
      />

      {/* Modal de Confirmación para Eliminar */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingReport(null);
        }}
        onConfirm={handleDeleteReport}
        reportTitle={deletingReport?.title || ""}
      />
    </div>
  );
};

export default HealthReports;